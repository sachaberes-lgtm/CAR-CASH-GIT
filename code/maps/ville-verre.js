/* ================================ LA VILLE VITRÉE — LES TOURS DE VERRE ================================
   (2026-10-17, Léo : « une nouvelle map VILLE VITRÉE : une ville de tours en VERRE — murs-rideaux à grands carreaux bleus, montants fins,
   reflets du ciel et des nuages dans les vitres, éclat du soleil, coins de tours biseautés, quelques bandes de béton / lames verticales —
   comme mes deux photos (tours de bureaux vues d'en bas, ciel bleu, soleil qui éblouit) ; quatre heures : MATIN (soleil bas, reflets
   dorés), MIDI (ciel bleu et nuages qui se reflètent), COUCHER (les tours qui s'embrasent orange et rose), NUIT (les bureaux allumés) »).
   LE NIVEAU (`NIV_VITRE` : id 'ville' + vitre:1, comme CRYPTO CITY) : la piste et l'emplacement des tours sont ceux de la VILLE (genCtrl,
   buildVoxCity, la règle d'or, les tours DURES) — à graine égale c'est la même ville, aucun tirage `vr` ajouté ni retiré. Ce qui change :
   · LA FAÇADE (`VIT_VERRE`, dans `vitreMatTours`) : le MUR-RIDEAU — un carreau par travée et par étage, des MONTANTS fins d'aluminium
     (la teinte d'instance, éclairée par la scène), chaque carreau un MIROIR légèrement désaxé (± 1-2° : les reflets se cassent d'une vitre
     à l'autre, comme sur un vrai mur de verre), Fresnel de verre traité, le CIEL et ses NUAGES renvoyés, l'ÉCLAT du soleil qui saute de
     carreau en carreau (il passe dans le halo : ça éblouit). Cinq familles tirées de la graine de la tour (la même pour ses retraits) :
     VERRE BLEU (34 %), BANDEAUX de béton clair (18 %), LAMES verticales blanches et leur ombre (16 %), VERRE SOMBRE à grands carreaux
     (16 %), VERRE ARGENT presque miroir (16 %). Les étages se comptent depuis le PIED de la tour : ses retraits gardent les mêmes étages.
     La NUIT : les bureaux allumés derrière le verre, par plateaux (des étages entiers dorment), les plafonniers en haut de chaque baie.
   · LES COINS BISEAUTÉS (`vitreGeo`) : un prisme à huit pans dont les quatre pans de coin s'écrasent à zéro (un cube, au triangle près) ou
     s'ouvrent jusqu'à 7 m — décidé au SOMMET par la graine de la tour (60 % des tours). 28 triangles au lieu de 12 (la seule hausse : MESURÉE).
     Les tours AU LOIN (couleur de brume) gardent le cube.
   · LES NUAGES (`vitreCiel` + `vitreNuages`) : une couche de cumulus peinte une fois (256², bruit périodique), posée sur un PLAFOND à 1 400 m
     au-dessus de la caméra — et ce sont LES MÊMES nuages que les vitres renvoient (même plafond, même texture) : on voit dans les tours le
     ciel qu'on a au-dessus de la tête. Une couche, deux lectures de texture par pixel.
   · Les ENSEIGNES et les RÉCLAMES de la ville de nuit se taisent (un quartier d'affaires) ; les TUYAUX deviennent des LAMES de béton qui
     descendent le long des façades ; les couronnes sont des bandeaux de lumière blanche ; les feux d'antenne restent rouges.
   · LE CIEL (biomes `vitreMatin/vitreMidi/vitreSoir/vitreNuit`) et la route : le jour d'altitude, la route glacée de CRYPTO CITY (`cryptoA`).
   Que des matières neuves compilées AU MENU (`vitreChauffe`) : 0 programme en course.
   Console : `dbgVitre()` (état), `dbgVitre('nuages',{…})` (les nuages à chaud), `dbgNiveauVitre(meteo)`. */
/* (2026-10-17 soir, Léo : « j'abandonne l'idée de la ville au plafond ; rends-la plus distincte — c'est CLEAN CITY : miroir, moderne, le futur,
   la technologie ») LE PLAFOND (la ville à l'envers, v2) n'est plus le défaut : `?plafond=1` le rend, tel quel. */
const VIT_PLAFOND=/[?&]plafond=1\b/.test(location.search);
/* ================================ LA VILLE, NÉON ET VERRE ================================
   (2026-10-18, Sacha : « mets-toi dans la peau d'une designer de jeux vidéo senior et fusionne les maps ville et ville vitrée ; on garde l'ambiance néon
   et tout, mais avec certains bâtiments qui viennent de la ville vitrée »). LA VILLE reste LA VILLE : la nuit, ses quatre temps, ses quatre teintes, ses
   enseignes, ses réclames, sa pluie, sa descente en spirale — mêmes tirages `vr`, au volume près. Ce qui vient de la VILLE VITRÉE : ses GÉANTES DE VERRE.
   · QUI : les tours qui MONTENT au-dessus de la route qu'elles bordent (le skyline, ce qu'on voit défiler et ce qu'on survole) — une sur deux parmi les
     plus hautes, une sur trois parmi les autres, quelques-unes au large ; tiré de la POSITION de la tour (`villeVerreTour`, aucun tirage `vr` de plus).
     Le béton, les enseignes et les réclames restent aux autres : LE NÉON AU PIED, LE VERRE DANS LE CIEL.
   · CE QU'ELLES GARDENT : leurs FORMES (droite à retraits empilés, effilée, vrillée, fuseau, ronde, lame — vitreForme), les coins biseautés (vitreGeo),
     le mur-rideau et ses carreaux désaxés, les bureaux allumés derrière le verre, les filets de LED des arêtes, les logos minimalistes ; pas d'enseigne
     ni de réclame plaquée sur elles (une façade de verre qui vrille ne porte pas une plaque droite).
   · CE QUI CHANGE : elles sont EN NÉON — le verre renvoie le ciel de la ville, sa brume teintée et la lueur de ses néons (VV, posé par villeVerreTick
     d'après la brume et la teinte), les filets, les logos et le parapet prennent la couleur de la TEINTE (violet, vert, jaune, bleu), plus de verre que
     de tours blanches (VV_STY), les bureaux plus vifs (VV_VERRE) ; leur pied se noie dans la brume comme celui des tours de béton (villePied).
   · LA VILLE VITRÉE quitte le JOUER : elle vit désormais dans LA VILLE (SF_HORS) — `?vitree=1` la remet au tirage ; `?carte=vitree`, dbgNiveauVitre
     la jouent toujours, telle quelle (le travail de Léo n'est pas touché).
   VILLE_VERRE_V=false = la ville néon d'avant (et la vitrée revient au tirage) — pas d'interrupteur d'adresse (allègement du 18/10). Console : `dbgVilleVerre()`. */
const VILLE_VERRE_V=true;
const VV_STY='sty=s3<.34?0.:s3<.44?1.:s3<.56?2.:s3<.78?3.:4.'; // (NÉON ET VERRE) 34 % VERRE BLEU · 10 % BLANCHE à bandeaux · 12 % LAMES · 22 % SOMBRE · 22 % ARGENT — les mêmes seuils pour la structure (buildVoxCity)
const VV={on:false,n:0,nv:0,acc:new THREE.Color(1,.25,.78),
  uZen:{value:new THREE.Vector3(.04,.02,.06)},uMid:{value:new THREE.Vector3(.12,.05,.16)},uHor:{value:new THREE.Vector3(.35,.14,.4)},uAcc:{value:new THREE.Vector3(1,.25,.78)},
  uNuit:{value:1},uSunK:{value:0},uClK:{value:new THREE.Vector4(.30,.78,.85,0)},uClL:{value:new THREE.Vector3(.4,.2,.45)},uClA:{value:new THREE.Vector3(.05,.03,.07)},
  uClD:{value:new THREE.Vector2()},uPlf:{value:new THREE.Vector3(.1,.05,.12)}};
/* QUI devient une géante de verre : haut = de combien son toit dépasse la route qu'elle borde (m) — le skyline, pas les toits qu'on survole */
function villeVerreTour(cx,cz,haut,canyon){if(haut<(canyon?60:30))return false;const h=metroH(cx*.71-5.3,cz*1.37+2.9);return h<(canyon?(haut>190?.52:.34):.3);}
function villeVerreTourD(cx,cz,haut,canyon,V){if(haut<(canyon?60:30))return false;const h=metroH(cx*.71-5.3+V.ox,cz*1.37+2.9+V.oz);return h<Math.min(.9,(canyon?(haut>190?.52:.34):.3)*V.k);} // (2026-10-20, LE DÉCOR AU HASARD) la part de géantes tirée (V.k) et LESQUELLES (la graine de position décalée)
/* LE CIEL QUE LE VERRE RENVOIE, en ville : la brume de la ville (sa teinte, son temps) — sombre au zénith, la lueur des rues et des néons à l'horizon ;
   les nuages, éclairés par en dessous. Posé à chaque image (VV : ses propres uniformes, la ville vitrée garde les siens). (banc, 2e passe, même graine :
   à la première les géantes sortaient PLUS SOMBRES que les tours au néon — elles éteignaient le skyline ; d'où ces dosages.) */
const VV_MET={pluie:[.20,.62,.95],nuit:[.52,.84,.55],brouillard:[.10,.50,1.],orage:[.16,.58,1.]}; // la couverture des nuages [seuil bas, seuil haut, force]
function villeVerreTick(dt){
  if(!(VV.on&&CITY.root&&LVL.cur&&LVL.cur.id==='ville'&&!LVL.cur.vitre&&!LVL.cur.crypto))return;
  const f=scene.fog&&scene.fog.color,a=VV.acc;if(!f)return;
  VV.uZen.value.set(f.r*.55+a.r*.04,f.g*.55+a.g*.04,f.b*.55+a.b*.04);
  VV.uMid.value.set(f.r*1.0+a.r*.14,f.g*1.0+a.g*.14,f.b*1.0+a.b*.14);
  VV.uHor.value.set(f.r*1.35+a.r*.32,f.g*1.35+a.g*.32,f.b*1.35+a.b*.32); // la lueur de la ville et de ses néons à l'horizon du reflet
  VV.uAcc.value.set(a.r,a.g,a.b);
  const M=VV_MET[LVL.cur.meteo]||VV_MET.pluie,K=VV.uClK.value,k=Math.min(1,dt*1.5);K.x+=(M[0]-K.x)*k;K.y+=(M[1]-K.y)*k;K.z+=(M[2]-K.z)*k;
  VV.uClL.value.set(f.r*1.5+a.r*.3,f.g*1.5+a.g*.3,f.b*1.5+a.b*.3); // le dessous des nuages : la ville l'allume
  VV.uClA.value.set(f.r*.6,f.g*.6,f.b*.6);
  VV.uClD.value.x+=dt*.0016;VV.uClD.value.y+=dt*.0007;}
window.dbgVilleVerre=function(){return {on:VILLE_VERRE_V,ici:VV.on,tours:VV.n,verre:VV.nv,part:VV.n?+(VV.nv/VV.n).toFixed(3):0,acc:VV.acc.toArray().map(function(x){return +x.toFixed(3);}),
  vitreeAuTirage:!SF_HORS.vitree,familles:(CITY.fam||[]).map(function(F){return F.n;}),
  retouches:[VV_VERRE.indexOf(VV_STY)>=0,VV_VERRE.indexOf('colF+=uAcc9*')>=0,VV_VERRE.indexOf('mix(uAcc9,vec3(1.),.35)*1.9')>=0,VIT_VERRE.indexOf('uAcc9')<0]};}; // (banc) les retouches du verre de la ville sont posées, celui de la vitrée n'a pas bougé
/* (2026-10-18, Léo : « la vitrée je la trouve pas assez différente ; celle-là on reste au sol, effet Shanghai vu d'en bas, mais sur des trucs
   immenses » — et « parfois je vois des formes de ville dans le ciel, à l'envers ». MESURÉ : la route de la ville descend en SPIRALE (5,7 km de
   chute sur 16,7 km) ; d'un étage du bas, les tours des étages du haut PENDAIENT dans le ciel, leur pied fondu dans le bleu.)
   LA VILLE AU SOL : la route ne descend plus (`vitreAplanir` : une voie express à VIT_SOL_H du sol, des PONTS là où elle se recroise), un vrai
   SOL (`vitreSolMat` : dalles claires, avenues, pelouses, bassins), des PILIERS sous la route, et des tours GÉANTES (200 à 1 000 m) posées
   sur le sol — on roule à leur pied et on lève les yeux. Toucher le sol en vol = l'explosion (cause 'sol'). `?vitre=spirale` = la ville
   d'avant (la spirale, les pieds dans la brume) ; `?plafond=1` la rend aussi. */
const VIT_SOL=!VIT_PLAFOND&&!/[?&]vitre=spirale\b/.test(location.search);
const VIT_SOL_H=26,VIT_SEP=46; // la route à 26 m du sol ; un pont passe ≥ 46 m au-dessus de la route qu'il croise (le tablier, la caisse, la caméra)
/* LA ROUTE À PLAT : l'altitude des points de contrôle est RÉÉCRITE (le tracé en plan ne bouge pas, aucun tirage `rnd`) — une houle de ±14 m,
   puis, partout où la route repasse au-dessus (en plan) d'un bout déjà posé, le passage suivant MONTE en pont (rampe en S, ≤ ~7°, VIT_SEP
   au-dessus de l'autre) ; on recommence jusqu'à ce qu'aucun croisement ne reste (un pont peut en enjamber un autre). */
function vitreAplanir(P){
  const n=P.length;if(n<3)return;
  const S=new Float64Array(n);for(let i=1;i<n;i++)S[i]=S[i-1]+Math.hypot(P[i].x-P[i-1].x,P[i].z-P[i-1].z);
  const y0=P[0].y,f1=((P[0].x*.0137+P[0].z*.0191)%6.2832),f2=((P[0].x*.0071-P[0].z*.0113)%6.2832),h=new Float64Array(n);
  for(let i=0;i<n;i++){const e=1-Math.exp(-S[i]/260);h[i]=(10*Math.sin(S[i]/640+f1)+4*Math.sin(S[i]/230+f2)-10*Math.sin(f1)-4*Math.sin(f2))*e;} // (part de 0 au portail)
  const Dc=2*ROAD_HALF+16,Dc2=Dc*Dc,GAP=Math.max(260,5*Dc),LR=1.5*VIT_SEP/.12; // LR : la rampe d'un pont (pente max ~7°)
  const sd2=function(a,b,c,d){ // distance² en plan entre les segments [a,b] et [c,d]
    const ux=b.x-a.x,uz=b.z-a.z,vx=d.x-c.x,vz=d.z-c.z,wx=a.x-c.x,wz=a.z-c.z,A=ux*ux+uz*uz,B=ux*vx+uz*vz,C=vx*vx+vz*vz,D=ux*wx+uz*wz,E=vx*wx+vz*wz,den=A*C-B*B;
    const den1=ux*(d.z-c.z)-uz*(d.x-c.x);if(Math.abs(den1)>1e-9){const t=((c.x-a.x)*vz-(c.z-a.z)*vx)/den1,u=((c.x-a.x)*uz-(c.z-a.z)*ux)/den1;if(t>=0&&t<=1&&u>=0&&u<=1)return 0;}
    let m=1e18;const pt=function(px,pz,qx,qz,rx,rz){const lx=rx-qx,lz=rz-qz,l2=lx*lx+lz*lz||1e-9;let t=((px-qx)*lx+(pz-qz)*lz)/l2;t=t<0?0:t>1?1:t;const ex=qx+lx*t-px,ez=qz+lz*t-pz;return ex*ex+ez*ez;};
    m=Math.min(pt(a.x,a.z,c.x,c.z,d.x,d.z),pt(b.x,b.z,c.x,c.z,d.x,d.z),pt(c.x,c.z,a.x,a.z,b.x,b.z),pt(d.x,d.z,a.x,a.z,b.x,b.z));return m;};
  const req=new Float64Array(n),pr=[];
  for(let j=1;j<n-1;j++)for(let i=0;i<j-1&&S[i+1]<=S[j]-GAP;i++)if(sd2(P[i],P[i+1],P[j],P[j+1])<Dc2)pr.push(i,j); // les croisements (en plan), une fois pour toutes
  for(let it=0;it<12;it++){let conf=0;req.fill(-1e9);
    for(let q=0;q<pr.length;q+=2){const i=pr[q],j=pr[q+1],hi=Math.max(h[i],h[i+1]),lo=Math.min(h[i],h[i+1]),hj=Math.min(h[j],h[j+1]),hj2=Math.max(h[j],h[j+1]);
      if(hj>=hi+VIT_SEP-1||hj2<=lo-VIT_SEP+1)continue; // déjà au-dessus (ou dessous) : rien à faire
      conf++;const v=hi+VIT_SEP+2;if(v>req[j])req[j]=v;if(v>req[j+1])req[j+1]=v;}
    if(!conf)break;
    const h0=h.slice(); // la RAMPE : chaque exigence tire la route vers elle en S (smoothstep) sur LR mètres de part et d'autre
    for(let k=0;k<n;k++){let m=h0[k];for(let l=0;l<n;l++){if(req[l]<-1e8)continue;const x=Math.abs(S[k]-S[l])/LR;if(x>=1)continue;const w=1-x*x*(3-2*x),v=h0[k]+(req[l]-h0[k])*w;if(v>m)m=v;}h[k]=m;}}
  for(let i=0;i<n;i++)P[i].y=y0+h[i];
  vitreAplanir.ponts=pr.length/2;
}
/* LE SOL DE LA VILLE (AU SOL) : un seul plan, sous toute la piste (+7 km), dessiné dans le shader — des ÎLOTS de 240 m séparés par des AVENUES
   de 36 m (asphalte, lignes blanches, tirets au milieu), et dans chaque îlot un PARVIS (dalles de 6 m), une PELOUSE tondue ou un BASSIN qui renvoie
   le ciel (le soleil y brille) ; la nuit, des lignes de LED bleues le long des avenues, des réverbères, des bassins éclairés. Le motif s'efface
   au loin (fwidth : rien ne fourmille). Les PILIERS (InstancedMesh, deux boîtes : le fût et le chapiteau en T) tous les ~64 m sous la route, sauf là
   où une autre route passe dessous. Matières compilées au menu (vitreChauffe). */
function vitreSolMat(){
  if(VIT.mat.sol)return VIT.mat.sol;
  const m=new THREE.ShaderMaterial({fog:true,extensions:{derivatives:true},
    uniforms:Object.assign(THREE.UniformsUtils.clone(THREE.UniformsLib.fog),{uSolC:VIT.uSolC,uSolL:VIT.uSolL,uSun:VIT.uSun,uSunC:VIT.uSunC,uNuit:VIT.uNuit,uWet:ROAD_U.uWet,uZen:skyU.uJZen,uHor:skyU.uJHor}),
    vertexShader:'varying vec3 vW;\n#include <fog_pars_vertex>\nvoid main(){vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;vec4 mvPosition=viewMatrix*w;gl_Position=projectionMatrix*mvPosition;\n#include <fog_vertex>\n}',
    fragmentShader:'uniform vec3 uSolC,uSolL,uSun,uSunC,uZen,uHor;uniform float uNuit,uWet;varying vec3 vW;\n#include <fog_pars_fragment>\n'+
      'float lgn(float x,float w,float f){return 1.-smoothstep(w-f,w+f,abs(x));}float hs(vec2 c){return fract(sin(dot(c,vec2(12.9898,78.233)))*43758.5453);}'+
      'void main(){vec2 p=vW.xz;vec2 fw=max(fwidth(p),vec2(1e-3));float f=max(fw.x,fw.y),far=smoothstep(1.2,6.,f),far2=smoothstep(.3,1.6,f);'+
      ' const float B=240.,A=36.;vec2 c=floor(p/B),u=p-c*B,v=u-A;float h=hs(c),h2=hs(c+17.3);'+
      ' float avX=1.-smoothstep(A-f,A+f,u.x),avZ=1.-smoothstep(A-f,A+f,u.y),av=max(avX,avZ);'+                       // l'AVENUE : les 36 premiers mètres de chaque axe de l'îlot
      ' vec3 V=normalize(vW-cameraPosition),R=reflect(V,vec3(0.,1.,0.));'+
      ' vec3 ciel=mix(uHor,uZen,smoothstep(0.,.6,R.y)),eau=ciel*vec3(.60,.74,.88)+pow(max(dot(R,uSun),0.),500.)*uSunC*4.;'+   // le ciel dans l'eau (et le soleil)
      ' float bord=min(min(v.x,v.y),min(B-A-v.x,B-A-v.y)),inn=smoothstep(10.-f,10.+f,bord);'+                       // 10 m de parvis autour de la pelouse ou du bassin
      ' vec2 g6=abs(fract(v/6.)-.5)*6.;float jt=(1.-smoothstep(.1-f*.5,.1+f*.5,min(g6.x,g6.y)))*(1.-far2);'+
      ' vec3 col=uSolC*(1.-.09*jt)*(.965+.05*hs(floor(v/6.)+c*7.)*(1.-far2));'+                                     // le PARVIS : dalles de 6 m
      ' vec3 pel=mix(vec3(.30,.47,.30),vec3(.37,.55,.35),step(.5,fract(v.x/9.))*(1.-far*.7));'+                       // la PELOUSE tondue
      ' float ty=h<.42?0.:h<.66?1.:h<.8?2.:0.;'+
      ' if(ty>.5)col=mix(col,ty<1.5?pel*mix(1.,.2,uNuit):eau*mix(1.,.4,uNuit),inn);'+
      ' float ax=u.x,az=u.y,lx=lgn(ax-2.,.22,f)+lgn(ax-34.,.22,f)+lgn(ax-18.,.18,f)*step(.5,fract(p.y/14.)),lz=lgn(az-2.,.22,f)+lgn(az-34.,.22,f)+lgn(az-18.,.18,f)*step(.5,fract(p.x/14.));'+
      ' float ln=clamp(avX*(1.-avZ)*lx+avZ*(1.-avX)*lz,0.,1.)*(1.-far);'+
      ' vec3 asph=mix(vec3(.19,.20,.23),vec3(.05,.055,.07),uNuit)*mix(1.,.6,uWet);col=mix(col,mix(asph,vec3(.93),ln*.85),av);'+  // l'asphalte et ses lignes
      ' col*=uSolL;'+
      ' col=mix(col,ciel*.55,uWet*.3*(1.-av*.5));'+                                                                   // la pluie : la dalle mouillée renvoie le ciel
      ' float led=(avX*(1.-avZ)*(lgn(ax-1.,.35,f)+lgn(ax-35.,.35,f))+avZ*(1.-avX)*(lgn(az-1.,.35,f)+lgn(az-35.,.35,f)));'+
      ' vec2 lp=vec2(min(abs(ax-5.),abs(ax-31.)),abs(mod(p.y,32.)-16.)),lq=vec2(min(abs(az-5.),abs(az-31.)),abs(mod(p.x,32.)-16.));'+
      ' float lamp=avX*(1.-avZ)*(1.-smoothstep(.5,5.,length(lp)))+avZ*(1.-avX)*(1.-smoothstep(.5,5.,length(lq)));'+
      ' col+=uNuit*(vec3(.25,.55,1.)*1.3*led*(1.-far*.6)+vec3(1.,.86,.62)*.55*lamp+(ty>1.5&&ty<2.5?vec3(.15,.35,.6)*.35*inn:vec3(0.)));'+ // la NUIT : LED bleues, réverbères, bassins éclairés
      ' gl_FragColor=vec4(col,1.);\n#include <fog_fragment>\n}'});
  m.dispose=function(){};VIT.mat.sol=m;return m;
}
function vitrePilMat(){
  if(VIT.mat.pil)return VIT.mat.pil;
  const m=new THREE.ShaderMaterial({fog:true,
    uniforms:Object.assign(THREE.UniformsUtils.clone(THREE.UniformsLib.fog),{uSun:VIT.uSun,uSunC:VIT.uSunC,uNuit:VIT.uNuit,uZen:skyU.uJZen,uSolC:VIT.uSolC}),
    vertexShader:'varying vec3 vN,vW;\n#include <fog_pars_vertex>\nvoid main(){vec4 p=vec4(position,1.);vec3 n=normal;\n#ifdef USE_INSTANCING\np=instanceMatrix*p;n=mat3(instanceMatrix)*n;\n#endif\n'+
      'vec4 w=modelMatrix*p;vW=w.xyz;vN=normalize(mat3(modelMatrix)*n);vec4 mvPosition=viewMatrix*w;gl_Position=projectionMatrix*mvPosition;\n#include <fog_vertex>\n}',
    fragmentShader:'uniform vec3 uSun,uSunC,uZen,uSolC;uniform float uNuit;varying vec3 vN,vW;\n#include <fog_pars_fragment>\n'+
      'void main(){vec3 n=normalize(vN);float d=max(dot(n,uSun),0.);'+
      ' vec3 col=vec3(.86,.88,.92)*(uSunC*d*.75+uZen*.4+uSolC*.22*max(-n.y,0.)+.06);'+                                // le béton blanc : le soleil, le ciel, le sol qui renvoie dessous
      ' col+=vec3(.25,.55,1.)*uNuit*.9*(1.-smoothstep(.05,.2,abs(fract(vW.y/16.)-.5)*2.-.85));'+                       // la NUIT : un anneau de LED bleue tous les 16 m
      ' gl_FragColor=vec4(col,1.);\n#include <fog_fragment>\n}'});
  m.dispose=function(){};VIT.mat.pil=m;return m;
}
function vitreSolPose(root,GS){
  let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(let i=0;i<NP;i+=6){const p=pts[i];if(p.x<x0)x0=p.x;if(p.x>x1)x1=p.x;if(p.z<z0)z0=p.z;if(p.z>z1)z1=p.z;}
  const M9=7000,g=new THREE.Mesh(new THREE.PlaneGeometry(1,1).rotateX(-Math.PI/2),vitreSolMat());
  g.scale.set(x1-x0+2*M9,1,z1-z0+2*M9);g.position.set((x0+x1)/2,GS,(z0+z1)/2);g.frustumCulled=false;g.renderOrder=1; // dessiné APRÈS la ville : ce que les tours cachent n'est pas peint
  g.matrixAutoUpdate=false;g.updateMatrix();root.add(g);VIT.solM=g;
  // LES PILIERS : un fût de 7 m et un chapiteau en T sous le tablier, tous les ~64 m — pas là où une autre route passe dessous (le pont de l'échangeur)
  const st=Math.max(1,Math.round(64/(L/(NP-1)))),P9=[],R2=(ROAD_HALF+12)*(ROAD_HALF+12),PIL=VIT.pilP||(VIT.pilP=[]);PIL.length=0;
  for(let i=Math.round(st/2);i<NP-st;i+=st){const p=pts[i],n=Nn[i];if(!(n.y>.85))continue;const top=p.y-THICK*.3,hh=top-GS;if(hh<12)continue;
    let dessous=false;for(let j=0;j<NP&&!dessous;j+=3){const q=pts[j],dx=q.x-p.x,dz=q.z-p.z;if(dx*dx+dz*dz<R2&&q.y<top-10)dessous=true;}
    if(dessous)continue;P9.push(p.x,top,p.z,hh,Math.atan2(T[i].x,T[i].z));}
  const nP=P9.length/5;if(!nP)return;
  const im=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),vitrePilMat(),nP*2),m4=VIT.m4,q=new THREE.Quaternion(),e=new THREE.Euler(),v=new THREE.Vector3(),sc=new THREE.Vector3();
  for(let k=0;k<nP;k++){const x=P9[k*5],top=P9[k*5+1],z=P9[k*5+2],hh=P9[k*5+3],a=P9[k*5+4];q.setFromEuler(e.set(0,a,0));
    m4.compose(v.set(x,GS+hh/2,z),q,sc.set(7,hh,7));im.setMatrixAt(k*2,m4);
    m4.compose(v.set(x,top-3,z),q,sc.set(ROAD_HALF*1.25,5,9));im.setMatrixAt(k*2+1,m4);PIL.push(x,z);}
  im.frustumCulled=false;im.matrixAutoUpdate=false;im.updateMatrix();root.add(im);VIT.pilN=nP;
}
function vitreSolDans(p){return CITY.solY!=null&&p.y<CITY.solY+.8;} // (AU SOL) la caisse touche-t-elle le sol ? (le test de impPrep)
const VIT={mat:{},geo:null,tex:null,ciel:null,met:'midi',
  uT:{value:0},uCam:{value:new THREE.Vector3()},uSun:{value:new THREE.Vector3().copy(SUN_DIR)},uNuit:{value:0},uSunC:{value:new THREE.Vector3(1,1,1)},uSunK:{value:1},
  uCl:{value:null},uClK:{value:new THREE.Vector4(.50,.76,.9,0)},uClL:{value:new THREE.Vector3(1,1,1)},uClA:{value:new THREE.Vector3(.66,.74,.86)},
  uClD:{value:new THREE.Vector2()},uClS:{value:new THREE.Vector2()},uClH:{value:1400},uClT:{value:3200},sol:[6,157],solK:0,
  uBand:{value:new THREE.Vector2(.07,.26)},uPlf:{value:new THREE.Vector3(.78,.86,.95)},geoR:null,uHaut:{value:1},uSolC:{value:new THREE.Vector3(.80,.83,.86)},uSolR:{value:new THREE.Vector3(.62,.66,.72)},uSolL:{value:new THREE.Vector3(1,1,1)},dirY:0,
  v1:new THREE.Vector3(),m4:new THREE.Matrix4(),c:new THREE.Color()};
/* LES HEURES (v2, le plafond) : k = [seuil bas, seuil haut, force] du relief du plafond de nuages · l = le côté éclairé · a = le creux · p = la couleur du
   PLAFOND (la mer de nuages à l'envers, au-dessus de la ville d'en haut) · s = l'éclat du soleil sur le verre · sol = [hauteur, azimut] du soleil en degrés
   (l'azimut depuis +z vers +x : 157° = le soleil de toujours) — BAS : il vit dans la bande de ciel entre les deux villes. */
const VIT_MET_PL={
  matin:{k:[.30,.76,.90],l:[1,.90,.78],a:[.76,.68,.74],p:[.92,.84,.80],s:1,sol:[4,128]},
  midi: {k:[.30,.76,.90],l:[1,1,1],a:[.72,.78,.88],p:[.86,.90,.96],s:1,sol:[8,157]},
  soir: {k:[.30,.76,.90],l:[1,.76,.58],a:[.62,.40,.50],p:[.95,.66,.55],s:1,sol:[2.5,186]},
  nuit: {k:[.42,.84,.70],l:[.11,.12,.19],a:[.03,.035,.06],p:[.035,.045,.085],s:0,sol:[10,157]},
  pluie:{k:[.30,.78,.85],l:[.58,.62,.68],a:[.30,.33,.38],p:[.46,.50,.56],s:.15,sol:[6,157]}};
/* CLEAN CITY : le ciel de la v1 (ses cumulus, k = couverture du ciel) ; p = la mer de nuages d'EN BAS, que le verre renvoie vers le bas. */
const VIT_MET_CL={
  matin:{k:[.54,.80,.78],l:[1,.86,.70],a:[.62,.60,.76],p:[.92,.86,.82],s:1,sol:[9,128]},
  midi: {k:[.47,.74,.94],l:[1,1,1],a:[.64,.72,.86],p:[.88,.92,.97],s:1,sol:[26,157]},
  soir: {k:[.56,.82,.72],l:[1,.76,.56],a:[.46,.32,.48],p:[.95,.70,.58],s:1,sol:[4,186]},
  nuit: {k:[.56,.82,.55],l:[.16,.18,.26],a:[.04,.045,.08],p:[.04,.05,.09],s:0,sol:[32,157]},
  pluie:{k:[.26,.66,.96],l:[.64,.68,.74],a:[.38,.42,.48],p:[.50,.54,.60],s:.15,sol:[20,157]}};
const VIT_MET=VIT_PLAFOND?VIT_MET_PL:VIT_MET_CL;
const VIT_SOLC={matin:[.90,.84,.78],midi:[.82,.85,.88],soir:[.88,.72,.62],nuit:[.05,.055,.07],pluie:[.40,.43,.47]}; // (AU SOL) la couleur des dalles à chaque heure (avant la lumière)
const VIT_HC=150; // le PLAFOND : la ville d'en haut est le miroir de celle d'en bas par rapport à un plan à 150 m au-dessus de la route qu'elle borde (à 330 m, vue de la caméra de course, elle restait hors de l'écran)
function vitreOn(){return !!(LVL.cur&&LVL.cur.vitre&&!PARK.on);}
function vitreNuages(){ // la toile des nuages : un bruit de valeur PÉRIODIQUE (5 octaves, sans couture), remis sur [0,1], peint une fois
  if(VIT.tex)return VIT.tex;
  const N=256,cv=document.createElement('canvas');cv.width=cv.height=N;const x=cv.getContext('2d'),im=x.createImageData(N,N),d=im.data,R=mulberry32(0x7E77E);
  const G=[4,8,16,32,64].map(function(g){const a=new Float32Array(g*g);for(let i=0;i<a.length;i++)a[i]=R();return [g,a];}),amp=[.5,.26,.13,.07,.04],v=new Float32Array(N*N);
  let lo=1e9,hi=-1e9;
  for(let y=0;y<N;y++)for(let x9=0;x9<N;x9++){let s=0;
    for(let k=0;k<G.length;k++){const g=G[k][0],a=G[k][1],fx=x9/N*g,fy=y/N*g,ix=Math.floor(fx),iy=Math.floor(fy),tx=fx-ix,ty=fy-iy,sx=tx*tx*(3-2*tx),sy=ty*ty*(3-2*ty);
      const i1=(ix+1)%g,j1=(iy+1)%g,v0=a[iy*g+ix]+(a[iy*g+i1]-a[iy*g+ix])*sx,v1=a[j1*g+ix]+(a[j1*g+i1]-a[j1*g+ix])*sx;s+=(v0+(v1-v0)*sy)*amp[k];}
    v[y*N+x9]=s;if(s<lo)lo=s;if(s>hi)hi=s;}
  for(let i=0;i<N*N;i++){const c=Math.round((v[i]-lo)/(hi-lo)*255),o=i*4;d[o]=d[o+1]=d[o+2]=c;d[o+3]=255;}
  x.putImageData(im,0,0);
  const t=new THREE.CanvasTexture(cv);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.minFilter=THREE.LinearMipmapLinearFilter;t.magFilter=THREE.LinearFilter;
  try{t.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());}catch(e){}
  texLibere(t);VIT.tex=t;VIT.uCl.value=t;return t;}
/* LE PRISME À COINS BISEAUTÉS : chaque coin porte deux sommets confondus (un sur la face x, un sur la face z) ; `aCh9` dit lequel recule
   (x ou z) quand le sommet ouvre le biseau. Biseau nul = le cube d'avant (les pans de coin sont plats : rien n'est rastérisé).
   NR = le nombre d'ÉTAGES de la géométrie : 1 pour les tours droites, effilées, rondes et en lame (28 triangles) ; 6 pour les tours qui VRILLENT
   et les FUSEAUX (108 triangles) — leur forme se calcule au sommet, étage par étage. */
function vitreGeoFab(NR){
  const P=[],Nn=[],C=[],I=[];let n=0;
  const CO=[[1,1],[-1,1],[-1,-1],[1,-1]];                       // les coins, dans l'ordre du tour (vus de dessus)
  const vx=function(k,cote,y){const c=CO[k];return {p:[c[0]*.5,y,c[1]*.5],a:cote==='x'?[0,c[1]]:[c[0],0]};}; // 'x' : sur la face x (recule en z) · 'z' : sur la face z (recule en x)
  const ouvre=function(v){return [v.p[0]-v.a[0]*.1,v.p[1],v.p[2]-v.a[1]*.1];}; // la position biseau ouvert (pour l'ordre des sommets)
  const mur=function(ka,ca,kb,cb,nx,nz){ // une face murale, de (ka,ca) à (kb,cb), en NR bandes
    const b0=n;for(let r=0;r<=NR;r++){const y=-.5+r/NR;for(const v of [vx(ka,ca,y),vx(kb,cb,y)]){P.push(v.p[0],v.p[1],v.p[2]);Nn.push(nx,0,nz);C.push(v.a[0],v.a[1]);}}n+=2*(NR+1);
    const A=ouvre(vx(ka,ca,-.5)),B=ouvre(vx(kb,cb,-.5)),Cc=ouvre(vx(kb,cb,.5)),u=[B[0]-A[0],B[1]-A[1],B[2]-A[2]],w=[Cc[0]-A[0],Cc[1]-A[1],Cc[2]-A[2]];
    const ok=(u[1]*w[2]-u[2]*w[1])*nx+(u[0]*w[1]-u[1]*w[0])*nz>0;
    for(let r=0;r<NR;r++){const a=b0+2*r,b=a+1,c=a+3,d=a+2;if(ok)I.push(a,b,c,a,c,d);else I.push(a,c,b,a,d,c);}};
  const r2=Math.SQRT1_2;
  mur(3,'x',0,'x',1,0);mur(1,'x',2,'x',-1,0);mur(0,'z',1,'z',0,1);mur(2,'z',3,'z',0,-1); // ±x, ±z
  for(let k=0;k<4;k++)mur(k,'x',k,'z',CO[k][0]*r2,CO[k][1]*r2); // les quatre pans de coin
  for(const y of [.5,-.5]){const b=n,R=[];for(let k=0;k<4;k++)R.push(vx(k,'x',y),vx(k,'z',y)); // le toit et le dessous : l'octogone en éventail
    for(const v of R){P.push(v.p[0],v.p[1],v.p[2]);Nn.push(0,y>0?1:-1,0);C.push(v.a[0],v.a[1]);}
    for(let k=1;k<7;k++)if(y>0)I.push(b,b+k+1,b+k);else I.push(b,b+k,b+k+1);n+=8;}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(Nn,3));
  g.setAttribute('aCh9',new THREE.Float32BufferAttribute(C,2));g.setIndex(I);g.computeBoundingSphere();g.computeBoundingBox();
  g.dispose=function(){}; // PARTAGÉE (trackMeshes la jetterait au rebuild) : une seule pour toutes les villes vitrées
  return g;}
function vitreGeo(){return VIT.geo||(VIT.geo=vitreGeoFab(1));}
function vitreGeoR(){return VIT.geoR||(VIT.geoR=vitreGeoFab(6));}
/* LA FORME D'UNE TOUR (2026-10-17, Léo : « moins en forme que Crypto City… imagine plutôt Shanghai — l'architecture des bâtiments, surtout pas
   de stéréotype ») : des gratte-ciel très hauts et fins aux silhouettes travaillées, aucun monument reconnaissable. Tirée de la POSITION de la
   tour (aucun tirage `vr`) : 0 DROITE (retraits empilés) · 1 EFFILÉE · 2 VRILLÉE · 3 FUSEAU · 4 RONDE · 5 LAME (toit en biais). Les tours du
   canyon (le long de la route) ont toutes les formes ; la forêt du lointain, les simples. Le sommet la lit dans la couleur d'instance (r + 8 × forme). */
function vitreForme(cx,cz,H,canyon){const h=metroH(cx*1.7+3.1,cz*.9-7.3);
  if(canyon&&H>240)return h<.28?0:h<.46?1:h<.60?2:h<.71?3:h<.86?4:5;
  return h<.6?0:h<.75?4:h<.88?1:5;}
function vitreFormeD(cx,cz,H,canyon,F){const h=metroH(cx*1.7+3.1+F.ox,cz*.9-7.3+F.oz),S=F.s; // (2026-10-20, LE DÉCOR AU HASARD) les formes de la VILLE VITRÉE : la famille tirée (F.s, les seuils) et lesquelles (la graine décalée)
  if(canyon&&H>240)return h<S[0]?0:h<S[1]?1:h<S[2]?2:h<S[3]?3:h<S[4]?4:5;
  return h<.6?0:h<.75?4:h<.88?1:5;}
// LE MUR DE VERRE — au sommet le biseau, au pixel la façade ; la tour de la ville (tri hors champ, portée des lampes, impact) pour le reste
/* (2026-10-18, NÉON ET VERRE) le mur de verre est une FONCTION de ce qu'il renvoie vers le bas et sur les côtés (CB, la fin du ciel renvoyé) : la VILLE
   VITRÉE la prend avec sa branche de toujours (VIT_CIEL_B : le texte de VIT_VERRE est le même au caractère près), LA VILLE avec la sienne (VV_CIEL_B). */
const VIT_CIEL_B=(VIT_PLAFOND?'sky=mix(sky,mix(uPlf9,rel9,cv),smoothstep(uBand9.x,uBand9.y,ary));}':  // (v2) LE PLAFOND : au-dessus de la bande de ciel, la mer de nuages à l'envers
   VIT_SOL?'sky=ry>0.?mix(sky,rel9,cv*smoothstep(.015,.12,ry)):mix(uHor9,uSolR9,smoothstep(0.,.16,ary));}': // (AU SOL) vers le bas, les dalles de la ville (la brume à l'horizon)
   'sky=ry>0.?mix(sky,rel9,cv*smoothstep(.015,.12,ry)):mix(sky,mix(uPlf9,rel9,smoothstep(uClK9.x-.17,uClK9.y,c1)),smoothstep(uBand9.x,uBand9.y,ary));}'); // (CLEAN CITY) en haut le ciel et ses nuages ; en bas, la mer de nuages
const vitreVerre=function(CB){return ''+
  '{vec3 an=abs(vNrm9);float fv=step(an.y,.5)*step(9.,min(vSc9.x,vSc9.z));'+
  'float s1=fract(vSeed9*7.13),s2=fract(vSeed9*13.71),s3=fract(vSeed9*29.37),s4=fract(vSeed9*53.17),sty=s3<.26?0.:s3<.50?1.:s3<.66?2.:s3<.76?3.:4.;'+ // (CLEAN CITY) 26 % VERRE BLEU · 24 % BLANCHE à bandeaux · 16 % LAMES blanches · 10 % SOMBRE · 24 % ARGENT
  'vec2 nh=normalize(vNrm9.xz+vec2(1e-6,0.));float ux=dot(vLoc9.xz,vec2(-nh.y,nh.x));'+                       // le long de la façade (pans de coin compris), en mètres
  'float fh=3.9+s2*.5,cw=sty>3.5?3.+s1*.4:sty>2.5?2.5+s1*.7:1.45+s1*.45;'+                                     // l'ÉTAGE et la TRAVÉE
  'vec2 uv=vec2(ux/cw,(vW9.y+s1*97.)/fh),fw=max(fwidth(uv),vec2(1e-4));'+                                         // les étages comptés dans le MONDE : les volumes empilés d'une tour gardent les mêmes
  'float tt=step(.5,vNrm9.y)*step(9.,min(vSc9.x,vSc9.z)),de=min(min(vSc9.x*.5-abs(vLoc9.x),vSc9.z*.5-abs(vLoc9.z)),(vSc9.x*.5+vSc9.z*.5-vCh9-abs(vLoc9.x)-abs(vLoc9.z))*.7071),fe=max(fwidth(de),1e-4);'+
  'vec3 V9=normalize(vW9-uCam9);vec2 id=floor(uv),f=fract(uv);float far=smoothstep(.3,.75,max(fw.x,fw.y));'+
  'float h1=fract(sin(dot(id+vSeed9*31.,vec2(12.9898,78.233)))*43758.5453),h2=fract(h1*91.7+.13);'+
  'vec3 N9=normalize(vNw9),T9=normalize(vec3(-N9.z,0.,N9.x)+vec3(1e-5,0.,0.)),Np=normalize(N9+(T9*(h1-.5)*.032+vec3(0.,(h2-.5)*.02,0.))*(1.-smoothstep(.06,.22,max(fw.x,fw.y))));'+ // chaque carreau, un miroir un peu désaxé
  'vec3 R9=reflect(V9,Np);float ry=R9.y,fry=max(fwidth(ry),1e-4);'+
  'float ary=abs(ry);vec2 cp=(vW9.xz+R9.xz*(uClH9+(uCam9.y-vW9.y)*sign(ry+1e-5))/max(ary,.02))/uClT9+uClD9;float c1=texture2D(uCl9,cp).r,c2=texture2D(uCl9,cp+uClS9).r;'+ // les NUAGES du plafond (lus hors branche : dérivées sûres)
  '\n#if defined(USE_FOG)&&!defined(FOG_EXP2)\nbool VIS9=fogDepth<fogFar;\n#else\nbool VIS9=true;\n#endif\n'+
  'if(VIS9){'+
  ' if(fv>0.){'+
  '  vec3 sky=mix(mix(uHor9,uMid9,smoothstep(0.,.18,ary)),uZen9,smoothstep(.14,.9,ary));'+ // (v2) la carte est un MIROIR : en bas comme en haut, la bande de ciel puis la mer de nuages // en dessous : la ville noyée de brume
  '  {float cv=smoothstep(uClK9.x,uClK9.y,c1)*uClK9.z;vec3 rel9=mix(uClA9,uClL9,clamp(.55+(c1-c2)*2.4,0.,1.));'+
  CB+ // la fin du ciel renvoyé (VIT_CIEL_B ou VV_CIEL_B)
  // LES TOURS D'EN FACE : le verre renvoie aussi la ville — deux rangées de tours sur l'horizon du reflet (72 et 120 par tour d'horizon), plus sombres que le ciel,
  // leurs étages en filets (et la nuit leurs bureaux) ; c'est ce qui fait un vrai mur de verre (il ne renvoie jamais que du ciel)
  '  {float az=atan(R9.z,R9.x),a1=floor(az*11.46),a2=floor(az*19.1+.5),q1=fract(sin(a1*12.9898)*43758.5453),q2=fract(sin(a2*78.233+1.7)*43758.5453);'+
  '   float hs1=.035+.2*q1*q1,hs2=.015+.08*q2,b1=1.-smoothstep(hs1-fry,hs1+fry,ry),b2=1.-smoothstep(hs2-fry,hs2+fry,ry),bb=max(b1,b2)*step(-.02,ry);'+
  '   vec3 bc=mix(mix(uHor9,uMid9,.35)*mix(.62,.5,b2),fogColor*.9,.25+.35*b2)*(1.-.75*uNuit9);'+               // la tour renvoyée : le ciel assombri (le verre d'en face), le second rang dans la brume
  '   float wy=fract(ry*90.),wx=fract(az*120.),wn=step(.5,fract(sin(floor(ry*90.)*7.1+floor(az*120.)*3.3)*4375.85));'+
  '   bc+=vec3(1.,.82,.56)*wn*step(.25,wy)*step(.3,wx)*uNuit9*.55*(1.-far);'+                                    // la NUIT : leurs bureaux allumés
  '   float q3=fract(sin(a1*91.7+3.3)*43758.5453),q4=fract(sin(a2*17.3+.7)*43758.5453),hu1=uBand9.x*.8+.18*q3,hu2=uBand9.x*.9+.07*q4;'+ // (v2) LA VILLE D'EN HAUT : ses tours pendent dans le reflet, au-dessus de la bande
  '   float bu=max('+(VIT_PLAFOND?'max(smoothstep(hu1-fry,hu1+fry,ry),.5*smoothstep(hu2-fry,hu2+fry,ry))':'0.')+',max(smoothstep(hu1-fry,hu1+fry,-ry),.5*smoothstep(hu2-fry,hu2+fry,-ry))*step(ry,0.))*(1.-smoothstep(.55,.85,ary));'+ // (et leurs miroirs : la ville d'en bas qui monte vers le reflet)
  '   sky=mix(sky,bc,max(bb*(1.-.5*b2*(1.-b1)),bu));}'+
  '  float sd=max(dot(R9,uSun9),0.),gl=(pow(sd,900.)*16.+pow(sd,70.)*.6+pow(sd,6.)*.3)*uSunK9;'+               // l'ÉCLAT du soleil
  '  vec3 tint=sty<.5?vec3(.40,.66,.96):sty<1.5?vec3(.56,.72,.90):sty<2.5?vec3(.48,.70,.94):sty<3.5?vec3(.30,.50,.60):vec3(.82,.88,.96);'+
  '  float rb=sty<.5?.5:sty<1.5?.42:sty<2.5?.46:sty<3.5?.64:.8,cv=abs(dot(V9,Np)),fr=mix(rb,1.,pow(1.-cv,4.));'+ // Fresnel du verre traité : il renvoie déjà la moitié de face
  '  vec3 refl=sky*tint*1.18+gl*uSunC9*mix(tint,vec3(1.),.6);'+
  // L'INTÉRIEUR : un bureau sombre derrière un verre teinté ; la NUIT, les plateaux allumés (des baies entières, des étages qui dorment, les plafonniers en haut)
  '  vec2 ib=vec2(floor(id.x/(sty>2.5?2.:4.)),id.y);float hb=fract(sin(dot(ib+vSeed9*17.,vec2(41.3,97.1)))*31758.5453),hf=fract(sin(id.y*91.7+vSeed9*311.)*43758.5453),on=step(.4,hb)*step(.22,hf);'+
  '  vec3 lc=mix(vec3(1.,.82,.58),vec3(.80,.90,1.),step(.45,fract(s4*3.7+hb*.6)))*(.5+.5*h1);'+ // (CLEAN CITY) des bureaux en LED froide, un peu plus de la moitié
  '  float spd=(sty<.5||(sty>1.5&&sty<2.5))?1.-smoothstep(.25-fw.y,.25+fw.y,f.y):0.;'+                         // l'ALLÈGE : le bas de chaque étage, verre opaque
  '  float blind=step(.86,fract(h1*13.7));vec3 ins=tint*.045*(.6+.8*h1)+lc*(.5+.5*hb)*on*(uNuit9*(.32+.5*smoothstep(.3,.92,f.y)+.55*smoothstep(.86,.93,f.y)*(1.-smoothstep(.93,.97,f.y)))*(1.-.6*blind)+.03)*(1.-spd);'+ // le PLAFONNIER : un filet clair en haut de la baie ; un store sur sept
  '  ins=mix(ins,tint*.045+vec3(1.,.82,.58)*.11*uNuit9,far);'+ // au loin, la lueur moyenne des bureaux (les baies sous le pixel) : une tour sombre qui rougeoie, pas un carton
  '  vec3 glass=mix(ins,refl,fr*(1.-.35*uNuit9));'+
  // LES MONTANTS (la teinte d'instance, éclairée) : travée et étage ; BANDEAUX : 1,3-1,7 m de béton par étage ; le parapet en haut de chaque volume
  '  float mw=sty>3.5?.05:sty>2.5?.09:.075;vec2 hw=vec2(.5-mw/cw,.5-.07/fh);if(sty>.5&&sty<1.5)hw.y=.5-(.9+.3*s2)/fh;'+ // (CLEAN CITY) les tours BLANCHES : 1,8 à 2,4 m de panneau blanc par étage
  '  vec2 dd=(hw-abs(f-.5))/fw;float pane=mix(clamp(dd.x+.5,0.,1.)*clamp(dd.y+.5,0.,1.),4.*hw.x*hw.y,far)*(1.-step(vSc9.y-1.5,vB9));'+
  '  vec3 st=gl_FragColor.rgb*(1.-.6*uNuit9)+sky*tint*.10,colF=mix(st,glass,pane);'+ // (la nuit, le béton et les montants s'éteignent : les bureaux ressortent)
  // LES LAMES : une toutes les deux travées, plus épaisse en rasant (sa profondeur), son OMBRE du côté opposé au soleil
  '  if(sty>1.5&&sty<2.5){float fu=(fract(uv.x*.5+.5)-.5)*2.*cw,fwm=fw.x*cw,lw=.18+.45*(1.-cv),fin=1.-clamp((abs(fu)-lw)/(fwm*2.)+.5,0.,1.);'+
  '   float ss=sign(dot(uSun9.xz,T9.xz)+1e-4),sh=step(0.,-fu*ss)*(1.-smoothstep(lw+.5,lw+.9,abs(fu)));'+
  '   fin=mix(fin,lw/cw,far);colF*=1.-.45*sh*(1.-uNuit9)*(1.-far);colF=mix(colF,st*1.1,fin);}'+
  '  if(an.x>.9||an.z>.9){float hw9=(an.x>an.z?vSc9.z:vSc9.x)*.5-vCh9,pxm=max(fw.x*cw,1e-3);'+ // (CLEAN CITY) sur les faces droites :
  '   colF+=vec3(.25,.62,1.)*(1.-smoothstep(.12,.12+pxm*1.5,hw9-abs(ux)))*step(.5,fract(vSeed9*17.9))*(.1+1.5*uNuit9)*(1.-far);'+ // LES FILETS BLEUS : une tour sur deux a ses arêtes en LED (la nuit surtout)
  '   if(vFo9>.5&&s4>.45){float lw9=min(34.,hw9*1.5),pxl=pxm/(lw9*.5);vec2 q=vec2(ux,vB9-(vSc9.y-lw9*.5-16.))/(lw9*.5);float lk=floor(fract(vSeed9*91.3)*6.),dl=1e3;'+ // LE LOGO : une marque minimaliste près du sommet (inventée)
  '    if(lk<.5)dl=abs(length(q)-.72)-.12;else if(lk<1.5)dl=length(q)-.62;else if(lk<2.5)dl=vitreTri(q);else if(lk<3.5)dl=min(vitreBox(q-vec2(-.34,0.),vec2(.12,.75)),vitreBox(q-vec2(.34,0.),vec2(.12,.75)));'+
  '    else if(lk<4.5)dl=abs(vitreBox(q,vec2(.66)))-.1;else dl=min(length(q-vec2(0.,.42))-.2,vitreBox(q-vec2(0.,-.3),vec2(.62,.1)));'+
  '    float lm=(1.-smoothstep(-pxl,pxl,dl))*(1.-far);colF=mix(colF,mix((sty>.5&&sty<2.5)?vec3(.05,.16,.42):vec3(1.12),vec3(.6,.86,1.)*1.9,uNuit9),lm);}}'+ // bleu profond sur une tour blanche, blanc sur le verre ; la nuit, il s'allume
  '  gl_FragColor.rgb=colF;'+
  ' }'+
  ' if(tt>0.){float hr=fract(sin(dot(floor(vLoc9.xz/6.+vSeed9*7.),vec2(12.9898,78.233)))*43758.5453);'+ // (v2) LE TOIT, vu d'en haut : une dalle sombre et ses blocs techniques, le parapet clair
  '  gl_FragColor.rgb=mix(gl_FragColor.rgb*('+(VIT_PLAFOND?'.36+.16':'.66+.12')+'*step(.72,hr))*(1.-.5*uNuit9),gl_FragColor.rgb,1.-smoothstep(1.2,1.2+fe*1.5,de));'+ // (CLEAN CITY) un toit clair
  '  if(fe<1.4)gl_FragColor.rgb+=vec3(.86,.93,1.)*(1.-smoothstep(.55,.55+fe*1.5,de))*(1.-smoothstep(.5,1.4,fe))*.55*uNuit9;}'+ // la nuit, le parapet s'allume d'un filet blanc
  '}}\n';};
const VIT_VERRE=vitreVerre(VIT_CIEL_B);
/* (NÉON ET VERRE) LE VERRE DE LA VILLE : vers le bas, la rue et ses néons noyés dans la brume (pas de dalles : on est au-dessus du vide) ; un verre
   plus NEUTRE (le bleu du jour mangeait le violet de la ville), les bureaux plus vifs et leur lueur au loin doublée, les filets de LED sur trois tours
   sur quatre, plus forts, à la couleur de la TEINTE (uAcc9), comme les logos et le parapet du toit ; plus de verre que de blanc (VV_STY). */
const VV_CIEL_B='sky=ry>0.?mix(sky,rel9,cv*smoothstep(.015,.12,ry)):mix(uHor9,fogColor*1.05+uAcc9*.16,smoothstep(0.,.35,ary));}';
const VV_VERRE=vitreVerre(VV_CIEL_B).replace('sty=s3<.26?0.:s3<.50?1.:s3<.66?2.:s3<.76?3.:4.',VV_STY)
  .replace('vec3 tint=sty<.5?vec3(.40,.66,.96):sty<1.5?vec3(.56,.72,.90):sty<2.5?vec3(.48,.70,.94):sty<3.5?vec3(.30,.50,.60):vec3(.82,.88,.96);',
           'vec3 tint=sty<.5?vec3(.66,.76,1.):sty<1.5?vec3(.78,.82,.94):sty<2.5?vec3(.72,.80,.98):sty<3.5?vec3(.46,.50,.62):vec3(.94,.95,1.);')
  .replace('vec3 ins=tint*.045*(.6+.8*h1)+lc*(.5+.5*hb)*on*(','vec3 ins=tint*.045*(.6+.8*h1)+lc*1.55*(.5+.5*hb)*on*(')
  .replace('ins=mix(ins,tint*.045+vec3(1.,.82,.58)*.11*uNuit9,far);','ins=mix(ins,tint*.045+vec3(1.,.82,.58)*.24*uNuit9+uAcc9*.05,far);')
  .replace('colF+=vec3(.25,.62,1.)*','colF+=uAcc9*1.4*')
  .replace('step(.5,fract(vSeed9*17.9))*(.1+1.5*uNuit9)','step(.25,fract(vSeed9*17.9))*(.1+1.5*uNuit9)')
  .replace('vec3(.6,.86,1.)*1.9,uNuit9)','mix(uAcc9,vec3(1.),.35)*1.9,uNuit9)')
  .replace('gl_FragColor.rgb+=vec3(.86,.93,1.)*(1.-smoothstep(.55,.55+fe*1.5,de))','gl_FragColor.rgb+=mix(uAcc9,vec3(1.),.3)*1.6*(1.-smoothstep(.55,.55+fe*1.5,de))')
  /* (2026-10-20, VILLE EMBELLIE) L'ÉCHO des néons dans le verre (des bandes verticales de la teinte et de cyan, fortes sous l'œil) et les ÉTAGES TECHNIQUES (une bande de LED tous les 12 à 21 étages sur une géante sur deux) */
  .replace('vec3 refl=sky*tint*1.18+gl*uSunC9*mix(tint,vec3(1.),.6);','vec3 refl=sky*tint*1.18+gl*uSunC9*mix(tint,vec3(1.),.6);'+
    'float bwV=8.+s2*16.,gbV=floor(ux/bwV),hbV=fract(sin(gbV*12.9898+vSeed9*78.233)*43758.5453),sbV=sin(3.14159*fract(ux/bwV)),pkV=smoothstep(.5,.9,hbV)*sbV*sbV,grV=smoothstep(280.,-140.,vW9.y-uCam9.y);'+
    'refl+=mix(uAcc9,vec3(.24,.91,1.),step(.5,fract(hbV*7.3)))*pkV*grV*.26*uEmb9;')
  .replace('gl_FragColor.rgb=colF;','gl_FragColor.rgb=colF;'+
    'if(s4<.45&&vSc9.y>150.){float npV=12.+floor(s2*10.),yyV=vB9/(fh*npV),fyV=max(fwidth(yyV),1e-5),dqV=abs(fract(yyV+.5)-.5),hbV2=.4/npV;'+
    'float lbV=1.-smoothstep(hbV2,hbV2+fyV*1.5,dqV);lbV=mix(lbV,2.*hbV2,smoothstep(.4,1.5,fyV));lbV+=.2*exp(-dqV*npV/1.2)*(1.-smoothstep(.4,1.5,fyV));'+
    'vec3 bcV=s1>.8?vec3(1.,.78,.34):mix(uAcc9,vec3(.24,.91,1.),step(.5,s1));gl_FragColor.rgb+=bcV*lbV*1.15*uNuit9*uEmb9;}');
/* LE PIED DANS LA BRUME : les volumes sont EMPILÉS (voir buildVoxCity), on ne connaît plus le pied de la tour — la brume est une NAPPE posée
   à ~380 m sous la caméra (la route est à ~330 m au-dessus du pied des tours), fondue sur 300 m ; la nuit, la rue l'éclaire à peine. */
/* (CLEAN CITY) ⚠ une tour qui borde un étage de route PLUS HAUT a son pied au-dessus de la caméra : la nappe seule ne le noyait pas — elle flottait,
   le dessous visible (on aurait dit la ville du plafond). Le volume du PIED (et les lames, qui partent du pied) porte un drapeau (vert + 8) :
   son pied se noie comme dans la ville de nuit. */
const VIT_PIED_P='vPb9>.5?vB9:1e5';
const vitrePied=function(pres){if(VIT_SOL)return ''; /* (AU SOL) la tour est POSÉE : son pied se voit, sur les dalles */ return VIT_PIED.replace('float hB=vW9.y-uCam9.y+380.','float hB=min(vW9.y-uCam9.y+380.,'+(pres?VIT_PIED_P:'1e5')+')');};
const VIT_PIED='#ifdef USE_FOG\n{float hB=vW9.y-uCam9.y+380.,hT=uCam9.y+'+(VIT_PLAFOND?2*VIT_HC+380:1e5)+'.-vW9.y;' + // (v2) et la même NAPPE en miroir, au-dessus de la ville d'en haut (couleur du plafond)
  'if(hB<300.){vec3 vd9=normalize(vW9-uCam9);vec3 mc=mix(fogColor,mix(mix(uHor9,uMid9,smoothstep(0.,.18,vd9.y)),uZen9,smoothstep(.14,.9,vd9.y)),smoothstep(.02,.25,vd9.y))'+ // (CLEAN CITY) un pied AU-DESSUS de la caméra se fond dans le CIEL (pas dans la brume de l'horizon : il se découpait)
  '+vec3(.07,.06,.04)*uNuit9*(1.-smoothstep(0.,160.,hB));gl_FragColor.rgb=mix(mc,gl_FragColor.rgb,smoothstep(0.,300.,hB));}'+
  'if(hT<300.)gl_FragColor.rgb=mix(uPlf9,gl_FragColor.rgb,smoothstep(0.,300.,hT));}\n#endif';
function vitreBiseau(cx,cz){const s=((cx*.0131+cz*.0173)%1+1)%1;return ((s*71.3)%1)<=.6;} // la tour (cx,cz) est-elle biseautée ? (le même tirage que le sommet : la graine de son centre)
function vitreMatToursLoin(){ // la tour AU LOIN (voir villeMatToursLoin) : la couleur de la brume, le pied dans la nappe
  if(VIT.mat.toursL)return VIT.mat.toursL;
  const m=new THREE.MeshBasicMaterial({color:0x000000});
  m.onBeforeCompile=function(sh){sh.uniforms.uNuit9=VIT.uNuit;sh.uniforms.uCam9=VIT.uCam;sh.uniforms.uPlf9=VIT.uPlf;sh.uniforms.uZen9=skyU.uJZen;sh.uniforms.uMid9=skyU.uJMid;sh.uniforms.uHor9=skyU.uJHor;
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vW9;')
      .replace('#include <begin_vertex>','#include <begin_vertex>\n#ifdef USE_INSTANCING\nvW9=(modelMatrix*instanceMatrix*vec4(position,1.)).xyz;\n#else\nvW9=(modelMatrix*vec4(position,1.)).xyz;\n#endif\n');
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform float uNuit9;uniform vec3 uCam9,uPlf9,uZen9,uMid9,uHor9;varying vec3 vW9;')
      .replace('#include <fog_fragment>','#include <fog_fragment>\n'+vitrePied(false));};
  m.customProgramCacheKey=function(){return VIT_SOL?'toursLoinVitre3':'toursLoinVitre2';};m.dispose=function(){};
  VIT.mat.toursL=m;return m;
}
function vitreMatTours(){return VIT.mat.tours||(VIT.mat.tours=vitreMatFab(false));}
function vitreMatToursNeon(){return VIT.mat.toursN||(VIT.mat.toursN=vitreMatFab(true));} // (2026-10-18, NÉON ET VERRE) les géantes de verre de LA VILLE
function vitreMatFab(NE){ // NE : le verre de LA VILLE (VV_VERRE, les uniformes VV, le pied de villePied) — sinon celui de la VILLE VITRÉE, tel qu'il était
  vitreNuages();
  const m=new THREE.MeshLambertMaterial({color:0xffffff,emissive:0x05070a});
  m.extensions={derivatives:true};
  const DECL='varying vec3 vLoc9;varying vec3 vNrm9;varying float vB9;varying float vSeed9;varying vec3 vSc9;varying vec3 vW9;varying float vCh9;varying vec3 vNw9;varying float vFo9;varying float vPb9;';
  const SDF='float vitreBox(vec2 p,vec2 b){vec2 d=abs(p)-b;return length(max(d,0.))+min(max(d.x,d.y),0.);}'+ // les formes des logos (distances signées)
    'float vitreTri(vec2 p){const float k=1.7320508;p.x=abs(p.x)-.7;p.y=p.y+.7/k;if(p.x+k*p.y>0.)p=vec2(p.x-k*p.y,-k*p.x-p.y)/2.;p.x-=clamp(p.x,-1.4,0.);return -length(p)*sign(p.y);}';
  const SF='float vitreSF(float fo,float sv,float hh){if(fo<.5)return 1.;if(fo<1.5)return mix(1.,.45+.15*sv,smoothstep(.4,1.,hh));if(fo<2.5)return mix(1.,.72,smoothstep(.3,1.,hh));'+ // l'échelle de la section à la hauteur hh (0 pied, 1 sommet) — la forme vit dans la moitié HAUTE : celle qui sort de la brume
    'if(fo<3.5)return (1.+.16*sin(3.1416*clamp((hh-.4)/.45,0.,1.)))*mix(1.,.5,smoothstep(.8,1.,hh));if(fo<4.5)return mix(1.,.8,smoothstep(.4,1.,hh));return 1.;}';
  m.onBeforeCompile=function(sh){Object.assign(sh.uniforms,{uT9:CITY.uT,uWet9:ROAD_U.uWet,uLum9:CITY.uL,uZen9:skyU.uJZen,uMid9:skyU.uJMid,uHor9:skyU.uJHor,
      uSun9:VIT.uSun,uCam9:VIT.uCam,uNuit9:VIT.uNuit,uSunC9:VIT.uSunC,uSunK9:VIT.uSunK,uCl9:VIT.uCl,uClK9:VIT.uClK,uClL9:VIT.uClL,uClA9:VIT.uClA,uClD9:VIT.uClD,uClS9:VIT.uClS,uClH9:VIT.uClH,uClT9:VIT.uClT,uBand9:VIT.uBand,uPlf9:VIT.uPlf,uHaut9:VIT.uHaut,uSolR9:VIT.uSolR});
    if(NE)Object.assign(sh.uniforms,{uZen9:VV.uZen,uMid9:VV.uMid,uHor9:VV.uHor,uAcc9:VV.uAcc,uNuit9:VV.uNuit,uSunK9:VV.uSunK,uClK9:VV.uClK,uClL9:VV.uClL,uClA9:VV.uClA,uClD9:VV.uClD,uPlf9:VV.uPlf,uPied9:CITY.uPied,uPiedC9:CITY.uPiedC,uEmb9:CITY.uEmb}); // (NÉON ET VERRE) le ciel de la ville, sa teinte, son pied
    sh.vertexShader='#undef USE_SHADOWMAP\n'+sh.vertexShader.replace('#include <common>','#include <common>\n'+DECL+'\nattribute vec2 aCh9;uniform vec4 uLum9[4];uniform float uHaut9;\n#if defined(USE_FOG)&&!defined(FOG_EXP2)\nuniform float fogFar;\n#endif\n'+SF+'\n')
      .replace('#include <color_vertex>','#include <color_vertex>\nfloat fo9=0.;\n#ifdef USE_INSTANCING_COLOR\nfo9=floor(instanceColor.r/8.+.001);vColor.r-=8.*fo9;\n#endif\nvFo9=fo9;vPb9=0.;\n#ifdef USE_INSTANCING_COLOR\nvPb9=floor(instanceColor.g/8.+.001);vColor.g-=8.*vPb9;\n#endif\n') // LA FORME, rangée dans la couleur d'instance (r + 8 × forme)
            .replace('#include <beginnormal_vertex>','#include <beginnormal_vertex>\n#ifdef USE_INSTANCING\n'+
        'vec3 sc9=max(vec3(length(instanceMatrix[0].xyz),length(instanceMatrix[1].xyz),length(instanceMatrix[2].xyz)),vec3(1e-4));vSeed9=fract(instanceMatrix[3].x*.0131+instanceMatrix[3].z*.0173);'+
        'vec3 fl9=vec3(instanceMatrix[0].x<0.?-1.:1.,instanceMatrix[1].y<0.?-1.:1.,1.);\n#else\nvec3 sc9=vec3(1.);vSeed9=0.;vec3 fl9=vec3(1.);\n#endif\n'+ // fl9 : la ville d'EN HAUT (l'instance retournée)
        'float sv9=fract(vSeed9*41.7),hh9=position.y+.5,aF9=(fo9>1.5&&fo9<2.5)?(1.6+1.2*sv9)*smoothstep(.25,1.,hh9)*(sv9<.5?-1.:1.):0.;'+ // la VRILLE : 90 à 160°, dans la moitié haute
        'vec3 nm9=objectNormal;if(abs(nm9.x)>.1&&abs(nm9.z)>.1)nm9=vec3(sign(nm9.x),0.,sign(nm9.z))*.7071;'+ // le pan de coin : 45° en MÈTRES
        'if(abs(nm9.y)<.5&&fo9>.5){float dS9=(vitreSF(fo9,sv9,min(hh9+.01,1.))-vitreSF(fo9,sv9,max(hh9-.01,0.)))/.02;nm9.y=-dS9*.5*min(sc9.x,sc9.z)/sc9.y;'+ // la façade qui s'effile penche
        'float ca9=cos(aF9),sa9=sin(aF9);nm9.xz=vec2(ca9*nm9.x-sa9*nm9.z,sa9*nm9.x+ca9*nm9.z);}'+
        'nm9=normalize(nm9);vNw9=nm9*fl9;objectNormal=nm9*sc9;') // (three divise par l'échelle² puis multiplie par la matrice : la normale du monde en sort)
      .replace('#include <begin_vertex>','#include <begin_vertex>\n'+
        'vCh9=(fo9>3.5&&fo9<4.5)?.29*min(sc9.x,sc9.z):step(fract(vSeed9*71.3),.6)*min(min(sc9.x,sc9.z)*((fo9>1.5&&fo9<2.5)?.08:.16),7.);transformed.xz-=aCh9*vCh9/sc9.xz;'+ // LE BISEAU (RONDE : l'octogone presque régulier)
        'vLoc9=transformed*sc9;vNrm9=normal;if(abs(normal.x)>.1&&abs(normal.z)>.1)vNrm9=vec3(sign(normal.x),0.,sign(normal.z))*.7071;'+ // AVANT la forme : la grille des carreaux suit la façade
        '{vec2 pm9=transformed.xz*sc9.xz*vitreSF(fo9,sv9,hh9);float ca9=cos(aF9),sa9=sin(aF9);transformed.xz=vec2(ca9*pm9.x-sa9*pm9.y,sa9*pm9.x+ca9*pm9.y)/sc9.xz;'+
        'if(fo9>4.5)transformed.y-=step(.49,position.y)*(.05+.08*sv9)*(.5+position.x);}'+ // LAME : le toit en biais
        '\n#ifdef USE_INSTANCING\nvW9=(modelMatrix*instanceMatrix*vec4(transformed,1.)).xyz;\n#else\nvW9=(modelMatrix*vec4(transformed,1.)).xyz;\n#endif\n'+
        'vB9=(transformed.y+.5)*sc9.y;vSc9=sc9;')
      .replace('#include <project_vertex>','#include <project_vertex>\nbool loin9=false;\n'+VILLE_TRI+'if(fl9.y<0.&&uHaut9<.5){gl_Position=vec4(0.,0.,2.,1.);loin9=true;}\n'+ // (banc) dbgVitre(\'haut\') : la ville d'en haut masquée (A/B du coût)
        '#ifdef USE_INSTANCING\nbool proche9=false;{vec3 w9=(modelMatrix*vec4(instanceMatrix[3].xyz,1.)).xyz;float r9=.5*length(sc9)+1.;'+
        'for(int i=0;i<4;i++)if(distance(w9,uLum9[i].xyz)<uLum9[i].w+r9)proche9=true;}\n#else\nbool proche9=true;\n#endif\n')
      .replace('#include <lights_lambert_vertex>','vLightFront=vec3(0.);vIndirectFront=vec3(0.);\nif(!loin9){\n'+VILLE_LLV+'\n}');
    sh.fragmentShader='#undef USE_SHADOWMAP\n'+sh.fragmentShader.replace('#include <common>','#include <common>\nuniform float uT9,uWet9,uNuit9,uSunK9,uClH9,uClT9;uniform vec3 uZen9,uMid9,uHor9,uSun9,uSunC9,uClL9,uClA9,uCam9,uPlf9,uSolR9;uniform vec4 uClK9;uniform vec2 uClD9,uClS9,uBand9;uniform sampler2D uCl9;'+DECL+SDF+(NE?'uniform vec3 uAcc9,uPiedC9;uniform float uPied9,uEmb9;':''))
      .replace('#include <fog_fragment>',(NE?VV_VERRE:VIT_VERRE)+'#include <fog_fragment>\n'+(NE?vvPied():vitrePied(true)));};
  m.customProgramCacheKey=function(){return NE?'toursVerreNeon2':VIT_PLAFOND?'toursVitre2':VIT_SOL?'toursVitre5':'toursVitre4';};m.dispose=function(){};
  return m;
}
/* (NÉON ET VERRE) LE PIED D'UNE GÉANTE DE VERRE, dans la brume de la ville : le code de villePied (le même que les tours de béton, au caractère près),
   mais compté depuis le pied de la TOUR — ses retraits sont EMPILÉS : seul le volume du pied (vert + 8, voir buildVoxCity) a un pied à noyer. */
function vvPied(){return '{float vPd9=vPb9>.5?vB9:1e5;\n'+villePied(function(c){return c;}).split('vB9').join('vPd9')+'\n}';}
function vitreMatToursNeonLoin(){ // (NÉON ET VERRE) la géante AU LOIN (voir villeMatToursLoin) : la brume, et le pied du seul volume du pied — elle a sa couleur par instance
  if(VIT.mat.toursNL)return VIT.mat.toursNL;
  const m=new THREE.MeshBasicMaterial({color:0x000000});
  m.onBeforeCompile=function(sh){sh.uniforms.uWet9=ROAD_U.uWet;sh.uniforms.uPied9=CITY.uPied;sh.uniforms.uPiedC9=CITY.uPiedC;
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying float vB9;varying vec3 vW9;')
      .replace('#include <begin_vertex>','#include <begin_vertex>\n#ifdef USE_INSTANCING\n'+
        'vB9=(position.y+.5)*length(instanceMatrix[1].xyz);vW9=(modelMatrix*instanceMatrix*vec4(position,1.)).xyz;\n#else\nvB9=position.y+.5;vW9=(modelMatrix*vec4(position,1.)).xyz;\n#endif\n'+
        '#ifdef USE_INSTANCING_COLOR\nif(instanceColor.g<7.5)vB9=1e5;\n#endif\n');
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform float uWet9,uPied9;uniform vec3 uPiedC9;varying float vB9;varying vec3 vW9;')
      .replace('#include <fog_fragment>','#include <fog_fragment>\n'+villePied(function(c){return c;}));};
  m.customProgramCacheKey=function(){return 'toursLoinVerreNeon1';};m.dispose=function(){};
  VIT.mat.toursNL=m;return m;
}
/* LE PLAFOND (v2, Léo : « faire la ville avec le plafond de glace, l'effet miroir… une ville qui vient du ciel ; il n'y a même pas de ciel, juste
   un ciel entre les deux ») : une demi-sphère posée sur la caméra, peinte au plan lointain (comme le dôme), après le ciel et derrière tout le
   reste. Dans la BANDE (de l'horizon à ~4°, fondue jusqu'à ~15°) on voit le vrai ciel ; au-dessus, la MER DE NUAGES À L'ENVERS — le miroir de
   celle d'en bas —, devant laquelle pend la ville d'en haut. Le verre renvoie le MÊME plafond (même toile, même hauteur). */
function vitreCiel(){
  if(VIT.ciel)return VIT.ciel;
  vitreNuages();
  const g=new THREE.SphereGeometry(1,40,12,0,Math.PI*2,0,Math.PI*.5);
  const m=new THREE.ShaderMaterial({uniforms:{uCl:VIT.uCl,uClK:VIT.uClK,uClL:VIT.uClL,uClA:VIT.uClA,uClD:VIT.uClD,uClS:VIT.uClS,uClH:VIT.uClH,uClT:VIT.uClT,uSun:VIT.uSun,uHor:skyU.uJHor,uBand:VIT.uBand,uPlf:VIT.uPlf},
    vertexShader:'varying vec3 vD;void main(){vD=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);gl_Position.z=gl_Position.w;}',
    fragmentShader:'uniform sampler2D uCl;uniform vec4 uClK;uniform vec3 uClL,uClA,uSun,uHor,uPlf;uniform vec2 uClD,uClS,uBand;uniform float uClH,uClT;varying vec3 vD;'+(!VIT_PLAFOND?
      /* CLEAN CITY : les cumulus de la v1 — un plafond à 1 400 m, deux lectures + une octave fine ; le verre lit LE MÊME */
      'void main(){vec3 d=normalize(vD);float dy=max(d.y,.008);vec2 cp=(cameraPosition.xz+d.xz*uClH/dy)/uClT+uClD;float c3=texture2D(uCl,cp*3.7+.31).r,c1=texture2D(uCl,cp).r*.78+c3*.22,c2=texture2D(uCl,cp+uClS).r*.78+c3*.2;'+
      'float hz=smoothstep(.008,.16,d.y),cov=smoothstep(uClK.x,uClK.y,c1)*uClK.z*hz;if(cov<.003)discard;'+
      'vec3 col=mix(uClA,uClL,clamp(.55+(c1-c2)*2.4,0.,1.));float sd=max(dot(d,uSun),0.);col+=uClL*pow(sd,12.)*.4*(1.-.6*smoothstep(uClK.x,uClK.y,c1));'+
      'col=mix(uHor,col,.25+.75*smoothstep(.01,.22,d.y));gl_FragColor=vec4(col,cov);}':
      'void main(){vec3 d=normalize(vD);float pl=smoothstep(uBand.x,uBand.y,d.y);if(pl<.003)discard;float dy=max(d.y,.02);vec2 cp=(cameraPosition.xz+d.xz*uClH/dy)/uClT+uClD;'+
      'float c3=texture2D(uCl,cp*3.7+.31).r,c1=texture2D(uCl,cp).r*.78+c3*.22,c2=texture2D(uCl,cp+uClS).r*.78+c3*.2,cv=smoothstep(uClK.x,uClK.y,c1)*uClK.z;'+ // la mer de nuages, vue d'en dessous : relief et creux
      'vec3 col=mix(uPlf,mix(uClA,uClL,clamp(.55+(c1-c2)*2.4,0.,1.)),cv);float sd=max(dot(d,uSun),0.);col+=uClL*pow(sd,10.)*.25;'+ // le soleil (dans la bande) l'allume par en dessous
      'col=mix(uHor,col,smoothstep(uBand.x,uBand.y+.12,d.y));gl_FragColor=vec4(col,pl);}'), // au bord de la bande, le plafond se fond dans la brume du ciel
    transparent:true,depthWrite:false,depthTest:true,fog:false,side:THREE.BackSide});
  m.customProgramCacheKey=function(){return VIT_PLAFOND?'vitreCiel2':'vitreCiel1';};
  const o=new THREE.Mesh(g,m);o.name='ville vitrée plafond';o.frustumCulled=false;o.renderOrder=-2;o.scale.setScalar(8000);o.visible=false;scene.add(o);VIT.ciel=o;return o;}
/* ⚠ three r128 n'envoie PAS `cameraPosition` aux matières Lambert (setProgram : seulement Shader/Phong/Toon/Standard ou avec envMap) — dans le
   verre il valait (0,0,0) : la direction du regard partait de l'origine du monde. La vraie caméra du rendu, posée avant chaque rendu de la scène. */
{const ob9=scene.onBeforeRender;scene.onBeforeRender=function(r9,s9,cam,rt){ob9.call(this,r9,s9,cam,rt);if(cam&&cam.matrixWorld)VIT.uCam.value.setFromMatrixPosition(cam.matrixWorld);};} // CHAÎNÉ (jamais réassigné)
/* LE DIRIGEABLE (CLEAN CITY, Léo : « une sorte d'avion-ballon, énorme, très moderne : le futur, l'avancement, la technologie ») : UN seul, blanc,
   lisse, une ligne de lumière BLEUE sur chaque flanc, ailerons fins, nacelle vitrée, un logo minimaliste (un anneau et un point, inventé).
   ~1 200 triangles, matières de base (Lambert, Basic : compilées au menu). Il croise au-dessus de la ville, DEVANT la caisse sur la
   piste (1,7 km devant, 130 m au-dessus, 200 m de côté), d'un côté puis de l'autre, et avance lentement ; une fois dépassé il reprend sa place loin devant (il réapparaît dans la brume). */
function vitreDirigeable(){
  if(VIT.dir)return VIT.dir;
  const g=new THREE.Group(),Lh=230,Rh=31,M=function(c,e){return new THREE.MeshLambertMaterial({color:c,emissive:e||0x000000});};
  const blanc=M(0xf2f5f9,0x0b0f16),gris=M(0xc9d0da),bleu=new THREE.MeshBasicMaterial({color:0x4cb6ff}),vitre=new THREE.MeshBasicMaterial({color:0x9fdcff});
  const rayon=function(u){return Rh*Math.pow(Math.max(0,Math.sin(Math.PI*u)),.62)*(1-.2*u);};
  const prof=[];for(let i=0;i<=16;i++){const u=i/16;prof.push(new THREE.Vector2(Math.max(.05,rayon(u)),(u-.5)*Lh));}
  const coque=new THREE.Mesh(new THREE.LatheGeometry(prof,20),blanc);coque.rotation.x=Math.PI/2;g.add(coque); // l'axe de la coque : +z (le nez devant… la queue au bout du profil)
  for(const sg of [-1,1]){const b=new THREE.Mesh(new THREE.BoxGeometry(1.4,1.4,Lh*.62),bleu);b.position.set(sg*(Rh*.985),-2,Lh*.02);g.add(b); // la ligne de lumière
    const u=.62,r=rayon(u)+.6,an=new THREE.Mesh(new THREE.RingGeometry(9,12.5,32),new THREE.MeshBasicMaterial({color:0xffffff,side:THREE.DoubleSide}));an.position.set(sg*r,6,(u-.5)*Lh);an.rotation.y=sg*Math.PI/2;g.add(an); // le logo : un anneau…
    const pt=new THREE.Mesh(new THREE.CircleGeometry(3.6,20),bleu);pt.position.set(sg*(r+.2),6,(u-.5)*Lh);pt.rotation.y=sg*Math.PI/2;g.add(pt);} // …et un point
  const zq=-Lh*.41;
  for(const [sx,sy] of [[1,0],[-1,0],[0,1],[0,-1]]){const a=new THREE.Mesh(new THREE.BoxGeometry(sx?28:1.6,sx?1.6:28,26),gris);a.position.set(sx*(rayon(.09)+11),sy*(rayon(.09)+11),zq);g.add(a);} // les ailerons
  const nac=new THREE.Mesh(new THREE.BoxGeometry(12,6,40),blanc);nac.position.set(0,-Rh-1.5,14);g.add(nac); // la nacelle
  const fen=new THREE.Mesh(new THREE.BoxGeometry(12.3,1.6,34),vitre);fen.position.set(0,-Rh-1.2,14);g.add(fen); // ses vitres
  const nav=new THREE.Mesh(new THREE.SphereGeometry(1.8,8,6),bleu);nav.position.set(0,rayon(.1)+11+14,zq-6);g.add(nav);VIT.nav=nav; // le feu de navigation (bleu, il bat)
  g.traverse(function(o){if(o.isMesh){o.frustumCulled=false;o.matrixAutoUpdate=true;}});
  g.name='ville vitrée dirigeable';g.visible=false;scene.add(g);VIT.dir=g;
  VIT.Fd={p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()};VIT.dirS=null;VIT.dirC=0;VIT.dirT=0;return g;}
function vitreDirTick(d){
  const DZ9=CITY.dz&&CITY.dz.genre==='vitree'?CITY.dz:null; // (2026-10-20, LE DÉCOR AU HASARD) le dirigeable tiré : aucun, comme avant, haut, rasant
  if(DZ9&&!DZ9.dir){if(VIT.dir&&VIT.dir.visible)VIT.dir.visible=false;return;}
  const g=vitreDirigeable();g.visible=true;
  if(VIT.dirS==null||s>VIT.dirS-150||VIT.dirS>s+5200){VIT.dirS=Math.min(L-80,s+1700);VIT.dirC++;VIT.dirT=0; // dépassé (ou nouvelle piste) : loin devant, de l'autre côté
    VIT.dirY=0;if(VIT_SOL&&CITY.solY!=null&&VIT.tours){frameAt(VIT.dirS,VIT.Fd);const p9=VIT.Fd.p;let mx=CITY.solY+620; // (AU SOL) il croise AU-DESSUS des géantes qui l'entourent (jamais dans une tour)
      for(const t9 of VIT.tours){const dx=t9[0]-p9.x,dz=t9[1]-p9.z;if(dx*dx+dz*dz<520*520&&t9[5]+60>mx)mx=t9[5]+60;}VIT.dirY=mx;}}
  VIT.dirT+=d;frameAt(VIT.dirS,VIT.Fd);const F9=VIT.Fd,h=Math.hypot(F9.t.x,F9.t.z)||1,tx=F9.t.x/h,tz=F9.t.z/h,sg=(VIT.dirC%2)?1:-1;
  const lat9=DZ9?DZ9.dir[0]:200,dh9=DZ9?DZ9.dir[1]:0;
  g.position.set(F9.p.x-tz*sg*lat9+tx*VIT.dirT*7,(VIT.dirY||F9.p.y+130)+dh9+Math.sin(VIT.uT.value*.3)*3,F9.p.z+tx*sg*lat9+tz*VIT.dirT*7);
  g.rotation.set(0,Math.atan2(tx,tz),Math.sin(VIT.uT.value*.21)*.02);
  if(VIT.nav)VIT.nav.visible=(VIT.uT.value%1.6)<.25;
}
function vitreTick(dt,sim){
  villeVerreTick(dt); // (2026-10-18) LA VILLE, NÉON ET VERRE : le ciel que renvoient ses géantes de verre
  const on=vitreOn()&&!!CITY.root;
  VIT.solK+=((on?1:0)-VIT.solK)*Math.min(1,dt*1.2);if(VIT.solK<.001)VIT.solK=0; // le soleil de l'heure, fondu (lu par canyonSoleil)
  if(!on){if(VIT.ciel&&VIT.ciel.visible)VIT.ciel.visible=false;if(VIT.dir&&VIT.dir.visible)VIT.dir.visible=false;return;}
  const d=sim?dt:0;VIT.uT.value+=d;
  VIT.uSun.value.copy(SUN_DIR);VIT.uNuit.value=LVL.nuit||0;
  VIT.uSunC.value.set(sun.color.r,sun.color.g,sun.color.b).multiplyScalar(Math.min(1.6,sun.intensity));
  const M=VIT_MET[(LVL.cur&&LVL.cur.meteo)||VIT.met]||VIT_MET.midi,k=Math.min(1,dt*1.5+(VIT.neuf?1:0)),K=VIT.uClK.value;VIT.neuf=false; // (au portail : posé d'un coup, ensuite il glisse)
  const nu9=CITY.dz&&CITY.dz.genre==='vitree'?CITY.dz.nu:0; // (2026-10-20, LE DÉCOR AU HASARD) les nuages tirés : le seuil de couverture décalé
  K.x+=(M.k[0]+nu9-K.x)*k;K.y+=(M.k[1]+nu9-K.y)*k;K.z+=(M.k[2]-K.z)*k;VIT.uSunK.value+=(M.s-VIT.uSunK.value)*k;
  {const P=VIT.uPlf.value;P.x+=(M.p[0]-P.x)*k;P.y+=(M.p[1]-P.y)*k;P.z+=(M.p[2]-P.z)*k;} // la couleur du plafond
  const L=VIT.uClL.value,A=VIT.uClA.value;L.x+=(M.l[0]-L.x)*k;L.y+=(M.l[1]-L.y)*k;L.z+=(M.l[2]-L.z)*k;A.x+=(M.a[0]-A.x)*k;A.y+=(M.a[1]-A.y)*k;A.z+=(M.a[2]-A.z)*k;
  VIT.sol[0]+=(M.sol[0]-VIT.sol[0])*k;VIT.sol[1]+=(M.sol[1]-VIT.sol[1])*k; // le soleil de l'heure (posé par canyonSoleil)
  if(VIT_SOL){const g9=VIT_SOLC[(LVL.cur&&LVL.cur.meteo)||VIT.met]||VIT_SOLC.midi,C=VIT.uSolC.value;C.x+=(g9[0]-C.x)*k;C.y+=(g9[1]-C.y)*k;C.z+=(g9[2]-C.z)*k; // (AU SOL) les dalles de l'heure
    const sc=VIT.uSunC.value,z=skyU.uJZen.value,dy=Math.max(0,SUN_DIR.y)*.9,am=1-.82*(LVL.nuit||0),Lg=VIT.uSolL.value;Lg.set(sc.x*dy+(.36+z.x*.1)*am,sc.y*dy+(.37+z.y*.1)*am,sc.z*dy+(.38+z.z*.1)*am); // leur lumière : le soleil d'en haut, un ciel presque blanc (le bleu du zénith teintait tout en lavande)
    VIT.uSolR.value.set(C.x*Lg.x,C.y*Lg.y,C.z*Lg.z);} // ce que le verre renvoie vers le bas
  VIT.uClD.value.x+=d*.0016;VIT.uClD.value.y+=d*.0007; // le vent pousse les nuages (et leurs reflets avec eux)
  {const s=VIT.uSun.value,h=Math.hypot(s.x,s.z)||1;VIT.uClS.value.set(s.x/h*.012,s.z/h*.012);} // le côté au soleil : une lecture décalée vers lui
  const c=vitreCiel();c.visible=true;c.position.copy(camera.position);
  if(!VIT_PLAFOND)vitreDirTick(d);
}
function vitreChauffe(){ // au menu (chauffeDivers) : les trois matières de la VILLE VITRÉE compilées et dessinées une fois hors écran — 0 programme en course
  const L9=[],add=function(o){o.position.copy(camera.position);camera.getWorldDirection(VIT.v1);o.position.addScaledVector(VIT.v1,30);scene.add(o);L9.push(o);};
  {const im=new THREE.InstancedMesh(vitreGeo(),vitreMatTours(),1);im.setMatrixAt(0,VIT.m4.identity());im.setColorAt(0,VIT.c.set(1,1,1));add(im);}
  {const im=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),vitreMatToursLoin(),1);im.setMatrixAt(0,VIT.m4.identity());add(im);}
  if(VIT_SOL){add(new THREE.Mesh(new THREE.PlaneGeometry(4,4).rotateX(-Math.PI/2),vitreSolMat()));const im=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),vitrePilMat(),1);im.setMatrixAt(0,VIT.m4.identity());add(im);} // (AU SOL) le sol et les piliers
  const c=vitreCiel();c.visible=true;L9.push(c);
  const dg=vitreDirigeable();dg.visible=true;dg.position.copy(camera.position);camera.getWorldDirection(VIT.v1);dg.position.addScaledVector(VIT.v1,300);L9.push(dg); // le dirigeable
  try{chauffeRendu(L9);}catch(e){}
  for(const o of L9){if(o===dg)dg.visible=false;else if(o===c)c.visible=false;else{scene.remove(o);if(o.geometry!==VIT.geo)o.geometry.dispose();}}
}
window.dbgVitre=function(k,v){ // console : l'état de la VILLE VITRÉE · ('nuages',{k:[…],l:[…],a:[…]}) les nuages de l'heure à chaud · ('ciel') cacher/montrer la couche
  if(k==='nuages'&&v){const M=VIT_MET[(LVL.cur&&LVL.cur.meteo)||'midi'];Object.assign(M,v);VIT.neuf=true;return M;}
  if(k==='tours'&&VIT.tours){const c=carGroup.position;return VIT.tours.filter(function(t){return v==null||t[3]===v;}).map(function(t){return [Math.round(t[0]),Math.round(t[1]),Math.round(t[2]),t[3],Math.round(Math.hypot(t[0]-c.x,t[1]-c.z)),Math.round(t[4]),+(((t[0]*.0131+t[1]*.0173)%1+1)%1).toFixed(5)];}).sort(function(a,b){return a[4]-b[4];}).slice(0,12);} // (banc) les tours les plus proches de la caisse (d'une forme)
  if(k==='progs')return (renderer.info.programs||[]).map(function(p){var k9=String(p.cacheKey).replace(/\n/g,' ');return (p.name||'')+' | '+k9.slice(0,40)+' … '+k9.slice(-90);}); // (banc) les programmes compilés (pour traquer une compilation en course)
  if(k==='haut'){VIT.uHaut.value=VIT.uHaut.value>.5?0:1;return VIT.uHaut.value;} // (banc) la ville d'en haut masquée / rendue (le loin, couleur de brume, reste)
  if(k==='dir'&&VIT.dir)return {p:VIT.dir.position.toArray().map(Math.round),visible:VIT.dir.visible,devant:VIT.dirS!=null?Math.round(VIT.dirS-s):null}; // (banc) où est le dirigeable
  if(k==='ciel'&&VIT.ciel){VIT.ciel.material.visible=!VIT.ciel.material.visible;return VIT.ciel.material.visible;}
  if(k==='sol')return {on:VIT_SOL,solY:CITY.solY!=null?Math.round(CITY.solY):null,ponts:vitreAplanir.ponts||0,piliers:VIT.pilN||0,dirY:Math.round(VIT.dirY||0),mort:mortCause,y:Math.round(carGroup.position.y)}; // (banc) la ville au sol
  if(k==='pts'){const o=[],st=v||4;for(let i=0;i<NP;i+=st)o.push([Math.round(pts[i].x),Math.round(pts[i].y),Math.round(pts[i].z)]);return {L:Math.round(L),NP:NP,pas:st,p:o};} // (banc) la route, un point sur `v`
  if(k==='rayon'){const rc=new THREE.Raycaster();rc.setFromCamera(new THREE.Vector2(v[0]/VP.w*2-1,1-v[1]/VP.h*2),camera);const L=[],M=new THREE.Matrix4(); // (banc) ce qu'il y a sous le pixel (x,y) : quelle pièce de quelle tour
    for(const F of CITY.fam||[])for(const im of [F.im,F.imL])for(const h of rc.intersectObject(im).slice(0,4)){im.getMatrixAt(h.instanceId,M);const e=M.elements;L.push({im:im===F.im?'pres':'loin',fam:CITY.fam.indexOf(F),id:h.instanceId,d:Math.round(h.distance),
      taille:[Math.hypot(e[0],e[1],e[2]),Math.hypot(e[4],e[5],e[6]),Math.hypot(e[8],e[9],e[10])].map(Math.round),centre:[e[12],e[13],e[14]].map(Math.round)});}
    if(!L.length)for(const h of rc.intersectObjects(scene.children,true).slice(0,5))L.push({objet:h.object.name||h.object.type,parent:h.object.parent&&(h.object.parent.name||h.object.parent.type),d:Math.round(h.distance),visible:h.object.visible}); // pas une tour : quoi d'autre ?
    return L.sort(function(a,b){return a.d-b.d;}).slice(0,6);}
  return {on:vitreOn(),ville:!!CITY.root,deco:CITY.dz&&CITY.dz.genre==='vitree'?CITY.deco:null,meteo:LVL.cur&&LVL.cur.meteo,ciel:BIO.name,nuages:VIT.uClK.value.toArray().map(function(x){return +x.toFixed(2);}),eclat:+VIT.uSunK.value.toFixed(2),nuit:+VIT.uNuit.value.toFixed(2),
    couche:!!(VIT.ciel&&VIT.ciel.visible),ville9:CITY.n};};
