/* L'IMAGE PAR APPEL (2026-11-14, optimisation de la ville) : en roulant au pilote auto, toutes les ~1,2 s, UNE vraie image du jeu (ombres, passes du composer
   comprises) est relevée appel de rendu par appel de rendu (renderer.renderBufferDirect enveloppé le temps d'une image) : par groupe (parent|nom|matière),
   le nombre d'appels et de triangles × instances. Moyennes sur les images relevées ; aussi dbgPerf (ms, dpr), mémoire du moteur et tas JS.
   Usage : banc-maps gen … --auditfile=outils/banc-maps/audit-image-par-appel.js --auditms=200000 */
(async function(){try{
const S=dbgScene(),R=S.rdr,orig=R.renderBufferDirect;const dort=function(ms){return new Promise(function(r){setTimeout(r,ms);});};
const image=function(){return new Promise(function(ok){requestAnimationFrame(function(){requestAnimationFrame(function(){ok();});});});};
const G={},N={n:0,calls:0,tri:0,ms:0,dpr:0,ombre:0},ech=[];let enr=null;
R.renderBufferDirect=function(cam,sc,geo,mat,obj,grp){if(enr){let n=geo.index?geo.index.count:(geo.attributes.position?geo.attributes.position.count:0);if(geo.drawRange&&geo.drawRange.count!==Infinity)n=Math.min(n,geo.drawRange.count);if(grp)n=Math.min(n,grp.count);
  const k=(obj.isInstancedMesh?obj.count:(geo.isInstancedBufferGeometry?(geo.instanceCount===Infinity?1:geo.instanceCount):1));const t=(mat.wireframe?0:(obj.isPoints?n:obj.isLine||obj.isLineSegments?n/2:n/3))*k;
  const p=obj.parent&&obj.parent.name||'';const key=(cam&&cam.isOrthographicCamera?'[ombre/passe] ':'')+p+'|'+(obj.name||obj.type)+'|'+(mat.type||'');
  const g=enr[key]||(enr[key]={c:0,t:0});g.c++;g.t+=t;}
  return orig.apply(this,arguments);};
try{dbgAuto(1,0,{nit:0});}catch(e){}
await dort(1500);
for(let q=0;q<22;q++){let st=null;try{st=dbgState();}catch(e){}if(st&&st.gameOver)break;
  enr={};await image();const e=enr;enr=null;let c=0,t=0;for(const k in e){c+=e[k].c;t+=e[k].t;const g=G[k]||(G[k]={c:0,t:0});g.c+=e[k].c;g.t+=e[k].t;}
  const pf=dbgPerf();N.n++;N.calls+=c;N.tri+=t;N.ms+=pf.ms;N.dpr+=pf.dpr;ech.push([Math.round((dbgRoute().s||0)),c,Math.round(t/1000)]);
  await dort(1200);}
R.renderBufferDirect=orig;
const n=Math.max(1,N.n),top=Object.keys(G).sort(function(a,b){return G[b].t-G[a].t;}).slice(0,30).map(function(k){return [k,+(G[k].c/n).toFixed(1),Math.round(G[k].t/n)];});
const topC=Object.keys(G).sort(function(a,b){return G[b].c-G[a].c;}).slice(0,20).map(function(k){return [k,+(G[k].c/n).toFixed(1),Math.round(G[k].t/n)];});
const mem=R.info.memory;let heap=null;try{heap=Math.round(performance.memory.usedJSHeapSize/1048576);}catch(e){}
return {images:N.n,appels:+(N.calls/n).toFixed(1),triangles:Math.round(N.tri/n),ms:+(N.ms/n).toFixed(2),dpr:+(N.dpr/n).toFixed(3),geo:mem.geometries,tex:mem.textures,prog:R.info.programs?R.info.programs.length:null,tasMo:heap,top:top,topAppels:topC,ech:ech};
}catch(e){return 'erreur '+String(e&&e.stack||e).slice(0,400);}})()
