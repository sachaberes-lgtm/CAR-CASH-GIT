/* (2026-11-15, qualité · petits, balayage n4) l'écran de SÉRIE de connexion, jours 1 / 4 / 7, avec l'ENCOCHE simulée : photo + débordements (le bloc dépasse-t-il l'écran, passe-t-il sous l'encoche / la barre d'accueil ?). */
module.exports = async function (b) {
  const { ev, shot, dormir, W, H, log } = b;
  const couche = W > H, I = couche ? { T: 0, B: 21, L: 47, R: 47 } : { T: 47, B: 34, L: 0, R: 0 };
  await ev(`(function(){const r=document.documentElement.style;r.setProperty('--ccT','${I.T}px');r.setProperty('--ccB','${I.B}px');r.setProperty('--ccL','${I.L}px');r.setProperty('--ccR','${I.R}px');return 1})()`);
  await ev(`(function(){const s=document.createElement('style');s.id='bancGel';s.textContent='.swRayons{animation:none!important}.swAnneau{display:none!important}';document.head.appendChild(s);return 1})()`);
  for (const n of [1, 4, 7]) {
    await ev(`dbgSerie('ecran',${n});1`); await dormir(3500);
    const m = await ev(`(function(){const w=document.getElementById('serieW'),o=[];const q=w.querySelectorAll('.swBloc,.swBloc *');q.forEach(function(e){const r=e.getBoundingClientRect();if(r.width<2||r.height<2)return;const t=[].some.call(e.childNodes,function(x){return x.nodeType===3&&x.textContent.trim()})||e.matches('button,.swBt');if(!t)return;const p=[];if(r.top<${I.T}-1)p.push('H'+Math.round(r.top));if(r.bottom>innerHeight-${I.B}+1)p.push('B'+Math.round(innerHeight-r.bottom));if(r.left<${I.L}-1)p.push('G'+Math.round(r.left));if(r.right>innerWidth-${I.R}+1)p.push('D'+Math.round(innerWidth-r.right));if(p.length)o.push((e.className||e.tagName)+' «'+(e.textContent||'').trim().slice(0,18)+'» '+p.join(','))});const bl=document.querySelector('#serieW .swBloc').getBoundingClientRect();return JSON.stringify({bloc:[Math.round(bl.top),Math.round(bl.bottom),innerHeight],hors:o.slice(0,12),scroll:[w.scrollHeight,w.clientHeight]})})()`);
    log('serie', n, m); await shot('serie' + n);
    await ev("(function(){const s=document.getElementById('serieW');s.classList.remove('on');return 1})()"); await dormir(500);
  }
};
