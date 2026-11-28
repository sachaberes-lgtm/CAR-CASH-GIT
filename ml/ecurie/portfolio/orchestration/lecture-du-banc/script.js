export const meta = {
  name: 'banc-des-genes-lecture',
  description: 'Lire le banc des genes fini : composantes de E par bras, relecture adverse des chiffres, redaction pour le portfolio',
  phases: [
    { title: 'Analyse', detail: 'composantes de E et paliers par bras, sans rejouer de course' },
    { title: 'Relecture', detail: 'recalcul independant, attaque des conclusions' },
    { title: 'Redaction', detail: 'LISEZ-MOI de l etude, journal, passation' },
  ],
}
const RACINE = 'C:\\Users\\sacha\\code\\CASH-CAR-bots-ecurie'
const ETUDE = 'ml/ecurie/etude/banc-des-genes'
const COMMUN = `
Tu travailles dans le depot ${RACINE} (branche bots-ecurie). Commence chaque commande Bash par: cd /c/Users/sacha/code/CASH-CAR-bots-ecurie
Le banc des genes (${ETUDE}) vient de finir : 13 bras (le pilote de depart c0025 tout eteint, puis chaque interrupteur allume seul, plus gestes5, c0026, c0101), 96 graines communes, 1250 courses, aucune ratee. Lis d'abord ${ETUDE}/LISEZ-MOI.md, ${ETUDE}/sorties/resume.txt, ${ETUDE}/sorties/resultats.json, ${ETUDE}/analyser.js, ${ETUDE}/etat/bras.json. Les lignes de course sont dans ${ETUDE}/etat/courses-*.jsonl.
Regles dures :
- AUCUNE course a jouer (un autre chantier utilise le processeur). Tu ne fais que lire et calculer sur les lignes deja ecrites.
- Ne modifie RIEN hors de ${ETUDE}/ (sauf la tache de redaction, qui a sa liste de fichiers). Ne touche jamais a ml/evolution/, ml/bot/, ml/reel/, code/, VERSION PRINCIPALE/, ni au dossier C:\\Users\\sacha\\code\\CASH-CAR-genes-v4.
- Ne modifie pas etat/ ni sorties/resume.txt ni sorties/resultats.json (ce sont les pieces d'origine).
- Pas de git commit, pas de git push : c'est moi qui enregistre.
- Francais, commentaires en /* ... */, jamais de // en fin de ligne. Texte publie : pas de nom de machine Windows, pas d'adresse, « le Xeon » pour ce PC, « le Ryzen » pour celui de Sacha, « l'assistant de Sacha sur le Ryzen » pour son bot.
- Les fichiers temporaires vont dans <dossier temporaire>\\scratchpad\\banc-lecture\\
Contexte de lecture : E est l'ecart aux vrais joueurs (plus bas = plus proche des joueurs), F = palier - 4 E est la note de la selection. L'etude ml/ecurie/etude/prochaines-idees/LISEZ-MOI.md dit que E de c0025 (0,90) vient surtout de deux mesures : l'aller du slalom (0,29) et la nitro au decollage (0,24). Le resume du banc montre : aucun verdict sur le palier ni sur F au seuil corrige de Bonferroni, mais dE = -0,175 (se 0,033) pour slalomOn, -0,155 (se 0,027) pour bordOn, -0,218 (0,035) pour gestes5, -0,118 (0,031) pour c0101, -0,076 (0,030) pour lacheOn ; bordOn dF = +1,14 [+0,31 ; +1,97] ; gestes5 perd 0,75 palier [-1,42 ; -0,03].
`
phase('Analyse')
const analyse = await agent(COMMUN + `
TA TACHE (analyste). Ecris ${ETUDE}/composantes.js (outil rejouable, deterministe : memes chiffres a chaque lancement ; hasard par graines.rngDe comme analyser.js) qui produit ${ETUDE}/sorties/composantes.txt et ${ETUDE}/sorties/composantes.json avec :
1. Pour chaque bras, la decomposition de E en ses composantes (les memes mesures et la meme formule que note.noter / ressemblance.js utilisent : lis ml/evolution/note.js, ml/bot/ressemblance.js, ml/bot/mesures.js pour appeler le vrai code, ne reecris pas la formule), et pour chaque bras la difference de chaque composante avec le depart, avec une erreur-type par bootstrap apparie sur les graines. Dis quelles composantes bougent vraiment (|z| au-dessus du seuil corrige pour le nombre de comparaisons que tu fais : annonce ce nombre).
2. Sur combien de courses E est calcule pour chaque bras (resultats.json dit « parties: 79 » pour le depart alors qu'il y a 96 courses) : explique la regle, et verifie si un bras change E seulement parce qu'il change QUELLES courses comptent. Donne dE recalcule sur les seules graines qui comptent dans les deux bras.
3. Le palier par bras decoupe par ce que la ligne de course permet (cause de mort ; premiere map ou biome si la ligne le dit ; courses identiques au depart ou non : sur les seules graines ou la course differe, combien de mieux / moins bien et de combien).
4. Les deux questions de decision : (a) slalomOn et bordOn s'additionnent-ils ? Le banc n'a pas ce bras ; dis ce que les bras gestes5 (5 gestes sans bordOn) et c0101 (bordOn sans slalom) permettent d'en dire et ce qu'ils ne permettent pas. (b) Le prix en palier des gestes : slalomOn -0,50 et gestes5 -0,75 ; d'ou vient la perte (quelles causes de mort, quelles graines) ?
Verifie ton outil : lance-le deux fois et compare les sorties octet pour octet ; verifie que E par bras recalcule par ton outil retombe sur le E de resume.txt a 0,001 pres.
Rends un compte rendu factuel : chaque chiffre avec son fichier et sa ligne, ce qui est sur, ce qui ne l'est pas.`, { label: 'analyste', phase: 'Analyse', model: 'opus' })

phase('Relecture')
const relecture = await agent(COMMUN + `
TA TACHE (relecteur adverse). Un analyste vient d'ecrire ${ETUDE}/composantes.js et ${ETUDE}/sorties/composantes.{txt,json}. Son compte rendu :
<<<
${analyse}
>>>
Attaque-le. Par defaut, une affirmation non reverifiee est fausse.
1. Recalcule par ton propre script (dans le dossier temporaire, sans copier son code) a partir des lignes brutes : le palier moyen par bras, dE et dF de slalomOn, bordOn, gestes5, c0101, lacheOn contre le depart, et au moins trois composantes de E. Compare a resume.txt et a composantes.txt.
2. Cherche l'artefact : E change-t-il parce que le bras change quelles courses comptent, la duree des courses, ou le nombre de vols mesures, et non parce que la conduite ressemble plus aux joueurs ? Un pilote qui meurt plus tot a-t-il mecaniquement un E plus bas ou plus haut ? Mesure-le (par exemple E en fonction de la survie dans le bras depart).
3. Le seuil corrige : combien de comparaisons ont vraiment ete faites (12 bras x combien de criteres) ? Les z de dE de slalomOn et bordOn passent-ils encore ?
4. L'erreur-type de dE par bootstrap apparie est-elle credible (refais un bootstrap independant avec une autre graine de hasard, 2000 tirages) ?
5. Les phrases de decision de l'analyste (addition slalomOn + bordOn, d'ou vient la perte de palier des gestes) : sont-elles soutenues par les lignes ?
Corrige sur place composantes.js et relance-le si tu trouves une erreur (et dis laquelle). Rends : la liste des affirmations CONFIRMEES avec tes chiffres, la liste des affirmations REFUSEES ou AFFAIBLIES, et en dix lignes au plus ce qu'on a le droit d'ecrire comme conclusion du banc.`, { label: 'relecteur', phase: 'Relecture', model: 'opus' })

phase('Redaction')
const redaction = await agent(COMMUN + `
TA TACHE (redacteur). Le banc est lu et relu. Compte rendu de l'analyste :
<<<
${analyse}
>>>
Verdict du relecteur adverse (il fait foi en cas de desaccord) :
<<<
${relecture}
>>>
Ecris, pour un jury qui ne code pas (phrases completes, mots simples, chaque chiffre avec son unite, pas de jargon non explique ; le lexique est ml/ecurie/portfolio/LEXIQUE.md) :
1. Dans ${ETUDE}/LISEZ-MOI.md : une partie « Le resultat (28/11/2026) » ajoutee apres le texte existant (ne recris pas le reste, corrige seulement une phrase devenue fausse) : ce que le banc dit, ce qu'il ne dit pas, le tableau court des bras, les composantes qui bougent, le prix en palier, et « ce que l'on en fait » que je te donne ici : (i) aucun interrupteur n'est allume a la naissance sur la seule foi de ce banc ; (ii) bordOn, slalomOn, suitOn et fuirVite passent en vague de confirmation sur des graines neuves avec le banc plus fin (ml/evolution/banc, en cours d'ecriture), le critere annonce avant de jouer : dF pour bordOn, suitOn et fuirVite, dE avec un garde-fou de palier pour slalomOn, plus le bras bordOn+slalomOn que ce banc n'avait pas ; (iii) c0101 est confirme une troisieme fois comme n'allant pas plus loin que c0025 ; (iv) coupOn, relacheOn, largeOn, libreOn ne changent presque aucune course : ils restent eteints et ne sont pas rejoues.
2. Dans ml/ecurie/portfolio/journal/2026-11-28.md : remplace la ou les phrases qui disent que le banc des genes est encore en cours par un court paragraphe de resultat (meme ton que le reste du chapitre), sans toucher au reste.
3. Dans ml/ecurie/PASSATION.md (tete « L'etat au 28/11/2026 au matin ») et ml/ecurie/ETAPES.md : une ligne ou deux qui disent que le banc est fini et renvoient au LISEZ-MOI de l'etude. Si le portfolio a un registre des impasses (cherche dans ml/ecurie/portfolio/), ajoute une ligne pour ce qui est une impasse averee (par exemple : « allumer les cinq gestes d'un coup : plus proche des joueurs mais 0,75 palier de moins »), seulement si le relecteur le confirme.
N'ecris aucun chiffre que le relecteur a refuse. Relis-toi : chaque chiffre de ton texte doit se retrouver dans resume.txt ou composantes.txt. Rends la liste des fichiers modifies et, en cinq lignes, le resultat tel que tu l'as ecrit.`, { label: 'redacteur', phase: 'Redaction', model: 'opus' })
return { analyse, relecture, redaction }
