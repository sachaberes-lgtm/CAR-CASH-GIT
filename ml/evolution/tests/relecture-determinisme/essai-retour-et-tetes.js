/* relecture (determinisme) :
   A. genome temoin + retourOn=1 + volMieux=1  contre  pilote-voltige + faire-pR.js (meme loi : marge 8, cap .8, gain .8, avance .15, rv .2, rm .24, rn .18) : doit etre IDENTIQUE
   B. genome temoin avec W2 de la tete SOL a 0,5 contre pilote-voltige : doit DIFFERER (la tete SOL est branchee)
   Rien n'est ecrit hors de ce dossier ; les courses passent par identite.jouerTextes (cache coupe, rien d'ecrit). */
'use strict';
const fs=require('fs'),path=require('path');
const ICI=__dirname,RAC=path.join(ICI,'..','..','..','..');
const Gn=require(path.join(RAC,'ml','evolution','genome.js')),I=require(path.join(RAC,'ml','evolution','identite.js')),C=require(path.join(RAC,'ml','evolution','commun.js'));
const re=(s,a,b)=>{if(!s.includes(a))throw new Error('introuvable '+a.slice(0,80));return s.replace(a,()=>b);};
const src=fs.readFileSync(path.join(RAC,'ml','ecurie','etude','selection-naturelle','outils-27nov','faire-pR.js'),'utf8');
const corps=src.slice(src.indexOf('p=re(p,'),src.indexOf('if(DIAG)'));
let pR=(new Function('p','re',corps+'\nreturn p;'))(fs.readFileSync(Gn.VOLTIGE,'utf8'),re);
const mm=pR.match(/\n  retours:\[.*?\],   \/\*/);
pR=pR.replace(mm[0],()=>'\n  retours:[{marge:8,cap:0.8,gain:0.8,avance:0.15,rv:0.2,rm:0.24,rn:0.18}],   /*');
fs.writeFileSync(path.join(ICI,'pR-meme-loi.js'),pR);
const cfg=C.lireConfig();
const gR=Gn.genomeTemoin(cfg);gR.A.retourOn=1;gR.A.volMieux=1;Gn.reparer(gR,cfg);
const tR=Gn.ecrirePilote(gR,{cfg});fs.writeFileSync(path.join(ICI,'genome-retour.js'),tR);
const gS=Gn.genomeTemoin(cfg),T=Gn.TETES.sol;for(let i=T.nW1;i<T.nW1+T.nW2;i++)gS.WS[i]=.5;Gn.reparer(gS,cfg);
const tS=Gn.ecrirePilote(gS,{cfg});
const graines=(process.argv[2]||'913579,927183').split(',').map(Number),tmax=+(process.argv[3]||60);
(async function(){
  const R=await I.jouerTextes({cfg,graines,tmax,travailleurs:4,textes:[
    {nom:'genomeRetour',source:tR,fichier:'evolution.js'},{nom:'pR',source:pR,fichier:'pR.js'},
    {nom:'solW2',source:tS,fichier:'evolution.js'},{nom:'voltige',source:fs.readFileSync(Gn.VOLTIGE,'utf8'),fichier:'pilote-voltige.js'}]});
  const e=l=>l?[l.empreinte,l.empreinteVues,l.empreinteTouches,'palier '+l.palier,l.survie_s+' s','erreurs '+l.erreurs,l.derniereErreur||''].join(' '):'null';
  const pareil=(a,b)=>!!(a&&b)&&['empreinte','empreinteVues','empreinteTouches'].every(k=>a[k]&&a[k]===b[k]);
  graines.forEach((g,i)=>{
    console.log('graine '+g);
    for(const k of Object.keys(R))console.log('  '+k.padEnd(13)+e(R[k][i]));
    console.log('  A genomeRetour == pR : '+pareil(R.genomeRetour[i],R.pR[i])+' ; B solW2 == voltige : '+pareil(R.solW2[i],R.voltige[i])+' ; genomeRetour == voltige : '+pareil(R.genomeRetour[i],R.voltige[i]));});
})().catch(x=>{console.error(x&&x.stack||x);process.exit(1);});
