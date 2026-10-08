export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'investor';
  loginAt: string;
}

export interface StoredAccount {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'investor';
  createdAt: string;
}

const STORAGE_SESSION_KEY = 'alphaval_auth_user';
const STORAGE_USERS_KEY = 'alphaval_accounts_db';

// Usuário administrador inicial pré-configurado
const DEFAULT_ADMIN: StoredAccount = {
  id: 'admin-master',
  name: 'Administrador Master',
  email: 'admin@alphaval.com',
  password: 'admin123',
  role: 'admin',
  createdAt: new Date().toISOString(),
};

export function getAllAccounts(): StoredAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    if (!raw) {
      const initial = [DEFAULT_ADMIN];
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(initial));
      return initial;
    }
    const accounts: StoredAccount[] = JSON.parse(raw);
    // Garantir que o admin mestre sempre exista
    if (!accounts.some(a => a.role === 'admin')) {
      accounts.unshift(DEFAULT_ADMIN);
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(accounts));
    }
    return accounts;
  } catch {
    return [DEFAULT_ADMIN];
  }
}

export function saveAccounts(accounts: StoredAccount[]): void {
  try {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(accounts));
  } catch (e) {
    console.error('Falha ao salvar contas:', e);
  }
}

export function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveUserSession(user: AuthUser): void {
  try {
    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(user));
  } catch (e) {
    console.error('Falha ao salvar sessão:', e);
  }
}

export function clearUserSession(): void {
  try {
    localStorage.removeItem(STORAGE_SESSION_KEY);
  } catch (e) {
    console.error('Falha ao limpar sessão:', e);
  }
}

export function loginUser(email: string, password: string): { success: boolean; user?: AuthUser; message?: string } {
  const cleanEmail = email.trim().toLowerCase();
  const accounts = getAllAccounts();

  const found = accounts.find(a => a.email.toLowerCase() === cleanEmail);

  if (!found) {
    return { success: false, message: 'Usuário não encontrado. Solicite o cadastro ao Administrador.' };
  }

  if (found.password !== password) {
    return { success: false, message: 'Senha incorreta. Tente novamente.' };
  }

  const user: AuthUser = {
    id: found.id,
    name: found.name,
    email: found.email,
    role: found.role,
    loginAt: new Date().toISOString(),
  };

  saveUserSession(user);
  return { success: true, user };
}

// Criação de novos usuários pelo Admin ou pelo formulário (sempre como 'investor', a menos que explicitado)
export function createAccount(
  name: string, 
  email: string, 
  password: string, 
  role: 'investor' | 'admin' = 'investor'
): { success: boolean; account?: StoredAccount; message?: string } {
  const cleanEmail = email.trim().toLowerCase();
  
  if (!name.trim() || !cleanEmail || password.length < 4) {
    return { success: false, message: 'Nome obrigatório e senha de no mínimo 4 caracteres.' };
  }

  const accounts = getAllAccounts();
  if (accounts.some(a => a.email.toLowerCase() === cleanEmail)) {
    return { success: false, message: 'Este e-mail já está cadastrado no sistema.' };
  }

  const newAcc: StoredAccount = {
    id: `acc-${Date.now()}`,
    name: name.trim(),
    email: cleanEmail,
    password,
    role, // Usuários normais recebem role 'investor' (sem poderes de admin)
    createdAt: new Date().toISOString(),
  };

  accounts.push(newAcc);
  saveAccounts(accounts);
  return { success: true, account: newAcc };
}

export function deleteAccount(id: string): { success: boolean; message?: string } {
  const accounts = getAllAccounts();
  const target = accounts.find(a => a.id === id);

  if (!target) {
    return { success: false, message: 'Conta não encontrada.' };
  }

  if (target.id === DEFAULT_ADMIN.id || target.email === DEFAULT_ADMIN.email) {
    return { success: false, message: 'Não é permitido excluir o Administrador Master.' };
  }

  const updated = accounts.filter(a => a.id !== id);
  saveAccounts(updated);
  return { success: true };
}

export function updateAccountPassword(id: string, newPass: string): { success: boolean; message?: string } {
  if (newPass.length < 4) {
    return { success: false, message: 'A nova senha deve ter no mínimo 4 caracteres.' };
  }

  const accounts = getAllAccounts();
  const index = accounts.findIndex(a => a.id === id);
  if (index === -1) {
    return { success: false, message: 'Usuário não encontrado.' };
  }

  accounts[index].password = newPass;
  saveAccounts(accounts);
  return { success: true };
}
