/* LA CRÊTE SANS SAUT, MESURÉE (2026-11-13, LE PARCOURS CARTE POSTALE — voir nuaSautRefuse dans code/gameplay/route-sans-haut.js) : sur quelle part de la route des nuages le saut nitro
   serait refusé, tableau par tableau, à une vitesse donnée. La règle est rejouée sur la route bâtie (un point par mètre, comme le jeu) : les fenêtres dessinées des tableaux (`ss`) et le
   REGARD DEVANT (la vitesse à laquelle la route se déroberait sous le vol, sur `t` s de vol).
   node sauts-refuses.cjs [palier=0] [vitesse=1.8] [graines=1-6] [ev=8] [t=1.2]     · vitesse : × la croisière du palier (1,8 : l'élan et la nitro du début de route ; 1 : à fond en fin de partie) */
const arg=k=>{const a=process.argv.find(x=>x.startsWith(k+'='));return a?a.slice(k.length+1):null;};
const B=require('./charge.cjs'),V3=B.ctx.THREE.Vector3;
const pal=+(arg('palier')||0),kv=+(arg('vitesse')||1.8),G=(arg('graines')||'1-6').split('-').map(Number),EV=+(arg('ev')||8),TF=+(arg('t')||1.2);
const tot={},ref={};let TT=0,TR=0;
for(let g=G[0];g<=(G[1]||G[0]);g++){const r=B.piste('nuages',g,pal),C=r.ctrl,Nc=r.N,vw=r.vw;
  const cv=new B.ctx.THREE.CatmullRomCurve3(C,false,'centripetal');cv.arcLengthDivisions=C.length*16;const L=cv.getLength(),NP=Math.round(L)+1;
  const T=[];for(let i=0;i<NP;i++)T.push(cv.getTangentAt(Math.min(1,i/(NP-1))));
  const lg=cv.getLengths(),nC=C.length-1,sOfC=[];for(let j=0;j<=nC;j++){const f=j/nC*(lg.length-1),k=Math.min(lg.length-2,Math.floor(f));sOfC.push(lg[k]+(lg[k+1]-lg[k])*(f-k));}
  const N=[];let j=0;for(let i=0;i<NP;i++){const si=i*L/(NP-1);while(j<nC-1&&sOfC[j+1]<si)j++;const u=(si-sOfC[j])/Math.max(1e-6,sOfC[j+1]-sOfC[j]);N.push(new V3().copy(Nc[j]).lerp(Nc[j+1],Math.max(0,Math.min(1,u))).normalize());} /* les normales des points de contrôle, interpolées */
  const ss=[];for(const m of r.marks)if(m.ss)for(const e of m.ss)ss.push([sOfC[Math.min(nC,e.j0!=null?e.j0:e[0])],sOfC[Math.min(nC,e.j1!=null?e.j1:e[1])]]);
  const ou=s=>{for(const m of r.marks)if(m.fig&&s>=sOfC[m.i0]&&s<=sOfC[Math.min(nC,m.i1)])return m.fig.replace('nu-','');return 'liaison';};
  const v=vw*kv;
  for(let i=0;i<NP-1;i+=3){const s=i*L/(NP-1),b=s+v*TF;let no=false;for(const e of ss)if(b>=e[0]&&s<=e[1])no=true;
    if(!no){const i1=Math.min(NP-2,Math.round(b));let d=0;for(let q=i;q<i1;q++){const x=new V3().subVectors(T[q+1],T[q]).dot(N[q]);if(x<0)d-=x;}if(v*d>EV)no=true;}
    const o=ou(s);tot[o]=(tot[o]||0)+3;TT+=3;if(no){ref[o]=(ref[o]||0)+3;TR+=3;}}}
console.log('palier',pal,'vitesse ×'+kv,'(seuil '+EV+' m/s sur '+TF+' s de vol) | saut refusé sur',(TR/TT*100).toFixed(1)+'% de la route');
for(const k of Object.keys(tot).sort((a,b)=>tot[b]-tot[a]))console.log('  ',k.padEnd(14),(tot[k]/TT*100).toFixed(1).padStart(5)+'% de la route, refusé sur',((ref[k]||0)/tot[k]*100).toFixed(0)+'%');
