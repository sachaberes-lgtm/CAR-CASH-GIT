// LE BANC DU ⏸ (2026-11-17, Sacha, build 119 : « Le bouton pause quand on est en jeu ne marche plus systématiquement »).
// Une vraie course en édition téléphone (?tel=1), muette, dans Chrome sans fenêtre avec le toucher émulé (CDP Input.dispatchTouchEvent).
// Pour chaque CAS, N appuis sur ⏸ ; on compte ceux qui mettent la partie en pause. Entre deux appuis, la partie est reprise à la main
// (feuilleFerme + togglePause, sans le 3-2-1) et on attend que la feuille soit partie.
// Il relève aussi ce qui est SOUS le doigt : elementFromPoint au centre et aux quatre coins du bouton, à chaque cas, et pendant la course.
//   node outils/banc-pause/pause.cjs [--n 50] [--w 390 --h 844] [--q sans=pausesure] [--cas seul,volant,...] [--http 9931 --cdp 9932]
// ⚠ Chrome n'est pas WebKit : il dit ce que fait NOTRE code (écouteurs, gardes, recouvrements) ; il ne dit pas quand iOS refuse de fabriquer un `click`.
const fs = require('fs'), path = require('path');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir, tmp } = require('../banc-trainees/cdp.cjs');

const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.resolve(A.jeu || path.join(__dirname, '..', '..', 'VERSION PRINCIPALE'));
const P_HTTP = +(A.http || 9931), P_CDP = +(A.cdp || 9932), N = +(A.n || 50);
let W = +(A.w || 390), H = +(A.h || 844);
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const SAVE = { v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, bank: 48500, aura: 1200, auraMax: 3000, owned: [0, 1, 2, 3], ex: { runs: 12 }, plq: { m: 'fr', x: 'CC-161-RZ', ok: 1 } };
const TOUS = ['fantome', 'seul', 'volant', 'volantLache', 'nitro', 'calme', 'saut', 'argent', 'retour', 'glisse', 'long', 'paysage', 'paysageVolant'];
const CAS = (A.cas ? A.cas.split(',') : TOUS);
const VERROU = '/private/tmp/cashcar-banc.lock/qui';
let rnd = 12345; const alea = () => (rnd = (rnd * 1103515245 + 12345) % 2147483648) / 2147483648; /* tirage rejouable */

(async () => {
  for (const p of [P_HTTP, P_CDP]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  const srv = await serveur(JEU, P_HTTP), prof = tmp();
  const erreurs = [], res = {};
  const { ch, pg } = await lanceChrome(P_CDP, prof, W, H);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  c.ws.addEventListener('message', e => { try { const m = JSON.parse(e.data); if (m.method === 'Runtime.exceptionThrown') erreurs.push((m.params.exceptionDetails.exception && m.params.exceptionDetails.exception.description || m.params.exceptionDetails.text || '?').slice(0, 300)); } catch (x) {} });
  const pas = (n) => c.ev('dbgStep(' + (n || 1) + ',16);1', 60000);
  const touch = (type, pts) => c.send('Input.dispatchTouchEvent', { type, touchPoints: pts });
  const taille = async (w, h) => { W = w; H = h; await c.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 2, mobile: true, screenWidth: w, screenHeight: h, screenOrientation: w > h ? { type: 'landscapePrimary', angle: 90 } : { type: 'portraitPrimary', angle: 0 } }); };
  const rafraichitVerrou = () => { try { const q = fs.readFileSync(VERROU, 'utf8').trim().split(' '); if (q[2] === 'pause') fs.writeFileSync(VERROU, q[0] + ' ' + Math.floor(Date.now() / 1000) + ' pause\n'); } catch (e) {} };
  const etat = () => c.ev("(function(){var s=dbgState(),p=document.getElementById('tPanel');return {st:s.started,go:s.gameOver,pa:s.paused,mode:s.mode,open:!!(p&&p.classList.contains('open')),calme:document.body.classList.contains('hudCalme')}})()");
  const rect = () => c.ev("(function(){var g=document.getElementById('tGear'),r=g.getBoundingClientRect(),cs=getComputedStyle(g);return {l:r.left,t:r.top,w:r.width,h:r.height,vis:cs.visibility,op:cs.opacity,pe:cs.pointerEvents}})()");
  /* ce qui est sous le doigt : centre, 4 coins (à 3 px du bord), et la zone élargie (6 px dehors, côté haut et côté droit) */
  const sous = () => c.ev(`(function(){var g=document.getElementById('tGear'),r=g.getBoundingClientRect(),o={};
    var nom=function(e){if(!e)return 'rien';if(e===g||g.contains(e))return 'tGear';var z=document.getElementById('tPauseZ');if(z&&(e===z||z.contains(e)))return 'zone';return (e.id?'#'+e.id:e.tagName.toLowerCase()+(e.className&&typeof e.className==='string'?'.'+e.className.split(' ')[0]:''));};
    var P={c:[r.left+r.width/2,r.top+r.height/2],hg:[r.left+3,r.top+3],hd:[r.right-3,r.top+3],bg:[r.left+3,r.bottom-3],bd:[r.right-3,r.bottom-3],hors_h:[r.left+r.width/2,r.top-6],hors_d:[r.right+6,r.top+r.height/2],hors_b:[r.left+r.width/2,r.bottom+6],hors_g:[r.left-6,r.top+r.height/2]};
    for(var k in P)o[k]=nom(document.elementFromPoint(P[k][0],P[k][1]));return o;})()`);
  const reprend = async () => { let fait = false;
    for (let i = 0; i < 40; i++) {
      const e = await etat();
      if (e.go || !e.st) return false;
      if (e.pa) fait = true, await c.ev("(function(){var p=document.getElementById('tPanel');p.classList.remove('open','sortant');dbgLumReprise();return 1})()");
      await dormir(60); await pas(1);
      const f = await etat(); if (!f.pa && !f.open) { if (fait) await dormir(380); return true; } /* le verrou du double-tap (uiGarde, 320 ms) que pose la feuille qui s'ouvre : un vrai joueur ne retape pas si vite */
    }
    return false;
  };
  const demarre = async () => {
    let enCourse = false;
    for (let essai = 0; essai < 3 && !enCourse; essai++) {
      try { await c.ev('dbgJouer()'); } catch (e) {}
      for (let i = 0; i < 50; i++) { await dormir(400); try { if (await c.ev("(function(){var s=dbgState();return !!(s.started&&s.running&&!s.gameOver)})()")) { enCourse = true; break; } } catch (e) {} }
    }
    if (!enCourse) throw new Error('la course ne part pas · ' + erreurs.slice(0, 3).join(' / '));
    await c.ev('dbgAuto(true,0,{vol:true,nit:1});1');
    for (let i = 0; i < 10; i++) { await pas(6); await dormir(40); }
  };
  const vivant = async () => { const e = await etat(); if (!e.st || e.go) { console.log('    (partie finie : on relance)'); await reprend(); await demarre(); } };
  /* un appui. o.volant : un pouce tenu sur le volant pendant l'appui ; o.lache : il se lève AVANT le doigt de ⏸ ; o.nitro : un doigt tenu sur NITRO ;
     o.dur : ms entre le contact et le lever ; o.glisse : px parcourus par le doigt de ⏸ avant de se lever ; o.alea : point au hasard dans le bouton */
  const appui = async (o) => {
    await vivant(); if (!(await reprend())) return null;
    await pas(2);
    const r = await rect();
    const x = r.l + r.w * (o.alea === false ? .5 : .15 + .7 * alea()), y = r.t + r.h * (o.alea === false ? .5 : .15 + .7 * alea());
    let tenu = null;
    if (o.volant || o.nitro) {
      const z = await c.ev(o.nitro ? "(function(){var e=document.getElementById('tNitroZone')||document.getElementById('tNitro'),b=e.getBoundingClientRect();return [b.left+b.width/2,b.top+b.height/2]})()"
        : "(function(){var e=document.getElementById('tSteer'),b=e.getBoundingClientRect();return [b.left+b.width*.35,b.top+b.height*.6]})()");
      tenu = { x: z[0], y: z[1], id: 1 };
      await touch('touchStart', [tenu]); await dormir(40);
      if (o.volant) { tenu = { x: z[0] + 18, y: z[1] - 4, id: 1 }; await touch('touchMove', [tenu]); }
      await pas(1);
    }
    let d = { x, y, id: 2 };
    if (o.fantome) { /* le doigt se pose JUSTE À CÔTÉ (sous ou à gauche, 6-14 px), puis glisse sur le bouton et s'y lève : jamais une pause */
      const sousB = alea() < .5, ec = 6 + alea() * 8; const p0 = sousB ? { x, y: r.t + r.h + ec, id: 2 } : { x: r.l - ec, y, id: 2 };
      await touch('touchStart', tenu ? [tenu, p0] : [p0]); await dormir(30);
      await touch('touchMove', tenu ? [tenu, d] : [d]);
    } else
    await touch('touchStart', tenu ? [tenu, d] : [d]);
    const dur = o.dur || (40 + Math.floor(alea() * 140));
    if (o.glisse) { await dormir(dur / 2); await touch('touchMove', tenu ? [tenu, { x: x - o.glisse * .6, y: y + o.glisse * .8, id: 2 }] : [{ x: x - o.glisse * .6, y: y + o.glisse * .8, id: 2 }]); await dormir(dur / 2); }
    else await dormir(dur);
    const fin = o.glisse ? { x: x - o.glisse * .6, y: y + o.glisse * .8, id: 2 } : d;
    if (tenu && o.lache) { await touch('touchEnd', [tenu]); await dormir(30); tenu = null; } /* le pouce du volant se lève en premier */
    await touch('touchEnd', [fin]); /* le doigt de ⏸ se lève (CDP : touchEnd porte les points qui se lèvent) ; le pouce, s'il reste, reste */
    await dormir(80); await pas(1); await dormir(40);
    const e = await etat();
    if (A.trace) console.log('     trace ' + JSON.stringify(await c.ev('JSON.stringify(__tl.splice(0))')) + ' → ' + (e.pa ? 'PAUSE' : 'rien'));
    if (tenu) { await touch('touchEnd', [tenu]); }
    return e.pa;
  };
  const serie = async (nom, o, avant) => {
    if (avant) await avant();
    await vivant(); await reprend(); await pas(2);
    const h = await sous(), r = await rect();
    let ok = 0, n = 0, rates = [];
    for (let i = 0; i < N; i++) {
      if (o.chaque) await o.chaque(i);
      const p = await appui(o); if (p === null) { i--; continue; }
      n++; if (p) ok++; else rates.push(i);
      if (i % 10 === 9) rafraichitVerrou();
    }
    res[nom] = { ok, n, taux: Math.round(100 * ok / n), sous: h, bouton: [Math.round(r.l), Math.round(r.t), Math.round(r.w), Math.round(r.h), r.vis, r.op, r.pe] };
    console.log(`  ${nom.padEnd(14)} ${String(ok).padStart(3)}/${n}  (${res[nom].taux} %)  bouton ${res[nom].bouton.join(' ')}  sous le doigt ${JSON.stringify(h)}` + (rates.length ? '  ratés n° ' + rates.slice(0, 12).join(',') : ''));
  };
  try {
    await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Network.enable');
    await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
    await taille(W, H);
    await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' });
    await c.send('Emulation.setEmulatedMedia', { features: [{ name: 'hover', value: 'none' }, { name: 'pointer', value: 'coarse' }] });
    await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAVE)) + ')}catch(e){}' });
    if (A.trace) await c.send('Page.addScriptToEvaluateOnNewDocument', { source: "window.__tl=[];['touchstart','touchend','touchcancel','click','pointerdown','pointerup','pointercancel'].forEach(function(t){addEventListener(t,function(e){var g=document.getElementById('tGear');if(g&&(e.target===g||g.contains(e.target)))__tl.push(t+(e.touches?':'+e.touches.length+'/'+e.changedTouches.length:'')+(e.pointerId!=null?':p'+e.pointerId:''));},true)})" });
    await c.send('Page.navigate', { url: `http://127.0.0.1:${P_HTTP}/index.html?colonne=0&tel=1&garde=1&intro=ancien&attente=0` + (A.q ? '&' + A.q : '') });
    let pret = false;
    for (let i = 0; i < 300; i++) { await dormir(500); try { if (await c.ev("!!window.__gameReady&&typeof dbgJouer==='function'", 8000)) { pret = true; break; } } catch (e) {} }
    if (!pret) throw new Error('le jeu ne démarre pas · ' + erreurs.slice(0, 3).join(' / '));
    await dormir(2000);
    await c.ev("(function(){var s=document.getElementById('splash');if(!s)return 0;try{s.click();}catch(e){}s.remove&&s.remove();return 1})()");
    await dormir(2000);
    await demarre();
    console.log('requête : ' + (A.q || '(rien)') + ' · ' + W + '×' + H + ' · ' + N + ' appuis par cas');
    /* LES RECOUVREMENTS EN COURSE : 400 relevés pendant que la partie roule (sauts, argent qui monte, annonces) */
    { const vu = {}; await c.ev('dbgAuto(true,0,{vol:true,nit:1,saut:160});1');
      for (let i = 0; i < 400; i++) { await pas(3); const h = await sous(); for (const k of ['c', 'hg', 'hd', 'bg', 'bd']) if (h[k] !== 'tGear') { const cle = k + ':' + h[k]; vu[cle] = (vu[cle] || 0) + 1; } if (i % 100 === 0) { await vivant(); rafraichitVerrou(); } }
      await c.ev('dbgAuto(true,0,{vol:true,nit:1});1');
      res.recouvrements = vu; console.log('  recouvrements en course (sur 400 relevés) : ' + (Object.keys(vu).length ? JSON.stringify(vu) : 'aucun')); }
    const ecouteurs = () => c.send('Runtime.evaluate', { expression: "(function(){var g=document.getElementById('tGear'),l=getEventListeners(g),w=getEventListeners(window),d=getEventListeners(document),n=function(o){var s=0;for(var k in o)s+=o[k].length;return s};return {gear:n(l),window:n(w),document:n(d),gearDetail:Object.keys(l).map(function(k){return k+':'+l[k].length}).join(' ')}})()", includeCommandLineAPI: true, returnByValue: true }).then(r => r.result.value);
    res.ecouteursAvant = await ecouteurs();
    for (const k of CAS) {
      if (k === 'seul') await serie(k, {});
      else if (k === 'volant') await serie(k, { volant: true });
      else if (k === 'volantLache') await serie(k, { volant: true, lache: true });
      else if (k === 'nitro') await serie(k, { nitro: true });
      else if (k === 'calme') await serie(k, { chaque: async () => { await c.ev('dbgAuto(true,0,{vol:true,nit:0});1'); for (let j = 0; j < 50; j++) { await dormir(80); await pas(1); if (await c.ev("document.body.classList.contains('hudCalme')")) break; } /* (2026-11-22) le calme tombe à 3 s (HUD_CALME_MS), plus 0,9 s */ } },
        null), await c.ev('dbgAuto(true,0,{vol:true,nit:1});1');
      else if (k === 'saut') await serie(k, { chaque: async () => { await c.ev('dbgAuto(true,0,{vol:true,nit:1,saut:60});1'); await pas(8 + Math.floor(alea() * 30)); } }), await c.ev('dbgAuto(true,0,{vol:true,nit:1});1');
      else if (k === 'argent') await serie(k, { chaque: async () => { await c.ev('dbgCash(987654321+Math.floor(Math.random()*1000));1'); await pas(3); } });
      else if (k === 'retour') await serie(k, {}, async () => {
        for (let j = 0; j < 3; j++) { /* arrière-plan (visibilitychange + `pause` de Capacitor), retour, puis l'écran couché et relevé */
          await c.ev("Object.defineProperty(document,'hidden',{configurable:true,get:function(){return true}});Object.defineProperty(document,'visibilityState',{configurable:true,get:function(){return 'hidden'}});document.dispatchEvent(new Event('visibilitychange',{bubbles:true}));document.dispatchEvent(new Event('pause'));1");
          await dormir(200);
          await c.ev("Object.defineProperty(document,'hidden',{configurable:true,get:function(){return false}});Object.defineProperty(document,'visibilityState',{configurable:true,get:function(){return 'visible'}});document.dispatchEvent(new Event('visibilitychange',{bubbles:true}));document.dispatchEvent(new Event('resume'));1");
          await dormir(200); await reprend();
          await taille(H, W); await c.ev("dispatchEvent(new Event('orientationchange'));dispatchEvent(new Event('resize'));1"); await dormir(300); await pas(2);
          await taille(H, W); await c.ev("dispatchEvent(new Event('orientationchange'));dispatchEvent(new Event('resize'));1"); await dormir(300); await pas(2);
        }
        res.ecouteursApresRetours = await ecouteurs(); console.log('  écouteurs avant/après 3 retours+pivots : ' + JSON.stringify(res.ecouteursAvant) + ' → ' + JSON.stringify(res.ecouteursApresRetours));
      });
      else if (k === 'fantome') await serie(k, { fantome: true });
      else if (k === 'glisse') await serie(k, { glisse: 9 });
      else if (k === 'long') await serie(k, { dur: 650 });
      else if (k === 'paysage' || k === 'paysageVolant') {
        if (W < H) { await taille(H, W); await c.ev("dispatchEvent(new Event('orientationchange'));dispatchEvent(new Event('resize'));1"); await dormir(400); await pas(3); }
        await serie(k, k === 'paysage' ? {} : { volant: true });
      }
    }
    if (erreurs.length) { console.log('exceptions : ' + erreurs.length); for (const e of erreurs.slice(0, 6)) console.log('   ! ' + e); }
    if (A.json) fs.writeFileSync(A.json, JSON.stringify({ q: A.q || '', w: W, h: H, n: N, res, erreurs: erreurs.length }, null, 1));
  } catch (e) { console.log('ÉCHEC :', String(e).slice(0, 400)); } finally { try { c.close(); } catch (e) {} tueChrome(ch); srv.close(); }
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
