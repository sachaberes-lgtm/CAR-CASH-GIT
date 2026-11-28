#!/usr/bin/env node
/* ===== LE BANC DES GENES V2 : LES TESTS SANS COURSE (28/11/2026, lot « genes v4 ») =====
   usage : node ml/evolution/banc/tests/banc.test.js   (code 0 si tout passe ; AUCUNE course jouee ; environ une minute)
   Contrat : ml/evolution/notes/genes-v4.md § 8.4. Comme tests/validation-sequentielle.test.js : l'ordonnanceur des courses est remplace par un faux
   (des lignes fabriquees, ecrites comme le vrai dans courses-*.jsonl, avec un cache) ; tout le reste est le vrai code (banc.js, plan.js, bras.js,
   criteres.js, rapport.js, genome.js, note.comparer, graines.js).
     b1 la constante      : constanteOBF redonne le tableau du contrat a ± 0,03 ; meme entree -> meme nombre
     b2 les decisions     : net (les deux signes, les deux sens), rare (1er regard seulement), futilite (pas au 1er), plafond, continuer ; se = 0
     b3 les graines       : reste 4 ; les restes des autres plages recalcules depuis config.json, tous differents ; le second argument (par la
                            taille) ; deux vagues sans graine commune ; plafond > 1 000, numero 50 001 refuses ; 0 pour v000-essai seulement ; un
                            numero inscrit dans INDEX.md (dossier absent) refuse ; la plus grande graine < 2^31
     b4 les bras          : ecarts appliques ; gene inconnu, gene fige, valeur que reparer deplace, bras en double, bras egal au temoin, bras nomme
                            temoin -> code 1 ; fixes poses chez le temoin et les bras ; un critere compteur -> code 1 ; les bras v4 de bras.json
     b5 les criteres      : chaque type sur des lignes fabriquees ; « identique » = empreinte et empreinteTouches (pas empreinteVues)
     b6 le taux d'erreur  : 2 000 vagues de 5 bras SANS effet par le vrai deroulement : faux « net » <= 5,5 %, borne basse a 95 % sous 5 % ;
                            la puissance : un effet de (c + 0,84) / racine(192) ecart-type par graine trouve 75 % ± 3 des fois
     b7 la reprise        : STOP au milieu du 3e paquet -> code 3, regards.json a 2 regards ; relance -> le meme resultat.json (date a part), aucune
                            course jouee deux fois, alors que le cache contient plus de graines que le 2e regard
     b8 les refus         : vague.json, epoque des courses, epoque de la note, bootstrap, bras.json changes -> 4 ; verrou -> 5 ; carte imposee non
                            appliquee, YEUX CHANGES, plus de 10 % non mesurees -> 2
     b9 les textes        : resume.txt en cours sans aucun chiffre d'ecart ; lignes <= 118 colonnes ; journal.md (la question, chaque regard) ;
                            resultat.json (dPremier, biaiseParLArret, candidat, secondaires.nonCorrigees) ; INDEX.md (les faux « net » attendus) */
'use strict';
const fs=require('fs'),path=require('path'),os=require('os');
const BANC=path.join(__dirname,'..'),EVO=path.join(BANC,'..');
const C=require(path.join(EVO,'commun')),Gr=require(path.join(EVO,'graines')),N=require(path.join(EVO,'note')),Gn=require(path.join(EVO,'genome'));
const P=require(path.join(BANC,'plan')),Cr=require(path.join(BANC,'criteres')),Bb=require(path.join(BANC,'banc')),Rp=require(path.join(BANC,'rapport'));

const BAC=path.join(os.tmpdir(),'cashcar-banc-v2-'+process.pid);
const hh=()=>new Date().toTimeString().slice(0,8);
const dire=t=>process.stdout.write(hh()+' '+t+'\n');
const res=[];
function verdict(nom,ok,detail){res.push({nom,ok:!!ok});dire((ok?'PASSE  ':'ECHOUE ')+nom+(detail?' : '+detail:''));}
async function essai(nom,f){try{await f();}catch(e){verdict(nom,false,'exception : '+String(e&&e.stack||e).slice(0,600));}}
const muet=()=>{};
const REF=N.referenceEpoque(),MES={};for(const k of Object.keys(REF))if(REF[k])MES[k]=REF[k].m;
const h=s=>{let x=2166136261;for(const c of String(s))x=Math.imul(x^c.charCodeAt(0),16777619)>>>0;return x;};
const EP={courses:'epoqueTest01',note:'noteTest0001',composants:{}};

/* ---------- le faux ordonnanceur (celui de validation-sequentielle.test.js, avec la carte, les compteurs et les causes de chaque mort) ---------- */
const SC={modele:null,surDemande:null,jouees:[]};
function cleDe(t){return t.shaPilote+'|'+t.graine+'|'+t.tmax+(t.carte?'|carte:'+t.carte:'');}
function faux(o){
  const ep=o.epoque,d=o.dossierEtat,memoire=new Map(),S={jouees:0,cache:0,nonMesurees:0,relancees:0,tuees:0,ms:0};
  for(const l of require(path.join(EVO,'courses')).lireCourses(d))if(l.epoque===ep.courses)memoire.set(l.cle,l);
  return {
    async demander(taches){
      return taches.map(t=>{
        if(SC.surDemande)SC.surDemande(t,o);
        if(o.doitArreter())return null;
        const k=cleDe(t);
        if(memoire.has(k)){S.cache++;return memoire.get(k);}
        const l=Object.assign({cle:k,pilote:t.shaPilote,id:t.id,usage:t.usage,generation:null,epoque:ep.courses,essai:1,mesuree:true,raison:null,date:new Date().toISOString(),
          graine:t.graine,tmax:t.tmax,carte:t.carte||null},SC.modele(t));
        C.ajouterLigne(path.join(d,'courses-'+C.semaineIso(new Date())+'.jsonl'),l);
        S.jouees++;SC.jouees.push(k);memoire.set(k,l);
        return l;});},
    arreter(){return Promise.resolve();},enCours(){return 0;},stats(){return Object.assign({},S);},epoque:ep,trieur:'faux'};}

/* le modele des lignes : le temoin (SC.temoin = son shaPilote) et chaque bras ; un bras est identique au temoin sur une graine sur trois ;
   EFFET[shaPilote] = un decalage de survie (s) */
const EFFET={};
function modeleNormal(t){
  const g=t.graine,base=h('base|'+g),estT=t.shaPilote===SC.temoin;
  const meme=estT||h('meme|'+t.shaPilote+'|'+g)%3===0;
  const cle=meme?'T|'+g:t.shaPilote+'|'+g,x=h(cle);
  const palier=4+base%6+(meme?0:(x%5)-2);
  const survie=100+base%200+(meme?0:(x%61)-30)+(meme?0:(EFFET[t.shaPilote]||0));
  const nMorts=1+(x%3),causes=['roche','paroi','air','vide','tour'];
  const causesMorts=[];for(let k=0;k<nMorts;k++)causesMorts.push(causes[(x>>>(3*k))%5]);
  return {palier,pieces:10,survie_s:survie,cause:causesMorts[causesMorts.length-1],morts:nMorts,vols:5+x%7,pannes:0,pannesEssais:0,erreurs:0,derniereErreur:null,
    yeuxTirages:0,mesures:Object.assign({},MES,{poseCentre:REF.poseCentre?REF.poseCentre.m+((x%11)-5)/100:0.5}),
    empreinte:'e'+h(cle).toString(16),empreinteTouches:'k'+h('k'+cle).toString(16),empreinteVues:'v'+h('v'+t.shaPilote+'|'+g).toString(16),ms:60000,
    cartes:[t.carte||'nuages','jade'],causesMorts,chancePrise:x%2===0,declenchements:estT?{}:(x%4===0?{sortieOn:1+x%3,'sortieOn.vol':x%3,'sortieOn.pose':x%2}:{})};}

/* ---------- les fichiers d'une vague d'essai ---------- */
function vagueDans(parent,v){const d=path.join(parent,v.nom);fs.mkdirSync(d,{recursive:true});fs.writeFileSync(path.join(d,'vague.json'),JSON.stringify(v,null,1)+'\n');return d;}
function brasDans(f,bras){fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,JSON.stringify({format:'banc-bras-1',bras},null,1)+'\n');return f;}
const BRAS_V3={lache:{dit:'lacher le volant avant la pose',genes:{lacheOn:1}},bord:{dit:'decoller nitro allumee au bord',genes:{bordOn:1}},
  coup:{dit:'le coup de nitro',genes:{coupOn:1}},double:{dit:'le meme que lache',genes:{lacheOn:1}},egal:{dit:'rien de change',genes:{lacheOn:0}},
  inconnu:{dit:'un gene qui n existe pas',genes:{pasUnGene:1}},deplace:{dit:'une valeur hors borne',genes:{lacheOn:1,lacheAvant:99}},
  fige:{dit:'la seconde chance en bras',genes:{chancePalierMin:8}}};
const vagueBase=(o)=>Object.assign({format:'banc-vague-1',numero:1,nom:'v001-essai-test',question:'Le test du banc tient-il ?',temoin:'c0025',tmax:60,carte:null,fixes:{},
  plan:{premier:4,pas:4,plafond:16,alpha:0.05,futilite:0,fMin:0},
  bras:[{nom:'lache',critere:{type:'survie',sens:'haut'}},{nom:'bord',critere:{type:'causes',famille:['roche','paroi'],sens:'bas'}},{nom:'coup',critere:{type:'palier',sens:'haut'}}]},o||{});
async function lancer(args,o){
  const L=[];const code=await Bb.principal(args,Object.assign({creer:faux,REF,epoque:EP,dire:t=>L.push(t),maintenant:()=>'2026-11-28T12:00:00.000Z'},o||{}));
  return {code,texte:L.join('\n')};}
const lire=f=>JSON.parse(fs.readFileSync(f,'utf8'));
const sansDate=x=>{const y=JSON.parse(JSON.stringify(x));delete y.date;return y;};

(async function(){
  const t0=Date.now();
  fs.rmSync(BAC,{recursive:true,force:true});fs.mkdirSync(BAC,{recursive:true});
  const CFG=C.lireConfig();

  /* ===== b1 ===== */
  await essai('b1',()=>{
    const T=[[[24,24,96],[2.035,2.447,2.538,2.620]],[[24,24,192],[2.079,2.486,2.581,2.645]],[[24,24,288],[2.104,2.503,2.601,2.678]],[[24,12,96],[2.083,2.485,2.583,2.659]]];
    const ec=[];let pire=0;
    for(const [pl,attendu] of T){const R=P.regardsDe(P.lirePlan({premier:pl[0],pas:pl[1],plafond:pl[2]}));
      [1,3,4,5].forEach((k,i)=>{const c=P.constanteOBF(0.05/k,R);pire=Math.max(pire,Math.abs(c-attendu[i]));ec.push(pl.join('/')+' k'+k+' '+c.toFixed(3));});}
    verdict('b1 : constanteOBF redonne les 16 valeurs du tableau du contrat a ± 0,03',pire<=0.03,'ecart le plus grand '+pire.toFixed(4)+' ; '+ec.join(', '));
    const R8=P.regardsDe(P.lirePlan({}));
    const a=P.constanteOBF(0.01,R8,{sansMemoire:true}),b=P.constanteOBF(0.01,R8,{sansMemoire:true});
    verdict('b1 : meme entree -> meme nombre (deux calculs complets) ; le plan par defaut a 8 regards (24 … 192)',a===b&&R8.length===8&&R8[0]===24&&R8[7]===192,a+' / '+b+' ; '+R8.join(','));
    verdict('b1 : la constante classique de 4 regards a 5 % bilateral (2,024) a 0,01 pres',Math.abs(P.constanteOBF(0.05,[24,48,72,96])-2.024)<0.01);
  });

  /* ===== b2 ===== */
  await essai('b2',()=>{
    const pl=P.lirePlan({}),D=x=>P.decision(pl,Object.assign({j:2,n:48,z:0,borne:3,f:1,sens:'haut'},x));
    const cas=[[{z:3.2},'net-aide'],[{z:-3.2},'net-nuit'],[{z:3.2,sens:'bas'},'net-nuit'],[{z:-3.2,sens:'bas'},'net-aide'],[{z:3},'net-aide'],
      [{j:1,n:24,z:1,f:0.05},'rare'],[{j:2,z:1,f:0.05},'continuer'],[{j:1,n:24,z:0.1,f:0.5},'continuer'],[{j:2,z:0.4},'futilite'],[{j:2,z:-0.4},'futilite'],
      [{j:8,n:192,z:1.5},'plafond'],[{j:3,n:72,z:1.5},'continuer'],[{z:Infinity},'net-aide'],[{z:-Infinity,borne:Infinity},'continuer'],[{j:2,z:null,borne:Infinity},'futilite'],
      [{j:1,n:24,z:8,f:0.01,borne:7.5},'net-aide'],[{j:1,n:24,z:null,f:null,borne:Infinity},'rare']];
    const faux=cas.filter(([x,att])=>D(x)!==att).map(([x,att])=>JSON.stringify(x)+' -> '+D(x)+' (attendu '+att+')');
    verdict('b2 : net (deux signes, deux sens, |z| = borne compte), rare au 1er regard seulement, futilite des le 2e, plafond, continuer',!faux.length,faux.join(' | ')||cas.length+' cas');
    verdict('b2 : se = 0 -> z = +inf / -inf si d != 0, sinon 0 ; d absent -> null',P.zDe(1,0)===Infinity&&P.zDe(-1,0)===-Infinity&&P.zDe(0,0)===0&&P.zDe(null,1)===null&&P.zDe(2,4)===0.5);
    const pl2=P.lirePlan({fMin:0});
    verdict('b2 : fMin 0 -> jamais rare',P.decision(pl2,{j:1,n:24,z:0,borne:7,f:0,sens:'haut'})==='continuer');
    verdict('b2 : la borne vaut c racine(plafond / m) ; m = 0 -> +inf',Math.abs(P.borne(pl,2,48)-2*2)<1e-12&&P.borne(pl,2,0)===Infinity);
    const ap=Cr.apparie([{b:{survie_s:5},t:{survie_s:3}},{b:{survie_s:7},t:{survie_s:5}}],{type:'survie',sens:'haut'});
    verdict('b2 : toutes les differences egales (se = 0, d = 2) -> z = +inf',ap.se===0&&ap.d===2&&ap.z===Infinity,JSON.stringify(ap));
    /* (28/11, le relecteur « banc-courses ») une seule graine mesurable : pas d'ecart-type, donc aucun z (avant : z infini, un « net » sur une course) */
    const ap1=Cr.apparie([{b:{survie_s:9},t:{survie_s:3}},{b:{survie_s:9},t:{}}],{type:'survie',sens:'haut'});
    const st1=Cr.statistique([{b:{id:'b',graine:1,mesuree:true,palier:5,mesures:null},t:{id:'t',graine:1,mesuree:true,palier:2,mesures:null}}],{type:'palier',sens:'haut'},{N,REF,cfg:CFG,rng:Gr.rngDe('b2|une')});
    verdict('b2 : une seule graine mesurable (apparie et comparer) -> z = null, jamais « net »',ap1.m===1&&ap1.z===null&&st1.m===1&&st1.z===null&&
      P.decision(P.lirePlan({}),{j:1,n:24,z:ap1.z,borne:P.borne(P.lirePlan({}),2.6,1),f:1,sens:'haut'})==='continuer',JSON.stringify(ap1)+' '+JSON.stringify(st1));
  });

  /* ===== b3 ===== */
  await essai('b3',async()=>{
    const G=CFG.graines,r=x=>((x%37)+37)%37;
    const plages={entrainement:G.entrainement.depart,suite:G.entrainement.suite.depart,validation:G.validation.depart,repli:G.validation.repli.depart,coffre:G.coffre.depart,
      'banc d\'etude':3000000,'mesures du 27/11':930000};
    for(const [i,g] of (CFG.identite.graines||[]).entries())plages['identite '+i]=g;
    const pas=[G.entrainement.pas,G.entrainement.suite.pas,G.validation.pas,G.validation.repli.pas,G.coffre.pas];
    const restes=Object.entries(plages).map(([k,g])=>k+' '+r(g));
    verdict('b3 : la plage du banc a le reste 4 (4 000 000 = 37 x 108 108 + 4), pour toutes les vagues et l\'essai',r(P.DEPART)===4&&[0,1,2,777,50000].every(n=>[0,1,999].every(i=>r(P.graine(n,i))===4)));
    verdict('b3 : les restes des autres plages, recalcules depuis config.json, sont tous differents de 4 ; toutes avancent de 37',
      Object.values(plages).every(g=>r(g)!==4)&&pas.every(p=>p===37),restes.join(', '));
    const fins={entrainement:G.entrainement.depart+37*(G.entrainement.n-1),repli:G.validation.repli.depart+37*(G.validation.repli.n-1),coffre:G.coffre.depart+37*(G.coffre.n-1),
      identite:Math.max(...CFG.identite.graines),'mesures du 27/11':930000+37*999,validationDepart:G.validation.depart};
    verdict('b3 : second argument (par la taille) : les plages a pas libre restent sous 4 000 000 - 37 000 ; les seules qui montent au-dela ont un autre reste',
      Object.values(fins).every(x=>x<P.DEPART-37000)&&r(G.entrainement.suite.depart)!==4&&r(3000000)!==4,JSON.stringify(fins));
    const S1=new Set(),S2=new Set(),S0=new Set();for(let i=0;i<1000;i++){S1.add(P.graine(1,i));S2.add(P.graine(2,i));S0.add(P.graine(0,i));}
    const commun=[...S1].filter(x=>S2.has(x)||S0.has(x)).length+[...S2].filter(x=>S0.has(x)).length;
    verdict('b3 : deux numeros de vague (0, 1, 2) n\'ont aucune graine commune ; graine(n, 999) < graine(n + 1, 0)',commun===0&&P.graine(1,999)<P.graine(2,0)&&P.graine(0,999)<P.graine(1,0));
    const max=P.graine(P.NUMERO_MAX,999);
    verdict('b3 : la plus grande graine (numero 50 000, i = 999) vaut 1 853 999 963 < 2^31 ; l\'essai prend 3 963 000 a 3 999 963',max===1853999963&&max<2147483648&&P.graine(0,0)===3963000&&P.graine(0,999)===3999963);
    let ref1=null;try{P.lirePlan({plafond:1001});}catch(e){ref1=e.code;}
    verdict('b3 : plafond 1 001 refuse (code 1)',ref1===1);
    /* les numeros, par la ligne de commande */
    const parent=path.join(BAC,'b3'),fb=brasDans(path.join(parent,'bras.json'),BRAS_V3),etat=path.join(parent,'etat');
    const essaiNum=async(v,quoi)=>{const d=vagueDans(path.join(parent,quoi),vagueBase(v));return lancer(['--vague',d,'--verifier','--etat',etat,'--bras',fb]);};
    const a=await essaiNum({numero:50001},'a'),b=await essaiNum({numero:0},'b'),c0=await essaiNum({numero:0,nom:'v000-essai'},'c'),d=await essaiNum({numero:1.5},'d');
    verdict('b3 : numero 50 001 refuse ; 0 refuse sous un autre nom que v000-essai ; 0 accepte pour v000-essai ; 1,5 refuse',a.code===1&&b.code===1&&c0.code===0&&d.code===1,
      [a.code,b.code,c0.code,d.code].join(','));
    verdict('b3 : l\'essai (numero 0) n\'est jamais inscrit dans INDEX.md',!fs.existsSync(path.join(parent,'c','INDEX.md')));
    const e1=await essaiNum({numero:7,nom:'v007-premiere'},'e');
    const idx=fs.readFileSync(path.join(parent,'e','INDEX.md'),'utf8');
    fs.rmSync(path.join(parent,'e','v007-premiere'),{recursive:true,force:true});
    const e2=await essaiNum({numero:7,nom:'v007-seconde'},'e');
    const e3=await essaiNum({numero:7,nom:'v007-premiere'},'e');
    verdict('b3 : le numero est inscrit des le depart ; un numero inscrit dans INDEX.md (dossier efface) est refuse, sous un autre nom comme sous le meme (code 1)',
      e1.code===0&&/\| 7 \| v007-premiere/.test(idx)&&e2.code===1&&/deja pris/.test(e2.texte)&&e3.code===1,[e1.code,e2.code,e3.code].join(',')+' '+e2.texte.split('\n').pop());
  });

  /* ===== b4 ===== */
  await essai('b4',async()=>{
    const parent=path.join(BAC,'b4'),fb=brasDans(path.join(parent,'bras.json'),BRAS_V3),etat=path.join(parent,'etat');
    let n=0;const verif=async(v,o)=>{const d=vagueDans(path.join(parent,'p'+(++n)),vagueBase(v));const r=await lancer(['--vague',d,'--verifier','--etat',etat,'--bras',(o&&o.bras)||fb]);r.dossier=d;return r;};
    const ok=await verif({});
    const pj=ok.code===0?lire(path.join(ok.dossier,'plan.json')):null;
    const T=Gn.genomeTemoin(Object.assign({},CFG,{temoin:'c0025'}));
    verdict('b4 : une vague de trois bras v:3 se fabrique ; le temoin garde 19e3767cc346 et le pilote que la selection ecrit',ok.code===0&&pj.temoin.genome==='19e3767cc346'&&
      pj.temoin.shaPilote===Gn.shaPilote(Gn.ecrirePilote(T,{cfg:Object.assign({},CFG,{temoin:'c0025'})})),ok.texte.split('\n').slice(-1)[0]);
    verdict('b4 : les ecarts sont appliques (lache : lacheOn 0 -> 1, rien d\'autre)',pj&&JSON.stringify(pj.bras[0].ecarts)==='{"lacheOn":[0,1]}'&&pj.bras[1].ecarts.bordOn[1]===1,pj&&JSON.stringify(pj.bras[0].ecarts));
    const bras1=nom=>[{nom,critere:{type:'survie',sens:'haut'}}];
    const refus={inconnu:await verif({bras:bras1('inconnu')}),fige:await verif({bras:bras1('fige')}),deplace:await verif({bras:bras1('deplace')}),
      double:await verif({bras:[{nom:'lache',critere:{type:'survie',sens:'haut'}},{nom:'double',critere:{type:'vols',sens:'haut'}}]}),
      egal:await verif({bras:bras1('egal')}),temoin:await verif({bras:bras1('temoin')}),absent:await verif({bras:bras1('nulle-part')}),
      six:await verif({bras:['a','b','c','d','e','f'].map(bras1).map(x=>x[0])}),compteur:await verif({bras:[{nom:'lache',critere:{type:'compteur',cle:'lacheOn',sens:'haut'}}]}),
      compteurDeguise:await verif({bras:[{nom:'lache',critere:{type:'mesure',cle:'lacheOn',sens:'haut'}}]}),
      enDouble:await verif({bras:[{nom:'lache',critere:{type:'survie',sens:'haut'}},{nom:'lache',critere:{type:'vols',sens:'haut'}}]}),
      carte:await verif({carte:'lune'}),sansQuestion:await verif({question:''}),mesureInconnue:await verif({bras:[{nom:'lache',critere:{type:'mesure',cle:'pasUneMesure',sens:'haut'}}]}),
      sansSens:await verif({bras:[{nom:'lache',critere:{type:'survie'}}]})};
    const mots={inconnu:/gene inconnu/,fige:/fige/,deplace:/ne survit pas a reparer \(rendu : /,double:/meme pilote/,egal:/pilote du temoin/,temoin:/« temoin »/,absent:/pas dans bras\.json/,
      six:/au plus 5/,compteur:/compteur n'est jamais un critere principal/,compteurDeguise:/compteur n'est jamais un critere principal/,enDouble:/en double/,carte:/carte inconnue/,
      sansQuestion:/question/,mesureInconnue:/mesure inconnue/,sansSens:/sens/};
    const faux=Object.entries(refus).filter(([k,r])=>!(r.code===1&&mots[k].test(r.texte))).map(([k,r])=>k+' '+r.code+' '+r.texte.split('\n').pop().slice(0,160));
    verdict('b4 : refus code 1 : gene inconnu, gene fige, valeur que reparer deplace, bras en double, bras egal au temoin, bras nomme temoin, bras absent, 6 bras, '+
      'critere compteur (et deguise en mesure), nom en double, carte inconnue, sans question, mesure inconnue, sans sens',!faux.length,faux.join(' | ')||Object.keys(refus).length+' refus');
    verdict('b4 : aucun plan.json ecrit par une vague refusee',Object.keys(refus).every(k=>!fs.existsSync(path.join(refus[k].dossier,'plan.json'))));
    /* les fixes */
    const fixes=Gn.VERSION>=4?{chancePalierMin:8}:{marge:20};
    const fx=await verif({fixes});
    const pf=fx.code===0?lire(path.join(fx.dossier,'plan.json')):null;
    const cle=Object.keys(fixes)[0];
    verdict('b4 : fixes ('+JSON.stringify(fixes)+') poses chez le temoin (autre genome) et chez chaque bras (leurs ecarts au temoin ne le portent pas)',
      pf&&pf.temoin.genome!=='19e3767cc346'&&pf.temoin.ecarts[cle]&&pf.temoin.ecarts[cle][1]===fixes[cle]&&pf.bras.every(b=>!(cle in b.ecarts)),pf&&JSON.stringify(pf.temoin.ecarts));
    /* les bras v4 du catalogue (seulement quand le lot (a) est la : genome v:4) */
    if(Gn.VERSION>=4){
      const cat=JSON.parse(fs.readFileSync(path.join(BANC,'bras.json'),'utf8'));
      const v4=await verif({nom:'v002-catalogue',bras:['sortie','rien','fidele-juge','secours','fidele-suit'].map(x=>({nom:x,critere:{type:'causes',famille:['air','vide'],sens:'bas'}}))},{bras:path.join(BANC,'bras.json')});
      const v4b=await verif({nom:'v003-catalogue',bras:['sortie-tot','retour'].map(x=>({nom:x,critere:{type:'survie',sens:'haut'}}))},{bras:path.join(BANC,'bras.json')});
      verdict('b4 : les 7 bras de banc/bras.json se fabriquent (genome v:4), tous differents du temoin',v4.code===0&&v4b.code===0&&Object.keys(cat.bras).length===7,
        v4.texte.split('\n').pop()+' / '+v4b.texte.split('\n').pop());
    }else verdict('b4 : les bras v4 de bras.json (genome v:'+Gn.VERSION+' : le lot (a) n\'est pas encore la)',false,'SAUTE : compte comme un echec');
  });

  /* ===== b5 ===== */
  await essai('b5',()=>{
    const l=(x)=>Object.assign({mesuree:true,id:'x',graine:1,palier:5,survie_s:100,vols:4,empreinte:'a',empreinteTouches:'b',empreinteVues:'c',mesures:{poseCentre:0.5},causesMorts:['roche','air']},x);
    const cM={type:'mesure',cle:'poseCentre',sens:'haut'},cC={type:'causes',famille:['roche','paroi'],sens:'bas'};
    const ok=[Cr.valeur(l({}),cM)===0.5,Cr.valeur(l({mesures:{poseCentre:null}}),cM)===null,Cr.valeur(l({mesures:null}),cM)===null,
      Cr.valeur(l({}),cC)===1,Cr.valeur(l({causesMorts:['roche','paroi','air']}),cC)===2,Cr.valeur(l({causesMorts:[]}),cC)===0,Cr.valeur(l({causesMorts:undefined}),cC)===null,
      Cr.valeur(l({}),{type:'survie'})===100,Cr.valeur(l({}),{type:'vols'})===4,Cr.valeur(l({survie_s:null}),{type:'survie'})===null];
    verdict('b5 : les valeurs : mesure (nulle -> pas lue), causes (deux morts d\'une famille = 2, aucune mort = 0, causesMorts absent -> pas lue), survie, vols',ok.every(Boolean),ok.join(','));
    const paires=[{b:l({mesures:{poseCentre:0.7}}),t:l({})},{b:l({mesures:{poseCentre:null}}),t:l({})},{b:l({causesMorts:['roche','roche']}),t:l({causesMorts:undefined})},{b:l({mesures:{poseCentre:0.6}}),t:l({})}];
    const sM=Cr.apparie(paires,cM),sC=Cr.apparie(paires,cC);
    verdict('b5 : la difference appariee ne lit que les graines mesurables chez les deux (mesure : 3 sur 4 ; causes : 3 sur 4)',sM.m===3&&Math.abs(sM.d-0.1)<1e-12&&sC.m===3&&sC.d===0,JSON.stringify(sM)+' '+JSON.stringify(sC));
    /* palier, F, E : note.comparer, comme la validation */
    const LB=[],LT=[];for(let i=0;i<20;i++){LT.push(l({id:'t',graine:4000000+37*i,palier:5+(i%4),mesures:Object.assign({},MES)}));LB.push(l({id:'b',graine:4000000+37*i,palier:6+(i%3),mesures:Object.assign({},MES)}));}
    const pp=LB.map((b,i)=>({b,t:LT[i]})),o={N,REF,cfg:CFG,rng:Gr.rngDe('banc|t|b|20')};
    const cmp=N.comparer(LB,LT,{REF,cfg:CFG,rng:Gr.rngDe('banc|t|b|20')});
    const sP=Cr.statistique(pp,{type:'palier',sens:'haut'},Object.assign({},o,{rng:Gr.rngDe('banc|t|b|20')}));
    const sF=Cr.statistique(pp,{type:'F',sens:'haut'},Object.assign({},o,{rng:Gr.rngDe('banc|t|b|20')}));
    const sE=Cr.statistique(pp,{type:'E',sens:'bas'},Object.assign({},o,{rng:Gr.rngDe('banc|t|b|20')}));
    verdict('b5 : palier, F, E passent par note.comparer (bras moins temoin, memes d et se que comparer, m = ses graines)',sP.d===cmp.dPalier&&sP.se===cmp.se_dPalier&&sF.d===cmp.dF&&
      sF.se===cmp.se_dF&&sE.d===cmp.dE&&sP.m===20,'dPalier '+sP.d+' se '+sP.se);
    const id=[Cr.identique(l({}),l({empreinteVues:'autre'})),!Cr.identique(l({}),l({empreinteTouches:'autre'})),!Cr.identique(l({}),l({empreinte:'autre'})),!Cr.identique(l({empreinte:null}),l({empreinte:null}))];
    const pc=Cr.partChangee([{b:l({empreinteVues:'x'}),t:l({})},{b:l({empreinte:'z'}),t:l({})}]);
    verdict('b5 : « identique » : un bras loiFidele aux memes empreinte et empreinteTouches mais a l\'empreinteVues differente compte identique ; une touche ou une empreinte differente non ; f = 1/2',
      id.every(Boolean)&&pc.identiques===1&&pc.f===0.5,id.join(',')+' f '+pc.f);
  });

  /* ===== b6 : le taux d'erreur et la puissance, par le VRAI deroulement (banc.derouler, plan.decision, criteres.statistique) ===== */
  await essai('b6',async()=>{
    const plan=P.lirePlan({}),R=P.regardsDe(plan),K=5,c=P.constanteOBF(plan.alpha/K,R);
    const CRIT=[{type:'survie',sens:'haut'},{type:'survie',sens:'bas'},{type:'vols',sens:'haut'},{type:'causes',famille:['roche'],sens:'bas'},{type:'survie',sens:'haut'}];
    const PARTS=[1,1,0.6,0.6,0.3];
    async function uneVague(v,effet){
      const rng=Gr.mulberry32(h('b6|'+v)),bras=CRIT.map((cr,i)=>({nom:'b'+i,critere:cr}));
      const T=[];
      const ligne=(qui,i)=>{
        if(qui==='temoin'){const b=rng.normal()*3,l={mesuree:true,survie_s:b+rng.normal(),vols:Math.round(6+b+rng.normal()*2),causesMorts:[],empreinte:'t'+i,empreinteTouches:'k'+i};
          const nm=rng.poisson(1.2);for(let k=0;k<nm;k++)l.causesMorts.push(rng.suivant()<0.5?'roche':'air');l._b=b;T[i]=l;return l;}
        const a=+qui.slice(1),t=T[i];
        if(rng.suivant()>=PARTS[a])return Object.assign({},t);
        const d=effet&&effet.bras===a?effet.delta:0;
        const l={mesuree:true,survie_s:t._b+rng.normal()+d,vols:Math.round(6+t._b+rng.normal()*2),causesMorts:[],empreinte:'b'+a+'|'+i,empreinteTouches:'k'+i};
        const nm=rng.poisson(1.2);for(let k=0;k<nm;k++)l.causesMorts.push(rng.suivant()<0.5?'roche':'air');return l;};
      return Bb.derouler({plan,regards:R,c,bras,jouer:async paquet=>paquet.map(x=>ligne(x.qui,x.i)),statistique:(paires,cr)=>Cr.statistique(paires,cr,{})});}
    const V=2000;let avecNet=0,graines=0,nb=0,rares=0;
    for(let v=0;v<V;v++){const D=await uneVague(v,null);let net=false;for(const e of Object.values(D.bras)){if(/^net/.test(e.decision))net=true;if(e.decision==='rare')rares++;graines+=e.n;nb++;}if(net)avecNet++;}
    const p=avecNet/V,se=Math.sqrt(p*(1-p)/V),bas=p-1.96*se;
    verdict('b6 : 2 000 vagues de 5 bras sans effet : la part de vagues avec un faux « net » a un point <= 5,5 % et une borne basse a 95 % sous 5 % (nominal 1 - 0,99^5 = 4,9 %)',
      p<=0.055&&bas<0.05,(100*p).toFixed(2)+' % [' +(100*bas).toFixed(2)+' ; '+(100*(p+1.96*se)).toFixed(2)+'] ; '+(graines/nb).toFixed(1)+' graines par bras en moyenne ; '+rares+' arrets « rare »');
    const delta=(c+0.84)/Math.sqrt(plan.plafond)*Math.SQRT2;   /* l'ecart-type d'une difference appariee vaut racine(2) ici (deux bruits N(0, 1)) */
    let trouve=0,nuit=0,gr=0;
    for(let v=0;v<V;v++){const D=await uneVague('puissance|'+v,{bras:0,delta});const e=D.bras.b0;if(e.decision==='net-aide')trouve++;if(e.decision==='net-nuit')nuit++;gr+=e.n;}
    const q=trouve/V;
    verdict('b6 : la puissance : un effet de (c + 0,84) / racine(192) = '+((c+0.84)/Math.sqrt(plan.plafond)).toFixed(3)+' ecart-type par graine sur un bras est trouve 75 % ± 3 des fois',
      q>=0.72&&q<=0.78,(100*q).toFixed(1)+' % net-aide, '+nuit+' net-nuit, '+(gr/V).toFixed(0)+' graines en moyenne ; c = '+c.toFixed(3));
  });

  /* ===== b7, b8, b9 : une vague entiere par la ligne de commande, avec le faux ordonnanceur ===== */
  const fbras=brasDans(path.join(BAC,'bras.json'),BRAS_V3);
  const vB=vagueBase({nom:'v001-reprise'});
  let pjA=null,resA=null,regA=null;
  await essai('b7',async()=>{
    /* A : sans interruption */
    const dA=vagueDans(path.join(BAC,'A'),vB),eA=path.join(BAC,'A','etat');
    const vA=await lancer(['--vague',dA,'--verifier','--etat',eA,'--bras',fbras]);
    pjA=lire(path.join(dA,'plan.json'));SC.temoin=pjA.temoin.shaPilote;SC.modele=modeleNormal;
    EFFET[pjA.bras[0].shaPilote]=60;   /* « lache » : +60 s de survie quand sa course change : un net-aide tot */
    SC.jouees=[];
    const a=await lancer(['--vague',dA,'--etat',eA,'--bras',fbras]);
    resA=lire(path.join(dA,'resultat.json'));regA=lire(path.join(dA,'regards.json'));
    const jA=SC.jouees.length;
    verdict('b7 : la vague sans interruption finit (code 0), les cinq fichiers ecrits',vA.code===0&&a.code===0&&['plan.json','regards.json','resultat.json','resume.txt','journal.md'].every(f=>fs.existsSync(path.join(dA,f))),
      a.code+' ; '+regA.regards.length+' regards ; '+jA+' courses ; verdicts '+Object.entries(resA.bras).map(([k,x])=>k+' '+x.verdict+' au regard '+x.regard).join(', '));
    /* B : la meme, STOP au milieu du 3e paquet */
    const dB=vagueDans(path.join(BAC,'B'),vB),eB=path.join(BAC,'B','etat');
    SC.jouees=[];let vus=0;
    const n2=pjA.regards[1];
    SC.surDemande=(t)=>{if(P.graine(1,0)+37*n2<=t.graine&&++vus===4)fs.writeFileSync(path.join(eB,'STOP'),'');};
    const b1=await lancer(['--vague',dB,'--etat',eB,'--bras',fbras]);
    SC.surDemande=null;
    const regB1=lire(path.join(dB,'regards.json')),jB1=SC.jouees.slice();
    const resumeEnCours=fs.readFileSync(path.join(dB,'resume.txt'),'utf8'),journalEnCours=fs.readFileSync(path.join(dB,'journal.md'),'utf8');
    const auDela=jB1.filter(k=>+k.split('|')[1]>=P.graine(1,0)+37*n2).length;
    verdict('b7 : STOP au milieu du 3e paquet -> code 3, regards.json a 2 regards, pas de resultat.json, STOP efface ; le cache a '+auDela+' course(s) au-dela du 2e regard',
      b1.code===3&&regB1.regards.length===2&&!fs.existsSync(path.join(dB,'resultat.json'))&&!fs.existsSync(path.join(eB,'STOP'))&&auDela>0,b1.code+' ; '+b1.texte.split('\n').pop());
    const b2=await lancer(['--vague',dB,'--etat',eB,'--bras',fbras]);
    const resB=lire(path.join(dB,'resultat.json')),regB=lire(path.join(dB,'regards.json'));
    const toutes=jB1.concat(SC.jouees.slice(jB1.length));
    verdict('b7 : la relance finit (code 0) et rend le MEME resultat.json (date a part) et le meme regards.json',b2.code===0&&JSON.stringify(sansDate(resB))===JSON.stringify(sansDate(resA))&&
      JSON.stringify(regB)===JSON.stringify(regA),b2.code);
    verdict('b7 : aucune course jouee deux fois (les deux lancements de B : '+toutes.length+' courses, autant que A)',new Set(toutes).size===toutes.length&&toutes.length===jA,toutes.length+' / '+jA);
    /* un cache qui contient TOUTES les graines (celles de A) : un lancement neuf sur ce cache rend les memes decisions sans rien jouer */
    const dC=vagueDans(path.join(BAC,'C'),vB),eC=path.join(BAC,'C','etat');fs.cpSync(eA,eC,{recursive:true});
    SC.jouees=[];const c3=await lancer(['--vague',dC,'--etat',eC,'--bras',fbras]);
    verdict('b7 : sur un cache qui a toutes les graines du plafond, chaque regard ne lit que les siennes : memes decisions, aucune course jouee',
      c3.code===0&&SC.jouees.length===0&&JSON.stringify(lire(path.join(dC,'regards.json')))===JSON.stringify(regA));
    /* b9 en cours (relu ici, avant la fin) */
    const chiffres=[];for(const r of regB1.regards)for(const x of Object.values(r.bras)){for(const v of [x.d,x.z,x.se])if(typeof v==='number'&&v!==0)chiffres.push(v);}
    /* les ecarts non entiers, sous les formes que le banc ecrit (2 ou 3 decimales, point ou virgule) ; un entier (1, 2…) se trouve partout */
    const montre=chiffres.filter(v=>v!==Math.round(v)).filter(v=>[v.toFixed(2),v.toFixed(3)].some(s=>resumeEnCours.indexOf(s.replace('.',','))>=0||resumeEnCours.indexOf(s)>=0));
    verdict('b9 : resume.txt en cours ne porte aucun d, se ni z (ni le mot « z ») et dit qu\'aucun chiffre ne parait tant qu\'un bras joue',
      !montre.length&&!/\bz\b|\bd\b ?=/.test(resumeEnCours)&&/Aucun chiffre/.test(resumeEnCours),montre.slice(0,5).join(',')+'\n'+resumeEnCours);
    verdict('b9 : journal.md en cours n\'ecrit que les decisions de chaque regard',/en cours : seules les decisions/.test(journalEnCours)&&!/\| continuer \|$/m.test('')&&
      !regB1.regards.some(r=>Object.values(r.bras).some(x=>typeof x.d==='number'&&x.d!==0&&journalEnCours.indexOf(x.d.toFixed(4))>=0)));
    const toutesLignes=[resumeEnCours,fs.readFileSync(path.join(dB,'resume.txt'),'utf8')].join('\n').split('\n');
    verdict('b9 : toutes les lignes de resume.txt (en cours et final) font 118 colonnes au plus',toutesLignes.every(l=>l.length<=118),Math.max(...toutesLignes.map(l=>l.length))+' au plus');
  });

  await essai('b8',async()=>{
    const dB=path.join(BAC,'B',vB.nom),eB=path.join(BAC,'B','etat'),fv=path.join(dB,'vague.json');
    const t0v=fs.readFileSync(fv,'utf8');
    fs.writeFileSync(fv,t0v.replace('"question"','"question" '));
    const r1=await lancer(['--vague',dB,'--etat',eB,'--bras',fbras]);fs.writeFileSync(fv,t0v);
    const r2=await lancer(['--vague',dB,'--etat',eB,'--bras',fbras],{epoque:Object.assign({},EP,{courses:'autreEpoque1'})});
    const r3=await lancer(['--vague',dB,'--etat',eB,'--bras',fbras],{epoque:Object.assign({},EP,{note:'autreNote001'})});
    const fc=path.join(BAC,'config-bootstrap.json');fs.writeFileSync(fc,JSON.stringify({validation:{bootstrap:200}}));
    const r4=await lancer(['--vague',dB,'--etat',eB,'--bras',fbras,'--config',fc]);
    const B2=JSON.parse(JSON.stringify(BRAS_V3));B2.bord.genes={bordOn:1,bordNitro:1};const fb2=brasDans(path.join(BAC,'bras-change.json'),B2);
    const r5=await lancer(['--vague',dB,'--etat',eB,'--bras',fb2]);
    fs.writeFileSync(path.join(eB,'verrou.json'),JSON.stringify({pid:process.pid,date:'maintenant'}));
    const r6=await lancer(['--vague',dB,'--etat',eB,'--bras',fbras]);fs.unlinkSync(path.join(eB,'verrou.json'));
    const r7=await lancer(['--vague',dB,'--etat',eB,'--bras',fbras]);
    verdict('b8 : vague.json modifie, epoque des courses, epoque de la note, bootstrap, bras.json change pour un bras de la vague -> 4, 4, 4, 4, 4 ; verrou pris -> 5 ; '+
      'puis, tout remis, la vague se relit (0)',[r1,r2,r3,r4,r5,r6,r7].map(r=>r.code).join(',')==='4,4,4,4,4,5,0'&&/a change/.test(r1.texte)&&/epoque des courses a change/.test(r2.texte)&&
      /refaire la vague sous un autre numero/.test(r2.texte)&&/epoque de la note/.test(r3.texte)&&/bootstrap/.test(r4.texte)&&/« bord »/.test(r5.texte)&&/verrou/.test(r6.texte),
      [r1,r2,r3,r4,r5,r6,r7].map(r=>r.code+' '+r.texte.split('\n').pop().slice(0,90)).join(' | '));
    /* code 2 : la carte, les yeux, les courses non mesurees */
    const deux=async(nom,modif,v)=>{
      const d=vagueDans(path.join(BAC,'deux-'+nom),vagueBase(Object.assign({nom:'v00'+(5+nom.length)+'-'+nom,numero:5},v||{}))),e=path.join(BAC,'deux-'+nom,'etat');
      const ver=await lancer(['--vague',d,'--verifier','--etat',e,'--bras',fbras]);
      SC.temoin=lire(path.join(d,'plan.json')).temoin.shaPilote;
      let k=0;SC.modele=t=>{const l=modeleNormal(t);return modif(l,++k,t)||l;};
      const r=await lancer(['--vague',d,'--etat',e,'--bras',fbras]);SC.modele=modeleNormal;
      return {code:ver.code===0?r.code:'verifier '+ver.code,texte:r.texte,d};};
    const c1=await deux('carte',(l,k)=>k===3?Object.assign(l,{mesuree:false,raison:'carte imposee non appliquee (jouee sur nuages)',cartes:['nuages']}):null,{carte:'grotte'});
    const c2=await deux('cartes',(l,k)=>k===5?Object.assign(l,{cartes:['jade','grotte']}):null,{carte:'grotte'});
    const c3=await deux('yeux',(l,k)=>k===2?Object.assign(l,{derniereErreur:'YEUX CHANGES : rayons a,b',erreurs:1}):null);
    const c4=await deux('cerveau',(l,k)=>k===2?Object.assign(l,{derniereErreur:'TypeError',erreurs:3}):null);
    const c5=await deux('nonmesurees',(l,k)=>k<=3?Object.assign(l,{mesuree:false,raison:'2 decision(s) coupee(s) par la limite de temps : pas repetable'}):null);
    const c6=await deux('unenonmesuree',(l,k)=>k===1?Object.assign(l,{mesuree:false,raison:'2 decision(s) coupee(s) par la limite de temps : pas repetable'}):null);
    verdict('b8 : une ligne « carte imposee non appliquee » -> 2 ; une premiere map qui n\'est pas la carte -> 2 ; YEUX CHANGES -> 2 ; une erreur du cerveau -> 2 ; '+
      '3 courses non mesurees sur 16 au 1er regard (> 10 %) -> 2 ; une seule (6 %) -> la vague finit (0)',[c1,c2,c3,c4,c5,c6].map(r=>r.code).join(',')==='2,2,2,2,2,0'&&
      /carte imposee non appliquee/.test(c1.texte)&&/jouee sur jade/.test(c2.texte)&&/YEUX CHANGES/.test(c3.texte)&&/erreur du cerveau/.test(c4.texte)&&/plus de 10 %/.test(c5.texte),
      [c1,c2,c3,c4,c5,c6].map(r=>r.code+' '+r.texte.split('\n').filter(x=>/^banc :/.test(x)).join(' ').slice(0,90)).join(' | '));
    verdict('b8 : la vague arretee en code 2 n\'ecrit pas de resultat.json',[c1,c2,c3,c4,c5].every(r=>!fs.existsSync(path.join(r.d,'resultat.json'))));
    const nm=lire(path.join(c6.d,'resultat.json')).nonMesurees;
    verdict('b8 : la course non mesuree est nommee dans resultat.json',nm.length===1&&/limite de temps/.test(nm[0].raison),JSON.stringify(nm));
  });

  await essai('b9',async()=>{
    const dA=path.join(BAC,'A',vB.nom);
    const r=resA,b0=r&&r.bras.lache;
    const cles=['dPremier','sePremier','biaiseParLArret','candidat','verdict','regard','graines','m','d','se','z','f'];
    verdict('b9 : resultat.json porte, par bras, '+cles.join(', ')+' et secondaires.nonCorrigees',r&&Object.values(r.bras).every(x=>cles.every(k=>k in x)&&x.secondaires&&x.secondaires.nonCorrigees===true),
      r&&JSON.stringify(b0).slice(0,300));
    verdict('b9 : le bras a effet (+60 s) est un « net-aide » tot : candidat, biaise par l\'arret',b0&&b0.verdict==='net-aide'&&b0.candidat===true&&b0.biaiseParLArret===(b0.graines<16),
      b0&&b0.verdict+' au regard '+b0.regard+' sur '+b0.graines);
    const S=b0&&b0.secondaires;
    verdict('b9 : les secondaires : dPalier, dF, dE, f, empreinteVues, compteurs (bras et temoin), sorties qui finissent mal, causes de toutes les morts, survie, cartes, chances',
      S&&['dPalier','se_dPalier','dF','dE','f','partVuesDifferentes','compteurs','sortiesFinissantMal','causesMorts','survie_s','cartes','partChancesPrises'].every(k=>k in S)&&
      S.compteurs.bras.sortieOn&&S.cartes.temoin.nuages>0&&Object.keys(S.causesMorts.bras.morts).length>0,S&&JSON.stringify(S).slice(0,300));
    const j=fs.readFileSync(path.join(dA,'journal.md'),'utf8');
    verdict('b9 : journal.md contient la question, chaque regard (une ligne par bras), les verdicts et le cout',j.indexOf(vB.question)>=0&&regA.regards.every(g=>Object.keys(g.bras).every(n=>
      new RegExp('^\\| '+g.j+' \\| '+g.n+' \\| '+n+' \\| ','m').test(j)))&&/## Les verdicts/.test(j)&&/## Le cout/.test(j));
    const idx=fs.readFileSync(path.join(BAC,'A','INDEX.md'),'utf8');
    const I=Rp.lireIndex(idx);
    verdict('b9 : INDEX.md porte le nombre de vagues conclues et de faux « net » attendus, le numero pris, la ligne de la vague (candidat)',
      /Vagues conclues : 1\. Faux « net » attendus par hasard sur ces vagues : 0,05/.test(idx)&&I.numeros['1'].nom===vB.nom&&I.vagues[vB.nom].statut==='candidat',idx.split('\n').slice(4,6).join(' / '));
    const fin=fs.readFileSync(path.join(dA,'resume.txt'),'utf8');
    verdict('b9 : resume.txt final : une ligne par bras, ce qu\'on peut dire, ce qu\'on ne peut pas dire, le candidat a confirmer',/LA VAGUE EST FINIE/.test(fin)&&/CE QU'ON PEUT DIRE/.test(fin)&&
      /CE QU'ON NE PEUT PAS DIRE/.test(fin)&&/CANDIDAT/.test(fin)&&pjA.bras.every(b=>new RegExp('^'+b.nom+' +\\|','m').test(fin)),'\n'+fin);
    /* --resume redonne le meme texte, sans rien jouer */
    SC.jouees=[];const rr=await lancer(['--vague',dA,'--resume']);
    verdict('b9 : --resume reecrit le meme resume.txt depuis regards.json, sans course',rr.code===0&&SC.jouees.length===0&&fs.readFileSync(path.join(dA,'resume.txt'),'utf8')===fin);
  });

  fs.rmSync(BAC,{recursive:true,force:true});
  const ko=res.filter(r=>!r.ok);
  dire((ko.length?'ECHEC : '+ko.length+' sur '+res.length:'TOUT PASSE : '+res.length+' controles')+' ('+((Date.now()-t0)/1000).toFixed(1)+' s)');
  process.exit(ko.length?1:0);
})().catch(e=>{process.stderr.write(String(e&&e.stack||e)+'\n');process.exit(1);});
