/* BANC DU CREUSEMENT DE LA GROTTE (2026-11-13, grotte-vite) : rejoue le travailleur du creusement hors du navigateur.
   captures/<nom>.json = le message envoyé au travailleur (capturé au banc navigateur), captures/travailleur.js = son code.
   node creuse.mjs [code.js] [capture…]  →  temps et empreinte de la grille rendue (P, D, SI, SD, dir, cle, chS, nAir). */
import fs from 'fs';import vm from 'vm';import path from 'path';
const here=path.dirname(new URL(import.meta.url).pathname);
const args=process.argv.slice(2);const codeF=args[0]&&args[0].endsWith('.js')?args.shift():path.join(here,'captures/travailleur.js');
const caps=args.length?args:fs.readdirSync(path.join(here,'captures')).filter(f=>f.endsWith('.json')).map(f=>path.join(here,'captures',f));
const rev=(k,v)=>v&&v.__t?new globalThis[v.__t](v.a):v;
const code=fs.readFileSync(codeF,'utf8');const REP=+(process.env.REP||3);
function fnv(h,a){const u=a instanceof Uint8Array?a:new Uint8Array(a.buffer,a.byteOffset,a.byteLength);for(let i=0;i<u.length;i++){h^=u[i];h=Math.imul(h,16777619)>>>0;}return h;}
for(const f of caps){const C=JSON.parse(fs.readFileSync(f,'utf8'),rev);const m=C.msg;let out=null;
  const om=new Function('postMessage',code.replace("'use strict';","'use strict';var onmessage;")+'\nreturn onmessage;')(r=>{out=r;});const ctx={onmessage:om};const ts=[];
  for(let r=0;r<REP;r++){const t0=performance.now();ctx.onmessage({data:structuredClone(m)});ts.push(performance.now()-t0);}
  let h=2166136261>>>0;for(const a of [out.P,out.D,out.SI,out.SD,out.dir])h=fnv(h,a);h=fnv(h,new Float64Array(out.chS));h=fnv(h,new Float64Array(out.cle));h=fnv(h,new Float64Array([out.nAir,out.n]));
  ts.sort((a,b)=>a-b);
  console.log(path.basename(f),'| n='+m.R.n,'| troncons='+out.n,'| air='+out.nAir,'| hash='+h.toString(16),'| ms min '+ts[0].toFixed(0)+' med '+ts[ts.length>>1].toFixed(0),out.et?('| etapes '+JSON.stringify(out.et)):'');}
