/* ===== LES LIVRÉES (2026-11-05, Sacha : « améliore les peintures épiques, refonte totale, fais des trucs cool que les gens veulent avoir, inspire-toi des rallyes, de la F1, de la pop culture, fais-en plus et mieux ») =====
   Les épiques d'avant étaient des TOILES QUI SE RÉPÈTENT (papier peint). Une livrée de rallye ou de F1, c'est autre chose : une COMPOSITION posée sur la
   caisse — la bande qui court du capot au coffre, le rond du numéro sur chaque porte, la boue qui monte du bas de caisse, le damier du nez.
   Le moteur : une livrée (`liv:1` dans MOTIFS) a TROIS toiles dessinées au canvas, NON répétées, tendues sur les dimensions de la caisse
   (MOT_SPEC = la fiche de la caisse en cours de construction, posée en tête de buildCar) :
     · S  1024 × 512 : les flancs — moitié haute = le flanc +x, moitié basse = le flanc −x ; chacun se lit À L'ENDROIT depuis l'extérieur, et le dessin
                       se pose par rapport à la CAISSE (le numéro est au même endroit des deux côtés : `g.X` retourne la position pour le flanc inverse) ;
     · T  256 × 512  : le dessus, vu d'en haut, le nez en haut ;
     · F  256 × 256  : le nez (moitié haute) et la poupe (moitié basse), vus de face.
   Le shader (LIV_GLSL) prend la toile du plan qui fait face à chaque pan (même pondération ^10 que les motifs), dans le repère de la caisse : la livrée colle
   à la tôle quand elle roule. Aucune tuile, aucune répétition. Léger : trois lectures de toile, pas de calcul.
   Une livrée (livDeclare) = { c:teinte de repli, base:fond, bg:[haut,bas] du cadre de la pastille, fl:flanc(g), ds:dessus(g), fa:nez-et-poupe(g,arriere) }.
   `g` est le crayon (livCrayon) : tout se dit en coordonnées de 0 à 1 — pour le flanc, a = de 0 (le nez) à 1 (la poupe), b = de 0 (le toit) à 1 (le bas de
   caisse) ; pour le dessus, a = de gauche à droite, b = du nez (0) à la poupe (1) ; pour la face, a = de gauche à droite, b = du haut au bas.
   La PASTILLE des listes (livVignette) est une petite scène : la caisse de profil, dans sa livrée, sur un cadre de nuit — la carte montre la livrée portée.
   ⚠ Aucune vraie marque, aucun vrai logo : des clins d'œil (les noms, les couleurs, les numéros), comme les stickers.
   ⚠ Un id = 2 à 12 LETTRES, et ne se renomme jamais (la sauvegarde). Les ids retirés (damier, ecailles…) restent interdits. */
const LIV_TX={};
function livGraine(id){let h=7;for(let i=0;i<id.length;i++)h=Math.imul(h^id.charCodeAt(i),16777619);return h;}
/* le CRAYON d'une zone : le contexte est déjà translaté et rogné sur sa zone ; tout se dit en 0..1, `u` = le petit côté (px) */
function livCrayon(x,W,H,flip,R){
  const u=Math.min(W,H),g={x:x,W:W,H:H,u:u,R:R,flip:flip};
  g.X=function(a){return (flip?1-a:a)*W;};
  g.rect=function(a0,b0,a1,b1,c){const p=g.X(a0),q=g.X(a1);x.fillStyle=c;x.fillRect(Math.min(p,q),b0*H,Math.abs(q-p),(b1-b0)*H);return g;};
  g.grad=function(a0,b0,a1,b1,c0,c1){const p=g.X(a0),q=g.X(a1),gr=x.createLinearGradient(0,b0*H,0,b1*H);gr.addColorStop(0,c0);gr.addColorStop(1,c1);x.fillStyle=gr;x.fillRect(Math.min(p,q),b0*H,Math.abs(q-p),(b1-b0)*H);return g;};
  g.poly=function(P,c,lw,sc){x.beginPath();P.forEach(function(q,i){const X=g.X(q[0]),Y=q[1]*H;if(i)x.lineTo(X,Y);else x.moveTo(X,Y);});x.closePath();
    if(c){x.fillStyle=c;x.fill();}if(lw){x.lineWidth=lw*u;x.lineJoin='round';x.strokeStyle=sc;x.stroke();}return g;};
  g.ligne=function(P,lw,c){x.beginPath();P.forEach(function(q,i){const X=g.X(q[0]),Y=q[1]*H;if(i)x.lineTo(X,Y);else x.moveTo(X,Y);});x.lineWidth=lw*u;x.lineCap='round';x.lineJoin='round';x.strokeStyle=c;x.stroke();return g;};
  g.disc=function(a,b,r,c,lw,sc){x.beginPath();x.arc(g.X(a),b*H,r*u,0,6.2832);if(c){x.fillStyle=c;x.fill();}if(lw){x.lineWidth=lw*u;x.strokeStyle=sc;x.stroke();}return g;};
  g.txt=function(s,a,b,sz,c,o){o=o||{};x.save();x.translate(g.X(a),b*H);if(o.rot)x.rotate(o.rot*(flip?-1:1));if(o.sk)x.transform(1,0,-o.sk,1,0,0); /* l'italique penche toujours vers la droite : le texte, lui, n'est jamais retourné */
    x.font=(o.font||'900 ')+Math.round(sz*u)+'px '+(o.fam||'"Arial Black",Impact,sans-serif');x.textAlign=o.al||'center';x.textBaseline='middle';x.lineJoin='round';
    if(x.letterSpacing!==undefined)x.letterSpacing=(o.ls||0)*u+'px';
    if(o.st){x.lineWidth=(o.lw||.05)*u;x.strokeStyle=o.st;x.strokeText(s,0,0);}x.fillStyle=c;x.fillText(s,0,0);x.restore();return g;};
  g.etoile=function(a,b,r,c){x.save();x.translate(g.X(a),b*H);x.beginPath();for(let k=0;k<8;k++){const rr=k&1?r*u*.22:r*u;x.lineTo(Math.cos(k*.7854-1.5708)*rr,Math.sin(k*.7854-1.5708)*rr);}x.closePath();x.fillStyle=c;x.fill();x.restore();return g;};
  g.coeur=function(a,b,r,c){x.save();x.translate(g.X(a),b*H);x.scale(r*u/40,r*u/40);x.beginPath();x.moveTo(0,30);x.bezierCurveTo(-46,0,-30,-38,0,-16);x.bezierCurveTo(30,-38,46,0,0,30);x.closePath();x.fillStyle=c;x.fill();x.restore();return g;};
  /* la boue qui monte du bas de caisse : un dégradé, puis des éclaboussures qui s'espacent vers le haut — rgb = [r,v,b] */
  g.boue=function(rgb,h,n,al){const c='rgba('+rgb[0]+','+rgb[1]+','+rgb[2]+',',gr=x.createLinearGradient(0,H,0,H*(1-h));gr.addColorStop(0,c+(al||.85)+')');gr.addColorStop(1,c+'0)');x.fillStyle=gr;x.fillRect(0,H*(1-h),W,H*h);
    for(let i=0;i<n;i++){const t=Math.pow(R(),2.2),X=R()*W,Y=H*(1-h*1.15*t),r=u*(.004+R()*.016)*(1.1-t*.6);x.beginPath();x.ellipse(X,Y,r,r*(.7+R()*.6),R()*3,0,6.2832);x.fillStyle=c+(.25+R()*.55).toFixed(2)+')';x.fill();}return g;};
  g.brosse=function(n,al){for(let i=0;i<n;i++){const Y=R()*H,X=R()*W,L=W*(.08+R()*.4);x.fillStyle=(R()<.5?'rgba(255,255,255,':'rgba(40,46,56,')+(al*R()).toFixed(3)+')';x.fillRect(X,Y,L,1+R()*.8);}return g;};
  g.paillettes=function(c,n,al){for(let i=0;i<n;i++){x.fillStyle='rgba('+c+','+(al*(.3+.7*R())).toFixed(2)+')';x.fillRect(R()*W,R()*H,1.3,1.3);}return g;};
  /* un damier qui ondule (le drapeau) : nx × ny cases dans le rectangle, la bande monte et descend d'amp (en b) */
  g.damier=function(a0,b0,a1,b1,nx,ny,c1,c2,amp,ph){for(let i=0;i<nx;i++)for(let j=0;j<ny;j++){const A0=a0+(a1-a0)*i/nx,A1=a0+(a1-a0)*(i+1)/nx,o0=(amp||0)*Math.sin((i/nx*2+(ph||0))*3.1416),o1=(amp||0)*Math.sin(((i+1)/nx*2+(ph||0))*3.1416),
      B0=b0+(b1-b0)*j/ny,B1=b0+(b1-b0)*(j+1)/ny;g.poly([[A0,B0+o0],[A1,B0+o1],[A1,B1+o1],[A0,B1+o0]],(i+j)&1?c2:c1);}return g;};
  /* les pixels (BLOC D'HERBE) : une grille de cases de taille p (fraction de u) tirées dans une palette */
  g.pix=function(a0,b0,a1,b1,p,pal){const P=p*u,X0=Math.min(g.X(a0),g.X(a1)),X1=Math.max(g.X(a0),g.X(a1)),Y0=b0*H,Y1=b1*H;for(let X=X0;X<X1;X+=P)for(let Y=Y0;Y<Y1;Y+=P){x.fillStyle=pal[(R()*pal.length)|0];x.fillRect(X,Y,P+.6,P+.6);}return g;};
  g.hazard=function(a0,b0,a1,b1,n,c1,c2,sl){const p=g.X(a0),q=g.X(a1),X0=Math.min(p,q),X1=Math.max(p,q),Y0=b0*H,Y1=b1*H,w=(X1-X0)/n;x.save();x.beginPath();x.rect(X0,Y0,X1-X0,Y1-Y0);x.clip();x.fillStyle=c1;x.fillRect(X0,Y0,X1-X0,Y1-Y0);
    x.fillStyle=c2;for(let i=-2;i<n+2;i++){const s=(sl==null?.6:sl)*(Y1-Y0)*(flip?-1:1);x.beginPath();x.moveTo(X0+i*w,Y1);x.lineTo(X0+i*w+w/2,Y1);x.lineTo(X0+i*w+w/2+s,Y0);x.lineTo(X0+i*w+s,Y0);x.closePath();x.fill();}x.restore();return g;};
  /* une boîte centrée (a, b), de w × h en unités de u, coins ronds r (un bouton, une plaque) */
  g.box=function(a,b,w,h,c,r){const X=g.X(a),Y=b*H,W2=w*u,H2=h*u;x.beginPath();if(r){const q=Math.min(r*u,W2/2,H2/2);x.moveTo(X-W2/2+q,Y-H2/2);x.arcTo(X+W2/2,Y-H2/2,X+W2/2,Y+H2/2,q);x.arcTo(X+W2/2,Y+H2/2,X-W2/2,Y+H2/2,q);x.arcTo(X-W2/2,Y+H2/2,X-W2/2,Y-H2/2,q);x.arcTo(X-W2/2,Y-H2/2,X+W2/2,Y-H2/2,q);x.closePath();}else x.rect(X-W2/2,Y-H2/2,W2,H2);x.fillStyle=c;x.fill();return g;};
  /* un triangle d'avertissement (pointe en haut), côté s (u) */
  g.tri=function(a,b,s,c,lw,sc){const X=g.X(a),Y=b*H,q=s*u;x.beginPath();x.moveTo(X,Y-q*.58);x.lineTo(X+q*.5,Y+q*.29);x.lineTo(X-q*.5,Y+q*.29);x.closePath();x.lineJoin='round';if(c){x.fillStyle=c;x.fill();}if(lw){x.lineWidth=lw*u;x.strokeStyle=sc;x.stroke();}return g;};
  /* un petit fantôme (dôme, bas ondulé, deux yeux), rayon r (u) */
  g.fantome=function(a,b,r,c,sc){x.save();x.translate(g.X(a),b*H);x.scale(r*u,r*u);x.beginPath();x.moveTo(-1,.9);x.lineTo(-1,-.1);x.arc(0,-.1,1,Math.PI,0);x.lineTo(1,.9);
    for(let k=0;k<3;k++){const x1=1-(k*2+1)/3,x2=1-(k*2+2)/3;x.quadraticCurveTo(x1+.17,.58,x2,.9);}x.closePath();x.fillStyle=c;x.fill();x.lineWidth=.12;x.lineJoin='round';x.strokeStyle=sc;x.stroke();
    x.fillStyle=sc;x.beginPath();x.ellipse(-.36,-.18,.17,.26,0,0,6.2832);x.ellipse(.36,-.18,.17,.26,0,0,6.2832);x.fill();x.beginPath();x.ellipse(0,.3,.2,.14,0,0,6.2832);x.fill();x.restore();return g;};
  return g;}
/* les trois toiles d'une livrée, au zoom z (1 = pleine, .5 = la pastille ou un téléphone) */
function livToiles(id,z){const M=MOTIFS[id],R=motAlea(livGraine(id));
  const mk=function(w,h){const cv=document.createElement('canvas');cv.width=Math.round(w*z);cv.height=Math.round(h*z);const x=cv.getContext('2d');x.scale(z,z);x.fillStyle=M.base;x.fillRect(0,0,w,h);return {cv:cv,x:x};};
  const zone=function(o,X0,Y0,W,H,flip,f,ex){o.x.save();o.x.translate(X0,Y0);o.x.beginPath();o.x.rect(0,0,W,H);o.x.clip();if(f)try{f(livCrayon(o.x,W,H,flip,R),ex);}catch(e){console.warn('livrée',id,e);}o.x.restore();};
  const S=mk(1024,512),T=mk(256,512),F=mk(256,256);
  zone(S,0,0,1024,256,false,M.fl);zone(S,0,256,1024,256,true,M.fl);zone(T,0,0,256,512,false,M.ds);zone(F,0,0,256,128,false,M.fa,false);zone(F,0,128,256,128,false,M.fa,true);
  return {S:S.cv,T:T.cv,F:F.cv};}
function livTex(id){if(LIV_TX[id])return LIV_TX[id];const C=livToiles(id,ALLEGE?.5:1),mk=function(cv){const t=texLibere(new THREE.CanvasTexture(cv));/* (2026-11-13, finition · mémoire) toiles rendues après l'envoi sur téléphone */t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping;t.anisotropy=4;return t;};
  return LIV_TX[id]={S:mk(C.S),T:mk(C.T),F:mk(C.F)};}
/* le shader : le flanc, le dessus, la face — chacun lu dans SA toile, à la position réelle dans la caisse ; (uLvD : largeur, hauteur, longueur, base de la tôle ; uLvN : +1 si le nez est vers +z) */
const LIV_GLSL='vec3 lvN=normalize(vMotN),lvA=pow(abs(lvN),vec3(10.));lvA/=max(1e-4,lvA.x+lvA.y+lvA.z);\n'+
  'float lvX=vMotP.x*uLvN,lvZ=vMotP.z*uLvN,lvY=clamp((vMotP.y-uLvD.w)/uLvD.y,.02,.98),lvW=uLvD.x,lvL=uLvD.z;float lvSx=lvN.x*uLvN>0.?1.:-1.;\n'+
  'vec3 lvCs=texture2D(uLvS,vec2(clamp(.5-lvSx*lvZ/lvL,.004,.996),lvSx>0.?.5+.5*lvY:.5*lvY)).rgb;\n'+
  'vec3 lvCt=texture2D(uLvT,clamp(vec2(.5-lvX/lvW,.5+lvZ/lvL),.004,.996)).rgb;lvCt=mix(vec3(.04),lvCt,step(-.2,lvN.y));\n'+
  'float lvFz=lvN.z*uLvN>0.?1.:-1.;vec3 lvCf=texture2D(uLvF,vec2(clamp(.5+lvFz*lvX/lvW,.004,.996),lvFz>0.?.5+.5*lvY:.5*lvY)).rgb;\n'+
  'vec3 motC=pow(lvCs*lvA.x+lvCt*lvA.y+lvCf*lvA.z,vec3(1.7));diffuseColor.rgb*=motC;\n'; /* ^1,7 : la laque et le vernis éclaircissent — les teintes reprennent de la profondeur, le blanc reste blanc */
/* la pastille : la caisse de profil (le nez à gauche), vêtue de sa livrée, sur un cadre de nuit — dessinée dans les 512 px de motToile */
function livVignette(id,x){const M=MOTIFS[id],C=livToiles(id,.5),S=C.S,bg=M.bg||['#2a3358','#0d1020'];
  const g=x.createLinearGradient(0,0,0,512);g.addColorStop(0,bg[0]);g.addColorStop(1,bg[1]);x.fillStyle=g;x.fillRect(0,0,512,512);
  const r=x.createRadialGradient(256,270,10,256,270,300);r.addColorStop(0,'rgba(255,255,255,.28)');r.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=r;x.fillRect(0,0,512,512);
  x.fillStyle='rgba(0,0,0,.45)';x.beginPath();x.ellipse(256,382,214,17,0,0,6.2832);x.fill();
  const P=function(){x.beginPath();x.moveTo(40,326);x.lineTo(34,296);x.quadraticCurveTo(36,272,64,262);x.lineTo(150,246);x.quadraticCurveTo(170,242,184,236);x.lineTo(232,186);
    x.quadraticCurveTo(240,178,256,178);x.lineTo(322,178);x.quadraticCurveTo(342,180,356,198);x.lineTo(392,236);x.quadraticCurveTo(404,244,426,248);x.lineTo(462,254);x.quadraticCurveTo(480,262,480,288);x.lineTo(478,326);x.closePath();};
  x.save();P();x.clip();x.drawImage(S,0,0,S.width,S.height/2,34,178,446,150);
  const sh=x.createLinearGradient(0,178,0,328);sh.addColorStop(0,'rgba(255,255,255,.22)');sh.addColorStop(.45,'rgba(255,255,255,0)');sh.addColorStop(1,'rgba(0,0,0,.34)');x.fillStyle=sh;x.fillRect(30,170,460,170);x.restore();
  P();x.lineWidth=3;x.strokeStyle='rgba(8,10,18,.75)';x.lineJoin='round';x.stroke();
  const gl=x.createLinearGradient(0,186,0,244);gl.addColorStop(0,'#27456e');gl.addColorStop(1,'#0c1626');x.fillStyle=gl; /* les vitres : deux fenêtres et un montant */
  x.beginPath();x.moveTo(192,238);x.lineTo(234,192);x.quadraticCurveTo(240,186,252,186);x.lineTo(284,186);x.lineTo(284,238);x.closePath();x.fill();
  x.beginPath();x.moveTo(296,186);x.lineTo(322,186);x.quadraticCurveTo(334,188,342,198);x.lineTo(380,238);x.lineTo(296,238);x.closePath();x.fill();
  x.fillStyle='rgba(255,255,255,.18)';x.beginPath();x.moveTo(204,236);x.lineTo(240,194);x.lineTo(256,194);x.lineTo(226,236);x.closePath();x.fill();
  for(const wx of [124,398]){x.fillStyle='#07080c';x.beginPath();x.arc(wx,330,47,0,6.2832);x.fill();x.fillStyle='#16181e';x.beginPath();x.arc(wx,330,37,0,6.2832);x.fill();
    const rm=x.createRadialGradient(wx-8,322,3,wx,330,28);rm.addColorStop(0,'#f2f4f8');rm.addColorStop(1,'#7a808c');x.fillStyle=rm;x.beginPath();x.arc(wx,330,25,0,6.2832);x.fill();
    x.strokeStyle='#4a505c';x.lineWidth=3;for(let k=0;k<5;k++){x.beginPath();x.moveTo(wx,330);x.lineTo(wx+Math.cos(k*1.2566)*24,330+Math.sin(k*1.2566)*24);x.stroke();}}
  x.fillStyle='rgba(255,246,200,.95)';x.beginPath();x.ellipse(46,288,10,5,-.25,0,6.2832);x.fill();x.fillStyle='rgba(255,60,60,.9)';x.fillRect(470,276,8,12);}
const LIV_NEZ=1; // +1 : le nez de toutes les caisses est vers +z (mesuré au banc avec une toile quadrillée : texte lisible sur les deux flancs, bien placé)
function livDeclare(id,D){MOTIFS[id]=Object.assign({liv:1,s:1,f:function(x){livVignette(id,x);}},D);}
/* ------------------------------------------------------------------------------------------------------------------------------------------
   LES RALLYES — le rond du numéro, la boue du bas de caisse, le capot mat anti-reflet, les phares additionnels */
livDeclare('groupeb',{c:0xf1f1ec,base:'#f1f1ec',bg:['#4a5a7e','#10141f'],
  fl:function(g){g.rect(0,.9,1,1,'#16181d').rect(0,.86,1,.9,'#d4202a');
    [['#1b3f9a',0],['#d4202a',.05],['#7fb7ea',.1]].forEach(function(k){g.poly([[.62+k[1],.86],[.69+k[1],.86],[.9+k[1]*.6,.36],[.83+k[1]*.6,.36]],k[0]);});
    g.rect(0,.47,.76,.495,'#1b3f9a').rect(0,.5,.78,.515,'#d4202a');
    g.disc(.46,.7,.2,'#fbfbf8',.03,'#16181d').txt('1',.46,.705,.3,'#16181d').txt('GRP B',.14,.78,.08,'#16181d',{sk:.25});
    g.boue([96,70,44],.28,260);},
  ds:function(g){g.rect(.1,.12,.9,.34,'#121418').rect(.36,0,.45,1,'#1b3f9a').rect(.45,0,.55,1,'#d4202a').rect(.55,0,.64,1,'#1b3f9a').boue([96,70,44],.12,40);},
  fa:function(g,ar){g.rect(0,.74,1,1,'#16181d').rect(.41,0,.47,.74,'#1b3f9a').rect(.47,0,.53,.74,'#d4202a').rect(.53,0,.59,.74,'#1b3f9a');
    if(!ar)g.disc(.2,.5,.1,'#ffe14a',.02,'#222').disc(.8,.5,.1,'#ffe14a',.02,'#222');g.boue([96,70,44],.4,60);}});
livDeclare('montecarlo',{c:0x1a3a82,base:'#1a3a82',bg:['#5b7aa8','#0c1424'],
  fl:function(g){g.grad(0,.3,1,.9,'#1e4396','#13295f').rect(0,.9,1,1,'#f2f2ee').rect(0,.86,1,.9,'#d4202a');
    g.poly([[0,.6],[.3,.54],[.7,.48],[1,.42],[1,.55],[.7,.61],[.3,.67],[0,.73]],'#f4f4f0');
    g.disc(.45,.66,.18,'#ffd21a',.025,'#14161a').txt('4',.45,.665,.27,'#14161a').txt('ALPES',.82,.8,.075,'#f4f4f0',{sk:.25});
    g.boue([238,242,250],.34,420,.95).boue([104,84,64],.15,200,.8);},
  ds:function(g){g.rect(0,.3,1,.72,'#f4f4f0').rect(.38,0,.44,.3,'#f4f4f0').rect(.56,0,.62,.3,'#f4f4f0');for(const a of [.2,.4,.6,.8])g.disc(a,.04,.05,'#ffe14a',.012,'#222');},
  fa:function(g,ar){g.rect(0,.8,1,1,'#f2f2ee').boue([238,242,250],.5,80,.9);if(!ar)for(const a of [.2,.4,.6,.8])g.disc(a,.45,.075,'#ffe14a',.015,'#222');}});
livDeclare('safari',{c:0xc8221c,base:'#c8221c',bg:['#7a5a3a','#1d130a'],
  fl:function(g){g.poly([[0,.62],[.4,.55],[1,.4],[1,.53],[.4,.7],[0,.76]],'#ffcb1f',.012,'#fff6d8');
    g.disc(.46,.68,.19,'#fbfbf8',.03,'#14161a').txt('12',.46,.685,.25,'#c8221c').txt('SAFARI',.84,.84,.085,'#fff6e0',{sk:.25});g.boue([201,160,100],.55,560,.92);},
  ds:function(g){g.rect(.2,0,.8,.34,'#f7f2e8').rect(.2,.4,.8,.72,'#f7f2e8').rect(.47,0,.53,1,'#c8221c').boue([201,160,100],.14,60);},
  fa:function(g,ar){g.rect(0,.78,1,1,'#b08850');if(!ar)g.disc(.25,.45,.13,'#fff8e0',.02,'#222').disc(.75,.45,.13,'#fff8e0',.02,'#222');g.boue([201,160,100],.55,90,.9);}});
livDeclare('dakar',{c:0xd89a3c,base:'#d89a3c',bg:['#9a6a2a','#2a1806'],
  fl:function(g){g.grad(0,0,1,.5,'#e8b058','#d89a3c');[['#1b3f9a',0],['#f8f4ea',.045],['#d4202a',.09]].forEach(function(k){g.poly([[.72+k[1],.9],[.77+k[1],.9],[.9+k[1]*.6,.3],[.85+k[1]*.6,.3]],k[0]);});
    g.box(.46,.68,.34,.38,'#f8f4ea',.03).txt('412',.46,.69,.25,'#14161a').txt('DESERT',.15,.8,.07,'#14161a',{sk:.2});
    for(let k=0;k<44;k++)g.disc(k/43,.47,.006,'#8a5a1e');g.boue([140,96,50],.58,680,.95);},
  ds:function(g){g.rect(.1,.14,.9,.34,'#1a1a1c').rect(.2,.38,.8,.62,'#14161a').txt('412',.5,.5,.19,'#f8f4ea',{rot:-1.5708}).boue([140,96,50],.18,80);},
  fa:function(g,ar){g.rect(0,.62,1,.74,'#14161a');if(!ar)g.disc(.3,.34,.1,'#ffe14a',.02,'#222').disc(.7,.34,.1,'#ffe14a',.02,'#222');g.boue([140,96,50],.6,100,.95);}});
/* ------------------------------------------------------------------------------------------------------------------------------------------
   LA F1 ET L'ENDURANCE — le bleu poudre, les trois rayures, le noir et or, l'alu nu, le jaune danger, le damier */
livDeclare('poudre',{c:0x8fcbe8,base:'#8fcbe8',bg:['#4c86a8','#0c1a26'],
  fl:function(g){g.rect(0,.9,1,.915,'#f58a1f').rect(0,.46,1,.475,'#f58a1f').disc(.47,.68,.2,'#f58a1f',.03,'#ffffff').txt('9',.47,.685,.3,'#1d3a78');},
  ds:function(g){g.rect(.385,0,.4,1,'#ffffff').rect(.4,0,.6,1,'#f58a1f').rect(.6,0,.615,1,'#ffffff');},
  fa:function(g){g.rect(0,.78,1,1,'#5aa6cf').rect(.385,0,.4,.78,'#ffffff').rect(.4,0,.6,.78,'#f58a1f').rect(.6,0,.615,.78,'#ffffff');}});
livDeclare('apero',{c:0xf5f5f1,base:'#f5f5f1',bg:['#35508a','#0c1226'],
  fl:function(g){g.rect(0,.47,1,.55,'#7fc7ec').rect(0,.55,1,.63,'#16306e').rect(0,.63,1,.71,'#d4202a');
    g.disc(.46,.82,.1,'#ffffff',.02,'#16306e').txt('33',.46,.825,.13,'#16306e').txt('APÉRITIF',.82,.88,.06,'#16306e',{sk:.25,ls:.01});},
  ds:function(g){g.rect(.385,0,.46,1,'#7fc7ec').rect(.46,0,.54,1,'#16306e').rect(.54,0,.615,1,'#d4202a');},
  fa:function(g){g.rect(.385,0,.46,1,'#7fc7ec').rect(.46,0,.54,1,'#16306e').rect(.54,0,.615,1,'#d4202a').rect(0,.84,1,1,'#14161a');}});
livDeclare('noiror',{c:0x0d0d10,base:'#0d0d10',bg:['#3a3322','#07070a'],
  fl:function(g){g.paillettes('255,232,170',700,.6).rect(0,.5,1,.518,'#d9b24a').rect(0,.545,1,.56,'#d9b24a').rect(0,.9,1,.912,'#d9b24a');
    g.disc(.46,.73,.16,'#d9b24a',.012,'#f4de9a').txt('7',.46,.735,.24,'#0d0d10').txt('NOIR & OR',.8,.8,.07,'#d9b24a',{sk:.25,font:'italic 700 ',fam:'Georgia,serif'});},
  ds:function(g){g.paillettes('255,232,170',500,.6).rect(.455,0,.468,1,'#d9b24a').rect(.532,0,.545,1,'#d9b24a').poly([[.18,.04],[.82,.04],[.82,.3],[.18,.3]],null,.008,'#d9b24a');},
  fa:function(g,ar){g.paillettes('255,232,170',200,.6).rect(0,.5,1,.54,'#d9b24a').rect(0,.62,1,.64,'#d9b24a');}});
livDeclare('fleche',{c:0xc7ccd4,base:'#9aa1ac',bg:['#52627c','#0e121c'],
  fl:function(g){g.grad(0,0,1,1,'#aeb4be','#8a919c').brosse(1100,.16);for(let k=0;k<52;k++)g.disc(k/51,.9,.0045,'#7e8590');for(const a of [.3,.55,.8])g.rect(a,.42,a+.002,1,'#848b96');
    g.disc(.45,.7,.17,'#fafafa',.015,'#555b66').txt('8',.45,.705,.26,'#16181d').rect(0,.62,.13,.645,'#c8202a');},
  ds:function(g){g.grad(0,0,1,1,'#b4bac4','#8e95a0').brosse(900,.16);for(let k=0;k<9;k++){g.rect(.2,.09+k*.028,.8,.105+k*.028,'#69707b');}},
  fa:function(g){g.grad(0,0,1,1,'#aeb4be','#8a919c').brosse(300,.16).disc(.5,.5,.2,'#262a32',.03,'#9aa1ac');for(let k=0;k<5;k++)g.rect(.34,.4+k*.045,.66,.415+k*.045,'#555c68');}});
livDeclare('pitstop',{c:0xffd21a,base:'#ffd21a',bg:['#7a6a22','#14110a'],
  fl:function(g){g.hazard(0,.86,1,1,44,'#14161a','#ffd21a',.9).disc(.46,.66,.18,'#ffffff',.03,'#14161a').txt('00',.46,.67,.25,'#14161a').tri(.15,.66,.2,'#ffffff',.02,'#14161a').txt('!',.15,.69,.14,'#14161a').txt('BOX BOX',.8,.7,.085,'#14161a',{sk:.25});},
  ds:function(g){g.hazard(0,0,1,.05,16,'#14161a','#ffd21a',1).rect(.4,.05,.6,1,'#14161a').tri(.5,.17,.22,'#ffd21a',.02,'#14161a').txt('!',.5,.185,.1,'#14161a');},
  fa:function(g){g.hazard(0,.62,1,1,16,'#14161a','#ffd21a',.9);}});
livDeclare('arrivee',{c:0xf4f4f0,base:'#f4f4f0',bg:['#555b66','#0f1116'],
  fl:function(g){g.damier(0,.5,1,.665,72,3,'#14161a','#f4f4f0',.05,0).rect(0,.9,1,.915,'#d4202a').txt('1.61',.46,.82,.15,'#d4202a',{sk:.25});},
  ds:function(g){g.damier(.4,0,.6,1,3,80,'#14161a','#f4f4f0',0).rect(.395,0,.4,1,'#d4202a').rect(.6,0,.605,1,'#d4202a');},
  fa:function(g){g.damier(0,.5,1,.72,40,3,'#14161a','#f4f4f0',.04,0);}});
/* ------------------------------------------------------------------------------------------------------------------------------------------
   LA POP — le tofu, la balle rouge et blanche, le bloc d'herbe, la console grise, l'éclair, le fantôme barré */
livDeclare('panda',{c:0xf5f5f2,base:'#f5f5f2',bg:['#3e4a5a','#0c1016'],
  fl:function(g){g.rect(0,.6,1,1,'#14161a').rect(0,.585,1,.602,'#d4202a').txt('TOFU',.46,.8,.2,'#f5f5f2',{sk:.25}).txt('DRIFT',.84,.8,.1,'#d4202a',{sk:.25});},
  ds:function(g){g.rect(0,0,1,.3,'#14161a').rect(0,.76,1,1,'#14161a').rect(0,.3,1,.315,'#d4202a');},
  fa:function(g){g.rect(0,.5,1,1,'#14161a').rect(0,.485,1,.5,'#d4202a');}});
livDeclare('capture',{c:0xe8262b,base:'#f6f6f6',bg:['#5a6a9a','#0d1020'],
  fl:function(g){g.rect(0,0,1,.52,'#e8262b').rect(0,.52,1,.6,'#16181d').disc(.5,.56,.15,'#f6f6f6',.05,'#16181d').disc(.5,.56,.075,null,.02,'#16181d');},
  ds:function(g){g.rect(0,0,1,1,'#e8262b').disc(.5,.11,.13,'#f6f6f6',.05,'#16181d').disc(.5,.11,.065,null,.02,'#16181d').rect(0,.3,1,.312,'#16181d');},
  fa:function(g){g.rect(0,0,1,.5,'#e8262b').rect(0,.5,1,.62,'#16181d').disc(.5,.56,.16,'#f6f6f6',.05,'#16181d');}});
livDeclare('bloc',{c:0x5da13a,base:'#8b5a2b',bg:['#6ab0ff','#2c4a7a'],
  fl:function(g){const R=g.R;g.pix(0,0,1,.34,.0625,['#5da13a','#4f9130','#6cb946','#3f7d27']);
    for(let i=0;i<64;i++)g.pix(i/64,.34,(i+1)/64,.34+(1+((R()*3)|0))*.0625,.0625,['#5da13a','#4f9130','#3f7d27']);
    g.pix(0,.4,1,.84,.0625,['#8b5a2b','#7a4a21','#9a6a35','#6b3f1b']).pix(0,.84,1,1,.0625,['#7d7d7d','#8b8b8b','#6e6e6e','#767676']);
    for(let k=0;k<26;k++)g.box(R(),.88+R()*.1,.07,.07,'#2a2a2e');},
  ds:function(g){const R=g.R;g.pix(0,0,1,1,.06,['#5da13a','#4f9130','#6cb946','#3f7d27']);for(let k=0;k<10;k++)g.box(R(),R(),.04,.04,['#f6e04a','#e84a4a','#ffffff'][k%3]);},
  fa:function(g){const R=g.R;g.pix(0,0,1,.3,.09,['#5da13a','#4f9130','#6cb946','#3f7d27']).pix(0,.3,1,.78,.09,['#8b5a2b','#7a4a21','#9a6a35','#6b3f1b']).pix(0,.78,1,1,.09,['#7d7d7d','#8b8b8b','#6e6e6e']);}});
livDeclare('console',{c:0x8e8e8a,base:'#8e8e8a',bg:['#6a6a86','#14141e'],
  fl:function(g){g.rect(0,.84,1,.852,'#6c6c68').rect(0,.35,1,.362,'#7a7a76');
    g.box(.2,.66,.3,.1,'#2b2b30',.02).box(.2,.66,.1,.3,'#2b2b30',.02).disc(.38,.72,.075,'#a3205f',.012,'#6d1440').txt('B',.38,.725,.09,'#f6d0e2').disc(.5,.62,.075,'#a3205f',.012,'#6d1440').txt('A',.5,.625,.09,'#f6d0e2');
    g.box(.64,.76,.16,.04,'#4a4a52',.02).box(.72,.76,.16,.04,'#4a4a52',.02).txt('CAR BOY',.85,.78,.075,'#2d3a8a',{sk:.25});},
  ds:function(g){g.box(.5,.2,.84,.36,'#3a3a44',.03).box(.5,.2,.66,.26,'#9bbc0f',.01).txt('CASH CAR',.5,.2,.075,'#0f380f',{fam:'"Courier New",monospace'}).disc(.9,.42,.022,'#d83030');
    for(let k=0;k<6;k++)g.rect(.26,.8+k*.03,.74,.812+k*.03,'#8c8c88');},
  fa:function(g){g.rect(0,.7,1,1,'#6c6c68');}});
livDeclare('flash',{c:0xd41f26,base:'#d41f26',bg:['#e8a040','#2a0c0e'],
  fl:function(g){g.poly([[.08,.68],[.52,.5],[.44,.63],[.88,.46],[.5,.84],[.56,.68]],'#ffd21a',.012,'#fff6c0').txt('95',.2,.86,.15,'#fffaf0',{sk:.25,st:'#14161a'});
    [['TURBO','#14161a',.62],['ZOOM','#ffd21a',.72],['GG','#2bd9ff',.82]].forEach(function(k){g.box(k[2],.93,.09,.045,k[1],.02);});},
  ds:function(g){g.poly([[.58,.01],[.3,.35],[.5,.35],[.38,.74],[.72,.28],[.52,.28],[.64,.01]],'#ffd21a',.012,'#fff6c0');},
  fa:function(g,ar){g.rect(.44,0,.56,1,'#ffd21a');if(ar)g.txt('95',.5,.5,.4,'#fffaf0',{st:'#14161a'});}});
livDeclare('ecto',{c:0xf4f4f0,base:'#f4f4f0',bg:['#4a5a72','#0c1018'],
  fl:function(g){g.rect(0,.5,1,.54,'#d4202a').rect(0,.55,1,.565,'#14161a').disc(.46,.74,.17,'#ffffff',.045,'#d4202a').fantome(.46,.74,.1,'#ffffff','#14161a').ligne([[.43,.66],[.49,.82]],.04,'#d4202a').txt('ECTO',.82,.84,.09,'#14161a',{sk:.25});},
  ds:function(g){g.rect(.18,0,.23,1,'#d4202a').rect(.77,0,.82,1,'#d4202a').disc(.5,.13,.2,'#ffffff',.05,'#d4202a').fantome(.5,.13,.12,'#ffffff','#14161a');},
  fa:function(g){g.rect(0,.4,1,.5,'#d4202a').txt('ECTO',.5,.74,.2,'#14161a',{sk:.2});}});
/* ------------------------------------------------------------------------------------------------------------------------------------------
   LA RUE — le rose bonbon et les rubans cyan, le violet nacré et le vert acide */
livDeclare('itasha',{c:0xff7fbd,base:'#ff82c0',bg:['#8a4a9a','#1a0a26'],
  fl:function(g){const R=g.R,x=g.x,H=g.H;x.beginPath();x.moveTo(g.X(0),.72*H);x.bezierCurveTo(g.X(.3),.34*H,g.X(.6),.98*H,g.X(1),.5*H);x.lineTo(g.X(1),.64*H);x.bezierCurveTo(g.X(.6),1.1*H,g.X(.3),.5*H,g.X(0),.86*H);x.closePath();x.fillStyle='#35e0ff';x.fill();x.lineWidth=2.5;x.strokeStyle='#ffffff';x.stroke();
    g.paillettes('255,255,255',800,.9);for(let k=0;k<22;k++){g.etoile(R(),.45+R()*.5,.03+R()*.035,'#ffffff');if(k&1)g.coeur(R(),.45+R()*.5,.022+R()*.02,'#ff3b7a');}
    g.coeur(.46,.72,.2,'#ffffff').coeur(.46,.72,.13,'#ff3b7a').txt('KAWAII',.8,.86,.09,'#ffffff',{sk:.25,st:'#d62a7a',lw:.05});},
  ds:function(g){const R=g.R;g.paillettes('255,255,255',400,.9);for(let k=0;k<20;k++)g.etoile(R(),R(),.06+R()*.05,'#ffffff');g.etoile(.5,.13,.22,'#35e0ff').etoile(.5,.13,.11,'#ffffff');},
  fa:function(g){const R=g.R;for(let k=0;k<8;k++)g.coeur(R(),R(),.12,'#ff3b7a');g.coeur(.5,.5,.3,'#ffffff');}});
livDeclare('tokyodrift',{c:0x3a1a7a,base:'#3a1a7a',bg:['#3a2a8a','#08051a'],
  fl:function(g){const x=g.x,H=g.H;g.grad(0,0,1,1,'#5a2cb8','#1a0a44').paillettes('190,170,255',600,.6);
    x.beginPath();x.moveTo(g.X(0),.95*H);x.bezierCurveTo(g.X(.35),.5*H,g.X(.7),.78*H,g.X(1),.3*H);x.lineTo(g.X(1),.46*H);x.bezierCurveTo(g.X(.7),.96*H,g.X(.35),.74*H,g.X(0),1.08*H);x.closePath();x.fillStyle='#3dff7a';x.fill();x.lineWidth=2;x.strokeStyle='#e6fff0';x.stroke();
    x.beginPath();x.moveTo(g.X(0),.8*H);x.bezierCurveTo(g.X(.35),.36*H,g.X(.7),.62*H,g.X(1),.14*H);x.lineTo(g.X(1),.2*H);x.bezierCurveTo(g.X(.7),.7*H,g.X(.35),.44*H,g.X(0),.86*H);x.closePath();x.fillStyle='#ff3dbb';x.fill();
    g.txt('DRIFT',.45,.74,.14,'#ffffff',{sk:.28,st:'#14102a'}).txt('TOKYO',.82,.9,.07,'#3dff7a',{sk:.25});},
  ds:function(g){g.rect(.42,0,.46,1,'#3dff7a').rect(.54,0,.58,1,'#3dff7a').rect(.48,0,.52,1,'#ff3dbb');},
  fa:function(g){g.rect(0,.78,1,.9,'#3dff7a').rect(0,.9,1,.94,'#ff3dbb');}});
/* LA VITRINE : les livrées d'abord (les rallyes, la F1, la pop, la rue), puis les stickers, les pelages… PEINT_CAT donne l'ordre à l'écran */
PEINT_CAT.splice(PEINT_CAT.findIndex(function(e){return e[0]==='stickers';}),0,
  ['groupeb','GROUPE B','epique',{mot:'groupeb'},"Les années folles du rallye : 500 chevaux, zéro garde-fou, des spectateurs sur le talus. Un 1 sur la porte, de la boue sur le bas de caisse.",{k:'frenT',v:40,u:'s',t:'Tiens la frénésie 40 secondes.'}],
  ['montecarlo','MONTE-CARLO','epique',{mot:'montecarlo'},"Bleu nuit, neige sale, quatre phares sur le capot. Les épingles ne te font plus peur. La glace non plus.",{k:'sc:neige',v:20,t:'Joue 20 niveaux sous la neige.'}],
  ['safari','SAFARI','epique',{mot:'safari'},"Rouge latérite, bande jaune, de la poussière jusqu'aux phares. Trois mille kilomètres de piste, et la girafe t'a laissé passer.",{k:'gagne',v:500000,t:'Gagne 500 000 € au total.'}],
  ['dakar','DAKAR','epique',{mot:'dakar'},"Du sable, un numéro à trois chiffres, un pare-buffle noir. Plus personne ne sait de quelle couleur elle était. On s'en fiche.",{k:'sc:midi',v:25,t:'Joue 25 niveaux en plein jour.'}],
  ['poudre','BLEU POUDRE','epique',{mot:'poudre'},"Le bleu pâle et l'orange des 24 Heures : la livrée que les collectionneurs paient plus cher que la voiture.",{k:'jours',v:14,t:'Joue 14 jours différents.'}],
  ['apero',"L'APÉRITIF",'epique',{mot:'apero'},"Trois rayures, un verre à la main, un virage à fond. La plus classique des livrées de course, servie bien frais."],
  ['noiror','NOIR ET OR','epique',{mot:'noiror'},"Laque noire, filets d'or, un 7 sur la porte. Le genre de livrée qui arrive avant la voiture.",{k:'gagne',v:5000000,t:'Gagne 5 000 000 € au total.'}],
  ['fleche',"FLÈCHE D'ARGENT",'epique',{mot:'fleche'},"On a gratté la peinture pour gagner un kilo : l'aluminium nu a gagné la course. C'est une histoire vraie.",{k:'kmh',v:2000,u:'kmh',t:'Dépasse 2 000 km/h.'}],
  ['pitstop','PIT STOP','epique',{mot:'pitstop'},"Jaune danger, chevrons noirs, triangle d'avertissement. Quatre pneus en deux secondes, un seul regard de la police.",{k:'parf',v:3,t:"Fais 3 poses parfaites d'affilée."}],
  ['arrivee',"LIGNE D'ARRIVÉE",'epique',{mot:'arrivee'},"Un drapeau à damier qui ondule sur toute la caisse. Tu l'as franchie en premier : c'est celui qu'on agite pour toi.",{k:'eng',v:12,t:'Atteins le palier 12 du moteur.'}],
  ['panda','PANDA 86','epique',{mot:'panda'},"Blanc en haut, noir en bas, tofu sur la porte. Le sommet de la montagne est à toi, la nuit, sans phares.",{k:'sc:pluie',v:20,t:'Joue 20 niveaux sous la pluie.'}],
  ['capture','CAPTURE','epique',{mot:'capture'},"Rouge dessus, blanc dessous, un bouton au milieu. Un geste du poignet et elle est à toi. Attrape-les tous (les virages).",{k:'fig',v:8,t:'Enchaîne 8 figures dans un seul saut.'}],
  ['bloc',"BLOC D'HERBE",'epique',{mot:'bloc'},"Herbe dessus, terre dessous, des pixels partout. Tu as miné toute la nuit, maintenant tu roules. Ne creuse pas tout droit vers le bas.",{k:'sc:foret',v:25,t:'Joue 25 niveaux dans la forêt.'}],
  ['console','CONSOLE GRISE','epique',{mot:'console'},"Gris brique, deux boutons violets sur la porte, un écran vert sur le capot. Pas de piles à changer, juste de l'essence.",{k:'jours',v:7,t:'Joue 7 jours différents.'}],
  ['flash','ÉCLAIR 95','epique',{mot:'flash'},"Rouge vif, un éclair jaune sur le flanc, un 95 qui ne ment pas. Ka-chow.",{k:'kmh',v:1000,u:'kmh',t:'Dépasse 1 000 km/h.'}],
  ['ecto','ECTO','epique',{mot:'ecto'},"Blanc cassé, filets rouges et un fantôme barré sur la porte. Quand ça devient bizarre, qui tu vas appeler ?",{k:'sc:nuit',v:25,t:'Joue 25 niveaux de nuit.'}],
  ['itasha','ITASHA','epique',{mot:'itasha'},"Rose bonbon, rubans cyan, des étoiles et des cœurs à gogo, un gros KAWAII sur la porte. Le parking n'a jamais été aussi doux.",{k:'sc:matin',v:25,t:'Joue 25 niveaux le matin.'}],
  ['tokyodrift','TOKYO DRIFT','epique',{mot:'tokyodrift'},"Violet nacré, rubans vert acide, un DRIFT sur la porte. Le parking à étages, à deux heures du matin : c'est ton circuit.",{k:'sc:ville',v:25,t:'Joue 25 niveaux dans la ville.'}]);
Object.assign(I18N,{"GROUPE B":"GROUP B","Les années folles du rallye : 500 chevaux, zéro garde-fou, des spectateurs sur le talus. Un 1 sur la porte, de la boue sur le bas de caisse.":"Rallying's wild years: 500 horsepower, zero guardrails, spectators on the bank. A 1 on the door, mud on the sill.","Tiens la frénésie 40 secondes.":"Hold the frenzy for 40 seconds.",
  "MONTE-CARLO":"MONTE CARLO","Bleu nuit, neige sale, quatre phares sur le capot. Les épingles ne te font plus peur. La glace non plus.":"Midnight blue, dirty snow, four lamps on the hood. Hairpins don't scare you any more. Neither does ice.","Joue 20 niveaux sous la neige.":"Play 20 levels in the snow.",
  "SAFARI":"SAFARI","Rouge latérite, bande jaune, de la poussière jusqu'aux phares. Trois mille kilomètres de piste, et la girafe t'a laissé passer.":"Laterite red, a yellow stripe, dust up to the headlights. Three thousand kilometres of track, and the giraffe let you through.","Gagne 500 000 € au total.":"Earn €500,000 in total.",
  "DAKAR":"DAKAR","Du sable, un numéro à trois chiffres, un pare-buffle noir. Plus personne ne sait de quelle couleur elle était. On s'en fiche.":"Sand, a three-digit number, a black bull bar. Nobody remembers what colour it was. Nobody cares.","Joue 25 niveaux en plein jour.":"Play 25 levels in broad daylight.",
  "BLEU POUDRE":"POWDER BLUE","Le bleu pâle et l'orange des 24 Heures : la livrée que les collectionneurs paient plus cher que la voiture.":"The pale blue and orange of the 24 Hours: the livery collectors pay more for than the car.","Joue 14 jours différents.":"Play 14 different days.",
  "L'APÉRITIF":"THE APERITIF","Trois rayures, un verre à la main, un virage à fond. La plus classique des livrées de course, servie bien frais.":"Three stripes, a drink in hand, a corner flat out. The most classic racing livery, served chilled.",
  "NOIR ET OR":"BLACK AND GOLD","Laque noire, filets d'or, un 7 sur la porte. Le genre de livrée qui arrive avant la voiture.":"Black lacquer, gold pinstripes, a 7 on the door. The kind of livery that arrives before the car.","Gagne 5 000 000 € au total.":"Earn €5,000,000 in total.",
  "FLÈCHE D'ARGENT":"SILVER ARROW","On a gratté la peinture pour gagner un kilo : l'aluminium nu a gagné la course. C'est une histoire vraie.":"They scraped off the paint to save a kilo: bare aluminium won the race. It's a true story.","Dépasse 2 000 km/h.":"Go past 2,000 km/h.",
  "PIT STOP":"PIT STOP","Jaune danger, chevrons noirs, triangle d'avertissement. Quatre pneus en deux secondes, un seul regard de la police.":"Danger yellow, black chevrons, a warning triangle. Four tyres in two seconds, one look from the police.","Fais 3 poses parfaites d'affilée.":"Land 3 perfect poses in a row.",
  "LIGNE D'ARRIVÉE":"FINISH LINE","Un drapeau à damier qui ondule sur toute la caisse. Tu l'as franchie en premier : c'est celui qu'on agite pour toi.":"A chequered flag rippling across the whole car. You crossed first: that's the one they wave for you.","Atteins le palier 12 du moteur.":"Reach engine tier 12.",
  "PANDA 86":"PANDA 86","Blanc en haut, noir en bas, tofu sur la porte. Le sommet de la montagne est à toi, la nuit, sans phares.":"White on top, black below, tofu on the door. The mountain pass is yours, at night, lights off.","Joue 20 niveaux sous la pluie.":"Play 20 levels in the rain.",
  "CAPTURE":"CAPTURE","Rouge dessus, blanc dessous, un bouton au milieu. Un geste du poignet et elle est à toi. Attrape-les tous (les virages).":"Red on top, white below, a button in the middle. A flick of the wrist and it's yours. Catch them all (the corners).","Enchaîne 8 figures dans un seul saut.":"Chain 8 tricks in a single jump.",
  "BLOC D'HERBE":"GRASS BLOCK","Herbe dessus, terre dessous, des pixels partout. Tu as miné toute la nuit, maintenant tu roules. Ne creuse pas tout droit vers le bas.":"Grass on top, dirt below, pixels everywhere. You mined all night, now you drive. Don't dig straight down.","Joue 25 niveaux dans la forêt.":"Play 25 levels in the forest.",
  "CONSOLE GRISE":"GREY HANDHELD","Gris brique, deux boutons violets sur la porte, un écran vert sur le capot. Pas de piles à changer, juste de l'essence.":"Brick grey, two purple buttons on the door, a green screen on the hood. No batteries to change, just petrol.","Joue 7 jours différents.":"Play 7 different days.",
  "ÉCLAIR 95":"LIGHTNING 95","Rouge vif, un éclair jaune sur le flanc, un 95 qui ne ment pas. Ka-chow.":"Bright red, a yellow bolt down the flank, a 95 that doesn't lie. Ka-chow.","Dépasse 1 000 km/h.":"Go past 1,000 km/h.",
  "ECTO":"ECTO","Blanc cassé, filets rouges et un fantôme barré sur la porte. Quand ça devient bizarre, qui tu vas appeler ?":"Off-white, red pinstripes and a crossed-out ghost on the door. When things get strange, who you gonna call?","Joue 25 niveaux de nuit.":"Play 25 levels at night.",
  "ITASHA":"ITASHA","Rose bonbon, rubans cyan, des étoiles et des cœurs à gogo, un gros KAWAII sur la porte. Le parking n'a jamais été aussi doux.":"Candy pink, cyan ribbons, stars and hearts galore, a big KAWAII on the door. The car park has never been this sweet.","Joue 25 niveaux le matin.":"Play 25 levels in the morning.",
  "TOKYO DRIFT":"TOKYO DRIFT","Violet nacré, rubans vert acide, un DRIFT sur la porte. Le parking à étages, à deux heures du matin : c'est ton circuit.":"Pearl violet, acid-green ribbons, a DRIFT on the door. The multi-storey car park at 2 a.m.: that's your circuit.","Joue 25 niveaux dans la ville.":"Play 25 levels in the city."});
