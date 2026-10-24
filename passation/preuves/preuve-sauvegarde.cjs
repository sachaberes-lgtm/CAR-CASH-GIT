#!/usr/bin/env node
/* PREUVE DE LA SAUVEGARDE D'UN JOUEUR RÉEL (2026-10-14, chasse aux bugs — agent sauvegarde-neuf)
   usage : node preuve-sauvegarde.cjs [chemin index.html]        (défaut : la référence de la session DEBUGGING)
   Sans navigateur. Le test EXTRAIT du fichier du jeu le texte RÉEL de :
     · tout le bloc `const SAVE={…}` jusqu'à `SAVE.load();` (def, san, load, flush, export, import, le miroir Capacitor Preferences,
       SAVE_VIDE) — exécuté tel quel dans un bac `vm` avec un localStorage simulé (peut jeter, Proxy) et un faux Capacitor.Preferences ;
     · `function enCoursPose`, `enCoursRetire`, `commitExploits`, `bank`, `bankMaxMaj` (la partie interrompue et son versement).
   BOUCHONS (dits dans le rapport) : THREE.MathUtils.clamp, ECO3.gain (.25, lu dans le fichier), ENGINE_TIERS (longueur lue dans le fichier),
   CARS (77 fiches, drapeau `retire` lu dans le texte de chaque fiche), CAR_UNLOCK (prix 1000 aux caisses retirées), carScan, auraRank.
   Cas : A joueur NEUF · B vieilles sauvegardes · C corrompues (JSON tronqué, null, nombres en chaîne, tableau, négatif, 1e999) + 6000
   sauvegardes mutées au hasard (jamais d'exception, forme garantie, idempotence) · D localStorage qui jette à l'écriture / à la lecture
   (avec et sans miroir natif) · E miroir natif : purge puis appli tuée pendant le boot · F partie interrompue (créditée UNE fois) ·
   G premier lancement : l'état écrit à chaque étape ramène au bon écran.
   Dernière ligne : PREUVE OK ou PREUVE KO — <cas> ; code de sortie 0 / 1.
   (24/10, débogage sortie iOS) MISE À JOUR — la preuve plantait (« m2Vierge is not defined ») : le bloc SAVE appelle désormais m2Vierge (missions v2),
   gagneAjoute, carRetiree, carOwned, HAB_RETIRES et m2Etat. Les quatre premiers et HAB_RETIRES sont EXTRAITS du fichier (le vrai code) ; m2Etat (la
   migration des missions, jugée par preuve-carnets-pop) est un bouchon vide. Depuis le 22/10 (Sacha : « enlève le système de sauvegarde du lien
   Vercel ») le web SANS Capacitor ne lit ni n'écrit rien (SAVE.neuf) sauf avec `?garde=1` : le bac simule donc `?garde=1` (la persistance de l'app
   native, où Capacitor est là), et le cas H vérifie le lien web neuf. B3 : une vieille sauvegarde a désormais le TAIL WHIP en tête de `figs` (15/10). */
'use strict';
const fs=require('fs'),vm=require('vm');
const REF='/Users/sachaberes/cash-car/debug/integ/VERSION PRINCIPALE/index.html';
const src=fs.readFileSync(process.argv[2]||REF,'utf8');
const KO=[];const ko=(cas,detail)=>{KO.push(cas);console.log('  KO  '+cas+(detail?' — '+detail:''));};
const ok=(cas,detail)=>console.log('  ok  '+cas+(detail?' — '+detail:''));
const verifie=(c,cas,detail)=>c?ok(cas,detail):ko(cas,detail);

// ---------- EXTRACTION ----------
function sauteTexte(t,i){const ch=t[i],n=t[i+1];
  if(ch==='/'&&n==='/'){const j=t.indexOf('\n',i);return j<0?t.length:j;}
  if(ch==='/'&&n==='*')return t.indexOf('*/',i+2)+1;
  if(ch==="'"||ch==='"'||ch==='`'){i++;while(i<t.length&&t[i]!==ch){if(t[i]==='\\')i++;i++;}return i;}
  return -1;}
function finBloc(t,i0,o,c){let d=0;for(let i=i0;i<t.length;i++){const s=sauteTexte(t,i);if(s>=0){i=s;continue;}
  if(t[i]===o)d++;else if(t[i]===c){d--;if(d===0)return i+1;}}throw new Error('bloc non fermé');}
function unique(rep){const i=src.indexOf(rep);if(i<0)throw new Error('repère introuvable : '+rep);if(src.indexOf(rep,i+1)>=0)throw new Error('repère non unique : '+rep);return i;}
function fonction(entete){const i=unique(entete);return src.slice(i,finBloc(src,i+entete.length-1,'{','}'));}
const iSave=unique('const SAVE={'),iFin=unique('if(BALADE){SAVE.d.tuto=1');
/* (24/10) ce que le bloc SAVE appelle hors de lui-même : le vrai code, hissé avant lui (dans le jeu ce sont des déclarations de fonction de la même IIFE) */
const iHab=unique('const HAB_RETIRES={'),habTxt=src.slice(iHab,finBloc(src,iHab+'const HAB_RETIRES='.length,'{','}'))+';';
const avantSave=[fonction('function m2Vierge(){'),fonction('function gagneAjoute(x){'),fonction('function carRetiree(i){'),fonction('function carOwned(i){'),habTxt,
  'function m2Etat(){} /* bouchon : la migration des missions (preuve-carnets-pop) */'].join('\n');
const blocSave=avantSave+'\n'+src.slice(iSave,iFin);
const F={enCoursPose:fonction('function enCoursPose(){'),enCoursRetire:fonction('function enCoursRetire(){'),
  commitExploits:fonction('function commitExploits(){'),bank:fonction('function bank(){'),bankMaxMaj:fonction('function bankMaxMaj(){'),chanceBase:fonction('function chanceBase(){')}; // (2026-10-14) la SECONDE CHANCE : chanceBase réelle, CHANCE bouchonné (jamais utilisée)
// CARS : nombre de fiches et drapeau retire
const iC=unique('const CARS=[')+'const CARS='.length,carsTxt=src.slice(iC,finBloc(src,iC,'[',']'));
const fiches=[];{let d=0,deb=-1;for(let i=0;i<carsTxt.length;i++){const s=sauteTexte(carsTxt,i);if(s>=0){i=s;continue;}
  const ch=carsTxt[i];if(ch==='['&&d===0)d=1;else if(ch==='{'){if(d===1)deb=i;d++;}else if(ch==='}'){d--;if(d===1)fiches.push(carsTxt.slice(deb,i+1));}}}
const NC=fiches.length,RETIRE=fiches.map(f=>/\bretire\s*:\s*1/.test(f));
const eco=/const ECO3=\{\s*gain:([\d.]+)/.exec(src);const ECOGAIN=eco?+eco[1]:.25;
const iE=unique('const ENGINE_TIERS=[')+'const ENGINE_TIERS='.length,NE=(function(){const t=src.slice(iE,finBloc(src,iE,'[',']'));let n=0,d=0;
  for(let i=0;i<t.length;i++){const s=sauteTexte(t,i);if(s>=0){i=s;continue;}if(t[i]==='{'){if(d===1)n++;d++;}else if(t[i]==='}')d--;else if(t[i]==='[')d=d||1;}return n;})();

// ---------- BAC ----------
const sleep=()=>new Promise(r=>setImmediate(r));
function fauxLS(init,opt){const store=Object.assign({},init||{});const o=opt||{};
  const mt={getItem:k=>(k in store?store[k]:null),setItem:(k,v)=>{(mt.set)(k,v);},removeItem:k=>{delete store[k];},clear:()=>{for(const k in store)delete store[k];}};
  const set=(k,v)=>{if(o.jetteEcriture)throw new Error('QuotaExceededError');store[k]=String(v);};mt.set=set;
  const ls=new Proxy(store,{get(t,p){if(typeof p==='symbol')return undefined;if(p in mt&&p!=='set')return mt[p];if(o.jetteLecture)throw new Error('SecurityError');return store[p];},
    set(t,p,v){set(p,v);return true;}});
  return {ls,store,o};}
function fauxCap(valeur,opt){const o=opt||{};const P={store:{},sets:[],gets:0,pend:[],
  get(a){P.gets++;if(o.rejette)return Promise.reject(new Error('x'));return new Promise(res=>{const r=()=>res({value:P.store[a.key]!==undefined?P.store[a.key]:null});if(o.attend)P.pend.push(r);else r();});},
  set(a){P.sets.push(a.value);P.store[a.key]=a.value;return Promise.resolve();}};
  if(valeur!==undefined)P.store.cashcarSave=valeur;return {Plugins:{Preferences:P},P};}
function boot(initLS,opt){const o=opt||{};const L=fauxLS(initLS,o);const cap=o.cap||null;const reloads={n:0};
  const sb={localStorage:L.ls,window:{Capacitor:cap},location:{reload(){reloads.n++;},search:o.search!=null?o.search:'?garde=1'},console,
    THREE:{MathUtils:{clamp:(x,a,b)=>Math.min(b,Math.max(a,x))}},ECO3:{gain:ECOGAIN},ENGINE_TIERS:new Array(NE).fill(0),
    CARS:RETIRE.map(r=>r?{retire:1}:{}),CAR_UNLOCK:RETIRE.map(r=>r?{p:1000}:null),pk:()=>null,SANS_CARRIERE:false,CHANCE:{used:false},jourCommit:()=>0,/* (2026-10-14, GAMEPLAY) LE RETOUR DU JOUR : commitExploits et enCoursPose l'appellent ; le quotidien n'a pas de rôle dans ces preuves */PAL:{b:(k,d)=>d}}; // PAL (T5, passe perf) : défaut = le palier « fast »
  const ctx=vm.createContext(sb);let err=null;
  try{vm.runInContext(blocSave+';',ctx);}catch(e){err=e;}
  return {ctx,store:L.store,reloads,err,cap,get S(){return vm.runInContext('SAVE',ctx);},run:t=>vm.runInContext(t,ctx)};}
const jsonProfond=o=>JSON.parse(JSON.stringify(o));
function marche(v,chemin,cb){if(v&&typeof v==='object'){for(const k of Object.keys(v))marche(v[k],chemin+'.'+k,cb);}else cb(v,chemin);}
function formeOK(d){const pb=[];marche(d,'d',(v,p)=>{if(v===undefined)pb.push(p+'=undefined');else if(typeof v==='number'&&!isFinite(v)&&p!=='d.best')pb.push(p+'='+v);});
  if(!(d.bank>=0&&d.bank<=1e30))pb.push('bank');
  for(const k of ['equipped','bestCar'])if(!(Number.isInteger(d[k])&&d[k]>=0&&d[k]<NC))pb.push(k);
  if(new Set(d.owned).size!==d.owned.length||d.owned.some(x=>!Number.isInteger(x)||x<0||x>=NC||RETIRE[x]))pb.push('owned');
  if(d.leaders.length>10||d.leaders.some(e=>typeof e.n!=='string'||!(e.s>=0)))pb.push('leaders');
  if(!d.vol||!(d.vol.mus>=0&&d.vol.mus<=1&&d.vol.sfx>=0&&d.vol.sfx<=1&&d.vol.vox>=0&&d.vol.vox<=1))pb.push('vol');
  if(!d.ex||!d.mis||!d.shop||!Array.isArray(d.figs)||!d.carr)pb.push('blocs');
  return pb;}

(async()=>{
// ---------- A : joueur NEUF ----------
console.log('A  joueur NEUF (aucune clé)');
{const b=boot({});verifie(!b.err,'A1 le bloc SAVE s\'exécute sans exception',b.err&&String(b.err));
  const d=b.S.d,pb=formeOK(d);verifie(pb.length===0,'A2 forme complète, aucun undefined/NaN',pb.join(','));
  verifie(d.tuto===0&&d.facile===undefined&&d.permis===0&&d.bank===0&&d.equipped===0&&!d.enCours,'A3 tuto 0, mode jamais choisi, permis 0, banque 0, LA HONTE');
  const ecrit=b.store.cashcarSave?JSON.parse(b.store.cashcarSave):null;verifie(ecrit&&ecrit.v===2&&ecrit.tuto===0,'A4 le 1er lancement écrit déjà une sauvegarde valide');
  const b2=boot({cashcarSave:b.store.cashcarSave}),b3=boot({cashcarSave:b2.store.cashcarSave});verifie(JSON.stringify(b3.S.d)===JSON.stringify(b2.S.d)&&JSON.stringify(b2.S.d.carr)==='{"nuages":0,"ville":0,"espace":0,"paris":0}','A5 relancer ne change plus rien dès le 2e chargement (idempotent ; `carr` {} → zéros au 1er rechargement, sans effet : lu par |0)');
  const L=boot({rrBest5:'1200',rrLeaders5:'[{"n":"ABC","s":900}]',rrBestCar5:'2',rrSfx5:'0'});
  verifie(L.S.d.best>0&&L.S.d.leaders.length===1&&L.S.d.sfx===false&&formeOK(L.S.d).length===0,'A6 anciennes clés rrXxx5 reprises une fois, forme garantie',JSON.stringify([L.S.d.best,L.S.d.sfx]));}

// ---------- B : vieilles sauvegardes ----------
console.log('B  vieilles versions');
{const libres=[];RETIRE.forEach((r,i)=>{if(!r&&i>0)libres.push(i);});const [c1,c2]=libres,cD=libres[libres.length-1]; /* (24/10) la DERNIÈRE caisse EN VENTE (la dernière fiche, aujourd'hui, est retirée : elle serait remboursée) */
  const recent={v:2,best:5000,leaders:[{n:'TOI',s:5000}],bestCar:4,equipped:c1,sfx:true,vox:true,mus:true,gamme:3,eco:3,
    ex:{eng:6,tricks:40,gaps:3,bumps:9,zones:2,chain:12,kmh:300,surv:0,runs:25,floor:0},bank:123456,aura:777,owned:[c1,c2,cD],tuto:1,permis:1,
    carr:{nuages:4,ville:2},mis:{n:3,ok:[1,0,1],best:[5,0,9]},shop:{own:['peinture:or'],eq:{peinture:'or'}}};
  const b=boot({cashcarSave:JSON.stringify(recent)}),d=b.S.d;
  verifie(formeOK(d).length===0,'B1 sauvegarde d\'avant LE DOGE / PARIS / figures / code cousin : forme complète',formeOK(d).join(','));
  verifie(d.bank===123456&&d.aura===777&&d.owned.join()===[c1,c2,cD].join()&&d.equipped===c1&&d.carr.nuages===4&&d.carr.ville===2&&d.carr.paris===0&&d.tuto===1&&d.permis===1&&d.ex.runs===25,'B2 argent, voitures (dont l\'index 76), carrière, permis gardés',JSON.stringify({bank:d.bank,aura:d.aura,owned:d.owned,att:[c1,c2,cD],eq:d.equipped,carr:d.carr,tuto:d.tuto,permis:d.permis,runs:d.ex.runs}));
  verifie(d.volH==='monte'&&d.volHv===2&&Array.isArray(d.figs)&&d.figs.indexOf('tonneau')>=0&&d.cousin===0&&d.bankMax>=d.bank,'B3 champs récents posés par défaut (volH, figures, cousin, bankMax)',JSON.stringify({volH:d.volH,volHv:d.volHv,figs:d.figs,cousin:d.cousin,bankMax:d.bankMax}));
  const sansEx=Object.assign({},recent);delete sansEx.ex;sansEx.bestCar=4;delete sansEx.tuto;delete sansEx.permis;
  const b2=boot({cashcarSave:JSON.stringify(sansEx)});verifie(b2.S.d.ex.floor===4&&b2.S.d.tuto===0,'B4 sans `ex` : clause de grand-père (floor=bestCar), tuto 0 (runs inconnu)',JSON.stringify([b2.S.d.ex.floor,b2.S.d.tuto]));
  const avecRuns=jsonProfond(recent);delete avecRuns.tuto;const b3=boot({cashcarSave:JSON.stringify(avecRuns)});verifie(b3.S.d.tuto===1,'B5 qui a déjà joué (runs>0) sans champ tuto : pas de leçon');
  const r1=RETIRE.indexOf(true),vieux={v:2,best:10,bank:50,owned:[r1],equipped:r1,gamme:3,eco:3};
  const b4=boot({cashcarSave:JSON.stringify(vieux)});const d4=b4.S.d;const b5=boot({cashcarSave:b4.store.cashcarSave});
  verifie(d4.bank===1050&&d4.owned.length===0&&d4.equipped===0&&b5.S.d.bank===1050,'B6 caisse retirée remboursée UNE fois (pas à chaque chargement)',JSON.stringify([d4.bank,b5.S.d.bank]));
  const gamme2={v:2,bank:10,owned:[1,2],bestCar:6,equipped:6};const b6=boot({cashcarSave:JSON.stringify(gamme2)});
  verifie(formeOK(b6.S.d).length===0&&b6.S.d.gamme===3&&b6.S.d.equipped===0,'B7 vraie vieille gamme (sans champ gamme) : remise à zéro des caisses, forme garantie');}

// ---------- C : corrompues + fuzz ----------
console.log('C  sauvegardes corrompues');
{const cas={'JSON tronqué':'{"v":2,"bank":5000,"owned":[3,','null':'null','nombre':'5','chaîne':'"abc"','tableau':'[]','objet vide':'{}','booléen':'true',
    'bank en chaîne':'{"v":2,"bank":"5000","gamme":3,"eco":3}','bank négative':'{"v":2,"bank":-900,"gamme":3,"eco":3}','bank 1e999':'{"v":2,"bank":1e999,"gamme":3,"eco":3}',
    'champs en objets':'{"v":2,"bank":{},"owned":"x","leaders":{"0":1},"ex":[],"mis":3,"shop":"z","vol":9,"carr":[1],"figs":{}}','NaN littéral':'{"v":2,"bank":NaN}'};
  for(const k in cas){const b=boot({cashcarSave:cas[k]});const pb=b.err?['exception : '+b.err]:formeOK(b.S.d);
    verifie(pb.length===0,'C '+k+' → démarre, forme complète',pb.join(','));}
  // un JSON illisible laisse-t-il une trace de la valeur d'origine ? (elle est écrasée par le flush de load)
  const brut='{"v":2,"bank":5000,"owned":[3,';const b=boot({cashcarSave:brut});
  console.log('  note  JSON illisible : la valeur d\'origine est ÉCRASÉE par le flush de SAVE.load ('+(b.store.cashcarSave!==brut?'oui':'non')+') — voir E pour le secours natif');
  // fuzz
  let seed=12345;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  const base=boot({cashcarSave:JSON.stringify({v:2,best:900,leaders:[{n:'A',s:5}],bestCar:5,equipped:5,gamme:3,eco:3,bank:777,aura:5,owned:[3,5],
    ex:{eng:2,tricks:1,gaps:1,bumps:1,zones:1,chain:1,kmh:1,surv:0,runs:3,floor:0,pubs:0,morts:{'nuages-1':{mur:2}},temps:{'nuages-1':12.5}},
    mis:{n:1,ok:[1,0,0],best:[1,2,3],f:1},shop:{own:['peinture:or'],eq:{peinture:'or',aile:'panneaux',trainee:'nitro'}},figs:['tonneau','x_y'],
    carr:{nuages:2},carrSel:{id:'ville',i:1},fruits:[{n:'pomme',b:.5,f:8}],vol:{mus:.5,sfx:1,vox:1},ai:{air:.5},bq:{j:3,l:['v:1']},
    enCours:{v:5,a:5,e:1,tr:1,ga:1,bu:1,sv:0,zo:1,ch:1,km:100,s:50,f:0},tctl:'pad',q:'net',sand:true,pseudo:'MOI',tuto:1,permis:1,shopVu:1,ast:3})}).S.d;
  const junk=['"__INF__"',null,'abc','12',-5,[],{},true,'x'.repeat(300),[1,[2,{a:null}]],{n:'a',s:'7'},9e99,0.5,-0,false,'__proto__'];
  const chemins=[];marche(base,'',(v,p)=>chemins.push(p.slice(1).split('.')));
  let n=0,pbs=0,idem=0,ex=0,exMsg='',bestInf=0;
  for(let t=0;t<(+process.env.FUZZ||2000);t++){const o=jsonProfond(base);const nb=1+Math.floor(rnd()*3);
    for(let m=0;m<nb;m++){const ch=chemins[Math.floor(rnd()*chemins.length)];let cur=o;for(let i=0;i<ch.length-1&&cur&&typeof cur==='object';i++)cur=cur[ch[i]];
      if(cur&&typeof cur==='object'){const j=junk[Math.floor(rnd()*junk.length)];cur[ch[ch.length-1]]=j;}}
    const texte=JSON.stringify(o).replace(/"__INF__"/g,'1e999');n++;
    const b=boot({cashcarSave:texte});
    if(b.err){ex++;exMsg=exMsg||String(b.err)+' ← '+texte.slice(0,160);continue;}
    const d=b.S.d,pb=formeOK(d);if(pb.length){pbs++;if(pbs<3)console.log('    forme : '+pb.join(',')+' ← '+texte.slice(0,200));}
    if(!isFinite(d.best))bestInf++;
    const b2=boot({cashcarSave:JSON.stringify(d)});const b3=boot({cashcarSave:JSON.stringify(b2.S.d)});const a=JSON.stringify(b3.S.d),c=JSON.stringify(b2.S.d);
    if(a!==c){idem++;if(idem<3)console.log('    non idempotent ← '+texte.slice(0,160));}}
  verifie(ex===0,'C fuzz '+n+' : aucune exception hors du try',exMsg);
  verifie(pbs===0,'C fuzz : forme complète (finis, bornés, sans undefined) dans '+(n-pbs)+'/'+n);
  verifie(idem===0,'C fuzz : charger ce qu\'on a écrit redonne la même chose ('+(n-idem)+'/'+n+')');
  if(bestInf)console.log('  note  `best` non borné : 1e999 dans `best` donne Infinity en mémoire ('+bestInf+' cas) — import/édition à la main seulement (S3, non corrigé)');}

// ---------- D : localStorage qui jette ----------
console.log('D  localStorage qui jette');
{let b=boot({},{jetteLecture:true});verifie(!b.err&&formeOK(b.S.d).length===0,'D1 lecture qui jette (Safari privé, accès refusé) : le jeu démarre sur une sauvegarde neuve',b.err&&String(b.err));
  b=boot({},{jetteEcriture:true});verifie(!b.err&&formeOK(b.S.d).length===0,'D2 écriture qui jette (quota) au chargement : pas d\'exception');
  const flushOK=(()=>{try{b.S.d.bank=500;b.S.mark();b.S.flush();return true;}catch(e){return false;}})();verifie(flushOK&&b.S.dirty!==false,'D3 flush sous quota : rien ne sort du try, `dirty` reste levé (le filet de 30 s réessaie)');
  // avec Capacitor : le miroir natif doit recevoir la sauvegarde même si localStorage est plein
  const cap=fauxCap(undefined);const bc=boot({},{jetteEcriture:true,cap});
  const P=cap.P;await sleep();await sleep(); // la lecture du miroir (vide) a répondu : natif 0
  bc.S.d.bank=4242;bc.S.flush();
  verifie(P.sets.some(v=>{try{return JSON.parse(v).bank===4242;}catch(e){return false;}}),'D4 localStorage plein + Capacitor : la sauvegarde part quand même vers Preferences (le secours qui survit aux purges)',
    'Preferences.set appelé '+P.sets.length+' fois, jamais avec bank=4242');}

// ---------- E : miroir natif, purge puis appli tuée pendant le boot ----------
console.log('E  miroir natif Preferences');
{const reelle=JSON.stringify({v:2,best:9000,bank:250000,owned:[3,5],bestCar:5,equipped:5,gamme:3,eco:3,tuto:1,permis:1,
    ex:{eng:8,tricks:90,gaps:4,bumps:11,zones:3,chain:20,kmh:400,surv:0,runs:60,floor:0}});
  // lancement 1 : localStorage purgé (vide), le miroir contient la vraie sauvegarde, la lecture asynchrone n'a PAS encore répondu
  const cap1=fauxCap(reelle,{attend:true});const b1=boot({},{cap:cap1});
  verifie(cap1.P.gets===1&&b1.S.natif===1,'E1 purge détectée : lecture du miroir demandée, écritures natives suspendues');
  verifie(cap1.P.sets.length===0,'E2 pendant l\'attente, rien n\'est écrit vers le miroir (la vraie sauvegarde n\'est pas écrasée)');
  // l'appli est tuée ici (la lecture ne répond jamais). Lancement 2 : même localStorage, même miroir.
  const cap2=fauxCap(reelle);const b2=boot(Object.assign({},b1.store),{cap:cap2});await sleep();await sleep();
  const recup=b2.store.cashcarSave===reelle&&b2.reloads.n===1;
  verifie(recup,'E3 relancée après avoir été tuée pendant le boot : la vraie sauvegarde est restaurée depuis le miroir',
    recup?'':'le localStorage contient déjà une sauvegarde vierge écrite par le lancement précédent (bank='+(b2.S.d.bank)+') : le miroir n\'est plus consulté et sera écrasé');
  // cas normal : la lecture répond → restauration + rechargement
  const cap3=fauxCap(reelle);const b3=boot({},{cap:cap3});await sleep();await sleep();
  verifie(b3.store.cashcarSave===reelle&&b3.reloads.n===1&&b3.S.natif===2,'E4 cas normal : miroir lu, localStorage semé, un seul rechargement, plus aucune écriture jusqu\'à lui');
  // installation neuve : miroir vide
  const cap4=fauxCap(undefined);const b4=boot({},{cap:cap4});await sleep();await sleep();
  verifie(b4.S.natif===0&&!!b4.store.cashcarSave&&b4.reloads.n===0&&cap4.P.sets.length>=1,'E5 installation neuve (miroir vide) : pas de rechargement, la sauvegarde neuve est écrite des deux côtés');
  // lecture en échec : le jeu continue, localStorage écrit, miroir intact
  const cap5=fauxCap(reelle,{rejette:true});const b5=boot({},{cap:cap5});await sleep();await sleep();b5.S.d.bank=1;b5.S.flush();
  verifie(cap5.P.sets.length===0&&!!b5.store.cashcarSave,'E6 lecture en échec : le miroir n\'est jamais écrasé, localStorage continue d\'être écrit');}

// ---------- F : partie interrompue ----------
console.log('F  partie interrompue (enCours) — le vrai code d\'enCoursPose / commitExploits');
function bacPartie(initLS,cap){const b=boot(initLS,{cap});
  b.run(`var started=true,gameOver=false,SANDBOX=false,TUTO={on:false,quitte:0},PARK={on:false},CHA={n:0,pts:0,x:1},mode='drive',running=true,money=1.61,START_CASH=1.61,auraRun=0,engTier=0,
    runStats={tricks:0,bumps:0,zones:0,vmax:0,chainMax:0,gaps:0,surv:0},FLOW={lv:0},FREN={t:0};function auraRank(){return 0;}function carScan(){return [];}
    ${F.bank}\n${F.bankMaxMaj}\n${F.enCoursPose}\n${F.enCoursRetire}\n${F.commitExploits}
${F.chanceBase}`);return b;}
{const gain=(b,v,a)=>b.run(`money=START_CASH+${v};auraRun=${a};runStats.tricks=2;runStats.vmax=210;engTier=3;`);
  let b=bacPartie({});gain(b,100,40);const banque0=b.S.d.bank;
  b.run('enCoursPose();SAVE.flush();');
  let r=bacPartie({cashcarSave:b.store.cashcarSave});
  verifie(Math.abs(r.S.d.bank-banque0-100)<1e-9&&r.S.d.ex.runs===1&&r.S.d.aura===40&&!r.S.d.enCours&&r.S.repris&&r.S.repris.v===100,'F1 tuée en arrière-plan : +100 versés, aura 40, partie comptée, instantané effacé');
  let r2=bacPartie({cashcarSave:r.store.cashcarSave});verifie(Math.abs(r2.S.d.bank-r.S.d.bank)<1e-9&&r2.S.d.ex.runs===1,'F2 relancée encore une fois : rien de plus (créditée UNE seule fois)');
  b=bacPartie({});gain(b,100,40);b.run('enCoursPose();SAVE.flush();');gain(b,300,90);b.run('enCoursPose();SAVE.flush();');
  r=bacPartie({cashcarSave:b.store.cashcarSave});verifie(Math.abs(r.S.d.bank-300)<1e-9,'F3 deux mises en arrière-plan de suite : l\'instantané remplace, ne s\'additionne pas',String(r.S.d.bank));
  b=bacPartie({});gain(b,100,40);b.run('enCoursPose();SAVE.flush();enCoursRetire();');gain(b,160,60);b.run('commitExploits();');
  r=bacPartie({cashcarSave:b.store.cashcarSave});verifie(Math.abs(r.S.d.bank-160)<1e-9&&r.S.d.ex.runs===1&&!r.S.d.enCours,'F4 retour au premier plan puis fin de partie : versée une fois (160), pas 260',String(r.S.d.bank));
  b=bacPartie({});gain(b,100,40);b.run('enCoursPose();SAVE.flush();');b.run('commitExploits();');
  r=bacPartie({cashcarSave:b.store.cashcarSave});verifie(Math.abs(r.S.d.bank-100)<1e-9&&r.S.d.ex.runs===1,'F5 fin de partie sans retour (instantané encore posé) : le versement réel emporte l\'instantané, pas de doublon',String(r.S.d.bank));
  b=bacPartie({});b.run('TUTO.on=true;money=START_CASH+50;');verifie(b.run('enCoursPose()')===false,'F6 pendant l\'auto-école : rien n\'est posé');
  b=bacPartie({});b.run('SANDBOX=true;money=START_CASH+50;');verifie(b.run('enCoursPose()')===false,'F7 bac à sable : rien n\'est posé');
  b=bacPartie({});b.run('money=NaN;');const rr=b.run('enCoursPose()');b.run('SAVE.flush();');
  r=bacPartie({cashcarSave:b.store.cashcarSave});verifie(formeOK(r.S.d).length===0&&isFinite(r.S.d.bank),'F8 argent de la partie en NaN au moment de la mise en veille : le chargement reste sain');
  b=bacPartie({});b.run('SAVE.d.bank=5000;money=NaN;auraRun=0;');let flot='ok';try{b.run('commitExploits();');}catch(e){flot=String(e);}
  verifie(isFinite(b.S.d.bank)&&b.S.d.bank===5000,'F9 `money` NaN à la fin d\'une partie : la banque (5000) n\'est pas détruite',
    'banque après = '+b.S.d.bank+' (NaN s\'écrit null dans le JSON puis se relit 0)');}

// ---------- G : premier lancement ----------
console.log('G  premier lancement — l\'état écrit à chaque étape ramène au bon écran');
{const ecran=d=>d.tuto?'accueil normal (JOUER lance une course)':(d.facile==null?'1er JOUER : question du mode PUIS auto-école':'1er JOUER : auto-école directe');
  const etapes=[['après le splash et l\'intro (rien choisi)',{}],['après FACILE/NORMAL (appli fermée pendant la leçon)',{facile:1}],
    ['leçon QUITTÉE (tutoQuitte : tuto 0)',{facile:0,tuto:0,ex:{runs:1}}],['PASSER (tutoFin(true))',{facile:0,tuto:1}],['permis passé (tutoFin(false))',{facile:0,tuto:1,permis:1,bank:500}]];
  const attendu=['1er JOUER : question du mode PUIS auto-école','1er JOUER : auto-école directe','1er JOUER : auto-école directe','accueil normal (JOUER lance une course)','accueil normal (JOUER lance une course)'];
  etapes.forEach((e,i)=>{const b=boot({cashcarSave:JSON.stringify(Object.assign({v:2,gamme:3,eco:3},e[1]))});const b2=boot({cashcarSave:b.store.cashcarSave});
    const ex=ecran(b2.S.d),bien=ex===attendu[i]&&formeOK(b2.S.d).length===0;verifie(bien,'G'+(i+1)+' '+e[0]+' → '+ex);});
  const b=boot({cashcarSave:JSON.stringify({v:2,gamme:3,eco:3,tuto:0,permis:1,bank:700,ex:{runs:9}})});verifie(b.S.d.tuto===0&&b.S.d.bank===700,'G6 « REVOIR L\'AUTO-ÉCOLE » (tuto 0 écrit) est respecté malgré les parties jouées');}

// ---------- H : le lien web sans sauvegarde (22/10, Sacha) ----------
console.log('H  lien web (sans Capacitor) : compte NEUF à chaque ouverture, rien d\'écrit');
{const vraie=JSON.stringify({v:2,best:9000,bank:250000,owned:[],gamme:3,eco:3,tuto:1,permis:1});
  const b=boot({cashcarSave:vraie},{search:''});
  verifie(!b.err&&b.S.neuf===true&&b.S.d.bank===0&&b.S.d.tuto===0&&formeOK(b.S.d).length===0,'H1 web sans ?garde=1 : partie neuve, forme complète',b.err&&String(b.err));
  b.S.d.bank=77;b.S.flush();verifie(b.store.cashcarSave===vraie,'H2 web : rien n\'est écrit (la clé présente n\'est ni lue ni écrasée)');
  const cap=fauxCap(undefined);const bc=boot({cashcarSave:vraie},{search:'',cap});await sleep();await sleep();
  verifie(bc.S.neuf===false&&bc.S.d.bank===250000,'H3 app native (Capacitor + Preferences) : la sauvegarde est lue, même sans ?garde=1',String(bc.S.d.bank));}

console.log('');
if(KO.length){console.log('PREUVE KO — '+KO.join(' ; '));process.exit(1);}
console.log('PREUVE OK');
})().catch(e=>{console.log('PREUVE KO — exception du test : '+e);process.exit(1);});
