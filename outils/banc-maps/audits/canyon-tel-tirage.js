(function(){const o={lignes:[],ms:{}};for(const pal of [0,10,20]){let tot=0;for(let g=101;g<=124;g++){const t0=performance.now();const r=dbgGenRoute('canyon',g,pal);const dt=performance.now()-t0;tot+=dt;let h=2166136261>>>0;const f=function(v){const s=String(v);for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)>>>0;}};
if(r.erreur){o.lignes.push(pal+':'+g+':ERR '+String(r.erreur).slice(0,80));continue;}
for(const p of r.ctrl){f(p[0]);f(p[1]);f(p[2]);}if(r.N)for(const p of r.N){f(p[0]);f(p[1]);f(p[2]);}for(const m of r.marks1)f(m.i0+'/'+m.i1+'/'+m.fig);
o.lignes.push(pal+':'+g+':'+h.toString(16)+':'+r.ctrl.length+':'+(r.rythme?r.rythme.note:'?'));}o.ms['palier'+pal]=Math.round(tot/24);}
o.tirage=(typeof dbgCanyonTirage==='function')?dbgCanyonTirage():null;return o;})()
