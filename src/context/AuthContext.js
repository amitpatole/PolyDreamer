import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext(null);

const TOKEN_KEY = '@polydreamer_token';
const API_BASE = '/api/auth';

async function apiFetch(path, options = {}) {
  const res = await fetch(API_BASE + path, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    restoreSession();
  }, []);

  async function restoreSession() {
    try {
      const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
      if (storedToken) {
        const data = await apiFetch('/me', {
          headers: { Authorization: `Bearer ${storedToken}` },
        });
        setUser(data.user);
        setToken(storedToken);
      }
    } catch {
      await AsyncStorage.removeItem(TOKEN_KEY);
    } finally {
      setLoading(false);
    }
  }

  async function signUp(name, email, password) {
    const data = await apiFetch('/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    await AsyncStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setUser(data.user);
  }

  async function signIn(email, password) {
    const data = await apiFetch('/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    await AsyncStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setUser(data.user);
  }

  async function signOut() {
    try {
      if (token) {
        await apiFetch('/signout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch {
      // ignore — token may be expired
    }
    await AsyncStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setToken(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
