// LE PROFIL DU JS PAR IMAGE (2026-11-16, lot jsimage). Une vraie course (pilote auto, immortel, nitro, sauts), iPhone 13 Pro émulé, processeur ×CPU,
// puis : (1) les tranches b1…b6 / rendu / après par le mouchard (perfrec=2), (2) un profil CPU (V8, échantillons 200 µs) : temps propre et total des
// fonctions appelées sous loop(), et les lignes de loop() elle-même ramenées à leur morceau de code/, (3) les écritures DOM par image (style, texte,
// classe, attributs — et combien ne changeaient RIEN), (4) les allocations sous loop() (échantillonneur du tas).
//   node outils/banc-jsimage/profil.cjs --out <dossier> [--carte nuages] [--cpu 6] [--s 20] [--qs "sans=jsimage"] [--jeu <dossier>] [--repli <dossier assets>]
const fs = require('fs'), path = require('path');
const { ouvre, dormir } = require('./commun.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const RAC = path.resolve(__dirname, '..', '..');
const JEU = path.resolve(A.jeu || path.join(RAC, 'VERSION PRINCIPALE'));
const REPLI = path.resolve(A.repli || path.join(process.env.HOME, 'cash-car', 'qualite', 'VERSION PRINCIPALE'));
const OUT = path.resolve(A.out || path.join(__dirname, 'mesures')); fs.mkdirSync(OUT, { recursive: true });
const CPU = +(A.cpu || 6), S = +(A.s || 20), TAG = A.tag || 'profil';
/* la carte des lignes : index.html = les morceaux bout à bout */
const ORDRE = fs.readFileSync(path.join(RAC, 'code', 'ORDRE.txt'), 'utf8').split(/\r?\n/).map(l => l.replace(/#.*/, '').trim()).filter(Boolean);
const debuts = []; { let ln = 1; for (const n of ORDRE) { const t = fs.readFileSync(path.join(RAC, 'code', n), 'utf8'); debuts.push([ln, n]); ln += (t.match(/\n/g) || []).length; } }
const ou = l => { let k = 0; while (k + 1 < debuts.length && debuts[k + 1][0] <= l) k++; return debuts[k][1] + ':' + (l - debuts[k][0] + 1); };
/* les compteurs d'écritures DOM : posés seulement pour la phase (3) — ils coûtent */
const COMPTEURS = `(function(){if(window.__ecr)return 1;const E=window.__ecr={on:false,n:{},nul:{},img:0};
 const cpt=(k,nul)=>{if(!E.on)return;E.n[k]=(E.n[k]||0)+1;if(nul)E.nul[k]=(E.nul[k]||0)+1;};
 const pile=()=>{try{const s=new Error().stack.split('\\n')[4]||'';const m=s.match(/:(\\d+):\\d+\\)?$/);return m?+m[1]:0;}catch(e){return 0}};
 const cle=(t)=>t+'@'+pile();
 const P=CSSStyleDeclaration.prototype;const sp=P.setProperty;P.setProperty=function(k,v,pr){if(E.on){cpt(cle('setProperty '+k),this.getPropertyValue(k)===String(v));}return sp.call(this,k,v,pr);};
 for(const k of ['width','height','transform','opacity','display','color','left','top','background','filter','visibility','right','bottom','backgroundColor','boxShadow','textShadow','clipPath','strokeDashoffset','fontSize','animation','animationPlayState']){
  const d=Object.getOwnPropertyDescriptor(P,k);if(!d||!d.set)continue;Object.defineProperty(P,k,{configurable:true,enumerable:d.enumerable,get:d.get,set:function(v){if(E.on)cpt(cle('style.'+k),d.get.call(this)===String(v));d.set.call(this,v);}});}
 const nd=Object.getOwnPropertyDescriptor(Node.prototype,'textContent');Object.defineProperty(Node.prototype,'textContent',{configurable:true,get:nd.get,set:function(v){if(E.on)cpt(cle('textContent'),nd.get.call(this)===String(v));nd.set.call(this,v);}});
 const ih=Object.getOwnPropertyDescriptor(Element.prototype,'innerHTML');Object.defineProperty(Element.prototype,'innerHTML',{configurable:true,get:ih.get,set:function(v){if(E.on)cpt(cle('innerHTML'),ih.get.call(this)===String(v));ih.set.call(this,v);}});
 const cn=Object.getOwnPropertyDescriptor(Element.prototype,'className');Object.defineProperty(Element.prototype,'className',{configurable:true,get:cn.get,set:function(v){if(E.on)cpt(cle('className'),cn.get.call(this)===String(v));cn.set.call(this,v);}});
 const T=DOMTokenList.prototype,tg=T.toggle,ad=T.add,rm=T.remove;
 T.toggle=function(c,f){if(E.on)cpt(cle('toggle'),f!==undefined&&this.contains(c)===!!f);return f===undefined?tg.call(this,c):tg.call(this,c,f);};
 T.add=function(){if(E.on)cpt(cle('add'),[].every.call(arguments,c=>this.contains(c)));return ad.apply(this,arguments);};
 T.remove=function(){if(E.on)cpt(cle('remove'),[].every.call(arguments,c=>!this.contains(c)));return rm.apply(this,arguments);};
 const sa=Element.prototype.setAttribute;Element.prototype.setAttribute=function(k,v){if(E.on)cpt(cle('setAttribute '+k),this.getAttribute(k)===String(v));return sa.call(this,k,v);};
 const lec=(o,k,n)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!d.get)return;Object.defineProperty(o,k,{configurable:true,get:function(){if(E.on)cpt(cle('LIT '+n));return d.get.call(this);},set:d.set});};
 lec(HTMLElement.prototype,'offsetWidth','offsetWidth');lec(HTMLElement.prototype,'offsetHeight','offsetHeight');lec(HTMLElement.prototype,'offsetLeft','offsetLeft');lec(HTMLElement.prototype,'offsetTop','offsetTop');lec(Element.prototype,'clientWidth','clientWidth');lec(Element.prototype,'clientHeight','clientHeight');
 const gb=Element.prototype.getBoundingClientRect;Element.prototype.getBoundingClientRect=function(){if(E.on)cpt(cle('LIT getBoundingClientRect'));return gb.call(this);};
 const gcs=window.getComputedStyle;window.getComputedStyle=function(e,p){if(E.on)cpt(cle('LIT getComputedStyle'));return gcs.call(window,e,p);};
 return 1;})()`;
(async () => {
  const { c, url } = await ouvre({ dirs: [JEU, REPLI], http: +(A.http || 9871), cdp: +(A.cdp || 9872), carte: A.carte || 'nuages', meteo: A.meteo, qs: 'perfrec=2' + (A.qs ? '&' + A.qs : ''), graine: A.graine });
  const R = { tag: TAG, url, cpu: CPU, s: S, charge0: require('os').loadavg()[0].toFixed(1) };
  try {
    await c.ev("dbgImmortel(true);dbgAuto(1,0,{vol:1,saut:.3,imp:25,nit:2});1");
    await c.send('Emulation.setCPUThrottlingRate', { rate: CPU });
    await dormir(6000);
    if (A.seul !== 'ecr') {
    /* (1) les tranches, par le mouchard : moyenne des écarts MG.ts sur S secondes */
    R.tranches = await c.ev(`(async function(){const T=[0,0,0,0,0,0,0,0];let n=0,vu=dbgJsImage().nLoop;const fin=performance.now()+${S * 1000};
      return await new Promise(function(ok){(function f(){const g=dbgJsImage();if(g.nLoop!==vu){vu=g.nLoop;n++;for(let k=0;k<8;k++)T[k]+=g.tr[k];}
        if(performance.now()<fin)requestAnimationFrame(f);else ok({n:n,ms:T.map(function(x){return +(x/Math.max(1,n)).toFixed(3)})});})();});})()`, (S + 30) * 1000).catch(e => 'ERR ' + e.message);
    /* (2) profil CPU */
    await c.send('Profiler.enable'); await c.send('Profiler.setSamplingInterval', { interval: 200 });
    const im0 = await c.ev('dbgJsImage().fr'); await c.send('Profiler.start'); await dormir(S * 1000);
    const { profile } = await c.send('Profiler.stop', {}, 120000); const im1 = await c.ev('dbgJsImage().fr');
    R.imagesProfil = im1 - im0;
    fs.writeFileSync(path.join(OUT, TAG + '.cpuprofile'), JSON.stringify(profile));
    const N = new Map(); for (const n of profile.nodes) N.set(n.id, n);
    const par = new Map(); for (const n of profile.nodes) for (const k of n.children || []) par.set(k, n.id);
    const dts = profile.timeDeltas, smp = profile.samples, self = new Map();
    for (let i = 0; i < smp.length; i++) self.set(smp[i], (self.get(smp[i]) || 0) + (dts[i + 1] || dts[i] || 0) / 1000);
    const sousLoop = id => { let p = id; while (p != null) { const n = N.get(p); if (n.callFrame.functionName === 'loop') return p; p = par.get(p); } return null; };
    const nomDe = n => (n.callFrame.functionName || '(anonyme)') + ' ' + ou(n.callFrame.lineNumber + 1);
    const propre = new Map(), total = new Map(); let tLoop = 0, tTout = 0; const lignes = new Map();
    for (const n of profile.nodes) {
      const ms = self.get(n.id) || 0; tTout += ms; if (!ms) continue;
      const L = sousLoop(n.id); if (L == null) continue; tLoop += ms;
      if (n.id === L) { for (const pt of n.positionTicks || []) { const k = ou(pt.line); lignes.set(k, (lignes.get(k) || 0) + pt.ticks); } }
      const k = nomDe(n); propre.set(k, (propre.get(k) || 0) + ms);
      /* total : chaque ancêtre (jusqu'à loop exclu) reçoit ce temps une fois par nom */
      const vus = new Set(); let p = n.id; while (p != null && p !== L) { const kk = nomDe(N.get(p)); if (!vus.has(kk)) { vus.add(kk); total.set(kk, (total.get(kk) || 0) + ms); } p = par.get(p); }
    }
    const parImg = ms => +(ms / Math.max(1, R.imagesProfil)).toFixed(3);
    R.loopMsImg = parImg(tLoop); R.toutMsImg = parImg(tTout);
    R.propre = [...propre].sort((a, b) => b[1] - a[1]).slice(0, 60).map(([k, v]) => [k, parImg(v)]);
    R.total = [...total].sort((a, b) => b[1] - a[1]).slice(0, 80).map(([k, v]) => [k, parImg(v)]);
    const tickMs = .2; R.lignesLoop = [...lignes].sort((a, b) => b[1] - a[1]).slice(0, 50).map(([k, v]) => [k, parImg(v * tickMs)]);
    }
    /* (3) écritures DOM par image */
    if (A.ecr !== '0') {
      await c.ev(COMPTEURS);
      R.ecr = await c.ev(`(async function(){const E=window.__ecr;const f0=dbgJsImage().fr;E.n={};E.nul={};E.on=true;await new Promise(r=>setTimeout(r,${Math.min(S, 8) * 1000}));E.on=false;const n=Math.max(1,dbgJsImage().fr-f0);
        const o=Object.keys(E.n).map(k=>[k,+(E.n[k]/n).toFixed(2),+((E.nul[k]||0)/n).toFixed(2)]).sort((a,b)=>b[1]-a[1]);let t=0,tn=0;for(const x of o){t+=x[1];tn+=x[2];}return {images:n,parImage:+t.toFixed(1),inutilesParImage:+tn.toFixed(1),detail:o.slice(0,80)};})()`, 60000);
      if (R.ecr && R.ecr.detail) R.ecr.detail = R.ecr.detail.map(x => { const m = x[0].match(/^(.*)@(\d+)$/); return m ? [m[1] + ' ' + ou(+m[2])].concat(x.slice(1)) : x; });
    }
    /* (4) allocations : l'échantillonneur du tas sur S/2 secondes, sites sous loop */
    if (A.tas !== '0' && A.seul !== 'ecr') {
      await c.send('HeapProfiler.enable');
      const f0 = await c.ev('dbgJsImage().fr');
      await c.send('HeapProfiler.startSampling', { samplingInterval: 1024, includeObjectsCollectedByMajorGC: true, includeObjectsCollectedByMinorGC: true });
      await dormir(S * 500);
      const { profile: hp } = await c.send('HeapProfiler.stopSampling', {}, 120000); const f1 = await c.ev('dbgJsImage().fr');
      const nI = Math.max(1, f1 - f0), sites = new Map(); let tot = 0, totLoop = 0;
      const marche = (n, pile, dansLoop) => { const nom = n.callFrame.functionName; const dl = dansLoop || nom === 'loop';
        if (n.selfSize) { tot += n.selfSize; if (dl) { totLoop += n.selfSize; const k = (nom || '(anonyme)') + ' ' + ou(n.callFrame.lineNumber + 1) + ' ← ' + pile; sites.set(k, (sites.get(k) || 0) + n.selfSize); } }
        for (const k of n.children || []) marche(k, nom === 'loop' ? 'loop' : (dl ? (nom || '?') : pile), dl); };
      marche(hp.head, '', false);
      R.tas = { images: nI, octetsImage: Math.round(tot / nI), octetsImageLoop: Math.round(totLoop / nI),
        sites: [...sites].sort((a, b) => b[1] - a[1]).slice(0, 50).map(([k, v]) => [k, Math.round(v / nI)]) };
    }
    R.exc = c.exc.slice(0, 5); R.charge1 = require('os').loadavg()[0].toFixed(1);
  } finally { c.fin(); }
  fs.writeFileSync(path.join(OUT, TAG + '.json'), JSON.stringify(R, null, 1));
  console.log(JSON.stringify({ tranches: R.tranches, loop: R.loopMsImg, tout: R.toutMsImg, images: R.imagesProfil, ecr: R.ecr && [R.ecr.parImage, R.ecr.inutilesParImage], tas: R.tas && [R.tas.octetsImage, R.tas.octetsImageLoop], charge: [R.charge0, R.charge1] }));
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
