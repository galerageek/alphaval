import React, { useState, useMemo } from 'react';
import { StockEvaluation } from '../types/stock';
import { 
  SlidersHorizontal, 
  ArrowUpDown, 
  Download, 
  RotateCcw,
  Check,
  ExternalLink
} from 'lucide-react';

interface StockScreenerProps {
  stocks: StockEvaluation[];
  onSelectStock: (stock: StockEvaluation) => void;
  onNavigateToDetail: () => void;
}

type SortField = 'ticker' | 'currentPrice' | 'compositeScore' | 'dividendYield' | 'grahamMarginOfSafety' | 'bazinMarginOfSafety' | 'peRatio' | 'roe' | 'rsi14';

export const StockScreener: React.FC<StockScreenerProps> = ({
  stocks,
  onSelectStock,
  onNavigateToDetail,
}) => {
  // Screener Filters
  const [minDY, setMinDY] = useState<number>(0);
  const [maxPL, setMaxPL] = useState<number>(40);
  const [minROE, setMinROE] = useState<number>(0);
  const [maxNetDebt, setMaxNetDebt] = useState<number>(4.0);
  const [onlyPositiveGraham, setOnlyPositiveGraham] = useState<boolean>(false);
  const [onlyBelowBazin, setOnlyBelowBazin] = useState<boolean>(false);
  const [rsiFilter, setRsiFilter] = useState<'ALL' | 'OVERSOLD' | 'NEUTRAL' | 'OVERBOUGHT'>('ALL');

  // Sorting
  const [sortField, setSortField] = useState<SortField>('compositeScore');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleResetFilters = () => {
    setMinDY(0);
    setMaxPL(40);
    setMinROE(0);
    setMaxNetDebt(4.0);
    setOnlyPositiveGraham(false);
    setOnlyBelowBazin(false);
    setRsiFilter('ALL');
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filteredAndSortedStocks = useMemo(() => {
    const filtered = stocks.filter(s => {
      if (s.fundamentals.dividendYield < minDY) return false;
      if (s.fundamentals.peRatio > maxPL && s.fundamentals.peRatio > 0) return false;
      if (s.fundamentals.roe < minROE) return false;
      if (s.fundamentals.netDebtEbitda > maxNetDebt) return false;
      if (onlyPositiveGraham && s.valuation.grahamMarginOfSafety <= 0) return false;
      if (onlyBelowBazin && s.valuation.bazinMarginOfSafety <= 0) return false;

      if (rsiFilter === 'OVERSOLD' && s.technicals.rsi14 >= 35) return false;
      if (rsiFilter === 'OVERBOUGHT' && s.technicals.rsi14 <= 65) return false;
      if (rsiFilter === 'NEUTRAL' && (s.technicals.rsi14 < 35 || s.technicals.rsi14 > 65)) return false;

      return true;
    });

    return filtered.sort((a, b) => {
      let valA: number | string = 0;
      let valB: number | string = 0;

      switch (sortField) {
        case 'ticker':
          valA = a.ticker;
          valB = b.ticker;
          break;
        case 'currentPrice':
          valA = a.fundamentals.currentPrice;
          valB = b.fundamentals.currentPrice;
          break;
        case 'compositeScore':
          valA = a.compositeScore;
          valB = b.compositeScore;
          break;
        case 'dividendYield':
          valA = a.fundamentals.dividendYield;
          valB = b.fundamentals.dividendYield;
          break;
        case 'grahamMarginOfSafety':
          valA = a.valuation.grahamMarginOfSafety;
          valB = b.valuation.grahamMarginOfSafety;
          break;
        case 'bazinMarginOfSafety':
          valA = a.valuation.bazinMarginOfSafety;
          valB = b.valuation.bazinMarginOfSafety;
          break;
        case 'peRatio':
          valA = a.fundamentals.peRatio;
          valB = b.fundamentals.peRatio;
          break;
        case 'roe':
          valA = a.fundamentals.roe;
          valB = b.fundamentals.roe;
          break;
        case 'rsi14':
          valA = a.technicals.rsi14;
          valB = b.technicals.rsi14;
          break;
      }

      if (typeof valA === 'string') {
        return sortDirection === 'asc' 
          ? (valA as string).localeCompare(valB as string)
          : (valB as string).localeCompare(valA as string);
      }

      return sortDirection === 'asc' ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
    });
  }, [
    stocks,
    minDY,
    maxPL,
    minROE,
    maxNetDebt,
    onlyPositiveGraham,
    onlyBelowBazin,
    rsiFilter,
    sortField,
    sortDirection,
  ]);

  const handleExportCSV = () => {
    const headers = ['Ticker', 'Empresa', 'Setor', 'Preco', 'Score', 'Recomendacao', 'Graham', 'Graham_Margem_%', 'Bazin_Teto', 'Bazin_Margem_%', 'DY_%', 'PL', 'ROE_%', 'Divida_EBITDA', 'RSI_14'];
    const rows = filteredAndSortedStocks.map(s => [
      s.ticker,
      `"${s.name}"`,
      `"${s.sector}"`,
      s.fundamentals.currentPrice,
      s.compositeScore,
      s.recommendation,
      s.valuation.grahamFairValue,
      s.valuation.grahamMarginOfSafety,
      s.valuation.bazinCeilingPrice,
      s.valuation.bazinMarginOfSafety,
      s.fundamentals.dividendYield,
      s.fundamentals.peRatio,
      s.fundamentals.roe,
      s.fundamentals.netDebtEbitda,
      s.technicals.rsi14,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `alphaval_screener_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Header and Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
            <h2 className="text-base font-bold text-white">
              Filtro Quantitativo & Screener de Ativos
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetFilters}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 px-2.5 py-1.5 rounded bg-slate-800 border border-slate-700 cursor-pointer transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Limpar Filtros
            </button>
            <button
              onClick={handleExportCSV}
              className="text-xs text-slate-900 font-semibold flex items-center gap-1 px-3 py-1.5 rounded bg-emerald-400 hover:bg-emerald-300 cursor-pointer transition shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              Exportar CSV
            </button>
          </div>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          
          {/* Min Dividend Yield */}
          <div className="space-y-1.5 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
            <div className="flex justify-between text-slate-400">
              <span>Dividend Yield Mínimo:</span>
              <span className="font-mono text-emerald-400 font-semibold">{minDY}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="14"
              step="0.5"
              value={minDY}
              onChange={(e) => setMinDY(parseFloat(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer"
            />
          </div>

          {/* Max P/L */}
          <div className="space-y-1.5 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
            <div className="flex justify-between text-slate-400">
              <span>P/L Máximo:</span>
              <span className="font-mono text-slate-200 font-semibold">{maxPL}x</span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              step="1"
              value={maxPL}
              onChange={(e) => setMaxPL(parseFloat(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer"
            />
          </div>

          {/* Min ROE */}
          <div className="space-y-1.5 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
            <div className="flex justify-between text-slate-400">
              <span>ROE Mínimo:</span>
              <span className="font-mono text-cyan-400 font-semibold">{minROE}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="35"
              step="1"
              value={minROE}
              onChange={(e) => setMinROE(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Max Net Debt / EBITDA */}
          <div className="space-y-1.5 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
            <div className="flex justify-between text-slate-400">
              <span>Dívida Líq./EBITDA Máx:</span>
              <span className="font-mono text-amber-400 font-semibold">{maxNetDebt}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="5.0"
              step="0.1"
              value={maxNetDebt}
              onChange={(e) => setMaxNetDebt(parseFloat(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>

        </div>

        {/* Checkbox and Category Toggles */}
        <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
          <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={onlyPositiveGraham}
              onChange={(e) => setOnlyPositiveGraham(e.target.checked)}
              className="rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-0 w-4 h-4 cursor-pointer"
            />
            <span>Apenas com Margem de Graham positiva (&gt; 0%)</span>
          </label>

          <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={onlyBelowBazin}
              onChange={(e) => setOnlyBelowBazin(e.target.checked)}
              className="rounded bg-slate-950 border-slate-700 text-cyan-500 focus:ring-0 w-4 h-4 cursor-pointer"
            />
            <span>Apenas abaixo do Preço Teto de Bazin (DY &ge; 6%)</span>
          </label>

          {/* RSI State Toggle */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded border border-slate-800 ml-auto">
            <span className="text-slate-500 px-1 text-[11px]">RSI (14):</span>
            <button
              onClick={() => setRsiFilter('ALL')}
              className={`px-2 py-0.5 rounded text-[11px] cursor-pointer ${rsiFilter === 'ALL' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400'}`}
            >
              Todos
            </button>
            <button
              onClick={() => setRsiFilter('OVERSOLD')}
              className={`px-2 py-0.5 rounded text-[11px] cursor-pointer ${rsiFilter === 'OVERSOLD' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'text-slate-400'}`}
            >
              Sobrevendido (&lt;35)
            </button>
            <button
              onClick={() => setRsiFilter('NEUTRAL')}
              className={`px-2 py-0.5 rounded text-[11px] cursor-pointer ${rsiFilter === 'NEUTRAL' ? 'bg-slate-800 text-slate-200' : 'text-slate-400'}`}
            >
              Neutro (35-65)
            </button>
            <button
              onClick={() => setRsiFilter('OVERBOUGHT')}
              className={`px-2 py-0.5 rounded text-[11px] cursor-pointer ${rsiFilter === 'OVERBOUGHT' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'text-slate-400'}`}
            >
              Sobrecomprado (&gt;65)
            </button>
          </div>
        </div>

      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <div>
          Encontrados <b className="text-white font-mono">{filteredAndSortedStocks.length}</b> ativos com os critérios aplicados.
        </div>
        <div>
          Clique no cabeçalho da coluna para ordenar.
        </div>
      </div>

      {/* High-Density Data Grid Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase font-mono tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 cursor-pointer hover:text-slate-200" onClick={() => handleSort('ticker')}>
                  <div className="flex items-center gap-1">
                    Ativo <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 text-right cursor-pointer hover:text-slate-200" onClick={() => handleSort('currentPrice')}>
                  <div className="flex items-center justify-end gap-1">
                    Preço <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 text-right cursor-pointer hover:text-slate-200" onClick={() => handleSort('compositeScore')}>
                  <div className="flex items-center justify-end gap-1">
                    Score Quant <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center">Recomendação</th>
                <th className="py-3 px-4 text-right cursor-pointer hover:text-slate-200" onClick={() => handleSort('grahamMarginOfSafety')}>
                  <div className="flex items-center justify-end gap-1">
                    Graham VI (Margem) <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 text-right cursor-pointer hover:text-slate-200" onClick={() => handleSort('bazinMarginOfSafety')}>
                  <div className="flex items-center justify-end gap-1">
                    Bazin Teto (Margem) <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 text-right cursor-pointer hover:text-slate-200" onClick={() => handleSort('dividendYield')}>
                  <div className="flex items-center justify-end gap-1">
                    DY (12M) <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 text-right cursor-pointer hover:text-slate-200" onClick={() => handleSort('peRatio')}>
                  <div className="flex items-center justify-end gap-1">
                    P/L <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 text-right cursor-pointer hover:text-slate-200" onClick={() => handleSort('roe')}>
                  <div className="flex items-center justify-end gap-1">
                    ROE <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 text-right cursor-pointer hover:text-slate-200" onClick={() => handleSort('rsi14')}>
                  <div className="flex items-center justify-end gap-1">
                    RSI (14) <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredAndSortedStocks.length > 0 ? (
                filteredAndSortedStocks.map((stock) => {
                  const currSym = stock.fundamentals.currency === 'BRL' ? 'R$' : 'US$';

                  return (
                    <tr 
                      key={stock.ticker}
                      className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                      onClick={() => {
                        onSelectStock(stock);
                        onNavigateToDetail();
                      }}
                    >
                      {/* Ticker & Name */}
                      <td className="py-3 px-4">
                        <div className="font-bold font-mono text-white group-hover:text-emerald-400 transition-colors">
                          {stock.ticker}
                        </div>
                        <div className="text-[11px] text-slate-400 line-clamp-1">
                          {stock.name} &middot; {stock.sector}
                        </div>
                      </td>

                      {/* Current Price */}
                      <td className="py-3 px-4 text-right font-mono-numbers font-medium text-slate-100">
                        {currSym} {stock.fundamentals.currentPrice.toFixed(2)}
                      </td>

                      {/* Composite Score */}
                      <td className="py-3 px-4 text-right font-mono-numbers font-bold">
                        <span className={
                          stock.compositeScore >= 70 ? 'text-emerald-400' :
                          stock.compositeScore >= 50 ? 'text-amber-400' : 'text-rose-400'
                        }>
                          {stock.compositeScore}
                        </span>
                        <span className="text-slate-500 font-normal text-[11px]">/100</span>
                      </td>

                      {/* Recommendation */}
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded ${
                          stock.recommendation === 'STRONG_BUY' ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800' :
                          stock.recommendation === 'BUY' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/50' :
                          stock.recommendation === 'HOLD' ? 'bg-amber-950/60 text-amber-300 border border-amber-800' :
                          'bg-rose-950/70 text-rose-300 border border-rose-800'
                        }`}>
                          {stock.recommendation === 'STRONG_BUY' ? 'FORTE COMPRA' :
                           stock.recommendation === 'BUY' ? 'COMPRA' :
                           stock.recommendation === 'HOLD' ? 'MANTER' :
                           stock.recommendation === 'SELL' ? 'VENDA' : 'FORTE VENDA'}
                        </span>
                      </td>

                      {/* Graham VI & Margin */}
                      <td className="py-3 px-4 text-right font-mono-numbers">
                        <div>{currSym} {stock.valuation.grahamFairValue.toFixed(2)}</div>
                        <div className={`text-[10px] ${stock.valuation.grahamMarginOfSafety >= 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                          ({stock.valuation.grahamMarginOfSafety >= 0 ? '+' : ''}{stock.valuation.grahamMarginOfSafety}%)
                        </div>
                      </td>

                      {/* Bazin Ceiling */}
                      <td className="py-3 px-4 text-right font-mono-numbers">
                        {stock.fundamentals.projectedAnnualDividend > 0 ? (
                          <>
                            <div>{currSym} {stock.valuation.bazinCeilingPrice.toFixed(2)}</div>
                            <div className={`text-[10px] ${stock.valuation.bazinMarginOfSafety >= 0 ? 'text-cyan-400' : 'text-slate-400'}`}>
                              ({stock.valuation.bazinMarginOfSafety >= 0 ? '+' : ''}{stock.valuation.bazinMarginOfSafety}%)
                            </div>
                          </>
                        ) : (
                          <span className="text-slate-500">N/A</span>
                        )}
                      </td>

                      {/* Dividend Yield */}
                      <td className="py-3 px-4 text-right font-mono-numbers text-emerald-400 font-semibold">
                        {stock.fundamentals.dividendYield.toFixed(1)}%
                      </td>

                      {/* P/L */}
                      <td className="py-3 px-4 text-right font-mono-numbers text-slate-200">
                        {stock.fundamentals.peRatio.toFixed(1)}x
                      </td>

                      {/* ROE */}
                      <td className="py-3 px-4 text-right font-mono-numbers text-slate-200">
                        {stock.fundamentals.roe.toFixed(1)}%
                      </td>

                      {/* RSI (14) */}
                      <td className="py-3 px-4 text-right font-mono-numbers">
                        <span className={stock.technicals.rsi14 < 35 ? 'text-emerald-400 font-bold' : stock.technicals.rsi14 > 65 ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                          {stock.technicals.rsi14}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-center">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectStock(stock);
                            onNavigateToDetail();
                          }}
                          className="px-2 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 rounded transition cursor-pointer"
                        >
                          Raio-X &rarr;
                        </button>
                      </td>

                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-500">
                    Nenhum ativo atendeu a todos os critérios selecionados no filtro. Tente flexibilizar os parâmetros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
