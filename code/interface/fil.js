/* ===== LE FIL (2026-10-25, Sacha : « alléger visuellement le jeu, surtout le milieu, pour TikTok : un seul système qui donne l'impression
   d'avoir accompli quelque chose sans prendre l'écran ») — spec : docs/superpowers/specs/2026-10-25-le-fil-design.md =====
   UNE porte pour tout ce que la course annonce, qui remplace les voix du milieu : `popTexte` en est l'alias, le verdict de pose (`trickMsg` →
   `filTrick`), le BOOST et les noms des figures (hud-figures.js) y passent. Niveau 0 geste · 1 palier · 2 temps fort · 3 impact : la règle de
   priorité de popTexte est gardée (un temps fort ne se fait pas voler la vedette dans les 650 ms) ; le 3 allume les bords (flashEcran).
   · LES SILENCES (flux continus : robinets, SLALOM, éclairs vers la nitro, billets) et le recul des anciennes voix du centre (#verdHud, #trickBox,
     #chainHud, le BOOST en grand) tiennent à `LEFIL.on` ; `?fil=0` les rend. Console : `dbgLeFil(txt,niv)` en écrit un.
   · (2026-10-25 soir, Sacha : « les textes sont mis à gauche dans un petit encadré, c'est pas bien : petits, stylisés, qu'ils sortent à côté de la
     voiture, de la vie sans être lourd ») LA PASTILLE sous le compteur d'aura (une ligne fixe, des gestes fusionnés « TONNEAU · SALTO +60 ») est
     PARTIE : la porte garde son rôle et écrit désormais par `jaillit` (mots-jaillissants.js) — chaque mot sort de la caisse, de côté, et s'efface.
     La fusion des annonces d'une même seconde est tombée avec elle (chaque geste a son mot, plafond de 5 à l'écran) ; la taille suit le niveau. */
const LEFIL={on:!/[?&]fil=0\b/.test(location.search),p:0,pt:0};
try{document.documentElement.classList.toggle('fil',LEFIL.on);}catch(e){}
const FIL_TAILLE=[1,1,1.15,1.3]; /* le corps du mot selon son niveau : un temps fort ou un impact grossit, jamais au point de couvrir la route */
function fil(txt,col,niv,o){ /* o : {rp,dir,k} — la rareté d'une figure, le côté de son geste, un facteur de taille ; rend la largeur du mot, 0 s'il n'est pas écrit */
  niv=niv|0;const n9=performance.now();
  if(niv<(LEFIL.p|0)&&n9<LEFIL.pt)return 0; /* un temps fort ne se fait pas voler la vedette par un palier dans les 650 ms */
  o=o||{};
  const W=jaillit(TR(txt),{c:col||o.c,rp:o.rp,dir:o.dir,k:(o.k||1)*FIL_TAILLE[Math.min(3,niv)]});
  if(!W)return 0;
  LEFIL.p=niv;LEFIL.pt=n9+650;
  if(niv>=3)try{flashEcran('rgba(255,215,94,.2)');}catch(x){}
  return W;
}
function filFig(t,rp,niv,dir){return fil(t,null,niv==null?1:niv,{rp:rp,dir:dir});} /* le nom d'une figure : la couleur et la police de sa rareté (v5) */
function filTrick(txt,tier){ /* trickMsg : les verdicts de pose, les figures en vol, les paliers du × — sans emoji, sans la vanne après le tiret */
  const p9=String(txt).replace(/[←-⯿\uD83C-􏰀-\uDFFF️]/g,'').split(' — '),t=(/^×\d/.test(p9[0])?p9.join(' '):p9[0]).replace(/\s{2,}/g,' ').trim();
  if(t)fil(t,tier===3?'#ff3ec8':tier===2?'#ff9ee6':tier===1?'#5ee6ff':'#ffd75e',tier===3||tier===2?3:tier===1?2:1);
}
window.dbgLeFil=function(t,n){return fil(t||'TONNEAU +45','#ffd75e',n|0);};
