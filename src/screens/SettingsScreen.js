import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { saveApiKey, getApiKey } from '../services/api';

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const { theme, themeMode, setTheme } = useTheme();
  const c = theme.colors;

  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [savedApiKey, setSavedApiKey] = useState(null);
  const [savingKey, setSavingKey] = useState(false);

  useEffect(() => {
    getApiKey().then((key) => {
      if (key) setSavedApiKey(key);
    });
  }, []);

  async function handleSaveApiKey() {
    setSavingKey(true);
    try {
      await saveApiKey(apiKey.trim());
      setSavedApiKey(apiKey.trim() || null);
      setApiKey('');
      Alert.alert('Saved', apiKey.trim() ? 'API key saved successfully!' : 'API key removed.');
    } catch (err) {
      Alert.alert('Error', 'Failed to save API key.');
    } finally {
      setSavingKey(false);
    }
  }

  async function handleSignOut() {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => signOut() },
    ]);
  }

  const styles = makeStyles(c);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={[c.gradientStart, c.gradientEnd]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase() || '?'}</Text>
          </View>
          <Text style={styles.userName}>{user?.name || 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email || ''}</Text>
        </LinearGradient>

        {/* API Key Section */}
        <View style={[styles.section, { backgroundColor: c.surface }]}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>🔑 Pollinations API Key</Text>
          <Text style={[styles.sectionDesc, { color: c.textSecondary }]}>
            {savedApiKey
              ? '✓ API key configured. You are using the premium tier.'
              : 'No API key set. Using free tier (rate limited).'}
          </Text>

          {savedApiKey && (
            <View style={[styles.keyBadge, { backgroundColor: c.inputBg }]}>
              <Text style={[styles.keyBadgeText, { color: c.textSecondary }]}>
                {showApiKey ? savedApiKey : '••••••••••••••••••••'}
              </Text>
              <TouchableOpacity onPress={() => setShowApiKey((v) => !v)}>
                <Text style={{ color: c.primary, fontWeight: '600', fontSize: 12 }}>
                  {showApiKey ? 'Hide' : 'Show'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <TextInput
            style={[styles.input, { backgroundColor: c.inputBg, color: c.text, borderColor: c.border }]}
            placeholder={savedApiKey ? 'Enter new key to replace...' : 'Paste your API key here...'}
            placeholderTextColor={c.placeholder}
            value={apiKey}
            onChangeText={setApiKey}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />

          <View style={styles.keyButtons}>
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: c.primary, flex: 2 }]}
              onPress={handleSaveApiKey}
              disabled={savingKey}
            >
              {savingKey ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.btnText}>Save Key</Text>
              )}
            </TouchableOpacity>
            {savedApiKey && (
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: c.error, flex: 1, marginLeft: 8 }]}
                onPress={() => {
                  setApiKey('');
                  handleSaveApiKey();
                }}
              >
                <Text style={styles.btnText}>Remove</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Theme Section */}
        <View style={[styles.section, { backgroundColor: c.surface }]}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>🎨 Appearance</Text>

          {['system', 'light', 'dark'].map((mode) => (
            <TouchableOpacity
              key={mode}
              style={[
                styles.themeRow,
                { borderColor: themeMode === mode ? c.primary : c.border },
                themeMode === mode && { backgroundColor: `${c.primary}15` },
              ]}
              onPress={() => setTheme(mode)}
            >
              <Text style={styles.themeEmoji}>
                {mode === 'system' ? '⚙️' : mode === 'light' ? '☀️' : '🌙'}
              </Text>
              <Text style={[styles.themeLabel, { color: c.text }]}>
                {mode.charAt(0).toUpperCase() + mode.slice(1)} Mode
              </Text>
              {themeMode === mode && (
                <Text style={[styles.checkmark, { color: c.primary }]}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* About Section */}
        <View style={[styles.section, { backgroundColor: c.surface }]}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>ℹ️ About</Text>
          <InfoRow label="Version" value="1.0.0" c={c} />
          <InfoRow label="API Provider" value="Pollinations AI" c={c} />
          <InfoRow label="Free Tier" value="Rate limited · No key needed" c={c} />
          <InfoRow label="Premium Tier" value="Faster · Higher quality" c={c} />
        </View>

        {/* Sign Out */}
        <TouchableOpacity
          style={[styles.signOutBtn, { backgroundColor: c.surface, borderColor: c.error }]}
          onPress={handleSignOut}
        >
          <Text style={[styles.signOutText, { color: c.error }]}>Sign Out</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ label, value, c }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 }}>
      <Text style={{ color: c.textSecondary, fontSize: 14 }}>{label}</Text>
      <Text style={{ color: c.text, fontSize: 14, fontWeight: '500' }}>{value}</Text>
    </View>
  );
}

function makeStyles(c) {
  return StyleSheet.create({
    safe: { flex: 1 },
    header: {
      paddingTop: 30,
      paddingBottom: 36,
      alignItems: 'center',
    },
    avatar: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: 'rgba(255,255,255,0.3)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    avatarText: { fontSize: 30, color: '#fff', fontWeight: '700' },
    userName: { fontSize: 20, fontWeight: '700', color: '#fff' },
    userEmail: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
    section: {
      margin: 12,
      marginBottom: 0,
      borderRadius: 16,
      padding: 16,
    },
    sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
    sectionDesc: { fontSize: 13, lineHeight: 18, marginBottom: 12 },
    keyBadge: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderRadius: 8,
      padding: 10,
      marginBottom: 10,
    },
    keyBadgeText: { fontSize: 13, flex: 1, marginRight: 8 },
    input: {
      borderRadius: 12,
      borderWidth: 1,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 15,
      marginBottom: 10,
    },
    keyButtons: { flexDirection: 'row' },
    btn: {
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: 'center',
    },
    btnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
    themeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 12,
      borderWidth: 1.5,
      padding: 12,
      marginBottom: 8,
    },
    themeEmoji: { fontSize: 18, marginRight: 10 },
    themeLabel: { flex: 1, fontSize: 15, fontWeight: '500' },
    checkmark: { fontSize: 16, fontWeight: '700' },
    signOutBtn: {
      margin: 12,
      marginTop: 16,
      borderRadius: 16,
      borderWidth: 1.5,
      paddingVertical: 16,
      alignItems: 'center',
    },
    signOutText: { fontSize: 16, fontWeight: '700' },
  });
}
