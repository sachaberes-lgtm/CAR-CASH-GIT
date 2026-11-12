/* LE VRAI SAUT, DANS LA PAGE (2026-11-11, LA DESCENTE) — à passer au banc des maps : node outils/banc-maps/banc.cjs gen --carte=nuages --graines=1 --auditfile=outils/banc-routes/saut-page.js
   1) sur la VRAIE route (dbgRoute), le simulateur du banc raccourcis.cjs (sortie par le bord, chute selon −N, pose sur la dalle la plus proche) cherche les départs qui marchent dans les
      modules à raccourci (filet, puits, boucle) ; 2) la caisse y est posée (dbgBord), sort par le bord SANS rien toucher, et on regarde où elle retombe vraiment.
   Rend {modules, vitesse, candidats, essais:[{fig, s, cote, predit, enJeu:'POSE'|'MORT'|'?', sPose, gain, vol}]}. */
(async function(){try{
  const Z=function(ms){return new Promise(function(r){setTimeout(r,ms);});},R=dbgRoute(),P=R.pts,T=R.T,N=R.Nn,Bv=R.B,NP=R.NP,L=R.L,H=R.demi||28,k=L/(NP-1);
  const esp=/carte=espace/.test(location.search),g=23*(esp?.5:1),v=+((/[?&]vsaut=([0-9.]+)/.exec(location.search)||[])[1])||90,pas=6;
  const mods=dbgMods().filter(function(m){return m.fig==='filet'||m.fig==='puits'||m.fig==='boucle';});
  const C=70,grid=new Map(),key=function(x,y,z){return ((x&2047)*2048+(y&2047))*2048+(z&2047);},I=[];
  for(let i=0;i<NP;i+=pas){I.push(i);const q=P[i],kk=key(Math.floor(q.x/C),Math.floor(q.y/C),Math.floor(q.z/C));let l=grid.get(kk);if(!l)grid.set(kk,l=[]);l.push(i);}
  const sim=function(i,side){let px=P[i].x+Bv[i].x*side*(H+.5),py=P[i].y+Bv[i].y*side*(H+.5),pz=P[i].z+Bv[i].z*side*(H+.5),vx=T[i].x*v,vy=T[i].y*v,vz=T[i].z*v,t=0,dist=0;const n=N[i];
    while(t<6){const dt=1/40,ox=px,oy=py,oz=pz;vx-=n.x*g*dt;vy-=n.y*g*dt;vz-=n.z*g*dt;px+=vx*dt;py+=vy*dt;pz+=vz*dt;t+=dt;dist+=Math.hypot(vx,vy,vz)*dt;
      const cx=Math.floor(px/C),cy=Math.floor(py/C),cz=Math.floor(pz/C);
      for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++)for(let c=-1;c<=1;c++){const l=grid.get(key(cx+a,cy+b,cz+c));if(!l)continue;
        for(const j of l){if(Math.abs(j-i)*k<120)continue;const q=P[j],nn=N[j],dx=px-q.x,dy=py-q.y,dz=pz-q.z,h=dx*nn.x+dy*nn.y+dz*nn.z,h0=(ox-q.x)*nn.x+(oy-q.y)*nn.y+(oz-q.z)*nn.z;
          if(h0>0&&h<=0&&h>-6&&Math.abs(dx*Bv[j].x+dy*Bv[j].y+dz*Bv[j].z)<H&&Math.abs(dx*T[j].x+dy*T[j].y+dz*T[j].z)<pas+8){
            const sp=Math.hypot(vx,vy,vz),cosA=(vx*T[j].x+vy*T[j].y+vz*T[j].z)/sp,gain=(j-i)*k-dist;if(cosA<.574||gain<150)return null;return {j:j,gain:gain,t:t};}}}}
    return null;};
  const cand=[];for(const m of mods){const a=Math.max(4,Math.round((m.s0+60)/k)),b=Math.min(NP-5,Math.round(m.s1/k));let best=[];
    for(let i=a;i<b;i+=pas*3)for(const side of [-1,1]){const r=sim(i,side);if(r)best.push({fig:m.fig,i:i,s:Math.round(i*k),side:side,gain:Math.round(r.gain),t:+r.t.toFixed(1),sPred:Math.round(r.j*k)});}
    best.sort(function(x,y){return y.gain-x.gain;});const n=best.length;if(n){cand.push(best[0]);if(n>4)cand.push(best[n>>1]);}}
  const essais=[];dbgAuto(0);
  const sLit=function(){try{if(typeof dbgPos==='function'){const q=dbgPos();if(q&&q.s!=null)return q.s;}}catch(e){}return dbgRoute().s;};
  for(const x of cand.slice(0,5)){dbgBord({s:x.s,lat:0,psi:0,vA:Math.round(v/.48),grace:0});dbgBord({lat:x.side*(H+1.2),vL:0});
    const t0=performance.now();let vu=false,fin='?',sL=null,tf=0;
    while(performance.now()-t0<9000){await Z(80);const st=dbgState();if(st.mode==='fall'&&!vu)vu=true;if(vu&&st.mode==='drive'){sL=Math.round(sLit());fin='POSE';break;}if(st.gameOver){fin='MORT';sL=Math.round(sLit());break;}tf=st.fallT||tf;}
    essais.push({fig:x.fig,s:x.s,cote:x.side,predit:x.sPred,gainPredit:x.gain,volPredit:x.t,enJeu:fin,sPose:sL,gain:fin==='POSE'&&sL!=null?sL-x.s:null,vol:+(+tf).toFixed(1)});
    if(fin==='MORT')break;await Z(400);}
  return JSON.stringify({modules:mods.map(function(m){return m.fig;}),vitesse:v,g:g,candidats:cand.length,essais:essais});
}catch(e){return 'ERREUR saut-page : '+(e&&e.stack||e);}})()
