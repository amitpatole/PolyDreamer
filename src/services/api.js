import AsyncStorage from '@react-native-async-storage/async-storage';

const API_KEY_STORAGE = '@polydreamer_api_key';
const GALLERY_STORAGE = '@polydreamer_gallery';

// Pollinations AI base URLs
const POLLINATIONS_IMAGE_BASE = 'https://image.pollinations.ai/prompt';
const POLLINATIONS_API_BASE = 'https://api.pollinations.ai/v1';

/**
 * Build an image URL using the Pollinations free-tier endpoint.
 * @param {string} prompt
 * @param {object} opts
 * @returns {string}
 */
export function buildImageUrl(prompt, opts = {}) {
  const {
    width = 1024,
    height = 1024,
    model = 'flux',
    seed,
    nologo = true,
    enhance = false,
  } = opts;

  const encoded = encodeURIComponent(prompt);
  const params = new URLSearchParams({
    width: String(width),
    height: String(height),
    model,
    nologo: String(nologo),
    enhance: String(enhance),
  });
  if (seed !== undefined) params.set('seed', String(seed));

  return `${POLLINATIONS_IMAGE_BASE}/${encoded}?${params.toString()}`;
}

/**
 * Generate an image via the Pollinations API.
 * Falls back to free-tier URL if no API key is provided.
 * @param {string} prompt
 * @param {object} opts
 * @returns {Promise<{url: string, type: 'image'}>}
 */
export async function generateImage(prompt, opts = {}) {
  const apiKey = await AsyncStorage.getItem(API_KEY_STORAGE);

  if (apiKey) {
    // Use API endpoint with key
    const response = await fetch(`${POLLINATIONS_API_BASE}/images/generations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: opts.model || 'flux',
        prompt,
        width: opts.width || 1024,
        height: opts.height || 1024,
        n: 1,
        nologo: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const url = data?.data?.[0]?.url || data?.url;
    if (!url) throw new Error('No image URL in response');
    return { url, type: 'image' };
  }

  // Free tier: direct URL
  const url = buildImageUrl(prompt, opts);
  return { url, type: 'image' };
}

/**
 * Save & retrieve the user's API key.
 */
export async function saveApiKey(key) {
  if (key) {
    await AsyncStorage.setItem(API_KEY_STORAGE, key.trim());
  } else {
    await AsyncStorage.removeItem(API_KEY_STORAGE);
  }
}

export async function getApiKey() {
  return AsyncStorage.getItem(API_KEY_STORAGE);
}

/**
 * Gallery persistence helpers.
 */
export async function saveToGallery(item) {
  const raw = await AsyncStorage.getItem(GALLERY_STORAGE);
  const gallery = raw ? JSON.parse(raw) : [];
  gallery.unshift(item);
  await AsyncStorage.setItem(GALLERY_STORAGE, JSON.stringify(gallery));
}

export async function loadGallery() {
  const raw = await AsyncStorage.getItem(GALLERY_STORAGE);
  return raw ? JSON.parse(raw) : [];
}

export async function deleteFromGallery(id) {
  const raw = await AsyncStorage.getItem(GALLERY_STORAGE);
  const gallery = raw ? JSON.parse(raw) : [];
  const updated = gallery.filter((item) => item.id !== id);
  await AsyncStorage.setItem(GALLERY_STORAGE, JSON.stringify(updated));
}
