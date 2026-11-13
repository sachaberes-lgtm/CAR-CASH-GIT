/* LE VRAI SAUT, DANS LA PAGE (2026-11-11, LA DESCENTE) — à passer au banc des maps : node outils/banc-maps/banc.cjs gen --carte=nuages --graines=1 --auditfile=outils/banc-routes/saut-page.js
   1) sur la VRAIE route (dbgRoute), le simulateur du banc raccourcis.cjs (sortie par le bord, chute selon −N, pose sur la dalle la plus proche) cherche les départs qui marchent dans les
      modules à raccourci (filet, puits, boucle) ; 2) la caisse y est posée (dbgBord), sort par le bord SANS rien toucher, et on regarde où elle retombe vraiment.
   Rend {modules, vitesse, candidats, essais:[{fig, s, cote, predit, enJeu:'POSE'|'MORT'|'?', sPose, gain, vol}]}. */
(async function(){try{
  const Z=function(ms){return new Promise(function(r){setTimeout(r,ms);});},R=dbgRoute(),P=R.pts,T=R.T,N=R.Nn,Bv=R.B,NP=R.NP,L=R.L,H=R.demi||28,k=L/(NP-1);
  const esp=/carte=espace/.test(location.search),g=23*(esp?.5:1),v=+((/[?&]vsaut=([0-9.]+)/.exec(location.search)||[])[1])||90,pas=6;
  /* ===== L'ORBITE VERS L'AVANT (2026-11-12) : les sauts des modules faille / cascade / terrasses / écart / retourne, AU VRAI GESTE =====
     (ajouter &froute=0 à l'adresse : sinon le double-tap au sol lance une figure SUR la route au lieu du saut nitro)
     · faille, cascade, terrasses : la caisse roule droit à `vsaut` m/s vers chaque lèvre (là où la route se met à plonger) et fait le DOUBLE-TAP (dbgSautFig : veqDouble → veqSaut, la nitro remplie)
       `av=` mètres avant la lèvre (10) ;
     · ecart : (bord) posée au début du module, elle ne tourne pas et sort par le bord extérieur du 1er virage ; (nitro) le double-tap à l'entrée du virage, sans tourner ;
     · retourne : le double-tap 0,5 s avant que la dalle commence à se retourner — on doit se poser DESSOUS (side < 0).
     Par essai : POSE (s, face, gain = route sautée − distance volée), MORT (cause), RESTE (jamais décollé). Après une mort, la course est relancée (même graine) et on continue. */
  const V3=['faille','cascade','terrasses','ecart','retourne','vagues','faille-envers'],m3=dbgMods().filter(function(m){return V3.indexOf(m.fig)>=0;});
  if(m3.length){
    const q=function(n,d){const m=new RegExp('[?&]'+n+'=([^&]+)').exec(location.search);return m?m[1]:d;},av=+q('av',10),iOf=function(s){return Math.max(0,Math.min(NP-1,Math.round(s/k)));};
    const dot=function(a,b){return a.x*b.x+a.y*b.y+a.z*b.z;},cible=[];
    for(const m of m3){const a=iOf(m.s0),b=iOf(m.s1),Nr=N[a],Tr=T[a];
      if(m.fig==='faille'||m.fig==='cascade'||m.fig==='terrasses'||m.fig==='vagues'){const d=Math.round(25/k);let der=-1e9;
        for(let i=a;i<b-d;i++){const p0=dot(T[i],Nr),p1=dot(T[i+d],Nr);if(p0>-.12&&p1<p0-.1&&(i-der)*k>150){der=i;cible.push({fig:m.fig,s0:m.s0,geste:'nitro',ou:p0>.06?'crete':'levre',sJ:Math.round(i*k)-av,n:cible.filter(function(c){return c.s0===m.s0;}).length+1});}}}
      else if(m.fig==='faille-envers'){const d=Math.round(25/k);for(let i=a;i<b-d;i++)if(N[i].y<-.3&&dot(T[i+d],N[i])<-.1){cible.push({fig:m.fig,s0:m.s0,geste:'nitro',ou:'levre',sJ:Math.round(i*k)-av,n:1});break;}} /* (2026-11-13, L'ORBITE V5) la faille à l'envers : sa lèvre dans le repère de la dalle retournée */
      else if(m.fig==='ecart'){cible.push({fig:m.fig,s0:m.s0,geste:'bord',sJ:m.s0+10});for(let i=a;i<b;i++)if(dot(T[i],Tr)<.9976){cible.push({fig:m.fig,s0:m.s0,geste:'nitro',sJ:Math.round(i*k)-av});break;}}
      else if(m.fig==='retourne'){for(let i=a;i<b;i++)if(dot(N[i],Nr)<.9998){cible.push({fig:m.fig,s0:m.s0,geste:'nitro',ou:'avant',sJ:Math.round(i*k-.5*v)});cible.push({fig:m.fig,s0:m.s0,geste:'nitro',ou:'debut',sJ:Math.round(i*k+.4*v)});break;}} /* 0,5 s avant la vrille, et 0,4 s après son début */}
    const nMax=+q('essais',10),out={vitesse:v,fils:(window.dbgFilsOr?dbgFilsOr():null),L:Math.round(L),modules:m3.map(function(m){return m.fig+'@'+m.s0+'-'+m.s1;}),cibles:cible.length,essais:[],relances:0};
    try{dbgChance('bon',3);}catch(e){} /* la réanimation automatique : après une mort, la course reprend SUR LA MÊME ROUTE (relancer la course en tirait une autre) */
    const mortE=function(){const st=dbgState();return st.gameOver||st.mode==="boom";};
    const relance=async function(){out.relances++;const t0=performance.now();let joue=false;while(performance.now()-t0<60000){await Z(300);const st=dbgState();if(!st.gameOver&&st.mode==='drive'&&st.running){await Z(500);return Math.abs(dbgRoute().L-L)<1;}
      if(st.gameOver&&!joue&&performance.now()-t0>3000){joue=true;try{const n9=dbgRoute().niveau;dbgClassique('espace',n9&&n9.meteo||null);dbgChance('bon',3);dbgJouer();}catch(e){}} /* la réanimation ne sert qu'une fois par course : on rejoue la MÊME route (orbite imposée, même ambiance, pistegraine) */}return false;};
    for(const c of cible.slice(0,nMax)){
      if(mortE()&&!(await relance())){out.essais.push({fig:c.fig,stop:'pas de reprise sur la même route'});break;}
      dbgAuto(0);try{dbgNitro(1,0);}catch(e){}for(let r9=0;r9<8;r9++){if(dbgState().mode==='drive'){dbgBord({s:c.sJ,lat:0,psi:0,vL:0,vA:Math.round(v/.48),grace:0,side:1});await Z(70);if(Math.abs(dbgRoute().s-c.sJ)<40)break;}await Z(300);} /* posée là où on la veut (la caisse peut finir une pose) */dbgBord({lat:0,psi:0,vL:0,vA:Math.round(v/.48)});await Z(30);
      let saut=null;if(c.geste==='nitro'){saut=dbgSautFig(0,0);}
      const t0=performance.now(),cp=dbgScene().car.position;let vu=false,fin='RESTE',sL=null,tf=0,sDec=null,air=0,ox=cp.x,oy=cp.y,oz=cp.z,side=null,cause=null;
      while(performance.now()-t0<14000){await Z(50);const st=dbgState(),r=dbgRoute();
        if(st.gameOver||st.mode==='boom'){fin='MORT';cause=r.cause;sL=Math.round(r.s);break;}
        if(st.mode==='fall'){if(!vu){vu=true;sDec=Math.round(r.s);}air+=Math.hypot(cp.x-ox,cp.y-oy,cp.z-oz);tf=st.fallT||tf;}
        ox=cp.x;oy=cp.y;oz=cp.z;
        if(vu&&st.mode==='drive'){sL=Math.round(r.s);side=dbgBord().side;fin='POSE';await Z(1200);if(mortE()){fin='POSE PUIS MORT';cause=dbgRoute().cause;}break;}
        if(!vu&&performance.now()-t0>(c.geste==='bord'?9000:1500))break;}
      out.essais.push({fig:c.fig,mod:c.s0,n:c.n,ou:c.ou,geste:c.geste,sJ:c.sJ,saut:saut&&{ok:saut.ok,dv:saut.dv,nit:saut.nit},enJeu:fin,cause:cause||undefined,face:side,decolle:sDec,sPose:sL,
        route:sL!=null&&sDec!=null?sL-sDec:null,vole:Math.round(air),gain:fin.indexOf('POSE')===0&&sL!=null&&sDec!=null?Math.round(sL-sDec-air):null,vol:+(+tf).toFixed(1)});
      if(c.fig==='retourne'&&fin==='POSE'&&side<0&&!out.suite){ /* posée DESSOUS : la suite se roule-t-elle jusqu'au portail ? (sous la dalle : ni saut nitro ni figures) */
        dbgAuto(1,0,{nit:0});const z0=dbgRoute().zone,t1=performance.now();out.suite='?';
        while(performance.now()-t1<70000){await Z(250);const st=dbgState();if(mortE()){out.suite='MORT '+dbgRoute().cause+' @'+Math.round(dbgRoute().s);break;}if(dbgRoute().zone!==z0){out.suite='PORTAIL atteint';break;}}
        dbgAuto(0);break;}
      await Z(300);}
    try{dbgAuto(0);out.filsFin=window.dbgFilsOr?dbgFilsOr():null;}catch(e){}
    return JSON.stringify(out);}
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
