/**
 * @file ResultScreen.tsx
 * @description Vue Dumb pour l'écran de résultats d'analyse
 */

import React, { memo } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { ScreenWrapper, GlassButton } from '@/shared/components';
import { ScoreGauge } from '../components/ScoreGauge';
import { AnalysisSection } from '../components/AnalysisSection';
import { useResult } from '../hooks/useResult';
import { styles } from './ResultScreen.styles';

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

function ResultScreenComponent(): React.JSX.Element {
  const { score, sections, handleClose, handleRetry } = useResult();

  return (
    <ScreenWrapper useSafeArea scrollable padding={0}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Analyse terminée</Text>
          <Text style={styles.subtitle}>Voici vos résultats</Text>
        </View>

        {/* Score Gauge */}
        <ScoreGauge
          value={score.value}
          label={score.label}
          color={score.color}
        />

        {/* Analysis Sections */}
        <View style={styles.sectionsContainer}>
          {sections.map((section) => (
            <AnalysisSection
              key={section.id}
              title={section.title}
              icon={section.icon}
              items={section.items}
              color={section.color}
              glowColor={section.glowColor}
            />
          ))}
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <GlassButton
            title="Réessayer"
            variant="secondary"
            size="lg"
            fullWidth
            onPress={handleRetry}
          />
          <GlassButton
            title="Terminer"
            variant="primary"
            size="lg"
            fullWidth
            onPress={handleClose}
          />
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

export const ResultScreen = memo(ResultScreenComponent);
export default ResultScreen;
