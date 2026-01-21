/**
 * @file index.ts
 * @description Profile Feature - Centralized exports
 */

// Hooks
export { useProfile, type ProfileTab, type UserProfile, type UserPreferences } from './hooks/useProfile';

// Components
export { ProfileButton } from './components/ProfileButton';
export { PasswordChangeModal } from './components/PasswordChangeModal';
export { DeleteAccountModal } from './components/DeleteAccountModal';

// Screens
export { ProfileScreen } from './screens/ProfileScreen';
