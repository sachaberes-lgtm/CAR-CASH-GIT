/* les raccourcis (comme mesures.js les compte) et la distance, joueurs / c0025 ; et la valeur des figures. Lecture seule.
   usage : node ml/ecurie/etude/echelle-de-bots/pieces/compteur-joueurs/raccourcis.js > ml/ecurie/etude/echelle-de-bots/pieces/compteur-joueurs/raccourcis.txt */
const fs=require('fs'),path=require('path');const R=path.join(__dirname,'..','..','..','..','..','..');
const {partiesJoueurs,barre,finVraie}=require(path.join(R,'ml/bot/mesures'));const D=path.join(R,'ml/bot/etalon');
const lus=fs.readdirSync(D).filter(x=>x.endsWith('.json')).sort().map(x=>({nom:x,j:JSON.parse(fs.readFileSync(path.join(D,x),'utf8'))}));
const J=partiesJoueurs(lus).parties;const B=JSON.parse(fs.readFileSync(path.join(R,'ml/ecurie/agents/tmp-voltige/note-voltige4-t900.json'),'utf8')).parties.map(x=>x.partie);
for(const [nm,P] of [['joueurs',J],['c0025',B]]){const b=barre(P);
  console.log(`${nm} : ${b.parties} parties, ${b.minutes} min | raccourcis/min ${b.raccourcis_min} | m gagnes/min ${b.raccourcis_m_min} | distance m/min ${b.distance_m_min} | part de la distance gagnee par raccourci ${(100*b.raccourcis_m_min/b.distance_m_min).toFixed(1)} % | nitro ${b.nitro_pct} % | vols/min ${b.vols_min} | air ${b.air_pct} % | figures payees/min ${b.figures_min} | lancees/min ${b.figures_lancees_min}`);
  /* valeur d'une figure : pieces dans l'image de chaque figure_payee */
  const h={'3-4':0,'5-9':0,'10-17':0,'18+':0};let n=0;
  for(const c0 of P){const c=finVraie(c0);for(const e of c.ev){if(e[1]!=='figure_payee')continue;const v=c.ev.filter(q=>q[1]==='piece'&&Math.abs(q[0]-e[0])<.001).reduce((a,q)=>a+q[2],0);if(!v)continue;n++;h[v<=4?'3-4':v<=9?'5-9':v<=17?'10-17':'18+']++;}}
  console.log('   pieces par figure payee ('+n+') : '+Object.entries(h).map(([k,v])=>k+' : '+(100*v/n).toFixed(0)+' %').join(' · '));}
