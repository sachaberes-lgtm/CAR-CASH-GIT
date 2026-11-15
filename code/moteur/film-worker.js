/* ===== LE FILM DESSINÉ PAR UN WORKER (2026-11-15, qualité · lot SONDEOC — PROTOTYPE, ÉTEINT PAR DÉFAUT : `?plus=filmworker`, vrai téléphone seulement) =====
   Sacha : « le film d'intro permet de charger le reste ». Pour charger PENDANT la boule sans à-coup, il faut que le film ne dépende plus du fil principal.
   Ici le film (la boule, « TOUCHE », « 1.61 PRESENTS ») est dessiné par un Worker dans une toile à lui (OffscreenCanvas 2D, transferControlToOffscreen), posée
   juste AU-DESSUS de #fxCv dans le voile. #fxCv ne peut pas être donnée au Worker : elle a déjà son contexte 2D (intro-161.js, 1re ligne), et une toile transférée
   ne se reprend jamais — le repli serait impossible. Avec une toile à part, le repli est immédiat : on la retire, et le fil principal redessine dans #fxCv à l'image suivante.
   AUCUN DESSIN N'EST RECOPIÉ : le Worker reçoit le TEXTE des vraies fonctions d'intro-161.js (rendu0, dBoule, dToucheBoule, dPresente, dAttenteJeu, halo, pciSaute… par
   Function.toString) et les fait tourner sur ses propres variables, tenues à jour par messages. Une retouche du film dans intro-161.js arrive donc toute seule dans le Worker ;
   si elle y appelle un nom inconnu, le Worker plante, le dit, et le repli se fait.
   CE QUI RESTE SUR LE FIL PRINCIPAL (à chaque image, quelques µs) : l'état du film — `dBoule` y tourne sur un contexte FACTICE (aucun dessin) : inertie du doigt, cloches
   sur l'horloge audio, serpent qui fond (chCl) —, puis l'état part au Worker s'il a changé (horloge, prêt, appui, angle de la boule, taille).
   CE QUI PART AU WORKER, une fois : les 660 vignettes de la boule (ImageBitmap, clonées), les 4 lueurs (ImageBitmap, transférées), la géométrie (tableaux), la police
   Press Start 2P (rechargée dans le Worker par FontFace : sans elle, pas de Worker).
   LE REPLI (retour au chemin d'avant, sans image noire) : pas de support, police absente, vignettes pas en ImageBitmap, erreur du Worker, Worker muet 2,5 s, casse (dEclats),
   banc `dbgIntro.voir`. La boîte noire dit pourquoi (« filmworker »). Les images du Worker (nombre, pire intervalle) s'écrivent à l'ouverture du menu (« intro | filmworker… »).
   `window.dbgFilmW` : etat(), fige(t) (le Worker dessine l'instant t, le banc photographie), cache(vrai) (le fil principal redessine). Banc : outils/banc-demarrage/filmworker.cjs. */
const FILMW=(function(){
  const F={on:false,tient:false,etat:'éteint',pourquoi:'',image:function(){return false;},accroche:function(){}};
  try{F.on=!!TEL_NATIF&&/[?&]plus=[^&]*filmworker/.test(location.search);}catch(e){F.on=false;}
  if(!F.on)return F;
  let A=null,T=null,el=null,pret=false,vu=false,mort=false,eEnv=null,dern='',vieT=0,sansVie=0,cache=false,figeOn=false,attFige=null,BIL=null,wEl=0,hEl=0;
  const note=function(g,m){try{if(window.__ccNote)window.__ccNote(g,m);}catch(e){}};
  const FACTICE=(function(){const f=function(){};return{save:f,restore:f,drawImage:f,fillRect:f,fillText:f,strokeText:f,beginPath:f,arc:f,stroke:f,fill:f,setTransform:f,globalAlpha:1,globalCompositeOperation:'source-over',fillStyle:'',strokeStyle:''};})(); /* un contexte qui ne dessine rien : `dBoule` y fait vivre l'état (inertie, cloches) sans rien peindre */
  function abandon(pq){ /* LE REPLI : la toile du Worker s'en va, le fil principal redessine dès cette image */
    if(mort)return;mort=true;F.tient=false;F.etat='repli';F.pourquoi=String(pq).slice(0,160);
    try{if(el)el.remove();}catch(e){}try{if(T)T.terminate();}catch(e){}el=null;T=null;
    note('filmworker','repli : '+F.pourquoi);
    if(attFige){const f=attFige;attFige=null;try{f(false);}catch(e){}}
  }
  /* ---- CE QUI TOURNE DANS LE WORKER (jamais appelé ici : son texte est envoyé). Les noms libres (g, W, H, S, pretT, ETS, rendu0, pciSaute…) sont ceux du Worker, posés par `source()`. ---- */
  function corpsW(){
    let cvW=null,tLE=0,latV=0,dH=0,actif=false,figeT=null,sprH=null,ditVu=false;
    const RAF=typeof self.requestAnimationFrame==='function'?self.requestAnimationFrame.bind(self):function(f){return setTimeout(function(){f(performance.now());},16);};
    const N={n:0,mx:0,k:0,prev:0,rd:0,rdMx:0,des:0,l:[],raf:typeof self.requestAnimationFrame==='function'?1:0};
    const dit=function(o){try{self.postMessage(o);}catch(e){}};
    const tFilm=function(now){return(self.performance.timeOrigin+now+dH-tLE)/1000-latV;};
    const dessine=function(t){const a=performance.now();rendu0(t);const d=performance.now()-a;N.rd=d;N.des++;if(d>N.rdMx)N.rdMx=d;};
    const taille=function(){const w=Math.round(W*S),h=Math.round(H*S);if(cvW&&w>0&&h>0&&(cvW.width!==w||cvW.height!==h)){cvW.width=w;cvW.height=h;}};
    function image(now){
      RAF(image);if(!actif||figeT!==null||!g||!ETS.boule)return;
      const d=now-N.prev;if(N.prev&&d<2000){N.n++;if(d>N.mx)N.mx=d;if(d>20){N.k++;if(N.l.length<6)N.l.push(tFilm(now).toFixed(1)+'s '+Math.round(d));}if(N.n%30===0)dit({k:'vie',n:N.n});}N.prev=now;
      if(PCI_60&&tapT===null&&pciSaute(now))return;
      try{dessine(tFilm(now));}catch(e){actif=false;dit({k:'err',m:String(e&&e.stack||e).slice(0,300)});return;}
      if(!ditVu){ditVu=true;dit({k:'vu'});}
    }
    self.onmessage=function(ev){const m=ev.data;try{
      if(m.k==='init'){cvW=m.cv;g=cvW.getContext('2d');if(!g)throw new Error('pas de contexte 2d');sprH=m.spr;SPR.atmB=m.halos[0];SPR.atmV=m.halos[1];SPR.atmJ=m.halos[2];SPR.bl=m.halos[3];
        if(typeof FontFace!=='function'||!self.fonts)throw new Error('pas de FontFace dans le Worker');
        const ff=new FontFace('Press Start 2P','url("'+m.police+'")');
        ff.load().then(function(f){self.fonts.add(f);g.font='44px "Press Start 2P",monospace';const a=g.measureText('W1.').width;g.font='44px monospace';const b=g.measureText('W1.').width;
          if(Math.abs(a-b)<.5)dit({k:'err',m:'police non appliquée dans le Worker'});else{RAF(image);dit({k:'pret'});}},function(e){dit({k:'err',m:'police : '+e});});}
      else if(m.k==='geo'){const n=m.n;ETS.boule={sprH:sprH,R:m.R,cx:m.cx,cy:m.cy,n:n,px:m.px,py:m.py,pz:m.pz,gk:m.gk,gs:m.gs,pciT0:m.T0,pciQ:new Float64Array(n*4),pciZ:new Int8Array(n),pciL:new Uint8Array(n)};}
      else if(m.k==='etat'){const v=m.v;tLE=v[0];latV=v[1];pretT=v[2];tapT=v[3];presFin=v[4];tenuJeu=!!v[5];bYaw=v[6];bPit=v[7];bVy=v[8];bVp=v[9];bDown=!!v[10];W=v[11];H=v[12];S=v[13];ku=v[14];taille();actif=!!v[15]&&!v[16];}
      else if(m.k==='ping')dit({k:'pong',m:m.m,w:self.performance.timeOrigin+performance.now()});
      else if(m.k==='horloge')dH=m.d;
      else if(m.k==='fige'){figeT=m.t;if(figeT!==null){taille();dessine(figeT);}else N.prev=0;dit({k:'fige',t:figeT});}
      else if(m.k==='bilan')dit({k:'bilan',N:N,pas:PCI_N.pas,sautees:PCI_N.sautees});
    }catch(e){actif=false;dit({k:'err',m:String(e&&e.stack||e).slice(0,300)});}};
  }
  function source(){ /* le texte du Worker : ses variables (les noms d'intro-161.js), les constantes, les VRAIES fonctions du film, puis `corpsW` */
    const L=["'use strict';",
      'let W=0,H=0,S=1,ku=1,g=null,pretT=null,tapT=null,presFin=0,tenuJeu=false,bTP=null,bDown=false,bYaw=0,bPit=0,bVy=0,bVp=0,pasSon=-1,SON=null,filmMuet=true,iAC=null,casse=false,tCasse=0;',
      'let pciPrec=0,pciMin=99,pciNm=0,pciDer=-1e9,pciCourts=0;const PCI_N={lectures:0,rendus:0,sautees:0,ecranMs:0,pas:1,prepares:0,prepEvitees:0};',
      'const SPR={},ETS={boule:null},FILMW={on:false},BOULE=true,LANG='+JSON.stringify(typeof LANG==='undefined'?'fr':LANG)+',chCl=function(){},bouleInit=function(){},crea=function(n,f){return f();},geoLabSphere=function(){return null;};'];
    for(const k in A.K)L.push('const '+k+'='+JSON.stringify(A.K[k])+';');
    for(const k in A.src){const s=String(A.src[k]);L.push(/^function[\s(]/.test(s)?s:'const '+k+'='+s+';');}
    L.push('('+String(corpsW)+')();');
    return L.join('\n');
  }
  function envoieGeo(e){const c=function(a){return a.slice();};T.postMessage({k:'geo',R:e.R,cx:e.cx,cy:e.cy,n:e.n,gs:e.gs,px:c(e.px),py:c(e.py),pz:c(e.pz),gk:c(e.gk),T0:c(e.pciT0)});}
  function recu(ev){const m=ev.data||{};
    if(m.k==='pret'){pret=true;F.etat='prêt';T.postMessage({k:'ping',m:performance.timeOrigin+performance.now()});}
    else if(m.k==='pong'){const m1=performance.timeOrigin+performance.now();if(m.w<m.m-3||m.w>m1+3){T.postMessage({k:'horloge',d:(m.m+m1)/2-m.w});F.horloge=Math.round((m.m+m1)/2-m.w);}else F.horloge=0;} /* l'horloge du Worker n'a pas la même origine : on la recale (sinon : rien) */
    else if(m.k==='vu')vu=true;
    else if(m.k==='vie'){sansVie=0;vieT=performance.now();}
    else if(m.k==='err')abandon('Worker : '+m.m);
    else if(m.k==='fige'){if(attFige){const f=attFige;attFige=null;f(true);}}
    else if(m.k==='bilan'){BIL=m.N;BIL.pas=m.pas;BIL.sautees=m.sautees;if(F.attBilan){const f=F.attBilan;F.attBilan=null;f(BIL);}}
  }
  function demarre(e){ /* les ingrédients sont là (la chauffe de l'intro a fini) : la toile, le Worker, les images */
    try{
      for(const Lg of e.sprH)for(const b of Lg)if(!(b instanceof ImageBitmap)){abandon('vignettes pas en ImageBitmap');return;}
      el=document.createElement('canvas');el.id='fxCvW';el.setAttribute('aria-hidden','true');el.style.cssText='position:absolute;left:0;top:0;pointer-events:none;visibility:hidden';A.cv.after(el);
      const oc=el.transferControlToOffscreen();
      T=new Worker(URL.createObjectURL(new Blob([source()],{type:'text/javascript'})));
      T.onerror=function(x){abandon('Worker : '+((x&&x.message)||'erreur'));};T.onmessage=recu;
      Promise.all(['atmB','atmV','atmJ','bl'].map(function(k){return createImageBitmap(A.SPR[k]);})).then(function(h){
        if(mort)return;
        try{T.postMessage({k:'init',cv:oc,police:new URL('assets/fonts/pressstart2p.woff2',location.href).href,spr:e.sprH.map(function(Lg){return Lg.slice();}),halos:h},[oc].concat(h));}catch(x){abandon('envoi : '+x);}
      },function(x){abandon('lueurs : '+x);});
      F.etat='démarre';
    }catch(x){abandon('démarrage : '+x);}
  }
  function attend(){ /* la chauffe de l'intro (intro-161.js, `chauffe` → `bouleChauffe`) fabrique la boule et ses vignettes : on attend qu'elle ait fini, sans rien lui prendre */
    if(mort||T)return;
    let v=null,e=null;try{v=A.lit();e=A.e();}catch(x){}
    if(v&&v[16]){abandon('film fini avant le Worker');return;}
    if(e&&e.pciT0&&e.pciP&&A.SPR.bl){Promise.all(e.pciP).then(function(){if(mort||T)return;if(A.e()!==e){setTimeout(attend,150);return;}
      try{if(!A.SPR.atmB)A.boule(FACTICE,0);}catch(x){} /* les trois lueurs de la Terre naissent au 1er dessin de la boule : on les fait naître */
      demarre(e);});return;}
    setTimeout(attend,150);
  }
  F.accroche=function(a){A=a; /* (appelé par intro-161.js, une ligne) */
    try{if(typeof Worker!=='function'||typeof OffscreenCanvas!=='function'||!HTMLCanvasElement.prototype.transferControlToOffscreen||typeof createImageBitmap!=='function'||typeof ImageBitmap!=='function'){abandon('pas de support (OffscreenCanvas, Worker, ImageBitmap)');return;}}catch(e){abandon('pas de support');return;}
    setTimeout(attend,150);
    document.addEventListener('cc:revele',function(){if(mort||!T)return; /* le menu s'ouvre : le bilan des images du Worker, puis il s'arrête quand le voile a fondu */
      F.bilan().then(function(N){if(N)note('intro','filmworker · à l\'ouverture du menu : '+N.n+' images du Worker ('+N.des+' dessinées), pire '+Math.round(N.mx)+' ms, images > 20 ms : '+N.k+(N.l.length?' ('+N.l.join(' · ')+')':'')+' · rendu pire '+N.rdMx.toFixed(1)+' ms · rAF de Worker '+N.raf);});
      setTimeout(function(){try{if(T)T.terminate();}catch(e){}T=null;mort=true;F.tient=false;F.etat='fini';},2500);});
  };
  F.bilan=function(){return new Promise(function(ok){if(!T){ok(BIL);return;}F.attBilan=ok;T.postMessage({k:'bilan'});setTimeout(function(){if(F.attBilan===ok){F.attBilan=null;ok(null);}},1500);});};
  /* L'IMAGE (appelée par `rendu0`, une ligne) : vrai = le Worker dessine cette image, le fil principal ne peint rien */
  F.image=function(t){
    if(mort||!pret||cache||!A)return false;
    let v;try{v=A.lit();}catch(e){return false;}
    if(v[17]||(v[18]&&!figeOn)){if(F.tient){F.tient=false;if(el)el.style.visibility='hidden';}return false;} /* la casse (dEclats) et le banc `voir` : le fil principal */
    try{A.chCl(1-A.src.lisse(.7,1.25,t));A.boule(FACTICE,t);}catch(e){abandon('état : '+e);return false;} /* l'état du film vit ici : le serpent fond, l'inertie du doigt, les cloches */
    try{
      v=A.lit();v[0]+=performance.timeOrigin;
      if(v[11]!==wEl||v[12]!==hEl){wEl=v[11];hEl=v[12];el.style.width=wEl+'px';el.style.height=hEl+'px';}
      const e=A.e();if(e!==eEnv){if(!e.pciT0)return false;eEnv=e;envoieGeo(e);}
      const cle=v.join(',');if(cle!==dern){dern=cle;T.postMessage({k:'etat',v:v});}
    }catch(e){abandon('envoi : '+e);return false;}
    if(!F.tient){if(!vu)return false; /* le Worker n'a pas encore dessiné : cette image reste au fil principal */
      el.style.visibility='visible';F.tient=true;F.etat='worker';sansVie=0;vieT=performance.now();note('filmworker','le Worker dessine le film depuis t = '+t.toFixed(2)+' s');}
    else if(!figeOn&&++sansVie>45&&performance.now()-vieT>2500){abandon('Worker muet');return false;}
    return true;
  };
  window.dbgFilmW={etat:function(){return{on:F.on,etat:F.etat,tient:F.tient,pourquoi:F.pourquoi,pret:pret,vu:vu,horloge:F.horloge,bilan:BIL};},
    bilan:function(){return F.bilan();},
    fige:function(t){if(!T||mort)return Promise.resolve(false);figeOn=t!=null;cache=false;if(el&&F.tient)el.style.visibility='visible';
      if(figeOn){try{window.dbgIntro.voir(t);}catch(e){}}
      return new Promise(function(ok){attFige=ok;T.postMessage({k:'fige',t:figeOn?t:null});});},
    panne:function(){if(T)T.postMessage({k:'geo',n:-1});}, /* (banc) une erreur provoquée dans le Worker : le repli doit se faire */
    cache:function(b){cache=!!b;if(el)el.style.visibility=(cache||!F.tient)?'hidden':'visible';}};
  return F;
})();
