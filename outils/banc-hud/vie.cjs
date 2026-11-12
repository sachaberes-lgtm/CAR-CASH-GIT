// LA VIE DU HUD (2026-11-12, Sacha : « vérifie qu'il n'y a pas de bug sur tout le HUD ») — là où leger.cjs photographie des moments posés, ce banc fait VIVRE le HUD
// d'un bout à l'autre d'une partie et contrôle son état à chaque étape : HUD chargé, frénésie, MORT, RELANCE (rien ne doit rester de la partie d'avant), HUD calme,
// pause pendant le calme, reprise, puis de VRAIS TOUCHERS (Input.dispatchTouchEvent) : le volant, le nitro tenu puis glissé, le double-tap, l'anneau de vol autour du pouce.
// Chaque étape : ce qui doit se voir, ce qui ne doit plus se voir, une vérification dans la page, les chevauchements (controle de leger.cjs), et les erreurs de console.
//   node outils/banc-hud/vie.cjs --out /chemin --prof /chemin/profil [--mode tel|pc|clavier] [--lang fr|en] [--couche 1] [--http 9785 --cdp 9786] [--jeu …]
//   tel = téléphone (calme et écriture allégée) · pc = l'ordinateur qui joue l'édition téléphone (ni calme ni allègement) · clavier = ?pc=1
const fs = require('fs'), path = require('path');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir, tmp } = require('../banc-trainees/cdp.cjs');
const { SONDE, controle, UA, SAVE } = require('./leger.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.resolve(A.jeu || path.join(__dirname, '..', '..', 'VERSION PRINCIPALE')), OUT = path.resolve(A.out || path.join(__dirname, 'prises')), PROF = A.prof ? path.resolve(A.prof) : tmp();
const P_HTTP = +(A.http || 9785), P_CDP = +(A.cdp || 9786), MODE = A.mode || 'tel', LANGUE = A.lang || 'fr', TEL = MODE === 'tel';
const [W, H] = TEL ? (A.couche === '1' ? [844, 390] : [390, 844]) : [1280, 800], NOM = MODE + (A.couche === '1' ? '-couche' : '') + (LANGUE === 'en' ? '-en' : '');
const BASE = TEL || MODE === 'pc' ? ['tGear', 'nitroWrap', 'flowHud', 'cashHud', 'tNitro'] : ['nitroWrap'];
const SEC = LANGUE === 'en' ? '\\.' : ',';
const LIGNES = n => `(function(){var L=document.querySelectorAll('#pwrChip .pl');if(L.length!==${n})return 'lignes de pouvoir : '+L.length+' au lieu de ${n}';for(var i=0;i<L.length;i++){var b=L[i].querySelector('b').textContent,s=L[i].querySelector('s').style.transform;
  if(!/^\\d+${SEC}\\d$/.test(b))return 'secondes mal écrites : «'+b+'»';if(!/^scaleX\\(/.test(s))return 'barre sans transformation : «'+s+'»';var r=L[i].getBoundingClientRect(),rb=L[i].querySelector('b').getBoundingClientRect();if(rb.right>r.right+1||rb.left<r.left)return 'secondes hors de la ligne';}return ''})()`;
/* la pause : le ⏸ tactile (__panBascule) ou, en édition clavier, le ⏸ puis REPRENDRE du panneau */
const PAUSE = `(window.__panBascule?window.__panBascule():(document.getElementById('tPanel').classList.contains('open')?document.querySelector('#tPanel [data-a=close]').click():document.getElementById('tGear').click()))`;
const PAS_CALME = `(document.body.classList.contains('hudCalme')?'hudCalme encore posé':'')`;
/* les étapes : n nom · js · att attente (ms) · voit / pasVu · vide (seul le pause) · verif (expression → '' ou le problème) · sans (pas de contrôle des chevauchements : un autre écran est dessus) · op (action du banc) */
const ETAPES = [
  { n: '01-charge', js: "dbgAuto(true,0,{nit:1,vol:true});dbgPwr('n');dbgPwr('a');dbgPwr('v');dbgHud('flow',60);dbgHud('chaine',3);dbgLeFil('TONNEAU +45',1)", att: 1500, voit: BASE.concat('pwrChip'), verif: LIGNES(3) },
  { n: '02-frenesie', js: "dbgFren('v',100);dbgFren('entre')", att: 2500, voit: BASE },
  /* (2026-11-12, Sacha : « laisse la dark triad et le triple monstre ») frénésie + nitro lâché : le calme efface tout sauf le pause, l'emblème DARK TRIAD et le titre TRIPLE MONSTER */
  { n: '02b-frenesie-calme', js: 'dbgAuto(true,0,{nit:0,vol:true})', att: 1900, tel: { calmeFren: 1 }, autre: { voit: BASE },
    verif: `(document.getElementById('triade').classList.contains('on')?(document.body.classList.contains('hudCalme')||!${TEL}?'':'HUD calme pas posé pendant la frénésie'):'frénésie finie (non contrôlé)')` },
  { n: '03-mort', js: 'dbgBoom()', att: 3500, pasVu: ['nitroWrap', 'flowHud', 'pwrChip', 'tNitro'], sans: 1, verif: `(${PAS_CALME}||(dbgState().gameOver?'':'la caisse n\\'est pas morte'))` },
  { n: '04-relance', op: 'jouer', js: 'dbgAuto(true,0,{nit:1,vol:true})', att: 2500, voit: BASE, pasVu: ['pwrChip'], verif: `(${PAS_CALME}||(document.querySelectorAll('#pwrChip .pl').length?'des lignes de pouvoir restent de la partie d\\'avant':'')||(document.getElementById('flowHud').dataset.lv>0?'le flow n\\'est pas revenu à zéro : '+document.getElementById('flowHud').dataset.lv:''))` },
  { n: '05-lache', js: 'dbgAuto(true,0,{nit:0,vol:true})', att: 1900, tel: { vide: 1 }, autre: { voit: BASE } },
  { n: '05b-frenesie-pendant-le-calme', js: "dbgFren('v',100);dbgFren('entre')", att: 800, tel: { calmeFren: 1, titre: 1 }, autre: { voit: BASE } },
  { n: '06-pause', js: PAUSE, att: 1200, sans: 1, verif: `(${PAS_CALME}||(dbgState().paused?'':'la pause n\\'est pas prise'))` },
  { n: '07-reprise', js: PAUSE, op2: 'reprise', att: 0, voit: BASE, verif: `(dbgState().paused?'toujours en pause':'')` },
  { n: '08-reprise-calme', att: 2200, tel: { vide: 1 }, autre: { voit: BASE } },
  /* les vrais touchers (téléphone) */
  { n: '09-volant', tel1: 1, op: 'volant', att: 600, verif: `(document.getElementById('tSteer').classList.contains('used')?'':'le volant n\\'a pas pris le toucher')` },
  { n: '10-nitro-tenu', tel1: 1, op: 'nitro', att: 700, voit: BASE, verif: `(${PAS_CALME}||(dbgHudCalme().nitro?'':'le nitro ne part pas au toucher'))` },
  { n: '11-nitro-glisse', tel1: 1, op: 'glisse', att: 500, voit: BASE, verif: `(function(){var c=document.querySelector('#tNitro canvas'),g=dbgNitro3().glisse;if(!c.style.transform)return 'la flamme ne suit pas le doigt';if(g[2]==null)return 'le glissé est lâché alors que le doigt appuie';return ''})()` },
  { n: '12-nitro-lache', journal: 1, tel1: 1, op: 'lacheNitro', att: 1900, vide: 1, verif: `(dbgNitro3().glisse[2]!=null?'la flamme reste accrochée au doigt':'')` },
  { n: '13-double-tap', tel1: 1, op: 'doubleTap', att: 900, verif: `''` },
  { n: '14-fin-des-touchers', journal: 1, tel1: 1, op: 'lacheTout', att: 400, verif: `(function(){var g=dbgNitro3().glisse;return g[2]!=null||dbgHudCalme().nitro?'un toucher est resté pris':''})()` },
  /* LE VOL (en dernier : sans pilote la caisse quitte la route, et finit par exploser). Par défaut (ancien HUD) AUCUN temps de vol ne s'affiche — ni bloc AIR, ni anneau ; avec ?hud=d,
     l'anneau autour du pouce. Puis le vol devient CRITIQUE : par défaut le HUD calme tient (rien à montrer) ; avec ?hud=d il se rallume pour l'anneau. */
  { n: '15-vol', tel1: 1, op: 'vol', att: 1900, verif: `(function(){if(dbgState().mode!=='fall')return 'pas en vol (non contrôlé)';if(getComputedStyle(document.getElementById('airHud')).display!=='none')return 'le bloc AIR est revenu';
      var a=document.querySelector('#tKnob .skAir'),s=document.querySelector('#tKnob .skAirS'),d=document.documentElement.dataset.hud==='d';
      if(!d){if(a&&getComputedStyle(a).display!=='none')return 'un anneau de vol se voit sans ?hud=d';return document.body.classList.contains('hudCalme')?'':'HUD calme pas posé en vol';}
      if(!a)return 'pas d\\'anneau';if(getComputedStyle(a).display==='none')return 'anneau masqué en vol';if(!/^\\d+${SEC}\\d$/.test(s.textContent))return 'secondes de vol : «'+s.textContent+'»';
      var r=a.getBoundingClientRect(),n=document.getElementById('tNitro').getBoundingClientRect();if(r.right>n.left&&r.left<n.right&&r.bottom>n.top&&r.top<n.bottom)return 'l\\'anneau de vol chevauche le bouton nitro';return ''})()` },
  { n: '16-vol-critique', tel1: 1, op: 'urgent', att: 300, verif: `(function(){var k=document.getElementById('airHud').dataset.k;if(k!=='urgent')return 'vol pas critique (non contrôlé) : '+k+' · '+dbgState().mode;var c=document.body.classList.contains('hudCalme'),d=document.documentElement.dataset.hud==='d';
      if(!d&&!c)return 'le HUD se rallume en vol critique alors qu\\'aucun temps de vol ne s\\'affiche';if(d&&c)return 'avec ?hud=d le HUD reste effacé en vol critique (l\\'anneau ne se voit pas)';return ''})()` },
];
(async () => {
  for (const p of [P_HTTP, P_CDP]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  fs.mkdirSync(OUT, { recursive: true });
  const srv = await serveur(JEU, P_HTTP), { ch, pg } = await lanceChrome(P_CDP, PROF, W, H), c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  const erreurs = [], rapport = {}; let echecs = 0;
  c.ws.addEventListener('message', e => { try { const m = JSON.parse(e.data); if (m.method === 'Runtime.exceptionThrown') erreurs.push((m.params.exceptionDetails.exception && m.params.exceptionDetails.exception.description || m.params.exceptionDetails.text || '').slice(0, 300)); if (m.method === 'Runtime.consoleAPICalled' && (m.params.type === 'error' || m.params.type === 'warning')) erreurs.push(m.params.type + ': ' + m.params.args.map(a => a.value || a.description || '').join(' ').slice(0, 300)); } catch (_) {} });
  const photo = async (nom) => { const sh = await c.send('Page.captureScreenshot', { format: 'png' }, 30000); fs.writeFileSync(path.join(OUT, NOM + '-' + nom + '.png'), Buffer.from(sh.data, 'base64')); };
  const enCourse = async () => { try { return await c.ev("(function(){var s=dbgState();return !!(s.started&&s.running&&!s.gameOver)})()"); } catch (e) { return false; } };
  const jouer = async () => { for (let essai = 0; essai < 3; essai++) { try { await c.ev('dbgJouer();1'); } catch (e) {} for (let i = 0; i < 50; i++) { await dormir(500); if (await enCourse()) return true; } } return false; };
  /* les doigts : chaque événement redonne tous les points encore posés */
  const doigts = new Map(), touche = async (type) => c.send('Input.dispatchTouchEvent', { type, touchPoints: [...doigts.entries()].map(([id, p]) => ({ x: p[0], y: p[1], id, radiusX: 12, radiusY: 12, force: 1 })) });
  const pose = async (id, x, y) => { doigts.set(id, [x, y]); await touche('touchStart'); }, bouge = async (id, x, y) => { doigts.set(id, [x, y]); await touche('touchMove'); },
    leve = async (id) => { doigts.delete(id); if (doigts.size) await touche('touchMove'); else await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); }; /* CDP compare à l'événement d'avant : un point absent est levé */
  const centreNitro = async () => JSON.parse(await c.ev("(function(){var b=document.getElementById('tNitro').getBoundingClientRect();return JSON.stringify([Math.round(b.left+b.width/2),Math.round(b.top+b.height/2)])})()"));
  const OPS = {
    jouer: async () => { /* l'écran de série (1re mort du jour) s'ouvre sur l'écran de mort : un joueur le ferme avant de rejouer — dbgJouer, lui, relançait la course DESSOUS */
      for (let i = 0; i < 6; i++) { let r = ''; try { r = await c.ev("(function(){for(const id of ['mvW','serieW']){const e=document.getElementById(id);if(e&&e.classList.contains('on')&&!e.classList.contains('fin')){e.click();return id;}}return ''})()"); } catch (e) {} if (!r) break; await dormir(450); }
      if (!await jouer()) throw new Error('la relance ne part pas'); },
    volant: async () => { await pose(1, Math.round(W * .25), Math.round(H * .72)); await dormir(120); await bouge(1, Math.round(W * .25) + 24, Math.round(H * .72)); await dormir(250); await leve(1); }, /* un doigt à la fois : CDP ne sait pas lever UN doigt sur deux (un point absent d'un touchMove n'est pas levé) */
    nitro: async () => { const n = await centreNitro(); await pose(2, n[0], n[1]); },
    glisse: async () => { const n = await centreNitro(); for (let i = 1; i <= 6; i++) { await bouge(2, n[0] - 6 * i, n[1] - 4 * i); await dormir(40); } },
    vol: async () => { try { await c.ev('dbgAuto(true,0,{vol:true,saut:.3});1'); } catch (e) {} /* le pilote de test décolle (startFall) dès qu'il roule assez vite */ for (let i = 0; i < 60; i++) { { try { if (await c.ev("dbgState().mode==='fall'")) return; } catch (e) {} await dormir(500); } } },
    lacheNitro: async () => { await leve(2); },
    doubleTap: async () => { const n = await centreNitro(); for (let k = 0; k < 2; k++) { await pose(2, n[0], n[1]); await dormir(60); await leve(2); await dormir(90); } },
    lacheTout: async () => { if (!doigts.size) return; doigts.clear(); await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); },
    urgent: async () => { try { await c.ev('dbgAuto(false);1'); } catch (e) {} /* plus de pilote en l'air : le temps de vol s'épuise */ for (let i = 0; i < 60; i++) { try { if (await c.ev("document.getElementById('airHud').dataset.k==='urgent'||dbgState().mode!=='fall'")) return; } catch (e) {} await dormir(250); } },
  };
  try {
    await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Network.enable');
    await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
    await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: TEL ? 2 : 1, mobile: TEL, screenWidth: W, screenHeight: H });
    if (TEL) { await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 }); await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' });
      await c.send('Emulation.setEmulatedMedia', { features: [{ name: 'hover', value: 'none' }, { name: 'pointer', value: 'coarse' }] }); }
    await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAVE)) + ');localStorage.ccLang=' + JSON.stringify(LANGUE) + '}catch(e){}' });
    await c.send('Page.navigate', { url: `http://127.0.0.1:${P_HTTP}/index.html?colonne=0&garde=1&intro=ancien&attente=0` + (TEL ? '&tel=1' : MODE === 'clavier' ? '&pc=1' : '') + (A.q ? '&' + A.q : '') });
    let pret = false; for (let i = 0; i < 300; i++) { await dormir(500); try { if (await c.ev("!!window.__gameReady&&typeof dbgJouer==='function'", 8000)) { pret = true; break; } } catch (e) {} }
    if (!pret) throw new Error('le jeu ne démarre pas');
    await dormir(2500);
    await c.ev("(function(){var s=document.getElementById('splash');if(!s)return 0;try{s.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));s.dispatchEvent(new PointerEvent('pointerup',{bubbles:true}));s.click();}catch(e){}return 1})()");
    await dormir(2500);
    if (!await jouer()) { await photo('echec'); throw new Error('la course ne part pas'); }
    console.log(NOM, '· corps :', await c.ev("document.body.className.slice(0,120)+' | html '+document.documentElement.className.slice(0,80)+' | '+JSON.stringify(dbgHudCalme())"));
    await c.ev("window.__te=[];['touchstart','touchend','touchcancel'].forEach(function(t){document.addEventListener(t,function(e){window.__te.push(t+'['+[].map.call(e.changedTouches,function(x){return x.identifier+'@'+(x.target.id||x.target.className||x.target.tagName)}).join('|')+'] reste '+e.touches.length)},true)});1");
    await dormir(3500);
    for (const e0 of ETAPES) {
      if (e0.tel1 && !TEL) continue;
      const e = Object.assign({}, e0, TEL ? e0.tel : e0.autre); let ok = '';
      if (e.op) { try { await OPS[e.op](); } catch (x) { ok += ' op:' + String(x.message || x).slice(0, 160); } }
      if (e.js) { try { await c.ev(e.js + ';1'); } catch (x) { ok += ' js:' + x.message.slice(0, 160); } }
      if (e.op2 === 'reprise') { for (let i = 0; i < 60; i++) { await dormir(100); try { if (!(await c.ev('dbgState().paused'))) break; } catch (x) {} } } /* la reprise passe par le 3-2-1 : on attend qu'elle soit faite */
      await dormir(e.att);
      let s = null; try { s = JSON.parse(await c.ev(SONDE)); } catch (x) { ok += ' sonde:' + x.message.slice(0, 120); }
      let vTot = null; if (e.verif) { try { vTot = await c.ev(e.verif); } catch (x) { vTot = 'vérification en panne : ' + x.message.slice(0, 160); } }
      await photo(e.n); /* la sonde et la vérification AVANT la photo : une capture prend jusqu'à 0,6 s, et le calme tombe à 0,9 s */
      if (e.journal) { try { console.log('   touchers :', await c.ev("window.__te.splice(0).join('  ')")); } catch (x) {} }
      const pb = []; if (ok) pb.push(NOM + '-' + e.n + ' :' + ok);
      if (s) { const k = controle(s, NOM + '-' + e.n), vus = k.blocs;
        if (MODE === 'clavier') k.pb = k.pb.filter(p => !/ money se voit encore/.test(p)); /* l'édition clavier compte l'argent dans #money (pas de #cashHud) */
        if (!e.sans) { let dure = k.pb; if (dure.length) { await dormir(350); try { const s2 = JSON.parse(await c.ev(SONDE)), cle = p => p.replace(/ (se chevauchent|se voit|sort) .*$/, ''), d2 = controle(s2, NOM + '-' + e.n).pb.map(cle); dure = dure.filter(p => d2.indexOf(cle(p)) >= 0); } catch (x) {} } pb.push(...dure); }
        for (const b of e.voit || []) if (vus.indexOf(b) < 0) pb.push(NOM + '-' + e.n + ' : ' + b + ' devrait se voir');
        for (const b of e.pasVu || []) if (vus.indexOf(b) >= 0) pb.push(NOM + '-' + e.n + ' : ' + b + ' ne devrait plus se voir');
        if (e.calmeFren) { const ok9 = ['tGear', 'triade', 'frenChrono', 'frenTraits', 'frenTitre'], reste = vus.filter(b => ok9.indexOf(b) < 0); if (reste.length) pb.push(NOM + '-' + e.n + ' : frénésie au calme, il reste ' + reste.join(', '));
          for (const b of ['tGear', 'triade'].concat(e.titre ? ['frenTitre'] : [])) if (vus.indexOf(b) < 0) pb.push(NOM + '-' + e.n + ' : ' + b + ' devrait rester pendant le calme'); }
        if (e.vide) { const reste = vus.filter(b => ['tGear', 'triade', 'frenChrono', 'frenTraits', 'frenTitre'].indexOf(b) < 0); /* la frénésie reste au calme (Sacha) */ if (reste.length) { let et = ''; try { et = await c.ev("JSON.stringify({mode:dbgState().mode,vol:document.getElementById('airHud').dataset.k||'',calme:dbgHudCalme()})"); } catch (x) {} pb.push(NOM + '-' + e.n + ' : HUD calme, il reste ' + reste.join(', ') + ' — ' + et); } if (vus.indexOf('tGear') < 0) pb.push(NOM + '-' + e.n + ' : le bouton pause a disparu'); }
        rapport[e.n] = { vus, B: s.B, body: s.body }; }
      if (vTot) pb.push(NOM + '-' + e.n + ' : ' + vTot);
      if (!e.sans) { let ec = ''; try { ec = await c.ev("(function(){var L=[];['mvW','serieW','overlay','modale'].forEach(function(id){var e=document.getElementById(id);if(e&&getComputedStyle(e).display!=='none'&&(e.classList.contains('on')||id==='overlay')&&!e.classList.contains('fin')&&getComputedStyle(e).visibility!=='hidden'&&+getComputedStyle(e).opacity>.05){var r=e.getBoundingClientRect();if(r.width>innerWidth*.8&&r.height>innerHeight*.5)L.push(id)}});return L.join(',')})()"); } catch (x) {} if (ec && rapport[e.n] && /play/.test(rapport[e.n].body) && !/dead/.test(rapport[e.n].body)) pb.push(NOM + '-' + e.n + ' : un écran plein couvre la course : ' + ec); }
      echecs += pb.filter(p => !/non contrôlé/.test(p)).length; 
      console.log(NOM + '-' + e.n, pb.length ? '' : 'ok', '·', (rapport[e.n] ? rapport[e.n].vus : []).join(' ')); for (const p of pb) console.log('   ' + (/non contrôlé/.test(p) ? '~ ' : '✗ ') + p);
    }
  } catch (e) { console.log(NOM, 'ÉCHEC :', String(e).slice(0, 300)); echecs++; } finally { try { c.close(); } catch (e) {} tueChrome(ch); }
  if (erreurs.length) { console.log(NOM, 'console :', erreurs.length); for (const e of [...new Set(erreurs)].slice(0, 15)) console.log('   ! ' + e); echecs += erreurs.length; }
  rapport.erreurs = erreurs; fs.writeFileSync(path.join(OUT, 'vie-' + NOM + '.json'), JSON.stringify(rapport, null, 1));
  srv.close(); console.log(echecs ? echecs + ' PROBLÈME(S)' : 'TOUT EST BON'); process.exit(echecs ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
