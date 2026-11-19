// LE BANC DU LOT COULEURS (2026-11-19, finition des maps : « des maps ternes la nuit ou quand il pleut, des fois trop rouge, des fois trop éblouissant »).
// Repris du banc de Jade (banc-finition-jade/photos.cjs) : UN Chrome sans fenêtre et muet, format iPhone (844×390 couché ou 390×844 debout, DPR 3, tactile,
// ?tel=1), la boucle menée à la main (rAF neutralisé, dbgStep à 33 ms) : des images figées, comparables d'une version à l'autre au même pas de la même piste.
//   node outils/banc-finition-couleurs/photos.cjs --out <dossier> --prof <profil Chrome jetable> --pas 120 [--essais <essais.js>] [--avant <VP> --apres <VP>]
//        [--eg <graine des essais>] <tag>@<port>@<carte>@<meteo>@<graine>[@<q>] …      (tag finissant par P : la partie lancée DEBOUT)
// Par scénario : <tag>-<carte>-<meteo>-g<graine>[-<q>]-couche.png (ou -debout.png) et une ligne MESURE : renderer.info d'UNE image rendue à la main (appels,
// triangles, programmes, géométries, textures), l'ambiance courante (BIO.name et ses réglages d'étalonnage), pannes et exceptions.
// --essais : un module { '<regex du nom d'ambiance>': [[ '<étiquette>', '<expression JS de B (l'ambiance) → {eq:{retouche multiplicative}, abs:{valeurs}}>' ], …] } :
// après la photo de base, chaque essai est posé à chaud (dbgEquilibre / dbgAmb), photographié (-e<étiquette>-couche.png), puis l'ambiance est remise.
// Le profil Chrome (--prof) est effacé à la fin. ⚠ Sous le verrou commun seulement (passage.sh).
const fs = require('fs'), path = require('path');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir } = require('../banc-trainees/cdp.cjs');
const A = { out: 'prises', pas: '120', pa: '8650', pb: '8651', cdp: '9650' }, SC = [];
for (let i = 2; i < process.argv.length; i++) { const x = process.argv[i]; if (x.startsWith('--')) A[x.slice(2)] = process.argv[++i]; else SC.push(x); }
const OUT = path.resolve(A.out); fs.mkdirSync(OUT, { recursive: true });
const PROF = path.resolve(A.prof || path.join(OUT, '.profil')); fs.mkdirSync(PROF, { recursive: true });
const ESS = A.essais ? require(path.resolve(A.essais)) : {};
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const SAVE = { v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, bank: 48500, owned: [0, 1, 2, 3], ex: { runs: 12 }, plq: { m: 'fr', x: 'CC-161-RZ', ok: 1 } };
const MASQUE = "(function(){const c=dbgScene().rdr.domElement;let e=c;while(e&&e!==document.body){const p=e.parentElement;if(!p)break;for(const f of p.children)if(f!==e&&f.tagName!=='SCRIPT'&&f.tagName!=='STYLE'){f.style.setProperty('visibility','hidden','important');}e=p;}return 1;})()";
const MESURE = "(function(){var d=dbgScene(),r=d.rdr,I=r.info,o={};try{I.autoReset=false;I.reset();r.render(d.scene,d.cam);o={calls:I.render.calls,tris:I.render.triangles,prog:I.programs?I.programs.length:null,geo:I.memory.geometries,tex:I.memory.textures};}catch(e){o={err:String(e)};}finally{I.autoReset=true;}return JSON.stringify(o);})()";
const AMB = "(function(){var n=dbgTeinte().ciel,B=dbgAmb(n)||{},o={n:n};['expo','sat','con','sh','vigK','bloomS','bloomT','sunI','hemiI','fillI','sunC','fog','rtK','daExpo','daCon'].forEach(function(k){if(B[k]!=null)o[k]=Array.isArray(B[k])?B[k].map(function(x){return +(+x).toFixed(3)}):+(+B[k]).toFixed(3);});return JSON.stringify(o);})()";
const t0 = Date.now();
(async () => {
  const P = [+A.pa, +A.pb, +A.cdp]; for (const p of P) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  const srvs = [];
  if (A.avant) srvs.push(await serveur(path.resolve(A.avant), +A.pa));
  if (A.apres) srvs.push(await serveur(path.resolve(A.apres), +A.pb));
  const { ch, pg } = await lanceChrome(+A.cdp, PROF, 844, 390);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  let fini = false;
  const fin = () => { if (fini) return; fini = true; try { c.close(); } catch (e) {} for (const s of srvs) try { s.close(); } catch (e) {} tueChrome(ch); try { fs.rmSync(PROF, { recursive: true, force: true }); } catch (e) {} };
  process.on('exit', fin); process.on('SIGTERM', () => process.exit(143)); process.on('SIGINT', () => process.exit(130));
  setTimeout(() => { console.log('CHIEN DE GARDE 9 min 30 : arrêt'); process.exit(3); }, 570000).unref();
  const exc = [];
  c.ws.addEventListener('message', e => { try { const m = JSON.parse(e.data); if (m.method === 'Runtime.exceptionThrown') exc.push(JSON.stringify(m.params.exceptionDetails).slice(0, 300)); } catch (x) {} });
  const taille = (w, h) => c.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 3, mobile: true, screenWidth: w, screenHeight: h });
  const shot = async nom => { const r = await c.send('Page.captureScreenshot', { format: 'png' }, 30000); fs.writeFileSync(path.join(OUT, nom), Buffer.from(r.data, 'base64')); };
  const pas = async n => { for (let k = 0; k < n; k += 30) await c.ev(`(async function(){for(var i=0;i<${Math.min(30, n - k)};i++){dbgStep(1,33);await new Promise(function(r){setTimeout(r,36)});}return 1})()`, 30000); };
  try {
    await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Network.enable');
    await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
    await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' });
    await c.send('Emulation.setEmulatedMedia', { features: [{ name: 'hover', value: 'none' }, { name: 'pointer', value: 'coarse' }] });
    await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{localStorage.clear();localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAVE)) + ')}catch(e){}' });
    for (const sc of SC) {
      if (Date.now() - t0 > 510000) { console.log('8 min 30 : arrêt (le verrou doit être rendu)'); break; }
      const [tag0, port, carte, meteo, graine, q0] = sc.split('@'), q = q0 && q0.replace(/\+/g, '&'); /* « + » sépare deux paramètres d'URL (un « & » casserait la ligne de commande) */
      const DEB = /P$/.test(tag0), tag = tag0.replace(/P$/, '');
      const nom = `${tag}-${carte}-${meteo}-g${graine}` + (q ? '-' + q.replace(/[^a-z0-9]+/gi, '') : '');
      try {
        await taille(DEB ? 390 : 844, DEB ? 844 : 390); exc.length = 0;
        const url = `http://127.0.0.1:${port}/index.html?colonne=0&tel=1&garde=1&intro=ancien&attente=0&prebati=0&carte=${carte}&meteo=${meteo}&pistegraine=${graine}` + (q ? '&' + q : '');
        await c.send('Page.navigate', { url });
        for (let i = 0; i < 120; i++) { await dormir(500); try { if (await c.ev("!!window.__gameReady&&typeof dbgJouer==='function'", 8000)) break; } catch (e) {} }
        await dormir(1500);
        await c.ev("(function(){var s=document.getElementById('splash');if(!s)return 0;try{s.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));s.dispatchEvent(new PointerEvent('pointerup',{bubbles:true}));s.click();}catch(e){}return 1})()");
        await dormir(1500);
        let ok = false;
        for (let i = 0; i < 90 && !ok; i++) { if (i % 16 === 0) { try { await c.ev('dbgJouer()'); } catch (e) {} } await dormir(500); try { ok = await c.ev("(function(){var s=dbgState();return !!(s.started&&s.running&&!s.gameOver)})()"); } catch (e) {} }
        if (!ok) throw new Error('course pas lancée');
        await c.ev('window.requestAnimationFrame=function(){return 0;};dbgAuto(1,0,{nit:0});1');
        await dormir(300); await c.ev(MASQUE);
        await pas(+A.pas);
        const suf = DEB ? '-debout.png' : '-couche.png';
        await shot(nom + suf);
        const m = await c.ev(MESURE), amb = await c.ev(AMB);
        const pan = await c.ev("(function(){try{return dbgErreurs().filter(function(e){return ['gel','serpent','son'].indexOf(e.g)<0}).map(function(e){return e.k})}catch(e){return String(e)}})()");
        console.log('MESURE', nom + (DEB ? '-debout' : ''), m, 'amb', amb, 'pannes', JSON.stringify(pan), 'exc', JSON.stringify(exc.slice(0, 3)), Math.round((Date.now() - t0) / 1000) + 's');
        const n = JSON.parse(amb).n;
        for (const re in ESS) {
          if (DEB || (A.eg && graine !== A.eg)) break; /* --eg <graine> : les essais sur cette graine couchée seulement */
          if (!new RegExp(re).test(n)) continue;
          for (const [lab, ex] of ESS[re]) {
            const r = await c.ev(`(function(){var n=${JSON.stringify(n)},B=dbgAmb(n),S=JSON.stringify(B);window.__essS=S;var R=(${ex});if(R.eq)dbgEquilibre(n,R.eq);if(R.abs)dbgAmb(n,R.abs);return JSON.stringify(R);})()`);
            await pas(1); await shot(`${nom}-e${lab}${suf}`);
            await c.ev(`(function(){dbgAmb(${JSON.stringify(n)},JSON.parse(window.__essS));return 1})()`);
            console.log('ESSAI', nom, lab, r);
          }
        }
      } catch (e) { console.log('ECHEC', nom, String(e).slice(0, 300)); }
    }
  } finally { fin(); }
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
