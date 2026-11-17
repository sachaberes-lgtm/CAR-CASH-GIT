/* LA COURSE DU CANYON, PAS À PAS (2026-11-17, canyon final) : le vrai jeu avancé à la main (dbgStep, 30 i/s exactes : 1000/30 ms par pas — pas de chrono, déterministe),
   au pilote automatique, à vitesse de croisière puis à très grande vitesse (moteur monté au dernier palier, nitro tenue).
   À chaque pas : la caisse (abscisse, vitesse, mode, mort et sa cause), les appels de dessin et les triangles, et LE DÉCOR QUI APPARAÎT D'UN COUP : tout maillage de la scène
   qui devient visible DANS le champ de la caméra à moins de PRES mètres (sa sphère englobante).
   node outils/banc-routes/canyon-final/pilote.mjs outils/banc-routes/canyon-final/course.mjs graines=3,7 [vitesse=haute|basse] [pas=2400] [pres=450] [q=…] [out=f.json] */
import fs from 'node:fs';
const INIT=`(function(haute){window.__cf={vus:new Map(),fr:new THREE.Frustum(),m:new THREE.Matrix4(),sp:new THREE.Sphere(),n:0};dbgAuto(1,0,{nit:haute?1:0});if(haute){for(let k=0;k<40;k++){try{dbgMoteur();}catch(e){}}}return dbgState().s;})`;
const PAS=`(function(n,PRES){const C=window.__cf,S=dbgScene(),R=S.rdr,cam=S.cam,out={pop:[],apMax:0,trMax:0,ap:0,tr:0,n:0,mort:null,vmax:0,chute:0};
  for(let k=0;k<n;k++){dbgStep(1,1000/30);C.n++;const d=dbgState(),i=R.info.render;out.n++;out.ap+=i.calls;out.tr+=i.triangles;if(i.calls>out.apMax)out.apMax=i.calls;if(i.triangles>out.trMax)out.trMax=i.triangles;if(d.vH>out.vmax)out.vmax=d.vH;if(d.mode==='fall')out.chute++;
    C.m.multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse);C.fr.setFromProjectionMatrix(C.m);
    S.scene.traverse(function(o){if(!o.isMesh||!o.geometry)return;let v=true,p=o;while(p){if(!p.visible){v=false;break;}p=p.parent;}const av=C.vus.get(o.id);C.vus.set(o.id,v);
      if(v&&av===false||(v&&av===undefined&&C.n>30)){const g=o.geometry;if(!g.boundingSphere)try{g.computeBoundingSphere();}catch(e){return;}if(!g.boundingSphere||!isFinite(g.boundingSphere.radius))return;C.sp.copy(g.boundingSphere).applyMatrix4(o.matrixWorld);
        const dist=C.sp.center.distanceTo(cam.position)-C.sp.radius;if(dist<PRES&&C.sp.radius>3&&C.fr.intersectsSphere(C.sp)&&!o.isInstancedMesh)out.pop.push([Math.round(d.s),o.name||(o.material&&o.material.type)||'?',Math.round(dist),Math.round(C.sp.radius),av===undefined?'neuf':'rallumé']);}});
    if(d.gameOver){let c='';try{c=dbgRoute().cause;}catch(e){}out.mort={s:Math.round(d.s),cause:c,mode:d.mode};break;}}
  const d=dbgState();out.s=Math.round(d.s);out.L=Math.round(dbgRoute().L);out.vH=d.vH;return out;})`;
export default async function(api,a){const tout={},haute=a.vitesse!=='basse',N=+(a.pas||2400),PRES=+(a.pres||450);let defauts=0;
  for(const g of String(a.graines||'3').split(',')){await api.charger({graine:+g,meteo:a.meteo||'matin',q:a.q||'',attente:2});
    await api.ev('(function(){try{if(dbgState().paused)dbgCanyon("reprendre");}catch(e){}})()');await api.ev(INIT+'('+(haute?1:0)+')');
    const B={pop:[],apMax:0,trMax:0,ap:0,tr:0,n:0,mort:null,vmax:0,chute:0};let fait=0;
    while(fait<N){const r=await api.ev(PAS+'(120,'+PRES+')',300000);fait+=r.n;B.n+=r.n;B.ap+=r.ap;B.tr+=r.tr;B.apMax=Math.max(B.apMax,r.apMax);B.trMax=Math.max(B.trMax,r.trMax);B.vmax=Math.max(B.vmax,r.vmax);B.chute+=r.chute;for(const p of r.pop)B.pop.push(p);B.s=r.s;B.L=r.L;if(r.mort){B.mort=r.mort;break;}if(r.s>=r.L-60)break;}
    B.apMoy=Math.round(B.ap/B.n);B.trMoy=Math.round(B.tr/B.n);B.err=api.erreurs.slice(0,4);tout[g]=B;if(B.mort||B.pop.length||B.err.length)defauts++;
    api.log('g'+g,haute?'haute':'basse','pas',B.n,'s',B.s+'/'+B.L,'vmax',Math.round(B.vmax*3.6)+' km/h','appels moy/max',B.apMoy+'/'+B.apMax,'triangles moy/max',B.trMoy+'/'+B.trMax,'en vol',B.chute,'pas',B.mort?'✘ MORT '+JSON.stringify(B.mort):'',B.pop.length?'✘ apparitions '+B.pop.length+' '+JSON.stringify(B.pop.slice(0,6)):'✔',B.err.length?'erreurs '+B.err[0]:'');}
  if(a.out)fs.writeFileSync(a.out,JSON.stringify(tout,null,1));api.log('BILAN course',defauts,'graine(s) en défaut');
}
