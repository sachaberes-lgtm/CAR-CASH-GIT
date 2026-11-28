/* ===== LES TESTS DU PORTAGE DE LA BOUCLE PAYANTE, SANS COURSE (2026-11-28, tache « portage » — « le genome doit savoir ecrire c0101 comme il ecrit c0025 ») =====
   (p1) la table : 14 genes de plus en fin de BORNES (apres les gestes), 4 drapeaux a 0, 9 reels, 1 entier ; genome v:3 ; le temoin c0025 les a a
        leur naissance ; chaque reel du portage a la valeur de c0101 (et de c0072 pour largeHaut) dans ses bornes ;
   (p2) les six temoins (c0025, c0026, c0064, c0072, c0087, c0101) : leur genome se lit dans leur fichier, chaque sacre allume UN drapeau de plus
        (ou change un reglage) ; entre c0025 et c0101, seuls dessousMax, dessousPose et les genes du portage different ;
   (p3) LES DECISIONS : pour chaque temoin, le pilote ecrit par son genome decide EXACTEMENT comme son fichier ecrit a la main, sur les deux vues de
        l'inventaire (ml/ecurie/etude/selection-naturelle/inventaire/vue-exemple.json) et sur des variantes faites pour declencher chaque bloc (le bord
        qui lache, la nitro tenue en virage, une pose sous la dalle, un vol subi a marge large), en suites de vues (la memoire compte) ; et chaque
        sacre change au moins une decision par rapport au precedent (sinon ces vues ne prouveraient rien sur son bloc) ;
   (p4) LA MIGRATION v:2 -> v:3 : 200 mutants ecrits par le genome.js d'avant le portage (relu dans git au commit 7f9543955) se lisent, gardent leur
        identifiant, et leur pilote decide comme celui que l'ancien genome.js ecrivait avec l'ancien modele.js ;
   (p5) chaque apport seul, chaque geste sur le code de c0101 : le pilote se charge, decide sans erreur et aussi vite ; drapeaux eteints, des
        reglages du portage pousses a leurs bornes ne changent aucune decision.
   usage : node ml/evolution/tests/portage.test.js   (code 0 si tout passe ; Node pur, aucun jeu charge, quelques secondes) */
'use strict';
const path=require('path'),fs=require('fs'),cp=require('child_process');
const D=path.join(__dirname,'..');
const C=require(path.join(D,'commun.js')),Gn=require(path.join(D,'genome.js')),Gr=require(path.join(D,'graines.js'));
const {charger}=require(path.join(D,'..','bot','piloter.js'));
const cfg=C.lireConfig();
let rates=0,passes=0;
function bilan(nom,ok,detail){if(ok)passes++;else rates++;console.log((ok?'PASSE  ':'ECHEC  ')+nom+(detail?'\n       '+String(detail).split('\n').join('\n       '):''));}
function test(nom,f){try{const d=f();bilan(nom,true,d);}catch(e){bilan(nom,false,String(e&&e.stack||e));}}
function vrai(x,m){if(!x)throw new Error(m||'faux');}
const copie=x=>JSON.parse(JSON.stringify(x));
const NOMS=['c0025','c0026','c0064','c0072','c0087','c0101'];
const cfgDe=n=>Object.assign({},cfg,{temoin:n});
const TEM={};for(const n of NOMS)TEM[n]=Gn.genomeTemoin(cfgDe(n));
const T=TEM.c0025;

/* ===== (p1) LA TABLE ===== */
/* (28/11/2026, lot « genes v4 ») le portage reste aux index 107 a 120 ; les 8 genes v4 viennent apres lui (v:4, 129 genes, 91 reels : tests/genes-v4.test.js) */
test('(p1) 14 genes de plus apres les gestes (index 107 a 120) : 4 drapeaux a 0, 9 reels, 1 entier ; le temoin c0025 les a a leur naissance',()=>{
  vrai(Gn.VERSION===4,'version '+Gn.VERSION);vrai(Gn.BORNES.length===129&&Gn.CONTINUS.length===91,Gn.BORNES.length+' genes, '+Gn.CONTINUS.length+' reels');
  vrai(JSON.stringify(Gn.CLES_V3)===JSON.stringify(Gn.BORNES.slice(0,121).map(b=>b.cle)),'les 121 genes v:3 ont bouge');
  vrai(JSON.stringify(Gn.BORNES.slice(107,121).map(b=>b.cle))===JSON.stringify(Gn.PORTAGE.map(b=>b.cle)),'le portage n\'est pas aux index 107 a 120');
  vrai(JSON.stringify(Gn.BORNES.slice(86,107).map(b=>b.cle))===JSON.stringify(Gn.GESTES.map(b=>b.cle)),'les gestes ont bouge');
  vrai(JSON.stringify(Gn.CLES_V2)===JSON.stringify(Gn.BORNES.slice(0,107).map(b=>b.cle)),'les 107 genes v:2 ont bouge');
  const n={reel:0,drapeau:0,entier:0};for(const b of Gn.PORTAGE)n[b.type]++;
  vrai(n.reel===9&&n.drapeau===4&&n.entier===1,JSON.stringify(n));
  for(const b of Gn.PORTAGE){vrai(b.ou==='R'&&b.naissance>=b.min&&b.naissance<=b.max,b.cle);if(b.type==='drapeau')vrai(b.naissance===0,b.cle+' naissance '+b.naissance);
    vrai(T.A[b.cle]===b.naissance,'temoin c0025 : '+b.cle+' '+T.A[b.cle]);}
  /* les valeurs de la boucle payante dans leurs bornes, avec de la marge (ni a une borne, sauf le 1 de nitroLibreK et le 0 de tenirLibre = c0025) */
  const vus={largeHaut:[9,4,15],nitroLibreK:[1.25,1],tenirLibre:[.05,0],bordNitro:[.7],bordJauge:[.5],largeT1:[2.2],largeT2:[1.8],largeAxe:[.5],largeAir:[1.5],largeMax:[3,2]};
  for(const k in vus){const b=Gn.BORNES.find(x=>x.cle===k);for(const x of vus[k])vrai(x>=b.min&&x<=b.max,k+' : '+x+' hors ['+b.min+', '+b.max+']');}
  return Gn.PORTAGE.map(b=>b.cle+(b.type==='drapeau'?'':' ['+b.min+', '+b.max+'] '+b.naissance)).join(', ');});

/* ===== (p2) LES SIX TEMOINS ===== */
test('(p2) les six temoins : chaque sacre allume un drapeau de plus ou change un reglage ; c0025 -> c0101 = dessousMax, dessousPose et le portage',()=>{
  const dr=n=>Gn.PORTAGE.filter(b=>b.type==='drapeau').map(b=>TEM[n].A[b.cle]).join('');
  const att={c0025:'0000',c0026:'1000',c0064:'1100',c0072:'1110',c0087:'1111',c0101:'1111'};
  for(const n of NOMS){vrai(Gn.valider(TEM[n],cfg)===null,n+' : '+Gn.valider(TEM[n],cfg));vrai(dr(n)===att[n],n+' : drapeaux '+dr(n)+' (attendu '+att[n]+')');
    vrai(JSON.stringify(TEM[n].WV)===JSON.stringify(T.WV)&&JSON.stringify(TEM[n].WS)===JSON.stringify(T.WS),n+' : tetes differentes');}
  const diff=(a,b)=>Gn.BORNES.filter(x=>TEM[a].A[x.cle]!==TEM[b].A[x.cle]).map(x=>x.cle+' '+TEM[a].A[x.cle]+'->'+TEM[b].A[x.cle]);
  const L=[];for(let i=1;i<NOMS.length;i++)L.push(NOMS[i-1]+' -> '+NOMS[i]+' : '+diff(NOMS[i-1],NOMS[i]).join(', '));
  const d=diff('c0025','c0101').map(s=>s.split(' ')[0]),hors=d.filter(k=>k!=='dessousMax'&&k!=='dessousPose'&&!Gn.PORTAGE.some(b=>b.cle===k));
  vrai(hors.length===0,'c0025 -> c0101 change aussi : '+hors.join(', '));
  vrai(JSON.stringify(diff('c0087','c0101'))==='["largeHaut 9->4"]','c0087 -> c0101 : '+diff('c0087','c0101').join(', '));
  /* un temoin inconnu est refuse */
  let leve=false;try{Gn.genomeTemoin(cfgDe('c9999'));}catch(e){leve=/temoin inconnu/.test(e.message);}vrai(leve,'temoin inconnu accepte');
  vrai(Gn.nomTemoin({})==='c0025'&&Gn.nomTemoin(cfg)===(cfg.temoin||'c0025'),'temoin par defaut');
  return L.join('\n')+'\nidentifiants : '+NOMS.map(n=>n+' '+Gn.idDe(TEM[n])).join(', ');});

/* ===== (p3) LES DECISIONS ===== */
const EX=require(path.join(D,'..','ecurie','etude','selection-naturelle','inventaire','vue-exemple.json'));
const D10=['tenu','rien','gauche','droite','cabre','pique','plane','planeCabre','versRoute','versRoutePlane'];
/* (28/11/2026, lot « genes v4 ») les ordres sont compares SANS le champ declic (les compteurs de declenchements : l'enfant le retire avant piloter.js) */
function sansDeclic(o){if(!o||typeof o!=='object'||!('declic' in o))return o;const r=Object.assign({},o);delete r.declic;return r;}
function essai(P,vue){const e0=P.erreurs,o=P.decide(vue);return {o:sansDeclic(o),erreur:P.erreurs>e0?P.derniere:null};}
/* un vol propre (10 rayons, sans cible) ; f(v, par) retouche la vue, par = les rayons par nom */
function vueVol(f){const v=copie(EX.vol.vue),R=v.vol.radar.rayons.filter(r=>r.m!=='viser'&&r.m!=='viserPlane'),par={};for(const r of R)par[r.m]=r;
  v.vol.radar.rayons=D10.map(n=>par[n]);v.vol.cible=null;if(f)f(v,par);return v;}
function vueSol(f){const v=copie(EX.sol.vue);if(f)f(v);return v;}
/* LES SUITES DE VUES (la memoire du pilote compte) : chacune est jouee depuis une memoire neuve */
function suites(){
  const S=[];
  /* les deux vues de l'inventaire, seules et en suite sol, vol, vol, sol */
  S.push({nom:'inventaire sol',vues:[vueSol()]},{nom:'inventaire vol',vues:[copie(EX.vol.vue)]});
  S.push({nom:'inventaire sol-vol-vol-sol',vues:[EX.sol.vue,EX.vol.vue,EX.vol.vue,EX.sol.vue].map((x,i)=>{const v=copie(x);v.t=+(10+i*.1).toFixed(2);return v;})});
  /* c0064 : la route lache, le bord dans t s, map sans decor (espace, nuages) ou a decor (grotte) */
  for(const carte of ['espace','nuages','grotte'])for(const t of [.2,.5,.65,.8,1.1,2])for(const jauge of [.3,.6,1.7])
    S.push({nom:'bord '+carte+' t '+t+' jauge '+jauge,vues:[vueSol(v=>{v.carte=carte;v.tenue={tient:false,cote:1,t:t,approx:true};v.nitro=Math.min(1,jauge);v.reserve=Math.max(0,jauge-1);})]});
  /* c0087 : la nitro allumee (vue 1, route droite) puis un virage de plus en plus fort (vue 2), map sans decor ou a decor */
  for(const carte of ['espace','grotte'])for(let i=0;i<=24;i++){const l=+(i*.07).toFixed(2);
    S.push({nom:'libre '+carte+' lacet '+l,vues:[vueSol(v=>{v.carte=carte;v.lacetRoute=0;v.route=v.route.map(p=>Object.assign({},p,{virage:0}));}),
      vueSol(v=>{v.carte=carte;v.t=8.2;v.lacetRoute=l;v.route=v.route.map(p=>Object.assign({},p,{virage:l*p.d/120}));})]});}
  /* c0087 (la vitesse) : la nitro allumee, puis une marge de virage de plus en plus courte */
  for(const carte of ['espace','grotte'])for(const marge of [-12,-6,-3,0,2,4,6,10])
    S.push({nom:'libre '+carte+' marge '+marge,vues:[vueSol(v=>{v.carte=carte;}),vueSol(v=>{v.carte=carte;v.t=8.2;v.virage=Object.assign({},v.virage,{d:50,marge:marge});})]});
  /* c0026 : la facon tenue (versRoute) se pose SOUS la dalle, un autre rayon se pose propre dessus ; une a trois vues */
  for(const carte of ['nuages','grotte'])for(const tp of [.6,1.5,2.5])for(const n of [1,2,3])
    S.push({nom:'dessous '+carte+' t '+tp+' vues '+n,vues:Array.from({length:n},(x,i)=>vueVol((v,par)=>{v.carte=carte;v.vol.radar.decor=carte;v.t=+(24.8+.1*i).toFixed(2);
      Object.assign(par.versRoute,{issue:'pose',t:tp,dessous:true,propre:true,axe:.1});Object.assign(par.versRoutePlane,{issue:'pose',t:tp+.3,propre:true,axe:.2,dessous:false});
      Object.assign(par.pique,{issue:'pose',t:tp+.1,propre:true,axe:.15,dessous:false});}))});
  /* c0072 et c0101 : un vol subi sur une map sans decor ; les deux rayons vers la route se posent loin, propres, droits ; la hauteur au-dessus de la
     route la plus proche passe de 2 a 16 m (largeHaut 4 chez c0101, 9 chez c0072, figHaut 15 chez le parent) */
  for(const carte of ['nuages','espace','grotte'])for(const haut of [2,3.5,5,7,8.5,10,12,14,16])for(const tp of [1.9,2.4,3])
    S.push({nom:'large '+carte+' haut '+haut+' pose '+tp,vues:[0,1,2,3].map(i=>vueVol((v,par)=>{v.carte=carte;v.vol.radar.decor=carte;v.t=+(24.8+.15*i).toFixed(2);
      v.vol.t=+(.6+.15*i).toFixed(2);v.vol.proche=Object.assign({},v.vol.proche,{haut:haut,lat:-3,axe:.05});v.nitro=.9;v.reserve=1;v.vol.air={reste:5.6,jauges:1};
      Object.assign(par.versRoute,{issue:'pose',t:tp-.15*i,axe:.2,propre:true,dessous:false,air:5});Object.assign(par.versRoutePlane,{issue:'pose',t:tp-.15*i+.2,axe:.25,propre:true,dessous:false,air:4.5});
      Object.assign(par.tenu,par.versRoute,{m:'tenu'});}))});
  return S;}
function decisions(P,S){return S.map(s=>{P.neuve();return s.vues.map(v=>essai(P,copie(v)));});}
const SUITES=suites();
const FICHIER={};for(const n of NOMS)FICHIER[n]=charger(path.basename(Gn.sourceTemoin(cfgDe(n))),{source:fs.readFileSync(Gn.sourceTemoin(cfgDe(n)),'utf8')});
const ECRIT={};for(const n of NOMS)ECRIT[n]=charger('evolution.js',{source:Gn.ecrirePilote(TEM[n],{cfg})});
const DEC={};
test('(p3) chaque temoin : le pilote ecrit par son genome decide comme son fichier ecrit a la main ('+SUITES.length+' suites de vues, inventaire compris)',()=>{
  const L=[];
  for(const n of NOMS){
    const a=decisions(ECRIT[n],SUITES),b=decisions(FICHIER[n],SUITES);DEC[n]=b;let vues=0;
    for(let i=0;i<SUITES.length;i++)for(let j=0;j<a[i].length;j++){vues++;
      vrai(!a[i][j].erreur&&!b[i][j].erreur,n+' / '+SUITES[i].nom+' vue '+j+' : erreur '+(a[i][j].erreur||b[i][j].erreur));
      vrai(JSON.stringify(a[i][j].o)===JSON.stringify(b[i][j].o),n+' / '+SUITES[i].nom+' vue '+j+' :\n ecrit   '+JSON.stringify(a[i][j].o)+'\n fichier '+JSON.stringify(b[i][j].o));}
    L.push(n+' : '+vues+' decisions identiques ('+path.basename(Gn.sourceTemoin(cfgDe(n)))+')');}
  return L.join('\n');});
test('(p3) chaque sacre change au moins une decision du precedent sur ces vues (les blocs y sont exerces)',()=>{
  const L=[];
  for(let k=1;k<NOMS.length;k++){const a=DEC[NOMS[k-1]],b=DEC[NOMS[k]];const ou=[];
    for(let i=0;i<SUITES.length;i++)if(JSON.stringify(a[i].map(x=>x.o))!==JSON.stringify(b[i].map(x=>x.o)))ou.push(SUITES[i].nom);
    vrai(ou.length>0,NOMS[k-1]+' -> '+NOMS[k]+' : aucune decision ne change');
    L.push(NOMS[k-1]+' -> '+NOMS[k]+' : '+ou.length+' suites changent (ex. '+ou.slice(0,3).join(' ; ')+')');}
  return L.join('\n');});

/* ===== (p4) LA MIGRATION v:2 -> v:3 ===== */
/* genome.js et modele.js d'avant le portage, relus dans git (le commit de la fusion de la boucle payante) ; null si git ne les donne pas */
const AVANT='7f9543955';
function ancien(){
  try{const lire=f=>cp.execFileSync('git',['show',AVANT+':ml/evolution/'+f],{cwd:D,encoding:'utf8',stdio:['ignore','pipe','ignore']}).replace(/\r\n/g,'\n');
    const t=lire('genome.js');if(t.indexOf('const VERSION=2;')<0)return null;
    const dos=path.join(D,'essais','portage');fs.mkdirSync(dos,{recursive:true});
    const f=path.join(dos,'genome-v2.js');
    C.ecrireAtomique(f,t.replace("require('./commun')","require('../../commun')").replace("require('./graines')","require('../../graines')"));
    delete require.cache[f];return {G:require(f),modele:lire('modele.js')};}catch(e){return null;}}
const V2=ancien();
test('(p4) 200 mutants ecrits par le genome.js d\'avant le portage : lus, memes identifiants, et leur pilote decide comme avant',()=>{
  vrai(V2,'git ne donne pas le genome.js du commit '+AVANT+' (lot « genes v4 » : un SAUTE est un echec)');
  const rng=Gr.mulberry32(2811),T2=V2.G.genomeTemoin(cfg);let g=T2,n=0,vues=0;
  vrai(V2.G.idDe(T2)===Gn.idDe(T),'le temoin a change d\'identifiant : '+V2.G.idDe(T2)+' -> '+Gn.idDe(T));
  const quelques=[SUITES[0],SUITES[1],SUITES[2]].concat(SUITES.filter((s,i)=>i%9===0));
  for(let i=0;i<200;i++){
    g=V2.G.muter(i%7?g:T2,rng,{phase:['A','B','C'][i%3],cfg}).genome;
    const id2=V2.G.idDe(g),h=copie(g);
    const d=Gn.valider(h,cfg);vrai(d===null,'mutant '+i+' refuse : '+d);
    vrai(h.v===Gn.VERSION&&Object.keys(h.A).length===Gn.BORNES.length,'mutant '+i+' pas migre');
    vrai(Gn.idDe(h)===id2,'mutant '+i+' : identifiant '+id2+' -> '+Gn.idDe(h));
    const e=Gn.muter(h,rng,{phase:'C',cfg}).genome;vrai(Gn.valider(e,cfg)===null,'enfant du mutant '+i);
    if(i%20===0){
      const Pa=charger('evolution.js',{source:V2.G.ecrirePilote(g,{cfg,modele:V2.modele})}),Pn=charger('evolution.js',{source:Gn.ecrirePilote(h,{cfg})});
      const a=decisions(Pa,quelques),b=decisions(Pn,quelques);
      for(let k=0;k<quelques.length;k++)for(let j=0;j<a[k].length;j++){vues++;vrai(JSON.stringify(a[k][j])===JSON.stringify(b[k][j]),'mutant '+i+' / '+quelques[k].nom+' vue '+j);}}
    n++;}
  return n+' mutants v:2 : valides, migres en v:'+Gn.VERSION+', memes identifiants ; '+vues+' decisions comparees (ancien genome.js + ancien modele.js contre le nouveau)';});

/* ===== (p5) LES APPORTS SEULS, LES GESTES SUR c0101, L'INERTIE ===== */
const DRAPEAUX_GESTES=['lacheOn','slalomOn','coupOn','relacheOn','suitOn'];
function chrono(P){const vs=[copie(EX.sol.vue),copie(EX.vol.vue)];let ms=0,k=0;for(let i=0;i<300;i++){const v=copie(vs[i%2]);P.neuve();const t0=process.hrtime.bigint();P.decide(v);ms+=Number(process.hrtime.bigint()-t0)/1e6;k++;}return ms/k;}
test('(p5) chaque apport seul sur c0025, chaque geste sur c0101, tout allume : le pilote se charge, decide sans erreur, aussi vite',()=>{
  const cas=[];
  for(const b of Gn.PORTAGE.filter(x=>x.type==='drapeau')){const g=copie(T);g.A[b.cle]=1;cas.push(['c0025 + '+b.cle,Gn.reparer(g,cfg)]);}
  for(const k of DRAPEAUX_GESTES){const g=copie(TEM.c0101);g.A[k]=1;cas.push(['c0101 + '+k,Gn.reparer(g,cfg)]);}
  {const g=copie(TEM.c0101);for(const k of DRAPEAUX_GESTES)g.A[k]=1;g.A.retourOn=1;cas.push(['c0101 + les cinq gestes + retourOn',Gn.reparer(g,cfg)]);}
  const m25=chrono(ECRIT.c0025),L=['c0025 '+m25.toFixed(4)+' ms','c0101 '+chrono(ECRIT.c0101).toFixed(4)+' ms'];
  for(const [nom,g] of cas){
    const t=Gn.ecrirePilote(g,{cfg}),code=t.replace(/\/\*[\s\S]*?\*\//g,'');
    for(const mot of [/\brequire\s*\(/,/Math\.random/,/\bDate\b/,/\beval\s*\(/,/\bFunction\s*\(/])vrai(!mot.test(code),nom+' : '+mot);
    const P=charger('evolution.js',{source:t});
    const R=decisions(P,SUITES);for(let i=0;i<R.length;i++)for(const x of R[i])vrai(!x.erreur&&x.o&&typeof x.o==='object',nom+' / '+SUITES[i].nom+' : '+x.erreur);
    /* sous 1 ms, ou au plus deux fois le temoin c0025 mesure ici (le PC est partage : un chrono absolu seul ferait echouer le test a tort) */
    const ms=chrono(P);vrai(ms<1||ms<2*m25,nom+' : '+ms.toFixed(4)+' ms par decision (c0025 : '+m25.toFixed(4)+')');L.push(nom+' '+ms.toFixed(4)+' ms');}
  return L.join(' ; ');});
test('(p5) drapeaux du portage eteints : ses reglages pousses a leurs bornes ne changent aucune decision de c0025 (toutes les suites)',()=>{
  const L=[];
  for(const cote of ['min','max']){const g=copie(T);for(const b of Gn.PORTAGE)if(b.type!=='drapeau')g.A[b.cle]=b[cote];Gn.reparer(g,cfg);
    const P=charger('evolution.js',{source:Gn.ecrirePilote(g,{cfg})}),a=decisions(P,SUITES);
    for(let i=0;i<SUITES.length;i++)vrai(JSON.stringify(a[i])===JSON.stringify(DEC.c0025[i]),cote+' / '+SUITES[i].nom);
    vrai(Gn.idDe(g)!==Gn.idDe(T),'des reglages changes gardent l\'identifiant');L.push(cote+' : '+SUITES.length+' suites identiques');}
  return L.join(' ; ');});
test('(p5) identifiants : un genome c0025 migre garde le sien ; allumer un apport le change ; le genome c0101 n\'est pas celui de c0025',()=>{
  const g=copie(T);g.A.bordOn=1;vrai(Gn.idDe(g)!==Gn.idDe(T),'bordOn allume garde l\'identifiant');
  vrai(Gn.idDe(TEM.c0101)!==Gn.idDe(T),'c0101 = c0025');
  /* un v:2 (107 genes) : les gestes allumes, le portage absent -> migre a sa naissance, meme sha que le v:2 entier */
  const v2={v:2,A:{},WV:T.WV.slice(),WS:T.WS.slice()};for(const k of Gn.CLES_V2)v2.A[k]=T.A[k];v2.A.coupOn=1;
  const sha2=C.sha1(JSON.stringify({v:2,A:v2.A,WV:v2.WV,WS:v2.WS})),h=copie(v2);
  vrai(Gn.valider(h,cfg)===null&&h.v===Gn.VERSION,'v:2 non migre');vrai(Gn.shaGenome(h)===sha2&&Gn.shaGenome(v2)===sha2,'sha d\'un v:2 a geste allume change par la migration');
  /* un v:2 abime (une cle manque) n'est pas migre */
  const b=copie(v2);delete b.A.marge;vrai(Gn.valider(b,cfg)!==null&&b.v===2,'un v:2 abime est passe');
  return 'c0025 '+Gn.idDe(T)+', c0101 '+Gn.idDe(TEM.c0101);});

/* ===== (p6) LE TEMOIN D'UN ETAT : il le garde ; --repartir-de archive sans rien effacer ===== */
const E=require(path.join(D,'evoluer.js'));
test('(p6) options : --repartir-de c0101 lu ; un temoin inconnu, --repartir-de avec --banc ou --valider-maintenant : refuses',()=>{
  const a=E.lireOptions(['--repartir-de','c0101','--une-generation']);vrai(a.o&&a.o.repartirDe==='c0101'&&a.o.arretApres===1,JSON.stringify(a));
  vrai(E.lireOptions(['--repartir-de=c0072']).o.repartirDe==='c0072','--repartir-de=c0072');
  vrai(E.lireOptions([]).o.repartirDe===null,'sans option');
  for(const [x,re] of [[['--repartir-de','c9999'],/temoin inconnu/],[['--repartir-de'],/attend une valeur/],[['--repartir-de','c0101','--banc'],/ne vont pas ensemble/],
    [['--repartir-de','c0101','--valider-maintenant'],/ne vont pas ensemble/]]){const r=E.lireOptions(x);vrai(r.erreur&&re.test(r.erreur),x.join(' ')+' -> '+JSON.stringify(r));}
  vrai(/--repartir-de NOM/.test(E.USAGE),'l\'aide ne dit pas --repartir-de');
  return 'ok';});
test('(p6) un etat ne de c0025 garde son temoin quand config.json en demande un autre ; archiverEtat deplace tout, n\'efface rien, garde machine.json',()=>{
  const d=path.join(D,'essais','portage','etat-p6'),ch=path.join(D,'essais','portage','champions-p6');
  fs.rmSync(d,{recursive:true,force:true});fs.rmSync(ch,{recursive:true,force:true});fs.mkdirSync(d,{recursive:true});fs.mkdirSync(ch,{recursive:true});
  /* un etat d'avant le portage : population.json sans temoinNom, genome v:2 (107 genes) */
  const g2={v:2,A:{},WV:T.WV.slice(),WS:T.WS.slice()};for(const k of Gn.CLES_V2)g2.A[k]=T.A[k];
  const id=Gn.idDe(g2);
  const pop={format:'evolution-population-1',generation:3,etape:'fin',phase:'A',temoin:id,champion:{id:id,depuis:0,fichier:null,revalider:false},
    vivants:[{id:id,genome:g2,ne:0,parents:[],origine:'temoin',mutes:[],pannesGeneration:0}],dejaVus:[id]};
  fs.writeFileSync(path.join(d,'population.json'),JSON.stringify(pop)+'\n');
  for(const f of ['generations.jsonl','validations.jsonl','morts.jsonl','coffre.jsonl','courses-1.jsonl','tableau.html'])fs.writeFileSync(path.join(d,f),'{"x":1}\n');
  fs.writeFileSync(path.join(d,'machine.json'),'{"format":"evolution-machine-1"}\n');fs.writeFileSync(path.join(d,'sortie.log'),'console\n');fs.writeFileSync(path.join(d,'node.txt'),'chemin\n');
  fs.mkdirSync(path.join(d,'pilotes'));fs.writeFileSync(path.join(d,'pilotes','a.js'),'x');
  fs.writeFileSync(path.join(ch,'g0002-aaaaaaaa.js'),'x');fs.writeFileSync(path.join(ch,'g0002-aaaaaaaa.json'),'{}');
  const c=Object.assign(C.lireConfig(),{dossierEtat:d,dossierChampions:ch,temoin:'c0101'});
  const dit=[];const ctx=E.charger(c,{dire:t=>dit.push(t)});
  try{
    vrai(c.temoin==='c0025'&&c._temoinDemande==='c0101','cfg.temoin '+c.temoin+' (demande '+c._temoinDemande+')');
    vrai(dit.some(t=>/la config demande c0101, la population est nee de c0025 : elle le garde/.test(t)&&/--repartir-de c0101/.test(t)),'pas dit : '+dit.join(' | '));
    vrai(ctx.pop.vivants[0].genome.v===Gn.VERSION,'le vivant v:2 n\'est pas migre au chargement');
    vrai(Gn.idDe(ctx.pop.vivants[0].genome)===id,'identifiant change par la migration');
  }finally{if(ctx&&ctx.ord)ctx.ord.arreter({dur:true}).catch(()=>{});}
  const avant=fs.readdirSync(d).sort();
  const a=E.archiverEtat(c,'c0101',t=>dit.push(t));
  vrai(a.ok&&a.dossier,'archive : '+JSON.stringify(a));
  const reste=fs.readdirSync(d).sort();
  vrai(JSON.stringify(reste)===JSON.stringify(['archives','machine.json','node.txt','sortie.log']),'il reste : '+reste.join(', '));
  const dedans=fs.readdirSync(a.dossier).sort();
  for(const f of avant)if(!['machine.json','sortie.log','node.txt'].includes(f))vrai(dedans.includes(f),f+' manque dans l\'archive');
  vrai(fs.existsSync(path.join(a.dossier,'pilotes','a.js'))&&fs.existsSync(path.join(a.dossier,'champions','g0002-aaaaaaaa.js'))&&fs.readdirSync(ch).length===0,'champions ou pilotes');
  const J=JSON.parse(fs.readFileSync(path.join(a.dossier,'ARCHIVE.json'),'utf8'));
  vrai(J.temoinAncien==='c0025'&&J.temoinNeuf==='c0101'&&J.generation===3&&J.champions===2,'ARCHIVE.json '+JSON.stringify(J));
  vrai(/-c0025$/.test(path.basename(a.dossier)),'nom de l\'archive '+path.basename(a.dossier));
  /* un etat vide : rien a archiver, pas d'erreur */
  const b=E.archiverEtat(Object.assign({},c,{dossierChampions:ch}),'c0101',()=>{});vrai(b.ok&&b.dossier===null,'etat vide : '+JSON.stringify(b));
  /* une population neuve prend le temoin demande */
  const c2=Object.assign(C.lireConfig(),{dossierEtat:d,dossierChampions:ch,temoin:'c0101'}),ctx2=E.charger(c2,{dire:()=>{}});
  try{vrai(ctx2.pop===null&&c2.temoin==='c0101','etat archive : temoin '+c2.temoin);}finally{if(ctx2&&ctx2.ord)ctx2.ord.arreter({dur:true}).catch(()=>{});}
  return path.relative(D,a.dossier).split(path.sep).join('/')+' : '+dedans.length+' entrees ; il reste '+reste.join(', ');});

/* ===== (p7) --repartir-de ET UN STOP (28/11/2026, le relecteur : « un STOP pendant ou juste apres le controle d'identite laissait un etat vide,
   que le lancement suivant remplissait depuis config.json, donc depuis c0025 ») =====
   Dans un processus a part : evoluer.principal sur un etat fabrique ne de c0025, le controle d'identite remplace par un faux qui reussit tout de
   suite (aucune course) ; (i) le faux pose STOP pendant le controle : refus, code 1, rien n'est archive ; (ii) STOP pose juste apres l'archivage :
   la population neuve de c0101 est quand meme nee (population.json temoinNom c0101), puis la marche s'arrete avant toute course. */
function etatC0025(d){
  fs.rmSync(d,{recursive:true,force:true});fs.mkdirSync(d,{recursive:true});
  const g2={v:2,A:{},WV:T.WV.slice(),WS:T.WS.slice()};for(const k of Gn.CLES_V2)g2.A[k]=T.A[k];const id=Gn.idDe(g2);
  fs.writeFileSync(path.join(d,'population.json'),JSON.stringify({format:'evolution-population-1',generation:3,etape:'fin',phase:'A',temoin:id,
    champion:{id:id,depuis:0,fichier:null,revalider:false},vivants:[{id:id,genome:g2,ne:0,parents:[],origine:'temoin',mutes:[],pannesGeneration:0}],dejaVus:[id]})+'\n');
  fs.writeFileSync(path.join(d,'generations.jsonl'),'{"x":1}\n');}
const ENFANT=String.raw`'use strict';
const path=require('path'),fs=require('fs');
const [D,mode,etat]=process.argv.slice(2);
const I=require(path.join(D,'identite.js'));
const stop=path.join(etat,'STOP');
I.verifier=async function(){if(mode==='pendant')fs.writeFileSync(stop,'');return {ok:true,lignes:[],temoin:'c0101'};};
if(mode==='apres'){const w=process.stdout.write.bind(process.stdout);
  process.stdout.write=function(t){if(/une population neuve va naitre/.test(String(t)))fs.writeFileSync(stop,'');return w.apply(null,arguments);};}
require(path.join(D,'evoluer.js')).principal(['--etat',etat,'--travailleurs','1','--repartir-de','c0101']).then(c=>process.exit(c),e=>{console.error(e&&e.stack||e);process.exit(9);});`;
test('(p7) --repartir-de c0101 et un STOP : pendant le controle -> refus, rien d\'archive ; juste apres l\'archivage -> la population de c0101 nait quand meme',()=>{
  const dos=path.join(D,'essais','portage');fs.mkdirSync(dos,{recursive:true});
  const f=path.join(dos,'p7-enfant.js');fs.writeFileSync(f,ENFANT);
  const L=[];
  for(const mode of ['pendant','apres']){
    const d=path.join(dos,'etat-p7-'+mode);etatC0025(d);
    const r=cp.spawnSync(process.execPath,[f,D,mode,d],{encoding:'utf8',timeout:120000});
    const sortie=(r.stdout||'')+(r.stderr||'');
    const pop=C.lireJson(path.join(d,'population.json'),null),arch=fs.existsSync(path.join(d,'archives'))?fs.readdirSync(path.join(d,'archives')):[];
    if(mode==='pendant'){
      vrai(r.status===1,'pendant : code '+r.status+'\n'+sortie.slice(-1500));
      vrai(pop&&!pop.temoinNom&&pop.generation===3&&arch.length===0,'pendant : l\'etat a bouge (archives '+arch.join(',')+')');
      vrai(/REPARTIR REFUSE : arret demande pendant le controle/.test(sortie),'pendant : pas de refus dit\n'+sortie.slice(-1500));}
    else{
      vrai(r.status===0,'apres : code '+r.status+'\n'+sortie.slice(-1500));
      vrai(arch.length===1,'apres : archives '+arch.join(','));
      vrai(pop&&pop.temoinNom==='c0101'&&pop.generation===0,'apres : population.json '+(pop?'temoinNom '+pop.temoinNom+' generation '+pop.generation:'absent')+'\n'+sortie.slice(-1500));
      vrai(pop.temoin===Gn.idDe(TEM.c0101),'apres : le temoin de la population neuve n\'est pas c0101');}
    L.push(mode+' : code '+r.status+', archives '+arch.length+', population '+(pop?(pop.temoinNom||'c0025')+' g'+pop.generation:'absente'));}
  return L.join(' ; ');});

console.log((rates?'ECHEC':'OK')+' : '+passes+' passes, '+rates+' rates');
process.exit(rates?1:0);
