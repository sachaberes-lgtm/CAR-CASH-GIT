# Audit des sons de l'interface — CASH CAR (finition, HEAD 7ff9f24f + 1 modif non commitée d'une autre session sur garage-cadrage.js, sans rapport)

Méthode : lecture statique de `code/**`, `VERSION PRINCIPALE/sfx.js`, `sons-banque.js`, `sw.js`, `outils/scinde-banque.cjs`, `app-ios/preparer-www.js` ; la banque a été chargée dans Node (vm) pour lister ses fiches/clés ; serveur local port 9761 (HEAD http), arrêté à la fin. **Aucun navigateur, rien d'écouté** : tout ce qui touche au timing réel (qui sonne avant qui, niveau relatif) est déduit du code et marqué « non vérifié » quand c'est le cas.

## 0. Comment les sons d'interface sont branchés (la carte)

* **Un seul point d'entrée** : `sfx(id,o)` (`code/son/console-son.js:72`) → `CCSON.play` (`VERSION PRINCIPALE/sfx.js`). Garde : `SONV2 && sfxOk() (AC && SND.sfx && AC.state==='running') && !document.hidden` (`console-son.js:74`). Les `ui.*` demandés pendant la PAUSE passent par `pauseSon` (`console-son.js:64`, réveille le contexte 450 ms, ferme les bus rec/fx/amb), seulement si `SND.sfx`.
* **Le clic d'un bouton** = `uiClic(rôle)` (`code/son/curseurs.js:134`) : rôles → `UI_CLIC` (`curseurs.js:125`) : `nav ui.nav · retour ui.retour · on ui.on · off ui.off · onglet ui.onglet · refus ui.refus · danger ui.danger · jouer ui.jouer` ; tout autre rôle (`''`, `undefined`, `'ok'`) = `ui.tap` (or). Hauteur qui monte aux appuis rapprochés pour tap/nav/onglet/retour (`sonUiSt`, `curseurs.js:130`). Appelé à la main à ~108 endroits.
* **Délégation globale n°1 — micro-tick au CONTACT** `ui.appui` (−12 dB, bus ui), sur `pointerdown` en capture, `code/economie/aura-banque-contrats.js:219-232` (sélecteurs `APPUI_SEL` = `.pbtn,.mLigne,.tp,.gT,.gTab,.gR,.mMode,.misPrix.voir,.mObj[data-m],.shUne,.shCase` ; ignore `.off`/`.arme`) ET `:242-278` (`APPUI_TOUT` + tout élément à curseur main, **hors** `APPUI_SEL` : `cible()` ligne 249 le renvoie null → pas de double). Exclus : canvas, `#tNitroZone,#tSteer,#touchCtl,#tNitro,#tLeft,#tRight`, `#hud`, les curseurs `range`.
* **Délégation globale n°2 — le FILET DES BOUTONS MUETS** (`curseurs.js:148-174`), `click` en capture sur window : pour tout vrai clic (`isTrusted`, hors `uiGarde`), si aucun son (sauf `ui.appui` et boucles) n'est parti depuis le contact (`UI_SON.t`, posé par `uiClic` et par tout `sfx`), il joue `uiClic(rôle deviné)` après `setTimeout(0)`. Sélecteur : `UI_BTN_SEL` (button, a[href], rôles ARIA, `[data-m|a|c|go]`, checkbox/radio/select/summary/label + `APPUI_SEL`) ou curseur main, 8 parents max. Exclus : canvas, `[data-muet]` (aucun élément ne l'utilise), `.arme`, `#tNitro…`, champs texte, `range`.
* **Curseurs** : `ui.curseur` (hauteur = valeur) à chaque dizaine de % — `volS` : `curseurs.js:54` ; autres `range` : `curseurs.js:178-181` (exclut `.volS` : pas de double) ; relâcher EFFETS = `piece` (`curseurs.js:55`), relâcher MUSIQUE = extrait musique (`musApercu`).
* **Volume / mute** : tout `S.dest = MASTER` (`console-son.js:81` `CCSON.init(AC,MASTER)`), `MASTER → BUSOUT → compresseur → limiteur → MASTER._vol (= sfxVol() = curseur EFFETS) → sortie` (`graphe-audio.js:140-151`). Mute : `sndBtnEl` (`curseurs.js:79`) → `sndRefresh` (suspend le contexte, ou ferme `MASTER._limIn` si la musique passe par WebAudio, `musique.js:206`).
* **Fichiers** : TOUS les sons d'interface sont dans la banque (`sons-banque.js`, MP3/WAV en base64, 229 fiches / 384 clés) — aucun `.mp3/.ogg/.wav` d'interface sur disque. Hors banque, côté « interface » : `assets/audio/death/{minecraft,explosion,gong}.m4a` (son de mort, `fanfare-turbo.js:400`), `assets/audio/music/intro/pad-*.m4a` + `ciel-30/p1.m4a` (intro studio, `intro-161.js:532`), `lobby/chris-matin.m4a`. Synthèse « ancienne » (oscillateurs, pas de fichier) : `chimeNote/noiseBurst/subBoom` (`fanfare-turbo.js:36,240`, `graphe-audio.js:343`) et `vroomGarage` (`console-son.js:205`) — toutes gardées par `sfxOk()`/`SND.sfx`.

## 1. Tableau action | son | fichier:ligne | double déclenchement ? | observation

Légende : « tick » = `ui.appui` au contact (sur les éléments de `APPUI_SEL`/main). « filet » = délégation n°2. « D? » = double déclenchement. Le schéma général est « tick au contact + UN son d'action au relâcher » : voulu (`aura-banque-contrats.js:216`). Pas de `touchstart`+`click` sur les boutons d'interface : tout est `click` (`mobile-tactile.js:1001-1012 mHit`, commentaire 1011 « AU RELÂCHER »).

| Action | Son | fichier:ligne | D? | Observation |
|---|---|---|---|---|
| Toucher l'écran titre / splash | aucun son de banque ; intro studio WebAudio propre (muette si `!SND.sfx` ou `VOL.sfx==0`) | `moteur/intro-161.js:691,899` | non | respecte mute + curseur à l'ouverture seulement |
| JOUER (accueil) | tick + `ui.jouer` (V8, −9 dB, bus fx) + `ui.volet` (+ `garage.lacher` −8 au départ) | `mobile-tactile.js:866-867` (mRole9 `:842`), `curseurs.js:134`, `aura-banque-contrats.js:189` | non (filet muet : uiClic a posé `UI_SON.t`) | empilement voulu (clé, démarreur, gaz) ; Entrée = `.click()` programmatique : jamais doublé |
| JOUER du garage | tick + `ui.jouer` + volet + `garage.lacher` | `garage-cadrage.js:193` | non | même rôle `jouer` qu'à l'accueil : cohérent |
| REJOUER (mort) | idem JOUER | `mobile-tactile.js:842,866` | non | cohérent |
| GARAGE (accueil / mort, mobile) | tick + `ui.nav` + `vroomGarage` + `ui.volet` | `mobile-tactile.js:866,(branche 'garage')`, `console-son.js:205` | non | OK |
| GARAGE (bouton `#garageBtn`, ancien menu PC) | tick + `vroomGarage` + `ui.volet`, **pas de `ui.nav`** (le filet se tait car `ui.volet` a posé `UI_SON.t`) | `garage-cadrage.js:180` | non | incohérent avec le mobile (voir défaut 9) ; atteignabilité PC non vérifiée |
| RÉGLAGES / MODES / BOUTIQUE / MISSIONS (accueil) | tick + `ui.nav` (+ `ui.volet` si l'atelier se ferme) | `mobile-tactile.js:842-866` | non | OK |
| ◀ RETOUR / MENU des écrans coque | tick + `ui.retour` | `mobile-tactile.js:844` | non | OK |
| Bascules SON / MUSIQUE / VIBRATIONS / SURVIVANT / BAC À SABLE / PARC (réglages) | `ui.on` / `ui.off` selon l'état FUTUR (avant bascule) ; SON : après bascule, et **silencieux quand on coupe** (voulu : `uiClic` exige `SND.sfx`) | `mobile-tactile.js:842-853, 900`, `curseurs.js:79` | non (`clic()` = `.click()` non fiable → filet ignore) | OK |
| IMAGE / LANGUE / COMMANDES / POUCE HAUT / FIGURES | `ui.onglet` | `mobile-tactile.js:849-851` | non | OK mais voir défaut 5 (GAUCHER, VOL INVERSÉ, INCL → `ui.nav`) |
| Curseurs MUSIQUE / EFFETS | `ui.curseur` (hauteur = valeur) par dizaine ; relâcher EFFETS = `piece` ; relâcher MUS = extrait | `curseurs.js:54-55,178-181` | non (`.volS` exclu du cran global) | en PAUSE le témoin `piece` est muet (défaut 4) |
| Ouvrir le ⏸ | `ui.nav` puis `ui.feuille` (la sortie attend 0,42 s avant de se fermer) | `mobile-tactile.js:376`, `icones-fenetre.js:108`, `init.js:368-373` | non (`gearTt` + `touchend`/`click` : `mobile-tactile.js:420-424`) | OK |
| REPRENDRE | `ui.retour` + `ui.feuilleFerme` + bips `ui.bip` ×3 + `ui.go` | `mobile-tactile.js:350-363,407` | non | OK |
| RECOMMENCER / QUITTER (pause) | `ui.danger` + `ui.modale` ; puis dans la fenêtre : CONFIRMER `ui.danger`, CONTINUER `ui.retour`, + `ui.feuilleFerme` | `mobile-tactile.js:407`, `icones-fenetre.js:130-131` | non | `ui.danger` joué dès l'OUVERTURE de la confirmation (pas à la confirmation) : voulu ? |
| Fenêtres modales (ouvrir / fermer) | `ui.modale` / `ui.feuilleFerme` ; boutons : confirmer `ui.tap`, annuler `ui.retour`, rouge `ui.danger` | `icones-fenetre.js:108-131` | non | boutons rouges `.arme` 420 ms : muets (voulu, `:130`) |
| Toasts | `ui.ok` (coche) / `ui.erreur` (croix) sauf `muet` | `icones-fenetre.js:169` | non (les appelants qui sonnent déjà passent `muet=true`) | OK |
| Onglets garage / boutique 3D / inventaire / familles | `ui.onglet` | `atelier.js:225,102`, `boutique-scene-1.js:300`, `bouton-rouge.js:121` | non | OK |
| ✕ garage, ✕ inventaire, ◀ missions, ◀ boutique du jour, ◀ plaque, ◀ profil, ◀ boutique-popup | `ui.retour` | `garage-cadrage.js:183`, `bouton-rouge.js:124`, `atelier.js:74-75`, `boutique-du-jour.js:114`, `plaque.js:300,352`, `boutique.js:26-45` | non | cohérent ; `gClose`/`ivFerme` sans garde (défaut 8) |
| COFFRE / OFFRES / vignettes (nav) | `ui.nav` | `atelier.js:58-59`, `atelier-ferme.js:466`, `boutique-du-jour.js:103-104` | non | OK |
| Vignette de caisse/habillage (garage, boutique du jour) | UN son : `ui.equipe` (si ça s'équipe) / `garage.bascule` (change de caisse) / `ui.carte` (essai) ; `ui.nav` seulement si rien n'a sonné (drapeau `GSON9`) | `atelier.js:104-111`, `boutique-du-jour.js:105-109` | **évité** par `GSON9` | boutique 3D : changer de caisse = `garage.bascule` + `ui.feuille` (`boutique-scene-1.js:374` + `boutique-scene-2.js:215`) : deux sons voulus ? non vérifié à l'oreille |
| ÉQUIPER (caisse/peinture/aile/traînée) | `ui.equipe` | `atelier.js:92,97,129,136`, `garage-menu-inventaire.js:264` | non | si déjà équipé : `ui.nav` (accusé) |
| Désélectionner une peinture | `ui.off` | `atelier.js:134`, `boutique-scene-1.js:414` | non | OK |
| ACHETER (garage / boutique 3D / figure / habillage €) | `ui.achat` puis `ui.tampon` (+266 ms, sauf mouvement réduit) ; + `ui.compteur` (dépense qui défile) ; + fête de la caisse (chimes/bruit SYNTHÉTISÉS) pour une caisse | `atelier.js:153,163`, `boutique-scene-1.js:430`, `boutique.js:35,645`, `atelier-ferme.js:595`, `fete-caisse.js:73-86` | non | 3-4 couches simultanées sur un achat de caisse ; aucun `SON_DUCK['ui.achat']` ; à juger à l'oreille |
| Pas assez d'argent / verrouillé | `ui.refus` (+ toast **muet**) | `atelier.js:88,151,156`, `boutique-scene-1.js:409-418`, `burn-out-1.js:189` | non | OK |
| Peintures / plaque : modèles, hasard, OK | `ui.onglet` / `ui.onglet` / `ui.tap` | `plaque.js:241-242,299-301` | non | OK ; Entrée/Espace clavier = handler propre, `preventDefault` posé |
| Profil (trophée) | `ui.nav` à l'ouverture + `ui.feuille` ; ◀ = `ui.retour` + `ui.feuilleFerme` | `plaque.js:355,352`, `icones-fenetre.js:108` | non | OK |
| Missions : ligne, récupérer, VOIR | `ui.nav` / `ui.achat`+`ui.tampon` ou `ui.debloque`+`ui.tampon` / `ui.refus` ; secrète : `ui.debloque` puis 1,4 s plus tard `ui.debloque`/`ui.achat`+`ui.tampon` ; retirer : 1er toucher `ui.tap`, 2e `ui.off` | `ecran-revelation.js:183-220,322-334,411-477` | non | le double `ui.debloque` est voulu (« PUIS elle est à toi », `:206`) |
| Mission accomplie (bannière / jauge) | `ui.mission`, `ui.jauge` | `defis-moteur.js:213`, `ecran-revelation.js:290-292` | non | hors périmètre bouton |
| Écran de mort : compteur d'argent | `mort.enseigne` +80 ms, `ui.compte` ×9/12 (hauteur monte, ralentit avec le compteur visuel), `mort.compteFin`, `ui.record` | `mobile-tactile.js:682-704` | non | **chronométré à part** du compteur visuel (mêmes constantes `M6_CPT`/360 ms) : synchro supposée, non vérifiée à l'écran |
| Écran de mort : palier moteur / aura qui montent | **aucun** (seulement `ui.debloque` si rang d'aura gagné) | `mobile-tactile.js:668-681,797` | — | cran visuel `m6Tape` sans son (défaut 11) |
| CONTINUER (seconde chance) / NON MERCI | `ui.tap` (+ `ui.achat`/`ui.ok` à la reprise) / `ui.retour` | `mobile-tactile.js:952-954`, `seconde-chance.js:130,144` | si `!lance` : `ui.tap` **puis** `ui.refus` (défaut 6) | |
| ×2 du gain | `ui.tap`, puis `ui.refus` si refusé | `mobile-tactile.js:996-997` | **oui** (tap + refus) | défaut 6 |
| Final spin : levier / rouleaux / gains / fermeture | `spin.levier`, `spin.jeton`, `spin.cran`, `spin.arret`, `spin.tease`, `spin.piece`, `spin.gain`/`jackpot`/`presque`, `spin.ferme` ; sans jeton : `ui.tap` + `spin.ferme` | `final-spin.js:279,312-313,319-320,329,343-347,384,388` | non | boucle `spin.roule` (force) coupée par `spinSonsStop` ; muette au mute via `_limIn`/suspend |
| Volet d'écran | `ui.volet` (début), `ui.voletSort` (fin) | `aura-banque-contrats.js:189,197` | non | OK |
| Inventaire : ouvrir/fermer la porte | `fourgon.porte` / `ui.retour`, puis `ui.on` (lampes), `garage.tole` (pinces) | `atelier-ferme.js:15,71,306` | non | `ui.on`/`ui.retour` utilisés comme sons de MÉCANISME (pas de bouton) |
| Taper la caisse / une affiche 3D | `garage.tole` ×4 variantes ; affiche : `ui.tap` **et** `ui.ok` | `garage-lacher.js:92`, `boutique-scene-1.js:481`, `evenements-rares.js:296` | affiche : 2 sons simultanés (voulu, `:293-296`) | canvas : filet exclu |
| Compteur d'argent du garage | `ui.compteur` à la dépense seulement ; **rien à la hausse** | `atelier-ferme.js:595` | non | hausse silencieuse (le gain est sonné par `ui.achat`/`ui.mission` ailleurs) |
| Montée de palier (argent / moteur) | `argent.palier` / `moteur.palier` | `boucle-6-hud.js:56`, `graphe-audio.js:382` | — | gameplay : hors périmètre |

## 2. Respect des réglages (point 4)

* **Curseur EFFETS** : tous les `ui.*` (bus ui/rec/fx/amb) → `MASTER` → `MASTER._vol` = `sfxVol()` (`graphe-audio.js:141`, `curseurs.js:7`, `musique.js:127`). Vérifié par lecture. Les samples WebAudio de mort (`sampleWA`, `console-son.js:187`) passent par `MASTER._vol` aussi ; les HTMLAudio de repli reçoivent `d.v*sfxVol()` (`fanfare-turbo.js:~445`).
* **Mute SON** : aucune voie d'interface ne contourne `SND.sfx` : `sfx()` (via `sfxOk`), `uiClic` (`SND.sfx&&…`), `pauseSon` (`SND.sfx` testé au `play`), `pauseSonDort` (`SND.sfx`), `vroomGarage`, `chimeNote/noiseBurst/subBoom` (`sfxOk`), `deathSound`, intro (au démarrage). Aucun `connect(AC.destination)` hors `MASTER._lim` / musique / intro (grep).
* **Un seul trou léger** : l'intro studio ne relit pas `SND.sfx` après son départ (inévitable : 1 film).
* **Cas voulus** : couper le SON ne fait pas de « clic de coupure » (silence), rallumer le SON joue `ui.on` (le contexte est réveillé d'abord : `uiClic` `curseurs.js:135`).

## 3. Existence des fichiers (point 5)

* Banque : `sons-banque.js` (7 287 667 octets) **200** ; `sfx.js` **200** (17 966 o) ; `sons-banque.js?v=39` et `sfx.js?v=8` (les URLs d'`index.html:9847-9848`) **200** ; `sw.js` **200** ; `sons-banque-2.js` **404 sur le dépôt** (normal : n'existe que dans la copie publiée, `outils/scinde-banque.cjs` ; `B.partiel` est absent du fichier du dépôt, `sfx.js:100` ne le demande donc pas).
* Intégrité de la banque (script Node) : 229 fiches / **384 clés attendues (fiche × variante × base) = 384 présentes**, aucune vide ; 341 MP3 (`SUQz`) + 44 WAV (`UklG`). **Les MP3 n'ont pas été décodés** (pas de ffmpeg/navigateur) : intégrité du contenu audio non vérifiée.
* Tous les identifiants de son d'interface appelés dans `code/` (169 chaînes `sfx('…')/son('…')/existe('…')`) existent dans la banque, sauf des préfixes dynamiques de gameplay (`pwr.`, `flow.`, `verdict.`, `riche.`, `aura.x`) et `pwr.bouclierCasse`/`fruit.ligne` (course, hors périmètre ; `pwr.bouclierCasse` `fruits-auras.js:364`, `fruit.ligne` `ramassage.js:138` : à garder par `existe`).
* HEAD http des fichiers hors banque référencés par l'interface : `assets/audio/death/{minecraft,explosion,gong}.m4a` **200** ; `assets/audio/music/intro/pad-{nuages,apesanteur,altitude}.m4a` **200** ; `…/paliers/rendus/ciel-30/p1.m4a`, `…/nuit-de-velours/p1.m4a`, `…/boucles/dark-triad.m4a`, `…/lobby/chris-matin.m4a` **200**. Le serveur 9761 est arrêté.
* **Service worker** (`sw.js:15-17`) : le précache `CORE` = `./`, `index.html`, `manifest`, `icon.svg` **seulement**. Banque, `sfx.js`, m4a ne sont PAS précachés : ils sont mis en cache au premier `fetch` (cache d'abord, 200 seulement, `sw.js:60-68`). Un premier lancement hors ligne = aucun son. `sons-banque-2.js` (chargé par script dynamique) est mis en cache de la même façon.
* **Copie publiée / app** : `vercel-build.sh` + `preparer-www.js:194` scindent la banque. Le `app-ios/www/` présent dans ce dossier contient la banque ENTIÈRE (pas de `partiel`, pas de `-2`) : à regénérer via `npm run sync` pour tester l'app telle qu'elle sera livrée.

## 4. Défauts numérotés

### AUDIBLES

**1. [audible — premier lancement web/app] Tous les sons de bouton (`ui.tap/nav/retour/on/off/onglet/refus/danger/curseur/volet/feuille/modale/equipe/ok/achat/jouer…`) sont dans la 2e moitié de la banque, chargée APRÈS le menu.**
 `outils/scinde-banque.cjs:24` ne met dans `sons-banque.js` que les fiches `pre:1` (+ étalon). Dans la banque, seules **27 fiches** sont `pre:1` ; côté interface, **uniquement `ui.appui`**. Mesuré en rejouant `scinde-banque.cjs` sur une copie : 110 clés / 0,82 Mo dans la 1re moitié, 275 / 6,40 Mo dans la 2e ; `ui.tap` etc. absents de la 1re. La 2e (`sons-banque-2.js`) n'est demandée qu'après l'événement `load` + un `requestIdleCallback` (≤ 3 s, `sfx.js:100-108`), puis décodée 4 par 4 ; tant qu'un tampon manque, `play()` rend `null` sans bruit (`sfx.js:160`), et comme `SONV2` est vrai dès que la fiche `ui.tap` existe dans les métadonnées (`console-son.js:81`), le repli `chimeNote` de `uiClic` (`curseurs.js:134`) n'est PAS pris. Résultat : sur connexion lente (1,6 Mbit/s ≈ 30 s pour 6,4 Mo) les premiers JOUER/GARAGE/onglets ne font entendre que les micro-ticks `ui.appui`. Les commentaires de `sfx.js:55-56` et de l'en-tête de `scinde-banque.cjs` (« l'interface, la pièce, la pose ») ne sont plus vrais. Les lancements suivants sont rattrapés par le cache du service worker.
 Correction minimale (1 ligne, +314 Ko seulement sur 0,82 Mo) : `outils/scinde-banque.cjs:24` → `if(k==='__etalon'||m.pre||/^ui\./.test(id)){…` (ou ajouter `pre:1` aux `D('ui.…` de `atelier-son/recettes.js:274-310,1146-1152` et recuire avec `node atelier-son/cuire.js`).

**6. [audible, léger] ×2 du gain et CONTINUER : un `ui.tap` immédiatement suivi d'un `ui.refus` quand l'action échoue.**
 `mobile-tactile.js:996` joue `uiClic('')` AVANT `dblJoue`, puis `:997` `if(!r)uiClic('refus')` : deux sons dans la même image (cd de `ui.refus` 0,25 s, de `ui.tap` 0,035 s : les deux passent). Même schéma côté CONTINUER : `seconde-chance.js:130` (`uiClic('')` avant le lancement de la pub) puis `mobile-tactile.js:952` (refus si `chanceJoue()` rend faux, p. ex. `!lance`).
 Correction : `:996` retirer `uiClic('');` ; `:997` → `if(!r)uiClic('refus');else uiClic('');`. Idem : retirer `uiClic('')` de `seconde-chance.js:130` et l'ajouter dans la branche réussie de `:952`.

### MINEURS

**2. [mineur] Le micro-tick `ui.appui` de la 1re délégation ignore `aria-disabled`.**
 `aura-banque-contrats.js:227` ne teste que `.off`/`.arme` (la 2e délégation, `:273`, teste aussi `aria-disabled`). `#gEquip` est un `.pbtn` à `aria-disabled="true"` quand la caisse est déjà équipée ou verrouillée (`atelier.js:85`) → tick au contact, puis `ui.nav`/`ui.refus` au clic.
 Correction : `:227` ajouter `&&el.getAttribute('aria-disabled')!=='true'` dans la condition.

**3. [mineur] Tick orphelin au 2e tap d'un double-tap.**
 Le verrou `uiGarde` avale le 2e `click` (`aura-banque-contrats.js:285`) mais pas le `pointerdown` : les deux délégations (`:227` et `:273`) rejouent `ui.appui` pour un toucher qui ne fera rien.
 Correction : en tête des deux handlers `pointerdown` : `if(performance.now()<(uiGarde.t||0))return;`.

**4. [mineur] Pause : le curseur EFFETS ne rend aucun témoin au relâcher.**
 `curseurs.js:55` joue `piece` (bus `rec`, id sans préfixe `ui.`) : pendant la pause le contexte dort, `sfxOk()` refuse, et `pauseSon` coupe de toute façon le bus `rec` (`console-son.js:65`). Seuls les crans `ui.curseur` (suivent le volume) restent audibles.
 Correction : `curseurs.js:55` → `sfx(paused?'ui.ok':'piece',{t:.06})` (`ui.ok` : bus ui, passe par `pauseSon`).

**5. [mineur] Rôles de réglages incohérents.**
 `mRole9` (`mobile-tactile.js:842-853`) : MUSIQUE/VIBRATIONS/SURVIVANT/PARC/SANDBOX = `on/off` ; IMAGE/LANGUE/COMMANDES/POUCE HAUT/FIGURES = `onglet` ; mais MAIN (`gau`, droitier/gaucher), VOL INVERSÉ (`volinv`, OFF/ON) et INCLINAISON (`incl`) tombent dans le défaut `nav` (ligne 852) — même type de ligne, autre son.
 Correction : ligne 851 → `if(a==='q'||a==='lang'||a==='ctl'||a==='gau'||a==='volinv'||a==='incl')return 'onglet';`.

**7. [mineur, non vérifié à l'exécution] Touchers « sourds » des 600 ms après la mort : action ignorée, mais le filet peut jouer un clic + vibrer.**
 `mHit` (`mobile-tactile.js:1006`), `go` du ×2 (`:995`) et de CONTINUER (`:951`) retournent sans rien faire pendant 600 ms (`TCTL.mortT`), sans poser `UI_SON.t` ; le filet (`curseurs.js:161-173`) peut alors rejouer `ui.tap`/`ui.nav` + `hap(8)` pour un bouton qui n'a pas réagi. (Les `ui.compte` de l'écran de mort rafraîchissent `UI_SON.t` : selon l'instant, le filet se tait ou non — d'où « non vérifié ».)
 Correction : `curseurs.js:162` → ajouter `||(started&&gameOver&&TCTL.mortT&&performance.now()-TCTL.mortT<600)` à la condition de retour.

**8. [mineur, non vérifié] Boutons de fermeture qui sonnent avant leurs gardes.**
 `gClose` (`garage-cadrage.js:183`) et `ivFerme` (`bouton-rouge.js:124`) appellent `uiClic('retour')` sans le test `if(!garageOn||GAR.go||ecranWipe._on)return;` que portent leurs voisins (`garage-cadrage.js:216,246`, `atelier.js:58-59`) : si le bouton reste touchable pendant le lâcher ou un volet, on entend « retour » sans effet (`ecranWipe` refuse en silence quand `_on`).
 Correction : ajouter cette garde en tête des deux handlers.

**9. [mineur, atteignabilité PC non vérifiée] `#garageBtn` (ancien menu PC) n'a pas de `ui.nav`.**
 `garage-cadrage.js:180` : `vroomGarage();openGarage();` — `ui.volet` (posé par `ecranWipe`) fait taire le filet. Le mobile (`mobile-tactile.js`, branche `garage`) joue `ui.nav`.
 Correction : `garage-cadrage.js:180` → `$('garageBtn').addEventListener('click',e=>{e.stopPropagation();uiClic('nav');vroomGarage();openGarage();});`.

**10. [mineur, non vérifié] Ancien panneau `#settings` : le rôle est deviné APRÈS la bascule.**
 `garage-cadrage.js:85-90` bascule via `b.click()` (non fiable) sans `uiClic`, puis `setRefresh` (`:67`) pose `className='off'` sur `<b id=tgSnd|tgMus>` ; le filet (`curseurs.js:150`) lit `.off` au `setTimeout(0)` : COUPER la musique en cliquant sur le `<b>` jouerait `ui.refus`, la rallumer `ui.nav`. Seulement si ce panneau est atteignable (`#setBtn` est dans l'ancien menu `ecrans-menus.html:45` ; l'écran coque `#mSet` l'a remplacé).
 Correction : `garage-cadrage.js:88` → `const t9=row.getAttribute('data-tg');uiClic((t9==='sndBtn'?SND.sfx:SND.music)?'off':'on');` avant `b.click()`.

**11. [mineur, peut-être voulu] Écran de mort : le palier du moteur et l'aura qui montent n'ont pas de son.**
 `m6Anime` (`mobile-tactile.js:668-681`, un cran visuel `m6Tape` toutes les ≤130 ms) et `countUp` de l'aura (`:797`) sont muets ; seul le montant d'argent a ses `ui.compte`. Correction éventuelle : dans la boucle `:675` ajouter `setTimeout(function(){sfx('ui.compte',{st:sonPd(i-1)});},T+i*pas)`.

**12. [mineur] Achat de caisse : 3-4 couches sonores simultanées sans ducking.**
 `ui.achat` + `ui.tampon` (+266 ms) + `ui.compteur` (immédiat, `atelier-ferme.js:595`) + fête synthétique (riser `chimeNote`, explosion `noiseBurst`, chimes ; `fete-caisse.js:73-86`, sur `MASTER`, hors chef d'orchestre) ; `ui.achat` n'est pas dans `SON_DUCK` (`console-son.js:31`). Pas de défaut prouvé ; à juger à l'oreille. Piste : `'ui.achat':.3` dans `SON_DUCK`.

**13. [mineur, cosmétique] `uiClic('ok')` n'est pas un rôle.**
 `aujourdhui.js:108,164`, `ecran-revelation.js:190,334,477` : tombe sur `ui.tap` (déjà noté dans `boutique.js:35`). Sans effet audible (c'est la branche `!SONV2`). Correction : retirer l'argument ou ajouter `ok:'ui.ok'` à `UI_CLIC` (`curseurs.js:125`).

### Constats hors liste (information)

* Le service worker ne précache ni la banque ni `sfx.js` (voir §3) : 1er lancement hors ligne = muet.
* `node code/assembler.cjs --verifier` répond ✘ : `index.html` (10 036 657 o) ≠ morceaux (9 993 165 o). Vérifié sur les versions de HEAD : les deux sont **identiques une fois les `\r` retirés** (l'écart = 43 630 retours chariot présents dans `index.html` seulement). Sans rapport avec le son, à signaler à qui lance l'assembleur.
* Non audité (course/gameplay, comme demandé) : `moteur.palier`, `argent.palier`, `pwr.*`, `verdict.*`, `riche.*`, voix et moteur.
* Rien n'a été écouté ni exécuté dans un navigateur : le comportement réel des délégations (`isTrusted`, ordre des `setTimeout(0)`, `AC.state`) est déduit de la lecture du code.
