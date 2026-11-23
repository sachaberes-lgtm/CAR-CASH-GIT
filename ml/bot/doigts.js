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

function Doigts(J,lireMode){
  const D=this;
  D.J=J;D.lireMode=lireMode||null;D.image0=0;D.i=0;D.touches=[];D.refus=0;
  D.k={};for(const n in TOUCHE)D.k[n]={bas:false,depuis:-999,debut:-999,duree:999};
  D.o={volant:0,manche:0,nitro:false};
  D.pwm={cote:null,on:false,n:0};
  D.geste=null;D.dernierGeste=-999;D.nBloque=-999;
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
Doigts.prototype.ordre=function(o,vue){
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
  const g=this.geste,H=HUMAIN,dr=g.dir?DIR[g.dir]:null;
  /* LA MISE EN PLACE : la NITRO relachee, la direction posee — chaque touche a son rythme (jamais un appui plus court que HUMAIN.appui).
     Le geste ne part que la main en place : 4 images au plus. */
  if(g.t===0){
    let pret=this.veut('N',0);
    if(dr)for(const n of ['G','D','B','H'])pret=this.veut(n,dr[n])&&pret;
    if(!pret)return dr?{N:1,G:1,D:1,B:1,H:1}:{N:1};
    g.t=1;return dr?{N:1,G:1,D:1,B:1,H:1}:{N:1};}
  const t=(g.t++)-1;
  if(g.nom==='redresser'){ /* un appui bref, seul : la caisse se remet face a la route */
    if(t===H.repos)this.pose('N',1);
    if(t===H.repos+H.tap){this.pose('N',0);this.nBloque=this.i+H.seul;this.geste=null;}
    return {N:1};}
  /* figure / saut : la direction, puis deux appuis brefs sur NITRO */
  const a=H.repos,b=a+H.tap,c=b+H.entre,d=c+H.tap;
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
Doigts.prototype.image=function(){
  const o=this.o,pris=this.geste?this.joueGeste():{};
  if(!pris.G&&!pris.D)this.volant(o.volant);
  if(!pris.B&&!pris.H){this.veut('H',o.manche<0);this.veut('B',o.manche>0);}
  if(!pris.N)this.veut('N',o.nitro);
  this.i++;};
Doigts.prototype.lache=function(){for(const n in TOUCHE)if(this.k[n].bas)this.pose(n,0);this.geste=null;};

module.exports={Doigts,HUMAIN,TOUCHE,traduire};
