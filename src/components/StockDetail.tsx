import React, { useState, useMemo } from 'react';
import { StockEvaluation } from '../types/stock';
import { calculateGrahamValue, calculateBazinPrice, calculateMarginOfSafety } from '../services/financialEngine';
import { 
  TrendingUp, 
  ShieldCheck, 
  DollarSign, 
  Activity, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Sliders, 
  RefreshCw,
  Info,
  ChevronLeft
} from 'lucide-react';

interface StockDetailProps {
  stock: StockEvaluation;
  onBack: () => void;
  onUpdateStockValuation?: (ticker: string, newLpa: number, newVpa: number, newDiv: number) => void;
}

export const StockDetail: React.FC<StockDetailProps> = ({
  stock,
  onBack,
}) => {
  // Chart indicator toggles
  const [showSMA20, setShowSMA20] = useState(true);
  const [showSMA50, setShowSMA50] = useState(true);
  const [showBollinger, setShowBollinger] = useState(false);
  const [activeSubChart, setActiveSubChart] = useState<'RSI' | 'MACD'>('RSI');

  // Interactive valuation simulator sliders
  const [simLpa, setSimLpa] = useState<number>(stock.fundamentals.lpa);
  const [simVpa, setSimVpa] = useState<number>(stock.fundamentals.vpa);
  const [simDividend, setSimDividend] = useState<number>(stock.fundamentals.projectedAnnualDividend);

  // Recalculate dynamic valuation on slider change
  const dynamicGraham = useMemo(() => {
    return Number(calculateGrahamValue(simLpa, simVpa).toFixed(2));
  }, [simLpa, simVpa]);

  const dynamicGrahamMargin = useMemo(() => {
    return Number(calculateMarginOfSafety(dynamicGraham, stock.fundamentals.currentPrice).toFixed(1));
  }, [dynamicGraham, stock.fundamentals.currentPrice]);

  const dynamicBazin = useMemo(() => {
    return Number(calculateBazinPrice(simDividend).toFixed(2));
  }, [simDividend]);

  const dynamicBazinMargin = useMemo(() => {
    return Number(calculateMarginOfSafety(dynamicBazin, stock.fundamentals.currentPrice).toFixed(1));
  }, [dynamicBazin, stock.fundamentals.currentPrice]);

  const handleResetSliders = () => {
    setSimLpa(stock.fundamentals.lpa);
    setSimVpa(stock.fundamentals.vpa);
    setSimDividend(stock.fundamentals.projectedAnnualDividend);
  };

  // Quantitative Research memo state (100% algorithmic, zero cost, no AI)
  const [quantReport, setQuantReport] = useState<string | null>(null);

  const handleGenerateQuantReport = () => {
    const sym = stock.fundamentals.currency === 'BRL' ? 'R$' : 'US$';
    const isGrahamDiscount = stock.valuation.grahamMarginOfSafety > 0;
    const isBazinDiscount = stock.valuation.bazinMarginOfSafety > 0;
    const isLeveraged = stock.fundamentals.netDebtEbitda > 2.5;

    const memo = `### Memorando de Análise Quantitativa: ${stock.ticker} (${stock.name})
*Relatório 100% Algorítmico & Determinístico (Sem Custos de IA)*

**1. Diagnóstico de Valuation & Margem de Segurança**
- **Cotação Atual:** ${sym} ${stock.fundamentals.currentPrice.toFixed(2)}
- **Preço Justo (Benjamin Graham):** ${sym} ${stock.valuation.grahamFairValue.toFixed(2)}
  ${isGrahamDiscount 
    ? `O ativo negocia com margem de segurança favorável de +${stock.valuation.grahamMarginOfSafety}%, atendendo aos critérios de barganha da metodologia de Value Investing.` 
    : `O ativo negocia com ágio de ${stock.valuation.grahamMarginOfSafety}% sobre o valor patrimonial/lucro intrínseco, exigindo cautela no preço de entrada.`}
- **Preço Teto de Dividendos (Décio Bazin 6%):** ${stock.fundamentals.projectedAnnualDividend > 0 ? `${sym} ${stock.valuation.bazinCeilingPrice.toFixed(2)} (${isBazinDiscount ? `Desconto de +${stock.valuation.bazinMarginOfSafety}% até o teto` : `Ágio de ${stock.valuation.bazinMarginOfSafety}% acima do teto`}) com Dividend Yield de ${stock.fundamentals.dividendYield.toFixed(1)}% a.a.` : 'Não se aplica (empresa não distribui dividendos regulares).'}

**2. Saúde Financeira & Eficiência Operacional**
- **Rentabilidade:** ROE de ${stock.fundamentals.roe.toFixed(1)}% e Margem Líquida de ${stock.fundamentals.netMargin.toFixed(1)}% demonstram ${stock.fundamentals.roe >= 15 ? 'alta eficiência e vantagens competitivas (Moat)' : 'rentabilidade moderada'}.
- **Alavancagem:** Relação Dívida Líquida / EBITDA em ${stock.fundamentals.netDebtEbitda.toFixed(1)}x (${isLeveraged ? 'Alerta: alavancagem acima do limite prudencial de 2,5x' : 'Nível saudável de endividamento, conferindo resiliência ao fluxo de caixa'}).
- **Múltiplos de Mercado:** P/L de ${stock.fundamentals.peRatio.toFixed(1)}x e P/VP de ${stock.fundamentals.pbRatio.toFixed(2)}x.

**3. Leitura Técnica de Timing & Momento**
- **IFR / RSI (14 períodos):** ${stock.technicals.rsi14} (${stock.technicals.rsi14 < 35 ? 'Zona de sobrevenda (<35): oportunidade estatística de repique' : stock.technicals.rsi14 > 70 ? 'Zona de sobrecompra (>70): risco elevado de realização de lucros no curto prazo' : 'Faixa neutra de equilíbrio'}).
- **Médias Móveis:** O preço negocia ${stock.fundamentals.currentPrice > stock.technicals.sma50 ? 'acima' : 'abaixo'} da média móvel de 50 períodos e ${stock.technicals.goldenCross ? 'apresenta Golden Cross ativo (SMA 50 > SMA 200)' : 'sem cruzamento altista expressivo'}.

**4. Veredito Algorítmico Final**
- **Score Fundamentalista:** ${stock.fundamentalScore}/100
- **Score Técnico:** ${stock.technicalScore}/100
- **Score Composto Ponderado:** ${stock.compositeScore}/100 &bull; **Recomendação:** ${stock.recommendation === 'STRONG_BUY' ? 'FORTE COMPRA' : stock.recommendation === 'BUY' ? 'COMPRA' : stock.recommendation === 'HOLD' ? 'MANTER / NEUTRO' : stock.recommendation === 'SELL' ? 'VENDA' : 'FORTE VENDA'}.`;

    setQuantReport(memo);
  };

  const currencySymbol = stock.fundamentals.currency === 'BRL' ? 'R$' : 'US$';

  // SVG Chart Dimensions & Computations
  const candles = stock.candles || [];
  const prices = candles.map(c => c.close);
  const minPrice = Math.min(...prices) * 0.96;
  const maxPrice = Math.max(...prices) * 1.04;
  const priceRange = maxPrice - minPrice || 1;
  const chartHeight = 220;
  const chartWidth = 700;

  // Compute SVG Points for close price line
  const pricePoints = candles.map((c, i) => {
    const x = (i / (candles.length - 1)) * chartWidth;
    const y = chartHeight - ((c.close - minPrice) / priceRange) * chartHeight;
    return `${x},${y}`;
  }).join(' ');

  // Compute SVG Points for SMA20
  const sma20Points = candles.map((_, i) => {
    if (i < 19) return null;
    const slice = candles.slice(i - 19, i + 1);
    const avg = slice.reduce((a, b) => a + b.close, 0) / 20;
    const x = (i / (candles.length - 1)) * chartWidth;
    const y = chartHeight - ((avg - minPrice) / priceRange) * chartHeight;
    return `${x},${y}`;
  }).filter(Boolean).join(' ');

  // Compute SVG Points for SMA50
  const sma50Points = candles.map((_, i) => {
    if (i < 49) return null;
    const slice = candles.slice(i - 49, i + 1);
    const avg = slice.reduce((a, b) => a + b.close, 0) / 50;
    const x = (i / (candles.length - 1)) * chartWidth;
    const y = chartHeight - ((avg - minPrice) / priceRange) * chartHeight;
    return `${x},${y}`;
  }).filter(Boolean).join(' ');

  return (
    <div className="space-y-6">
      
      {/* Top Navigation & Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          Voltar para lista de ações
        </button>

        <div className="text-xs text-slate-500">
          Última atualização: {new Date(stock.lastUpdated).toLocaleDateString('pt-BR')} &middot; Dados Auditados
        </div>
      </div>

      {/* Hero Stock Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold font-mono tracking-tight text-white">
                {stock.ticker}
              </h1>
              <span className="px-2 py-0.5 text-xs font-mono font-medium rounded bg-slate-800 text-slate-300 border border-slate-700">
                {stock.country === 'BR' ? 'B3 BRASIL' : 'US MARKET'}
              </span>
              <span className="text-xs text-slate-400">
                Setor: {stock.sector}
              </span>
            </div>
            <div className="text-base text-slate-300 mt-1 font-medium">
              {stock.name}
            </div>
          </div>

          {/* Price & Recommendation Tag */}
          <div className="flex items-center gap-6">
            <div>
              <div className="text-xs text-slate-400">Cotação</div>
              <div className="text-3xl font-bold font-mono-numbers text-white">
                {currencySymbol} {stock.fundamentals.currentPrice.toFixed(2)}
              </div>
            </div>

            <div className="border-l border-slate-800 pl-6">
              <div className="text-xs text-slate-400">Score Global</div>
              <div className="flex items-center gap-2">
                <span className={`text-3xl font-bold font-mono-numbers ${
                  stock.compositeScore >= 70 ? 'text-emerald-400' :
                  stock.compositeScore >= 50 ? 'text-amber-400' : 'text-rose-400'
                }`}>
                  {stock.compositeScore}
                </span>
                <span className="text-xs text-slate-500 font-mono">/100</span>
              </div>
            </div>

            <div className="border-l border-slate-800 pl-6">
              <div className="text-xs text-slate-400">Recomendação</div>
              <div className={`mt-1 px-3 py-1 text-xs font-bold rounded-md border ${
                stock.recommendation === 'STRONG_BUY' ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800' :
                stock.recommendation === 'BUY' ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60' :
                stock.recommendation === 'HOLD' ? 'bg-amber-950/60 text-amber-300 border-amber-800' :
                'bg-rose-950/70 text-rose-300 border-rose-800'
              }`}>
                {stock.recommendation === 'STRONG_BUY' ? 'FORTE COMPRA' :
                 stock.recommendation === 'BUY' ? 'COMPRA' :
                 stock.recommendation === 'HOLD' ? 'MANTER' :
                 stock.recommendation === 'SELL' ? 'VENDA' : 'FORTE VENDA'}
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Main Grid: Chart + Valuation Lab */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Interactive Technical Chart (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-semibold text-slate-200">
                Gráfico Histórico & Indicadores Técnicos
              </h2>
            </div>

            {/* Indicator Toggles */}
            <div className="flex items-center gap-1.5 text-xs">
              <button
                onClick={() => setShowSMA20(!showSMA20)}
                className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                  showSMA20 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-800 text-slate-400'
                }`}
              >
                SMA 20
              </button>
              <button
                onClick={() => setShowSMA50(!showSMA50)}
                className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                  showSMA50 ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-slate-800 text-slate-400'
                }`}
              >
                SMA 50
              </button>
              <button
                onClick={() => setShowBollinger(!showBollinger)}
                className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                  showBollinger ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'bg-slate-800 text-slate-400'
                }`}
              >
                Bollinger
              </button>
            </div>
          </div>

          {/* Primary SVG Price Action Chart */}
          <div className="relative bg-slate-950/60 rounded-lg p-2 border border-slate-800/80 overflow-hidden">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-56">
              
              {/* Horizontal Grid lines */}
              <line x1="0" y1={chartHeight * 0.25} x2={chartWidth} y2={chartHeight * 0.25} stroke="#334155" strokeDasharray="3 3" strokeOpacity="0.4" />
              <line x1="0" y1={chartHeight * 0.5} x2={chartWidth} y2={chartHeight * 0.5} stroke="#334155" strokeDasharray="3 3" strokeOpacity="0.4" />
              <line x1="0" y1={chartHeight * 0.75} x2={chartWidth} y2={chartHeight * 0.75} stroke="#334155" strokeDasharray="3 3" strokeOpacity="0.4" />

              {/* Bollinger Bands Fill */}
              {showBollinger && (
                <rect 
                  x="0" 
                  y={chartHeight - ((stock.technicals.bollingerUpper - minPrice) / priceRange) * chartHeight}
                  width={chartWidth}
                  height={Math.max(10, ((stock.technicals.bollingerUpper - stock.technicals.bollingerLower) / priceRange) * chartHeight)}
                  fill="#a855f7"
                  fillOpacity="0.08"
                />
              )}

              {/* SMA 50 Line */}
              {showSMA50 && sma50Points && (
                <polyline
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="1.5"
                  strokeDasharray="4 2"
                  points={sma50Points}
                />
              )}

              {/* SMA 20 Line */}
              {showSMA20 && sma20Points && (
                <polyline
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="1.5"
                  points={sma20Points}
                />
              )}

              {/* Price Line */}
              <polyline
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                points={pricePoints}
              />
            </svg>

            <div className="absolute top-3 left-4 flex items-center gap-4 text-[11px] font-mono">
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                Preço ({currencySymbol} {stock.fundamentals.currentPrice.toFixed(2)})
              </span>
              {showSMA20 && (
                <span className="text-amber-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  SMA 20 ({currencySymbol} {stock.technicals.sma20.toFixed(2)})
                </span>
              )}
              {showSMA50 && (
                <span className="text-cyan-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                  SMA 50 ({currencySymbol} {stock.technicals.sma50.toFixed(2)})
                </span>
              )}
            </div>
          </div>

          {/* Secondary Sub-Chart: RSI or MACD */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveSubChart('RSI')}
                  className={`text-xs font-semibold px-2 py-0.5 rounded cursor-pointer ${
                    activeSubChart === 'RSI' ? 'text-emerald-400 bg-slate-800' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  IFR / RSI (14): <span className="font-mono-numbers">{stock.technicals.rsi14}</span>
                </button>
                <button
                  onClick={() => setActiveSubChart('MACD')}
                  className={`text-xs font-semibold px-2 py-0.5 rounded cursor-pointer ${
                    activeSubChart === 'MACD' ? 'text-emerald-400 bg-slate-800' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  MACD (12, 26, 9)
                </button>
              </div>

              <div className="text-[11px] text-slate-500 font-mono">
                {activeSubChart === 'RSI' ? (
                  stock.technicals.rsi14 < 30 ? 'Zona de Sobrevenda (<30) - Oportunidade' :
                  stock.technicals.rsi14 > 70 ? 'Zona de Sobrecompra (>70) - Risco' : 'Zona Neutra de Equilíbrio'
                ) : (
                  `Hist: ${stock.technicals.macdHistogram >= 0 ? '+' : ''}${stock.technicals.macdHistogram}`
                )}
              </div>
            </div>

            {/* RSI Visual Gauge Bar */}
            {activeSubChart === 'RSI' ? (
              <div className="h-6 bg-slate-950 rounded border border-slate-800 relative flex items-center px-2 overflow-hidden">
                <div className="absolute inset-y-0 left-0 w-[30%] bg-emerald-500/10 border-r border-emerald-500/20" title="Sobrevenda < 30"></div>
                <div className="absolute inset-y-0 right-0 w-[30%] bg-rose-500/10 border-l border-rose-500/20" title="Sobrecompra > 70"></div>
                <div 
                  className="absolute w-2 h-4 rounded-sm bg-emerald-400 shadow-sm"
                  style={{ left: `calc(${stock.technicals.rsi14}% - 4px)` }}
                ></div>
                <div className="w-full flex justify-between text-[10px] font-mono text-slate-500 z-10">
                  <span>0 (Extremo Baixa)</span>
                  <span className="text-emerald-400 font-bold">30 Sobrevenda</span>
                  <span>50 Neutro</span>
                  <span className="text-rose-400 font-bold">70 Sobrecompra</span>
                  <span>100</span>
                </div>
              </div>
            ) : (
              <div className="p-2 bg-slate-950 rounded border border-slate-800 text-xs font-mono flex justify-between items-center">
                <span>Linha MACD: <b className="text-cyan-400">{stock.technicals.macdLine}</b></span>
                <span>Sinal: <b className="text-amber-400">{stock.technicals.macdSignal}</b></span>
                <span>Histograma: <b className={stock.technicals.macdHistogram >= 0 ? 'text-emerald-400' : 'text-rose-400'}>{stock.technicals.macdHistogram}</b></span>
              </div>
            )}
          </div>

          {/* Technical Health Checklist */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-xs">
            <div className="p-2 bg-slate-950/60 rounded border border-slate-800/80">
              <div className="text-slate-500 text-[10px]">Médias Móveis</div>
              <div className="font-semibold text-slate-200 mt-0.5">
                {stock.fundamentals.currentPrice > stock.technicals.sma50 ? '▲ Acima de SMA 50' : '▼ Abaixo de SMA 50'}
              </div>
            </div>

            <div className="p-2 bg-slate-950/60 rounded border border-slate-800/80">
              <div className="text-slate-500 text-[10px]">Cruzamento (50/200)</div>
              <div className="font-semibold text-slate-200 mt-0.5">
                {stock.technicals.goldenCross ? 'Golden Cross 🌟' : 'Sem Golden Cross'}
              </div>
            </div>

            <div className="p-2 bg-slate-950/60 rounded border border-slate-800/80">
              <div className="text-slate-500 text-[10px]">Bandas Bollinger</div>
              <div className="font-semibold text-slate-200 mt-0.5">
                {stock.fundamentals.currentPrice < stock.technicals.bollingerMiddle ? 'Metade Inferior' : 'Metade Superior'}
              </div>
            </div>

            <div className="p-2 bg-slate-950/60 rounded border border-slate-800/80">
              <div className="text-slate-500 text-[10px]">Score Técnico</div>
              <div className="font-semibold text-emerald-400 mt-0.5 font-mono-numbers">
                {stock.technicalScore}/100
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Interactive Valuation Simulator (Graham & Bazin) (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
          
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-semibold text-slate-200">
                Laboratório de Valuation Interativo
              </h2>
            </div>
            <button
              onClick={handleResetSliders}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
              title="Restaurar valores oficiais"
            >
              <RefreshCw className="w-3 h-3" />
              Reset
            </button>
          </div>

          {/* Model 1: Benjamin Graham */}
          <div className="bg-slate-950/80 rounded-lg p-4 border border-slate-800/90 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Fórmula de Benjamin Graham
              </div>
              <span className="text-[10px] text-slate-500 font-mono">VI = √(22.5 &middot; LPA &middot; VPA)</span>
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-xs text-slate-400">Preço Justo Calculado</div>
                <div className="text-xl font-bold font-mono-numbers text-emerald-400">
                  {currencySymbol} {dynamicGraham.toFixed(2)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-400">Margem de Segurança</div>
                <div className={`text-base font-bold font-mono-numbers ${
                  dynamicGrahamMargin >= 15 ? 'text-emerald-400' :
                  dynamicGrahamMargin >= 0 ? 'text-cyan-400' : 'text-rose-400'
                }`}>
                  {dynamicGrahamMargin >= 0 ? '+' : ''}{dynamicGrahamMargin}%
                </div>
              </div>
            </div>

            {/* Sliders for LPA and VPA */}
            <div className="space-y-2 pt-2 border-t border-slate-800/60">
              <div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>LPA (Lucro por Ação):</span>
                  <span className="font-mono text-slate-200">{currencySymbol} {simLpa.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max={Math.max(15, stock.fundamentals.lpa * 2.5)}
                  step="0.05"
                  value={simLpa}
                  onChange={(e) => setSimLpa(parseFloat(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>VPA (Patrimônio Líq. por Ação):</span>
                  <span className="font-mono text-slate-200">{currencySymbol} {simVpa.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max={Math.max(50, stock.fundamentals.vpa * 2.5)}
                  step="0.1"
                  value={simVpa}
                  onChange={(e) => setSimVpa(parseFloat(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Model 2: Décio Bazin */}
          <div className="bg-slate-950/80 rounded-lg p-4 border border-slate-800/90 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                <DollarSign className="w-4 h-4 text-cyan-400" />
                Método de Décio Bazin (Preço Teto 6%)
              </div>
              <span className="text-[10px] text-slate-500 font-mono">P_Teto = Dividendo / 0,06</span>
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-xs text-slate-400">Preço Teto Permitido</div>
                <div className="text-xl font-bold font-mono-numbers text-cyan-400">
                  {currencySymbol} {dynamicBazin.toFixed(2)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-400">Upside até o Teto</div>
                <div className={`text-base font-bold font-mono-numbers ${
                  dynamicBazinMargin >= 10 ? 'text-cyan-400' :
                  dynamicBazinMargin >= 0 ? 'text-slate-300' : 'text-rose-400'
                }`}>
                  {dynamicBazinMargin >= 0 ? '+' : ''}{dynamicBazinMargin}%
                </div>
              </div>
            </div>

            {/* Slider for Projected Dividend */}
            <div className="space-y-2 pt-2 border-t border-slate-800/60">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Dividendo Anual Estimado:</span>
                <span className="font-mono text-slate-200">{currencySymbol} {simDividend.toFixed(2)} / ação</span>
              </div>
              <input
                type="range"
                min="0.0"
                max={Math.max(8, stock.fundamentals.projectedAnnualDividend * 2.5)}
                step="0.05"
                value={simDividend}
                onChange={(e) => setSimDividend(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>

          {/* Algorithmic Quantitative Report Button (Zero Cost / No AI) */}
          <div className="pt-2">
            <button
              onClick={handleGenerateQuantReport}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-colors cursor-pointer"
            >
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>Gerar Parecer de Análise (Custo Zero &bull; Sem IA)</span>
            </button>
          </div>

        </div>

      </div>

      {/* Algorithmic Quantitative Report (when available) */}
      {quantReport && (
        <div className="bg-slate-900 border border-emerald-500/30 rounded-xl p-6 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white">
                Memorando Institucional de Investimento (Research)
              </h3>
            </div>
            <span className="text-xs text-emerald-400 font-mono">
              100% Algorítmico &bull; Custo Zero &bull; Metodologia Graham + Bazin + Técnico
            </span>
          </div>

          <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">
            {quantReport}
          </div>
        </div>
      )}

      {/* Full Fundamentals Breakdown Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h3 className="text-base font-bold text-white">
              Múltiplos Fundamentalistas & Indicadores Contábeis
            </h3>
          </div>
          <div className="text-xs text-slate-400">
            Score Fundamentalista: <b className="text-emerald-400 font-mono">{stock.fundamentalScore}/100</b>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 text-xs">
          
          <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800">
            <div className="text-slate-400">P/L (Preço / Lucro)</div>
            <div className="text-base font-bold font-mono-numbers text-slate-100 mt-1">
              {stock.fundamentals.peRatio.toFixed(1)}x
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {stock.fundamentals.peRatio < 10 ? 'Atrativo (< 10x)' : 'Neutro / Esticado'}
            </div>
          </div>

          <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800">
            <div className="text-slate-400">P/VP (Valor Patrimonial)</div>
            <div className="text-base font-bold font-mono-numbers text-slate-100 mt-1">
              {stock.fundamentals.pbRatio.toFixed(2)}x
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {stock.fundamentals.pbRatio < 1.5 ? 'Desconto no patrimônio' : 'Ágio de mercado'}
            </div>
          </div>

          <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800">
            <div className="text-slate-400">Dividend Yield (12M)</div>
            <div className="text-base font-bold font-mono-numbers text-emerald-400 mt-1">
              {stock.fundamentals.dividendYield.toFixed(1)}%
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {stock.fundamentals.dividendYield >= 6 ? 'Meta Bazin atingida' : 'Abaixo de 6% a.a.'}
            </div>
          </div>

          <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800">
            <div className="text-slate-400">ROE (Rentab. s/ Patrimônio)</div>
            <div className="text-base font-bold font-mono-numbers text-slate-100 mt-1">
              {stock.fundamentals.roe.toFixed(1)}%
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {stock.fundamentals.roe > 15 ? 'Alta eficiência (> 15%)' : 'Moderado'}
            </div>
          </div>

          <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800">
            <div className="text-slate-400">Margem Líquida</div>
            <div className="text-base font-bold font-mono-numbers text-slate-100 mt-1">
              {stock.fundamentals.netMargin.toFixed(1)}%
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Conversão de receita em lucro
            </div>
          </div>

          <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800">
            <div className="text-slate-400">Dívida Líquida / EBITDA</div>
            <div className="text-base font-bold font-mono-numbers text-slate-100 mt-1">
              {stock.fundamentals.netDebtEbitda.toFixed(1)}x
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {stock.fundamentals.netDebtEbitda <= 2.5 ? 'Endividamento seguro' : 'Alerta de alavancagem'}
            </div>
          </div>

          <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800">
            <div className="text-slate-400">EV / EBITDA</div>
            <div className="text-base font-bold font-mono-numbers text-slate-100 mt-1">
              {stock.fundamentals.evEbitda.toFixed(1)}x
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Valor da firma sobre caixa operacional
            </div>
          </div>

          <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800">
            <div className="text-slate-400">ROIC (Retorno Investido)</div>
            <div className="text-base font-bold font-mono-numbers text-slate-100 mt-1">
              {stock.fundamentals.roic.toFixed(1)}%
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Geração de valor acima do WACC
            </div>
          </div>

          <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800">
            <div className="text-slate-400">CAGR Lucros 5 Anos</div>
            <div className="text-base font-bold font-mono-numbers text-slate-100 mt-1">
              {stock.fundamentals.cagrProfits5y.toFixed(1)}%
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Crescimento composto histórico
            </div>
          </div>

          <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800">
            <div className="text-slate-400">Payout Ratio</div>
            <div className="text-base font-bold font-mono-numbers text-slate-100 mt-1">
              {stock.fundamentals.payoutRatio.toFixed(1)}%
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              % do lucro distribuído aos sócios
            </div>
          </div>

          <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800">
            <div className="text-slate-400">LPA Oficial</div>
            <div className="text-base font-bold font-mono-numbers text-slate-100 mt-1">
              {currencySymbol} {stock.fundamentals.lpa.toFixed(2)}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Lucro Líquido por Ação
            </div>
          </div>

          <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800">
            <div className="text-slate-400">VPA Oficial</div>
            <div className="text-base font-bold font-mono-numbers text-slate-100 mt-1">
              {currencySymbol} {stock.fundamentals.vpa.toFixed(2)}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Patrimônio Líquido por Ação
            </div>
          </div>

        </div>
      </div>

      {/* Highlights & Risks Callout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Highlights */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            Catalisadores & Pontos Fortes
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            {stock.highlights.map((h, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">&bull;</span>
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Risks */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-rose-400">
            <AlertTriangle className="w-4 h-4" />
            Riscos & Pontos de Atenção
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            {stock.risks.length > 0 ? (
              stock.risks.map((r, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-rose-400 mt-0.5">&bull;</span>
                  <span>{r}</span>
                </li>
              ))
            ) : (
              <li className="text-slate-400">Nenhum risco de severidade alta detectado nos parâmetros padrão.</li>
            )}
          </ul>
        </div>

      </div>

    </div>
  );
};
