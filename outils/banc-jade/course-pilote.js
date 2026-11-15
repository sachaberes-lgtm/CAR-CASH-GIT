(async function(){
  /* (2026-11-14, optimiseur de Jade) LA VRAIE COURSE AU PILOTE, sans le gen de banc-maps (qui ne lève plus __gameReady sur la machine chargée) : 6e argument de
     sonde-tel.cjs. Le pilote de mesure (dbgAuto) conduit TOUTE la vallée, vol compris, et SAUTE toutes les `__saut` secondes (4 par défaut) — au milieu, puis au
     ras du bord (`__latK`) ; chaque mort est relevée (abscisse, cause, mode, s'il volait), puis la course reprend 80 m plus loin (dbgJadeAller). Mortel : pas
     de dbgImmortel. Rend : morts, distance couverte, durée, images par seconde moyennes. N'emploie que des crochets d'origine : sert tel quel sur wt-avant. */
  const att=function(ms){return new Promise(function(r){setTimeout(r,ms);});};
  try{if(window.dbgImmortel)dbgImmortel(false);}catch(e){}
  const vivant=async function(){for(let k=0;k<3;k++){let st=null;try{st=dbgState();}catch(e){}if(st&&st.started&&!st.gameOver)return true;try{dbgJouer();}catch(e){}
    for(let i=0;i<40;i++){await att(500);try{st=dbgState();if(st.started&&st.running&&!st.gameOver)return true;}catch(e){}}}return false;};
  await vivant();
  {const t0=performance.now();while(performance.now()-t0<240000){let ok=false;try{const d=dbgJade();ok=!!(d&&d.quartiers&&dbgJadePoste('bandes')!=='pas de map');}catch(e){}if(ok)break;await att(1000);}}
  const o={passes:[]},Lr=dbgRoute().L,MAXS=(window.__maxS||420)*1000;
  for(const latK of (window.__latK||[0,.8])){
    const P={latK:latK,morts:[],couvert:0,vols:0,sauts:0,ms:0};const DT=[];let tPrec=0,fin9=false;const raf=function(t){if(fin9)return;if(tPrec)DT.push(t-tPrec);tPrec=t;requestAnimationFrame(raf);};requestAnimationFrame(raf); /* LES GELS : l'écart entre deux images, toute la passe */const t0=performance.now();let sDer=0,sMax=0,fr0=null,tf0=performance.now();
    if(!(await vivant()))break;dbgJadeAller(120);await att(300);
    dbgAuto(1,0,{nit:0,vol:true,saut:window.__saut||4,latK:latK});
    let enVol=false;
    while(performance.now()-t0<MAXS){await att(250);let R,st;try{R=dbgRoute();st=dbgState();}catch(e){continue;}
      if(R.mode==='fall'&&!enVol){enVol=true;P.vols++;}else if(R.mode!=='fall')enVol=false;
      if(R.s>sMax)sMax=R.s;
      if(st.gameOver){P.morts.push({s:Math.round(R.s),cause:R.cause,mode:R.mode,lat:+R.lat.toFixed(1)});
        if(P.morts.length>30)break;const reprise=Math.round(R.s)+80;if(reprise>Lr-60)break;
        dbgAuto(0);if(!(await vivant()))break;dbgJadeAller(reprise);await att(200);dbgAuto(1,0,{nit:0,vol:true,saut:window.__saut||4,latK:latK});continue;}
      if(R.s>Lr-60)break;}
    fin9=true;{const v=DT.slice().sort(function(a,b){return a-b;}),n=v.length||1;P.images=v.length;P.ips=+(1000*v.length/Math.max(1,v.reduce(function(a,b){return a+b;},0))).toFixed(1);P.p50=+(v[Math.floor(n*.5)]||0).toFixed(1);P.p99=+(v[Math.floor(n*.99)]||0).toFixed(1);P.gels50=v.filter(function(x){return x>50;}).length;P.gels100=v.filter(function(x){return x>100;}).length;P.gels250=v.filter(function(x){return x>250;}).length;P.pire=Math.round(v[v.length-1]||0);}
    dbgAuto(0);P.couvert=Math.round(sMax);P.L=Math.round(Lr);P.ms=Math.round(performance.now()-t0);o.passes.push(P);}
  try{const d=dbgJade();o.niveau=d.niveau;o.racine=dbgJadePoste('bandes')!=='pas de map';}catch(e){o.niveau=String(e.message);} /* (2026-11-15) la course a-t-elle bien roulé dans Jade (voir sonde-tel.cjs, TOUJOURS JADE) */
  return JSON.stringify(o);})()
