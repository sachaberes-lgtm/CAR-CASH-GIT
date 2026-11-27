#!/usr/bin/env node
/* ===== L'IMAGE « APPRENTISSAGES DE ZERO » DU JOURNAL (2026-11-27, Sacha : « il faut qu'on garde des traces de tous les process, pour un portfolio ») =====
   Node pur, sans dependance. Une commande :
     node ml/ecurie/portfolio/figures-journal/apprentissages-de-zero.js
   ecrit ml/ecurie/portfolio/images/journal-apprentissages-de-zero-clair.svg et -sombre.svg (memes formes, deux palettes : celles de figures.js).

   CE QUE L'IMAGE DIT (chapitre 00_avant-le-22-novembre.md) : partie de zero, la selection apprend a rouler plus loin, presque jamais
   a faire des figures (le vol n'est pas trace ici).

   LES DONNEES LUES
     a gauche  ml/train/results/runs/run-seed1000.json et run-seed1101.json : le champ « courbe », la meilleure distance (m) parcourue
               dans chaque generation (ml/train/sim-train.js, « genMaxTotD », une valeur poussee a chaque nouvelle generation :
               299 valeurs pour 300 generations). Ces deux fichiers sont le run de 300 generations du 20/10 (dates 13:12 et 13:23 UTC
               dans les fichiers ; derniere ecriture : commit 5799d5bb1, « record 11746, toujours 0 figure »).
     a droite  ml/reel/results/pop-reel-g1.json : le champ « hist », la meilleure distance (m) de chaque generation, en 40 s de jeu
               (ml/reel/entrainer.js, « hist.push(Math.round(best)) », generations 0 a 56) ; ml/reel/results/champion-reel-g1.json
               donne le record (generation 43, 3 616 m), recoupe ici avec « hist ».
     annotations  commit 5799d5bb1 : le cerveau champion du run de 300 generations, rejoue sur 24 bots, « aura totale 0 » (0 figure) ;
                  commit 6f4dbdc29 : le champion de ml/reel sur 6 pistes jamais vues, « 0,2 figure par partie ».
               Les deux phrases sont recopiees dans le script (FIGURES_TXT) : elles viennent des messages de commit, pas d'un fichier de donnees.

   LES FICHIERS ECARTES, ET POURQUOI (pour ne pas melanger deux grandeurs ou deux jeux differents sur un meme axe)
     run-seed1202, 1303, 1404, 1505, 1606 (19/09, 50 generations) : une autre copie du jeu (avant le « drift » porte le 20/10, f1c258f81)
               et 50 generations seulement ; les melanger au run de 300 generations ferait une mediane qui change de population a la 50e.
     run-seed7, 42, 100, 200, 300, 400, 500, 1707, 1808, 1909, 2010, 2111 (10 au 18/09) : manches d'une autre duree (avant la manche
               proportionnelle a la piste, 15dcf1276) ; run-seed42 n'a que 2 valeurs ; run-seed7 plafonne a 23 m de « record » avec une
               courbe de 18 a 22 m (une anomalie que je n'ai pas expliquee).
     run-seed2024 (20/10, 7cfdb6ec9) : le mode « freestyle », note sur les figures seules, pas sur la distance : une autre grandeur.
     run-seed1101-sync (20/10, 7029ca1ed) : entraine APRES la remise a niveau de la physique (71bac35b6) : un autre jeu que le run de 300.
     Les fichiers multi-*.json : des totaux par run, sans courbe par generation.

   LE TRAIT FORT A GAUCHE : la mediane des deux essais sur une fenetre glissante de 21 generations (42 valeurs ; moins aux deux bouts).
   La meilleure distance d'une generation saute beaucoup d'une generation a l'autre (piste neuve) : la mediane glissante montre la tendance.

   CONTROLE (2026-11-27, agent controleur) : chaque point recompte dans sa source (299 + 299 valeurs de « courbe », 57 de « hist »,
   mediane debut 1 110,5 m, fin 8 513,5 m, record 3 616 m generation 43 = champion-reel-g1.json) ; les deux fichiers de ml/train sont
   identiques a leur version du commit 5799d5bb1. Corrige : (1) le titre ne dit plus « presque jamais a voler » : l'image ne trace
   aucune donnee de vol, et ce run compte 55 013 decollages et 39 % de poses (multi-2026-10-20T13-23-01-740Z.json) ; il dit ce que
   l'image montre (la distance) et ce que les annotations chiffrent (les figures). (2) « les figures n'apparaissent pas » devient
   « presque jamais » : le run de 200 generations du meme jour (poids 1,2, commit 03b5da4a6) avait 1 voiture sur 24 qui reussissait
   une figure, et ml/reel en fait 0,2 par partie ; l'annotation de gauche le dit. (3) la source disait « deux grandeurs » : c'est la
   meme mesure (meilleure distance d'une generation) dans deux conditions de manche differentes ; elle le dit maintenant.

   LES ETIQUETTES : chacune a une boite estimee (largeur par caractere, comme figures.js). Le script refuse d'ecrire (exit 1) si une
   etiquette sort du cadre, en chevauche une autre, ou est traversee par un trait de donnees. */
const fs=require('fs'),path=require('path');
const ICI=__dirname,RACINE=path.join(ICI,'..','..','..','..'),IMG=path.join(ICI,'..','images');
const {verifierSvg,THEMES}=require(path.join(ICI,'..','figures.js'));
const NOM='apprentissages-de-zero';

/* ---------------- les donnees ---------------- */
const lire=f=>JSON.parse(fs.readFileSync(path.join(RACINE,f),'utf8'));
const F_A='ml/train/results/runs/run-seed1000.json',F_B='ml/train/results/runs/run-seed1101.json';
const F_R='ml/reel/results/pop-reel-g1.json',F_C='ml/reel/results/champion-reel-g1.json';
const RA=lire(F_A),RB=lire(F_B),POP=lire(F_R),CH=lire(F_C);
if(RA.gens!==300||RB.gens!==300)throw new Error('les fichiers de ml/train ne sont plus le run de 300 generations');
if(POP.hist.length!==57)throw new Error('pop-reel-g1.json : '+POP.hist.length+' valeurs au lieu de 57');
if(Math.round(CH.dist)!==POP.hist[CH.gen])throw new Error('le champion ne recoupe pas « hist »');
/* ml/train : courbe[i] = la generation i+1 ; ml/reel : hist[g] = la generation g */
const SA=RA.courbe.map((d,i)=>[i+1,d/1000]),SB=RB.courbe.map((d,i)=>[i+1,d/1000]);
const SR=POP.hist.map((d,g)=>[g,d/1000]);
const med=a=>{const s=a.slice().sort((x,y)=>x-y),n=s.length;return n%2?s[(n-1)/2]:(s[n/2-1]+s[n/2])/2;};
const FEN=10; /* demi-fenetre : 21 generations */
const SM=SA.map((p,i)=>{const v=[];for(let j=Math.max(0,i-FEN);j<=Math.min(SA.length-1,i+FEN);j++)v.push(SA[j][1],SB[j][1]);return [p[0],med(v)];});
const debutM=med(SA.slice(0,5).concat(SB.slice(0,5)).map(p=>p[1]));         /* les 5 premieres generations, deux essais */
const finM=med(SA.slice(-100).concat(SB.slice(-100)).map(p=>p[1]));          /* les 100 dernieres */
const recR=POP.hist.reduce((b,d,g)=>d>POP.hist[b]?g:b,0);
const FIGURES_TXT={
  train:['0 figure','La note les récompensait un peu ; pourtant le meilleur','cerveau des 300 générations, rejoué sur 24 voitures,','n’en fait aucune. (Un essai voisin du même jour :','1 voiture sur 24 en avait réussi une.)'],
  reel:['0,2 figure par partie','Le champion, sur 6 pistes jamais vues.']};

/* ---------------- les nombres a la francaise ---------------- */
const NB=' ';
function nf(x,k){k=k||0;let s=Math.abs(x).toFixed(k);let [e,d]=s.split('.');if(e.length>3)e=e.replace(/\B(?=(\d{3})+(?!\d))/g,NB);return (x<0?'−':'')+e+(d?','+d:'');}
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const r1=x=>Math.round(x*10)/10;

/* ---------------- la largeur estimee d'un texte (les memes px par caractere que figures.js) ---------------- */
const LARG={ti:8.4,t:6.5,tb:7,t2:6.2,p:5.7,pt:5.7,src:5.4};
const TAILLE={ti:15,t:12,tb:12,t2:11.5,p:10.5,pt:10.5,src:10};
const cl0=c=>String(c).split(' ')[0];
const largeur=(txt,cls)=>String(txt).length*(LARG[cl0(cls)]||6.4);

/* ---------------- la figure ---------------- */
function figure(th){
  const W=960,H=500,o=[],boites=[],traits=[];
  const add=s=>o.push(s);
  /* un texte, et sa boite (pour le controle des chevauchements) ; garde=false : hors controle (titres d'axe) */
  const T=(x,y,txt,cls,plus,garde)=>{const w=largeur(txt,cls),h=TAILLE[cl0(cls)]||11,an=/\be\b/.test(cls)?'e':/\bm\b/.test(cls)?'m':'s';
    const gx=an==='e'?x-w:an==='m'?x-w/2:x;if(garde!==false)boites.push({x0:gx,x1:gx+w,y0:y-h*.8,y1:y+h*.25,txt:txt});
    add(`<text x="${r1(x)}" y="${r1(y)}" class="${cls}"${plus?' '+plus:''}>${esc(txt)}</text>`);};
  const L=(x1,y1,x2,y2,c,w,plus)=>add(`<line x1="${r1(x1)}" y1="${r1(y1)}" x2="${r1(x2)}" y2="${r1(y2)}" stroke="${c}" stroke-width="${w||1}"${plus?' '+plus:''}/>`);
  const P=(pts,c,w,plus,donnee)=>{if(donnee)traits.push(pts);add(`<path d="${pts.map((p,i)=>(i?'L':'M')+r1(p[0])+' '+r1(p[1])).join('')}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"${plus?' '+plus:''}/>`);};
  const coupe=(txt,cls,w)=>{const m=String(txt).split(' '),out=[];let cur='';for(const x of m){const e=cur?cur+' '+x:x;if(cur&&largeur(e,cls)>w){out.push(cur);cur=x;}else cur=e;}if(cur)out.push(cur);return out;};
  const ech=(d0,d1,a,b)=>{const f=v=>a+(v-d0)/(d1-d0)*(b-a);f.r=[a,b];return f;};

  /* --- l'en-tete --- */
  T(16,26,'Partie de zéro, la sélection apprend à rouler plus loin, mais presque jamais à faire des figures','ti');
  const sous=coupe('À chaque génération, les voitures qui vont le moins loin sont remplacées par des enfants des meilleures, modifiés au hasard. La distance monte, puis plafonne. Les figures, elles, n’apparaissent presque jamais.','t2',W-32);
  sous.forEach((l,i)=>T(16,46+i*15,l,'t2'));
  const yTitres=46+sous.length*15+20;

  /* --- un panneau : axes, grille, titre --- */
  const panneau=(x0,x1,y0,y1,sx,sy,tx,ty,titre,lignes)=>{
    T(x0-44,yTitres,titre,'tb');
    lignes.forEach((l,i)=>T(x0-44,yTitres+15+i*14,l,'p'));
    for(const v of ty){const y=sy(v);L(x0,y,x1,y,th.grille,1);L(x0-4,y,x0,y,th.axe,1);T(x0-7,y+3.5,nf(v),'p e');}
    for(const v of tx){const x=sx(v);L(x,y1,x,y1+4,th.axe,1);T(x,y1+16,nf(v),'p m');}
    L(x0,y1,x1,y1,th.axe,1);L(x0,sy(ty[ty.length-1]),x0,y1,th.axe,1);
    T((x0+x1)/2,y1+32,'génération','t2 m');
    add(`<text x="0" y="0" class="t2 m" transform="translate(${r1(x0-30)} ${r1((y0+y1)/2)}) rotate(-90)">meilleure distance de la génération (km)</text>`);};

  const y0=yTitres+62,y1=H-92;
  /* --- a gauche : ml/train --- */
  const ax0=72,ax1=520;
  const sx=ech(0,300,ax0,ax1),sy=ech(0,16,y1,y0);
  panneau(ax0,ax1,y0,y1,sx,sy,[0,50,100,150,200,250,300],[0,2,4,6,8,10,12],
    'Dans une copie du jeu (ml/train)',
    ['300 générations de 24 voitures, 20 octobre','traits fins : deux essais, génération par génération (plein et tirets)','trait fort : leur médiane sur 21 générations']);
  P(SA.map(p=>[sx(p[0]),sy(p[1])]),th.texte2,1,'stroke-opacity="0.55"',true);
  P(SB.map(p=>[sx(p[0]),sy(p[1])]),th.texte2,1,'stroke-opacity="0.55" stroke-dasharray="3 2"',true);
  P(SM.map(p=>[sx(p[0]),sy(p[1])]),th.fond,5.5,'',false);
  P(SM.map(p=>[sx(p[0]),sy(p[1])]),th.machine,2.6,'',true);
  /* les valeurs du debut et de la fin, posees au bout du trait fort */
  T(sx(62),sy(0.75),`${nf(debutM,1)} km au départ`,'pt hf');
  L(sx(SM[0][0])+2,sy(SM[0][1])+3,sx(60),sy(0.75)-4,th.texte2,1);
  T(ax1+5,sy(finM)+4,`${nf(finM,1)} km`,'tb hf');
  T(ax1+5,sy(finM)+17,'à la fin','p hf');
  /* l'annotation des figures, dans la bande vide du haut */
  {const x=sx(120),y=sy(15.9);T(x,y,FIGURES_TXT.train[0],'tb hf');FIGURES_TXT.train.slice(1).forEach((l,i)=>T(x,y+14+i*13,l,'pt hf'));}

  /* --- a droite : ml/reel --- */
  const bx0=650,bx1=896;
  const rx=ech(0,56,bx0,bx1),ry=ech(0,5,y1,y0);
  panneau(bx0,bx1,y0,y1,rx,ry,[0,10,20,30,40,50],[0,1,2,3,4,5],
    'Dans le vrai jeu (ml/reel)',
    ['57 générations de 20 voitures, 40 s par partie, 20 octobre','un seul essai : un point par génération']);
  P(SR.map(p=>[rx(p[0]),ry(p[1])]),th.fond,5.5,'',false);
  P(SR.map(p=>[rx(p[0]),ry(p[1])]),th.machine,2.2,'',true);
  for(const p of SR)add(`<circle cx="${r1(rx(p[0]))}" cy="${r1(ry(p[1]))}" r="2" fill="${th.machine}"/>`);
  {const p=SR[0];T(rx(p[0])+4,ry(0.4),`${nf(p[1],1)} km au départ`,'pt hf');L(rx(p[0])+1,ry(p[1])+4,rx(p[0])+6,ry(0.4)-10,th.texte2,1);}
  {const p=SR[recR];add(`<circle cx="${r1(rx(p[0]))}" cy="${r1(ry(p[1]))}" r="5.5" fill="none" stroke="${th.texte}" stroke-width="1.5"/>`);
    T(rx(p[0]),ry(p[1])-24,`record : ${nf(p[1],1)} km`,'tb m hf');T(rx(p[0]),ry(p[1])-11,`génération ${p[0]}`,'p m hf');}
  {const x=rx(17),y=ry(1.55);T(x,y,FIGURES_TXT.reel[0],'tb hf');FIGURES_TXT.reel.slice(1).forEach((l,i)=>T(x,y+14+i*13,l,'pt hf'));}

  /* --- la source --- */
  const src=coupe('sources : ml/train/results/runs/run-seed1000.json et run-seed1101.json (champ « courbe », run de 300 générations, commit 5799d5bb1, qui compte aussi les figures ; l’essai voisin : commit 03b5da4a6) · ml/reel/results/pop-reel-g1.json (champ « hist ») et champion-reel-g1.json (le record), commit 6f4dbdc29 (les figures sur pistes neuves) · la même mesure dans deux conditions différentes (manche à la longueur de la piste dans la copie, 40 s dans le vrai jeu) : deux échelles, à ne pas comparer d’un panneau à l’autre','src',W-32);
  src.forEach((l,i)=>T(16,H-10-(src.length-1-i)*13,l,'src'));

  /* --- le controle des etiquettes --- */
  const pb=[];
  for(const b of boites){if(b.x0<2||b.x1>W-2||b.y0<2||b.y1>H-2)pb.push('hors cadre : '+b.txt);}
  for(let i=0;i<boites.length;i++)for(let j=i+1;j<boites.length;j++){const a=boites[i],b=boites[j];
    if(a.x0<b.x1&&b.x0<a.x1&&a.y0<b.y1&&b.y0<a.y1)pb.push(`« ${a.txt} » chevauche « ${b.txt} »`);}
  const coupeRect=(p,q,b)=>{/* le segment pq touche-t-il la boite ? (echantillonne a 1 px) */
    const n=Math.max(1,Math.ceil(Math.hypot(q[0]-p[0],q[1]-p[1])));for(let k=0;k<=n;k++){const x=p[0]+(q[0]-p[0])*k/n,y=p[1]+(q[1]-p[1])*k/n;
      if(x>=b.x0-1&&x<=b.x1+1&&y>=b.y0-1&&y<=b.y1+1)return true;}return false;};
  for(const b of boites)for(const t of traits)for(let k=1;k<t.length;k++)if(coupeRect(t[k-1],t[k],b)){pb.push(`un trait traverse « ${b.txt} »`);break;}
  if(pb.length){console.error('ETIQUETTES A REPLACER ('+th.nom+') :\n  '+[...new Set(pb)].join('\n  '));process.exit(1);}

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc('Deux courbes d’apprentissage de septembre et octobre 2026 : la meilleure distance par génération monte puis plafonne, dans une copie du jeu et dans le vrai jeu ; les figures ne sont presque jamais apprises')}">
<style>
text{font-family:system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;font-variant-numeric:tabular-nums}
.ti{font-size:15px;font-weight:650;fill:${th.texte}}
.t{font-size:12px;fill:${th.texte}}
.tb{font-size:12px;font-weight:650;fill:${th.texte}}
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

/* ---------------- l'ecriture ---------------- */
if(require.main===module){
  fs.mkdirSync(IMG,{recursive:true});
  let mauvais=0;
  for(const th of [THEMES.clair,THEMES.sombre]){
    const f=path.join(IMG,`journal-${NOM}-${th.nom}.svg`);
    fs.writeFileSync(f,figure(th));
    const v=verifierSvg(fs.readFileSync(f,'utf8'));if(!v.ok)mauvais++;
    console.log(`${v.ok?'ok ':'⚠  '} images/journal-${NOM}-${th.nom}.svg · ${(fs.statSync(f).size/1024).toFixed(0)} Ko${v.ok?'':' · '+v.err.join(' ; ')}`);}
  console.log(`points : ml/train ${SA.length} + ${SB.length} (médiane début ${nf(debutM,2)} km, fin ${nf(finM,2)} km) ; ml/reel ${SR.length} (record ${nf(SR[recR][1],3)} km, génération ${recR})`);
  if(mauvais)process.exit(1);
}
