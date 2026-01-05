import { AnalysisResult } from '../types';

export const LLMService = {
    // Mock STT (Whisper)
    async transcribeAudio(uri: string): Promise<string> {
        console.log(`[Mock API] Transcribing file: ${uri}`);
        await new Promise((resolve) => setTimeout(resolve, 1500)); // Latence artificielle
        return "Le polymorphisme en Java permet à des objets de différentes classes d'être traités comme des objets d'une classe parente commune. C'est surtout via l'héritage.";
    },

    // Mock LLM (GPT-4)
    async analyzeText(text: string, topicTitle: string): Promise<AnalysisResult> {
        console.log(`[Mock API] Analyzing text for topic: ${topicTitle}`);
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Prompt Système (Documentation uniquement, non utilisé dans le mock)
        const SYSTEM_PROMPT = `
      Tu es un expert technique rigoureux. Analyse la réponse de l'utilisateur sur le sujet : "${topicTitle}".
      Retourne un JSON strict avec :
      1. valid: points techniquement corrects.
      2. corrections: erreurs factuelles ou imprécisions.
      3. missing: concepts clés du sujet oubliés.
    `;

        return {
            valid: [
                "Définition correcte du polymorphisme (traitement via classe parente).",
                "Mention du lien avec l'héritage."
            ],
            corrections: [
                "Précision : Le polymorphisme s'applique aussi (et surtout) via les Interfaces, pas uniquement l'héritage de classe."
            ],
            missing: [
                "Polymorphisme statique (Surcharge) vs Dynamique (Redéfinition).",
                "Exemple concret (e.g., List vs ArrayList)."
            ]
        };
    }
};