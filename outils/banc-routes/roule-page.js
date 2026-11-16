/* LE ROULAGE DES MODULES, DANS LA PAGE (2026-11-12, L'ORBITE VERS L'AVANT) — à passer au banc des maps :
   node outils/banc-maps/banc.cjs gen --carte=espace --graines=1,2,3 --q="fort=faille&pmot=10" --auditfile=outils/banc-routes/roule-page.js
   Le pilote auto (nitro coupée) roule la route entière ; à chaque dixième de seconde on relève, module par module : la caisse quitte-t-elle la dalle
   (mode ≠ drive), la face (side), la vitesse, la caméra (distance à la caisse, angle avec la route, hauteur au-dessus de la dalle : < 0 = sous la route).
   pmot=N : monte le moteur au palier N (dbgMoteur) puis passe le portail : la zone suivante est bâtie à ce palier, c'est elle qu'on roule.
   dur=S : secondes de roulage au plus (75). Rend {palier, L, mods, zones (pisteTord : dernier chiffre 1 = acceptée), tors, parMod, chutes, fin}. */
(async function(){try{
  const Z=function(ms){return new Promise(function(r){setTimeout(r,ms);});},q=function(k){return ((new RegExp('[?&]'+k+'=([^&]*)').exec(location.search))||[])[1];};
  const pmot=+q('pmot')||0,dur=+q('dur')||75;let pal=null;
  dbgAuto(1,0,{nit:0});
  if(pmot>0){for(let k=0;k<pmot+2;k++){try{dbgMoteur();}catch(e){}await Z(250);try{if(dbgDuree().palier>=pmot)break;}catch(e){}}
    try{dbgClassique('espace');}catch(e){} /* la zone d'après est tirée au hasard : on impose l'orbite */const z0=dbgRoute().zone,L0=dbgRoute().L;dbgBord({s:L0-260});const t0=performance.now();
    while(performance.now()-t0<25000){await Z(200);const st=dbgState();if(st.gameOver)return JSON.stringify({erreur:'mort avant le portail',cause:dbgRoute().cause});if(dbgRoute().zone!==z0&&dbgRoute().L!==L0)break;}
    await Z(1200);}
  try{pal=dbgDuree().palier;}catch(e){}
  const R=dbgRoute(),L=R.L,NP=R.NP,k=L/(NP-1),P=R.pts,T=R.T,N=R.Nn,z0=R.zone;
  let zones=null,info=null,tors=null;try{info=dbgHaut().info;zones=info&&info.zones;}catch(e){}try{const t=dbgTorsion();tors={hors:t.hors,envers:t.envers,penteMaxDeg:t.penteMaxDeg,contacts:t.contacts,essai:t.essai};}catch(e){}
  const mods=dbgMods();const parMod=mods.map(function(m){return {fig:m.fig,s0:m.s0,s1:m.s1,n:0,horsDalle:0,dessous:0,vMin:1e9,vMax:0,camDistMax:0,camAngMax:0,camHautMin:1e9};});
  const sc=dbgScene(),cam=sc.cam,car=sc.car,V=new THREE.Vector3();
  const chutes=[];let enChute=null,fin='temps',modes={},sMax=0,n=0;const t0=performance.now();
  while(performance.now()-t0<dur*1000){await Z(100);const st=dbgState(),r=dbgRoute(),b=dbgBord();n++;
    if(st.gameOver){fin='MORT '+r.cause+' @'+Math.round(r.s);break;}
    if(r.zone!==z0){fin='PORTAIL @'+Math.round(sMax)+' / '+Math.round(L);await Z(2500);const s2=dbgState();if(s2.gameOver)fin+=' puis MORT '+dbgRoute().cause;else fin+=' (suite ok, mode '+s2.mode+')';break;}
    const s=r.s;if(s>sMax)sMax=s;modes[st.mode]=(modes[st.mode]||0)+1;
    if(st.mode!=='drive'){if(!enChute)enChute={s0:Math.round(s),mode:st.mode,t:0};enChute.t+=.1;}else if(enChute){enChute.s1=Math.round(s);chutes.push(enChute);enChute=null;}
    const i=Math.max(0,Math.min(NP-1,Math.round(s/k)));cam.getWorldDirection(V);const ang=Math.acos(Math.max(-1,Math.min(1,V.dot(T[i]))))*57.3;
    const dCam=cam.position.distanceTo(car.position),hCam=(cam.position.x-P[i].x)*N[i].x+(cam.position.y-P[i].y)*N[i].y+(cam.position.z-P[i].z)*N[i].z;
    for(const m of parMod){if(s<m.s0||s>m.s1)continue;m.n++;if(st.mode!=='drive')m.horsDalle++;if(b.side<0)m.dessous++;const v=Math.abs(r.vA)*.48;if(v<m.vMin)m.vMin=v;if(v>m.vMax)m.vMax=v;
      if(dCam>m.camDistMax)m.camDistMax=dCam;if(st.mode==='drive'&&ang>m.camAngMax)m.camAngMax=ang;if(st.mode==='drive'&&b.side>0&&hCam<m.camHautMin)m.camHautMin=hCam;}}
  if(enChute)chutes.push(enChute);dbgAuto(0);
  for(const m of parMod){m.vMin=Math.round(m.vMin);m.vMax=Math.round(m.vMax);m.camDistMax=+m.camDistMax.toFixed(1);m.camAngMax=Math.round(m.camAngMax);m.camHautMin=m.camHautMin>1e8?null:+m.camHautMin.toFixed(1);}
  let err=[];try{err=(window.dbgErreurs?dbgErreurs():[]).slice(-5);}catch(e){}
  let carte=null;try{carte=dbgRoute().niveau.carte;}catch(e){}return JSON.stringify({carte:carte,palier:pal,L:Math.round(L),zone:z0,tors:tors,zones:zones,modes:modes,fin:fin,sMax:Math.round(sMax),chutes:chutes.slice(0,12),parMod:parMod.filter(function(m){return m.fig;}),erreurs:err});
}catch(e){return 'ERREUR roule-page : '+(e&&e.stack||e);}})()
