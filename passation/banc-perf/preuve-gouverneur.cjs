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
const CAD = lis('moteur/cadence.js'), GOUV = lis('moteur/gouverneur-thermique.js'), MOBH = lis('moteur/mobh-regime-chaud.js');

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
    const PAL={n:2,B:{},b(k,d){const a=PAL.B[k];return a?a[PAL.n]:d;}};
    let started=true,running=true,gameOver=false,garageOn=false,paused=false;
    const QL={k:0,essai:null},QLR={i:0,n:0,p75:__opts.p75==null?10:__opts.p75,vraiT:0,vrai:0,t0:0,qlN:0};
    const qlPose=function(k){QL.k=k;QL.pose=(QL.pose||0)+1;};
    function loop(){} loop._ms=16;loop._r30=false;
    ${CAD}
    ${GOUV}
    ${MOBH}
    return {CAD,MOB_S,MOB_G,QL,cadSaute,cadFin,mobChaud,mobhChaud,dbgGouv:window.dbgGouv,
      set:function(o){if('started' in o)started=o.started;if('gameOver' in o)gameOver=o.gameOver;if('p75' in o)QLR.p75=o.p75;},
      travail:function(now,w){QLR.t0=now-w;}, CAD30_REC, MOB_GOUV};
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
  ok('état 2 : aucun cran de qualité retiré', !M.QL.pose);
  M.ev['cc:thermique'][0]({ detail: { etat: 3 } }); M.ev['cc:thermique'][0]({ detail: { etat: 3 } });
  ok('état 3 : un cran de qualité, une seule fois', M.QL.pose === 1, 'qlPose appelé ' + M.QL.pose + ' fois');
  M.ev['cc:thermique'][0]({ detail: { etat: 0 } }); M.ev['cc:thermique'][0]({ detail: { etat: 3 } });
  ok('état 3 après retour à 0 : un nouvel épisode', M.QL.pose === 2);
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
console.log('7. régime chaud mobh (inactif par défaut)');
{
  const M = monde({ search: '?mob_g30=0', p75: 10 }); course(M, 200, 16.7, 12);
  ok('chaud (dose ≥ 160) mais ?mobh_chaud absent : mobhChaud() faux', M.mobChaud() && !M.mobhChaud());
  const N = monde({ search: '?mobh_chaud=1&mob_g30=0', p75: 10 });
  ok('?mobh_chaud=1, froid : faux', !N.mobhChaud()); course(N, 200, 16.7, 12);
  ok('?mobh_chaud=1, chaud : vrai', N.mobhChaud());
}
console.log(ko ? '\nPREUVE KO (' + ko + ')' : '\nPREUVE OK');
process.exit(ko ? 1 : 0);
