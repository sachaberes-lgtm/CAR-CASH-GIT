(function(){
if(window.__S)return 'deja';
const S=window.__S={c:{},t0:performance.now()};
const inc=(k,n)=>{S.c[k]=(S.c[k]||0)+(n||1);};
const P=(proto,name,k,fn)=>{const o=proto[name];if(!o)return;proto[name]=function(){inc(k);if(fn)try{fn.apply(this,arguments);}catch(e){}return o.apply(this,arguments);};};
for(const G of [window.WebGL2RenderingContext,window.WebGLRenderingContext]){if(!G)continue;const p=G.prototype;
 ['drawElements','drawArrays','drawElementsInstanced','drawArraysInstanced'].forEach(n=>P(p,n,'gl.draw',function(){S._img=1;}));
 P(p,'texImage2D','gl.texImage2D',function(){const a=arguments;let b=0;if(a.length>=9&&typeof a[3]==='number')b=a[3]*a[4]*4;else{const s=a[a.length-1];if(s&&s.width)b=s.width*s.height*4;}inc('gl.texOctets',b);});
 P(p,'texSubImage2D','gl.texSubImage2D');P(p,'readPixels','gl.readPixels');P(p,'bindFramebuffer','gl.bindFB');}
{const r=window.requestAnimationFrame;let enC=false;}
// une "image dessinée" = une image d'animation pendant laquelle au moins un draw a eu lieu
(function boucle(){S._img=0;requestAnimationFrame(function(){if(S._img)inc('imagesGL');inc('raf');boucle();});})();
const C2=CanvasRenderingContext2D.prototype;P(C2,'drawImage','c2.drawImage');P(C2,'getImageData','c2.getImageData');P(C2,'putImageData','c2.putImageData');
P(HTMLCanvasElement.prototype,'toBlob','cv.toBlob');P(HTMLCanvasElement.prototype,'toDataURL','cv.toDataURL');
{const o=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(t){inc('cv.getContext.'+t);return o.apply(this,arguments);};}
{const d=Object.getOwnPropertyDescriptor(Element.prototype,'innerHTML');Object.defineProperty(Element.prototype,'innerHTML',{get:d.get,set:function(v){inc('innerHTML=');inc('innerHTML.octets',String(v).length);const id=this.id||this.className||this.tagName;inc('innerHTML@'+String(id).slice(0,24));return d.set.call(this,v);},configurable:true});}
P(Element.prototype,'getBoundingClientRect','lay.gBCR');P(Element.prototype,'getClientRects','lay.gCR');
for(const n of ['offsetWidth','offsetHeight','offsetTop','offsetLeft']){const d=Object.getOwnPropertyDescriptor(HTMLElement.prototype,n);Object.defineProperty(HTMLElement.prototype,n,{get:function(){inc('lay.'+n);return d.get.call(this);},configurable:true});}
for(const n of ['scrollWidth','clientWidth','scrollLeft']){const d=Object.getOwnPropertyDescriptor(Element.prototype,n);Object.defineProperty(Element.prototype,n,{get:function(){inc('lay.'+n);return d.get.call(this);},set:d.set,configurable:true});}
{const o=window.getComputedStyle;window.getComputedStyle=function(){inc('lay.gCS');return o.apply(this,arguments);};}
{const o=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){inc('ls.setItem');inc('ls.octets',String(v).length);inc('ls@'+k);return o.apply(this,arguments);};}
{const o=URL.createObjectURL;URL.createObjectURL=function(){inc('url.create');return o.apply(this,arguments);};}
window.__Sraz=function(){S.c={};S.t0=performance.now();return 1;};
window.__Slit=function(){const s=(performance.now()-S.t0)/1000,o={sec:+s.toFixed(1)};Object.keys(S.c).sort().forEach(k=>o[k]=S.c[k]);
 o['imagesGL/s']=+((S.c.imagesGL||0)/s).toFixed(1);o['draw/s']=Math.round((S.c['gl.draw']||0)/s);o['draw/image']=Math.round((S.c['gl.draw']||0)/Math.max(1,S.c.imagesGL||0));return o;};
window.__Setat=function(){const W=innerWidth,H=innerHeight,an=document.getAnimations(),R={noeuds:document.getElementsByTagName('*').length,noeudsBq:(document.getElementById('gBq')||{getElementsByTagName:()=>[]}).getElementsByTagName('*').length,anims:an.length,animsCourent:0,animsHorsVue:0,animsInvisibles:0,infinies:0,filtres:0,filtresDrop:0,backdrop:0,willChange:0,ombres:0,toiles:document.querySelectorAll('canvas').length,imgs:document.querySelectorAll('#gBq img').length};
 const parAnim={};
 an.forEach(a=>{if(a.playState!=='running')return;R.animsCourent++;const t=a.effect&&a.effect.target;if(!t)return;const tm=a.effect.getTiming();if(tm.iterations===Infinity)R.infinies++;
  const b=t.getBoundingClientRect();const hors=b.right<0||b.left>W||b.bottom<0||b.top>H||b.width<1;const inv=!t.checkVisibility||!t.checkVisibility({visibilityProperty:true,opacityProperty:true});if(hors)R.animsHorsVue++;if(inv)R.animsInvisibles++;
  const k=(a.animationName||a.constructor.name)+(hors?' HORS':'')+(inv?' INVIS':'');parAnim[k]=(parAnim[k]||0)+1;});
 const top=Object.entries(parAnim).sort((a,b)=>b[1]-a[1]).slice(0,25);R.parAnim=top;
 const sel=document.querySelectorAll('#gBq *, #gAct *, #gBq');const filt={};
 sel.forEach(e=>{const cs=getComputedStyle(e);if(cs.display==='none')return;if(cs.filter!=='none'){R.filtres++;if(/drop-shadow/.test(cs.filter))R.filtresDrop++;const k='F '+(e.id||String(e.className).slice(0,20));filt[k]=(filt[k]||0)+1;}if(cs.backdropFilter&&cs.backdropFilter!=='none'){R.backdrop++;const k='B '+(e.id||String(e.className).slice(0,20));filt[k]=(filt[k]||0)+1;}if(cs.willChange!=='auto')R.willChange++;if(cs.boxShadow!=='none')R.ombres++;});
 R.filt=Object.entries(filt).sort((a,b)=>b[1]-a[1]).slice(0,20);
 return R;};
return 'ok';})()
