/* ===== LES DOIGTS DU BOT (2026-11-23, etape 1 BOTS-ML : « des gestes au lieu de touches — une couche "doigts" traduit en vraies
   touches, aux delais d'un humain ; le bot reste limite a ce qu'un joueur peut faire ») =====
   Le cerveau donne un ORDRE (ce qu'il veut), les doigts appuient sur les CINQ touches du clavier du jeu, rien d'autre :
     ← →  le volant (tout ou rien : un dosage se fait en tapotant, comme un joueur au clavier)
     ↑ ↓  le manche en vol (↑ pique, ↓ cabre) ; au sol ↓ freine, et drifte si le volant est tenu
     ESPACE  la NITRO ; deux appuis brefs = une figure (dans la direction tenue), au sol comme en vol
   L'ordre : { volant:-1..1 (+ = a gauche), manche:-1|0|1 (-1 pique, +1 cabre / frein), nitro:true|false,
               geste:'figure'|'saut'|'redresser', direction:'avant'|'arriere'|'gauche'|'droite' }
   Aides (traduites en volant / manche a partir de la vue) : ligne:<lat visee, m>  au sol · viser:<un troncon ou l'anneau>  en vol.
   LES LIMITES D'UNE MAIN (HUMAIN, ci-dessous) sont tenues ICI, pas dans le cerveau : aucune touche ne change plus vite, quel que soit
   le cerveau. verifier.js les controle sur le journal des touches.
   Le journal `touches` ([image, touche, 1|0]) est aussi LE REJEU : graine + map + touches = la meme course dans un processus neuf. */
const HUMAIN={
  decision:6,   /* le cerveau regarde et decide toutes les 6 images : 10 fois par seconde */
  appui:4,      /* une touche enfoncee le reste au moins 4 images (67 ms) */
  repos:4,      /* une touche relachee le reste au moins 4 images (67 ms) : au plus 7,5 appuis par seconde sur une touche */
  tap:5,        /* un appui bref du double appui : 83 ms (le jeu demande moins de 300 ms) */
  entre:5,      /* le blanc entre les deux appuis : 83 ms (2e appui 167 ms apres le debut du 1er ; le jeu demande moins de 420 ms) */
  gestes:30,    /* un geste au plus toutes les 30 images : 2 par seconde */
  seul:27       /* apres un appui bref isole, la NITRO attend 450 ms : jamais de double appui par accident */
};
const TOUCHE={G:'ArrowLeft',D:'ArrowRight',H:'ArrowUp',B:'ArrowDown',N:'Space'};
const DIR={avant:{G:0,D:0,B:0,H:0},arriere:{G:0,D:0,B:1,H:0},gauche:{G:1,D:0,B:0,H:0},droite:{G:0,D:1,B:0,H:0}};
const cl=(v,a,b)=>v<a?a:v>b?b:v;

/* LES AIDES : un ordre de haut niveau devient volant / manche. Appelees une fois par decision, avec la vue du moment. */
function traduire(o,vue){
  o=Object.assign({volant:0,manche:0,nitro:false},o||{});
  if(vue&&vue.mode==='sol'&&o.ligne!=null){
    /* TENIR UNE LIGNE (la loi du pilote de mesure du jeu, dbgAuto) : un cap vise vers la ligne, puis le volant qui tient ce cap dans le virage */
    const capVise=cl((o.ligne-vue.lat)/(Math.max(6,vue.vitesse)*.9),-.4,.4);
    o.volant=cl((vue.lacetRoute+(capVise-vue.cap)*3)/Math.max(.05,vue.lacetMax),-1,1);
  }
  if(vue&&vue.mode==='vol'&&o.viser&&typeof o.viser.gisement==='number'){
    /* VISER (un troncon, l'anneau) : tourner le vol vers lui ; cabrer s'il est trop loin pour la chute, piquer s'il est trop pres */
    const c=o.viser;o.volant=cl(c.gisement*2.2,-1,1);
    if(c.tChute!=null&&c.tTrajet!=null&&o.manche===0)o.manche=c.tTrajet>c.tChute*1.1?1:c.tTrajet<c.tChute*.8?-1:0;
  }
  o.volant=cl(+o.volant||0,-1,1);o.manche=o.manche>0?1:o.manche<0?-1:0;o.nitro=!!o.nitro;
  return o;
}

/* ===== LES DOIGTS V2 : UNE MAIN PAR CERVEAU (2026-11-24, Sacha : « des bots du palier 1 au palier 30 qu'on ne distingue pas de vrais joueurs ») =====
   Un cerveau peut poser un `profil` a cote de `decide` (module.exports={nom, profil, decide}) : il regle SA main. Sans profil, ou avec un profil
   dont tout est au defaut, RIEN ne change : `Doigts.P` vaut null, `ordre()` et `image()` executent les lignes d'avant, sans un tirage ni une lecture
   de plus (verifier.js : l'empreinte a7b3171768ca). Tout le neuf est dans `ordreV2` / `imageV2` :
     · LE TEMPS DE REACTION : un ordre qui CHANGE n'atteint la main qu'apres un delai tire (volant, manche et drift, nitro, geste) ;
     · LE SUIVI : avec `ligne` (au sol) ou `viser` (en vol), le volant est recalcule a CHAQUE image sur l'etat du jeu, pas 10 fois par seconde ;
     · LES COUPS : le volant par appuis de durees irregulieres (les durees mesurees sur les joueurs), au lieu du battement regulier d'avant ;
     · LA NITRO HACHEE au sol (tenues et pauses tirees) ;
     · LE DRIFT, un ordre a part (`drift:+1|-1`) : la fleche d'abord, ↓ ensuite ; a la fin ↓ est lache d'abord, la fleche
       ensuite (a la meme image pour une main sans coups, un repos plus tard pour une main a coups) ;
     · (relecture) `ensuite` dans l'ordre : le volant du mode d'apres (la pose, le decollage), applique des que la main voit le mode changer ;
     · LA SECONDE CHANCE : la main touche la plaque CONTINUER comme un joueur (c'est le profil qui decide, pas `decide`) ;
     · LES ERREURS : appui manque, reaction en retard, appui trop long, bruit, appui parasite.
   Les limites d'une main (HUMAIN) restent tenues par `veut` : un profil peut ralentir la main, jamais l'accelerer. (2026-11-25, relecture) Le
   suivi aussi : il lit l'etat du jeu vieux d'au moins 6 images (`suivi.retard`, plancher HUMAIN.decision), jamais plus frais qu'une decision.
   MEME GRAINE = MEME COURSE : le hasard de la main sort d'un generateur a graine (la graine de la course + celle du profil), un flux par usage,
   un tirage par EVENEMENT (un ordre qui change, un appui, une mort), jamais par image. Aucune horloge, aucun hasard de l'hote, aucune fonction
   transcendante : les durees sortent de tables de quantiles [p10, p50, p90] lues en ligne droite (+ − × ÷). Le journal des touches suffit au rejeu. */
/* LE HASARD A GRAINE : le generateur du jeu (ml/reel/sim-env-reel.js) et du temoin de discerner.js ; graineDe = un texte → une graine */
function hasard(a){a|=0;return function(){a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function graineDe(txt){let h=0x811c9dc5;for(let i=0;i<txt.length;i++){h^=txt.charCodeAt(i);h=Math.imul(h,0x01000193);}return h|0;}
/* une loi = 5 points [mini, p10, p50, p90, maxi] ; u dans [0,1[ → la valeur, en ligne droite entre deux points */
const QX=[0,.1,.5,.9,1],EXPO=[0,.0947,.6248,2.0763,4.147]; /* EXPO : les quantiles d'une loi exponentielle (l'ecart entre deux appuis parasites), divises
   par la moyenne de leur ligne droite (1,109) : lue ainsi, la table a une moyenne de 1 (2026-11-25, relecture : avant 1,11, soit 10 % d'embardees de moins) */
function quantile(q,u){for(let k=1;k<5;k++)if(u<=QX[k])return q[k-1]+(q[k]-q[k-1])*(u-QX[k-1])/(QX[k]-QX[k-1]);return q[4];}
function tirer(q,u){return Math.round(quantile(q,u));}
const FLUX=['reaction','volant','nitro','geste','erreur','chance'];
const PI=3.141592653589793;
const angle=a=>{if(!(a-a===0))return 0;while(a>PI)a-=2*PI;while(a<-PI)a+=2*PI;return a;};

/* ===== LE PROFIL (2026-11-24, doigts v2) =====
   Les durees s'ecrivent en MILLISECONDES : un nombre seul (une constante) ou [p10, p50, p90] ; elles deviennent des images (ms × 0,06, arrondi).
   Chaque champ a son defaut (= la main d'avant) et ses bornes : une valeur hors bornes y est RAMENEE, un champ inconnu ou d'un mauvais type
   LEVE une erreur (le cerveau est refuse au chargement). `modele` donne le point de depart, les champs ecrits l'ecrasent.
   Les plages mesurees viennent de ml/ecurie/etude/humains.md (14 parties, 2 joueurs) ; le temps de reaction n'y est PAS mesure (l'etalon est
   a 10 echantillons par seconde) : les valeurs de `clavier` sont des ordres de grandeur, a regler par le juge (etapes D et E). */
const IMG=.06;
const DEFAUT={
  reaction:{volant:0,nitro:0,manche:0,geste:0},
  suivi:{actif:false,retard:0},
  coups:{actif:false,duree:[100,200,400],repos:[70,110,200],inversion:null,seuil:.5,plein:.92,mort:.08,contre:.5},
  nitro:{tenue:null,pause:[130,220,500]},
  geste:{tap:83,entre:83},
  drift:{avance:33},
  chance:{prend:0,palierMin:1,delai:[900,1500,3000]},
  erreur:{manque:0,retard:0,retardK:2.5,sur:0,surK:[1.5,2.5],bruit:0,parasite:0}};
/* d : une duree · d? : une duree ou null · ms : un delai fixe · n : un nombre · e : un entier · b : vrai ou faux · nn : [mini, maxi] */
const REGLES={
  reaction:{volant:['d',0,1000],nitro:['d',0,1000],manche:['d',0,1000],geste:['d',0,1000]},
  suivi:{actif:['b'],retard:['ms',0,500]},
  coups:{actif:['b'],duree:['d',67,1500],repos:['d',67,1000],inversion:['d?',33,1000],seuil:['n',.2,1.5],plein:['n',.5,1],mort:['n',0,.4],contre:['n',.1,1]},
  nitro:{tenue:['d?',67,30000],pause:['d',67,2000]},
  geste:{tap:['d',67,233],entre:['d',67,167]},
  drift:{avance:['d',33,200]},
  chance:{prend:['n',0,1],palierMin:['e',1,30],delai:['d',600,4500]},
  erreur:{manque:['n',0,.5],retard:['n',0,.5],retardK:['n',1,5],sur:['n',0,.5],surK:['nn',1,3],bruit:['n',0,.5],parasite:['n',0,20]}};
/* LES MODELES. machine : la main d'avant. clavier : Sacha. doigt : Leo (4 parties seulement : PROVISOIRE).
   (2026-11-25, relecture et reglage mesure, Sacha : « des bots qu'on ne distingue pas de vrais joueurs ») Les valeurs d'avant venaient de la trace
   LISSEE du volant (|steer| > 0,3, qui reste au-dessus du seuil 2 a 3 images apres le relache) et de la flamme de nitro melee sol et vol. Celles-ci :
     · coups (duree, repos, seuil) et suivi.retard : partis des VRAIS appuis des joueurs, reconstruits du volant lisse (clavier p10 77 · p50 153 ·
       p90 347 ms), puis REGLES sur la mesure d'appuis.js (essai-main.js, 8 courses, version allegee, 120 s ; README § 3.8). MESURE le 25/11 :
       clavier 99,9 coups par minute de sol (joueurs 101,6), duree lue p50 0,20 s (0,22), changements de sens 0,89 par seconde (1,24 : ce dernier
       ne bouge ni avec le retard du suivi ni avec les erreurs — il tient a la trajectoire du cerveau) ; doigt 93,9 coups (Leo 88,8), p50 0,24 s
       (0,22), sens 0,84 (1,12). Avant ce reglage : 80 coups, p50 0,30 s, sens 0,83. Le retard du suivi (150 ms) n'est PAS mesure ;
     · coups.inversion : apres un coup, la fleche d'EN FACE n'attend pas le repos de la touche lachee (deux doigts, deux touches) : un blanc a elle,
       plus court (les joueurs : 68 % des appuis successifs changent de cote, l'autre fleche part souvent dans les 100 ms) ;
     · nitro.tenue AU SOL : la flamme des joueurs au clavier est allumee 76 % du sol, 16 allumages par minute, tenues p10 0,32 · p50 0,97 ·
       p90 4,1 s ; les tenues courtes sont EN VOL et jauge vide (la flamme bat seule, touche tenue). Leo : la touche tenue (null), la jauge fait le reste ;
     · geste, drift.avance : des ordres de grandeur NON mesures (l'etalon est a 10 echantillons par seconde) — pour qu'aucun double appui ni
       aucun drift ne soit le meme d'un bout a l'autre de la course. */
const MAIN_CLAVIER={reaction:{volant:[120,200,320],nitro:[110,180,300],manche:[150,240,380],geste:[180,260,420]},suivi:{actif:true,retard:150},
  coups:{actif:true,duree:[70,130,300],repos:[90,140,250],inversion:[50,90,200],seuil:.4},nitro:{tenue:[320,1000,4100],pause:[120,220,450]},
  geste:{tap:[70,90,130],entre:[70,90,140]},drift:{avance:[33,70,150]}};
const MODELES={machine:{},clavier:MAIN_CLAVIER,doigt:Object.assign({},MAIN_CLAVIER,{coups:{actif:true,duree:[80,150,330],repos:[90,140,250],inversion:[50,90,200],seuil:.4},nitro:{tenue:null,pause:[130,220,500]}})};
function regle(R,v,nom){
  const t=R[0],lo=R[1],hi=R[2],nb=x=>typeof x==='number'&&isFinite(x); /* (2026-11-25, relecture) un infini est un mauvais type : [Infinity, …] laissait des NaN dans la loi */
  if(t==='b'){if(typeof v!=='boolean')throw new Error('profil : '+nom+' doit valoir true ou false');return v;}
  if(t==='d'||t==='d?'){
    if(v===null&&t==='d?')return null;
    let a;
    if(nb(v))a=[v,v,v,v,v];
    else if(Array.isArray(v)&&v.length===3&&v.every(nb))a=[v[0]-(v[1]-v[0])/2,v[0],v[1],v[2],v[2]+(v[2]-v[1])];
    else throw new Error('profil : '+nom+' doit etre une duree en ms (un nombre, ou [p10, p50, p90])');
    return a.map(x=>Math.round(cl(x,lo,hi)*IMG)).sort((x,y)=>x-y);}
  if(t==='nn'){if(!Array.isArray(v)||v.length!==2||!v.every(nb))throw new Error('profil : '+nom+' doit etre [mini, maxi]');return v.map(x=>cl(x,lo,hi)).sort((x,y)=>x-y);}
  if(!nb(v))throw new Error('profil : '+nom+' doit etre un nombre');
  if(t==='ms')return Math.round(cl(v,lo,hi)*IMG);
  if(t==='e')return Math.round(cl(v,lo,hi));
  return cl(v,lo,hi);
}
/* le profil ecrit par le cerveau → le profil de la main (des images, des lois a 5 points), ou null s'il ne change rien a la main d'avant */
function normaliserProfil(p){
  if(p==null)return null;
  if(typeof p!=='object'||Array.isArray(p))throw new Error('profil : un objet { modele, graine, reaction, suivi, coups, nitro, geste, drift, chance, erreur }');
  const a=(o,k)=>Object.prototype.hasOwnProperty.call(o,k),mod=p.modele==null?'machine':p.modele;
  if(typeof mod!=='string'||!a(MODELES,mod))throw new Error('profil : modele inconnu (machine, clavier, doigt)');
  for(const k of Object.keys(p))if(k!=='modele'&&k!=='graine'&&!a(REGLES,k))throw new Error('profil : champ inconnu « '+k+' »');
  const g=p.graine==null?0:p.graine;if(typeof g!=='number'||g!==g)throw new Error('profil : graine doit etre un entier');
  const P={modele:mod,graine:g|0},M=MODELES[mod];
  for(const s of Object.keys(REGLES)){
    const donne=p[s];
    if(donne!=null&&(typeof donne!=='object'||Array.isArray(donne)))throw new Error('profil : '+s+' doit etre un objet');
    if(donne)for(const k of Object.keys(donne))if(!a(REGLES[s],k))throw new Error('profil : champ inconnu « '+s+'.'+k+' »');
    P[s]={};
    for(const k of Object.keys(REGLES[s]))P[s][k]=regle(REGLES[s][k],donne&&donne[k]!==undefined?donne[k]:(M[s]&&M[s][k]!==undefined?M[s][k]:DEFAUT[s][k]),s+'.'+k);}
  /* (2026-11-25, relecture, Sacha : « pas de reflexes surhumains ») LE SUIVI NE VOIT PAS PLUS VITE QU'UNE DECISION : recalcule a chaque image,
     il lit l'etat du jeu vieux d'au moins HUMAIN.decision images (6, 100 ms). Avant, un retard nul (le defaut) reagissait a l'image meme, entre
     deux decisions : 83 ms plus tot que ce qu'un cerveau peut ordonner. Le plancher est en IMAGES (91 ms faisaient 5 images, 92 a 100 ms 6). */
  if(P.suivi.actif&&P.suivi.retard<HUMAIN.decision)P.suivi.retard=HUMAIN.decision;
  if(touchesDAvant(P)&&P.chance.prend===0)return null; /* tout est au defaut : la main d'avant */
  return P;
}
/* (2026-11-25, relecture) les touches de ce profil sont-elles celles de la main d'avant ? (rien n'est change que la seconde chance) */
function touchesDAvant(P){
  const nul=q=>q[4]===0,fixe=(q,n)=>q[0]===n&&q[4]===n,R=P.reaction,E=P.erreur;
  return nul(R.volant)&&nul(R.nitro)&&nul(R.manche)&&nul(R.geste)&&!P.suivi.actif&&!P.coups.actif&&P.nitro.tenue===null&&fixe(P.geste.tap,HUMAIN.tap)&&fixe(P.geste.entre,HUMAIN.entre)
    &&fixe(P.drift.avance,2)&&E.manque===0&&E.retard===0&&E.sur===0&&E.bruit===0&&E.parasite===0;}
/* LA SECONDE CHANCE, en images : ce que la plaque du jeu impose (moteur/mobile-tactile.js : sourde 600 ms apres l'ecran de mort ; gameplay/seconde-chance.js :
   une fenetre de 5,5 s), et ce que la main s'accorde (attendre la plaque 5 s au plus, la reprise 20 s au plus apres le toucher). */
const REPRISE={GARDE:36,FENETRE:330,ATTENTE:300,REPRISE_MAX:1200};
/* l'offre aura-t-elle lieu ? Les conditions de chanceOuvre (gameplay/seconde-chance.js), LUES a la decision qui voit la mort. Rien n'est ecrit. */
const OFFRE_CODE="!!(CHANCE.on&&!CHANCE.used&&mode==='boom'&&!SANDBOX&&!TUTO.on&&!TUTO.quitte&&!PARK.on&&!SURV.on&&!BALADE&&(RUNX.t||0)>=CHANCE.tMin&&!((SAVE.d.chanceG|0)>0))";

function Doigts(J,lireMode,o){
  const D=this;
  D.J=J;D.lireMode=lireMode||null;D.image0=0;D.i=0;D.touches=[];D.refus=0;
  D.k={};for(const n in TOUCHE)D.k[n]={bas:false,depuis:-999,debut:-999,duree:999};
  D.o={volant:0,manche:0,nitro:false};
  D.pwm={cote:null,on:false,n:0};
  D.geste=null;D.dernierGeste=-999;D.nBloque=-999;
  /* (doigts v2) o = { profil (deja passe par normaliserProfil), graine (celle de la course) }. Sans profil : la main d'avant, ligne pour ligne. */
  D.P=(o&&o.profil)||null;D.fin=null;
  /* (2026-11-25, relecture) une main HUMAINE : un profil qui change les touches (pas seulement la seconde chance). Les gardes neuves (le geste
     qui attend le tapotement) ne valent que pour elle : un profil sans effet sur les touches reste la main d'avant (verifier.js, controle 10). */
  D.humaine=!!D.P&&!touchesDAvant(D.P);
  if(D.P)D.monte(o.graine);
}
/* une touche change MAINTENANT (et s'ecrit au journal) */
Doigts.prototype.pose=function(n,on){const k=this.k[n];on=!!on;if(k.bas===on)return;
  if(on){k.debut=this.i;}else k.duree=this.i-k.debut;
  k.bas=on;k.depuis=this.i;this.J.touche(TOUCHE[n],on);this.touches.push([this.i,n,on?1:0]);};
/* une touche change SI la main en a le temps (appui et repos minimaux) */
Doigts.prototype.veut=function(n,on){const k=this.k[n];on=!!on;if(k.bas===on)return true;
  if(this.i-k.depuis<(k.bas?HUMAIN.appui:HUMAIN.repos))return false;
  if(n==='N'&&on){if(this.i<this.nBloque)return false;if(k.duree<18&&this.i-k.debut<HUMAIN.seul)return false;} /* pas de double appui par accident */
  this.pose(n,on);return true;};
Doigts.prototype.occupe=function(){return !!this.geste;};
/* le cerveau donne son ordre (une fois par decision). Rend false si le geste demande est refuse (un autre en cours, ou trop tot). */
Doigts.prototype.ordre=function(o,vue,e){
  if(this.P)return this.ordreV2(o,vue,e); /* (doigts v2) une main a profil : l'ordre passe par ses delais ; e = l'etat lu par piloter.js (MAIN_CODE) */
  o=traduire(o,vue);this.o=o;
  if(!o.geste)return true;
  if(this.geste||this.i-this.dernierGeste<HUMAIN.gestes){this.refus++;return false;}
  const dir=DIR[o.direction]?o.direction:'avant';
  if(o.geste==='figure'||o.geste==='saut'){this.geste={nom:o.geste,dir:dir,t:0};}
  else if(o.geste==='redresser'){this.geste={nom:'redresser',dir:null,t:0};}
  else return false;
  this.dernierGeste=this.i;return true;};
/* LE VOLANT AU CLAVIER : tout ou rien. Un dosage = des appuis repetes, jamais plus courts que HUMAIN.appui. */
Doigts.prototype.volant=function(v){
  const P=this.pwm,a=Math.abs(v),cote=a<.08?null:(v>0?'G':'D'),autre=cote==='G'?'D':'G';
  if(!cote){this.veut('G',0);this.veut('D',0);P.on=false;P.n=0;P.cote=null;return;}
  if(P.cote!==cote){P.cote=cote;P.on=false;P.n=999;}
  this.veut(autre,0);
  if(a>=.92){this.veut(cote,1);P.on=true;P.n=0;return;}
  const on=Math.max(HUMAIN.appui,Math.round(a*12)),off=Math.max(HUMAIN.repos,Math.round(on*(1-a)/a));
  P.n++;
  if(P.on){if(P.n>=on&&this.veut(cote,0)){P.on=false;P.n=0;}}
  else if(P.n>=off&&this.veut(cote,1)){P.on=true;P.n=0;}};
/* UN GESTE, image par image. Pendant un geste, la NITRO et les directions qu'il tient lui appartiennent. */
Doigts.prototype.joueGeste=function(){
  const g=this.geste,H=HUMAIN,dr=g.dir?DIR[g.dir]:null,t1=g.t1||H.tap,en=g.en||H.entre,t2=g.t2||H.tap; /* (doigts v2) les durees du double appui : celles du geste (tirees du profil), sinon HUMAIN */
  /* LA MISE EN PLACE : la NITRO relachee, la direction posee — chaque touche a son rythme (jamais un appui plus court que HUMAIN.appui).
     Le geste ne part que la main en place : 4 images au plus. */
  if(g.t===0){
    let pret=this.veut('N',0);
    /* (2026-11-25, relecture) UNE MAIN A PROFIL N'OUVRE PAS SON GESTE SUR UN TAPOTEMENT : le jeu lance la figure des qu'un appui NITRO suit un
       appui de moins de 300 ms commence moins de 420 ms plus tot (gameplay/vol-equilibre.js, veqDoigt). La nitro hachee en laisse, et la mise en
       place coupe elle-meme la nitro en cours : avant, un geste sur six partait au 1er appui (le saut : son 3e appui lu comme un double).
       Le geste attend donc que ce dernier appui sorte de la fenetre — 18 images comprises (l'horloge du faux navigateur lit 18 images « moins
       de 300 ms » une fois sur deux), 26 images de debut a debut (25 sont toujours sous 420 ms). Pendant l'attente, le geste ne tient QUE la
       NITRO : le volant et le manche restent a l'ordre. Seule une main HUMAINE passe ici (this.humaine, voir monte) : la main sans profil, et celle
       dont le profil ne change que la seconde chance (controle 10), restent la main d'avant. */
    if(this.humaine&&pret&&this.attenteNitro(this.i)>0)return {N:1};
    if(dr)for(const n of ['G','D','B','H'])pret=this.veut(n,dr[n])&&pret;
    if(!pret)return dr?{N:1,G:1,D:1,B:1,H:1}:{N:1};
    g.t=1;return dr?{N:1,G:1,D:1,B:1,H:1}:{N:1};}
  const t=(g.t++)-1;
  if(g.nom==='redresser'){ /* un appui bref, seul : la caisse se remet face a la route */
    if(t===H.repos)this.pose('N',1);
    if(t===H.repos+t1){this.pose('N',0);this.nBloque=this.i+H.seul;this.geste=null;}
    return {N:1};}
  /* figure / saut : la direction, puis deux appuis brefs sur NITRO */
  const a=H.repos,b=a+t1,c=b+en,d=c+t2;
  if(t===a)this.pose('N',1);
  if(t===b)this.pose('N',0);
  if(t===c)this.pose('N',1);            /* le 2e appui : le jeu lit la direction a l'image suivante */
  if(t===d)this.pose('N',0);
  if(g.nom==='figure'){
    if(t>=d){this.geste=null;return {};}
    return t<=c+H.appui?{N:1,G:1,D:1,B:1,H:1}:{N:1};}
  /* le saut : pendant le bond de la figure sur la route, le manche vers soi (↓) puis un NOUVEL appui NITRO font decoller */
  const e=d+H.repos;
  if(t===c+H.appui){this.pose('G',0);this.pose('D',0);this.pose('H',0);this.pose('B',1);}
  if(t===e)this.pose('N',1);
  if(t>e+H.appui){const m=this.lireMode?this.lireMode():null;
    if(m==='vol'||m==='boom'||(m==='sol'&&t>e+8)||t>e+40){this.pose('N',0);this.pose('B',0);this.nBloque=this.i+H.repos;this.geste=null;return {};}}
  return {N:1,G:1,D:1,B:1,H:1};};
/* a appeler AVANT chaque image du jeu */
Doigts.prototype.image=function(e){
  if(this.P)return this.imageV2(e); /* (doigts v2) une main a profil */
  const o=this.o,pris=this.geste?this.joueGeste():{};
  if(!pris.G&&!pris.D)this.volant(o.volant);
  if(!pris.B&&!pris.H){this.veut('H',o.manche<0);this.veut('B',o.manche>0);}
  if(!pris.N)this.veut('N',o.nitro);
  this.i++;};
/* (2026-11-25, relecture) dans combien d'images un geste mis en place a l'image `a` (NITRO deja relachee) pourra poser son 1er appui sans former
   un double appui avec le dernier appui NITRO (voir joueGeste) : 0 = tout de suite. Lecture seule. */
Doigts.prototype.attenteNitro=function(a){const k=this.k.N,d=k.bas?a-k.debut:k.duree;
  return d<=18?Math.max(0,26-(a+HUMAIN.repos+1-k.debut)):0;};
Doigts.prototype.lache=function(){for(const n in TOUCHE)if(this.k[n].bas)this.pose(n,0);this.geste=null;};
/* (2026-11-24, yeux v2) LES DELAIS DE LA MAIN, pour le radar : dans combien d'images chaque touche POURRA changer d'etat (0 = a la prochaine image).
   Une touche enfoncee le reste HUMAIN.appui images, relachee HUMAIN.repos ; la NITRO attend aussi apres un appui bref (nBloque, seul) ; pendant un
   geste, toutes les touches lui appartiennent jusqu'a sa fin (comptee sur son deroule : le saut lache la NITRO et le manche 5 images apres son
   dernier appui, une fois en vol). LECTURE SEULE : rien ne change dans les doigts. Les yeux gardent l'etat du moment de chaque touche pendant son
   delai (yeux.js, LE PRELUDE) : sans cela le radar suppose l'ordre obei a l'image suivante, ce qu'aucune main ne fait. */
Doigts.prototype.delais=function(){
  const H=HUMAIN,o={};let g=0;
  if(this.geste){const G9=this.geste,t=G9.t-1,a=H.repos,t1=G9.t1||H.tap,d=a+t1+(G9.en||H.entre)+(G9.t2||H.tap); /* (doigts v2) les durees de CE geste */
    g=G9.t===0?H.repos+(this.humaine?this.attenteNitro(this.i):0):0; /* (relecture) une main a profil attend que son dernier tapotement sorte de la fenetre du double appui */
    if(G9.nom==='redresser')g+=Math.max(0,a+t1-t)+1;
    else if(G9.nom==='figure')g+=Math.max(0,d-t)+1;
    else g+=Math.max(0,d+H.repos+H.appui+1-t);}
  for(const n in TOUCHE){const k=this.k[n];let r=Math.max(0,(k.bas?H.appui:H.repos)-(this.i-k.depuis));
    if(n==='N'&&!k.bas){r=Math.max(r,this.nBloque-this.i);if(k.duree<18)r=Math.max(r,H.seul-(this.i-k.debut));}
    o[n]=Math.max(0,r,g);}
  /* (2026-11-25, relecture) LE SAUT ET LA NITRO, EN DEUX TEMPS. Avant : « N libre dans g + 4 images ». Or la NITRO du decollage est TENUE jusqu'a
     la fin du geste (g images), puis RELACHEE, et `veut` interdit de la reprendre avant HUMAIN.seul images comptees depuis le DEBUT de cet appui
     (MESURE, ville 910037 : lachee a l'image 758, reprise a la 780e — 27 images apres son appui de la 753e). N = le temps ou elle garde son etat ;
     Nb = l'image jusqu'ou elle reste relachee ensuite. Les yeux jouent les deux (yeux.js, LE PRELUDE : bN). */
  if(g>0&&this.geste.nom==='saut'){const kN=this.k.N;o.Nb=Math.max(g+H.repos,kN.bas?kN.debut+H.seul-this.i:g+H.seul);}
  /* (2026-11-25, relecture) L'AIDE EN COURS, pour le saut vu du sol : a la fin du geste, la main sans profil applique en plein vol le volant du
     dernier ordre donne au sol (une fleche de 4 images). Les yeux le retraduisent sur l'etat de la caisse au decollage. Pas pour une main a
     suivi (elle lache l'aide en changeant de mode) ni a coups (sa fleche ne part pas a une image connue). */
  if(!this.P||(!this.P.suivi.actif&&!this.P.coups.actif)){const q=this.o||{},l=+q.ligne;o.aide=q.ligne!=null&&l-l===0?{ligne:l}:{volant:+q.volant||0};}
  /* (2026-11-24, doigts v2) LE TEMPS DE REACTION compte aussi : un ordre NEUF n'atteint sa touche qu'apres la reaction de son canal (deja tiree :
     `rp`) et jamais avant les ordres deja en route (`dernier`). Sans profil, ou reactions nulles : rien ne s'ajoute. Ce que le radar ne sait
     toujours pas : les ordres deja en route changeront les touches avant le sien, et une main a coups ou a suivi ne tient pas une touche fixe. */
  if(this.P){const L=this.L,i=this.i,att=c=>Math.max(L[c].dernier,i+L[c].rp)-i,v=att('volant'),m=att('manche'),n=att('nitro');
    o.G=Math.max(o.G,v);o.D=Math.max(o.D,v);o.H=Math.max(o.H,m);o.B=Math.max(o.B,m);o.N=Math.max(o.N,n);
    /* (2026-11-25, relecture) CE QUE LA MAIN A PROFIL SAIT DEJA, pour le radar (LECTURE SEULE : aucun tirage, rien ne change dans la main) :
       · r : la prochaine reaction de chaque canal, deja tiree (au sol, les sorties la roulent avant le plein volant ou le geste) ;
       · saut : les images de route du geste « saut », de l'ordre au decollage, avec les durees MEDIANES de ses appuis (les vraies seront tirees) ;
       · vol (une main a coups ou a suivi seulement) : fin = dans combien d'images la fleche enfoncee se relache (la fin du coup en cours, deja
         tiree ; 0 : aucune fleche) ; c = la part de braquage de l'ordre en vigueur (l'aide recalculee sur l'etat percu) ; file = les ordres deja
         en route, [images avant l'arrivee, part de braquage]. Les coups suivants ne sont pas tires : les yeux prennent la moyenne. */
    const P=this.P,G9=P.geste,t1=G9.tap[2],en=Math.max(H.repos,Math.min(G9.entre[2],22-t1));
    o.r={v:L.volant.rp,m:L.manche.rp,n:L.nitro.rp,g:L.geste.rp};
    o.saut=1+H.repos+t1+en+G9.tap[2]+H.repos+(this.humaine?this.attenteNitro(i+L.geste.rp):0); /* (relecture) + l'attente du tapotement, estimee sur la NITRO d'aujourd'hui (0,35 s au plus) */
    if(P.coups.actif||P.suivi.actif){
      const e=this.e,cap=e&&e.mode==='vol'?e.capVol:null,plein=P.coups.actif?P.coups.plein:.92;
      const part=d=>{const x=!d?0:d.k==='volant'?d.x:(d.k==='viser'&&cap!=null)?cl(angle(d.x-cap)*2.2,-1,1):0;return Math.abs(x)>=plein?(x>0?1:-1):x;}; /* au-dela de « plein » la touche est tenue */
      const c=part(L.volant.v),enCoup=(this.k.G.bas||this.k.D.bas)&&P.coups.actif&&Math.abs(c)<1;
      o.vol={fin:enCoup?Math.max(0,this.M.fin-i):0,c:c,file:L.volant.file.slice(0,4).map(x=>[Math.max(0,x.a-i),part(x.v)])};}}  return o;};

/* ===== LA MAIN A PROFIL (2026-11-24, doigts v2) ===== */
/* le montage : un generateur par usage (ajouter un tirage dans un flux ne decale pas les autres), les lignes a retard, les compteurs */
Doigts.prototype.monte=function(graine){
  const P=this.P;this.H={};
  for(const f of FLUX)this.H[f]=hasard(graineDe('doigts-v2|'+(graine|0)+'|'+P.graine+'|'+f));
  this.err={manques:0,retards:0,surs:0,parasites:0};this.gestesRates=0;this.imagesMortes=0;
  this.chance={voulue:false,ok:-1,image:-1,prise:false,reprise:-1};
  this.detteMax=2*P.coups.duree[3];
  this.e=null;this.anneau=[];for(let j=0;j<32;j++)this.anneau.push({img:-1,mode:'boom',lat:0,cap:0,vitesse:0,lacetRoute:0,lacetMax:1,capVol:0});
  /* une ligne a retard par canal : file (les ordres en route, {a : l'image d'arrivee, v}), v (l'ordre arrive), ref (le dernier ordre qui a
     compte comme un changement), dernier (l'arrivee du dernier ordre parti), rp (la prochaine reaction, tiree D'AVANCE : le radar la lit) */
  this.L={};for(const c of ['volant','manche','nitro','geste']){this.L[c]={file:[],v:null,ref:null,dernier:0,rp:0,rr:false};this.reac(c);}
  this.neuf();};
/* la main repart de zero (au depart, et apres une seconde chance) : plus aucun ordre en route, les modulateurs a neuf */
Doigts.prototype.neuf=function(){
  const L=this.L,i=this.i;
  L.volant.file=[];L.volant.v=L.volant.ref={k:'volant',x:0};L.volant.dernier=i;
  L.manche.file=[];L.manche.v=L.manche.ref={m:0,drift:0};L.manche.dernier=i;
  L.nitro.file=[];L.nitro.v=L.nitro.ref=false;L.nitro.dernier=i;
  this.gf=null;this.geste=null;this.pwm={cote:null,on:false,n:0};
  this.M={dette:0,fin:-1,rep:{G:i,D:i},prochain:null,gain:1,para:-1}; /* le volant par coups (rep : le repos de chaque fleche) */
  this.NH={fin:-1,pause:i,pour:-1};                             /* la nitro hachee */
  this.drB=false;this.drCote=0;this.drAv=null;                  /* ↓ tenu par un drift, son cote, l'avance de la fleche (tiree au debut du drift) */
  this.gRefus=false;};                                          /* le dernier geste demande n'est pas parti (la vue le dit : piloter.js) */
/* un tirage dans le flux f, selon la loi q. Une loi constante ne tire RIEN : un profil sans alea ne consomme aucun nombre. */
Doigts.prototype.tire=function(f,q){return q[0]===q[4]?q[0]:tirer(q,this.H[f]());};
/* la prochaine reaction du canal c, tiree d'avance (une par changement d'ordre) ; erreur.retard : cette reaction-la est multipliee par retardK */
Doigts.prototype.reac=function(c){
  const P=this.P,L=this.L[c];let r=this.tire('reaction',P.reaction[c]);L.rr=false;
  if(P.erreur.retard>0&&r>0&&this.H.erreur()<P.erreur.retard){r=Math.min(60,Math.round(r*P.erreur.retardK));L.rr=true;}
  L.rp=r;};
/* un ordre part vers la main : s'il CHANGE, il attend une reaction ; il n'en double jamais un autre */
Doigts.prototype.retarde=function(c,v,change){
  const L=this.L[c];let r=0;
  if(change){r=L.rp;if(L.rr)this.err.retards++;L.ref=v;this.reac(c);}
  const a=Math.max(L.dernier,this.i+r);L.file.push({a:a,v:v});L.dernier=a;};
/* la direction a-t-elle change pour de bon ? (une autre aide, une ligne a plus de 3 m, un cap a plus de 0,15 rad, un volant qui change de sens ou de plus de 0,3) */
function changeDir(a,b,mort){
  if(a.k!==b.k)return true;
  if(b.k==='ligne')return Math.abs(b.x-a.x)>3;
  if(b.k==='viser')return Math.abs(angle(b.x-a.x))>.15;
  const sg=x=>x>mort?1:x<-mort?-1:0;return sg(a.x)!==sg(b.x)||Math.abs(b.x-a.x)>.3;}
/* L'ORDRE DU CERVEAU (une fois par decision) : il est traduit comme avant, puis part dans les lignes a retard */
Doigts.prototype.ordreV2=function(o,vue,e){
  const P=this.P,t=traduire(o,vue),L=this.L,src=o||{},mode=vue&&vue.mode;this.o=t;
  if(this.fin)return false;
  /* la direction : avec le suivi, l'aide elle-meme (la main la tiendra a chaque image) ; sinon le volant chiffre par traduire */
  let dir=null;
  if(P.suivi.actif&&e){
    if(mode==='sol'&&src.ligne!=null){const x=+src.ligne;if(x-x===0)dir={k:'ligne',x:x};}
    else if(mode==='vol'&&src.viser&&typeof src.viser.gisement==='number'&&src.viser.gisement-src.viser.gisement===0)
      dir={k:'viser',x:e.capVol+cl(src.viser.gisement,-PI,PI)}; /* le cap ABSOLU de la cible : le gisement des yeux = cap de la cible − cap du vol */
  }
  if(!dir)dir={k:'volant',x:t.volant};
  /* (2026-11-25, relecture) `ensuite` : l'ordre du volant pour le mode d'APRES (donne en vol : celui de la pose ; donne au sol : celui du
     decollage) — { ligne: m } ou { volant: -1..1 }. Il voyage avec la direction, sans reaction a lui : la main l'applique des qu'elle percoit
     le changement de mode, au lieu de garder le plein volant du vol 7 a 30 images au sol en attendant la decision suivante. */
  const ens=src.ensuite;
  if(ens&&typeof ens==='object'&&(mode==='sol'||mode==='vol')){
    const lg=+ens.ligne,vl=+ens.volant;
    if(ens.ligne!=null&&lg-lg===0)dir.ens=P.suivi.actif?{k:'ligne',x:lg}:{k:'volant',x:0}; /* sans le suivi, une ligne ne se tient qu'a la decision : la main lache */
    else if(ens.volant!=null&&vl-vl===0)dir.ens={k:'volant',x:cl(vl,-1,1)};
    if(dir.ens)dir.m=mode;}
  this.retarde('volant',dir,changeDir(L.volant.ref,dir,P.coups.mort));
  const mv={m:t.manche,drift:src.drift>0?1:src.drift<0?-1:0},mr=L.manche.ref; /* le drift voyage avec le manche : c'est un seul geste */
  this.retarde('manche',mv,mv.m!==mr.m||mv.drift!==mr.drift);
  this.retarde('nitro',t.nitro,t.nitro!==L.nitro.ref);
  /* le geste : un seul en attente */
  const nom=t.geste;if(!nom)return true;
  if(nom!=='figure'&&nom!=='saut'&&nom!=='redresser'){this.gRefus=true;return false;}
  if(this.gf){this.refus++;this.gRefus=true;return false;}
  const G=L.geste,r=G.rp;if(G.rr)this.err.retards++;this.reac('geste');
  this.gf={a:this.i+r,nom:nom,dir:nom==='redresser'?null:(DIR[t.direction]?t.direction:'avant')};
  return true;};
/* l'etat du jeu que la main « voit » : celui de l'image, ou celui d'il y a suivi.retard images (le retard de perception) */
Doigts.prototype.percu=function(){
  const r=this.P.suivi.retard;
  /* (2026-11-25, relecture) sans l'etat d'il y a `retard` images (le depart, la reprise apres la seconde chance) : RIEN, pas l'etat du moment
     (avant, la main voyait alors l'image meme : plus vite qu'une decision) */
  if(r>0)return this.ilYa(r);
  return this.e;};
/* l'etat du jeu d'il y a r images (r ≤ 31), ou null s'il n'a pas ete vu (le depart, la mort) */
Doigts.prototype.ilYa=function(r){const j=this.i-r,s=j>=0?this.anneau[j&31]:null;return s&&s.img===j?s:null;};
/* LE VOLANT VOULU a cette image : l'aide recalculee sur l'etat percu (la loi de traduire), ou le volant chiffre. Une aide qui ne va plus avec
   le mode (un `viser` arrive apres la pose, une `ligne` apres le decollage) : la main lache. (relecture) Un ordre donne avec `ensuite` : des que
   le mode percu n'est plus celui de l'ordre, c'est `ensuite` qui vaut (le mode percu : l'etat d'il y a 6 images, ou suivi.retard s'il est plus long). */
Doigts.prototype.consigne=function(mode){
  let d=this.L.volant.v;
  if(d.ens){const s=this.ilYa(Math.max(HUMAIN.decision,this.P.suivi.retard));if(s&&s.mode!==d.m&&(s.mode==='sol'||s.mode==='vol'))d=d.ens;} /* le changement de mode se voit 6 images apres, au plus tot */
  if(d.k==='volant')return d.x;
  const e=this.percu();
  if(!e||e.mode!==mode)return 0;
  let v=0;
  if(d.k==='ligne'&&mode==='sol'){const capVise=cl((d.x-e.lat)/(Math.max(6,e.vitesse)*.9),-.4,.4);v=cl((e.lacetRoute+(capVise-e.cap)*3)/Math.max(.05,e.lacetMax),-1,1);}
  else if(d.k==='viser'&&mode==='vol')v=cl(angle(d.x-e.capVol)*2.2,-1,1);
  return v===v?v:0;};
/* LE VOLANT PAR COUPS : la part de braquage voulue s'accumule (la dette, en images d'appui) ; quand elle vaut une part du prochain coup, la main
   appuie pour une duree TIREE, puis se repose. En moyenne le braquage est le bon ; les durees et les ecarts sont ceux d'une main.
   Controle d'ordre de grandeur : braquage 0,36 et les coups du modele clavier (10 images en moyenne) → 130 par minute (verifier.js, 9e : 132). */
Doigts.prototype.volantCoups=function(v){
  const P=this.P,Q=P.coups,M=this.M,i=this.i,a=Math.abs(v),k=this.k;
  if(a>=Q.plein){this.volant(v>0?1:-1);M.dette=0;return;}                                 /* plein volant : la touche tenue, comme avant */
  if(a<Q.mort)M.dette*=.9;else M.dette=cl(M.dette+v*M.gain,-this.detteMax,this.detteMax);
  if(k.G.bas||k.D.bas){
    for(const n of ['G','D']){if(!k[n].bas)continue;
      const contre=a>=Q.contre&&(n==='G'?v<0:v>0);                                         /* l'ordre s'est inverse : le coup est coupe */
      if((i>=M.fin||contre)&&this.veut(n,0))this.repose(n);}
    return;}
  if(i<Math.min(M.rep.G,M.rep.D))return;
  /* erreur.parasite : un coup que personne n'a demande, d'un cote au hasard (l'embardee) ; l'ecart jusqu'au suivant suit une loi exponentielle
     de moyenne 3600 / parasite images, compte de debut a debut (relecture : avant, la duree du coup s'y ajoutait — 20 a 28 % d'embardees de moins) */
  if(P.erreur.parasite>0){
    if(M.para<0)M.para=i+Math.round(3600/P.erreur.parasite*quantile(EXPO,this.H.erreur()));
    if(i>=M.para){const n=this.H.erreur()<.5?'G':'D',d=this.tire('erreur',Q.duree);
      M.para=i+Math.round(3600/P.erreur.parasite*quantile(EXPO,this.H.erreur()));
      if(i>=M.rep[n]&&this.veut(n,1)){M.fin=i+d;this.err.parasites++;return;}}}
  if(M.prochain==null){M.prochain=this.tire('volant',Q.duree);M.gain=1+(P.erreur.bruit>0?P.erreur.bruit*(2*this.H.erreur()-1):0);}
  if(Math.abs(M.dette)<Q.seuil*M.prochain)return;
  /* (2026-11-25, relecture) JAMAIS DE COUP A CONTRESENS : un coup ne part que du cote de l'ordre. Le coup retire sa duree entiere de la dette :
     elle passe sous zero (−0,5 × la duree avec seuil 0,5), et avant, si le coup suivant tire etait plus court, la main appuyait aussitot de
     l'AUTRE cote (pour un volant de 0,12, un appui sur quatre, a fond). La dette de l'autre signe se rembourse en attendant. */
  if(a<Q.mort||v*M.dette<=0)return;
  const n=M.dette>0?'G':'D';
  if(i<M.rep[n])return;                                                                    /* le repos de CETTE fleche (l'autre a le sien : relecture) */
  if(i-k[n].depuis<HUMAIN.repos)return;                                                    /* la touche n'est pas encore libre : aucun tirage d'erreur pour rien */
  if(P.erreur.manque>0&&this.H.erreur()<P.erreur.manque){M.rep.G=M.rep.D=i+this.tire('volant',Q.repos);this.err.manques++;return;} /* l'appui manque : la dette reste, la correction viendra tard */
  let d=M.prochain;
  if(P.erreur.sur>0&&this.H.erreur()<P.erreur.sur){d=Math.round(d*(P.erreur.surK[0]+(P.erreur.surK[1]-P.erreur.surK[0])*this.H.erreur()));this.err.surs++;} /* l'appui trop long */
  if(this.veut(n,1)){M.fin=i+d;M.dette-=(M.dette>0?1:-1)*M.prochain;M.prochain=null;}};    /* la dette perd la duree PREVUE : la main ne sait pas qu'elle a trop tenu, c'est l'etat lu qui corrige */
/* (2026-11-25, relecture) LE REPOS APRES UN COUP, DEUX HORLOGES : la fleche lachee attend son repos (coups.repos) ; la fleche d'EN FACE, un
   autre doigt sur une autre touche, n'attend que coups.inversion (plus court : les joueurs inversent souvent dans les 100 ms). Sans
   coups.inversion (null), un seul repos pour les deux, comme avant. */
Doigts.prototype.repose=function(n){
  const Q=this.P.coups,M=this.M,i=this.i,r=this.tire('volant',Q.repos);
  if(Q.inversion){M.rep[n]=i+r;M.rep[n==='G'?'D':'G']=i+this.tire('volant',Q.inversion);}else M.rep.G=M.rep.D=i+r;};
/* LA NITRO HACHEE (au sol seulement : en vol chaque allumage coute de la jauge, et un appui seul redresse une figure). La garde de `veut` reste :
   apres un appui de moins de 18 images, 27 images depuis son debut — sans elle, deux tapotements feraient une figure. */
Doigts.prototype.nitroHache=function(n){
  const P=this.P,k=this.k.N,NH=this.NH,i=this.i;
  if(!n){this.veut('N',0);return;}
  if(k.bas){
    if(NH.pour!==k.debut){NH.pour=k.debut;NH.fin=i+this.tire('nitro',P.nitro.tenue);}     /* un appui venu d'ailleurs (tenu en vol, puis la pose) : sa tenue se tire ici */
    if(i>=NH.fin&&this.veut('N',0))NH.pause=i+this.tire('nitro',P.nitro.pause);
    return;}
  if(k.duree<=18&&i-k.debut<HUMAIN.seul)return; /* (relecture) 18 images comprises : le jeu lit une fois sur deux un appui de 18 images « moins de 300 ms » */
  if(i>=NH.pause&&this.veut('N',1)){NH.pour=i;NH.fin=i+this.tire('nitro',P.nitro.tenue);}};
/* A CHAQUE IMAGE, avant celle du jeu. L'ordre des touches est celui d'avant : geste, volant, manche, nitro. Avec un profil sans effet (reactions
   nulles, ni coups ni suivi), chaque etape fait les appels d'avant a la meme image (verifier.js, controle 10). */
Doigts.prototype.imageV2=function(e){
  const P=this.P,L=this.L,i=this.i;
  this.e=e||null;
  /* MORTE : la main lache tout, a son rythme (jamais de force : un appui de 2 images ne serait pas d'une main), puis guette la plaque */
  if(this.fin){for(const n in TOUCHE)this.veut(n,0);this.plaque();this.imagesMortes++;this.i++;return;}
  if(e){const s=this.anneau[i&31];s.img=i;s.mode=e.mode;s.lat=e.lat;s.cap=e.cap;s.vitesse=e.vitesse;s.lacetRoute=e.lacetRoute;s.lacetMax=e.lacetMax;s.capVol=e.capVol;}
  /* les ordres arrives a echeance, dans l'ordre volant, manche, nitro ; puis le geste */
  for(const c of ['volant','manche','nitro']){const F=L[c].file;while(F.length&&F[0].a<=i)L[c].v=F.shift().v;}
  if(this.gf&&this.gf.a<=i){const g=this.gf;this.gf=null;
    if(P.erreur.manque>0&&this.H.erreur()<P.erreur.manque){this.gestesRates++;this.gRefus=true;} /* le geste manque : il ne part pas */
    else if(this.geste||i-this.dernierGeste<HUMAIN.gestes){this.refus++;this.gRefus=true;}  /* la regle d'avant : un autre en cours, ou trop tot */
    else{const t1=this.tire('geste',P.geste.tap),en=Math.max(HUMAIN.repos,Math.min(this.tire('geste',P.geste.entre),22-t1)),t2=this.tire('geste',P.geste.tap);
      this.geste={nom:g.nom,dir:g.dir,t:0,t1:t1,en:en,t2:t2};this.dernierGeste=i;this.gRefus=false;}} /* t1 + en ≤ 22 images : le jeu veut le 2e appui moins de 420 ms apres le debut du 1er */
  const pris=this.geste?this.joueGeste():{},mode=e?e.mode:'sol',mv=L.manche.v,dr=mode==='sol'?mv.drift:0; /* hors du sol le drift est ignore : ↓ en vol cabre */
  if(!pris.G&&!pris.D){
    if(dr){this.volant(dr);this.M.dette=0;}                                                /* LE DRIFT : la fleche a fond, sans aide ni coups, tant que l'ordre dure */
    else{
      if(this.drB&&(!this.k.B.bas||this.veut('B',0))){this.drB=false;                      /* la fin du drift : ↓ se relache D'ABORD ; jamais ↓ seul, qui freinerait */
        /* (relecture) puis la fleche, un repos plus tard (une main a coups : avant, lachee a la meme image que ↓, 1465 drifts sur 1466) */
        if(P.coups.actif&&(this.k.G.bas||this.k.D.bas))this.M.fin=Math.max(this.M.fin,i+this.tire('volant',P.coups.repos));}
      if(this.drB)this.volant(this.drCote);
      else{const v=this.consigne(mode);if(P.coups.actif)this.volantCoups(v);else this.volant(v);}}}
  if(!pris.B&&!pris.H){
    if(dr){this.veut('H',0);const f=this.k[dr>0?'G':'D'];
      if(this.drAv==null)this.drAv=this.tire('volant',P.drift.avance);                    /* (relecture) l'avance de la fleche : une par drift (une loi constante ne tire rien) */
      if(this.k.B.bas||(f.bas&&i-f.depuis>=this.drAv&&this.veut('B',1))){this.drB=true;this.drCote=dr;}} /* ↓ apres la fleche : le volant du jeu a depasse 0,35, ↓ ne freine pas */
    else{this.drAv=null;this.veut('H',mv.m<0);this.veut('B',mv.m>0);}}
  if(!pris.N){if(P.nitro.tenue&&mode==='sol')this.nitroHache(L.nitro.v);else this.veut('N',L.nitro.v);}
  this.i++;};
/* ===== LA SECONDE CHANCE (2026-11-24, doigts v2) =====
   Un joueur la prend en touchant la plaque « CONTINUER ▶ PUB » de l'ecran de mort. Le faux navigateur n'a pas de clic : la main appelle
   `chanceJoue()`, LA fonction que la plaque appelle (gameplay/seconde-chance.js), et s'impose ce que la plaque impose : l'offre ouverte
   (`chanceEtat().ok`), 36 images de garde, le toucher dans la fenetre. Rien d'autre n'est appele ni ecrit dans le jeu.
   MESURE dans ml/reel le 24/11 (graine 910407, mort a 39,9 s) : la plaque parait 114 images apres la decision qui voit la mort, la pub maison
   dure 5 s, la course reprend 311 images apres le toucher, un palier plus bas (moteur 3 → 2, 165 → 85 pieces), 3 s d'invulnerabilite.
   Entre la mort et la reprise : AUCUNE touche (ESPACE sauterait l'explosion, ENTREE relancerait une partie neuve).
   Au journal : [image,'C',1] = la plaque touchee et acceptee ; [image,'C',0] = l'attente abandonnee (sans effet dans le jeu). */
/* a chaque decision qui voit la mort (piloter.js). Rend true tant que la course doit continuer. */
Doigts.prototype.suiteMort=function(vue){
  const P=this.P,i=this.i;
  if(!this.fin){
    let veut=false;
    if(P.chance.prend>0){
      let offre=false;try{offre=this.J.ev(OFFRE_CODE)===true;}catch(x){}
      if(offre&&((vue&&vue.moteur)|0)+1>=P.chance.palierMin)veut=P.chance.prend>=1||this.H.chance()<P.chance.prend;} /* aucun tirage si l'offre est impossible */
    for(const c of ['volant','manche','nitro'])this.L[c].file=[];this.gf=null;this.geste=null;
    this.fin={depuis:i,ok:-1,clic:-1,image:-1,etat:veut?'attend':'non'};
    if(veut)this.chance.voulue=true;
    return veut;}
  const F=this.fin;
  if(F.etat==='attend')return true;
  if(F.etat==='pub')return i-F.image<=REPRISE.REPRISE_MAX;
  return false;};
/* a chaque image tant que la main attend : la plaque est-elle la ? puis le toucher, apres le delai tire */
Doigts.prototype.plaque=function(){
  const F=this.fin,i=this.i;if(!F||F.etat!=='attend')return;
  if(F.ok<0){
    let ok=false;try{ok=this.J.ev('chanceEtat().ok')===true;}catch(x){}
    if(ok){F.ok=i;this.chance.ok=i;F.clic=i+Math.max(REPRISE.GARDE,Math.min(this.tire('chance',this.P.chance.delai),REPRISE.FENETRE-60));}
    else if(i-F.depuis>=REPRISE.ATTENTE){this.touches.push([i,'C',0]);F.etat='abandon';F.image=i;}
    return;}
  if(i>=F.clic){
    let pris=false;try{pris=!!this.J.ev('chanceJoue()');}catch(x){}
    this.touches.push([i,'C',pris?1:0]);F.etat=pris?'pub':'abandon';F.image=i;this.chance.image=i;this.chance.prise=pris;}};
/* la course a repris (piloter.js l'a vu) : la main repart a neuf */
Doigts.prototype.revit=function(){this.fin=null;this.chance.reprise=this.i;this.neuf();};
/* la course s'arrete (limite de temps) alors que la main attendait encore la plaque : le journal doit le dire, sinon le rejeu s'arreterait a la mort */
Doigts.prototype.clot=function(){const F=this.fin;if(F&&F.etat==='attend'){this.touches.push([this.i,'C',0]);F.etat='abandon';F.image=this.i;}};
/* (2026-11-25, relecture) CE QUE LA MAIN SAIT D'ELLE-MEME, pour la vue d'un cerveau a profil (piloter.js : vue.main). LECTURE SEULE, aucun tirage.
   attente : dans combien d'images le dernier ordre donne atteindra la main, canal par canal (0 : deja arrive) ; geste : 'attend' (en route vers
   la main), 'joue' (en cours), null ; refuse : le dernier geste demande n'est pas parti (refuse, trop tot, un autre en cours, ou manque). */
Doigts.prototype.etatMain=function(){
  if(!this.P)return null;
  const L=this.L,i=this.i,att=c=>Math.max(0,L[c].dernier-i)|0;
  return {attente:{volant:att('volant'),manche:att('manche'),nitro:att('nitro')},geste:this.geste?'joue':this.gf?'attend':null,refuse:!!this.gRefus};};
/* ce que la main a fait de plus que les touches (pour le bilan de la course) */
Doigts.prototype.resume=function(){
  if(!this.P)return null;
  return {chance:Object.assign({},this.chance),imagesMortes:this.imagesMortes,gestesRates:this.gestesRates,erreursMain:Object.assign({},this.err)};};

module.exports={Doigts,HUMAIN,TOUCHE,traduire,normaliserProfil,MODELES,REPRISE,hasard,graineDe,quantile,tirer};
