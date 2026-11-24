/* ===== LE PRELUDE DE LA SALLE DE PROJECTION (2026-11-24, etape 1 bis BOTS-ML : « les videos — un rejeu relance dans le vrai jeu avec l'image ») =====
   Charge AVANT le jeu, dans la page du jeu (un cadre de la salle de projection). Il donne au vrai navigateur les memes regles que le faux
   navigateur du simulateur (ml/reel/sim-env-reel.js) — c'est la condition pour que les TOUCHES d'un rejeu redonnent la meme course :
     · l'horloge est celle du jeu : une image = 1/60 s, quoi que fasse l'ordinateur (performance.now, Date, setTimeout, setInterval) ;
     · requestAnimationFrame ne bat pas tout seul : c'est la salle qui appelle loop(), image par image ;
     · le hasard du jeu sort d'une graine (Math.random) ; three.js garde le vrai hasard (le serveur lui sert une copie qui lit __NATIF) ;
     · rien n'entre : ni clavier, ni souris, ni sauvegarde, ni ouvrier, ni reseau ; AUCUN SON (le contexte audio est un faux).
   Ce qui reste vrai : le DOM, WebGL, les textures — c'est pour l'image qu'on est la.
   La porte rendue a la salle : window.__ENV = { clk, tick, minuteries, raf, fire, seed } (les memes noms que loadGame). */
(function(){
  const W=window,D=document;
  const NATIF=W.__NATIF={random:Math.random.bind(Math),now:performance.now.bind(performance),raf:W.requestAnimationFrame.bind(W),
    setTimeout:W.setTimeout.bind(W),clearTimeout:W.clearTimeout.bind(W),Date:Date,ecoute:EventTarget.prototype.addEventListener};
  /* ----- l'horloge virtuelle et les minuteries a l'heure du jeu (recopie de sim-env-reel.js) ----- */
  const CLK={t:1000},DATE0=Date.UTC(2026,10,22,12,0,0);
  const VDate=class extends Date{constructor(...a){if(a.length)super(...a);else super(DATE0+CLK.t);}static now(){return DATE0+CLK.t;}};
  const TIM={q:[],id:1};
  const vPose=(f,ms,a,rep)=>{if(typeof f!=='function')return 0;ms=Math.max(0,+ms||0);const id=TIM.id++;TIM.q.push({id:id,f:f,a:a,ms:rep?Math.max(ms,1000/60):ms,t:CLK.t+ms,rep:rep});return id;};
  const vSetTimeout=(f,ms,...a)=>vPose(f,ms,a,false),vSetInterval=(f,ms,...a)=>vPose(f,ms,a,true);
  const vClear=id=>{const i=TIM.q.findIndex(x=>x.id===id);if(i>=0)TIM.q.splice(i,1);};
  function tick(){const id0=TIM.id;for(let n=0;n<5000;n++){let b=null;for(const x of TIM.q)if(x.t<=CLK.t&&x.id<id0&&(!b||x.t<b.t||(x.t===b.t&&x.id<b.id)))b=x;if(!b)return;
      if(b.rep){b.t+=b.ms;if(b.t<=CLK.t)b.t=CLK.t+b.ms;}else TIM.q.splice(TIM.q.indexOf(b),1);try{b.f.apply(null,b.a);}catch(e){}}}
  const RAF={porte:null};
  const vRaf=f=>{if(typeof f!=='function'||!RAF.porte)return 0;let ok=false;try{ok=!!RAF.porte(f);}catch(e){}return ok?vPose(()=>f(CLK.t),0,[],false):0;};
  try{performance.now=()=>CLK.t;}catch(e){}
  W.Date=VDate;W.setTimeout=vSetTimeout;W.setInterval=vSetInterval;W.clearTimeout=vClear;W.clearInterval=vClear;
  W.requestAnimationFrame=vRaf;W.cancelAnimationFrame=function(){};
  W.requestIdleCallback=function(){return 0;};W.cancelIdleCallback=function(){};
  /* ----- le hasard du jeu : la meme suite que le simulateur (mulberry32) ----- */
  function seed(n){let a=n|0;Math.random=function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
    Math.random.__etat=function(v){if(v!==undefined)a=v|0;return a|0;};}
  seed(1);
  /* ----- rien n'entre : les ecoutes de la fenetre sont rangees (la salle y envoie les touches du rejeu), celles du document et des
     elements ne sont pas posees — sauf ce qui sert a CHARGER l'image (textures, polices, contexte WebGL) ----- */
  const LISTENERS={},CHARGE={load:1,error:1,webglcontextlost:1,webglcontextrestored:1,webglcontextcreationerror:1};
  EventTarget.prototype.addEventListener=function(t,f,o){
    if(this===W){(LISTENERS[t]=LISTENERS[t]||[]).push(f);return;}
    if(this===D||!CHARGE[t])return;
    return NATIF.ecoute.call(this,t,f,o);};
  function fire(type,evt){const e=Object.assign({preventDefault(){},stopPropagation(){},repeat:false},evt);for(const f of (LISTENERS[type]||[])){try{f(e);}catch(x){}}}
  /* PAS D'ECRAN TITRE, DES LE CHARGEMENT (comme le simulateur) : sinon l'ancienne intro s'installe, part a la 1re touche du rejeu et tire au hasard
     (MESURE : fission, shakeStage — et la route d'apres le portail n'etait plus la meme). Le titre est aussi cache par le style pose par le serveur. */
  const parId=D.getElementById.bind(D);D.getElementById=function(id){return id==='splash'?null:parId(id);};
  D.hasFocus=function(){return false;};
  try{Object.defineProperty(D,'hidden',{get:()=>false});Object.defineProperty(D,'visibilityState',{get:()=>'visible'});}catch(e){}
  W.matchMedia=function(){return {matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}};};
  try{Object.defineProperty(W,'devicePixelRatio',{get:()=>1});}catch(e){}
  for(const [k,v] of [['userAgent','sim'],['hardwareConcurrency',8],['maxTouchPoints',0]])try{Object.defineProperty(navigator,k,{get:()=>v});}catch(e){}
  try{delete Navigator.prototype.serviceWorker;}catch(e){}
  /* ----- ni sauvegarde, ni ouvrier, ni reseau ----- */
  try{Storage.prototype.getItem=function(){return null;};Storage.prototype.setItem=function(){};Storage.prototype.removeItem=function(){};}catch(e){}
  W.Worker=function(){return {postMessage(){},terminate(){},addEventListener(){},removeEventListener(){},onmessage:null,onerror:null};};
  const jamais=()=>new Promise(function(){});
  W.fetch=function(){return jamais();};
  /* ----- AUCUN SON : un faux contexte audio (celui du simulateur), et aucune balise ne joue ----- */
  function fauxNoeud(){return new Proxy({},{get(t,p){
    if(p==='connect'||p==='disconnect'||p==='start'||p==='stop'||p==='setTargetAtTime'||p==='exponentialRampToValueAtTime'||p==='linearRampToValueAtTime'||p==='setValueAtTime'||p==='cancelScheduledValues')return ()=>{};
    if(p==='frequency'||p==='gain'||p==='detune'||p==='type'||p==='value'||p==='playbackRate')return {value:0,setValueAtTime(){},linearRampToValueAtTime(){}};return undefined;},set(){return true;}});}
  W.AudioContext=W.webkitAudioContext=function(){return {currentTime:0,state:'running',createGain(){return fauxNoeud();},createOscillator(){return fauxNoeud();},createBufferSource(){return fauxNoeud();},
    createDelay(){return fauxNoeud();},createFilter(){return fauxNoeud();},createPanner(){return fauxNoeud();},createStereoPanner(){return fauxNoeud();},createAnalyser(){return fauxNoeud();},createConvolver(){return fauxNoeud();},
    createBuffer(){return {getChannelData(){return new Float32Array(2);}};},destination:fauxNoeud(),resume(){return Promise.resolve();}};};
  try{HTMLMediaElement.prototype.play=function(){return jamais();};Object.defineProperty(HTMLMediaElement.prototype,'muted',{get:()=>true,set(){}});}catch(e){}
  W.alert=function(){};W.confirm=function(){return true;};W.prompt=function(){return null;};W.open=function(){return null;};
  W.__ENV={clk:CLK,tick:tick,minuteries:TIM,raf:RAF,fire:fire,seed:seed,ecoutes:LISTENERS};
})();
