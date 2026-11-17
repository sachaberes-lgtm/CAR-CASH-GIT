// LES VOILES AU TIERS DANS LE JEU, WEBKIT (2026-11-17, qualité · voiles) — tiré de couches-webkit.cjs (même parcours, même inspecteur LayerTree).
// À chaque état, dans la même page : html.voiles (+ html.voilesOmbres avec --ombres 1) posé puis retiré. On relève les couches PLEIN ÉCRAN VISIBLES (≥ 90 % de
// l'écran, opacité effective > 0, pas hidden) et leur mémoire, et deux photos animations EN PAUSE (document.getAnimations().pause(), banc seulement) et jeu à
// l'arrêt (dbgStep) : avec / sans, plus une paire témoin (sans / sans) pour le bruit. Écart max par canal.
//   node outils/banc-hud/voiles-webkit.cjs [--w 390 --h 844] [--ombres 1] [--out dossier] [--photos 1]
const EE = require('events').EventEmitter, os = require('os'), path = require('path'), fs = require('fs');
const SES = new Set(); { const o = EE.prototype.emit; EE.prototype.emit = function (...a) { if (this && typeof this.send === 'function' && 'sessionId' in this && this.connection) SES.add(this); return o.apply(this, a); }; }
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const { webkit } = require(A.pw || path.join(os.homedir(), '.npm/_npx/9833c18b2d85bc59/node_modules/playwright-core'));
const EXE = A.exe || path.join(os.homedir(), 'Library/Caches/ms-playwright/webkit-2388/pw_run.sh');
const { serveur, portLibre, dormir } = require('../banc-trainees/cdp.cjs');
const JEU = path.resolve(A.jeu || path.join(__dirname, '..', '..', 'VERSION PRINCIPALE')), OUT = path.resolve(A.out || path.join(__dirname, 'prises'));
const OMB = A.ombres === '1', W = +(A.w || 390), H = +(A.h || 844), P_HTTP = +(A.http || 9943), AB = A.ab === '1', FMT = W > H ? 'couche' : 'debout';
const SAVE = { v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, bank: 48500, aura: 1200, auraMax: 3000, owned: [0, 1, 2, 3], ex: { runs: 12 }, plq: { m: 'fr', x: 'CC-161-RZ', ok: 1 } };
const PAUSE = `(window.__panBascule?window.__panBascule():document.getElementById('tGear').click())`;
const NOMS = ['transform3D', 'video', 'canvas', 'plugin', 'iFrame', 'backfaceVisibilityHidden', 'clipsCompositingDescendants', 'animation', 'filters', 'positionFixed', 'positionSticky', 'overflowScrollingTouch', 'stacking', 'overlap', 'negativeZIndexChildren', 'transformWithCompositedDescendants', 'opacityWithCompositedDescendants', 'maskWithCompositedDescendants', 'reflectionWithCompositedDescendants', 'filterWithCompositedDescendants', 'blendingWithCompositedDescendants', 'isolatesCompositedBlendingDescendants', 'perspective', 'preserve3D', 'willChange', 'root', 'blending', 'backdropRoot'];

(async () => {
  if (!portLibre(P_HTTP)) { console.error('port occupé :', P_HTTP); process.exit(2); }
  fs.mkdirSync(OUT, { recursive: true });
  const srv = await serveur(JEU, P_HTTP), rapport = { moteur: 'webkit', w: W, h: H, q: A.q || '', etats: {} };
  const b = await webkit.launch({ executablePath: EXE, headless: true });
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 3, isMobile: true, hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1', serviceWorkers: 'block' });
  await ctx.addInitScript('try{localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAVE)) + ')}catch(e){}');
  const pg = await ctx.newPage(); const err = []; pg.on('pageerror', e => err.push(String(e).slice(0, 200)));
  const ev = x => pg.evaluate(x);
  const LIBRE = A.libre === '1'; /* --libre 1 : la boucle du jeu tourne seule (temps réel), on ne fait qu'attendre */
  const pas = n => LIBRE ? dormir(33 * (n || 1)) : ev('dbgStep(' + (n || 1) + ',33);1');
  let ses = null;
  async function couches(nom) {
    if (!ses) ses = [...SES].reverse().find(s => /^page-/.test(s.sessionId));
    await pas(1); await dormir(400);
    const d = await ses.send('DOM.getDocument'); await ses.send('LayerTree.enable');
    const L = (await ses.send('LayerTree.layersForNode', { nodeId: d.root.nodeId })).layers;
    const liste = [];
    for (const l of L) {
      let r = {}; try { r = (await ses.send('LayerTree.reasonsForCompositingLayer', { layerId: l.layerId })).compositingReasons || {}; } catch (e) {}
      let el = '?';
      try { const o = await ses.send('DOM.resolveNode', { nodeId: l.nodeId });
        el = (await ses.send('Runtime.callFunctionOn', { objectId: o.object.objectId, returnByValue: true,
          functionDeclaration: 'function(){var s=[],e=this;if(e.nodeType!==1)e=e.parentElement;while(e&&e.nodeType===1&&s.length<4){s.unshift(e.id?"#"+e.id:e.nodeName.toLowerCase()+(e.className&&typeof e.className==="string"&&e.className.trim()?"."+e.className.trim().split(/\\s+/).slice(0,2).join("."):""));if(e.id)break;e=e.parentElement;}var o=1,v=getComputedStyle(this.nodeType===1?this:this.parentElement).visibility;for(var q=this.nodeType===1?this:this.parentElement;q&&q.nodeType===1;q=q.parentElement)o*=+getComputedStyle(q).opacity;var an=(this.getAnimations?this.getAnimations():[]).filter(function(a){return a.playState==="running"}).map(function(a){var t=a.effect&&a.effect.getTiming();return (a.animationName||a.transitionProperty||"?")+(t&&t.iterations===Infinity?"∞":"")});return s.join(">")+" {op "+(+o.toFixed(2))+(v!=="visible"?" "+v:"")+(an.length?" · "+an.join(" "):"")+"}"}' })).result.value;
      } catch (e) { el = '(nœud ' + l.nodeId + ')'; }
      if (l.pseudoElement) el += '::' + l.pseudoElement; if (l.isGeneratedContent && !l.pseudoElement) el += ' (généré)'; if (l.isReflection) el += ' (reflet)';
      const b9 = l.compositedBounds || l.bounds;
      liste.push({ el, raisons: NOMS.filter(k => r[k]), w: Math.round(b9.width), h: Math.round(b9.height), peint: l.paintCount | 0, mem: l.memory | 0 });
    }
    /* les REPEINTES : une seconde de jeu (30 pas de 33 ms), puis on relit le compte de peintures de chaque couche */
    const t0 = Date.now(); for (let i = 0; i < 30; i++) { await pas(1); await dormir(25); } const dt = (Date.now() - t0) / 1000;
    const L2 = (await ses.send('LayerTree.layersForNode', { nodeId: d.root.nodeId })).layers, P2 = {}; for (const l of L2) P2[l.layerId] = l.paintCount | 0;
    L.forEach((l, i) => { liste[i].parS = P2[l.layerId] == null ? null : +(((P2[l.layerId] - (l.paintCount | 0)) / dt).toFixed(1)); });
    await ses.send('LayerTree.disable');
    const mem = liste.reduce((a, x) => a + x.mem, 0);
    const pS = liste.reduce((a, x) => a + (x.parS || 0), 0), pInv = liste.filter(x => /\{op 0[ }·]/.test(x.el)).reduce((a, x) => a + (x.parS || 0), 0);
    const nInv = liste.filter(x => /\{op 0[ }·]|hidden/.test(x.el)).length, mInv = liste.filter(x => /\{op 0[ }·]|hidden/.test(x.el)).reduce((a, x) => a + x.mem, 0);
    console.log(`  ${nom} : ${liste.length} couches (${nInv} invisibles, ${(mInv / 1048576).toFixed(2)} Mo) · mémoire ${(mem / 1048576).toFixed(1)} Mo · peintures ${pS.toFixed(1)}/s dont ${pInv.toFixed(1)}/s invisibles`);
    if (A.detail === '1') for (const x of liste) console.log(`      ${x.w}×${x.h}  ${x.el}  [${x.raisons.join(',')}]  peint ${x.peint}${x.parS ? ' · ' + x.parS + '/s' : ''}${x.mem ? ' · ' + (x.mem / 1048576).toFixed(2) + ' Mo' : ''}`);
    return { n: liste.length, mem, nInv, mInv, pS, pInv, couches: liste };
  }
  const OMB_ = A.ombres === '1', CL = OMB ? "'voiles','voilesOmbres'" : "'voiles'";
  const pose = on => ev(`document.documentElement.classList.${on ? 'add' : 'remove'}(${CL});new Promise(r=>setTimeout(()=>r(1),120))`);
  /* figer : la boucle du jeu ne se reprogramme plus (requestAnimationFrame neutralisé : la suite du banc avance par dbgStep, qui marche sans), animations en pause */
  const fige = () => ev("window.requestAnimationFrame=function(){return 0};document.getAnimations().forEach(a=>{try{a.pause()}catch(e){}});new Promise(r=>setTimeout(()=>r(1),700))");
  const relance = () => ev("document.getAnimations().forEach(a=>{try{if(a.playState==='paused')a.play()}catch(e){}});1");
  const pngD = require('fs').readFileSync(path.join(__dirname, 'couches.cjs'), 'utf8').split('\n').slice(22, 34).join('\n');
  const png = new Function('zlib', pngD + ';return png')(require('zlib'));
  const ecart = (a, b) => { let mx = 0, n = 0; for (let i = 0; i < a.d.length; i += 4) { let m = 0; for (let c = 0; c < 3; c++) m = Math.max(m, Math.abs(a.d[i + c] - b.d[i + c])); if (m) { n++; if (m > mx) mx = m; } } return { max: mx, px: n }; };
  const plein = c => c.couches.filter(x => (x.w * x.h >= .9 * W * H || /#(speedFx|cloudFx|flash9|flowGlow|pwrFx)\b|#hud .*::before/.test(x.el)) && !/\{op 0[ }·]|hidden/.test(x.el)); /* plein écran OU un des voiles (au tiers, sa boîte ne fait plus que 1/9 de l'écran) */
  async function etat(nom) {
    const R = {};
    await pose(true); R.avec = await couches(nom + ' · AVEC voiles');
    await pose(false); R.sans = await couches(nom + ' · SANS voiles');
    const r = x => plein(x).map(c => String(c.el).replace(/ \{.*\}/, '') + ' ' + (c.mem / 1048576).toFixed(2)).join(', ');
    R.pleinAvec = { n: plein(R.avec).length, mem: plein(R.avec).reduce((a, x) => a + x.mem, 0) }; R.pleinSans = { n: plein(R.sans).length, mem: plein(R.sans).reduce((a, x) => a + x.mem, 0) };
    console.log(`  >> ${nom} PLEIN ÉCRAN VISIBLES · avec : ${R.pleinAvec.n} (${(R.pleinAvec.mem / 1048576).toFixed(1)} Mo) [${r(R.avec)}] · sans : ${R.pleinSans.n} (${(R.pleinSans.mem / 1048576).toFixed(1)} Mo) [${r(R.sans)}]`);
    /* photos : animations en pause, jeu à l'arrêt */
    await fige(); await dormir(300);
    let s1, s2, a1, av, s3, b3;
    if (A.gl === '1') { /* piste d (page en ?plus=voilesgl) : AVEC = la vignette dans la passe de sortie, #speedFx caché ; SANS = uSfx 0, #speedFx DOM. La même image 3D est rendue à nouveau (composer.render, simulation arrêtée) */
      await ev("window.dbgGpu&&dbgGpu({});window.__v0=window.__v0!=null?__v0:__gpuObj.acesPass.uniforms.uSfx.value;1");
      const gl = on => ev(`(function(){var g=__gpuObj;g.acesPass.uniforms.uSfx.value=${on ? '__v0' : '0'};document.documentElement.classList.${on ? 'add' : 'remove'}('voilesGl');if(g.post())g.composer.render(0);return new Promise(function(r){setTimeout(function(){r(g.acesPass.uniforms.uSfx.value)},250)})})()`);
      console.log('  uSfx = ' + await ev('__v0'));
      await gl(false); s1 = png(await pg.screenshot()); await gl(false); s2 = png(await pg.screenshot());
      await gl(true); a1 = await pg.screenshot(); av = png(a1); await gl(false); b3 = await pg.screenshot(); s3 = png(b3); await gl(true); await ev('window.__v0=null;1');
    } else {
    s1 = png(await pg.screenshot()); await dormir(150); s2 = png(await pg.screenshot());
    await pose(true); await dormir(300); a1 = await pg.screenshot(); av = png(a1);
    await pose(false); await dormir(300); b3 = await pg.screenshot(); s3 = png(b3); }
    R.temoin = ecart(s1, s2); R.photo = ecart(s2, av); R.retour = ecart(av, s3);
    console.log(`  >> ${nom} PHOTOS · témoin sans/sans ${JSON.stringify(R.temoin)} · sans→avec ${JSON.stringify(R.photo)} · avec→sans ${JSON.stringify(R.retour)}`);
    if (A.photos === '1') { fs.writeFileSync(path.join(OUT, `vo-${FMT}${OMB ? '-ombres' : ''}${A.gl === '1' ? '-gl' : ''}-${nom}-avec.png`), a1); fs.writeFileSync(path.join(OUT, `vo-${FMT}${OMB ? '-ombres' : ''}${A.gl === '1' ? '-gl' : ''}-${nom}-sans.png`), b3); }
    await relance(); await pose(true);
    rapport.etats[nom] = { pleinAvec: R.pleinAvec, pleinSans: R.pleinSans, temoin: R.temoin, photo: R.photo, retour: R.retour, listeAvec: r(R.avec), listeSans: r(R.sans) };
  }
  try {
    await pg.goto(`http://127.0.0.1:${P_HTTP}/index.html?tel=1&colonne=0&garde=1&intro=ancien&attente=0&chute=0` + (A.q ? '&' + A.q : ''));
    let pret = false;
    for (let i = 0; i < 300; i++) { await dormir(500); if (await ev("!!window.__gameReady&&typeof dbgJouer==='function'").catch(() => false)) { pret = true; break; } }
    if (!pret) throw new Error('le jeu ne démarre pas · ' + err.slice(0, 3).join(' / '));
    await dormir(2500);
    for (let i = 0; i < 6; i++) { const la = await ev("(function(){var s=document.getElementById('splash');if(!s)return 0;try{s.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));s.dispatchEvent(new PointerEvent('pointerup',{bubbles:true}));s.click();}catch(e){}s.remove&&s.remove();return 1})()"); if (!la) break; await dormir(2000); }
    let enCourse = false;
    for (let essai = 0; essai < 3 && !enCourse; essai++) {
      try { await ev('dbgImmortel(true);dbgJouer()'); } catch (e) {}
      for (let i = 0; i < 50; i++) { await dormir(500); try { if (await ev("(function(){var s=dbgState();return !!(s.started&&s.running&&!s.gameOver)})()")) { enCourse = true; break; } } catch (e) {} }
    }
    if (!enCourse) throw new Error('la course ne part pas');
    rapport.lot = await ev("document.documentElement.classList.contains('voiles')");
    console.log(`WEBKIT · COURSE ${W}×${H} · lot posé : ${rapport.lot} · ${A.q || ''}`);
    await ev('dbgAuto(true,0,{vol:true,nit:1});1'); await dormir(3000);
    for (let i = 0; i < 40; i++) { await pas(1); await dormir(60); }
    if (A.garde) { /* mode d'enquête : la page reste en course, pilotée par HTTP (/ev = JS, /couches?nom=, /pas?n=, /shot?nom=, /fin) */
      await new Promise(fin => require('http').createServer(async (rq, rs) => { const u = new URL(rq.url, 'http://x'); let out = '';
        const corps = await new Promise(r => { let t = ''; rq.on('data', d => t += d); rq.on('end', () => r(t)); });
        try { if (u.pathname === '/ev') out = JSON.stringify(await ev(corps));
          else if (u.pathname === '/couches') out = JSON.stringify(await couches(u.searchParams.get('nom') || 'x'));
          else if (u.pathname === '/pas') { for (let i = 0; i < +(u.searchParams.get('n') || 1); i++) { await pas(1); await dormir(25); } out = 'ok'; }
          else if (u.pathname === '/shot') { await pg.screenshot({ path: u.searchParams.get('nom') }); out = 'ok'; }
          else if (u.pathname === '/fin') { rs.end('fin'); return fin(); } } catch (e) { out = 'ERREUR ' + e.message; }
        rs.end(out); }).listen(+A.garde, '127.0.0.1'));
      throw new Error('fin du mode garde');
    }
    await etat('1-course');
    await ev('dbgAuto(true,0,{vol:true,nit:0});1');
    for (let i = 0; i < 33; i++) { await dormir(100); await pas(1); }
    await etat('2-calme');
    await ev('dbgAuto(true,0,{vol:true,nit:1});1');
    for (let i = 0; i < 10; i++) { await dormir(80); await pas(1); }
    await ev("dbgHud('slam','BOOST');1"); await pas(2);
    await etat('3-annonce');
    await ev("dbgNitro(1);dbgHud('flow',300);dbgHud('chaine',3);1");
    for (let i = 0; i < 10; i++) { await dormir(80); await pas(1); }
    await etat('4-nitro-flow');
    await ev(PAUSE); for (let i = 0; i < 10; i++) { await dormir(100); await pas(1); }
    await etat('5-pause');
    await ev(PAUSE); for (let i = 0; i < 40; i++) { await dormir(100); await pas(1); }
    await ev('dbgImmortel(false);dbgBoom();1');
    for (let i = 0; i < (LIBRE ? 70 : 30); i++) { await dormir(120); await pas(1); }
    await etat('6-mort');
  } catch (e) { console.error('ÉCHEC : ' + e.message); rapport.echec = e.message; }
  finally {
    rapport.erreurs = err;
    fs.writeFileSync(path.join(OUT, `voiles-${FMT}${OMB ? '-ombres' : ''}${A.gl === '1' ? '-gl' : ''}.json`), JSON.stringify(rapport, null, 1));
    if (err.length) console.log('erreurs de la page : ' + err.slice(0, 5).join(' / '));
    await b.close().catch(() => {}); srv.close();
  }
  process.exit(rapport.echec ? 1 : 0);
})();
