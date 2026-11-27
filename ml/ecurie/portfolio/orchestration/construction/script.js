export const meta = {
  name: 'construction-evolution-bots',
  description: 'Construire ml/evolution (selection naturelle des bots, sans jetons) : interfaces, quatre modules en parallele, integration, trois relectures, corrections',
  phases: [
    { title: 'Interfaces', detail: 'un architecte fixe les signatures et les formats', model: 'opus' },
    { title: 'Modules', detail: 'quatre constructeurs en parallele, chacun avec ses tests', model: 'opus' },
    { title: 'Integration', detail: 'evoluer.js, validation, coffre, essais de bout en bout', model: 'opus' },
    { title: 'Relecture', detail: 'trois relecteurs : statistique, robustesse, determinisme', model: 'opus' },
    { title: 'Corrections', detail: 'un correcteur applique les defauts confirmes et relance les tests', model: 'opus' },
  ],
}

const CONTEXTE = `
Tu construis un systeme de SELECTION NATURELLE pour les bots du jeu CASH CAR : une population de pilotes evolue seule sur un PC (Node pur, sans jeton, sans Internet), le moins bon est vire a chaque generation. Reponds en francais ; noms et commentaires du code en francais, commentaires en /* … */ (jamais de // en fin de ligne).

## A lire d'abord
- LA SPECIFICATION : C:\\Users\\sacha\\code\\CASH-CAR-bots-ecurie\\ml\\ecurie\\agents\\tmp-voltige\\evolution-etude\\SPECIFICATION.md (elle fait foi, sauf les amendements ci-dessous).
- L'etude du bruit : …\\evolution-etude\\bruit\\resultats.txt ; l'inventaire : …\\evolution-etude\\inventaire\\ (sortie.txt, vue-exemple.json, essai-bac.js).
- Le code existant, a NE PAS modifier : ml/bot/piloter.js, ml/bot/noter.js, ml/bot/yeux.js, ml/bot/doigts.js, ml/bot/ressemblance.js, ml/ecurie/pilote-voltige.js, ml/labo/.

## Amendements (ils priment sur la specification)
1. Tout se construit dans le dossier NEUF ml/evolution/ (depot C:\\Users\\sacha\\code\\CASH-CAR-bots-ecurie). Une fois ecrit, ml/evolution/INTERFACES.md fait foi pour les signatures et les formats : aucun module ne s'en ecarte sans le corriger et le dire.
2. LA LOI « RETOUR » DES YEUX ENTRE DANS LE GENOME DES LA V1 (la specification, § 11, la repoussait). Les yeux (yeux.js, chercher « LA LOI « RETOUR » ») jouent une loi de retour vers la route a parametres quand l'ordre du pilote porte « retours:[{…}] ». Genes : retourOn (0/1, naissance 0), retMarge [4,14] (naissance 8), retCap [0.45,0.9] (0.8), retGain [0.7,1.4] (0.8), retAvance [0.10,0.25] (0.15), retourPrime [0,15] (4), volMieux (0/1, naissance 0) ; rv 0.2, rm 0.24, rn 0.18 figes. Les retouches a faire au pilote sont deja ecrites comme un script : ml/ecurie/agents/tmp-voltige/faire-pR.js (il transforme pilote-voltige.js ; lis-le). Avec retourOn = 0 le pilote ne met PAS « retours » dans ses ordres et ne change en rien : l'identite au bit pres avec pilote-voltige.js doit tenir a la naissance.
3. Le controle « 12 rayons dans l'ordre » de la specification (§ 5.2) est a VERIFIER dans yeux.js (radarVol) : les 10 premiers rayons (tenu, rien, gauche, droite, cabre, pique, plane, planeCabre, versRoute, versRoutePlane) sont toujours la dans cet ordre ; viser et viserPlane ne viennent que si une cible existe ; les rayons retour0… viennent apres. Ecris le controle d'apres le code reel.
4. ml/bot/yeux.js et ml/bot/piloter.js ont des modifications non enregistrees dans git (la loi « retour ») : c'est l'etat de reference, n'y touche pas.
5. Sur ce PC (4 coeurs / 8 fils, d'autres mesures tournent) : tes essais lancent AU PLUS 4 courses a la fois, et des courses courtes (45 a 60 s de jeu) sauf si le test en demande davantage.
6. Windows : chemins avec espaces (« VERSION PRINCIPALE »), path.join partout, child_process.fork ; les fichiers generes en LF.

## Regles strictes
- N'ecris que dans ml/evolution/ (et ses sous-dossiers). Aucun commit git, aucune suppression hors de ml/evolution/, rien de payant, pas d'Internet.
- Ne lance JAMAIS ml/ecurie/boucle.js, chaine.js, ni ml/bot/verifier.js.
- Les lignes « preambule: Unexpected token » et « hub : accueil TypeError » au chargement du jeu sont du bruit normal.
- Un test qui ne passe pas se dit tel quel, avec la sortie. Ne maquille rien, ne retire pas un test pour qu'il passe.
`

const SCHEMA = { type: 'object', properties: {
  resume: { type: 'string' },
  fichiers: { type: 'array', items: { type: 'object', properties: { chemin: { type: 'string' }, role: { type: 'string' } }, required: ['chemin'] } },
  tests: { type: 'array', items: { type: 'object', properties: { nom: { type: 'string' }, passe: { type: 'boolean' }, detail: { type: 'string' } }, required: ['nom', 'passe'] } },
  ecarts: { type: 'string', description: 'ce qui s ecarte de la specification ou de INTERFACES.md, et pourquoi' },
  problemes: { type: 'array', items: { type: 'string' }, description: 'ce qui reste casse, douteux ou non verifie' },
}, required: ['resume', 'fichiers', 'tests', 'problemes'] }

phase('Interfaces')
const archi = await agent(CONTEXTE + `
## Ta mission : L'ARCHITECTE — ecrire ml/evolution/INTERFACES.md et ml/evolution/config.json
Lis la specification en entier, puis les fichiers existants qu'elle cite (noter.js bloc --enfant et pourquoiEcartee, piloter.js charger/course/bilan, ressemblance.js mesuresPartie/joueurs/reference/ecart, pilote-voltige.js, faire-pR.js). Ecris INTERFACES.md, le contrat que cinq developpeurs suivront sans se parler :
- pour CHAQUE module (enfant.js, courses.js, genome.js, modele.js, note.js, graines.js, identite.js, evoluer.js, tableau.js, etat.js, inscrire-champion.js) : les fonctions exportees avec leur signature exacte (parametres, valeur rendue, erreurs), et sa ligne de commande ;
- le FORMAT exact, avec un exemple, de : un genome (tous les genes du bloc A avec leur borne et leur valeur de naissance — recopie la table de l'inventaire, ajoute ceux de l'amendement 2 et les 14 constantes promues —, les deux tetes de reseau), config.json, etat/population.json, une ligne de etat/courses.jsonl, de generations.jsonl, validations.jsonl, morts.jsonl, coffre.jsonl, le fichier .json d'un champion, etat/verrou.json ;
- la balise et la forme du bloc genere dans modele.js (ce que ecrirePilote remplace, comment le pilote lit G.* et les poids) ;
- l'ordre des entrees des deux tetes de reseau (§ 4.2), une par ligne, avec sa formule exacte a partir de la vue ;
- qui ecrit quel fichier d'etat (un seul ecrivain par fichier).
Ecris aussi config.json avec toutes les valeurs par defaut (§ 5 a 7), et un petit jeu « essai » (μ = 4, λ = 2, 3 graines, tmax 60) dans config-essai.json.
Ne code aucun module. Rends le resume des decisions prises la ou la specification etait floue.`, { label: 'architecte', phase: 'Interfaces', schema: SCHEMA, model: 'opus' })

const MODULES = [
  { cle: 'pilote', prompt: `
## Ta mission : LE PILOTE FABRIQUE — genome.js, modele.js, identite.js (etape 2 de la specification, + amendement 2)
modele.js = pilote-voltige.js + les retouches de faire-pR.js + les 14 constantes promues branchees sur G.* + les deux tetes de reseau (naissance muette : W1 tire, W2 = 0) + la balise du genome. genome.js : BORNES, genomeTemoin(), muter(), croiser(), reparer(), shaGenome(), ecrirePilote(). identite.js : le controle d'avant-nuit.
Tests a faire passer et a laisser dans ml/evolution/tests/ : (a) IDENTITE : le genome temoin contre ml/ecurie/pilote-voltige.js, 3 graines × 45 s, un processus neuf par course (fork de ml/bot/noter.js --enfant, ou ton propre petit lanceur en attendant enfant.js) : memes empreintes (bilan.empreinte) ; (b) un genome avec W2 ≠ 0 donne une autre course ; avec retourOn = 1 aussi ; (c) reparer() : 10 000 mutations au hasard respectent bornes et contraintes ; (d) ecrirePilote : zero \\r, sha stable, se charge dans le bac (piloter.charger) en moins de 20 ms ; (e) le controle de l'ordre des rayons (amendement 3).` },
  { cle: 'courses', prompt: `
## Ta mission : LES COURSES — enfant.js, courses.js et le cache (etape 1 de la specification)
enfant.js : une course dans un processus neuf, resultat compact (§ 5.2). courses.js : la file de (pilote, graine), N enfants a la fois, priorite basse, chien de garde, relance, tri des courses ecartees (pourquoiEcartee recopiee), cache dans etat/courses.jsonl (cle du § 5.3), reprise apres un arret brutal (ligne tronquee ignoree). Utilisable seul : node ml/evolution/courses.js <pilote.js> --graines 12 --depart 910000 --tmax 300 --travailleurs 4.
Tests a laisser dans ml/evolution/tests/ : (a) deux fois la meme (pilote, graine) dans deux processus neufs : meme resultat ; (b) 6 courses de ml/ecurie/pilote-voltige.js depuis 910000 a tmax 300, 4 a la fois : palier et duree egaux a ceux de ml/ecurie/agents/tmp-voltige/mes-pN2.json (meme pilote ; lis N.courses) ; (c) tuer le maitre au milieu (kill dur) et relancer : seules les courses manquantes tournent ; (d) un pilote qui leve une erreur ou boucle : course « non mesuree », pas de blocage ; (e) le cache ne rejoue jamais une cle connue.` },
  { cle: 'note', prompt: `
## Ta mission : LA NOTE ET LES GRAINES — note.js, graines.js (etape 3 de la specification)
note.js, sans effet de bord : le modele pilote + graine (moindres carres alternes), le retrecissement, les erreurs-types, l'ecart « dans la foule » E (zone morte, poids), l'ecart classique pour comparaison, la note F, le bootstrap apparie de la validation (§ 7.6), pourquoiEcartee. graines.js : mulberry32 a etat sauvegarde, tirage des graines d'entrainement, compteur de validation, coffre.
Tests a laisser dans ml/evolution/tests/ : ceux de l'etape 3 sur ml/ecurie/agents/tmp-voltige/evolution-etude/bruit/courses-0.json (lis extraire.js et analyser.js du meme dossier pour le format) ; plus : des donnees fabriquees ou l'on connait a_p et b_g (le modele les retrouve), un pilote sans assez de parties (E = 4), la reprise du generateur (memes tirages apres sauvegarde et relecture), le bootstrap apparie sur un cas ou la reponse est connue. Moins de 10 s sur un coeur.` },
  { cle: 'exploitation', prompt: `
## Ta mission : L'EXPLOITATION — tableau.js, etat.js, lancer.cmd, arreter.cmd, installer-tache.cmd, README.md, .gitignore (etape 6 de la specification)
tableau.js reecrit etat/tableau.html (SVG en ligne, aucun appel reseau, lisible par quelqu'un qui ne code pas : la courbe du coffre d'abord, en francais simple) et etat/resume.txt ; etat.js imprime le resume en 10 lignes. Les .cmd pour Windows (le depot peut etre n'importe ou : chemins relatifs au fichier, %~dp0). installer-tache.cmd ne sera lance que par le proprietaire : il explique ce qu'il fait avant de le faire. README.md : le mode d'emploi pour Sacha, qui ne code pas — lancer, arreter, lire le tableau, prendre un champion, quoi faire si ca s'arrete — en phrases courtes, sans jargon.
Comme evoluer.js n'existe pas encore, fabrique un etat d'exemple conforme a INTERFACES.md (ml/evolution/tests/etat-exemple/ : 30 generations inventees) et teste dessus : tableau.html s'ouvre hors ligne et ne contient aucune URL http ; etat.js tient en 10 lignes ; un etat vide ou tronque ne fait pas planter.` },
]

phase('Modules')
const modules = (await parallel(MODULES.map(m => () =>
  agent(CONTEXTE + m.prompt + `\n\nLis d'abord ml/evolution/INTERFACES.md (le contrat). Resume de l'architecte : ${JSON.stringify(archi && archi.resume)}`, { label: `module:${m.cle}`, phase: 'Modules', schema: SCHEMA, model: 'opus' })
    .then(r => ({ cle: m.cle, r }))))).filter(Boolean)

phase('Integration')
const integ = await agent(CONTEXTE + `
## Ta mission : L'INTEGRATEUR — evoluer.js, la validation, le coffre, les champions, inscrire-champion.js (etapes 4, 5 et 9 de la specification, sans toucher a ml/labo)
Quatre developpeurs ont ecrit les modules (compte rendu ci-dessous). Lis INTERFACES.md et leur code, corrige les raccords qui ne tombent pas juste (dis lesquels), puis ecris evoluer.js : le maitre (verrou, epoque, naissances, courses, note, renvoi du moins bon, validation par bootstrap apparie, coffre, phases A/B/C, etat, tableau, STOP et PAUSE, --une-generation, --arret-apres N, --banc, --valider-maintenant, --config). inscrire-champion.js : ecris-le mais ne l'execute pas, et ne modifie pas ml/labo/labo.js (note seulement la ligne a y ajouter).
Tests a faire passer (ml/evolution/tests/), avec config-essai.json (μ = 4, λ = 2, 3 graines, tmax 60, 4 travailleurs) dans un dossier d'etat a part (--etat) : (a) --une-generation finit et ecrit tous les fichiers ; (b) kill dur au milieu des courses, relance : memes naissances, seules les courses manquantes tournent ; (c) STOP et PAUSE ; (d) deux lancements : le second s'arrete ; (e) trois generations de suite : un pilote est vire a chaque generation ou il y a un candidat, le temoin et le champion jamais ; (f) --valider-maintenant : le verdict est ecrit, et le fichier d'un champion note par ml/bot/noter.js (une graine, tmax 60) donne la meme course que dans courses.jsonl ; (g) changer la config d'epoque (simule un sha different) : nouvelle epoque annoncee. Puis lance tableau.js sur l'etat obtenu.

## Les comptes rendus des modules
${JSON.stringify(modules, null, 1)}`, { label: 'integrateur', phase: 'Integration', schema: SCHEMA, model: 'opus' })

const SCHEMA_RELECTURE = { type: 'object', properties: {
  defauts: { type: 'array', items: { type: 'object', properties: {
    titre: { type: 'string' }, gravite: { type: 'string', enum: ['bloquant', 'important', 'mineur'] }, fichier: { type: 'string' },
    preuve: { type: 'string', description: 'la ligne, ou la commande qui le montre et sa sortie' }, correction: { type: 'string' },
  }, required: ['titre', 'gravite', 'fichier', 'preuve'] } },
  verifie_bon: { type: 'array', items: { type: 'string' }, description: 'ce que tu as controle et trouve juste' },
}, required: ['defauts', 'verifie_bon'] }

const LENTILLES = [
  { cle: 'statistique', prompt: `Relis note.js, graines.js et la partie selection de evoluer.js contre les § 5 a 7 de la specification : le modele pilote + graine (identifiabilite, centrage), le retrecissement, les erreurs-types, E avec zone morte et poids, F, qui peut etre vire (24 courses, temoin, champion), le tournoi, la regle de validation (bootstrap apparie, les trois conditions), les graines (jamais de fuite entre entrainement, validation et coffre), la malediction du gagnant journalisee. Refais un calcul a la main sur un petit cas. Cherche ce qui ferait que la selection choisit au hasard ou triche.` },
  { cle: 'robustesse', prompt: `Relis courses.js, enfant.js, evoluer.js, les .cmd : la reprise apres un kill dur a n'importe quel moment (ecritures atomiques, ligne tronquee, etat a moitie ecrit), le verrou (pid mort, deux lancements), le chien de garde, la cle du cache, le changement d'epoque, les chemins Windows avec espaces, les fuites de processus enfants, la memoire sur des semaines (courses.jsonl relu en entier ?), le disque. Provoque les pannes pour de vrai sur une petite configuration (config-essai.json, dossier d'etat a part) et dis ce qui casse.` },
  { cle: 'determinisme', prompt: `Relis modele.js, genome.js, identite.js contre ml/ecurie/pilote-voltige.js et faire-pR.js : compare ligne a ligne ce que modele.js garde, change et ajoute ; l'identite au bit pres a la naissance (refais le test sur 2 graines que les tests n'utilisent pas, 60 s) ; les tetes de reseau (entrees bornees, valeurs non finies, ordre des entrees conforme a INTERFACES.md, W2 = 0 muet, branchement des deux cotes de la comparaison) ; rien d'interdit dans le bac (Math.random, Date) ; mutation et croisement (bornes, contraintes, drapeaux, genes oublies : un gene declare mais jamais lu par le pilote, ou lu mais jamais mute) ; le sha et les fins de ligne.` },
]

phase('Relecture')
const relectures = (await parallel(LENTILLES.map(l => () =>
  agent(CONTEXTE + `
## Ta mission : RELECTEUR sceptique (${l.cle})
Le systeme vient d'etre construit dans ml/evolution/. Ne crois ni les commentaires ni les comptes rendus : lis le code et fais tourner. Tu n'ecris RIEN dans ml/evolution/ sauf dans ml/evolution/tests/relecture-${l.cle}/ (tes scripts et tes dossiers d'etat d'essai).
${l.prompt}
Chaque defaut avec sa preuve (ligne ou commande + sortie) et sa correction proposee. Pas de remarques de style.

## Compte rendu de l'integrateur
${JSON.stringify(integ, null, 1)}`, { label: `relecture:${l.cle}`, phase: 'Relecture', schema: SCHEMA_RELECTURE, model: 'opus' })
    .then(r => ({ lentille: l.cle, r }))))).filter(Boolean)

phase('Corrections')
const defauts = relectures.flatMap(x => ((x.r && x.r.defauts) || []).map(d => Object.assign({ lentille: x.lentille }, d)))
log(`${defauts.length} defauts releves (${defauts.filter(d => d.gravite === 'bloquant').length} bloquants, ${defauts.filter(d => d.gravite === 'important').length} importants)`)
const corr = defauts.length ? await agent(CONTEXTE + `
## Ta mission : LE CORRECTEUR
Trois relecteurs ont releve les defauts ci-dessous dans ml/evolution/. Pour chacun : reproduis-le ; s'il est reel, corrige-le (bloquants et importants d'abord ; les mineurs si c'est sur) et ajoute un test qui l'aurait vu ; s'il ne se reproduit pas, dis pourquoi. Puis relance TOUS les tests de ml/evolution/tests/ et une generation complete avec config-essai.json. Mets INTERFACES.md et README.md a jour si un format a change. Rends l'etat final : ce qui est corrige, ce qui ne l'est pas, les tests qui passent et ceux qui ne passent pas.

## Les defauts
${JSON.stringify(defauts, null, 1)}`, { label: 'correcteur', phase: 'Corrections', schema: SCHEMA, model: 'opus' }) : null

return { archi, modules, integ, relectures, corr }
