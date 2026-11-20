/* ===== LE BANC « ENJEU » : L'ESPACE PAR LE PORTAIL, COMME LE JOUEUR (2026-11-18, débogage de l'espace : « le module de l'espace, il est très buggé ») =====
   Une course au pilote qui enchaîne des portails (--suite nuages,espace,jade,espace,ville,espace) : la première map est le départ, chaque suivante est imposée
   (dbgClassique) et prise PAR SON PORTAIL (dbgPortail 1400 → pré-bâti → dbgPortail 250). Dans l'espace, la caisse roule au pilote jusqu'au portail de sortie
   (le vrai, pas de téléportation), MORTELLE si --mortel 1 (une mort → seconde chance dbgChance('joue')). Avant chaque entrée dans l'espace, le moteur monte de
   --monte (ex. "0,3,3" : +0, +3, +3 paliers). Téléphone émulé (tel=1, iPhone14,2), 390×844 (--pay 1 : 844×390), cadence forcée à 30 (dbgCadence(30), comme l'iPhone).
   Un CROCHET glissé dans la fonction du jeu (copie servie à la volée, rien d'écrit) relève toutes les 50 ms dans l'espace : s, mode, module, caisse vs dalle
   (écart latéral, hauteur : traversée = négatif), haut de la caisse et de la caméra vs normale de la dalle, caméra dans le repère de la dalle, vitesse angulaire
   de la caméra, distance caméra-caisse, caisse dans le champ, gravité du vol, dalle visible sous / devant la caisse (lancer de rayon sur « piste bitume »).
   Les ANOMALIES (seuils dans ANOM) sont notées dans la page ; une suite de JPEG (toutes les ~200 ms, ~3 s autour) est écrite pour chacune.
   node outils/banc-espace/enjeu-course.cjs --out passation/espace-debug/enjeu/<nom> [--suite …] [--graine 301] [--q "sans=uniques"] [--monte 0,3,3] [--mortel 1]
        [--saut 0] [--bride 1] [--pay 0] [--max 660] [--maxv 170]
   SOUS ~/cash-car/verrou-banc.sh (la passe se coupe seule à --max secondes, 11 min par défaut). */
const fs = require('fs'), path = require('path');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir, tmp } = require('../banc-trainees/cdp.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const RACINE = path.resolve(__dirname, '..', '..'), OUT = path.resolve(A.out || 'enjeu-sortie'), Q = A.q || '', BRIDE = +(A.bride || 1), PAY = A.pay === '1';
const SUITE = (A.suite || 'nuages,espace,jade,espace,ville,espace').split(','), MONTE = (A.monte || '0,3,3').split(',').map(Number);
const FORCE = (A.force || '').split(';').map(x => { const o = {}; x.split(',').filter(Boolean).forEach(kv => { const [a, b] = kv.split('='); o[a] = b; }); return o; }); /* --force "cx=roue;cx=lune,rel=raide;" : le plan imposé de chaque visite (OU.force) */
const TUE = (A.tue || '').split(',').filter(Boolean); /* --tue faille-envers,roue : une mort provoquée (dbgChance('mort')) au milieu de ces modules, puis la seconde chance */
const MORTEL = A.mortel !== '0', SAUT = +(A.saut || 0), GRAINE = A.graine || '', MAXV = +(A.maxv || 170), MAXT = +(A.max || 660);
fs.mkdirSync(OUT, { recursive: true });
const R = { args: A, suite: SUITE, visites: [], exc: [], con: [], debut: new Date().toISOString() };
const ecrit = () => fs.writeFileSync(path.join(OUT, 'resultat.json'), JSON.stringify(R, null, 1));

/* le crochet : dans la fonction du jeu, juste avant window.dbgPieces (pouvoirs-grisants.js, même portée que s, lat, mode, pts, camera…) */
const CROCHET = `window.__E={rows:[],anom:[],cache:null,on:true,t0:performance.now(),last:0,qPrev:null,uPrev:null,tPrev:0,ray:new THREE.Raycaster(),
 V:new THREE.Vector3(),W:new THREE.Vector3(),U:new THREE.Vector3(),Fw:new THREE.Vector3(),P:new THREE.Vector3(),hint:0,camHint:0,derRay:0,rayv:[1,1,1],
 route:function(){const E=this;if(E.cache&&E.cache.L===L&&E.cache.NP===NP&&E.cache.p0===pts[0].x)return E.cache;
   let mods=[];try{mods=dbgMods();}catch(e){}const bit=[];scene.traverse(function(o){if(o.isMesh&&o.name&&o.name.indexOf('piste bitume')===0)bit.push(o);});
   E.cache={L:L,NP:NP,p0:pts[0].x,ds:L/(NP-1),mods:mods,bit:bit,id:LVL.cur&&LVL.cur.id,eng:engTier,t:Math.round(performance.now()-E.t0)};E.hint=0;E.camHint=0;return E.cache;},
 proche:function(P,i0,W){let b=-1,bd=1e18;const a=Math.max(0,i0-W),z=Math.min(NP-1,i0+W);for(let i=a;i<=z;i++){const p=pts[i],dx=P.x-p.x,dy=P.y-p.y,dz=P.z-p.z,d=dx*dx+dy*dy+dz*dz;if(d<bd){bd=d;b=i;}}return b;},
 rep:function(P,j){const p=pts[j],dx=P.x-p.x,dy=P.y-p.y,dz=P.z-p.z;return [dx*Nn[j].x+dy*Nn[j].y+dz*Nn[j].z,dx*B[j].x+dy*B[j].y+dz*B[j].z,dx*T[j].x+dy*T[j].y+dz*T[j].z];},
 vu:function(o){while(o){if(!o.visible)return false;o=o.parent;}return true;},
 dalle:function(C,j){const E=this,P=E.V.copy(pts[j]).addScaledVector(Nn[j],-THICK*0.5);let n=0; /* (les tableaux de la dalle sont rendus au GPU : pas de lancer de rayon) un bloc « piste bitume » VISIBLE dont la boîte contient la dalle ici */
   for(const m of C.bit){const g=m.geometry;if(!g)continue;if(!g.boundingBox&&!g.boundingSphere)continue;if(!E.vu(m))continue;
     if(g.boundingBox){const bb=g.boundingBox;if(P.x>=bb.min.x-1&&P.x<=bb.max.x+1&&P.y>=bb.min.y-1&&P.y<=bb.max.y+1&&P.z>=bb.min.z-1&&P.z<=bb.max.z+1){n=1;break;}}
     else if(g.boundingSphere.center.distanceTo(P)<=g.boundingSphere.radius+1){n=1;break;}}
   return n;},
 mod:function(C,sv){for(let k=0;k<C.mods.length;k++){const m=C.mods[k];if(sv>=m.s0-60&&sv<=m.s1)return m.fig||('?'+k);}return '';},
 pas:function(now){const E=this;if(!started||!LVL.cur||LVL.cur.id!=='espace'||PARK.on){E.qPrev=null;return;}
   const C=E.route(),ds=C.ds,i=Math.max(0,Math.min(NP-1,Math.round(s/ds)));
   const cp=carGroup.position,jC=E.proche(cp,mode==='drive'?i:(E.hint||i),Math.round(120/ds));E.hint=jC;const rc=E.rep(cp,jC);
   const cu=E.U.set(0,1,0).applyQuaternion(carGroup.quaternion),nC=Nn[jC];const carUpN=cu.dot(nC);
   const cam=camera.position,jK=E.proche(cam,jC,Math.round(120/ds));const rk=E.rep(cam,jK);
   const ku=E.P.set(0,1,0).applyQuaternion(camera.quaternion),camUpN=ku.x*Nn[jK].x+ku.y*Nn[jK].y+ku.z*Nn[jK].z;
   let wq=0,wu=0;const dt=(now-E.tPrev)/1000;if(E.qPrev&&dt>0&&dt<0.5){const q=camera.quaternion,d=Math.abs(q.x*E.qPrev[0]+q.y*E.qPrev[1]+q.z*E.qPrev[2]+q.w*E.qPrev[3]);wq=2*Math.acos(Math.min(1,d))*57.3/dt;
     const ud=ku.x*E.uPrev[0]+ku.y*E.uPrev[1]+ku.z*E.uPrev[2];wu=Math.acos(Math.max(-1,Math.min(1,ud)))*57.3/dt;
     /* le roulis seul : l'angle du haut de la caméra autour de son axe de visée, d'une image à l'autre */}
   const fw=E.Fw.set(0,0,-1).applyQuaternion(camera.quaternion);
   E.qPrev=[camera.quaternion.x,camera.quaternion.y,camera.quaternion.z,camera.quaternion.w];E.uPrev=[ku.x,ku.y,ku.z];E.tPrev=now;
   const pr=E.W.copy(cp).project(camera),champ=(pr.z<1&&Math.abs(pr.x)<=1.02&&Math.abs(pr.y)<=1.02)?1:0;
   const dCam=cam.distanceTo(cp);
   if(now-E.derRay>240){E.derRay=now;try{const k60=Math.min(NP-1,i+Math.round(60/ds)),k150=Math.min(NP-1,i+Math.round(150/ds));E.rayv=[E.dalle(C,i),E.dalle(C,k60),E.dalle(C,k150)];}catch(e){E.rayv=[-2,-2,-2];E.errRay=String(e&&e.stack||e).slice(0,300);}}
   const vo=(typeof VOLR!=='undefined'&&VOLR.on)?1:0,vu9=vo?(VOLR.u.x*nC.x+VOLR.u.y*nC.y+VOLR.u.z*nC.z):9,tb=(typeof TBORD!=='undefined'&&TBORD.on)?1:0;
   const kmh=Math.round(vKmh());
   const row=[Math.round(now-E.t0),Math.round(s),mode,+lat.toFixed(2),+rc[0].toFixed(2),+rc[1].toFixed(2),+carUpN.toFixed(3),+camUpN.toFixed(3),+rk[0].toFixed(2),+rk[1].toFixed(2),
     Math.round(wq),Math.round(wu),+dCam.toFixed(1),champ,vo,+(+vu9).toFixed(2),tb,kmh,gameOver?1:0,E.mod(C,s),E.rayv.join(''),+Nn[i].y.toFixed(2),engTier,mortCause||''];
   E.rows.push(row);
   /* LES ANOMALIES vues par le joueur */
   const an=function(k,v){const l=E.anom;for(let q=l.length-1;q>=0&&q>l.length-8;q--)if(l[q].k===k&&row[0]-l[q].t<4000)return;l.push({k:k,t:row[0],s:row[1],mode:mode,mod:row[19],v:v,row:row});};
   if(mode==='drive'&&rc[0]<-0.6)an('caisse sous la dalle',rc[0]);
   if(mode==='fall'&&Math.abs(rc[1])<ROAD_HALF&&rc[0]<-0.3&&rc[0]>-THICK-0.3)an('caisse dans la dalle (vol)',rc[0]);
   if(Math.abs(rk[1])<ROAD_HALF-0.3&&rk[0]>-THICK-0.2&&rk[0]<0.15)an('camera dans la dalle',[rk[0],rk[1]]);
   if(Math.abs(rk[1])<ROAD_HALF-0.3&&rk[0]<-THICK-0.2&&rc[0]>0&&mode==='drive')an('camera sous la dalle',[rk[0],rk[1]]);
   if(!champ&&!gameOver&&mode!=='boom')an('caisse hors champ',[+pr.x.toFixed(2),+pr.y.toFixed(2),+pr.z.toFixed(2)]);
   if(wq>240)an('camera rotation > 240 deg/s',wq);
   if(mode==='drive'&&camUpN<0.2)an('horizon de la camera > 78 deg de la dalle',camUpN);
   if(mode==='drive'&&carUpN<0.7)an('caisse penchee > 45 deg sur la dalle',carUpN);
   if(dCam>60)an('camera loin de la caisse',dCam);
   if(mode==='drive'&&E.rayv[0]===0)an('pas de dalle sous la caisse',E.rayv.join(''));
   if(mode==='drive'&&E.rayv[1]===0)an('pas de dalle 60 m devant',E.rayv.join(''));
   if(gameOver||mode==='boom')an('mort',mortCause);
   if(vo&&vu9<-0.2)an('gravite du vol contre la dalle',vu9);
 },
 pieces:function(){const C=this.route(),ds=C.ds,o={n:0,hors:0,ex:[],nmax:-99,nmin:99};const V=new THREE.Vector3();
   for(const p of pickups){if(!p.mesh||!p.mesh.parent||p.face!==1||!isFinite(p.s))continue;o.n++;p.mesh.getWorldPosition(V);const j=Math.max(0,Math.min(NP-1,Math.round(p.s/ds))),jj=this.proche(V,j,Math.round(40/ds)),r=this.rep(V,jj);
     o.nmax=Math.max(o.nmax,r[0]);o.nmin=Math.min(o.nmin,r[0]);if(Math.abs(r[1])>ROAD_HALF+1.5||r[0]<-0.5||r[0]>14||Math.abs(jj-j)*ds>25){o.hors++;if(o.ex.length<10)o.ex.push([Math.round(p.s),+r[0].toFixed(1),+r[1].toFixed(1),Math.round((jj-j)*ds),this.mod(C,p.s)]);}}
   o.nmax=+o.nmax.toFixed(1);o.nmin=+o.nmin.toFixed(1);return o;},
 lance:function(){const E=this;const f=function(t){if(E.on)try{if(t-E.last>=48){E.last=t;E.pas(t);}}catch(e){E.err=String(e&&e.stack||e).slice(0,300);}requestAnimationFrame(f);};requestAnimationFrame(f);},
 vide:function(){const r=this.rows;this.rows=[];return r;},
 force:function(o){for(const k in o){if(o[k])OU.force[k]=o[k];else delete OU.force[k];}return JSON.stringify(OU.force);}};
`;
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.woff2': 'font/woff2', '.webp': 'image/webp', '.ktx2': 'image/ktx2', '.glb': 'model/gltf-binary', '.wasm': 'application/wasm' };
const http = require('http');
function serveurCrochet(dir, port) {
  const s = http.createServer((rq, rs) => {
    let p = decodeURIComponent(rq.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
    if (p.endsWith('sw.js')) { rs.writeHead(404); return rs.end(); }
    const f = path.join(dir, p); if (!f.startsWith(dir)) { rs.writeHead(403); return rs.end(); }
    fs.readFile(f, (e, b) => { if (e) { rs.writeHead(404); return rs.end(); }
      if (/index\.html$/.test(f)) { let t = b.toString('utf8'); const i = t.indexOf('window.dbgPieces=function'); if (i < 0) console.log('CROCHET : ancre introuvable'); else t = t.slice(0, i) + CROCHET + t.slice(i); b = Buffer.from(t, 'utf8'); }
      rs.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' }); rs.end(b); });
  });
  return new Promise(ok => s.listen(port, '127.0.0.1', () => ok(s)));
}
(async () => {
  let P_HTTP = +(A.http || 9741), P_CDP = P_HTTP + 1; while (!portLibre(P_HTTP)) P_HTTP += 2; while (!portLibre(P_CDP) || P_CDP === P_HTTP) P_CDP += 2;
  const srv = await serveurCrochet(path.join(RACINE, 'VERSION PRINCIPALE'), P_HTTP), prof = tmp();
  const W = PAY ? 844 : 390, H = PAY ? 390 : 844;
  const { ch, pg } = await lanceChrome(P_CDP, prof, W, H);
  R.chromePid = ch.pid; console.log('chrome pid', ch.pid, 'ports', P_HTTP, P_CDP);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  const fin = (code) => { try { c.close(); } catch (e) {} tueChrome(ch); try { process.kill(-ch.pid, 'SIGKILL'); } catch (e) {} srv.close(); try { fs.rmSync(prof, { recursive: true, force: true }); } catch (e) {} ecrit(); process.exit(code || 0); };
  process.on('SIGINT', () => fin(1)); process.on('SIGTERM', () => fin(1));
  const T0 = Date.now(); setTimeout(() => { R.delai = 1; console.log('délai'); fin(2); }, MAXT * 1000);
  c.ws.addEventListener('message', e => { try { const m = JSON.parse(e.data);
    if (m.method === 'Runtime.exceptionThrown') { const d = m.params.exceptionDetails; R.exc.push([Math.round((Date.now() - T0) / 1000), ((d.exception && d.exception.description) || d.text || '').slice(0, 400)]); }
    if (m.method === 'Runtime.consoleAPICalled' && (m.params.type === 'error' || m.params.type === 'warning')) R.con.push([Math.round((Date.now() - T0) / 1000), m.params.type + ' ' + m.params.args.map(a => a.value !== undefined ? String(a.value) : (a.description || a.type)).join(' ').slice(0, 300)]);
  } catch (x) {} });
  await c.send('Runtime.enable'); await c.send('Page.enable'); await c.send('Network.enable');
  await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
  await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 2, mobile: true }); await c.send('Emulation.setTouchEmulationEnabled', { enabled: true });
  await c.send('Page.addScriptToEvaluateOnNewDocument', { source:
    "try{localStorage.setItem('cashcarSave',JSON.stringify({v:2,tuto:1,permis:1,plq:{m:'fr',x:'BANC',ok:1},bank:50000,ex:{runs:3},sfx:false,mus:false,vox:false}));localStorage.removeItem('cashcarRU');}catch(e){}" +
    "window.__ev=[];document.addEventListener('cc:portail',function(){window.__ev.push(['portail',Math.round(performance.now())]);});" });
  const url = `http://127.0.0.1:${P_HTTP}/index.html?intro=ancien&chute=0&tel=1&appareil=iPhone14,2&carte=${SUITE[0]}&routeverif=1${GRAINE ? '&pistegraine=' + GRAINE : ''}${Q ? '&' + Q : ''}`;
  R.url = url; console.log(url);
  await c.send('Page.navigate', { url });
  const ev = (x, ms) => c.ev(x, ms || 120000);
  for (let i = 0; i < 200; i++) { await dormir(1500); try { if (await ev('!!window.__gameReady')) break; } catch (e) {} }
  await dormir(2500); await ev("(function(){const e=document.getElementById('splash');try{e&&e.click();}catch(x){}return 1;})()");
  for (let i = 0; i < 60; i++) { if (await ev('!!(window.dbgJouer&&window.dbgClassique&&window.dbgPortvCas&&window.__E)')) break; await dormir(500); }
  R.son = await ev("(function(){try{const s=JSON.parse(localStorage.getItem('cashcarSave'));return [s.sfx,s.mus,s.vox];}catch(e){return 'err';}})()");
  if (!R.son || R.son.some(x => x !== false)) { console.log('SON NON COUPÉ, arrêt', R.son); fin(4); }
  await dormir(2500);
  const cas = () => ev('JSON.stringify(dbgPortvCas())').then(JSON.parse);
  let parti = false; for (let k = 0; k < 4 && !parti; k++) { await ev(`try{dbgClassique('${SUITE[0]}');}catch(e){}dbgJouer();1`);
    for (let i = 0; i < 60 && !parti; i++) { await dormir(500); parti = await ev('!!(dbgState().started&&dbgState().running&&!dbgState().gameOver)'); } }
  if (!parti) { R.err = 'départ non obtenu'; console.log('départ non obtenu'); fin(5); }
  await ev('dbgImmortel(true);__E.lance();1');
  try { R.cadence = await ev('JSON.stringify(dbgCadence(30))'); } catch (e) { R.cadence = 'err ' + e.message; }
  if (BRIDE > 1) await c.send('Emulation.setCPUThrottlingRate', { rate: BRIDE });
  await ev('dbgAuto(1,0,{nit:0,vol:true,saut:0,latK:0});1');
  /* LES PHOTOS : un anneau de JPEG (~200 ms) tenu par Node pendant l'espace ; chaque anomalie nouvelle → la suite (≈2 s avant, 1,5 s après) */
  let anneau = [], photoOn = false, nPhotos = 0, dumps = [];
  const boucle = (async () => { while (true) { if (!photoOn) { await dormir(150); continue; } const t = Date.now();
    try { const im = await c.send('Page.captureScreenshot', { format: 'jpeg', quality: 50 }, 8000); anneau.push({ t: t - T0, d: im.data }); if (anneau.length > 14) anneau.shift(); nPhotos++; } catch (e) {}
    const r = 200 - (Date.now() - t); if (r > 0) await dormir(r); } })();
  const vide = async (nom) => { await dormir(1600); const l = anneau.slice(); const d = path.join(OUT, nom); fs.mkdirSync(d, { recursive: true });
    l.forEach((x, k) => fs.writeFileSync(path.join(d, String(k).padStart(2, '0') + '-t' + x.t + '.jpg'), Buffer.from(x.d, 'base64'))); return d; };
  const attendPret = async (cible, max) => { for (let i = 0; i < (max || 400); i++) { await dormir(250);
      const e = await ev('(function(){const p=dbgPrebati();return {e:p.etat,c:String(p.carte||"")};})()'); if (e.e === 'pret' && e.c.indexOf(cible) === 0) return true; } return false; };
  const attendLieu = async (cible, max) => { for (let i = 0; i < (max || 150); i++) { await dormir(200); const k = await cas(); if (k.lieu === cible && !k.ph) return k; } return await cas(); };
  /* le portail vers `cible` depuis la map en cours, comme vivant.cjs */
  const portail = async (cible) => { await ev(`window.__ev.length=0;try{dbgClassique('${cible}');}catch(e){}dbgImmortel(true);1`);
    const I = { cible, de: (await cas()).lieu, t: Math.round((Date.now() - T0) / 1000) };
    await ev('dbgPortail(1400);1'); I.pret = await attendPret(cible); await ev('dbgPortail(260);1');
    I.etat = await attendLieu(cible); return I; };
  let iEsp = 0;
  for (let k = 1; k < SUITE.length; k++) {
    if ((Date.now() - T0) / 1000 > MAXT - 60) { R.coupe = 'temps'; break; }
    const cible = SUITE[k];
    if (cible === 'espace') { const m = MONTE[iEsp] || 0; const mt = []; for (let q = 0; q < m; q++) { mt.push(await ev('dbgMoteur()')); await dormir(700); } if (m) await dormir(2500); R['moteur' + iEsp] = mt;
      if (A.force) R['force' + iEsp] = await ev(`__E.force(${JSON.stringify(Object.assign({ cx: '', ouv: '', rel: '', fin: '', sil: '' }, FORCE[iEsp] || {}))})`); }
    const lieu = (await cas()).lieu;
    let P;
    if (lieu === cible) P = { cible, deja: 1, etat: await cas() };
    else P = await portail(cible);
    console.log(JSON.stringify({ k, cible, pret: P.pret, lieu: P.etat && P.etat.lieu, kmh: P.etat && P.etat.kmh }));
    if (!P.etat || P.etat.lieu !== cible) { R.visites.push(P); R.coupe = 'portail raté vers ' + cible; break; }
    if (cible !== 'espace') { R.visites.push(P); await dormir(2500); ecrit(); continue; }
    /* DANS L'ESPACE */
    const V = { n: iEsp, entree: P, t0: Math.round((Date.now() - T0) / 1000), rows: [], anom: [], photos: [], morts: [] };
    const suiv = SUITE[k + 1] || 'nuages';
    await ev(`__E.anom.length=0;__E.vide();__E.cache=null;try{dbgClassique('${suiv}');}catch(e){}1`);
    V.route = await ev('(function(){const r=dbgRoute();let u=null;try{u=dbgOrbU();}catch(e){u="err "+e.message;}return JSON.stringify({L:Math.round(r.L),NP:r.NP,u:u&&u.der?u.der:u,mods:dbgMods()});})()').then(JSON.parse).catch(e => 'err ' + e.message);
    try { V.voyage = JSON.parse(await ev('(function(){try{const v=dbgVoyage();delete v.vues;return JSON.stringify(v);}catch(e){return JSON.stringify("err "+e.message);}})()')); } catch (e) { V.voyage = String(e); }
    console.log('espace', iEsp, JSON.stringify(V.route && V.route.u), (V.route && V.route.mods || []).map(m => m.fig + '@' + m.s0).join(' '));
    await dormir(2000); V.pieces = await ev('JSON.stringify(__E.pieces())').then(JSON.parse).catch(e => 'err ' + e.message);
    await ev(`dbgImmortel(${MORTEL ? 'false' : 'true'});dbgAuto(1,0,{nit:0,vol:true,saut:${SAUT},latK:0});1`);
    photoOn = true; let vu = 0, tV = Date.now(), sorti = false, nDump = 0, tVue = 0; const dVue = path.join(OUT, 'v' + iEsp + '-vues'); fs.mkdirSync(dVue, { recursive: true });
    while ((Date.now() - tV) / 1000 < MAXV) {
      await dormir(500);
      const st = await ev('(function(){const k=dbgPortvCas(),r=__E.anom;return JSON.stringify({k:k,a:r.slice(' + vu + '),rows:__E.vide(),err:__E.err||__E.errRay||null});})()').then(JSON.parse).catch(e => null);
      if (!st) continue;
      V.rows.push(...st.rows); if (st.err) V.errCrochet = st.err;
      if (Date.now() - tVue > (+A.vue || 3000) && anneau.length) { tVue = Date.now(); const x = anneau[anneau.length - 1], r9 = st.rows[st.rows.length - 1]; fs.writeFileSync(path.join(dVue, 't' + x.t + '-s' + (r9 ? r9[1] : st.k.s) + '-' + (r9 && r9[19] || 'liaison') + '.jpg'), Buffer.from(x.d, 'base64')); }
      for (const a of st.a) { vu++; V.anom.push(a); console.log('  anomalie', a.k, 's=' + a.s, a.mod, JSON.stringify(a.v));
        if (nDump < 8 && dumps.filter(d => d.k === a.k).length < 2) { nDump++; const nom = `v${iEsp}-${a.k.replace(/[^a-z0-9]+/gi, '-')}-s${a.s}`; const d = await vide(nom); dumps.push({ k: a.k, d }); V.photos.push({ k: a.k, s: a.s, mod: a.mod, d: path.relative(RACINE, d) }); } }
      { const r9 = st.rows[st.rows.length - 1], md = r9 && r9[19];
        if (md && TUE.indexOf(md) >= 0 && !(V.tues || []).includes(md) && !st.k.gameOver && st.k.mode === 'drive') { const m0 = V.route.mods.find(m => m.fig === md);
          if (!m0 || r9[1] > (m0.s0 + m0.s1) / 2 - 400) { (V.tues = V.tues || []).push(md); V.tueA = V.tueA || [];
            V.tueA.push({ md, s: r9[1], r: await ev("new Promise(function(ok){dbgImmortel(false);let k=0;const f=function(){k++;dbgChance('mort');const d=dbgState();if(d.gameOver||d.mode==='boom'||k>400)return ok(k+' '+d.mode);setTimeout(f,0);};f();})") });
            console.log('  TUÉE dans', md, 's=' + r9[1]); st.k = await cas(); } } }
      if (st.k.gameOver || st.k.mode === 'boom') {
        const m = { s: st.k.s, t: Math.round((Date.now() - T0) / 1000), mode: st.k.mode, cause: await ev('dbgRoute().cause').catch(() => null) };
        await dormir(2500); m.chance = await ev('JSON.stringify(dbgChance())').then(JSON.parse).catch(() => null);
        m.joue = await ev('JSON.stringify(dbgChance("joue"))').catch(e => String(e)); await dormir(4500); m.apres = await cas(); m.apresDalle = await ev('JSON.stringify(__E.rows.slice(-3))').catch(() => null);
        V.morts.push(m); console.log('  MORT', JSON.stringify(m).slice(0, 300));
        if (m.apres.gameOver || !m.apres.started) { V.finPartie = 1; break; }
        await ev(`dbgAuto(1,0,{nit:0,vol:true,saut:${SAUT},latK:0});1`); }
      if (st.k.lieu !== 'espace' && !st.k.ph) { sorti = true; V.sortie = st.k; break; }
    }
    photoOn = false; V.duree = Math.round((Date.now() - tV) / 1000); V.sortiParPortail = sorti;
    V.rows.push(...(await ev('JSON.stringify(__E.vide())').then(JSON.parse).catch(() => [])));
    V.verif = await ev('JSON.stringify((function(){const v=dbgRouteVerif();return {on:v.on,n:v.n,ko:v.ko,err:v.err,l:v.l};})())').then(JSON.parse).catch(e => 'err ' + e.message);
    await ev('dbgImmortel(true);1');
    R.visites.push(V); ecrit(); iEsp++;
    if (V.finPartie) { R.coupe = 'partie finie'; break; }
    if (!sorti && k + 1 < SUITE.length) { /* pas sorti à temps : on reprend par le portail suivant comme ailleurs */ }
  }
  R.verif = await ev('JSON.stringify(dbgRouteVerif())').then(JSON.parse).catch(() => null);
  R.erreurs = await ev('JSON.stringify(window.dbgErreurs?dbgErreurs():null)').catch(() => null);
  R.nPhotos = nPhotos; R.fin = new Date().toISOString(); ecrit(); console.log('fin'); fin(0);
})().catch(e => { console.error(e); R.err = String(e && e.stack || e); ecrit(); process.exit(3); });
