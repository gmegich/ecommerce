import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

const TOKEN_KEY = 'token';
const ROLE_KEY = 'role';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [sellerProfile, setSellerProfile] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(Boolean(localStorage.getItem(TOKEN_KEY)));

  const persistSession = useCallback((nextToken, nextUser, nextSeller = null) => {
    if (nextToken) {
      localStorage.setItem(TOKEN_KEY, nextToken);
      localStorage.setItem(ROLE_KEY, nextUser?.role || '');
    } else {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(ROLE_KEY);
    }

    setToken(nextToken);
    setUser(nextUser);
    setSellerProfile(nextSeller);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!localStorage.getItem(TOKEN_KEY)) {
      setLoading(false);
      return null;
    }

    try {
      const res = await authService.getMe();
      setUser(res.data.user);
      setSellerProfile(res.data.sellerProfile || null);
      localStorage.setItem(ROLE_KEY, res.data.user.role);
      return res.data.user;
    } catch {
      persistSession(null, null, null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [persistSession]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const register = useCallback(async (payload) => {
    const res = await authService.register(payload);
    persistSession(res.data.token, res.data.user, res.data.sellerProfile || null);
    return res;
  }, [persistSession]);

  const login = useCallback(async (payload) => {
    const res = await authService.login(payload);
    persistSession(res.data.token, res.data.user, res.data.sellerProfile || null);
    return res;
  }, [persistSession]);

  const logout = useCallback(async () => {
    await authService.logout();
    persistSession(null, null, null);
  }, [persistSession]);

  const updateProfile = useCallback(async (payload) => {
    const res = await authService.updateProfile(payload);
    setUser(res.data.user);
    return res;
  }, []);

  const value = useMemo(
    () => ({
      user,
      sellerProfile,
      token,
      loading,
      isAuthenticated: Boolean(user && token),
      register,
      login,
      logout,
      updateProfile,
      refreshUser,
    }),
    [user, sellerProfile, token, loading, register, login, logout, updateProfile, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};
