/* L'HORIZON DE LA VILLE : le cylindre peint (2026-09-25) est RETIRÉ le 2026-09-26 — net derrière des tours noyées de brume, il se
   lisait comme un décor de théâtre, et en vol libre on en voyait les BORDS. La skyline vit désormais dans le dôme du ciel
   (`villeCiel`), calculée par direction du monde : aucune couture, fondue dans la brume comme le reste du lointain. */
function villeChauffe(){ // une instance de chaque, compilée hors écran puis retirée — les vraies réutilisent le programme
  const g=new THREE.Group(),geo=new THREE.BoxGeometry(1,1,1),c=new THREE.Color(1,1,1);
  /* ⚠ LA CHAUFFE DOIT RESSEMBLER AU VRAI (2026-09-26, bug mesuré) : three r128 garde le PREMIER programme compilé pour un matériau, et
     ne le recompile pas quand un objet a ou n'a pas de couleur par instance. Chauffés AVEC `setColorAt`, les panneaux (qui n'en ont
     pas) héritaient d'un programme qui réclame `instanceColor` → `attributes.get(null)` → le rendu jetait à CHAQUE image dès que la
     ville arrivait après la chauffe (auto-école, puis ville : l'écran gelait). Tours et néons ont une couleur par instance, les pubs non. */
  const vv9=VILLE_VERRE_V?[vitreMatToursNeon(),vitreMatToursNeonLoin()]:[]; // (2026-10-18, NÉON ET VERRE) le verre de la ville et sa géante au loin (couleur par instance toutes les deux) — APRÈS les tours, AVANT les néons
  for(const m of [villeMatTours(),villeMatToursLoin()].concat(vv9,[villeMatNeon(),villeMatNeonLoin(),villeMatPub()])){const im=new THREE.InstancedMesh(m===vv9[0]?vitreGeo():geo,m,1);im.setMatrixAt(0,new THREE.Matrix4());if(m===CITY.matT||m===CITY.matN||vv9.indexOf(m)>=0)im.setColorAt(0,c);g.add(im);}
  // (passe perf) les deux matières NUES n'ont pas de couleur par instance. ⚠ L'ORDRE DE COMPILATION fait l'ordre de dessin (three trie les opaques par
  // numéro de programme) : TOUTES les tours avant TOUS les néons, comme avant — le dessus d'une couronne est au ras du toit, à égalité c'est le néon qui gagne.
  g.add(villeRaisChauffe()); /* (2026-10-20, VILLE EMBELLIE) le programme des rais, compilé au menu avec les autres */
  scene.add(g);try{renderer.compile(scene,camera);}catch(e){}scene.remove(g);geo.dispose();
}
/* (2026-09-28, passe perf iPhone) LE TRI PAR QUARTIERS — chaîné sur scene.onBeforeRender (après pisteLoin : caméra et lumières
   ont leurs matrices de l'image). Chaque quartier (cube de 320 m du monde, sphère englobante de ses boîtes) est jugé à chaque rendu :
   HORS du champ (0), PRÈS (1), ou entièrement AU-DELÀ du brouillard (2 : profondeur de vue − rayon > fogFar, la même profondeur que
   le brouillard de three). Hystérésis, toujours du côté sûr : on ne quitte le champ qu'à `M` m de marge, on ne part au loin qu'à `H` m.
   ⚠ MESURÉ : tout ranger à chaque changement remontait les tampons 40 à 115 fois par seconde (0,1-0,3 ms de copies par image sur PC,
   le double sur iPhone, plus l'envoi à la puce). Donc on ne fait QUE l'OBLIGATOIRE, et petit :
     · un quartier qui doit être dessiné et ne l'est pas → AJOUTÉ au bout de son tampon (on n'envoie que ces quelques instances) ;
     · un quartier AU LOIN qui revient PRÈS → ajouté au tampon complet ET effacé du tampon nu (repliée en un point : sinon les deux
       copies se battraient à profondeur égale) ;
     · tout le reste est PARESSEUX : un quartier sorti du champ ou parti au loin reste où il est — le tampon complet le dessine juste
       (VILLE_TRI le replie ou lui épargne la lumière, au pixel près) ;
     · quand ces restes dépassent la moitié de l'utile (ou qu'un tampon déborde), LE MÉNAGE (`villeRefait`) : tout se range, les
       quartiers PRÈS d'avant en arrière (le test de profondeur précoce écarte le reste — hors puces Apple, qui le font seules). */
function villeTri(cam){
  const Fs=CITY.fam;if(!Fs||CITY.ab||!CITY.root||!CITY.root.visible)return;
  const t00=performance.now();villeLampes();
  VT.fr.setFromProjectionMatrix(VT.pv.multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse));
  const P9=VT.pl,pl=VT.fr.planes;for(let i=0;i<6;i++){const n=pl[i].normal;P9[i*4]=n.x;P9[i*4+1]=n.y;P9[i*4+2]=n.z;P9[i*4+3]=pl[i].constant;} // (mesuré : le test de three appel par appel coûtait le double)
  const f=scene.fog,ff=(f&&f.isFog)?f.far:Infinity,e=cam.matrixWorldInverse.elements;
  for(let q=0;q<Fs.length;q++){const F=Fs[q],Q=F.Q,E=F.e,Z=F.z,pP=F.pP,pL=F.pL;let uP=0,uL=0;
    for(let k=0,j=0;k<E.length;k++,j+=6){const w=E[k],r=Q[j+5],cx=Q[j+2],cy=Q[j+3],cz=Q[j+4],z=-(e[2]*cx+e[6]*cy+e[10]*cz+e[14]),rr=-(r+(w===0?0:VT.M));Z[k]=z;
      let s=1;for(let i=0;i<24;i+=4)if(P9[i]*cx+P9[i+1]*cy+P9[i+2]*cz+P9[i+3]<rr){s=0;break;} // la sphère entièrement hors d'un plan du champ
      if(s===1&&z-r>ff+(w===2?0:VT.H))s=2;
      const sz=Q[j+1]-Q[j];E[k]=s;
      if(F.refait)continue;
      if(s===1){if(pL[k]>=0)villeTue(F,k);if(pP[k]<0){if(F.fP+sz>F.n){F.refait=true;continue;}villeMet(F,k,false);}uP+=sz;}
      else if(s===2){if(pL[k]>=0)uL+=sz;else if(pP[k]<0){if(F.fL+sz>F.n){F.refait=true;continue;}villeMet(F,k,true);uL+=sz;}}}
    if(F.refait||F.fP+F.fL-uP-uL>Math.max(VT.G,(uP+uL)*VT.K))villeRefait(F); // LE MÉNAGE
    villePousse(F);}
  VT.ms+=performance.now()-t00;VT.im++; // (banc) le coût processeur du tri, lu par dbgCity
}
function villeMet(F,k,loin){ // AJOUTE le quartier k au bout d'un tampon (copie du tableau maître)
  const j=k*6,d=F.Q[j],g=F.Q[j+1],sz=g-d;
  if(loin){F.imL.instanceMatrix.array.set(F.M.subarray(d*16,g*16),F.fL*16);if(F.imL.instanceColor)F.imL.instanceColor.array.set(F.C.subarray(d*3,g*3),F.fL*3);F.pL[k]=F.fL;villeSale(F,1,F.fL,F.fL+sz);F.fL+=sz;}
  else{F.im.instanceMatrix.array.set(F.M.subarray(d*16,g*16),F.fP*16);F.im.instanceColor.array.set(F.C.subarray(d*3,g*3),F.fP*3);F.pP[k]=F.fP;villeSale(F,0,F.fP,F.fP+sz);F.fP+=sz;}
}
function villeTue(F,k){ // EFFACE le quartier k du tampon nu : ses instances repliées en un point (matrice nulle → zéro pixel)
  const j=k*6,sz=F.Q[j+1]-F.Q[j],p=F.pL[k];F.imL.instanceMatrix.array.fill(0,p*16,(p+sz)*16);F.pL[k]=-1;villeSale(F,1,p,p+sz);
}
function villeSale(F,w,a,b){const D=F.d;if(a<D[w*2])D[w*2]=a;if(b>D[w*2+1])D[w*2+1]=b;}
function villeRefait(F){ // LE MÉNAGE : les deux tampons refaits d'après le dernier jugement
  const E=F.e,Z=F.z;F.pP.fill(-1);F.pL.fill(-1);F.fP=F.fL=0;F.refait=false;VT.n++;
  if(CITY.ab){const a=F.im.instanceMatrix.array,c=F.im.instanceColor.array; // (banc) l'ANCIEN chemin : tout, dans l'ordre d'origine
    for(let i=0;i<F.n;i++){const p=F.rang[i];a.set(F.M.subarray(p*16,p*16+16),i*16);c.set(F.C.subarray(p*3,p*3+3),i*3);}F.fP=F.n;villeSale(F,0,0,F.n);return;}
  const L=VT.ord;L.length=0;for(let k=0;k<E.length;k++)if(E[k]===1)L.push(k);
  if(VT.avAr)L.sort(function(x,y){return Z[x]-Z[y];}); // d'avant en arrière
  for(let i=0;i<L.length;i++)villeMet(F,L[i],false);
  for(let k=0;k<E.length;k++)if(E[k]===2)villeMet(F,k,true);
}
function villePousse(F){ // n'envoie à la puce QUE la plage touchée (updateRange) — et toujours au moins UNE instance par matière (repliée :
  const D=F.d;              // zéro pixel) pour que chauffeRendu prépare l'état de pipeline de chacune
  for(let w=0;w<2;w++){const im=w?F.imL:F.im,fin=w?F.fL:F.fP,A=im.instanceMatrix,C=im.instanceColor||null; // (NÉON ET VERRE) l'instance au loin peut avoir sa couleur (colL)
    if(!fin){if(!F.vide[w]){A.array.fill(0,0,16);villeSale(F,w,0,1);F.vide[w]=true;}im.count=1;}else{F.vide[w]=false;im.count=fin;}
    let a=D[w*2],b=D[w*2+1];D[w*2]=2e9;D[w*2+1]=-1;if(b<=a)continue;
    if(A.updateRange.count>0){const pa=A.updateRange.offset/16;b=Math.max(b,pa+A.updateRange.count/16);a=Math.min(a,pa);} // une plage pas encore partie : on l'englobe
    A.updateRange.offset=a*16;A.updateRange.count=(b-a)*16;A.needsUpdate=true;
    if(C){C.updateRange.offset=a*3;C.updateRange.count=(b-a)*3;C.needsUpdate=true;}
    VT.nu++;VT.ko+=(b-a)*(C?76:64)/1024;}
}
{const ob9=scene.onBeforeRender;scene.onBeforeRender=function(r9,s9,cam,rt){ob9.call(this,r9,s9,cam,rt);villeTri(cam);};} // CHAÎNÉ (jamais réassigné)
/* (2026-10-18, DEBUGGING : ville) LES GÉANTES DE VERRE SONT DURES SELON LEUR FORME. La grille rangeait leur BOÎTE (w × H × p) : une effilée finit à 45-60 % de sa
   largeur, une ronde à 80 % (et ses pans de coin à 29 %), une lame a le toit en biais (5 à 13 % de H), les coins biseautés (jusqu'à 7 m) — on mourait contre
   l'air à côté du verre (banc, 16 villes : 100 % des effilées, rondes et lames, 5 à 31 m de vide dur) ; la vrillée et le fuseau débordaient de leur boîte
   (leur verre se traversait). Le calcul du sommet de vitreMatFab (vitreSF, la vrille, le biseau, le toit de la lame), à la hauteur de la caisse ; entre deux
   anneaux de la géométrie (vitreGeoFab : 1 bande, 6 pour la vrillée et le fuseau), linéaire comme elle. f = 1 + vitreForme. Rien d'alloué. */
function villeSS(a,b,x){const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t);} // smoothstep
function villeSFj(f,sv,h){ // vitreSF, en JS
  if(f===1)return 1+(-.55+.15*sv)*villeSS(.4,1,h);if(f===2)return 1-.28*villeSS(.3,1,h);if(f===3)return (1+.16*Math.sin(3.1416*Math.min(1,Math.max(0,(h-.4)/.45))))*(1-.5*villeSS(.8,1,h));if(f===4)return 1-.2*villeSS(.4,1,h);return 1;}
function villeForme(p,c,o,f9){
  const cx=c[o],cy=c[o+1],cz=c[o+2],w=c[o+3],H=c[o+4],d=c[o+5],dy=p.y-cy,f=f9-1;if(Math.abs(dy)>H/2+.5)return false;
  const s0=cx*.0131+cz*.0173,sd=s0-Math.floor(s0),s1=sd*41.7,sv=s1-Math.floor(s1),hh=Math.min(1,Math.max(0,dy/H+.5)); // la graine de l'instance (vSeed9, sv9)
  const NR=f===2||f===3?6:1,q=Math.min(NR-1e-6,hh*NR),r=Math.floor(q),t=q-r,h0=r/NR,h1=(r+1)/NR;
  const s=villeSFj(f,sv,h0)*(1-t)+villeSFj(f,sv,h1)*t,aK=f===2?(1.6+1.2*sv)*(sv<.5?-1:1):0;
  const a=aK?aK*(villeSS(.25,1,h0)*(1-t)+villeSS(.25,1,h1)*t):0,ca=Math.cos(a),sa=Math.sin(a),dx=p.x-cx,dz=p.z-cz,ax=Math.abs(ca*dx+sa*dz),az=Math.abs(-sa*dx+ca*dz);
  const hw=s*w/2,hd=s*d/2;if(ax>hw+.9||az>hd+.9)return false;
  const b9=sd*71.3,ch=s*(f===4?.29*Math.min(w,d):(b9-Math.floor(b9))<=.6?Math.min(Math.min(w,d)*(f===2?.08:.16),7):0); // le biseau (vCh9)
  if(ch>0&&ax+az>hw+hd-ch+1.27)return false;
  if(f===5&&dy>H*(.5-(.05+.08*sv)*(.5+Math.min(.5,Math.max(-.5,dx/w))))+.5)return false; // la LAME : au-dessus de son toit en biais
  return true;}
function villeHeurt(p){ // la caisse est-elle DANS une tour de la ville ? (marge : la demi-caisse)
  const C=CITY.col;if(!C||!CITY.root)return false;if(CRYPTO.taureaux.length&&cryptoHeurt(p))return true; // (CRYPTOCITY) les taureaux sont durs
  const a=C.g.get(Math.floor(p.x/C.CG)+','+Math.floor(p.z/C.CG));if(!a)return false;const c=C.c;
  for(let j=0;j<a.length;j++){const o=a[j],f9=C.f?C.f[o/6]:0;if(f9){if(villeForme(p,c,o,f9))return true;continue;}if(Math.abs(p.x-c[o])<c[o+3]/2+.9&&Math.abs(p.z-c[o+2])<c[o+5]/2+.9&&Math.abs(p.y-c[o+1])<c[o+4]/2+.5)return true;}
  return false;
}
function cityTick(dt,camY){
  CITY.uT.value+=dt; // l'horloge des néons et de la circulation
  if(!CITY.chaud&&CITY.uT.value>2.5){CITY.chaud=true;villeChauffe();} // au menu, 2,5 s après le chargement
}
// `dbgVille()` (dev, 2026-09-26) : le coût de l'image qu'on regarde (appels de rendu, triangles, programmes) + le CAP de la caméra (pour
// cadrer `dbgCiel` dans l'axe de la route) — la ville se juge au budget autant qu'à l'œil.
window.dbgVille=function(){const r=renderer.info,d=camera.getWorldDirection(new THREE.Vector3());
  r.autoReset=false;r.reset();renderer.render(scene,camera);r.autoReset=true; // UNE passe de scène mesurée seule (le composer remettrait les compteurs à zéro à chaque passe)
  return {appels:r.render.calls,triangles:r.render.triangles,programmes:r.programs?r.programs.length:null,cap:+Math.atan2(-d.x,-d.z).toFixed(3),site:+Math.asin(d.y).toFixed(3),pluie:+LVL.pluie.toFixed(2),route:+LVL.route.toFixed(2)};};
/* LA LIGNE PARFAITE (2026-09-29, Sacha : « il faut alterner la génération d'items entre fruit et booster pour pouvoir aller à fond tout
   le temps si on a une trajectoire de route parfaite »). Avant : des pads au hasard tous les 280-560 m, des fruits glissés au hasard dans
   les motifs de pièces — même en prenant TOUT, la nitro tenue (−1/s, +0,2/s de recharge) finissait par s'éteindre. Désormais UNE file :
   FRUIT, PAD, FRUIT, PAD… posée EN COURSE (ligneTick), LIGNE.voir secondes devant la caisse, espacée de LIGNE.dt secondes à la vitesse
   RÉELLE du moment — le rythme est le même à 150 et à 600 km/h (MESURÉ : une file précalculée sur la croisière du moteur mettait un objet
   tous les 38 m, soit 4 par seconde à 527 km/h). Posée sur la TRAJECTOIRE : au centre dans les lignes droites, à la corde dans les virages.
   Chaque objet rend LIGNE.don secondes de nitro, un peu PLUS que ce qu'on brûle d'un objet à l'autre : qui les prend tous tient la nitro
   sans la lâcher, qui en rate voit la jauge baisser. Deux faces (miroir), comme tout le reste. ⚠ Aucun rnd() : le flux seedé ne bouge pas.
   Un objet qui tombe sur un trou, un tremplin, une porte de plots ou une chaîne de néon glisse plus loin ; s'il n'a pas de place il saute,
   et le suivant garde SON type (l'alternance tient). */
/* (2026-10-20, Léo : « les boosts de la route disparaissent, on booste non-stop en attrapant des fruits ; des petits fruits qu'on peut mettre partout ») : PLUS DE PLAQUES — la file ne porte que des FRUITS,
   un toutes les 0,45 s (c'était fruit + plaque toutes les 1,2 s) qui rendent chacun 1,05 × ce qu'on brûle entre deux : qui les prend tous tient la nitro, qui en rate un la voit baisser. */
const LIGNE={on:false,cnt:0,npow:20,prem:false,dt:.45,don:.48,voir:3.5,prochS:0,k:0,pts:[],padI:new Set(),padPris:new Set(),n:[0,0],pris:[0,0],vP:0,acc:0}; // n : posés · pris : ramassés (fruits, pads) — pour le banc
const LF0={p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()},
      LF1={p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()},
      LF2={p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()};
function ligneLat(s9,H9){ // la CORDE : le virage tire l'objet vers l'intérieur (R 150 m → ~11 m), la ligne droite le laisse au centre
  frameAt(s9,LF0);frameAt(s9-40,LF1);frameAt(s9+40,LF2);
  const k=(LF2.t.dot(LF0.b)-LF1.t.dot(LF0.b))/80; // courbure latérale (1/m), signe = côté de l'intérieur
  return THREE.MathUtils.clamp(k*1600,-H9,H9);
}
/* (2026-10-20, Léo : « si les fruits sont en ligne, c'est pas bon » puis « pas des groupes de neuf : le jeu doit être PAS RÉPÉTITIF ») LES GROUPES TIRÉS AU HASARD.
   Pas de cycle : chaque GROUPE de fruits tire SA longueur (4 à 15), SA forme (vague de fréquence et de phase libres, marches de 2 à 4, arc, balayage en diagonale, S, ligne de repos),
   SON amplitude, SON espacement (0,8 à 1,35 × la cadence, la nitro rendue suit : qui les prend tous tient toujours), son fruit dominant ; entre deux groupes, 1 fois sur 4, un REPOS
   (un à deux secondes sans rien : on respire). Le décalage latéral d'un fruit à l'autre est borné (~7 m par pas) et le 1er d'un groupe repart de là où l'on en était : toujours jouable.
   Hasard `Math.random` (comme fruitPick) — jamais le `rnd` seedé de la piste. Le motif s'ajoute à la corde : dans un virage la file reste sur la trajectoire. */
function ligneGroupe(){ // un nouveau groupe, tout tiré au hasard
  const R=Math.random,forme=['vague','vague','marches','arc','balayage','S','repos'][(R()*7)|0];
  LIGNE.grp={left:4+((R()*12)|0),len:0,forme:forme,A:.3+R()*.5,f:.5+R()*1.1,ph:R()*6.283,k:2+((R()*3)|0),sd:R()<.5?-1:1,mult:.8+R()*.55,fi:fruitPick()};
  LIGNE.grp.len=LIGNE.grp.left;
}
function ligneMotif(base,H9){ // la position latérale du prochain fruit (+ son espacement et son fruit via LIGNE.grp)
  let g=LIGNE.grp;if(!g||g.left<=0){
    const ancien=g;ligneGroupe();g=LIGNE.grp;
    if(ancien&&Math.random()<.25)LIGNE.repos=true; // un REPOS avant ce groupe : on saute de la piste sans fruit
  }
  const j=g.len-g.left,u=g.len>1?j/(g.len-1):0;g.left--;
  let o=0;const A=g.A*H9;
  if(g.forme==='vague')o=A*Math.sin(6.283*g.f*u*1.4+g.ph);
  else if(g.forme==='marches')o=(Math.floor(j/g.k)%2?1:-1)*g.sd*A*.8;
  else if(g.forme==='arc')o=g.sd*A*Math.sin(Math.PI*u);
  else if(g.forme==='balayage')o=g.sd*A*(2*u-1);
  else if(g.forme==='S')o=A*Math.sin(Math.PI*(2*u-1))*g.sd;
  let lt=THREE.MathUtils.clamp(base+o,-(ROAD_HALF-4),ROAD_HALF-4);
  if(LIGNE.prevLat!=null){const mx=.45*H9;lt=THREE.MathUtils.clamp(lt,LIGNE.prevLat-mx,LIGNE.prevLat+mx);} // jamais plus de ~7 m d'un fruit au suivant
  LIGNE.prevLat=lt;return lt;
}
function ligneBloque(s9,k){
  if(enTrou(s9,8))return true; // (LES TROUS) jamais un fruit ni un pad dans le vide entre deux segments de route
  for(const o of OILS)if(o.face===1&&Math.abs(o.s-s9)<(o.r||4)+7)return true; // jamais dans une flaque
  if(BANQ.obst&&LVL.cur&&LVL.cur.id==='banquise')for(const o of BANQ.obst)if(Math.abs(o.s-s9)<o.r+12)return true; // (2026-10-17) ni dans un pic de la piste du glacier
  return false;
}
function ligneOnPour(){return !PARK.on&&!(LVL.cur&&LVL.cur.piste==='tuto')&&!BALADE;} // (LE PRÉ-BÂTI) la règle de LIGNE.on, lue aussi par pisteRoute (sur la map d'en face)
function ligneRaz(){ // à chaque piste neuve (buildTrack) : la file repart du début
  LIGNE.dt=PADS_OFF?.45:1.2;LIGNE.don=PADS_OFF?.48:1.15; /* (2026-10-21, Sacha) l'ancien système : fruit, plaque, fruit, plaque… toutes les 1,2 s, 1,15 de nitro chacun (?pads=0 : les fruits serrés de Léo) */
  LIGNE.cnt=0;LIGNE.npow=14+((Math.random()*20)|0);LIGNE.prem=false;LIGNE.grp=null;LIGNE.prevLat=null;LIGNE.repos=false; // (fruits-pouvoirs) la file repart : le 1er pouvoir arrive après 16-24 fruits
  LIGNE.pts.length=0;LIGNE.padI.clear();LIGNE.padPris.clear();LIGNE.prochS=240;LIGNE.k=0;LIGNE.n[0]=LIGNE.n[1]=LIGNE.pris[0]=LIGNE.pris[1]=0;LIGNE.vP=0;LIGNE.acc=20;LIGNE.sPk=null;LIGNE.sPd=0; // acc : l'élan d'un départ lancé, supposé d'avance (les premiers objets se posent avant qu'on l'ait mesuré)
  LIGNE.on=ligneOnPour(); // le parc et l'auto-école gardent leur monde — (2026-10-09) la BALADE aussi : rien sur la route
}
function lignePad(sp,pl){ // un pad d'OR, deux faces (même recette que la boucle des pads de buildTrack)
  LIGNE.padI.add(PADS.length);PADS.push(sp);PADL.push(pl);
  for(const fy of [1,-1]){frameAt(sp,F);const m=new THREE.Mesh(padGeo,PAD_MAT);
    m.quaternion.setFromRotationMatrix(LM4.makeBasis(LV1.copy(F.b).multiplyScalar(-fy),F.t,LV2.copy(F.n).multiplyScalar(fy)));
    m.position.copy(F.p).addScaledVector(F.b,pl).addScaledVector(F.n,fy>0?.1:-THICK-.1);scene.add(m);trackMeshes.push(m);}
}
function ligneFruit(sp,lt){ // un fruit, deux faces (même recette que `place` dans spawnPickups) — il rend LIGNE.don de nitro (× l'espacement du groupe : plus espacé, plus généreux)
  const g9=LIGNE.grp,fi=(g9&&Math.random()<.7)?g9.fi:fruitPick(),lv=fruitLeve(fi),don9=LIGNE.don*((g9&&g9.mult)||1);frameAt(sp,F);
  for(const face of [1,-1]){
    const m=mkFruit(fi);m.position.copy(F.p).addScaledVector(F.b,lt).addScaledVector(F.n,face>0?lv:-(THICK+lv)); // petits (FRUIT_K) : on les sème partout sans gêner la vue
    if(face<0)LM4.makeBasis(LV1.copy(F.b).negate(),LV2.copy(F.n).negate(),F.t);else LM4.makeBasis(F.b,F.n,F.t);
    m.quaternion.setFromRotationMatrix(LM4);m.updateMatrix();m.matrixAutoUpdate=false;scene.add(m);
    pickups.push({s:sp,lat:lt,face:face,nitro:true,fruit:fi,mesh:m,taken:false,ax:F.n.clone().multiplyScalar(face),ligne:true,don:don9});
  }
}
const LM4=new THREE.Matrix4(),LV1=new THREE.Vector3(),LV2=new THREE.Vector3();
/* un FRUIT-POUVOIR au bout de la file (2026-10-20) : même recette que ligneFruit, mais c'est un pouvoir (`pwrPrend` le prend), les deux faces */
function lignePower(sp,lt,kind){
  frameAt(sp,F);
  for(const face of [1,-1]){
    const m=mkPower(kind,face),lev9=m.userData.lev||2.1;
    m.position.copy(F.p).addScaledVector(F.b,lt).addScaledVector(F.n,face>0?lev9:-(THICK+lev9));
    if(face<0)LM4.makeBasis(LV1.copy(F.b).negate(),LV2.copy(F.n).negate(),F.t);else LM4.makeBasis(F.b,F.n,F.t);
    m.quaternion.setFromRotationMatrix(LM4);m.updateMatrix();m.matrixAutoUpdate=false;scene.add(m);
    pickups.push({s:sp,lat:lt,face:face,nitro:false,pow:kind,mesh:m,taken:false,ax:F.n.clone().multiplyScalar(face)});
  }
}
function ligneTick(dt){ // chaque image de course : la file s'allonge devant la caisse, au rythme de SA vitesse
  if(!LIGNE.on||!running||gameOver)return;
  const b0=Math.max(30,Math.abs(vA)*SPD),mul=vitMult(),v0=b0*mul,H9=Math.max(4,(ROAD_HALF-3)*.62); // m de piste par seconde : la vraie avance de `s` = la vitesse PHYSIQUE × les multiplicateurs d'avance (NITROOO, VITESSE ×2 — MESURÉ : sans eux la file arrivait 1,5× trop serrée)
  /* la vitesse À L'ARRIVÉE sur l'objet, pas celle d'aujourd'hui : un départ lancé passe de 126 à 500 km/h en 12 s (MESURÉ) — espacée sur la
     vitesse du moment, la file arrivait tassée (un pad tous les 0,4 s, bloqués par les 1,5 s de recharge du pad) */
  /* ⚠ (audit DEBUGGING) l'accélération se dérive sur la vitesse PHYSIQUE, jamais sur l'avance multipliée : ramasser VITESSE doublait v0 en
     UNE image → ~9 000 m/s² estimés, la file posait 3 objets à 1 190 m l'un de l'autre (MESURÉ en VILLE 11). Plafond 40 m/s² (un départ
     lancé ~9, la rampe NITROOO ~15) ; les multiplicateurs s'appliquent APRÈS. */
  if(LIGNE.vP>0&&dt>0)LIGNE.acc+=(Math.min(40,(b0-LIGNE.vP)/dt)-LIGNE.acc)*Math.min(1,dt*2);LIGNE.vP=b0;
  const v=(b0+Math.max(0,LIGNE.acc)*LIGNE.voir*.7)*mul;
  if(LIGNE.prochS<s+60)LIGNE.prochS=s+60; // jamais derrière soi (portail, replacement)
  const hz=s+Math.max(220,v*LIGNE.voir);
  let n9=0;
  while(LIGNE.prochS<hz&&LIGNE.prochS<L-120&&n9<3){n9++; // au plus 3 par image (un départ lancé n'empile pas tout d'un coup)
    let s9=-1;
    for(let d=0;d<=160;d+=20){const q=LIGNE.prochS+d;if(q>=L-120)break;if(!ligneBloque(q,LIGNE.k)){s9=q;break;}}
    if(s9<0){LIGNE.prochS+=180;continue;}
    const lt=PADS_OFF?ligneMotif(ligneLat(s9,H9),H9):ligneLat(s9,H9); // (2026-10-21) l'ancien système : sur la corde, sans les groupes de Léo
    if(LIGNE.k){if(!(LVL.cur&&LVL.cur.piste==='banquise'))lignePad(s9,lt);}
    else if(PWR_LIGNE&&LIGNE.cnt>=LIGNE.npow){ // le BOUT D'UNE LONGUE FILE : un fruit-pouvoir (le 1er d'un débutant : l'aimant, sans le chercher)
      let kd='n';if(!LIGNE.prem&&pwrPremier()){kd='m';LIGNE.prem=true;}else kd=pwrTire(Math.random(),pwrPoids());
      lignePower(s9,kd==='m'&&LIGNE.prem&&LIGNE.cnt===LIGNE.npow?lt*.2:lt,kd);LIGNE.cnt=0;LIGNE.npow=14+((Math.random()*20)|0);
    }else{ligneFruit(s9,lt);LIGNE.cnt++;} // (2026-10-15) LE GLACIER : pas de pad d'or (ses fruits gardent leur cadence)
    LIGNE.pts.push({s:s9,lat:lt,k:LIGNE.k});LIGNE.n[LIGNE.k]++;if(LIGNE.pts.length>40)LIGNE.pts.shift();
    if(!PADS_OFF)LIGNE.k^=1; // (plus de plaques : toujours un fruit)
    LIGNE.prochS=s9+Math.max(PADS_OFF?12:40,v*LIGNE.dt*((PADS_OFF&&LIGNE.grp&&LIGNE.grp.mult)||1));
    if(PADS_OFF&&LIGNE.repos){LIGNE.repos=false;LIGNE.prochS+=Math.max(30,v*(1.2+Math.random()*1.4));} // un REPOS : un à deux secondes de route vide
  }
}
function frameAt(s,out){
  s=THREE.MathUtils.clamp(s,0,L-.01);
  const f=s/L*(NP-1),i=Math.floor(f),j=Math.min(i+1,NP-1),u=f-i;
  out.p.lerpVectors(pts[i],pts[j],u);
  out.t.lerpVectors(T[i],T[j],u).normalize();
  out.n.lerpVectors(Nn[i],Nn[j],u);
  out.n.addScaledVector(out.t,-out.n.dot(out.t)).normalize();
  out.b.crossVectors(out.n,out.t);
}
const F={p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()};
const padGeo=new THREE.PlaneGeometry(5.5,9);
/* (2026-09-26, passe perf) LES PLAQUES TURBO ne se redessinent plus à chaque image (8 tracés Canvas2D avec `shadowBlur` par image,
   renvoyés au GPU). (2026-09-26, vague 2 « L'ENCRE ET L'OR ») … et elles deviennent de L'OR. Elles tiraient leur couleur au hasard
   (bleu / blanc / rouge, sans aucun sens) et leurs chevrons étaient des traits flous (`shadowBlur`) de 64×128 agrandis au plus proche :
   des marches d'escalier baveuses, et 42 textures pré-dessinées (~1,8 Mo) pour faire défiler le motif. Désormais :
     · UNE texture 128×256 dessinée SUR LA GRILLE (des blocs de 4 px, zéro flou) : plaque à l'encre #1c0430, deux rails d'or qui la
       bordent (le LISERÉ de ce qui rapporte), chevrons d'or à arête claire et talon d'ombre, suivis de leur écho ;
     · le motif tombe juste sur 256 px (4 périodes) : `RepeatWrapping` + défilement par `map.offset.y` — une seule image, un seul
       envoi au GPU, jamais plus (−41 textures) ; mipmaps PEINTES + anisotropie : plus de chevrons qui grouillent au loin, et la
       plaque lointaine luit d'or au lieu de tourner au brun ;
     · UNE matière or PARTAGÉE par toutes les plaques (jamais libérée : son programme — MeshBasic + map, celui d'avant — reste chaud).
   Le turbo, c'est de l'argent qui accélère : il porte la couleur de l'argent. */
const PAD_FR=[],PAD_MATS=[]; // (vague 2) vestiges vides : plus d'images pré-dessinées ni de matière par plaque (voir PAD_MAT)
const padTex=(function(){
  const W=128,H=256;
  const dessine=function(fond,grille){const cv=document.createElement('canvas');cv.width=W;cv.height=H;const c=cv.getContext('2d');
    const R=(x,y,w,h,col)=>{c.fillStyle=col;for(const dy of [0,-H,H])c.fillRect(x,y+dy,w,h);}; // posé 3 fois : le motif se REPLIE sans couture
    R(0,0,W,H,fond);                                                                          // la plaque
    if(grille)for(let y=0;y<H;y+=8)R(16,y,96,4,grille);                                       // la grille de la plaque (un souffle, pas un motif)
    const OR='#fff27a',OR_C='#fffefa',OR_O='#d8a412'; // (2026-10-14, bords-route) l'arête des chevrons : blanc franc (blanc + or) // l'or CITRON en texture = l'or #ffd75e à l'écran, une fois passé l'ACES et le grade (même étalonnage que la pièce)
    for(const x of [4,116]){R(x,0,8,H,OR);R(x===4?x:x+6,0,2,H,OR_O);R(x===4?x+6:x,0,2,H,OR_C);} // les RAILS d'or : ombre dehors, lumière dedans
    for(let k=-1;k<=4;k++){const A=k*64+10;                                                   // 4 chevrons par tour de texture (période 64 px = 2,25 m)
      for(let cx=0;cx<11;cx++){const y=A+cx*2;
        for(const x of cx?[64+cx*4,60-cx*4]:[60,64]){ // (la colonne 0 : les deux blocs du sommet)
          R(x,y,4,14,OR);R(x,y,4,2,OR_C);R(x,y+12,4,2,OR_O);                               // le chevron : arête claire devant, talon d'ombre derrière
          R(x,y+20,4,6,OR_O);}}}                                                            // son ÉCHO, en or d'ombre
    return cv;};
  /* LES MIPMAPS SONT PEINTES À LA MAIN. Moyennée par la carte réduite, la plaque (un tiers d'or sur deux tiers d'encre) devenait au
     loin — vue rasante — un PAVÉ BRUN à peine plus clair que le bitume : on ne voyait plus la cible. Les deux premiers niveaux sont la
     plaque telle quelle ; à partir du 3e (la plaque fait moins de 32 pixels de large à l'écran) son fond passe à l'or sombre : de loin
     elle LUIT d'or, de près on lit ses chevrons sur l'encre. Le fondu entre les niveaux (trilinéaire) fait la transition, sans saut. */
  const pres=dessine('#2e2c29','#37352f'),loin=dessine('#9a6a0e',null),niv=[pres]; // (2026-10-14, bords-route) la plaque turbo sur BÉTON sombre (c'était l'encre violette)
  for(let w=W>>1,h=H>>1,k=1;w>=1||h>=1;w>>=1,h>>=1,k++){const cv=document.createElement('canvas');cv.width=Math.max(1,w);cv.height=Math.max(1,h);
    const c=cv.getContext('2d');c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';c.drawImage(k<2?niv[k-1]:(k===2?loin:niv[k-1]),0,0,cv.width,cv.height);niv.push(cv);
    if(cv.width===1&&cv.height===1)break;}
  const t=new THREE.CanvasTexture(pres);t.mipmaps=niv;t.generateMipmaps=false;t.wrapS=THREE.ClampToEdgeWrapping;t.wrapT=THREE.RepeatWrapping;
  t.magFilter=THREE.NearestFilter;t.minFilter=THREE.LinearMipmapLinearFilter; // de près : les vrais pixels ; au loin : la plaque qui luit, stable
  t.anisotropy=Math.min(ALLEGE?2:4,renderer.capabilities.getMaxAnisotropy()); // la plaque se voit à plat, rasante
  return t;
})();
const PAD_MAT=new THREE.MeshBasicMaterial({map:padTex,color:new THREE.Color(1.45,1.45,1.45),polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3}); // ×1,45 : la plaque ÉMET au-delà du blanc (le bloom la prend), elle reste d'or au loin au lieu d'un pavé brun // (2026-09-26) décalage de profondeur : le pad lointain ne clignote plus à travers le bitume
PAD_MAT.dispose=function(){}; // partagée par toutes les pistes : la piste suivante la reprend, MAT_SURSIS ne la jette jamais
function updatePadTex(t){ // les chevrons FILENT vers l'avant (6,7 m/s, le rythme d'avant) : on fait glisser la texture, on ne la redessine pas
  padTex.offset.y=1-((t*.742)%1);
}
updatePadTex(0);

