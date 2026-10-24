/* preuve : le contexte 3D perdu au premier plan recharge le jeu (filet de 5 s, COURSE 24/10), mais pas en boucle — à la 4e perte de la
   session, l'écran « CASH CAR a calé » (window.__crash, bouton RELANCER) remplace le rechargement automatique.
   node passation/preuves/preuve-ctx-boucle.cjs "VERSION PRINCIPALE/index.html" — extrait les VRAIS écouteurs de webglcontextlost. */
const fs=require('fs'),vm=require('vm');
const h=fs.readFileSync(process.argv[2]||__dirname+'/../../VERSION PRINCIPALE/index.html','utf8');
const i=h.indexOf("renderer.domElement.addEventListener('webglcontextlost',function(e){e.preventDefault();");
const j=h.indexOf('function ccCtxEn(){',i),k=h.indexOf('\n',j);
if(i<0||j<0)throw new Error('écouteurs introuvables');
const code=h.slice(i,k);
let KO=[],ok=m=>console.log('OK   '+m),ko=m=>{KO.push(m);console.log('KO   '+m);};
function essai(perdusAvant,cache){
  const L={},sb={sessionStorage:{ccCtxPerdu:perdusAvant?String(perdusAvant):undefined},localStorage:{ccLang:'fr'},navigator:{language:'fr-FR'},
    document:{hidden:!!cache},rel:0,crash:null,minuteurs:[],enCoursPose(){},SAVE:{flush(){}}};
  sb.location={reload(){sb.rel++;}};sb.window=sb;sb.__crash=(t)=>{sb.crash=t;};
  sb.setTimeout=(f,ms)=>sb.minuteurs.push([f,ms]);
  sb.renderer={domElement:{addEventListener(n,f){(L[n]=L[n]||[]).push(f);}},getContext(){return {isContextLost(){return true;}};}};
  vm.createContext(sb);vm.runInContext(code,sb);
  (L.webglcontextlost||[]).forEach(f=>f({preventDefault(){}}));
  sb.minuteurs.forEach(([f])=>f());
  return sb;}
let r=essai(0);  r.rel===1&&!r.crash?ok('1re perte, toujours perdu 5 s après : un rechargement'):ko('1re perte : rel='+r.rel+' crash='+r.crash);
r=essai(2);      r.rel===1&&!r.crash?ok('3e perte : encore un rechargement'):ko('3e perte : rel='+r.rel+' crash='+r.crash);
r=essai(3);      r.rel===0&&/contexte 3D perdu ×4/.test(r.crash||'')?ok('4e perte : écran RELANCER (« '+r.crash+' »), pas de rechargement'):ko('4e perte : rel='+r.rel+' crash='+r.crash);
r=essai(0,true); r.rel===0&&!r.crash?ok('perdu en arrière-plan : le filet ne fait rien (le retour s\'en charge)'):ko('caché : rel='+r.rel+' crash='+r.crash);
console.log(KO.length?'PREUVE KO — '+KO.join(' | '):'PREUVE OK');process.exitCode=KO.length?1:0;
