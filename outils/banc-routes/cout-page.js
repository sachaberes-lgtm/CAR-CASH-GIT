/* LE COÛT D'UNE MAP, DANS LA PAGE (2026-11-14, la passe d'optimisation de l'orbite — Sacha : « aussi peu lourd que ce qu'on a actuellement ») — à passer au banc des maps :
   node outils/banc-maps/banc.cjs gen --carte=espace --meteo=soir --graines=5 [--tel=1] --q="dur=70&apres=nuages" --auditfile=outils/banc-routes/cout-page.js
   Rend, pour la même graine, de quoi comparer deux worktrees SANS dépendre de l'endroit où se pose la caméra :
     · scene : la scène bâtie, à l'arrêt — objets dessinables visibles, triangles et sommets (× instances), par groupe nommé (le plus proche ancêtre qui a un nom) ;
     · info : géométries, textures, programmes de renderer.info, tas JS ;
     · course : le pilote auto (nitro coupée) roule `dur` s ; à CHAQUE image, les appels de dessin et triangles de l'image entière (renderer.info sans remise
       à zéro automatique, remis à zéro par nous à chaque image) et la durée de l'image → moyenne, 95e centile, max ; images de plus de 50 / 100 ms ;
     · apres : on impose la map suivante (`apres`, par défaut nuages), on passe le portail et on relève géométries / textures une fois la zone suivante bâtie
       (la libération au changement de map : ce qui reste de l'orbite s'y voit). */
(async function(){try{
  const Z=function(ms){return new Promise(function(r){setTimeout(r,ms);});},q=function(k){return ((new RegExp('[?&]'+k+'=([^&]*)').exec(location.search))||[])[1];};
  const dur=+q('dur')||70,apres=q('apres')||'nuages',sc=dbgScene(),R9=sc.rdr,scene=sc.scene;
  const info=function(){const o={geo:R9.info.memory.geometries,tex:R9.info.memory.textures,prog:R9.info.programs?R9.info.programs.length:null};try{o.tasMo=Math.round(performance.memory.usedJSHeapSize/1048576);}catch(e){}try{const e=dbgEnvCiel();o.env=[e.calculesIci,e.parLeTravailleur,e.prisEnCache,e.prisProche,e.msDernierCalcul];}catch(e){}return o;};
  const scen=function(){const G={};let obj=0,tri=0,som=0,inst=0;
    scene.traverseVisible(function(o){if(!(o.isMesh||o.isPoints||o.isLine||o.isSprite))return;const g=o.geometry;if(!g||!g.attributes||!g.attributes.position)return;
      const ni=o.isInstancedMesh?o.count:(g.isInstancedBufferGeometry&&g.instanceCount<Infinity?g.instanceCount:1);if(!ni)return;
      const nb=g.index?g.index.count:g.attributes.position.count,dr=Math.min(nb,g.drawRange&&g.drawRange.count<Infinity?g.drawRange.count:nb);
      const t=o.isMesh?dr/3*ni:0,s=g.attributes.position.count*ni;let a=o,k='';while(a&&a!==scene){if(a.name){k=a.name;break;}a=a.parent;}k=k||'(sans nom)';
      const e=G[k]||(G[k]={obj:0,tri:0,som:0});e.obj++;e.tri+=t;e.som+=s;obj++;tri+=t;som+=s;if(o.isInstancedMesh)inst++;});
    const L=Object.keys(G).map(function(k){return [k,G[k].obj,Math.round(G[k].tri),Math.round(G[k].som)];}).sort(function(a,b){return b[2]-a[2];});
    return {obj:obj,tri:Math.round(tri),som:Math.round(som),instances:inst,groupes:L.slice(0,40)};};
  const s0=scen(),i0=info();
  /* la course : chaque image comptée */
  const C=[],Tr=[],F=[];let on=true,tp=performance.now();const ia=R9.info.autoReset;R9.info.autoReset=false;R9.info.reset();
  const pas=function(t){if(!on)return;C.push(R9.info.render.calls);Tr.push(R9.info.render.triangles);F.push(t-tp);tp=t;R9.info.reset();requestAnimationFrame(pas);};requestAnimationFrame(pas);
  dbgAuto(1,0,{nit:0});const z0=dbgRoute().zone,L0=dbgRoute().L,t0=performance.now();let fin='temps',sMax=0;
  while(performance.now()-t0<dur*1000){await Z(200);const st=dbgState(),r=dbgRoute();if(st.gameOver){fin='MORT '+r.cause+' @'+Math.round(r.s);break;}if(r.zone!==z0){fin='PORTAIL';break;}if(r.s>sMax)sMax=r.s;}
  on=false;R9.info.autoReset=ia;dbgAuto(0);
  const st9=function(A){if(!A.length)return null;const B=A.slice(3).sort(function(a,b){return a-b;});const m=B.reduce(function(a,b){return a+b;},0)/B.length;return {moy:Math.round(m*10)/10,p95:Math.round(B[Math.floor(.95*(B.length-1))]),max:Math.round(B[B.length-1])};};
  const course={images:F.length,appels:st9(C),tri:st9(Tr),ms:st9(F),plus50:F.filter(function(x){return x>50;}).length,plus100:F.filter(function(x){return x>100;}).length,fin:fin,sMax:Math.round(sMax),L:Math.round(L0)};
  const i1=info(),s1=scen();
  /* la map d'après : libère-t-on l'orbite ? */
  let ap=null;if(fin!=='PORTAIL'&&fin.indexOf('MORT')<0){try{dbgClassique(apres);}catch(e){}try{dbgAuto(1,0,{nit:0});dbgBord({s:dbgRoute().L-260});}catch(e){}
    const t1=performance.now();while(performance.now()-t1<30000){await Z(250);const r=dbgRoute();if(r.zone!==z0&&r.L!==L0)break;}await Z(6000);dbgAuto(0);
    let carte=null;try{carte=dbgRoute().niveau.carte;}catch(e){}ap=Object.assign({carte:carte},info(),{scene:(function(){const x=scen();return {obj:x.obj,tri:x.tri,som:x.som};})()});}
  let err=[];try{err=(window.dbgErreurs?dbgErreurs():[]).slice(-5);}catch(e){}
  return JSON.stringify({scene:s0,info:i0,course:course,infoFin:i1,sceneFin:{obj:s1.obj,tri:s1.tri,som:s1.som},apres:ap,erreurs:err});
}catch(e){return 'ERREUR cout-page : '+(e&&e.stack||e);}})()
