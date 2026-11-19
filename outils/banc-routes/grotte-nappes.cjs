/* LES NAPPES DE LAVE ET D'EAU (2026-11-18, finition des maps : « il n'y a pas de limite ») — node outils/banc-routes/grotte-nappes.cjs paliers(0,10,20) graines(1-200) [detail=1]   env TRAV=1 : le mailleur du travailleur comparé au bit près
   Le VRAI genGrotte + pisteTordPropre + grtEchantillons, puis le VRAI champ de la grotte (grtMonde, grtNoyau + grtCreuse1 et le bassin, les galeries, grtLacsG) et le VRAI mailleur
   (grtMailleNetsG, chaque tronçon) dans un vm Node — déterministe, sans navigateur. Ce que l'œil voit est lu dans les TRIANGLES sortis du mailleur (w4 : le drapeau « un coin touche le lac »,
   la matière du fragment = lave/eau sous le niveau + 0,9 m, voir GRT_FS) :
   · paroi : aire (m²) peinte lave/eau sur des triangles qui descendent à plus d’une demi-case (6 m) SOUS le niveau du lac — la nappe coupée net, debout dans le vide (le défaut « pas de limite »)
   · dessous : la même chose sur des triangles tournés vers le bas (une nappe qui flotte, vue d'en dessous)
   · contact : cases de lave qui touchent (26 voisines) une case d'eau · écart : |niveau lave − niveau eau| quand elles se touchent
   · route : échantillons de route dont la dalle (centre, 3 m sous la dalle) tombe dans une case de nappe ; noyés : route sous le niveau + 2 m dans la portée (l'ancien grotte-lacs.cjs)
   · tri : le nombre de triangles de la roche (tous tronçons) et ceux qui touchent un lac — la preuve « pas un triangle de plus »
   · empreinte : un hachage des échantillons de la route (X, Y, Z, S) — la route au bit près
   · hP / hF : un hachage des POSITIONS et des ATTRIBUTS (matière, drapeau) de tous les triangles maillés — hP identique avant/après = pas un sommet n'a bougé
   env : SANS=nappes (l'image d'avant : « après » rejoue alors la génération d'avant) · G1=une copie d'essai de grottes-1.js */
const vm = require('vm');
const C = require('./charge.cjs');
if (process.env.SANS) vm.runInContext('location.search=' + JSON.stringify('?sans=' + process.env.SANS), C.ctx);
const G = require('./grotte.cjs'), ctx = G.ctx, THREE = ctx.THREE;
vm.runInContext('var pts=[],T=[],Nn=[],NP=0,L=0;if(typeof JF==="undefined")var JF={lim:Infinity,d:0};JF.lim=Infinity;', ctx);
if (process.env.NAP) vm.runInContext('Object.assign(GRT_NAP,' + process.env.NAP + ')', ctx);
const args = process.argv.slice(2).filter(a => !a.includes('=')), detail = process.argv.includes('detail=1');
const PAL = (args[0] || '0,10,20').split(',').map(Number), [g0, g1] = (args[1] || '1-200').split('-').map(Number);
function echant(r, pal) {
  const p9 = +pal, k9 = Math.min(1, p9 / 25), vw9 = C.VW[p9] || 78; ctx.__LC = (45 - 25 * k9) * vw9 * (1.8 - .8 * k9) * .85; vm.runInContext('longueurCible=function(){return __LC;}', ctx);
  const ctrl = r.ctrl, N = r.N || ctrl.map(() => new THREE.Vector3(0, 1, 0));
  const cv = new THREE.CatmullRomCurve3(ctrl, false, 'centripetal'); cv.arcLengthDivisions = Math.max(200, ctrl.length * 16);
  const Lc = cv.getLength(), np = Math.ceil(Lc / 3) + 1, P = cv.getSpacedPoints(np - 1);
  ctx.pts = P; ctx.NP = np; ctx.L = Lc; ctx.T = P.map((p, i) => new THREE.Vector3().subVectors(P[Math.min(np - 1, i + 1)], P[Math.max(0, i - 1)]).normalize());
  ctx.Nn = P.map((p, i) => N[Math.round(i / (np - 1) * (N.length - 1))]);
  return ctx.grtEchantillons();
}
/* le champ, comme buildGrotteG (chemin sans travailleur) */
vm.runInContext(`function __bancChamp(R,seed){function fin(it){let r;do{r=it.next();}while(!r.done);return r.value;}
  R.galeries=grtGaleries(R,seed);GROTTE.galeries=R.galeries.length?R.galeries:null;GROTTE.R=R;
  let x0=1e9,y0=1e9,z0=1e9,x1=-1e9,y1=-1e9,z1=-1e9;
  for(let q=0;q<R.n;q++){const o9=R.OFX?Math.hypot(R.OFX[q],R.OFY[q],R.OFZ[q]):Math.abs(R.LAT[q]),r=Math.max(R.RH[q]+o9,R.UP[q]+o9,R.DN[q]+o9,R.BAS[q])*1.4+30;
    x0=Math.min(x0,R.X[q]-r);x1=Math.max(x1,R.X[q]+r);z0=Math.min(z0,R.Z[q]-r);z1=Math.max(z1,R.Z[q]+r);y0=Math.min(y0,R.Y[q]-r);y1=Math.max(y1,R.Y[q]+r);}
  for(const g9 of R.galeries){const m9=g9.r*2+40;x0=Math.min(x0,g9.bb[0]-m9);y0=Math.min(y0,g9.bb[1]-m9);z0=Math.min(z0,g9.bb[2]-m9);x1=Math.max(x1,g9.bb[3]+m9);y1=Math.max(y1,g9.bb[4]+m9);z1=Math.max(z1,g9.bb[5]+m9);}
  const V=grtMonde(x0,y0,z0,x1,y1,z1);GROTTE.V=V;
  for(let q=0,ac=1e9;q<R.n;q++){grtNoyau(V,R,q);ac+=6;if(ac<Math.max(6,R.RH[q]/3.2)&&!R.EXT[q])continue;ac=0;fin(grtCreuse1(V,R,q));if(R.BAS[q]>0)fin(grtCreuse1(V,R,q,{ax:0,ay:1,az:0,rh:R.RH[q]*.85,up:14,dn:R.BAS[q]}));}
  for(const g9 of R.galeries){const q9=g9.q,ex9=g9.mine?6:2,nz9=g9.mine?.05:Math.min(.22,R.NZ[q9]);for(const p9 of g9.P)fin(grtCreuse1(V,R,q9,{ax:0,ay:1,az:0,rh:g9.r,up:g9.r*.95,dn:g9.r*.7,ox:p9[0]-R.X[q9],oy:p9[1]-R.Y[q9],oz:p9[2]-R.Z[q9],ex:ex9,nz:nz9}));}
  return V;}
function __bancLacs(V0,R,seed,on){function fin(it){let r;do{r=it.next();}while(!r.done);return r.value;}
  const V=Object.assign({},V0,{pool:V0.pool.map(a=>a.slice()),dn:V0.dn.map(a=>a.slice())});GROTTE.V=V;if(typeof GRT_NAP!=="undefined")GRT_NAP.on=on;
  fin(grtLacsG(V,R));GROTTE.piliers=grtPiliers(V,R,mulberry32((seed^0x6A07E)>>>0));V.nzc=null;return V;}
function __bancMaille(V,c){let r,it=grtMailleNetsG(V,c,null);do{r=it.next();}while(!r.done);return r.value;}`, ctx);
const tot = {}; const pires = []; const MODES = (process.env.MODES || 'avant,apres').split(',');
function ajoute(k, v) { tot[k] = (tot[k] || 0) + v; }
/* (2026-11-19, contrôle : « vérifier le Worker de la grotte ») TRAV=1 : chaque tronçon est aussi maillé par le CODE DU TRAVAILLEUR — la liste `fns` lue dans grotte-travailleur.js, les sources recopiées
   et aplaties comme grwPlat, dans un vm à part avec l'en-tête et l'état de grwInit — et comparé octet par octet (P, F, L) au mailleur du fil principal. */
let TRAV = null;
if (process.env.TRAV) { const src = require('fs').readFileSync(require('path').resolve(__dirname, '../../code/maps/grotte-travailleur.js'), 'utf8'), liste = /const fns=\[([^\]]+)\]/.exec(src)[1].split(',');
  const plat = s => { if (s.indexOf('function*') !== 0) return s; const t = s.replace(/^function\*\s*/, 'function ').replace(/if\([^;{}]*?performance\.now\(\)>JF\.lim\)yield;/g, ''); return /\byield\b/.test(t) ? s : t; };
  const code = "'use strict';function grwFait(x){if(x&&typeof x.next==='function'){var r;do{r=x.next();}while(!r.done);return r.value;}return x;}\nvar GRT={B:12,K:1.6},GRV={nzK:2},GRT_VASTE=true,ROAD_HALF=28,THICK=5.2,JF={lim:Infinity},GRT_ARETES=" + JSON.stringify(vm.runInContext('GRT_ARETES', ctx)) + ",GRT_TMP={lum:[0,0,0,0],loc:null,vid:null,P:null,F:null,Lt:null,I:null},GRT_AMB=[],GROTTE={},GT={},MV=null,MLL=null;\n" + liste.map(n => plat(vm.runInContext(n + '.toString()', ctx))).join('\n');
  TRAV = vm.createContext({ Math, performance: { now: () => 0 }, Float32Array, Int32Array, Uint8Array, Int8Array, Uint32Array, Uint16Array, Map, Array, Object, JSON }); vm.runInContext(code, TRAV);
  TRAV.__init = vm.runInContext('(function(V,g){GT=g.GT;GRT_AMB=g.AMB;GRV={amb:g.GRV.amb,tR2:g.GRV.tR2,tF:g.GRV.tF,lavL:g.GRV.lavL,lumN:g.GRV.lumN,lumG:g.GRV.lumG,lacFus:g.GRV.lacFus,nuls:g.GRV.nuls};GROTTE={R:{SAL:g.G.R.SAL},lac:g.G.lac,eau:g.G.eau,piliers:g.G.piliers,lavLum:g.G.lavLum,galeries:g.G.galeries||null};GRT_VASTE=g.vaste;ROAD_HALF=g.rh;THICK=g.th;MV=V;})', TRAV);
  TRAV.__maille = vm.runInContext('(function(c){return grwFait(grtMailleNetsG(MV,c,null));})', TRAV); }
let hTout = 0;
for (const pal of PAL) for (let g = g0; g <= g1; g++) {
  try { vm.runInContext('GRT_VUS.length=0', ctx); } catch (e) {}
  let r, R, V0; try { r = G.piste(g, pal); if (r.tordErr) throw new Error(r.tordErr); R = echant(r, pal); V0 = ctx.__bancChamp(R, g); }
  catch (e) { console.log('palier', pal, 'graine', g, 'ERREUR', (e.stack || e.message).slice(0, 300)); ajoute('erreurs', 1); continue; }
  for (const mode of MODES) { const V = ctx.__bancLacs(V0, R, g, mode === 'apres' && !process.env.SANS), aj = (k, v) => ajoute(mode + '.' + k, v);
  const lac = vm.runInContext('GROTTE.lac', ctx), eau = vm.runInContext('GROTTE.eau', ctx);
  /* l'empreinte de la route (au bit près) */
  let h = 2166136261 >>> 0; const f32 = new Float32Array(1), u32 = new Uint32Array(f32.buffer);
  for (let q = 0; q < R.n; q++) for (const A of [R.X, R.Y, R.Z, R.S]) { f32[0] = A[q]; h = Math.imul(h ^ u32[0], 16777619) >>> 0; }
  hTout = Math.imul(hTout ^ h, 16777619) >>> 0;
  const o = { mode, pal, g, lac: lac ? Math.round(lac.y) : null, eau: eau ? Math.round(eau.y) : null, paroi: 0, dessous: 0, contact: 0, ecart: 0, route: 0, noyes: 0, tri: 0, triLac: 0, h: h.toString(16) };
  let hP = 2166136261 >>> 0, hF = 2166136261 >>> 0;
  if (lac || eau) {
    const B = V.B;
    /* les tronçons maillés : ceux (et leurs 26 voisins) dont un sous-cube a son échantillon à moins de 400 m de la portée d'une nappe, sous le niveau + 1 tronçon — le même choix avant et après (V.si ne dépend que du creusement) */
    const proche = new Uint8Array(V.CX * V.CY * V.CZ), yH = Math.max(lac ? lac.y : -1e9, eau ? eau.y : -1e9) + 16 * B;
    for (let c = 0; c < V.pool.length; c++) { const SI = V.si[c]; let ok = false; for (let m9 = 0; m9 < 64 && !ok; m9++) { const q = SI[m9]; if (q < 0) continue; const S = R.S[q]; for (const L9 of [lac, eau]) if (L9 && S > L9.s0 - 400 && S < L9.s1 + 400) ok = true; }
      if (!ok) continue; const d = V.cle[c], ci = d % V.CX, cj = ((d / V.CX) | 0) % V.CY, ck = (d / (V.CX * V.CY)) | 0;
      for (let z = -1; z <= 1; z++) for (let y = -1; y <= 1; y++) for (let x = -1; x <= 1; x++) { const a = ci + x, b = cj + y, e = ck + z; if (a >= 0 && b >= 0 && e >= 0 && a < V.CX && b < V.CY && e < V.CZ) proche[a + V.CX * (b + V.CY * e)] = 1; } }
    for (let c = 0; c < V.pool.length; c++) {
      if (process.env.MAILLE === '0') break;
      if (!proche[V.cle[c]] || V.oy + (((V.cle[c] / V.CX) | 0) % V.CY) * 16 * B > yH) continue; o.troncons = (o.troncons || 0) + 1;
      const d = V.cle[c], I0 = (d % V.CX) * 16, J0 = (((d / V.CX) | 0) % V.CY) * 16, K0 = ((d / (V.CX * V.CY)) | 0) * 16, m = ctx.__bancMaille(V, c);
      if (TRAV) { if (o.trav === undefined) { o.trav = 0; o.travKo = 0; TRAV.__init(V, vm.runInContext('({GT:GT,AMB:GRT_AMB,GRV:GRV,G:GROTTE,vaste:GRT_VASTE,rh:ROAD_HALF,th:THICK})', ctx)); }
        const w = TRAV.__maille(c), eg = (x, y) => { if (x.length !== y.length) return false; const a = new Uint8Array(x.buffer, x.byteOffset, x.byteLength), b = new Uint8Array(y.buffer, y.byteOffset, y.byteLength); for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false; return true; };
        o.trav++; if (w.nt !== m.nt || !eg(w.P, m.P) || !eg(w.F, m.F) || !eg(w.L, m.L)) o.travKo++; }
      o.tri += m.nt; const P = m.P, F = m.F; { const u = new Uint32Array(P.buffer, P.byteOffset, P.length); for (let i = 0; i < u.length; i++) hP = Math.imul(hP ^ u[i], 16777619) >>> 0; for (let i = 0; i < F.length; i++) hF = Math.imul(hF ^ F[i], 16777619) >>> 0; }
      for (let t = 0; t < m.nt; t++) { const lk = F[t * 12 + 3] & 3; if (!lk) continue; o.triLac++; const L9 = lk === 1 ? lac : eau; if (!L9) continue;
        let ymin = 1e9; const Y = []; for (let k = 0; k < 3; k++) { const y = V.oy + J0 * B + P[(t * 3 + k) * 3 + 1]; Y.push(y); ymin = Math.min(ymin, y); }
        if (ymin > L9.y - B * .5) continue;
        const a = [0, 1, 2].map(k => [P[(t * 3 + k) * 3], P[(t * 3 + k) * 3 + 1], P[(t * 3 + k) * 3 + 2]]), u = a[1].map((v, i) => v - a[0][i]), w = a[2].map((v, i) => v - a[0][i]);
        const nx = u[1] * w[2] - u[2] * w[1], ny = u[2] * w[0] - u[0] * w[2], nz = u[0] * w[1] - u[1] * w[0], ar = Math.hypot(nx, ny, nz) / 2; if (!ar) continue;
        const part = Y.filter(y => y < L9.y + .9).length / 3, s = ar * part;
        if (process.env.DUMP && (globalThis.__nd = (globalThis.__nd || 0) + 1) % (+process.env.DUMPK || 97) === 0 && globalThis.__nd < 4000) { const x = V.ox + I0 * B + a[0][0], y = Y[0], z = V.oz + K0 * B + a[0][2], i = Math.floor((x - V.ox) / B), j = Math.floor((y - V.oy) / B), k = Math.floor((z - V.oz) / B); let s9 = ''; for (let dy = -1; dy <= 1; dy++) { for (let dx = -1; dx <= 1; dx++) s9 += ctx.grtLit(V, i + dx, j + dy, k) + '/' + ctx.grtD(V, i + dx, j + dy, k) + ' '; s9 += '| '; } console.log('lk', lk, 'y', Y.map(Math.round), 'niv', Math.round(L9.y), 'aire', Math.round(ar), s9); }
        /* tourné vers le bas (vers l'air) : la normale du mailleur est vers l'air ; on prend l'orientation géométrique (le fragment la retourne vers la caméra) — un triangle horizontal sous le niveau = dessous */
        if (Math.abs(ny) / (2 * ar) > .7) o.dessous += s; else o.paroi += s;
        if (mode === 'avant' && s > (o._vs || 0) && ymin < L9.y - 12) { o._vs = s; o._v = { x: V.ox + I0 * B + (a[0][0] + a[1][0] + a[2][0]) / 3, y: (Y[0] + Y[1] + Y[2]) / 3, z: V.oz + K0 * B + (a[0][2] + a[1][2] + a[2][2]) / 3, n: [nx / (2 * ar), ny / (2 * ar), nz / (2 * ar)], k: lk === 1 ? 'lave' : 'eau' }; } }
    }
    /* LES CASES (sans mailleur, rapide : le passage 200 graines × 3 paliers) — une case de nappe PEINTE (4 lave, 5 eau ; 6/7 = la rive, peinte en roche) dont une voisine par une FACE est de l'air sous le niveau :
       · cote : la voisine est à côté (la nappe coupée net, un mur de lave/eau debout dans le vide) · flotte : la voisine est dessous (la nappe vue d'en dessous) */
    o.cote = 0; o.flotte = 0; { const lit = (i, j, k) => ctx.grtLit(V, i, j, k), dn = (i, j, k) => ctx.grtD(V, i, j, k);
      for (let c = 0; c < V.pool.length; c++) { const A = V.pool[c], d = V.cle[c], I0 = (d % V.CX) * 16, J0 = (((d / V.CX) | 0) % V.CY) * 16, K0 = ((d / (V.CX * V.CY)) | 0) * 16;
        for (let p = 0; p < 4096; p++) { const a = A[p]; if (a !== 4 && a !== 5) continue; const L9 = a === 4 ? lac : eau, i = I0 + (p & 15), j = J0 + ((p >> 4) & 15), k = K0 + (p >> 8);
          const air = (i2, j2, k2) => lit(i2, j2, k2) === 1 && dn(i2, j2, k2) > 0 && V.oy + (j2 + .5) * B < L9.y;
          if (air(i, j - 1, k)) o.flotte++; else if (air(i + 1, j, k) || air(i - 1, j, k) || air(i, j, k + 1) || air(i, j, k - 1)) o.cote++; } } }
    /* lave ↔ eau : les cases de lave qui touchent une case d'eau */
    if (lac && eau) { const lit = (i, j, k) => ctx.grtLit(V, i, j, k);
      for (let c = 0; c < V.pool.length; c++) { const A = V.pool[c], d = V.cle[c], I0 = (d % V.CX) * 16, J0 = (((d / V.CX) | 0) % V.CY) * 16, K0 = ((d / (V.CX * V.CY)) | 0) * 16;
        for (let p = 0; p < 4096; p++) { if (A[p] !== 4) continue; const i = I0 + (p & 15), j = J0 + ((p >> 4) & 15), k = K0 + (p >> 8); let t9 = false;
          for (let dz = -1; dz <= 1 && !t9; dz++) for (let dy = -1; dy <= 1 && !t9; dy++) for (let dx = -1; dx <= 1 && !t9; dx++) if (lit(i + dx, j + dy, k + dz) === 5) t9 = true;
          if (t9) o.contact++; } }
      if (o.contact) o.ecart = Math.abs(Math.round(lac.y - eau.y)); }
    /* la route */
    for (let q = R.i0; q < R.n - 20; q++) { for (const d9 of [0, 3, 8]) { const x = R.X[q] - R.NNX[q] * d9, y = R.Y[q] - R.NNY[q] * d9, z = R.Z[q] - R.NNZ[q] * d9, a = ctx.grtIci(V, x, y, z); if (a >= 4 && a <= 7) { o.route++; break; } /* (contrôle tour 1) 6/7 = la rive : toujours la nappe */ }
      for (const L9 of [lac, eau]) if (L9 && R.S[q] >= L9.s0 && R.S[q] <= L9.s1 && R.Y[q] < L9.y + 2) { o.noyes++; break; } }
  }
  o.hP = hP.toString(16); o.hF = hF.toString(16); aj('hP', 0); tot[mode + '.hP'] = Math.imul((tot[mode + '.hP'] || 0) ^ hP, 16777619) >>> 0; tot[mode + '.hF'] = Math.imul((tot[mode + '.hF'] || 0) ^ hF, 16777619) >>> 0;
  if (o._v) { /* la VUE du pire triangle peint : une caméra dans l'air, qui le voit sans roche entre deux (pour dbgGrotte('vue') au banc photo) */
    const v = o._v, D = (x, y, z) => ctx.grtDensIci(V, x, y, z); let n = v.n; if (D(v.x + n[0] * 4, v.y + n[1] * 4, v.z + n[2] * 4) <= 0) n = n.map(x => -x);
    const h = Math.hypot(n[0], n[2]) || 1, yaw0 = Math.atan2(n[2] / h, n[0] / h); let vue = null;
    cherche: for (const dist of [90, 130, 60, 180]) for (const el of [.3, .15, .5]) for (const dyaw of [0, .5, -.5, 1, -1]) {
      const yaw = yaw0 + dyaw, d = [Math.cos(yaw) * Math.cos(el), Math.sin(el), Math.sin(yaw) * Math.cos(el)], p = [v.x + d[0] * dist, v.y + d[1] * dist, v.z + d[2] * dist];
      let ok = true; for (let t = 6; t <= dist && ok; t += 4) if (D(v.x + d[0] * t, v.y + d[1] * t, v.z + d[2] * t) <= 0) ok = false;
      if (ok) { vue = { p: p.map(Math.round), c: [v.x, v.y, v.z].map(Math.round), k: v.k }; break cherche; } }
    o.vue = vue; }
  delete o._v; delete o._vs;
  o.paroi = Math.round(o.paroi); o.dessous = Math.round(o.dessous);
  o.nappes = vm.runInContext('GROTTE.nappes', ctx); vm.runInContext('GROTTE.nappes=null', ctx);
  for (const k of ['paroi', 'dessous', 'cote', 'flotte', 'contact', 'route', 'noyes']) { aj(k, o[k]); if (o[k] > (k === 'paroi' || k === 'dessous' ? 20 : k === 'cote' || k === 'flotte' ? 2 : 0)) aj('graines_' + k, 1); }
  if (o.trav !== undefined) { aj('trav', o.trav); aj('travKo', o.travKo); }
  aj('tri', o.tri); aj('triLac', o.triLac); aj('grottes', 1); if (lac) aj('avecLave', 1); if (eau) aj('avecEau', 1); if (o.nappes) { aj('cases', o.nappes.cases); aj('rive', o.nappes.rive); aj('cuvettes', o.nappes.cuvettes || 0); aj('comblees', o.nappes.comblees || 0); aj('msNappes', o.nappes.ms || 0); }
  pires.push(o); if (detail) console.log(JSON.stringify(o)); }
}
const poids = o => o.paroi + o.dessous + 144 * (o.cote + o.flotte); pires.sort((a, b) => poids(b) - poids(a));
console.log('PIRES (paroi + dessous, m²) :'); pires.slice(0, 16).forEach(o => console.log('  ', o.mode, 'palier', o.pal, 'graine', o.g, 'paroi', o.paroi, 'dessous', o.dessous, 'cote', o.cote, 'flotte', o.flotte, 'contact', o.contact, 'route', o.route, 'lave', o.lac, 'eau', o.eau));
console.log('TOTAL', JSON.stringify(tot, null, 1), 'empreinte routes', hTout.toString(16));
