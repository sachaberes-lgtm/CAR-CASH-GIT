/* ===== RELECTURE « tri-precoce » : LE TRI PRECOCE SUR LES VRAIS ENFANTS, AVEC UN SEUIL ET UNE BORNE DANS LA MEME REFERENCE (27/11/2026, le relecteur) =====
   regles.js § 3 ajuste le modele pilote + graine sur les SEULES k premieres graines (a_k = la moyenne brute de l'enfant sur ces k graines, car les b
   y sont centres sur k graines), puis le compare a un seuil S venu d'un AUTRE ajustement (les 12 graines de la gen. 0). Les deux nombres n'ont
   pas le meme zero : a_k contient la difficulte moyenne des k premieres graines (ET des graines 1,98 : sur 3 graines, ~1,1 palier).
   Ici, chaque enfant est juge comme evoluer.js le ferait au moment du tri :
     - gen. 0 : les b des graines viennent de l'ajustement des 12 graines (la seule reference possible a la gen. 0) ;
       a_k = moyenne sur ses k premieres graines de (palier - b_g), moins 4·Ē ; S = 7e F le plus bas (temoin exclu) de la gen. 0 (comme regles.js).
     - gen. 1 : UN SEUL ajustement de toutes les courses connues a ce moment (gen. 0 entiere + les k premieres graines de la gen. 1, tous les pilotes),
       note.js tel quel ; a_k = le a (non retreci) de l'enfant moins 4·Ē ; S = 7e F le plus bas des 19 anciens hors temoin DANS CE MEME ajustement.
   On rend aussi l'ecart de reference de regles.js (la moyenne des b des k premieres graines). Lecture seule de donnees/.
   usage : node relecture/tri-reel-apparie.js */
'use strict';
const fs=require('fs'),path=require('path');
const N=require(path.join(__dirname,'..','..','..','..','..','evolution','note.js'));
const cfg=JSON.parse(fs.readFileSync(path.join(__dirname,'..','..','..','..','..','evolution','config.json'),'utf8'));
const D=path.join(__dirname,'..','donnees');
const L=fs.readFileSync(path.join(D,'courses-2026-48.jsonl'),'utf8').trim().split('\n').map(JSON.parse).filter(l=>l.usage==='entrainement'&&l.mesuree===true);
const pop=JSON.parse(fs.readFileSync(path.join(D,'population.json'),'utf8'));
const REF=N.referenceEpoque();
const T='19e3767cc346',KS=[2,3,4,6],C=2;
const moy=A=>A.reduce((s,x)=>s+x,0)/A.length;
const g0=L.filter(l=>l.generation===0),g1=L.filter(l=>l.generation===1);
const ids0=[...new Set(g0.map(l=>l.id))],mut0=ids0.filter(i=>i!==T);
const ordre=X=>{const o=[];for(const l of X)if(o.indexOf(l.graine)<0)o.push(l.graine);return o;};
const o0=ordre(g0),o1=ordre(g1);
const n0=N.noter(g0,{REF,cfg,ids:ids0});
const sig=n0.sigmaRes;   /* le sigma de la gen. 0 (2,92) ; regles.js prend 3,19 (gen. 0 + 1) : on rend les deux marges */
const SIG=[2.92,3.19];
const Ebar=moy(ids0.map(i=>n0.par[i].E));
const S0=mut0.map(i=>n0.par[i].F).sort((a,b)=>a-b)[6];
const fit12=N.ajuster(g0,{passes:10,retrecir:12});
console.log('gen. 0 : S = '+S0.toFixed(2)+' ; E moyen '+Ebar.toFixed(2)+' ; sigma (gen. 0) '+sig.toFixed(2));
let renv={},marge=Infinity,margeAuteur=Infinity;
for(const k of KS){
  const gk=o0.slice(0,k),dec=moy(gk.map(g=>fit12.b[g]));
  const rows=mut0.map(id=>{const x=gk.map(g=>g0.find(l=>l.id===id&&l.graine===g).palier-fit12.b[g]);return [id,moy(x)-4*Ebar];});
  let r=0;for(const [,a] of rows){const m=a+C*3.19/Math.sqrt(k)-S0;marge=Math.min(marge,m);if(m<0)r++;}
  renv[k]=(renv[k]||0)+r;
  console.log('  k='+k+' : moyenne des b des '+k+' premieres graines (le decalage de regles.js) '+dec.toFixed(2)+' ; renvois a c = 2 : '+r+'/19 ; plus basse borne - S '+Math.min(...rows.map(x=>x[1]+C*3.19/Math.sqrt(k)-S0)).toFixed(2));
}
/* gen. 1 */
const enf=pop.vivants.filter(v=>v.ne===1).map(v=>v.id);
const anc=ids0;
console.log('gen. 1 : '+enf.length+' enfants ; ordre des graines '+o1.slice(0,6).join(' ')+' ...');
for(const k of KS){
  const part=g0.concat(g1.filter(l=>o1.indexOf(l.graine)<k));
  const nt=N.noter(part,{REF,cfg,ids:anc.concat(enf)});
  const S=anc.filter(i=>i!==T).map(i=>nt.par[i].F).sort((a,b)=>a-b)[6];
  const Eb=moy(anc.map(i=>nt.par[i].E));
  let r=0;const txt=[];
  for(const id of enf){const ak=nt.par[id].a-4*Eb,m=ak+C*3.19/Math.sqrt(k)-S;marge=Math.min(marge,m);if(m<0)r++;txt.push(id.slice(0,4)+' '+ak.toFixed(2)+(m<0?' RENVOYE':''));}
  renv[k]+=r;
  console.log('  k='+k+' : S (meme ajustement) '+S.toFixed(2)+', E moyen des anciens '+Eb.toFixed(2)+' ; a_k - 4E : '+txt.join(', ')+' ; renvois '+r+'/6');
}
console.log('renvois precoces a c = 2 (sigma 3,19, comme l\'etude) : '+KS.map(k=>'k='+k+' : '+renv[k]+'/25').join(' · ')+' ; plus petite marge '+marge.toFixed(2)+' palier');
