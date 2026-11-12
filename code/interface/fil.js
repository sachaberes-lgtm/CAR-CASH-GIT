/* ===== LE FIL (2026-10-25, Sacha : « alléger visuellement le jeu, surtout le milieu, pour TikTok : un seul système qui donne l'impression
   d'avoir accompli quelque chose sans prendre l'écran ») — spec : docs/superpowers/specs/2026-10-25-le-fil-design.md =====
   UNE pastille, sous le compteur d'aura (dans #auraV2 : elle suit la place du compteur sur PC comme sur téléphone), qui remplace les
   textes jaillis de la caisse (`popTexte` devient un alias), le verdict de pose, la grande annonce des gestes, la ligne du HUD des figures.
   · UNE ligne, remplacée à chaque annonce (la règle de priorité de popTexte est gardée : un temps fort ne se fait pas voler la vedette
     dans les 650 ms) ;
   · les annonces qui tombent dans la même seconde FUSIONNENT : « TONNEAU · SALTO AVANT +60 » au lieu de deux textes ;
   · niveau 0 geste · 1 palier · 2 temps fort · 3 impact : le 3 grossit la pastille et allume les bords (flashEcran) — jamais au centre.
   `?fil=0` rend l'ancien affichage. Console : `dbgLeFil(txt,niv)` pour en forcer une. */
const LEFIL={on:!/[?&]fil=0\b/.test(location.search),muet:!/[?&]fil=1\b/.test(location.search),el:null,parts:[],cols:[],niv:0,t:0,p:0,pt:0,k:false,fen:1100};
try{document.documentElement.classList.toggle('fil',LEFIL.on);}catch(e){}
function filEl(){
  if(LEFIL.el&&LEFIL.el.isConnected)return LEFIL.el;
  const h=document.getElementById('auraV2');if(!h)return null;
  const e=document.createElement('div');e.id='fil';e.setAttribute('aria-hidden','true');document.body.appendChild(e);LEFIL.el=e;return e; /* (2026-11-05) dans <body> : en bas au centre, plus sous le compteur d'aura */
}
function filBase(s){return String(s).replace(/\s*[+×]\s*[\d.,$].*$/,'').trim();} /* le nom du geste, sans ses points ni son × */
function fil(txt,col,niv,fig){ /* fig : un NOM DE FIGURE (filFig, le combo à trois) — le seul qui parle sous le HUD léger */
  if(!LEFIL.on)return false;
  /* (2026-11-12, Sacha : « plus les étiquettes en bas au milieu de l'écran ») LE HUD LÉGER : le fil se TAIT — il répond « dit » (les anciens textes du milieu ne reviennent pas), n'écrit rien, ne relance aucune animation ; le temps fort garde l'éclat des bords. `?fil=1` le rallume. */
  /* (2026-11-12, Sacha : « remets le nom des figures en plus petit, juste la couleur de leur rareté, dans le même style qu'avant mais en mieux ») les NOMS DES FIGURES reparlent ; les verdicts et les gains restent muets */
  if(LEFIL.muet&&!fig){if((niv|0)>=3)try{flashEcran('rgba(255,215,94,.2)');}catch(x){}return true;}
  niv=niv|0;const n9=performance.now();
  if(niv<(LEFIL.p|0)&&n9<LEFIL.pt)return false; /* un temps fort ne se fait pas voler la vedette par un palier dans les 650 ms */
  const e=filEl();if(!e)return false;
  const lb=sansAcc(TR(txt)).replace(/[<>&"]/g,'').trim();if(!lb)return false;
  if(n9-LEFIL.t<LEFIL.fen&&LEFIL.parts.length){ /* même seconde : on fusionne (le dernier mot reste le dernier) */
    const L9=LEFIL.parts.length-1;
    if(filBase(LEFIL.parts[L9])===filBase(lb)){if(lb.length>=LEFIL.parts[L9].length){LEFIL.parts[L9]=lb;LEFIL.cols[L9]=col;}} /* « TONNEAU » puis « TONNEAU +45 » : le même geste, on garde le plus complet */
    else{LEFIL.parts.push(lb);LEFIL.cols.push(col);}
    LEFIL.niv=Math.max(LEFIL.niv,niv);
  }else{LEFIL.parts=[lb];LEFIL.cols=[col];LEFIL.niv=niv;}
  const mx=LEFIL.muet?999:LEFIL.niv>=3?14:LEFIL.niv===2?17:20; /* des caractères que la colonne du compteur porte, selon la taille du niveau — (HUD léger) un nom par ligne : seul le plafond de trois noms compte */
  while(LEFIL.parts.length>3||(LEFIL.parts.length>1&&LEFIL.parts.join(' · ').length>mx)){LEFIL.parts.shift();LEFIL.cols.shift();}
  LEFIL.t=n9;LEFIL.p=niv;LEFIL.pt=n9+650;
  const tx=LEFIL.parts.join(' · ');e.dataset.n=LEFIL.niv;
  if(LEFIL.muet){ /* (HUD léger) chaque nom dans la couleur de SA rareté (avant : toute la ligne à la couleur du dernier) ; un nom long passe à la ligne au lieu de rétrécir sous les 8 px */
    let h9='';for(let i=0;i<LEFIL.parts.length;i++)h9+=(i?'<i>·</i>':'')+'<b style="--fc:'+(LEFIL.cols[i]||'#ffd75e')+'">'+LEFIL.parts[i]+'</b>';e.innerHTML=h9;e.style.setProperty('--sk',1);}
  else{e.textContent=tx;e.style.setProperty('--fc',col||'#ffd75e');
  e.style.setProperty('--sk',tx.length>mx?(mx/tx.length).toFixed(3):1);} /* un nom seul trop long rétrécit au lieu de déborder */
  if(n9-(LEFIL.tk||0)>12){LEFIL.tk=n9;const k9=LEFIL.k=!LEFIL.k;e.classList.remove(k9?'on':'on2');e.classList.add(k9?'on2':'on');} /* deux animations jumelles : relance sans mise en page forcée — (2026-11-12, chasse aux bugs) UNE bascule par image : un nombre PAIR d'annonces dans la même image remettait la classe d'avant, l'animation ne repartait pas et le texte restait invisible */
  if(niv>=3)try{flashEcran('rgba(255,215,94,.2)');}catch(x){}
  return true;
}
const FIL_RAR={commun:'#dfeeff',rare:'#35e6ff',epique:'#ff4fc2',exotique:'#ffc93a',legendaire:'#ff9a3a',combo:'#ffd75e'}; /* la couleur de la rareté d'une figure (celle des pastilles de l'ancien HUD) */
function filFig(t,rp,niv){fil(t,FIL_RAR[rp]||FIL_RAR.commun,niv==null?1:niv,1);}
function filTrick(txt,tier){ /* trickMsg : les verdicts de pose, les figures en vol, les paliers du × — sans emoji, sans la vanne après le tiret */
  const p9=String(txt).replace(/[\u2190-\u2BFF\uD83C-\uDBFF\uDC00-\uDFFF\uFE0F]/g,'').split(' — '),t=(/^×\d/.test(p9[0])?p9.join(' '):p9[0]).replace(/\s{2,}/g,' ').trim();
  if(t)fil(t,tier===3?'#ff3ec8':tier===2?'#ff9ee6':tier===1?'#5ee6ff':'#ffd75e',tier===3||tier===2?3:tier===1?2:1);
}
window.dbgLeFil=function(t,n,rp){if(rp){filFig(t||'TONNEAU',rp,n==null?1:n);return LEFIL.parts.join(' · ');}return fil(t||'TONNEAU +45','#ffd75e',n|0);}; /* (2026-11-12) rp : une rareté (commun rare epique exotique legendaire combo) = un nom de figure */
