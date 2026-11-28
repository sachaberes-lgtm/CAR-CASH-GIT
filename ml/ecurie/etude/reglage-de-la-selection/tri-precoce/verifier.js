/* ===== TRI PRECOCE : LES CONTROLES DES OUTILS (27/11/2026, etude « tri-precoce ») =====
   1. ajusterRapide (outils.js) rend-il les memes a, b, â, sigma que note.js (ajuster) sur les vraies courses des gen. 0 et 1 ?
   2. Phi (la loi normale) contre des valeurs connues.
   3. le tableau du temps par palier (ce que le simulateur fait payer a une course).
   usage : node verifier.js > verifier.txt   (code 1 si un controle rate) */
'use strict';
const fs=require('fs'),path=require('path');
const O=require('./outils');
const N=require(path.join(__dirname,'..','..','..','..','evolution','note.js'));
const L=fs.readFileSync(path.join(__dirname,'donnees','courses-2026-48.jsonl'),'utf8').trim().split('\n').map(JSON.parse)
  .filter(l=>l.usage==='entrainement'&&l.mesuree===true&&(l.generation===0||l.generation===1));
const P=JSON.parse(fs.readFileSync(path.join(__dirname,'donnees','population.json'),'utf8'));
const viv=P.vivants.map(v=>v.id);
let ok=true;
/* 1. */
const ref=N.ajuster(L,{passes:10,retrecir:12,ids:viv});
const ids=[...new Set(L.map(l=>l.id))],gr=[...new Set(L.map(l=>l.graine))];
const ip=L.map(l=>ids.indexOf(l.id)),jg=L.map(l=>gr.indexOf(l.graine)),y=L.map(l=>l.palier);
const vv=ids.map(i=>viv.indexOf(i)>=0?1:0);
const f=O.ajusterRapide(ip,jg,y,L.length,ids.length,gr.length,vv,10,12);
let da=0,dh=0,db=0;
ids.forEach((id,p)=>{da=Math.max(da,Math.abs(f.a[p]-ref.a[id]));dh=Math.max(dh,Math.abs(f.ahat[p]-ref.ahat[id]));});
gr.forEach((g,j)=>{db=Math.max(db,Math.abs(f.b[j]-ref.b[g]));});
const ds=Math.abs(f.sigma-ref.sigmaRes);
console.log('1. ajusterRapide contre note.js ('+L.length+' courses, '+ids.length+' pilotes, '+gr.length+' graines) : ecart max a '+da.toExponential(2)+', â '+dh.toExponential(2)+', b '+db.toExponential(2)+', sigma '+ds.toExponential(2)+' ; abar '+f.abar.toFixed(4)+' / '+ref.abar.toFixed(4));
if(Math.max(da,dh,db,ds)>1e-9){ok=false;console.log('   RATE');}
/* 2. */
const cas=[[0,0.5],[1,0.841345],[-1.96,0.024998],[2.5,0.99379],[-3,0.0013499]];
for(const [x,v] of cas){const e=Math.abs(O.Phi(x)-v);console.log('2. Phi('+x+') = '+O.Phi(x).toFixed(6)+' (attendu '+v+')');if(e>1e-5){ok=false;console.log('   RATE');}}
/* 3. */
console.log('3. temps moyen d\'une course selon son palier (s de calcul, '+O.TT.lignes+' courses ; « - » = moins de 5 courses, la droite '+O.R.tempsOrigine.toFixed(1)+' + '+O.R.tempsPente.toFixed(2)+' x palier) :');
const t=[];for(let p=1;p<=20;p++)t.push(p+': '+O.tempsDe(p).toFixed(0)+(O.TT.N[p]?' ('+O.TT.N[p]+')':' (-)'));
console.log('   '+t.join(' · '));
console.log(ok?'TOUT EST BON':'UN CONTROLE A RATE');
process.exit(ok?0:1);
