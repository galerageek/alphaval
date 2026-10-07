import React, { useState, useMemo } from 'react';
import { StockEvaluation } from '../types/stock';
import { 
  Search, 
  ArrowUpRight, 
  ArrowDownRight, 
  TrendingUp, 
  ShieldCheck, 
  DollarSign, 
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';

interface StockOverviewProps {
  stocks: StockEvaluation[];
  onSelectStock: (stock: StockEvaluation) => void;
  onNavigateToDetail: () => void;
}

export const StockOverview: React.FC<StockOverviewProps> = ({
  stocks,
  onSelectStock,
  onNavigateToDetail,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [marketFilter, setMarketFilter] = useState<'ALL' | 'BR' | 'US' | 'DIVIDENDS' | 'VALUE'>('ALL');

  const filteredStocks = useMemo(() => {
    return stocks.filter(stock => {
      const matchesSearch = 
        stock.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.sector.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      if (marketFilter === 'BR') return stock.country === 'BR';
      if (marketFilter === 'US') return stock.country === 'US';
      if (marketFilter === 'DIVIDENDS') return stock.fundamentals.dividendYield >= 6.0;
      if (marketFilter === 'VALUE') return stock.valuation.grahamMarginOfSafety >= 10.0;
      return true;
    });
  }, [stocks, searchTerm, marketFilter]);

  const handleStockClick = (stock: StockEvaluation) => {
    onSelectStock(stock);
    onNavigateToDetail();
  };

  const getRecommendationBadge = (rec: string) => {
    switch (rec) {
      case 'STRONG_BUY':
        return { text: 'Forte Compra', bg: 'bg-emerald-950/70 text-emerald-300 border-emerald-800' };
      case 'BUY':
        return { text: 'Compra', bg: 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60' };
      case 'HOLD':
        return { text: 'Manter / Neutro', bg: 'bg-amber-950/60 text-amber-300 border-amber-800' };
      case 'SELL':
        return { text: 'Venda', bg: 'bg-rose-950/40 text-rose-300 border-rose-800/60' };
      default:
        return { text: 'Forte Venda', bg: 'bg-rose-950/80 text-rose-400 border-rose-800' };
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Macro Indicators Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3">
          <div className="text-xs text-slate-400">Ibovespa (B3)</div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="font-mono-numbers text-lg font-bold text-slate-100">132.480</span>
            <span className="text-xs font-mono-numbers text-emerald-400 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> +0,64%
            </span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3">
          <div className="text-xs text-slate-400">S&P 500</div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="font-mono-numbers text-lg font-bold text-slate-100">5.864</span>
            <span className="text-xs font-mono-numbers text-emerald-400 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> +0,42%
            </span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3">
          <div className="text-xs text-slate-400">Dólar PTAX</div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="font-mono-numbers text-lg font-bold text-slate-100">R$ 5,44</span>
            <span className="text-xs font-mono-numbers text-rose-400 flex items-center">
              <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" /> -0,38%
            </span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3">
          <div className="text-xs text-slate-400">Taxa Selic Meta</div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="font-mono-numbers text-lg font-bold text-slate-100">10,75% a.a.</span>
            <span className="text-xs text-slate-400">Copom</span>
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between border-b border-slate-800/80 pb-4">
        
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por código (ex: BBAS3, VALE3) ou empresa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        {/* Filter Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800 overflow-x-auto">
          <button
            onClick={() => setMarketFilter('ALL')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
              marketFilter === 'ALL'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Todas ({stocks.length})
          </button>
          <button
            onClick={() => setMarketFilter('BR')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
              marketFilter === 'BR'
                ? 'bg-slate-800 text-emerald-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            B3 Brasil
          </button>
          <button
            onClick={() => setMarketFilter('US')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
              marketFilter === 'US'
                ? 'bg-slate-800 text-cyan-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            EUA / Globais
          </button>
          <button
            onClick={() => setMarketFilter('DIVIDENDS')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
              marketFilter === 'DIVIDENDS'
                ? 'bg-slate-800 text-emerald-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Dividendos &gt; 6%
          </button>
          <button
            onClick={() => setMarketFilter('VALUE')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
              marketFilter === 'VALUE'
                ? 'bg-slate-800 text-amber-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Graham c/ Margem
          </button>
        </div>

      </div>

      {/* Stocks Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredStocks.map((stock) => {
          const badge = getRecommendationBadge(stock.recommendation);
          const isGrahamDiscount = stock.valuation.grahamMarginOfSafety > 0;
          const isBazinDiscount = stock.valuation.bazinMarginOfSafety > 0;
          const currencySymbol = stock.fundamentals.currency === 'BRL' ? 'R$' : 'US$';

          return (
            <div
              key={stock.ticker}
              onClick={() => handleStockClick(stock)}
              className="bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 rounded-xl p-5 transition-all duration-200 flex flex-col justify-between hover:shadow-lg hover:shadow-emerald-950/20 cursor-pointer group"
            >
              <div>
                {/* Header Row */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold font-mono tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                        {stock.ticker}
                      </span>
                      <span className="text-xs text-slate-500">
                        {stock.country === 'BR' ? 'B3' : 'NASDAQ/NYSE'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 line-clamp-1">{stock.name} &middot; {stock.sector}</div>
                  </div>

                  <div className={`px-2.5 py-1 text-xs font-semibold rounded-md border ${badge.bg}`}>
                    {badge.text}
                  </div>
                </div>

                {/* Price and Composite Score */}
                <div className="mt-4 flex items-baseline justify-between border-b border-slate-800/80 pb-3">
                  <div>
                    <div className="text-xs text-slate-400">Cotação Atual</div>
                    <div className="text-2xl font-bold font-mono-numbers text-slate-100">
                      {currencySymbol} {stock.fundamentals.currentPrice.toFixed(2)}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-slate-400">Score Quant</div>
                    <div className="flex items-center justify-end gap-1">
                      <span className={`text-xl font-bold font-mono-numbers ${
                        stock.compositeScore >= 70 ? 'text-emerald-400' :
                        stock.compositeScore >= 50 ? 'text-amber-400' : 'text-rose-400'
                      }`}>
                        {stock.compositeScore}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">/100</span>
                    </div>
                  </div>
                </div>

                {/* Key Valuation Metrics */}
                <div className="mt-4 space-y-2 text-xs">
                  
                  {/* Graham Model */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                      Preço Justo (Graham):
                    </span>
                    <span className={`font-mono-numbers font-medium ${isGrahamDiscount ? 'text-emerald-400' : 'text-slate-300'}`}>
                      {currencySymbol} {stock.valuation.grahamFairValue.toFixed(2)} 
                      <span className="ml-1 text-[11px] opacity-80">
                        ({stock.valuation.grahamMarginOfSafety >= 0 ? '+' : ''}{stock.valuation.grahamMarginOfSafety}%)
                      </span>
                    </span>
                  </div>

                  {/* Bazin Model */}
                  {stock.fundamentals.projectedAnnualDividend > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5 text-slate-500" />
                        Preço Teto (Bazin 6%):
                      </span>
                      <span className={`font-mono-numbers font-medium ${isBazinDiscount ? 'text-cyan-400' : 'text-slate-300'}`}>
                        {currencySymbol} {stock.valuation.bazinCeilingPrice.toFixed(2)}
                        <span className="ml-1 text-[11px] opacity-80">
                          ({stock.valuation.bazinMarginOfSafety >= 0 ? '+' : ''}{stock.valuation.bazinMarginOfSafety}%)
                        </span>
                      </span>
                    </div>
                  )}

                  {/* Multiples Row */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/50">
                    <span className="text-slate-400">DY (12M) / ROE:</span>
                    <span className="font-mono-numbers text-slate-200">
                      <span className="text-emerald-400 font-semibold">{stock.fundamentals.dividendYield.toFixed(1)}%</span> &middot; {stock.fundamentals.roe.toFixed(1)}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">P/L &middot; P/VP:</span>
                    <span className="font-mono-numbers text-slate-200">
                      {stock.fundamentals.peRatio.toFixed(1)}x &middot; {stock.fundamentals.pbRatio.toFixed(2)}x
                    </span>
                  </div>

                  {/* Technicals Row */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5 text-slate-500" />
                      IFR/RSI (14) &middot; Médias:
                    </span>
                    <span className="font-mono-numbers text-slate-200">
                      <span className={stock.technicals.rsi14 < 35 ? 'text-emerald-400 font-bold' : stock.technicals.rsi14 > 70 ? 'text-rose-400 font-bold' : ''}>
                        {stock.technicals.rsi14}
                      </span>
                      <span className="text-slate-500 ml-1">
                        {stock.fundamentals.currentPrice > stock.technicals.sma50 ? '▲ > SMA50' : '▼ < SMA50'}
                      </span>
                    </span>
                  </div>

                </div>
              </div>

              {/* Card Footer Action */}
              <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400/80" />
                  {stock.highlights[0] || 'Análise completa disponível'}
                </span>
                <span className="text-emerald-400 group-hover:translate-x-0.5 transition-transform font-medium">
                  Ver Raio-X &rarr;
                </span>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
