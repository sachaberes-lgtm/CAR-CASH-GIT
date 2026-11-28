/* ===== LES GENES MUETS HORS DE L'URNE (28/11/2026, lot « regles » ; la synthese ml/ecurie/etude/reglage-de-la-selection/LISEZ-MOI.md § 2 C2 :
   « ne tirer les reels que parmi ceux que le pilote lit ») =====
   Sans course, quelques dizaines de secondes :
     (m1) la table genome.GARDES : 12 drapeaux, 33 reels (lot « genes v4 ») ; tous les reels des gestes, du portage, des genes v4 et de la loi
          « retour », et volRetour, y sont ;
     (m2) DRAPEAU ETEINT : pour chaque reel garde, pousse a sa borne basse puis haute, le pilote ecrit ne change AUCUNE decision, sur les vues de
          l'inventaire (ml/ecurie/etude/selection-naturelle/inventaire/vue-exemple.json), les suites de tests/portage.test.js (recopiees ici) et des
          suites faites pour declencher chaque bloc ; dans deux pilotes : le temoin c0025 (tout eteint ; chaque reel seul) et « tout allume sauf ce
          drapeau » (c0101, les cinq gestes, retourOn, volRetourOn, sortieOn, rienOn, secoursOn, loiFidele 2 ; les reels du drapeau ensemble) ;
     (m3) DRAPEAU ALLUME : chaque reel garde, de sa borne basse a sa borne haute, change au moins une decision sur ces memes suites (sinon la table
          pourrait garder un reel qui ne sert a rien, et (m2) ne prouverait rien) ;
     (m4) muter : 20 000 naissances du temoin, et 5 000 d'un genome a drapeaux tires au hasard : aucun reel garde par un drapeau a 0 chez le parent ne
          mute ; le nombre de reels tires, les drapeaux, le choix, les entiers et les tetes de l'enfant sont EXACTEMENT ceux de l'ancienne urne
          (o.urneComplete) a la meme graine ; un drapeau allume garde ses reels dans l'urne ;
     (m5) la part de mutations muettes, avant / apres, sur les naissances du temoin de (m4) : avant ~36 % en v:4 (34 % en v:3, 27 % en v:2,
          le Ryzen : tests/mesure-muettes.js --v2), apres 0 % ;
     (m6) genome.js n'entre pas dans l'epoque des courses (commun.FICHIERS_EPOQUE) ; (lot « genes v4 », recrit dans l'autre sens) des mutants faits par
          le genome.js de ddca156d8 (v:3), migres, gardent leur identifiant et leur pilote decide comme celui que l'ancien code ecrivait.
   usage : node ml/evolution/tests/genes-muets.test.js   (code 0 si tout passe ; Node pur, aucun jeu charge) */
'use strict';
const path=require('path'),fs=require('fs');
const D=path.join(__dirname,'..');
const C=require(path.join(D,'commun.js')),Gn=require(path.join(D,'genome.js')),Gr=require(path.join(D,'graines.js'));
const {charger}=require(path.join(D,'..','bot','piloter.js'));
const cfg=C.lireConfig();cfg.temoin='c0025';
let rates=0,passes=0;
function bilan(nom,ok,detail){if(ok)passes++;else rates++;console.log((ok?'PASSE  ':'ECHEC  ')+nom+(detail?'\n       '+String(detail).split('\n').join('\n       '):''));}
function test(nom,f){try{const d=f();bilan(nom,true,d);}catch(e){bilan(nom,false,String(e&&e.stack||e));}}
function vrai(x,m){if(!x)throw new Error(m||'faux');}
const copie=x=>JSON.parse(JSON.stringify(x)),J=JSON.stringify;
const T=Gn.genomeTemoin(cfg),T101=Gn.genomeTemoin(Object.assign({},cfg,{temoin:'c0101'}));
const PAR=Gn.BORNES.reduce((o,b)=>{o[b.cle]=b;return o;},{});

/* ===== (m1) LA TABLE ===== */
/* (28/11/2026, lot « genes v4 ») 12 drapeaux, 33 reels : sortieOn garde sortieT et sortieJauge, rienOn garde rienEcart */
test('(m1) GARDES : 12 drapeaux, 33 reels ; les reels des gestes, du portage, des genes v4, de la loi « retour » et volRetour y sont tous',()=>{
  const dr=Object.keys(Gn.GARDES),re=Object.keys(Gn.GARDE_DE);
  vrai(dr.length===12&&re.length===33,dr.length+' drapeaux, '+re.length+' reels');
  for(const d of dr)vrai(PAR[d].type==='drapeau',d);
  for(const r of re)vrai(PAR[r].type==='reel'&&Gn.CONTINUS.includes(r),r);
  const attendus=['volRetour','retMarge','retCap','retGain','retAvance','retourPrime'].concat(Gn.GESTES.filter(b=>b.type==='reel').map(b=>b.cle),Gn.PORTAGE.filter(b=>b.type==='reel').map(b=>b.cle),
    Gn.GENES_V4.filter(b=>b.type==='reel').map(b=>b.cle));
  vrai(JSON.stringify(attendus.slice().sort())===JSON.stringify(re.slice().sort()),'attendus '+attendus.join(',')+' ; table '+re.join(','));
  vrai(T.A.volRetourOn===0&&T.A.retourOn===0&&dr.every(d=>T.A[d]===0),'le temoin c0025 a un drapeau de garde allume');
  vrai(Gn.reelsLus(T).length===58,'le temoin lit '+Gn.reelsLus(T).length+' reels');
  return dr.map(d=>d+' : '+Gn.GARDES[d].join(', ')).join('\n')+'\nle temoin c0025 lit '+Gn.reelsLus(T).length+' reels sur '+Gn.CONTINUS.length;});

/* ===== LES VUES ===== */
const EX=require(path.join(D,'..','ecurie','etude','selection-naturelle','inventaire','vue-exemple.json'));
const D10=['tenu','rien','gauche','droite','cabre','pique','plane','planeCabre','versRoute','versRoutePlane'];
function essai(P,vue){const e0=P.erreurs,o=P.decide(vue);return {o,erreur:P.erreurs>e0?P.derniere:null};}
function vueVol(f){const v=copie(EX.vol.vue),R=v.vol.radar.rayons.filter(r=>r.m!=='viser'&&r.m!=='viserPlane'),par={};for(const r of R)par[r.m]=r;
  v.vol.radar.rayons=D10.map(n=>par[n]);v.vol.cible=null;if(f)f(v,par);return v;}
function vueSol(f){const v=copie(EX.sol.vue);if(f)f(v);return v;}
/* les suites de tests/portage.test.js, recopiees (portage.test.js joue ses tests en se chargeant : il ne s'importe pas) */
function suitesPortage(){
  const S=[];
  S.push({nom:'inventaire sol',vues:[vueSol()]},{nom:'inventaire vol',vues:[copie(EX.vol.vue)]});
  S.push({nom:'inventaire sol-vol-vol-sol',vues:[EX.sol.vue,EX.vol.vue,EX.vol.vue,EX.sol.vue].map((x,i)=>{const v=copie(x);v.t=+(10+i*.1).toFixed(2);return v;})});
  for(const carte of ['espace','nuages','grotte'])for(const t of [.2,.5,.65,.8,1.1,2])for(const jauge of [.3,.6,1.7])
    S.push({nom:'bord '+carte+' t '+t+' jauge '+jauge,vues:[vueSol(v=>{v.carte=carte;v.tenue={tient:false,cote:1,t:t,approx:true};v.nitro=Math.min(1,jauge);v.reserve=Math.max(0,jauge-1);})]});
  for(const carte of ['espace','grotte'])for(let i=0;i<=24;i++){const l=+(i*.07).toFixed(2);
    S.push({nom:'libre '+carte+' lacet '+l,vues:[vueSol(v=>{v.carte=carte;v.lacetRoute=0;v.route=v.route.map(p=>Object.assign({},p,{virage:0}));}),
      vueSol(v=>{v.carte=carte;v.t=8.2;v.lacetRoute=l;v.route=v.route.map(p=>Object.assign({},p,{virage:l*p.d/120}));})]});}
  for(const carte of ['espace','grotte'])for(const marge of [-12,-6,-3,0,2,4,6,10])
    S.push({nom:'libre '+carte+' marge '+marge,vues:[vueSol(v=>{v.carte=carte;}),vueSol(v=>{v.carte=carte;v.t=8.2;v.virage=Object.assign({},v.virage,{d:50,marge:marge});})]});
  for(const carte of ['nuages','grotte'])for(const tp of [.6,1.5,2.5])for(const n of [1,2,3])
    S.push({nom:'dessous '+carte+' t '+tp+' vues '+n,vues:Array.from({length:n},(x,i)=>vueVol((v,par)=>{v.carte=carte;v.vol.radar.decor=carte;v.t=+(24.8+.1*i).toFixed(2);
      Object.assign(par.versRoute,{issue:'pose',t:tp,dessous:true,propre:true,axe:.1});Object.assign(par.versRoutePlane,{issue:'pose',t:tp+.3,propre:true,axe:.2,dessous:false});
      Object.assign(par.pique,{issue:'pose',t:tp+.1,propre:true,axe:.15,dessous:false});}))});
  for(const carte of ['nuages','espace','grotte'])for(const haut of [2,3.5,5,7,8.5,10,12,14,16])for(const tp of [1.9,2.4,3])
    S.push({nom:'large '+carte+' haut '+haut+' pose '+tp,vues:[0,1,2,3].map(i=>vueVol((v,par)=>{v.carte=carte;v.vol.radar.decor=carte;v.t=+(24.8+.15*i).toFixed(2);
      v.vol.t=+(.6+.15*i).toFixed(2);v.vol.proche=Object.assign({},v.vol.proche,{haut:haut,lat:-3,axe:.05});v.nitro=.9;v.reserve=1;v.vol.air={reste:5.6,jauges:1};
      Object.assign(par.versRoute,{issue:'pose',t:tp-.15*i,axe:.2,propre:true,dessous:false,air:5});Object.assign(par.versRoutePlane,{issue:'pose',t:tp-.15*i+.2,axe:.25,propre:true,dessous:false,air:4.5});
      Object.assign(par.tenu,par.versRoute,{m:'tenu'});}))});
  return S;}
/* des suites de plus, une ou plusieurs par bloc, pour que chaque reglage ait une occasion de compter (m3) */
function vueCoup(t,ft,o){o=o||{};const v=copie(EX.vol.vue);v.t=t;v.vol.t=ft;v.carte='nuages';v.vol.radar.decor='nuages';v.nitro=o.jauge!=null?Math.min(1,o.jauge):1;v.reserve=o.jauge!=null?Math.max(0,o.jauge-1):1;v.vol.cible=null;
  if(o.air!=null)v.vol.air={reste:o.air,jauges:1};
  const R=v.vol.radar.rayons.filter(r=>r.m!=='viser'&&r.m!=='viserPlane');
  for(const r of R)if(r.m==='versRoute'||r.m==='tenu'){r.issue='pose';r.t=2.5;r.axe=.1;r.propre=true;r.dessous=false;}
  R.push({m:'retour0',issue:'pose',t:o.t0!=null?o.t0:1.6,axe:o.axe0!=null?o.axe0:.1,propre:true,gain:o.gain0!=null?o.gain0:100,lat:0},
    {m:'retour1',issue:'pose',t:o.t1!=null?o.t1:1.5,axe:o.axe1!=null?o.axe1:.1,propre:true,gain:o.gain1!=null?o.gain1:100,lat:0});
  v.vol.radar.rayons=R;v.vol.retours=[{volant:0,manche:0,nitro:false},{volant:0,manche:0,nitro:true}];return v;}
function suitesBlocs(){
  const S=[];
  /* volRetour : le premier vol, « vers la route », la route a 34 m de cote */
  for(const lat of [-34.3,-12,-5,8])for(const vit of [40,120,300])S.push({nom:'volRetour lat '+lat+' vitesse '+vit,vues:[vueVol((v,par)=>{v.vitesse=vit;v.vol.proche=Object.assign({},v.vol.proche,{lat:lat});
    Object.assign(par.versRoute,{issue:'pose',t:1.5,axe:.1,propre:true,dessous:false});})]});
  /* la loi « retour » : ses reglages partent dans o.retours ; retourPrime au choix du depart (un rayon retour0 pareil a versRoute) */
  for(const t of [1,2.5])S.push({nom:'retour depart t '+t,vues:[vueVol((v,par)=>{const r={m:'retour0',issue:'pose',t:t,axe:.1,propre:true,dessous:false,gain:0,lat:-3};
    Object.assign(par.versRoute,r,{m:'versRoute'});Object.assign(par.versRoutePlane,r,{m:'versRoutePlane',t:t+1});v.vol.radar.rayons.push(r);v.vol.retours=[{volant:.4,manche:0,nitro:false}];})]});
  /* les mains lachees : la facon tenue se pose dans t s */
  for(const t of [.2,.3,.4,.6])S.push({nom:'lache pose dans '+t,vues:[0,1].map(i=>vueVol((v,par)=>{v.t=+(24.8+.1*i).toFixed(2);v.vol.proche=Object.assign({},v.vol.proche,{lat:-20});
    Object.assign(par.versRoute,{issue:'pose',t:t,axe:.1,propre:true,dessous:false});Object.assign(par.tenu,par.versRoute,{m:'tenu'});}))});
  /* le slalom : une route droite, trois secondes de sol */
  for(const lat of [0,-6])S.push({nom:'slalom lat '+lat,vues:Array.from({length:30},(x,i)=>vueSol(v=>{v.t=+(8.1+.1*i).toFixed(2);v.lat=lat;v.cap=0;v.lacetRoute=0;
    v.route=v.route.map(p=>Object.assign({},p,{virage:0}));}))});
  /* le coup de nitro : des vols de 2 s, chaque reglage a son seuil */
  const vol=(o,n)=>Array.from({length:n||22},(x,i)=>vueCoup(+(8.2+.1*i).toFixed(2),+(.38+.1*i).toFixed(2),o));
  S.push({nom:'coup simple',vues:vol({})});
  for(const t1 of [.6,.9,1.2,1.4])S.push({nom:'coup pose a '+t1,vues:vol({t1:t1,t0:t1+.1},8)});
  S.push({nom:'coup de travers',vues:vol({axe0:.1,axe1:.3},8)});
  for(const air of [2.4,2.8])S.push({nom:'coup air '+air,vues:vol({air:air},8)});
  S.push({nom:'coup jauge basse',vues:vol({jauge:.4},8)});
  S.push({nom:'coup perte de piste',vues:vol({gain0:100,gain1:70},8)});
  /* le relache : la nitro demandee au sol, puis le vol */
  S.push({nom:'relache',vues:[vueSol(v=>{v.t=8.1;})].concat([.15,.2,.3,.4,.5].map((ft,i)=>vueVol((v,par)=>{v.t=+(8.2+.1*i).toFixed(2);v.vol.t=ft;
    Object.assign(par.versRoute,{issue:'pose',t:2,axe:.1,propre:true,dessous:false});Object.assign(par.tenu,par.versRoute,{m:'tenu'});})))});
  /* la ligne qui suit : un vol qui se pose, puis le sol glisse dans son cap */
  for(const cap of [.3,-.25])S.push({nom:'suit cap '+cap,vues:[vueVol((v,par)=>{v.t=20;Object.assign(par.versRoute,{issue:'pose',t:.3,axe:.4,lat:5,propre:true,dessous:false});
    Object.assign(par.tenu,par.versRoute,{m:'tenu'});})].concat(Array.from({length:9},(x,i)=>vueSol(v=>{v.t=+(20.3+.1*i).toFixed(2);v.cap=cap;v.lat=2;})))});
  /* les figures a marge large : un vol plus long (une seconde figure, largeT2), et moins d'air (largeAir) */
  for(const air of [5.6,4.2,3.2])for(const tp of [2.4,3])S.push({nom:'large long air '+air+' pose '+tp,vues:Array.from({length:10},(x,i)=>vueVol((v,par)=>{v.carte='nuages';v.vol.radar.decor='nuages';
    v.t=+(24.8+.15*i).toFixed(2);v.vol.t=+(.6+.15*i).toFixed(2);v.vol.proche=Object.assign({},v.vol.proche,{haut:6,lat:-3,axe:.05});v.nitro=.9;v.reserve=1;v.vol.air={reste:air,jauges:1};
    Object.assign(par.versRoute,{issue:'pose',t:Math.max(.2,tp-.1*i),axe:.2,propre:true,dessous:false,air:air-.5});Object.assign(par.versRoutePlane,{issue:'pose',t:Math.max(.2,tp-.1*i)+.2,axe:.22,propre:true,dessous:false,air:air-1});
    Object.assign(par.tenu,par.versRoute,{m:'tenu'});}))});
  return S;}
/* (28/11/2026, lot « genes v4 ») et les suites des genes v4 (tests/vues-genes-v4.js) : la nitro au decollage sur decor, ex-sortie preparee (sortieT, sortieJauge), la bascule vers
   « rien » (rienEcart), la loi fidele et les secours (aucun reel, mais ils changent les lois demandees et la facon : m2 y verifie que retourPrime,
   garde par retourOn, n'est jamais lu pour une loi de secours) */
const SUITES=suitesPortage().concat(suitesBlocs(),require(path.join(__dirname,'vues-genes-v4.js')).suitesV4());
function decisions(P,S){return S.map(s=>{P.neuve();return s.vues.map(v=>essai(P,copie(v)));});}
const pilote=g=>charger('evolution.js',{source:Gn.ecrirePilote(g,{cfg})});
const empreinte=R=>JSON.stringify(R);
/* un genome a partir d'une base, des drapeaux et des reglages poses (repare : les contraintes de reparer ne touchent aucun reel garde) */
function genomeDe(base,poser){const g=copie(base);Object.assign(g.A,poser);Gn.reparer(g,cfg);for(const k in poser)vrai(g.A[k]===poser[k],'reparer a change '+k);return g;}
/* « tout allume sauf d » : c0101 (le portage allume), les cinq gestes, retourOn, volRetourOn ; puis d eteint */
const TOUT={};for(const d in Gn.GARDES)TOUT[d]=1;
/* (28/11/2026, lot « genes v4 ») « tout allume » allume aussi les deux genes v4 sans reel : les secours et la loi fidele suivie */
TOUT.secoursOn=1;TOUT.loiFidele=2;
const BASES={c0025:d=>({base:T,poser:{}}),toutSauf:d=>({base:T101,poser:Object.assign({},TOUT,{[d]:0})})};

/* ===== (m2) DRAPEAU ETEINT : aucune decision ne change ===== */
test('(m2) drapeau eteint : chaque reel garde pousse a ses bornes ne change aucune decision ('+SUITES.length+' suites, deux pilotes)',()=>{
  /* une vue peut porter des rayons que ce pilote n'a pas demandes (retour0 sans loi « retour » ni coup) : « YEUX CHANGES », la meme erreur quel que soit
     le reglage ; elle entre dans la comparaison comme une decision (toute autre erreur fait echouer) */
  const L=[];let n=0,vues=0,yeux=0;
  for(const nomBase in BASES)for(const d in Gn.GARDES){
    const {base,poser}=BASES[nomBase](d);const ref=decisions(pilote(genomeDe(base,poser)),SUITES),eR=empreinte(ref);
    for(const x of ref)for(const y of x){vues++;if(y.erreur){vrai(/^YEUX CHANGES/.test(y.erreur),nomBase+' / '+d+' : erreur du cerveau '+y.erreur);yeux++;}}
    /* sur c0025 (le temoin des populations), chaque reel seul, a chaque borne ; sur « tout allume sauf d », tous les reels de d ensemble, a chaque borne
       (le test reste sous la minute sur un PC charge) */
    const essais=nomBase==='c0025'?[].concat(...Gn.GARDES[d].map(r=>['min','max'].map(c=>({[r]:PAR[r][c]})))):['min','max'].map(c=>Gn.GARDES[d].reduce((o,r)=>{o[r]=PAR[r][c];return o;},{}));
    for(const pose of essais){
      const R=decisions(pilote(genomeDe(base,Object.assign({},poser,pose))),SUITES);n++;
      if(empreinte(R)!==eR){const i=R.findIndex((x,k)=>empreinte(x)!==empreinte(ref[k]));throw new Error(nomBase+' / '+d+' eteint : '+JSON.stringify(pose)+' change « '+SUITES[i].nom+' »');}}
    L.push(nomBase+' / '+d+' eteint : '+Gn.GARDES[d].join(', ')+' muets'+(nomBase==='c0025'?' (un par un)':' (ensemble)'));}
  return n+' pilotes compares, '+vues+' decisions de reference (dont '+yeux+' « YEUX CHANGES » : des rayons retour<i> non demandes)\n'+L.join('\n');});

/* ===== (m3) DRAPEAU ALLUME : chaque reel peut changer une decision ===== */
test('(m3) drapeau allume : chaque reel garde, de sa borne basse a sa borne haute, change au moins une decision',()=>{
  const L=[],muets=[];
  for(const d in Gn.GARDES)for(const r of Gn.GARDES[d]){
    const b=PAR[r];let ou=null;
    for(const nomBase of ['c0025','toutSauf']){
      const {base,poser}=BASES[nomBase](d);const p=Object.assign({},poser,{[d]:1});
      const Pa=pilote(genomeDe(base,Object.assign({},p,{[r]:b.min}))),Pz=pilote(genomeDe(base,Object.assign({},p,{[r]:b.max})));
      /* suite par suite, on s'arrete a la premiere difference */
      const i=SUITES.findIndex(s=>empreinte(decisions(Pa,[s]))!==empreinte(decisions(Pz,[s])));
      if(i>=0){ou=nomBase+' : « '+SUITES[i].nom+' »';break;}}
    if(!ou)muets.push(d+'/'+r);else L.push(d+' / '+r+' ['+b.min+' ; '+b.max+'] : '+ou);}
  vrai(muets.length===0,'drapeau allume, ces reels ne changent rien sur ces vues : '+muets.join(', '));
  return L.join('\n');});

/* ===== (m4) muter ===== */
let MUETTES=null;
function mutationsDe(parent,graine,n,urneComplete){
  const rng=Gr.mulberry32(graine),R=[];
  for(let i=0;i<n;i++){const r=Gn.muter(parent,rng,{phase:i%3===0?'C':'A',cfg,urneComplete});R.push(r);}
  return R;}
test('(m4) muter : aucun reel garde par un drapeau eteint chez le parent ne mute ; meme nombre de reels, memes drapeaux et tetes que l\'ancienne urne',()=>{
  const L=[];
  /* le temoin, puis un genome aux drapeaux de garde tires au hasard (moitie allumes), les reglages a leur naissance */
  const rng0=Gr.mulberry32(77),mixte=copie(T);for(const d in Gn.GARDES)mixte.A[d]=rng0.suivant()<.5?1:0;Gn.reparer(mixte,cfg);
  for(const [nom,P,nb] of [['temoin c0025',T,20000],['drapeaux au hasard ('+Object.keys(Gn.GARDES).filter(d=>mixte.A[d]).join(',')+')',mixte,5000]]){
    const lus=new Set(Gn.reelsLus(P)),neuf=mutationsDe(P,20261128,nb,false),ancien=mutationsDe(P,20261128,nb,true);
    let hors=0,reels=0,reelsAncien=0,lusAllumes=0,muetsAncien=0;
    for(const x of ancien)for(const m of x.mutes)if(PAR[m.cle]&&PAR[m.cle].type==='reel'&&!lus.has(m.cle))muetsAncien++;
    if(nom==='temoin c0025')MUETTES={avant:muetsAncien,reelsAvant:0,apres:0,reelsApres:0,naissances:nb};
    for(let i=0;i<neuf.length;i++){
      const g=neuf[i].genome,h=ancien[i].genome;
      const rN=neuf[i].mutes.filter(m=>PAR[m.cle]&&PAR[m.cle].type==='reel'),rA=ancien[i].mutes.filter(m=>PAR[m.cle]&&PAR[m.cle].type==='reel');
      for(const m of rN){if(!lus.has(m.cle))hors++;else if(Gn.GARDE_DE[m.cle])lusAllumes++;}
      reels+=rN.length;reelsAncien+=rA.length;
      /* le nombre de reels tires : le meme a chaque naissance (une valeur inchangee par la reflexion peut manquer aux deux listes, rarement) */
      vrai(Math.abs(rN.length-rA.length)<=1,nom+' naissance '+i+' : '+rN.length+' reels contre '+rA.length);
      for(const b of Gn.BORNES)if(b.type!=='reel')vrai(g.A[b.cle]===h.A[b.cle],nom+' naissance '+i+' : '+b.cle+' differe de l\'ancienne urne');
      vrai(JSON.stringify(g.WV)===JSON.stringify(h.WV)&&JSON.stringify(g.WS)===JSON.stringify(h.WS),nom+' naissance '+i+' : tetes differentes');}
    vrai(hors===0,nom+' : '+hors+' reels muets ont mute');
    vrai(Math.abs(reels-reelsAncien)<=reelsAncien*.002,nom+' : '+reels+' reels tires contre '+reelsAncien);
    if(nom!=='temoin c0025')vrai(lusAllumes>0,nom+' : les reels des drapeaux allumes ne mutent jamais');
    else Object.assign(MUETTES,{reelsAvant:reelsAncien,apres:hors,reelsApres:reels});
    L.push(nom+' : '+nb+' naissances, '+reels+' reels mutes (ancienne urne '+reelsAncien+', dont '+muetsAncien+' muets), 0 muet ; '+lusAllumes+' sur des reels gardes par un drapeau allume ; urne de '+lus.size+' reels');}
  /* une urne plus petite que genes : borne a l'urne */
  const r=Gn.muter(T,Gr.mulberry32(5),{phase:'A',cfg,genes:80});vrai(r.mutes.filter(m=>PAR[m.cle].type==='reel').length<=58&&Gn.valider(r.genome,cfg)===null,'genes 80');
  return L.join('\n');});

/* ===== (m5) LA PART DE MUTATIONS MUETTES, AVANT / APRES ===== */
/* les memes 20 000 naissances du temoin que (m4) ; la mesure complete (et en v:2, la population du Ryzen) : node ml/evolution/tests/mesure-muettes.js [--v2] */
test('(m5) la part de mutations muettes sur 20 000 naissances du temoin : ~36 % avant (ancienne urne, v:4), 0 % apres',()=>{
  vrai(MUETTES,'(m4) n\'a pas tourne');
  const av=100*MUETTES.avant/MUETTES.reelsAvant,ap=100*MUETTES.apres/MUETTES.reelsApres;
  vrai(av>30&&av<38,'avant '+av.toFixed(2)+' %');vrai(MUETTES.apres===0,'apres '+ap.toFixed(2)+' %');
  return 'temoin, '+MUETTES.naissances+' naissances : avant '+av.toFixed(2)+' % des reels mutes ('+MUETTES.avant+' sur '+MUETTES.reelsAvant+'), apres '+ap.toFixed(2)+' % ('+MUETTES.apres+' sur '+MUETTES.reelsApres+')';});

/* ===== (m6) genome.js ET L'EPOQUE (la contradiction C7 de la synthese) ===== */
/* (28/11/2026, lot « genes v4 ») m6 RECRIT DANS L'AUTRE SENS (contrat notes/genes-v4.md § 8.1) : un v:4 ne se donne plus a un genome.js d'avant (son
   valider dit « version 4 », et 3 % par drapeau allument des genes qu'il ne sait pas ecrire). Les mutants sont donc faits par l'ANCIEN genome.js
   (ddca156d8, v:3), puis migres : meme identifiant, et le pilote de l'ancien (ecrit avec SON modele.js) decide comme celui d'aujourd'hui. */
test('(m6) genome.js n\'est pas dans l\'epoque des courses ; 120 mutants du genome.js de ddca156d8, migres : meme identifiant, memes decisions',()=>{
  vrai(!C.FICHIERS_EPOQUE.includes('ml/evolution/genome.js'),'genome.js est dans FICHIERS_EPOQUE');
  const cp=require('child_process'),COMMIT='ddca156d8';
  const lire=f=>cp.execFileSync('git',['show',COMMIT+':ml/evolution/'+f],{cwd:D,encoding:'utf8',stdio:['ignore','pipe','ignore'],maxBuffer:64<<20}).replace(/\r\n/g,'\n');
  const t=lire('genome.js'),modele=lire('modele.js');
  vrai(t.indexOf('const VERSION=3;')>=0&&modele.indexOf('chancePalierMin')<0&&modele.indexOf('palierMin:12}')>=0,'le code de '+COMMIT+' n\'est pas celui d\'avant les genes v4');
  const dos=path.join(D,'essais','regles');fs.mkdirSync(dos,{recursive:true});const f=path.join(dos,'genome-ddca156d8.js');
  C.ecrireAtomique(f,t.replace("require('./commun')","require('../../commun')").replace("require('./graines')","require('../../graines')"));delete require.cache[f];const G0=require(f);
  const rng=Gr.mulberry32(42),S=SUITES.filter((s,i)=>i<3||i%13===0);let n=0,vues=0;
  for(const nom of ['c0025','c0101']){const base=G0.genomeTemoin(Object.assign({},cfg,{temoin:nom}));let g=base;
    for(let i=0;i<60;i++){g=G0.muter(i%5?g:base,rng,{phase:['A','B','C'][i%3],cfg}).genome;
      const h=copie(g);vrai(Gn.valider(h,cfg)===null&&h.v===Gn.VERSION,nom+' mutant '+i+' non migre');
      vrai(Gn.idDe(h)===G0.idDe(copie(g)),nom+' mutant '+i+' : identifiant');n++;
      if(i%6===0){const a=decisions(charger('evolution.js',{source:G0.ecrirePilote(copie(g),{cfg,modele})}),S),b=decisions(pilote(h),S);
        for(let k=0;k<S.length;k++)for(let j=0;j<a[k].length;j++){vues++;const x=a[k][j],y=b[k][j],o=y.o&&y.o.declic?(({declic,...r})=>r)(y.o):y.o;
          vrai(J(x.o)===J(o)&&x.erreur===y.erreur,nom+' mutant '+i+' / '+S[k].nom+' vue '+j);}}}}
  return n+' genomes v:3 migres en v:'+Gn.VERSION+' : meme identifiant ; '+vues+' decisions de l\'ancien pilote (ancien modele.js) egales au nouveau';});

console.log((rates?'ECHEC':'OK')+' : '+passes+' passes, '+rates+' rates');
process.exit(rates?1:0);
