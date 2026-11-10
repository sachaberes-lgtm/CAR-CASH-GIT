/* ===== LES PAROIS : LE COUP D'ÉPAULE (2026-11-09, Sacha : « supprime complètement le slide » — la figure SLIDE du frottement des roues au bord de la route,
   ses étincelles, son étiquette, son aura et son son sont retirés ; reste le seul choc des parois (façades, couloirs du canyon)) ===== */
const MURC={psiK:0,psiR:0,chocT:0,murT:0,murAnn:0}; /* (2026-10-23, Paris retiré) l'état du coup d'épaule d'une paroi (était dans PARIS) */
function murCote(dt,cause){ // LES FAÇADES SONT DES MURS : un CHOC par contact (vitesse perdue selon l'angle), puis on FROTTE (étincelles) — de face à pleine vitesse, on s'encastre
  const out=Math.sign(lat)||1,lim=ROAD_HALF-1.15;lat=out*lim;
  const into=vL*driveDir*out;if(into<=0)return;
  const va=Math.abs(vA),a=Math.asin(Math.min(1,into/Math.max(1,va))),kmh=va*3.6*SPD,now=performance.now();
  if(a>.52&&kmh>200){impMur(out);explode(cause||'facade');return;} // (2026-10-15) L'IMPACT : la paroi est le bord de la route
  try{impMini(out,a,kmh,into);}catch(e){} // (2026-10-15 soir) L'IMPACT EN MINIATURE : le coup d'épaule, au premier contact (voir IMPM)
  /* (2026-10-17, session « Physique et gameplay fluides ») LE COUP D'ÉPAULE SANS TÉLÉPORTE : la paroi renvoyait le nez (−30 % du cap) et
     prenait jusqu'à 30 % de la vitesse en UNE image — 22° de cap d'un coup sur un choc à 17°, partout où la route a des murs (couloirs du
     canyon, bourrelets du glacier). Même renvoi, même perte : le cap y va en ~50 ms (MURC.psiR/psiK, appliqué par la conduite juste
     après le lacet), la vitesse en ~0,2 s (vFrein). Un renvoi en cours n'est pas recalculé par les images de contact qui suivent. */
  if(!(MURC.psiK>0)){MURC.psiR=-psi*.3;MURC.psiK=1;}yawR=0;slipB=0;slipV=0;vL=0;
  const choc=now-(MURC.chocT||0)>220;if(choc)MURC.chocT=now;       // (mesuré : perdre à CHAQUE image faisait tomber de 151 à 20 km/h en 3 s)
  if(choc)vFrein(1-Math.min(.3,.03+a*.9));else vA*=1-.3*(dt||.016);
  if(now-MURC.murT>90){MURC.murT=now;try{DRIFT_V.set(out*CARS[level].w*.5,.25,.2);carGroup.localToWorld(DRIFT_V);sparkBurst(sparkGold,DRIFT_V,1,6);noiseBurst(.1,.1+a*.3,2600);}catch(e){}
    shake=Math.max(shake,.12+a);hap(8);}
  if(now-MURC.murAnn>2500&&a>.12){MURC.murAnn=now;try{popTexte(TR('FROTTE !'),'#ffb36b',0);}catch(e){}}
}
