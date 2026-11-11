/* LE BANC DES PIÈCES VOLANTES (2026-11-10, Sacha : « il faut qu'elle aille dans la voiture, surtout avec l'aimant ») : une course en Chrome headless GPU (téléphone, SANS SON),
   conduite par le pilote automatique (dbgAuto), qui prouve que la pièce ramassée finit sa course DANS la caisse :
     A. photos figées (dbgPiecesVol('fige',u)) : pièces factices à 15 / 40 / 70 % de leur course, avec et sans aimant ;
     B. au sol : chaque pièce ramassée lance une pièce volante (lances = pièces gagnées), elles arrivent toutes, et en fin de course elles sont À MOINS de 1,5 m du cœur de la caisse ;
     C. avant / après (dbgPiecesVol('actif',0)) : la pièce s'éteint à la prise comme avant, l'argent est le même ;
     D. sous l'aimant (dbgPwr('m')) : le flot d'arrivées, des photos en plein vol ;
     E. en vol (dbgDauphin) : les pièces restent collées à la caisse ; à la mort (boom) il n'en reste aucune.
   node outils/banc-pieces/vol.cjs [--sortie dossier] [--jeu dossier] [--prof profil chaud] [--http 9811] [--cdp 9812] */
const fs = require('fs'), path = require('path');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir, tmp } = require('../banc-trainees/cdp.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.resolve(A.jeu || path.join(__dirname, '..', '..', 'VERSION PRINCIPALE')), P_HTTP = +(A.http || 9811), P_CDP = +(A.cdp || 9812), W = 390, H = 844;
const SORTIE = path.resolve(A.sortie || __dirname);
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const SAVE = { v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, bank: 48500, aura: 1200, auraMax: 3000, owned: [0, 1, 2, 3], plq: { ok: 1 } };
(async () => {
  for (const p of [P_HTTP, P_CDP]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  fs.mkdirSync(SORTIE, { recursive: true });
  const srv = await serveur(JEU, P_HTTP), prof = A.prof || tmp();
  const { ch, pg } = await lanceChrome(P_CDP, prof, W, H);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  const err = [], con = [], bilan = [];
  c.ws.addEventListener('message', e => { try { const m = JSON.parse(e.data);
    if (m.method === 'Runtime.exceptionThrown') { const d = m.params.exceptionDetails; err.push(((d.exception && d.exception.description) || d.text || '').slice(0, 400)); }
    if (m.method === 'Runtime.consoleAPICalled' && (m.params.type === 'error' || m.params.type === 'warning')) con.push(m.params.type + ': ' + m.params.args.map(a => a.value !== undefined ? String(a.value) : (a.description || '')).join(' ').slice(0, 220));
  } catch (x) {} });
  const fin = () => { try { c.close(); } catch (e) {} tueChrome(ch); srv.close(); };
  const ev = (x, ms) => c.ev(x, ms || 20000);
  const attend = async (expr, ms, pas) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { try { if (await ev(expr, 8000)) return true; } catch (e) {} await dormir(pas || 500); } return false; };
  const photo = async (nom) => { const sh = await c.send('Page.captureScreenshot', { format: 'png' }, 30000); const f = path.join(SORTIE, nom + '.png'); fs.writeFileSync(f, Buffer.from(sh.data, 'base64')); console.log('  photo :', f); };
  const ok = (nom, cond, detail) => { bilan.push([nom, !!cond]); console.log((cond ? '  ✔ ' : '  ✘ ') + nom + (detail !== undefined ? '  ' + detail : '')); };
  try {
    await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Network.enable');
    await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
    await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 2, mobile: true, screenWidth: W, screenHeight: H });
    await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' });
    await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAVE)) + ')}catch(e){}' });
    await c.send('Page.navigate', { url: `http://127.0.0.1:${P_HTTP}/index.html?colonne=0&tel=1&simu=1&garde=1&intro=ancien&attente=0&chute=0` });
    const pret = await attend("!!window.__gameReady&&typeof dbgState==='function'&&document.getElementById('mHome').classList.contains('on')", 300000, 1000);
    console.log('prêt :', pret); if (!pret) throw new Error('le jeu ne démarre pas');
    await dormir(2500);
    await ev("(function(){const s=document.getElementById('splash');if(s){s.dispatchEvent(new Event('touchstart'));s.click();}return 1;})()"); await dormir(800);
    console.log('dbgJouer :', JSON.stringify(await ev('dbgJouer()')).slice(0, 120));
    ok('la course part', await attend("(function(){const s=dbgState();return s.started&&!s.gameOver&&s.mode==='drive';})()", 60000, 500));
    await ev('dbgAuto(true,0)'); await dormir(2500);
    console.log('état :', JSON.stringify(await ev('dbgPiecesVol()')), ' pièces :', await ev('dbgPwr().pieces'));

    console.log('\n[A] photos figées');
    await ev("dbgPiecesVol('raz')");
    for (const [u, nom] of [[.15, 'a1-depart'], [.4, 'a2-milieu'], [.7, 'a3-fin']]) {
      await ev("dbgPiecesVol('raz');dbgPiecesVol('lance',36,true);dbgPiecesVol('fige'," + u + ")"); await dormir(250); await photo('aimant-' + nom); }
    for (const [u, nom] of [[.2, 'sol-1-depart'], [.5, 'sol-2-milieu'], [.8, 'sol-3-fin']]) { /* au sol, sans aimant : seulement des pièces DEVANT la caisse, comme sur la route */
      await ev("dbgPiecesVol('raz');dbgPiecesVol('lance',9,false,true);dbgPiecesVol('fige'," + u + ")"); await dormir(250); await photo(nom); }
    ok('mode figé libéré', (await ev("dbgPiecesVol('fige')")) === -1);
    await ev("dbgPiecesVol('raz')");

    console.log('\n[B] au sol, sans aimant');
    await ev("window.__vs={maxLate:0,ech:[],maxN:0};clearInterval(window.__vsT);window.__vsT=setInterval(function(){const n=dbgPiecesVol().n;window.__vs.maxN=Math.max(window.__vs.maxN,n);for(let i=0;i<n;i++){const p=dbgPiecesVol('pos',i);if(p&&p.u>.93)window.__vs.maxLate=Math.max(window.__vs.maxLate,p.dist);if(p&&window.__vs.ech.length<40&&i===0)window.__vs.ech.push(p.dist+'@'+p.u);}},40);1");
    const sem = async (ms) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { await ev("dbgPiecesVol('semis',14)"); await dormir(600); } }; /* des pièces semées devant la caisse : le banc ne dépend plus de la route tirée */
    const c0 = await ev('dbgPwr().pieces'); await ev("dbgPiecesVol('raz')");
    await sem(9000);
    const c1 = await ev('dbgPwr().pieces'), e1 = await ev('JSON.stringify(dbgPiecesVol())'), vs1 = await ev('JSON.stringify(window.__vs)');
    console.log('  pièces gagnées :', c1 - c0, ' bilan :', e1, ' relevé :', vs1.slice(0, 200));
    const s1 = JSON.parse(e1), v1 = JSON.parse(vs1);
    ok('des pièces ont été ramassées', c1 - c0 > 0, c1 - c0);
    ok('chaque pièce ramassée lance une pièce volante', s1.lances + s1.pleine === c1 - c0, s1.lances + '+' + s1.pleine + ' / ' + (c1 - c0));
    ok('elles arrivent toutes (sauf celles en route)', s1.arrivees >= s1.lances - s1.n - 1, s1.arrivees + ' / ' + s1.lances);
    ok('près de l\'arrivée (u > 0,93) elles sont à moins de 1,5 m du cœur de la caisse', v1.maxLate < 1.5, v1.maxLate.toFixed(2) + ' m');
    ok('pas de réserve pleine au sol', s1.pleine === 0);

    console.log('\n[C] avant / après (?pvol=0 à chaud)');
    await ev("dbgPiecesVol('actif',0);dbgPiecesVol('raz')"); const c2 = await ev('dbgPwr().pieces'); await sem(6000);
    const c3 = await ev('dbgPwr().pieces'), s3 = await ev('dbgPiecesVol()');
    console.log('  pièces gagnées :', c3 - c2, ' bilan :', JSON.stringify(s3));
    ok('désactivé : aucune pièce volante, l\'argent monte quand même', s3.lances === 0 && c3 - c2 > 0, c3 - c2);
    await ev("dbgPiecesVol('actif',1);dbgPiecesVol('raz')");

    console.log('\n[D] sous l\'aimant — avant (traction dans le repère du monde) puis après (portage)');
    const aimant = async (portage, etiq) => {
      await ev("dbgBord({s:300})"); await dormir(500); /* la caisse remise au départ : à 900 km/h elle arriverait au bout de la piste (régénérée en plein test) */
      await ev("dbgPiecesVol('portage'," + portage + ");dbgPiecesVol('raz');window.__vs={maxLate:0,ech:[],maxN:0}");
      console.log('  [' + etiq + '] dbgPwr(m) :', JSON.stringify(await ev("dbgPwr('m')")).slice(0, 60));
      const c4 = await ev('dbgPwr().pieces'); await ev("dbgPiecesVol('trace',1)"); let photos = 0; const t0 = Date.now();
      const modes = {}; let tS = 0; while (Date.now() - t0 < 9000) { if (Date.now() - tS > 600) { tS = Date.now(); await ev("dbgPiecesVol('semis',25)"); } const st = await ev('dbgPiecesVol()'), n = st.n; modes[st.mode] = (modes[st.mode] || 0) + 1; if (n >= 3 && photos < 2) { photos++; await photo('aimant-' + etiq + '-' + photos); await dormir(500); } else await dormir(60); }
      const tr5 = await ev("dbgPiecesVol('trace',0)"); const exs = tr5.exemples || []; delete tr5.exemples; console.log('  [' + etiq + '] trajectoires (repère de la caisse) :', JSON.stringify(tr5), ' modes de la caisse :', JSON.stringify(modes)); for (const x of exs) console.log('    ex. loin derrière :', x.slice(0, 700));
      const c5 = await ev('dbgPwr().pieces'), s5 = await ev('dbgPiecesVol()'), v5 = JSON.parse(await ev('JSON.stringify(window.__vs)'));
      const part = s5.aimant ? s5.derriere / s5.aimant : 0;
      console.log('  [' + etiq + '] pièces gagnées :', c5 - c4, ' prises sous l\'aimant :', s5.aimant, ' derrière la caisse :', s5.derriere, '(' + Math.round(part * 100) + ' %)  devant :', s5.devant, ' maxN :', v5.maxN, ' maxLate :', v5.maxLate);
      return { c: c5 - c4, s: s5, v: v5, part, tr: tr5 };
    };
    console.log('  cadence du banc (i/s) :', await ev("new Promise(function(r){var n=0,t0=performance.now();(function f(){n++;if(performance.now()-t0<2000)requestAnimationFrame(f);else r(Math.round(n/2));})();})", 15000));
    console.log('  vitesse tenue à 900 km/h :', await ev("dbgPiecesVol('vitesse',900)")); await dormir(2500); console.log('  kmh :', await ev('dbgPiecesVol().kmh'));
    const dAv = await aimant(0, 'avant'), dAp = await aimant(1, 'apres');
    await ev("dbgPiecesVol('vitesse',0)");
    ok('l\'aimant ramasse et les pièces volantes suivent', dAp.c > 0 && dAp.s.lances > 0 && dAp.s.lances + dAp.s.pleine >= dAp.c - 1, dAp.s.lances + ' / ' + dAp.c);
    ok('assez de pièces d\'aimant pour comparer (≥ 15 chacun)', dAv.s.aimant >= 15 && dAp.s.aimant >= 15, dAv.s.aimant + ' / ' + dAp.s.aimant);
    ok('le portage : moins de pièces prises derrière la caisse qu\'avant', dAp.part < dAv.part, Math.round(dAv.part * 100) + ' % → ' + Math.round(dAp.part * 100) + ' %');
    ok("trajectoires : moins de pièces parties de devant qui passent derrière qu'avant", dAp.tr.part < dAv.tr.part, dAv.tr.part + ' → ' + dAp.tr.part);
    ok('trajectoires : au plus 10 % des pièces parties de devant passent LOIN derrière (plus de 4 m)', dAp.tr.part_loin <= .10, dAv.tr.part_loin + ' → ' + dAp.tr.part_loin);
    ok("trajectoires : la traction reste courte (durée médiane de 40 m à la prise < 0,15 s, p90 < 0,25 s)", dAp.tr.dur_med < .15 && dAp.tr.dur_p90 < .25, dAv.tr.dur_med + ' s → ' + dAp.tr.dur_med + ' s (p90 ' + dAp.tr.dur_p90 + ')');
    ok('le portage : au plus 15 % des pièces prises derrière la caisse', dAp.part <= .15, Math.round(dAp.part * 100) + ' %');
    ok('sous l\'aimant aussi, elles finissent dans la caisse (< 1,5 m à u > 0,93)', dAp.v.maxLate < 1.5, dAp.v.maxLate.toFixed(2) + ' m');

    console.log('\n[E] en vol');
    await ev("dbgAuto(false,0);dbgDauphin(70,60,0,0)");
    const vol = await attend("dbgState().mode==='fall'", 15000, 100); ok('la caisse vole', vol);
    if (vol) { await dormir(700); await ev("dbgPiecesVol('raz');dbgPiecesVol('lance',24,true);dbgPiecesVol('fige',.5)"); await dormir(250); await photo('en-vol-milieu');
      const p0 = await ev("dbgPiecesVol('pos',0)"); console.log('  pièce 0 en vol :', JSON.stringify(p0)); ok('en vol, la pièce figée est près de la caisse', p0 && p0.dist < 5, p0 && p0.dist);
      await ev("dbgPiecesVol('fige')"); }
    await ev("dbgPiecesVol('raz');dbgPiecesVol('lance',20,true)");
    await ev("dbgDauphin('boom');1"); await dormir(2500);
    const sf = await ev('dbgPiecesVol()'); console.log('  après la mort :', JSON.stringify(sf));
    ok('à la mort, plus aucune pièce volante', sf.n === 0, sf.n);
  } catch (e) { console.log('ÉCHEC :', String(e).slice(0, 300)); bilan.push(['échec du banc', false]); }
  console.log('\n=== EXCEPTIONS (' + err.length + ') ==='); for (const x of [...new Set(err)]) console.log(' - ' + x.replace(/\n/g, ' ⏎ ').slice(0, 300));
  console.log('=== CONSOLE error/warn (' + con.length + ') ==='); for (const x of [...new Set(con)].slice(0, 20)) console.log(' - ' + x.slice(0, 220));
  const rate = bilan.filter(b => !b[1]); console.log('\nRÉSULTAT :', rate.length ? 'ÉCHEC — ' + rate.map(b => b[0]).join(' | ') : 'tout passe (' + bilan.length + ' contrôles)', ' exceptions=' + err.length);
  fin(); process.exit(rate.length || err.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
