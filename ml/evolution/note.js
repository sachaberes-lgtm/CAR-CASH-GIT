/* ===== LA NOTE DE LA SELECTION NATURELLE (27/11/2026, Sacha : « le moins bon est vire a chaque generation » ; l'etude du bruit :
   « le lot 930000 est plus dur de ~1 palier median que le 910000 : un bot ne doit jamais etre juge sur des graines plus faciles qu'un autre ») =====
   Contrat : ml/evolution/INTERFACES.md § 2.6 (il fait foi). Specification : SPECIFICATION.md § 6 et § 7.6.
   - LE PALIER : palier(p,g) = a_p + b_g + bruit, ajuste par moindres carres alternes (a d'abord, b ensuite, b centre a chaque passe) ;
     retrecissement â_p = (a_p − ā)·n_p/(n_p + 12) + ā ; erreur-type se_a = σ_res/√n_p. La survie, meme modele, ne sert qu'a departager.
   - L'ECART « DANS LA FOULE » : E = Σ w_k max(0, min(8,|z_k|) − 1) / Σ w_k sur toutes les parties de plus de 60 s du pilote (zone morte d'un
     ecart-type des joueurs, poids 0,5 pour les quatre mesures peu fiables) ; moins de 5 parties : E = 4 ; se_E par bootstrap des parties.
     L'ecart classique (ressemblance.ecart, le 1,67 historique) est rendu pour comparaison, il ne decide rien.
   - LA NOTE : F = â − 4·E ; se_F = √(se_a² + 16·se_E²).
   - LA VALIDATION : bootstrap APPARIE par graine (les memes graines tirees pour les deux pilotes) de ΔF, Δpalier, ΔE.
   Toutes les fonctions sont pures : aucune ne lit ni n'ecrit de fichier, sauf referenceEpoque (l'etalon des joueurs) et la ligne de commande.
   Le hasard des bootstraps vient de graines.rngDe (jamais de l'etat du maitre, jamais Math.random) : une reprise redonne la meme note. */
'use strict';
const path=require('path');
const Gr=require('./graines');
let RESSEMBLANCE=null;
function ressemblance(){return RESSEMBLANCE||(RESSEMBLANCE=require(path.join(__dirname,'..','bot','ressemblance.js')));}

/* ===== OUTILS ===== */
const moy=A=>{let s=0;for(const x of A)s+=x;return A.length?s/A.length:NaN;};
/* ecart-type d'echantillon (n − 1) ; 0 sous deux valeurs */
const etype=A=>{const n=A.length;if(n<2)return 0;const m=moy(A);let s=0;for(const x of A)s+=(x-m)*(x-m);return Math.sqrt(s/(n-1));};
const nombre=x=>typeof x==='number'&&x===x&&isFinite(x);
/* les parametres de note : on accepte cfg (complet) ou cfg.note */
const cfgNoteDe=c=>{if(!c)throw new Error('note : parametres de note absents (cfg.note)');return c.note&&typeof c.note==='object'?c.note:c;};
/* une ligne compte si elle est mesuree, a un palier et une graine, et que sa graine n'est pas retiree */
function utiles(lignes,exclure){
  const X=exclure instanceof Set?exclure:new Set(exclure||[]);
  return (lignes||[]).filter(l=>l&&l.mesuree===true&&nombre(l.palier)&&nombre(l.graine)&&l.id!=null&&!X.has(l.graine));}

/* ===== POURQUOI UNE COURSE N'ENTRE PAS DANS LA NOTE (recopie de ml/bot/noter.js, plus le hasard des yeux, node et le chargement) ===== */
function pourquoiEcartee(res,ep){
  if(!res)return 'aucun resultat';
  const E=ep&&ep.composants?ep.composants:(ep||{});
  if(res.erreurFatale)return 'chargement : '+res.erreurFatale;
  /* (2026-11-27, le correcteur) l'enfant dit quels fichiers du bot il a charges : une course jouee avec d'autres que ceux de l'epoque est ecartee */
  if(res.fichiers_sha&&E.fichiers_sha&&res.fichiers_sha!==E.fichiers_sha)return `jouee avec d'autres fichiers du bot (yeux, main, modele… ${res.fichiers_sha}, l'epoque a ${E.fichiers_sha})`;
  if(res.pannes>0||res.cause==='panne')return `${res.pannes} decision(s) coupee(s) par la limite de temps${res.cause==='panne'?', course abandonnee':''} : pas repetable`;
  if(!res.jeu_sha)return 'le jeu a ete reecrit pendant son chargement (empreinte instable)';
  if(res.simulateur!==E.simulateur)return `jouee dans un autre simulateur (${res.simulateur}, l'epoque est dans ${E.simulateur})`;
  if(res.jeu_sha!==E.jeu_sha||res.jeu!==E.version)return `jouee sur un autre jeu (${res.jeu} ${res.jeu_sha}, l'epoque est sur ${E.version} ${E.jeu_sha})`;
  if(res.yeuxTirages!==0)return res.yeuxTirages==null?'hasard des yeux non mesure (yeuxTirages absent)':`les yeux ont tire au hasard (${res.yeuxTirages} tirage(s)) : pas repetable`;
  if(res.node!==E.node)return `jouee sous un autre node (${res.node}, l'epoque est sous ${E.node})`;
  return null;}

/* ===== LA REFERENCE DES JOUEURS (une fois par epoque) ===== */
/* o.recharger (2026-11-27, le correcteur ; relecture « la reference ne se recalcule pas quand l'etalon change ») : ressemblance.js garde l'etalon
   dans le module ; on le retire du cache de require pour relire ml/bot/etalon/. evoluer.js le passe quand l'epoque des notes change. */
function referenceEpoque(o){
  if(o&&o.recharger){
    try{delete require.cache[require.resolve(path.join(__dirname,'..','bot','ressemblance.js'))];}catch(e){}
    RESSEMBLANCE=null;}
  const R=ressemblance();return R.reference(R.joueurs('clavier'));}

/* ===== LE MODELE PILOTE + GRAINE (moindres carres alternes) =====
   val : la valeur de la ligne (palier ou survie). Au centrage de b, la constante retiree aux b est rendue aux a : l'ajustement (a_p + b_g) ne
   change pas, et les a de la derniere passe restent coherents avec les b centres. */
function moindresCarres(L,val,passes){
  const V=L.filter(l=>nombre(val(l)));
  const ids=[],graines=[],ia=new Map(),ig=new Map();
  for(const l of V){if(!ia.has(l.id)){ia.set(l.id,ids.length);ids.push(l.id);}if(!ig.has(l.graine)){ig.set(l.graine,graines.length);graines.push(l.graine);}}
  const P=ids.length,G=graines.length,a=new Float64Array(P),b=new Float64Array(G),n=new Float64Array(P),m=new Float64Array(G);
  const ip=V.map(l=>ia.get(l.id)),jg=V.map(l=>ig.get(l.graine)),y=V.map(val);
  for(let k=0;k<V.length;k++){n[ip[k]]++;m[jg[k]]++;}
  const sa=new Float64Array(P),sb=new Float64Array(G);
  for(let t=0;t<Math.max(1,passes|0);t++){
    sa.fill(0);for(let k=0;k<V.length;k++)sa[ip[k]]+=y[k]-b[jg[k]];for(let p=0;p<P;p++)a[p]=sa[p]/n[p];
    sb.fill(0);for(let k=0;k<V.length;k++)sb[jg[k]]+=y[k]-a[ip[k]];for(let g=0;g<G;g++)b[g]=sb[g]/m[g];
    let c=0;for(let g=0;g<G;g++)c+=b[g];c=G?c/G:0;for(let g=0;g<G;g++)b[g]-=c;for(let p=0;p<P;p++)a[p]+=c;}
  let ssr=0;for(let k=0;k<V.length;k++){const r=y[k]-a[ip[k]]-b[jg[k]];ssr+=r*r;}
  /* les degres de liberte d'un modele additif pilote + graine : N − P − G + 1 (l'analyse de variance de l'etude du bruit) */
  const ddl=V.length-P-G+1,sigmaRes=V.length?Math.sqrt(ssr/Math.max(1,ddl)):0;
  const A={},B={},N={};for(let p=0;p<P;p++){A[ids[p]]=a[p];N[ids[p]]=n[p];}for(let g=0;g<G;g++)B[graines[g]]=b[g];
  return {a:A,b:B,n:N,sigmaRes,ids,graines,N:V.length,ddl};}

function ajuster(lignes,o){
  o=o||{};const passes=o.passes==null?10:o.passes,k=o.retrecir==null?12:o.retrecir;
  const L=utiles(lignes,o.exclure);
  const M=moindresCarres(L,l=>l.palier,passes),S=moindresCarres(L,l=>l.survie_s,passes);
  /* (2026-11-27, le correcteur ; relecture statistique « le retrecissement tire vers ā calcule morts compris ») : o.ids = les VIVANTS ;
     ā est la moyenne de leurs a (ceux qui ont au moins une course). Les vires sont surtout les malchanceux du bruit : les compter tirait ā
     sous la moyenne des vivants et penalisait les nouveau-nes. Sans o.ids (ou aucun vivant mesure) : tous les pilotes, comme avant. */
  const vivantsMesures=o.ids?o.ids.filter(i=>M.n[i]>0):[];
  const pourAbar=vivantsMesures.length?vivantsMesures:M.ids;
  const abar=pourAbar.length?moy(pourAbar.map(i=>M.a[i])):NaN;
  const ahat={},se={};
  for(const i of M.ids){const n=M.n[i];ahat[i]=(M.a[i]-abar)*n/(n+k)+abar;se[i]=M.sigmaRes/Math.sqrt(n);}
  return {a:M.a,ahat,b:M.b,n:M.n,se,abar,sigmaRes:M.sigmaRes,survie:{a:S.a,b:S.b}};}

/* ===== L'ECART « DANS LA FOULE » ===== */
function poidsDe(cn,cle){const P=cn.poidsMesures||{};return P[cle]==null?1:P[cle];}
/* E d'un lot de mesures, sans bootstrap */
function eSimple(M,REF,cn){
  const borne=cn.borneZ==null?8:cn.borneZ,zm=cn.zoneMorte==null?1:cn.zoneMorte,pire=cn.ePire==null?4:cn.ePire,min=cn.partiesMin==null?5:cn.partiesMin;
  const r=M.length?ressemblance().ecart(null,{mesures:M,reference:REF}):null;
  const z={};let s=0,w=0;
  if(r)for(const x of r.mesures){z[x.cle]=x.z;const wk=poidsDe(cn,x.cle);s+=wk*Math.max(0,Math.min(borne,Math.abs(x.z))-zm);w+=wk;}
  /* (2026-11-27, le correcteur ; relecture statistique « une mesure absente sort de E ») : une mesure que la reference des joueurs connait mais
     qu'aucune partie du pilote ne donne (moins de 3 vols, de 10 allers…) compte au PIRE e_k (borneZ − zoneMorte), avec son poids : un genome ne
     peut plus faire baisser son E en faisant disparaitre une mesure. Elle est rendue dans z avec la valeur null. */
  if(r&&REF)for(const k of Object.keys(REF)){if(!REF[k]||k in z)continue;const wk=poidsDe(cn,k);s+=wk*Math.max(0,borne-zm);w+=wk;z[k]=null;}
  const parties=M.length;
  const E=(parties<min||!r||!(w>0))?pire:s/w;
  return {E,z,ecartClassique:r?r.ecart:null,parties};}

function ecartFoule(mesures,REF,cfgNote,rng){
  const cn=cfgNoteDe(cfgNote),M=(mesures||[]).filter(Boolean),min=cn.partiesMin==null?5:cn.partiesMin;
  if(!REF)throw new Error('note : reference des joueurs absente (REF)');
  const base=eSimple(M,REF,cn);
  let seE=0;
  if(M.length>=min&&base.ecartClassique!=null){
    const R=rng||Gr.rngDe('E'),T=cn.bootstrapE==null?200:cn.bootstrapE,v=[];
    for(let t=0;t<T;t++){const X=new Array(M.length);for(let i=0;i<M.length;i++)X[i]=M[R.entier(M.length)];v.push(eSimple(X,REF,cn).E);}
    seE=etype(v);}
  return {E:base.E,seE,ecartClassique:base.ecartClassique,z:base.z,parties:base.parties};}

/* ===== LA NOTE DE TOUS ===== */
function noter(lignes,o){
  o=o||{};const cn=cfgNoteDe(o.cfg),REF=o.REF;if(!REF)throw new Error('note : reference des joueurs absente (o.REF)');
  const L=utiles(lignes,o.exclure);
  const fit=ajuster(L,{passes:cn.passes,retrecir:cn.retrecir,ids:o.ids});
  const parId=new Map();for(const l of L){if(!parId.has(l.id))parId.set(l.id,[]);parId.get(l.id).push(l);}
  const ids=o.ids||[...parId.keys()],pe=cn.poidsEcart==null?4:cn.poidsEcart,par={};
  for(const id of ids){
    const Li=parId.get(id)||[],n=Li.length;
    const ef=ecartFoule(Li.map(l=>l.mesures),REF,cn,Gr.rngDe(id+'|'+n));
    /* un id sans course dans l'epoque : ramene a la moyenne, sans erreur-type (null) */
    const a=n?fit.a[id]:null,ahat=n?fit.ahat[id]:fit.abar,se_a=n?fit.se[id]:null;
    const F=ahat-pe*ef.E,se_F=se_a==null?null:Math.sqrt(se_a*se_a+pe*pe*ef.seE*ef.seE);
    par[id]={id,n,a,ahat,se_a,survie:n?fit.survie.a[id]:null,E:ef.E,se_E:ef.seE,F,se_F,ecartClassique:ef.ecartClassique,parties:ef.parties};}
  return {par,b:fit.b,sigmaRes:fit.sigmaRes,abar:fit.abar};}

/* ===== LA VALIDATION : bootstrap apparie par graine =====
   Sur les graines mesurees CHEZ LES DEUX (si une graine a plusieurs lignes mesurees, la derniere compte). */
function parGraine(lignes){const M=new Map();for(const l of utiles(lignes))M.set(l.graine,l);return M;}
function comparer(lignesA,lignesB,o){
  o=o||{};const cn=cfgNoteDe(o.cfg),REF=o.REF;if(!REF)throw new Error('note : reference des joueurs absente (o.REF)');
  const pe=cn.poidsEcart==null?4:cn.poidsEcart;
  const T=o.tirages!=null?o.tirages:(o.cfg&&o.cfg.validation&&o.cfg.validation.bootstrap!=null?o.cfg.validation.bootstrap:400);
  const MA=parGraine(lignesA),MB=parGraine(lignesB),G=[...MA.keys()].filter(g=>MB.has(g)),n=G.length;
  if(!n)return {graines:0,dF:null,se_dF:null,dPalier:null,se_dPalier:null,dE:null,se_dE:null,criteres:{a:false,b:false,c:false},sacre:false};
  const pA=G.map(g=>MA.get(g).palier),pB=G.map(g=>MB.get(g).palier),mA=G.map(g=>MA.get(g).mesures||null),mB=G.map(g=>MB.get(g).mesures||null);
  const un=idx=>{let s=0;const XA=[],XB=[];for(const i of idx){s+=pA[i]-pB[i];if(mA[i])XA.push(mA[i]);if(mB[i])XB.push(mB[i]);}
    const dP=s/idx.length,dE=eSimple(XA,REF,cn).E-eSimple(XB,REF,cn).E;return {dP,dE,dF:dP-pe*dE};};
  const tous=[];for(let i=0;i<n;i++)tous.push(i);
  const p=un(tous),R=o.rng||Gr.rngDe('comparer|'+n),vP=[],vE=[],vF=[];
  for(let t=0;t<T;t++){const idx=new Array(n);for(let i=0;i<n;i++)idx[i]=R.entier(n);const x=un(idx);vP.push(x.dP);vE.push(x.dE);vF.push(x.dF);}
  const se_dF=etype(vF),se_dPalier=etype(vP),se_dE=etype(vE);
  /* (2026-11-27, le correcteur ; relecture statistique : avec 1 se, ~18 % de faux sacres quand le meneur ne vaut pas mieux) le seuil du critere (a)
     vient de cfg.validation.seuilSacre (2 par defaut : ~2 a 3 % de faux sacres). Ecart a SPECIFICATION.md § 7.6, dit dans INTERFACES.md § 2.6. */
  const seuil=o.seuilSacre!=null?o.seuilSacre:(o.cfg&&o.cfg.validation&&o.cfg.validation.seuilSacre!=null?o.cfg.validation.seuilSacre:2);
  const criteres={a:p.dF>seuil*se_dF,b:p.dP>-1*se_dPalier,c:p.dE<1*se_dE};
  return {graines:n,dF:p.dF,se_dF,dPalier:p.dP,se_dPalier,dE:p.dE,se_dE,criteres,sacre:criteres.a&&criteres.b&&criteres.c};}

/* ===== LES COURSES DE L'ETUDE DU BRUIT (courses-0.json) -> lignes ===== */
function depuisEtude(tableau){
  const out=[];
  for(const x of tableau||[])for(const c of x.courses||[])
    out.push({pilote:x.sha,id:String(x.sha).slice(0,12),usage:'entrainement',mesuree:true,raison:null,graine:c.graine,tmax:x.tmax,
      palier:c.palier,pieces:c.pieces,survie_s:c.duree_s,cause:c.cause,morts:c.morts_en_vol,vols:c.vols,mesures:c.m||null,
      fichier:x.fichier,lot:x.graines&&x.graines.depart});
  return out;}

module.exports={pourquoiEcartee,referenceEpoque,ajuster,ecartFoule,noter,comparer,depuisEtude};

/* ===== LIGNE DE COMMANDE ===== */
const correl=(A,B)=>{const ma=moy(A),mb=moy(B);let s=0,sa=0,sb=0;for(let i=0;i<A.length;i++){s+=(A[i]-ma)*(B[i]-mb);sa+=(A[i]-ma)**2;sb+=(B[i]-mb)**2;}return s/Math.sqrt(sa*sb);};
/* LES TROIS CONTROLES DE L'ETAPE 3 (rendus, pour la ligne de commande et les tests) */
function controlesEtude(tableau,cfgNote,REF,shaVoltige){
  const cn=cfgNoteDe(cfgNote),L=depuisEtude(tableau);
  /* les pilotes aux deux lots de 300 s ; un doublon (meme pilote, meme lot) : le dernier fichier compte, comme analyser.js */
  const lots=new Map();
  for(const x of tableau)if(x.tmax===300){const k=x.sha;if(!lots.has(k))lots.set(k,{});lots.get(k)[x.graines.depart]=x.fichier;}
  const deux=[...lots.entries()].filter(([,v])=>v[910000]&&v[930000]);
  const garder=new Set();for(const [,v] of deux){garder.add(v[910000]);garder.add(v[930000]);}
  const L300=L.filter(l=>garder.has(l.fichier));
  const r={pilotes:deux.length,courses:L300.length};
  /* (a) le b moyen du lot 930000 contre le lot 910000 */
  const fit=ajuster(L300,{passes:cn.passes,retrecir:cn.retrecir});
  const bs=Object.entries(fit.b).map(([g,b])=>[+g,b]);
  const b1=moy(bs.filter(([g])=>g<930000).map(x=>x[1])),b2=moy(bs.filter(([g])=>g>=930000).map(x=>x[1]));
  r.a={b910000:b1,b930000:b2,diff:b2-b1,sigmaRes:fit.sigmaRes,ok:Math.abs((b2-b1)+0.8)<=0.1};
  /* (b) la fiabilite lot 1 / lot 2 de â (Pearson entre pilotes), contre celle du palier moyen brut */
  const f1=ajuster(L300.filter(l=>l.lot===910000),cn),f2=ajuster(L300.filter(l=>l.lot===930000),cn);
  const ids=Object.keys(f1.ahat).filter(i=>i in f2.ahat);
  const pm=lot=>{const S={},N={};for(const l of L300)if(l.lot===lot){S[l.id]=(S[l.id]||0)+l.palier;N[l.id]=(N[l.id]||0)+1;}return i=>S[i]/N[i];};
  const p1=pm(910000),p2=pm(930000);
  const rA=correl(ids.map(i=>f1.ahat[i]),ids.map(i=>f2.ahat[i])),rP=correl(ids.map(p1),ids.map(p2));
  r.b={r_ahat:rA,r_palierMoyen:rP,pilotes:ids.length,ok:rA>=rP-1e-9&&+rA.toFixed(2)>=0.44};
  /* (c) l'ecart classique de pilote-voltige sur sa grande note de 900 s */
  const t9=tableau.filter(x=>x.tmax===900);
  const v=t9.find(x=>shaVoltige&&x.sha===shaVoltige)||t9.find(x=>x.fichier==='note-voltige4-t900.json');
  if(!v)r.c={ok:false,raison:'grande note de pilote-voltige introuvable'};
  else{const ef=ecartFoule(v.courses.map(c=>c.m),REF,cn,Gr.rngDe('etude|'+v.fichier));
    r.c={fichier:v.fichier,parSha:!!(shaVoltige&&v.sha===shaVoltige),ecartClassique:ef.ecartClassique,E:ef.E,seE:ef.seE,parties:ef.parties,
      ok:ef.ecartClassique!=null&&Math.abs(ef.ecartClassique-1.67)<=0.1};}
  r.ok=r.a.ok&&r.b.ok&&r.c.ok;
  return r;}
module.exports.controlesEtude=controlesEtude;

if(require.main===module){
  const fs=require('fs'),crypto=require('crypto');
  const A=process.argv.slice(2),opt=(n,d)=>{const i=A.indexOf('--'+n);return i>=0?A[i+1]:d;};
  const f3=x=>x==null||x!==x?'   -  ':(x>=0?' ':'')+x.toFixed(3);
  try{
    if(A.includes('--etude')){
      const t0=Date.now(),fichier=opt('etude');
      if(!fichier)throw new Error('note : --etude <courses-0.json> attendu');
      const X=JSON.parse(fs.readFileSync(path.resolve(fichier),'utf8'));
      const cfg=JSON.parse(fs.readFileSync(path.join(__dirname,'config.json'),'utf8'));
      let shaV=null;try{shaV=crypto.createHash('sha1').update(fs.readFileSync(path.join(__dirname,'..','ecurie','pilote-voltige.js'))).digest('hex');}catch(e){}
      const r=controlesEtude(X,cfg.note,referenceEpoque(),shaV);
      console.log(`etude du bruit : ${r.pilotes} pilotes aux deux lots de 300 s, ${r.courses} courses`);
      console.log(`(a) b moyen : lot 910000 ${f3(r.a.b910000)}, lot 930000 ${f3(r.a.b930000)}, difference ${f3(r.a.diff)} (attendu -0,8 ± 0,1) ; sigma des residus ${r.a.sigmaRes.toFixed(2)} : ${r.a.ok?'OK':'ECHEC'}`);
      console.log(`(b) fiabilite lot 1 / lot 2 de â ${r.b.r_ahat.toFixed(4)} (palier moyen brut ${r.b.r_palierMoyen.toFixed(4)}, ${r.b.pilotes} pilotes ; attendu ≥ 0,44) : ${r.b.ok?'OK':'ECHEC'}`);
      console.log(r.c.fichier?`(c) ecart classique de pilote-voltige (${r.c.fichier}${r.c.parSha?', reconnu par son sha':', reconnu par son nom'}) ${r.c.ecartClassique} sur ${r.c.parties} parties (attendu 1,67 ± 0,1) ; E dans la foule ${r.c.E.toFixed(3)} ± ${r.c.seE.toFixed(3)} : ${r.c.ok?'OK':'ECHEC'}`:'(c) '+r.c.raison+' : ECHEC');
      console.log(`${r.ok?'TOUT PASSE':'ECHEC'} (${((Date.now()-t0)/1000).toFixed(1)} s)`);
      process.exit(r.ok?0:1);
    }
    /* la note de l'epoque en cours, sur l'etat (lecture seule) */
    const C=require('./commun'),K=require('./courses');
    const cfg=C.lireConfig(opt('config',undefined)),dossier=C.chemin(cfg,cfg.dossierEtat),ep=K.epoque(cfg);
    const pop=C.lireJson(path.join(dossier,'population.json'),null);
    const exclure=new Set(pop&&pop.grainesRetirees||[]);
    const L=K.lireCourses(dossier).filter(l=>l.usage==='entrainement'&&l.epoque===ep.courses);
    const r=noter(L,{REF:referenceEpoque(),cfg:cfg.note,exclure});
    const T=Object.values(r.par).sort((x,y)=>y.F-x.F||(String(x.id)<String(y.id)?-1:1));
    console.log(`epoque ${ep.courses} (notes ${ep.note}) : ${L.filter(l=>l.mesuree).length} courses mesurees d'entrainement, ${T.length} pilotes, sigma des residus ${r.sigmaRes.toFixed(2)}, ā ${f3(r.abar)}`);
    console.log('id           |    n |      a |      â |   se_a |      E |   se_E |      F |   se_F | classique');
    for(const x of T)console.log(`${x.id.padEnd(12)} | ${String(x.n).padStart(4)} | ${f3(x.a)} | ${f3(x.ahat)} | ${f3(x.se_a)} | ${f3(x.E)} | ${f3(x.se_E)} | ${f3(x.F)} | ${f3(x.se_F)} | ${x.ecartClassique==null?'-':x.ecartClassique}`);
  }catch(e){process.stderr.write(String(e&&e.message||e)+'\n');process.exit(1);}
}
