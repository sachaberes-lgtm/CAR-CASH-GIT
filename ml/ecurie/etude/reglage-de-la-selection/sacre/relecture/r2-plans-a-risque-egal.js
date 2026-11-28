/* ===== RELECTURE DE L'ETUDE « SACRE », CONTROLE 2 : LES PLANS COMPARES A RISQUE EGAL, ET LA MALEDICTION SOUS LE SEQUENTIEL (2026-11-27, le relecteur) =====
   Relit sorties/regards-evolution.json (d-regards.js de l'auteur, relance par le relecteur : meme empreinte SHA-256).
   1. L'auteur classe les plans par puissance alors que leurs taux de faux sacres different (seqOBF 1,6 %, deux etages 1,3 %, fixe-96 1,1 %) :
      un plan qui accepte plus de faux sacres a mecaniquement plus de puissance. Ici chaque plan est ramene au MEME taux de faux sacres que
      seqOBF-2.2 (criteres (b) (c) a 2 se) en reglant son seuil sur les essais nuls, puis on compare la puissance sur les MEMES essais,
      avec l'ecart apparie (nombres aleatoires communs) et son intervalle a 95 %.
   2. La « malediction » proposee par l'auteur pour le sequentiel = dF d'entrainement - dF du DERNIER regard. Sous un plan qui s'arrete selon
      ce qu'il voit, le dF du dernier regard est biaise (on s'arrete tot quand dF est bas, on sacre quand il est haut). On mesure ce biais :
      moyenne du dF du dernier regard contre celle du dF des 24 premieres graines (qui, lui, n'est pas biaise).
   usage : node relecture/r2-plans-a-risque-egal.js > relecture/r2-plans-a-risque-egal.txt */
'use strict';
const fs=require('fs'),path=require('path');
const D=JSON.parse(fs.readFileSync(path.join(__dirname,'..','sorties','regards-evolution.json'),'utf8'));
const REG=D.regards,ix=n=>REG.indexOf(n);
const cas=k=>D.cas.find(c=>c.d===k&&c.e===0).essais;
const z=x=>x[1]>0?x[0]/x[1]:(x[0]>0?Infinity:-Infinity);
const CB=2,CC=2;
const ok=(x,s)=>z(x)>s&&x[2]>-CB*x[3]&&x[4]<CC*x[5];
/* les plans, ecrits a nouveau (pas de require de plans.js) ; chacun rend [sacre, graines, indice du dernier regard] */
const seqOBF=(h,l)=>L=>{for(let k=0;k<REG.length;k++){const x=L[k],hk=h*Math.sqrt(96/REG[k]);if(ok(x,hk))return [true,REG[k],k];if(z(x)<l||REG[k]===96)return [false,REG[k],k];}};
const fixe=(n,s)=>L=>[ok(L[ix(n)],s),n,ix(n)];
const deux=(s1,s2,direct)=>L=>{if(direct!=null&&ok(L[0],direct))return [true,24,0];if(!(z(L[0])>s1))return [false,24,0];return [ok(L[ix(96)],s2),96,ix(96)];};
const taux=(f,E)=>{let s=0,g=0;for(const L of E){const r=f(L);if(r[0])s++;g+=r[1];}return {p:s/E.length,g:g/E.length};};
const nul=cas(0),plus={0.5:cas(0.5),1:cas(1),2:cas(2)};
const ref=seqOBF(2.2,0.5),pRef=taux(ref,nul).p;
console.log('reference : seqOBF-2.2-0.5-96, criteres (b) (c) a 2 se : faux sacres '+(100*pRef).toFixed(2)+' % sur '+nul.length+' essais nuls');
/* un seuil regle par dichotomie pour atteindre (au plus) le meme taux nul */
function regler(fab){let lo=0,hi=6;for(let i=0;i<40;i++){const m=(lo+hi)/2;if(taux(fab(m),nul).p>pRef)lo=m;else hi=m;}return hi;}
const PL=[
  ['fixe-24',s=>fixe(24,s)],['fixe-48',s=>fixe(48,s)],['fixe-72',s=>fixe(72,s)],['fixe-96',s=>fixe(96,s)],
  ['2etages 0,5 -> 96',s=>deux(0.5,s,null)],['2etages 0,5 -> 96 +direct 3',s=>deux(0.5,s,3)],['2etages 1 -> 96',s=>deux(1,s,null)],
  ['seqOBF futilite 0,5',h=>seqOBF(h,0.5)],['seqOBF futilite 0',h=>seqOBF(h,0)]];
console.log('\n1. puissance a risque egal (faux sacres <= '+(100*pRef).toFixed(2)+' %), memes essais ; ecart a seqOBF-2.2 avec IC 95 % apparie');
for(const [nom,fab] of PL){
  const s=regler(fab),f=fab(s),r0=taux(f,nul);
  let txt=nom.padEnd(30)+' seuil '+s.toFixed(3)+' : nul '+(100*r0.p).toFixed(2)+' %, graines nul '+r0.g.toFixed(0);
  for(const d of [0.5,1,2]){const E=plus[d];let a=0,b=0,g=0;const diff=[];
    for(const L of E){const x=f(L)[0]?1:0,y=ref(L)[0]?1:0;a+=x;b+=y;g+=f(L)[1];diff.push(x-y);}
    const m=diff.reduce((s,v)=>s+v,0)/E.length,v=diff.reduce((s,q)=>s+(q-m)*(q-m),0)/(E.length-1),h=1.96*Math.sqrt(v/E.length);
    txt+=' | +'+d+' : '+(100*a/E.length).toFixed(1)+' % (ref '+(100*b/E.length).toFixed(1)+', ecart '+(100*m).toFixed(1)+' +- '+(100*h).toFixed(1)+', graines '+(g/E.length).toFixed(0)+')';}
  console.log(txt);}

console.log('\n2. la malediction sous le sequentiel : dF du dernier regard contre dF des 24 premieres graines (meme essai)');
for(const d of [0,0.5,1,2]){const E=d===0?nul:plus[d];let s24=0,sl=0;
  for(const L of E){const r=ref(L);s24+=L[0][0];sl+=L[r[2]][0];}
  console.log('  vrai ecart +'+d+' : dF moyen a 24 graines '+(s24/E.length).toFixed(3)+' ; dF moyen au dernier regard '+(sl/E.length).toFixed(3)+' ; biais '+((sl-s24)/E.length).toFixed(3)+' palier');}
