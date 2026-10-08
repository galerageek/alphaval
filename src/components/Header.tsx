import React from 'react';
import { AuthUser } from '../services/authService';
import { 
  TrendingUp, 
  BarChart2, 
  SlidersHorizontal, 
  PieChart, 
  PlusCircle, 
  Layers, 
  LogOut, 
  RefreshCw,
  Shield
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'overview' | 'detail' | 'screener' | 'simulator';
  setActiveTab: (tab: 'overview' | 'detail' | 'screener' | 'simulator') => void;
  onOpenNewStockModal: () => void;
  onOpenAdminPanel?: () => void;
  selectedTicker?: string;
  user: AuthUser | null;
  onLogout: () => void;
  isRealtimeSyncing: boolean;
  onManualSync: () => void;
  lastSyncTime: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewStockModal,
  onOpenAdminPanel,
  selectedTicker,
  user,
  onLogout,
  isRealtimeSyncing,
  onManualSync,
  lastSyncTime,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <button 
              onClick={() => setActiveTab('overview')} 
              className="text-lg font-bold tracking-tight text-white hover:text-emerald-400 transition-colors cursor-pointer"
            >
              AlphaVal Analytics
            </button>

            {/* Live Ticker Indicator Badge */}
            <div className="hidden lg:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/80 text-[11px] text-emerald-400 font-mono">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Tempo Real {lastSyncTime}</span>
              <button
                onClick={onManualSync}
                disabled={isRealtimeSyncing}
                title="Sincronizar cotações agora"
                className="hover:text-emerald-200 ml-0.5 cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${isRealtimeSyncing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Zone 2: Clean text navigation links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
            <button
              onClick={() => setActiveTab('overview')}
              className={`transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'overview'
                  ? 'text-emerald-400 font-semibold border-b-2 border-emerald-400 pb-0.5'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-4 h-4" />
              Mercado
            </button>

            <button
              onClick={() => setActiveTab('detail')}
              className={`transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'detail'
                  ? 'text-emerald-400 font-semibold border-b-2 border-emerald-400 pb-0.5'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              Raio-X {selectedTicker ? `(${selectedTicker})` : 'Terminal'}
            </button>

            <button
              onClick={() => setActiveTab('screener')}
              className={`transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'screener'
                  ? 'text-emerald-400 font-semibold border-b-2 border-emerald-400 pb-0.5'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Screener
            </button>

            <button
              onClick={() => setActiveTab('simulator')}
              className={`transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'simulator'
                  ? 'text-emerald-400 font-semibold border-b-2 border-emerald-400 pb-0.5'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <PieChart className="w-4 h-4" />
              Carteira
            </button>
          </nav>

          {/* Zone 3: Primary actions & User Menu */}
          <div className="flex items-center gap-2.5">
            
            {/* Add Custom Stock */}
            <button
              onClick={onOpenNewStockModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm transition-colors cursor-pointer whitespace-nowrap"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Avaliar Ação</span>
            </button>

            {/* Admin Console Switch Button (Visible ONLY to Admin) */}
            {user?.role === 'admin' && onOpenAdminPanel && (
              <button
                onClick={onOpenAdminPanel}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-purple-300 bg-purple-950/70 hover:bg-purple-900/90 border border-purple-800 rounded-lg shadow-sm transition cursor-pointer whitespace-nowrap"
                title="Abrir painel administrativo restrito de gestão de contas"
              >
                <Shield className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden sm:inline">Console Admin</span>
                <span className="sm:hidden">Admin</span>
              </button>
            )}

            {/* User Profile & Logout */}
            {user && (
              <div className="flex items-center gap-2 sm:gap-3 border-l border-slate-800 pl-2 sm:pl-3">
                <div className="hidden sm:block text-right">
                  <div className="text-xs font-semibold text-slate-200 leading-tight">
                    {user.name}
                  </div>
                  <div className="flex items-center justify-end gap-1 mt-0.5">
                    <span className={`text-[10px] font-mono ${user.role === 'admin' ? 'text-purple-400 font-bold' : 'text-emerald-400'}`}>
                      {user.role === 'admin' ? 'ADMIN' : 'INVESTIDOR'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  title="Sair da Conta (Logout)"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-900 border border-transparent hover:border-rose-900/50 transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>

        </div>
      </div>

      {/* Mobile Navigation Sub-bar */}
      <div className="md:hidden border-t border-slate-800/80 bg-slate-950 px-3 py-2 flex items-center justify-around text-xs">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-1 px-2 py-1 rounded cursor-pointer ${
            activeTab === 'overview' ? 'text-emerald-400 font-bold bg-slate-900' : 'text-slate-400'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Mercado</span>
        </button>
        <button
          onClick={() => setActiveTab('detail')}
          className={`flex items-center gap-1 px-2 py-1 rounded cursor-pointer ${
            activeTab === 'detail' ? 'text-emerald-400 font-bold bg-slate-900' : 'text-slate-400'
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5" />
          <span>Raio-X</span>
        </button>
        <button
          onClick={() => setActiveTab('screener')}
          className={`flex items-center gap-1 px-2 py-1 rounded cursor-pointer ${
            activeTab === 'screener' ? 'text-emerald-400 font-bold bg-slate-900' : 'text-slate-400'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Screener</span>
        </button>
        <button
          onClick={() => setActiveTab('simulator')}
          className={`flex items-center gap-1 px-2 py-1 rounded cursor-pointer ${
            activeTab === 'simulator' ? 'text-emerald-400 font-bold bg-slate-900' : 'text-slate-400'
          }`}
        >
          <PieChart className="w-3.5 h-3.5" />
          <span>Carteira</span>
        </button>
      </div>
    </header>
  );
};
