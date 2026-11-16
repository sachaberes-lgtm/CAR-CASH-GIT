/* ===== LA SONDE « UN WORKER PEUT-IL DESSINER PENDANT QUE LE JEU CHARGE ? » (2026-11-15, qualité · lot SONDEOC — ÉTEINTE PAR DÉFAUT : `?sondeoc=1`, vrai téléphone seulement) =====
   La question à trancher sur l'iPhone avant de sortir le film du fil principal (voir film-worker.js) : une toile dessinée par un Worker (OffscreenCanvas 2D,
   transferControlToOffscreen, requestAnimationFrame de Worker) continue-t-elle d'AVANCER À L'ÉCRAN quand le fil principal est bloqué ?
   Au menu, 4 s après son ouverture, dans le coin haut gauche :
     · UN CARRÉ NOIR de 96 px dessiné par un Worker : un trait blanc qui fait UN TOUR PAR SECONDE, et le numéro de l'image dessous (en Press Start 2P si le Worker a pu la charger) ;
     · à sa droite UN PETIT CARRÉ OR qui tourne en CSS (animation de `transform`, menée hors du fil principal) : le TÉMOIN. S'il tourne et que le trait s'arrête, c'est bien le Worker qui n'est pas affiché.
   Puis le fil principal se BLOQUE EXPRÈS 1 s, trois fois (1,5 s d'écart). Pendant chaque blocage le Worker peint son fond en ROUGE.
   LES HEURES (corrigé le 15/11 d'après le contrôle) : le Worker ne compare JAMAIS son horloge à celle du fil principal (sur l'iPhone elles peuvent différer : faux « non »).
   Il date chaque blocage sur SON horloge : le message « bloc » (envoyé juste avant le blocage) allume le rouge à sa réception, pour la durée connue ; le message « finbloc »
   (envoyé à la sortie du blocage, avec la durée réelle) l'éteint et fixe la fenêtre comptée : [réception de finbloc − durée réelle, réception de finbloc].
   « message reçu après … ms » = le retard du message « bloc » sur le début réel du blocage. Proche de 0 : le rouge est à l'heure. Proche de 1000 : le message n'est arrivé
   qu'à la fin du blocage, le rouge ne s'est pas allumé à temps — on ne juge alors QUE le trait et le numéro (figés ou non), pas le rouge.
   Une course qui démarre ANNULE la sonde (aucun blocage en course) : la boîte s'en va, la boîte noire dit « annulée ».
   ⚠ « DESSINÉ » N'EST PAS « AFFICHÉ » : la boîte noire dit combien d'images le Worker a DESSINÉES pendant chaque blocage. Seul l'œil (ou un film de l'écran) dit si elles ont
   été MONTRÉES : pendant le fond ROUGE, le trait continue-t-il de tourner et le numéro de défiler ? S'il se fige une seconde puis saute, le Worker dessine mais l'écran attend le fil principal.
   Boîte noire, genre « sondeoc » : le support (OffscreenCanvas, transfert, rAF de Worker, 2d, FontFace, police appliquée, ImageBitmap clonée), puis par blocage les images dessinées et
   l'intervalle maxi vu par le Worker, les images peintes en rouge, puis le rythme hors blocage et l'écart des deux horloges (pour information). `window.dbgSondeOC()` rend le tout. Rien d'autre ne change dans le jeu ; la sonde se retire 12 s après la fin. */
(function(){
  let ON=false;try{ON=!!TEL_NATIF&&/[?&]sondeoc=1\b/.test(location.search);}catch(e){}
  if(!ON)return;
  const R={etat:'attend le menu'};window.dbgSondeOC=function(){return R;};
  const note=function(m){try{if(window.__ccNote)window.__ccNote('sondeoc',m);}catch(e){}};
  const echec=function(m){R.etat='échec';R.echec=String(m).slice(0,200);note('échec : '+R.echec);};
  function travail(){ /* ⚠ ne tourne QUE dans le Worker (son texte est envoyé) */
    let cv=null,g=null,n=0,police=0,fin=false,rouge=null,bc=null;const T=[],B=[],SUP={}; /* T : l'heure de chaque image, B : les blocages — TOUT sur l'horloge du Worker (performance.now() d'ici, jamais celle du fil principal) */
    const RAFN=typeof self.requestAnimationFrame==='function',RAF=RAFN?self.requestAnimationFrame.bind(self):function(f){return setTimeout(function(){f(performance.now());},16);};
    function image(now){
      if(fin)return;RAF(image);n++;const e=now;T.push(e);
      const dans=rouge!==null&&e<=rouge;if(dans&&bc)bc.rg++; /* rouge : de la réception de « bloc » à la durée connue, ou à « finbloc » s'il arrive avant */
      const w=cv.width,h=cv.height,a=(e%1000)/1000*6.2832,cx=w/2,cy=h*.4,r=w*.32;
      g.fillStyle=dans?'#c0001c':'#000';g.fillRect(0,0,w,h);
      g.strokeStyle='#fff';g.lineWidth=Math.max(2,w*.06);g.beginPath();g.moveTo(cx,cy);g.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r);g.stroke();
      g.fillStyle='#ffd75e';g.textAlign='center';g.textBaseline='alphabetic';g.font=Math.round(w*.14)+'px "Press Start 2P",monospace';g.fillText(String(n),cx,h*.95);
    }
    self.onmessage=function(ev){const m=ev.data;try{
      if(m.k==='init'){
        SUP.oc=typeof OffscreenCanvas==='function'?1:0;SUP.raf=RAFN?1:0;SUP.ff=typeof FontFace==='function'&&!!self.fonts?1:0;
        cv=m.cv;g=cv.getContext('2d');SUP.d2=g?1:0;if(!g){self.postMessage({k:'pret',sup:SUP});return;}
        try{g.drawImage(m.bmp,0,0);SUP.bmp=1;}catch(e){SUP.bmp=0;}
        const suite=function(){RAF(image);self.postMessage({k:'pret',sup:SUP});};
        if(!SUP.ff){SUP.police=0;suite();return;}
        try{const ff=new FontFace('Press Start 2P','url("'+m.police+'")');ff.load().then(function(f){self.fonts.add(f);
          g.font='44px "Press Start 2P",monospace';const a=g.measureText('W1.').width;g.font='44px monospace';const b=g.measureText('W1.').width;SUP.police=Math.abs(a-b)>=.5?1:0;suite();},
          function(e){SUP.police=0;SUP.policeErr=String(e).slice(0,80);suite();});}catch(e){SUP.police=0;SUP.policeErr=String(e).slice(0,80);suite();}
      }
      else if(m.k==='bloc'){const r=performance.now();bc={r:r,d:m.d,f:null,dr:m.d,rg:0};B.push(bc);rouge=r+m.d;} /* le blocage commence : daté à la RÉCEPTION, sur l'horloge d'ici */
      else if(m.k==='finbloc'){const r2=performance.now();if(bc&&bc.f===null){bc.f=r2;bc.dr=m.dr;}rouge=null;bc=null;} /* le blocage est fini (durée réelle `dr`, une DURÉE : aucune horloge à comparer) */
      else if(m.k==='ping')self.postMessage({k:'pong',m:m.m,w:self.performance.timeOrigin+performance.now()}); /* (pour information seulement : l'écart des horloges, écrit dans la boîte noire) */
      else if(m.k==='bilan'){
        const F=B.map(function(b){const z=b.f===null?b.r+b.d:b.f;return[z-b.dr,z,b.f===null?null:b.r-(z-b.dr),b.rg];}); /* la fenêtre comptée, le retard du message « bloc », les images rouges */
        const L=F.map(function(b){let c=0,mx=0,p=0;for(let i=0;i<T.length;i++){const e=T[i];if(e>=b[0]&&e<=b[1])c++;if(e>=b[0]&&e<=b[1]+60){if(p&&e-p>mx)mx=e-p;}if(e>=b[0]-60)p=e;}return{n:c,mx:Math.round(mx),h:b[2]===null?null:Math.round(b[2]),rg:b[3]};});
        let hn=0,hmx=0,hs=0;for(let i=1;i<T.length;i++){const e=T[i],d=e-T[i-1];let dans=false;for(let j=0;j<F.length;j++)if(e>=F[j][0]-60&&e<=F[j][1]+120)dans=true;if(!dans){hn++;hs+=d;if(d>hmx)hmx=d;}}
        self.postMessage({k:'bilan',blocs:L,hors:{n:hn,moy:hn?+(hs/hn).toFixed(1):0,mx:Math.round(hmx)},total:n});
        if(m.fin){fin=true;g.fillStyle='#000';g.fillRect(0,0,cv.width,cv.height);g.fillStyle='#ffd75e';g.font=Math.round(cv.width*.14)+'px "Press Start 2P",monospace';g.textAlign='center';g.fillText('FINI',cv.width/2,cv.height*.55);}
      }
    }catch(e){self.postMessage({k:'err',m:String(e&&e.stack||e).slice(0,200)});}};
  }
  const course=function(){try{return typeof started!=='undefined'&&!!started;}catch(e){return false;}}; /* `started` (boost-depart.js) : une course est partie */
  function lance(){
    if(R.etat!=='attend le menu')return;
    if(course()){R.etat='annulée';note('annulée : une course a démarré avant la sonde');return;}
    R.etat='démarre';
    const SUP={oc:typeof OffscreenCanvas==='function'?1:0,tr:HTMLCanvasElement.prototype.transferControlToOffscreen?1:0,w:typeof Worker==='function'?1:0};R.support=SUP;
    if(!SUP.oc||!SUP.tr||!SUP.w){note('support : OffscreenCanvas '+SUP.oc+' · transfert '+SUP.tr+' · Worker '+SUP.w+' → pas de film dans un Worker ici');R.etat='pas de support';return;}
    let boite=null,W=null,parti=false;
    const retire=function(){parti=true;try{document.removeEventListener('cc:jeu',surJeu);}catch(e){}try{if(W)W.terminate();}catch(e){}try{if(boite)boite.remove();}catch(e){}W=null;boite=null;};
    const annule=function(){if(parti)return;if(R.etat==='fini'){retire();return;}R.etat='annulée';note('annulée : une course a démarré (aucun blocage en course)');retire();};
    const surJeu=function(){if(course())annule();}; /* (`cc:jeu` : la course part ou s'arrête) la boîte s'en va à l'instant */
    try{
      boite=document.createElement('div');boite.id='sondeOC';boite.style.cssText='position:fixed;left:8px;top:calc(env(safe-area-inset-top,0px) + 8px);z-index:99990;pointer-events:none;display:flex;align-items:flex-start;gap:10px';
      const st=document.createElement('style');st.textContent='@keyframes sondeOCt{to{transform:rotate(360deg)}}';boite.appendChild(st);
      const c=document.createElement('canvas');c.width=192;c.height=192;c.style.cssText='width:96px;height:96px;background:#000;outline:1px solid #ffd75e';boite.appendChild(c);
      const tm=document.createElement('div');tm.style.cssText='width:26px;height:26px;margin-top:6px;background:linear-gradient(90deg,#ffd75e 50%,#5a3a00 50%);animation:sondeOCt 1s linear infinite;will-change:transform';boite.appendChild(tm); /* le témoin : une rotation CSS, menée hors du fil principal */
      document.body.appendChild(boite);document.addEventListener('cc:jeu',surJeu);
      const b0=document.createElement('canvas');b0.width=b0.height=8;b0.getContext('2d').fillRect(0,0,8,8);
      const oc=c.transferControlToOffscreen();
      W=new Worker(URL.createObjectURL(new Blob(['('+String(travail)+')();'],{type:'text/javascript'})));
      W.onerror=function(x){echec('Worker : '+((x&&x.message)||'erreur'));retire();};
      const dors=async function(ms){const z=performance.now()+ms;while(!parti&&performance.now()<z){if(course()){annule();break;}await new Promise(function(ok){setTimeout(ok,Math.min(100,Math.max(0,z-performance.now())));});}return !parti;}; /* attend, et regarde tous les 100 ms si une course est partie (faux = la sonde est annulée) */
      const bilan=function(fin){return new Promise(function(ok){W.onmessage=function(ev){if(ev.data&&ev.data.k==='bilan')ok(ev.data);else if(ev.data&&ev.data.k==='err'){echec('Worker : '+ev.data.m);ok(null);}};W.postMessage({k:'bilan',fin:fin?1:0});setTimeout(function(){ok(null);},3000);});};
      W.onmessage=function(ev){const m=ev.data||{};
        if(m.k==='err'){echec('Worker : '+m.m);retire();return;}
        if(m.k==='pong'){const m1=performance.timeOrigin+performance.now();R.horloge=Math.round(m.w-(m.m+m1)/2);return;} /* l'écart des horloges (Worker − fil principal), pour information : la sonde ne s'en sert pas */
        if(m.k!=='pret')return;
        Object.assign(SUP,m.sup);
        note('support : OffscreenCanvas '+SUP.oc+' · transfert '+SUP.tr+' · Worker '+SUP.w+' · rAF de Worker '+SUP.raf+' · 2d '+SUP.d2+' · FontFace '+SUP.ff+' · police appliquée '+SUP.police+(SUP.policeErr?' ('+SUP.policeErr+')':'')+' · ImageBitmap clonée '+(SUP.bmp|0));
        if(!SUP.d2){R.etat='pas de 2d';retire();return;}
        R.etat='mesure';
        (async function(){
          try{W.postMessage({k:'ping',m:performance.timeOrigin+performance.now()});}catch(e){}
          if(!(await dors(2000)))return;const DUR=1000,vus=[];R.bloques=vus;
          for(let i=0;i<3;i++){
            if(parti)return;if(course()){annule();return;} /* jamais de blocage en course */
            W.postMessage({k:'bloc',d:DUR});
            const t0=performance.now();let tours=0;while(performance.now()-t0<DUR)tours++; /* LE BLOCAGE : le fil principal ne rend pas la main pendant 1 s */
            const dr=performance.now()-t0;W.postMessage({k:'finbloc',dr:dr});
            vus.push(Math.round(dr));if(!(await dors(1500)))return;
          }
          const b=await bilan(true);if(parti)return;if(!b){if(R.etat!=='échec')echec('pas de bilan du Worker');setTimeout(retire,4000);return;}
          R.blocs=b.blocs;R.hors=b.hors;R.total=b.total;R.etat='fini';
          const lus=function(k){return b.blocs.map(function(x){return x[k]===null?'?':x[k];}).join(' / ');};
          note('blocages 3 × '+DUR+' ms : images DESSINÉES par le Worker '+lus('n')+' · dont peintes en rouge '+lus('rg')+' · intervalle maxi '+lus('mx')+' ms · message reçu après '+lus('h')+' ms');
          note('hors blocage : '+b.hors.n+' images, '+b.hors.moy+' ms en moyenne, maxi '+b.hors.mx+' ms · écart des horloges (Worker − fil principal) '+(R.horloge===undefined?'?':R.horloge)+' ms · dessiné n\'est pas affiché : le trait tournait-il pendant le fond rouge ?');
          await dors(12000);retire();
        })();
      };
      createImageBitmap(b0).then(function(bmp){
        try{W.postMessage({k:'init',cv:oc,bmp:bmp,police:new URL('assets/fonts/pressstart2p.woff2',location.href).href},[oc]);}catch(x){echec('envoi : '+x);retire();}
      },function(x){echec('createImageBitmap : '+x);retire();});
    }catch(x){echec(x);retire();}
  }
  document.addEventListener('cc:revele',function(){setTimeout(lance,4000);});
})();
