#!/usr/bin/env node
/* ===== L'IMAGE « LE BRUIT DES NOTES » POUR LE JOURNAL (2026-11-27, Sacha : le journal de bord du portfolio, avec de vraies images) =====
   node ml/ecurie/portfolio/figures-journal/bruit-des-notes.js
   Lit   ml/ecurie/etude/selection-naturelle/bruit/courses-0.json (les courses des pilotes d'essai, faites par extraire.js ; commit 033bfebeb)
   Ecrit ml/ecurie/portfolio/images/journal-bruit-des-notes-clair.svg et journal-bruit-des-notes-sombre.svg
   L'idee : les 34 pilotes ont couru les memes 24 graines ; on range les pilotes par palier moyen, on pose pour chacun ses 24 courses
   (un point par course) et sa moyenne (un trait fort). Les nuages se recouvrent, les moyennes different peu.
   Le script recalcule l'analyse de variance d'analyser.js (meme formule) et s'arrete si elle ne redonne pas resultats.txt
   (ET residu 3,21 ; ET pilote 0,86 ; palier moyen des lots 7,56 et 6,76). Les couleurs, la police et les controles viennent de figures.js. */
const fs=require('fs'),path=require('path');
const ICI=__dirname,PORT=path.join(ICI,'..'),RACINE=path.join(PORT,'..','..','..'),IMG=path.join(PORT,'images');
const {THEMES,verifierSvg}=require(path.join(PORT,'figures.js'));
const SRC='ml/ecurie/etude/selection-naturelle/bruit/courses-0.json';
const X=JSON.parse(fs.readFileSync(path.join(RACINE,SRC),'utf8'));

/* ---------------- les petits outils (les memes que figures.js) ---------------- */
const NB=' ';
function nf(x,k){k=k||0;let s=Math.abs(x).toFixed(k);let [e,d]=s.split('.');if(e.length>3)e=e.replace(/\B(?=(\d{3})+(?!\d))/g,NB);return (x<0&&+s!==0?'−':'')+e+(d?','+d:'');}
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const r1=x=>Math.round(x*10)/10;
const moy=A=>A.reduce((a,b)=>a+b,0)/A.length;
const vari=A=>{const m=moy(A);return A.reduce((a,b)=>a+(b-m)*(b-m),0)/(A.length-1);};
/* la largeur d'un texte, estimee (px par caractere, system-ui), comme figures.js : pour couper et caler sans navigateur */
const LARG={ti:8.4,t:6.5,tb:7,t2:6.2,p:5.7,pt:5.7,src:5.4};
const largeur=(txt,cls)=>String(txt).length*(LARG[String(cls||'t').split(' ')[0]]||6.4);
function coupe(txt,cls,w){const mots=String(txt).split(' '),L=[];let cur='';
  for(const m of mots){const essai=cur?cur+' '+m:m;if(cur&&largeur(essai,cls)>w){L.push(cur);cur=m;}else cur=essai;}if(cur)L.push(cur);return L;}

/* ---------------- les pilotes : par empreinte du fichier, avec leurs deux lots de 12 courses de 300 s (comme analyser.js) ---------------- */
const P={};for(const x of X){const k=x.sha;P[k]=P[k]||{nom:[],l1:null,l2:null};P[k].nom.push(x.fichier.replace(/\.json$/,''));
  if(x.tmax===900)continue;if(x.graines.depart===910000)P[k].l1=x;else P[k].l2=x;}
const deux=Object.values(P).filter(p=>p.l1&&p.l2);
const S1=deux[0].l1.courses.map(c=>c.graine),S2=deux[0].l2.courses.map(c=>c.graine);
for(const p of deux)for(const [L,S] of [[p.l1,S1],[p.l2,S2]])if(L.courses.map(c=>c.graine).join()!==S.join())throw new Error('graines differentes '+p.nom);
const pilotes=deux.map(p=>{const C=p.l1.courses.concat(p.l2.courses).map(c=>c.palier);
  return {nom:p.nom.map(n=>n.replace(/^mes-/,'').replace(/-930000$/,'')).filter(n=>!/^note-/.test(n))[0],C,m:moy(C)};});

/* ---------------- le controle : l'analyse de variance pilote x graine d'analyser.js doit redonner resultats.txt ---------------- */
const M=pilotes.map(p=>p.C);
const Pn=M.length,Sn=M[0].length,g=moy(M.flat()),rm=M.map(moy),cm=M[0].map((_,j)=>moy(M.map(r=>r[j])));
let ssr=0;for(let i=0;i<Pn;i++)for(let j=0;j<Sn;j++)ssr+=(M[i][j]-rm[i]-cm[j]+g)**2;
const msr=ssr/((Pn-1)*(Sn-1)),msp=Sn*rm.reduce((a,x)=>a+(x-g)**2,0)/(Pn-1);
const ET_COURSE=Math.sqrt(msr),ET_PILOTE=Math.sqrt(Math.max(0,(msp-msr)/Sn));
const lot1=moy(deux.map(p=>moy(p.l1.courses.map(c=>c.palier)))),lot2=moy(deux.map(p=>moy(p.l2.courses.map(c=>c.palier))));
const attendu=[['pilotes',Pn,34,0],['graines',Sn,24,0],['ET residu',ET_COURSE,3.21,.005],['ET pilote',ET_PILOTE,0.86,.005],['palier moyen lot 910000',lot1,7.56,.005],['palier moyen lot 930000',lot2,6.76,.005]];
for(const [n,v,a,tol] of attendu){const ok=Math.abs(v-a)<=tol+1e-9;console.log(`${ok?'ok ':'⚠  '} ${n} : ${v.toFixed(3)} (resultats.txt : ${a})`);if(!ok)throw new Error('ne redonne pas resultats.txt : '+n);}
pilotes.sort((a,b)=>a.m-b.m||a.nom.localeCompare(b.nom));
const pire=pilotes[0],meilleur=pilotes[Pn-1];
/* meme graine, meme piste : combien de fois le moins bon bat-il le meilleur (ou fait-il jeu egal) ? */
let bat=0,egal=0;for(let j=0;j<Sn;j++){if(pire.C[j]>meilleur.C[j])bat++;else if(pire.C[j]===meilleur.C[j])egal++;}
const toutes=M.flat(),pMin=Math.min(...toutes),pMax=Math.max(...toutes);
console.log(`moins bon ${pire.nom} ${pire.m.toFixed(2)} · meilleur ${meilleur.nom} ${meilleur.m.toFixed(2)} · sur la meme graine le moins bon gagne ${bat}/24, egalite ${egal}/24 · paliers ${pMin}..${pMax} · moyenne generale ${g.toFixed(2)}`);

/* ---------------- le dessin ---------------- */
function figure(th){
  const W=960,H=448,o=[];
  const T=(x,y,txt,cls,plus)=>o.push(`<text x="${r1(x)}" y="${r1(y)}" class="${cls}"${plus?' '+plus:''}>${esc(txt)}</text>`);
  const L=(x1,y1,x2,y2,c,w,plus)=>o.push(`<line x1="${r1(x1)}" y1="${r1(y1)}" x2="${r1(x2)}" y2="${r1(y2)}" stroke="${c}" stroke-width="${w}"${plus?' '+plus:''}/>`);
  const titre=`Une seule course ne classe pas : le moins bon pilote égale ou bat le meilleur ${bat+egal} fois sur 24`;
  /* « ecart-type » dit en mots simples : l'ecart habituel autour de la moyenne. Et la mise en garde du controleur : les traits vont de 5 a 9,
     mais ce rangement est fait sur ces memes 24 courses, donc une part de leur etalement est encore du hasard (ET des moyennes 1,08 contre 0,86 vrai). */
  const sous=`34 pilotes d’essai ont couru les mêmes 24 courses. D’une course à l’autre, le palier d’un même pilote s’écarte d’habitude de ± ${nf(ET_COURSE,1)} de sa moyenne ; d’un pilote à l’autre, la vraie différence n’est que de ± ${nf(ET_PILOTE,2)}. Même l’étalement des traits, de ${nf(pire.m,1)} à ${nf(meilleur.m,1)}, est en partie dû au hasard.`;
  T(16,24,titre,'ti');
  const SL=coupe(sous,'t2',W-32);SL.forEach((l,i)=>T(16,43+i*15,l,'t2'));
  /* la zone du trace et la zone des deux accolades, a droite */
  const x0=64,x1=706,yH=48+SL.length*15+14,yB=yH+290,v0=0,v1=20;
  const sy=v=>yB-(v-v0)/(v1-v0)*(yB-yH),cw=(x1-x0)/Pn,cx=i=>x0+(i+.5)*cw;
  /* la grille et l'axe des paliers */
  for(let v=0;v<=v1;v+=5){const y=sy(v);L(x0,y,x1,y,th.grille,1);L(x0-4,y,x0,y,th.axe,1);T(x0-7,y+3.5,nf(v),'p e');}
  L(x0,yH,x0,yB,th.axe,1);L(x0,yB,x1,yB,th.axe,1);
  o.push(`<text x="0" y="0" class="t2 m" transform="translate(${r1(x0-34)} ${r1((yH+yB)/2)}) rotate(-90)">palier atteint dans la course</text>`);
  T((x0+x1)/2,yB+18,'les 34 pilotes, rangés du moins bon au meilleur (palier moyen sur leurs 24 courses)','t2 m');
  /* la moyenne de tous, en pointilles fins, jusqu'aux accolades */
  const xa=x1+14,xb=x1+28;
  L(x0,sy(g),xb,sy(g),th.texte2,1,'stroke-dasharray="2 3"');
  /* les nuages : un point par course ; les courses au meme palier sont posees cote a cote */
  const rp=2.1,pas=Math.min(4.4,(cw-3)/6);
  pilotes.forEach((p,i)=>{const n={};for(const v of p.C)n[v]=(n[v]||0)+1;const k={};
    for(const v of p.C.slice().sort((a,b)=>a-b)){k[v]=(k[v]||0);const dx=(k[v]-(n[v]-1)/2)*Math.min(pas,(cw-3)/Math.max(1,n[v]-1));k[v]++;
      o.push(`<circle cx="${r1(cx(i)+dx)}" cy="${r1(sy(v))}" r="${rp}" fill="${th.pilote}" fill-opacity="0.5"/>`);}});
  /* la moyenne de chaque pilote : un trait fort, cercle du fond autour pour qu'il se detache des points */
  pilotes.forEach((p,i)=>{const y=sy(p.m),a=cx(i)-cw/2+2.5,b=cx(i)+cw/2-2.5;
    L(a,y,b,y,th.fond,6.5,'stroke-linecap="round"');L(a,y,b,y,th.texte,3,'stroke-linecap="round"');});
  /* les deux moyennes extremes, en chiffres, sous leur trait (sous les points : sur le fond, avec un halo) */
  const etiq=(p,i)=>T(cx(i),sy(p.m)+16,nf(p.m,1),'pt m hf');
  etiq(pire,0);etiq(meilleur,Pn-1);
  /* la legende, posee pres des marques, en haut a gauche ou les nuages ne montent pas (les 3 premiers pilotes restent sous ce bandeau) */
  const hautG=Math.max(...pilotes.slice(0,12).flatMap(p=>p.C)),yl=sy(19);
  if(sy(hautG)<yl+18)throw new Error('la legende chevaucherait les points');
  const xl=x0+12;
  o.push(`<circle cx="${r1(xl+6)}" cy="${r1(yl-3.5)}" r="${rp}" fill="${th.pilote}" fill-opacity="0.5"/>`);
  T(xl+20,yl,'un point = une course (24 par pilote)','p');
  const yl2=yl+16;L(xl,yl2-3.5,xl+12,yl2-3.5,th.texte,3,'stroke-linecap="round"');
  T(xl+20,yl2,'un trait = le palier moyen du pilote','p');
  /* les deux accolades : l'ecart-type d'une course a l'autre, et la vraie dispersion entre pilotes, autour de la moyenne de tous */
  const accol=(x,e,w,cap)=>{const ya=sy(g+e),yb=sy(g-e);L(x,ya,x,yb,th.texte,w);L(x-5,ya,x+5,ya,th.texte,w);L(x-5,yb,x+5,yb,th.texte,w);};
  accol(xa,ET_COURSE,1.2);accol(xb,ET_PILOTE,3.4);
  /* leurs etiquettes : au-dessus et au-dessous des accolades, calees dans la marge droite (largeur estimee) */
  /* la fine (± 3,2) : son etiquette part de son bout haut par un petit trait ; l'epaisse (± 0,86) : son etiquette a sa hauteur */
  const xt=xb+14,wt=W-16-xt;
  const lab1=coupe(`± ${nf(ET_COURSE,1)} : d’une course à l’autre, pour un même pilote`,'p',wt);
  const lab2=coupe(`± ${nf(ET_PILOTE,2)} : la vraie différence d’un pilote à l’autre`,'p',wt);
  const y1=sy(g+ET_COURSE);L(xa+5,y1,xt-4,y1,th.texte2,1);
  lab1.forEach((l,i)=>T(xt,y1+3.5+i*13,l,'p'));
  const y2=sy(g)+3.5-(lab2.length-1)*13/2;lab2.forEach((l,i)=>T(xt,y2+i*13,l,'pt'));
  if(y1+3.5+(lab1.length-1)*13+6>y2-10)throw new Error('les deux etiquettes des accolades se touchent');
  for(const l of lab1.concat(lab2))if(xt+largeur(l,'p')>W-8)throw new Error('etiquette hors cadre : '+l);
  /* la source */
  T(16,H-10,`Source : ${SRC} (commit 033bfebeb), 34 pilotes × 24 graines, courses de 300 s ; chiffres : bruit/resultats.txt, section 2.`,'src');
  if(yB+18>H-30)throw new Error('le trace descend sur la source');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(titre+'. '+sous)}">
<style>
text{font-family:system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;font-variant-numeric:tabular-nums}
.ti{font-size:15px;font-weight:650;fill:${th.texte}}
.t{font-size:12px;fill:${th.texte}}
.t2{font-size:11.5px;fill:${th.texte2}}
.p{font-size:10.5px;fill:${th.texte2}}
.pt{font-size:10.5px;fill:${th.texte}}
.src{font-size:10px;font-style:italic;fill:${th.texte2}}
.m{text-anchor:middle}.e{text-anchor:end}
.hf{paint-order:stroke;stroke:${th.fond};stroke-width:3.5px;stroke-linejoin:round}
</style>
<rect width="${W}" height="${H}" fill="${th.fond}"/>
${o.join('\n')}
</svg>
`;}

fs.mkdirSync(IMG,{recursive:true});
for(const th of Object.values(THEMES)){
  const f=path.join(IMG,`journal-bruit-des-notes-${th.nom}.svg`),txt=figure(th);
  if(/NaN|undefined/.test(txt))throw new Error('NaN dans '+f);
  fs.writeFileSync(f,txt);const v=verifierSvg(txt);
  console.log(`${v.ok?'ok ':'⚠  '} images/journal-bruit-des-notes-${th.nom}.svg · ${(fs.statSync(f).size/1024).toFixed(0)} Ko · ${v.balises} balises${v.ok?'':' · '+v.err.join(' ; ')}`);
  if(!v.ok)process.exitCode=1;}
