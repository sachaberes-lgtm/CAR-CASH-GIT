/* ===== L'ESPACE SANS GÉANTS — LE TEST (2026-11-18, Sacha : « finalement supprime tous les modules exploitables avec la route dans l'espace, laisse juste quelques satellites
   et météorites à des endroits, réarrange la route en ce sens ») =====
     node outils/banc-espace/sans-geants-test.cjs [search=] [n=100] [paliers=0,10,20,27] [graine0=1] [planetes=terre,mars,saturne] [racine=<un autre arbre>] [detail=1]
   La VRAIE route (genCtrl + pisteTordPropre + la dalle jouée) puis la VRAIE pose du décor de l'orbite (orbiteBuild, geantsPose, rochesPose, voyDecorPose : decor-charge.cjs),
   n routes DE SUITE par palier (le sac se souvient, comme une partie), chaque route posée sur les trois planètes (la Terre : satellites ; Mars, Saturne : météorites).
   ÉCHOUE (code 1) si, sur une seule route :
     · un géant est posé (GEANTS.liste, l'épave, une lune, un gaz, la nappe, la comète), un décor de voyage (la jante, la roche percée, la nébuleuse), une zone de saut refusé de géant,
       un cœur dur (ORB.durs) — ou une erreur à la pose ;
     · un satellite ou une météorite est à moins de 60 m du BORD de la route (son enveloppe comprise, toute portion de route, en 3D) ou à moins de 60 m d'elle EN PLAN
       (au-dessus ou au-dessous d'une autre portion : sur une trajectoire de vol) ;
     · une planète n'a aucun amas (la route aurait perdu ses « quelques satellites et météorites »).
   `search=?plus=geants` (la route et le décor d'avant) DOIT échouer : c'est la preuve que le test voit les géants et le décor du bord. */
const path=require('path');
const arg=(k,d)=>{const a=process.argv.find(x=>x.startsWith(k+'='));return a?a.slice(k.length+1):d;};
const search=arg('search',''),n=+arg('n','100'),PAL=arg('paliers','0,10,20,27').split(',').map(Number),g0=+arg('graine0','1'),PL=arg('planetes','terre,mars,saturne').split(','),detail=arg('detail','')==='1';
const racine=arg('racine','')||path.resolve(__dirname,'../..'),D=require(path.join(racine,'outils/banc-espace/decor-charge.cjs'));
let ko=0;const fautes=[];const faute=(t)=>{ko++;if(fautes.length<12)fautes.push(t);};
const moy=a=>a.length?Math.round(a.reduce((x,y)=>x+y,0)/a.length*10)/10:'-';
console.log('search '+JSON.stringify(search)+' · '+n+' routes de suite × paliers '+PAL.join(',')+' × '+PL.join(','));
console.log('palier | planète  | géants posés | décor voyage | zones saut | durs | objets moy [min-max] | amas moy [min-max] | dégagement min 3D / en plan (m) | sous 60 m | pose ms moy');
for(const p of PAL){const B=D.creer(search,{racine,raz:false});const S={};for(const pl of PL)S[pl]={g:0,v:0,z:0,du:0,ob:[],am:[],d3:[],dh:[],s60:0,ms:[]};
  for(let k=0;k<n;k++){const g=g0+k*7919;const R=B.decor(g,p,PL);if(!Array.isArray(R)){faute('p'+p+' g'+g+' : '+R.err);continue;}
    R.forEach(function(o,j){const pl=PL[j],s=S[pl];if(o.err||o.gerr||o.voy.err){faute('p'+p+' g'+g+' '+pl+' : erreur '+String(o.err||o.gerr||o.voy.err).slice(0,120));return;}
      const nG=o.geants.length+(o.ep?1:0)+o.lunes+o.gaz+(o.nap?1:0)+(o.com?1:0),nV=(o.voy.jante?1:0)+(o.voy.roc?1:0)+(o.voy.neb?1:0);
      s.g+=nG;s.v+=nV;s.z+=o.voy.zonesSaut;s.du+=o.durs;s.ob.push(o.nObjets);s.am.push(o.amas?o.amas.length:0);s.ms.push(o.ms);s.s60+=o.sous60;
      if(o.dMin!=null){s.d3.push(o.dMin);s.dh.push(o.dMinH);}
      if(nG)faute('p'+p+' g'+g+' '+pl+' : géant posé ('+o.geants.join(',')+(o.ep?' épave':'')+(o.lunes?' lune':'')+(o.gaz?' gaz':'')+')');
      if(nV)faute('p'+p+' g'+g+' '+pl+' : décor de voyage posé');
      if(o.voy.zonesSaut)faute('p'+p+' g'+g+' '+pl+' : zone de saut refusé de géant');
      if(o.durs)faute('p'+p+' g'+g+' '+pl+' : '+o.durs+' cœurs durs');
      if(o.dMin!=null&&(o.dMin<60||o.dMinH<60))faute('p'+p+' g'+g+' '+pl+' : '+o.dQui+' à '+o.dMin+' m de la route ('+o.dMinH+' m en plan), '+o.sous60+' objets sous 60 m');
      if(!o.amas||!o.amas.length)faute('p'+p+' g'+g+' '+pl+' : aucun amas');
      if(detail)console.log('  p'+p+' g'+g+' '+pl+' objets '+o.nObjets+' amas '+(o.amas?o.amas.map(a=>a.s+':'+a.n).join(' '):'-')+' dMin '+o.dMin+' / '+o.dMinH);});}
  for(const pl of PL){const s=S[pl],mn=a=>a.length?Math.min(...a):'-',mx=a=>a.length?Math.max(...a):'-';
    console.log(('p'+p).padEnd(6)+' | '+pl.padEnd(8)+' | '+String(s.g).padEnd(12)+' | '+String(s.v).padEnd(12)+' | '+String(s.z).padEnd(10)+' | '+String(s.du).padEnd(4)+' | '+(moy(s.ob)+' ['+mn(s.ob)+'-'+mx(s.ob)+']').padEnd(20)+' | '+(moy(s.am)+' ['+mn(s.am)+'-'+mx(s.am)+']').padEnd(18)+' | '+(mn(s.d3)+' / '+mn(s.dh)).padEnd(31)+' | '+String(s.s60).padEnd(9)+' | '+moy(s.ms));}}
for(const f of fautes)console.log('  ✘ '+f);
console.log(ko?'✘ L\'ESPACE SANS GÉANTS : '+ko+' faute'+(ko>1?'s':''):'✔ L\'ESPACE SANS GÉANTS : aucun géant, aucun décor de module, tous les amas à 60 m et plus de la route');
process.exit(ko?1:0);
