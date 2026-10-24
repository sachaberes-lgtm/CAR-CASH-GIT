/* LES FLAMMES EN CUBES (2026-10-04, Léo : « enlève la porte, remets des flammes pixelisées façon Minecraft, plus CUBE ; travaille les
   couleurs, la brillance, la transparence — des pixels cubes satisfaisants » · « des flammes dans TOUS LES SENS : là ça sort d'en bas, je
   veux que ça vienne d'en haut, des côtés — et d'en bas »). Le rideau peint (feuPixPas) reste DERRIÈRE, plus sombre, et brûle désormais
   depuis les QUATRE bords ; devant lui, des CUBES de feu (`GAR.feuC`, garFeuCubes) :
   · ils NAISSENT sur les quatre bords de l'ouverture — le seuil, le linteau, les deux montants — groupés en LANGUES qui glissent le long du
     bord (un sinus au carré : on n'en sème que là où il est haut), et partent VERS L'INTÉRIEUR ;
   · le feu MONTE : une poussée vers le haut sur tous — ceux du linteau plongent puis se RECOURBENT vers le haut, ceux des montants filent
     vers le centre en s'élevant ; un tourbillon latéral les fait onduler ;
   · des cubes de 34 cm (à 12 m, la caméra de l'atelier doit LIRE un cube, pas un point) posés sur une GRILLE de 17 cm : ils sautent de
     case en case, ils ne glissent pas ; quatre couches de profondeur, et un sur trois sort de la porte vers l'atelier ; jamais tournés ;
   · six BANDES de couleur par âge (`FEU_CUBES.pal` : cœur blanc chaud → jaune → orange → vermillon → rouge → braise), au-delà de 1 pour
     les premières (le halo du post les attrape), et la TAILLE qui fond par crans avec l'âge ;
   · au LÂCHER (`GAR.feu.k`) : deux fois plus de flammes, plus loin, plus vives.
   `FEU_CUBES.on=false` rend le rideau seul. `dbgFeu()` rend aussi le nombre de cubes. */
const FEU_CUBES={on:true,N:760,c:.34,pas:.17,
  pal:[[2.1,1.85,1.2],[1.95,1.32,.34],[1.65,.7,.12],[1.22,.34,.06],[.92,.2,.06],[.66,.13,.05]], // (brasier) les deux dernières éclaircies : sur l'orange du centre, une braise trop sombre se lisait comme une tache
  taille:[1,.95,.84,.7,.55,.38],seuils:[.8,.62,.44,.27,.12],
  X0:-4.62,X1:4.62,Y0:.04,Y1:4.6};
function feuCubeNait(C,t,k){
  const Q=FEU_CUBES,P=C.p,o=C.n*9,r=Math.random()*(1.25+.55+.45+.45);
  const e=r<1.25?0:r<1.8?1:r<2.25?2:3;                                        // 0 seuil · 1 linteau · 2 montant gauche · 3 montant droit
  let u=0;for(let n=0;n<4;n++){u=Math.random();const s9=Math.sin(u*(e<2?17:9)+t*(e&1?-1.7:2.1)+e*1.9),pr=.18+.82*(s9>0?s9*s9:0);if(Math.random()<pr)break;} // les LANGUES
  const W=Q.X1-Q.X0,Hh=Q.Y1-Q.Y0,f=1+.45*k;
  let x,y,vx,vy;
  if(e===0){x=Q.X0+u*W;y=Q.Y0;vx=(Math.random()-.5)*.5;vy=(1.7+1.5*Math.random())*f;}
  else if(e===1){x=Q.X0+u*W;y=Q.Y1;vx=(Math.random()-.5)*.5;vy=-(1.2+1.1*Math.random())*f;}
  else{x=e===2?Q.X0:Q.X1;y=Q.Y0+u*Hh*.96;vx=(e===2?1:-1)*(1.15+1.05*Math.random())*f;vy=.3*Math.random();}
  P[o]=x;P[o+1]=y;P[o+2]=C.z0+[-.26,-.06,.14,.3][(Math.random()*4)|0];P[o+3]=vx;P[o+4]=vy;
  const L=.5+.55*Math.random()+.25*k;P[o+5]=L;P[o+6]=L;P[o+7]=.75+.5*Math.random();P[o+8]=Math.random()<.33?-(.4+1.3*Math.random()):0;C.n++; // un sur trois SORT de la porte, vers l'atelier
}
function garFeuCubes(dt){
  const C=GAR.feuC,F=GAR.feu,Q=FEU_CUBES;if(!C||!F)return;
  if(!Q.on){if(C.n){C.n=0;C.A.count=C.B.count=0;}return;}
  {const v9=!GAR.porte||GAR.porte.e>.5;if(C.A.visible!==v9)C.A.visible=C.B.visible=v9;} // porte fermée : les cubes la traverseraient — ils attendent qu'elle s'ouvre (le feu se voit par les hublots)
  dt=Math.min(dt,.05);const k=F.k,t=F.t,P=C.p,M=C.m,col=C.A.instanceColor.array;
  C.acc+=dt*(250+520*k)*(REDUCED_MOTION?.5:1);
  while(C.acc>=1){C.acc-=1;if(C.n>=Q.N){C.acc=0;break;}feuCubeNait(C,t,k);}
  const D=.78+.4*k,dr=Math.exp(-1.3*dt);
  for(let i=0;i<C.n;i++){let o=i*9;
    P[o+5]-=dt;
    if(P[o+5]<=0||P[o+1]>Q.Y1+.3||P[o+1]<-.1){C.n--;if(i<C.n){P.copyWithin(o,C.n*9,C.n*9+9);i--;}continue;} // la dernière prend sa place
    const x=P[o],y=P[o+1];
    P[o+3]=P[o+3]*dr+Math.sin(y*3.1+t*4.3+x*.7)*1.3*dt;                        // le tourbillon
    P[o+4]+=1.75*dt;                                                            // le feu MONTE (le linteau plonge puis se recourbe)
    P[o]+=P[o+3]*dt;P[o+1]+=P[o+4]*dt;P[o+2]+=P[o+8]*dt;
    const a=P[o+5]/P[o+6],b=a>Q.seuils[0]?0:a>Q.seuils[1]?1:a>Q.seuils[2]?2:a>Q.seuils[3]?3:a>Q.seuils[4]?4:5;
    const sz=Q.c*Q.taille[b]*P[o+7],xs=Math.round(P[o]/Q.pas)*Q.pas,ys=Math.round(P[o+1]/Q.pas)*Q.pas;  // sur la GRILLE : des cases, pas un glissé
    M.makeScale(sz,sz,sz);M.elements[12]=xs;M.elements[13]=ys;M.elements[14]=Math.round(P[o+2]/Q.pas)*Q.pas;C.A.setMatrixAt(i,M);
    const c=Q.pal[b];col[i*3]=c[0]*D;col[i*3+1]=c[1]*D;col[i*3+2]=c[2]*D;}
  C.A.count=C.B.count=C.n;C.A.instanceMatrix.needsUpdate=true;C.A.instanceColor.needsUpdate=true;
}
function feuPixPas(F){
  const W=F.W,H=F.H,t=F.t,k=F.k,hh=F.h,px=F.img.data,dt=F.dt||1/30;
  /* (2026-10-04, Léo : « des flammes dans tous les sens ») le rideau brûle depuis les QUATRE bords : le seuil (hh), le linteau (hT), les
     deux montants (sG, sD) — chacun ses langues ; derrière les cubes, un cran plus sombre (D). */
  const hT=F.hT||(F.hT=new Float32Array(W)),sG=F.sG||(F.sG=new Float32Array(H)),sD=F.sD||(F.sD=new Float32Array(H));
  const top=.34+.3*k;                                                        // la hauteur moyenne des flammes du seuil (part de la porte)
  for(let x=0;x<W;x++){const u=x/(W-1);
    let h=top*(.7+.17*Math.sin(u*7.1+t*.9)+.13*Math.sin(u*13.3-t*1.45));
    const tg=Math.sin(u*23+t*2.3+1.7*Math.sin(u*6.2-t*.8));h+=top*.45*tg*tg*tg*(tg>0?1:0); // les LANGUES
    hh[x]=Math.min(.8,h);
    const tt=Math.sin(u*19-t*1.9+1.3*Math.sin(u*5.1+t*.7));hT[x]=(.17+.12*k)*(.75+.25*Math.sin(u*9.3+t*1.1))+(.14+.08*k)*(tt>0?tt*tt*tt:0);}
  for(let y=0;y<H;y++){const v=1-(y+.5)/H,s1=Math.sin(v*14+t*2.6+1.2*Math.sin(v*4.3-t)),s2=Math.sin(v*11-t*2.2+.8);
    sG[y]=(.08+.05*k)*(.8+.2*Math.sin(v*6+t))+(.07+.04*k)*(s1>0?s1*s1*s1:0);sD[y]=(.08+.05*k)*(.8+.2*Math.sin(v*5.3-t*1.2))+(.07+.04*k)*(s2>0?s2*s2*s2:0);}
  const D=.84+.16*k;                                                         // au repos un cran plus sombre : il est là, il ne crie pas — (brasier) les langues gardent leur éclat : elles se lisent SUR le brasier
  for(let y=0;y<H;y++){const v=1-(y+.5)/H,o0=y*W;
    const ond=v*(2.1*Math.sin(v*11-t*5.2)+1.1*Math.sin(v*23-t*8.3));        // la colonne lue ondule avec la hauteur
    for(let x=0;x<W;x++){const o=(o0+x)*4,u=x/(W-1);
      let xs=Math.round(x+ond+.8*Math.sin(x*.5+t*3.3)*v);xs=xs<0?0:xs>=W?W-1:xs;
      const h=hh[xs];let I=h>0?1-v/h:-1;
      const iT=1-(1-v)/hT[xs],iG=1-u/sG[y],iD=1-(1-u)/sD[y];if(iT>I)I=iT;if(iG>I)I=iG;if(iD>I)I=iD;
      // le BRASIER : des nappes de chaleur qui montent (v − t), deux ondes lentes, le tramage, et un peu plus chaud près des langues
      const hb=.42+.17*Math.sin(u*5.3+t*.9)*Math.sin(v*4.1-t*.7)+.14*Math.sin(u*11-v*7+t*1.6)+.12*Math.sin(v*9-t*2.2+u*3.1)
        +(FEU_BAY[(y&3)*4+(x&3)]/16-.5)*.3+(I>-.6?.25*(1+I/.6):0);
      const cb=FEU_BRASIER[hb<.22?0:hb<.4?1:hb<.56?2:hb<.72?3:4],Kb=.8+.2*k;
      let r=cb[0]*Kb,g9=cb[1]*Kb,b9=cb[2]*Kb;
      if(I>0){const b=I<.1?0:I<.24?1:I<.4?2:I<.57?3:I<.74?4:I<.9?5:6,c=FEU_PAL[b];
        if(c[0]*.3+c[1]*.59+c[2]*.11>(r*.3+g9*.59+b9*.11)/D){r=c[0]*D;g9=c[1]*D;b9=c[2]*D;}} // la plus claire des deux : la langue, ou le brasier
      px[o]=r;px[o+1]=g9;px[o+2]=b9;
      px[o+3]=255;}}
  // LES BRAISES : une case qui monte et se balance, ambre → rouge → éteinte
  const E=F.em,nb=(3.5+60*k)*dt,cnt=Math.floor(nb)+(Math.random()<nb%1?1:0); // ~3,5 braises/s au repos, une gerbe au lâcher
  for(let n=0;n<cnt;n++){if(E.length>=28)break;const x0=Math.random()*W;
    E.push({x:x0,y:H*(1-hh[Math.min(W-1,x0|0)]*(.85+Math.random()*.2)),vy:-(H*(.22+Math.random()*.25)),ph:Math.random()*6.3,l:1});}
  for(let n=E.length-1;n>=0;n--){const e=E[n];e.y+=e.vy*dt;e.l-=dt*(.55+.3*Math.random());
    if(e.l<=0||e.y<1){E.splice(n,1);continue;}
    const x=Math.round(e.x+1.4*Math.sin(e.ph+t*3)),y=e.y|0;if(x<0||x>=W||y<0||y>=H)continue;
    const o=(y*W+x)*4,a=e.l;px[o]=Math.max(px[o],255*a);px[o+1]=Math.max(px[o+1],(90+110*a)*a);px[o+2]=Math.max(px[o+2],40*a);}
  F.cx.putImageData(F.img,0,0);F.tex.needsUpdate=true;
}
function garPortePose(e){ // la porte le long de son RAIL : montée verticale (0 → 4,7 m), coude de 0,28 m, puis à plat sous le plafond (−z)
  const Pt=GAR.porte;if(!Pt||e===Pt.e)return;Pt.e=e;const zD=Pt.zD;
  for(let i=0;i<5;i++){const s0=.47+.94*i,s=s0+(5.51+1.02*i-s0)*e,m=Pt.P[i];
    if(s<=4.7){m.position.set(0,s,zD);m.rotation.set(0,0,0);}
    else if(s<=5.14){const th=(s-4.7)/.44*Math.PI/2;m.position.set(0,4.7+.28*Math.sin(th),zD-.28+.28*Math.cos(th));m.rotation.set(-th,0,0);}
    else{m.position.set(0,4.98,zD-.28-(s-5.14));m.rotation.set(-Math.PI/2,0,0);}}}
function garPorte(dt){ // FERMÉE tant qu'on ne part pas ; le JOUER (GAR.go, retour de vue compris) l'ouvre en 0,8 s, en accélérant puis en freinant
  const Pt=GAR.porte;if(!Pt)return;
  Pt.k=GAR.go?Math.min(1,Pt.k+dt/.8):0;
  /* (2026-10-05, Léo : « centré sur l'entrée, sans la porte ») en VITRINE la porte se LÈVE (1,1 s) : l'entrée et le feu, en face — elle redescend
     quand on quitte la vitrine. ⚠ la porte fermée est un choix de Sacha (menu, boutique) : ici seulement en vitrine, à confirmer avec elle. */
  const vo9=(gEl&&gEl.classList.contains('vitrine')&&!gEl.classList.contains('menu'))?1:0;Pt.kv= /* (2026-10-06) ⚠ la vitrine SEULE : dans la console de Sacha la vue de Léo regarde la porte FERMÉE (son choix, voir garVueLeo) */(Pt.kv||0)+(vo9-(Pt.kv||0))*Math.min(1,dt*1.8);
  const kk9=Math.max(Pt.k,Pt.kv);garPortePose(Pt.force!=null?Pt.force:(!PORTE_FERMEE?1:kk9*kk9*(3-2*kk9))*(1-GATL.cs)); // (Pt.force : dbgPorte, le banc) — (Léo : « enlève la porte ») sans PORTE_FERMEE elle reste RELEVÉE sous le plafond : le feu se voit au menu
  const F=GAR.feu,fl=F?.82+.12*Math.sin(F.t*9.1)+.06*Math.sin(F.t*23.7):1;Pt.mH.emissiveIntensity=fl*(1-Pt.e*.6); // les hublots battent avec le feu
  const B=GAR.beau;if(B){if(B.fac)B.fac.material.opacity=.2*(.15+.85*Pt.e);if(B.braises)B.braises.visible=Pt.e>.3;} // porte fermée : la lumière du feu ne passe plus qu'au ras du sol, pas de braises
}
function garFeu(dt){ // il brûle au repos, il RUGIT pendant le lâcher (k : 0 → 1 en 1,7 s, lissé) ; 30 pas/s (12 si « réduire les animations »)
  const F=GAR.feu;if(!F)return;const G=GAR.go;
  const u=G?Math.min(1,G.t/1.7):0,k0=u*u*(3-2*u);F.k+=(k0-F.k)*Math.min(1,dt*(G?12:3));
  {const po=GAR.porte?Math.max(0,GAR.porte.e):1,db=8*F.k-9*(1-po);if(openGarage._feu&&!BQSON.atelier&&(G||GAR.porte&&Math.abs(db-(GAR.porte.db==null?99:GAR.porte.db))>.3)){if(GAR.porte)GAR.porte.db=db;try{openGarage._feu.gain(db,.05);}catch(e){}}} // le feu GRONDE quand la caisse entre dedans — (2026-09-30) ÉTOUFFÉ derrière la porte fermée
  if(GAR.feuLu)GAR.feuLu.material.opacity=Math.min(1,(.16+.03*Math.sin(F.t*9.1)+.02*Math.sin(F.t*23.7))*(1+F.k*2.4)*(.4+.6*(GAR.porte?Math.max(0,GAR.porte.e):1))); // (v3, Léo : « le sol ») .42 → .16 au repos, elle monte au lâcher ; (porte fermée : la lueur qui passe SOUS la porte)
  try{garFeuCubes(dt);}catch(e){}
  const pas=REDUCED_MOTION?1/12:1/30;F.acc+=dt;if(F.acc<pas)return;F.acc=Math.min(F.acc-pas,pas);F.t+=pas;F.dt=pas;feuPixPas(F);
}
function garBeaute(dt,t9){ // (2026-09-30) L'ATELIER v2 : ce qui vit — le feu qui éclaire et se reflète, le néon, les gyrophares, l'anneau de LED, les braises
  const B=GAR.beau;if(!B)return;const k=GAR.feu?GAR.feu.k:0,po=GAR.porte?Math.max(0,GAR.porte.e):1; // po : l'ouverture de la porte (0 fermée → 1)
  const fl=(1+.07*Math.sin(t9*9.1)+.04*Math.sin(t9*23.7)+.02*Math.sin(t9*41.3))*(1+k*1.4); // le souffle des flammes (celui de la lueur du seuil), et le RUGISSEMENT du lâcher — (Léo : « les reflets des flammes un peu forts, ça ne va pas avec l'aspect premium ; surtout le sol, et le reflet en général ») un souffle calme au repos, tout monte au lâcher
  {const d9=camera.getWorldDirection(B.cd||(B.cd=new THREE.Vector3())),w9=Math.max(0,Math.min(1,d9.z*1.25));B.reflet.visible=w9>.05;B.reflet.material.opacity=Math.min(1,.14*fl)*w9*w9*(.12+.88*po);} /* (Léo) .5 → .14 : un reflet, pas une deuxième porte en feu */ // un REFLET dépend du regard : calé sur la vue de la porte, il s'efface quand la caméra ne regarde plus la porte
  B.murG.material.opacity=B.murD.material.opacity=Math.min(1,.15*fl)*(.2+.8*po);B.plaf.material.opacity=Math.min(1,.06*fl)*(.2+.8*po); // (Léo) murs .42 → .15, plafond .16 → .06 (la façade : voir la porte, .5 → .2)
  for(const n of B.neons)n.material.opacity=.86+.1*Math.sin(t9*2.3)+(Math.random()<.004?-.5:0); // le néon respire, et hoquette parfois
  for(const G9 of B.gyro){const c=Math.cos(t9*4.2+G9.ph),c3=c>0?c*c*c:0;G9.s.material.opacity=c3*.95;G9.s.scale.x=1.2+1.6*c3;} // le faisceau qui passe
  B.led.rotation.z+=dt*(.9+k*6);B.led.material.opacity=Math.min(1,.75+.2*Math.sin(t9*3.1)+k*.6)*(.6); /* (garage-lumiere) l'anneau de LED : un liseré, pas un néon */
  const P=B.braises.geometry.attributes.position,a=P.array,v=B.bv,hd=GAR.D/2,n9=v.length/4;
  for(let i=0;i<n9;i++){const j=i*3,q=i*4;v[q+3]-=dt;
    if(v[q+3]<=0){a[j]=(Math.random()-.5)*9;a[j+1]=.2+Math.random()*2.6;a[j+2]=hd-.4; // elle naît dans le feu…
      v[q]=(Math.random()-.5)*.9;v[q+1]=.5+Math.random()*1.1;v[q+2]=-(.6+Math.random()*1.8)*(1+k*2);v[q+3]=1.4+Math.random()*2.6;}
    a[j]+=v[q]*dt+Math.sin(t9*1.7+i)*dt*.25;a[j+1]+=v[q+1]*dt;a[j+2]+=v[q+2]*dt;} // …monte, et entre dans l'atelier
  P.needsUpdate=true;
}
