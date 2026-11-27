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

function etatInitial(cfg){
  const n=cfgGraines(cfg).entrainement.n,reserve=[];for(let i=0;i<n;i++)reserve.push(i);
  return {reserve:reserve,recentes:[],validationK:0,validationRepli:false,validationFinie:false};}

function copieEtat(eg){
  return {reserve:eg.reserve.slice(),recentes:eg.recentes.map(l=>l.slice()),validationK:eg.validationK|0,
    validationRepli:!!eg.validationRepli,validationFinie:!!eg.validationFinie};}

/* n graines d'entrainement : indices tires SANS remise dans la reserve (rng.entier puis splice) ; reserve vide : retirage avec remise parmi
   les n de la table, hors des graines des lots recents (et hors de celles deja prises dans ce lot : un lot n'a jamais deux fois la meme graine). */
function grainesEntrainement(eg,rng,n,cfg){
  const G=cfgGraines(cfg),E=G.entrainement,garder=G.exclureRecentes==null?5:G.exclureRecentes;
  if(!(n>=0)||n!==Math.floor(n))throw new Error('graines : nombre de graines invalide « '+n+' »');
  const e=copieEtat(eg),graines=[],pris=new Set();
  for(let t=0;t<n;t++){
    let i;
    if(e.reserve.length){const k=rng.entier(e.reserve.length);i=e.reserve.splice(k,1)[0];}
    else{
      const exclues=new Set();for(const lot of e.recentes)for(const g of lot)exclues.add(g);
      let cand=[];for(let j=0;j<E.n;j++){const g=E.depart+E.pas*j;if(!exclues.has(g)&&!pris.has(g))cand.push(j);}
      if(!cand.length){cand=[];for(let j=0;j<E.n;j++)if(!pris.has(E.depart+E.pas*j))cand.push(j);}
      if(!cand.length)throw new Error('graines : plus aucune graine d\'entrainement disponible ('+n+' demandees, '+E.n+' en tout)');
      i=cand[rng.entier(cand.length)];}
    const g=E.depart+E.pas*i;graines.push(g);pris.add(g);}
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

module.exports={mulberry32,rngDe,etatInitial,grainesEntrainement,grainesValidation,grainesCoffre};

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
