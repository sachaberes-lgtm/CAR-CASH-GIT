/* LE BANC DES PORTAILS (2026-11-11, Sacha : « les portails pour changer de map sont encore assez buggés de plusieurs manières ») : Chrome headless (vrai GPU),
   la caisse posée devant le portail (dbgPortail) ou lâchée en vol dans le repère de l'anneau (dbgPortailVol), l'état relevé IMAGE PAR IMAGE (dbgPortailEtat)
   et des photos avant / pendant / après le passage.
     node outils/banc-portail/portail.cjs --prof <profil Chrome chaud> [--sc sol,vol-face,vol-dos,vol-cote,vol-anneau,bord,pause,ciel,mort] [--map jade:matin] [--vers canyon:midi]
       [--format tel|couche|pc] [--out <dossier>] [--n 2] [--q "x=1&y=2"]
   Sorties : <out>/<scénario>-*.jpg et le compte rendu sur la sortie standard. */
const fs = require('fs'), path = require('path');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir, tmp } = require('../banc-trainees/cdp.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.resolve(A.jeu || path.join(__dirname, '..', '..', 'VERSION PRINCIPALE')), FMT = A.format || 'tel';
const W = FMT === 'tel' ? 390 : FMT === 'couche' ? 844 : 1280, H = FMT === 'tel' ? 844 : FMT === 'couche' ? 390 : 720;
const OUT = path.resolve(A.out || path.join(__dirname, 'out')); fs.mkdirSync(OUT, { recursive: true });
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const SAVE = { v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, bank: 48500, aura: 1200, auraMax: 3000, owned: [0, 1, 2, 3], plq: { ok: 1 } };
const SC = (A.sc || 'sol').split(','), N = +(A.n || 1);
let P_HTTP = +(A.http || 9871), P_CDP = +(A.cdp || 9872);
(async () => {
  while (!portLibre(P_HTTP)) P_HTTP += 2; while (!portLibre(P_CDP) || P_CDP === P_HTTP) P_CDP += 2;
  const srv = await serveur(JEU, P_HTTP), prof = A.prof || tmp();
  const { ch, pg } = await lanceChrome(P_CDP, prof, W, H);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  const err = [], con = [];
  c.ws.addEventListener('message', e => { try { const m = JSON.parse(e.data);
    if (m.method === 'Runtime.exceptionThrown') { const d = m.params.exceptionDetails; err.push(((d.exception && d.exception.description) || d.text || '').slice(0, 500)); }
    if (m.method === 'Runtime.consoleAPICalled' && (m.params.type === 'error' || m.params.type === 'warning')) con.push(m.params.type + ': ' + m.params.args.map(a => a.value !== undefined ? String(a.value) : (a.description || a.type)).join(' ').slice(0, 300));
  } catch (x) {} });
  const fin = () => { try { c.close(); } catch (e) {} tueChrome(ch); srv.close(); };
  const attend = async (expr, ms, pas) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { try { if (await c.ev(expr, 8000)) return true; } catch (e) {} await dormir(pas || 300); } return false; };
  const photo = async (nom) => { try { const sh = await c.send('Page.captureScreenshot', { format: 'jpeg', quality: 72 }, 30000); fs.writeFileSync(path.join(OUT, nom + '.jpg'), Buffer.from(sh.data, 'base64')); } catch (e) { console.log('  photo ' + nom + ' ? ' + e.message.slice(0, 80)); } };
  const etat = async () => { try { return await c.ev('dbgPortailEtat()'); } catch (e) { return { err: e.message.slice(0, 120) }; } };
  const jusqua = (cond, ms) => c.ev(`new Promise(function(r){const t0=performance.now();const f=function(){let e;try{e=dbgPortailEtat();}catch(x){r({err:String(x)});return;}if((${cond})||performance.now()-t0>${ms}){e.delai=performance.now()-t0>${ms};r(e);}else requestAnimationFrame(f);};f();})`, ms + 10000);
  /* le relevé image par image : chaque changement d'état noté, et les images longues */
  const releve = (on) => c.ev(on ? `(function(){const R=window.__pr={on:true,l:[],dtMax:0,n:0,d:''};let t9=performance.now();const f=function(){if(!R.on)return;const t=performance.now(),dt=t-t9;t9=t;R.n++;if(dt>R.dtMax)R.dtMax=dt;let e;try{e=dbgPortailEtat();}catch(x){e={err:String(x)};}
      const cle=[e.mode,e.zones,e.att?1:0,e.fen?1:0,e.voile,e.carte,e.go?1:0,e.vis?1:0,e.paye].join('|');if(cle!==R.d||dt>120){R.d=cle;R.l.push({t:Math.round(t),dt:Math.round(dt),s:e.s,L:e.L,mode:e.mode,z:e.zones,att:e.att,fen:e.fen,voile:e.voile,carte:e.carte,loc:e.loc,go:e.go,vis:e.vis,paye:e.paye,arg:e.argent});}requestAnimationFrame(f);};requestAnimationFrame(f);return 1;})()`
    : `(function(){const R=window.__pr;if(!R)return null;R.on=false;return {n:R.n,dtMax:Math.round(R.dtMax),l:R.l.slice(0,60)};})()`);
  const dit = (r) => { if (!r) return; console.log('  relevé : ' + r.n + ' images, pire ' + r.dtMax + ' ms'); const t0 = r.l.length ? r.l[0].t : 0; for (const x of r.l) console.log('   +' + (x.t - t0) + ' ms dt ' + x.dt + ' | ' + x.mode + ' s ' + x.s + '/' + x.L + ' z' + x.z + ' att ' + x.att + ' fen ' + x.fen + ' voile ' + x.voile + ' ' + x.carte + ' loc ' + JSON.stringify(x.loc) + (x.go ? ' MORT' : '') + ' vis ' + x.vis + ' payé ' + x.paye + ' $' + x.arg); };
  const charge = async () => {
    await c.send('Page.navigate', { url: `http://127.0.0.1:${P_HTTP}/index.html?colonne=0${FMT === 'pc' ? '' : '&tel=1'}&simu=1&intro=ancien&attente=0&chute=0${A.q ? '&' + A.q : ''}` });
    const pret = await attend("!!window.__gameReady&&typeof dbgState==='function'&&typeof dbgPortailEtat==='function'&&document.getElementById('mHome').classList.contains('on')", 300000, 800);
    if (!pret) { console.log('PAS PRÊT'); await photo('pas-pret'); return false; }
    await dormir(1500);
    if (A.map) await c.ev("dbgClassique('" + A.map.split(':')[0] + "','" + (A.map.split(':')[1] || 'matin') + "');1");
    try { await c.ev("(function(){const s=document.getElementById('splash');if(s){s.dispatchEvent(new Event('touchstart'));s.click();}return 1;})()"); } catch (e) {}
    await dormir(600); await c.ev('dbgJouer();1');
    const ok = await attend("(function(){const s=dbgState();return s.started&&!s.gameOver&&s.mode==='drive';})()", 60000, 400);
    if (!ok) { console.log('LA COURSE NE PART PAS'); await photo('pas-partie'); return false; }
    if (A.vers) await c.ev("dbgClassique('" + A.vers.split(':')[0] + "','" + (A.vers.split(':')[1] || 'matin') + "');1"); else await c.ev('try{dbgClassique().force&&0}catch(e){};1');
    await c.ev('dbgAuto(true);1'); await dormir(2500); return true; };
  const apres = async (nom, ms) => { /* photos après le déclenchement */
    let t = 0; for (const d of ms) { await dormir(d - t); t = d; await photo(nom + '-apres' + d); } };
  const SCN = {
    /* AU SOL, par la route */
    async sol(nom) { await c.ev('dbgPortail(700);1'); let e = await jusqua('e.L-25-e.s<320', 20000); await photo(nom + '-a300'); e = await jusqua('e.L-25-e.s<110', 20000); await photo(nom + '-a100');
      await releve(true); e = await jusqua('e.L-25-e.s<45||e.zones>' + e.zones, 20000); await photo(nom + '-a40'); const z0 = e.zones;
      e = await jusqua('e.zones>' + z0 + '||e.go', 20000); console.log('  déclenché :', JSON.stringify(e).slice(0, 420)); await apres(nom, [0, 120, 300, 600, 1200, 2500]); dit(await releve(false)); console.log('  après :', JSON.stringify(await etat()).slice(0, 420)); },
    /* AU SOL, en rasant le bord */
    async bord(nom) { await c.ev('dbgAuto(true,0,{latK:.86});dbgPortail(700);1'); let e = await jusqua('e.L-25-e.s<110', 20000); await photo(nom + '-a100'); await releve(true); const z0 = e.zones;
      e = await jusqua('e.zones>' + z0 + '||e.go', 20000); console.log('  déclenché :', JSON.stringify(e).slice(0, 420)); await apres(nom, [0, 300, 1200]); dit(await releve(false)); },
    /* EN VOL : x, y, z (m, repère de l'anneau), vitesse */
    async vol(nom, x, y, z, vx, vy, vz) { await c.ev('dbgPortail(900);1'); await dormir(700); await c.ev("dbgAuto(false);1"); const e0 = await c.ev(`dbgPortailVol(${x},${y},${z},${vx},${vy},${vz})`); console.log('  lâchée :', JSON.stringify(e0).slice(0, 300)); const z0 = e0.zones;
      await releve(true); await photo(nom + '-lache'); const e = await jusqua('e.zones>' + z0 + '||e.go||e.mode==="drive"', 12000); console.log('  issue :', JSON.stringify(e).slice(0, 420)); await apres(nom, [0, 300, 1200, 2500]); dit(await releve(false)); console.log('  après :', JSON.stringify(await etat()).slice(0, 300)); },
    'vol-face'(nom) { return SCN.vol(nom, 0, 8, 220, 0, 30, -350); },
    'vol-dos'(nom) { return SCN.vol(nom, 0, 8, -220, 0, 30, 350); },
    'vol-cote'(nom) { return SCN.vol(nom, 110, 8, 200, 0, 30, -350); },   /* à côté de l'anneau : rien ne doit se passer de bizarre */
    'vol-anneau'(nom) { return SCN.vol(nom, 74, 8, 200, 0, 30, -350); },  /* DANS les cubes de l'anneau */
    'vol-haut'(nom) { return SCN.vol(nom, 0, 78, 200, 0, 0, -350); },      /* par le HAUT de l'anneau, dans ses cubes */
    'vol-loin'(nom) { return SCN.vol(nom, 0, 150, 200, 0, 60, -350); },    /* loin au-dessus : hors du portail, rien */
    async ciel(nom) { await c.ev('dbgPortail(900);1'); await dormir(700); const e0 = await etat(); console.log('  lâchée :', JSON.stringify(await c.ev("dbgPortail('ciel')"))); await releve(true);
      const e = await jusqua('e.zones>' + e0.zones + '||e.go||e.mode==="drive"', 15000); console.log('  issue :', JSON.stringify(e).slice(0, 420)); await apres(nom, [0, 300, 1200]); dit(await releve(false)); },
    /* LA PAUSE posée dans l'image du passage */
    async pause(nom) { await c.ev('dbgPortail(500);1'); let e = await jusqua('e.L-25-e.s<110', 20000); const z0 = e.zones; await releve(true);
      await c.ev(`new Promise(function(r){const f=function(){const e=dbgPortailEtat();if(e.att||e.zones>${z0}){window.__panBascule();r(1);}else requestAnimationFrame(f);};f();})`, 20000);
      await dormir(1500); await photo(nom + '-pause'); console.log('  en pause :', JSON.stringify(await etat()).slice(0, 420)); await c.ev('window.__panBascule();1'); await dormir(4500); await photo(nom + '-reprise'); dit(await releve(false)); console.log('  après :', JSON.stringify(await etat()).slice(0, 420)); },
    /* LA MORT dans l'image du passage */
    async mort(nom) { await c.ev('dbgPortail(500);1'); let e = await jusqua('e.L-25-e.s<110', 20000); const z0 = e.zones; await releve(true);
      await c.ev(`new Promise(function(r){const f=function(){const e=dbgPortailEtat();if(e.att||e.zones>${z0}){dbgDauphin('boom');r(1);}else requestAnimationFrame(f);};f();})`, 20000);
      await dormir(600); await photo(nom + '-boom'); await dormir(3500); await photo(nom + '-fin'); dit(await releve(false)); console.log('  après :', JSON.stringify(await etat()).slice(0, 420)); },
    /* LES VUES DU PORTAIL de la map (sans HUD) : de face à 300 / 150 / 60 m, de haut, de dos, puis la caméra de course */
    async vues(nom) { await c.ev('dbgPortail(900);1'); await dormir(1200); console.log('  ' + JSON.stringify(await etat()).slice(0, 330));
      const img = async (k, expr) => { try { const u = await c.ev(expr, 30000); if (typeof u === 'string' && u.indexOf('data:') === 0) fs.writeFileSync(path.join(OUT, nom + '-' + k + '.jpg'), Buffer.from(u.split(',')[1], 'base64')); else console.log('  vue ' + k + ' : ' + String(u).slice(0, 80)); } catch (e) { console.log('  vue ' + k + ' ? ' + e.message.slice(0, 120)); } };
      await img('f300', 'dbgVuePortail(300,5.5,.8)'); await img('f150', 'dbgVuePortail(150,5.5,.8)'); await img('f60', 'dbgVuePortail(60,5.5,.8)'); await img('haut', 'dbgVuePortail(260,70,.8)'); await img('dos', 'dbgVuePortail(200,5.5,.8,160)'); },
    /* EN VOL POUR DE VRAI : le pilote décolle devant le portail (élan imp) et traverse la fenêtre en l'air */
    async saut(nom) { await c.ev('dbgPortail(' + (A.d || 420) + ');1'); await dormir(300); const e0 = await etat(); await c.ev('dbgAuto(true,0,{saut:.05,imp:' + (A.imp || 16) + '});1'); await releve(true);
      let e = await jusqua('e.mode==="fall"', 5000); await c.ev('dbgAuto(true);1'); await photo(nom + '-vol'); e = await jusqua('e.zones>' + e0.zones + '||e.go||(e.mode==="drive"&&e.s<1000)', 15000); console.log('  issue :', JSON.stringify(e).slice(0, 420)); await apres(nom, [0, 150, 400, 1200, 2500]); dit(await releve(false)); console.log('  après :', JSON.stringify(await etat()).slice(0, 300)); },
    async cartes() { console.log('  ' + JSON.stringify(await c.ev('dbgClassique().cartes'))); },
    /* PLUSIEURS PORTAILS À LA SUITE dans la même partie */
    async suite(nom) { for (let k = 0; k < 5; k++) { const e0 = await etat(); if (e0.go || e0.err) { console.log('  arrêt :', JSON.stringify(e0).slice(0, 200)); break; } console.log('  route ' + e0.carte + ' :', JSON.stringify(await c.ev('dbgPortailRoute()')), JSON.stringify(await c.ev('dbgPortailRoute(95)').then(x => x.coupes))); await c.ev('dbgAuto(true);dbgPortail(450);1'); await releve(true);
        let e = await jusqua('e.L-25-e.s<150||e.zones>' + e0.zones, 20000); await photo(nom + '-' + k + '-a150');
        e = await jusqua('e.zones>' + e0.zones + '||e.go', 20000); await dormir(250); await photo(nom + '-' + k + '-p250'); await dormir(2200); await photo(nom + '-' + k + '-p2500'); const r = await releve(false); const e1 = await etat();
        console.log('  passage ' + k + ' : ' + e0.carte + '/' + e0.meteo + ' → annoncé ' + JSON.stringify(e0.dest) + ' (image ' + e0.cle + ' ' + e0.img + ') → arrivé ' + e1.carte + '/' + e1.meteo + ' ; pire image ' + (r && r.dtMax) + ' ms ; mode ' + e1.mode + (e1.go ? ' MORT' : '')); await dormir(1500); } },
  };
  try {
    await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Network.enable');
    await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
    if (FMT !== 'pc') { await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 2, mobile: true, screenWidth: W, screenHeight: H });
      await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 }); await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' }); }
    await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAVE)) + ')}catch(e){}' });
    for (const sc of SC) for (let k = 0; k < N; k++) { const nom = sc + (N > 1 ? '-' + k : '') + (A.map ? '-' + A.map.replace(':', '_') : '');
      console.log('\n=== ' + nom + ' (' + FMT + ') ==='); const e0 = err.length;
      if (!(await charge())) continue; console.log('  départ :', JSON.stringify(await etat()).slice(0, 420));
      try { await SCN[sc](nom); } catch (e) { console.log('  ÉCHEC du scénario :', String(e).slice(0, 300)); }
      if (err.length > e0) console.log('  EXCEPTIONS : ' + [...new Set(err.slice(e0))].join(' ⏎ ').slice(0, 900)); }
  } catch (e) { console.log('ÉCHEC :', String(e).slice(0, 300)); }
  console.log('\n=== EXCEPTIONS (' + err.length + ') ==='); for (const x of [...new Set(err)]) console.log(' - ' + x.replace(/\n/g, ' ⏎ ').slice(0, 400));
  console.log('=== CONSOLE error/warn (' + con.length + ') ==='); for (const x of [...new Set(con)].slice(0, 30)) console.log(' - ' + x.slice(0, 240));
  fin(); process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
