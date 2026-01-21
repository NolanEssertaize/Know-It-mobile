/**
 * @file useProfile.ts
 * @description Hook métier pour l'écran de profil
 *
 * Gère la logique de l'écran de profil avec intégration API complète:
 * - Données utilisateur depuis useAuthStore
 * - Mise à jour du profil via API
 * - Changement de mot de passe
 * - Déconnexion avec confirmation
 * - Suppression de compte avec double vérification
 * - Préférences utilisateur
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { AuthService } from '@/shared/services';
import type { UserUpdate, PasswordChange } from '@/shared/api';

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
    user: UserProfile | null;
    isLoading: boolean;
    error: string | null;

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
    handleDeleteAccount: (password: string) => Promise<{ success: boolean; error?: string }>;
    isDeleteModalVisible: boolean;
    showDeleteModal: () => void;
    hideDeleteModal: () => void;

    // Logout
    handleLogout: () => Promise<{ success: boolean; error?: string }>;
    isLogoutModalVisible: boolean;
    showLogoutModal: () => void;
    hideLogoutModal: () => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// MOCK PREFERENCES (à remplacer par AsyncStorage/API plus tard)
// ═══════════════════════════════════════════════════════════════════════════

const DEFAULT_PREFERENCES: UserPreferences = {
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
    // AUTH STORE
    // ─────────────────────────────────────────────────────────────────────────

    const authUser = useAuthStore((state) => state.user);
    const authIsLoading = useAuthStore((state) => state.isLoading);
    const authError = useAuthStore((state) => state.error);
    const logout = useAuthStore((state) => state.logout);
    const updateProfile = useAuthStore((state) => state.updateProfile);
    const clearError = useAuthStore((state) => state.clearError);

    // ─────────────────────────────────────────────────────────────────────────
    // STATE
    // ─────────────────────────────────────────────────────────────────────────

    const [activeTab, setActiveTab] = useState<ProfileTab>('profile');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fullname editing
    const [fullName, setFullName] = useState(authUser?.full_name || '');

    // Password change
    const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
    const [passwordData, setPasswordData] = useState<PasswordChangeData>({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [passwordErrors, setPasswordErrors] = useState<Partial<PasswordChangeData>>({});

    // Preferences
    const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);

    // Delete account modal
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

    // Logout modal
    const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);

    // ─────────────────────────────────────────────────────────────────────────
    // SYNC FULLNAME WITH AUTH USER
    // ─────────────────────────────────────────────────────────────────────────

    useEffect(() => {
        if (authUser?.full_name) {
            setFullName(authUser.full_name);
        }
    }, [authUser?.full_name]);

    // ─────────────────────────────────────────────────────────────────────────
    // COMPUTED USER
    // ─────────────────────────────────────────────────────────────────────────

    const user: UserProfile | null = useMemo(() => {
        if (!authUser) return null;

        return {
            id: authUser.id,
            email: authUser.email,
            fullName: authUser.full_name,
            pictureUrl: authUser.picture_url || null,
            createdAt: authUser.created_at,
            lastLogin: authUser.last_login || authUser.created_at,
            isGoogleLinked: authUser.google_id !== null && authUser.google_id !== undefined,
        };
    }, [authUser]);

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
        } else if (!/[A-Z]/.test(passwordData.newPassword)) {
            errors.newPassword = 'Au moins une majuscule requise';
        } else if (!/[a-z]/.test(passwordData.newPassword)) {
            errors.newPassword = 'Au moins une minuscule requise';
        } else if (!/[0-9]/.test(passwordData.newPassword)) {
            errors.newPassword = 'Au moins un chiffre requis';
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
        setError(null);

        try {
            const changeData: PasswordChange = {
                current_password: passwordData.currentPassword,
                new_password: passwordData.newPassword,
            };

            await AuthService.changePassword(changeData);
            hidePasswordModal();

            return { success: true };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur lors du changement de mot de passe';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    }, [validatePassword, passwordData, hidePasswordModal]);

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
    // DELETE ACCOUNT MODAL HANDLERS
    // ─────────────────────────────────────────────────────────────────────────

    const showDeleteModal = useCallback(() => {
        setIsDeleteModalVisible(true);
    }, []);

    const hideDeleteModal = useCallback(() => {
        setIsDeleteModalVisible(false);
    }, []);

    // ─────────────────────────────────────────────────────────────────────────
    // LOGOUT MODAL HANDLERS
    // ─────────────────────────────────────────────────────────────────────────

    const showLogoutModal = useCallback(() => {
        setIsLogoutModalVisible(true);
    }, []);

    const hideLogoutModal = useCallback(() => {
        setIsLogoutModalVisible(false);
    }, []);

    // ─────────────────────────────────────────────────────────────────────────
    // PROFILE UPDATE HANDLER
    // ─────────────────────────────────────────────────────────────────────────

    const handleUpdateProfile = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
        if (!fullName.trim()) {
            return { success: false, error: 'Le nom ne peut pas être vide' };
        }

        if (fullName === authUser?.full_name) {
            return { success: true }; // Aucune modification
        }

        setIsLoading(true);
        setError(null);

        try {
            const updateData: UserUpdate = {
                full_name: fullName.trim(),
            };

            await updateProfile(updateData);

            return { success: true };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour du profil';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    }, [fullName, authUser?.full_name, updateProfile]);

    // ─────────────────────────────────────────────────────────────────────────
    // RGPD / DATA HANDLERS
    // ─────────────────────────────────────────────────────────────────────────

    const handleExportData = useCallback(async (): Promise<void> => {
        setIsLoading(true);
        setError(null);

        try {
            // TODO: Implémenter l'endpoint API d'export des données
            // Pour l'instant, simulation
            await new Promise(resolve => setTimeout(resolve, 1500));
            // L'API devrait envoyer un email avec les données
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'export des données';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleDeleteAccount = useCallback(async (password: string): Promise<{ success: boolean; error?: string }> => {
        if (!password) {
            return { success: false, error: 'Mot de passe requis pour la suppression' };
        }

        setIsLoading(true);
        setError(null);

        try {
            // TODO: Implémenter l'endpoint API de suppression du compte
            // L'API devrait vérifier le mot de passe avant suppression
            // await api.delete('/api/v1/auth/me', { data: { password } });

            // Simulation pour l'instant
            await new Promise(resolve => setTimeout(resolve, 1000));

            hideDeleteModal();

            // Déconnexion après suppression
            await logout();

            return { success: true };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression du compte';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    }, [hideDeleteModal, logout]);

    // ─────────────────────────────────────────────────────────────────────────
    // LOGOUT HANDLER
    // ─────────────────────────────────────────────────────────────────────────

    const handleLogout = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
        setIsLoading(true);
        setError(null);

        try {
            await logout();
            hideLogoutModal();
            return { success: true };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la déconnexion';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    }, [logout, hideLogoutModal]);

    // ─────────────────────────────────────────────────────────────────────────
    // RETURN
    // ─────────────────────────────────────────────────────────────────────────

    return useMemo(() => ({
        // Tab navigation
        activeTab,
        setActiveTab,

        // User data
        user,
        isLoading: isLoading || authIsLoading,
        error: error || authError,

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
        isLogoutModalVisible,
        showLogoutModal,
        hideLogoutModal,
    }), [
        activeTab,
        user,
        isLoading,
        authIsLoading,
        error,
        authError,
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
        isLogoutModalVisible,
        showLogoutModal,
        hideLogoutModal,
    ]);
}