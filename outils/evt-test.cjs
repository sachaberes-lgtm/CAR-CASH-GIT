// LES ÉVÉNEMENTS RARES — le test Node de la LOGIQUE DE TIRAGE (2026-10-14, GAMEPLAY).
// Il ne lance pas le jeu : il extrait le bloc EVT de « VERSION PRINCIPALE/index.html » (le vrai code, pas une copie) et le fait tourner
// dans un bac à sable avec des décors minimaux. Vérifie : par défaut et ?evt=0 = aucun tirage (2026-10-19 : éteint par défaut, ?evt=1 le rallume) ; les modes exclus ; les maps qui portent un événement ;
// au plus UN par partie ; la rareté (modèle de vie des joueurs). Usage : node outils/evt-test.cjs
const fs=require('fs'),vm=require('vm'),path=require('path');
const SRC=fs.readFileSync(path.join(__dirname,'..','VERSION PRINCIPALE','index.html'),'utf8');
const a=SRC.indexOf('const EVT_ON='),z=SRC.indexOf("\nObject.assign(I18N,{'CAISSE-NUAGE'"); // (2026-10-18) le bloc finit avant les mots de la caisse-nuage (le BANQUIER et les MOUTONS sont retirés)
if(a<0||z<0){console.error('bloc EVT introuvable');process.exit(1);}
const CODE=SRC.slice(a,z);
const CARTES=(/^const SF_CARTES=\{([\s\S]*?)^\};/m.exec(SRC)||['',''])[1].match(/^  [a-z]+:\{nm:/gm).map(function(s){return s.trim().split(':')[0];}); // les maps du tirage, lues dans le jeu
let rate=0,echecs=0;const ok=(c,m)=>{if(!c){echecs++;console.error('  ECHEC : '+m);}else console.log('  ok : '+m);};

function bac(search,over){
  const calls={random:0},prep=[];
  const ctx={location:{search:search||''},console,
    SF:{on:true},LVL:{cur:{sansFin:1,carte:'nuages',id:'nuages'}},started:true,gameOver:false,TUTO:{on:false},BALADE:false,JADE_JEU:false,SANDBOX:false,
    PARK:{on:false},SURV:{on:false,armed:false},L:15000,NP:1000,
    Math:Object.assign(Object.create(Math),{random:function(){calls.random++;return ctx.__rnd?ctx.__rnd():Math.random();}})};
  Object.assign(ctx,over||{});
  vm.createContext(ctx);
  vm.runInContext(CODE.replace(/window\.dbgEvt=/,'var __d='),ctx,{filename:'evt-bloc.js'});
  // evtPrepare dépend de la piste : remplacé par un témoin qui note ce qu'on aurait posé
  vm.runInContext('evtPrepare=function(nom,ici){EVT.nom=nom;EVT.etat=1;EVT.ici=!!ici;__prep.push(nom);return true;};',Object.assign(ctx,{__prep:prep}));
  ctx.__calls=calls;return ctx;
}
const run=(c,s)=>vm.runInContext(s,c);

console.log('1. par défaut et ?evt=0 : éteint (aucun tirage, aucun appel au hasard) — 2026-10-19, Sacha ne veut plus de la caisse-nuage');
for(const q of ['','?evt=0']){const c=bac(q);let armes=0;for(let i=0;i<5000;i++){run(c,'evtPartie()');if(run(c,'EVT.arme'))armes++;run(c,'evtZone()');}
  ok(run(c,'EVT_ON')===false,'EVT_ON faux');ok(armes===0,'aucune partie armée sur 5000');ok(c.__calls.random===0,'Math.random jamais appelé');ok(c.__prep.length===0,'rien posé');}

console.log('2. les modes exclus : la partie classique seule');
{const c=bac('?evt=1');
  ok(run(c,'evtLieuOk()')===true,'partie classique : permis');
  const cas={'auto-école':'TUTO.on=true','balade':'BALADE=true','soleil de jade':'JADE_JEU=true','bac à sable':'SANDBOX=true','parc':'PARK.on=true',
    'Survivant en cours':'SURV.on=true','Survivant armé':'SURV.armed=true','pas de course':'started=false','mort':'gameOver=true','?classique=cycle':'SF.on=false','niveau dessiné (sans sansFin)':'LVL.cur.sansFin=0'};
  for(const k in cas){const d=bac('?evt=1');run(d,cas[k]);ok(run(d,'evtLieuOk()')===false,k+' : refusé');}}

console.log('3. les maps : la MER DE NUAGES (la caisse-nuage, orage compris), les autres rien (2026-10-18 : plus de banquier ni de moutons)');
{const cartes=['nuages','ville','jade','foret','banquise','espace','paris'],vu={};
  for(const carte of cartes){vu[carte]={};for(let i=0;i<400;i++){const c=bac('?evt=1');run(c,'LVL.cur={sansFin:1,carte:\''+carte+'\',id:\''+carte+'\'}');run(c,'EVT.arme=true;EVT.fait=false');run(c,'evtZone()');for(const n of c.__prep)vu[carte][n]=(vu[carte][n]|0)+1;}}
  ok(Object.keys(vu.nuages).join()==='caisse'&&vu.nuages.caisse===400,'nuages : la caisse-nuage, à chaque fois '+JSON.stringify(vu.nuages));
  for(const k of ['ville','jade','foret','banquise','espace','paris'])ok(Object.keys(vu[k]).length===0,k+' : rien');
  const c=bac('?evt=1');run(c,'LVL.cur={sansFin:1,carte:\'nuages\',id:\'orage\'}');run(c,'EVT.arme=true;EVT.fait=false');for(let i=0;i<200;i++){run(c,'EVT.etat=0;evtZone()');}
  ok(c.__prep.every(function(n){return n==='caisse';})&&c.__prep.length===200,'l\'orage : la caisse-nuage seule');}

console.log('4. au plus UN événement par partie');
{const c=bac('?evt=1');let max=0;
  for(let g=0;g<3000;g++){run(c,'evtPartie()');c.__prep.length=0;
    for(let zone=0;zone<8;zone++){run(c,'LVL.cur={sansFin:1,carte:\''+['nuages','ville'][zone%2]+'\',id:\''+['nuages','ville'][zone%2]+'\'}');run(c,'evtZone()');
      if(run(c,'EVT.etat===1')){run(c,'EVT.etat=2;EVT.fait=true');} // il part : « fait » est posé par evtDemarre
    }
    max=Math.max(max,c.__prep.length);}
  ok(max<=1,'sur 3000 parties de 8 zones éligibles, jamais plus d\'un posé (max '+max+')');
  // posé mais jamais parti (mort au portail) : la zone suivante le reprend ; parti : jamais deux
  run(c,'LVL.cur={sansFin:1,carte:\'nuages\',id:\'nuages\'};evtPartie();EVT.arme=true');c.__prep.length=0;run(c,'evtZone()');run(c,'EVT.etat=0');run(c,'evtZone()');ok(c.__prep.length===2,'posé mais jamais parti : la zone suivante le reprend');
  run(c,'EVT.etat=2;EVT.fait=true');c.__prep.length=0;run(c,'evtZone()');ok(c.__prep.length===0,'parti : plus rien pour la partie');}

console.log('5. la rareté ('+CARTES.length+' maps : '+CARTES.join(' ')+') : combien de parties en voient un ? (modèle : une zone = 45 % de mort, mort uniforme ; maps tirées sans la même deux fois)');
{const P=run(bac('?evt=1'),'EVT_P'),N=200000,PD=+process.env.EVT_MORT||.45,cartes=CARTES;
  let vues=0;
  for(let g=0;g<N;g++){if(Math.random()>=P)continue;let prev=null,vu=false;
    for(let zone=0;zone<12&&!vu;zone++){let carte;do{carte=cartes[(Math.random()*cartes.length)|0];}while(carte===prev);prev=carte;
      const pt=.3+Math.random()*.25; // le point de l'événement dans la zone
      const meurt=Math.random()<PD,ou=Math.random(); // il meurt où dans la zone ?
      if(carte==='nuages'){if(!meurt||ou>pt){vu=true;}}
      if(meurt)break;}
    if(vu)vues++;}
  rate=vues/N;console.log('  EVT_P='+P+' : '+(rate*100).toFixed(1)+' % des parties en voient un (1 sur '+(1/rate).toFixed(1)+')');
  ok(rate>.05&&rate<.4,'entre 5 % et 40 % (la cible d\'origine, une partie sur trois, comptait aussi le banquier de la VILLE, retiré le 14/10)');
  for(const pd of [.3,.6]){let v=0;for(let g=0;g<100000;g++){if(Math.random()>=P)continue;let prev=null,vu=false;for(let zone=0;zone<12&&!vu;zone++){let carte;do{carte=cartes[(Math.random()*cartes.length)|0];}while(carte===prev);prev=carte;const pt=.3+Math.random()*.25,meurt=Math.random()<pd,ou=Math.random();if((carte==='nuages'||carte==='ville')&&(!meurt||ou>pt))vu=true;if(meurt)break;}if(vu)v++;}
    console.log('  (mort par zone '+pd+' : '+(v/1000).toFixed(1)+' %)');}}

console.log(echecs?'\n'+echecs+' ECHEC(S)':'\nTOUT EST BON');process.exit(echecs?1:0);
