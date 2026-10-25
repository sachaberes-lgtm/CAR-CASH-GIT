/* =====================================================================================================================================
   LE BOUTON NITRO v3 — L'ÉCLAIR EN PIXELS QUI S'ENFONCE, ET LA VITESSE À DROITE DE LA BARRE DE BOOST (2026-10-12, Léo) — voir
   <style id="nitroEclair">. Le chemin du jour : un éclair 3D brillant, un cadran rond (« la jauge bizarre » : retiré), des arcs électriques
   (« qu'elle ne s'électrifie pas »), un bouton d'arcade rond et vernis (« nan, sans rond, vraiment PIXELS, qui s'appuie quand on appuie »).
   · L'ÉCLAIR est une GRILLE (NX3_G, la même silhouette que l'icône de la barre, en grand) dessinée case par case dans une toile de la taille
     de la grille, agrandie sans lissage (`image-rendering:pixelated`) : contour d'encre, biseau clair en haut à gauche, ombre en bas à droite,
     un reflet en diagonale, et une ÉPAISSEUR de NX3_T cases dessous. Appuyer l'ENFONCE : il descend d'une case à la fois, l'épaisseur
     disparaît (au lâcher il remonte, saute une case trop haut et retombe). La nitro qui BRÛLE le chauffe (palette claire) et l'entoure d'une
     lueur en CASES (deux anneaux) ; réserve bleue = bleu, nitro infinie = violet, à sec = gris et contour qui clignote rouge ; plein, la
     lueur respire. Un reflet blanc balaie les cases de temps en temps. Rien de 3D, aucun programme : ~700 cases, redessinées SEULEMENT
     quand quelque chose change (enfoncement, reflet, palette, lueur).
   · LA VITESSE (`#nxVit`, dans #nitroBar) : à droite de la barre de boost, en gros.
   Console : `dbgNitro3()` (état) · `dbgNitro3('k',1)` force la lueur · `dbgNitro3('p',1)` force l'appui.
   ===================================================================================================================================== */
const NX3_G=[ // 15 × 20 : la silhouette de l'éclair de la barre (pente, marche, pointe qui s'effile)
  '........######.',
  '.......######..',
  '......######...',
  '.....######....',
  '....######.....',
  '...######......',
  '..############.',
  '.############..',
  '.......######..',
  '......######...',
  '......#####....',
  '.....#####.....',
  '....#####......',
  '....####.......',
  '...####........',
  '...###.........',
  '..###..........',
  '..##...........',
  '.##............',
  '.#.............'];
/* (2026-10-24, passe perf 2e tour) LA JAUGE ET L'ANNEAU DE LA NITRO PAR CRANS PLUS LARGES sur les vieux téléphones : nitro tenue, la valeur change à chaque
   image — et le bouton (#tNitro : 18 règles, 402 déclarations, 16 descendants, un dégradé conique) est l'élément du HUD le plus cher à restyler et à repeindre
   (mesuré : 331 µs par recalcul à ×1, ~1,3 ms à ×4 ; la barre #nitroBar 542 µs). Crans [ANCIEN, MOYEN, RÉCENT] : l'anneau 2 % · 2 % · 1 % (d'origine), la barre
   1 % · 1 % · 0,5 % (d'origine) — deux fois moins de recalculs pendant la vidange ; le RÉCENT ne change pas. */
PAL.B.hudNitroQ=[50,50,100];PAL.B.hudBarQ=[100,100,200];
const NX3_T=3,NX3_M=3; // l'épaisseur (cases) · la marge autour (lueur 2 + contour 1)
const NX3={el:null,cv:null,cx:null,img:null,u32:null,vit:null,vN:null,v:-1,vT:0,vc:null,kmh:0,
  W:0,H:0,p:0,pv:0,pF:null,k:0,kF:null,t:0,gl:-1,glT:1.6,cle:'',m:null};
/* les PALETTES : [biseau, plein, reflet, ombre, épaisseur haute, épaisseur basse, lueur, contour] — l'or au repos, chauffé quand la nitro
   brûle, bleu en réserve, violet en nitro infinie (au repos et chauffé), gris à sec */
const NX3_PAL={
  or:  ['#fff3b8','#ffc21f','#ffe680','#e07a00','#b45200','#6e2a00','#ff8d2e','#1c0430'],
  feu: ['#ffffff','#fff0a0','#ffffff','#ffb02a','#ff7a1a','#b83e00','#ffb347','#1c0430'],
  bleu:['#ffffff','#b5c4ff','#e8edff','#4a68f0','#2a44c8','#16247a','#4a68f0','#0b0a2e'],
  vio: ['#ffe0dc','#ff4a3a','#ffb0a8','#ff1a0a','#c40a00','#6e0500','#ff4a3a','#1c0430'],
  vioF:['#ffffff','#ffc8c0','#ffffff','#ff4a3a','#ff1a0a','#6e0500','#ff4a3a','#1c0430'],
  sec: ['#a49cc4','#6e6890','#8a84aa','#4a4468','#332e50','#211d38','#ff5a6e','#1c0430']};
const NX3_RGB={};function nx3Rgb(h){let v=NX3_RGB[h];if(v==null){const n=parseInt(h.slice(1),16);v=NX3_RGB[h]=(255<<24|(n&255)<<16|(n>>8&255)<<8|n>>16)>>>0;}return v;} // ABGR (petit-boutiste)
function nx3Monte(){
  const el=document.getElementById('tNitro'),bar=document.getElementById('nitroBar');if(!el||!bar||NX3.el)return!!NX3.el;NX3.el=el;
  const gw=NX3_G[0].length,gh=NX3_G.length;NX3.W=gw+2*NX3_M;NX3.H=gh+2*NX3_M+NX3_T;
  NX3.m=new Uint8Array(gw*gh);for(let y=0;y<gh;y++)for(let x=0;x<gw;x++)NX3.m[y*gw+x]=NX3_G[y][x]==='#'?1:0;
  const w=document.createElement('div');w.className='nx3';w.setAttribute('aria-hidden','true');
  const cv=document.createElement('canvas');cv.className='nx3Ecl';cv.width=NX3.W;cv.height=NX3.H;w.appendChild(cv);el.appendChild(w);
  el.style.setProperty('--nxW',NX3.W);el.style.setProperty('--nxH',NX3.H);
  NX3.cv=cv;NX3.cx=cv.getContext('2d');NX3.img=NX3.cx.createImageData(NX3.W,NX3.H);NX3.u32=new Uint32Array(NX3.img.data.buffer);
  const v=document.createElement('div');v.id='nxVit';v.setAttribute('aria-hidden','true');v.innerHTML='<b>0</b><i>KM/H</i>';bar.appendChild(v);
  NX3.vit=v;NX3.vN=v.firstChild;
  return true;
}
/* LE DESSIN, case par case : d = enfoncement en cases (−1 = le saut du lâcher … NX3_T = au fond), pal = palette, a = force de la lueur,
   g = position du reflet qui balaie (somme x+y, −1 = aucun), clig = contour rouge (à sec). Couches : l'éclair (1), son épaisseur (2), puis
   autour, à 1 case le contour d'encre, à 2 et 3 cases les deux anneaux de lueur. */
function nx3Dessine(d,pal,a,g,clig){
  const W=NX3.W,H=NX3.H,u=NX3.u32,m=NX3.m,gw=NX3_G[0].length,gh=NX3_G.length,M=NX3_M,T=NX3_T,P=NX3_PAL[pal];u.fill(0);
  const y0=M+d,ep=T-d,B=NX3.B||(NX3.B=new Uint8Array(W*H));
  const forme=function(x,y){x-=M;y-=y0;return x>=0&&y>=0&&x<gw&&y<gh&&m[y*gw+x]===1;};
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){let b=forme(x,y)?1:0;if(!b)for(let k=1;k<=ep;k++)if(forme(x,y-k)){b=2;break;}B[y*W+x]=b;}
  const pres=function(x,y,r){for(let j=-r;j<=r;j++)for(let i=-r;i<=r;i++){const X=x+i,Y=y+j;if(X>=0&&Y>=0&&X<W&&Y<H&&B[Y*W+X])return true;}return false;};
  const cE=nx3Rgb(clig?'#ff5a6e':P[7]),g0=nx3Rgb(P[6])&0x00ffffff,cG1=(g0|Math.round(a*.78*255)<<24)>>>0,cG2=(g0|Math.round(a*.36*255)<<24)>>>0;
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const b=B[y*W+x],i=y*W+x;
    if(b===1){ // l'éclair : biseau en haut à gauche, ombre en bas à droite, deux reflets en long, et le balayage blanc
      const hg=!forme(x,y-1)||!forme(x-1,y),bd=!forme(x,y+1)||!forme(x+1,y),s=(x-M)+(y-y0);
      let c=hg?P[0]:bd?P[3]:(s===9||s===10||s===16)?P[2]:P[1];
      if(g>=0&&(s===g||s===g+1)&&!bd)c='#ffffff';
      u[i]=nx3Rgb(c);}
    else if(b===2)u[i]=nx3Rgb(forme(x,y-1)?P[4]:P[5]); // l'épaisseur : claire juste sous la face, sombre au fond
    else if(pres(x,y,1))u[i]=cE;                       // le contour d'encre
    else if(a>.02){if(pres(x,y,2))u[i]=cG1;else if(pres(x,y,3))u[i]=cG2;} // la lueur, en cases
  }
  NX3.cx.putImageData(NX3.img,0,0);
}
function nx3Tick(dt,kmh){
  if(!NX3.el&&!nx3Monte())return;
  if(!document.body.classList.contains('play'))return;
  const inf=pwrNitroT>0,res=(ENGINE_TIERS[engTier]||ENGINE_TIERS[0]).res||2,plein=inf||(nitroR+nitroX)>=res-.01,sec=!inf&&(nitroR+nitroX)<.35;NX3.t+=dt;
  // LA VITESSE : 12 fois par seconde au plus, et seulement si le chiffre change (un texte réécrit = un recalcul de style) ; sa couleur suit la poussée
  NX3.kmh=kmh;NX3.vT-=dt;
  if(NX3.vT<=0){NX3.vT=.08;const v=Math.round(Math.max(0,kmh||0));if(v!==NX3.v){NX3.v=v;NX3.vN.textContent=v;}}
  const vc=inf?'inf':(nitroOn?(nitroBlue?'bleu':'on'):'');if(vc!==NX3.vc){NX3.vc=vc;NX3.vit.className=vc;}
  // L'APPUI : un ressort raide, rendu en CASES (l'éclair descend d'une case à la fois ; au lâcher il saute une case trop haut et retombe)
  const appui=NX3.pF!=null?NX3.pF:((keys.Space||keys.ShiftLeft||keys.ShiftRight||NX3.el.classList.contains('on'))?1:0);
  const rm=REDUCED_MOTION||document.documentElement.hasAttribute('data-reduced-motion');
  if(rm){NX3.p=appui;NX3.pv=0;}else{const h=Math.min(dt,.05)/2,w0=30,z=.4;for(let i=0;i<2;i++){NX3.pv+=(w0*w0*(appui-NX3.p)-2*z*w0*NX3.pv)*h;NX3.p+=NX3.pv*h;}
    if(NX3.p<-.34){NX3.p=-.34;NX3.pv=0;}else if(NX3.p>1.05){NX3.p=1.05;NX3.pv=0;}}
  const d=Math.max(-1,Math.min(NX3_T,Math.round(NX3.p*NX3_T)));
  // LA LUEUR : la nitro qui brûle (à sec, l'appui ne fait rien briller) ; pleine et au repos, elle respire
  const veut=NX3.kF!=null?NX3.kF:(nitroOn?1:0);NX3.k+=(veut-NX3.k)*Math.min(1,dt*(veut>NX3.k?16:6));
  const souffle=(plein&&!appui&&!rm)?.18+.16*Math.sin(NX3.t*5.2):0,a=Math.max(NX3.k,souffle);
  const aQ=Math.round(a*(rm?1:(.85+.15*Math.sin(NX3.t*31)))*6)/6; // la lueur par crans (des cases qui battent, pas un dégradé)
  const chaud=NX3.k>.5,pal=inf?(chaud?'vioF':'vio'):(chaud?(nitroBlue?'bleu':'feu'):(sec?'sec':'or'));
  const clig=sec&&!appui&&(Math.floor(NX3.t/.3)&1)===1;
  // le REFLET blanc qui balaie les cases : toutes les ~3,5 s (1,6 s quand la nitro est pleine)
  NX3.glT-=dt;if(NX3.gl<0&&NX3.glT<=0&&!rm&&!appui&&!sec){NX3.gl=0;}
  let g=-1;if(NX3.gl>=0){NX3.gl+=dt/.5;if(NX3.gl>1){NX3.gl=-1;NX3.glT=plein?1.6:3.5;}else g=Math.floor(-2+NX3.gl*36);}
  const cle=d+'|'+pal+'|'+aQ+'|'+g+'|'+clig;
  if(cle!==NX3.cle){
    if(mobhChaud()){const t9=performance.now();if(d===MOBH_nx3D&&t9-MOBH_nx3T<MOBH_R.nx3Ms)return; /* (2026-10-25, A6) régime chaud : l'appui (d) se redessine à l'instant, la lueur et le reflet au plus tous les 66 ms */
      MOBH_nx3T=t9;}
    MOBH_nx3D=d;NX3.cle=cle;nx3Dessine(d,pal,aQ,g,clig);}
}
window.dbgNitro3=function(a,b){
  if(a==='k'){NX3.kF=b==null?null:+b;return NX3.kF;}
  if(a==='p'){NX3.pF=b==null?null:+b;return NX3.pF;}
  return {monte:!!NX3.el,grille:NX3.W+'×'+NX3.H,k:+NX3.k.toFixed(2),enfonce:+NX3.p.toFixed(2),dessin:NX3.cle,kmh:Math.round(NX3.kmh||0),affiche:NX3.v,couleur:NX3.vc,nitro:nitroOn};
};
/* LA COUCHE DES GAINS QUI VOLENT (#ajVols) — (2026-10-12, Léo) elle portait aussi la JAUGE D'AURA (#ajCourse, masquée depuis le 15/10,
   retirée le 18/10 avec `?jauge=1`) ; elle porte les éclairs de NITRO qui tombent dans la barre de boost (voir LES GAINS QUI FLOTTENT). */
const AJ={vols:null,run0:-1,v3:null};
function ajMonte(){
  if(AJ.vols)return true;if(!document.getElementById('nitroBar'))return false;
  const v=document.createElement('div');v.id='ajVols';v.setAttribute('aria-hidden','true');document.body.appendChild(v);AJ.vols=v;
  AJ.v3=new THREE.Vector3();
  return true;
}
function ajSource(ch){
  if(ch){const c=document.getElementById('avCh');if(c&&c.classList.contains('on')){const r=zRect(c);if(r.width>0)return [r.left+r.width*.3,r.top+r.height*.4];}}
  const p=AJ.v3.copy(carGroup.position);p.project(camera);
  if(p.z<1&&p.x>-1.2&&p.x<1.2&&p.y>-1.2&&p.y<1.2)return [(p.x+1)/2*VP.w,(1-p.y)/2*VP.h-28];
  return [VP.w*.5,VP.h*.55];
}
/* =====================================================================================================================================
   LES GAINS QUI FLOTTENT, PUIS TOMBENT DANS LEUR JAUGE (2026-10-12, Léo : « quand on gagne de l'aura, n'importe quoi, ça arrive dans l'écran
   en mode flottement, et après ça tire, la gravité, vers la jauge — quand on fait des figures, quand on tombe sur un truc de nitro »).
   UN moteur pour l'AURA (→ le bout du plein de la jauge d'aura) et la NITRO (→ le bout orange de la barre de boost ; la réserve BLEUE des
   fruits → son bout bleu). Avant : l'aura filait en ligne presque droite en 0,7 s, et la nitro SAUTAIT dans la barre (avec un flash blanc
   sur toute la barre, km/h compris).
   · Le gain JAILLIT de là où il naît (la caisse à l'écran, la boîte de la chaîne qu'on encaisse) : un coup vers le haut, un peu de côté ;
   · il FLOTTE : l'air le freine, il plane en ondulant (~0,4 s) ;
   · puis la jauge l'ATTIRE : une gravité qui grandit avec le temps (un puits), la vitesse de travers freinée pour qu'il y plonge sans tourner
     autour ; il rapetisse en tombant. Il touche le bout du plein (suivi EN DIRECT : la jauge bouge pendant qu'il vole), la jauge le prend
     (elle bat, un anneau de pixels) — et c'est seulement LÀ qu'elle monte. La ressource est à toi dès la prise (la nitro se brûle tout de
     suite) : seul l'AFFICHAGE attend (`VOLG.n.r/x`, ôtés de la barre par la boucle).
   · Simulé à l'image (pas de keyframes) ; 12 en vol au plus — au-delà, ou en « Réduire les animations », le gain passe direct.
   · Les nitros nées ensemble (pose + figure + bump au même atterrissage) partent en UNE (elle grossit).
   Console : `dbgVols()` (en vol, nitro en attente) · `dbgVols('n',.5)` / `('x',.4)` / `('a',200)` lance un gain depuis la caisse.
   ===================================================================================================================================== */
var VOLG={L:[],pool:[],imp:[],rS:null,rN:null,rT:0,n:{r:0,x:0},fR:0,fX:0,nb:null,nbP:null,k:1,dR:0,vR:0,tR:0,dX:0,vX:0,tX:0,ch:0,chT:-1e9};
/* LE REMPLISSAGE QUI SATISFAIT (2026-10-12, Léo : « travaille juste le fait que ce soit satisfaisant quand ça se remplit — la dynamique ») :
   · les deux jauges se REMPLISSENT en ressort (ω 17, ζ ,5 : elles dépassent d'~16 % de ce qui arrive, reviennent, se posent en ~0,45 s) ;
     la barre de boost se VIDE, elle, sans traîner (la nitro qui brûle se suit à l'image) ;
   · à chaque arrivée le plein BAT (il gonfle, s'écrase, se pose) et un « plop » (ui.pop) sonne ; les arrivées ENCHAÎNÉES (< 0,65 s) montent
     la gamme (pentatonique) et tapent un peu plus fort — une série de gains se sent comme une série de pièces. */
var VOLG_W=17,VOLG_Z=.5,VOLG_GAMME=[0,2,4,7,9,12,14];
function volgRessort(dt,fR,fX){
  const k=Math.min(dt,.05)*VOLG.k,W2=VOLG_W*VOLG_W,D=2*VOLG_Z*VOLG_W; // (k : le ralenti du banc)
  if(fR<VOLG.tR-1e-4){VOLG.dR=Math.min(VOLG.dR,fR);VOLG.vR=Math.min(0,VOLG.vR);} // elle se vide : elle suit
  else{VOLG.vR+=((fR-VOLG.dR)*W2-D*VOLG.vR)*k;VOLG.dR+=VOLG.vR*k;}
  if(fX<VOLG.tX-1e-4){VOLG.dX=Math.min(VOLG.dX,fX);VOLG.vX=Math.min(0,VOLG.vX);}
  else{VOLG.vX+=((fX-VOLG.dX)*W2-D*VOLG.vX)*k;VOLG.dX+=VOLG.vX*k;}
  VOLG.tR=fR;VOLG.tX=fX;
  VOLG.fR=Math.max(0,Math.min(1,VOLG.dR));VOLG.fX=Math.max(0,Math.min(1-VOLG.fR,VOLG.dX));
}
function volgBat(el,a){ // le plein BAT : il gonfle, s'écrase, se pose (propriété `scale` seule : rien d'autre ne l'anime)
  if(!el||!el.animate)return;
  try{const an=el.animate([{scale:'1 '+(1+.3*a).toFixed(2)},{scale:'1 '+(1-.1*a).toFixed(2),offset:.38},{scale:'1 '+(1+.04*a).toFixed(2),offset:.7},{scale:'1 1'}],{duration:380,easing:'ease-out'});if(VOLG.k!==1)an.playbackRate=VOLG.k;}catch(e){} // (le ralenti du banc le ralentit aussi)
}
function volgMonte(){
  if(VOLG.pool.length||VOLG.L.length||!AJ.vols)return;
  for(let i=0;i<12;i++){const b=document.createElement('b');AJ.vols.appendChild(b);VOLG.pool.push(b);}
  for(let i=0;i<4;i++){const u=document.createElement('u');AJ.vols.appendChild(u);VOLG.imp.push(u);}
}
// la cible : le bout du plein de SA jauge (rectangles relus deux fois par seconde, la fraction suit chaque image)
function volgCible(k,o){
  if(k==='a'){const r=VOLG.rS;if(!r)return null;o[0]=r.left+3+AJ.fx*(r.width-6);o[1]=r.top+r.height/2;return o;}
  const r=VOLG.rN;if(!r)return null;o[0]=r.left+3+(k==='x'?VOLG.fR+VOLG.fX:VOLG.fR)*(r.width-6);o[1]=r.top+r.height/2;return o;
}
function volgLance(k,q,src,big){
  if(REDUCED_MOTION||document.hidden||!document.body.classList.contains('play')||!src)return false;
  volgMonte();
  if(k!=='a')for(const f of VOLG.L)if(f.k===k&&f.t<.12){f.q+=q;f.big=Math.min(1.6,f.big+.25);return true;} // née au même instant : elle grossit
  const el=VOLG.pool.pop();if(!el)return false;
  if(k==='a'){el.className='a';el.textContent='+'+fmtAura(q);}else{el.className='n '+k;if(!el.firstChild||el.firstChild.nodeType!==1)el.innerHTML='<i></i>';}
  const sg=Math.random()<.5?-1:1;
  VOLG.L.push({el,k,q,big,x:src[0],y:src[1],vx:sg*(40+Math.random()*110),vy:-(220+Math.random()*90),t:0,tF:.34+Math.random()*.12,d0:0,ph:Math.random()*6.3,c:[0,0]});
  return true;
}
// une nitro gagnée : elle vole si elle peut (`r` réservoir orange, `x` réserve bleue) ; sinon la barre bat tout de suite
function volgNitro(k,q){
  if(!(q>.03)||!VOLG)return false;
  if(volgLance(k,q,ajSource(false),Math.min(1.5,.9+q*.6))){VOLG.n[k]+=q;return true;}
  return false;
}
/* (2026-10-15, perf-devtools — trace Chrome DevTools d'une course à pleine vitesse) RELANCER UNE ANIMATION SANS FORCER LA MISE EN PAGE.
   À chaque gain qui touche sa jauge, l'anneau (volgImpact), l'éclat de la barre (nbPrend) et la cellule d'aura (volgArrive) se relançaient
   par `void el.offsetWidth` : un recalcul synchrone des styles ET de la mise en page de tout le HUD, plusieurs fois par seconde à grande
   vitesse (~0,35 ms par image sur le Mac, offsetWidth + recalculs forcés). On ALTERNE deux animations jumelles (même dessin, autre nom),
   comme flashEcran : le nom change, le navigateur la relance à la même image, sans lecture forcée. Deux relances du même élément dans la
   même tâche = UNE (elles partaient déjà à la même image). */
function jumelle(el,a,b){if(el._jm)return;el._jm=1;Promise.resolve().then(function(){el._jm=0;});
  const x=el.classList.contains(a);el.classList.remove(x?a:b);el.classList.add(x?b:a);}
function volgImpact(x,y,c){const u=VOLG.imp.shift();if(!u)return;VOLG.imp.push(u);
  u.style.translate=Math.round(x)+'px '+Math.round(y)+'px';u.style.setProperty('--c',c);jumelle(u,'on','on2');}
function nbPrend(k){ // la barre de boost PREND : un éclat au bout du plein
  if(!VOLG)return;
  if(!VOLG.nbP){const nb=document.getElementById('nitroBar');if(!nb)return;const p=document.createElement('i');p.className='nbPrend';p.setAttribute('aria-hidden','true');nb.appendChild(p);VOLG.nbP=p;}
  const p=VOLG.nbP;p.style.setProperty('--px',(k==='x'?VOLG.fR+VOLG.fX:VOLG.fR).toFixed(3));p.classList.remove(k==='x'?'r':'x');p.classList.add(k);jumelle(p,'on','on2'); // (2026-10-15, perf-devtools) relancé sans offsetWidth : voir jumelle
}
function volgArrive(f,i,muet){
  VOLG.L.splice(i,1);f.el.style.opacity='0';VOLG.pool.push(f.el);
  let a=1;
  if(!muet){const now=performance.now();VOLG.ch=now-VOLG.chT<650?Math.min(VOLG_GAMME.length-1,VOLG.ch+1):0;VOLG.chT=now;a=1+.16*Math.min(VOLG.ch,4);
    } // (2026-10-12, Léo : « je ne l'entends plus accordé ; une pièce, je l'entends pas forcément ») le « plop » d'arrivée (ui.pop, sa gamme à lui) est RETIRÉ : il brouillait la mélodie des pièces — l'arrivée se VOIT (rebond, anneau)
  if(f.k==='a'){AJ.envol=Math.max(0,AJ.envol-f.q);AJ.enVol=Math.max(0,AJ.enVol-1);
    if(!muet&&AJ.el){jumelle(AJ.el,'prend','prend2');volgBat(AJ.seg,a);volgImpact(f.c[0],f.c[1],FLOW_CEL[Math.max(0,AJ.cur)]||'#5ee6ff');}}
  else{VOLG.n[f.k]=Math.max(0,VOLG.n[f.k]-f.q);if(!muet){nbPrend(f.k);volgBat(document.getElementById(f.k==='x'?'nitroX':'nitroR'),a);volgImpact(f.c[0],f.c[1],f.k==='x'?'#8fa4ff':'#ffb81f');}}
}
function volgVide(){for(let i=VOLG.L.length-1;i>=0;i--)volgArrive(VOLG.L[i],i,true);VOLG.n.r=VOLG.n.x=0;}
function volgMesure(){if(AJ.seg)VOLG.rS=zRect(AJ.seg);const nb=document.getElementById('nitroBar');if(nb)VOLG.rN=zRect(nb);}
function volgTick(dt){
  if((VOLG.rT-=dt)<=0){VOLG.rT=.5;apresMiseEnPage(volgMesure);} // (2026-10-17, HUD-MESURE) relus en fin d'image, quand ça ne force plus rien (voir apresMiseEnPage)
  if(!VOLG.L.length)return;
  dt=Math.min(dt,.05)*VOLG.k; // (k : le ralenti du banc, `dbgVols('ralenti',.1)`)
  for(let i=VOLG.L.length-1;i>=0;i--){const f=VOLG.L[i];f.t+=dt;
    if(!volgCible(f.k,f.c)||f.t>2.6){volgArrive(f,i,true);continue;}
    if(f.t<f.tF){ // IL FLOTTE : l'air le freine, il plane
      const dr=Math.exp(-dt*5.5);f.vx*=dr;f.vy*=dr;f.x+=f.vx*dt;f.y+=f.vy*dt;
    }else{ // LA JAUGE L'ATTIRE : une gravité qui grandit (un puits), le travers freiné
      const dx=f.c[0]-f.x,dy=f.c[1]-f.y,d=Math.hypot(dx,dy)||1;if(!f.d0)f.d0=Math.max(40,d);
      const ux=dx/d,uy=dy/d,vl=f.vx*ux+f.vy*uy,kt=Math.exp(-dt*7),a=2400+24000*(f.t-f.tF);
      const px=(f.vx-vl*ux)*kt,py=(f.vy-vl*uy)*kt,v2=Math.min(3200,Math.max(vl,0)+a*dt);
      f.vx=px+v2*ux;f.vy=py+v2*uy;
      if(d<=Math.max(7,Math.hypot(f.vx,f.vy)*dt)){volgArrive(f,i,false);continue;}
      f.x+=f.vx*dt;f.y+=f.vy*dt;
    }
    // le rendu : il éclôt (rebond), ondule tant qu'il flotte, rapetisse en tombant
    const t=f.t,pop=t<.1?.55+.6*t/.1:t<.2?1.15-.15*(t-.1)/.1:1,shr=f.d0?.45+.55*Math.min(1,Math.hypot(f.c[0]-f.x,f.c[1]-f.y)/f.d0):1,
      fl=Math.max(0,1-Math.max(0,t-f.tF)/.12),oy=Math.sin(t*10+f.ph)*3*fl;
    f.el.style.opacity=t<.06?(t/.06).toFixed(2):'1';
    f.el.style.transform='translate('+Math.round(f.x)+'px,'+Math.round(f.y+oy)+'px) translate(-50%,-50%) scale('+(f.big*pop*shr).toFixed(3)+')';
  }
}
function ajTick(dt){
  if(!AJ.vols&&!ajMonte())return;
  if(!document.body.classList.contains('play')){if(VOLG.L.length||VOLG.n.r||VOLG.n.x)volgVide();return;}
  if(auraRun<AJ.run0)volgVide(); // une NOUVELLE partie : rien en vol
  AJ.run0=auraRun;
  volgTick(dt); // les gains qui flottent puis tombent dans leur jauge (la nitro)
}
function loopWarn(b,nom,e){if(!((loop._crWarn|0)&b)){console.warn('créatures/musique · '+nom,e);loop._crWarn=(loop._crWarn|0)|b;}} // (2026-09-30) un bit par appel gardé : chaque panne se dit UNE fois, sans masquer celle du voisin
/* (2026-10-13, passe de sortie — perf-iphone7) BANC : LE COÛT D'UNE IMAGE ENTIÈRE. `renderer.info` se remet à zéro à CHAQUE render() du
   compositeur : seul, il ne montre que la dernière passe (l'ACES : 1 appel, 2 triangles). Armé, il additionne TOUTES les passes de l'image
   (ombre, scène, bloom, ACES, vignette moteur) et la puce se chronomètre là où le navigateur le permet (EXT_disjoint_timer_query_webgl2 —
   Chrome/Mac ; jamais en même temps que la sonde de la qualité). dbgCout(1) arme · dbgCout() lit · dbgCout(0) désarme. Éteint : zéro coût. */
const COUT={on:false,der:null,q:null,ext:null,att:[],gpu:[],cpu:[]};
function coutDebut(){const r=renderer.info;r.autoReset=false;r.reset();
  if(COUT.ext&&!QLT.q&&!COUT.q){try{const g9=renderer.getContext(),q=g9.createQuery();if(q){g9.beginQuery(COUT.ext.TIME_ELAPSED_EXT,q);COUT.q=q;}}catch(e){COUT.ext=null;}}}
function coutFin(){const r=renderer.info,g9=renderer.getContext();
  COUT.der={calls:r.render.calls,tris:r.render.triangles,pts:r.render.points,lignes:r.render.lines};
  COUT.cpu.push(performance.now()-QLR.t0);if(COUT.cpu.length>120)COUT.cpu.shift();
  try{if(COUT.q){const q=COUT.q;COUT.q=null;g9.endQuery(COUT.ext.TIME_ELAPSED_EXT);COUT.att.push(q);}
    for(let i=COUT.att.length-1;i>=0;i--){const q=COUT.att[i];if(g9.getQueryParameter(q,g9.QUERY_RESULT_AVAILABLE)){
      if(!g9.getParameter(COUT.ext.GPU_DISJOINT_EXT))COUT.gpu.push(g9.getQueryParameter(q,g9.QUERY_RESULT)/1e6);g9.deleteQuery(q);COUT.att.splice(i,1);}}
    if(COUT.gpu.length>120)COUT.gpu.splice(0,COUT.gpu.length-120);}catch(e){COUT.ext=null;COUT.q=null;}}
window.dbgSable=function(on){SANDBOX=!!on;return SANDBOX;}; // (2026-10-13, banc perf-iphone7) le bac à sable : la caisse se replace au lieu de mourir (mesures longues sans fin de partie)
window.dbgCout=function(on){ // (banc) — voir COUT
  if(on!=null){COUT.on=!!on;COUT.gpu.length=0;COUT.cpu.length=0;COUT.att.length=0;
    if(COUT.on&&COUT.ext===null){try{COUT.ext=renderer.capabilities.isWebGL2?renderer.getContext().getExtension('EXT_disjoint_timer_query_webgl2'):null;}catch(e){COUT.ext=null;}}
    if(!COUT.on)renderer.info.autoReset=true;}
  const st=a=>{if(!a.length)return null;const s=a.slice().sort((x,y)=>x-y);return {n:s.length,p50:+s[s.length>>1].toFixed(2),p90:+s[Math.min(s.length-1,(s.length*.9)|0)].toFixed(2),max:+s[s.length-1].toFixed(2)};};
  const cv=renderer.domElement,m=renderer.info.memory,pa=composer?composer.passes.filter(p=>p.enabled).length:0;
  return {on:COUT.on,image:COUT.der,gpu:st(COUT.gpu),cpu:st(COUT.cpu),chrono:!!COUT.ext,geo:m.geometries,tex:m.textures,progs:(renderer.info.programs||[]).length,
    toile:[cv.width,cv.height],px:cv.width*cv.height,dpr:+curDPR.toFixed(2),post:POST_ON,passes:pa,bloom:bloomPass?(bloomPass.enabled?[bloomPass.renderTargetsHorizontal[0].width,bloomPass.renderTargetsHorizontal[0].height]:0):null,
    ombre:renderer.shadowMap.enabled?sun.shadow.mapSize.x:0,ql:QL.k,vhd:VHD.on,qualite:typeof SAVE!=='undefined'&&SAVE.d?SAVE.d.q:null};};
/* (2026-10-14, passe perf mobile) LE NIVEAU DERRIÈRE L'ÉCRAN DE MORT, UNE IMAGE SUR N. Mesuré sur iPhone 7 émulé : pendant l'écran de fin le jeu
   dessinait encore ~286 appels et ~1 000 000 de triangles par image — le niveau entier, ombres et passes plein écran comprises — sous les cartes
   ET sous le voile du téléphone (`body.touch #overlay[data-ecran="dead"]::before`, opacité .9) : il ne reste que 10 % d'une image où plus rien
   ne se joue (endGame arrive APRÈS l'explosion, la simulation et la caméra sont arrêtées ; seuls le ciel, les nuages, l'eau dérivent). Un
   téléphone qui chauffe là rame à la partie suivante. `mortImg` = on ne redessine la scène 3D qu'une image sur N : ANCIEN 4, MOYEN 2, RÉCENT 1
   (chaque image, comme avant). Les autres images, RIEN n'est dessiné dans la toile : le navigateur garde l'image affichée (pas de dessin, pas
   de nouvelle présentation). On espace le DESSIN seulement : simulation d'ambiance, sons, cartes et carte MOTEUR (son tampon à elle) continuent.
   ⚠ les gardes : (1) seulement l'écran « dead » du téléphone, 1,5 s après son arrivée (le voile et les cartes sont posés) — accueil, atelier,
   étal, REJOUER remettent le compteur à zéro : leur 1re image est dessinée tout de suite ; (2) une toile redimensionnée (rotation) est VIDÉE
   par le navigateur : on redessine aussitôt ; (3) la sonde de qualité veut une vraie image ; (4) l'échelle de qualité (QL) ne conclut rien d'un
   écran où trois images sur quatre ne coûtent rien : son horloge `dprT` est tenue (elle repartait sinon en netteté, à payer au départ suivant).
   `dbgMortImg()` lit l'état ; `dbgMortImg(n)` force N sur le palier courant (banc). */
PAL.B.mortImg=[4,2,1];
const MORT_IMG={t:0,i:0,w:0,h:0,n:0,on:false,dt:0}; // dt : le temps des images sautées, rendu aux ticks d'ambiance à l'image dessinée suivante (voir loop)
function mortSaute(dt){
  const N=Math.max(PAL.b('mortImg',1)|0,PFR_ON?2:1); /* (2026-10-24) le téléphone au frais : une image sur deux au moins (voir PFR_ON) */
  if(N<=1)return false;
  if(!(gameOver&&TCTL.on&&!garageOn&&!stallOn&&!MENUV.retour&&overlay.style.display!=='none'&&overlay.getAttribute('data-ecran')==='dead')){MORT_IMG.t=0;MORT_IMG.i=0;MORT_IMG.on=false;return false;}
  MORT_IMG.t+=dt;
  if(MORT_IMG.t<1.5)return false;
  MORT_IMG.on=true;if(dprT<2.2)dprT=2.2;
  const c=renderer.domElement;
  if(c.width!==MORT_IMG.w||c.height!==MORT_IMG.h||QLR.sN>0){MORT_IMG.w=c.width;MORT_IMG.h=c.height;MORT_IMG.i=0;return false;}
  MORT_IMG.i=(MORT_IMG.i+1)%N;
  if(MORT_IMG.i===0)return false;
  MORT_IMG.n++;return true;
}
window.dbgMortImg=function(n){if(n!=null){PAL.B.mortImg[PAL.n]=Math.max(1,n|0);MORT_IMG.i=0;}return {N:PAL.b('mortImg',1),actif:MORT_IMG.on,depuis:+MORT_IMG.t.toFixed(2),sautees:MORT_IMG.n,ecran:overlay.getAttribute('data-ecran'),tel:TCTL.on};}; // (banc)
