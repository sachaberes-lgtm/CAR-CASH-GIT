/* ---------------- LES GÉANTS DU CONTE : quatre arbres-monuments (pied = 0, la ROUTE passe vers y ≈ 70) ----------------
   Leurs couronnes commencent vers 95 m (buildForet les met à l'échelle pour qu'elles soient 25-35 m AU-DESSUS de la dalle). Chacun rend
   aussi ses COLLISIONS : des gélules [x0,y0,z0,x1,y1,z1,r] (tronc, branches maîtresses, arche) et des sphères [x,y,z,r] (la couronne,
   prise à 78 % : on frôle le feuillage sans mourir, on meurt dans le bois). */
function fgRacines(K,n,r0,rg,col,ec,lod,ytop){for(let k=0;k<n;k++){const an=k/n*6.283+rg()*.4,x=Math.cos(an),z=Math.sin(an),L9=r0*(1.7+rg()*.8);
  fbTube(K,[[x*r0*.55,r0*.9,z*r0*.55],[x*r0*1.05,r0*.35,z*r0*1.05],[x*L9,-1.5,z*L9]],[r0*.42,r0*.30,r0*.10],lod?5:8,{col:col,ec:ec,mousse:1,ytop:ytop,rg:rg,rug:lod?0:.05,aoK:-.2});}}
const FOR_GEANTS={
  /* (2026-10-14 soir, Sacha : « BEAUCOUP plus d'arbres, BEAUCOUP plus grands, un peu comme la ville ») LE SÉQUOIA-TOUR : un fût droit et
     cannelé, rouge, sans une branche sur les deux premiers tiers — la route passe ENTRE les troncs comme entre des immeubles — puis une
     couronne étroite en étages de touffes, tout là-haut. 320 m au gabarit, ×0,9-1,8 à la pose : de 290 à 570 m. */
  sequoia:function(K,lod,rg){const H=320,C=[],S=[],col=FC.eSeq,cc=[0,262,0];
    const tr=[[0,0,0],[0,36,0],[.6,100,0],[0,170,.5],[-.5,236,0],[0,290,0],[0,H-3,0]],rr=[17,13.4,11.6,9.8,7.6,4.4,.6];
    fbTube(K,tr,rr,lod?9:18,{col:col,ec:1,mousse:.5,ytop:H,rg:rg,rug:lod?.05:.16});
    for(let i=0;i<tr.length-2;i++)C.push([tr[i][0],tr[i][1],tr[i][2],tr[i+1][0],tr[i+1][1],tr[i+1][2],rr[i+1]*1.04]);
    fgRacines(K,lod?6:10,17,rg,col,1,lod,H);
    const et=lod?5:8;for(let e=0;e<et;e++){const t=e/(et-1),y=184+t*(H-198),R9=(1-t)*30+5,nb=Math.max(2,Math.round((lod?3:5)*(1-t*.6)));
      for(let k=0;k<nb;k++){const an=k/nb*6.283+e*1.1+rg()*.5,c=[Math.cos(an)*R9,y+rg()*8,Math.sin(an)*R9],r=(1-t)*13+7+rg()*3;
        fbTouffe(K,c,r*(lod?1.2:1),lod?1:(t<.3?2:1),{rg:rg,cc:cc,cr:40,col:FC.seq,ytop:H,sq:.7});
        if(k%2===0)S.push([c[0]*.7,c[1],c[2]*.7,r*.7]);}}
    return {h:H,cr:40,cy:262,cb:178,C:C,S:S};},
  chene:function(K,lod,rg){const H=168,C=[],S=[],col=FC.eChene,cc=[0,140,0];
    const tr=[[0,0,0],[2,30,1],[-1,62,3],[3,92,0],[1,112,-2]],rr=[12.5,9,7.4,6.2,4.6];
    fbTube(K,tr,rr,lod?8:16,{col:col,ec:2,mousse:1,ytop:H,rg:rg,rug:lod?.02:.08});
    for(let i=0;i<tr.length-1;i++)C.push([tr[i][0],tr[i][1],tr[i][2],tr[i+1][0],tr[i+1][1],tr[i+1][2],rr[i+1]*1.02]);
    fgRacines(K,lod?5:8,12,rg,col,2,lod,H);
    const nl=lod?5:7;for(let k=0;k<nl;k++){const an=k/nl*6.283+rg()*.5,x=Math.cos(an),z=Math.sin(an),y0=96+rg()*14,L9=34+rg()*16;
      const p=[[x*3,y0,z*3],[x*L9*.5,y0+12+rg()*8,z*L9*.5],[x*L9,y0+22+rg()*10,z*L9]];
      fbTube(K,p,[3.6,2.4,1.1],lod?5:8,{col:col,ec:2,mousse:.6,ytop:H,rg:rg,rug:lod?0:.05});C.push([p[0][0],p[0][1],p[0][2],p[2][0],p[2][1],p[2][2],2.4]);
      fbTouffe(K,[p[2][0]*1.08,p[2][1]+6,p[2][2]*1.08],15+rg()*5,lod?1:2,{rg:rg,cc:cc,cr:46,col:FC.chene,ytop:H,sq:.72});S.push([p[2][0]*1.08,p[2][1]+6,p[2][2]*1.08,(15+2.5)*.78]);}
    for(let k=0;k<(lod?3:6);k++){const an=rg()*6.283,r9=rg()*18,c=[Math.cos(an)*r9,138+rg()*16,Math.sin(an)*r9],r=16+rg()*5;
      fbTouffe(K,c,r,lod?1:2,{rg:rg,cc:cc,cr:46,col:FC.chene,ytop:H,sq:.75});S.push([c[0],c[1],c[2],r*.78]);}
    return {h:H,cr:48,cy:140,C:C,S:S};},
  hetre:function(K,lod,rg){const H=172,C=[],S=[],col=FC.eHetre,cc=[0,142,0];
    const tr=[[0,0,0],[0,40,.5],[1,80,0],[0,105,0],[0,120,1]],rr=[9.5,7.6,6.4,5.4,4.2];
    fbTube(K,tr,rr,lod?8:16,{col:col,ec:1,mousse:.8,ytop:H,rg:rg,rug:lod?0:.025});
    for(let i=0;i<tr.length-1;i++)C.push([tr[i][0],tr[i][1],tr[i][2],tr[i+1][0],tr[i+1][1],tr[i+1][2],rr[i+1]*1.02]);
    fgRacines(K,lod?5:7,9.5,rg,col,1,lod,H);
    const nl=lod?4:6;for(let k=0;k<nl;k++){const an=k/nl*6.283+rg()*.4,x=Math.cos(an),z=Math.sin(an),y0=100+rg()*10,L9=26+rg()*10;
      const p=[[x*2.5,y0,z*2.5],[x*L9*.55,y0+16,z*L9*.55],[x*L9,y0+30+rg()*8,z*L9]];
      fbTube(K,p,[3,2,.9],lod?5:8,{col:col,ec:1,ytop:H,rg:rg});C.push([p[0][0],p[0][1],p[0][2],p[2][0],p[2][1],p[2][2],2]);}
    const n=lod?9:17;for(let k=0;k<n;k++){const top=k===0,an=k*2.39996+rg()*.4,el=top?1.5:-.25+rg()*1.05,R9=top?0:30;
      const c=[Math.cos(an)*R9*Math.cos(el),142+(top?22:Math.sin(el)*22),Math.sin(an)*R9*Math.cos(el)],r=(top?18:13+rg()*5)*(lod?1.15:1);
      fbTouffe(K,c,r,lod?1:2,{rg:rg,cc:cc,cr:44,col:FC.hetre,ytop:H,sq:.85});S.push([c[0],c[1],c[2],r*.78]);}
    return {h:H,cr:44,cy:142,C:C,S:S};},
  epicea:function(K,lod,rg){const H=214,C=[],S=[],col=FC.eEpicea;
    fbTube(K,[[0,0,0],[0,70,0],[0,140,0],[0,H-2,0]],[7.5,5.6,3.4,.5],lod?7:12,{col:col,ec:0,mousse:.9,ytop:H,rg:rg,rug:lod?0:.05});
    C.push([0,0,0,0,140,0,6],[0,140,0,0,H,0,3.4]);
    fgRacines(K,lod?4:6,7.5,rg,col,0,lod,H);
    const n=lod?9:18,y0=96,y1=H-5;
    for(let k=0;k<n;k++){const t=k/(n-1),y=y0+(y1-y0)*t,r=2+31*Math.pow(1-t,1.05),hh=(y1-y0)/(n-1)*(lod?1.2:1.45);
      fbJupe(K,y,r,hh,Math.max(6,Math.round(13-t*7)),{rg:rg,col:FC.epicea,ytop:H,drp:.55});
      if(k>=2&&k%2===0)S.push([0,y+hh*.35,0,r*.5]);} // (pas les deux plus bas étages : on passe SOUS les branches qui surplombent le bord de route)
    fbTube(K,[[0,H-6,0],[0,H+3,0]],[1.2,.05],5,{col:FC.epicea,ec:0,ytop:H,rg:rg,part:2});
    return {h:H,cr:33,cy:140,C:C,S:S};},
  ancien:function(K,lod,rg){const H=160,C=[],S=[],col=[.28,.25,.21],cc=[0,135,0];
    const tr=[[0,0,0],[-3,22,2],[2,46,-2],[-2,72,2],[3,96,0],[0,110,-3]],rr=[15,11.5,10,9.4,7,5];
    fbTube(K,tr,rr,lod?9:18,{col:col,ec:2,mousse:1.3,ytop:H,rg:rg,rug:lod?.03:.13});
    for(let i=0;i<tr.length-1;i++)C.push([tr[i][0],tr[i][1],tr[i][2],tr[i+1][0],tr[i+1][1],tr[i+1][2],rr[i+1]*1.02]);
    fgRacines(K,lod?5:9,14,rg,col,2,lod,H);
    /* LE VISAGE (côté +z, vers la route : buildForet tourne l'arbre) : deux orbites creuses et une bouche tordue — des noeuds sombres
       le jour, des braises la nuit (partie 5) ; deux arcades d'écorce au-dessus. Hauteur 74 m : la route passe juste dessous. */
    const fz=(y)=>{let b=0,i=0;for(;i<tr.length-1;i++)if(y<=tr[i+1][1])break;const a=tr[i],c=tr[Math.min(i+1,tr.length-1)],u=(y-a[1])/Math.max(1,c[1]-a[1]);
      return [a[0]+(c[0]-a[0])*u,a[2]+(c[2]-a[2])*u,rr[i]+(rr[Math.min(i+1,rr.length-1)]-rr[i])*u];};
    const fy=74,f0=fz(fy),fc=[f0[0],fy,f0[1]+f0[2]*.93],vis={rg:rg,cc:[f0[0],fy,f0[1]],cr:f0[2],ytop:H,part:5,bos:.08,mix:.2};
    for(const sx of [-1,1]){fbTouffe(K,[fc[0]+sx*3.4,fy+2.6,fc[2]-.7],2.0,1,Object.assign({},vis,{col:[.05,.035,.03],sq:.75}));
      fbTouffe(K,[fc[0]+sx*3.6,fy+5.1,fc[2]+.35],1.9,1,{rg:rg,cc:[f0[0],fy,f0[1]],cr:f0[2],ytop:H,col:col,part:0,sq:.45,bos:.2,mix:.3});}
    fbTouffe(K,[fc[0]+.4,fy-4.2,fc[2]-.6],2.3,1,Object.assign({},vis,{col:[.04,.03,.025],sq:.55}));
    fbTouffe(K,[fc[0],fy-.4,fc[2]+.9],1.3,1,{rg:rg,cc:[f0[0],fy,f0[1]],cr:f0[2],ytop:H,col:col,part:0,sq:1.5,bos:.15,mix:.3}); // le nez : un noeud
    const nl=lod?5:8;for(let k=0;k<nl;k++){const an=k/nl*6.283+rg()*.6,x=Math.cos(an),z=Math.sin(an),y0=92+rg()*16,L9=30+rg()*18;
      const p=[[x*3,y0,z*3],[x*L9*.4+(rg()-.5)*8,y0+8+rg()*10,z*L9*.4+(rg()-.5)*8],[x*L9*.8,y0+6+rg()*14,z*L9*.8],[x*L9,y0+20+rg()*10,z*L9]];
      fbTube(K,p,[3.4,2.6,1.8,.9],lod?5:8,{col:col,ec:2,mousse:.9,ytop:H,rg:rg,rug:lod?0:.09});C.push([p[0][0],p[0][1],p[0][2],p[2][0],p[2][1],p[2][2],2.6]);
      if(k%2===0){fbTouffe(K,[p[3][0],p[3][1]+5,p[3][2]],12+rg()*4,lod?1:2,{rg:rg,cc:cc,cr:42,col:[.08,.15,.05],ytop:H,sq:.7});S.push([p[3][0],p[3][1]+5,p[3][2],12*.78]);}}
    for(let k=0;k<(lod?2:4);k++){const an=rg()*6.283,r9=rg()*14,c=[Math.cos(an)*r9,128+rg()*12,Math.sin(an)*r9],r=14+rg()*4;
      fbTouffe(K,c,r,lod?1:2,{rg:rg,cc:cc,cr:42,col:[.08,.15,.05],ytop:H,sq:.7});S.push([c[0],c[1],c[2],r*.78]);}
    return {h:H,cr:42,cy:135,C:C,S:S,face:[fc[0],fy,fc[2]]};},
  /* (2026-10-17, Léo : « des ARBRES PLEUREURS ») LE SAULE GÉANT : un fût creusé qui penche, des maîtresses branches en gerbe, un dôme
     aplati — et son RIDEAU de mèches (deux faces) qui tombe de 146 m jusqu'au-dessus de la route : on roule dessous, il ondule au vent. */
  gsaule:function(K,lod,rg){const H=172,C=[],S=[],col=FC.eSaule,X=6,Z=1.5,cc=[X,146,Z];
    const tr=[[0,0,0],[2.5,30,1],[5,62,2.5],[6.5,90,2],[X,104,Z]],rr=[13,10.6,9.2,8,6.6];
    fbTube(K,tr,rr,lod?8:16,{col:col,ec:2,mousse:1,ytop:H,rg:rg,rug:lod?.03:.1});
    for(let i=0;i<tr.length-1;i++)C.push([tr[i][0],tr[i][1],tr[i][2],tr[i+1][0],tr[i+1][1],tr[i+1][2],rr[i+1]*1.02]);
    fgRacines(K,lod?5:8,13,rg,col,2,lod,H);
    const nl=lod?5:8;for(let k=0;k<nl;k++){const an=k/nl*6.283+rg()*.5,x=Math.cos(an),z=Math.sin(an),y0=96+rg()*8;
      const p=[[X+x*3,y0,Z+z*3],[X+x*13,y0+18+rg()*6,Z+z*13],[X+x*26,y0+36+rg()*8,Z+z*26]];
      fbTube(K,p,[3.4,2.2,.9],lod?5:8,{col:col,ec:2,mousse:.5,ytop:H,rg:rg,rug:lod?0:.06});C.push([p[0][0],p[0][1],p[0][2],p[1][0],p[1][1],p[1][2],2.2]);}
    fbTouffe(K,[X,152,Z],34,lod?1:2,{rg:rg,cc:cc,cr:46,col:FC.saule,ytop:H,sq:.5,bos:.2});S.push([X,152,Z,26]);
    for(let k=0;k<(lod?3:6);k++){const an=k/(lod?3:6)*6.283+rg()*.5,c=[X+Math.cos(an)*26,142+rg()*6,Z+Math.sin(an)*26],r=15+rg()*4;
      fbTouffe(K,c,r,1,{rg:rg,cc:cc,cr:46,col:FC.saule,ytop:H,sq:.55,bos:.22});S.push([c[0],c[1],c[2],r*.7]);}
    fbRideau(K,{rg:rg,cx:X,cz:Z,n:lod?36:84,m:lod?3:6,R:42,L:52,y0:146,col:FC.saule,ytop:H,pli:.06,ev:.12,deux:true,vent:1.7});
    return {h:H,cr:48,cy:146,C:C,S:S};},
  /* LE HÊTRE PLEUREUR GÉANT (« le tortillard ») : un tronc énorme, tordu, moussu, huit branches SERPENTINES qui partent à l'horizontale, se
     tordent, puis plongent ; une canopée plate posée dessus, et un rideau de feuilles au bout de chaque branche — entre eux, le bois. */
  gpleureur:function(K,lod,rg){const H=150,C=[],S=[],col=FC.eHetre,cc=[0,124,0];
    const tr=[[0,0,0],[-4,22,3],[3,46,-2],[-3,70,3],[2,90,0],[0,100,-2]],rr=[15.5,12,10.5,9.6,8.4,7];
    fbTube(K,tr,rr,lod?9:18,{col:col,ec:1,mousse:1.2,ytop:H,rg:rg,rug:lod?.04:.15});
    for(let i=0;i<tr.length-1;i++)C.push([tr[i][0],tr[i][1],tr[i][2],tr[i+1][0],tr[i+1][1],tr[i+1][2],rr[i+1]*1.02]);
    fgRacines(K,lod?5:9,15,rg,col,1,lod,H);
    const nl=lod?5:8,ends=[];for(let k=0;k<nl;k++){const an=k/nl*6.283+(rg()-.5)*.5,x=Math.cos(an),z=Math.sin(an),px=-z,pz=x,w1=(rg()-.5)*16,w2=(rg()-.5)*18,y0=94+rg()*10;
      const p=[[x*4,y0,z*4],[x*14+px*w1*.5,y0+12,z*14+pz*w1*.5],[x*26+px*w1,y0+16,z*26+pz*w1],[x*38+px*w2,y0+10,z*38+pz*w2],[x*46+px*w2*.6,y0-4,z*46+pz*w2*.6]];
      fbTube(K,p,[4.2,3.3,2.4,1.6,.7],lod?5:8,{col:col,ec:1,mousse:1,ytop:H,rg:rg,rug:lod?0:.12});
      C.push([p[0][0],p[0][1],p[0][2],p[2][0],p[2][1],p[2][2],3.3]);ends.push([p[3],Math.atan2(p[3][2],p[3][0])]);
      const c=[p[2][0]*1.05,p[2][1]+12,p[2][2]*1.05];fbTouffe(K,c,16+rg()*4,lod?1:2,{rg:rg,cc:cc,cr:48,col:FC.pleureur,ytop:H,sq:.45,bos:.28});S.push([c[0],c[1],c[2],12]);}
    fbTouffe(K,[0,126,0],26,lod?1:2,{rg:rg,cc:cc,cr:48,col:FC.pleureur,ytop:H,sq:.42,bos:.25});S.push([0,126,0,20]);
    for(const e of ends){const p=e[0];fbRideau(K,{rg:rg,n:lod?6:13,m:lod?2:5,R:Math.hypot(p[0],p[2])+4,L:34,y0:p[1]+6,a0:e[1]-.36,ar:.72,col:FC.pleureur,ytop:H,pli:.1,ev:.05,deux:true,vent:1.6});}
    return {h:H,cr:50,cy:124,C:C,S:S};}};
const FOR_GEANTS_N=['chene','hetre','epicea','ancien','sequoia'];
/* (2026-10-17 soir) le VOLUME des géants pleureurs, en unités du prototype : du bas des rideaux (bas) à la cime (h), rayon r — pour la pelote, où une route d'un autre étage peut passer à côté */
const FOR_PLEUR_VOL={gsaule:{bas:94,h:172,r:48},gpleureur:{bas:76,h:150,r:50}};
const FOR_GEANTS_PL=['gsaule','gpleureur']; // (2026-10-17) les géants PLEUREURS — à part : la liste du tirage des géants (FOR_GEANTS_N) ne bouge pas
/* LE LOIN (au-delà de la bande moyenne) : la couronne seule — une boule bosselée pour les feuillus, un cône à deux pentes pour les conifères */
const FOR_LOIN={hetre:[19.5,8.8,.85],chene:[15.5,10.5,.62],bouleau:[16,4.8,1.5],pin:[24.5,6.4,.55],saule:[9.5,9,1],pleureur:[11,11.5,.55]}; // (2026-10-17) les pleureurs : un grand dôme qui touche presque le sol
function foretLoin(k,K,rg){const H=k==='epicea'?37:33,o=FOR_LOIN[k];
  if(!o){fbTube(K,[[0,3,0],[0,H*.55,0],[0,H+.5,0]],[k==='epicea'?6.6:6,k==='epicea'?3.3:3.4,.15],6,{col:FC[k],ec:0,ytop:H,rg:rg,part:2});return;}
  fbTouffe(K,[0,o[0],0],o[1],0,{rg:rg,cc:[0,o[0],0],cr:o[1],col:FC[k],ytop:o[0]+o[1],bos:.12,sq:o[2]});}
/* LES PROTOTYPES (une fois par session : la géométrie ne dépend pas de la piste) */
function foretProtos(){if(FORET.protos)return FORET.protos;const t0=performance.now(),P={esp:{},geant:{}};
  for(const k of FOR_ESP_N){P.esp[k]=[];for(let l=0;l<2;l++){let K=fbNew();const rg=mulberry32(0xF0E5+k.length*977+l*31);let m;if(l===2){foretLoin(k,K,rg);m=P.esp[k][0].m;}else m=FOR_ESP[k](K,l,rg);
    P.esp[k].push({g:fbGeo(K),m:m,tri:K.I.length/3});}}
  for(const k of FOR_GEANTS_N.concat(FOR_GEANTS_PL)){P.geant[k]=[];for(let l=0;l<2;l++){let K=fbNew();const m=FOR_GEANTS[k](K,l,mulberry32(0x6EA7+k.length*131));P.geant[k].push({g:fbGeo(K),m:m,tri:K.I.length/3});}} // même graine aux deux détails : mêmes branches, mêmes collisions
  // LE LOIN, EN DEUX FAMILLES SEULEMENT (toutes essences) : une boule unité (feuillus) et un cône unité (conifères), blancs — l'albédo de
  // chaque arbre voyage dans son exemplaire (aI.yzw, voir FOR_ARB_VS) : 2 appels de dessin au lieu de 6
  {let K=fbNew();const rg=mulberry32(0x10A1);fbTouffe(K,[0,0,0],1,0,{rg:rg,cc:[0,0,0],cr:1,col:[1,1,1],ytop:1,bos:.12,sq:1});P.boule={g:fbGeo(K),tri:K.I.length/3};}
  {let K=fbNew();const rg=mulberry32(0x10A2);fbTube(K,[[0,0,0],[0,1,0]],[1,.02],6,{col:[1,1,1],ec:0,ytop:1,rg:rg,part:2,fixe:1});P.cone={g:fbGeo(K),tri:K.I.length/3};}
  P.ms=Math.round(performance.now()-t0);return FORET.protos=P;}
/* ---------------- LES PEINTURES : fleurs, papillons, lune, loup-garou, brume (des canvas, cuits une fois) ---------------- */
function forTex(cv,mip){const t=new THREE.CanvasTexture(cv);t.generateMipmaps=mip!==false;t.minFilter=mip===false?THREE.LinearFilter:THREE.LinearMipmapLinearFilter;t.magFilter=THREE.LinearFilter;
  try{t.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());}catch(e){}return typeof texLibere==='function'?texLibere(t):t;} // peintes une fois : la toile est rendue après l'envoi (paliers ancien et moyen)
/* LES FLEURS DU BORD (8 cases de 128 × 256, la plante pousse depuis le bas) : 0 DIGITALE · 1 COQUELICOTS · 2 MARGUERITES · 3 BOUTONS D'OR ·
   4 JACINTHES DES BOIS · 5 FOUGÈRE · 6 LIERRE (il pend depuis le haut) · 7 AMANITES. La nuit, ce qui n'est pas vert luit (FOR_FLEUR). */
function forFleursTex(){if(FORET.tex.fl)return FORET.tex.fl;
  const W=128,H=256,K9=PAL_B9('foretTex',1),cv=document.createElement('canvas');cv.width=W*8*K9;cv.height=H*K9;const g=cv.getContext('2d'),R=mulberry32(0xF1E0);g.scale(K9,K9);
  const tige=(x0,y0,x1,y1,cx,cy,w,c)=>{g.strokeStyle=c||'#3f6e1c';g.lineWidth=w||3;g.lineCap='round';g.beginPath();g.moveTo(x0,y0);g.quadraticCurveTo(cx,cy,x1,y1);g.stroke();};
  const feuille=(x,y,a,l,w,c)=>{g.save();g.translate(x,y);g.rotate(a);g.fillStyle=c||'#4a8a22';g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(l*.5,-w,l,0);g.quadraticCurveTo(l*.5,w,0,0);g.fill();
    g.strokeStyle='rgba(20,50,10,.5)';g.lineWidth=1;g.beginPath();g.moveTo(0,0);g.lineTo(l*.92,0);g.stroke();g.restore();};
  const disque=(x,y,r,c)=>{g.fillStyle=c;g.beginPath();g.arc(x,y,r,0,6.2832);g.fill();};
  for(let t=0;t<8;t++){g.save();g.translate(t*W,0);g.beginPath();g.rect(1,0,W-2,H);g.clip();
    if(t===0){ // DIGITALE : une hampe, des cloches pourpres tachetées qui pendent d'un côté
      for(let k=0;k<5;k++)feuille(64,250,-Math.PI/2+(k-2)*.5,46+R()*14,9,k%2?'#3f7a1e':'#4f8f28');
      tige(64,252,62,22,70,140,4);
      for(let k=0;k<13;k++){const y=40+k*15+R()*4,s=1-k*.035,x=62+(k%2?6:-2);
        g.save();g.translate(x,y);g.rotate(.5+(k%2?.3:-.1));const gr=g.createLinearGradient(0,0,22*s,0);gr.addColorStop(0,'#7a2a78');gr.addColorStop(1,'#e070c8');
        g.fillStyle=gr;g.beginPath();g.moveTo(0,-5*s);g.quadraticCurveTo(14*s,-10*s,23*s,-7*s);g.lineTo(23*s,8*s);g.quadraticCurveTo(14*s,9*s,0,5*s);g.fill();
        g.fillStyle='#fbe8f6';g.beginPath();g.ellipse(22*s,0,3*s,7*s,0,0,6.283);g.fill();
        for(let j=0;j<3;j++)disque(17*s+R()*4,-2+R()*5,1.1,'#5a1440');g.restore();}
      for(let k=0;k<4;k++)disque(63+R()*4,22+k*5,3-k*.5,'#8a3a8a');}
    else if(t===1){ // COQUELICOTS
      for(let k=0;k<3;k++)feuille(64,252,-Math.PI/2+(k-1)*.9,40,7,'#4c7f26');
      const P9=[[40,70],[86,52],[66,120],[30,150]];
      for(const p of P9){tige(64,254,p[0],p[1]+10,(64+p[0])/2+(R()-.5)*30,170,2.5,'#557f2c');
        for(let j=0;j<4;j++){g.fillStyle=j%2?'#e3271c':'#ff3d24';g.beginPath();g.ellipse(p[0]+Math.cos(j*1.57+.4)*7,p[1]+Math.sin(j*1.57+.4)*5,13,10,j*1.57,0,6.283);g.fill();}
        disque(p[0],p[1],5,'#1c140c');for(let j=0;j<8;j++)disque(p[0]+Math.cos(j*.785)*6,p[1]+Math.sin(j*.785)*6,1.2,'#2a1a10');}
      tige(64,254,100,96,90,180,2,'#557f2c');g.fillStyle='#6b8f3a';g.beginPath();g.ellipse(100,92,4,7,.2,0,6.283);g.fill();}
    else if(t===2){ // MARGUERITES
      for(let k=0;k<6;k++)feuille(64,252,-Math.PI/2+(k-2.5)*.42,34,6,'#4f8a2a');
      const P9=[[34,64],[78,40],[98,92],[56,110],[24,128]];
      for(const p of P9){tige(64,254,p[0],p[1]+6,(64+p[0])/2,190,2.2,'#5a8f30');
        for(let j=0;j<16;j++){const a=j/16*6.283;g.save();g.translate(p[0],p[1]);g.rotate(a);g.fillStyle=j%2?'#ffffff':'#f2f0ea';g.beginPath();g.ellipse(9,0,8,2.6,0,0,6.283);g.fill();g.restore();}
        disque(p[0],p[1],5.5,'#f7c21a');disque(p[0]-1,p[1]-1,3,'#ffd84a');}}
    else if(t===3){ // BOUTONS D'OR
      for(let k=0;k<5;k++)feuille(64,252,-Math.PI/2+(k-2)*.55,30,10,'#3f7f22');
      const P9=[[30,80],[60,54],[92,70],[46,118],[84,124],[70,96]];
      for(const p of P9){tige(64,254,p[0],p[1]+6,(64+p[0])/2,180,1.8,'#4f8a28');
        for(let j=0;j<5;j++){const a=j/5*6.283-1.57;g.fillStyle='#ffd21a';g.beginPath();g.ellipse(p[0]+Math.cos(a)*5,p[1]+Math.sin(a)*5,6,5,a,0,6.283);g.fill();}
        disque(p[0],p[1],3,'#e8a10a');g.fillStyle='rgba(255,255,220,.8)';g.beginPath();g.ellipse(p[0]-3,p[1]-4,2.5,1.5,-.6,0,6.283);g.fill();}}
    else if(t===4){ // JACINTHES DES BOIS : des hampes qui se courbent, des clochettes bleues qui pendent
      for(let k=0;k<6;k++)feuille(64,254,-Math.PI/2+(k-2.5)*.3,90,6,k%2?'#3f7a24':'#4c8c2c');
      for(let s9=0;s9<3;s9++){const x0=50+s9*14,tx=x0+28+s9*6,ty=40+s9*22;tige(64,254,tx,ty,x0-10,120,2.4,'#4a7a2a');
        for(let j=0;j<8;j++){const u=.25+j*.09,x=64+(tx-64)*u+(1-u)*u*(x0-10-64)*2,y=254+(ty-254)*u+(1-u)*u*(120-254)*2*.0;
          const yy=254-(254-ty)*u-Math.sin(u*3.1)*20;g.save();g.translate(x+6,yy+4);g.rotate(.4);const gr=g.createLinearGradient(0,-6,0,8);gr.addColorStop(0,'#3a3ab0');gr.addColorStop(1,'#7a7aff');
          g.fillStyle=gr;g.beginPath();g.moveTo(-4,-6);g.quadraticCurveTo(-6,4,-6,8);g.lineTo(6,8);g.quadraticCurveTo(6,4,4,-6);g.fill();g.restore();}}}
    else if(t===5){ // FOUGÈRE : des frondes arquées, des pennes alternées
      for(let f=0;f<7;f++){const a=-Math.PI/2+(f-3)*.36,L9=170+R()*60,cx=64+Math.cos(a)*L9*.55,cy=254+Math.sin(a)*L9*.7;
        const ex=64+Math.cos(a)*L9*(.8+Math.abs(f-3)*.06)+(f-3)*8,ey=254+Math.sin(a)*L9*.92+Math.abs(f-3)*18;
        tige(64,254,ex,ey,cx,cy,2,'#3f6f1c');
        for(let j=1;j<18;j++){const u=j/18,x=(1-u)*(1-u)*64+2*(1-u)*u*cx+u*u*ex,y=(1-u)*(1-u)*254+2*(1-u)*u*cy+u*u*ey;
          const dx=2*(1-u)*(cx-64)+2*u*(ex-cx),dy=2*(1-u)*(cy-254)+2*u*(ey-cy),an=Math.atan2(dy,dx),l=(1-u)*22+4;
          for(const sd of [-1,1])feuille(x,y,an+sd*1.25,l,3.2,j%2?'#5a9a2c':'#4a8a24');}}}
    else if(t===6){ // LIERRE : des brins qui pendent depuis le haut, des feuilles en coeur
      for(let b=0;b<4;b++){let x=20+b*28+R()*8,y=0;g.strokeStyle='#4a3a22';g.lineWidth=2;g.beginPath();g.moveTo(x,y);
        const pts9=[];for(let j=0;j<12;j++){x+=(R()-.5)*10;y+=18+R()*6;g.lineTo(x,y);pts9.push([x,y]);}g.stroke();
        for(const p of pts9){for(const sd of [-1,1]){g.save();g.translate(p[0]+sd*5,p[1]);g.rotate(sd*.6+(R()-.5)*.6);
          g.fillStyle=R()<.5?'#2f6a1c':'#3f7f26';g.beginPath();g.moveTo(0,-7);g.bezierCurveTo(8,-12,12,0,0,9);g.bezierCurveTo(-12,0,-8,-12,0,-7);g.fill();
          g.strokeStyle='rgba(180,220,140,.35)';g.lineWidth=.8;g.beginPath();g.moveTo(0,-6);g.lineTo(0,7);g.stroke();g.restore();}}}}
    else { // AMANITES TUE-MOUCHES
      const P9=[[44,188,22],[84,170,28],[66,216,15],[100,222,12]];
      for(let k=0;k<4;k++)feuille(64,254,-Math.PI/2+(k-1.5)*.7,26,5,'#4a7a22');
      for(const p of P9){g.fillStyle='#efe8dc';g.beginPath();g.moveTo(p[0]-p[2]*.22,256);g.lineTo(p[0]-p[2]*.16,p[1]);g.lineTo(p[0]+p[2]*.16,p[1]);g.lineTo(p[0]+p[2]*.22,256);g.fill();
        g.fillStyle='#f6f0e4';g.beginPath();g.ellipse(p[0],p[1]+p[2]*.45,p[2]*.3,p[2]*.08,0,0,6.283);g.fill();
        const gr=g.createRadialGradient(p[0]-p[2]*.3,p[1]-p[2]*.4,2,p[0],p[1],p[2]);gr.addColorStop(0,'#ff5a3a');gr.addColorStop(1,'#b8140c');
        g.fillStyle=gr;g.beginPath();g.ellipse(p[0],p[1],p[2],p[2]*.62,0,Math.PI,0);g.quadraticCurveTo(p[0],p[1]+p[2]*.12,p[0]-p[2],p[1]);g.fill();
        for(let j=0;j<7;j++)disque(p[0]+(R()-.5)*p[2]*1.4,p[1]-R()*p[2]*.5,p[2]*.07+R()*1.5,'#fffaf0');}}
    g.restore();}
  return FORET.tex.fl=forTex(cv);}
/* LES AILES (5 cases de 128 × 128, l'aile DROITE, le corps à gauche) : 0 CITRON · 1 PAON DU JOUR · 2 AZURÉ · 3 VULCAIN · 4 CHAUVE-SOURIS */
function forAilesTex(){if(FORET.tex.ai)return FORET.tex.ai;
  const S=128,K9=PAL_B9('foretTex',1),cv=document.createElement('canvas');cv.width=S*5*K9;cv.height=S*K9;const g=cv.getContext('2d');g.scale(K9,K9);
  const aile=(fx,fy,hx,hy,c1,c2)=>{ // l'aile antérieure (vers l'avant, en haut) et la postérieure (en bas)
    let gr=g.createLinearGradient(0,64,S,64);gr.addColorStop(0,c2);gr.addColorStop(.35,c1);gr.addColorStop(1,c1);g.fillStyle=gr;
    g.beginPath();g.moveTo(4,60);g.bezierCurveTo(30,10,fx*.7,fy-6,fx,fy);g.bezierCurveTo(fx+6,fy+24,fx-20,58,40,64);g.closePath();g.fill();
    g.beginPath();g.moveTo(4,66);g.bezierCurveTo(30,64,hx+8,hy-28,hx,hy);g.bezierCurveTo(hx-22,hy+14,26,104,6,74);g.closePath();g.fill();};
  const disque=(x,y,r,c)=>{g.fillStyle=c;g.beginPath();g.arc(x,y,r,0,6.2832);g.fill();};
  for(let t=0;t<5;t++){g.save();g.translate(t*S,0);g.beginPath();g.rect(0,0,S,S);g.clip();
    if(t===0){aile(118,18,98,112,'#f2ec6a','#c9d64a');disque(64,44,4,'#e8902a');disque(58,88,3,'#e8902a');g.strokeStyle='rgba(120,130,40,.35)';g.lineWidth=1;for(let k=0;k<6;k++){g.beginPath();g.moveTo(6,62);g.lineTo(40+k*14,20+k*7);g.stroke();}}
    else if(t===1){aile(116,20,100,110,'#b83a1e','#5a2414');g.fillStyle='rgba(40,20,14,.9)';g.beginPath();g.moveTo(100,20);g.lineTo(118,22);g.lineTo(104,52);g.fill();
      disque(98,34,15,'#2a1a40');disque(98,34,12,'#3d6ad8');disque(98,34,7,'#f2d24a');disque(99,34,4,'#1a1018');
      disque(80,96,12,'#1a1418');disque(80,96,9,'#4a7ae0');disque(80,96,5,'#e8e0d0');}
    else if(t===2){aile(112,22,96,104,'#4aa2ff','#2a5ad0');g.strokeStyle='#1a2448';g.lineWidth=3;g.beginPath();g.moveTo(40,64);g.bezierCurveTo(90,58,112,30,112,22);g.stroke();
      g.strokeStyle='#ffffff';g.lineWidth=2;g.beginPath();g.moveTo(112,24);g.bezierCurveTo(116,44,100,58,44,64);g.stroke();for(let k=0;k<4;k++)disque(60+k*9,92+k*3,2,'#1a2448');}
    else if(t===3){aile(118,16,98,110,'#141210','#2a2420');g.strokeStyle='#e8401c';g.lineWidth=9;g.lineCap='round';g.beginPath();g.moveTo(52,58);g.quadraticCurveTo(86,30,104,50);g.stroke();
      g.lineWidth=6;g.beginPath();g.moveTo(40,96);g.quadraticCurveTo(70,108,94,102);g.stroke();for(const p of [[104,26],[112,34],[96,22]])disque(p[0],p[1],3.5,'#f4f0e8');}
    else {g.fillStyle='#120e14';g.beginPath();g.moveTo(2,48);g.lineTo(40,30);g.lineTo(78,18);g.lineTo(122,10);g.quadraticCurveTo(116,36,110,52);g.quadraticCurveTo(96,48,90,66);
      g.quadraticCurveTo(76,62,70,82);g.quadraticCurveTo(54,78,46,96);g.quadraticCurveTo(30,86,2,84);g.closePath();g.fill();
      g.strokeStyle='#2a2230';g.lineWidth=2;for(const p of [[122,10],[110,52],[90,66],[70,82]]){g.beginPath();g.moveTo(4,50);g.lineTo(p[0],p[1]);g.stroke();}}
    g.restore();}
  return FORET.tex.ai=forTex(cv);}
/* LA LUNE PLEINE (le disque, ses mers, son halo — un sprite au-dessus des arbres, la nuit) */
function forLuneTex(){if(FORET.tex.lu)return FORET.tex.lu;const S=512,cv=document.createElement('canvas');cv.width=cv.height=S;const g=cv.getContext('2d'),R=mulberry32(0x10E);
  let gr=g.createRadialGradient(S/2,S/2,S*.16,S/2,S/2,S/2);gr.addColorStop(0,'rgba(220,240,255,.55)');gr.addColorStop(.35,'rgba(150,200,220,.18)');gr.addColorStop(1,'rgba(80,120,160,0)');
  g.fillStyle=gr;g.fillRect(0,0,S,S);
  gr=g.createRadialGradient(S*.46,S*.44,S*.02,S/2,S/2,S*.2);gr.addColorStop(0,'#fffdf2');gr.addColorStop(.8,'#efe9d4');gr.addColorStop(1,'#d8d2bc');g.fillStyle=gr;g.beginPath();g.arc(S/2,S/2,S*.2,0,6.2832);g.fill();
  g.save();g.beginPath();g.arc(S/2,S/2,S*.2,0,6.2832);g.clip();
  for(const m of [[.44,.42,.07],[.55,.47,.05],[.5,.58,.06],[.41,.55,.035],[.58,.38,.03]]){g.fillStyle='rgba(150,150,140,.35)';g.beginPath();g.ellipse(S*m[0],S*m[1],S*m[2],S*m[2]*.8,R()*3,0,6.283);g.fill();}
  for(let k=0;k<40;k++){const x=S*(.32+R()*.36),y=S*(.32+R()*.36),r=1+R()*5;g.strokeStyle='rgba(120,120,110,.3)';g.lineWidth=1;g.beginPath();g.arc(x,y,r,0,6.283);g.stroke();}
  g.restore();return FORET.tex.lu=forTex(cv,false);}
/* LE LOUP-GAROU (une ombre chinoise : dressé sur un rocher, la tête renversée, la gueule ouverte, il hurle à la lune) — pattes de loup
   (digitigrades), dos voûté hérissé, crinière, longs bras griffus, queue en panache. Chaque contour POILU est un tracé dont les segments
   reçoivent des mèches pointues vers l'extérieur (`poils`). */
function forLoupTex(){if(FORET.tex.lg)return FORET.tex.lg;const W=256,H=512,cv=document.createElement('canvas');cv.width=W;cv.height=H;const g=cv.getContext('2d'),R=mulberry32(0x7011);
  g.fillStyle='#05060a';g.strokeStyle='#05060a';g.lineJoin='round';
  const poly=(P)=>{g.beginPath();g.moveTo(P[0][0],P[0][1]);for(let i=1;i<P.length;i++)g.lineTo(P[i][0],P[i][1]);g.closePath();g.fill();};
  const poils=(P,amp,dens)=>{for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1],dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy),nx=-dy/l,ny=dx/l,n=Math.max(1,Math.round(l/dens));
    for(let k=0;k<n;k++){const u0=k/n,u1=(k+1)/n,um=(u0+u1)/2+(R()-.5)*.2,h=amp*(.6+R()*.8);g.beginPath();g.moveTo(a[0]+dx*u0,a[1]+dy*u0);
      g.lineTo(a[0]+dx*um+nx*h+dx/l*h*.35,a[1]+dy*um+ny*h+dy/l*h*.35);g.lineTo(a[0]+dx*u1,a[1]+dy*u1);g.closePath();g.fill();}}};
  poly([[8,512],[22,458],[58,436],[110,442],[168,430],[214,438],[246,470],[254,512]]);                               // le rocher
  poly([[84,300],[116,306],[112,348],[94,378],[104,416],[130,428],[132,438],[86,438],[80,420],[66,380],[72,334]]);    // la patte arrière
  poly([[114,304],[150,300],[154,346],[138,382],[150,418],[176,428],[178,438],[130,438],[126,422],[116,384],[112,342]]); // la patte avant
  for(const x of [128,174]){g.lineWidth=2.5;g.beginPath();g.moveTo(x,436);g.lineTo(x+6,440);g.stroke();}            // les griffes des pieds
  const dos=[[84,300],[70,262],[72,222],[86,188],[108,164],[130,150]];
  poly([[84,300]].concat(dos.slice(1)).concat([[150,148],[172,164],[178,204],[168,248],[156,300]]));                 // le torse voûté
  poils(dos,15,9);                                                                                                       // le dos hérissé
  const queue=[[82,292],[56,306],[34,340],[24,388],[30,412]];poly([[86,312]].concat(queue).concat([[46,404],[50,372],[66,338],[90,318]]));poils(queue,12,8); // la queue
  // le bras de derrière, puis celui de devant (longs, les griffes ouvertes)
  poly([[104,176],[90,214],[86,256],[94,290],[106,296],[104,258],[110,222],[120,190]]);
  for(let k=0;k<4;k++){g.lineWidth=2.2;g.beginPath();g.moveTo(98,292);g.lineTo(90+k*5,312+(k%2)*4);g.stroke();}
  const bras=[[156,168],[184,196],[198,236],[202,276]];poly(bras.concat([[214,300],[204,306],[190,282],[184,244],[170,212],[150,190]]));poils(bras,8,9);
  for(let k=0;k<4;k++){g.lineWidth=2.4;g.beginPath();g.moveTo(206,298);g.quadraticCurveTo(214+k*3,306+k*2,210+k*6,322+(k%2)*5);g.stroke();}
  // le cou et la crinière, la tête renversée vers la lune (museau vers le haut à droite), la gueule OUVERTE
  const criniere=[[128,152],[136,118],[150,92],[166,74]];
  poly([[126,156]].concat(criniere).concat([[184,70],[196,92],[184,118],[172,150],[170,172]]));poils(criniere,13,8);
  poly([[162,82],[176,64],[192,58],[202,70],[198,86],[182,96]]);                                                    // le crâne
  poly([[160,72],[146,36],[170,64]]);poly([[170,64],[166,30],[184,60]]);                                             // les oreilles couchées en arrière
  poly([[186,62],[214,34],[234,22],[230,34],[204,60],[196,74]]);                                                     // la mâchoire du haut
  poly([[196,86],[220,58],[230,50],[228,60],[208,82],[200,94]]);                                                     // la mâchoire du bas (la gueule s'ouvre entre les deux)
  poils([[196,96],[178,130],[172,160]],7,8);                                                                          // le poitrail
  return FORET.tex.lg=forTex(cv,false);}
/* ---------------- LES MATIÈRES (ShaderMaterial : aucune lumière de three, aucun programme qui dépende de la scène) ---------------- */
const FG_BRUIT=['float fh3(vec3 p){p=fract(p*.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}',
  'float fn3(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);',
  ' return mix(mix(mix(fh3(i),fh3(i+vec3(1.,0.,0.)),f.x),mix(fh3(i+vec3(0.,1.,0.)),fh3(i+vec3(1.,1.,0.)),f.x),f.y),',
  '            mix(mix(fh3(i+vec3(0.,0.,1.)),fh3(i+vec3(1.,0.,1.)),f.x),mix(fh3(i+vec3(0.,1.,1.)),fh3(i+vec3(1.,1.,1.)),f.x),f.y),f.z);}',
  'float fh2(vec2 p){vec3 p3=fract(vec3(p.xyx)*.1031);p3+=dot(p3,p3.yzx+33.33);return fract((p3.x+p3.y)*p3.z);}',
  'float fn2(vec2 x){vec2 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(mix(fh2(i),fh2(i+vec2(1.,0.)),f.x),mix(fh2(i+vec2(0.,1.)),fh2(i+vec2(1.,1.)),f.x),f.y);}'].join('\n');
const FG_LUM=['uniform vec3 uSunDir,uSunC,uSky,uGnd,uFillC,uFillD,uCam,uCarP,uCarF,uMistC,uLeafT;',
  'uniform float uTime,uPhare,uFlash,uWet,uHante,uMistK,uMistY,uRos,uLune,uVent,uAir;',
  // les PHARES de la caisse sur la forêt : un cône (cos .62-.93), une portée de ~150 m, une flaque blanche-chaude
  'vec3 fPhare(vec3 w,vec3 n){vec3 d=w-uCarP;float l=length(d);d/=max(l,.001);float c=smoothstep(.62,.93,dot(d,uCarF));',
  '  return vec3(1.,.93,.80)*uPhare*c*(2600./(l*l*.10+320.))*(.30+.70*max(dot(n,-d),0.));}',
  // la BRUME DU FOND : elle s'épaissit sous la route, et avec la distance
  'float fBrume(vec3 w,float dist){return uMistK*smoothstep(uMistY-6.,uMistY-95.,w.y)*(1.-exp(-dist*.0042));}'].join('\n');
const FOR_ARB_VS=['attribute vec4 aA;attribute vec3 aC;attribute vec2 aB;','#ifdef USE_INSTANCING','attribute vec4 aI;','#endif',
  'uniform float uTime,uVent;varying vec3 vW,vN,vO,vC,vNo;varying vec4 vA,vI;varying vec2 vB;varying float vS9;','#include <fog_pars_vertex>',
  'void main(){vec4 I=vec4(0.);mat4 M=modelMatrix;','#ifdef USE_INSTANCING','I=aI;M=modelMatrix*instanceMatrix;','#endif',
  '  vec3 p=position;float h=aA.w,sw=uVent*h*h*(aA.x>.5&&aA.x<2.5?1.:.35);vS9=length(M[0].xyz);',
  '  p.x+=sin(uTime*1.05+I.x*31.+p.y*.04)*sw*.9;p.z+=sin(uTime*.83+I.x*17.+p.y*.05)*sw*.7;',              // le vent : tout l'arbre se balance
  '  if(aA.x>.5&&aA.x<2.5)p+=normal*sin(uTime*3.3+dot(p,vec3(.6,.4,.5))+I.x*9.)*.10*uVent;',   // …et le feuillage frissonne
  '  vec4 wp=M*vec4(p,1.);vW=wp.xyz;vN=normalize((M*vec4(normal,0.)).xyz);vO=position+I.x*vec3(71.3,13.7,37.1);vNo=normal;vC=aC;vA=aA;vB=aB;vI=I;', // (2026-10-17) vO SANS le vent : les peintures ne glissent plus sur l arbre qui se balance (et le cube garde sa case)
  '  if(I.z>0.){vC=aC*I.yzw;vI=vec4(I.x,0.,0.,0.);vO=wp.xyz*.15;}',                                   // le LOIN : l'albédo de l'arbre est dans son exemplaire
  '  vec4 mvPosition=viewMatrix*wp;gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n');
const FOR_ARB_FS=[FG_BRUIT,FG_LUM,'uniform float uFen,uMini,uCon,uVit,uVitL,uVitS;uniform vec3 uVitG;varying vec3 vW,vN,vO,vC,vNo;varying vec4 vA,vI;varying vec2 vB;varying float vS9;','#include <fog_pars_fragment>',
  'void main(){float part=floor(vA.x+.5);vec3 N=normalize(vN);vec3 V=uCam-vW;float dist=length(V);V/=max(dist,.001);vec3 L=uSunDir;',
  '  vec3 alb=vC;float ao=vA.y,leaf=0.;vec3 o=vO;',
  '  float mk9=0.,mh9=0.;vec3 mn9=vec3(0.),mp9=vec3(0.);bool br9=part<.5||part>6.5;float ts9=vI.z<=0.&&vI.w>.5&&uVit>0.?1.45:.42;',
  '  if(uMini>0.||uVit>0.){vec3 jm9=vI.x*vec3(71.3,13.7,37.1);mp9=(vO-jm9)*vS9/ts9;vec3 ce9=floor(mp9);mk9=1.-smoothstep(.3,.85,length(fwidth(mp9)));', // (2026-10-17) LES MINI-CUBES : la case de 42 cm de ce pixel ; mk9 s efface quand elle tombe sous ~2 px
  '    mh9=fract(sin(dot(ce9+vI.x*31.,vec3(12.9898,78.233,37.719)))*43758.5453);mn9=vec3(fract(mh9*17.31),fract(mh9*43.17),fract(mh9*91.7))-.5;',
  '    if((part>.5&&part<2.5)||(uVit>0.&&br9))o=mix(vO,(ce9+.5)*ts9/max(vS9,.01)+jm9,mk9);}',   // (vitrail) l ÉCORCE aussi lue au centre de son écaille : une écaille, une teinte                                    // le feuillage lu au CENTRE de son mini-cube : une teinte par cube
  '  if(part<.5||part>6.5){float st=vB.x;',                                                                        // L'ÉCORCE
  '    if(st<.5){float pl=fn3(o*vec3(1.6,.55,1.6));alb*=.66+.66*pl;}',                                                 // épicéa : des écailles
  '    else if(st<1.5){float b=fn3(o*vec3(.45,.2,.45));alb*=.84+.28*b;float li=fn3(o*.9+vec3(3.1,0.,1.7))*.6+fn3(mat3(.8,.6,0.,-.6,.8,0.,0.,0.,1.)*o*2.3)*.4;alb=mix(alb,alb*vec3(.80,.97,.80),smoothstep(.55,.75,li));}', // hêtre : gris lisse, des lichens (deux octaves tournées : pas de pavés)
  '    else if(st<2.5){float r=fn3(o*vec3(2.1,.26,2.1))*.65+fn3(o*vec3(5.3,.7,5.3))*.35;alb*=.55+.6*smoothstep(.25,.75,r);}',                          // chêne : des sillons (deux octaves : plus de zébrures)
  '    else if(st<3.5){float ba=step(.70,fn3(vec3(o.x*2.2,o.y*5.,o.z*2.2)));alb=mix(alb,vec3(.07,.06,.055),ba*.92);alb=mix(vec3(.13,.11,.09),alb,smoothstep(.02,.14,vA.w));}', // bouleau : blanc, des tirets noirs, le pied sombre
  '    else if(st<4.5){float r=fn3(o*vec3(1.4,.4,1.4));alb=mix(vec3(.30,.27,.24)*(.55+.6*r),alb*(.82+.35*r),smoothstep(.35,.62,vA.w));}', // pin : gris en bas, saumon en haut
  '    else alb*=.9+.2*fn3(o*2.);',
  '    float mo=clamp(vB.y*(smoothstep(-.2,.6,N.y+fn3(o*.35)*.7-.35)+.32)+uWet*.3*vB.y,0.,1.);alb=mix(alb,vec3(.15,.30,.07)*(.8+.4*fn3(o*1.7)),mo*.85);}', // la MOUSSE (plus verte sous la pluie)
  /* (2026-10-17, Sacha, sur une capture de la forêt : « on voit clairement un problème de texture des feuilles des arbres ») LE FEUILLAGE EN CAMOUFLAGE :
     le bruit multipliait la couleur de ×,32 à ×1,22 (3,8 fois d'écart, en taches franches) — des TROUS NOIRS dans des grappes vert fluo. Désormais un écart
     doux (×,74 à ×1,06) sur des grappes plus larges, et la variation passe par DEUX VERTS (plus jaune au soleil, plus froid dans le creux) ; le relief
     bosselé de la touffe et la lumière font le reste. */
  ('  else if(part<2.5){float fin=1.-smoothstep(60.,170.,dist);leaf=fn3(o*.26)*.50+fn3(o*.80)*.34+mix(.5,fn3(o*2.1),fin)*.16;float lk=smoothstep(.18,.82,leaf);alb*=mix(.74,1.06,lk)*mix(vec3(.92,.97,1.06),vec3(1.06,1.03,.90),lk);ao*=mix(.82,1.,smoothstep(.15,.65,leaf));'
          ), // LE FEUILLAGE : des grappes de feuilles
  '    if(mk9>0.){vec3 fm9=fract(mp9);vec3 em9=min(fm9,1.-fm9);float eb9=uVit>0.?1.:smoothstep(.0,.16,min(min(em9.x,em9.y),em9.z));alb*=mix(1.,(.76+.48*mh9)*mix(.52,1.,eb9),mk9);}', // (mini-cubes) chaque cube sa nuance, et son bord un peu dans l ombre : on lit les petits cubes                                                                   // (mini-cubes) chaque cube sa nuance
  '    if(vI.y>1.5)alb*=vec3(1.35,1.12,.7);',                           // l'érable d'or
  '    else alb*=1.+vI.y*vec3(.16,.06,-.18);alb*=uLeafT;}',
  '  else if(part<3.5)alb*=.92+.16*fn3(o*1.5);',
  '  else if(part>5.5)alb=mix(alb*(.8+.3*fn3(o*.9)),vec3(.96,.94,.88),step(.62,fn3(o*3.)));',                       // l'amanite : rouge, points blancs
  '  float vj9=0.;vec3 cg9=vec3(0.);bool vb9=uVit>0.&&vI.z<=0.&&(part<2.5||part>6.5);',
  '  if(vb9){cg9=mix(alb/max(max(alb.r,max(alb.g,alb.b)),.04),uVitG,.42+.38*uHante);',
  '    if(mk9>0.){vec3 fq9=fract(mp9),eq9=min(fq9,1.-fq9),no9=abs(normalize(vNo)),sq9=sqrt(max(1.-no9*no9,.05)),es9=eq9/sq9,fw9=fwidth(mp9)/sq9+.002,w9=vec3(.05);',
  '      vec3 jl9=(1.-smoothstep(w9-fw9,w9+fw9,es9))*min(vec3(1.),w9/fw9);if(!(part>.5&&part<2.5&&vB.x>.5))vj9=max(jl9.x,max(jl9.y,jl9.z))*mk9;',
  '      float bv9=smoothstep(.0,.17,min(es9.x,min(es9.y,es9.z)));alb*=mix(1.,(br9?.8+.4*mh9:1.)*mix(.74,1.,bv9),mk9);if(br9)N=normalize(N+mn9*.62*mk9);}}',
  '  if(part>.5&&part<2.5&&mk9>0.)N=normalize(N+mn9*.85*mk9);',                                                    // (mini-cubes) chaque cube sa facette : il attrape la lumière à sa façon
  '  if(uCon>0.)ao=mix(ao,pow(ao,1.6),uCon);',                                                                     // (contraste) le creux des couronnes plus profond
  '  float ndl=dot(N,L),wr=(part>.5&&part<2.5)?.55:.25,dif=clamp((ndl+wr)/(1.+wr),0.,1.);',
  '  vec3 col=alb*((uSky*(.42+.36*N.y)*ao+uGnd*(.40-.30*N.y)*ao)*(1.-.12*uCon)+uSunC*dif*mix(.45,.86,ao)*(1.+.15*uCon)+uFillC*max(dot(N,-uFillD),0.)*.4);', // (contraste) moins de lumière du ciel dans l ombre, plus de soleil
  '  if(part>.5&&part<2.5){float tr=pow(max(dot(-V,L),0.),5.)*(1.-.45*ao);col+=alb*uSunC*tr*vec3(1.35,1.3,.6)*.85;', // le CONTRE-JOUR à travers les feuilles
  '    col+=uSunC*pow(max(dot(reflect(-L,N),V),0.),24.)*step(.72,leaf)*.35*uRos;',                                     // la rosée qui scintille
  '    if(mk9>0.){col+=uSunC*pow(max(dot(reflect(-L,N),V),0.),16.)*(.2+.55*mh9)*mk9*.72;',                           // (mini-cubes) la BRILLANCE : un reflet serré par cube (la nuit, celui de la lune)
  '      col+=uSunC*alb*2.*step(.985,fract(mh9*7.31+floor(uTime*.9+mh9*13.)*.618))*max(ndl,0.)*mk9;}}',               // …et des ÉCLATS : un cube sur soixante-dix s allume, puis un autre
  '  if(vb9){vec3 Ns9=normalize(vN);float nv9=max(dot(Ns9,V),0.),fr9=pow(1.-nv9,2.2);vec3 rf9=reflect(-V,Ns9),sk9=mix(uGnd*.7,uSky*1.25,smoothstep(-.3,.4,rf9.y));',
  '    col=col*(1.-.22*fr9*uVit)+uVit*(sk9*(.03+.5*fr9)+uSunC*pow(max(dot(rf9,L),0.),260.)*2.4+(.5+.5*cos(6.2832*(fr9*1.4+vW.y*.02+vec3(0.,.33,.67))))*fr9*.14);',
  '    float sc9=uVitS*exp(-pow((vA.w-fract(uTime*.16+vI.x*.37))/.09,2.)),lu9=uVitL*(1.+.5*uHante);vj9*=1.-uHante*.85*smoothstep(28.,105.,dist);',
  '    col+=cg9*uVit*(nv9*.05*(1.+uHante)+sc9*(.1+.25*mk9));col=mix(col,mix(col,cg9*lu9*mix(.42+.58*dif,1.,uHante),.52)*(1.+2.2*sc9),vj9*uVit);col=mix(col,mix(sk9,vec3(1.,.98,.92),.45*(1.-uHante))*(.75+.5*uSunC.g),pow(fr9,1.5)*.38*(1.-.55*uHante)*uVit);}',
  '  float rim=pow(1.-max(dot(N,V),0.),3.);col+=alb*uSunC*rim*(.20+.14*uCon)*dif;',
  '  col+=vec3(.55,.68,.92)*rim*uHante*(.14+.18*uCon)*step(part,2.5);',                                            // (contraste) la nuit, la lisière de lune plus franche : de belles silhouettes                                                          // la nuit, une lisière de LUNE (argent bleuté)
  '  col+=alb*fPhare(vW,N)*(part>.5&&part<2.5&&vB.x>.5?.3:1.);col+=alb*uFlash*vec3(.8,.85,1.)*(1.2+.8*max(N.y,0.));',             // (2026-10-17) les MÈCHES des pleureurs (aB.x = 1) : les phares les effleurent (pleins, elles faisaient une pluie de fils verts fluo la nuit)
  '  if(part>3.5&&part<4.5)col=mix(col,vec3(1.,.60,.22)*(1.3+.25*sin(uTime*7.+vI.x*20.+o.x)),uFen);',               // la FENÊTRE de la chaumière
  '  if(part>4.5&&part<5.5)col+=vec3(1.,.36,.08)*uHante*(1.6+.8*sin(uTime*2.2+vI.x*9.))*(.6+.4*fn3(o*2.+uTime*.8));', // le VISAGE du vieux chêne
  '  if(part>5.5&&part<6.5)col+=mix(vec3(.55,.95,.80),vec3(1.,.34,.66),step(.78,fract(vI.x*5.3)))*uHante*.9*step(.62,fn3(o*3.));',                                 // les champignons qui luisent
  '  {float pa9=smoothstep(180.,1500.,dist)*(1.-uHante)*uAir;col=mix(col,col*vec3(.84,.96,1.12)+vec3(0.,.012,.04),pa9*.55);col*=mix(vec3(1.,1.,1.),vec3(1.05,1.01,.93),(1.-smoothstep(0.,260.,dist))*(1.-uHante)*uAir);}', /* (2026-10-20, embellir) TROIS PLANS : le proche plus chaud, le lointain plus froid et plus clair */
  '  col=mix(col,uMistC,fBrume(vW,dist));gl_FragColor=vec4(col,1.);','#include <fog_fragment>','}'].join('\n');
/* LE SOL : humus, mousse, fougères, prairies fleuries, roche des pentes raides ; sous les arbres, des taches de soleil ; la nuit, des
   champignons qui luisent. aS = (distance à la route, prairie, densité de forêt, hasard). */
const FOR_SOL_VS=['attribute vec4 aS;varying vec3 vW,vN;varying vec4 vS;','#include <fog_pars_vertex>',
  'void main(){vec4 wp=modelMatrix*vec4(position,1.);vW=wp.xyz;vN=normal;vS=aS;vec4 mvPosition=viewMatrix*wp;gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n');
const FOR_SOL_FS=[FG_BRUIT,FG_LUM,'varying vec3 vW,vN;varying vec4 vS;','#include <fog_pars_fragment>',
  'void main(){vec3 N=normalize(vN);vec3 V=uCam-vW;float dist=length(V);V/=max(dist,.001);float f=vS.z,pr=vS.y;vec2 q=vW.xz;',
  '  float n1=fn2(q*.031),n2=fn2(q*.12),n3=fn2(q*.55);',
  '  vec3 humus=mix(vec3(.09,.07,.045),vec3(.16,.115,.065),n2),mousse='+('mix(vec3(.06,.14,.065),vec3(.12,.23,.10),n1)')+',herbe='+('mix(vec3(.09,.21,.09),vec3(.18,.30,.13),n2)*(.84+.32*n1)')+';',
  '  vec3 alb=mix(mousse,humus,f*.6*(.55+.45*n3));alb=mix(alb,vec3(.11,.22,.05),smoothstep(.55,.75,n2)*(1.-pr)*.55);alb=mix(alb,herbe,pr);', // fougères, prairies
  '  float sl=1.-N.y;alb=mix(alb,vec3(.33,.32,.29)*(.8+.3*n3),smoothstep(.38,.62,sl+n1*.16));',                     // la roche des pentes
  '  vec2 c9=floor(q*1.3),g9=fract(q*1.3)-.5;float h9=fh2(c9),k9=step(1.-pr*.6,h9)*(1.-smoothstep(70.,190.,dist));',  // les FLEURS des prairies, de près…
  '  vec3 fc=h9<.3?vec3(.78,.24,.66):h9<.55?vec3(.98,.84,.12):h9<.8?vec3(.97,.97,.94):vec3(.50,.58,1.);alb=mix(alb,fc,k9*smoothstep(.34,.12,length(g9)));',
  '  alb=mix(alb,alb*vec3(1.10,.96,1.08)+vec3(.05,.03,.04),pr*smoothstep(90.,240.,dist)*.6);',                      // …et une teinte, au loin
  '  float ao=1.-f*.42,dif=clamp((dot(N,uSunDir)+.2)/1.2,0.,1.),ta=smoothstep(.42,.72,fn2(q*.085+vec2(uTime*.02,0.))),omb=mix(1.,.22+.78*ta,f*.85);', // l'ombre de la canopée, percée de taches de soleil
  '  vec3 col=alb*(uSky*(.45+.40*N.y)*ao+uGnd*.18+uSunC*dif*omb*.95);col+=alb*fPhare(vW,N);col+=alb*uFlash*vec3(.8,.85,1.)*1.4;',
  '  float gh=fh2(floor(q*.8));col+=mix(vec3(.2,1.,.72),vec3(1.,.28,.62),step(.75,fract(gh*37.)))*step(.982,gh)*f*uHante*.9*(.6+.4*sin(uTime*1.3+gh*30.));',      // la nuit : des champignons qui luisent
  '  col=mix(col,uMistC,fBrume(vW,dist)*1.1);gl_FragColor=vec4(col,1.);','#include <fog_fragment>','}'].join('\n');
/* LE TORRENT : un ruban d'eau au fond de la vallée — le ciel s'y reflète, le soleil y scintille, l'écume sur les bords */
const FOR_EAU_VS=['attribute vec2 aU;varying vec3 vW;varying vec2 vU;','#include <fog_pars_vertex>',
  'void main(){vec4 wp=modelMatrix*vec4(position,1.);vW=wp.xyz;vU=aU;vec4 mvPosition=viewMatrix*wp;gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n');
const FOR_EAU_FS=[FG_BRUIT,FG_LUM,'varying vec3 vW;varying vec2 vU;','#include <fog_pars_fragment>',
  'void main(){vec3 V=uCam-vW;float dist=length(V);V/=max(dist,.001);float t=uTime;',
  '  vec2 r=vec2(fn2(vec2(vU.y*.22-t*1.6,vU.x*3.)),fn2(vec2(vU.y*.45-t*2.3,vU.x*5.+3.)))-.5;vec3 N=normalize(vec3(r.x*.5,1.,r.y*.5));',
  '  vec3 R=reflect(-V,N);float fr=.12+.88*pow(1.-max(dot(N,V),0.),4.);',
  '  vec3 ciel=mix(uGnd*.5,uSky*1.05,clamp(R.y*1.5+.3,0.,1.)),fond=vec3(.03,.09,.08)+uSky*.05;',
  '  vec3 col=mix(fond,ciel,fr)+uSunC*pow(max(dot(R,uSunDir),0.),180.)*3.;',
  '  float ec=smoothstep(.62,1.,abs(vU.x))+smoothstep(.72,.9,fn2(vec2(vU.y*.6-t*2.,vU.x*4.)))*.35;col=mix(col,(uSky+uSunC)*.55,ec*.6);', // l'écume
  '  col+=fPhare(vW,N)*.4;col+=uFlash*vec3(.8,.85,1.)*.8;col=mix(col,uMistC,fBrume(vW,dist));',
  '  gl_FragColor=vec4(col,smoothstep(1.,.78,abs(vU.x)));','#include <fog_fragment>','}'].join('\n');
/* LES FLEURS, LES FOUGÈRES, LE LIERRE : deux quads croisés, une case de la planche ; le vent les berce, la caisse les ÉCARTE en passant ;
   la nuit, leurs pétales luisent (des fleurs de conte). aF = (case, largeur, hauteur, hasard). */
const FOR_FLEUR_VS=['attribute vec4 aF;uniform float uTime,uVent;uniform vec3 uCarP;varying vec2 vUv;varying vec3 vW;varying float vY,vK;','#include <fog_pars_vertex>',
  'void main(){vec3 p=position;float y=uv.y;p.x*=aF.y;p.z*=aF.y;p.y*=aF.z;',
  '  mat4 M=modelMatrix*instanceMatrix;vec4 wp=M*vec4(p,1.);vec3 b=(M*vec4(0.,0.,0.,1.)).xyz;',
  '  float k=abs(position.y);float sw=sin(uTime*2.2+aF.w*40.+b.x*.05)*.10*uVent*k*k*aF.z;wp.x+=sw;wp.z+=sw*.6;',
  '  vec3 d=b-uCarP;float l=length(d);wp.xyz+=normalize(d+vec3(.001,.3,.001))*(1.-smoothstep(2.5,9.,l))*k*k*aF.z*.9;', // la caisse passe : les fleurs s'écartent
  '  vW=wp.xyz;vUv=vec2((floor(aF.x+.5)+uv.x)/8.,uv.y);vY=k;vK=aF.x;',
  '  vec4 mvPosition=viewMatrix*wp;gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n');
const FOR_FLEUR_FS=[FG_BRUIT,FG_LUM,'uniform sampler2D uTex;varying vec2 vUv;varying vec3 vW;varying float vY,vK;','#include <fog_pars_fragment>',
  'void main(){vec4 t=texture2D(uTex,vUv);if(t.a<.5)discard;vec3 V=uCam-vW;float dist=length(V);V/=max(dist,.001);',
  '  vec3 alb=t.rgb,N=vec3(0.,1.,0.);float pe=clamp((max(t.r,t.b)-t.g)*3.,0.,1.);',                      // pe : un pétale (ce qui n'est pas vert)
  '  float dif=clamp((dot(N,uSunDir)+.6)/1.6,0.,1.),tr=pow(max(dot(-V,uSunDir),0.),4.);',
  '  vec3 col=alb*(uSky*.62*(.55+.45*vY)+uGnd*.22+uSunC*dif*.9)+alb*uSunC*tr*.7;col+=alb*fPhare(vW,N)*1.2;col+=alb*uFlash*1.2;',
  '  col+=(alb*1.4+vec3(.10,.25,.35))*pe*uHante*.85;',                                                    // la nuit, les fleurs luisent
  '  col=mix(col,uMistC,fBrume(vW,dist));gl_FragColor=vec4(col,1.);','#include <fog_fragment>','}'].join('\n');
/* LES PAPILLONS (et, la nuit, les CHAUVES-SOURIS) : une boîte qui suit la caisse, chacun vole sur sa courbe ; deux ailes qui battent.
   Aucun calcul sur le processeur : la position naît dans le shader (le temps, son hasard, la boîte). aR = hasard · aP = (case, taille). */
const FOR_PAP_VS=['attribute vec4 aR;attribute vec2 aP;uniform float uTime,uPap,uBat;uniform vec3 uBoxC;varying vec2 vUv;varying float vBat;varying vec3 vW;','#include <fog_pars_vertex>',
  'void main(){vec3 B=vec3(150.,30.,200.);float bat=uBat*step(aR.w,.4),vis=max(uPap*(1.-step(.001,uBat)),bat);',
  '  float t=uTime*(.55+.45*aR.w)+aR.x*50.;',
  '  vec3 pa=vec3(sin(t*.31)*16.+sin(t*.9+aR.y*6.)*3.,sin(t*1.7+aR.z*9.)*1.5+sin(t*.43)*4.,cos(t*.27)*16.+t*(bat>0.?9.:1.6));',
  '  vec3 rel=mod(aR.xyz*B+pa-uBoxC+B*.5,B)-B*.5,pos=uBoxC+rel;',
  '  float e=min(min(.5-abs(rel.x)/B.x,.5-abs(rel.y)/B.y),.5-abs(rel.z)/B.z),fade=smoothstep(0.,.07,e)*vis;',
  '  vec3 ve=vec3(cos(t*.31)*.31*16.,0.,-sin(t*.27)*.27*16.+(bat>0.?9.:1.6));float hd=atan(ve.x,ve.z);',
  '  float fl=sin(uTime*(bat>0.?13.:18.)*(.8+.4*aR.w)+aR.x*30.),an=bat>0.?fl*.7:fl*1.15+.25;',
  '  float sd=sign(position.x),sx=abs(position.x),sz=aP.y*(bat>0.?1.9:1.)*fade;',
  '  vec3 w=vec3(sd*sx*cos(an),sx*sin(an),position.z)*sz;float c=cos(hd),s=sin(hd);w=vec3(w.x*c+w.z*s,w.y,-w.x*s+w.z*c);',
  '  vec4 wp=vec4(pos+w,1.);vW=wp.xyz;float k=bat>0.?4.:floor(aP.x+.5);vUv=vec2((k+sx)/5.,uv.y);vBat=bat;',
  '  vec4 mvPosition=viewMatrix*wp;gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n');
const FOR_PAP_FS=['uniform sampler2D uTex;uniform vec3 uSunC,uSky;varying vec2 vUv;varying float vBat;varying vec3 vW;','#include <fog_pars_fragment>',
  'void main(){vec4 t=texture2D(uTex,vUv);if(t.a<.5)discard;vec3 col=vBat>0.?t.rgb*.6:t.rgb*(uSky*.75+uSunC*.75)+t.rgb*.12;gl_FragColor=vec4(col,1.);','#include <fog_fragment>','}'].join('\n');
/* LES LUCIOLES (la nuit, vert-jaune, elles clignotent au fond de la vallée) et le POLLEN (le jour, une poussière d'or dans la lumière) */
const FOR_LUC_VS=['attribute vec4 aR;uniform float uTime,uLuc,uPol,uPx;uniform vec3 uBoxL,uBoxB;uniform vec3 uSunC;varying vec3 vC;varying float vA;',
  'void main(){vec3 B=uBoxB;float luc=step(aR.w,.55);',
  '  vec3 pa=vec3(sin(uTime*.23+aR.y*6.)*7.,sin(uTime*.5+aR.x*9.)*3.+uTime*(luc>0.?.6:.25),cos(uTime*.19+aR.z*6.)*7.);',
  '  vec3 rel=mod(aR.xyz*B+pa-uBoxL+B*.5,B)-B*.5,pos=uBoxL+rel;float e=min(min(.5-abs(rel.x)/B.x,.5-abs(rel.y)/B.y),.5-abs(rel.z)/B.z);',
  '  float bl=pow(max(sin(uTime*(1.1+aR.w*2.4)+aR.x*40.),0.),5.);',
  '  vA=smoothstep(0.,.08,e)*(luc>0.?uLuc*bl:uPol*(.55+.45*sin(uTime*2.+aR.y*30.)));',
  '  float hc=fract(aR.x*91.7+aR.z*13.1);vec3 am=hc<.78?vec3(1.,.74,.40):hc<.92?vec3(1.,.86,.40):vec3(.96,.30,.64);', /* (2026-10-20, embellir) les lucioles : AMBRE (#FFC477), un peu d'OR, et de rares ROSES néon */
  '  vC=luc>0.?am*2.3:uSunC*vec3(1.,.9,.6)*1.1;',
  '  vec4 mv=viewMatrix*vec4(pos,1.);gl_Position=projectionMatrix*mv;gl_PointSize=min((luc>0.?1.6:.7)*uPx*320./max(1.,-mv.z),1e4);}'].join('\n');
const FOR_LUC_FS=['varying vec3 vC;varying float vA;void main(){float d=length(gl_PointCoord-.5);float a=smoothstep(.5,0.,d);a*=a;if(vA*a<.004)discard;gl_FragColor=vec4(vC*vA*a,1.);}'].join('\n');
/* LES RAYONS DE SOLEIL : des pans de lumière qui tombent en biais entre les géants (additifs). Leur axe suit la lumière de la forêt ;
   ils s'éteignent à moins de 40 m de l'objectif (sinon un voile plein écran quand la caméra passe dedans). aR = (sommet, largeur) · aL = (longueur, hasard) */
const FOR_RAY_VS=['attribute vec4 aR;attribute vec2 aL;uniform vec3 uSunDir,uCam;uniform float uTime;varying vec2 vQ;varying float vA,vD;',
  'void main(){vec3 ax=-normalize(uSunDir+vec3(0.,.08,0.));vec3 P=aR.xyz+ax*aL.x*position.y;vec3 vw=normalize(P-uCam);vec3 sd=normalize(cross(ax,vw)+vec3(1e-4,0.,0.));',
  '  P+=sd*position.x*aR.w*(1.+position.y*.7);vQ=vec2(position.x*2.,position.y);vA=.55+.45*sin(uTime*.35+aL.y*20.);',
  '  vec4 mv=viewMatrix*vec4(P,1.);vD=-mv.z;gl_Position=projectionMatrix*mv;}'].join('\n');
const FOR_RAY_FS=['uniform vec3 uSunC;uniform float uRay,uRayK,fogNear,fogFar;varying vec2 vQ;varying float vA,vD;',
  'void main(){float x=1.-vQ.x*vQ.x;float a=x*x*smoothstep(0.,.18,vQ.y)*smoothstep(1.,.45,vQ.y)*vA*uRay*uRayK*smoothstep(40.,110.,vD)*(1.-smoothstep(fogNear,fogFar,vD));',
  '  vec3 rc=mix(vec3(.50,.72,1.),vec3(1.,.80,.46),smoothstep(.15,.85,x));gl_FragColor=vec4(uSunC*rc*a*.16,1.);}'].join('\n'); /* (2026-10-20, embellir) DEUX TEMPÉRATURES : le cœur du rai est ambre, sa lisière bleutée (le remplissage froid du ciel) */
/* LA BRUME EN NAPPES : de grands flocons face à la caméra, qui dérivent au fond de la vallée et traversent la route la nuit */
const FOR_BRUME_VS=['uniform vec3 uCam,uSunDir;uniform float uTime;varying vec2 vUv;varying float vD,vS,vG;',
  'void main(){vec3 c=(modelMatrix*instanceMatrix*vec4(0.,0.,0.,1.)).xyz;float s=length(instanceMatrix[0].xyz);vS=fract(c.x*.013+c.z*.007);',
  '  c.x+=sin(uTime*.05+vS*20.)*25.;c.z+=cos(uTime*.04+vS*13.)*25.;',
  '  vec3 R=vec3(viewMatrix[0][0],viewMatrix[1][0],viewMatrix[2][0]),U=vec3(viewMatrix[0][1],viewMatrix[1][1],viewMatrix[2][1]);',
  '  vG=dot(normalize(c-uCam),uSunDir);', /* (2026-10-20, embellir) vG : la nappe est-elle devant le soleil (ou la lune) ? */
  '  vec3 P=c+(R*position.x+U*position.y*.45)*s;vUv=uv;vec4 mv=viewMatrix*vec4(P,1.);vD=-mv.z;gl_Position=projectionMatrix*mv;}'].join('\n');
const FOR_BRUME_FS=[FG_BRUIT,'uniform vec3 uMistC,uSky,uSunC;uniform float uMistK,uHante,uTime,fogNear,fogFar;varying vec2 vUv;varying float vD,vS,vG;',
  'void main(){vec2 q=vUv-.5;float a=smoothstep(.5,.08,length(q*vec2(1.,1.6)))*(.35+.65*fn2(vUv*3.2+vS*17.+vec2(uTime*.03,0.)))*.24*uMistK*smoothstep(25.,90.,vD)*(1.-smoothstep(fogFar*.7,fogFar,vD))*1.6;if(a<.003)discard;',
  '  vec3 c=uMistC*.75+(uSky*.18+uSunC*.12)+vec3(.05,.20,.16)*uHante;',
  '  float so=smoothstep(-.1,.9,vG);c+=mix(uSunC*vec3(1.,.70,.38)*.20,vec3(.20,.16,.42),uHante)*so*so;c+=vec3(.03,.06,.16)*(1.-so)*(1.-uHante*.5);', /* (embellir) la brume au contre-jour s'allume (ambre, la nuit violet-lune), à l'opposé elle se refroidit */
  '  gl_FragColor=vec4(c,a);}'].join('\n');
/* LES LUEURS DE LA NUIT : les FEUX FOLLETS (type 0 : un coeur bleu-vert, un halo, ils vacillent) et les YEUX (type 1 : deux amandes
   rouges ou ambrées qui clignent, et se ferment quand la caisse approche). aL = (type, couleur, taille, hasard). */
const FOR_LUEUR_VS=['attribute vec4 aL;uniform vec3 uCarP,uCam;uniform float uTime,uHante,uLant;varying vec2 vQ;varying vec4 vL;varying float vO;',
  'void main(){vec3 c=(modelMatrix*instanceMatrix*vec4(0.,0.,0.,1.)).xyz;',
  '  vec3 R=vec3(viewMatrix[0][0],viewMatrix[1][0],viewMatrix[2][0]),U=vec3(viewMatrix[0][1],viewMatrix[1][1],viewMatrix[2][1]);',
  '  float op=uHante;if(aL.x>1.5){float dc=distance(c,uCam);op=uLant*(.88+.12*sin(uTime*3.1+aL.w*40.))*smoothstep(32.,95.,dc)*(1.-smoothstep(480.,820.,dc));}', /* (2026-10-20, embellir) type 2 : les LANTERNES de conte — fixes, ambre, elles ne brillent que le soir, la nuit et sous la pluie */
  '  else if(aL.x>.5){float bl=step(.06,fract(uTime*(.11+aL.w*.07)+aL.w*7.));op*=bl*smoothstep(40.,85.,distance(c,uCarP))*(1.-smoothstep(380.,520.,distance(c,uCarP)));}', // les yeux CLIGNENT, se ferment quand on approche
  '  else op*=(.75+.25*sin(uTime*9.+aL.w*40.))*(.8+.2*sin(uTime*2.3+aL.w*9.));vO=op;',
  '  vec3 P=c+(R*position.x*(aL.x>1.5?1.:aL.x>.5?1.6:1.)+U*position.y)*aL.z;vQ=position.xy*2.;vL=aL;vec4 mv=viewMatrix*vec4(P,1.);gl_Position=projectionMatrix*mv;}'].join('\n');
const FOR_LUEUR_FS=['varying vec2 vQ;varying vec4 vL;varying float vO;',
  'void main(){if(vO<.003)discard;vec3 col;float a;',
  '  if(vL.x>1.5){float r=length(vQ),co=exp(-r*r*30.),ha=exp(-r*r*3.6)*.62*(1.-smoothstep(.55,1.,r));vec3 hu=vL.y<.5?vec3(1.,.60,.24):vL.y<1.5?vec3(1.,.80,.40):vec3(.96,.30,.62);', /* ambre · or · rose néon (rare) */
  '    col=hu*1.25+vec3(.9,.8,.62)*co*1.3;a=ha+co;}',
  '  else if(vL.x>.5){float e=abs(vQ.y)/max(.001,1.-vQ.x*vQ.x*.95);a=smoothstep(.55,.25,e)*(1.-smoothstep(.8,1.,abs(vQ.x)));float p=smoothstep(.2,0.,length(vQ*vec2(1.,1.6)));',
  '    col=(vL.y<.5?vec3(1.,.12,.05):vL.y<1.5?vec3(1.,.62,.08):vec3(.6,1.,.2))*(1.6+2.*p);}',
  '  else{float r=length(vQ);a=exp(-r*r*9.)+.42*exp(-r*r*2.2);col=mix(vec3(.55,.95,.82),vec3(.62,.80,1.),vL.y)*1.35;}',
  '  gl_FragColor=vec4(col*a*vO,1.);}'].join('\n');
function foretMats(){if(FORET.mats)return FORET.mats;const U=FOR_U,F=THREE.UniformsLib.fog;
  const sm=(vs,fs,o)=>{const m=new THREE.ShaderMaterial(Object.assign({uniforms:Object.assign(THREE.UniformsUtils.clone(F),U,o&&o.u||{}),vertexShader:vs,fragmentShader:fs,fog:true},o&&o.m||{}));m.dispose=function(){};return m;}; // jamais libérées : un seul jeu pour toutes les forêts
  const M={};
  /* ===== LES ARBRES EN WEBGL 1 (24/10, relecture : « les shaders qui lisent fwidth sans l'extension des dérivées ») ===== FOR_ARB_FS lit fwidth (les
     mini-cubes, le vitrail) : en WebGL 1 il faut GL_OES_standard_derivatives, sinon le programme ne compile pas — plus un arbre, ni géant, ni
     chaumière, ni rocher, ni abeille. three ne pose la directive qu'en WebGL 1 (en WebGL 2 le programme est le même) ; comme M.pic du glacier. */
  M.arb=sm(FOR_ARB_VS,FOR_ARB_FS,{u:{uFen:{value:0},uMini:{value:1},uCon:{value:1},uVit:{value:1},uVitL:{value:.95},uVitS:{value:.85},uVitG:{value:new THREE.Color(1,.86,.45)}},m:{extensions:{derivatives:true}}});
  M.sol=sm(FOR_SOL_VS,FOR_SOL_FS);
  M.eau=sm(FOR_EAU_VS,FOR_EAU_FS,{m:{transparent:true,depthWrite:false}});
  M.fleur=sm(FOR_FLEUR_VS,FOR_FLEUR_FS,{u:{uTex:{value:forFleursTex()}},m:{side:THREE.DoubleSide}});
  M.pap=sm(FOR_PAP_VS,FOR_PAP_FS,{u:{uTex:{value:forAilesTex()},uBat:{value:0}},m:{side:THREE.DoubleSide}});
  M.luc=sm(FOR_LUC_VS,FOR_LUC_FS,{u:{uBoxL:{value:new THREE.Vector3()},uBoxB:{value:new THREE.Vector3(320,110,340)}},m:{transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false}});
  M.ray=sm(FOR_RAY_VS,FOR_RAY_FS,{m:{transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide}});
  M.brume=sm(FOR_BRUME_VS,FOR_BRUME_FS,{m:{transparent:true,depthWrite:false}}); // (la brume est calculée : pas de toile)
  M.lueur=sm(FOR_LUEUR_VS,FOR_LUEUR_FS,{m:{transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false}});
  M.lune=new THREE.SpriteMaterial({map:forLuneTex(),transparent:true,depthWrite:false,fog:false,opacity:0});M.lune.dispose=function(){};
  M.loup=new THREE.SpriteMaterial({map:forLoupTex(),transparent:true,depthWrite:false,fog:true,opacity:0,alphaTest:.02});M.loup.dispose=function(){};
  M.halo=new THREE.SpriteMaterial({map:lampTex,color:0xcfe6ff,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false,opacity:0});M.halo.dispose=function(){};
  return FORET.mats=M;}
/* ---------------- LE RELIEF : LE FOND DE LA FORÊT, SOUS LA ROUTE LA PLUS BASSE ----------------
   (2026-10-15, LA PELOTE) La route repasse sur elle-même à plusieurs hauteurs : le sol ne suit plus « la route la plus proche » (la hauteur
   moyenne des routes voisines aurait mis le fond AU-DESSUS de la route du dessous). Il suit l'ENVELOPPE BASSE des routes : en chaque case,
   le minimum, sur les points de route à moins de 520 m, de (hauteur de la route + la remontée `mont(d)` : 24 % jusqu'à 650 m, 5 % au-delà) —
   un cône renversé sous chaque tronçon ; le fond est 120-145 m sous cette enveloppe. Sous la route la plus basse : ~130 m de vide jusqu'au
   sol, les cimes juste sous la dalle ; sous une route haute, le gouffre. En s'éloignant de la pelote, la forêt remonte en collines tout
   autour (on roule au fond d'une cuvette boisée, la forêt ferme l'horizon). Au-delà de 520 m, une grille grossière (×4) prend le relais.
   Deux grilles de plus servent aux arbres : `yn`, la route la plus BASSE à moins de 150 m (le plafond des arbres du bord) et `yb`, la plus
   basse à moins de 280 m (l'AIR LIBRE entre les étages de la pelote : aucun arbre ordinaire n'y monte — seuls les géants traversent les
   étages, et c'est entre leurs troncs qu'on saute d'une route à l'autre). Zéro rnd() consommé. */
function forBruit(x,z,s){const a=Math.sin(x*.0123+s)*Math.sin(z*.0107-s*.7),b=Math.sin(x*.031+z*.027+s*2.1)*.5,c=Math.sin(x*.0047-z*.0051+s*.3);return (a+b+c)/2.5;}
function* foretSol(){ // (LE PRÉ-BÂTI) un générateur : rendez-vous à l'échéance JF.lim (au passage, d'un trait)
  const C=PAL_B9('foretSolC',24),MARG=PAL_B9('foretMarge',2800),R1=520,mont=d=>d<650?.24*d:156+.05*(d-650);
  let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(let i=0;i<NP;i+=6){const p=pts[i];if(p.x<x0)x0=p.x;if(p.x>x1)x1=p.x;if(p.z<z0)z0=p.z;if(p.z>z1)z1=p.z;}
  x0-=MARG;x1+=MARG;z0-=MARG;z1+=MARG;
  const nx=Math.ceil((x1-x0)/C)+1,nz=Math.ceil((z1-z0)/C)+1,N=nx*nz,D=new Float32Array(N).fill(1e12),HM=new Float32Array(N).fill(1e9),YN=new Float32Array(N).fill(1e5),YB=new Float32Array(N).fill(1e5);
  const RS=[],pas=Math.max(1,Math.round(12/(L/(NP-1))));for(let i=0;i<NP;i+=pas)RS.push(i);
  // la grille grossière : distance à la route et enveloppe basse, sur un point de route sur trois — floutée
  const CG=C*4,gx=Math.ceil((x1-x0)/CG)+1,gz=Math.ceil((z1-z0)/CG)+1,GD=new Float32Array(gx*gz),GH=new Float32Array(gx*gz);
  for(let j=0;j<gz;j++)for(let i=0;i<gx;i++){if(!i&&performance.now()>JF.lim)yield;const x=x0+i*CG,z=z0+j*CG;let bd=1e18,bh=1e9;for(let k=0;k<RS.length;k+=3){const p=pts[RS[k]],d2=(p.x-x)*(p.x-x)+(p.z-z)*(p.z-z);if(d2<bd)bd=d2;const h=p.y+mont(Math.sqrt(d2));if(h<bh)bh=h;}
    const o=i+j*gx;GD[o]=Math.sqrt(bd);GH[o]=bh;}
  for(let it=0;it<3;it++){const T9=GH.slice();for(let j=1;j<gz-1;j++)for(let i=1;i<gx-1;i++){let s9=0;for(let b=-1;b<=1;b++)for(let a=-1;a<=1;a++)s9+=T9[i+a+(j+b)*gx];GH[i+j*gx]=Math.min(T9[i+j*gx],s9/9);}} // (le flou ne remonte jamais l'enveloppe)
  const gBil=(A,x,z)=>{const fx=Math.max(0,Math.min(gx-1.001,(x-x0)/CG)),fz=Math.max(0,Math.min(gz-1.001,(z-z0)/CG)),i=fx|0,j=fz|0,u=fx-i,v=fz-j,k=i+j*gx;
    return (A[k]*(1-u)+A[k+1]*u)*(1-v)+(A[k+gx]*(1-u)+A[k+gx+1]*u)*v;};
  // le tampon fin, autour de chaque point de route (≤ 520 m) : la distance exacte, l'enveloppe basse, les deux plafonds des arbres
  const rC=Math.ceil(R1/C),R2=R1*R1,N2=150*150,B2=280*280;
  for(const ri of RS){if(performance.now()>JF.lim)yield;const p=pts[ri],ci=Math.round((p.x-x0)/C),cj=Math.round((p.z-z0)/C);
    for(let b=-rC;b<=rC;b++){const j=cj+b;if(j<0||j>=nz)continue;const z=z0+j*C,dz=z-p.z;
      for(let a=-rC;a<=rC;a++){const i=ci+a;if(i<0||i>=nx)continue;const x=x0+i*C,dx=x-p.x,d2=dx*dx+dz*dz;if(d2>R2)continue;const k=i+j*nx;
        if(d2<D[k])D[k]=d2;const h=p.y+.24*Math.sqrt(d2);if(h<HM[k])HM[k]=h;if(d2<B2&&p.y<YB[k]){YB[k]=p.y;if(d2<N2&&p.y<YN[k])YN[k]=p.y;}}}}
  const H=new Float32Array(N),PR=new Float32Array(N),FD=new Float32Array(N),sd9=FORET.graine*.001;
  /* (2026-10-14, session PERF) LE BRUIT EN DEUX MOITIÉS. Le terme a = sin(x·.0123+s)·sin(z·.0107−.7s) de forBruit ne dépend que de la
     colonne OU de la rangée : ses sinus sont lus dans des tables (une par échelle), calculés avec EXACTEMENT les mêmes opérandes que
     forBruit (x9 = x·e, puis x9·.0123+s) — mêmes flottants au bit ; b et c (mêlés x et z) restent calculés. ~2 sinus sur 4 de moins par appel. */
  const BE=[[1,sd9],[.43,sd9+3],[.31,sd9+7],[3.1,sd9+1],[1.7,sd9+5],[2.3,sd9+9]],BX=BE.map(()=>new Float64Array(nx)),BZ=BE.map(()=>new Float64Array(nz));
  for(let e=0;e<BE.length;e++){const m=BE[e][0],s=BE[e][1];for(let i=0;i<nx;i++){const x=x0+i*C,x9=m===1?x:x*m;BX[e][i]=Math.sin(x9*.0123+s);}
    for(let j=0;j<nz;j++){const z=z0+j*C,z9=m===1?z:z*m;BZ[e][j]=Math.sin(z9*.0107-s*.7);}}
  const fB=(e,i,j,x,z)=>{const s=BE[e][1],a=BX[e][i]*BZ[e][j],b=Math.sin(x*.031+z*.027+s*2.1)*.5,c=Math.sin(x*.0047-z*.0051+s*.3);return (a+b+c)/2.5;}; // = forBruit(x,z,s), x et z déjà mis à l'échelle
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){if(!i&&performance.now()>JF.lim)yield;const k=i+j*nx,x=x0+i*C,z=z0+j*C;let d,hb;
    if(D[k]<1e11){d=Math.sqrt(D[k]);hb=HM[k];if(d>R1-160){const w=THREE.MathUtils.smoothstep(d,R1-160,R1);hb=Math.min(hb,hb*(1-w)+gBil(GH,x,z)*w);}}
    else{d=Math.max(R1,gBil(GD,x,z));hb=gBil(GH,x,z);}
    D[k]=d;
    const n1=fB(0,i,j,x,z),D0=132+13*n1; // la PROFONDEUR sous l'enveloppe : 120-145 m
    if(d>MARG+150){H[k]=hb-D0+52*fB(2,i,j,x*.31,z*.31);PR[k]=0;FD[k]=.62;continue;} // hors du maillage : les collines seules (rien d'autre ne lit si loin)
    H[k]=hb-D0+40*fB(2,i,j,x*.31,z*.31)*THREE.MathUtils.smoothstep(d,380,900)+4.5*fB(3,i,j,x*3.1,z*3.1);
    const pr=d<220?THREE.MathUtils.smoothstep(fB(4,i,j,x*1.7,z*1.7),.05,.42)*(1-THREE.MathUtils.smoothstep(d,160,220)):0;PR[k]=pr;
    FD[k]=Math.max(0,Math.min(1,(d<ROAD_HALF+60?.25:d<280?.45:d<700?.86:.62)+.18*fB(5,i,j,x*2.3,z*2.3)-pr*.9));}
  return FORET.sol={x0:x0,z0:z0,C:C,nx:nx,nz:nz,h:H,d:D,yn:YN,yb:YB,pr:PR,f:FD,can:new Float32Array(N).fill(-1e9),MARG:MARG};
}
function solBil(A,x,z){const S=FORET.sol;if(!S)return 0;const fx=Math.max(0,Math.min(S.nx-1.001,(x-S.x0)/S.C)),fz=Math.max(0,Math.min(S.nz-1.001,(z-S.z0)/S.C)),i=fx|0,j=fz|0,u=fx-i,v=fz-j,k=i+j*S.nx,n=S.nx;
  return (A[k]*(1-u)+A[k+1]*u)*(1-v)+(A[k+n]*(1-u)+A[k+n+1]*u)*v;}
function solH(x,z){return solBil(FORET.sol.h,x,z);}
/* LA CANOPÉE QUI TUE : chaque arbre « tamponne » sa cime (−2 m, 75 % de son rayon) dans la grille du relief ; en vol, passer sous la
   cime de la case = dans les arbres. Les prairies et le fond du torrent restent ouverts : on peut y plonger (jusqu'au sol). */
function canTampon(x,z,r,top){const S=FORET.sol,C=S.C,ci=Math.round((x-S.x0)/C),cj=Math.round((z-S.z0)/C),rc=Math.max(0,Math.round(r*.75/C));
  for(let b=-rc;b<=rc;b++)for(let a=-rc;a<=rc;a++){const i=ci+a,j=cj+b;if(i<0||j<0||i>=S.nx||j>=S.nz)continue;const k=i+j*S.nx;if(top>S.can[k])S.can[k]=top;}}
function canH(x,z){const S=FORET.sol,i=Math.round((x-S.x0)/S.C),j=Math.round((z-S.z0)/S.C);if(i<0||j<0||i>=S.nx||j>=S.nz)return -1e9;return S.can[i+j*S.nx];}
function foretSolMesh(root){
  const S=FORET.sol,M=FORET.mats,CH=PAL_B9('foretSolCh',44),out=[];let tri=0; // des morceaux de ~1,1 km : peu d'appels de dessin, le tri par champ de three les jette encore
  for(let cj=0;cj<S.nz-1;cj+=CH)for(let ci=0;ci<S.nx-1;ci+=CH){
    const i1=Math.min(S.nx-1,ci+CH),j1=Math.min(S.nz-1,cj+CH),w=i1-ci+1,hh=j1-cj+1;let ok=false;
    for(let j=cj;j<=j1&&!ok;j+=2)for(let i=ci;i<=i1;i+=2)if(S.d[i+j*S.nx]<S.MARG){ok=true;break;}
    if(!ok)continue;
    const P=new Float32Array(w*hh*3),Nm=new Float32Array(w*hh*3),A=new Float32Array(w*hh*4),I=new Uint32Array(6*(w-1)*(hh-1));let nI=0,mI=0;
    for(let j=0;j<hh;j++)for(let i=0;i<w;i++){const gi=ci+i,gj=cj+j,k=gi+gj*S.nx,q=i+j*w;
      P[q*3]=S.x0+gi*S.C;P[q*3+1]=S.h[k];P[q*3+2]=S.z0+gj*S.C;
      const hl=S.h[Math.max(0,gi-1)+gj*S.nx],hr=S.h[Math.min(S.nx-1,gi+1)+gj*S.nx],hd=S.h[gi+Math.max(0,gj-1)*S.nx],hu=S.h[gi+Math.min(S.nz-1,gj+1)*S.nx];
      let nx9=hl-hr,ny9=2*S.C,nz9=hd-hu;const l=Math.hypot(nx9,ny9,nz9);Nm[q*3]=nx9/l;Nm[q*3+1]=ny9/l;Nm[q*3+2]=nz9/l;
      A[q*4]=S.d[k];A[q*4+1]=S.pr[k];A[q*4+2]=S.f[k];A[q*4+3]=0;}
    for(let j=0;j<hh-1;j++)for(let i=0;i<w-1;i++){const k=(ci+i)+(cj+j)*S.nx;if(S.d[k]>S.MARG+120&&S.d[k+1+S.nx]>S.MARG+120)continue;const a=i+j*w;I[nI]=a;I[nI+1]=a+w;I[nI+2]=a+1;I[nI+3]=a+1;I[nI+4]=a+w;I[nI+5]=a+w+1;nI+=6;if(a+w+1>mI)mI=a+w+1;}
    if(!nI)continue;
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(P,3));g.setAttribute('normal',new THREE.BufferAttribute(Nm,3));g.setAttribute('aS',new THREE.BufferAttribute(A,4));
    g.setIndex(new THREE.BufferAttribute(mI>65535?I.slice(0,nI):new Uint16Array(I.subarray(0,nI)),1));g.computeBoundingSphere();const m=new THREE.Mesh(g,M.sol);m.name='forêt sol';m.matrixAutoUpdate=false;m.userData.jeter=true;root.add(m);out.push(m);tri+=nI/3;} // (PERF) l'index écrit en place, pas en push : même type que setIndex(tableau) aurait choisi
  FORET.n.sol=tri;FORET.solM=out;return out;} // (foretTick éteint les morceaux au-delà de la brume : le plan lointain de la caméra est à 9,8 km)
/* LE TORRENT : il serpente au fond, décalé de la route (on le voit, il n'est pas caché sous la dalle) */
/* ---------------- LES DÉCORS DU CONTE ---------------- */
function fbBoite(K,x0,y0,z0,x1,y1,z1,col,part,ytop){const f=(a,b,c,d,n)=>{const i=K.n;for(const v of [a,b,c,d])fbV(K,v[0],v[1],v[2],n[0],n[1],n[2],[part,.9,Math.random(),0],col,[5,0]);K.I.push(i,i+1,i+2,i,i+2,i+3);};
  f([x0,y1,z0],[x0,y1,z1],[x1,y1,z1],[x1,y1,z0],[0,1,0]);f([x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1],[0,0,1]);f([x1,y0,z0],[x0,y0,z0],[x0,y1,z0],[x1,y1,z0],[0,0,-1]);
  f([x1,y0,z1],[x1,y0,z0],[x1,y1,z0],[x1,y1,z1],[1,0,0]);f([x0,y0,z0],[x0,y0,z1],[x0,y1,z1],[x0,y1,z0],[-1,0,0]);}
/* LA CHAUMIÈRE DE LA FORÊT-NOIRE (la maison de la sorcière, si l'on veut) : soubassement de pierre, colombages, l'immense toit à quatre
   pans moussu qui descend presque au sol, des fenêtres à jardinières de géraniums — le jour une ferme de carte postale, la nuit les
   fenêtres orange (partie 4). Origine : le pied de la façade, la façade regarde +z. */
function foretChaumiereGeo(){const K=fbNew(),Y=20,pierre=[.42,.40,.36],enduit=[.86,.82,.72],bois=[.24,.15,.09],toit=[.22,.20,.17],mousse=[.20,.30,.10];
  fbBoite(K,-9,0,-7,9,2.2,7,pierre,7,Y);fbBoite(K,-8.6,2.2,-6.6,8.6,7.5,6.6,enduit,3,Y);
  for(const x of [-8.7,-4.3,0,4.3,8.7])fbBoite(K,x-.3,2.2,6.55,x+.3,7.5,6.85,bois,0,Y);           // les colombages de la façade
  fbBoite(K,-8.7,4.7,6.55,8.7,5.1,6.85,bois,0,Y);for(const x of [-6.5,-2.1,2.1,6.5]){fbBoite(K,x-1.1,3.4,6.6,x+1.1,5.6,6.9,[.08,.06,.05],4,Y);fbBoite(K,x-1.3,3.1,6.6,x+1.3,3.5,7.4,bois,0,Y);
    for(let k=0;k<5;k++)fbBoite(K,x-1.1+k*.5,3.5,6.95,x-.8+k*.5,3.85,7.3,k%2?[.85,.10,.08]:[.95,.25,.20],3,Y);} // les géraniums
  for(const sx of [-1,1])for(const z of [-3.5,0,3.5]){fbBoite(K,sx*8.6-.15,3.6,z-1,sx*8.6+.15,5.4,z+1,[.08,.06,.05],4,Y);}
  fbBoite(K,-1,2.2,6.62,1,6.2,7,[.20,.12,.07],0,Y); // la porte
  // LE TOIT : un tronc de pyramide à quatre pans, moussu, l'égout à 4 m du sol, le faîtage à 17 m
  const e=[[-11.5,4,-9.5],[11.5,4,-9.5],[11.5,4,9.5],[-11.5,4,9.5]],r=[[-5,17,-1],[5,17,-1],[5,17,1],[-5,17,1]];
  const pan=(a,b,c,d)=>{const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=d[0]-a[0],vy=d[1]-a[1],vz=d[2]-a[2];let nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;const l=Math.hypot(nx,ny,nz);nx/=l;ny/=l;nz/=l;
    const i=K.n;for(const v of [a,b,c,d]){const m9=v[1]<6?.6:.15;fbV(K,v[0],v[1],v[2],nx,ny,nz,[3,.85,Math.random(),0],[toit[0]*(1-m9)+mousse[0]*m9,toit[1]*(1-m9)+mousse[1]*m9,toit[2]*(1-m9)+mousse[2]*m9],[5,.8]);}K.I.push(i,i+1,i+2,i,i+2,i+3);};
  pan(e[3],e[2],r[2],r[3]);pan(e[1],e[0],r[0],r[1]);pan(e[2],e[1],r[1],r[2]);pan(e[0],e[3],r[3],r[0]);pan(r[3],r[2],r[1],r[0]);
  fbBoite(K,3.5,12,-3,5.5,20,-1,pierre,7,Y); // la cheminée
  return fbGeo(K);}
/* LE ROCHER DU LOUP : une aiguille de grès qui crève la canopée sur le flanc de la vallée (le jour un belvédère, la nuit le perchoir du
   loup-garou). Origine au pied, sommet vers 52 m. */
function foretRocherGeo(){const K=fbNew(),rg=mulberry32(0x0C1E),col=[.46,.38,.33];
  fbTube(K,[[0,-8,0],[1.5,14,.5],[-1,30,1.5],[1,44,-.5],[0,52,0]],[15,12,9.5,7,3],12,{col:col,ec:5,mousse:.45,ytop:52,rg:rg,rug:.16,part:7,cap:1,fixe:1,aoK:.4});
  for(let k=0;k<5;k++){const an=k*1.26+rg(),x=Math.cos(an),z=Math.sin(an);fbTouffe(K,[x*11,4+rg()*14,z*11],6+rg()*4,1,{rg:rg,cc:[0,10,0],cr:16,col:col,ytop:52,part:7,bos:.3,mix:.2,fixe:1});}
  fbTouffe(K,[0,50,0],5.5,1,{rg:rg,cc:[0,48,0],cr:6,col:col,ytop:52,part:7,bos:.25,sq:.5,mix:.2,fixe:1});
  return fbGeo(K);}
/* L'AMANITE (pour les ronds de sorcières, au fond de la vallée) : un pied blanc, un chapeau rouge, ses points luisent la nuit (partie 6) */
function foretChampiGeo(){const K=fbNew(),rg=mulberry32(0xA3A);
  fbTube(K,[[0,0,0],[0,1.4,0],[0,2.6,0]],[.42,.34,.30],8,{col:[.92,.89,.82],ec:5,ytop:4,rg:rg,part:3});
  fbTouffe(K,[0,2.7,0],1.5,1,{rg:rg,cc:[0,2.7,0],cr:1.5,col:[.78,.08,.04],ytop:4,part:6,sq:.48,bos:.05,mix:.5});
  return fbGeo(K);}
/* L'ARCHE : un géant tombé il y a mille ans, qui ENJAMBE la route — la souche et ses racines d'un côté, la couronne brisée de l'autre,
   moussue, des amanites qui luisent la nuit. Sous lui, au moins 24 m d'air au-dessus de la dalle. Les gélules de collision sont rendues. */
function foretArche(root,fr,M,k9){const Q=FORET.Q,qa=Q&&Q[k9||'arche'];if(!qa)return null; // (2026-10-19, LA FORÊT AU HASARD) k9 : 'arche' ou 'archeB' — une forêt peut en avoir deux
  let ia=0,bd=1e18;for(let i=0;i<NP;i+=2){const d=pts[i].distanceToSquared(qa.p);if(d<bd){bd=d;ia=i;}}
  const p=pts[ia],t=T[ia],hl=Math.hypot(t.x,t.z)||1,bx=-t.z/hl,bz=t.x/hl,sg=fr()<.5?-1:1,K=fbNew(),C=[];
  const A=[p.x-bx*sg*(ROAD_HALF+95)+t.x/hl*30,0,p.z-bz*sg*(ROAD_HALF+95)+t.z/hl*30],B9=[p.x+bx*sg*(ROAD_HALF+110)-t.x/hl*25,0,p.z+bz*sg*(ROAD_HALF+110)-t.z/hl*25];
  A[1]=solH(A[0],A[2])+6;B9[1]=solH(B9[0],B9[2])+4;const top=p.y+24+8.5;
  const cp=[],rad=[],n=26,ph=fr()*6.28;
  for(let k=0;k<=n;k++){const u=k/n,x=A[0]+(B9[0]-A[0])*u,z=A[2]+(B9[2]-A[2])*u,yl=A[1]+(B9[1]-A[1])*u,arc=Math.sin(u*Math.PI);
    cp.push([x+Math.sin(u*9+ph)*3,yl+(top-(A[1]+B9[1])/2)*Math.pow(arc,.62)+Math.sin(u*13+ph)*1.2,z+Math.cos(u*7+ph)*3]);rad.push((10.5-4.2*arc+(k===0?3:0))*(1+.14*Math.sin(k*1.9+ph)+.07*Math.sin(k*4.3+ph*2)));}
  // (2026-10-15, LA PELOTE) l'arche enjambe SA route — et aucune autre : si un autre étage de la pelote passe dans son tronc, pas d'arche
  {const ds9=L/(NP-1),j0=ia-Math.round(300/ds9),j1=ia+Math.round(300/ds9);
   for(let j=0;j<NP;j+=3){if(j>j0&&j<j1)continue;const q=pts[j];
     for(let k=0;k<n;k++){const a9=cp[k],b9=cp[k+1],r9=Math.max(rad[k],rad[k+1]);if(q.y<Math.min(a9[1],b9[1])-r9-10||q.y>Math.max(a9[1],b9[1])+r9+10)continue;
       const ex=b9[0]-a9[0],ez=b9[2]-a9[2],l2=ex*ex+ez*ez||1,u=Math.max(0,Math.min(1,((q.x-a9[0])*ex+(q.z-a9[2])*ez)/l2));
       if(Math.hypot(q.x-a9[0]-ex*u,q.z-a9[2]-ez*u)<r9+ROAD_HALF+5)return null;}}}
  const o=[cp[n>>1][0],0,cp[n>>1][2]];
  for(const q of cp){q[0]-=o[0];q[2]-=o[2];}
  fbTube(K,cp,rad,18,{col:[.27,.22,.17],ec:2,mousse:.75,ytop:1e4,rg:fr,rug:.13,fixe:1,aoK:.6});
  for(let k=0;k<9;k++){const j=2+((fr()*(n-4))|0),q=cp[j],r=rad[j],an=fr()*6.28;fbTouffe(K,[q[0]+Math.cos(an)*r*.8,q[1]+Math.sin(an)*r*.7,q[2]+Math.sin(an)*r*.5],r*(.28+fr()*.2),1,{rg:fr,cc:q,cr:r,col:[.25,.2,.15],ytop:1e4,part:0,bos:.3,mix:.3,fixe:1,mousse:.5});} // les NOEUDS
  for(let k=0;k<n;k++)C.push([cp[k][0]+o[0],cp[k][1],cp[k][2]+o[2],cp[k+1][0]+o[0],cp[k+1][1],cp[k+1][2]+o[2],rad[k+1]*1.02]);
  // la souche : un éventail de racines dressées
  for(let k=0;k<9;k++){const an=k/9*6.283,x=Math.cos(an),y9=Math.sin(an),d=[B9[0]-A[0],B9[2]-A[2]],dl=Math.hypot(d[0],d[1]),ux=-d[0]/dl,uz=-d[1]/dl,px=-uz,pz=ux;
    const c0=[cp[0][0],cp[0][1]+2,cp[0][2]],e=[c0[0]+ux*10+px*x*20,c0[1]+y9*20+6,c0[2]+uz*10+pz*x*20];fbTube(K,[c0,[(c0[0]+e[0])/2,(c0[1]+e[1])/2+3,(c0[2]+e[2])/2],e],[3.6,2.2,.6],7,{col:[.26,.21,.16],ec:2,mousse:.5,ytop:1e4,rg:fr,fixe:1,aoK:.6});}
  // la couronne brisée : quelques touffes encore vertes
  for(let k=0;k<6;k++){const q=cp[n],c=[q[0]+(fr()-.5)*24,q[1]+6+fr()*14,q[2]+(fr()-.5)*24];fbTouffe(K,c,8+fr()*5,1,{rg:fr,cc:q,cr:22,col:FC.chene,ytop:1e4,sq:.8,fixe:1});}
  // les amanites du dos de l'arbre
  for(let k=0;k<14;k++){const q=cp[2+((fr()*(n-4))|0)],r=rad[n>>1];fbTouffe(K,[q[0]+(fr()-.5)*r,q[1]+r*.85,q[2]+(fr()-.5)*r],.9+fr()*.8,1,{rg:fr,cc:[q[0],q[1]+r,q[2]],cr:2,col:[.78,.08,.04],ytop:1e4,part:6,sq:.5,bos:.05,mix:.4,fixe:1});}
  const m=new THREE.Mesh(fbGeo(K),M.arb);m.position.set(o[0],0,o[2]);m.updateMatrix();m.matrixAutoUpdate=false;m.userData.jeter=true;root.add(m);
  // le lierre qui pend sous l'arche (jamais plus bas que 12 m au-dessus de la dalle)
  const LI=[];
  FORET.zonesNu.push([o[0],o[2],60]);FORET.zonesNu.push([A[0],A[2],45]);FORET.zonesNu.push([B9[0],B9[2],45]);
  return {C:C,LI:LI,c:new THREE.Vector3(o[0],top,o[2])};}
