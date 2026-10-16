/* =====================================================================================================================
   LE MOTEUR DES VOITURES (2026-10-16) — pour LES VOITURES DU JEU (repertoire-voitures/index.html).
   Repris de la SALLE BLANCHE (salle-blanche.html, 09/10) : la page LIT le jeu (index.html) et exécute les VRAIS constructeurs des
   caisses (CARS, SHAPES, lpKit, lpWheel…) ; seules les matières sont refaites, en studio. Deux choses de plus :
   1. LA SOURCE = LE MAIN, AU COMMIT PRÈS. On demande à GitHub le dernier commit du main qui a touché le jeu (une petite requête), puis
      on lit index.html À CE COMMIT (une adresse qui ne change jamais : aucun cache périmé). Sans réseau ou sans réponse : la copie à côté.
   2. LA LECTURE SE RÉPARE SEULE. La salle blanche prenait les blocs du jeu par leur début de ligne ; le 14/10, Sacha a posé une
      constante dans le <head> (SANS_CARRIERE) et la salle ne s'ouvrait plus. Ici, chaque nom qui manque (« X is not defined ») est
      cherché dans le jeu (sa déclaration de premier niveau, découpée aux parenthèses près) et inséré JUSTE AVANT le morceau qui en
      avait besoin ; introuvable (il vient d'un autre fichier) ou dangereux (un 2e contexte WebGL, du son), il devient un TROU NOIR
      qui avale tout sans rien casser. Pareil quand une caisse, en se construisant, réclame un nom : on le pose, on relit, on recommence.
   ===================================================================================================================== */
'use strict';
const BG=new THREE.Color(0xf1f1ef); // ⚠ = --fond de la page : le fond de la salle ET la brume du sol
let G=null; // ce que le jeu nous prête : CARS, CAR_UNLOCK, RARETES, carRar, carOrdre, SHAPES, lpKit, lpWheel…

/* ---------------------------------------------------------------------------------------------------------------------
   1. LIRE LE JEU
   --------------------------------------------------------------------------------------------------------------------- */
const DEPOT='sachaberes-lgtm/CAR-CASH-GIT',CHEMIN='VERSION%20PRINCIPALE/index.html';
const SOURCE={nom:'',sha:'',msg:'',quand:'',auteur:'',lu:0,emp:'',texte:''};
const empreinte=t=>{let h=0;for(let i=0;i<t.length;i+=7)h=(h*31+t.charCodeAt(i))|0;return t.length+':'+h;};
async function dernierCommit(){ // le dernier commit du main qui a touché le jeu — null si GitHub ne répond pas (hors ligne, limite de 60/h)
  try{const r=await fetch('https://api.github.com/repos/'+DEPOT+'/commits?sha=main&per_page=1&path='+CHEMIN,{cache:'no-store'});
    if(!r.ok)return null;const j=await r.json(),c=j&&j[0];if(!c)return null;
    return {sha:c.sha,msg:(c.commit.message||'').split('\n')[0],quand:c.commit.committer.date,auteur:(c.commit.author&&c.commit.author.name)||''};}
  catch(e){return null;}}
// rend true si le jeu a changé (et G est relu), false s'il est le même qu'à la lecture d'avant
async function lireJeu(){
  const local=/[?&]source=local/.test(location.search);
  if(!local){
    const c=await dernierCommit();
    if(c&&c.sha===SOURCE.sha)return false;                                    // le même commit : rien n'a bougé
    const url='https://raw.githubusercontent.com/'+DEPOT+'/'+(c?c.sha:'main')+'/'+CHEMIN+(c?'':'?t='+Date.now());
    try{const r=await fetch(url,{cache:c?'default':'no-store'});if(!r.ok)throw new Error('GitHub '+r.status);
      const t=await r.text(),e=empreinte(t);
      if(!c&&e===SOURCE.emp&&SOURCE.nom==='main')return false;
      evaluerJeu(t);
      Object.assign(SOURCE,{nom:'main',sha:c?c.sha:'',msg:c?c.msg:'',quand:c?c.quand:'',auteur:c?c.auteur:'',lu:Date.now(),emp:e,texte:t});
      return true;}
    catch(e){console.warn('le main ne se lit pas, la copie locale prend le relais :',e);}}
  // la copie d'index.html à côté (⚠ le service worker du jeu répond à `index.html` depuis SON cache : une requête à part y échappe)
  const r=await fetch('../index.html?voitures='+Date.now(),{cache:'no-store'});
  if(!r.ok)throw new Error('index.html : '+r.status);
  const t=await r.text(),e=empreinte(t);
  if(e===SOURCE.emp&&SOURCE.nom==='local')return false;
  evaluerJeu(t);Object.assign(SOURCE,{nom:'local',sha:'',msg:'',quand:'',auteur:'',lu:Date.now(),emp:e,texte:t});return true;}

/* LE TROU NOIR : un nom qu'on ne sait pas fournir. Tout ce qu'on lui demande rend le trou noir lui-même (propriété, appel, `new`) ;
   compté, il vaut 0 ; écrit, il garde. Une caisse qui s'en sert se construit sans cette pièce, au lieu de ne pas se construire. */
const TROU=(()=>{const f=function(){};let p;
  p=new Proxy(f,{get:(t,k)=>k===Symbol.toPrimitive?(()=>0):k==='length'?0:k===Symbol.iterator?function*(){}:k==='then'?undefined:p,
    apply:()=>p,construct:()=>p,set:()=>true,has:()=>false});return p;})();
const DANGEREUX=/WebGLRenderer|AudioContext|getContext\(|new\s+Worker|requestAnimationFrame|addEventListener|setInterval|localStorage\.setItem/;
// la déclaration de premier niveau d'un nom, découpée aux parenthèses près (chaînes, gabarits, commentaires et expressions régulières sautés)
function declaration(L,nom){
  const n=nom.replace(/[$]/g,'\\$'),
    reV=new RegExp('^(?:const|let|var)\\s+(?:[^=]*?[,\\s])?'+n+'\\s*=(?!=)'),
    reF=new RegExp('^(?:async\\s+)?function\\s*\\*?\\s*'+n+'\\s*\\('),reC=new RegExp('^class\\s+'+n+'\\b');
  let k=-1;for(let i=0;i<L.length;i++){const l=L[i];if(l.charCodeAt(0)<=32)continue;if(reV.test(l)||reF.test(l)||reC.test(l)){k=i;break;}}
  if(k<0)return null;
  const T=L.slice(k,k+4000).join('\n'),fn=!reV.test(L[k]);
  let d=0,vu=false,i=0,prec='';
  const regexPossible=()=>/[(,=:[!&|?{};+\-*%<>~^]$/.test(prec)||prec==='';
  for(;i<T.length;i++){const ch=T[i];
    if(ch==='/'&&T[i+1]==='/'){while(i<T.length&&T[i]!=='\n')i++;i--;continue;}
    if(ch==='/'&&T[i+1]==='*'){const j=T.indexOf('*/',i+2);i=j<0?T.length:j+1;continue;}
    if(ch==='"'||ch==="'"||ch==='`'){const q=ch;i++;while(i<T.length&&T[i]!==q){if(T[i]==='\\')i++;i++;}prec='a';continue;}
    if(ch==='/'&&regexPossible()){let cl=false;i++;while(i<T.length&&(T[i]!=='/'||cl)&&T[i]!=='\n'){if(T[i]==='\\')i++;else if(T[i]==='[')cl=true;else if(T[i]===']')cl=false;i++;}prec='a';continue;}
    if('([{'.includes(ch)){d++;vu=true;}
    else if(')]}'.includes(ch)){d--;if(d===0&&fn&&ch==='}'&&vu){i++;break;}}
    else if(d===0&&!fn&&ch===';'){i++;break;}
    else if(d===0&&!fn&&ch==='\n'){ // fin de ligne au niveau 0 : la déclaration s'arrête si la ligne suivante ne la prolonge pas
      const suite=T.slice(i+1).match(/^\s*(\S)/);if(!suite||!/[.?:+\-*/,&|=]/.test(suite[1]))break;}
    if(ch>' ')prec=ch;}
  return T.slice(0,i);}

/* LES MORCEAUX : ceux que la salle blanche savait déjà prendre (début de ligne → début de ligne), puis ce que la réparation y ajoute.
   Chaque morceau garde ses lignes : une erreur dit sa ligne, on sait QUEL morceau l'a levée. */
let AJOUTS=[]; // [{nom, code, avant: n° du morceau d'origine devant lequel il se place (Infinity = à la fin)}] — gardés d'une lecture à l'autre
function morceauxDe(L){
  const ligne=(debut,apres)=>{for(let i=apres||0;i<L.length;i++)if(L[i].startsWith(debut))return i;return -1;};
  const bloc=(debut,fin,comprise)=>{const a=ligne(debut);if(a<0){console.warn('morceau introuvable :',debut);return '';}
    let b=a+1;while(b<L.length&&!L[b].startsWith(fin))b++;if(b>=L.length){console.warn('fin introuvable :',fin);return '';}
    return L.slice(a,comprise?b+1:b).join('\n');};
  const un=d=>{const a=ligne(d);return a<0?'':L[a];};
  return [
    'const IS_MOBILE=false,IS_LOW_END=false,POKI=false;const sphere9=g=>g.computeBoundingSphere();',
    bloc('const MATV={','const SPH9=',false),                // les vraies peaux peintes (paillettes, pop-tart, requin…)
    bloc('const CLOUD_SPH=','/* LE CIEL DE COTON',false),
    bloc('const CARS=[','];',true),
    bloc('const CAR_UNLOCK=[','/* ==========',false),
    bloc('const AURA_RANKS=','function auraRank',false),
    bloc('const RARETES=[','function rarListe',false),       // RARETES + carRar + carOrdre
    bloc('const SPH9=','/* ---- LE KIT LOW-POLY',false),
    bloc('const LPU={','/* ---- LES 6 SILHOUETTES',false),
    bloc('const SHAPES={','/* ===== LA GAMME DES 50 — FIN',false),
    bloc('const FACET_SHAPES=','function facetteCaisse',false),
    bloc('const NUAGE_BLOBS=','const GH=',false),
    un('function lingotGeo('),
    // TOUS les gabarits posés hors de la gamme (`SHAPES.xxx=function…` : le lingot, l'origami, ATCHOUM, le SQUALE… et ceux de demain)
    ...L.map((l,i)=>/^SHAPES\.\w+=/.test(l)?i:-1).filter(i=>i>=0).map(i=>{let b=i+1;while(b<L.length&&!L[b].startsWith('};'))b++;return L.slice(i,b+1).join('\n');}),
    bloc('const NY_U=','const SHAPES={',false),
    un('const ATCH=')];}
const RETOUR='return {CARS,CAR_UNLOCK,RARETES,carRar,carOrdre,AURA_RANKS,SHAPES,lpKit,lpWheel,lpOmbre,carProfile,SPH9,FACET_SHAPES,geoFacette,echRetire,echappement,monte:function(g){carGroup=g;}};';
const STUBS=()=>({envTex:null,carFins:[],rimify:()=>{},lpGrad:()=>{},nuageShader:()=>{},vMat:m=>m,lampTex:null,
  LINGOT_MAT:(()=>{const m=new THREE.MeshPhongMaterial({color:0xc08a1c});m.userData.g='o';return m;})(),
  LINGOT_PL:(()=>{const m=new THREE.MeshPhongMaterial({color:0xd99a1c});m.userData.g='o';return m;})(),
  RIM_U:{},ENV_VERNIS:'',LFB_CAISSE:'',RIM_GLSL:()=>'',I18N:{},LANG:'fr',TR:s=>s,__TROU:TROU});
// la ligne d'une erreur dans le code assemblé (pile de Chrome / Safari) — l'en-tête de `new Function` est étalonné une fois
const DECALE=(()=>{try{new Function('a','\n\nnull.x;')();}catch(e){const m=/(?:<anonymous>|Function):(\d+):\d+/.exec(e.stack||'');if(m)return +m[1]-3;}return 2;})();
const ligneErreur=e=>{const m=/(?:<anonymous>|Function):(\d+):\d+/.exec((e&&e.stack)||'');return m?+m[1]-DECALE-1:-1;}; // 0 = 1re ligne du corps
let SEGS=null; // le plan de la dernière lecture : [{code, d (1re ligne), f, ori (n° du morceau d'origine ou -1), nom}]
function construire(M,L){
  const S=[{code:'let carGroup=null;',ori:-1}],mets=a=>S.push({code:a.code,ori:-1,nom:a.nom});
  M.forEach((code,o)=>{for(const a of AJOUTS)if(a.avant===o)mets(a);S.push({code,ori:o});});
  for(const a of AJOUTS)if(!(a.avant>=0&&a.avant<M.length))mets(a);
  S.push({code:RETOUR,ori:-1});
  let l=0;for(const s of S){s.d=l;l+=s.code.split('\n').length;s.f=l;}
  SEGS=S;const st=STUBS();
  return new Function('THREE',...Object.keys(st),S.map(s=>s.code).join('\n'))(THREE,...Object.values(st));}
// un nom manque : on le pose devant le morceau qui l'a réclamé (ou à la fin s'il a été réclamé pendant une construction de caisse) ;
// réclamé par un AJOUT, il se pose juste devant cet ajout (l'ordre du tableau = l'ordre dans le code, à place égale)
let DERNIER=null;
function reparer(e,L,pendantCaisse){
  const msg=String(e&&e.message||''),m=/^([\w$]+) is not defined/.exec(msg)||/Can't find variable: ([\w$]+)/.exec(msg);
  if(e instanceof SyntaxError){ // un ajout mal découpé : il devient un trou noir
    if(DERNIER&&DERNIER.code.indexOf('__TROU')<0){DERNIER.code='const '+DERNIER.nom+'=__TROU;';return true;}return false;}
  const tdz=/Cannot access '([\w$]+)' before initialization/.exec(msg)||/Cannot access uninitialized variable/.exec(msg);
  const ln=ligneErreur(e),seg=SEGS&&SEGS.find(s=>ln>=s.d&&ln<s.f),aj=seg&&seg.nom?AJOUTS.find(x=>x.nom===seg.nom):null;
  if(tdz){ // un ajout posé trop tôt (il lit une constante d'un morceau plus bas) : il descend juste après ce morceau
    if(!aj||!tdz[1])return false;
    const def=SEGS.findIndex(s=>s.ori>=0&&new RegExp('(?:^|\\n)(?:const|let|var)\\s+(?:[^=\\n]*?[,\\s])?'+tdz[1].replace(/[$]/g,'\\$')+'\\s*=').test(s.code));
    if(def<0)return false;const suiv=SEGS.slice(def+1).find(s=>s.ori>=0),nv=suiv?suiv.ori:Infinity;
    if(nv===aj.avant)return false;aj.avant=nv;return true;}
  if(!m)return false;const nom=m[1];if(AJOUTS.some(a=>a.nom===nom))return false;
  let code=declaration(L,nom);
  if(!code||DANGEREUX.test(code))code='const '+nom+'=__TROU;';
  const n={nom,code,avant:aj?aj.avant:pendantCaisse?Infinity:(seg&&seg.ori>=0?seg.ori:0)};
  if(aj)AJOUTS.splice(AJOUTS.indexOf(aj),0,n);else AJOUTS.push(n);
  DERNIER=n;return true;}
let LIGNES=null,MORCEAUX=null;
function evaluerJeu(SRC){
  LIGNES=SRC.split('\n');MORCEAUX=morceauxDe(LIGNES);DERNIER=null;
  for(let essai=0;essai<150;essai++){
    try{G=construire(MORCEAUX,LIGNES);DERNIER=null;return;}
    catch(e){if(!reparer(e,LIGNES,false))throw e;}}
  throw new Error('la lecture du jeu ne se répare pas');}
// une caisse qui, en se construisant, réclame un nom : on le pose, on relit le jeu, on recommence (10 fois au plus)
function avecReparation(fn){
  for(let essai=0;essai<10;essai++){
    try{return fn();}
    catch(e){if(!(e instanceof ReferenceError)||!reparer(e,LIGNES,true))throw e;
      for(let k=0;k<40;k++){try{G=construire(MORCEAUX,LIGNES);DERNIER=null;break;}catch(e2){if(!reparer(e2,LIGNES,false))throw e2;}}}}
  return fn();}
const reparations=()=>AJOUTS.map(a=>a.nom+(a.code.indexOf('__TROU')>=0?' (trou noir)':''));

/* ---------------------------------------------------------------------------------------------------------------------
   2. ASSEMBLER UNE CAISSE — buildCar, tel que cuire-caisses.js le refait (aileron, bandes, propulseurs, roues, feux, pots…)
   --------------------------------------------------------------------------------------------------------------------- */
function assemble(i){
  const {CARS,SHAPES,lpKit,lpWheel,lpOmbre,carProfile,SPH9,FACET_SHAPES,geoFacette}=G;
  const spec=CARS[i],wreck=i===0,grp=new THREE.Group();G.monte(grp);
  const tag=(m,g)=>{m.userData.g=g;return m;};
  const bodyM=tag(new THREE.MeshPhongMaterial({color:spec.color}),'p'),accM=tag(new THREE.MeshPhongMaterial({color:spec.accent}),'p'),
    glassM=tag(new THREE.MeshPhongMaterial({color:0x0d1620}),'g'),chromeM=tag(new THREE.MeshPhongMaterial({color:0xe8ecf0}),'c'),
    darkM=tag(new THREE.MeshPhongMaterial({color:0x14161a}),'m'),rustM=tag(new THREE.MeshPhongMaterial({color:0x5a3a20}),'m');
  const y0=.35,W9=spec.w,H9=spec.h,L9=spec.l;
  const add=m=>{grp.add(m);return m;};
  const box=(w,h,d,mat,x,y,z)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x||0,y||0,z||0);return add(m);};
  const prof=(pts,w,mat,yy)=>{const m=new THREE.Mesh(carProfile(pts,w),mat);m.position.y=(yy===undefined?y0:yy);return add(m);};
  const cyl=(rt,rb,hh,mat,x,y,z,sg)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,hh,sg||12),mat);m.position.set(x||0,y||0,z||0);return add(m);};
  const sph=(sx,sy,sz,mat,x,y,z)=>{const m=new THREE.Mesh(SPH9,mat);m.scale.set(sx,sy,sz);m.position.set(x||0,y||0,z||0);return add(m);};
  const con=(r,hh,mat,x,y,z,sg)=>{const m=new THREE.Mesh(new THREE.ConeGeometry(r,hh,sg||12),mat);m.position.set(x||0,y||0,z||0);return add(m);};
  // ⚠ les pièces du kit sont peintes DES DEUX CÔTÉS, comme dans le jeu (lpMat : DoubleSide) — sinon une face retournée devient un trou
  //   (le SQUALE montrait des « transparences » partout, Léo 9/10)
  const lpM={},lpMatC=g=>lpM[g]||(lpM[g]=tag(new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide}),g)),kitM=m=>{m.userData.kit=1;return m;};
  const commit=kt=>{const gs=kt.ech?kt.done():G.echRetire(kt.done(),kt.prims,spec.shape);for(const g in gs){if(g!=='l')lpOmbre(gs[g],H9);add(new THREE.Mesh(gs[g],kitM(lpMatC(g))));}}; // (l'ancien embout ôté, voir echRetire)
  const K={W:W9,H:H9,L:L9,y0,spec,wreck,add,box,prof,cyl,sph,con,kit:pal=>lpKit(pal),commit,
    body:bodyM,acc:accM,glass:glassM,chrome:chromeM,dark:darkM,rust:rustM};
  const A=Object.assign({hl:[W9*.32,y0+H9*.50,L9/2+.16],tl:[W9*.30,y0+H9*.55,-L9/2-.10],wr:1,wx:W9/2,wz:L9/2-.75,wy:0,
    glowX:W9/2+.02,glowY:y0+H9*.42,glowL:L9*.82,glowF:1,sp:1,skirt:1,split:1,doors:0,slats:0,wings:'panel'},SHAPES[spec.shape](K)||{});
  if(A.lpw)Object.assign(A,{lamps:0,pipes:0,sp:0,split:0,doors:0,slats:0});
  G.echappement(K,spec.shape,A);                       // LE POT de la caisse, comme buildCar (il déclare ses bouches)
  if(spec.spoiler&&A.sp){box(W9*.98,.09,.5,accM,0,y0+H9+.42,-L9/2+.12);for(const sd of[-1,1])box(.09,.34,.12,darkM,sd*W9*.36,y0+H9+.22,-L9/2+.12);}
  if(spec.glow){const gm=tag(new THREE.MeshBasicMaterial({color:spec.glow}),'l');
    for(const sd of[-1,1])box(.05,.06,A.glowL,gm,sd*A.glowX,A.glowY,0);if(A.glowF)box(W9*.7,.06,.05,gm,0,y0+H9*.5,L9/2+.02);}
  if(spec.rocket){const bm=tag(new THREE.MeshPhongMaterial({color:0x3a3f48}),'c'),nm=tag(new THREE.MeshBasicMaterial({color:spec.glow||0x66c8ff}),'l');
    for(const sd of[-1,1]){cyl(.24,.3,.9,bm,sd*W9*.26,y0+H9*.55,-L9/2-.32,10).rotation.x=Math.PI/2;cyl(.16,.2,.1,nm,sd*W9*.26,y0+H9*.55,-L9/2-.82,10).rotation.x=Math.PI/2;}}
  // LES ROUES : une géométrie dans son repère (essieu = X), posée quatre fois (miroir à gauche pour le kit) — EXACTEMENT comme buildCar,
  // fiche comprise : `wxF` (voie avant), `wRF` (échelle avant), `w1F`/`lpwF` (UNE roue avant au milieu, le SQUALE : ses deux roues avant
  // perçaient les nageoires dans la salle, Léo 9/10)
  const roue=new THREE.Group(),roues=[];
  if(A.lpw){const W9=A.lpw,gs=lpWheel(W9),gs1=A.w1F?lpWheel(Object.assign({},W9,A.lpwF||{},{deux:1})):null;
    for(const[sx,sz]of[[-1,1],[1,1],[-1,-1],[1,-1]]){const seule=gs1&&sz>0;if(seule&&sx<0)continue;
      const g9=seule?gs1:gs,kF=sz>0&&A.wRF?A.wRF:1,w=new THREE.Group();for(const g in g9)w.add(new THREE.Mesh(g9[g],kitM(lpMatC(g))));
      w.scale.set((sx<0&&!seule?-1:1)*kF,kF,kF);
      w.position.set(seule?0:sx*(sz>0&&A.wxF!=null?A.wxF:A.wx),W9.R*kF+A.wy,sz>0?(A.wzF!=null?A.wzF:A.wz):-(A.wzR!=null?A.wzR:A.wz));
      if(A.roueDeco)A.roueDeco(w,sx,sz);grp.add(w);} // (LA DÉFERLANTE) les pièces que le gabarit pose DANS la roue
  }else{const R9=.40*A.wr,w=new THREE.Group();
    w.add(new THREE.Mesh(new THREE.CylinderGeometry(R9,R9,.32*A.wr,14),darkM));
    w.add(new THREE.Mesh(new THREE.CylinderGeometry(R9*.6,R9*.6,.34*A.wr,10),wreck?darkM:chromeM));
    for(let k=0;k<5;k++){const s=new THREE.Mesh(new THREE.BoxGeometry(R9*1.05,R9*.9,.05),wreck?darkM:chromeM);s.rotation.y=k*Math.PI*2/5;w.add(s);}
    w.add(new THREE.Mesh(new THREE.CylinderGeometry(.075,.075,.37*A.wr,8),wreck?rustM:chromeM));
    w.rotation.z=Math.PI/2;roue.add(w);
    for(const[sx,sz]of[[-1,1],[1,1],[-1,-1],[1,-1]])roues.push({x:sx*A.wx,y:R9+A.wy,z:sz*A.wz,miroir:false});}
  const hlM=tag(new THREE.MeshBasicMaterial({color:0xfff6c8}),'l'),tlM=tag(new THREE.MeshBasicMaterial({color:0xff2a2a}),'l');
  for(const sd of[-1,1]){
    if(A.lamps!==0){box(.30,.13,.06,(wreck&&sd>0)?darkM:hlM,sd*A.hl[0],A.hl[1],A.hl[2]);box(.34,.10,.05,tlM,sd*A.tl[0],A.tl[1],A.tl[2]);}
    if(A.pipes!==0)cyl(.09,.11,.34,wreck?rustM:chromeM,sd*W9*.22,y0+.08,-L9/2-.14,10).rotation.x=Math.PI/2;}
  if(A.doors){const sm=tag(new THREE.MeshBasicMaterial({color:0x0a0c10}),'m');
    for(const sd of[-1,1]){for(const zz of[L9*.07,-L9*.17])box(.012,H9*.5,.03,sm,sd*(W9/2+.005),y0+H9*.45,zz);box(.03,.035,.16,wreck?rustM:chromeM,sd*(W9/2+.02),y0+H9*.66,L9*.01);}}
  if(A.split){box(W9*.96,.05,.3,darkM,0,y0+H9*.04,L9/2+.12);box(W9*.86,.09,.26,darkM,0,y0+H9*.06,-L9/2-.10);for(const fx of[-1,0,1])box(.03,.13,.24,darkM,fx*W9*.26,y0+H9*.10,-L9/2-.10);}
  if(A.slats)for(const gy of[-1,1])box(W9*.5,.02,.02,chromeM,0,y0+H9*.42+gy*.045,L9/2+.145);
  if(FACET_SHAPES[spec.shape])for(const racine of[grp,roue])racine.traverse(o=>{
    if(!o.isMesh||!o.geometry||(o.material.userData&&o.material.userData.kit))return;
    const f=geoFacette(o.geometry);if(f)o.geometry=f;});
  for(const r of roues){const w=roue.clone();w.position.set(r.x,r.y,r.z);if(r.miroir)w.scale.x=-1;grp.add(w);}
  grp.userData.A=A;grp.userData.spec=spec; // les ancrages du jeu (pots, phares…) : les réactions au toucher en partent
  return studio(grp); // la caisse posée dans sa BOÎTE (centrée, au sol) : c'est elle qu'on fait tourner
}

/* ---------------------------------------------------------------------------------------------------------------------
   3. LES MATIÈRES DU STUDIO — la famille de chaque matière (`userData.g` du jeu : p laque · c chrome · o or · s satiné · m mat ·
   g verre · l lumière) devient une matière physique. Couleurs du jeu (sRGB) passées en linéaire : l'image sort en sRGB.
   --------------------------------------------------------------------------------------------------------------------- */
const MATS=new Map();
const REGLE={
  p:{t:'phys',roughness:.34,metalness:.08,clearcoat:1,clearcoatRoughness:.06},
  c:{t:'std',roughness:.13,metalness:1},
  o:{t:'std',roughness:.22,metalness:1},
  s:{t:'std',roughness:.46,metalness:.22},
  m:{t:'std',roughness:.82,metalness:0},
  g:{t:'phys',roughness:.05,metalness:0,clearcoat:1,clearcoatRoughness:.02,envMapIntensity:1.35},
  ice:{t:'phys',roughness:.04,metalness:0,clearcoat:1,clearcoatRoughness:.02,envMapIntensity:1.0}, // la GLACE (L'ICEBERG)
  givre:{t:'phys',roughness:.38,metalness:0,clearcoat:.35,clearcoatRoughness:.2,envMapIntensity:.6}, // la PORCELAINE translucide (LA FOURNAISE) — on voit au travers (transparente, sans profondeur)
  l:{t:'basic'}};
function linGeo(geo){ // les couleurs de sommets du kit, en linéaire — une fois par géométrie (les roues partagent la leur)
  if(geo.userData.lin||!geo.attributes.color)return;geo.userData.lin=1;
  const a=geo.attributes.color.array;for(let k=0;k<a.length;k++){const c=a[k];a[k]=c<.04045?c/12.92:Math.pow((c+.055)/1.055,2.4);}
  geo.attributes.color.needsUpdate=true;}
function studioMat(m){
  if(Array.isArray(m))return m.map(studioMat);
  let g=(m.userData&&m.userData.g)||(m.isMeshBasicMaterial?'l':'s');if(!REGLE[g])g='s';
  const map=(m.map&&m.map.image)?m.map:null;
  const cle=g+'|'+(m.color?m.color.getHexString():'x')+'|'+(m.vertexColors?1:0)+'|'+(map?map.uuid:'')+'|'+(m.transparent?1:0)+'|'+m.side+'|'+(m.opacity!=null?m.opacity:1);
  if(MATS.has(cle))return MATS.get(cle);
  const R=REGLE[g],o={vertexColors:!!m.vertexColors,side:m.side,transparent:!!m.transparent,opacity:m.opacity!=null?m.opacity:1};
  if(map){map.encoding=THREE.sRGBEncoding;map.needsUpdate=true;o.map=map;}
  if(m.transparent&&map)o.alphaTest=.02;
  let n;
  if(R.t==='basic')n=new THREE.MeshBasicMaterial(Object.assign(o,{toneMapped:false}));
  else{const p=Object.assign({},R);delete p.t;Object.assign(o,p);
    n=R.t==='phys'?new THREE.MeshPhysicalMaterial(o):new THREE.MeshStandardMaterial(o);}
  if(m.color)n.color.copy(m.color).convertSRGBToLinear();
  if(g==='ice'||g==='givre')n.depthWrite=false;
  n.userData.g=g;MATS.set(cle,n);return n;}
function studio(grp){
  grp.traverse(o=>{
    if(o.isSprite&&o.userData.feu){const m=o.material;if(m.map){m.map.encoding=THREE.sRGBEncoding;m.map.needsUpdate=true;}m.toneMapped=false;return;} // LE FEU EN PIXELS de LA FOURNAISE
    if(!o.isMesh)return;
    if(o.userData.brut){if(o.geometry)linGeo(o.geometry);o.material.toneMapped=false;o.castShadow=!!o.userData.ombre;return;} // une matière qui VIT (la lave, l'eau) : gardée telle quelle ; `ombre` = elle porte son ombre (le fond de LA DÉFERLANTE)
    o.material=studioMat(o.material);if(o.geometry)linGeo(o.geometry);
    const g=(Array.isArray(o.material)?o.material[0]:o.material).userData.g;
    o.castShadow=g!=='l'&&g!=='ice';o.receiveShadow=g!=='l'&&g!=='g'&&g!=='ice';}); // la glace ne fait pas d'ombre pleine : la lame, les roues et le platine la font
  // posée au sol, centrée sur la longueur
  const b=new THREE.Box3().setFromObject(grp),c=b.getCenter(new THREE.Vector3());
  grp.position.set(-c.x,-b.min.y,-c.z);
  const boite=new THREE.Group();boite.add(grp);boite.userData.taille=b.getSize(new THREE.Vector3());return boite;}

/* ---------------------------------------------------------------------------------------------------------------------
   4. LA SALLE — fond blanc infini (le sol se fond dans la brume, de la couleur du fond), une boîte à lumière au plafond et des
   bandeaux sur les côtés (dans la carte d'environnement : c'est eux qu'on voit glisser sur la laque), ombre douce + ombre de contact.
   --------------------------------------------------------------------------------------------------------------------- */

/* ---------------------------------------------------------------------------------------------------------------------
   4. LA SALLE — fond blanc infini, une boîte à lumière au plafond et des bandeaux sur les côtés (dans la carte d'environnement : c'est
   eux qu'on voit glisser sur la laque), ombre douce + ombre de contact.
   --------------------------------------------------------------------------------------------------------------------- */
let R=null;
const LUM={murs:.36,sol:.3,haut:9,gauche:6,droite:4.8,fond:4,face:2.6,hemi:.26,cle:1.4,ret:.38,expo:.8,solEnv:.9};
function salleEnv(){ // la salle vue par la laque : murs gris, plafond-boîte à lumière, deux bandeaux, sol
  const s=new THREE.Scene(),mb=(c)=>new THREE.MeshBasicMaterial({color:c,side:THREE.BackSide});
  const murs=new THREE.Mesh(new THREE.BoxGeometry(24,12,24),mb(new THREE.Color(LUM.murs,LUM.murs,LUM.murs)));murs.position.y=6;s.add(murs);
  const pan=(w,h,x,y,z,rx,ry,k)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:new THREE.Color(k,k,k),side:THREE.DoubleSide}));
    m.position.set(x,y,z);m.rotation.set(rx,ry,0);s.add(m);};
  pan(12,6,0,11.8,0,Math.PI/2,0,LUM.haut);       // la grande boîte à lumière du plafond
  pan(2.2,7,-11.8,5,-2,0,Math.PI/2,LUM.gauche);   // bandeau gauche
  pan(2.2,7,11.8,5,3,0,-Math.PI/2,LUM.droite);    // bandeau droit
  pan(14,1.4,0,6.5,-11.8,0,0,LUM.fond);           // filet du fond
  pan(10,1.2,0,4.5,11.8,0,Math.PI,LUM.face);      // filet de face
  const sol=new THREE.Mesh(new THREE.PlaneGeometry(24,24),new THREE.MeshBasicMaterial({color:new THREE.Color(LUM.sol,LUM.sol,LUM.sol*.98)}));
  sol.rotation.x=-Math.PI/2;sol.position.y=.01;s.add(sol);
  const pm=new THREE.PMREMGenerator(R),t=pm.fromScene(s,.035).texture;pm.dispose();return t;}
let ENV=null; // posée par moteurInit (il faut la toile)

function ombreTex(){ // l'ombre de contact : l'empreinte de la caisse (rectangle arrondi) noyée dans un flou — nulle au bord de la toile
  const c=document.createElement('canvas');c.width=128;c.height=256;const x=c.getContext('2d');
  x.filter='blur(13px)';x.fillStyle='rgba(0,0,0,.55)';
  const r=(a,b,w,h,k)=>{x.beginPath();x.moveTo(a+k,b);x.arcTo(a+w,b,a+w,b+h,k);x.arcTo(a+w,b+h,a,b+h,k);x.arcTo(a,b+h,a,b,k);x.arcTo(a,b,a+w,b,k);x.fill();};
  r(34,40,60,176,18);x.filter='blur(5px)';x.fillStyle='rgba(0,0,0,.35)';r(42,52,44,152,12);
  return new THREE.CanvasTexture(c);}
const OMBRE_T=ombreTex();
function plateau(scene,ombreGrande){ // sol + lumières d'une scène (la salle, ou le petit studio des vignettes)
  scene.background=null;scene.environment=ENV;scene.fog=new THREE.Fog(BG,16,48);
  const sol=new THREE.Mesh(new THREE.PlaneGeometry(400,400),new THREE.MeshStandardMaterial({color:0xffffff,roughness:1,metalness:0,envMapIntensity:LUM.solEnv}));
  sol.rotation.x=-Math.PI/2;sol.receiveShadow=true;scene.add(sol);
  const hemi=new THREE.HemisphereLight(0xffffff,0xdedcd8,LUM.hemi);scene.add(hemi);
  const cle=new THREE.DirectionalLight(0xffffff,LUM.cle);cle.position.set(-2.6,9,3.4);cle.castShadow=true;
  const sc=cle.shadow.camera;sc.left=sc.bottom=-4.2;sc.right=sc.top=4.2;sc.near=1;sc.far=22;
  cle.shadow.mapSize.set(1024,1024);cle.shadow.bias=-.0006;cle.shadow.normalBias=.02;cle.shadow.radius=ombreGrande?14:9;
  scene.add(cle,cle.target);
  const ret=new THREE.DirectionalLight(0xfffaf2,LUM.ret);ret.position.set(5,3,-6);scene.add(ret);
  const o={scene,sol,hemi,cle,ret};PLATEAUX.push(o);return o;}
const PLATEAUX=[];

/* ---------------------------------------------------------------------------------------------------------------------
   5. LE STUDIO — UNE toile WebGL : la grande vue quand elle est ouverte, sinon l'atelier photo des vignettes (une par image).
   --------------------------------------------------------------------------------------------------------------------- */
function moteurInit(canvas){
  R=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
  R.setPixelRatio(1);
  // ⚠ tonemapping LINÉAIRE et non ACES : l'ACES décolore les laques vives (le rouge de ROSSO 40 sortait saumon) — mesuré en salle blanche
  R.outputEncoding=THREE.sRGBEncoding;R.toneMapping=THREE.LinearToneMapping;R.toneMappingExposure=LUM.expo;
  R.shadowMap.enabled=true;R.shadowMap.type=THREE.VSMShadowMap;R.setClearColor(BG,1);
  ENV=salleEnv();}
const CAISSES=new Map(),RATEES=new Map(); // i → la boîte (caisse posée, centrée, au sol) · i → l'erreur
function caisse(i){
  if(CAISSES.has(i))return CAISSES.get(i);if(RATEES.has(i))return null;
  try{const b=avecReparation(()=>assemble(i));CAISSES.set(i,b);return b;}
  catch(e){console.warn('caisse '+i+' ('+(G.CARS[i]||{}).name+') :',e);RATEES.set(i,String(e&&e.message||e));return null;}}
function oublieCaisses(){for(const b of CAISSES.values())b.traverse(o=>{if(o.geometry&&!o.geometry.userData.partage)o.geometry.dispose();});
  CAISSES.clear();RATEES.clear();}
/* L'ÉTALONNAGE DU SOL (de la salle blanche) : le sol est plat et toutes les lumières sont à l'infini — il a partout la même valeur hors
   des ombres. On la MESURE (un pixel du coin bas-gauche, juste après un rendu) et on règle son albédo pour qu'il sorte exactement du
   blanc du fond : plus de ligne d'horizon, la salle est infinie. */
const CAL={k:.4,n:0,ok:false,px:new Uint8Array(4)};
const lin8=v=>{v/=255;return v<.04045?v/12.92:Math.pow((v+.055)/1.055,2.4);};
function etalonne(){
  const gl=R.getContext();gl.readPixels(3,3,1,1,gl.RGBA,gl.UNSIGNED_BYTE,CAL.px);
  const m=(CAL.px[0]+CAL.px[1]+CAL.px[2])/3,cible=(BG.r+BG.g+BG.b)/3*255;CAL.n++;
  if(Math.abs(m-cible)<=.8||CAL.n>14){CAL.ok=true;return;}
  CAL.k*=m>=254.5?.6:lin8(cible)/Math.max(1e-4,lin8(m));
  for(const q of PLATEAUX)q.sol.material.color.setRGB(CAL.k,CAL.k,CAL.k*.995);}
function placeCam(cam,dist,el,ty){const y=ty+Math.sin(el)*dist,h=Math.cos(el)*dist;cam.position.set(0,y,h);cam.lookAt(0,ty*.9,0);}
