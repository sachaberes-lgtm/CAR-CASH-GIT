/* ===== LE BANC DES GENES V2 : LES BRAS ET LA VAGUE (28/11/2026, lot « genes v4 ») =====
   Contrat : ml/evolution/notes/genes-v4.md § 6.3 et § 6.4. Pur, sauf la lecture des deux fichiers (bras.json, vague.json).
   - lireCatalogue(fichier)            : banc/bras.json {format:'banc-bras-1', bras:{nom:{dit, genes}}} ;
   - lireVague(dossier)                : vague.json, son texte et son sha1 (le plan.json garde ce sha1 : la vague est figee des la premiere course) ;
   - controlerVague(v, o)              : la vague lue et controlee (numero, nom, question, temoin, tmax, carte, fixes, plan, 1 a 5 bras, criteres) ;
   - fabriquer(vague, catalogue, o)    : le genome, le texte et le shaPilote du temoin (avec les fixes) et de chaque bras.
   Le genome d'un bras = Gn.genomeTemoin(cfg avec temoin), les fixes, puis les ecarts du bras, puis Gn.reparer ; chaque valeur demandee doit
   survivre a reparer ; Gn.valider doit rendre null ; le texte = Gn.ecrirePilote(g, {cfg}) (comme la selection). Toute faute -> ErreurBanc code 1. */
'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const {ErreurBanc,lirePlan,NUMERO_MAX}=require('./plan');
const Cr=require('./criteres');

const sha1=x=>crypto.createHash('sha1').update(x).digest('hex');
const copie=x=>JSON.parse(JSON.stringify(x));
const entier=x=>typeof x==='number'&&x===Math.floor(x)&&isFinite(x);
const NOM_ESSAI='v000-essai';
const BRAS_MAX=5;

function lireJson(fichier,quoi){
  let t;
  try{t=fs.readFileSync(fichier,'utf8');}catch(e){throw new ErreurBanc(quoi+' illisible ('+fichier+') : '+e.message,1);}
  try{return {objet:JSON.parse(t),texte:t};}catch(e){throw new ErreurBanc(quoi+' n\'est pas du JSON ('+fichier+') : '+e.message,1);}}

/* ---------- le catalogue des bras ---------- */
function lireCatalogue(fichier){
  const {objet:B}=lireJson(fichier,'bras.json');
  if(!B||B.format!=='banc-bras-1')throw new ErreurBanc('bras.json : format « banc-bras-1 » attendu ('+fichier+')',1);
  if(!B.bras||typeof B.bras!=='object'||Array.isArray(B.bras))throw new ErreurBanc('bras.json : « bras » doit etre un objet {nom: {dit, genes}}',1);
  for(const [nom,b] of Object.entries(B.bras)){
    if(!b||typeof b!=='object')throw new ErreurBanc('bras.json : le bras « '+nom+' » n\'est pas un objet',1);
    if(typeof b.dit!=='string'||!b.dit)throw new ErreurBanc('bras.json : le bras « '+nom+' » n\'a pas de « dit » (pourquoi ce bras)',1);
    if(!b.genes||typeof b.genes!=='object'||Array.isArray(b.genes))throw new ErreurBanc('bras.json : le bras « '+nom+' » n\'a pas de « genes » {cle: valeur}',1);}
  return B;}

/* ---------- la vague ---------- */
function lireVague(dossier){
  const f=path.join(dossier,'vague.json');
  const {objet,texte}=lireJson(f,'vague.json');
  return {vague:objet,texte,sha:sha1(texte),fichier:f};}

/* o = {cfg, declics, temoins (Gn.TEMOINS)} -> la vague normalisee, et ses avertissements */
function controlerVague(v,o){
  const cfg=o.cfg,avis=[];
  if(!v||typeof v!=='object'||Array.isArray(v))throw new ErreurBanc('vague.json : un objet attendu',1);
  if(v.format!=='banc-vague-1')throw new ErreurBanc('vague.json : format « banc-vague-1 » attendu',1);
  const permises=['format','numero','nom','question','temoin','tmax','carte','fixes','plan','bras'];
  for(const k of Object.keys(v))if(!permises.includes(k))throw new ErreurBanc('vague.json : cle inconnue « '+k+' »',1);
  if(!entier(v.numero)||v.numero<0||v.numero>NUMERO_MAX)throw new ErreurBanc('vague.json : numero '+JSON.stringify(v.numero)+' refuse (un entier de 1 a '+NUMERO_MAX+' ; 0 = l\'essai)',1);
  if(typeof v.nom!=='string'||!/^[a-z0-9][a-z0-9-]*$/.test(v.nom))throw new ErreurBanc('vague.json : nom en minuscules, chiffres et tirets attendu (lu : '+JSON.stringify(v.nom)+')',1);
  if(v.numero===0&&v.nom!==NOM_ESSAI)throw new ErreurBanc('vague.json : le numero 0 est reserve a l\'essai (nom « '+NOM_ESSAI+' »)',1);
  if(v.numero!==0&&v.nom===NOM_ESSAI)throw new ErreurBanc('vague.json : « '+NOM_ESSAI+' » porte le numero 0',1);
  if(typeof v.question!=='string'||!v.question.trim())throw new ErreurBanc('vague.json : la question est obligatoire (on l\'ecrit AVANT de jouer)',1);
  const temoin=v.temoin==null?'c0025':v.temoin;
  if(!o.temoins||!Object.prototype.hasOwnProperty.call(o.temoins,temoin))throw new ErreurBanc('vague.json : temoin inconnu « '+temoin+' » (connus : '+Object.keys(o.temoins||{}).join(', ')+')',1);
  const tmax=v.tmax==null?cfg.tmax:v.tmax;
  if(!(typeof tmax==='number'&&tmax>0&&isFinite(tmax)))throw new ErreurBanc('vague.json : tmax doit etre un nombre > 0 (lu : '+JSON.stringify(v.tmax)+')',1);
  const carte=v.carte==null||v.carte===''?null:v.carte;
  if(carte!=null&&(typeof carte!=='string'||!(cfg.cartesTirage||[]).includes(carte)))
    throw new ErreurBanc('vague.json : carte inconnue « '+carte+' » (cartesTirage : '+(cfg.cartesTirage||[]).join(', ')+')',1);
  const fixes=v.fixes==null?{}:v.fixes;
  if(typeof fixes!=='object'||Array.isArray(fixes))throw new ErreurBanc('vague.json : fixes doit etre un objet {gene: valeur}',1);
  const plan=lirePlan(v.plan);
  if(!Array.isArray(v.bras)||!v.bras.length)throw new ErreurBanc('vague.json : au moins un bras',1);
  if(v.bras.length>BRAS_MAX)throw new ErreurBanc('vague.json : '+v.bras.length+' bras : au plus '+BRAS_MAX+' (la correction de Bonferroni est faite pour 3 a 5)',1);
  if(v.bras.length<3)avis.push('seulement '+v.bras.length+' bras : la correction est faite pour 3 a 5 (elle reste juste, le banc est seulement moins econome)');
  const bras=[],vus=new Set();
  for(const b of v.bras){
    if(!b||typeof b!=='object')throw new ErreurBanc('vague.json : un bras n\'est pas un objet',1);
    for(const k of Object.keys(b))if(k!=='nom'&&k!=='critere')throw new ErreurBanc('vague.json : bras « '+b.nom+' » : cle inconnue « '+k+' »',1);
    if(typeof b.nom!=='string'||!b.nom)throw new ErreurBanc('vague.json : un bras sans nom',1);
    if(b.nom==='temoin')throw new ErreurBanc('vague.json : un bras ne s\'appelle pas « temoin » (le temoin est toujours joue, sous ce nom)',1);
    if(vus.has(b.nom))throw new ErreurBanc('vague.json : le bras « '+b.nom+' » est en double',1);
    vus.add(b.nom);
    bras.push({nom:b.nom,critere:Cr.lireCritere(b.critere,{declics:o.declics,quoi:'vague.json : bras « '+b.nom+' » : critere'})});}
  if(plan.premier===plan.plafond&&bras.length===1)avis.push('une vague de confirmation (un bras, un seul regard) : un « net-aide » ici CONFIRME un candidat d\'une vague precedente');
  return {vague:{numero:v.numero,nom:v.nom,question:v.question.trim(),temoin,tmax,carte,fixes:copie(fixes),plan,bras},avis};}

/* ---------- les genomes ---------- */
/* g modifie de `ecarts` (les genes du catalogue ou les fixes), repare ; chaque valeur demandee doit survivre a reparer */
function poser(g0,ecarts,o,quoi){
  const Gn=o.Gn,PAR={};for(const b of Gn.BORNES)PAR[b.cle]=b;
  const g=copie(g0);
  for(const [k,v] of Object.entries(ecarts)){
    if(!PAR[k])throw new ErreurBanc(quoi+' : gene inconnu « '+k+' » (absent de genome.js BORNES)',1);
    if(PAR[k].fige&&!o.figesPermis)throw new ErreurBanc(quoi+' : « '+k+' » est fige : la seconde chance n\'est pas une idee du banc (elle se regle pour toute la vague, dans « fixes »)',1);
    if(typeof v!=='number'||!isFinite(v))throw new ErreurBanc(quoi+' : « '+k+' » doit etre un nombre (lu : '+JSON.stringify(v)+')',1);
    g.A[k]=v;}
  Gn.reparer(g,o.cfgT);
  for(const [k,v] of Object.entries(ecarts))if(Math.abs(g.A[k]-v)>1e-9)
    throw new ErreurBanc(quoi+' : « '+k+' » = '+v+' ne survit pas a reparer (rendu : '+g.A[k]+')',1);
  const d=Gn.valider(g,o.cfgT);
  if(d)throw new ErreurBanc(quoi+' : genome non conforme : '+d,1);
  return g;}

function pilote(g,o){const texte=o.Gn.ecrirePilote(g,{cfg:o.cfgT});return {genome:g,id:o.Gn.idDe(g),texte,shaPilote:o.Gn.shaPilote(texte)};}

/* les ecarts d'un genome au temoin de la vague (pour le journal) */
function ecartsA(g,T,Gn){const o={};for(const b of Gn.BORNES)if(g.A[b.cle]!==T.A[b.cle])o[b.cle]=[T.A[b.cle],g.A[b.cle]];return o;}

/* vague : controlee (controlerVague) ; catalogue : lireCatalogue ; o = {cfg, Gn} -> {cfgT, temoin, bras:[…]} */
function fabriquer(vague,catalogue,o){
  const Gn=o.Gn,cfgT=Object.assign({},o.cfg,{temoin:vague.temoin});
  const oo={Gn,cfgT};
  let T0;
  try{T0=Gn.genomeTemoin(cfgT);}catch(e){throw new ErreurBanc('le temoin « '+vague.temoin+' » ne se fabrique pas : '+(e&&e.message||e),1);}
  const T=poser(T0,vague.fixes,Object.assign({figesPermis:true},oo),'vague.json : fixes');
  const temoin=Object.assign({nom:'temoin',dit:'le temoin '+vague.temoin+(Object.keys(vague.fixes).length?' avec les fixes de la vague':'')+' : il ne change rien',
    genes:copie(vague.fixes),ecarts:ecartsA(T,T0,Gn)},pilote(T,oo));
  const bras=[];
  for(const b of vague.bras){
    const C=catalogue.bras[b.nom];
    if(!C)throw new ErreurBanc('le bras « '+b.nom+' » n\'est pas dans bras.json (connus : '+Object.keys(catalogue.bras).join(', ')+')',1);
    if(!Object.keys(C.genes).length)throw new ErreurBanc('bras.json : le bras « '+b.nom+' » ne change aucun gene : il serait le temoin',1);
    const g=poser(T,C.genes,oo,'bras « '+b.nom+' »');
    const p=pilote(g,oo);
    if(p.shaPilote===temoin.shaPilote)throw new ErreurBanc('le bras « '+b.nom+' » a le pilote du temoin (ses genes '+JSON.stringify(C.genes)+' sont deja ceux du temoin) : il ne mesurerait rien',1);
    const double=bras.find(x=>x.shaPilote===p.shaPilote);
    if(double)throw new ErreurBanc('les bras « '+double.nom+' » et « '+b.nom+' » ont le meme pilote : un bras en double',1);
    bras.push(Object.assign({nom:b.nom,dit:C.dit,genes:copie(C.genes),critere:b.critere,ecarts:ecartsA(g,T,Gn)},p));}
  return {cfgT,temoin,bras};}

module.exports={NOM_ESSAI,BRAS_MAX,lireCatalogue,lireVague,controlerVague,fabriquer,sha1};
