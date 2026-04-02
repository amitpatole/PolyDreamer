import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
  Share,
  Animated,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Crypto from 'expo-crypto';
import { useTheme } from '../context/ThemeContext';
import { generateImage, saveToGallery } from '../services/api';

const ASPECT_RATIOS = [
  { label: 'Square', width: 1024, height: 1024 },
  { label: 'Portrait', width: 768, height: 1024 },
  { label: 'Landscape', width: 1024, height: 768 },
];

const MODELS = [
  { label: 'Flux', value: 'flux' },
  { label: 'Flux Realism', value: 'flux-realism' },
  { label: 'Flux Anime', value: 'flux-anime' },
  { label: 'Flux 3D', value: 'flux-3d' },
  { label: 'Turbo', value: 'turbo' },
];

export default function HomeScreen() {
  const { theme } = useTheme();
  const c = theme.colors;

  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState(null);
  const [selectedRatio, setSelectedRatio] = useState(0);
  const [selectedModel, setSelectedModel] = useState(0);
  const [enhance, setEnhance] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const styles = makeStyles(c);

  async function handleGenerate() {
    if (!prompt.trim()) {
      Alert.alert('Empty prompt', 'Please enter a prompt to generate an image.');
      return;
    }
    setLoading(true);
    setGeneratedUrl(null);
    try {
      const ratio = ASPECT_RATIOS[selectedRatio];
      const model = MODELS[selectedModel].value;
      // Use cryptographically secure random seed
      const randomBytes = await Crypto.getRandomBytesAsync(4);
      const seed = new DataView(randomBytes.buffer).getUint32(0);
      const result = await generateImage(prompt.trim(), {
        width: ratio.width,
        height: ratio.height,
        model,
        enhance,
        seed,
      });
      setGeneratedUrl(result.url);
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();

      // Auto-save to gallery
      await saveToGallery({
        id: Date.now().toString(),
        url: result.url,
        prompt: prompt.trim(),
        model,
        width: ratio.width,
        height: ratio.height,
        createdAt: new Date().toISOString(),
        type: 'image',
      });
    } catch (err) {
      Alert.alert('Generation Failed', err.message || 'Failed to generate image. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleShare() {
    if (!generatedUrl) return;
    try {
      await Share.share({
        message: `Check out this AI-generated image!\nPrompt: "${prompt}"\n${generatedUrl}`,
        url: generatedUrl,
      });
    } catch (err) {
      Alert.alert('Share error', err.message);
    }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <LinearGradient
          colors={[c.gradientStart, c.gradientEnd]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.headerTitle}>✨ Create</Text>
          <Text style={styles.headerSub}>Turn your words into stunning images</Text>
        </LinearGradient>

        {/* Prompt Input */}
        <View style={[styles.section, { backgroundColor: c.surface }]}>
          <Text style={[styles.sectionLabel, { color: c.text }]}>Your Prompt</Text>
          <TextInput
            style={[styles.promptInput, { backgroundColor: c.inputBg, color: c.text, borderColor: c.border }]}
            placeholder="A futuristic city at sunset, digital art..."
            placeholderTextColor={c.placeholder}
            value={prompt}
            onChangeText={setPrompt}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          <Text style={[styles.charCount, { color: c.textSecondary }]}>{prompt.length} characters</Text>
        </View>

        {/* Model Selection */}
        <View style={[styles.section, { backgroundColor: c.surface }]}>
          <Text style={[styles.sectionLabel, { color: c.text }]}>Model</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
            {MODELS.map((m, i) => (
              <TouchableOpacity
                key={m.value}
                onPress={() => setSelectedModel(i)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: selectedModel === i ? c.primary : c.inputBg,
                    borderColor: selectedModel === i ? c.primary : c.border,
                  },
                ]}
              >
                <Text style={[styles.chipText, { color: selectedModel === i ? '#fff' : c.textSecondary }]}>
                  {m.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Aspect Ratio */}
        <View style={[styles.section, { backgroundColor: c.surface }]}>
          <Text style={[styles.sectionLabel, { color: c.text }]}>Aspect Ratio</Text>
          <View style={styles.ratioRow}>
            {ASPECT_RATIOS.map((r, i) => (
              <TouchableOpacity
                key={r.label}
                onPress={() => setSelectedRatio(i)}
                style={[
                  styles.ratioBtn,
                  {
                    backgroundColor: selectedRatio === i ? c.primary : c.inputBg,
                    borderColor: selectedRatio === i ? c.primary : c.border,
                    flex: 1,
                  },
                ]}
              >
                <Text style={[styles.ratioBtnText, { color: selectedRatio === i ? '#fff' : c.textSecondary }]}>
                  {r.label}
                </Text>
                <Text style={[styles.ratioDims, { color: selectedRatio === i ? 'rgba(255,255,255,0.8)' : c.placeholder }]}>
                  {r.width}×{r.height}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Options */}
        <View style={[styles.section, { backgroundColor: c.surface }]}>
          <TouchableOpacity style={styles.optionRow} onPress={() => setEnhance((v) => !v)}>
            <View>
              <Text style={[styles.sectionLabel, { color: c.text }]}>Enhance Prompt</Text>
              <Text style={[styles.optionDesc, { color: c.textSecondary }]}>
                AI-powered prompt improvement
              </Text>
            </View>
            <View style={[styles.toggle, { backgroundColor: enhance ? c.primary : c.border }]}>
              <View style={[styles.toggleKnob, { left: enhance ? 20 : 2 }]} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Generate Button */}
        <TouchableOpacity
          style={[styles.generateBtn, { opacity: loading ? 0.7 : 1 }]}
          onPress={handleGenerate}
          disabled={loading}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={[c.gradientStart, c.gradientEnd]}
            style={styles.generateBtnGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {loading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={[styles.generateBtnText, { marginLeft: 10 }]}>Generating...</Text>
              </View>
            ) : (
              <Text style={styles.generateBtnText}>🎨 Generate Image</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Generated Image */}
        {loading && (
          <View style={[styles.placeholderBox, { backgroundColor: c.skeleton }]}>
            <ActivityIndicator color={c.primary} size="large" />
            <Text style={[styles.loadingText, { color: c.textSecondary }]}>
              Creating your masterpiece...
            </Text>
          </View>
        )}

        {generatedUrl && !loading && (
          <Animated.View style={[styles.resultCard, { backgroundColor: c.surface, opacity: fadeAnim }]}>
            <Image
              source={{ uri: generatedUrl }}
              style={styles.resultImage}
              resizeMode="cover"
            />
            <View style={styles.resultActions}>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: c.inputBg }]} onPress={handleShare}>
                <Text style={[styles.actionBtnText, { color: c.text }]}>📤 Share</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: c.primary }]}
                onPress={() => {
                  setPrompt('');
                  setGeneratedUrl(null);
                  fadeAnim.setValue(0);
                }}
              >
                <Text style={[styles.actionBtnText, { color: '#fff' }]}>🔄 New</Text>
              </TouchableOpacity>
            </View>
            <Text style={[styles.savedNote, { color: c.textSecondary }]}>
              ✓ Saved to gallery automatically
            </Text>
          </Animated.View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(c) {
  return StyleSheet.create({
    safe: { flex: 1 },
    scroll: { flex: 1 },
    container: { flexGrow: 1 },
    header: {
      paddingTop: 24,
      paddingBottom: 28,
      paddingHorizontal: 24,
    },
    headerTitle: { fontSize: 28, fontWeight: '800', color: '#fff' },
    headerSub: { fontSize: 14, color: 'rgba(255,255,255,0.85)', marginTop: 4 },
    section: {
      margin: 12,
      marginBottom: 0,
      borderRadius: 16,
      padding: 16,
    },
    sectionLabel: { fontSize: 15, fontWeight: '700', marginBottom: 10 },
    promptInput: {
      borderRadius: 12,
      borderWidth: 1,
      padding: 14,
      fontSize: 15,
      minHeight: 100,
    },
    charCount: { fontSize: 11, textAlign: 'right', marginTop: 4 },
    chipRow: { flexDirection: 'row' },
    chip: {
      borderRadius: 20,
      borderWidth: 1,
      paddingHorizontal: 14,
      paddingVertical: 7,
      marginRight: 8,
    },
    chipText: { fontSize: 13, fontWeight: '600' },
    ratioRow: { flexDirection: 'row', gap: 8 },
    ratioBtn: {
      borderRadius: 12,
      borderWidth: 1,
      padding: 10,
      alignItems: 'center',
    },
    ratioBtnText: { fontSize: 13, fontWeight: '600' },
    ratioDims: { fontSize: 10, marginTop: 2 },
    optionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    optionDesc: { fontSize: 12, marginTop: 2 },
    toggle: {
      width: 44,
      height: 26,
      borderRadius: 13,
      justifyContent: 'center',
      position: 'relative',
    },
    toggleKnob: {
      position: 'absolute',
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: '#fff',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2,
    },
    generateBtn: { margin: 12, marginTop: 16, borderRadius: 16, overflow: 'hidden' },
    generateBtnGradient: { paddingVertical: 16, alignItems: 'center' },
    generateBtnText: { color: '#fff', fontWeight: '700', fontSize: 17 },
    loadingRow: { flexDirection: 'row', alignItems: 'center' },
    placeholderBox: {
      margin: 12,
      height: 300,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    loadingText: { marginTop: 16, fontSize: 14, fontWeight: '500' },
    resultCard: {
      margin: 12,
      borderRadius: 16,
      overflow: 'hidden',
    },
    resultImage: { width: '100%', height: 300 },
    resultActions: {
      flexDirection: 'row',
      gap: 10,
      padding: 12,
    },
    actionBtn: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: 'center',
    },
    actionBtnText: { fontWeight: '700', fontSize: 14 },
    savedNote: { textAlign: 'center', fontSize: 12, paddingBottom: 12 },
  });
}
