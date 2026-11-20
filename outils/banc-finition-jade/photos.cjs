// LE BANC DE LA FINITION DE JADE (2026-11-18, finition des maps : « le plus jolies possible tout en restant aussi optimisées »).
// UN Chrome sans fenêtre et muet, au format iPhone (844×390 couché, puis 390×844 debout, DPR 3, tactile, ?tel=1), la boucle menée à la main
// (rAF neutralisé, dbgStep à 33 ms) : des images figées, comparables d'une version à l'autre au même pas de la même piste.
//   node outils/banc-finition-jade/photos.cjs --out <dossier> --pas 150 [--nit 1] [--astre 1] <tag>@<port>@<meteo>@<graine>[@<q>] …
//   <port> : le serveur du jeu (lancé par ce script : --avant <dossier VP> sur --pa, --apres <dossier VP> sur --pb).
// Par scénario : <tag>-<meteo>-g<graine>-couche.png et -debout.png, et une ligne « mesure » (renderer.info d'UNE image rendue à la main,
// juste après le pas : appels, triangles, programmes, géométries, textures) + l'empreinte de l'état (dbgState) + pannes/exceptions.
// ⚠ Sous le verrou commun seulement (passage.sh).
const fs = require('fs'), path = require('path');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir, tmp } = require('../banc-trainees/cdp.cjs');
const A = { nit: '0', out: 'prises', pas: '150', pa: '8630', pb: '8631', cdp: '9630' }, SC = [];
for (let i = 2; i < process.argv.length; i++) { const x = process.argv[i]; if (x.startsWith('--')) A[x.slice(2)] = process.argv[++i]; else SC.push(x); }
const OUT = path.resolve(A.out); fs.mkdirSync(OUT, { recursive: true });
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const SAVE = { v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, bank: 48500, owned: [0, 1, 2, 3], ex: { runs: 12 }, plq: { m: 'fr', x: 'CC-161-RZ', ok: 1 } };
const MASQUE = "(function(){const c=dbgScene().rdr.domElement;let e=c;while(e&&e!==document.body){const p=e.parentElement;if(!p)break;for(const f of p.children)if(f!==e&&f.tagName!=='SCRIPT'&&f.tagName!=='STYLE'){f.style.setProperty('visibility','hidden','important');}e=p;}return 1;})()";
const MESURE = "(function(){var d=dbgScene(),r=d.rdr,I=r.info,o={};try{I.autoReset=false;I.reset();r.render(d.scene,d.cam);o={calls:I.render.calls,tris:I.render.triangles,prog:I.programs?I.programs.length:null,geo:I.memory.geometries,tex:I.memory.textures};}catch(e){o={err:String(e)};}finally{I.autoReset=true;}return JSON.stringify(o);})()";
const t0 = Date.now();
(async () => {
  const P = [+A.pa, +A.pb, +A.cdp]; for (const p of P) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  const srvs = [];
  if (A.avant) srvs.push(await serveur(path.resolve(A.avant), +A.pa));
  if (A.apres) srvs.push(await serveur(path.resolve(A.apres), +A.pb));
  const { ch, pg } = await lanceChrome(+A.cdp, tmp(), 844, 390);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  const fin = () => { try { c.close(); } catch (e) {} for (const s of srvs) try { s.close(); } catch (e) {} tueChrome(ch); };
  process.on('exit', fin); process.on('SIGTERM', () => process.exit(143)); process.on('SIGINT', () => process.exit(130)); /* tué par passage.sh : fermer SON Chrome quand même (vu au banc : un Chrome orphelin gardait le port) */
  setTimeout(() => { console.log('CHIEN DE GARDE 8 min 20 : arrêt'); process.exit(3); }, 500000).unref();
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
      if (Date.now() - t0 > 450000) { console.log('9 min : arrêt (le verrou doit être rendu)'); break; }
      const [tag0, port, meteo, graine, q] = sc.split('@');
      const DEB = /P$/.test(tag0), tag = tag0.replace(/P$/, ''); /* « avP », « apP » : la partie lancée DEBOUT (390×844) dès le chargement : le jeu ne se recadre pas quand on tourne la toile en boucle figée */
      const nom = `${tag}-${meteo}-g${graine}`;
      try {
        await taille(DEB ? 390 : 844, DEB ? 844 : 390); exc.length = 0;
        const url = `http://127.0.0.1:${port}/index.html?colonne=0&tel=1&garde=1&intro=ancien&attente=0&prebati=0&carte=jade&meteo=${meteo}&pistegraine=${graine}` + (q ? '&' + q : '');
        await c.send('Page.navigate', { url });
        for (let i = 0; i < 120; i++) { await dormir(500); try { if (await c.ev("!!window.__gameReady&&typeof dbgJouer==='function'", 8000)) break; } catch (e) {} }
        await dormir(1500);
        await c.ev("(function(){var s=document.getElementById('splash');if(!s)return 0;try{s.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));s.dispatchEvent(new PointerEvent('pointerup',{bubbles:true}));s.click();}catch(e){}return 1})()");
        await dormir(1500);
        let ok = false;
        for (let i = 0; i < 90 && !ok; i++) { if (i % 16 === 0) { try { await c.ev('dbgJouer()'); } catch (e) {} } await dormir(500); try { ok = await c.ev("(function(){var s=dbgState();return !!(s.started&&s.running&&!s.gameOver)})()"); } catch (e) {} }
        if (!ok) throw new Error('course pas lancée');
        await c.ev(`window.requestAnimationFrame=function(){return 0;};dbgAuto(1,0,{nit:${+A.nit||0}});1`); /* (contrôle, tour 1) sans NITRO par défaut : son flou radial cachait le décor ; --nit 1 pour le reprendre */
        await dormir(300); await c.ev(MASQUE);
        await pas(+A.pas);
        if (DEB) { await shot(nom + '-debout.png'); const m = await c.ev(MESURE); console.log('MESURE', nom + '-debout', m, Math.round((Date.now() - t0) / 1000) + 's'); continue; }
        await shot(nom + '-couche.png'); /* AVANT la mesure : l'image de la boucle (composer : ACES, bloom), pas le rendu brut de MESURE */
        const m = await c.ev(MESURE);
        const et = await c.ev("(function(){var s=dbgState();return JSON.stringify({go:s.gameOver,d:Math.round(s.dist||s.d||0),z:s.z!=null?+(+s.z).toFixed(2):null,x:s.x!=null?+(+s.x).toFixed(2):null,vH:s.vH})})()");
        if (A.debout) { await taille(390, 844); await dormir(500); await pas(2); await dormir(300); await shot(nom + '-debout.png'); } /* ⚠ (vu au banc) la toile ne suit pas : moitié noire — préférer « avP / apP » */
        if (A.astre) { /* l'ASTRE : la caméra tournée vers le soleil / la lune de Jade (la direction du disque, scene-ciel.js : sv), une image rendue à la main */
          await taille(844, 390); await dormir(400); await pas(1);
          try { await c.ev("(function(){try{var p=dbgGpu({n:1,k:1});return p&&p.then?p.then(function(){return 1},function(){return 1}):1}catch(e){return 0}})()", 30000); } catch (e) {}
          const ok2 = await c.ev("(function(){var d=dbgScene(),u=null,G=window.__gpuObj;d.scene.traverse(function(o){var m=o.material;if(!u&&m&&m.uniforms&&m.uniforms.uSunDir)u=m.uniforms.uSunDir.value;});if(!u||!G)return 0;var v=new u.constructor(u.x*.966,0,u.z*.966);var L=Math.hypot(v.x,v.z)||1;v.set(v.x/L*.966,.259,v.z/L*.966).normalize();var p=d.cam.position;d.cam.lookAt(p.x+v.x*10,p.y+v.y*10,p.z+v.z*10);d.cam.updateMatrixWorld();if(G.post())G.composer.render();else d.rdr.render(d.scene,d.cam);return 1})()");
          if (ok2) await shot(nom + '-astre.png');
        }
        const pan = await c.ev("(function(){try{return dbgErreurs().filter(function(e){return ['gel','serpent','son'].indexOf(e.g)<0}).map(function(e){return e.k})}catch(e){return String(e)}})()");
        console.log('MESURE', nom, m, 'etat', et, 'pannes', JSON.stringify(pan), 'exc', JSON.stringify(exc.slice(0, 3)), Math.round((Date.now() - t0) / 1000) + 's');
      } catch (e) { console.log('ECHEC', nom, String(e).slice(0, 300)); }
    }
  } finally { fin(); }
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
