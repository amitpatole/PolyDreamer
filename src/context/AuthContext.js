import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

const AuthContext = createContext(null);

const STORAGE_KEY_USER = '@polydreamer_user';
const STORAGE_KEY_TOKEN = '@polydreamer_token';

async function generateId() {
  const randomBytes = await Crypto.getRandomBytesAsync(16);
  return Array.from(randomBytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function generateSalt() {
  const randomBytes = await Crypto.getRandomBytesAsync(16);
  return Array.from(randomBytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function hashPassword(password, salt) {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${salt}:${password}`);
}

async function generateToken(email) {
  const randomBytes = await Crypto.getRandomBytesAsync(32);
  const randomHex = Array.from(randomBytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `${email}:${randomHex}:${Date.now()}`
  );
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
      const storedUser = await AsyncStorage.getItem(STORAGE_KEY_USER);
      const storedToken = await AsyncStorage.getItem(STORAGE_KEY_TOKEN);
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      }
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function signUp(name, email, password) {
    const usersRaw = await AsyncStorage.getItem('@polydreamer_users');
    const users = usersRaw ? JSON.parse(usersRaw) : [];

    if (users.find((u) => u.email === email)) {
      throw new Error('An account with this email already exists.');
    }

    // Generate a unique salt per user and hash the password with it
    const salt = await generateSalt();
    const hashedPassword = await hashPassword(password, salt);
    const id = await generateId();

    const newUser = { id, name, email, hashedPassword, salt };
    users.push(newUser);
    await AsyncStorage.setItem('@polydreamer_users', JSON.stringify(users));

    const token = await generateToken(email);
    const sessionUser = { id: newUser.id, name, email };

    await AsyncStorage.setItem(STORAGE_KEY_USER, JSON.stringify(sessionUser));
    await AsyncStorage.setItem(STORAGE_KEY_TOKEN, token);

    setUser(sessionUser);
    setToken(token);
  }

  async function signIn(email, password) {
    const usersRaw = await AsyncStorage.getItem('@polydreamer_users');
    const users = usersRaw ? JSON.parse(usersRaw) : [];

    const userRecord = users.find((u) => u.email === email);
    if (!userRecord) {
      throw new Error('Invalid email or password.');
    }

    // Re-derive the hash using the stored salt and compare
    const hashedPassword = await hashPassword(password, userRecord.salt);
    if (hashedPassword !== userRecord.hashedPassword) {
      throw new Error('Invalid email or password.');
    }

    const token = await generateToken(email);
    const sessionUser = { id: userRecord.id, name: userRecord.name, email: userRecord.email };

    await AsyncStorage.setItem(STORAGE_KEY_USER, JSON.stringify(sessionUser));
    await AsyncStorage.setItem(STORAGE_KEY_TOKEN, token);

    setUser(sessionUser);
    setToken(token);
  }

  async function signOut() {
    await AsyncStorage.removeItem(STORAGE_KEY_USER);
    await AsyncStorage.removeItem(STORAGE_KEY_TOKEN);
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
