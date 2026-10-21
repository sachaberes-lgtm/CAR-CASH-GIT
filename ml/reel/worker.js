/* ===== UN OUVRIER : charge le vrai jeu UNE fois, puis note des cerveaux les uns apres les autres ===== */
const {creer}=require('./jeu-reel');
const C=require('./cerveau');
let J=null;
const KEYS={L:'ArrowLeft',R:'ArrowRight',U:'ArrowUp',D:'ArrowDown',N:'Space'};

/* UNE EVALUATION : le cerveau w conduit une partie neuve (piste tiree par `graine`) pendant `tmax` secondes de jeu au plus.
   Il decide a 10 Hz et n'a que des TOUCHES ; la note est la distance parcourue sur la piste (zones enchainees comprises). */
function evaluer(w,graine,tmax){
  J.lancer(graine);
  const tenu={L:false,R:false,U:false,D:false,N:false};
  let braq=0, appuisN=0;
  const poser=(k,on)=>{ if(tenu[k]!==on){ tenu[k]=on; J.touche(KEYS[k],on); if(k==='L'||k==='R') braq++; if(k==='N'&&on) appuisN++; } };
  const trk0=J.g.sandbox.__TRK; const inp=new Float64Array(C.NIN), out=new Float64Array(C.NOUT);
  let e=J.etat(), trk=trk0(), prevS=e.s, dist=0, mort=false, fr=0, immobile=0, vMax=0, air=0, tricks0=e.tricks, nitroFr=0;
  const N=Math.round(tmax*60);
  while(fr<N){
    if(fr%6===0){
      e=J.etat();
      if(e.gameOver||e.mode==='boom'){ mort=true; break; }
      if(e.s<prevS-500){ trk=trk0(); prevS=e.s; }                    /* nouvelle zone : la piste a ete reconstruite */
      else { dist+=Math.max(0,e.s-prevS); prevS=e.s; }
      if(e.vA<5) immobile++; else immobile=0;
      if(immobile>80) { mort=true; break; }                          /* 8 s sans bouger : abandon */
      if(e.vA>vMax) vMax=e.vA;
      if(e.mode==='fall') air++;
      C.entrees(e,trk,inp); C.forward(w,inp,out);
      poser('U',out[1]>0); poser('D',out[3]>0); poser('L',out[0]>.33); poser('R',out[0]<-.33); poser('N',out[2]>0);
      if(out[2]>0) nitroFr++;
    }
    J.image(); fr++;
  }
  e=J.etat(); if(e.s>=prevS) dist+=Math.max(0,e.s-prevS);
  J.lacher();
  return {dist:dist, mort:mort, t:fr/60, vMax:vMax, air:air*6/60, tricks:e.tricks-tricks0, nitro:nitroFr*6/Math.max(1,fr), braqParS:braq*60/Math.max(1,fr), appuisNitroParS:appuisN*60/Math.max(1,fr)};
}
function evaluerSeul(w,graine,tmax){ if(!J) J=creer({silence:true}); return evaluer(w,graine,tmax); }
if(process.send) process.on('message',m=>{
  if(!J){ J=creer({silence:true}); }
  if(m.stop) process.exit(0);
  let r; try{ r=evaluer(Float64Array.from(m.w),m.graine,m.tmax); }catch(err){ r={dist:0,mort:true,erreur:String(err&&err.stack||err).slice(0,300)}; }
  process.send({id:m.id,r:r});
});
if(process.send) process.send({pret:true});
module.exports={evaluer:evaluer,evaluerSeul:evaluerSeul};
