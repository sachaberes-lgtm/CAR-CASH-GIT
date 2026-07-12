# Mission — Refonte totale du mode SURVIVANT (le fer de lance du jeu)

Tu travailles sur **CASH CAR**, un runner arcade 3D dans le ciel. **Tout le jeu tient dans `index.html`** (~3200 lignes, HTML+CSS+JS dans un seul fichier), Three.js r128 depuis le CDN cloudflare, pas de build, pas de framework, langue française. **Ne découpe PAS le fichier.** Lis d'abord le `CLAUDE.md` du dossier pour la voix du projet et l'architecture.

Le mode Survivant actuel est raté et c'est LA priorité. Objectif : que le joueur ait l'impression d'affronter de vrais humains, dans une immense poursuite de police, spectaculaire à chaque seconde.

---

## Diagnostic à corriger (ce qui cloche AUJOURD'HUI)

1. **Les IA ne sautent pas et ne s'envolent jamais.** C'est structurel : dans `survTick`, les bots ne sont qu'une **simulation 1D** — ils n'ont que `totD` (distance sur la piste), `lat` (latéral) et `v` (vitesse), collés à la surface par `frameAt()`. Aucun état aérien, aucune hauteur. Leur « boost » (`boostT`) ne fait que multiplier la vitesse de +14 %, sans nitro visible ni décollage.
2. **La sirène est atroce** : c'est un simple oscillateur `triangle` en pin-pon (`sirenInit`, `sirO`, `sirG`) branché en continu, deux tons posés brutalement avec `setValueAtTime`. Strident et fatigant.
3. Les bots « existent » mais donnent l'impression de patiner sur un rail : pas assez de présence, de dépassements visibles, de danger.

---

## Repères de code à réutiliser (ne réinvente rien)

- Mode Survivant : `const SURV`, `SURV_PILOTS` (personnalités spd/agro/err), `mkPolice(liv)`, `survStart()`, `survTick(dt)`, `survRender()`, `botBoom(b)`, minuteur `svClockDraw()`.
- Sirène : `sirenInit()`, `sirO`, `sirG` (branchée sur le bus `MASTER`, jamais sur `AC.destination`).
- Lumières gyrophares : pool `gyroLights` (2 `PointLight`).
- Piste : `frameAt(dist,out)` remplit `out.p/t/n/b` ; tableaux `pts[]`, `T[]`, `Nn[]`, `B[]` de longueur `NP` ; `L` = longueur de piste ; `ROAD_HALF=14`, `THICK=2.6`.
- Voiture joueur / vol : `mode` = `'drive'|'fall'|'boom'`, `startFall`, `tryLand`, `fallPos`, `fallVel`, `s`, `lat`, `vA`, `airRoll`, `CARS[level].maxKmh`, `SPD`.
- Particules : `spawnP(pool,x,y,z,vx,vy,vz,life)`, `sparkBurst(pool,pos,n,sp)` ; pools `sparkGold`, `sparkBlue`, `smokePool`, `dust`, `flameCore`.
- Persistance : `SAVE.d`, `SAVE.flush()`, `SAVE.san()` (une seule clé localStorage `cashcarSave`, versionnée). Toute persistance passe par là.

**Piège critique** : `rnd`/`mulberry32` sont consommés SÉQUENTIELLEMENT dans `buildTrack` et `spawnPickups` — n'insère JAMAIS d'appel `rnd()` dans ces chaînes, ça décale toute la génération. Utilise `Math.random()` pour l'IA.

---

## Ce qu'il faut construire

### 1. Physique aérienne des bots (le manque n°1)
Donne à chaque bot un vrai état de vol : hauteur `airH`, vitesse verticale `vy`, gravité, vrille visuelle (`spin`/`spinV`). Un bot doit pouvoir **décoller, tourner en l'air, puis retomber** avec une gerbe de particules à l'atterrissage.
- Intègre `vy -= G*dt; airH += vy*dt;` — atterrissage quand `airH <= 0`.
- Rends-le : offset du mesh le long de `FB.n` (normale de piste) par `airH`, + rotation de vrille (barrel roll autour de l'axe forward, comme `airRoll` du joueur).
- Les gros sauts doivent monter haut (plusieurs dizaines de mètres pour les airs monstres) et rester spectaculaires.

### 2. Nitro VISIBLE des bots
Une flamme/halo réacteur derrière chaque bot quand il boost (sprite additif partagé + quelques particules `flameCore`/`dust`, uniquement quand le bot est visible et proche — LOD). Décision de boost selon la situation (rattrapage, sillage, dernière ligne droite) et la personnalité.

### 3. Apprentissage type « Drivatar » — les IA t'observent
C'est la demande forte du joueur : **les bots apprennent en le regardant jouer.** Deux mémoires :
- **Profil persistant** (nouvelle sous-clé dans `SAVE.d`, désinfectée dans `san()`) : agrège run après run le STYLE du joueur — appétit de saut (sauts/seconde), usage nitro, prudence en virage (latéral moyen), niveau (vitesse / max de la caisse), agressivité. Moyenne mobile : adoption totale à la 1re run, EMA douce ensuite. Ce profil BIAISE tous les bots au départ de `survStart` (sauteurs si le joueur saute, prudents s'il l'est, à son niveau).
- **Zones de saut en direct** : sur la piste COURANTE, enregistre chaque endroit où le joueur décolle (`mode` passe à `'fall'`) avec la durée d'airtime obtenue. Un bot qui repasse près de cette zone décolle aussi, en imitant la durée × sa personnalité. Effet « il a vu où je saute ».

Résultat attendu : 1re partie, les bots roulent « normal » ; au fil des runs et de la session, ils prennent tes lignes, tes sauts, tes boosts. L'illusion d'apprentissage doit être réelle, sans vrai ML.

### 4. Sirène corrigée
Remplace le triangle pin-pon strident par une sirène **douce et wailing** : onde `sine` (ou saw filtrée passe-bas), glissando de fréquence lissé (`setTargetAtTime`, pas `setValueAtTime`), léger vibrato, volume bas, dosé à la distance de la voiture la plus proche QUI POURSUIT. Reste branché sur `MASTER`. Doit donner « poursuite » sans agresser l'oreille.

### 5. Ce qui doit rester / être renforcé
Voitures de police visibles qui roulent, dépassent, défendent leur position, aspirent dans le sillage, profitent des erreurs, prennent des risques en fin de course, reviennent en douceur si le joueur domine (élastique INVISIBLE, jamais sous les yeux). Personnalités marquées (agressif / prudent / opportuniste / rapide-mais-fautif). Gyrophares = **vraies lumières dynamiques** rouge/bleu qui éclairent route + carrosserie, halo, intensité selon la distance, LOD (pool de PointLights pour les plus proches). Minuteur circulaire pixel-art de 60 s. Dernier = condamné : voiture qui clignote rouge, alerte HUD « ⚠ VOUS ÊTES DERNIER — EXPLOSION DANS : 00:XX », puis explosion spectaculaire (flash, gerbes, onde de choc, disparition). Minimap temps réel avec tous les adversaires, déplacement parfaitement fluide.

---

## Contraintes de qualité (non négociables)
- **Perf d'abord** : pools de particules réutilisés, ZÉRO allocation dans la boucle (réutilise les `Vector3` temporaires), sprites plutôt que géométrie lourde, LOD partout (sim 1D permanente, mesh/gyros/lumières seulement à portée de vue).
- Ne casse jamais la boucle : le `try/catch` de `loop()` masque les erreurs — teste dans la console.
- Optimisations autorisées et souhaitées : simulation accélérée hors caméra, IA simplifiée au loin, interpolation, prédiction, **téléportations invisibles**, repositionnements. Le joueur ne doit JAMAIS voir l'optimisation.
- **Gameplay > réalisme.** Si un choix rend le jeu plus nerveux, plus spectaculaire, plus tendu, prends-le.
- Style de code compact existant, commentaires en français avec la voix imagée du projet.
- Tout nouveau visuel doit être disposé proprement au rebuild.

## Livrable
Édite `index.html` en place. À la fin, **extrais le JS entre `<script>` et `</script>` et lance `node --check`** pour garantir zéro erreur de syntaxe. Résume ce que tu as changé et où (fonctions touchées).

## Objectif final
À la fin, le joueur doit ressentir en permanence tension, vitesse, danger, spectacle — et l'envie de relancer « une dernière partie ». Ce mode doit être assez solide pour servir de base au futur mode multijoueur. L'écran doit toujours être vivant : il se passe toujours quelque chose, il y a toujours une menace.
