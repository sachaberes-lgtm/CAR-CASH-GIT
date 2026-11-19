/* CONTRÔLE ADVERSE — la génération des jeux de routes (une séance : routes DE SUITE dans le même vm, le sac se souvient)
     node gen.cjs carte=jade|espace etiq=apres|avant paliers=0,10,20,27 n=200 rodage=30 base=<graine du tirage des graines>
   etiq=avant : ref=88a648892 (le code d'avant). Graines : 32 bits au hasard comme le jeu ((Math.random()*1e9)|0), tirées d'un mulberry32(base) — PAS 1-200.
   Écrit data/<carte>-<etiq>-p<palier>.json */
const fs=require('fs'),path=require('path'),L=require('./lib.cjs');
const arg=(k,d)=>{const a=process.argv.find(x=>x.startsWith(k+'='));return a?a.slice(k.length+1):d;};
const carte=arg('carte','jade'),etiq=arg('etiq','apres'),PAL=arg('paliers','0,10,20,27').split(',').map(Number),n=+arg('n','200'),rod=+arg('rodage','30'),base=+arg('base','20261117'),search=arg('search','');
const ref=etiq==='avant'?'88a648892':'';
fs.mkdirSync(path.join(__dirname,'data'),{recursive:true});
function roulis(G){if(!G.N)return null;const R=[];const n=G.n;for(let k=0;k<n;k++){const a=Math.max(0,k-1),b=Math.min(n-1,k+1);let t={x:G.W[b].x-G.W[a].x,y:G.W[b].y-G.W[a].y,z:G.W[b].z-G.W[a].z};const l=Math.hypot(t.x,t.y,t.z)||1;t={x:t.x/l,y:t.y/l,z:t.z/l};
  let sx=t.z,sz=-t.x;const sl=Math.hypot(sx,sz);if(sl<.3){R.push(null);continue;}sx/=sl;sz/=sl;const ux=sz*t.y,uy=sx*t.z-sz*t.x,uz=-sx*t.y,N=G.N[k];R.push(+(Math.atan2(N.x*sx+N.z*sz,N.x*ux+N.y*uy+N.z*uz)*57.2958).toFixed(1));}return R;}
for(const p of PAL){const M=L.moteur(carte,search,ref);M.raz();const G=L.graines(n,base+p*7919),rodG=L.graines(rod,base+p*7919+1);
  for(const g of rodG)M.route(g,p); /* le rodage : une séance déjà commencée */
  const routes=[],t0=Date.now();
  for(const g of G){const r=M.route(g,p);const G25=L.resample(r,25),cp=L.capPente(G25),S=L.abs(r.ctrl),K=Math.min(G25.n,Math.round(4500/25)+1);
    const sec=L.securite(r,L.vElan(p),L.rayonPalier(p)),ro=roulis(G25);
    routes.push({g,ms:+r.ms.toFixed(1),reprises:r.reprises,suite:r.suite,seq:r.seq,plan:r.plan,
      mods:r.mods.map(m=>({nom:L.norm(m.nom),s:Math.round(S[Math.min(S.length-1,m.i0|0)]),s1:Math.round(S[Math.min(S.length-1,m.i1|0)]),cx:m.climax?1:undefined})),
      L:Math.round(G25.L),X:Array.from(G25.X.slice(0,K),v=>+v.toFixed(1)),Y:Array.from(G25.Y.slice(0,K),v=>+v.toFixed(1)),Z:Array.from(G25.Z.slice(0,K),v=>+v.toFixed(1)),
      CAP:Array.from(cp.CAP.slice(0,K),v=>+v.toFixed(1)),PEN:Array.from(cp.PEN.slice(0,K),v=>+v.toFixed(1)),ROL:ro?ro.slice(0,K):null,
      fin:{x:+G25.X[G25.n-1].toFixed(0),y:+G25.Y[G25.n-1].toFixed(0),z:+G25.Z[G25.n-1].toFixed(0),cap:+cp.CAP[G25.n-1].toFixed(0)},sec});}
  const f=path.join(__dirname,'data',carte+'-'+etiq+(search?'-'+search.replace(/[^a-z0-9]+/gi,''):'')+'-p'+p+'.json');
  fs.writeFileSync(f,JSON.stringify({carte,etiq,ref,palier:p,base,n,rodage:rod,routes}));
  console.log(carte,etiq,'p'+p,routes.length,'routes',((Date.now()-t0)/1000).toFixed(0)+' s','→',path.basename(f));}
