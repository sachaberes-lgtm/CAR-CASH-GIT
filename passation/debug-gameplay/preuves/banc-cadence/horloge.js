/* Horloge PILOTÉE : performance.now / Date.now / rAF remplacés avant le chargement. Tant que V.virt est faux : horloge réelle (le chargement tourne seul).
   V.go() fige le temps ; ensuite chaque image n'avance que par V.tick(n, ms). */
(function(){
  var rN=performance.now.bind(performance),rD=Date.now.bind(Date),rR=window.requestAnimationFrame.bind(window);
  var V=window.__V={virt:false,t:0,d0:0,q:[],id:0,frames:0};
  performance.now=function(){return V.virt?V.t:rN();};
  Date.now=function(){return V.virt?V.d0+V.t:rD();};
  window.requestAnimationFrame=function(cb){V.q.push([++V.id,cb]);return V.id;};
  window.cancelAnimationFrame=function(i){V.q=V.q.filter(function(x){return x[0]!==i;});};
  function pump(t){if(!V.virt){var c=V.q;V.q=[];for(var i=0;i<c.length;i++){try{c[i][1](t);}catch(e){console.error('raf',e&&e.message);}}}rR(pump);}
  rR(pump);
  V.go=function(){V.t=rN();V.d0=rD()-V.t;V.virt=true;};
  V.tick=function(n,ms,cb){for(var k=0;k<n;k++){V.t+=ms;V.frames++;var c=V.q;V.q=[];for(var i=0;i<c.length;i++)c[i][1](V.t);if(cb&&cb(k)===false)return k+1;}return n;};
})();
