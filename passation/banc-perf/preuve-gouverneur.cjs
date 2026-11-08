#!/usr/bin/env node
/* PREUVE DU GOUVERNEUR THERMIQUE (2026-11-06, passe vitesse-fluide) — AUCUN navigateur : le VRAI texte de code/moteur/cadence.js + gouverneur-thermique.js
   tourne dans un bac `vm` de node, avec des bouchons minimaux (PAL, QL, QLR, loop, started/running/…), sur une horloge simulée.
   usage : node passation/banc-perf/preuve-gouverneur.cjs        (PREUVE OK / PREUVE KO, code de sortie 0 / 1)
   Cas :
     1. téléphone (TEL_NATIF) qui NE rate PAS ses images (p75 = 10 ms : la cadence réactive ne dit rien) : 7 min de course continue à 24 ms/image →
        le gouverneur cale sur 30 AVANT la 3e minute (dose 160 à ~2 min 40) et ne relâche pas jusqu'à la fin.
     2. REPOS ensuite (écran de mort) : la dose redescend de 0,25/s ; retour à 60 seulement sous le seuil bas (40). Chiffre le temps réel de repos.
     3. ordinateur (TEL_NATIF faux → CAD30_REC faux) : jamais calé, 7 min ; idem avec ?mob_gouv=0 sur téléphone ; idem ?cad30=0.
     4. ?mob_g30=1 : calé dès la 1re image de la course.
     5. événement iOS 'cc:thermique' état 2 : calage immédiat ; état 3 : un cran de qualité de moins, une seule fois par épisode.
     6. la cadence réactive (p75 = 24) qui cale après > 50 s de course : le gouverneur RETIENT le 30 (pas de retour à 60 « travail < 10 ms »).
     7. régime chaud (mobh) inactif par défaut : mobhChaud() faux même chaud ; actif avec ?mobh_chaud=1 seulement quand mobChaud(). */
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const DEPOT = path.resolve(__dirname, '../..');
const lis = f => fs.readFileSync(path.join(DEPOT, 'code', f), 'utf8');
const CAD = lis('moteur/cadence.js'), GOUV = lis('moteur/gouverneur-thermique.js'), PALS = lis('moteur/gouverneur-paliers.js'), MOBH = lis('moteur/mobh-regime-chaud.js');

function monde(opts) {
  opts = opts || {};
  const ev = {}, ls = {};
  const t = { now: 100000 };
  const ctx = vm.createContext({
    location: { search: opts.search || '' }, performance: { now: () => t.now }, Date,
    document: { hidden: false, addEventListener() {} },
    window: { addEventListener(n, f) { (ev[n] = ev[n] || []).push(f); }, dispatchEvent() {} },
    localStorage: { getItem: k => (k in ls ? ls[k] : null), setItem: (k, v) => { ls[k] = String(v); } },
    CustomEvent: function (n, o) { return { type: n, detail: o && o.detail }; }, console, Math, JSON, Float32Array, RegExp, Array, Object, Number,
    __opts: opts, __ev: ev, __t: t,
  });
  const code = `(function(){
    const TEL_NATIF=__opts.tel!==false, PFR_ON=false;
    const PAL={n:2,B:{qlMin:[4,0,0],cielImg:[2,1,1],ventK:[.5,.7,1],emiK:[.6,.8,1]},b(k,d){const a=PAL.B[k];return a?a[PAL.n]:d;}};
    let started=true,running=true,gameOver=false,garageOn=false,paused=false;
    const QL={k:0,essai:null,N_EFF:5},QLR={i:0,n:0,p75:__opts.p75==null?10:__opts.p75,vraiT:0,vrai:0,t0:0,qlN:0};
    let DPR_CAP=1.25;const DPR_MIN=.5,SAVE={d:{q:'net'}},devicePixelRatio=3;
    function dprPlafond(f){return f?1:1.25;} /* le plafond NETTE du départ de P2 */
    const IR={ok:false,cap:0,S:{},calls:[]};
    window.imgRegle=function(o){if(o==='reset'){if(IR.ok){DPR_CAP=IR.cap;IR.S={};IR.ok=false;}IR.calls.push('reset');qlPose(QL.k);return Object.assign({cap:DPR_CAP},IR.S);}
      if(o&&typeof o==='object'){if(!IR.ok){IR.ok=true;IR.cap=DPR_CAP;}Object.assign(IR.S,o);if('dpr' in o)DPR_CAP=o.dpr;IR.calls.push(o);qlPose(QL.k);}return Object.assign({cap:DPR_CAP},IR.S);};
    function qlBornes(){const cap=DPR_CAP,pl=Math.min(cap,1.25),bas=Math.min(pl,Math.max(DPR_MIN,1)),nA=Math.max(0,Math.ceil((cap-pl)/.08-1e-6)),nB=Math.max(0,Math.ceil((pl-bas)/.08-1e-6)),kNet=QL.N_EFF+nA,kBas=kNet+nB;return {cap,kMax:kBas+1};}
    const qlPose=function(k){const dem=k;const b=qlBornes();k=Math.max(PAL.b('qlMin',0),Math.min(b.kMax,k|0));if(dem===QL.k+1)QL.plus=(QL.plus||0)+1;QL.k=k;QL.pose=(QL.pose||0)+1;};
    const qlReprise=function(){QL.reprise=(QL.reprise||0)+1;QL.k=Math.min(QL.k,QL.N_EFF);qlPose(QL.k);};
    function loop(){} loop._ms=16;loop._r30=false;
    ${CAD}
    ${GOUV}
    ${PALS}
    ${MOBH}
    return {CAD,MOB_S,MOB_G,QL,cadSaute,cadFin,mobChaud,mobhChaud,dbgGouv:window.dbgGouv,
      set:function(o){if('started' in o)started=o.started;if('gameOver' in o)gameOver=o.gameOver;if('p75' in o)QLR.p75=o.p75;},
      travail:function(now,w){QLR.t0=now-w;}, CAD30_REC, MOB_GOUV, MOB_P, dprCap:function(){return DPR_CAP;}, setDprCap:function(v){DPR_CAP=v;}, pal:PAL, MOB_PALS, IR};
  })()`;
  const M = vm.runInContext(code, ctx);
  M.t = t; M.ev = ev; M.ctx = ctx;
  M.CAD.calme = true; // « calme » : ni reconstruction de zone, ni retour d'onglet…
  return M;
}
/* une image d'écran à l'horloge simulée : le saut éventuel (cadSaute), puis, si calculée, la fin d'image (cadFin) avec un travail de w ms */
function image(M, dtMs, w) {
  M.t.now += dtMs; const now = M.t.now;
  if (M.cadSaute(now)) return false;
  M.travail(now, w == null ? 12 : w); M.cadFin(now); return true;
}
function course(M, secondes, dtMs, w, surveille) {
  const fin = M.t.now + secondes * 1000; let premier = null;
  while (M.t.now < fin) { image(M, dtMs, w); if (surveille && premier === null && surveille(M)) premier = (M.t.now - (fin - secondes * 1000)) / 1000; }
  return premier;
}
let ko = 0;
const ok = (nom, cond, detail) => { console.log((cond ? '  ✔ ' : '  ✘ ') + nom + (detail ? '  — ' + detail : '')); if (!cond) ko++; };

console.log('1. téléphone, images à 24 ms, la cadence réactive ne dit rien (p75 10 ms) : 7 min de course');
{
  const M = monde({ search: '?mob_g30=0', p75: 10 });
  const premier = course(M, 420, 24, 12, m => m.CAD.on);
  ok('le gouverneur est actif sur téléphone', M.MOB_GOUV === true);
  ok('bascule à 30 avant la 3e minute', premier !== null && premier < 180, 'bascule à ' + (premier && premier.toFixed(0)) + ' s (dose ' + M.dbgGouv().D + ')');
  ok('toujours calé à 7 min', M.CAD.on === true, 'dose ' + M.dbgGouv().D + ' (plafond ' + M.MOB_G.max + ')');
  ok('jamais calé avant 2 min', premier > 120, '');
  console.log('2. repos (écran de mort) : combien de temps avant le retour à 60 ?');
  M.set({ gameOver: true });
  const D0 = M.dbgGouv().D;
  // 90 s de repos
  course(M, 90, 24, 12);
  const D90 = M.dbgGouv().D;
  ok('90 s de repos : la dose a baissé de ~22 (0,25/s)', Math.abs((D0 - D90) - 22.5) < 1.5, 'dose ' + D0 + ' → ' + D90);
  ok('90 s de repos ne suffisent PAS à repasser à 60 (hystérésis, design de la branche)', M.dbgGouv().actif === true);
  const t0 = M.t.now; course(M, 900, 24, 12, m => !m.dbgGouv().actif);
  ok('retour à « froid » sous le seuil bas', M.dbgGouv().actif === false && M.dbgGouv().D < M.MOB_G.bas, 'froid après ' + Math.round((M.t.now - t0) / 1000 + 90) + ' s de repos au total');
  M.set({ gameOver: false }); course(M, 3, 24, 12);
  ok('nouvelle course à froid : pas calé (60)', M.CAD.on === false);
}
console.log('3. jamais calé : ordinateur, ?mob_gouv=0, ?cad30=0');
for (const [nom, o] of [['ordinateur (TEL_NATIF faux)', { tel: false, p75: 10 }], ['?mob_gouv=0', { search: '?mob_gouv=0', p75: 10 }], ['?cad30=0', { search: '?cad30=0', p75: 10 }]]) {
  const M = monde(o); let calee = false; course(M, 420, 24, 12, m => (calee = calee || m.CAD.on, false));
  ok(nom + ' : 7 min sans jamais caler', !calee && M.dbgGouv().D === 0 && M.dbgGouv().actif === false, 'dose ' + M.dbgGouv().D + ' · ' + M.dbgGouv().pourquoi);
}
console.log('4. PAR DÉFAUT (g30) : 30 calé dès le départ, 7 min tenues ; ?mob_g30=0 : pas calé à froid');
{
  const M = monde({ p75: 10 }); const p = course(M, 5, 16.7, 12, m => m.CAD.on);
  ok('calé dans la 1re seconde par défaut', p !== null && p < 1, 'à ' + (p && p.toFixed(2)) + ' s');
  let sorti = false; course(M, 420, 33.3, 6, m => (sorti = sorti || !m.CAD.on, false));
  ok('7 min : jamais relâché, même avec un travail de 6 ms (la sortie réactive ne joue pas)', !sorti && M.CAD.on);
  const A = monde({ search: '?mob_g30=0', p75: 10 }); course(A, 5, 16.7, 12);
  ok('?mob_g30=0 : pas calé à froid', A.CAD.on === false);
  const B = monde({ search: '?mob_g30=1', p75: 10 }); course(B, 2, 16.7, 12);
  ok('?mob_g30=1 : calé (compatible avec l\'ancienne adresse)', B.CAD.on === true);
}
console.log('5. état thermique d\'iOS (cc:thermique)');
{
  const M = monde({ search: '?mob_g30=0', p75: 10 }); course(M, 5, 16.7, 12);
  ok('froid (?mob_g30=0) : pas calé', M.CAD.on === false);
  M.ev['cc:thermique'][0]({ detail: { etat: 2 } }); course(M, 1, 16.7, 12);
  ok('état 2 : calage immédiat', M.CAD.on === true && M.mobChaud(), JSON.stringify(M.dbgGouv()));
  ok('état 2 : aucun cran de qualité retiré', !M.QL.plus);
  M.ev['cc:thermique'][0]({ detail: { etat: 3 } }); M.ev['cc:thermique'][0]({ detail: { etat: 3 } });
  ok('état 3 : un cran de qualité, une seule fois', M.QL.plus === 1, 'cran +1 demandé ' + M.QL.plus + ' fois');
  M.ev['cc:thermique'][0]({ detail: { etat: 0 } }); M.ev['cc:thermique'][0]({ detail: { etat: 3 } });
  ok('état 3 après retour à 0 : un nouvel épisode', M.QL.plus === 2);
}
console.log('6. la cadence réactive cale (p75 24 ms) après plus d\'une minute de course : le gouverneur retient le 30');
{
  const M = monde({ search: '?mob_g30=0', p75: 24 });
  // 75 s à 60 sans que rien ne cale (calme faux = la réactive ne joue pas), puis la réactive joue
  M.CAD.calme = false; course(M, 75, 16.7, 12); const D = M.dbgGouv().D; M.CAD.calme = true;
  ok('dose > 50 après 75 s', D > 50 && D < 160, 'dose ' + D);
  course(M, 6, 16.7, 12, m => m.CAD.on); ok('la réactive cale', M.CAD.on === true);
  ok('le gouverneur s\'enclenche (actif) par la cadence réactive', M.dbgGouv().actif === true);
  M.set({ p75: 5 }); course(M, 30, 33.3, 6); // le travail repasse sous 10 ms pendant 30 s : sans gouverneur la sortie réactive ramènerait à 60
  ok('travail < 10 ms pendant 30 s : reste calé à 30', M.CAD.on === true);
  const S = monde({ search: '?mob_gouv=0&mob_g30=0', p75: 24 }); S.CAD.calme = true; course(S, 8, 16.7, 12);
  S.set({ p75: 5 }); course(S, 30, 33.3, 6);
  ok('contrôle ?mob_gouv=0 : la sortie réactive ramène bien à 60', S.CAD.on === false);
}
console.log('7. régime chaud mobh : actif par défaut à dose >= 100');
{
  const M = monde({ p75: 10 }); course(M, 30, 16.7, 12);
  ok('défaut, 30 s de course (dose ~15, 30 calé) : régime chaud éteint', M.mobChaud() && !M.mobhChaud(), 'dose ' + M.dbgGouv().D);
  course(M, 200, 16.7, 12);
  ok('défaut, dose >= 100 : régime chaud allumé', M.dbgGouv().D >= 100 && M.mobhChaud(), 'dose ' + M.dbgGouv().D);
  const Z = monde({ search: '?mobh_chaud=0', p75: 10 }); course(Z, 300, 16.7, 12);
  ok('?mobh_chaud=0 : jamais', !Z.mobhChaud());
  const G = monde({ search: '?gouv=max', p75: 10 }); course(G, 300, 16.7, 12);
  ok('?gouv=max : jamais (dose haute, régime chaud éteint)', G.dbgGouv().D >= 100 && !G.mobhChaud());
  const N = monde({ search: '?mobh_chaud=1', p75: 10 }); course(N, 2, 16.7, 12);
  ok('?mobh_chaud=1 : chaud dès que le gouverneur dit chaud (30 calé)', N.mobhChaud());
}
console.log('8. paliers de coût GPU de la dose (gouverneur-paliers.js, par imgRegle)');
{
  const M = monde({ p75: 10 }), t = {}; const g0 = () => M.dbgGouv().gpu;
  ok('avant tout : palier 0, plafond 1,25 (départ de P2), aucun appel à imgRegle, rien d\'écrit', g0().palier === 0 && M.dprCap() === 1.25 && M.IR.calls.length === 0 && M.pal.b('ventK', 1) === 1 && M.pal.b('emiK', 1) === 1);
  const t0 = M.t.now;
  while (M.t.now - t0 < 330000) { image(M, 16.7, 12); const p = g0().palier; if (!(p in t)) t[p] = (M.t.now - t0) / 1000; }
  ok('palier 1 vers 2 min (dose 60 à 0,5/s)', t[1] > 110 && t[1] < 135, t[1] && t[1].toFixed(0) + ' s');
  ok('palier 2 vers 3 min 20 (dose 100)', t[2] > 190 && t[2] < 215, t[2] && t[2].toFixed(0) + ' s');
  ok('palier 3 vers 4 min 40 (dose 140)', t[3] > 270 && t[3] < 295, t[3] && t[3].toFixed(0) + ' s');
  ok('UN SEUL appel à imgRegle par bascule (3 montées = 3 appels, jamais de reset entre deux paliers)', M.IR.calls.length === 3 && M.IR.calls.every(c => typeof c === 'object'), M.IR.calls.length + ' appels');
  const g = g0(), S = M.IR.S;
  ok('palier 3 : plafond 0,8, halo coupé, ombre 512, ciel 1 sur 8, traits ×½, vent et émission ×½, plancher d\'échelle au cran maximal (6)',
     g.palier === 3 && g.dprCap === .8 && S.halo === 'off' && S.ombre === 512 && S.ciel === 8 && S.stries === .5 && g.ventK === .5 && g.emiK === .5 && g.qlMin === 6, JSON.stringify({ g: g.palier, cap: g.dprCap, S, vent: g.ventK, emi: g.emiK, ql: g.qlMin }));
  ok('le cran est tenu d\'un coup (QL au maximum)', M.QL.k === 6, 'cran ' + M.QL.k);
  M.setDprCap(1.5); course(M, 2, 16.7, 12);
  ok('un changement de réglage qui rend 1,5 : le plafond du palier est repris', M.dprCap() === .8);
  // le repos : descente lente, un palier à la fois, une minute au moins entre deux
  M.set({ gameOver: true }); const r0 = M.t.now; const pr = [];
  while (M.t.now - r0 < 600000) { image(M, 100, 12); const p = g0().palier; if (!pr.length || pr[pr.length - 1][1] !== p) pr.push([(M.t.now - r0) / 1000, p]); }
  console.log('     repos : ' + pr.map(x => Math.round(x[0]) + ' s → palier ' + x[1]).join(' · '));
  ok('au repos : le palier 3 tient au moins 60 s', pr[1] && pr[1][1] === 2 && pr[1][0] >= 59, pr[1] && pr[1][0].toFixed(0) + ' s');
  ok('au repos : un palier à la fois (3 → 2 → 1 → 0), jamais de saut', pr.map(x => x[1]).join('') === '3210', pr.map(x => x[1]).join(' '));
  ok('la descente : 3 → 2 → 1 par un seul appel chacun, 1 → 0 par reset (+1 appel du plafond repris)', M.IR.calls.length === 3 + 1 + 3 && M.IR.calls[M.IR.calls.length - 1] === 'reset', M.IR.calls.length + ' appels au total');
  ok('palier 0 retrouvé : le départ de P2 est rendu (plafond 1,25, rien posé, vent/émission/plancher d\'origine)',
     g0().palier === 0 && M.dprCap() === 1.25 && Object.keys(M.IR.S).length === 0 && M.pal.b('qlMin', 0) === 0 && M.pal.b('ventK', 1) === 1 && M.pal.b('emiK', 1) === 1);
  const X = monde({ search: '?gouv=max', p75: 10 }); X.dbgGouv(200); course(X, 5, 16.7, 12);
  ok('?gouv=max : dose 200, aucun palier, aucun appel à imgRegle', X.dbgGouv().gpu.palier === 0 && X.dprCap() === 1.25 && X.IR.calls.length === 0);
  const O = monde({ search: '?mob_gouv=0', p75: 10 }); course(O, 5, 16.7, 12);
  ok('?mob_gouv=0 : pas de gouverneur, pas de palier', O.dbgGouv().gpu === null && O.dprCap() === 1.25);
  const E = monde({ tel: false, p75: 10 }); course(E, 400, 16.7, 12);
  ok('ordinateur : jamais de palier ni de plafond bougé', E.dprCap() === 1.25 && E.dbgGouv().gpu === null && E.IR.calls.length === 0);
  const T = monde({ search: '?mob_g30=0', p75: 10 }); course(T, 2, 16.7, 12);
  T.ev['cc:thermique'][0]({ detail: { etat: 2 } }); course(T, 3, 16.7, 12);
  ok('état iOS 2 : la dose passe à 160 (gouverneur-thermique) donc palier 3 tout de suite', T.dbgGouv().D >= 160 && T.dbgGouv().gpu.palier === 3 && T.dprCap() === .8);
}
console.log('8b. polyphonie des bruitages sous la chaleur (window.__ccPoly)');
{
  const M = monde({ p75: 10 });
  const P = () => vm.runInContext('window.__ccPoly', M.ctx);
  ok('défini sur téléphone récent, éteint au départ', P() && P().on === false && P().k === .5 && P().min === .06);
  M.dbgGouv(110); course(M, 3, 16.7, 12);
  ok('palier 2 en course : allumé', P().on === true);
  M.set({ gameOver: true }); course(M, 3, 16.7, 12);
  ok('mort / menu : éteint (les clics d\'interface ne sont jamais ignorés)', P().on === false);
  M.set({ gameOver: false }); course(M, 3, 16.7, 12);
  ok('retour en course : rallumé', P().on === true);
  const B = monde({ p75: 10 }); B.dbgGouv(70); course(B, 3, 16.7, 12);
  ok('palier 1 : éteint', B.ctx.window.__ccPoly.on === false);
  const O = monde({ search: '?mob_poly=0', p75: 10 }); O.dbgGouv(110); course(O, 3, 16.7, 12);
  ok('?mob_poly=0 : jamais défini', O.ctx.window.__ccPoly === undefined);
  const X = monde({ search: '?gouv=max', p75: 10 }); X.dbgGouv(110); course(X, 3, 16.7, 12);
  ok('?gouv=max : jamais défini', X.ctx.window.__ccPoly === undefined);
  const E = monde({ tel: false, p75: 10 }); course(E, 5, 16.7, 12);
  ok('ordinateur : jamais défini', E.ctx.window.__ccPoly === undefined);
}
console.log('9. remontée vers l\'image de l\'ordinateur (paliers négatifs ; ?mob_raise=1, inactive par défaut)');
{
  // frais et fluide : la dose tenue à 10, travail de l'image 6 ms → −1 à 60 s, −2 à 120 s, pas de −3
  const M = monde({ search: '?mob_raise=1', p75: 10 }), pas = []; const t0 = M.t.now;
  while (M.t.now - t0 < 200000) { M.dbgGouv(10); image(M, 16.7, 6); const p = M.dbgGouv().gpu.palier; if (!pas.length || pas[pas.length - 1][1] !== p) pas.push([(M.t.now - t0) / 1000, p]); }
  console.log('     ' + pas.map(x => Math.round(x[0]) + ' s → palier ' + x[1]).join(' · '));
  ok('frais et fluide : palier −1 vers 60 s, −2 vers 120 s, jamais plus', pas.map(x => x[1]).join(' ') === '0 -1 -2' && pas[1][0] > 58 && pas[1][0] < 64 && pas[2][0] > 118 && pas[2][0] < 126, JSON.stringify(pas));
  ok('−2 : plafond 1,5 + halo plein à 5 mips + ombre 1024', M.dprCap() === 1.5 && M.IR.S.halo === 'tout' && M.IR.S.mips === 5 && M.IR.S.ombre === 1024, JSON.stringify(M.IR.S));
  // la fluidité manque 5 s de suite : retour au départ, pas de nouvelle remontée dans la course
  M.set({ p75: 24 }); course(M, 7, 16.7, 6);
  ok('fluidité perdue : retour d\'un coup au palier 0 (plafond 1,25, rien posé)', M.dbgGouv().gpu.palier === 0 && M.dprCap() === 1.25 && Object.keys(M.IR.S).length === 0);
  M.set({ p75: 10 }); const t1 = M.t.now; while (M.t.now - t1 < 130000) { M.dbgGouv(10); image(M, 16.7, 6); }
  ok('pas de nouvelle remontée dans la même course', M.dbgGouv().gpu.palier === 0 && M.dbgGouv().gpu.interdit === true);
  M.set({ gameOver: true }); course(M, 3, 16.7, 6); M.set({ gameOver: false });
  ok('après la course (repos), la remontée est de nouveau permise', M.dbgGouv().gpu.interdit === false);
  const N = monde({ search: '?mob_raise=1', p75: 10 }); const n0 = N.t.now; while (N.t.now - n0 < 100000) { N.dbgGouv(10); image(N, 16.7, 14); }
  ok('travail de l\'image à 14 ms (> 12) : jamais de remontée', N.dbgGouv().gpu.palier === 0);
  const Q = monde({ search: '?mob_raise=1', p75: 10 }); const q0 = Q.t.now; while (Q.t.now - q0 < 100000) { Q.dbgGouv(45); image(Q, 16.7, 6); }
  ok('dose >= 40 (pas frais) : jamais de remontée', Q.dbgGouv().gpu.palier === 0);
  const Z = monde({ p75: 10 }); const z0 = Z.t.now; while (Z.t.now - z0 < 100000) { Z.dbgGouv(10); image(Z, 16.7, 6); }
  ok('PAR DÉFAUT (sans ?mob_raise=1) : jamais de remontée', Z.dbgGouv().gpu.palier === 0 && Z.IR.calls.length === 0);
  const G = monde({ search: '?mob_raise=1', p75: 10 }), gp = []; const g1 = G.t.now;
  while (G.t.now - g1 < 230000) { image(G, 16.7, 6); const p = G.dbgGouv().gpu.palier; if (!gp.length || gp[gp.length - 1][1] !== p) gp.push([(G.t.now - g1) / 1000, p]); }
  console.log('     course normale (30 calé, dose +0,5/s, travail 6 ms) : ' + gp.map(x => Math.round(x[0]) + ' s → palier ' + x[1]).join(' · '));
  ok('course normale : −1 vers 60 s (dose 30), puis le palier 1 dès la dose 60 (~2 min), puis 2 vers 3 min 20', gp.map(x => x[1]).join(' ') === '0 -1 1 2' && gp[1][0] > 58 && gp[1][0] < 64 && gp[2][0] > 118 && gp[2][0] < 125, JSON.stringify(gp.map(x => [Math.round(x[0]), x[1]])));
}
console.log(ko ? '\nPREUVE KO (' + ko + ')' : '\nPREUVE OK');
process.exit(ko ? 1 : 0);
