#!/usr/bin/env node
/* ===== L'ETALON : LES PARTIES DE SACHA (2026-11-23, etape 1 BOTS-ML : « Sacha enregistre 20 de ses parties : c'est l'etalon ») =====
   Lit les fichiers exportes par l'enregistreur du jeu (`cashcar-parties-….json`, format cashcar-jeurec-1 — voir passation/ENREGISTREUR-JEU.md)
   et en tire LA BARRE : les memes chiffres que ceux des bots (mesures.js), comptes de la meme facon.
   usage : node etalon.js [fichier.json | dossier] …      (sans rien : le dossier ml/bot/etalon/)
   · plusieurs fichiers se cumulent (l'enregistreur ne garde que les 8 dernieres parties : 20 parties = 3 exports) ; une partie presente
     dans deux exports n'est comptee qu'une fois ;
   · ecartees : les parties de l'auto-ecole et celles de moins de 10 s (un faux depart) ;
   · resultat : results/etalon.json + le tableau, et la comparaison avec chaque note de bot deja ecrite (results/note-*.json). */
const fs=require('fs'),path=require('path');
const {barre,partiesDe,lignes}=require('./mesures');
const A=process.argv.slice(2).filter(a=>!a.startsWith('--'));
const DOSSIER=path.join(__dirname,'etalon'),RES=path.join(__dirname,'results');
const fichiers=[];
for(const a of (A.length?A:[DOSSIER])){
  if(!fs.existsSync(a)){console.log('introuvable :',a);continue;}
  if(fs.statSync(a).isDirectory())for(const f of fs.readdirSync(a).sort())if(/\.json$/i.test(f))fichiers.push(path.join(a,f));
  else fichiers.push(a);}
if(!fichiers.length){
  console.log('Aucune partie a lire. Depose les fichiers exportes par le jeu (cashcar-parties-….json) dans ml/bot/etalon/, puis relance.\nLe mode d\'emploi est dans ml/bot/README.md (« L\'etalon »).');
  process.exit(1);}
const vues=new Map();let lues=0,ecartees=0;
for(const f of fichiers){
  let j;try{j=JSON.parse(fs.readFileSync(f,'utf8'));}catch(e){console.log('illisible :',path.basename(f),'—',e.message);continue;}
  const P=partiesDe(j);console.log(`${path.basename(f)} : ${P.length} partie(s)`);
  for(const c of P){lues++;
    if(c.bot){ecartees++;continue;}                                  /* une course de bot rangee la par erreur */
    if(c.tuto||!c.fin||!(c.fin.t>=10)){ecartees++;continue;}
    vues.set((c.debut||'?')+'|'+c.fin.t,c);}}
const parties=[...vues.values()].sort((a,b)=>String(a.debut).localeCompare(String(b.debut)));
if(!parties.length){console.log('aucune partie retenue ('+lues+' lues, '+ecartees+' ecartees)');process.exit(1);}
const B=barre(parties),detail=B.detail;delete B.detail;
const ou={};for(const m of detail)ou[m.appareil]=(ou[m.appareil]||0)+1;
console.log(`\n=== L'ETALON : ${parties.length} parties de Sacha (${Object.entries(ou).map(e=>e[1]+' sur '+e[0]).join(', ')}) — ${lues} lues, ${ecartees} ecartees ===`);
console.log(lignes(B).join('\n'));
if(parties.length<20)console.log(`\n⚠ ${parties.length} parties : le plan en demande 20. La barre ci-dessus est provisoire.`);
fs.mkdirSync(RES,{recursive:true});
fs.writeFileSync(path.join(RES,'etalon.json'),JSON.stringify({date:new Date().toISOString(),fichiers:fichiers.map(f=>path.basename(f)),versions:[...new Set(parties.map(c=>c.ver))],
  voitures:[...new Set(parties.map(c=>c.voiture))],barre:B,parties:detail.map((m,i)=>Object.assign({debut:parties[i].debut},m))},null,1));
/* LA COMPARAISON avec les notes des bots */
const notes=fs.existsSync(RES)?fs.readdirSync(RES).filter(f=>/^note-.*\.json$/.test(f)):[];
const LIG=[['survie mediane (s)','survie_mediane_s'],['argent par minute','argent_min'],['pieces par minute','pieces_min'],['figures posees par minute','figures_min'],
  ['temps en l\'air (%)','air_pct'],['vols par minute','vols_min'],['vol moyen (s)','vol_moyen_s'],['raccourcis par minute','raccourcis_min'],['distance (m par minute)','distance_m_min'],['nitro tenue (%)','nitro_pct']];
for(const f of notes){
  let n;try{n=JSON.parse(fs.readFileSync(path.join(RES,f),'utf8'));}catch(e){continue;}
  if(!n.note)continue;
  console.log(`\n--- Sacha (${parties.length} parties) contre « ${n.cerveau} » (${n.note.parties} courses, ${n.jeu}, ${n.tmax} s au plus) ---`);
  console.log('| mesure | Sacha | '+n.cerveau+' | bot / Sacha |\n|---|---|---|---|');
  for(const [nom,k] of LIG){const s=B[k],b=n.note[k];console.log(`| ${nom} | ${s} | ${b} | ${s?Math.round(100*b/s)+' %':'—'} |`);}
  if(n.tmax)console.log(`(les courses du bot sont coupees a ${n.tmax} s : sa survie est plafonnee, ses taux par minute ne le sont pas)`);
}
console.log('\necrit : '+path.relative(process.cwd(),path.join(RES,'etalon.json')));
