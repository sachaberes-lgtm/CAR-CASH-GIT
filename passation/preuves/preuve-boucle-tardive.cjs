#!/usr/bin/env node
/* PREUVE — UNE BOUCLE DEMANDÉE AVANT SON DÉCODAGE NE PART PAS ORPHELINE (2026-11-05, DEBUG-TOTAL)
   usage : node passation/preuves/preuve-boucle-tardive.cjs <sfx.js corrigé> [sfx.js ancien]
   LES SONS À LA DEMANDE (sfx.js v9) : un son pas encore décodé est demandé en priorité et JOUÉ EN RETARD s'il arrive dans les 120 ms. Pour un son
   ponctuel c'est voulu. Pour une BOUCLE (fig.slide, spin.roule, ambiances), l'appelant a reçu null : il n'a pas de poignée, ne pourra jamais
   l'arrêter, et la boucle tourne jusqu'à ce qu'un autre son du même nom la remplace (le slide qui frotte pour toujours, les rouleaux du Final Spin).
   Le VRAI sfx.js tourne dans un vm avec un contexte factice ; on compte les sources EN BOUCLE démarrées sans poignée. Dernière ligne : PREUVE OK / KO. */
'use strict';
const fs = require('fs'), vm = require('vm');
async function essai(chemin) {
  const prm = () => ({ value: 0, setValueAtTime() {}, setTargetAtTime() {}, cancelScheduledValues() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {} });
  const sources = [];
  const tampon = () => ({ duration: 2, length: 64000, numberOfChannels: 1, sampleRate: 32000, getChannelData: () => { const d = new Float32Array(64000); d.fill(.3, 1200); return d; } });
  const noeud = () => ({ connect() {}, disconnect() {}, gain: prm(), frequency: prm(), Q: prm(), delayTime: prm(), pan: prm(), playbackRate: prm(), buffer: null, loop: false, loopStart: 0, loopEnd: 0, normalize: true, addEventListener() {}, onended: null,
    start() { sources.push(this); this.parti = true; }, stop() { this.arrete = true; } });
  const ac = { currentTime: 1, sampleRate: 48000, destination: noeud(), createGain: noeud, createBiquadFilter: noeud, createConvolver: noeud, createDelay: noeud, createStereoPanner: noeud, createBufferSource: noeud,
    createBuffer: (c, n, r) => ({ getChannelData: () => new Float32Array(n), duration: n / r, length: n, numberOfChannels: c, sampleRate: r }) };
  const decodes = [];
  function OC() { return { decodeAudioData(ab, ok) { decodes.push(() => ok(tampon())); } }; }
  const B = { sr: 32000, tete: .03, m: { 'fig.slide': { bus: 'fx', db: -8, max: 1, cd: .1, v: 1, rj: 0, vj: 0, key: 0, bases: [0], grp: null, prio: 0, cede: 0, pre: 0, lg: 1 },
    'ui.tap': { bus: 'ui', db: -8, max: 4, cd: 0, v: 1, rj: 0, vj: 0, key: 0, bases: [0], grp: null, prio: 0, cede: 0, pre: 1 } },
    d: { __etalon: 'AAAA', 'fig.slide#0#0': 'AAAA', 'ui.tap#0#0': 'AAAA' } };
  const G = { CCSON_BANQUE: B, OfflineAudioContext: OC, location: { search: '' }, document: { documentElement: { dataset: {} }, createElement: () => ({}), head: { appendChild() {} } },
    atob: s => Buffer.from(s, 'base64').toString('binary'), setInterval: () => 0, setTimeout: f => 0, requestIdleCallback: () => 0, performance: { now: () => Date.now() }, CC_COLONNE: true };
  G.window = G; G.globalThis = G;
  const ctx = vm.createContext(G); vm.runInContext(fs.readFileSync(chemin, 'utf8'), ctx, { filename: 'sfx.js' });
  const C = G.CCSON; C.init(ac, noeud());
  const vide = () => { let n = 0; while (decodes.length && n++ < 50) decodes.shift()(); };
  vide();                                                               // l'étalon et les sons gardés (ui.*, pre:1)
  const h = C.play('fig.slide', { loop: true, force: true });         // le slide commence : son pas encore décodé
  const avant = sources.length; vide();                                 // le décodage arrive dans les 120 ms
  const orphelines = sources.slice(avant).filter(s => s.loop && !s.arrete).length;
  return { poignee: !!h, orphelines, ok: !h && orphelines === 0 };
}
(async () => {
  const [neuf, vieux] = process.argv.slice(2);
  if (!neuf) { console.log('usage : node preuve-boucle-tardive.cjs <sfx.js corrigé> [ancien]'); process.exit(2); }
  const N = await essai(neuf); console.log('corrigé :', JSON.stringify(N));
  if (vieux) console.log('ancien  :', JSON.stringify(await essai(vieux)));
  console.log(N.ok ? 'PREUVE OK' : 'PREUVE KO'); process.exit(N.ok ? 0 : 1);
})().catch(e => { console.log('ERREUR', e && e.stack); process.exit(1); });
