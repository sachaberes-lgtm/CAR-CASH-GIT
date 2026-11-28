/* ===== LE HASARD ET LES GRAINES DE LA SELECTION NATURELLE (27/11/2026, Sacha : « une population de pilotes evolue seule sur un PC,
   le moins bon est vire a chaque generation ») =====
   Contrat : ml/evolution/INTERFACES.md § 2.5 (il fait foi). Specification : SPECIFICATION.md § 5.1.
   - mulberry32 : le seul generateur de ml/evolution (jamais Math.random). Son etat tient dans un entier 32 bits non signe, sauve dans
     population.json : une reprise refait exactement les memes tirages.
   - rngDe(texte) : un generateur tire d'un sha1, pour les bootstraps de note.js ; il n'use JAMAIS l'etat du maitre.
   - les graines : entrainement 910000 + 37·i (i de 0 a 1080, sans remise, puis avec remise hors des 5 derniers lots), validation
     1 000 000 + 37·k (une seule fois chacune, compteur global ; repli 950000 + 37·k, k < 1081, puis fin avec alerte), coffre 990000 + 37·j fixes.
   Aucune ecriture de fichier, aucun etat global : tout ce qui change est rendu (eg neuf). */
'use strict';
const crypto=require('crypto');

/* ===== LE GENERATEUR (formule EXACTE du contrat) ===== */
/* (le parametre ne s'appelle pas « etat » : la fonction etat() plus bas, hissee, le masquerait et tout generateur partirait de 0) */
function mulberry32(etatDepart){
  let a=etatDepart|0;
  function suivant(){
    a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);
    t=(t+Math.imul(t^(t>>>7),61|t))^t;return ((t^(t>>>14))>>>0)/4294967296;}
  function entier(n){return Math.floor(suivant()*n);}
  /* Box-Muller : u1 puis u2, sans cache (chaque normal() use deux tirages) */
  function normal(){const u1=suivant(),u2=suivant();return Math.sqrt(-2*Math.log(1-u1))*Math.cos(2*Math.PI*u2);}
  /* Knuth */
  function poisson(l){const L=Math.exp(-l);let k=0,p=1;do{k++;p*=suivant();}while(p>L);return k-1;}
  function choisir(T){if(!T||!T.length)throw new Error('graines : choisir dans un tableau vide');return T[entier(T.length)];}
  /* Fisher-Yates de la fin vers le debut, en place */
  function melanger(T){for(let i=T.length-1;i>0;i--){const j=entier(i+1),x=T[i];T[i]=T[j];T[j]=x;}return T;}
  function etat(){return a>>>0;}
  return {suivant,entier,normal,poisson,choisir,melanger,etat};
}

function sha1(x){return crypto.createHash('sha1').update(x).digest('hex');}
function rngDe(texte){return mulberry32(parseInt(sha1(String(texte)).slice(0,8),16));}

/* ===== LES GRAINES ===== */
function cfgGraines(cfg){
  const g=cfg&&cfg.graines;
  if(!g||!g.entrainement||!g.validation||!g.coffre)throw new Error('graines : cfg.graines incomplet (entrainement, validation, coffre)');
  return g;}

/* ===== LA RESERVE D'ENTRAINEMENT QUI TIENT DES ANNEES (28/11/2026, lot « regles » ; la synthese ml/ecurie/etude/reglage-de-la-selection/LISEZ-MOI.md
   § 4 M6 : « 1 081 graines, epuisees apres environ 90 generations a 12 graines ») =====
   Avant : 1 081 graines (910000 + 37·i), puis un RETIRAGE avec remise parmi elles (hors des 5 derniers lots) : un ancien retombait sur une graine
   qu'il avait jouee (le cache la rendait, il n'apprenait rien) et un enfant sur une graine que son parent connaissait. Sans rien dire.
   Maintenant : la meme progression continue APRES les plages reservees. Un indice i de la reserve donne
     i < n (1 081)  : depart + pas·i            910000 a 949960 (la plage d'avant, inchangee : une selection deja commencee continue au bit pres) ;
     i >= n         : suite.depart + suite.pas·(i − n), jusqu'a suite.fin   1000021 a 999999984 (27 000 000 graines).
   1000021 = 910000 + 37·2433 : la meme progression (910000 modulo 37 = 22), qui SAUTE 950000 a 999999 (le repli de la validation et la validation de
   la boucle payante, 950000 a 989999 ; le coffre, 990000 a 991443). Elle ne rencontre jamais la validation de la selection (1 000 000 + 37·k : 1 modulo
   37), si loin qu'elle monte. Les graines deja jouees restent jouees : la suite ne reprend aucune graine de la plage d'avant.
   La reserve reste un tableau d'au plus n indices : quand elle est vide, elle recoit le BLOC suivant de n indices de la suite (eg.blocs = le nombre de
   blocs deja recus apres le premier ; absent = 0, un etat d'avant ce lot). Le tirage dans un bloc est celui d'avant (rng.entier puis splice).
   27 000 000 graines = 2 250 000 generations a 12 graines (3 375 000 a 8). Au bout (et seulement si cfg.graines.auBout ne vaut pas "rejouer") :
   grainesEntrainement LEVE une erreur claire (« graines d'entrainement epuisees ») plutot que de rejouer en silence ; evoluer.js la voit AVANT les
   naissances (grainesRestantes) et s'arrete sans rien ecrire. auBout "rejouer" (ou une config sans suite et sans auBout) : l'ancien retirage. */
function suiteDe(E){
  const S=E.suite;
  if(!S)return null;
  if(!(Number.isInteger(S.depart)&&Number.isInteger(S.pas)&&S.pas>0&&Number.isInteger(S.fin)&&S.fin>=S.depart&&S.fin<=2147483647))
    throw new Error('graines : cfg.graines.entrainement.suite mal ecrite (depart, pas, fin entiers, fin >= depart, fin <= 2147483647)');
  if(S.depart<=E.depart+E.pas*(E.n-1))throw new Error('graines : la suite d\'entrainement doit commencer apres la plage d\'avant');
  return {depart:S.depart,pas:S.pas,n:Math.floor((S.fin-S.depart)/S.pas)+1};}
/* la graine d'un indice de la reserve */
function graineDe(E,i){
  if(i<E.n)return E.depart+E.pas*i;
  const S=suiteDe(E);
  if(!S||i-E.n>=S.n)throw new Error('graines : indice d\'entrainement hors de la reserve ('+i+')');
  return S.depart+S.pas*(i-E.n);}
/* le bloc b (b >= 1) de la suite : les indices n + (b-1)·n a n + b·n − 1, coupes a la fin de la suite ; [] au-dela */
function blocDe(E,b){
  const S=suiteDe(E);if(!S)return [];
  const a=E.n+(b-1)*E.n,z=Math.min(E.n+b*E.n,E.n+S.n),r=[];
  for(let i=a;i<z;i++)r.push(i);
  return r;}
/* rejouer au bout : explicite (auBout "rejouer"), ou une config d'avant ce lot (sans suite ni auBout) */
const rejouerAuBout=G=>G.auBout==='rejouer'||(G.auBout==null&&!G.entrainement.suite);

function etatInitial(cfg){
  const n=cfgGraines(cfg).entrainement.n,reserve=[];for(let i=0;i<n;i++)reserve.push(i);
  return {reserve:reserve,recentes:[],validationK:0,validationRepli:false,validationFinie:false,blocs:0};}

function copieEtat(eg){
  return {reserve:eg.reserve.slice(),recentes:(eg.recentes||[]).map(l=>l.slice()),validationK:eg.validationK|0,
    validationRepli:!!eg.validationRepli,validationFinie:!!eg.validationFinie,blocs:eg.blocs|0};}

/* combien de graines d'entrainement neuves restent (la reserve et les blocs a venir) ; Infinity si l'on rejoue au bout */
function grainesRestantes(eg,cfg){
  const G=cfgGraines(cfg),E=G.entrainement,S=suiteDe(E);
  if(rejouerAuBout(G))return Infinity;
  const recus=(eg.blocs|0)*E.n;   /* indices de la suite deja passes dans la reserve */
  return eg.reserve.length+(S?Math.max(0,S.n-recus):0);}

/* n graines d'entrainement : indices tires SANS remise dans la reserve (rng.entier puis splice) ; reserve vide : le bloc suivant de la suite ;
   plus de bloc : erreur claire, ou (auBout "rejouer") retirage avec remise parmi les n de la plage d'avant, hors des graines des lots recents
   (et hors de celles deja prises dans ce lot : un lot n'a jamais deux fois la meme graine). */
function grainesEntrainement(eg,rng,n,cfg){
  const G=cfgGraines(cfg),E=G.entrainement,garder=G.exclureRecentes==null?5:G.exclureRecentes;
  if(!(n>=0)||n!==Math.floor(n))throw new Error('graines : nombre de graines invalide « '+n+' »');
  const e=copieEtat(eg),graines=[],pris=new Set();
  if(!rejouerAuBout(G)&&grainesRestantes(e,cfg)<n)
    throw Object.assign(new Error('graines : les graines d\'entrainement sont epuisees ('+grainesRestantes(e,cfg)+' neuves restent, '+n+' demandees) : '+
      'aucune ne sera rejouee ; allonger cfg.graines.entrainement.suite.fin (sans toucher aux plages reservees) ou mettre cfg.graines.auBout a "rejouer"'),{code:'GRAINES_EPUISEES'});
  for(let t=0;t<n;t++){
    let i;
    if(!e.reserve.length&&!rejouerAuBout(G)){e.blocs++;e.reserve=blocDe(E,e.blocs);}
    if(e.reserve.length){const k=rng.entier(e.reserve.length);i=e.reserve.splice(k,1)[0];}
    else{
      const exclues=new Set();for(const lot of e.recentes)for(const g of lot)exclues.add(g);
      let cand=[];for(let j=0;j<E.n;j++){const g=E.depart+E.pas*j;if(!exclues.has(g)&&!pris.has(g))cand.push(j);}
      if(!cand.length){cand=[];for(let j=0;j<E.n;j++)if(!pris.has(E.depart+E.pas*j))cand.push(j);}
      if(!cand.length)throw new Error('graines : plus aucune graine d\'entrainement disponible ('+n+' demandees, '+E.n+' en tout)');
      i=cand[rng.entier(cand.length)];}
    const g=graineDe(E,i);graines.push(g);pris.add(g);}
  e.recentes.push(graines.slice());while(e.recentes.length>garder)e.recentes.shift();
  return {graines:graines,eg:e};}

/* n graines de validation neuves (chacune ne sert qu'une fois) */
function grainesValidation(eg,n,cfg){
  const V=cfgGraines(cfg).validation,e=copieEtat(eg);
  if(e.validationFinie)return {graines:[],eg:e,alerte:'graines : les graines de validation sont epuisees (plus aucune validation)'};
  const graines=[];
  if(!e.validationRepli){for(let k=e.validationK;k<e.validationK+n;k++)graines.push(V.depart+V.pas*k);e.validationK+=n;return {graines,eg:e,alerte:null};}
  const R=V.repli;
  if(e.validationK+n>R.n){e.validationFinie=true;
    return {graines:[],eg:e,alerte:'graines : repli des validations epuise ('+e.validationK+' graines usees sur '+R.n+', '+n+' demandees) : plus aucune validation'};}
  for(let k=e.validationK;k<e.validationK+n;k++)graines.push(R.depart+R.pas*k);
  e.validationK+=n;return {graines,eg:e,alerte:null};}

function grainesCoffre(cfg){const C=cfgGraines(cfg).coffre,r=[];for(let j=0;j<C.n;j++)r.push(C.depart+C.pas*j);return r;}

module.exports={mulberry32,rngDe,etatInitial,grainesEntrainement,grainesValidation,grainesCoffre,
  grainesRestantes,graineDe};   /* (28/11, lot « regles ») la reserve qui tient des annees */

/* ===== LIGNE DE COMMANDE : node graines.js --essai (trois tirages de demonstration) ===== */
if(require.main===module){
  const A=process.argv.slice(2);
  if(!A.includes('--essai')){process.stderr.write('graines : usage « node graines.js --essai »\n');process.exit(1);}
  const path=require('path'),fs=require('fs');
  const cfg=JSON.parse(fs.readFileSync(path.join(__dirname,'config.json'),'utf8'));
  const rng=mulberry32(cfg.graineMaitre);let eg=etatInitial(cfg);
  for(let t=1;t<=3;t++){const r=grainesEntrainement(eg,rng,cfg.grainesParGeneration,cfg);eg=r.eg;
    console.log('tirage '+t+' : '+r.graines.join(' ')+' (reserve '+eg.reserve.length+', etat '+rng.etat()+')');}
  const v=grainesValidation(eg,cfg.validation.graines,cfg);
  console.log('validation : '+v.graines[0]+' .. '+v.graines[v.graines.length-1]+' ('+v.graines.length+') ; coffre : '+grainesCoffre(cfg).slice(0,3).join(' ')+' ...');
}
