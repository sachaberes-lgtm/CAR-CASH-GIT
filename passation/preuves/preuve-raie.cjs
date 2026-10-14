#!/usr/bin/env node
/* PREUVE DU REMBOURSEMENT DE LA RAIE (2026-10-14, décision de Sacha relayée par PILOTAGE)
   usage : node preuve-raie.cjs <index.html corrigé> [index.html ancien]
   LA RAIE (achetée 2,5 M$ avant le 6/10, puis `k:'bientot'` sans prix, cachée `retire:1` le 14/10) sortait de `owned` à SAVE.san
   avec un remboursement de 0. Sans navigateur : le vrai bloc `const SAVE={…}` (jusqu'à `if(BALADE)`) exécuté dans un bac `vm`, avec
   les VRAIS noms et drapeaux `retire` des fiches CARS et le VRAI tableau CAR_UNLOCK extraits du fichier.
   Cas : 1 joueur qui possède LA RAIE → +2,5 M$ à la banque, LA RAIE hors de `owned`, SAVE.remb dit LA RAIE · 2 relance → pas de
   second remboursement · 3 joueur sans LA RAIE → banque intacte, pas de message · 4 une caisse retirée À PRIX (remboursement d'avant) :
   inchangé. Dernière ligne : PREUVE OK / PREUVE KO ; avec un 2e fichier, l'ancien doit échouer au cas 1. */
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
  const bloc=src.slice(unique('const SAVE={'),unique('if(BALADE){SAVE.d.tuto=1'));
  const iC=unique('const CARS=[')+'const CARS='.length,carsTxt=src.slice(iC,finBloc(src,iC,'[',']'));
  const fiches=[];{let d=0,deb=-1;for(let i=0;i<carsTxt.length;i++){const s=sauteTexte(carsTxt,i);if(s>=0){i=s;continue;}
    const ch=carsTxt[i];if(ch==='['&&d===0)d=1;else if(ch==='{'){if(d===1)deb=i;d++;}else if(ch==='}'){d--;if(d===1)fiches.push(carsTxt.slice(deb,i+1));}}}
  const CARS=fiches.map(f=>{const n=/\bname\s*:\s*'((?:[^'\\]|\\.)*)'/.exec(f);return {name:n?n[1].replace(/\\'/g,"'"):'',retire:/\bretire\s*:\s*1/.test(f)?1:0};});
  const iU=unique('const CAR_UNLOCK=[')+'const CAR_UNLOCK='.length,CAR_UNLOCK=vm.runInNewContext('('+src.slice(iU,finBloc(src,iU,'[',']'))+')',{GAP_ON:false});
  const iE=unique('const ENGINE_TIERS=[')+'const ENGINE_TIERS='.length,NE=(function(){const t=src.slice(iE,finBloc(src,iE,'[',']'));let n=0,d=0;
    for(let i=0;i<t.length;i++){const s=sauteTexte(t,i);if(s>=0){i=s;continue;}if(t[i]==='{'){if(d===1)n++;d++;}else if(t[i]==='}')d--;else if(t[i]==='[')d=d||1;}return n;})();
  const raie=CARS.findIndex(c=>c.name==='LA RAIE'),aprix=CARS.findIndex((c,i)=>c.retire&&CAR_UNLOCK[i]&&CAR_UNLOCK[i].p),libre=CARS.findIndex((c,i)=>!c.retire&&CAR_UNLOCK[i]&&CAR_UNLOCK[i].p);
  const KO=[];const v=(c,cas,detail)=>{console.log('  '+(c?'ok':'KO')+'  '+cas+(detail?' — '+detail:''));if(!c)KO.push(cas);};
  function lance(store){const sb={localStorage:store,window:{},location:{reload(){}},console,THREE:{MathUtils:{clamp:(x,a,b)=>Math.min(b,Math.max(a,x))}},ECO3:{gain:.25},
      ENGINE_TIERS:new Array(NE).fill(0),CARS,CAR_UNLOCK,pk:()=>null,SANS_CARRIERE:false,PAL:{b:(k,d)=>d}};
    const ctx=vm.createContext(sb);vm.runInContext(bloc+';',ctx);return vm.runInContext('({bank:SAVE.d.bank,owned:SAVE.d.owned.slice(),remb:SAVE.remb||null})',ctx);}
  const sauve=(owned,bank)=>({cashcarSave:JSON.stringify({v:2,best:0,leaders:[],owned,bank,gamme:3,eco:3})});
  console.log(chemin+'  (LA RAIE = caisse '+raie+', retirée à prix = '+aprix+', en vente = '+libre+')');
  v(raie>=0&&CARS[raie].retire===1,'0  LA RAIE existe et est retirée');
  const st=sauve([raie,libre],1000);let r=lance(st);
  v(r.bank===1000+2.5e6&&r.owned.indexOf(raie)<0&&r.owned.indexOf(libre)>=0,'1  LA RAIE possédée → +2,5 M$, elle sort de owned, l\'autre caisse reste','banque '+r.bank+' · owned '+r.owned);
  v(!!r.remb&&r.remb.v===2.5e6&&r.remb.n.join()==='LA RAIE','1b le menu a de quoi le dire (SAVE.remb)',JSON.stringify(r.remb));
  r=lance(st); /* st a été réécrit par le flush de load */
  v(r.bank===1000+2.5e6&&!r.remb,'2  relance : pas de second remboursement','banque '+r.bank);
  r=lance(sauve([libre],1000));v(r.bank===1000&&!r.remb,'3  joueur sans LA RAIE : banque intacte, pas de message');
  if(aprix>=0){r=lance(sauve([aprix],0));v(r.bank===CAR_UNLOCK[aprix].p&&r.owned.indexOf(aprix)<0,'4  caisse retirée à prix : remboursée comme avant','banque '+r.bank);}
  return KO;}
const a=essai(process.argv[2]);
let b=null;if(process.argv[3]){console.log('--- ANCIEN (doit échouer au cas 1) ---');b=essai(process.argv[3]);}
const okA=a.length===0,okB=!b||b.some(x=>/^1 /.test(x));
console.log(okA&&okB?'PREUVE OK':'PREUVE KO — '+(okA?'l\'ancien passe le cas 1 (la preuve ne prouve rien)':a.join(' | ')));
process.exit(okA&&okB?0:1);
