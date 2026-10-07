import { 
  StockEvaluation, 
  FundamentalMetrics, 
  TechnicalIndicators, 
  ValuationModels, 
  RecommendationType, 
  Candle 
} from '../types/stock';

/**
 * Calcula o Preço Justo de Benjamin Graham:
 * V_I = sqrt(22.5 * LPA * VPA)
 * Se LPA ou VPA forem negativos, o modelo clássico de Graham não se aplica.
 */
export function calculateGrahamValue(lpa: number, vpa: number): number {
  if (lpa <= 0 || vpa <= 0) return 0;
  return Math.sqrt(22.5 * lpa * vpa);
}

/**
 * Calcula o Preço Teto de Décio Bazin:
 * Preço Máximo para garantir retorno mínimo de 6% ao ano em dividendos:
 * P_Teto = Dividendo Médio Anual / 0.06
 */
export function calculateBazinPrice(projectedAnnualDividend: number): number {
  if (projectedAnnualDividend <= 0) return 0;
  return projectedAnnualDividend / 0.06;
}

/**
 * Margem de segurança percentual:
 * ((Preço Alvo - Preço Atual) / Preço Atual) * 100
 */
export function calculateMarginOfSafety(targetPrice: number, currentPrice: number): number {
  if (currentPrice <= 0 || targetPrice <= 0) return 0;
  return ((targetPrice - currentPrice) / currentPrice) * 100;
}

/**
 * Calcula Médias Móveis Simples (SMA)
 */
export function calculateSMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1] || 0;
  const slice = prices.slice(prices.length - period);
  const sum = slice.reduce((acc, val) => acc + val, 0);
  return Number((sum / period).toFixed(2));
}

/**
 * Calcula IFR / RSI (Relative Strength Index de 14 períodos)
 */
export function calculateRSI(prices: number[], period: number = 14): number {
  if (prices.length <= period) return 50;

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const diff = prices[i] - prices[i - 1];
    if (diff >= 0) gains += diff;
    else losses += Math.abs(diff);
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  for (let i = period + 1; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1];
    if (diff >= 0) {
      avgGain = (avgGain * (period - 1) + diff) / period;
      avgLoss = (avgLoss * (period - 1)) / period;
    } else {
      avgGain = (avgGain * (period - 1)) / period;
      avgLoss = (avgLoss * (period - 1) + Math.abs(diff)) / period;
    }
  }

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  const rsi = 100 - (100 / (1 + rs));
  return Number(rsi.toFixed(1));
}

/**
 * Calcula Bandas de Bollinger (SMA 20, 2 desvios padrão)
 */
export function calculateBollingerBands(prices: number[], period: number = 20, stdDevMultiplier: number = 2) {
  const sma = calculateSMA(prices, period);
  const slice = prices.slice(Math.max(0, prices.length - period));
  const variance = slice.reduce((acc, val) => acc + Math.pow(val - sma, 2), 0) / slice.length;
  const stdDev = Math.sqrt(variance);

  return {
    upper: Number((sma + (stdDevMultiplier * stdDev)).toFixed(2)),
    middle: sma,
    lower: Number((sma - (stdDevMultiplier * stdDev)).toFixed(2)),
  };
}

/**
 * Motor de Pontuação Fundamentalista (0 a 100)
 */
export function calculateFundamentalScore(fundamentals: FundamentalMetrics, valuation: ValuationModels): number {
  let score = 50; // Base neutra

  // 1. P/L (Preço / Lucro)
  if (fundamentals.peRatio > 0 && fundamentals.peRatio <= 8) score += 12;
  else if (fundamentals.peRatio > 8 && fundamentals.peRatio <= 14) score += 8;
  else if (fundamentals.peRatio > 14 && fundamentals.peRatio <= 22) score += 2;
  else if (fundamentals.peRatio > 35 || fundamentals.peRatio < 0) score -= 12;

  // 2. Dividend Yield
  if (fundamentals.dividendYield >= 8) score += 12;
  else if (fundamentals.dividendYield >= 6) score += 8;
  else if (fundamentals.dividendYield >= 4) score += 4;
  else if (fundamentals.dividendYield < 1.5) score -= 3;

  // 3. Rentabilidade (ROE & Margem Líquida)
  if (fundamentals.roe >= 20) score += 12;
  else if (fundamentals.roe >= 14) score += 8;
  else if (fundamentals.roe < 6) score -= 8;

  if (fundamentals.netMargin >= 18) score += 8;
  else if (fundamentals.netMargin >= 10) score += 5;
  else if (fundamentals.netMargin < 4) score -= 6;

  // 4. Endividamento (Dívida Líquida / EBITDA)
  if (fundamentals.netDebtEbitda < 0) score += 8; // Caixa líquido positivo
  else if (fundamentals.netDebtEbitda <= 1.5) score += 6;
  else if (fundamentals.netDebtEbitda > 3.0) score -= 10;
  else if (fundamentals.netDebtEbitda > 4.5) score -= 18;

  // 5. Margem de Segurança Graham / Bazin
  if (valuation.grahamMarginOfSafety >= 25) score += 10;
  else if (valuation.grahamMarginOfSafety >= 10) score += 5;
  else if (valuation.grahamMarginOfSafety < -20) score -= 6;

  if (valuation.bazinMarginOfSafety >= 20) score += 8;
  else if (valuation.bazinMarginOfSafety < -15) score -= 5;

  return Math.min(100, Math.max(0, Math.round(score)));
}

/**
 * Motor de Pontuação Técnica (0 a 100)
 */
export function calculateTechnicalScore(currentPrice: number, technicals: TechnicalIndicators): number {
  let score = 50;

  // 1. Médias Móveis e Golden Cross
  if (currentPrice > technicals.sma200) score += 14;
  else score -= 12;

  if (currentPrice > technicals.sma50) score += 8;
  else score -= 6;

  if (technicals.goldenCross) score += 10;
  if (technicals.deathCross) score -= 14;

  // 2. RSI (14)
  if (technicals.rsi14 >= 30 && technicals.rsi14 <= 50) score += 12; // Acumulação ideal
  else if (technicals.rsi14 > 50 && technicals.rsi14 <= 65) score += 8; // Tendência saudável
  else if (technicals.rsi14 < 30) score += 14; // Sobrevendido extremo (oportunidade de repique)
  else if (technicals.rsi14 > 72) score -= 14; // Sobrecomprado extremo (risco de correção)

  // 3. MACD
  if (technicals.macdHistogram > 0 && technicals.macdLine > technicals.macdSignal) score += 10;
  else if (technicals.macdHistogram < 0 && technicals.macdLine < technicals.macdSignal) score -= 10;

  // 4. Bandas de Bollinger
  if (currentPrice <= technicals.bollingerLower * 1.02) score += 8; // Suporte da banda inferior
  else if (currentPrice >= technicals.bollingerUpper * 0.98) score -= 8; // Resistência da banda superior

  return Math.min(100, Math.max(0, Math.round(score)));
}

/**
 * Determina Recomendação Sintética com base no Score Global
 */
export function getRecommendation(compositeScore: number): RecommendationType {
  if (compositeScore >= 78) return 'STRONG_BUY';
  if (compositeScore >= 64) return 'BUY';
  if (compositeScore >= 45) return 'HOLD';
  if (compositeScore >= 30) return 'SELL';
  return 'STRONG_SELL';
}

/**
 * Gera velas sintéticas realistas baseadas em volatilidade e tendência
 */
export function generateCandles(basePrice: number, days: number = 60, trend: number = 0.001): Candle[] {
  const candles: Candle[] = [];
  let currentClose = Number((basePrice * 0.92).toFixed(2));
  const now = new Date();

  for (let i = days; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    // random walk with drift
    const changePercent = (Math.random() - 0.485 + trend) * 0.024;
    const open = currentClose;
    const close = Number(Math.max(1, open * (1 + changePercent)).toFixed(2));
    const high = Number((Math.max(open, close) * (1 + Math.random() * 0.012)).toFixed(2));
    const low = Number((Math.min(open, close) * (1 - Math.random() * 0.012)).toFixed(2));
    const volume = Math.round(1500000 + Math.random() * 3500000);

    candles.push({
      date: dateStr,
      open,
      high,
      low,
      close,
      volume,
    });

    currentClose = close;
  }

  // Force last candle close to base price for coherence
  if (candles.length > 0) {
    candles[candles.length - 1].close = basePrice;
    candles[candles.length - 1].high = Math.max(candles[candles.length - 1].high, basePrice);
  }

  return candles;
}

/**
 * Cria avaliação completa de uma ação a partir dos seus fundamentos e velas
 */
export function evaluateStock(
  ticker: string,
  name: string,
  sector: string,
  country: 'BR' | 'US',
  currentPrice: number,
  fundamentals: Omit<FundamentalMetrics, 'currentPrice' | 'currency'>,
  customCandles?: Candle[]
): StockEvaluation {
  const candles = customCandles || generateCandles(currentPrice, 60);
  const closePrices = candles.map(c => c.close);

  const sma20 = calculateSMA(closePrices, 20);
  const sma50 = calculateSMA(closePrices, 50);
  const sma200 = calculateSMA(closePrices, 60); // proxy para 200 no dataset sintético
  const rsi14 = calculateRSI(closePrices, 14);
  const bollinger = calculateBollingerBands(closePrices, 20, 2);

  // MACD approximation
  const ema12 = calculateSMA(closePrices, 12);
  const ema26 = calculateSMA(closePrices, 26);
  const macdLine = Number((ema12 - ema26).toFixed(2));
  const macdSignal = Number((macdLine * 0.85).toFixed(2));
  const macdHistogram = Number((macdLine - macdSignal).toFixed(2));

  const technicals: TechnicalIndicators = {
    rsi14,
    sma20,
    sma50,
    sma200,
    bollingerUpper: bollinger.upper,
    bollingerMiddle: bollinger.middle,
    bollingerLower: bollinger.lower,
    macdLine,
    macdSignal,
    macdHistogram,
    stochasticK: Math.round(30 + Math.random() * 40),
    stochasticD: Math.round(35 + Math.random() * 35),
    goldenCross: sma50 > sma200,
    deathCross: sma50 < sma200,
  };

  const fullFundamentals: FundamentalMetrics = {
    ...fundamentals,
    currentPrice,
    currency: country === 'BR' ? 'BRL' : 'USD',
  };

  const grahamFairValue = Number(calculateGrahamValue(fullFundamentals.lpa, fullFundamentals.vpa).toFixed(2));
  const grahamMarginOfSafety = Number(calculateMarginOfSafety(grahamFairValue, currentPrice).toFixed(1));

  const bazinCeilingPrice = Number(calculateBazinPrice(fullFundamentals.projectedAnnualDividend).toFixed(2));
  const bazinMarginOfSafety = Number(calculateMarginOfSafety(bazinCeilingPrice, currentPrice).toFixed(1));

  const dcfIntrinsicValue = Number((currentPrice * (1 + (fundamentals.cagrProfits5y / 100) * 0.8)).toFixed(2));

  const valuation: ValuationModels = {
    grahamFairValue,
    grahamMarginOfSafety,
    bazinCeilingPrice,
    bazinMarginOfSafety,
    dcfIntrinsicValue,
  };

  const fundamentalScore = calculateFundamentalScore(fullFundamentals, valuation);
  const technicalScore = calculateTechnicalScore(currentPrice, technicals);
  const compositeScore = Math.round(fundamentalScore * 0.55 + technicalScore * 0.45);
  const recommendation = getRecommendation(compositeScore);

  const highlights: string[] = [];
  const risks: string[] = [];

  if (fullFundamentals.dividendYield >= 7) highlights.push(`Dividend Yield atrativo de ${fullFundamentals.dividendYield.toFixed(1)}%`);
  if (valuation.grahamMarginOfSafety > 15) highlights.push(`Margem de Graham de +${valuation.grahamMarginOfSafety}% (Preço justo R$ ${grahamFairValue})`);
  if (valuation.bazinMarginOfSafety > 10) highlights.push(`Abaixo do Teto de Bazin (Teto R$ ${bazinCeilingPrice})`);
  if (fullFundamentals.roe >= 18) highlights.push(`ROE expressivo de ${fullFundamentals.roe.toFixed(1)}%`);
  if (currentPrice > technicals.sma50 && currentPrice > technicals.sma200) highlights.push('Tendência técnica altista acima das médias de 50 e 200 períodos');
  if (technicals.rsi14 < 35) highlights.push(`RSI em sobrevenda (${technicals.rsi14}), indicando potencial ponto de reversão`);

  if (fullFundamentals.netDebtEbitda > 3.0) risks.push(`Alavancagem elevada com Dívida Líq./EBITDA de ${fullFundamentals.netDebtEbitda.toFixed(1)}x`);
  if (fullFundamentals.peRatio > 30) risks.push(`Múltiplo P/L esticado de ${fullFundamentals.peRatio.toFixed(1)}x`);
  if (technicals.rsi14 > 70) risks.push(`RSI sobrecomprado (${technicals.rsi14}), risco de correção de curto prazo`);
  if (valuation.grahamMarginOfSafety < -15) risks.push(`Negociando com ágio sobre o Preço Justo de Graham (${valuation.grahamMarginOfSafety}%)`);

  return {
    ticker,
    name,
    sector,
    country,
    fundamentals: fullFundamentals,
    technicals,
    valuation,
    fundamentalScore,
    technicalScore,
    compositeScore,
    recommendation,
    highlights,
    risks,
    candles,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Catálogo Curado de Ativos do Mercado (B3 e Globais)
 */
export const INITIAL_STOCKS: StockEvaluation[] = [
  evaluateStock('BBAS3', 'Banco do Brasil', 'Financeiro', 'BR', 27.85, {
    peRatio: 4.3,
    pbRatio: 0.78,
    dividendYield: 9.8,
    roe: 21.4,
    roic: 18.2,
    netMargin: 17.5,
    ebitMargin: 24.0,
    evEbitda: 4.1,
    netDebtEbitda: 0.0,
    cagrProfits5y: 16.2,
    cagrRevenues5y: 11.5,
    lpa: 6.45,
    vpa: 35.80,
    projectedAnnualDividend: 2.75,
    payoutRatio: 42.6,
  }),
  evaluateStock('PETR4', 'Petrobras', 'Petróleo & Gás', 'BR', 36.40, {
    peRatio: 4.8,
    pbRatio: 1.15,
    dividendYield: 14.2,
    roe: 24.8,
    roic: 21.6,
    netMargin: 22.3,
    ebitMargin: 38.0,
    evEbitda: 3.2,
    netDebtEbitda: 1.1,
    cagrProfits5y: 18.4,
    cagrRevenues5y: 14.1,
    lpa: 7.58,
    vpa: 31.65,
    projectedAnnualDividend: 4.90,
    payoutRatio: 64.6,
  }),
  evaluateStock('TAEE11', 'Taesa', 'Energia Elétrica', 'BR', 34.60, {
    peRatio: 8.9,
    pbRatio: 1.72,
    dividendYield: 8.7,
    roe: 19.8,
    roic: 14.5,
    netMargin: 46.2,
    ebitMargin: 68.5,
    evEbitda: 7.4,
    netDebtEbitda: 2.9,
    cagrProfits5y: 9.2,
    cagrRevenues5y: 8.6,
    lpa: 3.88,
    vpa: 20.10,
    projectedAnnualDividend: 2.95,
    payoutRatio: 76.0,
  }),
  evaluateStock('ITUB4', 'Itaú Unibanco', 'Financeiro', 'BR', 35.20, {
    peRatio: 8.4,
    pbRatio: 1.75,
    dividendYield: 7.2,
    roe: 21.9,
    roic: 18.5,
    netMargin: 19.8,
    ebitMargin: 28.2,
    evEbitda: 6.8,
    netDebtEbitda: 0.0,
    cagrProfits5y: 12.8,
    cagrRevenues5y: 10.4,
    lpa: 4.19,
    vpa: 20.11,
    projectedAnnualDividend: 2.50,
    payoutRatio: 59.6,
  }),
  evaluateStock('WEGE3', 'WEG', 'Bens Industriais', 'BR', 52.10, {
    peRatio: 33.5,
    pbRatio: 11.2,
    dividendYield: 1.7,
    roe: 33.6,
    roic: 31.2,
    netMargin: 17.1,
    ebitMargin: 21.4,
    evEbitda: 22.8,
    netDebtEbitda: -0.4,
    cagrProfits5y: 24.5,
    cagrRevenues5y: 22.1,
    lpa: 1.55,
    vpa: 4.65,
    projectedAnnualDividend: 0.88,
    payoutRatio: 56.7,
  }),
  evaluateStock('VALE3', 'Vale', 'Mineração', 'BR', 57.30, {
    peRatio: 6.2,
    pbRatio: 1.32,
    dividendYield: 9.4,
    roe: 20.5,
    roic: 17.8,
    netMargin: 24.1,
    ebitMargin: 36.4,
    evEbitda: 4.5,
    netDebtEbitda: 1.2,
    cagrProfits5y: 7.5,
    cagrRevenues5y: 8.1,
    lpa: 9.24,
    vpa: 43.40,
    projectedAnnualDividend: 5.20,
    payoutRatio: 56.2,
  }),
  evaluateStock('PRIO3', 'PRIO', 'Petróleo & Gás', 'BR', 44.80, {
    peRatio: 7.9,
    pbRatio: 2.65,
    dividendYield: 0.0,
    roe: 36.2,
    roic: 28.4,
    netMargin: 38.6,
    ebitMargin: 56.2,
    evEbitda: 4.8,
    netDebtEbitda: 1.4,
    cagrProfits5y: 42.8,
    cagrRevenues5y: 48.2,
    lpa: 5.67,
    vpa: 16.90,
    projectedAnnualDividend: 0.0,
    payoutRatio: 0.0,
  }),
  evaluateStock('RENT3', 'Localiza', 'Transporte & Frotas', 'BR', 41.20, {
    peRatio: 15.6,
    pbRatio: 1.72,
    dividendYield: 3.4,
    roe: 11.2,
    roic: 9.8,
    netMargin: 7.4,
    ebitMargin: 18.2,
    evEbitda: 7.9,
    netDebtEbitda: 3.3,
    cagrProfits5y: 11.5,
    cagrRevenues5y: 16.4,
    lpa: 2.64,
    vpa: 23.95,
    projectedAnnualDividend: 1.40,
    payoutRatio: 53.0,
  }),
  evaluateStock('AAPL', 'Apple Inc.', 'Tecnologia', 'US', 228.50, {
    peRatio: 33.8,
    pbRatio: 47.2,
    dividendYield: 0.5,
    roe: 147.2,
    roic: 58.4,
    netMargin: 25.3,
    ebitMargin: 30.7,
    evEbitda: 24.6,
    netDebtEbitda: 0.6,
    cagrProfits5y: 14.2,
    cagrRevenues5y: 9.8,
    lpa: 6.76,
    vpa: 4.84,
    projectedAnnualDividend: 1.04,
    payoutRatio: 15.3,
  }),
  evaluateStock('NVDA', 'NVIDIA Corp.', 'Semicondutores & IA', 'US', 124.60, {
    peRatio: 44.2,
    pbRatio: 38.5,
    dividendYield: 0.1,
    roe: 112.5,
    roic: 86.2,
    netMargin: 55.4,
    ebitMargin: 62.1,
    evEbitda: 36.4,
    netDebtEbitda: -0.2,
    cagrProfits5y: 68.4,
    cagrRevenues5y: 54.2,
    lpa: 2.82,
    vpa: 3.24,
    projectedAnnualDividend: 0.16,
    payoutRatio: 5.6,
  }),
  evaluateStock('MSFT', 'Microsoft Corp.', 'Software & Nuvem', 'US', 422.80, {
    peRatio: 34.2,
    pbRatio: 11.8,
    dividendYield: 0.8,
    roe: 38.5,
    roic: 31.4,
    netMargin: 36.2,
    ebitMargin: 44.8,
    evEbitda: 22.4,
    netDebtEbitda: 0.3,
    cagrProfits5y: 18.6,
    cagrRevenues5y: 14.8,
    lpa: 12.36,
    vpa: 35.83,
    projectedAnnualDividend: 3.32,
    payoutRatio: 26.8,
  }),
];
