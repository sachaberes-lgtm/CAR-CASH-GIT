#!/usr/bin/env node
/* ===== LES PARTIES DES JOUEURS, NIVEAU PAR NIVEAU (2026-11-28, etude « echelle de bots », role lecteur des joueurs) =====
   Lecture seule : ml/bot/etalon/*.json, comptees par partiesJoueurs (ml/bot/mesures.js), comme etalon.js et ressemblance.js.
   usage (depuis la racine du depot) : node ml/ecurie/etude/echelle-de-bots/lecteur-joueurs/parties.js > ml/ecurie/etude/echelle-de-bots/lecteur-joueurs/sortie.txt
   Ecrit aussi sortie.json a cote. Ne lance aucune course. */
const fs=require('fs'),path=require('path');
const R=path.join(__dirname,'..','..','..','..','..');
const {partiesJoueurs,mesures,finVraie,palierDe,SEUILS}=require(path.join(R,'ml/bot/mesures'));
const {mesuresPartie,MESURES}=require(path.join(R,'ml/bot/ressemblance'));
const D=path.join(R,'ml/bot/etalon');
/* = JOUEURS de ml/bot/etalon.js */
const QUI={'cashcar-parties-2026-11-23-1950.json':'Sacha','cashcar-parties-2026-11-23-2020.json':'Sacha','cashcar-parties-2026-11-24-1213.json':'Sacha','cashcar-parties-2026-11-24-11-05.json':'Leo'};
const lus=fs.readdirSync(D).filter(x=>x.endsWith('.json')).sort().map(x=>{const j=JSON.parse(fs.readFileSync(path.join(D,x),'utf8'));(j.parties||[]).forEach(p=>p._f=x);return {nom:x,j};});
const res=partiesJoueurs(lus);
const med=A=>{A=A.filter(x=>x!=null).slice().sort((a,b)=>a-b);const n=A.length;return n?(n%2?A[(n-1)/2]:(A[n/2-1]+A[n/2])/2):null;};
const rang=A=>{const I=A.map((x,i)=>[x,i]).sort((a,b)=>a[0]-b[0]),r=new Array(A.length);for(let i=0;i<I.length;){let j=i;while(j+1<I.length&&I[j+1][0]===I[i][0])j++;for(let k=i;k<=j;k++)r[I[k][1]]=(i+j)/2+1;i=j+1;}return r;};
const pear=(a,b)=>{const n=a.length,ma=a.reduce((x,y)=>x+y,0)/n,mb=b.reduce((x,y)=>x+y,0)/n;let s=0,sa=0,sb=0;for(let i=0;i<n;i++){s+=(a[i]-ma)*(b[i]-mb);sa+=(a[i]-ma)**2;sb+=(b[i]-mb)**2;}return s/Math.sqrt(sa*sb);};
const spear=(a,b)=>pear(rang(a),rang(b));
const L=[];
for(const c0 of res.parties){const c=finVraie(c0),m=mesures(c0),E=mesuresPartie(c0);
  const col={};(c.cols||[]).forEach((n,i)=>col[n]=i);const ech=c.ech||[];
  const sol=ech.filter(e=>e[col.m]===0),kmhSol=sol.length?sol.reduce((a,e)=>a+e[col.kmh],0)/sol.length:null;
  const evm=(c.ev||[]).filter(e=>e[1]==='mort').pop(),routeMort=c.routes&&c.routes[c.routes.length-1];
  /* l'instant ou chaque palier tombe (pieces cumulees des evenements 'piece') */
  let cum=0;const tPal={};for(const e of c.ev||[])if(e[1]==='piece'){cum+=e[2]|0;const q=palierDe(cum);if(!tPal[q])tPal[q]=e[0];}
  L.push({joueur:QUI[c0._f]||'?',fichier:c0._f,debut:c.debut,ver:c.ver,doigt:m.clavier===false,voiture:m.voiture,duree_s:m.duree_s,palier:m.palier,pieces_max:m.pieces_max,
    pieces_ramassees:m.pieces_ramassees,pieces_min:m.pieces_min,cause:m.cause,map_mort:m.cause==='quitte'?null:(routeMort&&routeMort.carte),en_vol:evm?evm[5]:null,
    maps:m.cartes.join('>'),routes:m.routes,chances:m.chances,kmh_moyen:m.kmh_moyen,kmh_sol:kmhSol&&Math.round(kmhSol),vmax:m.vmax,nitro_pct:m.nitro_pct,air_pct:m.air_pct,vols_min:m.vols_min,
    figures_min:m.figures_min,raccourcis:m.raccourcis,tronquee:m.tronquee,t_palier:{5:tPal[5],10:tPal[10],15:tPal[15],20:tPal[20],25:tPal[25]},E:E});}
L.sort((a,b)=>String(a.debut).localeCompare(String(b.debut)));
const out=[];const p=s=>out.push(s);
p(`fichiers ${lus.length} · morceaux lus ${res.lues} · doublons ${res.doublons} · ecartees ${res.ecartees} · recollees ${res.recollees} · parties ${L.length} · minutes ${(L.reduce((a,x)=>a+x.duree_s,0)/60).toFixed(1)}`);
for(const j of ['Sacha','Leo']){const J=L.filter(x=>x.joueur===j);p(`  ${j} : ${J.length} parties, ${(J.reduce((a,x)=>a+x.duree_s,0)/60).toFixed(1)} min, paliers ${J.map(x=>x.palier).sort((a,b)=>a-b).join(' ')}, mediane ${med(J.map(x=>x.palier))}`);}
p(`tous : paliers ${L.map(x=>x.palier).sort((a,b)=>a-b).join(' ')} · mediane ${med(L.map(x=>x.palier))} · record ${Math.max(...L.map(x=>x.palier))}`);
p('\njoueur | debut | ver | voiture | duree s | palier | pieces max | ramassees/min | cause | map de la mort | mode a la mort | km/h moy (tout) | km/h sol | vmax | nitro% | air% | chances | t P5/P10/P15/P20/P25');
for(const x of L)p([x.joueur,x.debut.slice(5,16),x.ver,x.voiture,x.duree_s,x.palier,x.pieces_max,x.pieces_min,x.cause,x.map_mort,x.en_vol,x.kmh_moyen,x.kmh_sol,x.vmax,x.nitro_pct,x.air_pct,x.chances,[5,10,15,20,25].map(k=>x.t_palier[k]==null?'-':Math.round(x.t_palier[k])).join('/')].join(' | '));
/* d'ou vient le palier : la survie ou le rythme ? log(pieces) = log(duree) + log(pieces/min) */
const vr=A=>{const m=A.reduce((a,b)=>a+b,0)/A.length;return A.reduce((a,b)=>a+(b-m)**2,0)/A.length;};
const cov=(a,b)=>{const ma=a.reduce((x,y)=>x+y,0)/a.length,mb=b.reduce((x,y)=>x+y,0)/b.length;return a.reduce((s,x,i)=>s+(x-ma)*(b[i]-mb),0)/a.length;};
const parts=G=>{const lp=G.map(x=>Math.log(x.pieces_ramassees)),ld=G.map(x=>Math.log(x.duree_s)),lr=G.map(x=>Math.log(x.pieces_min));return [(cov(ld,lp)/vr(lp)*100).toFixed(0),(cov(lr,lp)/vr(lp)*100).toFixed(0)];};
const G=L.filter(x=>x.pieces_ramassees>0),G2=G.filter(x=>x.duree_s>=60);
p(`\nlog(pieces ramassees) = log(duree) + log(pieces/min) : part de la duree / du rythme dans la variance : toutes (${G.length}) ${parts(G).join(' % / ')} % ; 60 s et plus (${G2.length}) ${parts(G2).join(' % / ')} %`);
p(`spearman(palier, duree) ${spear(L.map(x=>x.palier),L.map(x=>x.duree_s)).toFixed(2)} · spearman(palier, pieces/min) ${spear(L.map(x=>x.palier),L.map(x=>x.pieces_min)).toFixed(2)} · (60 s+) ${spear(G2.map(x=>x.palier),G2.map(x=>x.pieces_min)).toFixed(2)}`);
p(`spearman(palier, km/h sol) ${spear(L.map(x=>x.palier),L.map(x=>x.kmh_sol)).toFixed(2)} · (60 s+) ${spear(G2.map(x=>x.palier),G2.map(x=>x.kmh_sol)).toFixed(2)}`);
/* les 15 mesures de E, partie par partie, et leur lien au palier */
const M=L.filter(x=>x.E);
p(`\nles 15 mesures de E sur les ${M.length} parties de plus de 60 s ; rho = spearman avec le palier (tous, puis Sacha seul) et avec la duree`);
for(const [k] of MESURES){const A=M.filter(x=>x.E[k]!=null),S=A.filter(x=>x.joueur==='Sacha');
  const f=v=>v==null?'  -  ':v.toFixed(2).padStart(5);
  const r=A.length>=4?spear(A.map(x=>x.palier),A.map(x=>x.E[k])):null,rs=S.length>=4?spear(S.map(x=>x.palier),S.map(x=>x.E[k])):null;
  p(`  ${k.padEnd(11)} n ${String(A.length).padStart(2)} · rho(palier) ${f(r)} · rho Sacha ${f(rs)} · par palier croissant ${A.slice().sort((a,b)=>a.palier-b.palier).map(x=>'P'+x.palier+(x.joueur==='Leo'?'L':'')+':'+(+x.E[k].toFixed(3))).join(' ')}`);}
/* faibles contre fortes chez Sacha (parties de 60 s et plus) */
const S=M.filter(x=>x.joueur==='Sacha').sort((a,b)=>a.palier-b.palier),h=Math.floor(S.length/2),fa=S.slice(0,h),fo=S.slice(S.length-h);
p(`\nSacha, parties de 60 s et plus : faibles ${fa.map(x=>'P'+x.palier).join(',')} contre fortes ${fo.map(x=>'P'+x.palier).join(',')} (medianes)`);
for(const k of ['duree_s','pieces_min','kmh_sol','kmh_moyen','nitro_pct','air_pct','vols_min'])p(`  ${k.padEnd(11)} faibles ${med(fa.map(x=>x[k]))} · fortes ${med(fo.map(x=>x[k]))}`);
const r3=v=>v==null?'-':+v.toFixed(3);
for(const [k] of MESURES)p(`  E.${k.padEnd(11)} faibles ${r3(med(fa.map(x=>x.E[k])))} · fortes ${r3(med(fo.map(x=>x.E[k])))}`);
const Le=M.filter(x=>x.joueur==='Leo').sort((a,b)=>a.palier-b.palier);
p(`Leo, parties de 60 s et plus : ${Le.map(x=>'P'+x.palier+' '+x.duree_s+' s '+x.pieces_min+'/min sol '+x.kmh_sol+' km/h nitro '+x.nitro_pct+'%').join(' ; ')}`);
p(`\nseuils (pieces) des paliers : ${SEUILS.map((s,i)=>'P'+(i+1)+':'+s).join(' ')}`);
console.log(out.join('\n'));
fs.writeFileSync(path.join(__dirname,'sortie.json'),JSON.stringify(L,null,1));
