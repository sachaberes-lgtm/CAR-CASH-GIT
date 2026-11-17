const vm=require('vm'),fs=require('fs');
const src=fs.readFileSync(process.argv[2],'utf8');
function essai(q){
  class GL{getError(){return 0}drawElements(){}getParameter(){return 1}isContextLost(){return false}}
  class GL2{getError(){return 0}drawElements(){}clientWaitSync(){return 0}}
  class C2{putImageData(){}fillRect(){}measureText(){return {}}}
  const nat=[GL.prototype.getError,GL2.prototype.drawElements,C2.prototype.putImageData,GL2.prototype.getError];
  const ls={};const w={location:{search:q},localStorage:{getItem:k=>ls[k]??null,setItem:(k,v)=>ls[k]=String(v),removeItem:k=>delete ls[k]},
    performance:{now:()=>Number(process.hrtime.bigint())/1e6},WebGLRenderingContext:GL,WebGL2RenderingContext:GL2,CanvasRenderingContext2D:C2,
    EventTarget:class{addEventListener(){}removeEventListener(){}},setTimeout,clearTimeout,setInterval,clearInterval,requestAnimationFrame:()=>0,
    MessageChannel:class{constructor(){this.port1={postMessage(){}};this.port2={}}},FinalizationRegistry,document:{addEventListener(){},hidden:false},innerWidth:390,innerHeight:844,Float64Array,Int32Array,Uint32Array,WeakMap,Set,Object,Reflect,Math,String,Array,Function,RegExp};
  w.window=w;const ctx=vm.createContext(w);
  vm.runInContext(src+';this.__r={MG:MG,MGR:MGR,mgSt:mgSt,mgRSec:mgRSec};',ctx);
  const r=w.__r,o={q,MG_on:r.MG.on,MGR_on:r.MGR.on,senDOn:r.MGR.senDOn,pouls:!!r.MG.pc,
    natifs:[GL.prototype.getError===nat[0],GL2.prototype.drawElements===nat[1],C2.prototype.putImageData===nat[2]]};
  r.mgSt('essai');r.mgSt('');new GL().getError();new GL2().drawElements();new C2().putImageData();
  const M=[];r.mgRSec(M);o.sousTranches=r.MGR.spN.length-1;o.appels=Array.from(r.MGR.yC).reduce((a,b)=>a+b,0);o.M=M;
  /* (3e tour) LE GUET DU DÉMARRAGE remet ses originaux (getError, drawElements) par-dessus nos enveloppes : la seconde suivante (mgRSec) doit les REPOSER, sans doubler les autres */
  if(r.MGR.on){GL2.prototype.getError=nat[3];GL2.prototype.drawElements=nat[1];const n0=Array.from(r.MGR.yC).reduce((a,b)=>a+b,0);
    r.mgRSec([]);new GL2().getError();new GL2().drawElements();new C2().putImageData();
    o.guet={reposes:r.MGR.repose|0,getError_a_nous:!!GL2.prototype.getError.__mg,drawElements_a_nous:!!GL2.prototype.drawElements.__mg,appels_de_plus:Array.from(r.MGR.yC).reduce((a,b)=>a+b,0)-n0};}
  return o;}
for(const q of ['','?perfrec=0','?perfrec=2','?perfrec=2&sans=rafales','?perfrec=2&sans=pouls','?perfrec=2&sans=glenvois'])console.log(JSON.stringify(essai(q)));
