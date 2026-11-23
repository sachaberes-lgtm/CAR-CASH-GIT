#!/usr/bin/env node
/* ===== L'ETALON : LES PARTIES DE SACHA (2026-11-23, etape 1 BOTS-ML : « Sacha enregistre 20 de ses parties : c'est l'etalon ») =====
   Lit les fichiers exportes par l'enregistreur du jeu (`cashcar-parties-….json`, format cashcar-jeurec-1 — voir passation/ENREGISTREUR-JEU.md)
   et en tire LA BARRE : les memes chiffres que ceux des bots (mesures.js), comptes de la meme facon.
   usage : node etalon.js [fichier.json | dossier] …      (sans rien : le dossier ml/bot/etalon/)
   · plusieurs fichiers se cumulent (l'enregistreur ne garde que les 8 dernieres parties : 20 parties = 3 exports) ; une partie presente
     dans deux exports n'est comptee qu'une fois ;
   · ecartees : les parties de l'auto-ecole et celles de moins de 10 s (un faux depart, une partie quittee tout de suite) ;
   · une reprise par seconde chance est recollee a sa partie (voir « LES VRAIES PARTIES » plus bas) ;
   · resultat : results/etalon.json + le tableau, et la comparaison avec chaque note de bot deja ecrite (results/note-*.json). */
const fs=require('fs'),path=require('path');
const {barre,partiesDe,lignes}=require('./mesures');
const A=process.argv.slice(2).filter(a=>!a.startsWith('--'));
const DOSSIER=path.join(__dirname,'etalon'),RES=path.join(__dirname,'results');
const fichiers=[];
for(const a of (A.length?A:[DOSSIER])){
  if(!fs.existsSync(a)){console.log('introuvable :',a);continue;}
  if(fs.statSync(a).isDirectory()){for(const f of fs.readdirSync(a).sort())if(/\.json$/i.test(f))fichiers.push(path.join(a,f));}
  else fichiers.push(a);}
/* ===== LES VRAIES PARTIES (2026-11-23, premier export de Sacha : 7 parties, dont une reprise et une quittee) =====
   · QUITTEE DEPUIS LA PAUSE : l'horloge de fin de l'enregistreur compte la pause (3,6 s jouees, 123 s notees). On revient a l'instant de la pause.
   · LA SECONDE CHANCE : le jeu ferme la partie a la mort et en ouvre une autre a la reprise, au meme endroit de la meme route ; l'argent, les
     pieces, les figures et les bumps de la fin CONTINUENT ceux d'avant. Comptees a part, l'argent d'avant la mort serait compte deux fois :
     on recolle les deux morceaux en une partie (duree = la somme, fin = celle du dernier morceau). */
function finVraie(c){
  let p=null;for(const e of c.ev||[]){if(e[1]==='pause')p=e[0];else if(e[1]==='reprise')p=null;}
  if(p!=null&&c.fin.t>p)c.fin=Object.assign({},c.fin,{t:p,cause:'quitte'});
  return c;}
function suite(a,b){
  const e0=b.ech&&b.ech[0],ra=a.routes&&a.routes[a.routes.length-1],rb=b.routes&&b.routes[0];
  if(!e0||!ra||!rb||ra.carte!==rb.carte||ra.L!==rb.L)return false;
  const attente=(Date.parse(b.debut)-Date.parse(a.debut))/1000-a.fin.t;
  return e0[b.cols.indexOf('s')]>50&&attente>-2&&attente<900&&b.fin.argent>=a.fin.argent&&(b.fin.figures|0)>=(a.fin.figures|0); /* pas les pieces : la reprise en reprend (4044 → 3923 vu le 23/11) */}
function colle(a,b){
  const T=a.fin.t,R=a.routes.length-1,it=b.cols.indexOf('t'),ir=b.cols.indexOf('r'),r2=x=>Math.round(x*100)/100;
  return Object.assign({},a,{routes:a.routes.concat(b.routes.slice(1)),
    ech:a.ech.concat(b.ech.map(e=>{const q=e.slice();q[it]=r2(q[it]+T);q[ir]+=R;return q;})),
    ev:a.ev.concat([[T,'seconde_chance']],b.ev.map(e=>{const q=e.slice();q[0]=r2(q[0]+T);if(q[1]==='route')q[2]+=R;return q;})),
    fin:Object.assign({},b.fin,{t:r2(T+b.fin.t)}),chances:(a.chances|0)+1});}
if(!fichiers.length){
  console.log('Aucune partie a lire. Depose les fichiers exportes par le jeu (cashcar-parties-….json) dans ml/bot/etalon/, puis relance.\nLe mode d\'emploi est dans ml/bot/README.md (« L\'etalon »).');
  process.exit(1);}
const vues=new Map();let lues=0,ecartees=0;
for(const f of fichiers){
  let j;try{j=JSON.parse(fs.readFileSync(f,'utf8'));}catch(e){console.log('illisible :',path.basename(f),'—',e.message);continue;}
  const P=partiesDe(j);console.log(`${path.basename(f)} : ${P.length} partie(s)`);
  for(const c of P){lues++;
    if(c.bot){ecartees++;continue;}                                  /* une course de bot rangee la par erreur */
    if(c.tuto||!c.fin||!c.ech||!c.ech.length){ecartees++;continue;}
    vues.set((c.debut||'?')+'|'+c.fin.t,c);}}
const morceaux=[...vues.values()].sort((a,b)=>String(a.debut).localeCompare(String(b.debut))).map(finVraie),parties=[];let recollees=0;
for(const c of morceaux){const d=parties[parties.length-1];
  if(d&&suite(d,c)){parties[parties.length-1]=colle(d,c);recollees++;}else parties.push(c);}
for(let i=parties.length-1;i>=0;i--)if(!(parties[i].fin.t>=10)){parties.splice(i,1);ecartees++;} /* un faux depart, ou une partie quittee tout de suite */
if(recollees)console.log(recollees+' reprise(s) par seconde chance recollee(s) a leur partie');
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
