// LE BANC DE L'AMORCE (2026-11-17, qualité · lot lenteur, 2e tour) — sans navigateur, sans son : la VRAIE VERSION PRINCIPALE/sfx.js sur un faux AudioContext
// qui note chaque nœud, chaque branchement, chaque valeur et chaque automation de gain. On prouve :
//  1. l'amorce joue moteur.palier UNE fois, par un gain posé à 0 avant tout branchement et jamais changé (aucune automation) : rien ne s'entend ;
//  2. elle ne part pas si le jeu dit non (effets coupés, page cachée, partie lancée : la fonction amorceOk de console-son.js) ;
//  3. elle ne part pas en course (CCSON.enCourse), même au premier son qui réveille le contexte, et repart au menu suivant ;
//  4. contexte endormi : elle attend, puis part au premier son joué au menu ;
//  5. le vrai play('moteur.palier') qui suit n'est bloqué ni par la polyphonie (max 1) ni par le délai (cd).
// Usage : node outils/banc-lenteur/amorce.cjs   (sortie 1 si une preuve casse)
const fs = require('fs'), path = require('path'), vm = require('vm');
const SRC = fs.readFileSync(path.join(__dirname, '../../VERSION PRINCIPALE/sfx.js'), 'utf8');
function monde() {
  const log = [];
  function P(nom) { const p = { _v: 0, nom, auto: [], setValueAtTime(v) { p.auto.push(['set', v]); }, setTargetAtTime(v) { p.auto.push(['target', v]); }, cancelScheduledValues() { p.auto.push(['cancel']); }, linearRampToValueAtTime(v) { p.auto.push(['lin', v]); }, exponentialRampToValueAtTime(v) { p.auto.push(['exp', v]); } };
    Object.defineProperty(p, 'value', { get() { return p._v; }, set(v) { p.ecrit = (p.ecrit || []); p.ecrit.push({ v, branche: !!(p.noeud && p.noeud.to) }); p._v = v; } }); return p; }
  function N(t) { const n = { t, to: null, connect(x) { (n.to = n.to || []).push(x); return x; }, disconnect() { }, start(a, b) { log.push({ e: 'start', n, a, b }); }, stop(a) { log.push({ e: 'stop', n, a }); }, buffer: null };
    for (const k of ['gain', 'delayTime', 'frequency', 'Q', 'playbackRate', 'detune', 'threshold', 'knee', 'ratio', 'attack', 'release', 'pan']) { n[k] = P(k); n[k].noeud = n; } return n; }
  function fbuf(id) { return { id, duration: 1, length: 32000, numberOfChannels: 1, sampleRate: 32000, getChannelData() { return new Float32Array(32000).fill(.1); } }; }
  class AC { constructor() { this.currentTime = 1; this.state = 'running'; this.destination = N('dest'); this.sampleRate = 32000; }
    createGain() { return N('gain'); } createDelay() { return N('delay'); } createBiquadFilter() { return N('bq'); } createConvolver() { return N('conv'); } createDynamicsCompressor() { return N('comp'); } createStereoPanner() { return N('pan'); } createWaveShaper() { return N('ws'); }
    createBuffer() { return fbuf('ir'); } createBufferSource() { const s = N('src'); log.push({ e: 'src', n: s }); return s; } decodeAudioData(ab, ok) { const id = 'b' + (++AC.n); setTimeout(() => ok(fbuf(id)), 5); } }
  AC.n = 0;
  const m = { 'moteur.palier': { bus: 'rec', db: 4, max: 1, cd: 1, v: 1, key: 1, bases: [0], grp: 'r', prio: 5, pre: 0, fam: 'machine' }, 'ui.tap': { bus: 'ui', db: 0, max: 2, cd: 0, v: 1, bases: [0], pre: 0, fam: 'ui' } };
  const d = { 'moteur.palier#0#0': 'AAAA', 'ui.tap#0#0': 'AAAA' };
  const G = { CCSON_BANQUE: { m, d, sr: 32000 }, OfflineAudioContext: AC, location: { search: '' }, performance, setTimeout, clearTimeout, setInterval: () => 0, atob: s => Buffer.from(s, 'base64').toString('binary'), console };
  G.window = G; vm.createContext(G); vm.runInContext(SRC, G);
  const ac = new AC(); G.CCSON.init(ac, ac.createGain()); G.CCSON.chauffe(['moteur.palier', 'ui.tap'], true);
  return { G, ac, log };
}
const dort = ms => new Promise(r => setTimeout(r, ms));
function marque(log) { /* une source d'amorce = une source jouée dont le gain suivant est à 0 et ne bouge jamais */
  const S = log.filter(x => x.e === 'start' && x.n.t === 'src'); return S.map(x => { const g = x.n.to && x.n.to[0]; return { g, src: x.n, gain0: g && g.gain._v === 0 && !(g.gain.ecrit || []).some(w => w.v !== 0) && g.gain.auto.length === 0, posAvant: g && (g.gain.ecrit || []).every(w => !w.branche), stop: (log.find(y => y.e === 'stop' && y.n === x.n) || {}).a, a: x.a }; }); }
const P = {}, casse = [];
(async () => {
  { /* 1. au menu, son allumé */ const W = monde(); let ok = true; W.G.CCSON.amorce(['moteur.palier'], () => ok); await dort(600);
    const e = W.G.CCSON.etat(), M = marque(W.log);
    P.menu = { amorces: e.amorces, sources: M.length, gainZero: M.every(x => x.gain0), gainPoseAvantBranchement: M.every(x => x.posAvant), dureeMs: M.map(x => Math.round((x.stop - x.a) * 1000)) };
    if (e.amorces !== 1 || M.length !== 1 || !M[0].gain0 || !M[0].posAvant) casse.push('1 : amorce au menu');
    const r = W.G.CCSON.play('moteur.palier', { vol: -10 }); P.menu.vraiPlayApres = !!r; if (!r) casse.push('5 : vrai play bloqué'); }
  { /* 2. son coupé (le jeu dit non), puis rallumé */ const W = monde(); let ok = false; W.G.CCSON.amorce(['moteur.palier'], () => ok); await dort(600);
    const a = W.G.CCSON.etat(); P.sonCoupe = { amorces: a.amorces, refusees: a.amorcesRefusees, sources: marque(W.log).length };
    if (a.amorces !== 0 || marque(W.log).length !== 0) casse.push('2 : amorce avec le son coupé');
    ok = true; W.G.CCSON.play('ui.tap'); await dort(400); P.sonCoupe.apresRallume = W.G.CCSON.etat().amorces; if (P.sonCoupe.apresRallume !== 1) casse.push('2 : pas d\'amorce une fois rallumé'); }
  { /* 3. contexte endormi, réveillé EN COURSE : rien ; au menu : oui */ const W = monde(); W.ac.state = 'suspended'; W.G.CCSON.amorce(['moteur.palier'], () => true); await dort(400);
    P.course = { endormi: W.G.CCSON.etat().amorces }; W.ac.state = 'running'; W.G.CCSON.debutCourse(); W.G.CCSON.play('ui.tap'); await dort(400);
    P.course.enCourse = W.G.CCSON.etat().amorces; P.course.sourcesEnCourse = marque(W.log).filter(x => x.g && x.gain0).length;
    W.G.CCSON.finCourse(); W.G.CCSON.play('ui.tap'); await dort(400); P.course.auMenu = W.G.CCSON.etat().amorces;
    if (P.course.endormi !== 0 || P.course.enCourse !== 0 || P.course.auMenu !== 1) casse.push('3 : amorce en course ou jamais'); }
  { /* 4. contexte endormi au menu : attend, puis part au 1er son */ const W = monde(); W.ac.state = 'suspended'; W.G.CCSON.amorce(['moteur.palier'], () => true); await dort(400);
    const av = W.G.CCSON.etat().amorces; W.ac.state = 'running'; W.G.CCSON.play('ui.tap'); await dort(400); P.endormi = { avant: av, apresPremierSon: W.G.CCSON.etat().amorces };
    if (av !== 0 || P.endormi.apresPremierSon !== 1) casse.push('4 : contexte endormi'); }
  console.log(JSON.stringify(P, null, 1)); console.log(casse.length ? 'CASSÉ :\n  ' + casse.join('\n  ') : 'AMORCE : toutes les preuves tiennent.');
  process.exit(casse.length ? 1 : 0);
})();
