#!/usr/bin/env node
/* PREUVE DU MIROIR NATIF FACE À UNE SAUVEGARDE LOCALE ILLISIBLE (2026-10-14, chasse aux bugs — reprise sur le PC)
   usage : node preuve-miroir-illisible.cjs <index.html corrigé> [index.html ancien]
   Dans l'app iPhone, la sauvegarde vit dans localStorage ET dans un miroir natif (Capacitor Preferences). Si localStorage contient un
   JSON ILLISIBLE (écriture tronquée), l'ancien code le prenait pour une sauvegarde présente : le miroir n'était pas lu, load repartait
   à neuf, et le flush suivant écrivait la sauvegarde VIERGE dans le miroir — perte totale.
   Sans navigateur : le vrai bloc `const SAVE={…}` jusqu'à `if(BALADE)` (le miroir et SAVE.load() compris) exécuté dans un bac `vm`
   (localStorage simulé, faux Capacitor.Preferences). Cas : 1 JSON tronqué + miroir plein → le miroir est lu, semé, rechargement, rien
   d'écrasé · 2 JSON tronqué + miroir vide → sauvegarde neuve écrite partout (comme avant) · 3 sauvegarde locale lisible → le miroir
   n'est PAS consulté (comportement inchangé) · 4 web sans Capacitor + JSON tronqué → aucune exception (inchangé).
   Dernière ligne : PREUVE OK ou PREUVE KO ; avec un 2e fichier, l'ancien doit échouer au cas 1.
   (24/10, débogage sortie iOS) MISE À JOUR : le bloc SAVE appelle m2Vierge, gagneAjoute, carRetiree, carOwned, HAB_RETIRES (extraits du fichier,
   hissés devant lui comme dans l'IIFE du jeu) et m2Etat (bouchon vide) ; le web sans Capacitor ne sauvegarde plus rien depuis le 22/10 (SAVE.neuf) :
   le cas 4 tourne avec `?garde=1` (là où quelque chose est lu). NOUVEAU cas 5 : miroir ILLISIBLE lui aussi → il était semé tel quel puis la page
   rechargeait, retrouvait un localStorage illisible, relisait le miroir, rechargeait… à l'infini (appli inutilisable). Il doit être traité comme vide. */
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
  const iE=unique('const ENGINE_TIERS=[')+'const ENGINE_TIERS='.length,NE=(function(){const t=src.slice(iE,finBloc(src,iE,'[',']'));let n=0,d=0;
    for(let i=0;i<t.length;i++){const s=sauteTexte(t,i);if(s>=0){i=s;continue;}if(t[i]==='{'){if(d===1)n++;d++;}else if(t[i]==='}')d--;else if(t[i]==='[')d=d||1;}return n;})();
  const KO=[];const v=(c,cas,detail)=>{console.log('  '+(c?'ok':'KO')+'  '+cas+(detail?' — '+detail:''));if(!c)KO.push(cas);};
  async function boot(lsInit,miroir,avecCap){
    const store=Object.assign({},lsInit);const P={store:{},sets:[],gets:0,get(a){P.gets++;return Promise.resolve({value:P.store[a.key]!==undefined?P.store[a.key]:null});},set(a){P.sets.push(a.value);P.store[a.key]=a.value;return Promise.resolve();}};
    if(miroir!==undefined)P.store.cashcarSave=miroir;
    const reload={n:0};
    const sb={localStorage:store,window:{Capacitor:avecCap===false?undefined:{Plugins:{Preferences:P}}},location:{reload(){reload.n++;},search:'?garde=1'},console,
      THREE:{MathUtils:{clamp:(x,a,b)=>Math.min(b,Math.max(a,x))}},ECO3:{gain:.25},ENGINE_TIERS:new Array(NE).fill(0),
      CARS:new Array(77).fill(0).map(()=>({})),CAR_UNLOCK:new Array(77).fill(null),pk:()=>null,SANS_CARRIERE:false,PAL:{b:(k,d)=>d}};
    const ctx=vm.createContext(sb);let err=null;try{vm.runInContext(bloc+';',ctx);}catch(e){err=e;}
    await attends();await attends();await attends();
    return {store,P,reload,err};}
  const plein=JSON.stringify({v:2,best:777,bank:5000,leaders:[],tuto:1});
  const tronque=plein.slice(0,plein.length-9);
  console.log(chemin);
  let r=await boot({cashcarSave:tronque},plein);
  v(!r.err,'1a JSON tronqué + miroir plein : aucune exception',r.err&&String(r.err));
  v(r.P.gets===1,'1b le miroir est LU','gets='+r.P.gets);
  v(r.P.store.cashcarSave===plein,'1c le miroir n\'est pas écrasé',r.P.sets.length+' écriture(s) : '+(r.P.sets[0]||'').slice(0,60));
  v(r.store.cashcarSave===plein&&r.reload.n===1,'1d le secours est semé dans localStorage et la page recharge une fois','reload='+r.reload.n);
  r=await boot({cashcarSave:tronque},undefined);
  v(!r.err&&r.P.gets===1&&r.P.sets.length>=1&&JSON.parse(r.P.store.cashcarSave).bank===0&&r.reload.n===0,'2  JSON tronqué + miroir vide : sauvegarde neuve écrite (localStorage + miroir), pas de rechargement');
  r=await boot({cashcarSave:plein},JSON.stringify({v:2,bank:1}));
  v(!r.err&&r.P.gets===0&&r.reload.n===0&&JSON.parse(r.store.cashcarSave).bank===5000,'3  sauvegarde locale lisible : le miroir n\'est pas consulté','gets='+r.P.gets);
  r=await boot({cashcarSave:tronque},undefined,false);
  v(!r.err&&r.reload.n===0,'4  web sans Capacitor + JSON tronqué : aucune exception',r.err&&String(r.err));
  /* 5 : le miroir aussi est illisible — deux lancements de suite (le 2e part du localStorage laissé par le 1er) : pas de rechargement en boucle */
  r=await boot({cashcarSave:tronque},tronque);const r2=await boot(Object.assign({},r.store),r.P.store.cashcarSave);
  v(!r.err&&!r2.err&&r.reload.n+r2.reload.n===0&&JSON.parse(r2.store.cashcarSave).v===2,'5  JSON tronqué + miroir tronqué : pas de rechargement en boucle, le jeu démarre (sauvegarde neuve)','rechargements '+r.reload.n+' puis '+r2.reload.n);
  return KO;}
(async()=>{
  const a=await essai(process.argv[2]);
  let b=null;if(process.argv[3]){console.log('--- ANCIEN (doit échouer au cas 1) ---');b=await essai(process.argv[3]);}
  const okA=a.length===0,okB=!b||b.some(x=>/^1/.test(x));
  console.log(okA&&okB?'PREUVE OK':'PREUVE KO — '+(okA?'l\'ancien passe le cas 1 (la preuve ne prouve rien)':a.join(' | ')));
  process.exit(okA&&okB?0:1);
})();
