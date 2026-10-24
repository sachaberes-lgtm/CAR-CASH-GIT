// ---------- INIT ----------
newTrack();
respawn();
setupIntroPig();
frameAt(0,F);
camera.position.copy(F.p).addScaledVector(F.t,-9).addScaledVector(F.n,4);
elRecord.textContent=TR('record : ')+fmt(best);
carSnapshot();   // photo des caisses DÉJÀ acquises : sans elle, le 1er scan les annoncerait toutes d'un coup
level=equippedCar();buildCar(CARS[level]); // on se présente au menu dans la caisse choisie au garage
paintMoney(); // LE MENU AFFICHE LA MISE : $1.61 visible AVANT de lancer (le HTML disait « $00000000 »)
paintCarHud(); // et la fiche de caisse porte le bon nom/palier dès l'écran d'accueil
applyLangDOM(); // la langue sauvegardée s'applique AU CHARGEMENT (elle ne prenait qu'en cliquant le sélecteur)
setBestChip();
renderLeaders(-1);
/* (2026-10-21, Léo : « une nouvelle intro beaucoup plus moderne et stylée pour le label 1.61, du style Xbox ou PlayStation ») l'intro est
   désormais celle de moteur/intro-161.js (blips, noir, gros logo qui casse l'écran). `?intro=ancien` rend celle d'avant, juste dessous. */
const INTRO_NEUVE=!/[?&]intro=ancien\b/.test(location.search);
(function(){ // ---------- INTRO STUDIO « 1.61 » : accumulation… battements… FISSION ----------
  const sp9=document.getElementById('splash');
  if(!sp9||INTRO_NEUVE)return;
  window.__intro='attente'; // (la mise à jour toute seule) l'écran titre attend son toucher : rien n'a sonné, on peut recharger
  const cv9=document.getElementById('fxCv'),ctx9=cv9.getContext('2d');
  const stage=document.getElementById('spStage'),num=document.getElementById('spNum'),
        ttl=document.getElementById('spTitle'),fl9=document.getElementById('spFlash');
  cv9.width=innerWidth;cv9.height=innerHeight;
  addEventListener('resize',function(){if(!done){cv9.width=innerWidth;cv9.height=innerHeight;}}); // (2026-10-14, chasse aux bugs) iPhone tourné sur l'écran titre : le canvas gardait l'ancienne taille, étiré par le CSS (poussière et halo écrasés) ; draw9 repose son style à chaque image
  let done=false,ph9=0,launched=false,iAC=null,master=null,tLaunch=0;
  const timers=[];const T9=(fn,ms)=>timers.push(setTimeout(fn,ms));
  const P9=[],RG=[];
  const CX=()=>cv9.width/2,CY=()=>cv9.height/2;
  for(let i=0;i<240;i++){ // poussière d'or : en dérive pendant le teaser, aspirée après le clic
    const a=Math.random()*Math.PI*2,r=Math.max(cv9.width,cv9.height)*(.5+Math.random()*.8);
    P9.push({x:CX()+Math.cos(a)*r,y:CY()+Math.sin(a)*r,s:.8+Math.random()*2.4,k:.012+Math.random()*.03,o:.4+Math.random()*.6,
      dx:(Math.random()-.5)*14,dy:(Math.random()-.5)*14});
  }
  // ⚠ \uFE0E : même raison que pour les jetons — sans lui macOS remplace ♥ ♣ ☠ ♦ par ses emoji couleur.
  const SYMS=[['$','#ffd75e'],['♥\uFE0E','#ff5e8a'],['♣\uFE0E','#54e07a'],['☠\uFE0E','#e8e8f0'],['€','#9ad8ff'],['¥','#ffc46b'],['1.61','#fff2be'],['♦\uFE0E','#ff9d2e']];
  function beat(k){ // battement de cœur du logo : pulsation + micro-flash + onde
    if(done)return;
    /* (2026-10-15) le battement faisait pulser « 1.61 »… encore INVISIBLE à ce moment-là (il ne se lève qu'après la fission, depuis l'ordre
       inversé) : les trois coups ne se voyaient pas. C'est CASH CAR, à l'écran, qui bat — `scale` (propriété à part : la pente skewX du
       logo reste intacte), un coup sec puis le retour, de plus en plus fort jusqu'à l'explosion. */
    try{if(ttl.animate&&document.documentElement.getAttribute('data-reduced-motion')!=='1')ttl.animate([{scale:'1'},{scale:String(1+.06*k),offset:.22},{scale:'1'}],{duration:340,easing:'cubic-bezier(.32,.72,0,1)'});}catch(e){}
    fl9.style.opacity=(.10*k);
    RG.push({r:30,v:900+k*300,w:3,a:.5,col:'255,214,110'});
    T9(function(){if(done)return;fl9.style.opacity=0;},130);
  }
  function fission(){ // TOUT explose EN MÊME TEMPS : cœurs, trèfles, dollars, crânes…
    if(done)return;
    ph9=1;
    fl9.style.opacity=1;
    ttl.classList.add('boom');   // ⚠ C'EST LE TITRE qui explose (ordre inverse) — meme classe, meme effet qu'avant
    P9.length=0;
    // ⚠ 120→70 ET LE `shadowBlur` PAR PARTICULE A SAUTÉ (2026-09-05, plainte du user : « ça lague »).
    // `ctx.shadowBlur` force une passe de flou À PART pour CHAQUE forme dessinée — à 120 glyphes/frame
    // c'est 120 passes de flou, chaque frame, pendant que le titre anime en même temps un `filter`
    // CSS tout aussi coûteux : deux effets chers au même instant, c'est ça le décrochage d'images.
    // Le halo est maintenant UNE SEULE dégradé radiale dessinée une fois par frame (voir plus bas),
    // pas 120 — l'ambiance reste, le coût s'effondre.
    for(let i=0;i<70;i++){
      const a=Math.random()*Math.PI*2,v=(160+Math.random()*820)*(Math.min(cv9.width,900)/900);
      const sy=SYMS[Math.floor(Math.random()*SYMS.length)];
      P9.push({x:CX(),y:CY(),vx:Math.cos(a)*v,vy:Math.sin(a)*v*.72,s:13+Math.random()*30,
        rot:Math.random()*6,vr:(Math.random()-.5)*5,sym:sy[0],col:sy[1],life:1.5+Math.random()*.9});
    }
    for(let i=0;i<3;i++)RG.push({r:10,v:1400-i*300,w:7-i*2,a:.9,col:i===1?'255,120,180':'255,224,150'});
    T9(function(){if(done)return;fl9.style.opacity=0;},130);
    // LA SIGNATURE SE LEVE DANS LA FUMEE, a la place exacte du titre : 1.61 GAMING apparait…
    T9(function(){if(done)return;num.classList.add('on');shakeStage(10);},300);
    // …et DISPARAIT avant que l'ecran ne s'ouvre. ⚠ elle s'efface, elle ne re-explose pas : deux
    // detonations de suite et la premiere ne vaut plus rien.
    T9(function(){if(done)return;num.classList.add('out');},2450);
  }
  function shakeStage(n){
    if(done)return;
    if(n<=0){stage.style.transform='';return;}
    stage.style.transform='translate('+((Math.random()-.5)*16)+'px,'+((Math.random()-.5)*16)+'px)';
    T9(function(){shakeStage(n-1);},34);
  }
  // ---- LANCEMENT : le son exige un geste utilisateur (politique navigateur) → teaser « CLIQUE » ----
  function kd9(){if(!launched&&!done)launch();}
  addEventListener('keydown',kd9);
  function launch(){
    if(launched||done)return;launched=true;tLaunch=performance.now();window.__intro='joue'; // l'intro passe : pas de rechargement
    ttl.classList.remove('tease');
    const nt=document.getElementById('spNote');
    if(nt)nt.style.display='none';
    T9(function(){ttl.classList.add('on');},60);   // CASH CAR se plante net, puis les trois coups montent
    T9(function(){beat(1);},1050);
    T9(function(){beat(1.35);},1650);
    T9(function(){beat(1.8);},2150);
    T9(fission,2650);
    T9(hide,(SAVE&&SAVE.d&&SAVE.d.tuto)?4600:6400); // (2026-09-26) 6,4 s à CHAQUE lancement : complète la 1re fois, écourtée ensuite
    /* (2026-10-06, Léo : « il y a encore des versions où l'intro CASH CAR qui explose : la musique commence même avant ça — il faut enlever
       COMPLÈTEMENT toute musique qui arrive avant le ciel ») : la composition de l'intro (accords « nombre d'or », compteuse qui monte,
       battements de cœur, sub) ne joue plus — l'intro est muette, la musique du lobby part avec le ciel (hide, 420 ms). */
    if(INTRO_SON)try{introSound();}catch(e){} // le son ne doit JAMAIS bloquer les visuels
  }
  // PAS de lancement auto : on attend le geste (seul moyen d'avoir le son — règle navigateur).
  // ⚠ LA PLAQUE ARRIVE EN 900 ms, PAS EN 4 s. L'ancien « CLIQUE » se faisait attendre quatre secondes
  // devant un écran noir : le joueur croyait que le jeu était planté. On ne fait pas mariner quelqu'un
  // devant la porte d'entrée — le nombre a le temps de respirer, et la plaque tombe juste derrière.
  T9(function(){if(!launched&&!done){
    const n=document.getElementById('spNote');if(n)n.classList.add('on');
  }},900);
  if(BALADE||SIMU_JEU)T9(hide,80); // (atelier des nuages) droit à l'écran titre, sans l'intro ni son clic — (2026-10-12) le simulateur aussi
  // ---- SOUND DESIGN « 1.61 » : tout est accordé sur le NOMBRE D'OR φ=1,618 ----
  // Échelle inouïe (intervalles de φ : ni octaves ni quintes — le son littéral de 1.61),
  // compteuse à billets en guise de riser, sub qui bat à 0,618 Hz, jackpot de pièces à la fission.
  /* (2026-10-07, Sacha : « pour l'animation 1.61 au début, il n'y a plus le son ») : la composition REVIENT — Léo l'avait coupée la nuit du
     6/10 (c135414, « plus aucune musique avant le ciel »). La musique du LOBBY, elle, part toujours avec le ciel (hide) ; ici, c'est
     le sound design de l'intro, qui s'éteint en fondu quand le voile s'ouvre. false = l'intro muette de Léo. */
  /* (2026-10-16, pôle SON — Léo, sur l'appli : « c'est quoi cette première musique de merde ? » puis « il faut que la musique ne commence qu'au
     menu ciel ») MESURÉ au banc muet, du toucher de l'écran titre au ciel : la SEULE chose qui sonne avant le ciel, c'est cette composition
     (4,5 s, jusqu'à −14 dB, quand la musique du ciel part à −40). Les deux demandes tiennent ensemble : l'animation GARDE SON SON (Sacha, 7/10)
     mais plus une NOTE — on garde les bruitages (le clic, la compteuse à billets, les spirales de souffle, les coups de cœur, l'aspiration, le
     canon de la fission, l'impact du titre : tout ce qui chute en hauteur) et on retire tout ce qui CHANTE (les tintements sur l'échelle d'or,
     la poussière d'or, le double sub qui tient sa note, l'accord des battements, le chœur de la fission, la pluie de pièces accordée, l'accord du
     titre, la nappe de traîne). La musique ne commence qu'au ciel. `?intro=musique` = la composition entière (celle du 7/10), `?intro=muet` =
     l'intro muette (celle du 6/10). */
  const INTRO_SON=/[?&]intro=muet\b/.test(location.search)?0:/[?&]intro=musique\b/.test(location.search)?2:1, INTRO_NOTES=INTRO_SON===2;
  function introSound(){
    if(!SND.sfx||!(VOL.sfx>0))return; // mute SON : l'intro reste muette aussi — (2026-09-28) et le curseur EFFETS à zéro aussi
    try{iAC=new (window.AudioContext||window.webkitAudioContext)();}catch(e){return;}
    const A=iAC;try{A.resume();}catch(e){}
    const t0=A.currentTime+.05,PHI=1.6180339;
    const phi=k=>110*Math.pow(PHI,k); // l'échelle d'or : 110·φ^k
    const comp=A.createDynamicsCompressor();
    /* (2026-09-28) L'INTRO OBÉIT AU CURSEUR EFFETS. Elle vit dans son propre contexte, branché en direct sur la sortie : le bus
       MASTER (qui porte `VOL.sfx`) ne la voyait pas. Le volume se pose APRÈS le compresseur — posé avant, il changerait la dose de
       compression, donc le son lui-même ; après, c'est un vrai bouton de volume, et à 100 % rien ne bouge. */
    const vol9=A.createGain();vol9.gain.value=(typeof sfxVol==='function'?sfxVol():VOL.sfx);vol9.connect(A.destination);
    comp.threshold.value=-14;comp.ratio.value=5;comp.connect(vol9);
    master=A.createGain();master.gain.value=1;master.connect(comp);
    const nzBuf=(function(){const n=A.sampleRate*2,b=A.createBuffer(1,n,A.sampleRate),c=b.getChannelData(0);for(let i=0;i<n;i++)c[i]=Math.random()*2-1;return b;})();
    const pan=x=>{const p=A.createStereoPanner?A.createStereoPanner():A.createGain();if(p.pan)p.pan.value=x;return p;};
    function tone(f0,f1,t,dur,vol,type,px){ // ton glissant enveloppé
      if(!INTRO_NOTES&&f1&&f1/f0>.9)return; // (2026-10-16) une NOTE (hauteur tenue) : seulement avec ?intro=musique — les coups qui chutent (×0,2 à ×0,35) restent
      const o=A.createOscillator(),g=A.createGain(),p=pan(px||0);
      o.type=type||'sine';
      o.frequency.setValueAtTime(Math.max(1,f0),t0+t);
      if(f1&&f1!==f0)o.frequency.exponentialRampToValueAtTime(Math.max(1,f1),t0+t+dur);
      const atk=Math.min(.012,dur*.4);
      g.gain.setValueAtTime(0,t0+t);g.gain.linearRampToValueAtTime(vol,t0+t+atk);
      g.gain.exponentialRampToValueAtTime(.0008,t0+t+dur);
      o.connect(g);g.connect(p);p.connect(master);
      o.start(t0+t);o.stop(t0+t+dur+.06);
    }
    function puffN(t,dur,vol,type,f,f1,q,px){ // souffle filtré
      const s=A.createBufferSource();s.buffer=nzBuf;s.loop=true;
      const fl=A.createBiquadFilter();fl.type=type;fl.Q.value=q||1;
      fl.frequency.setValueAtTime(f,t0+t);
      if(f1)fl.frequency.exponentialRampToValueAtTime(f1,t0+t+dur);
      const g=A.createGain(),p=pan(px||0);
      const atk=Math.min(.02,dur*.5);
      g.gain.setValueAtTime(0,t0+t);g.gain.linearRampToValueAtTime(vol,t0+t+atk);
      g.gain.exponentialRampToValueAtTime(.0008,t0+t+dur);
      s.connect(fl);fl.connect(g);g.connect(p);p.connect(master);
      s.start(t0+t);s.stop(t0+t+dur+.06);
    }
    // 0) ALLUMAGE : le CLIC sonne immédiatement — pièce d'or + whoosh + thump
    tone(phi(5),phi(5),.02,.55,.20,'triangle',.2);
    tone(phi(6),phi(6)*.99,.06,.6,.12,'sine',-.2);
    tone(phi(3),phi(3),.02,.7,.14,'sine');
    puffN(.02,.5,.18,'bandpass',900,2600,1.5);
    tone(150,46,.02,.45,.34);
    // 1) LA COMPTEUSE À BILLETS : frottements de papier qui s'accélèrent (le riser)
    let tt=.15,iv=.15;
    while(tt<2.42){
      puffN(tt,.028,.03+tt*.045,'highpass',2200+tt*1200,0,1,(Math.random()-.5)*.9);
      iv=Math.max(.021,iv*.952);tt+=iv;
    }
    // 2) POUSSIÈRE D'OR : grains aigus qui se rangent peu à peu sur l'échelle d'or (chaos → ordre)
    for(let i=0;i<46;i++){
      const t=.2+Math.random()*2.1,ord=t/2.3;
      const f=phi(4+Math.floor(Math.random()*4))*(1+(Math.random()-.5)*.5*(1-ord));
      tone(f,f,t,.09+Math.random()*.13,.022+ord*.04,'sine',(Math.random()-.5)*1.4);
    }
    // 3) DOUBLE SUB : 38 + 38,618 Hz → battement de 0,618 Hz. Harmoniques ×2 pour
    //    rester audible sur petites enceintes (les portables ne sortent pas le 38 Hz)
    if(INTRO_NOTES)for(const fh of [[38,.16],[38.618,.16],[76,.07],[77.236,.07]]){ // (2026-10-16) une note tenue : seulement avec ?intro=musique
      const o=A.createOscillator(),g=A.createGain();
      o.type='sine';o.frequency.value=fh[0];
      g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(fh[1],t0+2.1);
      g.gain.setValueAtTime(fh[1],t0+2.5);g.gain.linearRampToValueAtTime(0,t0+2.62); // aspiré
      o.connect(g);g.connect(master);o.start(t0);o.stop(t0+2.66);
    }
    // 4) SPIRALES : deux souffles résonants qui grimpent en proportions d'or
    for(const k of [0,1]){
      const s=A.createBufferSource();s.buffer=nzBuf;s.loop=true;
      const fl=A.createBiquadFilter();fl.type='bandpass';fl.Q.value=9;
      const f0=240*Math.pow(PHI,k);
      fl.frequency.setValueAtTime(f0,t0+.3);
      fl.frequency.exponentialRampToValueAtTime(f0*10,t0+2.6);
      const g=A.createGain(),p=pan(k?-.5:.5);
      g.gain.setValueAtTime(0,t0+.3);g.gain.linearRampToValueAtTime(.09,t0+2.3);
      g.gain.setValueAtTime(.09,t0+2.55);g.gain.linearRampToValueAtTime(0,t0+2.63);
      s.connect(fl);fl.connect(g);g.connect(p);p.connect(master);
      s.start(t0+.3);s.stop(t0+2.7);
    }
    // 5) BATTEMENTS DE CŒUR (sync pulsations du logo) : kick + thump médium + accord d'or
    [[1.05,1],[1.65,1.35],[2.15,1.8]].forEach(function(bk){
      const t=bk[0],k=bk[1];
      tone(96,27,t,.24,.30*k);
      tone(230,70,t,.14,.14*k);
      tone(phi(1),phi(1)*.994,t,.17,.09*k,'triangle');
      tone(phi(2),phi(2)*.994,t,.16,.08*k,'triangle');
      tone(phi(3),phi(3)*.994,t,.14,.07*k,'triangle');
      puffN(t,.03,.10*k,'highpass',5200,0,1);
    });
    // 6) ASPIRATION (2.35→2.63) : tout se fait avaler… puis 70 ms de VIDE total
    puffN(2.35,.28,.30,'bandpass',800,3400,2);
    tone(340,64,2.35,.28,.09);
    // 7) FISSION (2.65) : canon de sub + souffle + chœur métallique d'or qui retombe
    tone(64,21,2.65,1.5,.55);
    tone(128,42,2.65,.8,.22);
    puffN(2.65,.9,.38,'lowpass',3800,140,1);
    for(let k=0;k<5;k++)tone(phi(k)*2,phi(k)*1.94,2.65,2.1-k*.22,.07,k%2?'triangle':'sine',(k-2)*.3);
    // 8) JACKPOT : pluie de pièces qui descend l'échelle d'or (dense → clairsemée)
    for(let i=0;i<26;i++){
      const t=2.72+Math.pow(i/26,1.35)*1.5;
      const f=phi(6-Math.floor(i/5))*(1+(Math.random()-.5)*.06);
      tone(f,f*.99,t,.22+Math.random()*.1,.07-.035*(i/26),'triangle',(Math.random()-.5)*1.2);
      puffN(t,.02,.03,'highpass',6000,0,1);
    }
    // 9) LE TITRE CLAQUE (2.95, sync visuel) : impact + accord brillant
    tone(120,30,2.95,.32,.50);
    for(let k=0;k<4;k++)tone(phi(k)*4,phi(k)*4,2.95,.5,.07,'triangle',(k-1.5)*.35);
    puffN(2.95,.18,.22,'highpass',1800,0,1);
    // 10) TRAÎNE : nappe d'or qui s'éteint doucement vers le menu
    tone(phi(2),phi(2),3.05,2.8,.04,'sine',-.4);
    tone(phi(3),phi(3),3.1,2.7,.035,'sine',.4);
  }
  let last9=performance.now();
  function draw9(now){
    if(done)return;
    requestAnimationFrame(draw9);
    const dt9=Math.max(0,Math.min((now-last9)/1000,.05));last9=Math.max(last9,now); // ⚠ jamais < 0 : la 1re image de rAF peut être datée AVANT `last9` — l'onde de choc prenait un rayon négatif et `arc()` levait à CHAQUE image (478 erreurs mesurées)
    ctx9.clearRect(0,0,cv9.width,cv9.height);
    if(ph9===0){
      ctx9.fillStyle='#ffd75e';
      if(!launched){ // TEASER : poussière d'or en dérive lente, en attente du clic
        for(const p of P9){
          p.x+=p.dx*dt9;p.y+=p.dy*dt9;
          if(p.x<0)p.x+=cv9.width;if(p.x>cv9.width)p.x-=cv9.width;
          if(p.y<0)p.y+=cv9.height;if(p.y>cv9.height)p.y-=cv9.height;
          ctx9.globalAlpha=p.o*.16;
          ctx9.beginPath();ctx9.arc(p.x,p.y,p.s,0,7);ctx9.fill();
        }
        ctx9.globalAlpha=1;
      }else{ // phase accumulation : spirale d'étincelles dorées
        for(const p of P9){
          p.x+=(CX()-p.x)*p.k*(dt9*60);p.y+=(CY()-p.y)*p.k*(dt9*60);
          const dd=Math.hypot(p.x-CX(),p.y-CY());
          if(dd<24){const a=Math.random()*Math.PI*2,r=Math.max(cv9.width,cv9.height)*(.5+Math.random()*.7);p.x=CX()+Math.cos(a)*r;p.y=CY()+Math.sin(a)*r;}
          ctx9.globalAlpha=p.o*(.35+.65*Math.min(1,240/Math.max(dd,1)));
          ctx9.beginPath();ctx9.arc(p.x,p.y,p.s,0,7);ctx9.fill();
        }
        ctx9.globalAlpha=1;
      }
    }else{ // phase fission : symboles éjectés qui tournoient
      // ⚠ UN SEUL HALO, PAS UN PAR PARTICULE (2026-09-05) : une dégradé radiale bon marché à la place
      // de 70 passes de `shadowBlur` — même ambiance dorée, sans le coût qui faisait laguer l'instant
      // le plus chargé de l'intro (voir la note sur le spawn des particules, juste au-dessus).
      const glow9=ctx9.createRadialGradient(CX(),CY(),0,CX(),CY(),Math.max(cv9.width,cv9.height)*.5);
      glow9.addColorStop(0,'rgba(255,215,140,.20)');glow9.addColorStop(1,'rgba(255,215,140,0)');
      ctx9.fillStyle=glow9;ctx9.fillRect(0,0,cv9.width,cv9.height);
      ctx9.textAlign='center';ctx9.textBaseline='middle';
      for(let i=P9.length-1;i>=0;i--){
        const p=P9[i];
        p.life-=dt9;p.vy+=260*dt9;
        p.x+=p.vx*dt9;p.y+=p.vy*dt9;p.rot+=p.vr*dt9;
        if(p.life<=0){P9.splice(i,1);continue;}
        ctx9.save();ctx9.translate(p.x,p.y);ctx9.rotate(p.rot);
        ctx9.globalAlpha=Math.min(1,p.life);
        ctx9.font='700 '+p.s+'px "Press Start 2P",monospace';
        ctx9.fillStyle=p.col;ctx9.fillText(p.sym,0,0);
        ctx9.restore();
      }
    }
    for(let i=RG.length-1;i>=0;i--){ // ondes de choc
      const g9=RG[i];g9.r+=g9.v*dt9;g9.a-=dt9*1.1;
      if(g9.a<=0){RG.splice(i,1);continue;}
      ctx9.strokeStyle='rgba('+g9.col+','+g9.a+')';ctx9.lineWidth=g9.w;
      ctx9.beginPath();ctx9.arc(CX(),CY(),Math.max(0,g9.r),0,7);ctx9.stroke();
    }
  }
  requestAnimationFrame(draw9);
  function hide(){
    if(done)return;done=true;setTimeout(function(){window.__intro=null;},1500); // (le voile s'ouvre, la musique du lobby part : on attend encore)
    for(const t9 of timers)clearTimeout(t9);
    removeEventListener('keydown',kd9);
    if(iAC){ // fondu audio rapide puis fermeture du contexte de l'intro
      try{master.gain.setTargetAtTime(0,iAC.currentTime,.06);}catch(e){}
      setTimeout(function(){try{iAC.close();}catch(e){}},400);
    }
    // ---- LE RACCORD : ON N'ATTERRIT PLUS SUR UN MENU, ON ATTERRIT DANS LE GARAGE ----------------
    // ⚠ L'ORDRE EST TOUT : on OUVRE l'atelier PENDANT que le voile est encore opaque, puis on retire
    // le voile par-dessus. Le joueur ne voit donc jamais la bascule — il voit un fondu qui decouvre
    // une piece deja allumee, avec sa caisse dessus. Ouvrir APRES le fondu montrerait un ecran nu
    // pendant que buildGarageRoom() fabrique ses 6 geometries et ses 7 canvas a la premiere visite.
    // ⚠ et c'est pour ca que #splash est passe en z-index 80 : #garage est a 60, il serait sinon
    // apparu D'UN COUP par-dessus le voile au lieu d'etre decouvert par lui.
    // Le titre, lui, n'a plus rien a raccorder : il a explose, il n'existe plus.
    // ⚠ L'INTRO EST FINIE ICI, PAS DANS 1,15 s : on lui retire son ID AVANT d'ouvrir le garage.
    // `start()` se garde par `document.getElementById('splash')` — tant que le voile gardait son
    // identite pendant son fondu, un JOUER AVEC CELLE-CI lance dans cette fenetre faisait
    // closeGarage() (qui rouvre le menu) suivi d'un start() qui REFUSAIT de le refermer : le joueur
    // se retrouvait planté au menu. Le noeud, lui, part en fondu comme avant.
    // ⚠ BUG TROUVÉ 2026-09-04 (mesuré, pas deviné) : retirer l'ID détache AUSSI toute la règle CSS
    // `#splash{position:fixed;inset:0;…}` — le voile retombe en `position:static`, DANS LE FLUX DU
    // DOCUMENT, avec la hauteur de son contenu (mesuré : 86px). Le canvas WebGL, dernier enfant de
    // `<body>` en flux normal lui aussi, se fait POUSSER de 86px vers le bas pendant toute la durée
    // de vie du nœud détaché (jusqu'à `sp9.remove()`, 1,15 s) : bande BLANCHE (fond de `<body>`) en
    // haut d'écran, bas de l'image rogné d'autant. On fige donc en dur, sur l'élément lui-même,
    // exactement ce que l'ID lui donnait — il reste hors du flux jusqu'à sa suppression.
    // ⚠ `pointer-events:none` (le CSS d'origine avait `cursor:pointer`, pour le double-clic « passer »
    // — mais ce clic n'a plus de sens ICI, `hide()` a déjà tourné) : sans lui, le voile invisible
    // continuait à AVALER les clics sur le garage fraîchement révélé pendant tout son fondu.
    sp9.classList.add('spVoile'); /* (2026-10-15) le halo qui respire reste sur le voile jusqu'à son effacement (il tenait à l'id) */
    sp9.id='';
    sp9.style.cssText='position:fixed;inset:0;z-index:80;display:flex;align-items:center;justify-content:center;pointer-events:none;background:radial-gradient(900px 600px at 50% 46%,#191024,#000 75%);transition:opacity .7s;overflow:hidden;opacity:1';
    // ⚠ LE GARAGE ÉTAIT MUET (2026-09-05) : `chimeNote`/`noiseBurst` (chime de changement de caisse,
    // impact au tap…) se posent en garde `if(!AC)return` — silencieuses tant que `AC` n'existe pas.
    // Or `AC` ne se créait QUE dans `start()`, c'est-à-dire APRÈS avoir déjà joué avec le garage
    // (premier écran vu depuis que le splash y atterrit direct) : toute la session de shopping se
    // déroulait sans le moindre retour sonore. Le clic qui ferme CE splash EST déjà le geste
    // utilisateur qu'un `AudioContext` réclame — autant s'en servir tout de suite. `if(!AC)` : même
    // garde que `playMusic`/`musicStartRun`, zéro risque de double contexte avec le garde ajouté
    // dans `start()`.
    if(!AC){try{if(typeof initAudio==='function')initAudio();}catch(e){}}
    // (2026-10-03, Léo : « pour toutes les musiques, fais démarrer au moment du menu ciel ») : la musique du lobby part à l'instant où le
    // voile s'ouvre sur le CIEL (420 ms, le fondu ci-dessous), et du DÉBUT du morceau — le 1er toucher l'avait lancée en silence une fraction
    // de seconde pour libérer le lecteur. Avant : 700 ms, au milieu du fondu.
    setTimeout(function(){try{if(!started){if(musicEl&&musicEl.paused&&musicMenuUrl()&&musicEl.src.indexOf(musicMenuUrl())>=0)musicEl.currentTime=0;musicMenu();}}catch(e){}},420); // la musique du menu arrive avec le ciel
    // (2026-09-24, audit UX) sur TÉLÉPHONE on atterrit sur le MENU (JOUER · CARRIÈRE · GARAGE…) : le garage était le 1er écran
    // avec trois actions concurrentes (PLAY, CARRIÈRE, ✕) et une croix qui menait… au menu. Il redevient le lieu du CHOIX de la caisse.
    try{if(typeof openGarage==='function'&&!IS_MOBILE)openGarage();}catch(e){}
    setTimeout(function(){ // (2026-09-25) le voile s'OUVRE sur le menu — léger zoom-avant sur la courbe unique — et le menu joue son entrée dessous
      sp9.style.transition='opacity .6s cubic-bezier(.32,.72,0,1),transform .6s cubic-bezier(.32,.72,0,1)';sp9.style.transform='scale(1.06)';sp9.style.opacity=0;
      try{document.dispatchEvent(new Event('cc:revele'));}catch(e){} },420);
    setTimeout(function(){sp9.remove();},1150);
  }
  sp9.addEventListener('click',function(){ // 1er clic = lancer, 2e = passer
    try{musicDeverrouille();}catch(e){} // ⚠ LE geste qui libère la musique pour toute la session (voir le lecteur unique)
    if(!launched)launch();
    else if(performance.now()-tLaunch>600)hide(); // ⚠ un DOUBLE-CLIC sur la plaque sautait tout
  });
})();
/* ============ MOBILE / TACTILE / PAUSE / PWA — ajout non intrusif (rien de la physique n'est réécrit) ============ */
// PAUSE commune : clavier P, bouton tactile ⏸ et pause auto passent tous par ici (gère aussi le son)
function busPlein(){busPlein.n=(busPlein.n|0)+1;clearTimeout(togglePause._t); /* (2026-10-16) compté : LE CLIC DANS LA PAUSE (pauseSon) sait que la partie a repris la sortie */if(AC&&BUSOUT){const t9=AC.currentTime;BUSOUT.gain.cancelScheduledValues(t9);BUSOUT.gain.setValueAtTime(1,t9);}} // (2026-09-28) la sortie commune à plein (voir le fondu de la pause)
function togglePause(){ if(!started||gameOver)return;
  paused=!paused; showMsg(paused?'PAUSE':'GO !');
  if(!paused)slowT=Math.max(slowT,.8); // (2026-09-25) reprise au RALENTI : le temps de reposer les pouces
  /* (2026-09-28) LES BOUCLES SE TAISENT AVEC LA PAUSE. Suspendre le contexte FIGE les sons continus à leur gain du moment : dès que
     le compte 3-2-1 le réveille (0,9 s, jeu encore gelé, boucle qui ne règle plus rien), moteur, vent, sifflement, crissement et
     nitro rejouaient plein pot sur une image arrêtée. On les coupe NET avant de suspendre, et on vide le cache de `stt` (`_s9`) :
     sans ça, à la reprise, la boucle croirait la cible déjà envoyée et laisserait tout à zéro. `jrDep`/`engLfoG` en font partie :
     ce sont des LFO branchés sur un gain, ils rendraient un trémolo audible même gain principal à zéro. */
  if(paused&&AC){ try{ const T9=AC.currentTime;
    for(const n9 of [gainN,windG,whG,pluieG,skidG,jrG,jrDep,jetG,jetLowG,jetOscG,engLfoG,engWhineG,transG,diffG,ovrG,engTickG,pinkG,DRS&&DRS.g,RSN&&RSN.g,sirG,RUG.rgG,RUG.thG,RUG.crG,GOM.sG,GOM.gG,GOM.respG])
      if(n9){const p9=n9.gain;p9.cancelScheduledValues(T9);p9.setTargetAtTime(0,T9,.012);p9._s9=undefined;} }catch(e){} }
  /* (2026-09-28) …et en FONDU : un `suspend()` sec coupait le moteur en plein cycle — un « tic » à chaque pause. La sortie commune
     (`BUSOUT`) descend en ~40 ms, le contexte s'endort derrière ; la reprise (ou le compte 3-2-1) remet la sortie à plein. */
  try{ if(AC){ const T8=AC.currentTime;clearTimeout(togglePause._t);
    if(paused){ /* (2026-09-28, console de son) le clic ⏸ et la feuille qui s'ouvre (ui.feuille, posée à 0,36 s) sonnent JUSQU'AU BOUT : la sortie attend `d9` pour descendre et le contexte s'endort
       d'autant plus tard. Le JEU est gelé tout de suite (paused) et les boucles (moteur, vent, nitro…) sont coupées net juste au-dessus :
       pendant ces 0,42 s ne sonnent que les sons ponctuels déjà partis. Une reprise dans l'intervalle annule tout
       (busPlein efface la rampe programmée, clearTimeout la suspension). Onglet caché (retour d'appli) : ni son ni délai. */
      let d9=0;try{if(SONV2&&!document.hidden)d9=.42;if(SONV2){window.CCSON.annuleFutur(d9);window.CCSON.stopJeu();}}catch(e){}try{instruCoupe(0);}catch(e){} /* (2026-10-07) la phrase du nitro se tait TOUT DE SUITE (le clic ⏸ et la feuille, eux, sonnent jusqu'au bout) */ /* (débogage son 2026-09-29) les queues longues (explosion, fanfare, scène moteur) ne repartent plus pendant le 3-2-1 */
      if(BUSOUT)BUSOUT.gain.setTargetAtTime(0,T8+d9,.012);togglePause._t=setTimeout(function(){try{if(paused&&AC.state==='running')AC.suspend();}catch(e){}},70+d9*1000);}
    else{busPlein();if(SND.sfx||musGraphe())AC.resume();} } }catch(e){} // (2026-10-14, session SON) musique branchée : SON coupé, le contexte doit quand même se réveiller (les effets restent fermés par musWaSon)
  if(paused){fxStop();deathStop();} // (2026-09-26) les voix et les samples sont des HTMLAudio : suspendre le contexte ne les arrêtait pas — (2026-09-28) le son de MORT non plus : une pause pendant l'explosion le laissait hurler par-dessus le panneau
  musicPause(paused); // la musique ne passe plus par l'AudioContext : elle se met en pause elle-même
}
// applique la résolution adaptative (reconfigure le renderer et le canvas des speed-lines)
/* (2026-09-26, passe perf, lot 4) chaque changement de résolution réallouait TOUT DEUX FOIS : `setPixelRatio` redimensionne déjà (le
   canvas 3D, puis les 11 cibles du bloom), et on redimensionnait derrière à la même taille. Désormais le second passage n'a lieu que si
   la FENÊTRE a changé. Et les deux canvas 2D ne sont retaillés que si leur taille change : retailler un canvas l'EFFACE (les taches de
   jus disparaissaient à chaque cran de résolution adaptative). */
const DPR_V9=new THREE.Vector2();
const PIQUE_ON=!/[?&]pique=0/.test(location.search),PIQUE_NAT=(function(){const m=/[?&]piquen=([\d.]+)/.exec(location.search);return m?+m[1]:.4;})(); // `?pique=0` : sans l'accentuation, pour comparer · `?piquen=.5` : la force du piqué natif (banc)
function applyDPR(){ try{ const W=innerWidth,H=innerHeight;
  renderer.getSize(DPR_V9);const neuve=DPR_V9.x!==W||DPR_V9.y!==H;
  renderer.setPixelRatio(curDPR);if(neuve)renderer.setSize(W,H);if(PT_U)PT_U.uPxMax.value=26*curDPR; // le plafond des particules suit la résolution
  if(composer){composer.setPixelRatio(curDPR);if(neuve)composer.setSize(W,H);}
  /* LE PIQUÉ NATIF (2026-09-28, « plus beau sur iPhone sans coût en plus »). L'iPhone a 3 pixels par point, la 3D en calcule 1,5 (NETTE) :
     c'est le NAVIGATEUR qui agrandit l'image ×2 en bilinéaire au moment de l'afficher — un flou de plus, même au plafond, que l'ancien
     piqué (qui ne regardait que la descente sous le plafond) ne compensait jamais. `up9` = cet agrandissement ; au-delà de ×1,05 le
     piqué rend d'avance le contraste que l'agrandissement va prendre (×2 → .40 ; `?piquen=` pour comparer). Mêmes 4 lectures que le FXAA : coût nul. On garde le
     plus fort des deux. Sur l'ordi à l'accueil (VHD, sur-échantillonné : up9 < 1) rien ne change. */
  if(acesPass&&acesPass.uniforms.uSharp){const up9=Math.min(3,devicePixelRatio||1)/Math.max(.01,curDPR),piqN=up9>1.05?Math.min(PIQUE_NAT,(up9-1)*PIQUE_NAT):0;
    acesPass.uniforms.uSharp.value=PIQUE_ON?Math.max(piqN,Math.min(.45,(DPR_CAP-curDPR)/Math.max(.01,DPR_CAP)*1.5)):0;} // (tour 2) sous le plafond, le piqué compense (1,25/1,5 → .25 · 1,0/1,5 → .45)
  if(slCv.width!==W||slCv.height!==H){slCv.width=W;slCv.height=H;}
  if(juiceCv&&(juiceCv.width!==W||juiceCv.height!==H)){juiceCv.width=W;juiceCv.height=H;} }catch(e){} }
// PAUSE AUTO : l'appli passe en arrière-plan (onglet caché, app minimisée) → on gèle + on coupe le son
addEventListener('visibilitychange',function(){ if(document.hidden&&started&&!gameOver&&!paused&&mode!=='boom')togglePause(); /* (2026-10-14, chasse aux bugs) PAS pendant l'EXPLOSION : la pause figeait la boule de feu, coupait le son de mort et rouvrait le panneau PAUSE au retour sur une partie déjà perdue — l'arrière-plan gèle déjà tout (plus d'images, contexte audio suspendu) ; au retour la mort avance comme au ⏸ (boomSkip, plus bas) */
  // (2026-09-26) au menu, au garage ou sur l'écran de mort, une vingtaine de sources en boucle tournaient encore en arrière-plan
  try{ if(AC){ if(document.hidden){if(AC.state==='running')AC.suspend();} else if((SND.sfx||musGraphe())&&!paused&&AC.state!=='running')AC.resume(); } }catch(e){} // (2026-10-14, session SON) …et au retour d'arrière-plan aussi
  if(document.hidden)try{enCoursPose();SAVE.flush();}catch(e){} // (2026-09-28) l'appli part en arrière-plan : ce qui attendait le filet de 30 s (record de frénésie, meilleur moteur…) est écrit TOUT DE SUITE — iOS peut la tuer sans prévenir · (2026-09-30) et la PARTIE en cours avec (enCoursPose)
  // (2026-09-30) au retour la partie continue : l'instantané part — SAUF contexte 3D perdu, que suit un rechargement (voir webglcontextlost) : il est alors le seul à porter la partie
  if(!document.hidden){let perdu=false;try{perdu=renderer.getContext().isContextLost();}catch(e){}if(!perdu)enCoursRetire();}
  if(!document.hidden){loop._pn=0;loop._rebuildT=performance.now();} }); // retour d'onglet : la frame « absente » n'est pas une lenteur
// IMMERSION : plein écran + verrou PORTRAIT + veille désactivée. Les trois exigent un GESTE
// utilisateur — on les redemande à chaque contact utile, et on ne râle jamais si elles sont refusées.
let wakeLock=null;
function wakeAsk(){ try{ if(navigator.wakeLock&&!wakeLock)navigator.wakeLock.request('screen').then(function(w){
  wakeLock=w;w.addEventListener('release',function(){wakeLock=null;}); },function(){}); }catch(e){} }
function goImmersive(){
  if(!IS_MOBILE)return;
  // Sous Capacitor (app native) : la WebView est déjà plein écran et requestFullscreen n'est pas
  // supporté — on le garde pour le web uniquement. Et pas sur l'ordi en `?tel=1` : cliquer JOUER
  // ne doit pas avaler l'écran entier sans qu'on l'ait demandé.
  if(!window.Capacitor&&!FORCE_TEL){ try{ const el=document.documentElement;
    if(el.requestFullscreen&&!document.fullscreenElement)el.requestFullscreen({navigationUI:'hide'}).catch(function(){});
    else if(el.webkitRequestFullscreen&&!document.webkitFullscreenElement)el.webkitRequestFullscreen();
  }catch(e){} }
  // Plus de verrou d'orientation : l'app accepte PORTRAIT ET PAYSAGE (décision 2026-09-03).
  // screen.orientation.lock n'est de toute façon pas supporté sous iOS ; on ne le tente plus.
  wakeAsk();
}
