/* RÔLE « etat » (2026-11-18) — L'ENTRÉE DANS L'ESPACE : à quelle distance (m) et dans combien de secondes à la vitesse réelle le 1er module nommé commence-t-il,
   et quelle est la dalle la plus couchée (Nn.y min) et la pente la plus raide dans les 2 premières secondes ? Routes uniques contre `?sans=uniques`.
   node outils/banc-espace/etat-entree.cjs [paliers=0,5,10,15,20] [graines=101-160]
   Vitesse réelle : vPalier × l'élan DUREE_ELAN (1,8 au palier 0 → 1 au palier 25, la règle que genCtrl1 suit, EL5) — le joueur arrive d'un portail à cette vitesse ;
   au départ direct (?carte=espace) la caisse part, elle, d'une vitesse de lancement plus basse. */
const path=require('path'),vm=require('vm');
const RAC=path.resolve(__dirname,'..','..'),M=require(path.join(RAC,'outils/banc-routes/charge.cjs'));
const arg=k=>{const a=process.argv.find(x=>x.startsWith(k+'='));return a?a.slice(k.length+1):null;};
const PAL=(arg('paliers')||'0,5,10,15,20').split(',').map(Number),G=(arg('graines')||'101-160').split('-').map(Number);
const VW={0:78,5:105,10:158,15:236,20:341,27:439};
const res={};
for(const q of ['','?sans=uniques']){const B=M.creer(q);B.VW[15]=236;B.VW[5]=105;
  for(const p of PAL){const L=[];
    for(let g=G[0];g<=G[1];g++){const r=B.piste('espace',g,p),Q=r.ctrl,n=Q.length,S=[0];for(let i=1;i<n;i++)S.push(S[i-1]+Q[i].distanceTo(Q[i-1]));
      const el=1.8+(1-1.8)*Math.min(1,p/25),v=r.vw*el;
      const mk=r.marks.filter(m=>m.fig).sort((a,b)=>a.i0-b.i0),m1=mk[0],s1=m1?S[Math.min(n-1,m1.i0)]:S[n-1];
      let nyMin=1,pMin=0;const lim=2*v;for(let i=0;i<n-1&&S[i]<lim;i++){if(r.N&&r.N[i].y<nyMin)nyMin=r.N[i].y;const dy=(Q[i+1].y-Q[i].y)/Math.max(1e-3,Q[i+1].distanceTo(Q[i]));if(Math.asin(Math.max(-1,Math.min(1,dy)))<pMin)pMin=Math.asin(dy);}
      const D=vm.runInContext('OU.der',B.ctx);
      L.push({g,fig:m1?m1.fig:null,s1:Math.round(s1),t1:+(s1/v).toFixed(2),ny2s:+nyMin.toFixed(2),pente2s:Math.round(pMin*57.2958),ouv:q?'(avant)':(D&&D.ouv)});}
    const t=L.map(x=>x.t1).sort((a,b)=>a-b),pc=k=>t[Math.floor(k*(t.length-1))];
    const sous19=L.filter(x=>x.t1<1.9).length,ouvs={};for(const x of L.filter(y=>y.t1<1.9))ouvs[x.ouv]=(ouvs[x.ouv]|0)+1;const sous1=L.filter(x=>x.t1<1).length,sous15=L.filter(x=>x.t1<1.5).length,couche=L.filter(x=>x.ny2s<.5).length;
    const cle=(q||'uniques')+' p'+p;res[cle]={sous19:sous19,ouvs19:ouvs,min:pc(0),p10:pc(.1),med:pc(.5),sous1s:sous1,sous15s:sous15,dalleCoucheeAvant2s:couche,n:L.length,pires:L.slice().sort((a,b)=>a.t1-b.t1).slice(0,4)};
    console.log(cle.padEnd(22),"< 1,9 s (fin du warp) :",sous19+"/"+L.length,JSON.stringify(ouvs),'1er module : min',pc(0)+' s','p10',pc(.1),'médiane',pc(.5),'| < 1 s :',sous1+'/'+L.length,'< 1,5 s :',sous15+'/'+L.length,'| dalle couchée > 60° dans les 2 premières s :',couche+'/'+L.length,'| pires',L.slice().sort((a,b)=>a.t1-b.t1).slice(0,3).map(x=>'g'+x.g+' '+x.ouv+' '+x.fig+' '+x.s1+'m '+x.t1+'s').join(' ; '));}}
const out=arg('out');if(out)require('fs').writeFileSync(out,JSON.stringify(res,null,1));
