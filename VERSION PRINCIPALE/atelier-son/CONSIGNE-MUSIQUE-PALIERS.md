# CASH CAR — fabriquer un MORCEAU À PALIERS (consigne pour Claude)

Tu composes la musique d'un niveau de **CASH CAR**, un jeu de course arcade sur iPhone (route suspendue dans le ciel, nitro, sauts).
La musique **suit le moteur de la voiture** : plus le joueur ramasse de pièces, plus son moteur monte, plus la musique s'intensifie.
Pour ça, chaque morceau existe en **PALIERS** — **12 de préférence** (le jeu a 30 moteurs : 2 moteurs par palier jusqu'au 12e,
puis 3 par palier jusqu'au 30e — voir `moteurs` plus bas), ou 5. Le jeu passe d'un palier au suivant **sur la mesure suivante**, à la même place
dans la phrase : la musique ne recommence jamais, elle monte d'un cran.

Tu livres **UN fichier `.html` autonome**. Le jeu en extrait le bloc `<script id="morceau">` et le rend lui-même, palier par palier.

---

## 1. Le format du fichier (à respecter à la lettre)

```html
<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>NOM — morceau à paliers</title><style>/* libre */</style></head><body>
  <!-- l'interface d'écoute : PLAY + 5 boutons de palier (libre) -->

  <script id="morceau">
  const MORCEAU = (function () {
    const BPM = 104;
    function preparer(ctx, sortie, alea) { /* construit la chaîne de son ; rend un « kit » */ return { /* … */ }; }
    function jouer(ctx, kit, p, t0, m0, n, alea) { /* programme les mesures m0 … m0+n−1 du palier p, la 1re à l'instant t0 */ }
    return { titre: 'NOM', bpm: BPM, mesures: 8, ton: 'ré mineur', paliers: ['…','…','…','…','…'], preparer, jouer };
  })();
  </script>

  <script> /* l'écoute : appelle MORCEAU.preparer puis MORCEAU.jouer mesure par mesure (voir le gabarit) */ </script>
</body></html>
```

### Le contrat de `MORCEAU`
| Champ | Ce que c'est |
|---|---|
| `titre` | le nom, en MAJUSCULES |
| `bpm` | le tempo, **fixe** (80 à 150) |
| `mesures` | la longueur d'une boucle de palier : **8** (une phrase de 8 mesures en 4/4) |
| `ton` | la tonalité, en clair (« ré mineur ») |
| `paliers` | 10 (ou 5) phrases courtes : ce qu'on entend en plus à chaque palier — leur NOMBRE fixe le nombre de paliers |
| `intro` *(facultatif)* | le nombre de mesures de l'INTRO (4 conseillé) : jouée une fois au départ, puis le palier voulu par le moteur |
| `introTxt` *(facultatif)* | une phrase : ce qu'on entend dans l'intro |
| `moteurs` *(facultatif)* | combien de moteurs (sur 30) dure chaque palier, ex. `[2,2,2,2,2,2,3,3,3,3,3,3]` ; sinon le jeu découpe lui-même (paliers qui s'allongent doucement) |
| `pas` *(facultatif)* | dB de plus par palier (0,7 par défaut ; 1,1 pour creuser le contraste, comme NUIT DE VELOURS) |
| `preparer(ctx, sortie, alea)` | crée DANS `ctx` toute la chaîne (bus, réverbe, écho, compresseur…) branchée sur `sortie` ; rend un objet « kit » (les nœuds dont `jouer` a besoin + son état : la dernière note de basse…) |
| `jouer(ctx, kit, p, t0, m0, n, alea)` | programme **toutes** les notes des mesures `m0` à `m0+n−1` du palier `p` (1 à 10, ou 1 à 5) ; la mesure `m0` commence à `t0` (secondes). **`p = 0` = l'intro**, mesures `0` à `intro−1` |

### Les règles du bloc `#morceau` (sinon le jeu ne peut pas le rendre)
- **Aucun accès à la page** : pas de `document`, `window`, `setTimeout`, `setInterval`, `requestAnimationFrame`, `fetch`.
- **Jamais `Math.random`** : utilise `alea()` (un nombre entre 0 et 1, fourni par le jeu, le même à chaque rendu).
- **Jamais `ctx.currentTime`** : tous les instants se calculent depuis `t0` et le tempo (`mesure = 240 / BPM` secondes, `double croche = 60 / BPM / 4`).
- La **mesure absolue** `m` (de `m0` à `m0+n−1`) donne la place dans la phrase : `m % 8`, `m % 4`… Le jeu appelle `jouer` avec
  `m0 = 6, n = 10` (deux mesures d'élan, puis la boucle), et la page d'écoute avec `n = 1`, mesure après mesure. Les deux doivent sonner pareil.
- Que du **Web Audio de base** : oscillateurs, `AudioBufferSource` (bruit calculé avec `alea`), filtres, gains, `WaveShaper`, `Convolver`
  (réponse calculée), `Delay`, `DynamicsCompressor`, `StereoPanner`. **Pas** d'AudioWorklet, pas de fichier son externe, pas de sample.
- Le palier change au début d'une mesure : règle les volumes de bus du palier avec `setValueAtTime(…, t0)` dans `jouer`.
- Garde un nombre de notes raisonnable : **400 sources maximum par mesure** au dernier palier.
- Toute ondulation lente créée dans `preparer` (chorus, bande qui pleure, trémolo) fait un nombre **ENTIER** de tours par phrase de
  8 mesures (`fréquence = k / (8 × 240 / BPM)`) : sinon la boucle ne retombe pas sur elle-même et une nappe tenue CLAQUE au bouclage.
- Pas de `wobble.connect(osc.detune)` sur chaque note (très lent à rendre) : fais passer ce qui chante dans UNE ligne à retard
  modulée (même effet). Les filtres de chaque note : `filtre.frequency.automationRate = 'k-rate'` (dans un `try`).
- La sortie ne doit jamais saturer : un compresseur doux en bout de chaîne, une crête sous −1 dBFS.

---

## 2. Les règles musicales (les goûts de Léo, tirés de ses verdicts)

**Le principe : DÉJÀ BIEN, PUIS ÇA S'INTENSIFIE.**
- **Palier 1 = un vrai morceau complet** : batterie, basse, accords, et le motif qu'on retient. Jamais une intro calme ou une nappe seule.
- **L'INTRO** (2026-10-12, Léo : « ça commence intro, puis palier 1… ») est À PART (`intro: 4`, `p = 0`) : 4 mesures qui MÈNENT au
  palier 1 — la boucle filtrée « derrière la porte » qui s'ouvre, la batterie qui entre, deux temps de vide à la fin, puis ça part.
  Sa dernière mesure a les accords de la mesure 8 de la phrase (elle tombe pile sur la mesure 1). Mêmes accords, même tempo.
- **LE BON NOMBRE : 12 paliers**, `moteurs: [2,2,2,2,2,2,3,3,3,3,3,3]` (Léo : « 1, 2, 3, 4 : environ 2 moteurs ; couper de 13 à 30 de
  manière égale — trop de moteurs avec une même intensité, ça suit pas ; encore plus de complexité et d'intensité »).
- **Avec 10-12 paliers** : une table `QUAND = { élément: palier où il entre }` ; P1 nu, ~P7 = LE DROP, le dernier = le final « magnifique »
  (Léo : « fais évoluer, varie comme tu veux, tant que ça s'intensifie et devient magnifique à la fin »). Avec `pas` ≈ 0,5 dB.
- Les paliers ajoutent de **l'énergie**, jamais l'identité. **Mêmes accords, même mélodie, même tempo, même tonalité** du palier 1 au 5.
  - P2 : ça pousse (charleys plus serrés, basse plus active, un peu plus de brillance) ;
  - P3 : une couche en plus (arpège, contre-chant, percussions) ;
  - P4 : la mélodie passe devant, batterie plus grosse ;
  - P5 : le final, tout dehors, plus large (chœur, cordes, sous-basse).
- Un changement de palier doit **s'entendre tout de suite**, mais sans casser : P4 → P5 = le même morceau, en plus gros.
- **Du CONTRASTE** (Léo, NUIT DE VELOURS : « encore plus de variations, de contraste, d'évolution ») : P1 NU et sombre (le motif seul,
  basse posée, tout derrière un filtre), P4 = LE DROP (tout s'ouvre d'un coup), P5 bien plus grand que P4. Un même ajout timide à
  chaque palier ne suffit pas : chaque palier change au moins 3 choses qu'on entend.
- **8 mesures**, et la 2e moitié de la phrase **répond** à la 1re.
- **Le motif** : 2 mesures qu'on retient, présentes dès le palier 1 (même discrètes).
- **Le registre** : médium-grave. **Jamais** d'onde carrée nue dans l'aigu ni de mélodie très aiguë (« enfantin »).
- **Le lead** doit s'entendre (6 à 8 dB sous le mix, pas enterré).
- **Laisser de la place au jeu** : une basse RYTHMÉE plutôt qu'un bourdon grave continu (le moteur de la voiture vit là) ; l'aigu pas
  saturé en permanence (les pièces et le « ting » de la nitro vivent là).
- **Interdits** (Léo les a refusés) : le tempo qui bouge, la hauteur qui bouge, les montées de souffle (« l'aspiration »), la distorsion
  lourde sur toute la musique, un son « robot » fade (ondes nues sans enveloppe, sans réverbe, sans humanité).
- **Ce qui plaît** : Rhodes à trémolo, contrebasse, vibraphone, cordes douces, glissando de harpe, 808 qui glisse, réverbe douce, une
  pointe de bande (légère ondulation de hauteur), un instrument SIGNATURE par morceau.
- **Varier d'un morceau à l'autre** : change au moins 2 de ces 4 axes par rapport aux morceaux déjà faits — le tempo · le groove (droit,
  swing, demi-tempo, 2-step, triolets trap) · la couleur (majeur, dorien, mineur, mixolydien) · l'instrument signature.
  Déjà fait : **MOTEUR GLISSE** (104 BPM, ré mineur, lo-fi trap, Rhodes FM, 808 qui glisse, chœur « aah ») ·
  **NUIT DE VELOURS** (110 BPM, fa mineur, french touch de nuit / vaporwave, quatre temps qui pompent, accords hachés filtrés,
  grille « Just the two of us », mélodie en triangle, avec INTRO).

---

## 3. Le gabarit (un morceau minimal qui marche — pars de là)

```html
<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>GABARIT — morceau à paliers</title></head><body>
<button id="play">PLAY</button> <span id="pals"></span>

<script id="morceau">
const MORCEAU = (function () {
  const BPM = 100, ACC = [[45, 52, 57, 60], [41, 48, 53, 57], [43, 50, 55, 59], [40, 47, 52, 55]]; // la mineur
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
  function preparer(ctx, sortie, alea) {
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 3; comp.connect(sortie);
    const master = ctx.createGain(); master.gain.value = 0.7; master.connect(comp);
    const bus = {}; ['acc', 'basse', 'kick', 'hat', 'lead'].forEach(id => { bus[id] = ctx.createGain(); bus[id].connect(master); });
    const bruit = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate); const d = bruit.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = alea() * 2 - 1;
    return { bus, bruit };
  }
  function jouer(ctx, kit, p, t0, m0, n, alea) {
    const sd = 60 / BPM / 4, b = kit.bus;
    b.hat.gain.setValueAtTime(p >= 2 ? 1 : 0.6, t0);   // P2 : les charleys poussent
    b.lead.gain.setValueAtTime(p >= 4 ? 1 : 0.5, t0);  // P4 : la mélodie devant
    const note = (bus, midi, t, dur, vol, type) => { const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type || 'triangle'; o.frequency.value = mtof(midi);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(bus); o.start(t); o.stop(t + dur + 0.05); };
    const hat = (t, vol) => { const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
      s.buffer = kit.bruit; f.type = 'highpass'; f.frequency.value = 7000;
      g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
      s.connect(f); f.connect(g); g.connect(kit.bus.hat); s.start(t, alea() * 0.5); s.stop(t + 0.06); };
    for (let m = m0; m < m0 + n; m++) {
      const tm = t0 + (m - m0) * 16 * sd, a = ACC[m % 4];
      a.slice(1).forEach(x => note(b.acc, x + 12, tm, 16 * sd, 0.04));                // les accords (dès P1)
      [0, 6, 10].forEach(i => note(b.basse, a[0] - 12, tm + i * sd, 3 * sd, 0.4, 'sine')); // la basse (dès P1)
      [0, 8].forEach(i => note(b.kick, 33, tm + i * sd, 0.15, 0.8, 'sine'));             // la grosse caisse (dès P1)
      for (let i = 0; i < 16; i += (p >= 2 ? 1 : 2)) hat(tm + i * sd, i % 4 ? 0.03 : 0.06); // croches puis doubles croches
      if (m % 2 === 0) note(b.lead, a[2] + 12, tm, 6 * sd, 0.12);                      // le motif (dès P1)
      if (p >= 3) for (let i = 0; i < 16; i += 2) note(b.acc, a[(i / 2) % 4] + 24, tm + i * sd, sd, 0.03); // P3 : l'arpège
      if (p >= 5) a.forEach(x => note(b.acc, x, tm, 16 * sd, 0.05, 'sawtooth'));       // P5 : tout dehors
    }
  }
  return { titre: 'GABARIT', bpm: BPM, mesures: 8, ton: 'la mineur',
    paliers: ['groove complet', '+ charleys serrés', '+ arpège', '+ mélodie devant', '+ tout dehors'], preparer, jouer };
})();
</script>

<script>
// L'ÉCOUTE : PLAY + palier 1-5 ; le palier choisi part à la mesure suivante (comme dans le jeu).
let ctx, kit, p = 1, m = 0, tNext = 0, iv = 0, g = 1;
const alea = () => (g = (g * 1664525 + 1013904223) >>> 0) / 4294967296, mes = 240 / MORCEAU.bpm;
for (let i = 1; i <= 5; i++) { const b = document.createElement('button'); b.textContent = i; b.onclick = () => p = i; pals.appendChild(b); }
play.onclick = () => {
  if (iv) { clearInterval(iv); iv = 0; ctx.close(); return; }
  ctx = new AudioContext(); kit = MORCEAU.preparer(ctx, ctx.destination, alea); m = 0; tNext = ctx.currentTime + 0.1;
  iv = setInterval(() => { while (tNext < ctx.currentTime + 0.4) { MORCEAU.jouer(ctx, kit, p, tNext, m++, 1, alea); tNext += mes; } }, 60);
};
</script>
</body></html>
```

L'exemple complet d'un vrai morceau dans ce format : **`moteur-glisse.html`** (s'il est joint, inspire-toi de sa structure).

---

## 4. Avant de livrer, vérifie
- [ ] Un seul fichier `.html`, le bloc `<script id="morceau">` définit `MORCEAU` avec `titre, bpm, mesures, ton, paliers, preparer, jouer`.
- [ ] Dans ce bloc : ni `document`, ni `window`, ni `Math.random`, ni `ctx.currentTime`, ni minuterie.
- [ ] Le palier 1 est déjà un morceau complet ; les 5 paliers ont les mêmes accords, la même mélodie, le même tempo, la même tonalité.
- [ ] Chaque palier s'entend plus intense que le précédent.
- [ ] La page d'écoute marche : PLAY, et les boutons 1 à 5 changent le palier à la mesure suivante.
- [ ] Dis en une ligne : le style, le tempo, la tonalité, l'instrument signature, et ce que chaque palier ajoute.

---

### Pour Léo — comment s'en servir
1. Sur claude.ai, crée un **Projet** « CASH CAR musique » et colle ce document dans ses **instructions** (joins aussi `moteur-glisse.html`
   dans les fichiers du projet). Chaque discussion du projet saura le faire.
2. Demande par exemple : « un morceau à paliers, style city pop, 112 BPM, pour le niveau VILLE ». Écoute-le dans sa page (PLAY, 1 à 5).
3. Télécharge le `.html` et donne-le à Claude Code, ou ouvre `musique-moteur.html` → **Charger un morceau** pour l'entendre suivre le moteur.
