'use strict';
/* ===== ARBRE.JS : L'ARBRE GENEALOGIQUE DES PILOTES (27/11/2026, Sacha : « il faut qu'on garde des traces de tous les process, pour un portfolio ») =====
   Le plan d'origine (passation/BOTS-ML.md § 5.2) l'appelait LA PIECE MAITRESSE : « un noeud par cerveau, relie a son parent ; un clic montre ce qui a change ».
   Reecrit <dossierEtat>/arbre.html : une page seule (HTML + SVG dessine par un petit programme dans la page, aucune ressource exterieure, aucun appel
   reseau, s'ouvre en file://, clair et sombre, lisible a 380 px comme sur grand ecran). Contenu derive des journaux : on peut l'effacer, il revient.
   Lit (sans rien ecrire d'autre) : population.json (les vivants et leur genome), generations.jsonl (naissances, morts, notes, evenements),
   morts.jsonl (chaque renvoye avec son genome et sa note finale), validations.jsonl (les sacres). Jamais les courses-*.jsonl (trop lourds).
   LA DISPOSITION : un pilote = un point a la generation de sa naissance, puis un trait horizontal = sa vie, jusqu'a son renvoi (ou aujourd'hui).
   Les traits sont ranges sur des « voies » : une voie liberee par un mort est reprise par un nouveau-ne, au plus pres de la voie de son parent.
   Avec 20 vivants et 6 naissances par generation, il n'y a jamais plus de ~27 voies : la hauteur reste fixe, seule la largeur grandit.
   Les `detail` (60) dernieres generations sont en detail, les autres resserrees (4 px, puis 2 px par generation au-dela de 300).
   API : require('./arbre').ecrire(cfg, o?) -> chemin de arbre.html ; page(cfg, o?) -> le texte HTML ; modele(cfg, o?) -> les donnees (tests, histoire.js).
     o : {donnees?: rendu de etat.lire(cfg,{morts:true}), maintenant?: ms, detail?: 60}.
   Ligne de commande : node ml/evolution/arbre.js [--config f.json] [--etat dossier] */
const fs=require('fs'),path=require('path');
const ET=require('./etat');
let C=null;
try{C=require('./commun');}catch(e){C=null;}
let Gn=null;
function genome(){if(Gn===null){try{Gn=require('./genome');}catch(e){Gn=false;}}return Gn||null;}
/* (27/11/2026, l'integrateur) un genome v:1 relu des journaux (morts.jsonl, ou population.json d'avant les gestes) est migre (en v:3 depuis le
   portage du 28/11, comme un v:2)
   (les 21 genes des gestes a leur naissance) : sinon l'enfant v:2 d'un parent mort v:1 montrait 21 changements « undefined -> naissance ».
   migrer change l'objet lu en place ; il n'est jamais reecrit. */
function migre(g){const G=genome();if(G&&typeof G.migrer==='function'){try{G.migrer(g);}catch(e){}}return g;}

function ecrireAtomique(fichier,texte){
  if(C&&typeof C.ecrireAtomique==='function')return C.ecrireAtomique(fichier,texte);
  if(texte.indexOf('\r')>=0)throw new Error('arbre : texte avec \\r');
  fs.mkdirSync(path.dirname(fichier),{recursive:true});
  const tmp=fichier+'.'+process.pid+'.tmp';
  fs.writeFileSync(tmp,texte,'utf8');fs.renameSync(tmp,fichier);}

const fini=x=>typeof x==='number'&&isFinite(x);
const r4=x=>fini(x)?+x.toFixed(4):null;

/* ===== LES GENES EN CLAIR (27/11/2026) =====
   Ni genome.js ni INTERFACES.md § 4 ne decrivent les genes en mots simples : ces mots sont tires des commentaires de REGLAGES dans
   ml/ecurie/pilote-voltige.js (et du § 4.1 pour les 14 constantes promues). Un gene absent d'ici s'affiche sous son seul nom technique. */
const MOTS={
  marge:'marge gardée au bord de la route',bandeDecor:'écart permis à l\'axe sur les maps à décor',nitroDecor:'prudence de la nitro sur les maps à décor',
  margeCouloir:'marge gardée dans un couloir',avance:'distance minimale de ce qu\'on vise',glisse:'vitesse à laquelle la ligne visée se déplace',
  glisseUrgence:'la même, quand la route lâche',ligneLoin:'portée de la ligne parfaite',piecesLoin:'portée des pièces visées',
  capLigne:'cap le plus fort pour rejoindre la ligne',avanceCap:'anticipation des virages',capAvance:'limite de cette anticipation',
  braqueDoux:'virage sous lequel toute la route est permise',braqueFort:'virage au-dessus duquel on serre l\'intérieur',
  braqueNitro:'virage au-dessus duquel pas de nitro',margeAllumer:'marge de vitesse pour allumer la nitro',margeTenir:'marge de vitesse pour la garder',
  jaugeAllume:'jauge à partir de laquelle la nitro s\'allume',jaugeCoupe:'jauge sous laquelle la nitro se coupe',capMax:'travers au-delà duquel pas de nitro',
  bascule:'avance qu\'il faut pour changer de trajectoire en vol',tenirFacon:'temps minimal sur une trajectoire en vol',derive:'glissade après la pose',
  raccVirage:'virage minimal pour chercher un raccourci',raccGain:'piste à gagner pour tenter un raccourci',raccAxe:'angle d\'arrivée maximal d\'un raccourci',
  raccTmin:'vol minimal d\'un raccourci',raccChute:'chute maximale d\'un raccourci',raccTmax:'vol maximal d\'un raccourci',raccAir:'air qui doit rester à la pose',
  raccBord:'distance au bord de la pose annoncée',raccAttente:'distance au bord pour s\'engager',raccRepos:'pause après un raccourci abandonné',
  figPlongeon:'avance d\'une figure en plongeon',figTemps:'avance d\'une figure avant la pose',figJauge:'jauge minimale pour une figure',
  figEcart:'temps entre deux gestes',dessousMax:'temps sous la route avant d\'en sortir',dessousPose:'malus d\'une pose sous la route',
  departMin:'ligne droite minimale au départ',departMax:'ligne droite maximale au départ',volRetour:'douceur du retour vers la route en vol',
  volAvance:'anticipation en vol',figDepuis:'vol avant la première figure',figHaut:'hauteur minimale pour une figure',
  dessousAveugle:'sortir de sous la route sans attendre',dessousDecor:'sortie de sous la route sur les maps à décor (0, 1 ou 2)',
  dessousNitro:'nitro pendant la sortie de dessous',dessousFuir:'fuir une trajectoire qui mène sous la route',portailVol:'passer les portails en vol',
  volDemiTour:'braquer en vol même de travers',volRetourOn:'retour vers la route réglable en vol',figMax:'figures par vol au plus',
  retourOn:'la loi « retour » des yeux',retMarge:'loi « retour » : marge',retCap:'loi « retour » : cap',retGain:'loi « retour » : gain',
  retAvance:'loi « retour » : anticipation',retourPrime:'bonus de la loi « retour »',volMieux:'changer de trajectoire « pour mieux »',
  axePoids:'poids de l\'angle de pose',vTemps:'poids de la durée d\'un vol',vPortail:'valeur d\'un portail',vLevre:'valeur d\'une lèvre',
  vLibreBase:'valeur d\'un vol libre',vLibrePente:'valeur d\'un vol libre (pente)',vCourt:'valeur d\'une trajectoire courte',
  rAxe:'raccourci : poids de l\'angle',rTemps:'raccourci : poids de la durée',rPlane:'raccourci : malus en planant',rLourde:'raccourci : malus d\'une pose lourde',
  bVersRoute:'bonus de « vers la route »',bVersRoutePlane:'bonus de « vers la route en planant »',bRien:'bonus de « ne rien faire »',
  /* (27/11/2026, l'integrateur) les 21 genes des gestes (notes/gestes.md) */
  lacheOn:'geste : lâcher le volant juste avant de retomber',lacheAvant:'combien de temps avant la pose on lâche le volant',
  slalomOn:'geste : petits zigzags rapides sur la route',slalomCap:'ampleur des zigzags',slalomDemi:'durée d\'un aller du zigzag',
  slalomH:'portée du regard pendant les zigzags',
  coupOn:'geste : petits coups de nitro en l\'air',coupDepuis:'temps de vol avant le premier coup',coupEcart:'temps entre deux coups',
  coupDuree:'durée d\'un coup de nitro',coupPoseMin:'temps de vol qu\'il doit rester après le coup',coupAxe:'travers permis à la pose après le coup',
  coupAir:'temps de vol minimal pour donner un coup',coupJauge:'jauge minimale pour donner un coup',coupPerte:'distance qu\'un coup peut faire perdre',
  coupDecor:'coups de nitro permis aussi sur les maps à décor',
  relacheOn:'geste : garder la nitro un instant après le décollage',relacheT:'combien de temps on garde la nitro après le décollage',
  suitOn:'geste : laisser la voiture finir sa glisse à la pose',suitDerive:'durée pendant laquelle on suit la glisse',
  suitMarge:'temps de plus avant de revenir à la ligne',
  /* (28/11/2026, tache « portage ») les 14 genes des apports de la boucle payante (notes/portage.md) */
  fuirVite:'apport c0026 : quitter tout de suite une trajectoire qui mène sous la route',
  bordOn:'apport c0064 : décoller nitro allumée quand le bord arrive',bordNitro:'temps avant le bord où l\'on garde la nitro',
  bordJauge:'jauge minimale pour décoller nitro allumée',
  largeOn:'apport c0072 : des figures dans les vols subis bien partis',largeHaut:'hauteur minimale pour ces figures',
  largeT1:'temps avant la pose pour la première de ces figures',largeT2:'temps avant la pose pour les suivantes',
  largeAxe:'angle d\'arrivée maximal pour ces figures',largeAir:'temps de vol qui doit rester pour ces figures',largeMax:'figures au plus dans un tel vol',
  libreOn:'apport c0087 : garder la nitro plus longtemps dans les virages sans décor',nitroLibreK:'tolérance de virage de la nitro déjà allumée',
  tenirLibre:'excès de vitesse permis à la nitro déjà allumée'};
function motDe(cle){
  if(MOTS[cle])return MOTS[cle];
  let m=/^raccCartes_(.+)$/.exec(cle);if(m)return 'raccourcis permis sur la map '+m[1];
  m=/^raccJumeau_(.+)$/.exec(cle);if(m)return 'double vérification des raccourcis, map '+m[1];
  return '';}
const TETES={WV:{nom:'tête rayon',mot:'le petit réseau qui juge les trajectoires en vol'},WS:{nom:'tête sol',mot:'le petit réseau qui ajuste la conduite au sol'}};
const ORIGINES=['temoin','g0','mutation','croisement','immigre','inconnue'];

/* ===== LE MODELE : TOUS LES PILOTES NES UNE FOIS (27/11/2026) ===== */
function modele(cfg,o){
  o=o||{};
  const D=o.donnees||ET.lire(cfg,{morts:true});
  /* (27/11/2026, le relecteur) une generation refaite apres une coupure (une vieille marche, ou un journal recolle) peut avoir deux lignes :
     une seule compte, la derniere ecrite (sinon le recit la racontait deux fois et l'en-tete comptait une generation de trop) */
  const parGen=new Map();for(const g of D.generations)if(g&&fini(g.generation))parGen.set(g.generation,g);
  const pop=D.pop,G=[...parGen.values()].sort((a,b)=>a.generation-b.generation);
  const P=new Map();let seq=0;
  const ind=id=>{let x=P.get(id);if(!x){x={id,seq:seq++,ne:null,parents:[],origine:null,genome:null,mort:null,raison:null,note:null,noteG:null,
    mutesCles:null,mutes:null,vivant:false};P.set(id,x);}return x;};
  for(const g of G){
    for(const b of (g.naissances||[])){if(!b||!b.id)continue;const x=ind(b.id);
      if(x.ne===null)x.ne=g.generation;if(!x.parents.length&&Array.isArray(b.parents))x.parents=b.parents.slice();
      if(!x.origine&&b.origine)x.origine=b.origine;if(!x.mutesCles&&Array.isArray(b.mutes))x.mutesCles=b.mutes.slice();}
    for(const p of (g.population||[])){if(!p||!p.id)continue;const x=ind(p.id);
      if(x.ne===null&&fini(p.ne))x.ne=p.ne;
      x.note={n:p.n,ahat:p.ahat,E:p.E,F:p.F,se_F:p.se_F};x.noteG=g.generation;}
    for(const m of (g.morts||[])){if(!m||!m.id)continue;const x=ind(m.id);if(x.mort===null){x.mort=g.generation;x.raison=m.raison||null;}}}
  for(const m of (D.morts||[])){if(!m||!m.id)continue;const x=ind(m.id);
    if(m.genome)x.genome=migre(m.genome);if(!x.parents.length&&Array.isArray(m.parents))x.parents=m.parents.slice();
    if(!x.origine&&m.origine)x.origine=m.origine;if(x.ne===null&&fini(m.ne))x.ne=m.ne;
    if(fini(m.mort))x.mort=m.mort;if(m.raison)x.raison=m.raison;
    if(fini(m.F)||fini(m.ahat))x.note={n:m.n,a:m.a,ahat:m.ahat,E:m.E,F:m.F,se_F:m.se_F,ecartClassique:m.ecartClassique};
    x.noteG=fini(m.mort)?m.mort:x.noteG;}
  if(pop){
    for(const b of (pop.naissancesGeneration||[])){if(!b||!b.id)continue;const x=ind(b.id);
      if(x.ne===null)x.ne=pop.generation;if(!x.parents.length&&Array.isArray(b.parents))x.parents=b.parents.slice();
      if(!x.origine&&b.origine)x.origine=b.origine;if(!x.mutesCles&&Array.isArray(b.mutes))x.mutesCles=b.mutes.slice();}
    for(const v of (Array.isArray(pop.vivants)?pop.vivants:[])){if(!v||!v.id)continue;const x=ind(v.id);
      x.vivant=true;x.mort=null;x.raison=null;
      if(v.genome)x.genome=migre(v.genome);if(fini(v.ne))x.ne=v.ne;if(Array.isArray(v.parents)&&v.parents.length)x.parents=v.parents.slice();
      if(v.origine)x.origine=v.origine;if(Array.isArray(v.mutes))x.mutes=v.mutes;}}
  const dern=G.length?G[G.length-1]:null;
  const gCour=Math.max(pop&&fini(pop.generation)?pop.generation:-1,dern?dern.generation:-1,0);
  const temoin=(pop&&pop.temoin)||(G.length&&G[0].temoin&&G[0].temoin.id)||([...P.values()].find(x=>x.origine==='temoin')||{}).id||null;
  if(temoin){const t=ind(temoin);t.origine='temoin';if(t.ne===null)t.ne=0;t.parents=[];if(!pop)t.vivant=t.mort===null;}
  const champion=(pop&&pop.champion&&pop.champion.id)||(dern&&dern.champion&&dern.champion.id)||temoin;
  const meneur=dern&&dern.meneur&&dern.meneur.id||null;
  /* sans population.json : est vivant qui n'est pas mort (les naissances et les notes de la derniere generation le disent) */
  if(!pop)for(const x of P.values())if(x.mort===null)x.vivant=true;
  for(const x of P.values()){if(x.ne===null)x.ne=x.mort!==null?x.mort:gCour;if(!x.origine)x.origine=x.parents.length===2?'croisement':'inconnue';}
  /* les sacres : validations.jsonl, et les evenements « SACRE : <id> » (une ligne de validation perdue ne fait pas oublier un champion) */
  const sacres=new Map(),ajSacre=(id,g)=>{if(!id)return;const L=sacres.get(id)||[];if(L.indexOf(g)<0)L.push(g);sacres.set(id,L);};
  for(const v of (D.validations||[]))if(v&&v.usage==='validation'&&v.sacre===true)ajSacre(v.meneur,v.generation);
  /* (28/11/2026, lot « sacre ») comment chaque sacre a ete gagne, en clair : « sacré au 3e regard, sur 48 graines » (validation sequentielle) */
  const sacresClair=new Map();
  for(const v of (D.validations||[]))if(v&&v.usage==='validation'&&v.sacre===true&&v.meneur){
    const t=ET.regardsClair(v,{accents:true});if(!t)continue;
    const Lc=sacresClair.get(v.meneur)||[];Lc.push('génération '+v.generation+' : '+t);sacresClair.set(v.meneur,Lc);}
  for(const g of G)for(const e of (g.evenements||[])){const m=/^SACRE : ([0-9a-f]{6,40})/i.exec(String(e));if(m)ajSacre(m[1],g.generation);}
  /* l'ordre : par naissance, le temoin en tete, puis l'ordre ou les journaux les citent */
  const L=[...P.values()].sort((a,b)=>(a.ne-b.ne)||((a.id===temoin?0:1)-(b.id===temoin?0:1))||(a.seq-b.seq));
  const idx=new Map();L.forEach((x,i)=>idx.set(x.id,i));
  /* la lignee du champion en titre : tous ses ancetres, par ses deux parents, jusqu'a la generation 0 */
  const lignee=new Set();
  if(champion&&idx.has(champion)){const pile=[champion];
    while(pile.length){const id=pile.pop();if(lignee.has(id))continue;lignee.add(id);const x=P.get(id);if(x)for(const p of x.parents)if(P.has(p))pile.push(p);}}
  const aEnfants=new Set();for(const x of L)for(const p of x.parents)aEnfants.add(p);
  /* LES VOIES : une voie est libre pour un nouveau-ne de la generation g si son dernier occupant est mort avant g */
  const finVoie=[],voies=new Map();
  for(const x of L){
    const fin=x.vivant?gCour:(x.mort!==null?x.mort:x.ne);
    let pref=0;const p1=x.parents.length?voies.get(x.parents[0]):undefined;if(p1!==undefined)pref=p1;
    let choix=-1;
    for(let v=0;v<finVoie.length;v++)if(finVoie[v]<x.ne&&(choix<0||Math.abs(v-pref)<Math.abs(choix-pref)))choix=v;
    if(choix<0){choix=finVoie.length;finVoie.push(0);}
    finVoie[choix]=Math.max(fin,x.ne);voies.set(x.id,choix);}
  return {individus:L,index:idx,temoin,champion,meneur,sacres,sacresClair,lignee,aEnfants,voies,nVoies:finVoie.length,generation:gCour,
    generations:G,pop,donnees:D,temoinDit:ET.temoinClair(pop)};}

/* ===== CE QUI A CHANGE PAR RAPPORT AU PARENT (27/11/2026) =====
   -> un tableau d'entrees [indiceGene, avant, apres, deP2?] (deP2 = 1 : la valeur vient du second parent d'un croisement) ;
      les tetes : [-1 (WV) ou -2 (WS), poids changes, poids en tout, deP2] ; ou {c:[cles]} quand un genome manque (les cles du journal de naissance). */
function difference(x,M,GENES,posGene){
  const p1=x.parents.length?M.individus[M.index.get(x.parents[0])]:null,p2=x.parents.length>1?M.individus[M.index.get(x.parents[1])]:null;
  const g=x.genome,g1=p1&&p1.genome,g2=p2&&p2.genome;
  if(!p1)return null;
  if(!g||!g.A||!g1||!g1.A){
    if(Array.isArray(x.mutes)&&x.mutes.length&&x.mutes.some(m=>m&&m.avant!==undefined)){
      const R=[];for(const m of x.mutes){if(!m||!m.cle)continue;
        if(m.cle==='WV'||m.cle==='WS')R.push([m.cle==='WV'?-1:-2,null,null,0]);else if(posGene.has(m.cle))R.push([posGene.get(m.cle),m.avant,m.apres]);}
      return R;}
    return {c:(x.mutesCles||[]).slice()};}
  const R=[];
  for(let i=0;i<GENES.length;i++){const k=GENES[i],a=g.A[k],b=g1.A[k];
    if(a===undefined||a===b)continue;
    if(g2&&g2.A&&g2.A[k]===a)R.push([i,b===undefined?null:b,a,1]);else R.push([i,b===undefined?null:b,a]);}
  for(const [t,code] of [['WV',-1],['WS',-2]]){
    const c=Array.isArray(g[t])?g[t]:[],a1=Array.isArray(g1[t])?g1[t]:[];if(!c.length)continue;
    const compte=ref=>{let d=0;for(let i=0;i<c.length;i++)if(c[i]!==ref[i])d++;return d;};
    const d1=compte(a1);let d=d1,de2=0;
    if(g2&&Array.isArray(g2[t])&&g2[t].length){const d2=compte(g2[t]);if(d2<d1){d=d2;de2=1;}}
    if(d>0||de2)R.push([code,d,c.length,de2]);}
  return R;}

/* ===== LES DONNEES DE LA PAGE (compactes : un tableau par pilote) ===== */
function donneesPage(M,o){
  const Gm=genome();
  let GENES=null,TYPES=null;
  if(Gm&&Array.isArray(Gm.BORNES)){GENES=Gm.BORNES.map(b=>b.cle);TYPES=Gm.BORNES.map(b=>b.type==='reel'?'r':b.type==='entier'?'e':b.type==='drapeau'?'d':'c');}
  else{const vu=new Set();GENES=[];for(const x of M.individus)if(x.genome&&x.genome.A)for(const k of Object.keys(x.genome.A))if(!vu.has(k)){vu.add(k);GENES.push(k);}
    TYPES=GENES.map(()=>'r');}
  const posGene=new Map();GENES.forEach((k,i)=>posGene.set(k,i));
  const noeuds=M.individus.map(x=>{
    let dr=0;
    if(x.id===M.temoin)dr|=1;if(x.id===M.champion&&x.id!==M.temoin)dr|=2;if(M.sacres.has(x.id))dr|=4;if(M.lignee.has(x.id))dr|=8;
    if(x.id===M.meneur)dr|=16;if(M.aEnfants.has(x.id))dr|=32;
    const n=x.note||{},ip=i=>{const j=M.index.get(x.parents[i]);return j===undefined?-1:j;};
    return [x.id,x.ne,x.vivant?-1:(x.mort!==null?x.mort:x.ne),Math.max(0,ORIGINES.indexOf(x.origine)),x.parents.length?ip(0):-1,x.parents.length>1?ip(1):-1,
      M.voies.get(x.id),dr,r4(n.F),r4(fini(n.ahat)?n.ahat:n.a),r4(n.E),fini(n.n)?n.n:null,r4(n.se_F),x.raison||null,difference(x,M,GENES,posGene),
      fini(x.noteG)?x.noteG:null,x.parents.filter(p=>!M.index.has(p))];});
  const sacres={};for(const [id,L] of M.sacres)if(M.index.has(id))sacres[M.index.get(id)]=L.slice().sort((a,b)=>a-b);
  const sacresClair={};if(M.sacresClair)for(const [id,L] of M.sacresClair)if(M.index.has(id))sacresClair[M.index.get(id)]=L.slice();   /* (28/11, lot « sacre ») */
  /* les reperes de l'axe : nouvelle epoque, nouvelle phase */
  const reperes=[];let ep=null,ph=null;
  for(const g of M.generations){
    if(ep!==null&&g.epoque!==ep)reperes.push([g.generation,'époque']);
    if(ph!==null&&g.phase!==ph)reperes.push([g.generation,'phase '+g.phase]);
    ep=g.epoque;ph=g.phase;}
  /* (27/11/2026, le relecteur) une nouvelle epoque et une nouvelle phase a la meme generation : un seul repere (les deux textes se chevauchaient) */
  for(let i=reperes.length-1;i>0;i--)if(reperes[i][0]===reperes[i-1][0]){reperes[i-1][1]+=' · '+reperes[i][1];reperes.splice(i,1);}
  const nes=M.individus.length,morts=M.individus.filter(x=>!x.vivant).length,vivants=nes-morts;
  return {g:M.generation,detail:o.detail||60,voies:M.nVoies,genes:GENES,types:TYPES,mots:GENES.map(motDe),tetes:TETES,
    noeuds,sacres,sacresClair,reperes,chiffres:{generations:M.generations.length,nes,morts,vivants,sacres:[...M.sacres.values()].reduce((s,L)=>s+L.length,0)},
    champion:M.index.has(M.champion)?M.index.get(M.champion):-1,temoin:M.index.has(M.temoin)?M.index.get(M.temoin):-1,
    meneur:M.meneur&&M.index.has(M.meneur)?M.index.get(M.meneur):-1,temoinDit:M.temoinDit||'pilote-voltige (c0025)'};}

/* ===== LE PROGRAMME DE LA PAGE (27/11/2026) =====
   Ecrit ici comme une fonction ordinaire, recopiee telle quelle dans la page (programme.toString()). Hors navigateur (tests : vm, sans document),
   il ne dessine rien et expose seulement ARBRE.fiche(i), ARBRE.chercher(texte), ARBRE.visibles(tous). */
function programme(){
  'use strict';
  const D=typeof DONNEES!=='undefined'?DONNEES:JSON.parse(document.getElementById('donnees').textContent);
  const ORIG=['temoin','g0','mutation','croisement','immigre','inconnue'];
  const N=D.noeuds,n=N.length;
  /* les champs d'un noeud */
  const ID=0,NE=1,FIN=2,OR=3,P1=4,P2=5,VOIE=6,DR=7,F=8,PAL=9,E=10,NB=11,SEF=12,RAISON=13,DIFF=14,NOTEG=15,PINC=16;
  const enfants=N.map(()=>[]);
  for(let i=0;i<n;i++){const a=N[i];if(a[P1]>=0)enfants[a[P1]].push(i);if(a[P2]>=0&&a[P2]!==a[P1])enfants[a[P2]].push(i);}
  const esc=s=>String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  const fini=x=>typeof x==='number'&&isFinite(x);
  const fr=(x,d)=>fini(x)?x.toFixed(d).replace('.',',').replace('-','−'):'–';
  const court=i=>String(N[i][ID]).slice(0,8);
  function val(x,t){
    if(x===null||x===undefined)return '?';
    if(t==='d')return x?'oui':'non';
    if(typeof x!=='number')return esc(x);
    if(Number.isInteger(x))return String(x).replace('-','−');
    let s=x.toFixed(4).replace(/0+$/,'');if(s.split('.')[1].length<2)s=x.toFixed(2);
    return s.replace('.',',').replace('-','−');}
  const lien=i=>i>=0?'<button type="button" class="lien code" data-va="'+i+'">'+esc(court(i))+'</button>':'?';
  const fin=i=>N[i][FIN]<0?D.g:N[i][FIN];

  /* LA FICHE D'UN PILOTE : un texte HTML */
  function fiche(i){
    const a=N[i];if(!a)return '';
    const o=ORIG[a[OR]],dr=a[DR],h=[];
    const badges=[];
    if(dr&1)badges.push('<span class="badge temoin">témoin</span>');
    if(i===D.champion)badges.push('<span class="badge champion">champion en titre</span>');
    else if(dr&4)badges.push('<span class="badge champion">ancien champion</span>');
    if(dr&16)badges.push('<span class="badge meneur">meneur</span>');
    if((dr&8)&&!(dr&2))badges.push('<span class="badge lignee">ancêtre du champion</span>');
    h.push('<h3>Pilote <span class="code">'+esc(a[ID])+'</span> '+badges.join(' ')+'</h3>');
    const inc=(a[PINC]||[]).map(p=>'<span class="code">'+esc(String(p).slice(0,8))+'</span>');
    const p1=a[P1]>=0?lien(a[P1]):(inc[0]||'un parent inconnu'),p2=a[P2]>=0?lien(a[P2]):(inc[1]||'un parent inconnu');
    if(o==='temoin')h.push('<p><b>Le témoin</b> : '+esc(D.temoinDit||'pilote-voltige (c0025)')+', le pilote de départ, tel qu\'il est. Il n\'est jamais modifié ni renvoyé : '+
      'c\'est le mètre étalon. Tous les autres descendent de lui.</p>');
    else if(o==='g0')h.push('<p>Né à la <b>génération '+a[NE]+'</b>, <b>mutant de départ</b> : une copie de '+p1+' (le témoin) dont quelques réglages ont été changés au hasard.</p>');
    else if(o==='mutation')h.push('<p>Né à la <b>génération '+a[NE]+'</b> par <b>mutation</b> de '+p1+' : une copie dont un ou quelques réglages ont été changés au hasard.</p>');
    else if(o==='croisement')h.push('<p>Né à la <b>génération '+a[NE]+'</b> par <b>croisement</b> de '+p1+' et de '+p2+' : chaque réglage est pris chez l\'un ou chez l\'autre, puis une petite mutation.</p>');
    else if(o==='immigre')h.push('<p>Né à la <b>génération '+a[NE]+'</b>, <b>immigré</b> : une copie très changée '+
      (a[P1]>=0||inc.length?'de '+p1+', le champion d\'alors,':'du champion d\'alors (son nom n\'est pas dans les journaux),')+' pour garder de la variété.</p>');
    else h.push('<p>Né à la <b>génération '+a[NE]+'</b>'+(a[P1]>=0||inc.length?', de '+p1:'')+'.</p>');
    /* ce qui a change */
    const d=a[DIFF];
    if(o!=='temoin'&&a[P1]<0&&!inc.length)h.push('<h4>Ce qui a changé</h4><p class="doux">Pas de parent connu : on ne peut pas dire ce qui a changé.</p>');
    else if(o!=='temoin'){
      h.push('<h4>Ce qui a changé par rapport à '+(o==='croisement'?'son premier parent, '+p1:'son parent, '+p1)+'</h4>');
      if(d&&!Array.isArray(d)){
        h.push(d.c&&d.c.length?'<p>Réglages changés : '+d.c.map(k=>'<span class="code">'+esc(k)+'</span>').join(', ')+' (le génome complet n\'est plus dans les journaux : les valeurs manquent).</p>':
          '<p class="doux">Le génome n\'est pas dans les journaux : on ne peut pas dire ce qui a changé.</p>');}
      else if(d){
        const mut=d.filter(x=>x[0]>=0&&!x[3]),pris=d.filter(x=>x[0]>=0&&x[3]),tet=d.filter(x=>x[0]<0);
        const ligne=x=>{const k=D.genes[x[0]],m=D.mots[x[0]];
          return '<li><span class="code">'+esc(k)+'</span>'+(m?' <span class="doux">('+esc(m)+')</span>':'')+' : '+val(x[1],D.types[x[0]])+' → <b>'+val(x[2],D.types[x[0]])+'</b></li>';};
        if(mut.length)h.push((pris.length?'<p>Mutations :</p>':'')+'<ul class="diff">'+mut.map(ligne).join('')+'</ul>');
        if(pris.length)h.push('<p>Pris chez '+p2+' :</p><ul class="diff">'+pris.map(ligne).join('')+'</ul>');
        for(const x of tet){const t=D.tetes[x[0]===-1?'WV':'WS'];
          h.push('<p><b>'+esc(t.nom)+'</b> <span class="doux">('+esc(t.mot)+')</span> : '+(x[3]?'prise chez '+p2+', ':'')+
            (fini(x[1])?x[1]+' poids changé'+(x[1]>1?'s':'')+' sur '+x[2]:'changée')+'.</p>');}
        if(!d.length)h.push('<p class="doux">Aucun réglage ne diffère'+(o==='croisement'?' de '+p1+' (tout a été pris chez lui, sans mutation visible)':'')+'.</p>');}
      else h.push('<p class="doux">Pas de parent connu.</p>');}
    /* les notes */
    h.push('<h4>Ses notes'+(fini(a[NOTEG])?' <span class="doux">('+(a[FIN]>=0?'à son renvoi, génération '+a[NOTEG]:'à la génération '+a[NOTEG])+')</span>':'')+'</h4>');
    if(fini(a[F])||fini(a[PAL]))h.push('<dl class="notes"><dt>palier</dt><dd>'+fr(a[PAL],2)+' <span class="doux">· jusqu\'où il va, corrigé de la difficulté des courses</span></dd>'+
      '<dt>écart aux joueurs</dt><dd>'+fr(a[E],2)+' <span class="doux">· 0 = il conduit comme un joueur</span></dd>'+
      '<dt>note F</dt><dd><b>'+fr(a[F],2)+'</b>'+(fini(a[SEF])?' ± '+fr(a[SEF],2):'')+' <span class="doux">· palier − 4 × écart : elle décide qui reste</span></dd>'+
      '<dt>courses</dt><dd>'+(fini(a[NB])?a[NB]:'–')+'</dd></dl>');
    else h.push('<p class="doux">Pas encore noté.</p>');
    /* la vie */
    const R={renvoi:'sa note F était parmi les plus basses',pannes:'renvoyé d\'office : pannes de cerveau','non-mesuree':'renvoyé d\'office : deux courses ratées dans la même génération'};
    if(a[FIN]>=0)h.push('<p>Renvoyé à la <b>génération '+a[FIN]+'</b>'+(a[RAISON]?' ('+esc(R[a[RAISON]]||a[RAISON])+')':'')+', après '+(a[FIN]-a[NE]+1)+' génération'+(a[FIN]-a[NE]?'s':'')+' de vie.</p>');
    else h.push('<p><b>Encore en vie</b> à la génération '+D.g+(o==='temoin'?'':' ('+(D.g-a[NE]+1)+' génération'+(D.g-a[NE]?'s':'')+' de vie)')+'.</p>');
    const S=D.sacres[i],SC=D.sacresClair&&D.sacresClair[i];
    if(S&&S.length)h.push('<p>Sacré champion à la génération '+S.join(', ')+' : il a prouvé sur des courses neuves qu\'il faisait mieux que le champion d\'alors'+(SC&&SC.length?' ('+esc(SC.join(' ; '))+')':'')+'.</p>');
    const E2=enfants[i];
    if(E2.length)h.push('<p>'+E2.length+' enfant'+(E2.length>1?'s':'')+' : '+E2.slice(0,40).map(lien).join(' ')+(E2.length>40?' …':'')+'</p>');
    else h.push('<p class="doux">Aucun enfant.</p>');
    return h.join('');}

  /* les pilotes dessines : tous, ou ceux qui comptent (vivants, parents, champions, lignee) */
  function visibles(tous){const V=[];for(let i=0;i<n;i++){const a=N[i];if(tous||a[FIN]<0||(a[DR]&(1|2|4|8|16|32)))V.push(i);}return V;}
  function chercher(t){t=String(t||'').trim().toLowerCase();if(!t)return -1;
    for(let i=0;i<n;i++)if(N[i][ID]===t)return i;for(let i=0;i<n;i++)if(N[i][ID].indexOf(t)===0)return i;return -1;}
  const ARBRE={fiche,visibles,chercher,enfants};
  if(typeof window!=='undefined')window.ARBRE=ARBRE;
  if(typeof document==='undefined'||!document.getElementById)return;

  /* ---------- LE DESSIN ---------- */
  const boite=document.getElementById('arbre'),panneau=document.getElementById('fiche'),caseTous=document.getElementById('tous');
  caseTous.checked=n<=2500;
  let geo=null,choisi=-1,largeurVue=0;
  function dessiner(){
    const W=Math.max(320,boite.clientWidth||900),tous=caseTous.checked;
    largeurVue=W;
    const Gc=D.g,gd=Math.max(0,Gc-D.detail+1),nV=gd,nD=Gc-gd+1;
    const p0=nV>300?2:4,mg=14,md=56;
    /* (27/11/2026, le relecteur) jusqu'a 110 px par generation : un arbre de quelques generations n'occupait qu'un quart de la largeur */
    const p1=Math.max(14,Math.min(110,(W-mg-md-nV*p0)/nD));
    const X=g=>g<gd?mg+g*p0:mg+nV*p0+(g-gd)*p1,pas=g=>g<gd?p0:p1;
    const H=15,haut=30,Ht=haut+D.voies*H+30,Wt=Math.ceil(X(Gc)+p1+md),Y=v=>haut+v*H+H/2;
    const V=visibles(tous),vu=new Uint8Array(n);for(const i of V)vu[i]=1;
    const o=[];
    o.push('<svg id="dessin" width="'+Wt+'" height="'+Ht+'" viewBox="0 0 '+Wt+' '+Ht+'" role="group" aria-label="arbre généalogique des pilotes">');
    if(nV>0){o.push('<rect class="resserre" x="'+mg+'" y="'+(haut-6)+'" width="'+(nV*p0).toFixed(1)+'" height="'+(D.voies*H+12)+'"/>');
      if(nV*p0>110)o.push('<text class="axe" x="'+(mg+4)+'" y="'+(haut-10)+'">générations 0 à '+(gd-1)+' resserrées</text>');}
    /* l'axe : une graduation lisible tous les ~40 px */
    const kD=[1,2,5,10,20,25,50,100].find(k=>k*p1>=38)||100,kV=[10,20,50,100,200,500,1000].find(k=>k*p0>=40)||1000;
    for(let g=0;g<=Gc;g++){const det=g>=gd;if(det?(g%kD):(g%kV))continue;if(!det&&g>gd-kV/2&&gd>0)continue;
      o.push('<line class="grille" x1="'+X(g).toFixed(1)+'" x2="'+X(g).toFixed(1)+'" y1="'+(haut-4)+'" y2="'+(Ht-22)+'"/>');
      o.push('<text class="axe" x="'+X(g).toFixed(1)+'" y="'+(Ht-8)+'" text-anchor="middle">'+g+'</text>');}
    o.push('<text class="axe titre" x="'+(Wt-4)+'" y="'+(Ht-8)+'" text-anchor="end">génération</text>');
    let finTexte=-1e9;   /* deux reperes trop proches : le second garde son trait, pas son texte (ils se chevauchaient a 380 px) */
    for(const r of D.reperes){const x=X(r[0])-pas(r[0])/2;
      o.push('<line class="repere" x1="'+x.toFixed(1)+'" x2="'+x.toFixed(1)+'" y1="'+(haut-14)+'" y2="'+(Ht-22)+'"/>');
      if(r[0]>=gd&&x>finTexte){o.push('<text class="repere-texte" x="'+(x+3).toFixed(1)+'" y="'+(haut-16)+'">'+esc(r[1])+'</text>');finTexte=x+8+6*r[1].length;}}
    /* les fils vers les parents, puis les vies, puis les points (dans cet ordre : les points dessus) */
    const fils=[],filsL=[],vies=[],viesL=[],pts=[];
    for(const i of V){const a=N[i],x1=X(a[NE]),y=Y(a[VOIE]),det=a[NE]>=gd,lig=(a[DR]&8)!==0;
      for(const k of [P1,P2]){const p=a[k];if(p<0||!vu[p]||(k===P2&&p===a[P1]))continue;
        const yp=Y(N[p][VOIE]),xp=x1-pas(a[NE])*(det?.75:1.5),c=(xp+x1)/2;
        const t='<path class="fil'+(k===P2?' second':'')+(lig&&(N[p][DR]&8)?' lig':'')+'" d="M'+xp.toFixed(1)+' '+yp+'C'+c.toFixed(1)+' '+yp+' '+c.toFixed(1)+' '+y+' '+x1.toFixed(1)+' '+y+'"/>';
        (lig&&(N[p][DR]&8)?filsL:fils).push(t);}
      const f=fin(i),x2=X(f)+pas(f)*(a[FIN]<0?.95:.55);
      const t='<line class="vie o'+a[OR]+(lig?' lig':'')+(det?'':' fine')+(a[FIN]<0?' vivant':'')+'" x1="'+x1.toFixed(1)+'" x2="'+x2.toFixed(1)+'" y1="'+y+'" y2="'+y+'"/>';
      (lig?viesL:vies).push(t);
      const gros=(a[DR]&(1|2|4|32))||a[FIN]<0,r=det?(gros?4.6:3):(gros?2.4:1.5),cl='pt o'+a[OR]+(gros?'':' petit');
      const attr=det?' tabindex="0" role="button" aria-label="pilote '+court(i)+', né génération '+a[NE]+'" data-i="'+i+'"':' data-i="'+i+'"';
      const xs=x1.toFixed(1);
      if(a[OR]===0)pts.push('<path class="'+cl+'"'+attr+' d="M'+xs+' '+(y-r*1.5)+'l'+(r*1.5)+' '+(r*1.5)+'l'+(-r*1.5)+' '+(r*1.5)+'l'+(-r*1.5)+' '+(-r*1.5)+'z"/>');
      else if(a[OR]===1)pts.push('<rect class="'+cl+'"'+attr+' x="'+(x1-r).toFixed(1)+'" y="'+(y-r)+'" width="'+(2*r)+'" height="'+(2*r)+'"/>');
      else if(a[OR]===4)pts.push('<path class="'+cl+'"'+attr+' d="M'+xs+' '+(y-r*1.3)+'l'+(r*1.2)+' '+(r*2.1)+'h'+(-r*2.4)+'z"/>');
      else if(a[OR]===3)pts.push('<circle class="'+cl+' anneau"'+attr+' cx="'+xs+'" cy="'+y+'" r="'+(r*.85).toFixed(2)+'"/>');
      else pts.push('<circle class="'+cl+'"'+attr+' cx="'+xs+'" cy="'+y+'" r="'+r+'"/>');
      if(a[DR]&(2|4)){pts.push('<text class="etoile'+(a[DR]&2?' titre':'')+'" x="'+xs+'" y="'+(y-(det?6:4))+'" text-anchor="middle">★</text>');}}
    o.push(fils.join(''),filsL.join(''),vies.join(''),viesL.join(''),pts.join(''));
    /* les noms du temoin et du champion en titre, au bout de leur vie */
    for(const [i,txt,cl] of [[D.temoin,'témoin','temoin'],[D.champion,'champion','champion']]){if(i<0||!vu[i]||(cl==='champion'&&i===D.temoin))continue;
      o.push('<text class="nom '+cl+'" x="'+(X(fin(i))+pas(fin(i))+3).toFixed(1)+'" y="'+(Y(N[i][VOIE])+4)+'">'+txt+'</text>');}
    o.push('<circle id="choisi" r="8" cx="-20" cy="-20"/>');
    o.push('</svg>');
    boite.innerHTML=o.join('');
    geo={X,pas,Y,H,haut,gd,p0,p1,mg,nV,V,vu};
    boite.scrollLeft=boite.scrollWidth;
    if(choisi>=0)marquer(choisi);}
  function marquer(i){const c=document.getElementById('choisi');if(!c||!geo)return;
    if(!geo.vu[i]){c.setAttribute('cx',-20);return;}
    c.setAttribute('cx',geo.X(N[i][NE]).toFixed(1));c.setAttribute('cy',geo.Y(N[i][VOIE]));}
  function ouvrir(i,defiler){
    if(i<0||i>=n)return;choisi=i;panneau.innerHTML=fiche(i);marquer(i);
    try{history.replaceState(null,'','#p='+N[i][ID]);}catch(e){}
    if(defiler&&geo&&geo.vu[i]){const x=geo.X(N[i][NE]);if(x<boite.scrollLeft+20||x>boite.scrollLeft+boite.clientWidth-20)boite.scrollLeft=x-boite.clientWidth/2;}
    if(defiler&&panneau.scrollIntoView)panneau.scrollIntoView({block:'nearest',behavior:'smooth'});}
  /* un clic n'importe ou sur la vie d'un pilote l'ouvre : on retrouve la voie et la generation sous le doigt */
  function sous(x,y){
    const g=geo,v=Math.round((y-g.haut-g.H/2)/g.H);
    const gen=x<g.mg+g.nV*g.p0?(x-g.mg)/g.p0:g.gd+(x-g.mg-g.nV*g.p0)/g.p1;
    let best=-1,ecart=1e9;
    for(const i of g.V){const a=N[i];if(a[VOIE]!==v)continue;const f=fin(i);
      if(gen>=a[NE]-.45&&gen<=f+.9){const e=Math.abs(gen-a[NE]);if(e<ecart){ecart=e;best=i;}}}
    return best;}
  boite.addEventListener('click',ev=>{
    const t=ev.target.closest?ev.target.closest('[data-i]'):null;
    if(t){ouvrir(+t.getAttribute('data-i'),false);return;}
    const s=document.getElementById('dessin');if(!s)return;const r=s.getBoundingClientRect();
    const i=sous(ev.clientX-r.left,ev.clientY-r.top);if(i>=0)ouvrir(i,false);});
  boite.addEventListener('keydown',ev=>{const t=ev.target;if(!t.getAttribute||!t.hasAttribute('data-i'))return;
    if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();ouvrir(+t.getAttribute('data-i'),true);}});
  panneau.addEventListener('click',ev=>{const t=ev.target.closest?ev.target.closest('[data-va]'):null;if(t)ouvrir(+t.getAttribute('data-va'),true);});
  document.getElementById('aller').addEventListener('click',ev=>{const t=ev.target.closest?ev.target.closest('[data-aller]'):null;if(!t)return;
    const k=t.getAttribute('data-aller');ouvrir(k==='champion'?D.champion:k==='temoin'?D.temoin:D.meneur,true);});
  document.getElementById('chercher').addEventListener('submit',ev=>{ev.preventDefault();
    const i=chercher(document.getElementById('cle').value);if(i>=0)ouvrir(i,true);else panneau.innerHTML='<p class="doux">Aucun pilote ne commence par « '+esc(document.getElementById('cle').value)+' ».</p>';});
  caseTous.addEventListener('change',dessiner);
  let minuterie=0;
  window.addEventListener('resize',()=>{clearTimeout(minuterie);minuterie=setTimeout(()=>{if(Math.abs((boite.clientWidth||0)-largeurVue)>30)dessiner();},150);});
  dessiner();
  const m=/[#&]p=([0-9a-f]+)/.exec(location.hash||'');
  const depart=m?chercher(m[1]):-1;
  if(depart>=0)ouvrir(depart,false);
  else if(D.champion>=0)ouvrir(D.champion,false);
  document.documentElement.setAttribute('data-pret','1');
}

/* ===== LA PAGE ===== */
const esc=s=>String(s==null?'':s).replace(/\r/g,'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const nb=x=>String(x).replace(/\B(?=(\d{3})+(?!\d))/g,' ');
function dateFr(ms){
  const d=new Date(ms);if(isNaN(d))return '–';const p=k=>String(k).padStart(2,'0');
  return p(d.getDate())+'/'+p(d.getMonth()+1)+'/'+d.getFullYear()+' à '+p(d.getHours())+' h '+p(d.getMinutes());}
const LEGENDE=[
  ['<path class="pt o0" d="M8 2l6 6-6 6-6-6z"/>','le témoin (le pilote de départ, jamais modifié)'],
  ['<rect class="pt o1" x="3" y="3" width="10" height="10"/>','mutant de départ (génération 0)'],
  ['<circle class="pt o2" cx="8" cy="8" r="5"/>','mutation : une copie changée d\'un parent'],
  ['<circle class="pt o3 anneau" cx="8" cy="8" r="4.3"/>','croisement : le mélange de deux parents'],
  ['<path class="pt o4" d="M8 2l6 11H2z"/>','immigré : une copie très changée du champion'],
  ['<text class="etoile titre" x="8" y="13" text-anchor="middle">★</text>','sacré champion'],
  ['<line class="vie lig" x1="1" x2="15" y1="8" y2="8"/>','la lignée du champion en titre']];
function page(cfg,o){
  o=o||{};
  const M=modele(cfg,o),P=donneesPage(M,o),ch=P.chiffres;
  const maintenant=o.maintenant!=null?o.maintenant:Date.now();
  const json=JSON.stringify(P).replace(/</g,'\\u003c').split(String.fromCharCode(0x2028)).join('\\u2028').split(String.fromCharCode(0x2029)).join('\\u2029');
  const S=[];
  S.push('<header><h1>L\'arbre généalogique des pilotes</h1>'+
    '<p class="sous">CASH CAR · la sélection naturelle des bots · page refaite à la fin de chaque génération (dernière fois : '+esc(dateFr(maintenant))+')'+
    ' · <a href="tableau.html">le tableau de bord</a> · <a href="histoire.md">le récit</a></p></header>');
  S.push('<section class="lire"><h2>Comment le lire</h2>'+
    '<p>Chaque point est un pilote, posé à la génération où il est né ; le trait qui part vers la droite est sa vie, jusqu\'à son renvoi, ou jusqu\'à aujourd\'hui s\'il vit encore. '+
    'Un fil courbe le relie à son parent (deux fils pour un croisement), et la forme du point dit d\'où il vient. '+
    'Le trait vert épais remonte la lignée du champion en titre jusqu\'au témoin, le pilote de départ ; touchez un point pour lire sa fiche : ce qui a changé par rapport à son parent, et ses notes.</p>'+
    '<p class="chiffres"><b>'+nb(ch.generations)+'</b> génération'+(ch.generations>1?'s':'')+' · <b>'+nb(ch.nes)+'</b> pilotes nés · <b>'+nb(ch.morts)+'</b> renvoyés · <b>'+
    nb(ch.vivants)+'</b> vivants · <b>'+nb(ch.sacres)+'</b> sacre'+(ch.sacres>1?'s':'')+'</p>'+
    '<ul class="legende">'+LEGENDE.map(l=>'<li><svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">'+l[0]+'</svg>'+esc(l[1])+'</li>').join('')+'</ul></section>');
  S.push('<section class="toile"><div class="outils"><div id="aller" class="boutons">'+
    '<button type="button" data-aller="champion">le champion en titre</button><button type="button" data-aller="temoin">le témoin</button>'+
    (P.meneur>=0?'<button type="button" data-aller="meneur">le meneur</button>':'')+'</div>'+
    '<form id="chercher" role="search"><label for="cle">pilote</label> <input id="cle" size="12" autocomplete="off" spellcheck="false" placeholder="77ab12cd"> <button type="submit">ouvrir</button></form>'+
    '<label class="case"><input type="checkbox" id="tous"> montrer aussi les pilotes renvoyés sans enfant</label></div>'+
    '<div id="arbre" class="defile" tabindex="-1"><p class="doux">Le dessin a besoin de JavaScript (il est dans la page, rien ne vient d\'Internet).</p></div>'+
    (P.g-P.detail+1>0?'<p class="petit">Les '+P.detail+' dernières générations sont en détail ; les plus anciennes sont resserrées à gauche (faites défiler).</p>':'')+
    '</section>');
  S.push('<section id="fiche" class="fiche" aria-live="polite"><p class="doux">Touchez un point de l\'arbre pour lire la fiche d\'un pilote.</p></section>');
  return '<!doctype html>\n<html lang="fr">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n'+
    '<title>Arbre des pilotes</title>\n<style>\n'+CSS+'</style>\n</head>\n<body>\n<main>\n'+S.join('\n')+'\n</main>\n'+
    '<script type="application/json" id="donnees">'+json+'</script>\n<script>\n('+programme.toString()+')();\n</script>\n</body>\n</html>\n';}

/* la palette du tableau (tableau.js), plus une couleur par origine ; clair et sombre */
const CSS=[
  ':root{--fond:#f7f6f2;--carte:#ffffff;--texte:#1d2329;--doux:#5f6a75;--trait:#d9dcdf;--grille:#eceef0;--bande:#eef0ee;',
  '  --champion:#1d9a5b;--temoin:#8a9099;--meneur:#2f6fd6;--g0:#178a8a;--mutation:#2f6fd6;--croisement:#d98a1a;--immigre:#9b6bd3;--fil:#b8bec4;color-scheme:light}',
  '@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--fond:#15181b;--carte:#1e2226;--texte:#e7eaed;--doux:#9aa4ae;--trait:#353b41;--grille:#2a2f34;--bande:#1a1e21;',
  '  --champion:#3cc47f;--temoin:#9aa1aa;--meneur:#5e94f0;--g0:#3bbcbc;--mutation:#5e94f0;--croisement:#eba340;--immigre:#b590e6;--fil:#4a5258;color-scheme:dark}}',
  ':root[data-theme="dark"]{--fond:#15181b;--carte:#1e2226;--texte:#e7eaed;--doux:#9aa4ae;--trait:#353b41;--grille:#2a2f34;--bande:#1a1e21;',
  '  --champion:#3cc47f;--temoin:#9aa1aa;--meneur:#5e94f0;--g0:#3bbcbc;--mutation:#5e94f0;--croisement:#eba340;--immigre:#b590e6;--fil:#4a5258;color-scheme:dark}',
  '*{box-sizing:border-box}',
  'body{margin:0;background:var(--fond);color:var(--texte);font:16px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}',
  'main{max-width:1240px;margin:0 auto;padding:18px 16px 60px}',
  'h1{font-size:1.5rem;margin:.2em 0}h2{font-size:1.15rem;margin:0 0 .4em}h3{font-size:1.05rem;margin:0 0 .5em}h4{font-size:.95rem;margin:1em 0 .3em}',
  'a{color:var(--meneur)}header .sous{color:var(--doux);margin:.2em 0 1em;font-size:.92rem}',
  'section{background:var(--carte);border:1px solid var(--trait);border-radius:10px;padding:14px 16px;margin:12px 0}',
  '.lire p{margin:.2em 0 .6em;max-width:72em}.chiffres{font-size:1.02rem}',
  '.legende{list-style:none;margin:.4em 0 0;padding:0;display:flex;flex-wrap:wrap;gap:4px 18px;font-size:.86rem;color:var(--doux)}',
  '.legende li{display:flex;align-items:center;gap:6px}.legende svg{flex:none;overflow:visible}',
  '.outils{display:flex;flex-wrap:wrap;gap:8px 18px;align-items:center;margin-bottom:8px;font-size:.9rem}',
  '.boutons{display:flex;flex-wrap:wrap;gap:6px}',
  'button{font:inherit;font-size:.88rem;color:var(--texte);background:var(--fond);border:1px solid var(--trait);border-radius:6px;padding:3px 9px;cursor:pointer}',
  'button:hover,button:focus-visible{border-color:var(--meneur)}input{font:inherit;font-size:.88rem;color:var(--texte);background:var(--fond);border:1px solid var(--trait);border-radius:6px;padding:3px 6px;width:8.5em}',
  '.case{color:var(--doux);display:flex;align-items:center;gap:6px}.case input{width:auto}',
  '.defile{overflow-x:auto;overflow-y:hidden;-webkit-overflow-scrolling:touch;border-top:1px solid var(--grille);border-bottom:1px solid var(--grille)}',
  '#dessin{display:block}',
  '#dessin .resserre{fill:var(--bande)}#dessin .grille{stroke:var(--grille);stroke-width:1}',
  '#dessin .axe{fill:var(--doux);font-size:11px}#dessin .axe.titre{font-size:11.5px}',
  '#dessin .repere{stroke:var(--doux);stroke-dasharray:2 4;stroke-width:1}#dessin .repere-texte{fill:var(--doux);font-size:10.5px}',
  '.fil{fill:none;stroke:var(--fil);stroke-width:1}.fil.second{stroke-dasharray:3 2}.fil.lig{stroke:var(--champion);stroke-width:2.6;stroke-dasharray:none}',
  '.vie{stroke-width:2;stroke-linecap:round;opacity:.5}.vie.fine{stroke-width:1.2;opacity:.42}.vie.vivant{opacity:.85}',
  '.vie.lig{stroke:var(--champion)!important;stroke-width:3.6;opacity:.9}.vie.lig.fine{stroke-width:2.4}',
  '.o0{stroke:var(--temoin);fill:var(--temoin)}.o1{stroke:var(--g0);fill:var(--g0)}.o2{stroke:var(--mutation);fill:var(--mutation)}',
  '.o3{stroke:var(--croisement);fill:var(--croisement)}.o4{stroke:var(--immigre);fill:var(--immigre)}.o5{stroke:var(--doux);fill:var(--doux)}',
  '.pt{stroke:var(--carte);stroke-width:1.2;cursor:pointer}.pt.petit{opacity:.75;stroke-width:.6}',
  '.pt.anneau{fill:var(--carte);stroke:var(--croisement);stroke-width:2.2}.pt.anneau.petit{stroke-width:1.4}',
  '.pt:focus{outline:none;stroke:var(--texte);stroke-width:2.4}',
  '.etoile{fill:var(--champion);font-size:10px;pointer-events:none}.etoile.titre{font-size:14px}',
  '.nom{font-size:12px;font-weight:600;pointer-events:none}.nom.temoin{fill:var(--temoin)}.nom.champion{fill:var(--champion)}',
  '#choisi{fill:none;stroke:var(--texte);stroke-width:2;pointer-events:none}',
  '.fiche{min-height:8em}.fiche p{margin:.3em 0}.fiche ul.diff{margin:.2em 0 .4em;padding-left:1.2em}.fiche li{margin:.1em 0}',
  '.notes{display:grid;grid-template-columns:max-content 1fr;gap:2px 12px;margin:.2em 0}.notes dt{color:var(--doux)}.notes dd{margin:0}',
  '.badge{display:inline-block;font-size:.75rem;font-weight:600;border-radius:4px;padding:1px 6px;vertical-align:middle;border:1px solid}',
  '.badge.champion{color:var(--champion)}.badge.temoin{color:var(--temoin)}.badge.meneur{color:var(--meneur)}.badge.lignee{color:var(--champion);border-style:dashed}',
  '.lien{border:none;background:none;padding:0 2px;color:var(--meneur);text-decoration:underline;font-size:.92em}',
  '.code{font-family:ui-monospace,Consolas,monospace;font-size:.9em}.doux{color:var(--doux)}.petit{font-size:.84rem;color:var(--doux);margin:.5em 0 0}',
  '@media (max-width:560px){section{padding:12px 12px}main{padding:12px 10px 40px}.notes{grid-template-columns:1fr}.notes dd{margin-bottom:4px}}',
  ''].join('\n');

function ecrire(cfg,o){
  const dossier=ET.chemin(cfg,cfg.dossierEtat||'etat');
  const f=path.join(dossier,'arbre.html');
  ecrireAtomique(f,page(cfg,o).replace(/\r/g,''));
  return f;}

/* --etat dossier (relatif a ml/evolution ou absolu) remplace cfg.dossierEtat, comme evoluer.js */
function lireLigne(argv){
  const o={};
  for(let i=0;i<argv.length;i++){if(argv[i]==='--config')o.config=argv[++i];else if(argv[i]==='--etat')o.etat=argv[++i];}
  const cfg=ET.lireConfig(o.config);if(o.etat)cfg.dossierEtat=o.etat;
  return cfg;}

module.exports={ecrire,page,modele,donneesPage,programme,motDe,lireLigne,MOTS};

if(require.main===module){
  try{const f=ecrire(lireLigne(process.argv.slice(2)));process.stdout.write('arbre : '+f+'\n');}
  catch(e){process.stderr.write('arbre : '+(e&&e.message||e)+'\n');process.exit(1);}
}
