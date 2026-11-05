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

## Piste pour finir (non faite)
Le jeu a déjà `compileDoux` (vignette-moteur.js, KHR_parallel_shader_compile) pour `renderer.compile`. Restent les programmes créés par le PREMIER `renderer.render` du démarrage (derrière l'intro) : three les lie et lit leur état tout de suite. Piste : `renderer.debug.checkShaderErrors=false` + lecture d'état différée jusqu'à COMPLETION_STATUS_KHR pour ces programmes, ou étaler la 1re compilation (un programme par image) pendant que le serpent tourne. À mesurer avec `serpent-trace.cjs` (les « TROU » doivent disparaître) ET sur un vrai téléphone (cache de shaders froid : vider les données du site).
