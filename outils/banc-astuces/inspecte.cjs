// L'INSPECTION des gros groupes de la scène en course (2026-11-19) : empreinte de chaque enfant de la scène qui porte beaucoup de maillages
//   node outils/banc-astuces/inspecte.cjs --carte canyon [--attente 25000]
const fs = require('fs'), path = require('path');
const { ouvre, dormir } = require('../banc-jsimage/commun.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const RAC = path.resolve(__dirname, '..', '..'), JEU = path.join(RAC, 'VERSION PRINCIPALE');
(async () => {
  let c; try {
    ({ c } = await ouvre({ dirs: [JEU], http: 9781, cdp: 9782, carte: A.carte || 'canyon', qs: A.qs || '', graine: 7 }));
    await c.ev("dbgImmortel(true);dbgAuto(1,0,{vol:1,saut:.3,imp:25,nit:2});1");
    await dormir(+(A.attente || 25000));
    const r = await c.ev(`(function(){const D=dbgScene(),sc=D.scene,out=[];
      sc.children.forEach(function(g,i){let n=0,v=0;const fp={};g.traverse(function(o){if(o.isMesh||o.isPoints||o.isLine){n++;if(o.visible)v++;
        const m=o.material||{},ge=o.geometry||{};const k=(m.type||'')+'|'+Object.keys(ge.attributes||{}).join(',')+'|'+((m.fragmentShader||'').replace(/\\s+/g,' ').slice(0,90))+'|'+Object.keys(o.userData||{}).join(',');fp[k]=(fp[k]||0)+1;}});
        if(n>=8)out.push({i:i,nom:g.name,type:g.type,mailles:n,visibles:v,ud:Object.keys(g.userData||{}),fp:fp});});
      const fpo=function(o){const m=o.material||{},ge=o.geometry||{};return {nom:o.name,type:o.type,mat:m.type,matNom:m.name,add:m.blending===2,attr:Object.keys(ge.attributes||{}),geo:ge.type,ud:Object.keys(o.userData||{}),
        ft:o.frustumCulled,vis:o.visible,obr:o.onBeforeRender!==THREE.Object3D.prototype.onBeforeRender?String(o.onBeforeRender).slice(0,160):null,vs:(m.vertexShader||'').replace(/\s+/g,' ').slice(0,160),fs:(m.fragmentShader||'').replace(/\s+/g,' ').slice(0,160),
        enfants:o.children.length,e0:o.children[0]?{nom:o.children[0].name,type:o.children[0].type,mat:(o.children[0].material||{}).type,attr:Object.keys((o.children[0].geometry||{}).attributes||{}),ud:Object.keys(o.children[0].userData||{}),
        vs:((o.children[0].material||{}).vertexShader||'').replace(/\s+/g,' ').slice(0,200)}:null};};
      const vise={};for(const i of [9,24,25,33,35,90,101,102,123,124])if(sc.children[i])vise[i]=fpo(sc.children[i]);
      return {gros:out,vise:vise,n:sc.children.length};})()`);
    console.log(JSON.stringify(r, null, 1).slice(0, 12000));
  } catch (e) { console.error(e); } finally { if (c) c.fin(); }
  process.exit(0);
})();
