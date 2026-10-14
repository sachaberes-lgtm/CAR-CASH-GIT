// jour-test.cjs — teste le VRAI bloc « LE RETOUR DU JOUR ET LE CADEAU » de index.html (extrait tel quel) avec une sauvegarde, une horloge et un monde simules.
// node outils/jour-test.cjs [chemin/index.html]   — code de sortie 0 si tout passe. Aucun navigateur.
// (2026-10-14, GAMEPLAY — Sacha : « la 1re partie du JOUR x2, plus un bonus de SERIE » · « un cadeau gratuit toutes les ~6 h »)
const fs=require('fs'),path=require('path');
const SRC=fs.readFileSync(process.argv[2]||path.join(__dirname,'..','VERSION PRINCIPALE','index.html'),'utf8');
const i=SRC.indexOf("/* (2026-10-14, GAMEPLAY — Sacha : « la 1re partie du JOUR ×2"),j=SRC.indexOf('/* fin LE RETOUR DU JOUR ET LE CADEAU */');
if(i<0||j<0)throw new Error('bloc introuvable');
const CODE=SRC.slice(i,j);
// les deux lignes de san() qui concernent le jour et le cadeau, extraites telles quelles
const lj=/^\s*(c\.jour=\{d:'',n:0\};[^\n]*)$/m.exec(SRC),lc=/^\s*(c\.cad=\{t:0\};[^\n]*)$/m.exec(SRC);
if(!lj||!lc)throw new Error('lignes de san() introuvables');
const SAN=new Function('d','JOUR','jourNum','Date','const c={};'+lj[1]+'\n'+lc[1]+'\nreturn c;');

let ko=0;const t=(nom,ok,plus)=>{console.log((ok?'OK  ':'KO  ')+nom+(ok||plus===undefined?'':'  → '+JSON.stringify(plus)));if(!ok)ko++;};

/* L'horloge : `H.now` = l'instant courant (ms). Les dates locales se construisent avec le constructeur LOCAL (new Date(a,m,j,h,mi)) : le fuseau de la machine de test n'a aucune importance. */
function monde(opt){opt=opt||{};
  const H={now:opt.now!=null?opt.now:new Date(2026,9,14,12,0,0).getTime()};
  class FD extends Date{constructor(...a){if(a.length)super(...a);else super(H.now);} static now(){return H.now;}}
  const save={d:{tuto:opt.tuto===0?0:1,bank:opt.bank||0,best:opt.best||0,jour:opt.jour||{d:'',n:0},cad:opt.cad||{t:0},bankMax:0}};
  const flush={n:0},toasts=[],sons=[];
  const g={location:{search:opt.search||''},SAVE:Object.assign(save,{flush(){flush.n++;},mark(){}}),TUTO:{on:!!opt.tutoOn},SANDBOX:!!opt.sandbox,PARK:{on:!!opt.park},BALADE:!!opt.balade,
    RUNX:{t:opt.t!=null?opt.t:60},ECOD:{k:opt.ecod!=null?opt.ecod:1.5},bank:()=>save.d.bank||0,bankMaxMaj(){if(save.d.bank>save.d.bankMax)save.d.bankMax=save.d.bank;},
    TR:s=>s,I18N:{},window:{},document:{dispatchEvent(){}},SONV2:true,sfx:id=>sons.push(id),uiClic(){},hap(){},toast:(h,m)=>toasts.push([h,m]),pxi:n=>'['+n+']',fmtC:v=>'$'+Math.round(v),
    ecoRond:v=>{if(v<100)return Math.max(10,Math.round(v/10)*10);const p=Math.pow(10,Math.floor(Math.log10(v))-1);return Math.round(v/p)*p;},Date:FD,Event:class{}};
  const names=Object.keys(g);
  const F=new Function(...names,CODE+'\nreturn {JOUR,CADO,jourAuj,jourNum,jourEtat,jourPrime,jourMaj,jourCommit,jourTexte,jourFinTexte,cadeauValeur,cadeauEtat,cadeauOuvre,cadeauRecale,cadeauHorlogeOk,win:window,dbgJour:window.dbgJour,dbgCadeau:window.dbgCadeau};');
  const m=F(...names.map(k=>g[k]));
  return Object.assign(m,{H,save,g,flush,toasts,sons,FD,
    jour:(a,mo,d,h,mi)=>{H.now=new Date(a,mo-1,d,h==null?12:h,mi||0,0).getTime();}, // se placer à une date/heure LOCALE
    partie:(o)=>{o=o||{};m.g.RUNX.t=o.t!=null?o.t:60;m.g.TUTO.on=!!o.tuto;m.g.ECOD.k=o.ecod!=null?o.ecod:1.5;m.jourMaj();} /* le départ d'une partie */});
}
const jr=(Y,M,D)=>Y+'-'+String(M).padStart(2,'0')+'-'+String(D).padStart(2,'0');

// ---------- 1. jourNum : les dates illisibles ----------
{const m=monde();
 t('jourNum : une date valide',m.jourNum('2026-10-14')===Math.round(Date.UTC(2026,9,14)/864e5));
 t('jourNum : deux dates se retranchent juste (changement d\'heure)',m.jourNum('2026-03-30')-m.jourNum('2026-03-29')===1&&m.jourNum('2026-10-26')-m.jourNum('2026-10-25')===1);
 t('jourNum : bissextile',m.jourNum('2028-03-01')-m.jourNum('2028-02-28')===2&&m.jourNum('2027-03-01')-m.jourNum('2027-02-28')===1);
 const mauvais=['','abc','2026-13-01','2026-00-10','2026-02-31','2026-04-31','2019-12-31','2101-01-01','26-10-14','2026-1-4',null,undefined,12345,{},[],'2026-10-14T10:00'];
 t('jourNum : 16 valeurs illisibles → NaN, sans exception',mauvais.every(x=>{let v;try{v=m.jourNum(x);}catch(e){return false;}return v!==v;}),mauvais.filter(x=>{try{return m.jourNum(x)===m.jourNum(x);}catch(e){return true;}}));}

// ---------- 2. jourAuj : la date LOCALE, minuit, horloge absurde ----------
{const m=monde();
 m.jour(2026,10,14,23,59);t('jourAuj : 23 h 59 → le jour',m.jourAuj()==='2026-10-14');
 m.jour(2026,10,15,0,1);t('jourAuj : 0 h 01 → le lendemain',m.jourAuj()==='2026-10-15');
 m.jour(2026,3,29,12);t('jourAuj : le jour du passage à l\'heure d\'été (Europe)',m.jourAuj()==='2026-03-29');
 m.jour(2026,12,31,23,59);t('jourAuj : 31 décembre 23 h 59',m.jourAuj()==='2026-12-31');
 m.jour(2027,1,1,0,0);t('jourAuj : 1er janvier 0 h 00',m.jourAuj()==='2027-01-01');
 m.H.now=NaN;t('jourAuj : horloge NaN → "" (rien ne plante)',m.jourAuj()==='');
 m.H.now=new Date(1970,0,1).getTime();t('jourAuj : 1970 → "" (horloge absurde)',m.jourAuj()==='');
 m.H.now=new Date(2300,5,1).getTime();t('jourAuj : 2300 → ""',m.jourAuj()==='');
 m.jour(2026,10,14);m.JOUR.dec=1;t('jourAuj : décalage des bancs +1 jour',m.jourAuj()==='2026-10-15');m.JOUR.dec=-14;t('jourAuj : décalage −14 jours',m.jourAuj()==='2026-09-30');}

// ---------- 3. jourEtat : la série et le ×2 ----------
{const m=monde();m.jour(2026,10,14);const E=(d,n)=>{m.save.d.jour={d:d,n:n};return m.jourEtat('2026-10-14');};
 let e=E('',0);t('jourEtat : jamais joué → ×2 dispo, série suivante 1',e.ok&&e.dispo&&e.suiv===1&&e.n===0&&!e.recale,e);
 e=E('2026-10-14',3);t('jourEtat : déjà pris aujourd\'hui → pas de ×2, la série reste 3',e.ok&&!e.dispo&&e.suiv===3&&e.n===3,e);
 e=E('2026-10-13',3);t('jourEtat : hier → ×2 dispo, la série vivante est 3, la suivante 4',e.dispo&&e.suiv===4&&e.n===3,e);
 e=E('2026-10-12',5);t('jourEtat : avant-hier (un jour sauté) → ×2 dispo, série cassée',e.dispo&&e.suiv===1&&e.n===0,e);
 e=E('2026-08-01',9);t('jourEtat : il y a deux mois → série cassée',e.dispo&&e.suiv===1&&e.n===0,e);
 e=E('2026-10-15',4);t('jourEtat : demain (UN jour de moins : voyage vers l\'ouest) → déjà pris, pas de recalage',!e.dispo&&!e.recale&&e.n===4,e);
 e=E('2026-10-16',4);t('jourEtat : après-demain (horloge reculée de 2 jours) → pas de ×2, recale',!e.dispo&&e.recale&&e.n===4,e);
 e=E('2030-01-01',4);t('jourEtat : date dans 3 ans (horloge reculée) → pas de ×2, recale',!e.dispo&&e.recale,e);
 e=E('abc',4);t('jourEtat : date abîmée → comme jamais joué',e.dispo&&e.suiv===1&&e.n===0,e);
 e=E('2026-10-13',-5);t('jourEtat : série négative → bornée à 0',e.n===0&&e.suiv===1,e);
 e=E('2026-10-13',1e12);t('jourEtat : série démesurée → bornée à JOUR.max, jamais plus',e.n===m.JOUR.max&&e.suiv===m.JOUR.max,e);
 e=E('2026-10-13',NaN);t('jourEtat : série NaN → 0',e.n===0,e);
 m.save.d.jour=undefined;e=m.jourEtat('2026-10-14');t('jourEtat : SAVE.d.jour absent → comme jamais joué',e.dispo&&e.suiv===1,e);
 m.save.d.jour={d:'2026-10-13',n:2};e=m.jourEtat('');t('jourEtat : horloge illisible → ok:false, pas de ×2',!e.ok&&!e.dispo,e);
 t('jourPrime : 1 → 0, 2 → 25, 7 → 100, 8 → 100, 400 → 100',m.jourPrime(1)===0&&m.jourPrime(2)===25&&m.jourPrime(7)===100&&m.jourPrime(8)===100&&m.jourPrime(400)===100,[1,2,3,4,5,6,7,8].map(m.jourPrime));}

// ---------- 4. jourMaj : le ×2 est le MAX d'ECOD et du jour, jamais le produit ----------
{let m=monde();
 m.partie({ecod:1.5});t('jourMaj : joueur neuf, 1re partie du jour → k=2 ; ECOD.k = 2 (le MAX, pas 1,5 × 2 = 3)',m.JOUR.k===2&&m.g.ECOD.k===2&&m.JOUR.e===1.5&&m.JOUR.cmp&&m.JOUR.dep==='2026-10-14',[m.JOUR.k,m.g.ECOD.k]);
 m.partie({ecod:1});t('jourMaj : sans relèvement du début (ECOD 1) → ECOD.k = 2',m.g.ECOD.k===2);
 m.partie({ecod:3});t('jourMaj : un ECOD plus fort que le ×2 (3) n\'est jamais écrasé',m.g.ECOD.k===3&&m.JOUR.k===2);
 m.partie({tuto:true});t('jourMaj : l\'AUTO-ÉCOLE compte pour le jour mais SANS ×2 (k=1, ECOD intact)',m.JOUR.k===1&&m.g.ECOD.k===1.5&&m.JOUR.cmp&&m.JOUR.dep!=='');
 m=monde({sandbox:true});m.partie();t('jourMaj : bac à sable → rien (k=1, ne compte pas)',m.JOUR.k===1&&!m.JOUR.cmp&&m.g.ECOD.k===1.5);
 m=monde({park:true});m.partie();t('jourMaj : parc → rien',m.JOUR.k===1&&!m.JOUR.cmp&&m.g.ECOD.k===1.5);
 m=monde({balade:true});m.partie();t('jourMaj : balade → rien',m.JOUR.k===1&&!m.JOUR.cmp&&m.g.ECOD.k===1.5);
 m=monde({search:'?jour=0'});m.partie();t('?jour=0 : ni ×2 ni marque — le jeu d\'avant, ECOD.k intact',!m.JOUR.on&&m.JOUR.k===1&&!m.JOUR.cmp&&m.g.ECOD.k===1.5);
 m=monde({search:'?x=1&jour=0&y=2'});m.partie();t('?jour=0 au milieu de l\'adresse',!m.JOUR.on);
 m=monde({search:'?jour=01'});t('?jour=01 n\'éteint rien (seul ?jour=0 éteint)',m.JOUR.on);
 m=monde({search:'?jour=1'});t('?jour=1 : allumé',m.JOUR.on);
 m=monde({jour:{d:'2026-10-14',n:2}});m.partie();t('jourMaj : déjà pris aujourd\'hui → k=1, ECOD intact, la partie ne marque rien de neuf',m.JOUR.k===1&&m.g.ECOD.k===1.5);
 m=monde();m.H.now=NaN;m.partie();t('jourMaj : horloge illisible → rien, sans exception',m.JOUR.k===1&&!m.JOUR.cmp&&m.g.ECOD.k===1.5);
 m=monde({jour:{d:'2026-10-20',n:3}});m.partie();t('jourMaj : horloge reculée de 6 jours → pas de ×2 (on ne le rejoue pas en reculant la montre)',m.JOUR.k===1&&m.g.ECOD.k===1.5&&m.JOUR.cmp);}

// ---------- 5. jourCommit : la prime de série, une seule fois ----------
{let m=monde({bank:100});
 m.partie();let p=m.jourCommit();t('jourCommit : 1re partie du jour, série 1 → prime 0, jour marqué',p===0&&m.save.d.jour.d==='2026-10-14'&&m.save.d.jour.n===1&&m.save.d.bank===100&&m.JOUR.fin&&m.JOUR.fin.n===1,m.save.d.jour);
 p=m.jourCommit();t('jourCommit : un 2e appel pour la même partie ne verse rien',p===0&&m.save.d.bank===100);
 m.partie();p=m.jourCommit();t('jourCommit : une 2e partie le même jour ne verse rien et ne bouge pas la série',p===0&&m.save.d.jour.n===1&&m.save.d.bank===100&&m.JOUR.k===1);
 m.jour(2026,10,15);m.partie();p=m.jourCommit();t('jourCommit : le lendemain → série 2, prime 25 en banque',p===25&&m.save.d.jour.n===2&&m.save.d.bank===125,[p,m.save.d.jour,m.save.d.bank]);
 const att=[0,25,40,55,70,85,100,100,100];let ok=true,bk=125;
 for(let s=3;s<=9;s++){m.jour(2026,10,13+s);m.partie();const pp=m.jourCommit();bk+=pp;if(pp!==att[s-1]||m.save.d.jour.n!==s||m.save.d.bank!==bk)ok=false;}
 t('jourCommit : série 3 à 9 → 40 · 55 · 70 · 85 · 100 · 100 · 100 (plafonnée au 7e jour, la série, elle, continue)',ok&&m.save.d.jour.n===9,[m.save.d.jour,m.save.d.bank,bk]);
 m.jour(2026,10,25);m.partie();p=m.jourCommit();t('jourCommit : un jour SAUTÉ → la série repart de 1, prime 0',m.save.d.jour.n===1&&p===0);
 m=monde({bank:0});m.partie({t:10});p=m.jourCommit();t('jourCommit : une partie de 10 s ne COMPTE pas (JOUER puis QUITTER ne brûle pas le ×2)',p===0&&m.save.d.jour.d===''&&m.save.d.jour.n===0);
 m.partie({t:14.9});m.jourCommit();t('jourCommit : 14,9 s ne compte pas',m.save.d.jour.d==='');
 m.partie({t:15});m.jourCommit();t('jourCommit : 15 s compte',m.save.d.jour.d==='2026-10-14');
 m=monde({bank:50});m.partie({tuto:true});p=m.jourCommit();t('jourCommit : la leçon d\'auto-école MARQUE le jour 1 (série 1, aucune prime) — la 2e partie du jour 1 ne prend donc pas de ×2',p===0&&m.save.d.jour.n===1&&m.save.d.bank===50);
 m.partie();t('…la 2e partie du jour 1 : k=1',m.JOUR.k===1);
 m.jour(2026,10,15);m.partie();p=m.jourCommit();t('…et le jour 2 : ×2 + série 2 (prime 25)',m.JOUR.k===2&&p===25&&m.save.d.jour.n===2);
 // minuit : la partie part le 14 à 23 h 59 et finit le 15 à 0 h 10 — c'est la date de DÉPART qui compte
 m=monde({bank:0});m.jour(2026,10,14,23,59);m.partie();m.jour(2026,10,15,0,10);m.jourCommit();t('minuit : la partie démarrée le 14 marque le 14',m.save.d.jour.d==='2026-10-14'&&m.save.d.jour.n===1,m.save.d.jour);
 m.partie();t('minuit : la partie suivante (le 15, 0 h 11) reprend un ×2 : un NOUVEAU jour',m.JOUR.k===2);
 m.jourCommit();t('minuit : série 2 le 15',m.save.d.jour.n===2&&m.save.d.bank===25,m.save.d);
 // horloge reculée de plus d\'un jour : pas de ×2, la date est RECALÉE
 m=monde({jour:{d:'2026-10-20',n:5}});m.partie();p=m.jourCommit();t('horloge reculée de 6 jours : pas de prime, la date est recalée sur aujourd\'hui, la série ne bouge pas',p===0&&m.save.d.jour.d==='2026-10-14'&&m.save.d.jour.n===5,m.save.d.jour);
 m.jour(2026,10,15);m.partie();p=m.jourCommit();t('…et le lendemain du recalage tout reprend (×2, série 6, prime 85)',m.JOUR.k===2&&m.save.d.jour.n===6&&p===85,[m.JOUR.k,m.save.d.jour,p]);
 m=monde({jour:{d:'2026-10-15',n:5}});m.partie();p=m.jourCommit();t('un jour de moins (fuseau) : rien ne bouge',p===0&&m.save.d.jour.d==='2026-10-15'&&m.save.d.jour.n===5);
 m=monde({search:'?jour=0',bank:100});m.partie();p=m.jourCommit();t('?jour=0 : jourCommit ne touche ni la banque ni la sauvegarde',p===0&&m.save.d.bank===100&&m.save.d.jour.d===''&&m.save.d.jour.n===0);
 m=monde({bank:1e30});m.partie();m.jour(2026,10,15);m.save.d.jour={d:'2026-10-14',n:6};m.partie();m.jourCommit();t('la banque est plafonnée à 1e30',m.save.d.bank<=1e30);}

// ---------- 6. le fuzz : des milliers de dates au hasard, des parties au hasard ----------
{let graine=12345;const rnd=()=>{graine=(graine*1664525+1013904223)>>>0;return graine/4294967296;};
 const m=monde({bank:0});let planteries=0,serieOK=true,datesOK=true,infini=false,derniereN=0,bankAvant=0,primeOK=true;
 let base=new Date(2026,9,14,12).getTime();
 for(let k=0;k<20000;k++){
   const mode=rnd();let dt;
   if(mode<.55)dt=1;else if(mode<.7)dt=0;else if(mode<.8)dt=2+((rnd()*5)|0);else if(mode<.9)dt=-1;else dt=-((2+rnd()*400)|0);
   base+=dt*864e5+((rnd()*6e6)|0);if(base<new Date(2021,0,1).getTime())base=new Date(2021,0,1).getTime();if(base>new Date(2090,0,1).getTime())base=new Date(2090,0,1).getTime();
   m.H.now=base;
   try{m.partie({t:rnd()<.1?5:60,tuto:rnd()<.03});const av=m.save.d.jour.n,bk=m.save.d.bank,p=m.jourCommit();
     const S=m.save.d.jour;
     if(!(S.n>=0&&S.n<=m.JOUR.max&&S.n===Math.round(S.n)))serieOK=false;
     if(S.n>av+1)serieOK=false;                       // jamais plus d'UN cran par partie
     if(S.d!==''&&m.jourNum(S.d)!==m.jourNum(S.d))datesOK=false;
     if(m.save.d.bank-bk!==p||p<0||p>100)primeOK=false;
     if(S.n>=m.JOUR.max)infini=true;
   }catch(e){planteries++;console.log(e);}}
 t('fuzz (20 000 parties, dates qui avancent, sautent, reculent) : aucune exception',planteries===0);
 t('fuzz : la série reste un entier de 0 à JOUR.max, et monte d\'UN cran par partie au plus',serieOK);
 t('fuzz : la date enregistrée reste toujours lisible',datesOK);
 t('fuzz : la prime vaut toujours entre 0 et 100, et c\'est exactement ce qui entre en banque',primeOK);
 t('fuzz : la série n\'atteint jamais JOUR.max (pas de série infinie)',!infini);}
{ // 400 jours de suite, jamais sauté
 const m=monde({bank:0});let ok=true,somme=0;
 for(let d=0;d<400;d++){m.H.now=new Date(2026,9,14+d,12).getTime();m.partie({tuto:d===0});somme+=m.jourCommit();if(m.save.d.jour.n!==d+1)ok=false;}
 t('400 jours de suite : la série compte 400, rien ne déborde',ok&&m.save.d.jour.n===400);
 // 0 + 25 + 40 + 55 + 70 + 85 + 100 x 394
 t('400 jours de suite : la prime totale = 0+25+40+55+70+85 + 100 × 394',somme===275+100*394,somme);}

// ---------- 7. san() : des sauvegardes abîmées ----------
{const m=monde();const S=(d,now)=>{const f=SAN;return f(d,m.JOUR,m.jourNum,now?class extends Date{static now(){return now;}}:m.FD);};
 const A=S({jour:{d:'2026-10-14',n:3},cad:{t:1700000000000}});t('san : une sauvegarde saine passe telle quelle',A.jour.d==='2026-10-14'&&A.jour.n===3&&A.cad.t===1700000000000,A);
 const B=S({});t('san : une sauvegarde d\'avant (sans jour ni cad) → jamais joué, jamais ouvert',B.jour.d===''&&B.jour.n===0&&B.cad.t===0,B);
 const C=S({jour:{d:'n\'importe quoi',n:7},cad:{t:'abc'}});t('san : date illisible → jour repart de zéro, n remis à 0 ; cad.t illisible → 0',C.jour.d===''&&C.jour.n===0&&C.cad.t===0,C);
 const D=S({jour:{d:'2026-02-31',n:7}});t('san : « 31 février » refusé',D.jour.d==='',D);
 const E=S({jour:{d:'2026-10-14',n:1e15},cad:{t:-5}});t('san : série démesurée bornée, t négatif → 0',E.jour.n===m.JOUR.max&&E.cad.t===0,E);
 const F=S({jour:{d:'2026-10-14',n:'7'},cad:{t:'1700000000000'}});t('san : des nombres écrits en chaîne sont relus',F.jour.n===7&&F.cad.t===1700000000000,F);
 const G=S({cad:{t:9e15}},1700000000000);t('san : un cadeau « dans le futur » est ramené à maintenant (horloge reculée, code importé)',G.cad.t===1700000000000,G);
 const H2=S({jour:null,cad:null});t('san : jour / cad nuls',H2.jour.d===''&&H2.cad.t===0);
 const I=S({jour:[1,2],cad:'x'});t('san : jour / cad de mauvais type',I.jour.d===''&&I.cad.t===0);
 const J=S({jour:{d:'2026-10-14'}});t('san : n absent → 0',J.jour.n===0,J);
 t('SAVE.def() porte jour et cad (sinon ils disparaîtraient)',/jour:\{d:'',n:0\},cad:\{t:0\}/.test(SRC));
 t('san() relit jour et cad (sinon ils disparaîtraient au chargement)',!!lj&&!!lc);}

// ---------- 8. le cadeau ----------
{const H6=216e5;let m=monde();
 let e=m.cadeauEtat();t('cadeauEtat : jamais ouvert → prêt',e.actif&&e.pret&&e.dansMs===0,e);
 m=monde({tuto:0});e=m.cadeauEtat();t('cadeauEtat : avant la fin de l\'auto-école → ni actif ni prêt ni quotidien',!e.actif&&!e.pret&&!e.jour,e);
 m=monde({search:'?cadeau=0'});e=m.cadeauEtat();t('?cadeau=0 : inactif (et le quotidien reste indépendant)',!e.actif&&!e.pret&&e.jour,e);
 m=monde({search:'?jour=0'});e=m.cadeauEtat();t('?jour=0 : le quotidien est faux, le cadeau reste',e.actif&&e.pret&&!e.jour,e);
 m=monde({search:'?jour=0&cadeau=0'});e=m.cadeauEtat();t('les deux interrupteurs : plus rien',!e.actif&&!e.pret&&!e.jour,e);
 m=monde({balade:true});e=m.cadeauEtat();t('balade : rien',!e.actif&&!e.pret&&!e.jour);
 m=monde({best:0});let v=null;m.cadeauOuvre().then(x=>v=x);
 t('cadeauOuvre : prêt → banque +25 (plancher), flush, toast muet, son, t=now',m.save.d.bank===25&&m.flush.n===1&&m.save.d.cad.t===m.H.now&&m.toasts.length===1&&m.toasts[0][1]===true&&m.sons.includes('ui.achat'),[m.save.d,m.flush.n,m.toasts,m.sons]);
 e=m.cadeauEtat();t('…juste après : pas prêt, dans 6 h exactement',!e.pret&&e.dansMs===H6,e);
 const r=m.cadeauOuvre();
 t('cadeauOuvre : un 2e appel immédiat ne donne rien (rend false, n\'écrit pas)',r===false&&m.save.d.bank===25&&m.flush.n===1&&m.toasts.length===1);
 m.H.now+=H6-60000;e=m.cadeauEtat();t('5 h 59 plus tard : pas prêt, dans 1 min',!e.pret&&e.dansMs===60000,e);
 m.H.now+=60000;e=m.cadeauEtat();t('6 h pile : prêt',e.pret&&e.dansMs===0,e);
 m.H.now+=864e5*30;e=m.cadeauEtat();t('un mois plus tard : un SEUL cadeau en attente (il ne s\'accumule pas)',e.pret);
 m.cadeauOuvre();m.cadeauOuvre();t('…on l\'ouvre : un seul cadeau versé malgré deux appels',m.save.d.bank===50,m.save.d.bank);
 // horloge reculée
 m=monde();m.cadeauOuvre();const t0=m.save.d.cad.t;m.H.now-=864e5*3;e=m.cadeauEtat();t('horloge reculée de 3 jours : pas de cadeau à l\'infini — jamais prêt, 6 h pleines',!e.pret&&e.dansMs===H6,e);
 t('…et cadeauEtat n\'a RIEN écrit (pur) : le dernier cadeau est resté dans le futur',m.save.d.cad.t===t0&&m.flush.n===1,[m.save.d.cad,m.flush.n]);
 m.cadeauRecale();t('cadeauRecale : le dernier cadeau « du futur » repart de MAINTENANT',m.save.d.cad.t===m.H.now,m.save.d.cad);
 m.H.now+=H6;e=m.cadeauEtat();t('…et 6 h plus tard le cadeau revient (pas bloqué des jours)',e.pret);
 m=monde();m.cadeauOuvre();m.H.now-=864e5*3;m.partie();t('jourMaj (le départ d\'une partie) range l\'horloge du cadeau',m.save.d.cad.t===m.H.now);
 m=monde({search:'?cadeau=0'});m.save.d.cad.t=m.H.now+864e5;m.cadeauRecale();t('?cadeau=0 : cadeauRecale ne touche à rien',m.save.d.cad.t===m.H.now+864e5);
 m=monde();m.cadeauOuvre();m.H.now-=864e5*3;m.H.now+=864e5*3+H6-1;e=m.cadeauEtat();t('horloge reculée puis remise à l\'heure : jamais prêt avant 6 h réelles',!e.pret&&e.dansMs===1,e);
 m=monde();m.cadeauOuvre();m.H.now-=3e3;e=m.cadeauEtat();t('horloge reculée de 3 s (NTP) : tolérée, le compte repart',!e.pret&&e.dansMs===H6);
 m=monde({cad:{t:NaN}});e=m.cadeauEtat();t('cad.t NaN en mémoire : prêt, sans exception',e.pret);
 m=monde({cad:undefined});m.save.d.cad=undefined;e=m.cadeauEtat();t('SAVE.d.cad absent : pas d\'exception (rien d\'actif)',e&&typeof e.pret==='boolean',e);
 // la valeur
 const val=(best)=>monde({best}).cadeauValeur();
 t('cadeauValeur : meilleur gain 0 → 25 · 100 → 25 · 500 → 40 · 2 631 → 210 · 1e6 → 80 000',val(0)===25&&val(100)===25&&val(500)===40&&val(2631)===210&&val(1e6)===8e4,[0,100,500,2631,1e6].map(val));
 t('cadeauValeur : meilleur gain NaN / undefined / négatif → 25',val(NaN)===25&&val(undefined)===25&&val(-3)===25,[val(NaN),val(undefined),val(-3)]);
 t('cadeauValeur : toujours ≤ 8 % du meilleur gain à partir de 400 $ (le cadeau reste PETIT)',[400,1000,5000,1e5,1e8,1e12].every(b=>val(b)<=Math.round(.0825*b)+0)||false,[400,1000,5000,1e5,1e8,1e12].map(b=>[b,val(b)]));
 m=monde({bank:1e30-3,best:1e9});m.cadeauOuvre();t('cadeauOuvre : la banque reste plafonnée à 1e30',m.save.d.bank<=1e30);
 {const mp=monde({bank:7,jour:{d:'2026-10-13',n:2},cad:{t:new Date(2026,9,14,9,0,0).getTime()}});const av=JSON.stringify(mp.save.d),fl=mp.flush.n,to=mp.toasts.length;
  for(let k=0;k<50;k++){mp.H.now+=1000;mp.cadeauEtat();}
  t('cadeauEtat est PUR : 50 appels (une seconde d\'écart), la sauvegarde est identique, ni flush ni toast ni son',JSON.stringify(mp.save.d)===av&&mp.flush.n===fl&&mp.toasts.length===to&&mp.sons.length===0,[av,JSON.stringify(mp.save.d)]);
  mp.save.d.cad.t=mp.H.now+864e5;const av2=JSON.stringify(mp.save.d);mp.cadeauEtat();t('…y compris avec un dernier cadeau dans le futur (horloge reculée)',JSON.stringify(mp.save.d)===av2);}
 m=monde();t('le contrat est aussi sur window : cadeauEtat · cadeauOuvre · jourTexte (la session INTERFACE les appelle par là)',m.win.cadeauEtat===m.cadeauEtat&&m.win.cadeauOuvre===m.cadeauOuvre&&m.win.jourTexte===m.jourTexte);
 m=monde({tuto:0});t('cadeauOuvre : pas prêt (leçon pas faite) → false, rien écrit',m.cadeauOuvre()===false&&m.save.d.bank===0&&m.flush.n===0&&m.toasts.length===0);
 m=monde({search:'?cadeau=0'});t('?cadeau=0 : cadeauOuvre → false, rien écrit',m.cadeauOuvre()===false&&m.save.d.bank===0&&m.flush.n===0);
 m=monde();m.cadeauOuvre();t('cadeauOuvre : juste après une ouverture → false (rien ne se verse deux fois)',m.cadeauOuvre()===false&&m.save.d.bank===25&&m.flush.n===1);
 m=monde();{const pr=m.cadeauOuvre();t('cadeauOuvre : prêt → une promesse du montant',pr&&typeof pr.then==='function');}
 m=monde();m.H.now=NaN;e=m.cadeauEtat();t('horloge NaN : pas de cadeau (ni prêt ni actif), pas d\'exception',!e.pret&&!e.actif&&m.cadeauOuvre()===false&&m.save.d.bank===0,e);
 m=monde();m.H.now=new Date(1970,0,2).getTime();e=m.cadeauEtat();t('horloge en 1970 : pas de cadeau',!e.pret&&!e.actif&&m.cadeauOuvre()===false);
 m=monde();e=m.cadeauEtat();t('cadeauEtat : la forme du contrat {pret, dansMs, jour} (+ actif, serie, valeur)',['pret','dansMs','jour','actif','serie','valeur'].every(k=>k in e)&&typeof e.dansMs==='number'&&typeof e.pret==='boolean'&&typeof e.jour==='boolean',e);
 // le quotidien dans le contrat
 m=monde({jour:{d:'2026-10-13',n:2}});e=m.cadeauEtat();t('cadeauEtat.jour : ×2 dispo, série vivante 2',e.jour&&e.serie===2,e);
 m=monde({jour:{d:'2026-10-14',n:2}});e=m.cadeauEtat();t('cadeauEtat.jour : ×2 déjà pris → faux',!e.jour&&e.serie===2,e);
 m=monde({jour:{d:'2026-10-14',n:2}});e=m.cadeauEtat();
 // le cadeau et le ×2 ne se marchent pas dessus
 m=monde({bank:0,best:0});m.partie();m.jourCommit();m.cadeauOuvre();t('le cadeau et le ×2 sont indépendants : ouvrir ne marque pas le jour, jouer n\'ouvre pas le cadeau',m.save.d.bank===25&&m.save.d.jour.n===1&&m.save.d.cad.t>0);}

// ---------- 9. jourTexte : la phrase du quotidien ----------
{const L=(o,fn)=>{const m=monde(o);return m.jourTexte();};
 t('jourTexte : ×2 dispo, série < 2 → « ×2 sur ta 1re partie du jour »',L({})==='×2 sur ta 1re partie du jour',L({}));
 t('jourTexte : ×2 dispo, série vivante 3 → « Série 3 jours · ×2 sur ta 1re partie »',L({jour:{d:'2026-10-13',n:3}})==='Série 3 jours · ×2 sur ta 1re partie',L({jour:{d:'2026-10-13',n:3}}));
 t('jourTexte : ×2 pris, série 3 → « Série 3 jours · Prochain ×2 demain »',L({jour:{d:'2026-10-14',n:3}})==='Série 3 jours · Prochain ×2 demain');
 t('jourTexte : ×2 pris, série 1 → « Prochain ×2 demain »',L({jour:{d:'2026-10-14',n:1}})==='Prochain ×2 demain');
 t('jourTexte : série cassée (3 jours sans jouer) → pas de série affichée',L({jour:{d:'2026-10-11',n:6}})==='×2 sur ta 1re partie du jour');
 t('jourTexte : avant la fin de l\'auto-école → rien',L({tuto:0})==='');
 t('jourTexte : ?jour=0 → rien',L({search:'?jour=0'})==='');
 t('jourTexte : horloge illisible → rien',(()=>{const m=monde();m.H.now=NaN;return m.jourTexte();})()==='');
 t('jourTexte : le texte français n\'est jamais en capitales (TR garde ses accents ; la feuille met en capitales)',!/[A-ZÀ-Ý]{4,}/.test(L({jour:{d:'2026-10-13',n:3}})));}

// ---------- 9 bis. la ligne de l'ecran de fin ----------
{const m=monde();m.JOUR.fin=null;t('jourFinTexte : rien a dire → ""',m.jourFinTexte()==='');
 m.JOUR.fin={n:3,p:40,k:2};t('jourFinTexte : x2 + prime → « · ×2 DU JOUR · SÉRIE 3 +$40 »',m.jourFinTexte()===' · ×2 DU JOUR · SÉRIE 3 +$40',m.jourFinTexte());
 m.JOUR.fin={n:1,p:0,k:2};t('jourFinTexte : x2 sans prime (série 1) → « · ×2 DU JOUR »',m.jourFinTexte()===' · ×2 DU JOUR',m.jourFinTexte());
 m.JOUR.fin={n:2,p:25,k:1};t('jourFinTexte : la lecon (pas de x2) mais une prime → « · SÉRIE 2 +$25 »',m.jourFinTexte()===' · SÉRIE 2 +$25',m.jourFinTexte());
 m.JOUR.fin={n:1,p:0,k:1};t('jourFinTexte : ni x2 ni prime → ""',m.jourFinTexte()==='');
 m.partie();m.jourCommit();t('jourFinTexte : après une vraie fin de partie (jourCommit), la ligne vient de JOUR.fin',m.JOUR.fin&&m.JOUR.fin.k===2&&m.jourFinTexte()===' · ×2 DU JOUR',m.JOUR.fin);
 m.partie();t('jourFinTexte : une partie neuve remet JOUR.fin à rien',m.JOUR.fin===null&&m.jourFinTexte()==='');}

// ---------- 10. les crochets de banc ----------
{const m=monde({jour:{d:'2026-10-13',n:2}});let d=m.dbgJour();
 t('dbgJour() : l\'état (date, série, ×2 dispo, partie en cours, ligne, cadeau)',d.auj==='2026-10-14'&&d.dispo===true&&d.serie===2&&d.serieSuivante===3&&d.primeSuivante===40&&typeof d.ligne==='string'&&d.cadeau&&d.cadeau.pret===true,d);
 d=m.dbgJour('demain');t('dbgJour(\'demain\') : le jour d\'après (décalage +1)',d.auj==='2026-10-15'&&d.decalage===1&&d.serie===0&&d.dispo===true,d);
 m.dbgJour('auj');d=m.dbgJour('saute');t('dbgJour(\'saute\') : un jour sauté (+2) → série cassée',d.auj==='2026-10-16'&&d.serie===0&&d.serieSuivante===1,d);
 m.dbgJour('auj');d=m.dbgJour('recule');t('dbgJour(\'recule\') : 2 jours de moins que la veille de la dernière partie = UN jour de moins que sa date → déjà pris, pas de recalage',d.auj==='2026-10-12'&&d.recale===false&&d.dispo===false,d);
 d=m.dbgJour('recule');t('dbgJour(\'recule\') deux fois : l\'horloge recule de 4 jours → recale',d.auj==='2026-10-10'&&d.recale===true&&d.dispo===false,d);
 d=m.dbgJour('raz');m.dbgJour('auj');d=m.dbgJour();t('dbgJour(\'raz\') : jour et série effacés',d.sauvegarde.d===''&&d.dispo,d);
 const c=m.dbgCadeau('pret');t('dbgCadeau(\'pret\') : le force',c.pret===true&&c.dans==='0 h 00',c);
 const a=m.dbgCadeau('attente');t('dbgCadeau(\'attente\') : on vient de l\'ouvrir → dans 6 h 00',a.pret===false&&a.dans==='6 h 00',a);
 const r=m.dbgCadeau('recule');t('dbgCadeau(\'recule\') : dernier cadeau dans le futur → jamais prêt, 6 h pleines, sans plantage',r.pret===false&&r.dans==='6 h 00',r);
 const f=monde({tuto:0});f.dbgCadeau('pret');const ef=f.cadeauEtat();t('dbgCadeau(\'pret\') passe outre l\'auto-école (banc)',ef.actif&&ef.pret,ef);}

// ---------- 11. l'argent : denom() lit toujours ECOD.k — le ×2 passe par le MÊME robinet ----------
{const den=/function denom\(\)\{[^\n]*?\}/.exec(SRC)[0].replace(/\}\s*\/\/.*$/,'}');
 t('denom() lit ECOD.k et rien d\'autre (pas de deuxième chemin d\'argent)',/\*ECOD\.k;\}$/.test(den)&&!/JOUR/.test(den),den);
 const sans=SRC.split('\n').filter(l=>/\bJOUR\b|\bCADO\b/.test(l)&&!/^\s*(\/\*|\*|\/\/)/.test(l)).map(l=>l.trim().slice(0,90));
 const hors=SRC.split('\n').map((l,n)=>[l,n+1]).filter(([l,n])=>(/\bJOUR\.|\bCADO\./.test(l))&&(n<SRC.slice(0,i).split('\n').length||n>SRC.slice(0,j).split('\n').length+1)).map(([l,n])=>n+': '+l.trim().slice(0,100));
 t('JOUR / CADO ne sont lus qu\'à leur place (bloc, san, runxReset, commitExploits…)',hors.length<=3,hors);}

console.log(ko?('\n'+ko+' ÉCHEC(S)'):'\ntout passe');process.exit(ko?1:0);
