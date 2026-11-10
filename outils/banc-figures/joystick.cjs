/* LE BANC DU JOYSTICK NITRO (2026-11-10, Sacha : « le bouton nitro doit être un joystick qui permet de faire les figures de la direction où tu le pousses,
   et le double-tap donne une figure aléatoire dans la liste de celles que tu as débloquées ») — le vrai jeu en Chrome headless tactile (844×390, iPhone UA, sans son).
   Usage : node outils/banc-figures/joystick.cjs --sc directions|vide|seuil|tirage|tous [--http 9801 --cdp 9802 --prof <dossier chaud>]
   Une ligne `OK|KO scénario : détail` par scénario ; code de sortie 1 au premier KO ; toute exception de la page fait KO.
   Crochets lus dans la page : dbgJoy() (compteurs du joystick), dbgTirage(n,o) (tirages à sec), dbgFig() (slots, lancées), dbgVol('rien'|'tout'),
   dbgFig('equipe',id), dbgAuto(true,0,{saut:3,imp:22}) (un vol toutes les 3 s), dbgState(). Chrome froid : 60-90 s ; garder --prof pour le chauffer. */
const fs = require('fs'), path = require('path'), os = require('os');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir } = require('../banc-trainees/cdp.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.resolve(A.jeu || path.join(__dirname, '..', '..', 'VERSION PRINCIPALE')), P_HTTP = +(A.http || 9801), P_CDP = +(A.cdp || 9802), W = 844, H = 390;
const PROF = A.prof || path.join(os.tmpdir(), 'banc-joystick-prof');
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const SAVE = { v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, bank: 48500, aura: 1200, auraMax: 3000, owned: [0, 1, 2, 3], plq: { ok: 1 } }; // son coupé AVANT tout clic (CLAUDE.md)
const SCENARIOS = ['directions', 'vide', 'seuil', 'tirage'];
const voulus = !A.sc || A.sc === 'tous' ? SCENARIOS : A.sc.split(',');

(async () => {
  for (const p of [P_HTTP, P_CDP]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  fs.mkdirSync(PROF, { recursive: true });
  const srv = await serveur(JEU, P_HTTP), { ch, pg } = await lanceChrome(P_CDP, PROF, W, H), c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  const err = []; let ko = 0;
  c.ws.addEventListener('message', e => { try { const m = JSON.parse(e.data); if (m.method === 'Runtime.exceptionThrown') { const d = m.params.exceptionDetails; err.push(((d.exception && d.exception.description) || d.text || '').slice(0, 300)); } } catch (x) {} });
  const fin = () => { try { c.close(); } catch (e) {} tueChrome(ch); srv.close(); };
  const ev = (x, ms) => c.ev(x, ms || 8000);
  const attend = async (expr, ms, pas) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { try { if (await ev(expr)) return true; } catch (e) {} await dormir(pas || 100); } return false; };
  const joy = async () => { try { return JSON.parse(await ev('JSON.stringify(dbgJoy())')); } catch (e) { return null; } }; // null = le crochet n'existe pas encore
  const fig = async () => JSON.parse(await ev('JSON.stringify(dbgFig())'));
  const rect = async (sel) => ev(`(function(){const e=document.querySelector(${JSON.stringify(sel)});if(!e)return null;const b=e.getBoundingClientRect();return [b.left+b.width/2,b.top+b.height/2];})()`);
  const tch = (type, pts) => c.send('Input.dispatchTouchEvent', { type, touchPoints: pts });
  /* un doigt sur NITRO : pose, glisse de (dx,dy) par pas de `pas` px, tient `ms`, lève (fin:false = reste posé). `id` : le numéro du doigt */
  const pousse = async (dx, dy, o) => { o = o || {}; const r = await rect('#tNitro'), id = o.id || 1, pas = o.pas || 6, d = Math.hypot(dx, dy), n = Math.max(1, Math.ceil(d / pas));
    const autres = o.autres || [];
    await tch('touchStart', autres.concat([{ x: r[0], y: r[1], id }]));
    for (let k = 1; k <= n; k++) await tch('touchMove', autres.concat([{ x: r[0] + dx * k / n, y: r[1] + dy * k / n, id }]));
    if (o.ms) await dormir(o.ms);
    if (o.fin !== false) await tch('touchEnd', autres);
    return r; };
  const tapNitro = async () => { const r = await rect('#tNitro'); await tch('touchStart', [{ x: r[0], y: r[1], id: 1 }]); await dormir(40); await tch('touchEnd', []); };
  const volant = async (x, y) => { const r = await rect('#tSteer'); return { x: r[0] + x, y: r[1] + y, id: 2 }; }; // le point du second doigt (le volant)
  /* `essai(action)` : attend un vol, joue l'action, vérifie qu'on y est encore à la fin ; sinon (vol manqué) rejoue — 8 essais */
  const enVol = async () => attend("dbgState().mode==='fall'&&dbgState().started&&!dbgState().gameOver", 8000, 40);
  const essai = async (action) => { for (let k = 0; k < 8; k++) { if (!(await enVol())) continue; const r = await action(); if ((await ev("dbgState().mode")) === 'fall') return { ok: true, r }; await attend("dbgState().mode==='drive'", 5000, 100); } return { ok: false }; };
  const dit = (nom, ok, d) => { console.log((ok ? 'OK ' : 'KO ') + nom + ' : ' + d); if (!ok) ko++; };
  const raz = async () => { await ev("dbgAuto(true,0,{saut:3,imp:22});1"); await attend("dbgState().mode==='drive'", 8000, 100); };

  const SC = {
    /* chaque direction lance l'emplacement de SA direction ; ◄ et ► partent de leur côté */
    directions: async () => {
      await ev("dbgVol('tout');dbgFig('equipe','saltoa');dbgFig('equipe','saltov');dbgFig('equipe','tonneau');1"); await raz();
      const S = (await fig()).slots, D = [[0, -70, 'haut'], [1, 70, 'bas']], det = [];
      for (const [k, dy, nom] of D) { if (!S[k]) continue; const j0 = await joy(), e = await essai(() => pousse(0, dy)); const j1 = await joy();
        if (!j1) return ['KO', 'dbgJoy absent (le joystick n\'existe pas encore)']; if (!e.ok) return ['KO', 'pas de vol (' + nom + ')'];
        if (j1.n !== j0.n + 1 || j1.der !== S[k]) return ['KO', nom + ' : attendu ' + S[k] + ' (+1), vu ' + j1.der + ' (n ' + j0.n + '→' + j1.n + ')']; det.push(nom + '=' + S[k]); }
      for (const [sg, nom] of [[-1, 'gauche'], [1, 'droite']]) { const j0 = await joy(), e = await essai(() => pousse(70 * sg, 0)); const j1 = await joy(); if (!j1) return ['KO', 'dbgJoy absent'];
        if (!e.ok || j1.n !== j0.n + 1 || j1.der !== S[2]) return ['KO', nom + ' : attendu ' + S[2] + ' (+1), vu ' + j1.der]; if (j1.sens === j0.sens && j0.n > 0 && j1.cote === j0.cote) return ['KO', nom + ' : même côté que le précédent']; det.push(nom + '=' + S[2] + ' sens ' + j1.sens); }
      return ['OK', det.join(', ')]; },
    /* un emplacement vide : refus, aucune figure */
    vide: async () => {
      await ev("dbgVol('rien');1"); await raz(); const S = (await fig()).slots; if (S[0]) return ['KO', 'emplacement avant non vide : ' + S[0]];
      const j0 = await joy(), f0 = (await fig()).lancees, e = await essai(() => pousse(0, -70)), j1 = await joy(), f1 = (await fig()).lancees; if (!j1) return ['KO', 'dbgJoy absent'];
      return j1.refus === j0.refus + 1 && f1 === f0 && e.ok ? ['OK', 'refus +1, aucune figure'] : ['KO', 'refus ' + j0.refus + '→' + j1.refus + ', lancées ' + f0 + '→' + f1]; },
    /* le seuil : sous le seuil rien ; au seuil UNE figure et UNE vibration ; revenir près du centre réarme */
    seuil: async () => {
      await ev("dbgVol('tout');dbgFig('equipe','tonneau');1"); await raz(); const sg = (await joy()); if (!sg) return ['KO', 'dbgJoy absent'];
      let j0 = await joy(), e = await essai(() => pousse(-20, 0)), j1 = await joy(); if (!e.ok || j1.n !== j0.n || j1.vib !== j0.vib) return ['KO', 'sous le seuil : ' + JSON.stringify([j0.n, j1.n, j0.vib, j1.vib])];
      j0 = await joy(); e = await essai(() => pousse(-60, 0)); j1 = await joy(); if (!e.ok || j1.n !== j0.n + 1 || j1.vib !== j0.vib + 1) return ['KO', 'au seuil : n ' + j0.n + '→' + j1.n + ', vib ' + j0.vib + '→' + j1.vib];
      j0 = await joy(); e = await essai(async () => { const r = await pousse(-60, 0, { fin: false }); await tch('touchMove', [{ x: r[0] - 4, y: r[1], id: 1 }]); const m = await pousse(0, 0, { fin: false, id: 3 }); await tch('touchEnd', []); return m; }); j1 = await joy();
      return j1.n === j0.n + 1 ? ['OK', 'sous le seuil rien, au seuil 1 figure + 1 vibration, une seule par poussée'] : ['KO', 'une poussée tenue a lancé ' + (j1.n - j0.n) + ' figures']; },
    /* le double-tap tire une figure adaptée : à sec (dbgTirage) puis en vrai */
    tirage: async () => {
      await ev("dbgVol('tout');1"); await raz(); if (typeof (await ev('typeof dbgTirage')) !== 'string' || (await ev('typeof dbgTirage')) !== 'function') return ['KO', 'dbgTirage absent'];
      const det = [];
      for (const d of [0.5, 0.8, 1.2, 2]) { const r = JSON.parse(await ev(`JSON.stringify(dbgTirage(200,{dispo:${d}}))`)); if (r.refus > 0 && Object.keys(r.tires).length) return ['KO', 'dispo ' + d + ' : ' + r.refus + ' tirages vides alors que des figures tiennent']; if (r.horsTemps) return ['KO', 'dispo ' + d + ' : ' + r.horsTemps + ' figures trop longues pour le vol']; det.push(d + ':' + Object.keys(r.tires).length + ' figs'); }
      const g = JSON.parse(await ev("JSON.stringify(dbgTirage(200,{x:1,y:0}))")), av = JSON.parse(await ev("JSON.stringify(dbgTirage(200,{x:0,y:1}))"));
      if (g.horsDirection || av.horsDirection) return ['KO', 'braquage : ' + g.horsDirection + ' côté hors direction, ' + av.horsDirection + ' avant hors direction'];
      if (g.repetes || av.repetes) return ['KO', 'même figure deux fois de suite : ' + g.repetes + '/' + av.repetes];
      const f0 = (await fig()).lancees, r0 = await ev('FX2.refus|0'); let n = 0;
      for (let k = 0; k < 6; k++) { const e = await essai(async () => { await tapNitro(); await dormir(110); await tapNitro(); await dormir(400); }); if (e.ok) n++; }
      const f1 = (await fig()).lancees, r1 = await ev('FX2.refus|0'); return f1 - f0 >= n && r1 === r0 ? ['OK', det.join(' ') + ' ; ' + (f1 - f0) + ' figures pour ' + n + ' double-taps, 0 refus'] : ['KO', (f1 - f0) + ' figures pour ' + n + ' double-taps, refus ' + r0 + '→' + r1]; }
  };

  try {
    await c.send('Page.enable'); await c.send('Runtime.enable');
    await c.send('Network.enable'); await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
    await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 2, mobile: true, screenWidth: W, screenHeight: H });
    await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' });
    await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{var s=JSON.parse(localStorage.getItem("cashcarSave")||"null");if(!s){localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAVE)) + ')}else{s.sfx=false;s.mus=false;s.vox=false;localStorage.setItem("cashcarSave",JSON.stringify(s))}}catch(e){}' });
    await c.send('Page.navigate', { url: `http://127.0.0.1:${P_HTTP}/index.html?colonne=0&tel=1&simu=1&garde=1&intro=ancien&attente=0` });
    if (!(await attend("!!window.__gameReady&&typeof dbgState==='function'&&document.getElementById('mHome').classList.contains('on')", 300000, 1000))) throw new Error('le jeu ne démarre pas');
    await dormir(2500); const dj = await ev('JSON.stringify(dbgJouer())');
    if (!(await attend("(function(){const s=dbgState();return s.started&&!s.gameOver&&s.mode==='drive';})()", 60000, 500))) throw new Error('la course ne part pas : dbgJouer=' + String(dj).slice(0, 160) + ' état=' + String(await ev('JSON.stringify(dbgState())')).slice(0, 160));
    for (const nom of voulus) { if (!SC[nom]) { dit(nom, false, 'scénario inconnu'); continue; }
      const e0 = err.length; let r; try { r = await SC[nom](); } catch (e) { r = ['KO', 'exception du banc : ' + String(e.message || e).slice(0, 200)]; }
      if (err.length > e0) r = ['KO', 'exception de la page : ' + err.slice(e0).join(' | ').slice(0, 300)];
      dit(nom, r[0] === 'OK', r[1]); if (r[0] !== 'OK') break; }
  } catch (e) { dit('banc', false, String(e.message || e).slice(0, 300)); }
  fin(); process.exit(ko ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
