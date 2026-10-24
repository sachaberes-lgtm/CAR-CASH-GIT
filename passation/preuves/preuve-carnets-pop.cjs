#!/usr/bin/env node
/* PREUVE DES CARNETS POP (2026-10-14, chasse aux bugs — reprise sur le PC)
   usage : node preuve-carnets-pop.cjs <index.html corrigé> [index.html ancien]
   Les carnets POP (aile PHÉNIX, traînée FOUDRE, peinture GUERRIER) ont pris les places 10 à 12 qu'occupait la suite sans fin.
   Un joueur QUI ÉTAIT au carnet 10-12 à la mise à jour garde les coches (`ok`) et meilleurs essais (`best`) des défis de l'ANCIEN
   carnet : le carnet POP s'ouvre avec des défis cochés qu'il n'a pas faits.
   Sans navigateur : on EXTRAIT du fichier le vrai bloc `const SAVE={…}` (def, san, load, flush), `const CARNETS=[…]` et
   `function popCarnets`, `function misEtat`, et on les exécute dans un bac `vm` (localStorage simulé). Bouchons : THREE.MathUtils.clamp,
   ECO3.gain, ENGINE_TIERS, CARS (77 fiches sans retrait), CAR_UNLOCK, GAP_ON.
   Cas : 1 joueur au carnet 10 d'avant la mise à jour → coches à zéro, PHÉNIX pas offert (il ne l'a pas gagné) ·
         2 relance après une coche relevée sur le carnet POP → la coche RESTE (la remise à zéro ne joue qu'une fois) ·
         3 joueur au carnet 11 → PHÉNIX offert (carnet 10 passé), coches à zéro · 4 joueur au carnet 13+ → coches gardées
         (mêmes défis, seuils plus bas), les trois POP offerts · 5 joueur neuf → rien ne bouge · 6 joueur au carnet 3 → coches gardées.
   Dernière ligne : PREUVE OK ou PREUVE KO — <cas> ; code de sortie 0 / 1. Avec un 2e fichier : l'ancien doit échouer au cas 1.
   (24/10, débogage sortie iOS) MISE À JOUR — tout sortait à zéro : depuis le 22/10 le web sans Capacitor ne relit plus la sauvegarde (SAVE.neuf, Sacha :
   « enlève le système de sauvegarde du lien Vercel ») ; le bac simule `?garde=1` (la persistance de l'app native). Le bloc SAVE appelle aussi m2Vierge,
   gagneAjoute, carRetiree, carOwned, HAB_RETIRES (extraits du fichier) et m2Etat (bouchon vide : misPop est appelé à la main, comme m2Etat le fait une fois). */
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
  const fonction=ent=>{const i=unique(ent);return src.slice(i,finBloc(src,i+ent.length-1,'{','}'));};
  const iSave=unique('const SAVE={'),iFin=unique('if(BALADE){SAVE.d.tuto=1');
  /* (2026-10-18, allègement) les carnets (missions v1) sont retirés : ne restent que CARNETS_POP, popCarnets et misPop (appelé une fois par m2Etat) */
  const neuf=src.indexOf('function misEtat(){')<0;
  const iC=unique(neuf?'const CARNETS_POP=[':'const CARNETS=['),carnets=src.slice(iC,finBloc(src,iC+(neuf?'const CARNETS_POP=':'const CARNETS=').length,'[',']'))+';';
  const iE=unique('const ENGINE_TIERS=[')+'const ENGINE_TIERS='.length,NE=(function(){const t=src.slice(iE,finBloc(src,iE,'[',']'));let n=0,d=0;
    for(let i=0;i<t.length;i++){const s=sauteTexte(t,i);if(s>=0){i=s;continue;}if(t[i]==='{'){if(d===1)n++;d++;}else if(t[i]==='}')d--;else if(t[i]==='[')d=d||1;}return n;})();
  const eco=/const ECO3=\{\s*gain:([\d.]+)/.exec(src);
  const iHab=unique('const HAB_RETIRES={'),habTxt=src.slice(iHab,finBloc(src,iHab+'const HAB_RETIRES='.length,'{','}'))+';';
  const avant=[fonction('function m2Vierge(){'),fonction('function gagneAjoute(x){'),fonction('function carRetiree(i){'),fonction('function carOwned(i){'),habTxt,'function m2Etat(){}'].join('\n');
  const code=carnets+'\n'+avant+'\n'+src.slice(iSave,iFin)+'\n'+(neuf?fonction('function popCarnets(s){')+'\n'+fonction('function misPop(){'):fonction('function misEtat(){')+'\n'+fonction('function popCarnets(s){'));
  const KO=[];const v=(c,cas,detail)=>{console.log('  '+(c?'ok':'KO')+'  '+cas+(detail?' — '+detail:''));if(!c)KO.push(cas);};
  // un lancement du jeu : localStorage donné → SAVE.load() (dans le bloc) → misEtat() (1er appel de la session) → ce qu'on lit
  function lance(store){
    const ls=new Proxy(store,{get(t,p){if(p==='getItem')return k=>(k in t?t[k]:null);if(p==='setItem')return (k,x)=>{t[k]=String(x);};if(p==='removeItem')return k=>{delete t[k];};return t[p];},set(t,p,x){t[p]=String(x);return true;}});
    const sb={localStorage:ls,window:{},location:{reload(){},search:'?garde=1'},console,THREE:{MathUtils:{clamp:(x,a,b)=>Math.min(b,Math.max(a,x))}},ECO3:{gain:eco?+eco[1]:.25},
      ENGINE_TIERS:new Array(NE).fill(0),CARS:new Array(77).fill(0).map(()=>({})),CAR_UNLOCK:new Array(77).fill(null),GAP_ON:false,pk:()=>null,SANS_CARRIERE:false,PAL:{b:(k,d)=>d}}; // (2026-10-18) m2Vierge : la sauvegarde des missions v2 (la preuve ne tournait plus depuis le 16/10)
    const ctx=vm.createContext(sb);vm.runInContext(code,ctx);
    return vm.runInContext(neuf?'(function(){misPop();SAVE.flush();const s=SAVE.d.mis||{n:0,ok:[0,0,0],best:[0,0,0]};return {s:JSON.parse(JSON.stringify(s)),own:SAVE.d.shop.own.slice(),N:9+CARNETS_POP.length};})()'
      :'(function(){const s=misEtat();SAVE.flush();return {s:JSON.parse(JSON.stringify(s)),own:SAVE.d.shop.own.slice(),N:CARNETS.length};})()',ctx);}
  // une sauvegarde écrite par la version d'AVANT les carnets POP (pas de `pop`)
  const vieille=(n,ok,best,own)=>({cashcarSave:JSON.stringify({v:2,best:0,leaders:[],mis:{n:n,ok:ok,best:best,f:1},shop:{own:own||[],eq:{peinture:'usine',aile:'panneaux',trainee:'nitro'}},gamme:3,eco:3})});
  let r;
  console.log(chemin);
  // 1
  const st1=vieille(9,[1,1,0],[300,9,40]);r=lance(st1);
  v(r.N===12,'0  douze carnets écrits à la main (9 + 3 POP)','CARNETS.length='+r.N);
  v(r.s.n===9&&r.s.ok.join()==='0,0,0'&&r.s.best.join()==='0,0,0'&&r.s.f===-1,'1  carnet 10 d\'avant la mise à jour : coches, meilleurs essais et défi suivi à zéro','ok='+r.s.ok+' best='+r.s.best+' f='+r.s.f);
  v(r.own.indexOf('aile:phenix')<0,'1b PHÉNIX pas offert (le carnet 10 est celui qu\'il relève)');
  // 2 : il relève le 1er défi du carnet POP, le jeu sauvegarde, on relance
  {const d=JSON.parse(st1.cashcarSave);d.mis.ok=[1,0,0];d.mis.best=[250,0,0];st1.cashcarSave=JSON.stringify(d);r=lance(st1);
   v(r.s.ok.join()==='1,0,0'&&r.s.best[0]===250,'2  relance : la coche gagnée sur le carnet POP reste (une seule remise à zéro)','ok='+r.s.ok+' best='+r.s.best);}
  // 3
  r=lance(vieille(10,[0,1,1],[0,30,400]));
  v(r.s.ok.join()==='0,0,0','3  carnet 11 d\'avant : coches à zéro','ok='+r.s.ok);
  v(r.own.indexOf('aile:phenix')>=0&&r.own.indexOf('trainee:foudre')<0,'3b PHÉNIX offert (carnet 10 passé), pas la FOUDRE',r.own.join(' '));
  // 4
  r=lance(vieille(14,[1,0,1],[1,2,3]));
  v(r.s.ok.join()==='1,0,1','4  carnet 15 (suite sans fin) : coches gardées','ok='+r.s.ok);
  v(['aile:phenix','trainee:foudre','peinture:guerrier'].every(k=>r.own.indexOf(k)>=0),'4b les trois habillages POP offerts',r.own.join(' '));
  // 5
  r=lance({});v(r.s.n===0&&r.s.ok.join()==='0,0,0'&&r.own.length===0,'5  joueur neuf : rien ne bouge');
  // 6
  r=lance(vieille(2,[1,0,1],[30,0,1000]));v(r.s.ok.join()==='1,0,1'&&r.s.best[2]===1000,'6  carnet 3 : coches gardées','ok='+r.s.ok);
  return KO;}

const a=essai(process.argv[2]);
let b=null;if(process.argv[3]){console.log('--- ANCIEN (doit échouer au cas 1) ---');try{b=essai(process.argv[3]);}catch(e){b=['exception : '+e.message];console.log('  '+e.message);}}
const okA=a.length===0,okB=!b||b.some(x=>/^1 /.test(x));
console.log(okA&&okB?'PREUVE OK':'PREUVE KO — '+(okA?'l\'ancien passe le cas 1 (la preuve ne prouve rien)':a.join(' | ')));
process.exit(okA&&okB?0:1);
