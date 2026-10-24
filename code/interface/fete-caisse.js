/* ===== LA FÊTE D'UNE CAISSE (2026-10-23, Sacha : « en fonction de la rareté des voitures qu'on débloque, fais des animations plus ou moins impressionnantes » ; v2 : « surtout pour les plus rares, il faut que ce soit très satisfaisant ») =====
   Une caisse qui devient à toi (achat au garage, achat en €, condition remplie en course) se FÊTE à la mesure de sa rareté, en trois temps :
   1. LA CHARGE (k ms, dès RARE) : l'écran s'assombrit, des particules de la couleur de la rareté convergent vers un orbe qui grossit, l'écran
      tremble de plus en plus, un riser monte — on retient son souffle ;
   2. L'EXPLOSION : éclair blanc, onde(s) de choc, rayons, colonnes de lumière, gerbe d'étincelles, confettis, coup de caméra, accord final ;
   3. LE MAINTIEN : le nom se tamponne lettre par lettre (reflet qui balaie), les ★ de la rareté s'allument une à une, des étoiles scintillent.
   COMMUNE : un bandeau sec. LÉGENDAIRE et au-delà : tout, plus long, plus fort. Un calque plein écran (`pointer-events:none`), retiré tout seul.
   « Réduire les animations » : le bandeau seul. Crochet de test : window.dbgFeteCaisse(index) (+ ?fete=rareté dans la console : dbgFeteCaisse(i,'legendaire')). */
const FETE_CFG={ /* k=charge ms · d=durée totale ms · r=rayons · c=confettis · e=étincelles · o=ondes · f=éclairs · b=colonnes · n=notes · s=secousse · st=★ */
  commun:    {k:0,   d:1900,r:0, c:0,  e:0,  o:0,f:0,b:0, n:2, s:0,  st:1},
  rare:      {k:450, d:3000,r:10,c:50, e:40, o:1,f:1,b:0, n:4, s:.18,st:2},
  exotique:  {k:450, d:3000,r:10,c:50, e:40, o:1,f:1,b:0, n:4, s:.18,st:2},
  epique:    {k:800, d:4300,r:16,c:110,e:90, o:2,f:2,b:5, n:6, s:.4, st:3},
  legendaire:{k:1200,d:6000,r:24,c:200,e:170,o:3,f:3,b:9, n:8, s:.7, st:4},
  mythique:  {k:1500,d:7000,r:32,c:280,e:240,o:4,f:3,b:13,n:10,s:.9, st:5},
  infini:    {k:1800,d:8000,r:40,c:360,e:320,o:5,f:4,b:17,n:12,s:1.1,st:6}};
const FETE_CSS='#feteCaisse{position:fixed;inset:0;z-index:99990;pointer-events:none;overflow:hidden;--fc:#ffd75e}'
 +'#feteCaisse.sort{animation:feteOut .6s ease-in forwards}'
 +'#feteCaisse .feVoile{position:absolute;inset:0;opacity:0;animation:feVoile .5s ease-out forwards;background:radial-gradient(circle at 50% 46%,rgba(0,0,0,0) 18%,rgba(4,2,12,.72) 100%)}'
 +'#feteCaisse .feTeinte{position:absolute;inset:0;opacity:0;animation:feTeinte var(--fd) ease-out forwards;background:radial-gradient(circle at 50% 46%,transparent 30%,var(--fc) 140%)}'
 +'#feteCaisse .feFlash{position:absolute;inset:0;background:radial-gradient(circle at 50% 46%,#fff 0,#fff 14%,var(--fc) 42%,transparent 76%);opacity:0;animation:feFlash .8s ease-out forwards;animation-delay:var(--dl,0s)}'
 +'#feteCaisse .feRayons{position:absolute;left:50%;top:46%;width:150vmax;height:150vmax;margin:-75vmax 0 0 -75vmax;opacity:0;animation:feRay calc(var(--fd) - var(--k)) linear forwards;animation-delay:var(--k);'
 +'background:repeating-conic-gradient(from 0deg,var(--fc) 0 calc(180deg/var(--fn)),transparent 0 calc(360deg/var(--fn)));'
 +'-webkit-mask:radial-gradient(circle,#000 0,transparent 40%);mask:radial-gradient(circle,#000 0,transparent 40%)}'
 +'#feteCaisse .feOnde{position:absolute;left:50%;top:46%;width:30vmin;height:30vmin;margin:-15vmin 0 0 -15vmin;border-radius:50%;border:1.1vmin solid var(--fc);box-shadow:0 0 4vmin var(--fc),inset 0 0 4vmin var(--fc);opacity:0;animation:feOnde 1.4s ease-out forwards;animation-delay:var(--dl)}'
 +'#feteCaisse .feColonne{position:absolute;bottom:-5%;width:9vmin;height:115%;left:var(--x);margin-left:-4.5vmin;transform-origin:50% 100%;opacity:0;animation:feCol 1.6s ease-out forwards;animation-delay:var(--dl);'
 +'background:linear-gradient(to top,var(--fc),rgba(255,255,255,.55) 40%,transparent);-webkit-mask:linear-gradient(90deg,transparent,#000 50%,transparent);mask:linear-gradient(90deg,transparent,#000 50%,transparent)}'
 +'#feteCaisse canvas{position:absolute;inset:0;width:100%;height:100%}'
 +'#feteCaisse .feTexte{position:absolute;left:0;right:0;top:13%;text-align:center;color:#fff;text-shadow:0 .5vmin 0 rgba(0,0,0,.65),0 0 3vmin var(--fc)}'
 +'#feteCaisse .feTexte small{display:block;font-size:max(11px,2.6vmin);letter-spacing:.3em;opacity:0;animation:feTxt .5s calc(var(--k) + .05s) both}'
 +'#feteCaisse .feTexte i{display:inline-block;font-style:normal;font-size:max(15px,4.6vmin);letter-spacing:.18em;color:var(--fc);margin:.8vmin 0;padding:.5vmin 2vmin;border:.5vmin solid var(--fc);background:rgba(0,0,0,.55);box-shadow:0 0 3vmin var(--fc);animation:feTamp .55s calc(var(--k) + .12s) cubic-bezier(.2,1.7,.4,1) both}'
 +'#feteCaisse .feEtoiles{display:block;font-size:max(14px,3.4vmin);letter-spacing:.4em;margin:.4vmin 0 .8vmin;color:var(--fc);text-indent:.4em}'
 +'#feteCaisse .feEtoiles u{text-decoration:none;display:inline-block;opacity:0;animation:feEtoile .5s cubic-bezier(.2,1.8,.4,1) both;animation-delay:calc(var(--k) + .5s + var(--j)*.13s)}'
 +'#feteCaisse .feNom{display:block;font-size:max(20px,calc(var(--fs)*1vmin));line-height:1.12;font-weight:900}'
 +'#feteCaisse .feNom span{display:inline-block;opacity:0;animation:feLettre .45s cubic-bezier(.2,1.6,.4,1) both;animation-delay:calc(var(--k) + .2s + var(--i)*.045s);'
 +'background:linear-gradient(100deg,#fff 0 40%,var(--fc) 50%,#fff 60% 100%);background-size:260% 100%;background-position:130% 0;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;text-shadow:none;filter:drop-shadow(0 .4vmin 0 rgba(0,0,0,.65)) drop-shadow(0 0 2vmin var(--fc));'
 +'animation-name:feLettre,feReflet;animation-duration:.45s,1.2s;animation-delay:calc(var(--k) + .2s + var(--i)*.045s),calc(var(--k) + 1s + var(--i)*.04s);animation-fill-mode:both,both}'
 +'@keyframes feteOut{to{opacity:0}}@keyframes feVoile{to{opacity:1}}'
 +'@keyframes feTeinte{0%,30%{opacity:0}45%{opacity:.5}100%{opacity:.18}}'
 +'@keyframes feFlash{0%{opacity:0}10%{opacity:1}100%{opacity:0}}'
 +'@keyframes feRay{0%{opacity:0;transform:rotate(0) scale(.3)}10%{opacity:.6}70%{opacity:.45}100%{opacity:0;transform:rotate(110deg) scale(1)}}'
 +'@keyframes feOnde{0%{opacity:1;transform:scale(.1)}100%{opacity:0;transform:scale(5.5)}}'
 +'@keyframes feCol{0%{opacity:0;transform:scaleY(0)}18%{opacity:.8;transform:scaleY(1)}100%{opacity:0;transform:scaleY(1) scaleX(.4)}}'
 +'@keyframes feTxt{from{opacity:0;transform:translateY(-1.5vmin)}to{opacity:.9;transform:none}}'
 +'@keyframes feTamp{0%{opacity:0;transform:scale(3.2) rotate(-10deg)}100%{opacity:1;transform:scale(1) rotate(-2deg)}}'
 +'@keyframes feEtoile{0%{opacity:0;transform:scale(0) rotate(-180deg)}100%{opacity:1;transform:scale(1) rotate(0)}}'
 +'@keyframes feLettre{0%{opacity:0;transform:translateY(-6vmin) scale(2.2)}100%{opacity:1;transform:none}}'
 +'@keyframes feReflet{0%{background-position:130% 0}100%{background-position:-30% 0}}';
let feteT=0,feteRaf=0,feteTs=[];
function feteCaisse(i,forceR){
  const car=CARS[i];if(!car)return;
  const r=forceR||carRar(i),cfg=FETE_CFG[r]||FETE_CFG.commun,info=rarInfo(r),col=info.c,reduit=REDUCED_MOTION;
  if(!document.getElementById('feteCss')){const st=document.createElement('style');st.id='feteCss';st.textContent=FETE_CSS;document.head.appendChild(st);}
  feteFin();
  const el=document.createElement('div');el.id='feteCaisse';el.style.setProperty('--fc',col);el.style.setProperty('--fd',cfg.d+'ms');el.style.setProperty('--k',(reduit?0:cfg.k)/1000+'s');
  const nom=sansAcc(TR(car.name));
  el.style.setProperty('--fn',Math.max(4,cfg.r));el.style.setProperty('--fs',Math.min(cfg.d>=6000?9:cfg.d>=4000?7.6:6.2,78/Math.max(6,nom.length)*1.7));
  let h='';
  if(!reduit){
    if(cfg.k)h+='<div class="feVoile"></div><div class="feTeinte"></div>';
    if(cfg.r)h+='<div class="feRayons"></div>';
    for(let k=0;k<cfg.b;k++)h+='<div class="feColonne" style="--x:'+(6+k*88/Math.max(1,cfg.b-1)).toFixed(1)+'%;--dl:'+((cfg.k/1000)+Math.abs(k-cfg.b/2)*.07).toFixed(2)+'s"></div>';
    for(let k=0;k<cfg.o;k++)h+='<div class="feOnde" style="--dl:'+((cfg.k/1000)+k*.3).toFixed(2)+'s"></div>';
    h+='<canvas></canvas>';
  }
  let etoiles='';for(let k=0;k<cfg.st;k++)etoiles+='<u style="--j:'+k+'">★</u>';
  h+='<div class="feTexte"><small>'+sansAcc(TR('NOUVELLE VOITURE'))+'</small><i>'+sansAcc(TR(info.n1))+'</i><span class="feEtoiles">'+etoiles+'</span><b class="feNom">'
    +Array.from(nom).map(function(c,k){return c===' '?' ':'<span style="--i:'+k+'">'+c+'</span>';}).join('')+'</b></div>';
  el.innerHTML=h;document.body.appendChild(el);
  const T=function(f,ms){feteTs.push(setTimeout(f,ms));},K=reduit?0:cfg.k;
  const flash=function(){const f=document.createElement('div');f.className='feFlash';el.appendChild(f);};
  if(!reduit){
    for(let k=1;k<cfg.f;k++)T(flash,K+k*380);
    /* LA CHARGE : tremblement qui monte, riser (gamme qui grimpe + souffle), haptique en crescendo */
    if(cfg.k){
      const pas=Math.max(4,Math.round(cfg.k/90));
      for(let k=0;k<pas;k++)T(function(){try{shake=Math.max(shake,cfg.s*.35*(k/pas));}catch(e){}},k*(cfg.k/pas));
      const nr=Math.round(cfg.k/110);for(let k=0;k<nr;k++)T(function(){try{chimeNote(noteP(k%5,Math.floor(k/5)),0,.012+.02*k/nr,.1);}catch(e){}},k*(cfg.k/nr));
      T(function(){try{noiseBurst(cfg.k/1000,.07,500+cfg.n*160);}catch(e){}},0);
      hap(cfg.k>=1200?[8,60,10,60,14,50,20,40,30,30,40]:[8,60,12,50,20]);
    }
    /* L'EXPLOSION */
    T(function(){try{shake=Math.max(shake,cfg.s);fovPunch=Math.max(fovPunch,cfg.s*14);}catch(e){}try{noiseBurst(.5,.14,1400);}catch(e){}
      hap(cfg.n>=8?[30,40,30,40,30,40,120]:cfg.n>=5?[24,40,24,40,80]:[14,30,24]);
      for(let k=0;k<cfg.n;k++)T(function(){try{chimeNote(noteP(k%5,1+Math.floor(k/5)),0,.032,.2);}catch(e){}},k*80);
      if(cfg.n>=6)T(function(){try{chimeNote(noteP(0,0),0,.05,.9);chimeNote(noteP(2,1),0,.04,.9);chimeNote(noteP(4,1),0,.04,.9);}catch(e){}},cfg.n*80); /* l'accord final tenu */
    },K);
    for(let k=1;k<cfg.f;k++)T(function(){try{shake=Math.max(shake,cfg.s*.6);hap(14);}catch(e){}},K+k*380);
  }else{hap([14,30,24]);}
  const cv=el.querySelector('canvas');if(cv)feteParticules(cv,cfg,col,K);
  feteT=setTimeout(function(){el.classList.add('sort');feteT=setTimeout(feteFin,620);},cfg.d);
  if(!reduit&&cfg.k)T(flash,K); /* le flash de l'explosion (les suivants : plus haut) */
  else if(!reduit&&cfg.f)T(flash,0);
}
function feteFin(){clearTimeout(feteT);for(const t of feteTs)clearTimeout(t);feteTs=[];cancelAnimationFrame(feteRaf);feteRaf=0;const o=document.getElementById('feteCaisse');if(o)o.remove();}
function feteParticules(cv,cfg,col,K){ /* UN canvas, quatre sortes : particules de charge (convergent), étincelles (traînées, additives), confettis, étoiles qui scintillent */
  const dpr=Math.min(2,window.devicePixelRatio||1),W=cv.width=Math.round(innerWidth*dpr),H=cv.height=Math.round(innerHeight*dpr),g=cv.getContext('2d');if(!g)return;
  const cx=W/2,cy=H*.46,M=Math.min(W,H),teintes=[col,'#ffffff','#ffd75e',col,'#ffffff'],P=[],S=[],C=[],E=[];
  let boom=false,t0=performance.now(),dern=t0;
  function boum(){boom=true;
    for(let k=0;k<cfg.e;k++){const a=Math.random()*6.2832,v=(8+Math.random()*26)*dpr;S.push({x:cx,y:cy,px:cx,py:cy,vx:Math.cos(a)*v,vy:Math.sin(a)*v,c:Math.random()<.5?'#fff':col,l:0,L:.7+Math.random()*.9});}
    for(let k=0;k<cfg.c;k++){const a=Math.random()*6.2832,v=(5+Math.random()*17)*dpr;
      C.push({x:cx,y:cy,vx:Math.cos(a)*v,vy:Math.sin(a)*v-9*dpr,w:(5+Math.random()*8)*dpr,h:(3+Math.random()*5)*dpr,r:Math.random()*6,vr:(Math.random()-.5)*.5,c:teintes[k%5],d:Math.random()*.25});}}
  (function im(now){
    const e=now-t0,dt=Math.min(.05,(now-dern)/1000);dern=now;g.clearRect(0,0,W,H);
    if(!boom&&e<K){ /* la charge : de plus en plus de particules aspirées vers l'orbe, qui grossit */
      const u=e/Math.max(1,K),n=Math.round(2+u*7);
      for(let k=0;k<n;k++){const a=Math.random()*6.2832,R=M*(.35+Math.random()*.35);P.push({x:cx+Math.cos(a)*R,y:cy+Math.sin(a)*R,t:0,T:.35+Math.random()*.3,c:teintes[(Math.random()*5)|0],s:(1.5+Math.random()*3)*dpr});}
      g.globalCompositeOperation='lighter';const R0=M*.02+M*.2*u*u,gr=g.createRadialGradient(cx,cy,0,cx,cy,R0*2.4);gr.addColorStop(0,'rgba(255,255,255,'+(.5+.5*u)+')');gr.addColorStop(.35,col);gr.addColorStop(1,'rgba(0,0,0,0)');g.globalAlpha=.55+.45*u;g.fillStyle=gr;g.beginPath();g.arc(cx,cy,R0*2.4,0,6.2832);g.fill();g.globalAlpha=1;
    }else if(!boom)boum();
    g.globalCompositeOperation='lighter';
    for(let k=P.length-1;k>=0;k--){const p=P[k];p.t+=dt;const q=Math.min(1,p.t/p.T),z=q*q,x=p.x+(cx-p.x)*z,y=p.y+(cy-p.y)*z;
      g.globalAlpha=Math.min(1,q*2.5)*(1-q*.4);g.fillStyle=p.c;g.fillRect(x-p.s/2,y-p.s/2,p.s,p.s);if(q>=1)P.splice(k,1);}
    for(let k=S.length-1;k>=0;k--){const s=S[k];s.l+=dt;s.px=s.x;s.py=s.y;const f9=dt*60,a9=Math.pow(.965,f9);s.vx*=a9;s.vy=s.vy*a9+.35*dpr*f9;s.x+=s.vx*f9;s.y+=s.vy*f9; /* (2026-10-24) calé sur 60 i/s : même trajet à 30, 60 ou 120 Hz */
      const a=1-s.l/s.L;if(a<=0){S.splice(k,1);continue;}g.globalAlpha=a;g.strokeStyle=s.c;g.lineWidth=2.2*dpr;g.beginPath();g.moveTo(s.px,s.py);g.lineTo(s.x,s.y);g.stroke();}
    g.globalCompositeOperation='source-over';
    const fin=cfg.d-600;
    for(let k=C.length-1;k>=0;k--){const p=C[k];if(e<K+p.d*1000)continue;const f9=dt*60;p.vy+=.5*dpr*f9;p.vx*=Math.pow(.987,f9);p.vy*=Math.pow(.992,f9);p.x+=p.vx*f9;p.y+=p.vy*f9;p.r+=p.vr*f9; /* (2026-10-24) idem, calé sur 60 i/s */
      if(p.y>H+30){C.splice(k,1);continue;}g.save();g.translate(p.x,p.y);g.rotate(p.r);g.scale(1,Math.cos(p.r*1.7));g.fillStyle=p.c;g.globalAlpha=Math.max(0,Math.min(1,(fin-e)/700));g.fillRect(-p.w/2,-p.h/2,p.w,p.h);g.restore();}
    if(boom&&cfg.st>=3&&e<fin-300&&Math.random()<.5){E.push({x:Math.random()*W,y:Math.random()*H*.8,t:0,T:.5+Math.random()*.6,s:(5+Math.random()*9)*dpr});} /* les étoiles scintillent pendant le maintien */
    g.globalCompositeOperation='lighter';
    for(let k=E.length-1;k>=0;k--){const s=E[k];s.t+=dt;const q=s.t/s.T;if(q>=1){E.splice(k,1);continue;}const a=Math.sin(q*Math.PI),L=s.s*a;
      g.globalAlpha=a;g.fillStyle='#fff';g.fillRect(s.x-L,s.y-s.s*.12,L*2,s.s*.24);g.fillRect(s.x-s.s*.12,s.y-L,s.s*.24,L*2);}
    g.globalAlpha=1;g.globalCompositeOperation='source-over';
    if(e<cfg.d)feteRaf=requestAnimationFrame(im);})(t0);}
window.dbgFeteCaisse=function(i,r){feteCaisse(i|0,r);};
Object.assign(I18N,{"NOUVELLE VOITURE":"NEW CAR"});
