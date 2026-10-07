export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'investor' | 'analyst';
  loginAt: string;
}

const STORAGE_KEY = 'alphaval_auth_user';
const USERS_DB_KEY = 'alphaval_registered_users';

export function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveUserSession(user: AuthUser): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } catch (e) {
    console.error('Failed to save session:', e);
  }
}

export function clearUserSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear session:', e);
  }
}

export function loginWithDemo(): AuthUser {
  const demoUser: AuthUser = {
    id: 'demo-user-1',
    name: 'Investidor Alpha',
    email: 'investidor@alphaval.com',
    role: 'investor',
    loginAt: new Date().toISOString(),
  };
  saveUserSession(demoUser);
  return demoUser;
}

export function loginUser(email: string, password: string): { success: boolean; user?: AuthUser; message?: string } {
  const cleanEmail = email.trim().toLowerCase();
  
  // Allow demo credentials or check registered users
  if (cleanEmail === 'demo@alphaval.com' && password === '123456') {
    return { success: true, user: loginWithDemo() };
  }

  try {
    const usersRaw = localStorage.getItem(USERS_DB_KEY);
    const users: Array<{ email: string; password: string; name: string }> = usersRaw ? JSON.parse(usersRaw) : [];
    const found = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (found) {
      if (found.password === password) {
        const user: AuthUser = {
          id: `user-${Date.now()}`,
          name: found.name,
          email: found.email,
          role: 'investor',
          loginAt: new Date().toISOString(),
        };
        saveUserSession(user);
        return { success: true, user };
      } else {
        return { success: false, message: 'Senha incorreta. Tente novamente.' };
      }
    }
  } catch {
    // ignore
  }

  // If no user found, allow first-time quick login with any email/password if valid
  if (cleanEmail && password.length >= 4) {
    const newUser: AuthUser = {
      id: `user-${Date.now()}`,
      name: cleanEmail.split('@')[0].toUpperCase(),
      email: cleanEmail,
      role: 'investor',
      loginAt: new Date().toISOString(),
    };
    saveUserSession(newUser);
    return { success: true, user: newUser };
  }

  return { success: false, message: 'E-mail ou senha inválidos (mínimo 4 caracteres).' };
}

export function registerUser(name: string, email: string, password: string): { success: boolean; user?: AuthUser; message?: string } {
  const cleanEmail = email.trim().toLowerCase();
  if (!name.trim() || !cleanEmail || password.length < 4) {
    return { success: false, message: 'Preencha todos os campos. Senha mínima de 4 caracteres.' };
  }

  try {
    const usersRaw = localStorage.getItem(USERS_DB_KEY);
    const users: Array<{ email: string; password: string; name: string }> = usersRaw ? JSON.parse(usersRaw) : [];
    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, message: 'Este e-mail já está cadastrado. Faça login.' };
    }

    users.push({ email: cleanEmail, password, name: name.trim() });
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));

    const user: AuthUser = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: cleanEmail,
      role: 'investor',
      loginAt: new Date().toISOString(),
    };
    saveUserSession(user);
    return { success: true, user };
  } catch {
    return { success: false, message: 'Erro ao registrar usuário.' };
  }
}
