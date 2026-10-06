import * as SecureStore from 'expo-secure-store';
import { createContext, use, useEffect, useState, type PropsWithChildren } from 'react';

import { api, ApiError, type User } from './api';

const TOKEN_KEY = 'medgical.session-token';
const USER_KEY = 'medgical.user';

type AuthState = {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function useAuth() {
  const value = use(AuthContext);
  if (!value) throw new Error('useAuth tem de ser usado dentro de <AuthProvider>');
  return value;
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restaura a sessão guardada. Se o servidor não estiver acessível, mantemos
  // o utilizador em cache para que os documentos locais continuem disponíveis.
  useEffect(() => {
    (async () => {
      try {
        const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);
        const storedUser = await SecureStore.getItemAsync(USER_KEY);
        if (!storedToken || !storedUser) return;

        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        try {
          const { user: freshUser } = await api.me(storedToken);
          setUser(freshUser);
          await SecureStore.setItemAsync(USER_KEY, JSON.stringify(freshUser));
        } catch (error) {
          if (error instanceof ApiError && error.status === 401) await clearSession();
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  async function persistSession(newToken: string, newUser: User) {
    await SecureStore.setItemAsync(TOKEN_KEY, newToken);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }

  async function clearSession() {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
    setToken(null);
    setUser(null);
  }

  const value: AuthState = {
    user,
    isLoading,
    async signIn(email, password) {
      const res = await api.login(email, password);
      await persistSession(res.token, res.user);
    },
    async signUp(name, email, password) {
      const res = await api.register(name, email, password);
      await persistSession(res.token, res.user);
    },
    async signOut() {
      if (token) await api.logout(token).catch(() => {});
      await clearSession();
    },
  };

  return <AuthContext value={value}>{children}</AuthContext>;
}
