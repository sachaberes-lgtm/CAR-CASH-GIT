/* LES APPELS DE DESSIN PAR GROUPE, EN COURSE (2026-11-15, passe d'optimisation de l'orbite) : renderer.renderBufferDirect est enrobé pendant `dur` s de pilote auto ;
   chaque appel est rangé sous le plus proche ancêtre nommé de l'objet (ou « (sans nom) : type de géométrie / matériau »), avec ses triangles (× instances).
   Rend la moyenne PAR IMAGE de chaque groupe (appels, triangles) : on voit ce que dessine vraiment chaque image, champ de la caméra compris (passe des reflets et ombres comprises).
   node outils/banc-maps/banc.cjs gen --carte=espace --meteo=soir --graines=5 [--tel=1] --q="poste=max&pioche=0&dur=30" --auditfile=outils/banc-routes/appels-groupes-page.js */
(async function(){try{
  const Z=function(ms){return new Promise(function(r){setTimeout(r,ms);});},q=function(k){return ((new RegExp('[?&]'+k+'=([^&]*)').exec(location.search))||[])[1];};
  const dur=+q('dur')||30,sc=dbgScene(),R9=sc.rdr,scene=sc.scene,G={};let img=0,on=true;
  const nom=function(o){let a=o;while(a&&a!==scene){if(a.name)return a.name;a=a.parent;}const g=o.geometry,m=Array.isArray(o.material)?o.material[0]:o.material;return '(sans nom) '+(g?g.type:'?')+'/'+(m?m.type:'?')+(o.parent&&o.parent!==scene?' <'+(o.parent.type)+(o.parent.userData&&Object.keys(o.parent.userData).length?'{'+Object.keys(o.parent.userData).slice(0,3).join(',')+'}':'')+'>':'');};
  const orig=R9.renderBufferDirect;
  R9.renderBufferDirect=function(cam,sc9,geo,mat,obj,grp){if(on){const k=obj.__nom9||(obj.__nom9=nom(obj)),e=G[k]||(G[k]={c:0,t:0});e.c++;
      const ni=obj.isInstancedMesh?obj.count:(geo.isInstancedBufferGeometry&&geo.instanceCount<Infinity?geo.instanceCount:1),nb=geo.index?geo.index.count:(geo.attributes.position?geo.attributes.position.count:0);
      const dr=Math.min(nb,geo.drawRange&&geo.drawRange.count<Infinity?geo.drawRange.count:nb,grp&&grp.count?grp.count:Infinity);e.t+=obj.isMesh?dr/3*ni:0;}
    return orig.apply(this,arguments);};
  const pas=function(){if(!on)return;img++;requestAnimationFrame(pas);};requestAnimationFrame(pas);
  dbgAuto(1,0,{nit:0});const z0=dbgRoute().zone,t0=performance.now();let fin='temps';
  while(performance.now()-t0<dur*1000){await Z(200);const st=dbgState(),r=dbgRoute();if(st.gameOver){fin='MORT';break;}if(r.zone!==z0){fin='PORTAIL';break;}}
  on=false;R9.renderBufferDirect=orig;dbgAuto(0);
  let C=0,T=0;const L=Object.keys(G).map(function(k){C+=G[k].c;T+=G[k].t;return [k,+(G[k].c/img).toFixed(2),Math.round(G[k].t/img)];}).sort(function(a,b){return b[1]-a[1];});
  return JSON.stringify({images:img,fin:fin,appelsParImage:+(C/img).toFixed(1),triParImage:Math.round(T/img),groupes:L.slice(0,60)});
}catch(e){return 'ERREUR '+e.message+' '+e.stack;}})()
