/* L'AUDIT DE GÉNÉRATION DU CANYON FINAL (2026-11-17), évalué DANS LE VRAI JEU par lot.mjs, une fois le canyon posé (course lancée).
   Lecture seule. Tout passe par la collision du vol `dbgCanyon('heurt', x, y, z)` (relief, monuments, tunnels, tubes, ouvrages : la même que le jeu) :
   · couloir : le volume de conduite (toute la largeur moins 1 m, de 0,8 à 6 m au-dessus de la dalle, dans le repère penché) ne touche aucune roche ;
   · oeil    : la caméra de poursuite (derrière la caisse, portrait de près et paysage reculé) n'est jamais dans la roche ;
   · pieces  : chaque ramassable est sur la route (écart ≤ demi-largeur), hors de la roche, à moins de 9 m de la dalle (hors pièces en l'air) ;
   · dalle   : la règle d'or (dbgCanyon('test')), les décors dans le couloir (dbgCanyonAudit), le contact des murs, les lames, les ouvrages ;
   · raccord : la dalle ne casse pas (angle entre deux tangentes voisines, saut de normale, marche de hauteur). */
(function(){
  if(typeof dbgCanyon!=='function')return {erreur:'pas de crochet'};
  const D=dbgCanyon();if(!D||!D.on)return {erreur:'pas de canyon'};
  const R=dbgRoute(),P=R.pts,T=R.T,N=R.Nn,B=R.B,NP=R.NP,L=R.L,RH=R.demi,ds=L/(NP-1),H=(x,y,z)=>dbgCanyon('heurt',x,y,z);
  const out={L:Math.round(L),RH:+RH.toFixed(1),hz:D.hz&&D.hz.p.map(a=>a[0]).join(','),ms:D.ms&&D.ms.total};
  const ou=(o,k,v)=>{o.n++;if(o.ou.length<14)o.ou.push(v);};
  /* le couloir de conduite */
  {const c={n:0,ou:[]},pas=Math.max(1,Math.round(4/ds));
    for(let i=Math.round(30/ds);i<NP-Math.round(10/ds);i+=pas){const p=P[i],b=B[i],n=N[i];let vu=false;
      for(const lt of [-(RH-1),-RH*.5,0,RH*.5,RH-1]){for(const up of [.8,2.5,6]){const r=H(p.x+b.x*lt+n.x*up,p.y+b.y*lt+n.y*up,p.z+b.z*lt+n.z*up);
        if(r){ou(c,0,Math.round(i*ds)+'/'+Math.round(lt)+'/'+up+'/'+r);vu=true;break;}}if(vu)break;}}
    out.couloir=c;}
  /* l'œil du joueur : derrière la caisse, sur la normale de la dalle (de près : portrait ; reculé : paysage) */
  {const c={n:0,ou:[]},pas=Math.max(1,Math.round(6/ds));
    for(let i=Math.round(80/ds);i<NP-Math.round(10/ds);i+=pas){const p=P[i],t=T[i],n=N[i];
      for(const e of [[12,4.5],[20,6.5],[34,9]]){const r=H(p.x-t.x*e[0]+n.x*e[1],p.y-t.y*e[0]+n.y*e[1],p.z-t.z*e[0]+n.z*e[1]);if(r){ou(c,0,Math.round(i*ds)+'/'+e[0]+'/'+r);break;}}}
    out.oeil=c;}
  /* les ramassables */
  {const c={n:0,ou:[],tot:0,hors:0,roche:0,dessous:0,loin:0},O=dbgCanyon('objets')||[];c.tot=O.length;
    for(const q of O){if(q[4]==null)continue;const i=Math.max(0,Math.min(NP-1,Math.round(q[0]/ds))),p=P[i],dx=q[4]-p.x,dy=q[5]-p.y,dz=q[6]-p.z,lt=dx*B[i].x+dy*B[i].y+dz*B[i].z,up=dx*N[i].x+dy*N[i].y+dz*N[i].z;
      if(Math.abs(q[1])>RH-.5||Math.abs(lt)>RH){c.hors++;ou(c,0,'hors '+q[0]+'/'+lt.toFixed(1)+'/'+q[3]);}
      const r=H(q[4],q[5],q[6]);if(r){if(q[2]<0)c.dessous++; /* le double sous la dalle (chaque pièce en a un, sur toutes les maps) : enfoui là où la dalle porte sur la roche, compté à part */else{c.roche++;ou(c,0,'roche '+q[0]+'/'+lt.toFixed(1)+'/'+up.toFixed(1)+'/'+q[3]+'/'+r);}}
      if(!q[7]&&(up*q[2]<-.5||Math.abs(up)>9)){c.loin++;ou(c,0,'loin '+q[0]+'/'+up.toFixed(1)+'/'+q[3]);}}
    out.pieces=c;}
  /* les raccords de la dalle */
  {const c={n:0,ou:[],angMax:0,nMax:0,marche:0};
    for(let i=1;i<NP;i++){const a=Math.acos(Math.max(-1,Math.min(1,T[i].x*T[i-1].x+T[i].y*T[i-1].y+T[i].z*T[i-1].z)))*57.2958/ds,nn=Math.acos(Math.max(-1,Math.min(1,N[i].x*N[i-1].x+N[i].y*N[i-1].y+N[i].z*N[i-1].z)))*57.2958/ds;
      const dd=Math.hypot(P[i].x-P[i-1].x,P[i].y-P[i-1].y,P[i].z-P[i-1].z);
      if(a>c.angMax)c.angMax=a;if(nn>c.nMax)c.nMax=nn;if(Math.abs(dd-ds)>c.marche)c.marche=Math.abs(dd-ds);
      if(a>3||nn>4||Math.abs(dd-ds)>ds*.5)ou(c,0,Math.round(i*ds)+'/t'+a.toFixed(1)+'/n'+nn.toFixed(1)+'/d'+dd.toFixed(1));}
    c.angMax=+c.angMax.toFixed(2);c.nMax=+c.nMax.toFixed(2);c.marche=+c.marche.toFixed(2);out.raccord=c;}
  /* les murs : là où la dalle est couchée (> 60°) hors des tubes, la roche qui la porte est-elle derrière elle ? (on marche sous la dalle, le long de sa normale, jusqu'à la roche) */
  {const c={n:0,ou:[],pts:0,max:0,med:0},G=[],pas=Math.max(1,Math.round(8/ds));let TB=[];try{TB=dbgCanyonVoute().tubes||[];}catch(e){}
    for(let i=Math.round(60/ds);i<NP-Math.round(60/ds);i+=pas){const n=N[i];if(Math.abs(n.y)>.5)continue;const s9=i*ds;if(TB.some(v=>s9>v[0]-80&&s9<v[1]+80))continue;const p=P[i];let g=99;
      for(let d=6;d<=60;d+=2){if(H(p.x-n.x*d,p.y-n.y*d,p.z-n.z*d)){g=d;break;}}
      c.pts++;G.push(g);if(g>c.max)c.max=g;if(g>24)ou(c,0,Math.round(s9)+'/'+g);}
    G.sort((x,y)=>x-y);c.med=G.length?G[G.length>>1]:0;out.mur=c;}
  /* les contrôles du jeu */
  try{const A=dbgCanyonAudit();out.regle=A.regle;out.relief=A.relief;out.flotte=A.flotte;out.tunnel=A.tunnel;const d={};for(const k in A.deco){const e=A.deco[k];if(e.couloir||e.dalle)d[k]={couloir:e.couloir,dalle:e.dalle,ou:e.ou.slice(0,6)};}out.deco=d;}catch(e){out.audit='erreur '+e.message;}
  try{const M=dbgCanyonMurs();out.murs=M&&M.contact?M.contact:null;out.zones=M&&M.zones?M.zones.length:0;out.rouli=M&&M.rouliMaxDegS;}catch(e){out.murs='erreur '+e.message;}
  try{out.lames=dbgCyLames();}catch(e){out.lames='erreur '+e.message;}
  try{const V=dbgCanyonV3('test');out.v3={faux:V.faux,n:V.n,res:V.res.filter(r=>r[1]!=='ok')};out.ouvrages=dbgCanyonV3().ouvrages;}catch(e){out.v3='erreur '+e.message;}
  try{const V=dbgCanyonVoute();out.tubes=V.tubes||[];}catch(e){out.tubes='erreur '+e.message;}
  try{out.gab=dbgCanyonGab().map(z=>z.t+':'+Math.round(z.a)+'-'+Math.round(z.b)).join(' ');}catch(e){}
  try{out.bornes=dbgCyBornes(5);}catch(e){out.bornes='erreur '+e.message;}
  return out;
})()
