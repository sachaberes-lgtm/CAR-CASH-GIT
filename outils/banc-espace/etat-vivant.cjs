/* RÔLE « etat » (2026-11-18, espace-debug) — LE CHEMIN DU JOUEUR VERS L'ESPACE, EXÉCUTÉ DANS LE VRAI JEU (Chrome sans fenêtre, muet, téléphone émulé tel=1).
   Une course SANS ?pistegraine (le sac des routes uniques n'est PAS figé, comme chez le joueur), ?routeverif=1. On entre dans l'espace PAR UN PORTAIL, route
   pré-bâtie par tranches pendant qu'on roule sur une autre map, au 1er, 2e, 3e, 4e passage, avec Jade / ville / nuages entre deux.
   À chaque arrivée dans l'espace, une copie d'index.html servie à la volée porte un CROCHET (window.__etat, rien d'autre ne change) qui relève tout ce que le joueur subit :
   la route installée (son empreinte, comparée par le jeu à la même bâtie d'un trait aux mêmes entrées : dbgRouteVerif, route ET marques), les marques (MODMARK), les tronçons
   (MODS), le plan (OU.der : ouverture, fin, journal), le relief lu par pisteTord (ORB5.prof), le voyage (VOY) et le décor des géants (VOY_D, GEANTS) — posé sur CETTE route ? —,
   les pièces (à quelle distance de la route qu'elles annoncent), puis ~N s de conduite au pilote (dbgAuto) : mode, chute, caméra sous la dalle, roulis de l'horizon (°/s).
   node outils/banc-espace/etat-vivant.cjs --out x.json [--q "sans=uniques"] [--bride 2] [--suite espace,jade,espace,ville,espace,nuages,espace] [--roule 20] [--vite 3]
   (--vite k : avant le k-ième espace, le moteur monte de 12 paliers et le portail est pris en roulant)  Sous ~/cash-car/verrou-banc.sh. */
const fs = require('fs'), path = require('path'), http = require('http');
const { portLibre, lanceChrome, tueChrome, CDP, dormir, tmp } = require('../banc-trainees/cdp.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const RACINE = path.resolve(__dirname, '..', '..'), DIR = path.join(RACINE, 'VERSION PRINCIPALE'), OUT = path.resolve(A.out || 'etat-vivant.json'), Q = A.q || '', BRIDE = +(A.bride || 2);
const SUITE = (A.suite || 'espace,jade,espace,ville,espace,nuages,espace').split(','), ROULE = +(A.roule || 20), VITE = +(A.vite || 3);
const R = { q: Q, bride: BRIDE, suite: SUITE, passages: [], exc: [], con: [], debut: new Date().toISOString() };
const ecrit = () => fs.writeFileSync(OUT, JSON.stringify(R, null, 1));
const CROCHET = `window.__etat={rel:function(){const o={};try{
  o.carte=LVL.cur?(LVL.cur.carte||LVL.cur.id):null;o.L=Math.round(L);o.NP=NP;o.eng=engTier;o.zones=runStats.zones|0;o.half=ROAD_HALF;o.route=rvHache(pts,T,Nn,B,L,NP,MODMARK);
  o.marks=MODMARK.map(function(m){return [m.i0,m.i1,m.fig||null,m.climax?1:0];});
  o.mods=MODS.map(function(m){return {fig:m.fig,cx:m.climax?1:0,s0:Math.round(m.s0+60),s1:Math.round(m.s1),nu:m.nu?m.nu.map(function(q){return (q.t||'')+':'+(q.k||q.g||'')+'@'+Math.round(q.s);}):null};});
  const D=OU.der;o.der=D?{ouv:D.ouv,fin:D.fin,rel:D.rel,sil:D.sil,cx:D.cx,court:D.court,joues:(D.joues||[]).slice(),lon:D.lon,LEN:D.LEN,cxRate:D.cxRate|0}:null;
  o.prof=ORB5.prof?{u:ORB5.prof.u.length,m0:+ORB5.prof.m[0].toFixed(3),s0U:ORB5.s0U}:null;
  o.voy=VOY?{cle:VOY.cle,sil:VOY.sil&&VOY.sil.f,cxG:VOY.cxG,fortG:VOY.fortG}:null;o.vo=ORB_PIOCHE.vo?ORB_PIOCHE.vo.cle:null;
  o.decor={jante:!!VOY_D.jante,roc:!!VOY_D.roc,neb:VOY_D.neb?1:0,zonesSaut:VOY_D.zonesSaut.map(function(z){return z.map(Math.round);}),zonesPente:VOY_D.zonesPente.map(function(z){return z.map(Math.round);}),err:VOY_D.err,info:VOY_D.info.slice(0,8)};
  /* le décor des géants contre la route : chaque géant des tronçons a-t-il son décor ? le nuage de la nébuleuse est-il près de la route à son cœur ? */
  const ge=[];for(const m of MODS){if(!m.nu||!m.nu.length||m.nu[0].t!=='voy')continue;const k=m.nu[0].k,sm=m.nu[1]?m.nu[1].s:m.nu[0].s;const e={k:k,s:Math.round(sm)};
    if(k==='roue')e.decor=!!VOY_D.jante;else if(k==='asteroide')e.decor=!!VOY_D.roc;else if(k==='nebuleuse'){e.decor=!!VOY_D.neb;if(VOY_D.neb){frameAt(Math.max(0,Math.min(L,sm)),VOY_F[0]);e.dC=Math.round(VOY_F[0].p.distanceTo(VOY_D.neb.C));}}else e.decor=null;ge.push(e);}
  o.geantsVoy=ge;o.geants=(GEANTS.liste||[]).length;
  /* les pièces : la distance de chaque pièce au point de la route qu'elle annonce (s, lat) */
  let n=0,mx=0,loin=0,nan=0;const F9=VOY_F[1],P9=new THREE.Vector3();for(const p of pickups){if(!p.mesh||p.face!==1)continue;n++;if(!isFinite(p.s)){nan++;continue;}frameAt(Math.max(0,Math.min(L,p.s)),F9);
    P9.copy(F9.p).addScaledVector(F9.b,p.lat||0);const d=p.mesh.position.distanceTo(P9);if(!isFinite(d)){nan++;continue;}if(d>mx)mx=d;if(d>40)loin++;}
  o.pieces={n:n,dMax:Math.round(mx),loin40:loin,nan:nan};
  o.preb={carte:PREB.carte,sd:PREB.sd,eng:PREB.eng,etat:PREB.W?(PREB.fait?'pret':'cours'):'',der:PREB.der};
  o.ru=(function(){const p=Array.from(RU.P.values()).filter(function(x){return /^espace:/.test(x.cle);}).slice(-1)[0];return p?{cle:p.cle,v:p.v,sig:p.sig.slice(0,160)}:null;})();o.ruV=JSON.stringify(RU.V).slice(0,200);
  }catch(e){o.err=String(e&&e.stack||e).slice(0,400);}return o;},
 suivi:function(on){const S=window.__etatS||(window.__etatS={on:false});if(!on){S.on=false;return S.r;}
  S.on=true;S.r={n:0,modes:{},trans:[],sous:0,sousMax:0,rollMax:0,rolls:[],sMax:0,chutes:0,fallT:0,morts:0,camLoin:0,tl:[],sousS:[]};let r0=null,t0=performance.now(),m0=mode,tD=t0,tE=-1;const R9=new THREE.Vector3(),F=VOY_F[2],D9=new THREE.Vector3();
  const pas=function(){if(!S.on)return;requestAnimationFrame(pas);const now=performance.now(),dt=(now-t0)/1000;t0=now;const r=S.r;r.n++;if(now-tE>=250){tE=now;r.tl.push([Math.round(now-tD),Math.round(s),mode,Math.round(vKmh()),PVE.ph|0,PORTV.att?1:0,LVL.cur?(LVL.cur.carte||LVL.cur.id):'',+ORBFX.warp.toFixed(2),+(BIO.dip||0).toFixed(2)]);}r.modes[mode]=(r.modes[mode]|0)+1;
    if(mode!==m0){r.trans.push([Math.round(s),m0,mode,Math.round(vKmh())]);if(mode==='fall')r.chutes++;if(mode==='boom')r.morts++;m0=mode;}if(mode==='fall')r.fallT+=dt;
    if(s>r.sMax)r.sMax=Math.round(s);
    if(mode==='drive'&&NP>2){frameAt(Math.max(0,Math.min(L,s)),F);D9.subVectors(camera.position,F.p);const h=D9.dot(F.n);if(h<0){r.sous++;if(r.sousS.length<40)r.sousS.push([Math.round(s),+h.toFixed(1)]);if(-h>r.sousMax)r.sousMax=+(-h).toFixed(1);}if(D9.length()>220)r.camLoin++;}
    R9.set(1,0,0).applyQuaternion(camera.quaternion);const roll=Math.asin(Math.max(-1,Math.min(1,R9.y)));if(r0!=null&&dt>0&&dt<.2){const v=Math.abs(roll-r0)/dt*57.2958;r.rolls.push(Math.round(v));if(v>r.rollMax)r.rollMax=Math.round(v);}r0=roll;};
  requestAnimationFrame(pas);return 1;}};
`;
(async () => {
  let P_HTTP = +(A.http || 9741), P_CDP = P_HTTP + 1; while (!portLibre(P_HTTP)) P_HTTP += 2; while (!portLibre(P_CDP) || P_CDP === P_HTTP) P_CDP += 2;
  const srv = http.createServer((rq, rs) => { let p = decodeURIComponent(rq.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html'; const f = path.join(DIR, p);
    if (!f.startsWith(DIR)) { rs.writeHead(403); return rs.end(); }
    fs.readFile(f, (e, b) => { if (e) { rs.writeHead(404); return rs.end(); }
      if (/index\.html$/.test(f)) { let t = b.toString('utf8'); const i = t.indexOf('window.dbgVoyage=function'); if (i < 0) console.log('CROCHET : ancre introuvable'); else t = t.slice(0, i) + CROCHET + t.slice(i); b = Buffer.from(t, 'utf8'); }
      const ty = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.mp3': 'audio/mpeg', '.webp': 'image/webp', '.wasm': 'application/wasm', '.css': 'text/css' }[path.extname(f)] || 'application/octet-stream';
      rs.writeHead(200, { 'Content-Type': ty, 'Cache-Control': 'no-store' }); rs.end(b); }); });
  await new Promise(ok => srv.listen(P_HTTP, '127.0.0.1', ok));
  const prof = tmp(); const { ch, pg } = await lanceChrome(P_CDP, prof, 390, 844);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  const fin = (code) => { try { c.close(); } catch (e) {} tueChrome(ch); srv.close(); try { fs.rmSync(prof, { recursive: true, force: true }); } catch (e) {} ecrit(); process.exit(code || 0); };
  setTimeout(() => { R.delai = 1; console.log('délai'); fin(2); }, (+A.max || 11) * 60 * 1000);
  c.ws.addEventListener('message', e => { try { const m = JSON.parse(e.data);
    if (m.method === 'Runtime.exceptionThrown') { const d = m.params.exceptionDetails; R.exc.push(((d.exception && d.exception.description) || d.text || '').slice(0, 400)); }
    if (m.method === 'Runtime.consoleAPICalled' && (m.params.type === 'error' || m.params.type === 'warning')) R.con.push(m.params.type + ' ' + m.params.args.map(a => a.value !== undefined ? String(a.value) : (a.description || a.type)).join(' ').slice(0, 300));
  } catch (x) {} });
  await c.send('Runtime.enable'); await c.send('Page.enable'); await c.send('Network.enable');
  await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
  await c.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 3, mobile: true }); await c.send('Emulation.setTouchEmulationEnabled', { enabled: true });
  await c.send('Page.addScriptToEvaluateOnNewDocument', { source:
    "try{localStorage.setItem('cashcarSave',JSON.stringify({v:2,tuto:1,permis:1,plq:{m:'fr',x:'BANC',ok:1},bank:50000,ex:{runs:3},sfx:false,mus:false,vox:false}));localStorage.removeItem('cashcarRU');}catch(e){}" +
    "window.__ev=[];document.addEventListener('cc:portail',function(){window.__ev.push(['portail',Math.round(performance.now())]);});" });
  await c.send('Page.navigate', { url: `http://127.0.0.1:${P_HTTP}/index.html?intro=ancien&chute=0&tel=1&appareil=iPhone14,2&carte=nuages&routeverif=1${Q ? '&' + Q : ''}` });
  const ev = (x, ms) => c.ev(x, ms || 180000);
  for (let i = 0; i < 200; i++) { await dormir(1500); try { if (await ev('!!window.__gameReady')) break; } catch (e) {} }
  await dormir(3000); await ev("(function(){const e=document.getElementById('splash');try{e&&e.click();}catch(x){}return 1;})()");
  for (let i = 0; i < 60; i++) { if (await ev('!!(window.dbgJouer&&window.dbgClassique&&window.__etat)')) break; await dormir(500); }
  await dormir(3000);
  const cas = () => ev('JSON.stringify(dbgPortvCas())').then(JSON.parse);
  await ev("try{dbgClassique('nuages');}catch(e){}dbgJouer();1");
  for (let i = 0; i < 80; i++) { await dormir(500); if (await ev('!!(dbgState().started&&dbgState().running&&!dbgState().gameOver)')) break; }
  await ev('dbgImmortel(true);1'); await dormir(1500);
  if (BRIDE > 1) await c.send('Emulation.setCPUThrottlingRate', { rate: BRIDE });
  const attendPret = async (cible) => { for (let i = 0; i < 600; i++) { await dormir(250);
      const e = await ev('(function(){const p=dbgPrebati();return {e:p.etat,c:String(p.carte||"")};})()'); if (e.e === 'pret' && e.c.indexOf(cible) === 0) return true; } return false; };
  const attendPortail = async () => { for (let i = 0; i < 600; i++) { await dormir(200); const p = await ev("(window.__ev.find(function(x){return x[0]==='portail';})||[0])[1]||0"); if (p) return p; } return 0; };
  const attendFin = async () => { for (let i = 0; i < 300; i++) { const k = await cas(); if (!k.ph && !k.att) return k; await dormir(200); } return await cas(); };
  let nEsp = 0;
  for (const cible of SUITE) {
    const P = { cible, de: (await cas()).lieu, t: Math.round(Date.now() / 1000) };
    if (cible === 'espace') nEsp++;
    const vite = cible === 'espace' && nEsp === VITE;
    if (vite) { let m = ''; for (let i = 0; i < 12; i++) m = await ev('dbgMoteur()'); P.moteur = m; await dormir(2500); }
    await ev(`window.__ev.length=0;try{dbgClassique('${cible}');}catch(e){}1`);
    P.rv0 = await ev('dbgRouteVerif().n');
    await ev('dbgPortail(1400);1'); P.pret = await attendPret(cible);
    P.prebAvant = await ev('JSON.stringify(dbgPrebati())').then(JSON.parse).catch(() => null);
    if (vite) { const v = Math.max(60, +(P.prebAvant && P.prebAvant.v) || 60); await ev(`dbgPortail(${Math.round(Math.max(300, v * 4))});1`); } else await ev('dbgPortail(250);1');
    P.tp = await attendPortail(); if (cible === 'espace') await ev('window.__etat.suivi(true);1'); P.kmhPassage = (await cas()).kmh;
    await dormir(2500); P.etat = await attendFin();
    P.rv = await ev(`JSON.stringify(dbgRouteVerif().l.slice(-(dbgRouteVerif().n-${P.rv0})))`).then(JSON.parse).catch(() => null);
    if (cible === 'espace') {
      P.rel = await ev('JSON.stringify(window.__etat.rel())').then(JSON.parse);
      await ev('dbgAuto(true);1');
      await dormir(ROULE * 1000);
      P.suivi = await ev('JSON.stringify(window.__etat.suivi(false))').then(JSON.parse).catch(e => ({ err: String(e) }));
      await ev('dbgAuto(false);1');
      if (P.suivi && P.suivi.rolls) { const a = P.suivi.rolls.slice().sort((x, y) => x - y); P.suivi.rollP95 = a[Math.floor(.95 * (a.length - 1))] | 0; P.suivi.rollP99 = a[Math.floor(.99 * (a.length - 1))] | 0; delete P.suivi.rolls; }
      P.rel2 = await ev('JSON.stringify(window.__etat.rel())').then(JSON.parse); /* le même état après la conduite (le pré-bâti de la map suivante a pu commencer) */
    }
    R.passages.push(P); ecrit();
    console.log(JSON.stringify({ cible, n: nEsp, pret: P.pret, tp: !!P.tp, lieu: P.etat.lieu, mode: P.etat.mode, kmh: P.kmhPassage, eng: P.rel && P.rel.eng, rv: (P.rv || []).map(x => x.k + ':' + x.carte + ':' + (x.egal ? 'EGAL' : 'DIFF') + (x.egalMk ? '+mk' : '-mk')),
      der: P.rel && P.rel.der && [P.rel.der.ouv, P.rel.der.fin, (P.rel.der.joues || []).join(' ')].join(' | '), geants: P.rel && P.rel.geantsVoy, pieces: P.rel && P.rel.pieces, suivi: P.suivi && { chutes: P.suivi.chutes, morts: P.suivi.morts, sous: P.suivi.sous, sMax: P.suivi.sMax, rollMax: P.suivi.rollMax, p95: P.suivi.rollP95, trans: P.suivi.trans } }));
  }
  R.verif = await ev('JSON.stringify(dbgRouteVerif())').then(JSON.parse).catch(() => null);
  /* LE DÉPART DIRECT dans l'espace (le chemin des vérifications d'avant) : même relevé, pour comparer l'arrivée */
  try { await ev('try{dbgQuitte();}catch(e){}1'); await dormir(3000); await ev("try{dbgClassique('espace');}catch(e){}window.__etat.suivi(true);dbgJouer();1");
    for (let i = 0; i < 80; i++) { await dormir(500); if (await ev('!!(dbgState().started&&dbgState().running&&!dbgState().gameOver)')) break; }
    await ev('dbgImmortel(true);1'); await dormir(9000);
    const D = { cible: 'espace-direct' }; D.rel = await ev('JSON.stringify(window.__etat.rel())').then(JSON.parse); D.suivi = await ev('JSON.stringify(window.__etat.suivi(false))').then(JSON.parse); if (D.suivi) delete D.suivi.rolls;
    R.direct = D; ecrit(); console.log('direct', JSON.stringify({ mods: (D.rel.mods || []).slice(0, 2), tl: (D.suivi.tl || []).filter((x, i) => i % 4 === 0).slice(0, 12) })); } catch (e) { R.directErr = String(e); }
  R.ru = await ev('JSON.stringify(dbgRoutesU())').then(JSON.parse).catch(() => null);
  R.fin = new Date().toISOString(); ecrit(); console.log('fin'); fin(0);
})().catch(e => { console.error(e); R.err = String(e && e.stack || e); ecrit(); process.exit(3); });
