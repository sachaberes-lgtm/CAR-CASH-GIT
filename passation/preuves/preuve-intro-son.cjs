#!/usr/bin/env node
/* PREUVE DU SON DE L'INTRO (24/10, relecture ligne à ligne, lot MOTEUR)
   usage : node preuve-intro-son.cjs <index.html corrigé> [index.html ancien]
   L'intro (moteur/intro-161.js) a son PROPRE contexte audio (iAC). Deux défauts, rejoués sans navigateur : le vrai bloc de l'intro
   `(function(){ if(!INTRO_NEUVE)return; … })()` exécuté dans un bac `vm` (DOM et WebAudio simulés, minuteurs à la main).
   1 · LE TOUCHER TÔT : le film part tout seul (autoLance) ; il crée un contexte A, attend A.resume() (au plus 0,3 s). Un toucher dans ce délai
       lance le film SUR A (son() prend preAC) — puis la réponse de A.resume() arrivait et FERMAIT A : le film tapé tôt passait muet.
       Attendu : le contexte du film n'est pas fermé.
   2 · L'ARRIÈRE-PLAN : la boule attend le toucher indéfiniment, son pad tourne en boucle ; le jeu endort SON contexte à la page cachée,
       pas celui de l'intro (sur le site, Chrome Android le jouait dans la poche). Attendu : caché → endormi, revenu → réveillé.
   3 · TÉMOIN : sans toucher, la minuterie de 0,3 s lance le film (muet si le navigateur refuse le son) et ne ferme rien.
   Dernière ligne : PREUVE OK ou PREUVE KO ; avec un 2e fichier, l'ancien doit échouer (1 et 2). */
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
function U(){const f=function(){};return new Proxy(f,{get(t,k){if(k===Symbol.toPrimitive)return ()=>0;if(k==='then')return undefined;if(k in t)return t[k];return (t[k]=U());},
  set(t,k,v){t[k]=v;return true;},apply(){return U();},construct(){return U();}});}
function bac(src){
  const iRep=src.indexOf("/* ===== L'INTRO DU JEU, VERSION FINALE");if(iRep<0)throw new Error('intro introuvable');
  const iF=src.indexOf('(function(){',iRep),fin=finBloc(src,iF+'(function()'.length,'{','}');
  const code=src.slice(iF,fin)+')();';
  if(!/if\(!INTRO_NEUVE\)return;/.test(code.slice(0,80)))throw new Error('bloc de l\'intro mal découpé');
  const T=[];let tNow=1000;const L={win:{},doc:{}};
  const on=(o)=>function(ty,fn){(o[ty]||(o[ty]=[])).push(fn);};
  const off=(o)=>function(ty,fn){const a=o[ty]||[];const i=a.indexOf(fn);if(i>=0)a.splice(i,1);};
  function el(){const lst={};const b={classList:{add(){},remove(){},contains(){return false;}},style:{},addEventListener:on(lst),removeEventListener:off(lst),_l:lst,
    getBoundingClientRect(){return {left:0,top:0,width:390,height:844};},clientWidth:390,clientHeight:844,width:390,height:844,getContext(){return U();},remove(){},appendChild(){},getAttribute(){return null;}};
    return new Proxy(b,{get(t,k){if(k in t)return t[k];return (t[k]=U());},set(t,k,v){t[k]=v;return true;}});}
  const sp=el(),cv=el(),ttl=el();
  const ctxs=[];
  class FauxAC{constructor(){this.state='suspended';this.currentTime=0;this.sampleRate=48000;this.outputLatency=.01;this.destination=U();this.fermes=0;this.dorts=0;this.reveils=0;ctxs.push(this);
      this.resP=new Promise(r=>{this.resR=r;});}
    resume(){this.reveils++;return this.resP;} suspend(){this.dorts++;if(this.state!=='closed')this.state='suspended';return Promise.resolve();}
    close(){this.fermes++;this.state='closed';return Promise.resolve();}
    autorise(){if(this.state!=='closed')this.state='running';this.resR();}}
  const P=new Proxy(FauxAC.prototype,{get(t,k){if(k in t)return t[k];if(typeof k==='string'&&/^create/.test(k))return function(){return U();};return undefined;}});
  Object.setPrototypeOf(FauxAC.prototype,{});
  for(const k of ['createGain','createOscillator','createBiquadFilter','createBuffer','createBufferSource','createConvolver','createDelay','createChannelMerger','createStereoPanner','createDynamicsCompressor'])FauxAC.prototype[k]=function(){return U();};
  class FauxOff extends FauxAC{}
  const doc={hidden:false,readyState:'complete',fonts:{status:'loaded'},getElementById(id){return id==='splash'?sp:id==='fxCv'?cv:id==='spTitle'?ttl:null;},
    createElement(){return el();},head:{appendChild(){}},documentElement:{getAttribute(){return null;},classList:{add(){}}},
    addEventListener:on(L.doc),removeEventListener:off(L.doc),dispatchEvent(){}};
  const win={AudioContext:FauxAC,addEventListener:on(L.win),removeEventListener:off(L.win),dispatchEvent(){}};
  const sb={window:win,document:doc,INTRO_NEUVE:true,SAVE:{d:{tuto:1}},REDUCED_MOTION:false,devicePixelRatio:2,innerWidth:390,innerHeight:844,location:{search:''},
    addEventListener:win.addEventListener,removeEventListener:win.removeEventListener,
    setTimeout(fn,ms){T.push({fn,ms:+ms||0,t:tNow+(+ms||0)});return T.length;},clearTimeout(){},setInterval(){return 0;},clearInterval(){},
    requestAnimationFrame(){return 1;},cancelAnimationFrame(){},performance:{now(){return tNow;}},ResizeObserver:class{observe(){}},Path2D:class{moveTo(){}lineTo(){}addPath(){}},
    OfflineAudioContext:FauxOff,SND:{sfx:true},VOL:{sfx:1},LANG:'fr',BALADE:false,SIMU_JEU:false,apresPolice(f){f();},AC:null,initAudio(){},openGarage(){},IS_MOBILE:true,started:false,
    musicEl:null,musicMenuUrl(){return '';},musicMenu(){},musicDeverrouille(){},Event:class{constructor(t){this.type=t;}},console};
  vm.createContext(sb);vm.runInContext(code,sb);
  const lance=(ms)=>{for(const x of T.slice())if(x.ms===ms&&!x.fait){x.fait=true;x.fn();}};
  return {sb,sp,ctxs,T,lance,L,avance(ms){tNow+=ms;},etat(){return win.dbgIntro.etat();},clic(){for(const f of (sp._l.click||[]))f({});},
    vis(h){doc.hidden=h;for(const f of (L.doc.visibilitychange||[]).slice())f({});for(const f of (L.win.visibilitychange||[]).slice())f({});}};
}
async function essai(chemin){
  const src=fs.readFileSync(chemin,'utf8');const KO=[];
  const v=(c,cas,detail)=>{console.log('  '+(c?'ok':'KO')+'  '+cas+(detail?' — '+detail:''));if(!c)KO.push(cas);};
  console.log(chemin);
  /* 1 — le toucher pendant l'attente de A.resume() */
  let B=bac(src);
  B.lance(500); /* essaiAuto : la page est prête → autoLance */
  v(B.ctxs.length===1&&B.etat().lance===false,'1a autoLance a créé un contexte et attend sa réponse','contextes='+B.ctxs.length);
  B.avance(120);B.clic(); /* le toucher, 0,12 s plus tard : le film part sur ce contexte */
  const A=B.ctxs[0];
  v(B.etat().lance===true&&/^suspended|^running/.test(B.etat().son||''),'1b le toucher lance le film sur le contexte d\'autoLance','son='+B.etat().son);
  A.autorise();await attends();await attends(); /* le geste libère A.resume() : sa réponse arrive après le toucher */
  B.lance(300); /* (et la minuterie de 0,3 s, au cas où) */
  v(A.fermes===0&&A.state!=='closed','1c le contexte du film n\'est PAS fermé','état='+A.state+' fermetures='+A.fermes+' (son='+B.etat().son+')');
  /* 2 — l'arrière-plan pendant que la boule attend (un bac neuf : le navigateur permet le son, le film part tout seul, sonore) */
  B=bac(src);B.lance(500);const A2=B.ctxs[0];A2.autorise();await attends();await attends();
  v(B.etat().lance===true&&B.etat().muet===false&&A2.state==='running','2  le film part tout seul, avec le son','muet='+B.etat().muet+' état='+A2.state);
  B.vis(true);
  v(A2.state==='suspended'&&A2.dorts>=1,'2a page cachée : le contexte de l\'intro s\'endort','état='+A2.state+' endormi '+A2.dorts+' fois');
  const r0=A2.reveils;B.vis(false);
  v(A2.reveils>r0,'2b page revenue : il se réveille','réveils '+r0+' → '+A2.reveils);
  /* 3 — témoin : sans toucher, la minuterie lance le film muet et ne ferme rien */
  B=bac(src);B.lance(500);B.avance(300);B.lance(300);await attends();
  const A3=B.ctxs[0];
  v(B.etat().lance===true&&B.etat().muet===true&&A3.fermes===0,'3  sans toucher : film muet sur le même contexte, rien de fermé','muet='+B.etat().muet+' fermetures='+A3.fermes);
  return KO;}
(async function(){
  const a=process.argv[2],b=process.argv[3];if(!a){console.log('usage : node preuve-intro-son.cjs <index.html> [ancien]');process.exit(2);}
  if(!/L'INTRO DU JEU, VERSION FINALE/.test(fs.readFileSync(a,'utf8'))){console.log('PREUVE SANS OBJET (pas d\'intro 1.61 dans ce fichier)');return;}
  const ko=await essai(a);let ok=ko.length===0;
  if(b){const kb=await essai(b);const rate=kb.some(c=>/^1c|^2a/.test(c));console.log(rate?'  ok  l\'ancien fichier échoue bien (1c / 2a)':'  KO  l\'ancien fichier aurait dû échouer');if(!rate)ok=false;}
  console.log(ok?'PREUVE OK':'PREUVE KO');process.exit(ok?0:1);})().catch(e=>{console.log('erreur : '+(e&&e.stack||e));console.log('PREUVE KO');process.exit(1);});
