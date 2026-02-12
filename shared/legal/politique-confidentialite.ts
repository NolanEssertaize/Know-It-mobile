/**
 * @file politique-confidentialite.ts
 * @description Politique de Confidentialite — GDPR/RGPD privacy policy.
 *
 */

import type { LegalSection } from './mentions-legales';

export const politiqueConfidentialite: LegalSection[] = [
    {
        title: "Introduction",
        content:
            "La protection de votre vie privee est une priorite absolue pour [Prenom Nom] EI. La presente " +
            "Politique de Confidentialite a pour objectif de vous informer de maniere claire, transparente et " +
            "exhaustive sur la maniere dont nous collectons, utilisons, partageons et protegeons vos donnees a " +
            "caractere personnel lorsque vous utilisez l'application mobile KnowIt (ci-apres \"l'Application\"), " +
            "conformement au Reglement General sur la Protection des Donnees (RGPD) et a la Loi Informatique " +
            "et Libertes.",
    },
    {
        title: "1. Identite du Responsable du Traitement",
        content:
            "Le responsable du traitement des donnees personnelles collectees via l'Application est " +
            "Nolan Essertaize, exercant sous le statut d'Entrepreneur Individuel (EI), dont le siege social est " +
            "situe au 72 Rue marc chagall 26500 Bourg Les Valence, joignable a l'adresse e-mail suivante : knowit-support@essertaize.com.",
    },
    {
        title: "2. Categories de Donnees Collectees et Finalites",
        content:
            "Dans le cadre du fonctionnement de notre service d'apprentissage par flashcards, nous sommes " +
            "amenes a collecter et traiter les donnees suivantes :\n\n" +
            "Donnees relatives au Compte Utilisateur :\n" +
            "- Donnees : Nom, prenom, adresse e-mail, mot de passe (hache et securise).\n" +
            "- Finalite : Creation du compte, authentification securisee, gestion de la relation utilisateur, " +
            "et synchronisation de vos donnees entre vos differents appareils.\n" +
            "- Base legale : L'execution du contrat (les CGU que vous avez acceptees).\n\n" +
            "Donnees d'Apprentissage (Contenus Generes) :\n" +
            "- Donnees : Les textes, informations et sujets que vous saisissez pour generer les flashcards, " +
            "vos statistiques de revision, vos scores de reussite et votre frequence d'utilisation.\n" +
            "- Finalite : Fournir le service educatif de base, faire fonctionner nos algorithmes de repetition " +
            "espacee, et vous proposer une experience d'apprentissage personnalisee.\n" +
            "- Base legale : L'execution du contrat.\n\n" +
            "Donnees Techniques et de Navigation :\n" +
            "- Donnees : Adresse IP, modele du terminal mobile, version du systeme d'exploitation, journaux " +
            "de connexion (logs), rapports de crash.\n" +
            "- Finalite : Assurer la securite de notre infrastructure backend, prevenir les fraudes, " +
            "diagnostiquer les problemes techniques et optimiser les performances de l'Application.\n" +
            "- Base legale : Notre interet legitime a garantir la securite et le bon fonctionnement de " +
            "notre outil numerique.",
    },
    {
        title: "3. Duree de Conservation des Donnees",
        content:
            "Vos donnees personnelles ne sont conservees que pour la duree strictement necessaire a " +
            "l'accomplissement des finalites detaillees ci-dessus :\n\n" +
            "Donnees de Compte et d'Apprentissage : Conservees pendant toute la duree d'utilisation de " +
            "l'Application. En cas d'inactivite continue de votre compte pendant une periode de 2 ans, nous " +
            "vous enverrons un avertissement. Sans reponse de votre part, votre compte sera supprime.\n\n" +
            "Donnees Techniques et Logs : Conservees pour une duree maximale de 12 mois a compter de leur " +
            "collecte, conformement aux recommandations de la CNIL et aux obligations legales de tracabilite " +
            "de securite.",
    },
    {
        title: "4. Partage et Destinataires de vos Donnees",
        content:
            "Nous nous engageons formellement a ne jamais vendre, louer ou commercialiser vos donnees " +
            "personnelles a des tiers a des fins publicitaires. L'acces a vos donnees est strictement limite :\n\n" +
            "- Au responsable du traitement (l'Editeur).\n\n" +
            "- A nos sous-traitants techniques intervenant dans la fourniture du service, et specifiquement " +
            "notre hebergeur backend OVHcloud. Ce prestataire est tenu par des obligations strictes " +
            "de confidentialite et de securite.\n\n" +
            "Vos donnees sont hebergees sur des serveurs localises en France / " +
            "Union Europeenne].",
    },
    {
        title: "5. Securite de vos Donnees Personnelles",
        content:
            "Nous mettons en oeuvre des mesures techniques et organisationnelles conformes a l'etat de l'art " +
            "pour proteger vos donnees contre l'alteration, la perte accidentelle, ou l'acces non autorise.\n\n" +
            "Ces mesures incluent notamment le chiffrement des communications entre l'Application et nos " +
            "serveurs (protocole HTTPS/TLS), le hachage cryptographique des mots de passe, et des politiques " +
            "de controle d'acces strictes sur notre infrastructure backend.",
    },
    {
        title: "6. Vos Droits au titre du RGPD",
        content:
            "Conformement a la reglementation applicable, vous disposez d'un controle total sur vos donnees. " +
            "Vous pouvez exercer a tout moment les droits suivants :\n\n" +
            "Droit d'acces et de rectification : Vous pouvez consulter et modifier vos informations directement " +
            "depuis les parametres de votre compte dans l'Application.\n\n" +
            "Droit a l'effacement (droit a l'oubli) : Vous disposez d'un bouton direct de suppression de " +
            "compte au sein de l'Application. L'activation de cette option entraine l'effacement irreversible " +
            "de vos donnees personnelles de nos bases de donnees actives.\n\n" +
            "Droit a la limitation et droit d'opposition : Vous pouvez vous opposer a certains traitements " +
            "bases sur notre interet legitime.\n\n" +
            "Droit a la portabilite : Vous pouvez demander a recuperer vos donnees d'apprentissage dans un " +
            "format structure et lisible par machine.\n\n" +
            "Pour exercer ces droits, ou pour toute question relative a cette politique, vous pouvez nous " +
            "contacter a : knowit-support@essertaize.com. Nous nous engageons a vous repondre dans un delai d'un mois " +
            "maximum.\n\n" +
            "Si vous estimez, apres nous avoir contactes, que vos droits sur vos donnees ne sont pas respectes, " +
            "vous pouvez adresser une reclamation officielle aupres de la Commission Nationale de l'Informatique " +
            "et des Libertes (CNIL) via leur site web : www.cnil.fr.",
    },
];
