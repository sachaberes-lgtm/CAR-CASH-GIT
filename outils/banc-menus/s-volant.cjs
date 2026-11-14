/* (2026-11-14, qualité · menus, trouvaille 21) le galet du volant, copié et agrandi ×4 sur un fond fixe, --su = 0 / ½ / 1 : l'arc et le chevron avec et sans filtre. */
module.exports = async function (b) {
  const { ev, shot, dormir, log } = b;
  await ev(`(function(){const bg=document.createElement('div');bg.id='bancFond';bg.style.cssText='position:fixed;inset:0;z-index:99998;background:linear-gradient(#1b2a52,#5b3a6e)';document.body.appendChild(bg);
    const s=document.getElementById('tStick');const w=document.createElement('div');w.id='bancVolant';w.style.cssText='position:fixed;left:calc(50% - 60px);top:calc(50% - 60px);width:120px;height:120px;z-index:99999;transform:scale(4);transform-origin:50% 50%';
    const k=s.cloneNode(true);k.removeAttribute('class');k.style.cssText='position:absolute!important;left:0!important;top:0!important;right:auto!important;bottom:auto!important;width:120px!important;height:120px!important;margin:0!important;display:block!important;opacity:1!important;visibility:visible!important;background:none!important;transform:none!important;box-shadow:none!important;backdrop-filter:none!important';w.appendChild(k);
    const n=k.querySelector('#tKnob');n.style.cssText='display:block!important;opacity:1!important;visibility:visible!important;left:50%!important;top:50%!important;translate:none!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;filter:none!important;transform:none!important';
    document.body.appendChild(w);return 1})()`);
  for (const su of [0, .5, 1]) {
    await ev(`(function(){document.querySelector('#bancVolant #tStick').style.setProperty('--su','${su}');return 1})()`);
    await dormir(400);
    const r = await ev(`(function(){const r=document.querySelector('#bancVolant #tKnob').getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]})()`);
    log('volant', su, JSON.stringify(r.map(Math.round)));
    await shot('volant-su' + su, { x: Math.max(0, r[0] - 190), y: Math.max(0, r[1] - 250), width: 380, height: 420 });
  }
  await ev(`(function(){document.getElementById('bancVolant').remove();document.getElementById('bancFond').remove();return 1})()`);
};
