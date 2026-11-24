#!/usr/bin/env node
/* ===== LES APPUIS : LA MAIN D'UN BOT CONTRE CELLE DES JOUEURS (2026-11-24, doigts v2, Sacha : « des bots du palier 1 au palier 30 qu'on ne
   distingue pas de vrais joueurs ») =====
   Compare ce qui se LIT de la main dans l'enregistrement du jeu — les coups de volant (combien par minute, leur duree, l'ecart entre deux), les
   changements de sens, la nitro (la part du temps, les tenues) — pour les parties des joueurs (ml/bot/etalon/) et pour celles d'un bot.
   La MEME fonction compte les deux (mesures.js, mainDe / mainLot) : 10 echantillons par seconde, |steer| > 0,3 au sol.
   usage : node appuis.js <note-du-bot.json> [--humains clavier|doigt|tous] [--nom x] [--sortie f.json]
     la note : une sortie de noter.js faite avec --parties (ou un tampon du labo, une trajectoire gardee, un dossier : comme discerner.js)
   Pour le bot seulement, le journal des touches donne aussi les VRAIS appuis (a l'image pres) : un joueur n'a pas de journal.
   LIMITE, a dire a chaque fois : 14 parties de 2 joueurs ; les durees lues sont a 0,1 s pres ; la colonne nitro est la flamme, pas la touche. */
const fs=require('fs'),path=require('path'),zlib=require('zlib');
const {partiesDe,partiesJoueurs,finVraie,mainLot}=require('./mesures');
const A=process.argv.slice(2),opt=(n,d)=>{const i=A.indexOf('--'+n);return i>=0?A[i+1]:d;};
const QUI=opt('humains','clavier');
const lis=f=>{const b=fs.readFileSync(f);return JSON.parse(/\.gz$/i.test(f)?zlib.gunzipSync(b).toString('utf8'):b.toString('utf8'));};
const fichiersDe=a=>!fs.existsSync(a)?[]:fs.statSync(a).isDirectory()?fs.readdirSync(a).filter(f=>/\.json(\.gz)?$/i.test(f)&&!/toutes/.test(f)).sort().map(f=>path.join(a,f)):[a];
/* les parties d'un bot, et leurs journaux de touches quand le fichier les porte */
function duBot(f){
  const j=lis(f);
  if(j&&Array.isArray(j.courses)&&j.courses[0]&&j.courses[0].partie)return j.courses.map(c=>({partie:c.partie,touches:Array.isArray(c.touches)?c.touches:null}));
  if(j&&Array.isArray(j.parties)&&j.parties[0]&&j.parties[0].partie)return j.parties.map(c=>({partie:c.partie,touches:Array.isArray(c.touches)?c.touches:null}));
  return partiesDe(j).map(c=>({partie:c,touches:null}));}
/* LES VRAIS APPUIS, lus au journal ([image, touche, 1|0]) : les fleches (G, D) et la NITRO (N), en secondes */
function journal(lots){
  const vol=[],nit=[];let images=0;
  for(const T of lots){const bas={};let fin=0;
    for(const [i,k,b] of T){if(i>fin)fin=i;if(k!=='G'&&k!=='D'&&k!=='N')continue;if(b)bas[k]=i;else if(bas[k]!=null){(k==='N'?nit:vol).push((i-bas[k])/60);bas[k]=null;}}
    images+=fin;}
  const q=(X,p)=>{X=X.slice().sort((a,b)=>a-b);return X.length?+X[Math.round(p*(X.length-1))].toFixed(2):null;},min=Math.max(1e-9,images/3600);
  return {minutes:+min.toFixed(1),volant_min:+(vol.length/min).toFixed(1),volant_p10_s:q(vol,.1),volant_p50_s:q(vol,.5),volant_p90_s:q(vol,.9),
    nitro_min:+(nit.length/min).toFixed(1),nitro_p10_s:q(nit,.1),nitro_p50_s:q(nit,.5),nitro_p90_s:q(nit,.9)};}

const sources=A.filter((a,i)=>!a.startsWith('--')&&!(i&&A[i-1].startsWith('--')));
const BOT=[];for(const s of sources)for(const f of fichiersDe(s))for(const c of duBot(f))if(c.partie&&c.partie.ech&&c.partie.fin&&finVraie(c.partie).fin.t>=10)BOT.push(c);
if(!sources.length||!BOT.length){console.log('usage : node appuis.js <note-du-bot.json (noter.js --parties)> [--humains clavier|doigt|tous] [--nom x]\n(aucune partie de bot lue)');process.exit(1);}
const PJ=partiesJoueurs(fichiersDe(path.join(__dirname,'etalon')).map(f=>({nom:path.basename(f),j:lis(f)})));
const clavierDe=c=>{const i=(c.cols||[]).indexOf('doigt');return i>=0?!c.ech.some(e=>e[i]):null;};
const HUM=PJ.parties.filter(c=>QUI==='tous'||(QUI==='clavier')===!!clavierDe(c));
const H=mainLot(HUM),B=mainLot(BOT.map(b=>b.partie)),JT=BOT.every(b=>b.touches)?journal(BOT.map(b=>b.touches)):null;
const LIGNES=[['coups_min','coups de volant par minute de sol'],['coup_p10_s','duree d\'un coup : p10 (s)'],['coup_p50_s','duree d\'un coup : p50 (s)'],['coup_p90_s','duree d\'un coup : p90 (s)'],['coup_max_s','duree d\'un coup : le plus long (s)'],
  ['ecart_p10_s','ecart entre deux debuts : p10 (s)'],['ecart_p50_s','ecart entre deux debuts : p50 (s)'],['ecart_p90_s','ecart entre deux debuts : p90 (s)'],['ecart_cv','ecart entre deux debuts : irregularite (CV)'],
  ['braquage_pct','part du sol volant braque (%)'],['sens_s','changements de sens par seconde de sol'],['drift_pct','part du sol en drift (%)'],
  ['nitro_pct','part du temps nitro allumee (%)'],['nitro_appuis_min','allumages de nitro par minute'],['tenue_p10_s','tenue de nitro : p10 (s)'],['tenue_p50_s','tenue de nitro : p50 (s)'],['tenue_p90_s','tenue de nitro : p90 (s)'],['tenue_max_s','tenue de nitro : la plus longue (s)']];
const nomBot=opt('nom',null)||path.basename(sources[0]).replace(/\.json(\.gz)?$/,'').replace(/^note-/,'');
console.log(`LA MAIN · joueurs (${QUI}) : ${H.parties} parties, ${H.minutes} min lues, ${H.sol_min} au sol, ${H.coups} coups · ${nomBot} : ${B.parties} parties, ${B.minutes} min, ${B.sol_min} au sol, ${B.coups} coups`);
console.log('  '+'mesure'.padEnd(46)+'joueurs'.padStart(9)+nomBot.slice(0,18).padStart(20));
for(const [k,t] of LIGNES)console.log('  '+t.padEnd(46)+String(H[k]).padStart(9)+String(B[k]).padStart(20));
if(JT)console.log(`les VRAIES touches de ${nomBot} (journal, ${JT.minutes} min) : fleches ${JT.volant_min} appuis par minute, tenues p10 ${JT.volant_p10_s} s · p50 ${JT.volant_p50_s} s · p90 ${JT.volant_p90_s} s ; NITRO ${JT.nitro_min} appuis par minute, tenues p10 ${JT.nitro_p10_s} s · p50 ${JT.nitro_p50_s} s · p90 ${JT.nitro_p90_s} s`);
console.log('⚠ '+H.parties+' parties de joueurs (2 joueurs en tout) ; durees lues a 0,1 s pres sur le volant lisse du jeu ; la nitro lue est la flamme, pas la touche.');
const sortie=opt('sortie',path.join(__dirname,'results','appuis-'+nomBot+'.json'));
fs.mkdirSync(path.dirname(sortie),{recursive:true});
fs.writeFileSync(sortie,JSON.stringify({date:new Date().toISOString(),humains:Object.assign({qui:QUI},H),bot:Object.assign({nom:nomBot,sources:sources.map(s=>path.basename(s))},B),journal:JT},null,1));
console.log('ecrit : '+path.relative(process.cwd(),sortie));
