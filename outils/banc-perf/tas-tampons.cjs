#!/usr/bin/env node
/* tas-tampons.cjs (2026-11-07, Perf 3 — P1) : QUI TIENT les tampons typés d'un instantané de tas ?
   Les ~270 Mo de `performance.memory.usedJSHeapSize` sont presque tous des « system / JSArrayBufferData » (Float32Array des géométries, PCM,
   toiles…). Pour chaque tampon : tampon ← ArrayBuffer ← vue typée (Float32Array…) ← PROPRIÉTAIRE (BufferAttribute, objet du jeu…) + nom de l'arête.
   Usage : node outils/banc-perf/tas-tampons.cjs a.heapsnapshot [b.heapsnapshot] [N=40]   (avec b : la différence b − a par groupe)
   Sortie : Mo · nombre · « Vue ← Propriétaire.arête » (le propriétaire est remonté jusqu'à 3 niveaux si c'est un simple tableau). */
const fs=require('fs');
function analyse(f){
  const d=JSON.parse(fs.readFileSync(f,'utf8')),m=d.snapshot.meta,NF=m.node_fields,nf=NF.length,EF=m.edge_fields,ef=EF.length;
  const NT=m.node_types[0],ET=m.edge_types[0],S=d.strings,N=d.nodes,E=d.edges;
  const it=NF.indexOf('type'),inom=NF.indexOf('name'),iss=NF.indexOf('self_size'),iec=NF.indexOf('edge_count');
  const ety=EF.indexOf('type'),enm=EF.indexOf('name_or_index'),eto=EF.indexOf('to_node');
  const n=N.length/nf,debut=new Int32Array(n+1);let e0=0;
  for(let i=0;i<n;i++){debut[i]=e0;e0+=N[i*nf+iec];}debut[n]=e0;
  const nom=i=>S[N[i*nf+inom]],typ=i=>NT[N[i*nf+it]],ss=i=>N[i*nf+iss];
  // arêtes inverses (de → vers), seulement les arêtes de propriété/élément/interne utiles : on garde tout, compact (Int32Array)
  const nE=E.length/ef,from=new Int32Array(nE),to=new Int32Array(nE);
  for(let i=0;i<n;i++)for(let e=debut[i];e<debut[i+1];e++){from[e]=i;to[e]=E[e*ef+eto]/nf;}
  const premier=new Int32Array(n).fill(-1),suivant=new Int32Array(nE).fill(-1); // listes chaînées des arêtes entrantes
  for(let e=0;e<nE;e++){const t=to[e];suivant[e]=premier[t];premier[t]=e;}
  const nomArete=e=>{const t=ET[E[e*ef+ety]],v=E[e*ef+enm];return (t==='element'||t==='hidden')?'['+v+']':S[v];};
  const typeArete=e=>ET[E[e*ef+ety]];
  const groupes=new Map();let total=0;
  const data=[];for(let i=0;i<n;i++)if(nom(i)==='system / JSArrayBufferData'&&ss(i)>0)data.push(i);
  for(const di of data){
    total+=ss(di);
    let ab=-1;for(let e=premier[di];e>=0;e=suivant[e]){const p=from[e];if(nom(p)==='ArrayBuffer'||nom(p)==='SharedArrayBuffer'){ab=p;break;}}
    let vue='?',prop='(sans propriétaire)',ar='';
    if(ab>=0){
      let tv=-1;for(let e=premier[ab];e>=0;e=suivant[e]){const p=from[e];if(/Array$/.test(nom(p))&&typeArete(e)==='internal'||/(Float|Int|Uint|Uint8Clamped)\w*Array$/.test(nom(p))){tv=p;break;}}
      if(tv>=0){vue=nom(tv);
        let best=null;for(let e=premier[tv];e>=0;e=suivant[e]){const p=from[e],t=typeArete(e);if(t==='weak'||t==='shortcut')continue;if(t==='internal'&&nomArete(e)!=='elements')continue;best=[p,e];if(typeArete(e)==='property')break;}
        if(best){let p=best[0],e=best[1];ar=nomArete(e);prop=nom(p);
          // un simple tableau / un contexte : on monte d'un cran pour trouver le vrai propriétaire
          for(let k=0;k<3&&(/^\(?(object elements|object properties|array|context)/.test(prop)||prop===''||prop==='Array'||prop==='system / Context'||prop==='Object'&&false);k++){
            let up=null;for(let e2=premier[p];e2>=0;e2=suivant[e2]){const t=typeArete(e2);if(t==='weak'||t==='shortcut')continue;up=[from[e2],e2];if(t==='property')break;}
            if(!up)break;ar=nomArete(up[1])+'.'+ar;p=up[0];prop=nom(p);}}
      } else { // pas de vue typée : tampon retenu par l'ArrayBuffer seul (PCM d'un AudioBuffer, toile…)
        let best=null;for(let e=premier[ab];e>=0;e=suivant[e]){const t=typeArete(e);if(t==='weak'||t==='shortcut')continue;best=[from[e],e];break;}
        if(best){vue='ArrayBuffer';prop=nom(best[0]);ar=nomArete(best[1]);}}
    }
    const k=vue+' ← '+prop+'.'+ar.replace(/\[\d+\]/g,'[i]');const g=groupes.get(k)||{o:0,n:0};g.o+=ss(di);g.n++;groupes.set(k,g);
  }
  return {groupes,total,n:data.length};
}
const [a,b,nn]=[process.argv[2],process.argv[3]&&!/^\d+$/.test(process.argv[3])?process.argv[3]:null,+(process.argv.find((x,i)=>i>2&&/^\d+$/.test(x))||40)];
const A=analyse(a);
if(!b){console.log('tampons',A.n,'·',(A.total/1048576).toFixed(1),'Mo');[...A.groupes].sort((x,y)=>y[1].o-x[1].o).slice(0,nn).forEach(([k,v])=>console.log((v.o/1048576).toFixed(2).padStart(8),'Mo',String(v.n).padStart(6),k));process.exit(0);}
const B=analyse(b);
console.log('A',A.n,'tampons',(A.total/1048576).toFixed(1),'Mo · B',B.n,'tampons',(B.total/1048576).toFixed(1),'Mo');
const L=[];for(const [k,v] of B.groupes){const u=A.groupes.get(k)||{o:0,n:0};L.push([k,v.o-u.o,v.n-u.n,v.o]);}
for(const [k,u] of A.groupes)if(!B.groupes.has(k))L.push([k,-u.o,-u.n,0]);
L.sort((x,y)=>y[1]-x[1]);console.log('   Δ Mo  Δ nombre    B Mo  groupe');
L.slice(0,nn).forEach(([k,d,dc,v])=>console.log((d/1048576).toFixed(2).padStart(8),String(dc).padStart(8),(v/1048576).toFixed(2).padStart(8),k));
