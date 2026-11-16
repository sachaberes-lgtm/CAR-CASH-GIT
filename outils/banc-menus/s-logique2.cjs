/* (2026-11-14, qualité · menus) deuxième passage : halo de frénésie et volant sur un fond FIXE (le ciel de l'accueil bouge entre deux photos),
   puis CONFIDENTIALITÉ hors garage (écran de mort après une vraie course : garageOn faux, le cas de la trouvaille 11). */
module.exports = async function (b) {
  const { c, ev, tap, shot, dormir, W, H, log } = b;
  const R = {};
  const fond = "const bg=document.createElement('div');bg.id='bancFond';bg.style.cssText='position:fixed;inset:0;z-index:99998;background:linear-gradient(#1b2a52,#5b3a6e)';document.body.appendChild(bg);";
  /* ---- le halo de la frénésie ---- */
  await ev(`(function(){${fond}const g=document.getElementById('feverGlow');g._p=g.parentNode;document.body.appendChild(g);g.style.zIndex=99999;g.style.position='fixed';g.style.display='block';g.className='';return 1})()`);
  await dormir(300);
  for (const [nom, cls] of [['fren', ''], ['arme', 'armed']]) {
    await ev(`(function(){const g=document.getElementById('feverGlow');g.className=${JSON.stringify(cls)};return 1})()`);
    await dormir(200);
    for (const f of [0, .25, .5, .75, 1]) {
      await ev(`(function(){const g=document.getElementById('feverGlow');g.getAnimations({subtree:true}).forEach(function(x){x.pause();x.currentTime=x.effect.getTiming().duration*${f};});return 1})()`);
      await dormir(150);
      await shot('halo-' + nom + '-' + f);
    }
  }
  await ev(`(function(){const g=document.getElementById('feverGlow');g.getAnimations({subtree:true}).forEach(function(x){x.play()});g.style.cssText='';g.className='';g._p.appendChild(g);return 1})()`);
  /* les calques et la peinture : une seconde de battement libre, trace de Chrome (Paint, Layerize) */
  const trace = async (ms) => { const ev9 = []; const h = e => { try { const m = JSON.parse(e.data); if (m.method === 'Tracing.dataCollected') ev9.push(...m.params.value); } catch (_) {} };
    c.ws.addEventListener('message', h);
    const fini = new Promise(r => { const h2 = e => { try { if (JSON.parse(e.data).method === 'Tracing.tracingComplete') { c.ws.removeEventListener('message', h2); r(); } } catch (_) {} }; c.ws.addEventListener('message', h2); });
    await c.send('Tracing.start', { categories: 'devtools.timeline,disabled-by-default-devtools.timeline', transferMode: 'ReportEvents' });
    await dormir(ms); await c.send('Tracing.end'); await fini; c.ws.removeEventListener('message', h);
    const P = ev9.filter(x => x.name === 'Paint' && x.ph === 'X'); const L = ev9.filter(x => x.name === 'UpdateLayerTree' || x.name === 'Layerize');
    return { paints: P.length, paintMs: +(P.reduce((s, x) => s + (x.dur || 0), 0) / 1000).toFixed(1), aire: Math.round(P.reduce((s, x) => { const q = x.args && x.args.data && x.args.data.clip; if (!q) return s; const xs = [q[0], q[2], q[4], q[6]], ys = [q[1], q[3], q[5], q[7]]; return s + (Math.max(...xs) - Math.min(...xs)) * (Math.max(...ys) - Math.min(...ys)); }, 0) / 1e6), arbre: L.length }; };
  await ev(`(function(){const g=document.getElementById('feverGlow');document.body.appendChild(g);g.style.zIndex=99999;g.style.position='fixed';g.style.display='block';g.className='';return 1})()`);
  await dormir(500); R.traceFren = await trace(2000);
  await ev(`(function(){document.getElementById('feverGlow').className='armed';return 1})()`);
  await dormir(500); R.traceArme = await trace(2000);
  await ev(`(function(){const g=document.getElementById('feverGlow');g.style.display='none';return 1})()`);
  await dormir(500); R.traceSans = await trace(2000);
  await ev(`(function(){const g=document.getElementById('feverGlow');g.style.cssText='';g.className='';g._p.appendChild(g);return 1})()`);
  /* ---- le volant : une copie agrandie ---- */
  R.volant = await ev(`(function(){const s=document.getElementById('tStick');const w=document.createElement('div');w.id='bancVolant';w.style.cssText='position:fixed;left:50%;top:50%;width:0;height:0;z-index:99999;transform:scale(4)';
    const k=s.cloneNode(true);k.removeAttribute('class');k.style.cssText='position:absolute;left:-60px;top:-60px;width:120px;height:120px;display:block!important;opacity:1!important;visibility:visible!important;background:none;transform:none';w.appendChild(k);
    const n=k.querySelector('#tKnob');n.style.cssText='display:block!important;opacity:1!important;visibility:visible!important;left:50%;top:50%;backdrop-filter:none;-webkit-backdrop-filter:none;filter:none;transform:none';
    document.getElementById('bancFond').style.display='block';document.body.appendChild(w);
    const cs=getComputedStyle(n),r=n.getBoundingClientRect();return {disp:cs.display,op:cs.opacity,vis:cs.visibility,rect:[r.left,r.top,r.width,r.height].map(Math.round)}})()`);
  for (const su of [0, .5, 1]) {
    await ev(`(function(){document.querySelector('#bancVolant #tStick').style.setProperty('--su','${su}');return 1})()`);
    await dormir(300);
    await shot('volant-su' + su, { x: W / 2 - 150, y: H / 2 - 170, width: 300, height: 300 });
  }
  await ev(`(function(){document.getElementById('bancVolant').remove();document.getElementById('bancFond').remove();return 1})()`);
  /* ---- CONFIDENTIALITÉ sur l'écran de mort (hors garage) ---- */
  log('course', JSON.stringify(await ev('(function(){try{return window.dbgJouer&&dbgJouer()}catch(e){return String(e)}})()')));
  await dormir(9000);
  await ev("(function(){try{dbgDauphin('boom')}catch(e){}return 1})()"); await dormir(7000);
  R.etat = await ev("document.body.className.slice(0,140)+' | '+[...document.querySelectorAll('.mscr.on')].map(e=>e.id).join(' ')");
  const couche = W > H;
  await ev(`(function(){window.confOuvre();return 1})()`); await dormir(400);
  R.conf = await ev(`(function(){const f=document.getElementById('confFen');return {defile:f.scrollHeight-f.clientHeight,haut:f.scrollTop}})()`);
  const x0 = W / 2, y0 = H * .8, y1 = H * .2;
  await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x0, y: y0 }] });
  for (let i = 1; i <= 10; i++) { await c.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x0, y: y0 + (y1 - y0) * i / 10 }] }); await dormir(16); }
  await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await dormir(700);
  R.confApres = await ev(`(function(){const f=document.getElementById('confFen');const bx=f.querySelector('.confX').getBoundingClientRect();return {scrollTop:Math.round(f.scrollTop),fermerHaut:Math.round(bx.top),fermerVisible:bx.bottom<=innerHeight&&bx.top>=0}})()`);
  await shot('conf-mort-glisse');
  log(JSON.stringify(R));
};
