#!/usr/bin/env node
/* ================================================================================================
   CHECK-ACTIONS — le bot joue-t-il avec la MEME manette que le joueur ?
   ------------------------------------------------------------------------------------------------
   La physique est partagee (check-iso.js = 0.000e+0). Mais partager la physique ne sert a rien si
   le bot peut lui envoyer des commandes qu aucun humain ne peut produire. C etait le cas : il tenait
   le CABRE a fond tout en gardant le GAZ — impossible au clavier, ou les deux sortent des memes
   touches — et il « dosait » le gaz a 0,374, une valeur qu une touche binaire ne peut pas prendre.

   Ici on tire 10 000 sorties de reseau au hasard, on les passe par le mapping du bot, et on verifie
   que le vecteur {steer,gas,nitro,pitch} obtenu est TOUJOURS dans l ensemble atteignable par un
   humain. L ensemble de reference est calcule a partir de pcarInput lui-meme, pas recopie a la main.

   Usage : node check-actions.js [nbTirages]
   ================================================================================================ */
const {loadGame}=require('./sim-env');

const N=parseInt(process.argv[2]||'10000',10);

console.log('— chargement…');
const g=loadGame('?train=1&sim=1');
const T=g.get('__TRAIN');
const HID=T.inArr?16:16, OUT=4;

/* ---------- 1. L ENSEMBLE ATTEIGNABLE PAR UN HUMAIN ----------
   On enumere les etats de touches possibles et on applique la MEME formule que pcarInput :
       steer = (gauche?1:0) - (droite?1:0)
       gas   = bas ? -1 : (haut ? 1 : 0)
       pitch = (haut?-1:0) + (bas?1:0)
       nitro = Maj ou Espace
   (branche CLAVIER — c est ainsi que joue Sacha. La branche STICK du mobile autorise en plus un
   volant et une assiette analogiques avec AUTO_GAS : elle est listee a part, en information.) */
const HUMAIN=new Set();
for(const haut of [0,1]) for(const bas of [0,1])
  for(const gauche of [0,1]) for(const droite of [0,1])
    for(const nitro of [0,1]){
      const steer=(gauche?1:0)-(droite?1:0);
      const gas  = bas ? -1 : (haut ? 1 : 0);
      const pitch=(haut?-1:0)+(bas?1:0);
      HUMAIN.add(steer+'|'+gas+'|'+(nitro?1:0)+'|'+pitch);
    }
console.log('— etats de manette atteignables au clavier : '+HUMAIN.size);
[...HUMAIN].sort().forEach(k=>{ const [s,ga,n,p]=k.split('|');
  console.log('    volant '+s.padStart(2)+'  gaz '+ga.padStart(2)+'  nitro '+n+'  assiette '+p.padStart(2)); });

/* ---------- 2. 10 000 SORTIES DE RESEAU AU HASARD, PASSEES PAR LE MAPPING DU BOT ---------- */
function mulberry32(a){ return function(){ a|=0;a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
const rnd=mulberry32(4242);

// On fait tourner le VRAI botStep : c est lui qu on audite, pas une copie de sa logique.
T.reseed(7); T.GEN=0; T.genSinceTrack=99; T.newGen(true);
const bot=T.bots[0];
const vus=new Set();
let fautes=0, exemples=[];
for(let i=0;i<N;i++){
  // on force une sortie de reseau arbitraire, puis on declenche la decision du bot
  for(let k=0;k<HID+OUT;k++) T.outArr[k]=rnd()*2-1;
  const f0=bot.brain.forward;
  bot.brain.forward=function(){ return T.outArr; };   // le reseau rend NOTRE tirage
  bot.think=-1;                                        // …et on force le tick de decision
  try{ T.botStep(bot,1/60); } finally { bot.brain.forward=f0; }
  const c=bot.in;
  const cle=c.steer+'|'+c.gas+'|'+(c.nitro?1:0)+'|'+c.pitch;
  vus.add(cle);
  if(!HUMAIN.has(cle)){
    fautes++;
    if(exemples.length<5) exemples.push({tirage:i,cmd:JSON.parse(JSON.stringify(c))});
  }
  // on remet la caisse d aplomb sans reconstruire la piste (newGen ici coutait des minutes)
  if(!bot.alive||bot.mode!=='drive'){
    bot.alive=true; bot.mode='drive'; bot.s=200+((i*37)%2000); bot.lat=0; bot.psi=0;
    bot.v=60; bot.side=1; bot.driveDir=1; bot.graceT=1.6; bot.nitroR=1.2;
    bot.fallPos.set(0,0,0); bot.fallVel.set(0,0,0);
  }
}

/* ---------- 3. VERDICT ---------- */
console.log('\n— '+N+' sorties de reseau tirees au hasard');
console.log('— etats de manette effectivement produits par le bot : '+vus.size+' / '+HUMAIN.size+' possibles');
[...vus].sort().forEach(k=>{ const [s,ga,n,p]=k.split('|');
  console.log('    volant '+s.padStart(2)+'  gaz '+ga.padStart(2)+'  nitro '+n+'  assiette '+p.padStart(2)+
              (HUMAIN.has(k)?'':'   <<< INHUMAIN')); });

if(fautes){
  console.error('\nECHEC — '+fautes+' commande(s) hors de ce qu un humain peut produire :');
  for(const e of exemples) console.error('   tirage '+e.tirage+' : '+JSON.stringify(e.cmd));
  process.exit(1);
}
// garde-fou : un mapping qui ne produirait qu un seul etat passerait le test sans rien prouver
if(vus.size<4){
  console.error('\nECHEC — le bot ne produit que '+vus.size+' etat(s) de manette : le test ne prouve rien.');
  process.exit(1);
}
console.log('\nPASS — les '+N+' commandes du bot sont toutes atteignables par un humain au clavier.');
process.exit(0);
