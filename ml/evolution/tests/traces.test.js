'use strict';
/* ===== LES TESTS DES TRACES : arbre.js, histoire.js, l'appel par tableau.js, sauver-traces.cmd (27/11/2026, Sacha : « il faut qu'on garde des traces
   de tous les process, pour un portfolio ») =====
   Aucune course n'est jouee, aucun reseau n'est touche. Le bac : essais/traces/ (ignore par git). sauver-traces.cmd est essaye dans un depot git
   JETABLE cree dans le dossier temporaire du systeme (git init, une copie de ml/evolution/ avec l'etat d'exemple, une « origin » locale nue) :
   jamais dans le vrai depot, jamais vers GitHub.
   1. l'etat d'exemple (30 generations) : arbre.html (page seule, voies sans chevauchement, la fiche de chaque pilote, la difference au parent
      recalculee), histoire.md (dix lignes, une entree par generation, rien d'invente), le message du commit ;
   2. tableau.ecrire refait les deux, et survit a un arbre qui leve ; un etat vide ne fait rien planter ;
   3. un grand etat fabrique avec les vrais operateurs du genome (840 generations, plus de 5 000 pilotes) : taille de la page (< 2 Mo), temps,
      et Chrome sans ecran l'ouvre et ouvre une fiche (si Chrome est la) ;
   4. sauver-traces.cmd (Windows) : refus sur main et bots-ecurie, commit et envoi sur evolution-<pc>, rien de nouveau = pas de commit,
      PAS-D-ENVOI, envoi rate sans erreur, les courses et les pilotes restent dehors, un fichier prepare par quelqu'un d'autre n'est pas emporte.
   node ml/evolution/tests/traces.test.js            -> code 0 si tout passe
   node ml/evolution/tests/traces.test.js --fabriquer <dossier> [generations=840]   -> fabrique seulement un grand etat */
const fs=require('fs'),path=require('path'),os=require('os'),cp=require('child_process'),vm=require('vm');
const EV=path.join(__dirname,'..');
const C=require(path.join(EV,'commun.js'));
const BAC=path.join(EV,'essais','traces');
const EXEMPLE=path.join(__dirname,'etat-exemple');
let echecs=0,total=0;
function ok(nom,vrai,detail){total++;if(vrai)console.log('PASSE  '+nom);else{echecs++;console.log('ECHEC  '+nom+(detail?'\n       '+String(detail).split('\n').join('\n       ').slice(0,1500):''));}}
function essai(nom,f){try{f();}catch(e){total++;echecs++;console.log('ECHEC  '+nom+' : a leve\n       '+(e&&e.stack||e));}}

/* ===== UN GRAND ETAT, FABRIQUE AVEC LES VRAIS OPERATEURS DU GENOME (27/11/2026) =====
   Les genomes sont vrais (genome.js : temoin, muter, croiser, phases A/B/C), les notes sont inventees (un « niveau » herite du parent, plus du bruit).
   Formats d'INTERFACES.md § 3.4 a 3.8. Deterministe (mulberry32 a graine fixe, dates fixes). */
function fabriquer(dossier,nGen,o){
  o=o||{};
  const Gn=require(path.join(EV,'genome.js')),Gr=require(path.join(EV,'graines.js'));
  const cfg=C.lireConfig();
  const MU=o.mu||20,LAMBDA=o.lambda||6,rng=Gr.mulberry32(o.graine||20261127),T0=Date.parse('2026-11-28T09:00:00.000Z');
  const iso=s=>new Date(T0+s*1000).toISOString(),r2=x=>+x.toFixed(2),r4=x=>+x.toFixed(4);
  const tB=Math.floor(nGen/3),tC=Math.floor(2*nGen/3),tEp=Math.floor(nGen*.55);
  const T=Gn.genomeTemoin(cfg),temoin=Gn.idDe(T),dejaVus=new Set([temoin]);
  const vivants=[{id:temoin,genome:T,ne:0,parents:[],origine:'temoin',mutes:[],niv:7.5,nC:0}];
  for(let i=1;i<MU;i++){const r=Gn.muter(T,rng,{phase:'A',cfg,genes:3+rng.entier(4),sigma:.15});const id=Gn.idDe(r.genome);if(dejaVus.has(id)){i--;continue;}dejaVus.add(id);
    vivants.push({id,genome:r.genome,ne:0,parents:[temoin],origine:'g0',mutes:r.mutes,niv:7.2+.6*rng.normal(),nC:0});}
  let champion=temoin,phase='A',phaseDepuis=0,sansSacre=0,horloge=0,validationK=0,epoque='0b1c2d3e4f50';
  const generations=[],morts=[],validations=[],coffre=[];
  let naissancesG=vivants.map(v=>({id:v.id,parents:v.parents,origine:v.origine,mutes:v.mutes.map(m=>m.cle)}));
  const noteDe=v=>{const n=v.nC,a=v.niv+3.2*rng.normal()/Math.sqrt(Math.max(1,n)),ahat=a*(n/(n+12))+7.4*(12/(n+12)),E=Math.max(.5,1.3-.004*v.ne+.1*rng.normal());
    return {id:v.id,n,a:r4(a),ahat:r4(ahat),E:r4(E),F:r4(ahat-4*E),se_F:r4(3.2/Math.sqrt(Math.max(1,n))),ecartClassique:r4(E+.5)};};
  for(let G=0;G<nGen;G++){
    const ev=[],mortsG=[];
    if(G===0)ev.push('premier lancement : epoque '+epoque,'identite verifiee');
    if(G===tEp){epoque='7e8f90a1b2c3';ev.push('nouvelle epoque : ml/bot/yeux.js (0b1c2d3e4f50 -> 7e8f90a1b2c3)','identite verifiee');for(const v of vivants)v.nC=0;}
    if(G>=1){
      naissancesG=[];
      const parNote=vivants.slice().sort((a,b)=>b.niv-a.niv),haut=parNote.slice(0,Math.max(3,Math.floor(parNote.length/2)));
      const ch=vivants.find(v=>v.id===champion)||vivants[0];
      for(let k=0;k<LAMBDA;k++){
        let g,parents,origine;
        if(k===0){g=Gn.muter(ch.genome,rng,{phase,cfg,genes:8,sigma:.3}).genome;parents=[ch.id];origine='immigre';}
        else{const p1=haut[rng.entier(haut.length)];
          if(rng.suivant()<.3){const p2=haut.filter(x=>x!==p1)[rng.entier(haut.length-1)];g=Gn.muter(Gn.croiser(p1.genome,p2.genome,rng),rng,{phase,cfg}).genome;parents=[p1.id,p2.id];origine='croisement';}
          else{g=Gn.muter(p1.genome,rng,{phase,cfg}).genome;parents=[p1.id];origine='mutation';}}
        let id=Gn.idDe(g),e=0;while(dejaVus.has(id)&&e<3){g=Gn.muter(g,rng,{phase,cfg}).genome;id=Gn.idDe(g);e++;}
        if(dejaVus.has(id)){ev.push('enfant abandonne : doublon apres 3 remutations');continue;}
        dejaVus.add(id);
        const p0=vivants.find(v=>v.id===parents[0]);
        const v={id,genome:g,ne:G,parents,origine,mutes:[],niv:p0.niv+.25*rng.normal()+.004,nC:0};
        vivants.push(v);naissancesG.push({id,parents,origine,mutes:[]});}}
    for(const v of vivants)v.nC+=12;
    const notes=new Map(vivants.map(v=>[v.id,noteDe(v)]));
    /* les renvois (un sur 40 : pannes) */
    const elig=vivants.filter(v=>v.id!==temoin&&v.id!==champion&&v.nC>=24).sort((a,b)=>notes.get(a.id).F-notes.get(b.id).F);
    for(const v of elig.slice(0,Math.max(0,vivants.length-MU))){
      const raison=rng.suivant()<.025?'pannes':'renvoi',x=notes.get(v.id);
      mortsG.push({id:v.id,raison});
      morts.push(Object.assign({id:v.id,genome:v.genome,parents:v.parents,origine:v.origine,ne:v.ne,mort:G,raison},x,{epoque}));
      if(raison!=='renvoi')ev.push(v.id+' vire d\'office : 2 pannes de cerveau');
      vivants.splice(vivants.indexOf(v),1);}
    const men=vivants.filter(v=>v.id!==champion&&v.nC>=48).map(v=>notes.get(v.id)).sort((a,b)=>b.F-a.F)[0]||null;
    const duree=2300+300*rng.suivant();horloge+=duree+(G%97===50?5*3600:0);
    let val=null,cof=null;
    if(men&&G%15===14){
      const dFe=men.F-notes.get(champion).F,dF=r4(dFe-.9+.4*rng.normal()),sacre=rng.suivant()<.25;
      const gr=[];for(let i=0;i<24;i++)gr.push(1000000+37*(validationK++));
      val={generation:G,date:iso(horloge),usage:'validation',meneur:men.id,champion,graines:gr,entrainement:{dF:r4(dFe),se_dF:.6},
        validation:{graines:24,dF,se_dF:.42,dPalier:r4(dF+.3),se_dPalier:.8,dE:-.02,se_dE:.07},criteres:{a:sacre,b:true,c:true},sacre,malediction:r4(dFe-dF),maledictionMoyenne:.8,fichier:null};
      if(sacre){const p=vivants.find(v=>v.id===men.id);val.fichier='champions/g'+String(G).padStart(4,'0')+'-'+p.id.slice(0,8)+'.json';
        ev.push('SACRE : '+men.id+' devient champion (ancien : '+champion+') -> '+val.fichier);champion=men.id;sansSacre=0;}
      validations.push(val);}
    if(!(val&&val.sacre))sansSacre++;
    if((val&&val.sacre)||G%36===10){const c=notes.get(champion),t=notes.get(temoin),same=champion===temoin;
      cof={date:iso(horloge),generation:G,epoque,raison:val&&val.sacre?'sacre':'24h',graines:40,
        champion:{id:champion,n:40,palierMoyen:same?7.4:7.7,E:same?1.2:1.1,ecartClassique:same?1.7:1.62},temoin:{id:temoin,n:40,palierMoyen:7.4,E:1.2,ecartClassique:1.7},
        diff:{palier:same?0:.3,E:same?0:-.1,ecartClassique:same?0:-.08}};coffre.push(cof);void c;void t;}
    if(G===tB||G===tC){ev.push('phase '+(G===tB?'B':'C')+' (apres '+sansSacre+' generations sans sacre, '+(G-phaseDepuis)+' depuis la phase '+phase+')');phase=G===tB?'B':'C';phaseDepuis=G;sansSacre=0;}
    const res=x=>x?{id:x.id,n:x.n,a:x.a,ahat:x.ahat,E:x.E,F:x.F,se_F:x.se_F,ecartClassique:x.ecartClassique}:null;
    generations.push({generation:G,date:iso(horloge),duree_s:Math.round(duree),epoque,epoqueNote:'a1b2c3d4e5f6',phase,nGraines:12,graines:[910000],
      courses:{demandees:vivants.length*12,cache:vivants.length*6,jouees:72,nonMesurees:G%50===7?1:0,relancees:0,tuees:0,grainesRetirees:[]},debit_h:110,
      naissances:naissancesG,morts:mortsG,meneur:res(men),temoin:res(notes.get(temoin)),champion:res(notes.get(champion)),
      population:vivants.map(v=>{const x=notes.get(v.id);return {id:v.id,ne:v.ne,n:x.n,ahat:x.ahat,E:x.E,F:x.F,se_F:x.se_F};}),
      distance:r4(Math.max(.03,.12-G*.00005)),distanceW2:phase==='A'?0:.01,sigmaRes:3.3,
      validation:val?{usage:'validation',meneur:val.meneur,champion:val.champion,sacre:val.sacre,dF:val.validation.dF,se_dF:.42}:null,
      coffre:cof?{raison:cof.raison,diff:cof.diff}:null,evenements:ev});}
  const pop={format:'evolution-population-1',generation:nGen-1,etape:'fin',phase,phaseDepuis,sansSacre,epoque:{courses:epoque,note:'a1b2c3d4e5f6',depuis:tEp},rng:1,
    graines:{reserve:[],recentes:[],validationK,validationRepli:false,validationFinie:false},grainesGeneration:[910000],nGraines:12,grainesRetirees:[],regle6:2,temoin,
    champion:{id:champion,depuis:0,fichier:null,revalider:false},derniereValidation:0,dernierCoffre:null,nSacres:0,
    vivants:vivants.map(v=>({id:v.id,genome:v.genome,shaPilote:'0'.repeat(40),ne:v.ne,parents:v.parents,origine:v.origine,mutes:v.mutes,pannesGeneration:0})),
    dejaVus:[...dejaVus],naissancesGeneration:naissancesG,abandonsGeneration:[]};
  fs.rmSync(dossier,{recursive:true,force:true});fs.mkdirSync(dossier,{recursive:true});
  const jl=L=>L.map(x=>JSON.stringify(x)).join('\n')+(L.length?'\n':'');
  fs.writeFileSync(path.join(dossier,'population.json'),JSON.stringify(pop)+'\n');
  fs.writeFileSync(path.join(dossier,'generations.jsonl'),jl(generations));fs.writeFileSync(path.join(dossier,'morts.jsonl'),jl(morts));
  fs.writeFileSync(path.join(dossier,'validations.jsonl'),jl(validations));fs.writeFileSync(path.join(dossier,'coffre.jsonl'),jl(coffre));
  return {nes:dejaVus.size,generations:nGen,morts:morts.length};}

if(process.argv[2]==='--fabriquer'){
  const d=path.resolve(process.argv[3]||path.join(BAC,'grand')),r=fabriquer(d,+(process.argv[4]||840));
  console.log('etat fabrique dans '+d+' : '+r.generations+' generations, '+r.nes+' pilotes, '+r.morts+' morts');process.exit(0);}

/* ---------- les outils des controles ---------- */
const A=require(path.join(EV,'arbre.js')),H=require(path.join(EV,'histoire.js')),TB=require(path.join(EV,'tableau.js'));
function cfgPour(dossier){const cfg=C.lireConfig();cfg.dossierEtat=dossier;return cfg;}
function copie(nom,depuis){const d=path.join(BAC,nom);fs.rmSync(d,{recursive:true,force:true});fs.mkdirSync(d,{recursive:true});if(depuis)fs.cpSync(depuis,d,{recursive:true});return d;}
function donneesDe(html){const m=/<script type="application\/json" id="donnees">([\s\S]*?)<\/script>/.exec(html);return m?JSON.parse(m[1]):null;}
/* le programme de la page, sans navigateur : il expose ARBRE */
function programmeDe(html,D){const m=/<script>\n\(([\s\S]*?)\)\(\);\n<\/script>/.exec(html);if(!m)return null;
  const ctx={DONNEES:D,window:{},JSON,Math,String,Number,Array,Object,Map,Set,Uint8Array,isFinite,RegExp};vm.createContext(ctx);vm.runInContext('('+m[1]+')();',ctx);return ctx.window.ARBRE;}
function controlerPage(nom,html){
  ok(nom+' : commence par <!doctype html>',/^<!doctype html>\n/.test(html));
  ok(nom+' : aucune URL (http, https, //)',!/https?:|\/\/[a-z]/i.test(html.replace(/<script>[\s\S]*<\/script>/,'')),(html.match(/.{0,40}https?:.{0,40}/i)||[''])[0]);
  ok(nom+' : aucune ressource externe (src=, <link, url(), @import, <iframe, <img, fetch)',!/\ssrc=|<link|url\(|@import|<iframe|<img|fetch\(|XMLHttpRequest/i.test(html));
  ok(nom+' : aucun \\r',html.indexOf('\r')<0);
  ok(nom+' : deux scripts dans la page (les donnees, le programme), rien d\'autre',(html.match(/<script/g)||[]).length===2);
  ok(nom+' : aucun NaN ni undefined hors du programme',!/NaN|undefined/.test(html.replace(/<script>[\s\S]*<\/script>/,'')));}
/* les voies : deux pilotes d'une meme voie ne vivent jamais en meme temps */
function voiesSaines(D){
  const parVoie=new Map();
  for(const a of D.noeuds){const fin=a[2]<0?D.g:a[2];if(!parVoie.has(a[6]))parVoie.set(a[6],[]);parVoie.get(a[6]).push([a[1],fin,a[0]]);}
  for(const [v,L] of parVoie){L.sort((x,y)=>x[0]-y[0]);for(let i=1;i<L.length;i++)if(L[i][0]<=L[i-1][1])return 'voie '+v+' : '+L[i-1][2]+' ('+L[i-1][0]+'-'+L[i-1][1]+') et '+L[i][2]+' ('+L[i][0]+'-'+L[i][1]+')';}
  return null;}

/* ===== 1. L'ETAT D'EXEMPLE ===== */
let pageEx=null,Dex=null;
essai('arbre de l\'exemple',()=>{
  const d=copie('exemple',EXEMPLE),cfg=cfgPour(d);
  const t0=Date.now(),f=A.ecrire(cfg,{maintenant:Date.parse('2026-11-27T20:00:00Z')});
  pageEx=fs.readFileSync(f,'utf8');Dex=donneesDe(pageEx);
  ok('arbre : arbre.html ecrit dans le dossier d\'etat ('+(Date.now()-t0)+' ms)',f===path.join(d,'arbre.html')&&fs.existsSync(f));
  controlerPage('arbre',pageEx);
  const gens=C.lireJsonl(path.join(d,'generations.jsonl')),pop=C.lireJson(path.join(d,'population.json')),morts=C.lireJsonl(path.join(d,'morts.jsonl'));
  const ids=new Set();for(const g of gens)for(const b of g.naissances)ids.add(b.id);for(const v of pop.vivants)ids.add(v.id);for(const m of morts)ids.add(m.id);
  for(const g of gens)for(const p of g.population)ids.add(p.id);
  ok('arbre : un noeud par pilote ne ('+ids.size+')',Dex&&Dex.noeuds.length===ids.size&&Dex.noeuds.every(a=>ids.has(a[0])),Dex&&Dex.noeuds.length);
  ok('arbre : chaque pilote une seule fois',Dex&&new Set(Dex.noeuds.map(a=>a[0])).size===Dex.noeuds.length);
  const iT=Dex.temoin,iC=Dex.champion;
  ok('arbre : le temoin est marque et sur la voie 0',iT>=0&&Dex.noeuds[iT][0]===pop.temoin&&Dex.noeuds[iT][6]===0&&(Dex.noeuds[iT][7]&1));
  ok('arbre : le champion en titre est celui de population.json, et marque',iC>=0&&Dex.noeuds[iC][0]===pop.champion.id&&(Dex.noeuds[iC][7]&2)&&(Dex.noeuds[iC][7]&4));
  ok('arbre : les voies ne se chevauchent jamais',voiesSaines(Dex)===null,voiesSaines(Dex));
  ok('arbre : au plus 40 voies ('+Dex.voies+')',Dex.voies<=40);
  /* la lignee : du champion au temoin par les parents, tous marques */
  let i=iC,pas=0,lignee=true;while(i>=0&&pas<200){if(!(Dex.noeuds[i][7]&8))lignee=false;if(i===iT)break;i=Dex.noeuds[i][4];pas++;}
  ok('arbre : la lignee du champion remonte au temoin, chaque ancetre marque',lignee&&i===iT,'arret a '+i);
  ok('arbre : les vivants n\'ont pas de fin, les morts finissent a leur generation de renvoi',
    pop.vivants.every(v=>Dex.noeuds.find(a=>a[0]===v.id)[2]===-1)&&morts.every(m=>Dex.noeuds.find(a=>a[0]===m.id)[2]===m.mort));
  ok('arbre : les morts portent leur raison et leur note finale',morts.every(m=>{const a=Dex.noeuds.find(x=>x[0]===m.id);return a[13]===m.raison&&a[8]===m.F&&a[11]===m.n;}));
  /* la difference au parent, recalculee ici a partir des genomes */
  const genomes=new Map();for(const m of morts)genomes.set(m.id,m.genome);for(const v of pop.vivants)genomes.set(v.id,v.genome);
  let verifies=0,faux=null;
  for(const a of Dex.noeuds){if(a[3]!==2||a[4]<0)continue;const g=genomes.get(a[0]),p=genomes.get(Dex.noeuds[a[4]][0]);if(!g||!p)continue;
    const attendu=Object.keys(g.A).filter(k=>g.A[k]!==p.A[k]).map(k=>k+':'+p.A[k]+'>'+g.A[k]).sort().join(',');
    const rendu=(a[14]||[]).filter(x=>x[0]>=0).map(x=>Dex.genes[x[0]]+':'+x[1]+'>'+x[2]).sort().join(',');
    if(attendu!==rendu&&!faux)faux=a[0]+' attendu '+attendu+' rendu '+rendu;verifies++;}
  ok('arbre : ce qui a change chez '+verifies+' mutants = la difference de leur genome a celui du parent',verifies>20&&!faux,faux);
  const X=programmeDe(pageEx,Dex);
  ok('arbre : le programme de la page se charge hors navigateur et expose la fiche',X&&typeof X.fiche==='function');
  const fC=X.fiche(iC),fT=X.fiche(iT);
  ok('fiche du champion : badge, naissance, ce qui a change (avant → apres), notes',/champion en titre/.test(fC)&&/Né à la <b>génération \d+/.test(fC)&&/→/.test(fC)&&/note F/.test(fC),fC.slice(0,600));
  ok('fiche du temoin : « Le témoin », encore en vie',/Le témoin/.test(fT)&&/Encore en vie/.test(fT),fT.slice(0,400));
  const iX=Dex.noeuds.findIndex(a=>a[3]===3&&a[4]>=0&&a[5]>=0),fX=iX>=0?X.fiche(iX):'';
  ok('fiche d\'un croisement : ses deux parents en liens',/croisement/.test(fX)&&(fX.match(/data-va=/g)||[]).length>=2,fX.slice(0,500));
  const iM=Dex.noeuds.findIndex(a=>a[2]>=0&&a[13]==='renvoi'),fM=iM>=0?X.fiche(iM):'';
  ok('fiche d\'un renvoye : « Renvoyé à la génération N »',/Renvoyé à la <b>génération \d+<\/b>/.test(fM),fM.slice(-400));
  let mauvaise=null;for(let k=0;k<Dex.noeuds.length;k++){const t=X.fiche(k);if(/undefined|NaN|\[object/.test(t)){mauvaise=Dex.noeuds[k][0]+' : '+t.slice(0,300);break;}}
  ok('fiche : aucune des '+Dex.noeuds.length+' fiches n\'affiche undefined, NaN ou [object',!mauvaise,mauvaise);
  ok('fiche : chercher un pilote par le debut de son nom',X.chercher(Dex.noeuds[iC][0].slice(0,6))===iC&&X.chercher('zzzz')===-1);
  ok('arbre : les genes en clair (braqueNitro a son mot)',Dex.mots[Dex.genes.indexOf('braqueNitro')]==='virage au-dessus duquel pas de nitro');
  ok('arbre : chaque gene du genome a un mot simple',Dex.genes.every((k,j)=>Dex.mots[j]),Dex.genes.filter((k,j)=>!Dex.mots[j]).join(','));});

essai('recit de l\'exemple',()=>{
  const d=path.join(BAC,'exemple'),cfg=cfgPour(d);
  const f=H.ecrire(cfg,{maintenant:Date.parse('2026-11-27T20:00:00Z')}),t=fs.readFileSync(f,'utf8');
  const gens=C.lireJsonl(path.join(d,'generations.jsonl'));
  ok('recit : histoire.md ecrit',f===path.join(d,'histoire.md'));
  ok('recit : LF seulement, aucun HTML, aucun undefined ni NaN',t.indexOf('\r')<0&&!/<[a-z\/]/i.test(t)&&!/undefined|NaN|\[object/.test(t),(t.match(/.{0,50}(undefined|NaN|<[a-z]).{0,50}/i)||[''])[0]);
  const bloc=t.split('## Où on en est')[1].split('## Génération par génération')[0];
  const lignes=bloc.split('\n').filter(l=>/^\d+\. /.test(l));
  ok('recit : « Où on en est » en dix lignes numerotees',lignes.length===10,lignes.length+'\n'+bloc);
  ok('recit : une entree par generation, dans l\'ordre',gens.every(g=>t.indexOf('### Génération '+g.generation+' — ')>=0)&&
    gens.every((g,i)=>!i||t.indexOf('### Génération '+g.generation+' — ')>t.indexOf('### Génération '+gens[i-1].generation+' — ')));
  ok('recit : la generation en cours (31) est dite',/### Génération 31 — en cours/.test(t));
  const e20=t.split('### Génération 20 — ')[1].split('### Génération 21')[0];
  ok('recit : le sacre de la generation 20 est dit en clair',/\*\*Il est sacré nouveau champion\.\*\*/.test(e20)&&/Coffre \(après le sacre\)/.test(e20),e20);
  const e13=t.split('### Génération 13 — ')[1].split('### Génération 14')[0];
  ok('recit : la nouvelle epoque et le controle d\'identite sont dits',/Nouvelle époque : ml\/bot\/yeux\.js a changé/.test(e13)&&/Contrôle d'identité réussi/.test(e13),e13);
  const e18=t.split('### Génération 18 — ')[1].split('### Génération 19')[0];
  ok('recit : l\'economie des graines est dite',/Économie : 8 courses par pilote/.test(e18),e18);
  const e25=t.split('### Génération 25 — ')[1].split('### Génération 26')[0];
  ok('recit : le changement de phase est dit',/phase/i.test(e25),e25);
  ok('recit : rien d\'invente : chaque meneur cite est celui du journal',gens.filter(g=>g.meneur).every(g=>t.split('### Génération '+g.generation+' — ')[1].split('###')[0].indexOf('`'+g.meneur.id.slice(0,8)+'`')>=0));
  ok('recit : le champion en titre et la question du coffre en tete',/Le champion en titre est \*\*`/.test(bloc)&&/La sélection apprend-elle vraiment \?/.test(bloc));
  const m=H.message(cfg);
  ok('message du commit : ASCII, generation, naissances, sacres',/^generation 30, \d+ nes, \d+ renvoyes, 1 sacre, champion [0-9a-f]{8}/.test(m)&&/^[\x20-\x7e]+$/.test(m),m);
  ok('nom du PC : minuscules, sans espace',/^[a-z0-9._-]+$/.test(H.nomPc()),H.nomPc());
  ok('evenement inconnu : recopie tel quel',H.evenementClair('quelque chose de neuf')==='quelque chose de neuf');});

/* ===== 2. LE TABLEAU LES REFAIT, ET SURVIT A LEUR ECHEC ; UN ETAT VIDE ===== */
essai('tableau',()=>{
  const d=copie('tableau',EXEMPLE),cfg=cfgPour(d);
  const r=TB.ecrire(cfg);
  ok('tableau.ecrire refait arbre.html et histoire.md',r.traces&&r.traces.arbre===path.join(d,'arbre.html')&&r.traces.histoire===path.join(d,'histoire.md')&&fs.existsSync(r.traces.arbre)&&fs.existsSync(r.traces.histoire),JSON.stringify(r));
  const th=fs.readFileSync(r.html,'utf8');
  ok('tableau.html porte le lien vers l\'arbre et le recit',/href="arbre\.html"/.test(th)&&/href="histoire\.md"/.test(th));
  ok('tableau.html reste sans script',!/<script/i.test(th));
  const cle=require.resolve(path.join(EV,'arbre.js')),vrai=require.cache[cle].exports.ecrire;
  require.cache[cle].exports.ecrire=()=>{throw new Error('arbre casse expres');};
  fs.rmSync(path.join(d,'tableau.html'));fs.rmSync(path.join(d,'histoire.md'));
  let r2=null,leve=null;try{r2=TB.ecrire(cfg);}catch(e){leve=e;}finally{require.cache[cle].exports.ecrire=vrai;}
  ok('un arbre qui leve ne fait pas echouer le tableau',!leve&&fs.existsSync(path.join(d,'tableau.html')),leve&&leve.message);
  ok('l\'echec est rendu, et le recit est quand meme ecrit',r2&&r2.traces.arbre===null&&/arbre casse expres/.test(r2.traces.erreurs.join(' '))&&fs.existsSync(path.join(d,'histoire.md')),r2&&JSON.stringify(r2.traces));});
essai('etat vide',()=>{
  const d=copie('vide',null),cfg=cfgPour(d);
  let leve=null;try{A.ecrire(cfg);H.ecrire(cfg);}catch(e){leve=e;}
  ok('etat vide : arbre et recit s\'ecrivent sans lever',!leve,leve&&leve.stack);
  ok('etat vide : le recit dit que rien n\'a commence',/n'a pas commencé/.test(fs.readFileSync(path.join(d,'histoire.md'),'utf8')));
  const D=donneesDe(fs.readFileSync(path.join(d,'arbre.html'),'utf8'));
  ok('etat vide : arbre sans noeud',D&&D.noeuds.length===0);
  ok('etat vide : message « pas encore de generation »',H.message(cfg)==='pas encore de generation');
  const d2=copie('tronque',EXEMPLE);
  fs.appendFileSync(path.join(d2,'generations.jsonl'),'{"generation":31,"date":"2026-11');
  fs.writeFileSync(path.join(d2,'population.json'),'{"format":"evolution-pop');
  leve=null;try{A.ecrire(cfgPour(d2));H.ecrire(cfgPour(d2));}catch(e){leve=e;}
  ok('etat tronque (population.json coupe, derniere ligne coupee) : rien ne leve',!leve,leve&&leve.stack);});

/* ===== 3. LE GRAND ETAT : 5 000 PILOTES ET PLUS ===== */
essai('grand etat',()=>{
  const d=path.join(BAC,'grand');
  let t0=Date.now();const R=fabriquer(d,840);const tFab=Date.now()-t0;
  ok('grand etat fabrique : '+R.generations+' generations, '+R.nes+' pilotes ('+tFab+' ms)',R.nes>=5000,R.nes);
  const cfg=cfgPour(d);
  t0=Date.now();const f=A.ecrire(cfg);const tA=Date.now()-t0;
  const taille=fs.statSync(f).size,html=fs.readFileSync(f,'utf8'),D=donneesDe(html);
  ok('grand arbre : '+(taille/1048576).toFixed(2)+' Mo (< 2 Mo)',taille<2*1048576);
  ok('grand arbre : ecrit en '+tA+' ms (< 5 s, il est refait a chaque generation)',tA<5000);
  ok('grand arbre : '+D.noeuds.length+' noeuds, '+D.voies+' voies (<= 40), sans chevauchement',D.noeuds.length===R.nes&&D.voies<=40&&voiesSaines(D)===null,voiesSaines(D));
  t0=Date.now();H.ecrire(cfg);const tH=Date.now()-t0,th=fs.statSync(path.join(d,'histoire.md')).size;
  ok('grand recit : ecrit en '+tH+' ms, '+(th/1024).toFixed(0)+' Ko',tH<5000);
  t0=Date.now();TB.ecrire(cfg);ok('le tableau et les deux traces ensemble : '+(Date.now()-t0)+' ms (< 10 s)',Date.now()-t0<10000);
  const X=programmeDe(html,D);let mauvaise=null;
  for(let k=0;k<D.noeuds.length;k++){const t=X.fiche(k);if(/undefined|NaN|\[object/.test(t)){mauvaise=D.noeuds[k][0]+' : '+t.slice(0,300);break;}}
  ok('grand arbre : aucune fiche n\'affiche undefined ni NaN',!mauvaise,mauvaise);
  ok('grand arbre : les pilotes de phase B/C ont des « poids changés »',D.noeuds.some(a=>Array.isArray(a[14])&&a[14].some(x=>x[0]<0&&x[1]>0)));
  ok('grand arbre : on cache par defaut les morts sans enfant (> 2 500 pilotes) et il en reste moins de la moitie a dessiner',X.visibles(false).length<D.noeuds.length/2,X.visibles(false).length);
  /* Chrome sans ecran : la page se charge, dessine, ouvre une fiche demandee par l'adresse */
  const CH='C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  if(process.platform!=='win32'||!fs.existsSync(CH)){console.log('(Chrome absent : controle dans le navigateur saute)');return;}
  const cible=D.noeuds[D.champion][0],url='file:///'+f.split(path.sep).join('/')+'#p='+cible;
  t0=Date.now();
  const r=cp.spawnSync(CH,['--headless=new','--disable-gpu','--mute-audio','--no-first-run','--window-size=1300,900','--dump-dom',url],{encoding:'utf8',timeout:90000,maxBuffer:64*1048576});
  const tC=Date.now()-t0,dom=r.stdout||'';
  ok('Chrome : la page grande se charge et se dessine ('+tC+' ms pour lancer Chrome, charger et dessiner)',/data-pret="1"/.test(dom)&&/<svg id="dessin"/.test(dom),(r.stderr||'').slice(-400));
  ok('Chrome : la fiche demandee par l\'adresse (#p=) s\'ouvre',dom.indexOf('Pilote <span class="code">'+cible+'</span>')>=0);
  const nDessin=(dom.match(/class="pt /g)||[]).length;
  ok('Chrome : '+nDessin+' points dessines',nDessin>1000);
  const ex=path.join(BAC,'exemple','arbre.html'),r2=cp.spawnSync(CH,['--headless=new','--disable-gpu','--mute-audio','--no-first-run','--window-size=1300,900','--dump-dom','file:///'+ex.split(path.sep).join('/')],{encoding:'utf8',timeout:90000});
  ok('Chrome : la page de l\'exemple montre tous les pilotes (moins de 2 500) et la fiche du champion',/data-pret="1"/.test(r2.stdout||'')&&/champion en titre<\/span>/.test(r2.stdout||''));});

/* ===== 4. SAUVER-TRACES.CMD DANS UN DEPOT JETABLE ===== */
essai('sauver-traces',()=>{
  if(process.platform!=='win32'){console.log('(hors Windows : sauver-traces.cmd non essaye)');return;}
  const BASE=path.join(os.tmpdir(),'cashcar-traces-test'),DEPOT=path.join(BASE,'depot jetable'),ORIGIN=path.join(BASE,'origin.git'),ICI=path.join(DEPOT,'ml','evolution');
  fs.rmSync(BASE,{recursive:true,force:true});fs.mkdirSync(ICI,{recursive:true});
  const env=Object.assign({},process.env);for(const k of Object.keys(env))if(/^GIT_/.test(k))delete env[k];
  env.GIT_TERMINAL_PROMPT='0';env.GCM_INTERACTIVE='never';
  const git=(args,cwd)=>cp.spawnSync('git',args,{cwd:cwd||DEPOT,encoding:'utf8',env});
  for(const f of ['sauver-traces.cmd','tableau.js','etat.js','commun.js','arbre.js','histoire.js','genome.js','graines.js','config.json','.gitignore','.gitattributes'])
    fs.copyFileSync(path.join(EV,f),path.join(ICI,f));
  fs.cpSync(EXEMPLE,path.join(ICI,'etat'),{recursive:true});
  fs.mkdirSync(path.join(ICI,'etat','pilotes'),{recursive:true});fs.writeFileSync(path.join(ICI,'etat','pilotes','abc.js'),'/* pilote */\n');
  fs.writeFileSync(path.join(ICI,'etat','sortie.log'),'');
  fs.mkdirSync(path.join(ICI,'champions'),{recursive:true});fs.writeFileSync(path.join(ICI,'champions','g0020-1a2b3c4d.json'),'{"format":"evolution-champion-1"}\n');
  fs.writeFileSync(path.join(DEPOT,'LISEZ-MOI.txt'),'depot jetable des tests de sauver-traces.cmd\n');
  git(['init','-q','-b','main']);git(['config','user.name','test traces']);git(['config','user.email','traces@exemple.invalid']);
  git(['add','LISEZ-MOI.txt','ml/evolution/sauver-traces.cmd','ml/evolution/.gitignore','ml/evolution/.gitattributes']);git(['commit','-q','-m','depart']);
  cp.spawnSync('git',['init','-q','--bare',ORIGIN],{encoding:'utf8',env});git(['remote','add','origin',ORIGIN]);
  const PC=H.nomPc(),BR='evolution-'+PC;
  const lancer=mode=>cp.spawnSync('cmd.exe',['/d','/s','/c','""'+path.join(ICI,'sauver-traces.cmd')+'"'+(mode?' '+mode:'')+'"'],
    {windowsVerbatimArguments:true,stdio:['ignore','pipe','pipe'],encoding:'latin1',cwd:BASE,env,timeout:180000});
  const nCommits=()=>+git(['rev-list','--count','HEAD']).stdout.trim();
  const detail=()=>{try{return fs.readFileSync(path.join(ICI,'etat','traces.log'),'latin1');}catch(e){return '';}};
  const sortie=()=>{try{return fs.readFileSync(path.join(ICI,'etat','sortie.log'),'latin1');}catch(e){return '';}};
  const distant=()=>cp.spawnSync('git',['--git-dir',ORIGIN,'rev-parse','--verify','-q','refs/heads/'+BR],{encoding:'utf8',env}).stdout.trim();

  let r=lancer('auto');
  ok('sur main : refus, code 2',r.status===2,r.status+' '+r.stdout+r.stderr);
  ok('sur main : aucun commit, rien d\'envoye',nCommits()===1&&!distant());
  ok('sur main : le refus est ecrit dans sortie.log',/sauver-traces : refuse : la branche courante est main/.test(sortie()),sortie());
  ok('auto : rien a l\'ecran',!r.stdout.trim(),r.stdout);
  git(['checkout','-q','-b','bots-ecurie']);
  r=lancer('auto');ok('sur bots-ecurie : refus, code 2',r.status===2&&nCommits()===1);
  git(['checkout','-q','-b','autre-chose']);
  r=lancer('auto');ok('sur une branche qui n\'est pas evolution-... : refus, code 2',r.status===2&&nCommits()===1);
  git(['checkout','-q','-b',BR]);
  /* un fichier prepare par quelqu'un d'autre ne doit pas partir avec le commit des traces */
  fs.writeFileSync(path.join(DEPOT,'LISEZ-MOI.txt'),'modifie et prepare\n');git(['add','LISEZ-MOI.txt']);
  r=lancer('auto');
  ok('sur '+BR+' : code 0, rien a l\'ecran',r.status===0&&!r.stdout.trim(),r.status+' '+r.stdout+r.stderr+'\n'+detail().slice(-1500));
  ok('un commit de plus',nCommits()===2,nCommits());
  const msg=git(['log','-1','--format=%s']).stdout.trim();
  ok('message : « BOTS-ML evolution '+PC+' : generation 30, … »',msg.indexOf('BOTS-ML evolution '+PC+' : generation 30, ')===0,msg);
  const fichiers=git(['show','--name-only','--format=','HEAD']).stdout.trim().split('\n');
  const voulus=['population.json','generations.jsonl','validations.jsonl','morts.jsonl','coffre.jsonl','arbre.html','histoire.md','tableau.html','resume.txt'].map(f=>'ml/evolution/etat/'+f);
  ok('le commit porte les journaux, les trois pages, resume.txt et champions/',voulus.every(f=>fichiers.indexOf(f)>=0)&&fichiers.indexOf('ml/evolution/champions/g0020-1a2b3c4d.json')>=0,fichiers.join('\n'));
  const tout=git(['ls-files']).stdout;
  ok('les courses, les pilotes, sortie.log, verrou.json et traces.log restent dehors',!/courses-|etat\/pilotes\/|sortie\.log|verrou\.json|traces\.log/.test(tout),tout);
  ok('le fichier prepare par quelqu\'un d\'autre n\'est pas dans le commit (et reste prepare)',fichiers.indexOf('LISEZ-MOI.txt')<0&&/LISEZ-MOI/.test(git(['diff','--cached','--name-only']).stdout));
  ok('envoye sur origin, branche '+BR+' = HEAD',distant()===git(['rev-parse','HEAD']).stdout.trim(),distant());
  ok('le bilan est dans sortie.log',/sauver-traces : commit fait \(generation 30.*envoye sur la branche /.test(sortie()),sortie().slice(-500));
  ok('les fichiers commites gardent leurs fins de ligne LF',!/\r/.test(git(['show','HEAD:ml/evolution/etat/histoire.md']).stdout));
  r=lancer('auto');
  ok('rien de nouveau : code 0, pas de commit',r.status===0&&nCommits()===2,nCommits()+' '+detail().slice(-600));
  ok('rien de nouveau : dit dans le journal',/rien de nouveau depuis la derniere sauvegarde/.test(sortie()));
  /* du nouveau, mais PAS-D-ENVOI */
  fs.appendFileSync(path.join(ICI,'etat','coffre.jsonl'),JSON.stringify({date:'2026-11-27T22:00:00Z',generation:30,epoque:'7e8f90a1b2c3',raison:'24h',graines:40,
    champion:{id:'x',n:40,palierMoyen:8,E:1,ecartClassique:1.6},temoin:{id:'y',n:40,palierMoyen:7.5,E:1.2,ecartClassique:1.7},diff:{palier:.5,E:-.2,ecartClassique:-.1}})+'\n');
  fs.writeFileSync(path.join(ICI,'etat','PAS-D-ENVOI'),'');
  const avant=distant();r=lancer('auto');
  ok('PAS-D-ENVOI : commit fait, rien d\'envoye',r.status===0&&nCommits()===3&&distant()===avant,nCommits()+' '+distant()+' '+avant);
  ok('PAS-D-ENVOI : dit dans le journal',/le fichier etat\\PAS-D-ENVOI existe/.test(sortie()));
  /* l'envoi rate (origin introuvable) : pas une erreur, le commit local reste */
  fs.rmSync(path.join(ICI,'etat','PAS-D-ENVOI'));git(['remote','set-url','origin',path.join(BASE,'introuvable.git')]);
  fs.appendFileSync(path.join(ICI,'etat','validations.jsonl'),JSON.stringify({generation:30,usage:'validation',meneur:'a',champion:'b',sacre:false})+'\n');
  r=lancer('auto');
  ok('envoi rate : code 0, commit local fait',r.status===0&&nCommits()===4,r.status+' '+nCommits());
  ok('envoi rate : ecrit dans le journal, on reessaiera',/envoi rate .*reessaiera/.test(sortie()),sortie().slice(-400));
  git(['remote','set-url','origin',ORIGIN]);
  /* le double-clic : une ligne a l'ecran ; l'envoi en retard part */
  r=lancer('');
  ok('double-clic : code 0, une ligne « Traces : … » a l\'ecran',r.status===0&&/Traces : rien de nouveau.*envoye sur la branche/.test(r.stdout),r.stdout);
  ok('double-clic : l\'envoi en retard est parti (origin = HEAD)',distant()===git(['rev-parse','HEAD']).stdout.trim());
  /* sortie.log tenu par la selection en marche : la ligne va dans traces.log, sans erreur */
  /* comme lancer.cmd : un cmd.exe tient sortie.log par sa redirection (Windows refuse alors un second ecrivain) */
  fs.writeFileSync(path.join(BASE,'tenir.cmd'),['@echo off','node -e "setTimeout(()=>{},20000)" >>"%~1" 2>&1',''].join(String.fromCharCode(13,10)));
  const tenir=cp.spawn('cmd.exe',['/d','/s','/c','""'+path.join(BASE,'tenir.cmd')+'" "'+path.join(ICI,'etat','sortie.log')+'""'],{windowsVerbatimArguments:true,stdio:'ignore'});
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,1500);
  let bloque=false;try{fs.appendFileSync(path.join(ICI,'etat','sortie.log'),'');}catch(e){bloque=true;}
  const nLignes=detail().split('\n').length;
  r=lancer('auto');
  ok('sortie.log tenu par la selection en marche'+(bloque?'':' (NON BLOQUE ICI : controle faible)')+' : code 0, la ligne de bilan est dans traces.log',r.status===0&&detail().split('\n').length>nLignes&&/sauver-traces : rien de nouveau/.test(detail().split('\n').slice(nLignes-1).join('\n')),r.status+' '+r.stderr);
  try{tenir.kill();}catch(e){}});

console.log('\n'+(total-echecs)+' / '+total+' controles passes');
process.exit(echecs?1:0);
