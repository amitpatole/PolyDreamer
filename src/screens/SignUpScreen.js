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

export default function SignUpScreen({ navigation }) {
  const { signUp } = useAuth();
  const { theme } = useTheme();
  const c = theme.colors;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSignUp() {
    if (!name.trim() || !email.trim() || !password || !confirm) {
      Alert.alert('Missing fields', 'Please fill in all fields.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email.trim())) {
      Alert.alert('Invalid email', 'Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak password', 'Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Password mismatch', 'Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await signUp(name.trim(), email.trim().toLowerCase(), password);
    } catch (err) {
      Alert.alert('Sign Up Failed', err.message);
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
          <Text style={styles.tagline}>Start your creative journey</Text>
        </LinearGradient>

        <View style={[styles.card, { backgroundColor: c.surface, shadowColor: c.text }]}>
          <Text style={[styles.title, { color: c.text }]}>Create account</Text>
          <Text style={[styles.subtitle, { color: c.textSecondary }]}>Join PolyDreamer today</Text>

          <Field label="Full Name" c={c} styles={styles}>
            <TextInput
              style={[styles.input, { backgroundColor: c.inputBg, color: c.text, borderColor: c.border }]}
              placeholder="Jane Smith"
              placeholderTextColor={c.placeholder}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </Field>

          <Field label="Email" c={c} styles={styles}>
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
          </Field>

          <Field label="Password" c={c} styles={styles}>
            <View style={[styles.passwordContainer, { backgroundColor: c.inputBg, borderColor: c.border }]}>
              <TextInput
                style={[styles.passwordInput, { color: c.text }]}
                placeholder="Min. 6 characters"
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
          </Field>

          <Field label="Confirm Password" c={c} styles={styles}>
            <TextInput
              style={[styles.input, { backgroundColor: c.inputBg, color: c.text, borderColor: c.border }]}
              placeholder="••••••••"
              placeholderTextColor={c.placeholder}
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry={!showPassword}
            />
          </Field>

          <TouchableOpacity
            style={[styles.btn, { opacity: loading ? 0.7 : 1 }]}
            onPress={handleSignUp}
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
                <Text style={styles.btnText}>Create Account</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: c.textSecondary }]}>
              Already have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={[styles.link, { color: c.primary }]}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({ label, c, styles, children }) {
  return (
    <View style={styles.inputGroup}>
      <Text style={[styles.label, { color: c.textSecondary }]}>{label}</Text>
      {children}
    </View>
  );
}

function makeStyles(c) {
  return StyleSheet.create({
    flex: { flex: 1 },
    container: { flexGrow: 1 },
    headerGradient: {
      paddingTop: 70,
      paddingBottom: 40,
      paddingHorizontal: 24,
      alignItems: 'center',
    },
    appName: {
      fontSize: 32,
      fontWeight: '800',
      color: '#fff',
      letterSpacing: 1,
    },
    tagline: {
      fontSize: 14,
      color: 'rgba(255,255,255,0.85)',
      marginTop: 6,
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
    title: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
    subtitle: { fontSize: 14, marginBottom: 20 },
    inputGroup: { marginBottom: 14 },
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
      marginTop: 18,
      alignItems: 'center',
    },
    footerText: { fontSize: 14 },
    link: { fontSize: 14, fontWeight: '700' },
  });
}
