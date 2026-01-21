/**
 * @file ProfileScreen.styles.ts
 * @description Styles pour l'écran de profil
 */

import { StyleSheet } from 'react-native';
import { GlassColors, Spacing, BorderRadius, FontSize, FontWeight } from '@/theme';

export const styles = StyleSheet.create({
  // ═══════════════════════════════════════════════════════════════════════════
  // HEADER
  // ═══════════════════════════════════════════════════════════════════════════
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  
  backButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    backgroundColor: GlassColors.glass.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  
  headerTitle: {
    flex: 1,
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
    color: GlassColors.text.primary,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PROFILE HEADER
  // ═══════════════════════════════════════════════════════════════════════════

  profileHeader: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },

  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: GlassColors.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    shadowColor: GlassColors.accent.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 8,
  },

  avatarText: {
    fontSize: FontSize['4xl'],
    fontWeight: FontWeight.bold,
    color: GlassColors.text.primary,
  },

  userName: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
    color: GlassColors.text.primary,
    marginBottom: Spacing.xs,
  },

  userEmail: {
    fontSize: FontSize.md,
    color: GlassColors.text.secondary,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TABS
  // ═══════════════════════════════════════════════════════════════════════════

  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.md,
    backgroundColor: GlassColors.glass.background,
    padding: Spacing.xs,
  },

  tab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
  },

  tabActive: {
    backgroundColor: GlassColors.accent.primary,
  },

  tabText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: GlassColors.text.secondary,
  },

  tabTextActive: {
    color: GlassColors.text.primary,
    fontWeight: FontWeight.semibold,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CONTENT
  // ═══════════════════════════════════════════════════════════════════════════

  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },

  scrollContent: {
    paddingBottom: Spacing.xxl,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION
  // ═══════════════════════════════════════════════════════════════════════════

  section: {
    marginBottom: Spacing.xl,
  },

  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: GlassColors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.md,
    marginLeft: Spacing.xs,
  },

  sectionCard: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // LIST ITEM
  // ═══════════════════════════════════════════════════════════════════════════

  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: GlassColors.glass.border,
  },

  listItemLast: {
    borderBottomWidth: 0,
  },

  listItemIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    backgroundColor: GlassColors.glass.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },

  listItemContent: {
    flex: 1,
  },

  listItemLabel: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: GlassColors.text.primary,
    marginBottom: 2,
  },

  listItemValue: {
    fontSize: FontSize.sm,
    color: GlassColors.text.secondary,
  },

  listItemChevron: {
    marginLeft: Spacing.sm,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // INPUT ITEM
  // ═══════════════════════════════════════════════════════════════════════════

  inputItem: {
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: GlassColors.glass.border,
  },

  inputLabel: {
    fontSize: FontSize.sm,
    color: GlassColors.text.secondary,
    marginBottom: Spacing.xs,
  },

  input: {
    fontSize: FontSize.md,
    color: GlassColors.text.primary,
    paddingVertical: Spacing.xs,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SWITCH ITEM
  // ═══════════════════════════════════════════════════════════════════════════

  switchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: GlassColors.glass.border,
  },

  switchLabel: {
    flex: 1,
  },

  switchTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: GlassColors.text.primary,
    marginBottom: 2,
  },

  switchDescription: {
    fontSize: FontSize.sm,
    color: GlassColors.text.secondary,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // DANGER ZONE
  // ═══════════════════════════════════════════════════════════════════════════

  dangerZone: {
    marginTop: Spacing.lg,
  },

  dangerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(239, 68, 68, 0.2)',
  },

  dangerIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },

  dangerText: {
    flex: 1,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: GlassColors.semantic.error,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // LANGUAGE SELECTOR
  // ═══════════════════════════════════════════════════════════════════════════

  languageSelector: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },

  languageOption: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: GlassColors.glass.border,
    alignItems: 'center',
  },

  languageOptionActive: {
    borderColor: GlassColors.accent.primary,
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
  },

  languageText: {
    fontSize: FontSize.sm,
    color: GlassColors.text.secondary,
  },

  languageTextActive: {
    color: GlassColors.accent.primary,
    fontWeight: FontWeight.semibold,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ABOUT SECTION
  // ═══════════════════════════════════════════════════════════════════════════

  aboutHeader: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    marginBottom: Spacing.lg,
  },

  aboutLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: GlassColors.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    shadowColor: GlassColors.accent.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },

  aboutLogoText: {
    fontSize: FontSize['3xl'],
    fontWeight: FontWeight.bold,
    color: GlassColors.text.primary,
  },

  aboutAppName: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
    color: GlassColors.text.primary,
    marginBottom: Spacing.xs,
  },

  aboutVersion: {
    fontSize: FontSize.sm,
    color: GlassColors.text.secondary,
  },

  aboutDescription: {
    fontSize: FontSize.md,
    color: GlassColors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },

  aboutLink: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: GlassColors.glass.border,
  },

  aboutLinkText: {
    flex: 1,
    fontSize: FontSize.md,
    color: GlassColors.text.primary,
    marginLeft: Spacing.md,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // FOOTER
  // ═══════════════════════════════════════════════════════════════════════════

  footer: {
    padding: Spacing.xl,
    alignItems: 'center',
  },

  footerText: {
    fontSize: FontSize.sm,
    color: GlassColors.text.tertiary,
    marginBottom: Spacing.xs,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SAVE BUTTON
  // ═══════════════════════════════════════════════════════════════════════════

  saveButton: {
    marginTop: Spacing.lg,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // LOGOUT BUTTON
  // ═══════════════════════════════════════════════════════════════════════════

  logoutButton: {
    marginTop: Spacing.xl,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.xxl,
  },
});
