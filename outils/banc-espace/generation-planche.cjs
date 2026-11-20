/* ===== LE CRIBLE DE LA GÉNÉRATION DE L'ESPACE — la planche d'une route (2026-11-18, rôle « generation ») =====
   node outils/banc-espace/generation-planche.cjs graine palier sortie.png [search] [sMarque] [rodage=graine1,graine2,…]
   En haut : la route vue de dessus (dalle verte = à l'endroit, jaune = sur la tranche, rouge = à l'envers ; les modules en bandes de couleur ; un disque blanc = le départ,
   un disque magenta = sMarque) ; au milieu : le profil (altitude selon l'abscisse) ; en bas : le roulis (°/s, trait blanc ; lignes 60 / 90 / 120 °/s en gris) et Nn.y (trait cyan, de −1 à 1).
   rodage : les graines tirées AVANT dans le même vm (pour rejouer une route de la série telle qu'elle a été générée). */
const P=require('../banc-routes/png.cjs'),fs=require('fs'),path=require('path');const C=require('./generation-charge.cjs'),Me=require('./generation-mesure.cjs');
const [g,pal,sortie,search,sM]=process.argv.slice(2);const rodA=process.argv.find(a=>a.startsWith('rodage='));
const M=C.creer(search||'');if(rodA)for(const x of rodA.slice(7).split(',').filter(Boolean))M.route(+x,+pal);
const rangA=process.argv.find(a=>a.startsWith('rang='));if(rangA){/* rejoue la série du crible (base 20261118, 30 de rodage) jusqu'à la route d'avant */let a=(20261118+(+pal)*7919)>>>0;const f=()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
  const k=30+(+rangA.slice(5));for(let i=0;i<k;i++)M.route((f()*1e9)|0,+pal);const gg=(f()*1e9)|0;if(gg!==+g)console.error('ATTENTION : la graine du rang est',gg);}
const r=M.route(+g,+pal),d=M.dalle(r),o=Me.mesure(r,d,+pal);
const W=1400,H=1400,im=P.Img(W,H,[14,16,24]),NP=d.NP,ds=d.ds,v=Me.vReel(+pal);
const COL=[[90,160,255],[255,140,60],[200,110,255],[255,230,80],[80,230,230],[255,100,160],[160,255,120],[255,255,255]];
const mods=d.mods.filter(m=>m.fig);const famC={};let ci=0;for(const m of mods){const f=Me.norm(m.fig);if(!famC[f])famC[f]=COL[ci++%COL.length];}
/* dessus */
let mn=[1e9,1e9],mx=[-1e9,-1e9];for(const q of d.pts){mn[0]=Math.min(mn[0],q.x);mx[0]=Math.max(mx[0],q.x);mn[1]=Math.min(mn[1],q.z);mx[1]=Math.max(mx[1],q.z);}
const f0=[20,20,W-40,700],sc=Math.min(f0[2]/(mx[0]-mn[0]||1),f0[3]/(mx[1]-mn[1]||1));const X=q=>f0[0]+(q.x-mn[0])*sc,Y=q=>f0[1]+(q.z-mn[1])*sc;
for(const m of mods){const c=famC[Me.norm(m.fig)];for(let i=Math.round(m.a/ds);i<=Math.min(NP-1,Math.round(m.b/ds));i+=2)P.disc(im,X(d.pts[i]),Y(d.pts[i]),4,c,.35);}
for(let i=1;i<NP;i+=2){const ny=d.Nn[i].y,c=ny>.5?[90,220,120]:ny<0?[255,70,70]:[250,210,70];P.line(im,X(d.pts[i-2]||d.pts[0]),Y(d.pts[i-2]||d.pts[0]),X(d.pts[i]),Y(d.pts[i]),c,1);}
P.disc(im,X(d.pts[0]),Y(d.pts[0]),7,[255,255,255]);if(sM){const i=Math.round(+sM/ds);if(d.pts[i])P.disc(im,X(d.pts[i]),Y(d.pts[i]),9,[255,0,255],.8);}
/* profil */
const f1=[20,740,W-40,300];let y0=1e9,y1=-1e9;for(const q of d.pts){y0=Math.min(y0,q.y);y1=Math.max(y1,q.y);}const XS=s=>f1[0]+s/d.L*f1[2];const YP=y=>f1[1]+f1[3]-(y-y0)/(y1-y0||1)*f1[3];
for(const m of mods){const c=famC[Me.norm(m.fig)];for(let x=XS(m.a);x<=XS(m.b);x++)for(let y=f1[1];y<f1[1]+8;y++)P.px(im,x,y,c,.9);}
for(let i=2;i<NP;i+=2)P.line(im,XS((i-2)*ds),YP(d.pts[i-2].y),XS(i*ds),YP(d.pts[i].y),[220,220,230],1);
/* roulis et Ny */
const f2=[20,1070,W-40,310];const YR=w=>f2[1]+f2[3]-Math.min(1,w/160)*f2[3];const YN=n=>f2[1]+f2[3]/2-n*f2[3]/2;
for(const lim of [60,90,120])for(let x=f2[0];x<f2[0]+f2[2];x+=3)P.px(im,x,YR(lim),[110,110,110]);for(let x=f2[0];x<f2[0]+f2[2];x+=6)P.px(im,x,YN(0),[0,90,90]);
for(const m of mods){const c=famC[Me.norm(m.fig)];for(let x=XS(m.a);x<=XS(m.b);x++)for(let y=f2[1];y<f2[1]+8;y++)P.px(im,x,y,c,.9);}
const N=d.Nn,T=d.T;const roll=[];for(let i=0;i<NP;i++){const a=Math.max(0,i-1),b=Math.min(NP-1,i+1),B={x:N[i].y*T[i].z-N[i].z*T[i].y,y:N[i].z*T[i].x-N[i].x*T[i].z,z:N[i].x*T[i].y-N[i].y*T[i].x};
  roll.push(Math.abs(((N[b].x-N[a].x)*B.x+(N[b].y-N[a].y)*B.y+(N[b].z-N[a].z)*B.z)/((b-a)*ds))*v*57.3);}
for(let i=2;i<NP;i+=2){P.line(im,XS((i-2)*ds),YR(roll[i-2]),XS(i*ds),YR(roll[i]),[255,255,255],1);P.line(im,XS((i-2)*ds),YN(N[i-2].y),XS(i*ds),YN(N[i].y),[0,230,230],1);}
if(sM)for(let y=f1[1];y<f2[1]+f2[3];y+=2)P.px(im,XS(+sM),y,[255,0,255]);
fs.mkdirSync(path.dirname(path.resolve(sortie)),{recursive:true});fs.writeFileSync(sortie,P.png(im));
console.log(JSON.stringify({g:+g,p:+pal,L:Math.round(d.L),couleurs:Object.fromEntries(Object.entries(famC).map(([k,c])=>[k,'rgb('+c.join(',')+')'])),suite:o.suite,frole:o.frole,geants:o.geants}));
