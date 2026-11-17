/* L'EMPREINTE DU MONDE BÂTI, A/B (2026-11-17, lot portv) : deux onglets d'un Chrome muet (deux pages du même dossier, ou deux variantes d'URL),
   dbgTrace({carte, graine, palier}) rebâtit la map d'un trait (newTrack : la route ET tout le décor, les nuages, la ville, la jade, la grotte, les pièces),
   puis une empreinte de la SCÈNE : chaque objet dessinable, dans l'ordre de la scène — sa géométrie au mot près (tous ses attributs, son index), ses instances
   (nombre et matrices), sa matière (type, couleur), sa matrice s'il est figé — et la ROUTE (pts, T, Nn, B, L au bit près). La scène est prise par
   THREE.WebGLRenderer.prototype.render (rien du jeu n'est touché). Deux relevés à 400 ms d'écart : ce qui bouge tout seul (caisse, particules…) est écarté.
   node outils/banc-portv/empreinte-ab.cjs [--pa index-ref.html] [--pb index.html] [--qa "&sans=portv"] [--qb ""] [--cartes nuages,ville,crypto,espace,jade,grotte,canyon] [--graines 1-3] [--paliers 0,10]
   Sert VERSION PRINCIPALE lui-même. À lancer sous ~/cash-car/verrou-banc.sh. */
const fs = require('fs'), path = require('path');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir, tmp } = require('../banc-trainees/cdp.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const CARTES = (A.cartes || 'nuages,ville,crypto,espace,jade,grotte,canyon').split(','), [g0, g1] = (A.graines || '1-3').split('-').map(Number), PAL = (A.paliers || '0,10').split(',').map(Number);
const SC = `(function(){if(!window.__scP){const r0=THREE.WebGLRenderer.prototype.render;THREE.WebGLRenderer.prototype.render=function(s,c){if(s&&s.isScene&&s.children.length>window.__scN){window.__sc=s;}return r0.call(this,s,c);};window.__scN=8;window.__scP=1;}return 1;})()`;
const EMP = `(function(){const s=window.__sc;if(!s)return null;const h0=0x811c9dc5,vus=new Map();
  const fnv=function(h,a){if(!a||!a.buffer)return h;const u=new Uint32Array(a.buffer,a.byteOffset,a.byteLength>>2);for(let i=0;i<u.length;i++)h=Math.imul(h^u[i],16777619);return h>>>0;};
  const fnvS=function(h,t){t=String(t);for(let i=0;i<t.length;i++)h=Math.imul(h^t.charCodeAt(i),16777619);return h>>>0;};
  const geoH=function(g){if(vus.has(g.id))return vus.get(g.id);let h=h0;for(const k of Object.keys(g.attributes).sort()){h=fnvS(h,k);h=fnv(h,g.attributes[k].array);}if(g.index)h=fnv(h,g.index.array);vus.set(g.id,h);return h;};
  const l=[];s.traverse(function(o){if(!o.geometry||!(o.isMesh||o.isPoints||o.isLine||o.isSprite))return;const m=Array.isArray(o.material)?o.material[0]:o.material;let t=geoH(o.geometry);
    t=fnvS(t,o.type+'|'+(o.name||'')+'|'+(m?m.type+(m.color?m.color.getHexString():''):''));if(o.isInstancedMesh){t=fnvS(t,o.count);t=fnv(t,o.instanceMatrix.array);}
    if(!o.matrixAutoUpdate)t=fnv(t,new Float32Array(o.matrixWorld.elements));l.push((o.name||o.type).slice(0,30)+'#'+t.toString(36));});return l;})()`;
const ROUTE = (c, g, p) => `(function(){const r=dbgTrace({carte:${JSON.stringify(c)},graine:${g},palier:${p},pas:1});const f=new Float64Array(1),u=new Uint32Array(f.buffer);let h=2166136261;
  const m=function(x){f[0]=x;for(let i=0;i<2;i++){h^=u[i];h=Math.imul(h,16777619)>>>0;}};m(r.L);for(const k of ['p','t','n','b'])for(const x of r[k])m(x);return {h:h.toString(16),NP:r.NP,L:r.L,carte:r.carte,meteo:r.meteo,ok:r.graineOk};})()`;
(async () => {
  let P_HTTP = +(A.http || 9481), P_CDP = +(A.cdp || 9482); while (!portLibre(P_HTTP)) P_HTTP += 2; while (!portLibre(P_CDP) || P_CDP === P_HTTP) P_CDP += 2;
  const srv = await serveur(path.resolve(__dirname, '..', '..', 'VERSION PRINCIPALE'), P_HTTP), prof = tmp();
  const { ch } = await lanceChrome(P_CDP, prof, 390, 844);
  const pages = []; let egal = 0, diff = 0, nInst = 0;
  try {
    for (const [pg, q] of [[A.pa || 'index-ref.html', A.qa || ''], [A.pb || 'index.html', A.qb || '']]) {
      const t = await (await fetch(`http://127.0.0.1:${P_CDP}/json/new?about:blank`, { method: 'PUT' })).json(); const c = new CDP(t.webSocketDebuggerUrl); await c.ok;
      await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Network.enable'); await c.send('Network.setBypassServiceWorker', { bypass: true });
      await c.send('Page.addScriptToEvaluateOnNewDocument', { source: "try{localStorage.setItem('cashcarSave',JSON.stringify({v:2,tuto:1,plq:{m:'fr',x:'BANC',ok:1},bank:50000,ex:{runs:3},sfx:false,mus:false,vox:false}));}catch(e){}" });
      await c.send('Page.bringToFront'); await c.send('Page.navigate', { url: `http://127.0.0.1:${P_HTTP}/${pg}?colonne=0&intro=ancien&attente=0&prebati=0&tel=1${q}` }); pages.push(c); c.nom = pg + q;
      let ok = false; for (let i = 0; i < 900 && !ok; i++) { await dormir(1000); try { ok = await c.ev('!!window.__gameReady&&typeof dbgTrace==="function"', 120000); } catch (e) {} } if (!ok) throw new Error('page pas prête ' + c.nom); /* une page après l'autre, au premier plan */
      await dormir(4000); try { await c.ev("(function(){const e=document.getElementById('splash');try{e&&e.click();}catch(x){}return 1;})()"); } catch (e) {} await c.ev(SC);
    }
    await dormir(3000); console.log('A', pages[0].nom, '\nB', pages[1].nom);
    for (const carte of CARTES) for (const p of PAL) for (let g = g0; g <= g1; g++) {
      const r = [];
      for (const c of pages) { await c.send('Page.bringToFront'); let o;
        try { o = await c.ev(ROUTE(carte, g, p), 240000); await dormir(700); const e1 = await c.ev(EMP, 120000); await dormir(400); const e2 = await c.ev(EMP, 120000);
          const st = (e1 || []).filter((x, i) => e2 && e2[i] === x); o.inst = (e1 || []).length - st.length; o.sc = st; } catch (e) { o = { h: 'erreur ' + String(e.message).slice(0, 120), sc: [] }; }
        r.push(o); }
      const a = r[0].sc, b = r[1].sc, sa = new Set(a), sb = new Set(b), seul = a.filter(x => !sb.has(x)).length + b.filter(x => !sa.has(x)).length;
      const routeOk = r[0].h === r[1].h, ok = routeOk && seul === 0 && a.length === b.length; if (ok) egal++; else diff++; nInst += r[0].inst + r[1].inst;
      console.log(`${carte.padEnd(7)} p${String(p).padEnd(2)} g${g}  route ${routeOk ? '=' : '≠'} ${r[0].h} ${r[1].h}  scène ${a.length}/${b.length} objets stables, ${seul} différents ${ok ? '=' : '≠'}  (mouvants écartés ${r[0].inst}/${r[1].inst})  ${r[0].carte}-${r[0].meteo} L ${r[0].L}`);
      if (seul && seul < 30) console.log('    A seul : ' + a.filter(x => !sb.has(x)).slice(0, 8).join(' ') + '\n    B seul : ' + b.filter(x => !sa.has(x)).slice(0, 8).join(' '));
    }
    console.log('BILAN', egal, 'égales ·', diff, 'différentes · objets mouvants écartés', nInst);
  } finally { for (const c of pages) try { c.close(); } catch (e) {} tueChrome(ch); srv.close(); await dormir(800); try { fs.rmSync(prof, { recursive: true, force: true }); } catch (e) {} }
})().catch(e => { console.error(e); process.exit(1); });
