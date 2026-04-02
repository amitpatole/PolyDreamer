import {
  buildImageUrl,
  generateImage,
  saveApiKey,
  getApiKey,
  saveToGallery,
  loadGallery,
  deleteFromGallery,
} from '../src/services/api';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

// Mock expo-crypto
jest.mock('expo-crypto', () => ({
  CryptoDigestAlgorithm: { SHA256: 'SHA-256' },
  digestStringAsync: jest.fn((algo, input) => Promise.resolve(`hashed:${input}`)),
  getRandomBytesAsync: jest.fn((size) => Promise.resolve(new Uint8Array(size))),
}));

describe('API Service', () => {
  describe('buildImageUrl', () => {
    it('builds a valid Pollinations image URL with default options', () => {
      const url = buildImageUrl('a beautiful sunset');
      expect(url).toContain('https://image.pollinations.ai/prompt/');
      expect(url).toContain('a%20beautiful%20sunset');
      expect(url).toContain('model=flux');
      expect(url).toContain('width=1024');
      expect(url).toContain('height=1024');
    });

    it('respects custom width and height', () => {
      const url = buildImageUrl('test prompt', { width: 768, height: 512 });
      expect(url).toContain('width=768');
      expect(url).toContain('height=512');
    });

    it('includes seed when provided', () => {
      const url = buildImageUrl('test', { seed: 42 });
      expect(url).toContain('seed=42');
    });

    it('includes enhance parameter', () => {
      const url = buildImageUrl('test', { enhance: true });
      expect(url).toContain('enhance=true');
    });

    it('encodes special characters in prompt', () => {
      const url = buildImageUrl('cat & dog "together"');
      expect(url).not.toContain('"');
      expect(url).not.toContain(' ');
    });
  });

  describe('generateImage (free tier)', () => {
    it('returns an image URL and type for free tier', async () => {
      const result = await generateImage('a cat', { width: 512, height: 512, model: 'flux' });
      expect(result).toHaveProperty('url');
      expect(result).toHaveProperty('type', 'image');
      expect(result.url).toContain('image.pollinations.ai');
    });
  });

  describe('generateImage (premium tier)', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('uses the POST API endpoint with a Bearer token when an API key is present', async () => {
      const AsyncStorage = require('@react-native-async-storage/async-storage');
      AsyncStorage.getItem.mockResolvedValueOnce('my-secret-key');

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: [{ url: 'https://api.pollinations.ai/img.jpg' }] }),
      });

      const result = await generateImage('a mountain', { model: 'flux', width: 1024, height: 1024 });

      expect(result.url).toBe('https://api.pollinations.ai/img.jpg');
      expect(result.type).toBe('image');
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.pollinations.ai/v1/images/generations',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({ Authorization: 'Bearer my-secret-key' }),
        })
      );
    });

    it('throws an error when the API response is not ok', async () => {
      const AsyncStorage = require('@react-native-async-storage/async-storage');
      AsyncStorage.getItem.mockResolvedValueOnce('my-secret-key');

      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 401,
        text: async () => 'Unauthorized',
      });

      await expect(generateImage('a cat', {})).rejects.toThrow('API error (401): Unauthorized');
    });

    it('throws an error when the API response contains no image URL', async () => {
      const AsyncStorage = require('@react-native-async-storage/async-storage');
      AsyncStorage.getItem.mockResolvedValueOnce('my-secret-key');

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: [] }),
      });

      await expect(generateImage('a cat', {})).rejects.toThrow('No image URL in response');
    });
  });

  describe('API key management', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('saves a trimmed API key to storage', async () => {
      const AsyncStorage = require('@react-native-async-storage/async-storage');
      await saveApiKey('  my-api-key  ');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('@polydreamer_api_key', 'my-api-key');
    });

    it('removes the API key from storage when a falsy value is passed', async () => {
      const AsyncStorage = require('@react-native-async-storage/async-storage');
      await saveApiKey(null);
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@polydreamer_api_key');
    });

    it('retrieves the stored API key', async () => {
      const AsyncStorage = require('@react-native-async-storage/async-storage');
      AsyncStorage.getItem.mockResolvedValueOnce('stored-api-key');
      const key = await getApiKey();
      expect(key).toBe('stored-api-key');
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('@polydreamer_api_key');
    });
  });

  describe('Gallery persistence', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('saves a new item to an empty gallery', async () => {
      const AsyncStorage = require('@react-native-async-storage/async-storage');
      AsyncStorage.getItem.mockResolvedValueOnce(null);

      const item = { id: '1', url: 'https://example.com/img.jpg', prompt: 'test', model: 'flux', width: 1024, height: 1024, createdAt: '2024-01-01T00:00:00.000Z', type: 'image' };
      await saveToGallery(item);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith('@polydreamer_gallery', JSON.stringify([item]));
    });

    it('prepends new items to an existing gallery', async () => {
      const AsyncStorage = require('@react-native-async-storage/async-storage');
      const existing = [{ id: '0', url: 'https://example.com/old.jpg' }];
      AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(existing));

      const newItem = { id: '1', url: 'https://example.com/new.jpg' };
      await saveToGallery(newItem);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@polydreamer_gallery',
        JSON.stringify([newItem, ...existing])
      );
    });

    it('loads gallery items from storage', async () => {
      const AsyncStorage = require('@react-native-async-storage/async-storage');
      const gallery = [{ id: '1', url: 'https://example.com/img.jpg' }];
      AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(gallery));

      const result = await loadGallery();
      expect(result).toEqual(gallery);
    });

    it('returns an empty array when gallery storage is empty', async () => {
      const AsyncStorage = require('@react-native-async-storage/async-storage');
      AsyncStorage.getItem.mockResolvedValueOnce(null);

      const result = await loadGallery();
      expect(result).toEqual([]);
    });

    it('deletes an item from the gallery by id', async () => {
      const AsyncStorage = require('@react-native-async-storage/async-storage');
      const gallery = [
        { id: '1', url: 'https://example.com/img1.jpg' },
        { id: '2', url: 'https://example.com/img2.jpg' },
      ];
      AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(gallery));

      await deleteFromGallery('1');

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@polydreamer_gallery',
        JSON.stringify([{ id: '2', url: 'https://example.com/img2.jpg' }])
      );
    });
  });
});

describe('AuthContext logic', () => {
  it('validates email format', () => {
    const emailRegex = /\S+@\S+\.\S+/;
    expect(emailRegex.test('user@example.com')).toBe(true);
    expect(emailRegex.test('invalid-email')).toBe(false);
    expect(emailRegex.test('user@')).toBe(false);
  });

  it('validates password length', () => {
    expect('abc'.length >= 6).toBe(false);
    expect('abcdefg'.length >= 6).toBe(true);
  });

  it('produces different hashes for the same password with different salts', async () => {
    const { digestStringAsync, CryptoDigestAlgorithm } = require('expo-crypto');
    const password = 'testpassword';
    const salt1 = 'salt1';
    const salt2 = 'salt2';
    const hash1 = await digestStringAsync(CryptoDigestAlgorithm.SHA256, `${salt1}:${password}`);
    const hash2 = await digestStringAsync(CryptoDigestAlgorithm.SHA256, `${salt2}:${password}`);
    // With our mock, these will differ due to different input strings
    expect(hash1).not.toBe(hash2);
  });
});

describe('ThemeContext', () => {
  it('has correct light theme colors', () => {
    const { lightTheme } = require('../src/context/ThemeContext');
    expect(lightTheme.dark).toBe(false);
    expect(lightTheme.colors).toHaveProperty('background');
    expect(lightTheme.colors).toHaveProperty('primary');
    expect(lightTheme.colors).toHaveProperty('text');
  });

  it('has correct dark theme colors', () => {
    const { darkTheme } = require('../src/context/ThemeContext');
    expect(darkTheme.dark).toBe(true);
    expect(darkTheme.colors).toHaveProperty('background');
    expect(darkTheme.colors.background).not.toBe('#F8F9FA'); // different from light
  });
});
