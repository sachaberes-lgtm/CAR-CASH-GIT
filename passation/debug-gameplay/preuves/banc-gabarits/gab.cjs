/* BANC GABARITS (2026-11-10, chasse aux bugs de JEU) : copie adaptée de outils/banc-course/course.cjs.
   Un Chrome sans fenêtre, UN gabarit d'iPhone, plusieurs maps ; par map : course 1 (dbgAuto) → mort → REJOUER → course 2 → mort, + un passage de portail (--portail 1).
   Sonde toutes les ~1 s de SIMULATION : s, lat, vA, mode, hOff, latOff, NaN, figé. Simulation PAS À PAS (dbgStep, déterministe : même graine = même piste quel que soit le gabarit)
   ou temps réel (--reel 1).
   node gab.cjs --tag 375 --w 375 --h 667 --dpr 2 [--palier 0|1|2] [--maps a,b,c] [--tmax 40] [--seed 7] [--portail 1] [--reel 1] [--prof <dossier>] [--http 8841 --cdp 9741]
   Sortie : <tag>.jsonl (une ligne par course) + <tag>.log (exceptions, console, requêtes). Muet : sfx/mus/vox coupés dans la sauvegarde AVANT le chargement. */
const fs = require('fs'), path = require('path');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir, tmp } = require('/Users/sachaberes/cash-car/debug-gameplay/outils/banc-trainees/cdp.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = '/Users/sachaberes/cash-car/debug-gameplay/VERSION PRINCIPALE', P_HTTP = +(A.http || 8841), P_CDP = +(A.cdp || 9741);
const W = +(A.w || 390), H = +(A.h || 844), DPR = +(A.dpr || 3), TMAX = +(A.tmax || 40), TAG = A.tag || (W + 'x' + H), PAL = A.palier, REEL = A.reel === '1', PORTAIL = A.portail === '1';
const MAPS = (A.maps || 'nuages,espace,ville,crypto,jade,foret,canyon,dunes,grotte,banquise').split(',');
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const SAVE = { v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, bank: 48500, aura: 1200, auraMax: 3000, owned: [0, 1, 2, 3], plq: { ok: 1 } };
const OUT = __dirname, JL = path.join(OUT, TAG + '.jsonl'), LG = path.join(OUT, TAG + '.log');
const lg = (s) => { fs.appendFileSync(LG, s + '\n'); console.log(s); };
const seedSrc = (n) => `(function(){var a=${n >>> 0};Math.random=function(){a=(a+0x6D2B79F5)>>>0;var t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};})();`;
const hash = (s) => { let h = 7; for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h; };
(async () => {
  for (const p of [P_HTTP, P_CDP]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  const srv = await serveur(JEU, P_HTTP), prof = A.prof || tmp();
  const { ch, pg } = await lanceChrome(P_CDP, prof, W, H);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  let err = [], con = [], rx = new Map(), cur = 'init';
  c.ws.addEventListener('message', e => { try { const m = JSON.parse(e.data);
    if (m.method === 'Network.responseReceived' && m.params.response.status >= 400) rx.set(cur + ' ' + m.params.response.url.replace(/^http:\/\/127\.0\.0\.1:\d+/, '') + ' → ' + m.params.response.status, 1);
    if (m.method === 'Network.loadingFailed' && !m.params.canceled) rx.set(cur + ' ÉCHEC ' + (m.params.errorText || '') + ' ' + m.params.requestId, 1);
    if (m.method === 'Runtime.exceptionThrown') { const d = m.params.exceptionDetails; err.push(cur + ' | ' + ((d.exception && d.exception.description) || d.text || '').slice(0, 300)); }
    if (m.method === 'Log.entryAdded') { const t = String(m.params.entry.text || ''); if (!/^(Autofocus|\[Deprecation|\[Violation)/.test(t)) con.push(cur + ' | log(' + m.params.entry.level + '): ' + t.slice(0, 200)); }
    if (m.method === 'Runtime.consoleAPICalled' && (m.params.type === 'error' || m.params.type === 'warning')) con.push(cur + ' | ' + m.params.type + ': ' + m.params.args.map(a => a.value !== undefined ? String(a.value) : (a.description || a.type)).join(' ').slice(0, 300));
  } catch (x) {} });
  const fin = () => { try { c.close(); } catch (e) {} tueChrome(ch); srv.close(); };
  process.on('SIGTERM', () => { fin(); process.exit(1); });
  const ev = async (e, t) => { try { return await c.ev(e, t || 20000); } catch (x) { return 'ERR ' + String(x.message).slice(0, 160); } };
  const attend = async (expr, ms, pas) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { try { if (await c.ev(expr, 8000)) return true; } catch (e) {} await dormir(pas || 500); } return false; };
  const tapTexte = async (re) => { const r = await c.ev(`(function(){const R=new RegExp(${JSON.stringify(re)},'i');for(const e of document.querySelectorAll('button,.pbtn,[role=button]')){const b=e.getBoundingClientRect();if(b.width<1||b.height<1)continue;if(R.test(e.textContent||''))return [b.left+b.width/2,b.top+b.height/2,(e.textContent||'').trim().slice(0,30)];}return null;})()`);
    if (!r) return null;
    await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: r[0], y: r[1] }] }); await dormir(60);
    await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); return r[2]; };
  const sonde = "(function(){var s=dbgState();return {st:s.started,go:s.gameOver,pa:s.paused,m:s.mode,s:s.s,lat:s.lat,vA:s.vA,vH:s.vH,h:s.hOff,lo:s.latOff,fvy:s.fvy,fs:s.fspd,psi:s.psi,lv:s.level,cg:s.coinsGot};})()";
  const nan = (o) => Object.keys(o).filter(k => typeof o[k] === 'number' && !isFinite(o[k]));
  /* UNE course : renvoie la fiche */
  async function course(map, n, seed, portail) {
    const fiche = { tag: TAG, map, course: n, seed, w: W, h: H, dpr: DPR, palier: PAL == null ? 'auto' : +PAL, portail: !!portail };
    cur = TAG + '/' + map + '#' + n;
    const ok = await attend("(function(){const s=dbgState();return s.started&&!s.gameOver&&s.mode==='drive';})()", 60000, 400);
    fiche.demarre = ok; if (!ok) { fiche.etat = await ev(sonde); return fiche; }
    await ev("dbgAuto(1,0,{vol:true});1");
    const t0 = Date.now(); let simT = 0, derniere = null, sMax = 0, hMin = 1e9, hMax = -1e9, vMax = 0, fige = 0, sPrev = -1, nanL = [], fps = null, modes = {}, trace = [], zones0 = null;
    if (portail) { zones0 = await ev("dbgEco().zones"); }
    let portailFait = false;
    while (simT < TMAX) {
      if (REEL) await dormir(1000); else { await ev("dbgStep(30,33);1", 120000); }
      simT += REEL ? (Date.now() - t0) / 1000 - simT : 1; if (REEL) simT = (Date.now() - t0) / 1000;
      const o = await ev(sonde); if (typeof o !== 'object' || !o) { fiche.sondeErr = String(o); break; }
      derniere = o; sMax = Math.max(sMax, o.s); modes[o.m] = (modes[o.m] || 0) + 1;
      if (o.m === 'drive') { hMin = Math.min(hMin, o.h); hMax = Math.max(hMax, o.h); } vMax = Math.max(vMax, o.vH);
      const nn = nan(o); if (nn.length) nanL.push(Math.round(simT) + ':' + nn.join('+'));
      if (Math.round(simT) % 5 === 0) trace.push([Math.round(simT), o.s, o.lat, o.vH, o.h, o.m]);
      if (o.go) break;
      if (Math.abs(o.s - sPrev) < 0.5 && !o.pa) fige++; else fige = 0; sPrev = o.s;
      if (fige >= 6) { fiche.fige = true; break; }
      if (portail && !portailFait && simT >= 8) { portailFait = true; fiche.portailRep = JSON.stringify(await ev("dbgPortail(450)")).slice(0, 120); }
    }
    fiche.simT = +simT.toFixed(1); fiche.reelS = Math.round((Date.now() - t0) / 1000); fiche.mort = !!(derniere && derniere.go); fiche.sMax = Math.round(sMax); fiche.vMax = vMax;
    fiche.hMin = +hMin.toFixed(2); fiche.hMax = +hMax.toFixed(2); fiche.nan = nanL.slice(0, 5); fiche.modes = modes; fiche.fin = derniere; fiche.trace = trace.slice(-12);
    if (portail) { fiche.zones0 = zones0; fiche.zones1 = await ev("dbgEco().zones"); fiche.carte1 = JSON.stringify(await ev("(function(){try{return dbgClassique()}catch(e){return e.message}})()")).slice(0, 200); }
    fiche.fps = await ev("window.__fpsN?Math.round(window.__fpsN/((performance.now()-window.__fpsT)/1000)):null");
    return fiche;
  }
  try {
    await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Network.enable'); await c.send('Log.enable');
    await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
    await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: DPR, mobile: true, screenWidth: W, screenHeight: H });
    await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' });
    for (const map of MAPS) {
      const seed = hash(map) + (+A.seed || 7);
      cur = TAG + '/' + map + '#charge';
      await c.send('Page.navigate', { url: 'about:blank' }); await dormir(300);
      const sid = (await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAVE)) + ')}catch(e){}' + seedSrc(seed) + 'window.__fpsN=0;window.__fpsT=performance.now();(function f(){window.__fpsN++;requestAnimationFrame(f);})();' })).identifier;
      await c.send('Page.navigate', { url: `http://127.0.0.1:${P_HTTP}/index.html?colonne=0&tel=1&simu=1&garde=1&intro=ancien&attente=0${PAL != null ? '&palier=' + PAL : ''}${A.extra || ''}` });
      const pret = await attend("!!window.__gameReady&&typeof dbgState==='function'&&document.getElementById('mHome').classList.contains('on')", 300000, 1000);
      if (!pret) { lg('!! ' + TAG + ' ' + map + ' : jeu pas prêt'); fs.appendFileSync(JL, JSON.stringify({ tag: TAG, map, pret: false }) + '\n'); await c.send('Page.removeScriptToEvaluateOnNewDocument', { identifier: sid }); continue; }
      const sv = await ev("localStorage.cashcarSave"); if (/"(sfx|mus|vox)":\s*true/.test(sv || '')) lg('!! son pas coupé ' + sv);
      await dormir(2500);
      lg(TAG + ' ' + map + ' palier=' + JSON.stringify(await ev("JSON.stringify(dbgPalier())")).slice(0, 120));
      const cl = await ev("dbgClassique('" + map + "','matin')"); lg('  dbgClassique ' + JSON.stringify(cl).slice(0, 140));
      for (let n = 1; n <= 2; n++) {
        if (n === 1) { await ev("(function(){const s=document.getElementById('splash');if(s){s.dispatchEvent(new Event('touchstart'));s.click();}return 1;})()"); await dormir(800); const r = await ev('dbgJouer()'); lg('  dbgJouer ' + JSON.stringify(r).slice(0, 100)); }
        else {
          if (!(await attend("dbgState().gameOver", 5000, 300))) { lg('  (course 1 pas finie) on force la mort'); await ev("dbgDauphin('boom');1"); await attend("dbgState().gameOver", 15000, 300); }
          await dormir(3000); let r = await tapTexte('REJOUER|RETRY|PLAY AGAIN'); if (!r) { await tapTexte('^\\s*CONTINUER|^\\s*CONTINUE'); await dormir(2500); r = await tapTexte('REJOUER|RETRY|PLAY AGAIN'); }
          lg('  REJOUER tapé : ' + r);
        }
        const f = await course(map, n, seed, false); fs.appendFileSync(JL, JSON.stringify(f) + '\n');
        lg('  c' + n + ' demarre=' + f.demarre + ' mort=' + f.mort + ' simT=' + f.simT + ' (réel ' + f.reelS + 's) s=' + f.sMax + ' vmax=' + f.vMax + ' h[' + f.hMin + ',' + f.hMax + '] nan=' + (f.nan || []).length + ' fige=' + !!f.fige + ' fps=' + f.fps);
        if (!f.demarre) break;
      }
      if (PORTAIL) {
        if (!(await attend("dbgState().gameOver", 3000, 300))) { await ev("dbgDauphin('boom');1"); await attend("dbgState().gameOver", 15000, 300); }
        await dormir(3000); let r = await tapTexte('REJOUER|RETRY|PLAY AGAIN'); if (!r) { await tapTexte('^\\s*CONTINUER|^\\s*CONTINUE'); await dormir(2500); r = await tapTexte('REJOUER|RETRY|PLAY AGAIN'); }
        const f = await course(map, 3, seed, true); fs.appendFileSync(JL, JSON.stringify(f) + '\n');
        lg('  portail : ' + f.portailRep + ' zones ' + f.zones0 + '→' + f.zones1 + ' mort=' + f.mort + ' s=' + f.sMax + ' carte=' + f.carte1);
      }
      await c.send('Page.removeScriptToEvaluateOnNewDocument', { identifier: sid });
    }
  } catch (e) { lg('ÉCHEC : ' + String(e).slice(0, 300)); }
  lg('=== EXCEPTIONS (' + err.length + ')'); for (const x of [...new Set(err)]) lg(' - ' + x.replace(/\n/g, ' ⏎ '));
  lg('=== REQUÊTES EN ÉCHEC (' + rx.size + ')'); for (const x of [...rx.keys()].slice(0, 60)) lg(' - ' + x);
  lg('=== CONSOLE (' + con.length + ')'); for (const x of [...new Set(con)].slice(0, 60)) lg(' - ' + x);
  fin(); process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
