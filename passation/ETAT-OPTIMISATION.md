# ÉTAT — session OPTIMISATION (PC, 14/10/2026, ~18 h)

Lire d'abord `passation/OPTIMISATION.md` (la passe perf mobile du Mac, le socle `PAL`) puis la section « LES GELS DE CONSTRUCTION,
VAGUE 1 » en haut de `VERSION PRINCIPALE/JOURNAL.md`. Worktree : `C:/Users/sacha/Documents/GitHub/CCG-optim`, branche `optimisation`
(fins de ligne LF : `core.autocrlf=false` en config de worktree), poussée sur `main` au verrou `cc-push.lock`.

## Livré (vague 1, sur main) — même image, même simulation
- DOGE : tête ~1,6× plus vite (sphères englobantes, empreinte identique au bit) + Web Worker au menu (`DOGE_OUV`, `dbgDoge('compare')`).
  1re construction 532 → 24 ms ; repli sur place 310 ms.
- DOGE : lèvre du haut en queue du tampon, `updateRange` : 454 → 16 Ko envoyés par image quand la gueule bouge.
- Boutique : `carPhoto(i,cb)` en `toBlob` (adresses blob: au lieu de base64 dans les innerHTML), `dbgPhoto()`.
- JOUER : gabarits de la jade taillés au menu (`jadeGabFond`, `dbgGabarits`) : pire tâche 641 → ~200 ms ; REJOUER 315 → 140-200 ms.
- `lensTick` : remise au repos par copie mémoire, `VP` au lieu d'`innerWidth`.
- ESSAYÉ PUIS RETIRÉ : la Porte du ciel maillée en tranches (elle est déjà dans la brume au départ : gel coupé en deux, pas en moins).

## Livré ensuite (main 5e44827, v393) — et LA MISSION EN COURS
- `?perf=1` garde le RELEVÉ DES À-COUPS (`perfAcoup`, intervalle vrai `loop._brut`) : > 50/100/250 ms et les 5 derniers avec leur cause.
- MISSION (PILOTAGE, ordre de Sacha « la version mobile saccade ») : protocole envoyé à PILOTAGE (Économie d'énergie COUPÉE,
  `/jouer/?perf=1`, 1 min de jeu, une capture). En attendant sa capture : traquer les à-coups iPhone. Vu au banc PC (palier 0) :
  ~100-200 ms à chaque construction (JOUER, portail, REJOUER : newTrack), +1 texture envoyée à l'atelier au JOUER.

- SONDE À DISTANCE (demandée par PILOTAGE, PAS FAITE) : aucun service où le téléphone peut écrire ET le PC lire sans clé : pas de
  fonction Vercel ni de CLI vercel ici, `support-email/` (Cloudflare → Telegram) jamais déployé. Il faut qu'un humain crée un
  stockage (Vercel Blob/KV dans le tableau de bord du projet : la clé s'injecte seule dans les fonctions). Ensuite : `api/sonde.js`
  (POST, taille bornée) + lecture protégée, côté jeu opt-in par lien (`?sonde=on` posé en sauvegarde, `?sonde=off`), envoi en
  `sendBeacon` à la fin de partie : modèle (UA), palier, i/s, pics > 33 ms et leur cause (`perfAcoup`), 30 i/s, durée.

## Mesurer (PC, sans fenêtre, palier 0) — outils dans le scratchpad de la session (à recopier si besoin)
- `banc.cjs <port> tout|portail|rejouer|boutique [params] [--debout] [--noinline] --tag=x` : profil CPU, tâches longues, compilations,
  `newTrack` en ms par portail (`dbgClassique(c,m);dbgSaut()`), coût d'image (`dbgCout`).
- `doge-banc.cjs` (node) : empreinte SHA-256 de `dogeTete` — preuve « au bit près » de toute retouche de la tête.
- Verrou de banc : `C:/Users/sacha/cc-banc/lib.cjs` (`B._verrou.prend/rend`, CC_QUI=OPTIMISATION). Fumée : `cc-banc/fumee.cjs`.

## La suite, par rendement
1. Portail vers la jade : encore ~835 ms d'un bloc sur PC (Porte du ciel 363 ms dont `voxMesh(G,4)` 272 ms). Piste : GARDER le maillage
   de la Porte d'une visite à l'autre (graine fixe ; clé = la grille G), ou le préparer pendant la course d'avant.
2. `newTrack` : ~100 ms de temps « propre » non attribué (fonctions inlinées) → profil `--noinline` pour savoir qui.
3. Commentaires retirés au BUILD (`vercel-build.sh`, ordre de Sacha 14 h 50) : un vrai analyseur (esbuild/terser sans renommage ni
   compression), syntaxe 0 + fumée sur la page PRODUITE avant de pousser. 5,6 → ~3,5 Mo. App iPhone : à recopier par Sacha (Mac).
4. Boutique : remesurer au calme (le banc n'a pas ouvert OFFRES) ; `msRendu` de la 1re photo ~1 s sous charge (programmes du studio ?).
5. `initAudio` : ~100 ms au 1er toucher (zone SON : à leur signaler, pas à faire).
6. Jade palier 0 : ~505 k triangles (cible 450 k) ; `passation/banc-perf/postes.cjs` dit quels objets.
7. Démarrage à froid à mesurer quand la machine est calme (PILOTAGE a vu 90-126 s sous charge).
