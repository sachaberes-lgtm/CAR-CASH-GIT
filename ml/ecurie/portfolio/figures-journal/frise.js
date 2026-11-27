#!/usr/bin/env node
/* ===== LA FRISE DES MÉTHODES, POUR LE JOURNAL (2026-11-27, Sacha : « il faut qu'on garde des traces de tous les process, pour un portfolio ») =====
   Node pur, sans dépendance :  node ml/ecurie/portfolio/figures-journal/frise.js
   Écrit ml/ecurie/portfolio/images/journal-frise-clair.svg et journal-frise-sombre.svg (mêmes formes, deux palettes).
   Pas de fichier de données : les dates et les mots sont dans le tableau ETAPES ci-dessous, chacun avec le chapitre
   du journal (ml/ecurie/portfolio/journal/) d'où il vient. Les couleurs, la police et les classes de texte sont celles
   de ml/ecurie/portfolio/figures.js (THEMES), pour que tout le dossier ait la même main.
   Le script vérifie lui-même qu'aucun texte n'en chevauche un autre ni ne sort du cadre (largeurs estimées) : il
   s'arrête avec une erreur sinon. */
const fs=require('fs'),path=require('path');
const ICI=__dirname,IMG=path.join(ICI,'..','images');
const {THEMES}=require(path.join(ICI,'..','figures.js'));

/* ---------------- les étapes ---------------- */
/* qui : celui qui a décidé le virage VERS cette étape ('Sacha' ou 'Claude').
   arret : ce qui l'a arrêtée (six mots au plus). */
const ETAPES=[
  { /* 00_avant-le-22-novembre.md, « Ce qu'on a tenté » : 1re trace dans git le 7/09 (commit deacc99ad, ml/sim et ml/train) ;
       LISEZ-MOI.md § 2 : « Décidé par Sacha pour la règle (« la moitié la plus nulle se fait remplacer ») et par Claude pour les réseaux » */
    jour:'2026-09-07',date:'7 septembre',nom:'Sélection sur copie',
    quoi:'dans une copie du jeu, de zéro',
    /* 00, « Ce qu'on a appris / Sur la copie du jeu » ; LISEZ-MOI.md § 3 : « la copie avait divergé du vrai jeu » */
    arret:'la copie avait divergé du jeu',qui:'Sacha',
    /* LISEZ-MOI.md § 2 : décision partagée, la règle à Sacha, les réseaux et les notes à Claude */
    quiTxt:'virage : Sacha (la règle), Claude (les réseaux)'},
  { /* 00, « Quitter la copie : ml/reel (20 octobre) » (commit 6f4dbdc29) ; décisions : la demande de Sacha
       (bots « fonctionnels sur la version actuelle du jeu ») « c'est ce qui mène à ml/reel » */
    jour:'2026-10-20',date:'20 octobre',nom:'Sélection, vrai jeu',
    quoi:'dans le vrai jeu, de zéro',
    /* 00 : « Sur 6 pistes jamais vues : 3 survivent » ; LISEZ-MOI.md § 3 : « pas fiable » */
    arret:'3 survivants sur 6 pistes neuves',qui:'Sacha'},
  { /* 2026-11-22_23.md : le plan, commit d2ee1f114 ; « La méthode […] est une proposition de Claude » */
    jour:'2026-11-22',date:'22 novembre',nom:'Cerveaux écrits lisibles',
    quoi:'Claude écrit le cerveau du bot',
    /* 2026-11-24.md, « Les décisions » : le nouveau PLAN.md « remplace les étapes 2 à 8 du plan d'origine » */
    arret:'plan en partie remplacé le 24/11',qui:'Claude',
    /* 2026-11-22_23.md, « Les décisions » : le plan porte encore « pas encore validé par Sacha » */
    quiTxt:'virage proposé par Claude'},
  { /* 2026-11-24.md, « Les décisions » : « Sacha : le nouveau but » (commit ef630b812) ; LISEZ-MOI.md § 2 : « un nouveau but, pas encore une nouvelle méthode » */
    jour:'2026-11-24',date:'24 novembre',nom:'Indiscernables des joueurs',
    quoi:'un nouveau but, pas une méthode',
    /* 2026-11-27.md, « La question du moment » : « Le but fixé par Sacha : des bots qu'on ne distingue pas de vrais joueurs » */
    arret:'aucun : le but tient toujours',qui:'Sacha'},
  { /* 2026-11-25.md et 2026-11-25_suite.md ; « Les décisions » du 25/11 : « Sacha : payer le travail sur les 200 € de crédit d'API » */
    jour:'2026-11-25',date:'25 novembre',nom:'Boucle d’agents payés',
    quoi:'des IA payées écrivent des variantes',
    /* 2026-11-25_suite.md, « En une phrase » : « aucune n'a gagné un palier qui tienne sur des courses neuves » */
    arret:'aucun gain sur des courses neuves',qui:'Sacha',
    /* 2026-11-22_23.md : la boucle payée sur l'API est au plan de Claude du 22/11 (commit d2ee1f114, « boucle API ») ;
       2026-11-25.md, « Les décisions » : Sacha exige qu'elle soit payée sur les crédits d'API. Décision partagée. */
    quiTxt:'virage : Sacha (payer sur l’API), boucle prévue par Claude'},
  { /* 2026-11-26.md, « Les décisions » : « Claude décide de ne pas relancer la boucle payante telle quelle » ; il règle le pilote à la main */
    jour:'2026-11-26',date:'26 novembre',nom:'Pilote réglé manuellement',
    quoi:'Claude corrige un défaut à la fois',
    /* 2026-11-27.md, « Le tournant, venu de Sacha », 15 h 25 UTC : « le plan que tu as fait ne me correspond pas vraiment » */
    arret:'Sacha : « ne me correspond pas vraiment »',qui:'Claude'},
  { /* 2026-11-27.md : « changer de cap vers la sélection naturelle » (Sacha) ; forme hybride choisie par Claude */
    jour:'2026-11-27',date:'27 novembre',nom:'Sélection naturelle hybride',
    quoi:'dans le vrai jeu, sur le pilote écrit',
    /* 2026-11-27.md, « Ce qu'on a tenté » : « La sélection elle-même n'a pas encore tourné » */
    arret:'construite, n’a pas encore tourné',qui:'Sacha',enCours:true,
    /* 2026-11-27.md, « Les décisions » : « Claude : la forme hybride plutôt qu'un réseau parti de zéro » */
    quiTxt:'virage décidé par Sacha ; forme hybride : Claude'},
];

/* ---------------- outils (repris de figures.js) ---------------- */
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const r1=x=>Math.round(x*10)/10;
const nf=(x,k)=>{let s=Math.abs(x).toFixed(k||0);return (x<0?'−':'')+s.replace('.',',');};
/* largeur d'un texte, en px par caractère (system-ui), majorée pour rester prudent */
const LARG={ti:8.2,t2:6.1,p:5.6,src:5.3,dt:6.9,nm:7.7,rs:6.1,qu:5.6};
const TAILLE={ti:15,t2:11.5,p:10.5,src:10,dt:12,nm:14,rs:12,qu:11};
const largeur=(txt,cls)=>String(txt).length*LARG[cls];
function coupe(txt,cls,w){const mots=String(txt).split(' '),L=[];let cur='';
  for(const m of mots){const essai=cur?cur+' '+m:m;if(cur&&largeur(essai,cls)>w){L.push(cur);cur=m;}else cur=essai;}
  if(cur)L.push(cur);return L;}
const jours=iso=>Date.parse(iso+'T12:00:00Z')/864e5;

/* ---------------- la mise en page (identique pour les deux palettes) ---------------- */
const W=960,MG=16;
const CARTE=165;                       /* largeur d'une carte de texte */
/* l'axe en deux morceaux : à gauche septembre-octobre (une graduation par semaine), à droite 22-27 novembre (une par jour) */
const A={d0:jours('2026-09-01')-0.5,d1:jours('2026-10-26')-0.5,x0:40,x1:282};
const B={d0:jours('2026-11-22')-0.5,d1:jours('2026-11-28')-0.5,x0:398,x1:944};
const xA=d=>A.x0+(d-A.d0)/(A.d1-A.d0)*(A.x1-A.x0),xB=d=>B.x0+(d-B.d0)/(B.d1-B.d0)*(B.x1-B.x0);
const pxA=(A.x1-A.x0)/(A.d1-A.d0),pxB=(B.x1-B.x0)/(B.d1-B.d0),RAPPORT=Math.round(pxB/pxA);
const TROU=Math.round(jours('2026-11-22')-jours('2026-10-20'));   /* jours entre les deux étapes qui encadrent la cassure */
const CACHE=Math.round(B.d0-A.d1);                               /* jours que la cassure retire vraiment de l'axe (26/10 → 22/11) */
const xDe=e=>{const d=jours(e.jour);return d<B.d0?xA(d):xB(d);};

function mise(){
  const cartes=ETAPES.map((e,i)=>{
    const haut=i%2===0;   /* une carte sur deux au-dessus de l'axe, l'autre en dessous */
    const L=[{t:e.date,c:'dt',lh:16}];
    coupe(e.nom,'nm',CARTE).forEach(t=>L.push({t,c:'nm',lh:17}));
    coupe(e.quoi,'qu',CARTE).forEach(t=>L.push({t,c:'qu',lh:14}));
    coupe('arrêt : '+e.arret,'rs',CARTE).forEach((t,k)=>L.push({t,c:'rs',lh:15,esp:k===0?5:0}));
    coupe(e.quiTxt||('virage décidé par '+e.qui),'p',CARTE).forEach((t,k)=>L.push({t,c:'p',lh:14,esp:k===0?4:0}));
    const h=L.reduce((s,l)=>s+l.lh+(l.esp||0),0);
    const w=Math.max(...L.map(l=>largeur(l.t,l.c)));
    return {e,i,haut,L,h,w,x:xDe(e)};});
  /* place chaque carte centrée sur sa marque, tenue dans le cadre, puis repoussée à gauche si elle touche sa voisine du même côté */
  for(const c of cartes){c.g=Math.min(Math.max(c.x-c.w/2,MG),W-MG-c.w);}
  for(const cote of [true,false]){const S=cartes.filter(c=>c.haut===cote);
    for(let k=S.length-2;k>=0;k--){const lim=S[k+1].g-14;if(S[k].g+S[k].w>lim)S[k].g=Math.max(MG,lim-S[k].w);}}
  const hHaut=Math.max(...cartes.filter(c=>c.haut).map(c=>c.h)),hBas=Math.max(...cartes.filter(c=>!c.haut).map(c=>c.h));
  const yLeg=78,yAxe=yLeg+18+hHaut+30,yBas=yAxe+52,H=Math.ceil(yBas+hBas+46);
  return {cartes,yLeg,yAxe,yBas,H};}

/* ---------------- le dessin ---------------- */
function dessine(th){
  const {cartes,yLeg,yAxe,yBas,H}=mise();
  const o=[],boites=[];
  const T=(x,y,txt,cls,ancre,style)=>{const w=largeur(txt,cls),g=ancre==='m'?x-w/2:ancre==='e'?x-w:x;
    boites.push({x0:g,x1:g+w,y0:y-TAILLE[cls]*0.8,y1:y+TAILLE[cls]*0.25,txt});
    o.push(`<text x="${r1(x)}" y="${r1(y)}" class="${cls}${ancre?' '+ancre:''}"${style?` style="${style}"`:''}>${esc(txt)}</text>`);};
  const Lg=(x1,y1,x2,y2,c,w,plus)=>o.push(`<line x1="${r1(x1)}" y1="${r1(y1)}" x2="${r1(x2)}" y2="${r1(y2)}" stroke="${c}" stroke-width="${w}"${plus?' '+plus:''}/>`);
  const coul=qui=>qui==='Sacha'?th.joueurs:th.machine;
  const marque=(x,y,qui,r)=>{r=r||7;
    if(qui==='Sacha')o.push(`<circle cx="${r1(x)}" cy="${r1(y)}" r="${r}" fill="${coul(qui)}" stroke="${th.fond}" stroke-width="2"/>`);
    else o.push(`<path d="M${r1(x)} ${r1(y-r-1.5)}L${r1(x+r+1.5)} ${r1(y)}L${r1(x)} ${r1(y+r+1.5)}L${r1(x-r-1.5)} ${r1(y)}Z" fill="${th.fond}" stroke="${coul(qui)}" stroke-width="2.4" stroke-linejoin="round"/>`);};

  /* titre, explication, légende des marques */
  const nB=ETAPES.filter(e=>jours(e.jour)>=B.d0).length;
  T(MG,24,`Deux essais lents en deux mois, puis ${['zéro','un','deux','trois','quatre','cinq','six','sept'][nB]} virages en six jours : quatre méthodes et un nouveau but`,'ti');
  const sous=`Chaque marque est un virage du chantier des bots ; sous son nom, ce qui l’a arrêté. L’échelle du temps change : du 20 octobre au 22 novembre, ${TROU} jours sans travail sur les bots, l’axe est coupé (//) et ${CACHE} jours en sont retirés ; à droite, un jour est ${RAPPORT} fois plus large qu’à gauche.`;
  coupe(sous,'t2',W-2*MG).forEach((l,k)=>T(MG,43+k*15,l,'t2'));
  marque(MG+7,yLeg-4,'Sacha',6);T(MG+20,yLeg,'virage venu de Sacha','p');
  const xl=MG+20+largeur('virage venu de Sacha','p')+26;
  marque(xl,yLeg-4,'Claude',6);T(xl+13,yLeg,'virage venu de Claude','p');

  /* l'axe : deux morceaux, la cassure entre eux */
  for(const S of [A,B])Lg(S.x0,yAxe,S.x1,yAxe,th.axe,1.5);
  o.push(`<path d="M${B.x1-1} ${yAxe-4}L${B.x1+5} ${yAxe}L${B.x1-1} ${yAxe+4}" fill="none" stroke="${th.axe}" stroke-width="1.5"/>`);
  const zig=x=>o.push(`<path d="M${r1(x-4)} ${yAxe+8}L${r1(x+4)} ${yAxe-8}" fill="none" stroke="${th.axe}" stroke-width="1.5"/>`);
  zig(A.x1+5);zig(A.x1+11);zig(B.x0-11);zig(B.x0-5);
  const xc=(A.x1+B.x0)/2;
  T(xc,yAxe-3,'axe coupé :','p','m');T(xc,yAxe+10,`${CACHE} jours retirés`,'p','m');
  /* graduations : à gauche une par semaine (depuis le 1er septembre), à droite une par jour */
  for(let d=jours('2026-09-01')-0.5;d<=A.d1+1e-6;d+=7)Lg(xA(d),yAxe,xA(d),yAxe+5,th.axe,1);
  T(xA(jours('2026-09-15')),yAxe+18,'septembre','p','m');T(xA(jours('2026-10-13')),yAxe+18,'octobre','p','m');
  T(A.x0,yAxe+33,'une graduation = une semaine','p');
  for(let d=B.d0;d<=B.d1+1e-6;d+=1)Lg(xB(d),yAxe,xB(d),yAxe+5,th.axe,1);
  for(let k=22;k<=27;k++)T(xB(jours('2026-11-'+k)),yAxe+18,k+(k===22?' nov.':''),'p','m');
  T(B.x0,yAxe+33,'une graduation = un jour','p');

  /* les cartes et leurs traits de rappel */
  for(const c of cartes){
    const hautC=c.haut?yAxe-30-c.h:yBas, basC=hautC+c.h;
    const xt=Math.min(Math.max(c.x,c.g+4),c.g+c.w-4);
    if(c.haut)Lg(c.x,yAxe-9,c.x,basC+6,th.axe,1,'stroke-dasharray="2 3"');
    else Lg(c.x,yAxe+38,c.x,hautC-12,th.axe,1,'stroke-dasharray="2 3"');
    if(Math.abs(xt-c.x)>0.5){const yc=c.haut?basC+6:hautC-12;Lg(c.x,yc,xt,yc,th.axe,1,'stroke-dasharray="2 3"');}
    let y=hautC;
    for(const l of c.L){y+=(l.esp||0)+l.lh;
      const st=l.c==='nm'?`fill:${th.texte}`:null;
      T(c.g,y-3,l.t,l.c,null,st);}
    marque(c.x,yAxe,c.e.qui);
    if(c.e.enCours)T(c.x-12,yAxe-12,'en cours','p','e');}

  /* la source */
  const src='sources : ml/ecurie/portfolio/journal/LISEZ-MOI.md § 2 et les chapitres 00_avant-le-22-novembre.md (commits deacc99ad du 7/09, 6f4dbdc29 du 20/10), 2026-11-22_23.md (d2ee1f114), 2026-11-24.md (ef630b812), 2026-11-25.md, 2026-11-25_suite.md, 2026-11-26.md, 2026-11-27.md';
  const Ls=coupe(src,'src',W-2*MG);Ls.forEach((l,k)=>T(MG,H-10-(Ls.length-1-k)*13,l,'src'));

  /* contrôle : aucun texte hors du cadre, aucun chevauchement (le seul texte qui peut toucher une marque est vérifié à part) */
  const err=[];
  for(const b of boites)if(b.x0<MG-0.5||b.x1>W-MG+0.5||b.y0<0||b.y1>H)err.push('hors cadre : '+b.txt);
  for(let i=0;i<boites.length;i++)for(let j=i+1;j<boites.length;j++){const a=boites[i],b=boites[j];
    if(a.x0<b.x1&&b.x0<a.x1&&a.y0<b.y1&&b.y0<a.y1)err.push(`chevauchement : « ${a.txt} » / « ${b.txt} »`);}
  for(const c of cartes)for(const b of boites){const y0=c.haut?yAxe-9:yAxe+38,y1=c.haut?yAxe-30:yAxe+52;  /* le trait de rappel */
    if(b.x0<c.x+1&&c.x-1<b.x1&&b.y0<Math.max(y0,y1)&&Math.min(y0,y1)<b.y1)err.push('trait sur texte : '+b.txt);}
  if(err.length)throw new Error('frise : '+err.join(' ; '));

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc('Frise des changements de méthode du chantier des bots, du 7 septembre au 27 novembre 2026 : deux essais en deux mois, puis cinq virages en six jours, dont un nouveau but')}">
<style>
text{font-family:system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;font-variant-numeric:tabular-nums}
.ti{font-size:15px;font-weight:650;fill:${th.texte}}
.t2{font-size:11.5px;fill:${th.texte2}}
.p{font-size:10.5px;fill:${th.texte2}}
.src{font-size:10px;font-style:italic;fill:${th.texte2}}
.dt{font-size:12px;font-weight:650;fill:${th.texte2}}
.nm{font-size:14px;font-weight:650;fill:${th.texte}}
.qu{font-size:11px;font-style:italic;fill:${th.texte2}}
.rs{font-size:12px;fill:${th.texte}}
.m{text-anchor:middle}.e{text-anchor:end}
</style>
<rect width="${W}" height="${H}" fill="${th.fond}"/>
${o.join('\n')}
</svg>
`;}

for(const th of [THEMES.clair,THEMES.sombre]){
  const f=path.join(IMG,`journal-frise-${th.nom}.svg`);
  fs.writeFileSync(f,dessine(th));
  console.log('écrit : '+path.relative(path.join(ICI,'..','..','..','..'),f));}
console.log(`échelle : ${nf(pxA,2)} px par jour à gauche, ${nf(pxB,1)} à droite (×${RAPPORT}) ; ${TROU} jours entre le 20/10 et le 22/11, dont ${CACHE} retirés par la cassure`);
