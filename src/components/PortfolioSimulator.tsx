import React, { useState, useMemo } from 'react';
import { StockEvaluation, InvestmentStrategy } from '../types/stock';
import { 
  PieChart, 
  Coins, 
  TrendingUp, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight,
  HelpCircle
} from 'lucide-react';

interface PortfolioSimulatorProps {
  stocks: StockEvaluation[];
  onSelectStock: (stock: StockEvaluation) => void;
  onNavigateToDetail: () => void;
}

export const PortfolioSimulator: React.FC<PortfolioSimulatorProps> = ({
  stocks,
  onSelectStock,
  onNavigateToDetail,
}) => {
  const [selectedStrategy, setSelectedStrategy] = useState<InvestmentStrategy>('DIVIDENDS');

  // Compound interest simulator inputs
  const [initialCapital, setInitialCapital] = useState<number>(10000);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(1500);
  const [years, setYears] = useState<number>(10);
  const [expectedReturnRate, setExpectedReturnRate] = useState<number>(12); // % a.a.
  const [reinvestDividends, setReinvestDividends] = useState<boolean>(true);

  // Strategy preset configurations
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

  // Simulation calculation
  const simulationResults = useMemo(() => {
    const monthlyRate = Math.pow(1 + (expectedReturnRate / 100), 1 / 12) - 1;
    const totalMonths = years * 12;

    let balance = initialCapital;
    let totalInvested = initialCapital;
    let snowballMonth = -1; // Month when monthly dividend exceeds monthly contribution

    const timeline: { year: number; balance: number; invested: number; monthlyPassiveIncome: number }[] = [];

    for (let m = 1; m <= totalMonths; m++) {
      const monthYield = balance * monthlyRate;
      
      // Check snowball condition: monthly income > user contribution
      if (snowballMonth === -1 && monthYield >= monthlyContribution) {
        snowballMonth = m;
      }

      if (reinvestDividends) {
        balance = balance + monthYield + monthlyContribution;
      } else {
        balance = balance + monthlyContribution;
      }
      totalInvested += monthlyContribution;

      if (m % 12 === 0) {
        const currentYear = m / 12;
        timeline.push({
          year: currentYear,
          balance: Math.round(balance),
          invested: Math.round(totalInvested),
          monthlyPassiveIncome: Math.round(balance * (strategyInfo.averageDY / 100 / 12)),
        });
      }
    }

    const finalBalance = Math.round(balance);
    const totalEarnings = finalBalance - totalInvested;
    const finalMonthlyDividend = Math.round(finalBalance * (strategyInfo.averageDY / 100 / 12));

    return {
      finalBalance,
      totalInvested,
      totalEarnings,
      finalMonthlyDividend,
      snowballYear: snowballMonth !== -1 ? (snowballMonth / 12).toFixed(1) : null,
      timeline,
    };
  }, [initialCapital, monthlyContribution, years, expectedReturnRate, reinvestDividends, strategyInfo]);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <PieChart className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">
              Alocação Estratégica & Simulador do Efeito Bola de Neve
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Escolha o modelo de investimentos baseado em estudos acadêmicos e simule o acúmulo de patrimônio e renda passiva.
          </p>
        </div>

        {/* Strategy Selector Tabs */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800">
          <button
            onClick={() => setSelectedStrategy('DIVIDENDS')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              selectedStrategy === 'DIVIDENDS'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            💰 Renda & Dividendos (Bazin)
          </button>

          <button
            onClick={() => setSelectedStrategy('VALUE')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              selectedStrategy === 'VALUE'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            🛡️ Value Investing (Graham)
          </button>

          <button
            onClick={() => setSelectedStrategy('GROWTH')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              selectedStrategy === 'GROWTH'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            🚀 Crescimento & ROE (Growth)
          </button>

          <button
            onClick={() => setSelectedStrategy('BALANCED')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              selectedStrategy === 'BALANCED'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            ⚖️ Balanceada Multiestratégia
          </button>
        </div>
      </div>

      {/* Strategy Blueprint & Assets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Recommended Asset Allocations (6 Cols) */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white">{strategyInfo.title}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{strategyInfo.description}</p>
            </div>
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
  );
};
