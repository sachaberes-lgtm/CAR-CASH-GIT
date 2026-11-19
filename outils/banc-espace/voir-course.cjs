/* ===== LE BANC « VOIR » : REGARDER LES MODULES DE L'ESPACE COMME UN JOUEUR (2026-11-18, débogage de l'espace : « j'ai rien compris ce qui se passait ») =====
   Sert la copie FIGÉE du jeu de base (--page, défaut « VERSION PRINCIPALE/index-base121.html ») avec un crochet glissé à la volée (rien d'écrit sur disque).
   Départ direct ?carte=espace&pistegraine=G ; pour chaque CAS « cx/palier/graine/cibles/m » : le plan imposé (OU.force.cx), le palier (dbgTremble({tier})),
   la route rebâtie (dbgClassique('espace') + dbgSaut(), sac figé par ?pistegraine, graine changée par history.replaceState), puis pour chaque module visé :
   la caisse posée ~3 s avant (dbgBord), la boucle FIGÉE et avancée à la main (dbgStep par 8 × 33 ms ≈ 264 ms de jeu) avec une photo JPEG par pas,
   de 2 s avant l'entrée à 2 s après la sortie. Le pilote « humain » : slalom d'un bord à l'autre (±0,8 de la demi-route, période 2,4 s), nitro par
   bouffées, un saut voulu (veqSaut, le vrai saut du joueur) à l'entrée et un au milieu, nitro tenue en l'air après le 2e (le vol), mortel ;
   « m » : une mort provoquée au milieu du module, puis la seconde chance (dbgChance('joue')) et les photos de la reprise.
   node outils/banc-espace/voir-course.cjs --out <dossier> --cas "roue/0/301/tout/m;lune/10/302/lune" (tout = étoile) [--q "sans=uniques"] [--max 640] [--page …]
   SOUS ~/cash-car/verrou-banc.sh (voir voir-passe.sh). Jamais de son : --mute-audio + sfx/mus/vox à false, contrôlé avant le départ. */
const fs = require('fs'), path = require('path'), http = require('http');
const { portLibre, lanceChrome, tueChrome, CDP, dormir, tmp } = require('../banc-trainees/cdp.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const RACINE = path.resolve(__dirname, '..', '..'), OUT = path.resolve(A.out || 'voir-sortie'), Q = A.q || '', MAXT = +(A.max || 640);
const PAGE = path.resolve(RACINE, A.page || 'VERSION PRINCIPALE/index-base121.html');
const CAS = (A.cas || 'roue/0/301/*').split(';').filter(Boolean).map(x => { const [cx, p, g, c, m] = x.split('/'); return { cx: cx === '-' ? '' : cx, p: +p, g: +g, cibles: (c || '*').replace('tout', '*').split(','), mort: /m/.test(m || ''), sansNit: /n/.test(m || ''), sansSaut: /z/.test(m || ''), flags: m || '' }; });
const PAS_N = +(A.pasn || 8), PAS_MS = +(A.pasms || 33);
fs.mkdirSync(OUT, { recursive: true });
const R = { args: A, page: path.relative(RACINE, PAGE), cas: [], exc: [], con: [], debut: new Date().toISOString() };
const ecrit = () => fs.writeFileSync(path.join(OUT, 'resultat.json'), JSON.stringify(R, null, 1));

/* le crochet, dans la fonction du jeu (même portée que s, lat, mode, pts, camera, DBG_AUTO, veqSaut…) */
const CROCHET = `window.__V={ray:new THREE.Raycaster(),V:new THREE.Vector3(),W:new THREE.Vector3(),U:new THREE.Vector3(),D:new THREE.Vector3(),hint:0,
 geants:function(){const l=[];scene.traverse(function(o){if((o.isMesh||o.isPoints)&&o.name&&/^orbite (g\\u00e9ant|voyage)/.test(o.name)){let v=true,p=o;while(p){if(!p.visible){v=false;break;}p=p.parent;}if(v)l.push(o);}});return l;},
 proche:function(P,i0,W){let b=-1,bd=1e18;const a=Math.max(0,i0-W),z=Math.min(NP-1,i0+W);for(let i=a;i<=z;i++){const p=pts[i],dx=P.x-p.x,dy=P.y-p.y,dz=P.z-p.z,d=dx*dx+dy*dy+dz*dz;if(d<bd){bd=d;b=i;}}return b;},
 rep:function(P,j){const p=pts[j],dx=P.x-p.x,dy=P.y-p.y,dz=P.z-p.z;return [dx*Nn[j].x+dy*Nn[j].y+dz*Nn[j].z,dx*B[j].x+dy*B[j].y+dz*B[j].z,dx*T[j].x+dy*T[j].y+dz*T[j].z];},
 mods:function(){try{return dbgMods();}catch(e){return [];}},
 mod:function(sv){const M=this.mods();for(let k=0;k<M.length;k++){const m=M[k];if(sv>=m.s0&&sv<=m.s1)return m.fig;}return '';},
 prep:function(cx,p){OU.force={};if(cx)OU.force.cx=cx;dbgTremble({tier:p});try{dbgClassique('espace');}catch(e){}const r=dbgSaut();return {r:String(r).slice(0,200),eng:engTier,id:LVL.cur&&LVL.cur.id,L:Math.round(L),force:JSON.stringify(OU.force)};},
 vivant:function(){cancelAnimationFrame(loop._raf);last=performance.now();loop._raf=requestAnimationFrame(loop);return 1;},
 vit:function(){const k=vPalier()*elanReel()*3.6;vA=(vA<0?-1:1)*k/(3.6*SPD*vitMult());return Math.round(k);},
 sansRendu:function(on){if(on){if(!this.r0){this.r0=[renderer.render,composer&&composer.render];}renderer.render=function(){};if(composer)composer.render=function(){};}else if(this.r0){renderer.render=this.r0[0];if(composer)composer.render=this.r0[1];}return 1;},
 un:function(){last=performance.now()-33;loop(performance.now());cancelAnimationFrame(loop._raf);},
 sautTest:function(x){const V=this;if(mode!=='drive')for(let k=0;k<200&&mode!=='drive';k++)V.un();const o0={};if(mode!=='drive'){o0.force=mode;try{respawn();}catch(e){o0.errR=String(e);}for(let k=0;k<5;k++)V.un();}VEQ.sautT=0;
   dbgBord({s:x,lat:0,psi:0,side:1,vL:0});V.vit();for(let k=0;k<12;k++)V.un();V.vit();
   const ds=L/(NP-1),i=Math.max(0,Math.min(NP-1,Math.round(s/ds))),o={x:Math.round(s),mod:V.mod(s),ny:+Nn[i].y.toFixed(2),ty:+(T[i].y*driveDir).toFixed(2),kmh:Math.round(vKmh())};
   Object.assign(o,o0);VEQ.sautT=0;const j=V.saut();o.ok=j.ok===true;o.mode2=j.mode2;o.refus=(j.voy?'v':'')+(j.esp?'e':'')+(j.side<0?'d':'')+(j.nua?'n':'');if(!o.ok)return o;
   o.volr=VOLR.on?1:0;let t=0,hm=0,air=0;const s0=s;
   for(let k=0;k<420;k++){if(mode==='fall'){if(airDepasse())air=1;hm=Math.max(hm,curHOff||0);}V.un();t+=0.033;if(mode!=='fall')break;}
   o.t=+t.toFixed(2);o.hmax=Math.round(hm);o.mort=air?'air':(mode==='fall'?'encore':(graceT>2?'replace':''));o.sPose=Math.round(s);o.dPose=Math.round(s-s0);return o;},
 lat:function(k){DBG_AUTO.lat=k*ROAD_HALF;return 1;},
 nit:function(n){DBG_AUTO.nit=n|0;return 1;},
 saut:function(){const ref={side:side,esp:espSautRefuse(),voy:voySautRefuse(),nua:nuaSautRefuse(),mode:mode,hop:hopY>0||hopV!==0||!!POSE_F};nitroR=Math.max(nitroR,1);let ok;try{ok=veqSaut();}catch(e){ok='err '+e.message;}ref.ok=ok;ref.mode2=mode;return ref;},
 rel:function(obs){const V=this;if(!started||!NP)return null;const ds=L/(NP-1),i=Math.max(0,Math.min(NP-1,Math.round(s/ds)));
   const cp=carGroup.position,jC=V.proche(cp,mode==='drive'?i:(V.hint||i),Math.round(400/ds));V.hint=jC;const rc=V.rep(cp,jC);
   const cu=V.U.set(0,1,0).applyQuaternion(carGroup.quaternion),carUpN=cu.dot(Nn[jC]);
   const cam=camera.position,jK=V.proche(cam,jC,Math.round(200/ds)),rk=V.rep(cam,jK);
   const ku=V.D.set(0,1,0).applyQuaternion(camera.quaternion),camUpN=ku.dot(Nn[jK]),camUpY=ku.y;
   camera.updateMatrixWorld();const pr=V.W.copy(cp).project(camera),champ=(pr.z<1&&Math.abs(pr.x)<=1.02&&Math.abs(pr.y)<=1.02)?1:0;
   const o={s:Math.round(s),mode:mode,side:side,kmh:Math.round(vKmh()),mod:V.mod(s),lat:+lat.toFixed(1),h:+rc[0].toFixed(2),b:+rc[1].toFixed(1),dJ:Math.round((jC-i)*ds),carUpN:+carUpN.toFixed(2),
     camUpN:+camUpN.toFixed(2),camUpY:+camUpY.toFixed(2),camN:+rk[0].toFixed(1),camB:+rk[1].toFixed(1),dCam:+cam.distanceTo(cp).toFixed(1),champ:champ,px:[+pr.x.toFixed(2),+pr.y.toFixed(2)],
     nyC:+Nn[jC].y.toFixed(2),nyS:+Nn[i].y.toFixed(2),eng:engTier,go:gameOver?1:0,cause:mortCause||'',nit:+(nitroR+nitroX).toFixed(2),nitOn:nitroOn?1:0};
   if(mode==='fall'){o.vol=typeof VOLR!=='undefined'&&VOLR.on?1:0;if(o.vol)o.volUN=+(VOLR.u.x*Nn[jC].x+VOLR.u.y*Nn[jC].y+VOLR.u.z*Nn[jC].z).toFixed(2);o.hOff=+curHOff.toFixed(1);o.latOff=+curLatOff.toFixed(1);o.fallT=+fallT.toFixed(2);}
   o.refus=(voySautRefuse()?'v':'')+(espSautRefuse()?'e':'');
   if(obs){const G=V.geants();o.geants=G.length;if(G.length){const dir=V.D.copy(cp).sub(cam),dl=dir.length();dir.normalize();V.ray.set(cam,dir);V.ray.far=dl-1.5;V.ray.near=0;
       let h=[];try{h=V.ray.intersectObjects(G,false);}catch(e){o.obsErr=String(e).slice(0,80);}if(h.length)o.obs=h[0].object.name+'@'+h[0].distance.toFixed(1);
       /* la caméra DANS un géant : un rayon vers le haut de la caméra qui touche une face vue de dos (on est dedans) */
       const L9=GEANTS.lunes||[];for(const q of L9){const d=cam.distanceTo(q.C);if(d<q.R+2)o.camDansLune=Math.round(d-q.R);o.dLune=Math.round(cp.distanceTo(q.C)-q.R);}
       if(VOY_D.neb){o.dNeb=Math.round(cam.distanceTo(VOY_D.neb.C)/VOY_D.neb.sg*100)/100;}}}
   return o;},
 etat:function(){let v=null;try{v=dbgVoyage();delete v.vues;}catch(e){v=String(e);}return {mods:this.mods(),voy:v,L:Math.round(L),eng:engTier,geants:this.geants().map(function(o){return o.name;}),gt:typeof dbgGeants==='function'?(function(){try{return JSON.stringify(dbgGeants()).slice(0,1500);}catch(e){return String(e);}})():null};}};
`;
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.woff2': 'font/woff2', '.webp': 'image/webp', '.ktx2': 'image/ktx2', '.glb': 'model/gltf-binary', '.wasm': 'application/wasm' };
function serveurCrochet(dir, port) {
  const s = http.createServer((rq, rs) => {
    let p = decodeURIComponent(rq.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
    if (p.endsWith('sw.js')) { rs.writeHead(404); return rs.end(); }
    let f = path.join(dir, p); if (!f.startsWith(dir)) { rs.writeHead(403); return rs.end(); }
    const estPage = /\/index\.html$/.test(p); if (estPage) f = PAGE;
    fs.readFile(f, (e, b) => { if (e) { rs.writeHead(404); return rs.end(); }
      if (estPage) { let t = b.toString('utf8'); const i = t.indexOf('window.dbgPieces=function'); if (i < 0) console.log('CROCHET : ancre introuvable'); else t = t.slice(0, i) + CROCHET + t.slice(i); b = Buffer.from(t, 'utf8'); }
      rs.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' }); rs.end(b); });
  });
  return new Promise(ok => s.listen(port, '127.0.0.1', () => ok(s)));
}
(async () => {
  let P_HTTP = +(A.http || 9761), P_CDP = P_HTTP + 1; while (!portLibre(P_HTTP)) P_HTTP += 2; while (!portLibre(P_CDP) || P_CDP === P_HTTP) P_CDP += 2;
  const srv = await serveurCrochet(path.join(RACINE, 'VERSION PRINCIPALE'), P_HTTP), prof = tmp();
  const W = 390, H = 844;
  const { ch, pg } = await lanceChrome(P_CDP, prof, W, H);
  R.chromePid = ch.pid; console.log('chrome pid', ch.pid, 'ports', P_HTTP, P_CDP);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  const fin = (code) => { try { c.close(); } catch (e) {} tueChrome(ch); try { process.kill(-ch.pid, 'SIGKILL'); } catch (e) {} srv.close(); try { fs.rmSync(prof, { recursive: true, force: true }); } catch (e) {} R.fin = new Date().toISOString(); ecrit(); process.exit(code || 0); };
  process.on('SIGINT', () => fin(1)); process.on('SIGTERM', () => fin(1));
  const T0 = Date.now(), reste = () => MAXT - (Date.now() - T0) / 1000; setTimeout(() => { R.delai = 1; console.log('délai'); fin(2); }, MAXT * 1000 + 20000);
  c.ws.addEventListener('message', e => { try { const m = JSON.parse(e.data);
    if (m.method === 'Runtime.exceptionThrown') { const d = m.params.exceptionDetails; R.exc.push([Math.round((Date.now() - T0) / 1000), ((d.exception && d.exception.description) || d.text || '').slice(0, 400)]); }
    if (m.method === 'Runtime.consoleAPICalled' && (m.params.type === 'error' || m.params.type === 'warning')) R.con.push([Math.round((Date.now() - T0) / 1000), m.params.type + ' ' + m.params.args.map(a => a.value !== undefined ? String(a.value) : (a.description || a.type)).join(' ').slice(0, 300)]);
  } catch (x) {} });
  await c.send('Runtime.enable'); await c.send('Page.enable');
  await c.send('Network.enable'); await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
  await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 2, mobile: true }); await c.send('Emulation.setTouchEmulationEnabled', { enabled: true });
  await c.send('Page.addScriptToEvaluateOnNewDocument', { source:
    "try{localStorage.setItem('cashcarSave',JSON.stringify({v:2,tuto:1,permis:1,plq:{m:'fr',x:'BANC',ok:1},bank:50000,ex:{runs:3},sfx:false,mus:false,vox:false}));localStorage.removeItem('cashcarRU');}catch(e){}" +
    "document.addEventListener('DOMContentLoaded',function(){const s=document.createElement('style');s.textContent='#serieW{display:none!important}';document.head.appendChild(s);});" });
  const g0 = CAS[0] ? CAS[0].g : 301;
  const url = `http://127.0.0.1:${P_HTTP}/index.html?intro=ancien&chute=0&tel=1&appareil=iPhone14,2&carte=espace&pistegraine=${g0}${Q ? '&' + Q : ''}`;
  R.url = url; console.log(url);
  await c.send('Page.navigate', { url });
  const ev = (x, ms) => c.ev(x, ms || 120000);
  for (let i = 0; i < 200; i++) { await dormir(1500); try { if (await ev('!!window.__gameReady')) break; } catch (e) {} }
  await dormir(2500); await ev("(function(){const e=document.getElementById('splash');try{e&&e.click();}catch(x){}return 1;})()");
  for (let i = 0; i < 60; i++) { if (await ev('!!(window.dbgJouer&&window.dbgClassique&&window.__V)')) break; await dormir(500); }
  R.son = await ev("(function(){try{const s=JSON.parse(localStorage.getItem('cashcarSave'));return [s.sfx,s.mus,s.vox];}catch(e){return 'err';}})()");
  if (!R.son || R.son.some(x => x !== false)) { console.log('SON NON COUPÉ, arrêt', R.son); fin(4); }
  R.charge = Math.round((Date.now() - T0) / 1000); console.log('chargé en', R.charge, 's');
  const demarre = async () => { let parti = false; for (let k = 0; k < 4 && !parti; k++) { await ev(`try{dbgClassique('espace');}catch(e){}dbgJouer();1`);
      for (let i = 0; i < 60 && !parti; i++) { await dormir(500); parti = await ev('!!(dbgState().started&&dbgState().running&&!dbgState().gameOver)'); } }
    if (parti) { await ev('dbgImmortel(true);1'); try { R.cadence = await ev('JSON.stringify(dbgCadence(60))'); } catch (e) {} await dormir(1500); } return parti; };
  if (!(await demarre())) { R.err = 'départ non obtenu'; console.log('départ non obtenu'); fin(5); }
  const photo = async (fich) => { try { const im = await c.send('Page.captureScreenshot', { format: 'jpeg', quality: 60, clip: { x: 0, y: 0, width: W, height: H, scale: 1 } }, 15000);
    fs.writeFileSync(fich, Buffer.from(im.data, 'base64')); return 1; } catch (e) { return 0; } };
  const pas = (n, ms) => ev(`(function(){dbgStep(${n || PAS_N},${ms || PAS_MS});return 1;})()`);
  const rel = (obs) => ev(`JSON.stringify(__V.rel(${obs ? 1 : 0}))`).then(JSON.parse).catch(e => ({ err: e.message.slice(0, 200) }));
  let nCas = 0;
  for (const K of CAS) {
    if (reste() < 70) { R.coupe = 'temps avant ' + JSON.stringify(K); break; }
    const nomCas = `${K.cx || 'nat'}-p${K.p}-g${K.g}${K.sansNit ? '-sansnit' : ''}${K.sansSaut ? '-sanssaut' : ''}`, dC = path.join(OUT, nomCas); fs.mkdirSync(dC, { recursive: true });
    const C = { K, nom: nomCas, modules: [], t0: Math.round((Date.now() - T0) / 1000) }; R.cas.push(C); nCas++;
    const st0 = await ev('JSON.stringify(dbgState())').then(JSON.parse).catch(() => null);
    const ch0 = K.mort ? await ev('JSON.stringify(dbgChance())').then(JSON.parse).catch(() => null) : null;
    if (ch0 && ch0.used && st0 && st0.started && !st0.gameOver) { await ev('dbgImmortel(false);dbgChance("mort");1').catch(() => 0); await ev('__V.vivant()'); await dormir(4000); await ev('try{dbgEco("rejouer");}catch(e){}1').catch(() => 0); await dormir(3000); C.relance = 'chance déjà prise'; }
    const st1 = ch0 && ch0.used ? await ev('JSON.stringify(dbgState())').then(JSON.parse).catch(() => null) : st0;
    if (!st1 || !st1.started || st1.gameOver) { await ev('__V.vivant()').catch(() => 0); if (!(await demarre())) { C.err = 'redémarrage raté'; ecrit(); continue; } }
    await ev('__V.vivant()').catch(() => 0);
    await ev(`(function(){const u=new URL(location.href);u.searchParams.set('pistegraine','${K.g}');history.replaceState(null,'',u.toString());return 1;})()`);
    C.prep = await ev(`JSON.stringify(__V.prep(${JSON.stringify(K.cx)},${K.p}))`).then(JSON.parse).catch(e => 'err ' + e.message);
    await dormir(2500);
    C.etat = await ev('JSON.stringify(__V.etat())').then(JSON.parse).catch(e => 'err ' + e.message);
    const mods = (C.etat && C.etat.mods) || [];
    console.log(nomCas, JSON.stringify(C.prep), mods.map(m => m.fig + '@' + m.s0 + '-' + m.s1).join(' '));
    /* les fenêtres : les géants et les envers vont de leur entrée à leur sortie */
    const groupe = (f) => f.replace(/-(entree|sortie)$/, '').replace(/^envers-(entree|sortie)$/, 'faille-envers');
    const fen = []; for (const m of mods) { const g = /^envers-/.test(m.fig) ? 'faille-envers' : groupe(m.fig); let w = fen.find(x => x.g === g && m.s0 <= x.s1 + 400); if (!w) fen.push(w = { g, s0: m.s0, s1: m.s1, parts: [] }); w.s0 = Math.min(w.s0, m.s0); w.s1 = Math.max(w.s1, m.s1); w.parts.push(m.fig); }
    if (/s/.test(K.flags || '')) { await ev('__V.vivant()'); await dormir(3000); await ev('dbgBord({s:900,lat:0,psi:0,side:1});1').catch(() => 0); await pas(60, 33); C.avantCarte = await ev('JSON.stringify({m:dbgState().mode,s:Math.round(dbgState().s||0)})').catch(e => e.message); await ev('dbgImmortel(true);dbgAuto(1,0,{vol:true,nit:0,latK:0});__V.sansRendu(1);1'); const L9 = (C.etat && C.etat.L) || 9000, pasS = +(A.pass || 100); C.sauts = [];
      for (let x = 600; x < L9 - 500 && reste() > 25; x += pasS) { const o = await ev(`JSON.stringify(__V.sautTest(${x}))`, 60000).then(JSON.parse).catch(e => ({ x, err: e.message.slice(0, 120) })); C.sauts.push(o); if (C.sauts.length <= 3) console.log('   essai', JSON.stringify(o)); }
      await ev('__V.sansRendu(0);__V.vivant()').catch(() => 0); const m = C.sauts.filter(o => o.mort === 'air' || o.mort === 'encore' || o.mort === 'replace');
      console.log('  carte des sauts', C.sauts.length, 'refusés', C.sauts.filter(o => !o.ok).length, 'morts', m.length, m.map(o => o.x + ':' + (o.mod || '-')).join(' ')); ecrit(); continue; }
    const vise = fen.filter(w => K.cibles.includes('*') ? !['plongee', 'quart', 'marche', 'mur', 'plongeon', 'rentree', 'lacet', 'faille'].includes(w.g) || K.cibles.includes(w.g) : K.cibles.includes(w.g));
    C.fenetres = fen.map(w => w.g + '@' + w.s0 + '-' + w.s1); C.vises = vise.map(w => w.g);
    for (const w of vise) {
      if (reste() < 45) { C.coupe = 'temps'; break; }
      let MOD_VIT = null; const MOD = { g: w.g, s0: w.s0, s1: w.s1, parts: w.parts, images: [], sauts: [], morts: [], chance: null };
      C.modules.push(MOD);
      let st = await ev('JSON.stringify(dbgState())').then(JSON.parse).catch(() => null);
      if (!st || !st.started || st.gameOver) { MOD.err = 'partie finie avant le module'; break; }
      await ev('__V.vivant()').catch(() => 0);
      const v = Math.max(60, ((await rel()).kmh || 500) / 3.6), vLanc = { 0: 140, 5: 175, 10: 234, 15: 300, 20: 396 }[K.p] || v;
      const v9 = Math.max(v, vLanc * 0.85);
      await ev(`dbgImmortel(true);dbgAuto(1,0,{vol:true,nit:0,latK:0});JSON.stringify(dbgBord({s:${Math.max(30, Math.round(w.s0 - 4.5 * v9))},lat:0,psi:0,side:1}))`);
      /* figée : on pose, on laisse la caméra se poser 1,5 s de jeu */
      MOD_VIT = await ev('__V.vit()').catch(e => e.message); await pas(20, 33); await ev('__V.vit()').catch(() => 0); await pas(25, 33);
      await ev('dbgImmortel(false);dbgNitro(1,1);1');
      let k = 0, tJ = 0, sautE = false, sautM = false, tue = false, debut = null, maxImg = +(A.maximg || 220), vol = false;
      MOD.kmh0 = (await rel()).kmh; MOD.vise = MOD_VIT;
      while (k < maxImg && reste() > 25) {
        const r = await rel(true); if (!r || r.err) { MOD.err = r && r.err; break; }
        if (r.go || r.mode === 'boom') { /* mort (vraie ou provoquée) : la seconde chance, en temps réel */
          const M = { s: r.s, cause: r.cause, mod: r.mod, provoquee: tue, t: tJ };
          await ev('__V.vivant()'); const dM = path.join(dC, w.g + '-mort-' + MOD.morts.length); fs.mkdirSync(dM, { recursive: true }); let q = 0;
          for (let i = 0; i < 10; i++) { await dormir(250); await photo(path.join(dM, String(q++).padStart(2, '0') + '-avant.jpg')); }
          M.chance = await ev('JSON.stringify(dbgChance())').then(JSON.parse).catch(() => null);
          M.joue = await ev('JSON.stringify(dbgChance("joue"))').catch(e => String(e));
          const rr = []; for (let i = 0; i < 40; i++) { await dormir(220); await photo(path.join(dM, String(q++).padStart(2, '0') + '-reprise.jpg')); if (i % 4 === 0) rr.push(await rel(true)); }
          M.reprise = rr; M.photos = path.relative(RACINE, dM); MOD.morts.push(M); console.log('  MORT', JSON.stringify(M).slice(0, 500));
          st = await ev('JSON.stringify(dbgState())').then(JSON.parse).catch(() => null);
          if (!st || st.gameOver || !st.started) { MOD.fin = 'partie finie'; break; }
          await ev('dbgAuto(1,0,{vol:true,nit:0,latK:0});1'); await pas(1, 33); continue; }
        if (debut === null && r.s >= w.s0 - 2 * v9) debut = k;
        const dedans = debut !== null;
        if (dedans) { r.k = k; r.t = +tJ.toFixed(2); const f = path.join(dC, `${w.g}-${String(k).padStart(3, '0')}-s${r.s}.jpg`); await photo(f); r.img = path.relative(RACINE, f); MOD.images.push(r); k++; }
        if (r.s > w.s1 + 2 * v9 && r.mode === 'drive') break;
        if (r.s > w.s1 + 6 * v9) break;
        /* le pilote humain */
        const ph = Math.sin(2 * Math.PI * tJ / 2.4); await ev(`__V.lat(${(0.8 * ph).toFixed(2)});__V.nit(${vol ? 1 : (Math.floor(tJ / 1.5) % 3 === 0 ? 3 : 0)});1`);
        if (!K.sansSaut && !sautE && r.s >= w.s0 && r.mode === 'drive') { sautE = true; const j = await ev('JSON.stringify(__V.saut())').then(JSON.parse).catch(e => e.message); MOD.sauts.push(['entree', r.s, j]); }
        if (!K.sansSaut && !sautM && r.s >= (w.s0 + w.s1) / 2 && r.mode === 'drive') { sautM = true; const j = await ev('JSON.stringify(__V.saut())').then(JSON.parse).catch(e => e.message); MOD.sauts.push(['milieu', r.s, j]); if (j && j.ok && !K.sansNit) vol = true; }
        if (vol && r.mode === 'drive' && sautM && tJ > 0 && MOD.sauts.length && r.s > (w.s0 + w.s1) / 2 + 3 * v9) vol = false;
        if (K.mort && !tue && r.s >= w.s0 + 0.6 * (w.s1 - w.s0) && r.mode === 'drive') { tue = true;
          MOD.tue = await ev("new Promise(function(ok){let k=0;const f=function(){k++;dbgChance('mort');const d=dbgState();if(d.gameOver||d.mode==='boom'||k>400)return ok(k+' '+d.mode);dbgStep(1,33);setTimeout(f,0);};f();})").catch(e => e.message); continue; }
        await pas(); tJ += PAS_N * PAS_MS / 1000;
      }
      MOD.n = MOD.images.length; MOD.tJ = +tJ.toFixed(1);
      await ev('dbgImmortel(true);__V.vivant()').catch(() => 0);
      console.log('  ', w.g, 'images', MOD.n, 'sauts', JSON.stringify(MOD.sauts.map(x => [x[0], x[1], x[2] && x[2].ok])), 'morts', MOD.morts.length, 'reste', Math.round(reste()));
      ecrit();
    }
    ecrit();
  }
  R.erreurs = await ev('JSON.stringify(window.dbgErreurs?dbgErreurs():null)').catch(() => null);
  console.log('fin'); fin(0);
})().catch(e => { console.error(e); R.err = String(e && e.stack || e); ecrit(); process.exit(3); });
