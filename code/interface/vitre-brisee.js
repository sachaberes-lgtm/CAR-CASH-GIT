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

/* ===== LA CAISSE ACHETÉE QUITTE LE SHOP (2026-11-11, Sacha : « travaille l'animation quand on achète une voiture : que la vitre se brise et que la voiture disparaisse du shop ») =====
   Après bqVitreBrise (les éclats, le flash, DÉBLOQUÉ) : la photo de la carte (la caisse dans sa boîte) s'ENVOLE vers le plateau — elle grossit, s'éclaircit et s'éteint là où la caisse apparaît —, puis la carte se REFERME :
   la bande se resserre sur sa place, la famille vide s'efface avec elle. Les caisses à toi ne sont plus dans la boutique (bqPieces) ; la clé de la bande est remise à jour ici, la bande n'est pas refaite (pas de clignotement,
   la position reste). Mouvement réduit : la carte s'efface sans envol. ◀ ▶ reprennent à la place de la carte partie (GBQ.apresIdx). */
function bqAchatPart(i){GBQ.partant=GBQ.partant||{};GBQ.partant[i]=1;
  const pan=document.getElementById('gBqPan'),rail=pan&&pan.querySelector('.bqRail'),el=rail&&rail.querySelector('.bqK[data-k="v:'+i+'"]'),mouv=!(typeof REDUCED_MOTION!=='undefined'&&REDUCED_MOTION);
  const fin=function(){const cartes=rail?[].slice.call(rail.querySelectorAll('.bqK,.bcK,.pN')):[];if(el&&el.isConnected){GBQ.apresIdx=Math.max(0,cartes.indexOf(el));const pr=el.previousElementSibling,sv=el.nextElementSibling;el.remove();
      if(pr&&pr.classList.contains('bqSec')&&(!sv||sv.classList.contains('bqSec')))pr.remove();} /* la famille qui n'a plus de carte s'en va avec elle */
    delete GBQ.partant[i];if(GBQ.cat==='voiture'){try{GBQ.rk=bqRkCle('cat','voiture',bqListe('voiture'));}catch(e){}}try{if(rail)rail.dispatchEvent(new Event('scroll'));}catch(e){}};
  if(!el||GBQ.cat!=='voiture'){delete GBQ.partant[i];return;}
  const im=el.querySelector(':scope>.vtI'),gb=document.getElementById('gBq'),z=GBQ.zone;
  if(mouv&&im&&gb&&z&&im.getAttribute('src')){const r=im.getBoundingClientRect(),g=gb.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,
      tx=(z.g+(z.cote?z.x0-8:z.d))/2,ty=z.y0+(z.y1-z.y0)*.5,f=document.createElement('img');
    f.className='bqVol';f.alt='';f.src=im.getAttribute('src');f.setAttribute('aria-hidden','true');
    f.style.cssText='left:'+(r.left-g.left)+'px;top:'+(r.top-g.top)+'px;width:'+r.width+'px;height:'+r.height+'px;--dx:'+Math.round(tx-cx)+'px;--dy:'+Math.round(ty-cy)+'px;--rc:'+(el.style.getPropertyValue('--rc')||'#fff');
    gb.appendChild(f);setTimeout(function(){f.remove();},800);}
  el.classList.add('part1');
  setTimeout(function(){if(el.isConnected)el.classList.add('part2');},mouv?640:160);
  setTimeout(fin,mouv?1010:520);}
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
