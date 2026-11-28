/* ===== LE PILOTE FABRIQUE DE LA SELECTION NATURELLE (2026-11-27, etape 2 — Sacha : « une population de pilotes evolue seule, le moins bon est vire ») =====
   CE FICHIER N'EST PAS UN MODULE NODE : c'est un PILOTE A TROUS, lu comme texte par ml/evolution/genome.js (ecrirePilote) qui remplace la ligne seule
   de la balise du genome par le bloc REGLAGES / G / WV, WS / CONTROLE_RAYONS d'un individu ; le texte obtenu se charge dans le bac (piloter.charger).
   Contrat : ml/evolution/INTERFACES.md § 2.4 et § 5 (il fait foi). C'est ml/ecurie/pilote-voltige.js recopie, plus :
     · les retouches de ml/ecurie/agents/tmp-voltige/faire-pR.js (LA LOI « RETOUR » des yeux), gardees par REGLAGES.retours.length>0 : sans loi
       demandee, le pilote ne met pas « retours » dans ses ordres et joue au bit pres comme pilote-voltige ;
     · les 14 constantes promues de vaut(), raccourci() et enVol(), lues dans G ;
     · LA TETE RAYON (36 entrees -> 6 tanh -> 1, ajoutee aux deux cotes de la comparaison des facons en vol) et LA TETE SOL (12 -> 6 -> 3 : le seuil
       de la nitro, la ligne visee, le gout du raccourci). A la naissance W2 = 0 : chaque sortie vaut 0 et rien ne change ;
     · LE CONTROLE DES RAYONS (amendement 3) : si les yeux changent l'ordre de leurs rayons, le pilote leve « YEUX CHANGES » et le maitre s'arrete.
     · LES CINQ GESTES DES JOUEURS (27/11/2026, tache « gestes » ; PROPOSITIONS.md de l'etude) : les mains lachees avant le contact (R.lacheOn), le
       slalom demande par le pilote (R.slalomOn), le coup de nitro vu en vol (R.coupOn), le relache apres le decollage (R.relacheOn), la ligne qui suit
       la caisse apres la pose (R.suitOn). Chacun est garde par son drapeau : drapeau a 0, son code ne s'execute pas, ses reglages ne sont pas lus,
       et le pilote joue au bit pres comme pilote-voltige. Le detail : ml/evolution/notes/gestes.md.
     · LE PORTAGE DE LA BOUCLE PAYANTE (28/11/2026, tache « portage ») : les quatre blocs de code que la boucle payante a ajoutes a c0025 pour
       faire c0026, c0064, c0072, c0087 et c0101 (ml/labo/cerveaux/), chacun garde par son drapeau : fuir le dessous sans attendre (R.fuirVite,
       c0026), le decollage nitro allumee (R.bordOn, c0064), les figures a marge large (R.largeOn, c0072), la nitro libre dans les virages
       (R.libreOn, c0087). Drapeaux a 0 : pilote-voltige au bit pres ; tous a 1 avec les reglages de c0101 : c0101 au bit pres. Le detail :
       ml/evolution/notes/portage.md.
     · LES GENES V4 (28/11/2026, lot « genes v4 » ; notes/genes-v4.md) : la sortie preparee sur les maps a decor (R.sortieOn), la bascule vers « rien »
       (R.rienOn), la loi fidele jugee puis suivie (R.loiFidele 1 et 2), les secours en vol (R.secoursOn), chacun garde par son interrupteur ; et le
       palier de la seconde chance pris dans REGLAGES.chancePalierMin (PROFIL sous la balise). Tout eteint, chancePalierMin 12 : c0025 au bit pres.
   Seul fichier qu'on retouche a la main quand on ajoute un geste (une nouvelle sortie de tete : W2 a 0 pour rester muette a la naissance).
   Pas de require, Date, Math.random, eval, Function : le bac les refuse. Changer ce fichier change l'epoque des courses (tout est rejoue).
   Ce qui suit est l'en-tete de pilote-voltige.js, tel quel. */
/* ===== LE PREMIER PILOTE DE L'ECURIE (2026-11-25, etape C — Sacha : « des bots du palier 1 au palier 30 qu'on ne distingue pas de vrais joueurs ») =====
   SA STRATEGIE, EN CLAIR.
   Le palier, c'est des pieces, et les pieces, c'est du temps de course : ce pilote cherche d'abord a NE PAS MOURIR, ensuite a ramasser.
   Sa main est un clavier (modele `clavier`) : un ordre met 0,2 s a partir, le volant part par coups a fond de duree tiree au hasard, la main
   voit la route avec 0,15 s de retard. A 400 km/h un coup long (0,3 a 0,45 s, un sur dix) tourne la caisse d'un demi-radian : elle SORT par le
   bord plusieurs fois par minute, quoi que le pilote decide (MESURE sur cinq tours : 1,5 a 3,5 sorties par minute de route). Comme un joueur.
   Il est donc ecrit pour deux choses : sortir moins, et surtout REVENIR.
   1. AU SOL, LA LIGNE. Il vise ce qui se ramasse de LOIN (la ligne parfaite — fruit, plaque, fruit… — qui recharge la nitro, puis les pieces,
      puis les pouvoirs), jamais un objet qui demande un coup de volant a la derniere image ; sa ligne GLISSE vers sa cible, elle n'y saute pas.
   2. LE VIRAGE D'APRES. La loi `ligne` de la main ne connait que le virage sous les roues. Le pilote lit la route devant (`vue.route`) : il se
      place du cote INTERIEUR du virage qui vient dans une seconde (dans un S, l'interieur du premier est l'exterieur du second), et il donne
      a la main un cap d'AVANCE sur le changement de sens, pour que la caisse tourne deja quand le virage commence.
   3. LA NITRO LA OU ELLE SERT. Demandee partout ou la route se tient (`vue.tenue`), ou le prochain virage garde de la marge (`vue.virage`) et
      demande peu de volant ; coupee AVANT le virage, de travers, en glisse. Moins volontiers sur les maps a decor (canyon, grotte, jade, ville :
      une sortie y finit contre un mur). Un fond de jauge est garde : c'est lui qui fait planer la caisse quand il faut revenir.
   4. EN VOL, LE RADAR. Au decollage : la loi « vers la route » (la seule mesuree apres une sortie par le bord). Tant que le radar annonce que la
      facon tenue mene a une pose, a la levre ou au portail, il n'en change pas (la main met 0,2 a 0,3 s a obeir et le vol tourne de 3 rad/s :
      changer a chaque vue, c'est zigzaguer jusqu'a la jauge vide). Si elle mene au decor, a la jauge vide ou au fond, il prend la facon du rayon
      dont l'issue vaut le plus : une pose droite et qui reste sur la dalle d'abord, la levre, sinon ce qui meurt le plus tard.
      Il donne toujours `ensuite` : la fleche du vol est lachee des la pose.
   5. PAS DE RISQUE GRATUIT : ni saut, ni figure, ni raccourci cherche, ni drift, ni frein.
   CE QU'IL NE SAIT PAS FAIRE (pour les tours suivants) : rester sur la route au CANYON (1,5 sortie par minute, et la paroi est a 10 m du bord :
   presque toutes ses courses qui y passent y meurent) ; se poser DROIT (une sortie sur trois au moins est une sortie en chaine, la caisse reposee en
   travers) ; freiner ; voler expres comme un joueur ; poser des figures.
   La seconde chance est prise comme dans les deux meilleures parties des joueurs : une fois, dans une longue partie (palier 12 et plus). */
/*@GENOME@*/
/* (28/11/2026, lot « genes v4 ») PROFIL est passe SOUS la balise : son palier de seconde chance est le gene fige chancePalierMin (12 a la naissance,
   le meme profil normalise, donc la meme main, que pilote-voltige). Les cles gardent leur ordre. */
const PROFIL={
  modele:'clavier',graine:1,                 /* la main mesuree sur les joueurs au clavier (doigts.js, MAIN_CLAVIER), sans rien y ecrire par-dessus */
  chance:{prend:1,palierMin:REGLAGES.chancePalierMin}   /* la seconde chance : dans les longues parties seulement (les joueurs : aux paliers 14 et 28) */
};
/* COMPTEURS : ici (sous la balise : la constante COMPTE, la variable DECL et la fonction tic(nom), § 4.1 du contrat) */
/* ===== LES COMPTEURS DE DECLENCHEMENTS (28/11/2026, lot « genes v4 » ; notes/genes-v4.md § 4) =====
   Une regle nee a 0 qui a VRAIMENT agi a cette decision (une valeur de l'ordre, ou la facon, changee par rapport a ce qu'elle aurait ete sans elle)
   ecrit son nom par tic(nom) ; decide met DECL dans le champ d'ordre « declic » (absent quand rien n'a agi : l'ordre d'avant, octet pour octet). L'enfant
   le lit puis le retire : piloter.js ne le voit jamais. REGLE D'ECRITURE, SANS EXCEPTION : tout le code d'un compteur est dans if(COMPTE){try{…}catch(e){}} ;
   il n'ecrit que DECL, m.cSortie et ses deux brouillons AV et JUM (que seuls les compteurs lisent) ; il n'appelle que des fonctions pures (vaut, sauve,
   avecNitro, poseNette, estRetour, cl, rayonDe), jamais teteSol, versRoute, FACONS, controleRayons, teteRayon ni raccourci. COMPTE=false (le test) :
   les memes ordres, sans « declic ». Les noms : DECLICS de genome.js (le test les compare au texte, dans les deux sens). */
const COMPTE=true;
let DECL=null,AV=null,JUM=null;
function tic(nom){if(DECL===null)DECL=[nom];else if(DECL.indexOf(nom)<0)DECL.push(nom);}
/* les cartes dont le gene raccCartes_* / raccJumeau_* nait a 0 (le test les recalcule depuis BORNES) : leur compteur ne parle que la */
const RACC_CARTES_0={jade:1,grotte:1,canyon:1},RACC_JUMEAU_0={nuages:1,espace:1,grotte:1,canyon:1};
const cl=(v,a,b)=>v<a?a:v>b?b:v;
const cote=o=>o.latC!=null?o.latC:o.lat;     /* sous la dalle, le lat des pieces, fruits et orbes est en miroir : latC */
/* ===== LES LOIS DEMANDEES AUX YEUX (27/11/2026, tache « gestes ») =====
   Le coup de nitro vu (R.coupOn) demande DEUX lois « retour » de plus, APRES celle du pilote (R.retours) : la loi du pilote sans coup, puis la meme
   avec un coup de NITRO de 0,2 s (ml/ecurie/agents/tmp-voltige/etude-nitro-vol/faire-coup.js, recopiee). Leurs rayons sont retour<b> et retour<b+1>,
   b = R.retours.length ; ce ne sont jamais des facons du pilote (la boucle des candidats saute retour<i> pour i >= R.retours.length).
   Coup eteint : RETOURS_DEMANDES est R.retours lui-meme (le meme tableau), rien ne change. */
const LOI_PILOTE={marge:28,cap:.6,porteeMin:40,gain:1.6,avance:.25,pique:10,rv:.2,rm:.2,rn:.2};
const COUP_LOIS=[Object.assign({},LOI_PILOTE),Object.assign({},LOI_PILOTE,{coup:.2})];
/* ===== LA LOI FIDELE ET LES LOIS DE SECOURS (28/11/2026, lot « genes v4 » ; notes/genes-v4.md § 3.3 et § 3.4) =====
   R.loiFidele>0 demande LOI_PILOTE aux yeux a l'indice I_FIDELE = R.retours.length (le coup, s'il est allume, l'y demande deja : COUP_LOIS[0], partage) ;
   son rayon est retour<I_FIDELE>, sa commande vue.vol.retours[I_FIDELE]. R.secoursOn>0 demande ensuite les lois de secours S1 (plane bas puis vers la
   route : nitro tenue a moins de 5 m au-dessus du plan de la route) et S2 (vers la route, cabre sous le plan de la route), dans cet ordre, tant qu'il
   reste une place (les yeux en jouent 4 au plus) : N_SECOURS = min(2, 4 - I_SECOURS). Ni l'une ni l'autre ne touche REGLAGES.retours.
   Tout eteint : RETOURS_DEMANDES est R.retours lui-meme (le meme tableau) ; le coup seul : R.retours.concat(COUP_LOIS), comme avant. */
const I_FIDELE=REGLAGES.retours.length;
const LOIS_SECOURS=[Object.assign({},LOI_PILOTE,{nitro:3,nitroHaut:5}),Object.assign({},LOI_PILOTE,{cabre:0})];
const RETOURS_AVANT=REGLAGES.coupOn>0?REGLAGES.retours.concat(COUP_LOIS):REGLAGES.loiFidele>0?REGLAGES.retours.concat([Object.assign({},LOI_PILOTE)]):REGLAGES.retours;
const I_SECOURS=RETOURS_AVANT.length,N_SECOURS=REGLAGES.secoursOn>0?Math.max(0,Math.min(2,4-I_SECOURS)):0;
const RETOURS_DEMANDES=N_SECOURS>0?RETOURS_AVANT.concat(LOIS_SECOURS.slice(0,N_SECOURS)):RETOURS_AVANT;

/* ===== LES DEUX TETES DE RESEAU (2026-11-27, la selection naturelle : INTERFACES.md § 5.4 a 5.6) =====
   Une tete : nIn entrees -> nH tanh -> nOut sorties ; W1 en tete du tableau (W[j*nIn+i]), W2 ensuite (W[nIn*nH+j*nOut+k]). Les entrees sont bornees a
   [-3,3] (une valeur non finie vaut 0). Avec W2 = 0 chaque sortie vaut +0 : x+0, x*exp(0) rendent x, et le pilote joue comme pilote-voltige.
   Les tampons sont faits une fois (pas d'allocation par decision). Les gains 15, 5, 0,3 et 0,5 sont ceux de cfg.reseaux, ecrits ici en dur. */
const XV=new Float64Array(36),OV=new Float64Array(1),XS=new Float64Array(12),OS=new Float64Array(3);
function reseau(W,x,nIn,nH,nOut,out){
  for(let k=0;k<nOut;k++)out[k]=0;
  const b=nIn*nH;
  for(let j=0;j<nH;j++){let s=0;for(let i=0;i<nIn;i++)s+=W[j*nIn+i]*x[i];const h=Math.tanh(s);for(let k=0;k<nOut;k++)out[k]+=W[b+j*nOut+k]*h;}
  return out;}
const borne3=v=>(typeof v==='number'&&v-v===0)?(v<-3?-3:v>3?3:v):0;   /* NaN, ±Infinity, undefined, non-nombre -> 0 ; puis [-3,3] */
/* LA TETE RAYON : ce qu'un rayon vaut de plus (ou de moins), en points, pour la facon nom ; 0 sans rayon (le reseau n'est pas appele) */
function teteRayon(ry,nom,v,m){
  if(ry==null)return 0;
  const f=v.vol,p=f.proche||{},demi=Math.max(1,+v.demi||28),x=XV;
  x[0]=ry.issue==='pose'?1:0;x[1]=ry.issue==='levre'?1:0;x[2]=ry.issue==='portail'?1:0;x[3]=ry.issue==='choc'?1:0;
  x[4]=ry.issue==='air'?1:0;x[5]=ry.issue==='fond'?1:0;x[6]=ry.issue==='libre'?1:0;x[7]=ry.issue==='coupe'?1:0;
  x[8]=(+ry.t||0)/6;x[9]=Math.abs(+ry.axe||0)/1.4;x[10]=(+ry.lat||0)/demi;x[11]=ry.propre===true?1:0;x[12]=ry.dessous?1:0;x[13]=(+ry.gain||0)/200;
  x[14]=nom.indexOf('retour')===0?1:0;x[15]=nom==='rien'?1:0;x[16]=nom==='gauche'?1:0;x[17]=nom==='droite'?1:0;x[18]=nom==='cabre'?1:0;
  x[19]=nom==='pique'?1:0;x[20]=nom==='plane'?1:0;x[21]=nom==='planeCabre'?1:0;x[22]=nom==='versRoute'?1:0;x[23]=nom==='versRoutePlane'?1:0;
  x[24]=nom==='viser'?1:0;x[25]=nom==='viserPlane'?1:0;
  x[26]=(f.air&&f.air.reste!=null?+f.air.reste:+f.reste)/6;x[27]=((+v.nitro||0)+(+v.reserve||0))/2;x[28]=(+p.haut||0)/100;x[29]=(+p.lat||0)/demi;
  x[30]=+p.axe||0;x[31]=nom===m.facon?1:0;x[32]=(v.t-m.tFacon)/1;x[33]=(+f.t||0)/6;x[34]=DECOR[v.carte]?1:0;x[35]=1;
  for(let i=0;i<36;i++)x[i]=borne3(x[i]);
  reseau(WV,x,36,6,1,OV);
  return 15*Math.tanh(OV[0]);}
/* LA TETE SOL : une fois par decision au sol (hors depart) ; rend OS : [0] le seuil de la nitro, [1] la ligne visee, [2] le gout du raccourci */
function teteSol(v,force,margeV,jauge,decor,couloir,lache){
  const x=XS;
  x[0]=v.lat/Math.max(1,+v.demi||28);x[1]=(+v.cap||0)/0.5;x[2]=force;x[3]=margeV/3;x[4]=jauge/2;x[5]=v.vitesse/150;
  x[6]=(v.palier&&+v.palier.n||0)/30;x[7]=decor?1:0;x[8]=couloir?1:0;x[9]=lache?1:0;x[10]=tourne(v,400);x[11]=1;
  for(let i=0;i<12;i++)x[i]=borne3(x[i]);
  return reseau(WS,x,12,6,3,OS);}
/* ===== LE CONTROLE DES RAYONS (amendement 3, ecrit d'apres ml/bot/yeux.js, radarVol) =====
   Les dix premiers rayons sont toujours la, dans cet ordre ; viser et viserPlane viennent ensemble, seulement quand les yeux ont une cible (vue.vol.cible
   n'est alors pas null) ; viennent ensuite retour0, retour1… consecutifs, au plus autant que de lois demandees (moins a la premiere vue d'un vol : la
   demande part avec l'ordre d'avant). Rien d'autre. Un controle qui passe n'ecrit rien et ne change rien a la course. */
const ORDRE10=['tenu','rien','gauche','droite','cabre','pique','plane','planeCabre','versRoute','versRoutePlane'];
function controleRayons(f){
  const noms=f.radar.rayons.map(r=>r&&r.m);
  let ok=noms.length>=10,j=10;
  for(let i=0;ok&&i<10;i++)if(noms[i]!==ORDRE10[i])ok=false;
  if(ok){
    if(noms[j]==='viser'){if(noms[j+1]!=='viserPlane'||!f.cible||typeof f.cible!=='object')ok=false;j+=2;}
    else if(f.cible!=null)ok=false;}
  if(ok){let n=0;while(j<noms.length&&noms[j]==='retour'+n){n++;j++;}if(j!==noms.length||n>RETOURS_DEMANDES.length)ok=false;}
  if(!ok)throw new Error('YEUX CHANGES : rayons '+noms.join(','));}

/* ---------- AU SOL ---------- */
/* ce qu'on vise : l'objet de la ligne parfaite s'il est proche et a portee, sinon la premiere tranche de pieces a portee, sinon un pouvoir */
function aRamasser(v,max){
  const R=REGLAGES,dmin=Math.max(15,v.vitesse*R.avance);
  const prend=(d,lat)=>d>=dmin&&Math.abs(lat)<=max&&Math.abs(lat-v.lat)<Math.max(3,(d-v.vitesse*.25)*R.glisse*.85);
  const L=v.ligne&&Array.isArray(v.ligne.objets)?v.ligne.objets:[];
  const obj=L.find(o=>o.d<R.ligneLoin&&prend(o.d,o.lat));
  const P=Array.isArray(v.piecesDevant)?v.piecesDevant:[];
  const file=P.find(p=>p.d<R.piecesLoin&&prend(p.d,cote(p)));
  const O=Array.isArray(v.orbes)?v.orbes:[];
  const orbe=O.find(o=>o.d<220&&prend(o.d,cote(o)));
  /* l'objet de la ligne d'abord quand il est le plus proche ou qu'il arrive dans 1,2 s ; les pieces sinon (elles font le palier) */
  if(obj&&(!file||obj.d<=file.d+10||obj.d<v.vitesse*1.2))return obj.lat;
  if(orbe&&(!file||orbe.d<=file.d+10))return cote(orbe);
  if(file)return cote(file);
  if(obj)return obj.lat;
  return null;
}
/* DE COMBIEN LA ROUTE AURA TOURNE a d metres devant (rad, + a gauche) : vue.route le donne a 30, 60, 100, 150, 220… m ; entre deux, en ligne droite */
function tourne(v,d){
  const rt=Array.isArray(v.route)?v.route:[];
  let d0=0,a0=0;
  for(const p of rt){if(!p)continue;if(d<=p.d)return a0+(p.virage-a0)*(d-d0)/Math.max(1,p.d-d0);d0=p.d;a0=p.virage;}
  return a0;
}
/* LE LACET DE LA ROUTE DANS t SECONDES (rad/s) : ce que la main devra suivre a ce moment-la. La loi `ligne` de la main ne connait que le lacet
   sous les roues, percu 0,15 s plus tard : dans un S, elle braque encore a droite quand la route est deja repartie a gauche (MESURE, tour 3,
   canyon : cap −0,6 rad en 0,4 s au changement de sens, la paroi 0,5 s apres). C'est au pilote de voir le virage d'apres. */
function lacetDans(v,t,vit){return (tourne(v,vit*(t+.15))-tourne(v,vit*Math.max(0,t-.15)))/(t<.15?t+.15:.3);}
const DECOR={canyon:1,grotte:1,jade:1,ville:1};   /* les maps ou une sortie par le bord finit contre le decor */
/* ---------- LE RACCOURCI ----------
   MESURE (les 10 parties au clavier, ml/bot/voltige.js) : 8,5 vols par minute, 94 % par le bord, 49 % du cote INTERIEUR d'un virage ; 43 % des poses
   sont des raccourcis (3,5 par minute), 413 m gagnes en mediane. Les joueurs ne « tombent » pas de la route : ils la coupent.
   vue.sorties (demande a la vue d'avant par regarder:'sorties') dit, pour une sortie a gauche et a droite volant a fond des maintenant, ou mene le vol
   pour trois facons de le piloter (rien, plane, versRoute). On s'engage quand l'une promet une pose propre, plus loin sur la piste. */
function raccourci(v,sortir,kGain){   /* kGain : exp(0,5 x la 3e sortie de la tete SOL) — 1 a la naissance */
  const R=REGLAGES,S=v.sorties;
  if(COMPTE){try{JUM=null;}catch(e){}}   /* compteur raccJumeau : le meilleur score ecarte par la jumelle, a cet appel */
  if(!S)return null;
  let mieux=null;
  for(const nom of ['gauche','droite']){
    const X=S[nom];if(!X||!Array.isArray(X.rayons)||!(X.t<=R.raccAttente))continue;
    for(const r of X.rayons){
      /* LE PORTAIL EN VOL : un rayon de cette sortie le traverse en moins de raccTmax secondes — c'est la plus belle fin de piste */
      if(r&&r.issue==='portail'&&R.portailVol>0&&!sortir&&(+r.t||0)<=R.raccTmax){const s8=400-25*(+r.t||0)-(/plane/i.test(r.m)?20:0);
        if(!mieux||s8>mieux.s)mieux={s:s8,cote:nom==='gauche'?1:-1,facon:r.m,cible:typeof r.cible==='number'?r.cible:null,gain:0,vol:+r.t||0,attente:+X.t||0};continue;}
      if(!r||r.issue!=='pose'||r.propre===false||r.dessous)continue;
      /* SORTIR DU DESSOUS : n'importe quelle pose propre SUR la dalle fait l'affaire, la plus courte et la plus droite d'abord (aucun gain exige) */
      if(sortir){const t9=+r.t||0,a9=Math.abs(+r.axe||0);if(t9>3.5||a9>R.raccAxe||(r.air!=null&&r.air<R.raccAir))continue;const s9=100-25*t9-100*a9;
        if(!mieux||s9>mieux.s)mieux={s:s9,cote:nom==='gauche'?1:-1,facon:r.m,cible:typeof r.cible==='number'?r.cible:null,gain:+r.gain||0,vol:t9,attente:+X.t||0};continue;}
      const gain=+r.gain||0,axe=Math.abs(+r.axe||0),t=+r.t||0;
      if((r.chute!=null&&r.chute>R.raccChute)||gain<R.raccGain*kGain||axe>R.raccAxe||t<R.raccTmin||t>R.raccTmax||Math.abs(+r.lat||0)>v.demi-R.raccBord||(r.air!=null&&r.air<R.raccAir))continue;
      /* sur une map a decor : l'autre rayon vers la meme cible (avec ou sans reacteur) doit se poser lui aussi — une pose qui ne tient qu'a une
         facon de piloter ne tient pas a la main d'un clavier */
      if(R.raccJumeau[v.carte]&&typeof r.cible==='number'){
        /* COMPTEURS : ici (raccJumeau : la jumelle ecarte ce rayon ; son score l.168 refait en locales, carte de RACC_JUMEAU_0) */
        if(COMPTE){try{if(RACC_JUMEAU_0[v.carte]){const j0=X.rayons.find(q=>q&&q!==r&&q.cible===r.cible&&(q.m==='viser'||q.m==='viserPlane'));
          if(!j0||j0.issue!=='pose'){const s0=Math.min(gain,600)-G.rAxe*axe-G.rTemps*t-(r.m==='plane'?G.rPlane:0)-(r.note==='lourde'?G.rLourde:0);if(JUM===null||s0>JUM)JUM=s0;}}}catch(e){}}
        const j=X.rayons.find(q=>q&&q!==r&&q.cible===r.cible&&(q.m==='viser'||q.m==='viserPlane'));
        if(!j||j.issue!=='pose')continue;}
      /* ce que vaut la sortie : la piste gagnee, moins l'angle d'arrivee, la duree, le reacteur (il coute de la jauge), une pose lourde */
      const s=Math.min(gain,600)-G.rAxe*axe-G.rTemps*t-(r.m==='plane'?G.rPlane:0)-(r.note==='lourde'?G.rLourde:0);
      if(!mieux||s>mieux.s)mieux={s:s,cote:nom==='gauche'?1:-1,facon:r.m,cible:typeof r.cible==='number'?r.cible:null,gain:gain,vol:t,attente:+X.t||0};}}
  /* compteur raccJumeau : un rayon ecarte par la jumelle valait plus que le rayon retenu (ou rien n'est retenu) : sans le gene, l'appel rendrait autre chose */
  if(COMPTE){try{if(JUM!==null&&R.raccJumeau[v.carte]&&RACC_JUMEAU_0[v.carte]&&(!mieux||JUM>mieux.s))tic('raccJumeau');}catch(e){}JUM=null;}
  return mieux;
}
/* la sortie engagee tient-elle encore ? (le cote choisi garde au moins un rayon qui sauve) */
function tientEncore(v,cote){
  const S=v.sorties,X=S&&S[cote>0?'gauche':'droite'];
  if(!X||!Array.isArray(X.rayons))return null;            /* pas de reponse cette fois : on ne sait pas */
  return X.rayons.some(r=>r&&(r.issue==='pose'||r.issue==='levre'||r.issue==='portail'));
}
function auSol(v,m){
  /* COMPTEURS : ici (sortieOn.pose, la forme exacte du § 4.3 : if(COMPTE&&R.sortieOn>0&&m.cSortie!=null){…} ; R n'est pas encore declare ici : REGLAGES) */
  if(COMPTE&&REGLAGES.sortieOn>0&&m.cSortie!=null){try{if(v.t-m.cSortie<=.25)tic('sortieOn.pose');}catch(e){}m.cSortie=null;}
  /* LE DEPART : tout droit sur sa ligne, nitro tenue, le temps tire pour cette piste — sauf si la route lache avant */
  if(m.tDepart==null){const g=Math.round(+v.L||0)*7+Math.round((Array.isArray(v.piecesDevant)&&v.piecesDevant[0]?+v.piecesDevant[0].d:0)||0)*13;
    m.tDepart=REGLAGES.departMin+(REGLAGES.departMax-REGLAGES.departMin)*((g%41)/40);m.latDepart=v.lat;}
  if(v.t<m.tDepart&&!(v.tenue&&v.tenue.tient===false)){m.tSol=v.t;m.ligne=v.lat;m.facon=null;return {ligne:m.latDepart,nitro:true};}
  const R=REGLAGES,vg=v.virage,tn=v.tenue,vit=Math.max(6,v.vitesse),lmax=Math.max(.05,v.lacetMax||1);
  const couloir=(v.mur&&v.mur.ici)||(Array.isArray(v.couloirs)&&v.couloirs.some(c=>c.d0<vit*2&&c.d1>0));
  const decor=!!DECOR[v.carte],max=Math.min(decor?R.bandeDecor:99,v.demi-(couloir?R.margeCouloir:R.marge));
  /* ce qui se ramasse a portee, sinon le milieu */
  let cible=0;
  const but=aRamasser(v,max);
  if(but!=null)cible=but;
  /* LA PLACE DANS LE VIRAGE : plus il demande de volant, plus la ligne reste du cote interieur — du virage QUI VIENT (dans 1 s, puis dans
     0,4 s) avant celui qu'on quitte : dans un S, l'interieur du premier est l'exterieur du second */
  const lIci=v.lacetRoute||0,lTot=lacetDans(v,.4,vit),lTard=lacetDans(v,1,vit);
  let lFort=lTard;
  if(Math.abs(lTot)>Math.abs(lFort))lFort=lTot;
  if(Math.abs(lIci)*.6>Math.abs(lFort))lFort=lIci;
  const force=Math.abs(lFort)/lmax,sens=lFort>0?1:-1,u=cl((force-R.braqueDoux)/(R.braqueFort-R.braqueDoux),0,1);
  if(u>0){const plancher=max*(-1+1.5*u);if(cible*sens<plancher)cible=sens*plancher;}
  /* une flaque sur la ligne : passer a cote, du cote ou il y a le plus de place */
  const F=Array.isArray(v.flaques)?v.flaques:[];
  for(const f of F){if(f.d<5||f.d>160)continue;if(Math.abs(f.lat-cible)<f.rayon+4)cible=f.lat+(f.lat>0?-1:1)*(f.rayon+6);}
  /* LA ROUTE NE SE TIENT PLUS (le bord dans moins de 3 s) : vers le cote oppose au bord annonce */
  const lache=!!(tn&&tn.tient===false);
  if(lache)cible=-tn.cote*max*.5;
  /* LA TETE SOL (2026-11-27) : elle voit la marge du virage et la jauge, calculees ici (plus bas dans pilote-voltige, memes expressions) */
  const proche=!!(vg&&vg.d<vit*3),margeV=proche?vg.marge/vit:9;
  const jauge=(v.nitro||0)+(v.reserve||0);
  const oS=teteSol(v,force,margeV,jauge,decor,couloir,lache);
  {const dc=5*Math.tanh(oS[1]);if(dc!==0)cible=cible+dc;}   /* la ligne visee (m) ; un decalage nul n'y touche pas (pas meme le signe d'un zero) */
  const kSeuil=Math.exp(0.3*oS[0]),kGain=Math.exp(0.5*oS[2]);
  cible=cl(cible,-max,max);
  /* LA LIGNE GLISSE VERS SA CIBLE, elle n'y saute pas. Apres un vol, elle repart d'ou la caisse est. */
  if(m.ligne==null||m.tSol==null||v.t-m.tSol>.25){m.ligne=cl(v.lat,-max,max);if(R.suitOn>0&&m.facon!=null)m.tPose=v.t;}
  /* GESTE 5 — AU SOL APRES LA POSE, LA LIGNE SUIT LA CAISSE (27/11/2026, tache « gestes » ; PROPOSITIONS.md, enquete 1, proposition 4) : pendant
     suitDerive + suitMarge secondes apres une pose, la ligne est mise chaque vue la ou la caisse sera dans ce qui reste de suitDerive (elle glisse dans
     son cap), au lieu de la ramener au point de contact : la main ne contre-braque plus une glisse qu'elle laisserait finir (les joueurs : +0,1 a
     +0,7 s ; le bot : jusqu'a +1 s, 37 % du temps a fond). m.tPose : la premiere vue au sol apres un vol (m.facon y est encore celle du vol). */
  /* COMPTEURS : ici (suitOn : la nouvelle m.ligne differe de l'ancienne) */
  if(COMPTE){try{if(R.suitOn>0&&m.tPose!=null&&v.t-m.tPose<R.suitDerive+R.suitMarge
    &&cl(v.lat+vit*Math.sin(cl(+v.cap||0,-1,1))*Math.max(0,R.suitDerive-(v.t-m.tPose)),-max,max)!==m.ligne)tic('suitOn');}catch(e){}}
  if(R.suitOn>0&&m.tPose!=null&&v.t-m.tPose<R.suitDerive+R.suitMarge)
    m.ligne=cl(v.lat+vit*Math.sin(cl(+v.cap||0,-1,1))*Math.max(0,R.suitDerive-(v.t-m.tPose)),-max,max);
  m.tSol=v.t;
  const pas=(lache?R.glisseUrgence:R.glisse)*vit*.1;
  m.ligne=cl(m.ligne+cl(cible-m.ligne,-pas,pas),-max,max);
  /* LE CAP D'AVANCE : la main vise le cap (ligne − lat) / (0,9 × vitesse). On lui donne ce cap PLUS l'avance sur le virage qui arrive :
     la caisse tourne deja vers lui quand il commence, au lieu de le decouvrir 0,15 s apres. */
  /* GESTE 2 — LE SLALOM DEMANDE PAR LE PILOTE (27/11/2026, tache « gestes » ; PROPOSITIONS.md, enquete 3) : hors urgence (ni route qui lache, ni
     couloir, ni glisse, ni rebond, virage doux u<0,5), la loi de ligne est adoucie (horizon slalomH au lieu de 0,9 s) ET le pilote ajoute un cap
     alterne franc de ±slalomCap rad, un cote puis l'autre, toutes les slalomDemi s (duree tiree par une suite fixe, entre 0,7 et 1,3 fois), jamais
     vers le bord quand on y est. Les deux vont ensemble (le verificateur : avec l'horizon 0,9 le slalom ne prend pas ; l'horizon 3 seul ne suffit pas). */
  const zActif=R.slalomOn>0&&!lache&&!couloir&&!v.glisse&&!v.rebond&&u<.5;
  /* COMPTEURS : ici (slalomOn : zActif vrai) */
  if(COMPTE){try{if(R.slalomOn>0&&zActif)tic('slalomOn');}catch(e){}}
  let capVoulu=cl((m.ligne-v.lat)/((zActif?R.slalomH:.9)*vit),-R.capLigne,R.capLigne)+cl((lTot-lIci)*R.avanceCap,-R.capAvance,R.capAvance);
  if(v.lat>max)capVoulu=Math.min(capVoulu,-.05);else if(v.lat<-max)capVoulu=Math.max(capVoulu,.05);   /* jamais vers le bord quand on y est */
  let capZ=0;
  if(zActif){
    if(m.zT==null||v.t>=m.zT){m.zS=-(m.zS||1);m.zN=(m.zN|0)+1;m.zT=v.t+R.slalomDemi*(.7+.6*((m.zN*7919)%13)/13);}
    capZ=m.zS*R.slalomCap*(1-u);
    if((capZ>0&&v.lat>max-4)||(capZ<0&&v.lat<-max+4))capZ=0;}
  const ligne=v.lat+.9*vit*cl(zActif?capVoulu+capZ:capVoulu,-.4,.4);
  /* LA NITRO : partout ou elle ne met pas la caisse dehors. Jamais de travers, en glisse, en rebond, quand la route lache, ni dans un virage
     qui demande du volant ; sur les maps a decor, encore moins. */
  const pose=Math.abs(v.lat)<v.demi-6&&Math.abs(v.cap)<R.capMax&&!v.glisse&&!v.rebond;
  if(jauge>R.jaugeAllume)m.plein=true;else if(jauge<R.jaugeCoupe)m.plein=false;
  /* PORTAGE c0087 (28/11/2026, R.libreOn ; le bloc de c0087-pilote.js, recopie) — MAPS SANS DECOR : une sortie par le bord ne coute que de l'air
     (aucun choc mesure sur 13 plongeons) ; la nitro deja allumee y est donc gardee plus longtemps dans les virages (seuil de volant x nitroLibreK,
     vitesse jusqu'a tenirLibre au-dessus de vSure). Elle reste coupee quand la route lache, en glisse, de travers, en rebond ou jauge basse.
     libreOn eteint : k = 1 et la marge margeTenir, comme pilote-voltige. kSeuil (la tete SOL) multiplie le seuil dans les deux cas. */
  const libre=R.libreOn>0&&!decor;
  const k=decor?R.nitroDecor:(libre&&m.nitro?R.nitroLibreK:1),seuil=(m.nitro?R.braqueNitro:R.braqueNitro-.1)*k*kSeuil;
  const mTenir=libre?R.margeTenir-R.tenirLibre:R.margeTenir;
  const sur=margeV>(m.nitro?mTenir:R.margeAllumer)&&Math.max(force,Math.abs(lIci)/lmax)<seuil;
  /* COMPTEURS : ici (libreOn : garder l'ancienne m.nitro avant la ligne suivante, refaire k, mTenir, sur avec libre faux, en locales) */
  if(COMPTE){try{if(R.libreOn>0&&libre){const k0=decor?R.nitroDecor:1,s0=(m.nitro?R.braqueNitro:R.braqueNitro-.1)*k0*kSeuil;
    const sur0=margeV>(m.nitro?R.margeTenir:R.margeAllumer)&&Math.max(force,Math.abs(lIci)/lmax)<s0;
    if((!lache&&pose&&sur&&(v.nitroLibre||!!m.plein))!==(!lache&&pose&&sur0&&(v.nitroLibre||!!m.plein)))tic('libreOn');}}catch(e){}}
  m.nitro=!lache&&pose&&sur&&(v.nitroLibre||!!m.plein);
  /* PORTAGE c0064 (28/11/2026, R.bordOn ; recopie de c0064-pilote.js) — LE DECOLLAGE NITRO ALLUMEE : sur une map sans decor, quand le bord est
     imminent (la sortie ne se discute plus), on garde la nitro tenue jusqu'au decollage au lieu de la couper : les joueurs partent nitro allumee
     63 fois sur 100, le parent 17. En vol, la loi « vers la route » reprend. (Avec le geste 4, le relache, cette nitro tenue compte comme demandee.) */
  /* COMPTEURS : ici (bordOn : m.nitro etait faux, a lire avant la ligne suivante) */
  if(COMPTE){try{if(R.bordOn>0&&!m.nitro&&!decor&&lache&&!v.dessous&&!v.glisse&&!v.rebond&&tn.t!=null&&tn.t<R.bordNitro&&jauge>R.bordJauge)tic('bordOn');}catch(e){}}
  if(R.bordOn>0&&!decor&&lache&&!v.dessous&&!v.glisse&&!v.rebond&&tn.t!=null&&tn.t<R.bordNitro&&jauge>R.bordJauge)m.nitro=true;
  /* ===== GENE V4 — LA SORTIE PREPAREE SUR LES MAPS A DECOR (28/11/2026, lot « genes v4 » ; notes/genes-v4.md § 3.1) =====
     Sur une map a decor (canyon, grotte, jade, ville), la route lache dans moins de sortieT s, la jauge depasse sortieJauge, et le rayon du bord dit :
     « rien » au choc, « vers la route » au choc, et seul « plane » se pose (propre, dessus) ou finit a la levre : on garde la nitro jusqu'au decollage
     et l'on note l'instant (m.planeBord) ; au decollage, le vol part en « plane ». La regle evaluee et fausse efface l'annonce : seule la derniere
     compte. Jamais pendant un raccourci engage (!m.sortie) ; m.sortie, m.vu, m.nRacc et la ligne ne changent pas. Eteint : rien n'est lu ni ecrit. */
  if(R.sortieOn>0){let ok=false;
    if(decor&&!m.sortie&&lache&&!v.dessous&&!v.glisse&&!v.rebond&&tn.t!=null&&tn.t<R.sortieT&&jauge>R.sortieJauge){
      const B=v.sorties&&v.sorties.bord,Y=B&&Array.isArray(B.rayons)?B.rayons:null;
      const ri=Y&&Y.find(r=>r&&r.m==='rien'),vr=Y&&Y.find(r=>r&&r.m==='versRoute'),pl=Y&&Y.find(r=>r&&r.m==='plane');
      ok=!!(Y&&ri&&ri.issue==='choc'&&vr&&vr.issue==='choc'&&pl&&(pl.issue==='levre'||(pl.issue==='pose'&&pl.propre!==false&&!pl.dessous)));}
    if(ok){
      /* COMPTEURS : ici (sortieOn : m.nitro etait faux, a lire avant la ligne suivante) */
      if(COMPTE){try{if(R.sortieOn>0&&!m.nitro)tic('sortieOn');}catch(e){}}
      m.nitro=true;m.planeBord=v.t;}
    else m.planeBord=null;}
  m.facon=null;m.nFigVol=0;
  /* LE RACCOURCI : on regarde les sorties la ou la route tourne (ou quand un troncon s'offre en contrebas), hors des couloirs et du dessous */
  /* SOUS LA DALLE : on n'y reste pas. Apres dessousMax secondes, on regarde les sorties et l'on prend celle qui se pose DESSUS (hors des maps a decor). */
  if(v.dessous){if(m.tDessous==null)m.tDessous=v.t;}else m.tDessous=null;
  const sortir=!!v.dessous&&v.t-m.tDessous>R.dessousMax&&(!DECOR[v.carte]||R.dessousDecor>0);
  const permis=(sortir||(R.raccCartes[v.carte]!==0&&!v.dessous))&&!couloir&&!v.rebond&&!v.glisse&&!(v.invulnerable>0);
  const tourneLoin=Math.abs(tourne(v,400)),offre=Array.isArray(v.troncons)&&v.troncons.length>0;
  const regarde=permis&&(sortir||tourneLoin>R.raccVirage||offre||!!m.sortie);
  if(m.sortie){
    /* engage : volant a fond vers le bord choisi, jusqu'au decollage ; on renonce si plus aucun rayon de ce cote ne sauve, ou si le bord tarde */
    const tient=tientEncore(v,m.sortie.cote);
    /* on ne renonce que si le bord est encore a plus d'une demi-seconde : plus pres, la caisse sort de toute facon, en travers et sans cible
       (MESURE, ville 910370 : un engagement abandonne a 18 s, puis un vol subi de 10 s, mort jauge vide ; sans raccourci la meme course dure 236 s) */
    const X9=v.sorties&&v.sorties[m.sortie.cote>0?'gauche':'droite'],recuperable=!X9||!(X9.t<=.5);
    /* UNE SORTIE DU DESSOUS NE SE DISCUTE PAS : le rayon du sol y dit « air » une vue sur deux, et la caisse fait le tour de la dalle quand meme */
    const tetu=!!m.sortie.dessous&&!!v.dessous;
    /* COMPTEURS : ici (retourOn.reacteur et dessousNitro, sur la nitro de l'ordre rendu ci-dessous) — places AVANT le if : entre son bloc et le else,
       rien ne s'ecrit ; la condition d'abandon est refaite en locales (fausse : l'ordre du raccourci engage est rendu) */
    if(COMPTE){try{if((R.retours.length>0||R.dessousNitro>0)&&!m.nitro&&!(!permis||(!tetu&&tient===false&&recuperable)||v.t-m.sortie.t0>m.sortie.attente+(tetu?2.5:.9))){
      const f9=m.sortie.facon,a9=R.retours.length?avecNitro(f9):f9==='plane';
      if(R.retours.length>0&&!(tetu&&R.dessousNitro>0)&&a9!==(f9==='plane'))tic('retourOn.reacteur');
      if(R.dessousNitro>0&&tetu&&!a9)tic('dessousNitro');}}catch(e){}}
    if(!permis||(!tetu&&tient===false&&recuperable)||v.t-m.sortie.t0>m.sortie.attente+(tetu?2.5:.9)){m.sortie=null;m.tAbandon=v.t;}
    else return {volant:m.sortie.cote,nitro:(R.retours.length?avecNitro(m.sortie.facon):m.sortie.facon==='plane')||m.nitro||(tetu&&R.dessousNitro>0),ensuite:{volant:0},regarder:'sorties'};}
  /* SOUS LA DALLE, AU BORD TOUT DE SUITE : le cote dont un rayon promet une pose DESSUS, sinon le bord le plus proche */
  if(sortir&&R.dessousAveugle>0&&permis&&!lache){
    const S=v.sorties||{},dec=!!DECOR[v.carte]&&R.dessousDecor<2;
    const cote9=k=>{const X=S[k],Y=X&&Array.isArray(X.rayons)?X.rayons:[];
      const dessus=Y.some(r=>r&&r.issue==='pose'&&!r.dessous),sauf=Y.some(r=>r&&(r.issue==='pose'||r.issue==='levre'||r.issue==='portail'));
      if(dec&&!sauf)return null;
      const att=X&&X.t!=null?+X.t:(v.demi-(k==='gauche'?1:-1)*v.lat)/Math.max(8,.25*vit);
      return {s:(dessus?10:sauf?4:0)-att,att:att};};
    const g9=cote9('gauche'),d9=cote9('droite'),c9=g9&&(!d9||g9.s>=d9.s)?1:d9?-1:0,q9=c9>0?g9:d9;
    /* COMPTEURS : ici (dessousNitro : la nitro de l'ordre rendu ci-dessous, m.nitro||R.dessousNitro>0) */
    if(COMPTE){try{if(R.dessousNitro>0&&c9&&q9.att<=4&&!m.nitro)tic('dessousNitro');}catch(e){}}
    if(c9&&q9.att<=4){m.vu=null;m.sortie={cote:c9,facon:'versRoute',cible:null,gain:0,attente:q9.att,t0:v.t,dessous:true};
      return {volant:c9,nitro:m.nitro||R.dessousNitro>0,ensuite:{volant:0},regarder:'sorties'};}}
  if(regarde&&!lache&&!(m.tAbandon!=null&&v.t-m.tAbandon<R.raccRepos)){
    const rc=raccourci(v,sortir,kGain);
    /* LA PROMESSE DOIT TENIR DEUX VUES DE SUITE (0,1 s) du meme cote avant qu'on s'engage : un rayon du sol qui dit « pose » une vue sur deux
       est une pose qui ne tient a rien */
    /* COMPTEURS : ici (raccCartes : un raccourci s'engage ci-dessous sur une carte de RACC_CARTES_0 ; retourOn.reacteur sur sa nitro) */
    if(COMPTE){try{if(rc&&m.vu&&m.vu.cote===rc.cote&&v.t-m.vu.t<=.25){
      if(R.raccCartes[v.carte]!==0&&RACC_CARTES_0[v.carte]&&!sortir)tic('raccCartes');   /* sortir (le dessous) permet le raccourci sans le gene */
      if(R.retours.length>0&&!m.nitro&&avecNitro(rc.facon)!==(rc.facon==='plane'))tic('retourOn.reacteur');}}catch(e){}}
    if(rc&&!(m.vu&&m.vu.cote===rc.cote&&v.t-m.vu.t<=.25))m.vu={cote:rc.cote,t:v.t};
    else if(rc){m.vu=null;m.sortie={cote:rc.cote,facon:rc.facon,cible:rc.cible,gain:rc.gain,attente:rc.attente,t0:v.t};m.nRacc=(m.nRacc|0)+1;
      return {volant:rc.cote,nitro:(R.retours.length?avecNitro(rc.facon):rc.facon==='plane')||m.nitro,ensuite:{volant:0},regarder:'sorties'};}}
  return regarde?{ligne:ligne,nitro:m.nitro,regarder:'sorties'}:{ligne:ligne,nitro:m.nitro};
}

/* ---------- EN VOL ---------- */
/* LA LOI « VERS LA ROUTE » (README § 2 bis), recopiee : c'est elle que jouent les rayons versRoute et versRoutePlane du radar */
function versRoute(v,nitro,m){
  const R=REGLAGES,f=v.vol,p=f.proche,o={volant:0,manche:0,nitro:nitro};
  if(!p)return o;
  let lat=p.lat,axe=p.axe;
  if(m){const q=m.pv;
    if(R.volAvance>0&&q&&v.t>q.t&&v.t-q.t<=.25){const dt=v.t-q.t,dl=(p.lat-q.lat)/dt,da=(p.axe-q.axe)/dt;
      if(Math.abs(dl)<400&&Math.abs(da)<6){lat+=dl*R.volAvance;axe+=da*R.volAvance;}}
    m.pv={t:v.t,lat:p.lat,axe:p.axe};}
  if(Math.abs(p.axe)<1.6||R.volDemiTour>0){
    const portee=R.volRetour>0?Math.max(40,R.volRetour*Math.max(1,+v.vitesse||0)):40;
    /* COMPTEURS : ici (volRetourOn, garde R.volRetour>0 : le volant de la ligne suivante contre la meme expression a portee 40, en locales) */
    if(COMPTE){try{if(R.volRetour>0){const e9=p.envers?-1:1,a9=cl((cl(-lat/portee,-.6,.6)-axe)*1.6,-1,1)*e9,b9=cl((cl(-lat/40,-.6,.6)-axe)*1.6,-1,1)*e9;
      if(a9!==b9&&!(a9!==a9&&b9!==b9))tic('volRetourOn');}}catch(e){}}
    o.volant=cl((cl(-lat/portee,-.6,.6)-axe)*1.6,-1,1)*(p.envers?-1:1);}
  if(p.haut>10&&Math.abs(p.lat)<v.demi*2){
    const air=f.air&&f.air.reste!=null?f.air.reste:f.reste,delai=p.haut/Math.max(1,p.versRoute);
    if(delai>2||delai>air-1)o.manche=p.envers?1:-1;}
  return o;
}
const FACONS={
  rien:()=>({volant:0,manche:0,nitro:false}),
  gauche:()=>({volant:1,manche:0,nitro:false}),
  droite:()=>({volant:-1,manche:0,nitro:false}),
  cabre:()=>({volant:0,manche:1,nitro:false}),
  pique:()=>({volant:0,manche:-1,nitro:false}),
  plane:()=>({volant:0,manche:0,nitro:true}),
  planeCabre:()=>({volant:0,manche:1,nitro:true}),
  versRoute:(v,m)=>versRoute(v,false,m),
  versRoutePlane:(v,m)=>versRoute(v,true,m),
  /* VISER un troncon en contrebas (le raccourci) : la loi est celle des yeux (vue.vol.cible : son volant et son manche du moment) — tourner le vol
     vers la cible, regler la portee au manche, puis « vers la route » a l'approche. Sans cible en vue : vers la route. */
  viser:(v,m)=>{const c=v.vol.cible;return c?{volant:c.volant,manche:c.manche,nitro:false}:versRoute(v,false,m);},
  viserPlane:(v,m)=>{const c=v.vol.cible;return c?{volant:c.volant,manche:c.manche,nitro:true}:versRoute(v,true,m);},
  /* LES LOIS « RETOUR » (faire-pR.js, 27/11) : la loi est celle des yeux (vue.vol.retours[i] : son volant, son manche et sa nitro du moment, avance comprise) */
  retour0:(v,m)=>retourDe(v,m,0),retour1:(v,m)=>retourDe(v,m,1),retour2:(v,m)=>retourDe(v,m,2),retour3:(v,m)=>retourDe(v,m,3)
};
function retourDe(v,m,i){const L=v.vol.retours,c=Array.isArray(L)?L[i]:null;return c?{volant:c.volant,manche:c.manche,nitro:!!c.nitro}:versRoute(v,false,m);}
const LONGS={rien:1,plane:1,versRoute:1,versRoutePlane:1,viser:1,viserPlane:1,retour0:1,retour1:1,retour2:1,retour3:1};
/* LES LOIS DE RETOUR : celles entre lesquelles on choisit au depart d'un vol subi, et on change pour mieux */
const RETOURS=['versRoute','versRoutePlane','retour0','retour1','retour2','retour3'];
const estRetour=nom=>nom.indexOf('versRoute')===0||nom.indexOf('retour')===0;
const avecNitro=nom=>nom==='versRoutePlane'||nom==='plane'||nom==='planeCabre'||nom==='viserPlane'||(nom.indexOf('retour')===0&&!!(REGLAGES.retours[+nom.slice(6)]&&REGLAGES.retours[+nom.slice(6)].nitro>0));
/* le bonus d'une facon a issue egale (pilote-voltige : versRoute 3, versRoutePlane 2, rien 1 — ici les genes G.bVersRoute, G.bVersRoutePlane, G.bRien) */
const prime=nom=>(nom==='versRoute'?G.bVersRoute:nom==='versRoutePlane'?G.bVersRoutePlane:nom==='rien'?G.bRien:nom.indexOf('retour')===0?REGLAGES.retourPrime:0)+(avecNitro(nom)?REGLAGES.volNitro:0);   /* les rayons joues jusqu'au bout de l'air : « libre » y veut dire jauge vide */
/* ce que vaut l'issue d'un rayon : 100 = une pose droite tout de suite ; sous 35 = on y reste.
   Une pose vaut par son AXE et par l'endroit ou la caisse sera 0,3 s apres (elle glisse dans son axe avant que le volant morde). MESURE (tour 2,
   29 decollages d'une course) : la moitie etaient des sorties EN CHAINE — revenue en travers (axe 0,5 a 1 rad : « propre » pour le jeu, qui
   tolere 55°), la caisse se posait et ressortait par l'autre bord dans la seconde. */
function vaut(r,long,v){
  if(!r)return -1;
  const t=+r.t||0;
  if(r.issue==='pose'){
    const axe=+r.axe||0,glisse=(+r.lat||0)+v.vitesse*Math.sin(cl(axe,-1.5,1.5))*REGLAGES.derive;
    /* un raccourci vaut un peu plus qu'un simple retour (au plus 12 points : jamais assez pour preferer une pose de travers) */
    return 100-G.axePoids*Math.abs(axe)-G.vTemps*t-Math.min(20,Math.max(0,Math.abs(glisse)-(v.demi-4)))-(r.propre===false?20:0)-(r.dessous?REGLAGES.dessousPose:0)+Math.min(12,Math.max(0,+r.gain||0)/40);}
  if(r.issue==='portail')return G.vPortail;
  if(r.issue==='levre')return G.vLevre-3*t;
  if(r.issue==='libre'||r.issue==='coupe'){
    if(long)return G.vLibreBase+G.vLibrePente*t;                                    /* rien avant la fin de l'air : la jauge vide suit */
    return G.vCourt-Math.min(20,(Math.abs(+r.haut||0)+Math.abs(+r.lat||0))/10);}   /* un rayon court : on ne sait pas ; mieux vaut finir pres de la route */
  return Math.min(30,5*t);                                    /* choc, air, fond : le plus tard possible */
}
const sauve=r=>!!r&&(r.issue==='pose'||r.issue==='levre'||r.issue==='portail');
/* (portage c0072, 28/11/2026) une pose propre, dessus, sous l'angle donne : ce qu'on exige des DEUX rayons pour une figure a marge large */
const poseNette=(r,axeMax)=>!!r&&r.issue==='pose'&&r.propre!==false&&!r.dessous&&Math.abs(+r.axe||0)<axeMax;
/* LE VOL. Une facon de piloter est TENUE : la main met 0,2 a 0,3 s a obeir et le vol tourne de 3 rad par seconde — changer de facon a chaque
   vue, c'est zigzaguer d'un cote a l'autre de la route jusqu'a la jauge vide (MESURE, tour 3 : deux morts « air » sur quatre courses, la caisse
   passee quatre fois au-dessus de la dalle sans s'y poser). Donc :
   · au decollage, la loi « vers la route » (la seule mesuree : 9 retours sur 10 apres une sortie par le bord) ;
   · tant que le radar dit que la facon tenue mene a une pose (ou a la levre, au portail), on n'en change pas ;
   · sinon, et pas plus souvent que toutes les 0,35 s (sauf mort annoncee dans la seconde), on prend la facon du rayon qui vaut le plus. */
function enVol(v,m){
  const R=REGLAGES,f=v.vol,Y=f.radar&&Array.isArray(f.radar.rayons)?f.radar.rayons:null;
  if(CONTROLE_RAYONS&&Y&&typeof f.radar==='object')controleRayons(f);   /* les yeux ont-ils change ? (leve « YEUX CHANGES ») */
  /* sorti expres : la facon que le radar a promise au sol ; sinon la loi « vers la route » */
  if(!m.facon){m.facon=m.sortie&&FACONS[m.sortie.facon]?m.sortie.facon:'versRoute';m.tFacon=v.t;m.voulu=!!m.sortie;m.cible=m.sortie&&m.sortie.cible!=null?m.sortie.cible:null;m.sortie=null;m.nFigVol=0;m.tGeste=null;m.choix=false;
    /* (28/11/2026, lot « genes v4 ») la sortie preparee (§ 3.1) : annoncee au sol depuis moins de 0,35 s et sans raccourci voulu, le vol part en
       « plane » ; le choix du depart est fait (m.choix) : il ne repart pas en plein vol. Puis la memoire de rienOn (§ 3.2) et de secoursOn (§ 3.4). */
    if(R.sortieOn>0){if(!m.voulu&&m.planeBord!=null&&v.t-m.planeBord<.35){m.facon='plane';m.choix=true;
        /* COMPTEURS : ici (sortieOn.vol ; et m.cSortie=v.t pour sortieOn.pose, § 4.3) */
        if(COMPTE){try{tic('sortieOn.vol');m.cSortie=v.t;}catch(e){}}}
      m.planeBord=null;}
    if(R.rienOn>0){m.rienVu=null;m.rienFait=null;}
    if(R.secoursOn>0)m.secoursVol=false;
    /* les gestes (27/11/2026) : remis a zero au decollage, seulement s'ils sont allumes (eteints, la memoire ne change pas) */
    if(R.coupOn>0){m.nCoupVol=0;m.coupFin=null;m.tCoup=null;m.nitroAvant=false;}
    /* GESTE 4 : la nitro est TENUE au decollage si elle a ete demandee au sol dans les 0,35 s d'avant (un ordre met 0,2 s a partir : la caisse
       decolle nitro allumee meme si la derniere vue au sol l'avait coupee, au bord ; essai du 27/11 : la derniere vue seule ne la voit jamais) */
    if(R.relacheOn>0)m.nitroDecol=m.tNitroSol!=null&&v.t-m.tNitroSol<.35;   /* < 0,35 : les vues sont a 0,1 s, et 12,4 − 12,1 vaut 0,3000…07 */
    if(R.lacheOn>0)m.tContactAbs=null;}
  let tenuPose=null;
  /* COMPTEURS : ici (sortieOn.pose : m.cSortie=v.t a chaque vue de vol tant qu'il n'est pas nul, § 4.3) */
  if(COMPTE){try{if(R.sortieOn>0&&m.cSortie!=null)m.cSortie=v.t;}catch(e){}}
  if(Y){
    /* (28/11/2026, lot « genes v4 ») LA LOI FIDELE (§ 3.3) : son rayon, s'il est la ; partout ou le pilote juge le rayon « vers la route », il juge
       celui-la (sinon, repli sur le rayon du radar, comme avant). Eteinte : null, rien ne change. */
    const rFid=R.loiFidele>0?Y.find(x=>x&&x.m==='retour'+I_FIDELE)||null:null;
    /* LE CHOIX DU DEPART (faire-pR.js, 27/11) : a la premiere vue qui porte un radar, la loi de retour dont le rayon vaut le plus — au lieu de « vers la
       route » d'office. Seulement si des lois « retour » sont demandees. */
    if(!m.choix&&R.retours.length&&estRetour(m.facon)){m.choix=true;
      let b9=null,s9=-99;
      for(const nom of RETOURS){
        if(nom.indexOf('retour')===0&&+nom.slice(6)>=R.retours.length)continue;   /* (27/11, gestes) les rayons du coup de nitro ne sont pas des facons ; coup eteint, ces rayons n'existent pas */
        const ry=(rFid&&nom==='versRoute')?rFid:Y.find(x=>x&&x.m===nom);if(!ry)continue;const s=vaut(ry,true,v)+prime(nom)+teteRayon(ry,nom,v,m);if(s>s9){s9=s;b9=nom;}}
      /* COMPTEURS : ici (retourOn, garde R.retours.length>0 : la facon change a la ligne suivante) */
      if(COMPTE){try{if(R.retours.length>0&&b9&&b9!==m.facon)tic('retourOn');}catch(e){}}
      if(b9&&b9!==m.facon){m.facon=b9;m.tFacon=v.t;}}
    const tenu=Y.find(x=>x&&x.m==='tenu'),depuis=v.t-m.tFacon,loi=estRetour(m.facon)||m.facon.indexOf('viser')===0;
    /* le rayon d'une facon : pour « viser », celui de MA cible si j'en tiens une */
    const rayonDe=nom=>(rFid&&nom==='versRoute')?rFid:Y.find(x=>x&&x.m===nom&&(nom.indexOf('viser')!==0||m.cible==null||nom!==m.facon||x.cible===Math.round(m.cible)));   /* loiFidele : versRoute -> le rayon fidele */
    /* ce que dit le radar de la facon tenue : son propre rayon, et une fois les doigts dessus depuis une reaction, le rayon `tenu` (MESURE : juste
       49 fois sur 50) — sauf pour les lois « vers la route », dont l'ordre change a chaque vue : `tenu` n'y dit que la vue du moment */
    let mien=!loi&&tenu&&depuis>.45?tenu:rayonDe(m.facon);
    /* COMPTEURS : ici (loiFidele.desaccord : facon versRoute, rFid et le rayon versRoute du radar presents, sauve(l'un) different de sauve(l'autre)) */
    if(COMPTE){try{if(R.loiFidele>0&&rFid&&m.facon==='versRoute'){const r9=Y.find(x=>x&&x.m==='versRoute');if(r9&&sauve(rFid)!==sauve(r9))tic('loiFidele.desaccord');}}catch(e){}}
    /* EN PLONGEON, ON TIENT SA CIBLE. MESURE (nuages 910074) : le rayon d'un plongeon annonce « pose » neuf vues sur dix et « air » la dixieme (la
       main obeit avec 0,2 s de retard, le rayon n'en sait que la moyenne) ; changer de facon a la premiere mauvaise vue, c'etait abandonner la cible a
       150 m au-dessus d'elle. Donc : si l'autre rayon vers la MEME cible (avec ou sans reacteur) se pose, on le prend ; sinon on attend trois
       mauvaises vues de suite (0,3 s) avant de chercher ailleurs — sauf decor annonce dans la seconde. */
    m.mal=sauve(mien)?0:(m.mal|0)+1;
    if(!sauve(mien)&&m.facon.indexOf('viser')===0){
      const autre=m.facon==='viser'?'viserPlane':'viser',ra=Y.find(x=>x&&x.m===autre&&(m.cible==null||x.cible===Math.round(m.cible)));
      if(sauve(ra)){m.facon=autre;m.tFacon=v.t;m.mal=0;mien=ra;}}
    const patience=m.facon.indexOf('viser')===0&&m.mal<3&&!(mien&&mien.issue==='choc'&&(+mien.t||0)<1.2),sMien=vaut(mien,true,v)+teteRayon(mien,m.facon,v,m);
    if(mien&&mien.issue==='pose'&&mien.propre!==false)tenuPose=mien;
    /* FUIR LE DESSOUS : la facon tenue se pose, mais sous la dalle — on cherche un rayon qui se pose dessus */
    const fuit=R.dessousFuir>0&&!!mien&&mien.issue==='pose'&&!!mien.dessous;
    /* POUR MIEUX (faire-pR.js) : la loi tenue se pose, mais une autre loi de retour se pose bien mieux (plus droit, plus tot, sans ressortir) */
    const pourMieux=R.volMieux>0&&sauve(mien)&&!fuit&&estRetour(m.facon)&&depuis>R.tenirFacon;
    /* PORTAGE c0026 (28/11/2026, R.fuirVite ; recopie de c0026-pilote.js) — EXCEPTION (dessous) : si la facon tenue mene a une pose SOUS la dalle et
       qu'un autre rayon se pose propre DESSUS, on change tout de suite (sans attendre tenirFacon). fuirVite eteint : la condition de pilote-voltige. */
    /* COMPTEURS : ici (fuirVite et volMieux : la condition ci-dessous refaite sans leur terme, en locales ; ils comptent si la facon change l.421) */
    if(COMPTE){try{AV=null;if(R.fuirVite>0||R.volMieux>0){const tot=mien&&(+mien.t||0)<1;
      AV={f:m.facon,sansFuir:pourMieux||((!sauve(mien)||fuit)&&!patience&&(depuis>R.tenirFacon||tot)),
        sansMieux:(!sauve(mien)||fuit)&&!patience&&(depuis>R.tenirFacon||(R.fuirVite>0&&fuit)||tot)};}}catch(e){}}
    if(pourMieux||((!sauve(mien)||fuit)&&!patience&&(depuis>R.tenirFacon||(R.fuirVite>0&&fuit)||(mien&&(+mien.t||0)<1)))){
      let mieux=null,sMieux=-9,cibleMieux=null;
      for(const nom in FACONS){
        if(nom===m.facon)continue;
        if(nom.indexOf('retour')===0&&+nom.slice(6)>=R.retours.length)continue;   /* une loi « retour » que les yeux ne jouent pas : pas de rayon */
        /* en vol SUBI on ne se met pas a viser un morceau lointain : on revient. MESURE (26/11, 12 courses, memes graines) : avec cette bascule, des vols
           subis de 6 s finissaient jauge vide ou contre la roche (grotte 910148 : 106 s de course au lieu de 289) */
        if(!m.voulu&&nom.indexOf('viser')===0)continue;
        /* a issue egale : la loi vers la route d'abord, et sans nitro (un vol sans reacteur rend de la jauge) */
        const ry=rayonDe(nom);
        if((fuit||pourMieux)&&!(ry&&ry.issue==='pose'&&ry.propre!==false&&!ry.dessous))continue;
        if(pourMieux&&!estRetour(nom))continue;
        const s=vaut(ry,!!LONGS[nom],v)+prime(nom)+teteRayon(ry,nom,v,m);
        if(s>sMieux){sMieux=s;mieux=nom;cibleMieux=ry&&typeof ry.cible==='number'?ry.cible:null;}}
      if(mieux&&sMieux>sMien+(fuit?4:R.bascule)){m.facon=mieux;m.tFacon=v.t;m.cible=mieux.indexOf('viser')===0?cibleMieux:null;}}
    /* compteurs fuirVite et volMieux : la bascule a change la facon, et sans leur terme elle ne se serait pas posee la question */
    if(COMPTE){try{if(AV&&m.facon!==AV.f){if(R.fuirVite>0&&!AV.sansFuir)tic('fuirVite');if(R.volMieux>0&&!AV.sansMieux)tic('volMieux');}}catch(e){}AV=null;}
    /* ===== GENE V4 — LA BASCULE VERS « RIEN » (28/11/2026, lot « genes v4 » ; notes/genes-v4.md § 3.2) =====
       La facon tenue est une loi de retour, tenue depuis plus de tenirFacon s (relu APRES la bascule), son rayon se pose, et le rayon « rien » se pose
       propre, dessus, plus droit d'au moins rienEcart rad : deux vues de suite (m.rienVu), une fois par vol (m.rienFait), on lache le volant.
       Les figures, largeOn et suitOn jugent ensuite sur la pose de « rien » (tenuPose) ; un coup de nitro lance s'arrete. volMieux n'est pas touche. */
    /* (28/11, le relecteur « semantique ») DEUX VUES DE SUITE pour de vrai : une vue ou la regle n'est pas evaluee (la bascule vient de changer de
       facon, tenirFacon pas encore passe) efface m.rienVu. Sans cela (tenirFacon 0,1, mesure sur une suite finie) : rienVu pose sur versRoute a 30,1,
       la bascule prend versRoutePlane a 30,2, et « rien » partait a 30,3 sur une seule vue de la facon tenue. Eteint : rien n'est lu ni ecrit. */
    if(R.rienOn>0){if(m.facon!=='rien'&&estRetour(m.facon)&&v.t-m.tFacon>R.tenirFacon){const q=rayonDe(m.facon),r0=rayonDe('rien');
      const ok=!m.rienFait&&!!q&&q.issue==='pose'&&!!r0&&r0.issue==='pose'&&r0.propre!==false&&!r0.dessous&&Math.abs(+r0.axe||0)+R.rienEcart<=Math.abs(+q.axe||0);
      if(ok&&m.rienVu!=null&&v.t-m.rienVu<=.25){m.facon='rien';m.tFacon=v.t;m.cible=null;m.rienVu=null;m.rienFait=true;tenuPose=r0;if(R.coupOn>0)m.coupFin=null;
        /* COMPTEURS : ici (rienOn : la facon vient de passer a « rien ») */
        if(COMPTE){try{tic('rienOn');}catch(e){}}}
      else m.rienVu=ok?v.t:null;}
      else m.rienVu=null;}
    /* ===== GENE V4 — LES SECOURS EN VOL (28/11/2026, lot « genes v4 » ; notes/genes-v4.md § 3.4) =====
       Hors patience de plongeon, la facon tenue ne sauve pas, et toutes les facons LONGUES presentes (memes sauts que la bascule ; un rayon absent est
       saute) annoncent une mort (choc, air, fond ; un long « libre » bloque) : parmi les lois de secours (retour<I_SECOURS..>), celle qui se pose
       propre, dessus, et vaut le plus (vaut seul : ni prime, ni tete). Les facons courtes ne comptent pas (un court « libre » ne dit rien de la suite). */
    if(R.secoursOn>0&&N_SECOURS>0&&!(m.facon.indexOf('viser')===0&&m.mal<3)&&!sauve(rayonDe(m.facon))){
      let longs=0,meurent=true;
      for(const nom in LONGS){
        if(nom.indexOf('retour')===0&&+nom.slice(6)>=R.retours.length)continue;
        if(!m.voulu&&nom.indexOf('viser')===0)continue;
        const ry=rayonDe(nom);if(!ry)continue;longs++;
        if(!(ry.issue==='choc'||ry.issue==='air'||ry.issue==='fond')){meurent=false;break;}}
      if(longs>0&&meurent){let pris=null,ryPris=null,sPris=-1e9;
        for(let k=I_SECOURS;k<I_SECOURS+N_SECOURS;k++){const nom='retour'+k;if(nom===m.facon)continue;
          const ry=Y.find(x=>x&&x.m===nom);
          if(ry&&ry.issue==='pose'&&ry.propre!==false&&!ry.dessous){const s=vaut(ry,true,v);if(s>sPris){sPris=s;pris=nom;ryPris=ry;}}}
        if(pris){m.facon=pris;m.tFacon=v.t;m.cible=null;m.secoursVol=true;tenuPose=ryPris;if(R.coupOn>0)m.coupFin=null;
          /* COMPTEURS : ici (secoursOn : la facon vient de passer a un secours) */
          if(COMPTE){try{tic('secoursOn');}catch(e){}}}}}
    /* GESTE 1 (voir plus bas) : l'instant du contact annonce par le rayon de la facon tenue (apres une bascule : celui de la nouvelle facon) — une
       pose SUR la dalle seulement (le verificateur : pas pour une levre ni dessous, qui ont besoin du cap vers l'interieur) */
    if(R.lacheOn>0){const q=rayonDe(m.facon);m.tContactAbs=q&&q.issue==='pose'&&!q.dessous?v.t+(+q.t||0):null;}
  }
  else if(R.rienOn>0)m.rienVu=null;   /* (28/11, le relecteur « semantique ») une vue sans radar casse aussi les deux vues de suite de rienOn */
  const o=FACONS[m.facon](v,m);
  /* (28/11/2026, lot « genes v4 ») LA LOI FIDELE SUIVIE (loiFidele 2, § 3.3) : en « vers la route », le volant et le manche sont ceux de la loi que les
     yeux jouent (vue.vol.retours[I_FIDELE]) ; FACONS.versRoute a ete appele quand meme (il tient m.pv) ; la nitro reste la sienne ; sans commande : repli. */
  if(R.loiFidele>1&&m.facon==='versRoute'){const c=Array.isArray(f.retours)?f.retours[I_FIDELE]:null;
    if(c){
      /* COMPTEURS : ici (loiFidele.suit : c.volant ou c.manche differe de o.volant ou o.manche, a lire avant la ligne suivante) */
      if(COMPTE){try{if(c.volant!==o.volant||c.manche!==o.manche)tic('loiFidele.suit');}catch(e){}}
      o.volant=c.volant;o.manche=c.manche;}}
  /* GESTE 1 — LES MAINS LACHEES AVANT LE CONTACT (27/11/2026, tache « gestes » ; PROPOSITIONS.md, enquete 2) : la main obeit 0,11 a 0,38 s plus
     tard ; un ordre de volant donne a moins de lacheAvant s du contact agit donc au sol, dans la glisse. Les joueurs : |volant| 0,00 dans la
     demi-seconde avant la pose ; le bot : 0,31 a 0,48. Seulement pour la loi « vers la route » (pas les plongeons viser). */
  /* COMPTEURS : ici (lacheOn : o.volant n'etait pas 0, a lire avant la ligne suivante) */
  if(COMPTE){try{if(R.lacheOn>0&&(m.facon==='versRoute'||m.facon==='versRoutePlane')&&m.tContactAbs!=null&&m.tContactAbs-v.t<=R.lacheAvant&&o.volant!==0)tic('lacheOn');}catch(e){}}
  if(R.lacheOn>0&&(m.facon==='versRoute'||m.facon==='versRoutePlane')&&m.tContactAbs!=null&&m.tContactAbs-v.t<=R.lacheAvant)o.volant=0;
  /* GESTE 4 — LE RELACHE APRES LE DECOLLAGE (27/11/2026, tache « gestes » ; PROPOSITIONS.md, enquete 4) : la nitro tenue au decollage
     (m.nitroDecol, d'apres m.tNitroSol ecrit par decide) reste tenue jusqu'a relacheT s de vol, puis lachee (le pilote la lachait des la premiere vue, 0,09 s ; les
     joueurs a 0,29 s). Le jeu arme le coup au decollage et ne le donne qu'au re-appui : le relache rend le premier coup possible. */
  /* COMPTEURS : ici (relacheOn : le bloc de la ligne suivante s'execute) */
  if(COMPTE){try{if(R.relacheOn>0&&m.nitroDecol&&!o.nitro&&(+f.t||0)<R.relacheT)tic('relacheOn');}catch(e){}}
  if(R.relacheOn>0&&m.nitroDecol&&!o.nitro&&(+f.t||0)<R.relacheT)o.nitro=true;
  /* LES FIGURES. MESURE (joueurs au clavier) : 2,8 figures lancees par minute, toutes en vol ; 18 % des vols en ont, 1,9 par vol a figure (5 au
     plus), la premiere 0,56 s apres le decollage, dans des vols de 2,8 s. On en lance une quand la facon tenue mene a une pose propre dans plus de
     figTemps secondes, que la jauge la paie et que le reacteur ne sert pas (tenir la NITRO redresse la figure). La direction : avant, arriere en
     alternance (↑ pique, ↓ cabre : 0,2 rad sur le geste) ; de cote seulement du cote ou le vol braque deja (la fleche tient 0,27 s : 0,8 rad). */
  const M=v.main||{},jauge=(v.nitro||0)+(v.reserve||0),enCours=f.figure?(f.figure.enCours|0):0;
  /* PORTAGE c0072 (28/11/2026, R.largeOn ; recopie de c0072-pilote.js, largeHaut 4 chez c0101) — LA MARGE LARGE (maps sans decor, vol subi) : le
     parent exige figHaut (15 m) de haut, que la loi « vers la route » (qui pique des 10 m) ne laisse presque jamais. A la place, on regarde ce qui
     compte : la facon tenue ET sa jumelle au reacteur se posent toutes deux, propres, dessus, droites ; la pose est lointaine (largeT1 pour la 1re
     figure : le seuil mesure sur) ; il reste de l'air a la pose. Un tel vol peut porter jusqu'a largeMax figures.
     largeOn eteint : large reste faux, nMax = figMax et le seuil de temps sont ceux du parent, la condition est celle de pilote-voltige. */
  const parentOk=!!m.voulu||!!(f.proche&&f.proche.haut>R.figHaut&&!DECOR[v.carte]);
  let large=false;
  if(R.largeOn>0&&!parentOk&&tenuPose&&Y&&!DECOR[v.carte]&&m.facon==='versRoute'&&f.proche&&f.proche.haut>R.largeHaut){
    const jum=Y.find(x=>x&&x.m==='versRoutePlane');
    large=poseNette(tenuPose,R.largeAxe)&&poseNette(jum,R.largeAxe)&&(!f.air||f.air.reste>(+tenuPose.t||0)+R.largeAir)&&(tenuPose.air==null||tenuPose.air>=R.largeAir);}
  const nMax=parentOk?R.figMax:R.largeMax;
  const tSeuil=m.voulu?R.figPlongeon:parentOk?R.figTemps:((m.nFigVol|0)>0?R.largeT2:R.largeT1);
  if(tenuPose&&!o.nitro&&!M.geste&&(m.nFigVol|0)<nMax&&enCours<2&&(jauge>=R.figJauge||v.nitroLibre)
     &&(+tenuPose.t||0)>=tSeuil&&(m.tGeste==null||v.t-m.tGeste>=R.figEcart)&&(!f.air||f.air.reste>(+tenuPose.t||0)+.8)
     &&f.t>=R.figDepuis&&!(f.bumps>0)&&(parentOk||large)&&!(R.secoursOn>0&&m.secoursVol)){   /* (genes v4) pas de figure pendant un vol de secours */
    /* COMPTEURS : ici (largeOn : une figure part avec parentOk faux) */
    if(COMPTE){try{if(R.largeOn>0&&!parentOk)tic('largeOn');}catch(e){}}
    /* LA DIRECTION DU GESTE EST CELLE QUE LE VOL DEMANDE DEJA. Le geste tient sa fleche 0,27 s : ↑ pique, ↓ cabre, ← → braquent (jusqu'a 0,8 rad).
       MESURE (26/11, 12 courses) : avec une direction prise en alternance, 5 plongeons voulus sur 23 finissaient mal (3 contre un pic de la jade) ;
       sans aucune figure, 2 sur 30. La fleche du geste est donc celle que la loi du vol tient a cet instant ; si elle n'en tient aucune : avant
       ou arriere, en alternance. */
    const n=m.nFig|0;
    o.geste='figure';o.direction=o.manche<0?'avant':o.manche>0?'arriere':o.volant>.5?'gauche':o.volant<-.5?'droite':(n%2?'arriere':'avant');
    m.nFig=n+1;m.nFigVol=(m.nFigVol|0)+1;m.tGeste=v.t;}
  /* GESTE 3 — LE COUP DE NITRO VU, VERSION SERREE (27/11/2026, tache « gestes » ; PROPOSITIONS.md, enquete 4 ; le bloc de faire-coup.js, recopie) :
     un coup bref (coupDuree s de NITRO) quand le rayon de la loi du pilote AVEC le coup se pose propre, sur la dalle, pas plus de travers que sans,
     pas plus pres que coupPoseMin s, avec de l'air a revendre et sans perdre plus de coupPerte m de piste — et que celui SANS coup se pose aussi.
     Resserre par le verificateur : coupDepuis 0,6 s de vol, pas sur les maps a decor (coupDecor 0), 3 coups par vol au plus.
     (relecture du 27/11) Le jeu ne donne le coup qu'au RE-APPUI : pas de coup quand la nitro est deja demandee a cette vue (le relache, geste 4) ni
     a la vue d'avant (m.nitroAvant) — sinon le coup partait pendant le relache, ne donnait rien, et coupEcart bloquait le vrai coup qui suivait. */
  if(R.coupOn>0){
    /* COMPTEURS : ici (coupOn : le coup en cours rend o.nitro vraie alors qu'elle etait fausse) */
    if(COMPTE){try{if(m.coupFin!=null&&v.t<m.coupFin&&!o.nitro)tic('coupOn');}catch(e){}}
    if(m.coupFin!=null&&v.t<m.coupFin)o.nitro=true;
    else if(Y&&m.facon==='versRoute'&&!o.nitro&&!m.nitroAvant&&!o.geste&&!M.geste&&enCours===0&&(R.coupDecor>0||!DECOR[v.carte])){
      const b=R.retours.length,r0=Y.find(x=>x&&x.m==='retour'+b),r1=Y.find(x=>x&&x.m==='retour'+(b+1));
      const bonne=r=>!!r&&r.issue==='pose'&&r.propre!==false&&!r.dessous;
      const air=f.air&&f.air.reste!=null?+f.air.reste:0,t1=r1?+r1.t||0:0;
      if(bonne(r0)&&bonne(r1)&&t1>=R.coupPoseMin&&Math.abs(+r1.axe||0)<=Math.max(R.coupAxe,Math.abs(+r0.axe||0)+.05)&&air>t1+R.coupAir
         &&(+r1.gain||0)>=(+r0.gain||0)-R.coupPerte
         &&(+f.t||0)>=R.coupDepuis&&(m.tCoup==null||v.t-m.tCoup>=R.coupEcart)&&(m.nCoupVol|0)<3&&(m.tGeste==null||v.t-m.tGeste>.6)
         &&(jauge>=R.coupJauge||v.nitroLibre)){
        /* COMPTEURS : ici (coupOn : o.nitro passe de faux a vrai par le coup ; coupDecor : ce coup part sur une map a decor) */
        if(COMPTE){try{tic('coupOn');if(R.coupDecor>0&&DECOR[v.carte])tic('coupDecor');}catch(e){}}
        o.nitro=true;m.coupFin=v.t+R.coupDuree;m.tCoup=v.t;m.nCoupVol=(m.nCoupVol|0)+1;}}
    m.nitroAvant=!!o.nitro;}
  if(m.cible!=null)o.cible=m.cible;   /* a la vue suivante, les rayons « viser » et vue.vol.cible portent sur MA cible */
  o.ensuite={ligne:0};   /* a la pose, la main lache la fleche du vol et reprend la route sans attendre la decision suivante */
  /* GESTE 5 (suite) : a la pose, la main vise la ou la caisse glissera (la lat de la pose annoncee + vitesse x sin(axe) x suitDerive, bornee a
     ±(demi − marge)) au lieu du milieu ; sans pose annoncee, le milieu comme avant */
  if(R.suitOn>0&&tenuPose&&!tenuPose.dessous){const bord=Math.max(0,(+v.demi||28)-R.marge);
    /* COMPTEURS : ici (suitOn.ensuite : ensuite.ligne ci-dessous n'est pas 0) */
    if(COMPTE){try{if(cl((+tenuPose.lat||0)+(+v.vitesse||0)*Math.sin(cl(+tenuPose.axe||0,-1.5,1.5))*R.suitDerive,-bord,bord)!==0)tic('suitOn.ensuite');}catch(e){}}
    o.ensuite={ligne:cl((+tenuPose.lat||0)+(+v.vitesse||0)*Math.sin(cl(+tenuPose.axe||0,-1.5,1.5))*R.suitDerive,-bord,bord)};}
  return o;
}

module.exports={
  nom:'evolution',
  profil:PROFIL,
  REGLAGES:REGLAGES,
  /* COMPTEURS : ici (decide : DECL=null en premier ; juste avant return o : if(DECL)o.declic=DECL ; § 4.1) */
  decide:function(vue,m){DECL=null;const o=vue.mode==='sol'?auSol(vue,m):vue.mode==='vol'?enVol(vue,m):{};
    if(RETOURS_DEMANDES.length&&(vue.mode==='sol'||vue.mode==='vol'))o.retours=RETOURS_DEMANDES;   /* les lois que les yeux joueront a la vue suivante (coup eteint : R.retours) */
    if(REGLAGES.relacheOn>0&&vue.mode==='sol'&&o.nitro)m.tNitroSol=vue.t;   /* GESTE 4 : la derniere vue au sol qui demandait la nitro */
    if(DECL)o.declic=DECL;   /* (genes v4) les compteurs : seulement si une regle a agi ; l'enfant lit le champ puis le retire */
    return o;}
};
