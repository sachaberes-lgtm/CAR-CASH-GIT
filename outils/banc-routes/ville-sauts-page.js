/* LES SAUTS DE LA VILLE, DANS LA PAGE (2026-11-14, MAPS PRO — la ville calme) : le pilote auto saute toutes les 1,2 s (dbgAuto(1,0,{saut:1.2,vol:1})) pendant `dursaut` secondes (45) ;
   on relève la mort (abscisse, cause), et, à chaque dixième de seconde, à la vitesse RÉELLE de la caisse : le saut refusé par la règle de villeEnversRefuse (une dalle à plus de 72,5°
   entre 20 m derrière et max(200 m, 4 s de vitesse) devant), la tête en bas, la dalle à plus de 60°, le plus grand dévers sous les roues.
     node outils/banc-maps/banc.cjs gen --carte=ville --meteo=soir --graines=1,2,3 --auditfile=outils/banc-routes/ville-sauts-page.js --auditms=90000 [--q=dursaut=45]
   Rend {mort, cause, s, dur, n, refuse (%), envers (%), mur60 (%), devMax (°), vMoy (m/s)}. */
(async function(){try{
  const Z=function(ms){return new Promise(function(r){setTimeout(r,ms);});};
  const m=/[?&]dursaut=(\d+)/.exec(location.search),DUR=m?+m[1]:45;
  dbgAuto(1,0,{saut:1.2,vol:1});
  const t0=performance.now();let n=0,ref=0,env=0,mur=0,dev=0,sP=null,tP=null,vS=0,nV=0,mort=false,cause='',sFin=0;
  while(performance.now()-t0<DUR*1000){
    const st=dbgState(),R=dbgRoute(),s=R.s||0,t=performance.now();sFin=s;
    if(st.gameOver){mort=true;try{cause=R.cause||'?';}catch(e){cause='?';}break;}
    let v=0;if(sP!=null&&t>tP){v=(s-sP)/((t-tP)/1000);if(v>5&&v<1200){vS+=v;nV++;}}sP=s;tP=t;
    const NP=R.NP,L=R.L,N=R.Nn;if(N&&NP>1&&L>0&&st.mode==='drive'){const ds=L/(NP-1),i=Math.max(0,Math.min(NP-1,Math.round(s/ds))),ny=N[i].y;n++;
      const d=Math.acos(Math.max(-1,Math.min(1,ny)))*57.2958;if(d>dev)dev=d;if(ny<0)env++;if(ny<.5)mur++;
      const i0=Math.max(0,Math.round((s-20)/ds)),i1=Math.min(NP-1,Math.round((s+Math.max(200,4*Math.abs(v)))/ds));let r=false;for(let k=i0;k<=i1;k+=2)if(N[k].y<.3){r=true;break;}if(r)ref++;}
    await Z(100);}
  try{dbgAuto(1,0,{nit:0});}catch(e){}
  const p=function(x){return n?+(x/n*100).toFixed(1):0;};
  return {mort:mort,cause:cause,s:Math.round(sFin),dur:+((performance.now()-t0)/1000).toFixed(1),n:n,refuse:p(ref),envers:p(env),mur60:p(mur),devMax:Math.round(dev),vMoy:nV?Math.round(vS/nV):0};
}catch(e){return {erreur:String(e&&e.message||e)};}})()
