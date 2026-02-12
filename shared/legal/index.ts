export type { LegalSection } from './mentions-legales';
export { mentionsLegales } from './mentions-legales';
export { cgu } from './cgu';
export { politiqueConfidentialite } from './politique-confidentialite';

// Dev warning for unfilled placeholders
if (__DEV__) {
    const { mentionsLegales: ml } = require('./mentions-legales');
    const { cgu: c } = require('./cgu');
    const { politiqueConfidentialite: pc } = require('./politique-confidentialite');
    const all = [...ml, ...c, ...pc].map((s: { content: string }) => s.content).join(' ');
    if (all.includes('[Prenom Nom]') || all.includes('[Adresse')) {
        console.warn(
            '[Legal] Documents contain placeholders — replace before production! Check shared/legal/*.ts'
        );
    }
}
