/* LA SONDE DE L'INTERFACE (2026-11-12, interface-opti) — posée avant la première ligne du jeu par banc.cjs.
   Compte, par image : écritures du DOM (MutationObserver), lectures de mise en page (getBoundingClientRect, offset*, client*, getComputedStyle)
   avec la ligne d'index.html qui les fait ; et, à l'instant du relevé : animations qui tournent (visibles / cachées), éléments filtrés, will-change. */
(function(){
  const S={lect:{},mut:0,mutT:{},frames:0,on:0};
  const pile=()=>{const l=(new Error().stack||'').split('\n')[3]||'';const m=l.match(/:(\d+):\d+\)?$/);return m?m[1]:l.trim().slice(0,60)};
  const wrap=(proto,name,kind)=>{const d=Object.getOwnPropertyDescriptor(proto,name);if(!d)return;
    if(d.value){const f=d.value;proto[name]=function(){if(S.on){const k=kind+':'+name+'@'+pile();S.lect[k]=(S.lect[k]||0)+1}return f.apply(this,arguments)}}
    else if(d.get){Object.defineProperty(proto,name,{get(){if(S.on){const k=kind+':'+name+'@'+pile();S.lect[k]=(S.lect[k]||0)+1}return d.get.call(this)},set:d.set,configurable:true})}};
  wrap(Element.prototype,'getBoundingClientRect','R');
  ['offsetWidth','offsetHeight','offsetTop','offsetLeft'].forEach(n=>wrap(HTMLElement.prototype,n,'O'));
  ['clientWidth','clientHeight','scrollTop','scrollHeight'].forEach(n=>wrap(Element.prototype,n,'C'));
  const gcs=window.getComputedStyle;window.getComputedStyle=function(){if(S.on){const k='G@'+pile();S.lect[k]=(S.lect[k]||0)+1}return gcs.apply(this,arguments)};
  new MutationObserver(l=>{if(!S.on)return;for(const m of l){S.mut++;const t=m.target.nodeType===1?m.target:m.target.parentElement;const k=(t?S.nom(t):'?')+':'+m.type+(m.attributeName?'.'+m.attributeName:'');S.mutT[k]=(S.mutT[k]||0)+1}}).observe(document,{subtree:true,attributes:true,childList:true,characterData:true});
  const raf=window.requestAnimationFrame.bind(window);(function c(){S.frames++;raf(c)})();
  S.reset=()=>{S.lect={};S.mut=0;S.mutT={};S.f0=S.frames;S.t0=performance.now();S.on=1};
  S.vis=el=>{for(let e=el;e&&e!==document.documentElement;e=e.parentElement){const c=gcs(e);if(c.display==='none'||c.visibility==='hidden'||+c.opacity===0)return false}const r=el.getBoundingClientRect();return r.width>0&&r.height>0&&r.bottom>0&&r.right>0&&r.top<innerHeight&&r.left<innerWidth};
  S.nom=t=>t.id?'#'+t.id:((typeof t.className==='string'&&t.className?'.'+t.className.trim().split(/\s+/)[0]:t.tagName)+(t.parentElement&&t.parentElement.id?'<#'+t.parentElement.id:''));
  S.etat=()=>{S.on=0;const n=(S.frames-S.f0)||1;const dt=(performance.now()-S.t0)/1000;
    const an=document.getAnimations().filter(a=>a.playState==='running');
    let cache=0,vis=0,infC=0;const det={};
    for(const a of an){const t=a.effect&&a.effect.target;if(!t)continue;const v=S.vis(t);v?vis++:cache++;const inf=a.effect.getTiming().iterations===Infinity;if(!v&&inf)infC++;const nm=(a.animationName||a.transitionProperty||'?');
      let props=[];try{props=a.effect.getKeyframes().flatMap(f=>Object.keys(f)).filter(p=>!['offset','easing','composite','computedOffset'].includes(p))}catch(e){}
      const k=(v?'V ':'C ')+nm+' '+S.nom(t)+' ['+[...new Set(props)].slice(0,4).join(',')+']'+(inf?'∞':'');det[k]=(det[k]||0)+1}
    let filt=0,filtV=0,bd=0,bdV=0,wc=0;const fl=[];
    for(const e of document.querySelectorAll('*')){const c=gcs(e);const hasF=c.filter!=='none';const bdv=c.backdropFilter||c.webkitBackdropFilter||'none';const hasB=bdv!=='none';if(hasF||hasB){const v=S.vis(e);if(hasF){filt++;if(v)filtV++}if(hasB){bd++;if(v)bdV++}if(v)fl.push(S.nom(e)+(hasB?' BD '+bdv:'')+(hasF?' '+c.filter.slice(0,70):''))}if(c.willChange!=='auto')wc++}
    const top=o=>Object.entries(o).sort((a,b)=>b[1]-a[1]).slice(0,16).map(([k,v])=>k+' '+(v/n).toFixed(2));
    return {img_s:+(n/dt).toFixed(1),anim:an.length,animVis:vis,animCache:cache,animCacheInfinies:infC,det:Object.entries(det).map(([k,v])=>v>1?k+' x'+v:k),filtre:filt,filtreVis:filtV,backdrop:bd,backdropVis:bdV,willChange:wc,filtresVisibles:fl,mutParImg:+(S.mut/n).toFixed(2),mutTop:top(S.mutT),lectParImg:top(S.lect),dom:document.querySelectorAll('*').length}};
  window.__S=S;
})();
