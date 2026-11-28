#!/usr/bin/env node
/* ===== LES COMPTEURS ET LA MAP IMPOSEE, COTE COURSES : LES TESTS SANS COURSE (28/11/2026, lot « genes v4 », notes/genes-v4.md § 8.2) =====
   usage : node ml/evolution/tests/carte-et-declic.test.js     (quelques secondes ; aucune course, aucun jeu ouvert)
   Un faux cerveau (l'enveloppe des « declic »), un faux r de piloter.course (resultatCompact), un faux enfant (un petit script ecrit dans
   %TEMP%\cashcar-carte-declic-<pid>, donne a courses.creer par o.enfant) qui rend un resultat fabrique : la cle, l'envoi de la carte, la ligne,
   la carte non appliquee, les refus. Rien n'est ecrit dans ml/evolution/etat/ : le dossier de la selection n'est ouvert qu'en ecrire:false,
   cache:false, et la seule tache qui y va est refusee avant tout lancement.
   Code 0 si tout passe. */
'use strict';
const fs=require('fs'),path=require('path'),os=require('os'),{spawnSync}=require('child_process');
const C=require('../commun'),K=require('../courses'),E=require('../enfant');

const resultats=[];
function ok(nom,passe,detail){resultats.push({nom,passe});process.stdout.write((passe?'PASSE  ':'ECHOUE ')+nom+(detail?' : '+detail:'')+'\n');}
const J_=x=>JSON.stringify(x);

/* ---------- 1. l'enveloppe des « declic » sur un faux cerveau ---------- */
{
  const ordres=[{volant:.5},{volant:0,declic:['sortieOn','sortieOn.vol']},null,{nitro:true,declic:['sortieOn','sortieOn']},{declic:'pas un tableau'},{declic:[3,'__proto__','rienOn']}];
  let i=0;
  const faux={texte:null,pannes:0,erreurs:0,decide(vue){this.texte='vue '+vue.t;const o=ordres[i++];return o&&typeof o==='object'?Object.assign({},o):o;}};
  const compte=E.envelopper(faux);
  const rendus=[];
  for(let k=0;k<ordres.length;k++)rendus.push(faux.decide({t:k}));
  const d=E.declenchementsDe(compte);
  ok('e1 : les comptes',J_(d)==='{"__proto__":1,"rienOn":1,"sortieOn":2,"sortieOn.vol":1}'&&Object.keys(d).join(',')==='__proto__,rienOn,sortieOn,sortieOn.vol'&&Object.getPrototypeOf(d)===Object.prototype,J_(d));
  ok('e2 : « declic » retire de chaque ordre rendu',rendus.every(r=>r==null||!Object.prototype.hasOwnProperty.call(r,'declic'))&&J_(rendus)===J_([{volant:.5},{volant:0},null,{nitro:true},{},{}]),J_(rendus));
  ok('e3 : this est le cerveau (texte ecrit par l\'original)',faux.texte==='vue 5');
  /* sans aucun declic : l'ordre rendu est l'objet meme de l'original, intact */
  const o0={volant:.25,manche:-1};const f2={decide(){return o0;}};const c2=E.envelopper(f2);const r2=f2.decide({});
  ok('e4 : sans declic, le meme objet, rien de compte',r2===o0&&J_(r2)==='{"volant":0.25,"manche":-1}'&&J_(E.declenchementsDe(c2))==='{}');
  ok('e5 : sans compte, declenchements null (les lignes d\'avant)',E.declenchementsDe(null)===null&&E.declenchementsDe(undefined)===null);
}

/* ---------- 2. resultatCompact sur un faux r ---------- */
{
  const J={version:'cashcar-v0',sha:'abc',simulateur:'sim'},Cv={nom:'faux'};
  const bilan={palier:3,pieces:100,duree_s:40,cause:'vide',morts_en_vol:1,vols:2,pannes:0,erreurs:0,derniereErreur:null,cerveau_ms_moy:1,yeuxTirages:0,
    empreinte:'e',empreinteVues:'v',ms:10,cartes:['grotte','jade'],chance:{voulue:true,ok:5,image:9,prise:true,reprise:20}};
  const partie={ev:[[1,'decol',0,10],[5,'mort','paroi'],[5,'seconde_chance'],[9,'decol',0,30],[20,'mort','vide']]};
  const r=E.resultatCompact({bilan,partie,touches:[]},J,Cv,7,{b:1,a:2});
  const ancien=['graine','palier','pieces','survie_s','cause','morts','vols','pannes','erreurs','derniereErreur','cerveau_ms_moy','yeuxTirages','mesures',
    'jeu','jeu_sha','simulateur','node','empreinte','empreinteVues','empreinteTouches','nom','ms'];
  ok('r1 : les champs d\'avant, dans leur ordre, puis les neufs',Object.keys(r).join(',')===ancien.concat(['declenchements','cartes','causesMorts','chancePrise']).join(','),Object.keys(r).join(','));
  ok('r2 : declenchements tries',J_(r.declenchements)==='{"a":2,"b":1}',J_(r.declenchements));
  ok('r3 : cartes, et causesMorts = les deux morts (seconde chance comprise)',J_(r.cartes)==='["grotte","jade"]'&&J_(r.causesMorts)==='["paroi","vide"]'&&r.cartes!==bilan.cartes,J_(r.causesMorts));
  ok('r4 : chancePrise',r.chancePrise===true);
  const b2=Object.assign({},bilan);delete b2.chance;delete b2.cartes;
  const r2=E.resultatCompact({bilan:b2,partie:{ev:[[1,'decol']]},touches:[]},J,Cv,7,{});
  ok('r5 : sans mort [], sans bilan.chance null, sans cartes null, sans rien {}',J_(r2.causesMorts)==='[]'&&r2.chancePrise===null&&r2.cartes===null&&J_(r2.declenchements)==='{}');
  const b3=Object.assign({},bilan,{chance:{prise:false}});
  ok('r6 : chance non prise = false',E.resultatCompact({bilan:b3,partie,touches:[]},J,Cv,7,{}).chancePrise===false);
}

/* ---------- 3. optionsCourse ---------- */
ok('o1 : sans carte, {tmax} seul (pas de cle carte)',J_(E.optionsCourse({tmax:45}))==='{"tmax":45}'&&J_(E.optionsCourse({tmax:45,carte:''}))==='{"tmax":45}'&&J_(E.optionsCourse({tmax:45,carte:null}))==='{"tmax":45}'&&!('carte' in E.optionsCourse({tmax:45,carte:null})));
ok('o2 : avec carte, {tmax, carte}',J_(E.optionsCourse({tmax:45,carte:'grotte'}))==='{"tmax":45,"carte":"grotte"}'&&J_(E.optionsCourse({tmax:45,carte:'grotte',carteTenue:true}))==='{"tmax":45,"carte":"grotte"}');

/* ---------- 4. la ligne de commande de l'essai ---------- */
{
  const a=E.lireEssai(['p.js','4000000','--carte','grotte']),b=E.lireEssai(['p.js','4000000','20','--carte','grotte','--tenue']),c=E.lireEssai(['p.js','4000000']);
  ok('l1 : --essai p.js 4000000 --carte grotte : tmax 45 (pas NaN), carte grotte',a.tmax===45&&a.carte==='grotte'&&a.graine===4000000&&a.carteTenue===false,J_(a));
  ok('l2 : tmax lu avant --carte ; --tenue',b.tmax===20&&b.carte==='grotte'&&b.carteTenue===true&&c.tmax===45&&c.carte===null,J_(b));
  ok('l3 : --carte sans valeur, ou suivie d\'une option, ou --tenue sans carte : refuse',!!E.lireEssai(['p.js','1','--carte']).erreur&&!!E.lireEssai(['p.js','1','--carte','--tenue']).erreur&&!!E.lireEssai(['p.js','1','--carte','']).erreur&&!!E.lireEssai(['p.js','1','--tenue']).erreur);
  /* le vrai processus : il refuse AVANT d'ouvrir le jeu (code 1, l'usage sur stderr, rien sur stdout) */
  const p=spawnSync(process.execPath,[path.join(C.DOSSIER,'enfant.js'),'--essai','p.js','4000000','--carte'],{encoding:'utf8',timeout:30000});
  ok('l4 : node enfant.js --essai p.js 4000000 --carte : usage, code 1',p.status===1&&/usage/.test(p.stderr)&&p.stdout==='',`code ${p.status}, stderr « ${String(p.stderr).trim().slice(0,90)} »`);
}

/* ---------- 5. la cle ---------- */
const EP={courses:'c0ffee000001',note:'n',composants:{jeu_sha:'jeu000000001',version:'cashcar-v0',simulateur:'sim-faux',node:process.version,fichiers_sha:'fich00000001'}};
{
  const t={shaPilote:'a'.repeat(40),graine:910000,tmax:900};
  const main=t.shaPilote+'|'+t.graine+'|'+t.tmax+'|'+EP.composants.jeu_sha+'|'+EP.composants.simulateur+'|'+EP.composants.node+'|'+EP.courses;
  const kg=K.cle(Object.assign({},t,{carte:'grotte'}),EP),kt=K.cle(Object.assign({},t,{carte:'grotte',carteTenue:true}),EP);
  ok('k1 : sans carte, la cle d\'avant au caractere pres (absente, null, \'\', carteTenue sans carte)',K.cle(t,EP)===main&&K.cle(Object.assign({},t,{carte:null}),EP)===main&&K.cle(Object.assign({},t,{carte:''}),EP)===main&&K.cle(Object.assign({},t,{carteTenue:true}),EP)===main);
  ok('k2 : avec carte, le suffixe |carte:grotte ; tenue : |carte:grotte|tenue ; trois cles differentes',kg===main+'|carte:grotte'&&kt===main+'|carte:grotte|tenue'&&new Set([main,kg,kt]).size===3,kt.slice(-40));
}

/* ---------- 6. l'ordonnanceur avec un faux enfant ---------- */
const TMP=path.join(os.tmpdir(),'cashcar-carte-declic-'+process.pid);
fs.rmSync(TMP,{recursive:true,force:true});fs.mkdirSync(TMP,{recursive:true});
const FAUX=path.join(TMP,'enfant-faux.js');
/* le faux enfant : la « source » du pilote dit quelles cartes rendre ; « echo » rend la carte recue (et deux fois si elle est tenue) */
fs.writeFileSync(FAUX,`'use strict';
process.on('message',function(m){
  const q=JSON.parse(m.source);
  const cartes=q.cartes==='echo'?(m.carte?(m.carteTenue===true?[m.carte,m.carte]:[m.carte,'jade']):['nuages']):q.cartes;
  const res={graine:m.graine,palier:2,pieces:40,survie_s:10,cause:'vide',morts:1,vols:1,pannes:0,erreurs:0,derniereErreur:null,cerveau_ms_moy:1,yeuxTirages:0,mesures:null,
    jeu:${J_(EP.composants.version)},jeu_sha:${J_(EP.composants.jeu_sha)},simulateur:${J_(EP.composants.simulateur)},node:process.version,
    empreinte:'e',empreinteVues:'v',empreinteTouches:'t',nom:'faux',ms:1,declenchements:{},cartes:cartes,causesMorts:['vide'],chancePrise:false,
    fichiers_sha:${J_(EP.composants.fichiers_sha)}};
  process.send(res,function(){process.exit(0);});
});
process.on('disconnect',function(){process.exit(3);});
`);
function tache(q,graine,extra){const source=JSON.stringify(q);return Object.assign({source,fichier:'faux.js',shaPilote:C.sha1(source),id:'test',graine,tmax:45,usage:'essai',generation:null},extra||{});}
const cfg=C.lireConfig();

(async function(){
  try{
    const d=path.join(TMP,'etat');fs.mkdirSync(d,{recursive:true});
    ok('c0 : CHAMPS porte les champs neufs, a la fin',['declenchements','cartes','causesMorts','chancePrise'].every(c=>K.CHAMPS.indexOf(c)>=0)&&K.CHAMPS.slice(-4).join(',')==='declenchements,cartes,causesMorts,chancePrise');
    let lances=0;
    const journal=t=>{if(/^course : lancee/.test(t))lances++;};
    const o1=K.creer({cfg,epoque:EP,dossierEtat:d,travailleurs:2,enfant:FAUX,journal});
    /* les refus : des promesses rejetees, avant tout lancement */
    const rej=async (p)=>{try{await p;return null;}catch(e){return String(e&&e.message||e);}};
    const m1=await rej(o1.demander([tache({cartes:'echo'},1,{carte:'lune'})]));
    ok('c1 : carte inconnue refusee, avec son message',/^courses : carte inconnue « lune » \(cartesTirage : nuages, ville, jade, espace, grotte, canyon\)$/.test(String(m1))&&lances===0,m1);
    const m2=await rej(o1.demander([tache({cartes:'echo'},1,{carteTenue:true})]));
    ok('c2 : carteTenue sans carte refusee',/carteTenue sans carte/.test(String(m2))&&lances===0,m2);
    const oSel=K.creer({cfg,epoque:EP,dossierEtat:C.chemin(cfg,cfg.dossierEtat),ecrire:false,cache:false,travailleurs:1,enfant:FAUX});
    const m3=await rej(oSel.demander([tache({cartes:'echo'},1,{carte:'grotte'})]));
    ok('c3 : une carte dans l\'etat de la selection refusee',m3==='courses : une course a carte imposee ne va pas dans l etat de la selection',m3);
    /* sans carte, la selection n'est pas genee (ecrire:false : rien n'est ecrit dans etat/) */
    const Ls=await oSel.demander([tache({cartes:'echo'},2)]);
    ok('c4 : sans carte, la selection joue comme avant',Ls[0]&&Ls[0].mesuree===true&&Ls[0].carte===null,J_(Ls[0]&&{mesuree:Ls[0].mesuree,carte:Ls[0].carte}));

    /* les lignes */
    const tSans=tache({cartes:'echo'},10),tAvec=tache({cartes:'echo'},10,{carte:'grotte'}),tVide=tache({cartes:'echo'},11,{carte:''}),
      tAutre=tache({cartes:['nuages','jade']},12,{carte:'grotte'}),tTenue=tache({cartes:'echo'},13,{carte:'grotte',carteTenue:true}),
      tTenueKo=tache({cartes:['grotte','jade']},14,{carte:'grotte',carteTenue:true});
    lances=0;
    const L=await o1.demander([tSans,tAvec,tVide,tAutre,tTenue,tTenueKo]);
    const [lS,lA,lV,lO,lT,lTk]=L;
    const avant=['cle','pilote','id','usage','generation','epoque','essai','mesuree','raison','date','graine','tmax','palier','pieces','survie_s','cause','morts','vols',
      'pannes','erreurs','derniereErreur','cerveau_ms_moy','yeuxTirages','mesures','jeu','jeu_sha','simulateur','node','fichiers_sha','empreinte','empreinteVues',
      'empreinteTouches','ms'];
    const attendu=avant.concat(['declenchements','cartes','causesMorts','chancePrise','carte','pannesEssais']);
    ok('c5 : ligne sans carte : les champs d\'avant dans leur ordre, les neufs a la fin, carte null, cle d\'avant',Object.keys(lS).join(',')===attendu.join(',')&&lS.carte===null&&lS.mesuree===true&&lS.cle===K.cle({shaPilote:tSans.shaPilote,graine:10,tmax:45},EP)&&!('carteTenue' in lS),Object.keys(lS).slice(-7).join(','));
    ok('c6 : carte \'\' = sans carte (meme cle, carte null, rien envoye)',lV.carte===null&&lV.cle===K.cle({shaPilote:tVide.shaPilote,graine:11,tmax:45},EP)&&J_(lV.cartes)==='["nuages"]');
    ok('c7 : ligne a carte : carte depuis la tache, la carte envoyee a l\'enfant, mesuree, cle a suffixe, une autre cle que sans carte',lA.carte==='grotte'&&J_(lA.cartes)==='["grotte","jade"]'&&lA.mesuree===true&&lA.cle.endsWith('|carte:grotte')&&lA.cle!==lS.cle);
    ok('c8 : carte non appliquee : non mesuree, avec sa raison, sans relance',lO.mesuree===false&&lO.raison==='carte imposee non appliquee (jouee sur nuages)'&&lO.essai===1&&!lO.env,J_({raison:lO.raison,essai:lO.essai}));
    ok('c9 : carte tenue : envoyee (cartes toutes grotte), mesuree, carteTenue:true dans la ligne',lT.mesuree===true&&J_(lT.cartes)==='["grotte","grotte"]'&&lT.carteTenue===true&&lT.cle.endsWith('|carte:grotte|tenue'));
    ok('c10 : carte tenue non tenue : non mesuree, avec sa raison',lTk.mesuree===false&&lTk.raison==='carte tenue non appliquee (jouee aussi sur jade)'&&lTk.essai===1,lTk.raison);
    ok('c11 : six taches, six lancements (aucune relance pour une carte non appliquee)',lances===6,'lances '+lances);
    /* le cache : un ordonnanceur neuf sur le meme etat ne rejoue rien, la carte non appliquee comprise (rejouer ne changerait rien) */
    lances=0;
    const o2=K.creer({cfg,epoque:EP,dossierEtat:d,travailleurs:2,enfant:FAUX,journal});
    const L2=await o2.demander([tSans,tAvec,tAutre,tTenueKo]);
    const s2=o2.stats();
    ok('c12 : au lancement suivant tout vient du cache, la carte non appliquee aussi',lances===0&&s2.cache===4&&L2[2].raison===lO.raison&&L2[0].cle===lS.cle,`lances ${lances}, cache ${s2.cache}`);
    /* la ligne de commande de courses.js : --carte sans valeur refusee avant tout lancement */
    const p=spawnSync(process.execPath,[path.join(C.DOSSIER,'courses.js'),FAUX,'--graines','1','--etat',path.join(TMP,'cli'),'--carte'],{encoding:'utf8',timeout:30000});
    ok('c13 : courses.js --carte sans valeur : refuse, code 1',p.status===1&&/--carte sans valeur/.test(p.stderr),String(p.stderr).trim().slice(0,80));
  }catch(e){ok('exception',false,String(e&&e.stack||e));}
  try{fs.rmSync(TMP,{recursive:true,force:true});}catch(e){}
  const ko=resultats.filter(r=>!r.passe);
  process.stdout.write(`=== ${resultats.length-ko.length}/${resultats.length} passent${ko.length?' ; ECHOUENT : '+ko.map(r=>r.nom).join(' | '):''}\n`);
  process.exit(ko.length?1:0);
})();
