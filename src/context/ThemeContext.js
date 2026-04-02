import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext(null);

const STORAGE_KEY = '@polydreamer_theme';

export const lightTheme = {
  dark: false,
  colors: {
    background: '#F8F9FA',
    surface: '#FFFFFF',
    primary: '#6C63FF',
    primaryDark: '#5A52D5',
    secondary: '#FF6584',
    text: '#1A1A2E',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    card: '#FFFFFF',
    placeholder: '#9CA3AF',
    error: '#EF4444',
    success: '#10B981',
    inputBg: '#F3F4F6',
    tabBar: '#FFFFFF',
    tabBarBorder: '#E5E7EB',
    overlay: 'rgba(0,0,0,0.5)',
    gradientStart: '#6C63FF',
    gradientEnd: '#FF6584',
    skeleton: '#E5E7EB',
  },
};

export const darkTheme = {
  dark: true,
  colors: {
    background: '#0F0F1A',
    surface: '#1A1A2E',
    primary: '#7C73FF',
    primaryDark: '#6C63FF',
    secondary: '#FF6584',
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    border: '#2D2D44',
    card: '#1E1E30',
    placeholder: '#6B7280',
    error: '#F87171',
    success: '#34D399',
    inputBg: '#252540',
    tabBar: '#1A1A2E',
    tabBarBorder: '#2D2D44',
    overlay: 'rgba(0,0,0,0.7)',
    gradientStart: '#6C63FF',
    gradientEnd: '#FF6584',
    skeleton: '#2D2D44',
  },
};

export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState('system');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((val) => {
      if (val) setThemeMode(val);
    });
  }, []);

  const effectiveDark =
    themeMode === 'dark' || (themeMode === 'system' && systemScheme === 'dark');

  const theme = effectiveDark ? darkTheme : lightTheme;

  async function setTheme(mode) {
    setThemeMode(mode);
    await AsyncStorage.setItem(STORAGE_KEY, mode);
  }

  return (
    <ThemeContext.Provider value={{ theme, themeMode, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
