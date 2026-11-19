/* ===== LA MÉMOIRE DES ROUTES (2026-11-17, lot portv, 2e tour — contrôle adverse : « la route de la GROTTE bâtie en course diffère de l'avant, à graine et palier égaux ») =====
   LA CAUSE : une route ne dépend pas que de sa graine et du palier. Les générateurs lisent et ÉCRIVENT une mémoire des routes d'avant :
   · la grotte : GRT_LIB_MEM.perso (la personnalité de la grotte d'avant, écrite à CHAQUE essai de grtTrace) et GRT_VUS (les modules des deux dernières grottes) ;
   · l'orbite : ORB_PIOCHE (les modules, l'humeur, le voyage de la route d'avant), OU (l'ouverture d'avant, les rejets) et OU_FORMES (les formes déjà vues) ;
   · Jade et l'orbite : RU, le sac des ROUTES UNIQUES (sans mémoire avec ?pistegraine=).
   Un pré-bâti ANNULÉ (la map d'en face a changé, la partie finie, un newTrack d'ailleurs) avait déjà écrit dans cette mémoire : la grotte suivante se tirait avec la
   personnalité d'une grotte FANTÔME que personne n'a roulée. Combien un pré-bâti annulé avait avancé dépendait du temps (taille des tranches, départ attendu 7 s ou non) :
   au banc avant/après lot, deux histoires de fantômes différentes, donc trois grottes différentes à graine égale. Le découpage en tranches, lui, ne change rien
   (vérifié : la route bâtie en tranches avec le jeu vivant entre deux = la même d'un trait aux mêmes entrées, ?routeverif=1).
   LA RÈGLE (PORTV_ON ; `?sans=portvmem` : l'avant) : la mémoire est prise en photo quand un pré-bâti commence (prebPart) ; s'il est annulé, elle est REMISE — seules
   les routes installées comptent. rmPrend / rmRemet servent aussi au contrôle ?routeverif=1 (la route de référence bâtie d'un trait ne laisse aucune trace).
   (localStorage du sac RU : une écriture d'un pré-bâti annulé y reste jusqu'à la prochaine route gardée, qui le réécrit en entier.) */
const RM_ON=!/[?&]sans=[^&]*\bportv(mem)?\b/.test(location.search);
function rmCopie(v){if(Array.isArray(v))return v.map(function(x){return Array.isArray(x)?x.slice():x;});if(v instanceof Map)return new Map(v);
  if(v&&typeof v==='object'&&Object.getPrototypeOf(v)===Object.prototype){const o={};for(const k in v)o[k]=Array.isArray(v[k])?v[k].slice():v[k];return o;}return v;} /* un niveau de plus : les listes et les objets simples sont copiés */
function rmObjs(){const L=[]; /* [nom, conteneur, clés (null : le tableau entier)] — chacun seulement s'il existe dans cette page */
  if(typeof GRT_VUS!=='undefined')L.push(['GRT_VUS',GRT_VUS,null]);
  if(typeof GRT_LIB_MEM!=='undefined')L.push(['GRT_LIB_MEM',GRT_LIB_MEM,'*']);
  if(typeof ORB_PIOCHE!=='undefined')L.push(['ORB_PIOCHE',ORB_PIOCHE,'*']);
  if(typeof OU!=='undefined'&&OU&&'kAx' in OU)L.push(['OU',OU,'*']);
  if(typeof OU_FORMES!=='undefined')L.push(['OU_FORMES',OU_FORMES,null]);
  if(typeof RU!=='undefined')L.push(['RU',RU,'RU']);
  return L;}
function rmPrend(){const S=[];for(const e of rmObjs()){const C=e[1];let v;
    if(e[2]===null)v=rmCopie(C);
    else if(e[2]==='RU')v={H:JSON.parse(JSON.stringify(C.H||{})),P:new Map(C.P),V:Object.assign({},C.V),lu:C.lu,F:C.F?(function(){const o={};for(const k in C.F)o[k]=C.F[k].slice();return o;})():undefined};
    else{v={};for(const k of Object.keys(C))v[k]=rmCopie(C[k]);}
    S.push([e[0],C,e[2],v]);}
  return S;}
function rmRemet(S){if(!S)return;for(const e of S){const C=e[1],v=e[3];
    if(e[2]===null){C.length=0;for(const x of rmCopie(v))C.push(x);}
    else if(e[2]==='RU'){C.H=JSON.parse(JSON.stringify(v.H));C.P=new Map(v.P);C.V=Object.assign({},v.V);C.lu=v.lu;if(v.F===undefined)delete C.F;else{C.F={};for(const k in v.F)C.F[k]=v.F[k].slice();}}
    else{for(const k of Object.keys(C))if(!(k in v))delete C[k];for(const k in v)C[k]=rmCopie(v[k]);}}}
function rmSig(S){S=S||rmPrend();return S.map(function(e){const v=e[3];return e[0]+':'+(e[2]==='RU'?JSON.stringify([v.H,Array.from(v.P.keys()),v.V,v.F?Object.keys(v.F).map(function(k){return k+v.F[k].length;}):0]):
    JSON.stringify(v,function(k,x){return x instanceof Map?Array.from(x.keys()):(x&&x.isVector3)?0:x;}));});}
function rmEcart(a,b){const o=[];for(let i=0;i<a.length;i++)if(a[i]!==b[i])o.push(a[i].split(':')[0]);return o;} /* les noms des mémoires qui diffèrent */
