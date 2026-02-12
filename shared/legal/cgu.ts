/**
 * @file cgu.ts
 * @description Conditions Generales d'Utilisation — contractual framework.
 *
 */

import type { LegalSection } from './mentions-legales';

export const cgu: LegalSection[] = [
    {
        title: "Preambule",
        content:
            "Les presentes Conditions Generales d'Utilisation (ci-apres \"CGU\") ont pour objet de definir " +
            "les modalites, les conditions et les limites dans lesquelles Nolan Essertaize EI (ci-apres \"l'Editeur\") " +
            "met a la disposition des utilisateurs (ci-apres \"l'Utilisateur\") l'application mobile KnowIt " +
            "(ci-apres \"l'Application\"), un outil numerique dedie a l'amelioration de l'apprentissage par la " +
            "pratique et la generation automatisee et manuelle de cartes de revision (flashcards).\n\n" +
            "Toute creation de compte, connexion ou utilisation de l'Application implique l'acceptation expresse, " +
            "sans reserve et prealable des presentes CGU par l'Utilisateur.",
    },
    {
        title: "Article 1 : Acces au Service et Prerequis Techniques",
        content:
            "L'Application est accessible a tout Utilisateur disposant d'un terminal mobile compatible (iOS ou " +
            "Android) et d'un acces a Internet. Tous les couts afferents a l'acces au service (frais materiels, " +
            "logiciels, abonnements telecoms ou acces a Internet) sont exclusivement a la charge de l'Utilisateur.\n\n" +
            "L'Editeur met en oeuvre tous les moyens raisonnables a sa disposition pour assurer un acces de qualite " +
            "a l'Application, mais n'est tenu a aucune obligation de resultat concernant la disponibilite continue " +
            "du service.",
    },
    {
        title: "Article 2 : Inscription et Gestion du Compte Utilisateur",
        content:
            "Pour acceder aux fonctionnalites de creation, de sauvegarde et de synchronisation des flashcards, " +
            "l'Utilisateur doit obligatoirement creer un compte personnel.\n\n" +
            "L'Utilisateur s'engage a fournir des informations exactes, a jour et completes lors de son " +
            "inscription. Les identifiants de connexion (adresse e-mail et mot de passe) sont strictement " +
            "personnels et confidentiels. L'Utilisateur s'engage a ne pas les communiquer a des tiers et demeure " +
            "seul responsable de toutes les actions effectuees sous son compte.\n\n" +
            "En cas de perte ou de vol de ses identifiants, l'Utilisateur doit en informer l'Editeur dans les " +
            "plus brefs delais.",
    },
    {
        title: "Article 3 : Contenu Genere par l'Utilisateur (UGC) et Flashcards",
        content:
            "L'Application permet a l'Utilisateur de saisir des textes, des informations et potentiellement des " +
            "images afin de generer des flashcards pour son apprentissage personnel.\n\n" +
            "Licence d'utilisation accordee a l'Application : L'Utilisateur reste le seul proprietaire des droits " +
            "de propriete intellectuelle attaches aux contenus qu'il cree. Toutefois, en soumettant du contenu sur " +
            "l'Application, l'Utilisateur concede expressement a l'Editeur une licence non exclusive, gratuite et " +
            "mondiale pour heberger, stocker, reproduire, analyser algorithmiquement et modifier techniquement ce " +
            "contenu aux seules fins de fournir et d'optimiser le service (affichage sur differents terminaux, " +
            "synchronisation cloud, generation automatisee de revisions).\n\n" +
            "Responsabilite de l'Utilisateur : L'Utilisateur garantit qu'il dispose de l'ensemble des droits et " +
            "autorisations necessaires sur les contenus qu'il soumet. Il s'interdit formellement de publier ou " +
            "d'enregistrer des contenus illicites, diffamatoires, injurieux, contraires aux bonnes moeurs, ou " +
            "violant les droits de propriete intellectuelle d'un tiers.\n\n" +
            "Statut d'Hebergeur : L'Editeur agit en tant que simple prestataire d'hebergement technique pour les " +
            "contenus generes par l'Utilisateur. A ce titre, l'Editeur n'exerce aucun controle a priori sur les " +
            "flashcards creees et decline toute responsabilite quant a leur nature. L'Editeur se reserve le droit " +
            "de retirer promptement tout contenu qui lui serait signale comme manifestement illicite.",
    },
    {
        title: "Article 4 : Comportements Interdits et Sanctions",
        content:
            "L'Utilisateur s'engage a utiliser l'Application de maniere loyale et conforme a sa destination " +
            "educative. Sont formellement interdits :\n\n" +
            "- Toute tentative d'entraver, de suspendre, de ralentir ou d'empecher le bon fonctionnement " +
            "technique de l'Application ou de son infrastructure backend.\n\n" +
            "- L'ingenierie inverse (reverse engineering), la decompilation ou la modification du code source " +
            "de l'Application.\n\n" +
            "- L'utilisation de robots, de scripts automatises ou de tout outil de data scraping pour interagir " +
            "avec les API de l'Application.\n\n" +
            "En cas de violation de ces regles, l'Editeur se reserve le droit de suspendre ou de supprimer " +
            "immediatement et sans preavis le compte de l'Utilisateur fautif, sans prejudice d'eventuelles " +
            "poursuites judiciaires.",
    },
    {
        title: "Article 5 : Limitation de Responsabilite",
        content:
            "L'Application est concue comme un outil technologique de support a la revision. L'Editeur ne garantit " +
            "en aucun cas des resultats educatifs, la reussite a des examens, ou l'exactitude scientifique et " +
            "factuelle des flashcards generees ou partagees. L'assimilation des connaissances repose sur l'effort " +
            "de l'Utilisateur.\n\n" +
            "Par ailleurs, l'Editeur ne saurait etre tenu responsable des dommages directs ou indirects (perte " +
            "de donnees, perte d'opportunite, prejudice moral) resultant de l'utilisation de l'Application, " +
            "d'une panne des serveurs, ou de l'impossibilite d'y acceder.",
    },
    {
        title: "Article 6 : Evolution et Modification des CGU",
        content:
            "L'Editeur se reserve le droit d'adapter ou de modifier les presentes CGU a tout moment, notamment " +
            "pour se conformer a des evolutions legislatives, jurisprudentielles ou techniques.\n\n" +
            "Les Utilisateurs seront informes de ces modifications prealablement a leur entree en vigueur via " +
            "une notification push au sein de l'Application ou par courrier electronique.",
    },
    {
        title: "Article 7 : Droit Applicable et Juridiction Competente",
        content:
            "Les presentes CGU sont regies et soumises au droit francais. En cas de litige relatif a " +
            "l'interpretation, la validite ou l'execution des presentes, et a defaut d'une resolution amiable " +
            "entre les parties, les tribunaux francais seront seuls competents pour en connaitre.",
    },
];
