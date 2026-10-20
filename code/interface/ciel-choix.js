/* ============================== LE CHOIX DU CIEL (2026-10-21, Léo : « donne-moi la possibilité de choisir le ciel avant de jouer ») ==============================
   Sur l'accueil, une rangée AUTO · MATIN · MIDI · SOIR · NUIT · PLUIE · ORAGE : le JOUER qui suit part sur la MER DE NUAGES à cette météo (AUTO = le tirage
   au hasard du mode classique, comme avant). Le choix est gardé (localStorage `cashcarCiel`, hors SAVE : une clé de plus n'a pas à passer par san()). Il pose
   SF.force dès qu'on le touche (le départ d'avance rebâtit la piste de la bonne météo tout de suite) et classiqueJouer le repose à chaque départ. */
const CIEL_CH={opts:['auto','matin','midi','soir','nuit','pluie','orage'],v:'auto',el:null};
try{const v9=localStorage.getItem('cashcarCiel');if(v9&&CIEL_CH.opts.indexOf(v9)>=0)CIEL_CH.v=v9;}catch(e){}
Object.assign(I18N,{"MATIN":"MORNING","MIDI":"NOON","ORAGE":"STORM","AUTO":"AUTO"});
function cielChoixImpose(){ // à chaque départ : la map nuages à la météo choisie (sauf si une autre force est déjà posée : lien de test, banc)
  if(CIEL_CH.v==='auto'||SF.force)return;const p=SF.prochain;
  if(p&&SF.prochainDer===SF.der&&p.carte==='nuages'&&p.meteo===CIEL_CH.v)return; // la piste d'avance est déjà la bonne
  SF.force={carte:'nuages',meteo:CIEL_CH.v};}
/* LE CIEL DU MENU SUIT (2026-10-21, Léo : « ça doit changer aussi le ciel du menu, les boutons ») : la touche choisie pose AUSSI l'heure du titre (TITRE_HF.force, via dbgHeure) ;
   PLUIE → l'après-midi (le plus gris des ciels du titre), ORAGE → le soir (le plus sombre) ; AUTO rend la main à l'horloge du téléphone. */
const CIEL_MENU={matin:'matin',midi:'midi',soir:'soir',nuit:'nuit',pluie:'aprem',orage:'soir',auto:null};
function cielChoixMenu(){try{if(typeof window.dbgHeure==='function')window.dbgHeure(CIEL_MENU[CIEL_CH.v]);}catch(e){}}
function cielChoixPlace(){const e=CIEL_CH.el;if(!e)return;const h=document.getElementById('mHome');let r=null;if(h)for(const q of h.querySelectorAll('[data-m="garage"],[data-m="shop"],[data-m="set"],.mOutils')){const t=q.getBoundingClientRect();if(t.height>2&&(!r||t.top<r.top))r=t;}if(!r)return; /* la plus haute des touches de la barre de l'accueil visibles */e.style.top=Math.max(0,Math.round(r.top-30-10))+'px';}
function cielChoixMaj(){const e=CIEL_CH.el;if(!e)return;
  for(const c of e.children){c.classList.toggle('on',c.dataset.c===CIEL_CH.v);c.setAttribute('aria-pressed',c.dataset.c===CIEL_CH.v?'true':'false');}
  const h=document.getElementById('mHome'),B9=document.body.classList,vu=!!(h&&h.classList.contains('on')&&!h.classList.contains('sort')&&!B9.contains('play')&&!B9.contains('dead')&&!B9.contains('garOn'));e.classList.toggle('on',vu);if(vu)cielChoixPlace();}
function cielChoixInit(){
  if(CIEL_CH.el)return;const h=document.getElementById('mHome');if(!h)return;
  const e=document.createElement('div');e.id='mCiel';e.setAttribute('role','group');e.setAttribute('aria-label','Ciel');
  for(const o of CIEL_CH.opts){const b=document.createElement('button');b.type='button';b.className='cC';b.dataset.c=o;const s=document.createElement('span');s.setAttribute('data-fr',o.toUpperCase());s.textContent=TR(o.toUpperCase());b.appendChild(s);
    b.addEventListener('click',function(){CIEL_CH.v=o;try{localStorage.setItem('cashcarCiel',o);}catch(e9){}
      if(o==='auto'){if(SF.force&&SF.force.carte==='nuages')SF.force=null;SF.prochain=null;}else{SF.force={carte:'nuages',meteo:o};SF.prochain=null;}
      try{uiClic('onglet');}catch(e9){}cielChoixMenu();cielChoixMaj();});
    e.appendChild(b);}
  document.body.appendChild(e);CIEL_CH.el=e;
  new MutationObserver(cielChoixMaj).observe(h,{attributes:true,attributeFilter:['class']});new MutationObserver(cielChoixMaj).observe(document.body,{attributes:true,attributeFilter:['class']});window.addEventListener('resize',function(){setTimeout(cielChoixMaj,60);});setInterval(cielChoixPlace,1500);
  cielChoixMaj();setTimeout(cielChoixMenu,0);}
try{cielChoixInit();}catch(e){console.warn('choix du ciel',e);}
