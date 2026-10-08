import React, { useState } from 'react';
import { AuthUser, StoredAccount, getAllAccounts, createAccount, deleteAccount, updateAccountPassword } from '../services/authService';
import { 
  Shield, 
  Users, 
  UserPlus, 
  KeyRound, 
  Trash2, 
  LogOut, 
  ExternalLink, 
  Check, 
  X, 
  Database, 
  Lock, 
  TrendingUp,
  ShieldCheck,
  UserCheck,
  PieChart
} from 'lucide-react';

interface AdminConsoleProps {
  adminUser: AuthUser;
  onLogout: () => void;
  onSwitchToTerminal: (targetTab?: 'overview' | 'simulator') => void;
}

export const AdminConsole: React.FC<AdminConsoleProps> = ({
  adminUser,
  onLogout,
  onSwitchToTerminal,
}) => {
  const [accounts, setAccounts] = useState<StoredAccount[]>(() => getAllAccounts());
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Inline password reset
  const [resettingId, setResettingId] = useState<string | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');

  const refreshAccounts = () => {
    setAccounts(getAllAccounts());
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    // Contas criadas pelo Admin são estritamente para investidores comuns
    const res = createAccount(newName, newEmail, newPassword, 'investor');
    if (res.success) {
      setFeedback({ 
        type: 'success', 
        message: `Conta criada com sucesso para ${newName}! O usuário já pode acessar o sistema.` 
      });
      setNewName('');
      setNewEmail('');
      setNewPassword('');
      refreshAccounts();
    } else {
      setFeedback({ type: 'error', message: res.message || 'Falha ao criar conta.' });
    }
  };

  const handleDeleteAccount = (id: string, name: string) => {
    if (confirm(`Deseja realmente remover a conta de ${name}? O usuário perderá o acesso imediatamente.`)) {
      const res = deleteAccount(id);
      if (res.success) {
        refreshAccounts();
      } else {
        alert(res.message);
      }
    }
  };

  const handleSaveNewPassword = (id: string) => {
    if (newPasswordInput.length < 4) {
      alert('A nova senha deve possuir pelo menos 4 caracteres.');
      return;
    }
    const res = updateAccountPassword(id, newPasswordInput);
    if (res.success) {
      alert('Senha redefinida com sucesso!');
      setResettingId(null);
      setNewPasswordInput('');
      refreshAccounts();
    } else {
      alert(res.message);
    }
  };

  const totalInvestors = accounts.filter(a => a.role === 'investor').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-purple-500/20 selection:text-purple-300">
      
      {/* Dedicated Admin Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-bold text-white flex items-center gap-2">
                Console Administrativo
                <span className="px-2 py-0.5 text-[10px] rounded bg-purple-950 text-purple-300 border border-purple-800 font-mono">
                  SISTEMA PRIVADO
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                Gestão centralizada de usuários e acessos &bull; {adminUser.email}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onSwitchToTerminal('simulator')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer transition shadow-sm font-sans"
              title="Voltar diretamente para a sua Carteira de Investimentos"
            >
              <PieChart className="w-3.5 h-3.5" />
              <span>← Voltar para a Carteira</span>
            </button>

            <button
              onClick={() => onSwitchToTerminal('overview')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer transition shadow-sm"
              title="Abrir o painel de mercado de ações"
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Ver Mercado</span>
            </button>

            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800 cursor-pointer transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Admin Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* System Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span>Total de Usuários</span>
              <Users className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-white mt-1">
              {accounts.length}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Contas cadastradas no banco
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span>Contas de Investidores</span>
              <UserCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
              {totalInvestors}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Sem poderes administrativos
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span>Nível de Acesso Master</span>
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">
              1
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Administrador autenticado
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span>Armazenamento Local</span>
              <Database className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-slate-200 mt-1">
              100% Privado
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Compatível com GitHub Pages
            </div>
          </div>
        </div>

        {/* Create User Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-emerald-400" />
              Cadastrar Nova Conta de Investidor
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Crie contas para pessoas utilizarem a plataforma. As contas criadas não têm acesso a este painel administrativo.
            </p>
          </div>

          {feedback && (
            <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
              feedback.type === 'success' 
                ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300' 
                : 'bg-rose-950/60 border border-rose-800 text-rose-300'
            }`}>
              <span>{feedback.message}</span>
            </div>
          )}

          <form onSubmit={handleCreateAccount} className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="text-slate-300 font-medium">Nome Completo:</label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="ex: Carlos Mendes"
                className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 outline-none focus:border-purple-500/50"
              />
            </div>

            <div>
              <label className="text-slate-300 font-medium">E-mail de Login:</label>
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="carlos@alphaval.com"
                className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 outline-none focus:border-purple-500/50"
              />
            </div>

            <div>
              <label className="text-slate-300 font-medium">Senha Provisória:</label>
              <input
                type="text"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="mínimo 4 caracteres"
                className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono outline-none focus:border-purple-500/50"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-900 font-bold rounded-lg cursor-pointer transition shadow-sm"
              >
                + Criar Conta de Investidor
              </button>
            </div>
          </form>
        </div>

        {/* Accounts Management Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" />
                Usuários Cadastrados no Sistema
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Altere senhas ou exclua usuários com um clique.
              </p>
            </div>
            <div className="text-xs text-slate-400 font-mono">
              {accounts.length} usuários registrados
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 uppercase font-mono text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Nome do Usuário</th>
                    <th className="py-3 px-4">E-mail de Acesso</th>
                    <th className="py-3 px-4 text-center">Nível / Perfil</th>
                    <th className="py-3 px-4 text-center">Data de Registro</th>
                    <th className="py-3 px-4 text-center">Gerenciar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {accounts.map((acc) => {
                    const isAdmin = acc.role === 'admin';
                    const isResetting = resettingId === acc.id;

                    return (
                      <tr key={acc.id} className="hover:bg-slate-900/40 transition-colors">
                        
                        {/* Name */}
                        <td className="py-3 px-4 font-semibold text-slate-100">
                          {acc.name}
                        </td>

                        {/* Email */}
                        <td className="py-3 px-4 font-mono text-slate-400">
                          {acc.email}
                        </td>

                        {/* Role */}
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold ${
                            isAdmin 
                              ? 'bg-purple-950 text-purple-300 border border-purple-800' 
                              : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
                          }`}>
                            {isAdmin ? <Shield className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                            {isAdmin ? 'ADMINISTRADOR' : 'INVESTIDOR'}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="py-3 px-4 text-center text-slate-500 font-mono text-[11px]">
                          {new Date(acc.createdAt).toLocaleDateString('pt-BR')}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-center">
                          {isResetting ? (
                            <div className="flex items-center justify-center gap-1.5">
                              <input
                                type="text"
                                placeholder="Nova senha"
                                value={newPasswordInput}
                                onChange={(e) => setNewPasswordInput(e.target.value)}
                                className="w-24 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono"
                              />
                              <button
                                onClick={() => handleSaveNewPassword(acc.id)}
                                className="p-1 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 cursor-pointer"
                                title="Salvar nova senha"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => { setResettingId(null); setNewPasswordInput(''); }}
                                className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                                title="Cancelar"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-3">
                              <button
                                onClick={() => { setResettingId(acc.id); setNewPasswordInput(''); }}
                                className="text-slate-400 hover:text-cyan-400 transition cursor-pointer flex items-center gap-1 text-[11px]"
                                title="Alterar senha"
                              >
                                <KeyRound className="w-3 h-3" />
                                Redefinir Senha
                              </button>

                              {!isAdmin ? (
                                <button
                                  onClick={() => handleDeleteAccount(acc.id, acc.name)}
                                  className="text-slate-500 hover:text-rose-400 transition cursor-pointer flex items-center gap-1 text-[11px]"
                                  title="Excluir conta de investidor"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  Excluir
                                </button>
                              ) : (
                                <span className="text-[10px] text-slate-600 font-mono italic">
                                  Protegido
                                </span>
                              )}
                            </div>
                          )}
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </main>

    </div>
  );
};
