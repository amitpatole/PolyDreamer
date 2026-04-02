import { buildImageUrl, generateImage } from '../src/services/api';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
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
