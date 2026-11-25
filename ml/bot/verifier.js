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
        6c. par carte (nuages, espace, grotte, ville, jade, canyon — avec son relief depuis le 25/11), le voltigeur (voltigeur.js : il ne lit pas le radar), 40 s, deux processus :
            radar coupe / radar a chaque vue ET sorties demandees a chaque image → meme course, memes touches ;
            (2026-11-25) et sur chacune : le decor qui tue de la map est allume (DECOR_DUR), aucun travailleur du jeu n'a de message sans reponse hors
            du decor permis (TRAVAILLEURS_PERMIS) ;
        6d. aucune erreur dans les yeux, aucun nom du jeu manquant ;
        6e. L'ETAT INTACT : un marcheur pose par ce fichier seul (__YEUX_TEMOIN) hache chaque variable de haut niveau du jeu (donnees, tableaux
            types, proprietes des fonctions, place des objets 3D) juste avant et juste apres une vue avec sorties, une fois par seconde des
            courses de 6c. Les noms changes, moins BROUILLONS (les brouillons que les heurts du jeu posent avant de les relire), doivent etre AUCUN ;
        6f. le texte des yeux n'appelle aucune fonction du jeu qui ecrit, et ne tire rien au hasard.
     7. LE COUT : les comptes d'images et de sondes au pire restent sous le budget des yeux et sont les memes dans deux processus (echec dur) ;
        le temps par vue et le poids de la vue sont AFFICHES par carte (l'horloge de l'hote depend de la charge du PC : echec au-dela de 3 ms de
        moyenne sur la course du bot de reference, de 6 ms sur celles du voltigeur, qui vole la moitie du temps ; le canyon avec son relief, depuis le
        25/11, est juge pareil, et la part des yeux dans le temps de chaque course est affichee).
     8. LA JUSTESSE : le tableau « prevu / arrive » de justesse.js sur les courses de 6c, affiche (les seuils : SEUILS, plus bas). */
/* ===== LES CONTROLES DES DOIGTS V2 (2026-11-24, Sacha : « des bots du palier 1 au palier 30 qu'on ne distingue pas de vrais joueurs ») =====
   Un cerveau peut regler sa main par un `profil` (doigts.js). Sans profil RIEN ne change : c'est le controle 3 bis (le temoin) qui le dit.
     9.  LA MAIN, SANS LE JEU (dans ce processus, instantane)
         9a. le profil vide et le profil au defaut ecrit en entier valent « pas de profil » ; un cerveau charge avec `profil:{}` n'en a pas ;
         9b. le hasard a graine rend les trois nombres ecrits ici ; une loi tiree est croissante ;
         9c. un profil qui triche est ramene aux planchers ; un champ inconnu ou un mauvais type : refuses, par normaliserProfil et par charger ;
         9d. le texte des doigts n'a ni le hasard ni l'horloge de l'hote ;
         9e. la main seule (profil clavier, volant 0,36 pendant une minute) : 90 a 150 coups par minute (relecture : les coups du modele sont plus courts, 0,13 s en mediane ; a 36 % de braquage cela fait 130 a 135 appuis par minute — les joueurs : 105 appuis par minute de sol pour 33 % du sol braque), braquage 0,31 a 0,41, des durees
             variees (la plus frequente sous 40 %, 6 durees au moins), les limites d'une main tenues, meme graine = memes touches.
         (2026-11-25, relecture de la main : un controle par defaut corrige, sans le jeu)
         9c (suite). le suivi actif lit l'etat vieux de 6 images au moins (retard nul ou 91 ms : ramenes a 6) ; un infini est refuse ;
         9f. aucun coup a contresens (volant 0,09 / 0,12 / 0,2 : aucun appui a droite, le braquage demande) ; un volant lache a 0 ne donne plus de coup ;
         9g. la NITRO hachee et les gestes : le detecteur du double appui du jeu, rejoue sur le journal, ne lit chaque figure et chaque saut qu'a son
             2e appui (aucun geste ouvert sur un tapotement) ;
         9h. erreur.parasite donne le nombre d'embardees par minute demande (a 15 % pres) ;
         9i. les deux horloges du repos (la fleche d'en face n'attend que coups.inversion, jamais moins) ; la fin du drift (↓ lache avant la
             fleche) et l'avance de la fleche sur ↓, tiree a chaque drift ;
         9j. `ensuite` : la fleche du vol lachee 6 a 12 images apres la pose ; la vue de la main (etatMain) se lit.
     10. LA MAIN V2 SANS EFFET = LA MAIN D'AVANT : le bot de reference avec un profil qui fait passer toute la course par le chemin neuf sans rien
         y changer ({chance:{prend:1}} : si la course finit « temps », la chance ne joue pas) → la course, les touches et les vues du controle 3.
     11. UNE MAIN HUMAINE (profil clavier, 60 s) : (a) deux processus, meme course et memes touches ; (b) les limites d'une main ; (c) le rejeu
         de son journal dans un processus neuf redonne la course ; (d) une autre graine du profil = d'autres touches ; (e) des appuis varies.
     12. LA SECONDE CHANCE (CHANCE9 : la graine 910407, 90 s — en regime max le bot de reference y meurt a 39,9 s) : un seul toucher de la
         plaque, 36 a 330 images apres son apparition, et (relecture du 25/11) LU DANS LE JEU a l'image du toucher : l'ecran de mort la depuis
         600 ms au moins et l'offre ouverte (avant, la borne comparait la main a elle-meme) ; une reprise, un palier plus bas ; la course
         continue ; le rejeu du journal redonne la meme course et le meme argent ; et une main v2 qui ne prend pas la chance meurt exactement
         comme la main d'avant.
     13. LE DRIFT (un cerveau de quatre lignes, sur une droite des nuages : `drift:+1` pendant une demi-seconde) : le jeu drifte (vue.drift),
         ↓ part deux images apres la fleche, ↓ n'est jamais tenu sans fleche, et la fleche ne se relache pas avant ↓ ; sans profil, l'ordre
         n'est pas lu (aucun ↓ au journal) et le bilan le dit.
     14. (2026-11-25, relecture des outils) LES OUTILS DE LA BOUCLE, sans l'API : (a) lecture.js lit une reponse ecrite a peine autrement que la
         forme demandee (« **Raison** : », ```JavaScript, retours chariot, un extrait avant le fichier, exports.decide) et refuse une reponse sans
         raison ; (b) un pilote refuse dit POURQUOI (le champ fautif du profil, « SyntaxError », « null »), et la main lue est l'empreinte du profil ;
         (c) la ligne de journal de la course du controle 12 garde la mort reprise par la seconde chance, et sa fin ne dit « en vol » d'apres la
         vieille mort que si la course finit par une mort. */
/* ===== LES CONTROLES DE LA RELECTURE DES YEUX V2 (2026-11-25, Sacha : « des bots du palier 1 au palier 30 qu'on ne distingue pas de vrais joueurs ») =====
   Un controle par defaut corrige qui pouvait revenir en silence. Les comptes viennent des courses de 6c (justesse.js, mesure.controles).
     6g. LA LOI « versRoute » TETE EN BAS : la caisse lachee par le banc du jeu (dbgLache) a 14 m a gauche de l'axe au-dessus de la ville, a
         l'endroit puis tete en bas : `vol.proche.envers` le dit, et dans les deux cas le rayon versRoute finit plus pres de l'axe qu'au depart
         (avant : tete en bas il finissait au bord, a 27,9 m) ; le voltigeur retourne sa loi lui aussi (son texte lit `envers`).
     7 (suite). le budget d'une vue avec sorties demandees est celui de la demande (2 900 images), pas celui du vol.
     8 bis. LE DECOR SONDE A CHAQUE IMAGE (hors canyon) : la maille du radar vaut la distance volee en une image (c'etait deux a la grotte et a la jade) ;
     8 ter. LE SAUT : un saut que les yeux prevoient DECOLLE (aucun « prevu sans decollage »), un saut dit refuse ne decolle pas, et il decolle a
            l'image annoncee (ecart median nul) ;
     8 quater. « latC » (pieces, fruits, orbes) vaut « lat » au-dessus de la dalle et son oppose dessous, sur chaque objet de chaque vue au sol
            (le nombre d'objets vus SOUS la dalle est affiche : a zero, le retournement n'est pas exerce). */
const fs=require('fs'),path=require('path'),crypto=require('crypto'),{fork}=require('child_process');
const A=process.argv.slice(2),opt=(n,d)=>{const i=A.indexOf('--'+n);return i>=0?A[i+1]:d;};
const {HUMAIN,Doigts:Doigts9,normaliserProfil,hasard,graineDe,tirer}=require('./doigts');
const REF=path.join(__dirname,'reference.js'),VOLT=path.join(__dirname,'voltigeur.js');
const sha=x=>crypto.createHash('sha1').update(JSON.stringify(x)).digest('hex').slice(0,12);
/* LE TEMOIN (controle 3 bis) : la course du bot de reference relevee le 24/11/2026 AVANT les yeux v2 (results/verifier.json de ce jour-la) */
const TEMOIN={regime:'max',graine:910000,tmax:150,empreinte:'a7b3171768ca',touches:'6195695442b6',images:9000,jeu_sha:'e7e1eed4718f'};
/* LES BROUILLONS (controle 6e) : ce que les fonctions du jeu appelees par les yeux ecrivent, toujours AVANT de le relire — rien n'en sort.
   V9J : jadeHeurt · CY_H9, CY_O9, T2F, T2P, T2B : canyonHeurt et sa coque du tunnel · CY_VF, CY_VD : la voute · CY_V3O : les toits du canyon ·
   GT_F2 : geantsHeurt · JSP : jadeEnversRefuse (le saut predit de Jade). */
const BROUILLONS=['V9J','CY_H9','CY_O9','T2F','T2P','T2B','CY_VF','CY_VD','CY_V3O','GT_F2','JSP'];
/* LES CARTES DES CONTROLES 6c, 6e, 7, 8. (2026-11-25, simulateur fidele) Le canyon du simulateur a desormais son relief (ml/reel/jeu-reel.js : cyw=0
   dans REQUETE) : l'entree « canyon+relief » (?cyw=0 en plus) est retiree, la carte « canyon » EST le canyon avec son relief, jugee comme les autres. */
const CARTES6=[{nom:'nuages',carte:'nuages'},{nom:'espace',carte:'espace'},{nom:'grotte',carte:'grotte'},{nom:'ville',carte:'ville'},{nom:'jade',carte:'jade'},{nom:'canyon',carte:'canyon'}];
/* ===== LE DECOR DUR ALLUME, LES TRAVAILLEURS MUETS (2026-11-25, relecture du simulateur, trouvaille simulateur-4) — controle 6c (suite) =====
   Sur chaque course par carte : a une vue au moins, le decor qui TUE de la map est allume dans le jeu (DECOR_DUR : canyon CY.on, jade JADE.col, ville
   CITY.col, grotte GROTTE.root ; nuages et espace n'en ont pas a exiger) ; et aucun travailleur du jeu n'a de message reste sans reponse, sauf ceux
   de TRAVAILLEURS_PERMIS (du decor, sans regle : le modele des nuages, le ciel reflete sur la carrosserie). Une mise a jour du jeu qui deplace un
   calcul dans un travailleur casse ce controle au lieu de fausser les notes. */
const DECOR_DUR={canyon:'CY.on',jade:'JADE.col',ville:'CITY.col',grotte:'GROTTE.root'};
const TRAVAILLEURS_PERMIS=[/^cotonOuvrier\b/,/^envOuvrier\b/];
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
/* LES PROFILS DES CONTROLES 10 A 12 (ajoutes au texte du bot de reference : `module.exports.profil=…`), et la course de la seconde chance */
const PROFILS9={neutre:{chance:{prend:1}},clavier1:{modele:'clavier',graine:1},clavier2:{modele:'clavier',graine:2},chance:{chance:{prend:1,delai:800}},jamais:{chance:{prend:1,palierMin:30}}};
const CHANCE9={graine:910407,tmax:90};
/* (relecture, controle 9g) la main clavier avec la nitro hachee d'avant le reglage (des tenues de 0,1 a 3 s) : beaucoup de tapotements, le cas difficile */
const PROFIL9G={modele:'clavier',graine:1,nitro:{tenue:[100,400,3000],pause:[130,220,500]}};
/* LE DRIFTEUR du controle 13 (le texte d'un cerveau) : tout droit, la NITRO 5 s, puis un drift a gauche de 6 s a 6,5 s */
const DRIFTEUR=p=>"module.exports={nom:'drifteur',"+(p?"profil:"+JSON.stringify(p)+",":"")+"decide:function(v){if(v.mode!=='sol')return {};return {ligne:0,nitro:v.t<5,drift:v.t>=6&&v.t<6.5?1:0};}};";
/* les trois premiers nombres du flux « volant » de la course 910000, profil de graine 0 (controle 9b) */
const HASARD9={graine:522810532,suite:[0.7287770616821945,0.7914068624377251,0.6164035510737449]};
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
        r={empreinte:x.bilan.empreinte,touches:sha(x.touches),images:x.bilan.images,cause:x.bilan.cause,duree:x.bilan.duree_s,vols:x.bilan.vols,xReel:x.bilan.foisTempsReel};}
      else{
        J.ev(TEMOIN_CODE);const TM=J.g.sandbox.__YEUX_TEMOIN,change={};let photos=0,msPhoto=0,dur=0;
        /* (2026-11-25) le decor dur de la map, lu une fois par seconde, AVANT la premiere photo (lire ne change rien) */
        const durE=DECOR_DUR[m.carte]?'!!('+DECOR_DUR[m.carte]+')':null;
        const x=require('./justesse').mesure(J,C,{graine:m.graine,carte:m.carte,tmax:m.tmax},course,{yeuxEnPlus:{sorties:true},
          temoin:function(J9){if(durE){try{if(J9.ev(durE))dur++;}catch(e){}}const t0=Date.now(),a=TM.photo();Y.voir(J9,{sorties:true});const b=TM.photo();msPhoto+=Date.now()-t0;photos++;for(const n of TM.diff(a,b))change[n]=(change[n]||0)+1;}});
        r={empreinte:x.bilan.empreinte,touches:x.bilan.touches,images:x.bilan.images,cause:x.bilan.cause,duree:x.bilan.duree,yeux:x.bilan.yeux,tirages:x.bilan.tirages,xReel:x.bilan.xReel,
           justesse:x.vols,controles:x.controles,temoin:{photos:photos,ms:photos?Math.round(msPhoto/photos):0,change:change},budget:Y.budgetDe(J),
           decorDur:durE?{expr:DECOR_DUR[m.carte],vu:dur,sur:photos}:null,travailleurs:J.g.travailleurs(),simulateur:J.simulateur};}
    }else if(m.quoi==='envers'){
      /* (relecture, controle 6g) la caisse lachee par le banc du jeu, a l'endroit (u = 1) puis tete en bas (u = -1) : ou finit le rayon versRoute ? */
      const essai=function(u){
        J.lancer(m.graine,{carte:'ville'});for(let i=0;i<180;i++)J.image();
        let lache=null;try{lache=J.ev('dbgLache({lat:14,h:12,u:'+u+'})');}catch(e){lache=String(e&&e.message||e);}
        J.image();
        const v=Y.voir(J),p=v.vol&&v.vol.proche,R9=(v.vol&&v.vol.radar&&v.vol.radar.rayons)||[],de=n=>{const y=R9.find(q=>q.m===n);return y?{issue:y.issue,t:y.t,lat:y.lat==null?null:y.lat}:null;};
        return {lache:lache,mode:v.mode,envers:p?p.envers:null,lat:p?p.lat:null,versRoute:de('versRoute'),rien:de('rien'),gauche:de('gauche'),droite:de('droite')};};
      r={endroit:essai(1),envers:essai(-1)};
    }else if(m.quoi==='bac'){
      /* LE TRICHEUR : une tentative par decision (une erreur attendue chacune), puis il conduit tout droit. Une tentative qui REUSSIT rend
         { fuite } : on la lit dans la trace. Il essaie aussi d'ecrire dans le jeu (coinsGot=5000) : les pieces de fin le diraient. */
      const x=course(J,charger('tricheur.js',{source:TRICHEUR}),m.graine,{tmax:m.tmax,trace:true});
      r={erreurs:x.bilan.erreurs,pannes:x.bilan.pannes,decisions:x.bilan.decisions,images:x.bilan.images,cause:x.bilan.cause,duree:x.bilan.duree_s,pieces:x.bilan.pieces,
         tentatives:NTRICHE,fuites:x.vues.filter(v=>v.ordre&&v.ordre.fuite!=null).map(v=>v.ordre.fuite),derniere:x.bilan.derniereErreur};
    }else if(m.quoi==='main'){
      /* (doigts v2, controles 10 a 12) le bot de reference, avec un profil ajoute a son texte (ou sans) */
      const C=charger('reference.js',{source:fs.readFileSync(REF,'utf8')+(m.profil?'\nmodule.exports.profil='+JSON.stringify(m.profil)+';':'')});
      /* (2026-11-25, relecture : « la borne 36 a 330 images compare la main a elle-meme ») LE JEU AU MOMENT DU TOUCHER : a chaque image du temps
         mort, apres l'image, deux lectures du jeu — depuis combien de ms l'ecran de mort est la (la plaque est sourde 600 ms : TCTL.mortT,
         moteur/mobile-tactile.js) et ce qui reste de l'offre (chanceEtat().reste, gameplay/seconde-chance.js). La main touche a l'image i, avant
         l'image du jeu : l'etat qu'elle trouve est celui releve apres l'image i − 1. Lire ne change rien (le rejeu exact du controle le redit). */
      const rel={},releve=m.releve?function(J9,fr){let md=null;try{md=Y.modeDe(J9);}catch(e){}if(md!=='boom')return;
        try{rel[fr]=JSON.parse(J9.ev('JSON.stringify([TCTL.mortT?performance.now()-TCTL.mortT:null,chanceEtat().reste,chanceEtat().ok])'));}catch(e){rel[fr]=null;}}:undefined;
      const x=course(J,C,m.graine,{tmax:m.tmax,trace:!!m.trace,image:releve}),b=x.bilan,ch=b.chance||null;
      /* le palier vu a la derniere decision d'avant la mort, et a la premiere d'apres la reprise */
      let moteur=null;if(m.trace&&ch&&ch.reprise>=0){const av=x.vues.filter(v=>v.image<ch.reprise).pop(),ap=x.vues.find(v=>v.image>=ch.reprise);moteur={mort:av?av.vue.moteur:null,reprise:ap?ap.vue.moteur:null,invulnerable:ap?ap.vue.invulnerable:null};}
      let used=null;try{used=!!J.ev('CHANCE.used');}catch(e){}
      r={empreinte:b.empreinte,touches:sha(x.touches),journal:m.journal?x.touches:undefined,images:b.images,cause:b.cause,duree:b.duree_s,argent:x.partie.fin.argent,vues:b.empreinteVues,
         profil:!!C.profil,main:b.main,chance:ch,imagesMortes:b.imagesMortes,chances:b.chances,secondes:(x.partie.ev||[]).filter(e=>e[1]==='seconde_chance').length,
         morts:(x.partie.ev||[]).filter(e=>e[1]==='mort').map(e=>e[0]),used:used,moteur:moteur,erreurs:b.erreurs,pannes:b.pannes,jeu_sha:J.sha,
         toucher:m.releve&&ch&&ch.image>0?(rel[ch.image-1]===undefined?null:rel[ch.image-1]):undefined,
         /* (relecture, controle 14c) la ligne de journal que le labo ecrirait pour cette course, et le mode du dernier echantillon */
         resume:m.releve?(function(){const q=require('../labo/labo').resumeCourse(b,x.partie),P9=x.partie,im=(P9.cols||[]).indexOf('m'),d9=(P9.ech||[])[(P9.ech||[]).length-1];
           return {cause:q.cause,chances:q.chances,morts:q.morts,finEnVol:q.fin?q.fin.enVol:null,dernierVol:d9?d9[im]===1||d9[im]===2:null};})():undefined};
    }else if(m.quoi==='drift'){
      /* (doigts v2, controle 13) le drifteur sur une droite des nuages, avec ou sans profil */
      const x=course(J,charger('drifteur.js',{source:DRIFTEUR(m.profil)}),920000,{carte:'nuages',tmax:9,trace:true});
      r={journal:x.touches,images:x.bilan.images,cause:x.bilan.cause,drift:x.vues.filter(v=>v.vue.drift).map(v=>v.image),perdus:x.bilan.driftSansProfil||0,main:x.bilan.main,
         vitesse:x.vues.filter(v=>v.image>=354&&v.image<=396).map(v=>v.vue.vitesse)};
    }else if(m.quoi==='rejeu'){
      const x=require('./piloter').rejouer(J,m.graine,m.touches,{tmax:m.tmax});
      r={empreinte:x.empreinte,images:x.images,argent:x.partie.fin.argent,cause:x.partie.fin.cause,chances:x.bilan.chances};
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
/* (doigts v2) la lettre C du journal (la plaque CONTINUER) n'est pas une touche ; `fin` (l'image ou la course s'arrete) : ce que la fin de la
   course relache d'office n'est pas un geste de la main, sa duree n'est pas jugee (sans `fin` : tout est juge, comme avant). */
function mains(T,fin){
  const par={},pb=[];let nApp=0,court=1e9,repos=1e9;
  for(const [i,k,bas] of T){if(k==='C')continue;const s=par[k]||(par[k]={bas:false,depuis:-1e9,debuts:[]});
    if(!bas&&fin!=null&&i>=fin){s.bas=false;s.depuis=i;continue;}
    if(bas){if(s.bas)pb.push(k+' enfoncee deux fois');const r=i-s.depuis;if(s.depuis>-1e9){if(r<repos)repos=r;if(r<HUMAIN.repos)pb.push(`${k} reprise apres ${r} images (image ${i})`);}s.debuts.push(i);nApp++;}
    else{const d=i-s.depuis;if(d<court)court=d;if(d<HUMAIN.appui)pb.push(`${k} tenue ${d} images (image ${i})`);}
    s.bas=!!bas;s.depuis=i;}
  /* la cadence la plus vive : le plus d'appuis d'une meme touche dans une seconde */
  let cadence=0;for(const k in par){const D=par[k].debuts;for(let a=0,b=0;b<D.length;b++){while(D[b]-D[a]>=60)a++;cadence=Math.max(cadence,b-a+1);}}
  return {appuis:nApp,appuiLePlusCourt_images:court,reposLePlusCourt_images:repos,appuisParSecondeMax:cadence,problemes:pb.slice(0,8),ok:pb.length===0&&cadence<=Math.ceil(60/(HUMAIN.appui+HUMAIN.repos))};
}
/* (doigts v2) LES COUPS DE VOLANT d'un journal : combien, leurs durees (images), la part du temps braque */
function coups(T,images){
  const dur={},bas={};let n=0,tenu=0;
  for(const [i,k,b] of T){if(k!=='G'&&k!=='D')continue;if(b){bas[k]=i;n++;}else if(bas[k]!=null){const d=i-bas[k];dur[d]=(dur[d]||0)+1;tenu+=d;bas[k]=null;}}
  const L=Object.keys(dur).map(Number).sort((a,b)=>a-b),tot=L.reduce((s,d)=>s+dur[d],0);
  return {coups:n,parMinute:+(n/Math.max(1e-9,images/3600)).toFixed(1),braquage:+(tenu/Math.max(1,images)).toFixed(3),durees:L.length,min:L.length?L[0]:null,max:L.length?L[L.length-1]:null,
    plusFrequente:tot?+(Math.max(...L.map(d=>dur[d]))/tot).toFixed(3):null};
}
/* (doigts v2, controle 9e) LA MAIN SEULE : un faux jeu qui ne fait rien, un ordre tenu, le journal des touches */
function mainSeule(profil,graine,ordre,images){
  const D=new Doigts9({touche(){},ev(){return false;}},()=>'sol',{profil:normaliserProfil(profil),graine:graine});
  for(let fr=0;fr<images;fr++){if(fr%HUMAIN.decision===0)D.ordre(ordre,{mode:'sol'},null);D.image(null);}
  return D.touches;
}
(async function(){
  const t0=Date.now(),NP9=19+2*CARTES.length;
  const enversP=enfant({quoi:'envers',graine:G}); /* (relecture, controle 6g) */
  console.log(`controle du contrat · graine ${G} · ${TMAX} s · regime ${REGIME} · ${NP9} processus neufs, ${K} a la fois…`);
  const lot1=Promise.all([
    enfant({quoi:'gestes'}),
    enfant({quoi:'course',graine:G,tmax:TMAX,journal:true}),
    enfant({quoi:'course',graine:G,tmax:TMAX}),
    enfant({quoi:'course',graine:G,tmax:TMAX,o:{sansEnregistreur:true}}),
    enfant({quoi:'course',graine:G,tmax:TMAX,o:{yeuxEnPlus:{sorties:true}}}),
    enfant({quoi:'bac',graine:G,tmax:40}),
    enfant({quoi:'course',graine:G,tmax:TMAX,o:{demande:{radar:false}}}),
    ...[].concat(...CARTES.map(c=>[enfant({quoi:'carte',carte:c.carte,requete:c.requete,graine:G,tmax:40,coupe:true}),enfant({quoi:'carte',carte:c.carte,requete:c.requete,graine:G,tmax:40})]))]);
  /* (doigts v2) les courses des controles 10 a 12, dans la meme file ; un rejeu part quand sa course a rendu son journal */
  const puisRejeu=(p,graine,tmax)=>p.then(x=>x&&x.journal?enfant({quoi:'rejeu',graine:graine,tmax:tmax,touches:x.journal}):null);
  const h1p=enfant({quoi:'main',graine:G,tmax:60,profil:PROFILS9.clavier1,journal:true}),ccp=enfant({quoi:'main',graine:CHANCE9.graine,tmax:CHANCE9.tmax,profil:PROFILS9.chance,journal:true,trace:true,releve:true});
  const lot2=Promise.all([
    enfant({quoi:'main',graine:G,tmax:TMAX,profil:PROFILS9.neutre}),
    h1p,enfant({quoi:'main',graine:G,tmax:60,profil:PROFILS9.clavier1}),enfant({quoi:'main',graine:G,tmax:60,profil:PROFILS9.clavier2}),puisRejeu(h1p,G,60),
    enfant({quoi:'main',graine:CHANCE9.graine,tmax:CHANCE9.tmax}),enfant({quoi:'main',graine:CHANCE9.graine,tmax:CHANCE9.tmax,profil:PROFILS9.jamais}),ccp,puisRejeu(ccp,CHANCE9.graine,CHANCE9.tmax),
    enfant({quoi:'drift',profil:PROFILS9.jamais}),enfant({quoi:'drift'})]);
  const [g,a,b,sansRec,yeux,bac,sansRadar,...parCarte]=await lot1;
  const [neutre,h1,h1b,h2,h1r,c0,cj,cc,ccr,dr,dr0]=await lot2;
  const env9=await enversP;
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
  /* 6c (suite, 2026-11-25, simulateur fidele) le decor dur allume et les travailleurs muets, sur chaque course par carte */
  {const D9={},T9=[];let okD=true;
    for(const p of P6){const x=p.plein;if(!x){okD=false;continue;}
      if(x.decorDur){const vu=x.decorDur.vu>0;D9[p.carte]={expr:x.decorDur.expr,vu:x.decorDur.vu,sur:x.decorDur.sur};if(!vu)okD=false;}
      for(const t of (x.travailleurs||[]))if(t.messages>0&&!TRAVAILLEURS_PERMIS.some(re=>re.test(t.qui)))T9.push(p.carte+' : '+t.qui+' ('+t.messages+' message(s) sans reponse)');}
    R.radar.decorDur={ok:okD,cartes:D9};R.radar.travailleurs={ok:!T9.length,hors:T9};
    dit(okD,'6c. le decor qui tue est allume (vu a une vue au moins) : '+Object.keys(D9).map(k=>`${k} ${D9[k].expr} ${D9[k].vu}/${D9[k].sur}`).join(' · '));
    dit(!T9.length,'6c. aucun travailleur du jeu avec des messages sans reponse hors du decor permis (nuages, ciel de la carrosserie)'+(T9.length?' — EN ATTENTE : '+T9.join(' ; '):''));}
  {const C6=[['a',a],['yeux ouverts',yeux]].concat(P6.map(p=>[p.carte,p.plein])),err=C6.filter(x=>!x[1]||!x[1].yeux||x[1].yeux.erreurs>0),mq=C6.filter(x=>x[1]&&x[1].yeux&&x[1].yeux.manque&&x[1].yeux.manque.length);
    R.radar.erreurs={ok:!err.length&&!mq.length};
    dit(R.radar.erreurs.ok,'6d. aucune erreur dans les yeux, aucun nom du jeu manquant'+(err.length?' — ERREURS : '+err.map(x=>x[0]+' '+(x[1]&&x[1].yeux?x[1].yeux.erreurs:'?')).join(', '):'')+(mq.length?' — MANQUE : '+mq[0][1].yeux.manque.join(' '):''));}
  {const tous={},vus={};let photos=0,ms=0,n=0;
    for(const p of P6){const T=p.plein&&p.plein.temoin;if(!T)continue;photos+=T.photos;ms+=T.ms;n++;for(const k in T.change){if(BROUILLONS.indexOf(k)>=0)vus[k]=(vus[k]||0)+T.change[k];else(tous[k]=tous[k]||[]).push(p.carte+' x'+T.change[k]);}}
    const noms=Object.keys(tous);R.radar.etat={ok:photos>0&&!noms.length,photos:photos,ms_par_controle:n?Math.round(ms/n):null,changes:tous,brouillons:vus};
    dit(R.radar.etat.ok,`6e. l'etat du jeu intact : ${photos} controles (une vue avec sorties entre deux photos de toutes les variables du jeu)`+(noms.length?' — CHANGE : '+noms.map(k=>k+' ('+tous[k].join(', ')+')').join(' ; '):' — rien ne change')+(Object.keys(vus).length?' · brouillons vus : '+Object.keys(vus).join(' '):''));}
  {const txt=require('./yeux').YEUX_CODE,pris=INTERDITS.filter(x=>txt.indexOf(x)>=0);R.radar.texte={ok:!pris.length,interdits:pris};
    dit(!pris.length,'6f. le texte des yeux n\'appelle aucune fonction du jeu qui ecrit et ne tire rien au hasard'+(pris.length?' — TROUVE : '+pris.join(' '):` (${INTERDITS.length} noms cherches)`));}
  /* 6g. (relecture) la loi versRoute tete en bas */
  {const E=env9,a9=E&&E.endroit,b9=E&&E.envers,pres=x=>!!(x&&x.versRoute&&x.versRoute.lat!=null&&x.lat!=null&&Math.abs(x.versRoute.lat)<Math.abs(x.lat)-3);
    const volt=/p\.envers/.test(fs.readFileSync(VOLT,'utf8'));
    const ok=!!(a9&&b9&&a9.mode==='vol'&&b9.mode==='vol'&&a9.envers===false&&b9.envers===true&&pres(a9)&&pres(b9)&&volt);
    R.radar.envers={ok:ok,endroit:a9||null,envers:b9||null,voltigeur:volt};
    const dire=x=>x&&x.versRoute?`depart a ${x.lat} m de l'axe, versRoute finit « ${x.versRoute.issue} » a ${x.versRoute.lat} m`:'rien';
    dit(ok,'6g. la loi versRoute tete en bas : a l\'endroit (envers '+(a9?a9.envers:'?')+') '+dire(a9)+' · tete en bas (envers '+(b9?b9.envers:'?')+') '+dire(b9)+' · le voltigeur retourne sa loi : '+(volt?'oui':'NON'));}
  /* ===== 7. LE COUT ===== */
  console.log('\n7. LE COUT DES YEUX');
  {const B=(a&&a.budget)||{},ya=a&&a.yeux,yb=b&&b.yeux;
    const ok=!!(ya&&yb&&ya.pas_max<=B.vol&&ya.sondes_max<=B.sondes&&ya.route_max<=B.route&&ya.pas_max===yb.pas_max&&ya.sondes_max===yb.sondes_max&&ya.octets_moy===yb.octets_moy);
    R.cout={budget:B,a:ya,b:yb,ok:ok,cartes:{}};
    dit(ok,ya&&yb?`les comptes au pire sous le budget, et les memes dans deux processus : ${ya.pas_max} / ${yb.pas_max} images de vol (budget ${B.vol}) · ${ya.sondes_max} / ${yb.sondes_max} sondes (${B.sondes}) · ${ya.route_max} / ${yb.route_max} images de route (${B.route}) · ${ya.octets_moy} / ${yb.octets_moy} caracteres par vue`:'pas de mesure');
    if(ya)console.log(`  ·    ${(a.cartes||[]).join(' > ').padEnd(24)} ${ya.ms_moy} ms par vue (sol ${ya.ms_sol_moy}, vol ${ya.ms_vol_moy}, pire ${ya.ms_max}) · ${ya.vues_vol} vues en vol sur ${ya.vues_sol+ya.vues_vol} · sans le radar : ${sansRadar&&sansRadar.yeux?sansRadar.yeux.ms_moy:'?'} ms`);
    let lourd=ya&&ya.ms_moy>3?['course du controle 3']:[];
    for(const p of P6){const y=p.plein&&p.plein.yeux;if(!y)continue;R.cout.cartes[p.carte]=y;
      /* (relecture) le voltigeur demande les sorties : le budget de ses vues au sol est celui de la demande (2 900), pas celui du vol (2 400) */
      const okC=y.pas_max<=Math.max(B.vol,B.demande)&&y.sondes_max<=B.sondes&&y.route_max<=B.route;if(!okC)dit(false,`${p.carte} : le budget est depasse (${y.pas_max} images, ${y.sondes_max} sondes, ${y.route_max} images de route)`);
      /* 6 ms : le voltigeur vole la moitie du temps (un joueur : 29 %, le bot de reference : 5 a 10 %), et MESURE le 24/11 la map la plus chere (jade) est a 2,7 ms sur un PC charge par ailleurs.
         (2026-11-25, simulateur fidele) LE CANYON AVEC SON RELIEF : une vue en vol y coute 10 a 20 ms (le relief se lit par cinq hauteurs de terrain a
         chaque sonde, 134 microsecondes), mais le voltigeur, qui sort expres, meurt contre la paroi en 11 s : sa moyenne reste sous 6 ms (2,6 le 25/11).
         Ce qui compte est ce que les yeux coutent a une COURSE ENTIERE (seuil de la decision du 25/11 : 10 %). MESURE le 25/11 (allege), temps de calcul
         radar coupe / radar ouvert, construction des pistes comprise : le bot de reference sur les 4 graines de la note qui passent au canyon, 19,7 / 19,8 s,
         27,0 / 26,3 s, 39,0 / 39,3 s, 77,6 / 78,2 s (moins de 3 %, le bruit du PC) ; le voltigeur au canyon, 11,3 / 11,6 s (+2,7 %). */
      /* (le temps de la course : celui de la course RADAR COUPE — celle du radar ouvert porte aussi les photos du controle 6e, une par seconde) */
      const tCourse=p.coupe&&p.coupe.xReel>0?p.coupe.duree/p.coupe.xReel:null,part=tCourse?(y.ms_moy*(y.vues_sol+y.vues_vol)/1000)/tCourse:null;
      /* (2026-11-25) LE CANYON EST JUGE COMME LES AUTRES (6 ms par vue en moyenne). La part des yeux est AFFICHEE seulement : elle se rapporte a la
         boucle de la course radar coupe, sans la construction de la piste (3 a 4 s de relief au canyon) ni les sorties demandees a chaque image de
         la course pleine — MESURE le 25/11 : 12 % au canyon sur ce calcul, quand la course entiere du voltigeur, construction comprise, ne prend que
         2,7 % de plus radar ouvert, et celles du bot de reference moins de 3 %. */
      if(y.ms_moy>6)lourd.push(p.carte);
      console.log(`  ·    ${p.carte.padEnd(24)} ${y.ms_moy} ms par vue (sol ${y.ms_sol_moy}, vol ${y.ms_vol_moy}, pire ${y.ms_max}) · ${y.vues_vol} vues en vol sur ${y.vues_sol+y.vues_vol} · au pire ${y.pas_max} images, ${y.sondes_max} sondes · ${y.octets_moy} caracteres par vue`+(part!=null?` · les yeux : ${Math.round(1000*part)/10} % du temps de la course`:''));}
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
    if(ta.n<SEUILS.min||tb.n<SEUILS.min)console.log('  ·    (moins de '+SEUILS.min+' vols : affiche seulement)');
    /* ===== 8 bis, ter, quater (relecture) : les comptes des courses de 6c ===== */
    const C9=JU.controles(P6.map(p=>p.plein&&p.plein.controles)),S9=JU.sorties(tous).saut,nC=P6.filter(p=>p.plein&&p.plein.controles).length;R.justesse.controles=C9;R.justesse.saut={n:S9.n,prevues:S9.prevues,dt_med:S9.dt_med,dt_max:S9.dt_max};
    if(!nC)dit(false,'8 bis. pas de comptes : aucune course de 6c n\'a rendu ses controles');
    else{
      if(C9.cadence.vues)dit(C9.cadence.max<1.5,`8 bis. le decor est sonde a chaque image (hors canyon) : une sonde toutes les ${C9.cadence.max} image(s) au pire, sur ${C9.cadence.vues} vues en vol devant un decor`);
      else console.log('  ·    8 bis. aucune vue en vol devant un decor sonde (affiche seulement)');
      if(C9.sauts.ordres){
        dit(C9.sauts.prevusSansDecol===0,`8 ter. un saut prevu decolle : ${C9.sauts.ordres} saut(s) ordonne(s), ${C9.sauts.prevus} prevu(s) par les yeux dont ${C9.sauts.prevusSansDecol} sans decollage · ${C9.sauts.decolles} decolle(s)`);
        dit(C9.sauts.refusesMaisDecol===0,`8 ter. un saut dit refuse ne decolle pas : ${C9.sauts.refuses} refus annonce(s), ${C9.sauts.refusesMaisDecol} decolle(s) quand meme · ${C9.sauts.figure} « figure en cours »`);
        /* la mediane, pas le pire : un geste dont la mise en place attend une touche part 1 a 4 images plus tard, ce n'est pas un defaut des yeux ;
           une image de route en trop ou en moins (le defaut corrige) decalerait TOUS les sauts de 0,01 ou 0,02 s */
        if(S9.prevues)dit(S9.dt_med===0,`8 ter. le saut decolle a l'image annoncee : ecart median ${S9.dt_med} s (au pire ${S9.dt_max} s) sur ${S9.prevues} saut(s) juge(s)`);}
      else console.log('  ·    8 ter. aucun saut ordonne (affiche seulement)');
      dit(C9.latC.objets>0&&C9.latC.faux===0,`8 quater. latC = lat au-dessus de la dalle, son oppose dessous : ${C9.latC.objets} objets (pieces, fruits, orbes), ${C9.latC.faux} faux · ${C9.latC.dessous} vu(s) sous la dalle`+(C9.latC.dessous?'':' (le retournement n\'est PAS exerce par ces courses)'));}}
  /* ===== 9. LA MAIN, SANS LE JEU ===== */
  console.log('\n9. LA MAIN (doigts v2), sans le jeu');
  R.main={};
  {const PL=require('./piloter'),src=p=>"module.exports={nom:'x',profil:"+p+",decide:function(){return {};}};",leve=f=>{try{f();return null;}catch(e){return String(e&&e.message||e);}};
    /* 9a */
    const entier={modele:'machine',graine:7,reaction:{volant:0,nitro:0,manche:0,geste:0},suivi:{actif:false,retard:0},coups:{actif:false,duree:[100,200,400],repos:[70,110,200],seuil:.5,plein:.92,mort:.08,contre:.5},
      nitro:{tenue:null,pause:[130,220,500]},geste:{tap:83,entre:83},drift:{avance:33},chance:{prend:0,palierMin:1,delai:[900,1500,3000]},erreur:{manque:0,retard:0,retardK:2.5,sur:0,surK:[1.5,2.5],bruit:0,parasite:0}};
    let c0p=undefined,c1p=undefined;try{c0p=PL.charger('x.js',{source:src('{}')}).profil;c1p=PL.charger('x.js',{source:src('{modele:"clavier"}')}).profil;}catch(e){}
    R.main.neutre={ok:normaliserProfil({})===null&&normaliserProfil(undefined)===null&&normaliserProfil(entier)===null&&c0p===null&&!!(c1p&&c1p.coups&&c1p.coups.actif)};
    dit(R.main.neutre.ok,'9a. le profil vide et le profil au defaut ecrit en entier = pas de profil ; un cerveau charge avec profil:{} n\'en a pas ; avec modele:"clavier" il en a un');
    /* 9b */
    const hz=hasard(graineDe('doigts-v2|910000|0|volant')),suite=[hz(),hz(),hz()],q=[4,6,12,24,36];let croit=true,prec=-1;for(let u=0;u<1;u+=.001){const v=tirer(q,u);if(v<prec||v<q[0]||v>q[4])croit=false;prec=v;}
    R.main.hasard={ok:graineDe('doigts-v2|910000|0|volant')===HASARD9.graine&&suite.every((x,i)=>x===HASARD9.suite[i])&&croit,suite:suite};
    dit(R.main.hasard.ok,'9b. le hasard a graine : '+suite.map(x=>x.toFixed(6)).join(' · ')+' (attendu '+HASARD9.suite.map(x=>x.toFixed(6)).join(' · ')+') ; une loi tiree est croissante et reste dans ses bornes');
    /* 9c */
    const tr=normaliserProfil({coups:{actif:true,duree:1,inversion:1},reaction:{volant:-50},geste:{tap:1,entre:1},chance:{prend:9,delai:0},nitro:{tenue:1,pause:1},suivi:{actif:true,retard:9999},drift:{avance:0}});
    /* (relecture) nitro.tenue : plancher 67 ms (4 images ; avant 100 ms, un pic de 11 % des tenues a 6 images pile) ; drift.avance est une loi ;
       le suivi actif ne lit jamais l'etat de moins de 6 images (retard nul, le defaut, ou 91 ms = 5 images : ramenes a 6) */
    const sv0=normaliserProfil({suivi:{actif:true}}),sv91=normaliserProfil({suivi:{actif:true,retard:91}}),svSans=normaliserProfil({coups:{actif:true}});
    const planchers=!!tr&&tr.coups.duree.every(x=>x===HUMAIN.appui)&&tr.coups.inversion.every(x=>x===2)&&tr.reaction.volant.every(x=>x===0)&&tr.geste.tap.every(x=>x===4)&&tr.geste.entre.every(x=>x===4)&&tr.chance.delai.every(x=>x===36)&&tr.chance.prend===1
      &&tr.nitro.tenue.every(x=>x===4)&&tr.nitro.pause.every(x=>x===4)&&tr.suivi.retard===30&&tr.drift.avance.every(x=>x===2)
      &&!!sv0&&sv0.suivi.retard===HUMAIN.decision&&!!sv91&&sv91.suivi.retard===HUMAIN.decision&&!!svSans&&svSans.suivi.retard===0;
    const refus=[['un champ inconnu',()=>normaliserProfil({vitesse:2})],['un sous-champ inconnu',()=>normaliserProfil({coups:{cadence:3}})],['un mauvais type',()=>normaliserProfil({reaction:{volant:'vite'}})],
      ['un modele inconnu',()=>normaliserProfil({modele:'robot'})],['un profil qui n\'est pas un objet (au chargement)',()=>PL.charger('x.js',{source:src('"clavier"')})],['un champ inconnu (au chargement)',()=>PL.charger('x.js',{source:src('{turbo:true}')})],
      /* (relecture) un infini n'est pas un nombre : [Infinity, Infinity, Infinity] laissait des NaN dans la loi (un canal mort, une plaque attendue sans fin) */
      ['une duree infinie',()=>normaliserProfil({coups:{actif:true,duree:[Infinity,Infinity,Infinity]}})],['une reaction infinie',()=>normaliserProfil({reaction:{volant:Infinity}})],
      ['un nombre infini',()=>normaliserProfil({erreur:{parasite:-Infinity}})],['un delai infini (au chargement, a travers le bac)',()=>PL.charger('x.js',{source:src('{chance:{prend:1,delai:1/0}}')})]]
      .map(x=>[x[0],leve(x[1])]),passes=refus.filter(x=>!x[1]);
    R.main.bornes={ok:planchers&&!passes.length,planchers:planchers,refus:refus};
    dit(R.main.bornes.ok,'9c. un profil qui triche est ramene aux planchers (4 images d\'appui, 600 ms avant la plaque, le suivi a 6 images au moins…)'+(planchers?'':' — NON : '+JSON.stringify(tr)+' · suivi '+JSON.stringify([sv0&&sv0.suivi,sv91&&sv91.suivi,svSans&&svSans.suivi]))+' ; '+refus.length+' profils mal ecrits refuses'+(passes.length?' — PASSENT : '+passes.map(x=>x[0]).join(', '):''));
    /* 9d */
    const txt=fs.readFileSync(path.join(__dirname,'doigts.js'),'utf8'),pris=['Math.random','Date'].filter(x=>txt.indexOf(x)>=0);
    R.main.texte={ok:!pris.length,trouve:pris};dit(!pris.length,'9d. le texte des doigts n\'a ni le hasard ni l\'horloge de l\'hote'+(pris.length?' — TROUVE : '+pris.join(' '):''));
    /* 9e */
    const N9=3600,T1=mainSeule(PROFILS9.clavier1,910000,{volant:.36},N9),T1b=mainSeule(PROFILS9.clavier1,910000,{volant:.36},N9),T2=mainSeule(PROFILS9.clavier2,910000,{volant:.36},N9),T3=mainSeule(PROFILS9.clavier1,910037,{volant:.36},N9);
    const k=coups(T1,N9),m9=mains(T1,N9),lim=normaliserProfil(PROFILS9.clavier1).coups.duree;
    const ok9=k.parMinute>=90&&k.parMinute<=150&&k.braquage>=.31&&k.braquage<=.41&&k.min>=lim[0]&&k.max<=lim[4]&&k.plusFrequente<.4&&k.durees>=6&&m9.ok&&sha(T1)===sha(T1b)&&sha(T1)!==sha(T2)&&sha(T1)!==sha(T3);
    R.main.seule={ok:ok9,coups:k,mains:m9,repetable:sha(T1)===sha(T1b),autreGraineProfil:sha(T1)!==sha(T2),autreGraineCourse:sha(T1)!==sha(T3)};
    dit(ok9,`9e. la main seule (clavier, volant 0,36, 60 s) : ${k.parMinute} coups par minute (90 a 150) · braquage ${k.braquage} (0,31 a 0,41) · ${k.durees} durees de ${k.min} a ${k.max} images (bornes ${lim[0]} a ${lim[4]}), la plus frequente ${Math.round(100*k.plusFrequente)} % · limites d'une main ${m9.ok?'tenues':'DEPASSEES : '+m9.problemes.join(' ; ')} · meme graine = memes touches ${sha(T1)===sha(T1b)?'oui':'NON'} · autre graine (du profil, de la course) = d'autres touches ${sha(T1)!==sha(T2)&&sha(T1)!==sha(T3)?'oui':'NON'}`);
    /* ===== 9f a 9j (2026-11-25, relecture de la main) : un controle par defaut corrige qui pouvait revenir en silence ===== */
    /* 9f. JAMAIS DE COUP A CONTRESENS : un volant doux a gauche (0,09 / 0,12 / 0,2) ne donne aucun appui a droite, et le braquage reste celui
       demande ; puis un volant de 0,3 lache a 0 (mort 0) : aucun appui d'un cote ni de l'autre apres le lache (avant : 1 appui sur 4 a droite a 0,12) */
    {const res=[];let okF=true;
      for(const vv of [.09,.12,.2]){const T=mainSeule(PROFILS9.clavier1,910000,{volant:vv},N9*3),kk=coups(T,N9*3),dr9=T.filter(t=>t[1]==='D'&&t[2]).length;
        const ok=dr9===0&&Math.abs(kk.braquage-vv)<=Math.max(.02,vv*.15);okF=okF&&ok;res.push(`${vv} → ${dr9} a droite, braquage ${kk.braquage}`);}
      const P0={modele:'clavier',graine:1,coups:{mort:0}},D0=new Doigts9({touche(){},ev(){return false;}},()=>'sol',{profil:normaliserProfil(P0),graine:910000});
      for(let fr=0;fr<N9*3;fr++){if(fr%HUMAIN.decision===0)D0.ordre({volant:Math.floor(fr/120)%2?0:.3},{mode:'sol'},null);D0.image(null);}
      const apres=D0.touches.filter(t=>t[2]&&(t[1]==='G'||t[1]==='D')&&Math.floor(t[0]/120)%2&&t[0]%120>=60).length,droite0=D0.touches.filter(t=>t[1]==='D'&&t[2]).length;
      okF=okF&&droite0===0&&apres===0;
      R.main.contresens={ok:okF,detail:res,lache:{droite:droite0,apresLache:apres}};
      dit(okF,'9f. aucun coup a contresens : '+res.join(' · ')+` · 0,3 puis 0 (mort 0) : ${droite0} appui(s) a droite, ${apres} appui(s) plus d'une seconde apres le lache`);}
    /* 9g. LE GESTE NE S'OUVRE PAS SUR UN TAPOTEMENT : la main clavier, la NITRO demandee au sol en continu (hachee), un geste toutes les 3,5 s
       (figure, saut, redresser) ; le detecteur du double appui du jeu (gameplay/vol-equilibre.js, veqDoigt) rejoue sur le journal, en images et
       du cote prudent (un appui de 18 images compte pour bref, 26 images de debut a debut pour hors fenetre). Attendu : un double appui au 2e appui
       de chaque figure et de chaque saut, nulle part ailleurs (avant : un geste sur six lu au 1er appui). */
    {const D9=new Doigts9({touche(){},ev(){return false;}},()=>'sol',{profil:normaliserProfil(PROFIL9G),graine:910000}),NOMS9=['figure','saut','redresser'],G9=[];let dern=null;
      for(let fr=0;fr<N9*5;fr++){if(fr%HUMAIN.decision===0){const kG=Math.floor(fr/210);D9.ordre(fr%210===0&&fr>0?{nitro:true,geste:NOMS9[kG%3],direction:'avant'}:{nitro:true},{mode:'sol'},null);}
        D9.image(null);if(D9.geste&&D9.geste!==dern){G9.push({nom:D9.geste.nom,i:D9.i});}dern=D9.geste;}
      const N=D9.touches.filter(t=>t[1]==='N'),bas=N.filter(t=>t[2]).map(t=>t[0]);
      let dDn=-1,dUp=-1;const doubles=new Set();for(const [i,,b] of N){if(!b){dUp=i;continue;}if(dDn>=0&&i-dDn<26&&dUp>=dDn&&dUp-dDn<=18){dDn=-1;doubles.add(i);}else dDn=i;}
      const attendus=new Set();for(const g of G9){if(g.nom==='redresser')continue;const p=bas.filter(i=>i>=g.i);if(p.length>=2)attendus.add(p[1]);}
      const faux=[...doubles].filter(i=>!attendus.has(i)).length,rates=[...attendus].filter(i=>!doubles.has(i)).length,m9g=mains(D9.touches,N9*5);
      const ok=G9.length>=30&&faux===0&&rates===0&&m9g.ok;R.main.gestesNitro={ok:ok,gestes:G9.length,doubles:doubles.size,attendus:attendus.size,faux:faux,rates:rates};
      dit(ok,`9g. le double appui lu par le jeu, la NITRO hachee : ${G9.length} gestes joues · ${doubles.size} doubles appuis lus, ${attendus.size} attendus · ${faux} lu(s) au mauvais appui · ${rates} geste(s) sans le sien · limites d'une main ${m9g.ok?'tenues':'DEPASSEES'}`);}
    /* 9h. L'EMBARDEE AU TAUX DEMANDE : erreur.parasite 6 par minute, volant 0, 10 minutes → 6 par minute a 15 % pres (avant : 4,7) */
    {const D9=new Doigts9({touche(){},ev(){return false;}},()=>'sol',{profil:normaliserProfil({modele:'clavier',graine:1,erreur:{parasite:6}}),graine:910000});
      for(let fr=0;fr<36000;fr++){if(fr%HUMAIN.decision===0)D9.ordre({volant:0},{mode:'sol'},null);D9.image(null);}
      const pm=+(D9.err.parasites/10).toFixed(2),ok=Math.abs(pm-6)<=.9;R.main.parasite={ok:ok,parMinute:pm};
      dit(ok,`9h. erreur.parasite 6 par minute : ${pm} embardees par minute obtenues (5,1 a 6,9)`);}
    /* 9i. LES DEUX HORLOGES DU REPOS ET LA FIN DU DRIFT : un volant qui change de cote toutes les 0,5 s — la fleche d'en face attend son blanc a
       elle (coups.inversion, au moins 2 images), jamais moins ; le drift (40 drifts de 0,5 s) : ↓ lache AVANT la fleche, l'avance de la fleche
       sur ↓ varie d'un drift a l'autre */
    {const D9=new Doigts9({touche(){},ev(){return false;}},()=>'sol',{profil:normaliserProfil(PROFILS9.clavier1),graine:910000}),inv=normaliserProfil(PROFILS9.clavier1).coups.inversion;
      for(let fr=0;fr<N9*3;fr++){if(fr%HUMAIN.decision===0)D9.ordre({volant:Math.floor(fr/30)%2?-.5:.5},{mode:'sol'},null);D9.image(null);}
      const blancs=[];let lache={G:null,D:null};for(const [i,k,b] of D9.touches){if(k!=='G'&&k!=='D')continue;const o=k==='G'?'D':'G';if(!b)lache[k]=i;else if(lache[o]!=null&&(lache[k]==null||lache[o]>lache[k]))blancs.push(i-lache[o]);}
      const bmin=blancs.length?Math.min(...blancs):null,sous4=blancs.filter(x=>x<HUMAIN.repos).length,m9i=mains(D9.touches,N9*3);
      const DD=new Doigts9({touche(){},ev(){return false;}},()=>'sol',{profil:normaliserProfil(PROFILS9.clavier1),graine:910037});
      for(let fr=0;fr<40*120;fr++){if(fr%HUMAIN.decision===0)DD.ordre(fr%120<30?{drift:1}:{},{mode:'sol'},null);DD.image(null);}
      const T=DD.touches,av=[],ordreFin=[];let gB=null;
      for(let j=0;j<T.length;j++){const [i,k,b]=T[j];if(k==='B'&&b){const g0=T.slice(0,j).filter(t=>t[1]==='G'&&t[2]).pop();if(g0)av.push(i-g0[0]);}
        if(k==='B'&&!b)gB=i;if(k==='G'&&!b&&gB!=null){ordreFin.push(i-gB);gB=null;}}
      const okI=blancs.length>=20&&bmin>=inv[0]&&m9i.ok,okD=av.length>=35&&new Set(av).size>=3&&ordreFin.length>=35&&ordreFin.every(x=>x>0);
      R.main.horloges={ok:okI&&okD,inversions:blancs.length,blancMin:bmin,sous4:sous4,avances:[...new Set(av)].sort((a,b)=>a-b),flecheApresBas:ordreFin.length?[Math.min(...ordreFin),Math.max(...ordreFin)]:null};
      dit(okI,`9i. la fleche d'en face : ${blancs.length} inversions, blanc le plus court ${bmin} image(s) (plancher ${inv[0]}), ${sous4} sous le repos d'une touche (${HUMAIN.repos} images) · limites d'une main ${m9i.ok?'tenues':'DEPASSEES : '+m9i.problemes.join(' ; ')}`);
      dit(okD,`9i. le drift : ${av.length} drifts, la fleche ${[...new Set(av)].sort((a,b)=>a-b).join('/')} images avant ↓ · ↓ lache avant la fleche ${ordreFin.filter(x=>x>0).length} fois sur ${ordreFin.length} (de ${R.main.horloges.flecheApresBas?R.main.horloges.flecheApresBas.join(' a '):'?'} images avant)`);}
    /* 9j. « ensuite » A LA POSE : un ordre donne en vol, plein volant a gauche et ensuite:{volant:0}, puis plus aucun ordre ; la caisse se pose a
       l'image 90 → la fleche est lachee 6 a 12 images apres la pose (la main voit le sol 6 images apres) ; sans « ensuite », elle reste tenue ;
       et la vue de la main (etatMain, ce que piloter.js met dans vue.main) se lit */
    {const run=ens=>{let md='vol';const D9=new Doigts9({touche(){},ev(){return false;}},()=>md,{profil:normaliserProfil(PROFILS9.clavier1),graine:910000});
        for(let fr=0;fr<240;fr++){md=fr<90?'vol':'sol';if(fr===0)D9.ordre(Object.assign({volant:1},ens?{ensuite:{volant:0}}:{}),{mode:'vol'},{mode:'vol',capVol:0});
          D9.image({mode:md,lat:0,cap:0,vitesse:60,lacetRoute:0,lacetMax:1,capVol:0});}
        const lG=D9.touches.filter(t=>t[1]==='G'&&!t[2]&&t[0]>=90).map(t=>t[0]);return {bas:D9.touches.some(t=>t[1]==='G'&&t[2]),lache:lG.length?lG[0]-90:null,vue:D9.etatMain()};};
      const a9=run(true),b9=run(false),ok=a9.bas&&a9.lache!=null&&a9.lache>=6&&a9.lache<=12&&b9.bas&&b9.lache==null&&!!a9.vue&&a9.vue.attente&&a9.vue.geste===null;
      R.main.ensuite={ok:ok,avec:a9,sans:b9};
      dit(ok,`9j. « ensuite » a la pose : fleche lachee ${a9.lache==null?'JAMAIS':a9.lache+' images'} apres la pose (6 a 12) · sans « ensuite » : ${b9.lache==null?'tenue jusqu\'au bout':'lachee '+b9.lache+' images apres'} · la vue de la main : ${JSON.stringify(a9.vue)}`);}
  }
  /* ===== 10. LA MAIN V2 SANS EFFET = LA MAIN D'AVANT ===== */
  console.log('\n10. LA MAIN V2 SANS EFFET = LA MAIN D\'AVANT (le bot de reference, profil {chance:{prend:1}})');
  {const ok=!!(neutre&&neutre.profil&&meme(a,neutre)&&a.vues===neutre.vues),joue=!!(neutre&&neutre.chance&&neutre.chance.voulue);
    R.main.sansEffet={ok:ok,profil:neutre&&neutre.profil,chanceJouee:joue,course:neutre&&{empreinte:neutre.empreinte,touches:neutre.touches,images:neutre.images,vues:neutre.vues,cause:neutre.cause}};
    if(neutre&&joue&&!ok)console.log('  ·    la course meurt et la chance a joue : ce controle ne juge que les courses qui finissent « temps » (affiche, pas juge)');
    else dit(ok,neutre?`toute la course par ordreV2 / imageV2 : course ${neutre.empreinte} (controle 3 : ${a?a.empreinte:'rien'}) · touches ${neutre.touches} (${a?a.touches:'rien'}) · ${neutre.images} images · vues ${neutre.vues} (${a?a.vues:'rien'}) · fin « ${neutre.cause} »`+(neutre.profil?'':' — LE PROFIL N\'A PAS ETE LU'):'la course n\'a rien rendu');}
  /* ===== 11. UNE MAIN HUMAINE ===== */
  console.log('\n11. UNE MAIN HUMAINE (le bot de reference, profil clavier, 60 s)');
  if(!h1||!h1.journal){dit(false,'la course n\'a rien rendu');R.main.humaine=null;}
  else{const m11=mains(h1.journal,h1.images),k11=coups(h1.journal,h1.images),rj=!!(h1r&&h1r.empreinte===h1.empreinte&&h1r.images===h1.images&&h1r.argent===h1.argent);
    R.main.humaine={repetable:meme(h1,h1b),mains:m11,rejeu:rj,autreGraine:!!(h2&&h2.touches!==h1.touches),coups:k11,course:{empreinte:h1.empreinte,touches:h1.touches,images:h1.images,cause:h1.cause,duree:h1.duree,main:h1.main}};
    dit(R.main.humaine.repetable,'(a) deux processus neufs : '+(h1b?`course ${h1.empreinte} / ${h1b.empreinte} · touches ${h1.touches} / ${h1b.touches} · ${h1.images} / ${h1b.images} images (${h1.duree} s, fin « ${h1.cause} », profil ${h1.main&&h1.main.sha})`:'la seconde course n\'a rien rendu'));
    dit(m11.ok,`(b) les limites d'une main : ${m11.appuis} appuis · le plus court ${m11.appuiLePlusCourt_images} images (limite ${HUMAIN.appui}) · repos le plus court ${m11.reposLePlusCourt_images} (limite ${HUMAIN.repos}) · au plus ${m11.appuisParSecondeMax} appuis par seconde sur une touche`);
    for(const p of m11.problemes)console.log('         '+p);
    dit(rj,'(c) le rejeu de son journal, sans cerveau ni profil : '+(h1r?`course ${h1r.empreinte} (${h1.empreinte}) · ${h1r.images} images (${h1.images}) · argent ${h1r.argent} (${h1.argent})`:'rien'));
    dit(R.main.humaine.autreGraine,'(d) une autre graine du profil : '+(h2?`touches ${h2.touches} (graine 1 : ${h1.touches}) · course ${h2.empreinte}`:'rien'));
    const ok11=k11.durees>=6&&k11.plusFrequente<.4&&k11.min>=HUMAIN.appui;R.main.humaine.varie=ok11;
    dit(ok11,`(e) des appuis varies : ${k11.coups} coups de volant (${k11.parMinute} par minute de course) · ${k11.durees} durees de ${k11.min} a ${k11.max} images, la plus frequente ${Math.round(100*k11.plusFrequente)} % · braquage ${k11.braquage}`);}
  /* ===== 12. LA SECONDE CHANCE ===== */
  console.log(`\n12. LA SECONDE CHANCE (le bot de reference, graine ${CHANCE9.graine}, ${CHANCE9.tmax} s)`);
  R.main.chance={};
  {const mort0=c0&&c0.morts&&c0.morts.length?c0.morts[0]:null;
    R.main.chance.jamais={ok:!!(c0&&cj&&cj.profil&&meme(c0,cj)),sans:c0&&{empreinte:c0.empreinte,touches:c0.touches,images:c0.images,cause:c0.cause},avec:cj&&{empreinte:cj.empreinte,touches:cj.touches,images:cj.images,cause:cj.cause}};
    dit(R.main.chance.jamais.ok,'une main v2 qui ne prend pas la chance (palierMin 30) = la main d\'avant : '+(c0&&cj?`course ${cj.empreinte} / ${c0.empreinte} · touches ${cj.touches} / ${c0.touches} · ${cj.images} / ${c0.images} images · fin « ${cj.cause} » / « ${c0.cause} »`:'une des deux courses n\'a rien rendu'));
    if(!c0||mort0==null||mort0<20){R.main.chance.juge=false;console.log(`  ·    sans profil, la course ${c0?(mort0==null?'ne meurt pas en '+CHANCE9.tmax+' s':'meurt a '+mort0+' s (avant les 20 s de l\'offre)'):'n\'a rien rendu'} : la seconde chance ne peut pas se juger sur ces reglages (affiche, pas juge)`);if(!c0)dit(false,'la course sans profil n\'a rien rendu');}
    else if(!cc||!cc.journal)dit(false,'la course de la seconde chance n\'a rien rendu');
    else{R.main.chance.juge=true;
      const C=cc.journal.filter(t=>t[1]==='C'),ch=cc.chance||{},delai=ch.image-ch.ok,un=C.length===1&&C[0][2]===1&&C[0][0]===ch.image&&delai>=36&&delai<=330;
      dit(un,`un seul toucher de la plaque : ${C.length} entree(s) C au journal${C.length?' ('+C.map(t=>'image '+t[0]+(t[2]?', acceptee':', abandon')).join(' ; ')+')':''} · la plaque parait a l'image ${ch.ok}, touchee ${delai} images apres (36 a 330)`);
      /* (2026-11-25, relecture) LU DANS LE JEU, pas dans la main : au toucher, l'ecran de mort est la depuis 600 ms au moins (la garde de la plaque)
         et l'offre court encore (chanceEtat : reste > 0, ok). Si le jeu deplacait sa garde ou raccourcissait l'offre, ce controle le dirait. */
      const T9=cc.toucher,garde=!!(T9&&T9[0]!=null&&T9[0]>=600&&T9[1]>0&&T9[2]===true);R.main.chance.dansLeJeu={ok:garde,ecran_ms:T9?T9[0]:null,reste_ms:T9?T9[1]:null,offre:T9?T9[2]:null};
      dit(garde,`au toucher, lu dans le jeu : l'ecran de mort est la depuis ${T9&&T9[0]!=null?Math.round(T9[0])+' ms':'?'} (600 au moins : la plaque est sourde avant) · l'offre court encore ${T9?T9[1]+' ms':'?'} (plus de 0)`);
      const repr=cc.chances===1&&cc.secondes===1&&cc.used===true&&ch.reprise>ch.image;
      dit(repr,`une reprise : ${cc.chances} seconde chance au bilan · ${cc.secondes} evenement seconde_chance · le jeu la dit prise : ${cc.used} · reprise a l'image ${ch.reprise} (${ch.reprise-ch.image} images apres le toucher, ${cc.imagesMortes} images de temps mort)`);
      const pal=!!(cc.moteur&&cc.moteur.mort!=null&&cc.moteur.reprise===cc.moteur.mort-1);
      dit(pal,`un palier plus bas : moteur ${cc.moteur?cc.moteur.mort:'?'} a la mort → ${cc.moteur?cc.moteur.reprise:'?'} a la reprise (invulnerable ${cc.moteur?cc.moteur.invulnerable:'?'} s)`);
      dit(cc.images>c0.images+400,`la course continue : ${cc.images} images (${c0.images} sans la reprise) · ${cc.duree} s de jeu · fin « ${cc.cause} »`);
      const rj=!!(ccr&&ccr.empreinte===cc.empreinte&&ccr.images===cc.images&&ccr.argent===cc.argent&&ccr.cause===cc.cause);
      dit(rj,'le rejeu du journal (la lettre C) : '+(ccr?`course ${ccr.empreinte} (${cc.empreinte}) · ${ccr.images} images (${cc.images}) · argent ${ccr.argent} (${cc.argent}) · fin « ${ccr.cause} » (« ${cc.cause} »)`:'rien'));
      Object.assign(R.main.chance,{toucher:un,reprise:repr,palier:pal,rejeu:rj,course:{empreinte:cc.empreinte,touches:cc.touches,images:cc.images,cause:cc.cause,duree:cc.duree,chance:ch,moteur:cc.moteur,imagesMortes:cc.imagesMortes}});}}
  /* ===== 13. LE DRIFT ===== */
  console.log('\n13. LE DRIFT (un drift a gauche d\'une demi-seconde, sur une droite des nuages)');
  if(!dr||!dr.journal||!dr0||!dr0.journal){dit(false,'une des deux courses n\'a rien rendu');R.main.drift=null;}
  else{const T=dr.journal,bB=T.filter(t=>t[1]==='B'&&t[2]).map(t=>t[0]),hB=T.filter(t=>t[1]==='B'&&!t[2]).map(t=>t[0]);
    const g0=bB.length?T.filter(t=>t[1]==='G'&&t[2]&&t[0]<=bB[0]).map(t=>t[0]).pop():null,g1=hB.length?T.filter(t=>t[1]==='G'&&!t[2]&&t[0]>=bB[0]).map(t=>t[0])[0]:null;
    const bas={G:false,D:false,B:false};let seul=0,k=0;for(let i=0;i<=dr.images;i++){while(k<T.length&&T[k][0]<=i){const t=T[k];if(t[1] in bas)bas[t[1]]=!!t[2];k++;}if(bas.B&&!bas.G&&!bas.D)seul++;}
    const pris=dr.drift.length>=3,avance=g0!=null&&bB[0]-g0===2,fin=hB.length>0&&g1!=null&&g1>=hB[0],lu=dr0.journal.every(t=>t[1]!=='B')&&dr0.perdus>0&&!dr0.drift.length;
    R.main.drift={ok:pris&&avance&&seul===0&&fin&&lu,decisionsEnDrift:dr.drift.length,fleche:g0,bas:bB[0],relacheBas:hB[0],relacheFleche:g1,basSeul:seul,vitesse:dr.vitesse,sansProfil:{perdus:dr0.perdus,bas:dr0.journal.filter(t=>t[1]==='B').length}};
    dit(pris,`le jeu drifte : vue.drift vrai a ${dr.drift.length} decisions${dr.drift.length?' (images '+dr.drift[0]+' a '+dr.drift[dr.drift.length-1]+')':''} · la vitesse autour : ${dr.vitesse.join(' ')} m/s`);
    dit(avance,`la fleche d'abord, ↓ ensuite : ← a l'image ${g0}, ↓ a l'image ${bB[0]} (2 images apres : le volant du jeu a passe 0,35, ↓ ne freine pas)`);
    dit(seul===0&&fin,`la fin : ↓ relache a l'image ${hB[0]}, ← a l'image ${g1} · ${seul} image(s) ou ↓ est tenu sans fleche`);
    dit(lu,`sans profil l'ordre n'est pas lu : ${dr0.journal.filter(t=>t[1]==='B').length} appui(s) sur ↓, ${dr0.drift.length} decision(s) en drift, ${dr0.perdus} ordre(s) « drift » comptes perdus au bilan`);}
  /* ===== 14. LES OUTILS DE LA BOUCLE (2026-11-25, relecture des outils) : ce que la boucle payante lit, essaye sans rien depenser ===== */
  console.log('\n14. LES OUTILS DE LA BOUCLE (ml/ecurie/lecture.js, ml/labo/labo.js : sans l\'API)');
  {const {lit,chargeable}=require('../ecurie/lecture'),os=require('os'),code="module.exports={nom:'a',decide(){return {};}};",F3='```';R.outils={};
    /* (a) lire une reponse : la forme demandee, et ce qu'un modele ecrit a peine autrement */
    const essais=[['la forme demandee','RAISON: une phrase qui dit pourquoi.\n'+F3+'js\n'+code+'\n'+F3,true],
      ['« **Raison** : », retours chariot, ```JavaScript','**Raison** : une phrase qui dit pourquoi.\r\n\r\n'+F3+'JavaScript\r\n'+code+'\r\n'+F3,true],
      ['un extrait cite avant le fichier','Raison : une phrase qui dit pourquoi.\n'+F3+'js\nconst x=1;\n'+F3+'\nle fichier :\n'+F3+'js\n'+code+'\n'+F3,true],
      ['exports.decide','RAISON: une phrase qui dit pourquoi.\n'+F3+"\nexports.nom='a';exports.decide=function(){return {};};\n"+F3,"exports.nom='a';exports.decide=function(){return {};};"],
      ['sans raison','voici le fichier\n'+F3+'js\n'+code+'\n'+F3,null]];
    const L14=essais.map(([nom,t,att])=>{const v=lit(t);const ok=att===null?v===null:!!(v&&v.raison==='une phrase qui dit pourquoi.'&&v.code===(att===true?code:att));return {nom:nom,ok:ok};});
    R.outils.lit=L14;dit(L14.every(x=>x.ok),'(a) lire une reponse de l\'API : '+L14.map(x=>x.nom+(x.ok?' ✓':' ✗')).join(' · '));
    /* (b) charger : la raison d'un refus est le champ fautif, pas une ligne de piloter.js ; la main d'un pilote est son empreinte */
    const dir=fs.mkdtempSync(path.join(os.tmpdir(),'verifier-14-')),ecr=(n,s)=>{const f=path.join(dir,n);fs.writeFileSync(f,s);return f;};
    const c1=chargeable(ecr('profil-faux.js',"module.exports={nom:'x',profil:{reaction:{volnt:100}},decide(){return {};}};")),c2=chargeable(ecr('syntaxe.js',"module.exports={nom:'x',decide(){return {};};")),
      c3=chargeable(ecr('jette-null.js','throw null;')),c4=chargeable(REF),c5=chargeable(path.join(__dirname,'essai-main.js'));
    const sha5=require('./piloter').charger(path.join(__dirname,'essai-main.js')).profilSha;
    try{fs.rmSync(dir,{recursive:true,force:true});}catch(e){}
    const okB=!!(c1.erreur&&/volnt/.test(c1.erreur)&&!/throw new Error/.test(c1.erreur)&&c2.erreur&&/^SyntaxError/.test(c2.erreur)&&c3.erreur==='null'&&!c4.erreur&&c4.main===null&&!c5.erreur&&c5.main&&c5.main===sha5);
    R.outils.charger={ok:okB,profilFaux:c1,syntaxe:c2,jetteNull:c3,reference:c4,essaiMain:c5};
    dit(okB,`(b) charger un pilote : profil faux → « ${c1.erreur} » · syntaxe → « ${c2.erreur} » · throw null → « ${c3.erreur} » · la main de reference.js ${c4.main===null?'aucune':c4.main}, d'essai-main.js ${c5.main} (charger : ${sha5})`);
    /* (c) la ligne de journal d'une course reprise par la seconde chance (la course du controle 12) : la mort reprise y est, et la fin ne prend
       pas « en vol » de la vieille mort quand la course finit par le temps */
    const q=cc&&cc.resume;
    if(!q)dit(false,'(c) la course de la seconde chance n\'a pas rendu sa ligne de journal');
    else{const reprises=(q.morts||[]).filter(m=>m.reprise).length,okC=q.morts.length>=1&&q.morts[0].reprise===true&&reprises===q.chances&&(q.cause!=='temps'||q.finEnVol===q.dernierVol);
      R.outils.journal={ok:okC,resume:q};
      dit(okC,`(c) la ligne du journal (labo.js, resumeCourse) : ${q.morts.length} mort(s) — ${q.morts.map(m=>m.t+' s '+m.cause+' sur '+m.carte+(m.enVol?' en vol':' au sol')+(m.reprise?', reprise':'')).join(' ; ')} · ${q.chances} seconde chance · fin « ${q.cause} », en vol ${q.finEnVol} (dernier echantillon : ${q.dernierVol})`);}}
  R.ok=tout;
  fs.mkdirSync(path.join(__dirname,'results'),{recursive:true});
  if(a)delete a.journal;
  fs.writeFileSync(path.join(__dirname,'results','verifier.json'),JSON.stringify(R,null,1));
  console.log('\n'+(tout?'TOUT PASSE':'DES CONTROLES RATENT')+' · '+Math.round((Date.now()-t0)/1000)+' s · results/verifier.json');
  process.exit(tout?0:1);
})();
