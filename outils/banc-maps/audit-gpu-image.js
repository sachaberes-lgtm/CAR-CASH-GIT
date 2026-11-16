/* LE TEMPS GPU D'UNE IMAGE (2026-11-14, optimisation de la ville) : en roulant au pilote auto, chaque renderer.render du jeu (ombres et passes du composer
   comprises) est encadré d'une requête de temps GPU (EXT_disjoint_timer_query_webgl2) ; la somme par image = le temps GPU de l'image. On relève ~25 s
   d'images ; médiane, p90, p99, et le temps CPU entre deux images (performance.now dans un requestAnimationFrame). Machine partagée : alterner les arbres.
   Usage : banc-maps gen … --auditfile=outils/banc-maps/audit-gpu-image.js --auditms=200000 */
(async function(){try{
const S=dbgScene(),R=S.rdr,gl=R.getContext(),ext=gl.getExtension('EXT_disjoint_timer_query_webgl2');if(!ext)return 'pas de requête de temps GPU';
const dort=function(ms){return new Promise(function(r){setTimeout(r,ms);});};
const orig=R.render;let img=0;const enAttente=[],gpu=new Map();
R.render=function(){const q=gl.createQuery();gl.beginQuery(ext.TIME_ELAPSED_EXT,q);try{return orig.apply(this,arguments);}finally{gl.endQuery(ext.TIME_ELAPSED_EXT);enAttente.push([q,img]);}};
const lis=function(){for(let k=enAttente.length-1;k>=0;k--){const e=enAttente[k];if(!gl.getQueryParameter(e[0],gl.QUERY_RESULT_AVAILABLE))continue;
  if(!gl.getParameter(ext.GPU_DISJOINT_EXT)){const ns=gl.getQueryParameter(e[0],gl.QUERY_RESULT);gpu.set(e[1],(gpu.get(e[1])||0)+ns/1e6);}gl.deleteQuery(e[0]);enAttente.splice(k,1);}};
const cpu=[];let t0=performance.now(),on=true;const tic=function(){if(!on)return;const t=performance.now();cpu.push(t-t0);t0=t;img++;lis();requestAnimationFrame(tic);};
try{dbgAuto(1,0,{nit:0});}catch(e){}
await dort(1500);img=0;gpu.clear();requestAnimationFrame(tic);
const T0=performance.now();while(performance.now()-T0<25000){await dort(500);let st=null;try{st=dbgState();}catch(e){}if(st&&st.gameOver)break;}
on=false;await dort(300);lis();R.render=orig;
const g=[...gpu.values()].sort(function(a,b){return a-b;}),c=cpu.slice(2).sort(function(a,b){return a-b;});const q=function(a,p){return a.length?+a[Math.min(a.length-1,Math.floor(a.length*p))].toFixed(2):null;};
const moy=function(a){return a.length?+(a.reduce(function(x,y){return x+y;},0)/a.length).toFixed(2):null;};
return {images:c.length,gpuImages:g.length,gpuMed:q(g,.5),gpuP90:q(g,.9),gpuP99:q(g,.99),gpuMoy:moy(g),cpuMed:q(c,.5),cpuP90:q(c,.9),cpuP99:q(c,.99),cpuMax:c.length?+c[c.length-1].toFixed(1):null,
  gels50:c.filter(function(x){return x>50;}).length,gels100:c.filter(function(x){return x>100;}).length,dpr:dbgPerf().dpr,s:Math.round(dbgRoute().s||0)};
}catch(e){return 'erreur '+String(e&&e.stack||e).slice(0,400);}})()
