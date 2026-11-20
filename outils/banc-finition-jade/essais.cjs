// LES ESSAIS DE NOMBRES DE JADE EN UN PASSAGE (2026-11-20, finition des maps, correction 3 : « mesurer 2 ou 3 jeux de nombres en un seul passage »).
// Comme photos.cjs (Chrome sans fenêtre et muet, format iPhone, ?tel=1, DPR 3, boucle menée à la main), mais SANS recharger la page par essai :
// après les <pas> images, la prise de base, puis chaque jeu de nombres est posé À CHAUD par dbgLumiere(<ambiance>,{…}) (rendu/lumiere-design.js :
// les champs autres que expo/sat/con/… sont POSÉS tels quels, puis bioLerp + bioApply), deux pas de 1 ms, une prise.
//   node essais.cjs --out <dossier> --pas 120 --essais <essais.json> <tag>@<port>@<meteo>@<graine>[@<q>] …
//   tag « av » (avant) : prise « av », puis le lot pris à chaud par-dessus (« lv ») = la PREUVE que le chaud vaut le code (lv ≈ ap) ;
//   tag « ap » (lot) : prise « ap », puis un essai par clé k1, k2, … de essais.json[meteo] ; suffixe P = partie lancée debout (390×844) ;
//   q contient « astre » : en plus, chaque prise vers l'astre (soleil, lune ; dbgGpu d'abord, sinon __gpuObj manque et rien ne tourne). Ligne MESURE = renderer.info, ligne BIO = l'ambiance courante (dbgEtatLum).
// ⚠ Sous le verrou commun seulement (passage-essais.sh).
const fs = require('fs'), path = require('path');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir, tmp } = require('../banc-trainees/cdp.cjs');
const A = { out: 'prises', pas: '120', pa: '8630', pb: '8631', cdp: '9630', limite: '540' }, SC = [];
for (let i = 2; i < process.argv.length; i++) { const x = process.argv[i]; if (x.startsWith('--')) A[x.slice(2)] = process.argv[++i]; else SC.push(x); }
const OUT = path.resolve(A.out); fs.mkdirSync(OUT, { recursive: true });
const ESS = JSON.parse(fs.readFileSync(A.essais, 'utf8'));
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const SAVE = { v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, bank: 48500, owned: [0, 1, 2, 3], ex: { runs: 12 }, plq: { m: 'fr', x: 'CC-161-RZ', ok: 1 } };
const MASQUE = "(function(){const c=dbgScene().rdr.domElement;let e=c;while(e&&e!==document.body){const p=e.parentElement;if(!p)break;for(const f of p.children)if(f!==e&&f.tagName!=='SCRIPT'&&f.tagName!=='STYLE'){f.style.setProperty('visibility','hidden','important');}e=p;}return 1;})()";
const MESURE = "(function(){var d=dbgScene(),r=d.rdr,I=r.info,o={};try{I.autoReset=false;I.reset();r.render(d.scene,d.cam);o={calls:I.render.calls,tris:I.render.triangles,prog:I.programs?I.programs.length:null,geo:I.memory.geometries,tex:I.memory.textures};}catch(e){o={err:String(e)};}finally{I.autoReset=true;}return JSON.stringify(o);})()";
const BIO = "(function(){try{var e=dbgEtatLum(),b=e.bio||{},o={amb:e.amb};['sat','jdZ','jdL','jdM','jdH','jdB','jdR','jdS','fog','fogIn','fogCj'].forEach(function(k){if(b[k]!==undefined)o[k]=b[k]});return JSON.stringify(o)}catch(x){return 'ERR '+x}})()";
const ASTRE = "(function(){var d=dbgScene(),u=null,G=window.__gpuObj;d.scene.traverse(function(o){var m=o.material;if(!u&&m&&m.uniforms&&m.uniforms.uSunDir)u=m.uniforms.uSunDir.value;});if(!u||!G)return 0;var v=new u.constructor(u.x,0,u.z);var L=Math.hypot(v.x,v.z)||1;v.set(v.x/L*.966,.259,v.z/L*.966).normalize();var p=d.cam.position;d.cam.lookAt(p.x+v.x*10,p.y+v.y*10,p.z+v.z*10);d.cam.updateMatrixWorld();if(G.post())G.composer.render();else d.rdr.render(d.scene,d.cam);return 1})()";
const t0 = Date.now();
(async () => {
  for (const p of [+A.pa, +A.pb, +A.cdp]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  const srvs = [];
  if (A.avant) srvs.push(await serveur(path.resolve(A.avant), +A.pa));
  if (A.apres) srvs.push(await serveur(path.resolve(A.apres), +A.pb));
  const { ch, pg } = await lanceChrome(+A.cdp, tmp(), 844, 390);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  const fin = () => { try { c.close(); } catch (e) {} for (const s of srvs) try { s.close(); } catch (e) {} tueChrome(ch); };
  process.on('exit', fin); process.on('SIGTERM', () => process.exit(143)); process.on('SIGINT', () => process.exit(130));
  setTimeout(() => { console.log('CHIEN DE GARDE : arrêt'); process.exit(3); }, (+A.limite + 60) * 1000).unref();
  const exc = [];
  c.ws.addEventListener('message', e => { try { const m = JSON.parse(e.data); if (m.method === 'Runtime.exceptionThrown') exc.push(JSON.stringify(m.params.exceptionDetails).slice(0, 300)); if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') exc.push('CONSOLE: ' + JSON.stringify(m.params.args.map(x => x.value || x.description)).slice(0, 200)); } catch (x) {} });
  const taille = (w, h) => c.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 3, mobile: true, screenWidth: w, screenHeight: h });
  const shot = async nom => { const r = await c.send('Page.captureScreenshot', { format: 'png' }, 30000); fs.writeFileSync(path.join(OUT, nom), Buffer.from(r.data, 'base64')); };
  const pas = async n => { for (let k = 0; k < n; k += 30) await c.ev(`(async function(){for(var i=0;i<${Math.min(30, n - k)};i++){dbgStep(1,33);await new Promise(function(r){setTimeout(r,36)});}return 1})()`, 30000); };
  const pose = async (amb, o) => { /* « satAbs » : la saturation posée en valeur (le lot l'écrit ainsi pour la pluie), convertie en facteur */
    const r = Object.assign({}, o); const sa = r.satAbs; delete r.satAbs;
    const js = `(function(){var r=${JSON.stringify(r)};${sa != null ? `try{var s=dbgEtatLum().bio.sat;if(s)r.sat=${sa}/s;}catch(e){}` : ''}var x=dbgLumiere(${JSON.stringify(amb)},r);dbgStep(1,1);dbgStep(1,1);return JSON.stringify(!!x)})()`;
    return c.ev(js, 30000);
  };
  try {
    await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Network.enable');
    await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
    await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' });
    await c.send('Emulation.setEmulatedMedia', { features: [{ name: 'hover', value: 'none' }, { name: 'pointer', value: 'coarse' }] });
    await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{localStorage.clear();localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAVE)) + ')}catch(e){}' });
    for (const sc of SC) {
      if (Date.now() - t0 > +A.limite * 1000) { console.log('limite atteinte : arrêt (le verrou doit être rendu)'); break; }
      const [tag0, port, meteo, graine, q0] = sc.split('@');
      const DEB = /P$/.test(tag0), tag = tag0.replace(/P$/, ''), suf = DEB ? 'debout' : 'couche';
      const ast = /astre/.test(q0 || ''), q = (q0 || '').split('&').filter(x => x && x !== 'astre').join('&');
      const E = ESS[meteo] || {}, amb = E.amb;
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
        await c.ev("window.requestAnimationFrame=function(){return 0;};dbgAuto(1,0,{nit:0});1");
        await dormir(300); await c.ev(MASQUE);
        await pas(+A.pas);
        const prise = async t => { const n = `${t}-${meteo}-g${graine}`; await shot(`${n}-${suf}.png`);
          if (ast && !DEB) { try { await c.ev("(function(){try{var p=dbgGpu({n:1,k:1});return p&&p.then?p.then(function(){return 1},function(){return 1}):1}catch(e){return 0}})()", 30000); } catch (e) {} if (await c.ev(ASTRE)) await shot(`${n}-astre.png`); else console.log('ASTRE impossible', n); } };
        await prise(tag);
        const m = await c.ev(MESURE), bio = await c.ev(BIO);
        const et = await c.ev("(function(){var s=dbgState();return JSON.stringify({go:s.gameOver,d:Math.round(s.dist||s.d||0),vH:s.vH})})()");
        console.log('MESURE', `${tag}-${meteo}-g${graine}-${suf}`, m, 'etat', et, Math.round((Date.now() - t0) / 1000) + 's');
        console.log('BIO', `${tag}-${meteo}`, bio);
        if (amb && tag === 'av' && E.lot) { const r = await pose(amb, E.lot); await prise('lv'); console.log('POSE lv', r); }
        if (amb && tag === 'ap') for (const k of Object.keys(E).filter(x => /^k\d$/.test(x))) { const r = await pose(amb, E[k]); await prise(k); console.log('POSE', k, r, Math.round((Date.now() - t0) / 1000) + 's'); }
        const pan = await c.ev("(function(){try{return dbgErreurs().filter(function(e){return ['gel','serpent','son'].indexOf(e.g)<0}).map(function(e){return e.k})}catch(e){return String(e)}})()");
        console.log('FIN', `${tag}-${meteo}-g${graine}-${suf}`, 'pannes', JSON.stringify(pan), 'exc', JSON.stringify(exc.slice(0, 3)));
      } catch (e) { console.log('ECHEC', sc, String(e).slice(0, 300)); }
    }
  } finally { fin(); }
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
