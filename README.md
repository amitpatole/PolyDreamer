# PolyDreamer

**PolyDreamer** is a cross-platform mobile app (Android & iOS) built with React Native (Expo) that lets you generate stunning images from text prompts using the [Pollinations AI](https://pollinations.ai) API. Sign up, log in, craft prompts, and watch your imagination come to life. 🎨

---

## Features

- 🔐 **User Authentication** – Sign up / sign in / sign out with secure local session management
- ✨ **AI Image Generation** – Generate images from text prompts using Pollinations AI
- 🤖 **Multiple Models** – Flux, Flux Realism, Flux Anime, Flux 3D, Turbo
- 📐 **Aspect Ratios** – Square (1024×1024), Portrait (768×1024), Landscape (1024×768)
- 🔑 **Free Tier & API Key** – Works out-of-the-box with the free tier; plug in your own API key for faster/higher quality results
- 🖼 **Gallery** – Automatically saves generated images; view, share, or delete them
- 📤 **Share** – Share generated images with friends via native share sheets
- 🌙 **Dark / Light Mode** – System-aware with manual override
- ⚡ **Prompt Enhancement** – Optional AI-powered prompt improvement
- 📱 **Cross-Platform** – Runs on Android, iOS, and web

---

## Screenshots

| Sign In | Create | Gallery | Settings |
|---------|--------|---------|----------|
| Login & Sign Up with form validation | Enter prompts, pick model & aspect ratio | Browse, share, and delete your creations | Manage API key and appearance |

---

## Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | React Native (Expo SDK 54) |
| Navigation | React Navigation v7 (Native Stack + Bottom Tabs) |
| State | React Context API |
| Storage | `@react-native-async-storage/async-storage` |
| Networking | Native `fetch` API |
| AI API | [Pollinations AI](https://pollinations.ai) |
| UI | Custom components with Expo Linear Gradient |
| Icons | Emoji-based icons |
| Theming | Dynamic light/dark mode |

---

## Setup & Installation

### Prerequisites

- [Node.js](https://nodejs.org) 18+
- [npm](https://npmjs.com) 9+ or [Yarn](https://yarnpkg.com)
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (`npm install -g expo-cli`)
- For iOS: macOS with Xcode 15+
- For Android: Android Studio with an emulator or physical device

### 1. Clone the Repository

```bash
git clone https://github.com/amitpatole/PolyDreamer.git
cd PolyDreamer
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the Development Server

```bash
npm start
# or
npx expo start
```

Then scan the QR code with **Expo Go** (iOS/Android) to run on your device.

---

## Running on Specific Platforms

### Android

```bash
npm run android
# or
npx expo start --android
```

### iOS (macOS only)

```bash
npm run ios
# or
npx expo start --ios
```

### Web

```bash
npm run web
```

---

## Building for Production

### Android – APK / AAB

1. Install EAS CLI: `npm install -g eas-cli`
2. Configure EAS: `eas build:configure`
3. Build APK (for testing):
   ```bash
   eas build -p android --profile preview
   ```
4. Build AAB (for Play Store):
   ```bash
   eas build -p android --profile production
   ```

### iOS – IPA (macOS + Xcode required)

1. Build for TestFlight / App Store:
   ```bash
   eas build -p ios --profile production
   ```
2. Submit to App Store:
   ```bash
   eas submit -p ios
   ```

### Local Android Build (without EAS)

```bash
npx expo prebuild --platform android
cd android
./gradlew assembleRelease
```

The APK will be in `android/app/build/outputs/apk/release/`.

---

## Pollinations AI API

PolyDreamer uses the [Pollinations AI API](https://pollinations.ai) for image generation.

### Free Tier

No configuration needed! The app works out-of-the-box using the public Pollinations endpoint:

```
https://image.pollinations.ai/prompt/{encoded_prompt}
```

### Premium / API Key Tier

1. Visit [https://pollinations.ai](https://pollinations.ai) to get your API key
2. Open the app → **Settings** → **API Key**
3. Paste your key and tap **Save**

With an API key, the app uses the `POST /v1/images/generations` endpoint for better performance and quality.

---

## Project Structure

```
PolyDreamer/
├── App.js                    # Root component (providers)
├── index.js                  # Entry point
├── app.json                  # Expo configuration
├── babel.config.js           # Babel config
├── package.json
├── assets/                   # App icons & splash screen
├── src/
│   ├── context/
│   │   ├── AuthContext.js    # Authentication state
│   │   └── ThemeContext.js   # Theme (dark/light mode)
│   ├── navigation/
│   │   └── AppNavigator.js   # Stack + Tab navigator
│   ├── screens/
│   │   ├── LoginScreen.js    # Sign in
│   │   ├── SignUpScreen.js   # Create account
│   │   ├── HomeScreen.js     # Prompt input & generation
│   │   ├── GalleryScreen.js  # Image gallery
│   │   ├── SettingsScreen.js # API key & appearance
│   │   └── ImageViewScreen.js# Full-size image viewer
│   └── services/
│       └── api.js            # Pollinations API + gallery storage
└── __tests__/
    └── api.test.js           # Unit tests
```

---

## Running Tests

```bash
npm test
```

---

## Permissions

The app requests the following platform permissions:

| Permission | Purpose |
|-----------|---------|
| `INTERNET` | Fetch AI-generated images |
| `READ_EXTERNAL_STORAGE` | Read saved images (Android) |
| `WRITE_EXTERNAL_STORAGE` | Save images to device (Android) |
| `NSPhotoLibraryUsageDescription` | Access photo library (iOS) |
| `NSPhotoLibraryAddUsageDescription` | Save images to photo library (iOS) |

---

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License.

---

## Acknowledgments

- [Pollinations AI](https://pollinations.ai) for the free image generation API
- [Expo](https://expo.dev) for the excellent React Native toolchain
- [React Navigation](https://reactnavigation.org) for navigation

