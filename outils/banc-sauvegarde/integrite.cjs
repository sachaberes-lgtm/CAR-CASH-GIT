/* LE BANC DE L'INTÉGRITÉ DE LA SAUVEGARDE (2026-11-08, session « sortie du jeu », agent C) — Chrome headless, téléphone émulé, MUET.
   Charge le VRAI jeu avec une série de sauvegardes déformées, visite les écrans qui lisent la sauvegarde, et relève :
     · toute exception JS / erreur console ;
     · tout « NaN », « Infinity », « undefined », « [object » écrit à l'écran ;
     · une sauvegarde réécrite avec un `null` là où il y avait un nombre (= un NaN passé dans JSON.stringify).
   Chaque cas démarre dans un profil Chrome NEUF (le localStorage part de zéro), puis le jeu est RECHARGÉ une fois sur ce qu'il a écrit lui-même.
   Cas : vide · tronquée · champs absents · nombres fous · tableaux à la place d'objets · très ancienne version · très anciennes clés rrXxx5 ·
         code importé d'ailleurs · solde énorme · ids mal formés.
   node outils/banc-sauvegarde/integrite.cjs [--cas vide,enorme] [--http 9931] [--cdp 9932] [--course 1] [--out dossier]
   Code de sortie 0 = tout vert, 1 = un cas KO. Dernière ligne : BANC OK / BANC KO.
   ⚠ Muet : Chrome part en --mute-audio et chaque sauvegarde fixe sfx/mus/vox à false quand elle le peut.
   ⚠ Ne lance jamais plus d'un Chrome à la fois ; il ne ferme que le sien. */
const fs = require('fs'), path = require('path');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir, tmp } = require('../banc-trainees/cdp.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.resolve(A.jeu || path.join(__dirname, '..', '..', 'VERSION PRINCIPALE'));
const P_HTTP = +(A.http || 9931), P_CDP = +(A.cdp || 9932);
const OUT = path.resolve(A.out || path.join(tmp(), 'sortie'));
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const MUET = { sfx: false, mus: false, vox: false };
const J = o => JSON.stringify(o);
const b64 = o => Buffer.from(J(o), 'utf8').toString('base64'); /* le format de SAVE.export : btoa(unescape(encodeURIComponent(JSON))) */

/* ---------- LES CAS ---------- */
const RECENTE = { v: 2, ...MUET, best: 5000, leaders: [{ n: 'TOI', s: 5000 }], bestCar: 3, equipped: 2, gamme: 3, eco: 3, bank: 123456, aura: 777, owned: [1, 2, 3],
  ex: { eng: 6, tricks: 40, gaps: 3, bumps: 9, zones: 2, chain: 12, kmh: 300, surv: 0, runs: 25, floor: 0 }, tuto: 1, permis: 1, bienv: 1, carr: { nuages: 2 },
  mis: { n: 3, ok: [1, 0, 1], best: [5, 0, 9] }, shop: { own: ['peinture:or'], eq: { peinture: 'or' } } };
const CAS = [
  { n: 'vide', ls: {} , note: 'aucune clé : premier lancement' },
  { n: 'tronquee', ls: { cashcarSave: '{"v":2,"bank":5000,"owned":[3,' }, note: 'JSON coupé en plein tableau' },
  { n: 'vide-objet', ls: { cashcarSave: '{}' }, note: '{} : tous les champs absents' },
  { n: 'v-seul', ls: { cashcarSave: J({ v: 2 }) }, note: '{v:2} seulement' },
  { n: 'nombres-fous', ls: { cashcarSave: '{"v":2,"best":-40,"bank":1e999,"aura":-1e999,"bestCar":1e999,"equipped":-7,"ex":{"runs":1e999,"floor":1e999,"eng":-3,"kmh":"x"},"vol":{"mus":1e999,"sfx":-5,"vox":"a"},"auraH":{"s":1e999,"n":-1},"prof":{"ne":1e999,"tA":-5,"dMax":1e999},"cad":{"t":1e999},"frenRec":1e999,"gamme":3,"eco":3}' }, note: 'Infinity / négatifs / chaînes dans les nombres' },
  { n: 'nombres-en-chaines', ls: { cashcarSave: J({ v: 2, bank: '5000', aura: '12', best: 'abc', bestCar: '2', equipped: '1', gamme: 3, eco: 3, ex: { runs: '9' } }) }, note: 'nombres écrits en texte' },
  { n: 'tableaux-pour-objets', ls: { cashcarSave: J({ v: 2, ex: [], mis: [], shop: [], m2: [], vol: [], carr: [], ai: [], prof: [], plq: [], cad: [], jour: [], dj: [], bq: [], pass: [], enCours: [], auraH: [], combos: [], carrSel: [], gamme: 3, eco: 3 }) }, note: 'chaque bloc remplacé par []' },
  { n: 'objets-pour-tableaux', ls: { cashcarSave: J({ v: 2, leaders: {}, owned: {}, figs: {}, figEq: {}, figEq3: {}, fruits: {}, mis: { ok: {}, best: {}, w: {} }, shop: { own: {}, eq: [] }, m2: { ok: {}, pr: {}, su: {}, c: { cartes: {}, pg: {} } }, gamme: 3, eco: 3 }) }, note: 'chaque liste remplacée par {}' },
  { n: 'types-melanges', ls: { cashcarSave: J({ v: 2, bank: {}, aura: [], best: null, leaders: [1, null, 'a', { n: 5 }, { n: 'ok', s: 'x' }], owned: ['a', null, -1, 1e9, 2.5], bestCar: {}, equipped: [], pseudo: 12, plq: { m: 5, x: [], ok: {} }, tuto: 'oui', figs: [1, 2, null], shop: { own: [1, null, 'a:b', '__proto__:x', 'peinture:constructor'], eq: { peinture: 'constructor', aile: '__proto__' } }, gamme: 3, eco: 3 }) }, note: 'types faux partout' },
  { n: 'tres-ancienne', ls: { cashcarSave: J({ v: 1, best: 4000, leaders: [{ n: 'AAA', s: 4000 }], bestCar: 4, sfx: false, vox: false, mus: false }) }, note: 'v1, sans gamme / eco / ex : toute la migration' },
  { n: 'tres-ancienne-gamme2', ls: { cashcarSave: J({ v: 2, ...MUET, gamme: 2, best: 900, bank: 5000, owned: [1, 2, 3], bestCar: 3, equipped: 3, ex: { floor: 3 } }) }, note: 'gamme 2 : caisses remises à zéro et remboursées' },
  { n: 'anciennes-cles', ls: { rrBest5: '1200', rrLeaders5: '[{"n":"ABC","s":900}]', rrBestCar5: '2', rrSfx5: '0', rrVox5: '0' }, note: 'avant la clé unique cashcarSave' },
  { n: 'cles-rrXxx-pourries', ls: { rrBest5: 'x', rrLeaders5: '{{', rrBestCar5: 'Infinity', rrSfx5: '0' }, note: 'anciennes clés illisibles' },
  { n: 'import-externe', ls: { cashcarSave: J({ v: 2, ...MUET, gamme: 3, eco: 3, extra: { a: 1 }, __proto__x: 1, bank: 4200, aura: 90, best: 100, mis: { n: 2, ok: [1, 1, 0], best: [3, 4, 0], f: 1, w: [1, 2, 3] }, nouveauChamp: [1, 2, 3], carr: { nuages: 5, ville: 1, inconnu: 9 } }) }, note: 'champs inconnus d\'une autre version' },
  { n: 'enorme', ls: { cashcarSave: J({ ...RECENTE, bank: 1e30, aura: 1e12, auraMax: 1e12, best: 1e30, bankMax: 1e30, ex: { ...RECENTE.ex, runs: 1e6, tricks: 1e7, kmh: 1e5 }, leaders: [{ n: 'TOI', s: 1e300 }], frenRec: 3600 }) }, note: 'solde, aura et record au plafond de san()' },
  { n: 'enorme-ordinaire', ls: { cashcarSave: J({ ...RECENTE, bank: 987654321012, aura: 123456789, best: 55555555555 }) }, note: 'un solde de joueur très riche (987 milliards)' },
  { n: 'ids-mal-formes', ls: { cashcarSave: J({ ...RECENTE, m2: { v: 1, ok: ['a b', 'x'.repeat(40), 5, null, '__proto__', 'constructor', 'meteo'], pr: 'x', su: ['a', 'b', 'c', 'd', 'e'], vu: { '__proto__': 3, 'ok': 'x' }, r: { fig: 'x', airP: -3 }, c: { morts: 'x', gagne: 1e999, cartes: ['nuages', 5, null], pg: [1, 'ok', {}] } } }) }, note: 'ids de missions mal formés / __proto__' },
  { n: 'flags-contradictoires', ls: { cashcarSave: J({ ...RECENTE, tuto: 0, permis: 1, bienv: 0, tutoProv: 1, facile: 'oui', gaucher: 'x', cmd: 'zzz', q: 'zzz', tctl: 'zzz', figG: 5, volH: 'plonge', vdep: 99 }) }, note: 'réglages hors liste' },
  { n: 'partie-interrompue', ls: { cashcarSave: J({ ...RECENTE, enCours: { v: 1e999, a: -5, e: 99, tr: 'x', ga: 1e999, bu: null, sv: 5, zo: 1, ch: 2, km: 300, s: 1e999, f: 1e999 } }) }, note: 'instantané de partie tuée, absurde' },
  { n: 'recente-saine', ls: { cashcarSave: J(RECENTE) }, note: 'témoin : une vraie sauvegarde' },
];

/* ---------- LES TÉMOINS ---------- */
const MAUVAIS = /\bNaN\b|Infinity|\bundefined\b|\[object|\bnull\b/;
const ECRANS = [
  { n: 'accueil', js: "window.__mGo('home')", att: 1500 },
  { n: 'reglages', js: "window.__mGo('set')", att: 1200 },
  { n: 'achat', js: "window.__mGo('shop')", att: 1500 },
  { n: 'accueil2', js: "window.__mGo('home')", att: 800 },
  { n: 'garage', tap: '#mHome [data-m="garage"]', att: 3500 },
  { n: 'inventaire', tap: '#gvCof', att: 2200 },
  { n: 'inventaire-retour', tap: '#gvCof', att: 1200 },
  { n: 'missions', tap: '#gvMis', att: 2500 },
  { n: 'missions-retour', tap: '#gMis .gmHome', att: 1200 },
  { n: 'profil', tap: '#gProf', att: 1500 },
  { n: 'profil-retour', tap: '#prof .pfRet', att: 1000 },
];

/* le script lancé dans la page : tout ce qui est écrit, sans les <script>/<style> ; la sauvegarde réécrite par le jeu et ses `null` */
const LIT = `(function(){var t=(document.body.innerText||'');var s=null,nulls=[],err=null;
  try{s=localStorage.getItem('cashcarSave');}catch(e){err='lecture : '+e;}
  var ok=false;try{var d=JSON.parse(s);ok=!!d&&typeof d==='object';
    (function w(v,p){if(v===null){if(p!=='pass')nulls.push(p);return;}if(v&&typeof v==='object'){for(var k in v)w(v[k],p?p+'.'+k:k);}})(d,'');}catch(e){err='JSON : '+e;}
  var m=/\\bNaN\\b|Infinity|\\bundefined\\b|\\[object|\\bnull\\b/.exec(t);var ctx=m?t.slice(Math.max(0,m.index-40),m.index+40).replace(/\\s+/g,' '):null;
  return JSON.stringify({texte:m?m[0]:null,ctx:ctx,lisible:ok,nulls:nulls.slice(0,8),err:err,len:s?s.length:0});})()`;

let NCAS = 0;
async function unCas(cas, rapport) {
  const prof = tmp();
  /* un port DIFFÉRENT par cas : Windows garde le port d'un Chrome fermé quelques secondes, le suivant ne répondait pas */
  let port = P_CDP + 2 + 2 * (NCAS++); while (!portLibre(port)) port++;
  const { ch, pg } = await lanceChrome(port, prof, 390, 844);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  const erreurs = [];
  c.ws.addEventListener('message', e => { try { const m = JSON.parse(e.data);
    if (m.method === 'Runtime.exceptionThrown') erreurs.push('exception: ' + ((m.params.exceptionDetails.exception && m.params.exceptionDetails.exception.description) || m.params.exceptionDetails.text || '').slice(0, 300));
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') erreurs.push('console: ' + m.params.args.map(a => a.value || a.description || '').join(' ').slice(0, 300)); } catch (e) {} });
  const R = { n: cas.n, note: cas.note, ko: [], vus: [] };
  const ko = (m) => { R.ko.push(m); };
  try {
    await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Network.enable');
    await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
    await c.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true, screenWidth: 390, screenHeight: 844 });
    await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' });
    const sem = await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{if(!sessionStorage.getItem("__fx")){sessionStorage.setItem("__fx","1");localStorage.clear();var L=' + J(cas.ls) + ';for(var k in L)localStorage.setItem(k,L[k]);}}catch(e){}' });
    const url = `http://127.0.0.1:${P_HTTP}/${A.page || 'index.html'}?colonne=0&tel=1&simu=1&garde=1&intro=ancien&attente=0`;
    const attends = async (lim) => { for (let i = 0; i < lim; i++) { await dormir(500); try { if (await c.ev("!!window.__gameReady&&typeof dbgState==='function'&&!!document.getElementById('mHome')&&document.getElementById('mHome').classList.contains('on')", 8000)) return true; } catch (e) {} } return false; };
    await c.send('Page.navigate', { url });
    if (!(await attends(120))) { ko('le jeu n\'arrive pas à l\'accueil en 60 s'); throw new Error('pas prêt'); }
    await dormir(2500);
    const tap = async (sel) => { const r = await c.ev(`(function(){const s=${J(sel)}.split(',');for(const q of s){const e=document.querySelector(q);if(!e)continue;const b=e.getBoundingClientRect();if(b.width<1||b.height<1)continue;return [b.left+b.width*.5,b.top+b.height*.5,q]}return null})()`);
      if (!r) return null; await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: r[0], y: r[1] }] }); await dormir(60);
      await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); return r[2]; };
    const regarde = async (quand) => { const r = JSON.parse(await c.ev(LIT, 8000)); R.vus.push(quand);
      if (r.texte) ko(quand + ' : « ' + r.texte + ' » écrit à l\'écran (…' + r.ctx + '…)');
      if (!r.lisible) ko(quand + ' : sauvegarde illisible dans localStorage (' + (r.err || '?') + ')');
      if (r.nulls && r.nulls.length) ko(quand + ' : null écrit dans la sauvegarde (NaN passé dans JSON) : ' + r.nulls.join(', '));
      return r; };
    await regarde('chargement');
    for (const et of ECRANS) {
      try { if (et.js) { await c.ev(et.js + ';1'); await dormir(300); } if (et.tap) await tap(et.tap); await dormir(et.att); await regarde(et.n); } catch (e) { ko(et.n + ' : ' + String(e).slice(0, 160)); }
    }
    if (A.course === '1') {
      try { await c.ev("window.__mGo('home');1"); await dormir(600); await tap('#mHome [data-m="garage"]'); await dormir(3500); await tap('#gJouer'); await dormir(400);
        try { await c.ev('window.dbgJouer&&dbgJouer();1'); } catch (e) {} await dormir(16000); await regarde('course');
        await c.ev("dbgDauphin('boom');1"); await dormir(7500); await regarde('mort'); } catch (e) { ko('course/mort : ' + String(e).slice(0, 160)); }
    }
    /* RECHARGEMENT sur ce que le jeu a écrit lui-même : même chose, rien ne se déforme */
    const avant = await c.ev("localStorage.getItem('cashcarSave')", 4000);
    await c.send('Page.removeScriptToEvaluateOnNewDocument', { identifier: sem.identifier });
    await c.send('Page.navigate', { url });
    if (!(await attends(120))) ko('rechargement : le jeu n\'arrive pas à l\'accueil');
    else { await dormir(2500); await regarde('rechargement'); const apres = await c.ev("localStorage.getItem('cashcarSave')", 4000);
      try { const a = JSON.parse(avant), b = JSON.parse(apres); for (const k of ['bank', 'aura', 'best', 'equipped', 'bestCar']) if (a && b && a[k] !== b[k]) ko('rechargement : ' + k + ' a bougé (' + a[k] + ' → ' + b[k] + ')'); } catch (e) { ko('rechargement : sauvegarde illisible'); } }
    for (const e of erreurs) ko(e);
    R.ecrit = await c.ev("(localStorage.getItem('cashcarSave')||'').length", 4000);
  } catch (e) { if (!R.ko.length) R.ko.push('échec du banc : ' + String(e).slice(0, 200)); }
  finally { try { c.close(); } catch (e) {} tueChrome(ch); await dormir(800); }
  rapport.push(R);
  console.log((R.ko.length ? 'KO  ' : 'ok  ') + R.n.padEnd(24) + ' ' + (R.ko.length ? R.ko.slice(0, 4).join(' | ') : R.vus.length + ' vues, écrit ' + R.ecrit + ' o') + '   [' + R.note + ']');
}

(async () => {
  for (const p of [P_HTTP, P_CDP]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  fs.mkdirSync(OUT, { recursive: true });
  const srv = await serveur(JEU, P_HTTP);
  const voulus = A.cas ? A.cas.split(',') : null, rapport = [];
  /* un ?demo=1 ou un autre profil n'a rien à faire ici : le localStorage est vierge à chaque cas */
  for (const cas of CAS) if (!voulus || voulus.includes(cas.n)) await unCas(cas, rapport);
  srv.close();
  fs.writeFileSync(path.join(OUT, 'integrite.json'), J(rapport));
  const kos = rapport.filter(r => r.ko.length);
  console.log(kos.length ? 'BANC KO — ' + kos.map(r => r.n).join(', ') : 'BANC OK — ' + rapport.length + ' sauvegardes, aucun NaN, aucune exception');
  process.exit(kos.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
