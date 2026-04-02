import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Share,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { loadGallery, deleteFromGallery } from '../services/api';

export default function GalleryScreen({ navigation }) {
  const { theme } = useTheme();
  const c = theme.colors;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchGallery();
    }, [])
  );

  async function fetchGallery(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const gallery = await loadGallery();
      setItems(gallery);
    } catch (err) {
      Alert.alert('Error', 'Failed to load gallery.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function handleDelete(id) {
    Alert.alert('Delete Image', 'Remove this image from your gallery?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteFromGallery(id);
          setItems((prev) => prev.filter((i) => i.id !== id));
        },
      },
    ]);
  }

  async function handleShare(item) {
    try {
      await Share.share({
        message: `Check out this AI-generated image!\nPrompt: "${item.prompt}"\n${item.url}`,
        url: item.url,
      });
    } catch (err) {
      Alert.alert('Share error', err.message);
    }
  }

  const styles = makeStyles(c);

  function renderItem({ item }) {
    return (
      <View style={[styles.card, { backgroundColor: c.card }]}>
        <TouchableOpacity
          onPress={() => navigation.navigate('ImageView', { item })}
          activeOpacity={0.9}
        >
          <Image source={{ uri: item.url }} style={styles.thumbnail} resizeMode="cover" />
        </TouchableOpacity>
        <View style={styles.cardBody}>
          <Text style={[styles.promptText, { color: c.text }]} numberOfLines={2}>
            {item.prompt}
          </Text>
          <View style={styles.meta}>
            <Text style={[styles.metaText, { color: c.textSecondary }]}>
              {item.model} · {item.width}×{item.height}
            </Text>
            <Text style={[styles.dateText, { color: c.placeholder }]}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
        <View style={[styles.cardActions, { borderTopColor: c.border }]}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => handleShare(item)}>
            <Text style={[styles.actionText, { color: c.primary }]}>📤 Share</Text>
          </TouchableOpacity>
          <View style={[styles.divider, { backgroundColor: c.border }]} />
          <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item.id)}>
            <Text style={[styles.actionText, { color: c.error }]}>🗑 Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: c.background }]}>
        <ActivityIndicator color={c.primary} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]} edges={['top']}>
      <View style={[styles.topBar, { borderBottomColor: c.border }]}>
        <Text style={[styles.topTitle, { color: c.text }]}>🖼 Gallery</Text>
        <Text style={[styles.countText, { color: c.textSecondary }]}>{items.length} images</Text>
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🎨</Text>
          <Text style={[styles.emptyTitle, { color: c.text }]}>No images yet</Text>
          <Text style={[styles.emptySubtitle, { color: c.textSecondary }]}>
            Generate some images and they'll appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchGallery(true)}
              tintColor={c.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

function makeStyles(c) {
  return StyleSheet.create({
    safe: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    topBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    topTitle: { fontSize: 22, fontWeight: '800' },
    countText: { fontSize: 13 },
    list: { padding: 12 },
    card: {
      borderRadius: 16,
      marginBottom: 16,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
    thumbnail: { width: '100%', height: 220 },
    cardBody: { padding: 12 },
    promptText: { fontSize: 14, fontWeight: '500', lineHeight: 20 },
    meta: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 6,
    },
    metaText: { fontSize: 12 },
    dateText: { fontSize: 12 },
    cardActions: {
      flexDirection: 'row',
      borderTopWidth: StyleSheet.hairlineWidth,
    },
    actionBtn: {
      flex: 1,
      paddingVertical: 12,
      alignItems: 'center',
    },
    actionText: { fontSize: 14, fontWeight: '600' },
    divider: { width: StyleSheet.hairlineWidth },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
    },
    emptyEmoji: { fontSize: 60, marginBottom: 16 },
    emptyTitle: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
    emptySubtitle: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
  });
}
