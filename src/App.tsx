import React, { useState, useEffect, useCallback } from 'react';
import { StockEvaluation } from './types/stock';
import { INITIAL_STOCKS } from './services/financialEngine';
import { getStoredUser, clearUserSession, AuthUser } from './services/authService';
import { fetchLiveMarketQuotes, PriceUpdate } from './services/realtimeStockService';

import { AuthScreen } from './components/AuthScreen';
import { Header } from './components/Header';
import { StockOverview } from './components/StockOverview';
import { StockDetail } from './components/StockDetail';
import { StockScreener } from './components/StockScreener';
import { PortfolioSimulator } from './components/PortfolioSimulator';
import { CustomStockModal } from './components/CustomStockModal';

export default function App() {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());
  const [stocks, setStocks] = useState<StockEvaluation[]>(INITIAL_STOCKS);
  const [selectedStock, setSelectedStock] = useState<StockEvaluation>(INITIAL_STOCKS[0]);
  const [activeTab, setActiveTab] = useState<'overview' | 'detail' | 'screener' | 'simulator'>('overview');
  
  // Modals
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);

  // Real-time state
  const [isRealtimeSyncing, setIsRealtimeSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(new Date().toLocaleTimeString('pt-BR'));
  const [latestUpdates, setLatestUpdates] = useState<PriceUpdate[]>([]);
  const [realtimeActive, setRealtimeActive] = useState(true);

  const handleSelectStock = (stock: StockEvaluation) => {
    setSelectedStock(stock);
  };

  const handleAddStock = (newStock: StockEvaluation) => {
    setStocks(prev => [newStock, ...prev]);
    setSelectedStock(newStock);
    setActiveTab('detail');
  };

  const handleLogout = () => {
    clearUserSession();
    setUser(null);
  };

  // Real-time sync function
  const triggerRealtimeSync = useCallback(async () => {
    if (isRealtimeSyncing) return;
    setIsRealtimeSyncing(true);

    try {
      const { updatedStocks, updates } = await fetchLiveMarketQuotes(stocks);
      setStocks(updatedStocks);
      setLatestUpdates(updates.slice(0, 4));
      setLastSyncTime(new Date().toLocaleTimeString('pt-BR'));

      // Keep selectedStock in sync if it got updated
      setSelectedStock(prev => {
        const found = updatedStocks.find(s => s.ticker === prev.ticker);
        return found || prev;
      });
    } catch (e) {
      console.warn('Realtime sync tick error:', e);
    } finally {
      setIsRealtimeSyncing(false);
    }
  }, [stocks, isRealtimeSyncing]);

  // Periodic automatic live feed polling (every 12 seconds when logged in)
  useEffect(() => {
    if (!user || !realtimeActive) return;

    const interval = setInterval(() => {
      triggerRealtimeSync();
    }, 12000);

    return () => clearInterval(interval);
  }, [user, realtimeActive, triggerRealtimeSync]);

  // 1. If user is not authenticated, show gatekeeper login screen
  if (!user) {
    return <AuthScreen onLoginSuccess={(u) => setUser(u)} />;
  }

  // 2. Main Authenticated Application
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-300">
      
      {/* Top Bar Contract (3 zones, single line) */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewStockModal={() => setIsStockModalOpen(true)}
        selectedTicker={selectedStock?.ticker}
        user={user}
        onLogout={handleLogout}
        isRealtimeSyncing={isRealtimeSyncing}
        onManualSync={triggerRealtimeSync}
        lastSyncTime={lastSyncTime}
      />

      {/* Real-time Streaming Ticker Marquee Bar */}
      <div className="bg-slate-900/90 border-b border-slate-800/80 px-4 py-1.5 text-xs font-mono overflow-x-auto whitespace-nowrap">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-2 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[11px] font-semibold text-emerald-400">FEED AO VIVO B3 & GLOBAL:</span>
          </div>

          <div className="flex items-center gap-6 overflow-x-auto">
            {stocks.slice(0, 7).map(stock => {
              const sym = stock.fundamentals.currency === 'BRL' ? 'R$' : 'US$';
              return (
                <button
                  key={stock.ticker}
                  onClick={() => {
                    setSelectedStock(stock);
                    setActiveTab('detail');
                  }}
                  className="flex items-center gap-1.5 hover:text-white transition cursor-pointer"
                >
                  <span className="font-bold text-slate-200">{stock.ticker}</span>
                  <span className="text-slate-400">{sym} {stock.fundamentals.currentPrice.toFixed(2)}</span>
                  <span className={`text-[10px] ${
                    stock.valuation.grahamMarginOfSafety >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {stock.valuation.grahamMarginOfSafety >= 0 ? '+' : ''}{stock.valuation.grahamMarginOfSafety}%
                  </span>
                </button>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-2 text-[11px] text-slate-500">
            <span>Recálculo contínuo Graham/Bazin/RSI</span>
          </div>

        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {activeTab === 'overview' && (
          <StockOverview
            stocks={stocks}
            onSelectStock={handleSelectStock}
            onNavigateToDetail={() => setActiveTab('detail')}
          />
        )}

        {activeTab === 'detail' && selectedStock && (
          <StockDetail
            stock={selectedStock}
            onBack={() => setActiveTab('overview')}
          />
        )}

        {activeTab === 'screener' && (
          <StockScreener
            stocks={stocks}
            onSelectStock={handleSelectStock}
            onNavigateToDetail={() => setActiveTab('detail')}
          />
        )}

        {activeTab === 'simulator' && (
          <PortfolioSimulator
            stocks={stocks}
            onSelectStock={handleSelectStock}
            onNavigateToDetail={() => setActiveTab('detail')}
          />
        )}

      </main>

      {/* Modal for adding custom stock */}
      <CustomStockModal
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
        onAddStock={handleAddStock}
      />

      {/* Quiet Financial Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">AlphaVal Analytics</span>
            <span>&middot;</span>
            <span>Cotações em Tempo Real &middot; Modelos Benjamin Graham & Décio Bazin &middot; 100% Gratuito</span>
          </div>
          <div className="text-[11px] text-slate-500">
            Sessão ativa: {user.name} ({user.email})
          </div>
        </div>
      </footer>

    </div>
  );
}
