# KnowIt Mobile App

A mobile learning application built with React Native, Expo, and TypeScript. KnowIt helps users practice and test their knowledge through voice-based sessions with AI-powered analysis.

## 🚀 Features

- **Voice Recording Sessions**: Record yourself explaining topics and get AI-powered feedback
- **Multi-language Support**: Full internationalization with English and French
- **Glassmorphism Design**: Modern, beautiful UI with glass-effect components
- **Dark/Light/System Themes**: Automatic theme detection with manual override
- **Progress Tracking**: Track your learning progress with statistics and streaks
- **Offline-First**: Local storage with AsyncStorage and SecureStore

## 📱 Tech Stack

- **Framework**: React Native with Expo SDK 54
- **Language**: TypeScript
- **Navigation**: Expo Router v6
- **State Management**: Zustand v5
- **Internationalization**: i18next + react-i18next
- **UI Components**: Custom glassmorphism components
- **Storage**: AsyncStorage + Expo SecureStore
- **Animations**: React Native Reanimated

## 🛠️ Installation

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (macOS) or Android Emulator

### Setup

1. Clone the repository and navigate to the project:

```bash
cd knowit
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npx expo start
```

4. Run on your preferred platform:
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Scan QR code with Expo Go app for physical device

## 📁 Project Structure

```
knowit/
├── app/                    # Expo Router pages
│   ├── (auth)/            # Auth group routes
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── [topicId]/         # Dynamic topic routes
│   │   ├── index.tsx      # Topic detail
│   │   ├── session.tsx    # Recording session
│   │   └── result.tsx     # Session result
│   ├── _layout.tsx        # Root layout
│   ├── index.tsx          # Home (topics list)
│   └── profile.tsx        # Profile screen
├── features/              # Feature modules
│   ├── auth/              # Authentication
│   ├── topics/            # Topics list
│   ├── topic-detail/      # Topic detail
│   ├── session/           # Recording session
│   ├── result/            # Session result
│   └── profile/           # User profile
├── shared/                # Shared utilities
│   ├── api/               # API client
│   ├── components/        # Shared UI components
│   ├── hooks/             # Shared hooks
│   └── utils/             # Utility functions
├── store/                 # Zustand stores
├── theme/                 # Theme configuration
├── i18n/                  # Internationalization
│   ├── locales/           # Translation files
│   │   ├── en.json
│   │   └── fr.json
│   └── i18n.ts            # i18n configuration
└── types/                 # TypeScript types
```

## 🌐 Internationalization

### Changing Language

Users can change the app language from the Profile screen:
1. Navigate to Profile
2. Select preferred language (English 🇬🇧 or French 🇫🇷)
3. The change is applied immediately and persisted

### Adding a New Language

1. Create a new translation file in `i18n/locales/`:

```bash
cp i18n/locales/en.json i18n/locales/es.json
```

2. Translate all keys in the new file

3. Add the language to `i18n/index.ts`:

```typescript
export const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' }, // New
];
```

4. Import the translations in `i18n/i18n.ts`:

```typescript
import es from './locales/es.json';

const resources = {
  en: { translation: en },
  fr: { translation: fr },
  es: { translation: es }, // New
};
```

### Using Translations in Components

```typescript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <View>
      <Text>{t('common.loading')}</Text>
      <Text>{t('dates.daysAgo', { count: 5 })}</Text>
    </View>
  );
}
```

## 🎨 Theming

The app supports three theme modes:
- **Light**: Bright, clean interface
- **Dark**: Eye-friendly dark mode
- **System**: Follows device settings

### Using Theme in Components

```typescript
import { useTheme } from '@/theme';

function MyComponent() {
  const { colors, isDark, mode, setMode } = useTheme();
  
  return (
    <View style={{ backgroundColor: colors.background.primary }}>
      <Text style={{ color: colors.text.primary }}>Hello</Text>
    </View>
  );
}
```

## 🐛 Troubleshooting

### App Refreshes Data on Every Navigation

The app uses refs to track loading state and prevent unnecessary reloads:

```typescript
const hasLoadedRef = useRef(false);

useEffect(() => {
  if (!hasLoadedRef.current) {
    hasLoadedRef.current = true;
    loadData();
  }
}, []); // Empty deps
```

### Language Changes Not Persisting

Ensure AsyncStorage has proper permissions. Clear app cache and restart:

```bash
npx expo start --clear
```

### TypeScript Path Aliases Not Working

Make sure both `tsconfig.json` and `babel.config.js` have matching path configurations.

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

Built with ❤️ using React Native and Expo
