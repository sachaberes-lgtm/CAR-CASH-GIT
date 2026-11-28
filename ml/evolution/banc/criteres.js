/* ===== LE BANC DES GENES V2 : LES CRITERES (28/11/2026, lot « genes v4 ») =====
   Contrat : ml/evolution/notes/genes-v4.md § 6.4 et § 6.5. Pur : la valeur d'une course pour un critere, « identique », la difference appariee.
   Les criteres (un par bras, annonce AVANT de jouer) :
     palier, F, E        : note.comparer (bootstrap apparie par graine, comme la validation de la selection) ;
     mesure + cle        : une des 15 cles de ressemblance.MESURES (l.mesures[cle] ; nulle sous 60 s : la graine compte si les deux en ont une) ;
     causes + famille    : le NOMBRE de morts de la course dont la cause est dans la famille, lu dans l.causesMorts (toutes les morts, la seconde
                           chance comprise) ; une ligne sans causesMorts n'est pas lue ;
     survie (l.survie_s), vols (l.vols).
   Un compteur (les declenchements) n'est JAMAIS un critere : chez le temoin le gene est eteint, son compteur vaut 0 par construction, et le bras
   « gagnerait » par construction (le piege de la seconde chance). Les compteurs sont des mesures secondaires (rapport.js).
   « Identique » : memes empreinte ET empreinteTouches (la graine, la carte et les touches font la course). empreinteVues n'en fait pas partie : un
   bras qui demande des lois aux yeux (loiFidele, secoursOn, coupOn, retourOn) a d'autres vues a chaque instant, meme sans un ordre change. */
'use strict';
const path=require('path');
const {ErreurBanc,zDe}=require('./plan');

const TYPES=['palier','F','E','mesure','causes','survie','vols'];
const PAR_COMPARER={palier:['dPalier','se_dPalier'],F:['dF','se_dF'],E:['dE','se_dE']};
const nombre=x=>typeof x==='number'&&x===x&&isFinite(x);

/* les 15 cles des mesures des joueurs (ml/bot/ressemblance.js) */
let MESURES=null;
function clesMesures(){
  if(!MESURES){const R=require(path.join(__dirname,'..','..','bot','ressemblance.js'));MESURES=R.MESURES.map(m=>Array.isArray(m)?m[0]:m.cle);}
  return MESURES;}

/* un critere lu et controle ; declics = la liste des noms de compteurs (Gn.DECLICS), pour refuser un compteur deguise */
function lireCritere(c,o){
  o=o||{};const declics=o.declics||[],quoi=o.quoi||'critere';
  if(!c||typeof c!=='object'||Array.isArray(c))throw new ErreurBanc(quoi+' : un objet {type, sens, …} attendu',1);
  const compteur=['compteur','compteurs','declenchements','declic','declics'].includes(c.type)||c.compteur!=null||c.declic!=null||
    (typeof c.cle==='string'&&declics.includes(c.cle))||(typeof c.nom==='string'&&declics.includes(c.nom));
  if(compteur)throw new ErreurBanc(quoi+' : un compteur n\'est jamais un critere principal (chez le temoin le gene est eteint : son compteur vaut 0 par '+
    'construction, le bras gagnerait par construction) ; le compteur est deja une mesure secondaire du banc',1);
  if(!TYPES.includes(c.type))throw new ErreurBanc(quoi+' : type inconnu « '+c.type+' » (connus : '+TYPES.join(', ')+')',1);
  if(c.sens!=='haut'&&c.sens!=='bas')throw new ErreurBanc(quoi+' : sens « haut » (plus = mieux) ou « bas » attendu (lu : '+JSON.stringify(c.sens)+')',1);
  const r={type:c.type,sens:c.sens};
  const permises={type:1,sens:1};
  if(c.type==='mesure'){
    permises.cle=1;
    if(!clesMesures().includes(c.cle))throw new ErreurBanc(quoi+' : mesure inconnue « '+c.cle+' » (connues : '+clesMesures().join(', ')+')',1);
    r.cle=c.cle;}
  if(c.type==='causes'){
    permises.famille=1;
    if(!Array.isArray(c.famille)||!c.famille.length||c.famille.some(x=>typeof x!=='string'||!x))
      throw new ErreurBanc(quoi+' : famille = une liste non vide de causes de mort (des chaines) attendue',1);
    if(new Set(c.famille).size!==c.famille.length)throw new ErreurBanc(quoi+' : une cause en double dans la famille',1);
    r.famille=c.famille.slice();}
  for(const k of Object.keys(c))if(!permises[k])throw new ErreurBanc(quoi+' : cle inconnue « '+k+' » pour le type '+c.type,1);
  return r;}

/* le critere en mots (resume.txt, journal.md) */
function dire(c){
  const s=c.sens==='haut'?'plus = mieux':'moins = mieux';
  if(c.type==='palier')return 'le palier ('+s+')';
  if(c.type==='F')return 'la note F = palier - 4 E ('+s+')';
  if(c.type==='E')return 'l\'ecart aux joueurs E ('+s+')';
  if(c.type==='mesure')return 'la mesure '+c.cle+' ('+s+')';
  if(c.type==='causes')return 'les morts par '+c.famille.join(' / ')+' ('+s+')';
  if(c.type==='survie')return 'la survie en s ('+s+')';
  if(c.type==='vols')return 'le nombre de vols ('+s+')';
  return c.type;}

/* la valeur d'une course pour un critere simple ; null = pas mesurable sur cette course */
function valeur(l,c){
  if(!l)return null;
  if(c.type==='mesure'){const v=l.mesures&&l.mesures[c.cle];return nombre(v)?v:null;}
  if(c.type==='causes'){if(!Array.isArray(l.causesMorts))return null;let k=0;for(const x of l.causesMorts)if(c.famille.includes(x))k++;return k;}
  if(c.type==='survie')return nombre(l.survie_s)?l.survie_s:null;
  if(c.type==='vols')return nombre(l.vols)?l.vols:null;
  if(c.type==='palier')return nombre(l.palier)?l.palier:null;
  return null;}

/* deux courses identiques : memes empreinte et empreinteTouches (toutes deux connues) */
function identique(a,b){
  return !!a&&!!b&&a.empreinte!=null&&a.empreinte===b.empreinte&&a.empreinteTouches!=null&&a.empreinteTouches===b.empreinteTouches;}

/* la difference appariee d'un critere simple sur des paires {b, t} (bras, temoin) : d_g = x_bras - x_temoin ; d = la moyenne ;
   se = ecart-type (n - 1) / racine(m) ; z = d / se */
function apparie(paires,c){
  const D=[];
  for(const p of paires){const xb=valeur(p.b,c),xt=valeur(p.t,c);if(xb!=null&&xt!=null)D.push(xb-xt);}
  const m=D.length;
  if(!m)return {m:0,d:null,se:null,z:null};
  let s=0;for(const x of D)s+=x;const d=s/m;
  /* (28/11, le relecteur « banc-courses ») une seule graine mesurable : l'ecart-type (n - 1) n'existe pas. Avant, se valait 0, donc z = +inf
     ou -inf des que d != 0, et la borne (finie) etait franchie : un « net » sur UNE course (une mesure nulle sous 60 s chez les autres graines,
     par exemple). Rien n'est decidable sur une graine : z = null (jamais net ; futilite des le 2e regard). */
  if(m<2)return {m,d,se:null,z:null};
  let q=0;for(const x of D)q+=(x-d)*(x-d);
  const se=m>1?Math.sqrt(q/(m-1))/Math.sqrt(m):0;
  return {m,d,se,z:zDe(d,se)};}

/* LA STATISTIQUE D'UN BRAS A UN REGARD. paires : les graines mesurees chez le bras et chez le temoin, dans l'ordre du plan.
   o = {N (note.js), REF, cfg, rng} pour palier, F, E : note.comparer(bras, temoin) -> d, se (bootstrap), m = ses graines. */
function statistique(paires,c,o){
  if(PAR_COMPARER[c.type]){
    if(!paires.length)return {m:0,d:null,se:null,z:null};
    const cmp=o.N.comparer(paires.map(p=>p.b),paires.map(p=>p.t),{REF:o.REF,cfg:o.cfg,rng:o.rng});
    const [kd,ks]=PAR_COMPARER[c.type],d=cmp[kd],se=cmp[ks];
    /* (28/11, le relecteur « banc-courses ») une graine : le bootstrap rend se = 0, donc z infini ; comme apparie, rien n'est decidable */
    if(!(cmp.graines>=2))return {m:cmp.graines,d:nombre(d)?d:null,se:null,z:null};
    return {m:cmp.graines,d:nombre(d)?d:null,se:nombre(se)?se:null,z:zDe(d,se)};}
  return apparie(paires,c);}

/* f : la part des graines mesurees ou la course du bras n'est pas identique a celle du temoin (null sans graine) */
function partChangee(paires){
  if(!paires.length)return {identiques:0,f:null};
  let k=0;for(const p of paires)if(identique(p.b,p.t))k++;
  return {identiques:k,f:(paires.length-k)/paires.length};}

module.exports={TYPES,PAR_COMPARER,clesMesures,lireCritere,dire,valeur,identique,apparie,statistique,partChangee};
