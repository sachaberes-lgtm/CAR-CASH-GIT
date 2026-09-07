#!/usr/bin/env node
// Simulateur headless CASH CAR — version DÉMO (git CAR-CASH-GIT).
// Charge le VRAI script du jeu (logique 100 % réelle), stub le DOM/WebGL/audio,
// génère de vraies pistes, fait tourner survTick en accéléré.
// Usage : node sim.js [seeds...]   (défaut : 5 seeds aléatoires, 60 s simulées chacune)
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const THREE = require('three');

const HTML = path.join(__dirname, 'index.html');
const html = fs.readFileSync(HTML, 'utf8');
// La démo a DEUX scripts inline : le splash de démarrage puis le jeu. On prend celui qui contient la logique.
const blocks = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
const code = blocks.find(b => b.includes('survTick') && b.includes('buildTrack'));
if (!code) { console.error('script du jeu introuvable'); process.exit(1); }

// ---------- stubs DOM ----------
function fakeEl(id) {
  const el = {
    id, style: {}, dataset: {}, children: [], value: '', textContent: '', innerHTML: '',
    className: '', classList: { add(){}, remove(){}, toggle(){}, contains(){ return false; } },
    addEventListener(){}, removeEventListener(){}, appendChild(c){ this.children.push(c); return c; },
    removeChild(){}, insertBefore(c){ this.children.unshift(c); return c; }, setAttribute(){},
    getAttribute(){ return null; }, focus(){}, blur(){}, click(){}, scrollIntoView(){},
    getBoundingClientRect(){ return {left:0,top:0,width:1,height:1}; },
    getContext(){ return fakeCtx; }, contains(){ return false; },
    querySelector(){ return null; }, querySelectorAll(){ return []; },
    setPointerCapture(){}, releasePointerCapture(){}, requestFullscreen(){},
    insertAdjacentHTML(){},
    width: 0, height: 0, offsetWidth: 100, offsetHeight: 100, parentNode: null,
  };
  return el;
}
const fakeCtx = new Proxy({}, {
  get(t, p) {
    if (p === 'canvas') return fakeEl('canvas');
    if (p === 'createLinearGradient' || p === 'createRadialGradient' || p === 'createPattern')
      return () => ({ addColorStop(){}, });
    if (p === 'getImageData' || p === 'createImageData')
      return () => ({ data: new Uint8ClampedArray(4), width: 1, height: 1 });
    if (p === 'measureText') return () => ({ width: 0 });
    if (p === 'getContext') return () => fakeCtx;
    return typeof p === 'string' ? (()=>{}) : undefined;
  }, set(){ return true; } });
const els = {};
const documentStub = {
  body: fakeEl('body'), head: fakeEl('head'), documentElement: fakeEl('html'),
  createElement(tag) { const e = fakeEl(tag); return e; },
  getElementById(id) { if (!els[id]) els[id] = fakeEl(id); return els[id]; },
  querySelector(sel) { return null; },
  querySelectorAll() { return []; },
  addEventListener(){}, removeEventListener(){},
  createElementNS(){ return fakeEl('ns'); },
  createTextNode(){ return {nodeType:3,textContent:''}; },
  createDocumentFragment(){ return fakeEl('frag'); },
  hasFocus(){ return false; },
  title: '', hidden: false, visibilityState: 'visible',
  exitFullscreen(){}, cookie: '',
  fonts: { ready: Promise.resolve(), add(){}, load(){ return Promise.resolve([]); } },
};
const windowStub = {
  innerWidth: 1280, innerHeight: 720, devicePixelRatio: 1,
  addEventListener(){}, removeEventListener(){}, dispatchEvent(){ return true; },
  matchMedia(){ return {matches:false, addListener(){}, removeListener(){}, addEventListener(){}, removeEventListener(){}}; },
  requestAnimationFrame(){ return 0; }, cancelAnimationFrame(){},
  getComputedStyle(){ return {display:'block', opacity:1}; },
  location: { search: 'sim=1', href: 'http://localhost/sim=1' },
  navigator: { hardwareConcurrency: 8, maxTouchPoints: 0, userAgent: 'sim' },
  AudioContext: function(){ return { currentTime:0, state:'running', createGain(){return fakeNode();}, createOscillator(){return fakeNode();}, createBufferSource(){return fakeNode();}, createDelay(){return fakeNode();}, createFilter(){return fakeNode();}, createPanner(){return fakeNode();}, createStereoPanner(){return fakeNode();}, createAnalyser(){return fakeNode();}, createConvolver(){return fakeNode();}, createBuffer(){return {getChannelData(){return new Float32Array(2);}};}, destination: fakeNode(), resume(){return Promise.resolve();} }; },
  setTimeout, clearTimeout, setInterval, clearInterval,
  performance: { now: () => Date.now() },
  requestIdleCallback(){ return 0; }, cancelIdleCallback(){},
  scrollTo(){}, alert(){}, confirm(){ return true; }, prompt(){ return null; },
  open(){ return null; }, close(){}, stop(){},
};
function fakeNode() {
  return new Proxy({}, { get(t,p){ if(p==='connect'||p==='disconnect'||p==='start'||p==='stop'||p==='setTargetAtTime'||p==='exponentialRampToValueAtTime'||p==='linearRampToValueAtTime'||p==='setValueAtTime'||p==='cancelScheduledValues') return ()=>{}; if(p==='frequency'||p==='gain'||p==='detune'||p==='type'||p==='value'||p==='playbackRate') return {value:0,setValueAtTime(){},linearRampToValueAtTime(){}}; return undefined; }, set(){ return true; } });
}
// WebGLRenderer stub
THREE.WebGLRenderer = function(opts) {
  return { domElement: fakeEl('canvas'), setSize(){}, setPixelRatio(){}, render(){}, dispose(){}, setClearColor(){}, shadowMap:{enabled:false,type:0,autoUpdate:false,needsUpdate:false}, info:{render:{calls:0}}, getContext(){ return null; }, setAnimationLoop(){}, capabilities:{}, outputEncoding:0, toneMapping:0, xr:{addEventListener(){}}, getSize(){return {width:1280,height:720};}, setViewport(){}, setScissor(){}, setScissorTest(){}, resetState(){}, initTexture(){}, setRenderTarget(){}, clear(){}, compile(){}, setPixelRatio(){}, setAnimationLoop(){}, getPixelRatio(){return 1;}, render(){}, dispose(){} };
};

// ---------- contexte ----------
const sandbox = {
  console, THREE, Math, JSON, Date, Array, Object, String, Number, Boolean,
  Promise, RegExp, Error, Uint8Array, Uint16Array, Uint32Array, Int8Array, Int16Array, Int32Array,
  Float32Array, Float64Array, ArrayBuffer, Map, Set, WeakMap, WeakSet, Symbol, Proxy, Reflect,
  parseInt, parseFloat, isNaN, isFinite, encodeURIComponent, decodeURIComponent, encodeURI, decodeURI,
  TextDecoder, TextEncoder, setTimeout, clearTimeout, setInterval, clearInterval, queueMicrotask,
  document: documentStub, window: windowStub, navigator: windowStub.navigator,
  innerWidth: 1280, innerHeight: 720, devicePixelRatio: 1, screen: {width:1280,height:720},
  localStorage: { getItem(){return null;}, setItem(){}, removeItem(){} },
  sessionStorage: { getItem(){return null;}, setItem(){}, removeItem(){} },
  location: windowStub.location, performance: windowStub.performance,
  addEventListener(){}, removeEventListener(){}, requestAnimationFrame(){ return 0; }, cancelAnimationFrame(){},
  matchMedia: windowStub.matchMedia, AudioContext: windowStub.AudioContext, webkitAudioContext: windowStub.AudioContext,
  atob: (s)=>Buffer.from(s,'base64').toString('binary'), btoa: (s)=>Buffer.from(s,'binary').toString('base64'),
  IS_SIM: true, devicePixelRatio: 1,
};
sandbox.globalThis = sandbox;
sandbox.self = sandbox;
sandbox.top = sandbox;
sandbox.window = new Proxy(sandbox, { get(t,p){ if(p in t) return t[p]; return windowStub[p]; }, set(t,p,v){ t[p]=v; return true; } });
vm.createContext(sandbox);

// ---------- exécution ----------
try {
  vm.runInContext(code, sandbox, { filename: 'index.html' });
} catch (e) {
  console.error('⚠️ erreur au chargement (peut être bénigne):', e.message);
}
console.log('diagnostic:', {
  buildTrack: vm.runInContext('typeof buildTrack', sandbox),
  survTick: vm.runInContext('typeof survTick', sandbox),
  frameAt: vm.runInContext('typeof frameAt', sandbox),
  SURV: vm.runInContext('typeof SURV', sandbox),
  hasHook: vm.runInContext('typeof __SIM', sandbox),
});

// ---------- API ----------
const S = () => sandbox.__SIM;
const rawArgs = process.argv.slice(2);
const seeds = rawArgs.filter(a => !a.startsWith('--')).map(Number).filter(n => !isNaN(n));
const N_RUNS = seeds.length ? seeds.length : 5;
const DURATION = 60;
const DT = 1/60;

function runSeed(seed, secs) {
  const sim = S();
  if (!sim) return { seed, error: 'hook __SIM absent' };
  try {
    sim.buildTrack(seed);
    sim.SURV.armed = true; sim.SURV.on = true; sim.level = 0;
    sim.survStart();
    sim.s = 0; sim.mode = 'drive'; sim.vA = 0;
  } catch (e) { return { seed, error: 'start: ' + e.message + ' | ' + (e.stack||'').split('\n')[1] }; }
  let lastErr = null;
  const steps = Math.round(secs / DT);
  for (let i = 0; i < steps; i++) {
    try { sim.survTick(DT); } catch (e) { lastErr = e.message + ' | ' + (e.stack||'').split('\n')[1]; break; }
  }
  const alive = sim.SURV.bots.filter(b=>b.alive).length;
  const bots = sim.SURV.bots.map(b=>({n:b.name,a:b.alive,air:b.air,rel:Math.round((b.totD-sim.SURV.pBase)%sim.L),v:Math.round(b.v*3.6*0.5),totD:Math.round(b.totD)}));
  return { seed, alive, bots, lastErr, L: Math.round(sim.L) };
}

console.log(`=== SIMULATEUR DÉMO — ${N_RUNS} pistes × ${DURATION}s ===`);
let totAlive = 0;
for (let r = 0; r < N_RUNS; r++) {
  const seed = seeds[r] ?? (Math.floor(Math.random()*1e9));
  const res = runSeed(seed, DURATION);
  totAlive += (typeof res.alive==='number'?res.alive:0);
  console.log(`\n--- run ${r+1} (seed ${seed}) : ${res.alive}/7 vivants — L=${res.L} ---`);
  if (res.error) { console.log('  ERREUR:', res.error); continue; }
  if (res.lastErr) console.log('  ⚠️ arrêt boucle:', res.lastErr);
  console.log('  bots:', res.bots.map(b=>b.n+(b.a?'':'🪦')+'(rel '+b.rel+', '+b.v+' km/h, totD '+b.totD+')').join(' '));
}
console.log(`\n=== SYNTHÈSE : ${totAlive}/${N_RUNS*7} bots vivants ===`);
process.exit(0);
