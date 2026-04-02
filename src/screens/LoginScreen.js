import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function LoginScreen({ navigation }) {
  const { signIn } = useAuth();
  const { theme } = useTheme();
  const c = theme.colors;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password) {
      Alert.alert('Missing fields', 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      await signIn(email.trim().toLowerCase(), password);
    } catch (err) {
      Alert.alert('Login Failed', err.message);
    } finally {
      setLoading(false);
    }
  }

  const styles = makeStyles(c);

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: c.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <LinearGradient
          colors={[c.gradientStart, c.gradientEnd]}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.appName}>PolyDreamer</Text>
          <Text style={styles.tagline}>Generate AI images from your imagination</Text>
        </LinearGradient>

        <View style={[styles.card, { backgroundColor: c.surface, shadowColor: c.text }]}>
          <Text style={[styles.title, { color: c.text }]}>Welcome back</Text>
          <Text style={[styles.subtitle, { color: c.textSecondary }]}>Sign in to continue</Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: c.textSecondary }]}>Email</Text>
            <TextInput
              style={[styles.input, { backgroundColor: c.inputBg, color: c.text, borderColor: c.border }]}
              placeholder="you@example.com"
              placeholderTextColor={c.placeholder}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: c.textSecondary }]}>Password</Text>
            <View style={[styles.passwordContainer, { backgroundColor: c.inputBg, borderColor: c.border }]}>
              <TextInput
                style={[styles.passwordInput, { color: c.text }]}
                placeholder="••••••••"
                placeholderTextColor={c.placeholder}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword((v) => !v)} style={styles.eyeBtn}>
                <Text style={{ color: c.primary, fontWeight: '600' }}>
                  {showPassword ? 'Hide' : 'Show'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.btn, { opacity: loading ? 0.7 : 1 }]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[c.gradientStart, c.gradientEnd]}
              style={styles.btnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnText}>Sign In</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: c.textSecondary }]}>
              Don't have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Text style={[styles.link, { color: c.primary }]}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function makeStyles(c) {
  return StyleSheet.create({
    flex: { flex: 1 },
    container: { flexGrow: 1 },
    headerGradient: {
      paddingTop: 80,
      paddingBottom: 50,
      paddingHorizontal: 24,
      alignItems: 'center',
    },
    appName: {
      fontSize: 36,
      fontWeight: '800',
      color: '#fff',
      letterSpacing: 1,
    },
    tagline: {
      fontSize: 14,
      color: 'rgba(255,255,255,0.85)',
      marginTop: 8,
      textAlign: 'center',
    },
    card: {
      margin: 20,
      marginTop: -24,
      borderRadius: 20,
      padding: 24,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 5,
    },
    title: { fontSize: 24, fontWeight: '700', marginBottom: 4 },
    subtitle: { fontSize: 14, marginBottom: 24 },
    inputGroup: { marginBottom: 16 },
    label: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
    input: {
      borderRadius: 12,
      borderWidth: 1,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 15,
    },
    passwordContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 12,
      borderWidth: 1,
      paddingHorizontal: 14,
    },
    passwordInput: { flex: 1, paddingVertical: 12, fontSize: 15 },
    eyeBtn: { paddingVertical: 12, paddingLeft: 8 },
    btn: { marginTop: 8, borderRadius: 12, overflow: 'hidden' },
    btnGradient: { paddingVertical: 15, alignItems: 'center' },
    btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
    footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 20,
      alignItems: 'center',
    },
    footerText: { fontSize: 14 },
    link: { fontSize: 14, fontWeight: '700' },
  });
}
