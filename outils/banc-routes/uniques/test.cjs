/* ===== LES ROUTES UNIQUES — LE TEST (2026-11-17, Sacha : « il faut que vraiment chaque route soit unique ») =====
     node outils/banc-routes/uniques/test.cjs [cartes=jade,espace] [graines=7001-7200] [paliers=0,10]
   Rejoue la mesure (mesure.cjs, 200 routes DE SUITE par palier, la mémoire du sac comme dans une séance) et ÉCHOUE (code 1) si l'ouverture redevient écrite,
   si le faisceau se resserre, si une suite de modules est jouée deux fois, si un module du sac ne sort plus. Les seuils sont entre l'AVANT mesuré
   (passation/routes-uniques/avant) et l'APRÈS (…/apres) : loin de l'un comme de l'autre.
   | indicateur (200 routes)                         | Jade avant p0/p10 | Jade après | Espace avant p0/p10 | Espace après | seuil Jade | seuil Espace |
   | suites de modules différentes                    | 16 / 4            | 200 / 200  | 71 / 19             | 200 / 200    | = n        | = n          |
   | 1ers modules différents                          | 8 / 4             | 39 / 39    | 9 / 6               | 28 / 27      | ≥ 25       | ≥ 18         |
   | part du 1er module le plus fréquent              | 13 % / 28 %       | 7 % / 9 %  | 23 % / 33 %         | 11 % / 13 %  | ≤ 15 %     | ≤ 19 %       |
   | formes de dessus (≠ > 200 m sur 1,5 km)          | 17 / 4            | 59 / 34    | 6 / 2               | 35 / 19      | ≥ 35 / 20  | ≥ 20 / 11    |
   | écart-type de la pente à 300 m (l'ouverture, °)  | 0,3 / 0           | 11 / 8     | 2,9 / 3,1           | 13 / 9       | ≥ 5        | ≥ 6          |
   | écart-type de l'altitude à 3 km (m)              | 101 / 23          | 247 / 340  | 99 / 105            | 366 / 369    | ≥ 170      | ≥ 230        |
   | modules vus                                      | 15 / 7            | 40 / 41    | 13 / 9              | 30 / 29      | ≥ 38       | ≥ 27         | */
const cp=require('child_process'),fs=require('fs'),path=require('path'),os=require('os');
const RAC=path.resolve(__dirname,'../../..'),arg=(k,d)=>{const a=process.argv.find(x=>x.startsWith(k+'='));return a?a.slice(k.length+1):d;};
const cartes=arg('cartes','jade,espace').split(','),graines=arg('graines','7001-7200'),paliers=arg('paliers','0,10').split(',').map(Number);
const n=(function(){const g=graines.split('-').map(Number);return g[1]-g[0]+1;})(),out=fs.mkdtempSync(path.join(os.tmpdir(),'routes-uniques-test-'));
const S={jade:{prem:25,top:.15,formes:{0:35,10:20},pente:5,y3:170,vus:38},espace:{prem:18,top:.19,formes:{0:20,10:11},pente:6,y3:230,vus:27}};
let ko=0;const dit=(ok,t)=>{if(!ok)ko++;console.log((ok?'  ✔ ':'  ✘ ')+t);};
for(const c of cartes){cp.execFileSync('node',[path.join(__dirname,'mesure.cjs'),'carte='+c,'graines='+graines,'paliers='+paliers.join(','),'out='+out,'etiquette=test','nom=test'],{cwd:RAC,stdio:['ignore','ignore','inherit'],maxBuffer:1<<28});
  const J=JSON.parse(fs.readFileSync(path.join(out,c+'-test-mesure.json'),'utf8')),T=S[c];
  for(const p of paliers){const s=J.parPalier[p].stats,ouv=s.ouverture.filter(o=>o.s===300)[0],f=T.formes[p]!=null?Math.round(T.formes[p]*n/200):null;console.log(c+' · palier '+p+' · '+s.n+' routes · '+s.msMoy+' ms/route');
    dit(s.err===0,'aucune exception ('+s.err+')');
    dit(s.suitesDistinctes===s.n,'chaque suite de modules est unique : '+s.suitesDistinctes+' / '+s.n);
    dit(s.premier.length>=T.prem,'1ers modules différents : '+s.premier.length+' (≥ '+T.prem+')');
    dit(s.premier[0][2]<=T.top,'le 1er module le plus fréquent : '+s.premier[0][0]+' '+Math.round(s.premier[0][2]*100)+' % (≤ '+Math.round(T.top*100)+' %)');
    if(f!=null)dit(s.formes[200].brut.formes>=f,'formes de dessus distinctes (1,5 km, > 200 m) : '+s.formes[200].brut.formes+' (≥ '+f+')');
    dit(ouv&&ouv.penteEt>=T.pente,"l'ouverture n'est pas écrite : écart-type de la pente à 300 m "+(ouv?ouv.penteEt:'?')+'° (≥ '+T.pente+'°)');
    if(s.points[3000])dit(s.points[3000].y.et>=T.y3,"le profil s'ouvre : écart-type de l'altitude à 3 km "+s.points[3000].y.et+' m (≥ '+T.y3+' m)');
    dit(s.modulesVus.length>=T.vus,'modules vus : '+s.modulesVus.length+' (≥ '+T.vus+')'+(s.catalogue.jamais.length?' ; jamais : '+s.catalogue.jamais.join(', '):''));}}
fs.rmSync(out,{recursive:true,force:true});
console.log(ko?'✘ ROUTES UNIQUES : '+ko+' échec'+(ko>1?'s':''):'✔ ROUTES UNIQUES : tout tient');process.exit(ko?1:0);
