// LE BANC DE LA GARDE DU CALME (2026-11-15, Sacha : « en HUD calme il faut que les fruits ARRÊTENT D'APPARAÎTRE, mais ceux qui sont déjà là, tu les ramasses »).
// Tour 2 (contrôle adverse) : pause en plein calme, portail franchi au calme, sortie sans trou, retours cohérents (pouvoir = fruit).
// Une course en édition téléphone (?tel=1), SANS SON (sfx/mus/vox coupés dans la sauvegarde, Chrome --mute-audio), filmée image par image (dbgStep : la boucle
// du jeu ne tourne plus d'elle-même). Le HUD calme, lui, compte en VRAI temps (0,9 s) : on attend entre deux pas.
//   1. nitro tenu : on pose A (90 m) et B (260 m), on suit un fruit F de la route ;
//   2. nitro lâché → calme : A, B, F restent visibles et sont PRIS, avec leur retour (ret.p1 / ret.f1, jamais p0/f0) ; C posé pendant le calme ne se voit ni ne se prend ;
//   3. PAUSE en plein calme (2 s), reprise, 1,5 s sans nitro : la garde reste calme, rien n'est jeté (perdus = 0), G (posé au calme) toujours caché, même id ;
//   4. PORTAIL franchi au calme : la zone neuve reste cachée (aucun objet neuf visible) ;
//   5. nitro repris : P1 (très près) ne vient plus, P2 (~200 m) et P3 (~450 m) GRANDISSENT en 0,4 s ; après la sortie, plus rien de caché au-delà du très proche.
// Sortie : <out>/hc-<image>.png + verdict. Code 1 si un contrôle échoue.
//   node outils/banc-hud/calme-garde.cjs [--out dossier] [--http 9921 --cdp 9922] [--q sans=calmegarde] [--w 844 --h 390]
const fs = require('fs'), path = require('path');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir, tmp } = require('../banc-trainees/cdp.cjs');

const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.resolve(A.jeu || path.join(__dirname, '..', '..', 'VERSION PRINCIPALE'));
const OUT = path.resolve(A.out || path.join(__dirname, 'prises'));
const P_HTTP = +(A.http || 9921), P_CDP = +(A.cdp || 9922), W = +(A.w || 390), H = +(A.h || 844), ANCIEN = /calmegarde/.test(A.q || '');
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const SAVE = { v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, bank: 48500, aura: 1200, auraMax: 3000, owned: [0, 1, 2, 3], ex: { runs: 12 }, plq: { m: 'fr', x: 'CC-161-RZ', ok: 1 } };
const TAG = ANCIEN ? 'ancien-' : '';

(async () => {
  for (const p of [P_HTTP, P_CDP]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  fs.mkdirSync(OUT, { recursive: true });
  const srv = await serveur(JEU, P_HTTP), prof = A.prof ? path.resolve(A.prof) : tmp();
  const pb = [], erreurs = [];
  const { ch, pg } = await lanceChrome(P_CDP, prof, W, H);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  c.ws.addEventListener('message', e => { try { const m = JSON.parse(e.data); if (m.method === 'Runtime.exceptionThrown') erreurs.push((m.params.exceptionDetails.exception && m.params.exceptionDetails.exception.description || m.params.exceptionDetails.text || '?').slice(0, 300)); } catch (x) {} });
  const photo = async nom => { const sh = await c.send('Page.captureScreenshot', { format: 'png' }, 30000); fs.writeFileSync(path.join(OUT, 'hc-' + TAG + (W > H ? 'couche-' : 'debout-') + nom + '.png'), Buffer.from(sh.data, 'base64')); };
  const verifie = (ok, msg) => { console.log((ok ? '  ✔ ' : '  ✗ ') + msg); if (!ok) pb.push(msg); };
  const pas = (n) => c.ev('dbgStep(' + (n || 1) + ',16);1', 60000);
  const suivi = async () => JSON.parse(await c.ev("JSON.stringify(dbgCalmeSuivi('etat'))"));
  const pose = (k, nom, ds) => c.ev(`dbgCalmeSuivi('pose','${k}','${nom}',${ds})`);
  const obj = (e, k) => e.o.find(o => o.k === k);
  const court = e => e.o.map(o => o.k + ':' + o.ds + (o.pris ? ' PRIS' : o.cgo ? ' perdu' : o.vu ? ' vu' : ' caché') + (o.cap != null && o.cap < 1 ? ' cap' + o.cap : '')).join(' · ');
  try {
    await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Network.enable');
    await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
    await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 2, mobile: true, screenWidth: W, screenHeight: H });
    await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' });
    await c.send('Emulation.setEmulatedMedia', { features: [{ name: 'hover', value: 'none' }, { name: 'pointer', value: 'coarse' }] });
    await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAVE)) + ')}catch(e){}' });
    await c.send('Page.navigate', { url: `http://127.0.0.1:${P_HTTP}/index.html?colonne=0&tel=1&garde=1&intro=ancien&attente=0` + (A.q ? '&' + A.q : '') });
    let pret = false;
    for (let i = 0; i < 300; i++) { await dormir(500); try { if (await c.ev("!!window.__gameReady&&typeof dbgJouer==='function'", 8000)) { pret = true; break; } } catch (e) {} }
    if (!pret) throw new Error('le jeu ne démarre pas · ' + erreurs.slice(0, 3).join(' / '));
    await dormir(2500);
    await c.ev("(function(){var s=document.getElementById('splash');if(!s)return 0;try{s.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));s.dispatchEvent(new PointerEvent('pointerup',{bubbles:true}));s.click();}catch(e){}s.remove&&s.remove();return 1})()");
    await dormir(2500);
    let enCourse = false;
    for (let essai = 0; essai < 3 && !enCourse; essai++) {
      try { await c.ev('dbgJouer()'); } catch (e) {}
      for (let i = 0; i < 50; i++) { await dormir(500); try { if (await c.ev("(function(){var s=dbgState();return !!(s.started&&s.running&&!s.gameOver)})()")) { enCourse = true; break; } } catch (e) {} }
    }
    if (!enCourse) { await photo('echec'); throw new Error('la course ne part pas'); }
    await c.ev('dbgAuto(true,0,{vol:true,nit:1});1'); await dormir(4000);
    await pas(1);

    console.log('1. NITRO TENU — on pose A (90 m) et B (260 m)');
    for (let i = 0; i < 6; i++) { await pas(3); await dormir(200); }
    await pose('v', 'A', 90); await pose('n', 'B', 260);
    await c.ev("dbgCalmeSuivi('fruit','F')");
    await pas(1); const e1 = await suivi(); console.log('    ' + court(e1));
    verifie(!e1.calme, 'pas de calme au nitro');
    await photo('1-nitro');

    console.log('2. NITRO LÂCHÉ — LE CALME');
    await c.ev('dbgAuto(true,0,{vol:true,nit:0});1');
    let e2 = null;
    for (let i = 0; i < 12; i++) { await dormir(250); await pas(1); e2 = await suivi(); if (e2.calme) break; }
    await pas(1); e2 = await suivi(); console.log('    ' + court(e2));
    verifie(e2.calme, 'le HUD calme est tombé');
    const A2 = obj(e2, 'A'), B2 = obj(e2, 'B');
    if (!ANCIEN) {
      verifie(A2 && (A2.vu || A2.pris), 'A (déjà là) reste visible au calme');
      verifie(B2 && (B2.vu || B2.pris), 'B (déjà là) reste visible au calme');
    } else verifie(B2 && !B2.vu, 'ANCIEN : B s\'efface au calme');
    await photo('2a-calme-entree');
    await pose('x', 'C', 120);
    let eM = null, vuC = false, prisC = false;
    for (let i = 0; i < 90; i++) {
      await pas(1); if (i % 3 === 0) await dormir(30);
      const e = await suivi(); eM = e; if (!e.calme) { console.log('    (le calme est retombé à l\'image ' + i + ')'); break; }
      const C = obj(e, 'C'); if (C && C.vu) vuC = true; if (C && C.pris) prisC = true;
      if (i % 30 === 0) { console.log('    image ' + i + ' : ' + court(e)); await photo('2b-calme-' + String(i).padStart(2, '0')); }
    }
    const ret2 = eM.g.ret; console.log('    retours au calme : ' + JSON.stringify(ret2));
    if (!ANCIEN) {
      verifie(obj(eM, 'A') && obj(eM, 'A').pris, 'A, déjà là au calme, est RAMASSÉ pendant le calme');
      verifie(obj(eM, 'B') && obj(eM, 'B').pris, 'B, déjà là au calme, est RAMASSÉ pendant le calme');
      verifie(!vuC && !prisC, 'C, posé pendant le calme, ne s\'est jamais vu ni pris');
      if (obj(eM, 'F')) verifie(obj(eM, 'F').pris || obj(eM, 'F').ds < 0, 'le fruit F de la route est pris ou dépassé (' + JSON.stringify(obj(eM, 'F')) + ')');
      const nPc = ['A', 'B'].filter(k => obj(e2, k) && !obj(e2, k).pris && obj(eM, k) && obj(eM, k).pris).length; /* pouvoirs suivis pris PENDANT le calme */
      verifie(nPc >= 1 && ret2.p1 - e2.g.ret.p1 >= nPc && ret2.p0 === 0, 'les pouvoirs pris au calme ont leur retour, comme les fruits (' + nPc + ' pris au calme · p1=' + ret2.p1 + ', p0=' + ret2.p0 + ')');
      verifie(ret2.f0 === 0, 'aucun fruit pris au calme sans retour (f1=' + ret2.f1 + ', f0=' + ret2.f0 + ')');
    } else verifie(obj(eM, 'B') && !obj(eM, 'B').pris, 'ANCIEN : B n\'est PAS pris au calme');
    verifie(eM.calme, 'toujours calme à la fin du passage');

    if (!ANCIEN) {
      console.log('3. PAUSE EN PLEIN CALME');
      await pose('a', 'G', 380); await pas(1);
      const av = await suivi(); console.log('    avant : ' + court(av) + ' · ' + JSON.stringify({ id: av.g.id, perdus: av.g.perdus, caches: av.g.devantCaches }));
      await c.ev("dbgCalmeSuivi('pause')");
      for (let i = 0; i < 8; i++) { await dormir(250); await pas(1); }
      const ep = await suivi(); console.log('    en pause : calme ' + ep.calme + ' · garde ' + ep.garde + ' · paused ' + ep.paused);
      verifie(ep.paused && !ep.calme && ep.garde, 'en pause : le HUD revient mais la garde reste calme');
      await photo('3a-pause');
      await c.ev("dbgCalmeSuivi('pause')");
      let ar = null;
      for (let i = 0; i < 40; i++) { await dormir(100); await pas(1); ar = await suivi(); if (!ar.paused) break; }
      const ar0 = ar; console.log('    reprise : calme ' + ar0.calme + ' · garde ' + ar0.garde + ' · ' + court(ar0));
      let gVu = false, minGarde = true;
      for (let i = 0; i < 14; i++) { await dormir(120); await pas(1); ar = await suivi(); const G = obj(ar, 'G'); if (G && G.vu) gVu = true; if (!ar.garde) minGarde = false; }
      console.log('    1,5 s après : calme ' + ar.calme + ' · garde ' + ar.garde + ' · ' + court(ar) + ' · ' + JSON.stringify({ id: ar.g.id, perdus: ar.g.perdus, neufs: ar.g.neufs }));
      verifie(minGarde, 'pendant la reprise sans nitro la garde n\'est jamais sortie');
      verifie(ar.g.id === av.g.id && ar.g.perdus === 0 && ar.g.neufs === 0, 'la pause ne jette rien et ne refait pas de photo (id ' + av.g.id + '→' + ar.g.id + ', perdus ' + ar.g.perdus + ')');
      const G = obj(ar, 'G'); verifie(G && !gVu && !G.cgo && !G.pris, 'G (posé au calme) toujours caché, pas jeté (' + JSON.stringify(G) + ')');
      verifie(ar.calme, 'le HUD calme est revenu de lui-même après la reprise');

      console.log('4. PORTAIL FRANCHI AU CALME');
      const z0 = ar.g.zones; console.log('    ' + JSON.stringify(await c.ev('JSON.stringify(dbgPortail(220))')));
      let ez = null, apres = 0, vuNeuf = 0, vuZ = false, z1 = null, roule = false, neuve = false;
      for (let i = 0; i < 1500; i++) {
        await pas(2); if (i % 10 === 0) await dormir(40);
        ez = await suivi();
        const pe = JSON.parse(await c.ev('JSON.stringify(dbgPortailEtat())'));
        if (ez.g.zones > z0 && !neuve && pe.mode === 'drive' && pe.s < 400) neuve = true; /* la route neuve est posée (s repart de 0) */
        if (neuve) {
          if (!apres++) { console.log('    route neuve de la zone ' + ez.g.zones + ' (image ' + i * 2 + ', s=' + pe.s + ')'); await c.ev("dbgCalmeSuivi('oublie')"); await pose('m', 'Z', 600); continue; }
          const Z = obj(ez, 'Z'); if (!Z) continue; if (z1 == null) z1 = Z.ds;
          if (Z.ds < z1 - 20) { roule = true; if (Z.vu) vuZ = true; if (ez.g.devantVisibles > vuNeuf) vuNeuf = ez.g.devantVisibles; }
          if (roule && Z.ds < 330 && Z.ds > 250) await photo('4-portail-zone-neuve');
          if (Z.ds < 250) break;
        }
      }
      verifie(roule, 'la caisse roule dans la zone neuve (Z ' + z1 + ' → ' + (obj(ez, 'Z') || {}).ds + ' m)');
      verifie(!vuZ, 'Z, posé dans la zone neuve au calme, ne s\'est jamais montré');
      console.log('    ' + JSON.stringify(ez.g));
      verifie(ez.g.zones > z0, 'le portail est franchi (zones ' + z0 + '→' + ez.g.zones + ')');
      verifie(ez.garde, 'la garde est toujours calme dans la zone neuve');
      verifie(vuNeuf === 0 && ez.g.devantCaches > 0, 'la zone neuve ne montre rien de neuf au calme (visibles max ' + vuNeuf + ', cachés ' + ez.g.devantCaches + ')');
    }

    console.log('5. NITRO REPRIS — LA SORTIE');
    if (!ANCIEN) { await c.ev("dbgCalmeSuivi('oublie')"); await pose('v', 'P1', 25); await pose('n', 'P2', 200); await pose('x', 'P3', 450); }
    await pas(1);
    const avS = await suivi(); console.log('    avant : ' + court(avS));
    await c.ev('dbgAuto(true,0,{vol:true,nit:1});1');
    let e3 = null; for (let i = 0; i < 40; i++) { await pas(1); e3 = await suivi(); if (!e3.garde && !e3.calme) { console.log('    (sortie après ' + (i + 1) + ' image(s))'); break; } }
    for (let i = 0; i < 60; i++) { await pas(1); e3 = await suivi(); if (ANCIEN || e3.g.pres > 0) break; }
    console.log('    ' + court(e3) + ' · ' + JSON.stringify(e3.g));
    verifie(!e3.calme && !e3.garde, 'le calme est fini');
    if (!ANCIEN) {
      const P1 = obj(e3, 'P1'), P2 = obj(e3, 'P2'), P3 = obj(e3, 'P3');
      verifie(P1 && (P1.cgo || P1.pris || P1.ds < 0), 'P1 (très près, ' + (P1 && P1.ds) + ' m, seuil ' + e3.g.pres + ' m) ne surgit pas');
      verifie(P2 && !P2.cgo && P2.cap !== null, 'P2 (' + (P2 && P2.ds) + ' m) grandit au lieu d\'être jeté (' + JSON.stringify(P2) + ')');
      verifie(P3 && !P3.cgo && P3.cap !== null, 'P3 (' + (P3 && P3.ds) + ' m) grandit au lieu d\'être jeté (' + JSON.stringify(P3) + ')');
      verifie(e3.g.pres >= 60 && e3.g.pres <= 150, 'seuil du très proche borné 60-150 m (' + e3.g.pres + ' m à ' + e3.g.vA + ' u/s)');
      verifie(e3.g.cachesLoin === 0, 'après la sortie, plus rien de caché au-delà du très proche (' + e3.g.cachesLoin + ')');
    }
    const caps = [];
    for (let i = 0; i < 5; i++) { await photo('5-sortie-' + i); const e = await suivi(); const P = obj(e, 'P3') || obj(e, 'P2'); caps.push(P ? P.cap + '/' + P.sc : '-'); await pas(6); }
    console.log('    pousse de P3 toutes les 6 images (cap/échelle) : ' + caps.join(' → '));
    const e4 = await suivi(); console.log('    ' + court(e4) + ' · ' + JSON.stringify(e4.g));
    if (!ANCIEN) {
      const P3 = obj(e4, 'P3'); verifie(P3 && (P3.cap === 1 || P3.pris), 'P3 a fini de grandir en moins de 0,5 s (' + JSON.stringify(P3) + ')');
      verifie(e4.g.prochainVu !== null, 'la route devant a de nouveau des objets visibles (le plus proche à ' + e4.g.prochainVu + ' m)');
    }
    verifie(erreurs.length === 0, 'aucune exception dans la console (' + erreurs.length + ')');
    for (const e of erreurs.slice(0, 8)) console.log('   ! ' + e);
  } catch (e) { console.log('ÉCHEC :', String(e).slice(0, 400)); pb.push(String(e).slice(0, 200)); } finally { try { c.close(); } catch (e) {} tueChrome(ch); srv.close(); }
  console.log(pb.length ? pb.length + ' PROBLÈME(S)' : 'TOUT EST BON'); process.exit(pb.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
