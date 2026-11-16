(function(){
const L=window.__L={};
const sleep=function(ms){return new Promise(function(r){setTimeout(r,ms||0);});};
L.sleep=sleep;
L.noRender=function(on){const R=dbgScene().rdr;if(!L.rr)L.rr=R.render;R.render=on===false?L.rr:function(){};};
L.seed=function(g){var a=g>>>0;Math.random=function(){a=(a+0x6D2B79F5)>>>0;var t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};};
L.key=function(code,down){window.dispatchEvent(new KeyboardEvent(down?'keydown':'keyup',{code:code,key:code,bubbles:true}));};
L.samp=function(t0){const s=dbgState(),c=dbgScene(),p=c.car.position,q=c.cam.position;
  return [+(__V.t-t0).toFixed(3),s.s,s.vA,s.lat,s.psi,s.yawR,s.mode,+p.x.toFixed(2),+p.y.toFixed(2),+p.z.toFixed(2),+q.x.toFixed(2),+q.y.toFixed(2),+q.z.toFixed(2),s.coinsGot,s.gameOver?1:0,s.fallT,s.steer,s.fvy,s.engTier];};
/* départ identique pour toutes les cadences : 60 i/s jusqu'à la conduite, puis le banc passe à sa cadence */
L.start=async function(g,opts){
  opts=opts||{};L.seed(g);__V.go();
  const r=dbgJouer();let n=0,ok=false;
  while(n<7000){__V.tick(1,1000/60);n++;if(n%8===0)await sleep(4);const s=dbgState();if(s.started&&s.mode==='drive'&&!s.paused&&!s.introD&&!s.gameOver){ok=true;break;}}
  if(!ok)return {ok:false,etat:dbgState(),r:r};
  /* laisse partir (élan du départ, 1 s) puis fige l'état à l'instant t0 */
  L.noRender(true);
  return {ok:true,n:n,r:r};};
L.run=function(ms,secs,pre){const t0=__V.t,rec=[],N=Math.ceil(secs*1000/ms-1e-9);
  for(let k=0;k<N;k++){if(pre)pre(k,__V.t-t0);__V.tick(1,ms);const r=L.samp(t0);rec.push(r);if(r[14])break;}
  return rec;};
})();
