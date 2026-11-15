/* (2026-11-15, qualité · petits, relecture n2) LA DÉROGATION : les quatre classes qmRayons / qmHalo / qmVolant / qmInv sont posées sur TEL_NATIF (tout téléphone).
   Ici la MÊME page, la MÊME image : on photographie avec la classe (APRÈS) et sans elle (AVANT = ce que donne ?sans=…), pour la SÉRIE, le HALO de frénésie,
   le VOLANT et le garage (INVENTAIRE). À lancer sans modèle d'appareil (pas de ?appareil : PRF.on faux, le cas « hors profil »), avec et sans --q palier=0 ou 1.
   Photos <fmt>-apres-<ecran>-<avant|apres>.png (le fichier du mode « avant » porte le même préfixe de page : le nom dit la classe). */
module.exports = async function (b) {
  const { ev, tap, shot, dormir, log, W, H } = b;
  const cl = (c, on) => ev(`(function(){document.documentElement.classList.${on ? 'add' : 'remove'}('${c}');return document.documentElement.classList.contains('${c}')})()`);
  const info = await ev("JSON.stringify({telNatif:dbgImg().telNatif,palier:document.documentElement.dataset.palier||null,classes:[...document.documentElement.classList].filter(c=>/^qm/.test(c)),prf:(typeof dbgPrf==='function'&&dbgPrf())?dbgPrf().on:null})");
  log('etat', info);
  /* ---- 1. la SÉRIE : rayons figés ---- */
  await ev(`(function(){const s=document.createElement('style');s.id='bancGel';s.textContent='.swRayons{animation:none!important;transition:none!important}.swEtinc i{animation:none!important;opacity:0!important}.swAnneau{display:none!important}';document.head.appendChild(s);dbgSerie('ecran',3);return 1})()`);
  await dormir(2500);
  for (const on of [false, true]) { await cl('qmRayons', on); await dormir(500); const m = await ev(`(function(){const r=document.querySelector('#serieW .swRayons');const q=r.getBoundingClientRect();return Math.round(q.width)+'x'+Math.round(q.height)})()`); log('serie', on ? 'apres' : 'avant', 'calque', m); await shot('serie-' + (on ? 'apres' : 'avant')); }
  await ev("(function(){try{dbgSerie('ferme')}catch(e){};const s=document.getElementById('serieW');if(s){s.classList.remove('on');s.style.display='none'}return 1})()");
  /* ---- 2. le HALO de la frénésie : fond fixe, animation figée à 0 / ½ / 1 du battement ---- */
  await ev(`(function(){const bg=document.createElement('div');bg.id='bancFond';bg.style.cssText='position:fixed;inset:0;z-index:99998;background:#1b2a52';document.body.appendChild(bg);
    const g=document.getElementById('feverGlow');g._p=g.parentNode;document.body.appendChild(g);g.style.zIndex=99999;g.style.position='fixed';g.style.display='block';g.className='';return 1})()`);
  for (const ph of [0, .5, 1]) {
    for (const on of [false, true]) {
      await cl('qmHalo', on);
      await ev(`(function(){let s=document.getElementById('bancPh');if(!s){s=document.createElement('style');s.id='bancPh';document.head.appendChild(s)}
        const d=-${(ph * .85 * .999).toFixed(4)};s.textContent='#feverGlow,#feverGlow::before,#feverGlow::after{animation-play-state:paused!important;animation-delay:'+d+'s!important}';return 1})()`);
      await dormir(500); await shot(`halo${ph}-` + (on ? 'apres' : 'avant'));
    }
  }
  await ev(`(function(){const g=document.getElementById('feverGlow');g.style.cssText='';g.className='';g._p.appendChild(g);document.getElementById('bancFond').remove();document.getElementById('bancPh').remove();return 1})()`);
  /* ---- 3. le VOLANT : galet copié sur fond fixe, ×3, --su = 0 / 1 ---- */
  await ev(`(function(){const bg=document.createElement('div');bg.id='bancFond';bg.style.cssText='position:fixed;inset:0;z-index:99998;background:linear-gradient(#1b2a52,#5b3a6e)';document.body.appendChild(bg);
    const s=document.getElementById('tStick');const w=document.createElement('div');w.id='bancVolant';w.style.cssText='position:fixed;left:calc(50% - 60px);top:calc(50% - 60px);width:120px;height:120px;z-index:99999;transform:scale(3);transform-origin:50% 50%';
    const k=s.cloneNode(true);k.removeAttribute('class');k.style.cssText='position:absolute!important;left:0!important;top:0!important;right:auto!important;bottom:auto!important;width:120px!important;height:120px!important;margin:0!important;display:block!important;opacity:1!important;visibility:visible!important;background:none!important;transform:none!important;box-shadow:none!important;backdrop-filter:none!important';w.appendChild(k);
    const n=k.querySelector('#tKnob');n.style.cssText='display:block!important;opacity:1!important;visibility:visible!important;left:50%!important;top:50%!important;translate:none!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;filter:none!important;transform:none!important';
    document.body.appendChild(w);return 1})()`);
  for (const su of [0, 1]) for (const on of [false, true]) {
    await cl('qmVolant', on);
    await ev(`(function(){document.querySelector('#bancVolant #tStick').style.setProperty('--su','${su}');return 1})()`); await dormir(400);
    const r = await ev(`(function(){const r=document.querySelector('#bancVolant #tKnob').getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]})()`);
    await shot(`volant${su}-` + (on ? 'apres' : 'avant'), { x: Math.max(0, r[0] - 150), y: Math.max(0, r[1] - 150), width: 300, height: 300 });
  }
  await ev(`(function(){document.getElementById('bancVolant').remove();document.getElementById('bancFond').remove();return 1})()`);
  /* ---- 4. le garage : INVENTAIRE / MISSIONS dans leurs boutons ---- */
  await ev("window.__mGo('home');1"); await dormir(400); await tap('#mHome [data-m="garage"]'); await dormir(3500);
  const r = await ev("(function(){const r=document.getElementById('gAct').getBoundingClientRect();return [r.left,r.top,r.width,r.height]})()");
  for (const on of [false, true]) {
    await cl('qmInv', on); await dormir(500);
    log('inv', on ? 'apres' : 'avant', JSON.stringify(await ev("['#gvCof','#gvMis'].map(function(q){const e=document.querySelector(q);const s=e.querySelector('span'),r=e.getBoundingClientRect(),t=s.getBoundingClientRect();return q+' bouton '+Math.round(r.width)+' texte '+Math.round(t.width)+' '+getComputedStyle(s).fontSize+' marge g '+Math.round(t.left-r.left)+' d '+Math.round(r.right-t.right)})")));
    await shot('inv-' + (on ? 'apres' : 'avant'), { x: Math.max(0, r[0] - 8), y: Math.max(0, r[1] - 8), width: Math.min(W, r[2] + 16), height: Math.min(H - r[1] + 8, r[3] + 16) });
  }
};
