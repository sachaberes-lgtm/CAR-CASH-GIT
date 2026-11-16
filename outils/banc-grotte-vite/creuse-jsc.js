/* Le même banc sous JavaScriptCore (le moteur de Safari / de l'iPhone) :
   /System/Library/Frameworks/JavaScriptCore.framework/Versions/A/Helpers/jsc creuse-jsc.js -- code.js capture.json [rep] */
var performance={now:function(){return preciseTime()*1000;}};
var codeF=arguments[0],capF=arguments[1],REP=+(arguments[2]||3);
var rev=function(k,v){return v&&v.__t?new globalThis[v.__t](v.a):v;};
var code=readFile(codeF),txt=readFile(capF);var out=null;
var om=new Function('postMessage','performance',code.replace("'use strict';","'use strict';var onmessage;")+'\nreturn onmessage;')(function(r){out=r;},performance);
function fnv(h,a){var u=a instanceof Uint8Array?a:new Uint8Array(a.buffer,a.byteOffset,a.byteLength);for(var i=0;i<u.length;i++){h^=u[i];h=Math.imul(h,16777619)>>>0;}return h;}
var ts=[],m0=JSON.parse(txt,rev).msg;
for(var r=0;r<REP;r++){var m=JSON.parse(txt,rev).msg;var t0=performance.now();om({data:m});ts.push(performance.now()-t0);}
var h=2166136261>>>0;[out.P,out.D,out.SI,out.SD,out.dir].forEach(function(a){h=fnv(h,a);});h=fnv(h,new Float64Array(out.chS));h=fnv(h,new Float64Array(out.cle));h=fnv(h,new Float64Array([out.nAir,out.n]));
ts.sort(function(a,b){return a-b;});
print(capF.split('/').pop()+' | n='+m0.R.n+' | troncons='+out.n+' | air='+out.nAir+' | hash='+h.toString(16)+' | jsc ms min '+ts[0].toFixed(0)+' med '+ts[ts.length>>1].toFixed(0)+(out.et?' | etapes '+JSON.stringify(out.et):''));
