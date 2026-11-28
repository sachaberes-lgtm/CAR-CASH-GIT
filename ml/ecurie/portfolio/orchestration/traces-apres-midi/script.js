export const meta = {
  name: 'traces-du-28-apres-midi',
  description: 'Ranger l apres-midi du 28/11 dans le portfolio : traces des 8 orchestrations du jour, journal, passation, etapes, registre des impasses ; relecture adverse puis commit',
  phases: [
    { title: 'Ecrire', detail: 'un agent range les orchestrations, un autre ecrit le journal et la passation' },
    { title: 'Relire', detail: 'un relecteur verifie chaque chiffre a la source, la vie privee, puis committe' },
  ],
}

const COMMUN = `
CONTEXTE (depot C:\\Users\\sacha\\code\\CASH-CAR-bots-ecurie, branche bots-ecurie ; tu travailles dans cet arbre, pas ailleurs).
Le chantier : l'ecurie de bots du jeu CASH CAR. Depuis le 27/11, le cap est la selection naturelle (ml/evolution/) qui tourne seule sur le PC de Sacha (« le Ryzen »). Le PC de developpement s'appelle « le Xeon ». Le portfolio (ml/ecurie/portfolio/) garde la trace de tout pour un jury qui ne code pas : phrases courtes, mots simples, chaque chiffre avec sa source, les impasses dites telles quelles.

REGLES DURES
- Tu ne touches A RIEN hors de ml/ecurie/ (une vague du banc et des tests longs tournent en ce moment : ne lance AUCUNE course, aucun test de ml/evolution/tests, ne modifie rien dans ml/evolution/, ml/bot/, ml/reel/, code/, VERSION PRINCIPALE/). Tu peux LIRE partout.
- Le depot est PUBLIC : jamais de nom de machine Windows, jamais d'adresse e-mail, jamais de cle, jamais de detail de famille ou de logement, aucun nom d'ecole ajoute. Les deux PC s'appellent « le Xeon » et « le Ryzen ». L'assistant qui tape les commandes sur le Ryzen s'ecrit « l'assistant de Sacha sur le Ryzen », jamais autrement. Pour le silence du Ryzen, ecrire seulement « sa connexion a Internet a coupe » (pas le moyen de connexion).
- Piege Git Bash : ne passe jamais a node un chemin qui commence par /c/ (il cree un dossier C:\\c\\…) ; utilise des chemins relatifs au depot ou C:/Users/….
- Francais, accents dans les .md du portfolio comme dans les fichiers voisins. Ne committe rien (le relecteur le fera) sauf si ta consigne dit le contraire.

LES FAITS DE L'APRES-MIDI DU 28/11/2026 (verifie chacun a la source avant de l'ecrire : git log, les notes citees, les fichiers d'etude)
1. Le banc des genes (etude du matin) est lu et pousse : commit 46842ee77 (deja dans le journal du 28/11 ? verifie ce qui y est deja ecrit, ne redis pas).
2. Les greffes : commit 5e7f311aa ; ml/evolution/greffes.js, ml/evolution/notes/greffes.md. La selection fait naitre, a la place de l'immigre, le champion recopie avec des interrupteurs forces, selon un cycle.
3. Le Ryzen : il n'a jamais arrete ; seul son envoi horaire a echoue de 2 h a 13 h (sa connexion a Internet a coupe). Mise a jour n° 1 faite par l'assistant de Sacha sur le Ryzen a 13 h 11 (fusion de bots-ecurie avec les greffes, nouvelle epoque 3c3d44e8bd9b, identite verifiee 3 fois, temoin c0025). A l'envoi de 14 h (git show origin/evolution-ryzen:ml/evolution/etat/resume.txt et population.json) : generation 17, 495 courses a l'heure, 0 sacre, champion = temoin, regle6 = 2, et la premiere greffe est nee comme prevu a la generation 17 (enfant 2e9b5cc4c924, greffe raccCartes_ville = 0). « Mutations comptent-elles ? » : trop tot (109 enfants mesures sur 191 ; r 0,17 ; tau 0,45 [0,00 ; 0,77]).
4. Le lot « genes v4 » : ecrit sur une branche a part (commits 7f85efb38 puis d30db9519), fusionne dans bots-ecurie par le commit 77083d123. Notes : ml/evolution/notes/genes-v4.md (le contrat), LIVRAISON-GENES-V4.md, genes-v4-lot-a/b/c.md ; le banc v2 : ml/evolution/banc/README.md.
5. L'IMPASSE du jour : « la sortie preparee par les rayons du bord ». Etude ml/ecurie/etude/sortie-preparee/LISEZ-MOI.md (40 courses, 180 decollages distincts, 24 morts ; la regle du contrat ne s'est jamais declenchee ; les yeux ne voient aucune issue aux 24 decollages mortels ; « plane » au bord se serait ecrase dans 57 vols poses ; aucun decollage nitro allumee sur les maps a decor, 0 sur 253, quand les joueurs en font environ 63 sur 100). Decision de la session principale : sortieOn est reecrit en « la nitro au decollage sur les maps a decor », le pendant exact de bordOn ; ce que cela fait au palier n'est PAS mesure, seul le banc le dira. La piste notee pour plus tard : le levier est au sol avant le bord, et les raccourcis voulus tuent en ville (5 morts sur 22).
6. Apres la fusion : le cycle des greffes passe a 10 ensembles (cycle de 11 generations) avec cinq ensembles v4 (ml/evolution/config.json, cle "greffes") ; un controle perime de greffes.test corrige (71/71) ; 24 suites rapides et banc.test passent sur l'arbre fusionne ; identite.test, evoluer.test et courses.test tournent encore au moment ou tu ecris (ecris « en cours », pas « passes »).
7. La vague 1 du banc v2 : ml/evolution/banc/vagues/v001-confirmation-gestes/vague.json et plan.json, commit 15c7f1cb3, ecrite et commitee AVANT d'etre jouee ; cinq bras (bord, slalom, bord-slalom, suit, fuir-vite) contre c0025 sur des graines neuves ; elle tourne sur le Xeon, aucun resultat a ce stade (n'en ecris aucun, ne lis pas regards.json pour conclure).
8. Ce qui attend : la mise a jour n° 2 du Ryzen (le lot v4 ; la migration des genomes en v:4 est a sens unique, donc copie de etat\\ et champions\\ avant) n'est PAS faite ; les questions laissees a Sacha : le seuil de la seconde chance (chancePalierMin, 12 aujourd'hui), la decision D1 (seuilB / seuilC), l'emploi des credits d'API restants.
9. Une consigne de travail de Sacha ce jour (la citer telle quelle si le journal cite deja ses paroles) : « tu peux utiliser plus de fable si tu as besoin, c'est pas forcer fait le seulement si y'a des tache que fable peut vraiment faire mieu ».
`

const ORCH = `Tu ranges dans le portfolio la trace des HUIT orchestrations (equipes d'agents) du 28/11/2026, avec l'outil qui existe deja : ml/ecurie/portfolio/outils/orchestration.js. Lis d'abord son en-tete et ml/ecurie/portfolio/orchestration/LISEZ-MOI.md pour faire EXACTEMENT comme pour les huit travaux deja ranges (un sous-dossier par travail : script.js et comptes-rendus.md ; une ligne dans le tableau ; les totaux refaits ; le titre et l'introduction du LISEZ-MOI mis a jour : il y aura seize travaux, du 27 au 28/11).
${COMMUN}
Les huit orchestrations a ranger (bilans dans C:/Users/sacha/.claude/projects/C--Users-sacha-code-CASH-CAR-bots-ecurie/f3798b51-c2ab-404a-a672-f7bb7aff9602/workflows/<id>.json ; journaux dans …/f3798b51-c2ab-404a-a672-f7bb7aff9602/subagents/workflows/<id>/journal.jsonl ; scripts dans …/f3798b51-c2ab-404a-a672-f7bb7aff9602/workflows/scripts/) :
- wf_e7c9c530-0ea : les traces du 28 novembre (portfolio de la nuit) -> dossier traces-du-28
- wf_b84c1055-e3c : les prochaines idees pour le banc -> prochaines-idees
- wf_a8860828-eec : le contrat des genes v4 -> contrat-v4
- wf_f91dd3e4-3e4 : la lecture du banc des genes -> lecture-du-banc
- wf_97cc59d9-d7e : le code des genes v4 -> code-v4
- wf_3dbb33d5-4d2 : les greffes de la selection -> greffes
- wf_e9f81f3f-6ec : la mesure de la sortie preparee -> sortie-mesure
- wf_a86ae302-f88 : sortieOn reecrit -> sortie-reecrite
Si l'outil a deja range l'un d'eux (verifie les dossiers existants), ne le refais pas. Apres le rangement, RELIS chaque comptes-rendus.md et chaque script.js produit a la recherche de ce qui ne doit pas etre publie (nom de machine Windows, nom de l'assistant du Ryzen, adresse e-mail, chemin qui contient un nom de machine, cle) et masque-le comme l'outil ou les dossiers voisins le font deja ; dis ce que tu as masque. Ajoute dans le LISEZ-MOI, la ou les voisins le font, une phrase par travail sur ce qu'il a rendu et sur ce que le relecteur adverse y a corrige (pris dans les comptes rendus eux-memes, pas invente). Depuis le 28/11, quelques agents peuvent tourner sur Fable (conception, jugement) : si un bilan le montre, dis-le ; sinon ne l'affirme pas.
Rends : la liste des dossiers crees, le tableau final (agents, duree, jetons, appels d'outils par travail et totaux), ce que tu as masque, et tout ce que tu n'as pas pu verifier.`

const JOURNAL = `Tu ecris la suite du journal de bord du portfolio pour l'apres-midi du 28/11/2026, et tu mets a jour la passation, les etapes et le registre des impasses.
${COMMUN}
A FAIRE
1. Lis ml/ecurie/portfolio/journal/MODELE-D-ENTREE.md, LEXIQUE.md, LISEZ-MOI.md (sommaire et registre des impasses) et le journal 2026-11-28.md tel qu'il est : tu AJOUTES des chapitres a 2026-11-28.md dans le meme ton et la meme forme (ou tu crees 2026-11-28_suite.md si le fichier est deja tres long et que les jours precedents ont fait ainsi : regarde 2026-11-25_suite.md), sans reecrire ce qui existe.
2. Les chapitres a ecrire, chacun avec : ce qu'on voulait savoir, ce qu'on a fait, ce qu'on a trouve (les chiffres avec leur fichier source), ce qu'on a decide et pourquoi, ce qu'on ne sait pas : les greffes ; le silence du Ryzen et sa mise a jour ; le lot « genes v4 » (les 8 genes dits en mots simples, les compteurs, les courses a map imposee, le banc v2 et sa regle d'arret, l'ecriture de la question avant de jouer) ; l'impasse de la sortie preparee (c'est le chapitre le plus important pour un jury : une regle ecrite au contrat, jamais declenchee, mesuree, abandonnee, remplacee par une regle plus simple, et ce qui reste inconnu) ; la fusion et la vague 1 ecrite avant d'etre jouee.
3. Le registre des impasses (journal/LISEZ-MOI.md) : une ligne pour « la sortie preparee par les rayons du bord », dans la forme des lignes voisines. Le sommaire et, si besoin, le LEXIQUE (greffe, bras, vague, regard, « net », compteur de declenchements : seulement les mots qui n'y sont pas).
4. ml/ecurie/PASSATION.md et ml/ecurie/ETAPES.md : l'etat exact a cette heure (fait 3 a 8 ci-dessus), ce qui tourne, ce qui attend, dans la forme qu'ils ont deja.
5. La frise : regarde ml/ecurie/portfolio/figures.js et figures-journal/ ; si la frise se regenere depuis des donnees sans jouer de course et qu'il lui manque le 28/11 apres-midi, ajoute les jalons (greffes, lot v4, impasse, vague 1) et regenere-la ; sinon dis-le simplement.
N'ecris AUCUN resultat de la vague 1 ni des tests longs. N'arrondis pas un chiffre dans le sens qui arrange. Rends : la liste des fichiers modifies, la liste de TOUS les chiffres que tu as ecrits avec la source de chacun (fichier et ligne ou commande), et ce que tu n'as pas pu verifier.`

phase('Ecrire')
const [orch, journal] = await parallel([
  () => agent(ORCH, { label: 'ranger les 8 orchestrations', phase: 'Ecrire', model: 'opus' }),
  () => agent(JOURNAL, { label: 'journal, passation, impasses', phase: 'Ecrire', model: 'opus' }),
])

phase('Relire')
const relu = await agent(`Tu es le RELECTEUR ADVERSE du portfolio. Deux agents viennent d'ecrire dans ml/ecurie/ (rien n'est commite : git status et git diff te montrent tout). Ton travail : chercher ce qui est FAUX, invente, arrondi dans le bon sens, ou qui ne doit pas etre publie, et le corriger toi-meme.
${COMMUN}
CE QU'ILS DISENT AVOIR FAIT
--- agent des orchestrations ---
${orch || '(aucun compte rendu : verifie tout dans git status)'}
--- agent du journal ---
${journal || '(aucun compte rendu : verifie tout dans git status)'}

A FAIRE
1. Chaque chiffre nouveau du journal, de la passation, des etapes et du registre : retrouve-le a la source (git log, git show origin/evolution-ryzen:ml/evolution/etat/resume.txt, ml/ecurie/etude/sortie-preparee/, ml/evolution/notes/, ml/evolution/config.json, ml/evolution/banc/vagues/v001-confirmation-gestes/vague.json et plan.json, les bilans des orchestrations). Corrige ce qui ne colle pas ; retire ce que tu ne retrouves pas.
2. Aucun resultat de la vague 1 ni des tests longs ne doit etre ecrit (ils tournent encore).
3. Vie privee, sur TOUS les fichiers modifies ou crees (comptes-rendus.md et script.js compris) : cherche par grep un nom de machine Windows (regarde la variable COMPUTERNAME de ce PC et cherche-la, sans l'ecrire nulle part), « l'assistant de Sacha sur le Ryzen », un arobase d'adresse, « sk-ant », « partage de connexion », « telephone », un nom d'ecole ajoute par ces agents. Masque ou reformule.
4. Les liens et les noms de fichiers cites existent ; le tableau des orchestrations se recalcule (sommes) ; le sommaire du journal pointe vers les nouveaux chapitres.
5. Committe UNIQUEMENT les fichiers sous ml/ecurie/ (git add ml/ecurie, rien d'autre : ne touche pas a ml/evolution/banc/vagues/ que la vague ecrit en ce moment, ni au fichier non suivi ml/bot/results/note-essai-main-allege-t120-parties.json). Message en francais, une seule ligne longue comme les commits voisins (git log -3), commencant par « BOTS-ML : » et finissant par « — le jeu ne change pas », puis une ligne vide et « Co-Authored-By: Claude Fable 5.2 <[adresse retirée]> ». Ne pousse pas.
Rends : le hash du commit, la liste des defauts trouves et corriges, et ce qui reste non verifie.`, { label: 'relecture adverse et commit', phase: 'Relire', model: 'opus' })

return { orch, journal, relu }