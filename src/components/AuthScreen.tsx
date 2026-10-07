import React, { useState } from 'react';
import { AuthUser, loginUser, registerUser, loginWithDemo } from '../services/authService';
import { 
  TrendingUp, 
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  Eye, 
  EyeOff,
  Github
} from 'lucide-react';

interface AuthScreenProps {
  onLoginSuccess: (user: AuthUser) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [tab, setTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (tab === 'LOGIN') {
      const res = loginUser(email, password);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setErrorMessage(res.message || 'Falha no login');
      }
    } else {
      const res = registerUser(name, email, password);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setErrorMessage(res.message || 'Falha no cadastro');
      }
    }
  };

  const handleDemoLogin = () => {
    const user = loginWithDemo();
    onLoginSuccess(user);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 space-y-6">
        
        {/* Brand Lockup */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-2 shadow-lg shadow-emerald-950/40">
            <TrendingUp className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            AlphaVal Analytics
          </h1>
          <p className="text-xs text-slate-400">
            Terminal de Análise de Ações, Valuation Graham & Bazin e Tempo Real
          </p>
        </div>

        {/* Card Box */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-sm space-y-5">
          
          {/* Segmented Auth Tabs */}
          <div className="flex rounded-lg bg-slate-950 p-1 border border-slate-800">
            <button
              type="button"
              onClick={() => { setTab('LOGIN'); setErrorMessage(''); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-md transition cursor-pointer ${
                tab === 'LOGIN' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Entrar na Conta
            </button>
            <button
              type="button"
              onClick={() => { setTab('REGISTER'); setErrorMessage(''); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-md transition cursor-pointer ${
                tab === 'REGISTER' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Criar Nova Conta
            </button>
          </div>

          {/* Error Feedback */}
          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
              {errorMessage}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            {tab === 'REGISTER' && (
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Nome Completo</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-slate-100 placeholder-slate-600 focus:border-emerald-500/50 outline-none"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-slate-300 font-medium">E-mail</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@exemplo.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-slate-100 placeholder-slate-600 focus:border-emerald-500/50 outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Senha de Acesso</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 4 caracteres"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-10 py-2 text-slate-100 placeholder-slate-600 focus:border-emerald-500/50 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-slate-900 font-bold transition shadow-sm flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>{tab === 'LOGIN' ? 'Acessar Plataforma' : 'Criar Conta & Entrar'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Access Divider */}
          <div className="relative border-t border-slate-800 pt-4 text-center">
            <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 px-3 text-[11px] text-slate-500">
              ou acesso rápido
            </span>

            <button
              type="button"
              onClick={handleDemoLogin}
              className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 font-semibold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Entrar com Conta Demo do Investidor</span>
            </button>
          </div>

        </div>

        {/* GitHub Pages & Security note */}
        <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <Github className="w-3.5 h-3.5" />
            Compatível com GitHub Pages
          </span>
          <span>&bull;</span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            Sessão Local Segura
          </span>
        </div>

      </div>
    </div>
  );
};
