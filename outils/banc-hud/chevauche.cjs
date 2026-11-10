// LES CHEVAUCHEMENTS DU HUD (2026-11-10, debug HUD — Sacha : « insiste vraiment sur le HUD, y a plein de problèmes de superposition et tout,
// genre quand la dark triad apparaît »). Même mise en route que pilote.cjs / photos.cjs (cdp.cjs du banc des traînées) ; pour chaque LANGUE ×
// GABARIT, une course neuve, puis une suite d'ÉTATS forcés par les crochets dbg* ; à chaque état, mesure-hud.js relève l'ENCRE de chaque bloc
// du HUD et rend : paires qui se recouvrent (> 4 px²), ce qui sort de l'écran, ce qui entre dans l'encoche / la Dynamic Island / l'indicateur
// d'accueil (marges simulées par --ccT/B/L/R sur <html>, que le jeu lit à la place de env(safe-area-inset-*)), texte coupé, police ≠ Press Start 2P.
// Une photo réduite (½) par état. Jamais de son (sfx, mus, vox coupés dans la sauvegarde avant le chargement).
//   node outils/banc-hud/chevauche.cjs --out /chemin [--gab se,13p,max,393,se-c,13p-c,max-c] [--lang fr,en] [--etats a,b] [--http 9771 --cdp 9772] [--prof /chemin]
// Sortie : <out>/<lang>-<gab>/<etat>.png + <out>/releve.json (tout) ; résumé en console.
const fs = require('fs'), path = require('path');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir, tmp } = require('../banc-trainees/cdp.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.resolve(A.jeu || path.join(__dirname, '..', '..', 'VERSION PRINCIPALE'));
const OUT = path.resolve(A.out || path.join(__dirname, 'chevauche'));
const PROF = A.prof ? path.resolve(A.prof) : tmp();
const P_HTTP = +(A.http || 9771), P_CDP = +(A.cdp || 9772);
/* gabarits : [largeur, hauteur] en points ; marges sûres d'un iPhone à Dynamic Island (portrait haut 59 / bas 34 ; paysage côtés 59 / bas 21) */
const GABS = { se: [375, 667], '13p': [390, 844], max: [430, 932], '393': [393, 852], 'se-c': [667, 375], '13p-c': [844, 390], 'max-c': [932, 430] };
const GAB = (A.gab || 'se,13p,max,393,se-c,13p-c,max-c').split(',');
const LANGS = (A.lang || 'fr').split(',');
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const SAVE = { v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, bank: 1234567, aura: 1200, auraMax: 3000, owned: [0, 1, 2, 3], ex: { runs: 12, kmh: 260 }, plq: { m: 'fr', x: 'CC-161-RZ', ok: 1 } };
const MESURE = fs.readFileSync(path.join(__dirname, 'mesure-hud.js'), 'utf8');

/* les marges sûres simulées (inline sur <html> : elles l'emportent sur html.telCadre) et les zones interdites */
function marges(W, H) { const deb = H > W; return deb ? { T: 59, B: 34, L: 0, R: 0 } : { T: 0, B: 21, L: 59, R: 59 }; }
function zones(W, H) { const m = marges(W, H), Z = [];
  if (m.T) Z.push({ n: 'encoche-haut', l: 0, t: 0, r: W, b: m.T }); if (m.B) Z.push({ n: 'accueil-bas', l: 0, t: H - m.B, r: W, b: H });
  if (m.L) Z.push({ n: 'encoche-gauche', l: 0, t: 0, r: m.L, b: H }); if (m.R) Z.push({ n: 'encoche-droite', l: W - m.R, t: 0, r: W, b: H }); return Z; }

/* LES ÉTATS, dans l'ordre (chacun part de l'état d'avant) : js = ce qu'on déclenche ; att = ms avant la mesure ; serie = mesures en rafale
   (ms depuis le déclenchement, sans photo sauf la dernière) ; photo:false = pas de photo */
const MILLE = "(function(){try{dbgChance('$',1234567)}catch(e){}})()";
const ETATS = [
  { n: 'depart', att: 600 },
  { n: 'course', att: 3500 },
  { n: 'flow50', js: "dbgFren('v',50)", att: 900 },
  { n: 'flow80', js: "dbgFren('v',80)", att: 900 },
  { n: 'flow100', js: "dbgFren('v',100)", att: 900 },
  { n: 'entree', js: "TIENT;dbgFren('entre')", serie: [0, 100, 250, 500, 1000, 1800] },
  { n: 'fren-chrono', js: MILLE, att: 2500 },
  { n: 'fren-vol', js: "dbgTakeoff()", att: 1200 },
  { n: 'fren-airmax', js: "dbgPwr('a')", att: 900 },
  { n: 'fren-nitromax', js: "dbgPwr('n')", att: 900 },
  { n: 'fren-chaine', js: "dbgHud('chaine',4);dbgHud('record',500)", att: 700 },
  { n: 'fren-annonce', js: "dbgHud('verdict','m3');dbgHud('pop','400 KM/H !')", serie: [100, 400, 900] },
  { n: 'fren-x10', js: "dbgHud('chaine',12)", att: 600 },
  { n: 'fren-sortie', js: "clearInterval(window.__tient);window.__tient=0", serie: [800, 1600, 2400, 3200, 4200] },
  { n: 'pouvoirs', js: "dbgPwr('v');dbgPwr('m');dbgPwr('x')", att: 900 },
  { n: 'mission', js: "(function(){var L=dbgMissions()||[];var m=L.filter(function(x){return !x.reussie})[0];return m?dbgMissions('gagne',m.id):'aucune'})()", serie: [200, 900, 2000] },
  { n: 'portail', js: "dbgPortail(120)", serie: [1500, 3000, 4500] },
  { n: 'pause', js: "window.__panBascule()", att: 900 },
  { n: 'reprise', js: "window.__panBascule()", serie: [100, 700, 1400, 2300] },
  { n: 'pire', js: "TIENT;dbgFren('v',100);dbgFren('entre');dbgPwr('n');dbgPwr('a');dbgPwr('v');dbgHud('chaine',12);dbgHud('record',500);dbgHud('verdict','m3');dbgHud('pop','500 KM/H !');" + MILLE, serie: [100, 300, 700, 1500] },
  { n: 'pire-vol', js: "dbgTakeoff()", att: 900 },
  { n: 'chance', js: "dbgChance('$',50000);dbgChance('mort')", att: 4000 },
];
/* LA FRÉNÉSIE TENUE : sans style, les trois traits se vident en ~2 s et l'emblème s'en va — on les nourrit tant qu'on la photographie */
for (const E of ETATS) if (E.js) E.js = E.js.replace('TIENT;', "window.__tient=window.__tient||setInterval(function(){try{if(dbgFren().lv>=4){dbgFren('trait','n');dbgFren('trait','m');dbgFren('trait','p');dbgFren('nourrit',5)}}catch(e){}},300);");
const QUELS = A.etats ? A.etats.split(',') : null;

(async () => {
  for (const p of [P_HTTP, P_CDP]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  fs.mkdirSync(OUT, { recursive: true });
  const srv = await serveur(JEU, P_HTTP);
  const [W0, H0] = GABS[GAB[0]];
  const { ch, pg } = await lanceChrome(P_CDP, PROF, W0, H0);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  const erreurs = [];
  c.ws.addEventListener('message', e => { try { const m = JSON.parse(e.data); if (m.method === 'Runtime.exceptionThrown') erreurs.push(JSON.stringify(m.params.exceptionDetails).slice(0, 300)); } catch (x) {} });
  const fin = () => { try { c.close(); } catch (e) {} tueChrome(ch); srv.close(); };
  process.on('SIGINT', () => { fin(); process.exit(1); });
  const releve = fs.existsSync(path.join(OUT, 'releve.json')) ? JSON.parse(fs.readFileSync(path.join(OUT, 'releve.json'), 'utf8')) : {};
  try {
    await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Network.enable');
    await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
    await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' });
    await c.send('Emulation.setEmulatedMedia', { features: [{ name: 'hover', value: 'none' }, { name: 'pointer', value: 'coarse' }] });
    let scriptId = null;
    for (const lang of LANGS) for (const g of GAB) {
      const [W, H] = GABS[g], m = marges(W, H), dir = path.join(OUT, lang + '-' + g); fs.mkdirSync(dir, { recursive: true });
      await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 2, mobile: true, screenWidth: W, screenHeight: H });
      if (scriptId) await c.send('Page.removeScriptToEvaluateOnNewDocument', { identifier: scriptId });
      const src = 'try{localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAVE)) + ');localStorage.setItem("ccLang",' + JSON.stringify(lang) + ')}catch(e){}' +
        `document.addEventListener('DOMContentLoaded',function(){var s=document.documentElement.style;s.setProperty('--ccT','${m.T}px');s.setProperty('--ccB','${m.B}px');s.setProperty('--ccL','${m.L}px');s.setProperty('--ccR','${m.R}px')});`;
      scriptId = (await c.send('Page.addScriptToEvaluateOnNewDocument', { source: src })).identifier;
      const demarre = async () => {
      await c.send('Page.navigate', { url: `http://127.0.0.1:${P_HTTP}/index.html?colonne=0&tel=1&app=1&garde=1&intro=ancien&attente=0` + (A.q ? '&' + A.q : '') });
      let pret = false;
      for (let i = 0; i < 400; i++) { await dormir(500); try { if (await c.ev("!!window.__gameReady&&typeof dbgJouer==='function'", 8000)) { pret = true; break; } } catch (e) {} }
      if (!pret) { console.log(lang, g, 'le jeu ne démarre pas'); return false; }
      await c.ev(MESURE + ';1');
      await dormir(2000);
      await c.ev("(function(){var s=document.getElementById('splash');if(!s)return 0;try{s.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));s.dispatchEvent(new PointerEvent('pointerup',{bubbles:true}));s.click();}catch(e){}return 1})()");
      await dormir(2000);
      let enC = false;
      for (let i = 0; i < 240; i++) { if (i % 16 === 0) { try { await c.ev('dbgJouer()'); } catch (e) {} } await dormir(500);
        try { if (await c.ev("(function(){var s=dbgState();return !!(s.started&&s.running&&!s.gameOver)})()")) { enC = true; break; } } catch (e) {} }
      if (enC) await c.ev("dbgAuto(true,0,{vol:true});1");
      return enC; };
      if (!(await demarre())) { console.log(lang, g, 'la course ne part pas'); continue; }
      const Z = zones(W, H);
      /* gel : les animations CSS sont mises en pause le temps de la mesure et de la photo (une prise d'écran dure 0,2-1 s sur le Mac chargé :
         sans gel, l'image d'« entrée à 100 ms » serait celle de 600 ms) — elles repartent ensuite */
      const prend = async (nom, photo, gel) => {
        let r = null; try { r = await c.ev((gel ? 'window.__gel=document.getAnimations().filter(function(a){return a.playState==="running"});window.__gel.forEach(function(a){a.pause()});' : '') + 'JSON.stringify(window.__hudMesure(' + JSON.stringify(nom) + ',' + JSON.stringify(Z) + '))', 30000); r = JSON.parse(r); } catch (e) { r = { err: e.message.slice(0, 200) }; }
        if (photo) { try { const sh = await c.send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: W, height: H, scale: 0.5 } }, 40000); fs.writeFileSync(path.join(dir, nom + '.png'), Buffer.from(sh.data, 'base64')); } catch (e) { r.photo = e.message.slice(0, 80); } }
        if (gel) try { await c.ev('(window.__gel||[]).forEach(function(a){try{a.play()}catch(e){}});window.__gel=null;1'); } catch (e) {}
        try { r.etat = await c.ev("(function(){var s=dbgState();return {go:s.gameOver,mode:s.mode,p:s.paused}})()"); } catch (e) {}
        releve[lang + '-' + g + '/' + nom] = r;
        const np = (r.pairs || []).length, nh = (r.hors || []).length, nz = (r.zone || []).length, nc = (r.coupes || []).length, nf = (r.polices || []).length;
        console.log(lang, g, nom.padEnd(18), 'paires', np, 'hors', nh, 'zone', nz, 'coupé', nc, 'police', nf, r.err ? r.err : '', (r.pairs || []).map(p => p.k + ' ' + p.aire).join(' ; ').slice(0, 300));
      };
      for (const E of ETATS) {
        if (QUELS && QUELS.indexOf(E.n) < 0) continue;
        /* la caisse est morte en route (le pilote de mesure rate parfois une pose) : une course neuve, sauf pour l'état qui la veut morte */
        if (E.n !== 'chance') { let go = false; try { go = await c.ev('dbgState().gameOver'); } catch (e) {}
          if (go) { console.log('  morte avant', E.n, ': course neuve'); if (!(await demarre())) break; await dormir(1500); } }
        try { if (E.js) await c.ev(E.js + ';1'); } catch (e) { console.log('  js', E.n, e.message.slice(0, 120)); }
        if (E.serie) { let t0 = Date.now(), perdu = 0; for (let i = 0; i < E.serie.length; i++) { const t0i = Date.now(); const t = E.serie[i], d = t - (Date.now() - t0 - perdu); if (d > 0) await dormir(d); const a = Date.now(); await prend(E.n + '-' + t, true, true); perdu += Date.now() - a; } }
        else { await dormir(E.att || 500); await prend(E.n, true); }
      }
      fs.writeFileSync(path.join(OUT, 'releve.json'), JSON.stringify(releve, null, 1));
    }
  } catch (e) { console.error('ERREUR', e); }
  fs.writeFileSync(path.join(OUT, 'releve.json'), JSON.stringify(releve, null, 1));
  fs.writeFileSync(path.join(OUT, 'erreurs.json'), JSON.stringify(erreurs, null, 1));
  fin(); if (!A.prof) try { fs.rmSync(PROF, { recursive: true, force: true }); } catch (e) {}
  process.exit(0);
})();
