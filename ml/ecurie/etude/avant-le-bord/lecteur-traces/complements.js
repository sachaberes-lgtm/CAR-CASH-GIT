#!/usr/bin/env node
/* ===== AVANT LE BORD, COMPLEMENTS (28/11/2026, le lecteur des traces) =====
   Relit sorties/avant-le-bord.json (ecrit par avant-le-bord.js) et les traces, sans course. Ajoute :
   1. la nitro demandee a chaque recul : tableau croise et Fisher ;
   2. la vitesse et la nitro A CARTE EGALE : permutation des etiquettes « mort » DANS chaque carte (la carte ne peut plus rien expliquer) ;
   3. le balancement du cap (zigzag) sur [0,6 ; 3] s : amplitude, changements de signe ;
   4. la vitesse rapportee a la mediane des poses de la meme carte et du meme palier.
   usage : node complements.js */
'use strict';
const fs=require('fs'),path=require('path'),zlib=require('zlib');
const ICI=__dirname,LIG=path.join(ICI,'..','..','sortie-preparee','sorties','lignes');
const A=JSON.parse(fs.readFileSync(path.join(ICI,'sorties','avant-le-bord.json'),'utf8'));
const D=A.decollages.filter(d=>d.fin!=='tmax'),M=D.filter(d=>d.fin==='mort'),N=D.filter(d=>d.fin==='pose');
const q=(a,p)=>{const b=a.filter(x=>x!=null&&isFinite(x)).sort((x,y)=>x-y);if(!b.length)return null;const i=(b.length-1)*p,lo=Math.floor(i),hi=Math.ceil(i);return +(b[lo]+(b[hi]-b[lo])*(i-lo)).toFixed(3);};
function lnf(n){let s=0;for(let i=2;i<=n;i++)s+=Math.log(i);return s;}
function hyp(a,b,c,d){const n=a+b+c+d;return Math.exp(lnf(a+b)+lnf(c+d)+lnf(a+c)+lnf(b+d)-lnf(n)-lnf(a)-lnf(b)-lnf(c)-lnf(d));}
function fisher2(a,b,c,d){const r1=a+b,c1=a+c,n=a+b+c+d,p0=hyp(a,b,c,d);let p=0;for(let x=Math.max(0,r1+c1-n);x<=Math.min(r1,c1);x++){const y=r1-x,z=c1-x,w=n-r1-z;const px=hyp(x,y,z,w);if(px<=p0*(1+1e-7))p+=px;}return Math.min(1,p);}
let X=987654321;const rnd=()=>{X^=X<<13;X>>>=0;X^=X>>17;X^=X<<5;X>>>=0;return X/4294967296;};
const L=[];const P=s=>{L.push(s);};

P('== 1. La nitro demandee au sol, morts contre poses ==');
for(const R of ['0.3','0.6','0.8','1','1.5','2']){const m=M.filter(d=>d.vues[R]),n=N.filter(d=>d.vues[R]);
  const a=m.filter(d=>d.vues[R].nitro).length,b=m.length-a,c=n.filter(d=>d.vues[R].nitro).length,dd=n.length-c;
  P('  '+R.padEnd(4)+' s : morts nitro '+a+' / sans '+b+' ; poses nitro '+c+' / sans '+dd+'  (sans nitro : morts '+Math.round(100*b/m.length)+' %, poses '+Math.round(100*dd/n.length)+' %)  p(Fisher bilat.) '+fisher2(a,b,c,dd).toFixed(3));}
P('');

/* 2. a carte egale : statistique = somme des rangs (dans la carte) des morts ; permutation des etiquettes dans chaque carte */
function strate(nom,val,nPerm){
  const B=D.filter(d=>val(d)!=null);const parC={};for(const d of B)(parC[d.carte]=parC[d.carte]||[]).push(d);
  const stat=et=>{let s=0;for(const k in parC){const g=parC[k];const v=g.map(val);const ord=v.map((x,i)=>i).sort((i,j)=>v[i]-v[j]);const rang=new Array(g.length);
      for(let r=0;r<ord.length;){let r2=r;while(r2+1<ord.length&&v[ord[r2+1]]===v[ord[r]])r2++;for(let z=r;z<=r2;z++)rang[ord[z]]=((r+r2)/2+.5)/g.length;r=r2+1;}
      for(let i=0;i<g.length;i++)if(et[k][i])s+=rang[i]-.5;}return s;};
  const et0={};for(const k in parC)et0[k]=parC[k].map(d=>d.fin==='mort');
  const s0=stat(et0);let plus=0;
  for(let p=0;p<nPerm;p++){const e={};for(const k in parC){const a=et0[k].slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[a[i],a[j]]=[a[j],a[i]];}e[k]=a;}
    if(Math.abs(stat(e))>=Math.abs(s0)-1e-12)plus++;}
  const nm=B.filter(d=>d.fin==='mort').length;
  P('  '+nom.padEnd(34)+' morts vus '+nm+' sur '+B.length+' ; rang moyen des morts dans leur carte (0,5 = au hasard) '+(.5+s0/nm).toFixed(3)+' ; p (permutation dans la carte, bilat., '+nPerm+' tirages) '+(plus/nPerm).toFixed(4));}
P('== 2. A carte egale (la carte retiree) : les morts sont-ils plus rapides, plus souvent sans nitro ? ==');
for(const R of ['0.6','1','1.5','2'])strate('vitesse a '+R+' s',d=>d.vues[R]?d.vues[R].v:null,4000);
strate('vitesse au decollage (evenement)',d=>d.kmhDecol,4000);
for(const R of ['0.6','1','1.5'])strate('nitro demandee a '+R+' s (1/0)',d=>d.vues[R]?(d.vues[R].nitro?1:0):null,4000);
strate('palier (derniere vue)',d=>d.dernier?d.dernier.pal:null,4000);
strate('marge a 0,6 s',d=>d.vues['0.6']?d.vues['0.6'].marge:null,4000);
P('');

/* 3. le balancement du cap, relu dans les traces */
P('== 3. Le zigzag : le cap sur [0,6 ; 3] s avant le decollage (oriente vers la sortie) ==');
const C={};for(const n of fs.readdirSync(LIG).filter(x=>/\.jsonl\.gz$/.test(x))){const T=zlib.gunzipSync(fs.readFileSync(path.join(LIG,n))).toString().trim().split('\n').map(x=>JSON.parse(x));C[n.replace(/\.jsonl\.gz$/,'')]=T.slice(1).filter(v=>!v.erreurDiag);}
for(const d of D){const V=C[d.course];const tPose=d.td-d.ecartPose;
  const S=V.filter(v=>v.mo==='s'&&v.t>tPose+1e-9&&d.td-v.t>=.6-1e-9&&d.td-v.t<=3.05);
  if(S.length<8){d.zz=null;continue;}
  const cap=S.map(v=>v.cap*d.co),lat=S.map(v=>v.lat*d.co);let chg=0;for(let i=1;i<cap.length;i++)if(Math.sign(cap[i])!==Math.sign(cap[i-1])&&Math.abs(cap[i]-cap[i-1])>.02)chg++;
  const ampl=Math.max(...cap)-Math.min(...cap);
  d.zz={n:S.length,ampl:+ampl.toFixed(3),chg,capAbsMoy:+(cap.reduce((a,x)=>a+Math.abs(x),0)/cap.length).toFixed(3),latAmpl:+(Math.max(...lat)-Math.min(...lat)).toFixed(2)};}
for(const g of ['ampl','chg','capAbsMoy','latAmpl']){const m=M.map(d=>d.zz&&d.zz[g]),n=N.map(d=>d.zz&&d.zz[g]);
  P('  '+g.padEnd(10)+' mediane (q25..q75) morts '+q(m,.5)+' ('+q(m,.25)+'..'+q(m,.75)+') ; poses '+q(n,.5)+' ('+q(n,.25)+'..'+q(n,.75)+')  n '+m.filter(x=>x!=null).length+'/'+n.filter(x=>x!=null).length);
  strate('  a carte egale : '+g,d=>d.zz?d.zz[g]:null,4000);}
P('');

/* 4. la vitesse rapportee a la mediane des poses (meme carte, meme palier) */
P('== 4. La vitesse a 1 s rapportee a celle des poses de la meme carte et du meme palier ==');
const R='1';const ref={};for(const d of N)if(d.vues[R]){const k=d.carte+'|'+d.vues[R].pal;(ref[k]=ref[k]||[]).push(d.vues[R].v);}
const rel=d=>{if(!d.vues[R])return null;const r=ref[d.carte+'|'+d.vues[R].pal];if(!r||r.length<3)return null;const m=q(r,.5);return +(d.vues[R].v/m).toFixed(3);};
const rm=M.map(rel).filter(x=>x!=null),rn=N.map(rel).filter(x=>x!=null);
P('  v / mediane des poses (meme carte, meme palier, au moins 3 poses) : morts n '+rm.length+' mediane '+q(rm,.5)+' (q25..q75 '+q(rm,.25)+'..'+q(rm,.75)+') ; poses n '+rn.length+' mediane '+q(rn,.5)+' ('+q(rn,.25)+'..'+q(rn,.75)+')');
for(const s of [1.05,1.1,1.15]){const a=rm.filter(x=>x>s).length,b=rm.length-a,c=rn.filter(x=>x>s).length,dd=rn.length-c;P('    seuil > '+s+' : morts '+a+' au-dessus / '+b+' en dessous ; poses '+c+' / '+dd+'  p(Fisher bilat.) '+fisher2(a,b,c,dd).toFixed(4));}
P('');
/* 5. la vitesse a 1,5 s, seuil 143 (le meilleur seuil du tableau 3), carte par carte */
P('== 5. Vitesse a 1,5 s > 143 m/s, carte par carte (morts au-dessus/en dessous ; poses au-dessus/en dessous) ==');
for(const k of ['canyon','grotte','ville','jade']){const m=M.filter(d=>d.carte===k&&d.vues['1.5']),n=N.filter(d=>d.carte===k&&d.vues['1.5']);
  const a=m.filter(d=>d.vues['1.5'].v>143).length,c=n.filter(d=>d.vues['1.5'].v>143).length;P('  '+k.padEnd(7)+' morts '+a+'/'+(m.length-a)+' ; poses '+c+'/'+(n.length-c)+(n.length?'  (part mortelle au-dessus '+(a+c?Math.round(100*a/(a+c)):'-')+' %, en dessous '+((m.length-a)+(n.length-c)?Math.round(100*(m.length-a)/((m.length-a)+(n.length-c))):'-')+' %)':''));}
fs.writeFileSync(path.join(ICI,'sorties','complements.txt'),L.join('\n')+'\n');
process.stdout.write(L.join('\n')+'\n');
