/* ===== LE FIL (2026-10-25, Sacha : « alléger visuellement le jeu, surtout le milieu, pour TikTok : un seul système qui donne l'impression
   d'avoir accompli quelque chose sans prendre l'écran ») — spec : docs/superpowers/specs/2026-10-25-le-fil-design.md =====
   UNE pastille, sous le compteur d'aura (dans #auraV2 : elle suit la place du compteur sur PC comme sur téléphone), qui remplace les
   textes jaillis de la caisse (`popTexte` devient un alias), le verdict de pose, la grande annonce des gestes, la ligne du HUD des figures.
   · UNE ligne, remplacée à chaque annonce (la règle de priorité de popTexte est gardée : un temps fort ne se fait pas voler la vedette
     dans les 650 ms) ;
   · les annonces qui tombent dans la même seconde FUSIONNENT : « TONNEAU · SALTO AVANT +60 » au lieu de deux textes ;
   · niveau 0 geste · 1 palier · 2 temps fort · 3 impact : le 3 grossit la pastille et allume les bords (flashEcran) — jamais au centre.
   `?fil=0` rend l'ancien affichage. Console : `dbgLeFil(txt,niv)` pour en forcer une. */
const LEFIL={on:!/[?&]fil=0\b/.test(location.search),el:null,parts:[],niv:0,t:0,p:0,pt:0,k:false,fen:1100};
try{document.documentElement.classList.toggle('fil',LEFIL.on);}catch(e){}
function filEl(){
  if(LEFIL.el&&LEFIL.el.isConnected)return LEFIL.el;
  const h=document.getElementById('auraV2');if(!h)return null;
  const e=document.createElement('div');e.id='fil';e.setAttribute('aria-hidden','true');h.appendChild(e);LEFIL.el=e;return e;
}
function filBase(s){return String(s).replace(/\s*[+×]\s*[\d.,$].*$/,'').trim();} /* le nom du geste, sans ses points ni son × */
function fil(txt,col,niv){
  if(!LEFIL.on)return false;
  niv=niv|0;const n9=performance.now();
  if(niv<(LEFIL.p|0)&&n9<LEFIL.pt)return false; /* un temps fort ne se fait pas voler la vedette par un palier dans les 650 ms */
  const e=filEl();if(!e)return false;
  const lb=sansAcc(TR(txt)).replace(/[<>&"]/g,'').trim();if(!lb)return false;
  if(n9-LEFIL.t<LEFIL.fen&&LEFIL.parts.length){ /* même seconde : on fusionne (le dernier mot reste le dernier) */
    const L9=LEFIL.parts.length-1;
    if(filBase(LEFIL.parts[L9])===filBase(lb)){if(lb.length>=LEFIL.parts[L9].length)LEFIL.parts[L9]=lb;} /* « TONNEAU » puis « TONNEAU +45 » : le même geste, on garde le plus complet */
    else LEFIL.parts.push(lb);
    LEFIL.niv=Math.max(LEFIL.niv,niv);
  }else{LEFIL.parts=[lb];LEFIL.niv=niv;}
  while(LEFIL.parts.length>3||(LEFIL.parts.length>1&&LEFIL.parts.join(' · ').length>30))LEFIL.parts.shift(); /* la pastille tient dans la colonne du compteur */
  LEFIL.t=n9;LEFIL.p=niv;LEFIL.pt=n9+650;
  e.textContent=LEFIL.parts.join(' · ');e.style.setProperty('--fc',col||'#ffd75e');e.dataset.n=LEFIL.niv;
  const k9=LEFIL.k=!LEFIL.k;e.classList.remove(k9?'on':'on2');e.classList.add(k9?'on2':'on'); /* deux animations jumelles : relance sans mise en page forcée */
  if(niv>=3)try{flashEcran('rgba(255,215,94,.2)');}catch(x){}
  return true;
}
const FIL_RAR={commun:'#dfeeff',rare:'#35e6ff',epique:'#ff4fc2',exotique:'#ffc93a',legendaire:'#ff9a3a',combo:'#ffd75e'}; /* la couleur de la rareté d'une figure (celle des pastilles de l'ancien HUD) */
function filFig(t,rp,niv){fil(t,FIL_RAR[rp]||FIL_RAR.commun,niv==null?1:niv);}
function filTrick(txt,tier){ /* trickMsg : les verdicts de pose, les figures en vol, les paliers du × — sans emoji, sans la vanne après le tiret */
  const p9=String(txt).replace(/[\u2190-\u2BFF\uD83C-\uDBFF\uDC00-\uDFFF\uFE0F]/g,'').split(' — '),t=(/^×\d/.test(p9[0])?p9.join(' '):p9[0]).replace(/\s{2,}/g,' ').trim();
  if(t)fil(t,tier===3?'#ff3ec8':tier===2?'#ff9ee6':tier===1?'#5ee6ff':'#ffd75e',tier===3||tier===2?3:tier===1?2:1);
}
window.dbgLeFil=function(t,n){return fil(t||'TONNEAU +45','#ffd75e',n|0);};
