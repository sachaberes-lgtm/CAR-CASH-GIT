/* ===== LES AUTOROUTES DU MONDE (2026-11-15, Sacha : « la peinture qui a été mise sur la route est pas mal, j'en veux plus ; pour
   l'instant on a fait des autoroutes américaines ; une dizaine en plus, d'autres pays ; discret mais visible, le même niveau de rendu ;
   montre-moi 20 maquettes avant ») =====
   UNE MAQUETTE = UN PLAN : une fonction qui pose, sur la vraie route, des TRAITS (pleins ou en tirets, de la largeur, de la couleur et du pas
   du pays), des FONDS (une voie teintée), des PLOTS, des MOTIFS (chevrons, hachures), des POTEAUX et des DESSINS au sol (mots, flèches).
   Le rendu est celui de l'autoroute vivante : un ruban par trait, le motif calculé dans le shader par un créneau FILTRÉ (ni scintillement
   au loin, ni bégaiement à grande vitesse), chaque tiret son âge, l'ombre noire derrière le tiret, la nuit, les plots d'une autre couleur à
   contresens, les poteaux qui plient.
   `?pays=xx` : la piste se peint avec le plan xx (s'il est inscrit) à la place de l'autoroute vivante. Au banc : `arPaysDef('xx',{nom,plan})`
   inscrit un plan depuis la page, `dbgPays('xx')` repeint la piste en cours (''= retour à l'autoroute vivante), `dbgPays()` dit où on en est.
   Banc : outils/banc-autoroute/pays.cjs ; les plans des maquettes : outils/banc-autoroute/pays/<xx>.js (hors du jeu tant qu'ils ne sont pas choisis).
   LE PLAN reçoit K :
     K.H (demi-largeur de la route, m), K.kH (H/28), K.g / K.d (les bords peints, à 3 m·kH des rives ; NÉGATIF = À GAUCHE), K.L (longueur, m),
     K.carte, K.nuit (0-1), K.rnd() (un tirage stable), K.BLANC, K.JAUNE, K.NOIR ;
     K.trait(x,{l,c,op,per,on,ph,ombre,s0,s1})   un trait à x (m), large de l ; per = le pas (0 : plein), on = la longueur peinte, ph = le
                                                 décalage, ombre = la longueur d'ombre noire derrière le tiret ; s0-s1 : où il existe ;
     K.fond(x0,x1,{c,op,per,on,ph,s0,s1})        une bande teintée de x0 à x1 (sous les traits) ;
     K.voies(g,d,n,{…trait, plots:{…}})          les n−1 séparations de n voies entre g et d ; rend la largeur d'une voie ;
     K.plot(x,{per,ph,c,c2,long,l,s0,s1})        des plots (c2 : la couleur vue à contresens) ;
     K.motif(x0,x1,{type:'chevron'|'hachure',pas,ep,pente,c,op,s0,s1})   pente > 0 : la pointe vers la caisse ; < 0 : vers l'avant ;
     K.poteaux(x,{per,c,c2,h,s0,s1})             des poteaux souples (c : le corps, c2 : la bande réfléchissante) ;
     K.dessin(nom,function(c,W,H){…})            une case de toile (256 × 512, le bas = le plus près de la caisse), peinte en blanc ;
     K.texte(nom,'MOT',{police,taille,etire})    un mot étiré comme sur une vraie chaussée ;
     K.decal(s,x,{d:nom,l,long,c,op})            pose le dessin à l'abscisse s, centré sur x, demi-largeur l, sur `long` mètres.
   x, x0, x1 et l peuvent être des fonctions de s (un biseau, un îlot qui s'ouvre). */
const ARP={code:((/[?&]pays=([a-z0-9-]+)/i.exec(location.search)||[])[1]||'').toLowerCase(),defs:{},ordre:[],atlas:{},geoP:{},stats:null,vif:''};
function arpInscrit(code,def){ARP.defs[code]=def;if(ARP.ordre.indexOf(code)<0)ARP.ordre.push(code);} /* une autoroute DU JEU : elle entre dans le tirage (rendu/autoroute-monde.js) */
window.arPaysDef=function(code,def){code=String(code).toLowerCase();ARP.defs[code]=def;if(ARP.atlas[code]){ARP.atlas[code].t.dispose();delete ARP.atlas[code];}return code;}; /* (banc) un plan posé depuis la page : visible par ?pays= et dbgPays, HORS du tirage */
function arpTirage(seed){ /* LE TIRAGE DE LA PISTE : '' = l'américaine (l'autoroute vivante), sinon le code d'un pays. Tiré d'une graine dérivée de celle de la piste (même piste, même route,
   bâtie d'avance ou au passage), à parts égales entre l'américaine et chaque pays, et sans regarder la map : chaque route va sur chaque map. ?pays=xx l'impose, ?pays=us impose l'américaine. */
  if(ARP.code)return ARP.defs[ARP.code]?ARP.code:'';
  const n=ARP.ordre.length+1,k=Math.min(n-1,Math.floor(mulberry32(((seed|0)^0x3C6EF372^Math.imul(AR_GRAINE|0,0x85EBCA6B))>>>0)()*n));
  return k?ARP.ordre[k-1]:'';}
function arpPlan(def,H,Lm,id,seed){
  const kH=Math.max(.7,Math.min(1.6,H/28)),R=mulberry32(((seed|0)^0x6A09E667)>>>0),ou=function(o,k,d){return o[k]==null?d:o[k];};
  const K={H:H,kH:kH,L:Lm,carte:id||'',nuit:LVL.cur&&LVL.cur.nuit?1:0,g:-H+3*kH,d:H-3*kH,rnd:R,BLANC:0xf3f1ea,JAUNE:0xf3c13a,NOIR:0x050506,
    fonds:[],traits:[],plots:[],motifs:[],pots:[],decals:[],dessins:[],noms:{}};
  const ruban=function(x,o,l,op){return {x:x,l:ou(o,'l',l),c:ou(o,'c',K.BLANC),op:ou(o,'op',op),per:o.per||0,on:o.on||0,ph:o.ph||0,ombre:o.ombre||0,
    s0:ou(o,'s0',0),s1:ou(o,'s1',Lm),h:ou(o,'h',.05),c2:null,plot:0};};
  K.trait=function(x,o){o=o||{};K.traits.push(ruban(x,o,.2,.88));};
  K.fond=function(x0,x1,o){o=o||{};const f0=typeof x0==='function',f1=typeof x1==='function';
    const t=ruban(f0||f1?function(sv){return ((f0?x0(sv):x0)+(f1?x1(sv):x1))*.5;}:(x0+x1)*.5,o,0,.3);
    t.l=f0||f1?function(sv){return Math.max(0,(f1?x1(sv):x1)-(f0?x0(sv):x0));}:Math.max(0,x1-x0);t.h=ou(o,'h',.04);t.fond=1;K.fonds.push(t);};
  K.plot=function(x,o){o=o||{};const per=o.per||24,lg=ou(o,'long',.24),t=ruban(x,{l:ou(o,'l',.26),c:ou(o,'c',0xffffff),op:ou(o,'op',1),per:per,on:lg,ph:-ou(o,'ph',per*.5)+lg*.5,
      s0:o.s0,s1:o.s1,h:.07},.26,1);t.c2=o.c2==null?t.c:o.c2;t.plot=1;K.plots.push(t);};
  K.voies=function(g,d,n,o){o=o||{};const lw=(d-g)/n;for(let i=1;i<n;i++){K.trait(g+i*lw,o);if(o.plots)K.plot(g+i*lw,o.plots);}return lw;};
  K.motif=function(x0,x1,o){o=o||{};K.motifs.push({x0:x0,x1:x1,type:o.type==='hachure'?1:0,pas:o.pas||7,ep:ou(o,'ep',.5),pente:ou(o,'pente',1),c:ou(o,'c',K.BLANC),op:ou(o,'op',.85),
    s0:ou(o,'s0',0),s1:ou(o,'s1',Lm),h:.045});};
  K.poteaux=function(x,o){o=o||{};K.pots.push({x:x,per:o.per||6,c:ou(o,'c',0xee6a20),c2:ou(o,'c2',0xf2f2ea),h:ou(o,'h',.8),s0:ou(o,'s0',8),s1:ou(o,'s1',Lm-30)});};
  K.dessin=function(nom,fn){if(K.noms[nom]==null){K.noms[nom]=K.dessins.length;K.dessins.push(fn);}return nom;};
  K.texte=function(nom,txt,o){o=o||{};return K.dessin(nom,function(c,W,Hc){c.save();c.textAlign='center';c.textBaseline='alphabetic';
    const px=o.taille||30;c.font=(o.gras?'bold ':'')+px+'px '+(o.police||'"Press Start 2P",monospace');
    const et=o.etire||Math.min(14,(Hc-24)/px),mw=c.measureText(txt).width;c.translate(W/2,Hc-12);c.scale(Math.min(1,(W-16)/Math.max(1,mw)),et);c.fillText(txt,0,0);c.restore();});};
  K.decal=function(sv,x,o){o=o||{};if(K.noms[o.d]==null)return;K.decals.push({s:sv,x:x,l:ou(o,'l',1.5),long:ou(o,'long',8),d:K.noms[o.d],c:ou(o,'c',K.BLANC),op:ou(o,'op',.84)});};
  def.plan(K);return K;}
/* ----- LES MATIÈRES ----- */
function arpLignesMat(){ /* tous les rubans (fonds, traits, plots) : couleur, pas, longueur peinte, décalage et ombre PAR SOMMET */
  const m=traitMat(new THREE.MeshBasicMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,polygonOffsetFactor:-1,polygonOffsetUnits:-1}),1.15,2);
  m.extensions={derivatives:true};const ob=m.onBeforeCompile,noir=new THREE.Color(0x050506);
  m.onBeforeCompile=function(sh){ob(sh);
    sh.uniforms.uArTrav=AR_U.uTrav;sh.uniforms.uArNuit=AR_U.uNuit;sh.uniforms.uArNoir={value:noir};
    sh.vertexShader=sh.vertexShader.replace('attribute vec3 aLat;','attribute vec3 aLat;attribute float aV;attribute vec4 aC;attribute vec4 aM;attribute vec4 aX;varying highp float vArV;varying vec4 vArC;varying vec4 vArM;varying vec4 vArX;')
      .replace('void main() {','void main() {\n\tvArV=aV;vArC=aC;vArM=aM;vArX=aX;');
    sh.fragmentShader='uniform vec3 uArNoir;uniform float uArTrav,uArNuit;varying highp float vArV;varying vec4 vArC;varying vec4 vArM;varying vec4 vArX;\n'+AR_GLSL_F+sh.fragmentShader.replace('#include <color_fragment>',
      '{float per=vArM.x,cw=1.,cb=0.,ag=1.;'+
      'if(per>.01){highp float t=(vArV+vArM.z)/per;float w=max(fwidth(t),uArTrav/per),d=vArM.y/per;cw=arPulse(t,0.,d,w);'+
      'if(vArM.w>.01)cb=arPulse(t,d,d+vArM.w/per,w);ag=.84+.16*arH(floor(t)+vArM.z*3.7+per);}'+ /* chaque tiret son âge */
      'vec3 pc=vArC.rgb*(1.-.4*uArNuit);'+
      'if(vArX.a>.5){float sv9=dFdy(vArV);pc=mix(vArC.rgb,vArX.rgb,step(sv9,-.5*fwidth(vArV)))*(1.+.7*uArNuit);ag=1.;}'+ /* un plot : plus vif la nuit, d'une autre couleur à contresens */
      'float a=cw*vArC.a*ag,ab=cb*.8*(1.-a);vec3 c=pc*a+uArNoir*ab;float A=a+ab;'+
      'diffuseColor.rgb=A>1e-4?c/A:pc;diffuseColor.a*=A;}');};
  m.customProgramCacheKey=function(){return 'arpLignes';};return m;}
function arpMotifMat(){ /* chevrons et hachures : aI = (travers ±1, demi-largeur, s, force), aC = couleur, aZ = (type, pas, épaisseur, pente) */
  const m=new THREE.MeshBasicMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});
  m.extensions={derivatives:true};
  m.onBeforeCompile=function(sh){sh.uniforms.uArTrav=AR_U.uTrav;sh.uniforms.uArNuit=AR_U.uNuit;
    sh.vertexShader='attribute vec4 aI;attribute vec4 aC;attribute vec4 aZ;varying highp vec4 vArI;varying vec4 vArC;varying vec4 vArZ;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvArI=aI;vArC=aC;vArZ=aZ;');
    sh.fragmentShader='uniform float uArTrav,uArNuit;varying highp vec4 vArI;varying vec4 vArC;varying vec4 vArZ;\n'+AR_GLSL_F+sh.fragmentShader.replace('#include <color_fragment>',
      '{float xm=vArI.x*vArI.y;highp float t=(vArI.z-(vArZ.x<.5?abs(xm):xm)*vArZ.w)/vArZ.y;float c=arPulse(t,0.,vArZ.z/vArZ.y,max(fwidth(t),uArTrav/vArZ.y));'+
      'float e=1.-smoothstep(1.-1.5*fwidth(vArI.x),1.,abs(vArI.x));'+ /* les rives du motif, sans escalier */
      'diffuseColor=vec4(vArC.rgb*(1.-.4*uArNuit),c*e*vArI.w*(.84+.16*arH(floor(t))));}');};
  m.customProgramCacheKey=function(){return 'arpMotif';};return m;}
function arpAtlas(K,code){ /* les dessins du plan : des cases de 256 × 512 sur une toile (4 par rangée) ; UNE toile par pays, gardée d'une piste à l'autre */
  if(ARP.atlas[code]&&ARP.atlas[code].n===K.dessins.length)return ARP.atlas[code];
  const n=K.dessins.length,cols=Math.min(4,n),rows=Math.ceil(n/4),cv=document.createElement('canvas');cv.width=cols*256;cv.height=rows*512;
  const dessine=function(){const c=cv.getContext('2d');c.clearRect(0,0,cv.width,cv.height);
    for(let i=0;i<n;i++){c.save();c.translate((i%4)*256,Math.floor(i/4)*512);c.beginPath();c.rect(3,3,250,506);c.clip();c.fillStyle='#fff';c.strokeStyle='#fff';
      try{K.dessins[i](c,256,512);}catch(e){console.warn('arp dessin',e);}c.restore();}};
  dessine();
  const t=new THREE.CanvasTexture(cv);t.anisotropy=Math.min(ALLEGE?4:8,renderer.capabilities.getMaxAnisotropy());
  try{if(document.fonts&&!document.fonts.check('32px "Press Start 2P"'))document.fonts.load('32px "Press Start 2P"').then(function(){dessine();t.needsUpdate=true;});}catch(e){}
  return ARP.atlas[code]={t:t,cols:cols,rows:rows,n:n};}
function arpDecalMat(tex){const m=new THREE.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});
  m.onBeforeCompile=function(sh){sh.uniforms.uArNuit=AR_U.uNuit;
    sh.vertexShader='attribute vec4 aC;varying vec4 vArC;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvArC=aC;');
    sh.fragmentShader='uniform float uArNuit;varying vec4 vArC;\n'+sh.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\ndiffuseColor*=vArC;diffuseColor.rgb*=1.-.4*uArNuit;');};
  m.customProgramCacheKey=function(){return 'arpDecal';};return m;}
function arpPoteauGeo(col,col2,h){ /* le poteau souple de l'autoroute vivante, aux couleurs du pays (une bande réfléchissante aux deux tiers) */
  const cle=col+'|'+col2+'|'+h;if(ARP.geoP[cle])return ARP.geoP[cle];
  const a=new THREE.Color(col),b=new THREE.Color(col2),bandes=[[0,.7*h,a],[.7*h,.83*h,b],[.83*h,h,a]],P9=[],C9=[],I9=[],r=.045,co=[[-r,-r],[r,-r],[r,r],[-r,r]];
  for(const bd of bandes){const c=bd[2],v0=P9.length/3;
    for(const y of [bd[0],bd[1]])for(const q of co){P9.push(q[0],y,q[1]);C9.push(c.r,c.g,c.b);}
    for(let k=0;k<4;k++){const p=v0+k,q=v0+(k+1)%4,p2=p+4,q2=q+4;I9.push(p,q,q2,p,q2,p2);}}
  const v0=P9.length/3;for(const q of co){P9.push(q[0],h,q[1]);C9.push(a.r,a.g,a.b);}I9.push(v0,v0+1,v0+2,v0,v0+2,v0+3);
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P9,3));g.setAttribute('color',new THREE.Float32BufferAttribute(C9,3));g.setIndex(I9);
  ARP.geoP[cle]=g;return g;}
/* ----- LE PEINTRE ----- */
function arpMaille(plan,nom,g,mat){sphere9(g);g.boundingSphere.radius+=20;memLibere(g);
  const m=new THREE.Mesh(g,mat);m.name=nom;m.renderOrder=1;m.updateMatrix();m.matrixAutoUpdate=false;
  trackMeshes.push(m);PISTE_LOD.push({hi:m,lo:null,mo:null,s:g.boundingSphere,loin:false,et:0});plan.mailles.push(m);return m;}
function* arpPeint(def,code,seed,id,sEnt){
  const H=ROAD_HALF;if(!(H>0)||H>40)return; /* (la piste de glace reste nue, comme pour l'américaine) */
  const plan={pays:code,seed:seed|0,id:id||'',L:L,H:H,sEnt:sEnt||0,potM:[],mats:[],mailles:[],stats:null};AR.plans.push(plan);if(AR.plans.length>3)AR.plans.shift(); /* le même registre que l'américaine : arTick y trouve les poteaux de la piste EN COURS */
  /* LA PEINTURE PREND LE TON DE LA MAP (crème au canyon, ensablée aux dunes, sourde dans la grotte) : la teinte et la force de l'américaine sur cette map, rapportées à sa peinture neuve */
  const PM=arPerso(id),TB=new THREE.Color(PM.peint.b),T0=new THREE.Color(0xf3f1ea),tk=[Math.min(1.04,TB.r/T0.r),Math.min(1.04,TB.g/T0.g),Math.min(1.04,TB.b/T0.b)],fo=Math.max(.6,Math.min(1.06,PM.peint.op/AR_CARTES.defaut.peint.op)); /* (la Jade, pâle : 73 %, comme l'américaine) */
  const ton=function(C){C.r=Math.min(1,C.r*tk[0]);C.g=Math.min(1,C.g*tk[1]);C.b=Math.min(1,C.b*tk[2]);return C;};
  let cpu=0,tMax=0,tA=performance.now();const pause=function(){const d9=performance.now()-tA;cpu+=d9;if(d9>tMax)tMax=d9;},reprise=function(){tA=performance.now();}; /* le plus long pas, comme l'américaine (le pré-bâti n'a que 3 à 6 ms par image) */
  const K=arpPlan(def,H,L,id,seed),np=Math.ceil(NP/2),ds=L/Math.max(1,NP-1),CHR=Math.max(60,Math.round(PISTE_CH/4)),sg=AR.sg,TH=THICK,FACES=ALLEGE?[0]:[0,1];
  const val=function(v,sv){return typeof v==='function'?v(sv):v;},trou=function(i){return !!(TROU&&(TROU[i]||TROU[Math.min(NP-1,i+1)]));};
  const rub=K.fonds.concat(K.traits),matL=arpLignesMat(),matM=K.motifs.length?arpMotifMat():null,CL=new THREE.Color(),CL2=new THREE.Color();plan.mats.push(matL);if(matM)plan.mats.push(matM);matL.visible=AR.vis;if(matM)matM.visible=AR.vis;
  const st={verts:0,octets:0,mailles:0,traits:K.traits.length,fonds:K.fonds.length,plots:K.plots.length,motifs:K.motifs.length,poteaux:0,dessins:K.decals.length};
  const maille2=function(nom,gH,gM,mat,r0,r1){const hi=arMaille2(nom,gH,gM,mat,2*r0,2*r1),E9=PISTE_LOD[PISTE_LOD.length-1];plan.mailles.push(hi);if(E9&&E9.mo)plan.mailles.push(E9.mo);st.mailles++;}; /* deux finesses, comme l'américaine : PISTE_LOD prend la MOYENNE au loin (téléphone) */
  const octets=function(g){let n=0;for(const k in g.attributes){const t9=g.attributes[k];n+=t9.count*t9.itemSize*t9.array.BYTES_PER_ELEMENT;}if(g.index)n+=g.index.count*g.index.array.BYTES_PER_ELEMENT;st.octets+=n;};
  AR_U.uNuit.value=+LVL.nuit||0;pause();yield;reprise();
  for(let c=0;c*CHR<np-1;c++){const r0=c*CHR,r1=Math.min(np-1,(c+1)*CHR);
    /* les courses : les rangées consécutives où le ruban existe, sans trou */
    const courses=function(lst,vit){const out=[];
      for(const t of lst){let d=-1;
        for(let r=r0;r<=r1;r++){const sv=r*2*ds,on=sv>=t.s0&&sv<=t.s1&&vit(t,sv),coupe=r>r0&&trou(2*(r-1));
          if(d>=0&&(!on||coupe)){if(r-1>d)out.push(t,d,r-1);d=-1;}
          if(on&&d<0)d=r;}
        if(d>=0&&r1>d)out.push(t,d,r1);}
      return out;};
    const cl=courses(rub,function(t,sv){return val(t.l,sv)>.01;});
    /* LES PLOTS : un petit carré autour de chaque plot (le motif du ruban le dessine), plus un ruban sur toute la piste, transparent à 99 % ; jamais au loin */
    const d2=2*ds,mg=1.6;
    for(const t of K.plots){let pa=-1,pb=-1;const sA=Math.max(t.s0,r0*d2),sB=Math.min(t.s1,r1*d2);if(sB<=sA)continue;
      for(let k=Math.ceil((sA+t.ph-t.on-mg)/t.per);k*t.per-t.ph-mg<=sB;k++){const s9=k*t.per-t.ph;if(s9<t.s0||s9>t.s1)continue;
        let ra=Math.max(r0,Math.floor((s9-mg)/d2)),rb=Math.min(r1,Math.ceil((s9+t.on+mg)/d2));if(rb<=ra)continue;
        let ok=true;for(let r=ra;r<rb;r++)if(trou(2*r)||!(val(t.l,r*d2)>.01)){ok=false;break;}if(!ok)continue;
        if(pa>=0&&ra<=pb){pb=Math.max(pb,rb);continue;} /* deux plots proches : un seul carré (jamais deux couches) */
        if(pa>=0)cl.push(t,pa,pb);pa=ra;pb=rb;}
      if(pa>=0)cl.push(t,pa,pb);}
    pause();yield;reprise();
    /* chaque tranche en DEUX finesses : toutes les rangées, et une sur quatre (la MOYENNE, sans plots ni dessous) */
    const rangs=function(a9,b9,pas){const R9=[a9];for(let r=a9+1;r<b9;r++)if(pas===1||r%pas===0)R9.push(r);R9.push(b9);return R9;};
    const fabT=function(pas){const RR=[];let nv=0; /* le dessous de la dalle (les traits seulement) : sur l'ordinateur, comme l'américaine */
      for(let i=0;i<cl.length;i+=3){const t=cl[i];if(pas>1&&t.plot)continue;const R9=rangs(cl[i+1],cl[i+2],pas),nf=pas===1&&!t.plot&&!t.fond?FACES.length:1;RR.push(t,R9,nf);nv+=2*R9.length*nf;}
      if(!nv)return null;
      const pos=new Float32Array(nv*3),la=new Float32Array(nv*3),av=new Float32Array(nv),ac=new Uint8Array(nv*4),am=new Float32Array(nv*4),ax=new Uint8Array(nv*4),ix=[];let v=0;
      for(let i=0;i<RR.length;i+=3){const t=RR[i],R9=RR[i+1],nf=RR[i+2],op9=t.plot?t.op:t.op*fo;CL.setHex(t.c);CL2.setHex(t.c2==null?t.c:t.c2);if(!t.plot)ton(CL);
        for(let f=0;f<nf;f++){const dess=f===1,h=dess?-TH-t.h:t.h,v0=v;
          for(const r of R9){const pi=Math.min(NP-1,2*r),p9=pts[pi],bb=B[pi],nn=Nn[pi],sv=r*d2,lat=sg*val(t.x,sv),hw=val(t.l,sv)*.5;
            for(let sd=-1;sd<=1;sd+=2){const l=lat+sd*hw;
              pos[v*3]=p9.x+bb.x*l+nn.x*h;pos[v*3+1]=p9.y+bb.y*l+nn.y*h;pos[v*3+2]=p9.z+bb.z*l+nn.z*h;
              la[v*3]=bb.x*sd*hw;la[v*3+1]=bb.y*sd*hw;la[v*3+2]=bb.z*sd*hw;av[v]=sv;
              ac[v*4]=Math.round(CL.r*255);ac[v*4+1]=Math.round(CL.g*255);ac[v*4+2]=Math.round(CL.b*255);ac[v*4+3]=Math.round(Math.min(1,op9)*255);
              am[v*4]=t.per;am[v*4+1]=t.on;am[v*4+2]=t.ph;am[v*4+3]=dess?0:t.ombre;
              ax[v*4]=Math.round(CL2.r*255);ax[v*4+1]=Math.round(CL2.g*255);ax[v*4+2]=Math.round(CL2.b*255);ax[v*4+3]=t.plot?255:0;v++;}}
          for(let r=0;r<R9.length-1;r++){const w=v0+2*r;ix.push(w,w+2,w+1,w+1,w+2,w+3);}}}
      const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('aLat',new THREE.BufferAttribute(la,3));
      g.setAttribute('aV',new THREE.BufferAttribute(av,1));g.setAttribute('aC',new THREE.BufferAttribute(ac,4,true));g.setAttribute('aM',new THREE.BufferAttribute(am,4));g.setAttribute('aX',new THREE.BufferAttribute(ax,4,true));
      g.setIndex(v>65535?new THREE.Uint32BufferAttribute(ix,1):new THREE.Uint16BufferAttribute(ix,1));st.verts+=v;octets(g);return g;};
    {const gH=fabT(1);if(gH){pause();yield;reprise();const gM=fabT(4);pause();yield;reprise();maille2('pays traits',gH,gM,matL,r0,r1);}}
    pause();yield;reprise();
    if(matM){const cm=courses(K.motifs,function(t,sv){return val(t.x1,sv)-val(t.x0,sv)>.12;});
      const fabM=function(pas){const RR=[];let nv=0;for(let i=0;i<cm.length;i+=3){const R9=rangs(cm[i+1],cm[i+2],pas);RR.push(cm[i],R9);nv+=2*R9.length;}
        if(!nv)return null;
        const pos=new Float32Array(nv*3),ai=new Float32Array(nv*4),ac=new Uint8Array(nv*4),az=new Float32Array(nv*4),ix=[];let v=0;
        for(let i=0;i<RR.length;i+=2){const t=RR[i],R9=RR[i+1],v0=v;ton(CL.setHex(t.c));
          for(const r of R9){const pi=Math.min(NP-1,2*r),p9=pts[pi],bb=B[pi],nn=Nn[pi],sv=r*d2,x0=val(t.x0,sv),x1=val(t.x1,sv),xc=(x0+x1)*.5,hw=(x1-x0)*.5;
            for(let sd=-1;sd<=1;sd+=2){const l=sg*xc+sd*hw;
              pos[v*3]=p9.x+bb.x*l+nn.x*t.h;pos[v*3+1]=p9.y+bb.y*l+nn.y*t.h;pos[v*3+2]=p9.z+bb.z*l+nn.z*t.h;
              ai[v*4]=sd*sg;ai[v*4+1]=hw;ai[v*4+2]=sv;ai[v*4+3]=Math.min(1,t.op*fo);
              ac[v*4]=Math.round(CL.r*255);ac[v*4+1]=Math.round(CL.g*255);ac[v*4+2]=Math.round(CL.b*255);ac[v*4+3]=255;
              az[v*4]=t.type;az[v*4+1]=t.pas;az[v*4+2]=t.ep;az[v*4+3]=t.pente;v++;}}
          for(let r=0;r<R9.length-1;r++){const w=v0+2*r;ix.push(w,w+2,w+1,w+1,w+2,w+3);}}
        const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('aI',new THREE.BufferAttribute(ai,4));
        g.setAttribute('aC',new THREE.BufferAttribute(ac,4,true));g.setAttribute('aZ',new THREE.BufferAttribute(az,4));
        g.setIndex(v>65535?new THREE.Uint32BufferAttribute(ix,1):new THREE.Uint16BufferAttribute(ix,1));st.verts+=v;octets(g);return g;};
      const gH=fabM(1);if(gH){pause();yield;reprise();maille2('pays motifs',gH,fabM(4),matM,r0,r1);}
      pause();yield;reprise();}
  }
  /* LES DESSINS AU SOL */
  if(K.decals.length&&K.dessins.length){const at=arpAtlas(K,code),matD=arpDecalMat(at.t),lims=[];let n9=0;plan.mats.push(matD);matD.visible=AR.vis;
    const libre=function(a,b){if(a<10||b>L-20)return false;for(let i=Math.floor(a/ds);i<=Math.ceil(b/ds);i++)if(trou(i))return false;return true;};
    const dec=K.decals.filter(function(d){return libre(d.s,d.s+d.long);});
    for(const d of dec){const a=Math.floor(d.s/ds),b=Math.min(NP-1,Math.ceil((d.s+d.long)/ds));lims.push(a,b);n9+=2*(b-a+1);}
    if(n9){const pos=new Float32Array(n9*3),uv=new Float32Array(n9*2),ac=new Uint8Array(n9*4),ix=[];let v=0;
      for(let i=0;i<dec.length;i++){const d=dec[i],a=lims[2*i],b=lims[2*i+1],v0=v,u0=(d.d%4)/at.cols,du=1/at.cols,vb=1-(Math.floor(d.d/4)+1)/at.rows,dv=1/at.rows;ton(CL.setHex(d.c));
        for(let pi=a;pi<=b;pi++){const p=pts[pi],bb=B[pi],nn=Nn[pi],vv=Math.max(0,Math.min(1,(pi*ds-d.s)/d.long));
          for(let sd=0;sd<=1;sd++){const l=sg*(d.x+(sd?1:-1)*d.l); /* sd = 0 : le bord GAUCHE du dessin (le début de la lecture) */
            pos[v*3]=p.x+bb.x*l+nn.x*.055;pos[v*3+1]=p.y+bb.y*l+nn.y*.055;pos[v*3+2]=p.z+bb.z*l+nn.z*.055;
            uv[v*2]=u0+(sd?du*.985:du*.015);uv[v*2+1]=vb+dv*(.01+.98*vv);
            ac[v*4]=Math.round(CL.r*255);ac[v*4+1]=Math.round(CL.g*255);ac[v*4+2]=Math.round(CL.b*255);ac[v*4+3]=Math.round(Math.min(1,d.op*fo)*255);v++;}}
        for(let r=0;r<b-a;r++){const w=v0+2*r;ix.push(w,w+2,w+1,w+1,w+2,w+3);}}
      const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));g.setAttribute('aC',new THREE.BufferAttribute(ac,4,true));
      g.setIndex(v>65535?new THREE.Uint32BufferAttribute(ix,1):new THREE.Uint16BufferAttribute(ix,1));st.verts+=v;octets(g);arpMaille(plan,'pays dessins',g,matD);st.mailles++;}
    pause();yield;reprise();}
  /* LES POTEAUX : des paquets de 400 m (arTick ne montre que les proches), toutes les lignes de même poteau ensemble (un appel de dessin par paquet) */
  if(K.pots.length){const matP=arPoteauMat();plan.mats.push(matP);matP.visible=AR.vis;const MT=new THREE.Matrix4(),VZ=new THREE.Vector3(),grp=new Map();
    for(const q of K.pots){const cle=q.c+'|'+q.c2+'|'+q.h;
      for(let sv=Math.max(8,q.s0);sv<Math.min(L-30,q.s1);sv+=q.per){const pi=Math.round(sv/ds);if(pi>=NP-1||trou(pi))continue;const k9=cle+'#'+Math.floor(sv/400);
        if(!grp.has(k9))grp.set(k9,{geo:arpPoteauGeo(q.c,q.c2,q.h),lst:[]});grp.get(k9).lst.push(pi,val(q.x,sv));}}
    let nG=0;
    for(const e of grp.values()){const lst=e.lst,n=lst.length/2,g=e.geo.clone(),im=new THREE.InstancedMesh(g,matP,n);let x0=Infinity,y0=Infinity,z0=Infinity,x1=-Infinity,y1=-Infinity,z1=-Infinity;
      for(let k=0;k<n;k++){const pi=lst[2*k],p9=pts[pi],bb=B[pi],nn=Nn[pi],tt=T[pi],l=sg*lst[2*k+1];
        VZ.crossVectors(bb,nn);if(VZ.dot(tt)<0)VZ.negate();
        const px=p9.x+bb.x*l,py=p9.y+bb.y*l,pz=p9.z+bb.z*l;MT.makeBasis(bb,nn,VZ);MT.setPosition(px,py,pz);im.setMatrixAt(k,MT);
        if(px<x0)x0=px;if(py<y0)y0=py;if(pz<z0)z0=pz;if(px>x1)x1=px;if(py>y1)y1=py;if(pz>z1)z1=pz;}
      im.instanceMatrix.needsUpdate=true;g.boundingSphere=new THREE.Sphere(new THREE.Vector3((x0+x1)/2,(y0+y1)/2,(z0+z1)/2),Math.hypot(x1-x0,y1-y0,z1-z0)/2+2);
      im.name='pays poteaux';im.renderOrder=1;im.updateMatrix();im.matrixAutoUpdate=false;trackMeshes.push(im);plan.mailles.push(im);plan.potM.push(im);st.poteaux+=n;st.mailles++;
      if((++nG&7)===0){pause();yield;reprise();}}}
  pause();st.ms=+cpu.toFixed(1);st.msMax=+tMax.toFixed(1);plan.stats=st;ARP.stats=st;ARP.vif=code;}
function arpChauffe(tri){ /* (arChauffe, au menu) les trois programmes des autoroutes du monde compilés hors écran ; les poteaux ont celui de l'américaine */
  const cv=document.createElement('canvas');cv.width=cv.height=4;
  return [new THREE.Mesh(tri({aLat:[Float32Array,3],aV:[Float32Array,1],aC:[Uint8Array,4,1],aM:[Float32Array,4],aX:[Uint8Array,4,1]}),arpLignesMat()),
    new THREE.Mesh(tri({aI:[Float32Array,4],aC:[Uint8Array,4,1],aZ:[Float32Array,4]}),arpMotifMat()),
    new THREE.Mesh(tri({uv:[Float32Array,2],aC:[Uint8Array,4,1]}),arpDecalMat(new THREE.CanvasTexture(cv)))];}
function arpRetire(P){ /* (banc) la route de la piste en cours s'en va : un pays quitte la scène, la piste et le tri des tranches ; l'américaine se cache */
  const i=AR.plans.indexOf(P);if(i>=0)AR.plans.splice(i,1);
  if(!P.pays){for(const m of (P.mats||[]))m.visible=false;return;}
  for(const m of P.mats)MAT_SURSIS.add(m);matSursisN=3; /* ses matières : jetées comme celles d'une piste quittée */
  const S=new Set(P.mailles);for(const m of P.mailles){scene.remove(m);if(m.geometry)m.geometry.dispose();}
  for(let i=trackMeshes.length-1;i>=0;i--)if(S.has(trackMeshes[i]))trackMeshes.splice(i,1);
  for(let i=PISTE_LOD.length-1;i>=0;i--)if(S.has(PISTE_LOD[i].hi))PISTE_LOD.splice(i,1);
  P.mailles.length=0;P.potM.length=0;}
window.dbgPays=function(code,v){
  if(code==='file'){AR_U.uTrav.value=+v||0;return AR_U.uTrav.value;} /* (banc) la route parcourue pendant l'image, en mètres : 0 = la photo nette, 1,3 = à pleine vitesse */
  const P=arPlanCourant();
  if(code==null)return {vif:P?P.pays||'us':'',url:ARP.code,tirage:['us'].concat(ARP.ordre),inscrits:Object.keys(ARP.defs),stats:P&&P.pays?P.stats:null};
  if(code==='tirage'){const n={};for(let g=1;g<=(+v||1100);g++){const c=arpTirage(g*2654435761|0)||'us';n[c]=(n[c]||0)+1;}return n;} /* (banc) la répartition du tirage sur v graines */
  code=String(code).toLowerCase();if(!ARP.defs[code])code=''; /* '', 'us' ou un code inconnu : l'américaine */
  if(!P)return {vif:'',erreur:'pas de piste'};
  arpRetire(P);for(const m of trackMeshes)if(m.name==='piste ligne centrale')m.material.visible=false;
  const n0=trackMeshes.length,it=arPeint(P.seed,P.id,P.sEnt,code);while(!it.next().done){}
  for(let i=n0;i<trackMeshes.length;i++)scene.add(trackMeshes[i]);
  const N=arPlanCourant();ARP.vif=code;return {vif:code||'us',nom:code?ARP.defs[code].nom||'':'Floride',stats:N&&N.pays?N.stats:null};};
