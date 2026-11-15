/* ===== LA SONDE « UN WORKER PEUT-IL DESSINER PENDANT QUE LE JEU CHARGE ? » (2026-11-15, qualité · lot SONDEOC — ÉTEINTE PAR DÉFAUT : `?sondeoc=1`, vrai téléphone seulement) =====
   La question à trancher sur l'iPhone avant de sortir le film du fil principal (voir film-worker.js) : une toile dessinée par un Worker (OffscreenCanvas 2D,
   transferControlToOffscreen, requestAnimationFrame de Worker) continue-t-elle d'AVANCER À L'ÉCRAN quand le fil principal est bloqué ?
   Au menu, 4 s après son ouverture, dans le coin haut gauche :
     · UN CARRÉ NOIR de 96 px dessiné par un Worker : un trait blanc qui fait UN TOUR PAR SECONDE, et le numéro de l'image dessous (en Press Start 2P si le Worker a pu la charger) ;
     · à sa droite UN PETIT CARRÉ OR qui tourne en CSS (animation de `transform`, menée hors du fil principal) : le TÉMOIN. S'il tourne et que le trait s'arrête, c'est bien le Worker qui n'est pas affiché.
   Puis le fil principal se BLOQUE EXPRÈS 1 s, trois fois (1,5 s d'écart). Pendant chaque blocage le Worker peint son fond en ROUGE (il connaît les heures d'avance).
   ⚠ « DESSINÉ » N'EST PAS « AFFICHÉ » : la boîte noire dit combien d'images le Worker a DESSINÉES pendant chaque blocage. Seul l'œil (ou un film de l'écran) dit si elles ont
   été MONTRÉES : pendant le fond ROUGE, le trait continue-t-il de tourner et le numéro de défiler ? S'il se fige une seconde puis saute, le Worker dessine mais l'écran attend le fil principal.
   Boîte noire, genre « sondeoc » : le support (OffscreenCanvas, transfert, rAF de Worker, 2d, FontFace, police appliquée, ImageBitmap clonée), puis par blocage les images dessinées et
   l'intervalle maxi vu par le Worker, puis le rythme hors blocage. `window.dbgSondeOC()` rend le tout. Rien d'autre ne change dans le jeu ; la sonde se retire 12 s après la fin. */
(function(){
  let ON=false;try{ON=!!TEL_NATIF&&/[?&]sondeoc=1\b/.test(location.search);}catch(e){}
  if(!ON)return;
  const R={etat:'attend le menu'};window.dbgSondeOC=function(){return R;};
  const note=function(m){try{if(window.__ccNote)window.__ccNote('sondeoc',m);}catch(e){}};
  const echec=function(m){R.etat='échec';R.echec=String(m).slice(0,200);note('échec : '+R.echec);};
  function travail(){ /* ⚠ ne tourne QUE dans le Worker (son texte est envoyé) */
    let cv=null,g=null,n=0,police=0,fin=false;const T=[],B=[],SUP={};
    const RAFN=typeof self.requestAnimationFrame==='function',RAF=RAFN?self.requestAnimationFrame.bind(self):function(f){return setTimeout(function(){f(performance.now());},16);};
    const ep=function(x){return self.performance.timeOrigin+x;};
    function image(now){
      if(fin)return;RAF(image);n++;const e=ep(now);T.push(e);
      let dans=false;for(let i=0;i<B.length;i++)if(e>=B[i][0]&&e<=B[i][1])dans=true;
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
      else if(m.k==='bloc'){B.push([m.a,m.b,ep(performance.now())-m.a]);}
      else if(m.k==='bilan'){
        const L=B.map(function(b){let c=0,mx=0,p=0;for(let i=0;i<T.length;i++){const e=T[i];if(e>=b[0]&&e<=b[1])c++;if(e>=b[0]&&e<=b[1]+60){if(p&&e-p>mx)mx=e-p;}if(e>=b[0]-60)p=e;}return{n:c,mx:Math.round(mx),h:Math.round(b[2])};});
        let hn=0,hmx=0,hs=0;for(let i=1;i<T.length;i++){const e=T[i],d=e-T[i-1];let dans=false;for(let j=0;j<B.length;j++)if(e>=B[j][0]-60&&e<=B[j][1]+120)dans=true;if(!dans){hn++;hs+=d;if(d>hmx)hmx=d;}}
        self.postMessage({k:'bilan',blocs:L,hors:{n:hn,moy:hn?+(hs/hn).toFixed(1):0,mx:Math.round(hmx)},total:n});
        if(m.fin){fin=true;g.fillStyle='#000';g.fillRect(0,0,cv.width,cv.height);g.fillStyle='#ffd75e';g.font=Math.round(cv.width*.14)+'px "Press Start 2P",monospace';g.textAlign='center';g.fillText('FINI',cv.width/2,cv.height*.55);}
      }
    }catch(e){self.postMessage({k:'err',m:String(e&&e.stack||e).slice(0,200)});}};
  }
  function lance(){
    if(R.etat!=='attend le menu')return;R.etat='démarre';
    const SUP={oc:typeof OffscreenCanvas==='function'?1:0,tr:HTMLCanvasElement.prototype.transferControlToOffscreen?1:0,w:typeof Worker==='function'?1:0};R.support=SUP;
    if(!SUP.oc||!SUP.tr||!SUP.w){note('support : OffscreenCanvas '+SUP.oc+' · transfert '+SUP.tr+' · Worker '+SUP.w+' → pas de film dans un Worker ici');R.etat='pas de support';return;}
    let boite=null,W=null;
    const retire=function(){try{if(W)W.terminate();}catch(e){}try{if(boite)boite.remove();}catch(e){}};
    try{
      boite=document.createElement('div');boite.id='sondeOC';boite.style.cssText='position:fixed;left:8px;top:calc(env(safe-area-inset-top,0px) + 8px);z-index:99990;pointer-events:none;display:flex;align-items:flex-start;gap:10px';
      const st=document.createElement('style');st.textContent='@keyframes sondeOCt{to{transform:rotate(360deg)}}';boite.appendChild(st);
      const c=document.createElement('canvas');c.width=192;c.height=192;c.style.cssText='width:96px;height:96px;background:#000;outline:1px solid #ffd75e';boite.appendChild(c);
      const tm=document.createElement('div');tm.style.cssText='width:26px;height:26px;margin-top:6px;background:linear-gradient(90deg,#ffd75e 50%,#5a3a00 50%);animation:sondeOCt 1s linear infinite;will-change:transform';boite.appendChild(tm); /* le témoin : une rotation CSS, menée hors du fil principal */
      document.body.appendChild(boite);
      const b0=document.createElement('canvas');b0.width=b0.height=8;b0.getContext('2d').fillRect(0,0,8,8);
      const oc=c.transferControlToOffscreen();
      W=new Worker(URL.createObjectURL(new Blob(['('+String(travail)+')();'],{type:'text/javascript'})));
      W.onerror=function(x){echec('Worker : '+((x&&x.message)||'erreur'));retire();};
      const dors=function(ms){return new Promise(function(ok){setTimeout(ok,ms);});};
      const bilan=function(fin){return new Promise(function(ok){W.onmessage=function(ev){if(ev.data&&ev.data.k==='bilan')ok(ev.data);else if(ev.data&&ev.data.k==='err'){echec('Worker : '+ev.data.m);ok(null);}};W.postMessage({k:'bilan',fin:fin?1:0});setTimeout(function(){ok(null);},3000);});};
      W.onmessage=function(ev){const m=ev.data||{};
        if(m.k==='err'){echec('Worker : '+m.m);retire();return;}
        if(m.k!=='pret')return;
        Object.assign(SUP,m.sup);
        note('support : OffscreenCanvas '+SUP.oc+' · transfert '+SUP.tr+' · Worker '+SUP.w+' · rAF de Worker '+SUP.raf+' · 2d '+SUP.d2+' · FontFace '+SUP.ff+' · police appliquée '+SUP.police+(SUP.policeErr?' ('+SUP.policeErr+')':'')+' · ImageBitmap clonée '+(SUP.bmp|0));
        if(!SUP.d2){R.etat='pas de 2d';retire();return;}
        R.etat='mesure';
        (async function(){
          await dors(2000);const DUR=1000,vus=[];
          for(let i=0;i<3;i++){
            const a=performance.timeOrigin+performance.now();W.postMessage({k:'bloc',a:a,b:a+DUR});
            const t0=performance.now();let tours=0;while(performance.now()-t0<DUR)tours++; /* LE BLOCAGE : le fil principal ne rend pas la main pendant 1 s */
            vus.push(Math.round(performance.now()-t0));await dors(1500);
          }
          const b=await bilan(true);if(!b){if(R.etat!=='échec')echec('pas de bilan du Worker');setTimeout(retire,4000);return;}
          R.blocs=b.blocs;R.hors=b.hors;R.total=b.total;R.bloques=vus;R.etat='fini';
          note('blocages 3 × '+DUR+' ms : images DESSINÉES par le Worker '+b.blocs.map(function(x){return x.n;}).join(' / ')+' · intervalle maxi '+b.blocs.map(function(x){return x.mx;}).join(' / ')+' ms · message reçu après '+b.blocs.map(function(x){return x.h;}).join(' / ')+' ms');
          note('hors blocage : '+b.hors.n+' images, '+b.hors.moy+' ms en moyenne, maxi '+b.hors.mx+' ms · dessiné n\'est pas affiché : le trait tournait-il pendant le fond rouge ?');
          setTimeout(retire,12000);
        })();
      };
      createImageBitmap(b0).then(function(bmp){
        try{W.postMessage({k:'init',cv:oc,bmp:bmp,police:new URL('assets/fonts/pressstart2p.woff2',location.href).href},[oc]);}catch(x){echec('envoi : '+x);retire();}
      },function(x){echec('createImageBitmap : '+x);retire();});
    }catch(x){echec(x);retire();}
  }
  document.addEventListener('cc:revele',function(){setTimeout(lance,4000);});
})();
