import { clearTokens, refreshAccessToken, storeTokens } from '@/lib/api';
import { AuthResponse } from '@/types/user';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useState } from 'react';

type AuthContextData = {
  user: AuthResponse | null;
  signIn: (data: AuthResponse) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (userData: Partial<AuthResponse>) => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  let mounted = true;

  async function loadSession() {
    try {
      const session = await SecureStore.getItemAsync('session');

      if (mounted && session) {
        setUser(JSON.parse(session));
      }
    } catch (error) {
      console.error('Erro ao carregar sessão:', error);
    } finally {
      if (mounted) {
        setLoading(false);
      }
    }
  }

  loadSession();

  return () => {
    mounted = false;
  };
}, []);

  useEffect(() => {
    if (!user || !user.id || loading) return;

    const intervalId = setInterval(async () => {
      const result = await refreshAccessToken();
      if (result) {
        const updatedUser = { ...user, ...result.userData };
        await SecureStore.setItemAsync('session', JSON.stringify(updatedUser));
        setUser(updatedUser);
        console.log('Dados do usuário renovados com sucesso');
      }
    }, 25 * 60 * 1000); // 25 minutos

    return () => clearInterval(intervalId);
  }, [user, loading]);

  async function signIn(data: AuthResponse) {
    await SecureStore.setItemAsync(
      'session',
      JSON.stringify(data)
    );

    await storeTokens(data.accessToken, data.refreshToken);

    setUser(data);
  }

  async function updateUser(userData: Partial<AuthResponse>) {
    const updatedUser = { ...user, ...userData } as AuthResponse;
    await SecureStore.setItemAsync('session', JSON.stringify(updatedUser));
    setUser(updatedUser);
  }

  async function signOut() {
    await SecureStore.deleteItemAsync('session');
    await clearTokens();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        signIn,
        signOut,
        updateUser,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}