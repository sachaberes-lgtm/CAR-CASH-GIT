/* (2026-11-13, LE CANYON V3) LE VOL DE LA BUTTE, suivi pas à pas : la caisse est posée au début du balcon (vitesse `vsaut` m/s), ne braque pas ; toutes les 50 ms on relève
   sa position (dbgCanyonV3('car')), et on la compare à la PISTE d'en bas (l'échantillon de la piste le plus proche en plan : l'écart en hauteur et en travers).
   Rend {P0, piste:[s0,s1], vol:[[t, x, z, y, mode, s, au-dessus de la piste (m), écart en travers de la piste (m), sol]]…} */
(async function(){try{const Z=ms=>new Promise(r=>setTimeout(r,ms)),q=(n,d)=>{const m=new RegExp('[?&]'+n+'=([^&]+)').exec(location.search);return m?m[1]:d;};
  const D=dbgCanyon(),sQ=D.sQ||{};if(sQ.bt0==null)return 'pas de butte';const R=dbgRoute(),P=R.pts,NP=R.NP,L=R.L,k=L/(NP-1);
  const mods=dbgMods(),m=mods.find(x=>x.fig==='butte');const v=+q('vsaut',78);
  const i0=Math.round(sQ.bt1/k),i1=Math.min(NP-1,Math.round((sQ.bt1+900)/k)); /* la piste : de la fin du tour à +900 m */
  const piste=(x,z,y)=>{let bi=-1,bd=1e18;for(let i=i0;i<=i1;i+=2){const p=P[i],d=(p.x-x)**2+(p.z-z)**2;if(d<bd){bd=d;bi=i;}}if(bi<0)return null;const p=P[bi];return [+(y-p.y).toFixed(1),+Math.sqrt(bd).toFixed(1),Math.round(bi*k)];};
  dbgAuto(0);dbgBord({s:m.s0+25,lat:0,psi:0,vL:0,vA:Math.round(v/.48),grace:0});
  const out={P0:sQ.bt0,bt1:sQ.bt1,piste:[sQ.bt1,sQ.bt1+900],vol:[]},t0=performance.now();let fin='?';
  while(performance.now()-t0<14000){await Z(50);const c=dbgCanyonV3('car'),st=dbgState(),t=+((performance.now()-t0)/1000).toFixed(2),pi=piste(c.x,c.z,c.y);
    out.vol.push([t,c.x,c.z,c.y,c.mode,c.s,pi?pi[0]:null,pi?pi[1]:null,pi?pi[2]:null,c.sol]);
    if(st.gameOver){fin='MORT '+dbgRoute().cause;break;}
    if(out.vol.length>3&&c.mode==='drive'&&out.vol.some(r=>r[4]==='fall')){fin='POSE s='+c.s;break;}}
  out.fin=fin;out.vol=out.vol.filter((r,i)=>i%3===0||r[4]!==out.vol[Math.max(0,i-1)][4]);return JSON.stringify(out);
}catch(e){return 'ERREUR '+(e&&e.stack||e);}})()
