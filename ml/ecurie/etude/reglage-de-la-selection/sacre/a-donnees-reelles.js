/* ===== SACRE, ETAPE A : CE QUE DISENT LES VRAIES COURSES DE L'EVOLUTION DU 27/11 (2026-11-27, l'etude « sacre ») =====
   Lit la copie figee donnees/courses-2026-48.jsonl (copiee le 27/11 a 23:18:26, 573 lignes, depuis l'etat de la vraie evolution, en lecture
   seule) et donne : les courses par usage et par generation ; le bruit d'une course (residu du modele pilote + graine) a 900 s dans la vraie
   configuration ; la dispersion VRAIE entre les mutants de la generation 0 (variance observee moins variance du bruit) : c'est l'ordre de
   grandeur des ecarts que le sacre doit reconnaitre ; la part des courses sans mesures (moins de 60 s) ; le temps reel d'une course.
   usage : node a-donnees-reelles.js > sorties/a-donnees-reelles.txt */
'use strict';
const fs=require('fs'),path=require('path');
const RAC=path.join(__dirname,'..','..','..','..','..');
const N=require(path.join(RAC,'ml','evolution','note.js'));
const cfg=require(path.join(RAC,'ml','evolution','config.json'));
const texte=fs.readFileSync(path.join(__dirname,'donnees','courses-2026-48.jsonl'),'utf8').split('\n');
const L=[];let illisibles=0;
for(const t of texte){if(!t.trim())continue;try{L.push(JSON.parse(t));}catch(e){illisibles++;}}
console.log('lignes lues '+L.length+', illisibles '+illisibles);
const compte={};for(const l of L){const k=l.usage+' g'+l.generation+(l.mesuree?'':' NON MESUREE');compte[k]=(compte[k]||0)+1;}
console.log('par usage et generation :',JSON.stringify(compte));
const E=L.filter(l=>l.usage==='entrainement'&&l.mesuree===true&&typeof l.palier==='number');
/* la derniere ligne par (id, graine) */
const M=new Map();for(const l of E)M.set(l.id+'|'+l.graine,l);
const U=[...M.values()];
const ids=[...new Set(U.map(l=>l.id))],graines=[...new Set(U.map(l=>l.graine))];
console.log('entrainement mesure : '+U.length+' courses, '+ids.length+' pilotes, '+graines.length+' graines');
const parId={};for(const l of U)(parId[l.id]=parId[l.id]||[]).push(l);
const nPar=ids.map(i=>parId[i].length);console.log('courses par pilote : min '+Math.min(...nPar)+', max '+Math.max(...nPar));

/* le modele pilote + graine (note.ajuster) sur les pilotes qui ont joue toutes les graines de la generation 0 */
const g0=U.filter(l=>l.generation===0),g0ids=[...new Set(g0.map(l=>l.id))],g0gr=[...new Set(g0.map(l=>l.graine))];
const fit=N.ajuster(g0,{passes:20,retrecir:0});
console.log('\n== generation 0 : '+g0ids.length+' pilotes x '+g0gr.length+' graines ('+g0.length+' courses) ==');
console.log('ecart-type du residu d\'une course (sigmaRes, ddl N-P-G+1) : '+fit.sigmaRes.toFixed(2));
const bs=Object.values(fit.b);const sd=A=>{const m=A.reduce((s,x)=>s+x,0)/A.length;return Math.sqrt(A.reduce((s,x)=>s+(x-m)*(x-m),0)/(A.length-1));};
console.log('ecart-type des effets de graine b (observe) : '+sd(bs).toFixed(2));
const as=g0ids.map(i=>fit.a[i]),nG=g0gr.length;
const vObs=sd(as)**2,vBruit=fit.sigmaRes**2/nG;
console.log('ecart-type des a observes entre pilotes : '+Math.sqrt(vObs).toFixed(2)+' ; part due au bruit (sigmaRes/sqrt(12)) : '+Math.sqrt(vBruit).toFixed(2)+
  ' ; dispersion VRAIE estimee sqrt(max(0, obs^2 - bruit^2)) : '+Math.sqrt(Math.max(0,vObs-vBruit)).toFixed(2)+' palier');
/* idem pour E : E de chaque pilote sur ses 12 courses, et le bruit de E par bootstrap */
const REF=N.referenceEpoque(),cn=Object.assign({},cfg.note,{bootstrapE:100});
const Es=[],seEs=[];
for(const i of g0ids){const r=N.ecartFoule(g0.filter(l=>l.id===i).map(l=>l.mesures),REF,cn);Es.push(r.E);seEs.push(r.seE);}
const vE=sd(Es)**2,vEb=seEs.reduce((s,x)=>s+x*x,0)/seEs.length;
console.log('E des pilotes de la generation 0 : moyenne '+(Es.reduce((s,x)=>s+x,0)/Es.length).toFixed(3)+', ecart-type observe '+Math.sqrt(vE).toFixed(3)+
  ', bruit moyen (bootstrap de 12 courses) '+Math.sqrt(vEb).toFixed(3)+', dispersion VRAIE estimee '+Math.sqrt(Math.max(0,vE-vEb)).toFixed(3));
console.log('  en F (x4) : dispersion vraie de 4E estimee '+(4*Math.sqrt(Math.max(0,vE-vEb))).toFixed(2));
/* le temoin et les mutants : les a, du meilleur au moins bon */
const tri=g0ids.map((i,k)=>({i,a:as[k],E:Es[k]})).sort((x,y)=>y.a-x.a);
console.log('a (palier moyen corrige des graines) et E, par pilote : '+tri.map(x=>x.i.slice(0,6)+(x.i==='19e3767cc346'?'(temoin)':'')+' '+x.a.toFixed(1)+'/'+x.E.toFixed(2)).join(' ; '));

/* generations 0 et 1 reunies : les pilotes qui ont 24 graines */
const g01=U.filter(l=>l.generation<=1),c01={};for(const l of g01)c01[l.id]=(c01[l.id]||0)+1;
const ids24=Object.keys(c01).filter(i=>c01[i]>=24);
if(ids24.length>=3){
  const sous=g01.filter(l=>ids24.includes(l.id)),f2=N.ajuster(sous,{passes:20,retrecir:0}),nn=24;
  const a2=ids24.map(i=>f2.a[i]),v2=sd(a2)**2,vb2=f2.sigmaRes**2/nn;
  console.log('\n== generations 0+1 : '+ids24.length+' pilotes a 24 graines ==\nsigmaRes '+f2.sigmaRes.toFixed(2)+' ; ET des a observes '+Math.sqrt(v2).toFixed(2)+', bruit '+Math.sqrt(vb2).toFixed(2)+
    ', dispersion VRAIE estimee '+Math.sqrt(Math.max(0,v2-vb2)).toFixed(2));
  /* correlation des a entre la generation 0 et la generation 1 (test-retest : si les pilotes different vraiment, elle est positive) */
  const fa=N.ajuster(sous.filter(l=>l.generation===0),{passes:20,retrecir:0}),fb=N.ajuster(sous.filter(l=>l.generation===1),{passes:20,retrecir:0});
  const X=ids24.map(i=>fa.a[i]),Y=ids24.map(i=>fb.a[i]);
  const mx=X.reduce((s,x)=>s+x,0)/X.length,my=Y.reduce((s,x)=>s+x,0)/Y.length;let sxy=0,sxx=0,syy=0;
  for(let k=0;k<X.length;k++){sxy+=(X[k]-mx)*(Y[k]-my);sxx+=(X[k]-mx)**2;syy+=(Y[k]-my)**2;}
  console.log('correlation des a, generation 0 contre generation 1 (memes pilotes, graines differentes) : '+(sxy/Math.sqrt(sxx*syy)).toFixed(2)+' sur '+ids24.length+' pilotes');
}else console.log('\n(generations 0+1 : moins de 3 pilotes a 24 graines, pas de test-retest)');

const sansM=U.filter(l=>!l.mesures).length;
console.log('\ncourses d\'entrainement sans mesures (moins de 60 s) : '+sansM+' sur '+U.length+' ('+(100*sansM/U.length).toFixed(1)+' %)');
const ms=U.map(l=>l.ms).filter(x=>typeof x==='number').sort((a,b)=>a-b);
console.log('temps reel d\'une course (ms) : mediane '+ms[ms.length>>1]+', moyenne '+Math.round(ms.reduce((s,x)=>s+x,0)/ms.length));
const pal=U.map(l=>l.palier);console.log('palier par course : moyenne '+(pal.reduce((s,x)=>s+x,0)/pal.length).toFixed(2)+', ecart-type '+sd(pal).toFixed(2));
