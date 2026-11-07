# Chasse — son / démarrage / mobile / PWA / iOS (agent Opus, 2026-11-07)

Bilan : 1 BLOQUANT, 0 MAJEUR nouveau, 4 MINEURS. Parmi les ID du 11-05 encore ouverts, IOS-06 est le plus grave.

Fichiers lus : code/son/musique.js, musique-frenesie.js (l.1-73), graphe-audio.js (l.140-440), console-son.js (pause, sfx, slide), fanfare-turbo.js (l.395-460), curseurs.js (l.68-97) ; moteur-vivant.js en grep · VERSION PRINCIPALE/sfx.js (entier), sons-banque.js (structure), sw.js (entier), manifest.webmanifest · code/page/tete.html, debut-corps.html, bibliotheques.html · code/moteur/init.js (entier), intro-161.js (en-tête, son, raccord, boucle, lancement), desktop-banc.js (l.60-299), boucle-1.js (tête), mobile-tactile.js (l.495-565 + grep des gestes) · code/interface/vignette-moteur.js (l.270-389) · code/sauvegarde.js (réglages, miroir, musRetour) · vercel-build.sh · app-ios de main (preparer-www.js, natif.js, capacitor.config.json, AppDelegate.swift, JeuViewController.swift) · origin/ios-capacitor : natif.js, preparer-www.js, capacitor.config.json, www/maj.json · passation/APP-STORE.md (tête), AUDIT-FINAL-2026-11-05.md (SON/IOS).

⚠ Il y a DEUX `app-ios/` : celui de main (corrigé par le jury le 5/11) et celui d'origin/ios-capacitor (base 817f34a7 du 3/11, plus 3 commits de Sacha du 6/11 ; 463 commits de retard sur main).

## A. Audit du 11-05 : état des ID de ma section
| ID | état | preuve (fichier:ligne) |
|---|---|---|
| SON-01 | CORRIGÉ sur main / OUVERT sur ios-capacitor | main app-ios/preparer-www.js:188-194 (retraits-publies, publie-audio) |
| SON-02 | CORRIGÉ pour la banque | sfx.js:70-81 (seuls `pre:1` et `ui.*` décodés au chargement), éviction sfx.js:111-115 |
| SON-03 | OUVERT | musique-frenesie.js:55-62 : toujours l'`<audio>` ; `FRENM.sw=true` posé avant le résultat de `play()`, refus avalé (musique.js:321-322) |
| SON-04 | CORRIGÉ dans l'app de main / OUVERT sur ios-capacitor / OUVERT sur Safari iOS 15-16 (web) | main AppDelegate.swift:16 `.playback` |
| SON-05 | OUVERT (volontaire, Sacha 14/10) | sauvegarde.js:312-322 |
| SON-06 | OUVERT | curseurs.js:75 + musique.js:210-214 (voir SON-N04) |
| SON-07 | CORRIGÉ sur main / OUVERT sur ios-capacitor | main preparer-www.js:194 (scinde-banque) |
| SON-08 | NON VÉRIFIABLE | demande l'écoute |
| SON-09 | CORRIGÉ | fanfare-turbo.js:429-434 |
| SON-10 | OUVERT | musique.js:123 `VOL.mus=.7` écrasé par sauvegarde.js:300, défaut `.62` |
| SON-11 | OUVERT (effet réel non vérifié) | musique.js:324-327 WAV 8 kHz / 8 bits ; refus rattrapé à :345 |
| SON-12/13 | NON VÉRIFIABLE | |
| SON-14 | OUVERT | sfx.js:189-190 : `playbackRate` sans borne basse |
| SON-15 | OUVERT (atténué) | intro-161.js:693/906 (fermé après la casse), graphe-audio.js:167, sfx.js:64 |
| SON-16 | CORRIGÉ | mobile-tactile.js:524-525 (`audioKick` sur touchstart et touchend) |
| SON-17 | OUVERT | musique.js:245 : `cc_muswa_ko='1'` définitif |
| SON-18 | CORRIGÉ | fanfare-turbo.js:444 |
| SON-19 | NON VÉRIFIABLE | |
| SON-20 | CORRIGÉ en ligne | vercel-build.sh:66 |
| SON-21 | CORRIGÉ en grande partie | graphe-audio.js:156-165, init.js:403 |
| SON-22..25, 27, 30, 31, 33-40 | NON VÉRIFIABLE | |
| SON-26 | OUVERT (sans danger) | ios-capacitor natif.js:66-72 et graphe-audio.js:156 |
| SON-32 | OUVERT | sw.js:65 : seul un 200 est rangé ; l'audio arrive en 206, jamais hors ligne |
| IOS-01/ECO-01 | CORRIGÉ sur main / OUVERT sur ios-capacitor | main preparer-www.js:85,126 (≥13) ; ios-capacitor :70,108 (=13) ; index.html de main : 14 « LE CHARGEUR » |
| IOS-02 | OUVERT | ios-capacitor www/maj.json `"jeu":"817f34a7"` (3/11) |
| IOS-03 | OUVERT | pages-app/confidentialite.html : « aucune requête réseau » |
| IOS-04 | CORRIGÉ dans la coupe de main | preparer-www.js:158-166 |
| IOS-06 | OUVERT (main et ios-capacitor) | natif.js (main l.134-136, ios-cap l.168-172) : notify à `__gameReady` ; bannissement définitif par `bilanEssai` (ios-cap l.146-151) |
| IOS-07 | CORRIGÉ sur main / OUVERT sur ios-capacitor | main preparer-www.js:35,67 |
| IOS-08 | OUVERT | pas de `.gitattributes` |
| IOS-10 | CORRIGÉ sur main (16.4) / OUVERT sur ios-capacitor (15.0) | pbxproj |
| IOS-11 | CORRIGÉ sur main / OUVERT sur ios-capacitor | |
| IOS-20 | CORRIGÉ sur main / OUVERT sur ios-capacitor | main capacitor.config.json:17 `launchAutoHide:false` + filet 30 s |
| IOS-21 | CORRIGÉ sur main | JeuViewController.swift:33 |
| IOS-28 | NON VÉRIFIABLE | `U.next()` applique au passage en arrière-plan, même en course |

## B. Nouveaux défauts

### SON-N01 · BLOQUANT · Deux app-ios divergents : l'app livrable n'existe nulle part
- Où : origin/ios-capacitor:app-ios/ contre main:app-ios/ (natif.js, preparer-www.js, capacitor.config.json, AppDelegate.swift, pbxproj)
- Quoi : ios-capacitor (commits de Sacha du 6/11) : `www/` du 3/11 ; pas d'AVAudioSession `.playback` ; écran de lancement retiré au bout de 4 s ; pas de scinde-banque ni publie-audio (~83 Mo d'audio) ; cible iOS 15.0 avec 166 `color-mix()`. main : a tout cela mais pas la partie 8 de natif.js du 6/11 (`musVide`, `musRend`, `ctxDort` : fiche « lecture en cours » sur l'écran verrouillé, contextes WebAudio qui tournent après fermeture). `npm run sync` sur ios-capacitor avec le jeu de main s'arrête : « LE CHARGEUR trouvé 14 fois (13 attendu) ».
- Preuve : ios-cap preparer-www.js:70,108 ; main index.html : 14 « LE CHARGEUR » ; ios-cap capacitor.config.json `"launchAutoHide": true` ; ios-cap pbxproj 15.0.
- Correction proposée : fusionner origin/main dans ios-capacitor ; dans natif.js garder la partie 8 d'ios-capacitor ET la partie 5 de main (filet 30 s) ; prendre preparer-www.js de main ; puis `node app-ios/preparer-www.js --essai "VERSION PRINCIPALE"` et `npm run sync`.
- Confiance : haute sur les faits ; le caractère bloquant dépend de la branche d'où partira l'archive (question pour Sacha).

### SON-N02 · MINEUR · La boule « prête » n'a aucun délai de secours
- Où : code/moteur/intro-161.js:850 (`boucle`) et :757 (`tapBoule`)
- Quoi : `pretT` exige `readyState==='complete'`, `fonts.status!=='loading'` (toutes les polices) et `__ccCharge()`. Une ressource qui traîne laisse la boule tourner sans fin ; le toucher est ignoré ; le mouchard ne se déclenche pas (`__gameReady` déjà vrai). CHARGEMENT a un plafond de 15 s, la boule non.
- Preuve : `if(BOULE){if(pretT===null&&t>=4.6&&document.readyState==='complete'&&(!document.fonts||document.fonts.status!=='loading')&&(!window.__ccCharge||window.__ccCharge())){pretT=t;…` ; `function tapBoule(){ if(!lance||fini||tapT!==null||pretT===null)return;`
- Correction proposée : ajouter `||t>=20` et remplacer `fonts.status` par `policeFilm()`.
- Confiance : moyenne.

### SON-N03 · MINEUR · Rouleaux du Final Spin presque toujours muets
- Où : code/economie/final-spin.js:329 et :354, sfx.js:181 et :111-115
- Quoi : `spin.roule` est `pre:0`, décodé à la demande ; une boucle non décodée rend `null` sans départ tardif, `spinMoteur` ne la redemande jamais ; éviction après 60 s → muet à presque chaque tirage.
- Correction proposée : réessayer dans `spinMoteur` toutes les 300 ms tant que `SPIN.mot` est nul (comme boucle-1.js:139), ou `spin.roule` en `pre:1`.
- Confiance : moyenne.

### SON-N04 · MINEUR · SON et MUSIQUE coupés : le graphe audio tourne quand même
- Où : code/son/curseurs.js:75, musique.js:204 et :210-214
- Quoi : `musGraphe()` = `musWaTient()||!!window.POUCE_JEU`, toujours vrai ; le contexte n'est jamais suspendu même tout coupé (~5 % d'un cœur).
- Preuve : `if(AC){if(musGraphe())musWaSon();else if(SND.sfx&&!paused)acReveil(AC);else AC.suspend();}`
- Correction proposée : `if(!SND.sfx&&!SND.music)AC.suspend()` en tête de `sndRefresh` et de `musWaSon`, même condition dans `acVeut`.
- Confiance : haute sur le comportement, faible sur l'impact.

### SON-N05 · MINEUR · `.playback` global coupe le Spotify du joueur
- Où : main app-ios/ios/App/App/AppDelegate.swift:16
- Correction proposée : `options: [.mixWithOthers]`.
- Confiance : basse.

## C. Service worker
Script : chasse/son-mobile/sw-check.cjs. CORE : `./`, `./index.html`, `./manifest.webmanifest`, `./icon.svg` + icônes du manifeste : tous PRÉSENTS. `install` avale l'échec (sw.js:16). Navigation réseau d'abord ; statique cache d'abord (200 seulement) ; `skipWaiting` + `clients.claim` + purge. Mise à jour : `register('sw.js',{updateViaCache:'none'})`, version.json comparé à `CC_BUILD` (ouverture, retour d'arrière-plan, 5 min), rechargement hors course 2 fois au plus (desktop-banc.js:79-106). musique-paliers.js et musique-moteur.json non versionnés par `?v=`.

Chaîne du démarrage : 1) fin du grand script → `__gameReady` → rAF(loop) ; 2) `essaiAuto` → `autoLance` → `lancer` ; 3) `loop` vide CHARGEMENT (plafond 15 s) ; 4) boule prête : t ≥ 4,6 s ET readyState complete ET polices ET CHARGEMENT fini — PAS de plafond (SON-N02) ; 5) toucher → `tapBoule` → `ouvrir` ; 6) `ouvreQuandPret` plafond 26 s → `reveler` → `finir` ; 7) `lierDemarrage` 20 s au plus ; 8) `departAttend` 20 s au plus. Filets : `secours()` si une image de l'intro plante 3 fois.

## D. Non vérifié
Écoute réelle (SON-08/12/13, WAV 8 kHz, `.playback` sous WKWebView, interruption) ; mobile-tactile.js lu autour des gestes seulement ; non lus en entier : musique.js l.1-100, fin de musique-frenesie.js, voix-moteur.js, chute-menu.js, titre-soleil.js, musique-paliers.js, pouce-bleu-jeu.js ; miroir Preferences (ECO-10) en surface ; branche de l'archive App Store (SON-N01) : question pour Sacha.
