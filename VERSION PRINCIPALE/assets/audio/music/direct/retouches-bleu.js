// retouches-bleu.js — LES V2 DE POUCE BLEU (2026-10-15, pôle SON ; Léo, dans les notes de la bibliothèque : « lis mes modifs, applique, rends
// la nouvelle version »). Une V2 = la MÊME musique 👍 (même version du générateur, même numéro, mêmes goûts), retouchée juste après sa
// composition : `retouche(Mx, O)` change l'ordre des 30 moteurs, les timbres, la gamme de la mélodie… ; `voix[nom]` / `acc[nom]`
// remplacent un instrument (fabriqués ici, en Web Audio pur, rendus hors ligne par le générateur comme les siens). L'original ne change
// pas : la bibliothèque pose la V2 juste sous lui. Le générateur reçoit tout par start(n, W, { retouche, voix, acc }).
// Les noms : RENOMS (les « renommer … » des notes), lus par la bibliothèque si Léo n'a pas renommé lui-même.

export const RENOMS = { 'bleu-9664': 'MIRAGE', 'bleu-8154': 'FIRE PRIME', 'bleu-9551': 'NÉNUPHARS VELOURS', 'bleu-3379': 'SAUVER MAMAN' };

// ---------------------------------------------------------------- petits outils (Web Audio pur : ils ne dépendent d'aucune version)
const sortie = c => c.destination;
function env(c, a, h, r, v, dest) { const g = c.createGain(); g.gain.setValueAtTime(.0001, 0); g.gain.linearRampToValueAtTime(v, a); g.gain.setValueAtTime(v, h); g.gain.linearRampToValueAtTime(.0001, h + r); g.connect(dest || sortie(c)); return g; }
function decroit(c, a, d, v, dest) { const g = c.createGain(); g.gain.setValueAtTime(.0001, 0); g.gain.exponentialRampToValueAtTime(v, a); g.gain.exponentialRampToValueAtTime(.0001, a + d); g.connect(dest || sortie(c)); return g; }
const osc = (c, type, f, dt) => { const o = c.createOscillator(); o.type = type; o.frequency.value = f; if (dt) o.detune.value = dt; return o; };
const pan = (c, x, dest) => { const p = c.createStereoPanner(); p.pan.value = x; p.connect(dest); return p; };
function filtre(c, type, f, q, dest) { const b = c.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q || .7; b.connect(dest); return b; }
function vibrato(c, vit, cents, dep) { const l = osc(c, 'sine', vit), g = c.createGain(); g.gain.setValueAtTime(0, 0); g.gain.setValueAtTime(0, dep); g.gain.linearRampToValueAtTime(cents, dep + .4); l.connect(g); l.start(0); return g; }
function souffle(c, f, q, v, dur, dest) { const n = Math.ceil(c.sampleRate * (dur + .05)), b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  const s = c.createBufferSource(), g = env(c, .05, dur * .6, dur * .4, v, dest); s.buffer = b; s.connect(filtre(c, 'bandpass', f, q, g)); s.start(0); }
function douce(k) { const a = new Float32Array(1024); for (let i = 0; i < 1024; i++) { const x = i / 511.5 - 1; a[i] = Math.tanh(k * x) / Math.tanh(k); } return a; }

// ---------------------------------------------------------------- les instruments des V2
// L'ARPÈGE SCI-FI (CAVALE ULTRA) : une goutte de synthé qui « bippe » — la note part une octave au-dessus et tombe sur sa hauteur en 18 ms,
// carré + scie dans un filtre résonant qui se referme, un anneau de modulation discret (le métal des films de SF), étalée gauche / droite.
const ARP_SF = () => [.55, [60, 72, 84], (c, f) => {
  const g = decroit(c, .004, .42, .5), fl = filtre(c, 'lowpass', f * 9, 7, g); fl.frequency.setValueAtTime(f * 9, 0); fl.frequency.exponentialRampToValueAtTime(f * 1.6, .22);
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
// scie et un triangle dans un passe-bande qui se referme, une octave basse carrée et un grain saturé : l'Asie, mais dans une ville de néon.
const KOTO_NEON = () => [1.3, [60, 72, 84], (c, f) => {
  const g = decroit(c, .003, 1.1, .55), ws = c.createWaveShaper(); ws.curve = douce(1.8); ws.connect(g);
  const bp = filtre(c, 'bandpass', f * 3, 1.1, ws); bp.frequency.setValueAtTime(f * 5, 0); bp.frequency.exponentialRampToValueAtTime(f * 1.8, .5);
  [['sawtooth', .8, -.25], ['triangle', 1, .25]].forEach(([ty, v, x]) => { const o = osc(c, ty, f), m = c.createGain(); m.gain.value = v;
    o.frequency.setValueAtTime(f * Math.pow(2, 1 / 12), 0); o.frequency.exponentialRampToValueAtTime(f, .09); o.connect(m); m.connect(pan(c, x, bp)); o.start(0); });
  const o2 = osc(c, 'square', f / 2), g2 = decroit(c, .004, .5, .09, g); o2.connect(g2); o2.start(0); }, 2];

// LA CLOCHE DE VERRE (SAUVER MAMAN) : la harpe de verre devient une vraie cloche — FM à rapport inharmonique (3,51), des partiels qui
// s'éteignent chacun à leur vitesse, deux couches désaccordées gauche / droite qui battent doucement : elle sonne longtemps, elle brille.
const CLOCHE_VERRE = () => [3.2, 44100, (c, f, dest) => {
  const out = dest || sortie(c);
  [[-4, -.5], [4, .5]].forEach(([dt, x]) => { const p = pan(c, x, out);
    [[1, .3, 2.6], [2.76, .12, 1.2], [5.4, .06, .6], [8.9, .025, .3]].forEach(([r, v, d]) => { const o = osc(c, 'sine', f * r, dt), g = decroit(c, .003, d, v, p); o.connect(g); o.start(0); });
    const car = osc(c, 'sine', f, dt), mod = osc(c, 'sine', f * 3.51), mg = c.createGain(), cg = decroit(c, .002, 1.4, .18, p);
    mg.gain.setValueAtTime(f * 2.2, 0); mg.gain.exponentialRampToValueAtTime(f * .1, 1.2); mod.connect(mg); mg.connect(car.frequency); car.connect(cg); car.start(0); mod.start(0); }); }];

// ---------------------------------------------------------------- les aides de retouche
const insere = (Mx, id, moteur, sans) => { const o = Mx.ordre.filter(x => x !== id); o.splice(Math.max(0, Math.min(o.length, moteur - 1)), 0, id);
  for (const x of sans || []) { if (o.length <= 30) break; const k = o.lastIndexOf(x); if (k >= 0 && x !== id) o.splice(k, 1); }
  Mx.ordre = o.slice(0, 30); };
const remplaceDans = (Mx, vieux, neuf) => { const k = Mx.ordre.indexOf(vieux); if (k >= 0 && !Mx.ordre.includes(neuf)) Mx.ordre[k] = neuf; };
const toutesLesGrilles = Mx => [...(Mx.grilles || []).flat(), ...(Mx.grilleF || []), ...(Mx.accords || [])];
const nomme = (O, cat, cle, nom) => { const T = O && O[cat]; if (T && !T[cle]) T[cle] = nom; };

// ---------------------------------------------------------------- LES V2 (base = le numéro de la musique 👍)
export const V2 = [
  { id: 'bleu-1540-v2', base: 1540, titre: 'CAVALE ULTRA · V2',
    idee: 'un arpège sci-fi qui danse autour de la mélodie, il arrive au 15e moteur (là où ça dormait)',
    voix: { pluck: ARP_SF },
    retouche(Mx) { insere(Mx, 'arp', 15, ['perc', 'vinyl', 'octave']); if (Mx.pat) Mx.pat.arp = 'updown16'; } },

  { id: 'bleu-2221-v2', base: 2221, titre: 'COBRA ULTRA · V2',
    idee: 'les instruments peaufinés : le Rhodes à la place du clavinet, un talkbox velours (sans le grain brut)',
    voix: { lead: TALKBOX_VELOURS },
    retouche(Mx) { Mx.tim.keys = 'rhodes'; } },

  { id: 'bleu-4830-v2', base: 4830, titre: 'FLAMME DE TONNERRE · V2',
    idee: 'un nouveau timbre aigu pour la mélodie : le verre chantant (un « ting » de cloche, puis une voix « i » qui tient)',
    voix: { lead: VERRE_CHANTANT },
    retouche(Mx, O) { nomme(O, 'NOM_LEAD', 'verreChantant', 'verre chantant'); Mx.tim.lead = 'verreChantant'; } },

  { id: 'bleu-3067-v2', base: 3067, titre: 'MIRAGE DE VITESSE · V2',
    idee: 'embellie, plus de cirque : le début s’ouvre sur la nappe et l’arpège (la mélodie arrive au 7e), synthé scie au lieu du cuivre, Rhodes au lieu de l’orgue, violon au lieu de l’orgue en contre-chant, les cuivres repoussés',
    retouche(Mx) {
      const tete = ['pad', 'arp', 'basse', 'kick', 'sig', 'hat', 'lead', 'snare', 'i_filtre'];
      const reste = Mx.ordre.filter(x => !tete.includes(x) && x !== 'cuivres'); reste.splice(Math.max(0, reste.indexOf('clarte') + 1), 0, 'cuivres');
      Mx.ordre = tete.concat(reste).slice(0, 30);
      Mx.tim.lead = 'scie'; Mx.tim.keys = 'rhodes'; Mx.tim.contre = 'violon'; } },

  { id: 'bleu-9551-v2', base: 9551, titre: 'NÉNUPHARS VELOURS · V2',
    idee: 'sur le nouveau nom : l’eau et le velours — la flûte au lieu du synthé scie, des gouttes de verre au lieu de la sirène, la basse qui roule au lieu de l’acid, la nappe douce, un peu plus lent (une première idée : à dessiner ensemble)',
    retouche(Mx) {
      Mx.tim.lead = '@flute'; Mx.tim.basse = 'roule'; Mx.tim.pad = 'doux'; Mx.tim.pluck = 'verre';
      Mx.sig = 'gouttes'; Mx.sig2 = 'vapeur'; Mx.idee = 'des gouttes de verre qui tombent sur les notes de l’accord ; plus tard, des accords à l’envers qui aspirent la mesure suivante';
      Mx.titre = 'NÉNUPHARS VELOURS'; Mx.bpm0 = Math.round(Mx.bpm0 * .93); Mx.bpm1 = Math.round(Mx.bpm1 * .93); } },

  { id: 'bleu-6167-v2', base: 6167, titre: 'LUNE DE JADE · V2',
    idee: 'asiatique cyberpunk : la mélodie dans la gamme japonaise (hirajoshi : 1, 2, ♭3, 5, ♭6), jouée au koto néon (la corde appuyée)',
    voix: { lead: KOTO_NEON },
    retouche(Mx, O) {
      const t = Mx.ton, hira = [0, 2, 3, 7, 8].map(x => (t + x) % 12);
      toutesLesGrilles(Mx).forEach(A => { if (A && Array.isArray(A.gamme)) { const g = A.gamme.filter(p => hira.includes(p)); if (g.length >= 3) A.gamme = g; } });
      nomme(O, 'NOM_LEAD', 'koto', 'koto néon'); Mx.tim.lead = 'koto'; } },

  { id: 'bleu-8338-v2', base: 8338, titre: 'RUBIS ULTRA · V2',
    idee: 'plus d’assaisonnement et de vie, la boucle gardée : congas, échos, la cloche, l’harmonie plus tôt, le vibraphone à la place du steel drum',
    retouche(Mx) {
      insere(Mx, 'perc', 7, ['i_relance', 'i_pulse', 'i_basseOct']); insere(Mx, 'echo', 14, ['i_relance', 'i_pulse', 'i_basseOct']);
      insere(Mx, 'cloche', 18, ['i_relance', 'i_pulse', 'i_basseOct']); insere(Mx, 'harmo', 20, ['i_relance', 'i_pulse', 'i_basseOct']);
      if (Mx.kitV) { Mx.kitV.percH = ['conga', 'quinto']; Mx.kitV.percL = ['congaTape']; Mx.kitV.shaker = ['shaker1', 'shaker2']; }
      Mx.tim.lead = '@vibraphone'; } },

  { id: 'bleu-3379-v2', base: 3379, titre: 'SAUVER MAMAN · V2',
    idee: 'la cloche retouchée : la harpe de verre devient une vraie cloche de verre (partiels qui sonnent longtemps, deux couches qui battent)',
    acc: { keys: CLOCHE_VERRE },
    retouche(Mx) { Mx.titre = 'SAUVER MAMAN'; } },
];
