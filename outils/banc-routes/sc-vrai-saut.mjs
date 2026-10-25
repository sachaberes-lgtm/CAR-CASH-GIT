/* scénario : le raccourci du puits dans le VRAI jeu. 1) la vraie piste (dbgTrace) → le simulateur du banc cherche un départ qui marche ; 2) la caisse y est posée, sort par le bord SANS rien toucher, on regarde où elle retombe.
   node jeu.mjs espace midi 0 0 graine  [vitesse m/s monde] */
import {createRequire} from 'node:module';
const req=createRequire(import.meta.url);
export default async function(H,[carte,meteo,_s,palier,g,vit]){
  const B=req('./charge.cjs'),R=req('./raccourcis.cjs'),T3=B.ctx.THREE;
  await H.jouer();await H.sleep(2500);
  const raw=await H.ev(`(function(){var t=dbgTrace({carte:'${carte}',meteo:'${meteo}',graine:${+g},palier:${+palier||0},pas:6});var h=dbgHaut();return JSON.stringify({L:t.L,pas:t.pas,half:t.half,ok:t.graineOk,zones:h.info.zones,p:t.p,n:t.n,b:t.b,t:t.t,g:t.g,airMax:t.airMax});})()`);
  const t=JSON.parse(raw);console.log('piste',t.L,'pas',t.pas,'zones',JSON.stringify(t.zones),'g',t.g,'airMax',t.airMax);
  const nb=t.p.length/3,V=(a,i)=>new T3.Vector3(a[i*3],a[i*3+1],a[i*3+2]);
  const r={ctrl:[],N:[],Bv:[],vw:+vit||82,espace:carte==='espace'};for(let i=0;i<nb;i++){r.ctrl.push(V(t.p,i));r.N.push(V(t.n,i));r.Bv.push(V(t.b,i));}
  const a=R.analyse(r,{mults:[1],offs:[0]}),res=a.res;
  console.log('départs qui marchent (m=1, sans braquage) :',res.length);
  const zs=t.zones.filter(z=>z[0]==='puits');
  const bons=res.filter(x=>zs.some(z=>x.s>z[1]&&x.s<z[2])).sort((u,v)=>v.gain-u.gain);
  console.log('dans le puits :',bons.length,bons.slice(0,6).map(x=>`s${Math.round(x.s)} côté${x.side} gain${Math.round(x.gain)} t${x.t.toFixed(1)} → s${Math.round(a.S[x.j])}`).join(' | '));
  if(!bons.length)return;
  // un départ par seau de 90 m, au plus 8, répartis dans le puits
  const vus=new Set(),cand=[];for(const x of bons){const k=Math.floor(x.s/90);if(vus.has(k))continue;vus.add(k);cand.push(x);}
  cand.sort((u,v)=>u.s-v.s);const pick=cand.filter((_,i)=>i%Math.max(1,Math.floor(cand.length/8))===0).slice(0,8);
  for(const x of pick){
    await H.ev(`dbgAuto(0);dbgBord({s:${x.s},lat:0,psi:0,vA:${Math.round((+vit||82)/0.48)},grace:0});dbgBord({lat:${x.side}*${t.half+1.2},vL:0});1`);
    const t0=Date.now();let vu=false,sT=null,tf=0,fin='?',sL=null;
    while(Date.now()-t0<9000){await H.sleep(80);const st=JSON.parse(await H.ev(`JSON.stringify((function(){var x=dbgState();return {m:x.mode,o:x.gameOver,s:Math.round(x.s),f:x.fallT};})())`));
      if(st.m==='fall'&&!vu){vu=true;sT=st.s;}if(vu&&st.m==='drive'){sL=st.s;fin='POSE';break;}if(st.o){fin='MORT';sL=st.s;break;}tf=st.f;}
    console.log('exit s',Math.round(x.s),'côté',x.side,'prédit → s',Math.round(a.S[x.j]),'('+x.t.toFixed(1)+' s) | en jeu :',fin,'s',sL,'vol',tf.toFixed(1),'s',(sL!=null?'gain '+(sL-x.s):''));
    if(fin==='MORT')break;
    await H.sleep(300);}
  await H.shot('saut');
}
