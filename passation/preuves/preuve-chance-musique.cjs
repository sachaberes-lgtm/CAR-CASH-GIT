#!/usr/bin/env node
/* PREUVE — LA SECONDE CHANCE REPREND LE MORCEAU DE LA COURSE (2026-11-05, DEBUG-TOTAL)
   usage : node passation/preuves/preuve-chance-musique.cjs <pouce-bleu-jeu.js corrigé> [ancien]
   Le VRAI lecteur (VERSION PRINCIPALE/assets/audio/pouce-bleu-jeu.js) tourne dans un vm avec un contexte audio factice et des morceaux à paliers
   factices (PalLecteur bouchonné). Le scénario du jeu : JOUER (depart) → la course (course) → la mort (fin) → le lobby de l'écran de mort tire le
   morceau suivant (lobby) → CONTINUER (depart {meme:true}). Le morceau repris doit être celui de la COURSE. Dernière ligne : PREUVE OK / KO. */
'use strict';
const fs = require('fs'), vm = require('vm');
async function essai(chemin) {
  const prm = () => ({ value: 0, setValueAtTime() {}, setTargetAtTime() {}, cancelScheduledValues() {}, exponentialRampToValueAtTime() {}, linearRampToValueAtTime() {}, cancelAndHoldAtTime() {} });
  const noeud = () => ({ connect() {}, disconnect() {}, start() {}, stop() {}, frequency: prm(), gain: prm(), Q: prm(), detune: prm(), type: '', buffer: null });
  const ac = { currentTime: 1, sampleRate: 48000, createBiquadFilter: noeud, createGain: noeud, createOscillator: noeud, createConvolver: noeud, createBufferSource: noeud, createDynamicsCompressor: noeud,
    createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }), decodeAudioData: async () => ({}) };
  const store = {};
  const W = { location: { search: '', href: 'http://x/index.html' }, localStorage: { getItem: k => store[k] || null, setItem: (k, v) => { store[k] = String(v); } },
    PalLecteur: () => ({ buf: [], gain: [], demarre() {}, palier: () => 0, vers: () => 0, promeut() {}, vise() {}, stop() {} }), palDecoupe: () => [], palPalierDe: () => 0, PALIERS_RENDUS: {}, RYTHMIQUE: null };
  const ctx = vm.createContext({ window: W, URL, console, setTimeout: (f) => 0, clearTimeout() {}, fetch: async () => ({ ok: true, arrayBuffer: async () => new ArrayBuffer(8), json: async () => ({}) }), document: { head: { appendChild() {} }, createElement: () => ({}) }, Math, JSON, Object, Promise, Error, String, Number, Set, Array });
  ctx.localStorage = W.localStorage; ctx.location = W.location;
  vm.runInContext(fs.readFileSync(chemin, 'utf8'), ctx, { filename: 'pouce-bleu-jeu.js' });
  const PB = W.POUCE_JEU; const fiche = { fichiers: ['a.m4a'], moteurs: [1], bpm: 120 };
  PB.liste = ['UN', 'DEUX', 'TROIS', 'QUATRE'].map(t => ({ id: 'pal-' + t, type: 'paliers', titre: t, fiche }));
  const out = noeud();
  const c1 = await PB.depart(ac, out, {}); PB.course();          // JOUER : le morceau de la course
  PB.fin(true);                                                  // la mort
  const l = await PB.lobby(ac, out, {});                         // 1,4 s après : le lobby tire le suivant
  const r = await PB.depart(ac, out, { meme: true, vite: true }); // CONTINUER
  return { course: c1 && c1.titre, lobby: l && l.titre, reprise: r && r.titre, ok: !!(c1 && r && c1.titre === r.titre && l && l.titre !== c1.titre) };
}
(async () => {
  const [neuf, vieux] = process.argv.slice(2);
  if (!neuf) { console.log('usage : node preuve-chance-musique.cjs <pouce-bleu-jeu.js corrigé> [ancien]'); process.exit(2); }
  const N = await essai(neuf); console.log('corrigé :', JSON.stringify(N));
  if (vieux) console.log('ancien  :', JSON.stringify(await essai(vieux)));
  console.log(N.ok ? 'PREUVE OK' : 'PREUVE KO'); process.exit(N.ok ? 0 : 1);
})().catch(e => { console.log('ERREUR', e && e.stack); process.exit(1); });
