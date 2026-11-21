// LE BANC DE LA MUSIQUE DU GARAGE (2026-11-21, lot qualité « musiquegarage », Sacha : « Dans mon build, j'ai plus la musique dans le garage. La musique version lobby, elle est plus là. »)
// Le VRAI jeu, Chrome sans fenêtre et MUET (--mute-audio : rien ne sort du Mac, le graphe audio tourne quand même). ⚠ ici mus reste VRAI dans la sauvegarde (sinon le lobby ne part
// jamais) ; sfx et vox à faux. iPhone 13 Pro émulé (844×390, DPR 3, tactile, UA iPhone, ?tel=1&appareil=iPhone14,2). --verrou 1 : le volume des <audio> en lecture seule (VOL_LOCKED, comme iOS).
// Chaque <AudioContext> est noté et TOUT ce qui se branche sur sa sortie passe aussi par un AnalyserNode : le niveau RMS qui part vers les haut-parleurs (muets) est lu, pas deviné.
//   node outils/banc-musiquegarage/garage.cjs --jeu "<dossier VERSION PRINCIPALE>" --save riche|neuve|avanttri [--q "sans=x"] [--verrou 1] [--chaud 1] [--http 9871] [--cdp 9872] [--repos 60]
//     (2e manche, 21/11) [--rate charge:N|musique:N] : les N premiers fetch de la liste de Pouce bleu (musique-moteur.json) ou des fichiers de musique (assets/audio/music/…) ÉCHOUENT
//     (« départ raté » du lobby, comme une lecture refusée sur un téléphone chaud) ; [--armer debut|mort] : armé dès le chargement (défaut) ou juste avant la mort.
//     [--course 1] : la VRAIE course à la place du raccourci : JOUER touché au garage (#gJouer), passage lobby → course relevé toutes les ~0,5 s, 15 s d'auto-pilote,
//     puis mains libres jusqu'à la vraie mort (chute), écran de mort, GARAGE ; course → lobby relevé de la même façon. Le parcours par défaut est inchangé.
// Une ligne JSON par étape sur la sortie, puis le résumé. Chrome tué (son groupe), profil effacé, quoi qu'il arrive.
const fs = require('fs'), path = require('path'), os = require('os');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir } = require('../banc-trainees/cdp.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.resolve(A.jeu || path.join(__dirname, '..', '..', 'VERSION PRINCIPALE'));
const [W, H] = [844, 390], P_HTTP = +(A.http || 9871), P_CDP = +(A.cdp || 9872), REPOS = +(A.repos || 60);
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const SON = { sfx: false, mus: true, vox: false };
const RICHE = { v: 2, ...SON, gamme: 3, eco: 3, tuto: 1, permis: 1, bienv: 1, best: 9000, bank: 48500, aura: 100, owned: [0, 1, 2, 3, 6, 7, 8], equipped: 1, q: 'fast', qChoisi: 1, shopVu: 1,
  ex: { eng: 6, tricks: 40, gaps: 3, bumps: 9, zones: 2, chain: 12, kmh: 300, surv: 0, runs: 25, floor: 0 }, mis: { n: 3, ok: [1, 1, 1], best: [0, 0, 0], f: -1 }, plq: { m: 'fr', x: 'CC-161-RZ', ok: 1 },
  prof: { ne: Date.now() - 5 * 864e5, tA: 3600, dMax: 120 },
  m2: { v: 1, vc: 1, vr: 1, ok: ['fig5'], pr: [], su: [], mq: [], nv: ['fig5'], fl: [], vu: {}, r: {}, c: { morts: 3, gagne: 5e6, jours: 4, jd: '2026-11-17', cartes: ['nuages'], cartesP: [], rejoue: 0 } } };
const AVANTTRI = JSON.parse(JSON.stringify(RICHE)); AVANTTRI.m2.ok = ['fig5', 'parf10', 'lave']; AVANTTRI.m2.nv = ['fig5', 'parf10', 'lave'];
const NEUVE = { v: 2, ...SON };
const SAVE = A.save === 'neuve' ? NEUVE : A.save === 'avanttri' ? AVANTTRI : RICHE;
/* la sonde : chaque contexte audio, et un analyseur sur tout ce qui va à sa sortie */
const NATIF = A.natif === 'chaud' ? 'window.__ccThermique=2;' : A.natif === 'eco' ? 'window.__ccEco=1;' : A.natif === 'critique' ? 'window.__ccThermique=3;' : '';
const RATE = A.rate ? A.rate.split(':') : null, RE_RATE = { charge: 'musique-moteur\\.json', musique: 'assets/audio/music/.*\\.(m4a|mp3|ogg|wav)' };
const RATER = RATE ? `if(window===window.top&&!window.__rate){window.__rate={re:new RegExp(${JSON.stringify(RE_RATE[RATE[0]] || RATE[0])}),n:${A.armer === 'mort' ? 0 : (+RATE[1] || 1)},N:${+RATE[1] || 1},vus:[]};
  var f0=window.fetch;window.fetch=function(u){try{var s=typeof u==='string'?u:(u&&u.url)||'';var R=window.__rate;if(R.n>0&&R.re.test(s)){R.n--;R.vus.push(s.split('/').slice(-2).join('/')+'@'+Math.round(performance.now()/100)/10+'s');return Promise.reject(new TypeError('banc : fetch raté '+s.split('/').pop()));}}catch(e){}return f0.apply(this,arguments);};}` : '';
const SONDE = NATIF + RATER + `(function(){var O=window.AudioContext||window.webkitAudioContext;if(!O||window.__acs)return;window.__acs=[];
  function W(a){var c=a?new O(a):new O();window.__acs.push(c);return c;}W.prototype=O.prototype;try{Object.setPrototypeOf(W,O);}catch(e){}window.AudioContext=W;window.webkitAudioContext=W;
  var cn=AudioNode.prototype.connect;AudioNode.prototype.connect=function(d){try{if(d&&d instanceof AudioDestinationNode){var c=this.context;if(!c.__an){c.__an=c.createAnalyser();c.__an.fftSize=2048;}if(this!==c.__an)cn.call(this,c.__an);}}catch(e){}return cn.apply(this,arguments);};
  ${A.verrou === '1' ? "try{var dv=Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype,'volume');Object.defineProperty(HTMLMediaElement.prototype,'volume',{configurable:true,get:function(){return dv.get.call(this);},set:function(v){}});}catch(e){}" : ''}
})();`;
const MESUREN = k => `(async function(){const R={};try{R.lobby=dbgLobby();}catch(e){R.lobby=String(e);}
  try{const P=window.POUCE_JEU;R.phase=P&&P.phase;R.n=P&&P.n;R.v9=P&&P.ch&&P.ch.g&&P.ch.g.gain._v9!=null?+P.ch.g.gain._v9.toFixed(4):null;R.gain=P&&P.ch&&P.ch.g?+P.ch.g.gain.value.toFixed(4):null;}catch(e){}
  R.ac=(window.__acs||[]).map(function(c){return c.state;});
  const c=(window.__acs||[]).find(function(c){return c.__an&&c.state!=='closed';});let mx=-200,moy=0,n=0;
  if(c){const b=new Float32Array(2048);for(let i=0;i<${k};i++){c.__an.getFloatTimeDomainData(b);let s=0;for(let k=0;k<b.length;k++)s+=b[k]*b[k];const db=10*Math.log10(s/b.length+1e-20);mx=Math.max(mx,db);moy+=db;n++;await new Promise(function(r){setTimeout(r,120);});}}
  R.dbMax=+mx.toFixed(1);R.dbMoy=n?+(moy/n).toFixed(1):null;
  R.ecran=(function(){const g=document.getElementById('garage');const on=[].map.call(document.querySelectorAll('.mScr.on,[id^="m"].on'),function(e){return e.id;}).filter(Boolean).slice(0,4);return {garage:g?g.className.replace(/\s+/g,' ').slice(0,80):null,body:document.body.className.slice(0,80),on:on};})();
  try{R.jouer=dbgJouer&&(function(){return null;})();}catch(e){}
  return JSON.stringify(R);})()`;
const MESURE = MESUREN(12), MESURE3 = MESUREN(3);
(async () => {
  for (const p of [P_HTTP, P_CDP]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  const prof = fs.mkdtempSync(path.join(A.prof || os.tmpdir(), 'banc-mg-prof-'));
  const srv = await serveur(JEU, P_HTTP), { ch, pg } = await lanceChrome(P_CDP, prof, W, H);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  let fini = false; const fin = () => { if (fini) return; fini = true; try { c.close(); } catch (e) {} try { srv.close(); } catch (e) {} tueChrome(ch); try { fs.rmSync(prof, { recursive: true, force: true }); } catch (e) {} };
  process.on('exit', fin); process.on('SIGINT', () => { fin(); process.exit(130); }); process.on('SIGTERM', () => { fin(); process.exit(143); });
  setTimeout(() => { console.error('passe trop longue : arrêt'); fin(); process.exit(3); }, 9 * 60000).unref();
  const exc = [], cons = [];
  c.ws.addEventListener('message', e => { try { const m = JSON.parse(e.data); if (m.method === 'Runtime.exceptionThrown') exc.push(JSON.stringify(m.params.exceptionDetails).slice(0, 300));
    if (m.method === 'Runtime.consoleAPICalled' && /lobby|pouce|musique|music/i.test(JSON.stringify(m.params.args))) cons.push(m.params.args.map(a => a.value || a.description || '').join(' ').slice(0, 200)); } catch (x) {} });
  const J = async (x, t) => { const v = await c.ev(x, t); return typeof v === 'string' ? JSON.parse(v) : v; };
  const touche = async (x, y, ms) => { await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] }); await dormir(ms || 60); await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); };
  const centre = sel => J(`JSON.stringify((function(){var L=Array.from(document.querySelectorAll(${JSON.stringify(sel)})).filter(function(e){var b=e.getBoundingClientRect();return b.width>2&&b.height>2&&getComputedStyle(e).visibility!=='hidden'&&b.top<innerHeight&&b.left<innerWidth&&b.bottom>0});if(!L.length)return null;var b=L[0].getBoundingClientRect();return [b.left+b.width/2,b.top+b.height/2]})())`);
  const appuie = async (sel, clic) => { const p = await centre(sel); if (p && !clic) { await touche(p[0], p[1]); return 'touche'; } const ok = await c.ev(`(function(){var e=document.querySelector(${JSON.stringify(sel)});if(!e)return 0;e.click();return 1})()`); return ok ? 'clic' : 'absent'; };
  const R = { jeu: JEU.split('/').slice(-2, -1)[0], save: A.save || 'riche', q: A.q || '', verrou: A.verrou === '1', chaud: A.chaud || '', natif: A.natif || '', etapes: [] };
  const note = async (nom, plus) => { const m = await J(MESURE, 30000); m.etape = nom; if (plus) m.plus = plus; m.joue = m.phase === 'lobby' && m.dbMax > -60; R.etapes.push(m); console.log(JSON.stringify(m)); return m; };
  try {
    await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Network.enable');
    await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
    await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 3, mobile: true, screenWidth: W, screenHeight: H, screenOrientation: { type: 'landscapePrimary', angle: 90 } });
    await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' });
    await c.send('Emulation.setEmulatedMedia', { features: [{ name: 'hover', value: 'none' }, { name: 'pointer', value: 'coarse' }] });
    await c.send('Page.addScriptToEvaluateOnNewDocument', { source: SONDE + 'try{if(!sessionStorage.getItem("__mg")){sessionStorage.setItem("__mg","1");localStorage.clear();localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAVE)) + ')}}catch(e){}' });
    const url = `http://127.0.0.1:${P_HTTP}/index.html?colonne=0&garde=1&attente=0&carte=nuages&pistegraine=7&tel=1&appareil=iPhone14,2` + (A.q ? '&' + A.q : '');
    await c.send('Page.navigate', { url });
    let pret = false; for (let i = 0; i < 600; i++) { await dormir(250); try { if (await c.ev("!!window.__gameReady&&typeof dbgJouer==='function'", 8000)) { pret = true; break; } } catch (e) {} }
    if (!pret) throw new Error('pas prêt');
    if (A.chaud) { try { R.chaudSim = await J(`JSON.stringify((function(){var o={};try{o.sim=dbgPiloteSim(${A.chaud === 'eco' ? '{E:1}' : '{t:2}'})?1:0;}catch(e){o.sim=String(e)}try{o.th=dbgThermique(${A.chaud === 'eco' ? 0 : 2});}catch(e){o.th=String(e)}return o})())`); } catch (e) { R.chaudSim = String(e); } }
    await dormir(1500);
    await c.ev("(function(){var s=document.getElementById('splash');if(!s)return 0;try{s.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));s.dispatchEvent(new PointerEvent('pointerup',{bubbles:true}));s.click();}catch(e){}return 1})()");
    await dormir(9000); /* l'intro (cinq « 1.61 », le logo) puis le ciel */
    await touche(422, 200); await dormir(3000); /* un toucher sur le ciel : la fin de l'intro, et le geste qui réveille l'audio sur iPhone */
    await note('ciel');
    const auGarage = () => c.ev("document.body.classList.contains('inGarage')&&!document.body.classList.contains('titreCiel')");
    const versGarage = async () => { for (let k = 0; k < 6; k++) { const r = await appuie('#mHome [data-m="garage"]', k >= 3); await dormir(4000); if (await auGarage()) return r + '/' + k; } return 'raté'; };
    R.porte = await versGarage(); await dormir(4000);
    await note('garage-froid');
    await dormir(REPOS * 1000); await note('garage-repos-' + REPOS + 's');
    /* la boutique 3D (BOUTIQUE en bas de l'atelier) puis retour */
    R.bq3d = await appuie('#gShopBas', true); await dormir(5000); await note('boutique3d');
    R.bq3dRet = await J(`JSON.stringify((function(){var L=['#gBqRet','#gBqFerme','[data-go="ret"]','#garage [data-go="back"]','#gBack','.gRetour'];for(var i=0;i<L.length;i++){var e=document.querySelector(L[i]);if(e&&e.getBoundingClientRect().width>0){e.click();return L[i];}}try{if(window.dbgBq)return 'dbgBq';}catch(e){}return null;})())`);
    if (!R.bq3dRet) { await c.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 }); await c.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 }); R.bq3dRet = 'Escape'; }
    await dormir(6000); await note('apres-boutique3d', R.bq3dRet);
    /* l'accueil, la BOUTIQUE (l'écran des caisses), l'accueil, le garage */
    try { await c.ev("window.__mGo&&window.__mGo('home');1"); } catch (e) {} await dormir(3000); await note('accueil');
    R.shop = await appuie('#mHome [data-m="shop"]'); await dormir(5000); await note('boutique');
    try { await c.ev("window.__mGo&&window.__mGo('home');1"); } catch (e) {} await dormir(2500);
    R.porte2 = await versGarage(); await dormir(4000); await note('garage-apres-boutique');
    if (A.armer === 'mort') { R.arme = await c.ev('(function(){if(!window.__rate)return 0;window.__rate.n=window.__rate.N;return window.__rate.n})()'); }
    if (A.course === '1') {
      /* (2e manche) LA VRAIE COURSE : JOUER touché au garage, puis la vraie mort (mains libres, la caisse tombe) */
      const serie = async (nom, n, pas) => { const L = []; for (let i = 0; i < n; i++) { const t0 = Date.now(); const m = await J(MESURE3, 30000); L.push([+(i * pas / 1000).toFixed(1), m.phase, m.dbMax]); const r = pas - (Date.now() - t0); if (r > 0) await dormir(r); }
        R.series = R.series || {}; R.series[nom] = L; console.log(JSON.stringify({ serie: nom, L })); return L; };
      await note('garage-avant-jouer');
      R.jouerBouton = await appuie('#gJouer'); await serie('jouer', 16, 600);
      let enCourse = false; for (let i = 0; i < 30 && !enCourse; i++) { try { enCourse = !!(await c.ev('!document.querySelector("#garage.on")&&!document.body.classList.contains("inGarage")')); } catch (e) {} if (!enCourse) await dormir(500); }
      R.enCourse = enCourse;
      try { await c.ev('dbgImmortel(true);dbgAuto(true,0,{vol:true,nit:1});1'); } catch (e) { R.autoErr = String(e); }
      await dormir(15000); await note('course-15s');
      try { await c.ev('dbgImmortel(false);dbgAuto(false);1'); } catch (e) { R.autoErr2 = String(e); }
      let mort = false; for (let i = 0; i < 80 && !mort; i++) { await dormir(500); try { mort = !!(await c.ev('(function(){var d=document.getElementById("mDead");return !!(d&&d.classList.contains("on"))||(function(){try{return dbgChance().gameOver}catch(e){return false}})()})()')); } catch (e) {} }
      R.mortVraie = mort; if (!mort) { try { await c.ev("dbgChance('mort');1"); } catch (e) {} R.mortForcee = true; }
      await serie('mort', 14, 600);
      /* l'offre de seconde chance (si elle est là) se refuse, comme un joueur qui ne la prend pas ; puis l'écran de mort */
      try { R.offre = await c.ev('(function(){try{return window.chanceRefuse()?1:0}catch(e){return String(e)}})()'); } catch (e) {}
      await dormir(2500); await note('ecran-mort');
      const versGarageMort = async () => { for (let k = 0; k < 6; k++) { const r = await appuie('#mDead [data-m="garage"], .mDuo [data-m="garage"]', k >= 3); await dormir(1500); if (await auGarage()) return r + '/' + k; } return 'raté'; };
      R.versGarage = await versGarageMort(); await serie('retour-garage', 16, 600);
      await dormir(2000); await note('garage-apres-mort', R.versGarage);
      await dormir(20000); await note('garage-apres-mort+20s');
    } else {
      /* une course, une mort, l'écran de mort, puis GARAGE */
      let enCourse = false;
      for (let essai = 0; essai < 3 && !enCourse; essai++) { try { await c.ev('dbgImmortel(false);dbgJouer();1'); } catch (e) {}
        for (let i = 0; i < 40; i++) { await dormir(500); try { if (await c.ev('!!(window.dbgEtat?1:1)&&document.body&&!document.querySelector("#garage.on")&&!document.querySelector("#mHome.on")')) { enCourse = true; break; } } catch (e) {} } }
      try { await c.ev('dbgImmortel(true);dbgAuto(true,0,{vol:true,nit:1});1'); } catch (e) {}
      await dormir(12000); await note('course');
      try { await c.ev('dbgImmortel(false);1'); await c.ev("dbgChance('mort');1"); } catch (e) { R.mortErr = String(e); }
      await dormir(7000); await note('ecran-mort');
      R.versGarage = await appuie('#mDead [data-m="garage"], .mDuo [data-m="garage"]'); await dormir(8000); await note('garage-apres-mort', R.versGarage);
      /* REJOUER une fois depuis l'écran de mort (le chemin le plus court) : course, mort, menu */
      await dormir(20000); await note('garage-apres-mort+20s');
    }
  } catch (e) { R.erreur = String(e && e.message || e); }
  try { R.pannes = await c.ev("(function(){try{return JSON.parse(localStorage.getItem('cashcarErr')||'[]').filter(function(e){return ['gel','serpent','profil','fluide','energie','chargement','pilote'].indexOf(e.g)<0}).map(function(e){return e.g+' '+String(e.k).slice(0,160)})}catch(e){return String(e)}})()"); } catch (e) {}
  try { R.pbEtat = await J("JSON.stringify((function(){try{var P=window.POUCE_JEU;return {phase:P.phase,err:P.err,E:P.E&&P.E.id,dernier:P.dernier&&P.dernier.id,att:P.attente&&P.attente.id}}catch(e){return String(e)}})())"); } catch (e) {}
  try { R.rate = await J('JSON.stringify(window.__rate?{reste:window.__rate.n,vus:window.__rate.vus}:null)'); } catch (e) {}
  try { R.boite = await c.ev("(function(){try{return JSON.parse(localStorage.getItem('cashcarErr')||'[]').filter(function(e){return e.g==='musique'&&/lobby/i.test(e.m)}).map(function(e){return e.m+' ×'+e.n})}catch(e){return String(e)}})()"); } catch (e) {}
  R.exc = exc; R.console = cons.slice(-30);
  R.resume = R.etapes.map(e => e.etape + ':' + (e.joue ? 'JOUE' : e.dbMax > -60 ? 'son' : 'muet') + '(' + e.phase + ',' + e.dbMax + ')').join(' | ');
  console.log('RESUME ' + JSON.stringify(R));
  fin(); process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
