#!/usr/bin/env node
/* ===== L'ETALON : LES PARTIES DE SACHA (2026-11-23, etape 1 BOTS-ML : « Sacha enregistre 20 de ses parties : c'est l'etalon ») =====
   Lit les fichiers exportes par l'enregistreur du jeu (`cashcar-parties-….json`, format cashcar-jeurec-1 — voir passation/ENREGISTREUR-JEU.md)
   et en tire LA BARRE : les memes chiffres que ceux des bots (mesures.js), comptes de la meme facon.
   usage : node etalon.js [fichier.json | dossier] …      (sans rien : le dossier ml/bot/etalon/)
   · plusieurs fichiers se cumulent (l'enregistreur ne garde que les 8 dernieres parties : 20 parties = 3 exports) ; une partie presente
     dans deux exports n'est comptee qu'une fois ;
   · ecartees : les parties de l'auto-ecole et celles de moins de 10 s (un faux depart, une partie quittee tout de suite) ;
   · une reprise par seconde chance est recollee a sa partie, une partie finit a sa mort (pas a la fin de l'explosion), une partie quittee
     depuis la pause finit a la pause : partiesJoueurs() de mesures.js, la MEME que discerner.js ;
   · resultat : results/etalon.json + le tableau, et la comparaison avec chaque note de bot deja ecrite (results/note-*.json) ;
   · --nom=leo : la barre d'UN joueur, a cote (results/etalon-leo.json) ; results/etalon.json n'est pas touche. Sans fichier, ceux de la
     liste JOUEURS ci-dessous. */
const fs=require('fs'),path=require('path');
const {barre,partiesJoueurs,lignes,palierDe}=require('./mesures');
const A=process.argv.slice(2).filter(a=>!a.startsWith('--'));
/* L'ETALON A DEUX JOUEURS (2026-11-24, Sacha : « Dans les 20 ») : les parties de Leo (au doigt, sur telephone) comptent avec celles de Sacha
   (au clavier). Sans --nom : tout le dossier, c'est LA BARRE. Avec --nom=X : sa barre a lui, a cote (etalon-x.json). */
/* ===== QUI A JOUE QUOI (2026-11-24, defaut 18 : « l'attribution des fichiers par date est fausse ») =====
   Rien dans un export ne dit qui a joue (format, exporte, ver, parties) : la liste est tenue ICI, fichier par fichier, et dans etalon/LISEZ-MOI.md.
   Le fichier du 24/11 a 12:13 est a SACHA (au clavier) : il reprend ses 3 parties de 20:20 (ecartees comme doublons) et en ajoute 3.
   Un nouveau fichier s'ajoute a la liste de son joueur, ici ET dans le LISEZ-MOI. */
const JOUEURS={
  sacha:['cashcar-parties-2026-11-23-1950.json','cashcar-parties-2026-11-23-2020.json','cashcar-parties-2026-11-24-1213.json'],
  leo:['cashcar-parties-2026-11-24-11-05.json']};
const AUTRE=process.argv.find(a=>/^--nom=/.test(a)),NOM=AUTRE?AUTRE.slice(6):'Sacha et Leo',SORTIE=AUTRE?'etalon-'+NOM.toLowerCase()+'.json':'etalon.json';
const DOSSIER=path.join(__dirname,'etalon'),RES=path.join(__dirname,'results');
const fichiers=[];
const sources=A.length?A:AUTRE&&JOUEURS[NOM.toLowerCase()]?JOUEURS[NOM.toLowerCase()].map(f=>path.join(DOSSIER,f)):[DOSSIER];
if(AUTRE&&!A.length&&!JOUEURS[NOM.toLowerCase()]){console.log(`« ${NOM} » n'est pas dans la liste JOUEURS d'etalon.js : donner ses fichiers (node etalon.js <fichiers> --nom=${NOM})`);process.exit(1);}
for(const a of sources){
  if(!fs.existsSync(a)){console.log('introuvable :',a);continue;}
  if(fs.statSync(a).isDirectory()){for(const f of fs.readdirSync(a).sort())if(/\.json$/i.test(f))fichiers.push(path.join(a,f));}
  else fichiers.push(a);}
/* un fichier depose dans etalon/ sans joueur dans la liste : on le dit (sa barre par joueur serait fausse) */
const connus=new Set(Object.values(JOUEURS).flat());
for(const f of fichiers)if(path.dirname(path.resolve(f))===DOSSIER&&!connus.has(path.basename(f)))console.log(`⚠ ${path.basename(f)} : a qui est ce fichier ? l'ajouter a JOUEURS (etalon.js) et au LISEZ-MOI`);
if(!fichiers.length){
  console.log('Aucune partie a lire. Depose les fichiers exportes par le jeu (cashcar-parties-….json) dans ml/bot/etalon/, puis relance.\nLe mode d\'emploi est dans ml/bot/README.md (« L\'etalon »).');
  process.exit(1);}
const lus=[];
for(const f of fichiers){try{lus.push({nom:path.basename(f),j:JSON.parse(fs.readFileSync(f,'utf8'))});}catch(e){console.log('illisible :',path.basename(f),'—',e.message);}}
const PJ=partiesJoueurs(lus),parties=PJ.parties;
for(const x of PJ.parFichier)console.log(`${x.nom} : ${x.parties} partie(s)`);
if(PJ.doublons)console.log(PJ.doublons+' partie(s) presente(s) dans deux exports : comptee(s) une fois');
if(PJ.recollees)console.log(PJ.recollees+' reprise(s) par seconde chance recollee(s) a leur partie');
if(!parties.length){console.log('aucune partie retenue ('+PJ.lues+' lues, '+PJ.ecartees+' ecartees)');process.exit(1);}
const B=barre(parties),detail=B.detail;delete B.detail;
const ou={};for(const m of detail){const k=m.clavier==null?'main inconnue':m.clavier?'au clavier':'au doigt';ou[k]=(ou[k]||0)+1;} /* « version allegee » ne separait pas le PC lent de Sacha du telephone de Leo : la main, si */
console.log(`\n=== L'ETALON : ${parties.length} parties de ${NOM} (${Object.entries(ou).map(e=>e[1]+' '+e[0]).join(', ')}) — ${PJ.lues} lues, ${PJ.doublons} doublons, ${PJ.ecartees} ecartees ===`);
console.log(lignes(B).join('\n'));
const sc=detail.filter(m=>m.chances>0);
if(sc.length)console.log(`(${sc.length} partie(s) avec une seconde chance — le bot n'en a pas : paliers ${sc.map(m=>m.palier).join(', ')} ; sans elles, palier record ${Math.max(0,...detail.filter(m=>!m.chances).map(m=>m.palier))})`);
if(parties.length<20)console.log(`\n⚠ ${parties.length} parties : le plan en demande 20. La barre ci-dessus est provisoire.`);
fs.mkdirSync(RES,{recursive:true});
fs.writeFileSync(path.join(RES,SORTIE),JSON.stringify({date:new Date().toISOString(),fichiers:fichiers.map(f=>path.basename(f)),versions:[...new Set(parties.map(c=>c.ver))],
  voitures:[...new Set(parties.map(c=>c.voiture))],barre:B,parties:detail.map((m,i)=>Object.assign({debut:parties[i].debut},m))},null,1));
/* LA COMPARAISON avec les notes des bots */
const notes=fs.existsSync(RES)?fs.readdirSync(RES).filter(f=>/^note-.*\.json$/.test(f)):[];
const LIG=[['survie mediane (s)','survie_mediane_s'],['PALIER median','palier_median'],['PALIER record','palier_record'],['argent par minute','argent_min'],['pieces par minute','pieces_min'],['figures posees par minute','figures_min'],
  ['temps en l\'air (%)','air_pct'],['vols par minute','vols_min'],['vol moyen (s)','vol_moyen_s'],['raccourcis par minute','raccourcis_min'],['distance (m par minute)','distance_m_min'],['nitro tenue (%)','nitro_pct']];
for(const f of notes){
  let n;try{n=JSON.parse(fs.readFileSync(path.join(RES,f),'utf8'));}catch(e){continue;}
  if(!n.note)continue;
  /* (2026-11-24, defaut 27) une note d'avant le palier (note-reference.json, 23/11) : son palier se recalcule sur les pieces de ses courses
     (un bot n'a pas de seconde chance : ses pieces de fin sont son sommet) */
  if(n.note.palier_median==null&&Array.isArray(n.courses)&&n.courses.length){
    const P=n.courses.map(c=>palierDe(c.pieces_max!=null?c.pieces_max:c.pieces)).sort((a,b)=>a-b),k=P.length;
    n.note.palier_median=k%2?P[(k-1)/2]:(P[k/2-1]+P[k/2])/2;n.note.palier_record=P[k-1];n.note.paliers=P;n.recalcule=true;}
  const coupees=n.note.coupees!=null?n.note.coupees:(n.note.causes&&n.note.causes.temps)||0;
  console.log(`\n--- ${NOM} (${parties.length} parties) contre « ${n.cerveau} » (${f} : ${n.note.parties} courses, ${n.jeu}, regime ${n.regime||'max'}, ${n.tmax} s au plus) ---`);
  console.log('| mesure | '+NOM+' | '+n.cerveau+' | bot / '+NOM+' |\n|---|---|---|---|');
  for(const [nom,k] of LIG){const s=B[k],b=n.note[k];console.log(`| ${nom} | ${s} | ${b==null?'—':b} | ${s&&b!=null?Math.round(100*b/s)+' %':'—'} |`);}
  if(n.recalcule)console.log(`(paliers du bot recalcules sur les pieces de ses ${n.courses.length} courses : ${n.note.paliers.join(' ')})`);
  if(coupees)console.log(`(${coupees} course(s) du bot coupee(s) a ${n.tmax} s : leur survie et leur PALIER sont des planchers ; ses taux par minute ne le sont pas)`);
  if(!n.ecartees&&Array.isArray(n.courses)){const p=n.courses.filter(c=>c.pannes>0||c.cause==='panne');if(p.length)console.log(`(note d'avant le 24/11 : ${p.length} course(s) en panne COMPTEES dedans (graines ${p.map(c=>c.graine).join(' ')}) — a renoter)`);}
  if(n.ecartees&&n.ecartees.length)console.log(`(${n.ecartees.length} course(s) du bot ecartee(s) de sa note : ${n.ecartees.map(e=>e.graine+' '+e.raison).join(' · ')})`);
  if((n.regime||'max')!=='allege')console.log('(le bot a joue au regime MAXIMUM ; les joueurs de l\'etalon jouent la version allegee : Crypto City n\'est pas au meme tirage)');
}
console.log('\necrit : '+path.relative(process.cwd(),path.join(RES,SORTIE)));
