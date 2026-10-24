#!/usr/bin/env node
/* PREUVE DU CODE RESTAURÉ PENDANT UNE PARTIE (24/10, relecture ligne à ligne, lot MOTEUR)
   usage : node preuve-import-pause.cjs <index.html corrigé> [index.html ancien]
   Dans l'appli, la pause ouvre TOUS LES RÉGLAGES (#mSet), où « ENTRER UN CODE » restaure une sauvegarde : SAVE.import écrit le code, puis
   la page se recharge 900 ms plus tard. Ce rechargement (ou l'appli qu'on passe derrière pendant ces 900 ms) cache la page : l'écouteur
   visibilitychange d'init.js pose alors la partie EN PAUSE (enCoursPose) et ÉCRIT (SAVE.flush) — dans la sauvegarde qu'on vient de restaurer.
   Au lancement suivant, SAVE.load verse cet instantané : la sauvegarde restaurée reçoit l'argent, l'aura et la partie d'un AUTRE profil.
   (Même défaut que l'EFFACEMENT, corrigé le 24/10 par SAVE.natif=2 : plus aucune écriture jusqu'au rechargement.)
   Sans navigateur : le vrai bloc `const SAVE={…}` (comme preuve-miroir-illisible), le vrai enCoursPose, le vrai écouteur visibilitychange
   d'init.js et la vraie réponse de la fenêtre « ENTRER UN CODE » (mobile-tactile.js), exécutés dans un bac `vm`.
   Cas : 1 code restauré en pleine pause puis page cachée → la sauvegarde écrite est EXACTEMENT le code (pas d'instantané), et le lancement
   suivant n'y verse rien · 2 témoin : sans restauration, la page cachée pose bien l'instantané (la protection d'arrière-plan reste).
   Dernière ligne : PREUVE OK ou PREUVE KO ; avec un 2e fichier, l'ancien doit échouer au cas 1. */
'use strict';
const fs=require('fs'),vm=require('vm');
function sauteTexte(t,i){const ch=t[i],n=t[i+1];
  if(ch==='/'&&n==='/'){const j=t.indexOf('\n',i);return j<0?t.length:j;}
  if(ch==='/'&&n==='*')return t.indexOf('*/',i+2)+1;
  if(ch==="'"||ch==='"'||ch==='`'){i++;while(i<t.length&&t[i]!==ch){if(t[i]==='\\')i++;i++;}return i;}
  return -1;}
function finBloc(t,i0,o,c){let d=0;for(let i=i0;i<t.length;i++){const s=sauteTexte(t,i);if(s>=0){i=s;continue;}
  if(t[i]===o)d++;else if(t[i]===c){d--;if(d===0)return i+1;}}throw new Error('bloc non fermé');}
const attends=()=>new Promise(r=>setImmediate(r));
async function essai(chemin){
  const src=fs.readFileSync(chemin,'utf8');
  const unique=rep=>{const i=src.indexOf(rep);if(i<0)throw new Error('repère introuvable : '+rep);if(src.indexOf(rep,i+1)>=0)throw new Error('repère non unique : '+rep);return i;};
  const fonction=entete=>{const i=unique(entete);return src.slice(i,finBloc(src,i+entete.length-1,'{','}'));};
  const iHab=unique('const HAB_RETIRES={'),habTxt=src.slice(iHab,finBloc(src,iHab+'const HAB_RETIRES='.length,'{','}'))+';';
  const avant=[fonction('function m2Vierge(){'),fonction('function gagneAjoute(x){'),fonction('function carRetiree(i){'),fonction('function carOwned(i){'),habTxt,'function m2Etat(){}'].join('\n');
  const bloc=avant+'\n'+src.slice(unique('const SAVE={'),unique('if(BALADE){SAVE.d.tuto=1'));
  const pose=fonction('function enCoursPose(){')+'\n'+fonction('function enCoursRetire(){');
  /* l'écouteur visibilitychange d'init.js (la pause automatique, l'audio, l'instantané) */
  const iV=unique("addEventListener('visibilitychange',function(){ if(document.hidden&&started&&!gameOver&&!paused&&mode!=='boom')togglePause();");
  const iVf=src.indexOf('function(){',iV),ecoute='const ECOUTE_VIS='+src.slice(iVf,finBloc(src,iVf+'function()'.length,'{','}'))+';';
  /* la réponse de la fenêtre « ENTRER UN CODE » */
  const iM=unique("modale({titre:'ENTRER UN CODE'"),iT=src.indexOf('.then(function(r){',iM),iTf=iT+'.then('.length;
  const reponse='const REPONSE_CODE='+src.slice(iTf,finBloc(src,iTf+'function(r)'.length,'{','}'))+';';
  const iE=unique('const ENGINE_TIERS=[')+'const ENGINE_TIERS='.length,NE=(function(){const t=src.slice(iE,finBloc(src,iE,'[',']'));let n=0,d=0;
    for(let i=0;i<t.length;i++){const s=sauteTexte(t,i);if(s>=0){i=s;continue;}if(t[i]==='{'){if(d===1)n++;d++;}else if(t[i]==='}')d--;else if(t[i]==='[')d=d||1;}return n;})();
  const KO=[];const v=(c,cas,detail)=>{console.log('  '+(c?'ok':'KO')+'  '+cas+(detail?' — '+detail:''));if(!c)KO.push(cas);};
  function boot(store,jeu){
    const P={store:{},set(a){P.store[a.key]=a.value;return Promise.resolve();},get(a){return Promise.resolve({value:P.store[a.key]||null});}};
    const reload={n:0},T=[];
    const sb={localStorage:store,window:{Capacitor:{Plugins:{Preferences:P}}},location:{reload(){reload.n++;},search:''},console,document:{hidden:false},
      THREE:{MathUtils:{clamp:(x,a,b)=>Math.min(b,Math.max(a,x))}},ECO3:{gain:.25},ENGINE_TIERS:new Array(NE).fill(0),
      CARS:new Array(77).fill(0).map(()=>({})),CAR_UNLOCK:new Array(77).fill(null),PAL:{b:(k,d)=>d},
      atob:s=>Buffer.from(String(s),'base64').toString('binary'),btoa:s=>Buffer.from(String(s),'binary').toString('base64'),setTimeout(fn,ms){T.push(fn);return T.length;},toast(){},pxi(){return '';},TR(x){return x;},codeCousin(){return false;},sfx(){},SONV2:false,hap(){},mFill(){},
      /* la partie en cours, EN PAUSE (les réglages ouverts depuis la pause) */
      started:!!jeu,gameOver:false,paused:true,mode:'drive',running:true,SANDBOX:false,TUTO:{on:false},PARK:{on:false},CHA:{n:0},CHANCE:{used:false},START_CASH:1.61,
      money:jeu?jeu.money:0,auraRun:jeu?jeu.aura:0,engTier:3,runStats:{tricks:4,gaps:2,bumps:0,surv:0,zones:2,chainMax:3,vmax:420},FLOW:{lv:0},FREN:{t:0},jourCommit(){},
      togglePause(){},AC:null,SND:{sfx:true},musGraphe(){return false;},renderer:{getContext(){return {isContextLost(){return false;}};}},loop:{}};
    const ctx=vm.createContext(sb);
    vm.runInContext(bloc+'\n'+pose+'\nfunction chanceBase(){return CHANCE.used?CHANCE.m0:START_CASH;}\n'+ecoute+'\n'+reponse+'\nthis.__SAVE=SAVE;this.__V=ECOUTE_VIS;this.__R=REPONSE_CODE;',ctx);
    return {sb,ctx,reload,T,P};}
  const X=JSON.stringify({v:2,best:900,bank:1000,leaders:[],tuto:1,ex:{runs:5},gamme:3,eco:3});
  const Y={v:2,best:10,bank:7,aura:3,leaders:[],tuto:1,ex:{runs:1},gamme:3,eco:3};
  const codeY=Buffer.from(unescape(encodeURIComponent(JSON.stringify(Y))),'binary').toString('base64');
  console.log(chemin);
  /* 1 — restaurer Y pendant la pause d'une partie du profil X (50 000 $ encaissés, 800 d'aura), puis la page se cache (le rechargement) */
  let B=boot({cashcarSave:X},{money:50000,aura:800});
  B.sb.__R({v:1,texte:codeY});await attends();
  v(B.T.length>=1&&JSON.parse(B.sb.localStorage.cashcarSave).bank===7,'1a le code est restauré et le rechargement programmé','banque écrite='+JSON.parse(B.sb.localStorage.cashcarSave).bank);
  B.sb.document.hidden=true;B.sb.__V();await attends();
  const ecrit=JSON.parse(B.sb.localStorage.cashcarSave);
  v(!ecrit.enCours,'1b page cachée : AUCUN instantané écrit dans la sauvegarde restaurée',ecrit.enCours?'enCours.v='+ecrit.enCours.v+' $, a='+ecrit.enCours.a:'');
  const B2=boot({cashcarSave:B.sb.localStorage.cashcarSave},null);await attends();
  const d2=B2.sb.__SAVE.d;
  v(d2.bank===7&&(d2.aura|0)===3&&d2.ex.runs===1,'1c au lancement suivant, la sauvegarde est EXACTEMENT le code restauré','banque='+d2.bank+' aura='+d2.aura+' parties='+d2.ex.runs);
  /* 2 — témoin : sans restauration, la page cachée pose l'instantané (une partie tuée en arrière-plan reste versée) */
  B=boot({cashcarSave:X},{money:50000,aura:800});
  B.sb.document.hidden=true;B.sb.__V();await attends();
  const e2=JSON.parse(B.sb.localStorage.cashcarSave);
  v(!!e2.enCours&&e2.enCours.v>49000,'2  témoin : sans restauration, l\'instantané de la partie en pause est bien écrit','enCours.v='+(e2.enCours&&e2.enCours.v));
  return KO;}
(async()=>{
  const a=await essai(process.argv[2]);
  let b=null;if(process.argv[3]){console.log('--- ANCIEN (doit échouer au cas 1) ---');b=await essai(process.argv[3]);}
  const okA=a.length===0,okB=!b||b.some(x=>/^1/.test(x));
  console.log(okA&&okB?'PREUVE OK':'PREUVE KO — '+(okA?'l\'ancien passe le cas 1 (la preuve ne prouve rien)':a.join(' | ')));
  process.exit(okA&&okB?0:1);
})().catch(e=>{console.log('erreur : '+(e&&e.stack||e));console.log('PREUVE KO');process.exit(1);});
