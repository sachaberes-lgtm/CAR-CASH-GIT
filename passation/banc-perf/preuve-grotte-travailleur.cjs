#!/usr/bin/env node
/* PREUVE : LE CREUSEMENT DE LA GROTTE DANS UN TRAVAILLEUR DONNE LA MÊME GRILLE AU BIT PRÈS (2026-11-08, vitesse-fluide)
   usage : node passation/banc-perf/preuve-grotte-travailleur.cjs        (PREUVE OK / PREUVE KO)
   Les fonctions de creusement sont lues dans code/maps/grottes-1.js ; le chemin « fil principal » exécute EXACTEMENT la boucle de buildGrotteG ; le chemin « travailleur » charge le VRAI code/maps/grotte-travailleur.js
   (avec un Worker simulé qui exécute le code de travailleur reçu dans un autre contexte vm) et appelle grwCreuse. On compare un hachage FNV de toute la grille (pool, dn, si, sd, chS, cle, nAir).
   Cas : route synthétique (arc, largeur et voûte qui varient, bassin de lave, bruit), et le repli (tranche infinie → faux, Worker absent → faux, erreur du travailleur → faux). */
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const D = path.resolve(__dirname, '../..'), lis = f => fs.readFileSync(path.join(D, 'code', f), 'utf8');
const G1 = lis('maps/grottes-1.js'), TRAV = lis('maps/grotte-travailleur.js');
function fn(nom) { const m = new RegExp('function\\*? ' + nom + '\\(').exec(G1); const i = m.index, j = G1.indexOf('{', G1.indexOf(')', i)); let d = 0, k = j; for (; ; k++) { const c = G1[k]; if (c === '{') d++; else if (c === '}') { d--; if (!d) break; } } return G1.slice(i, k + 1); }
const FNS = ['grtH3', 'grtN3', 'grtRoche', 'grtMonde', 'grtCh', 'grtNoyau', 'grtCreuse1'].map(fn).join('\n');
const FNS2 = ['grtD', 'grtLit', 'grtMatieres', 'grtLum', 'grtTampons', 'grtMailleNetsG'].map(fn).join('\n');
const GTLIGNE = /const GT=\{[^}]*\};/.exec(G1)[0];
const PRE2 = 'var GRT_ARETES=[[0,1],[2,3],[4,5],[6,7],[0,2],[1,3],[4,6],[5,7],[0,4],[1,5],[2,6],[3,7]],GRT_TMP={lum:[0,0,0,0],loc:null,vid:null,P:null,F:null,Lt:null,I:null},GRT_AMB=[[.30,.19,.10],[.13,.38,.24],[.24,.10,.40],[.34,.24,.14],[.30,.09,.045],[.04,.15,.20]];\n' + GTLIGNE.replace('const GT', 'var GT') + '\nvar GROTTE={};\n';
const PRE = "var GRT={B:12,K:1.6},GRV={nzK:2,amb:.9,tR2:2500,tF:90,lavL:85},GRT_VASTE=true,ROAD_HALF=28,THICK=5.2,JF={lim:Infinity};\n";
let ko = 0; const ok = (n, c, d) => { console.log((c ? '  ✔ ' : '  ✘ ') + n + (d ? '  — ' + d : '')); if (!c) ko++; };

function route(n) {
  const R = { n: n }; for (const k of ['X', 'Y', 'Z', 'NNX', 'NNY', 'NNZ', 'BX', 'BY', 'BZ', 'LAT', 'BAS', 'RH', 'UP', 'DN', 'EX', 'NZ']) R[k] = new Float32Array(n);
  R.EXT = new Uint8Array(n); R.SAL = new Uint8Array(n);
  for (let q = 0; q < n; q++) {
    const a = q * .045, rr = 900; R.X[q] = Math.sin(a) * rr; R.Z[q] = (1 - Math.cos(a)) * rr + q * 3; R.Y[q] = 100 - q * .6 + 12 * Math.sin(q * .13);
    const nx = .08 * Math.sin(q * .2), nz = .05 * Math.cos(q * .17), nl = Math.hypot(nx, 1, nz); R.NNX[q] = nx / nl; R.NNY[q] = 1 / nl; R.NNZ[q] = nz / nl;
    const tx = Math.cos(a), tz = Math.sin(a) + .02, tl = Math.hypot(tx, tz); const T = [tx / tl, 0, tz / tl], N = [R.NNX[q], R.NNY[q], R.NNZ[q]];
    let bx = N[1] * T[2] - N[2] * T[1], by = N[2] * T[0] - N[0] * T[2], bz = N[0] * T[1] - N[1] * T[0]; const bl = Math.hypot(bx, by, bz) || 1; R.BX[q] = bx / bl; R.BY[q] = by / bl; R.BZ[q] = bz / bl;
    R.RH[q] = 45 + 25 * Math.sin(q * .07) ** 2; R.UP[q] = 28 + 14 * Math.sin(q * .05 + 1); R.DN[q] = 20 + 9 * Math.cos(q * .09); R.EX[q] = q % 17 < 3 ? 2 : 2.4; R.NZ[q] = .12 + .06 * Math.sin(q * .11); R.LAT[q] = 8 * Math.sin(q * .06);
    R.SAL[q] = (q / 25) | 0; R.BAS[q] = q > 60 && q < 90 ? 30 : 0; R.EXT[q] = q < 6 || q > n - 7 ? 1 : 0;
  }
  return R;
}
function bornes(R) { let x0 = 1e9, y0 = 1e9, z0 = 1e9, x1 = -1e9, y1 = -1e9, z1 = -1e9; for (let q = 0; q < R.n; q++) { const r = Math.max(R.RH[q] + Math.abs(R.LAT[q]), R.UP[q], R.DN[q], R.BAS[q]) * 1.4 + 30; x0 = Math.min(x0, R.X[q] - r); x1 = Math.max(x1, R.X[q] + r); z0 = Math.min(z0, R.Z[q] - r); z1 = Math.max(z1, R.Z[q] + r); y0 = Math.min(y0, R.Y[q] - r); y1 = Math.max(y1, R.Y[q] + r); } return { x0, y0, z0, x1, y1, z1 }; }
function hache(V) {
  let h = 2166136261 >>> 0; const mix = a => { const u = new Uint8Array(a.buffer, a.byteOffset, a.byteLength); for (let i = 0; i < u.length; i++) { h ^= u[i]; h = Math.imul(h, 16777619) >>> 0; } };
  for (let c = 0; c < V.pool.length; c++) { mix(V.pool[c]); mix(V.dn[c]); mix(V.si[c]); mix(V.sd[c]); }
  mix(V.dir); mix(Float64Array.from(V.chS)); mix(Float64Array.from(V.cle)); mix(Float64Array.of(V.nAir)); return h.toString(16) + '/' + V.pool.length + '/' + V.nAir;
}
// --- chemin 1 : le fil principal, la boucle de buildGrotteG ---
const R = route(150), b = bornes(R);
const ctx1 = vm.createContext({ Math, performance, Float32Array, Int8Array, Uint8Array, Int32Array, Array, Object });
vm.runInContext(PRE + FNS + '\n' + FNS2 + '\n' + PRE2 + "\nvar OUT=function(R,b){var V=grtMonde(b.x0,b.y0,b.z0,b.x1,b.y1,b.z1);for(var q=0,ac=1e9;q<R.n;q++){grtNoyau(V,R,q);ac+=6;if(ac<Math.max(6,R.RH[q]/3.2)&&!R.EXT[q])continue;ac=0;for(var g1 of grtCreuse1(V,R,q));if(R.BAS[q]>0)for(var g2 of grtCreuse1(V,R,q,{ax:0,ay:1,az:0,rh:R.RH[q]*.85,up:14,dn:R.BAS[q]}));}return V;};", ctx1);
const t0 = Date.now(); const V1 = ctx1.OUT(R, b); const ms1 = Date.now() - t0; const H1 = hache(V1);
console.log('chemin fil principal : ' + H1 + ' (' + ms1 + ' ms, ' + V1.pool.length + ' tronçons)');
// --- chemin 2 : le vrai grotte-travailleur.js, avec un Worker simulé ---
function monde(opts) {
  const ctx = vm.createContext({ Math, performance, Float32Array, Int8Array, Uint8Array, Int32Array, Array, Object, Promise, setImmediate, console });
  const sandbox = ctx;
  sandbox.TEL_NATIF = opts.tel !== false; sandbox.location = { search: opts.search || '' }; sandbox.notes = []; sandbox.window = { __ccNote: function (g, m, o) { sandbox.notes.push([g, m, o]); } };
  if (opts.worker !== false) {
    sandbox.Worker = function (url) {
      const self = this; const code = sandbox.__blobs[url]; const wctx = vm.createContext({ Math, performance, Float32Array, Int8Array, Uint8Array, Int32Array, Array, Object, console });
      wctx.postMessage = function (data) { setImmediate(function () { if (opts.erreur) { self.onerror && self.onerror({ message: 'simulé' }); return; } self.onmessage && self.onmessage({ data: data }); }); };
      wctx.onmessage = null; /* comme la portée d'un vrai travailleur : `onmessage` existe */
      vm.runInContext(code, wctx); this.postMessage = function (m) { const copie = structuredClone(m); setImmediate(function () { wctx.onmessage({ data: copie }); }); }; this.terminate = function () { sandbox.__terminated = (sandbox.__terminated | 0) + 1; };
    };
  }
  sandbox.__blobs = {}; sandbox.Blob = function (parts) { this.t = parts.join(''); }; sandbox.URL = { createObjectURL: function (b) { const u = 'blob:' + Object.keys(sandbox.__blobs).length; sandbox.__blobs[u] = b.t; return u; } };
  vm.runInContext(PRE + FNS + '\n' + FNS2 + '\n' + PRE2 + TRAV + "\nvar JFX=JF;var ET={set lim(v){JF.lim=v;}};", ctx);
  return ctx;
}
async function lance(ctx, lim, R, b, bascule) { // un « prebTravaille » : le générateur, tranche après tranche (finie = 8 ms) ou d'un trait (Infinity)
  vm.runInContext("var V0=grtMonde(__b.x0,__b.y0,__b.z0,__b.x1,__b.y1,__b.z1);", Object.assign(ctx, { __b: b }));
  ctx.__R = R; ctx.__b = b; vm.runInContext("JF.lim=" + (lim === Infinity ? 'Infinity' : '1e15') + ";var G=grwCreuse(V0,__R,__b);", ctx);
  let r, n = 0; for (; ; n++) { if (bascule && n === 1) vm.runInContext('JF.lim=Infinity', ctx); r = vm.runInContext("G.next()", ctx); if (r.done) break; if (r.value !== 'attente') ok('un rendez-vous du générateur rend « attente »', false); await new Promise(s => setImmediate(s)); if (n > 5000) break; }
  return { fait: r.value, V: ctx.V0, tours: n };
}
(async () => {
  const c2 = monde({}); const A = await lance(c2, 1e15, R, b);
  ok('le travailleur creuse (grwCreuse rend vrai)', A.fait === true, A.tours + ' attentes · ' + JSON.stringify(vm.runInContext('window.dbgGrotteTrav()', c2)));
  const H2 = hache(A.V); console.log('chemin travailleur   : ' + H2);
  ok('LA MÊME GRILLE AU BIT PRÈS (pool, dn, si, sd, chS, cle, nAir, dir)', H1 === H2, H1 + ' / ' + H2);
  ok('dbgGrotteTrav : un fait, aucun repli', vm.runInContext("window.dbgGrotteTrav()", c2).faits === 1 && vm.runInContext("window.dbgGrotteTrav()", c2).replis === 0);
  ok('la boîte noire note « grotte | travailleur »', c2.notes.length === 1 && c2.notes[0][0] === 'grotte' && c2.notes[0][1] === 'travailleur' && /creusement/.test(c2.notes[0][2]), JSON.stringify(c2.notes[0]));
  // --- LES MAILLES : mêmes tableaux au bit près, travailleur contre fil principal ---
  const hm = m => { let h = 2166136261 >>> 0; for (const a of [m.P, m.F, m.L]) { const u = new Uint8Array(a.buffer, a.byteOffset, a.byteLength); for (let i = 0; i < u.length; i++) { h ^= u[i]; h = Math.imul(h, 16777619) >>> 0; } } h ^= m.nt; return h >>> 0; };
  const POSE = "var V=GROTTE.V=V0;GROTTE.R=__R;GROTTE.lac={y:" + (R.Y[40] - 30) + "};GROTTE.eau={y:" + (R.Y[10] - 25) + "};GROTTE.lavLum=[0,0,0,0,1,0];GROTTE.piliers=[{x:" + R.X[50] + ",z:" + R.Z[50] + ",r:30,yb:" + (R.Y[50] - 40) + ",yt:" + (R.Y[50] + 20) + ",k:'stal'},{x:" + R.X[100] + ",z:" + R.Z[100] + ",r:25,yb:" + (R.Y[100] - 40) + ",yt:" + (R.Y[100] + 20) + ",k:'x'}];" +
    "GROTTE.LL=new Map();for(var c=0;c<V.pool.length;c++){if(c%3)continue;var d=V.cle[c];GROTTE.LL.set(d,{t:[{x:__R.X[(c*2)%__R.n],y:__R.Y[(c*2)%__R.n]+5,z:__R.Z[(c*2)%__R.n]}],p:[{x:__R.X[(c*3)%__R.n],y:__R.Y[(c*3)%__R.n]+3,z:__R.Z[(c*3)%__R.n],r2:3600,I:1.4,c:[.9,.4,.1]}]});}" +
    "var ORD=[];for(var c=0;c<V.pool.length;c++)ORD.push(c);ORD.sort(function(a,b){return V.chS[a]-V.chS[b];});";
  for (const cx of [ctx1, c2]) { cx.V0 = cx === ctx1 ? V1 : A.V; cx.__R = R; vm.runInContext(POSE, cx); }
  vm.runInContext("var REF=[];JF.lim=Infinity;for(var i=0;i<ORD.length;i++){var c=ORD[i],g=grtMailleNetsG(V,c,GROTTE.LL.get(V.cle[c])||null),x;do{x=g.next();}while(!x.done);REF.push(x.value);}", ctx1);
  const REF = ctx1.REF.map(hm); console.log('mailles du fil principal : ' + ctx1.ORD.length + ' tronçons, ' + ctx1.REF.reduce((a, m) => a + m.nt, 0) + ' triangles');
  vm.runInContext("GRW.mfaits=0;GRW.minline=0;JF.lim=1e15;grwMailleInit(V,__R,ORD);", c2); await new Promise(s => setImmediate(s));
  const got = []; for (let i = 0; i < c2.ORD.length; i++) { ctx2g(c2, i); const g = vm.runInContext("G2=grwMailleDe(V,ORD[" + i + "],GROTTE.LL.get(V.cle[ORD[" + i + "]])||null)", c2); let r; for (let n = 0; ; n++) { r = vm.runInContext("G2.next()", c2); if (r.done) break; await new Promise(s => setImmediate(s)); } got.push(r.value); }
  function ctx2g() {}
  const GOT = got.map(hm);
  ok('LES MAILLES : mêmes tableaux (P, F, L, nt) au bit près pour les ' + REF.length + ' tronçons', GOT.length === REF.length && GOT.every((h, i) => h === REF[i]), GOT.filter((h, i) => h !== REF[i]).length + ' différents');
  ok('tous les tronçons viennent du travailleur, aucun maillé ici', vm.runInContext("GRW.mfaits", c2) === REF.length && vm.runInContext("GRW.minline", c2) === 0, vm.runInContext("GRW.mfaits", c2) + ' / ' + vm.runInContext("GRW.minline", c2));
  vm.runInContext("grwFin();", c2);
  // repli : pas de résultat prêt et tranche infinie → maillé ici, mêmes tableaux
  vm.runInContext("GRW.mfaits=0;GRW.minline=0;JF.lim=1e15;grwMailleInit(V,__R,ORD);JF.lim=Infinity;", c2);
  const i7 = 7; const r7 = vm.runInContext("(function(){var g=grwMailleDe(V,ORD[" + i7 + "],GROTTE.LL.get(V.cle[ORD[" + i7 + "]])||null),x;do{x=g.next();}while(!x.done);return x.value;})()", c2);
  ok('tranche infinie sans résultat prêt : maillé ici (aucune attente), mêmes tableaux', hm(r7) === REF[i7] && vm.runInContext("GRW.minline", c2) === 1);
  vm.runInContext("grwFin();", c2);
  const c3 = monde({}); const B = await lance(c3, 1e15, R, b, true);
  ok('la tranche devient INFINIE pendant l\'attente (passage sans voile) : repli (faux) et le travailleur est abandonné', B.fait === false && c3.__terminated === 1 && vm.runInContext("window.dbgGrotteTrav()", c3).replis === 1);
  ok('… et « repli passage sans voile » quand la tranche devient infinie', c3.notes.length === 1 && /^repli passage sans voile/.test(c3.notes[0][1]), JSON.stringify(c3.notes[0]));
  const c3b = monde({}); const B2 = await lance(c3b, Infinity, R, b);
  ok('tranche INFINIE dès le début (bâti d\'un trait) : faux tout de suite, aucun travailleur créé', B2.fait === false && vm.runInContext('GRW.w', c3b) === undefined);
  const c4 = monde({ worker: false }); const C = await lance(c4, 1e15, R, b);
  ok('pas de Worker : repli (faux), noté « repli pas de Worker »', C.fait === false && c4.notes.length === 1 && c4.notes[0][1] === 'repli pas de Worker', JSON.stringify(c4.notes[0]));
  const c5 = monde({ erreur: true }); const E = await lance(c5, 1e15, R, b);
  ok('travailleur en erreur : repli (faux), plus jamais de travailleur, noté « repli erreur »', E.fait === false && vm.runInContext("GRW.on", c5) === false && c5.notes.length === 1 && /^repli erreur/.test(c5.notes[0][1]), JSON.stringify(c5.notes[0]));
  const c6 = monde({ tel: false }); const F = await lance(c6, 1e15, R, b);
  ok('ordinateur (TEL_NATIF faux) : jamais de travailleur', F.fait === false && vm.runInContext("GRW.on", c6) === false);
  const c7 = monde({ search: '?grotteworker=0' }); const G = await lance(c7, 1e15, R, b);
  ok('?grotteworker=0 : avant, noté « repli coupé »', G.fait === false && c7.notes.length === 1 && /coupé/.test(c7.notes[0][1]), JSON.stringify(c7.notes[0]));
  console.log(ko ? '\nPREUVE KO (' + ko + ')' : '\nPREUVE OK'); process.exit(ko ? 1 : 0);
})();
