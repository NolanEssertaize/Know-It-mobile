/**
 * @file mentions-legales.ts
 * @description Mentions Legales content — required by French LCEN.
 *
 */

export interface LegalSection {
    title: string;
    content: string;
}

export const mentionsLegales: LegalSection[] = [
    {
        title: "1. Editeur de l'Application",
        content:
            "L'application mobile KnowIt (ci-apres \"l'Application\") est editee par :\n\n" +
            "Identite : Nolan Essertaize, exercant en tant qu'Entrepreneur Individuel (EI).\n\n" +
            "Siege social / Adresse de domiciliation : 72 Rue Marc chagall 26500 Bourg Les Valence.\n\n" +
            "Numero SIRET : 97823214800020.\n\n" +
            "Numero de TVA intracommunautaire : FR62978232148.\n\n" +
            "Directeur de la publication : Nolan ESSERTAIZE.\n\n" +
            "Contact : knowit-support@essertaize.com",
    },
    {
        title: "2. Hebergeur de l'Application et des Donnees",
        content:
            "L'infrastructure backend, les API et les bases de donnees de l'Application sont heberges par :\n\n" +
            "Denomination sociale : OVHcloud.\n\n" +
            "Adresse de l'hebergeur : 2 rue Kellermann, 59100 Roubaix.\n\n" +
            "Contact de l'hebergeur : https://www.ovhcloud.com/fr/contact/.",
    },
    {
        title: "3. Propriete intellectuelle et Contrefacon",
        content:
            "L'ensemble des elements techniques, graphiques, textuels, algorithmiques et autres constituant " +
            "l'Application (a l'exclusion stricte des contenus generes par les utilisateurs) sont la propriete " +
            "exclusive de Nolan Essertaize EI et sont proteges par les dispositions du Code de la Propriete " +
            "Intellectuelle.\n\n" +
            "Toute reproduction, representation, modification, publication, adaptation de tout ou partie des " +
            "elements de l'Application, quel que soit le moyen ou le procede utilise, est strictement interdite " +
            "sans l'autorisation prealable ecrite de l'editeur, sous peine de poursuites penales au titre de la " +
            "contrefacon.",
    },
];
