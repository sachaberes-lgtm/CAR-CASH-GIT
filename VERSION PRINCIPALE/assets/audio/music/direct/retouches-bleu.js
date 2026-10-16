// retouches-bleu.js — LES RETOUCHES DE POUCE BLEU (2026-10-15, pôle SON ; Léo, dans les notes de la bibliothèque : « lis mes modifs, applique,
// rends la nouvelle version », puis « juste respecte les consignes »). Une retouche = la MÊME musique 👍 (même version du générateur, même
// numéro, mêmes goûts), retouchée juste après sa composition : `retouche(Mx, O)` change l'ordre des 30 moteurs, les timbres, la gamme, les
// accords, le rythme… ; `voix[nom]` / `acc[nom]` remplacent un instrument (Web Audio pur, rendus hors ligne par le générateur comme les siens).
// Le générateur reçoit tout par start(n, W, { retouche, voix, acc }).
// ⚠ LES CONSIGNES DE LÉO : `direct: true` = la retouche se joue SUR la musique elle-même (sa ligne de Pouce bleu, son nom, sa note) — c'est le
// cas par défaut ; une V2 À CÔTÉ (sa propre ligne, sous l'original) seulement quand sa note le demande (« faire une V2 à côté », « tenter une V2 »).
// Les noms : RENOMS (les « renommer … » des notes), lus par la bibliothèque si Léo n'a pas renommé lui-même.

export const RENOMS = { 'bleu-9664': 'MIRAGE', 'bleu-8154': 'FIRE PRIME', 'bleu-9551': 'NÉNUPHARS VELOURS', 'bleu-3379': 'SAUVER MAMAN' };

// ---------------------------------------------------------------- petits outils (Web Audio pur : ils ne dépendent d'aucune version)
const sortie = c => c.destination;
function env(c, a, h, r, v, dest) { const g = c.createGain(); g.gain.setValueAtTime(.0001, 0); g.gain.linearRampToValueAtTime(v, a); g.gain.setValueAtTime(v, h); g.gain.linearRampToValueAtTime(.0001, h + r); g.connect(dest || sortie(c)); return g; }
function decroit(c, a, d, v, dest) { const g = c.createGain(); g.gain.setValueAtTime(.0001, 0); g.gain.exponentialRampToValueAtTime(v, a); g.gain.exponentialRampToValueAtTime(.0001, a + d); g.connect(dest || sortie(c)); return g; }
const osc = (c, type, f, dt) => { const o = c.createOscillator(); o.type = type; o.frequency.value = f; if (dt) o.detune.value = dt; return o; };
const pan = (c, x, dest) => { const p = c.createStereoPanner(); p.pan.value = x; p.connect(dest); return p; };
function filtre(c, type, f, q, dest) { const b = c.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q || .7; if (dest) b.connect(dest); return b; }
function vibrato(c, vit, cents, dep) { const l = osc(c, 'sine', vit), g = c.createGain(); g.gain.setValueAtTime(0, 0); g.gain.setValueAtTime(0, dep); g.gain.linearRampToValueAtTime(cents, dep + .4); l.connect(g); l.start(0); return g; }
function souffle(c, f, q, v, dur, dest) { const n = Math.ceil(c.sampleRate * (dur + .05)), b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  const s = c.createBufferSource(), g = env(c, .05, dur * .6, dur * .4, v, dest); s.buffer = b; s.connect(filtre(c, 'bandpass', f, q, g)); s.start(0); }
function douce(k) { const a = new Float32Array(1024); for (let i = 0; i < 1024; i++) { const x = i / 511.5 - 1; a[i] = Math.tanh(k * x) / Math.tanh(k); } return a; }

// ---------------------------------------------------------------- les instruments des V2
// L'ARPÈGE SCI-FI (CAVALE ULTRA) : une goutte de synthé qui « bippe » — la note part une octave au-dessus et tombe sur sa hauteur en 18 ms,
// carré + scie dans un filtre résonant qui se referme, un anneau de modulation discret (le métal des films de SF), étalée gauche / droite.
const ARP_SF = () => [.55, [60, 72, 84], (c, f) => {   // (coupe-bas à 380 Hz : il brille au-dessus de la boue, mesuré)
  const g = decroit(c, .004, .42, .5, filtre(c, 'highpass', 380, .7, sortie(c))), fl = filtre(c, 'lowpass', f * 9, 7, g); fl.frequency.setValueAtTime(f * 9, 0); fl.frequency.exponentialRampToValueAtTime(f * 1.6, .22);
  [['square', 1, -.45, -6], ['sawtooth', .7, .45, 6]].forEach(([ty, v, x, dt]) => { const o = osc(c, ty, f * 2, dt), m = c.createGain(); m.gain.value = v * .5;
    o.frequency.setValueAtTime(f * 2, 0); o.frequency.exponentialRampToValueAtTime(f, .018); o.connect(m); m.connect(pan(c, x, fl)); o.start(0); });
  const rm = osc(c, 'sine', f * 2.01), rg = c.createGain(), car = osc(c, 'sine', f * 3); rg.gain.value = 0; rm.connect(rg.gain); car.connect(rg);
  const rv = decroit(c, .003, .12, .12); rg.connect(rv); rm.start(0); car.start(0); }, 2];

// LE TALKBOX VELOURS (COBRA ULTRA) : la même voix qui parle, sans le grain brut — deux scies à peine désaccordées dans trois formants
// larges (« â » chaud), un coupe-haut à 3,2 kHz, l'attaque arrondie, un vibrato tardif, un peu de sinus dessous pour le corps.
const TALKBOX_VELOURS = () => [1.9, [48, 60, 72], (c, f) => {
  const g = env(c, .045, 1.35, .45, .5), lp = filtre(c, 'lowpass', 3200, .5, g), som = c.createGain(), vb = vibrato(c, 5.2, 9, .3);
  [[700, 1, 3.5], [1150, .55, 4], [2600, .16, 4]].forEach(([fr, v, q]) => { const bp = c.createBiquadFilter(), m = c.createGain(); bp.type = 'bandpass'; bp.frequency.value = fr; bp.Q.value = q; m.gain.value = v; som.connect(bp); bp.connect(m); m.connect(lp); });
  [[-5, -.25], [5, .25]].forEach(([dt, x]) => { const o = osc(c, 'sawtooth', f, dt); vb.connect(o.detune); o.connect(pan(c, x, som)); o.start(0); });
  const s = osc(c, 'sine', f), sg = c.createGain(); sg.gain.value = .22; s.connect(sg); sg.connect(g); s.start(0); }, 2];

// LE VERRE CHANTANT (FLAMME DE TONNERRE) : un aigu qui n'est ni cuivre ni scie — l'attaque d'une cloche FM (le « ting »), puis une voix
// « i » qui tient (formants 300 / 2300 / 3100 Hz) sur un carré doux, un souffle d'air, un vibrato qui arrive tard, une octave fantôme.
const VERRE_CHANTANT = () => [1.8, [60, 72, 84], (c, f) => {
  const g = env(c, .03, 1.3, .45, .45), lp = filtre(c, 'lowpass', 6500, .5, g), som = c.createGain(), vb = vibrato(c, 5.6, 14, .4);
  [[300, .8, 5], [2300, .55, 8], [3100, .35, 9]].forEach(([fr, v, q]) => { const bp = c.createBiquadFilter(), m = c.createGain(); bp.type = 'bandpass'; bp.frequency.value = fr; bp.Q.value = q; m.gain.value = v; som.connect(bp); bp.connect(m); m.connect(lp); });
  [['square', 1, -.3, -4], ['sawtooth', .5, .3, 4]].forEach(([ty, v, x, dt]) => { const o = osc(c, ty, f, dt), m = c.createGain(); m.gain.value = v; vb.connect(o.detune); o.connect(m); m.connect(pan(c, x, som)); o.start(0); });
  const car = osc(c, 'sine', f), mod = osc(c, 'sine', f * 3.5), mg = c.createGain(), cg = decroit(c, .002, .5, .35, lp);   // le « ting » FM de l'attaque
  mg.gain.setValueAtTime(f * 3, 0); mg.gain.exponentialRampToValueAtTime(f * .05, .4); mod.connect(mg); mg.connect(car.frequency); car.connect(cg); car.start(0); mod.start(0);
  const o8 = osc(c, 'sine', f * 2), g8 = env(c, .2, 1.2, .4, .07, g); vb.connect(o8.detune); o8.connect(g8); o8.start(0);
  souffle(c, f * 4, 1.2, .025, 1.6, g); }, 2];

// LE KOTO NÉON (LUNE DE JADE) : la corde pincée qu'on appuie (la note part un demi-ton haut et redescend — le « oshi » du koto), une
// scie et un triangle dans un passe-bande qui se referme, un grain saturé (sans grave : coupe-bas à 200 Hz) : l'Asie, mais dans une ville de néon.
const KOTO_NEON = () => [1.3, [60, 72, 84], (c, f) => {
  const g = decroit(c, .003, 1.1, .55, filtre(c, 'highpass', 200, .7, sortie(c))), ws = c.createWaveShaper(); ws.curve = douce(1.8); ws.connect(g);
  const bp = filtre(c, 'bandpass', f * 3, 1.1, ws); bp.frequency.setValueAtTime(f * 5, 0); bp.frequency.exponentialRampToValueAtTime(f * 1.8, .5);
  [['sawtooth', .8, -.25], ['triangle', 1, .25]].forEach(([ty, v, x]) => { const o = osc(c, ty, f), m = c.createGain(); m.gain.value = v;
    o.frequency.setValueAtTime(f * Math.pow(2, 1 / 12), 0); o.frequency.exponentialRampToValueAtTime(f, .09); o.connect(m); m.connect(pan(c, x, bp)); o.start(0); });
  }, 2];

// LA CLOCHE DE VERRE (SAUVER MAMAN) : la harpe de verre devient une vraie cloche — FM à rapport inharmonique (3,51), des partiels qui
// s'éteignent chacun à leur vitesse, deux couches désaccordées gauche / droite qui battent doucement : elle sonne longtemps, elle brille.
const CLOCHE_VERRE = () => [3.2, 44100, (c, f, dest) => {
  const out = dest || sortie(c);
  [[-4, -.5], [4, .5]].forEach(([dt, x]) => { const p = pan(c, x, out);
    [[1, .3, 2.6], [2.76, .12, 1.2], [5.4, .06, .6], [8.9, .025, .3]].forEach(([r, v, d]) => { const o = osc(c, 'sine', f * r, dt), g = decroit(c, .003, d, v, p); o.connect(g); o.start(0); });
    const car = osc(c, 'sine', f, dt), mod = osc(c, 'sine', f * 3.51), mg = c.createGain(), cg = decroit(c, .002, 1.4, .18, p);
    mg.gain.setValueAtTime(f * 2.2, 0); mg.gain.exponentialRampToValueAtTime(f * .1, 1.2); mod.connect(mg); mg.connect(car.frequency); car.connect(cg); car.start(0); mod.start(0); }); }];

// LE CLAVINET AFFINÉ (COBRA ULTRA, « affiner instruments un peu brut ») : le MÊME clavinet (le carré et la scie de l'original, la note qui
// claque puis s'éteint vite, le même équilibre : sa fondamentale reste en retrait comme dans le passe-bande d'origine) — mais au lieu du
// passe-bande étroit qui nasillait, un coupe-bas raide (deux pôles doublés, × 2,4 la note, jamais sous 400 Hz) et un coupe-haut qui se referme : la morsure sans le grattement.
const CLAV_FIN = () => [.7, 44100, (c, f, dest) => { [[-3, -.35], [3, .35]].forEach(([dt, x]) => {
  const g = c.createGain(), lp = c.createBiquadFilter(), bo = c.createBiquadFilter(), hp = filtre(c, 'highpass', Math.max(400, f * 2.4), .6, filtre(c, 'highpass', Math.max(400, f * 2.4), .6, lp));
  lp.type = 'lowpass'; lp.Q.value = .6; lp.frequency.setValueAtTime(Math.min(3800, f * 7), 0); lp.frequency.exponentialRampToValueAtTime(Math.min(2600, f * 5), .3);
  bo.type = 'peaking'; bo.frequency.value = Math.min(2400, f * 4); bo.Q.value = 1.2; bo.gain.value = 3;
  g.gain.setValueAtTime(.0001, 0); g.gain.exponentialRampToValueAtTime(.26, .004); g.gain.exponentialRampToValueAtTime(.0001, .52);
  lp.connect(bo); bo.connect(g); g.connect(pan(c, x, dest));
  [osc(c, 'square', f, dt), osc(c, 'sawtooth', f, dt + 3)].forEach(o => { o.connect(hp); o.start(0); }); }); }];

// LES VOIX IMPROVISÉES (PISTON DE LUXE, « plus underground, avec des voix improvisées par toi, son recherché ») : des bouts de voix chantés
// (« â », « o », « ou », « è », « é », « eu ») — chaque hauteur a SA syllabe, si bien que la phrase change de voyelle d'une note à l'autre comme
// une voix qui improvise ; la note glisse d'un demi-ton et demi vers le haut en entrant, une sur trois retombe à la fin (le « ahh » qui se laisse
// tomber), un « h » de souffle à l'attaque ; filtrées comme une cassette (coupe-bas 260 Hz, coupe-haut 3 kHz) et saturées doucement : l'underground.
const VOYELLES = [[730, 1090, 2440], [570, 840, 2410], [300, 870, 2240], [530, 1840, 2480], [390, 2000, 2600], [500, 1400, 2400]];
// ---------------------------------------------------------------- LES SONS NEUFS (16/10, Léo : « surprends-moi : de nouveaux sons — les basses, les
// arpèges, je les ai reconnus ; de nouveaux instruments, de nouvelles manières de composer ; rien d'enfantin ni de cirque ; pas mille fois plus complexe »)
// LE CHŒUR « AH » : trois voix à peine désaccordées qui chantent « ah » — une impulsion (scie + carré) dans quatre formants, l'attaque qui glisse
// sur la note (30 cents dessous → juste en 60 ms, comme une voix), un souffle, un vibrato tardif, large dans la stéréo.
const VOIX_AH = () => [1.6, [48, 55, 62, 69, 76], (c, f) => {
  const g = env(c, .03, 1.1, .45, .5), hp = filtre(c, 'highpass', 160, .6, g), sortieF = c.createGain(), src = c.createGain(), vb = vibrato(c, 5, 12, .35); sortieF.connect(hp);
  [[800, 1, 6], [1150, .55, 7], [2900, .2, 9], [3500, .08, 9]].forEach(([fr, v, q]) => { const bp = c.createBiquadFilter(), m = c.createGain(); bp.type = 'bandpass'; bp.frequency.value = fr; bp.Q.value = q; m.gain.value = v; src.connect(bp); bp.connect(m); m.connect(sortieF); });
  [[-12, -.6], [0, 0], [12, .6]].forEach(([dt, x]) => [['sawtooth', 1], ['square', .35]].forEach(([ty, v]) => { const o = osc(c, ty, f, 0), m = c.createGain(); m.gain.value = v;
    o.detune.setValueAtTime(dt - 30, 0); o.detune.linearRampToValueAtTime(dt, .06); vb.connect(o.detune); o.connect(m); m.connect(pan(c, x, src)); o.start(0); }));
  souffle(c, 1150, 1.2, .06, 1.5, sortieF); }, 2];
// LE PIANO ÉLECTRIQUE À LAMES : la lame frappée — une sinusoïde qu'un modulateur à 14× fait sonner « tine » au coup de marteau (éteint en 80 ms),
// qu'un second à 1× réchauffe ; la décroissance d'un piano électrique, un trémolo stéréo lent. Rond, doux — jamais une clochette de jouet.
const RHODES_LAMES = () => [1.6, [48, 60, 72, 84], (c, f) => {
  const g = decroit(c, .004, 1.4, .5), car = osc(c, 'sine', f), m1 = osc(c, 'sine', f * 14), g1 = c.createGain(), m2 = osc(c, 'sine', f), g2 = c.createGain();
  g1.gain.setValueAtTime(f * 1.6, 0); g1.gain.exponentialRampToValueAtTime(f * .01, .08); m1.connect(g1); g1.connect(car.frequency);
  g2.gain.setValueAtTime(f * .9, 0); g2.gain.exponentialRampToValueAtTime(f * .15, 1.2); m2.connect(g2); g2.connect(car.frequency);
  const tr = c.createStereoPanner(), lfo = osc(c, 'sine', 3.2), lg = c.createGain(); lg.gain.value = .35; lfo.connect(lg); lg.connect(tr.pan); tr.connect(g);
  car.connect(filtre(c, 'lowpass', Math.min(5000, f * 10), .5, tr)); [car, m1, m2, lfo].forEach(o => o.start(0)); }, 2];
// LES ACCORDS DEEP HOUSE (ASPHALTE D'ÉMERAUDE, 16/10 — Léo : « les accords de piano » du début, c'est ce qui ne va pas) : deux scies désaccordées
// (gauche / droite) et un carré, dans un coupe-haut qui se referme après l'attaque, une tenue, puis l'extinction — l'accord chaud de la house de nuit.
const ACCORDS_DEEP = () => [1.6, 44100, (c, f, dest) => {
  const g = c.createGain(), lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 1.1;
  g.gain.setValueAtTime(.0001, 0); g.gain.exponentialRampToValueAtTime(.22, .008); g.gain.exponentialRampToValueAtTime(.09, .35); g.gain.setValueAtTime(.09, 1.1); g.gain.exponentialRampToValueAtTime(.0001, 1.55);
  lp.frequency.setValueAtTime(Math.min(4200, f * 9), 0); lp.frequency.exponentialRampToValueAtTime(Math.min(1500, f * 3.2), .4); lp.connect(g); g.connect(dest);
  [['sawtooth', -9, -.4, .5], ['sawtooth', 9, .4, .5], ['square', 0, 0, .25]].forEach(([ty, dt, x, v]) => { const o = osc(c, ty, f, dt), m = c.createGain(); m.gain.value = v; o.connect(m); m.connect(pan(c, x, lp)); o.start(0); }); }];
// LA MÉLODIE D'ASPHALTE, réécrite (« la mélodie elle-même ») : un thème qui CHANTE — des notes plus longues, une accroche qui monte et se pose
// sur la tonique (A) ; un couplet plus bas qui répond (B). Pas de double croche 0-127, degré, durée, marque — les degrés de la gamme du morceau.
const THEME_ASPHALTE = [[2, 2, 2, ''], [4, 3, 2, ''], [6, 4, 6, ''], [12, 3, 2, ''], [14, 2, 2, ''], [16, 0, 10, 'o'], [34, 2, 2, ''], [36, 3, 2, ''], [38, 4, 4, ''], [42, 5, 2, ''],
  [44, 4, 2, ''], [46, 3, 2, ''], [48, 2, 12, 'o'], [66, 3, 2, ''], [68, 4, 2, ''], [70, 5, 6, ''], [76, 4, 2, ''], [78, 3, 2, ''], [80, 2, 10, ''], [96, 4, 6, 's'], [102, 3, 2, ''],
  [104, 2, 4, ''], [108, 1, 4, ''], [112, 0, 12, 'f']];
const COUPLET_ASPHALTE = [[0, 0, 2, ''], [2, 0, 2, ''], [4, 2, 4, ''], [8, 1, 2, ''], [10, 0, 2, ''], [12, -1, 4, ''], [16, 0, 8, 'o'], [32, 2, 2, ''], [34, 2, 2, ''], [36, 3, 4, ''],
  [40, 2, 2, ''], [42, 1, 2, ''], [44, 0, 4, ''], [48, 1, 8, 'o'], [64, 0, 2, ''], [66, 0, 2, ''], [68, 2, 4, ''], [72, 3, 2, ''], [74, 4, 2, ''], [76, 3, 4, ''], [80, 2, 8, ''],
  [96, 1, 4, ''], [100, 2, 4, ''], [104, 0, 8, ''], [112, -1, 8, '']];
// LA COURBE DE LÉO (16/10) : un premier instrument qui tient SEUL (pas « trop léger » au départ), des échos qui rêvent vers le 11, dynamique dès 15,
// le climax sur les derniers (le final au 29), et au 30 la mélodie une octave plus haut (« augmenter le registre, plus fort émotionnellement »).
// `tete` : les premiers moteurs, dans l'ordre (les sons neufs ENTRENT TÔT, sinon on ne les entend qu'au 12e) ; `sans` : ce qu'on ne veut plus.
// `depart` (dB, lu par la bibliothèque et par le jeu) : le générateur v6 recule tout de −10 dB au 1er moteur (rattrapé au 18e) — le départ était
// presque inaudible (−35 dB) ; on le compense, le même +10 dB qui s'efface jusqu'au 18e : il démarre comme TONNERRE DELUXE, et monte encore.
const courbeLeo = (Mx, tete, sans) => { const hors = new Set(['i_sommet', 'final', 'i_large', 'i_sature'].concat(sans || [])), t9 = (tete || []).filter(x => !hors.has(x));
  let o = t9.concat(Mx.ordre.filter(x => !hors.has(x) && !t9.includes(x))); o = o.slice(0, 28); o.push('final', 'i_sommet'); Mx.ordre = o; };

const VOIX_IMPRO = () => [.8, [50, 53, 56, 59, 62, 65, 68, 71, 74, 77], (c, f) => {
  const m = Math.round(12 * Math.log2(f / 440) + 69), V = VOYELLES[(m * 7) % VOYELLES.length], tombe = m % 3 === 0;
  const g = env(c, .015, .42, .3, .5), lp = filtre(c, 'lowpass', 3000, .6, g), hp = filtre(c, 'highpass', 260, .7, lp), ws = c.createWaveShaper(); ws.curve = douce(2.2); ws.connect(hp);
  const som = c.createGain();
  V.forEach((fr, k) => { const bp = c.createBiquadFilter(), mg = c.createGain(); bp.type = 'bandpass'; bp.frequency.value = fr; bp.Q.value = [6, 8, 9][k]; mg.gain.value = [1, .5, .14][k]; som.connect(bp); bp.connect(mg); mg.connect(ws); });
  [[-7, -.3], [7, .3]].forEach(([dt, x]) => { const o = osc(c, 'sawtooth', f, dt); o.frequency.setValueAtTime(f * Math.pow(2, -1.5 / 12), 0); o.frequency.exponentialRampToValueAtTime(f, .07);
    if (tombe) { o.frequency.setValueAtTime(f, .45); o.frequency.exponentialRampToValueAtTime(f * Math.pow(2, -3 / 12), .72); }
    o.connect(pan(c, x, som)); o.start(0); });
  souffle(c, 2500, 1.5, .05, .12, g); }, 2];

// ---------------------------------------------------------------- les aides de retouche
const insere = (Mx, id, moteur, sans) => { const o = Mx.ordre.filter(x => x !== id); o.splice(Math.max(0, Math.min(o.length, moteur - 1)), 0, id);
  for (const x of sans || []) { if (o.length <= 30) break; const k = o.lastIndexOf(x); if (k >= 0 && x !== id) o.splice(k, 1); }
  Mx.ordre = o.slice(0, 30); if (o.includes('final') && !Mx.ordre.includes('final')) Mx.ordre[29] = 'final'; };   // (le final reste le 30e, toujours)
const remplaceDans = (Mx, vieux, neuf) => { const k = Mx.ordre.indexOf(vieux); if (k >= 0 && !Mx.ordre.includes(neuf)) Mx.ordre[k] = neuf; };
const toutesLesGrilles = Mx => [...(Mx.grilles || []).flat(), ...(Mx.grilleF || []), ...(Mx.accords || [])];
const ordreNeuf = (Mx, tete) => { const vu = new Set(tete), o = tete.concat(Mx.ordre.filter(x => !vu.has(x) && x !== 'final')).slice(0, 29); o.push('final'); Mx.ordre = o; };
// de nouveaux accords (v6) : les grilles refaites et MENÉES comme celles du générateur, la liste des accords à préparer refaite aussi
const grillesNeuves = (Mx, O, specs) => { if (!O || !O.menes) return; Mx.grillesSpec = specs; Mx.grilles = specs.map(s9 => O.menes(s9.split(' '), Mx)); Mx.vamp = false;
  Mx.accords = []; const vu = new Set(); [...Mx.grilles, Mx.grilleF].forEach(g => (g || []).forEach(A => { if (!vu.has(A.cle)) { vu.add(A.cle); Mx.accords.push(A); } })); };
const motif = (Mx, k, L) => { Mx.pat[k] = L; if (Mx.patL) Mx.patL[k] = L; };   // (le générateur retire parfois une variante : la retouche les fige)
const nomme = (O, cat, cle, nom) => { const T = O && O[cat]; if (T && !T[cle]) T[cle] = nom; };

// ---------------------------------------------------------------- LES RETOUCHES (base = le numéro de la musique 👍 ; note = la consigne de Léo)
export const V2 = [
  { id: 'bleu-1540-retouche', base: 1540, direct: true, titre: 'CAVALE ULTRA',
    note: 'ajoute un arpège un peu sci-fi qui danse autour du lead quelque part, ça dort trop au niv 15',
    idee: 'un arpège sci-fi AJOUTÉ (une goutte de synthé qui bippe), il entre au 15e moteur, là où ça dormait',
    voix: { pluck: ARP_SF },
    retouche(Mx) { insere(Mx, 'arp', 15, ['perc', 'vinyl', 'octave']); if (Mx.pat) Mx.pat.arp = 'updown16'; } },

  { id: 'bleu-2221-retouche', base: 2221, direct: true, titre: 'COBRA ULTRA',
    note: 'affiner instruments un peu brut',
    idee: 'les MÊMES instruments, affinés : le clavinet sans grattement, le talkbox sans grain, la nappe de scies plus douce, les accords hachés moins tranchants',
    voix: { lead: TALKBOX_VELOURS }, acc: { keys: CLAV_FIN },
    retouche(Mx) { const t = Mx.tim; t.padFc = Math.min(t.padFc, 1000); t.padAtt = Math.max(t.padAtt, .6); t.padLarge = Math.min(t.padLarge, 11); t.sfc = Math.min(t.sfc * .75, 1900); } },

  { id: 'bleu-4830-v2', base: 4830, titre: 'FLAMME DE TONNERRE · V2',
    note: 'instrument lead aigu plus original dans le timbre, faire une V2 à côté',
    idee: 'un nouveau timbre aigu pour la mélodie : le verre chantant (un « ting » de cloche, puis une voix « i » qui tient)',
    voix: { lead: VERRE_CHANTANT },
    retouche(Mx, O) { nomme(O, 'NOM_LEAD', 'verreChantant', 'verre chantant'); Mx.tim.lead = 'verreChantant'; } },

  { id: 'bleu-3067-retouche', base: 3067, direct: true, titre: 'MIRAGE DE VITESSE',
    note: 'embellir, ça fait un peu cirque enfant, ou alors jouer là-dessus et affiner, direct dessus, surtout le début',
    idee: 'embellie, surtout le début : il s’ouvre sur l’arpège et la nappe (la mélodie arrive au 7e), synthé scie au lieu du cuivre, Rhodes au lieu de l’orgue, violon en contre-chant, les cuivres repoussés',
    retouche(Mx) {
      const tete = ['arp', 'pad', 'basse', 'kick', 'sig', 'hat', 'lead', 'snare', 'i_filtre'];
      const reste = Mx.ordre.filter(x => !tete.includes(x) && x !== 'cuivres'); reste.splice(Math.max(0, reste.indexOf('clarte') + 1), 0, 'cuivres');
      Mx.ordre = tete.concat(reste).slice(0, 30);
      Mx.tim.lead = 'scie'; Mx.tim.keys = 'rhodes'; Mx.tim.contre = 'violon'; } },

  { id: 'bleu-9551-v2', base: 9551, titre: 'NÉNUPHARS VELOURS · V2',
    note: 'renommer nénuphars velours, et tenter une V2 qui prend en compte ce changement de nom (une invitation à designer avec moi)',
    idee: 'à dessiner ensemble — 1re esquisse : l’eau et le velours, des gouttes de verre au lieu de la sirène, la basse qui roule, la nappe douce, un peu plus lent',
    retouche(Mx) {
      Mx.tim.lead = 'saxo'; Mx.tim.basse = 'roule'; Mx.tim.pad = 'doux'; Mx.tim.pluck = 'verre';
      Mx.sig = 'gouttes'; Mx.sig2 = 'vapeur'; Mx.idee = 'des gouttes de verre qui tombent sur les notes de l’accord ; plus tard, des accords à l’envers qui aspirent la mesure suivante';
      Mx.titre = 'NÉNUPHARS VELOURS'; Mx.bpm0 = Math.round(Mx.bpm0 * .93); Mx.bpm1 = Math.round(Mx.bpm1 * .93); } },

  { id: 'bleu-6167-retouche', base: 6167, direct: true, titre: 'LUNE DE JADE',
    note: 'plus asiatique dans la mélo, mais sinon ça va, mais asiatique cyberpunk',
    idee: 'asiatique cyberpunk : la mélodie dans la gamme japonaise (hirajoshi : 1, 2, ♭3, 5, ♭6), jouée au koto néon (la corde appuyée)',
    voix: { lead: KOTO_NEON },
    retouche(Mx, O) {
      const t = Mx.ton, hira = [0, 2, 3, 7, 8].map(x => (t + x) % 12);
      toutesLesGrilles(Mx).forEach(A => { if (A && Array.isArray(A.gamme)) { const g = A.gamme.filter(p => hira.includes(p)); if (g.length >= 3) A.gamme = g; } });
      nomme(O, 'NOM_LEAD', 'koto', 'koto néon'); Mx.tim.lead = 'koto'; } },

  { id: 'bleu-8338-retouche', base: 8338, direct: true, titre: 'RUBIS ULTRA',
    note: 'plus d’assaisonnement et de vie, originalité à retravailler, sinon pas mal la continuité de la boucle',
    idee: 'plus d’assaisonnement et de vie, la boucle gardée : congas et bongos, la ride, la cloche, l’espace qui s’élargit (le steel drum gardé : le vibraphone bouchait le médium, mesuré)',
    retouche(Mx) {
      insere(Mx, 'perc', 7, ['i_relance', 'i_pulse', 'i_basseOct']); insere(Mx, 'ride', 14, ['i_relance', 'i_pulse', 'i_basseOct']);   // (la ride, pas les échos de la mélodie : ils doublaient le médium, mesuré)
      insere(Mx, 'cloche', 18, ['i_relance', 'i_pulse', 'i_basseOct']); insere(Mx, 'i_large', 20, ['i_relance', 'i_pulse', 'i_basseOct', 'i_tambours']);   // (l'espace, pas les tierces : elles bouchaient le médium, mesuré)
      if (Mx.kitV) { Mx.kitV.percH = ['conga', 'quinto']; Mx.kitV.percL = ['bongoB']; Mx.kitV.shaker = ['shaker1', 'shaker2']; }
      } },

  { id: 'bleu-3379-retouche', base: 3379, direct: true, titre: 'SAUVER MAMAN',
    note: '« SAUVER MAMAN », retouche la cloche, elle est un peu fade',
    idee: 'la cloche retouchée (la harpe de verre des accords) : une vraie cloche de verre, des partiels qui sonnent longtemps, deux couches qui battent',
    acc: { keys: CLOCHE_VERRE },
    retouche(Mx) { Mx.titre = 'SAUVER MAMAN'; } },

  // (15/10, « juste respecte les consignes ») les trois musiques v6 rejouées enfin telles qu'aimées : leurs consignes appliquées
  { id: 'bleu-5095-retouche', base: 5095, direct: true, titre: 'CRISTAL D’ARGENT',
    note: 'mieux fait ta trap évolutive, dans la peau de prodmobeats',
    idee: 'une trap qui ÉVOLUE : l’intro mélodique seule (harpe, kalimba, nappe, gouttes, le son s’ouvre), puis le beat tombe — charleys, kick, 808, caisse —, les roulements et les triolets de charleys, le contre-chant, la cloche, le chœur, puis les relances jusqu’au final',
    retouche(Mx) {
      ordreNeuf(Mx, ['keys', 'lead', 'pad', 'sig', 'i_filtre', 'hat', 'kick', 'basse', 'snare', 'roll', 'i_triolet', 'hatO', 'contre', 'cloche', 'i_basse', 'choeur', 'i_frappe', 'clarte',
        'fant', 'i_dense', 'cordes', 'i_relance', 'double', 'i_basseOct', 'octave', 'i_sature', 'i_tambours', 'i_monte', 'modul']);
      motif(Mx, 'hat', 'x.x.x.x.x.xxx.x.'); motif(Mx, 'hatO', '......x.......x.'); Mx.tim.d808 = Math.min(1.6, Mx.tim.d808 * 1.15); } },

  { id: 'bleu-6200-retouche', base: 6200, direct: true, titre: 'MIRAGE ULTRA',
    note: 'complexifie, c’est un peu simple',
    idee: 'complexifiée : de vrais accords qui bougent (do m9 → la♭ maj7 → mi♭ maj7 → si♭ 7sus, au lieu d’un seul accord), l’arpège en cloche FM, le contre-chant au violon, les tierces, les accords hachés',
    retouche(Mx, O) {
      grillesNeuves(Mx, O, ['0:m9 8:maj7 3:maj7 10:7sus', '0:m9 5:m7 8:maj7 7:7sus']);
      const sans = ['i_pulse', 'i_relance', 'i_dense', 'i_tambours'];
      insere(Mx, 'arp', 7, sans); insere(Mx, 'contre', 12, sans); insere(Mx, 'harmo', 16, sans); insere(Mx, 'stab', 20, sans);
      Mx.tim.pluck = 'fm'; Mx.tim.contre = 'violon'; } },

  { id: 'bleu-5161-retouche', base: 5161, direct: true, titre: 'TURBO DE NÉON',
    note: 'plus mainstream, rendu original',
    idee: 'plus mainstream, le son gardé (la guitare grattée, la réverbe à ressort du surf) : la grosse caisse sur chaque temps, la caisse sur 2 et 4, la grille la plus connue de la pop (la m – fa – do – sol), la mélodie dès le 4e moteur, la pompe',
    retouche(Mx, O) {
      grillesNeuves(Mx, O, ['0:m 8:M 3:M 10:M', '0:m 8:M 3:M 10:M', '0:m 10:M 8:M 7:M']);
      motif(Mx, 'kick', 'X...X...X...X...'); motif(Mx, 'snare', '....X.......X...'); motif(Mx, 'hat', 'x.x.x.x.x.x.x.x.'); motif(Mx, 'hatO', '..x...x...x...x.'); Mx.swing = 0;
      ordreNeuf(Mx, ['keys', 'kick', 'hat', 'lead', 'basse', 'snare', 'sig', 'pad', 'pompe', 'i_filtre', 'contre', 'clarte', 'hatO', 'cordes', 'echo', 'cuivres', 'harmo']); } },

  { id: 'bleu-3392-retouche', base: 3392, direct: true, titre: 'PISTON DE LUXE',
    note: 'plus jouer underground comme on voulait, avec des voix improvisées par toi, son recherché (tu peux modifier, ajouter, remplacer, refondre le son comme tu veux) — un pack d’instruments viendra en plus',
    idee: 'underground : la mélodie à la cowbell (la cloche de la phonk), des voix improvisées qui changent de syllabe à chaque note dès le 6e moteur, la 808 saturée, le vinyle, le son qui se durcit plus tôt',
    voix: { contre: VOIX_IMPRO },
    retouche(Mx) {
      Mx.tim.lead = 'cowbell'; Mx.tim.basse = '808dur'; Mx.tim.contre = 'voix';
      const sans = ['i_pulse', 'i_relance', 'i_basseOct', 'i_tambours']; insere(Mx, 'vinyl', 3, sans); insere(Mx, 'contre', 6, sans); insere(Mx, 'i_sature', 12, sans); } },
  // LES DEUX SONS NEUFS (16/10) — des squelettes du générateur v6-0 hors de la DA CASH CAR (atlas : la house ; dubstep : le chillstep), habillés
  // de timbres que la bibliothèque n'avait jamais joués.
  { id: 'bleu-1259-neuf', base: 1259, direct: true, titre: 'ASPHALTE D’ÉMERAUDE',
    note: 'surprends-moi : de nouveaux sons, de nouveaux instruments (16/10)',
    idee: 'house de nuit en mi mineur : les accords deep house, une mélodie qui chante (réécrite), la basse aux doigts, le chœur « ah » qui chante la mélodie, le piano électrique à lames en arpège, les vrais violons ; au 30, la mélodie une octave plus haut',
    voix: { lead: VOIX_AH, pluck: RHODES_LAMES }, acc: { keys: ACCORDS_DEEP },
    retouche(Mx, O) { nomme(O, 'NOM_LEAD', 'choeurAh', 'le chœur « ah »'); nomme(O, 'NOM_PLUCK', 'rhodesLames', 'le piano électrique à lames'); nomme(O, 'NOM_KEYS', 'accordsDeep', 'les accords deep house');
      Object.assign(Mx.tim, { lead: 'choeurAh', pluck: 'rhodesLames', keys: 'accordsDeep', pad: '@violons', basse: 'doigts' });
      if (Mx.motifs) { Mx.motifs[0] = THEME_ASPHALTE.map(x => x.slice()); if (Mx.motifs[1]) Mx.motifs[1] = COUPLET_ASPHALTE.map(x => x.slice()); }
      courbeLeo(Mx, ['keys', 'basse', 'kick', 'arp', 'hat', 'lead', 'snare', 'pad', 'stab', 'sig', 'echo', 'pompe', 'hatO', 'choeur', 'i_frappe', 'clarte']); }, depart: 6 },   // (mesuré : +10 l'aplatissait, du 3 au 22 au même niveau)
];
