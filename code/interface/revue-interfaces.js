/* ===== LA REVUE DES INTERFACES (2026-11-07, Sacha : « revois les interfaces, fais un screen de chaque écran et paufine tout parfaitement. pas de bouton
   inutile. clarifie. ergonomie mobile ») : LES PLAQUES DE NOM QUI DÉBORDENT =====
   Relevé au banc des écrans en anglais : la plaque sous une boîte de la boutique (.bqKn, boites-blister.css) tient 9 lettres par ligne sur deux lignes ;
   cinq noms anglais en demandent trois et finissaient en « THE YELLOW… ». Plutôt que de deviner la largeur (elle change debout, couché, par rayon), on
   MESURE : dès qu'une plaque est posée dans le panneau de la boutique, si son texte dépasse sa hauteur, elle reçoit .lg (7 px sans espacement, voir
   css/revue-interfaces.css). Un seul passage par plaque (data-lg), lectures groupées avant les écritures (une seule mise en page), déclenché par
   un MutationObserver sur le garage (le panneau #gBqPan n'existe qu'à la première ouverture de la boutique), débité à une image. */
const REVUE={ob:null,raf:0,reste:1,w:0};
function bqNomsAjuste(){REVUE.raf=0;const pan=document.getElementById('gBqPan');if(!pan)return;
  const L=pan.querySelectorAll('.bqKn:not([data-lg])');REVUE.reste=0;if(!L.length)return;
  const deb=[];for(let i=0;i<L.length;i++){const e=L[i];if(!e.clientHeight){REVUE.reste++;continue;} /* pas encore visible (rayon caché) : on repassera */
    e.setAttribute('data-lg','1');if(e.scrollHeight>e.clientHeight+1||e.scrollWidth>e.clientWidth+1)deb.push(e);}
  for(let i=0;i<deb.length;i++)deb[i].classList.add('lg');
  const deb2=[];for(let i=0;i<deb.length;i++){const e=deb[i];if(e.scrollHeight>e.clientHeight+1||e.scrollWidth>e.clientWidth+1)deb2.push(e);} /* 2e mesure (une mise en page de plus, seulement s'il y a eu un .lg) */
  for(let i=0;i<deb2.length;i++)deb2[i].classList.add('lg2');}
function bqNomsVeille(){const g=document.getElementById('garage');if(!g||REVUE.ob||typeof MutationObserver!=='function')return;
  /* (2026-11-14, qualité boutique, INT-AUDIT 15) une classe qui change n'a rien à remesurer quand toutes les plaques sont déjà mesurées (REVUE.reste = 0, aucune plaque
     cachée en attente) : seuls les nœuds AJOUTÉS (une bande refaite) relancent la mesure. Avant, chaque classe changée dans le garage (un appui, la carte qui se
     soulève au cran de la bande) relançait la recherche et relisait les plaques cachées, en plein geste. */
  REVUE.ob=new MutationObserver(function(ms){if(REVUE.raf)return;let v=REVUE.reste>0;for(let i=0;!v&&i<ms.length;i++)if(ms[i].type==='childList'&&ms[i].addedNodes.length)v=true;if(v)REVUE.raf=requestAnimationFrame(bqNomsAjuste);});
  REVUE.ob.observe(g,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});}
try{bqNomsVeille();}catch(e){}
/* (2026-11-14, qualité boutique, INT-AUDIT 14) LE PIVOT REMESURE : une plaque mesurée debout gardait sa taille couchée (« THE YELLOW… » coupé, ou 7 px sans besoin).
   Quand la largeur de la vue change (pas la hauteur seule : la barre d'adresse, le clavier), les plaques perdent leur mesure et se remesurent une fois la bande reposée
   à la nouvelle taille (350 ms : --bqaC est reposé à l'image qui suit le pivot). */
try{addEventListener('resize',function(){const w=innerWidth;if(!REVUE.w){REVUE.w=w;return;}if(w===REVUE.w)return;REVUE.w=w;clearTimeout(REVUE.rt);
  REVUE.rt=setTimeout(function(){const pan=document.getElementById('gBqPan');if(!pan)return;pan.querySelectorAll('.bqKn[data-lg]').forEach(function(e){e.removeAttribute('data-lg');e.classList.remove('lg','lg2');});REVUE.reste=1;if(!REVUE.raf)REVUE.raf=requestAnimationFrame(bqNomsAjuste);},350);},{passive:true});REVUE.w=innerWidth;}catch(e){}
