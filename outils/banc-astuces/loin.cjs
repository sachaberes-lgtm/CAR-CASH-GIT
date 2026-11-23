// LE DÉCOR DU LOIN (2026-11-19, astuces-chauffe lot 2) : chaque objet que la caméra dessine dont le point le plus proche est à plus de --d mètres,
// avec la brume de la map (near/far), le drapeau `fog` de sa matière, son chemin dans la scène. Plusieurs relevés espacés d'une seconde, en course.
//   node outils/banc-astuces/loin.cjs --cartes canyon,grotte --d 1500 [--n 8] [--qs ...]
const fs = require('fs'), path = require('path');
const { ouvre, dormir } = require('../banc-jsimage/commun.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const RAC = path.resolve(__dirname, '..', '..'), JEU = path.join(RAC, 'VERSION PRINCIPALE');
const OUT = path.join(__dirname, 'mesures');
const PAGE = `window.__loin=function(D){const sc=dbgScene().scene,cam=dbgScene().cam,R=dbgScene().rdr;const sp=new THREE.Sphere(),P=new THREE.Vector3();
  const res={};const f0=R.renderBufferDirect;let on=true;
  R.renderBufferDirect=function(c9,s9,geo,mat,obj){try{if(on&&c9===cam&&obj){const bs=geo.boundingSphere;let dd=-1;cam.getWorldPosition(P);
     if(bs&&!obj.isInstancedMesh){sp.copy(bs).applyMatrix4(obj.matrixWorld);dd=P.distanceTo(sp.center)-sp.radius;}
     else if(bs&&obj.isInstancedMesh){sp.copy(bs).applyMatrix4(obj.matrixWorld);dd=P.distanceTo(sp.center)-sp.radius;}
     const L=[];let p=obj;while(p&&p!==sc){L.push((p.name||p.type)+(p.parent?'#'+p.parent.children.indexOf(p):''));p=p.parent;}
     const k=L.slice(0,4).join(' < ')+' |'+(mat.type)+(mat.fog?' fog':' SANSfog')+(obj.isInstancedMesh?' inst'+obj.count:'')+(obj.frustumCulled?'':' toujours');
     const t=(geo.index?geo.index.count:(geo.attributes.position?geo.attributes.position.count:0))/3*(obj.isInstancedMesh?obj.count:1);
     const r=res[k]||(res[k]={n:0,loin:0,tri:0,triLoin:0,dmin:1e9,dmax:0});r.n++;r.tri+=t;if(dd>D){r.loin++;r.triLoin+=t;}if(dd>=0){r.dmin=Math.min(r.dmin,dd);r.dmax=Math.max(r.dmax,dd);}}}catch(e){res.err=String(e);}
   return f0.apply(this,arguments);};
  return {fin:function(){R.renderBufferDirect=f0;on=false;const L=[];for(const k in res)if(res[k].loin)L.push([k,res[k].loin,Math.round(res[k].triLoin),res[k].n,Math.round(res[k].dmin),Math.round(res[k].dmax)]);
    L.sort(function(a,b){return b[1]-a[1];});return {fog:sc.fog?[Math.round(sc.fog.near),Math.round(sc.fog.far)]:null,far:cam.far,objets:L.slice(0,40)};}};};1`;
(async () => {
  for (const carte of (A.cartes || 'canyon').split(',')) {
    let c; const R = { carte };
    try {
      ({ c } = await ouvre({ dirs: [JEU], http: 9781, cdp: 9782, carte, qs: A.qs || '', graine: 7 }));
      await c.ev("dbgImmortel(true);dbgAuto(1,0,{vol:1,saut:.3,imp:25,nit:2});1");
      await dormir(+(A.attente || 15000));
      await c.ev(PAGE);
      R.releves = [];
      for (let i = 0; i < +(A.n || 8); i++) {
        await c.ev('window.__L=__loin(' + (+(A.d || 1500)) + ');1');
        await dormir(250);
        R.releves.push(await c.ev('__L.fin()'));
        await dormir(1500);
      }
      R.exc = c.exc.slice(0, 5);
    } catch (e) { R.erreur = String(e && e.stack || e); }
    finally { if (c) c.fin(); }
    fs.writeFileSync(path.join(OUT, (A.tag || 'loin') + '-' + carte + '.json'), JSON.stringify(R, null, 1));
    console.log(carte, 'fini', R.erreur || '');
  }
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
