/* ===== LE CERVEAU DES BOTS DU VRAI JEU (2026-10-20) =====
   15 entrees lues dans le vrai jeu -> 16 neurones caches (tanh) -> 4 sorties qui sont des TOUCHES, pas des dosages :
   volant (gauche / droite), HAUT (gaz au sol, pique en vol), BAS (frein au sol, cabre en vol), NITRO (Espace).
   Exactement le vocabulaire d'un clavier ; le jeu fait le reste. */
const NIN=15, NH=16, NOUT=4, SIZE=NIN*NH+NH+NH*NOUT+NOUT;
const cl=(v,a,b)=>v<a?a:v>b?b:v;

const H=new Float64Array(NH);
function forward(w,inp,out){
  const b2=NIN*NH+NH;
  for(let j=0;j<NH;j++){ let a=w[NIN*NH+j]; const o=j*NIN; for(let i=0;i<NIN;i++) a+=w[o+i]*inp[i]; H[j]=Math.tanh(a); }
  for(let o=0;o<NOUT;o++){ let a=w[b2+NH*NOUT+o]; const q=b2+o*NH; for(let j=0;j<NH;j++) a+=w[q+j]*H[j]; out[o]=Math.tanh(a); }
  return out;
}

/* LES ENTREES : ce que la caisse sait d'elle-meme + ce que la route lui montre (courbes devant) + en vol, ou elle va se poser
   (l'anneau d'atterrissage que le joueur voit : position, delai) et comment elle vole. Toutes bornees a [-1,1]. */
function entrees(e,trk,arr){
  const NP=trk.NP, seg=trk.L/(NP-1), bi=cl(Math.round(e.s/seg),0,NP-2);
  const T=trk.T,B=trk.B,Nn=trk.Nn;
  const courbure=function(d){
    const j=Math.min(NP-1,bi+Math.max(1,Math.round(d/seg)));
    const t0=T[bi],t1=T[j],dot=t0.x*t1.x+t0.y*t1.y+t0.z*t1.z;
    if(dot>=.9999) return 0;
    const kap=Math.acos(cl(dot,-1,1))/Math.max(1,d);
    const cx=t0.y*t1.z-t0.z*t1.y, cy=t0.z*t1.x-t0.x*t1.z, cz=t0.x*t1.y-t0.y*t1.x;
    return kap*Math.sign(cx*Nn[bi].x+cy*Nn[bi].y+cz*Nn[bi].z);
  };
  const air=e.mode==='fall';
  arr[0]=cl((e.vA-135)/110,-1,1);
  arr[1]=cl(e.lat/e.rh,-1,1);
  arr[2]=cl(e.psi/.5,-1,1);
  arr[3]=cl(e.nitroR/2.2,-1,1);
  arr[4]=air?1:0;
  arr[5]=cl(courbure(120)*55,-1,1);
  arr[6]=cl(courbure(300)*110,-1,1);
  if(air){
    const t=T[bi],b=B[bi],n=Nn[bi];
    const vx=e.fvx,vy=e.fvy,vz=e.fvz;
    arr[7]=cl((vx*t.x+vy*t.y+vz*t.z)/150,-1,1);             /* vitesse en vol le long de la route */
    arr[8]=cl((vx*b.x+vy*b.y+vz*b.z)/50,-1,1);              /* derive laterale */
    arr[9]=cl((vx*n.x+vy*n.y+vz*n.z)/60,-1,1);              /* montee / descente par rapport a la route */
    if(e.lmvu){
      const dx=e.lmx-e.fpx,dy=e.lmy-e.fpy,dz=e.lmz-e.fpz;
      arr[10]=cl((dx*t.x+dy*t.y+dz*t.z)/150,-1,1);          /* l'anneau est devant (+) ou derriere (-) */
      arr[11]=cl((dx*b.x+dy*b.y+dz*b.z)/e.rh,-1,1);         /* ...a gauche / a droite */
      arr[12]=cl((dx*n.x+dy*n.y+dz*n.z)/60,-1,1);           /* ...en dessous (-) / au dessus (+) */
      arr[13]=cl(e.eta/3,-1,1);                             /* delai avant la pose */
    }else{ arr[10]=0;arr[11]=0;arr[12]=-1;arr[13]=1; }
    arr[14]=cl((6-Math.min(6,e.airT||0))/6,-1,1);           /* temps d'air restant (6 s max) */
  }else{ for(let i=7;i<=14;i++) arr[i]=0; }
  return arr;
}
module.exports={NIN,NH,NOUT,SIZE,forward,entrees,cl};
