#!/usr/bin/env node
// ENVIRONNEMENT HEADLESS PARTAGE — stubs DOM/WebGL/audio + chargement du gros script de train.html.
// Extrait de sim-train.js pour que sim-train.js ET check-iso.js chargent EXACTEMENT le meme jeu :
// deux copies de ces stubs, et les deux outils finiraient par ne plus tester la meme chose.
const fs=require('fs');
const path=require('path');
const vm=require('vm');
const THREE=require('../sim/node_modules/three');

function loadGame(search){
  const html=fs.readFileSync(path.join(__dirname,'..','..','VERSION PRINCIPALE','index.html'),'utf8');
  const blocks=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
  const code=blocks.find(b=>b.includes('survTick')&&b.includes('buildTrack'));
  if(!code){ console.error('script principal introuvable'); process.exit(1); }
  // ---------- stubs DOM ----------
  function fakeEl(id){
    const el={
      id,style:new Proxy({},{get:(t,k)=>k in t?t[k]:(k==='setProperty'||k==='removeProperty'||k==='getPropertyValue'?function(){return '';}:undefined),set:(t,k,v)=>{t[k]=v;return true;}}),dataset:{},children:[],value:'',textContent:'',innerHTML:'',
      className:'',classList:{add(){},remove(){},toggle(){},contains(){return false;}},
      addEventListener(){},removeEventListener(){},appendChild(c){this.children.push(c);return c;},
      removeChild(){},play(){return Promise.resolve();},pause(){},load(){},removeAttribute(){},hasAttribute(){return false;},remove(){},replaceWith(){},cloneNode(){return fakeEl(id);},prepend(c){this.children.unshift(c);},append(c){this.children.push(c);},closest(){return null;},matches(){return false;},before(){},after(){},animate(){return{cancel(){},finished:Promise.resolve()};},insertBefore(c){this.children.unshift(c);return c;},setAttribute(){},
      getAttribute(){return null;},focus(){},blur(){},click(){},scrollIntoView(){},
      getBoundingClientRect(){return{left:0,top:0,width:1,height:1};},
      getContext(){return fakeCtx;},contains(){return false;},
      querySelector(){return fakeEl('q');},querySelectorAll(){return [fakeEl('a'),fakeEl('b'),fakeEl('c'),fakeEl('d'),fakeEl('e'),fakeEl('f'),fakeEl('g'),fakeEl('h')];},
      setPointerCapture(){},releasePointerCapture(){},requestFullscreen(){},
      insertAdjacentHTML(){},
      width:0,height:0,offsetWidth:100,offsetHeight:100,
    };
    for(const k of ['parentNode','firstChild','lastChild','nextSibling','previousSibling','parentElement','firstElementChild','lastElementChild','nextElementSibling']) Object.defineProperty(el,k,{get(){return el['_'+k]||(el['_'+k]=fakeEl(k));}});
    return el;
  }
  const fakeCtx=new Proxy({},{
    get(t,p){
      if(p==='canvas')return fakeEl('canvas');
      if(p==='createLinearGradient'||p==='createRadialGradient'||p==='createPattern') return ()=>({addColorStop(){}});
      if(p==='getImageData'||p==='createImageData') return (a,b,c,d)=>{const w=(p==='createImageData'?a:c)|0||1,h=(p==='createImageData'?b:d)|0||1;return{data:new Uint8ClampedArray(w*h*4),width:w,height:h};};
      if(p==='measureText') return ()=>({width:0});
      if(p==='getContext') return ()=>fakeCtx;
      return typeof p==='string'?(()=>{}):undefined;
    },set(){return true;}
  });
  const els={};
  const documentStub={
    body:fakeEl('body'),head:fakeEl('head'),documentElement:fakeEl('html'),
    createTreeWalker(){return{nextNode(){return null;}};},createTextNode(t){return fakeEl('text');},createDocumentFragment(){return fakeEl('frag');},createRange(){return{selectNodeContents(){},getBoundingClientRect(){return{left:0,top:0,width:1,height:1};}};},
    createElement(tag){return fakeEl(tag);},
    getElementById(id){if(!els[id])els[id]=fakeEl(id);return els[id];},
    querySelector(sel){return null;},
    querySelectorAll(){return [];},
    addEventListener(){},removeEventListener(){},
    createElementNS(){return fakeEl('ns');},
    createTextNode(){return{nodeType:3,textContent:''};},
    createDocumentFragment(){return fakeEl('frag');},
    hasFocus(){return false;},
    title:'',hidden:false,visibilityState:'visible',
    exitFullscreen(){},cookie:'',
    fonts:{ready:Promise.resolve(),add(){},load(){return Promise.resolve([]);}},
  };
  const LISTENERS={};
  const CLK={t:1000};
  const windowStub={
    innerWidth:1280,innerHeight:720,devicePixelRatio:1,
    addEventListener(t,f,o){(LISTENERS[t]=LISTENERS[t]||[]).push(f);},removeEventListener(){},dispatchEvent(){return true;},
    matchMedia(){return{matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}};},
    requestAnimationFrame(){return 0;},cancelAnimationFrame(){},
    getComputedStyle(){return{display:'block',opacity:1};},
    location:{search:'?train=1&sim=1',href:'http://localhost/train.html?train=1&sim=1'},
    navigator:{hardwareConcurrency:8,maxTouchPoints:0,userAgent:'sim'},
    AudioContext:function(){return{currentTime:0,state:'running',createGain(){return fakeNode();},createOscillator(){return fakeNode();},createBufferSource(){return fakeNode();},createDelay(){return fakeNode();},createFilter(){return fakeNode();},createPanner(){return fakeNode();},createStereoPanner(){return fakeNode();},createAnalyser(){return fakeNode();},createConvolver(){return fakeNode();},createBuffer(){return{getChannelData(){return new Float32Array(2);}};},destination:fakeNode(),resume(){return Promise.resolve();}};},
    setTimeout,clearTimeout,setInterval,clearInterval,
    performance:{now:()=>CLK.t,mark(){},measure(){},timeOrigin:0},
    requestIdleCallback(){return 0;},cancelIdleCallback(){},
    scrollTo(){},alert(){},confirm(){return true;},prompt(){return null;},
    open(){return null;},close(){},stop(){},
  };
  function fakeNode(){
    return new Proxy({}, {get(t,p){ if(p==='connect'||p==='disconnect'||p==='start'||p==='stop'||p==='setTargetAtTime'||p==='exponentialRampToValueAtTime'||p==='linearRampToValueAtTime'||p==='setValueAtTime'||p==='cancelScheduledValues') return ()=>{}; if(p==='frequency'||p==='gain'||p==='detune'||p==='type'||p==='value'||p==='playbackRate') return{value:0,setValueAtTime(){},linearRampToValueAtTime(){}}; return undefined; },set(){return true;}});
  }
  function loose(o){ return new Proxy(o,{get(t,p){ if(p in t) return t[p]; if(typeof p==='symbol'||p==='then') return undefined; return loose(function(){return loose({});}); }}); }
  THREE.WebGLRenderer=function(opts){ return loose(THREE.__WR0(opts)); };
  THREE.__WR0=function(opts){
    return{domElement:fakeEl('canvas'),properties:{get(){return{programs:null};}},setSize(){},setPixelRatio(){},render(){},dispose(){},setClearColor(){},shadowMap:{enabled:false,type:0,autoUpdate:false,needsUpdate:false},info:{render:{calls:0}},getContext(){return null;},setAnimationLoop(){},capabilities0:{},outputEncoding:0,toneMapping:0,xr:{addEventListener(){}},getSize(){return{width:1280,height:720};},setViewport(){},setScissor(){},setScissorTest(){},resetState(){},initTexture(){},setRenderTarget(){},clear(){},compile(){},getPixelRatio(){return 1;}};
  };

  // ---------- contexte ----------
  const sandbox={
    console,THREE,Math,JSON,Date,Array,Object,String,Number,Boolean,
    Promise,RegExp,Error,Uint8Array,Uint16Array,Uint32Array,Int8Array,Int16Array,Int32Array,
    Float32Array,Float64Array,ArrayBuffer,Map,Set,WeakMap,WeakSet,Symbol,Proxy,Reflect,
    parseInt,parseFloat,isNaN,isFinite,encodeURIComponent,decodeURIComponent,encodeURI,decodeURI,
    TextDecoder,TextEncoder,setTimeout,clearTimeout,setInterval,clearInterval,queueMicrotask,
    document:documentStub,window:windowStub,navigator:windowStub.navigator,
    innerWidth:1280,innerHeight:720,devicePixelRatio:1,screen:{width:1280,height:720},
    localStorage:{getItem(){return null;},setItem(){},removeItem(){}},
    sessionStorage:{getItem(){return null;},setItem(){},removeItem(){}},
    location:windowStub.location,performance:windowStub.performance,
    addEventListener(t,f,o){(LISTENERS[t]=LISTENERS[t]||[]).push(f);},removeEventListener(){},requestAnimationFrame(){return 0;},cancelAnimationFrame(){},
    matchMedia:windowStub.matchMedia,AudioContext:windowStub.AudioContext,webkitAudioContext:windowStub.AudioContext,
    atob:(s)=>Buffer.from(s,'base64').toString('binary'),btoa:(s)=>Buffer.from(s,'binary').toString('base64'),
    // HEADLESS : pas de serveur d'enregistrement. `fetch('/train-save', POST)` est intercepté ici et
    // écrit DIRECTEMENT results/champion.json + results/champions/ (même logique que rec-server.js).
    // Sans ce stub, l'autosave du mode entraînement lève `fetch is not defined` et tue le run à gen 10.
    fetch:(url,opts)=>{
      return new Promise((resolve,reject)=>{
        const u=String(url||'');
        if(opts&&opts.method==='POST'&&/\/train-save/.test(u)){
          try{
            const raw=opts.body, j=JSON.parse(raw);
            if(!Array.isArray(j.w)||!j.w.length) return resolve({ok:false});
            const resDir=path.join(__dirname,'results');
            fs.mkdirSync(resDir,{recursive:true});
            fs.writeFileSync(path.join(resDir,'champion.json'),raw);
            const hist=path.join(resDir,'champions');
            fs.mkdirSync(hist,{recursive:true});
            fs.writeFileSync(path.join(hist,'gen'+String(j.gen||0).padStart(5,'0')+'-note'+(j.note||0)+'.json'),raw);
            resolve({ok:true});
          }catch(e){ resolve({ok:false}); }
        }else{
          reject(new Error('fetch indisponible en headless : '+u));
        }
      });
    },
    IS_SIM:true,devicePixelRatio:1,
  };
  sandbox.globalThis=sandbox;
  sandbox.self=sandbox;
  sandbox.top=sandbox;
  sandbox.window=new Proxy(sandbox,{get(t,p){ if(p in t)return t[p]; return windowStub[p]; },set(t,p,v){ t[p]=v; return true; }});
  sandbox.location=windowStub.location={search:search,href:'http://localhost/train.html'+search};
  for(const n of ['MutationObserver','ResizeObserver','IntersectionObserver','PerformanceObserver']) if(!sandbox[n]) sandbox[n]=function(){return{observe(){},disconnect(){},unobserve(){},takeRecords(){return[];}};};
  if(!sandbox['requestIdleCallback']) sandbox['requestIdleCallback']=new Proxy(function(){},{get:(t,k)=>k===Symbol.toPrimitive?()=>0:(typeof k==='symbol'?undefined:t[k]||function(){return{};}),construct:()=>({observe(){},disconnect(){}}),apply:()=>({})});
  if(!sandbox['apresPolice']) sandbox['apresPolice']=new Proxy(function(){},{get:(t,k)=>k===Symbol.toPrimitive?()=>0:(typeof k==='symbol'?undefined:t[k]||function(){return{};}),construct:()=>({observe(){},disconnect(){}}),apply:()=>({})});
  if(!sandbox['Image']) sandbox['Image']=new Proxy(function(){},{get:(t,k)=>k===Symbol.toPrimitive?()=>0:(typeof k==='symbol'?undefined:t[k]||function(){return{};}),construct:()=>({observe(){},disconnect(){}}),apply:()=>({})});
  if(!sandbox['NodeFilter']) sandbox['NodeFilter']=new Proxy(function(){},{get:(t,k)=>k===Symbol.toPrimitive?()=>0:(typeof k==='symbol'?undefined:t[k]||function(){return{};}),construct:()=>({observe(){},disconnect(){}}),apply:()=>({})});
  if(!sandbox.getComputedStyle) sandbox.getComputedStyle=()=>new Proxy({},{get:(t,k)=>k==='getPropertyValue'?()=>'':''});
  if(!sandbox.requestIdleCallback) sandbox.requestIdleCallback=f=>setTimeout(f,0);
  vm.createContext(sandbox);
  try{
    const RP=path.join(__dirname,'..','..','VERSION PRINCIPALE')+path.sep;
    for(const b of blocks){ if(b===code)continue; try{ vm.runInContext(b,sandbox,{filename:'preambule'}); }catch(e){ console.error('preambule:',e.message); } }
    for(const f of ['figures.js']){ try{ vm.runInContext(fs.readFileSync(RP+f,'utf8'),sandbox,{filename:f}); }catch(e){ console.error('script externe',f,':',e.message); } }
    const k9=code.lastIndexOf('})();'); const code2=code.slice(0,k9)+'window.__EV=function(e){return eval(e);};\nwindow.__TRK=function(){return{pts:pts,T:T,B:B,Nn:Nn,NP:NP,L:L};};\nwindow.__S=function(){return{mode:mode,s:s,lat:lat,psi:psi,vA:vA,nitroR:nitroR,nitroX:nitroX,nitroOn:nitroOn,gameOver:gameOver,started:started,hopY:hopY,graceT:graceT,fvx:fallVel.x,fvy:fallVel.y,fvz:fallVel.z,fpx:fallPos.x,fpy:fallPos.y,fpz:fallPos.z,eta:CAMV.eta,lmvu:LM.vu,lmx:landMark.position.x,lmy:landMark.position.y,lmz:landMark.position.z,chaPts:CHA.pts,chaN:CHA.n,fx2n:FX2.n,fx2pts:FX2.pts,tricks:runStats.tricks,NP:NP,L:L,rh:ROAD_HALF,airT:fallTR};};\n'+code.slice(k9);
    vm.runInContext(code2,sandbox,{filename:'index.html'});
  }catch(e){
    console.error('ERREUR AU CHARGEMENT:',e.message);
    console.error(e.stack);
    process.exit(1);
  }
  return {
    sandbox:sandbox, THREE:THREE,
    get:function(expr){ return vm.runInContext(expr,sandbox); },
    ev:function(expr){ return sandbox.__EV(expr); },
    clk:CLK,
    fire:function(type,evt){ const e=Object.assign({preventDefault(){},stopPropagation(){},repeat:false},evt); for(const f of (LISTENERS[type]||[])){ try{f(e);}catch(x){} } },
    seed:function(n){ vm.runInContext('(function(a){Math.random=function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};})('+(n|0)+')',sandbox); }
  };
}
module.exports={loadGame:loadGame,THREE:THREE};
