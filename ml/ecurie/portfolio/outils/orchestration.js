/* ===== LES TRACES DES ORCHESTRATIONS (27/11/2026, Sacha : « il faut qu'on garde des traces de tous les process, pour un portfolio ») =====
   Une « orchestration » : un script lance une équipe d'agents (Claude Opus), chacun avec sa consigne, et chacun rend un compte rendu
   en JSON. Claude Code garde ces traces HORS git (dans son dossier de projet) et les efface au bout d'un temps : cet outil les range
   dans le dépôt, sous ml/ecurie/portfolio/orchestration/<travail>/ :
     - script.js           le script d'orchestration tel qu'il a tourné (seulement nettoyé, voir plus bas) ;
     - comptes-rendus.md   le compte rendu de chaque agent, dans l'ordre où ils ont été lancés, remis en texte lisible.
   Usage : node ml/ecurie/portfolio/outils/orchestration.js <dossier de la session Claude Code> [dossier de sortie]
     <dossier de la session> : C:\Users\sacha\.claude\projects\<projet>\<identifiant de session>, qui contient workflows\ et subagents\workflows\.
     [dossier de sortie]     : par défaut ml/ecurie/portfolio/orchestration (à côté de ce dossier outils/).
   NETTOYAGE, appliqué à tout ce qui sort (le dépôt GitHub est public) :
     - un nom Windows de PC (DESKTOP-XXXX, en majuscules ou minuscules) devient « le-xeon » ;
     - une chaîne qui ressemble à une clé ou à un jeton (sk-ant-…, ghp_…, github_pat_…, « api key = … ») devient « [retiré] » ;
     - une adresse e-mail devient « [adresse retirée] » ;
     - un chemin sous C:\Users\sacha\AppData\… (dossier temporaire de Claude Code) est raccourci en « <dossier temporaire>\… » ;
     - un détail de famille (un lien de parenté accolé à une personne ou à une machine) est retiré ;
     - (28/11) le nom propre de l'assistant qui tape les commandes sur le Ryzen devient « l'assistant de Sacha sur le Ryzen ». Ce nom
       n'est écrit nulle part dans le dépôt : l'outil le lit dans ml/ecurie/agents/tmp-portfolio/mots-caches.json, un fichier local que
       git ignore (motif tmp-* du .gitignore). Sans ce fichier, l'outil refuse d'écrire (voir MOTS_CACHES). Une empreinte SHA-256 du
       nom, écrite d'abord à sa place, a été retirée par la relecture : un prénom se retrouve en quelques secondes à partir de son empreinte.
   L'outil affiche le nombre de remplacements de chaque sorte, travail par travail. Il ne lance rien, il ne fait que lire et écrire. */
'use strict';
const fs = require('fs'), path = require('path');

const SESSION = process.argv[2];
const SORTIE = process.argv[3] || path.join(__dirname, '..', 'orchestration');
if (!SESSION) { console.error('usage : node orchestration.js <dossier de la session Claude Code> [dossier de sortie]'); process.exit(2); }

/* ----- Les travaux du 27/11 et de la nuit du 27 au 28/11, et le rôle de chaque agent, dit en mots simples (tiré des phases de chaque script) ----- */
const TRAVAUX = [
  { dossier: 'construction', wf: 'wf_403c6fab-ee7', titre: 'La construction de ml/evolution (la sélection naturelle des bots)',
    roles: [
      [/^architecte$/, 'architecte : écrit le contrat entre les modules (INTERFACES.md), sans coder aucun module'],
      [/^module:(.*)$/, 'constructeur du module « $1 » : écrit le code et ses tests, en parallèle des trois autres'],
      [/^integrateur$/, 'intégrateur : assemble les modules, écrit le programme maître evoluer.js et ses essais de bout en bout'],
      [/^relecture:(.*)$/, 'relecteur « $1 » : relit le travail des autres et relève les défauts, sans les corriger'],
      [/^correcteur$/, 'correcteur : corrige les défauts relevés par les trois relecteurs et relance les tests'] ] },
  { dossier: 'journal', wf: 'wf_04e2d37c-894', titre: 'Le journal de bord du portfolio',
    roles: [
      [/^ecrire:(.*)$/, 'rédacteur du chapitre « $1 » : écrit le chapitre depuis git, les documents et les journaux'],
      [/^verifier:(.*)$/, 'vérificateur du chapitre « $1 » : recontrôle chaque chiffre, date et citation, et corrige le fichier'],
      [/^sommaire$/, 'auteur du sommaire : le fil du récit, la frise, le registre des impasses, les pièces à montrer'],
      [/^critique$/, 'critique : cherche ce qui manque encore au dossier et tire des chiffres au hasard pour les recontrôler'] ] },
  { dossier: 'images', wf: 'wf_3d7af170-d44', titre: 'Les images et la lisibilité du journal',
    roles: [
      [/^image:(.*)$/, 'auteur de l\'image « $1 » : un script qui dessine l\'image à partir des données du dépôt'],
      [/^controle:(.*)$/, 'contrôleur de l\'image « $1 » : recontrôle les données à la source, regarde le rendu, corrige'],
      [/^court:(.*)$/, 'auteur de la version courte du chapitre « $1 » : quelques lignes sans jargon en tête du chapitre'],
      [/^mise-en-page$/, 'metteur en page : insère les images dans les chapitres, écrit le lexique, met le sommaire à jour'],
      [/^jury$/, 'lecteur dans le rôle d\'un juré non programmeur : dit ce qu\'il a compris, où il se perd, et corrige en place'] ] },
  { dossier: 'finitions', wf: 'wf_207898d7-fdd', titre: 'Les finitions de ml/evolution avant la livraison au Ryzen',
    roles: [
      [/^machine$/, 'constructeur du lot « machine » : un réglage par PC, le banc qui mesure combien de courses la machine tient à la fois'],
      [/^traces$/, 'constructeur du lot « traces » : l\'arbre généalogique, le récit, la mise à l\'abri des journaux dans git'],
      [/^gestes$/, 'constructeur du lot « gestes » : les cinq gestes des enquêtes deviennent des gènes éteints à la naissance'],
      [/^relecture:(.*)$/, 'relecteur du lot « $1 » : essaie de casser le travail d\'un autre agent, puis corrige lui-même ce qu\'il trouve'],
      [/^integration$/, 'intégrateur : fusionne les notes des trois lots, lance tous les tests et une évolution d\'essai'] ] },
  /* ===== LES QUATRE TRAVAUX DE LA NUIT DU 27 AU 28/11 (28/11/2026, Sacha : « il faut qu'on garde des traces de tous les process, pour un portfolio ») =====
     Ajoutés après coup : les quatre travaux ci-dessus sortent à l'identique. « nouveau: true » ne vaut que pour eux : les champs
     « passe » des tests deviennent « Réussi : oui / non » au lieu de « Passe : true / false ». */
  { dossier: 'traces-du-soir', wf: 'wf_2c24b21c-ec9', titre: 'Les traces du soir du 27/11 (journal, passation, orchestrations)', nouveau: true,
    roles: [
      [/^ecrire:journal$/, 'rédacteur du journal : ajoute le soir du 27/11 au chapitre du jour, au sommaire et au lexique'],
      [/^ecrire:passation$/, 'rédacteur de la passation : inscrit le changement de cap et l\'état du soir dans ETAPES.md et PASSATION.md'],
      [/^ecrire:orchestration$/, 'rédacteur des traces des orchestrations : écrit l\'outil orchestration.js, range les quatre travaux du 27/11 et écrit leur LISEZ-MOI'],
      [/^verifier$/, 'vérificateur : recontrôle chiffres, dates et citations des trois autres, cherche les détails privés, relance l\'outil'] ] },
  { dossier: 'reglage', wf: 'wf_f29df098-2f4', titre: 'L\'étude du réglage de la sélection naturelle', nouveau: true,
    roles: [
      [/^etude:effets$/, 'auteur de l\'étude « effets » : ce que font vraiment les mutations, mesuré sur la vraie génération 0'],
      [/^etude:simulateur$/, 'auteur de l\'étude « simulateur » : une sélection simulée, sans aucune course, pour savoir si elle progresse et à quelle vitesse'],
      [/^etude:vitesse$/, 'auteur de l\'étude « vitesse » : où part le temps d\'une course et comment en jouer plus par heure'],
      [/^etude:tri-precoce$/, 'auteur de l\'étude « tri précoce » : faut-il finir les courses d\'un enfant visiblement raté ?'],
      [/^etude:sacre$/, 'auteur de l\'étude « sacre » : comment reconnaître un vrai meilleur sans sacrer un chanceux'],
      [/^relire:(.*)$/, 'relecteur de l\'étude « $1 » : cherche à la réfuter, refait un résultat par un autre chemin, corrige son LISEZ-MOI'],
      [/^synthese$/, 'auteur de la synthèse : classe les changements (à faire, à essayer, à ne pas faire, à décider par Sacha)'] ] },
  { dossier: 'portage', wf: 'wf_a57ffbdc-230', titre: 'Les idées de la boucle payante deviennent des gènes, le Node fixe, la mesure du coffre', nouveau: true,
    roles: [
      [/^faire:mesure$/, 'constructeur du lot « mesure » : joue quatre champions sur les 40 graines du coffre et compare chacun au pilote de départ'],
      [/^faire:lignee$/, 'constructeur du lot « lignée » : raconte la boucle payante du Ryzen génération par génération, avec sa courbe'],
      [/^faire:portage$/, 'constructeur du lot « portage » : le génome apprend à écrire c0101 comme il écrit c0025 (génome v:3)'],
      [/^faire:lanceurs$/, 'constructeur du lot « lanceurs » : un Node fixe par PC et des tâches planifiées sans limite de 72 heures'],
      [/^relire:(.*)$/, 'relecteur du lot « $1 » : cherche à le réfuter, refait une preuve par un autre chemin, corrige ce qu\'il trouve'],
      [/^integrer$/, 'intégrateur : vérifie que les lots tiennent ensemble, relance tous les tests, écrit la note de livraison'] ] },
  { dossier: 'changements-surs', wf: 'wf_adf7db90-3c8', titre: 'Les changements sûrs de l\'étude du réglage entrent dans la sélection', nouveau: true,
    roles: [
      [/^faire:sacre$/, 'constructeur du lot « sacre » : la validation séquentielle et l\'alarme « malédiction » coupée'],
      [/^faire:tau$/, 'constructeur du lot « tau » : mesure-tau.js, la sélection mesure seule si les mutations comptent'],
      [/^faire:regles$/, 'constructeur du lot « règles » : protection des enfants par l\'âge, ordre des courses, réserve de graines, gènes muets hors de l\'urne'],
      [/^relire:(.*)$/, 'relecteur du lot « $1 » : cherche à le réfuter, refait une preuve par un autre chemin, corrige ce qu\'il trouve'],
      [/^integrer$/, 'intégrateur : branche la mesure, relance tous les tests (lents compris), reprend un état écrit par l\'ancien code, écrit la note de livraison'] ] },
  /* ===== LES HUIT TRAVAUX DU 28/11 (28/11/2026, Sacha : « il faut qu'on garde des traces de tous les process, pour un portfolio ») =====
     Ajoutés après coup, dans l'ordre où ils ont démarré : les huit travaux ci-dessus sortent à l'identique. */
  { dossier: 'prochaines-idees', wf: 'wf_b84c1055-e3c', titre: 'Les prochaines idées pour le banc des gènes', nouveau: true,
    roles: [
      [/^lire:(.*)$/, 'lecteur « $1 » : lit une famille de sources déjà écrites et rend des idées candidates, chacune avec son chiffre'],
      [/^classer$/, 'classeur : fusionne les candidats, retire les doublons, classe et écrit le dossier'],
      [/^attaquer:chiffres$/, 'relecteur « chiffres » : rouvre chaque source citée et recontrôle chaque chiffre'],
      [/^attaquer:code$/, 'relecteur « code » : vérifie que chaque idée peut s\'écrire dans le code du pilote'],
      [/^attaquer:mesure$/, 'relecteur « mesure » : vérifie que chaque idée peut se mesurer sur le banc des gènes'],
      [/^reprendre$/, 'correcteur : reprend le dossier d\'après les trois attaques'] ] },
  { dossier: 'traces-du-28', wf: 'wf_e7c9c530-0ea', titre: 'Les traces du 28/11 au matin (le chapitre du jour, les orchestrations de la nuit)', nouveau: true,
    roles: [
      [/^ecrire:2026-11-28$/, 'rédacteur du chapitre du 28/11 : écrit la nuit du 27 au 28/11 et le matin du 28/11 dans le journal de bord'],
      [/^traces:orchestrations$/, 'rédacteur des traces des orchestrations : range les quatre travaux de la nuit avec l\'outil orchestration.js'],
      [/^verifier:2026-11-28$/, 'vérificateur du chapitre du 28/11 : recontrôle chaque chiffre, date et citation, et corrige le fichier'],
      [/^raccorder$/, 'raccordeur : met à jour le sommaire, le lexique, ETAPES.md et PASSATION.md'] ] },
  { dossier: 'contrat-v4', wf: 'wf_a8860828-eec', titre: 'Le contrat des gènes v4', nouveau: true,
    roles: [
      [/^architecte$/, 'architecte : écrit le contrat du lot « gènes v4 », sans coder'],
      [/^attaquer:(.*)$/, 'relecteur « $1 » : attaque le contrat sous cet angle et relève ses défauts'],
      [/^reprendre$/, 'architecte, second passage : corrige le contrat d\'après les trois attaques'] ] },
  { dossier: 'code-v4', wf: 'wf_97cc59d9-d7e', titre: 'Le code des gènes v4', nouveau: true,
    roles: [
      [/^lot-a:genes$/, 'constructeur du lot (a), premier temps : le génome v:4 et les règles des nouveaux gènes'],
      [/^lot-a:compteurs$/, 'constructeur du lot (a), second temps : les compteurs de déclenchements dans le pilote'],
      [/^lot-b:courses$/, 'constructeur du lot (b) : les compteurs et la carte imposée du côté des courses'],
      [/^lot-c:banc$/, 'constructeur du lot (c) : le banc des gènes v2, dans un dossier neuf'],
      [/^relire:(.*)$/, 'relecteur « $1 » : cherche les défauts du lot sous cet angle et les corrige en place'],
      [/^integrateur$/, 'intégrateur : relance tous les tests, lents compris, joue une vague d\'essai du banc, écrit la livraison'] ] },
  { dossier: 'lecture-du-banc', wf: 'wf_f91dd3e4-3e4', titre: 'La lecture du banc des gènes', nouveau: true,
    roles: [
      [/^analyste$/, 'analyste : calcule, bras par bras, le palier et les morceaux de l\'écart aux joueurs, sans rejouer de course'],
      [/^relecteur$/, 'relecteur : refait les calculs par un autre chemin et attaque les conclusions'],
      [/^redacteur$/, 'rédacteur : écrit le résultat dans le LISEZ-MOI de l\'étude, le journal et la passation'] ] },
  { dossier: 'greffes', wf: 'wf_3dbb33d5-4d2', titre: 'Les greffes de la sélection', nouveau: true,
    roles: [
      [/^auteur$/, 'auteur : écrit les greffes (greffes.js, le branchement dans evoluer.js, le test, la note)'],
      [/^relecteur$/, 'relecteur : vérifie au bit près que rien ne change sans greffe, essaie en vraies courses, corrige sur place'] ] },
  { dossier: 'sortie-mesure', wf: 'wf_e9f81f3f-6ec', titre: 'La mesure de la sortie préparée', nouveau: true,
    roles: [
      [/^mesureur$/, 'mesureur : un pilote de diagnostic, des courses à carte tenue, le tableau des décollages au bord'],
      [/^relecteur$/, 'relecteur : refait les calculs par un autre chemin et propose une règle chiffrée'] ] },
  { dossier: 'sortie-reecrite', wf: 'wf_a86ae302-f88', titre: 'sortieOn réécrit après la mesure', nouveau: true,
    roles: [
      [/^auteur$/, 'auteur : réécrit sortieOn dans le pilote, le contrat, les tests, les notes et l\'étude'],
      [/^relecteur-integrateur$/, 'relecteur et intégrateur : vérifie l\'identité, joue de vraies courses, relance les tests lents, fait le commit'] ] },
  /* ===== LES SIX TRAVAUX DE L'APRÈS-MIDI ET DU SOIR DU 28/11 (28/11/2026, Sacha : « il faut qu'on garde des traces de tous les process, pour un portfolio ») =====
     Ajoutés après coup, dans l'ordre où ils ont démarré : les seize travaux ci-dessus sortent à l'identique. Leurs agents rendent un texte
     libre (souvent avec ses propres titres « # … ») : « titresDecales » fait descendre ces titres sous celui de l'agent, pour eux seulement. */
  { dossier: 'traces-apres-midi', wf: 'wf_87e4cc26-065', titre: 'Les traces de l\'après-midi du 28/11 (les huit orchestrations du jour, le journal, la passation)', nouveau: true, titresDecales: true,
    roles: [
      [/^ranger les 8 orchestrations$/, 'rédacteur des traces des orchestrations : range les huit travaux du 28/11 avec l\'outil orchestration.js'],
      [/^journal, passation, impasses$/, 'rédacteur du journal : écrit la suite du 28/11, la passation et le registre des impasses'],
      [/^relecture adverse et commit$/, 'relecteur : cherche les erreurs et les détails privés des deux autres, corrige, fait le commit'] ] },
  { dossier: 'avant-le-bord', wf: 'wf_9b9e2844-682', titre: 'L\'étude « avant le bord » (ce que le pilote pourrait faire au sol avant de sortir de la route)', nouveau: true, titresDecales: true,
    roles: [
      [/^lire:(.*)$/, 'lecteur « $1 » : relit les courses, le code ou les parties des joueurs déjà enregistrées, sans jouer de course'],
      [/^concevoir:(.*)$/, 'concepteur « $1 » : propose une règle de pilote chiffrée, à partir des trois lectures'],
      [/^attaquer:(.*)$/, 'relecteur « $1 » : attaque les trois propositions sous cet angle'],
      [/^rediger$/, 'rédacteur : écrit le LISEZ-MOI de l\'étude à partir de tout ce qui précède'] ] },
  { dossier: 'avant-le-bord-mesures', wf: 'wf_a240473e-422', titre: 'Les mesures A et C de l\'étude « avant le bord »', nouveau: true, titresDecales: true,
    roles: [
      [/^mesurer A et C$/, 'mesureur : rejoue les 40 courses en gardant le volant, le virage et la vitesse, et joue 16 courses de ville neuves'],
      [/^relire et ecrire$/, 'relecteur et rédacteur : refait les comptes avec son propre code et écrit le résultat dans l\'étude'] ] },
  { dossier: 'echelle-de-bots', wf: 'wf_f5328ebe-c85', titre: 'L\'étude « l\'échelle de bots » (des bots de chaque niveau, et des experts)', nouveau: true, titresDecales: true,
    roles: [
      [/^lire:(.*)$/, 'lecteur « $1 » : lit ce qui est déjà enregistré sur ce sujet, sans jouer de course'],
      [/^concevoir:(.*)$/, 'concepteur de la voie « $1 » : propose une façon de fabriquer l\'échelle et les experts'],
      [/^attaquer:(.*)$/, 'relecteur « $1 » : attaque les trois conceptions sous cet angle'],
      [/^rediger$/, 'rédacteur : écrit le LISEZ-MOI de l\'étude à partir de tout ce qui précède'] ] },
  { dossier: 'pieces', wf: 'wf_ea0019dc-1c9', titre: 'D\'où viennent les pièces des joueurs', nouveau: true, titresDecales: true,
    roles: [
      [/^compter:joueurs$/, 'compteur des joueurs : décompose les pièces des 14 parties de joueurs enregistrées'],
      [/^compter:bot$/, 'compteur du bot : décompose de la même façon les pièces de 20 parties du pilote c0025'],
      [/^concevoir:leviers$/, 'concepteur des leviers : dit d\'où vient l\'écart et par quels réglages le combler'],
      [/^relire et ecrire$/, 'relecteur et rédacteur : refait les comptes, attaque les conclusions et écrit l\'étude'] ] },
  { dossier: 'tri-et-debit', wf: 'wf_8298801f-de5', titre: 'Le test du tri des courses, et le critère de débit du banc', nouveau: true, titresDecales: true,
    roles: [
      [/^testB:mesurer$/, 'mesureur du test du tri : rejoue 40 courses du banc et demande à un juge s\'il les distingue de parties de joueurs'],
      [/^testB:relire$/, 'relecteur du test du tri : refait la mesure par un autre chemin et attaque le verdict'],
      [/^debit:ecrire$/, 'auteur du critère de débit : les pièces par minute de survie, comme nouveau critère du banc des gènes'],
      [/^debit:relire$/, 'relecteur du critère de débit : cherche à le réfuter et corrige ce qu\'il trouve'] ] },
];

/* ----- Le nettoyage : chaque règle compte ses remplacements ----- */
const SEP = '(?:\\\\\\\\|\\\\|/)'; /* un séparateur de chemin : \\ (dans une chaîne JS), \ ou / */
/* un lien de parenté quelconque, et la façon de l'accoler à une machine (« le PC de … ») : la liste est volontairement large */
const LIENS = '(?:grands?-)?(?:parents|p[eè]res?|m[eè]res?|fr[eè]res?|s[oœ]eurs?|oncles?|tantes?|cousine?s?|famille)';
const DE_QUI = '(?:de|du|des|de la|de ses|de son|de sa|de mes|de mon|de ma|de leurs?)';
const REGLES = [
  { sorte: 'nom de PC', re: /DESKTOP-[A-Z0-9]+/gi, par: 'le-xeon' },
  { sorte: 'clé ou jeton', re: /sk-ant-[A-Za-z0-9_\-]+|ghp_[A-Za-z0-9]{8,}|github_pat_[A-Za-z0-9_]{8,}/g, par: '[retiré]' },
  { sorte: 'clé ou jeton', re: /(api[ _-]?key\s*[:=]\s*)["']?[A-Za-z0-9_\-]{12,}["']?/gi, par: '$1[retiré]' },
  { sorte: 'adresse e-mail', re: /[A-Za-z0-9._%+\-]+@[A-Za-z0-9\-]+(?:\.[A-Za-z0-9\-]+)*\.[A-Za-z]{2,}/g, par: '[adresse retirée]' },
  /* le dossier temporaire : C:\Users\sacha\AppData\Local\Temp\claude\<empreinte>\<session> (et ses variantes) */
  { sorte: 'chemin temporaire', re: new RegExp('(?:[A-Za-z]:|/[a-z])' + SEP + 'Users' + SEP + 'sacha' + SEP + 'AppData' +
      '(?:' + SEP + '(?:Local|Roaming|LocalLow))?(?:' + SEP + 'Temp)?(?:' + SEP + 'claude)?(?:' + SEP + '[0-9a-f]{16})?(?:' + SEP + '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})?', 'gi'),
    par: '<dossier temporaire>' },
  /* le même dossier, écrit à la manière de Claude Code pour nommer ses projets (C--Users-sacha-AppData-…) */
  { sorte: 'chemin temporaire', re: /C--Users-sacha-AppData-[A-Za-z0-9\-]+/g, par: '<dossier temporaire>' },
  /* rien sur la famille : un lien de parenté accolé à une personne ou à une machine disparaît ; les règles restent générales,
     pour que l'outil lui-même ne dise rien (« son parent » d'un pilote, qui est de la génétique, n'est pas touché) */
  { sorte: 'détail familial', re: /\b(son|sa|ses|leur) (fr[eè]res?|s[oœ]eurs?|m[eè]re|p[eè]re|cousine?s?)\b/gi, par: 'un proche' },
  { sorte: 'détail familial', re: new RegExp('\\ble (PC|ordinateur|machine) ' + DE_QUI + ' ' + LIENS + '\\b', 'gi'), par: 'ce PC' },
  { sorte: 'détail familial', re: new RegExp('\\b(PC|ordinateur|machine) ' + DE_QUI + ' ' + LIENS + '\\b', 'gi'), par: '[détail privé retiré]' },
];
/* (28/11, après-midi) le nom propre de l'assistant qui tape les commandes sur le Ryzen : il ne doit jamais sortir, et l'outil ne doit pas
   l'écrire lui-même. Il est lu dans un fichier local que git ignore : [{sorte, mot, par}], le mot en majuscules sans accents.
   Chaque mot du texte, mis en majuscules sans accents, lui est comparé. Sans ce fichier, l'outil s'arrête avant d'écrire quoi que ce soit. */
const FICHIER_MOTS_CACHES = path.join(__dirname, '..', '..', 'agents', 'tmp-portfolio', 'mots-caches.json');
let MOTS_CACHES;
try { MOTS_CACHES = JSON.parse(fs.readFileSync(FICHIER_MOTS_CACHES, 'utf8')); }
catch (e) { console.error('refus : ' + FICHIER_MOTS_CACHES + ' est absent ou illisible ; sans lui, un nom privé pourrait sortir. Rien n\'est écrit.'); process.exit(1); }
const nettoyer = function (texte, compte) {
  let t = String(texte);
  for (const r of REGLES) {
    t = t.replace(r.re, function (m, g1) { compte[r.sorte] = (compte[r.sorte] || 0) + 1; return r.par.indexOf('$1') >= 0 ? r.par.replace('$1', g1) : r.par; });
  }
  t = t.replace(/[A-Za-zÀ-ÿ]{5,}/g, function (m) {
    const u = m.toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    for (const c of MOTS_CACHES) if (c.mot === u) { compte[c.sorte] = (compte[c.sorte] || 0) + 1; return c.par; }
    return m;
  });
  return t;
};

/* ----- Les noms des champs des comptes rendus, en français lisible ----- */
const CHAMPS = {
  resume: 'Résumé', fichiers: 'Fichiers', fichier: 'Fichier', tests: 'Tests', problemes: 'Problèmes', ecarts: 'Écarts à la consigne',
  defauts: 'Défauts relevés', verifie_bon: 'Vérifié et jugé bon', reste: 'Ce qui reste', doutes: 'Doutes',
  affirmations_controlees: 'Affirmations contrôlées', corrections: 'Corrections', retires: 'Retiré', manques: 'Manques', verdict: 'Verdict',
  impasses: 'Impasses recensées', controle: 'Contrôle', commits_oublies: 'Commits oubliés', jugement: 'Jugement',
  en_une_minute: 'En une minute', mots_a_definir: 'Mots à définir', retouches: 'Retouches', script: 'Script', images: 'Images',
  legende: 'Légende', chapitre: 'Chapitre', donnees: 'Données', points_controles: 'Points contrôlés', erreurs_corrigees: 'Erreurs corrigées',
  defauts_de_rendu_corriges: 'Défauts de rendu corrigés', images_inserees: 'Images insérées', entrees_lexique: 'Entrées du lexique',
  compris: 'Ce que le lecteur a compris', accroche: 'Ce qui accroche', perdu: 'Où le lecteur se perd',
  titre: 'Titre', gravite: 'Gravité', preuve: 'Preuve', correction: 'Correction proposée', nom: 'Nom', etat: 'État', detail: 'Détail',
  /* (28/11) les champs des études du réglage : absents des quatre premiers travaux, ils n'y changent rien */
  recommandations: 'Recommandations', changement: 'Changement', gain: 'Gain attendu', cout: 'Coût', confiance: 'Confiance',
  verdicts: 'Verdicts du relecteur', recommandation: 'Recommandation', pourquoi: 'Pourquoi',
  /* (28/11, après-midi) les champs des huit travaux du 28/11 : absents des huit premiers, ils n'y changent rien */
  candidats: 'Candidats', constat: 'Constat', mecanisme: 'Mécanisme', ou: 'Où', changeLesYeux: 'Change ce que voient les yeux',
  effetPalier: 'Effet attendu sur le palier', effetRessemblance: 'Effet attendu sur la ressemblance', dejaEssaye: 'Déjà essayé',
  trous: 'Trous', retenus: 'Retenus', idee: 'Idée', defaut: 'Défaut', oublis: 'Oublis', decisions: 'Décisions',
};
/* (28/11) pour les travaux marqués « nouveau » seulement : « passe » (un test) se dit « Réussi », et vrai / faux se dit oui / non */
let NOUVEAU = false;
const nomChamp = function (k) { if (NOUVEAU && k === 'passe') return 'Réussi'; return CHAMPS[k] || (k.charAt(0).toUpperCase() + k.slice(1)).replace(/_/g, ' '); };
const valeur = function (v) { if (NOUVEAU && typeof v === 'boolean') return v ? 'oui' : 'non'; return String(v); };
/* (28/11) les noms de lots écrits sans accent dans les étiquettes des scripts, remis avec leurs accents dans les rôles (travaux « nouveau » seulement) */
const ACCENTS = { 'tri-precoce': 'tri précoce', lignee: 'lignée', regles: 'règles',
  /* (28/11, après-midi) les angles et les familles des huit travaux du 28/11 */
  defauts: 'défauts', 'genome-et-tetes': 'génome et têtes', 'vol-et-yeux': 'vol et yeux', 'boucle-payante': 'boucle payante',
  'bit-pres': 'au bit près', semantique: 'sémantique', 'banc-et-selection': 'banc et sélection', 'banc-courses': 'banc et courses' };
const accents = function (t) { return t.replace(/« ([a-z-]+) »/g, function (m, nom) { return ACCENTS[nom] ? '« ' + ACCENTS[nom] + ' »' : m; }); };

/* Remet une valeur JSON en texte : une chaîne telle quelle, une liste en puces, un objet en « Champ : valeur ». */
const enTexte = function (v, retrait) {
  retrait = retrait || '';
  if (v === null || v === undefined) return retrait + '(rien)';
  if (typeof v !== 'object') return valeur(v).split('\n').map(function (l) { return retrait + l; }).join('\n');
  if (Array.isArray(v)) {
    if (!v.length) return retrait + '(rien)';
    return v.map(function (x) {
      if (x && typeof x === 'object' && !Array.isArray(x)) {
        const cles = Object.keys(x), tete = cles.indexOf('titre') >= 0 ? 'titre' : null;
        /* un objet de la liste : son titre en gras s'il en a un, puis un champ par ligne, en retrait sous la puce */
        const lignes = [];
        if (tete) lignes.push(retrait + '- **' + String(x.titre).replace(/\n/g, ' ') + '**');
        for (const k of cles) {
          if (k === tete) continue;
          const val = x[k], debut = lignes.length ? retrait + '  ' : retrait + '- ';
          if (val && typeof val === 'object') lignes.push(debut + nomChamp(k) + ' :\n' + enTexte(val, retrait + '    '));
          else lignes.push(debut + nomChamp(k) + ' : ' + valeur(val).replace(/\n+/g, ' '));
        }
        return lignes.join('  \n');
      }
      return retrait + '- ' + String(enTexte(x, '')).replace(/\n/g, '\n' + retrait + '  ');
    }).join('\n');
  }
  return Object.keys(v).map(function (k) {
    const val = v[k];
    if (val && typeof val === 'object') return retrait + nomChamp(k) + ' :\n' + enTexte(val, retrait + '  ');
    return retrait + nomChamp(k) + ' : ' + valeur(val);
  }).join('\n');
};

const duree = function (ms) { const m = Math.round(ms / 60000); return (m >= 60 ? Math.floor(m / 60) + ' h ' + String(m % 60).padStart(2, '0') : m + ' min'); };
const millions = function (n) { return (n / 1e6).toFixed(2).replace('.', ',') + ' millions'; };

const total = {};
for (const T of TRAVAUX) {
  NOUVEAU = !!T.nouveau;
  const compte = {};
  const dossierScripts = path.join(SESSION, 'workflows', 'scripts');
  const nomScript = fs.readdirSync(dossierScripts).find(function (f) { return f.endsWith('-' + T.wf + '.js'); });
  if (!nomScript) { console.error('script introuvable pour ' + T.wf); process.exit(1); }
  const script = fs.readFileSync(path.join(dossierScripts, nomScript), 'utf8');
  const run = JSON.parse(fs.readFileSync(path.join(SESSION, 'workflows', T.wf + '.json'), 'utf8'));
  const journal = fs.readFileSync(path.join(SESSION, 'subagents', 'workflows', T.wf, 'journal.jsonl'), 'utf8')
    .split('\n').filter(Boolean).map(function (l) { return JSON.parse(l); });
  const resultats = {};
  for (const l of journal) if (l.type === 'result') resultats[l.agentId] = l.result;

  /* l'ordre de lancement : celui du suivi de l'orchestration (workflowProgress), sinon celui du journal */
  let agents = (run.workflowProgress || []).filter(function (p) { return p.type === 'workflow_agent'; })
    .sort(function (a, b) { return a.index - b.index; });
  if (!agents.length) agents = journal.filter(function (l) { return l.type === 'started'; }).map(function (l, i) { return { index: i + 1, label: l.label, phaseTitle: l.phase, agentId: l.agentId }; });

  const md = [];
  md.push('# ' + T.titre + ' : les comptes rendus des agents');
  md.push('');
  md.push('Ce fichier est sorti de `ml/ecurie/portfolio/outils/orchestration.js`, à partir des traces que Claude Code garde hors du dépôt. ' +
    (T.titresDecales ? 'Chaque agent a rendu son compte rendu en texte libre ; l\'outil le recopie sans rien réécrire, en descendant seulement ses titres sous celui de l\'agent. '
      : 'Chaque agent a rendu son compte rendu sous forme de données (JSON) ; l\'outil les remet en texte, sans rien réécrire. ') +
    'Ce sont les mots des agents : ce qu\'ils affirment n\'a pas été recontrôlé ici.');
  md.push('');
  md.push('- Orchestration : `' + run.workflowName + '` (' + run.runId + '), lancée par la session principale (Claude Fable).');
  /* (28/11, soir) quand une équipe mêle deux modèles (les concepteurs sur Fable, les autres sur Opus), le nombre d'agents de chacun ;
     les seize premiers travaux n'ont qu'un modèle et sortent à l'identique */
  const parModele = {};
  for (const a of agents) if (a.model) parModele[a.model] = (parModele[a.model] || 0) + 1;
  if (Object.keys(parModele).length > 1) md.push('- Agents : ' + run.agentCount + ', ' + Object.keys(parModele).map(function (m) { return parModele[m] + ' du modèle ' + m; }).join(', ') + ' (le modèle de chaque agent est écrit à son rôle, plus bas).');
  else md.push('- Agents : ' + run.agentCount + ', tous du modèle ' + Array.from(new Set(agents.map(function (a) { return a.model; }).filter(Boolean))).join(', ') + '.');
  md.push('- Durée : ' + duree(run.durationMs) + ' ; jetons consommés par les agents : ' + run.totalTokens.toLocaleString('fr-FR') + ' (' + millions(run.totalTokens) + ') ; appels d\'outils : ' + run.totalToolCalls + '.');
  if (run.logs && run.logs.length) md.push('- Message de fin du script : « ' + run.logs.join(' ; ') + ' ».');
  md.push('- Le script lui-même est à côté : `script.js`.');
  md.push('');
  md.push('## Les agents, dans l\'ordre de lancement');
  md.push('');
  for (const a of agents) {
    let role = a.label;
    for (const r of T.roles) if (r[0].test(a.label)) { role = a.label.replace(r[0], r[1]); break; }
    if (NOUVEAU) role = accents(role);
    md.push(a.index + '. ' + role + ' (phase « ' + a.phaseTitle + ' »)');
  }
  md.push('');
  for (const a of agents) {
    let role = a.label;
    for (const r of T.roles) if (r[0].test(a.label)) { role = a.label.replace(r[0], r[1]); break; }
    if (NOUVEAU) role = accents(role);
    md.push('## ' + a.index + '. ' + a.label);
    md.push('');
    md.push('*Rôle : ' + role + '. Phase : ' + a.phaseTitle + '.' + (Object.keys(parModele).length > 1 ? ' Modèle : ' + a.model + '.' : '') + '*');
    md.push('');
    let r = resultats[a.agentId];
    if (r === undefined) { md.push('(aucun compte rendu dans le journal)'); md.push(''); continue; }
    if (typeof r === 'string') { try { r = JSON.parse(r); } catch (e) { /* un texte libre reste un texte */ } }
    /* (28/11, soir) un texte libre garde ses titres, descendus de trois crans (« # » devient « #### ») pour rester sous celui de l'agent */
    if (T.titresDecales && typeof r === 'string') r = r.replace(/^(#{1,3}) /gm, function (m, d) { return '###' + d + ' '; });
    if (r && typeof r === 'object' && !Array.isArray(r)) {
      for (const k of Object.keys(r)) {
        md.push('### ' + nomChamp(k));
        md.push('');
        md.push(enTexte(r[k]));
        md.push('');
      }
    } else { md.push(enTexte(r)); md.push(''); }
  }

  const dossier = path.join(SORTIE, T.dossier);
  fs.mkdirSync(dossier, { recursive: true });
  const scriptPropre = nettoyer(script, compte);
  const mdPropre = nettoyer(md.join('\n'), compte);
  fs.writeFileSync(path.join(dossier, 'script.js'), scriptPropre);
  fs.writeFileSync(path.join(dossier, 'comptes-rendus.md'), mdPropre);
  console.log(T.dossier + ' : ' + agents.length + ' agents, nettoyage ' + JSON.stringify(compte));
  for (const k in compte) total[k] = (total[k] || 0) + compte[k];
}
console.log('total des remplacements : ' + JSON.stringify(total));
