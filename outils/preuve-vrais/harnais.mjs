// HARNAIS (2026-10-18) : rejoue HORS NAVIGATEUR la composition (compose) et la fabrique de banque (fabriqueBanque) d'un générateur de musique à
// 30 moteurs (assets/audio/music/direct/musique-trente-*.js) avec un son FACTICE, et NOTE chaque échantillon « vrais/ » qu'il demande (fetch).
// Le module est copié dans le dossier temporaire, avec trois fonctions de rendu court-circuitées et une porte `_rejoue` ajoutée à l'api.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export function monde(DIRECT) {
  const INDEX = JSON.parse(fs.readFileSync(DIRECT + 'vrais/vrais-index.json', 'utf8'));
  let LOG = new Set(); const ABSENTS = new Set();
  class AudioBuffer {
    constructor(o) { this.length = Math.max(1, o.length | 0); this.numberOfChannels = o.numberOfChannels || 1; this.sampleRate = o.sampleRate || 44100; this.duration = this.length / this.sampleRate;
      this._d = []; for (let c = 0; c < this.numberOfChannels; c++) { const d = new Float32Array(this.length); d[1 % this.length] = .5; this._d.push(d); } }
    getChannelData(c) { return this._d[c]; }
    copyToChannel(src, c) { this._d[c].set(src.subarray(0, this._d[c].length)); }
  }
  globalThis.AudioBuffer = AudioBuffer;
  globalThis.FB = ch => new AudioBuffer({ length: 64, numberOfChannels: ch || 1, sampleRate: 44100 });
  const noeud = () => new Proxy(function () {}, { get: (t, k) => (k === Symbol.toPrimitive ? () => 0 : k === 'then' ? undefined : k === 'value' ? 0 : noeud()), set: () => true, apply: () => noeud() });
  const fabrique = () => new Proxy({ currentTime: 0, sampleRate: 44100, state: 'running', destination: noeud(), decodeAudioData: async () => globalThis.FB(1),
    resume: async () => {}, suspend: async () => {}, close: async () => {}, createBuffer: (ch, len, sr) => new AudioBuffer({ length: Math.min(len, 64), numberOfChannels: ch, sampleRate: sr }) },
    { get: (t, k) => (k in t ? t[k] : noeud()) });
  globalThis.OfflineAudioContext = class { constructor() { return fabrique(); } };
  globalThis.window = globalThis;
  globalThis.fetch = async u => {
    u = String(u);
    if (u.endsWith('vrais-index.json')) return { ok: true, json: async () => INDEX };
    const m = /\/vrais\/(.+)$/.exec(u);
    if (m) { const f = decodeURIComponent(m[1]); LOG.add(f);
      if (!fs.existsSync(DIRECT + 'vrais/' + f)) { ABSENTS.add(f); return { ok: false }; }
      return { ok: true, arrayBuffer: async () => new ArrayBuffer(8) }; }
    throw new Error('fetch inattendu ' + u);
  };
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'preuve-vrais-'));
  async function charge(fichier) {
    let t = fs.readFileSync(DIRECT + fichier, 'utf8').split('\r\n').join('\n');
    const rep = (re, par, nom) => { if (!re.test(t)) throw new Error('patch introuvable : ' + nom + ' dans ' + fichier); t = t.replace(re, par); };
    rep(/async function rend\(dur, fn, sr, cible, ch\) \{/, 'async function rend(dur, fn, sr, cible, ch) { return FB(ch || 1);', 'rend');
    rep(/function ks\(notes, dur, eclat, sr\) \{/, 'function ks(notes, dur, eclat, sr) { return FB(2);', 'ks');
    rep(/function ampli\(b\) \{/, 'function ampli(b) { return b;', 'ampli');
    if (/function transforme\(buf, ty, Mx\) \{/.test(t)) t = t.replace(/function transforme\(buf, ty, Mx\) \{/, 'function transforme(buf, ty, Mx) { return Promise.resolve(buf);');
    const avecOpt = /let OPT = null;/.test(t);
    rep(/  const api = \{\n/, `  const api = {\n    _rejoue: async (n, W, O) => { ${avecOpt ? 'OPT = O ? Object.assign({}, O, { n }) : null;' : ''} const r = await prepare(n, W); await r.b.suite; r.M._rates = r.b.rates; return r.M; },\n    _vide: () => VRAIS_BUF.clear(),\n`, 'api');
    const sortie = path.join(tmp, fichier.replace(/\.js$/, '') + '-' + Math.random().toString(36).slice(2, 8) + '.mjs');
    fs.writeFileSync(sortie, t);
    return import(pathToFileURL(sortie).href);
  }
  const instance = (mod, da) => mod.createTrenteMusic({ audioContext: fabrique(), destination: noeud(), renouvelle: 0, da });
  return { INDEX, charge, instance, demandes: () => LOG, raz: () => { LOG = new Set(); }, ABSENTS, nettoie: () => fs.rmSync(tmp, { recursive: true, force: true }) };
}
