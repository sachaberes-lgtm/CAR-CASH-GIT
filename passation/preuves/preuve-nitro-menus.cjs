// Preuve sans navigateur (nitro-menus) : le PSSHT de relâche (blowOff) ne doit pas sonner pendant l'EXPLOSION.
// Scénario : on meurt en tenant NITRO (≥ 0,35 s). La porte de simulation de `loop` reste OUVERTE les 1,8 s de `mode==='boom'`
// (endGame à boomT>1,8) : le doigt est encore posé, la caisse n'existe plus. Le joueur LÈVE le pouce pendant l'explosion →
// nitroOn passe à faux, loop._nOn est vrai, nitroHeldT > ,35 → blowOff() : soupape de turbo (souffle + flutter + grondement + coup de
// duck) PAR-DESSUS l'explosion. Tous les autres sons de cette fin de nitro sont gardés `mode!=='boom'` (nitroEteint, sensNitro,
// nitro.sec, nitro.vide, nitroAllume, nitroSpool, la flamme `nOn9`, la phrase `instruPlanifie`) : blowOff est le seul oubli.
// On extrait le VRAI bloc nitro de `loop` (de « if(nitroOn&&!loop._nOn&&mode==='drive')nitroSpool(); » à « loop._nOn=nitroOn; »).
// Usage : node preuve-nitro-menus.cjs "<index.html>"   Sort 0 si blowOff est muet en 'boom' et joue en 'drive'/'fall', 1 sinon.
const fs=require('fs');const src=fs.readFileSync(process.argv[2],'utf8').split('\n');
const fin=(i0,t)=>{let i=i0;while(!t(src[i]))i++;return i;};
/* (24/10, débogage sortie iOS) PÉRIMÉE puis remise à jour : depuis le 17/10 (NSEC, la panne sèche sous le doigt) la ligne du spool
   est « if(nitroOn&&!loop._nOn&&mode==='drive'&&!NSEC.sous)nitroSpool(); » et le bloc lit NSEC (et appelle sensPassages) : on repère la ligne
   par son début et sa fin, on fournit un NSEC neuf et un sensPassages vide. Même bloc, même propriété. */
const a=src.findIndex(l=>l.includes("if(nitroOn&&!loop._nOn&&mode==='drive'")&&l.includes('nitroSpool();')),b=a<0?-1:fin(a,l=>l.trim().startsWith('loop._nOn=nitroOn;'));
if(a<0){console.log('PREUVE KO — repère du bloc nitro de loop introuvable (nitroSpool)');process.exit(1);}
const bloc=src.slice(a,b+1).join('\n');
function image(mode,heldT,wantN){ // une image où le doigt LÈVE (wantN faux) alors que la nitro brûlait (loop._nOn vrai)
  const S={nitroOn:false,nitroBlue:false,nitroHeldT:heldT,mode:mode,wantN:wantN,dt:1/60,SONV2:true,loop:{_nOn:true,_nBl:false}};
  const C={blowOff:0,eteint:0,sec:0};
  const f=new Function('S','C','sensNitro','nitroSpool','nitroAllume','styleFromBoost','blowOff','nitroEteint','sfx','SENS','SONV2x',
    'let {nitroOn,nitroBlue,nitroHeldT,mode,wantN,dt,SONV2}=S;const loop=S.loop,NSEC=S.NSEC||{sous:false,etage:false},sensPassages=function(){};'+bloc+';S.nitroOn=nitroOn;S.nitroHeldT=nitroHeldT;');
  f(S,C,()=>{},()=>{},()=>{},()=>{},()=>C.blowOff++,()=>C.eteint++,(id)=>{if(id==='nitro.sec')C.sec++;},false);
  return C;
}
let ko=[];
{const C=image('boom',1.2,false);if(C.blowOff)ko.push('mode boom, nitro tenue 1,2 s puis pouce levé : blowOff('+C.blowOff+') — le PSSHT de turbo sonne sur la caisse qui explose');}
{const C=image('boom',1.2,true);if(C.blowOff||C.sec)ko.push('mode boom, panne sèche sous le doigt : blowOff('+C.blowOff+') / nitro.sec('+C.sec+')');}
{const C=image('drive',1.2,false);if(C.blowOff!==1)ko.push('mode drive, relâche normale : blowOff doit sonner une fois (a sonné '+C.blowOff+') — régression');}
{const C=image('fall',1.2,false);if(C.blowOff!==1)ko.push('mode fall, relâche normale : blowOff doit sonner une fois (a sonné '+C.blowOff+') — régression');}
{const C=image('drive',.2,false);if(C.blowOff)ko.push('mode drive, simple tap (0,2 s) : pas de blowOff (a sonné '+C.blowOff+')');}
console.log(ko.length?'PREUVE KO —\n - '+ko.join('\n - '):'PREUVE OK — pas de PSSHT de relâche pendant l\'explosion ; relâche normale (sol, vol) inchangée');process.exit(ko.length?1:0);
