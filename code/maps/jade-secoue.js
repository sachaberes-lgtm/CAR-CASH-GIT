/* ===== JADE QUI SECOUE : LA ROUTE SOUS LA MER (2026-11-12, Sacha : « un module qui va dans l'eau, qui passe littéralement sous l'eau, ça change pas la physique, et après tu ressors — sans bug ») =====
   Le plan et le relief des nouveaux modules sont dans jade-1.js (genJade1 : slalom, défilé, carrousel, vrille, colimaçon, plongée, bosses, ascension) ; leurs pics dans jade-3.js (jadeBatit, JADE.pose).
   Ici, ce qu'il faut pour que LA PLONGÉE se lise :
   · LA MER DE JADE EST PEINTE DANS LE CIEL (jMerCubes, scene-ciel.js) : elle n'a pas de profondeur. Une route qui descend sous son niveau se dessinerait donc PAR-DESSUS la mer. Les montagnes
     règlent ça en jetant leurs pixels sous la ligne d'eau (JADE_VR_FS : `wl9`), colonne par colonne, avec la même houle. `jadeNoie(mat)` donne la même règle aux matières de la piste
     (bitume, flancs, rails, nappe, ligne) : vue d'au-dessus, la route s'arrête à la ligne d'eau, les vagues passent sur la dalle ; vue de dessous (uSous), plus rien au-dessus de la surface.
     Seulement dans une vallée qui a une plongée (`jadeNoieOn`) : les autres vallées et les autres maps gardent leurs programmes au bit près.
   · LA PHYSIQUE NE CHANGE PAS : l'eau n'agit qu'en vol (jadeEauVol, branche 'fall'). En conduite la caisse suit sa route ; `jadeRouteEauTick` ne fait que le spectacle — la couronne en
     entrant, les bulles dessous, la colonne et la caisse qui ruisselle en sortant (JEAU.sorti → sensMouille). L'objectif mouillé, la brume d'eau et le son étouffé viennent déjà de la
     CAMÉRA (jadeSousTick) : ils suivent tout seuls.
   Console : `dbgJadeMods()` (les modules de la vallée, la plongée, la vrille, les pics posés), `?jmod=plongee,vrille,…` impose les premiers modules, `?sans=jadefun` rend la vallée d'avant. */
const JRE={sous:false,bul:0,bloop:0,n:0};
function jadeNoieOn(){return !!(JADE.plonge&&LVL.cur&&LVL.cur.piste==='jade'&&!PARK.on);}
const JADE_NOIE_GLSL=JADE_EAU_GLSL.replace(/JMS/g,'JNS').replace(/jMerH/g,'jNoieH').replace(/uEauT/g,'uJNoieT');
function jadeNoie(m){
  if(!m||m.userData.jNoie||!m.isMaterial)return m;m.userData.jNoie=1;
  const avant=m.onBeforeCompile,cle=m.customProgramCacheKey;
  m.onBeforeCompile=function(sh,r){
    if(avant)avant.call(this,sh,r);
    sh.uniforms.uJNoieY=JADE_U.uMerY;sh.uniforms.uJNoieT=skyU.uEauT;sh.uniforms.uJNoieS=JADE_U.uSous;
    /* le point du monde : les maillages de la piste sont écrits en coordonnées du monde (aucune matrice) — `position` suffit, quoi que la matière ait fait de ses morceaux */
    sh.vertexShader='varying vec3 vJNoie;\n'+sh.vertexShader.replace(/\}\s*$/,'vJNoie=(modelMatrix*vec4(position,1.)).xyz;}');
    sh.fragmentShader='uniform float uJNoieY,uJNoieT,uJNoieS;varying vec3 vJNoie;\n'+JADE_NOIE_GLSL+sh.fragmentShader.replace(/void\s+main\s*\(\s*\)\s*\{/,
      'void main(){{float w9=vJNoie.y-(uJNoieY+jNoieH(floor(vJNoie.xz/JNS))*JNS);if(uJNoieS<.5?w9<0.:w9>0.)discard;}');
  };
  m.customProgramCacheKey=function(){return (cle?cle.call(this):'')+'|jnoie';}; /* (three r128) la clé par défaut est le texte de onBeforeCompile : cinq enveloppes au même texte se partageraient UN programme */
  m.needsUpdate=true;return m;}
function jadeRouteEauTick(dt){
  const ok=jadeEauOk()&&started&&!gameOver&&mode==='drive'; /* pas de test sur JADE.plonge (c'est celui de la DERNIÈRE vallée tirée) : hors plongée, la route n'est jamais sous la surface */
  if(!ok){JRE.sous=false;JSOUS.route=false;return;}
  const p=carGroup.position,sy=jadeSurfCase(p.x,p.z),d=sy-p.y,sous=JRE.sous?d>-1.5:d>.6; /* une marge : une crête qui passe ne fait pas clignoter l'entrée */
  JSOUS.route=d>-16; /* la peau de l'eau autour de l'objectif dès que la caisse approche de la surface (jadeSousTick) : plongée, elle s'y devine */
  if(sous!==JRE.sous){JRE.sous=sous;
    if(sous){JRE.n++;JRE.bul=0;JRE.bloop=.2;
      try{jadeCouronne(p.x,sy,p.z,.75,null);jadeBullesJet(p,60,4);}catch(e){}
      shake=Math.max(shake,.5);fovPunch=Math.max(fovPunch,11);hap([20,30,40]);
      try{subBoom(.2);noiseBurst(.6,.2,520);noiseBurst(.9,.09,2600);if(SONV2)sfx('flaque.eau',{vol:-2});duckT=Math.max(duckT,.3);}catch(e){}
      try{if(!JRE.tr){JRE.tr=1;Object.assign(I18N,{'SOUS LA MER':'UNDER THE SEA'});} /* ici et pas en tête de morceau : I18N naît plus loin dans le fichier (interface/) */popTexte(sansAcc(TR('SOUS LA MER')),'#7dffec',2);}catch(e){}}
    else{JEAU.sorti=0; /* sensMouille : la caisse ruisselle 2,6 s */
      try{jadeColonne(p.x,sy,p.z,70,.6);}catch(e){}
      shake=Math.max(shake,.35);fovPunch=Math.max(fovPunch,11);hap([12,18,26]);
      try{noiseBurst(.8,.2,2200);noiseBurst(.5,.18,450);subBoom(.12);if(SONV2){sfx('flaque.eau',{vol:-4});sfx('air.regain');}}catch(e){}}}
  if(sous){JRE.bul-=dt;if(JRE.bul<=0){JRE.bul=.05;try{jadeBullesJet(p,nitroOn?4:2,2);}catch(e){}}
    JRE.bloop-=dt;if(JRE.bloop<=0){JRE.bloop=.14+Math.random()*(nitroOn?.15:.4);try{eauBloop(nitroOn?1:.6);}catch(e){}}}}
window.dbgJadeMods=function(s9){const ds=L/Math.max(1,NP-1);
  if(typeof s9==='number'&&JADE.col){const i=Math.max(0,Math.min(NP-1,Math.round(s9/ds))),p=pts[i],o=[]; /* (banc) les montagnes au droit de la route en s9 : leur rang dans JADE.col.P, leur cercle, leur pied et leur sommet, leur distance de pose (q[8]) */
    for(let k=0;k<JADE.col.P.length;k++){const q=JADE.col.P[k],d=Math.hypot(q[0]-p.x,q[1]-p.z);if(d<q[2]+ROAD_HALF+5&&p.y>q[3]-30&&p.y<q[4]+30)o.push({k:k,x:Math.round(q[0]),z:Math.round(q[1]),r:Math.round(q[2]),pied:Math.round(q[3]),sommet:Math.round(q[4]),tpl:q[5],dR:Math.round(q[8]),d:Math.round(d),dans:jadePilierDans(q,p.x,p.y+1.5,p.z)});}
    let lo=1e9,hi=-1e9;const et=[];for(let j=0;j<NP;j+=4){const a9=pts[j];if(Math.hypot(a9.x-p.x,a9.z-p.z)<150){lo=Math.min(lo,a9.y);hi=Math.max(hi,a9.y);if(!et.length||Math.abs(j*ds-et[et.length-1][0])>60)et.push([Math.round(j*ds),Math.round(a9.y)]);}}
    return {p:[Math.round(p.x),Math.round(p.y),Math.round(p.z)],montagnes:o,routeProche:{lo:Math.round(lo),hi:Math.round(hi),passages:et},pose:(JADE.pose||[]).map(function(q){return {c:q.c||0,x:Math.round(q.x),z:Math.round(q.z),y:Math.round(q.y),R:q.R?Math.round(q.R):0,h:Math.round(q.h),bas:q.bas};})};}
let sous=0,env=0,bas=1e9,haut=-1e9;
  if(JADE.root&&isFinite(JADE.eauY))for(let i=0;i<NP;i+=2){const d=pts[i].y-JADE.eauY;if(d<0)sous+=2;if(d<bas)bas=d;if(d>haut)haut=d;if(Nn[i].y<0)env+=2;}
  const centres=(JADE.pose||[]).filter(function(o){return o.c;}).map(function(o){let bd=1e9,bq=null;for(const q of (JADE.col&&JADE.col.P)||[]){const d=Math.hypot(q[0]-o.x,q[1]-o.z);if(d<bd){bd=d;bq=q;}}
    return bq?{ecart:Math.round(bd),rayon:Math.round(bq[2]),R:Math.round(o.R),sommet:Math.round(bq[4]-o.y),pied:Math.round(bq[3]-o.y)}:null;}); /* le pic au centre de chaque tour : son écart au centre voulu, son rayon contre celui du tour, son sommet et son pied comptés depuis la route */
  return {centres:centres,mods:JADE.mk||null,plonge:JADE.plonge||null,vrille:JADE.vrille||null,pose:JADE.pose?JADE.pose.length:0,poses:JADE.posees||0,pontSaute:JADE.pontSaute||0,lev:JADE.lev?JADE.lev.length:0,
    eauY:JADE.root?Math.round(JADE.eauY):null,sousEauM:Math.round(sous*ds),aLEnversM:Math.round(env*ds),plusBas:Math.round(bas),plusHaut:Math.round(haut),L:Math.round(L),
    noie:trackMeshes.filter(function(o){return o.material&&o.material.userData&&o.material.userData.jNoie;}).length,route:{sous:JRE.sous,n:JRE.n},mods9:(typeof MODS!=='undefined'&&MODS||[]).map(function(m){return [Math.round(m.s0),Math.round(m.s1),m.fig||''];})};};
