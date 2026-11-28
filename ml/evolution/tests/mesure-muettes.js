#!/usr/bin/env node
/* ===== LA MESURE DES MUTATIONS MUETTES (28/11/2026, lot « regles » ; la synthese ml/ecurie/etude/reglage-de-la-selection/LISEZ-MOI.md § 2 C2 :
   « 25,3 % des tirages perdus aujourd'hui ») =====
   Une mutation d'un reel est MUETTE quand le pilote ne lit pas ce reel : son drapeau de garde (genome.GARDES) vaut 0. On la compte de deux facons :
     - « parent » : le drapeau vaut 0 chez le PARENT (c'est la regle de muter depuis le lot « regles » : un tel reel n'est plus tire) ;
     - « enfant » : le drapeau vaut 0 chez l'ENFANT (ce que le pilote de l'enfant lit vraiment ; un drapeau peut basculer dans la meme naissance).
   Une NAISSANCE est muette quand aucun gene lu ne change (ni reel lu, ni drapeau, ni choix, ni entier, ni tete) : l'enfant conduit comme son parent.
   Deux populations de naissances, 20 000 chacune, mulberry32 fixe :
     (T) le temoin pour parent a chaque fois (phase A, la config) ;
     (P) une population de 20 qui evolue (croisement 3 fois sur 10, le parent tire au hasard, l'enfant remplace un vivant au hasard), comme gestes.test.js r3.
   usage : node ml/evolution/tests/mesure-muettes.js [--genome chemin/vers/genome.js | --v2] [--urne-complete] [--naissances 20000] [--json sortie.json]
     --urne-complete : l'urne d'avant le lot « regles » (tous les reels) avec le genome.js d'aujourd'hui : l'« avant » en v:3.
     --genome : un autre genome.js (par exemple celui du commit e93ff5cb5, genome v:2, recopie par --v2) ; sa table GARDES est celle d'ici, limitee
                a ses genes. --v2 : recopie ml/evolution/genome.js du commit e93ff5cb5 dans essais/regles/genome-v2.js et le mesure.
   Pas un test rapide (environ 10 s par genome) ; aucune course. */
'use strict';
const path=require('path'),fs=require('fs'),cp=require('child_process');
const D=path.join(__dirname,'..');
const C=require(path.join(D,'commun.js')),Gr=require(path.join(D,'graines.js')),GnIci=require(path.join(D,'genome.js'));
const A=process.argv.slice(2),opt=(k,d)=>{const i=A.indexOf('--'+k);return i>=0?A[i+1]:d;};

function genomeV2(){
  const t=cp.execFileSync('git',['show','e93ff5cb5:ml/evolution/genome.js'],{cwd:D,encoding:'utf8',stdio:['ignore','pipe','ignore']}).replace(/\r\n/g,'\n');
  if(t.indexOf('const VERSION=2;')<0)throw new Error('le genome.js du commit e93ff5cb5 n\'est pas v:2');
  const dos=path.join(D,'essais','regles');fs.mkdirSync(dos,{recursive:true});
  const f=path.join(dos,'genome-v2.js');
  C.ecrireAtomique(f,t.replace("require('./commun')","require('../../commun')").replace("require('./graines')","require('../../graines')"));
  return f;}

function mesurer(Gn,n,urneComplete){
  const cfg=C.lireConfig();cfg.temoin='c0025';
  const cles=new Set(Gn.BORNES.map(b=>b.cle));
  /* la table des gardes d'ici, limitee aux genes de ce genome (un v:2 n'a pas le portage) */
  const garde={};for(const d in GnIci.GARDES)if(cles.has(d))for(const r of GnIci.GARDES[d])if(cles.has(r))garde[r]=d;
  const reels=Gn.CONTINUS.length,gardes=Object.keys(garde).length;
  const T=Gn.genomeTemoin(cfg);
  function compter(parent,enfant,mutes,c){
    let lu=false;
    for(const m of mutes){
      if(m.cle==='WV'||m.cle==='WS'){lu=true;continue;}
      const b=Gn.BORNES.find(x=>x.cle===m.cle);
      if(b.type!=='reel'){lu=true;continue;}
      c.reels++;
      const d=garde[m.cle];
      if(d&&parent.A[d]===0)c.muettesParent++;
      if(d&&enfant.A[d]===0)c.muettesEnfant++;else lu=true;}
    c.naissances++;if(!lu)c.naissancesMuettes++;}
  const zero=()=>({naissances:0,reels:0,muettesParent:0,muettesEnfant:0,naissancesMuettes:0});
  /* (T) le temoin pour parent */
  const cT=zero();{const rng=Gr.mulberry32(20261128);
    for(let i=0;i<n;i++){const r=Gn.muter(T,rng,{phase:'A',cfg,urneComplete:!!urneComplete});compter(T,r.genome,r.mutes,cT);}}
  /* (P) une population de 20 qui evolue */
  const cP=zero();{const rng=Gr.mulberry32(20261129),pop=[T];
    for(let i=0;i<n;i++){
      const p1=pop[rng.entier(pop.length)];let base=p1;
      if(rng.suivant()<cfg.pCroisement){const p2=pop[rng.entier(pop.length)];base=Gn.croiser(p1,p2,rng);}
      const r=Gn.muter(base,rng,{phase:'A',cfg,urneComplete:!!urneComplete});
      /* le « parent » d'une naissance par croisement est le genome croise (c'est lui que muter recoit) */
      compter(base,r.genome,r.mutes.filter(m=>m.cle==='WV'||m.cle==='WS'||base.A[m.cle]!==r.genome.A[m.cle]),cP);
      if(pop.length<20)pop.push(r.genome);else pop[rng.entier(20)]=r.genome;}}
  const pc=(a,b)=>b?+(100*a/b).toFixed(2):null;
  const dire=c=>({naissances:c.naissances,reelsMutes:c.reels,muettesParent:c.muettesParent,muettesEnfant:c.muettesEnfant,
    partParent_pc:pc(c.muettesParent,c.reels),partEnfant_pc:pc(c.muettesEnfant,c.reels),naissancesMuettes:c.naissancesMuettes,partNaissances_pc:pc(c.naissancesMuettes,c.naissances),
    reelsParNaissance:+(c.reels/c.naissances).toFixed(3)});
  return {version:Gn.VERSION,genes:Gn.BORNES.length,reels:reels,reelsGardes:gardes,partGardes_pc:pc(gardes,reels),temoin:dire(cT),population:dire(cP)};
}

if(require.main===module){
  const n=+opt('naissances',20000);
  const f=A.includes('--v2')?genomeV2():opt('genome',null);
  const Gn=f?require(path.resolve(f)):GnIci;
  const r=Object.assign({genome:f?path.relative(D,path.resolve(f)).split(path.sep).join('/'):'genome.js'},{urneComplete:A.includes('--urne-complete')},mesurer(Gn,n,A.includes('--urne-complete')));
  console.log(JSON.stringify(r,null,1));
  if(opt('json',null))C.ecrireAtomique(path.resolve(opt('json')),JSON.stringify(r,null,1)+'\n');
}
module.exports={mesurer};
