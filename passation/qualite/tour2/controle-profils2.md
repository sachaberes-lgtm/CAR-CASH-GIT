CONTRÔLE ADVERSE — lot profils2 (qa/profils2, 5 commits sur qualite-appareil 72266acc7)

Ce que j'ai fait : j'ai lu le diff complet de code/ (7 fichiers) et suivi les appelants : CAD.pq, QL.roseT, prfFpsT, prfDprDe et dprPlafond, mobPalVoulu, pjgPose et prfApprend, le gestionnaire unhandledrejection. J'ai assemblé deux copies (HEAD et base) dans le scratchpad avec `--depuis-morceaux` (« 330 morceaux d'accord ») et vérifié la syntaxe des scripts en ligne. Le grand script passe. Le script 5 est en échec aussi bien dans la base qu'ici, donc ce n'est pas ce lot. J'ai recalculé le DPR famille par niveau sous node. Les 15 nouveaux noms sont déclarés une seule fois, et rien ne tombe en zone morte temporelle (tout est dans la grande fonction, prfFam et prfClasseFam sont hissées, PJM et GDX_N3 sont déclarées avant tout appel au chargement). Aucun fichier interdit n'est touché, aucun `//` en milieu de ligne, aucun GLSL modifié, aucune allocation par image : la ligne de cadFin est sans objet, et le reste tourne une fois par seconde ou à la fin de la course.

Points vérifiés et justes :
- Table du rapport recalculée : 13 Pro 1,25 et 1,5 ; Pro Max 1,15 et 1,35 ; 15 1,65 et 1,75 ; 16 Pro 1,95 et 2,4 ; 17 Pro 2,15 et 2,7 ; 16e 1,65. Tout est exact.
- Ordinateur et hors profil : aucun chemin modifié ne tourne sans PRF.on. Le PRF de l'ordinateur ressort tôt, avec seulement des champs neutres de plus (fam '', f60n 0, e60n 0, temoin null). Personne hors profil ne lit T.n[4].fps, T.c[3].def ni fpsFast.
- Chaque interrupteur rend bien l'avant, à la lecture : `?sans=merite60` (T.n[4].fps 60, c3 HAUTE par défaut, fpsFast 60, fair60 1), `?sans=douxn3` (min(P.dk, 1) = P.dk), `?sans=familles` (chemin prfDprDe identique), `?sans=temoin2`, `?sans=prfmiroir`.
- n9 et n10 : aucun autre lecteur de CAD.pq que le juge. roseT sort bien de la fenêtre de 6 s.

DÉFAUTS CONFIRMÉS

1. SÉRIEUX — les mesures 3 et 4 de « A MESURER » ne donneront rien dans les conditions écrites (passation/qualite/profils2.md:151-163 : « branché + économie d'énergie »).
   - Mesure 3 : dans prfJuge, une seconde à serious ou plus, ou en économie d'énergie, sort avant `PJG.wA.push`. Puis profil-juge.js:121 (`if(lente||S.chaud||S.eco||…)return false;`) sort avant la note « pas candidat : X ms ». En économie d'énergie ou chaud, la boîte noire n'écrit donc ni « candidat » ni « pas candidat », et `dernier.w50` vaut 0 : le chiffre attendu n'apparaît jamais.
   - Mesure 4 : sous prf60, mobChaud() inclut mobEco(). En économie d'énergie, A et B restent donc tous deux calés à 30, et fair60 0 contre 1 ne se voit pas.
   - Correction : faire ces mesures débranché, hors économie d'énergie, à nominal ou fair. Et écrire le travail médian dans la boîte noire même quand la course n'est pas candidate.

2. SÉRIEUX (mineur en gravité de code) — le mur du retrait du 60 ne grandit jamais. Un essai réussi pose `m60:null` (profil-juge.js:128), puis le retrait recalcule `pjgMur((a.m60.n|0)+1)`, ce qui redonne toujours n=1, soit 1 jour.
   - Scénario : un téléphone qui tient les 10 s d'essai mais pas des courses entières tourne en boucle chaque jour : candidat, essai réussi, deux courses saccadées à 60, retrait, mur d'un jour, et on recommence.
   - Correction : garder le compte (`m60:a.m60?{n:a.m60.n,j:0,fin:0}:null`) ou ne pas effacer m60 sur un essai réussi.

3. MINEUR — après deux pages tuées en 7 jours, le 60 est perdu. Le témoin en vol (profil-juge.js:69) ne garde que plaf, pf, mur, l et vol, sans f60, e60, m60, l6 ni br. Or soleil-planete.js:514 (cas « garde ») part de ce témoin, et pjgDepart le réécrit.
   - Conséquence : le 60 mérité, le mur m60, le compteur l6 et les séances brûlantes (br, déjà perdu avant ce lot) disparaissent. Perdre le mur m60 permet un nouvel essai tout de suite.
   - Correction : dans ce cas, fusionner r9 (`Object.assign({},r9,{plaf:a.plaf,pf:a.pf,mur:a.mur,l:0,lT:0,vol:a.vol,tv:[]})`).

4. MINEUR — `?famille=` n'est pas un paramètre d'essai. Il manque dans PJG.force (profil-juge.js:33) : un vrai téléphone ouvert avec `?famille=X` seul est jugé et écrit un plafond appris sous un autre budget de pixels. Le rapport (profils2.md:152) affirme l'inverse ; c'est faux pour `famille=` sans `classe=`. Correction : ajouter `famille` à la regex.

5. MINEUR — un essai e60 est ignoré au lancement dès qu'un f60 existe (soleil-planete.js:522, `if(a.f60…)else if(a.e60…)`).
   - Scénario : 60 débloqué au N3, candidat au N4 ; après une relance, l'essai du N4 en attente est oublié. Dans la même séance, ça marche.
   - Correction : lire f60 et e60 indépendamment.

6. MINEUR — Preferences.set et remove sont appelés sans `.catch` (profil-juge.js:48). pjgMiroir est appelé au chargement (pjgDepart, chemin du témoin). Une promesse rejetée avant `__gameReady` déclenche `__crash` (page/debut-corps.html:250-253). C'est rare, et sauvegarde.js fait de même, mais un `.catch(function(){})` suffit.

7. MINEUR — n7, n9 et n10 n'ont pas d'interrupteur `?sans=`, alors que PLAN.md exige « chaque nouveauté a son interrupteur ». n10 change le verdict des profils à 60 : les secondes calées « chaud » devenues réactives (sortie de 5 s, mur réactif, vrai > 13 ms) sont maintenant jugées lentes. Cela peut pousser vers un retrait ou une baisse.

8. MINEUR (banc) — `dbgPrf('oubli')` (nettete-qualite.js:292) ne vide que localStorage. Le miroir rend l'enregistrement deux lancements plus tard (dbgJuge('oubli') vide bien les deux).

DOUTES / NON PROUVÉ / ACTIF PAR DÉFAUT SANS MESURE
- Famille A (12, 13, 13 mini, SE 3) : en BASSE N1 par défaut, le DPR passe de 1,25 à 1,15 sur 390×844 (environ −15 % de pixels) et à 1,2 sur le mini. En HAUTE N2 : 1,3 au lieu de 1,5. C'est une estimation, sur les téléphones les plus courants, et elle n'est PAS dans la liste « Baisses voulues » du compte rendu (seul le 12 apparaît dans la table).
- 14 Pro, 15, 15 Plus (famille C) : BASSE par défaut à +21 % de pixels (1,5 → 1,65), sans aucune mesure sur A16 : risque de chaleur.
- Le 16e passe en classe 2, et la classe 3 démarre en BASSE : décisions du pilote, non mesurées.
- Le seuil w60 de 11 ms est arbitraire ; c'est bien signalé.
- N3 et N4 sous le gouverneur doux : chaque entrée en serious réalloue maintenant la toile (DPR 2 → 1,5), puis encore 60 s après le retour à fair. Sur un téléphone qui oscille entre fair et serious (le cas de Sacha), c'est une nouvelle source d'à-coups, au plus une par minute. À mesurer. L'en-tête de gouverneur-paliers (« serious : la résolution du niveau GARDÉE ») n'est plus vrai pour N3 et N4.
- `?classe=N` prend désormais la famille correspondante : `classe=2` donne 1,65 en N2, `classe=4` donne 2,2 en N3 et 2,8 en N4 sur un 13 Pro. Les bancs et A/B d'avant qui utilisent `?classe=` ne sont plus comparables.
- La mesure 3 avec `appareil=iPhone17,1` sur le 13 Pro écrase l'enregistrement du 14,2 (plafond, br, tv), y compris dans le miroir. « Relancer sans le paramètre suffit » cache que ce qui a été appris est perdu.
- `?sans=merite60` ne rend pas l'ancien 16e (classe 3, 60 i/s) : il faut aussi `?sans=familles`.
- En N1, `?prfpx=` ne peut que baisser (borné par le plafond d'aujourd'hui) ; le rapport le décrit comme imposé « à tous les niveaux ».
- n9 : si plafT date de moins de 6 s, roseT = plafT, et le mur peut encore se poser (moins souvent qu'avant). C'est acceptable.
- Je n'ai rien exécuté dans un navigateur. Tout ce qui précède vient de la lecture du code et de l'assemblage.

VERDICT : fusionnable APRÈS CORRECTIONS. Le code ne casse ni l'ordinateur ni les téléphones hors profil, et la syntaxe et l'assemblage sont bons. À corriger avant fusion : le protocole de mesure 3-4 (défaut 1), l'escalade de m60 (défaut 2) et `famille` dans PJG.force (défaut 4). Les défauts 3, 5, 6, 7 et 8 sont mineurs. La baisse par défaut de la famille A doit être ajoutée au rapport comme baisse non mesurée.

Fichiers :
- /Users/sachaberes/cash-car/qualite-profils2/code/moteur/profil-juge.js
- /Users/sachaberes/cash-car/qualite-profils2/code/rendu/soleil-planete.js
- /Users/sachaberes/cash-car/qualite-profils2/code/moteur/gouverneur-paliers.js
- /Users/sachaberes/cash-car/qualite-profils2/passation/qualite/profils2.md
- Copies assemblées : /private/tmp/claude-501/-Users-sachaberes--claude-spares-spare-xwGqIS/6bec618e-1f9f-40ce-bc76-87d6f3302671/scratchpad/head et /private/tmp/claude-501/-Users-sachaberes--claude-spares-spare-xwGqIS/6bec618e-1f9f-40ce-bc76-87d6f3302671/scratchpad/base