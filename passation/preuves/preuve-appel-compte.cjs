#!/usr/bin/env node
/* PREUVE DE L'APPEL PENDANT LE 3-2-1 (24/10, relecture ligne à ligne, lot MOTEUR)
   usage : node preuve-appel-compte.cjs <index.html corrigé> [index.html ancien]
   Sur iPhone, un appel / Siri / une alarme passent PAR-DESSUS le jeu : le contexte audio passe « interrupted » et `appelGuette`
   (moteur/mobile-tactile.js) ouvre la PAUSE — mais seulement si la course roule (!paused). Si l'appel tombe pendant le compte 3-2-1 qui
   suit REPRENDRE (la feuille descend, `paused` est encore vrai), rien ne se passait : le compte allait au bout et relançait la course sous
   la bannière d'appel — la caisse partait seule pendant qu'on décroche.
   Sans navigateur : les vraies fonctions appelGuette, repriseCompte, panOpen, feuilleOuvre, feuilleFerme extraites du fichier, exécutées dans
   un bac `vm` (feuille, contexte audio et minuteurs simulés). Cas : 1 appel pendant le compte → la feuille remonte, le compte s'annule, la
   partie reste en pause · 2 témoin : sans appel, le compte va au bout et la partie reprend · 3 appel en pleine course → la pause s'ouvre (inchangé).
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
function essai(chemin){
  const src=fs.readFileSync(chemin,'utf8');
  const unique=rep=>{const i=src.indexOf(rep);if(i<0)throw new Error('repère introuvable : '+rep);if(src.indexOf(rep,i+1)>=0)throw new Error('repère non unique : '+rep);return i;};
  const fonction=entete=>{const i=unique(entete);return src.slice(i,finBloc(src,i+entete.length-1,'{','}'));};
  const code=['function appelGuette(){','function repriseCompte(){','function panOpen(o,compte){','function feuilleOuvre(el,cls){','function feuilleFerme(el,cls){'].map(fonction).join('\n');
  const KO=[];const v=(c,cas,detail)=>{console.log('  '+(c?'ok':'KO')+'  '+cas+(detail?' — '+detail:''));if(!c)KO.push(cas);};
  function bac(){
    const T=[];const cl=new Set();
    const pan={classList:{contains:k=>cl.has(k),add:(...k)=>k.forEach(x=>cl.add(x)),remove:(...k)=>k.forEach(x=>cl.delete(x))},_fermeT:0,id:'tPanel'};
    const ecoute={};
    const AC={state:'running',_appelGuette:0,addEventListener(t,f){(ecoute[t]||(ecoute[t]=[])).push(f);},resume(){this.state='running';return Promise.resolve();},suspend(){}};
    const sb={pan,AC,started:true,gameOver:false,paused:false,mode:'drive',window:{},document:{documentElement:{getAttribute(){return null;}}},
      setTimeout(fn,ms){T.push(fn);return T.length;},clearTimeout(){},uiGarde(){},sfx(){},SONV2:true,SND:{sfx:true},hap(){},slam(){},
      avE(){return {classList:{add(){},remove(){}}};},busPlein(){},chimeNote(){},noteP(){return 0;},panSync(){},
      togglePause(){sb.paused=!sb.paused;},console};
    vm.createContext(sb);vm.runInContext(code+'\nthis.__appel=appelGuette;this.__panOpen=panOpen;this.__compte=repriseCompte;',sb);
    sb.__appel();
    const tourne=n=>{for(let k=0;k<n&&T.length;k++){const f=T.shift();f();}};
    return {sb,pan,AC,T,tourne,coupe(){AC.state='interrupted';for(const f of (ecoute.statechange||[]))f();}};}
  console.log(chemin);
  /* 1 — en pause, on touche REPRENDRE ; l'appel tombe après le « 3 » */
  let B=bac();B.sb.paused=true;B.pan.classList.add('open');
  B.sb.__panOpen(false,true); /* REPRENDRE : la feuille descend, le compte part */
  B.tourne(1); /* le « 3 » est dit, le « 2 » est programmé */
  v(B.sb.paused===true&&!!B.sb.__compte.t,'1a REPRENDRE : le compte 3-2-1 tourne, la partie est encore gelée');
  B.coupe(); /* l'appel : le contexte passe « interrupted » */
  B.tourne(20); /* le reste du compte (s'il tourne encore) et la fin de la descente de la feuille */
  v(B.sb.paused===true,'1b l\'appel pendant le compte : la partie RESTE en pause','paused='+B.sb.paused);
  v(B.pan.classList.contains('open')&&!B.pan.classList.contains('sortant'),'1c …et la feuille de pause est remontée (REPRENDRE sous le pouce)','classes='+['open','sortant'].filter(k=>B.pan.classList.contains(k)).join(','));
  /* 2 — témoin : sans appel, le compte va au bout */
  B=bac();B.sb.paused=true;B.pan.classList.add('open');B.sb.__panOpen(false,true);B.tourne(20);
  v(B.sb.paused===false,'2  témoin : sans appel, le 3-2-1 va au bout et la partie reprend','paused='+B.sb.paused);
  /* 3 — l'appel en pleine course : la pause s'ouvre (le correctif d'avant, inchangé) */
  B=bac();B.coupe();
  v(B.sb.paused===true&&B.pan.classList.contains('open'),'3  appel en pleine course : la pause s\'ouvre','paused='+B.sb.paused);
  return KO;}
const a=essai(process.argv[2]);
let b=null;if(process.argv[3]){console.log('--- ANCIEN (doit échouer au cas 1) ---');b=essai(process.argv[3]);}
const okA=a.length===0,okB=!b||b.some(x=>/^1/.test(x));
console.log(okA&&okB?'PREUVE OK':'PREUVE KO — '+(okA?'l\'ancien passe le cas 1 (la preuve ne prouve rien)':a.join(' | ')));
process.exit(okA&&okB?0:1);
