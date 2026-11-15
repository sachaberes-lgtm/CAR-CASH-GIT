// LE BANC DES PETITS DÉFAUTS (2026-11-15, chantier QUALITÉ PAR APPAREIL, lot petits) : le banc reglages.cjs, mais à n'IMPORTE QUELLE taille (--w --h, DPR 3), ports 9841/9842 ;
// photos <tag>-<WxH>-<lang>-<étape>.png. Option --seulpause 1 : la pause seule (sans l'écran RÉGLAGES).
// (d'après reglages.cjs, lot 2)
// UN Chrome sans fenêtre et muet, émulé en téléphone (tactile + métriques mobiles + hover:none : TEL_NATIF vrai, vérifié par dbgImg().telNatif),
// au format iPhone 13 Pro (390×844 debout, 844×390 couché, DPR 3). Une sauvegarde ancienne est posée avant le chargement (son coupé : sfx, mus, vox).
//   node outils/banc-reglages/reglages.cjs --out <dossier> --tag t [--fmt debout|couche] [--lang fr|en] [--save '{"q":"net","qChoisi":1}']
//        [--q "appareil=iPhone14,2"] [--ecrans 1] [--pause 1] [--recharge 1] [--pc 1]
// --pc 1 : SANS l'émulation téléphone (fenêtre d'ordinateur 1280×800, souris) : l'ordinateur doit garder ses trois choix et sa sauvegarde.
// Imprime une ligne JSON par étape (état de la sauvegarde, du réglage, débordements du texte) ; photos <tag>-<fmt>-<lang>-<étape>.png.
// Chrome est fermé à la fin, quoi qu'il arrive.
const fs = require('fs'), path = require('path');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir, tmp } = require('../banc-trainees/cdp.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.resolve(A.jeu || path.join(__dirname, '..', '..', 'VERSION PRINCIPALE'));
const OUT = path.resolve(A.out || path.join(__dirname, 'prises')); fs.mkdirSync(OUT, { recursive: true });
const PC = A.pc === '1', [W, H] = PC ? [1280, 800] : [+(A.w || 844), +(A.h || 390)], FMT = PC ? 'pc' : `${W}x${H}`;
const LANG = A.lang || 'fr', TAG = A.tag || 'essai';
const P_HTTP = +(A.http || 9841), P_CDP = +(A.cdp || 9842);
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const SAVE = Object.assign({ v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, bank: 48500, owned: [0, 1, 2, 3], ex: { runs: 12 }, plq: { m: 'fr', x: 'CC-161-RZ', ok: 1 } }, A.save ? JSON.parse(A.save) : {});
/* l'état lu dans la page : la sauvegarde en mémoire (dbgNette), la sauvegarde écrite, le réglage affiché, et ce qui déborde */
const ETAT = `(function(){var n=dbgNette(),r={};try{r=JSON.parse(localStorage.cashcarSave)}catch(e){}
  var mv=document.getElementById('mvQ'),aide=document.getElementById('mvQAide'),tp=document.querySelector('#tPanel .tp.ligne[data-a="q"]'),tpa=document.querySelector('#tPanel .qAide');
  var deb=function(e){if(!e||!e.offsetParent)return null;var b=e.getBoundingClientRect(),o={w:Math.round(b.width),h:Math.round(b.height),sw:e.scrollWidth,cw:e.clientWidth,droite:Math.round(b.right),ecran:innerWidth};o.deborde=e.scrollWidth>e.clientWidth+1||b.right>innerWidth+.5||b.left<-.5;return o;};
  var prf=null;try{prf=(typeof window.dbgPrf==='function')?window.dbgPrf():null}catch(e){}
  return JSON.stringify({tel:dbgImg().telNatif,palier:n.palier,q:n.q,choisi:n.choisi,cap:n.cap,ecrit:{q:r.q,qChoisi:r.qChoisi},
    mvQ:mv?mv.textContent:null,mvQcls:mv?mv.className:null,aide:aide&&!aide.hidden?aide.textContent:null,tp:tp?tp.textContent.replace(/\\s+/g,' ').trim():null,tpAide:tpa&&!tpa.hidden?tpa.textContent:null,
    debMv:deb(mv),debAide:deb(aide),debTp:deb(tp),debTpAide:deb(tpa),prf:prf});})()`;

(async () => {
  for (const p of [P_HTTP, P_CDP]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  const srv = await serveur(JEU, P_HTTP), { ch, pg } = await lanceChrome(P_CDP, tmp(), W, H);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  const fin = () => { try { c.close(); } catch (e) {} try { srv.close(); } catch (e) {} tueChrome(ch); };
  process.on('exit', fin);
  const exc = [];
  c.ws.addEventListener('message', e => { try { const m = JSON.parse(e.data); if (m.method === 'Runtime.exceptionThrown') exc.push(JSON.stringify(m.params.exceptionDetails).slice(0, 300)); } catch (x) {} });
  /* avant chaque photo : le toast du banc (« SA MAJESTE QUITTE LE GARAGE », la sauvegarde d'essai) masqué, la ligne IMAGE amenée au milieu de l'écran */
  const cadre = () => c.ev("(function(){var t=document.getElementById('toast');if(t)t.style.setProperty('visibility','hidden','important');var r=document.querySelector('#mSet .mLigne[data-m=\"q\"]');if(r&&r.offsetParent)r.scrollIntoView({block:'center'});return 1})()");
  const shot = async nom => { await cadre(); await dormir(300); const r = await c.send('Page.captureScreenshot', { format: 'png' }, 60000); fs.writeFileSync(path.join(OUT, nom), Buffer.from(r.data, 'base64')); };
  const nom = et => `${TAG}-${FMT}-${LANG}-${et}.png`;
  const etat = async et => { const s = await c.ev(ETAT); console.log(et, s); return JSON.parse(s); };
  const pret = async () => { for (let i = 0; i < 400; i++) { await dormir(500); try { if (await c.ev("!!window.__gameReady&&typeof dbgNette==='function'", 8000)) return; } catch (e) {} } let t9 = '?'; try { t9 = await c.ev("document.title+' | '+location.search+' | pret='+!!window.__gameReady+' | dbgJouer='+typeof dbgJouer"); } catch (e) {} throw new Error('jeu pas prêt : ' + t9); };
  const splash = async () => { await c.ev("(function(){var s=document.getElementById('splash');if(!s)return 0;try{s.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));s.dispatchEvent(new PointerEvent('pointerup',{bubbles:true}));s.click();}catch(e){}return 1})()"); await dormir(2500);
    /* le tap du voile tombe parfois sur le trophée du garage : le PROFIL s'ouvre par-dessus ; on le referme par son RETOUR */
    console.log('profil', await c.ev("(function(){var p=document.getElementById('prof');if(!p||getComputedStyle(p).display==='none'||!p.getBoundingClientRect().height)return 'fermé';var l=p.querySelectorAll('.pbtn,[role=button]');for(var i=0;i<l.length;i++)if(/RETOUR|BACK/.test(l[i].textContent)){l[i].click();return 'refermé';}return 'ouvert sans retour'})()")); await dormir(1200); };
  /* un clic sur un élément visible (le premier qui a une boîte) */
  const clique = async sel => c.ev(`(function(){var l=document.querySelectorAll(${JSON.stringify(sel)});for(var i=0;i<l.length;i++){var e=l[i];if(e.offsetParent&&e.getBoundingClientRect().width>0){e.click();return 1;}}return 0})()`);
  try {
    await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Network.enable');
    await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
    if (!PC) {
      await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 3, mobile: true, screenWidth: W, screenHeight: H });
      await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
      await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' });
      await c.send('Emulation.setEmulatedMedia', { features: [{ name: 'hover', value: 'none' }, { name: 'pointer', value: 'coarse' }] });
    } else await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: false });
    /* la sauvegarde posée UNE fois (le rechargement doit relire celle que le jeu a écrite) */
    await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{if(!sessionStorage.bancPose){sessionStorage.bancPose=1;localStorage.clear();localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAVE)) + ');localStorage.setItem("ccLang",' + JSON.stringify(LANG) + ');}}catch(e){}' });
    const url = `http://127.0.0.1:${P_HTTP}/${A.page || 'index.html'}?colonne=0&garde=1&intro=ancien&attente=0&prebati=0` + (A.q ? '&' + A.q : '');
    await c.send('Page.navigate', { url });
    await pret(); await dormir(1500);
    await etat('charge');
    await splash();
    if (A.ecrans === '1') {
      await clique('[data-m="set"]'); await dormir(1800);
      await etat('reglages'); await shot(nom('reglages-1'));
      await clique('#mSet .mLigne[data-m="q"]'); await dormir(1200);
      await etat('reglages-bascule'); await shot(nom('reglages-2'));
      if (A.seg === '1') { /* un tap sur le choix DÉJÀ pris ne change rien ; un tap sur l'autre le prend */
        await clique('#mvQ [data-q="haute"]'); await dormir(600); await etat('seg-haute');
        await clique('#mvQ [data-q="fast"]'); await dormir(600); await etat('seg-fast');
        await clique('#mvQ [data-q="fast"]'); await dormir(600); await etat('seg-fast-encore');
      }
      await clique('#mSet [data-m="back"]'); await dormir(1500);
    }
    if (A.pause === '1') {
      let ok = false;
      for (let i = 0; i < 160 && !ok; i++) { if (i % 16 === 0) { try { await c.ev('dbgJouer()'); } catch (e) {} } await dormir(500); try { ok = await c.ev("(function(){var s=dbgState();return !!(s.started&&s.running&&!s.gameOver)})()"); } catch (e) {} }
      if (!ok) throw new Error('course pas lancée');
      await dormir(1500);
      await c.ev("(function(){var g=document.getElementById('tGear');if(g)g.click();return !!g})()"); await dormir(1500);
      await etat('pause'); await shot(nom('pause-1'));
      await clique('#tPanel .tp.ligne[data-a="q"]'); await dormir(1200);
      await etat('pause-bascule'); await shot(nom('pause-2'));
    }
    if (A.recharge === '1') { await c.send('Page.reload', {}); await pret(); await dormir(1500); await etat('recharge'); }
    console.log('exceptions', JSON.stringify(exc.slice(0, 5)));
  } finally { fin(); }
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
