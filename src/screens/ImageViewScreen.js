import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Share,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ImageViewScreen({ route, navigation }) {
  const { item } = route.params;
  const { theme } = useTheme();
  const c = theme.colors;
  const [imageLoaded, setImageLoaded] = useState(false);

  async function handleShare() {
    try {
      await Share.share({
        message: `AI-generated image\nPrompt: "${item.prompt}"\n${item.url}`,
        url: item.url,
      });
    } catch (err) {
      Alert.alert('Share error', err.message);
    }
  }

  const styles = makeStyles(c);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]} edges={['top', 'bottom']}>
      {/* Back button */}
      <View style={[styles.topBar, { borderBottomColor: c.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: c.primary }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.topTitle, { color: c.text }]}>Image Details</Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
          <Text style={[styles.shareText, { color: c.primary }]}>📤</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image */}
        <View style={[styles.imageContainer, { backgroundColor: c.skeleton }]}>
          {!imageLoaded && (
            <View style={styles.imageLoader}>
              <ActivityIndicator color={c.primary} size="large" />
            </View>
          )}
          <Image
            source={{ uri: item.url }}
            style={styles.image}
            resizeMode="contain"
            onLoad={() => setImageLoaded(true)}
          />
        </View>

        {/* Details */}
        <View style={[styles.detailCard, { backgroundColor: c.surface }]}>
          <Text style={[styles.detailTitle, { color: c.text }]}>Prompt</Text>
          <Text style={[styles.promptText, { color: c.text }]}>{item.prompt}</Text>

          <View style={[styles.divider, { backgroundColor: c.border }]} />

          <DetailRow icon="🤖" label="Model" value={item.model} c={c} />
          <DetailRow
            icon="📐"
            label="Resolution"
            value={`${item.width} × ${item.height}`}
            c={c}
          />
          <DetailRow
            icon="📅"
            label="Created"
            value={new Date(item.createdAt).toLocaleString()}
            c={c}
          />
        </View>

        {/* Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: c.primary }]}
            onPress={handleShare}
          >
            <Text style={styles.actionBtnText}>📤 Share</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailRow({ icon, label, value, c }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 }}>
      <Text style={{ fontSize: 16, marginRight: 10 }}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={{ color: c.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 2 }}>
          {label.toUpperCase()}
        </Text>
        <Text style={{ color: c.text, fontSize: 14 }}>{value}</Text>
      </View>
    </View>
  );
}

function makeStyles(c) {
  return StyleSheet.create({
    safe: { flex: 1 },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    backBtn: { padding: 4, minWidth: 60 },
    backText: { fontSize: 15, fontWeight: '600' },
    topTitle: { fontSize: 16, fontWeight: '700' },
    shareBtn: { padding: 4, minWidth: 60, alignItems: 'flex-end' },
    shareText: { fontSize: 20 },
    imageContainer: {
      width: SCREEN_WIDTH,
      height: SCREEN_WIDTH,
      justifyContent: 'center',
      alignItems: 'center',
    },
    imageLoader: {
      position: 'absolute',
      zIndex: 1,
    },
    image: { width: SCREEN_WIDTH, height: SCREEN_WIDTH },
    detailCard: {
      margin: 12,
      borderRadius: 16,
      padding: 16,
    },
    detailTitle: { fontSize: 14, fontWeight: '700', marginBottom: 8 },
    promptText: { fontSize: 15, lineHeight: 22 },
    divider: { height: StyleSheet.hairlineWidth, marginVertical: 14 },
    actionsRow: {
      paddingHorizontal: 12,
      gap: 10,
    },
    actionBtn: {
      borderRadius: 16,
      paddingVertical: 14,
      alignItems: 'center',
    },
    actionBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  });
}
