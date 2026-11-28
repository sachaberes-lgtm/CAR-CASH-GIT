/* ===== LA VOIE DES NICHES : QUELLES CASES LES PILOTES DEJA MESURES REMPLISSENT-ILS ? (28/11/2026, concepteur « niches ») =====
   Lecture seule, aucune course. Lit les lignes de courses deja jouees (vraies courses de 900 s, mesurees), par pilote :
   palier moyen, ecart-type, erreur-type, survie mediane, part des courses mortes avant 66 s, E « dans la foule » (ml/evolution/note.js, pur).
   Puis : (1) la variance VRAIE entre pilotes (variance des moyennes moins le bruit) ; (2) la fidelite moitie / moitie des graines ;
   (3) les cases geometriques remplies ; (4) la loi des paliers COURSE par COURSE ; (5) la survie des bots contre celle des 14 parties.
   Usage (depuis la racine du depot) : node ml/ecurie/etude/echelle-de-bots/niches/cases-deja-remplies.js */
'use strict';
const fs=require('fs'),path=require('path');
const RAC=path.join(__dirname,'..','..','..','..','..');
const N=require(path.join(RAC,'ml','evolution','note.js'));
const cfg=JSON.parse(fs.readFileSync(path.join(RAC,'ml','evolution','config.json'),'utf8'));
const REF=N.referenceEpoque();
const SOURCES=[
  ['banc des genes (13 bras + 2 controles)','ml/ecurie/etude/banc-des-genes/etat/courses-2026-48.jsonl'],
  ['selection du 27/11 (copie de l etude du reglage)','ml/ecurie/etude/reglage-de-la-selection/effets/donnees/courses-2026-48.jsonl'],
  ['coffre de la boucle payante','ml/ecurie/etude/boucle-payante-ryzen/coffre/etat/courses-2026-48.jsonl'],
  ['banc v2 (vague en cours, lu tel quel)','ml/evolution/banc/etat/courses-2026-48.jsonl']];
const BORNES=[1,2,3,4.5,6.5,9.5,14,20,30.01]; /* 8 cases geometriques (rapport ~1,45) */
const caseDe=x=>{for(let i=0;i<BORNES.length-1;i++)if(x>=BORNES[i]&&x<BORNES[i+1])return i;return -1;};
const nomCase=i=>'['+BORNES[i]+' ; '+(i===BORNES.length-2?30:BORNES[i+1])+'[';
const moy=A=>A.reduce((s,x)=>s+x,0)/A.length;
const sd=A=>{const m=moy(A);return A.length<2?0:Math.sqrt(A.reduce((s,x)=>s+(x-m)*(x-m),0)/(A.length-1));};
const q=(A,p)=>{const B=A.slice().sort((a,b)=>a-b);return B[Math.min(B.length-1,Math.floor(p*B.length))];};
const f=(x,k)=>x==null||x!==x?'-':x.toFixed(k==null?2:k);
const sortie=[];const dire=x=>{sortie.push(x);console.log(x);};
const toutes=[];
for(const [nom,rel] of SOURCES){
  let txt;try{txt=fs.readFileSync(path.join(RAC,...rel.split('/')),'utf8');}catch(e){dire('== '+nom+' : illisible');continue;}
  const vu=new Set(),par=new Map();
  for(const x of txt.split('\n')){if(!x)continue;let l;try{l=JSON.parse(x);}catch(e){continue;}
    if(l.mesuree!==true||l.tmax!==900||typeof l.palier!=='number')continue;
    const k=l.epoque+'|'+l.pilote+'|'+l.graine;if(vu.has(k))continue;vu.add(k);
    const kp=l.epoque+'|'+l.pilote;if(!par.has(kp))par.set(kp,[]);par.get(kp).push(l);toutes.push(l);}
  const P=[];
  for(const [kp,L] of par){if(L.length<12)continue;
    const pal=L.map(l=>l.palier),sv=L.map(l=>l.survie_s);
    const ef=N.ecartFoule(L.map(l=>l.mesures),REF,cfg.note);
    /* moitie / moitie : graines triees, une sur deux */
    const T=L.slice().sort((a,b)=>a.graine-b.graine),A=T.filter((_,i)=>i%2===0).map(l=>l.palier),B=T.filter((_,i)=>i%2===1).map(l=>l.palier);
    P.push({id:kp.split('|')[1].slice(0,12),ep:kp.split('|')[0],n:L.length,m:moy(pal),sd:sd(pal),se:sd(pal)/Math.sqrt(L.length),
      med:q(pal,.5),q10:q(pal,.1),q90:q(pal,.9),sv:q(sv,.5),tot:L.filter(l=>l.survie_s<66).length/L.length,E:ef.E,seE:ef.seE,parties:ef.parties,mA:moy(A),mB:moy(B)});}
  P.sort((a,b)=>a.m-b.m);
  dire('\n== '+nom+' ('+rel+') : '+vu.size+' courses mesurees de 900 s, '+P.length+' pilotes d au moins 12 courses');
  if(!P.length)continue;
  dire('pilote       | epoque       |   n | palier moyen ± se | ecart-type | q10-med-q90 | survie med (s) | mortes < 66 s |     E ± se  | case');
  for(const p of P)dire(p.id+' | '+p.ep+' | '+String(p.n).padStart(3)+' | '+f(p.m).padStart(5)+' ± '+f(p.se)+'      | '+f(p.sd).padStart(5)+'      | '+p.q10+'-'+p.med+'-'+p.q90+'     | '+f(p.sv,0).padStart(5)+'          | '+f(100*p.tot,0).padStart(3)+' %         | '+f(p.E)+' ± '+f(p.seE)+' | '+nomCase(caseDe(p.m)));
  const vm=sd(P.map(p=>p.m))**2,bruit=moy(P.map(p=>p.se*p.se)),vrai=Math.max(0,vm-bruit);
  dire('palier moyen des pilotes : de '+f(P[0].m)+' a '+f(P[P.length-1].m)+' ; variance des moyennes '+f(vm,3)+' ; bruit attendu (moyenne des se²) '+f(bruit,3)+' ; ecart-type VRAI entre pilotes '+f(Math.sqrt(vrai))+(vm<=bruit?' (les moyennes ne s ecartent pas plus que le bruit)':''));
  if(P.length>=5){const a=P.map(p=>p.mA),b=P.map(p=>p.mB),ma=moy(a),mb=moy(b);let s=0,sa=0,sb=0;for(let i=0;i<a.length;i++){s+=(a[i]-ma)*(b[i]-mb);sa+=(a[i]-ma)**2;sb+=(b[i]-mb)**2;}
    dire('fidelite moitie / moitie des graines (Pearson entre pilotes du palier moyen) : '+f(s/Math.sqrt(sa*sb))+' sur '+P.length+' pilotes');}
  const C=new Map();for(const p of P){const c=caseDe(p.m);if(!C.has(c))C.set(c,[]);C.get(c).push(p);}
  dire('cases remplies : '+[...C.keys()].sort((a,b)=>a-b).map(c=>nomCase(c)+' '+C.get(c).length+' pilote(s), meilleur E '+f(Math.min(...C.get(c).map(p=>p.E)))).join(' · ')+' ; cases vides : '+BORNES.slice(0,-1).map((_,i)=>i).filter(i=>!C.has(i)).map(nomCase).join(' '));
}
/* (4) course par course : la loi des paliers de TOUTES les vraies courses lues */
dire('\n== COURSE PAR COURSE (toutes sources, '+toutes.length+' courses) : combien de courses FINISSENT dans chaque case');
const cc=new Array(BORNES.length-1).fill(0);for(const l of toutes){const c=caseDe(l.palier);if(c>=0)cc[c]++;}
dire(cc.map((n,i)=>nomCase(i)+' '+n+' ('+f(100*n/toutes.length,1)+' %)').join(' · '));
dire('palier maximum d une course : '+Math.max(...toutes.map(l=>l.palier))+' ; courses de palier >= 20 : '+toutes.filter(l=>l.palier>=20).length+' ; >= 14 : '+toutes.filter(l=>l.palier>=14).length);
/* (5) la survie : bots (toutes courses) contre les 14 parties des joueurs (lecteur-joueurs/sortie.json) */
const J=JSON.parse(fs.readFileSync(path.join(__dirname,'..','lecteur-joueurs','sortie.json'),'utf8'));
const sj=J.map(x=>x.duree_s),sb=toutes.map(l=>l.survie_s);
dire('\n== LA SURVIE (s) : quantiles 10 / 25 / 50 / 75 / 90 / max');
dire('joueurs (14 parties) : '+[.1,.25,.5,.75,.9].map(p=>f(q(sj,p),0)).join(' / ')+' / '+f(Math.max(...sj),0));
dire('bots ('+sb.length+' courses) : '+[.1,.25,.5,.75,.9].map(p=>f(q(sb,p),0)).join(' / ')+' / '+f(Math.max(...sb),0));
dire('parties de plus de 240 s : joueurs '+sj.filter(x=>x>240).length+' / 14 ; bots '+f(100*sb.filter(x=>x>240).length/sb.length,1)+' %');
dire('parties de moins de 66 s : joueurs '+sj.filter(x=>x<66).length+' / 14 ; bots '+f(100*sb.filter(x=>x<66).length/sb.length,1)+' %');
const cb={};for(const l of toutes)cb[l.cause]=(cb[l.cause]||0)+1;const cj={};for(const x of J)cj[x.cause]=(cj[x.cause]||0)+1;
dire('causes de fin, bots (%) : '+Object.entries(cb).sort((a,b)=>b[1]-a[1]).map(([k,n])=>k+' '+f(100*n/toutes.length,0)).join(' · '));
dire('causes de fin, joueurs (parties sur 14) : '+Object.entries(cj).sort((a,b)=>b[1]-a[1]).map(([k,n])=>k+' '+n).join(' · '));
/* pieces par minute a duree egale : bots par tranche de survie contre joueurs */
dire('\n== PIECES PAR MINUTE SELON LA DUREE DE LA PARTIE (somme / somme)');
for(const [a,b] of [[60,120],[120,180],[180,240],[240,400],[400,9999]]){
  const Lb=toutes.filter(l=>l.survie_s>=a&&l.survie_s<b&&typeof l.pieces==='number'),Lj=J.filter(x=>x.duree_s>=a&&x.duree_s<b);
  dire(a+'-'+b+' s : bots '+(Lb.length?f(60*Lb.reduce((s,l)=>s+l.pieces,0)/Lb.reduce((s,l)=>s+l.survie_s,0),0):'-')+' ('+Lb.length+' courses) · joueurs '+(Lj.length?f(60*Lj.reduce((s,x)=>s+x.pieces_ramassees,0)/Lj.reduce((s,x)=>s+x.duree_s,0),0):'-')+' ('+Lj.length+' parties)');}
fs.writeFileSync(path.join(__dirname,'sortie-cases.txt'),sortie.join('\n')+'\n');
