#!/usr/bin/env node
// ENVIRONNEMENT HEADLESS PARTAGE — stubs DOM/WebGL/audio + chargement du gros script de train.html.
// Extrait de sim-train.js pour que sim-train.js ET check-iso.js chargent EXACTEMENT le meme jeu :
// deux copies de ces stubs, et les deux outils finiraient par ne plus tester la meme chose.
const fs=require('fs');
const path=require('path');
const vm=require('vm');
const THREE=require('../sim/node_modules/three');

function loadGame(search){
  const html=fs.readFileSync(path.join(__dirname,'train.html'),'utf8');
  const blocks=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
  const code=blocks.find(b=>b.includes('survTick')&&b.includes('buildTrack'));
  if(!code){ console.error('script principal introuvable'); process.exit(1); }
  // ---------- stubs DOM ----------
  function fakeEl(id){
    const el={
      id,style:{},dataset:{},children:[],value:'',textContent:'',innerHTML:'',
      className:'',classList:{add(){},remove(){},toggle(){},contains(){return false;}},
      addEventListener(){},removeEventListener(){},appendChild(c){this.children.push(c);return c;},
      removeChild(){},insertBefore(c){this.children.unshift(c);return c;},setAttribute(){},
      getAttribute(){return null;},focus(){},blur(){},click(){},scrollIntoView(){},
      getBoundingClientRect(){return{left:0,top:0,width:1,height:1};},
      getContext(){return fakeCtx;},contains(){return false;},
      querySelector(){return null;},querySelectorAll(){return [];},
      setPointerCapture(){},releasePointerCapture(){},requestFullscreen(){},
      insertAdjacentHTML(){},
      width:0,height:0,offsetWidth:100,offsetHeight:100,parentNode:null,
    };
    return el;
  }
  const fakeCtx=new Proxy({},{
    get(t,p){
      if(p==='canvas')return fakeEl('canvas');
      if(p==='createLinearGradient'||p==='createRadialGradient'||p==='createPattern') return ()=>({addColorStop(){}});
      if(p==='getImageData'||p==='createImageData') return ()=>({data:new Uint8ClampedArray(4),width:1,height:1});
      if(p==='measureText') return ()=>({width:0});
      if(p==='getContext') return ()=>fakeCtx;
      return typeof p==='string'?(()=>{}):undefined;
    },set(){return true;}
  });
  const els={};
  const documentStub={
    body:fakeEl('body'),head:fakeEl('head'),documentElement:fakeEl('html'),
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
  const windowStub={
    innerWidth:1280,innerHeight:720,devicePixelRatio:1,
    addEventListener(){},removeEventListener(){},dispatchEvent(){return true;},
    matchMedia(){return{matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}};},
    requestAnimationFrame(){return 0;},cancelAnimationFrame(){},
    getComputedStyle(){return{display:'block',opacity:1};},
    location:{search:'?train=1&sim=1',href:'http://localhost/train.html?train=1&sim=1'},
    navigator:{hardwareConcurrency:8,maxTouchPoints:0,userAgent:'sim'},
    AudioContext:function(){return{currentTime:0,state:'running',createGain(){return fakeNode();},createOscillator(){return fakeNode();},createBufferSource(){return fakeNode();},createDelay(){return fakeNode();},createFilter(){return fakeNode();},createPanner(){return fakeNode();},createStereoPanner(){return fakeNode();},createAnalyser(){return fakeNode();},createConvolver(){return fakeNode();},createBuffer(){return{getChannelData(){return new Float32Array(2);}};},destination:fakeNode(),resume(){return Promise.resolve();}};},
    setTimeout,clearTimeout,setInterval,clearInterval,
    performance:{now:()=>Date.now()},
    requestIdleCallback(){return 0;},cancelIdleCallback(){},
    scrollTo(){},alert(){},confirm(){return true;},prompt(){return null;},
    open(){return null;},close(){},stop(){},
  };
  function fakeNode(){
    return new Proxy({}, {get(t,p){ if(p==='connect'||p==='disconnect'||p==='start'||p==='stop'||p==='setTargetAtTime'||p==='exponentialRampToValueAtTime'||p==='linearRampToValueAtTime'||p==='setValueAtTime'||p==='cancelScheduledValues') return ()=>{}; if(p==='frequency'||p==='gain'||p==='detune'||p==='type'||p==='value'||p==='playbackRate') return{value:0,setValueAtTime(){},linearRampToValueAtTime(){}}; return undefined; },set(){return true;}});
  }
  THREE.WebGLRenderer=function(opts){
    return{domElement:fakeEl('canvas'),setSize(){},setPixelRatio(){},render(){},dispose(){},setClearColor(){},shadowMap:{enabled:false,type:0,autoUpdate:false,needsUpdate:false},info:{render:{calls:0}},getContext(){return null;},setAnimationLoop(){},capabilities:{},outputEncoding:0,toneMapping:0,xr:{addEventListener(){}},getSize(){return{width:1280,height:720};},setViewport(){},setScissor(){},setScissorTest(){},resetState(){},initTexture(){},setRenderTarget(){},clear(){},compile(){},getPixelRatio(){return 1;}};
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
    addEventListener(){},removeEventListener(){},requestAnimationFrame(){return 0;},cancelAnimationFrame(){},
    matchMedia:windowStub.matchMedia,AudioContext:windowStub.AudioContext,webkitAudioContext:windowStub.AudioContext,
    atob:(s)=>Buffer.from(s,'base64').toString('binary'),btoa:(s)=>Buffer.from(s,'binary').toString('base64'),
    IS_SIM:true,devicePixelRatio:1,
  };
  sandbox.globalThis=sandbox;
  sandbox.self=sandbox;
  sandbox.top=sandbox;
  sandbox.window=new Proxy(sandbox,{get(t,p){ if(p in t)return t[p]; return windowStub[p]; },set(t,p,v){ t[p]=v; return true; }});
  sandbox.location=windowStub.location={search:search,href:'http://localhost/train.html'+search};
  vm.createContext(sandbox);
  try{
    vm.runInContext(code,sandbox,{filename:'train.html'});
  }catch(e){
    console.error('ERREUR AU CHARGEMENT:',e.message);
    console.error(e.stack);
    process.exit(1);
  }
  return {
    sandbox:sandbox, THREE:THREE,
    get:function(expr){ return vm.runInContext(expr,sandbox); }
  };
}
module.exports={loadGame:loadGame,THREE:THREE};
