/* LA COURSE DU CANYON (2026-11-17, canyon final) : le vrai jeu au pilote automatique, EN TEMPS RÉEL (sur téléphone le limiteur de cadence ignore dbgStep : la boucle
   ne se laisse pas avancer à la main), d'un bout à l'autre du canyon, à vitesse de croisière ou à très grande vitesse (moteur monté au dernier palier, nitro tenue).
   Une sonde posée dans la page relève À CHAQUE IMAGE : la caisse (abscisse, vitesse, vol, mort et sa cause), les appels de dessin et les triangles (toutes passes
   cumulées), et LE DÉCOR QUI APPARAÎT D'UN COUP : tout maillage qui devient visible DANS le champ de la caméra à moins de PRES mètres (sa sphère englobante).
   Les compteurs dépendent un peu de la machine (le nombre d'images), pas les défauts (mort, apparition).
   node outils/banc-routes/canyon-final/pilote.mjs outils/banc-routes/canyon-final/course.mjs graines=3,7 [vitesse=haute|basse] [pres=450] [duree=240] [q=…] [out=f.json] */
import fs from 'node:fs';
const SONDE=`(function(haute,PRES){const S=dbgScene(),R=S.rdr,cam=S.cam,C=window.__cf={vus:new Map(),pop:[],n:0,ap:0,tr:0,apMax:0,trMax:0,vmax:0,vol:0,mort:null,fini:0,s:0,sMax:0,L:Math.round(dbgRoute().L)},fr=new THREE.Frustum(),m=new THREE.Matrix4(),sp=new THREE.Sphere();
  dbgAuto(1,0,{nit:haute?1:0});if(haute){for(let k=0;k<40;k++){try{dbgMoteur();}catch(e){}}}
  R.info.autoReset=false;R.info.reset();
  const tic=function(){if(C.fini||C.mort){R.info.autoReset=true;return;}const d=dbgState(),i=R.info.render;
    if(i.calls>0){C.n++;C.ap+=i.calls;C.tr+=i.triangles;if(i.calls>C.apMax)C.apMax=i.calls;if(i.triangles>C.trMax)C.trMax=i.triangles;R.info.reset();}
    if(d.s<C.sMax-300){C.fini=1;R.info.autoReset=true;return;} /* l'abscisse retombe : le portail est passé */
    C.s=d.s;if(d.s>C.sMax)C.sMax=d.s;if(d.vH>C.vmax)C.vmax=d.vH;if(d.mode==='fall')C.vol++;
    if(d.gameOver){let c='';try{c=dbgRoute().cause;}catch(e){}C.mort={s:Math.round(d.s),cause:c,mode:d.mode};R.info.autoReset=true;return;}
    m.multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse);fr.setFromProjectionMatrix(m);
    S.scene.traverse(function(o){if(!o.isMesh||!o.geometry)return;let v=true,p=o;while(p){if(!p.visible){v=false;break;}p=p.parent;}const av=C.vus.get(o.id);C.vus.set(o.id,v);
      if(v&&(av===false||(av===undefined&&C.n>40))&&!o.isInstancedMesh){const g=o.geometry;if(!g.boundingSphere){try{g.computeBoundingSphere();}catch(e){return;}}if(!g.boundingSphere||!isFinite(g.boundingSphere.radius))return;sp.copy(g.boundingSphere).applyMatrix4(o.matrixWorld);
        const dist=sp.center.distanceTo(cam.position)-sp.radius;if(dist<PRES&&sp.radius>3&&fr.intersectsSphere(sp)&&C.pop.length<200)C.pop.push([Math.round(d.s),o.name||(o.material&&o.material.type)||'?',Math.round(dist),Math.round(sp.radius),av===undefined?'neuf':'rallumé']);}});
    requestAnimationFrame(tic);};
  requestAnimationFrame(tic);return C.L;})`;
export default async function(api,a){const tout={},haute=a.vitesse!=='basse',PRES=+(a.pres||450),DUREE=+(a.duree||240)*1000;let defauts=0;
  for(const g of String(a.graines||'3').split(',')){await api.charger({graine:+g,meteo:a.meteo||'matin',q:a.q||'',attente:2});
    await api.ev('(function(){try{if(dbgState().paused)dbgCanyon("reprendre");}catch(e){}})()');await api.ev(SONDE+'('+(haute?1:0)+','+PRES+')');
    const t0=Date.now();let B=null;
    for(;;){await api.dort(2000);B=await api.ev('(function(){const C=window.__cf;return {pop:C.pop,n:C.n,ap:C.ap,tr:C.tr,apMax:C.apMax,trMax:C.trMax,vmax:C.vmax,vol:C.vol,mort:C.mort,fini:C.fini,s:Math.round(C.sMax),L:C.L};})()');
      if(B.mort||B.fini||Date.now()-t0>DUREE)break;}
    B.apMoy=Math.round(B.ap/Math.max(1,B.n));B.trMoy=Math.round(B.tr/Math.max(1,B.n));B.err=api.erreurs.slice(0,4);B.secondes=Math.round((Date.now()-t0)/1000);tout[g]=B;
    const ko=B.mort||B.pop.length||B.err.length||!B.fini;if(ko)defauts++;
    api.log('g'+g,haute?'haute':'basse',B.secondes+' s',B.n+' images',B.fini?'ARRIVÉE (portail passé)':'s '+B.s+'/'+B.L+' ✘ PAS ARRIVÉ','vmax',Math.round(B.vmax*3.6)+' km/h','appels moy/max',B.apMoy+'/'+B.apMax,'triangles moy/max',B.trMoy+'/'+B.trMax,'images en vol',B.vol,B.mort?'✘ MORT '+JSON.stringify(B.mort):'',B.pop.length?'✘ apparitions '+B.pop.length+' '+JSON.stringify(B.pop.slice(0,8)):'✔ aucune apparition',B.err.length?'erreurs '+B.err[0]:'');}
  if(a.out)fs.writeFileSync(a.out,JSON.stringify(tout,null,1));api.log('BILAN course',defauts,'graine(s) en défaut');if(defauts)process.exitCode=1;
}
