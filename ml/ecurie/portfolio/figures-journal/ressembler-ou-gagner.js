#!/usr/bin/env node
/* ===== RESSEMBLER OU GAGNER : LE CHEMIN DU PILOTE, VERSION APRES VERSION (2026-11-27, Sacha : « il faut qu'on garde des traces de tous les process, pour un portfolio ») =====
   Node pur, sans dependance. Ne joue aucune course : il LIT des fichiers du depot (et trois anciennes versions d'un fichier, par « git show »).
     node ml/ecurie/portfolio/figures-journal/ressembler-ou-gagner.js
   ecrit ml/ecurie/portfolio/images/journal-ressembler-ou-gagner-clair.svg et -sombre.svg (memes formes, deux palettes : celles de figures.js).

   UNE IDEE : chaque version du pilote, placee par son ecart aux joueurs (en abscisse) et par son palier median (en ordonnee). Le chemin va
   vers les joueurs (a gauche) et descend : la ressemblance s'est payee en paliers.

   LES POINTS, ET D'OU VIENT CHAQUE VALEUR (toutes : 20 courses de 900 s, regime allege, simulateur relief-canyon, jeu cashcar-v1627 ;
   graines 910000 + 37 k, sauf le point 1 : graines 950000 + 37 k, voir plus bas)
     1. pilote.js (25/11)            LE COUPLE ENTIER vient d'UN lot : ml/labo/tampon/boucle/val-c0010.json (la validation du labo : le meme cerveau,
                                     sha ce942cc3364b, que c0003 ; 20 courses de 900 s, allege, mais graines 950000 + 37 k) : palier median lu dans
                                     sa note, ecart RECALCULE ici sur ses 20 parties par ml/bot/ressemblance.js (ecart(), borne 8 ; aucune course).
                                     CONTROLE DU 27/11 (correction) : la premiere version de ce script prenait l'ecart 3,05 d'ETAPES.md et le palier 11
                                     de c0003 ; or 3,05 a ete calcule sur ml/ecurie/agents/tmp-voltige/note-pilote-v1.json, 12 courses de 600 s (dont le
                                     palier median est 12,5) : deux conditions melangees. Aucun lot de pilote.js sur les graines 910000 en 20 x 900 s
                                     n'a garde ses parties (c0003 n'a que son bilan) : on prend donc le lot de validation, et le point est trace CREUX
                                     (autres graines) ; c0003 donne d'ailleurs le meme palier median, 11.
                                     ml/labo/tampon/ est hors git (.gitignore) : sans ce fichier, le script s'arrete.
     2. pilote qui vole (26/11 a-m)  palier  : git show 63012939f:ml/bot/results/note-pilote-voltige-allege.json (note.palier_median)
                                     ecart   : ml/ecurie/ETAPES.md, meme phrase (« le pilote de l'apres-midi **2,54** ») ; la note de 63012939f
                                               n'a pas de champ ecart_joueurs (ressemblance.js est venu apres, 8d7edc258). Recontrole le 27/11 :
                                               ml/ecurie/agents/tmp-voltige/note-voltige-t900.json (hors git) porte les MEMES 20 paliers que la note
                                               de 63012939f et ses parties donnent 2,535 : si ce fichier est la, le script refait le calcul et compare
     3. sorti du dessous (26/11 soir)  git show c72d25ecf:...note-pilote-voltige-allege.json (palier_median, ecart_joueurs)
     4. loi de vol corrigee (26/11 fin de soiree)  git show 830cdf573:... (idem)
     5. nitro au sol (27/11, 0 h 58)   git show 1ee936e15:... (idem ; c'est aussi la version sur le disque)
   LES REPERES (traces a part, pas relies au chemin)
     - les joueurs au clavier : palier median de leurs 10 parties (ml/bot/results/etalon-sacha.json, barre.palier_median ; ce sont les 10 parties
       « clavier » de ml/bot/etalon/, celles auxquelles ressemblance.js compare les bots ; les 4 de Leo sont au doigt). Leur ECART est 0 PAR
       DEFINITION : l'ecart d'un lot est sa distance a la moyenne des joueurs, et le lot des joueurs EST cette moyenne. Le carre est donc pose
       a 0. CONTROLE DU 27/11 (correction) : la premiere version le posait a 0,91 ; or 0,91 est l'ecart d'UNE SEULE partie de joueur comparee
       aux autres (la mediane des 8 parties de plus de 60 s, recalculee : 0,39 a 1,15), pas celui d'un lot de parties comme le sont les points
       du pilote (ressemblance.js le dit : « une partie seule s'ecarte plus qu'un lot »). Ce 0,91 est trace a part, en trait vertical : le
       bruit d'une partie a l'autre chez les joueurs. Les joueurs ne sont pas des courses de 900 s du simulateur : de vraies parties, en
       version allegee (ml/bot/README.md), dont la plus longue dure 545 s (la limite de 900 s n'aurait rien coupe).
     - la variante « nitro presque partout + gardee au bord » (27/11, ECARTEE) : ml/ecurie/ETAPES.md, tableau de la nitro au sol ; ecart = la
       moyenne de ses deux lots (1,33 et 1,27), palier median de 24 courses de 300 s (6, contre 7 pour la version gardee dans le meme tableau).
       AUTRES CONDITIONS que le chemin : trace creux et en pointilles, et l'etiquette le dit, avec la version gardee DANS LE MEME ESSAI
       (palier 7, ecart moyen des deux lots 1,66 et 1,71 : 1,69) pour qu'on compare ce qui se compare.
   LES AXES partent de zero (ecart 0 = les joueurs ; palier 0) : la chute de 11 a 7,5 n'est pas grossie par un axe coupe.
   ECARTES (une des deux valeurs manque dans les memes conditions)
     - pilote-voltige.js premier jet (d6014a657, 26/11 14 h 23) : palier median 8,5 sur 12 courses seulement, aucun ecart mesure.
     - le depart et les portails en vol (dd807f338) : 12 courses, palier median 9, pas de grande note ni d'ecart a part
       (ce reglage est donc DEDANS le point 3, avec la sortie du dessous).
     - la grotte rouverte (1eea0a44e) et les autres essais du registre : lots de 12 ou 24 courses de 300 s, pas d'ecart publie.
     - l'ecart borne a 4 (pilote.js 2,67, pilote-voltige 2,33, 8d7edc258) : une autre regle de calcul, remplacee le soir meme.
   Le script s'arrete (sans rien ecrire) si une valeur n'est plus trouvee ou si une note n'a plus les memes conditions. */
const fs=require('fs'),path=require('path'),{execFileSync}=require('child_process');
const ICI=__dirname,RACINE=path.join(ICI,'..','..','..','..'),IMG=path.join(ICI,'..','images');
const NOM='ressembler-ou-gagner';

/* ---------------- lire ---------------- */
const lireTexte=f=>fs.readFileSync(path.join(RACINE,f),'utf8');
const lireJson=f=>JSON.parse(lireTexte(f));
const gitShow=(h,f)=>JSON.parse(execFileSync('git',['show',h+':'+f],{cwd:RACINE,encoding:'utf8',maxBuffer:64<<20}));
const stop=m=>{console.error('ARRET : '+m);process.exit(1);};
const nombreFr=s=>parseFloat(String(s).replace(',','.'));

const NOTE='ml/bot/results/note-pilote-voltige-allege.json';
const CONDITIONS={n:20,depart:910000,pas:37,tmax:900,regime:'allege'};
function verifieConditions(qui,o){
  const g=o.graines||{};
  if(g.n!==CONDITIONS.n||g.depart!==CONDITIONS.depart||g.pas!==CONDITIONS.pas||o.tmax!==CONDITIONS.tmax||o.regime!==CONDITIONS.regime)
    stop(qui+' : conditions differentes ('+JSON.stringify({graines:g,tmax:o.tmax,regime:o.regime})+')');
  if(!o.note||o.note.parties!==20)stop(qui+' : pas 20 parties');
}

const ETAPES=lireTexte('ml/ecurie/ETAPES.md');
/* la phrase de la borne 8 : « À 8 : `pilote.js` **3,05**, le pilote de l'après-midi **2,54**, celui du soir **2,02**, une partie de joueur contre les autres 0,91 » */
const mB=ETAPES.match(/À 8 : `pilote\.js` \*\*(\d,\d+)\*\*,\s*le pilote de l'après-midi \*\*(\d,\d+)\*\*, celui du soir \*\*(\d,\d+)\*\*, une partie de joueur contre les autres (\d,\d+)/);
if(!mB)stop('phrase « À 8 : pilote.js … » introuvable dans ETAPES.md');
const ecartPilote=nombreFr(mB[1]),ecartApresMidi=nombreFr(mB[2]),ecartSoirEtapes=nombreFr(mB[3]),ecartJoueur=nombreFr(mB[4]);
/* la variante ecartee : « | nitro presque partout + gardée au bord | 57 % | 147 · 6 | **1,33 · 1,27** | **−1,8** | » et la version gardee du meme tableau */
const mV=ETAPES.match(/\| nitro presque partout \+ gardée au bord \| (\d+) % \| (\d+) · (\d+) \| \*\*(\d,\d+) · (\d,\d+)\*\*/);
if(!mV)stop('ligne « nitro presque partout + gardée au bord » introuvable dans ETAPES.md');
const mG=ETAPES.match(/— gardé\*\* \| \*\*(\d+) %\*\* \| \*\*(\d+) · (\d+)\*\* \| \*\*(\d,\d+) · (\d,\d+)\*\*/);
if(!mG)stop('ligne de la version gardee (tableau de la nitro) introuvable dans ETAPES.md');
const variante={ecart:(nombreFr(mV[4])+nombreFr(mV[5]))/2,lots:[mV[4],mV[5]],palier:+mV[3],somme:+mV[2],
  palierGarde:+mG[3],sommeGarde:+mG[2],ecartGarde:(nombreFr(mG[4])+nombreFr(mG[5]))/2};

/* l'ecart d'un lot de parties, par ml/bot/ressemblance.js (lecture seule : aucune course) */
const RESS=require(path.join(RACINE,'ml','bot','ressemblance.js')),{partiesDe}=require(path.join(RACINE,'ml','bot','mesures.js'));
function ecartDe(o,qui){const P=o.parties?o.parties.map(p=>p.partie||p):partiesDe(o);
  if(!P.length||!P[0].ev)stop(qui+' : pas de parties pour recalculer l\'ecart');
  const E=RESS.ecart(P,{humains:'clavier'});if(!E)stop(qui+' : ecart incalculable');return E;}

/* point 1 : pilote.js, son lot de validation (20 x 900 s, allege, graines 950000) ; c0003 sert de controle (meme cerveau, meme palier) */
const c3=lireTexte('ml/labo/journal/cerveaux.jsonl').split('\n').filter(x=>x.trim()).map(x=>JSON.parse(x)).find(c=>c.id==='c0003');
if(!c3)stop('c0003 introuvable');
verifieConditions('c0003',{graines:c3.graines,tmax:c3.tmax,regime:c3.jeu&&c3.jeu.regime,note:c3.note});
const VAL='ml/labo/tampon/boucle/val-c0010.json';
if(!fs.existsSync(path.join(RACINE,VAL)))stop(VAL+' absent (hors git) : le point 1 ne peut pas etre refait');
const v1=lireJson(VAL);
{ const g=v1.graines||{};
  if(g.n!==20||g.depart!==950000||g.pas!==37||v1.tmax!==900||v1.regime!=='allege'||v1.simulateur!=='relief-canyon'||v1.note.parties!==20)
    stop(VAL+' : conditions differentes de celles attendues');
  if(v1.sha_cerveau!==c3.sha)stop(VAL+' : pas le meme cerveau que c0003 (pilote.js)'); }
const e1=ecartDe(v1,VAL);
/* point 2 : la note de l'apres-midi */
const n2=gitShow('63012939f',NOTE);verifieConditions('63012939f',n2);
if(n2.ecart_joueurs!=null)stop('63012939f porte un ecart : le script le suppose absent, a relire');
{ const f='ml/ecurie/agents/tmp-voltige/note-voltige-t900.json';
  if(fs.existsSync(path.join(RACINE,f))){const o=lireJson(f);
    if(String(o.note.paliers)!==String(n2.note.paliers))stop(f+' : pas les memes paliers que la note de 63012939f');
    const e=ecartDe(o,f).ecart;if(Math.abs(e-ecartApresMidi)>.006)stop(f+' : ecart recalcule '+e+' contre '+ecartApresMidi+' dans ETAPES.md');
    console.log('point 2 : ecart recalcule sur les parties',e,'(ETAPES.md :',ecartApresMidi+')');} }
/* points 3 a 5 */
const N=['c72d25ecf','830cdf573','1ee936e15'].map(h=>{const o=gitShow(h,NOTE);verifieConditions(h,o);
  if(typeof o.ecart_joueurs!=='number')stop(h+' : pas d\'ecart_joueurs');return o;});
if(Math.abs(N[0].ecart_joueurs-ecartSoirEtapes)>.006)stop('ETAPES.md et c72d25ecf ne disent pas le meme ecart');
/* les joueurs au clavier */
const etS=lireJson('ml/bot/results/etalon-sacha.json');
const joueurs={ecart:0,bruit:ecartJoueur,palier:etS.barre.palier_median,parties:etS.barre.parties};
if(c3.note.palier_median!==v1.note.palier_median)console.log('NB : c0003 donne le palier',c3.note.palier_median,'et la validation',v1.note.palier_median);

const CHEMIN=[
  {n:1,nom:'pilote au sol',quand:'25/11, autres courses',ecart:e1.ecart,palier:v1.note.palier_median,src:'val-c0010 (recalcule)',creux:true},
  {n:2,nom:'apprend à voler',quand:'26/11, après-midi',ecart:ecartApresMidi,palier:n2.note.palier_median,src:'63012939f · ETAPES.md'},
  {n:3,nom:'sort du dessous',quand:'26/11, soir',ecart:N[0].ecart_joueurs,palier:N[0].note.palier_median,src:'c72d25ecf'},
  {n:4,nom:'vol mieux visé',quand:'26/11, fin de soirée',ecart:N[1].ecart_joueurs,palier:N[1].note.palier_median,src:'830cdf573'},
  {n:5,nom:'plus de nitro',quand:'27/11, nuit',ecart:N[2].ecart_joueurs,palier:N[2].note.palier_median,src:'1ee936e15'}];

/* ---------------- les nombres a la francaise ---------------- */
function nf(x,k){if(x==null||!isFinite(x))return '–';const s=Math.abs(x).toFixed(k||0).replace('.',',');return (x<0?'−':'')+s;}
const nfp=x=>nf(x,Number.isInteger(x)?0:1);          /* un palier : 11, 9,5 */
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const r1=x=>Math.round(x*10)/10;

/* ---------------- les deux palettes : celles de figures.js (THEMES) ---------------- */
const THEMES={
  sombre:{nom:'sombre',fond:'#0f1115',panneau:'#151820',texte:'#e8e6e1',texte2:'#9da2ab',grille:'#22262e',axe:'#5a606a',pilote:'#e0b04a',joueurs:'#4cc38a',mort:'#f07167'},
  clair:{nom:'clair',fond:'#ffffff',panneau:'#f6f5f1',texte:'#1c1c21',texte2:'#5b5b66',grille:'#e9e6df',axe:'#8d8a83',pilote:'#9a6a00',joueurs:'#1f7a4d',mort:'#b3261e'}};

/* ---------------- la largeur d'un texte, estimee (px par caractere, system-ui ; mesures de figures.js, un peu larges) ---------------- */
const LARG={ti:9.0,t:6.9,tb:7.4,t2:6.1,p:5.9,src:5.5,n:7};
const largeur=(txt,cls)=>String(txt).length*(LARG[cls]||6.6);
const HAUT={ti:15,t:12.5,tb:12.5,t2:11.5,p:10.5,src:10};
function coupe(txt,cls,w){const mots=String(txt).split(' '),L=[];let cur='';
  for(const m of mots){const e=cur?cur+' '+m:m;if(cur&&largeur(e,cls)>w){L.push(cur);cur=m;}else cur=e;}if(cur)L.push(cur);return L;}

/* ---------------- la mise en page ---------------- */
const W=960,G=86,D=900;               /* bords du trace (D en retrait : la place de l'etiquette du point 1, a droite) */
const HT=108,BAS=530;                 /* haut et bas du trace (le titre et le sous-titre au-dessus) */
const H=BAS+92;
const sx=v=>G+v/3.5*(D-G);                    /* ecart : de 0 a 3,5 (0 = les joueurs) */
const sy=v=>BAS-v/12*(BAS-HT);                 /* palier : de 0 a 12 (axe entier, pas coupe) */

/* les boites deja prises (pour poser les etiquettes sans chevauchement) */
function chevauche(a,b){return a.x0<b.x1&&a.x1>b.x0&&a.y0<b.y1&&a.y1>b.y0;}
function boiteSegment(x1,y1,x2,y2,pas){const B=[];const n=Math.ceil(Math.hypot(x2-x1,y2-y1)/(pas||6));
  for(let i=0;i<=n;i++){const x=x1+(x2-x1)*i/n,y=y1+(y2-y1)*i/n;B.push({x0:x-2,x1:x+2,y0:y-2,y1:y+2});}return B;}

function dessine(th){
  const o=[],defs=[];
  const T=(x,y,txt,cls,plus)=>o.push(`<text x="${r1(x)}" y="${r1(y)}" class="${cls}"${plus?' '+plus:''}>${esc(txt)}</text>`);
  const Lg=(x1,y1,x2,y2,c,w,plus)=>o.push(`<line x1="${r1(x1)}" y1="${r1(y1)}" x2="${r1(x2)}" y2="${r1(y2)}" stroke="${c}" stroke-width="${w}"${plus?' '+plus:''}/>`);
  const pris=[];

  /* le titre : la conclusion ; le sous-titre : de quoi il s'agit */
  const titre='En se rapprochant des joueurs, le pilote a perdu des paliers : 11 au départ, '+nfp(CHEMIN[4].palier)+' à la fin';
  T(16,26,titre,'ti');
  const sous='Cinq versions du pilote (25 au 27/11), chacune notée sur 20 courses de 900 s, dans la version allégée du jeu (celle des joueurs) ; '+
    'les versions 2 à 5 sur les mêmes courses, la 1 (cercle creux) sur 20 autres courses. L’écart aux joueurs dit combien le bot joue autrement qu’eux sur quinze gestes '+
    '(nitro, vols, raccourcis, figures, poses…) : 0 = en moyenne comme eux.';
  coupe(sous,'t2',W-32).forEach((l,i)=>T(16,46+i*16,l,'t2'));

  /* la grille et les axes */
  for(let v=0;v<=3.5+1e-9;v+=.5){const x=sx(v);if(v>0)Lg(x,HT,x,BAS,th.grille,1);Lg(x,BAS,x,BAS+4,th.axe,1);T(x,BAS+17,v?nf(v,1):'0','p m');}
  for(let v=0;v<=12;v+=2){const y=sy(v);if(v>0)Lg(G,y,D,y,th.grille,1);Lg(G-4,y,G,y,th.axe,1);T(G-8,y+3.5,nf(v),'p e');}
  Lg(G,BAS,D,BAS,th.axe,1);Lg(G,HT,G,BAS,th.axe,1);
  T((G+D)/2,BAS+36,'écart aux joueurs (1 = la différence habituelle entre deux parties de joueur, geste par geste)','t2 m');
  T(G,BAS+36,'← plus ressemblant','p');
  T(D,BAS+36,'moins ressemblant →','p e');
  o.push(`<text transform="translate(26 ${r1((HT+BAS)/2)}) rotate(-90)" class="t2 m">palier médian atteint (niveau de la course)</text>`);
  T(G+6,HT+14,'↑ va plus loin','p');
  pris.push({x0:G,x1:G+90,y0:HT,y1:HT+18});
  pris.push({x0:G,x1:D,y0:BAS-2,y1:H});

  /* le repere des joueurs : un carre a l'ecart 0 (par definition), une ligne pointillee a leur palier, et le trait vertical du bruit d'une partie */
  const jx=sx(joueurs.ecart),jy=sy(joueurs.palier),bx=sx(joueurs.bruit);
  Lg(jx,jy,D,jy,th.joueurs,1,'stroke-dasharray="2 3"'); /* les etiquettes peuvent croiser ce pointille (texte detoure) */
  Lg(bx,HT+22,bx,BAS,th.texte2,1,'stroke-dasharray="1 3"');pris.push(...boiteSegment(bx,HT+22,bx,BAS));
  { const L=[['une seule partie de joueur, comparée','p'],['aux autres : écart '+nf(joueurs.bruit,2)+' en médiane','p']];
    L.forEach((l,i)=>T(bx+5,HT+30+i*13,l[0],l[1]+' hf'));pris.push({x0:bx+3,x1:bx+7+Math.max(...L.map(l=>largeur(l[0],l[1]))),y0:HT+18,y1:HT+46}); }
  o.push(`<rect x="${r1(jx-6)}" y="${r1(jy-6)}" width="12" height="12" fill="${th.joueurs}" stroke="${th.fond}" stroke-width="2"/>`);
  pris.push({x0:jx-8,x1:jx+8,y0:jy-8,y1:jy+8});
  const ej=[['les joueurs : le but','tb'],['écart 0 (c’est à eux qu’on compare)','p'],['palier '+nfp(joueurs.palier)+' (10 parties de Sacha)','p']];
  { const x=jx+12,y=jy+24; ej.forEach((e,i)=>T(x,y+i*14,e[0],e[1]+' hf'));
    pris.push({x0:x,x1:x+Math.max(...ej.map(e=>largeur(e[0],e[1]))),y0:y-12,y1:y+2*14+3}); }

  /* le chemin : des fleches d'une version a la suivante */
  defs.push(`<marker id="fl-${th.nom}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="${th.pilote}"/></marker>`);
  const P=CHEMIN.map(p=>({...p,x:sx(p.ecart),y:sy(p.palier)}));
  const R=11;
  for(let i=0;i+1<P.length;i++){const a=P[i],b=P[i+1],d=Math.hypot(b.x-a.x,b.y-a.y),ux=(b.x-a.x)/d,uy=(b.y-a.y)/d;
    const x1=a.x+ux*(R+3),y1=a.y+uy*(R+3),x2=b.x-ux*(R+4),y2=b.y-uy*(R+4);
    Lg(x1,y1,x2,y2,th.pilote,2,`marker-end="url(#fl-${th.nom})"`+(a.creux?' stroke-dasharray="5 3"':''));pris.push(...boiteSegment(x1,y1,x2,y2));}

  /* la variante ecartee : losange creux, pointilles depuis la version 5 */
  const vx=sx(variante.ecart),vy=sy(variante.palier),p5=P[4];
  { const d=Math.hypot(vx-p5.x,vy-p5.y),ux=(vx-p5.x)/d,uy=(vy-p5.y)/d;
    const x1=p5.x+ux*(R+3),y1=p5.y+uy*(R+3),x2=vx-ux*11,y2=vy-uy*11;
    Lg(x1,y1,x2,y2,th.texte2,1.5,'stroke-dasharray="4 4"');pris.push(...boiteSegment(x1,y1,x2,y2)); }
  o.push(`<path d="M${r1(vx)} ${r1(vy-9)}L${r1(vx+9)} ${r1(vy)}L${r1(vx)} ${r1(vy+9)}L${r1(vx-9)} ${r1(vy)}Z" fill="${th.fond}" stroke="${th.texte2}" stroke-width="2"/>`);
  pris.push({x0:vx-10,x1:vx+10,y0:vy-10,y1:vy+10});

  /* les points du chemin : un disque numerote */
  for(const p of P){pris.push({x0:p.x-R-2,x1:p.x+R+2,y0:p.y-R-2,y1:p.y+R+2});}
  for(const p of P){
    if(p.creux)o.push(`<circle cx="${r1(p.x)}" cy="${r1(p.y)}" r="${R-1}" fill="${th.fond}" stroke="${th.pilote}" stroke-width="2.2"/>`);
    else o.push(`<circle cx="${r1(p.x)}" cy="${r1(p.y)}" r="${R}" fill="${th.pilote}" stroke="${th.fond}" stroke-width="2"/>`);
    o.push(`<text x="${r1(p.x)}" y="${r1(p.y+4.3)}" class="n m"${p.creux?` style="fill:${th.pilote}"`:''}>${p.n}</text>`);}

  /* les etiquettes : trois lignes, posees a la premiere place libre autour du point */
  function pose(x,y,lignes,rayon,ordre){
    const w=Math.max(...lignes.map(l=>largeur(l[0],l[1]))),h=lignes.length*14;
    const cles=[...ordre,...['d','g','h','b','hd','hg','bd','bg'].filter(k=>!ordre.includes(k))];
    for(const e of [0,6,14,24])for(const k of cles){const r=rayon+e;
      const places={d:[x+r+6,y-h/2+10],g:[x-r-6-w,y-h/2+10],h:[x-w/2,y-r-6-h+10],b:[x-w/2,y+r+16],
        hd:[x+r,y-r-h+8],hg:[x-r-w,y-r-h+8],bd:[x+r,y+r+14],bg:[x-r-w,y+r+14]};
      const [tx,ty]=places[k];const b={x0:tx-2,x1:tx+w+2,y0:ty-12,y1:ty-12+h+2};
      if(b.x0<G+2||b.x1>W-8||b.y0<HT-2||b.y1>BAS-2)continue;
      if(pris.some(q=>chevauche(b,q)))continue;
      pris.push(b);lignes.forEach((l,i)=>T(tx,ty+i*14,l[0],l[1]+' hf'));return true;}
    stop('aucune place libre pour l\'etiquette « '+lignes[0][0]+' » ('+th.nom+')');}
  const ORDRE={1:['bd','b','bg'],2:['bd','d','hd'],3:['d','bd','b'],4:['h','hg','hd'],5:['hg','g','bd','b']};
  for(const p of P)pose(p.x,p.y,[[p.n+'. '+p.nom,'tb'],[p.quand,'p'],['écart '+nf(p.ecart,2)+' · palier '+nfp(p.palier),'p']],R,ORDRE[p.n]);
  pose(vx,vy,[['nitro presque partout (27/11, pas gardée)','tb'],['écart '+nf(variante.ecart,2)+' · palier '+variante.palier+', et bien moins de figures','p'],
    ['mesurée à part, sur 24 courses de 300 s : la version 5','p'],['y faisait écart '+nf(variante.ecartGarde,2)+' · palier '+variante.palierGarde,'p']],10,['b','bd','bg','d','g']);

  /* la source */
  const src='Sources : version 1, ml/labo/tampon/boucle/val-c0010.json (pilote.js, écart recalculé sur ses 20 parties par ml/bot/ressemblance.js) ; '+
    'versions 2 à 5, ml/bot/results/note-pilote-voltige-allege.json aux commits 63012939f, c72d25ecf, 830cdf573, 1ee936e15 ; écart de la version 2, '+
    'bruit d’une partie de joueur et variante : ml/ecurie/ETAPES.md ; joueurs : ml/bot/results/etalon-sacha.json. '+
    'Refait par node ml/ecurie/portfolio/figures-journal/ressembler-ou-gagner.js.';
  const L=coupe(src,'src',W-32);L.forEach((l,i)=>T(16,H-10-(L.length-1-i)*13,l,'src'));

  const aria=titre+'. Écart aux joueurs et palier médian : '+CHEMIN.map(p=>p.n+' '+p.nom+' '+nf(p.ecart,2)+' et '+nfp(p.palier)).join(' ; ')+
    ' ; les joueurs 0 et '+nfp(joueurs.palier)+'.';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(aria)}">
<style>
text{font-family:system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;font-variant-numeric:tabular-nums}
.ti{font-size:16px;font-weight:650;fill:${th.texte}}
.tb{font-size:12.5px;font-weight:650;fill:${th.texte}}
.t2{font-size:11.5px;fill:${th.texte2}}
.p{font-size:10.5px;fill:${th.texte2}}
.n{font-size:12px;font-weight:700;fill:${th.fond}}
.src{font-size:10px;font-style:italic;fill:${th.texte2}}
.m{text-anchor:middle}.e{text-anchor:end}
.hf{paint-order:stroke;stroke:${th.fond};stroke-width:3.5px;stroke-linejoin:round}
</style>
<defs>${defs.join('')}</defs>
<rect width="${W}" height="${H}" fill="${th.fond}"/>
${o.join('\n')}
</svg>
`;}

fs.mkdirSync(IMG,{recursive:true});
for(const k of ['clair','sombre']){const svg=dessine(THEMES[k]);
  if(/NaN|undefined/.test(svg))stop('valeur manquante dans le SVG '+k);
  const f=path.join(IMG,'journal-'+NOM+'-'+k+'.svg');fs.writeFileSync(f,svg);console.log('ecrit',path.relative(RACINE,f));}
console.log('points :');for(const p of CHEMIN)console.log(' ',p.n,p.nom,'ecart',p.ecart,'palier',p.palier,'(',p.src,')');
console.log('  joueurs ecart',joueurs.ecart,'(bruit d\'une partie',joueurs.bruit+')','palier',joueurs.palier,'(',joueurs.parties,'parties) ; variante ecart',variante.ecart,'palier',variante.palier,'(gardee',variante.palierGarde,')');
