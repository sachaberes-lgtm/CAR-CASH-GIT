function buildGarageRoom(){
  const W=GAR.W,D=GAR.D,H=GAR.H,hw=W/2,hd=D/2;
  const g=new THREE.Group();g.visible=false;scene.add(g);GAR.root=g;
  // --- les SIX géométries : tout l'atelier est bâti par mise à l'échelle
  const BX=new THREE.BoxGeometry(1,1,1),CY=new THREE.CylinderGeometry(.5,.5,1,14),
        CY8=new THREE.CylinderGeometry(.5,.5,1,7),TOR=new THREE.TorusGeometry(.34,.16,7,16),
        CN=new THREE.ConeGeometry(.5,1,12),PL=new THREE.PlaneGeometry(1,1);
  const L=(c,e,o)=>new THREE.MeshLambertMaterial(Object.assign({color:c,emissive:e===undefined?0:e,flatShading:true,fog:false},o||{}));
  const BA=(c,o)=>new THREE.MeshBasicMaterial(Object.assign({color:c,fog:false},o||{}));
  // La PALETTE : béton froid, ferraille bleu nuit, et quatre couleurs franches (rouge servante,
  // jaune sécurité, bleu fût, orange palan) qui suffisent à faire lire « atelier » d'un coup d'œil.
  const M={
    sol   :L(0xffffff,0x090b10,{flatShading:false}),
    mur   :L(0x3c4557,0x1b212f), bas:L(0x1c2433,0x0e1422), toit:L(0x101319,0x0a0f1a), /* (garage-lumiere) émissifs remontés : on lit les murs */
    fer   :L(0x232a38,0x070910), acier:L(0x6b7688,0x101319), chrome:L(0xc2cbd8,0x171b21),
    noir  :L(0x15181f,0x040609), pneu:L(0x1a1c21,0x050608),
    rouge :L(0xd53c2f,0x2e0906), bleu:L(0x2f6cb8,0x0a1526), vert:L(0x2f9e63,0x092312),
    jaune :L(0xefb52a,0x2e2005), orange:L(0xe8721f,0x2c1105),
    bois  :L(0x8a6237,0x1a1108), carton:L(0xb08b5a,0x1c150c), beige:L(0xbfb49a,0x1d1b15),
    verre :L(0x1b3550,0x0a1a2c,{transparent:true,opacity:.55})
  };
  const add9=(geo,mat,x,y,z,sx,sy,sz)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.scale.set(sx,sy,sz);g.add(m);return m;};
  const bx=(x,y,z,w,h,d,mat)=>add9(BX,mat,x,y,z,w,h,d);
  const cy=(x,y,z,r,h,mat)=>add9(CY,mat,x,y,z,r*2,h,r*2);
  const cvT=(w,h,f)=>{const cv=document.createElement('canvas');cv.width=w;cv.height=h;f(cv.getContext('2d'),w,h);return new THREE.CanvasTexture(cv);};

  // ===== LES TEXTURES PEINTES : sept canvas, et le décor cesse d'être un tas de cubes nus =====
  /* (2026-09-30, L'ATELIER v2) LE SOL : un ÉPOXY sombre en grandes dalles de 2,2 m (joint noir + arête claire), moucheté, deux ou trois traces
     de pneus — et BRILLANT (Phong) : les deux lampes qui suivent la caméra y courent en reflets. L'ancien béton tacheté, mat, faisait de la
     moitié basse de l'écran du menu un aplat bleu nuit. */
  const solTex=cvT(512,512,(x,w,h)=>{const T9=128;
    x.fillStyle='#1c2029';x.fillRect(0,0,w,h);
    for(let i=0;i<4;i++)for(let j=0;j<4;j++){const l=(Math.random()*8-4)|0;x.fillStyle='rgb('+(30+l)+','+(35+l)+','+(46+l)+')';x.fillRect(i*T9+2,j*T9+2,T9-4,T9-4);}
    for(let i=0;i<9000;i++){const a=(Math.random()*.09).toFixed(3);x.fillStyle=(Math.random()<.5?'rgba(0,0,0,':'rgba(190,210,255,')+a+')';
      x.fillRect(Math.random()*w,Math.random()*h,1+Math.random()*1.4,1+Math.random()*1.4);}
    x.fillStyle='rgba(3,5,9,.9)';for(let i=0;i<=4;i++){x.fillRect(i*T9-2,0,3,h);x.fillRect(0,i*T9-2,w,3);}          // le joint
    x.fillStyle='rgba(130,155,205,.13)';for(let i=0;i<4;i++){x.fillRect(i*T9+1,0,1,h);x.fillRect(0,i*T9+1,w,1);}    // l'arête qui accroche la lumière
    x.lineWidth=7;for(let k=0;k<3;k++){x.strokeStyle='rgba(0,0,0,'+(.1+Math.random()*.1).toFixed(2)+')';x.beginPath();
      x.arc(Math.random()*w,Math.random()*h,70+Math.random()*140,Math.random()*6,Math.random()*6+1.3);x.stroke();}   // traces de gomme
  });
  solTex.wrapS=solTex.wrapT=THREE.RepeatWrapping;solTex.repeat.set(W/8.8,D/8.8);solTex.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());
  M.sol=new THREE.MeshPhongMaterial({color:0xffffff,map:solTex,specular:0x2c3850,shininess:90,emissive:0x0a1020,fog:false});
  // LES MURS : un bardage de panneaux de 2,6 m (nervures, joint, rivets, lisse) avec la lumière du plafond cuite (clair en haut, sombre
  // en bas) — une matière par mur, parce que la répétition d'une texture est une propriété de la TEXTURE (et les murs n'ont pas la même largeur)
  const murTexB=cvT(128,256,(x,w,h)=>{const gr=x.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#566279');gr.addColorStop(.45,'#3c465a');gr.addColorStop(1,'#252c3a');
    x.fillStyle=gr;x.fillRect(0,0,w,h);
    for(let i=0;i<8;i++){const xx=8+i*15;x.fillStyle='rgba(255,255,255,.07)';x.fillRect(xx,0,3,h);x.fillStyle='rgba(0,0,0,.16)';x.fillRect(xx+3,0,3,h);}
    x.fillStyle='rgba(0,0,0,.55)';x.fillRect(0,0,3,h);x.fillStyle='rgba(255,255,255,.1)';x.fillRect(3,0,1,h);
    x.fillStyle='rgba(0,0,0,.35)';for(let j=6;j<h;j+=24)x.fillRect(5,j,2,2);
    x.fillStyle='rgba(0,0,0,.3)';x.fillRect(0,h*.5,w,2);x.fillStyle='rgba(255,255,255,.06)';x.fillRect(0,h*.5+2,w,1);});
  const murM=(rx,ry,oy)=>{const t=murTexB.clone();t.needsUpdate=true;t.wrapS=THREE.RepeatWrapping;t.repeat.set(rx,ry||1);t.offset.y=oy||0;return L(0xffffff,0x1b212f,{map:t});};
  const pegTex=cvT(64,64,(x,w,h)=>{ // le panneau perforé de l'établi
    x.fillStyle='#414c60';x.fillRect(0,0,w,h);x.fillStyle='#141a26';
    for(let i=0;i<8;i++)for(let j=0;j<8;j++){x.beginPath();x.arc(i*8+4,j*8+4,1.6,0,7);x.fill();}
  });
  pegTex.wrapS=pegTex.wrapT=THREE.RepeatWrapping;pegTex.repeat.set(11,4);
  const blobTex=cvT(128,128,x=>{const gr=x.createRadialGradient(64,64,0,64,64,62); // (vague 2) blanc : la matière la teinte à l'ENCRE (plus bas)
    gr.addColorStop(0,'rgba(255,255,255,.75)');gr.addColorStop(.5,'rgba(255,255,255,.34)');gr.addColorStop(1,'rgba(255,255,255,0)');
    x.fillStyle=gr;x.fillRect(0,0,128,128);});
  const oilTex=cvT(128,128,x=>{const gr=x.createRadialGradient(64,64,0,64,64,60);
    gr.addColorStop(0,'rgba(9,7,13,.85)');gr.addColorStop(.6,'rgba(22,16,28,.45)');gr.addColorStop(1,'rgba(24,18,30,0)');
    x.fillStyle=gr;x.fillRect(0,0,128,128);});
  const vendTex=cvT(64,96,(x,w,h)=>{ // la façade du distributeur : elle éclaire son coin toute seule
    x.fillStyle='#07172a';x.fillRect(0,0,w,h);
    const cols=['#ff3b6b','#ffb020','#3ee08a','#4ab8ff','#ff6adf'];
    for(let r=0;r<4;r++)for(let c=0;c<4;c++){x.fillStyle=cols[(r*3+c)%5];x.fillRect(5+c*14,8+r*21,10,16);}
    x.fillStyle='rgba(180,230,255,.14)';x.fillRect(0,0,w,h);
  });
  const postTex=cvT(128,96,(x,w,h)=>{ // l'affiche : damier + le logo maison
    for(let i=0;i<8;i++)for(let j=0;j<3;j++){x.fillStyle=((i+j)&1)?'#e9eef7':'#131a27';x.fillRect(i*16,j*9,16,9);}
    x.fillStyle='#0d1220';x.fillRect(0,27,w,h-27);
    x.textAlign='center';x.font="bold 15px 'Press Start 2P',monospace";
    x.fillStyle='#ffcf3d';x.fillText('CASH',w/2,56);x.fillStyle='#5ff0ff';x.fillText('CAR',w/2,78);
  });
  // NÉON : lettres cernées de couleur, cœur blanc — le bloom du jeu fait le halo tout seul
  const neonTex=(txt,col,px)=>cvT(256,80,(x,w,h)=>{
    x.textAlign='center';x.textBaseline='middle';x.font='bold '+px+"px 'Press Start 2P',monospace";
    x.shadowColor=col;x.shadowBlur=px*.9;x.strokeStyle=col;x.lineWidth=px*.22;x.lineJoin='round';
    for(let i=0;i<3;i++)x.strokeText(txt,w/2,h/2);
    x.shadowBlur=px*.35;x.fillStyle='#ffffff';x.fillText(txt,w/2,h/2);
  });
  const flat=(tex,x9,y9,z9,w9,h9,ry,blend)=>{const m=new THREE.Mesh(PL,new THREE.MeshBasicMaterial(
      {map:tex,transparent:true,fog:false,depthWrite:false,blending:blend||THREE.NormalBlending}));
    m.position.set(x9,y9,z9);m.scale.set(w9,h9,1);if(ry)m.rotation.y=ry;g.add(m);return m;};

  // ===== LA COQUE : sol, murs, plafond, charpente =====
  const sol=add9(PL,M.sol,0,0,0,W,D,1);sol.rotation.x=-Math.PI/2;sol.receiveShadow=true;
  bx(0,H/2,-hd-.15,W+.6,H,.3,murM((W+.6)/2.6));                                    // mur du fond (l'atelier)
  {const mL=murM(D/2.6);bx(-hw-.15,H/2,0,.3,H,D,mL);bx(hw+.15,H/2,0,.3,H,D,mL);}
  {const mP=murM(6.2/2.6);bx(-7.9,H/2,hd+.15,6.2,H,.3,mP);bx(7.9,H/2,hd+.15,6.2,H,.3,mP);} // piles de la porte
  bx(0,5.45,hd+.15,9.6,1.5,.3,murM(9.6/2.6,1.5/H,1-1.5/H));                                   // linteau
  bx(0,H+.15,0,W+.6,.3,D+.6,M.toit);                                    // plafond
  // soubassement peint + bande de sécurité jaune : deux traits, et le mur devient un ATELIER
  for(const p of [[0,-hd+.09,W,0],[-hw+.09,0,D,1],[hw-.09,0,D,1]]){
    const lg=p[3],ln=p[2];
    bx(p[0],.6,p[1],lg?.06:ln,1.2,lg?ln:.06,M.bas);
    bx(p[0],1.26,p[1],lg?.07:ln,.09,lg?ln:.07,M.jaune);}
  // CHARPENTE : cinq poutres en I + les gaines qui courent au plafond
  for(let i=-2;i<=2;i++){const z=i*5.4;bx(0,H-.55,z,W,.44,.16,M.fer);bx(0,H-.79,z,W,.09,.5,M.fer);}
  for(const px of [-3.4,3.4]){cy(px,H-1.0,0,.09,D-1,M.fer).rotation.x=Math.PI/2;
    for(let i=-2;i<=2;i++)bx(px,H-.78,i*5.4,.06,.5,.06,M.fer);}
  // PORTE SECTIONNELLE RELEVÉE : les panneaux sont remontés à plat sous le plafond, rails compris.
  // C'est ELLE qui ouvre l'atelier sur la nuit — sans ça, on tourne dans une boîte fermée.
  for(const sx of [-1,1]){bx(sx*4.85,2.4,hd-.1,.24,4.8,.4,M.fer);bx(sx*4.85,4.95,hd-3.3,.14,.14,6.6,M.fer);}
  bx(0,4.85,hd-.15,10,.3,.5,M.fer);                                     // traverse haute
  /* (2026-09-30, Sacha : « la porte du garage doit être fermée au début et s'ouvrir avec les flammes quand on clique sur JOUER ») LA PORTE
     SECTIONNELLE descend : cinq panneaux de tôle nervurée sur le rail, FERMÉS au menu — le feu brûle derrière, il passe par les joints, par
     les hublots du 4e panneau et sous la porte. Au LÂCHER, ils remontent le rail, prennent le coude et filent sous le plafond (garPorte,
     0,8 s dès le JOUER) : le rideau de flammes apparaît et la caisse y entre. Ouverte, la porte retrouve exactement la place des panneaux
     empilés d'avant (y 4,98 ; z hd − 0,85 − 1,02 i). */
  /* LA PORTE v2 (2026-10-04, Léo : « remets une porte maintenant que les flammes sont plus jolies, et fais une porte de garage plus jolie »).
     Une seule toile pour toute la porte (1000 × 500, une bande de 100 par panneau) que chaque panneau lit par ses UV : une LAQUE indigo
     à CAISSONS biseautés (six par panneau, la lumière d'en haut à gauche), le haut en bandeau — CASH CAR en lettres d'or pixel entre deux
     filets de néon rose —, le 4e panneau percé de six VRAIS HUBLOTS (trous dans la toile, alphaTest : derrière, le feu en pixels brûle
     pour de bon), une poignée d'or, et en bas une bande de danger jaune et noire sur son joint de caoutchouc. La toile d'ÉMISSION fait
     passer la lueur du feu par les JOINTS des panneaux et fait luire l'or et le néon ; elle bat avec les flammes (garPorte).
     Une matière pour les cinq panneaux (même programme qu'une Lambert de l'atelier + alphaTest : compilée au menu avec lui). */
  {const DW=1000,DH=500,dCv=document.createElement('canvas'),eCv=document.createElement('canvas');dCv.width=eCv.width=DW;dCv.height=eCv.height=DH;
   const dx=dCv.getContext('2d'),ex=eCv.getContext('2d');
   const peint=function(){
     dx.clearRect(0,0,DW,DH);ex.fillStyle='#000';ex.fillRect(0,0,DW,DH);
     const caisson=function(x0,y0,w,h){
       dx.fillStyle='#14111f';dx.fillRect(x0-3,y0-3,w+6,h+6);                                  // la feuillure (l'ombre autour)
       const gr=dx.createLinearGradient(0,y0,0,y0+h);gr.addColorStop(0,'#3a3566');gr.addColorStop(1,'#26223f');dx.fillStyle=gr;dx.fillRect(x0,y0,w,h);
       dx.fillStyle='#6a63a6';dx.fillRect(x0,y0,w,3);dx.fillRect(x0,y0,3,h);                  // le biseau éclairé (haut, gauche)
       dx.fillStyle='#100d1c';dx.fillRect(x0,y0+h-3,w,3);dx.fillRect(x0+w-3,y0,3,h);          // le biseau dans l'ombre (bas, droite)
       dx.fillStyle='#4a447e';dx.fillRect(x0+3,y0+3,w-6,1);};
     for(let i=0;i<5;i++){const y0=(4-i)*100;
       const gr=dx.createLinearGradient(0,y0,0,y0+100);gr.addColorStop(0,'#2f2a4d');gr.addColorStop(1,'#1d1a31');dx.fillStyle=gr;dx.fillRect(0,y0,DW,100);
       dx.fillStyle='#726bb0';dx.fillRect(0,y0,DW,2);dx.fillStyle='#3d3862';dx.fillRect(0,y0+2,DW,1);   // l'arête du panneau
       dx.fillStyle='#0a0814';dx.fillRect(0,y0+96,DW,4);                                        // le joint
       ex.fillStyle='#ff6a1c';ex.fillRect(0,y0+97,DW,2);ex.fillStyle='#7a2a08';ex.fillRect(0,y0,DW,1);   // le feu passe par les joints
       if(i<=2){const h0=i===0?y0+12:y0+16,hh=i===0?54:66;for(let k=0;k<6;k++)caisson(30+k*160,h0,140,hh);}
       if(i===3){for(let k=0;k<6;k++){const x0=30+k*160,yw=y0+18,w=140,h=62;                    // LES HUBLOTS
         dx.fillStyle='#0b0a12';dx.fillRect(x0-4,yw-4,w+8,h+8);
         dx.fillStyle='#d5dbec';dx.fillRect(x0,yw,w,4);dx.fillRect(x0,yw,4,h);                  // le cadre chromé
         dx.fillStyle='#5a6078';dx.fillRect(x0,yw+h-4,w,4);dx.fillRect(x0+w-4,yw,4,h);
         dx.fillStyle='#9aa1b8';dx.fillRect(x0+4,yw+4,w-8,3);
         dx.clearRect(x0+8,yw+8,w-16,h-16);                                                     // le trou : derrière, le feu
         for(const [cx,cy] of [[x0+8,yw+8],[x0+w-11,yw+8],[x0+8,yw+h-11],[x0+w-11,yw+h-11]]){dx.fillStyle='#5a6078';dx.fillRect(cx,cy,3,3);} // coins arrondis, en pixels
         ex.fillStyle='#3a1206';ex.fillRect(x0,yw,w,h);}}                                        // le reflet du feu sur le cadre
       if(i===4){dx.fillStyle='#ffb24a';dx.fillRect(40,y0+14,DW-80,3);dx.fillRect(40,y0+84,DW-80,3);   // LE BANDEAU : néon rose
         ex.fillStyle='#b8741c';ex.fillRect(40,y0+14,DW-80,3);ex.fillRect(40,y0+84,DW-80,3);
         dx.font='44px "Press Start 2P", monospace';dx.textAlign='center';dx.textBaseline='middle';
         const tx=DW/2,ty=y0+52;dx.fillStyle='#4a2600';dx.fillText('CASH CAR',tx+5,ty+5);dx.fillText('CASH CAR',tx+3,ty+3); // l'épaisseur
         const go=dx.createLinearGradient(0,ty-22,0,ty+22);go.addColorStop(0,'#fff4b0');go.addColorStop(.45,'#ffcf3a');go.addColorStop(1,'#c4820c');
         dx.fillStyle=go;dx.fillText('CASH CAR',tx,ty);
         ex.font=dx.font;ex.textAlign='center';ex.textBaseline='middle';ex.fillStyle='#8a6214';ex.fillText('CASH CAR',tx,ty);}
       if(i===1){dx.fillStyle='#3a2a08';dx.fillRect(452,y0+50,96,12);dx.fillStyle='#e8b73a';dx.fillRect(450,y0+46,96,12); // LA POIGNÉE d'or
         dx.fillStyle='#fff0a0';dx.fillRect(450,y0+46,96,3);ex.fillStyle='#3a2a08';ex.fillRect(450,y0+46,96,12);}
       if(i===0){dx.fillStyle='#16131f';dx.fillRect(0,y0+72,DW,20);                              // LA BANDE DE DANGER : noir, puis les biais jaunes
         dx.fillStyle='#f5c425';for(let x=-20;x<DW+20;x+=36){dx.beginPath();dx.moveTo(x,y0+92);dx.lineTo(x+18,y0+72);dx.lineTo(x+36,y0+72);dx.lineTo(x+18,y0+92);dx.fill();}
         dx.fillStyle='#0a0812';dx.fillRect(0,y0+70,DW,2);dx.fillStyle='#07060b';dx.fillRect(0,y0+92,DW,8);   // le joint de caoutchouc
         ex.fillStyle='#ff6a1c';ex.fillRect(0,y0+98,DW,2);}}};                                   // la lueur SOUS la porte
   peint();
   const tD=new THREE.CanvasTexture(dCv),tE=new THREE.CanvasTexture(eCv);tD.magFilter=THREE.NearestFilter;tD.anisotropy=4;tE.anisotropy=4;
   try{if(document.fonts&&document.fonts.load)document.fonts.load('44px "Press Start 2P"').then(function(){peint();tD.needsUpdate=true;tE.needsUpdate=true;}).catch(function(){});}catch(e){}
   const mH=new THREE.MeshLambertMaterial({color:0xffffff,map:tD,emissive:0xffffff,emissiveMap:tE,alphaTest:.5,fog:false}),P9=[];
   for(let i=0;i<5;i++){const geo=new THREE.BoxGeometry(9.5,.9,.1),uv=geo.attributes.uv;
     for(let v=0;v<uv.count;v++)uv.setY(v,(i+uv.getY(v))/5);                               // chaque panneau lit SA bande de la toile
     const m=new THREE.Mesh(geo,mH);m.position.set(0,.47+.94*i,hd-.2);g.add(m);P9.push(m);}
   GAR.porte={P:P9,zD:hd-.2,k:0,e:-1,mH:mH,db:null};garPortePose(0);}
  bx(3.2,5.55,hd-3.4,.8,.46,.66,M.acier);                               // le moteur de porte
  cy(3.2,5.2,hd-3.4,.03,.5,M.chrome);
  // ⚠ PAS DE BARRIÈRE, PAS DE PARVIS CLOS (verdict user) : franchir le seuil, c'est déjà être sur
  // la ligne de départ. Le ruban part du pas de la porte et file dans la nuit — liseré néon rose et
  // pointillés sodium, exactement la piste du jeu. Il s'éteint au loin par un FONDU BAKÉ dans la
  // texture (alpha → 0) : sans lui, la route se terminerait par une arête franche en plein ciel.
  bx(0,.02,hd+.05,10.4,.06,.5,M.acier);                                  // le seuil, en tôle striée
  {const rL=78,rW=11.4;
   const routeTex=cvT(64,256,(x,w,h)=>{
     x.fillStyle='#231f2c';x.fillRect(0,0,w,h);                          // bitume nuit
     x.fillStyle='#2b2634';for(let i=0;i<9;i++)x.fillRect(0,i*29+13,w,2);// joints de dalle
     x.fillStyle='#f24aa0';x.fillRect(2,0,4,h);x.fillRect(w-6,0,4,h);    // liserés néon rose
     x.fillStyle='#ffc24a';for(let i=0;i<16;i++)x.fillRect(w/2-2,i*16+4,4,9); // ligne centrale sodium
     x.globalCompositeOperation='destination-out';                        // ...et tout se dissout au loin
     const gf=x.createLinearGradient(0,h*.32,0,h);gf.addColorStop(0,'rgba(0,0,0,0)');gf.addColorStop(1,'rgba(0,0,0,1)');
     x.fillStyle=gf;x.fillRect(0,h*.32,w,h*.68);});
   const rte=add9(PL,new THREE.MeshBasicMaterial({map:routeTex,transparent:true,fog:false,depthWrite:false}),
                  0,.01,hd+rL/2,rW,rL,1);rte.rotation.x=-Math.PI/2;rte.renderOrder=-2;
   const glowTex=cvT(64,256,(x,w,h)=>{                                    // la nappe qui SAIGNE (bloom)
     x.fillStyle='#f24aa0';x.fillRect(0,0,9,h);x.fillRect(w-9,0,9,h);
     x.fillStyle='#ffb43c';x.fillRect(w/2-4,0,8,h);
     x.globalCompositeOperation='destination-out';
     const gf=x.createLinearGradient(0,0,0,h);gf.addColorStop(0,'rgba(0,0,0,.45)');gf.addColorStop(.32,'rgba(0,0,0,.45)');gf.addColorStop(1,'rgba(0,0,0,1)');
     x.fillStyle=gf;x.fillRect(0,0,w,h);});
   const gl=add9(PL,new THREE.MeshBasicMaterial({map:glowTex,transparent:true,fog:false,depthWrite:false,
     blending:THREE.AdditiveBlending}),0,.03,hd+rL/2,rW,rL,1);gl.rotation.x=-Math.PI/2;gl.renderOrder=-1;}
  /* ===== LE RIDEAU DE FLAMMES, v2 EN PIXELS (2026-09-29, Léo : « supprime ce design de flamme et recrée-en un inspiré complètement des
     flammes pixelisées de la jauge — une grosse, plus jolie, agrandie, mais pixelisée ») =====
     La porte relevée ne donne plus sur la nuit : elle BRÛLE d'un pilier à l'autre et du seuil au linteau (plus de vue dehors). C'est le
     FEU DE DOOM de la 1re jauge NITRO MAX (26/09, sur la branche de Léo), en grand : une grille de 80 × 40 CASES dont la rangée du bas
     brûle ; chaque case monte d'un cran en perdant un peu de chaleur, avec un décalage au hasard (le vent), et la palette va de la fumée
     rougie au blanc. Agrandie en PIXELS FRANCS (NearestFilter : aucune case lissée) sur un plan OPAQUE juste derrière le mur de façade
     (ses bords passent derrière les piles ±4,8 m et le linteau 4,7 m). Des FOYERS qui glissent le long du seuil font les langues ; des
     ÉTINCELLES (une case blanche jetée au hasard) montent et s'éteignent. `GAR.feu.k` suit le LÂCHER : le feu monte jusqu'au linteau.
     Coût : 3 200 cases à 30 images/s + une texture de 80 × 40 envoyée — rien ; seulement quand l'atelier est ouvert. */
  {const W9=96,H9=48,cv=document.createElement('canvas');cv.width=W9;cv.height=H9; // (2026-09-30, v3) 80 × 40 → 96 × 48 : des cases de 10 cm
   const tex=new THREE.CanvasTexture(cv);tex.magFilter=THREE.NearestFilter;tex.minFilter=THREE.NearestFilter;tex.generateMipmaps=false;
   const fm=new THREE.MeshBasicMaterial({map:tex,fog:false,toneMapped:false,color:0xd6d1cc}); // (garage-lumiere) le rideau de flammes de Léo : −16 % de lumière, même forme
   const fl=add9(PL,fm,0,2.45,hd+.36,10,4.9,1);fl.rotation.y=Math.PI;
   const F=GAR.feu={cv:cv,cx:cv.getContext('2d'),img:null,f:new Uint8Array(W9*H9),h:new Float32Array(W9),em:[],W:W9,H:H9,tex:tex,acc:0,t:0,k:0};
   F.img=F.cx.createImageData(W9,H9);GAR.feuM=fl;
   for(let i=0;i<70;i++)feuPixPas(F); // il BRÛLE déjà quand la porte apparaît (sinon il naîtrait sous les yeux, du seuil vers le haut)
   /* LES FLAMMES EN CUBES — voir FEU_CUBES (près de feuPixPas). Deux instanciations qui PARTAGENT leurs matrices et leurs couleurs : le
      CUBE plein (faces ombrées comme un bloc de jeu de cubes, couleurs au-delà de 1 : le halo du post les prend) et son HALO (le même cube
      ×1,9, additif, translucide) — 2 appels de dessin, 24 + 36 sommets par flamme. Compilés au menu avec l'atelier (atelierChauffe). */
   {const N=FEU_CUBES.N,bx9=new THREE.BoxGeometry(1,1,1),ps=bx9.attributes.position,nm=bx9.attributes.normal,cl=new Float32Array(ps.count*3);
    for(let i=0;i<ps.count;i++){const nx=nm.getX(i),ny=nm.getY(i),nz=nm.getZ(i),v9=ny>.5?1:ny<-.5?.5:nz<-.5?.86:nz>.5?.55:.68; // dessus clair, face vue (−z) presque pleine, flancs, dessous sombre
      cl[i*3]=cl[i*3+1]=cl[i*3+2]=v9;}
    bx9.setAttribute('color',new THREE.BufferAttribute(cl,3));
    const A=new THREE.InstancedMesh(bx9,new THREE.MeshBasicMaterial({vertexColors:true,fog:false,toneMapped:false}),N);
    const B=new THREE.InstancedMesh(new THREE.BoxGeometry(1.9,1.9,1.9),new THREE.MeshBasicMaterial({fog:false,toneMapped:false,transparent:true,opacity:.17,
      blending:THREE.AdditiveBlending,depthWrite:false}),N);
    A.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(N*3),3);
    B.instanceMatrix=A.instanceMatrix;B.instanceColor=A.instanceColor;  // le halo suit le cube : mêmes tampons
    A.count=B.count=0;A.frustumCulled=B.frustumCulled=false;B.renderOrder=2;g.add(A);g.add(B);
    GAR.feuC={A:A,B:B,n:0,p:new Float32Array(N*9),acc:0,m:new THREE.Matrix4(),z0:hd};
    for(let i=0;i<45;i++){F.t+=1/30;garFeuCubes(1/30);}}  // elles brûlent déjà à l'ouverture
   const lu=flat(blobTex,0,.04,hd-1.3,12.5,6,0,THREE.AdditiveBlending);lu.rotation.x=-Math.PI/2;lu.material.color.setHex(0xff5a14);lu.renderOrder=-1;GAR.feuLu=lu;}
  /* LE SOCLE DES MISSIONS (2026-09-30, sketch de Léo : « missions » sur un fût à droite de la caisse) : une colonne de fer cerclée de
     néon VERT (la couleur des défis), coiffée d'une cible qui tourne. Au sol, HORS du plateau (il ne tourne pas avec la caisse), côté
     porte, à 3,8 m du centre : la plus longue caisse (6 m) balaie 3,2 m. x < 0 = à DROITE de l'écran (la caméra regarde la porte, +Z).
     (le menu de Léo et son étiquette MISSIONS sont retirés : le socle reste caché). */
  {const n9=g.children.length,sx=-2.9,sz=2.5,vert=BA(0x5ee37a);
   cy(sx,.62,sz,.42,1.24,M.fer);cy(sx,1.27,sz,.47,.07,M.acier);cy(sx,.08,sz,.5,.16,M.acier);
   for(const y9 of [.34,.98])cy(sx,y9,sz,.435,.06,vert);                                   // deux cerclages néon
   const ci=new THREE.Group();ci.position.set(sx,1.78,sz);g.add(ci);GAR.misCible=ci;GAR.misPos=new THREE.Vector3(sx,2.28,sz);
   const tg=new THREE.TorusGeometry(.3,.035,6,28),tg2=new THREE.TorusGeometry(.15,.03,6,20);
   ci.add(new THREE.Mesh(tg,vert));ci.add(new THREE.Mesh(tg2,vert));
   const pt=new THREE.Mesh(new THREE.SphereGeometry(.05,8,6),vert);ci.add(pt);
   GAR.misSocle=g.children.slice(n9);GAR.misSocle.forEach(function(o){o.visible=false;});} // (2026-10-06, Léo : « l'ancien truc mission vert, à enlever ») : le BOUTON ROUGE prend sa place (voir atlBuild)

  // ===== LE PLATEAU TOURNANT : la caisse est une PIÈCE D'EXPOSITION, pas une bagnole garée =====
  // ⚠ le plateau a SES géométries : mettre le tore unité à l'échelle 8,8 gonflait aussi son tube —
  // on obtenait un beignet cyan de 3 m de large au lieu d'un liseré. Un anneau fin, ça se déclare.
  // ⚠ TOUT CE QUI TOURNE EST DANS UN GROUPE. Le disque, l'anneau et les douze plots étaient posés
  // à plat dans la scène : impossible de les faire tourner ensemble sans les bouger un par un.
  const pod=new THREE.Group();g.add(pod);GAR.pod=pod;
  const dis=new THREE.Mesh(new THREE.CylinderGeometry(4.4,4.52,GAR.POD,34),M.fer);dis.position.y=GAR.POD/2;pod.add(dis);
  const anneau=new THREE.Mesh(new THREE.TorusGeometry(4.42,.045,6,52),
    BA(0xf2deb4,{transparent:true,opacity:.5,blending:THREE.AdditiveBlending,depthWrite:false})); // (garage-lumiere) cyan → or pâle, plus discret
  anneau.rotation.x=-Math.PI/2;anneau.position.y=GAR.POD;pod.add(anneau);GAR.ring=anneau;
  for(let i=0;i<12;i++){const a=i/12*Math.PI*2,pl=new THREE.Mesh(CY8,M.acier);
    pl.position.set(Math.sin(a)*4.05,GAR.POD+.02,Math.cos(a)*4.05);pl.scale.set(.1,.035,.1);pod.add(pl);}
  // ===== LE SCANNER : c'est LUI qui fait passer une caisse pour une autre =====
  // ⚠ LE VRAI PROBLÈME N'EST PAS L'ANIMATION, C'EST LE REMPLACEMENT. Il n'y a qu'UNE caisse en
  // mémoire (`carGroup`) : changer de modèle, c'est `buildCar`, et ça se voit comme un clignement.
  // Le scanner est le rideau qui cache le changement d'acteur — pendant qu'il balaie, la caisse est
  // écrasée à zéro, reconstruite, puis redéployée. Zéro caisse en plus, zéro mémoire, et à l'écran
  // c'est une machine qui matérialise la suivante. (La solution « deux caisses et on permute »
  // coûterait un second jeu de matériaux et de géométries pour exactement le même effet.)
  const scanTex=cvT(64,64,(x,w,h)=>{const gr=x.createRadialGradient(32,32,0,32,32,32);
    gr.addColorStop(0,'rgba(255,240,215,0)');gr.addColorStop(.70,'rgba(255,222,170,.50)');
    gr.addColorStop(.93,'rgba(255,248,236,.95)');gr.addColorStop(1,'rgba(255,222,170,0)');
    x.fillStyle=gr;x.fillRect(0,0,64,64);});
  const scan=new THREE.Mesh(PL,new THREE.MeshBasicMaterial({map:scanTex,transparent:true,fog:false,
    depthWrite:false,blending:THREE.AdditiveBlending,opacity:0}));
  scan.rotation.x=-Math.PI/2;scan.scale.set(7.4,7.4,1);scan.visible=false;scan.renderOrder=2; // il ÉPOUSE le plateau : plus large, il éclairait le sol de l'atelier et on perdait le disque
  pod.add(scan);GAR.scan=scan;
  add9(PL,new THREE.MeshBasicMaterial({map:blobTex,color:0x0a1226,transparent:true,fog:false,depthWrite:false}),
       0,GAR.POD+.012,0,7.6,9.4,1).rotation.x=-Math.PI/2;               // l'ombre douce qui POSE la caisse — (vague 2) à l'ENCRE, comme toute ombre du jeu
  for(const sx of [-1,1])bx(sx*5.2,.005,1,.14,.01,17,M.jaune);          // lignes de baie
  for(const p of [[-7.4,-4.6,3.1],[6.8,5.2,2.4]])                        // flaques d'huile jamais essuyées
    add9(PL,new THREE.MeshBasicMaterial({map:oilTex,transparent:true,fog:false,depthWrite:false}),
         p[0],.008,p[1],p[2],p[2]*.8,1).rotation.x=-Math.PI/2;

  /* ===== LES MEUBLES DU NIVEAU DE LA CAISSE (2026-09-30, Sacha : « retravaille le garage, notamment les objets : il faut que tous les
     objets et les meubles soient du niveau de la voiture ») =====
     Les meubles étaient des cubes Lambert mis à l'échelle — pas un reflet, pas une arête, trois cents appels de dessin — posés à côté
     d'une caisse taillée au kit, en laque vernie qui renvoie le studio. Ils sont désormais construits avec LE MÊME KIT QUE LA CAISSE
     (`lpKit` : facettes franches, couleur dans les sommets ; `lpMat` : laque vernie, chrome, or, satiné, mat, verre ; `lpOmbre` : l'ombre
     cuite au pied) et au même degré de détail : l'établi en lamellé-collé avec ses blocs-tiroirs, la servante à tiroirs et barres de
     tirage, le compresseur à fonds bombés avec son moteur, sa pompe à ailettes, son carter de courroie et ses manomètres, deux V8
     (blocs, culasses, cache-culbuteurs laqués, collecteurs chromés, poulies, courroie, faisceau d'allumage), le palan hydraulique et sa
     chaîne maillon par maillon, le pont à deux poteaux en U, les pneus au vrai profil des roues de la gamme, les jantes à bâtons…
     · TOUT tient en UNE géométrie PAR MATIÈRE : ~6 appels de dessin pour tout le mobilier (contre ~300), et les programmes sont ceux de
       la caisse (même shader, mêmes réglages : zéro programme de plus au menu, rien à relier en course).
     · Les places ne bougent pas : les ancres des MISSIONS (compresseur, établi, pont, rack, distributeur) visent toujours leur meuble,
       rien de haut à moins de 8,3 m du centre, et le couloir de la caméra ne garde que du ras du sol (sous 50 cm).
     · `uG` (le plancher lumineux de lpMat) est relevé par famille : l'atelier est sombre, et une laque sans lui y sortait noire. */
  const MK=lpKit({
    R:{g:'p',c:0xd53c2f},B:{g:'p',c:0x2f6cb8},V:{g:'p',c:0x2f9e63},J:{g:'p',c:0xefb52a},O:{g:'p',c:0xe8721f},  // les laques franches
    N:{g:'p',c:0x1d2027},K:{g:'p',c:0x626b79},                                                           // laque noire, gris moteur
    C:{g:'c',c:0xe6e9ee},Or:{g:'o',c:0xffc24a},                                                          // chrome, laiton
    F:{g:'s',c:0x2c3445},A:{g:'s',c:0x8792a4},W:{g:'s',c:0x8a6237},W2:{g:'s',c:0xa3794a},E:{g:'s',c:0xd8d0bc},Wb:{g:'s',c:0xf2f0ea},
    P:{g:'m',c:0x1a1c21},D:{g:'m',c:0x101217},T:{g:'m',c:0xb08b5a},T2:{g:'m',c:0x9c7a4c},                // pneu, caoutchouc, carton
    G:{g:'g',c:0x1b3550},H:{g:'g',c:0x07080b}});                                                        // verre, huile
  const q9=new THREE.Quaternion(),e9=new THREE.Euler(),y9v=new THREE.Vector3(0,1,0),x9v=new THREE.Vector3(1,0,0),d9=new THREE.Vector3();
  // boîte chanfreinée (arêtes qui attrapent la lumière), cylindre, tour, tore, tube entre deux points, poutre entre deux points
  const cb=(k,w,h,d,x,y,z,rx,ry,rz,b)=>{b=b!=null?b:Math.min(.03,Math.min(w,h,d)*.2);
    MK.put(k,b<.004?new THREE.BoxGeometry(w,h,d):chanfreinGeo(w,h,d,b),x,y,z,rx,ry,rz);};
  const cl=(k,r,len,n,x,y,z,rx,ry,rz,r2)=>MK.put(k,new THREE.CylinderGeometry(r2!=null?r2:r,r,len,n||10),x,y,z,rx,ry,rz);
  const lt=(k,pts,n,x,y,z,rx,ry,rz)=>MK.put(k,new THREE.LatheGeometry(pts.map(p=>new THREE.Vector2(p[0],p[1])),n||16),x,y,z,rx,ry,rz);
  const to=(k,R,t,x,y,z,rx,ry,rz,ns,arc)=>MK.put(k,new THREE.TorusGeometry(R,t,ns||5,16,arc||Math.PI*2),x,y,z,rx,ry,rz);
  const seg=(k,r,a,b,n)=>{d9.set(b[0]-a[0],b[1]-a[1],b[2]-a[2]);const L9=d9.length();if(L9<1e-4)return;d9.divideScalar(L9);
    q9.setFromUnitVectors(y9v,d9);e9.setFromQuaternion(q9,'XYZ');
    MK.put(k,new THREE.CylinderGeometry(r,r,L9,n||6),(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2,e9.x,e9.y,e9.z);};
  const barre=(k,t,a,b,h)=>{d9.set(b[0]-a[0],b[1]-a[1],b[2]-a[2]);const L9=d9.length();if(L9<1e-4)return;d9.divideScalar(L9);
    q9.setFromUnitVectors(x9v,d9);e9.setFromQuaternion(q9,'XYZ');
    MK.put(k,chanfreinGeo(L9,h||t,t,Math.min(.02,t*.2)),(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2,e9.x,e9.y,e9.z);};
  /* LES PIÈCES QUI REVIENNENT. Le pneu a le profil des roues de la gamme (lpWheel : 16 pans, épaules chanfreinées) + deux rainures ;
     couché par défaut (axe y). La jante couchée : lèvre, fond sombre, bâtons, moyeu et écrou de laiton. */
  const pneu=(x,y,z,R,w,rx,ry,rz,lettre)=>{const h=w/2;
    lt('P',[[R*.6,h],[R*.6,-h],[R*.83,-h],[R*.97,-h*.8],[R,-h*.45],[R,h*.45],[R*.97,h*.8],[R*.83,h],[R*.6,h]],16,x,y,z,rx,ry,rz);
    for(const s of [-.18,.18])lt('D',[[R+.003,s*w-.012],[R+.003,s*w+.012]],16,x,y,z,rx,ry,rz);
    if(lettre)lt('J',[[R*.88,h+.003],[R*.72,h+.003]],16,x,y,z,rx,ry,rz);};          // flanc lettré jaune : des gommes de course
  const jante=(x,y,z,r,n)=>{
    lt('C',[[r,-.05],[r*1.05,-.04],[r*1.05,.04],[r,.05],[r*.92,.05]],18,x,y,z);
    lt('D',[[r*.92,.03],[r*.92,-.04],[0,-.04]],18,x,y,z);
    for(let s=0;s<n;s++){const a=s/n*Math.PI*2;cb('C',r*.13,.03,r*.78,x+Math.sin(a)*r*.46,y+.035,z+Math.cos(a)*r*.46,0,a,0,.006);}
    cl('C',r*.22,.07,12,x,y+.03,z);cl('Or',r*.08,.08,6,x,y+.045,z);};
  const clefM=(x,y,z,L)=>{cb('C',.045,L,.018,x,y,z,0,0,0,.006);to('C',.05,.016,x,y+L/2+.035,z,0,0,0,4);          // la clé mixte pendue : œil…
    cb('C',.028,.075,.018,x-.042,y-L/2-.025,z,0,0,0,.005);cb('C',.028,.075,.018,x+.042,y-L/2-.025,z,0,0,0,.005);cb('C',.12,.03,.018,x,y-L/2+.012,z,0,0,0,.005); // …et fourche
    cl('A',.007,.09,5,x,y+L/2+.035,z-.04,Math.PI/2);};
  /* LE V8 : vilebrequin selon x, la FAÇADE (poulies, courroie, ventilateur) tournée vers la salle (−x). Bloc et culasses gris,
     cache-culbuteurs en laque rouge à nervures chromées, filtre à air chromé, collecteurs chromés, faisceau d'allumage, carter, volant. */
  const moteur=(x,y,z)=>{const TH=.72,c9=Math.cos(TH),s9=Math.sin(TH);
    const BK=(s,lx,ly,lz)=>[x+lx,y+ly*c9-lz*s*s9,z+ly*s*s9+lz*c9];                   // repère d'une rangée (penchée de ±41°)
    cb('F',.86,.14,.42,x+.04,y-.33,z,0,0,0,.03);cb('F',.4,.06,.3,x+.12,y-.42,z,0,0,0,.02);   // le carter d'huile
    cb('K',1.0,.34,.56,x,y-.1,z,0,0,0,.03);                                            // le bas du bloc
    for(const s of [-1,1]){let p=BK(s,0,.2,0);cb('K',.94,.34,.3,p[0],p[1],p[2],s*TH,0,0,.025);            // la rangée
      p=BK(s,0,.4,0);cb('K',.96,.07,.32,p[0],p[1],p[2],s*TH,0,0,.015);                  // la culasse
      p=BK(s,0,.48,0);cb('R',.9,.1,.25,p[0],p[1],p[2],s*TH,0,0,.03);                    // le cache-culbuteurs
      for(const v of [-.07,0,.07]){p=BK(s,0,.535,v);cb('C',.78,.014,.02,p[0],p[1],p[2],s*TH,0,0,0);}
      p=BK(s,.3,.55,0);cl('Or',.035,.035,10,p[0],p[1],p[2],s*TH);                       // le bouchon
      for(let i=0;i<4;i++){const lx=-.33+i*.22;p=BK(s,lx,.3,s*.17);cl('D',.022,.08,6,p[0],p[1],p[2],s*TH+s*Math.PI/2);  // les antiparasites
        seg('R',.008,p,[x+.46,y+.62,z+s*.03]);                                          // le faisceau jusqu'à l'allumeur
        const q=BK(s,lx,.06,s*.16);seg('C',.028,q,[x+lx+.02,y-.12,z+s*.44]);}            // les primaires du collecteur
      seg('C',.045,[x-.42,y-.13,z+s*.44],[x+.36,y-.15,z+s*.44]);seg('C',.05,[x+.36,y-.15,z+s*.44],[x+.42,y-.38,z+s*.46]);}
    cb('K',.8,.14,.24,x,y+.42,z,0,0,0,.02);cb('A',.2,.1,.2,x,y+.53,z,0,0,0,.02);       // la pipe d'admission, le carbu
    lt('C',[[0,.58],[.21,.58],[.23,.6],[.23,.64],[.21,.66],[.12,.68],[0,.685]],20,x,y,z);  // le filtre à air chromé
    lt('R',[[.216,.6],[.216,.64]],20,x,y,z);cl('Or',.03,.03,6,x,y+.7,z);
    cb('K',.07,.42,.34,x-.53,y+.02,z,0,0,0,.02);                                       // le carter de distribution
    cl('C',.12,.05,16,x-.6,y-.14,z,0,0,Math.PI/2);cl('C',.08,.04,14,x-.61,y+.16,z,0,0,Math.PI/2);     // poulies : vilebrequin, pompe à eau
    cl('A',.1,.2,14,x-.46,y+.24,z-.3,0,0,Math.PI/2);cl('C',.05,.04,10,x-.6,y+.24,z-.3,0,0,Math.PI/2); // l'alternateur
    seg('D',.014,[x-.62,y-.26,z+.02],[x-.62,y+.1,z+.07]);seg('D',.014,[x-.62,y+.22,z-.06],[x-.62,y+.28,z-.26]);seg('D',.014,[x-.62,y-.2,z-.1],[x-.62,y+.2,z-.34]); // la courroie
    for(let i=0;i<4;i++)cb('N',.012,.3,.07,x-.66,y+.16,z,i*Math.PI/4+.3,0,0,.004);     // le ventilateur
    lt('A',[[.12,0],[.3,.07],[.3,.13],[0,.13]],16,x+.5,y-.08,z,0,0,-Math.PI/2);        // la cloche d'embrayage
    cl('N',.045,.16,10,x+.46,y+.54,z);lt('R',[[.07,.62],[.07,.66],[.03,.69],[0,.69]],10,x+.46,y,z);   // l'allumeur
    cl('O',.055,.14,12,x+.12,y-.24,z+.32,Math.PI/2);cl('A',.07,.24,10,x+.3,y-.24,z-.33,0,0,Math.PI/2);}; // filtre à huile, démarreur

  // ===== MUR DU FOND : l'établi, le panneau d'outils, l'étagère — le vrai bordel utile =====
  const zB=-hd+.9,pz=-hd+.26;
  // L'ÉTABLI : plateau en lamellé-collé (neuf lames de deux teintes), chant d'acier, pieds à vérins, deux blocs-tiroirs
  for(let i=0;i<9;i++)cb(i%2?'W':'W2',9.8,.1,.158,-3,.93,zB-.667+i*.1667,0,0,0,.018);
  cb('A',9.86,.13,.035,-3,.925,zB+.765,0,0,0,.008);cb('F',9.6,.08,.05,-3,.84,zB+.7);
  for(const px of [-7.7,-3,1.7])for(const s of [-.62,.62]){cb('F',.1,.8,.1,px,.46,zB+s,0,0,0,.012);cl('C',.018,.06,6,px,.04,zB+s);cl('D',.05,.02,10,px,.01,zB+s);}
  cb('A',5.4,.04,1.2,-2.9,.36,zB,0,0,0,.01);                                           // l'étagère basse
  for(const cx of [-6.35,.55]){cb('F',1.3,.76,1.1,cx,.45,zB+.05,0,0,0,.02);cb('D',1.26,.05,1.0,cx,.05,zB+.05,0,0,0,.005);
    for(let d=0;d<4;d++){const y9=.19+d*.18;cb('R',1.22,.155,.04,cx,y9,zB+.615,0,0,0,.012);
      cl('C',.011,.9,6,cx,y9+.035,zB+.66,0,0,Math.PI/2);for(const sx of [-.45,.45])cb('C',.02,.02,.04,cx+sx,y9+.035,zB+.645,0,0,0,0);
      cb('Wb',.12,.035,.005,cx-.47,y9-.03,zB+.637,0,0,0,0);}}
  
  cb('F',9.8,.14,.08,-3,1.06,zB-.73);                                                  // la lisse du fond
  cb('E',1.3,.08,.05,-.4,1.05,zB-.675,0,0,0,.01);for(let i=0;i<5;i++)cb('D',.07,.04,.01,-.9+i*.25,1.05,zB-.648,0,0,0,0);  // la multiprise
  // L'ÉTAU, mâchoires vers la salle
  {const vx=-6.3,vz=zB+.3;lt('B',[[.17,0],[.17,.05],[.14,.07],[0,.07]],14,vx,.98,vz);
   cb('B',.34,.18,.46,vx,1.14,vz+.05,0,0,0,.02);cb('B',.5,.2,.12,vx,1.32,vz-.15,0,0,0,.02);cb('B',.5,.2,.12,vx,1.32,vz+.13,0,0,0,.02);
   cb('A',.46,.12,.02,vx,1.36,vz-.08,0,0,0,.004);cb('A',.46,.12,.02,vx,1.36,vz+.06,0,0,0,.004);
   cl('C',.025,.3,8,vx,1.2,vz+.34,Math.PI/2);cl('C',.012,.46,6,vx,1.2,vz+.5,0,0,Math.PI/2);
   for(const sx of [-.23,.23])lt('C',[[0,-.03],[.028,-.02],[.03,0],[.028,.02],[0,.03]],8,vx+sx,1.2,vz+.5,0,0,Math.PI/2);
   cb('B',.18,.1,.2,vx,1.32,vz-.31,0,0,0,.02);cl('B',.07,.2,8,vx,1.32,vz-.5,-Math.PI/2,0,0,.012);}
  // LA CAISSE À OUTILS
  {const tx=-4.6,tz=zB+.05;cb('R',.74,.26,.4,tx,1.11,tz,0,0,0,.02);cb('R',.76,.08,.42,tx,1.285,tz,0,0,0,.02);cb('D',.745,.012,.405,tx,1.243,tz,0,0,0,0);
   cl('D',.018,.4,6,tx,1.41,tz,0,0,Math.PI/2);for(const sx of [-.22,.22]){cb('C',.03,.1,.04,tx+sx,1.36,tz,0,0,0,.005);cb('C',.05,.06,.02,tx+sx,1.23,tz+.215,0,0,0,.004);}
   cb('Or',.12,.05,.006,tx,1.14,tz+.203,0,0,0,0);}
  // LE POSTE qui gueule : haut-parleurs, cadran, poignée, antenne
  
  // les tasses de café froid, la paperasse, le chiffon, les clés qui traînent
  
  // LE PANNEAU PERFORÉ (texture) dans son cadre, et ses outils pendus
  flat(pegTex,-3,2.6,-hd+.18,9.6,2.6);
  cb('F',9.76,.08,.05,-3,3.94,-hd+.2,0,0,0,.01);cb('F',9.76,.08,.05,-3,1.26,-hd+.2,0,0,0,.01);
  for(const s of [-1,1])cb('F',.08,2.76,.05,-3+s*4.84,2.6,-hd+.2,0,0,0,.01);
  for(let i=0;i<7;i++)clefM(-7+i*.62,3.15,pz,.5+(i%3)*.1);                            // les clés mixtes
  cl('W',.028,.62,8,-2.2,3.1,pz);cl('D',.034,.22,8,-2.2,2.9,pz);                        // le marteau
  cb('A',.36,.1,.1,-2.2,3.46,pz,0,0,0,.02);cb('A',.12,.06,.09,-2.42,3.42,pz,0,0,.5,.01);
  for(let i=0;i<4;i++){const x9=-1.3+i*.42;                                             // les tournevis
    lt(['R','J','B','V'][i],[[0,0],[.03,.01],[.038,.06],[.036,.16],[.03,.2],[.018,.23],[0,.23]],8,x9,3.12,pz);
    cl('C',.009,.34,6,x9,2.95,pz);cl('C',.006,.03,4,x9,2.765,pz,0,0,0,.001);}
  MK.plate('A',[[.55,3.1],[1.55,3.16],[1.55,3.36],[.55,3.34]],.008,pz-.004);           // la scie
  cb('D',1.0,.012,.012,1.05,3.13,pz,0,0,.06,0);cb('W',.24,.3,.04,1.68,3.24,pz,0,0,0,.02);cb('D',.12,.12,.045,1.7,3.24,pz,0,0,0,0);
  for(let i=0;i<3;i++){const x9=2.4+i*.5;                                               // les pinces
    for(const s of [-1,1])cb('B',.035,.42,.018,x9+s*.04,3.18,pz,0,0,s*.1,.006);
    cb('C',.05,.16,.018,x9,3.47,pz,0,0,0,.006);cl('C',.02,.03,8,x9,3.38,pz,Math.PI/2);}
  // L'ÉTAGÈRE HAUTE sur équerres : bidons d'huile étiquetés, cartons scotchés
  
  GAR.neons.push(flat(neonTex('CASH CAR',0xffc46a,26),-2.4,5.35,-hd+.2,7.2,2.25,0,THREE.AdditiveBlending));
  GAR.neons.push(flat(neonTex('$',0xfff0d0,52),5.4,4.5,-hd+.2,1.9,1.9,0,THREE.AdditiveBlending));
  flat(postTex,6.9,2.9,-hd+.2,2.3,1.72);                                                // l'affiche, dans un cadre noir
  cb('N',2.42,.06,.04,6.9,3.79,-hd+.19,0,0,0,.01);cb('N',2.42,.06,.04,6.9,2.01,-hd+.19,0,0,0,.01);
  for(const s of [-1,1])cb('N',.06,1.84,.04,6.9+s*1.18,2.9,-hd+.19,0,0,0,.01);
  
  {const cx=8.9,cy9=3.3,cz=-hd+.2;                                                       // l'horloge
   lt('N',[[.42,0],[.42,.07],[.37,.08],[.36,.03]],24,cx,cy9,cz,Math.PI/2);lt('E',[[.36,.03],[0,.03]],24,cx,cy9,cz,Math.PI/2);
   for(let h=0;h<12;h++){const a=h/12*Math.PI*2;cb('D',.02,h%3?.04:.07,.01,cx+Math.sin(a)*.3,cy9+Math.cos(a)*.3,cz+.035,0,0,-a,0);}
   cb('D',.025,.2,.01,cx,cy9+.09,cz+.045,0,0,0,0);cb('D',.16,.02,.01,cx+.07,cy9,cz+.05,0,0,0,0);cl('R',.02,.02,8,cx,cy9,cz+.055,Math.PI/2);}

  // ===== MUR GAUCHE : pneus, servante, compresseur, cric, et tout ce qui roule =====
  for(const st of [[-9.6,-7.2,5],[-9.6,-5.1,4],[-9.4,7.4,6]]){                        // les piles de pneus, une jante sur chacune
    for(let i=0;i<st[2];i++)pneu(st[0]+(i%2?.04:-.03),.118+i*.236,st[1],.37,.235,0,i*.4,0,st[1]>0);
    jante(st[0],.236*st[2]+.05,st[1],.25,5);}
  // LA SERVANTE, façade vers la salle : cinq tiroirs à barres de tirage, tapis, poignée, roulettes
  {const sx=-9.4,sz=-1.6,fx=sx+.4;cb('R',.8,1.1,1.5,sx,.68,sz,0,0,0,.035);cb('F',.8,.08,1.5,sx,.09,sz,0,0,0,.01);
   let y9=.16;for(const h9 of [.3,.24,.18,.14,.12]){const yc=y9+h9/2;cb('R',.04,h9,1.4,fx+.01,yc,sz,0,0,0,.01);
     cl('C',.012,1.2,6,fx+.06,yc+h9/2-.04,sz,Math.PI/2);for(const s of [-.62,.62])cb('C',.04,.02,.02,fx+.045,yc+h9/2-.04,sz+s,0,0,0,0);y9+=h9+.012;}
   cb('Or',.006,.05,.3,fx+.035,1.14,sz+.45,0,0,0,0);cb('D',.82,.03,1.52,sx,1.245,sz,0,0,0,.008);
   for(const a of [-.3,.3])for(const b of [-.62,.62]){cb('A',.08,.05,.08,sx+a,.075,sz+b,0,0,0,.005);cl('D',.05,.04,10,sx+a,.05,sz+b,0,0,Math.PI/2);}
   cl('C',.018,.6,8,sx,1.0,sz-.86,0,0,Math.PI/2);for(const a of [-.26,.26])cl('C',.014,.12,6,sx+a,1.0,sz-.8,Math.PI/2);
   cb('N',.4,.07,.3,sx-.05,1.295,sz-.3,0,.2,0,.01);cb('C',.03,.02,.28,sx+.1,1.272,sz+.25,0,.5,0,.005);
   lt('B',[[0,0],[.045,0],[.045,.2],[.03,.23],[0,.23]],10,sx+.15,1.26,sz+.55);cl('Wb',.012,.03,6,sx+.15,1.505,sz+.55);}
  // LE COMPRESSEUR : réservoir à fonds bombés, moteur à ailettes, pompe bicylindre, carter de courroie, manomètres
  {const cx=-9.5,cz=2.6,ty=.74;
   lt('B',[[0,-.95],[.2,-.93],[.32,-.87],[.39,-.78],[.42,-.66],[.42,.66],[.39,.78],[.32,.87],[.2,.93],[0,.95]],20,cx,ty,cz,Math.PI/2);
   for(const s of [-1,1])lt('A',[[.424,s*.6-.02],[.432,s*.6],[.424,s*.6+.02]],20,cx,ty,cz,Math.PI/2);
   cb('Wb',.006,.18,.56,cx+.421,ty+.02,cz-.1,0,0,0,0);cb('J',.007,.04,.56,cx+.424,ty-.1,cz-.1,0,0,0,0);
   for(const s of [-.55,.55])cb('F',.5,.28,.14,cx,.18,cz+s,0,0,0,.02);
   for(const s of [-1,1])pneu(cx+s*.48,.17,cz+.72,.17,.08,0,0,Math.PI/2);
   cl('A',.02,1.0,6,cx,.17,cz+.72,0,0,Math.PI/2);cl('Or',.02,.07,6,cx,.3,cz);
   cb('F',.5,.04,.8,cx,1.18,cz-.2,0,0,0,.01);                                               // la platine
   lt('N',[[0,-.25],[.14,-.25],[.16,-.22],[.16,.22],[.14,.25],[0,.25]],16,cx+.02,1.36,cz-.35,Math.PI/2);
   for(let f=0;f<6;f++)lt('N',[[.172,-.19+f*.075],[.172,-.17+f*.075]],16,cx+.02,1.36,cz-.35,Math.PI/2);
   cb('A',.3,.14,.3,cx,1.25,cz+.35,0,0,0,.02);
   for(const s of [-.08,.08]){cl('A',.07,.24,10,cx+s,1.44,cz+.35);for(let f=0;f<5;f++)cl('A',.1,.012,10,cx+s,1.35+f*.045,cz+.35);cb('R',.13,.04,.13,cx+s,1.585,cz+.35,0,0,0,.01);}
   cb('R',.06,.3,.7,cx+.3,1.36,cz,0,0,0,.02);for(const s of [-.35,.35])cl('R',.15,.06,14,cx+.3,1.36,cz+s,0,0,Math.PI/2);
   for(let i=0;i<3;i++)cb('D',.004,.03,.42,cx+.332,1.28+i*.08,cz,0,0,0,0);                   // les ouïes du carter
   cb('Or',.08,.08,.26,cx+.26,1.22,cz+.82,0,0,0,.01);cl('Or',.015,.2,6,cx+.26,1.08,cz+.82);
   for(const s of [-.08,.08]){lt('C',[[.07,0],[.07,.03],[.062,.035]],16,cx+.3,1.24,cz+.82+s,0,0,-Math.PI/2);lt('Wb',[[.062,.032],[0,.032]],16,cx+.3,1.24,cz+.82+s,0,0,-Math.PI/2);
     cb('R',.004,.045,.006,cx+.335,1.255,cz+.82+s,0,0,0,0);}
   cl('C',.018,.7,8,cx,1.05,cz+1.02,0,0,Math.PI/2);for(const s of [-.33,.33])seg('C',.016,[cx+s,1.05,cz+1.02],[cx+s,.66,cz+.86]);}
  for(let i=0;i<5;i++)to('J',.4+i*.012,.026,-10.74+i*.045,2.5-i*.01,4.3,0,Math.PI/2,0,5);  // le tuyau d'air, enroulé au mur
  cb('F',.2,.14,.3,-10.9,2.96,4.3,0,0,0,.02);cb('F',.3,.05,.1,-10.78,2.92,4.3,0,0,0,.01);cl('Or',.025,.08,8,-10.5,2.18,4.62,0,0,.6);
  // LE CRIC ROULEUR
  
  {const ex=-10.62,ez=-4.5;cb('F',.08,.36,.2,-10.93,2.45,ez,0,0,0,.01);cb('F',.34,.04,.22,-10.72,2.1,ez,0,0,0,.01);   // l'extincteur
   lt('R',[[0,0],[.14,0],[.15,.02],[.15,.56],[.12,.64],[.05,.68],[0,.68]],16,ex,2.12,ez);lt('Wb',[[.153,.2],[.153,.42]],16,ex,2.12,ez);
   cl('C',.035,.08,8,ex,2.84,ez);cb('N',.2,.03,.05,ex+.03,2.91,ez,0,0,-.2,.005);cb('C',.16,.03,.04,ex+.02,2.86,ez,0,0,.15,.005);
   seg('D',.018,[ex-.04,2.86,ez],[ex-.16,2.6,ez+.12]);seg('D',.02,[ex-.16,2.6,ez+.12],[ex-.12,2.3,ez+.17]);cl('N',.03,.1,8,ex-.12,2.22,ez+.17);
   cb('R',.02,.34,.34,-10.97,3.25,ez,0,0,0,.01);cb('Wb',.022,.16,.1,-10.97,3.25,ez,0,0,0,0);}

  // ===== MUR DROIT : le palan, le moteur sur pied, le rack, le distributeur =====
  // LE PALAN HYDRAULIQUE : colonne au pied du mur, jambes vers la salle sous la charge, vérin, chaîne maillon par maillon, palonnier, un V8 pendu
  {const hz=-6.4,cx=9.3,tx=5.8;
   for(const s of [-1,1]){barre('O',.12,[cx,.1,hz+s*.35],[6.0,.1,hz+s*.85]);pneu(6.0,.07,hz+s*.85,.07,.05,0,0,Math.PI/2);cb('A',.06,.08,.12,6.0,.14,hz+s*.85,0,0,0,.005);
     pneu(cx+.1,.07,hz+s*.72,.07,.05,0,0,Math.PI/2);}
   barre('O',.12,[cx,.1,hz-.76],[cx,.1,hz+.76]);
   cb('O',.16,2.25,.16,cx,1.22,hz,0,0,0,.02);cl('C',.04,.24,8,cx,2.3,hz,Math.PI/2);
   barre('O',.14,[cx+.05,2.3,hz],[6.5,2.72,hz]);barre('A',.1,[6.7,2.69,hz],[tx-.04,2.83,hz]);
   seg('R',.07,[cx-.08,.75,hz],[8.5,1.75,hz],10);seg('C',.035,[8.5,1.75,hz],[7.76,2.46,hz],8);
   seg('C',.018,[cx-.12,.95,hz],[cx-.55,1.45,hz+.3]);seg('D',.026,[cx-.5,1.39,hz+.27],[cx-.62,1.53,hz+.35]);
   for(let i=0;i<14;i++)to('C',.03,.009,tx,2.76-i*.066,hz,0,i%2?Math.PI/2:0,0,4);          // la chaîne
   to('A',.06,.018,tx,1.8,hz,0,0,Math.PI,4,Math.PI*1.3);barre('A',.06,[tx-.42,1.72,hz],[tx+.42,1.72,hz]);
   for(const s of [-.36,.36])seg('C',.01,[tx+s,1.7,hz],[tx+s*.8,1.36,hz+(s>0?.3:-.3)]);
   moteur(tx,.9,hz);}
  // LE MOTEUR SUR PIED : pied en T à roulettes, colonne, bras et platine boulonnée derrière le volant
  {const mz=-2.2,mx=8.75;
   for(const s of [-1,1]){barre('R',.1,[9.8,.08,mz+s*.3],[8.0,.08,mz+s*.55]);pneu(8.0,.06,mz+s*.55,.06,.045,0,0,Math.PI/2);}
   barre('R',.1,[9.8,.08,mz-.45],[9.8,.08,mz+.45]);for(const s of [-1,1])pneu(9.8,.06,mz+s*.45,.06,.045,0,0,Math.PI/2);
   cb('R',.12,1.1,.12,9.75,.66,mz,0,0,0,.02);barre('R',.1,[9.75,1.2,mz],[9.4,1.2,mz]);
   cl('A',.2,.05,16,9.37,1.2,mz,0,0,Math.PI/2);for(let i=0;i<4;i++){const a=i/4*Math.PI*2+.4;cb('A',.03,.04,.14,9.33,1.2+Math.sin(a)*.12,mz+Math.cos(a)*.12,-a,0,0,.005);}
   moteur(mx,1.25,mz);}
  // LE RACK : montants bleus à croisillons, lisses orange, planchers d'acier — bacs, jantes, jerricans, cartons, un pneu
  {const rx0=9.6,rz0=3.4;
   for(const px of [-.68,.68])for(const s of [-2.1,2.1]){cb('B',.1,4.3,.1,rx0+px,2.15,rz0+s,0,0,0,.012);cb('F',.16,.02,.16,rx0+px,.01,rz0+s,0,0,0,0);}
   for(const s of [-2.1,2.1])for(let j=0;j<4;j++)barre('B',.035,[rx0-.66,.3+j*1.0,rz0+s],[rx0+.66,.8+j*1.0,rz0+s]);
   for(let i=0;i<4;i++){const y9=.5+i*1.15;for(const px of [-.7,.7])cb('O',.06,.12,4.3,rx0+px,y9,rz0,0,0,0,.012);
     cb('A',1.36,.025,4.2,rx0,y9+.055,rz0,0,0,0,.005);for(let k=0;k<6;k++)cb('F',1.36,.02,.03,rx0,y9+.03,rz0-1.8+k*.72,0,0,0,0);}
   
   for(let i=0;i<3;i++)jante(rx0,1.77+i*.1,rz0+1.2,.32,5);pneu(rx0,4.14,4.3,.37,.235,0,.3,0);}
  // LE DISTRIBUTEUR : caisse laquée, chapeau, cadre chromé de la vitrine, trappe, fente à pièces, pieds
  {const dx=10.3,dz=8.4,fx=9.85;
   cb('R',.9,1.94,1.5,dx,1.03,dz,0,0,0,.04);cb('N',.96,.16,1.56,dx,2.06,dz,0,0,0,.03);cb('D',.86,.06,1.44,dx,.03,dz,0,0,0,.01);
   for(const s of [-1,1])cb('C',.03,1.56,.04,fx-.01,1.15,dz+s*.62,0,0,0,.006);for(const y9 of [.39,1.91])cb('C',.03,.04,1.28,fx-.01,y9,dz,0,0,0,.006);
   cb('N',.05,.3,.74,fx-.005,.22,dz,0,0,0,.01);cb('D',.06,.12,.6,fx-.02,.2,dz,0,0,0,.006);cb('C',.02,.1,.06,fx-.01,.22,dz+.56,0,0,0,.004);
   cb('C',.012,.04,1.3,fx-.006,2.06,dz,0,0,0,0);}
  flat(vendTex,9.82,1.15,8.4,1.2,1.5,-Math.PI/2);
  
  for(let i=-1;i<=1;i++){cb('G',.06,1.3,2.6,hw-.16,4.6,i*4.4,0,0,0,0);                   // fenêtres hautes : verre, dormant, croisillons
    for(const s of [-1,1])cb('F',.08,1.42,.1,hw-.2,4.6,i*4.4+s*1.33,0,0,0,.01);for(const y9 of [3.93,5.27])cb('F',.08,.1,2.76,hw-.2,y9,i*4.4,0,0,0,.01);
    cb('F',.05,1.3,.05,hw-.19,4.6,i*4.4,0,0,0,0);cb('F',.05,.05,2.6,hw-.19,4.6,i*4.4,0,0,0,0);}
  

  // ===== LE PONT ÉLÉVATEUR : deux poteaux en U, chariots, quatre bras à tampons, traverse haute, groupe hydraulique =====
  {const lx=9.9,lz=-10.3;cb('F',.5,.04,3.0,lx,.02,lz,0,0,0,.01);
   for(const s of [-1,1]){const cz=lz+s*1.7;
     cb('J',.5,3.5,.12,lx,1.75,cz+s*.16,0,0,0,.02);for(const sx of [-.22,.22])cb('J',.08,3.5,.34,lx+sx,1.75,cz,0,0,0,.015);
     cb('F',.62,.08,.62,lx,.04,cz,0,0,0,.015);for(const a of [[-.24,.24],[.24,.24],[-.24,-.24],[.24,-.24]])cl('C',.022,.05,6,lx+a[0],.1,cz+a[1]);
     for(let k=0;k<5;k++)cb('N',.012,.05,.36,lx-.266,.3+k*.14,cz,.6,0,0,0);                  // les zébrures au pied
     cb('F',.36,.5,.3,lx,.95,cz,0,0,0,.02);seg('C',.01,[lx+.14,.7,cz-s*.08],[lx+.14,3.4,cz-s*.08]);
     for(const sx of [-1,1]){const tx=lx+sx*.95,tz=lz+s*.55;barre('J',.1,[lx+sx*.12,.8,cz],[tx,.8,tz]);
       lt('D',[[0,0],[.12,0],[.12,.05],[.1,.07],[0,.07]],12,tx,.85,tz);cl('A',.05,.08,8,tx,.82,tz);}
     cb('J',.14,.14,.14,lx,3.58,cz,0,0,0,.02);}
   barre('J',.16,[lx,3.62,lz-1.9],[lx,3.62,lz+1.9]);cb('F',.05,.06,3.2,lx-.1,3.46,lz,0,0,0,.01);
   cl('N',.1,.3,12,lx+.44,1.25,lz-1.7,Math.PI/2);cb('R',.18,.34,.22,lx+.44,.9,lz-1.7,0,0,0,.02);cl('Or',.03,.05,6,lx+.44,1.1,lz-1.7);}

  // ===== LE COULOIR DE LA CAMÉRA : que du RAS DU SOL =====
  // Entre le plateau (4,4 m) et les murs (8,5 m) s'étendait un désert de béton : la caméra passe
  // par là, on ne peut rien y poser de HAUT. Mais elle vole à 1 m minimum et regarde la caisse —
  // donc tout ce qui reste sous 50 cm est autorisé. C'est là que vit le vrai bazar d'un garage :
  // ce qu'on a posé par terre en se disant qu'on le rangerait plus tard.
  pneu(5.9,.118,3.3,.37,.235,0,0,0);jante(5.9,.285,3.3,.25,6);pneu(6.5,.118,2.62,.37,.235,0,.5,0);   // deux pneus, une jante posée dessus
  pneu(-5.4,.118,-5.6,.37,.235,0,.8,0);
  
  lt('F',[[.55,0],[.55,.02],[.5,.026],[0,.026]],20,-1.6,0,-6.4);for(let i=0;i<4;i++)cb('D',.8,.01,.07,-1.6,.03,-6.75+i*.23,0,0,0,0);  // la bouche d'égout
  
  // LE MOBILIER VERSÉ : une géométrie par matière, l'ombre cuite au pied (lpOmbre), le plancher lumineux relevé (uG)
  {const G9=MK.done(),GL={p:.22,c:.16,o:.2,s:.24,m:.16,g:.06};GAR.meubles=[];
   for(const f in G9){lpOmbre(G9[f],1.1);const mt=lpMat(f);if(mt.userData.uG)mt.userData.uG.value=GL[f]!=null?GL[f]:.2;
     /* le satiné et le mat de lpMat n'ont pas de cube d'environnement — une variante de programme que la CAISSE n'emploie pas (mesuré :
        141 programmes au menu contre 140). Ils prennent le cube (8 % de reflet sur le satiné, 0 sur le mat) : le programme de la caisse. */
     if(!mt.envMap){mt.envMap=envTex;mt.combine=THREE.MixOperation;mt.reflectivity=f==='s'?.08:0;}
     const me=new THREE.Mesh(G9[f],mt);me.matrixAutoUpdate=false;me.updateMatrix();g.add(me);GAR.meubles.push(me);}}
  /* LES MEUBLES POSÉS : une ombre douce à l'ENCRE sous chaque gros meuble (la recette de l'ombre de la caisse, blobTex) — sans elle,
     établi, servante, compresseur, rack flottaient sur l'époxy. Toutes dans UNE géométrie (un seul appel de dessin). */
  {const F9=[[-3,zB,9.8,1.5],[-9.4,-1.6,.8,1.5],[-9.5,2.6,.9,2.1],[-9.6,-7.2,.8,.8],[-9.6,-5.1,.8,.8],[-9.4,7.4,.8,.8],[-8.9,5.6,.7,.7],
     [-9.9,-9.4,1.2,1.0],[7.7,-6.4,3.4,1.8],[9.0,-2.2,1.9,1.2],[9.6,3.4,1.5,4.4],[10.3,8.4,.9,1.5],[-5.6,10.4,3.2,1.0],[9.9,-10.3,1.2,4.0],
     [-8.2,-5.4,.6,1.4],[-8.6,1.2,.5,1.5],[7.6,-4.2,.6,.6],[-8.16,9.2,1.3,.3]],P9=[],U9=[];
   for(const f of F9){if([[-8.9,5.6],[-9.9,-9.4],[-5.6,10.4],[-8.2,-5.4],[-8.6,1.2],[7.6,-4.2],[-8.16,9.2]].some(o=>o[0]===f[0]&&o[1]===f[1]))continue; // (l'atelier aéré) plus d'ombre sans meuble
     const w9=f[2]*1.5+.4,d9b=f[3]*1.5+.4,x0=f[0]-w9/2,x1=f[0]+w9/2,z0=f[1]-d9b/2,z1=f[1]+d9b/2;
     P9.push(x0,.009,z1, x1,.009,z1, x1,.009,z0, x0,.009,z1, x1,.009,z0, x0,.009,z0);U9.push(0,0,1,0,1,1,0,0,1,1,0,1);}
   const gA=new THREE.BufferGeometry();gA.setAttribute('position',new THREE.Float32BufferAttribute(P9,3));gA.setAttribute('uv',new THREE.Float32BufferAttribute(U9,2));
   const mA=new THREE.Mesh(gA,new THREE.MeshBasicMaterial({map:blobTex,color:0x0a1226,transparent:true,opacity:.72,fog:false,depthWrite:false}));mA.renderOrder=-1;g.add(mA);}
  // ===== LE PLAFOND QUI ÉCLAIRE : six tubes, leur cône de poussière, et la baladeuse =====
  // (2026-09-26, vague 2) les tubes à .62 de blanc (0xfff3d2 → 0x9e9682) et les cônes à .05 (.085) : plein blanc, les tubes passaient
  // au-dessus du seuil du bloom et BRÛLAIENT le haut de l'écran en taches laiteuses, et les six cônes additifs voilaient toute la moitié
  // haute d'un lait bleuté. Un tube allumé se lit à sa FORME (une barre nette sur un plafond noir), pas à son éblouissement.
  const tubeM=BA(0x9e9682),tubeF=BA(0x9e9682);
  // ⚠ CÔNES DE LUMIÈRE EN FrontSide, jamais DoubleSide : en tournant, la caméra ENTRE dans un cône
  // — en double face on se retrouvait derrière un voile blanc plein écran (la face arrière plus la
  // face avant, additionnées). En face avant seule, le cône DISPARAÎT dès qu'on est dedans, et il
  // reste franc vu de l'extérieur. Le voile, c'était ça.
  const haloM=new THREE.MeshBasicMaterial({color:0xffe7bb,transparent:true,opacity:.05,depthWrite:false,fog:false,
    blending:THREE.AdditiveBlending,side:THREE.FrontSide});
  const haloF=haloM.clone();
  for(const p of [[-3.4,-8.6],[3.4,-8.6],[-3.4,0],[3.4,0],[-3.4,8.6],[3.4,8.6]]){
    bx(p[0],5.52,p[1],1.0,.16,3.0,M.acier);
    const last=(p[0]>0&&p[1]>0);                                       // LE tube au mauvais starter
    const tb=add9(BX,last?tubeF:tubeM,p[0],5.38,p[1],.84,.11,2.8);
    const ha=add9(CN,last?haloF:haloM,p[0],3.2,p[1],3.9,4.4,3.9);
    GAR.tubes.push(tb);GAR.halos.push(ha);
    if(last)GAR.flick={t:tb,h:ha};}
  {const piv=new THREE.Group();piv.position.set(-4.6,H,-9.6);g.add(piv);GAR.drop=piv;   // LA BALADEUSE
   const cord=new THREE.Mesh(CY,M.noir);cord.scale.set(.03,2.4,.03);cord.position.y=-1.2;piv.add(cord);
   const ab=new THREE.Mesh(CN,M.acier);ab.scale.set(.66,.5,.66);ab.position.y=-2.55;piv.add(ab);
   const amp=new THREE.Mesh(CY8,BA(0xfff0c8));amp.scale.set(.22,.22,.22);amp.position.y=-2.72;piv.add(amp);
   const hh=new THREE.Mesh(CN,haloM);hh.scale.set(2.4,2.8,2.4);hh.position.y=-4.1;piv.add(hh);}
  for(let i=0;i<14;i++){                                                // fanions de course au-dessus de la porte
    const u=i/13,px=-9.5+u*19,py=5.25-Math.sin(u*Math.PI)*.5;
    const f=add9(PL,BA(([0xe9b94a,0xf4ead2,0xffffff,0xc99a3a])[i%4],{side:THREE.DoubleSide}) /* (garage-lumiere) la guirlande : or, crème, blanc */,px,py-.16,10.8,.28,.34,1);
    f.rotation.z=Math.PI/4;f.rotation.y=.4;}
  // POUSSIÈRE EN SUSPENSION : 110 points qui montent lentement dans les cônes. C'est le détail qui
  // fait passer un décor de « propre » à « habité » — et ça tient en un seul draw call.
  {const N=110,pos=new Float32Array(N*3),vel=new Float32Array(N);
   for(let i=0;i<N;i++){pos[i*3]=(Math.random()-.5)*W*.86;pos[i*3+1]=.3+Math.random()*(H-.9);pos[i*3+2]=(Math.random()-.5)*D*.86;vel[i]=.05+Math.random()*.14;}
   const gd=new THREE.BufferGeometry();gd.setAttribute('position',new THREE.BufferAttribute(pos,3));
   GAR.dust=new THREE.Points(gd,new THREE.PointsMaterial({color:0xffe4bb,size:.055,transparent:true,opacity:.5,
     depthWrite:false,fog:false,blending:THREE.AdditiveBlending}));
   g.add(GAR.dust);GAR.dustV=vel;}
  // ---- LES BLOCS D'IMPACT (2026-09-05) : quand on TAPE la caisse (clic bref, pas un glissé), elle
  // encaisse — dix petits cubes giclent, comme des tessons, avant de retomber. Un seul geste, deux
  // aveux : recul de la caisse (voir garageRender) + cette pluie de blocs. Créés UNE fois ici,
  // recyclés à chaque tap (voir `garageImpact`) — pas une allocation par clic.
  {const N=10,IB=new THREE.BoxGeometry(.09,.09,.09);GAR.impactMeshes=[];GAR.impactVel=[];
   for(let i=0;i<N;i++){
     const m=new THREE.Mesh(IB,BA([0xffd75e,0xff8a3d,0xffef9e][i%3]));
     m.visible=false;g.add(m);GAR.impactMeshes.push(m);GAR.impactVel.push({x:0,y:0,z:0,rx:0,ry:0});}
  }
  /* ===== L'ATELIER v2 — LA LUMIÈRE ET LA MATIÈRE (2026-09-30, Sacha : « améliore le modèle 3D du garage en le rendant plus beau ») =====
     Le garage est devenu le MENU : c'est la première image du jeu. Il était juste (tout y est) mais plat — un sol bleu nuit uni qui
     prenait la moitié basse de l'écran, des murs de la même couleur partout, un plafond noir, et le feu de la porte qui n'éclairait rien.
     Léo a demandé un atelier SOBRE : on n'ajoute pas de bazar, on travaille ce qui fait une belle image — la MATIÈRE et la LUMIÈRE.
     · le SOL devient un époxy sombre en grandes dalles, BRILLANT (Phong : les deux lampes qui suivent la caméra y courent en reflets), et
       il REFLÈTE la porte en feu : c'est la VRAIE texture du feu (même objet, zéro envoi de plus), à plat, en miroir, fondue vers la salle ;
     · le FEU ÉCLAIRE : trois nappes de lumière peintes (façade autour de l'ouverture, murs latéraux, plafond côté porte), additives, qui
       battent avec les flammes — « lumière cuite », aucune lumière ajoutée ;
     · la PORTE est un portail : liseré néon rose autour de l'ouverture, bandes de danger, deux gyrophares ambrés qui tournent ;
     · le PLAFOND a ses bandes LED sous les poutres : des lignes qui filent vers le feu ;
     · le PLATEAU est une pièce de showroom : dessus en acier brossé brillant, anneau de LED qui court, halo sous la caisse et au sol ;
     · des BRAISES sortent du feu et dérivent dans l'atelier.
     ⚠ Rien de haut dans l'anneau de la caméra (règle des 8,3 m) : tout est plaqué aux murs, au plafond ou au ras du sol. ⚠ Aucune
     lumière ajoutée. ⚠ Nappes additives en FrontSide (le voile blanc plein écran, voir les cônes des tubes). Tout est animé par garBeaute. */
  {const B9=GAR.beau={};
   const add=(o)=>{g.add(o);return o;};
   const nappe=(tex,col,x,y,z,w,h,op)=>{const m=add(new THREE.Mesh(PL,new THREE.MeshBasicMaterial({map:tex,color:col,transparent:true,opacity:op,
     fog:false,depthWrite:false,blending:THREE.AdditiveBlending})));m.position.set(x,y,z);m.scale.set(w,h,1);return m;};
   /* --- LE REFLET DU FEU : la VRAIE texture du rideau de flammes, au sol, en miroir. Un plan couché de 6 m ne marchait pas : vu de la
      caméra du menu (≈3 m de haut, ≈22 m de la porte), la perspective l'écrasait en un filet sous la porte. Un miroir, lui, montre le haut
      de la porte LOIN devant elle : le point de hauteur y se reflète à d·hc/(hc+y) de la caméra. Le ruban suit donc cette loi, rangée par
      rangée (24 rangées) — exact depuis le menu, un reflet traîné (le sol est brillant, pas un miroir) dès qu'on tourne. Couleurs de sommet
      = le fondu : fort au seuil, éteint vers la salle. */
   {const N=24,d0=22,hc=3,pos=[],uv=[],col=[],idx=[];
    for(let r=0;r<=N;r++){const v=r/N,y9=4.9*v,dz=d0-d0*hc/(hc+y9),f9=Math.pow(Math.max(0,1-v*1.6),2); // (Léo, « le reflet au sol ») fondu plus court : il s'éteint à 60 % de la hauteur
      for(const sx of [-1,1]){pos.push(sx*4.72,0,-dz);uv.push(sx<0?1:0,v);col.push(f9,f9,f9);}}
    for(let r=0;r<N;r++){const a=r*2;idx.push(a,a+1,a+2,a+1,a+3,a+2);}
    const gR=new THREE.BufferGeometry();gR.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));gR.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
    gR.setAttribute('color',new THREE.Float32BufferAttribute(col,3));gR.setIndex(idx);
    const rf=add(new THREE.Mesh(gR,new THREE.MeshBasicMaterial({map:GAR.feu.tex,vertexColors:true,color:0xb8b8b8,transparent:true,opacity:.5,fog:false,depthWrite:false,
      blending:THREE.AdditiveBlending,toneMapped:false,side:THREE.DoubleSide})));
    rf.position.set(0,.014,hd);rf.renderOrder=-1;B9.reflet=rf;}
   // --- LES NAPPES DU FEU : la façade autour de l'ouverture, les deux murs, le plafond côté porte
   const facTex=cvT(256,72,(x,w,h)=>{ // l'ouverture fait 9,6 × 4,7 m dans une façade de 22,6 × 6,2 : trou au centre-bas
     const ox=w*(9.6/22.6)/2,oy=h*(4.7/6.2);
     const gr=x.createRadialGradient(w/2,h,ox*.6,w/2,h,w*.48);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.35,'rgba(255,255,255,.45)');gr.addColorStop(1,'rgba(255,255,255,0)');
     x.fillStyle=gr;x.fillRect(0,0,w,h);
     x.globalCompositeOperation='destination-out';x.fillStyle='#000';x.fillRect(w/2-ox,h-oy,ox*2,oy);});
   B9.fac=nappe(facTex,0xb23f11,0,3.1,hd-.02,22.6,6.2,.5);B9.fac.rotation.y=Math.PI;
   const murTex=cvT(128,32,(x,w,h)=>{const gr=x.createLinearGradient(0,0,w,0);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(.7,'rgba(255,255,255,.35)');gr.addColorStop(1,'rgba(255,255,255,1)');
     x.fillStyle=gr;x.fillRect(0,0,w,h);x.globalCompositeOperation='destination-in';
     const gv=x.createLinearGradient(0,0,0,h);gv.addColorStop(0,'rgba(0,0,0,.25)');gv.addColorStop(.6,'rgba(0,0,0,1)');gv.addColorStop(1,'rgba(0,0,0,.7)');x.fillStyle=gv;x.fillRect(0,0,w,h);});
   B9.murG=nappe(murTex,0xb23f11,hw-.02,3.1,hd-6,12,6.2,.42);B9.murG.rotation.y=-Math.PI/2;              // x > 0 : u croît vers la porte
   B9.murD=nappe(murTex,0xb23f11,-hw+.02,3.1,hd-6,-12,6.2,.42);B9.murD.rotation.y=Math.PI/2;             // (miroir : échelle négative)
   const plaTex=cvT(64,128,(x,w,h)=>{const gr=x.createLinearGradient(0,h,0,0);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(1,'rgba(255,255,255,1)');
     x.fillStyle=gr;x.fillRect(0,0,w,h);x.globalCompositeOperation='destination-in';const gh=x.createLinearGradient(0,0,w,0);
     gh.addColorStop(0,'rgba(0,0,0,0)');gh.addColorStop(.3,'rgba(0,0,0,1)');gh.addColorStop(.7,'rgba(0,0,0,1)');gh.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=gh;x.fillRect(0,0,w,h);});
   B9.plaf=nappe(plaTex,0xb23f11,0,H-.02,hd-6,W-1,12,.16);B9.plaf.rotation.x=Math.PI/2;
   // --- LE PORTAIL : liseré néon rose autour de l'ouverture (un cœur blanc, un halo rose — le bloom finit le travail)
   const neoTex=cvT(32,4,(x,w,h)=>{const gr=x.createLinearGradient(0,0,w,0);
     gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(.36,'rgba(255,176,90,.55)');gr.addColorStop(.5,'rgba(255,248,236,1)');gr.addColorStop(.64,'rgba(255,176,90,.55)');gr.addColorStop(1,'rgba(255,255,255,0)');
     x.fillStyle=gr;x.fillRect(0,0,w,h);});
   B9.neons=[];
   for(const sx of [-1,1]){const m=nappe(neoTex,0xffffff,sx*4.64,2.32,hd-.33,.46,4.62,.95);m.rotation.y=Math.PI;B9.neons.push(m);}
   {const m=nappe(neoTex,0xffffff,0,4.62,hd-.33,.46,9.28,.95);m.rotation.set(0,Math.PI,Math.PI/2);B9.neons.push(m);}
   // les bandes de danger de part et d'autre de l'ouverture (peintes, éclairées : elles ne brillent pas, elles SE LISENT)
   const danTex=cvT(32,32,(x,w,h)=>{x.fillStyle='#e8ae1c';x.fillRect(0,0,w,h);x.fillStyle='#12151c';
     for(let i=-1;i<3;i++){x.beginPath();x.moveTo(i*16,h);x.lineTo(i*16+8,h);x.lineTo(i*16+8+h,0);x.lineTo(i*16+h,0);x.fill();}});
   danTex.wrapS=danTex.wrapT=THREE.RepeatWrapping;danTex.repeat.set(1,11);
   const danM=L(0xffffff,0x1a1204,{map:danTex});
   for(const sx of [-1,1]){const m=add(new THREE.Mesh(PL,danM));m.position.set(sx*5.15,2.36,hd-.015);m.scale.set(.36,4.7,1);m.rotation.y=Math.PI;}
   // les deux GYROPHARES ambrés, en haut de l'ouverture : un socle, un dôme, et le halo qui tourne (un sprite qui bat)
   B9.gyro=[];
   for(const sx of [-1,1]){bx(sx*5.3,4.9,hd-.24,.26,.12,.26,M.fer);
     cy(sx*5.3,5.03,hd-.24,.1,.16,BA(0xffb22e));
     const sp=add(new THREE.Sprite(new THREE.SpriteMaterial({map:lampTex,color:0xffa218,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,fog:false})));
     sp.position.set(sx*5.3,5.04,hd-.34);sp.scale.set(2.2,1.3,1);B9.gyro.push({s:sp,ph:sx>0?0:Math.PI*.85});}
   // --- LE PLAFOND : une bande LED sous chaque poutre, et deux qui filent le long des gaines vers le feu
   const ledM=BA(0xfff0dc); // (garage-lumiere) blanc chaud
   for(let i=-2;i<=2;i++)bx(0,H-.86,i*5.4,W-1.4,.035,.1,ledM);
   for(const px of [-3.4,3.4])bx(px,H-1.12,0,.05,.035,D-2,ledM);
   // --- LE PLATEAU DE SHOWROOM : le dessus en acier brossé brillant (le côté et le dessous gardent le fer)
   const podTex=cvT(512,512,(x,w,h)=>{x.fillStyle='#1b2130';x.fillRect(0,0,w,h);
     for(let r=8;r<256;r+=3){x.strokeStyle='rgba('+(Math.random()<.5?'0,0,0,':'170,190,230,')+(Math.random()*.08).toFixed(3)+')';x.lineWidth=1.5;x.beginPath();x.arc(256,256,r,0,7);x.stroke();} // le brossé
     x.strokeStyle='rgba(120,150,210,.08)';x.lineWidth=2;for(let i=0;i<16;i++){const a=i/16*Math.PI*2;x.beginPath();x.moveTo(256+Math.cos(a)*70,256+Math.sin(a)*70);x.lineTo(256+Math.cos(a)*238,256+Math.sin(a)*238);x.stroke();}
     for(const r of [70,150,238]){x.strokeStyle='rgba(0,0,0,.55)';x.lineWidth=4;x.beginPath();x.arc(256,256,r,0,7);x.stroke();
       x.strokeStyle='rgba(160,190,240,.22)';x.lineWidth=1.5;x.beginPath();x.arc(256,256,r+3,0,7);x.stroke();}});
   dis.material=[M.fer,new THREE.MeshPhongMaterial({color:0xffffff,map:podTex,specular:0x252c3c,shininess:30,emissive:0x05070c,fog:false}),M.fer];
   // l'anneau de LED qui COURT : deux comètes de tirets, qui tournent plus vite que le plateau (voir garBeaute)
   const ledTex=cvT(512,512,(x,w,h)=>{const N=72,r0=256*4.18/4.42,r1=256*4.36/4.42;x.lineCap='butt';
     for(let i=0;i<N;i++){const a=i/N*Math.PI*2,q=(i%(N/2))/(N/2),v=.1+.9*Math.pow(1-q,2.2);
       x.strokeStyle='rgba(255,255,255,'+v.toFixed(3)+')';x.lineWidth=r1-r0;x.beginPath();x.arc(256,256,(r0+r1)/2,a,a+Math.PI*2/N*.62);x.stroke();}});
   const ledRing=new THREE.Mesh(new THREE.RingGeometry(4.12,4.42,96,1),new THREE.MeshBasicMaterial({map:ledTex,color:0xfff0d2,transparent:true,opacity:.9,
     fog:false,depthWrite:false,blending:THREE.AdditiveBlending}));
   ledRing.rotation.x=-Math.PI/2;ledRing.position.y=GAR.POD+.006;g.add(ledRing);B9.led=ledRing; // hors du plateau : il tourne À SA vitesse
   // le halo SOUS la caisse (sur le plateau) et le halo du plateau AU SOL
   const haloTex=cvT(128,128,x=>{const gr=x.createRadialGradient(64,64,0,64,64,63);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(.55,'rgba(255,255,255,.35)');
     gr.addColorStop(.8,'rgba(255,255,255,.9)');gr.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=gr;x.fillRect(0,0,128,128);});
   B9.sous=nappe(haloTex,0xffd9a6,0,GAR.POD+.009,0,7.4,7.4,.22);B9.sous.rotation.x=-Math.PI/2;B9.sous.renderOrder=1;
   const solHaloTex=cvT(256,256,x=>{const gr=x.createRadialGradient(128,128,0,128,128,127);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(.66,'rgba(255,255,255,0)');
     gr.addColorStop(.72,'rgba(255,255,255,.8)');gr.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=gr;x.fillRect(0,0,256,256);});
   /* --- (2026-10-05, Léo : « travaille plus le rendu ») L'OMBRE AU PIED DES MURS : les murs tombaient sur l'époxy sans un pli de lumière,
      la pièce se lisait comme un décor de carton. Une bande d'encre de 2,2 m qui s'estompe vers la salle, le long des trois murs et des deux
      pans de la façade (pas devant l'ouverture : le reflet du feu y vit) ; les coins, doublés, sont plus sombres — comme en vrai. Une
      géométrie, une matière, aucune lumière. */
   {const aoTex=cvT(8,64,(x,w,h)=>{const gr=x.createLinearGradient(0,0,0,h);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.3,'rgba(255,255,255,.5)');
      gr.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=gr;x.fillRect(0,0,w,h);});
    const mAO=new THREE.MeshBasicMaterial({map:aoTex,color:0x050a18,transparent:true,opacity:.62,fog:false,depthWrite:false}),L9=2.2,o9=hw-4.8;
    for(const b of [[0,-hd+L9/2,W,0],[-hw+L9/2,0,D,Math.PI/2],[hw-L9/2,0,D,-Math.PI/2],[-(4.8+o9/2),hd-L9/2,o9,Math.PI],[4.8+o9/2,hd-L9/2,o9,Math.PI]]){
      const m=add(new THREE.Mesh(PL,mAO));m.rotation.set(-Math.PI/2,b[3],0,'YXZ');m.position.set(b[0],.012,b[1]);m.scale.set(b[2],L9,1);m.renderOrder=-1;}}
   B9.solHalo=nappe(solHaloTex,0xb4c0d6,0,.016,0,13,13,.3);B9.solHalo.rotation.x=-Math.PI/2;B9.solHalo.renderOrder=-1;
   // --- LES BRAISES : 64 étincelles qui sortent du feu, montent, dérivent dans l'atelier et s'éteignent (un seul appel de dessin)
   {const N=64,pos=new Float32Array(N*3),v=new Float32Array(N*4);
    for(let i=0;i<N;i++){pos[i*3+1]=-50;v[i*4+3]=Math.random()*3;} // (au départ hors de vue ; elles naissent au fil des secondes)
    const gb=new THREE.BufferGeometry();gb.setAttribute('position',new THREE.BufferAttribute(pos,3));
    B9.braises=add(new THREE.Points(gb,new THREE.PointsMaterial({color:0xff9a3c,size:.075,transparent:true,opacity:.85,depthWrite:false,fog:false,blending:THREE.AdditiveBlending})));
    B9.braises.frustumCulled=false;B9.bv=v;}
  }
  try{buildAffiches(g);}catch(e){console.warn('affiches',e);}
  try{garArgent(g);}catch(e){console.warn('argent',e);} // (2026-10-01) les TAS DE BILLETS : le compte se voit dans l'atelier (voir « L'ARGENT DE L'ATELIER »)
  try{gmHoloBuild(g);}catch(e){console.warn('missions',e);} // (2026-09-30) les hologrammes des MISSIONS (invisibles hors de leur écran) // (2026-09-30) LES AFFICHES DE RECORDS, de part et d'autre de la porte
  return g;
}
