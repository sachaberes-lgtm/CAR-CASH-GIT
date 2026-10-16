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
];
