#!/usr/bin/env node
// TRACKER : enregistre la géométrie de la piste + les trajectoires 3D des bots pendant un run.
// Sort un JSON (piste, croisements, trajectoires) pour le rendu Python.
// Usage : node track.js <seed> [secondes]
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const THREE = require('three');

const HTML = path.join(__dirname, 'index.html');
const html = fs.readFileSync(HTML, 'utf8');
const blocks = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
const code = blocks.find(b => b.includes('survTick') && b.includes('buildTrack'));
if (!code) { console.error('script du jeu introuvable'); process.exit(1); }

// ---------- stubs (identiques à sim.js) ----------
function fakeEl(id) {
  return {
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
  createElement(tag) { return fakeEl(tag); },
  getElementById(id) { if (!els[id]) els[id] = fakeEl(id); return els[id]; },
  querySelector(){ return null; }, querySelectorAll(){ return []; },
  addEventListener(){}, removeEventListener(){},
  createElementNS(){ return fakeEl('ns'); },
  createTextNode(){ return {nodeType:3,textContent:''}; },
  createDocumentFragment(){ return fakeEl('frag'); },
  hasFocus(){ return false; }, title: '', hidden: false, visibilityState: 'visible',
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
THREE.WebGLRenderer = function() {
  return { domElement: fakeEl('canvas'), setSize(){}, setPixelRatio(){}, render(){}, dispose(){}, setClearColor(){}, shadowMap:{enabled:false,type:0,autoUpdate:false,needsUpdate:false}, info:{render:{calls:0}}, getContext(){ return null; }, setAnimationLoop(){}, capabilities:{}, outputEncoding:0, toneMapping:0, xr:{addEventListener(){}}, getSize(){return {width:1280,height:720};}, setViewport(){}, setScissor(){}, setScissorTest(){}, resetState(){}, initTexture(){}, setRenderTarget(){}, clear(){}, compile(){}, getPixelRatio(){return 1;} };
};
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
sandbox.globalThis = sandbox; sandbox.self = sandbox; sandbox.top = sandbox;
sandbox.window = new Proxy(sandbox, { get(t,p){ if(p in t) return t[p]; return windowStub[p]; }, set(t,p,v){ t[p]=v; return true; } });
vm.createContext(sandbox);
try { vm.runInContext(code, sandbox, { filename: 'index.html' }); }
catch (e) { console.error('⚠️ chargement (bénin?):', e.message); }

// ---------- run ----------
const seed = Number(process.argv[2]) || 12345;
const SECS = Number(process.argv[3]) || 60;
const DT = 1/60;
const sim = sandbox.__SIM;
if (!sim) { console.error('hook __SIM absent'); process.exit(1); }

sim.buildTrack(seed);
sim.SURV.armed = true; sim.SURV.on = true; sim.level = 0;
sim.survStart();
sim.s = 0; sim.mode = 'drive'; sim.vA = 0;

// géométrie piste
const NP = sim.NP, L = sim.L, segL = L/(NP-1);
const track = [];
for (let i = 0; i < NP; i++) track.push([sim.pts[i].x, sim.pts[i].y, sim.pts[i].z]);
const holes = (sim.HOLES||[]).map(h => ({s0:h.s0, s1:h.s1}));

// croisements exploitables (paires proches en 3D, loin en arc, cible plus basse, gain d'arc)
const crossings = [];
for (let iB = 2; iB < NP-2; iB += 4) {
  const lookI = Math.min(NP-1, iB + Math.round(430/segL));
  for (let j = iB+6; j < lookI; j += 3) {
    const dx = sim.pts[j].x-sim.pts[iB].x, dy = sim.pts[iB].y-sim.pts[j].y, dz = sim.pts[j].z-sim.pts[iB].z;
    const d3 = Math.sqrt(dx*dx+dy*dy+dz*dz);
    if (d3 < 8 || d3 > 70) continue;   // assez proche en ligne droite
    if (dy < 10 || dy > 60) continue;  // cible PLUS BASSE (chute possible)
    const gain = (j-iB)*segL - d3;
    if (gain > 25) crossings.push({i:iB, j, d3:Math.round(d3*10)/10, dy:Math.round(dy*10)/10, gain:Math.round(gain)});
  }
}

// trajectoires : position 3D de chaque bot à chaque tick (rel → frameAt)
const F = new THREE.Vector3(), Bv = new THREE.Vector3(), Nv = new THREE.Vector3(), Pv = new THREE.Vector3();
const frame = { p:new THREE.Vector3(), t:new THREE.Vector3(), b:new THREE.Vector3(), n:new THREE.Vector3() };
const names = sim.SURV.bots.map(b=>b.name);
const traj = names.map(()=>[]);
const airTime = names.map(()=>0);
const steps = Math.round(SECS/DT);
for (let k = 0; k < steps; k++) {
  try { sim.survTick(DT); } catch(e) { console.error('⚠️ arrêt:', e.message); break; }
  sim.SURV.bots.forEach((b, bi) => {
    if (!b.alive) return;
    if (b.air) airTime[bi] += DT;
    const rel = b.totD - sim.SURV.pBase;
    sim.frameAt(Math.max(0, Math.min(sim.L-0.01, rel)), frame);
    // position approx : point courbe + latéral + hauteur air
    const px = frame.p.x + frame.b.x*b.lat + frame.n.x*(b.airH||0);
    const py = frame.p.y + frame.b.y*b.lat + frame.n.y*(b.airH||0);
    const pz = frame.p.z + frame.b.z*b.lat + frame.n.z*(b.airH||0);
    if (k % 3 === 0) traj[bi].push([Math.round(px*10)/10, Math.round(py*10)/10, Math.round(pz*10)/10]);
  });
}

const out = { seed, L: Math.round(L), NP, track, holes, crossings,
  bots: names.map((n,i)=>({name:n, alive:sim.SURV.bots[i].alive, airtime:Math.round(airTime[i]*10)/10, totD:Math.round(sim.SURV.bots[i].totD), traj:traj[i]})) };
const outPath = path.join(__dirname, 'track-'+seed+'.json');
fs.writeFileSync(outPath, JSON.stringify(out));
console.log('OK seed='+seed+' L='+out.L+' croisements='+crossings.length+' (gain max '+(crossings.length?Math.max(...crossings.map(c=>c.gain)):0)+' u)');
console.log('airtime bots (s) :', names.map((n,i)=>n+'='+out.bots[i].airtime).join(' '));
console.log('écrit :', outPath);
process.exit(0);
