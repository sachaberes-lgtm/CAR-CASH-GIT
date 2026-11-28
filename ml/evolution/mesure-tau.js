'use strict';
/* ===== LA MESURE GRATUITE DE TAU : LES MUTATIONS COMPTENT-ELLES ? (28/11/2026, lot « tau » : « la selection peut le mesurer sans jouer une course de plus ») =====
   La question dont tout depend (ml/ecurie/etude/reglage-de-la-selection/LISEZ-MOI.md § 4, M1 et M4) : τ, l'ecart VRAI de niveau entre deux enfants,
   est-il plus grand que zero ? L'etude effets/ l'estime a 0,32 palier [0 ; 1,07] sur 19 mutants : on ne sait pas.
   LA MESURE (M1) : chaque enfant joue les graines de sa generation de naissance G (la « premiere moitie »), puis les graines neuves de G+1 (la
   « seconde moitie ») ; il ne peut pas etre renvoye avant (evoluer.js : eligibles nes avant G). Si les mutations comptent, un enfant bon sur la
   premiere moitie l'est aussi sur la seconde : la covariance entre enfants de leurs deux niveaux vaut τ², et leur correlation r vaut
   τ² / √((τ² + s²/n1)(τ² + s²/n2)) (synthese/taille-de-la-mesure.js, s = 3,26 le hasard d'une course).
   - Le niveau d'un enfant sur une moitie = la moyenne, sur ses graines, de (palier − b_g), b_g l'effet de la graine du modele pilote + graine de
     note.js (note.ajuster), ajuste sur les seules courses des pilotes ETABLIS : le temoin (il joue toutes les graines, il n'est jamais renvoye)
     et les pilotes dans leur troisieme generation ou plus. Aucune moitie d'un enfant n'entre ainsi dans sa propre reference. (Avec toutes les
     courses, meme en retirant l'enfant de b_g, les niveaux des autres pilotes gardent 1/26 de sa chance, qui revient dans ses deux moities :
     τ² sortait trop bas d'environ 0,03 ; option reference:'tous', pour memoire.)
   - LE PIEGE (effets/ § Methode 2, et sa relecture) : la reference (ici les b_g, la-bas le temoin) est COMMUNE a tous les enfants d'une generation ;
     compter son bruit dans chaque enfant ecrasait τ (0,62 trouve pour 0,9 vrai). Ici τ² est une COVARIANCE entre moities jouees sur des graines
     differentes : le bruit commun deplace tous les enfants d'une generation d'un meme cran, il ne cree aucune covariance et ne l'efface pas.
     L'intervalle le compte : le re-echantillonnage tire les enfants ET, pour chaque generation, ses graines (le meme tirage pour tous les enfants
     qui les ont jouees), comme loiDesEffets d'effets/outils.js. Verifie sur des journaux fabriques (tests/mesure-tau.test.js : τ = 0, 0,9, 1).
   - LE SECOND PIEGE, trouve en fabriquant des journaux a τ = 0 : le modele pilote + graine fixe le niveau des graines de chaque generation par
     les pilotes qui en chevauchent deux ; ce niveau derive comme une marche au hasard le long des generations, et les deux moities d'un enfant
     tombent sur deux generations voisines : sans precaution, r ≈ 0,15 a 0,26 a τ = 0 (22 « victoires » sur 30 mondes). D'ou : chaque moitie
     est CENTREE sur les enfants nes la meme generation, et la covariance est groupee (ce qui decide). La version sans centrage est rendue a
     cote, pour memoire ; elle ne decide rien.
   - LA DECISION : jamais avant le nombre d'enfants requis pour distinguer τ = 0,5 de zero 8 fois sur 10 (z de Fisher, 1,96 + 0,84 ; 160 a 12
     graines par moitie dans la synthese, plus un enfant par generation perdu au centrage : 191 a λ = 6 ; 372 a 8 graines). Au-dela : r au-dessus
     de tanh(1,96/√(ddl − 2)) → « les mutations comptent », sinon « ne semblent pas compter ».
   - LES COURSES POUR RIEN (M4) : une course d'enfant de meme empreinte que celle d'un de ses parents sur la meme graine (la meme partie rejouee) ;
     en nombre et en temps (champ ms des lignes).
   Lecture seule : aucun fichier ecrit, aucune course jouee. Ne leve jamais depuis mesurer() : un etat vide, neuf, a 3 graines, tronque rend « trop tot ».
   Contrat : INTERFACES.md § 3.3 a 3.7 (les journaux lus). Note pour l'integrateur : notes/tau.md.
   Ligne de commande : node ml/evolution/mesure-tau.js [--config f] [--etat dossier] [--json] [--tirages N] */
const fs=require('fs'),path=require('path');

const FORMAT='evolution-mesure-tau-1';
const SIGMA_ETUDE=3.26;       /* le hasard d'une course autour du modele pilote + graine (effets/ § 3) */
const TAU_VISE=0.5;           /* l'ecart vrai qu'on veut pouvoir distinguer de zero (synthese § 4, M1) */
const Z_A=1.96,Z_B=0.8416;    /* 2 erreurs-types, 8 fois sur 10 (synthese/taille-de-la-mesure.js) */
const MIN_PAR_MOITIE=2;       /* graines mesurees au moins dans chaque moitie pour compter un enfant */
const MIN_GROUPE=10;          /* enfants au moins pour donner une estimation par origine ou par phase */

/* ===== OUTILS ===== */
const nombre=x=>typeof x==='number'&&x===x&&isFinite(x);
const moy=A=>{let s=0;for(const x of A)s+=x;return A.length?s/A.length:NaN;};
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const quantile=(A,p)=>{if(!A.length)return null;const B=A.slice().sort((a,b)=>a-b);return B[Math.min(B.length-1,Math.max(0,Math.round(p*(B.length-1))))];};
const mediane=A=>quantile(A,0.5);
const racine=x=>x>0?Math.sqrt(x):0;
const zFisher=r=>0.5*Math.log((1+r)/(1-r));
/* un nombre a la francaise : 0,32 ; −0,13 */
function fr(x,d){if(!nombre(x))return '-';const s=x.toFixed(d==null?2:d);return (s.charAt(0)==='-'&&+s!==0?'−'+s.slice(1):s.replace(/^-/,'')).replace('.',',');}

/* covariance et correlation de deux listes (n − 1) ; null sous trois enfants */
function covCorr(X,Y){
  const n=X.length;if(n<3)return {n,cov:null,r:null,vx:null,vy:null};
  const mx=moy(X),my=moy(Y);let sxy=0,sxx=0,syy=0;
  for(let i=0;i<n;i++){const a=X[i]-mx,b=Y[i]-my;sxy+=a*b;sxx+=a*a;syy+=b*b;}
  const cov=sxy/(n-1),r=sxx>0&&syy>0?sxy/Math.sqrt(sxx*syy):null;
  return {n,cov,r,vx:sxx/(n-1),vy:syy/(n-1)};}

/* ===== COMBIEN D'ENFANTS IL FAUT (repris de synthese/taille-de-la-mesure.js, moities de tailles n1 et n2) ===== */
function rAttendu(tau,n1,n2,s){s=s==null?SIGMA_ETUDE:s;const t2=tau*tau;return t2/Math.sqrt((t2+s*s/n1)*(t2+s*s/n2));}
/* le plus petit m tel que z(r)·√(m − 3) ≥ 1,96 + 0,84 ; τ = 0,5, n = 12, s = 3,26 → 160 (le chiffre de la synthese) */
function enfantsRequis(tau,n1,n2,s){
  if(!(n1>0)||!(n2>0)||!(tau>0))return Infinity;
  const z=zFisher(rAttendu(tau,n1,n2,s));
  return 3+Math.ceil(((Z_A+Z_B)/z)*((Z_A+Z_B)/z)-1e-9);}

/* ===== LIRE UN ETAT SANS JAMAIS LEVER ===== */
/* un JSONL : toute ligne illisible est sautee et comptee (au milieu comme a la fin : la mesure ne doit jamais faire echouer le tableau) */
function lireJsonlTolerant(f,defauts){
  let t;
  try{t=fs.readFileSync(f,'utf8');}catch(e){if(e.code!=='ENOENT')defauts.push(path.basename(f)+' illisible : '+e.message);return [];}
  const r=[];let mauvaises=0;
  for(const s0 of t.split('\n')){const s=s0.trim();if(!s)continue;try{const o=JSON.parse(s);if(o&&typeof o==='object')r.push(o);else mauvaises++;}catch(e){mauvaises++;}}
  if(mauvaises)defauts.push(path.basename(f)+' : '+mauvaises+' ligne(s) illisible(s) sautee(s)');
  return r;}
function lireJsonTolerant(f,defauts){
  let t;
  try{t=fs.readFileSync(f,'utf8');}catch(e){if(e.code!=='ENOENT')defauts.push(path.basename(f)+' illisible : '+e.message);return null;}
  try{const o=JSON.parse(t);return o&&typeof o==='object'?o:null;}catch(e){defauts.push(path.basename(f)+' n\'est pas du JSON entier (tronque ?)');return null;}}

/* les journaux d'un dossier d'etat : courses-*.jsonl (toutes les epoques, fichiers tries par nom), generations, morts, population */
function lireEtat(dossier){
  const defauts=[];let noms=[];
  try{noms=fs.readdirSync(dossier);}catch(e){defauts.push('dossier d\'etat absent ou illisible ('+(e.code||e.message)+')');}
  const courses=[];
  for(const n of noms.filter(x=>/^courses-.*\.jsonl$/.test(x)).sort())for(const l of lireJsonlTolerant(path.join(dossier,n),defauts))courses.push(l);
  return {dossier,courses,
    generations:noms.length?lireJsonlTolerant(path.join(dossier,'generations.jsonl'),defauts):[],
    morts:noms.length?lireJsonlTolerant(path.join(dossier,'morts.jsonl'),defauts):[],
    population:noms.length?lireJsonTolerant(path.join(dossier,'population.json'),defauts):null,
    defauts};}

/* ===== QUI EST NE QUAND, DE QUI ===== */
/* id -> {ne, origine, parents} : population.json (les vivants), puis morts.jsonl, puis les naissances de generations.jsonl ; le premier qui sait gagne */
function registre(D){
  const R=new Map();
  const mettre=(id,ne,origine,parents)=>{if(id==null)return;id=String(id);const x=R.get(id)||{};
    if(x.ne==null&&nombre(ne))x.ne=ne;if(!x.origine&&typeof origine==='string')x.origine=origine;
    if(!x.parents&&Array.isArray(parents))x.parents=parents.map(String);R.set(id,x);};
  const pop=D.population;
  if(pop&&Array.isArray(pop.vivants))for(const v of pop.vivants)if(v)mettre(v.id,v.ne,v.origine,v.parents);
  for(const m of D.morts)mettre(m.id,m.ne,m.origine,m.parents);
  for(const g of D.generations)if(g&&Array.isArray(g.naissances))for(const n of g.naissances)if(n)mettre(n.id,g.generation,n.origine,n.parents);
  const temoins=new Set();if(pop&&pop.temoin!=null)temoins.add(String(pop.temoin));
  for(const [id,x] of R)if(x.origine==='temoin')temoins.add(id);
  return {R,temoins};}

/* ===== M1 : LES DEUX MOITIES DE CHAQUE ENFANT ===== */
function moities(D,o,note){
  const {R,temoins}=registre(D);
  const phaseDe=new Map();for(const g of D.generations)if(g&&nombre(g.generation)&&typeof g.phase==='string')phaseDe.set(g.generation,g.phase);
  /* les courses d'entrainement mesurees, une par (epoque, pilote, graine) : la derniere ecrite compte (comme note.comparer) */
  const parCle=new Map();
  for(const l of D.courses){
    if(!l||l.usage!=='entrainement'||l.mesuree!==true||!nombre(l.palier)||!nombre(l.graine)||l.id==null||typeof l.epoque!=='string')continue;
    parCle.set(l.epoque+'|'+l.id+'|'+l.graine,l);}
  const parEpoque=new Map();
  for(const l of parCle.values()){if(!parEpoque.has(l.epoque))parEpoque.set(l.epoque,[]);parEpoque.get(l.epoque).push(l);}
  const pop=D.population,epoqueEnCours=pop&&pop.epoque&&pop.epoque.courses;
  /* la generation de naissance d'un pilote absent des journaux : sa premiere generation de courses (toutes epoques) */
  const premiere=new Map();for(const l of parCle.values())if(nombre(l.generation)){const id=String(l.id),p=premiere.get(id);if(p==null||l.generation<p)premiere.set(id,l.generation);}
  const enfants=[],epoques=[];let coupes=0,sansGeneration=0;
  /* les moities vues par enfant, toutes epoques : pour reconnaitre un enfant coupe par un changement d'epoque */
  const vu=new Map();
  for(const [ep,L0] of parEpoque){
    const exclure=new Set(ep===epoqueEnCours&&Array.isArray(pop.grainesRetirees)?pop.grainesRetirees:[]);
    const L=L0.filter(l=>!exclure.has(l.graine));
    const resume={courses:ep,lignes:L.length,pilotes:0,enfants:0,sigmaRes:null,ddl:null};epoques.push(resume);
    if(!L.length)continue;
    /* le modele sur toutes les courses : le hasard d'une course (sigmaRes), pour compter les enfants requis */
    const fit=note.ajuster(L,{passes:o.passes});
    const mg=new Map();for(const l of L)mg.set(l.graine,(mg.get(l.graine)||0)+1);
    const ids=new Set(L.map(l=>String(l.id)));resume.pilotes=ids.size;
    resume.sigmaRes=fit.sigmaRes;resume.ddl=L.length-ids.size-mg.size+1;
    /* LA REFERENCE : les effets de graine b_g ajustes sur les seules courses des pilots « etablis » (le temoin, qui joue toutes les graines et
       n'est jamais renvoye, et les pilotes dans leur troisieme generation ou plus). Aucune moitie d'enfant n'entre ainsi dans sa propre
       reference. Avec toutes les courses (o.reference 'tous', b_g recalcule sans l'enfant), les niveaux des AUTRES pilotes gardent 1/26 de la
       chance de l'enfant, qui revient dans ses deux moities : τ² sort trop bas d'environ 0,035 (mesure sur 40 mondes fabriques a τ = 0,9). */
    const neDe=id=>{const x=R.get(id);return x&&x.ne!=null?x.ne:premiere.get(id);};
    const etablie=l=>{const id=String(l.id);if(temoins.has(id))return true;const ne=neDe(id);return ne!=null&&nombre(l.generation)&&l.generation>=ne+2;};
    const parTous=o.reference==='tous';
    const fitE=parTous?null:note.ajuster(L.filter(etablie),{passes:o.passes});
    resume.lignesReference=parTous?L.length:L.filter(etablie).length;
    const parId=new Map();for(const l of L){const id=String(l.id);if(!parId.has(id))parId.set(id,[]);parId.get(id).push(l);}
    for(const [id,Li] of parId){
      if(temoins.has(id))continue;
      const info=R.get(id)||{},ne=info.ne!=null?info.ne:premiere.get(id);
      if(ne==null){sansGeneration++;continue;}
      const ai=nombre(fit.a[id])?fit.a[id]:null;
      const res=parTous?(l)=>{const m=mg.get(l.graine),b=fit.b[l.graine];if(!(m>=2)||!nombre(b)||!nombre(ai))return null;
        return l.palier-(m*b-(l.palier-ai))/(m-1);}
        :(l)=>{const b=fitE.b[l.graine];return nombre(b)?l.palier-b:null;};
      const h1=[],h2=[],g1=new Set();
      for(const l of Li)if(l.generation===ne){const r=res(l);if(r!=null){h1.push({k:ep+'|'+ne,g:l.graine,r});g1.add(l.graine);}}
      for(const l of Li)if(l.generation===ne+1&&!g1.has(l.graine)){const r=res(l);if(r!=null)h2.push({k:ep+'|'+(ne+1),g:l.graine,r});}
      const v=vu.get(id)||{h1:false,h2:false,complet:false};
      if(h1.length)v.h1=true;if(h2.length)v.h2=true;
      if(h1.length>=o.minParMoitie&&h2.length>=o.minParMoitie){
        v.complet=true;resume.enfants++;
        enfants.push({id,epoque:ep,ne,origine:info.origine||'inconnue',phase:phaseDe.get(ne)||null,d1:h1,d2:h2,x:moy(h1.map(z=>z.r)),y:moy(h2.map(z=>z.r))});}
      vu.set(id,v);}
  }
  for(const v of vu.values())if(!v.complet&&v.h1&&v.h2)coupes++;
  return {enfants,epoques,coupes,sansGeneration,temoins,R};}

/* ===== L'ESTIMATION : r, τ, et leur intervalle par re-echantillonnage (enfants ET graines de chaque generation) =====
   DANS LA GENERATION (ce qui decide) : chaque moitie est centree sur la moyenne des enfants nes la meme generation (meme epoque), puis la
   covariance est groupee sur les generations (ddl = Σ (enfants − 1)). Pourquoi : le modele pilote + graine fixe le niveau des graines de chaque
   generation par les pilotes qui en chevauchent deux ; ce niveau derive d'une generation a l'autre comme une marche au hasard (verifie : a τ = 0,
   sans centrage, r ≈ 0,15 a 0,26 et 22 « victoires » sur 30 mondes fabriques ; centre, r ≈ −0,04). Les deux moities d'un enfant tombent sur
   deux generations voisines, donc sur presque le meme cran : c'est le bruit de la reference commune (le piege d'effets/), sous une autre forme.
   Centrer dans la generation l'efface, au prix d'un enfant par generation (requis : 191 enfants a λ = 6 au lieu de 160).
   Re-echantillonnage : dans chaque generation, ses enfants (avec remise) ; pour chaque generation de graines, ses graines (le meme tirage pour
   tous les enfants qui les ont jouees). */
function groupes(E){const G=new Map();for(const e of E){const k=e.epoque+'|'+e.ne;if(!G.has(k))G.set(k,[]);G.get(k).push(e);}return [...G.values()];}
/* covariance groupee de couples [x, y] rangés par generation ; null sous 3 degres de liberte */
function covGroupee(P){
  let sxy=0,sxx=0,syy=0,ddl=0,n=0;
  for(const L of P){if(L.length<2)continue;let mx=0,my=0;for(const [x,y] of L){mx+=x;my+=y;}mx/=L.length;my/=L.length;
    for(const [x,y] of L){sxy+=(x-mx)*(y-my);sxx+=(x-mx)**2;syy+=(y-my)**2;}ddl+=L.length-1;n+=L.length;}
  if(ddl<3)return {enfants:n,ddl,cov:null,r:null};
  return {enfants:n,ddl,cov:sxy/ddl,r:sxx>0&&syy>0?sxy/Math.sqrt(sxx*syy):null};}
function estimer(E,o,graineTirages){
  const GR=groupes(E),base=covGroupee(GR.map(L=>L.map(e=>[e.x,e.y])));
  const out={enfants:E.length,enfantsCentres:base.enfants,ddl:base.ddl,r:base.r,cov:base.cov,tau:base.cov==null?null:racine(base.cov),
    seuilR:base.ddl>3?Math.tanh(Z_A/Math.sqrt(base.ddl-2)):null,icR:null,icTau:null,tirages:0};
  out.significatif=out.r!=null&&out.seuilR!=null&&out.r>out.seuilR;
  const T=o.tirages|0;
  if(T>0&&base.ddl>=4){
    const Rg=mulberry32(graineTirages==null?161:graineTirages);
    /* les graines de chaque generation (cle epoque|generation), vues chez les enfants */
    const grainesDe=new Map();
    for(const e of E)for(const z of e.d1.concat(e.d2)){if(!grainesDe.has(z.k))grainesDe.set(z.k,new Set());grainesDe.get(z.k).add(z.g);}
    const listes=[...grainesDe].map(([k,S])=>[k,[...S]]);
    const vr=[],vt=[];
    for(let t=0;t<T;t++){
      const mult=new Map();
      for(const [k,G] of listes){const M=new Map();for(let i=0;i<G.length;i++){const g=G[Math.floor(Rg()*G.length)];M.set(g,(M.get(g)||0)+1);}mult.set(k,M);}
      const moyT=(h)=>{let s=0,w=0;for(const z of h){const c=mult.get(z.k).get(z.g)||0;s+=c*z.r;w+=c;}return w?s/w:null;};
      const P=[];
      for(const L of GR){if(L.length<2)continue;const Q=[];
        for(let i=0;i<L.length;i++){const e=L[Math.floor(Rg()*L.length)],x=moyT(e.d1),y=moyT(e.d2);if(x!=null&&y!=null)Q.push([x,y]);}
        P.push(Q);}
      const c=covGroupee(P);if(c.cov==null)continue;
      vt.push(racine(c.cov));if(c.r!=null)vr.push(c.r);}
    out.tirages=vt.length;
    if(vt.length){out.icTau=[quantile(vt,.025),quantile(vt,.975)];}
    if(vr.length){out.icR=[quantile(vr,.025),quantile(vr,.975)];}
  }
  return out;}

/* la comparaison « toutes generations confondues » (sans centrage) : biaisee vers le haut par la derive du modele, elle ne decide RIEN ;
   rendue pour qu'on voie l'ecart (et pour les 19 mutants g0 du 27/11, tous nes la meme generation, elle est identique) */
function estimerSansCentrage(E){
  const c=covCorr(E.map(e=>e.x),E.map(e=>e.y));
  return {enfants:E.length,r:c.r,cov:c.cov,tau:c.cov==null?null:racine(c.cov)};}

/* ===== M4 : LES COURSES JOUEES POUR RIEN (identiques a celles d'un parent sur la meme graine) ===== */
function clones(D,M){
  const {R,temoins}=M;
  /* toutes les courses d'entrainement mesurees, par (epoque, id, graine) : la derniere ecrite */
  const L=new Map();let totalLignes=0,totalMs=0,msConnu=0;
  for(const l of D.courses){
    if(!l||l.usage!=='entrainement')continue;
    totalLignes++;if(nombre(l.ms)){totalMs+=l.ms;msConnu++;}
    if(l.mesuree!==true||!nombre(l.graine)||l.id==null)continue;
    L.set(l.epoque+'|'+l.id+'|'+l.graine,l);}
  const par=new Map();for(const l of L.values()){const id=String(l.id);if(!par.has(id))par.set(id,[]);par.get(id).push(l);}
  const out={coursesEntrainement:totalLignes,heuresEntrainement:totalMs/3.6e6,tempsConnu:totalLignes?msConnu/totalLignes:0,
    enfantsCompares:0,comparees:0,identiques:0,heuresIdentiques:0,heuresComparees:0,nulsExacts:[],parOrigine:{}};
  for(const [id,Li] of par){
    if(temoins.has(id))continue;
    const info=R.get(id);if(!info||!info.parents||!info.parents.length)continue;
    let c=0,k=0,msI=0,msC=0;
    for(const l of Li){
      let vuParent=false,meme=false;
      for(const p of info.parents){const q=L.get(l.epoque+'|'+p+'|'+l.graine);if(!q)continue;vuParent=true;
        if(l.empreinte&&q.empreinte&&l.empreinte===q.empreinte)meme=true;}
      if(!vuParent)continue;
      c++;if(nombre(l.ms))msC+=l.ms;
      if(meme){k++;if(nombre(l.ms))msI+=l.ms;}}
    if(!c)continue;
    out.enfantsCompares++;out.comparees+=c;out.identiques+=k;out.heuresIdentiques+=msI/3.6e6;out.heuresComparees+=msC/3.6e6;
    if(k===c&&c>=3)out.nulsExacts.push(id);
    const o=info.origine||'inconnue',g=out.parOrigine[o]||(out.parOrigine[o]={enfants:0,comparees:0,identiques:0,nulsExacts:0});
    g.enfants++;g.comparees+=c;g.identiques+=k;if(k===c&&c>=3)g.nulsExacts++;}
  out.part=out.comparees?out.identiques/out.comparees:null;
  out.partTempsEntrainement=out.heuresEntrainement>0?out.heuresIdentiques/out.heuresEntrainement:null;
  return out;}

/* ===== LA PHRASE EN CLAIR ===== */
function phraseDe(x){
  if(x.verdict==='comptent')return 'les mutations comptent : un enfant garde son rang d\'une génération à l\'autre';
  if(x.verdict==='ne-comptent-pas')return 'les mutations ne semblent pas compter : la sélection trie surtout du hasard';
  const req=nombre(x.enfants.requis)?String(x.enfants.requis):'∞';
  return 'trop tôt pour le dire ('+x.enfants.mesures+' enfant'+(x.enfants.mesures>1?'s':'')+' mesuré'+(x.enfants.mesures>1?'s':'')+' sur '+req+')';}

/* ===== L'ANALYSE (pure : sur des journaux deja lus) ===== */
/* par origine ou par phase : les moities deja centrees sur TOUTE leur generation (un immigre est seul de son origine dans sa generation : on ne
   peut pas le centrer sur ses pareils) ; chaque enfant compte pour 1 − 1/k degre de liberte (k les enfants de sa generation) ; re-echantillonnage
   des enfants seulement. Indicatif : ne decide rien. */
function estimerGroupe(L,T,graine){
  const val=Z=>{let sxy=0,sxx=0,syy=0,ddl=0;for(const e of Z){sxy+=e.xc*e.yc;sxx+=e.xc*e.xc;syy+=e.yc*e.yc;ddl+=1-1/e.k;}
    return {cov:ddl>0?sxy/ddl:null,r:sxx>0&&syy>0?sxy/Math.sqrt(sxx*syy):null,ddl};};
  const b=val(L),out={enfants:L.length,assez:true,ddl:b.ddl,r:b.r,tau:b.cov==null?null:racine(b.cov),icTau:null};
  if(T>0){const R=mulberry32(graine),v=[];for(let t=0;t<T;t++){const Z=[];for(let i=0;i<L.length;i++)Z.push(L[Math.floor(R()*L.length)]);const c=val(Z);if(c.cov!=null)v.push(racine(c.cov));}
    if(v.length)out.icTau=[quantile(v,.025),quantile(v,.975)];}
  return out;}

function analyser(D,o){
  o=Object.assign({tirages:1000,graine:161,tauVise:TAU_VISE,nNominal:12,lambda:6,minParMoitie:MIN_PAR_MOITIE,passes:10,sigma:null},o||{});
  const note=o.note||require('./note');
  const M=moities(D,o,note),E=M.enfants;
  const est=estimer(E,o,o.graine);
  /* le hasard d'une course pour compter les enfants requis : celui de l'epoque s'il est bien mesure (200 degres de liberte), sinon 3,26 */
  let sigma=o.sigma,sourceSigma='donne';
  if(!nombre(sigma)){const ep=M.epoques.filter(e=>nombre(e.sigmaRes)&&e.ddl>=200).sort((a,b)=>b.ddl-a.ddl)[0];
    if(ep){sigma=ep.sigmaRes;sourceSigma='epoque '+ep.courses+' ('+ep.ddl+' degres de liberte)';}else{sigma=SIGMA_ETUDE;sourceSigma='etude effets/ (3,26)';}}
  /* (28/11/2026, le relecteur : « jamais de conclusion avant le nombre requis ») le hasard qui compte les enfants requis ne descend jamais sous
     celui de l'etude (3,26) : un etat fabrique par le faux pilote des tests (essais/tests-generation/a6-longues, paliers sans hasard : 0,00
     mesure sur 207 degres de liberte) faisait tomber le nombre requis a 4 et l'outil concluait « comptent » sur 7 enfants. Plus de hasard
     mesure (3,4 par exemple) demande plus d'enfants ; moins n'en demande jamais moins que la synthese. */
  const sigmaRequis=Math.max(sigma,SIGMA_ETUDE);
  const n1=E.length?mediane(E.map(e=>e.d1.length)):o.nNominal,n2=E.length?mediane(E.map(e=>e.d2.length)):o.nNominal;
  /* les enfants requis : la table de la synthese (m pour une correlation simple), plus un enfant par generation perdu au centrage :
     ddl requis = m − 1 ; enfants requis = ddl × λ / (λ − 1) ; 160 → 191 a λ = 6. λ et non la taille observee des generations : les 19 mutants
     g0, tous nes a la generation 0, feraient bouger le nombre requis d'un etat a l'autre. Le verdict veut les deux : ddl et enfants. */
  const k=o.lambda>=2?o.lambda:6;
  const brut=enfantsRequis(o.tauVise,n1,n2,sigmaRequis),ddlRequis=nombre(brut)?brut-1:Infinity;
  const requis=nombre(ddlRequis)?Math.ceil(ddlRequis*k/(k-1)-1e-9):Infinity;
  const requisDe=t=>{const m=enfantsRequis(t,n1,n2,sigmaRequis);return nombre(m)?Math.ceil((m-1)*k/(k-1)-1e-9):null;};
  /* (28/11/2026, le relecteur) les enfants renvoyes a la fin de leur generation de naissance (protectionGenerations 0, ou un etat ecrit par une
     regle qui le permettait) n'ont pas de seconde moitie : ils sortent de la mesure, et les restants sont choisis sur leur premiere moitie.
     Une selection sur x retrecit la covariance : τ sort trop bas. On le compte et on le dit (defauts), sans corriger. */
  let renvoyesTot=0;
  for(const m of D.morts)if(m&&m.raison==='renvoi'&&nombre(m.ne)&&m.mort===m.ne&&m.origine!=='temoin')renvoyesTot++;
  const avis=[];if(renvoyesTot)avis.push(renvoyesTot+' enfant(s) renvoye(s) des leur generation de naissance, avant leur seconde moitie : les restants sont choisis sur leur premiere moitie, τ peut sortir trop bas');
  /* les moities centrees sur toute leur generation, pour les groupes */
  for(const L of groupes(E)){const mx=moy(L.map(e=>e.x)),my=moy(L.map(e=>e.y));for(const e of L){e.k=L.length;e.xc=e.x-mx;e.yc=e.y-my;}}
  const groupe=(cle)=>{const G={};for(const e of E){if(e.k<2)continue;const c=e[cle]==null?'inconnue':e[cle];(G[c]||(G[c]=[])).push(e);}
    const r={};for(const [c,L] of Object.entries(G)){
      if(L.length<MIN_GROUPE){r[c]={enfants:L.length,assez:false};continue;}
      r[c]=estimerGroupe(L,Math.max(0,Math.floor(o.tirages/4)),o.graine+c.length);}
    return r;};
  const assez=nombre(requis)&&E.length>=requis&&est.ddl>=ddlRequis&&est.r!=null;
  const verdict=!assez?'trop-tot':(est.significatif?'comptent':'ne-comptent-pas');
  const x={format:FORMAT,verdict,phrase:'',
    enfants:{mesures:E.length,requis:nombre(requis)?requis:null,ddl:est.ddl,ddlRequis:nombre(ddlRequis)?ddlRequis:null,parGeneration:k,
      tauVise:o.tauVise,grainesParMoitie:[n1,n2],sigma,sigmaRequis,sourceSigma,coupesParEpoque:M.coupes,sansGeneration:M.sansGeneration,renvoyesAvantSecondeMoitie:renvoyesTot},
    r:est.r,seuilR:est.seuilR,icR:est.icR,tau:est.tau,tau2:est.cov,icTau:est.icTau,tirages:est.tirages,significatif:est.significatif,
    sansCentrage:estimerSansCentrage(E),
    parOrigine:groupe('origine'),parPhase:groupe('phase'),
    requisPour:{'0.3':requisDe(0.3),'0.5':nombre(requis)?requis:null,'0.7':requisDe(0.7),'1':requisDe(1)},
    epoques:M.epoques,clones:clones(D,M),defauts:(D.defauts||[]).concat(avis)};
  x.phrase=phraseDe(x);
  return x;}

/* ===== LE POINT D'ENTREE QUI NE LEVE JAMAIS (pour le tableau, le recit, etat.js) =====
   dossier : le dossier d'etat ; o : {tirages, nNominal (cfg.grainesParGeneration), passes (cfg.note.passes)}. Toute erreur inattendue → « trop tot ». */
function mesurer(dossier,o){
  try{const D=lireEtat(dossier);const x=analyser(D,o);x.dossier=dossier;return x;}
  catch(e){
    const n=(o&&o.nNominal)||12,l=(o&&o.lambda>=2)?o.lambda:6,req=Math.ceil((enfantsRequis(TAU_VISE,n,n,SIGMA_ETUDE)-1)*l/(l-1)-1e-9);
    const x={format:FORMAT,verdict:'trop-tot',phrase:'',dossier,enfants:{mesures:0,requis:req,tauVise:TAU_VISE},r:null,tau:null,icTau:null,
      clones:null,defauts:['mesure impossible : '+String(e&&e.message||e)]};
    x.phrase=phraseDe(x);return x;}}

/* les reglages tires d'une config (cfg complet) */
function optionsDe(cfg,o){
  o=Object.assign({},o||{});
  if(cfg){if(o.nNominal==null&&nombre(cfg.grainesParGeneration))o.nNominal=cfg.grainesParGeneration;
    if(o.lambda==null&&nombre(cfg.lambda))o.lambda=cfg.lambda;
    if(o.passes==null&&cfg.note&&nombre(cfg.note.passes))o.passes=cfg.note.passes;}
  return o;}

/* ===== LE TEXTE (ligne de commande, resume, tableau) ===== */
const ic=(I,d)=>I?' ['+fr(I[0],d)+' ; '+fr(I[1],d)+']':'';
function lignes(x){
  const L=[];
  L.push('LES MUTATIONS COMPTENT-ELLES ? '+x.phrase+'.');
  const e=x.enfants||{};
  L.push('enfants mesures (deux moities) : '+e.mesures+(e.requis!=null?' ; requis pour voir τ = '+fr(e.tauVise,1)+' : '+e.requis:'')+
    (e.grainesParMoitie?' (graines par moitie '+e.grainesParMoitie.join(' / ')+', '+fr(e.parGeneration,1)+' enfants par generation, hasard d\'une course '+fr(e.sigma,2)+' : '+e.sourceSigma+(nombre(e.sigmaRequis)&&e.sigmaRequis!==e.sigma?', compte a '+fr(e.sigmaRequis,2)+' au moins':'')+')':''));
  if(x.r!=null)L.push('correlation moitie contre moitie, dans la generation : r = '+fr(x.r,2)+ic(x.icR,2)+' (seuil '+fr(x.seuilR,2)+', '+e.ddl+' degres de liberte) ; τ ≈ '+fr(x.tau,2)+' palier'+ic(x.icTau,2)+
    (x.tirages?' ('+x.tirages+' tirages)':''));
  const sc=x.sansCentrage;if(sc&&sc.r!=null)L.push('(sans centrer sur la generation, biaise vers le haut, ne decide rien : r = '+fr(sc.r,2)+', τ ≈ '+fr(sc.tau,2)+')');
  for(const [nom,G] of [['par origine',x.parOrigine],['par phase',x.parPhase]]){
    if(!G||!Object.keys(G).length)continue;
    L.push(nom+' : '+Object.entries(G).map(([k,v])=>k+' '+v.enfants+(v.assez?' (r '+fr(v.r,2)+', τ '+fr(v.tau,2)+ic(v.icTau,2)+')':'')).join(' ; '));}
  if(e.coupesParEpoque)L.push('enfants coupes par un changement d\'epoque (non comptes) : '+e.coupesParEpoque);
  const c=x.clones;
  if(c&&c.comparees)L.push('courses pour rien (identiques a celles d\'un parent sur la meme graine) : '+c.identiques+' sur '+c.comparees+' comparees ('+fr(100*c.part,1)+' %), '+
    fr(c.heuresIdentiques,2)+' h'+(c.partTempsEntrainement!=null?' sur '+fr(c.heuresEntrainement,1)+' h d\'entrainement ('+fr(100*c.partTempsEntrainement,1)+' %)':'')+
    ' ; enfants copies exactes de leur parent : '+c.nulsExacts.length+' sur '+c.enfantsCompares);
  else if(c)L.push('courses pour rien : aucun enfant n\'a encore couru les memes graines que son parent');
  for(const d of x.defauts||[])L.push('(lecture) '+d);
  return L;}
/* une ligne pour resume.txt / le tableau */
function ligneCourte(x){
  return 'mutations : '+x.phrase+(x.r!=null?' ; r '+fr(x.r,2)+', τ ≈ '+fr(x.tau,2)+ic(x.icTau,2):'')+
    (x.clones&&x.clones.comparees?' ; courses pour rien '+fr(100*x.clones.part,0)+' %':'');}

module.exports={FORMAT,SIGMA_ETUDE,TAU_VISE,mesurer,analyser,lireEtat,optionsDe,enfantsRequis,rAttendu,phraseDe,lignes,ligneCourte,mulberry32,
  _interne:{moities,estimer,estimerSansCentrage,estimerGroupe,clones,registre,covCorr,covGroupee}};

/* ===== LIGNE DE COMMANDE ===== */
if(require.main===module){
  const A=process.argv.slice(2),opt=(n,d)=>{const i=A.indexOf('--'+n);return i>=0&&A[i+1]!=null?A[i+1]:d;};
  let cfg=null,dossier=null;const avis=[];
  try{cfg=require('./commun').lireConfig(opt('config',undefined));}catch(e){avis.push('config illisible, reglages par defaut : '+e.message);}
  const etat=opt('etat',null);
  if(etat){const a=path.resolve(process.cwd(),etat),b=path.resolve(__dirname,etat);dossier=fs.existsSync(a)?a:b;}
  else dossier=cfg?path.resolve(__dirname,cfg.dossierEtat||'etat'):path.join(__dirname,'etat');
  const o=optionsDe(cfg,{});const t=opt('tirages',null);if(t!=null&&nombre(+t))o.tirages=+t;
  const t0=Date.now(),x=mesurer(dossier,o);
  for(const a of avis)x.defauts.push(a);
  if(A.includes('--json'))process.stdout.write(JSON.stringify(x,null,1)+'\n');
  else{process.stdout.write('etat : '+dossier+'\n'+lignes(x).join('\n')+'\n('+((Date.now()-t0)/1000).toFixed(1)+' s, aucune course jouee, rien ecrit)\n');}
  process.exit(0);
}
