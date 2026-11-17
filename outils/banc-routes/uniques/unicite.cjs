/* ===== L'UNICITÉ DES ROUTES D'ORBITE (2026-11-17, Sacha : « il faut que vraiment chaque route soit unique ») =====
     node outils/banc-routes/uniques/unicite.cjs carte=espace [n=300] [palier=0] [graine0=1] [sans=1]
   n routes DE SUITE dans le même vm (le sac se souvient, comme une séance de jeu) ; la suite jouée = les noms des modules dans l'ordre (orbUNoms) ; (tour 3) LE CRITÈRE = la signature vécue des 10 premières secondes (orbUSig : ouverture, silhouette, relief, familles de modules et leur côté).
   Sort avec le code 1 s'il y a une redite (sauf sans=1 : ?sans=uniques, pour comparer). */
const path=require('path'),RAC=path.resolve(__dirname,'../../..');
const arg=(k,d)=>{const a=process.argv.find(x=>x.startsWith(k+'='));return a?a.slice(k.length+1):d;};
const carte=arg('carte','espace'),n=+arg('n','300'),p=+arg('palier','0'),g0=+arg('graine0','1'),sans=arg('sans','')==='1';
if(carte!=='espace')throw new Error('unicite.cjs : carte=espace seulement (Jade : outils/banc-jade/uniques-stat.cjs)');
const B=require(path.join(RAC,'outils/banc-routes/charge.cjs')).creer(sans?'?sans=uniques':'');
const fig=m=>{let f=String(m.fig);return f==='grande-torsade'?'torsade':f==='s-retourne'?'sret':/^(envers-|faille-envers)/.test(f)?'failleEnvers':f.replace(/-(entree|sortie)$/,'');};
const S=new Map(),SG=new Map();let dupSig=0,dup=0,nm=0,mn=99,mx=0,t=0;const ex=[];
for(let g=g0;g<g0+n;g++){const t0=Date.now();const r9=B.piste('espace',g,p);t+=Date.now()-t0;if(!sans){const sg=B.ctx.orbUSig(r9.ctrl0,r9.marks0).join(' ');if(SG.has(sg))dupSig++;else SG.set(sg,g);}const noms=[];for(const m of B.ctx.MODMARK)if(m.fig){const f=fig(m);if(noms.indexOf(f)<0)noms.push(f);}
  const k=noms.join('>');nm+=noms.length;mn=Math.min(mn,noms.length);mx=Math.max(mx,noms.length);if(S.has(k)){dup++;if(ex.length<6)ex.push('g'+g+' = g'+S.get(k)+' : '+k);}else S.set(k,g);}
console.log('espace palier '+p+(sans?' (?sans=uniques)':'')+' · '+n+' routes de suite · '+S.size+' suites de noms différentes ('+dup+' redite'+(dup>1?'s':'')+') · signatures vécues : '+SG.size+' différentes, '+dupSig+' redite'+(dupSig>1?'s':'')+' · modules par route '+(nm/n).toFixed(2)+' ['+mn+'-'+mx+'] · '+Math.round(t/n)+' ms/route');
for(const e of ex)console.log('  '+e);
if((dupSig||dup)&&!sans)process.exitCode=1; /* (tour 4) les deux : la suite de noms ET la signature vécue */ /* (tour 3) le critère : la signature vécue (orbUSig, les 10 premières secondes) */
