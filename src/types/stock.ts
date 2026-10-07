export type RecommendationType = 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG_SELL';

export type InvestmentStrategy = 'DIVIDENDS' | 'VALUE' | 'GROWTH' | 'SWING_TRADE' | 'BALANCED';

export interface Candle {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TechnicalIndicators {
  rsi14: number; // Relative Strength Index (0-100)
  sma20: number; // 20-period Simple Moving Average
  sma50: number; // 50-period Simple Moving Average
  sma200: number; // 200-period Simple Moving Average
  bollingerUpper: number;
  bollingerMiddle: number;
  bollingerLower: number;
  macdLine: number;
  macdSignal: number;
  macdHistogram: number;
  stochasticK: number;
  stochasticD: number;
  goldenCross: boolean; // SMA 50 crossed above SMA 200
  deathCross: boolean; // SMA 50 crossed below SMA 200
}

export interface FundamentalMetrics {
  currentPrice: number;
  currency: 'BRL' | 'USD';
  peRatio: number; // P/L (Preço / Lucro)
  pbRatio: number; // P/VP (Preço / Valor Patrimonial)
  dividendYield: number; // DY % nos últimos 12 meses
  roe: number; // Return on Equity (%)
  roic: number; // Return on Invested Capital (%)
  netMargin: number; // Margem Líquida (%)
  ebitMargin: number; // Margem EBIT (%)
  evEbitda: number; // EV / EBITDA
  netDebtEbitda: number; // Dívida Líquida / EBITDA (alavancagem)
  cagrProfits5y: number; // Crescimento de Lucros 5 anos (%)
  cagrRevenues5y: number; // Crescimento de Receitas 5 anos (%)
  lpa: number; // Lucro por Ação
  vpa: number; // Valor Patrimonial por Ação
  projectedAnnualDividend: number; // Dividendo estimado por ação para o ano
  payoutRatio: number; // Payout (%)
}

export interface ValuationModels {
  grahamFairValue: number; // Preço Justo de Benjamin Graham: sqrt(22.5 * LPA * VPA)
  grahamMarginOfSafety: number; // % de desconto ou ágio
  bazinCeilingPrice: number; // Preço Teto Décio Bazin: Dividendo Projetado / 0.06
  bazinMarginOfSafety: number; // % de margem de segurança para teto de Bazin
  dcfIntrinsicValue: number; // Fluxo de Caixa Descontado Simplificado
}

export interface StockEvaluation {
  ticker: string;
  name: string;
  sector: string;
  country: 'BR' | 'US';
  fundamentals: FundamentalMetrics;
  technicals: TechnicalIndicators;
  valuation: ValuationModels;
  fundamentalScore: number; // 0 a 100
  technicalScore: number; // 0 a 100
  compositeScore: number; // 0 a 100
  recommendation: RecommendationType;
  highlights: string[];
  risks: string[];
  candles: Candle[];
  lastUpdated: string;
}

export interface PortfolioAllocation {
  ticker: string;
  name: string;
  weight: number; // %
  currentPrice: number;
  targetPrice: number;
  strategy: InvestmentStrategy;
}
