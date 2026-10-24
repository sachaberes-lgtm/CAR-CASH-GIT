/* LA FIGURE SLIDE (2026-10-14 soir, Sacha via PILOTAGE : « quand on vient VRAIMENT de frotter contre le bord de la route, ça doit faire
   des ÉTINCELLES et rapporter de l'AURA en fonction de la VITESSE et de la DURÉE »). ⚠ Le jeu n'avait AUCUN contact avec le bord :
   le dépasser fait tomber la caisse. Le frottement, c'est donc le FLANC qui déborde de la route quand les roues tiennent encore
   (|lat| + demi-largeur > ROAD_HALF), plus serré que le RASE-BORD (80 % de la demi-route), plus les parois (murCote : couloirs du canyon…).
   · Tant qu'on frotte : étincelles OR au point de contact, côté bord, plus denses avec la vitesse ; l'aura MONTE (SLD.base + SLD.v × vitesse
     / vmax, par seconde) dans une petite étiquette « SLIDE +X » en haut (jamais au centre) ; la caisse perd un peu de vitesse (SLD.frein,
     la sanction : il n'y en avait pas au bord).
   · À la fin (SLD.lache s sans contact) : payée dans la CHAÎNE d'aura comme un geste (famille 'slide', brut) si on a frotté au moins
     SLD.tMin s. Explosion, replacement ou partie neuve : perdue (slideRaz).
   · Les COMBOS À TROIS sont des trios de figures d'un même VOL : un geste au sol n'y entre pas.
   · Le son : `sonSlide(etat,k)` ('debut' | 'tick' | 'fin', k = vitesse/vmax), livré par la session SON — muet tant qu'il n'existe pas.
   `?slide=0` l'éteint. Banc : dbgSlide() · dbgSlide('force',kmh) colle la caisse au bord à cette vitesse · dbgSlide('stop'). */
const MURC={psiK:0,psiR:0,chocT:0,murT:0,murAnn:0}; /* (2026-10-23, Paris retiré) l'état du coup d'épaule d'une paroi (était dans PARIS) */
const SLD={on:!/[?&]slide=0\b/.test(location.search),base:20,v:120,frein:.12,tMin:.35,lache:.15,kmhMin:40,
  t:0,hors:0,aura:0,cote:1,mur:0,etiq:null,force:0,son:false,k:0};
/* ===== HUD DE COURSE : N'ÉCRIRE QUE CE QUI CHANGE (2026-10-24, passe perf PC : « le navigateur passe ~4,6 ms par image dans le DOM ») =====
   `textContent=` remplace le nœud texte MÊME à valeur égale (mutation du DOM → recalcul de style, mise en page et peinture de
   l'étiquette), là où un style inline réécrit à l'identique ne coûte presque rien à Chrome. L'étiquette « SLIDE +X » se réécrivait à
   chaque image de frottement. `?pchud=0` rend l'ancienne écriture, pour l'A/B. */
const PCH_ON=!/[?&]pchud=0\b/.test(location.search);
function slideRaz(){SLD.t=0;SLD.hors=0;SLD.aura=0;SLD.mur=0;if(SLD.son){SLD.son=false;try{sonSlide('fin',0);}catch(e){}}if(SLD.etiq)SLD.etiq.style.opacity='0';}
function slideEtiq(){let e=SLD.etiq;if(!e){e=SLD.etiq=document.createElement('div');e.id='slideHud';e.setAttribute('aria-hidden','true');document.body.appendChild(e);}return e;}
function slideTick(dt){ // boucle de conduite, chaque image, après le RASE-BORD
  if(!SLD.on)return;
  const w=CARS[level].w*.5,va=Math.abs(vA),kmh=va*3.6*SPD;
  if(SLD.force>0){lat=(Math.sign(lat)||1)*(ROAD_HALF-w+.12);vA=Math.sign(vA||1)*SLD.force/(3.6*SPD);graceT=Math.max(graceT,.2);}
  SLD.mur=Math.max(0,SLD.mur-dt);
  const bord=Math.abs(lat)+w>ROAD_HALF-.02&&Math.abs(lat)<ROAD_HALF,contact=!introD&&!PARK.on&&hopY<=.05&&kmh>SLD.kmhMin&&(bord||SLD.mur>0);
  if(contact){
    SLD.hors=0;SLD.t+=dt;SLD.cote=Math.sign(lat)||1;
    const k=SLD.k=Math.max(0,Math.min(1.3,kmh/Math.max(1,vmaxShow())));
    SLD.aura+=(SLD.base+SLD.v*k)*dt;
    if(!SLD.mur)vA*=1-SLD.frein*dt; // la sanction : le flanc frotte (les façades de Paris ont la leur)
    if(Math.random()<dt*(14+46*k)){DRIFT_V.set(SLD.cote*w,.15,(Math.random()-.5)*CARS[level].l*.6);carGroup.localToWorld(DRIFT_V);sparkBurst(sparkGold,DRIFT_V,1+(k>.6?1:0),5+9*k);}
    try{if(!SLD.son){SLD.son=true;sonSlide('debut',k);}else sonSlide('tick',k);}catch(e){}
    if(SLD.t>=SLD.tMin){const e=slideEtiq();if(!PCH_ON){e.textContent='SLIDE +'+Math.round(SLD.aura);e.style.opacity='1';}else{const t9='SLIDE +'+Math.round(SLD.aura);if(e._t!==t9){e._t=t9;e.textContent=t9;}if(e.style.opacity!=='1')e.style.opacity='1';}} /* (2026-10-24, passe perf PC) le texte n'est remplacé que s'il change (voir PCH_ON) */
    return;}
  if(SLD.t<=0)return;
  SLD.hors+=dt;if(SLD.hors<SLD.lache)return;
  const n=Math.round(SLD.aura),ok=SLD.t>=SLD.tMin&&n>0;slideRaz();
  if(ok){try{chaineAura('SLIDE',n,'slide',true,false);}catch(e){}try{sonSlide('paye',n);}catch(e){}hap([8,20,8]);} // (SON) 'paye' : le tchak du paiement ; 'fin' (slideRaz) : la queue du crissement
}
function slideContact(){SLD.mur=.12;} // le crochet des MURS : une paroi qui touche le flanc ce tour-ci (Paris, les couloirs du CANYON…) — à rappeler à chaque image de contact
window.slideContact=slideContact;
window.dbgSlide=function(k,v){if(k==='force')SLD.force=+v||200;if(k==='stop'){SLD.force=0;lat=0;vL=0;}
  return {on:SLD.on,t:+SLD.t.toFixed(2),aura:Math.round(SLD.aura),k:+SLD.k.toFixed(2),force:SLD.force,lat:+lat.toFixed(2),bord:+ROAD_HALF.toFixed(2),kmh:Math.round(Math.abs(vA)*3.6*SPD),mode:mode,vmax:Math.round(vmaxShow()),chaine:Math.round(CHA.pts||0),auraRun:Math.round(auraRun)};};
function murCote(dt,cause){ // LES FAÇADES SONT DES MURS : un CHOC par contact (vitesse perdue selon l'angle), puis on FROTTE (étincelles) — de face à pleine vitesse, on s'encastre
  const out=Math.sign(lat)||1,lim=ROAD_HALF-1.15;lat=out*lim;
  const into=vL*driveDir*out;if(into<=0)return;
  SLD.mur=.12; // (SLIDE) la façade frotte : la figure le sait
  const va=Math.abs(vA),a=Math.asin(Math.min(1,into/Math.max(1,va))),kmh=va*3.6*SPD,now=performance.now();
  if(a>.52&&kmh>200){impMur(out);explode(cause||'facade');return;} // (2026-10-15) L'IMPACT : la paroi est le bord de la route
  try{impMini(out,a,kmh,into);}catch(e){} // (2026-10-15 soir) L'IMPACT EN MINIATURE : le coup d'épaule, au premier contact (voir IMPM)
  /* (2026-10-17, session « Physique et gameplay fluides ») LE COUP D'ÉPAULE SANS TÉLÉPORTE : la paroi renvoyait le nez (−30 % du cap) et
     prenait jusqu'à 30 % de la vitesse en UNE image — 22° de cap d'un coup sur un choc à 17°, partout où la route a des murs (couloirs du
     canyon, bourrelets du glacier). Même renvoi, même perte : le cap y va en ~50 ms (MURC.psiR/psiK, appliqué par la conduite juste
     après le lacet), la vitesse en ~0,2 s (vFrein). Un renvoi en cours n'est pas recalculé par les images de contact qui suivent. */
  if(!(MURC.psiK>0)){MURC.psiR=-psi*.3;MURC.psiK=1;}yawR=0;slipB=0;vL=0;
  const choc=now-(MURC.chocT||0)>220;if(choc)MURC.chocT=now;       // (mesuré : perdre à CHAQUE image faisait tomber de 151 à 20 km/h en 3 s)
  if(choc)vFrein(1-Math.min(.3,.03+a*.9));else vA*=1-.3*(dt||.016);
  if(now-MURC.murT>90){MURC.murT=now;try{DRIFT_V.set(out*CARS[level].w*.5,.25,.2);carGroup.localToWorld(DRIFT_V);sparkBurst(sparkGold,DRIFT_V,1,6);noiseBurst(.1,.1+a*.3,2600);}catch(e){}
    shake=Math.max(shake,.12+a);hap(8);}
  if(now-MURC.murAnn>2500&&a>.12){MURC.murAnn=now;try{popTexte(TR('FROTTE !'),'#ffb36b',0);}catch(e){}}
}
