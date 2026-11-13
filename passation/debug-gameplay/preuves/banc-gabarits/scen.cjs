/* BANC SCÉNARIOS (2026-11-10, chasse aux bugs de JEU) : un Chrome, une map, un scénario.
   node scen.cjs --scen roches|rot|ville --map espace --meteo soir --tag x [--palier 2] [--dpr 3] [--prof dossier]
   roches : les roches de Jupiter (a existence, b mort en vol cause « roche » + photo, c vol à 3 m à côté, e portail)
   rot    : portrait 390x844 (30 s) → rotations en roulant puis en vol → paysage 844x390 (30 s) ; FOV, distance caméra-caisse, position à l'écran
   Sortie : <tag>.jsonl + <tag>.log (même esprit que gab.cjs). Muet. */
const fs = require('fs'), path = require('path');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir, tmp } = require('/Users/sachaberes/cash-car/debug-gameplay/outils/banc-trainees/cdp.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = A.jeu || '/Users/sachaberes/cash-car/debug-gameplay/VERSION PRINCIPALE', P_HTTP = +(A.http || 8841), P_CDP = +(A.cdp || 9741);
const SCEN = A.scen, MAP = A.map || 'espace', METEO = A.meteo || 'matin', DPR = +(A.dpr || 3), PAL = A.palier == null ? '2' : A.palier, TAG = A.tag || (SCEN + '-' + MAP);
const TMAX = +(A.tmax || 30);
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const LANGA = A.lang || 'fr';
const SAVE = { v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, bank: 48500, aura: 1200, auraMax: 3000, owned: [0, 1, 2, 3], plq: { ok: 1 } };
const OUT = __dirname, JL = path.join(OUT, TAG + '.jsonl'), LG = path.join(OUT, TAG + '.log');
const lg = (s) => { fs.appendFileSync(LG, s + '\n'); console.log(s); };
const jl = (o) => fs.appendFileSync(JL, JSON.stringify(o) + '\n');
const hash = (s) => { let h = 7; for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h; };
const seedSrc = (n) => `(function(){var a=${n >>> 0};Math.random=function(){a=(a+0x6D2B79F5)>>>0;var t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};})();`;
(async () => {
  for (const p of [P_HTTP, P_CDP]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  const srv = await serveur(JEU, P_HTTP), prof = A.prof || tmp();
  let W = 390, H = 844;
  const { ch, pg } = await lanceChrome(P_CDP, prof, W, H);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  let err = [], con = [], cur = 'init';
  c.ws.addEventListener('message', e => { try { const m = JSON.parse(e.data);
    if (m.method === 'Runtime.exceptionThrown') { const d = m.params.exceptionDetails; err.push(cur + ' | ' + ((d.exception && d.exception.description) || d.text || '').slice(0, 300)); }
    if (m.method === 'Log.entryAdded') { const t = String(m.params.entry.text || ''); if (!/^(Autofocus|\[Deprecation|\[Violation)/.test(t)) con.push(cur + ' | log(' + m.params.entry.level + '): ' + t.slice(0, 200)); }
    if (m.method === 'Runtime.consoleAPICalled' && (m.params.type === 'error' || m.params.type === 'warning')) con.push(cur + ' | ' + m.params.type + ': ' + m.params.args.map(a => a.value !== undefined ? String(a.value) : (a.description || a.type)).join(' ').slice(0, 300));
  } catch (x) {} });
  const fin = () => { try { c.close(); } catch (e) {} tueChrome(ch); srv.close(); };
  process.on('SIGTERM', () => { fin(); process.exit(1); });
  const ev = async (e, t) => { try { return await c.ev(e, t || 20000); } catch (x) { return 'ERR ' + String(x.message).slice(0, 160); } };
  const attend = async (expr, ms, pas) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { try { if (await c.ev(expr, 8000)) return true; } catch (e) {} await dormir(pas || 400); } return false; };
  const tapTexte = async (re) => { const r = await c.ev(`(function(){const R=new RegExp(${JSON.stringify(re)},'i');for(const e of document.querySelectorAll('button,.pbtn,[role=button]')){const b=e.getBoundingClientRect();if(b.width<1||b.height<1)continue;if(R.test(e.textContent||''))return [b.left+b.width/2,b.top+b.height/2,(e.textContent||'').trim().slice(0,30)];}return null;})()`);
    if (!r) return null;
    await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: r[0], y: r[1] }] }); await dormir(60);
    await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); return r[2]; };
  const shot = async (nom) => { try { const sh = await c.send('Page.captureScreenshot', { format: 'jpeg', quality: 55 }); fs.writeFileSync(path.join(OUT, nom + '.jpg'), Buffer.from(sh.data, 'base64')); return nom + '.jpg'; } catch (x) { return 'ERR ' + x.message.slice(0, 60); } };
  const metrics = async (w, h) => { W = w; H = h; await c.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: DPR, mobile: true, screenWidth: w, screenHeight: h, screenOrientation: w > h ? { type: 'landscapePrimary', angle: 90 } : { type: 'portraitPrimary', angle: 0 } }); };
  const rotation = async (w, h) => { await metrics(w, h); await ev("window.dispatchEvent(new Event('orientationchange'));1"); };
  /* la mesure d'une image : état + caméra + position de la caisse à l'écran */
  const MES = "(function(){var s=dbgState(),S=dbgScene(),cam=S.cam,p=S.car.position.clone();var cp=cam.position,d=cp.distanceTo(p);var q=p.clone().project(cam);var r={m:s.mode,go:s.gameOver,pa:s.paused,s:Math.round(s.s),lat:+(+s.lat).toFixed(1),vA:s.vA,iw:innerWidth,ih:innerHeight,asp:+cam.aspect.toFixed(3),fov:+cam.fov.toFixed(1),dist:+d.toFixed(1),nx:+q.x.toFixed(2),ny:+q.y.toFixed(2),nz:+q.z.toFixed(3),cw:S.rdr.domElement.width,ch:S.rdr.domElement.height};r.nan=[q.x,q.y,d,cp.x,cp.y,cp.z].some(function(v){return !isFinite(v)});r.dedans=r.nz<1&&Math.abs(q.x)<=1&&Math.abs(q.y)<=1;return r;})()";
  const sonde = "(function(){var s=dbgState();return {st:s.started,go:s.gameOver,pa:s.paused,m:s.mode,s:s.s,lat:s.lat,vA:s.vA,vH:s.vH,h:s.hOff,psi:s.psi,lv:s.level,cg:s.coinsGot};})()";
  const cause = () => ev("(function(){try{return dbgSautFig('cause').cause}catch(e){return 'ERR'}})()");
  async function rejouer() {
    for (let k = 0; k < 6; k++) {
      try { const sp = await ev('dbgSpin().ouvert'); if (sp === true) { await ev('dbgSpin(0);1'); await tapTexte('TIRER|SPIN'); await dormir(1500); } } catch (e) {}
      const r = await tapTexte('REJOUER|RETRY|PLAY AGAIN');
      if (await attend("!dbgState().gameOver", 6000, 300)) return r + (k ? ' (essai ' + (k + 1) + ')' : '');
      await dormir(2000);
    }
    return 'SANS EFFET';
  }
  async function ouvre(map, meteo, w, h, seed) {
    cur = TAG + '/' + map + '#charge'; await metrics(w, h);
    await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' });
    await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
    await c.send('Page.navigate', { url: 'about:blank' }); await dormir(300);
    const sid = (await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAVE)) + ')' + (LANGA ? ';localStorage.setItem("ccLang","' + LANGA + '")' : '') + '}catch(e){}' + seedSrc(seed) })).identifier;
    await c.send('Page.navigate', { url: `http://127.0.0.1:${P_HTTP}/index.html?colonne=0&tel=1&simu=1&garde=1&intro=ancien&attente=0&palier=${PAL}${A.extra || ''}` });
    const pret = await attend("!!window.__gameReady&&typeof dbgState==='function'&&document.getElementById('mHome').classList.contains('on')", 300000, 1000);
    if (!pret) { lg('!! jeu pas prêt'); return false; }
    await dormir(2500);
    const cl = await ev("dbgClassique('" + map + "','" + meteo + "')"); lg('  dbgClassique ' + JSON.stringify(cl).slice(0, 120));
    await ev("(function(){const s=document.getElementById('splash');if(s){s.dispatchEvent(new Event('touchstart'));s.click();}return 1;})()"); await dormir(800);
    const r = await ev('dbgJouer()'); lg('  dbgJouer ' + JSON.stringify(r).slice(0, 80));
    const ok = await attend("(function(){const s=dbgState();return s.started&&!s.gameOver&&s.mode==='drive';})()", 60000, 400);
    await c.send('Page.removeScriptToEvaluateOnNewDocument', { identifier: sid });
    return ok;
  }
  try {
    await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Network.enable'); await c.send('Log.enable');
    const seed = hash(MAP) + 7;

    if (SCEN === 'roches') {
      if (!(await ouvre(MAP, METEO, 390, 844, seed))) throw new Error('pas de départ');
      await ev("dbgAuto(1,0,{vol:true});1"); await dormir(2500);
      const o1 = await ev("JSON.stringify(dbgOrbite())"); lg('(a) dbgOrbite : ' + String(o1).slice(0, 400)); jl({ a: o1 });
      const nf = await ev("(function(){var S=dbgScene().scene,n=0,v=null;S.traverse(function(o){if(o.name==='orbite roches'){n=o.count;v=o.visible}});return {count:n,visible:v,niveau:(function(){try{return JSON.stringify(dbgNiveau()).slice(0,200)}catch(e){return 'ERR'}})()}})()"); lg('    roches (scène) ' + JSON.stringify(nf)); jl({ a2: nf });
      /* (b)/(c) : un SAUT naturel du pilote (dbgAuto saut) ; en l'air, la plus grosse roche est POSÉE devant la caisse (position prédite par les déplacements d'image) :
         (b) centrée sur le trajet → doit tuer « roche » ; (c) reculée de côté, horizontalement, de h+3 m (h = l'appui de l'ellipsoïde de choc .86·S+.9 dans cette direction) → ne doit pas tuer */
      const HOOK = `window.__rcT=function(decale){var S=dbgScene(),im=null;S.scene.traverse(function(o){if(o.name==='orbite roches')im=o});if(!im||!im.count)return 'pas de roches';
        var M=new THREE.Matrix4(),P=new THREE.Vector3(),Q=new THREE.Quaternion(),Sc=new THREE.Vector3(),best=-1,mx=0;for(var i=0;i<im.count;i++){im.getMatrixAt(i,M);M.decompose(P,Q,Sc);var m=Sc.x+Sc.y+Sc.z;if(m>mx&&Sc.x<24&&Sc.y<24&&Sc.z<24){mx=m;best=i}}
        im.getMatrixAt(best,M);M.decompose(P,Q,Sc);var st={k:0,p:[],done:0,res:null,fr:0,emin:1e9,morts:0,dmin:1e9,start:null,n:im.count,decale:decale,rad:Sc.toArray().map(function(v){return +v.toFixed(1)})};window.__rcS=st;
        var e=function(pos){var l=pos.clone().sub(st.C||P).applyQuaternion(Q.clone().invert());return Math.pow(l.x/(Sc.x*.86+.9),2)+Math.pow(l.y/(Sc.y*.86+.9),2)+Math.pow(l.z/(Sc.z*.86+.9),2)};
        function f(){var d=dbgState();if(d.gameOver){st.mort=1;st.fin=d.mode;return}if(st.done>=2&&st.fr>400){return}
          if(d.mode==='fall'){var c=S.car.position.clone();if(st.p.length&&c.distanceTo(st.p[st.p.length-1])<1e-4){requestAnimationFrame(f);return}st.p.push(c);
            if(st.p.length>=4&&!st.done){var n=st.p.length,d1=st.p[n-1].clone().sub(st.p[n-2]),d0=st.p[n-2].clone().sub(st.p[n-3]),a=d1.clone().sub(d0),N=4;var C=st.p[n-1].clone().addScaledVector(d1,N).addScaledVector(a,N*N/2);
              if(decale){var u=new THREE.Vector3(0,1,0);var dn=d1.clone().normalize();u.set(-dn.z,0,dn.x);if(u.lengthSq()<1e-6)u.set(1,0,0);u.normalize();var ul=u.clone().applyQuaternion(Q.clone().invert());var h=Math.sqrt(Math.pow(Sc.x*.86+.9,2)*ul.x*ul.x+Math.pow(Sc.y*.86+.9,2)*ul.y*ul.y+Math.pow(Sc.z*.86+.9,2)*ul.z*ul.z);C.addScaledVector(u,h+3);st.h=+h.toFixed(1)}
              st.C=C.clone();M.compose(C,Q,Sc);im.setMatrixAt(best,M);im.instanceMatrix.needsUpdate=true;im.count=st.n-1;st.done=1;st.fr=0;st.v=+d1.length().toFixed(2);st.centre=[C.x,C.y,C.z].map(function(v){return Math.round(v)});st.carpos=[c.x,c.y,c.z].map(function(v){return Math.round(v)});}
            else if(st.done===1){im.count=st.n;im.instanceMatrix.needsUpdate=true;st.done=2}
            if(st.done){st.fr++;var ee=e(c);if(ee<st.emin)st.emin=ee;}}
          else if(st.done>=2&&st.fr>3){st.atterri=d.mode;return}
          requestAnimationFrame(f)}
        requestAnimationFrame(f);return 'armé '+best};1`;
      await ev(HOOK);
      const assureRoches = async () => { for (let k = 0; k < 8; k++) { await dormir(1500); const n = await ev('dbgOrbite().roches'); if (n > 0) return n; const lieu = await ev("(function(){try{return dbgNiveau().lieu}catch(e){return '?'}})()"); lg('    (piste « ' + lieu + ' / ' + (await ev('dbgOrbite().peuple')) + ' », roches=' + n + ' : on rejoue)'); const o = await ev(sonde); if (!o.go) { await ev("dbgDauphin('boom');1"); await attend("dbgState().gameOver", 15000, 300); } await dormir(3000); await ev("dbgClassique('" + MAP + "','" + METEO + "');1"); await rejouer(); await dormir(4000); } return 0; };
      const volRoche = async (nom, decale) => {
        await assureRoches(); await ev("dbgAuto(1,0,{vol:true,saut:2});1"); const arm = await ev('window.__rcT(' + (decale ? 1 : 0) + ')'); lg(nom + ' ' + arm);
        const t0 = Date.now(); let mort = false;
        while (Date.now() - t0 < 40000) { await dormir(300); const st = await ev('JSON.stringify(window.__rcS)'); const o = await ev(sonde); if (o.go) { mort = true; break; } if (/"atterri"/.test(String(st))) break; }
        const ca = await cause(); const st = await ev('JSON.stringify(window.__rcS&&Object.assign({},window.__rcS,{p:undefined}))'); let ph = null, ecr = null, txt = null;
        if (mort) { await dormir(3500); ph = await shot('roches-mort-' + TAG + (decale ? '-c' : '-b')); txt = await ev("(function(){var e=document.getElementById('mCause');return 'mCause=['+(e?e.textContent:'?')+'] disp='+(e?getComputedStyle(e).display:'')+' | '+document.body.innerText.slice(0,100).replace(/\\n/g,' | ')})()"); }
        lg(nom + ' mort=' + mort + ' cause=' + ca + ' photo=' + ph + ' ' + txt + ' état=' + st); jl({ vol: nom, mort, cause: ca, photo: ph, txt, st }); return mort;
      };
      if (A.only !== 'c') { await volRoche('(b) roche posée SUR le trajet', false);
      { const rj = await rejouer(); lg('    REJOUER : ' + rj); } }
      await ev("dbgAuto(1,0,{vol:true});1"); await dormir(1500);
      await volRoche('(c) roche posée à 3 m du trajet', true);
      { const rj2 = await rejouer(); lg('    REJOUER : ' + rj2); }
      /* (e) portail venant de l'orbite : plus aucune roche ensuite */
      await assureRoches(); await ev("dbgAuto(1,0,{vol:true});1"); await dormir(3000);
      const av = await ev("JSON.stringify({o:dbgOrbite(),niv:dbgNiveau&&dbgNiveau()})"); lg('(e) avant portail : ' + String(av).slice(0, 300));
      lg('    portail : ' + JSON.stringify(await ev('dbgPortail(450)')));
      let zone = null, tz = Date.now(), morts = [];
      while (Date.now() - tz < 70000) { await dormir(1000); const o = await ev(sonde); if (o.go) { morts.push({ s: Math.round(o.s), cause: await cause(), m: o.m }); break; } const z = await ev("dbgEco().zones"); if (z >= 1 && zone == null) { zone = Date.now(); lg('    zone suivante atteinte'); } if (zone && Date.now() - zone > 14000) break; }
      const ap = await ev("JSON.stringify({o:dbgOrbite(),carte:dbgClassique()})"); const rv = await ev("(function(){var S=dbgScene().scene,v=null,n=null;S.traverse(function(o){if(o.name==='orbite roches'){v=o.visible;n=o.count}});return {visible:v,count:n}})()");
      lg('(e) après portail : roches=' + rv && JSON.stringify(rv) + ' morts=' + JSON.stringify(morts) + ' orbite=' + String(ap).slice(0, 300)); jl({ e: { rv, morts, ap: String(ap).slice(0, 400) } });
    }


    if (SCEN === 'sat') {
      if (!(await ouvre(MAP, METEO, 390, 844, seed))) throw new Error('pas de départ');
      await ev("dbgAuto(1,0,{vol:true});1"); await dormir(3000);
      lg('dbgOrbite : ' + String(await ev("JSON.stringify(dbgOrbite())")).slice(0, 300));
      const mes = await ev(`(function(){var S=dbgScene().scene,out=[],M=new THREE.Matrix4(),P=new THREE.Vector3(),Q=new THREE.Quaternion(),Sc=new THREE.Vector3();
        S.traverse(function(o){if(o.name!=='orbite satellites')return;var g=o.geometry,pos=g.attributes.position,rs=[],bx=[1e9,1e9,1e9,-1e9,-1e9,-1e9];
          for(var i=0;i<pos.count;i++){var x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i);rs.push(Math.hypot(x,y,z));bx[0]=Math.min(bx[0],x);bx[1]=Math.min(bx[1],y);bx[2]=Math.min(bx[2],z);bx[3]=Math.max(bx[3],x);bx[4]=Math.max(bx[4],y);bx[5]=Math.max(bx[5],z);}
          rs.sort(function(a,b){return a-b});var q=function(p){return +rs[Math.floor(p*(rs.length-1))].toFixed(3)};
          var A=g.attributes,fl=0,tr=0,sc=[],dep=[];for(var i=0;i<o.count;i++){o.getMatrixAt(i,M);M.decompose(P,Q,Sc);sc.push(Sc.x);var mw=A.aMov?A.aMov.getW(i):0;if(mw===0)fl++;else{tr++;if(dep.length<6)dep.push({mov:[A.aMov.getX(i),A.aMov.getY(i),A.aMov.getZ(i),mw].map(function(v){return +v.toFixed(2)}),tr:[A.aTr.getX(i),A.aTr.getY(i)].map(function(v){return +v.toFixed(1)})});}}
          sc.sort(function(a,b){return a-b});out.push({n:o.count,visible:o.visible,verts:pos.count,bbox:bx.map(function(v){return +v.toFixed(2)}),rayon:{p50:q(.5),p90:q(.9),max:q(1)},flottants:fl,trains:tr,echelle:[sc[0],sc[sc.length-1]].map(function(v){return +(v||0).toFixed(1)}),trainsEx:dep});});return out;})()`);
      lg('(mesures corps vs sphère dure) ' + JSON.stringify(mes)); jl({ mes });
      let prep = null, ok = false, tentatives = 0, tri = [];
      for (let k = 0; k < 14 && !(ok && (await cause()) === 'satellite'); k++) {
        const o0 = await ev(sonde);
        if (o0.go) { await dormir(2500); await rejouer(); await dormir(2500); await ev("dbgAuto(1,0,{vol:true});1"); await dormir(2500); }
        if (!((await ev('dbgOrbite().starlink')) > 0)) { await ev("dbgDauphin('boom');1"); await attend("dbgState().gameOver", 15000, 300); await dormir(2500); await rejouer(); await dormir(2500); await ev("dbgAuto(1,0,{vol:true});1"); await dormir(2500); }
        const els = [0, 0.08, -0.04, 0.16, 0.04, 0.24][k % 6];
        prep = await ev('JSON.stringify(dbgImpact(25,170,' + els + '))'); tentatives++;
        if (!/dist/.test(String(prep))) { tri.push([k, 'rien']); await dormir(1200); continue; }
        ok = await attend("dbgState().gameOver", 6000, 150); const c9 = ok ? await cause() : 'pas mort'; tri.push([k, els, prep.slice(0, 40), c9]);
        if (!ok) { await attend("dbgState().mode==='drive'", 4000, 200); }
      }
      lg('(hit) tentatives=' + JSON.stringify(tri));
      const ca = await cause(); await dormir(3500);
      const txt = await ev("(function(){var e=document.getElementById('mCause');if(!e)return 'mCause absent';var r=e.getBoundingClientRect(),cs=getComputedStyle(e),p=e,chain=[];while(p&&p!==document.body){var c=getComputedStyle(p);if(c.display==='none'||c.visibility==='hidden'||+c.opacity===0)chain.push(p.id||p.className);p=p.parentElement}return 'mCause=['+e.textContent+'] disp='+cs.display+' rect='+[r.width,r.height].map(Math.round)+' cachéPar='+JSON.stringify(chain)+' html.c6='+document.documentElement.classList.contains('c6')+' mDead='+(document.getElementById('mDead')||{}).className})()"); const ph = await shot('sat-mort-' + TAG);
      lg('    mort=' + ok + ' cause=' + ca + ' ' + txt + ' photo=' + ph); jl({ hit: prep, mort: ok, cause: ca, txt, ph, tentatives });
    }


    if (SCEN === 'portail') {
      if (!(await ouvre(MAP, METEO, 390, 844, seed))) throw new Error('pas de départ');
      await ev("dbgAuto(1,0,{vol:true});1"); await dormir(2500);
      const z0 = await ev('dbgEco().zones'); const pr = await ev('dbgPortail(450)'); lg('portail : ' + JSON.stringify(pr) + ' zones0=' + z0);
      const L = pr && pr.L, t0 = Date.now(); let tHeld = null, tRel = null, sH = 0, sPrev = -1, ech = [], mort = null, zone1 = null;
      while (Date.now() - t0 < 120000) {
        await dormir(200); const o = await ev("(function(){var s=dbgState();var w=document.getElementById('wipe');var v=document.querySelector('.portV,#portV,#pcVoile');return {s:s.s,m:s.mode,go:s.gameOver,z:dbgEco().zones,w:w?getComputedStyle(w).opacity:null,v:v?getComputedStyle(v).opacity:null}})()");
        const t = (Date.now() - t0) / 1000; if (typeof o !== 'object') break; if (o.go) { mort = { t, s: o.s, cause: await cause() }; break; }
        if (ech.length < 400 && (ech.length % 5 === 0 || tHeld)) ech.push([+t.toFixed(1), Math.round(o.s), o.m, o.z, o.w, o.v]);
        if (tHeld == null && L && o.s >= L - 2.5) { tHeld = t; sH = o.s; lg('  tenue à L-2 à t=' + t.toFixed(1) + ' s=' + o.s + ' zones=' + o.z); }
        if (tHeld != null && tRel == null && Math.abs(o.s - sH) > 5) { tRel = t; zone1 = o; lg('  relâchée à t=' + t.toFixed(1) + ' : ' + JSON.stringify(o)); await dormir(4000); const o2 = await ev(sonde); lg('  4 s après : ' + JSON.stringify(o2)); break; }
      }
      const f = { portail: MAP, L, tHeld, tRel, tenueS: tHeld != null && tRel != null ? +(tRel - tHeld).toFixed(1) : null, mort, zone1 };
      lg('RÉSULTAT ' + JSON.stringify(f)); jl(f); jl({ ech: ech.slice(0, 300) });
    }


    if (SCEN === 'garde') {
      /* LE GARDE DE COURSE (JC-02) : profil neuf (fait par l'appelant), 390x844, ?tel=1&app=1 ; --khr 0 : getExtension rend null pour KHR_parallel_shader_compile ; --jouer tot|tard */
      const KHR = A.khr !== '0', TARD = A.jouer === 'tard';
      cur = TAG + '/charge'; await metrics(390, 844);
      await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
      await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' });
      await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
      const noK = `(function(){function pat(C){if(!C)return;var g=C.prototype.getExtension;C.prototype.getExtension=function(n){if(n==='KHR_parallel_shader_compile')return null;return g.call(this,n)};var h=C.prototype.getSupportedExtensions;C.prototype.getSupportedExtensions=function(){var r=h.call(this);return r?r.filter(function(x){return x!=='KHR_parallel_shader_compile'}):r}}pat(window.WebGLRenderingContext);pat(window.WebGL2RenderingContext)})();`;
      const gapSrc = `window.__g={max:0,last:performance.now(),n:0};(function f(t){var d=t-window.__g.last;window.__g.last=t;if(d>window.__g.max)window.__g.max=d;window.__g.n++;requestAnimationFrame(f)})(performance.now());`;
      await c.send('Page.navigate', { url: 'about:blank' }); await dormir(300);
      await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAVE)) + ');localStorage.setItem("ccLang","fr")}catch(e){}' + seedSrc(seed) + (KHR ? '' : noK) + gapSrc });
      try { await c.send('Page.bringToFront'); await c.send('Emulation.setFocusEmulationEnabled', { enabled: true }); } catch (e) {}
      const t00 = Date.now();
      await c.send('Page.navigate', { url: `http://127.0.0.1:${P_HTTP}/index.html?tel=1&app=1&colonne=0&intro=ancien&palier=${PAL}` });
      const pret = await attend("!!window.__gameReady&&typeof dbgState==='function'&&document.getElementById('mHome').classList.contains('on')", 300000, 500);
      const tMenu = (Date.now() - t00) / 1000; lg('menu prêt en ' + tMenu.toFixed(1) + ' s ; ext=' + (await ev('dbgLier().ext')) + ' temps=' + (await ev('dbgLier().garde.temps')) + ' pret=' + pret);
      if (TARD) { await dormir(Math.max(0, 40000 - (Date.now() - t00 - tMenu * 1000))); }
      lg('vis=' + (await ev("JSON.stringify({v:document.visibilityState,f:document.hasFocus(),n:window.__g.n})")) + ' (rAF après 3 s : ' + (await (async()=>{await dormir(3000);return ev('window.__g.n')})()) + ')');
      lg('chauffe/menu : ' + JSON.stringify(await ev('JSON.stringify({l:dbgLier()})')).slice(0, 700));
      lg('KHR dispo dans ce Chrome (getSupportedExtensions) : ' + (await ev("(function(){try{var c=document.createElement('canvas').getContext('webgl2');return c?c.getSupportedExtensions().indexOf('KHR_parallel_shader_compile')>=0:'pas de webgl2'}catch(e){return 'ERR'}})()")));
      await ev("dbgClassique('nuages','matin')"); await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 195, y: 420 }] }); await dormir(60); await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await dormir(800);
      const tJ = Date.now(); let tapN = 0, ok0 = false;
      for (let k = 0; k < 60 && !ok0; k++) { const r = await tapTexte('^\\s*JOUER|^\\s*PLAY'); if (r) tapN++; ok0 = await attend("(function(){const s=dbgState();return s.started&&!s.gameOver&&s.mode==='drive';})()", 2500, 300); }
      lg('JOUER tapé ' + tapN + ' fois');
      const attenteDepart = (Date.now() - tJ) / 1000; lg('JOUER ' + (TARD ? 'tard' : 'tôt') + ' : départ en ' + attenteDepart.toFixed(1) + ' s (chauffe attendue) ok=' + ok0 + ' ; garde=' + JSON.stringify(await ev('JSON.stringify(dbgLier().garde)')));
      if (!ok0) { lg('départ raté : ' + (await ev("JSON.stringify({b:Array.from(document.querySelectorAll('button,.pbtn,[role=button]')).filter(function(e){var r=e.getBoundingClientRect();return r.width>1}).map(function(e){return (e.textContent||'').trim().slice(0,18)}).slice(0,14),body:document.body.className.slice(0,120),st:dbgState()})")).slice(0, 700)); await shot('garde-depart-rate-' + TAG); }
      jl({ run: TAG, khr: KHR, jouer: TARD ? 'tard' : 'tot', tMenu, attenteDepart });
      await ev("dbgAuto(1,0,{vol:true});1");
      const LISTE = `(function(){var S=dbgScene(),sc=S.scene,r=S.rdr,car=S.car.position,out=[],v=new THREE.Vector3();sc.traverse(function(o){if(!o.isMesh||!o.visible||!o.material)return;var p=o.parent,vis=true;while(p){if(!p.visible){vis=false;break}p=p.parent}if(!vis)return;var M=[].concat(o.material),cache=null;
        for(var k=0;k<M.length;k++){var m=M[k];if(m.visible===false)continue;var pr=r.properties.get(m).currentProgram;if(!pr||pr.__ccAtt===1){o.getWorldPosition(v);var d=Math.round(v.distanceTo(car));out.push([o.name||o.type,m.type+(m.name?':'+m.name:''),pr?'lié-attente':'pas né',d,o.isInstancedMesh?o.count:1,o.geometry?o.geometry.attributes.position.count:0]);break}}});return out})()`;
      const dests = [['jade', 'matin'], ['grotte', 'matin'], ['ville', 'matin'], ['canyon', 'matin'], ['espace', 'soir']];
      const res = [];
      for (const [map, met] of dests) {
        const o0 = await ev(sonde); if (o0.go) { await rejouer(); await attend("dbgState().mode==='drive'", 60000, 300); await ev("dbgAuto(1,0,{vol:true});1"); }
        const z0 = await ev('dbgEco().zones'); await ev("dbgClassique('" + map + "','" + met + "');1");
        const pr = await ev('dbgPortail(450)'); lg('--> portail vers ' + map + ' : ' + JSON.stringify(pr) + ' zones0=' + z0);
        const tP = Date.now(); let crossed = false;
        while (Date.now() - tP < 180000) { await dormir(300); const z = await ev('dbgEco().zones'); const o = await ev(sonde); if (o.go) break; if (z > z0) { crossed = true; break; } }
        const lieu = await ev("(function(){try{return dbgNiveau().lieu}catch(e){return '?'}})()");
        const tAppr = (Date.now() - tP) / 1000; lg('    franchi=' + crossed + ' lieu=' + lieu + ' après ' + tAppr.toFixed(1) + ' s');
        await ev('window.__g.max=0');
        const t0 = Date.now(), vus = new Map(), samples = []; let mort = null, photos = [0.5, 1, 2, 4], pi = 0, solideLong = 0;
        while (Date.now() - t0 < 8000) {
          await dormir(120);
          const t = (Date.now() - t0) / 1000;
          const info = await ev("JSON.stringify({l:dbgLier(),g:window.__g.max,L:" + LISTE + "})");
          let I; try { I = JSON.parse(info); } catch (e) { continue; }
          const proches = I.L.filter(x => x[3] < 150);
          for (const x of I.L) { const k = x[0] + '|' + x[1]; if (!vus.has(k)) vus.set(k, { nom: x[0], mat: x[1], prog: x[2], dmin: x[3], inst: x[4], verts: x[5], t0: t, t1: t }); const e = vus.get(k); e.t1 = t; e.dmin = Math.min(e.dmin, x[3]); }
          samples.push({ t: +t.toFixed(2), en: I.l.enCours, garde: I.l.garde, nCaches: I.L.length, proches: proches.length, gap: Math.round(I.g) });
          if (pi < photos.length && t >= photos[pi]) { await shot('garde-' + TAG + '-' + map + '-' + photos[pi] + 's'); pi++; }
          const oo = await ev(sonde); if (oo.go) { mort = { t, s: oo.s, cause: await cause(), proches: proches.map(x => x.slice(0, 4)) }; break; }
        }
        for (const e of vus.values()) if (e.dmin < 150) solideLong = Math.max(solideLong, +(e.t1 - e.t0).toFixed(2));
        const last = samples[samples.length - 1] || {}, mx = (k) => Math.max(0, ...samples.map(s => s[k] || 0));
        const R = { map, lieu, franchi: crossed, approcheS: +tAppr.toFixed(1), echantillons: samples.length, enCoursMax: mx('en'), cachesMax: mx('nCaches'), prochesMax: mx('proches'), invisibleSolideMaxS: solideLong, gelMaxMs: mx('gap'), mort,
          gardeFin: last.garde, objets: [...vus.values()].sort((a, b) => a.dmin - b.dmin).slice(0, 25) };
        lg('    ' + JSON.stringify(R).slice(0, 1500)); jl(R); res.push(R);
      }
    }

    if (SCEN === 'rot') {
      /* portrait 390x844 : course de TMAX s, puis rotations */
      for (const [nom, w, h] of [['debout', 390, 844], ['couché', 844, 390]]) {
        cur = TAG + '/' + nom;
        if (!(await ouvre(MAP, METEO, w, h, seed))) { lg('!! ' + nom + ' pas de départ'); jl({ map: MAP, orient: nom, demarre: false }); continue; }
        await ev("dbgAuto(1,0,{vol:true,saut:7});1");
        const t0 = Date.now(), ech = []; let dedansMin = 1, nanN = 0, horsN = 0, fige = 0, sPrev = -1, mortAt = null, pauseN = 0, modes = {};
        while ((Date.now() - t0) / 1000 < TMAX) {
          await dormir(1000); const m = await ev(MES); if (typeof m !== 'object') { lg('sonde ' + m); break; }
          ech.push(m); modes[m.m] = (modes[m.m] || 0) + 1; if (m.nan) nanN++; if (!m.dedans) horsN++; if (m.pa) pauseN++;
          if (m.go) { mortAt = { s: m.s, cause: await cause(), m: m.m }; break; }
          if (Math.abs(m.s - sPrev) < 0.5 && !m.pa && m.m === 'drive') fige++; else fige = 0; sPrev = m.s;
        }
        const ks = (k) => { const v = ech.map(e => e[k]).filter(x => typeof x === 'number'); return v.length ? [Math.min(...v), Math.max(...v)] : null; };
        const f = { map: MAP, orient: nom, w, h, courseS: Math.round((Date.now() - t0) / 1000), n: ech.length, modes, mort: mortAt, nan: nanN, horsCadre: horsN, pauses: pauseN, figeMax: fige, fov: ks('fov'), dist: ks('dist'), nx: ks('nx'), ny: ks('ny'), asp: ks('asp'), sMax: Math.max(...ech.map(e => e.s)), canvas: ech.length ? [ech[0].cw, ech[0].ch] : null };
        lg('  ' + nom + ' ' + JSON.stringify(f)); jl(f);
        if (nom === 'debout') {
          /* rotations en pleine course : debout → couché → debout, en roulant puis en vol */
          for (const phase of ['roulant', 'vol']) {
            if (mortAt || (await ev(sonde)).go) { const rj = await rejouer(); lg('  REJOUER avant ' + phase + ' : ' + rj); await ev("dbgAuto(1,0,{vol:true,saut:7});1"); await attend("dbgState().mode==='drive'", 20000, 300); mortAt = null; }
            if (phase === 'vol') { await ev("dbgAuto(1,0,{vol:true,saut:4,imp:40});1"); const okv = await attend("dbgState().mode==='fall'", 40000, 60); lg('  vol atteint pour la rotation : ' + okv); if (!okv) { jl({ rot: phase, vol: false }); continue; } }
            else await dormir(1500);
            const suite = [];
            for (const [lab, w2, h2] of [['→couché', 844, 390], ['→debout', 390, 844]]) {
              const mAv = (await ev(MES)).m; await rotation(w2, h2); const tt = Date.now(); const seq = [];
              while (Date.now() - tt < 3500) { await dormir(120); const m = await ev(MES); if (typeof m !== 'object') { seq.push('ERR ' + m); break; } seq.push(m); if (m.go) break; }
              const bad = seq.filter(m => typeof m === 'object'), mort = bad.find(m => m.go), pa = bad.some(m => m.pa), hors = bad.filter(m => !m.dedans).length, nn = bad.some(m => m.nan);
              const sa = Math.round(bad[0] ? bad[0].s : -1), sb = Math.round(bad.length ? bad[bad.length - 1].s : -1);
              const r = { map: MAP, rot: phase, sens: lab, modeAvant: mAv, mort: !!mort, pause: pa, horsCadre: hors, nan: nn, n: bad.length, s: [sa, sb], modes: [...new Set(bad.map(m => m.m))], aspApres: bad.length ? bad[bad.length - 1].asp : null, iw: bad.length ? [bad[0].iw, bad[0].ih] : null, fov: bad.length ? bad[bad.length - 1].fov : null, dist: bad.length ? bad[bad.length - 1].dist : null, nxy: bad.length ? [bad[bad.length - 1].nx, bad[bad.length - 1].ny] : null };
              if (mort) r.cause = await cause();
              lg('  rotation ' + phase + ' ' + lab + ' ' + JSON.stringify(r)); jl(r); suite.push(r);
              if (r.mort) break;
            }
            if (phase === 'vol') await shot('rot-vol-' + MAP);
          }
        }
      }
    }
  } catch (e) { lg('ÉCHEC : ' + String(e).slice(0, 300)); }
  lg('=== EXCEPTIONS (' + err.length + ')'); for (const x of [...new Set(err)]) lg(' - ' + x.replace(/\n/g, ' ⏎ '));
  lg('=== CONSOLE (' + con.length + ')'); for (const x of [...new Set(con)].filter(x => !/vibrate|READ-usage/.test(x)).slice(0, 30)) lg(' - ' + x);
  fin(); process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
