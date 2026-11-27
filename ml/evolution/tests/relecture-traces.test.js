'use strict';
/* ===== LA RELECTURE DES TRACES : UN ETAT ECRIT A LA MAIN, DONT ON CONNAIT LA VERITE (27/11/2026, le relecteur du lot « traces ») =====
   « Une lignee fausse dans un portfolio est pire que pas d'arbre. » Ici, six generations ecrites a la main (qui nait de qui, quel gene change de combien,
   qui est renvoye quand, qui est sacre), avec les pieges d'une vraie marche : une generation refaite apres une coupure (sa ligne deux fois dans
   generations.jsonl, un mort deux fois dans morts.jsonl), une derniere ligne tronquee, deux nouvelles epoques, un champion sacre, revalide (il garde son
   titre) puis detrone (il le perd), un immigre sans parent, une generation en cours. Puis on verifie que arbre.html et histoire.md disent EXACTEMENT cela.
   Aucune course, aucun reseau. Le bac : essais/relecture-traces/ (ignore par git).
   node ml/evolution/tests/relecture-traces.test.js  -> code 0 si tout passe */
const fs=require('fs'),path=require('path'),vm=require('vm');
const EV=path.join(__dirname,'..');
const C=require(path.join(EV,'commun.js')),Gn=require(path.join(EV,'genome.js'));
const A=require(path.join(EV,'arbre.js')),H=require(path.join(EV,'histoire.js'));
const BAC=path.join(EV,'essais','relecture-traces');
let echecs=0,total=0;
function ok(nom,vrai,detail){total++;if(vrai)console.log('PASSE  '+nom);else{echecs++;console.log('ECHEC  '+nom+(detail!==undefined?'\n       '+String(detail).split('\n').join('\n       ').slice(0,1500):''));}}
function essai(nom,f){try{f();}catch(e){total++;echecs++;console.log('ECHEC  '+nom+' : a leve\n       '+(e&&e.stack||e));}}

/* ===== LA VERITE (27/11/2026) ===== */
const cfg0=C.lireConfig();
const T=Gn.genomeTemoin(cfg0);
const copier=g=>JSON.parse(JSON.stringify(g));
function avec(g,A2,WV,WS){const r=copier(g);Object.assign(r.A,A2||{});if(WV)for(const [i,v] of WV)r.WV[i]=v;if(WS)for(const [i,v] of WS)r.WS[i]=v;return r;}
const P={};
P.T={g:T,ne:0,parents:[],origine:'temoin'};
P.A={g:avec(T,{braqueNitro:0.74}),ne:0,parents:['T'],origine:'g0',mort:2};
P.B={g:avec(T,{marge:12}),ne:0,parents:['T'],origine:'g0',mort:1};
P.C={g:avec(T,{figTemps:1.9}),ne:0,parents:['T'],origine:'g0',mort:1};
P.D={g:avec(P.A.g,{glisse:0.15}),ne:1,parents:['A'],origine:'mutation',mort:5};
P.E={g:avec(P.A.g,{marge:12,figJauge:0.5}),ne:1,parents:['A','B'],origine:'croisement'};
P.F={g:avec(T,{figMax:3},[[0,.1],[1,.1],[2,.1],[3,.1],[4,.1],[5,.1],[6,.1],[7,.1],[8,.1],[9,.1],[10,.1],[11,.1]]),ne:2,parents:[],origine:'immigre',mort:2,raison:'non-mesuree'};
P.G={g:avec(P.D.g,{},null,[[0,.2],[1,.2],[2,.2],[3,.2],[4,.2]]),ne:2,parents:['D'],origine:'mutation',mort:3};
P.I={g:avec(P.G.g,{braqueNitro:0.8}),ne:3,parents:['G'],origine:'mutation',mort:4};
P.J={g:avec(P.E.g,{marge:11}),ne:3,parents:['E'],origine:'mutation',mort:3};
P.K={g:avec(P.I.g,{glisse:0.2}),ne:4,parents:['I'],origine:'mutation',mort:4};
P.L={g:avec(P.D.g,{figJauge:0.5}),ne:4,parents:['D','E'],origine:'croisement'};
P.M={g:avec(P.L.g,{marge:9}),ne:5,parents:['L'],origine:'mutation',mort:5};
P.N={g:avec(P.L.g,{figTemps:1.6}),ne:5,parents:['L'],origine:'mutation'};
P.H={g:avec(P.E.g,{glisse:0.13}),ne:6,parents:['E'],origine:'mutation'};
for(const k of Object.keys(P))P[k].id=Gn.idDe(P[k].g);
const id=k=>P[k].id;
/* ce qui a change, a la main : [cle, avant, apres, pris chez le second parent ?] ; les tetes : [tete, poids changes] */
const VRAI_DIFF={A:[['braqueNitro',.7,.74]],B:[['marge',10,12]],C:[['figTemps',1.5,1.9]],D:[['glisse',.12,.15]],
  E:[['marge',10,12,1],['figJauge',.4,.5]],F:null,G:[['WS',5]],I:[['braqueNitro',.74,.8]],J:[['marge',12,11]],K:[['glisse',.15,.2]],
  L:[['figJauge',.4,.5,1]],M:[['marge',10,9]],N:[['figTemps',1.5,1.6]],H:[['glisse',.12,.13]]};
const note=(k,n,F)=>({id:id(k),n,a:7+F/10,ahat:7+F/10,E:1.1,F,se_F:.5,ecartClassique:1.6});
const EP1='0b1c2d3e4f50',EP2='7e8f90a1b2c3',EP3='aa11bb22cc33';
const date=g=>new Date(Date.parse('2026-11-28T09:00:00.000Z')+g*2400e3).toISOString();
function ligneG(g,o){
  const vivants=o.vivants;
  return {generation:g,date:date(g),duree_s:2400,epoque:o.epoque||EP1,epoqueNote:'a1b2c3d4e5f6',phase:'A',nGraines:3,graines:[910000],
    courses:{demandees:vivants.length*3,cache:0,jouees:vivants.length*3,nonMesurees:0,relancees:0,tuees:0,grainesRetirees:[]},debit_h:20,
    naissances:(o.nes||[]).map(k=>({id:id(k),parents:P[k].parents.map(id),origine:P[k].origine,mutes:[]})),
    morts:(o.morts||[]).map(k=>({id:id(k),raison:P[k].raison||'renvoi'})),
    meneur:o.meneur?note(o.meneur,48,3):null,temoin:note('T',12*(g+1),2),champion:note(o.champion||'T',12*(g+1),2),
    population:vivants.map(k=>({id:id(k),ne:P[k].ne,n:12,ahat:7,E:1.1,F:k==='T'?2:1,se_F:.5})),
    distance:.1,distanceW2:0,sigmaRes:3.3,validation:o.validation||null,coffre:null,evenements:o.evenements||[]};}
const LIGNES=[
  ligneG(0,{vivants:['T','A','B','C'],evenements:['premier lancement : epoque '+EP1,'identite verifiee']}),
  ligneG(1,{vivants:['T','A','D','E'],nes:['D','E'],morts:['B','C']}),
  ligneG(2,{vivants:['T','D','E','G'],nes:['F','G'],morts:['A','F'],evenements:[String(id('F')).slice(0,12)+' vire d\'office : 2 courses non mesurees']}),
  ligneG(3,{vivants:['T','D','E','I'],nes:['I','J'],morts:['G','J'],meneur:'D',champion:'D',
    validation:{usage:'validation',meneur:id('D'),champion:id('T'),sacre:true,dF:1.2,se_dF:.4},
    evenements:['SACRE : '+id('D')+' devient champion (ancien : '+id('T')+') -> champions/g0003-'+id('D').slice(0,8)+'.js']}),
  ligneG(4,{vivants:['T','D','E','L'],nes:['K','L'],morts:['I','K'],epoque:EP2,champion:'D',
    evenements:['nouvelle epoque : ml/bot/yeux.js ('+EP1+' -> '+EP2+')','identite verifiee','revalidation : le champion '+id('D').slice(0,12)+' garde son titre']}),
  ligneG(5,{vivants:['T','E','L','N'],nes:['M','N'],morts:['D','M'],epoque:EP3,
    evenements:['nouvelle epoque : ml/bot/doigts.js ('+EP2+' -> '+EP3+')','identite verifiee','revalidation : le champion '+id('D').slice(0,12)+' perd son titre, le temoin redevient champion']})];
const mortLigne=k=>Object.assign({id:id(k),genome:P[k].g,parents:P[k].parents.map(id),origine:P[k].origine,ne:P[k].ne,mort:P[k].mort,raison:P[k].raison||'renvoi'},
  {n:24,a:6,ahat:6.2,E:1.4,F:.6,se_F:.7,ecartClassique:2,epoque:EP1});
const ORDRE_MORTS=['B','C','A','F','G','J','I','K','D','M'];
const VALID=[
  {generation:3,date:date(3),usage:'validation',meneur:id('D'),champion:id('T'),graines:[1000000],entrainement:{dF:1.9,se_dF:.6},
    validation:{graines:24,dF:1.2,se_dF:.4,dPalier:.9,se_dPalier:.7,dE:-.05,se_dE:.06},criteres:{a:true,b:true,c:true},sacre:true,malediction:.7,maledictionMoyenne:.7,fichier:'champions/g0003-x.js'},
  {generation:4,date:date(4),usage:'revalidation',meneur:id('D'),champion:id('T'),graines:[1000024],validation:{graines:24,dF:.3,se_dF:.4},sacre:true},
  {generation:5,date:date(5),usage:'revalidation',meneur:id('D'),champion:id('T'),graines:[1000048],validation:{graines:24,dF:-1.5,se_dF:.4},sacre:false}];
const cofLigne=(g,raison,ch,dp)=>({date:date(g),generation:g,epoque:EP1,raison,graines:40,
  champion:{id:id(ch),n:40,palierMoyen:7.4+dp,E:1.1,ecartClassique:1.6},temoin:{id:id('T'),n:40,palierMoyen:7.4,E:1.2,ecartClassique:1.7},
  diff:{palier:dp,E:ch==='T'?0:-.1,ecartClassique:ch==='T'?0:-.1}});
const COFFRE=[cofLigne(3,'sacre','D',.5),cofLigne(4,'epoque','D',.6),cofLigne(5,'epoque','T',0)];
function population(g,etape,vivants,champion,nesG){
  return {format:'evolution-population-1',generation:g,etape,phase:'A',phaseDepuis:0,sansSacre:1,epoque:{courses:EP3,note:'a1b2c3d4e5f6',depuis:5},rng:1,
    graines:{reserve:[],recentes:[],validationK:72,validationRepli:false,validationFinie:false},grainesGeneration:[910000],nGraines:3,grainesRetirees:[],regle6:2,
    temoin:id('T'),champion:{id:id(champion),depuis:0,fichier:null,revalider:false},derniereValidation:3,dernierCoffre:null,nSacres:1,
    vivants:vivants.map(k=>({id:id(k),genome:P[k].g,shaPilote:'0'.repeat(40),ne:P[k].ne,parents:P[k].parents.map(id),origine:P[k].origine,mutes:[],pannesGeneration:0})),
    dejaVus:Object.keys(P).map(id),naissancesGeneration:(nesG||[]).map(k=>({id:id(k),parents:P[k].parents.map(id),origine:P[k].origine,mutes:[]})),abandonsGeneration:[]};}
const jl=L=>L.map(x=>JSON.stringify(x)).join('\n')+'\n';
/* l'etat complet : la generation 2 refaite (deux fois dans generations.jsonl, A deux fois dans morts.jsonl), une ligne tronquee a la fin,
   la generation 6 en cours */
function ecrireEtat(d,jusqua){
  fs.rmSync(d,{recursive:true,force:true});fs.mkdirSync(d,{recursive:true});
  const L=LIGNES.filter(x=>x.generation<=jusqua);
  const Ld=[];for(const x of L){Ld.push(x);if(x.generation===2)Ld.push(x);}
  fs.writeFileSync(path.join(d,'generations.jsonl'),jl(Ld)+(jusqua>=5?'{"generation":6,"date":"2026-11-28T13:':''));
  const morts=[];for(const k of ORDRE_MORTS)if(P[k].mort<=jusqua){morts.push(mortLigne(k));if(k==='A')morts.push(mortLigne(k));}
  fs.writeFileSync(path.join(d,'morts.jsonl'),jl(morts)+(jusqua>=5?'{"id":"ab':''));
  fs.writeFileSync(path.join(d,'validations.jsonl'),jl(VALID.filter(v=>v.generation<=jusqua)));
  fs.writeFileSync(path.join(d,'coffre.jsonl'),jl(COFFRE.filter(v=>v.generation<=jusqua)));
  if(jusqua>=5)fs.writeFileSync(path.join(d,'population.json'),JSON.stringify(population(6,'courses',['T','E','L','N','H'],'T',['H']))+'\n');
  else fs.writeFileSync(path.join(d,'population.json'),JSON.stringify(population(3,'fin',['T','D','E','I'],'D',['I','J']))+'\n');
  const cfg=C.lireConfig();cfg.dossierEtat=d;return cfg;}

/* ---------- lire la page ---------- */
function donneesDe(html){const m=/<script type="application\/json" id="donnees">([\s\S]*?)<\/script>/.exec(html);return m?JSON.parse(m[1]):null;}
function programmeDe(html,D){const m=/<script>\n\(([\s\S]*?)\)\(\);\n<\/script>/.exec(html);
  const ctx={DONNEES:D,window:{},JSON,Math,String,Number,Array,Object,Map,Set,Uint8Array,isFinite,RegExp};vm.createContext(ctx);vm.runInContext('('+m[1]+')();',ctx);return ctx.window.ARBRE;}
const texteDe=h=>h.replace(/<[^>]+>/g,'').replace(/&amp;/g,'&').replace(/&quot;/g,'"');
const deIndice=(D,i)=>i<0?null:Object.keys(P).find(k=>id(k)===D.noeuds[i][0]);

/* ===== 1. L'ARBRE DIT LA VERITE ===== */
essai('arbre, etat complet',()=>{
  const cfg=ecrireEtat(path.join(BAC,'complet'),5);
  const html=A.page(cfg,{maintenant:Date.parse('2026-11-28T14:00:00Z')});
  fs.writeFileSync(path.join(BAC,'complet','arbre.html'),html);
  const D=donneesDe(html),X=programmeDe(html,D);
  ok('un noeud par pilote ne, aucun en double (generation refaite, mort ecrit deux fois)',D.noeuds.length===Object.keys(P).length&&new Set(D.noeuds.map(a=>a[0])).size===D.noeuds.length,D.noeuds.length);
  ok('les chiffres de l\'en-tete : 6 generations finies (pas 7 : la refaite compte une fois)',D.chiffres.generations===6,JSON.stringify(D.chiffres));
  ok('les chiffres : 15 nes, 10 renvoyes, 5 vivants, 1 sacre',D.chiffres.nes===15&&D.chiffres.morts===10&&D.chiffres.vivants===5&&D.chiffres.sacres===1,JSON.stringify(D.chiffres));
  for(const k of Object.keys(P)){
    const i=D.noeuds.findIndex(a=>a[0]===id(k)),a=D.noeuds[i],x=P[k];
    if(i<0){ok(k+' : present',false);continue;}
    const par=[deIndice(D,a[4]),deIndice(D,a[5])].filter(Boolean);
    ok(k+' : ne a la generation '+x.ne+', parents '+(x.parents.join('+')||'aucun')+', origine '+x.origine,
      a[1]===x.ne&&JSON.stringify(par)===JSON.stringify(x.parents)&&['temoin','g0','mutation','croisement','immigre'][a[3]]===x.origine,JSON.stringify(a.slice(0,7)));
    ok(k+' : '+(x.mort===undefined?'vivant':'renvoye a la generation '+x.mort),x.mort===undefined?a[2]===-1:a[2]===x.mort,a[2]);
    /* la difference, lue dans la fiche */
    const f=texteDe(X.fiche(i));
    const V=VRAI_DIFF[k];
    if(V===undefined)continue;
    if(V===null){ok(k+' (immigre sans parent) : la fiche ne pretend pas connaitre un parent, et se lit (pas de « copie de un parent inconnu »)',
      /Pas de parent connu : on ne peut pas dire ce qui a changé/.test(f)&&/son nom n'est pas dans les journaux/.test(f)&&!/de un parent|parent, un parent/.test(f),f.slice(0,400));continue;}
    for(const v of V){
      if(v[0]==='WS'||v[0]==='WV'){ok(k+' : '+v[1]+' poids changes dans la tete',f.indexOf(v[1]+' poids chang')>=0,f.slice(0,600));continue;}
      const fr=y=>String(y).replace('.',',');
      const attendu=v[0]+' ('; const re=new RegExp(v[0]+' \\([^)]*\\) : '+fr(v[1])+'0* → '+fr(v[2])+'0*(?!\\d)');
      ok(k+' : '+v[0]+' '+v[1]+' -> '+v[2]+(v[3]?' (pris chez le second parent)':''),re.test(f)&&(!v[3]||/Pris chez/.test(f)),f.slice(0,700));void attendu;}
    /* aucun autre gene : le nombre de lignes de difference */
    const n=(X.fiche(i).match(/<li>/g)||[]).length,attendus=V.filter(v=>v[0]!=='WS'&&v[0]!=='WV').length;
    ok(k+' : exactement '+attendus+' reglage(s) change(s), aucun de plus',n===attendus,n);}
  /* champions */
  const iD=D.noeuds.findIndex(a=>a[0]===id('D')),iT=D.noeuds.findIndex(a=>a[0]===id('T'));
  ok('le champion en titre est le temoin (D a perdu son titre a la generation 5)',D.champion===iT,D.champion);
  ok('D : sacre a la generation 3, marque « ancien champion », pas « champion en titre »',JSON.stringify(D.sacres[iD])==='[3]'&&/ancien champion/.test(X.fiche(iD))&&!/champion en titre/.test(X.fiche(iD)));
  const lig=D.noeuds.filter(a=>a[7]&8).map(a=>a[0]);
  ok('la lignee mise en avant = le seul temoin',lig.length===1&&lig[0]===id('T'),JSON.stringify(lig));
  ok('deux reperes d\'epoque, aux generations 4 et 5',JSON.stringify(D.reperes.filter(r=>r[1]==='époque').map(r=>r[0]))==='[4,5]',JSON.stringify(D.reperes));
  ok('generation courante = 6 (en cours)',D.g===6,D.g);
  const fF=texteDe(X.fiche(D.noeuds.findIndex(a=>a[0]===id('F'))));
  ok('F : renvoye d\'office (deux courses ratees), apres 1 generation de vie',/génération 2.*deux courses ratées.*1 génération de vie/.test(fF),fF);
  const fE=texteDe(X.fiche(D.noeuds.findIndex(a=>a[0]===id('E'))));
  ok('E : 3 enfants (J, L, H)',/3 enfants/.test(fE),fE.slice(-300));});

essai('arbre, a la generation 3 (D champion)',()=>{
  const cfg=ecrireEtat(path.join(BAC,'g3'),3);
  const html=A.page(cfg,{maintenant:Date.parse('2026-11-28T11:00:00Z')}),D=donneesDe(html);
  const lig=new Set(D.noeuds.filter(a=>a[7]&8).map(a=>a[0]));
  ok('champion = D',D.noeuds[D.champion][0]===id('D'));
  ok('la lignee du champion = D, A, T (et rien d\'autre)',lig.size===3&&lig.has(id('D'))&&lig.has(id('A'))&&lig.has(id('T')),[...lig].map(x=>Object.keys(P).find(k=>id(k)===x)).join(','));});

/* ===== 2. LE RECIT DIT LA VERITE ===== */
essai('recit, etat complet',()=>{
  const cfg=ecrireEtat(path.join(BAC,'complet'),5);
  const t=H.texte(cfg,{maintenant:Date.parse('2026-11-28T14:00:00Z')});
  fs.writeFileSync(path.join(BAC,'complet','histoire.md'),t);
  const titres=t.match(/^### Génération \d+/gm)||[];
  ok('une entree par generation, aucune en double : 0 a 5, puis 6 en cours',JSON.stringify(titres.map(s=>+s.replace(/\D/g,'')))==='[0,1,2,3,4,5,6]',JSON.stringify(titres));
  ok('« 6 générations finies »',/6 générations finies/.test(t));
  ok('« 15 pilotes sont nés (dont 4 au départ), 10 ont été renvoyés, 5 vivent »',/15 pilotes sont nés \(dont 4 au départ\), 10 ont été renvoyés, 5 vivent/.test(t),(t.match(/\d+ pilotes sont nés.*/)||[''])[0]);
  ok('le champion est de nouveau le temoin : D, sacre a la generation 3, a perdu son titre a la generation 5 (et pas « aucun pilote n\'a encore prouve »)',
    t.indexOf('Le champion est de nouveau **le témoin** : le dernier sacré, `'+id('D').slice(0,8)+'` (génération 3), a perdu son titre à la génération 5')>=0&&!/aucun pilote n'a encore prouvé/.test(t),
    (t.match(/Le champion est.*/)||[''])[0]);
  ok('generation 3 : le sacre de D',new RegExp('Génération 3[\\s\\S]*?Il est sacré nouveau champion[\\s\\S]*?### Génération 4').test(t));
  ok('generation 4 : nouvelle epoque, revalidation gardee',new RegExp('### Génération 4[\\s\\S]*?Nouvelle époque[\\s\\S]*?garde son titre[\\s\\S]*?### Génération 5').test(t));
  ok('generation 5 : revalidation perdue',new RegExp('### Génération 5[\\s\\S]*?perd son titre[\\s\\S]*?### Génération 6').test(t));
  ok('generation 2 : 2 renvois dont 1 d\'office (pas « les notes F les plus basses »)',/### Génération 2[\s\S]*?2 renvois \(1 note trop basse, 1 d'office pour deux courses ratées\)/.test(t),(t.match(/### Génération 2[\s\S]*?\n\n[^\n]*/)||[''])[0]);
  ok('generation 6 en cours : 1 naissance (1 mutation)',/### Génération 6 — en cours\n\n1 naissance \(1 mutation\)/.test(t));
  ok('le coffre : aucune affirmation « la sélection apprend » (une seule mesure par champion, et 0,6 palier est dans le bruit)',!/apprend[^-]*\b(oui|vraiment\.)/i.test(t.replace(/\*\*La sélection apprend-elle vraiment \?\*\*/g,''))&&/bruit/.test(t),(t.match(/apprend-elle.*/)||[''])[0]);
  ok('le coffre : les mesures repetees d\'un meme champion ne comptent qu\'une fois',/1 champion/.test((t.match(/apprend-elle.*/)||[''])[0]),(t.match(/apprend-elle.*/)||[''])[0]);
  ok('pas de HTML, pas de NaN, pas de undefined',!/<[a-z]|NaN|undefined/.test(t));});

/* ===== 3. UNE NOUVELLE EPOQUE ET UNE NOUVELLE PHASE A LA MEME GENERATION : UN SEUL REPERE (les textes se chevauchaient) ===== */
essai('reperes fusionnes',()=>{
  const cfg=C.lireConfig();cfg.dossierEtat=path.join(BAC,'vide');
  const G=[0,1,2].map(g=>({generation:g,epoque:g<2?'a':'b',phase:g<2?'A':'B',naissances:[],morts:[],population:[],evenements:[]}));
  const D=donneesDe(A.page(cfg,{donnees:{pop:null,generations:G,validations:[],coffre:[],morts:[]}}));
  ok('un repere « époque · phase B » a la generation 2',JSON.stringify(D.reperes)==='[[2,"époque · phase B"]]',JSON.stringify(D.reperes));});

/* ===== 4. SAUVER-TRACES.CMD, LES DEFAUTS TROUVES A LA RELECTURE (27/11/2026) =====
   Dans un depot JETABLE du dossier temporaire, avec une « origin » locale nue : jamais le vrai depot, jamais GitHub. */
essai('sauver-traces, relecture',()=>{
  if(process.platform!=='win32'){console.log('(hors Windows : sauver-traces.cmd non essaye)');return;}
  const os=require('os'),cp=require('child_process');
  const BASE=path.join(os.tmpdir(),'cashcar-relecture-traces'),DEPOT=path.join(BASE,'depot jetable'),ORIGIN=path.join(BASE,'origin.git'),ICI=path.join(DEPOT,'ml','evolution');
  fs.rmSync(BASE,{recursive:true,force:true});fs.mkdirSync(ICI,{recursive:true});
  const VIDE=path.join(BASE,'gitconfig-vide');fs.writeFileSync(VIDE,'');
  const env=Object.assign({},process.env);for(const k of Object.keys(env))if(/^GIT_/.test(k))delete env[k];
  /* aucune identite connue de git (ni globale ni systeme) : le repli de sauver-traces doit suffire */
  env.GIT_CONFIG_GLOBAL=VIDE;env.GIT_CONFIG_NOSYSTEM='1';
  const git=(args,cwd)=>cp.spawnSync('git',['-c','user.name=test','-c','user.email=test@exemple.invalid'].concat(args),{cwd:cwd||DEPOT,encoding:'utf8',env});
  for(const f of ['sauver-traces.cmd','tableau.js','etat.js','commun.js','arbre.js','histoire.js','genome.js','graines.js','config.json','.gitignore','.gitattributes'])
    fs.copyFileSync(path.join(EV,f),path.join(ICI,f));
  fs.cpSync(path.join(__dirname,'etat-exemple'),path.join(ICI,'etat'),{recursive:true});
  fs.mkdirSync(path.join(ICI,'champions'),{recursive:true});fs.writeFileSync(path.join(ICI,'champions','g0001-x.json.123.tmp'),'{}');
  fs.writeFileSync(path.join(DEPOT,'LISEZ-MOI.txt'),'depot jetable\n');
  git(['init','-q','-b','main']);git(['add','.']);git(['commit','-q','-m','depart']);
  cp.spawnSync('git',['init','-q','--bare',ORIGIN],{encoding:'utf8',env});git(['remote','add','origin',ORIGIN]);
  const lancer=mode=>cp.spawnSync('cmd.exe',['/d','/s','/c','""'+path.join(ICI,'sauver-traces.cmd')+'"'+(mode?' '+mode:'')+'"'],
    {windowsVerbatimArguments:true,stdio:['ignore','pipe','pipe'],encoding:'latin1',cwd:BASE,env,timeout:180000});
  const nCommits=()=>+git(['rev-list','--count','HEAD']).stdout.trim();
  const detail=()=>{try{return fs.readFileSync(path.join(ICI,'etat','traces.log'),'latin1');}catch(e){return '';}};
  const distant=br=>cp.spawnSync('git',['--git-dir',ORIGIN,'rev-parse','--verify','-q','refs/heads/'+br],{encoding:'utf8',env}).stdout.trim();
  let r;
  /* « evolution » sans tiret, ou colle a un autre mot : refus */
  for(const br of ['evolution','evolutionmain']){git(['checkout','-q','-B',br]);r=lancer('auto');
    ok('branche « '+br+' » : refus (code 2), aucun commit',r.status===2&&nCommits()===1,r.status+' '+nCommits());}
  /* la branche courante n'a pas le nom du PC : l'envoi va sur ELLE (pas sur une seconde branche distante) ; champions\ ne porte qu'un .tmp ;
     git ne connait aucune identite sur ce PC */
  git(['checkout','-q','-B','evolution-ryzen']);
  r=lancer('auto');
  ok('identite inconnue, champions\\ sans champion : code 0, un commit',r.status===0&&nCommits()===2,r.status+' '+nCommits()+'\n'+detail().slice(-1200));
  ok('le commit porte l\'identite de repli « selection CASH CAR »',/^selection CASH CAR \(/.test(git(['log','-1','--format=%an']).stdout),git(['log','-1','--format=%an %ae']).stdout);
  ok('envoye sur la branche courante evolution-ryzen, et sur aucune autre',distant('evolution-ryzen')===git(['rev-parse','HEAD']).stdout.trim()&&
    cp.spawnSync('git',['--git-dir',ORIGIN,'for-each-ref','--format=%(refname)'],{encoding:'utf8',env}).stdout.trim()==='refs/heads/evolution-ryzen',
    cp.spawnSync('git',['--git-dir',ORIGIN,'for-each-ref','--format=%(refname)'],{encoding:'utf8',env}).stdout);
  /* la selection est arretee : les journaux ne bougent plus, mais les pages portent l'heure. Pour le simuler sans attendre une minute,
     on commite une page differente : refaite, elle differe de HEAD alors que les journaux sont les memes. */
  fs.writeFileSync(path.join(ICI,'etat','tableau.html'),'ancien\n');git(['commit','-q','--only','-m','page ancienne','--','ml/evolution/etat/tableau.html']);
  const n0=nCommits();r=lancer('auto');
  ok('selection arretee (journaux inchanges, pages a une autre heure) : pas de commit',r.status===0&&nCommits()===n0,nCommits()+' '+n0+'\n'+detail().slice(-600));
  ok('… et rien ne reste prepare dans l\'index',!git(['diff','--cached','--name-only']).stdout.trim(),git(['diff','--cached','--name-only']).stdout);
  /* une fusion pas finie : on n'y touche pas */
  fs.appendFileSync(path.join(ICI,'etat','coffre.jsonl'),JSON.stringify({generation:31,raison:'24h',graines:40,champion:{id:'a'},temoin:{id:'a'},diff:{palier:0}})+'\n');
  fs.writeFileSync(path.join(DEPOT,'.git','MERGE_HEAD'),git(['rev-parse','HEAD']).stdout);
  r=lancer('auto');
  ok('fusion pas finie (MERGE_HEAD) : refus code 2, rien d\'ajoute a l\'index, aucun commit',r.status===2&&nCommits()===n0&&!git(['diff','--cached','--name-only']).stdout.trim(),r.status+' '+git(['diff','--cached','--name-only']).stdout);
  fs.rmSync(path.join(DEPOT,'.git','MERGE_HEAD'));
  /* traces.log borne a ~1 Mo */
  fs.writeFileSync(path.join(ICI,'etat','traces.log'),'x'.repeat(1100000)+'\n');
  r=lancer('auto');
  ok('traces.log de plus de 1 Mo : mis de cote en traces.log.ancien, un nouveau commence',r.status===0&&fs.existsSync(path.join(ICI,'etat','traces.log.ancien'))&&fs.statSync(path.join(ICI,'etat','traces.log')).size<100000,r.status);
  ok('… et ni l\'un ni l\'autre n\'entre dans git ; le coffre change = un commit',!/traces\.log/.test(git(['ls-files']).stdout)&&nCommits()===n0+1,nCommits());
  /* une origine SSH injoignable, en auto : pas de question, code 0, « envoi rate » */
  git(['remote','set-url','origin','ssh://git@127.0.0.1:1/rien.git']);
  const t0=Date.now();r=lancer('auto');
  ok('origine SSH injoignable : code 0 en moins d\'une minute, sans question, « envoi rate »',r.status===0&&Date.now()-t0<60000&&/envoi rate/.test(detail().split('\n').slice(-3).join('\n')),r.status+' '+(Date.now()-t0)+' ms');});

/* les pages laissees dans le bac, pour les regarder (Chrome sans ecran) */
essai('pages laissees dans le bac',()=>{
  for(const [nom,j] of [['complet',5],['g3',3]]){const cfg=ecrireEtat(path.join(BAC,nom),j);A.ecrire(cfg);H.ecrire(cfg);}
  ok('arbre.html et histoire.md ecrits dans essais/relecture-traces/complet et g3',fs.existsSync(path.join(BAC,'complet','arbre.html'))&&fs.existsSync(path.join(BAC,'g3','histoire.md')));});

console.log('\n'+(total-echecs)+'/'+total+' controles passent');
process.exit(echecs?1:0);
