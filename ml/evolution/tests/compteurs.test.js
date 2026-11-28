/* ===== LES COMPTEURS DE DECLENCHEMENTS NE DECIDENT RIEN (28/11/2026, lot « genes v4 », second temps : les compteurs) =====
   Contrat : ml/evolution/notes/genes-v4.md § 4 (les noms, les gardes, la regle d'ecriture) et § 8.1 (v1 dans les deux sens, v5, v5 bis). Il fait foi.
   Trois textes du meme pilote : le vrai (const COMPTE=true;), le meme avec const COMPTE=false; (une substitution), et le meme ou tic() LEVE (un
   compteur dont le calcul casse). Les trois doivent rendre les memes ordres (champ « declic » retire) et les memes erreurs, decision par decision.
   (c1) DECLICS colle au texte de modele.js dans les deux sens (chaque nom a son tic('…'), chaque tic('…') est dans DECLICS) ; RACC_CARTES_0 et
        RACC_JUMEAU_0 = les cartes dont le gene raccCartes_* / raccJumeau_* nait a 0 dans BORNES (recalcule) ;
   (c2) la regle d'ecriture, lue dans le texte : chaque tic est dans un bloc if(COMPTE…){try{…}catch(e){}} ; un bloc n'appelle ni teteSol, ni versRoute,
        ni FACONS, ni controleRayons, ni teteRayon, ni raccourci ; il n'ecrit que DECL, AV, JUM, m.cSortie et ses propres constantes ;
   (c3) v5 bis : chacun des 25 noms se declenche sur une suite faite pour lui, gene allume (le piege : une garde mal ecrite ne part jamais) ;
   (c4) v5 sur les suites fixes (portage, genes v4, celles de c3) : chaque gene ne a 0 allume seul, puis tous ensemble (loiFidele 1 puis 2), et c0101 ;
   (c5) v5 sur 3 000 suites de vues tirees au hasard (graine fixe ; vues perturbees : champs nuls, rayons absents ou nuls, issues tirees, lois en trop) :
        le genome de naissance, c0101, tous les drapeaux nes a 0 allumes (loiFidele 1 puis 2) ; et 300 suites pour chaque gene seul ;
   (c6) un genome de naissance ne porte jamais « declic » ; chaque « declic » est un tableau de noms de DECLICS, sans doublon.
   usage : node ml/evolution/tests/compteurs.test.js   (code 0 si tout passe ; Node pur, aucun jeu charge, aucune course) */
'use strict';
const path=require('path'),fs=require('fs');
const D=path.join(__dirname,'..');
const C=require(path.join(D,'commun.js')),Gn=require(path.join(D,'genome.js')),Gr=require(path.join(D,'graines.js'));
const {charger}=require(path.join(D,'..','bot','piloter.js'));
const V=require(path.join(__dirname,'vues-genes-v4.js'));
const cfg=C.lireConfig();cfg.temoin='c0025';
const T=Gn.genomeTemoin(cfg),T101=Gn.genomeTemoin(Object.assign({},cfg,{temoin:'c0101'}));
let rates=0,passes=0;
function bilan(nom,ok,detail){if(ok)passes++;else rates++;console.log((ok?'PASSE  ':'ECHEC  ')+nom+(detail?'\n       '+String(detail).split('\n').join('\n       '):''));}
function test(nom,f){try{const d=f();bilan(nom,true,d);}catch(e){bilan(nom,false,String(e&&e.stack||e));}}
function vrai(x,m){if(!x)throw new Error(m||'faux');}
const copie=V.copie,J=JSON.stringify;
const TEXTE_MODELE=fs.readFileSync(Gn.MODELE,'utf8').replace(/\r\n?/g,'\n');

/* ===== LES TROIS TEXTES D'UN PILOTE ===== */
const VRAI='const COMPTE=true;',FAUX='const COMPTE=false;',TIC='function tic(nom){',TIC_LEVE='function tic(nom){throw new Error(\'compteur casse\');';
function une(texte,a,b){const i=texte.indexOf(a);vrai(i>=0&&texte.indexOf(a,i+1)<0,'« '+a+' » doit paraitre une fois dans le pilote');return texte.slice(0,i)+b+texte.slice(i+a.length);}
function trois(g){
  const t=Gn.ecrirePilote(g,{cfg});
  return {vrai:charger('evolution.js',{source:t}),faux:charger('evolution.js',{source:une(t,VRAI,FAUX)}),leve:charger('evolution.js',{source:une(t,TIC,TIC_LEVE)})};}
function genomeDe(base,poser){const g=copie(base);Object.assign(g.A,poser);Gn.reparer(g,cfg);for(const k in poser)vrai(g.A[k]===poser[k],'reparer a change '+k+' : '+g.A[k]);
  vrai(Gn.valider(copie(g),cfg)===null,'genome refuse : '+Gn.valider(copie(g),cfg));return g;}
function essai(P,vue){const e0=P.erreurs;const o=P.decide(vue);return {o,erreur:P.erreurs>e0?String(P.derniere):null};}
function sansDeclic(o){if(!o||typeof o!=='object'||!('declic' in o))return o;const r=Object.assign({},o);delete r.declic;return r;}

/* LA COMPARAISON : une suite (memoire neuve dans les trois pilotes), decision par decision. Rend les noms vus et le nombre de decisions et d'erreurs. */
const DECLICS=new Set(Gn.DECLICS);
/* sansLeve : le texte ou tic leve n'est pas joue (le genome de naissance, ou tic n'est jamais appele ; les 100 suites par gene seul) : il double le temps */
function comparer(P3,vues,nom,vus,sansLeve){
  P3.vrai.neuve();P3.faux.neuve();if(!sansLeve)P3.leve.neuve();let n=0,err=0,dec=0;
  for(let i=0;i<vues.length;i++){
    const a=essai(P3.vrai,copie(vues[i])),b=essai(P3.faux,copie(vues[i])),c=sansLeve?b:essai(P3.leve,copie(vues[i]));n++;
    const ou=nom+' / vue '+i;
    vrai(a.erreur===b.erreur&&b.erreur===c.erreur,ou+' : erreurs differentes\n vrai '+a.erreur+'\n faux '+b.erreur+'\n leve '+c.erreur);
    if(a.erreur){err++;continue;}
    vrai(!(b.o&&'declic' in b.o),ou+' : COMPTE=false porte declic');
    vrai(!(c.o&&'declic' in c.o),ou+' : tic qui leve, et pourtant declic : '+J(c.o.declic));
    vrai(J(sansDeclic(a.o))===J(b.o)&&J(b.o)===J(c.o),ou+' : ordres differents\n vrai '+J(a.o)+'\n faux '+J(b.o)+'\n leve '+J(c.o));
    if(a.o&&'declic' in a.o){dec++;const d=a.o.declic;
      vrai(Array.isArray(d)&&d.length>0,ou+' : declic n\'est pas un tableau non vide : '+J(d));
      vrai(new Set(d).size===d.length,ou+' : doublon dans declic '+J(d));
      for(const x of d){vrai(DECLICS.has(x),ou+' : nom hors de DECLICS : '+x);if(vus)vus[x]=(vus[x]||0)+1;}}}
  return {n,err,dec};}

/* ===== LES GENES NES A 0 (drapeaux et le choix loiFidele) ===== */
const NES0=Gn.BORNES.filter(b=>(b.type==='drapeau'||b.type==='choix')&&b.naissance===0).map(b=>b.cle);
const SEULS=[];for(const d of NES0){if(d==='loiFidele'){SEULS.push({nom:'loiFidele 1',poser:{loiFidele:1}},{nom:'loiFidele 2',poser:{loiFidele:2}});}
  else if(d==='coupDecor')SEULS.push({nom:'coupDecor (+coupOn)',poser:{coupOn:1,coupDecor:1}});
  else SEULS.push({nom:d,poser:{[d]:1}});}
const TOUT=lf=>{const p={};for(const d of NES0)p[d]=1;p.loiFidele=lf;return p;};

/* ===== (c3) UNE SUITE PAR NOM ===== */
const parNom={};for(const s of V.suitesPortage().concat(V.suitesV4()))parNom[s.nom]=s.vues;
const vol1=(f)=>V.volRien(1,{f:(v,par)=>{v.vol.proche=Object.assign({},v.vol.proche,{lat:-10,axe:.05});if(f)f(v,par);}});
/* un raccourci a gauche : la route tient, un troncon s'offre, la sortie gauche promet une pose (ville comme genes-v4.test.js) */
const racc=(carte,t,rayon,o)=>V.vueSol(v=>{v.carte=carte;v.t=t;v.troncons=[{d:100}];v.tenue={tient:true,approx:true};v.nitro=(o&&o.nitro!=null)?o.nitro:.1;v.reserve=0;
  v.sorties={pourquoi:'demande',bord:null,droite:null,saut:null,gauche:{t:.6,rayons:[V.pose(Object.assign({m:'versRoute',t:1.5,axe:.2,gain:200,lat:-3,chute:20,air:3},rayon||{}))]}};});
const coupVue=(carte,i)=>V.vueVol((v,par)=>{v.carte=carte;v.vol.radar.decor=carte;v.t=+(30+.1*i).toFixed(2);v.vol.t=+(.7+.1*i).toFixed(2);v.nitro=1;v.reserve=1;v.vol.air={reste:5,jauges:1};
  Object.assign(par.versRoute,V.pose({m:'versRoute',t:2.5,axe:.2}));Object.assign(par.tenu,par.versRoute,{m:'tenu'});
  v.vol.radar.rayons.push(V.pose({m:'retour0',t:1.6,gain:100,lat:0}),V.pose({m:'retour1',t:1.5,gain:100,lat:0}));v.vol.retours=[{volant:0,manche:0,nitro:false},{volant:0,manche:0,nitro:true}];});
const DECLENCHE=[
  {nom:'volRetourOn',poser:{volRetourOn:1,volRetour:1.5},vues:vol1()},
  {nom:'retourOn',poser:{retourOn:1},vues:V.volRien(1,{f:(v,par)=>{Object.assign(par.versRoute,{issue:'choc',t:.9,cause:'roche'});Object.assign(par.tenu,par.versRoute,{m:'tenu'});
    v.vol.radar.rayons.push(V.pose({m:'retour0',t:1,axe:0,gain:500}));v.vol.retours=[{volant:.5,manche:0,nitro:false}];}})},
  {nom:'retourOn.reacteur',poser:{retourOn:1},vues:[racc('ville',8.1,{m:'viserPlane'}),racc('ville',8.2,{m:'viserPlane'}),racc('ville',8.3,{m:'viserPlane'})]},
  {nom:'volMieux',poser:{volMieux:1},vues:Array.from({length:6},(x,i)=>V.vueVol((v,par)=>{v.carte='nuages';v.vol.radar.decor='nuages';v.t=+(30+.1*i).toFixed(2);v.vol.t=+(.2+.1*i).toFixed(2);
    Object.assign(par.versRoute,V.pose({m:'versRoute',t:2,axe:.9}));Object.assign(par.tenu,par.versRoute,{m:'tenu'});Object.assign(par.versRoutePlane,V.pose({m:'versRoutePlane',t:1.5,axe:0}));}))},
  {nom:'dessousNitro',poser:{dessousNitro:1},vues:Array.from({length:12},(x,i)=>V.vueSol(v=>{v.carte='nuages';v.t=+(20+.1*i).toFixed(2);v.dessous=true;v.nitro=.1;v.reserve=0;
    v.tenue={tient:true,approx:true};v.couloirs=[];v.mur=null;v.sorties=null;}))},
  {nom:'lacheOn',poser:{lacheOn:1},vues:vol1((v,par)=>{Object.assign(par.versRoute,V.pose({m:'versRoute',t:.2,axe:.1}));Object.assign(par.tenu,par.versRoute,{m:'tenu'});})},
  {nom:'slalomOn',poser:{slalomOn:1},vues:parNom['libre espace lacet 0']},
  {nom:'coupOn',poser:{coupOn:1},vues:[0,1,2].map(i=>coupVue('nuages',i))},
  {nom:'coupDecor',poser:{coupOn:1,coupDecor:1},vues:[0,1,2].map(i=>coupVue('grotte',i))},
  {nom:'relacheOn',poser:{relacheOn:1},vues:[V.vueSol(v=>{v.t=.5;}),V.volRien(1,{f:(v)=>{v.t=.6;v.vol.t=.05;}})[0]]},
  {nom:'suitOn',poser:{suitOn:1},vues:[V.volRien(1)[0],V.vueSol(v=>{v.t=30.1;v.cap=.15;})]},
  {nom:'suitOn.ensuite',poser:{suitOn:1},vues:V.volRien(1)},
  {nom:'fuirVite',poser:{fuirVite:1},vues:parNom['dessous nuages t 1.5 vues 1']},
  {nom:'bordOn',poser:{bordOn:1},vues:parNom['bord espace t 0.2 jauge 1.7']},
  {nom:'largeOn',poser:{largeOn:1},vues:[].concat(...['nuages','espace'].map(c=>[].concat(...[2,3.5,5,7,8.5,10,12,14].map(h=>parNom['large '+c+' haut '+h+' pose 2.4']||[]))))},
  {nom:'libreOn',poser:{libreOn:1},suites:Object.keys(parNom).filter(n=>/^libre espace/.test(n)).map(n=>parNom[n])},
  {nom:'raccCartes',poser:{raccCartes_jade:1},vues:[racc('jade',8.1),racc('jade',8.2)]},
  {nom:'raccJumeau',poser:{raccJumeau_nuages:1},vues:[racc('nuages',8.1,{cible:3})]},
  {nom:'sortieOn',poser:{sortieOn:1},vues:[V.solBord(),V.volApres(),V.vueSol(v=>{v.carte='grotte';v.t=8.3;})]},
  {nom:'sortieOn.vol',poser:{sortieOn:1},vues:[V.solBord(),V.volApres(),V.vueSol(v=>{v.carte='grotte';v.t=8.3;})]},
  {nom:'sortieOn.pose',poser:{sortieOn:1},vues:[V.solBord(),V.volApres(),V.vueSol(v=>{v.carte='grotte';v.t=8.3;})]},
  {nom:'rienOn',poser:{rienOn:1},vues:parNom['rien simple']},
  {nom:'loiFidele.desaccord',poser:{loiFidele:1},vues:parNom['fidele air/pose']},
  {nom:'loiFidele.suit',poser:{loiFidele:2},vues:parNom['fidele air/pose']},
  {nom:'secoursOn',poser:{secoursOn:1},vues:parNom['secours S1']}];
const PILOTES={};
function pilotes(cle,g){if(!PILOTES[cle])PILOTES[cle]=trois(g);return PILOTES[cle];}

/* ===== (c1) DECLICS ET LE TEXTE ===== */
test('(c1) DECLICS colle au texte de modele.js dans les deux sens ; 25 noms, sans doublon ; RACC_CARTES_0 et RACC_JUMEAU_0 recalcules depuis BORNES',()=>{
  vrai(Object.isFrozen(Gn.DECLICS)&&Gn.DECLICS.length===25&&DECLICS.size===25,'DECLICS : '+J(Gn.DECLICS));
  const tics=[...TEXTE_MODELE.matchAll(/\btic\('([^']*)'\)/g)].map(x=>x[1]),ens=new Set(tics);
  for(const n of Gn.DECLICS)vrai(ens.has(n),'pas de tic(\''+n+'\') dans modele.js');
  for(const n of ens)vrai(DECLICS.has(n),'tic(\''+n+'\') hors de DECLICS');
  /* aucune autre facon d'ecrire un nom : tic( n'est appele qu'avec une chaine litterale */
  const code=TEXTE_MODELE.replace(/\/\*[\s\S]*?\*\//g,' ').replace('function tic(nom){','');
  const appels=(code.match(/\btic\(/g)||[]).length,litteraux=(code.match(/\btic\('[^']*'\)/g)||[]).length;
  vrai(appels===litteraux&&litteraux===tics.length,'tic appele sans chaine litterale (ou dans un commentaire) : '+appels+' appels, '+litteraux+' litteraux, '+tics.length+' dans le texte');
  const m=TEXTE_MODELE.match(/const RACC_CARTES_0=(\{[^}]*\}),RACC_JUMEAU_0=(\{[^}]*\});/);vrai(m,'RACC_CARTES_0 / RACC_JUMEAU_0 introuvables');
  const lire=s=>Object.keys(Function('return '+s)()).sort();
  const nait0=f=>Gn.BORNES.filter(b=>b.cle.indexOf(f+'_')===0&&b.naissance===0).map(b=>b.cle.slice(f.length+1)).sort();
  vrai(J(lire(m[1]))===J(nait0('raccCartes')),'RACC_CARTES_0 '+J(lire(m[1]))+' / BORNES '+J(nait0('raccCartes')));
  vrai(J(lire(m[2]))===J(nait0('raccJumeau')),'RACC_JUMEAU_0 '+J(lire(m[2]))+' / BORNES '+J(nait0('raccJumeau')));
  vrai(TEXTE_MODELE.split(VRAI).length===2,'« '+VRAI+' » doit paraitre une fois');
  return tics.length+' tic pour '+ens.size+' noms ; raccCartes nes a 0 : '+nait0('raccCartes').join(',')+' ; raccJumeau nes a 0 : '+nait0('raccJumeau').join(',');});

/* ===== (c2) LA REGLE D'ECRITURE, LUE DANS LE TEXTE ===== */
test('(c2) chaque tic est dans un bloc if(COMPTE…){try{…}catch(e){}} ; aucun appel interdit ; un bloc n\'ecrit que DECL, AV, JUM, m.cSortie et ses constantes',()=>{
  /* le texte sans ses commentaires (remplaces par des blancs de meme longueur : les positions et les lignes restent) */
  const t=TEXTE_MODELE.replace(/\/\*[\s\S]*?\*\//g,x=>x.replace(/[^\n]/g,' ')),blocs=[];
  /* un bloc : de « if(COMPTE » a l'accolade qui ferme celle qui suit la condition (les accolades des chaines et commentaires n'y sont pas) */
  let i=0;while((i=t.indexOf('if(COMPTE',i))>=0){
    let j=i+2,p=0;for(;j<t.length;j++){if(t[j]==='(')p++;else if(t[j]===')'){p--;if(p===0)break;}}
    vrai(t[j+1]==='{','bloc sans accolade a '+i);let k=j+1,a=0;for(;k<t.length;k++){if(t[k]==='{')a++;else if(t[k]==='}'){a--;if(a===0)break;}}
    const corps=t.slice(j+2,k);blocs.push({de:i,a:k,cond:t.slice(i,j+1),corps});i=k;}
  vrai(blocs.length>=25,'blocs : '+blocs.length);
  for(const b of blocs){
    const ligne=t.slice(0,b.de).split('\n').length;
    vrai(/^try\{/.test(b.corps)&&/catch\(e\)\{\}/.test(b.corps),'l.'+ligne+' : le bloc n\'est pas try{…}catch(e){} : '+b.corps.slice(0,80));
    vrai(b.cond==='if(COMPTE)'||b.cond==='if(COMPTE&&REGLAGES.sortieOn>0&&m.cSortie!=null)','l.'+ligne+' : condition '+b.cond);
    for(const f of ['teteSol(','versRoute(','FACONS','controleRayons(','teteRayon(','raccourci(','retourDe('])vrai(b.corps.indexOf(f)<0,'l.'+ligne+' : appel interdit '+f);
    /* les ecritures : a=… (pas ==, =>, <=, >=, !=) ; une cible pointee doit etre m.cSortie ; une cible nue, DECL, AV, JUM ou une constante du bloc */
    const decl=new Set([...b.corps.matchAll(/(?:const|let)\s+([A-Za-z_$][\w$]*)=/g)].map(x=>x[1]).concat([...b.corps.matchAll(/,([A-Za-z_$][\w$]*)=(?![=>])/g)].map(x=>x[1])));
    for(const x of b.corps.matchAll(/([A-Za-z_$][\w$.]*)\s*=(?![=>])/g)){
      const av=b.corps[x.index-1];if(av==='!'||av==='<'||av==='>'||av==='=')continue;const cible=x[1];
      if(cible.indexOf('.')>=0)vrai(cible==='m.cSortie','l.'+ligne+' : un compteur ecrit '+cible);
      else vrai(['DECL','AV','JUM'].includes(cible)||decl.has(cible),'l.'+ligne+' : un compteur ecrit '+cible);}
    vrai(!/\+\+|--/.test(b.corps),'l.'+ligne+' : ++ ou -- dans un compteur');}
  /* chaque tic( est dans un bloc */
  for(const x of t.matchAll(/\btic\('/g))vrai(blocs.some(b=>x.index>b.de&&x.index<b.a),'tic hors d\'un bloc a la ligne '+t.slice(0,x.index).split('\n').length);
  /* DECL n'est ecrit que par tic et par decide (DECL=null en premier), et lu une fois (o.declic=DECL) */
  const ecr=[...t.matchAll(/\bDECL=(?!=)/g)].length;vrai(ecr===3,'DECL ecrit '+ecr+' fois (attendu : sa declaration, tic, decide)');
  vrai(/decide:function\(vue,m\)\{DECL=null;/.test(t)&&/if\(DECL\)o\.declic=DECL;/.test(t),'decide : DECL=null en premier et if(DECL)o.declic=DECL');
  /* ce que les regles lisent : ni DECL, ni AV, ni JUM, ni m.cSortie hors des blocs (et de tic, de decide) */
  let hors=t;for(const b of blocs.slice().reverse())hors=hors.slice(0,b.de)+hors.slice(b.a+1);
  hors=hors.replace(/function tic\(nom\)\{[^\n]*\}/,'').replace(/let DECL=null,AV=null,JUM=null;/,'').replace(/const RACC_CARTES_0=\{[^}]*\},RACC_JUMEAU_0=\{[^}]*\};/,'').replace('DECL=null;const o=','').replace('if(DECL)o.declic=DECL;','');
  hors=hors.replace(/\/\*[\s\S]*?\*\//g,'');
  for(const n of ['DECL','AV','JUM','cSortie','RACC_CARTES_0','RACC_JUMEAU_0'])vrai(!new RegExp('\\b'+n+'\\b').test(hors),n+' est lu hors des compteurs');
  return blocs.length+' blocs de compteurs, tous dans if(COMPTE…){try{…}catch(e){}}';});

/* ===== (c3) CHAQUE NOM SE DECLENCHE ===== */
test('(c3) v5 bis : chacun des 25 noms se declenche sur sa suite (gene allume), et les trois textes rendent les memes ordres',()=>{
  const L=[],tous={};
  for(const d of DECLENCHE){
    const g=genomeDe(T,d.poser),P3=pilotes('seul '+J(d.poser),g),vus={};
    for(const [i,vues] of (d.suites||[d.vues]).entries()){vrai(Array.isArray(vues)&&vues.length,d.nom+' : suite vide');comparer(P3,vues,d.nom+' #'+i,vus);}
    vrai(vus[d.nom]>0,d.nom+' ne se declenche pas (vus : '+J(vus)+')');
    for(const k in vus)tous[k]=(tous[k]||0)+vus[k];
    L.push(d.nom+' : '+vus[d.nom]+' fois'+(Object.keys(vus).length>1?' (avec '+Object.keys(vus).filter(k=>k!==d.nom).join(', ')+')':''));}
  for(const n of Gn.DECLICS)vrai(tous[n]>0,'jamais vu : '+n);
  vrai(DECLENCHE.length===25&&J(DECLENCHE.map(d=>d.nom))===J(Gn.DECLICS),'une suite par nom, dans l\'ordre de DECLICS');
  /* et le meme gene eteint ne dit rien sur la meme suite */
  for(const d of DECLENCHE){const P3=pilotes('naissance',T),vus={};for(const [i,vues] of (d.suites||[d.vues]).entries())comparer(P3,vues,'naissance '+d.nom+' #'+i,vus);
    vrai(Object.keys(vus).length===0,'genome de naissance, suite de '+d.nom+' : declic '+J(vus));}
  return L.join('\n');});

/* ===== (c4) LES SUITES FIXES, CHAQUE GENE SEUL ET TOUS ENSEMBLE ===== */
const FIXES=V.suitesPortage().concat(V.suitesV4()).concat(DECLENCHE.map(d=>({nom:'declenche '+d.nom,vues:d.vues||[].concat(...d.suites)})));
test('(c4) v5, suites fixes : '+SEULS.length+' genes nes a 0 allumes seuls, tous ensemble (loiFidele 1 et 2), c0101 ; les trois textes rendent les memes ordres',()=>{
  const L=[];let n=0,err=0,dec=0;
  const cas=SEULS.map(s=>({nom:s.nom,g:genomeDe(T,s.poser)})).concat([{nom:'tout (loiFidele 1)',g:genomeDe(T,TOUT(1))},{nom:'tout (loiFidele 2)',g:genomeDe(T,TOUT(2))},
    {nom:'c0101 + tout (loiFidele 2)',g:genomeDe(T101,TOUT(2))},{nom:'c0101',g:T101},{nom:'naissance c0025',g:T}]);
  for(const c of cas){const P3=pilotes(c.nom,c.g),vus={};let dc=0;
    for(const s of FIXES){const r=comparer(P3,s.vues,c.nom+' / '+s.nom,vus);n+=r.n;err+=r.err;dec+=r.dec;dc+=r.dec;}
    if(c.nom==='naissance c0025')vrai(dc===0,'le genome de naissance porte declic : '+J(vus));
    L.push(c.nom+' : '+dc+' decisions avec declic'+(dc?' ('+Object.keys(vus).sort().join(', ')+')':''));}
  return n+' decisions comparees ('+err+' erreurs, les memes dans les trois textes ; '+dec+' avec declic)\n'+L.join('\n');});

/* ===== (c5) LES SUITES TIREES AU HASARD ===== */
const CARTES6=['nuages','ville','jade','espace','grotte','canyon'];
const ISSUES=['pose','levre','portail','choc','air','fond','libre','coupe'];
const BASE_VUES=[].concat(...FIXES.map(s=>s.vues)).concat([V.EX.sol.vue,V.EX.vol.vue]);
const BASE_SOL=BASE_VUES.filter(v=>v.mode==='sol'),BASE_VOL=BASE_VUES.filter(v=>v.mode==='vol');
function tirage(rng){
  const u=()=>rng.suivant(),p=x=>u()<x,de=a=>a[Math.floor(u()*a.length)],entre=(a,b)=>+(a+(b-a)*u()).toFixed(3);
  const rayon=m=>{if(p(.03))return null;const r={m,issue:de(ISSUES),t:entre(0,4),approx:p(.5)};
    if(p(.8))r.axe=entre(-1.5,1.5);if(p(.7))r.propre=p(.8);if(p(.3))r.dessous=p(.5);if(p(.7))r.lat=entre(-40,40);if(p(.5))r.gain=entre(-50,700);
    if(p(.5))r.air=entre(0,6);if(p(.3))r.haut=entre(-10,60);if(p(.3))r.chute=entre(0,40);if(p(.2))r.cible=de([3,3110,7,null]);if(p(.1))r.note=de(['lourde','parfaite']);
    if(r.issue==='choc'&&p(.7))r.cause=de(['roche','paroi','pic']);if(p(.04))r.t=null;return r;};
  const sortie=()=>{if(p(.3))return null;const X={t:entre(0,2)};if(p(.08))return X;X.rayons=[];const n=Math.floor(u()*4);
    for(let i=0;i<n;i++)X.rayons.push(rayon(de(['rien','plane','versRoute','viser','viserPlane','versRoutePlane'])));return X;};
  const n=2+Math.floor(u()*11),vues=[];let t=entre(0,60),mode=p(.5)?'sol':'vol';
  for(let i=0;i<n;i++){
    if(p(.3))mode=mode==='sol'?'vol':'sol';
    const v=copie(de(mode==='sol'?BASE_SOL:BASE_VOL));v.t=+(t+.1*i+(p(.05)?entre(0,8):0)).toFixed(2);
    if(p(.6))v.carte=p(.05)?undefined:de(CARTES6);
    if(p(.5)){v.nitro=entre(0,1);v.reserve=p(.5)?0:entre(0,1);}
    if(p(.15))v.nitroLibre=p(.5);
    if(mode==='sol'){
      if(p(.6))v.tenue=p(.15)?null:p(.4)?{tient:true,approx:true}:{tient:false,t:p(.05)?null:entre(0,2),cote:p(.5)?1:-1,approx:p(.5)};
      if(p(.2))v.dessous=p(.6);if(p(.1))v.glisse=p(.5);if(p(.1))v.rebond=p(.5);if(p(.4))v.lat=entre(-35,35);if(p(.4))v.cap=entre(-.6,.6);
      if(p(.3))v.lacetRoute=entre(-1.5,1.5);if(p(.2))v.virage=p(.2)?null:{d:entre(0,300),marge:entre(-12,12),sens:p(.5)?1:-1};
      if(p(.5))v.sorties=p(.1)?null:{pourquoi:'tirage',bord:sortie(),gauche:sortie(),droite:sortie(),saut:null};
      if(p(.25))v.troncons=p(.7)?[{d:entre(40,300)}]:[];if(p(.1))v.couloirs=p(.5)?[]:[{d0:0,d1:entre(10,200)}];
      if(p(.05))v.invulnerable=entre(0,2);if(p(.05))v.route=null;if(p(.05))v.piecesDevant=null;}
    else{
      const f=v.vol;if(p(.4))f.t=entre(0,4);
      if(p(.1))f.proche=null;else if(p(.5)&&f.proche)Object.assign(f.proche,{lat:entre(-60,60),haut:entre(-5,60),axe:entre(-2,2),envers:p(.1)});
      if(p(.3))f.air=p(.2)?null:{reste:entre(0,6),jauges:1};if(p(.1))f.figure=p(.5)?{enCours:1}:null;if(p(.05))f.bumps=1;
      if(p(.1))v.main={geste:p(.5)?'figure':null};
      if(p(.85)&&f.radar){
        const R=['tenu','rien','gauche','droite','cabre','pique','plane','planeCabre','versRoute','versRoutePlane'].map(rayon);
        if(p(.25)){const c=de([3110,7]);f.cible={volant:entre(-1,1),manche:entre(-1,1),s:c};R.push(Object.assign(rayon('viser')||{m:'viser',issue:'air',t:1},{m:'viser',cible:c}),
          Object.assign(rayon('viserPlane')||{m:'viserPlane',issue:'air',t:1},{m:'viserPlane',cible:c}));}else f.cible=null;
        const k=p(.4)?0:Math.floor(u()*5);for(let j=0;j<k;j++)R.push(rayon('retour'+j)||{m:'retour'+j,issue:'air',t:1});
        if(p(.02))R.splice(Math.floor(u()*R.length),1);
        f.radar.rayons=R;
        if(p(.7)){f.retours=[];const kk=p(.2)?Math.floor(u()*5):k;for(let j=0;j<kk;j++)f.retours.push(p(.05)?null:{volant:entre(-1,1),manche:de([-1,0,.5,1]),nitro:p(.3)});}else delete f.retours;}
      else if(p(.5))f.radar=null;}
    if(p(.04)){const champs=['tenue','sorties','route','virage','vol','lat','cap','vitesse','demi'];delete v[de(champs)];}
    vues.push(v);}
  return vues;}
test('(c5) v5, 3 000 suites tirees au hasard (graine 20261128) : naissance, c0101, tout allume (loiFidele 1 et 2) ; 1 000 pour c0101 + tout ; 100 par gene seul',()=>{
  const L=[];const cas=[{nom:'naissance c0025',g:T,n:3000,sansLeve:true},{nom:'c0101',g:T101,n:3000},{nom:'tout (loiFidele 1)',g:genomeDe(T,TOUT(1)),n:3000},
    {nom:'tout (loiFidele 2)',g:genomeDe(T,TOUT(2)),n:3000},{nom:'c0101 + tout (loiFidele 2)',g:genomeDe(T101,TOUT(2)),n:1000}]
    .concat(SEULS.map(s=>({nom:s.nom,g:genomeDe(T,s.poser),n:100,sansLeve:true})));
  const tousVus={};
  for(const c of cas){
    const rng=Gr.mulberry32(20261128),P3=pilotes(c.nom,c.g),vus={};let n=0,err=0,dec=0;
    for(let s=0;s<c.n;s++){const r=comparer(P3,tirage(rng),c.nom+' / tirage '+s,vus,c.sansLeve);n+=r.n;err+=r.err;dec+=r.dec;}
    if(c.nom==='naissance c0025')vrai(dec===0,'le genome de naissance porte declic : '+J(vus));
    for(const k in vus)tousVus[k]=(tousVus[k]||0)+vus[k];
    if(c.n>=1000)L.push(c.nom+' : '+c.n+' suites, '+n+' decisions, '+err+' erreurs (les memes), '+dec+' avec declic'+(dec?' : '+Object.keys(vus).sort().map(k=>k+' '+vus[k]).join(', '):''));
    else vrai(err<n,c.nom+' : tout est erreur');}
  L.push('les genes seuls (100 suites chacun) : tous identiques ; noms vus au hasard, tous cas : '+Object.keys(tousVus).length+' sur 25');
  return L.join('\n');});

console.log('\n'+passes+' passes, '+rates+' echecs');
process.exit(rates?1:0);
