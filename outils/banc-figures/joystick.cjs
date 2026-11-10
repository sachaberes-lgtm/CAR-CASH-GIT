/* LE BANC DU JOYSTICK NITRO (2026-11-10, Sacha : « le bouton nitro doit être un joystick qui permet de faire les figures de la direction où tu le pousses,
   et le double-tap donne une figure aléatoire dans la liste de celles que tu as débloquées ») — le vrai jeu en Chrome headless tactile (844×390, iPhone UA, sans son).
   Usage : node outils/banc-figures/joystick.cjs --sc directions|vide|seuil|tirage|visuel|ecole|tous [--http 9801 --cdp 9802 --prof <dossier chaud>] [--photos <dossier>] [--cfg couche-fr-0,debout-en-1] [--allege 0]
   `visuel` : le design du pouce (#tJoy) — 8 configurations (couché/debout × fr/en × droitier/gaucher), mesures et PHOTOS PNG ; `tous` n'en joue que deux ; `--allege 0` photographie la version complète (filtres, secousse).
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
const PHOTOS = A.photos || path.join(os.tmpdir(), 'banc-joystick-photos'); // les PNG du scénario `visuel` (hors dépôt)
const SCENARIOS = ['directions', 'vide', 'seuil', 'rapide', 'decollage', 'multitouch', 'reprise', 'tirage', 'visuel', 'ecole']; /* `visuel` et `ecole` rechargent le jeu (formats, langues, mains ; partie neuve avec auto-école) : toujours les derniers */
const voulus = (!A.sc || A.sc === 'tous' ? SCENARIOS : A.sc.split(',')).sort((a, b) => (a === 'ecole') - (b === 'ecole')); // `ecole` recharge la page : toujours en dernier

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
  const demarre = async () => { await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 2, mobile: true, screenWidth: W, screenHeight: H }); if (amorce2) { await c.send('Page.removeScriptToEvaluateOnNewDocument', { identifier: amorce2 }); amorce2 = null; } /* retour au format d'origine, sans les réglages de langue / main de `visuel` */ await c.send('Page.navigate', { url: `http://127.0.0.1:${P_HTTP}/index.html?colonne=0&tel=1&simu=1&garde=1&intro=ancien&attente=0` });
    if (!(await attend("!!window.__gameReady&&typeof dbgState==='function'&&document.getElementById('mHome').classList.contains('on')", 300000, 1000))) throw new Error('le jeu ne démarre pas');
    await dormir(2500); const dj = await ev('JSON.stringify(dbgJouer())');
    if (!(await attend("(function(){const s=dbgState();return s.started&&!s.gameOver&&s.mode==='drive';})()", 60000, 500))) throw new Error('la course ne part pas : dbgJouer=' + String(dj).slice(0, 160) + ' état=' + String(await ev('JSON.stringify(dbgState())')).slice(0, 160)); };
  const dit = (nom, ok, d) => { console.log((ok ? 'OK ' : 'KO ') + nom + ' : ' + d); if (!ok) ko++; };
  const photo = async (nom) => { fs.mkdirSync(PHOTOS, { recursive: true }); const sh = await c.send('Page.captureScreenshot', { format: 'png' }, 30000); const p = path.join(PHOTOS, nom + '.png'); fs.writeFileSync(p, Buffer.from(sh.data, 'base64')); return p; };
  const raz = async () => { await ev("dbgSable(true);dbgAuto(true,0,{saut:3,imp:22});1"); /* le bac à sable : une chute ne tue pas, la caisse se replace */ await attend("dbgState().mode==='drive'", 8000, 100); };

  /* charge le jeu dans un format (w×h), une langue, une main (gau) : lance la course et attend qu'elle tourne. Les réglages passent par un 2e script d'amorçage (après celui de la sauvegarde). */
  let amorce2 = null;
  const charge = async (w, h, o) => { o = o || {};
    await c.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 2, mobile: true, screenWidth: w, screenHeight: h });
    if (amorce2) await c.send('Page.removeScriptToEvaluateOnNewDocument', { identifier: amorce2 });
    amorce2 = (await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{' + (o.lang ? 'localStorage.setItem("ccLang",' + JSON.stringify(o.lang) + ');' : '') + 'var s=JSON.parse(localStorage.getItem("cashcarSave")||"{}");s.gaucher=' + (o.gau ? 1 : 0) + ';localStorage.setItem("cashcarSave",JSON.stringify(s))}catch(e){}' })).identifier;
    await c.send('Page.navigate', { url: `http://127.0.0.1:${P_HTTP}/index.html?colonne=0&tel=1&simu=1&garde=1&intro=ancien&attente=0` + (A.allege === '0' ? '&allege=0' : '') });
    if (!(await attend("!!window.__gameReady&&typeof dbgState==='function'&&document.getElementById('mHome').classList.contains('on')", 300000, 1000))) throw new Error('le jeu ne démarre pas');
    await dormir(2500); const dj = await ev('JSON.stringify(dbgJouer())');
    if (!(await attend("(function(){const s=dbgState();return s.started&&!s.gameOver&&s.mode==='drive';})()", 60000, 500))) throw new Error('la course ne part pas : dbgJouer=' + String(dj).slice(0, 160) + ' état=' + String(await ev('JSON.stringify(dbgState())')).slice(0, 160));
  };

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
    /* LE DESIGN DU POUCE (#tJoy) : socle, pion, quatre repères. Huit configurations (couché/debout × FR/EN × droitier/gaucher) — `tous` n'en joue que deux, `--sc visuel` les huit
       (`--cfg couche-fr-0,debout-en-1` en choisit). Chaque configuration : les noms (la figure ÉQUIPÉE de chaque direction, la pire en anglais), aucun repère hors écran (marge 8 px),
       aucun sur NITRO ni sur le socle, aucun sur un autre ; le pion au repos / à mi-course / au seuil ; au sol, ce que fait chaque direction ; et des PHOTOS (--photos <dossier>). */
    visuel: async () => {
      const toutes = []; for (const f of ['couche', 'debout']) for (const l of ['fr', 'en']) for (const g of [0, 1]) toutes.push(f + '-' + l + '-' + g);
      const cfgs = A.cfg ? A.cfg.split(',') : (A.sc === 'visuel' ? toutes : ['couche-fr-0', 'debout-en-1']);
      const LIRE = `JSON.stringify((function(){const J=document.getElementById('tJoy');if(!J)return null;const R=function(e){if(!e)return null;const b=e.getBoundingClientRect();return [b.left,b.top,b.right,b.bottom];},cs=getComputedStyle(J);const ch={};['u','d','l','r'].forEach(function(k){const e=J.querySelector('[data-d="'+k+'"]');ch[k]=e&&{cls:e.className,txt:e.textContent.trim(),rp:e.getAttribute('data-rp'),r:R(e),disp:getComputedStyle(e).display};});const p=J.querySelector('.tjPion'),s=J.querySelector('.tjSocle');return {cls:J.className,disp:cs.display,ch:ch,pion:p&&{r:R(p),cls:p.className},socle:s&&{r:R(s)},nitro:R(document.getElementById('tNitro')),vp:[innerWidth,innerHeight],body:document.body.className};})())`;
      const raz2 = async () => { await raz(); await ev('dbgAuto(true,0,{saut:3,imp:60});1'); }; /* des vols de ~2 s (22 : 0,35 s, trop court pour un doigt posé et une photo) */
      const lire = async () => JSON.parse(await ev(LIRE));
      const ctr = r => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];
      const agg = { marge: 1e9, disque: 1e9, socle: 1e9, chev: 1e9, n: 0 }, fautes = [], photos = [], lignes = [];
      const volAction = async (fn) => { for (let k = 0; k < 10; k++) { await attend("dbgState().mode==='drive'", 6000, 50); await ev('dbgNitro(1,0);1'); if (!(await enVol())) continue; const r = await fn(); if ((await ev('dbgState().mode')) === 'fall') return { ok: true, r }; try { await tch('touchEnd', []); } catch (x) {} await attend("dbgState().mode==='drive'", 5000, 100); } return { ok: false }; };
      const inter = (a, b, m) => a[0] < b[2] + m && a[2] > b[0] - m && a[1] < b[3] + m && a[3] > b[1] - m; /* deux rectangles [l,t,r,b] à moins de m px l'un de l'autre */
      const dRC = (r, c) => { const x = Math.max(r[0], Math.min(c[0], r[2])), y = Math.max(r[1], Math.min(c[1], r[3])); return Math.hypot(x - c[0], y - c[1]); }; /* distance du rectangle au point c */
      const geo = (cfg, etat, J) => { if (!J) { fautes.push(cfg + ' ' + etat + ' : #tJoy absent'); return; } const [W9, H9] = J.vp, N = J.nitro, S = J.socle ? J.socle.r : null, c = ctr(N), rs = S ? (S[2] - S[0]) / 2 : 0, ks = ['u', 'd', 'l', 'r'];
        for (const k of ks) { const e = J.ch[k]; if (!e || !e.r) { fautes.push(cfg + ' ' + etat + ' : repère ' + k + ' absent'); continue; } const r = e.r;
          const m = Math.min(r[0], r[1], W9 - r[2], H9 - r[3]); agg.marge = Math.min(agg.marge, m); if (m < 8) fautes.push(cfg + ' ' + etat + ' : repère ' + k + ' à ' + m.toFixed(1) + ' px du bord (marge 8)');
          if (inter(r, [N[0], N[1] - 48, N[2], N[3]], 0)) fautes.push(cfg + ' ' + etat + ' : repère ' + k + ' sur NITRO ' + JSON.stringify(r.map(Math.round)) + ' / ' + JSON.stringify(N.map(Math.round)));
          agg.disque = Math.min(agg.disque, Math.max(r[0] - N[2], N[0] - r[2], r[1] - N[3], N[1] - 48 - r[3])); /* (NITRO + sa flamme enfoncée : 48 px au-dessus du cadre) */
          const ds = dRC(r, c) - rs; agg.socle = Math.min(agg.socle, ds); if (ds < 0) fautes.push(cfg + ' ' + etat + ' : repère ' + k + ' sur le socle (' + ds.toFixed(1) + ' px)');
          for (const k2 of ks) if (k2 > k && J.ch[k2] && J.ch[k2].r) { const q = J.ch[k2].r, g = Math.max(r[0] - q[2], q[0] - r[2], r[1] - q[3], q[1] - r[3]); agg.chev = Math.min(agg.chev, g); if (g < 0) fautes.push(cfg + ' ' + etat + ' : repères ' + k + ' et ' + k2 + ' se recouvrent'); } agg.n++; } };
      let tab = null;
      for (const cfg of cfgs) { const [fm, lg, gu] = cfg.split('-'), [w, h] = fm === 'couche' ? [844, 390] : [390, 844], t0 = Date.now();
        await charge(w, h, { lang: lg, gau: +gu });
        if (!tab) { if ((await ev('typeof dbgJoyLeg')) !== 'function') return ['KO', "#tJoy absent (dbgJoyLeg n'existe pas encore : le design du pouce n'est pas là)"]; tab = JSON.parse(await ev("JSON.stringify(dbgJoyLeg('tous'))")); }
        if (!(await ev("document.body.classList.contains('gaucher')===" + (gu === '1')))) return ['KO', cfg + ' : la main ne change pas'];
        /* les figures ÉQUIPÉES les plus longues (dans la langue) pour chaque direction : le pire cas des noms */
        await ev("dbgVol('tout');1"); await raz2();
        const eq = [0, 1, 2].map(k => tab.filter(f => f.slots.includes(k)).sort((a, b) => b[lg].length - a[lg].length)[0]); for (const f of eq) await ev(`dbgFig('equipe',${JSON.stringify(f.id)});1`);
        const S = (await fig()).slots, att = k => { const f = S[k] && tab.find(x => x.id === S[k]); return f ? f[lg] : ''; };
        await raz2(); const pre = '' + fm + '-' + lg + '-' + (gu === '1' ? 'gaucher' : 'droitier'), snap = async (etat) => { const p = await photo(pre + '-' + etat); photos.push(p); };
        /* 1. en vol, au repos : les repères, les noms, les mesures */
        let e = await volAction(async () => { await attend("(function(){const J=document.getElementById('tJoy');return !!J&&J.classList.contains('vol');})()", 800, 20); const J = await lire(); await snap('vol'); return J; });
        if (!e.ok) return ['KO', cfg + ' : pas de vol'];
        let J = e.r; if (!J) return ['KO', cfg + ' : #tJoy absent en vol']; if (!/\bvol\b/.test(J.cls)) fautes.push(cfg + ' : #tJoy sans la classe vol en vol (' + J.cls + ')');
        geo(cfg, 'vol', J);
        for (const [k, kk] of [['u', 0], ['d', 1], ['l', 2], ['r', 2]]) { const x = J.ch[k]; if (!x) continue; const att9 = att(kk); if (x.txt !== (att9 || '-')) fautes.push(cfg + ' : repère ' + k + ' dit « ' + x.txt + ' », attendu « ' + (att9 || '-') + ' »'); if (!att9 !== /\bvide\b/.test(x.cls)) fautes.push(cfg + ' : repère ' + k + ' vide=' + /\bvide\b/.test(x.cls) + ' pour « ' + att9 + ' »'); if (att9 && !x.rp) fautes.push(cfg + ' : repère ' + k + ' sans data-rp'); if (att9 && x.txt.length > 8) fautes.push(cfg + ' : repère ' + k + ' trop long (' + x.txt + ')'); }
        lignes.push(cfg + ' noms ' + ['u', 'd', 'l', 'r'].map(k => J.ch[k] && J.ch[k].txt).join('/'));
        /* 2. le pouce posé : socle allumé, pion au centre */
        const nit = async () => rect('#tNitro');
        e = await volAction(async () => { const r = await nit(); await tch('touchStart', [{ x: r[0], y: r[1], id: 1 }]); await dormir(60); const J = await lire(); await snap('repos'); await tch('touchEnd', []); return J; });
        if (!e.ok) return ['KO', cfg + ' : pas de vol (repos)']; J = e.r; if (!/\btenu\b/.test(J.cls)) fautes.push(cfg + ' : pas de classe tenu au pouce posé (' + J.cls + ')');
        { const cs = ctr(J.socle.r), cp = ctr(J.pion.r), c0 = ctr(J.nitro), d1 = Math.hypot(cs[0] - c0[0], cs[1] - c0[1]), d2 = Math.hypot(cp[0] - cs[0], cp[1] - cs[1]); if (d1 > 2) fautes.push(cfg + ' : socle à ' + d1.toFixed(1) + ' px du centre de NITRO'); if (d2 > 3) fautes.push(cfg + ' : pion au repos à ' + d2.toFixed(1) + ' px du centre'); } geo(cfg, 'repos', J);
        /* 3. à mi-course (22 px à gauche) : le pion suit, la direction visée s'allume, rien n'est encore parti */
        e = await volAction(async () => { const r = await nit(); await tch('touchStart', [{ x: r[0], y: r[1], id: 1 }]); await tch('touchMove', [{ x: r[0] - 11, y: r[1], id: 1 }]); await tch('touchMove', [{ x: r[0] - 22, y: r[1], id: 1 }]); await dormir(50); const J = await lire(); await snap('mi'); await tch('touchEnd', []); return J; });
        if (!e.ok) return ['KO', cfg + ' : pas de vol (mi-course)']; J = e.r;
        { const cs = ctr(J.socle.r), cp = ctr(J.pion.r); if (Math.abs(cp[0] - (cs[0] - 22)) > 4 || Math.abs(cp[1] - cs[1]) > 4) fautes.push(cfg + ' : pion à mi-course en (' + (cp[0] - cs[0]).toFixed(1) + ',' + (cp[1] - cs[1]).toFixed(1) + '), attendu (-22,0)'); if (!/\bvise\b/.test(J.ch.l.cls)) fautes.push(cfg + ' : repère ◄ pas allumé à mi-course (' + J.ch.l.cls + ')'); if (/\bvise\b/.test(J.ch.r.cls + J.ch.u.cls + J.ch.d.cls)) fautes.push(cfg + ' : un autre repère allumé à mi-course'); if (/\btire\b/.test(J.ch.l.cls)) fautes.push(cfg + ' : repère ◄ « tiré » avant le seuil'); } geo(cfg, 'mi', J);
        /* 4. au seuil (60 px vers le haut) : le pion est retenu à 56 px, le repère ▲ est tiré, le pion claque (le compteur dbgJoyLeg().claques) */
        const cl0 = (await ev('dbgJoyLeg().claques'));
        e = await volAction(async () => { const r = await nit(); await tch('touchStart', [{ x: r[0], y: r[1], id: 1 }]); for (const dy of [-20, -40, -60]) await tch('touchMove', [{ x: r[0], y: r[1] + dy, id: 1 }]); await dormir(30); const J = await lire(); await snap('seuil'); await tch('touchEnd', []); return J; });
        if (!e.ok) return ['KO', cfg + ' : pas de vol (seuil)']; J = e.r;
        { const cs = ctr(J.socle.r), cp = ctr(J.pion.r), dd = Math.hypot(cp[0] - cs[0], cp[1] - cs[1]); if (dd < 50 || dd > 58.5) fautes.push(cfg + ' : pion au seuil à ' + dd.toFixed(1) + ' px du centre (attendu ~56)'); if (!/\btire\b/.test(J.ch.u.cls)) fautes.push(cfg + ' : repère ▲ pas « tiré » au seuil (' + J.ch.u.cls + ')'); const cl1 = await ev('dbgJoyLeg().claques'); if (!(cl1 > cl0)) fautes.push(cfg + " : le pion n'a pas claqué (" + cl0 + '→' + cl1 + ')'); } geo(cfg, 'seuil', J);
        await dormir(700); const apres = await lire(); if (/\btenu\b/.test(apres.cls)) fautes.push(cfg + ' : #tJoy reste « tenu » après le lâcher');
        /* 5. au sol : le pouce posé dit ce que fait chaque direction AU SOL */
        await attend("dbgState().mode==='drive'", 8000, 50); { const r = await nit(); await tch('touchStart', [{ x: r[0], y: r[1], id: 1 }]); await dormir(120); const Js = await lire(); await snap('sol'); await tch('touchEnd', []);
          if (!Js || !/\btenu\b/.test(Js.cls)) fautes.push(cfg + ' : pas de pion au sol'); else { geo(cfg, 'sol', Js); const t = k => Js.ch[k].txt; if (t('u') !== 'WHEELIE') fautes.push(cfg + ' : au sol ▲ dit « ' + t('u') + '», attendu WHEELIE'); if (!/TAIL WHIP|SLIDE 360/.test(t('l'))) fautes.push(cfg + ' : au sol ◄ dit « ' + t('l') + '»'); if (!t('d')) fautes.push(cfg + ' : au sol ▼ muet'); lignes[lignes.length - 1] += ' · sol ' + ['u', 'd', 'l', 'r'].map(k => t(k)).join('/'); } }
        /* 6. (première configuration seulement) aucune figure équipée : les repères vides sont grisés */
        if (cfg === cfgs[0]) { await ev("dbgVol('rien');1"); await raz2(); e = await volAction(async () => { await attend("(function(){const J=document.getElementById('tJoy');return !!J&&J.classList.contains('vol');})()", 800, 20); await dormir(60); return lire(); }); if (e.ok) { const S2 = (await fig()).slots; for (const [k, kk] of [['u', 0], ['d', 1], ['l', 2], ['r', 2]]) if (!S2[kk] && !/\bvide\b/.test(e.r.ch[k].cls)) fautes.push(cfg + ' : repère ' + k + ' sans figure mais pas grisé (' + e.r.ch[k].cls + ')'); geo(cfg, 'vide', e.r); await snap('vide'); } }
        console.log('   ' + cfg + ' : ' + ((Date.now() - t0) / 1000).toFixed(0) + ' s · ' + lignes[lignes.length - 1]);
      }
      const bilan = 'marge mini ' + agg.marge.toFixed(1) + ' px au bord, ' + agg.disque.toFixed(1) + ' px à NITRO, ' + agg.socle.toFixed(1) + ' px au socle, ' + agg.chev.toFixed(1) + ' px entre repères (' + agg.n + ' mesures) ; photos : ' + PHOTOS;
      return fautes.length ? ['KO', fautes.slice(0, 6).join(' | ') + (fautes.length > 6 ? ' … (' + fautes.length + ' fautes)' : '') + ' — ' + bilan] : ['OK', cfgs.length + ' configurations : ' + bilan]; },
    /* (sonde) la durée des vols */
    duree: async () => { await raz2(); await ev('dbgAuto(true,0,{saut:3,imp:' + (A.imp || 22) + '});1'); const out = []; let prev = '', t0 = Date.now(); for (let i = 0; i < 300; i++) { const m = await ev('dbgState().mode'); if (m !== prev) { out.push(m + '@' + (Date.now() - t0)); prev = m; } await dormir(30); } return ['KO', out.join(' ')]; },
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
      const f1 = (await fig()).lancees, j = await joy(); /* rejet = figLance a refusé la figure TIRÉE (jamais) ; vide = aucune figure ne tient dans la fin du vol (permis : double-tap trop tard) */ return f1 - f0 >= 4 && j.rejet === r0 ? ['OK', det.join(' ') + ' ; ' + (f1 - f0) + ' figures pour ' + n + ' double-taps, 0 rejet (' + (j.vide - v0) + ' trop tard)'] : ['KO', (f1 - f0) + ' figures pour ' + n + ' double-taps, rejets ' + r0 + '→' + j.rejet + ', trop tard ' + (j.vide - v0)]; },
    /* (2026-11-10, tâche 6) L'AUTO-ÉCOLE : partie NEUVE (tuto 0, permis 0, vieux réglage figG:'glisse' gardé dans la sauvegarde), on saute à l'étape FIGURE (dbgTuto(5)).
       · FR + une POUSSÉE NITRO au seuil valide l'étape ; EN + un DOUBLE-TAP la valide aussi (le vieux 'glisse' ne le coupe plus) ; chaque fois par une figure PLANTÉE (dbgTuto().pay > 0),
         pas par l'accord des 3 sauts ; la consigne affichée est la bonne (FR, puis EN) ; la main fantôme alterne le double-tap et la poussée ; plus de ligne FIGURES dans les réglages ;
         le build ne contient plus figGlisseOn ; aucune exception de page (le test du banc). */
    ecole: async () => {
      const src = fs.readFileSync(path.join(JEU, 'index.html'), 'utf8'), det = [];
      if (/figGlisseOn/.test(src)) return ['KO', 'figGlisseOn est encore dans le build'];
      const FR = 'Tape 2 fois vite sur NITRO, ou pousse-le dans une direction', EN = 'Tap NITRO twice, fast, or push it in a direction';
      const tuto = async () => JSON.parse(await ev('JSON.stringify(dbgTuto())'));
      const texte = () => ev("(function(){const e=document.querySelector('#coach .ecD');return e?e.textContent.replace(/[\\u00a0\\u202f]/g,' ').trim():null;})()");
      const neuve = async (lang) => { await ev('sessionStorage.setItem("bancEcole",' + JSON.stringify(JSON.stringify({ lang })) + ');1'); await demarre();
        if (!(await attend("dbgTuto().on&&document.getElementById('coach')&&document.getElementById('coach').classList.contains('on')", 30000, 200))) throw new Error('l\'auto-école ne démarre pas : ' + JSON.stringify(await tuto()));
        await ev('dbgTuto(5);1'); await dormir(2500); }; // 5 = l'étape FIGURE
      const valide = async (geste) => { await ev("dbgSable(false);dbgAuto(true,0,{saut:4,imp:22});1"); const j0 = await joy();
        for (let k = 0; k < 6; k++) { if (!(await attend("dbgState().mode==='fall'&&dbgTuto().on&&dbgTuto().i===5", 12000, 40))) break; await ev('dbgNitro(1,0);1'); await geste();
          if (await attend("dbgTuto().pay>0&&(dbgTuto().i>=6||!dbgTuto().on)", 9000, 100)) break; }
        const t = await tuto(), j1 = await joy(); await attend("!dbgTuto().on", 8000, 200); const t2 = await tuto(); await ev('dbgAuto(false);1');
        return { t, t2, j0, j1 }; };
      /* A : français, vieux réglage 'glisse', la poussée */
      await neuve('fr'); let tx = await texte();
      if (tx !== FR) return ['KO', 'consigne FR : « ' + tx + ' » au lieu de « ' + FR + ' »'];
      if (await ev("!!(document.getElementById('mvFigG')||document.querySelector('[data-m=\"figg\"],[data-a=\"figg\"].mvRow,#mvFigG'))")) return ['KO', 'la ligne FIGURES est encore dans les réglages'];
      const vus = new Set(); for (let k = 0; k < 14; k++) { vus.add(await ev("(document.getElementById('ecMain')||{}).className||''")); await dormir(550); }
      const alt = [...vus].filter(x => /\b(double|glisseN)\b/.test(x)).map(x => x.replace(/\bon\b/, '').trim()); if (!(alt.includes('double') && alt.includes('glisseN'))) return ['KO', 'la main fantôme n\'alterne pas les deux gestes : ' + JSON.stringify([...vus])];
      if (A.photo) fs.writeFileSync(A.photo + '-fr.png', Buffer.from((await c.send('Page.captureScreenshot', { format: 'png' })).data, 'base64')); // --photo <préfixe> : la carte de consigne en image
      let r = await valide(() => pousse(-60, 0, { pas: 30 })); if (!(r.t.pay >= 1) || !(r.t.i >= 6 || !r.t.on) || r.j1.n <= r.j0.n) return ['KO', 'poussée NITRO : ' + JSON.stringify(r)];
      if (r.t2.on || r.t2.permis !== 1) return ['KO', 'poussée : la leçon ne se termine pas ' + JSON.stringify(r.t2)]; det.push('FR poussée : figure plantée (' + r.t.pay + '), étape validée, permis ' + r.t2.permis + ', main alternée ' + alt.join('/'));
      if ((await ev('JSON.parse(localStorage.getItem("cashcarSave")).figG')) !== 'glisse') { /* le vieux réglage reste écrit tel quel (on ne touche pas la sauvegarde) */ det.push('(figG relu : ' + await ev('JSON.parse(localStorage.getItem("cashcarSave")).figG') + ')'); }
      /* B : anglais, vieux réglage 'glisse', le double-tap */
      await neuve('en'); tx = await texte(); if (tx !== EN) return ['KO', 'consigne EN : « ' + tx + ' » au lieu de « ' + EN + ' »'];
      if (A.photo) fs.writeFileSync(A.photo + '-en.png', Buffer.from((await c.send('Page.captureScreenshot', { format: 'png' })).data, 'base64'));
      r = await valide(async () => { const q = await rect('#tNitro'), p = [{ x: q[0], y: q[1], id: 1 }]; await tch('touchStart', p); await tch('touchEnd', []); await tch('touchStart', p); await tch('touchEnd', []); await dormir(150); });
      if (!(r.t.pay >= 1) || !(r.t.i >= 6 || !r.t.on)) return ['KO', 'double-tap : ' + JSON.stringify(r)];
      if (r.t2.on || r.t2.permis !== 1) return ['KO', 'double-tap : la leçon ne se termine pas ' + JSON.stringify(r.t2)]; det.push('EN double-tap : figure plantée (' + r.t.pay + '), étape validée, permis ' + r.t2.permis);
      await ev('localStorage.removeItem("ccLang");1'); return ['OK', det.join(' ; ') + ' ; consignes FR/EN conformes ; aucune ligne FIGURES ; build sans figGlisseOn']; },
  };

  try {
    await c.send('Page.enable'); await c.send('Runtime.enable');
    await c.send('Network.enable'); await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
    await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 2, mobile: true, screenWidth: W, screenHeight: H });
    await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' });
    await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{var s=JSON.parse(localStorage.getItem("cashcarSave")||"null"),fl=sessionStorage.getItem("bancEcole");if(!s){localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAVE)) + ')}else{s.sfx=false;s.mus=false;s.vox=false;if(fl){fl=JSON.parse(fl);s.tuto=0;s.permis=0;s.figG="glisse";localStorage.ccLang=fl.lang;sessionStorage.removeItem("bancEcole");}else{s.tuto=1;s.permis=1;localStorage.removeItem("ccLang");}localStorage.setItem("cashcarSave",JSON.stringify(s))}}catch(e){}' });
    await charge(W, H, {});
    for (const nom of voulus) { if (!SC[nom]) { dit(nom, false, 'scénario inconnu'); continue; }
      const e0 = err.length; let r; try { r = await SC[nom](); } catch (e) { r = ['KO', 'exception du banc : ' + String(e.message || e).slice(0, 200)]; }
      if (err.length > e0) r = ['KO', 'exception de la page : ' + err.slice(e0).join(' | ').slice(0, 300)];
      dit(nom, r[0] === 'OK', r[1]); if (r[0] !== 'OK') break; }
  } catch (e) { dit('banc', false, String(e.message || e).slice(0, 300)); }
  fin(); process.exit(ko ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
