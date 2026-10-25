/* ===== LES MOTS QUI JAILLISSENT (2026-10-25, Sacha : « RACCOURCI, BUMP, SALTO, TAIL WHIP, MIRACLE, +21 KM/H, BIG AIR… tous ces textes sont mal
   affichés, à gauche dans un petit encadré. Il faut qu'ils soient écrits et stylisés en petit, qu'ils sortent à côté de la voiture. Ça doit donner de
   la vie au jeu plutôt qu'afficher le score à un endroit précis — sans être trop lourd visuellement, pour des TikTok satisfaisants, comme Alto's
   Odyssey : très discret, juste un peu d'âme ») =====
   AVANT : trois endroits fixes — le grand nom des figures en haut (#fh), ses plaquettes à côté de NITRO (#fhLeg), l'unique ligne au-dessus de la
   caisse (#popTxt) — plus la carte de la chaîne d'aura (× N) à gauche. UNE voix à la fois, et elle se lisait comme un tableau de bord.
   MAINTENANT : un mot naît DANS la caisse, est éjecté de côté (sur un arc court, d'un côté puis de l'autre, du côté du geste pour un tail whip),
   se pose un instant et s'éteint. Rien ne reste à l'écran : la route et la caisse gardent la vedette.
   · `jaillit(txt,o)` est le seul point d'ÉCRITURE ; LE FIL (fil.js, la porte unique des annonces de course : sa priorité, ses niveaux, ses silences) y mène
     tout — popTexte (les « RACCOURCI +120 M », « +21 KM/H », « MIRACULÉ ! »…), le verdict de pose, le BOOST et les noms de figure (dans leur rareté :
     couleur et police du v5). Rend la largeur estimée du mot (px), 0 s'il n'est pas écrit.
   · LE MOT : « BIG AIR +50 » est coupé en un nom et un gain ; le gain s'écrit plus petit et plus pâle derrière. Taille : celle des anciens textes de
     figure (≈ 10-12 px) — un cran sous les annonces. Contour d'encre d'un pixel (lisible sur le sable comme sur la nuit), halo doux de sa couleur.
   · LE GESTE : il sort de la caisse (échelle .45 → 1,18 en 150 ms), file vers sa place en s'amortissant, tient, puis s'élève de 10 px en
     s'éteignant (≈ 1,1 s). Un trait de sa couleur se tire dessous (figures). Transform + opacity seulement (pas de mise en page, pas de peinture
     animée) ; 6 éléments recyclés, jamais plus de 5 vivants : le plus ancien est écourté.
   · LA PLACE : le point d'ancrage est la caisse À L'ÉCRAN — les huit coins de sa boîte (les dimensions de sa fiche) projetés : on mesure sa largeur
     VISIBLE (le pare-chocs, plus près de la caméra que le centre, est plus large) et son toit. Le mot se pose à côté, son bord contre le flanc, à
     hauteur de toit ; deux côtés, et jusqu'à trois étages par côté (un mot qui arrive pendant que le précédent vit monte d'un cran) ; le côté
     est celui du geste, sinon le moins chargé, sinon l'autre si le mot n'y tient pas — et AU-DESSUS du toit quand aucun côté ne suffit (une
     caisse qui remplit l'écran debout). Borné aux bords de l'écran. Jamais SOUS la caisse : c'est la réception qu'on vise.
   · « RÉDUIRE LES ANIMATIONS » : le mot s'allume sur place, sans trajet.
   `?mots=0` : sans mots (banc de perf). `dbgJl()` : l'état (le dernier mot, ceux qui vivent). */
const JAIL={el:null,pool:[],vivants:[],cote:1,der:'',derT:0,off:/[?&]mots=0\b/.test(location.search),vect:new THREE.Vector3(),droite:new THREE.Vector3()};
const JL_GAIN=/^(.*?)\s*([+\-−]\s?\d[\d   .,]*(?:\s?(?:KM\/H|AURA|M|\$))?)\s*$/i; /* « NOM +120 M » → le nom, le gain ; « +21 KM/H » seul reste un mot entier */
function jlNet(t){return sansAcc(String(t)).replace(/[<>&"]/g,'').replace(/\s+/g,' ').trim();}
function jlTitre(t,rp){return rp==='legendaire'?t.toLowerCase().replace(/(^|[\s'-])(\S)/g,function(m,a,c){return a+c.toUpperCase();}):t;} /* (19/10, la légendaire gothique) en minuscules à capitale initiale : ses capitales ne se lisaient pas */
function jlConteneur(){if(JAIL.el)return JAIL.el;const e=document.createElement('div');e.id='jl';e.setAttribute('aria-hidden','true');document.body.appendChild(e);JAIL.el=e;return e;}
function jlElement(){let e=JAIL.pool.pop();if(e)return e;e=document.createElement('div');e.className='jl';e.innerHTML='<span class="jlM"></span><span class="jlG"></span><u></u>';jlConteneur().appendChild(e);return e;} /* le nom, le gain, le trait dessous */
function jlAncre(){ /* la caisse à l'écran : les 8 coins de sa boîte (les dimensions de sa fiche) projetés — son centre, son toit, et sa demi-largeur VISIBLE (le pare-chocs, plus proche de la caméra que le centre, est plus large à l'écran) */
  const K=CARS[level]||{w:2,h:1.5,l:4.5},v=JAIL.vect,m=carGroup.matrixWorld;let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;
  for(let i=0;i<8;i++){v.set((i&1?.5:-.5)*K.w,(i&2?K.h:0),(i&4?.5:-.5)*K.l).applyMatrix4(m).project(camera);
    const sx=(v.x*.5+.5)*VP.w,sy=(-v.y*.5+.5)*VP.h;if(sx<x0)x0=sx;if(sx>x1)x1=sx;if(sy<y0)y0=sy;if(sy>y1)y1=sy;}
  if(!(x1>x0)||!isFinite(x0+x1+y0+y1))return {x:VP.w*.5,y:VP.h*.5,oy:VP.h*.58,w:48};
  return {x:(x0+x1)/2,y:y0,oy:y0+(y1-y0)*.4,w:Math.max(26,Math.min(VP.w*.3,(x1-x0)/2))};}
function jlNb(cote){let n=0;const t=performance.now();for(let i=0;i<JAIL.vivants.length;i++){const q=JAIL.vivants[i];if(q.cote===cote&&t-q.t0<760)n++;}return n;} /* les mots de ce côté (0 = au-dessus du toit) encore bien lisibles */
function jlEtage(cote){const t=performance.now(),pris=[false,false,false];for(let i=0;i<JAIL.vivants.length;i++){const q=JAIL.vivants[i];if(q.cote===cote&&t-q.t0<760)pris[q.etage]=true;}for(let e=0;e<3;e++)if(!pris[e])return e;return 2;} /* le premier étage libre : un mot ne se pose jamais sur un autre */
function jaillit(txt,o){
  if(JAIL.off||!txt)return 0;o=o||{};
  let nom=jlNet(txt),gain='';const g=JL_GAIN.exec(nom);if(g&&g[1]){nom=g[1];gain=g[2].replace(/\s+/g,' ').replace(/−/g,'-');}
  if(!nom)return 0;
  const n=performance.now(),rp=o.rp||'mot';
  if(nom+gain===JAIL.der&&n-JAIL.derT<420)return 0; /* le même mot deux fois de suite (un rebond qui tousse) : un seul */
  try{
    const a=jlAncre(),K=FIG_RP[rp]||FIG_RP.commun,fig=!!FIG_RP[rp]&&rp!=='combo',kk=fig?K.k:1,kw=fig?K.w:1;
    nom=jlTitre(nom,rp);
    /* FIG_RP : k = le facteur de taille de la police (hauteur de capitale = celle de Press Start 2P), w = la chasse d'une lettre en unités du corps SANS k (mesurées au canvas, v5) */
    const larg=function(f){const s=f/kk;return nom.length*s*kw+nom.length*1.4+(gain?(gain.length+1)*s*.78:0);};
    let fs=Math.round((VP.w>VP.h?11:12.5)*(o.k||1)*kk);while(fs>9&&larg(fs)>VP.w*.84)fs--; /* le mot tient dans l'écran */
    const W=larg(fs),marge=8,vide=fs*.8;
    /* LE CÔTÉ : celui du geste (un tail whip part à droite si le pouce est à droite), sinon celui qui a le moins de mots — et jamais un côté où le mot ne tient pas : l'autre, puis AU-DESSUS du toit */
    let cote=o.cote||(o.dir==='gauche'?-1:o.dir==='droite'?1:0);if(!cote){const l=jlNb(-1),r=jlNb(1);cote=l===r?-JAIL.cote:l<r?-1:1;}
    const place=function(c){return c>0?VP.w-(a.x+a.w+vide)-marge:(a.x-a.w-vide)-marge;};
    let dessus=false;if(place(cote)<W){if(place(-cote)>=W)cote=-cote;else dessus=true;}JAIL.cote=cote;
    const etage=jlEtage(dessus?0:cote),ph=(n%7)/7; /* le léger désordre vient de l'heure (pas d'aléa : un banc rejoue le même geste) */
    const dx0=dessus?0:cote*(a.w+vide+W/2+ph*10),dy0=-(fs*(dessus?2.1:1.5)+etage*fs*2.2+ph*8); /* le bord du mot touche le flanc de la caisse, à hauteur de toit ; un étage de plus par mot qui arrive avant que le précédent soit parti */
    const xm=Math.max(W/2+marge,Math.min(VP.w-W/2-marge,a.x+dx0)),ym=Math.max(Math.max(VP.h*.2,48),Math.min(VP.h*.8,a.y+dy0));
    const dx=Math.round(xm-a.x),dy=Math.round(ym-a.oy),hop=Math.round(fs*1.1);
    if(JAIL.vivants.length>=5){const v0=JAIL.vivants[0];if(v0&&v0.anim)v0.anim.playbackRate=4;} /* jamais plus de 5 mots : le plus ancien s'écourte */
    const e=jlElement(),M=e.firstChild,G=M.nextSibling,U=G.nextSibling;
    M.textContent=nom;G.textContent=gain;G.style.display=gain?'':'none';if(gain)G.style.fontSize=Math.max(9,Math.round(fs/kk*.78))+'px'; /* le gain : .78 du corps de Press Start 2P, jamais de celui d'une police de rareté plus grande */
    e.style.fontSize=fs+'px';if(o.c)e.style.setProperty('--jc',o.c);else e.style.removeProperty('--jc'); /* sans couleur donnée, c'est celle de la rareté (CSS) */
    if(FIG_RP[rp]||rp==='ko'||rp==='refus')e.setAttribute('data-rp',rp);else e.removeAttribute('data-rp');
    e.style.display='';
    const T=function(x,y,s,r){return 'translate('+Math.round(a.x+x)+'px,'+Math.round(a.oy+y)+'px) translate(-50%,-50%) scale('+s+') rotate('+(r||0)+'deg)';};
    const ms=o.ms||(rp==='combo'?1500:1120),rot=(dessus?1:cote)*(2+ph*3);
    let kf;
    if(REDUCED_MOTION)kf=[{transform:T(dx,dy,1),opacity:0,offset:0},{transform:T(dx,dy,1),opacity:1,offset:.12},{transform:T(dx,dy,1),opacity:1,offset:.78},{transform:T(dx,dy,1),opacity:0,offset:1}];
    else kf=[{transform:T(0,0,.45,0),opacity:0,offset:0}, /* il sort de la caisse… */
      {transform:T(dx*.72,dy-hop,1.18,rot),opacity:1,offset:.14,easing:'cubic-bezier(.2,.8,.3,1)'}, /* …bondit un peu au-delà de sa place… */
      {transform:T(dx*.96,dy+2,1,0),opacity:1,offset:.32,easing:'ease-out'}, /* …retombe dessus… */
      {transform:T(dx,dy-4,1,0),opacity:1,offset:.78,easing:'linear'}, /* …tient… */
      {transform:T(dx*1.02,dy-16,.96,0),opacity:0,offset:1}]; /* …et s'élève en s'éteignant */
    const q={cote:dessus?0:cote,etage:etage,t0:n,anim:null,fin:null}; /* 0 = au-dessus du toit : ces mots-là s'étagent entre eux */JAIL.vivants.push(q);
    q.anim=e.animate(kf,{duration:ms,fill:'both',easing:'linear'});
    const fin=function(){const i=JAIL.vivants.indexOf(q);if(i>=0)JAIL.vivants.splice(i,1);q.anim.onfinish=q.anim.oncancel=null;try{q.anim.cancel();}catch(x){}
      if(JAIL.pool.indexOf(e)<0){e.style.display='none';JAIL.pool.push(e);}};
    q.fin=fin;q.anim.onfinish=q.anim.oncancel=fin;
    if(!REDUCED_MOTION&&(fig||rp==='combo'))U.animate([{transform:'scaleX(0)'},{transform:'scaleX(1)'}],{duration:240,delay:90,easing:'cubic-bezier(.2,.8,.2,1)',fill:'both'}); /* le trait se tire sous le mot (figures) : on le lit, puis il s'éteint avec lui */
    JAIL.der=nom+gain;JAIL.derT=n;
    if((fig&&rp!=='commun'||rp==='combo')&&!REDUCED_MOTION)try{pixBurst(e,rp==='combo'?7:4);}catch(x){} /* une poignée de pixels pour les figures rares : le mot jaillit de la caisse en étincelant */
    return W;
  }catch(err){return 0;}
}
try{Object.assign(I18N,{'PAS DE NITRO':'NO NITRO','TROP TARD':'TOO LATE'});}catch(e){} /* les deux refus d'une figure (figRefus) */
function jaillitRaz(){JAIL.der='';JAIL.derT=0;const v=JAIL.vivants.slice();for(let i=0;i<v.length;i++){try{v[i].fin();}catch(e){}}} /* la caisse explose, la course repart : les mots qui volent encore s'éteignent tout de suite (fin : cancel + l'élément rejoint le bassin, sans attendre l'événement) */
window.dbgJl=function(txt,o){if(txt)return jaillit(txt,o||{});return {der:JAIL.der,vivants:JAIL.vivants.length,pool:JAIL.pool.length,off:JAIL.off};};
