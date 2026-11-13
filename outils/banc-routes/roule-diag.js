/* LE DIAGNOSTIC D'UNE CHUTE AU ROULAGE (2026-11-13, L'ORBITE V5) — comme roule-page.js (le pilote auto roule la route, pmot=N), mais garde la TRACE de la caisse (s, lat, vitesse, mode,
   côté) toutes les 0,1 s et, à la première chute, la GÉOMÉTRIE de la route autour (±600 m, tous les 20 m : lacet en °/s à la vitesse de la caisse, pente, roulis sur l'horizon, normale).
   À passer au banc des maps : --auditfile=outils/banc-routes/roule-diag.js --q="pmot=20&dur=110". Rend {palier, L, chute, trace (les 12 s avant la chute), route (autour)}. */
(async function(){try{
  const Z=function(ms){return new Promise(function(r){setTimeout(r,ms);});},q=function(k){return ((new RegExp('[?&]'+k+'=([^&]*)').exec(location.search))||[])[1];};
  const pmot=+q('pmot')||0,dur=+q('dur')||75;
  dbgAuto(1,0,{nit:0});
  if(pmot>0){for(let k=0;k<pmot+2;k++){try{dbgMoteur();}catch(e){}await Z(250);try{if(dbgDuree().palier>=pmot)break;}catch(e){}}
    try{dbgClassique('espace');}catch(e){}const z0=dbgRoute().zone,L0=dbgRoute().L;dbgBord({s:L0-260});const t0=performance.now();
    while(performance.now()-t0<25000){await Z(200);const st=dbgState();if(st.gameOver)return JSON.stringify({erreur:'mort avant le portail'});if(dbgRoute().zone!==z0&&dbgRoute().L!==L0)break;}
    await Z(1200);}
  const R=dbgRoute(),L=R.L,NP=R.NP,k=L/(NP-1),P=R.pts,T=R.T,N=R.Nn,z0=R.zone;let pal=null;try{pal=dbgDuree().palier;}catch(e){}
  const trace=[];let chute=null;const t0=performance.now();
  while(performance.now()-t0<dur*1000){await Z(100);const st=dbgState(),r=dbgRoute();if(r.zone!==z0)break;
    let b=null;try{b=dbgBord();}catch(e){}
    trace.push([+((performance.now()-t0)/1000).toFixed(1),Math.round(r.s),b?+(+b.lat).toFixed(1):null,Math.round((st.vH||0)*.48),st.mode,b?b.side:null,b?b.steer:null]);
    if(st.mode==='fall'&&!chute)chute={s:Math.round(r.s),t:+((performance.now()-t0)/1000).toFixed(1)};
    if(st.gameOver||st.mode==='boom')break;}
  const out={palier:pal,L:Math.round(L),chute:chute,mods:(window.dbgMods?dbgMods():null)};
  if(chute){const tc=chute.t;out.trace=trace.filter(function(x){return x[0]>=tc-12&&x[0]<=tc+1;});
    const v=(out.trace.length?out.trace[out.trace.length-1][3]:300)||300,i0=Math.max(1,Math.round((chute.s-600)/k)),i1=Math.min(NP-2,Math.round((chute.s+300)/k)),st9=Math.max(1,Math.round(20/k)),rt=[];
    const bk=function(i){const t=T[i],ux=-t.y*t.x,uy=1-t.y*t.y,uz=-t.y*t.z,ul=Math.sqrt(ux*ux+uy*uy+uz*uz);if(ul<.2)return null;const n=N[i],cx=uy*n.z-uz*n.y,cy=uz*n.x-ux*n.z,cz=ux*n.y-uy*n.x;return Math.atan2((cx*t.x+cy*t.y+cz*t.z)/ul,(ux*n.x+uy*n.y+uz*n.z)/ul)*57.3;};
    for(let i=i0;i<=i1;i+=st9){const a=T[i-1],b=T[i+1],h0=Math.atan2(a.x,a.z),h1=Math.atan2(b.x,b.z);let dh=h1-h0;while(dh>Math.PI)dh-=2*Math.PI;while(dh<-Math.PI)dh+=2*Math.PI;
      rt.push([Math.round(i*k),+(dh/(2*k)*v*57.3).toFixed(0),+(Math.asin(T[i].y)*57.3).toFixed(0),bk(i)==null?null:Math.round(bk(i)),+N[i].y.toFixed(2)]);}
    out.route=rt;out.routeCles='[s, lacet °/s à la vitesse de la caisse, pente °, roulis sur l\'horizon °, normale.y]';out.traceCles='[t s, s, lat, v m/s, mode, côté, volant]';}
  return JSON.stringify(out);
}catch(e){return JSON.stringify({erreur:String(e&&e.stack||e).slice(0,400)});}})()
