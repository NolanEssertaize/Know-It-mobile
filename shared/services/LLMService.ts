/**
 * @file LLMService.ts
 * @description Service d'intégration IA (STT + Analyse LLM)
 */

import type { AnalysisResult } from '@/types';

/**
 * Délai simulé pour les appels API mock
 */
const MOCK_DELAY = {
  transcription: 1500,
  analysis: 2000,
} as const;

export const LLMService = {
  /**
   * Transcrit un fichier audio en texte (Mock Whisper API)
   */
  async transcribeAudio(uri: string): Promise<string> {
    console.log(`[LLMService] Transcribing file: ${uri}`);
    
    await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY.transcription));
    
    return "Le polymorphisme en Java permet à des objets de différentes classes d'être traités comme des objets d'une classe parente commune. C'est surtout via l'héritage.";
  },

  /**
   * Analyse une transcription et retourne les points forts/faibles (Mock GPT-4)
   */
  async analyzeText(text: string, topicTitle: string): Promise<AnalysisResult> {
    console.log(`[LLMService] Analyzing text for topic: ${topicTitle}`);
    
    await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY.analysis));

    // TODO: Implémenter l'appel réel à l'API
    // const SYSTEM_PROMPT = `
    //   Tu es un expert technique rigoureux. Analyse la réponse de l'utilisateur sur le sujet : "${topicTitle}".
    //   Retourne un JSON strict avec :
    //   1. valid: points techniquement corrects.
    //   2. corrections: erreurs factuelles ou imprécisions.
    //   3. missing: concepts clés du sujet oubliés.
    // `;

    return {
      valid: [
        "Définition correcte du polymorphisme (traitement via classe parente).",
        "Mention du lien avec l'héritage.",
      ],
      corrections: [
        "Précision : Le polymorphisme s'applique aussi (et surtout) via les Interfaces, pas uniquement l'héritage de classe.",
      ],
      missing: [
        "Polymorphisme statique (Surcharge) vs Dynamique (Redéfinition).",
        "Exemple concret (e.g., List vs ArrayList).",
      ],
    };
  },
} as const;
