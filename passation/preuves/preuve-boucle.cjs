// Preuve sans navigateur (boucle-etats) : l'état de la NITRO d'une partie ne doit pas passer à la suivante.
// Scénario : on meurt en tenant NITRO (le doigt reste posé pendant les 1,8 s de l'explosion : la porte de simulation de `loop` est fermée dès
// `gameOver`, plus rien ne remet `nitroOn` / `loop._nOn` / `nitroHeldT` à zéro), puis REJOUER (ou RECOMMENCER depuis la pause) → resetGame.
// À la 1re image de la partie neuve, le bloc nitro de `loop` croit que la nitro VIENT de s'éteindre : PSSHT de relâche, langues de feu aux pots,
// pétarade, nez qui pique et vibration (sensNitro) — pour une nitro qui n'existe pas.
// Usage : node preuve-boucle.cjs "<index.html>"   Sort 0 si rien de tout ça ne part, 1 sinon.
const fs=require('fs');const src=fs.readFileSync(process.argv[2],'utf8').split('\n');
const fin=(i0,t)=>{let i=i0;while(!t(src[i]))i++;return i;};
// 1) le VRAI bloc nitro de la boucle (de « if(nitroOn&&!loop._nOn&&mode==='drive')nitroSpool(); » à « loop._nOn=nitroOn; »)
const a=src.findIndex(l=>l.includes("if(nitroOn&&!loop._nOn&&mode==='drive')nitroSpool();")),b=fin(a,l=>l.trim().startsWith('loop._nOn=nitroOn;'));
const bloc=src.slice(a,b+1).join('\n');
// 2) la VRAIE sensNitro (de « function sensNitro( » à la 1re accolade seule en colonne 0)
const s0=src.findIndex(l=>l.startsWith('function sensNitro(')),s1=fin(s0,l=>l==='}');
const sens=src.slice(s0,s1+1).join('\n');
// 3) resetGame : on n'exécute QUE ses instructions qui remettent l'état de la nitro à zéro
const r0=src.findIndex(l=>l.startsWith('function resetGame(')),r1=fin(r0+1,l=>/^function /.test(l));
const body=src.slice(r0,r1).join('\n');
const stm=[];for(const m of body.matchAll(/(?:nitroOn=false|nitroBlue=false|nitroHeldT=0|loop\._nOn=false|loop\._nBl=false|SENS_NI\.on=false);/g))stm.push(m[0]);
const razTxt=stm.join('\n').replace(/\bnitroOn=/g,'S.nitroOn=').replace(/\bnitroBlue=/g,'S.nitroBlue=').replace(/\bnitroHeldT=/g,'S.nitroHeldT=').replace(/\bloop\./g,'S.loop.').replace(/\bSENS_NI\./g,'S.SENS_NI.');
const raz=new Function('S',razTxt);
// la 1re image de la partie neuve : `wantN` dit si le doigt est sur NITRO ; nitroOn = wantN && …
function image(S,wantN){
  S.wantN=wantN;S.nitroOn=wantN?true:false; // (le réservoir est plein à la partie neuve : nitroTientDe rend vrai si le doigt est posé)
  const C={blowOff:0,eteint:0,allume:0,coup:0,hap:0};
  const f=new Function('S','C','sensNitro','nitroSpool','nitroAllume','styleFromBoost','blowOff','nitroEteint','sfx','SENS',
    'let {nitroOn,nitroBlue,nitroHeldT,mode,wantN,dt,SONV2}=S;const loop=S.loop;'+bloc+';S.nitroOn=nitroOn;S.nitroHeldT=nitroHeldT;');
  f(S,C,function(dt,v){ // la vraie sensNitro, avec ses sorties comptées
    const g=new Function('S','C','sensCoup','sensHap','sensSecoue','REDUCED_MOTION','engGear','VPAL','SENS_NI','gameOver','mode','nitroOn','nitroHeldT','performance',
      sens.replace('function sensNitro(','return function(')+';');
    g(S,C,()=>C.coup++,()=>C.hap++,()=>{},false,1,{n:0},S.SENS_NI,false,S.mode,S.nitroOn,S.nitroHeldT,performance)(dt,v);},
    ()=>{},()=>C.allume++,()=>{},()=>C.blowOff++,()=>C.eteint++,()=>{},true);
  return C;
}
const frais=()=>({nitroOn:true,nitroBlue:false,nitroHeldT:1.4,loop:{_nOn:true,_nBl:false},SENS_NI:{on:true,ts:0,h:0,g:1,tg:0,c:0},mode:'drive',dt:1/60,SONV2:true});
let ko=[];
{ // A : mort NITRO tenue → REJOUER, doigt levé → 1re image : RIEN ne doit partir
  const S=frais();raz(S);const C=image(S,false);
  if(C.blowOff)ko.push('blowOff('+C.blowOff+') : le PSSHT de relâche part à la 1re image de la partie neuve');
  if(C.eteint)ko.push('nitroEteint('+C.eteint+') : les langues de feu + la pétarade partent sans nitro');
  if(C.coup||C.hap)ko.push('sensNitro : nez qui pique ('+C.coup+') + vibration ('+C.hap+') sans nitro');
}
{ // B : même chose, le doigt est DÉJÀ sur NITRO à la 1re image → l'allumage doit se jouer (front montant), pas de relâche
  const S=frais();raz(S);const C=image(S,true);
  if(C.blowOff||C.eteint)ko.push('doigt posé : relâche '+C.blowOff+'/'+C.eteint+' alors que la nitro vient de s\'allumer');
  if(!C.allume)ko.push('doigt posé : pas de coup d\'allumage (loop._nOn resté vrai : le front montant est perdu)');
}
console.log('instructions de remise à zéro lues dans resetGame:',stm.length?stm.join(' '):'(aucune)');
console.log(ko.length?'KO :\n - '+ko.join('\n - '):'OK : la nitro d\'une partie ne déborde pas sur la suivante');process.exit(ko.length?1:0);
