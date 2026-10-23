/* ===== LA FÊTE D'UNE CAISSE (2026-10-23, Sacha : « en fonction de la rareté des voitures qu'on débloque, fais des animations plus ou moins impressionnantes ») =====
   Une caisse qui devient à toi (achat au garage, achat en €, condition remplie en course) se FÊTE à la mesure de sa rareté :
   COMMUNE un bandeau discret · RARE un éclair bleu et des étincelles · ÉPIQUE des rayons, une secousse, une pluie de confettis ·
   LÉGENDAIRE le grand jeu (double éclair, ondes, rayons d'or, confettis, arpège) · MYTHIQUE / INFINI, plus grand encore.
   Un seul calque plein écran (`pointer-events:none`, il ne vole jamais un toucher), retiré tout seul. « Réduire les animations » : le bandeau seul.
   Crochet de test : window.dbgFeteCaisse(index) rejoue la fête d'une caisse. */
const FETE_CFG={ /* d=durée ms · r=rayons · c=confettis · o=ondes · f=éclairs · n=notes de l'arpège · s=secousse */
  commun:    {d:1700,r:0, c:0,  o:0,f:0,n:2,s:0},
  rare:      {d:2300,r:8, c:26, o:1,f:1,n:3,s:.12},
  exotique:  {d:2300,r:8, c:26, o:1,f:1,n:3,s:.12},
  epique:    {d:3200,r:14,c:70, o:2,f:1,n:5,s:.3},
  legendaire:{d:4600,r:22,c:150,o:3,f:2,n:7,s:.5},
  mythique:  {d:5400,r:30,c:210,o:4,f:2,n:9,s:.6},
  infini:    {d:6000,r:36,c:280,o:5,f:3,n:11,s:.7}};
const FETE_CSS='#feteCaisse{position:fixed;inset:0;z-index:99990;pointer-events:none;overflow:hidden;--fc:#ffd75e;animation:feteIn .25s ease-out both}'
 +'#feteCaisse.sort{animation:feteOut .5s ease-in forwards}'
 +'#feteCaisse .feFlash{position:absolute;inset:0;background:radial-gradient(circle at 50% 46%,#fff 0,var(--fc) 38%,transparent 72%);opacity:0;animation:feFlash .7s ease-out forwards}'
 +'#feteCaisse .feRayons{position:absolute;left:50%;top:46%;width:230vmax;height:230vmax;margin:-115vmax 0 0 -115vmax;opacity:0;animation:feRay var(--fd) linear forwards;'
 +'background:repeating-conic-gradient(from 0deg,var(--fc) 0 calc(180deg/var(--fn)),transparent 0 calc(360deg/var(--fn)));'
 +'-webkit-mask:radial-gradient(circle,#000 0,transparent 42%);mask:radial-gradient(circle,#000 0,transparent 42%)}'
 +'#feteCaisse .feOnde{position:absolute;left:50%;top:46%;width:30vmin;height:30vmin;margin:-15vmin 0 0 -15vmin;border-radius:50%;border:.9vmin solid var(--fc);opacity:0;animation:feOnde 1.3s ease-out forwards;animation-delay:var(--dl)}'
 +'#feteCaisse canvas{position:absolute;inset:0;width:100%;height:100%}'
 +'#feteCaisse .feTexte{position:absolute;left:0;right:0;top:19%;text-align:center;color:#fff;text-shadow:0 .5vmin 0 rgba(0,0,0,.6),0 0 3vmin var(--fc)}'
 +'#feteCaisse .feTexte small{display:block;font-size:max(11px,2.6vmin);letter-spacing:.3em;opacity:.9;animation:feTxt .5s .15s both}'
 +'#feteCaisse .feTexte i{display:inline-block;font-style:normal;font-size:max(15px,4.4vmin);letter-spacing:.18em;color:var(--fc);margin:.7vmin 0;padding:.5vmin 2vmin;border:.5vmin solid var(--fc);background:rgba(0,0,0,.45);animation:feTamp .55s .25s cubic-bezier(.2,1.6,.4,1) both}'
 +'#feteCaisse .feTexte b{display:block;font-size:max(20px,calc(var(--fs)*1vmin));line-height:1.1;animation:feNom .7s .1s cubic-bezier(.2,1.5,.4,1) both}'
 +'@keyframes feteIn{from{opacity:0}to{opacity:1}}@keyframes feteOut{to{opacity:0}}'
 +'@keyframes feFlash{0%{opacity:0}12%{opacity:.95}100%{opacity:0}}'
 +'@keyframes feRay{0%{opacity:0;transform:rotate(0) scale(.4)}12%{opacity:.5}75%{opacity:.4}100%{opacity:0;transform:rotate(90deg) scale(1)}}'
 +'@keyframes feOnde{0%{opacity:.9;transform:scale(.1)}100%{opacity:0;transform:scale(5)}}'
 +'@keyframes feTxt{from{opacity:0;transform:translateY(-1.5vmin)}to{opacity:.9;transform:none}}'
 +'@keyframes feTamp{0%{opacity:0;transform:scale(3) rotate(-8deg)}100%{opacity:1;transform:scale(1) rotate(-2deg)}}'
 +'@keyframes feNom{0%{opacity:0;transform:scale(.3)}100%{opacity:1;transform:scale(1)}}';
let feteT=0,feteRaf=0;
function feteCaisse(i){
  const car=CARS[i];if(!car)return;
  const r=carRar(i),cfg=FETE_CFG[r]||FETE_CFG.commun,info=rarInfo(r),col=info.c,reduit=REDUCED_MOTION;
  if(!document.getElementById('feteCss')){const st=document.createElement('style');st.id='feteCss';st.textContent=FETE_CSS;document.head.appendChild(st);}
  feteFin(true);
  const el=document.createElement('div');el.id='feteCaisse';el.style.setProperty('--fc',col);el.style.setProperty('--fd',cfg.d+'ms');
  el.style.setProperty('--fn',Math.max(4,cfg.r));el.style.setProperty('--fs',cfg.d>=4000?9:cfg.d>=3000?7.5:6);
  let h='';
  if(!reduit){
    if(cfg.f)h+='<div class="feFlash"></div>';
    if(cfg.r)h+='<div class="feRayons"></div>';
    for(let k=0;k<cfg.o;k++)h+='<div class="feOnde" style="--dl:'+(k*.28)+'s"></div>';
    if(cfg.c)h+='<canvas></canvas>';
  }
  h+='<div class="feTexte"><small>'+sansAcc(TR('NOUVELLE VOITURE'))+'</small><i>'+sansAcc(TR(info.n1))+'</i><b>'+sansAcc(TR(car.name))+'</b></div>';
  el.innerHTML=h;document.body.appendChild(el);
  if(!reduit&&cfg.f>1)setTimeout(function(){const f=document.createElement('div');f.className='feFlash';el.appendChild(f);},420); /* le 2e éclair, plus tard */
  if(!reduit&&cfg.f>2)setTimeout(function(){const f=document.createElement('div');f.className='feFlash';el.appendChild(f);},900);
  if(!reduit&&cfg.s){try{shake=Math.max(shake,cfg.s);}catch(e){}}
  hap(cfg.n>=7?[20,40,20,40,20,40,90]:cfg.n>=5?[20,40,20,40,70]:[14,30,24]);
  for(let k=0;k<cfg.n;k++)setTimeout(function(){try{chimeNote(noteP(k%5,1+Math.floor(k/5)),0,.03,.16);}catch(e){}},120+k*85); /* l'arpège monte avec la rareté */
  const cv=el.querySelector('canvas');if(cv)feteConfettis(cv,cfg,col);
  feteT=setTimeout(function(){el.classList.add('sort');feteT=setTimeout(function(){feteFin(true);},520);},cfg.d);
}
function feteFin(){clearTimeout(feteT);cancelAnimationFrame(feteRaf);feteRaf=0;const o=document.getElementById('feteCaisse');if(o)o.remove();}
function feteConfettis(cv,cfg,col){ /* une pluie de confettis dans la couleur de la rareté (+ blanc et or), tirée du bas du texte */
  const dpr=Math.min(2,window.devicePixelRatio||1),W=cv.width=Math.round(innerWidth*dpr),H=cv.height=Math.round(innerHeight*dpr),g=cv.getContext('2d');if(!g)return;
  const teintes=[col,'#ffffff','#ffd75e',col],P=[];
  for(let k=0;k<cfg.c;k++){const a=Math.random()*Math.PI*2,v=(6+Math.random()*16)*dpr;
    P.push({x:W/2,y:H*.46,vx:Math.cos(a)*v,vy:Math.sin(a)*v-8*dpr,w:(5+Math.random()*7)*dpr,h:(3+Math.random()*5)*dpr,r:Math.random()*6,vr:(Math.random()-.5)*.5,c:teintes[k%4],t:Math.random()*.25});}
  const t0=performance.now();
  (function im(){const e=performance.now()-t0;g.clearRect(0,0,W,H);let vivant=0;
    for(const p of P){if(e<p.t*1000)continue;p.vy+=.55*dpr;p.vx*=.985;p.x+=p.vx;p.y+=p.vy;p.r+=p.vr;
      if(p.y>H+30)continue;vivant++;g.save();g.translate(p.x,p.y);g.rotate(p.r);g.fillStyle=p.c;g.globalAlpha=Math.max(0,Math.min(1,1-(e-cfg.d*.7)/(cfg.d*.3)));g.fillRect(-p.w/2,-p.h/2,p.w,p.h);g.restore();}
    if(vivant&&e<cfg.d+500)feteRaf=requestAnimationFrame(im);})();}
window.dbgFeteCaisse=function(i){feteCaisse(i|0);};
Object.assign(I18N,{"NOUVELLE VOITURE":"NEW CAR"});
