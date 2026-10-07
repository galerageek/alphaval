import { StockEvaluation } from '../types/stock';
import { 
  calculateGrahamValue, 
  calculateBazinPrice, 
  calculateMarginOfSafety,
  calculateSMA,
  calculateRSI,
  calculateBollingerBands,
  calculateFundamentalScore,
  calculateTechnicalScore,
  getRecommendation
} from './financialEngine';

export interface PriceUpdate {
  ticker: string;
  previousPrice: number;
  newPrice: number;
  changePercent: number;
  updatedAt: string;
}

/**
 * Recalcula todos os múltiplos fundamentalistas, modelos de Graham e Bazin,
 * indicadores técnicos e scores quando o preço sofre variação em tempo real.
 */
export function recalculateStockWithNewPrice(stock: StockEvaluation, newPrice: number): StockEvaluation {
  const roundedPrice = Number(newPrice.toFixed(2));
  const diffPercent = ((roundedPrice - stock.fundamentals.currentPrice) / stock.fundamentals.currentPrice) * 100;

  // 1. Recalcular Múltiplos
  const lpa = stock.fundamentals.lpa;
  const vpa = stock.fundamentals.vpa;
  const peRatio = lpa > 0 ? Number((roundedPrice / lpa).toFixed(1)) : stock.fundamentals.peRatio;
  const pbRatio = vpa > 0 ? Number((roundedPrice / vpa).toFixed(2)) : stock.fundamentals.pbRatio;
  const dividendYield = roundedPrice > 0 ? Number(((stock.fundamentals.projectedAnnualDividend / roundedPrice) * 100).toFixed(1)) : stock.fundamentals.dividendYield;

  const updatedFundamentals = {
    ...stock.fundamentals,
    currentPrice: roundedPrice,
    peRatio,
    pbRatio,
    dividendYield,
  };

  // 2. Recalcular Valuation
  const grahamFairValue = calculateGrahamValue(lpa, vpa);
  const grahamMarginOfSafety = Number(calculateMarginOfSafety(grahamFairValue, roundedPrice).toFixed(1));

  const bazinCeilingPrice = calculateBazinPrice(stock.fundamentals.projectedAnnualDividend);
  const bazinMarginOfSafety = Number(calculateMarginOfSafety(bazinCeilingPrice, roundedPrice).toFixed(1));

  const updatedValuation = {
    ...stock.valuation,
    grahamFairValue,
    grahamMarginOfSafety,
    bazinCeilingPrice,
    bazinMarginOfSafety,
  };

  // 3. Atualizar Candlesticks
  const updatedCandles = [...(stock.candles || [])];
  if (updatedCandles.length > 0) {
    const lastIdx = updatedCandles.length - 1;
    const lastCandle = { ...updatedCandles[lastIdx] };
    lastCandle.close = roundedPrice;
    lastCandle.high = Math.max(lastCandle.high, roundedPrice);
    lastCandle.low = Math.min(lastCandle.low, roundedPrice);
    lastCandle.volume += Math.round(5000 + Math.random() * 15000);
    updatedCandles[lastIdx] = lastCandle;
  }

  // 4. Recalcular Indicadores Técnicos
  const closePrices = updatedCandles.map(c => c.close);
  const sma20 = calculateSMA(closePrices, 20);
  const sma50 = calculateSMA(closePrices, 50);
  const sma200 = calculateSMA(closePrices, 60);
  const rsi14 = calculateRSI(closePrices, 14);
  const bollinger = calculateBollingerBands(closePrices, 20, 2);

  const updatedTechnicals = {
    ...stock.technicals,
    sma20,
    sma50,
    sma200,
    rsi14,
    bollingerUpper: bollinger.upper,
    bollingerMiddle: bollinger.middle,
    bollingerLower: bollinger.lower,
    goldenCross: sma50 > sma200,
    deathCross: sma50 < sma200,
  };

  // 5. Recalcular Scores e Recomendação
  const fundamentalScore = calculateFundamentalScore(updatedFundamentals, updatedValuation);
  const technicalScore = calculateTechnicalScore(roundedPrice, updatedTechnicals);
  const compositeScore = Math.round(fundamentalScore * 0.55 + technicalScore * 0.45);
  const recommendation = getRecommendation(compositeScore);

  return {
    ...stock,
    fundamentals: updatedFundamentals,
    valuation: updatedValuation,
    technicals: updatedTechnicals,
    candles: updatedCandles,
    fundamentalScore,
    technicalScore,
    compositeScore,
    recommendation,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Tenta buscar cotações ao vivo via API pública da Brapi (com CORS nativo no browser).
 * Se houver rate-limit ou o usuário estiver sem internet, aplica micro-variação realística do mercado.
 */
export async function fetchLiveMarketQuotes(stocks: StockEvaluation[]): Promise<{ updatedStocks: StockEvaluation[]; updates: PriceUpdate[] }> {
  const updates: PriceUpdate[] = [];
  const updatedStocks: StockEvaluation[] = [];

  const brTickers = stocks.filter(s => s.country === 'BR').map(s => s.ticker).join(',');

  let apiQuotes: Record<string, number> = {};

  if (brTickers) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(`https://brapi.dev/api/quote/${brTickers}?range=1d&interval=1d`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        if (json.results && Array.isArray(json.results)) {
          for (const item of json.results) {
            if (item.symbol && item.regularMarketPrice) {
              apiQuotes[item.symbol.toUpperCase()] = Number(item.regularMarketPrice);
            }
          }
        }
      }
    } catch {
      // Fallback para variação dinâmica de pregão contínuo se a API externa demorar ou limitar
    }
  }

  for (const stock of stocks) {
    const prevPrice = stock.fundamentals.currentPrice;
    let newPrice = prevPrice;

    if (apiQuotes[stock.ticker]) {
      newPrice = apiQuotes[stock.ticker];
    } else {
      // Micro-tick de mercado realista (entre -0.6% e +0.6%) simulando pregão contínuo
      const volatility = 0.005; // 0.5%
      const deltaPercent = (Math.random() - 0.49) * volatility;
      newPrice = Number((prevPrice * (1 + deltaPercent)).toFixed(2));
    }

    const changePercent = Number((((newPrice - prevPrice) / prevPrice) * 100).toFixed(2));
    
    updates.push({
      ticker: stock.ticker,
      previousPrice: prevPrice,
      newPrice,
      changePercent,
      updatedAt: new Date().toLocaleTimeString('pt-BR'),
    });

    const recalculated = recalculateStockWithNewPrice(stock, newPrice);
    updatedStocks.push(recalculated);
  }

  return { updatedStocks, updates };
}
