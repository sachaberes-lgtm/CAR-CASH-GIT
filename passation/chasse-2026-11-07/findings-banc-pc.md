# Chasse — banc ordinateur (headless 1280×720 / 1920×1080, souris + clavier) — agent Opus, 2026-11-07

Bilan : 1 bloquant, 2 majeurs, 5 mineurs. Banc : chasse/banc-pc/pc.cjs (copie PC), scripts scA…scH, scJ, scMort, achat, regl, en, pause, x.cjs ; journal.md ; 104+ captures dans shots/. Le jeu tourne dans l'iframe `#colonne` de la page-cadre (crochets par `contentWindow.eval`). Son coupé trois fois (`--mute-audio`, sfx/mus/vox:false, relevé `__bancErr`).

## A. Tableau des scénarios
| Scénario | URL / options | Résultat | Erreurs | Capture |
|---|---|---|---|---|
| A · état | `?garde=1&intro=ancien&attente=0` | Prêt en 4,3 s (chaud). Colonne active : iframe 1185×548, zoom 1,404 ; canvas 1185×547, palier FULL. | 0 | A-pc-1.png |
| A · `?tel=1` | | Prêt 5,9 s ; `tel=1` garde la colonne sur l'ordi. | 0 | A-tel1-1.png |
| B · 10 maps × 2 météos | `&carte=X&meteo=Y`, REJOUER + `dbgClassique(X,m2)` | 20 couples chargés (nuages matin/orage, ville orage, jade midi/pluie, forêt soir/orage, glacier midi/neige, crypto matin/soir, espace matin, grotte matin/glace, canyon soir/orage, dunes matin/orage). JOUER à la souris marche partout. Pilote auto ne meurt presque jamais en 50 s (`dbgBoom`). | 0 exception, 0 console.error, 0 warning | B-<map>-<météo>-{course,mort}.png |
| J · JOUER cliqué tôt | profil froid, `--guette=1` | BLOCAGE (PC-N01). Profil chaud : OK. | 0 | B-coince-1.png, J-tot-0.png |
| C · clavier | nuages/midi | Entrée lance ; flèches et Q/A/D braquent ; blur relâche (pas de touche collée) ; Échap/P pause ; 3 portails (`dbgPortail`). | 0 | C-*.png |
| D · écrans FR 1280 | souris | Accueil, garage, inventaire, boutique, ACHAT, missions, réglages, pause OK. Achats : voiture 30 000, aile 300 000, traînée 40 000, figure 25 000 : débit = prix affiché. | 0 | D-fr-1280-*.png |
| D · réglages | | VIBRATIONS, POUCE HAUT, FIGURES, VOL INVERSÉ, MAIN, COMMANDES basculent ; IMAGE reste HAUTE (PC-N07) ; LANGUE FR→EN. | 0 | |
| D · EN 1280 | | Aucun mot français, aucun undefined/NaN/[object. | 0 | D-en-1280-*.png |
| D · pause | EN | SETTINGS→réglages→retour ; RESUME ; RESTART confirme (« winnings will NOT be paid ») ; QUIT confirme → écran de mort. | 0 | D-pause-*.png |
| D · mort | | Seconde chance (CONTINUER ▶ PUB / NON MERCI), FINAL SPIN, « ta prochaine récompense » (mvW), série, REJOUER, GARAGE → JOUER. | 0 | M-*.png |
| D · 1920×1080 | rechargé | Colonne reste 844×390 ; canvas 1777×821, ratio 2,106 : net. | 0 | |
| E · sauvegarde | `--sauve` | Banque/courses/missions écrites ; rechargement sans re-semis : identique. Deux onglets : A en lecture seule, gains de A perdus (verrou `ccOngletActif`). | 0 | E-onglet*.png |
| F · tas | 3 courses | Tas 197 → 416 → 532 → 527 → 550 → 590 Mo ; géométries 325 → 762 ; textures 101 → 113 ; programmes 212 → 214. | 0 | |
| G · redimensionnement | 1280 → 800×600 → 1920×1080 → 1366 → 1280 | Cadre et HUD suivent ; ratio du renderer figé (PC-N02). | 0 | G-*.png |
| H · variantes d'URL | label=neon, intro=ancien, map=jade, balade=1, colonne=portrait, pc=1, colonne=0, encoche=0, fps=0 | 0 erreur JS. colonne=portrait/0, encoche=0, fps=0 OK. label=neon pas prêt en 60 s ; map=jade écran noir après 40 s ; balade=1 course jamais partie ; pc=1 rond de chargement 32 s (GPU headless probable). | 0 | H-url-*.png |
| H · 5 caisses | `dbgEquipe(3,10,22)` | Index de caisses retirées, refus propre (« RETIRÉE (pas de fiche) ») ; délai 900 s atteint. | 0 | |

## B. Défauts constatés

### PC-N01 · BLOQUANT · JOUER pendant la chauffe : partie bloquée, plus aucun bouton
- Scénario J, profil Chrome neuf (première visite) : `node scJ.cjs --n=1 --delai=0 --guette=1 --profil=froid`, URL `?garde=1&intro=ancien&attente=0`, cliquer le splash puis JOUER dès qu'il est cliquable (~5 s, `dbgLier().demarrage` encore « en cours »).
- Ce que voit le joueur : la caisse flotte dans le ciel du titre, aucun bouton (0 `.pbtn`), la course ne démarre jamais (43 s), second JOUER impossible, `dbgJouer()` → `appel:"occupé"` (`GAR.go` vrai pour toujours). Reproduit 2/2. Profil chaud (chauffe ~450 ms) : OK.
- Preuve : J-tot-0.png, B-coince-1.png ; `titreCiel` 10 s après le clic (`demarrage "20008 ms"`), `started` reste faux.
- Piste : le clic arrive avant `titreCiel`. `garageLaunch()` (garage-lacher.js:23) pose `GAR.go` parce que `CHUTE.on` est encore faux ; puis `chuteEntre()` démarre et `garageRender` (garage-rendu.js:22) prend la branche `chuteVoulue()` et `return` avant `else if(GAR.go)` (l.221) ; `chuteVoulue()` (richesse-3.js:277) ne teste pas `GAR.go` ; `classiqueJouer` (zones-caisses.js:323) refuse tant que `GAR.go` est vrai.
- Confiance : haute sur le mécanisme, moyenne sur la fréquence réelle (headless allonge la fenêtre à 20 s ; sur un vrai PC la fenêtre existe à chaque première visite, le temps de compiler les shaders).

### PC-N02 · MAJEUR · Redimensionner la fenêtre ne recalcule pas la résolution 3D
- G : 1280 → 1920×1080 : `devicePixelRatio` 2,106 mais ratio renderer 1,404, canvas 1185×547 étiré dans 1778×821. Sens inverse : ratio 2,106 gardé (pixels gaspillés).
- Piste : dans la colonne, l'iframe garde `innerWidth/innerHeight` = 844×390 ; seul le `zoom` posé par `cadre()` (tete.html) change, l'iframe ne reçoit aucun `resize` ; `curDPR`/`applyDPR` (init.js:387, nettete-qualite.js:124, :192) jamais recalculés. Manque un `matchMedia('(resolution: …dppx)')` ou un message de la page-cadre. (Rejoint RND-N02.)
- Preuve : FG-sortie.txt, G-1920x1080.png. Confiance : haute, pas propre au headless.

### PC-N03 · MAJEUR · Le tas JS et les géométries grossissent à chaque course
- F : tas 197 → 590 Mo en 3 courses (gc() forcé) ; géométries 325 → 762. B : chaque page 135 → 300-700 Mo après 2 courses (jade 135 → 699).
- Piste : géométries non libérées au changement de map ou au REJOUER (~+150 par course). Confiance moyenne (une part peut être du cache voulu). (Rejoint DIR-02, MAP-N02.)

### PC-N04 · MINEUR · La moyenne d'aura affiche 0 malgré des parties jouées
- Écran de mort : « MOY. » 0 alors que PARTIE/RECORD valent 33, 1 326, 3 817 (4 captures, `ex.runs=5`). Piste : `auraH` vide (sauvegarde semée sans historique) → moyenne exclut la partie en cours. À vérifier avec une vraie sauvegarde. Confiance moyenne.

### PC-N05 · MINEUR · Deuxième onglet : les gains du premier sont perdus en silence
- E : A en lecture seule joue : écran de mort « +€ 10, COMPTE € 50 020 », rien n'est écrit, B écrase ; le toast « autre onglet » n'est plus visible. Preuve E-sortie.txt (`lsApresA.bank` 50009,9 vs 50019,8 affiché). Confiance haute.

### PC-N06 · MINEUR · La banque est sauvée en flottant non arrondi (`bank` 50013.200000000004, `best` 11.510000000000002). Confiance haute, impact faible.

### PC-N07 · MINEUR · IMAGE ne bascule pas dans les réglages sur l'ordi (reste HAUTE sans message ; sans doute voulu).

### PC-N08 · MINEUR · Deux monnaies avec le même symbole € (peintures « 1 € » réel vs « € 25 000 » jeu). Conception.

Observations : centre de la plaque BOUTIQUE recouvert par JOUER (libellé cliquable) ; capture 1920 boutique : caisse 3D par-dessus les onglets (animation d'entrée, non confirmé).

## C. Mesures
- Chargement (chaud) : 2,3-6,5 s ; espace 18 s. Froid : 3,8 s mais chauffe « en cours » jusqu'à 20 s.
- Canvas : 1280×720 → 1185×547 (1,404) ; 1920×1080 chargé là → 1777×821 (2,106) ; 1366×768 redimensionné → 1185×547 (1,404 au lieu de 1,498) ; colonne=portrait 390×844 ; pc=1/colonne=0 1280×720.
- Fps (headless, GPU partagé) : 50-60 jade/forêt/glacier neige/ville ; 38-45 nuages/canyon ; 24-27 crypto/grotte ; 18 nuages orage/espace ; 12 dunes matin ; menu 47-58.
- Warnings three.js : aucun. Exceptions JS et console.error : 0 partout.

## D. Non fait
label=neon, map=jade (écran noir 40 s : à essayer sur un vrai Chrome), balade=1, pc=1 (GPU headless probable) ; clic « RÉCUPÈRE » (#mvW, aujourdhui.js:112 referme sur n'importe quel clic : versement non vérifié) ; 5 caisses par rareté ; touche collée à une vraie perte de focus ; nitro clavier au sol ; écrans EN en 1920 (re-semis FR) ; fps biaisés.
