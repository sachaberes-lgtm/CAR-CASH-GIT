// LE BANC DU FILM DANS UN WORKER, SUR WEBKIT (2026-11-15, qualité · lot SONDEOC) — les scripts qui ont donné les chiffres « WebKit de Playwright » de passation/qualite/sondeoc.md.
// WebKit de bureau (Playwright) n'est PAS la WKWebView de l'iPhone : il dit seulement si le moteur sait faire (OffscreenCanvas 2D, rAF de Worker, FontFace de Worker).
//   photos : le Worker tient-il le film ; fil principal bloqué 3 × 800 ms ; photos figées Worker / fil principal (à comparer avec filmworker.cjs, fonction `compare`)
//   menu   : la boule prête, l'appui, le menu, la fin du Worker, puis la sonde du coin (?sondeoc=1) et ses lignes « sondeoc »
//   sonde  : la page minimale (sans le jeu) : une toile transférée à un Worker avance-t-elle pendant un blocage de 1,5 s ?
// Usage : node outils/banc-demarrage/filmworker-webkit.cjs photos|menu|sonde [dossier des photos]
// Il faut playwright-core et son WebKit (npx playwright install webkit). Chemins par défaut : ceux du Mac de Sacha ; sinon PLAYWRIGHT_CORE=… WEBKIT_EXE=…
// ⚠ Un seul banc à la fois : ~/cash-car/verrou-banc.sh prendre "<qui>" avant, rendre après. Sortie : JSON ; code 1 si `echec`.
const path = require('path'), os = require('os'), fs = require('fs');
const { webkit } = require(process.env.PLAYWRIGHT_CORE || path.join(os.homedir(), '.npm/_npx/9833c18b2d85bc59/node_modules/playwright-core'));
const EXE = process.env.WEBKIT_EXE || path.join(os.homedir(), 'Library/Caches/ms-playwright/webkit-2388/pw_run.sh');
const { serveur } = require('../banc-trainees/cdp.cjs');
const MODE = process.argv[2] || 'photos', D = process.argv[3] || fs.mkdtempSync(path.join(os.tmpdir(), 'banc-filmworker-webkit-'));
const JEU = path.join(__dirname, '..', '..', 'VERSION PRINCIPALE'), PORT = 9941;
const SAVE = { v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, bank: 48500, aura: 1200, auraMax: 3000, owned: [0, 1, 2, 3], ex: { runs: 12 }, plq: { m: 'fr', x: 'CC-161-RZ', ok: 1 } };
const URL_JEU = 'http://127.0.0.1:' + PORT + '/index.html?tel=1&palier=2&colonne=0&garde=1&attente=0&chute=0&introapres=1&plus=filmworker&sondeoc=1';
const NOTES = 'dbgErreurs().filter(function(x){return /filmworker|sondeoc|intro|erreur|promesse|panne|boucle/.test(x.g);}).map(function(x){return x.g+" | "+x.m;})';
const PAGE_SONDE = `<!doctype html><canvas id=c width=300 height=300></canvas><script>
const wsrc=\`let g,n=0,T=[];const R=self.requestAnimationFrame?self.requestAnimationFrame.bind(self):(f=>setTimeout(()=>f(performance.now()),16));onmessage=e=>{const cv=e.data.cv;if(cv){g=cv.getContext('2d');const f=t=>{n++;T.push(performance.timeOrigin+performance.now());g.fillStyle='hsl('+(n*7%360)+',80%,50%)';g.fillRect(0,0,300,300);R(f);};R(f);}
 if(e.data.q){postMessage({n,T:T.slice(-400),wraf:!!self.requestAnimationFrame});}};\`;
const w=new Worker(URL.createObjectURL(new Blob([wsrc])));const oc=document.getElementById('c').transferControlToOffscreen();w.postMessage({cv:oc},[oc]);
window.ask=()=>new Promise(r=>{w.onmessage=e=>r(e.data);w.postMessage({q:1});});
window.bloque=ms=>{const t0=performance.now();while(performance.now()-t0<ms){} return [performance.timeOrigin+t0,performance.timeOrigin+performance.now()];};
window.oc=typeof OffscreenCanvas;
</script>`;
(async () => {
  const S = { mode: MODE, dossier: D }, errs = [];
  const b = await webkit.launch({ executablePath: EXE, headless: true });
  if (MODE === 'sonde') { /* (les deux horloges sont comparées ici : valable sur ce WebKit de bureau, où elles sont les mêmes ; la vraie sonde du jeu ne le fait plus) */
    const pg = await (await b.newContext()).newPage(); await pg.setContent(PAGE_SONDE); await pg.waitForTimeout(1500);
    const a = await pg.evaluate('ask()'), blk = await pg.evaluate('bloque(1500)'); await pg.waitForTimeout(300); const c = await pg.evaluate('ask()');
    console.log(JSON.stringify({ OffscreenCanvas: await pg.evaluate('oc'), imagesAvant: a.n, imagesApres: c.n, imagesDuWorkerPendantBlocage1500ms: c.T.filter(t => t > blk[0] && t < blk[1]).length, rafWorker: c.wraf, ua: await pg.evaluate('navigator.userAgent') }));
    await b.close(); process.exit(0);
  }
  const srv = await serveur(JEU, PORT);
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true, serviceWorkers: 'block' });
  await ctx.addInitScript('try{localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAVE)) + ');}catch(e){}');
  const pg = await ctx.newPage(); pg.on('pageerror', e => errs.push(String(e).slice(0, 200)));
  try {
    await pg.goto(URL_JEU, { waitUntil: 'commit' });
    if (MODE === 'photos') {
      let et = null; const T0 = Date.now();
      for (;;) { await pg.waitForTimeout(1000); try { et = await pg.evaluate('window.dbgFilmW?Object.assign(dbgFilmW.etat(),{t:Math.round(performance.now()),lance:!!(window.__ccIntroAuto&&__ccIntroAuto.lance()),ua:navigator.userAgent}):({rien:1,t:Math.round(performance.now())})'); } catch (e) { et = { ev: String(e).slice(0, 100) }; }
        if (et && (et.tient || et.etat === 'repli')) break; if (Date.now() - T0 > 150000) break; }
      S.prise = et; if (!et || !et.tient) throw new Error('le Worker ne tient pas le film');
      await pg.waitForTimeout(1500); const b0 = await pg.evaluate('dbgFilmW.bilan()');
      S.bloques = await pg.evaluate(`(async function(){const d=ms=>new Promise(r=>setTimeout(r,ms)),L=[];for(let i=0;i<3;i++){const a=performance.now();while(performance.now()-a<800){}L.push(Math.round(performance.now()-a));await d(700);}return L;})()`);
      const b1 = await pg.evaluate('dbgFilmW.bilan()'); S.avant = b0 && [b0.n, b0.des, Math.round(b0.mx), b0.k]; S.apres = b1 && [b1.n, b1.des, Math.round(b1.mx), b1.k, b1.l, b1.rdMx, b1.raf];
      for (let i = 0; i < 120; i++) { await pg.waitForTimeout(500); if (await pg.evaluate('!!(window.__ccIntroAuto&&__ccIntroAuto.pret())')) break; }
      await pg.waitForTimeout(2500); await pg.screenshot({ path: path.join(D, 'wk-boule.png') });
      S.photos = [];
      for (const q of [[2.6, null, null], [4, null, null], [6, 3, null], [4.6, 1, 3]]) {
        await pg.evaluate(`dbgIntro.boule({pret:${q[1]},tap:${q[2]}})`); const ok = await pg.evaluate(`dbgFilmW.fige(${q[0]})`); await pg.waitForTimeout(400);
        const n = 'wk-t' + String(q[0]).replace('.', '_') + (q[2] !== null ? '-appui' : '') + (q[1] !== null ? '-pret' : ''); await pg.screenshot({ path: path.join(D, n + '-worker.png') });
        await pg.evaluate(`dbgFilmW.cache(true);dbgIntro.voir(${q[0]});1`); await pg.waitForTimeout(300); await pg.screenshot({ path: path.join(D, n + '-principal.png') }); await pg.evaluate('dbgFilmW.cache(false);1');
        S.photos.push([n, ok]); }
    } else {
      for (let i = 0; i < 240; i++) { await pg.waitForTimeout(500); if (await pg.evaluate('!!(window.__ccIntroAuto&&__ccIntroAuto.pret())').catch(() => false)) break; }
      S.avant = await pg.evaluate('dbgFilmW.etat()'); await pg.waitForTimeout(2500);
      await pg.evaluate('__ccIntroAuto.tapBoule();window.__voileParti=0;(function(){const v=document.getElementById("fxCvW")||document.getElementById("splash");(function f(){if(!v||!v.isConnected){window.__voileParti=performance.now();return;}setTimeout(f,4);})();})();1');
      for (let i = 0; i < 120; i++) { await pg.waitForTimeout(500); if (await pg.evaluate('!document.getElementById("splash")')) break; }
      await pg.waitForTimeout(600);
      S.fin = await pg.evaluate('(function(){const e=dbgFilmW.etat();return{etat:e.etat,pourquoi:e.finPq,msApresLeVoile:Math.round((e.finA||0)-__voileParti),imagesFermees:e.fermees,workerVivant:e.worker};})()');
      for (let i = 0; i < 60; i++) { await pg.waitForTimeout(1000); const e = await pg.evaluate('window.dbgSondeOC?dbgSondeOC().etat:"-"').catch(() => '?'); if (i === 8) await pg.screenshot({ path: path.join(D, 'wk-sonde.png') }); if (/fini|échec|pas de|annul/.test(e)) break; }
      S.sonde = await pg.evaluate('window.dbgSondeOC&&dbgSondeOC()');
    }
    S.notes = await pg.evaluate(NOTES);
  } catch (e) { S.echec = String(e).slice(0, 300); }
  S.errs = errs.slice(0, 5); console.log(JSON.stringify(S, null, 1)); await b.close(); srv.close(); process.exit(S.echec ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
