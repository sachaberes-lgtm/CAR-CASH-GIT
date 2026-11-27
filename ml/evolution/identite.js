#!/usr/bin/env node
/* ===== LE CONTROLE D'AVANT-NUIT : LE TEMOIN REJOUE PILOTE-VOLTIGE AU BIT PRES (2026-11-27, etape 2 — SPECIFICATION.md § 4.3, INTERFACES.md § 2.7) =====
   Le genome temoin (REGLAGES de pilote-voltige.js, les 14 constantes a leur valeur, la loi « retour » coupee, W2 = 0) est ecrit par genome.ecrirePilote
   et joue contre le texte de ml/ecurie/pilote-voltige.js, graine par graine, chacun dans un processus neuf (courses.creer : cache coupe, rien d'ecrit).
   Identique = les trois empreintes egales : celle de la course (bilan.empreinte), celle des vues donnees au cerveau, celle des touches.
   Si ce controle rate, le pilote fabrique n'est plus pilote-voltige a la naissance : evoluer.js s'arrete (code 1).
   verifierW2 : le contraire — un genome temoin dont la tete RAYON a W2 = 0,5 partout doit donner une course DIFFERENTE sur au moins une graine.
   identite.js n'ecrit RIEN (ni cache, ni pilotes, ni journal).
   Ligne de commande : node ml/evolution/identite.js [--graines 910000,910037,910074] [--tmax 45] [--travailleurs 3] [--w2] [--config f.json] */
'use strict';
const fs=require('fs'),path=require('path');
const C=require('./commun'),Gn=require('./genome'),K=require('./courses');

const EMPREINTES=['empreinte','empreinteVues','empreinteTouches'];
const resume=l=>l?{empreinte:l.empreinte||null,empreinteVues:l.empreinteVues||null,empreinteTouches:l.empreinteTouches||null,palier:l.palier,survie_s:l.survie_s,vols:l.vols,
  erreurs:l.erreurs,derniereErreur:l.derniereErreur||null,mesuree:l.mesuree,raison:l.raison||null}:null;

/* jouer des textes de pilote sur des graines, un processus neuf par course, sans cache ni ecriture.
   textes : [{nom, source, fichier?}] -> Promise<{nom:[Ligne|null par graine]}> */
async function jouerTextes(o){
  const cfg=o.cfg||C.lireConfig(),graines=o.graines,tmax=o.tmax;
  const ord=K.creer({cfg,cache:false,ecrire:false,travailleurs:o.travailleurs||Math.min(4,graines.length*o.textes.length),journal:o.journal});
  const taches=[];
  for(const g of graines)for(const t of o.textes)
    taches.push({source:t.source,fichier:t.fichier||(t.nom+'.js'),shaPilote:Gn.shaPilote(t.source),id:'identite:'+t.nom,graine:g,tmax,usage:'essai',generation:null});
  let L;
  try{L=await ord.demander(taches);}finally{await ord.arreter();}
  const r={};for(const t of o.textes)r[t.nom]=[];
  let i=0;for(const g of graines)for(const t of o.textes)r[t.nom].push(L[i++]||null);
  return r;}

function pareil(a,b){return !!(a&&b)&&EMPREINTES.every(k=>a[k]&&a[k]===b[k]);}
function lesGraines(cfg,o){return (o.graines||(cfg.identite&&cfg.identite.graines)||[910000,910037,910074]).map(Number);}
function laDuree(cfg,o){return +(o.tmax||(cfg.identite&&cfg.identite.tmax)||45);}

async function verifier(o){
  o=o||{};const cfg=o.cfg||C.lireConfig(),graines=lesGraines(cfg,o),tmax=laDuree(cfg,o);
  const temoin=Gn.ecrirePilote(Gn.genomeTemoin(cfg),{cfg}),voltige=fs.readFileSync(Gn.VOLTIGE,'utf8');
  const R=await jouerTextes({cfg,graines,tmax,travailleurs:o.travailleurs,journal:o.journal,
    textes:[{nom:'evolution',source:temoin,fichier:'evolution.js'},{nom:'voltige',source:voltige,fichier:'pilote-voltige.js'}]});
  const lignes=graines.map((g,i)=>{const a=R.evolution[i],b=R.voltige[i];return {graine:g,temoin:resume(a),voltige:resume(b),identique:pareil(a,b)};});
  return {ok:lignes.every(l=>l.identique),lignes};}

/* un genome temoin dont la tete RAYON a W2 = 0,5 partout : sa course doit differer de celle de pilote-voltige sur au moins une graine */
function genomeW2(cfg,tete,valeur){
  const g=Gn.genomeTemoin(cfg),T=Gn.TETES[tete||'rayon'];
  for(let i=T.nW1;i<T.nW1+T.nW2;i++)g[T.cle][i]=valeur==null?.5:valeur;
  return Gn.reparer(g,cfg);}
async function verifierW2(o){
  o=o||{};const cfg=o.cfg||C.lireConfig(),graines=lesGraines(cfg,o),tmax=laDuree(cfg,o);
  const w2=Gn.ecrirePilote(genomeW2(cfg,'rayon',.5),{cfg}),voltige=fs.readFileSync(Gn.VOLTIGE,'utf8');
  const R=await jouerTextes({cfg,graines,tmax,travailleurs:o.travailleurs,journal:o.journal,
    textes:[{nom:'w2',source:w2,fichier:'evolution.js'},{nom:'voltige',source:voltige,fichier:'pilote-voltige.js'}]});
  const lignes=graines.map((g,i)=>{const a=R.w2[i],b=R.voltige[i];return {graine:g,w2:resume(a),voltige:resume(b),identique:pareil(a,b)};});
  return {ok:lignes.some(l=>!l.identique)&&lignes.every(l=>l.w2&&l.w2.empreinte&&!l.w2.erreurs),lignes};}

module.exports={verifier,verifierW2,jouerTextes,genomeW2};

if(require.main===module){
  const A=process.argv.slice(2),opt=(k,d)=>{const i=A.indexOf('--'+k);return i>=0?A[i+1]:d;};
  (async function(){
    const cfg=C.lireConfig(opt('config',null));
    const o={cfg,graines:opt('graines',null)?opt('graines').split(',').map(Number):undefined,tmax:opt('tmax',null)?+opt('tmax'):undefined,
      travailleurs:opt('travailleurs',null)?+opt('travailleurs'):undefined};
    const t0=Date.now();
    if(A.includes('--w2')){
      const r=await verifierW2(o);
      for(const l of r.lignes)console.log('graine '+l.graine+' : '+(l.identique?'IDENTIQUE':'DIFFERENT')+' (w2 '+(l.w2&&l.w2.empreinte)+' palier '+(l.w2&&l.w2.palier)+' '+(l.w2&&l.w2.survie_s)+' s'+(l.w2&&l.w2.erreurs?' ERREURS '+l.w2.erreurs+' '+l.w2.derniereErreur:'')+' ; voltige '+(l.voltige&&l.voltige.empreinte)+')');
      console.log((r.ok?'OK : les tetes sont branchees':'ECHEC : W2 = 0,5 ne change aucune course')+' ('+Math.round((Date.now()-t0)/1000)+' s)');
      process.exit(r.ok?0:1);}
    const r=await verifier(o);
    for(const l of r.lignes){
      const a=l.temoin||{},b=l.voltige||{};
      console.log('graine '+l.graine+' : '+(l.identique?'IDENTIQUE ('+a.empreinte+' '+a.empreinteVues+' '+a.empreinteTouches+', palier '+a.palier+', '+a.survie_s+' s)':
        'DIFFERENT (temoin '+[a.empreinte,a.empreinteVues,a.empreinteTouches].join(' ')+' palier '+a.palier+' '+a.survie_s+' s'+(a.erreurs?' erreurs '+a.erreurs+' '+a.derniereErreur:'')+(a.raison?' ['+a.raison+']':'')+
        ' ; voltige '+[b.empreinte,b.empreinteVues,b.empreinteTouches].join(' ')+' palier '+b.palier+' '+b.survie_s+' s'+(b.raison?' ['+b.raison+']':'')+')'));}
    console.log((r.ok?'OK : le temoin rejoue pilote-voltige au bit pres':'ECHEC : le temoin ne rejoue pas pilote-voltige')+' ('+Math.round((Date.now()-t0)/1000)+' s)');
    process.exit(r.ok?0:1);
  })().catch(e=>{console.error('identite : '+String(e&&e.stack||e));process.exit(1);});
}
