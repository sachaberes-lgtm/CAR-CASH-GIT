/* auto-croisements / passages trop près d'elle-même, sur les JSON de toutes.mjs (toutes maps) :
   deux points à > dsMin m d'abscisse l'un de l'autre, à moins de H m en PLAN, et dz = écart d'altitude (le gabarit libre). On rend le pire par route.
   node croise-json.cjs DOSSIER [dsMin=150] [H=40] [seuilDz=30] */
const fs=require('fs'),path=require('path');
const dir=process.argv[2],dsMin=+(process.argv[3]||150),H=+(process.argv[4]||40),SEUIL=+(process.argv[5]||30);
const out=[];
for(const f of fs.readdirSync(dir).filter(f=>f.endsWith('.json'))){
  const m=f.match(/^(\w+)-p(\d+)-g(\d+)\.json$/);if(!m)continue;const o=JSON.parse(fs.readFileSync(path.join(dir,f),'utf8'));if(o.erreur)continue;
  const C=o.ctrl,P=[];let s=0;
  for(let i=0;i<C.length;i++){if(i){const a=C[i-1],b=C[i],d=Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2]),n=Math.max(1,Math.ceil(d/8));for(let k=1;k<=n;k++){s+=d/n;P.push({x:a[0]+(b[0]-a[0])*k/n,y:a[1]+(b[1]-a[1])*k/n,z:a[2]+(b[2]-a[2])*k/n,s});}}else P.push({x:C[0][0],y:C[0][1],z:C[0][2],s:0});}
  const G=new Map();P.forEach((p,k)=>{const key=Math.floor(p.x/H)*100003+Math.floor(p.z/H);let l=G.get(key);if(!l)G.set(key,l=[]);l.push(k);});
  let worst=null;
  for(let a=0;a<P.length;a++){const cx=Math.floor(P[a].x/H),cz=Math.floor(P[a].z/H);
    for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++){const l=G.get((cx+i)*100003+cz+j);if(!l)continue;
      for(const b of l){if(b<=a||P[b].s-P[a].s<dsMin)continue;const dh=Math.hypot(P[a].x-P[b].x,P[a].z-P[b].z);if(dh>H)continue;const dz=Math.abs(P[a].y-P[b].y);
        if(!worst||dz<worst.dz||(dz===worst.dz&&dh<worst.dh))worst={dz:+dz.toFixed(1),dh:+dh.toFixed(1),s1:Math.round(P[a].s),s2:Math.round(P[b].s)};}}}
  out.push({carte:m[1],pal:+m[2],g:+m[3],L:Math.round(s),worst});
}
const by={};for(const r of out){const k=r.carte+' p'+r.pal;(by[k]=by[k]||[]).push(r);}
for(const k of Object.keys(by)){const R=by[k],bad=R.filter(r=>r.worst&&r.worst.dz<SEUIL);
  console.log(k.padEnd(12),'n',R.length,'avec croisement',R.filter(r=>r.worst).length,'dz<'+SEUIL+' :',bad.length,'|',bad.sort((a,b)=>a.worst.dz-b.worst.dz).slice(0,6).map(r=>'g'+r.g+' dz'+r.worst.dz+'/dh'+r.worst.dh+'@'+r.worst.s1+'-'+r.worst.s2).join('  '));}
