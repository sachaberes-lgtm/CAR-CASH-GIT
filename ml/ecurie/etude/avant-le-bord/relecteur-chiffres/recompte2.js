#!/usr/bin/env node
/* ===== LE RECOMPTE ADVERSE, suite (28/11/2026, le relecteur des chiffres) =====
   (a) decollages subis par minute de sol selon la vitesse de la derniere vue au sol (> ou <= 143), par carte, et leur part mortelle ;
   (b) la variation de vitesse sur 1 s, nitro tenue ou coupee, au-dessus de 130 m/s ;
   (c) la condition « contre » de gardeOn (gardeT .5 / .7, gardeM 4) : part des vues au sol sur decor, et chez les morts / poses ;
   (d) les ecarts de perimetre avec relecture.js (180 / 24). Lit les traces de sortie-preparee. Aucune course.
   usage : node recompte2.js > recompte2.txt */
'use strict';
const fs=require('fs'),path=require('path'),zlib=require('zlib');
const LIG=path.join(__dirname,'..','..','sortie-preparee','sorties','lignes');
const DECOR={canyon:1,grotte:1,jade:1,ville:1};const P=s=>console.log(s);
const DOUBLES=/^libre-(3970400|3970585|3970659)$/;
const C=[];
for(const n of fs.readdirSync(LIG).filter(x=>/\.jsonl\.gz$/.test(x)).sort()){
  const L=zlib.gunzipSync(fs.readFileSync(path.join(LIG,n))).toString().trim().split('\n').map(x=>JSON.parse(x));
  C.push({nom:n.replace(/\.jsonl\.gz$/,''),h:L[0],V:L.slice(1).filter(v=>!v.erreurDiag)});}
/* (a) */
const T={};
for(const c of C){if(DOUBLES.test(c.nom))continue;
  for(const v of c.V)if(v.mo==='s'&&DECOR[v.c]){const k=v.c+(v.v>143?' >143':' <=143');(T[k]=T[k]||{vues:0,dec:0,morts:0}).vues++;}
  const ev=(c.h.ev||[]).filter(e=>['decol','pose','mort'].includes(e[1]));
  for(let i=0;i<ev.length;i++){const e=ev[i];if(e[1]!=='decol')continue;
    let S=null;for(const v of c.V){if(v.t>=e[0]-1e-6)break;if(v.mo==='s')S=v;}
    const vol1=c.V.find(v=>v.mo==='v'&&v.t>e[0]);if((S&&S.D&&S.D.so)||(vol1&&vol1.D&&vol1.D.vo))continue;
    if(!S||!DECOR[S.c])continue;const fin=ev.slice(i+1).find(x=>x[1]==='pose'||x[1]==='mort');
    const k=S.c+(S.v>143?' >143':' <=143');(T[k]=T[k]||{vues:0,dec:0,morts:0}).dec++;if(fin&&fin[1]==='mort')T[k].morts++;}}
P('== (a) decollages subis par minute de sol (vues a 0,1 s), selon la vitesse de la derniere vue au sol ==');
for(const k of Object.keys(T).sort()){const t=T[k];P('  '+k+' : '+(t.vues/600).toFixed(1)+' min de sol, '+t.dec+' decollages ('+(t.dec/(t.vues/600)).toFixed(2)+' /min), '+t.morts+' morts ('+(t.dec?(100*t.morts/t.dec).toFixed(0):'-')+' %)');}
/* (b) */
const dv={on:[],off:[]};
for(const c of C){if(DOUBLES.test(c.nom))continue;const V=c.V;
  for(let i=0;i<V.length;i++){const v=V[i];if(v.mo!=='s'||!DECOR[v.c]||v.v<=130||v.gl||v.rb||v.de||!v.O)continue;
    const j=V.findIndex((w,k)=>k>i&&w.t>=v.t+1-1e-6);if(j<0||Math.abs(V[j].t-v.t-1)>.051)continue;
    const fen=V.filter(w=>w.t>=v.t-.2-1e-6&&w.t<=v.t+.8+1e-6);if(fen.some(w=>w.mo!=='s'||!w.O||w.O.nitro!==v.O.nitro||w.gl||w.rb||w.de))continue;
    dv[v.O.nitro?'on':'off'].push(V[j].v-v.v);}}
const med=a=>{const b=a.slice().sort((x,y)=>x-y);return b.length?b[b.length>>1].toFixed(1):'-';};
P('\n== (b) au-dessus de 130 m/s, sol sur decor, nitro stable sur [t-0,2 ; t+0,8] : variation de vitesse sur 1 s ==');
P('  nitro tenue : mediane '+med(dv.on)+' m/s ('+dv.on.length+' mesures) ; coupee : '+med(dv.off)+' m/s ('+dv.off.length+' mesures)');
/* (c) et (d) */
const cl=(x,a,b)=>Math.max(a,Math.min(b,x));
function contre(v,T){if(v.mo!=='s'||!DECOR[v.c]||v.de||v.gl||v.rb||!(v.v>0))return false;
  for(const k of [1,-1]){const cs=cl((v.demi-4-v.lat*k)/(T*v.v),0,.4);if(v.cap*k>cs)return true;}return false;}
for(const gT of [.5,.7]){let n=0,h=0;for(const c of C){if(DOUBLES.test(c.nom))continue;for(const v of c.V)if(v.mo==='s'&&DECOR[v.c]){n++;if(contre(v,gT))h++;}}
  P('\n== (c) contre de gardeOn, gardeT '+gT+' : '+h+' vues sur '+n+' ('+(100*h/n).toFixed(1)+' %) ==');
  const R={mort:[0,0],pose:[0,0]};
  for(const c of C){if(DOUBLES.test(c.nom))continue;const ev=(c.h.ev||[]).filter(e=>['decol','pose','mort'].includes(e[1]));let tPose=-9;
    for(let i=0;i<ev.length;i++){const e=ev[i];if(e[1]==='pose'){tPose=e[0];continue;}if(e[1]!=='decol')continue;
      const sol=c.V.filter(v=>v.mo==='s'&&v.t>tPose&&v.t<e[0]-1e-6);const S=sol[sol.length-1];const vol1=c.V.find(v=>v.mo==='v'&&v.t>e[0]);
      if(!S||!DECOR[S.c]||(S.D&&S.D.so)||(vol1&&vol1.D&&vol1.D.vo))continue;const fin=ev.slice(i+1).find(x=>x[1]==='pose'||x[1]==='mort');if(!fin)continue;
      let dur=0;for(let k=sol.length-1;k>=0&&contre(sol[k],gT);k--)dur=e[0]-sol[k].t;
      const r=R[fin[1]];r[1]++;if(dur>=.4-1e-6)r[0]++;}}
  P('  contre tenu >= 0,4 s jusqu\'au decollage : morts '+R.mort[0]+'/'+R.mort[1]+', poses '+R.pose[0]+'/'+R.pose[1]);}
