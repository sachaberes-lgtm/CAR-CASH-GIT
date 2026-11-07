/* ===== LA VITRE QUI SE BRISE (2026-11-05, Léo : « une petite animation quand tu achètes quelque chose : la vitre qui se brise, en mode débloqué ») =====
   Après un achat réussi (missions/atelier.js : le gestionnaire d'ACHETER), la carte choisie de la boutique (`#gBqPan .bqK.sel`) éclate : une calque d'ÉCLATS de verre
   (des triangles découpés par `clip-path`, chacun part dans sa direction), un éclair de la couleur de la rareté et le mot DÉBLOQUÉ. Purement visuel et APRÈS coup : ni le débit ni la possession ne passent
   par ici (voir shopBuy et carBuy) ; tout est dans un try/catch chez l'appelant. Le calque se retire seul au bout d'une seconde. Mouvement réduit : l'éclair et le mot seulement. Allégé : moitié moins d'éclats. */
Object.assign(I18N,{"DÉBLOQUÉ":"UNLOCKED"});
function bqVitreBrise(){
  const pan=document.getElementById('gBqPan');if(!pan)return;
  const el=pan.querySelector('.bqK.sel');if(!el)return;
  const pr=pan.getBoundingClientRect(),r=el.getBoundingClientRect();if(!r.width||!r.height)return;
  const vieux=pan.querySelector('.bqBris');if(vieux)vieux.remove();
  const rc=el.style.getPropertyValue('--rc')||'#ffffff',lourd=!(typeof PAL!=='undefined'&&PAL.n<2),mouv=!(typeof REDUCED_MOTION!=='undefined'&&REDUCED_MOTION);
  const ov=document.createElement('div');ov.className='bqBris';ov.setAttribute('aria-hidden','true');
  ov.style.cssText='left:'+(r.left-pr.left)+'px;top:'+(r.top-pr.top)+'px;width:'+r.width+'px;height:'+r.height+'px;--rc:'+rc;
  let h='<i class="bqF"></i>';
  if(mouv){const C=lourd?3:2,R=lourd?3:2; /* une grille C × R, chaque case coupée en deux triangles : 18 éclats (8 en allégé) */
    for(let j=0;j<R;j++)for(let i=0;i<C;i++){const x0=i*100/C,x1=(i+1)*100/C,y0=j*100/R,y1=(j+1)*100/R,cx=(x0+x1)/2-50,cy=(y0+y1)/2-50;
      [[x0,y0,x1,y0,x0,y1],[x1,y0,x1,y1,x0,y1]].forEach(function(t,n){
        const dx=Math.round(cx*1.6+(Math.random()-.5)*50),dy=Math.round(cy*1.6+60+Math.random()*70),rz=Math.round((Math.random()-.5)*160);
        h+='<span style="clip-path:polygon('+t[0]+'% '+t[1]+'%,'+t[2]+'% '+t[3]+'%,'+t[4]+'% '+t[5]+'%);--dx:'+dx+'px;--dy:'+dy+'px;--rz:'+rz+'deg;animation-delay:'+(n*12+i*8)+'ms"></span>';});}}
  h+='<b>'+sansAcc(TR('DÉBLOQUÉ'))+'</b>';ov.innerHTML=h;pan.appendChild(ov);
  el.classList.add('brise');setTimeout(function(){el.classList.remove('brise');},900);
  /* (2026-11-07, Léo : « quand on appuie ACHETER, la vitre se casse, et là elle disparaît ; avec le code de la vitrine on l'avait supprimé ») LA VITRINE (vitrine-miniature.js) : la carte n'a plus de cube CSS à cacher, c'est une photo avec son verre. Sous les éclats, elle reçoit la photo de la caisse À TOI (sans verre) : vitrinePose relit la possession (bqA), déjà vraie ici. */
  try{const ph=el.querySelector('[data-ph]');if(typeof VITM!=='undefined'&&VITM.on&&ph&&el.classList.contains('vo'))setTimeout(function(){try{vitrinePose(ph,+ph.getAttribute('data-ph'));}catch(e){}},90);}catch(e){}
  try{if(typeof sfx==='function')sfx('ui.debloque');}catch(e){}
  setTimeout(function(){if(ov.parentNode)ov.remove();},1100);}

/* (2026-11-07, Léo : « la vitre des ailes, qu'on peut casser aussi ») LA MÊME VITRE QUI SE BRISE, posée SUR un élément donné (la carte d'une aile dans la molette, aile-vitrine.js) : le calque d'éclats couvre l'élément (inset 0), l'éclair de la rareté, DÉBLOQUÉ, le son. */
function bqVitreBriseSur(el){if(!el)return;const r=el.getBoundingClientRect();if(!r.width||!r.height)return;
  const vieux=el.querySelector(':scope>.bqBris');if(vieux)vieux.remove();
  const rc=el.style.getPropertyValue('--rc')||'#ffffff',lourd=!(typeof PAL!=='undefined'&&PAL.n<2),mouv=!(typeof REDUCED_MOTION!=='undefined'&&REDUCED_MOTION);
  const ov=document.createElement('div');ov.className='bqBris bqBrisSur';ov.setAttribute('aria-hidden','true');ov.style.cssText='left:0;top:0;width:100%;height:100%;--rc:'+rc;
  let h='<i class="bqF"></i>';
  if(mouv){const C=lourd?4:2,R=lourd?2:2;for(let j=0;j<R;j++)for(let i=0;i<C;i++){const x0=i*100/C,x1=(i+1)*100/C,y0=j*100/R,y1=(j+1)*100/R,cx=(x0+x1)/2-50,cy=(y0+y1)/2-50;
    [[x0,y0,x1,y0,x0,y1],[x1,y0,x1,y1,x0,y1]].forEach(function(t,n){const dx=Math.round(cx*1.4+(Math.random()-.5)*40),dy=Math.round(cy*1.4+50+Math.random()*60),rz=Math.round((Math.random()-.5)*160);
      h+='<span style="clip-path:polygon('+t[0]+'% '+t[1]+'%,'+t[2]+'% '+t[3]+'%,'+t[4]+'% '+t[5]+'%);--dx:'+dx+'px;--dy:'+dy+'px;--rz:'+rz+'deg;animation-delay:'+(n*12+i*8)+'ms"></span>';});}}
  h+='<b>'+sansAcc(TR('DÉBLOQUÉ'))+'</b>';ov.innerHTML=h;el.appendChild(ov);
  try{if(typeof sfx==='function')sfx('ui.debloque');}catch(e){}try{hap([10,30,20,30,40]);}catch(e){}
  setTimeout(function(){if(ov.parentNode)ov.remove();},1100);}
