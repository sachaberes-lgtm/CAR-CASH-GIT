# BANC DU SERPENT DE CHARGEMENT (2026-11-05, Sacha : « le serpent bug toujours »)

Chrome headless (CDP, Node ≥ 22, aucune dépendance), iPhone simulé 390×844 ×3, CPU ralenti. Servir `VERSION PRINCIPALE` (npx http-server . -p 3178 -c-1) puis :
- `node outils/banc-serpent/serpent-film.cjs <url> <cpu> <secondes> [dpr]` : filme l'écran (screencast), compte les images vides, les trous > 120 ms, les images distinctes. `BLOQUE=1` bloque le thread principal 3 × 800 ms.
- `node outils/banc-serpent/serpent-trace.cjs <url> <cpu> <secondes>` : trace Chrome ; pour chaque trou du serpent, les événements les plus longs qui le recouvrent, par thread (CrRendererMain, CrGpuMain…).
- `node outils/banc-serpent/serpent-prof.cjs <url> <cpu> <secondes>` : profil JS du démarrage (fonctions les plus lourdes).
- `serpent-seul.html` : le serpent seul, sans le jeu (témoin).

## Ce qui a été mesuré
1. LE DESSIN EST BON : le serpent seul ne gèle jamais, même avec trois blocages de 800 ms du thread principal (0 trou, 48 images distinctes) — le sprite `transform` + `steps(48)` tourne bien sur le compositeur.
2. DANS LE JEU il gèle 250-650 ms par moments (CPU ×4, profil Chrome neuf, donc cache de shaders froid). La trace montre, dans ces trous : `GLES2Implementation::GetProgramiv` → `CommandBufferHelper::Finish` sur le thread principal du rendu ET `Scheduler::RunTask` de 660 ms puis 271 ms sur `CrGpuMain`. C'est la lecture synchrone du lien d'un shader (three r128, `WebGLProgram`, `checkShaderErrors`) : le GPU est occupé à lier, il ne dessine plus RIEN, serpent compris. Un GIF, un canvas ou un autre sprite gèleraient pareil.
3. Les longues tâches du thread principal SEULES ne le gèlent pas (une tâche de 1,3 s à 2,2 s : aucun trou).
4. Le serpent n'existait dans la page qu'après 5-6 s (CPU ×4) : son HTML était à 625 Ko sur 770 Ko. Corrigé (v1157, le voile passe en tête du `<body>`).
5. ⚠ Le banc headless a un blocage GPU aléatoire de 30-60 s (« un programme ne se lie jamais ») : ne pas juger un A/B sur une seule passe.

- `node outils/banc-serpent/serpent-gl.cjs <url> <cpu> <secondes>` : les appels WebGL synchrones > 20 ms (getProgramInfoLog, getProgramParameter…) avec leur pile JS — dit QUI lit le lien d'un shader d'un bloc. `serpent-verif.cjs` : erreurs de console/shader, état `dbgLier`/`dbgCiel2`, capture.
  ⚠ Un serveur peut déjà tenir le port 3178 (autre session, ancienne version) : vérifier que le fichier servi contient bien le code du jour.

## Fait (v1176, 2026-11-05)
La cause était `cielChauffe` : 7 `renderer.render` des programmes du ciel À LA LECTURE DU SCRIPT (three lit le lien tout de suite : 0,9 s + 0,3 s + 0,4 s de GetProgramiv, plus le blocage aléatoire de 30 s du banc). Désormais `cielChauffeLance` les lie en DOUX avec la scène du menu (`lierDemarrage`), `cielChauffe` dessine une fois liés. Et `photoTour` (vitrine) ne prend plus de photo tant que `#spCharge` existe (`photoLie` = compilation dure : 1,4 s à ~10 s, puis 8 × 100-140 ms). Résultat (CPU ×4, profil neuf, 5 passes) : plus aucun « TROU » GetProgramiv pendant le serpent.
## Reste (hors GetProgramiv)
Vers 12-14 s (début de l'intro, serpent encore plein) : trous de 0,5 à 1,2 s = tâche JS de 0,5-2,3 s (TimerFire) puis `SkiaOutputSurfaceImplOnGpu::FinishPaintRenderPass` ~1,1 s sur le GPU : le dessin du canvas 2D de l'intro à DPR 3, pas un lien de shader. Piste suivante : le canvas `fxCv` (résolution/DPR de l'intro pendant que le serpent tourne) — à mesurer sur un vrai téléphone.

## En conditions téléphone (`?tel=1`, 390×844 ×3, CPU ×4, profil neuf) — 2026-11-05
- Les gels GetProgramiv sont aussi partis avec `?tel=1` ; la compilation dure des photos attend le serpent (v1181).
- Reste UN trou de 1,4-1,6 s, 10-13 s après le départ, à la fin de la lecture du script : `TimerFire` → `applyQ` → `qlReprise` → `applyDPR` → `renderer.setPixelRatio` → `setSize` (1,6 s de `GLES2::GetGLError`, attente synchrone du GPU) PENDANT une tâche GPU `RendererRasterWorker` de ~1 s (`DoEndRasterCHROMIUM::Flush`). Ce n'est NI un lien de shader (aucun appel WebGL > 150 ms), NI le serpent (`#spCharge{display:none}` : la tâche reste à 1,1 s), NI l'intro (`?intro=ancien`, `#fxCv` caché : idem), NI les canvas (`canvas{visibility:hidden}` : idem), NI les écrans (`#overlay,#garage,.screen` cachés : idem). Hypothèse non vérifiée : une cuisson de shaders de Skia (le compositeur) au premier gros tracé de la page. Pour creuser : `FENETRE=10500,13500 node serpent-trace.cjs <url> 4 20` (événements de la fenêtre), `CSS='…'` (A/B : une règle ajoutée dès le départ), `QUI=setSize node serpent-prof.cjs` (appelants d'une fonction).
- Le sprite du serpent (4 992 px × 3 = 14 976 px de large) n'y est pour rien (caché, rien ne change) ; sous la limite de texture de 16 384 des iPhone à 3 pixels par point (A9 et après).
- À tester sur un vrai téléphone, cache vidé : c'est le seul endroit où l'on saura si ce trou existe aussi sur Metal.
