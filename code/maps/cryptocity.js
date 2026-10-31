/* ================================ CRYPTOCITY — LE JOUR DE LA VILLE ================================
   (2026-10-13, Léo : « avec le même système de génération automatique que les autres maps, génère une ville mais avec un twist majeur :
   c'est CRYPTOCITY, mais en BULL RUN »). (2026-10-31, Sacha : « fusionne la map. Crypto City n'existe plus — tu la fusionnes avec la ville
   normale, la ville la nuit. Le jour, certains éléments de Crypto City, mais discrets : quelques bougies, quelques trucs Bitcoin, et on
   enlève le taureau ») LA FUSION : Crypto City n'est plus une map à part — `crypto:1` (sur le niveau « ville ») n'est plus qu'un temps de
   JOUR de LA VILLE (SF_CARTES.ville, voir niveaux.js), reconnu par `cryptoOn()`. Ce qui en reste :
   · LE CIEL DU BULL RUN (biome `bullrun`, inchangé) : le jour d'altitude, un azur profond, l'horizon et la brume en OR.
   · LES TOURS ET RÉCLAMES SONT CELLES DE LA VILLE (plus de verre/or/argent/métal dédié, plus d'atlas de réclames à part : la ville garde
     ses tours et son enseigne ₿ déjà dans villePubAtlas) — voir buildVoxCity.
   · QUELQUES BOUGIES, discrètes : une poignée de graphiques en chandelles japonaises le long de la route (voir `cryptoPlace`), et de loin en
     loin une tour de la forêt qui en devient une (`cryptoTour`).
   · LE TAUREAU, LES PIÈCES ₿ GÉANTES, LES DIAMANTS, LES DIRIGEABLES, LES FUSÉES, LES FEUX D'ARTIFICE ET LE NOUVEL ATH SONT RETIRÉS DU CODE.
   · L'HORIZON LOINTAIN (tours et bougies en silhouette, projecteurs de nuit) reste : voir cryptocity-embellie.js.
   · LA PLUIE D'ARGENT (`PLA`) : voir pluie-argent.js (inchangée).
   Console : `dbgCrypto()`. */
const CRYPTO={root:null,res:[],toits:[],bougies:null,
  sites:null,colExtra:[],jeter:[],rf:null,tick:null,mat:{},
  uT:{value:0},uSun:{value:new THREE.Vector3().copy(SUN_DIR)},uNuit:{value:0},
  m4:new THREE.Matrix4(),c:new THREE.Color()};
function cryptoOn(){return !!(LVL.cur&&LVL.cur.crypto&&!PARK.on);}
function cryptoReserve(x,z,r){const R=CRYPTO.res;for(let i=0;i<R.length;i+=3){const dx=x-R[i],dz=z-R[i+1],q=R[i+2]+r;if(dx*dx+dz*dz<q*q)return true;}return false;}
function cryptoVide(){ // (buildVoxCity, à chaque piste) ce que la ville d'avant avait de crypto s'en va avec elle
  for(const o of CRYPTO.jeter){try{if(o.isInstancedMesh)o.dispose();else if(o.geometry)o.geometry.dispose();}catch(e){}}
  CRYPTO.jeter.length=0;CRYPTO.res.length=0;CRYPTO.toits.length=0;CRYPTO.colExtra.length=0;
  CRYPTO.bougies=null;CRYPTO.sites=null;CRYPTO.root=null;
  crhVide(); // (2026-10-21) l'horizon et les projecteurs de la ville d'avant s'en vont aussi
}
/* LE PLAN — appelé par buildVoxCity AVANT les tours (`proches` = sa grille de la piste) : où vont les quelques bougies, discrètes.
   (2026-10-31) Retiré avec le taureau : les taureaux eux-mêmes, les pièces ₿ géantes, les diamants et les dirigeables. Chaque site vérifie
   qu'aucun étage de la route ne le traverse (`libre`) et se RÉSERVE : les tours qui tomberaient dessus sont bâties puis retirées. */
function cryptoPlace(seed,proches){
  const cr=mulberry32(seed^0xB0117A11),S={bougies:[]},dS=L/(NP-1),iE=CITY.entree?CITY.entree[1]:0;
  CRYPTO.res.length=0;CRYPTO.rf=mulberry32(seed^0xF0E57B0);CRYPTO.sd=seed;
  const libre=function(x,z,R,y0,y1){let ok=true;proches(x,z,R,function(i){if(!ok)return;const p=pts[i],dx=p.x-x,dz=p.z-z;if(dx*dx+dz*dz<R*R&&p.y>y0-45&&p.y<y1+45)ok=false;});return ok;};
  const cadre=function(i){const T9=T[i],hl=Math.hypot(T9.x,T9.z)||1;return {px:-T9.z/hl,pz:T9.x/hl,tx:T9.x/hl,tz:T9.z/hl};};
  const ix=function(f){return Math.min(NP-2,Math.max(iE+6,Math.floor(f*NP)));};
  // LE GRAPHIQUE : UNE poignée de bougies, discrètes — une seule rangée, vers le milieu de la piste (une bougie tous les ~90 m), une rouge
  {const F0=.5,i0=ix(F0+(cr()-.5)*.05),sg=cr()<.5?-1:1,lat0=ROAD_HALF+115+cr()*90,pas=Math.max(1,Math.round(90/dS)),n=5,r1=1+((cr()*3)|0);
    let niv=pts[i0].y-150;
    for(let k=0;k<n;k++){const i=Math.min(NP-1,i0+k*pas),c=cadre(i),lat=lat0+(cr()-.5)*14,x=pts[i].x+c.px*sg*lat,z=pts[i].z+c.pz*sg*lat;
      const rouge=k===r1&&k<n-2,h=rouge?14+cr()*16:28+cr()*52,y0=rouge?niv-h:niv,y1=y0+h,mh=12+cr()*28,mb=8+cr()*22,w=16+cr()*6;
      if(cryptoReserve(x,z,w*.75)||!libre(x,z,w*.75+4,y0-mb,y1+mh)){niv+=rouge?-h*.5:h*.7;continue;}
      S.bougies.push({x:x,z:z,y0:y0,y1:y1,mh:mh,mb:mb,w:w,rouge:rouge});CRYPTO.res.push(x,z,w*.75+3);
      niv=rouge?y0+h*.3:y1-h*.22+cr()*8;}}
  CRYPTO.sites=S;return S;
}
// la tour (cx,cz) qu'on vient de bâtir : retirée si elle tombe sur un site ; dans la forêt, une tour sur trente devient une BOUGIE discrète (rend vrai = retirée)
function cryptoTour(cx,cz,hd,b,t,canyon){
  if(cryptoReserve(cx,cz,hd))return true;
  const H=t-b;
  if(!canyon&&CRYPTO.rf()<.033&&H>160){const w=Math.max(14,Math.min(30,hd*.75)),rouge=CRYPTO.rf()<.16,y1=t-20-CRYPTO.rf()*40,y0=Math.max(b+40,y1-(rouge?50:90+CRYPTO.rf()*160));
    CRYPTO.sites.bougies.push({x:cx,z:cz,y0:y0,y1:y1,mh:14+CRYPTO.rf()*30,mb:Math.min(y0-b,30+CRYPTO.rf()*90),w:w,rouge:rouge});return true;}
  if(H>200&&CRYPTO.toits.length<1800)CRYPTO.toits.push(cx,t,cz);
  return false;
}
function cryptoColBougies(){ // les bougies sont DURES, comme les tours (villeHeurt les lit dans CITY.col)
  const X=CRYPTO.colExtra;X.length=0;if(!CRYPTO.sites)return X;
  for(const b of CRYPTO.sites.bougies){const yb=b.y0-b.mb,yt=b.y1+b.mh;X.push(b.x,(b.y0+b.y1)/2,b.z,b.w,b.y1-b.y0,b.w);X.push(b.x,(yb+yt)/2,b.z,3,yt-yb,3);}
  return X;
}
// (2026-10-31) LES TOURS DE VERRE/OR ET LES RÉCLAMES DU BULL RUN SONT RETIRÉES : la ville garde ses tours et son enseigne ₿ (villeMatTours/villePubAtlas, voir jade-balade.js).
// LES PICTOS CASH (dessinés au pinceau) — ce qui reste de l'atlas des réclames du bull run : `btc`/`eth`, repris par la pluie d'argent
// (plaBilletBtc, plaTexPieces, voir pluie-argent.js) ; `up`/`fusee`/`taureau`/`diam`/`bougies`/`lune` sont retirés avec les réclames.
function cryptoPicto(x,k,cx,cy,s,col){x.save();x.translate(cx,cy);x.fillStyle=x.strokeStyle=col;x.lineWidth=s*.12;x.lineJoin='round';
  if(k==='btc'){x.beginPath();x.arc(0,0,s*.55,0,6.283);x.fill();x.fillStyle='#08130c';x.font=Math.round(s*.6)+'px "Press Start 2P",monospace';x.textAlign='center';x.textBaseline='middle';x.fillText('B',s*.03,s*.04);
    x.fillRect(-s*.16,-s*.47,s*.08,s*.16);x.fillRect(s*.04,-s*.47,s*.08,s*.16);x.fillRect(-s*.16,s*.3,s*.08,s*.16);x.fillRect(s*.04,s*.3,s*.08,s*.16);}
  else if(k==='eth'){x.beginPath();x.moveTo(0,-s*.6);x.lineTo(s*.36,0);x.lineTo(0,s*.18);x.lineTo(-s*.36,0);x.closePath();x.fill();x.beginPath();x.moveTo(-s*.36,s*.1);x.lineTo(0,s*.3);x.lineTo(s*.36,s*.1);x.lineTo(0,s*.6);x.closePath();x.fill();}
  x.restore();}
// LES BOUGIES : un prisme de verre qui s'allume du bas vers le haut, ses arêtes plus claires, des données qui montent dedans
function cryptoMatBougie(){
  if(CRYPTO.mat.bougie)return CRYPTO.mat.bougie;
  const m=new THREE.MeshBasicMaterial({color:0xffffff});
  m.extensions={derivatives:true};
  m.onBeforeCompile=function(sh){sh.uniforms.uT9=CRYPTO.uT;
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vL9,vN9,vC9;')
      .replace('#include <begin_vertex>','#include <begin_vertex>\n#ifdef USE_INSTANCING\nvC9=vec3(length(instanceMatrix[0].xyz),length(instanceMatrix[1].xyz),length(instanceMatrix[2].xyz));\n#else\nvC9=vec3(1.);\n#endif\nvL9=position*vC9;vN9=normal;');
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform float uT9;varying vec3 vL9,vN9,vC9;')
      .replace('#include <fog_fragment>','{vec3 an=abs(vN9);vec2 p=an.y>.5?vL9.xz:(an.x>an.z?vL9.zy:vL9.xy),hs=an.y>.5?vC9.xz*.5:(an.x>an.z?vC9.zy:vC9.xy)*.5;'+
        'vec2 e=hs-abs(p),fe=max(fwidth(p),vec2(1e-3));float ar=1.-smoothstep(0.,max(fe.x,fe.y)*2.5+.6,min(e.x,e.y));'+
        'float h=clamp(vL9.y/vC9.y+.5,0.,1.),sc=smoothstep(.9,1.,fract(vL9.y*.03-uT9*.3))*step(9.,vC9.x),me=step(vC9.x,5.);'+ // me : la MÈCHE (pleine lumière)
        'float k9=mix((.16+.30*h+.22*sc)+1.25*ar+.7*step(.5,an.y),1.,me);gl_FragColor.rgb*=k9;}\n#include <fog_fragment>');};
  m.customProgramCacheKey=function(){return 'bougiesCrypto1';};m.dispose=function(){};
  CRYPTO.mat.bougie=m;return m;
}
/* LES CONSTRUCTIONS DU NIVEAU — après les tours (buildVoxCity) : les bougies, dans le groupe de la ville (il part avec la piste) */
function cryptoBatit(root){
  const S=CRYPTO.sites;if(!S)return;CRYPTO.root=root;const M4=CRYPTO.m4,c=CRYPTO.c;
  const nb=S.bougies.length;
  if(nb){const im=new THREE.InstancedMesh(CRYPTO_G.cube,cryptoMatBougie(),nb*2);
    for(let k=0;k<nb;k++){const b=S.bougies[k];
      M4.makeScale(b.w,b.y1-b.y0,b.w);M4.setPosition(b.x,(b.y0+b.y1)/2,b.z);im.setMatrixAt(2*k,M4);c.setRGB(b.rouge?1.3:.12,b.rouge?.12:1,b.rouge?.18:.42);im.setColorAt(2*k,c);
      const yb=b.y0-b.mb,yt=b.y1+b.mh;M4.makeScale(3,yt-yb,3);M4.setPosition(b.x,(yb+yt)/2,b.z);im.setMatrixAt(2*k+1,M4);c.setRGB(b.rouge?1.2:.35,b.rouge?.35:1.2,b.rouge?.4:.6);im.setColorAt(2*k+1,c);}
    im.instanceMatrix.needsUpdate=true;im.instanceColor.needsUpdate=true;im.frustumCulled=false;root.add(im);CRYPTO.bougies=im;CRYPTO.jeter.push(im);}
  crhBatit(); /* (2026-10-21) l'horizon du bull run et les projecteurs de la nuit : voir cryptocity-embellie */
}
const CRYPTO_G={cube:new THREE.BoxGeometry(1,1,1)};
/* LE TEMPS DE CRYPTOCITY — l'heure des bougies (uT, uSun, uNuit : lues par cryptoMatBougie et par l'horizon de cryptocity-embellie),
   et l'horizon lointain (crhTick), qui vivent même quand ce n'est pas le jour (ils s'effacent alors). */
function cryptoTick(dt,sim){
  const on=cryptoOn()&&!!CRYPTO.root;
  if(!on){crhTick(CRYPTO.uT.value,false);return;}
  const d=sim?dt:0;CRYPTO.uT.value+=d;CRYPTO.uSun.value.copy(SUN_DIR);CRYPTO.uNuit.value=LVL.nuit||0;
  crhTick(CRYPTO.uT.value,true);
}
function cryptoChauffe(){ // au menu (chauffeDivers) : la matière des bougies et l'horizon compilés et dessinés une fois hors écran — 0 programme en course
  const L9=[],dir9=new THREE.Vector3();
  const add=function(o){o.position.copy(camera.position);camera.getWorldDirection(dir9);o.position.addScaledVector(dir9,30);scene.add(o);L9.push(o);};
  {const im=new THREE.InstancedMesh(CRYPTO_G.cube,cryptoMatBougie(),1);im.setMatrixAt(0,CRYPTO.m4.identity());im.setColorAt(0,CRYPTO.c.set(1,1,1));add(im);}
  crhChauffe(add);
  try{chauffeRendu(L9);}catch(e){}
  for(const o of L9)scene.remove(o);
}
window.dbgCrypto=function(k,v){ // console : l'état de CRYPTOCITY (allégé — voir cryptocity-embellie.js pour 'horizon'/'masque'/'route'/'cout')
  if(k==='pluie'){plaSurge(v||6);return PLA.dens;}
  if(k==='sansPluie'){PLA.off=!PLA.off;return PLA.off;}
  if(k==='sites'){const S=CRYPTO.sites;return S?{bougies:S.bougies.slice(0,40).map(function(b){return [Math.round(b.x),Math.round(b.y0),Math.round(b.z),Math.round(b.y1-b.y0)];})}:null;}
  return {on:cryptoOn(),ville:!!CITY.root,bougies:CRYPTO.sites?CRYPTO.sites.bougies.length:0,toits:CRYPTO.toits.length/3,reserve:CRYPTO.res.length/3,pluie:{dens:+PLA.dens.toFixed(2),surge:+PLA.surge.toFixed(1),n:PLA.N,np:PLA.NP}};
};
