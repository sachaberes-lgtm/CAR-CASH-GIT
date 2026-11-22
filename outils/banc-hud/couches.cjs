// LES COUCHES DU HUD (2026-11-17, lot qualité « hudcouches », piste A4 de passation/qualite/CHALEUR-IDEES.md).
// Le HUD est du DOM posé sur la toile : chaque couche composée à part est mélangée par le système à CHAQUE image, hors de nos chronos.
// Ce banc fait une course en édition téléphone (?tel=1, sans son, Chrome muet) et, à chaque état (course nitro, HUD calme, annonce, nitro plein + flow,
// pause, écran de mort), relève l'arbre des couches de Chrome par CDP (LayerTree) : pour chaque couche, l'élément, la RAISON de composition, la taille, le
// nombre de peintures. Avec --ab 1, chaque état est relevé deux fois dans la MÊME page, avec et sans html.hudCouches (le lot), et photographié deux fois,
// animations CSS figées (CDP Animation.setPlaybackRate 0, boucle du jeu à l'arrêt : dbgStep) : les photos doivent être identiques au pixel.
// Film (--film 1) : l'annonce (#slam9) et la frappe de l'argent, image par image (0 → 900 ms, pas de 50 ms), avec et sans le lot, comparées au pixel.
//   node outils/banc-hud/couches.cjs [--out dossier] [--w 390 --h 844] [--q sans=hudcouches] [--ab 1] [--film 1] [--http 9941 --cdp 9942]
// Sortie : <out>/couches-<format>.json (tout) + résumé à l'écran. ⚠ Chrome n'est pas WebKit : les raisons de composition de l'iPhone diffèrent (voir la passation).
const fs = require('fs'), path = require('path'), zlib = require('zlib');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir, tmp } = require('../banc-trainees/cdp.cjs');

const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.resolve(A.jeu || path.join(__dirname, '..', '..', 'VERSION PRINCIPALE'));
const OUT = path.resolve(A.out || path.join(__dirname, 'prises'));
const P_HTTP = +(A.http || 9941), P_CDP = +(A.cdp || 9942), W = +(A.w || 390), H = +(A.h || 844), AB = A.ab === '1', FILM = A.film === '1';
const FMT = W > H ? 'couche' : 'debout';
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const SAVE = { v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, bank: 48500, aura: 1200, auraMax: 3000, owned: [0, 1, 2, 3], ex: { runs: 12 }, plq: { m: 'fr', x: 'CC-161-RZ', ok: 1 } };
const PAUSE = `(window.__panBascule?window.__panBascule():document.getElementById('tGear').click())`;

/* ---- comparaison de deux PNG (sans dépendance : décodage RGBA 8 bits, filtres PNG) ---- */
function png(buf) {
  let p = 8, w = 0, h = 0, ct = 0; const id = [];
  while (p < buf.length) { const n = buf.readUInt32BE(p), t = buf.toString('ascii', p + 4, p + 8), d = buf.subarray(p + 8, p + 8 + n);
    if (t === 'IHDR') { w = d.readUInt32BE(0); h = d.readUInt32BE(4); ct = d[9]; } else if (t === 'IDAT') id.push(d); p += 12 + n; }
  const bpp = ct === 6 ? 4 : 3, raw = zlib.inflateSync(Buffer.concat(id)), st = w * bpp, out = Buffer.alloc(w * h * 4); let prev = Buffer.alloc(st);
  for (let y = 0; y < h; y++) { const f = raw[y * (st + 1)], l = Buffer.from(raw.subarray(y * (st + 1) + 1, (y + 1) * (st + 1)));
    for (let x = 0; x < st; x++) { const a = x >= bpp ? l[x - bpp] : 0, b = prev[x], c = x >= bpp ? prev[x - bpp] : 0;
      if (f === 1) l[x] = (l[x] + a) & 255; else if (f === 2) l[x] = (l[x] + b) & 255; else if (f === 3) l[x] = (l[x] + ((a + b) >> 1)) & 255;
      else if (f === 4) { const pa = Math.abs(b - c), pb = Math.abs(a - c), pc = Math.abs(a + b - 2 * c); l[x] = (l[x] + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c)) & 255; } }
    for (let x = 0; x < w; x++) for (let k = 0; k < 4; k++) out[(y * w + x) * 4 + k] = k < bpp ? l[x * bpp + k] : 255; prev = l; }
  return { w, h, d: out };
}
function diff(b1, b2) { const a = png(b1), b = png(b2); if (a.w !== b.w || a.h !== b.h) return { px: -1, max: 255 };
  let n = 0, m = 0; for (let i = 0; i < a.d.length; i += 4) { let e = 0; for (let k = 0; k < 3; k++) e = Math.max(e, Math.abs(a.d[i + k] - b.d[i + k])); if (e) { n++; if (e > m) m = e; } }
  return { px: n, max: m }; }

(async () => {
  for (const p of [P_HTTP, P_CDP]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  fs.mkdirSync(OUT, { recursive: true });
  const srv = await serveur(JEU, P_HTTP), prof = A.prof ? path.resolve(A.prof) : tmp();
  const erreurs = [], rapport = { w: W, h: H, q: A.q || '', etats: {}, photos: {}, film: {} };
  const { ch, pg } = await lanceChrome(P_CDP, prof, W, H);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  let attente = null;
  c.ws.addEventListener('message', e => { try { const m = JSON.parse(e.data);
    if (m.method === 'Runtime.exceptionThrown') erreurs.push((m.params.exceptionDetails.exception && m.params.exceptionDetails.exception.description || m.params.exceptionDetails.text || '?').slice(0, 300));
    if (m.method === 'LayerTree.layerTreeDidChange' && attente && m.params.layers && m.params.layers.length) { const f = attente; attente = null; f(m.params.layers); } } catch (x) {} });
  const pas = n => c.ev('dbgStep(' + (n || 1) + ',33);1', 60000);
  const cliche = async () => Buffer.from((await c.send('Page.captureScreenshot', { format: 'png' }, 30000)).data, 'base64');
  const lot = on => c.ev(`document.documentElement.classList.toggle('hudCouches',${on});window.__hcTick&&window.__hcTick(1);1`);

  /* l'arbre des couches : on attend un layerTreeDidChange (le compositeur le renvoie à chaque changement ; on force une image par un pas du jeu) */
  async function couches(nom) {
    const p = new Promise(r => { attente = r; });
    await c.send('LayerTree.enable');
    for (let i = 0; i < 20 && attente; i++) { await pas(1); await dormir(150); }
    const L = await Promise.race([p, dormir(8000).then(() => null)]);
    if (!L) { await c.send('LayerTree.disable'); return { nom, n: -1 }; }
    const liste = [];
    for (const l of L) {
      let r = []; try { r = (await c.send('LayerTree.compositingReasons', { layerId: l.layerId })).compositingReasonIds || []; } catch (e) { r = ['?']; }
      let el = '(sans nœud)';
      if (l.backendNodeId) { try { const d = (await c.send('DOM.describeNode', { backendNodeId: l.backendNodeId })).node; const at = {};
        for (let i = 0; i < (d.attributes || []).length; i += 2) at[d.attributes[i]] = d.attributes[i + 1];
        el = (d.pseudoType ? '::' + d.pseudoType + ' de ' : '') + d.nodeName.toLowerCase() + (at.id ? '#' + at.id : '') + (at.class ? '.' + at.class.trim().split(/\s+/).slice(0, 3).join('.') : '');
        if (!at.id && !d.pseudoType) { try { const o = await c.send('DOM.resolveNode', { backendNodeId: l.backendNodeId });
          const pth = await c.send('Runtime.callFunctionOn', { objectId: o.object.objectId, returnByValue: true,
            functionDeclaration: 'function(){var s=[],e=this;while(e&&e.nodeType===1&&s.length<4){s.unshift(e.id?"#"+e.id:e.nodeName.toLowerCase()+(e.className&&typeof e.className==="string"?"."+e.className.trim().split(/\\s+/)[0]:""));if(e.id)break;e=e.parentElement;}return s.join(">")}' });
          el = pth.result.value || el; } catch (e) {} }
      } catch (e) { el = '(nœud ' + l.backendNodeId + ')'; } }
      liste.push({ el, raisons: r, w: Math.round(l.width), h: Math.round(l.height), dessine: !!l.drawsContent, invisible: !!l.invisible, peint: l.paintCount | 0 });
    }
    await c.send('LayerTree.disable');
    const dessine = liste.filter(x => x.dessine && !x.invisible);
    return { nom, n: liste.length, dessinees: dessine.length, couches: liste };
  }
  const resume = (k, r) => { console.log(`  ${k} : ${r.n} couches dont ${r.dessinees} dessinées`);
    for (const x of r.couches) if (x.dessine && !x.invisible) console.log(`      ${x.w}×${x.h}  ${x.el}  [${x.raisons.join(',')}]`); };

  async function etat(nom) {
    await pas(1);
    const R = {}; R.lot = await couches(nom); resume(nom + (AB ? ' · AVEC le lot' : ''), R.lot);
    if (AB) {
      /* photos au pixel : animations figées, jeu à l'arrêt ; avec puis sans le lot dans la même page */
      /* l'écran de mort garde des toiles qui bougent hors de la boucle (la vignette du moteur en 3D, le décor) : on les masque pour les DEUX photos (seul le DOM est comparé) */
      const MASQUE = nom === '6-mort' || A.masque === '1';
      if (MASQUE) await c.ev("(function(){var s=document.createElement('style');s.id='hcMasque';s.textContent='canvas{visibility:hidden!important}';document.head.appendChild(s);return 1})()");
      await c.send('Animation.setPlaybackRate', { playbackRate: 0 }); await dormir(250);
      const a1 = await cliche(); await lot(false); await dormir(300); const b1 = await cliche();
      R.sans = await couches(nom); resume(nom + ' · SANS le lot', R.sans);
      await c.send('Animation.setPlaybackRate', { playbackRate: 0 }); await dormir(200);
      const b2 = await cliche(); await lot(true); await dormir(300); const a2 = await cliche();
      await c.send('Animation.setPlaybackRate', { playbackRate: 1 });
      if (MASQUE) await c.ev("(function(){var s=document.getElementById('hcMasque');if(s)s.remove();return 1})()");
      const d1 = diff(a1, b1), d2 = diff(b2, a2);
      rapport.photos[nom] = { d1, d2 };
      fs.writeFileSync(path.join(OUT, `hc-${FMT}-${nom}-avec.png`), a1); fs.writeFileSync(path.join(OUT, `hc-${FMT}-${nom}-sans.png`), b1);
      console.log(`    photos avec/sans : ${d1.px} px différents (écart max ${d1.max}) · retour : ${d2.px} px (${d2.max})`);
    } else { fs.writeFileSync(path.join(OUT, `hc-${FMT}-${nom}.png`), await cliche()); }
    rapport.etats[nom] = R;
  }

  /* le film d'une animation, à temps imposé (playbackRate 0 + currentTime des animations visées), avec et sans le lot */
  async function film(nom, lance, cible) {
    await c.ev(lance); await pas(1);
    await c.send('Animation.setPlaybackRate', { playbackRate: 0 }); await dormir(150);
    const res = [];
    for (let t = 0; t <= 900; t += 50) {
      const pose = `(function(){var n=0;document.getAnimations().forEach(function(a){var e=a.effect&&a.effect.target;if(e&&e.closest&&e.closest(${JSON.stringify(cible)})){a.currentTime=${t};n++;}});return n})()`;
      const nA = await c.ev(pose); await dormir(120); const a = await cliche();
      await lot(false); await c.ev(pose); await dormir(200); const b = await cliche(); await lot(true);
      const d = diff(a, b); res.push({ t, anims: nA, px: d.px, max: d.max });
      if (t % 150 === 0) fs.writeFileSync(path.join(OUT, `hc-${FMT}-film-${nom}-${String(t).padStart(3, '0')}.png`), a);
    }
    await c.send('Animation.setPlaybackRate', { playbackRate: 1 });
    rapport.film[nom] = res;
    console.log(`  film ${nom} : ` + res.map(r => r.t + 'ms:' + r.px + (r.anims ? '' : '(0 anim)')).join(' '));
  }

  try {
    await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Network.enable'); await c.send('DOM.enable'); await c.send('Animation.enable');
    await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
    await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 2, mobile: true, screenWidth: W, screenHeight: H });
    await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' });
    await c.send('Emulation.setEmulatedMedia', { features: [{ name: 'hover', value: 'none' }, { name: 'pointer', value: 'coarse' }] });
    await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAVE)) + ')}catch(e){}' });
    await c.send('Page.navigate', { url: `http://127.0.0.1:${P_HTTP}/index.html?colonne=0&tel=1&garde=1&intro=ancien&attente=0&chute=0` + (A.q ? '&' + A.q : '') });
    let pret = false;
    for (let i = 0; i < 300; i++) { await dormir(500); try { if (await c.ev("!!window.__gameReady&&typeof dbgJouer==='function'", 8000)) { pret = true; break; } } catch (e) {} }
    if (!pret) throw new Error('le jeu ne démarre pas · ' + erreurs.slice(0, 3).join(' / '));
    await dormir(2500);
    await c.ev("(function(){var s=document.getElementById('splash');if(!s)return 0;try{s.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));s.dispatchEvent(new PointerEvent('pointerup',{bubbles:true}));s.click();}catch(e){}s.remove&&s.remove();return 1})()");
    await dormir(2500);
    let enCourse = false;
    for (let essai = 0; essai < 3 && !enCourse; essai++) {
      try { await c.ev('dbgImmortel(true);dbgJouer()'); } catch (e) {}
      for (let i = 0; i < 50; i++) { await dormir(500); try { if (await c.ev("(function(){var s=dbgState();return !!(s.started&&s.running&&!s.gameOver)})()")) { enCourse = true; break; } } catch (e) {} }
    }
    if (!enCourse) throw new Error('la course ne part pas');
    rapport.lot = await c.ev("document.documentElement.classList.contains('hudCouches')");
    console.log(`COURSE ${W}×${H} · lot posé : ${rapport.lot} · ${A.q || ''}`);
    await c.ev('dbgAuto(true,0,{vol:true,nit:1});1'); await dormir(3000);
    for (let i = 0; i < 40; i++) { await pas(1); await dormir(60); }   /* le HUD entre (l'argent, la flamme), la boucle passe en pas à pas */
    await etat('1-course');
    await c.ev('dbgAuto(true,0,{vol:true,nit:0});1');
    for (let i = 0; i < 46; i++) { await dormir(100); await pas(1); } /* (2026-11-22) le calme tombe à 3 s (HUD_CALME_MS), plus 0,9 s */
    for (let i = 0; i < 8; i++) { await dormir(100); await pas(1); }   /* fondu du calme (0,45 s) puis le HUD endormi (0,6 s) */
    await etat('2-calme');
    await c.ev('dbgAuto(true,0,{vol:true,nit:1});1');
    for (let i = 0; i < 10; i++) { await dormir(80); await pas(1); }
    await c.ev("dbgHud('slam','BOOST');1"); await pas(2);
    await etat('3-annonce');
    await c.ev("dbgNitro(1);dbgHud('flow',300);dbgHud('chaine',3);1");
    for (let i = 0; i < 10; i++) { await dormir(80); await pas(1); }
    await etat('4-nitro-flow');
    await c.ev(PAUSE); for (let i = 0; i < 10; i++) { await dormir(100); await pas(1); }
    await etat('5-pause');
    await c.ev(PAUSE); for (let i = 0; i < 40; i++) { await dormir(100); await pas(1); }
    if (FILM) {
      await film('annonce', "dbgHud('slam','BOOST');1", '#slam9');
      await film('argent', "dbgCash(dbgCash()+137);1", '#cashHud');
    }
    await c.ev('dbgImmortel(false);dbgBoom();1');
    for (let i = 0; i < 30; i++) { await dormir(120); await pas(1); }
    await etat('6-mort');
  } catch (e) { console.error('ÉCHEC : ' + e.message); rapport.echec = e.message; }
  finally {
    rapport.erreurs = erreurs;
    fs.writeFileSync(path.join(OUT, `couches-${FMT}${A.q ? '-' + A.q.replace(/[^a-z0-9]+/gi, '_') : ''}.json`), JSON.stringify(rapport, null, 1));
    if (erreurs.length) console.log('erreurs de la page : ' + erreurs.slice(0, 5).join(' / '));
    c.close(); tueChrome(ch); srv.close();
  }
  process.exit(rapport.echec ? 1 : 0);
})();
