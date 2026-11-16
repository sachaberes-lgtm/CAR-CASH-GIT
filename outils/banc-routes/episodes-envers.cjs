/* LES ÉPISODES À L'ENVERS D'UNE ROUTE D'ORBITE (2026-11-14) : où commence et finit chaque passage la tête en bas (normale sous l'horizon, comme R8 du juge), sa durée à la vitesse réelle,
   et les marques des modules (abscisses) — pour régler un module dont l'envers dépasse 9,5 s.
   node outils/banc-routes/episodes-envers.cjs <racine> <palier> <graines a-b>      (SEARCH='?espace=v6' pour une variante) */
const path=require('path');const RAC=path.resolve(process.argv[2]||'.');const B=require(path.join(RAC,'outils/banc-routes/charge.cjs')).creer(process.env.SEARCH||'');
const p=+(process.argv[3]||0),G=(process.argv[4]||'1-8').split('-').map(Number);const el=1.8+(1-1.8)*Math.min(1,p/25);
for(let g=G[0];g<=(G[1]||G[0]);g++){const r=B.piste('espace',g,p),Q=r.ctrl,N=r.N,S=[0];for(let i=1;i<Q.length;i++)S.push(S[i-1]+Q[i].distanceTo(Q[i-1]));
  const v=r.vw*el,ep=[];let a=-1;for(let i=0;i<Q.length;i++){const e=N&&N[i].y<0;if(e&&a<0)a=i;if(!e&&a>=0){ep.push([a,i]);a=-1;}}
  const s0=function(i){let s=0;for(let k=1;k<=Math.min(i,r.ctrl0.length-1);k++)s+=r.ctrl0[k].distanceTo(r.ctrl0[k-1]);return s;};
  console.log('p'+p,'g'+g,'L',Math.round(S[S.length-1]),'·',ep.map(function(e){return Math.round(S[e[0]])+'→'+Math.round(S[e[1]])+' ('+((S[e[1]]-S[e[0]])/v).toFixed(1)+' s)';}).join(' · '),'|',r.marks0.map(function(m){return m.fig+'['+Math.round(s0(m.i0))+'-'+Math.round(s0(m.i1))+']';}).join(' '));}
