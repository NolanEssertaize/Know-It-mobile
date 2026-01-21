/**
 * @file useProfile.ts
 * @description Hook métier pour l'écran de profil
 * 
 * Gère la logique de l'écran de profil:
 * - Données utilisateur (mock pour le moment)
 * - Changement de mot de passe
 * - Préférences
 * - Navigation entre onglets
 */

import { useState, useCallback, useMemo } from 'react';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type ProfileTab = 'profile' | 'preferences' | 'about';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  pictureUrl: string | null;
  createdAt: string;
  lastLogin: string;
  isGoogleLinked: boolean;
}

export interface UserPreferences {
  notifications: boolean;
  darkMode: boolean;
  language: 'fr' | 'en';
  autoSave: boolean;
  analyticsEnabled: boolean;
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UseProfileReturn {
  // Tab navigation
  activeTab: ProfileTab;
  setActiveTab: (tab: ProfileTab) => void;
  
  // User data
  user: UserProfile;
  isLoading: boolean;
  
  // Profile actions
  fullName: string;
  setFullName: (name: string) => void;
  handleUpdateProfile: () => Promise<{ success: boolean; error?: string }>;
  
  // Password change
  passwordData: PasswordChangeData;
  setCurrentPassword: (value: string) => void;
  setNewPassword: (value: string) => void;
  setConfirmPassword: (value: string) => void;
  handleChangePassword: () => Promise<{ success: boolean; error?: string }>;
  passwordErrors: Partial<PasswordChangeData>;
  isPasswordModalVisible: boolean;
  showPasswordModal: () => void;
  hidePasswordModal: () => void;
  
  // Preferences
  preferences: UserPreferences;
  toggleNotifications: () => void;
  toggleDarkMode: () => void;
  toggleAutoSave: () => void;
  toggleAnalytics: () => void;
  setLanguage: (lang: 'fr' | 'en') => void;
  
  // RGPD Actions
  handleExportData: () => Promise<void>;
  handleDeleteAccount: () => Promise<void>;
  isDeleteModalVisible: boolean;
  showDeleteModal: () => void;
  hideDeleteModal: () => void;
  
  // Logout
  handleLogout: () => Promise<void>;
}

// ═══════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════

const MOCK_USER: UserProfile = {
  id: 'user-123',
  email: 'john.doe@example.com',
  fullName: 'John Doe',
  pictureUrl: null,
  createdAt: '2024-01-15T10:30:00Z',
  lastLogin: '2025-01-20T08:45:00Z',
  isGoogleLinked: false,
};

const MOCK_PREFERENCES: UserPreferences = {
  notifications: true,
  darkMode: true,
  language: 'fr',
  autoSave: true,
  analyticsEnabled: false,
};

// ═══════════════════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════════════════

export function useProfile(): UseProfileReturn {
  // ─────────────────────────────────────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────────────────────────────────────
  
  const [activeTab, setActiveTab] = useState<ProfileTab>('profile');
  const [isLoading, setIsLoading] = useState(false);
  
  // User data (mock - will be replaced with API calls)
  const [user] = useState<UserProfile>(MOCK_USER);
  const [fullName, setFullName] = useState(MOCK_USER.fullName);
  
  // Password change
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [passwordData, setPasswordData] = useState<PasswordChangeData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState<Partial<PasswordChangeData>>({});
  
  // Preferences
  const [preferences, setPreferences] = useState<UserPreferences>(MOCK_PREFERENCES);
  
  // Delete account modal
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  // ─────────────────────────────────────────────────────────────────────────
  // PASSWORD HANDLERS
  // ─────────────────────────────────────────────────────────────────────────

  const setCurrentPassword = useCallback((value: string) => {
    setPasswordData(prev => ({ ...prev, currentPassword: value }));
    setPasswordErrors(prev => ({ ...prev, currentPassword: undefined }));
  }, []);

  const setNewPassword = useCallback((value: string) => {
    setPasswordData(prev => ({ ...prev, newPassword: value }));
    setPasswordErrors(prev => ({ ...prev, newPassword: undefined }));
  }, []);

  const setConfirmPassword = useCallback((value: string) => {
    setPasswordData(prev => ({ ...prev, confirmPassword: value }));
    setPasswordErrors(prev => ({ ...prev, confirmPassword: undefined }));
  }, []);

  const showPasswordModal = useCallback(() => {
    setIsPasswordModalVisible(true);
  }, []);

  const hidePasswordModal = useCallback(() => {
    setIsPasswordModalVisible(false);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setPasswordErrors({});
  }, []);

  const validatePassword = useCallback((): boolean => {
    const errors: Partial<PasswordChangeData> = {};
    
    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Mot de passe actuel requis';
    }
    
    if (!passwordData.newPassword) {
      errors.newPassword = 'Nouveau mot de passe requis';
    } else if (passwordData.newPassword.length < 8) {
      errors.newPassword = 'Minimum 8 caractères';
    }
    
    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Confirmation requise';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  }, [passwordData]);

  const handleChangePassword = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (!validatePassword()) {
      return { success: false, error: 'Validation échouée' };
    }
    
    setIsLoading(true);
    
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      hidePasswordModal();
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur lors du changement de mot de passe' 
      };
    } finally {
      setIsLoading(false);
    }
  }, [validatePassword, hidePasswordModal]);

  // ─────────────────────────────────────────────────────────────────────────
  // PROFILE HANDLERS
  // ─────────────────────────────────────────────────────────────────────────

  const handleUpdateProfile = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (!fullName.trim()) {
      return { success: false, error: 'Le nom est requis' };
    }
    
    setIsLoading(true);
    
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour' 
      };
    } finally {
      setIsLoading(false);
    }
  }, [fullName]);

  // ─────────────────────────────────────────────────────────────────────────
  // PREFERENCES HANDLERS
  // ─────────────────────────────────────────────────────────────────────────

  const toggleNotifications = useCallback(() => {
    setPreferences(prev => ({ ...prev, notifications: !prev.notifications }));
  }, []);

  const toggleDarkMode = useCallback(() => {
    setPreferences(prev => ({ ...prev, darkMode: !prev.darkMode }));
  }, []);

  const toggleAutoSave = useCallback(() => {
    setPreferences(prev => ({ ...prev, autoSave: !prev.autoSave }));
  }, []);

  const toggleAnalytics = useCallback(() => {
    setPreferences(prev => ({ ...prev, analyticsEnabled: !prev.analyticsEnabled }));
  }, []);

  const setLanguage = useCallback((lang: 'fr' | 'en') => {
    setPreferences(prev => ({ ...prev, language: lang }));
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // RGPD HANDLERS
  // ─────────────────────────────────────────────────────────────────────────

  const showDeleteModal = useCallback(() => {
    setIsDeleteModalVisible(true);
  }, []);

  const hideDeleteModal = useCallback(() => {
    setIsDeleteModalVisible(false);
  }, []);

  const handleExportData = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      // Would trigger download or email with data
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDeleteAccount = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      hideDeleteModal();
      // Would redirect to login after deletion
    } finally {
      setIsLoading(false);
    }
  }, [hideDeleteModal]);

  // ─────────────────────────────────────────────────────────────────────────
  // LOGOUT HANDLER
  // ─────────────────────────────────────────────────────────────────────────

  const handleLogout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual logout from useAuthStore
      await new Promise(resolve => setTimeout(resolve, 500));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // RETURN
  // ─────────────────────────────────────────────────────────────────────────

  return useMemo(() => ({
    // Tab navigation
    activeTab,
    setActiveTab,
    
    // User data
    user,
    isLoading,
    
    // Profile actions
    fullName,
    setFullName,
    handleUpdateProfile,
    
    // Password change
    passwordData,
    setCurrentPassword,
    setNewPassword,
    setConfirmPassword,
    handleChangePassword,
    passwordErrors,
    isPasswordModalVisible,
    showPasswordModal,
    hidePasswordModal,
    
    // Preferences
    preferences,
    toggleNotifications,
    toggleDarkMode,
    toggleAutoSave,
    toggleAnalytics,
    setLanguage,
    
    // RGPD Actions
    handleExportData,
    handleDeleteAccount,
    isDeleteModalVisible,
    showDeleteModal,
    hideDeleteModal,
    
    // Logout
    handleLogout,
  }), [
    activeTab,
    user,
    isLoading,
    fullName,
    handleUpdateProfile,
    passwordData,
    setCurrentPassword,
    setNewPassword,
    setConfirmPassword,
    handleChangePassword,
    passwordErrors,
    isPasswordModalVisible,
    showPasswordModal,
    hidePasswordModal,
    preferences,
    toggleNotifications,
    toggleDarkMode,
    toggleAutoSave,
    toggleAnalytics,
    setLanguage,
    handleExportData,
    handleDeleteAccount,
    isDeleteModalVisible,
    showDeleteModal,
    hideDeleteModal,
    handleLogout,
  ]);
}
