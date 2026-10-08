import React, { useState, useMemo, useEffect } from 'react';
import { StockEvaluation, InvestmentStrategy, UserPortfolioItem } from '../types/stock';
import { 
  PieChart, 
  Coins, 
  TrendingUp, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight,
  PlusCircle,
  Trash2,
  Edit2,
  Check,
  X,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Briefcase,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  RotateCcw
} from 'lucide-react';

interface PortfolioSimulatorProps {
  stocks: StockEvaluation[];
  onSelectStock: (stock: StockEvaluation) => void;
  onNavigateToDetail: () => void;
}

const STORAGE_PORTFOLIO_KEY = 'alphaval_user_portfolio_items';

// Carteira de exemplo inicial para carregar de imediato caso o usuário ainda não tenha adicionado
const DEFAULT_PORTFOLIO_ITEMS: UserPortfolioItem[] = [
  { id: '1', ticker: 'BBAS3', quantity: 200, averagePrice: 26.50, addedAt: new Date().toISOString() },
  { id: '2', ticker: 'TAEE11', quantity: 150, averagePrice: 33.80, addedAt: new Date().toISOString() },
  { id: '3', ticker: 'ITUB4', quantity: 100, averagePrice: 33.20, addedAt: new Date().toISOString() },
  { id: '4', ticker: 'VALE3', quantity: 80, averagePrice: 56.50, addedAt: new Date().toISOString() },
];

export const PortfolioSimulator: React.FC<PortfolioSimulatorProps> = ({
  stocks,
  onSelectStock,
  onNavigateToDetail,
}) => {
  // Navigation between User Portfolio Evaluator and Pre-built Models
  const [subTab, setSubTab] = useState<'MY_PORTFOLIO' | 'MODELS'>('MY_PORTFOLIO');

  // User Portfolio Items
  const [portfolioItems, setPortfolioItems] = useState<UserPortfolioItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_PORTFOLIO_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Erro ao carregar carteira:', e);
    }
    return DEFAULT_PORTFOLIO_ITEMS;
  });

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PORTFOLIO_KEY, JSON.stringify(portfolioItems));
    } catch (e) {
      console.warn('Erro ao salvar carteira:', e);
    }
  }, [portfolioItems]);

  // Modal / Form state for adding new asset to user portfolio
  const [isAddAssetOpen, setIsAddAssetOpen] = useState(false);
  const [selectedTickerToAdd, setSelectedTickerToAdd] = useState(stocks[0]?.ticker || 'BBAS3');
  const [inputQuantity, setInputQuantity] = useState('100');
  const [inputAveragePrice, setInputAveragePrice] = useState('27.00');

  // Editing inline state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQty, setEditQty] = useState('');
  const [editPrice, setEditPrice] = useState('');

  // Compound interest simulator inputs (for Models tab)
  const [selectedStrategy, setSelectedStrategy] = useState<InvestmentStrategy>('DIVIDENDS');
  const [initialCapital, setInitialCapital] = useState<number>(10000);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(1500);
  const [years, setYears] = useState<number>(10);
  const [expectedReturnRate, setExpectedReturnRate] = useState<number>(12);
  const [reinvestDividends, setReinvestDividends] = useState<boolean>(true);

  // Update input average price when ticker select changes
  const handleTickerSelectChange = (ticker: string) => {
    setSelectedTickerToAdd(ticker);
    const stock = stocks.find(s => s.ticker === ticker);
    if (stock) {
      setInputAveragePrice(stock.fundamentals.currentPrice.toFixed(2));
    }
  };

  const handleAddAsset = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(inputQuantity) || 1;
    const price = parseFloat(inputAveragePrice) || 10;

    const existingIndex = portfolioItems.findIndex(i => i.ticker === selectedTickerToAdd);
    if (existingIndex >= 0) {
      // Rebalance / average down existing
      const existing = portfolioItems[existingIndex];
      const newTotalQty = existing.quantity + qty;
      const newAvgPrice = ((existing.quantity * existing.averagePrice) + (qty * price)) / newTotalQty;
      
      const updated = [...portfolioItems];
      updated[existingIndex] = {
        ...existing,
        quantity: newTotalQty,
        averagePrice: Number(newAvgPrice.toFixed(2)),
      };
      setPortfolioItems(updated);
    } else {
      const newItem: UserPortfolioItem = {
        id: `item-${Date.now()}`,
        ticker: selectedTickerToAdd,
        quantity: qty,
        averagePrice: price,
        addedAt: new Date().toISOString(),
      };
      setPortfolioItems(prev => [newItem, ...prev]);
    }

    setIsAddAssetOpen(false);
  };

  const handleStartEdit = (item: UserPortfolioItem) => {
    setEditingId(item.id);
    setEditQty(item.quantity.toString());
    setEditPrice(item.averagePrice.toString());
  };

  const handleSaveEdit = (id: string) => {
    const q = parseInt(editQty) || 1;
    const p = parseFloat(editPrice) || 1;
    setPortfolioItems(prev => prev.map(item => item.id === id ? { ...item, quantity: q, averagePrice: p } : item));
    setEditingId(null);
  };

  const handleDeleteItem = (id: string) => {
    setPortfolioItems(prev => prev.filter(i => i.id !== id));
  };

  const handleResetToExample = () => {
    setPortfolioItems(DEFAULT_PORTFOLIO_ITEMS);
  };

  // Evaluate user portfolio metrics in real-time
  const portfolioAnalysis = useMemo(() => {
    let totalInvestedCost = 0;
    let totalCurrentValue = 0;
    let totalAnnualDividendProjected = 0;
    let weightedScoreSum = 0;

    const evaluatedItems = portfolioItems.map(item => {
      const stock = stocks.find(s => s.ticker === item.ticker);
      const currentPrice = stock ? stock.fundamentals.currentPrice : item.averagePrice;
      const positionCost = item.quantity * item.averagePrice;
      const positionCurrentValue = item.quantity * currentPrice;
      const positionProfit = positionCurrentValue - positionCost;
      const positionProfitPercent = positionCost > 0 ? (positionProfit / positionCost) * 100 : 0;
      
      const annualDivPerShare = stock ? stock.fundamentals.projectedAnnualDividend : 0;
      const positionAnnualDividend = item.quantity * annualDivPerShare;

      totalInvestedCost += positionCost;
      totalCurrentValue += positionCurrentValue;
      totalAnnualDividendProjected += positionAnnualDividend;

      if (stock) {
        weightedScoreSum += stock.compositeScore * positionCurrentValue;
      }

      return {
        ...item,
        stock,
        currentPrice,
        positionCost,
        positionCurrentValue,
        positionProfit,
        positionProfitPercent,
        positionAnnualDividend,
      };
    });

    const totalProfit = totalCurrentValue - totalInvestedCost;
    const totalProfitPercent = totalInvestedCost > 0 ? (totalProfit / totalInvestedCost) * 100 : 0;
    const monthlyDividendProjected = totalAnnualDividendProjected / 12;
    const yieldOnCost = totalInvestedCost > 0 ? (totalAnnualDividendProjected / totalInvestedCost) * 100 : 0;
    const currentYield = totalCurrentValue > 0 ? (totalAnnualDividendProjected / totalCurrentValue) * 100 : 0;
    const portfolioScore = totalCurrentValue > 0 ? Math.round(weightedScoreSum / totalCurrentValue) : 70;

    // Sector breakdown
    const sectorMap: Record<string, number> = {};
    for (const item of evaluatedItems) {
      const sector = item.stock?.sector || 'Outros';
      sectorMap[sector] = (sectorMap[sector] || 0) + item.positionCurrentValue;
    }

    const sectors = Object.entries(sectorMap).map(([sector, val]) => ({
      sector,
      value: val,
      percent: totalCurrentValue > 0 ? Number(((val / totalCurrentValue) * 100).toFixed(1)) : 0,
    })).sort((a, b) => b.value - a.value);

    // Rebalancing & opportunity suggestions
    const opportunities = evaluatedItems
      .filter(i => i.stock && i.stock.valuation.grahamMarginOfSafety > 0)
      .sort((a, b) => (b.stock?.valuation.grahamMarginOfSafety || 0) - (a.stock?.valuation.grahamMarginOfSafety || 0));

    const ceilingAlerts = evaluatedItems
      .filter(i => i.stock && i.stock.fundamentals.projectedAnnualDividend > 0 && i.currentPrice > i.stock.valuation.bazinCeilingPrice);

    return {
      evaluatedItems,
      totalInvestedCost,
      totalCurrentValue,
      totalProfit,
      totalProfitPercent,
      totalAnnualDividendProjected,
      monthlyDividendProjected,
      yieldOnCost,
      currentYield,
      portfolioScore,
      sectors,
      opportunities,
      ceilingAlerts,
    };
  }, [portfolioItems, stocks]);

  // Strategy preset configurations (for Models tab)
  const strategyInfo = useMemo(() => {
    switch (selectedStrategy) {
      case 'DIVIDENDS':
        return {
          title: 'Carteira Previdenciária & Renda Passiva (Décio Bazin)',
          description: 'Foco em empresas pagadoras de dividendos perenes, com DY > 6%, dívida controlada (Dívida Líq./EBITDA < 2.5x) e longo histórico de lucros.',
          allocations: [
            { ticker: 'BBAS3', weight: 30, rationale: 'DY de 9.8%, P/L de 4.3x, payout sustentável' },
            { ticker: 'TAEE11', weight: 25, rationale: 'Transmissora de energia, receita previsível com DY 8.7%' },
            { ticker: 'ITUB4', weight: 25, rationale: 'Maior banco privado, ROE de 21.9% e proventos mensais' },
            { ticker: 'VALE3', weight: 20, rationale: 'Commodity global geradora de caixa livre com DY de 9.4%' },
          ],
          averageDY: 8.8,
          averageScore: 78,
        };
      case 'VALUE':
        return {
          title: 'Carteira Value Investing (Benjamin Graham)',
          description: 'Foco estrito em margem de segurança quantitativa, ativos negociando com desconto substancial sobre valor patrimonial e lucros consistentes.',
          allocations: [
            { ticker: 'BBAS3', weight: 35, rationale: 'Preço Justo Graham com +28% de margem e P/VP 0.78' },
            { ticker: 'VALE3', weight: 25, rationale: 'Margem de segurança substancial com múltiplos desregulados' },
            { ticker: 'PETR4', weight: 20, rationale: 'P/L de 4.8x e forte geração de fluxo de caixa' },
            { ticker: 'ITUB4', weight: 20, rationale: 'Balanço fortaleza negociando abaixo do múltiplo histórico' },
          ],
          averageDY: 10.1,
          averageScore: 79,
        };
      case 'GROWTH':
        return {
          title: 'Carteira Crescimento & Alta Eficiência (Growth / ROE)',
          description: 'Foco em companhias líderes em seus mercados com ROE superior a 20%, alto CAGR de receita e reinvestimento eficiente de capital.',
          allocations: [
            { ticker: 'WEGE3', weight: 30, rationale: 'ROE de 33.6%, transição energética e presença global' },
            { ticker: 'PRIO3', weight: 25, rationale: 'CAGR de lucros 42%, eficiência máxima na extração' },
            { ticker: 'NVDA', weight: 25, rationale: 'Monopólio de semicondutores de IA com margens de 55%' },
            { ticker: 'MSFT', weight: 20, rationale: 'Ecossistema dominante em Nuvem e Software Corporativo' },
          ],
          averageDY: 0.8,
          averageScore: 74,
        };
      default: // BALANCED
        return {
          title: 'Carteira Balanceada Multiestratégia',
          description: 'Equilíbrio ideal entre geração recorrente de dividendos para proteção e ativos de crescimento para expansão do poder de compra.',
          allocations: [
            { ticker: 'BBAS3', weight: 25, rationale: 'Âncora de dividendos e valor' },
            { ticker: 'ITUB4', weight: 25, rationale: 'Resiliência financeira' },
            { ticker: 'WEGE3', weight: 25, rationale: 'Motor de valorização industrial' },
            { ticker: 'AAPL', weight: 25, rationale: 'Exposição cambial em dólar e marca global' },
          ],
          averageDY: 4.8,
          averageScore: 76,
        };
    }
  }, [selectedStrategy]);

  // Simulation calculation (for Models tab)
  const simulationResults = useMemo(() => {
    const monthlyRate = Math.pow(1 + (expectedReturnRate / 100), 1 / 12) - 1;
    const totalMonths = years * 12;

    let balance = initialCapital;
    let totalInvested = initialCapital;
    let snowballMonth = -1;

    for (let m = 1; m <= totalMonths; m++) {
      const monthYield = balance * monthlyRate;
      if (snowballMonth === -1 && monthYield >= monthlyContribution) {
        snowballMonth = m;
      }
      if (reinvestDividends) {
        balance = balance + monthYield + monthlyContribution;
      } else {
        balance = balance + monthlyContribution;
      }
      totalInvested += monthlyContribution;
    }

    const finalBalance = Math.round(balance);
    const finalMonthlyDividend = Math.round(finalBalance * (strategyInfo.averageDY / 100 / 12));

    return {
      finalBalance,
      totalInvested,
      finalMonthlyDividend,
      snowballYear: snowballMonth !== -1 ? (snowballMonth / 12).toFixed(1) : null,
    };
  }, [initialCapital, monthlyContribution, years, expectedReturnRate, reinvestDividends, strategyInfo]);

  return (
    <div className="space-y-6">
      
      {/* Main Switch Bar: Minha Carteira vs Modelos Prontos */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-emerald-400" />
            Gestor & Avaliador de Carteira de Investimentos
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Avalie o seu patrimônio com métricas em tempo real de Graham, Bazin, Yield on Cost e renda passiva mensal.
          </p>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800 shrink-0">
          <button
            onClick={() => setSubTab('MY_PORTFOLIO')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer flex items-center gap-1.5 ${
              subTab === 'MY_PORTFOLIO'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            Minha Carteira ({portfolioItems.length})
          </button>

          <button
            onClick={() => setSubTab('MODELS')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer flex items-center gap-1.5 ${
              subTab === 'MODELS'
                ? 'bg-slate-800 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            Modelos Sugeridos & Bola de Neve
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* SUB-TAB 1: MINHA CARTEIRA & AVALIADOR DE ATIVOS REAIS          */}
      {/* ============================================================== */}
      {subTab === 'MY_PORTFOLIO' && (
        <div className="space-y-6">
          
          {/* Actions Bar */}
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-400">
              Total de <b className="text-white font-mono">{portfolioItems.length}</b> ativos cadastrados nesta carteira.
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleResetToExample}
                title="Restaurar carteira com dados de exemplo"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 cursor-pointer transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Exemplo Modelo
              </button>

              <button
                onClick={() => setIsAddAssetOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-emerald-400 hover:bg-emerald-300 text-slate-900 cursor-pointer shadow-sm transition"
              >
                <PlusCircle className="w-4 h-4" />
                + Adicionar Ativo
              </button>
            </div>
          </div>

          {/* Form Modal to Add Asset */}
          {isAddAssetOpen && (
            <div className="bg-slate-900 border border-emerald-500/30 rounded-xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <PlusCircle className="w-4 h-4 text-emerald-400" />
                  Adicionar Ação à Carteira
                </div>
                <button 
                  onClick={() => setIsAddAssetOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddAsset} className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <label className="text-slate-400 font-medium">Selecione o Ativo:</label>
                  <select
                    value={selectedTickerToAdd}
                    onChange={(e) => handleTickerSelectChange(e.target.value)}
                    className="mt-1 w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100 font-mono outline-none"
                  >
                    {stocks.map(s => (
                      <option key={s.ticker} value={s.ticker}>
                        {s.ticker} - {s.name} (R$ {s.fundamentals.currentPrice.toFixed(2)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 font-medium">Quantidade de Ações:</label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={inputQuantity}
                    onChange={(e) => setInputQuantity(e.target.value)}
                    placeholder="ex: 100"
                    className="mt-1 w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100 font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-medium">Preço Médio Pago (R$):</label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    required
                    value={inputAveragePrice}
                    onChange={(e) => setInputAveragePrice(e.target.value)}
                    placeholder="ex: 28.50"
                    className="mt-1 w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100 font-mono outline-none"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-900 font-bold rounded cursor-pointer transition shadow-sm"
                  >
                    Salvar na Carteira
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Real-time Portfolio Dashboard Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            
            {/* 1. Valor Atual */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
              <div className="text-[11px] text-slate-400">Valor Atual de Mercado</div>
              <div className="text-xl font-bold font-mono-numbers text-white mt-1">
                R$ {portfolioAnalysis.totalCurrentValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className={`text-[11px] font-mono-numbers mt-1 flex items-center ${
                portfolioAnalysis.totalProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {portfolioAnalysis.totalProfit >= 0 ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
                {portfolioAnalysis.totalProfit >= 0 ? '+' : ''}R$ {portfolioAnalysis.totalProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({portfolioAnalysis.totalProfitPercent >= 0 ? '+' : ''}{portfolioAnalysis.totalProfitPercent.toFixed(1)}%)
              </div>
            </div>

            {/* 2. Custo Investido */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
              <div className="text-[11px] text-slate-400">Total Investido (Custo)</div>
              <div className="text-xl font-bold font-mono-numbers text-slate-200 mt-1">
                R$ {portfolioAnalysis.totalInvestedCost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                Soma dos preços médios
              </div>
            </div>

            {/* 3. Renda Mensal de Dividendos */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
              <div className="text-[11px] text-slate-400">Renda Mensal Estimada</div>
              <div className="text-xl font-bold font-mono-numbers text-cyan-400 mt-1">
                R$ {portfolioAnalysis.monthlyDividendProjected.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                R$ {portfolioAnalysis.totalAnnualDividendProjected.toFixed(2)} / ano
              </div>
            </div>

            {/* 4. Yield on Cost (YoC) */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
              <div className="text-[11px] text-slate-400">Yield on Cost (YoC)</div>
              <div className="text-xl font-bold font-mono-numbers text-emerald-400 mt-1">
                {portfolioAnalysis.yieldOnCost.toFixed(1)}% a.a.
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                Retorno s/ seu custo pago
              </div>
            </div>

            {/* 5. Dividend Yield Atual */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
              <div className="text-[11px] text-slate-400">Dividend Yield Atual</div>
              <div className="text-xl font-bold font-mono-numbers text-slate-200 mt-1">
                {portfolioAnalysis.currentYield.toFixed(1)}% a.a.
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                Com base na cotação de hoje
              </div>
            </div>

            {/* 6. Score Geral da Carteira */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
              <div className="text-[11px] text-slate-400">Score de Saúde Quant</div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className={`text-xl font-bold font-mono-numbers ${
                  portfolioAnalysis.portfolioScore >= 70 ? 'text-emerald-400' : 'text-amber-400'
                }`}>
                  {portfolioAnalysis.portfolioScore}
                </span>
                <span className="text-xs text-slate-500 font-mono">/100</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                Ponderado por valor
              </div>
            </div>

          </div>

          {/* User Portfolio Items Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase font-mono tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Ativo</th>
                    <th className="py-3 px-4 text-right">Qtd</th>
                    <th className="py-3 px-4 text-right">Preço Médio</th>
                    <th className="py-3 px-4 text-right">Cotação Atual</th>
                    <th className="py-3 px-4 text-right">Valor Total</th>
                    <th className="py-3 px-4 text-right">Peso %</th>
                    <th className="py-3 px-4 text-right">Lucro / Prejuízo</th>
                    <th className="py-3 px-4 text-right">Dividendo Anual</th>
                    <th className="py-3 px-4 text-center">Bazin Teto (6%)</th>
                    <th className="py-3 px-4 text-center">Score</th>
                    <th className="py-3 px-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {portfolioAnalysis.evaluatedItems.length > 0 ? (
                    portfolioAnalysis.evaluatedItems.map((item) => {
                      const isEditing = editingId === item.id;
                      const weightPercent = portfolioAnalysis.totalCurrentValue > 0 
                        ? (item.positionCurrentValue / portfolioAnalysis.totalCurrentValue) * 100 
                        : 0;

                      const bazinCeiling = item.stock?.valuation.bazinCeilingPrice || 0;
                      const isBelowBazin = item.currentPrice <= bazinCeiling;

                      return (
                        <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                          
                          {/* Ticker */}
                          <td className="py-3 px-4">
                            <button
                              onClick={() => {
                                if (item.stock) {
                                  onSelectStock(item.stock);
                                  onNavigateToDetail();
                                }
                              }}
                              className="text-left group cursor-pointer"
                            >
                              <div className="font-bold font-mono text-white group-hover:text-emerald-400 transition-colors">
                                {item.ticker}
                              </div>
                              <div className="text-[11px] text-slate-400">
                                {item.stock?.name || item.ticker} &middot; {item.stock?.sector}
                              </div>
                            </button>
                          </td>

                          {/* Quantity */}
                          <td className="py-3 px-4 text-right font-mono-numbers">
                            {isEditing ? (
                              <input
                                type="number"
                                value={editQty}
                                onChange={(e) => setEditQty(e.target.value)}
                                className="w-16 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-right font-mono text-xs"
                              />
                            ) : (
                              <span className="font-bold text-slate-200">{item.quantity}</span>
                            )}
                          </td>

                          {/* Average Price */}
                          <td className="py-3 px-4 text-right font-mono-numbers text-slate-300">
                            {isEditing ? (
                              <input
                                type="number"
                                step="0.01"
                                value={editPrice}
                                onChange={(e) => setEditPrice(e.target.value)}
                                className="w-20 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-right font-mono text-xs"
                              />
                            ) : (
                              `R$ ${item.averagePrice.toFixed(2)}`
                            )}
                          </td>

                          {/* Current Price */}
                          <td className="py-3 px-4 text-right font-mono-numbers font-medium text-slate-100">
                            R$ {item.currentPrice.toFixed(2)}
                          </td>

                          {/* Position Total Value */}
                          <td className="py-3 px-4 text-right font-mono-numbers font-bold text-slate-100">
                            R$ {item.positionCurrentValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>

                          {/* Weight */}
                          <td className="py-3 px-4 text-right font-mono-numbers text-slate-400">
                            {weightPercent.toFixed(1)}%
                          </td>

                          {/* Profit / Loss */}
                          <td className="py-3 px-4 text-right font-mono-numbers font-medium">
                            <span className={item.positionProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                              {item.positionProfit >= 0 ? '+' : ''}R$ {item.positionProfit.toFixed(2)} ({item.positionProfitPercent >= 0 ? '+' : ''}{item.positionProfitPercent.toFixed(1)}%)
                            </span>
                          </td>

                          {/* Position Annual Dividend */}
                          <td className="py-3 px-4 text-right font-mono-numbers text-cyan-400 font-semibold">
                            R$ {item.positionAnnualDividend.toFixed(2)}
                          </td>

                          {/* Bazin Ceiling status */}
                          <td className="py-3 px-4 text-center">
                            {bazinCeiling > 0 ? (
                              <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded ${
                                isBelowBazin 
                                  ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800' 
                                  : 'bg-rose-950/60 text-rose-300 border border-rose-800'
                              }`}>
                                {isBelowBazin ? `Abaixo Teto (R$ ${bazinCeiling.toFixed(2)})` : `Acima Teto (R$ ${bazinCeiling.toFixed(2)})`}
                              </span>
                            ) : (
                              <span className="text-slate-500 text-[10px]">N/A</span>
                            )}
                          </td>

                          {/* Score */}
                          <td className="py-3 px-4 text-center font-mono-numbers font-bold">
                            <span className={
                              (item.stock?.compositeScore || 0) >= 70 ? 'text-emerald-400' : 'text-amber-400'
                            }>
                              {item.stock?.compositeScore || '-'}/100
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-center">
                            {isEditing ? (
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => handleSaveEdit(item.id)}
                                  className="p-1 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 cursor-pointer"
                                  title="Salvar alterações"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setEditingId(null)}
                                  className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                                  title="Cancelar"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => handleStartEdit(item)}
                                  className="p-1 text-slate-400 hover:text-slate-200 transition cursor-pointer"
                                  title="Editar Quantidade ou Preço Médio"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteItem(item.id)}
                                  className="p-1 text-slate-500 hover:text-rose-400 transition cursor-pointer"
                                  title="Remover da carteira"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </td>

                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={11} className="py-8 text-center text-slate-500">
                        Sua carteira está vazia no momento. Clique em <b>"+ Adicionar Ativo"</b> ou em <b>"Exemplo Modelo"</b> para começar a avaliar!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Qualitative Insights & Diagnostics Bar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Sector Diversification */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <PieChart className="w-4 h-4 text-cyan-400" />
                Diversificação Setorial da Carteira
              </div>

              <div className="space-y-2.5 pt-1">
                {portfolioAnalysis.sectors.map(s => (
                  <div key={s.sector} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-medium">{s.sector}</span>
                      <span className="font-mono text-slate-400">{s.percent}% (R$ {s.value.toFixed(2)})</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-emerald-400 h-full rounded-full"
                        style={{ width: `${s.percent}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Diagnostic & Actionable Advice */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Diagnóstico Algorítmico da Carteira
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                {portfolioAnalysis.opportunities.length > 0 && (
                  <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/50 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <b className="text-emerald-300">Melhores oportunidades para novos aportes:</b>
                      <p className="text-slate-400 mt-0.5">
                        Os ativos <b>{portfolioAnalysis.opportunities.slice(0, 2).map(o => o.ticker).join(' e ')}</b> estão negociando com a maior margem de segurança de Graham (+{portfolioAnalysis.opportunities[0]?.stock?.valuation.grahamMarginOfSafety}%).
                      </p>
                    </div>
                  </div>
                )}

                {portfolioAnalysis.ceilingAlerts.length > 0 ? (
                  <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-800/50 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <b className="text-amber-300">Atenção ao Preço Teto de Bazin:</b>
                      <p className="text-slate-400 mt-0.5">
                        O ativo <b>{portfolioAnalysis.ceilingAlerts.map(c => c.ticker).join(', ')}</b> ultrapassou o preço teto para 6% de yield. Recomenda-se evitar novos aportes até que a cotação recue ou os dividendos aumentem.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span className="text-slate-300">
                      Todos os ativos pagadores de proventos estão dentro dos parâmetros seguros de Décio Bazin!
                    </span>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* SUB-TAB 2: MODELOS PRONTOS & SIMULADOR DE BOLA DE NEVE         */}
      {/* ============================================================== */}
      {subTab === 'MODELS' && (
        <div className="space-y-6">
          
          {/* Strategy Selector Tabs */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedStrategy('DIVIDENDS')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                selectedStrategy === 'DIVIDENDS'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              💰 Renda & Dividendos (Bazin)
            </button>

            <button
              onClick={() => setSelectedStrategy('VALUE')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                selectedStrategy === 'VALUE'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              🛡️ Value Investing (Graham)
            </button>

            <button
              onClick={() => setSelectedStrategy('GROWTH')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                selectedStrategy === 'GROWTH'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              🚀 Crescimento & ROE (Growth)
            </button>

            <button
              onClick={() => setSelectedStrategy('BALANCED')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                selectedStrategy === 'BALANCED'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              ⚖️ Balanceada Multiestratégia
            </button>
          </div>

          {/* Strategy Blueprint & Assets Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: Recommended Asset Allocations (6 Cols) */}
            <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white">{strategyInfo.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{strategyInfo.description}</p>
              </div>

              <div className="space-y-3">
                {strategyInfo.allocations.map((alloc) => {
                  const matchedStock = stocks.find(s => s.ticker === alloc.ticker);
                  return (
                    <div 
                      key={alloc.ticker}
                      className="p-3 bg-slate-950/70 rounded-lg border border-slate-800 flex items-center justify-between hover:border-slate-700 transition cursor-pointer"
                      onClick={() => {
                        if (matchedStock) {
                          onSelectStock(matchedStock);
                          onNavigateToDetail();
                        }
                      }}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-white text-sm">{alloc.ticker}</span>
                          <span className="text-xs text-slate-400">
                            {matchedStock?.name || alloc.ticker}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {alloc.rationale}
                        </div>
                      </div>

                      <div className="text-right pl-4">
                        <div className="text-base font-bold font-mono-numbers text-emerald-400">
                          {alloc.weight}%
                        </div>
                        <div className="text-[10px] text-slate-500">peso sugerido</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Allocation Benchmark Metrics */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800 text-xs">
                <div className="p-3 bg-slate-950/50 rounded border border-slate-800/80">
                  <div className="text-slate-400">Dividend Yield Médio da Carteira</div>
                  <div className="text-base font-bold font-mono-numbers text-emerald-400 mt-1">
                    {strategyInfo.averageDY.toFixed(1)}% a.a.
                  </div>
                </div>

                <div className="p-3 bg-slate-950/50 rounded border border-slate-800/80">
                  <div className="text-slate-400">Score de Qualidade Fundamental</div>
                  <div className="text-base font-bold font-mono-numbers text-cyan-400 mt-1">
                    {strategyInfo.averageScore} / 100
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Compound Interest & Snowball Effect Lab (6 Cols) */}
            <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">Simulador de Aportes & Renda Passiva</h3>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">Juros Compostos</span>
              </div>

              {/* Controls */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="text-slate-400">Aporte Inicial (R$):</label>
                  <input
                    type="number"
                    value={initialCapital}
                    onChange={(e) => setInitialCapital(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400">Aporte Mensal (R$):</label>
                  <input
                    type="number"
                    value={monthlyContribution}
                    onChange={(e) => setMonthlyContribution(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>Prazo:</span>
                    <span className="font-mono text-emerald-400 font-semibold">{years} anos</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    value={years}
                    onChange={(e) => setYears(parseInt(e.target.value))}
                    className="w-full accent-emerald-400 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>Retorno Esperado:</span>
                    <span className="font-mono text-cyan-400 font-semibold">{expectedReturnRate}% a.a.</span>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="20"
                    step="0.5"
                    value={expectedReturnRate}
                    onChange={(e) => setExpectedReturnRate(parseFloat(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>
              </div>

              {/* Reinvest Toggle */}
              <div className="pt-1">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reinvestDividends}
                    onChange={(e) => setReinvestDividends(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-700 text-emerald-500 w-4 h-4 cursor-pointer"
                  />
                  <span>Reinvestir 100% dos dividendos recebidos (Efeito Bola de Neve Bazin)</span>
                </label>
              </div>

              {/* Results Summary Cards */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800">
                  <div className="text-[11px] text-slate-400">Patrimônio Acumulado Final</div>
                  <div className="text-xl font-bold font-mono-numbers text-emerald-400 mt-1">
                    R$ {simulationResults.finalBalance.toLocaleString('pt-BR')}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Total investido: R$ {simulationResults.totalInvested.toLocaleString('pt-BR')}
                  </div>
                </div>

                <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800">
                  <div className="text-[11px] text-slate-400">Renda Mensal Passiva Estimada</div>
                  <div className="text-xl font-bold font-mono-numbers text-cyan-400 mt-1">
                    R$ {simulationResults.finalMonthlyDividend.toLocaleString('pt-BR')} <span className="text-xs font-normal text-slate-400">/mês</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Sem necessidade de vender cotas
                  </div>
                </div>
              </div>

              {/* Snowball Milestone Callout */}
              {simulationResults.snowballYear && (
                <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-lg text-xs flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="text-slate-300 leading-relaxed">
                    <b className="text-emerald-400">Inflexão da Bola de Neve no Ano {simulationResults.snowballYear}:</b> A partir deste momento, a sua renda mensal gerada por dividendos ultrapassa o seu próprio aporte de R$ {monthlyContribution.toLocaleString('pt-BR')}!
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>
      )}

    </div>
  );
};
