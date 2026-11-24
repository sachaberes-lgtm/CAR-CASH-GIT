#!/usr/bin/env node
/* ===== VERIFIER LE CONTRAT (2026-11-23, etape 1 BOTS-ML ; regle de ml/train : « rien n'est annonce sans avoir ete vu ou mesure ») =====
   Quatre controles, dans le VRAI jeu (ml/reel). A relancer apres chaque mise a jour du jeu, ou du dossier ml/bot.
     1. LES GESTES : chaque geste fait bien, dans le jeu, ce que son nom dit (figure sur la route dans les 4 directions, saut qui decolle,
        figure en vol dans les 4 directions, redressement).
     2. LES DOIGTS : sur une vraie course du bot de reference, aucune touche ne bat plus vite que les limites d'une main (HUMAIN).
     3. MEME GRAINE = MEME COURSE : deux processus neufs, la meme graine → la meme course ET les memes touches.
     4. REGARDER NE CHANGE RIEN : sans l'enregistreur du jeu, ou en ouvrant les yeux a chaque image, la course est la meme.
     5. LE BAC EST FERME (2026-11-24, defauts 1 et 3) : un cerveau qui tente l'horloge, le hasard, process, require, Function par
        constructor.constructor (sur la vue, la memoire, module, console, globalThis), eval, Intl, WeakRef, la pile d'appels… echoue a chaque
        fois (une erreur comptee, un ordre vide) et la course CONTINUE ; le jeu n'est pas touche.
   usage : node verifier.js [--graine 910000] [--tmax 150] [--regime max|allege] [--coeurs 2] [--carte nuages]
           (sortie : results/verifier.json ; code 0 = tout passe)
     --regime   (2026-11-24, defaut 8) le contrat se controle aussi dans la version allegee (les empreintes different d'un regime a l'autre)
     --coeurs   combien de processus a la fois (2 par defaut : le simulateur prend ~650 Mo et un coeur par course)
     --carte    (yeux v2) les controles par carte (6c, 6e, 7, 8) sur cette seule map au lieu des six */
/* ===== LES CONTROLES DES YEUX V2 (2026-11-24, Sacha : « des bots du palier 1 au palier 30 qu'on ne distingue pas de vrais joueurs ») =====
   Le radar (yeux.js) rejoue le vol sur un etat prive, dans le jeu : il ne doit RIEN y changer, couter peu, et dire juste.
     3 bis. LE TEMOIN : la course du controle 3 se compare aussi a une empreinte ECRITE ICI (TEMOIN), relevee avant les yeux v2. Meme jeu
            (jeu_sha) et autre empreinte : RATE — un cerveau qui n'utilise pas le neuf doit conduire exactement comme avant. Autre jeu : on
            previent, le temoin est a refaire (il ne peut pas juger).
     3 ter. LES VUES : l'empreinte du texte de toutes les vues (bilan.empreinteVues) est la meme dans les deux processus : le radar est repetable.
     4 bis. Les yeux ouverts a chaque image, SORTIES DEMANDEES : meme course et memes vues.
     6. LE RADAR NE TOUCHE PAS LE JEU
        6a. sans le radar ({ radar:false } a chaque vue : la vue d'avant) : meme course, memes touches, memes images ;
        6b. aucun tirage du hasard du jeu pendant une vue (l'etat du generateur lu avant et apres chacune) ;
        6c. par carte (nuages, espace, grotte, ville, jade, canyon, et le canyon avec son relief), le voltigeur (voltigeur.js : il ne lit pas le radar), 40 s, deux processus :
            radar coupe / radar a chaque vue ET sorties demandees a chaque image → meme course, memes touches ;
        6d. aucune erreur dans les yeux, aucun nom du jeu manquant ;
        6e. L'ETAT INTACT : un marcheur pose par ce fichier seul (__YEUX_TEMOIN) hache chaque variable de haut niveau du jeu (donnees, tableaux
            types, proprietes des fonctions, place des objets 3D) juste avant et juste apres une vue avec sorties, une fois par seconde des
            courses de 6c. Les noms changes, moins BROUILLONS (les brouillons que les heurts du jeu posent avant de les relire), doivent etre AUCUN ;
        6f. le texte des yeux n'appelle aucune fonction du jeu qui ecrit, et ne tire rien au hasard.
     7. LE COUT : les comptes d'images et de sondes au pire restent sous le budget des yeux et sont les memes dans deux processus (echec dur) ;
        le temps par vue et le poids de la vue sont AFFICHES par carte (l'horloge de l'hote depend de la charge du PC : echec au-dela de 3 ms de
        moyenne sur la course du bot de reference, de 6 ms sur celles du voltigeur, qui vole la moitie du temps).
     8. LA JUSTESSE : le tableau « prevu / arrive » de justesse.js sur les courses de 6c, affiche (les seuils : SEUILS, plus bas). */
const fs=require('fs'),path=require('path'),crypto=require('crypto'),{fork}=require('child_process');
const A=process.argv.slice(2),opt=(n,d)=>{const i=A.indexOf('--'+n);return i>=0?A[i+1]:d;};
const {HUMAIN}=require('./doigts');
const REF=path.join(__dirname,'reference.js'),VOLT=path.join(__dirname,'voltigeur.js');
const sha=x=>crypto.createHash('sha1').update(JSON.stringify(x)).digest('hex').slice(0,12);
/* LE TEMOIN (controle 3 bis) : la course du bot de reference relevee le 24/11/2026 AVANT les yeux v2 (results/verifier.json de ce jour-la) */
const TEMOIN={regime:'max',graine:910000,tmax:150,empreinte:'a7b3171768ca',touches:'6195695442b6',images:9000,jeu_sha:'e7e1eed4718f'};
/* LES BROUILLONS (controle 6e) : ce que les fonctions du jeu appelees par les yeux ecrivent, toujours AVANT de le relire — rien n'en sort.
   V9J : jadeHeurt · CY_H9, CY_O9, T2F, T2P, T2B : canyonHeurt et sa coque du tunnel · CY_VF, CY_VD : la voute · CY_V3O : les toits du canyon ·
   GT_F2 : geantsHeurt · JSP : jadeEnversRefuse (le saut predit de Jade). */
const BROUILLONS=['V9J','CY_H9','CY_O9','T2F','T2P','T2B','CY_VF','CY_VD','CY_V3O','GT_F2','JSP'];
/* LES CARTES DES CONTROLES 6c, 6e, 7, 8. « canyon+relief » : le canyon avec son relief calcule sur place (?cyw=0). Dans ml/reel ce calcul part dans un
   travailleur qui ne repond jamais : le canyon du simulateur n'a ni paroi, ni riviere, ni mur de couloir. Le radar, lui, doit savoir sonder le vrai. */
const CARTES6=[{nom:'nuages',carte:'nuages'},{nom:'espace',carte:'espace'},{nom:'grotte',carte:'grotte'},{nom:'ville',carte:'ville'},{nom:'jade',carte:'jade'},{nom:'canyon',carte:'canyon'},{nom:'canyon+relief',carte:'canyon',requete:'&cyw=0'}];
/* LES SEUILS DE JUSTESSE (controle 8), sur l'ensemble des vols des courses de 6c (juges a partir de 8 vols). MESURE le 24/11/2026 sur 57 vols de
   6 maps (node justesse.js --graines 5) : l'issue est juste 57/57 a la premiere vue du vol et 51/51 une seconde avant sa fin. null = affiche seulement. */
const SEUILS={a_juste:.8,b_juste:.85,min:8};
const INTERDITS=['Math.random','tryLand(','startFall(','airDepasse(','dalleProche(','pcubeFranchi(','banqHeurt(','banqSolVol(','rochesHeurt(','dunesHeurt(','explode(','veqVolant(','veqNiveau(','frameAt(','nuaSautRefuse(','mirTick(','volrSuit(','ligneLat(','murCote(','impPrep('];
/* LE MARCHEUR DU CONTROLE 6e, pose dans le jeu par ce fichier seul (sur le modele de la photo de ml/reel/jeu-reel.js, sans rien remettre) :
   photo() rend une empreinte par nom de haut niveau du jeu ; diff(a,b) les noms dont l'empreinte a change. */
const TEMOIN_CODE=`window.__YEUX_TEMOIN=(function(){
  const F=new Float64Array(1),U=new Uint32Array(F.buffer);
  const exclu=function(x){return x.isMaterial||x.isBufferGeometry||x.isBufferAttribute||x.isTexture||x.isWebGLRenderTarget||x.nodeType||x.style||
    x instanceof Map||x instanceof Set||x instanceof WeakMap||x instanceof WeakSet||(typeof Promise!=='undefined'&&x instanceof Promise)||x===window;};
  let h=0,vus=null;
  const mot=function(w){h=Math.imul(h^w,16777619);};
  const nombre=function(v){F[0]=v;mot(U[0]);mot(U[1]);};
  const texte=function(s){for(let i=0;i<s.length;i++)mot(s.charCodeAt(i));};
  const marche=function(x,prof){
    if(x===null){mot(1);return;}
    const t=typeof x;
    if(t==='number'){nombre(x);return;}if(t==='boolean'){mot(x?3:2);return;}if(t==='string'){mot(4);texte(x);return;}if(t==='undefined'){mot(5);return;}
    if(t==='function'||t==='symbol'){mot(6);return;}
    if(prof>10||vus.has(x)){mot(7);return;}vus.add(x);
    let ex=false;try{ex=!!exclu(x);}catch(e){ex=true;}if(ex){mot(8);return;}
    if(x.isObject3D){try{const p=x.position,q=x.quaternion;nombre(p.x);nombre(p.y);nombre(p.z);nombre(q.x);nombre(q.y);nombre(q.z);nombre(q.w);mot(x.visible?3:2);}catch(e){mot(8);}return;}
    if(ArrayBuffer.isView(x)){if(!x.byteLength||x.byteLength>4e6||x.byteLength%4||x.byteOffset%4){mot(9);mot(x.byteLength|0);if(x.byteLength&&x.byteLength<=4e6){const b=new Uint8Array(x.buffer,x.byteOffset,x.byteLength);for(let i=0;i<b.length;i++)mot(b[i]);}return;}
      const u=new Uint32Array(x.buffer,x.byteOffset,x.byteLength>>2);for(let i=0;i<u.length;i++)mot(u[i]);return;}
    if(Array.isArray(x)){mot(10);mot(x.length);if(x.length>200000)return;for(let i=0;i<x.length;i++)marche(x[i],prof+1);return;}
    let ks;try{ks=Object.keys(x);}catch(e){mot(8);return;}
    mot(11);for(const k of ks){texte(k);let v;try{v=x[k];}catch(e){mot(8);continue;}marche(v,prof+1);}};
  return {
    photo:function(){const N=window.__NOMS,out=new Int32Array(N.length);vus=new Set();
      for(let i=0;i<N.length;i++){let v;h=0x811c9dc5|0;try{v=eval(N[i]);}catch(e){out[i]=-1;continue;}
        if(typeof v==='function'){let ks=[];try{ks=Object.keys(v);}catch(e){}mot(12);for(const k of ks){texte(k);let d;try{d=v[k];}catch(e){mot(8);continue;}marche(d,1);}}
        else try{marche(v,0);}catch(e){mot(13);}
        out[i]=h;}
      vus=null;return out;},
    diff:function(a,b){const N=window.__NOMS,o=[];for(let i=0;i<N.length;i++)if(a[i]!==b[i])o.push(N[i]);return o;}};
})()`;
/* LE TRICHEUR du controle 5 (le texte d'un cerveau : il ne touche aucun fichier) */
const TRICHES=["()=>Date.now()","()=>new Date()","()=>Math.random()","()=>Object.getPrototypeOf(Math).random()","()=>process.pid","()=>require('fs')",
  "v=>v.constructor.constructor('coinsGot=5000')()","(v,m)=>m.constructor.constructor('return process')()","()=>globalThis.constructor.constructor('return process')()",
  "()=>module.constructor.constructor('return process')()","()=>console.log.constructor('return process')()","()=>Function('return process')()","()=>eval('process')",
  "()=>new Intl.DateTimeFormat().format()","()=>new WeakRef({})","()=>(async function(){}).constructor('return process')()",
  "()=>{Error.prepareStackTrace=(e,cs)=>cs;const s=new Error().stack;for(const c of s){const f=c.getFunction&&c.getFunction();if(f)return f.constructor('return process')();}throw new Error('pile fermee');}"];
const NTRICHE=TRICHES.length;
const TRICHEUR='const T=['+TRICHES.join(',')+'];\nmodule.exports={nom:"tricheur",decide(v,m){m.k=(m.k|0)+1;if(m.k<=T.length){const r=T[m.k-1](v,m);return {ligne:0,fuite:m.k+" : "+String(r).slice(0,30)};}return v.mode==="sol"?{ligne:0}:{};}};';

if(A.includes('--enfant')){
  const {ouvrir,charger,course}=require('./piloter'),Y=require('./yeux'),{Doigts}=require('./doigts');
  process.on('message',function(m){
    const J=ouvrir({regime:m.regime,query:m.requete||''});let r;
    if(m.quoi==='course'){
      const x=course(J,charger(REF),m.graine,Object.assign({tmax:m.tmax},m.o||{}));
      r={empreinte:x.bilan.empreinte,touches:sha(x.touches),journal:m.journal?x.touches:undefined,images:x.bilan.images,cause:x.bilan.cause,duree:x.bilan.duree_s,cartes:x.bilan.cartes,
         argent:x.bilan.argent,figures:x.bilan.figures_payees,decisions:x.bilan.decisions,
         vues:x.bilan.empreinteVues,yeux:x.bilan.yeux,tirages:x.bilan.yeuxTirages,jeu_sha:J.sha,budget:Y.budgetDe(J)};
    }else if(m.quoi==='carte'){
      /* (yeux v2, controles 6c, 6e, 7, 8) le voltigeur sur une map imposee : radar coupe, ou radar a chaque vue et sorties a chaque image */
      const C=charger(VOLT);
      if(m.coupe){const x=course(J,C,m.graine,{carte:m.carte,tmax:m.tmax,demande:{radar:false}});
        r={empreinte:x.bilan.empreinte,touches:sha(x.touches),images:x.bilan.images,cause:x.bilan.cause,duree:x.bilan.duree_s,vols:x.bilan.vols};}
      else{
        J.ev(TEMOIN_CODE);const TM=J.g.sandbox.__YEUX_TEMOIN,change={};let photos=0,msPhoto=0;
        const x=require('./justesse').mesure(J,C,{graine:m.graine,carte:m.carte,tmax:m.tmax},course,{yeuxEnPlus:{sorties:true},
          temoin:function(J9){const t0=Date.now(),a=TM.photo();Y.voir(J9,{sorties:true});const b=TM.photo();msPhoto+=Date.now()-t0;photos++;for(const n of TM.diff(a,b))change[n]=(change[n]||0)+1;}});
        r={empreinte:x.bilan.empreinte,touches:x.bilan.touches,images:x.bilan.images,cause:x.bilan.cause,duree:x.bilan.duree,yeux:x.bilan.yeux,tirages:x.bilan.tirages,xReel:x.bilan.xReel,
           justesse:x.vols,temoin:{photos:photos,ms:photos?Math.round(msPhoto/photos):0,change:change},budget:Y.budgetDe(J)};}
    }else if(m.quoi==='bac'){
      /* LE TRICHEUR : une tentative par decision (une erreur attendue chacune), puis il conduit tout droit. Une tentative qui REUSSIT rend
         { fuite } : on la lit dans la trace. Il essaie aussi d'ecrire dans le jeu (coinsGot=5000) : les pieces de fin le diraient. */
      const x=course(J,charger('tricheur.js',{source:TRICHEUR}),m.graine,{tmax:m.tmax,trace:true});
      r={erreurs:x.bilan.erreurs,pannes:x.bilan.pannes,decisions:x.bilan.decisions,images:x.bilan.images,cause:x.bilan.cause,duree:x.bilan.duree_s,pieces:x.bilan.pieces,
         tentatives:NTRICHE,fuites:x.vues.filter(v=>v.ordre&&v.ordre.fuite!=null).map(v=>v.ordre.fuite),derniere:x.bilan.derniereErreur};
    }else r=gestes(J,Y,Doigts);
    process.send(r,function(){process.exit(0);});
  });
  /* LES GESTES, un par un, sur une droite des nuages : on lit dans le jeu ce qui est parti */
  function gestes(J,Y,Doigts){
    const q=e=>{try{return J.ev(e);}catch(x){return null;}},out=[];
    const essai=function(nom,attendu,script){
      J.lancer(920000,{carte:'nuages'});const D=new Doigts(J,()=>Y.modeDe(J)),vu={route:null,vol:false,enVol:[],redresse:q('FX2.redresse')|0,etat:{}};
      for(let fr=0;fr<60*9;fr++){
        if(fr%HUMAIN.decision===0){const v=Y.voir(J);if(v.fini)break;v.image=fr;v.t=fr/60;D.ordre(script(v,fr,vu.etat)||{},v);}
        D.image();J.image();
        const m=Y.modeDe(J);
        if(m==='bond'&&!vu.route)vu.route=q('FR.f?FR.f.id+"/"+(FR.f.sens||""):null');
        if(m==='vol'){vu.vol=true;const L=q('FX2.corps.figs.filter(function(r){return !r.paye;}).map(function(r){return r.f.id+"/"+(r.f.sens||"");}).join(",")');
          if(L)for(const x of L.split(','))if(vu.enVol.indexOf(x)<0)vu.enVol.push(x);}
      }
      vu.redresse=(q('FX2.redresse')|0)-vu.redresse;
      const ok=attendu(vu);out.push({geste:nom,ok:!!ok,vu:{route:vu.route,vol:vu.vol,enVol:vu.enVol,redresse:vu.redresse}});
    };
    const droit=v=>v.mode==='sol'?{ligne:0}:{};
    const FIG={avant:'salto/avant',arriere:'salto/arriere',gauche:'tailwhip/',droite:'tailwhip/'};
    for(const d of Object.keys(FIG))
      essai('figure sur la route · '+d,vu=>vu.route===FIG[d]&&!vu.vol,(v,fr)=>fr===240?Object.assign(droit(v),{geste:'figure',direction:d}):droit(v));
    essai('saut',vu=>vu.vol,(v,fr)=>fr===240?{ligne:0,geste:'saut',direction:'avant'}:droit(v));
    /* en vol : le manche tire (↓) rallonge le petit saut du test, sinon une 2e figure n'a pas le temps de partir (le jeu la refuse) */
    for(const d of Object.keys(FIG))
      essai('figure en vol · '+d,vu=>vu.vol&&vu.enVol.indexOf(FIG[d])>=0,(v,fr,e)=>{
        if(fr===240)return {ligne:0,geste:'saut',direction:d==='gauche'||d==='droite'?'avant':'gauche'}; /* le saut part avec une AUTRE figure que celle qu'on teste */
        if(v.mode==='vol'){if(!e.f&&v.vol.t>.6){e.f=1;return {geste:'figure',direction:d};}return e.f?{}:{manche:1};}
        return droit(v);});
    essai('redresser',vu=>vu.vol&&vu.redresse>=1,(v,fr,e)=>{
      if(fr===240)return {ligne:0,geste:'saut',direction:'avant'};
      if(v.mode==='vol'){if(!e.f&&v.vol.t>.5){e.f=1;return {geste:'figure',direction:'avant'};}if(e.f===1&&v.vol.figure&&v.vol.t>1.05){e.f=2;return {geste:'redresser'};}return e.f?{}:{manche:1};}
      return droit(v);});
    return {gestes:out};
  }
  return;
}

const G=+opt('graine',910000),TMAX=+opt('tmax',150),REGIME=opt('regime','max')==='allege'?'allege':'max',K=Math.max(1,+opt('coeurs',2)||2);
const CARTES=opt('carte',null)?CARTES6.filter(c=>c.nom===String(opt('carte'))||c.carte===String(opt('carte'))):CARTES6;
/* un processus neuf par controle, K a la fois au plus */
let actifs=0;const attente=[];
const enfant=m=>new Promise(res=>{const go=()=>{actifs++;const c=fork(__filename,['--enfant'],{silent:true});let r=null;c.on('message',x=>{r=x;});
  c.on('exit',()=>{actifs--;res(r);if(attente.length)attente.shift()();});c.send(Object.assign({regime:REGIME},m));};
  if(actifs<K)go();else attente.push(go);});
/* LES LIMITES D'UNE MAIN, lues dans le journal des touches d'une vraie course */
function mains(T){
  const par={},pb=[];let nApp=0,court=1e9,repos=1e9;
  for(const [i,k,bas] of T){const s=par[k]||(par[k]={bas:false,depuis:-1e9,debuts:[]});
    if(bas){if(s.bas)pb.push(k+' enfoncee deux fois');const r=i-s.depuis;if(s.depuis>-1e9){if(r<repos)repos=r;if(r<HUMAIN.repos)pb.push(`${k} reprise apres ${r} images (image ${i})`);}s.debuts.push(i);nApp++;}
    else{const d=i-s.depuis;if(d<court)court=d;if(d<HUMAIN.appui)pb.push(`${k} tenue ${d} images (image ${i})`);}
    s.bas=!!bas;s.depuis=i;}
  /* la cadence la plus vive : le plus d'appuis d'une meme touche dans une seconde */
  let cadence=0;for(const k in par){const D=par[k].debuts;for(let a=0,b=0;b<D.length;b++){while(D[b]-D[a]>=60)a++;cadence=Math.max(cadence,b-a+1);}}
  return {appuis:nApp,appuiLePlusCourt_images:court,reposLePlusCourt_images:repos,appuisParSecondeMax:cadence,problemes:pb.slice(0,8),ok:pb.length===0&&cadence<=Math.ceil(60/(HUMAIN.appui+HUMAIN.repos))};
}
(async function(){
  const t0=Date.now(),NP9=7+2*CARTES.length;
  console.log(`controle du contrat · graine ${G} · ${TMAX} s · regime ${REGIME} · ${NP9} processus neufs, ${K} a la fois…`);
  const [g,a,b,sansRec,yeux,bac,sansRadar,...parCarte]=await Promise.all([
    enfant({quoi:'gestes'}),
    enfant({quoi:'course',graine:G,tmax:TMAX,journal:true}),
    enfant({quoi:'course',graine:G,tmax:TMAX}),
    enfant({quoi:'course',graine:G,tmax:TMAX,o:{sansEnregistreur:true}}),
    enfant({quoi:'course',graine:G,tmax:TMAX,o:{yeuxEnPlus:{sorties:true}}}),
    enfant({quoi:'bac',graine:G,tmax:40}),
    enfant({quoi:'course',graine:G,tmax:TMAX,o:{demande:{radar:false}}}),
    ...[].concat(...CARTES.map(c=>[enfant({quoi:'carte',carte:c.carte,requete:c.requete,graine:G,tmax:40,coupe:true}),enfant({quoi:'carte',carte:c.carte,requete:c.requete,graine:G,tmax:40})]))]);
  const R={date:new Date().toISOString(),graine:G,tmax:TMAX,regime:REGIME,humain:HUMAIN};let tout=true;
  const dit=(ok,txt)=>{if(!ok)tout=false;console.log((ok?'  OK   ':'  RATE ')+txt);};
  console.log('\n1. LES GESTES dans le jeu');
  if(!g||!g.gestes){dit(false,'le processus des gestes n\'a rien rendu');R.gestes=null;}
  else{R.gestes=g.gestes;for(const x of g.gestes)dit(x.ok,x.geste+' → '+(x.vu.route?'sur la route : '+x.vu.route+' ':'')+(x.vu.vol?'· a decolle ':'')+(x.vu.enVol.length?'· en vol : '+x.vu.enVol.join(', ')+' ':'')+(x.vu.redresse?'· redressee':''));}
  console.log('\n2. LES DOIGTS (une main ne va pas plus vite)');
  if(!a){dit(false,'la course n\'a rien rendu');}
  else{const m=mains(a.journal);R.doigts=m;R.course={cartes:a.cartes,duree:a.duree,cause:a.cause,argent:a.argent,figures:a.figures,decisions:a.decisions};
    dit(m.ok,`${m.appuis} appuis en ${a.duree} s (${a.cartes.join(' > ')}) · le plus court ${m.appuiLePlusCourt_images} images (limite ${HUMAIN.appui}) · repos le plus court ${m.reposLePlusCourt_images} (limite ${HUMAIN.repos}) · au plus ${m.appuisParSecondeMax} appuis par seconde sur une touche`);
    for(const p of m.problemes)console.log('         '+p);
    dit(a.decisions<=Math.ceil(a.images/HUMAIN.decision)+1,`${a.decisions} decisions pour ${a.images} images : ${(a.decisions/(a.images/60)).toFixed(1)} par seconde`);}
  console.log('\n3. MEME GRAINE = MEME COURSE (deux processus neufs)');
  const meme=(x,y)=>!!(x&&y&&x.empreinte===y.empreinte&&x.touches===y.touches&&x.images===y.images);
  R.repetable={a:a&&{empreinte:a.empreinte,touches:a.touches,images:a.images},b:b&&{empreinte:b.empreinte,touches:b.touches,images:b.images},ok:meme(a,b)};
  dit(R.repetable.ok,a&&b?`course ${a.empreinte} / ${b.empreinte} · touches ${a.touches} / ${b.touches} · ${a.images} / ${b.images} images`:'une des deux courses n\'a rien rendu');
  /* 3 bis. le temoin ecrit */
  {const T=TEMOIN,juge=REGIME===T.regime&&G===T.graine&&TMAX===T.tmax;R.temoin={juge:juge,jeu_sha:a?a.jeu_sha:null,attendu:T};
    if(!juge)console.log(`  ·    le temoin (graine ${T.graine}, ${T.tmax} s, regime ${T.regime}) ne juge pas ces reglages`);
    else if(!a)dit(false,'le temoin : pas de course');
    else if(a.jeu_sha!==T.jeu_sha){R.temoin.ok=null;console.log(`  ⚠    LE TEMOIN EST A REFAIRE : le jeu a change (${a.jeu_sha}, le temoin est du jeu ${T.jeu_sha}) — l'empreinte ${a.empreinte} ne peut plus se comparer a ${T.empreinte}`);}
    else{R.temoin.ok=a.empreinte===T.empreinte&&a.touches===T.touches&&a.images===T.images;
      dit(R.temoin.ok,`le temoin d'avant les yeux v2 (jeu ${T.jeu_sha}) : course ${a.empreinte} (attendu ${T.empreinte}) · touches ${a.touches} (${T.touches}) · ${a.images} images (${T.images})`);}}
  /* 3 ter. les vues */
  R.vues={a:a&&a.vues,b:b&&b.vues,ok:!!(a&&b&&a.vues&&a.vues===b.vues)};
  dit(R.vues.ok,`les vues (le radar est repetable) : ${a?a.vues:'rien'} / ${b?b.vues:'rien'}`);
  console.log('\n4. REGARDER NE CHANGE RIEN');
  R.sansEnregistreur={ok:meme(a,sansRec)};dit(R.sansEnregistreur.ok,'sans l\'enregistreur du jeu : '+(sansRec?sansRec.empreinte:'rien'));
  R.yeuxEnPlus={ok:meme(a,yeux)&&!!(a&&yeux&&a.vues===yeux.vues)};dit(R.yeuxEnPlus.ok,'les yeux ouverts a chaque image, sorties demandees : course '+(yeux?yeux.empreinte:'rien')+' · vues '+(yeux?yeux.vues:'rien'));
  console.log('\n5. LE BAC EST FERME (un cerveau qui triche)');
  if(!bac){dit(false,'la course du tricheur n\'a rien rendu');R.bac=null;}
  else{R.bac=bac;
    dit(bac.fuites.length===0,bac.fuites.length?'des tentatives ont REUSSI : '+bac.fuites.join(', '):`${bac.tentatives} tentatives (horloge, hasard, process, require, Function, eval, Intl, WeakRef, pile d'appels), aucune ne passe`);
    dit(bac.erreurs===bac.tentatives&&bac.pannes===0,`${bac.erreurs} erreurs comptees pour ${bac.tentatives} tentatives, ${bac.pannes} panne`);
    dit(bac.decisions>bac.tentatives+50,`la course continue : ${bac.decisions} decisions, ${bac.duree} s, fin « ${bac.cause} »`);
    dit(bac.pieces<5000,`le jeu n'est pas touche : ${bac.pieces} pieces a la fin (le tricheur en voulait 5000)`);}
  /* ===== 6. LE RADAR NE TOUCHE PAS LE JEU ===== */
  console.log('\n6. LE RADAR NE TOUCHE PAS LE JEU (yeux v2)');
  const P6=CARTES.map((c,i)=>({carte:c.nom,hors:!!c.requete,coupe:parCarte[2*i],plein:parCarte[2*i+1]}));
  R.radar={};
  R.radar.sansRadar={ok:meme(a,sansRadar)};dit(R.radar.sansRadar.ok,'6a. sans le radar (la vue d\'avant a chaque decision) : '+(sansRadar?sansRadar.empreinte+' · touches '+sansRadar.touches+' · '+sansRadar.images+' images':'rien'));
  {const C6=[['a',a],['b',b],['yeux ouverts',yeux]].concat(P6.map(p=>[p.carte,p.plein])),nuls=C6.filter(x=>!x[1]||x[1].tirages==null),tires=C6.filter(x=>x[1]&&x[1].tirages>0);
    R.radar.tirages={ok:!nuls.length&&!tires.length,courses:C6.length};
    dit(R.radar.tirages.ok,'6b. aucun tirage du hasard du jeu pendant une vue, sur '+C6.length+' courses'+(tires.length?' — TIRAGES : '+tires.map(x=>x[0]+' '+x[1].tirages).join(', '):'')+(nuls.length?' — pas de mesure : '+nuls.map(x=>x[0]).join(', '):''));}
  R.radar.cartes={};
  for(const p of P6){const ok=meme(p.coupe,p.plein);R.radar.cartes[p.carte]={ok:ok,coupe:p.coupe&&{empreinte:p.coupe.empreinte,touches:p.coupe.touches,images:p.coupe.images},plein:p.plein&&{empreinte:p.plein.empreinte,touches:p.plein.touches,images:p.plein.images}};
    dit(ok,`6c. ${p.carte.padEnd(13)} radar coupe / radar et sorties a chaque image : `+(p.coupe&&p.plein?`${p.coupe.empreinte} / ${p.plein.empreinte} · touches ${p.coupe.touches} / ${p.plein.touches} · ${p.coupe.images} / ${p.plein.images} images (${p.plein.duree} s, fin « ${p.plein.cause} », ${p.coupe.vols} vol(s))`:'une des deux courses n\'a rien rendu'));}
  {const C6=[['a',a],['yeux ouverts',yeux]].concat(P6.map(p=>[p.carte,p.plein])),err=C6.filter(x=>!x[1]||!x[1].yeux||x[1].yeux.erreurs>0),mq=C6.filter(x=>x[1]&&x[1].yeux&&x[1].yeux.manque&&x[1].yeux.manque.length);
    R.radar.erreurs={ok:!err.length&&!mq.length};
    dit(R.radar.erreurs.ok,'6d. aucune erreur dans les yeux, aucun nom du jeu manquant'+(err.length?' — ERREURS : '+err.map(x=>x[0]+' '+(x[1]&&x[1].yeux?x[1].yeux.erreurs:'?')).join(', '):'')+(mq.length?' — MANQUE : '+mq[0][1].yeux.manque.join(' '):''));}
  {const tous={},vus={};let photos=0,ms=0,n=0;
    for(const p of P6){const T=p.plein&&p.plein.temoin;if(!T)continue;photos+=T.photos;ms+=T.ms;n++;for(const k in T.change){if(BROUILLONS.indexOf(k)>=0)vus[k]=(vus[k]||0)+T.change[k];else(tous[k]=tous[k]||[]).push(p.carte+' x'+T.change[k]);}}
    const noms=Object.keys(tous);R.radar.etat={ok:photos>0&&!noms.length,photos:photos,ms_par_controle:n?Math.round(ms/n):null,changes:tous,brouillons:vus};
    dit(R.radar.etat.ok,`6e. l'etat du jeu intact : ${photos} controles (une vue avec sorties entre deux photos de toutes les variables du jeu)`+(noms.length?' — CHANGE : '+noms.map(k=>k+' ('+tous[k].join(', ')+')').join(' ; '):' — rien ne change')+(Object.keys(vus).length?' · brouillons vus : '+Object.keys(vus).join(' '):''));}
  {const txt=require('./yeux').YEUX_CODE,pris=INTERDITS.filter(x=>txt.indexOf(x)>=0);R.radar.texte={ok:!pris.length,interdits:pris};
    dit(!pris.length,'6f. le texte des yeux n\'appelle aucune fonction du jeu qui ecrit et ne tire rien au hasard'+(pris.length?' — TROUVE : '+pris.join(' '):` (${INTERDITS.length} noms cherches)`));}
  /* ===== 7. LE COUT ===== */
  console.log('\n7. LE COUT DES YEUX');
  {const B=(a&&a.budget)||{},ya=a&&a.yeux,yb=b&&b.yeux;
    const ok=!!(ya&&yb&&ya.pas_max<=B.vol&&ya.sondes_max<=B.sondes&&ya.route_max<=B.route&&ya.pas_max===yb.pas_max&&ya.sondes_max===yb.sondes_max&&ya.octets_moy===yb.octets_moy);
    R.cout={budget:B,a:ya,b:yb,ok:ok,cartes:{}};
    dit(ok,ya&&yb?`les comptes au pire sous le budget, et les memes dans deux processus : ${ya.pas_max} / ${yb.pas_max} images de vol (budget ${B.vol}) · ${ya.sondes_max} / ${yb.sondes_max} sondes (${B.sondes}) · ${ya.route_max} / ${yb.route_max} images de route (${B.route}) · ${ya.octets_moy} / ${yb.octets_moy} caracteres par vue`:'pas de mesure');
    if(ya)console.log(`  ·    ${(a.cartes||[]).join(' > ').padEnd(24)} ${ya.ms_moy} ms par vue (sol ${ya.ms_sol_moy}, vol ${ya.ms_vol_moy}, pire ${ya.ms_max}) · ${ya.vues_vol} vues en vol sur ${ya.vues_sol+ya.vues_vol} · sans le radar : ${sansRadar&&sansRadar.yeux?sansRadar.yeux.ms_moy:'?'} ms`);
    let lourd=ya&&ya.ms_moy>3?['course du controle 3']:[];
    for(const p of P6){const y=p.plein&&p.plein.yeux;if(!y)continue;R.cout.cartes[p.carte]=y;
      const okC=y.pas_max<=B.vol&&y.sondes_max<=B.sondes&&y.route_max<=B.route;if(!okC)dit(false,`${p.carte} : le budget est depasse (${y.pas_max} images, ${y.sondes_max} sondes, ${y.route_max} images de route)`);
      if(y.ms_moy>6&&!p.hors)lourd.push(p.carte); /* 6 ms : le voltigeur vole la moitie du temps (un joueur : 29 %, le bot de reference : 5 a 10 %), et MESURE le 24/11 la map la plus chere (jade) est a 2,7 ms sur un PC charge par ailleurs ; le canyon avec relief n'est pas le simulateur d'aujourd'hui : affiche, pas juge */
      console.log(`  ·    ${p.carte.padEnd(24)} ${y.ms_moy} ms par vue (sol ${y.ms_sol_moy}, vol ${y.ms_vol_moy}, pire ${y.ms_max}) · ${y.vues_vol} vues en vol sur ${y.vues_sol+y.vues_vol} · au pire ${y.pas_max} images, ${y.sondes_max} sondes · ${y.octets_moy} caracteres par vue${p.hors?' · (hors du simulateur : pas juge)':''}`);}
    R.cout.lourd=lourd;dit(!lourd.length,lourd.length?'trop cher par vue en moyenne (3 ms pour la course du controle 3, 6 ms pour celles du voltigeur) : '+lourd.join(', '):'moins de 3 ms par vue en moyenne sur la course du controle 3, moins de 6 sur celles du voltigeur (l\'horloge de l\'hote : elle depend de la charge du PC)');}
  /* ===== 8. LA JUSTESSE ===== */
  console.log('\n8. LA JUSTESSE DU RADAR (le voltigeur, 40 s par carte ; le tableau complet : node justesse.js)');
  {const JU=require('./justesse'),tous=[].concat(...P6.map(p=>(p.plein&&p.plein.justesse)||[]));R.justesse={vols:tous.length,cartes:{}};
    for(const p of P6){const V=(p.plein&&p.plein.justesse)||[],ta=JU.tableau(V,'a'),tb=JU.tableau(V,'b');R.justesse.cartes[p.carte]={vols:V.length,a:ta,b:tb};
      console.log(`  ·    ${p.carte.padEnd(13)} ${String(V.length).padStart(2)} vol(s) · issue juste a la premiere vue ${ta.justes}/${ta.n} · 1 s avant la fin ${tb.justes}/${tb.n}`+(tb.chocs?` · chocs non prevus ${tb.chocsNonPrevus.length}/${tb.chocs}`:''));}
    const ta=JU.tableau(tous,'a'),tb=JU.tableau(tous,'b');R.justesse.a=ta;R.justesse.b=tb;
    JU.ecrit('(a) a la premiere vue du vol',ta);JU.ecrit('(b) a la derniere vue, 1 s au moins avant la fin',tb);
    const pa=ta.n?ta.justes/ta.n:null,pb=tb.n?tb.justes/tb.n:null;
    if(SEUILS.a_juste!=null&&ta.n>=SEUILS.min)dit(pa!=null&&pa>=SEUILS.a_juste,`issue juste a la premiere vue : ${ta.justes}/${ta.n} (seuil ${Math.round(100*SEUILS.a_juste)} %)`);
    if(SEUILS.b_juste!=null&&tb.n>=SEUILS.min)dit(pb!=null&&pb>=SEUILS.b_juste,`issue juste 1 s avant la fin : ${tb.justes}/${tb.n} (seuil ${Math.round(100*SEUILS.b_juste)} %)`);
    if(ta.n<SEUILS.min||tb.n<SEUILS.min)console.log('  ·    (moins de '+SEUILS.min+' vols : affiche seulement)');}
  R.ok=tout;
  fs.mkdirSync(path.join(__dirname,'results'),{recursive:true});
  if(a)delete a.journal;
  fs.writeFileSync(path.join(__dirname,'results','verifier.json'),JSON.stringify(R,null,1));
  console.log('\n'+(tout?'TOUT PASSE':'DES CONTROLES RATENT')+' · '+Math.round((Date.now()-t0)/1000)+' s · results/verifier.json');
  process.exit(tout?0:1);
})();
