// Preuve sans navigateur (verif-restes) : ROTATION de l'iPhone, deux valeurs restées à l'ancienne taille d'écran.
// A) Écran titre (intro « 1.61 ») : le canvas #fxCv (cv9) est dimensionné UNE fois ; le téléphone tourne → il garde 844x390 et le CSS
//    (100 % x 100 %) l'étire en 390x844 : poussière et halo écrasés. On exécute le VRAI début de l'IIFE (de « const cv9= » à la boucle des
//    240 particules) avec un faux DOM, on tourne l'écran (innerWidth/innerHeight + événement resize) et on lit cv9.width/height.
// B) Accueil : `menuCadre` (cadrage de la caisse) rend son cache pendant 1 s après la rotation → la caisse reste cadrée pour l'ancienne
//    orientation. On exécute la VRAIE menuCadre (faux DOM : logo, tuiles), on tourne l'écran 200 ms après la 1re lecture, on relit.
// Usage : node preuve-restes.cjs "<index.html>"   Sort 0 si les deux suivent la rotation, 1 sinon.
const fs=require('fs');const src=fs.readFileSync(process.argv[2],'utf8').split('\n');
const fin=(i0,t)=>{let i=i0;while(!t(src[i]))i++;return i;};
const ko=[];
{ // A
  const a=src.findIndex(l=>l.includes("const cv9=document.getElementById('fxCv'),ctx9=cv9.getContext('2d');"));
  const b=fin(a,l=>l.includes('for(let i=0;i<240;i++)'));
  const txt=src.slice(a,b).join('\n');
  const W={innerWidth:844,innerHeight:390,L:{}};
  const cv={width:0,height:0,getContext:()=>({})};
  const doc={getElementById:id=>id==='fxCv'?cv:{}};
  const f=new Function('document','W','addEventListener','removeEventListener','performance',
    'let innerWidth=W.innerWidth,innerHeight=W.innerHeight;Object.defineProperty(W,"_get",{value:()=>0});'+
    // les lectures de innerWidth/innerHeight doivent voir la taille COURANTE : on les redirige vers W
    txt.replace(/\binnerWidth\b/g,'W.innerWidth').replace(/\binnerHeight\b/g,'W.innerHeight')+';');
  const add=(t,fn)=>{(W.L[t]=W.L[t]||[]).push(fn);};
  f(doc,W,add,()=>{},{now:()=>0});
  const avant=cv.width+'x'+cv.height;
  W.innerWidth=390;W.innerHeight=844;(W.L.resize||[]).forEach(fn=>fn());
  if(cv.width!==390||cv.height!==844)ko.push('A splash : #fxCv '+avant+' → '+cv.width+'x'+cv.height+' après la rotation en 390x844 (image étirée)');
  else console.log('A splash : #fxCv '+avant+' → '+cv.width+'x'+cv.height+' (suit la rotation)');
}
{ // B
  const a=src.findIndex(l=>l.startsWith('function menuCadre(')),b=fin(a,l=>l==='}');
  const txt=src.slice(a,b+1).join('\n');
  const S={W:390,H:844,t:0};
  // faux accueil : logo en haut, tuiles en bas (debout) ; couché : logo + tuiles en colonne à droite
  const boite=(q)=>{const d=S.W<S.H;
    if(q==='.mTitle')return d?{left:40,right:350,top:60,bottom:160,width:310,height:100}:{left:500,right:820,top:20,bottom:110,width:320,height:90};
    if(q==='.mPlay')return d?{left:40,right:350,top:620,bottom:700,width:310,height:80}:{left:500,right:820,top:280,bottom:360,width:320,height:80};
    return {width:0,height:0};};
  const home={classList:{contains:c=>c==='on'},getClientRects:()=>[1],querySelector:q=>({getBoundingClientRect:()=>boite(q)})};
  const doc={getElementById:id=>id==='mHome'?home:null,documentElement:{classList:{contains:()=>false}}};
  const MENUV={cadre:{nx:0,ny:-.1,fr:.6,fh:.4,t:-9e9}};
  const mk=new Function('document','MENUV','S','menuZoneSure','performance',
    'const innerWidth_=()=>S.W;'+txt.replace(/\binnerWidth\b/g,'S.W').replace(/\binnerHeight\b/g,'S.H')+';return menuCadre;');
  const menuCadre=mk(doc,MENUV,S,()=>({t:0,r:0,b:0,l:0}),{now:()=>S.t});
  const c1=Object.assign({},menuCadre());
  S.t=200;S.W=844;S.H=390; // l'iPhone se couche
  const c2=Object.assign({},menuCadre());
  const r=v=>v.toFixed(2);
  if(c2.nx===c1.nx&&c2.ny===c1.ny&&c2.fr===c1.fr)ko.push('B accueil : menuCadre couché 200 ms après la rotation = cadrage debout (nx '+r(c2.nx)+' ny '+r(c2.ny)+' fr '+r(c2.fr)+') — la caisse reste au centre jusqu\'à 1 s');
  else console.log('B accueil : debout nx '+r(c1.nx)+' ny '+r(c1.ny)+' fr '+r(c1.fr)+' → couché nx '+r(c2.nx)+' ny '+r(c2.ny)+' fr '+r(c2.fr)+' (recadré tout de suite)');
  S.t=500;const c3=menuCadre();if(c3.t!==c2.t)ko.push('B accueil : le cache d\'1 s ne tient plus quand la taille ne change pas (recalcul à chaque image)');
}
console.log(ko.length?'KO :\n - '+ko.join('\n - '):'OK : le splash et le cadrage de l\'accueil suivent la rotation');process.exit(ko.length?1:0);
