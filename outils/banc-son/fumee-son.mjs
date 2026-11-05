// FUMÉE DU SON (2026-11-05, DEBUG-TOTAL) — le vrai jeu dans le Chrome du Mac, sans fenêtre, son MUET pour les oreilles mais VIVANT
// (aucun --disable-audio-output : les AudioContext tournent vraiment), sauvegarde avec MUSIQUE + EFFETS + VOIX allumés.
// Parcours : accueil → JOUER → course (pilote auto) → arrière-plan 3 s → retour → mort → REJOUER → course → mort → accueil.
// À chaque étape, la sonde (sonde.js) relève les contextes audio, les sources en cours, les <audio> qui jouent, les liaisons vivantes.
// Vert si : un seul AudioContext temps réel · au plus UNE musique (même fichier jamais deux fois, jamais <audio> + boucle ensemble
// sur le même morceau) · aucune musique de course sur l'accueil · liaisons stables d'une course à l'autre · 0 erreur console,
// 0 promesse rejetée.
//   node outils/banc-son/fumee-son.mjs [--fois 1] [--course 30] [--w 844 --h 390] [--url "&colonne=portrait"] [--jeu 9830] [--port 9831]
// UN banc à la fois sur la machine (vérifier `uptime` avant). Le jeu est servi par ce script (python3 -m http.server), tué à la sortie.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const a = process.argv.slice(2);
const opt = (k, d) => { const i = a.indexOf('--' + k); return i >= 0 ? a[i + 1] : d; };
const W = +opt('w', 844), H = +opt('h', 390), FOIS = +opt('fois', 1), COURSE = +opt('course', 30), JEU = +opt('jeu', 9830), PORT = +opt('port', 9831);
const NCOURSES = +opt('courses', 2), PLUS = opt('url', ''), MOBILE = a.includes('--mobile'), FREN = a.includes('--frenesie'), CHANCE = a.includes('--chance');
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const ICI = path.dirname(fileURLToPath(import.meta.url));
const SONDE = fs.readFileSync(path.join(ICI, 'sonde.js'), 'utf8');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const log = (...x) => console.log(...x);

const srv = spawn('python3', ['-m', 'http.server', String(JEU), '--bind', '127.0.0.1'], { cwd: path.resolve(ICI, '../../VERSION PRINCIPALE'), stdio: 'ignore', detached: true });
let chrome = null, prof = null;
const tue = () => { try { process.kill(-srv.pid, 'SIGKILL'); } catch (e) {} try { chrome && chrome.kill('SIGKILL'); } catch (e) {} try { prof && fs.rmSync(prof, { recursive: true, force: true }); } catch (e) {} };
process.on('exit', tue); process.on('SIGINT', () => { tue(); process.exit(1); });

async function lance() {
  prof = fs.mkdtempSync(path.join(os.tmpdir(), 'cc-son-'));
  chrome = spawn(CHROME, ['--headless=new', '--mute-audio', '--remote-debugging-port=' + PORT, '--user-data-dir=' + prof, '--no-first-run',
    '--no-default-browser-check', '--window-size=' + W + ',' + H, 'about:blank'], { stdio: 'ignore' });
  let tabs;
  for (let i = 0; i < 80; i++) { try { tabs = await (await fetch('http://127.0.0.1:' + PORT + '/json/list')).json(); if (tabs.find(t => t.type === 'page')) break; } catch (e) {} await sleep(250); }
  const ws = new WebSocket(tabs.find(t => t.type === 'page').webSocketDebuggerUrl);
  await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
  let id = 0; const att = new Map(); const erreurs = [];
  ws.onmessage = ev => { const m = JSON.parse(ev.data); if (m.id && att.has(m.id)) { att.get(m.id)(m); att.delete(m.id); return; }
    if (m.method === 'Runtime.exceptionThrown') erreurs.push('EXC ' + (m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text).slice(0, 400));
    if (m.method === 'Runtime.consoleAPICalled' && (m.params.type === 'error' || m.params.type === 'warning') ) { const t = m.params.args.map(x => x.value ?? x.description ?? '').join(' ').slice(0, 400); if (m.params.type === 'error' || /\[SON\]/.test(t)) erreurs.push((m.params.type === 'error' ? 'ERR ' : 'AVERT ') + t); }
    if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error' && !/favicon/.test(m.params.entry.url || '')) erreurs.push('LOG ' + (m.params.entry.text + ' ' + (m.params.entry.url || '')).slice(0, 300));
  };
  const send = (method, params = {}) => new Promise(r => { const i = ++id; att.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
  await send('Page.enable'); await send('Runtime.enable'); await send('Log.enable'); await send('Network.enable');
  await send('Network.setBypassServiceWorker', { bypass: true });
  await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 2, mobile: MOBILE });
  if (MOBILE) await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  const ev = async (expr) => { const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
    if (r.result?.exceptionDetails) throw new Error('eval: ' + (r.result.exceptionDetails.exception?.description || r.result.exceptionDetails.text)); return r.result?.result?.value; };
  const clic = async (x, y) => {
    if (MOBILE) { for (const type of ['touchStart', 'touchEnd']) { await send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y }] }); await sleep(60); } return; }
    await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y }); await sleep(60);
    for (const type of ['mousePressed', 'mouseReleased']) { await send('Input.dispatchMouseEvent', { type, x, y, button: 'left', buttons: type === 'mousePressed' ? 1 : 0, clickCount: 1 }); await sleep(40); } };
  return { send, ev, clic, erreurs, ws };
}

/* un vrai doigt sur un élément visible (sa boîte), dans le document du jeu */
async function touche(c, sel, attente = 20000) {
  const t0 = Date.now(); let r = null;
  while (!r && Date.now() - t0 < attente) { r = await vise(c, sel); if (!r) await sleep(400); }
  if (!r) { log('   (introuvable : ' + sel + ' · visibles : ' + JSON.stringify(await c.ev(`[].slice.call(document.querySelectorAll('.pbtn,button,[data-m]')).filter(function(e){var b=e.getBoundingClientRect();return b.width>4&&b.height>4&&getComputedStyle(e).visibility!=='hidden';}).map(function(e){return (e.id||e.dataset.m||'')+':'+(e.textContent||'').trim().slice(0,14);}).slice(0,25)`)) + ')'); return false; }
  await c.clic(r.x, r.y); return true;
}
async function vise(c, sel) {
  return c.ev(`(function(){var L=[].slice.call(document.querySelectorAll(${JSON.stringify(sel)}));for(var i=0;i<L.length;i++){var b=L[i].getBoundingClientRect();var cs=getComputedStyle(L[i]);if(b.width>4&&b.height>4&&cs.visibility!=='hidden'&&cs.display!=='none')return {x:b.left+b.width/2,y:b.top+b.height/2};}return null;})()`);
}
/* le relevé : la sonde (navigateur) + ce que le jeu dit de sa musique (dbgMusique : l'<audio> ; dbgPouce : Pouce bleu, le générateur WebAudio de course) */
const releve = async c => { await c.send('HeapProfiler.enable'); await c.send('HeapProfiler.collectGarbage'); await sleep(300); await c.send('HeapProfiler.collectGarbage'); const h = await c.send('Runtime.getHeapUsage'); const e = await releve0(c); e.tasMo = Math.round((h.result && h.result.usedSize || 0) / 1048576); return e; };
const releve0 = c => c.ev(`(function(){var e=window.__SONBANC.etat();try{e.mus=dbgMusique();}catch(x){e.mus={err:x.message};}try{var p=dbgPouce();e.pouce=p&&{actif:p.actif,phase:p.phase,titre:p.titre,type:p.type,err:p.err};}catch(x){e.pouce={err:x.message};}try{e.fren=typeof dbgFren==='function'?dbgFren():null;}catch(x){}return e;})()`);
const etatJeu = c => c.ev(`(function(){try{var s=dbgState();return {started:s.started,running:s.running,gameOver:s.gameOver,mode:s.mode,paused:s.paused};}catch(e){return {err:e.message}}})()`);
const musique = c => c.ev(`(function(){try{return dbgMusique();}catch(e){return {err:e.message}}})()`);
async function attends(c, test, ms) { const t0 = Date.now(); while (Date.now() - t0 < ms) { try { if (await c.ev(test)) return true; } catch (e) {} await sleep(300); } return false; }

/* les musiques EN COURS : <audio> audibles + longues boucles WebAudio, regroupées par fichier */
function musiques(e) {
  const L = [];
  if (e.pouce && e.pouce.actif) L.push({ par: 'pouce', f: 'pouce:' + (e.pouce.titre || '?'), phase: e.pouce.phase });
  for (const m of e.medias) if (!m.muet && m.vol > 0) L.push({ par: 'audio', f: m.src });
  for (const b of e.boucles) L.push({ par: 'webaudio', f: b.url, dur: b.dur });
  return L;
}
function juge(nom, e, att, pb) {
  const rt = e.contextes.length;
  if (rt !== 1) pb.push(`${nom} : ${rt} AudioContext temps réel (attendu 1) ${JSON.stringify(e.contextes.map(x => x.pile))}`);
  const ferme = e.contextes.filter(x => x.etat === 'closed').length; if (ferme) pb.push(`${nom} : ${ferme} contexte(s) fermé(s)`);
  const M = musiques(e), parF = {};
  for (const m of M) { const k = (m.f || '?').replace(/\?.*$/, ''); parF[k] = (parF[k] || 0) + 1; }
  for (const k in parF) if (parF[k] > 1 && k !== '?') pb.push(`${nom} : le même morceau joue ${parF[k]} fois : ${k}`);
  if (att.musMax != null && M.length > att.musMax) pb.push(`${nom} : ${M.length} musiques en même temps (max ${att.musMax}) : ${JSON.stringify(M)}`);
  /* un <audio> qui joue (même à volume 0 : sur iPhone sans MUS_WA le volume est VERROUILLÉ, on l'entend à plein) sous Pouce bleu, hors frénésie */
  const triade = e.fren && e.fren.musique === 'triade';
  if (e.pouce && e.pouce.actif && !triade) for (const m of e.medias) if (!m.muet && !/^blob:|[0-9a-f]{8}-[0-9a-f]{4}-/.test(m.src)) pb.push(`${nom} : un <audio> joue SOUS Pouce bleu (${e.pouce.phase}) : ${m.src} vol ${m.vol} — double musique sur iPhone (volume verrouillé)`);
  if (e.rejets.length) pb.push(`${nom} : promesses rejetées ${JSON.stringify(e.rejets.slice(-6))}`);
}

const pbs = [];
for (let tour = 1; tour <= FOIS; tour++) {
  const c = await lance();
  const pb = [], R = {};
  try {
    const save = JSON.stringify({ v: 2, sfx: true, mus: true, vox: true, tuto: 1, permis: 1, facile: 0, bienv: 1, ex: { runs: 5 }, plq: { m: 'fr', x: 'BANC', ok: 1 } });
    await c.send('Page.addScriptToEvaluateOnNewDocument', { source: `try{if(!sessionStorage.ccBanc){sessionStorage.ccBanc=1;localStorage.cashcarSave=${JSON.stringify(save)};}}catch(e){}` });
    await c.send('Page.addScriptToEvaluateOnNewDocument', { source: SONDE });
    const url = `http://127.0.0.1:${JEU}/index.html?colonne=0&simu=1&garde=1${PLUS}`;
    await c.send('Page.navigate', { url });
    if (!await attends(c, '!!window.__gameReady', 90000)) throw new Error('__gameReady jamais venu');
    for (let i = 0; i < 30; i++) { const la = await c.ev(`(()=>{const s=document.getElementById('splash');if(!s)return 0;const cs=getComputedStyle(s);return (cs.display!=='none'&&cs.visibility!=='hidden'&&+cs.opacity>.05)?1:0;})()`); if (!la) break; await c.clic(W / 2, H / 2); await sleep(500); }
    await sleep(6000);
    R.accueil = await releve(c); R.accueilMus = await musique(c);
    juge('accueil', R.accueil, { musMax: 1 }, pb);
    if (R.accueil.pouce && R.accueil.pouce.actif && /course|intro|depart/.test(R.accueil.pouce.phase)) pb.push('accueil : Pouce bleu (musique de course) joue sur l\'accueil');
    log(`[${tour}] accueil : ctx ${R.accueil.contextes.map(x => x.etat)} · sources ${R.accueil.sources} · liens ${R.accueil.liens} (${R.accueil.noeudsLies} nœuds) · tas ${R.accueil.tasMo} Mo · musiques ${JSON.stringify(musiques(R.accueil))} · el ${JSON.stringify(R.accueil.mus && R.accueil.mus.el)} · menu ${JSON.stringify(R.accueil.mus && R.accueil.mus.menu)}`);

    if (!await touche(c, '[data-m="play"]')) throw new Error('JOUER introuvable');
    if (!await attends(c, '(function(){try{var s=dbgState();return s.started&&s.running&&!s.gameOver}catch(e){return false}})()', 60000)) throw new Error('la course ne part pas');
    await c.ev('dbgAuto(true,0)');
    await sleep(COURSE * 500);
    R.course1 = await releve(c); juge('course 1', R.course1, { musMax: 1 }, pb);
    log(`[${tour}] course 1 : ctx ${R.course1.contextes.map(x => x.etat)} · sources ${R.course1.sources} ${JSON.stringify(R.course1.typesSources)} · liens ${R.course1.liens} (${R.course1.noeudsLies} nœuds) · tas ${R.course1.tasMo} Mo · musiques ${JSON.stringify(musiques(R.course1))} · sons joués ${R.course1.nPlays} · pouce ${JSON.stringify(R.course1.pouce)} · el ${JSON.stringify(R.course1.mus && R.course1.mus.el)}`);
    if (!musiques(R.course1).length) pb.push('course 1 : AUCUNE musique (MUSIQUE allumée)');
    /* arrière-plan 3 s : document.hidden faux puis vrai, avec l'événement qui remonte (bubbles) */
    await c.ev(`(function(){Object.defineProperty(document,'hidden',{configurable:true,get:function(){return true}});Object.defineProperty(document,'visibilityState',{configurable:true,get:function(){return 'hidden'}});document.dispatchEvent(new Event('visibilitychange',{bubbles:true}));window.dispatchEvent(new Event('pagehide'));})()`);
    await sleep(3000);
    R.cache = await releve(c);
    const Mc = musiques(R.cache).filter(m => m.par === 'audio');
    if (Mc.length) pb.push(`appli cachée : un <audio> joue encore ${JSON.stringify(Mc)}`);
    await c.ev(`(function(){delete document.hidden;delete document.visibilityState;document.dispatchEvent(new Event('visibilitychange',{bubbles:true}));window.dispatchEvent(new Event('pageshow'));})()`);
    await c.clic(W * .5, H * .5);
    await sleep(COURSE * 500);
    R.course1b = await releve(c); juge('retour d\'arrière-plan', R.course1b, { musMax: 1 }, pb);
    log(`[${tour}] retour : ctx ${R.course1b.contextes.map(x => x.etat)} · sources ${R.course1b.sources} · liens ${R.course1b.liens} · musiques ${JSON.stringify(musiques(R.course1b))} · état ${JSON.stringify(await etatJeu(c))}`);
    /* reprendre si le retour a mis en pause */
    if ((await etatJeu(c)).paused) { if (!await touche(c, '.tp.go[data-a="close"]')) pb.push('REPRENDRE introuvable'); await sleep(4500); }
    if ((await etatJeu(c)).paused) pb.push('la pause ne se lève pas (REPRENDRE)');
    R.reprise = await releve(c); juge('reprise après pause', R.reprise, { musMax: 1 }, pb);
    log(`[${tour}] reprise : ctx ${R.reprise.contextes.map(x => x.etat)} · musiques ${JSON.stringify(musiques(R.reprise))} · pouce ${JSON.stringify(R.reprise.pouce)}`);
    if (!musiques(R.reprise).length) pb.push('reprise après pause : AUCUNE musique (MUSIQUE allumée)');
    await c.ev('dbgAuto(true,0)'); await sleep(4000);
    if (FREN) { /* --frenesie : la jauge pleine, la frénésie déclenchée par le vrai chemin, sa musique (la triade) puis la mort */
      log(`[${tour}] frénésie : ${JSON.stringify(await c.ev(`(function(){try{dbgFren('v',100);var r=dbgFren('entre');return {musique:r.musique,lv:r.lv};}catch(e){return e.message}})()`))}`);
      await sleep(2500);
      const f1 = await releve(c);
      log(`[${tour}] frénésie +2,5 s : medias ${JSON.stringify(f1.medias)} · fren ${JSON.stringify(f1.fren && { m: f1.fren.musique, lv: f1.fren.lv, t: f1.fren.tenue })} · pouce ${f1.pouce && f1.pouce.titre}`);
      if (f1.fren && f1.fren.musique === 'triade' && !f1.medias.some(m => /dark-triad/.test(m.src))) pb.push('frénésie : la TRIADE est annoncée mais aucun <audio> ne la joue (trou de musique)');
      await sleep(6500);
      R.fren = await releve(c); juge('frénésie', R.fren, { musMax: 1 }, pb);
      log(`[${tour}] en frénésie : musiques ${JSON.stringify(musiques(R.fren))} · medias ${JSON.stringify(R.fren.medias)} · fren ${R.fren.fren && R.fren.fren.musique} · pouce ${JSON.stringify(R.fren.pouce)}`);
    }
    if (CHANCE) { /* --chance : mourir, laisser le lobby repartir (1,4 s), prendre la SECONDE CHANCE : le morceau de la course doit revenir */
      const t0 = (await releve(c)).pouce; await c.ev(`(function(){try{dbgAuto(false);dbgChance('t',200);}catch(e){}try{return dbgChance('mort');}catch(e){return e.message}})()`);
      await attends(c, '(function(){try{return dbgState().gameOver}catch(e){return false}})()', 20000); await sleep(4500);
      const tl = (await releve(c)).pouce;
      const j = await c.ev(`(function(){try{return {etat:dbgChance(),joue:dbgChance('joue')};}catch(e){return e.message}})()`);
      const ok = await attends(c, '(function(){try{var s=dbgState();return s.started&&!s.gameOver}catch(e){return false}})()', 25000); await sleep(4000);
      const t1 = (await releve(c)).pouce;
      log(`[${tour}] seconde chance : ${JSON.stringify(j && j.joue)} · course ${t0 && t0.titre} → lobby ${tl && tl.titre} (${tl && tl.phase}) → reprise ${t1 && t1.titre} (${t1 && t1.phase}) · repartie ${ok}`);
      if (!ok) pb.push('seconde chance : la course ne repart pas (' + JSON.stringify(j) + ')');
      else if (t0 && t1 && t0.titre !== t1.titre) pb.push(`seconde chance : le morceau CHANGE (${t0.titre} → ${t1.titre}) alors que la course continue`);
      await c.ev('dbgAuto(true,0)'); await sleep(3000);
    }
    /* la mort */
    await c.ev(`(function(){try{dbgAuto(false);}catch(e){}try{return dbgDauphin('boom');}catch(e){return e.message}})()`);
    if (!await attends(c, '(function(){try{return dbgState().gameOver}catch(e){return false}})()', 30000)) pb.push('la mort n\'arrive pas (dbgDauphin boom)');
    await sleep(5000);
    R.mort1 = await releve(c); juge('écran de mort', R.mort1, { musMax: 1 }, pb);
    log(`[${tour}] mort : medias ${JSON.stringify(R.mort1.medias)} · pouce ${JSON.stringify(R.mort1.pouce)}`);
    if (R.mort1.pouce && R.mort1.pouce.actif && /course|intro|depart/.test(R.mort1.pouce.phase)) pb.push('écran de mort : Pouce bleu (musique de course) joue encore');
    log(`[${tour}] mort : sources ${R.mort1.sources} · liens ${R.mort1.liens} · musiques ${JSON.stringify(musiques(R.mort1))}`);
    { let parti = false;
      for (let k = 0; k < 4 && !parti; k++) { /* l'écran de mort ignore les touchers de ses premiers instants : on réessaie, comme un doigt */
        if (!await touche(c, '[data-m="replay"]')) { pb.push('REJOUER introuvable'); break; }
        parti = await attends(c, '(function(){try{var s=dbgState();return s.started&&s.running&&!s.gameOver}catch(e){return false}})()', 15000);
        if (!parti) log(`[${tour}] REJOUER essai ${k + 1} : ${JSON.stringify(await etatJeu(c))}`);
      }
      if (!parti) throw new Error('REJOUER ne relance pas'); }
    await c.ev('dbgAuto(true,0)');
    await sleep(COURSE * 1000);
    R.course2 = await releve(c); juge('course 2', R.course2, { musMax: 1 }, pb);
    log(`[${tour}] course 2 : sources ${R.course2.sources} ${JSON.stringify(R.course2.typesSources)} · liens ${R.course2.liens} (${R.course2.noeudsLies} nœuds) · tas ${R.course2.tasMo} Mo · musiques ${JSON.stringify(musiques(R.course2))} · pouce ${JSON.stringify(R.course2.pouce)}`);
    if (!musiques(R.course2).length) pb.push('course 2 : AUCUNE musique (MUSIQUE allumée)');
    /* --courses N : la mort et REJOUER encore N−2 fois (10 s de course chacune) — la pente des nœuds vivants et du tas, course après course */
    R.serie = [[1, R.course1.noeudsLies, R.course1.tasMo], [2, R.course2.noeudsLies, R.course2.tasMo]];
    for (let k = 3; k <= NCOURSES; k++) {
      await c.ev(`(function(){try{dbgAuto(false);}catch(e){}try{return dbgDauphin('boom');}catch(e){return e.message}})()`);
      await attends(c, '(function(){try{return dbgState().gameOver}catch(e){return false}})()', 30000); await sleep(3000);
      let parti = false; for (let q = 0; q < 4 && !parti; q++) { if (!await touche(c, '[data-m="replay"]')) break; parti = await attends(c, '(function(){try{var s=dbgState();return s.started&&s.running&&!s.gameOver}catch(e){return false}})()', 15000); }
      if (!parti) { pb.push(`course ${k} : REJOUER ne relance pas`); break; }
      await c.ev('dbgAuto(true,0)'); await sleep(10000);
      const e = await releve(c); juge('course ' + k, e, { musMax: 1 }, pb); R.serie.push([k, e.noeudsLies, e.tasMo]); R['course' + k] = e;
      log(`[${tour}] course ${k} : ${e.noeudsLies} nœuds vivants · tas ${e.tasMo} Mo · ctx ${e.contextes.map(x => x.etat)} · musiques ${JSON.stringify(musiques(e))}`);
    }
    if (NCOURSES > 2) { const S0 = R.serie[1], S1 = R.serie[R.serie.length - 1], n = S1[0] - S0[0];
      if (n > 0) { const pente = (S1[1] - S0[1]) / n; log(`[${tour}] pente : ${pente.toFixed(1)} nœuds vivants de plus par course · ${((S1[2] - S0[2]) / n).toFixed(1)} Mo de tas par course`);
        if (pente > 15) pb.push(`fuite : ${pente.toFixed(0)} nœuds audio vivants de plus à chaque course (${S0[1]} → ${S1[1]} en ${n} courses)`);
        const D = []; const A = R['course2'].parPile || {}, B = R['course' + S1[0]].parPile || {}; for (const q in B) { const d = B[q] - (A[q] || 0); if (d > n) D.push([d, q]); }
        D.sort((x, y) => y[0] - x[0]); if (D.length) log(`[${tour}] ce qui grossit (course 2 → ${S1[0]}) :\n     ` + D.slice(0, 12).map(x => '+' + x[0] + '  ' + x[1]).join('\n     ')); } }
    /* (les nœuds vivants d'une course à l'autre dépendent du morceau tiré : seule la PENTE sur ≥ 5 courses dit une fuite, voir --courses) */
    await c.ev(`(function(){try{dbgAuto(false);}catch(e){}try{return dbgDauphin('boom');}catch(e){return e.message}})()`);
    await attends(c, '(function(){try{return dbgState().gameOver}catch(e){return false}})()', 30000);
    await sleep(4000);
    if (!await touche(c, '[data-m="menu"]')) pb.push('MAISON introuvable sur l\'écran de mort');
    await sleep(7000);
    R.accueil2 = await releve(c); R.accueil2Mus = await musique(c); juge('retour accueil', R.accueil2, { musMax: 1 }, pb);
    if (R.accueil2.pouce && R.accueil2.pouce.actif && /course|intro|depart/.test(R.accueil2.pouce.phase)) pb.push('retour accueil : Pouce bleu (musique de course) joue encore');
    log(`[${tour}] accueil 2 : sources ${R.accueil2.sources} · liens ${R.accueil2.liens} (${R.accueil2.noeudsLies} nœuds) · tas ${R.accueil2.tasMo} Mo · musiques ${JSON.stringify(musiques(R.accueil2))} · menu ${JSON.stringify(R.accueil2Mus && R.accueil2Mus.el)}`);
    { const A = R.course1.parPile || {}, B = R.accueil2.parPile || {}, D = [];
      for (const k in B) { const d = B[k] - (A[k] || 0); if (d > 2) D.push([d, k]); }
      D.sort((x, y) => y[0] - x[0]); if (D.length) log(`[${tour}] nœuds branchés en plus (course 1 → accueil 2) :\n     ` + D.slice(0, 14).map(x => '+' + x[0] + '  ' + x[1]).join('\n     ')); }
    /* (idem pour l'accueil) */
    log(`[${tour}] sons de la banque joués : ${R.accueil2.nPlays} (${Object.keys(R.accueil2.plays).length} ids) · créés ${JSON.stringify(R.accueil2.crees)}`);
  } catch (e) { pb.push('PARCOURS : ' + e.message); }
  for (const e of c.erreurs) pb.push('console : ' + e);
  fs.writeFileSync(path.join(os.tmpdir(), `cc-fumee-son-${tour}.json`), JSON.stringify(R, null, 1));
  log(pb.length ? `[${tour}] ROUGE\n  - ` + pb.join('\n  - ') : `[${tour}] VERT`);
  pbs.push(pb.length);
  try { c.ws.close(); } catch (e) {} try { chrome.kill('SIGKILL'); } catch (e) {} await sleep(500); try { fs.rmSync(prof, { recursive: true, force: true }); } catch (e) {}
}
log(`FUMÉE DU SON : ${pbs.filter(n => !n).length}/${pbs.length} vertes · relevés détaillés dans ${os.tmpdir()}/cc-fumee-son-N.json`);
process.exit(pbs.every(n => !n) ? 0 : 1);
