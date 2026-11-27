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
const PROFIL={
  modele:'clavier',graine:1,                 /* la main mesuree sur les joueurs au clavier (doigts.js, MAIN_CLAVIER), sans rien y ecrire par-dessus */
  chance:{prend:1,palierMin:12}              /* la seconde chance : dans les longues parties seulement (les joueurs : aux paliers 14 et 28) */
};
/*@GENOME@ debut : ecrit par ml/evolution/genome.js (ecrirePilote), genome 780adaceba8f — ne pas editer */
const REGLAGES={marge:10,bandeDecor:99,nitroDecor:1,margeCouloir:15,avance:0.3,glisse:0.12,glisseUrgence:0.3,ligneLoin:320,piecesLoin:180,capLigne:0.3,avanceCap:0.302,capAvance:0.25,braqueDoux:0.2742,braqueFort:0.5,braqueNitro:0.7,margeAllumer:0.05,margeTenir:0,jaugeAllume:0.45,jaugeCoupe:0.25,capMax:0.35,bascule:10,tenirFacon:0.35,derive:0.3,raccVirage:0.2,raccGain:79.9407,raccAxe:0.75,raccTmin:0.7,raccChute:120,raccTmax:3.6,raccAir:1.4654,raccBord:5,raccAttente:1.6,raccCartes:{jade:0,grotte:0,canyon:0},raccJumeau:{nuages:1,ville:1,jade:1},raccRepos:1.5,figPlongeon:2.2,figTemps:1.5,figJauge:0.4,figEcart:0.55,dessousMax:0.8,dessousAveugle:1,dessousDecor:2,dessousNitro:0,dessousFuir:1,dessousPose:25,departMin:1.5,departMax:5.5,portailVol:0,volDemiTour:1,volRetour:0,volAvance:0.25,figMax:2,figDepuis:0.4,figHaut:15,retourOn:0,retMarge:8,retCap:0.8,retGain:0.8,retAvance:0.15,retourPrime:4,volMieux:0,volNitro:0,retours:[]};
const G={axePoids:19.0982,vTemps:3,vPortail:94,vLevre:80,vLibreBase:12,vLibrePente:2,vCourt:34,rAxe:250,rTemps:25,rPlane:40,rLourde:40,bVersRoute:3,bVersRoutePlane:2,bRien:1};
const WV=new Float64Array([0.006783,-0.276571,0.124331,-0.086888,0.039896,-0.073796,0.030411,0.276548,0.23558,0.06362,-0.130752,-0.096439,0.066365,0.143973,-0.097319,-0.005092,-0.000367,0.311519,-0.391334,-0.010082,0.096961,-0.010544,0.182511,0.068785,-0.176444,-0.349299,-0.131872,-0.060994,-0.066791,0.016602,-0.014336,0.08055,0.106255,0.116999,-0.216092,-0.333076,-0.233521,0.240254,-0.110334,0.125319,-0.134479,0.063388,0.14364,-0.244885,0.030184,0.034432,0.018114,-0.125366,-0.064794,0.164568,0.032471,0.196282,-0.00313,-0.000588,0.257263,0.234081,0.209279,0.255108,-0.004924,0.029351,-0.097905,-0.211765,0.156061,-0.289459,-0.038394,-0.202231,-0.090365,-0.210271,0.125884,-0.223606,-0.180318,-0.229574,0.324943,-0.132755,0.036071,-0.304319,-0.166788,-0.038887,-0.177744,-0.007873,0.139979,0.249845,-0.248559,-0.109381,0.175013,0.274153,0.064529,-0.036226,-0.236386,-0.065187,0.393641,0.082066,-0.121369,-0.121519,0.044818,0.140212,0.052304,0.028707,-0.066177,0.067028,0.090249,-0.103743,0.050764,0.137736,0.184355,0.055648,-0.063503,0.014576,-0.009553,-0.32576,0.028541,-0.05136,0.161253,0.158237,0.11012,0.097255,-0.130843,0.046864,0.138763,0.14454,0.152026,0.145779,0.061158,-0.045175,-0.009661,0.120406,-0.120361,-0.007947,-0.079286,-0.138872,0.401097,0.132438,-0.28638,-0.043337,-0.231667,0.132157,0.016791,0.139086,-0.093448,0.191622,-0.349439,-0.05472,0.118045,-0.187194,-0.385879,-0.117403,0.002724,-0.012036,0.11213,0.179482,-0.20486,-0.243418,0.163128,-0.215249,0.336319,0.237865,-0.014598,0.355694,-0.069776,-0.106062,-0.059285,0.177117,-0.032036,-0.012327,0.338474,0.136723,-0.068005,-0.221057,-0.097322,0.082079,0.041006,0.395872,0.128471,0.015706,0.038292,0.073833,0.082462,-0.107312,-0.172569,-0.239298,-0.437344,-0.002854,-0.062823,-0.161118,-0.113896,0.102469,0.430782,0.098601,-0.052977,-0.091649,0.053102,-0.009047,-0.200671,0.031687,-0.067782,0.067779,-0.547669,0.204983,-0.110227,-0.001827,-0.106523,-0.195961,-0.2551,-0.006157,0.23709,-0.385923,-0.353921,0.29318,0.067426,-0.183907,0.137839,0.343052,-0.329414,-0.08862,-0.013658,0.184245,0,0,0,0,0,0]),WS=new Float64Array([0.456533,0.0006,0.305025,-0.10004,0.586858,-0.155964,-0.171331,-0.243918,0.377883,0.12955,0.168627,0.413106,0.201042,0.907698,-0.004624,-0.214577,0.214169,0.154718,-0.002319,0.436319,0.234546,-0.452299,-0.161729,-0.164107,-0.554662,-0.158519,0.109072,0.299527,-0.543184,-0.351775,-0.000264,-0.493296,0.202044,-0.061973,0.631321,0.307498,-0.054833,0.134508,-0.209417,0.297479,0.029277,-0.145933,-0.012748,0.284387,0.261722,0.107933,-0.188576,-0.191069,-0.075122,0.365613,-0.098654,0.385014,-0.275145,0.348299,-0.082748,-0.455134,0.153532,-0.162558,-0.200561,0.330283,-0.343115,0.134814,0.081475,0.249844,0.678065,0.211699,0.025422,-0.000176,0.391179,-0.115232,0.448371,-0.163987,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
const CONTROLE_RAYONS=true;
/*@GENOME@ fin*/
const cl=(v,a,b)=>v<a?a:v>b?b:v;
const cote=o=>o.latC!=null?o.latC:o.lat;     /* sous la dalle, le lat des pieces, fruits et orbes est en miroir : latC */

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
  if(ok){let n=0;while(j<noms.length&&noms[j]==='retour'+n){n++;j++;}if(j!==noms.length||n>REGLAGES.retours.length)ok=false;}
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
        const j=X.rayons.find(q=>q&&q!==r&&q.cible===r.cible&&(q.m==='viser'||q.m==='viserPlane'));
        if(!j||j.issue!=='pose')continue;}
      /* ce que vaut la sortie : la piste gagnee, moins l'angle d'arrivee, la duree, le reacteur (il coute de la jauge), une pose lourde */
      const s=Math.min(gain,600)-G.rAxe*axe-G.rTemps*t-(r.m==='plane'?G.rPlane:0)-(r.note==='lourde'?G.rLourde:0);
      if(!mieux||s>mieux.s)mieux={s:s,cote:nom==='gauche'?1:-1,facon:r.m,cible:typeof r.cible==='number'?r.cible:null,gain:gain,vol:t,attente:+X.t||0};}}
  return mieux;
}
/* la sortie engagee tient-elle encore ? (le cote choisi garde au moins un rayon qui sauve) */
function tientEncore(v,cote){
  const S=v.sorties,X=S&&S[cote>0?'gauche':'droite'];
  if(!X||!Array.isArray(X.rayons))return null;            /* pas de reponse cette fois : on ne sait pas */
  return X.rayons.some(r=>r&&(r.issue==='pose'||r.issue==='levre'||r.issue==='portail'));
}
function auSol(v,m){
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
  if(m.ligne==null||m.tSol==null||v.t-m.tSol>.25)m.ligne=cl(v.lat,-max,max);
  m.tSol=v.t;
  const pas=(lache?R.glisseUrgence:R.glisse)*vit*.1;
  m.ligne=cl(m.ligne+cl(cible-m.ligne,-pas,pas),-max,max);
  /* LE CAP D'AVANCE : la main vise le cap (ligne − lat) / (0,9 × vitesse). On lui donne ce cap PLUS l'avance sur le virage qui arrive :
     la caisse tourne deja vers lui quand il commence, au lieu de le decouvrir 0,15 s apres. */
  let capVoulu=cl((m.ligne-v.lat)/(.9*vit),-R.capLigne,R.capLigne)+cl((lTot-lIci)*R.avanceCap,-R.capAvance,R.capAvance);
  if(v.lat>max)capVoulu=Math.min(capVoulu,-.05);else if(v.lat<-max)capVoulu=Math.max(capVoulu,.05);   /* jamais vers le bord quand on y est */
  const ligne=v.lat+.9*vit*cl(capVoulu,-.4,.4);
  /* LA NITRO : partout ou elle ne met pas la caisse dehors. Jamais de travers, en glisse, en rebond, quand la route lache, ni dans un virage
     qui demande du volant ; sur les maps a decor, encore moins. */
  const pose=Math.abs(v.lat)<v.demi-6&&Math.abs(v.cap)<R.capMax&&!v.glisse&&!v.rebond;
  if(jauge>R.jaugeAllume)m.plein=true;else if(jauge<R.jaugeCoupe)m.plein=false;
  const k=decor?R.nitroDecor:1,seuil=(m.nitro?R.braqueNitro:R.braqueNitro-.1)*k*kSeuil;
  const sur=margeV>(m.nitro?R.margeTenir:R.margeAllumer)&&Math.max(force,Math.abs(lIci)/lmax)<seuil;
  m.nitro=!lache&&pose&&sur&&(v.nitroLibre||!!m.plein);
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
    if(c9&&q9.att<=4){m.vu=null;m.sortie={cote:c9,facon:'versRoute',cible:null,gain:0,attente:q9.att,t0:v.t,dessous:true};
      return {volant:c9,nitro:m.nitro||R.dessousNitro>0,ensuite:{volant:0},regarder:'sorties'};}}
  if(regarde&&!lache&&!(m.tAbandon!=null&&v.t-m.tAbandon<R.raccRepos)){
    const rc=raccourci(v,sortir,kGain);
    /* LA PROMESSE DOIT TENIR DEUX VUES DE SUITE (0,1 s) du meme cote avant qu'on s'engage : un rayon du sol qui dit « pose » une vue sur deux
       est une pose qui ne tient a rien */
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
  if(!m.facon){m.facon=m.sortie&&FACONS[m.sortie.facon]?m.sortie.facon:'versRoute';m.tFacon=v.t;m.voulu=!!m.sortie;m.cible=m.sortie&&m.sortie.cible!=null?m.sortie.cible:null;m.sortie=null;m.nFigVol=0;m.tGeste=null;m.choix=false;}
  let tenuPose=null;
  if(Y){
    /* LE CHOIX DU DEPART (faire-pR.js, 27/11) : a la premiere vue qui porte un radar, la loi de retour dont le rayon vaut le plus — au lieu de « vers la
       route » d'office. Seulement si des lois « retour » sont demandees. */
    if(!m.choix&&R.retours.length&&estRetour(m.facon)){m.choix=true;
      let b9=null,s9=-99;
      for(const nom of RETOURS){const ry=Y.find(x=>x&&x.m===nom);if(!ry)continue;const s=vaut(ry,true,v)+prime(nom)+teteRayon(ry,nom,v,m);if(s>s9){s9=s;b9=nom;}}
      if(b9&&b9!==m.facon){m.facon=b9;m.tFacon=v.t;}}
    const tenu=Y.find(x=>x&&x.m==='tenu'),depuis=v.t-m.tFacon,loi=estRetour(m.facon)||m.facon.indexOf('viser')===0;
    /* le rayon d'une facon : pour « viser », celui de MA cible si j'en tiens une */
    const rayonDe=nom=>Y.find(x=>x&&x.m===nom&&(nom.indexOf('viser')!==0||m.cible==null||nom!==m.facon||x.cible===Math.round(m.cible)));
    /* ce que dit le radar de la facon tenue : son propre rayon, et une fois les doigts dessus depuis une reaction, le rayon `tenu` (MESURE : juste
       49 fois sur 50) — sauf pour les lois « vers la route », dont l'ordre change a chaque vue : `tenu` n'y dit que la vue du moment */
    let mien=!loi&&tenu&&depuis>.45?tenu:rayonDe(m.facon);
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
    if(pourMieux||((!sauve(mien)||fuit)&&!patience&&(depuis>R.tenirFacon||(mien&&(+mien.t||0)<1)))){
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
  }
  const o=FACONS[m.facon](v,m);
  /* LES FIGURES. MESURE (joueurs au clavier) : 2,8 figures lancees par minute, toutes en vol ; 18 % des vols en ont, 1,9 par vol a figure (5 au
     plus), la premiere 0,56 s apres le decollage, dans des vols de 2,8 s. On en lance une quand la facon tenue mene a une pose propre dans plus de
     figTemps secondes, que la jauge la paie et que le reacteur ne sert pas (tenir la NITRO redresse la figure). La direction : avant, arriere en
     alternance (↑ pique, ↓ cabre : 0,2 rad sur le geste) ; de cote seulement du cote ou le vol braque deja (la fleche tient 0,27 s : 0,8 rad). */
  const M=v.main||{},jauge=(v.nitro||0)+(v.reserve||0),enCours=f.figure?(f.figure.enCours|0):0;
  if(tenuPose&&!o.nitro&&!M.geste&&(m.nFigVol|0)<R.figMax&&enCours<2&&(jauge>=R.figJauge||v.nitroLibre)
     &&(+tenuPose.t||0)>=(m.voulu?R.figPlongeon:R.figTemps)&&(m.tGeste==null||v.t-m.tGeste>=R.figEcart)&&(!f.air||f.air.reste>(+tenuPose.t||0)+.8)
     &&f.t>=R.figDepuis&&!(f.bumps>0)&&(m.voulu||(f.proche&&f.proche.haut>R.figHaut&&!DECOR[v.carte]))){
    /* LA DIRECTION DU GESTE EST CELLE QUE LE VOL DEMANDE DEJA. Le geste tient sa fleche 0,27 s : ↑ pique, ↓ cabre, ← → braquent (jusqu'a 0,8 rad).
       MESURE (26/11, 12 courses) : avec une direction prise en alternance, 5 plongeons voulus sur 23 finissaient mal (3 contre un pic de la jade) ;
       sans aucune figure, 2 sur 30. La fleche du geste est donc celle que la loi du vol tient a cet instant ; si elle n'en tient aucune : avant
       ou arriere, en alternance. */
    const n=m.nFig|0;
    o.geste='figure';o.direction=o.manche<0?'avant':o.manche>0?'arriere':o.volant>.5?'gauche':o.volant<-.5?'droite':(n%2?'arriere':'avant');
    m.nFig=n+1;m.nFigVol=(m.nFigVol|0)+1;m.tGeste=v.t;}
  if(m.cible!=null)o.cible=m.cible;   /* a la vue suivante, les rayons « viser » et vue.vol.cible portent sur MA cible */
  o.ensuite={ligne:0};   /* a la pose, la main lache la fleche du vol et reprend la route sans attendre la decision suivante */
  return o;
}

module.exports={
  nom:'evolution',
  profil:PROFIL,
  REGLAGES:REGLAGES,
  decide:function(vue,m){const o=vue.mode==='sol'?auSol(vue,m):vue.mode==='vol'?enVol(vue,m):{};
    if(REGLAGES.retours.length&&(vue.mode==='sol'||vue.mode==='vol'))o.retours=REGLAGES.retours;   /* les lois que les yeux joueront a la vue suivante */
    return o;}
};
