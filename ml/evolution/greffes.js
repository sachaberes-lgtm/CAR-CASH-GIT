/* ===== LES GREFFES (28/11/2026, greffes ; le banc des genes, ml/ecurie/etude/banc-des-genes/LISEZ-MOI.md « Le resultat » : bordOn et slalomOn
   rapprochent surement le pilote des vrais joueurs, sans verdict sur le palier ; une mutation n'allume un interrupteur donne que rarement, pDrapeau 0,03) =====
   Une GREFFE : la place de l'immigre d'une generation est donnee, de temps en temps, a une copie EXACTE du champion du moment, sur laquelle quelques
   interrupteurs (ou choix, ou entiers) sont forces a une valeur ecrite dans la config. La selection essaie ainsi elle-meme, regulierement, ces genes
   sur son meilleur pilote ; l'enfant greffe est ensuite note, garde ou renvoye comme tous les autres.
   config.json "greffes" (facultatif) : une liste d'ensembles gene -> valeur, par exemple
     [{"bordOn":1},{"slalomOn":1},{"bordOn":1,"slalomOn":1},{"bordOn":1,"suitOn":1,"fuirVite":1}]
   Absente, null ou [] : aucune greffe, evoluer.js fait EXACTEMENT ce qu'il faisait avant (memes tirages, memes identifiants, memes journaux).
   LE CYCLE : a la generation G >= 1, l'immigre numero k (k < cfg.immigres) a le rang ((G-1) x immigres + k) mod (n+1), n = le nombre d'ensembles ;
   rang < n : greffe de l'ensemble de ce rang ; rang = n : l'immigre ordinaire (la mutation lourde du champion).
   Ce fichier ne fait que des fonctions pures (aucun tirage, aucune ecriture) ; evoluer.js (naissances) les appelle. Notes : notes/greffes.md. */
'use strict';
const Gn=require('./genome');

const TYPES_PERMIS=new Set(['drapeau','choix','entier']);

/* la table cle -> borne (o.bornes remplace genome.BORNES : les tests y simulent un gene fige) */
function tableBornes(bornes){
  const T=Object.create(null);
  for(const b of bornes||Gn.BORNES)T[b.cle]=b;
  return T;
}
const texteValeur=x=>{try{return JSON.stringify(x);}catch(e){return String(x);}};

/* ===== LIRE ET VERIFIER LA CONFIG (28/11/2026, greffes) =====
   Rend la liste des ensembles, chacun copie et fige ({cle:valeur}, dans l'ordre ecrit). Leve une Error en francais (prefixe « evoluer : ») au premier
   defaut : la liste n'en est pas une ; un ensemble vide ou qui n'est pas un objet ; un gene inconnu ; un reel ou une tete (WV, WS) ; un gene fige
   (fige:true dans BORNES) ; une valeur non entiere ou hors de [min ; max]. */
function lireGreffes(cfg,o){
  o=o||{};
  const L=cfg?cfg.greffes:undefined;
  if(L===undefined||L===null)return [];
  if(!Array.isArray(L))throw new Error('evoluer : config "greffes" doit etre une liste d\'ensembles {gene: valeur} (lu : '+texteValeur(L).slice(0,120)+')');
  const T=tableBornes(o.bornes),sortie=[];
  for(let i=0;i<L.length;i++){
    const E=L[i],ou='config "greffes", ensemble n° '+(i+1);
    if(!E||typeof E!=='object'||Array.isArray(E))throw new Error('evoluer : '+ou+' : ce doit etre un objet {gene: valeur} (lu : '+texteValeur(E).slice(0,120)+')');
    const cles=Object.keys(E);
    if(!cles.length)throw new Error('evoluer : '+ou+' : ensemble vide (au moins un gene)');
    const net={};
    for(const c of cles){
      const b=Object.prototype.hasOwnProperty.call(T,c)?T[c]:null,x=E[c];
      if(!b){
        if(c==='WV'||c==='WS')throw new Error('evoluer : '+ou+' : « '+c+' » est une tete de neurones, pas un gene qu\'on peut greffer');
        throw new Error('evoluer : '+ou+' : gene inconnu « '+c+' » (il n\'est pas dans genome.js BORNES)');}
      if(!TYPES_PERMIS.has(b.type))throw new Error('evoluer : '+ou+' : « '+c+' » est un '+b.type+' : seuls les drapeaux, les choix et les entiers se greffent');
      if(b.fige===true)throw new Error('evoluer : '+ou+' : « '+c+' » est fige dans genome.js (fige:true) : il ne se greffe pas');
      if(!(typeof x==='number'&&Number.isInteger(x)))throw new Error('evoluer : '+ou+' : « '+c+' » doit valoir un entier (lu : '+texteValeur(x)+')');
      if(x<b.min||x>b.max)throw new Error('evoluer : '+ou+' : « '+c+' » vaut '+x+', hors de ['+b.min+' ; '+b.max+']');
      net[c]=x===0?0:x;}   /* -0 -> 0 */
    sortie.push(Object.freeze(net));}
  return Object.freeze(sortie);
}

/* ===== LE CYCLE (28/11/2026, greffes) =====
   G >= 1, k < immigres, n ensembles -> le rang dans le cycle de longueur n+1 ; rang === n : l'immigre ordinaire. n = 0 : toujours 0 (= n). */
function rangCycle(G,k,immigres,n){
  const m=n+1,idx=(G-1)*immigres+k;
  return ((idx%m)+m)%m;
}
/* l'ensemble a greffer pour l'immigre k de la generation G, ou null (l'immigre ordinaire) */
function ensembleDe(greffes,G,k,immigres){
  const n=greffes?greffes.length:0;
  if(!n||!(G>=1))return null;
  const r=rangCycle(G,k,immigres,n);
  return r<n?greffes[r]:null;
}

/* ===== APPLIQUER (28/11/2026, greffes) =====
   forcer(genome, ensemble) : une COPIE du genome (A, WV, WS copies ; l'entree n'est jamais touchee) ou les genes de l'ensemble valent la valeur
   demandee. Aucun tirage. L'ordre des cles de A ne bouge pas (les cles existent deja). */
function copie(g){return {v:g.v,A:Object.assign({},g.A),WV:Array.from(g.WV),WS:Array.from(g.WS)};}
function forcer(genome,ensemble){
  const g=copie(genome);
  for(const c of Object.keys(ensemble)){
    if(!Object.prototype.hasOwnProperty.call(g.A,c))throw new Error('greffes : le genome n\'a pas de gene « '+c+' »');
    g.A[c]=ensemble[c];}
  return g;
}
/* le champion porte-t-il deja toutes les valeurs de l'ensemble ? (la greffe ne changerait rien : voie de repli) */
function dejaPorte(genome,ensemble){
  for(const c of Object.keys(ensemble))if(genome.A[c]!==ensemble[c])return false;
  return true;
}
/* le texte des journaux : « bordOn=1 + slalomOn=1 » */
function texte(ensemble){return Object.keys(ensemble).map(c=>c+'='+ensemble[c]).join(' + ');}

module.exports={lireGreffes,rangCycle,ensembleDe,forcer,dejaPorte,texte,TYPES_PERMIS};
