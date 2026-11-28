/* ===== LE BANC DES GENES V2 : LE PLAN ET LA REGLE SEQUENTIELLE (28/11/2026, lot « genes v4 ») =====
   Contrat : ml/evolution/notes/genes-v4.md § 6.5 et § 6.6. Tout ici est PUR (aucun fichier lu ni ecrit, aucun hasard libre).
   - lirePlan(p)                : le plan d'une vague (premier, pas, plafond, alpha, futilite, fMin), controle ; une faute -> ErreurBanc code 1 ;
   - regardsDe(plan)            : le nombre de graines a chaque regard (24, 48, … 192 par defaut : 8 regards) ;
   - constanteOBF(alpha, R)     : la constante c d'O'Brien-Fleming, par simulation de la marche aleatoire aux temps des regards
                                  (200 000 chemins, mulberry32(20261128), une normale par increment, dichotomie a 40 pas) ;
   - borne(plan, c, m)          : c x racine(plafond / m) (m = les graines mesurees chez le bras et chez le temoin) ;
   - decision(plan, x)          : net-aide | net-nuit | rare | futilite | plafond | continuer (l'ordre du contrat) ;
   - graine(numero, i)          : 4 000 000 + 37 x (1 000 x (numero - 1) + i) ; NUMERO_MAX, PLAFOND_MAX.
   Pourquoi la dichotomie suffit : a chaque regard, |z_j| >= c racine(N / n_j) revient a |S_j| >= c racine(N) (S_j = la somme des differences,
   z_j = S_j / racine(n_j)) : la borne d'O'Brien-Fleming est une droite sur la somme. c est donc le quantile 1 - alpha du maximum, sur les regards, de
   |S_j| / racine(N) ; la dichotomie le trouve a 1e-11 pres. */
'use strict';
const path=require('path');
const Gr=require(path.join(__dirname,'..','graines'));

/* une faute d'entree, avec son code de sortie (§ 6.8) */
class ErreurBanc extends Error{constructor(message,code){super(message);this.code=code;}}

const DEFAUT=Object.freeze({premier:24,pas:24,plafond:192,alpha:0.05,futilite:0.5,fMin:0.1});
const PLAFOND_MAX=1000;      /* au-dela, deux vagues voisines partageraient des graines (§ 6.6) */
const NUMERO_MAX=50000;      /* au-dela d'environ 58 000, la graine deviendrait negative pour le jeu (n|0) */
const CHEMINS=200000,GRAINE_OBF=20261128,PAS_DICHOTOMIE=40;

const entier=x=>typeof x==='number'&&x===Math.floor(x)&&isFinite(x);
const nombre=x=>typeof x==='number'&&x===x&&isFinite(x);

function lirePlan(p){
  if(p!=null&&(typeof p!=='object'||Array.isArray(p)))throw new ErreurBanc('plan : un objet {premier, pas, plafond, alpha, futilite, fMin} attendu',1);
  const P=Object.assign({},DEFAUT,p||{});
  for(const k of Object.keys(p||{}))if(!(k in DEFAUT))throw new ErreurBanc('plan : cle inconnue « '+k+' » (connues : '+Object.keys(DEFAUT).join(', ')+')',1);
  if(!entier(P.premier)||P.premier<1)throw new ErreurBanc('plan : premier doit etre un entier >= 1 (lu : '+JSON.stringify(P.premier)+')',1);
  if(!entier(P.pas)||P.pas<1)throw new ErreurBanc('plan : pas doit etre un entier >= 1 (lu : '+JSON.stringify(P.pas)+')',1);
  if(!entier(P.plafond)||P.plafond<P.premier)throw new ErreurBanc('plan : plafond doit etre un entier >= premier (lu : '+JSON.stringify(P.plafond)+')',1);
  if(P.plafond>PLAFOND_MAX)throw new ErreurBanc('plan : plafond '+P.plafond+' refuse (au plus '+PLAFOND_MAX+' : une vague a 1 000 graines a elle)',1);
  if(!nombre(P.alpha)||!(P.alpha>0&&P.alpha<0.5))throw new ErreurBanc('plan : alpha doit etre un nombre dans ]0 ; 0,5[ (lu : '+JSON.stringify(P.alpha)+')',1);
  if(!nombre(P.futilite)||P.futilite<0)throw new ErreurBanc('plan : futilite doit etre un nombre >= 0 (lu : '+JSON.stringify(P.futilite)+')',1);
  if(!nombre(P.fMin)||P.fMin<0||P.fMin>=1)throw new ErreurBanc('plan : fMin doit etre un nombre dans [0 ; 1[ (lu : '+JSON.stringify(P.fMin)+')',1);
  return P;}

/* les graines a chaque regard : premier, premier + pas, … ; le dernier vaut toujours plafond */
function regardsDe(plan){
  const R=[];let n=plan.premier;
  for(;;){R.push(Math.min(n,plan.plafond));if(n>=plan.plafond)break;n+=plan.pas;}
  return R;}

/* LA CONSTANTE D'O'BRIEN-FLEMING : la probabilite, sous « aucun effet », de franchir la borne a au moins un regard vaut alpha (bilateral).
   o.chemins, o.sansMemoire : pour les tests seulement (le banc prend toujours 200 000). Memoire : meme entree -> meme nombre, calcule une fois. */
const MEMO=new Map();
function constanteOBF(alpha,regards,o){
  const chemins=o&&o.chemins?o.chemins:CHEMINS;
  if(!(alpha>0&&alpha<1))throw new Error('plan : constanteOBF : alpha dans ]0 ; 1[');
  if(!Array.isArray(regards)||!regards.length||regards.some((n,i)=>!entier(n)||n<1||(i&&n<=regards[i-1])))throw new Error('plan : constanteOBF : regards croissants attendus');
  const cle=alpha+'|'+regards.join(',')+'|'+chemins;
  if(MEMO.has(cle)&&!(o&&o.sansMemoire))return MEMO.get(cle);
  const N=regards[regards.length-1],rN=Math.sqrt(N),rng=Gr.mulberry32(GRAINE_OBF);
  const inc=regards.map((n,i)=>Math.sqrt(n-(i?regards[i-1]:0)));
  const M=new Float64Array(chemins);
  for(let p=0;p<chemins;p++){let S=0,mx=0;for(let j=0;j<inc.length;j++){S+=rng.normal()*inc[j];const a=Math.abs(S);if(a>mx)mx=a;}M[p]=mx/rN;}
  let lo=0,hi=20;
  for(let t=0;t<PAS_DICHOTOMIE;t++){const c=(lo+hi)/2;let k=0;for(let p=0;p<chemins;p++)if(M[p]>=c)k++;if(k/chemins>alpha)lo=c;else hi=c;}
  const c=(lo+hi)/2;
  MEMO.set(cle,c);
  return c;}

/* la borne au regard ou m graines sont mesurees chez les deux ; aucune graine : +inf (rien ne peut etre net) */
function borne(plan,c,m){return m>0?c*Math.sqrt(plan.plafond/m):Infinity;}

/* z = d / se ; se = 0 : +inf / -inf si d != 0, sinon 0 (comme zDe d'evoluer.js) ; d absent : null */
function zDe(d,se){
  if(!nombre(d))return null;
  if(se>0)return d/se;
  return d>0?Infinity:d<0?-Infinity:0;}

/* LA DECISION D'UN REGARD, pour un bras actif. x = {j (1 = premier regard), n (graines du plan lues a ce regard), z, borne, f (part des graines
   changees, null si aucune graine mesuree), sens ('haut' | 'bas')}. L'ordre est celui du contrat (§ 6.5). z nul (aucune graine mesurable pour le
   critere) : jamais net ; compte comme |z| = 0 pour la futilite. */
function decision(plan,x){
  const z=x.z;
  if(z!=null&&x.borne!=null&&isFinite(x.borne)&&Math.abs(z)>=x.borne){
    const monte=z>0;
    return (x.sens==='bas'?!monte:monte)?'net-aide':'net-nuit';}
  if(x.j===1&&plan.fMin>0&&(x.f==null||x.f<plan.fMin))return 'rare';
  if(x.j>=2&&(z==null||Math.abs(z)<plan.futilite))return 'futilite';
  if(x.n>=plan.plafond)return 'plafond';
  return 'continuer';}

/* LES GRAINES (§ 6.6) : une plage a lui, reste 4 modulo 37 ; le numero 0 (l'essai) prend 3 963 000 a 3 999 963 */
const DEPART=4000000,PAS_GRAINE=37,PAR_VAGUE=1000;
function graine(numero,i){
  if(!entier(numero)||numero<0||numero>NUMERO_MAX)throw new ErreurBanc('graines : numero de vague '+JSON.stringify(numero)+' hors de 0..'+NUMERO_MAX,1);
  if(!entier(i)||i<0||i>=PAR_VAGUE)throw new ErreurBanc('graines : indice '+JSON.stringify(i)+' hors de 0..'+(PAR_VAGUE-1),1);
  return DEPART+PAS_GRAINE*(PAR_VAGUE*(numero-1)+i);}

module.exports={ErreurBanc,DEFAUT,PLAFOND_MAX,NUMERO_MAX,CHEMINS,GRAINE_OBF,DEPART,PAS_GRAINE,PAR_VAGUE,lirePlan,regardsDe,constanteOBF,borne,zDe,decision,graine};
