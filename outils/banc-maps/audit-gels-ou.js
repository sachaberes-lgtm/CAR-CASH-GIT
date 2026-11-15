/* OÙ SONT LES GELS (2026-11-15, optimisation de la ville) : au pilote auto ~25 s, chaque image de plus de 60 ms est notée avec l'abscisse (dbgRoute().s),
   et ce qui a changé dans le moteur depuis l'image d'avant (programmes compilés, géométries et textures envoyées) : un programme de plus = une compilation,
   des géométries de plus = un envoi. Usage : banc-maps gen … --auditfile=outils/banc-maps/audit-gels-ou.js --auditms=200000 */
(async function(){try{
const R=dbgScene().rdr;const dort=function(ms){return new Promise(function(r){setTimeout(r,ms);});};
const etat=function(){const m=R.info.memory;return [R.info.programs?R.info.programs.length:0,m.geometries,m.textures];};
const gels=[];let t0=performance.now(),on=true,e0=etat(),n=0;
const tic=function(){if(!on)return;const t=performance.now(),dt=t-t0,e=etat();n++;
  if(dt>60&&n>2){let s=null;try{s=Math.round(dbgRoute().s||0);}catch(x){}gels.push({ms:Math.round(dt),s:s,prog:e[0]-e0[0],geo:e[1]-e0[1],tex:e[2]-e0[2]});}
  t0=t;e0=e;requestAnimationFrame(tic);};
try{dbgAuto(1,0,{nit:0});}catch(e){}
await dort(1500);requestAnimationFrame(tic);
const T0=performance.now();while(performance.now()-T0<25000){await dort(500);let st=null;try{st=dbgState();}catch(e){}if(st&&st.gameOver)break;}
on=false;let sf=null;try{sf=Math.round(dbgRoute().s||0);}catch(x){}
return {images:n,s:sf,gels:gels};
}catch(e){return 'erreur '+String(e&&e.stack||e).slice(0,400);}})()
