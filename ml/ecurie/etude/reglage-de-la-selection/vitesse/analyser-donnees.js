#!/usr/bin/env node
/* ===== VITESSE : OU PART LE TEMPS D'UNE COURSE, D'APRES LES DONNEES REELLES (2026-11-27, etude « vitesse ») =====
   Lit la COPIE figee des journaux de la vraie evolution (donnees/, copiee le 27/11 a 23:16:43, 567 lignes de courses) et ecrit
   resultats-donnees.txt + resultats-donnees.json. Un seul processus, quelques secondes, aucune course jouee.
   Ce que dit une ligne (ml/evolution/courses.js, enfant.js, ml/bot/piloter.js course()) :
     · ms        = le temps reel de la BOUCLE de course seule (Date.now() juste apres J.lancer, jusqu'a la fin de la boucle) :
                   ni le demarrage du processus, ni le chargement du jeu, ni la premiere piste batie (J.lancer), ni mesuresPartie ;
     · survie_s  = la duree de jeu (bilan.duree_s) ;
     · cerveau_ms_moy = le temps moyen d'une decision du pilote (10 decisions par seconde de jeu, ml/bot/doigts.js HUMAIN.decision = 6 images) ;
     · date      = l'heure ou la ligne a ete ecrite (fin de la course, vue du maitre).
   Le cout FIXE (tout ce qui n'est pas dans ms) se deduit d'une fenetre ou les 4 travailleurs sont occupes sans arret :
     4 x duree de la fenetre = somme des (fixe + ms) des courses finies + ce que les 4 courses en cours a la fin ont deja fait.
   Commande : node analyser-donnees.js [dossier des donnees, defaut ./donnees] */
'use strict';
const fs=require('fs'),path=require('path');
const D=process.argv[2]||path.join(__dirname,'donnees');
const L=fs.readFileSync(path.join(D,'courses-2026-48.jsonl'),'utf8').split('\n').filter(Boolean).map(JSON.parse);
const G=fs.readFileSync(path.join(D,'generations.jsonl'),'utf8').split('\n').filter(Boolean).map(JSON.parse);
const LOG=fs.readFileSync(path.join(D,'sortie.log'),'utf8').split('\n');
const out=[];const dire=t=>{out.push(t);};
const R={};
const somme=a=>a.reduce((s,x)=>s+x,0),moy=a=>a.length?somme(a)/a.length:NaN;
const r1=x=>Math.round(x*10)/10,r2=x=>Math.round(x*100)/100,r3=x=>Math.round(x*1000)/1000;
function quantile(a,q){const b=a.slice().sort((x,y)=>x-y);const i=(b.length-1)*q,k=Math.floor(i);return b[k]+(b[Math.min(k+1,b.length-1)]-b[k])*(i-k);}
/* moindres carres y = a + b x, et le R2 */
function droite(x,y){const n=x.length,mx=moy(x),my=moy(y);let sxy=0,sxx=0,syy=0;for(let i=0;i<n;i++){sxy+=(x[i]-mx)*(y[i]-my);sxx+=(x[i]-mx)**2;syy+=(y[i]-my)**2;}
  const b=sxy/sxx,a=my-b*mx;return {a,b,r2:sxy*sxy/(sxx*syy),n};}

/* ---------- 0. le controle du script sur un cas connu : une droite exacte doit revenir exacte ---------- */
{const x=[1,2,3,10],y=x.map(v=>5+2*v);const d=droite(x,y);if(Math.abs(d.a-5)>1e-9||Math.abs(d.b-2)>1e-9)throw new Error('droite() fausse');}

const M=L.filter(l=>l.mesuree);
dire('DONNEES : '+L.length+' lignes ('+M.length+' mesurees), de '+L[0].date+' a '+L[L.length-1].date+' (heure UTC ; le journal sortie.log est a l\'heure de Paris, UTC+1)');
const parUsage={};for(const l of L){const k=l.usage+' gen '+l.generation;parUsage[k]=(parUsage[k]||0)+1;}
dire('  par usage : '+JSON.stringify(parUsage));
R.lignes=L.length;R.parUsage=parUsage;

/* ---------- 1. le temps de la boucle en fonction de la duree de jeu ---------- */
dire('\n1. LE TEMPS DE LA BOUCLE (ms) EN FONCTION DE LA DUREE DE JEU (survie_s), toutes les courses mesurees, 4 a la fois sur le Xeon');
const X=M.map(l=>l.survie_s),Y=M.map(l=>l.ms/1000);
const d1=droite(X,Y);
dire('  boucle_s = '+r3(d1.a)+' + '+r3(d1.b)+' x survie_s   (R2 '+r3(d1.r2)+', n '+d1.n+')');
dire('  soit '+r2(1/d1.b)+' secondes de jeu par seconde de calcul (pente), en moyenne '+r2(somme(X)/somme(Y))+' (total jeu / total boucle)');
const fois=M.map(l=>l.survie_s/(l.ms/1000));
dire('  fois le temps reel, course par course : mediane '+r2(quantile(fois,.5))+', 10 % '+r2(quantile(fois,.1))+', 90 % '+r2(quantile(fois,.9)));
R.boucle={a_s:r3(d1.a),b_s_par_s:r3(d1.b),r2:r3(d1.r2),n:d1.n,foisTempsReelMoyen:r2(somme(X)/somme(Y))};
/* par tranche de duree */
const tranches=[[0,15],[15,30],[30,60],[60,120],[120,240],[240,900.1]];
dire('  tranche de survie | courses | survie moy. s | boucle moy. s | x temps reel');
R.tranches=[];
for(const [a,b] of tranches){const T=M.filter(l=>l.survie_s>=a&&l.survie_s<b);if(!T.length)continue;
  const s=moy(T.map(l=>l.survie_s)),m=moy(T.map(l=>l.ms/1000));
  dire('  '+String(a).padStart(3)+'-'+String(Math.round(b)).padEnd(4)+' s        | '+String(T.length).padStart(7)+' | '+String(r1(s)).padStart(12)+' | '+String(r1(m)).padStart(13)+' | '+r2(s/m));
  R.tranches.push({de:a,a:b,n:T.length,survie:r1(s),boucle:r1(m)});}

/* ---------- 2. le cout fixe, par les fenetres ou les 4 travailleurs sont pleins ---------- */
dire('\n2. LE COUT FIXE (hors boucle : processus neuf, chargement du jeu, premiere piste, mesures), d\'apres les fenetres pleines');
/* les debuts de lancement d'apres sortie.log (heure de Paris) ; les lignes de courses sont en UTC */
function hParis(hms,jourUTC){const [h,m,s]=hms.split(':').map(Number);return Date.parse(jourUTC+'T00:00:00Z')+((h-1)*3600+m*60+s)*1000;}
const FEN=[];
/* fenetre A : la generation 1, du « generation 1 : 312 courses » (21:04:25) a la derniere ligne copiee ; aucune fin de generation dedans */
{const i=LOG.findIndex(l=>/generation 1 : \d+ courses/.test(l));const t0=hParis(LOG[i].slice(0,8),'2026-11-27');
  const C=L.filter(l=>l.generation===1&&l.usage==='entrainement');const t1=Date.parse(C[C.length-1].date);FEN.push({nom:'generation 1 (en cours, aucune fin de generation dedans)',t0,t1,C,enCours:4});}
/* fenetre B : la generation 0 reprise a 19:43:10 jusqu'au debut du coffre (20:51:50) : 218 courses jouees, la fin de generation (les dernieres courses seules) DEDANS */
{const i=LOG.findIndex(l=>/generation 0 : \d+ courses/.test(l));const t0=hParis(LOG[i].slice(0,8),'2026-11-27');
  const j=LOG.findIndex(l=>/^.{8} coffre \(epoque\)/.test(l));const t1=hParis(LOG[j].slice(0,8),'2026-11-27');
  const C=L.filter(l=>l.usage==='entrainement'&&l.generation===0&&Date.parse(l.date)>t0&&Date.parse(l.date)<=t1+2000);FEN.push({nom:'generation 0 apres la reprise (fin de generation dedans)',t0,t1,C,enCours:0});}
/* fenetre C : le coffre (40 courses du temoin), fin de lot dedans */
{const j=LOG.findIndex(l=>/^.{8} coffre \(epoque\)/.test(l));const t0=hParis(LOG[j].slice(0,8),'2026-11-27');
  const k=LOG.findIndex(l=>/^.{8} coffre : champion/.test(l));const t1=hParis(LOG[k].slice(0,8),'2026-11-27');
  const C=L.filter(l=>l.usage==='coffre');FEN.push({nom:'coffre (fin de lot dedans)',t0,t1,C,enCours:0});}
R.fenetres=[];
for(const F of FEN){
  const dt=(F.t1-F.t0)/1000,n=F.C.length,sms=somme(F.C.map(l=>l.ms))/1000;
  /* sans course en cours a la fin : 4 dt = n (f + m) + inoccupe ; avec 4 en cours : 4 dt = n (f + m) + partiel, partiel entre 0 et 4 courses (milieu : 2) */
  const tot=4*dt;
  const fMil=(tot-sms-(F.enCours?2*(sms/n):0))/(n+(F.enCours?2:0));
  const fHaut=(tot-sms)/n;  /* borne haute : rien en cours, aucun temps inoccupe */
  const fBas=F.enCours?(tot-sms-4*(sms/n))/(n+4):null;
  dire('  '+F.nom+' : '+n+' courses finies en '+r1(dt)+' s ; somme des boucles '+r1(sms)+' s ; 4 x duree = '+r1(tot)+' s');
  dire('     temps par course et par travailleur (fixe + boucle) : '+r1(tot/n)+' s au plus ; boucle moyenne '+r1(sms/n)+' s');
  dire('     cout fixe par course : '+(F.enCours?'entre '+r1(fBas)+' et '+r1(fHaut)+' s, milieu '+r1(fMil):'au plus '+r1(fHaut)+' s (le temps inoccupe de la fin de lot y est compte)'));
  R.fenetres.push({nom:F.nom,n,duree_s:r1(dt),sommeBoucles_s:r1(sms),parCourse_s:r1(tot/n),boucleMoy_s:r1(sms/n),fixeHaut_s:r1(fHaut),fixeBas_s:fBas==null?null:r1(fBas),fixeMilieu_s:r1(fMil)});
}
const FA=R.fenetres[0];
dire('  -> retenu pour la suite (fenetre A, la plus propre) : fixe ~ '+FA.fixeMilieu_s+' s par course (mesure indirecte ; la mesure directe : chronometrer.js)');

/* ---------- 3. la part du cerveau ---------- */
dire('\n3. LA PART DU CERVEAU DU PILOTE (cerveau_ms_moy x 10 decisions par seconde de jeu), dans la boucle');
const cerv=M.map(l=>l.cerveau_ms_moy*10*l.survie_s/1000);
dire('  cerveau : '+r1(somme(cerv))+' s sur '+r1(somme(Y))+' s de boucles = '+r1(100*somme(cerv)/somme(Y))+' % ; une decision : mediane '+r3(quantile(M.map(l=>l.cerveau_ms_moy),.5))+' ms');
R.cerveau={part:r3(somme(cerv)/somme(Y)),decisionMediane_ms:r3(quantile(M.map(l=>l.cerveau_ms_moy),.5))};
dire('  (les yeux ne sont pas dans la ligne de courses-*.jsonl : bilan.yeux n\'est pas recopie ; voir chronometrer.js et analyser-profil.js)');

/* ---------- 4. ce que coutent les courses courtes ---------- */
dire('\n4. LES COURSES COURTES : le cout fixe y pese');
const f=FA.fixeMilieu_s;
const tot4=M.map(l=>f+l.ms/1000);
const court=M.filter(l=>l.survie_s<15),c30=M.filter(l=>l.survie_s<30);
dire('  survie < 15 s : '+court.length+' courses sur '+M.length+' ('+r1(100*court.length/M.length)+' %) ; < 30 s : '+c30.length+' ('+r1(100*c30.length/M.length)+' %)');
dire('  part du temps total passee en cout fixe (toutes les courses) : '+r1(100*f*M.length/somme(tot4))+' %');
/* la droite a une ordonnee negative (les courses longues vont moins vite : maps plus lourdes) : pour les courtes, on prend la moyenne mesuree de leur tranche */
for(const T of R.tranches.slice(0,3))dire('  une course de '+T.de+' a '+T.a+' s de jeu ('+T.n+' courses) : boucle '+T.boucle+' s + fixe '+f+' s = '+r1(T.boucle+f)+' s de travailleur, dont '+r1(100*f/(T.boucle+f))+' % de fixe');
{const T=R.tranches[R.tranches.length-2];dire('  a comparer : '+T.de+' a '+T.a+' s de jeu : '+r1(T.boucle+f)+' s, dont '+r1(100*f/(T.boucle+f))+' % de fixe');}
{const C=M.filter(l=>l.survie_s<30);dire('  les courses de moins de 30 s prennent '+r1(100*somme(C.map(l=>f+l.ms/1000))/somme(tot4))+' % du temps des travailleurs, dont '+r1(100*f*C.length/somme(tot4))+' points de fixe');}
R.courtes={moins15:court.length,moins30:c30.length,n:M.length,partFixe:r3(f*M.length/somme(tot4))};
/* la duree d'une generation pleine de 312 courses, au rythme de la fenetre A */
dire('  au rythme de la fenetre A : une course occupe un travailleur '+FA.parCourse_s+' s ; 312 courses a 4 a la fois = '+r1(312*FA.parCourse_s/4/60)+' min');
R.generation312_min=r1(312*FA.parCourse_s/4/60);

/* ---------- 5. les courses jouees pour rien ---------- */
dire('\n5. LES COURSES JOUEES POUR RIEN');
/* (a) deux pilotes differents, la meme graine, la meme course au bit pres (memes trois empreintes) */
const groupes=new Map();
for(const l of M){const k=l.graine+'|'+l.tmax+'|'+l.epoque+'|'+l.empreinte+'|'+l.empreinteVues+'|'+l.empreinteTouches;if(!groupes.has(k))groupes.set(k,[]);groupes.get(k).push(l);}
let enTrop=0;const tailles={};
for(const [k,g] of groupes){const p=new Set(g.map(l=>l.pilote));if(p.size>1){enTrop+=g.length-1;tailles[g.length]=(tailles[g.length]||0)+1;}}
dire('  (a) courses identiques au bit pres a celle d\'un AUTRE pilote sur la meme graine : '+enTrop+' sur '+M.length+' ('+r1(100*enTrop/M.length)+' %) ; groupes par taille '+JSON.stringify(tailles));
{const dup=[];for(const g of groupes.values()){if(new Set(g.map(l=>l.pilote)).size>1)dup.push(...g.slice(1));}
  const s=dup.map(l=>l.survie_s);
  dire('      ces courses en double : survie mediane '+r1(quantile(s,.5))+' s, '+s.filter(x=>x<60).length+' sur '+s.length+' sous 60 s ; temps de boucle '+r1(somme(dup.map(l=>l.ms))/1000)+' s sur '+r1(somme(M.map(l=>l.ms))/1000)+' ('+r1(100*somme(dup.map(l=>l.ms))/somme(M.map(l=>l.ms)))+' %)');
  R.doubles={survieMediane:r1(quantile(s,.5)),sous60:s.filter(x=>x<60).length,n:s.length,partBoucle:0};R.doubles.partBoucle=r3(somme(dup.map(l=>l.ms))/somme(M.map(l=>l.ms)));}
/* controle de coherence : la meme empreinte de course avec des touches differentes serait un bug d'analyse */
let inco=0;{const parE=new Map();for(const l of M){const k=l.graine+'|'+l.empreinte;if(!parE.has(k))parE.set(k,new Set());parE.get(k).add(l.empreinteTouches);}for(const s of parE.values())if(s.size>1)inco++;}
dire('      controle : graines ou la meme empreinte de course va avec des touches differentes : '+inco);
/* (b) les pilotes « clones de conduite » : toutes leurs courses identiques a celles d'un meme autre pilote */
const parPilote=new Map();for(const l of M){if(!parPilote.has(l.id))parPilote.set(l.id,[]);parPilote.get(l.id).push(l);}
const signe=l=>l.empreinte+'|'+l.empreinteVues+'|'+l.empreinteTouches;
const clones=[];
const ids=[...parPilote.keys()];
for(const a of ids)for(const b of ids){if(a>=b)continue;const A=parPilote.get(a),B=new Map(parPilote.get(b).map(l=>[l.graine,l]));
  let communes=0,pareilles=0;for(const l of A){const m=B.get(l.graine);if(!m)continue;communes++;if(signe(m)===signe(l))pareilles++;}
  if(communes>=6&&pareilles===communes)clones.push({a,b,communes});}
dire('  (b) paires de pilotes qui conduisent pareil sur TOUTES leurs graines communes (6 au moins) : '+clones.length);
const nais=new Map();for(const g of G)for(const n of g.naissances||[])nais.set(n.id,n);
for(const c of clones){const na=nais.get(c.a),nb=nais.get(c.b);
  dire('      '+c.a+' ('+(na?na.origine+', mutes '+JSON.stringify(na.mutes):'?')+') = '+c.b+' ('+(nb?nb.origine+', mutes '+JSON.stringify(nb.mutes):'?')+') sur '+c.communes+' graines');}
/* (c) une meme (pilote, graine) jouee deux fois : le cache devrait l'empecher */
const cles=new Map();for(const l of L)cles.set(l.cle,(cles.get(l.cle)||0)+1);
dire('  (c) une meme cle (pilote, graine, tmax, epoque) ecrite deux fois : '+[...cles.values()].filter(v=>v>1).length);
/* les naissances de la generation 1 : combien d'enfants identiques a leur parent, dans les courses deja la */
dire('  (d) les 6 naissances de la generation 1, comparees a leurs parents sur les graines de la generation 1 deja jouees :');
const g1=G.find(g=>g.generation===0);
R.pourRien={identiques:enTrop,n:M.length,clones:clones.length,doublonsCle:[...cles.values()].filter(v=>v>1).length,naissances1:[]};
const lg1=M.filter(l=>l.generation===1);
const naiss1=(()=>{const m=LOG.find(l=>/generation 1 : 6 naissance/.test(l));if(!m)return [];return [...m.matchAll(/([0-9a-f]{12}) (immigre|mutation|croisement)/g)].map(x=>({id:x[1],origine:x[2]}));})();
const popTxt=fs.readFileSync(path.join(D,'population.json'),'utf8');let pop=null;try{pop=JSON.parse(popTxt);}catch(e){}
const vivants=pop&&pop.vivants?pop.vivants:[];
for(const n of naiss1){const v=vivants.find(x=>x.id===n.id);const parents=v&&v.parents?v.parents:[];
  const mes=lg1.filter(l=>l.id===n.id);let same=[];
  for(const p of parents){const P=new Map(lg1.filter(l=>l.id===p).map(l=>[l.graine,l]));let c=0,s=0;for(const l of mes){const q=P.get(l.graine);if(!q)continue;c++;if(signe(q)===signe(l))s++;}same.push(p+' '+s+'/'+c);}
  dire('      '+n.id+' ('+n.origine+(v&&v.mutes?', mutes '+JSON.stringify(v.mutes):'')+') : '+mes.length+' courses ; identiques au parent : '+(same.join(', ')||'parents inconnus'));
  R.pourRien.naissances1.push({id:n.id,origine:n.origine,courses:mes.length,parents:same});}

fs.writeFileSync(path.join(__dirname,'resultats-donnees.txt'),out.join('\n')+'\n');
fs.writeFileSync(path.join(__dirname,'resultats-donnees.json'),JSON.stringify(R,null,1)+'\n');
process.stdout.write(out.join('\n')+'\n');
