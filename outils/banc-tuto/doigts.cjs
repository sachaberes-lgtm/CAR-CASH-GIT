// CONTRÔLE tuto-banc : la leçon jouée AU DOIGT (Input.dispatchTouchEvent), sans dbgTuto pour sauter.
// node pilote.cjs --w 390 --h 844 --scen main|pause|mort|recommencer|quitter [--gaucher 1] [--http 9961 --cdp 9962] [--tag x]
const fs = require('fs'), path = require('path');
const DEPOT = '/Users/sachaberes/cash-car/qualite';
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir, tmp } = require(DEPOT + '/outils/banc-trainees/cdp.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.join(DEPOT, 'VERSION PRINCIPALE');
const W = +(A.w || 390), H = +(A.h || 844), SCEN = A.scen || 'main';
const OUT = path.resolve(A.out || path.join(__dirname, 'prises')); fs.mkdirSync(OUT, { recursive: true });
const P_HTTP = +(A.http || 9961), P_CDP = +(A.cdp || 9962);
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const SAVE = { sfx: false, mus: false, vox: false }; if (A.gaucher) SAVE.gaucher = 1; if (A.glisse) SAVE.figG = 'glisse';
const TAG = (A.tag || SCEN) + '-' + (W > H ? 'couche' : 'debout') + (A.gaucher ? '-gau' : '');
const T0 = Date.now(); const log = (...a) => console.log(((Date.now() - T0) / 1000).toFixed(1).padStart(6) + ' ' + a.join(' '));

(async () => {
  for (const p of [P_HTTP, P_CDP]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  const srv = await serveur(JEU, P_HTTP), prof = tmp();
  const erreurs = [], warns = [];
  const { ch, pg } = await lanceChrome(P_CDP, prof, W, H);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  c.ws.addEventListener('message', e => { try { const m = JSON.parse(e.data);
    if (m.method === 'Runtime.exceptionThrown') erreurs.push('EXC ' + (m.params.exceptionDetails.exception && m.params.exceptionDetails.exception.description || m.params.exceptionDetails.text || '?').slice(0, 400));
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') erreurs.push('console.error : ' + (m.params.args || []).map(a => a.value || a.description || '').join(' ').slice(0, 300));
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'warning') warns.push((m.params.args || []).map(a => a.value || a.description || '').join(' ').slice(0, 200));
    if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error') (/navigator\.vibrate/.test(m.params.entry.text || '') ? warns : erreurs).push('LOG ' + (m.params.entry.text || '').slice(0, 200) + ' ' + (m.params.entry.url || '').slice(-60));
  } catch (x) {} });
  let nP = 0;
  const photo = async nom => { try { const sh = await c.send('Page.captureScreenshot', { format: 'png' }, 30000); const f = path.join(OUT, TAG + '-' + String(++nP).padStart(2, '0') + '-' + nom + '.png'); fs.writeFileSync(f, Buffer.from(sh.data, 'base64')); log('  [photo] ' + path.basename(f)); await mesure(nom); } catch (e) { log('photo ratée ' + e.message); } };

  const MES = `JSON.stringify((function(){
    function R(x){if(!x)return null;var r=x.getBoundingClientRect();if(r.width<2||r.height<2)return null;var o=1,v=true,p=x;while(p&&p.nodeType===1){var s=getComputedStyle(p);o*=+s.opacity;if(s.display==='none'||s.visibility==='hidden')v=false;p=p.parentElement;}return {l:Math.round(r.left),t:Math.round(r.top),r:Math.round(r.right),b:Math.round(r.bottom),o:+o.toFixed(2),v:v};}
    function U(sel){var a=document.querySelectorAll(sel),u=null;for(var i=0;i<a.length;i++){var q=R(a[i]);if(!q||!q.v||q.o<.05)continue;if(!u)u=q;else{u.l=Math.min(u.l,q.l);u.t=Math.min(u.t,q.t);u.r=Math.max(u.r,q.r);u.b=Math.max(u.b,q.b);u.o=Math.max(u.o,q.o);}}return u;}
    var o={};
    o.pouce=U('#ecole .e3Main>.e3Mvt:last-child .e3Doigt svg');o.prog=U('#ecole .e3Prog .e3Pp');o.rappel=U('#ecole .e3RMot .l,#ecole .e3RPh');o.carte=U('#ecole .e3Tuile,#ecole .e3Num,#ecole .e3Mot .l,#ecole .e3Ph');
    o.chev=U('#ecole .e3Chevs .e3C svg');o.jauge=U('#ecole .e3Jauge');o.x2=U('#ecole .e3X2');o.piste=U('#ecole .e3Piste .e3Rail,#ecole .e3Piste svg');o.fete=U('#ecole .e3Badge,#ecole .e3FMot .l,#ecole .e3FPh');
    o.nitro=U('#tNitro');o.pause=U('#tGear');o.jaugeHud=U('#nitroBar');o.hudNitroWrap=U('#nitroWrap');o.permis=U('#ecPermis .epTitre .l,#ecPermis .epCarte,#ecPermis .epPrime,#ecPermis .epSous');
    try{var d=dbgScene(),car=d.car,cam=d.cam,V=car.position.constructor,sp=dbgSpec(dbgState().level)||{w:2,l:4.4,h:1.4},cv=d.rdr.domElement.getBoundingClientRect(),b=null;car.updateMatrixWorld();
      for(var i=0;i<8;i++){var p=new V((i&1?1:-1)*sp.w/2,(i&2?sp.h:0),(i&4?1:-1)*sp.l/2).applyMatrix4(car.matrixWorld).project(cam);if(p.z>1)continue;var x=cv.left+(p.x+1)/2*cv.width,y=cv.top+(1-p.y)/2*cv.height;if(!b)b={l:x,t:y,r:x,b:y};else{b.l=Math.min(b.l,x);b.t=Math.min(b.t,y);b.r=Math.max(b.r,x);b.b=Math.max(b.b,y);}}
      if(b)o.caisse={l:Math.round(b.l),t:Math.round(b.t),r:Math.round(b.r),b:Math.round(b.b)};}catch(e){o.caisseErr=String(e&&e.message);}
    o.cls=(document.getElementById('ecole')||{}).className;o.ph=dbgTuto().ph;o.g=dbgTuto().g;o.body=document.body.className.split(' ').filter(function(c){return /calme|gaucher|coOn|coNitro/.test(c)}).join(' ');
    return o;})())`;
  const inter = (a, b) => { if (!a || !b) return 0; const w = Math.min(a.r, b.r) - Math.max(a.l, b.l), h = Math.min(a.b, b.b) - Math.max(a.t, b.t); return w > 0 && h > 0 ? w * h : 0; };
  const aire = a => a ? (a.r - a.l) * (a.b - a.t) : 0;
  const MESURES = [];
  const mesure = async nom => { try { const m = JSON.parse(await c.ev(MES)); const ch = [];
      const paires = [['pouce', 'caisse'], ['pouce', 'nitro'], ['pouce', 'rappel'], ['chev', 'carte'], ['chev', 'rappel'], ['chev', 'caisse'], ['chev', 'prog'], ['prog', 'pause'], ['prog', 'jaugeHud'], ['rappel', 'pause'], ['rappel', 'jaugeHud'], ['carte', 'pause'], ['carte', 'jaugeHud'], ['jauge', 'nitro'], ['jauge', 'caisse'], ['x2', 'nitro'], ['fete', 'pause'], ['permis', 'pause'], ['permis', 'jaugeHud'], ['permis', 'caisse'], ['piste', 'caisse'], ['carte', 'caisse'], ['rappel', 'caisse']];
      for (const [a, b] of paires) { const i = inter(m[a], m[b]); if (i > 0) ch.push(a + '×' + b + '=' + Math.round(100 * i / Math.min(aire(m[a]), aire(m[b]))) + '%'); }
      MESURES.push({ nom, m, ch }); const f = k => m[k] ? k + '[' + m[k].l + ',' + m[k].t + ' ' + m[k].r + ',' + m[k].b + (m[k].o != null && m[k].o < 1 ? ' o' + m[k].o : '') + ']' : '';
      log('  [mesure ' + nom + '] ' + ['pouce', 'caisse', 'chev', 'rappel', 'carte', 'prog', 'jauge', 'x2', 'nitro', 'pause', 'jaugeHud', 'permis'].map(f).filter(Boolean).join(' ') + ' | chevauche : ' + (ch.join(' ') || 'rien') + ' | ' + m.cls + ' | ' + m.body + (m.caisseErr ? ' ERR ' + m.caisseErr : '')); } catch (e) { log('mesure ratée ' + e.message); } };
  const ETAT = "JSON.stringify((function(){var t=dbgTuto(),s=dbgState(),e=document.getElementById('ecole');return {on:t.on,i:t.i,tuto:t.tuto,permis:t.permis,bank:t.bank,ph:t.ph,g:t.g,mode:s.mode,started:s.started,go:s.gameOver,paused:s.paused,steer:s.steer,lat:s.lat,hOff:s.hOff,latOff:s.latOff,fvy:s.fvy,vH:s.vH,fallT:s.fallT,nt:window.__nt,stk:(function(){var k=document.getElementById('tStick');if(!k)return '';var r=k.getBoundingClientRect();return Math.round(r.left+r.width/2)+','+Math.round(r.top+r.height/2)+'/'+getComputedStyle(k).opacity})(),nR:(function(){try{var q=dbgEco();return q.nitroR+(q.nitroOn?'*':'')}catch(x){return '?'}})(),cls:e?e.className:'absent'}})())";
  const etat = async () => JSON.parse(await c.ev(ETAT));
  const attends = async (f, ms, pas = 80) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { const e = await etat(); if (f(e)) return e; await dormir(pas); } return null; };
  /* ---------- LES DOIGTS ---------- */
  const doigts = new Map(); // id -> {x,y}
  /* CDP (mesuré, essai-touch.cjs) : chaque événement ne nomme QUE le doigt qui change — touchStart [lui], touchMove [lui], touchEnd [lui] */
  const pt = (id, p) => ({ x: Math.round(p.x), y: Math.round(p.y), id, radiusX: 12, radiusY: 12, force: 1 });
  const pose = async (id, x, y) => { doigts.set(id, { x, y }); await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [pt(id, { x, y })] }); };
  const bouge = async (id, x, y) => { if (!doigts.has(id)) return; doigts.set(id, { x, y }); await c.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [pt(id, { x, y })] }); };
  const leve = async (id) => { if (!doigts.has(id)) return; const p = doigts.get(id); doigts.delete(id); await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [pt(id, p)] }); };
  const glisse = async (id, x, y, ms = 120) => { const p = doigts.get(id), n = Math.max(2, Math.round(ms / 25)); const x0 = p.x, y0 = p.y; for (let k = 1; k <= n; k++) { await bouge(id, x0 + (x - x0) * k / n, y0 + (y - y0) * k / n); await dormir(ms / n); } };
  const tape = async (x, y, ms = 60) => { await pose(9, x, y); await dormir(ms); await leve(9); };
  const rect = async sel => JSON.parse(await c.ev("JSON.stringify((function(){var x=document.querySelector(" + JSON.stringify(sel) + ");if(!x)return null;var r=x.getBoundingClientRect(),s=getComputedStyle(x);return {x:r.left,y:r.top,w:r.width,h:r.height,cx:r.left+r.width/2,cy:r.top+r.height/2,op:s.opacity,vis:s.visibility,disp:s.display}})())"));
  const sous = async (x, y) => c.ev("(function(){var e=document.elementFromPoint(" + x + "," + y + ");return e?(e.id||e.className||e.tagName):'rien'})()");
  let ok = false; const bilan = {};
  try {
    await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Network.enable'); await c.send('Log.enable');
    await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
    await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 2, mobile: true, screenWidth: W, screenHeight: H });
    await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' });
    await c.send('Emulation.setEmulatedMedia', { features: [{ name: 'hover', value: 'none' }, { name: 'pointer', value: 'coarse' }] });
    await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{if(!sessionStorage.bancTuto){sessionStorage.bancTuto=1;localStorage.clear();localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAVE)) + ');localStorage.ccLang="fr";}}catch(e){}' });
    await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'window.__nt=0;["touchstart","touchend","touchcancel","touchmove"].forEach(function(t){addEventListener(t,function(e){window.__nt=e.touches.length;window.__ty=e.touches.length?Math.round(e.touches[0].clientY):-1;},true);});' });
    await c.send('Page.navigate', { url: `http://127.0.0.1:${P_HTTP}/index.html?colonne=0&tel=1&intro=ancien&attente=0` + (A.q ? '&' + A.q : '') });
    let pret = false;
    for (let i = 0; i < 300; i++) { await dormir(500); try { if (await c.ev("!!window.__gameReady&&typeof dbgJouer==='function'", 8000)) { pret = true; break; } } catch (e) {} }
    if (!pret) throw new Error('le jeu ne démarre pas · ' + erreurs.slice(0, 3).join(' / '));
    await dormir(2500);
    await c.ev("(function(){var s=document.getElementById('splash');if(!s)return 0;try{s.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));s.dispatchEvent(new PointerEvent('pointerup',{bubbles:true}));s.click();}catch(e){}s.remove&&s.remove();return 1})()");
    await dormir(3000);
    log('sauvegarde ' + await c.ev('JSON.stringify({tuto:dbgTuto().tuto,gau:document.body.classList.contains("gaucher"),save:localStorage.cashcarSave.slice(0,90)})'));
    const jouer = async () => { let enCourse = false;
      for (let essai = 0; essai < 3 && !enCourse; essai++) { try { log('JOUER ' + JSON.stringify(await c.ev('dbgJouer()'))); } catch (e) { log('JOUER erreur ' + e.message); }
        for (let i = 0; i < 60; i++) { await dormir(500); try { const e = await etat(); if (e.started && !e.go) { enCourse = true; break; } } catch (e) {} } }
      return enCourse; };
    if (!await jouer()) { await photo('echec'); throw new Error('la course ne part pas'); }
    let e = await etat(); log('course partie ' + JSON.stringify(e)); bilan.leconPart = e.on;
    /* les commandes à l'écran */
    const cmd = async () => { const S = await rect('#tSteer'), N = await rect('#tNitro'); return { S, N, sx: S.x + S.w * (A.gaucher ? (W > H ? .75 : .6) : (W > H ? .25 : .4)), sy: S.y + S.h * .7, nx: N.cx, ny: N.cy }; };
    let K = await cmd(); log('commandes ' + JSON.stringify(K)); log('sous le volant : ' + await sous(K.sx, K.sy) + ' · sous NITRO : ' + await sous(K.nx, K.ny));
    /* ---------- LES GESTES ---------- */
    let SG = 1; // signe : dx du pouce (px vers la droite) → steer
    const volant = { on: false };
    const vPose = async () => { if (volant.on) return; await pose(1, K.sx, K.sy); volant.on = true; };
    const vVa = async (dx, dy = 0) => { await vPose(); await bouge(1, K.sx + Math.max(-46, Math.min(46, dx)), K.sy + Math.max(-30, Math.min(40, dy))); };
    const vLeve = async () => { if (!volant.on) return; await leve(1); volant.on = false; };
    const nit = { on: false };
    const nOn = async () => { if (nit.on) return; await pose(2, K.nx, K.ny); nit.on = true; };
    const nOff = async () => { if (!nit.on) return; await leve(2); nit.on = false; };
    /* le pilote EN VOL : ramène latOff à 0 au pouce ; hauteur par NITRO (et le pouce en haut si on est sous la route) */
    let l0 = null, tl0 = 0, h0 = null;
    const volePas = async (x, opt) => { const now = Date.now(), dt = Math.max(.03, (now - tl0) / 1000); const dl = l0 == null ? 0 : Math.max(-60, Math.min(60, (x.latOff - l0) / dt)); const dh = h0 == null ? 0 : Math.max(-80, Math.min(80, (x.hOff - h0) / dt)); h0 = x.hOff; l0 = x.latOff; tl0 = now;
      const latT = opt.hT != null && x.hOff < 4 && !opt.droit ? (x.latOff < 0 ? -40 : 40) : 0; /* sous le niveau de la route : on reste À CÔTÉ (sinon on se pose sur le dessous de la dalle) */
      const cible = Math.max(-1, Math.min(1, (-(x.latOff - latT) * 1.2 - dl) / Math.max(20, x.vH) * 4)); // même loi que dbgAutoVol (en braquage)
      let dy = opt.dy || 0; if (opt.hT != null) { const vz = Math.max(-30, Math.min(40, (opt.hT - x.hOff) * 1.2)); dy = Math.max(-30, Math.min(36, -(vz - dh) * .8)); }
      if (opt.sansVolant) { await vLeve(); return cible; }
      await vVa(cible * 46 * SG, dy); return cible; };
    const tourne = async () => { /* 1 · TOURNE : glisser à gauche puis à droite */
      await vPose(); await dormir(120); await glisse(1, K.sx - 36, K.sy, 160); await dormir(260);
      let x = await etat(); log('  pouce à gauche (−40 px) : steer=' + x.steer + ' cls=' + x.cls); bilan.steerGauche = x.steer; bilan.clsGauche = x.cls; SG = x.steer < 0 ? 1 : -1;
      await photo('1-geste-pouce-gauche');
      await glisse(1, K.sx + 36, K.sy, 200);
      x = await attends(e => e.ph === 'bravo' || e.i > 0, 3000, 40); log('  pouce à droite : ' + JSON.stringify(x && { i: x.i, ph: x.ph, steer: x.steer })); await vLeve(); return !!x; };
    const nitro = async () => { await nOn(); await dormir(450); await photo('2-geste-tenu'); const x = await attends(e => e.i > 1 || e.ph === 'bravo', 4000, 50); await nOff(); return !!x; };
    const decolle = async (cote) => { /* 3 · DÉCOLLE : braquer à fond d'un côté jusqu'à quitter la route */
      await vVa(46 * cote); const x = await attends(e => e.i !== 2 || e.mode === 'fall', 9000, 40); log('  après le bord : ' + JSON.stringify(x && { i: x.i, ph: x.ph, mode: x.mode, lat: x.lat })); return x; };
    const suit = async (cond, ms, opt, nom) => { /* boucle de vol : jusqu'à cond(e) */
      const t0 = Date.now(); let x, n = 0; l0 = null;
      while (Date.now() - t0 < ms) { x = await etat(); if (cond(x)) return x;
        if (x.mode === 'fall') { const f = typeof opt === 'function' ? opt(x) : opt; if (f.nit) await nOn(); else await nOff(); const cb = await volePas(x, f);
          if (n++ % 4 === 0) log('    ' + nom + ' ' + JSON.stringify({ i: x.i, ph: x.ph, mode: x.mode, hOff: x.hOff, latOff: x.latOff, fvy: x.fvy, vH: x.vH, nit: x.nit, steer: x.steer, cible: +cb.toFixed(2) })); }
        else { if (n++ % 4 === 0) log('    ' + nom + ' ' + JSON.stringify({ i: x.i, ph: x.ph, mode: x.mode, lat: x.lat })); }
        await dormir(60); }
      return null; };
    bilan.etapes = [];
    const note = (k, v) => { bilan.etapes.push(k + ':' + v); log('== ' + k + ' : ' + v); };

    if (SCEN === 'main' || SCEN === 'mort') {
      await attends(e => e.ph === 'accueil' || e.ph === 'titre', 9000); await dormir(700); await photo('0-accueil');
      /* taper partout pendant l'accueil : rien ne doit le sauter */
      const tA = Date.now(); for (let k = 0; k < 6; k++) { await tape(W * .5, H * .4, 40); await dormir(60); } e = await etat(); note('accueil tapé 6 fois', 'ph=' + e.ph + ' i=' + e.i);
      await attends(e => e.ph === 'titre', 6000); await dormir(650); await photo('1-titre');
      for (let k = 0; k < 6; k++) { await tape(W * .5, H * .4, 40); await dormir(60); } e = await etat(); note('titre tapé 6 fois', 'ph=' + e.ph + ' i=' + e.i);
      await attends(e => e.ph === 'geste', 6000); await dormir(600); await photo('1-geste'); await dormir(500); await photo('1-geste-b');
      note('TOURNE', await tourne()); await dormir(260); await photo('1-bravo');
      await attends(e => e.i === 1 && e.ph === 'titre', 5000);
      if (A.pilote === 'obeissant') { /* NITRO pressé dès que la carte-titre le montre (le pouce y est déjà posé), tenu jusqu'au bravo */
        await dormir(350); const tA = Date.now(); await nOn(); let tG = 0, x, vu = 0; await dormir(350); await photo('2-titre-nitro-tenu');
        while (Date.now() - tA < 20000) { x = await etat(); if (!tG && x.ph === 'geste') { tG = Date.now(); log('    NITRO : le geste commence, réserve ' + x.nR); bilan.nitroReserveAuGeste = x.nR; } if (x.i > 1 || x.ph === 'bravo') break; if (tG && !vu && Date.now() - tG > 2500) { vu = 1; await photo('2-geste-nitro-a-sec'); } if (Date.now() % 600 < 70) log('    NITRO tenu : ' + JSON.stringify({ ph: x.ph, nR: x.nR, mode: x.mode })); await dormir(60); }
        await nOff(); bilan.nitroTenuDepuisCarte = { msDepuisAppui: Date.now() - tA, msDepuisGeste: tG ? Date.now() - tG : null, fini: x && (x.i > 1 || x.ph === 'bravo') }; note('NITRO tenu depuis la carte-titre', JSON.stringify(bilan.nitroTenuDepuisCarte));
      } else {
        await dormir(700); await photo('2-titre');
        await attends(e => e.ph === 'geste', 6000); await dormir(500); await photo('2-geste'); await dormir(400); await photo('2-geste-b');
        const tG = Date.now(); note('NITRO', await nitro()); bilan.nitroMsDepuisAppui = Date.now() - tG; }
      await dormir(260); await photo('2-bravo');
      /* boucle DÉCOLLE → VOLE → POSE (la leçon peut renvoyer en arrière) */
      let tours = 0, poseVraie = false, poseAccordee = false, prem = true; bilan.journal = [];
      /* lois de vol : TENIR (rester au-dessus de l'axe, vers 6 m) · POSER (lâcher NITRO dès qu'on est au-dessus du bitume, la reprendre si on passe sous la route à côté) · RIEN (le joueur lit) */
      const PIL = A.pilote || 'expert'; bilan.pilote = PIL;
      const GLISSE = x => ({ nit: false, hT: 9 }), GLISSE2 = x => ({ nit: x.hOff < 3, hT: 9 }), PLEIN = x => ({ nit: true, hT: 9 }), NITRO_SEUL = x => ({ nit: true, sansVolant: true }), RIEN = null;
      const POSER = x => Math.abs(x.latOff) < 18 && x.hOff > 0 ? { nit: false, hT: -3, droit: true } : { nit: x.hOff < 3, hT: 9 };
      const CARTE = PIL === 'expert' ? GLISSE : RIEN, CARTE_VOLE = PIL === 'expert' ? GLISSE : PIL === 'obeissant' ? NITRO_SEUL : RIEN, GESTE_VOLE = PIL === 'expert' ? PLEIN : NITRO_SEUL;
      const suis = async (cond, ms, loi, nom) => { const t0 = Date.now(); let x, n = 0; l0 = null; h0 = null;
        while (Date.now() - t0 < ms) { x = await etat(); if (cond(x)) return x;
          if (x.mode === 'fall' && loi) { const f = loi(x); if (f.nit) await nOn(); else await nOff(); await volePas(x, f); } else if (!loi || x.mode !== 'fall') { await vLeve(); await nOff(); }
          if (n++ % 5 === 0) log('    ' + nom + ' ' + JSON.stringify({ i: x.i, ph: x.ph, mode: x.mode, hOff: x.hOff, latOff: x.latOff, fvy: x.fvy, vH: x.vH, lat: x.lat, doigtNitro: nit.on, nR: x.nR, steer: x.steer, nt: x.nt + '/' + doigts.size, stk: x.stk }));
          await dormir(55); }
        return null; };
      const fige = k => prem ? photo(k) : Promise.resolve();
      while (tours++ < 7) {
        e = await etat(); if (e.i >= 5 || !e.on || e.go) break;
        log('--- tour ' + tours + ' : ' + JSON.stringify({ i: e.i, ph: e.ph, mode: e.mode }));
        if (e.i === 2) {
          if (e.ph !== 'geste') { await attends(e => e.i === 2 && (e.ph === 'titre' || e.ph === 'geste' || e.ph === 'rate'), 4000); await dormir(700); await fige('3-titre-ou-rate'); }
          await attends(e => e.ph === 'geste' && e.mode === 'drive', 8000); await dormir(500); await fige('3-geste'); await dormir(450); await fige('3-geste-b');
          const bd = await c.ev("(function(){var e=document.getElementById('ecole');return e&&e.classList.contains('bG')?-1:1})()");
          await vVa((PIL === 'expert' ? 22 : 46) * bd); /* le pouce part du côté montré par les chevrons */
          let x = await attends(e => e.i !== 2 || e.mode === 'fall', 9000, 40); bilan.journal.push('T' + tours + ' DÉCOLLE bord ' + bd + ' → ' + (x ? 'i=' + x.i + ' ' + x.mode + ' lat=' + x.lat : 'rien'));
          await fige('3-bravo');
        }
        e = await etat();
        if (e.i === 3) {
          if (SCEN === 'mort' && tours === 1) { await vLeve(); await nOff(); const t0 = Date.now(); let vu = {};
            while (Date.now() - t0 < 30000) { const x = await etat(); const k = x.i + '/' + x.ph + '/' + x.mode + '/' + x.go; if (!vu[k]) { vu[k] = 1; log('    mort : ' + JSON.stringify({ i: x.i, ph: x.ph, mode: x.mode, go: x.go, on: x.on, hOff: x.hOff, t: Date.now() - t0 })); if (x.ph === 'rate' || x.mode === 'boom') { await dormir(350); await photo('mort-' + x.ph + '-' + x.mode); } } if (x.i === 2 && x.ph === 'geste' && x.mode === 'drive' && Date.now() - t0 > 3000) break; if (x.go) break; await dormir(80); }
            e = await etat(); note('mort pendant la leçon', JSON.stringify({ i: e.i, ph: e.ph, mode: e.mode, go: e.go, on: e.on })); if (e.go || !e.on) break; prem = false; continue; }
          /* (2026-11-22) bravo de DÉCOLLE (0,95 s en vol), puis le geste VOLE tout de suite : une étape atteinte en vol n'a plus de carte-titre */
          let x = await suis(e => e.i !== 3 || e.ph === 'titre' || e.ph === 'geste', 4000, CARTE, 'bravo3'); if (x && x.ph === 'titre') { await dormir(350); await fige('4-titre'); }
          x = await suis(e => e.i !== 3 || e.ph === 'geste', 5000, CARTE_VOLE, 'titre4'); await fige('4-geste');
          { const q = x && { i: x.i, ph: x.ph, mode: x.mode, hOff: x.hOff, latOff: x.latOff, fvy: x.fvy, nR: x.nR }; log('  VOLE, le geste commence : ' + JSON.stringify(q)); bilan.journal.push('T' + tours + ' VOLE entrée du geste ' + JSON.stringify(q)); }
          let pris = false; x = await suis(e => { if (!pris && nit.on) { pris = true; fige('4-geste-tenu'); } return e.i !== 3 || e.ph === 'bravo' || e.ph === 'rate'; }, 8000, GESTE_VOLE, 'vole');
          bilan.journal.push('T' + tours + ' VOLE → ' + (x ? 'i=' + x.i + ' ph=' + x.ph + ' ' + x.mode + ' hOff=' + x.hOff : 'rien')); await fige('4-bravo');
        }
        e = await etat();
        if (e.i === 4) {
          let x = await suis(e => e.i !== 4 || e.ph === 'titre' || e.ph === 'geste', 4000, PIL === 'expert' ? GLISSE2 : RIEN, 'bravo4'); if (x && x.ph === 'titre') { await dormir(350); await fige('5-titre'); }
          x = await suis(e => e.i !== 4 || e.ph === 'geste', 5000, PIL === 'expert' ? GLISSE2 : RIEN, 'titre5');
          const entree = x && { i: x.i, ph: x.ph, mode: x.mode, hOff: x.hOff, latOff: x.latOff, fvy: x.fvy }; log('  POSE-TOI, le geste commence : ' + JSON.stringify(entree));
          await fige('5-geste'); const t0 = Date.now(); let nph = 0, enVol = 0;
          x = await suis(e => { if (e.mode === 'fall' && e.i === 4) enVol = Date.now() - t0; if (prem && e.i === 4 && Date.now() - t0 > 700 * (nph + 1) && nph < 3) { nph++; photo('5-geste-vol' + nph); } return e.i !== 4 || e.ph === 'bravo' || e.ph === 'rate'; }, 14000, POSER, 'pose');
          e = await etat(); const r = { i: e.i, ph: e.ph, mode: e.mode, entree: entree, volDansLeGeste: enVol, ms: Date.now() - t0 }; bilan.journal.push('T' + tours + ' POSE-TOI → ' + JSON.stringify(r));
          if (e.i === 5) { poseVraie = e.mode === 'drive' && entree && entree.mode === 'fall' && entree.ph === 'geste' && r.ms < 8800; poseAccordee = !poseVraie && r.ms >= 8800; bilan.pose = r; await photo('5-bravo'); await vLeve(); await nOff(); break; }
          await photo('5-rate');
        }
        await vLeve(); await nOff(); prem = false;
      }
      bilan.poseAccordee = poseAccordee;
      bilan.poseVraie = poseVraie; bilan.toursPose = tours;
      e = await etat();
      if (e.on && e.i === 5) {
        await attends(e => e.i === 5 && e.ph === 'titre', 6000); await dormir(700); await photo('6-titre');
        await attends(e => e.ph === 'geste', 6000); await dormir(500); await photo('6-geste'); await dormir(400); await photo('6-geste-b');
        K = await cmd();
        for (let k = 0; k < 5 && (e = await etat()).i === 5 && e.on; k++) {
          if (A.glisse) { await pose(2, K.nx, K.ny); await dormir(80); await glisse(2, K.nx - 90, K.ny, 90); await leve(2); }
          else { await tape(K.nx, K.ny, 55); await dormir(90); await tape(K.nx, K.ny, 55); }
          const x = await attends(e => e.i > 5 || !e.on, 5000, 60); log('  figure essai ' + k + ' : ' + JSON.stringify(x && { i: x.i, ph: x.ph, mode: x.mode })); await dormir(300); }
        e = await etat(); note('FIGURE', 'i=' + e.i + ' on=' + e.on + ' ph=' + e.ph); await photo('6-bravo');
        const fin = await attends(e => !e.on, 15000, 100); log('fin : ' + JSON.stringify(fin));
        for (const t of [450, 600, 700, 900, 900]) { await dormir(t); await photo('permis'); }
        await dormir(2500); await photo('apres');
        const reste = await c.ev("JSON.stringify({ecole:!!document.getElementById('ecole'),permis:!!document.getElementById('ecPermis'),anims:document.getAnimations().filter(a=>{var t=a.effect&&a.effect.target;return t&&t.closest&&t.closest('#ecole,#ecPermis');}).length})");
        e = await etat(); note('après la leçon', reste + ' tuto=' + e.tuto + ' permis=' + e.permis + ' bank=' + e.bank + ' go=' + e.go);
        ok = e.tuto === 1 && e.permis === 1;
      }
    }

    if (SCEN === 'pause' || SCEN === 'recommencer' || SCEN === 'quitter') {
      await attends(e => e.ph === 'geste', 14000); await dormir(400);
      /* la pause EN PLEIN GESTE : le pouce à gauche (un seul côté validé), puis le bouton pause AU DOIGT */
      await vPose(); await glisse(1, K.sx - 40, K.sy, 150); await dormir(300);
      e = await etat(); log('pouce à gauche tenu : ' + JSON.stringify({ i: e.i, ph: e.ph, steer: e.steer, cls: e.cls }));
      const B = JSON.parse(await c.ev("JSON.stringify(['#tGear','#tSet','#pauseBtn','#btnPause','#hudPause'].map(function(s){var x=document.querySelector(s);if(!x)return null;var r=x.getBoundingClientRect();return {s:s,cx:r.left+r.width/2,cy:r.top+r.height/2,w:r.width,h:r.height,vis:getComputedStyle(x).visibility,disp:getComputedStyle(x).display}}).filter(Boolean))"));
      log('boutons pause : ' + JSON.stringify(B));
      const b = B.find(x => x.w > 4 && x.disp !== 'none'); if (!b) throw new Error('pas de bouton pause');
      await photo('avant-pause');
      await tape(b.cx, b.cy, 70); await dormir(900);
      e = await etat(); const vu = await c.ev("(function(){var e=document.getElementById('ecole');return e?getComputedStyle(e).visibility+'/'+getComputedStyle(e).opacity+'/'+getComputedStyle(e).display:'absent'})()");
      note('pause au doigt (pouce du volant encore posé)', JSON.stringify({ paused: e.paused, i: e.i, ph: e.ph, calque: vu })); await photo('pause');
      if (!e.paused) { log('  la pause ne s\'ouvre pas au doigt'); }
      if (SCEN === 'pause') {
        await dormir(3000); e = await etat(); note('3 s de pause', JSON.stringify({ i: e.i, ph: e.ph, paused: e.paused }));
        await vLeve();
        /* REPRENDRE au doigt */
        const R = JSON.parse(await c.ev("JSON.stringify([].slice.call(document.querySelectorAll('button,[role=button],.pbtn,.tbtn,.tp')).map(function(x){var r=x.getBoundingClientRect();return {t:(x.textContent||'').trim().slice(0,28),id:x.id,cx:r.left+r.width/2,cy:r.top+r.height/2,w:r.width,h:r.height,v:getComputedStyle(x).visibility}}).filter(function(x){return x.w>20&&x.h>14&&x.v!=='hidden'&&x.cy>0&&x.cy<innerHeight&&x.cx>0&&x.cx<innerWidth}))"));
        log('boutons visibles : ' + JSON.stringify(R.map(x => x.t + '#' + x.id)));
        const rp = R.find(x => /REPRENDRE|RESUME/i.test(x.t)); if (rp) { log('REPRENDRE sous le doigt : ' + await sous(rp.cx, rp.cy)); await tape(rp.cx, rp.cy, 70); } else log('pas de REPRENDRE trouvé');
        await dormir(600); await photo('reprise-decompte');
        const x = await attends(e => !e.paused, 8000); await dormir(700); e = await etat(); note('reprise', JSON.stringify({ paused: e.paused, i: e.i, ph: e.ph, cls: e.cls, steer: e.steer })); await photo('reprise');
        /* le geste se finit-il après la pause ? */
        note('TOURNE après la pause', await tourne());
        ok = true;
      } else {
        await vLeve();
        const R = JSON.parse(await c.ev("JSON.stringify([].slice.call(document.querySelectorAll('button,[role=button],.pbtn,.tbtn,.tp')).map(function(x){var r=x.getBoundingClientRect();return {t:(x.textContent||'').trim().slice(0,28),id:x.id,cx:r.left+r.width/2,cy:r.top+r.height/2,w:r.width,h:r.height,v:getComputedStyle(x).visibility}}).filter(function(x){return x.w>20&&x.h>14&&x.v!=='hidden'&&x.cy>0&&x.cy<innerHeight&&x.cx>0&&x.cx<innerWidth}))"));
        log('boutons visibles : ' + JSON.stringify(R.map(x => x.t + '#' + x.id)));
        const re = SCEN === 'recommencer' ? /RECOMMENCER|RESTART/i : /QUITTER|QUIT/i;
        const bt = R.find(x => re.test(x.t)); if (!bt) throw new Error('bouton introuvable : ' + re);
        log(SCEN + ' sous le doigt : ' + await sous(bt.cx, bt.cy)); await tape(bt.cx, bt.cy, 70); await dormir(700); await photo(SCEN + '-1');
        /* une confirmation ? */
        const R2 = JSON.parse(await c.ev("JSON.stringify([].slice.call(document.querySelectorAll('button,[role=button],.pbtn,.tbtn,.tp')).map(function(x){var r=x.getBoundingClientRect();return {t:(x.textContent||'').trim().slice(0,28),id:x.id,cx:r.left+r.width/2,cy:r.top+r.height/2,w:r.width,h:r.height,v:getComputedStyle(x).visibility}}).filter(function(x){return x.w>20&&x.h>14&&x.v!=='hidden'&&x.cy>0&&x.cy<innerHeight&&x.cx>0&&x.cx<innerWidth}))"));
        log('après : ' + JSON.stringify(R2.map(x => x.t + '#' + x.id))); await photo(SCEN + '-confirmation');
        { const cf = R2.find(x => re.test(x.t)); if (cf && R2.length <= 3) { log('confirmation sous le doigt : ' + await sous(cf.cx, cf.cy)); await tape(cf.cx, cf.cy, 70); await dormir(500); } }
        e = await etat(); log('état : ' + JSON.stringify({ on: e.on, i: e.i, ph: e.ph, paused: e.paused, started: e.started, go: e.go, tuto: e.tuto }));
        if (SCEN === 'recommencer') {
          const t0 = Date.now(), vu = {}; while (Date.now() - t0 < 14000) { const x = await etat(); const k = x.on + '/' + x.i + '/' + x.ph + '/' + x.started + '/' + x.paused; if (!vu[k]) { vu[k] = 1; log('    ' + JSON.stringify({ on: x.on, i: x.i, ph: x.ph, started: x.started, paused: x.paused, go: x.go, t: Date.now() - t0 })); if (x.ph === 'accueil') { await dormir(500); await photo('recommencer-accueil'); } } if (x.ph === 'geste' && Date.now() - t0 > 3000) break; await dormir(80); }
          e = await etat(); note('RECOMMENCER', JSON.stringify({ on: e.on, i: e.i, ph: e.ph, cls: e.cls, tuto: e.tuto })); await photo('recommencer-geste');
          note('TOURNE après RECOMMENCER', await tourne()); ok = true;
        } else {
          await dormir(2500); e = await etat(); note('QUITTER', JSON.stringify({ on: e.on, tuto: e.tuto, started: e.started, go: e.go, ecole: e.cls })); await photo('quitter-2');
          const sv = await c.ev("(function(){try{return JSON.parse(localStorage.cashcarSave).tuto}catch(e){return 'x'}})()"); note('sauvegarde.tuto après QUITTER', String(sv));
          /* rejouer, d'abord tel quel, puis après un rechargement de page */
          const j = await jouer(); e = await etat(); log('rejouer : ' + JSON.stringify(e));
          const x = await attends(e => e.on && (e.ph === 'accueil' || e.ph === 'titre'), 10000); note('rejouer après QUITTER', JSON.stringify(x && { on: x.on, i: x.i, ph: x.ph })); await dormir(500); await photo('quitter-rejouer');
          await attends(e => e.ph === 'geste', 9000); K = await cmd(); note('TOURNE après QUITTER', await tourne());
          await c.send('Page.reload'); pret = false; for (let i = 0; i < 200; i++) { await dormir(500); try { if (await c.ev("!!window.__gameReady&&typeof dbgJouer==='function'", 8000)) { pret = true; break; } } catch (e) {} }
          await dormir(2500); await c.ev("(function(){var s=document.getElementById('splash');if(s&&s.remove)s.remove();return 1})()"); await dormir(2500);
          await jouer(); const y = await attends(e => e.on && (e.ph === 'accueil' || e.ph === 'titre'), 10000); note('après rechargement (appli fermée en pleine leçon)', JSON.stringify(y && { on: y.on, i: y.i, ph: y.ph, tuto: y.tuto })); await photo('recharge');
          ok = !!x && !!y;
        }
      }
    }
  } catch (x) { console.error('ÉCHEC : ' + x.message); try { await photo('echec'); } catch (e) {} }
  finally {
    console.log('BILAN ' + JSON.stringify(bilan, null, 1));
    console.log(erreurs.length ? 'EXCEPTIONS ' + erreurs.length + '\n  ' + erreurs.slice(0, 12).join('\n  ') : '0 exception');
    if (warns.length) console.log('avertissements ' + warns.length + ' : ' + [...new Set(warns)].slice(0, 6).join(' | '));
    console.log(ok ? 'OK' : 'PAS OK');
    c.close(); tueChrome(ch); srv.close(); process.exitCode = ok && !erreurs.length ? 0 : 1;
  }
})();
