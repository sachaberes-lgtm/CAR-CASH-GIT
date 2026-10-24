#!/usr/bin/env node
/* PREUVE DE LA REMISE EN JEU DE LA POUPÉE, DU REQUIN ET DE LA RAIE (2026-10-18, allègement, lot « caisses ») — remplace preuve-raie.cjs
   (le remboursement de LA RAIE du 14/10 n'existe plus : elle est revenue).
   usage : node preuve-remises.cjs <index.html neuf> [index.html d'avant (024675ba)]
   Sans navigateur : le vrai bloc `const SAVE={…}` (jusqu'à `if(BALADE)`) exécuté dans un bac `vm`, avec les VRAIES fiches CARS (évaluées) et le
   VRAI tableau CAR_UNLOCK extraits du fichier ; m2Vierge & co sont des bouchons (le bloc SAVE les appelle, la preuve ne les juge pas).
   Cas : 0 les trois caisses ne sont plus `retire`, les 27 autres retirées sont réduites à {retire,name}, les noms et leur ordre sont ceux de l'index des
   sauvegardes d'avant · 0b leurs prix/conditions (REQUIN 9,99 € en boutique, LA RAIE 2,5 M, LA POUPÉE 4,2 M) · 1 qui possède les trois les GARDE, sans
   remboursement · 2 qui roule avec LA RAIE garde LA RAIE (equipped) · 3 une caisse encore retirée, achetée, est remboursée une fois et sort de owned
   (comme avant) et son porteur repart en LA HONTE · 4 relance : pas de second remboursement. Avec un 2e fichier (l'ancien) : le cas 1 doit y échouer.
   Dernière ligne : PREUVE OK / PREUVE KO.
   (24/10, débogage sortie iOS) MISE À JOUR — deux des trois remises ont été DÉFAITES, par choix : LA POUPÉE retirée à nouveau le 18/10 (e09de946, Léo :
   « on l'enlève »), REQUIN retiré le 21/10 (4c4641d0, Sacha : « suprime la voiture shark dans la boutique », remplacé par LE SQUALE). Seule LA RAIE reste
   en jeu. La preuve vérifie donc : 0 LA RAIE en jeu, REQUIN et LA POUPÉE retirées · 0a toute fiche retirée garde son nom · 0c LA RAIE a un prix (le montant
   est un réglage, il n'est plus figé ici) · 1 qui possède LA RAIE la garde · 2 qui roule avec y reste · 3 LA POUPÉE achetée est remboursée à son prix, UNE
   fois, et sort de owned ; REQUIN (payée en € : pas de prix en argent du jeu) sort de owned SANS remboursement · 4 relance : rien de plus · 5 qui roulait
   avec une retirée repart en LA HONTE. Le bac : les vrais m2Vierge, gagneAjoute, carRetiree, carOwned, HAB_RETIRES ; `?garde=1` (le web sans Capacitor
   ne sauvegarde plus rien depuis le 22/10 — sans lui, rien n'était relu et tout sortait à zéro). */
'use strict';
const fs=require('fs'),vm=require('vm');
function sauteTexte(t,i){const ch=t[i],n=t[i+1];
  if(ch==='/'&&n==='/'){const j=t.indexOf('\n',i);return j<0?t.length:j;}
  if(ch==='/'&&n==='*')return t.indexOf('*/',i+2)+1;
  if(ch==="'"||ch==='"'||ch==='`'){i++;while(i<t.length&&t[i]!==ch){if(t[i]==='\\')i++;i++;}return i;}
  return -1;}
function finBloc(t,i0,o,c){let d=0;for(let i=i0;i<t.length;i++){const s=sauteTexte(t,i);if(s>=0){i=s;continue;}
  if(t[i]===o)d++;else if(t[i]===c){d--;if(d===0)return i+1;}}throw new Error('bloc non fermé');}
function lis(chemin){
  const src=fs.readFileSync(chemin,'utf8');
  const unique=rep=>{const i=src.indexOf(rep);if(i<0)throw new Error('repère introuvable : '+rep);if(src.indexOf(rep,i+1)>=0)throw new Error('repère non unique : '+rep);return i;};
  const fonction=entete=>{const i=unique(entete);return src.slice(i,finBloc(src,i+entete.length-1,'{','}'));};
  const iHab=unique('const HAB_RETIRES={'),habTxt=src.slice(iHab,finBloc(src,iHab+'const HAB_RETIRES='.length,'{','}'))+';';
  const avant=[fonction('function m2Vierge(){'),fonction('function gagneAjoute(x){'),fonction('function carRetiree(i){'),fonction('function carOwned(i){'),habTxt,'function m2Etat(){}'].join('\n');
  const bloc=avant+'\n'+src.slice(unique('const SAVE={'),unique('if(BALADE){SAVE.d.tuto=1'));
  const iC=unique('const CARS=[')+'const CARS='.length,carsTxt=src.slice(iC,finBloc(src,iC,'[',']'));
  const texte=[];{let d=0,deb=-1;for(let i=0;i<carsTxt.length;i++){const s=sauteTexte(carsTxt,i);if(s>=0){i=s;continue;}
    const ch=carsTxt[i];if(ch==='['&&d===0)d=1;else if(ch==='{'){if(d===1)deb=i;d++;}else if(ch==='}'){d--;if(d===1)texte.push(carsTxt.slice(deb,i+1));}}}
  const CARS=texte.map(f=>vm.runInNewContext('('+f+')',{}));
  const iU=unique('const CAR_UNLOCK=[')+'const CAR_UNLOCK='.length,CAR_UNLOCK=vm.runInNewContext('('+src.slice(iU,finBloc(src,iU,'[',']'))+')',{GAP_ON:false});
  const iE=unique('const ENGINE_TIERS=[')+'const ENGINE_TIERS='.length,NE=(function(){const t=src.slice(iE,finBloc(src,iE,'[',']'));let n=0,d=0;
    for(let i=0;i<t.length;i++){const s=sauteTexte(t,i);if(s>=0){i=s;continue;}if(t[i]==='{'){if(d===1)n++;d++;}else if(t[i]==='}')d--;else if(t[i]==='[')d=d||1;}return n;})();
  return {bloc,CARS,CAR_UNLOCK,NE};}
const KO=[];const v=(c,cas,detail)=>{console.log('  '+(c?'ok':'KO')+'  '+cas+(detail?' — '+detail:''));if(!c)KO.push(cas);};
function essai(chemin,avant){
  const {bloc,CARS,CAR_UNLOCK,NE}=lis(chemin);
  const idx=nom=>CARS.findIndex(c=>c.name===nom);
  const iR=idx('REQUIN'),iA=idx('LA RAIE'),iP=idx('LA POUPÉE'),iQ=idx('LE QUATTRO');
  function lance(store){const sb={localStorage:store,window:{},location:{reload(){},search:'?garde=1'},console,THREE:{MathUtils:{clamp:(x,a,b)=>Math.min(b,Math.max(a,x))}},ECO3:{gain:.25},
      ENGINE_TIERS:new Array(NE).fill(0),CARS:CARS.map(c=>Object.assign({},c)),CAR_UNLOCK,pk:()=>null,SANS_CARRIERE:false,PAL:{b:(k,d)=>d}};
    const ctx=vm.createContext(sb);vm.runInContext(bloc+';',ctx);return vm.runInContext('({bank:SAVE.d.bank,owned:SAVE.d.owned.slice(),equipped:SAVE.d.equipped,remb:SAVE.remb||null})',ctx);}
  const sauve=(owned,bank,equipped)=>({cashcarSave:JSON.stringify({v:2,best:0,leaders:[],owned,bank,equipped:equipped|0,gamme:3,eco:3})});
  console.log(chemin+'  (REQUIN '+iR+' · LA RAIE '+iA+' · LA POUPÉE '+iP+' · LE QUATTRO '+iQ+')');
  const ret=CARS.map((c,i)=>c.retire?i:-1).filter(i=>i>=0);
  v(iR>=0&&iA>=0&&iP>=0&&!CARS[iA].retire&&!!CARS[iR].retire&&!!CARS[iP].retire,'0  LA RAIE en jeu ; REQUIN (21/10) et LA POUPÉE (18/10) retirées','retirées : '+ret.length);
  v(ret.every(i=>typeof CARS[i].name==='string'&&CARS[i].name.length>0),'0a les '+ret.length+' fiches retirées gardent leur nom ('+ret.filter(i=>Object.keys(CARS[i]).sort().join()==='name,retire').length+' réduites à {retire,name})');
  if(avant){const A=lis(avant).CARS;v(A.length<=CARS.length&&A.every((c,i)=>c.name===CARS[i].name),'0b mêmes noms, même ordre que l\'index d\'avant ('+A.length+' fiches)');}
  v(CAR_UNLOCK[iA]&&CAR_UNLOCK[iA].p>0&&CAR_UNLOCK[iP]&&CAR_UNLOCK[iP].p>0&&CAR_UNLOCK[iR]&&!CAR_UNLOCK[iR].p,'0c LA RAIE et LA POUPÉE ont un prix en argent du jeu, REQUIN non (€)',JSON.stringify([CAR_UNLOCK[iA],CAR_UNLOCK[iP],CAR_UNLOCK[iR]]));
  const pP=CAR_UNLOCK[iP].p;const st=sauve([iR,iA,iP],1000,iA);let r=lance(st);
  v(r.owned.indexOf(iA)>=0,'1  qui possède LA RAIE la GARDE','owned '+r.owned);
  v(r.equipped===iA,'2  qui roulait avec LA RAIE y reste','equipped '+r.equipped);
  v(r.bank===1000+pP&&r.owned.indexOf(iP)<0&&r.owned.indexOf(iR)<0&&r.remb&&r.remb.n.join()==='LA POUPÉE','3  LA POUPÉE remboursée à son prix et sortie de owned ; REQUIN sortie sans remboursement','banque '+r.bank+' · remb '+JSON.stringify(r.remb));
  r=lance(st);v(r.bank===1000+pP&&!r.remb&&r.owned.join()===String(iA),'4  relance : pas de second remboursement','banque '+r.bank);
  r=lance(sauve([iP],0,iP));v(r.equipped===0,'5  qui roulait avec une caisse retirée repart en LA HONTE','equipped '+r.equipped);
  return KO.slice();}
const a=essai(process.argv[2],process.argv[3]);
let b=null;if(process.argv[3]){KO.length=0;console.log('--- ANCIEN (le cas 0 doit y échouer) ---');b=essai(process.argv[3]);}
const okA=a.length===0,okB=!b||b.some(x=>/^[0-3]/.test(x));
console.log(okA&&okB?'PREUVE OK':'PREUVE KO — '+(okA?'l\'ancien passe les cas de remise (la preuve ne prouve rien)':a.join(' | ')));
process.exit(okA&&okB?0:1);
