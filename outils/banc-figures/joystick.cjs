/* LE BANC DU JOYSTICK NITRO (2026-11-10, Sacha : « le bouton nitro doit être un joystick qui permet de faire les figures de la direction où tu le pousses,
   et le double-tap donne une figure aléatoire dans la liste de celles que tu as débloquées ») — le vrai jeu en Chrome headless tactile (844×390, iPhone UA, sans son).
   Usage : node outils/banc-figures/joystick.cjs --sc directions|vide|seuil|tirage|tous [--http 9801 --cdp 9802 --prof <dossier chaud>]
   Une ligne `OK|KO scénario : détail` par scénario ; code de sortie 1 au premier KO ; toute exception de la page fait KO.
   Crochets lus dans la page : dbgJoy() (compteurs du joystick), dbgTirage(n,o) (tirages à sec), dbgFig() (slots, lancées), dbgVol('rien'|'tout'),
   dbgFig('equipe',id), dbgNitro(1,0) (réservoir plein : une figure se paie 20 %), dbgAuto(true,0,{saut:3,imp:22}) (un vol toutes les 3 s), dbgState().
   `essai(action)` : attend un vol, remplit le réservoir, joue l'action et rend les compteurs d'AVANT et d'APRÈS cette tentative ; si l'on n'est plus en vol à la
   fin (vol manqué), elle recommence — jusqu'à 8 fois. Chrome froid : 60-90 s ; garder --prof pour le chauffer. */
const fs = require('fs'), path = require('path'), os = require('os');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir } = require('../banc-trainees/cdp.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.resolve(A.jeu || path.join(__dirname, '..', '..', 'VERSION PRINCIPALE')), P_HTTP = +(A.http || 9801), P_CDP = +(A.cdp || 9802), W = 844, H = 390;
const PROF = A.prof || path.join(os.tmpdir(), 'banc-joystick-prof');
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const SAVE = { v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, bank: 48500, aura: 1200, auraMax: 3000, owned: [0, 1, 2, 3], plq: { ok: 1 } }; // son coupé AVANT tout clic (CLAUDE.md)
const SCENARIOS = ['directions', 'vide', 'seuil', 'rapide', 'decollage', 'multitouch', 'reprise', 'tirage'];
const voulus = !A.sc || A.sc === 'tous' ? SCENARIOS : A.sc.split(',');

(async () => {
  for (const p of [P_HTTP, P_CDP]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  fs.mkdirSync(PROF, { recursive: true });
  const srv = await serveur(JEU, P_HTTP), { ch, pg } = await lanceChrome(P_CDP, PROF, W, H), c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  const err = []; let ko = 0;
  c.ws.addEventListener('message', e => { try { const m = JSON.parse(e.data); if (m.method === 'Runtime.exceptionThrown') { const d = m.params.exceptionDetails; err.push(((d.exception && d.exception.description) || d.text || '').slice(0, 300)); } } catch (x) {} });
  const fin = () => { try { c.close(); } catch (e) {} tueChrome(ch); srv.close(); };
  const ev = async (x, ms) => { const r = await c.send('Runtime.evaluate', { expression: x, awaitPromise: true, returnByValue: true }, ms || 8000); // l'exception de la page dite en clair (sa description, pas son identifiant)
    if (r.exceptionDetails) { const d = r.exceptionDetails; throw new Error('page : ' + String((d.exception && (d.exception.description || d.exception.value)) || d.text).split('\n').slice(0, 3).join(' ⏎ ').slice(0, 300)); } return r.result.value; };
  const attend = async (expr, ms, pas) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { try { if (await ev(expr)) return true; } catch (e) {} await dormir(pas || 100); } return false; };
  const joy = async () => { try { return JSON.parse(await ev('JSON.stringify(dbgJoy())')); } catch (e) { return null; } }; // null = le crochet n'existe pas encore
  const fig = async () => JSON.parse(await ev('JSON.stringify(dbgFig())'));
  const rect = async (sel) => ev(`(function(){const e=document.querySelector(${JSON.stringify(sel)});if(!e)return null;const b=e.getBoundingClientRect();return [b.left+b.width/2,b.top+b.height/2];})()`);
  const tch = (type, pts) => c.send('Input.dispatchTouchEvent', { type, touchPoints: pts });
  /* un doigt sur NITRO : pose, glisse de (dx,dy) par pas de `pas` px (18 : CDP met 50-100 ms par événement, un vol dure ~1 s), tient `ms`, lève (fin:false = reste posé) */
  const pousse = async (dx, dy, o) => { o = o || {}; const r = await rect('#tNitro'), id = o.id || 1, pas = o.pas || 18, d = Math.hypot(dx, dy), n = Math.max(1, Math.ceil(d / pas));
    const autres = o.autres || [];
    await tch('touchStart', autres.concat([{ x: r[0], y: r[1], id }]));
    for (let k = 1; k <= n; k++) await tch('touchMove', autres.concat([{ x: r[0] + dx * k / n, y: r[1] + dy * k / n, id }]));
    if (o.ms) await dormir(o.ms);
    if (o.fin !== false) await tch('touchEnd', autres.length ? [{ x: r[0] + dx, y: r[1] + dy, id }] : []); /* CDP : touchEnd liste les points qui se LÈVENT (pas ceux qui restent) */
    return r; };
  const enVol = async () => attend("dbgState().mode==='fall'&&dbgState().started&&!dbgState().gameOver", 8000, 40);
  const essai = async (action, refusOK) => { /* refusOK faux : un REFUS de figure (vol trop court pour la planter, voulu) fait recommencer sur un autre vol */ for (let k = 0; k < 8; k++) { await attend("dbgState().mode==='drive'", 6000, 50); /* un vol NEUF à chaque essai : la figure d'avant ne tourne plus */ await ev('dbgNitro(1,0);1'); const j0 = await joy(), f0 = (await fig()).lancees; /* compteurs et réservoir AVANT le décollage : le doigt arrive dès les premières images (une figure lancée trop tard dans le vol est refusée, c'est voulu) */ if (!(await enVol())) continue; const r = await action();
      const j1 = await joy(), f1 = (await fig()).lancees; if ((await ev('dbgState().mode')) === 'fall' && (refusOK || !(j1.refus > j0.refus && j1.n === j0.n))) return { ok: true, r, j0, j1, f0, f1 }; await attend("dbgState().mode==='drive'", 5000, 100); } return { ok: false }; };
  const dit = (nom, ok, d) => { console.log((ok ? 'OK ' : 'KO ') + nom + ' : ' + d); if (!ok) ko++; };
  const raz = async () => { await ev("dbgSable(true);dbgAuto(true,0,{saut:3,imp:22});1"); /* le bac à sable : une chute ne tue pas, la caisse se replace */ await attend("dbgState().mode==='drive'", 8000, 100); };

  const SC = {
    /* chaque direction lance l'emplacement de SA direction ; ◄ et ► partent de leur côté */
    directions: async () => {
      await ev("dbgVol('tout');dbgFig('equipe','saltoa');dbgFig('equipe','saltov');dbgFig('equipe','tonneau');1"); await raz();
      if (!(await joy())) return ['KO', 'dbgJoy absent (le joystick n\'existe pas encore)'];
      const S = (await fig()).slots, det = [], sens = {};
      for (const [k, dy, nom] of [[0, -70, 'haut'], [1, 70, 'bas']]) { if (!S[k]) continue; const e = await essai(() => pousse(0, dy));
        if (!e.ok) return ['KO', 'pas de vol (' + nom + ')'];
        if (e.j1.n !== e.j0.n + 1 || e.j1.der !== S[k] || e.j1.ders !== k) return ['KO', nom + ' : attendu ' + S[k] + ' (emplacement ' + k + ', +1), vu ' + e.j1.der + ' (emplacement ' + e.j1.ders + ', n ' + e.j0.n + '→' + e.j1.n + ') ' + JSON.stringify([e.j0, e.j1])]; det.push(nom + '=' + S[k]); }
      for (const [sg, nom] of [[-1, 'gauche'], [1, 'droite']]) { const e = await essai(() => pousse(70 * sg, 0)); if (!e.ok) return ['KO', 'pas de vol (' + nom + ')'];
        if (e.j1.n !== e.j0.n + 1 || e.j1.der !== S[2] || e.j1.ders !== 2) return ['KO', nom + ' : attendu ' + S[2] + ' (emplacement 2, +1), vu ' + e.j1.der + ' (emplacement ' + e.j1.ders + ') ' + JSON.stringify([e.j0, e.j1])]; sens[nom] = e.j1.sens; det.push(nom + '=' + S[2] + ' sens ' + e.j1.sens); }
      if (sens.gauche && sens.droite && sens.gauche === sens.droite) return ['KO', 'gauche et droite tournent dans le même sens (' + sens.gauche + ')'];
      return ['OK', det.join(', ')]; },
    /* un emplacement vide : refus, aucune figure */
    vide: async () => {
      await ev("dbgVol('rien');1"); await raz(); if (!(await joy())) return ['KO', 'dbgJoy absent']; const S = (await fig()).slots; if (S[0]) return ['KO', 'emplacement avant non vide : ' + S[0]];
      const e = await essai(() => pousse(0, -70), true); if (!e.ok) return ['KO', 'pas de vol'];
      return e.j1.refus === e.j0.refus + 1 && e.f1 === e.f0 && e.j1.n === e.j0.n ? ['OK', 'refus +1, aucune figure'] : ['KO', 'refus ' + e.j0.refus + '→' + e.j1.refus + ', lancées ' + e.f0 + '→' + e.f1 + ', n ' + e.j0.n + '→' + e.j1.n]; },
    /* le seuil : sous le seuil rien ; au seuil UNE figure et UNE vibration ; une poussée tenue n'en lance qu'une ; revenir près du centre réarme */
    seuil: async () => {
      await ev("dbgVol('tout');dbgFig('equipe','tonneau');1"); await raz(); if (!(await joy())) return ['KO', 'dbgJoy absent'];
      let e = await essai(() => pousse(-20, 0)); if (!e.ok || e.j1.n !== e.j0.n || e.j1.vib !== e.j0.vib) return ['KO', 'sous le seuil : ' + JSON.stringify([e.j0.n, e.j1.n, e.j0.vib, e.j1.vib])];
      e = await essai(() => pousse(-60, 0)); if (!e.ok || e.j1.n !== e.j0.n + 1 || e.j1.vib !== e.j0.vib + 1) return ['KO', 'au seuil : n ' + e.j0.n + '→' + e.j1.n + ', vib ' + e.j0.vib + '→' + e.j1.vib];
      e = await essai(async () => { const r = await pousse(-60, 0, { fin: false }); await tch('touchMove', [{ x: r[0] - 66, y: r[1], id: 1 }]); await dormir(120); await tch('touchMove', [{ x: r[0] - 58, y: r[1] + 6, id: 1 }]); await tch('touchEnd', []); });
      if (!e.ok || e.j1.vib !== e.j0.vib + 1) return ['KO', 'une poussée tenue a vibré ' + (e.ok ? e.j1.vib - e.j0.vib : '?') + ' fois'];
      e = await essai(async () => { const r = await pousse(-60, 0, { fin: false }); await tch('touchMove', [{ x: r[0] - 4, y: r[1], id: 1 }]); await tch('touchMove', [{ x: r[0] - 64, y: r[1], id: 1 }]); await tch('touchEnd', []); });
      return e.ok && e.j1.vib === e.j0.vib + 2 ? ['OK', 'sous le seuil rien ; au seuil 1 vibration ; tenue = 1 seule ; retour au centre puis repoussée = la 2e'] : ['KO', 'réarmement : vib ' + (e.ok ? e.j0.vib + '→' + e.j1.vib : 'pas de vol')]; },
    /* (Review Focus 1) une poussée brève puis un tap : PAS de double-tap fantôme — une seule figure, celle du joystick */
    rapide: async () => {
      await ev("dbgVol('tout');dbgFig('equipe','tonneau');1"); await raz(); if (!(await joy())) return ['KO', 'dbgJoy absent'];
      const e = await essai(async () => { await pousse(-60, 0, { pas: 70 }); const r = await rect('#tNitro'), p = [{ x: r[0], y: r[1], id: 1 }]; await tch('touchStart', p); await tch('touchEnd', []); await dormir(700); });
      return e.ok && e.j1.n === e.j0.n + 1 && e.j1.refus === e.j0.refus ? ['OK', 'poussée + tap : 1 figure, 0 refus (aucun double-tap fantôme)'] : ['KO', e.ok ? 'n ' + e.j0.n + '→' + e.j1.n + ', refus ' + e.j0.refus + '→' + e.j1.refus : 'pas de vol']; },
    /* (Review Focus 2) une poussée à l'image du décollage : une figure PARTIE ou un refus, jamais les deux, jamais deux figures */
    decollage: async () => {
      await ev("dbgVol('tout');dbgFig('equipe','tonneau');1"); await raz(); if (!(await joy())) return ['KO', 'dbgJoy absent']; const det = [];
      for (let k = 0; k < 6; k++) { const e = await essai(() => pousse(-60, 0, { pas: 70 }), true); if (!e.ok) return ['KO', 'pas de vol (' + k + ') : ' + await ev('JSON.stringify((function(){const s=dbgState();return {started:s.started,go:s.gameOver,mode:s.mode,paused:s.paused};})())')];
        const dn = e.j1.n - e.j0.n, dr = e.j1.refus - e.j0.refus; if (dn + dr !== 1) return ['KO', 'vol ' + k + ' : n +' + dn + ', refus +' + dr]; det.push(dn ? 'F' : 'R'); }
      return ['OK', 'six poussées en début de vol : ' + det.join('')]; },
    /* deux doigts : le volant (gauche) garde la main pendant que NITRO pousse ; lever NITRO ne coupe pas le volant */
    multitouch: async () => {
      await ev("dbgVol('tout');dbgFig('equipe','tonneau');1"); await raz(); if (!(await joy())) return ['KO', 'dbgJoy absent'];
      const s = await rect('#tSteer'), pt = { x: s[0] - 40, y: s[1], id: 2 }, tou = async () => JSON.parse(await ev('JSON.stringify(dbgTouch())'));
      await tch('touchStart', [{ x: s[0], y: s[1], id: 2 }]); await tch('touchMove', [pt]); const t0 = await tou();
      if (!t0.act || Math.abs(t0.st) < .3) return ['KO', 'le volant ne prend pas : ' + JSON.stringify(t0)];
      const e = await essai(() => pousse(-60, 0, { autres: [pt] })); const t1 = await tou(); await tch('touchEnd', []); await dormir(400); const t2 = await tou();
      return e.ok && e.j1.n === e.j0.n + 1 && t1.act && Math.sign(t1.st) === Math.sign(t0.st) && !t2.act ? ['OK', 'figure partie (+1), volant tenu (st ' + t0.st + '→' + t1.st + '), rendu au lâcher']
        : ['KO', JSON.stringify({ ok: e.ok, n: e.ok && [e.j0.n, e.j1.n], t0: t0.st, t1: t1.act && t1.st, t2: t2.act })]; },
    /* (sonde de mise au point, hors du jeu de scénarios) les doigts vus par la page pendant un volant + une poussée NITRO */
    sonde: async () => {
      await raz(); await ev("window.__L=[];['touchstart','touchmove','touchend','touchcancel'].forEach(function(t){document.addEventListener(t,function(e){window.__L.push(t+':'+[].map.call(e.touches,function(x){return x.identifier+'@'+Math.round(x.clientX)+','+Math.round(x.clientY);}).join('|')+' tcid='+(window.dbgTouch&&dbgTouch().id)+' act='+dbgTouch().act);},true);});1");
      const s = await rect('#tSteer'), pt = { x: s[0] - 40, y: s[1], id: 2 };
      await tch('touchStart', [{ x: s[0], y: s[1], id: 2 }]); await tch('touchMove', [pt]); await pousse(-60, 0, { autres: [pt] }); await dormir(300);
      return ['KO', JSON.stringify(await ev('window.__L')).slice(0, 900) + ' ' + (await ev('JSON.stringify(dbgTouch())'))]; },
    /* pause, perte de focus, doigt tenu au décollage : aucune requête périmée */
    reprise: async () => {
      await ev("dbgVol('tout');dbgFig('equipe','tonneau');1"); await raz(); if (!(await joy())) return ['KO', 'dbgJoy absent'];
      await ev('window.__panBascule();1'); await dormir(300); let j0 = await joy(); await pousse(-60, 0); await dormir(300); await ev('window.__panBascule();1'); await attend("!dbgState().paused&&dbgState().started&&!dbgState().gameOver", 8000, 100); await dormir(700); let j1 = await joy();
      if (j1.n !== j0.n || j1.vib !== j0.vib) return ['KO', 'poussée pendant la pause : n ' + j0.n + '→' + j1.n + ', vib ' + j0.vib + '→' + j1.vib];
      await pousse(-60, 0, { fin: false }); const jp = await joy(); if (jp.arme) { await tch('touchEnd', []); return ['KO', 'précondition : la poussée tenue devrait avoir désarmé le joystick ' + JSON.stringify(jp)]; }
      await ev("window.dispatchEvent(new Event('blur'));1"); j1 = await joy(); await tch('touchEnd', []);
      if (!j1.arme || j1.dir) return ['KO', 'blur : joystick pas remis à zéro ' + JSON.stringify([j1.arme, j1.dir])];
      const e = await essai(() => pousse(-60, 0)); if (!e.ok || e.j1.n !== e.j0.n + 1) return ['KO', 'après le blur la poussée ne part plus'];
      await attend("dbgState().mode==='drive'", 6000, 50); await pousse(-60, 0, { fin: false }); j0 = await joy(); await dormir(3500); j1 = await joy(); await tch('touchEnd', []);
      return j1.vib === j0.vib && j1.n === j0.n ? ['OK', 'pause muette, blur remet à zéro, un doigt tenu à travers un décollage ne relance rien'] : ['KO', 'doigt tenu : vib ' + j0.vib + '→' + j1.vib + ', n ' + j0.n + '→' + j1.n]; },
    /* le double-tap tire une figure adaptée : à sec (dbgTirage) puis en vrai */
    tirage: async () => {
      await ev("dbgVol('tout');1"); await raz(); if ((await ev('typeof dbgTirage')) !== 'function') return ['KO', 'dbgTirage absent'];
      const det = [];
      for (const d of [0.5, 0.8, 1.2, 2]) { const r = JSON.parse(await ev(`JSON.stringify(dbgTirage(200,{dispo:${d}}))`)); if (r.refus > 0 && Object.keys(r.tires).length) return ['KO', 'dispo ' + d + ' : ' + r.refus + ' tirages vides alors que des figures tiennent']; if (r.horsTemps) return ['KO', 'dispo ' + d + ' : ' + r.horsTemps + ' figures trop longues pour le vol']; det.push(d + ':' + Object.keys(r.tires).length + ' figs'); }
      const g = JSON.parse(await ev("JSON.stringify(dbgTirage(200,{x:1,y:0}))")), av = JSON.parse(await ev("JSON.stringify(dbgTirage(200,{x:0,y:1}))"));
      if (g.horsDirection || av.horsDirection) return ['KO', 'braquage : ' + g.horsDirection + ' côté hors direction, ' + av.horsDirection + ' avant hors direction'];
      if (g.repetes || av.repetes) return ['KO', 'même figure deux fois de suite : ' + g.repetes + '/' + av.repetes];
      const f0 = (await fig()).lancees, r0 = (await joy()).rejet, v0 = (await joy()).vide; let n = 0;
      for (let k = 0; k < 6; k++) { const e = await essai(async () => { n++; const r = await rect('#tNitro'), p = [{ x: r[0], y: r[1], id: 1 }]; await tch('touchStart', p); await tch('touchEnd', []); await tch('touchStart', p); await tch('touchEnd', []); await dormir(150); }, true); /* sans pause : le double-tap doit tenir dans DTAP.entre (420 ms) */ if (!e.ok) break; } /* n = les double-taps réellement joués (un vol manqué en rejoue un) */
      const f1 = (await fig()).lancees, j = await joy(); /* rejet = figLance a refusé la figure TIRÉE (jamais) ; vide = aucune figure ne tient dans la fin du vol (permis : double-tap trop tard) */ return f1 - f0 >= 4 && j.rejet === r0 ? ['OK', det.join(' ') + ' ; ' + (f1 - f0) + ' figures pour ' + n + ' double-taps, 0 rejet (' + (j.vide - v0) + ' trop tard)'] : ['KO', (f1 - f0) + ' figures pour ' + n + ' double-taps, rejets ' + r0 + '→' + j.rejet + ', trop tard ' + (j.vide - v0)]; }
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
