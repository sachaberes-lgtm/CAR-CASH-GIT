#!/usr/bin/env node
/* PREUVE — LA VITESSE DE LECTURE D'UN SON RESTE DANS UNE PLAGE SAINE (2026-11-08, sortie du jeu, SON-14)
   usage : node outils/banc-son/preuve-sfx-rate.cjs <sfx.js corrigé> [sfx.js ancien]
   Le VRAI sfx.js tourne dans un vm avec un contexte factice (même bac que passation/preuves/preuve-boucle-tardive.cjs). On joue un son avec
   o.rate = NaN, 0, −3, 1e9, 1, 0,8 : la vitesse posée sur la source (playbackRate.value) doit être finie, > 0 et ≤ 16 ; les vraies valeurs
   (0,8 · 1) ne bougent pas. Dernière ligne : PREUVE OK / PREUVE KO. */
'use strict';
const fs = require('fs'), vm = require('vm');
function essai(chemin) {
  const prm = () => ({ value: 0, setValueAtTime() {}, setTargetAtTime() {}, cancelScheduledValues() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {} });
  const sources = [];
  const tampon = () => ({ duration: 2, length: 64000, numberOfChannels: 1, sampleRate: 32000, getChannelData: () => { const d = new Float32Array(64000); d.fill(.3, 1200); return d; } });
  const noeud = () => ({ connect() {}, disconnect() {}, gain: prm(), frequency: prm(), Q: prm(), delayTime: prm(), pan: prm(), playbackRate: prm(), buffer: null, loop: false, loopStart: 0, loopEnd: 0, normalize: true, addEventListener() {}, onended: null,
    start() { sources.push(this); this.parti = true; }, stop() { this.arrete = true; } });
  const ac = { currentTime: 1, sampleRate: 48000, destination: noeud(), createGain: noeud, createBiquadFilter: noeud, createConvolver: noeud, createDelay: noeud, createStereoPanner: noeud, createBufferSource: noeud,
    createBuffer: (c, n, r) => ({ getChannelData: () => new Float32Array(n), duration: n / r, length: n, numberOfChannels: c, sampleRate: r }) };
  const decodes = [];
  function OC() { return { decodeAudioData(ab, ok) { decodes.push(() => ok(tampon())); } }; }
  const B = { sr: 32000, tete: .03, m: { 'ui.tap': { bus: 'ui', db: -8, max: 99, cd: 0, v: 1, rj: 0, vj: 0, key: 0, bases: [0], grp: null, prio: 0, cede: 0, pre: 1 } }, d: { __etalon: 'AAAA', 'ui.tap#0#0': 'AAAA' } };
  const G = { CCSON_BANQUE: B, OfflineAudioContext: OC, location: { search: '' }, document: { documentElement: { dataset: {} }, createElement: () => ({}), head: { appendChild() {} } },
    atob: s => Buffer.from(s, 'base64').toString('binary'), setInterval: () => 0, setTimeout: f => 0, requestIdleCallback: () => 0, performance: { now: () => Date.now() }, CC_COLONNE: true };
  G.window = G; G.globalThis = G;
  const ctx = vm.createContext(G); vm.runInContext(fs.readFileSync(chemin, 'utf8'), ctx, { filename: 'sfx.js' });
  const C = G.CCSON; C.init(ac, noeud());
  let n = 0; while (decodes.length && n++ < 50) decodes.shift()();
  const rep = {};
  for (const r of [NaN, 0, -3, 1e9, 1, .8]) {
    const avant = sources.length; let err = null;
    try { C.play('ui.tap', { rate: r, force: true }); } catch (e) { err = String(e); }
    const s = sources[avant]; rep[String(r)] = err ? 'exception : ' + err : s ? s.playbackRate.value : 'rien joué';
  }
  return rep;
}
const sain = v => typeof v === 'number' && isFinite(v) && v > 0 && v <= 16;
const [neuf, vieux] = process.argv.slice(2);
if (!neuf) { console.log('usage : node preuve-sfx-rate.cjs <sfx.js corrigé> [ancien]'); process.exit(2); }
const N = essai(neuf); console.log('corrigé :', JSON.stringify(N));
if (vieux) console.log('ancien  :', JSON.stringify(essai(vieux)));
const ko = Object.keys(N).filter(k => !sain(N[k]));
const intact = N['1'] === 1 && Math.abs(N['0.8'] - .8) < 1e-9;
if (!intact) ko.push('les vraies valeurs ont bougé');
console.log(ko.length ? 'PREUVE KO — ' + ko.join(', ') : 'PREUVE OK'); process.exit(ko.length ? 1 : 0);
