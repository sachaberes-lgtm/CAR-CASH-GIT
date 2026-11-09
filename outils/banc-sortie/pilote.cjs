/* ===== LE PILOTE DE SORTIE (2026-11-08, Sacha : « règle tout ce qui manque pour le sortir ») =====
   Un Chrome headless MUET piloté au toucher (téléphone émulé) ou à la souris (ordinateur), qui relève tout ce qui va mal :
   exceptions JS, console.error / warn, requêtes en échec ou en 4xx/5xx, et prend des photos. Il part d'un joueur NEUF (pas de sauvegarde,
   sinon seulement le son coupé) : le chemin que verra le premier joueur, intro comprise.
   node outils/banc-sortie/pilote.cjs [--jeu "<dossier du jeu>"] [--w 390] [--h 844] [--q "lang=en"] [--langue fr|en] [--sortie <dossier photos>]
        [--scenario premiere|ecrans] [--http 9811] [--cdp 9812]
   ⚠ Ports libres exigés ; Chrome n'ouvre jamais le son (--mute-audio) ; il ne tue que SON Chrome. */
const path = require('path');
const fs = require('fs');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir, tmp } = require('../banc-trainees/cdp.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.resolve(A.jeu || path.join(__dirname, '..', '..', 'VERSION PRINCIPALE'));
let P_HTTP, P_CDP;
const W = +(A.w || 390), H = +(A.h || 844), P0_HTTP = +(A.http || 9811), P0_CDP = +(A.cdp || 9812);
const SORTIE = path.resolve(A.sortie || path.join(require('os').tmpdir(), 'pilote-sortie')); fs.mkdirSync(SORTIE, { recursive: true });
const COL = A.colonne === '1';
const TACTILE = Math.min(W, H) < 700;
const SAVE0 = { v: 2, sfx: false, mus: false, vox: false };

/* un CDP qui garde aussi les évènements */
class CDPE extends CDP {
  constructor(url) { super(url); this.evts = []; const o = this.ws.onmessage; this.ws.onmessage = e => { o(e); try { const m = JSON.parse(e.data); if (m.method) this.evts.push(m); } catch (x) {} }; }
}
const rel = { exceptions: [], erreurs: [], avert: [], reseau: [], nReponses: 0 };
function depouille(c, depuis) {
  const urls = depouille.urls || (depouille.urls = new Map());
  for (const m of c.evts.splice(0)) {
    const p = m.params || {};
    if (m.method === 'Runtime.exceptionThrown') { const d = p.exceptionDetails || {}; rel.exceptions.push(((d.exception && d.exception.description) || d.text || '?').split('\n')[0].slice(0, 300) + ' @' + String(d.url || '').split('/').pop() + ':' + d.lineNumber); }
    else if (m.method === 'Runtime.consoleAPICalled' && (p.type === 'error' || p.type === 'warning')) {
      const t = (p.args || []).map(a => a.value !== undefined ? String(a.value) : (a.description || '')).join(' ').slice(0, 300);
      (p.type === 'error' ? rel.erreurs : rel.avert).push(t);
    }
    else if (m.method === 'Log.entryAdded' && (p.entry.level === 'error' || p.entry.level === 'warning')) { (p.entry.level === 'error' ? rel.erreurs : rel.avert).push('[log] ' + String(p.entry.text).slice(0, 200) + ' ' + String(p.entry.url || '').split('/').pop()); }
    else if (m.method === 'Network.requestWillBeSent') urls.set(p.requestId, p.request.url);
    else if (m.method === 'Network.responseReceived') { rel.nReponses++; if (p.response.status >= 400) rel.reseau.push(p.response.status + ' ' + p.response.url.replace(/^https?:\/\/[^/]+\//, '')); }
    else if (m.method === 'Network.loadingFailed' && p.errorText !== 'net::ERR_ABORTED') rel.reseau.push('ECHEC ' + p.errorText + ' ' + String(urls.get(p.requestId) || '').replace(/^https?:\/\/[^/]+\//, ''));
  }
}

(async () => {
  /* les bancs des autres sessions occupent souvent les mêmes ports : on cherche les deux suivants libres */
  const libre = d => { for (let p = d; p < d + 80; p++) if (portLibre(p)) return p; console.error('aucun port libre depuis', d); process.exit(2); };
  P_HTTP = libre(P0_HTTP); P_CDP = libre(P0_CDP === P_HTTP ? P0_CDP + 1 : P0_CDP); if (P_CDP === P_HTTP) P_CDP = libre(P_HTTP + 1);
  const srv = await serveur(JEU, P_HTTP), prof = tmp();
  const { ch, pg } = await lanceChrome(P_CDP, prof, W, H);
  const c = new CDPE(pg.webSocketDebuggerUrl); await c.ok;
  const evTop = (x, ms) => c.ev(x, ms || 25000).catch(e => 'ERR ' + e.message.slice(0, 120));
  /* --colonne 1 : l'ordinateur, le jeu vit dans l'iframe #colonne (page-cadre) ; les expressions y sont évaluées */
  const ev = COL ? (x, ms) => evTop(`(function(){var f=document.getElementById('colonne');if(!f||!f.contentWindow)return null;return f.contentWindow.eval(${JSON.stringify(x)});})()`, ms) : evTop;
  /* l'iframe du cadre téléphone est mise à l'échelle par la page-cadre : global = décalage + échelle × local */
  const decal = async () => COL ? JSON.parse(await evTop(`(function(){var f=document.getElementById('colonne');if(!f)return '{"x":0,"y":0,"k":1}';var r=f.getBoundingClientRect();return JSON.stringify({x:r.left,y:r.top,k:r.width/(f.offsetWidth||r.width)})})()`)) : { x: 0, y: 0, k: 1 };
  const photo = async nom => { const r = await c.send('Page.captureScreenshot', { format: 'jpeg', quality: 70 }); fs.writeFileSync(path.join(SORTIE, nom + '.jpg'), Buffer.from(r.data, 'base64')); };
  const tap = async (x, y) => {
    if (TACTILE) { await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] }); await dormir(60); await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); }
    else { await c.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y }); await c.send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 }); await dormir(50); await c.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 }); }
  };
  /* ce que le joueur voit : les écrans ouverts, les boutons visibles et leur texte */
  const vue = () => ev(`(function(){var o={st:null,ecrans:[],boutons:[]};try{o.st=window.dbgState?dbgState():null}catch(e){}
    var cand=document.querySelectorAll('[id^=m],[id^=g],#splash,#plaque,#tuto,.ecran,.on');for(var i=0;i<cand.length&&o.ecrans.length<14;i++){var e=cand[i],r=e.getBoundingClientRect(),cs=getComputedStyle(e);
      if(r.width>150&&r.height>150&&cs.display!=='none'&&cs.visibility!=='hidden'&&+cs.opacity>0.2&&(e.id||e.className))o.ecrans.push((e.id||'')+'.'+String(e.className).slice(0,30));}
    var b=document.querySelectorAll('button,[role=button],[data-m]');for(var j=0;j<b.length&&o.boutons.length<16;j++){var q=b[j].getBoundingClientRect(),s=getComputedStyle(b[j]);
      if(q.width>30&&q.height>20&&q.bottom>0&&q.top<innerHeight&&s.visibility!=='hidden'&&s.display!=='none'&&+s.opacity>0.3)o.boutons.push((b[j].innerText||b[j].getAttribute('aria-label')||b[j].id||'?').trim().replace(/\\s+/g,' ').slice(0,24)+'@'+Math.round(q.left+q.width/2)+','+Math.round(q.top+q.height/2));}
    return JSON.stringify(o);})()`);
  try {
    await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Network.enable'); await c.send('Log.enable');
    if (TACTILE) { await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 3, mobile: true }); await c.send('Emulation.setTouchEmulationEnabled', { enabled: true }); }
    await c.send('Page.addScriptToEvaluateOnNewDocument', { source: `try{if(!localStorage.cashcarSave)localStorage.cashcarSave=${JSON.stringify(JSON.stringify(SAVE0))};${A.langue?'localStorage.ccLang='+JSON.stringify(A.langue)+';':''}}catch(e){}` });
    const url = `http://localhost:${P_HTTP}/index.html?${COL ? 'x=1' : 'colonne=0'}${A.q ? '&' + A.q : ''}`;
    console.log('→', url, `${W}x${H}`, TACTILE ? 'tactile' : 'souris');
    const t0 = Date.now(); await c.send('Page.navigate', { url });
    /* LES PAS (--pas "a:5;t:195,420;p:nom;v;b:JOUER;j:1+1;u:60") séparés par « ; » :
       a:<s> attendre · t:x,y toucher · p:nom photo · v la vue (écrans ouverts, boutons) · b:<texte> toucher le bouton qui porte ce texte
       j:<js> évaluer · u:<s> attendre que l'écran-titre (#splash) parte (au plus s secondes) · e:<s> attendre que dbgState().started soit vrai · d:<s> attendre dbgState().gameOver (la mort) */
    const pas = String(A.pas || 'a:2;p:intro;a:6;t:' + Math.round(W / 2) + ',' + Math.round(H / 2) + ';a:5;p:apres-toucher;v').split(';').filter(Boolean);
    const compact = async () => { const brut = await vue(); let o; try { o = JSON.parse(brut); } catch (e) { return 'VUE ILLISIBLE (page occupée ?) : ' + String(brut).slice(0, 100); } const s = o.st || {}; const voile = await ev(`!!document.querySelector('#voileSerpent.on')`); return JSON.stringify({ started: s.started, gameOver: s.gameOver, s: s.s, VOILE_BLANC: voile, ecrans: o.ecrans, boutons: o.boutons }); };
    for (const p of pas) {
      const k = p[0], v = p.slice(2);
      if (k === 'a') await dormir(+v * 1000);
      else if (k === 't') { const [x, y] = v.split(',').map(Number); await tap(x, y); }
      else if (k === 'p') { depouille(c); await photo(String(Date.now() - t0).padStart(6, '0') + '-' + v); }
      else if (k === 'v') console.log('[' + Math.round((Date.now() - t0) / 1000) + ' s] vue', await compact());
      else if (k === 'j') console.log('[js]', await ev(v));
      else if (k === 'b') { const r = await ev(`(function(){var t=${JSON.stringify(v.toUpperCase())},b=document.querySelectorAll('button,[role=button],[data-m]');for(var i=0;i<b.length;i++){var q=b[i].getBoundingClientRect(),s=getComputedStyle(b[i]);var tx=(b[i].innerText||b[i].getAttribute('aria-label')||'').toUpperCase().replace(/\\s+/g,'');
          if(tx.indexOf(t.replace(/\\s+/g,''))>=0&&q.width>20&&q.height>14&&q.bottom>0&&q.top<innerHeight&&s.visibility!=='hidden'&&s.display!=='none')return Math.round(q.left+q.width/2)+','+Math.round(q.top+q.height/2);}return '';})()`);
        if (!r) console.log('[b] bouton introuvable :', v); else { const o = await decal(); const [x, y] = r.split(',').map(Number); const gx = Math.round(o.x + x * o.k), gy = Math.round(o.y + y * o.k); console.log('[b]', v, '→', gx, gy, '(échelle', o.k.toFixed(2) + ')'); await tap(gx, gy); } }
      else if (k === 'u') { const t1 = Date.now(); while (Date.now() - t1 < +v * 1000 && await ev(`!!document.getElementById('splash')&&getComputedStyle(document.getElementById('splash')).display!=='none'`)) await dormir(500); console.log('[u] écran-titre parti après', Math.round((Date.now() - t1) / 1000), 's'); }
      else if (k === 's') { /* s:<s> toucher le centre toutes les 3 s tant que l'écran-titre est là (l'intro n'accepte un toucher qu'une fois la page calme) */
        const t1 = Date.now(); let n = 0; const W2 = Math.round(W / 2), H2 = Math.round(H / 2);
        for (let i = 0; i < 80 && !(await ev(`!!document.getElementById('splash')`)); i++) await dormir(500); /* la page n'est pas toujours construite quand le pas démarre */
        while (Date.now() - t1 < +v * 1000 && await ev(`!!document.getElementById('splash')&&getComputedStyle(document.getElementById('splash')).display!=='none'`)) { await tap(W2, H2); n++; await dormir(3000); }
        console.log('[s] écran-titre parti après', Math.round((Date.now() - t1) / 1000), 's,', n, 'touchers'); }
      else if (k === 'd') { const t1 = Date.now(); while (Date.now() - t1 < +v * 1000 && !(await ev(`!!(window.dbgState&&dbgState().gameOver)`))) await dormir(500); console.log('[d] écran de fin :', await ev(`!!(window.dbgState&&dbgState().gameOver)`), 'après', Math.round((Date.now() - t1) / 1000), 's'); }
      else if (k === 'e') { const t1 = Date.now(); while (Date.now() - t1 < +v * 1000 && !(await ev(`!!(window.dbgState&&dbgState().started)`))) await dormir(500); console.log('[e] course partie :', await ev(`!!(window.dbgState&&dbgState().started)`), 'après', Math.round((Date.now() - t1) / 1000), 's'); }
    }
  } finally {
    depouille(c);
    console.log('\n=== RELEVÉ ===');
    console.log('exceptions :', rel.exceptions.length); rel.exceptions.slice(0, 10).forEach(x => console.log('  !', x));
    console.log('console.error :', rel.erreurs.length); [...new Set(rel.erreurs)].slice(0, 10).forEach(x => console.log('  e', x));
    console.log('console.warn :', rel.avert.length); [...new Set(rel.avert)].slice(0, 10).forEach(x => console.log('  w', x));
    console.log('réseau :', rel.nReponses, 'réponses ;', rel.reseau.length, 'en échec'); [...new Set(rel.reseau)].slice(0, 15).forEach(x => console.log('  r', x));
    console.log('photos :', SORTIE);
    try { c.close(); } catch (e) {} tueChrome(ch); srv.close();
  }
})().catch(e => { console.error('ÉCHEC', e); process.exit(1); });
