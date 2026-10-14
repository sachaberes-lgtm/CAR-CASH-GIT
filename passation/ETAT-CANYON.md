# ETAT-CANYON (14/10, branche `canyon`, worktree Documents/GitHub/CCG-canyon)
FAIT : map complète (genCanyon/buildCanyon, relief GPU CDLOD, 6 météos, monuments, vautours, ripisylve, fruits). Règle d'or OK au banc CPU
(0 point de route dans la roche, marge 45 m ; piste 19,4 km, 7,2 km de dénivelé). Bug majeur corrigé : textures RG32F/R32F sans internalFormat
sous three r128 -> parois absentes ; plateau en escalier arrondi.
RESTE (non poussé sur main) :
1. Bandes NOIRES horizontales sur les parois à l'ombre (soir) — pas la lumière ni le vernis ; piste : sortie de col avant lumière, strates uSTR, ou post.
   Un banc exp (gl_FragColor=col) a donné JAMAIS PRET (exp.html mal chargé) : à refaire proprement.
2. Ciel crème délavé (soir/midi), fog orange plat ; grain « fenêtres » sur les parois.
3. Planches des 6 météos, nuit/pluie/orage non revus depuis le correctif.
4. Mesures : dbgCout, programmes avant/après portail (vues.js --perf : `renderer` non global -> utiliser dbgProgsListe).
5. Avant push main : fumée commune (cc-banc/fumee.cjs), sw.js CACHE +1, merge origin/main, verrou cc-push.lock, copie dossier de jeu.
Bancs : scratchpad session (vues.js, cpu.js) — à recopier dans passation si la session est vidée.
