/* LA DESCENTE ET LES RACCOURCIS D'UNE MAP, DANS LA PAGE (2026-11-11, LA DESCENTE DES VILLES) — pour TOUTES les maps (ville, crypto, grotte, canyon…), à passer au banc des maps :
     node outils/banc-maps/banc.cjs gen --carte=ville --graines=1,2,3 --auditfile=outils/banc-routes/raccourcis-page.js [--q=vsaut=90&essais=6&fig=filet]
   1) sur la VRAIE route (dbgRoute) : la pente moyenne, puis le simulateur du banc raccourcis.cjs (sortie par le bord à `vsaut` m/s, chute selon −N, pose sur la dalle la plus proche,
      gain ≥ 150 m, pose à ±55°, vol ≤ 6 s) sur TOUTE la route — un raccourci = un seau de 90 m de départ où au moins un tir réussit ;
   2) les meilleurs candidats sont JOUÉS : la caisse est posée au bord (dbgBord), sort SANS rien toucher, et on regarde où elle retombe vraiment (une tour, une paroi tuent : le simulateur ne les voit pas).
      `fig=` : ne jouer que les candidats de ce module (dbgMods) · `essais=` : combien (6) · `essais=0` : la mesure seule.
   Rend {L, pente, racKm, gros, gainMax, modules, seaux:[{s, gain, fig}], essais:[{fig, s, cote, predit, gainPredit, enJeu:'POSE'|'MORT'|'?', cause, sPose, gain, vol}]}. */
(async function(){try{
  const Z=function(ms){return new Promise(function(r){setTimeout(r,ms);});};
  try{dbgAuto(1,0,{nit:0});}catch(e){} /* le pilote auto tient la caisse en vie pendant la mesure (dans la grotte, 4 s sans pilote = la roche) */
  if(/[?&]carte=grotte/.test(location.search)&&typeof dbgGrotte==='function'){for(let k9=0;k9<240;k9++){let ok9=false;try{ok9=!!dbgGrotte().pret;}catch(e){}if(ok9)break;await Z(300);}} /* la roche est creusée dans un travailleur : on l'attend, sinon aucune paroi ne tue */
  const R=dbgRoute(),P=R.pts,T=R.T,N=R.Nn,Bv=R.B,NP=R.NP,L=R.L,H=R.demi||28,k=L/(NP-1);
  const q=function(n,d){const m=new RegExp('[?&]'+n+'=([^&]+)').exec(location.search);return m?m[1]:d;};
  const esp=/carte=espace/.test(location.search),g=23*(esp?.5:1),v=+q('vsaut',90),nEss=+q('essais',6),figQ=q('fig',''),pas=Math.max(1,Math.round(6/k));
  const mods=(typeof dbgMods==='function'?dbgMods():[]),figDe=function(s){for(const m of mods)if(s>=m.s0-60&&s<=m.s1)return m.fig||'module';return '';};
  const C=70,grid=new Map(),key=function(x,y,z){return ((x&2047)*2048+(y&2047))*2048+(z&2047);};
  for(let i=0;i<NP;i+=pas){const p=P[i],kk=key(Math.floor(p.x/C),Math.floor(p.y/C),Math.floor(p.z/C));let l=grid.get(kk);if(!l)grid.set(kk,l=[]);l.push(i);}
  const sim=function(i,side,vv){let px=P[i].x+Bv[i].x*side*(H+.5),py=P[i].y+Bv[i].y*side*(H+.5),pz=P[i].z+Bv[i].z*side*(H+.5),vx=T[i].x*vv,vy=T[i].y*vv,vz=T[i].z*vv,t=0,dist=0;const n=N[i];
    while(t<6){const dt=1/40,ox=px,oy=py,oz=pz;vx-=n.x*g*dt;vy-=n.y*g*dt;vz-=n.z*g*dt;px+=vx*dt;py+=vy*dt;pz+=vz*dt;t+=dt;dist+=Math.hypot(vx,vy,vz)*dt;
      const cx=Math.floor(px/C),cy=Math.floor(py/C),cz=Math.floor(pz/C);
      for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++)for(let c=-1;c<=1;c++){const l=grid.get(key(cx+a,cy+b,cz+c));if(!l)continue;
        for(const j of l){if(Math.abs(j-i)*k<120)continue;const p=P[j],nn=N[j],dx=px-p.x,dy=py-p.y,dz=pz-p.z,h=dx*nn.x+dy*nn.y+dz*nn.z,h0=(ox-p.x)*nn.x+(oy-p.y)*nn.y+(oz-p.z)*nn.z;
          if(h0>0&&h<=0&&h>-6&&Math.abs(dx*Bv[j].x+dy*Bv[j].y+dz*Bv[j].z)<H&&Math.abs(dx*T[j].x+dy*T[j].y+dz*T[j].z)<pas*k+8){
            const sp=Math.hypot(vx,vy,vz),cosA=(vx*T[j].x+vy*T[j].y+vz*T[j].z)/sp,gain=(j-i)*k-dist;if(cosA<.574||gain<150)return null;return {j:j,gain:gain,t:t};}}}}
    return null;};
  const seaux=new Map(),i0=Math.round(200/k),i1=NP-Math.round(150/k);
  for(let i=i0;i<i1;i+=pas*3)for(const side of [-1,1])for(const m of [.9,1,1.15,1.4]){const r=sim(i,side,v*m);if(!r)continue;const kk=Math.floor(i*k/90);let o=seaux.get(kk);
    if(!o)seaux.set(kk,o={s:Math.round(i*k),i:i,side:side,gain:0,t:0,sPred:0,ms:{},m1:null});o.ms[m]=1;
    if(m===1&&(!o.m1||r.gain>o.m1.gain))o.m1={i:i,s:Math.round(i*k),side:side,gain:Math.round(r.gain),t:+r.t.toFixed(1),sPred:Math.round(r.j*k)};
    if(r.gain>o.gain){o.gain=Math.round(r.gain);}}
  const S=[...seaux.values()];for(const o of S)o.fig=figDe(o.s);
  const out={L:Math.round(L),pente:+((P[0].y-P[NP-1].y)/L*100).toFixed(1),racKm:+(S.length/(L/1000)).toFixed(2),robustes:S.filter(function(o){return Object.keys(o.ms).length>=3;}).length,
    gros:S.filter(function(o){return o.gain>=400;}).length,gainMax:S.reduce(function(m,o){return Math.max(m,o.gain);},0),vitesse:v,
    modules:mods.map(function(m){return (m.fig||'-')+'@'+m.s0;}),seaux:S.map(function(o){return o.s+':'+o.gain+(o.fig?'('+o.fig+')':'');}),essais:[]};
  if(nEss>0){let cand=S.filter(function(o){return o.m1&&(!figQ||o.fig===figQ);}).map(function(o){return Object.assign({fig:o.fig},o.m1);});
    /* un candidat par module d'abord (le meilleur gain), puis les autres par gain */
    cand.sort(function(a,b){return b.gain-a.gain;});const vus={},tete=[],reste=[];for(const c of cand){const kf=c.fig+'@'+(mods.find(function(m){return c.s>=m.s0-60&&c.s<=m.s1;})||{s0:c.s}).s0;if(c.fig&&!vus[kf]){vus[kf]=1;tete.push(c);}else reste.push(c);}
    cand=tete.concat(reste).slice(0,nEss);cand.sort(function(a,b){return a.s-b.s;});
    dbgAuto(0);
    const sLit=function(){return dbgRoute().s;};
    for(const x of cand){dbgBord({s:x.s,lat:0,psi:0,vA:Math.round(v/.48),grace:0});await Z(60);dbgBord({lat:x.side*(H+1.2),vL:0});
      const t0=performance.now();let vu=false,fin='?',sL=null,tf=0;
      while(performance.now()-t0<9000){await Z(80);const st=dbgState();if(st.mode==='fall'&&!vu)vu=true;if(vu&&st.mode==='drive'){sL=Math.round(sLit());fin='POSE';break;}if(st.gameOver){fin='MORT';sL=Math.round(sLit());break;}tf=st.fallT||tf;}
      out.essais.push({fig:x.fig,s:x.s,cote:x.side,predit:x.sPred,gainPredit:x.gain,volPredit:x.t,enJeu:fin,cause:fin==='MORT'?dbgRoute().cause:undefined,sPose:sL,gain:fin==='POSE'&&sL!=null?sL-x.s:null,vol:+(+tf).toFixed(1)});
      if(fin==='MORT')break;await Z(400);}}
  /* 3) `droit=1` : LE VRAI GESTE (les sauts des villes) — la caisse est posée sur l'approche de chaque module saut / grandsaut, au milieu (ou `lat=` m), et NE TOURNE PAS : elle doit quitter le bord extérieur
     du virage toute seule et se poser sur la route d'en bas. Rend out.droit:[{fig, s, lat, enJeu, cause, sPose, gain, vol}]. */
  if(q('droit','')==='1'){out.droit=[];dbgAuto(0);const latQ=+q('lat',0);
    for(const m of mods){if(m.fig!=='saut'&&m.fig!=='grandsaut'&&m.fig!=='butte')continue;const s0=m.s0+25; /* (2026-11-13) + la BOUCLE DE LA BUTTE du canyon : posée au début du balcon, elle file droit et quitte le bord extérieur quand le tour commence */dbgBord({s:s0,lat:latQ,psi:0,vL:0,vA:Math.round(v/.48),grace:0});
      const t0=performance.now();let vu=false,fin='?',sL=null,tf=0,sDec=null;
      while(performance.now()-t0<12000){await Z(60);const st=dbgState();if(st.mode==='fall'&&!vu){vu=true;sDec=Math.round(dbgRoute().s);}if(vu&&st.mode==='drive'){sL=Math.round(dbgRoute().s);fin='POSE';break;}if(st.gameOver){fin='MORT';sL=Math.round(dbgRoute().s);break;}tf=st.fallT||tf;if(!vu&&dbgRoute().s>m.s0+(m.fig==='butte'?1300:700))break;}
      out.droit.push({fig:m.fig,s:s0,lat:latQ,decolle:sDec,enJeu:vu?fin:'RESTE SUR LA ROUTE',cause:fin==='MORT'?dbgRoute().cause:undefined,sPose:sL,gain:fin==='POSE'&&sL!=null&&sDec!=null?sL-sDec:null,vol:+(+tf).toFixed(1)});
      if(fin==='MORT')break;await Z(500);}}
  return JSON.stringify(out);
}catch(e){return 'ERREUR raccourcis-page : '+(e&&e.stack||e);}})()
