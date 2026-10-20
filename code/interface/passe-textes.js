/* ============================================================================================================================
   LA PASSE DES TEXTES (2026-10-14) — un seul mot par rôle dans les trois langues, plus d'anglais dans l'interface française.
   I18N_FR : le FRANÇAIS AFFICHÉ quand il diffère de la clé (la clé reste la phrase d'origine, le code ne bouge pas). Écrire ici avec
   les accents : majPix les retire tout seul des mots en capitales rendus en pixel.
   ========================================================================================================================== */
var I18N_FR={'GAME OVER':'PERDU','RAPIDE':'BASSE','NETTE':'HAUTE','MONTE':'MONTER','PLONGE':'PLONGER','HOME':'ACCUEIL'}; // var : hissée, TR() peut tourner avant cette ligne sans toucher une zone morte
Object.assign(I18N,{'SAUVEGARDE':'SAVE DATA','RAPIDE':'LOW','NETTE':'HIGH','LOCALE':'LOCAL','VERSION':'VERSION'});
Object.assign(I18N,{'Tu pourras changer dans les réglages.':'You can change this in the settings.','Virages aidés, 3 vies':'Assisted turns, 3 lives','Sans aide, une seule vie':'No assists, one life','TOUCHE POUR JOUER':'TAP TO PLAY'}); // (2026-10-14, charte 6 · accueil) le choix FACILE / NORMAL en cartes, l'invitation du splash
/* ⚠ LES CAPITALES ACCENTUÉES NE PASSENT PAS EN PIXEL (2026-09-24) : la police dessine « É » comme un « é »
   minuscule — « RÉGLAGES » s'affichait « RéGLAGES » dans le panneau de pause. Tout ce qui passe par TR()
   perd donc l'accent de ses CAPITALES (À→A, É→E…) ; les minuscules accentuées, elles, sont bien dessinées. */
/* (2026-09-29, audit) « PLUS QUE 2 PIÈCES ▲ 3 CYLINDRES » se lisait « il m'en faut 2 pour l'ACHETER » : le moteur repart de zéro à chaque
   partie, la carte dit à quelle distance du palier suivant on est MORT */
function presqueTxt(mq){if(LANG==='en')return mq+' '+(mq>1?'COINS':'COIN')+' SHORT OF';return majPix('ENCORE '+mq+' '+(mq>1?'PIÈCES':'PIÈCE')+' POUR');} // (passe qualité) « À 2 PIÈCES DU TURBINE À GAZ » : le moteur est souvent féminin
/* (2026-10-14, passe des textes) majPix ne retire plus l'accent d'une capitale quand le MOT n'est pas tout en capitales : « Ça roule »,
   « À 88 à l'heure », « Élue plus belle du monde » s'écrivaient « Ca roule », « A 88 »… dans les phrases en police système. Un mot tout en
   capitales (« DÉCOLLAGE », « RÉGLAGES ») est toujours rendu en pixel : il perd son accent comme avant. Une capitale seule (« À », « É »)
   garde son accent si la chaîne contient des minuscules. PIX_ACC=true laisserait passer aussi les capitales pixel : la police
   Press Start 2P a bien les glyphes (É = un E aplati sur 5 rangées + accent, cmap vérifié), mais l'effet n'a pas été jugé à l'écran. */
const PIX_ACC=false;
function majPix(s){
  if(typeof s!=='string'||PIX_ACC)return s;
  const mn=/[a-z\u00DF-\u00FF\u0153]/.test(s);
  return s.replace(/[^\s<>]+/g,t=>(/[a-z\u00DF-\u00FF\u0153]/.test(t)||(t.length===1&&mn))?t:t.replace(/[\u00C0-\u00D6\u00D8-\u00DE]/g,c=>c.normalize('NFD')[0]));
}
function TR(s){ // traduction EXACTE, repli français silencieux
  if(s==null)return s;
  if(LANG==='fr')return majPix(I18N_FR&&I18N_FR[s]!==undefined?I18N_FR[s]:s);
  let t=I18N[s];
  // (2026-09-28, passe de lancement) LES COMPTEURS : « RÉCOLTE ×5 », « CHAÎNE ×3 » — une phrase + un nombre composé à l'exécution n'était
  // JAMAIS dans le dictionnaire (en anglais, la liste d'aura restait en français). Seulement si la recherche exacte échoue : la tête se
  // traduit, la queue (× ou +, puis des chiffres) passe telle quelle.
  if(t===undefined&&typeof s==='string'){const m=/^(.*?\S)(\s*[×+][\s\d.,×+%°]*)$/.exec(s);if(m&&I18N[m[1]]!==undefined)t=I18N[m[1]]+m[2];}
  return majPix(t===undefined?s:t);
}
// LE HTML STATIQUE — le texte d'origine est mémorisé au premier passage (`data-fr`), sinon rebasculer
// en FR après un passage en EN traduirait de l'anglais vers rien. On repeint donc TOUJOURS depuis la
// source française, dans les deux sens.
/* ⚠ UN SEUL ÉCRIVAIN POUR LES DEUX LIBELLÉS DE MODE. Ils se reconstruisaient à SIX endroits — la
   bascule de langue, et les deux boutons qui s'excluent mutuellement (armer la police éteint le
   parc, et inversement). Six copies de la même phrase, c'est six occasions de diverger : le passage
   « sans emoji » du 18/08 en avait ratées la moitié, si bien que le libellé changeait de tête selon
   le chemin par lequel on venait de le toucher. Les pictogrammes sont revenus avec la DA borne
   (2026-08-30) et ils ne reviennent qu'ICI.
   ⚠ on relit le bouton par `$()` et pas par la constante `survBtnEl` : `applyLangDOM`
   peut tourner avant que la liste des éléments ne soit construite, et une `const` pas encore
   initialisée lève une ReferenceError qui tuerait tout le démarrage. */
function modeLbl(){
  const sb=$('survBtn');
  if(sb)sb.innerHTML=pxi('drapeau')+' '+TR('Survivant')+' · '+(SURV.armed?TR('on'):TR('off'));
}
function applyLangDOM(){
  try{const w9=window.parent||window;if(w9.__tourneLbl)w9.__tourneLbl();}catch(e){} // (2026-10-07) le bouton TOURNER de la colonne PC suit la langue (il vit dans la page CADRE : le jeu tourne dans l'iframe)
  try{for(const e of document.querySelectorAll('[aria-label]')){if(e.dataset.frAria===undefined)e.dataset.frAria=e.getAttribute('aria-label');e.setAttribute('aria-label',LANG==='fr'?e.dataset.frAria:TR(e.dataset.frAria));}}catch(e){} // (2026-09-29) VoiceOver : « Back », plus « Retour », pour un joueur anglais
  try{document.documentElement.lang=LANG;}catch(e){} // (2026-09-28) VoiceOver lisait l'anglais avec la voix française (<html lang="fr"> ne bougeait jamais)
  try{for(const k in PWR_DEFS)PWR_DEFS[k].icoDessine();}catch(e){} // (pouvoirs v2) l'étiquette des cristaux suit la langue (PWR_DEFS n'existe pas encore au tout premier appel : ignoré, il se dessine à sa naissance)
  const put=(sel,txt)=>{const e=document.querySelector(sel);if(e)e.textContent=txt;};
  // ⚠ que des éléments à texte PUR : #cpInfo par exemple contient <span id=cpDist> et #cpBar,
  // lui écrire un textContent supprimerait ses enfants (donc la jauge de progression).
  for(const e of document.querySelectorAll('[data-fr],#gTitle,#gHint,#gEquip,#tagline,#goTxt,#playBtn,#spNote,#nameSave,#setHead>span,#saveExp,#saveImp,#nitroLbl,#speedUnit,.setSec,.setRow>span,.setKeys span,#nameEntry>span,.blabel,.mmD,.stRow>span')){
    // ⚠ un élément qui porte des ICÔNES PIXEL (`.pxi`) : on retraduit son texte SANS les effacer (textContent les tuerait)
    const ic9=e.querySelector('.pxi');
    if(ic9){ if(e.dataset.fr===undefined)e.dataset.fr=e.textContent.trim();
      if(e.children.length===e.querySelectorAll(':scope>.pxi').length){ // icônes + texte, rien d'autre : on recompose
        e.innerHTML=Array.from(e.querySelectorAll(':scope>.pxi'),x=>x.outerHTML).join('')+' '+TR(e.dataset.fr);}
      continue; }
    if(e.dataset.fr===undefined)e.dataset.fr=e.textContent;
    e.textContent=TR(e.dataset.fr);
  }
  // les boutons à état composé (leur libellé se reconstruit ailleurs) : on les repasse par leur écrivain
  // ⚠ SANS EMOJI (2026-08-18) : ces quatre libellés sont RECONSTRUITS ici, donc c'est ici qu'ils
  // revenaient avec leurs pictos alors que le HTML les avait perdus. Le menu est passé en texte nu ;
  // un emoji dans un lien secondaire le fait remonter dans la hierarchie visuelle, ce qu'on ne veut plus.
  modeLbl();
  try{buildPlayWord();mPlayMot();}catch(e){} // le JOUER du garage (et celui de l'accueil, le même mot) se reconstruit lettre par lettre dans la langue neuve
  put('#garageBtn',TR('Garage'));put('#setBtn',TR('Réglages'));
  try{paintMoney();elRecord.textContent=TR('record : ')+fmt(best);setBestChip();renderLeaders(-1);}catch(e){}
  paintCarHud._k=null;try{paintCarHud();}catch(e){}      // la fiche se repeint dans la langue neuve
  engVigTierShown=-1;                                     // la légende de la vignette aussi
  if(garageOn)try{garageShow(garageI);}catch(e){}
}
function fmtGta(v){
  // LES CENTIMES : le compteur 8 chiffres arrondissait la mise de départ (1,61 s'affichait « 2 »).
  // On les montre en petit tant qu'on est sous les 1 000 — après, ils ne veulent plus rien dire.
  let ent=Math.floor(v),cts=Math.round((v-ent)*100);if(cts>=100){ent++;cts=0;} // (2026-10-14, chasse aux bugs) x,995 et plus arrondissait à 100 centimes (« 5.100 ») : on reporte sur l'entier
  const s=String(ent).padStart(8,'0');
  const i=s.search(/[1-9]/);
  const c=CUR();
  const dec=(v<1000&&cts>0)?'<span class="cts">'+(LANG==='fr'?',':'.')+String(cts).padStart(2,'0')+'</span>':''; // le point décimal anglais : « $1,61 » se lit comme des milliers
  return (i<0?c+'<span class="dz">'+s+'</span>':c+'<span class="dz">'+s.slice(0,i)+'</span>'+s.slice(i))+dec;
}
/* LE SOLDE PRÉCIS (2026-10-14, GAMEPLAY — Sacha : « un compteur d'argent PRÉCIS avec TOUS les chiffres, inspiré de celui de GTA ; pas de double S »).
   PARTOUT où le SOLDE s'affiche (accueil, garage, profil, boutique, écran de fin, compteur de course) : le montant COMPLET, à l'écriture du
   compteur du garage de Léo (« $ 48 250 » en français, « $48,250 » en anglais ; l'espace de fr-FR devient une espace simple, la police pixel
   n'a pas U+202F), UN SEUL symbole (le « $ » : la pièce des plaques est retirée), et il ROULE quand il change (0,7 s, départ vif, arrivée posée ;
   un seul rAF pour toutes les plaques, aucun objet alloué par image). Les grands montants tiennent : quand le NOMBRE de signes change, la police
   descend par crans jusqu'à ce que la plaque tienne dans son cadre et dans l'écran (soldeFit, une mesure par changement de longueur, pas par image).
   Les messages d'événement gardent leurs unités compactes (fmtC) : seul le SOLDE est précis. */
function fmtSolde(x){return CUR()+(LANG==='fr'?' ':'')+Math.max(0,Math.floor(x)).toLocaleString(LOC()).replace(/[\u202f\u00a0]/g,' ');} /* (2026-10-18, débogage) TRONQUÉ comme soldeEcrit : 6,6 $ s'écrivait « $ 7 » sur l'écran de fin et « $ 6 » au garage */
const SOLDE={l:[],on:false,D:700};
function soldeFit(el,xMin){const p=el.parentElement;if(!p)return true;el.style.fontSize='';const x0=xMin||4; /* xMin : le bord gauche à ne pas franchir (en course, la colonne des barres) */
  let fs=parseFloat(getComputedStyle(el).fontSize)||14;
  for(let i=0;i<10;i++){const r=p.getBoundingClientRect();if(r.width<1)return false; /* caché : on réessaiera à la prochaine écriture */
    if(el.scrollWidth<=el.clientWidth+1&&p.scrollWidth<=p.clientWidth+1&&r.right<=VP.w-4&&r.left>=x0)return true; /* le chiffre lui-même peut se rogner (overflow:hidden) : on le mesure aussi */
    fs=Math.max(7,fs-1.5);el.style.fontSize=fs+'px';if(fs<=7)return true;}
  return true;}
function soldeTxt(el,v){const t=fmtSolde(v);el._sl=LANG;if(el.textContent!==t){el.textContent=t;if(el._sn!==t.length){el._sn=t.length;if(!soldeFit(el))el._sn=-1;}}}
function soldeEcrit(el,v,net){if(!el)return;v=Math.max(0,Math.floor(v));
  if(el._sv==null||net||REDUCED_MOTION){el._sv=el._sc=v;soldeTxt(el,v);return;}
  if(el._sn===-1){const n9=performance.now();if(!(n9-(el._sr||0)<500)){el._sr=n9;if(soldeFit(el))el._sn=el.textContent.length;}} /* la plaque était cachée au dernier changement de longueur : on remesure, deux fois par seconde au plus */
  if(v===el._sc){if(el._sl!==LANG&&SOLDE.l.indexOf(el)<0)soldeTxt(el,v);return;} /* la langue a changé : même montant, autre écriture */
  el._s0=el._sv;el._sc=v;el._st=performance.now();
  if(SOLDE.l.indexOf(el)<0)SOLDE.l.push(el);
  if(!SOLDE.on){SOLDE.on=true;requestAnimationFrame(soldeRoule);}}
function soldeRoule(){const n=performance.now(),L=SOLDE.l;let j=0;
  for(let i=0;i<L.length;i++){const el=L[i],k=Math.min(1,(n-el._st)/SOLDE.D),e=1-Math.pow(1-k,3);
    el._sv=Math.round(el._s0+(el._sc-el._s0)*e);soldeTxt(el,el._sv);if(k<1)L[j++]=el;}
  L.length=j;SOLDE.on=j>0;if(SOLDE.on)requestAnimationFrame(soldeRoule);}
/* (banc) dbgSolde({banque, course}) : pose le compte et/ou l'argent de la partie, puis rend ce que chaque plaque de SOLDE affiche (texte, corps, bords) */
window.dbgSolde=function(o){o=o||{};if(o.banque!=null){SAVE.d.bank=Math.max(0,+o.banque);try{SAVE.mark();}catch(e){}try{gBankPaint();}catch(e){}try{m2Portes();}catch(e){}}if(o.course!=null)money=Math.max(0,+o.course);
  const q=function(s){const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();return {t:e.textContent,vu:r.width>0,fs:getComputedStyle(e).fontSize,x0:Math.round(r.left),x1:Math.round(r.right)};};
  return {banque:bank(),course:money,gar:q('#gCompteur b'),bq:q('#gBqArg'),gBank:q('#gBank'),fin:q('#mCashTot'),hud:q('#cashHud .chV span'),VPw:VP.w};};
// ---- UNITÉS COMPACTES : « $ 1,4 M » se lit d'un œil, « $ 1 400 000 » est du bruit. Échelle
// longue française (million, milliard, billion, billiard, trillion) — assez folle toute seule.
const UNITS=[[1e30,'Qn','QUINTILLIONS 🛸'],[1e27,'Qd','QUADRILLIARDS'],[1e24,'Q','QUADRILLIONS 🤑'],[1e21,'Td','TRILLIARDS'],[1e18,'T','TRILLIONS 🤯'],[1e15,'Bd','BILLIARDS'],[1e12,'Bn','BILLIONS'],[1e9,'Md','MILLIARDS'],[1e6,'M','MILLIONS'],[1e3,'k','MILLIERS']];
/* (2026-09-28, passe de lancement) L'ÉCHELLE COURTE POUR QUI NE PARLE PAS FRANÇAIS. En anglais on lisait « $ 1,4 Md » (inconnu) et
   « $ 2 Bn » — qu'un Américain lit DEUX MILLIARDS alors que c'est 2×10¹² ici : mille fois faux, sur la grandeur la plus importante
   du jeu. L'anglais compte en k · M · B · T · Qa… avec un POINT décimal ; le français garde son échelle longue. Mêmes
   seuils dans les deux tables (unitSeen les compare) et mêmes pictos aux mêmes crans. */
const UNITS_EN=[[1e30,'No','NONILLIONS 🛸'],[1e27,'Oc','OCTILLIONS'],[1e24,'Sp','SEPTILLIONS 🤑'],[1e21,'Sx','SEXTILLIONS'],[1e18,'Qi','QUINTILLIONS 🤯'],[1e15,'Qa','QUADRILLIONS'],[1e12,'T','TRILLIONS'],[1e9,'B','BILLIONS'],[1e6,'M','MILLIONS'],[1e3,'k','THOUSANDS']];
function unitsL(){return LANG==='fr'?UNITS:UNITS_EN;}
let unitSeen=0; // jamais reset : la 1re traversée d'un ordre de grandeur se fête UNE fois par session
function insec(t){return String(t).replace(/(\S+-\S+)/g,'<i class="nw">$1</i>');} // (2026-09-30, revue des écrans) un mot composé ne se coupe pas à son trait d'union (texte SANS balise seulement)
function fmtC(v){
  v=Math.round(v);const fr=LANG==='fr';
  for(const u of unitsL())if(v>=u[0]*.9995){const q=v/u[0]; /* (2026-09-28) ×.9995 : 999 600 s'écrivait « 1000 k » — c'est « 1 M » */let t=q>=100?String(Math.round(q)):q.toFixed(1).replace(/\.0$/,'');if(fr)t=t.replace('.',',');return fr?CUR()+' '+t+' '+u[1]:CUR()+t+u[1];}
  return CUR()+(fr?' ':'')+v.toLocaleString(LOC()).replace(/[\u202f\u00a0]/g,' '); // (2026-09-29) en anglais, « $1.5k » et « $950 » : l'espace à la française se lisait comme une faute
}
// LE COMPTEUR AU MENU : la seule repeinte vivait DANS la boucle, sous le gate de simulation — au menu
// elle ne tournait jamais et le HUD gardait le « $00000000 » écrit en dur dans le HTML. Tout passe
// désormais par ici (init, départ, reset, changement de langue) : un seul écrivain, plus d'oubli.
function paintMoney(){try{elMoney.innerHTML=fmtGta(money);loop._money=money;}catch(e){}try{cashSnap();}catch(e){}}
/* LE COMPTEUR D'ARGENT DU TÉLÉPHONE (#cashHud, 2026-09-29) — le total de la partie DÉFILE vers `money` (on voit l'argent entrer, comme dans
   GTA), et chaque gain s'additionne dans un « +$ » sous lui tant que ça tombe (1,8 s après le dernier) ; en FRÉNÉSIE il passe à l'or et dit
   « ×3 ». On n'écrit le DOM que quand le texte change. `cashSnap` (via paintMoney : départ, reset, langue) recale sans défilement. */
const CASH={el:null,v:null,d:null,disp:0,last:0,delta:0,dT:0,tv:'',td:'',k:false,kd:false};
function cashTxt(v){v=Math.max(0,v);
  const e=Math.floor(v+1e-6);
  if(v<10&&v-e>.004){const t=v.toFixed(2);return LANG==='fr'?t.replace('.',','):t;} // la mise de départ (1,61) garde ses centimes
  return e.toLocaleString(LOC()).replace(/[\u202f\u00a0]/g,' ');}
function cashSnap(){CASH.disp=money;CASH.last=money;CASH.delta=0;CASH.dT=0;cashEcrit(true);}
function cashEcrit(force){
  const e=CASH.el||(CASH.el=document.getElementById('cashHud'));if(!e)return;
  if(!CASH.v){CASH.v=e.querySelector('.chV span');CASH.d=null;} /* (2026-10-14, Sacha) le « +$ » sous le total est ÉTEINT (le « +1 » flotte à côté de la caisse, piece1Plus) : CASH.d nul = plus aucune écriture */
  const kv=Math.round(CASH.disp*100); // (débogage 29/09) on ne FORMATE que si la valeur affichée a bougé d'un centime : cashTxt (toLocaleString) tournait à chaque image
  if(force||kv!==CASH.kv){CASH.kv=kv;const t=cashTxt(CASH.disp);if(force||t!==CASH.tv){CASH.tv=t;CASH.v.textContent=t;if(CASH.vn!==t.length){CASH.vn=t.length;if(document.body.classList.contains('play'))soldeFit(CASH.v,VP.w*.58);}}}
  if(!CASH.d)return;
  const vu=CASH.dT>0&&CASH.delta>0;
  if(vu){const x3=FLOW.lv===4,kd=Math.round(CASH.delta*100)*2+(x3?1:0);
    if(kd!==CASH.kd2){CASH.kd2=kd;const td='+$ '+cashTxt(CASH.delta)+(x3?' ×3':'');if(td!==CASH.td){CASH.td=td;CASH.d.textContent=td;}}
    if(x3!==CASH.d.classList.contains('x3'))CASH.d.classList.toggle('x3',x3);}
  if(vu!==CASH.d.classList.contains('vu'))CASH.d.classList.toggle('vu',vu);
}
/* LA COLONNE DE DROITE S'EMPILE (2026-09-30, voir <style id="hudOrdre">) : ce qui est VISIBLE, dans l'ordre, sous le ⏸, à 8 px l'un de
   l'autre — ce qui est caché ne laisse pas de trou. Un bloc rétréci par `zoom` reçoit un `top` divisé par son zoom (zK), mesuré à l'écran
   (zRect.leg : l'ancien WebKit rend les boîtes divisées par le zoom). Couché, l'emblème DARK TRIAD garde sa place en haut au milieu (la
   colonne n'a pas la hauteur). Dix fois par seconde. */
const HUDCOL={t:0,els:null,p:[]};
/* (2026-10-14, passe mobile) LIRE D'ABORD, ÉCRIRE ENSUITE — et en TÊTE d'image. MESURÉ (profil, téléphone émulé, processeur ×4) : c'était
   la fonction la plus lourde du jeu (8 % du processeur en course). Appelée APRÈS que le HUD de l'image avait écrit ses styles, chaque
   lecture (getComputedStyle, getBoundingClientRect) forçait un recalcul complet des styles — et chaque `top` écrit dans la boucle salissait
   tout pour la lecture suivante (jusqu'à six recalculs par passage, dix fois par seconde : une image sur six payait l'addition).
   Désormais : appelée en tête de `loop` (les styles sont encore propres : le navigateur vient de peindre l'image d'avant), toutes les
   lectures d'un bloc, puis les écritures — seulement celles qui changent. La colonne suit avec une image de retard : invisible.
   (2026-10-17, HUD-MESURE) …mais même en tête d'image, la première lecture forçait encore tout (le HUD est resali entre deux images) :
   la mesure ne tourne plus ici, elle tombe JUSTE APRÈS la mise en page de l'image, là où lire ne coûte rien — voir apresMiseEnPage. */
function hudColonne(dt){
  HUDCOL.t-=dt;if(HUDCOL.t>0)return;HUDCOL.t=.1;
  apresMiseEnPage(hudColMesure,true);
}
function hudColMesure(){ // la mesure d'avant, à l'identique
  if(!(TCTL.on&&running&&!paused&&!gameOver))return; // (le rappel tombe en fin d'image : la partie a pu s'arrêter entre-temps)
  if(!HUDCOL.els)HUDCOL.els=['cashHud','triade','airHud','pwrChip','campChip'].map(function(i){return document.getElementById(i);});
  const pay=VP.w>VP.h,g=document.getElementById('tGear'),P=HUDCOL.p; // VP et non innerWidth : lire innerWidth force une mise en page (voir VP)
  let y=g?zRect(g).bottom+10:66;P.length=0;
  if(document.body.classList.contains('coOn')){const co=document.getElementById('coach');if(co){const rc=co.getBoundingClientRect();if(rc.height>0)y=Math.max(y,rc.bottom+8);}} // (2026-10-14, vérif P1, mesuré au banc) pendant l'AUTO-ÉCOLE la colonne commence SOUS la carte du coach : la plaque de pouvoir se posait dessous (y 113 pour une carte 109-202 debout, 66 pour 62-108 couché)
  for(const e of HUDCOL.els){if(!e||(pay&&e.id==='triade'))continue;
    const cs=getComputedStyle(e);if(cs.display==='none'||cs.visibility==='hidden')continue;
    const z=parseFloat(cs.zoom)||1,r=e.getBoundingClientRect();if(zRect.leg===undefined)zRect(e);const h=r.height*(zRect.leg?z:1);if(h<2)continue;
    P.push(e,+(y/z).toFixed(1)+'px');y+=h+8;} // (2026-10-17) « 113px » et non « 113.0px » : le navigateur relit la forme courte, la comparaison d'en dessous réécrivait sinon le même `top` à chaque passage
  for(let i=0;i<P.length;i+=2){const e=P[i],t=P[i+1];if(e.style.getPropertyValue('top')!==t||e.style.getPropertyPriority('top')!=='important')e.style.setProperty('top',t,'important');}
  P.length=0;
}
/* LIRE APRÈS LA MISE EN PAGE (2026-10-17, HUD-MESURE — Sacha : « alléger le jeu pour l'App Store, surtout des coupes pour la fluidité »).
   MESURÉ (téléphone émulé 390×844, processeur bridé ×4, 12 s de course, édition App Store) : getBoundingClientRect ≈ 600-720 ms de temps
   propre, ~5-6 % du fil principal, presque tout via hudColonne (son premier rectangle, le ⚙, par zRect) et volgTick. Ce n'est pas la
   lecture qui coûte, c'est ce qu'elle FORCE : entre deux images le HUD est resali (ses animations avancent, des minuteries écrivent), donc
   le premier rectangle demandé refait les styles et la mise en page sur-le-champ — et le navigateur les refait une deuxième fois, après
   les écritures de l'image, pour peindre. Dix fois par seconde.
   Relire « seulement quand une hauteur change » ne suffisait pas : la colonne dépend aussi de ce qu'aucune taille ne dit (un
   `visibility:hidden` posé par une classe du <body>, un `transform` qui glisse ou rétrécit un bloc, le ⚙ qui entre en course). Compté au
   banc sur 20 s de course debout : 14 changements de taille, contre 30 classes du <body>, 29 du compteur, ~20 transitions sur la colonne.
   Donc les MÊMES lectures, au même rythme, déplacées au seul instant où elles sont gratuites : juste APRÈS la mise en page que le
   navigateur fait de toute façon avant de peindre (styles et boîtes à jour : lire ne force plus rien). Le moyen : un TÉMOIN invisible
   observé par un ResizeObserver — on change sa largeur, le navigateur rappelle l'observateur après sa mise en page, dans la même image.
   Si une écriture suit (un `top` qui change), seule la boîte déplacée se refait. Les lectures passent d'abord, les écritures (`ecrit`)
   ensuite : une écriture ne resalit pas la lecture d'à côté. Sans ResizeObserver (très vieux WebKit) : fn tout de suite, comme avant. */
const MEP={el:null,ro:null,l:[],e:[],k:0,att:false,tA:0};
function apresMiseEnPage(fn,ecrit){
  if(!MEP.ro){if(!window.ResizeObserver||!document.body){fn();return;}
    try{const t=document.createElement('div');t.id='mepTemoin';t.setAttribute('aria-hidden','true');
      t.style.cssText='position:fixed;left:0;top:0;width:1px;height:1px;visibility:hidden;pointer-events:none;contain:strict';
      document.body.appendChild(t);MEP.el=t;MEP.ro=new ResizeObserver(mepRappel);MEP.ro.observe(t);}catch(x){MEP.ro=null;fn();return;}}
  const q=ecrit?MEP.e:MEP.l;if(q.indexOf(fn)<0)q.push(fn);
  if(!MEP.el.isConnected)document.body.appendChild(MEP.el); // (si un écran a vidé le <body>, le témoin revient)
  const now=performance.now();if(MEP.att&&now-MEP.tA<1000)return; // déjà demandé pour cette image (un rappel perdu se redemande au bout d'1 s)
  MEP.att=true;MEP.tA=now;MEP.k=(MEP.k+1)%8;MEP.el.style.width=(1+MEP.k)+'px'; // le témoin change de taille : l'observateur sera rappelé
}
function mepRappel(){
  MEP.att=false;const l=MEP.l,e=MEP.e;if(!l.length&&!e.length)return;MEP.l=[];MEP.e=[];
  for(const f of l.concat(e))try{f();}catch(x){if(!MEP.w){MEP.w=1;console.warn('mesure après mise en page · '+(f.name||'?'),x);}} // une panne se dit UNE fois, la suivante tourne quand même
}
/* LES « :has() » DU HUD DEVENUS DES CLASSES DU <body> (2026-10-14, passe mobile — « jouer en NETTE sans que ça bug, pour tout le monde »).
   MESURÉ (téléphone émulé, micro-banc : une seule écriture de style sur un seul élément, puis sa lecture) : ~500 µs par écriture
   sur le Mac du banc — 6 µs sans la règle `body:has(#airPie[style*="block"]) #facVies`. Pour un `:has()` qui regarde l'attribut
   `style`, le navigateur ne sait pas QUI peut le faire changer : CHAQUE style écrit n'importe où (le HUD en écrit des dizaines par image)
   relance l'examen du <body> et le recalcul d'une trentaine de blocs du HUD visés par ces règles ; les `:has(#x.on)` faisaient de même à
   chaque classe `on` posée ou ôtée ailleurs (flash, annonce, gerbe…). En course, au processeur ralenti ×4 (un téléphone modeste), le
   recalcul des styles prenait le TIERS du fil principal. Désormais l'état se lit à la SOURCE : un observateur sur ces sept éléments-là
   pose la classe sur le <body> (`hTp` · `hMisBan` · `hCampChip` · `hTriade` · `hAirPie` · `hPwr`) quand — et seulement
   quand — il change. Dans le CSS, `:has(#tPanel.open)` est devenu `.hTp:not(#ccH)` : le `:not(#ccH)` (aucun élément ne porte cet id)
   garde EXACTEMENT la spécificité de l'ancien `:has(#…)` (un id + une classe) — la cascade ne bouge pas d'un iota.
   ⚠ Une nouvelle règle qui veut « le HUD quand X est allumé » : une classe de plus ici, pas un `body:has(…)`. */
const HAS_D=[['hTp','tPanel',function(e){return e.classList.contains('open');}],['hMisBan','misBan',function(e){return e.classList.contains('on');}],
  ['hCampChip','campChip',function(e){return e.classList.contains('on');}],
  ['hTriade','triade',function(e){return e.classList.contains('on');}],['hAirPie','airPie',function(e){return (e.getAttribute('style')||'').indexOf('block')>=0;}],
  ['hPwr','pwrChip',function(e){return !!e.querySelector('.pw');}],
  /* (2026-10-20, Sacha : « beaucoup de freeze et de latence sur la version vercel ») LA FENÊTRE QUITTER / RECOMMENCER : `html:not(.c6):has(#modale.on)
     #tPanel` (ux8, 14/10) avait échappé à la passe. MESURÉ en ligne (trace Chrome des invalidations, 25 s de course) : ~60 fois par seconde
     une classe `on` posée ou ôtée ailleurs dans le HUD relançait l'examen du <html> — tout le document parcouru à chaque image. */
  ['hModale','modale',function(e){return e.classList.contains('on');}]];
const HAS_H={k:{},el:{},obs:null};
function hasMaj(){const b=document.body;if(!b)return;
  if(!HAS_H.obs)HAS_H.obs=new MutationObserver(hasMaj);
  for(const d of HAS_D){const e=document.getElementById(d[1]),v=!!(e&&d[2](e));
    if(HAS_H.k[d[0]]!==v){HAS_H.k[d[0]]=v;b.classList.toggle(d[0],v);}
    if(e&&HAS_H.el[d[1]]!==e){HAS_H.el[d[1]]=e;const sous=d[1]==='pwrChip'; // #pwrChip : ses plaques (.pw) naissent et meurent dedans
      HAS_H.obs.observe(e,sous?{attributes:true,attributeFilter:['class'],childList:true,subtree:true}:{attributes:true,attributeFilter:[d[1]==='airPie'?'style':'class']});}}}
hasMaj();
function cashHudTick(dt){
  const m=money;
  if(m<CASH.last-.001){cashSnap();return;} // l'argent a DIMINUÉ (nouvelle partie) : on recale sans défiler
  if(m>CASH.last+.001){const g=m-CASH.last;CASH.last=m;CASH.delta=(CASH.dT>0?CASH.delta:0)+g;CASH.dT=1.8;
    const e=CASH.el||(CASH.el=document.getElementById('cashHud'));
    if(e){CASH.k=!CASH.k;e.classList.remove(CASH.k?'b1':'b2');e.classList.add(CASH.k?'b2':'b1'); // le total FRAPPE (deux jumelles : relance sans remise en page)
      if(CASH.d){CASH.kd=!CASH.kd;CASH.d.classList.remove(CASH.kd?'t1':'t2');CASH.d.classList.add(CASH.kd?'t2':'t1');}}}
  if(CASH.dT>0)CASH.dT=Math.max(0,CASH.dT-dt);
  const ec=m-CASH.disp;CASH.disp=ec<.01?m:CASH.disp+ec*Math.min(1,dt*7); // le DÉFILEMENT : rapide, puis il se pose
  cashEcrit(false);
}
// LA FICHE DE CAISSE : même histoire. Le cache ne regardait que `level` — or depuis que la voiture est
// COSMÉTIQUE, `level` ne bouge plus en partie et c'est le PALIER MOTEUR qui pilote la valeur des
// pièces. La clé porte donc les deux : le nom et le « pièces de X » se rafraîchissent enfin.
// ⚠ CE PANNEAU EST MASQUÉ (`#carInfo{display:none!important}`, choix « HUD épuré » en tête de CSS) :
// rien de ce qui est écrit ici n'apparaît à l'écran aujourd'hui. On le tient quand même à jour pour
// qu'il soit juste le jour où on le rallume — la vignette moteur est la fiche VISIBLE, elle.
// La 2e ligne parle du MOTEUR et non plus d'un « NIVEAU X / 24 » : le numéro de caisse n'est plus une
// progression depuis qu'on choisit sa carrosserie au garage, il ne veut plus rien dire.
function paintCarHud(){
  const k=level+'|'+engTier+'|'+ECOD.k; // (2026-10-14, GAMEPLAY) + le relèvement du début : la valeur de la pièce change avec lui
  if(paintCarHud._k===k)return;
  paintCarHud._k=k;
  try{
    const E=ENGINE_TIERS[engTier]||ENGINE_TIERS[0];
    elName.textContent=TR(CARS[level].name);
    elLvl.textContent=TR(E.n)+' — '+TR('PALIER')+' '+(engTier+1)+' / '+ENGINE_TIERS.length+' · '+TR('pièces de ')+fmtC(denom()*5);
    elCp.textContent=engTier>=ENGINE_TIERS.length-1?TR('MOTEUR MAX'):(ENGINE_TIERS[engTier+1].coins-coinsGot)+' '+TR('PIÈCES');
  }catch(e){}
}
const envCvs=[]; // les 6 canvases du cube env — gardés pour être REPEINTS par les biomes
function paintEnv(stops,s1,s2){ // stops=[[pos,'#hex'],…] + 2 strips néon [r,g,b,alpha]
  /* (2026-09-26, audit rendu) LES SIX FACES ÉTAIENT IDENTIQUES — le même dégradé vertical partout, y compris sur le plafond et le sol
     du cube : un toit reflétait un horizon, et toutes les facettes d'une caisse low-poly renvoyaient la même chose. Désormais :
     les 4 côtés gardent le dégradé et les néons, le HAUT (+Y) est le zénith, le BAS (−Y) un sol sombre, et la face tournée vers le
     soleil porte un point chaud. Même coût (6 canvas 64², repeints au changement de biome seulement). */
  const zen=stops[0][1],sol=stops[stops.length-1][1],sunF=Math.abs(SUN_DIR.x)>Math.abs(SUN_DIR.z)?(SUN_DIR.x>0?0:1):(SUN_DIR.z>0?4:5);
  /* (2026-09-26, vague 2) L'ÉCLAT SUIT LA SOURCE DU NIVEAU. Il était peint BLANC et large (rayon 12/64 ≈ 17° de ciel) dans tous les
     biomes : la nuit, en ville (pas de soleil — la source, c'est le néon), chaque lunette arrière portait une BOULE blanche qui passait au
     bloom, une vitre qui émet. Désormais : le jour se mesure à la bande d'horizon du biome (la clé .58) ; de jour, l'éclat reste l'éclat
     chaud du soleil, resserré (rayon 7 ≈ 10°) ; la nuit il prend la couleur du NÉON du biome (1re bande) et baisse de moitié. */
  let jour=0;{const h9=(stops.find(function(s){return s[0]>=.58;})||stops[stops.length-1])[1],n9=parseInt(h9.slice(1),16);
    const l9=(.3*(n9>>16&255)+.59*(n9>>8&255)+.11*(n9&255))/255;jour=Math.min(1,Math.max(0,(l9-.35)/.45));}
  const ecl=function(a){const r=Math.round(s1[0]+(255-s1[0])*jour),g=Math.round(s1[1]+(246-s1[1])*jour),b=Math.round(s1[2]+(226-s1[2])*jour);
    return 'rgba('+r+','+g+','+b+','+(a*(.5+.5*jour)).toFixed(3)+')';};
  envCvs.forEach(function(cv,f){if(cv.width!==64)cv.width=cv.height=64; // (2026-10-20) le studio (finition.js) le passe en 256²
    const c=cv.getContext('2d');
    if(f===2){c.fillStyle=zen;c.fillRect(0,0,64,64);return;}                                          // +Y : le zénith
    if(f===3){c.fillStyle=sol;c.fillRect(0,0,64,64);c.fillStyle='rgba(0,0,0,.45)';c.fillRect(0,0,64,64);return;} // −Y : le sol, assombri
    const gr=c.createLinearGradient(0,0,0,64);
    for(const st of stops)gr.addColorStop(st[0],st[1]);
    c.fillStyle=gr;c.fillRect(0,0,64,64);
    c.fillStyle='rgba('+s1[0]+','+s1[1]+','+s1[2]+','+s1[3]+')';c.fillRect(0,20,64,3);
    c.fillStyle='rgba('+s2[0]+','+s2[1]+','+s2[2]+','+s2[3]+')';c.fillRect(0,30,64,2);
    if(f===sunF){const h=c.createRadialGradient(32,27,0,32,27,7);h.addColorStop(0,ecl(1));h.addColorStop(.3,ecl(.62));h.addColorStop(1,ecl(0));c.fillStyle=h;c.fillRect(0,0,64,64);} // le soleil rasant (vague 2 : resserré, teinté par la source du niveau — voir `ecl`) — (2026-09-26) un cœur NET et court : avec le vernis, sur une vitre ou un toit, c'est un ÉCLAT de soleil, plus une tache blanche molle
  });
  envTex.needsUpdate=true;
  /* (2026-10-20, Léo : « voiture aussi belle dans le jeu que dans la boutique, et ciel obligé ») LA FINITION EN COURSE : le ciel de CHAQUE niveau (ville,
     orbite, grotte… compris : il y a toujours un ciel à refléter) est repeint en reflets NETS (256², bandes de lumière, voir paintEnvMenu) et la caisse
     prend le vernis profond, dosé par le jour du niveau. REQUIN (FSTU_SANS) et `?finition=ancien` gardent le ciel d'avant. */
  try{if(FSTU.on&&!garageOn&&!FSTU_SANS[carGroup.userData.shape]){paintEnvMenu({env:stops,eS1:s1,eS2:s2,sunHalo:(BIO&&BIO.to&&BIO.to.sunHalo!=null?BIO.to.sunHalo:1)});finLaque('menu');}else{FSTU.env='ciel';finLaque(false);}}catch(e){try{FSTU.env='ciel';finLaque(false);}catch(e2){}} // (2026-10-20) le ciel d'un niveau ou du menu : la caisse reprend son vernis de course (la finition studio, finition.js, n'est que pour le garage) — au chargement la finition n'existe pas encore : rien à rendre
}
/* L'ATELIER DANS LA LAQUE (2026-09-26) — au garage, la carrosserie reflétait le CIEL de la dernière course (un couchant violet dans
   un atelier fermé) : des reflets sans rapport avec la pièce, mous, sans une arête. Le cube est repeint en STUDIO : plafond noir
   rayé des TUBES blancs de l'atelier, murs sombres, une bande CHAUDE (la clé) et une bande CYAN (le contre-jour) à hauteur de caisse,
   la porte relevée sur la nuit et son liseré rose. Ce sont ces arêtes franches qui font lire « laque » sur une facette plane : le
   reflet COURT sur la tôle quand la caméra tourne. Posé à l'entrée (openGarage), le ciel du biome est rendu à la sortie
   (closeGarage). Même coût que paintEnv : 6 canvas 64², une fois. */
function paintEnvAtelier(){try{FSTU.env='atelier';}catch(e){}
  envCvs.forEach(function(cv,f){if(cv.width!==64)cv.width=cv.height=64;
    const c=cv.getContext('2d');
    if(f===2){ // +Y : le plafond et ses tubes (un halo, puis le tube net)
      c.fillStyle='#06070b';c.fillRect(0,0,64,64);
      for(const y of [9,25,41,57]){const g=c.createLinearGradient(0,y-6,0,y+6);
        g.addColorStop(0,'rgba(255,240,215,0)');g.addColorStop(.5,'rgba(255,240,215,.30)');g.addColorStop(1,'rgba(255,240,215,0)');
        c.fillStyle=g;c.fillRect(3,y-6,58,12);c.fillStyle='#fff7ea';c.fillRect(5,y-1,54,2);}
      return;}
    if(f===3){c.fillStyle='#0d0f14';c.fillRect(0,0,64,64);return;}                                   // −Y : le béton, dans l'ombre
    const gr=c.createLinearGradient(0,0,0,64);                                                        // les murs : sombres, un ton au-dessus du sol
    gr.addColorStop(0,'#08090d');gr.addColorStop(.28,'#1a1e28');gr.addColorStop(.47,'#2b313d');gr.addColorStop(.5,'#12151b');gr.addColorStop(1,'#0a0b0f');
    c.fillStyle=gr;c.fillRect(0,0,64,64);
    if(f===4){ // la PORTE RELEVÉE : (2026-09-29) elle BRÛLE (le rideau de flammes) — la laque prend le reflet du feu, pas de la nuit
      const n=c.createLinearGradient(0,6,0,32);n.addColorStop(0,'#0c0507');n.addColorStop(.5,'#1e0708');n.addColorStop(.78,'#6a160c');n.addColorStop(1,'#c4561a'); // (Léo, « le reflet en général ») les flammes ne montent plus qu'à mi-porte : la laque n'en prend que le bas, plus sombre
      c.fillStyle=n;c.fillRect(10,6,44,26);return;}
    const chaud=(f===0||f===5);                                                                       // deux murs portent la CLÉ chaude, deux le contre-jour cyan
    const b=c.createLinearGradient(0,14,0,28);
    b.addColorStop(0,chaud?'rgba(255,214,160,0)':'rgba(110,210,255,0)');b.addColorStop(.5,chaud?'rgba(255,226,184,.95)':'rgba(130,220,255,.75)');
    b.addColorStop(1,chaud?'rgba(255,214,160,0)':'rgba(110,210,255,0)');
    c.fillStyle=b;c.fillRect(chaud?6:12,14,chaud?52:40,14);
    c.fillStyle=chaud?'#fff3de':'#d8f4ff';c.fillRect(chaud?9:16,20,chaud?46:32,2);                    // le cœur de la boîte à lumière : une arête nette
  });
  envTex.needsUpdate=true;
}
const envTex=(function(){ // le ciel réfléchi par les carrosseries — repeint à chaque changement de biome
  for(let i=0;i<6;i++){const cv=document.createElement('canvas');cv.width=cv.height=64;envCvs.push(cv);}
  const t=new THREE.CubeTexture(envCvs);return t;
})();
