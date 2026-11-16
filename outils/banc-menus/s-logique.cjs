/* (2026-11-14, qualité · menus) scénario du banc des menus : CONFIDENTIALITÉ (défilement, encoche), figures tenues lâchées, rayons de la série,
   halo de la frénésie, volant, réglages de l'ordinateur à 812 pt. Lancé par menus.cjs (--scenario). */
module.exports = async function (b) {
  const { c, ev, tap, shot, dormir, fmt, W, H, log } = b;
  const R = {};
  /* ---- 1. la page CONFIDENTIALITÉ (#11 défilement, #12 encoche) : l'encoche simulée par --ccL/--ccR = 47 px en paysage ---- */
  const couche = W > H;
  await ev(`(function(){const r=document.documentElement.style;${couche ? "r.setProperty('--ccL','47px');r.setProperty('--ccR','47px');" : ''}window.confOuvre();return 1})()`);
  await dormir(400);
  R.conf = await ev(`(function(){const f=document.getElementById('confFen');const h=f.querySelector('h2'),p=f.querySelector('p'),x=f.querySelector('.confX');const bh=h.getBoundingClientRect(),bx=x.getBoundingClientRect();
    return {pad:getComputedStyle(f).paddingLeft+' / '+getComputedStyle(f).paddingRight,h2gauche:Math.round(bh.left),pDroite:Math.round(p.getBoundingClientRect().right),fermerHaut:Math.round(bx.top),hauteur:innerHeight,defile:f.scrollHeight-f.clientHeight}})()`);
  await shot('conf-haut');
  /* le doigt glisse de bas en haut au milieu de la page : le geste doit faire défiler */
  const x0 = W / 2, y0 = H * .8, y1 = H * .2;
  await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x0, y: y0 }] });
  for (let i = 1; i <= 10; i++) { await c.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x0, y: y0 + (y1 - y0) * i / 10 }] }); await dormir(16); }
  await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await dormir(600);
  R.confApres = await ev(`(function(){const f=document.getElementById('confFen');const bx=f.querySelector('.confX').getBoundingClientRect();return {scrollTop:Math.round(f.scrollTop),fermerHaut:Math.round(bx.top),fermerVisible:bx.bottom<=innerHeight&&bx.top>=0}})()`);
  await shot('conf-glisse');
  await ev(`(function(){const f=document.getElementById('confFen');if(f)f.remove();const r=document.documentElement.style;r.removeProperty('--ccL');r.removeProperty('--ccR');return 1})()`);
  /* ---- 2. les figures tenues (#24) : 1 au clavier = le bouton 1 tenu ; puis la pause Capacitor ; puis l'arrière-plan ---- */
  const tient = "dispatchEvent(new KeyboardEvent('keydown',{code:'Digit1'}));dispatchEvent(new KeyboardEvent('keydown',{code:'Digit3'}));";
  R.fig = {};
  R.fig.tenu = await ev(`(function(){${tient}return dbgFig().tenus})()`);
  R.fig.apresPause = await ev(`(function(){document.dispatchEvent(new Event('pause'));return dbgFig().tenus})()`);
  R.fig.retenu = await ev(`(function(){${tient}return dbgFig().tenus})()`);
  R.fig.apresCache = await ev(`(function(){Object.defineProperty(document,'hidden',{configurable:true,get:function(){return true}});document.dispatchEvent(new Event('visibilitychange'));delete document.hidden;return dbgFig().tenus})()`);
  await ev(`(function(){dispatchEvent(new KeyboardEvent('keyup',{code:'Digit1'}));dispatchEvent(new KeyboardEvent('keyup',{code:'Digit3'}));return 1})()`);
  R.classes = await ev(`document.documentElement.className`);
  /* ---- 3. le halo de la frénésie (#19) : sorti du HUD, plein écran, figé à 0 / ½ / 1 de son battement, puis armé ---- */
  await ev(`(function(){const g=document.getElementById('feverGlow');g._p=g.parentNode;document.body.appendChild(g);g.style.zIndex=99999;g.style.position='fixed';g.style.display='block';g.className='';return 1})()`);
  await dormir(300);
  for (const [nom, cls] of [['fren', ''], ['arme', 'armed']]) {
    await ev(`(function(){const g=document.getElementById('feverGlow');g.className=${JSON.stringify(cls)};return 1})()`);
    await dormir(200);
    for (const f of [0, .5, 1]) {
      R['halo-' + nom + f] = await ev(`(function(){const g=document.getElementById('feverGlow');const a=g.getAnimations({subtree:true});a.forEach(function(x){x.pause();const d=x.effect.getTiming().duration;x.currentTime=d*${f};});return a.map(function(x){return (x.effect.pseudoElement||'el')+':'+x.animationName})})()`);
      await dormir(150);
      await shot('halo-' + nom + '-' + f);
    }
  }
  await ev(`(function(){const g=document.getElementById('feverGlow');g.getAnimations({subtree:true}).forEach(function(x){x.play()});g.style.cssText='';g.className='';g._p.appendChild(g);return 1})()`);
  /* ---- 4. le volant (#21) : une copie du galet, agrandie ×4 au centre, --su = 0 puis 1 ---- */
  await ev(`(function(){const s=document.getElementById('tStick');const w=document.createElement('div');w.id='bancVolant';w.style.cssText='position:fixed;left:50%;top:50%;width:0;height:0;z-index:99999;transform:scale(4)';
    const k=s.cloneNode(true);k.style.cssText='position:absolute;left:-60px;top:-60px;width:120px;height:120px;display:block;opacity:1;visibility:visible;background:none';w.appendChild(k);
    const bg=document.createElement('div');bg.id='bancFond';bg.style.cssText='position:fixed;inset:0;z-index:99998;background:linear-gradient(#1b2a52,#5b3a6e)';document.body.appendChild(bg);document.body.appendChild(w);
    const n=k.querySelector('#tKnob');if(n){n.style.backdropFilter='none';n.style.webkitBackdropFilter='none';n.style.filter='none';}return !!n})()`);
  for (const su of [0, 1]) {
    await ev(`(function(){const k=document.querySelector('#bancVolant #tStick');k.style.setProperty('--su','${su}');return 1})()`);
    await dormir(300);
    R['volant' + su] = await ev(`(function(){const k=document.querySelector('#bancVolant #tKnob');const a=getComputedStyle(k,'::before'),b=getComputedStyle(k,'::after');return {avantFiltre:a.filter,apresFiltre:b.filter,apresOmbre:b.boxShadow}})()`);
    await shot('volant-su' + su, { x: W / 2 - 130, y: H / 2 - 160, width: 260, height: 280 });
  }
  await ev(`(function(){document.getElementById('bancVolant').remove();document.getElementById('bancFond').remove();return 1})()`);
  /* ---- 5. l'écran de SÉRIE (#16) : rayons figés (animation coupée sur les deux pages), le calque mesuré ---- */
  await ev(`(function(){const s=document.createElement('style');s.id='bancGel';s.textContent='.swRayons{animation:none!important;transition:none!important}.swEtinc i{animation:none!important;opacity:0!important}.swAnneau{display:none!important}';document.head.appendChild(s);dbgSerie('ecran',3);return 1})()`);
  await dormir(2500);
  R.rayons = await ev(`(function(){const r=document.querySelector('#serieW .swRayons');const b=r.getBoundingClientRect();return {l:Math.round(b.width),h:Math.round(b.height),masque:getComputedStyle(r).maskImage||getComputedStyle(r).webkitMaskImage}})()`);
  await shot('serie');
  log(JSON.stringify(R));
};
