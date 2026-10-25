/* preuve : LE CLAVIER NE PASSE PAS SOUS LE PROFIL NI SOUS L'ATELIER DE LA PLAQUE (relecture du 24/10, B10 — code/missions/atelier.js).
   Au garage, le profil (#gProf) et l'atelier de la plaque s'ouvrent PAR-DESSUS l'atelier. Le gestionnaire clavier du garage ne regardait
   que `garageOn` : sur l'ordinateur (et un iPad au clavier), le focus hors du champ, I ouvrait l'INVENTAIRE derrière la feuille, les
   flèches changeaient la caisse dessous, et — profil seul ouvert — Entrée lançait la COURSE (garJouer) sous le profil. La molette, elle,
   s'arrêtait déjà (`PLQ.on||PLQ.prof`). On exécute le VRAI gestionnaire extrait d'index.html. */
const fs=require('fs'),vm=require('vm');
const src=fs.readFileSync(process.argv[2]||__dirname+'/../../VERSION PRINCIPALE/index.html','utf8');
const a=src.indexOf("addEventListener('keydown',e=>{if(!garageOn||ecranWipe._on"),b=src.indexOf('\n',a);
if(a<0){console.log('repère introuvable\nSANS OBJET');process.exit(0);}
const code=src.slice(a,b);
const n={inv:0,go:0,jouer:0};let h=null;
const ctx={addEventListener:(t,f)=>{if(t==='keydown')h=f;},garageOn:true,ecranWipe:{_on:false},GATL:{on:false},INV:{on:false},PLQ:{on:false,prof:true},GAR:{go:false},
  gEl:{classList:{contains:()=>false}},garAtelierLibre:()=>true,invOuvre:()=>{n.inv++;},invFerme(){},garageGo:()=>{n.go++;},garJouer:()=>{n.jouer++;},
  gModeM:()=>'tout',gModeVa(){},uiClic(){},garMisRetour(){},garMode(){},accueilRetour(){},closeGarage(){},started:false,gameOver:false,window:{},
  document:{querySelector:()=>null},gAtelier(){}};
vm.runInNewContext(code,ctx);
const touche=c=>h({code:c,repeat:false,preventDefault(){}});
touche('KeyI');touche('ArrowRight');touche('Enter');
console.log('profil ouvert au garage : I → inventaire '+n.inv+' · → caisse suivante '+n.go+' · Entrée → course '+n.jouer);
const avant={...n};n.inv=n.go=n.jouer=0;ctx.PLQ.on=true;
touche('KeyI');touche('ArrowLeft');
console.log('atelier de la plaque ouvert (focus hors du champ) : I → inventaire '+n.inv+' · ← caisse précédente '+n.go);
const sous=avant.inv+avant.go+avant.jouer+n.inv+n.go;
/* sans feuille ouverte, le garage répond toujours au clavier */
ctx.PLQ.on=false;ctx.PLQ.prof=false;n.inv=n.go=n.jouer=0;touche('KeyI');touche('ArrowRight');touche('Enter');
console.log('garage seul : I '+n.inv+' · → '+n.go+' · Entrée '+n.jouer);
const ok=sous===0&&n.inv===1&&n.go===1&&n.jouer===1;
console.log(ok?'PREUVE OK':'PREUVE KO');process.exit(ok?0:1);
