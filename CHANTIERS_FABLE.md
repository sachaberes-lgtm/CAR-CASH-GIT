# CASH CAR — Grands chantiers (sessions Fable)

> Audit du 2026-07-16. Chantiers GROS et autonomes, classés par impact joueur.
> Chaque brief est auto-porteur : ouvrir une session, dire « GO chantier N ».
> Règles transverses : tout dans `index.html` (ne pas découper), respecter la conso
> séquentielle de `rnd()`/`rr()`, bus audio `MASTER` uniquement, disposer au rebuild,
> vérifier la console (le try/catch de `loop()` masque tout).

## 1. MUSIQUE PROCÉDURALE SYNTHWAVE — ✅ LIVRÉ (2026-08-25, voir `MUS` dans index.html)
Le jeu n'a AUCUNE musique — que des SFX. Composer un moteur musical WebAudio pur
(zéro asset) : nappe synthwave sombre (accords mineurs arpégés, basse side-chainée
sur un kick fantôme, lead réservé aux moments forts), calé sur la DA Vice City nuit.
INTERACTIF : intensité liée à la vitesse/l'état (menu = nappe seule ; conduite = groove ;
nitro/fever = montée + lead ; vol = filtre ouvert, réverbe longue ; Survivant dernier =
tension). Passer par `MASTER`, ducking `duckT` existant, bouton mute dédié persisté
dans `SAVE`. Danger : CPU (utiliser des LFO/nœuds natifs, pas de scheduling par frame).

## 2. CONTRE-LA-MONTRE + FANTÔME DU RECORD (backlog officiel)
Mode par zone : chrono de référence par seed, enregistrement compact du run
(échantillonner `s`, `lat`, cap, mode toutes les ~80 ms dans un Float32Array,
sauvé compressé dans `SAVE.d`), rejeu = caisse fantôme semi-transparente
(shader additif, pas d'ombre, pas de collision). UI : delta temps vivant (+0.34 / −1.02),
écran de fin comparatif. Attention taille localStorage (~quelques Ko/fantôme, garder le meilleur).

## 3. BIOMES D'AMBIANCE PAR ZONE (le monde qui voyage)
Aujourd'hui : nuit Vice City permanente, seuls les accents néon changent au portail.
Chantier : 4-5 AMBIANCES complètes (Braise actuelle / Aube pâle / Orage violet /
Minuit étoilé / Néon total) = presets ciel (uniforms skyDome), fog, hemi/soleil/fill,
`uSunCol`/`uSkyCol`/`uGroundCol` des nuages volumétriques, expo/sat ACES, envTex.
LERP sur ~4 s au passage de portail (jamais de recompilation shader : uniforms only).
Lier l'ambiance à l'archétype de zone (`AR`) pour que TECH/VOLTIGE aient leur gueule.

## 4. CAISSES V2 — SILHOUETTES PAR ARCHÉTYPE (identité)
Les 24 caisses partagent la même silhouette boxy. Chantier : 5-6 GABARITS procéduraux
(compacte, muscle, super-GT, proto F1, fusée, monstre) choisis par tranche de niveau,
toujours en BoxGeometry/Cylinder low-poly MAIS avec proportions/pièces signature
(ailerons biplans, prises NACA, canopy goutte d'eau, carénages de roues…).
Contrainte : `buildCar` reconstruit à chaud (dispose propre), `hsF`/`hsU`/pots
d'échappement/JETS/traînées doivent suivre les nouvelles positions de tuyères.

## 5. GAMEPAD (API Gamepad, backlog officiel)
Stick gauche = volant analogique (mapper sur `phi`/`steer` avec la même rétroaction
que `psi`), gâchettes = gaz/frein, A = saut, X/RB = nitro, double-tap nitro = braquage.
Deadzone .12, rumble léger si dispo (atterrissage/explosion). Détection à chaud
(`gamepadconnected`), indices UI qui basculent clavier↔manette, zéro nouvelle physique
(piloter le même objet `keys` + un axe analogique optionnel).

## 6. RISQUE/RÉCOMPENSE DANS LES NUAGES SUR ROUTE (backlog officiel)
Les bancs SUR la piste masquent déjà la route. Ajouter l'enjeu : à l'intérieur d'un banc
`onRoad`, tirage rare d'un BONUS (mallette dorée +denom*12, aimant à pièces 6 s)
ou d'un MALUS (plot fantôme, micro-EMP qui vide 25 % de nitro). Télégraphié :
lueur dorée/rougeâtre diffuse dans la ouate avant impact (sprite additif dans le banc).
Économie : passer par `checkUpgrade()` après tout gain.

## 7. DÉFI DU JOUR (seed quotidienne + tableau local)
Seed dérivée de la date (`YYYYMMDD`), bouton « DÉFI DU JOUR » sur l'overlay :
même piste pour tout le monde aujourd'hui, une seule tentative comptée (ou best-of libre
+ badge « première tentative »), historique 7 jours dans `SAVE.d.daily`.
Réutilise `newTrack(seed)` — attention : Survivant démarre APRÈS `newTrack` (ordre resetGame).

## 8. ONBOARDING CONTEXTUEL (la 1re run qui enseigne)
Rien n'enseigne le braquage double-tap, le dauphin, le limbo, le bank-or-bust.
Chantier : messages contextuels UNE FOIS chacun (`SAVE.d.seen`), déclenchés au bon
moment : 1re jauge armée → « DOUBLE-TAP ESPACE ! », 1er vol > 2 s → « penche pour vriller »,
1re chaîne > denom*10 → « atterris pour encaisser », 1er rase-mottes raté de peu → indice.
Style : pops `showMsg`/`trickMsg` existants, JAMAIS de tuto bloquant (c'est un runner).

---
### Hors-chantiers (hygiène, 5 min chacun)
- Committer le WIP en cours (nuages crémeux + fix `VOL.stepBase` dans applyPerfTier) après un test en jeu.
- Sécuriser le remote git : token `ghp_` en clair dans l'URL → credential helper osxkeychain ou SSH.
- Voix annonceur bump/fever : BLOQUÉ sur assets mp3 (à enregistrer) — pattern ANN_LIB prêt.
