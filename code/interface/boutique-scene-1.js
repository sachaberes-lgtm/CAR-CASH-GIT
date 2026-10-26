/* LE BLANC LAQUÉ de la boutique (2026-10-14, Léo : « les piliers lisses et blanc brillant », puis « le triple sol aussi blanc et lisse que
   les piliers ») : une matière partagée par les colonnes et le socle à gradins ; `k` assombrit à peine (les filets entre les gradins). */
function bqLaqueMat(k){bqLaqueMat._m=bqLaqueMat._m||{};const cle=String(k||1);if(bqLaqueMat._m[cle])return bqLaqueMat._m[cle];
  const lq=new THREE.MeshMatcapMaterial({color:0xffffff,fog:false,matcap:(function(){ /* le VERNIS PEINT (matcap) : base blanche, bords gris perle, un large reflet et un point
      de brillance net en haut à gauche — le blanc laqué se lit quelle que soit la lampe (avec Phong, la lampe du studio ne donnait qu'un blanc mat lavande) */
     const cv=document.createElement('canvas');cv.width=cv.height=256;const x=cv.getContext('2d');
     /* un fût vertical se lit sur la LIGNE MÉDIANE du matcap (ses normales sont presque horizontales) : les reflets y sont donc des BANDES
        verticales — un large reflet doux et un trait de brillance net côté lampe, un contre-reflet de l'autre côté, le bord qui s'assombrit */
     let gr=x.createRadialGradient(128,128,0,128,128,128);gr.addColorStop(0,'#f4f6f9');gr.addColorStop(.7,'#e9edf2');gr.addColorStop(.9,'#cfd6e0');gr.addColorStop(1,'#aeb8c6');x.fillStyle=gr;x.fillRect(0,0,256,256);
     const bande=function(cx,w,a){const g9=x.createLinearGradient(cx-w,0,cx+w,0);g9.addColorStop(0,'rgba(255,255,255,0)');g9.addColorStop(.5,'rgba(255,255,255,'+a+')');g9.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g9;x.fillRect(cx-w,0,2*w,256);};
     bande(96,46,.85);bande(92,9,1);bande(92,4,1);bande(186,22,.45);
     x.globalCompositeOperation='destination-in';gr=x.createRadialGradient(128,128,120,128,128,128);gr.addColorStop(0,'#000');gr.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=gr;x.fillRect(0,0,256,256);
     x.globalCompositeOperation='destination-over';x.fillStyle='#aeb8c6';x.fillRect(0,0,256,256);x.globalCompositeOperation='source-over';
     {const g9=x.createLinearGradient(0,0,0,84);g9.addColorStop(0,'rgba(250,251,253,1)');g9.addColorStop(.55,'rgba(250,251,253,.9)');g9.addColorStop(1,'rgba(250,251,253,0)');x.fillStyle=g9;x.fillRect(0,0,256,84);} /* le HAUT du matcap en blanc brillant : les dessus (gradins du socle) regardent vers le ciel et lisaient le bord gris */
     const t=new THREE.CanvasTexture(cv);return t;})()});lq.onBeforeCompile=function(sh){sh.fragmentShader=sh.fragmentShader.replace('vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;',
     'vec3 outgoingLight = diffuseColor.rgb * (matcapColor.rgb*1.05 + 4.2*pow(matcapColor.r,16.));');}; /* le reflet passe AU-DELÀ du blanc : l'étalonnage du jeu
     écrase les blancs contre un plafond (le sol a dû monter à ×3,4) — un vernis linéaire y sortait uniforme ; là, le corps reste un blanc doux et
     le reflet claque */
  if(k)lq.color.setScalar(k);return bqLaqueMat._m[cle]=lq;}
/* LE 1.61 (2026-10-14, Léo : « à la limite, un petit 1.61 blanc en 3D qui ressort du mur blanc de la boutique ») — la signature du jeu (le
   soleil « 1.61 »), en chiffres PIXEL (la police du jeu, 3 × 5) taillés en cubes, dans le BLANC LAQUÉ des colonnes (bqLaqueMat : le relief se lit
   à ses reflets, blanc sur blanc) ; derrière la caisse, au-dessus de son nom, loin dans la salle. Un seul maillage instancié. */
function bq161(g){
  const G={'1':['.X.','XX.','.X.','.X.','XXX'],'6':['XXX','X..','XXX','X.X','XXX'],'.':['.','.','.','.','X']},txt='1.61',P=.38,D=.5,pos=[];
  let lx=0;for(const ch of txt){const m=G[ch],w=m[0].length;for(let j=0;j<5;j++)for(let i=0;i<w;i++)if(m[j][i]==='X')pos.push([lx+i,4-j]);lx+=w+1;}
  const W=(lx-1)*P,im=new THREE.InstancedMesh(new THREE.BoxGeometry(P*.96,P*.96,D),bqLaqueMat(),pos.length),M9=new THREE.Matrix4();
  pos.forEach(function(p,k){M9.makeTranslation(-W/2+p[0]*P+P/2,p[1]*P+P/2,0);im.setMatrixAt(k,M9);});
  // il RESSORT D'UN MUR : un pan blanc (le blanc du fond, invisible en lui-même) juste derrière, qui porte son OMBRE douce, décalée en bas à droite
  const cv=document.createElement('canvas'),S=24,mg=3;cv.width=(lx-1+2*mg)*S;cv.height=(5+2*mg)*S;const x=cv.getContext('2d');x.filter='blur('+(S*.35)+'px)';x.fillStyle='rgba(60,70,90,.55)';
  pos.forEach(function(p){x.fillRect((mg+p[0])*S,(mg+4-p[1])*S,S,S);});
  const L9=(lx-1+2*mg)*P,H9=(5+2*mg)*P,mur=new THREE.Mesh(new THREE.PlaneGeometry(L9,H9),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(cv),transparent:true,depthWrite:false,fog:false}));
  const grp=new THREE.Group();grp.add(im);mur.position.set(P*.45,-P*.55+2.5*P,-D/2-.02);grp.add(mur);
  grp.position.set(0,7.2,-22);grp.rotation.set(.06,-.18,0);g.add(grp);GBQ.s161=grp;}
function garBqBatit(){if(GBQ.grp)return; // (2026-10-12, Léo : « lâche le magasin… plutôt un carré blanc futuriste — on a trop de salles, la boutique c'est un truc hors du temps ») L'ESPACE BLANC
  const g=new THREE.Group();g.visible=false;scene.add(g);GBQ.grp=g;
  const B=function(c,o){return new THREE.MeshBasicMaterial(Object.assign({color:c,fog:false},o||{}));};
  const cvT=function(w,h,f){const cv=document.createElement('canvas');cv.width=w;cv.height=h;f(cv.getContext('2d'),w,h);const t=new THREE.CanvasTexture(cv);t.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());return t;};
  // LE FOND : une sphère retournée, blanc pur au zénith, gris perle à l'horizon — aucun mur, aucun coin
  const R=60,tF=cvT(4,256,function(x,w,h){const gr=x.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#ffffff');gr.addColorStop(.42,'#fafbfc');gr.addColorStop(.5,'#eceff2');gr.addColorStop(1,'#eceff2');x.fillStyle=gr;x.fillRect(0,0,w,h);});
  const fond=new THREE.Mesh(new THREE.SphereGeometry(R,32,24),B(0xffffff,{map:tF,side:THREE.BackSide}));fond.renderOrder=-10;fond.material.color.setScalar(2.6);g.add(fond); /* (×1,5 : l'étalonnage du jeu tasse les blancs — le fond doit sortir BLANC) */ // (elle écrit la profondeur : rien du monde ne passe derrière)
  /* LE BLANC STRUCTURÉ (2026-10-12, Léo : « le sol blanc pareil ; un arrière de la salle, même style ») : une toile de 4 × 4 petites dalles en
     relief (arête claire en haut à gauche, ombre en bas à droite, une teinte à peine différente par dalle) — la peau du sol, du socle, des murs */
  const tuileCv=document.createElement('canvas');tuileCv.width=tuileCv.height=128;{const x=tuileCv.getContext('2d'),r=mulberry32(0x7E1E);
    x.fillStyle='#edf0f4';x.fillRect(0,0,128,128);for(let i=0;i<4;i++)for(let j=0;j<4;j++){const X=i*32,Y=j*32,l=(r()*6-3)|0;
      x.fillStyle='rgb('+(243+l)+','+(245+l)+','+(248+l)+')';x.fillRect(X+1,Y+1,30,30);x.fillStyle='#ffffff';x.fillRect(X+1,Y+1,30,2);x.fillRect(X+1,Y+1,2,30);
      x.fillStyle='#f0f2f5';x.fillRect(X+1,Y+29,30,2);x.fillRect(X+29,Y+1,2,30);}}
  const tuile=function(rx,ry){const t=new THREE.CanvasTexture(tuileCv);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rx,ry);t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());return t;};
  GBQ.tuile=tuile;
  // LE SOL : en blanc structuré (des dalles de ~34 cm), à perte de vue
  const tS=cvT(512,512,function(x,w,h){const gr=x.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);gr.addColorStop(0,'#ffffff');gr.addColorStop(.25,'#f8f9fa');gr.addColorStop(1,'#eceff2');x.fillStyle=gr;x.fillRect(0,0,w,h);});
  const sol=new THREE.Mesh(new THREE.CircleGeometry(R*.97,64),B(0xffffff,{map:tuile(R*2*.97/1.36,R*2*.97/1.36)}));sol.rotation.x=-Math.PI/2;sol.material.color.setScalar(3.4);g.add(sol);bq161(g); /* (2026-10-13, Léo : « le sol de la boutique plus blanc, comme les socles qui tiennent les bras robots ») ×1,75 → ×3,4 (mesuré : 220 → 234, le blanc du fond) : le gris lavande devient blanc, les joints des dalles restent à peine lisibles */ // (2026-10-13, Léo : « le reflet en bas, c'est bof ») le sol miroir est retiré
  // (v3, Léo : « il y a juste l'ombre de la voiture ») plus de grille ni d'anneaux
  /* LE TRÔNE (2026-10-12, Léo : « une compo comme si la voiture était sur son trône ; la lueur en mode pics, comme l'iconographie de Jésus ;
     inspiré des compositions néo-classiques ; quelque chose qui met en avant la voiture ») : un socle de marbre à trois gradins cerclés d'or
     pâle, deux colonnes et une architrave derrière (le repère suit la caméra : la composition reste SYMÉTRIQUE autour de la caisse) ; la
     GLOIRE (rayons d'or pâle, longs et courts, une auréole) derrière elle — voir garBqGloire. */
  {
   /* (2026-10-14, Léo : « enlève les marches : la pièce blanche complète, juste les bras robots et tout ça ») plus de gradins (retirés du code
      le 18/10) ; les bras et leur plateau sortent du SOL (socleH ≈ 0, mais jamais 0 : plusieurs tests le lisent comme « il y a un socle ») */
   GBQ.socleH=.01;
   /* (2026-10-14, Léo : « essayons juste la salle blanche sans piliers ») la rotonde de seize colonnes laquées n'est plus posée (retirée du code le 18/10) */
   /* LA POUSSIÈRE D'OR (même demande, l'ambiance) : 90 grains carrés qui dérivent lentement dans la lumière autour de la caisse (bqPoussiere) */
   {const N=90,P=new Float32Array(N*3),r=mulberry32(0xD057);for(let i=0;i<N;i++){const a=r()*Math.PI*2,d=.8+r()*4.2;P[3*i]=Math.sin(a)*d;P[3*i+1]=.5+r()*4.5;P[3*i+2]=Math.cos(a)*d;}
    const ge=new THREE.BufferGeometry();ge.setAttribute('position',new THREE.BufferAttribute(P,3));
    const pt=new THREE.Points(ge,new THREE.PointsMaterial({color:0xe8b257,size:.045,sizeAttenuation:true,transparent:true,opacity:.7,depthWrite:false,fog:false}));pt.frustumCulled=false;g.add(pt);GBQ.poussiere=pt;GBQ.poussP0=P.slice();}}
  {const cv=document.createElement('canvas');cv.width=cv.height=1024;const x=cv.getContext('2d'),c0=512;
   {const gr=x.createRadialGradient(c0,c0,0,c0,c0,340);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.42,'rgba(255,246,228,.9)');gr.addColorStop(1,'rgba(255,240,215,0)');x.fillStyle=gr;x.fillRect(0,0,1024,1024);}
   const N=48;for(let i=0;i<N;i++){const a=i/N*Math.PI*2,L=i%2?330:505,w=i%2?.02:.032,gr=x.createRadialGradient(c0,c0,95,c0,c0,L);
     gr.addColorStop(0,'rgba(255,150,40,.72)');gr.addColorStop(.45,'rgba(255,196,70,.4)');gr.addColorStop(1,'rgba(255,214,110,0)');x.fillStyle=gr;x.beginPath();
     x.moveTo(c0+Math.cos(a-w)*95,c0+Math.sin(a-w)*95);x.lineTo(c0+Math.cos(a)*L,c0+Math.sin(a)*L);x.lineTo(c0+Math.cos(a+w)*95,c0+Math.sin(a+w)*95);x.closePath();x.fill();}
   x.strokeStyle='rgba(246,148,48,.72)';x.lineWidth=5;x.beginPath();x.arc(c0,c0,176,0,Math.PI*2);x.stroke();x.lineWidth=2;x.beginPath();x.arc(c0,c0,158,0,Math.PI*2);x.stroke();
   GBQ.gloire=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(cv),transparent:true,opacity:0,depthWrite:false,fog:false}));
   GBQ.gloire.renderOrder=4;GBQ.gloire.visible=false;scene.add(GBQ.gloire);
   /* (2026-10-14, Léo : « la plate sous la voiture ») la gloire, plantée derrière la caisse, descend sous le sol : le sol la tranchait d'un trait
      net (sur le blanc, on croyait voir un sol invisible). Elle s'EFFACE en approchant du sol (alpha × lissé sur la hauteur du monde). */
   {const U=GBQ.gloireU={uY0:{value:0},uY1:{value:1}};GBQ.gloire.material.onBeforeCompile=function(sh){sh.uniforms.uY0=U.uY0;sh.uniforms.uY1=U.uY1;
     sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying float vWy;').replace('#include <project_vertex>','#include <project_vertex>\nvWy=(modelMatrix*vec4(transformed,1.)).y;');
     sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying float vWy;uniform float uY0;uniform float uY1;').replace('#include <dithering_fragment>','gl_FragColor.a*=smoothstep(uY0,uY1,vWy);\n#include <dithering_fragment>');};}} /* (three r128 : pas d'output_fragment dans la matière de base — l'accroche est le dithering) */
  const tOmb=cvT(128,128,function(x,w,h){const gr=x.createRadialGradient(64,64,0,64,64,64);gr.addColorStop(0,'rgba(20,24,30,.55)');gr.addColorStop(1,'rgba(20,24,30,0)');x.fillStyle=gr;x.fillRect(0,0,w,h);});
  GBQ.omb=new THREE.Mesh(new THREE.PlaneGeometry(1,1),B(0x000000,{map:tOmb,transparent:true,opacity:.5,depthWrite:false}));GBQ.omb.rotation.x=-Math.PI/2;GBQ.omb.position.y=(GBQ.socleH||0)+.006;GBQ.omb.renderOrder=3;g.add(GBQ.omb);
  // L'ONDE DU BOUM : dans la scène (elle part encore dans l'atelier)
  GBQ.choc=new THREE.Mesh(new THREE.RingGeometry(.86,1,56),new THREE.MeshBasicMaterial({color:0xdfe7ff,transparent:true,opacity:0,depthWrite:false,fog:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide}));
  GBQ.choc.rotation.x=-Math.PI/2;GBQ.choc.visible=false;scene.add(GBQ.choc);
}
/* LE SON DE LA BOUTIQUE (2026-10-14, Léo : « et la boutique a son propre son ambiant ») : la musique du lobby s'y tait toujours (13/10 :
   « le sound design est terrifiant ») — la salle blanche a désormais SA voix, douce : une NAPPE DE VERRE (cinq voix, chacune un sinus et un
   triangle à peine désaccordés, sous 1,9 kHz) qui glisse toutes les 9 s entre deux accords de la pentatonique des petits sons (E 6/9 ↔
   C#m7(11), transposés sur la tonalité du moment, `sonTonSuit._t` : les clics restent justes), l'AIR de la salle (un souffle très aigu,
   très bas) et, toutes les 2,5-6 s, une petite note CRISTALLINE avec son écho. Bus des effets (MASTER). Monte en 1,2 s quand la boutique
   s'ouvre, s'efface en 0,6 s quand on en sort. */
const BQSON={n:null,off:0,acc:0,tP:0,atelier:false},BQSON_VOL=1;
/* (même soir, Léo : « session débogage sonore : à la boutique, au début, ça fait un bruit louche ») MESURÉ au banc muet (journal des sons +
   enregistrement de la sortie à l'ouverture de la boutique) : l'ATELIER continuait de sonner dans la salle blanche — `garage.ambiance` (le
   bourdon des néons, le tube qui GRÉSILLE) et `garage.feu` (la porte en feu qui gronde et crépite), aussi forts que la nouvelle nappe, sous le
   glitch (`ui.volet`) et la musique qui s'efface. En boutique, ces deux boucles plongent à −45 dB (0,35 s) ; au retour à l'atelier, le néon
   remonte et le feu reprend le niveau que lui donne garFeu. La nappe de la boutique arrive après le glitch (montée plus lente). */
function bqAtelierSourdine(on){
  /* (2026-10-14, session SON, relevé par GENERAL) la sourdine suit aussi les boucles qui NAISSENT en boutique : SON coupé à l'entrée (ou
     banque pas prête), le néon et le feu n'existaient pas encore ; la boucle principale les crée ensuite (toutes les 800 ms) et ils
     repartaient à plein dans la salle blanche — le « bruit louche » revenait en rallumant SON. On réapplique dès que l'une d'elles change. */
  const a9=openGarage._amb||null,f9=openGarage._feu||null;
  if(BQSON.atelier===on&&BQSON.amb9===a9&&BQSON.feu9===f9)return;BQSON.atelier=on;BQSON.amb9=a9;BQSON.feu9=f9;
  try{if(openGarage._amb)openGarage._amb.gain(on?-45:0,on?.12:.25);}catch(e){}
  try{if(openGarage._feu){if(on)openGarage._feu.gain(-45,.12);else if(GAR.porte)GAR.porte.db=null;else openGarage._feu.gain(0,.25);}}catch(e){}
}
const BQSON_ACC=[[52,59,66,68,73],[49,56,64,66,71]]; // E 6/9 (mi · si · fa# · sol# · do#) ↔ C#m7(11) (do# · sol# · mi · fa# · si) : chaque voix glisse d'un pas
function bqSon(dt,on){
  bqAtelierSourdine(!!on);
  if(on&&BQ_MUSIQUE&&SND.music)on=false; /* (2026-10-16, Sacha) la musique du garage a suivi : la nappe se tait (voir BQ_MUSIQUE) — l'atelier, lui, reste en sourdine */
  if(!on){if(BQSON.n&&!BQSON.off)bqSonCoupe(.6);return;}
  if(!AC||AC.state!=='running'||!SND.sfx)return;
  let n=BQSON.n;const now=AC.currentTime,ton=(sonTonSuit._t|0);
  if(!n){
    const g=AC.createGain();g.gain.value=0;g.connect(MASTER);
    const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=1900;lp.Q.value=.3;lp.connect(g);
    const V=[];BQSON.acc=0;
    for(const m of BQSON_ACC[0]){const f=440*Math.pow(2,(m+ton-69)/12),gv=AC.createGain();gv.gain.value=.006;gv.connect(lp);
      const a=AC.createOscillator(),b=AC.createOscillator();a.type='sine';b.type='triangle';a.frequency.value=f;b.frequency.value=f;b.detune.value=6;a.detune.value=-4;
      a.connect(gv);b.connect(gv);a.start();b.start();V.push({a:a,b:b,g:gv});}
    const air=AC.createBufferSource();air.buffer=noiseBuf(2.7);air.loop=true;
    const ah=AC.createBiquadFilter();ah.type='highpass';ah.frequency.value=4200;const al=AC.createBiquadFilter();al.type='lowpass';al.frequency.value=9000;
    const ag=AC.createGain();ag.gain.value=.0028;air.connect(ah); // l'air de la salle — (2026-10-14, Léo : « alléger un tout petit peu le bruit constant ») .004 → .0028 (−3 dB)ah.connect(al);al.connect(ag);ag.connect(g);air.start();
    const ec=AC.createDelay(1);ec.delayTime.value=.38;const eg=AC.createGain();eg.gain.value=.35;const pg=AC.createGain();pg.gain.value=1;
    pg.connect(g);pg.connect(ec);ec.connect(eg);eg.connect(ec);eg.connect(g);
    n=BQSON.n={g:g,lp:lp,V:V,air:air,pg:pg,ec:ec,eg:eg,t:0,tA:0};BQSON.tP=1.5;
  }
  if(BQSON.off){clearTimeout(BQSON.off);BQSON.off=0;}
  n.t+=dt;stt(n.g.gain,BQSON_VOL*(.85+.15*Math.sin(n.t*.31))*Math.min(1,Math.max(0,(n.t-.35)/.5)),now,.45); // elle attend la fin du glitch (~0,35 s) puis monte
  n.tA+=dt;if(n.tA>9){n.tA=0;BQSON.acc^=1;}                                   // l'accord change toutes les 9 s, chaque voix glisse en ~1,5 s
  const A=BQSON_ACC[BQSON.acc];
  for(let i=0;i<n.V.length;i++){const f=440*Math.pow(2,(A[i]+ton-69)/12);stt(n.V[i].a.frequency,f,now,.5);stt(n.V[i].b.frequency,f,now,.5);
    stt(n.V[i].g.gain,.006*(.75+.25*Math.sin(n.t*(.13+.07*i)+i)),now,.6);}
  BQSON.tP-=dt;if(BQSON.tP<=0){BQSON.tP=2.5+Math.random()*3.5;              // la note cristalline : une note de la pentatonique, haut, qui s'éteint en ~2,5 s
    const PENTA=[0,2,4,7,9],m=76+PENTA[(Math.random()*5)|0]+12*((Math.random()*2)|0)+ton;
    try{const o=AC.createOscillator(),og=AC.createGain(),t0=AC.currentTime+.02;o.type='sine';o.frequency.value=440*Math.pow(2,(m-69)/12);
      og.gain.setValueAtTime(0,t0);og.gain.linearRampToValueAtTime(.022,t0+.006);og.gain.setTargetAtTime(0,t0+.01,.8);
      o.connect(og);og.connect(n.pg);o.start(t0);o.stop(t0+4);}catch(e){}}
}
function bqSonCoupe(d){const n=BQSON.n;if(!n||!AC)return;
  try{n.g.gain.cancelScheduledValues(AC.currentTime);n.g.gain.setTargetAtTime(0,AC.currentTime,d/3);n.g.gain._s9=0;}catch(e){}
  clearTimeout(BQSON.off);BQSON.off=setTimeout(function(){if(BQSON.n!==n)return;try{for(const v of n.V){v.a.stop();v.b.stop();}n.air.stop();n.g.disconnect();n.eg.disconnect();}catch(e){}BQSON.n=null;BQSON.off=0;},d*1000+500);}
window.dbgBqSon=function(){return {on:!!BQSON.n,gain:BQSON.n?+BQSON.n.g.gain.value.toFixed(4):0,acc:BQSON.acc,veut:!!(typeof GBQ!=='undefined'&&GBQ.veut)};}; // (dev)
function garBqAmbiance(on){garLibre._r=null; // (v3) au BASCULEMENT (pic de la lueur) : la lumière, et les voiles d'encre du garage retirés (#garage.bqBlanc)
  if(gEl)gEl.classList.toggle('bqBlanc',on);try{bioApply(on?bqBio():BIOMES.atelier);}catch(e){}}
function bqVoile(v){let w=document.getElementById('gBqVoile'); // LE VOILE de la bascule garage ⇄ boutique (voir garBqIndus et LE SOUFFLE DE LUMIÈRE) : v=true blanc, false nuit, null = il se lève
  if(!w){w=document.createElement('div');w.id='gBqVoile';w.setAttribute('aria-hidden','true');document.body.appendChild(w);}
  clearTimeout(bqVoile._t);clearTimeout(bqVoile._t2);const cv=renderer.domElement,rm=REDUCED_MOTION;
  if(v===null){ // dessous, l'écran neuf est en place : l'image part un peu trop près (bqPose, sans transition), puis, deux images plus tard (l'écran neuf est peint), le voile se lève et l'image se pose
    cv.classList.remove('bqPasse','bqArrive');cv.classList.add('bqPose');
    requestAnimationFrame(function(){requestAnimationFrame(function(){cv.classList.remove('bqPose','recul');cv.classList.add('bqArrive');w.classList.add('leve');
      bqVoile._fin=performance.now()+(rm?220:560);bqVoile._t2=setTimeout(function(){cv.classList.remove('bqArrive');cv.style.transformOrigin='';},700);});});
    bqVoile._fin=performance.now()+1200;bqVoile._t=setTimeout(function(){w.className='';},rm?400:900);return;}
  // la lumière naît sur la caisse : son centre à l'écran
  try{const p=GBQ._vf||(GBQ._vf=new THREE.Vector3());carGroup.getWorldPosition(p);p.y+=.55;p.project(camera);
    if(p.z<1&&Math.abs(p.x)<1.5&&Math.abs(p.y)<1.5){const x=(p.x*.5+.5)*100,y=(.5-p.y*.5)*100;w.style.setProperty('--fx',x.toFixed(1)+'%');w.style.setProperty('--fy',y.toFixed(1)+'%');cv.style.transformOrigin=x.toFixed(1)+'% '+y.toFixed(1)+'%';}}catch(e){}
  w.className=v?'blanc':'nuit';void w.offsetWidth;w.classList.add('on');
  cv.classList.remove('bqPose','bqArrive');cv.classList.toggle('recul',!v);void cv.offsetWidth;cv.classList.add('bqPasse');
  bqVoile._fin=performance.now()+2e3;
  bqVoile._t=setTimeout(function(){if(!GBQ.bascule){GBQ.bascule=true;GBQ.on=GBQ.veut;bqClasses(GBQ.veut);try{garBqAmbiance(GBQ.veut);}catch(e){}}bqVoile(null);},1400);} // filet : jamais de voile collé ni d'interface à moitié basculée (onglet caché, garage quitté en plein geste)
function bqClasses(on){document.documentElement.classList.toggle('bqIndus',on);if(gEl)gEl.classList.toggle('bqIndus',on);garLibre._r=null;} // dès le geste : l'interface du garage s'efface
/* LA LUEUR DERRIÈRE LA CAISSE (v3) : un disque blanc tourné vers la caméra, posé DERRIÈRE la caisse (elle reste devant : il est caché par
   elle), qui grandit jusqu'à couvrir le garage ; une nappe blanche s'étale au sol depuis sous elle. Deux objets de la scène (hors de
   l'atelier : ils survivent au basculement), blancs au-delà de 1 (le bloom les fait rayonner). */
function garBqLueurBatit(){if(GBQ.halo)return;
  const cv=document.createElement('canvas');cv.width=cv.height=256;const x=cv.getContext('2d'),gr=x.createRadialGradient(128,128,0,128,128,128);
  gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.45,'rgba(255,255,255,1)');gr.addColorStop(.72,'rgba(255,255,255,.55)');gr.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=gr;x.fillRect(0,0,256,256);
  const t=new THREE.CanvasTexture(cv),m=function(){const mt=new THREE.MeshBasicMaterial({map:t,transparent:true,opacity:0,depthWrite:false,fog:false});mt.color.setScalar(1.3);return mt;};
  GBQ.halo=new THREE.Mesh(new THREE.PlaneGeometry(1,1),m());GBQ.halo.visible=false;GBQ.halo.renderOrder=5;scene.add(GBQ.halo);
  GBQ.nappe=new THREE.Mesh(new THREE.PlaneGeometry(1,1),m());GBQ.nappe.rotation.x=-Math.PI/2;GBQ.nappe.visible=false;GBQ.nappe.renderOrder=4;scene.add(GBQ.nappe);}
function garBqGloire(dt,t9){const G9=GBQ.gloire;if(!G9)return;if(GBQ.gloireU&&GBQ.grp){const y0=GBQ.grp.position.y+(GBQ.socleH||0);GBQ.gloireU.uY0.value=y0+.15;GBQ.gloireU.uY1.value=y0+1.6;}
  const kg=GBQ.on?Math.min(1,Math.max(0,(GBQ.t-.95)/.75)):Math.max(0,(GBQ.gk||0)-dt*5);GBQ.gk=kg;G9.visible=kg>.01;if(!G9.visible)return;
  const v=GBQ._vg||(GBQ._vg=new THREE.Vector3()),d=GBQ._dg||(GBQ._dg=new THREE.Vector3());carGroup.getWorldPosition(v);v.y+=.5;
  d.copy(v).sub(camera.position);d.y=0;d.normalize();G9.position.copy(v).addScaledVector(d,3.6);G9.quaternion.copy(camera.quaternion);G9.rotateZ(t9*.045);
  const e=kg*kg*(3-2*kg),fl9=GBQ.gFlash||0,sc=(13-3.2*e)*(1+.22*fl9*fl9);G9.scale.set(sc,sc,1);G9.material.opacity=Math.min(1,e*.95+.25*fl9);}
function garBqLueur(ay){const g=GBQ.lueur||0;garBqLueurBatit();const vis=g>.002;GBQ.halo.visible=GBQ.nappe.visible=vis;if(!vis)return;
  const v=GBQ._vl||(GBQ._vl=new THREE.Vector3()),d=GBQ._dl||(GBQ._dl=new THREE.Vector3());carGroup.getWorldPosition(v);v.y+=.55;
  d.copy(v).sub(camera.position);d.y=0;d.normalize();GBQ.halo.position.copy(v).addScaledVector(d,2.8);GBQ.halo.quaternion.copy(camera.quaternion);
  const e=g*g,s=1.2+80*e;GBQ.halo.scale.set(s,s,1);GBQ.halo.material.opacity=Math.min(1,g*1.7);
  const sn=2.5+90*Math.pow(g,1.6);GBQ.nappe.position.set(v.x,ay+GAR.POD+.016,v.z);GBQ.nappe.scale.set(sn,sn,1);GBQ.nappe.material.opacity=Math.min(1,g*1.5);}
/* L'INTERFACE DE LA BOUTIQUE v3 (2026-10-12, Léo : « le petit nom de la voiture en plus petit, mieux placé ; d'abord la boutique des
   voitures que tout le monde peut acheter, avec les pièces, et à côté on peut sélectionner les offres ; l'orange n'est pas beau, trouve
   quelque chose qui se marie mieux avec le blanc ») : l'accent devient un BLEU ÉLECTRIQUE (#3d4bff) sur blanc et noir. En haut à gauche
   BOUTIQUE, et dessous, en petit, la caisse affichée (rareté · nom · ÉDITION LIMITÉE et son compte à rebours) ; l'argent à droite. En bas :
   deux onglets — VOITURES (en pièces, pour tout le monde : bqPieces) d'abord, OFFRES (les éditions limitées de la semaine, en €,
   introuvables en jeu : bqEphemeres) à côté — et la rangée de vignettes ; RETOUR et ACHETER (noir) sous le pouce. */
function bqFigHab(k){const o=bqCos(k),d=o.d,hx=function(c9){return '#'+(c9>>>0).toString(16).padStart(6,'0');};
  if(o.cat==='figure')return '<i class="bqFig">'+pxi('rotation')+'</i>';
  if(o.cat==='peinture')return '<i class="bqSw" style="background:'+(d.mot?motFond(d):d.grad?'linear-gradient(150deg,'+d.grad.map(hx).join(',')+')':hx(d.c||0xff7a3a))+'"></i>';
  if(o.cat==='trainee'){const I9=illuTr(d);if(I9)return illuPx(I9,'bqTrIc');} // (2026-10-14) une traînée POP : son pictogramme — (2026-10-16, TRAÎNÉES) TOUTES les traînées, et EN COULEUR (celui de l'inventaire) : en noir sur la salle blanche, SAKURA, MATRICE et LA GRILLE se ressemblaient ; NITRO, MENTHE, ROSE et OR n'étaient qu'un dégradé
  if(o.cat==='trainee')return '<i class="bqRub" style="background:'+(d.rainbow?'linear-gradient(90deg,#ff3b3b,#ff9b1a,#ffe23a,#3bff6a,#3bb4ff,#9b5bff)':'linear-gradient(90deg,rgba(255,255,255,0),'+(d.rgb?'rgb('+d.rgb.map(function(v){return Math.round(Math.min(1,v/1.45)*255);}).join(',')+')':'#ff6a14')+' 45%,#fff)')+'"></i>';
  return pxi(d.ico||'aile');}
function bqPieces(){const L=[];for(let i=0;i<CARS.length;i++){const u=CAR_UNLOCK[i];if(carRetiree(i))continue;if(u&&u.p>0&&u.k!=='premium')L.push([i,0]);else if(u&&u.k==='mis')L.push([i,1]);} /* les caisses qui s'achètent en PIÈCES (0) et celles des missions (1) */
  /* (2026-10-20, Sacha : « dans le menu cars du garage c'est le bordel, plusieurs sections de la même rareté : toutes les voitures d'une même rareté dans la même section ») UN SEUL CLASSEMENT, le même
     que celui des intertitres (bqVoitRail) : RARETÉ (l'ordre de RARETES : COMMUNES, RARES, ÉPIQUES…), puis dans la famille ce qui s'achète (du moins cher au plus cher) AVANT les missions ; les secrètes
     (m2Secrete, pas encore à toi) en dernier. Plus de liste figée : une secrète qu'on gagne quittait la fin de la liste en gardant sa rareté et rouvrait une 2e section de la même famille. */
  const g9=function(i){return m2Secrete(i)?99:Math.max(0,RARETES.findIndex(function(x){return x.id===carRar(i);}));};
  return L.sort(function(a,b){return (g9(a[0])-g9(b[0]))||(a[1]-b[1])||(a[1]?0:CAR_UNLOCK[a[0]].p-CAR_UNLOCK[b[0]].p)||(a[0]-b[0]);}).map(function(e){return e[0];});}
/* (2026-10-18) l'INTERTITRE de chaque famille dans le rayon VOITURES (comme ceux des figures) : le logo de la rareté à sa couleur, son nom, le
   nombre de caisses ; les missions secrètes ont le leur. `n` = nombre de caisses de la famille dans la liste. */
function bqRarSec(r,n,a){const cpt='<em><i>'+a+'</i>/'+n+'</em>'; /* (2026-10-20) « ceux à toi / le total » de la famille */
  if(r==='secret')return '<div class="bqSec bqRarS" data-rar="secret" style="--rc:#ff3ec8"><span class="bqRl">'+pxi('verrou')+'</span><b>'+sansAcc(TR('MISSIONS SECRÈTES'))+'</b><s></s>'+cpt+'</div>';
  const ri=rarInfo(r);return '<div class="bqSec bqRarS" data-rar="'+r+'" style="--rc:'+ri.c+'"><span class="bqRl">'+pxi(RAR_LOGO[r]||'etoile')+'</span><b>'+sansAcc(TR(ri.n))+'</b><s></s>'+cpt+'</div>';}
function bqVoitRail(L){const fam=function(k){const i=+k.slice(2);return m2Secrete(i)?'secret':carRar(i);},nb={},ok={};L.forEach(function(k){const f=fam(k);nb[f]=(nb[f]|0)+1;if(bqA(k))ok[f]=(ok[f]|0)+1;});
  return L.map(function(k,n){const f=fam(k);return (n&&fam(L[n-1])===f?'':bqRarSec(f,nb[f],ok[f]|0))+bqCarteHtml(k,n,false);});} /* (2026-10-16) LES MISSIONS v2 : après les caisses à pièces, celles des missions, puis les secrètes en silhouette */
function bqPxT(v){return fmtSolde(v);} /* (clarté 15/10) les prix de la boutique de Léo au format GTA de GAMEPLAY (chiffres pleins, un seul « $ ») */
function bqPxLg(t){return String(t).replace(/<[^>]*>/g,'').length>9;} /* un prix long (≥ 1 000 000) passe un corps en dessous : il tient dans sa carte */
function bqPrixCaisse(i){const u=CAR_UNLOCK[i]||{};if(bqA('v:'+i))return {t:sansAcc(TR('À TOI')),c:'acq'};if(m2Secrete(i))return {t:sansAcc(TR('MISSION SECRÈTE')),c:'defi sec'};if(u.k==='premium')return {t:eurTxt(u.eur),c:'eur'};
  if(u.p)return {t:bqPxT(u.p),c:'pc'};return {t:sansAcc(TR('MISSION')),c:'defi'};}
/* L'INTERFACE v4 (2026-10-12, Léo : « l'argent à côté de BOUTIQUE, et la boutique peut encore prendre tout cet espace ; le bouton VOITURES
   laisse choisir entre les traînées… ; sur le côté gauche qui défile, ce sont les objets hebdomadaires ») :
   · en-tête : BOUTIQUE et, juste à côté, l'argent ; dessous en petit ce qu'on regarde ; couché, la boutique monte jusqu'en haut à droite ;
   · onglets : le 1er dit la CATÉGORIE (VOITURES · PEINTURES · AILES · TRAÎNÉES) — retouché, il ouvre le choix (#gBqPan .bqMenu) —, le 2e les OFFRES ;
   · la colonne de gauche, qui défile : CETTE SEMAINE — trois caisses et trois habillages tirés sur la semaine (bqSemaine). */
/* (2026-10-15, Sacha) ACHAT : à la place de l'onglet OFFRES — TOUTES les caisses payantes (bqAchat), plus seulement les quatre de la semaine */
const BQ_CATS=[['figure','FIGURES','rotation'],['voiture','VOITURES','voiture'],['achat','ACHAT','panier'],['peinture','PEINTURES','pinceau'],['aile','AILES','aile'],['trainee','TRAÎNÉES','trainee']]; // (2026-10-14) FIGURES : les tricks du double-tap nitro (figures.js)
/* LES FIGURES PAR DIRECTION (2026-10-15, Sacha : « dans la boutique classe toutes les figures selon ces deux catégories » · puis « mets aussi
   une catégorie vers l'ARRIÈRE ; une même figure doit avoir marqué à quelle direction elle peut aller ») : VERS L'AVANT (pouce en avant), VERS
   L'ARRIÈRE (pouce en arrière), SUR LES CÔTÉS (pouce à gauche ou à droite : elle part de ce côté). Une figure à deux sens (rodéo, tire-bouchon,
   cosmique) a sa carte dans CHACUNE de ses sections : la carte porte sa direction (`data-dir`), ÉQUIPER la met dans CET emplacement (bqFigDir).
   Dans chaque section, l'ordre du catalogue (du moins cher au plus cher). Un intertitre `.bqSec` (bqFigSec) ouvre chaque section : ce n'est
   pas une carte — ni clic, ni compte (le compte de l'onglet reste celui des figures, une fois chacune : bqListe). */
function bqFigSec(c){const F=FIG_FAM[c];return '<div class="bqSec" data-fam="'+c+'">'+pxi(F[2])+'<b>'+sansAcc(TR(F[0]))+'</b><em>'+sansAcc(TR(F[1]))+'</em></div>';}
function bqFigRail(){const R=[];if(!window.FIG)return R;for(let c=0;c<FIG_NB;c++)FIG.liste.forEach(function(f){if(figPeut(f.id).indexOf(c)>=0)R.push({k:'figure:'+f.id,c:c});});return R;}
function bqFigDir(id){const P=figPeut(id);return GBQ.figDir!=null&&P.indexOf(GBQ.figDir)>=0?GBQ.figDir:P[0];} // la direction de la carte touchée (sinon la 1re de la figure)
/* LES TROIS FIGURES ÉQUIPÉES, EN HAUT DU RAYON FIGURES (2026-10-16, Sacha : « dans la boutique, quand on arrive dans les figures, le truc des
   hexagones que tu avais mis dans l'inventaire, faut que tu le remettes, version adaptée, dans la boutique » · « tout en haut, tu remets les
   hexagones comme tu avais mis, mais en blanc ») — le sélecteur de l'inventaire (#gFigSel, voir gFigSelMaj : l'éclair du NITRO et « ×2 », puis
   les trois cases hexagonales ↑ avant · ↓ arrière · ◄► côté, la figure équipée qui tourne dedans, son nom dessous) redessiné pour la salle
   blanche : #bqFigSel, en haut du panneau, AU-DESSUS de la grille — il ne défile pas avec elle, on voit ce qu'on porte en feuilletant (son
   dessin : <style id="bqFigHex">). Toucher une case = toucher la carte de SA figure dans SA direction (essayée sur le plateau, le bouton dit
   ÉQUIPÉE) et l'amener en vue ; une case VIDE amène l'intertitre de sa direction. ÉQUIPER une figure (bqAction) fait flasher la case qui la
   reçoit ; la case de la figure qu'on regarde prend l'anneau d'encre, comme la carte choisie. */
const BQFS={k:'',S:null};
function bqFigSelEl(pan){let el=document.getElementById('bqFigSel');if(el)return el;
  el=document.createElement('div');el.id='bqFigSel';el.setAttribute('role','group');
  el.innerHTML='<div class="fsNitro" aria-hidden="true">'+gFigNitroSvg()+'<b>×2</b></div>'
    +FIG_FAM.map(function(F,k){return '<button type="button" class="fsHex" data-k="'+k+'"><span class="fsCase"><span class="fsIn"></span></span><i class="fsJoy">'+pxi(F[2])+'</i><b class="fsNom"></b></button>';}).join('');
  pan.insertBefore(el,pan.firstChild);
  el.addEventListener('click',function(e){const b=e.target.closest&&e.target.closest('.fsHex');if(!b)return;e.stopPropagation();if(!garageOn||GAR.go||ecranWipe._on||!GBQ.on)return;
    const k=+b.getAttribute('data-k'),id=figSlots()[k],rail=pan.querySelector('.bqRail');uiPop(b);if(!rail)return;
    const sec=rail.querySelector('.bqSec[data-fam="'+k+'"]'),ci=id?rail.querySelector('.bqK[data-k="figure:'+id+'"][data-dir="'+k+'"]'):sec;
    if(ci){const r0=rail.getBoundingClientRect().top,rc=ci.getBoundingClientRect(),rs=sec&&sec.getBoundingClientRect(); // l'intertitre de la direction reste en vue si la carte tient dessous
      const y=Math.max(0,rail.scrollTop+(rs&&rc.bottom-rs.top<=rail.clientHeight?rs.top-r0-2:rc.top-r0-6));try{rail.scrollTo({top:y,behavior:REDUCED_MOTION?'auto':'smooth'});}catch(e2){rail.scrollTop=y;}}
    if(id&&ci)ci.click();else{uiClic('onglet');hap(6);}}); // la carte touchée fait le reste : l'essai, le son, le cadre .sel
  return el;}
function bqFigSelMaj(pan,on){if(!on||!window.FIG)return;const el=bqFigSelEl(pan);
  const S=figSlots(),cur=bqCourant(),k=S.join(',')+'|'+cur+'|'+GBQ.figDir+'|'+LANG;if(BQFS.k===k)return;BQFS.k=k;
  const P=BQFS.S;BQFS.S=S.slice();el.setAttribute('aria-label',sansAcc(TR('FIGURES ÉQUIPÉES')));
  el.querySelectorAll('.fsHex').forEach(function(b){const s=+b.getAttribute('data-k'),id=S[s],f=id&&FIG.par[id],c=f?rarInfo(cosmRar('figure',f)).c:'#d3d8de',nm=f?sansAcc(TR(f.n)):sansAcc(TR('VIDE'));
    const vu=!!f&&cur==='figure:'+id&&(GBQ.figDir==null?bqFigDir(id)===s:GBQ.figDir===s),ik=(id||'')+c;
    b.style.setProperty('--fc',c);b.classList.toggle('vide',!f);b.classList.toggle('on',vu);b.setAttribute('aria-pressed',vu);
    if(b._ik!==ik){b._ik=ik;b.querySelector('.fsIn').innerHTML=f?illuFig(id,c,s===0):'<b class="fsQ">?</b>';} // réécrit seulement si la figure change : sa rotation ne repart pas à chaque carte touchée
    b.querySelector('.fsNom').textContent=nm;b.setAttribute('aria-label',sansAcc(TR(FIG_FAM[s][0]))+' : '+nm);
    if(P&&P[s]!==S[s]&&f){b.classList.remove('flash');void b.offsetWidth;b.classList.add('flash');}});}
function bqAchat(){const eu=function(i){return parseFloat(String((CAR_UNLOCK[i]||{}).eur||'').replace(',','.'))||0;},une=function(i){return CAR_UNLOCK[i]&&CAR_UNLOCK[i].une?0:1;}; // l'offre de lancement (`une`) en tête, puis de la moins chère à la plus chère
  return bqPayantes().slice().sort(function(a,b){return (une(a)-une(b))||(eu(a)-eu(b))||(a-b);});}
function bqListe(cat){if(cat==='voiture')return bqPieces().map(function(i){return 'v:'+i;});if(cat==='achat')return bqAchat().map(function(i){return 'v:'+i;});if(cat==='figure')return window.FIG?FIG.liste.map(function(f){return 'figure:'+f.id;}):[];if(cat==='peinture')return peintOrdre().map(function(j){return 'peinture:'+COSM.peinture[j].id;}); /* (2026-10-16) rangées par RARETÉ (voir peintOrdre) */ return (COSM[cat]||[]).map(function(d){return cat+':'+d.id;});}
function bqCarteHtml(k,n,lim,dir){const vo=k[0]==='v',i=vo?+k.slice(2):-1,o=vo?null:bqCos(k),d=o&&o.d,a=bqA(k),sec9=vo&&m2Secrete(i);let ri=rarInfo(vo?carRar(i):cosmRar(o.cat,d)),nom=vo?TR(CARS[i].name):TR(d.n);if(sec9){ri={c:'#ff3ec8',n1:'SECRÈTE'};nom='? ? ?';} /* (2026-10-16) une SECRÈTE : ni nom, ni rareté, ni couleur */
  let px,c='';if(vo){const p9=bqPrixCaisse(i);px=(p9.c==='pc'?pxi('piece'):'')+String(p9.t).replace(/</g,'');c=p9.c;}
  else if(a){px=sansAcc(TR('À TOI'));c='acq';}else if(d.pack==='chat'){px=sansAcc(TR('PACK CHAT'));c='eur';}else if(d.eur){px=eurTxt(d.eur);c='eur';}else if(d.p){px=pxi('piece')+bqPxT(d.p);c='pc';}else{px=sansAcc(TR('MISSION'));c='defi';} /* (2026-10-18 soir) l'ARC-EN-CIEL : PACK CHAT (voir chatPackI) */
  if(bqPxLg(px))c+=' lg';
  return '<div class="bqK'+(sec9?' m2sec':'')+(lim?' off':'')+(vo?'':' hab')+'" data-k="'+k+'"'+(dir!=null?' data-dir="'+dir+'"':'')+' role="button" style="--rc:'+ri.c+';--i:'+Math.min(n,8)+'" aria-label="'+String(nom).replace(/"/g,'')+'">'
    +(vo?'<span class="bqKph" data-ph="'+i+'"></span>':o.cat==='aile'?'<span class="bqKph c-aile" data-pha="'+d.id+'"></span>':o.cat==='figure'?'<span class="bqKph c-figure" data-phf="'+d.id+'|'+FIG_DIR[dir!=null?dir:figPeut(d.id)[0]]+'">'+bqFigHab(k)+'</span>':'<span class="bqKph c-'+o.cat+'">'+bqFigHab(k)+'</span>')+(lim&&!(vo&&CAR_UNLOCK[i]&&CAR_UNLOCK[i].une)?'<span class="bqKl">'+sansAcc(TR('LIMITÉE'))+'</span>':'')+(vo&&!a&&i===chatPackI()?'<span class="bqKl arc">'+sansAcc(TR('+ ARC-EN-CIEL'))+'</span>':'')
    +'<span class="bqKr'+(sansAcc(TR(ri.n1)).length>8?' lg':'')+'">'+sansAcc(TR(ri.n1))+'</span><span class="bqKn">'+sansAcc(String(nom))+'</span><span class="bqKp '+c+'">'+px+'</span></div>';} /* (clarté 14/10) la RARETÉ s'écrit sur la carte */
/* LES PHOTOS DES DEUX BOUTIQUES (2026-10-14, session OPTIMISATION — PILOTAGE : « les photos des cartes de la boutique du jour ne s'affichent
   plus »). `bqPhotos` était déclarée DEUX fois : celle des cartes du bandeau de l'atelier (`.fnC` + `.fnPh`, OFFRES ÉPHÉMÈRES / DU JOUR) et
   celle de la boutique de Léo (`[data-ph]`) ; la seconde, hissée, écrasait la première — les cartes du bandeau restaient sans photo. Une
   seule fonction fait les deux (le `[data-ph]` couvre aussi `.fpPh i` et `.fpSlPh` de l'ancienne). */
function bqPhotos(el){
  el.querySelectorAll('.fnC[data-fn^="v:"],.fnC[data-fn^="o:"]').forEach(function(c){const i=+c.getAttribute('data-fn').slice(2);
    photoFile(i,function(url){const ph=c.querySelector('.fnPh');if(ph&&!ph.firstChild){const im=document.createElement('img');im.alt='';im.src=url;ph.appendChild(im);}},c);});
  el.querySelectorAll('[data-ph]').forEach(function(x){photoFile(+x.getAttribute('data-ph'),function(url){if(!x.firstChild){const im=document.createElement('img');im.alt='';im.src=url;x.appendChild(im);}},x);}); /* (2026-10-16) l'élément : la photo attend que la carte soit EN VUE (voir LE STUDIO SANS À-COUPS) */
  el.querySelectorAll('[data-pha]:not(.ok)').forEach(function(x){aileFile(x.getAttribute('data-pha'),function(url){if(x.classList.contains('ok')||!url)return;const im=document.createElement('img');im.alt='';im.src=url;x.textContent='';x.appendChild(im);x.classList.add('ok');},x);}); /* (2026-10-15) les AILES ont leur photo (aileFile) */
  el.querySelectorAll('[data-phf]:not(.ok)').forEach(function(x){const p=x.getAttribute('data-phf').split('|');figFile(p[0],p[1],function(url){if(x.classList.contains('ok')||!url)return;x.classList.add('ok');filmPose(x,url,p[0]);},x);});} /* (2026-10-15 soir) et les FIGURES leur photo-séquence (figFile), dans le sens de leur carte — (2026-10-18) leur FILM au ralenti (filmPose) */
function garBqUI(){let ui=document.getElementById('gBq');if(ui)return ui;
  ui=document.createElement('div');ui.id='gBq';
  ui.innerHTML='<div id="gBqTete"><div class="bqT1"><div class="bqTl"><b data-fr="BOUTIQUE">'+sansAcc(TR('BOUTIQUE'))+'</b><div class="bqArg"><b id="gBqArg"></b></div></div>'
      +'</div></div>'
    +'<div id="gBqNom"><span class="bqRar"></span><span class="bqNom"></span><span class="bqLim">'+pxi('horloge')+'<em></em></span></div>'
    +'<div id="gBqSkins"><b>'+sansAcc(TR('COLORIS'))+'</b><div class="bqSk"></div></div>'
    /* (2026-10-15, Sacha) à la place de CETTE SEMAINE : les RAYONS (voir le CSS « LES RAYONS DE LA BOUTIQUE ») ; plus de barre VOITURES ▾ · OFFRES au-dessus de la grille */
    +'<div id="gBqCats" role="tablist" aria-orientation="vertical">'+BQ_CATS.map(function(c){return '<button type="button" data-c="'+c[0]+'" role="tab" aria-selected="false" aria-label="'+sansAcc(TR(c[1]))+'">'+pxi(c[2])+'<span>'+sansAcc(TR(c[1]))+'</span></button>';}).join('')+'</div>'
    +'<div id="gBqPan"><div class="bqRail"></div></div>';
  gEl.insertBefore(ui,gEl.firstChild);
  {const ga=document.getElementById('gAct');if(ga&&!document.getElementById('gBqBtn')){const bt=document.createElement('div');bt.id='gBqBtn';bt.setAttribute('role','button');bt.tabIndex=0;ga.appendChild(bt);
    bt.addEventListener('click',function(e){e.stopPropagation();if(!garageOn||GAR.go||ecranWipe._on||!GBQ.on)return;uiPop(bt);bqAction();});}}
  const pan=ui.querySelector('#gBqPan'),ok=function(){return garageOn&&!GAR.go&&!ecranWipe._on&&GBQ.on;};
  ui.querySelector('#gBqCats').addEventListener('click',function(e){const b=e.target.closest&&e.target.closest('button');if(!b)return;e.stopPropagation();if(!ok())return;
    uiPop(b);uiClic('onglet');hap(6);const c=b.getAttribute('data-c');if(c!==GBQ.cat||GBQ.ong!=='cat'){GBQ.cat=c;GBQ.ong='cat';GBQ.rk='';}});
  const essaie=function(sel){return function(e){const t=e.target.closest&&e.target.closest(sel);if(!t)return;e.stopPropagation();if(!ok())return;uiPop(t);GSON9=false;pan.classList.remove('menu');{const dd=t.getAttribute('data-dir');GBQ.figDir=dd!=null?+dd:null;}bqEssaie(t.getAttribute('data-k'));if(GSON9)hap(8);else uiClic('nav');/* (2026-10-14, session SON) essayer un objet = la bascule / le geste de l'atelier / la figure : le tick nav ne s'y ajoute plus */};};
  ui.querySelector('.bqRail').addEventListener('click',essaie('.bqK'));
  ui.querySelector('.bqRail').addEventListener('scroll',function(){PHQ.defile=performance.now();},{passive:true}); // (2026-10-16) pas de photo pendant qu'on fait défiler (voir LE STUDIO SANS À-COUPS)
  return ui;}
/* L'AIMANT COUPÉ PENDANT L'ENTRÉE (2026-10-15, session du rangement des figures : « en ouvrant un onglet, la grille s'ouvre défilée de 14 px ») :
   les cartes entrent en glissant de 12 px (bqK) et l'aimant de défilement (scroll-snap) les attrapait EN PLEIN GLISSÉ — la grille restait
   collée à leur position de départ, la 1re rangée rognée de 12 px en haut (MESURÉ : scrollTop 14 sur PEINTURES, AILES, TRAÎNÉES, debout comme
   couché). Le dessin de Léo ne bouge pas : l'aimant est coupé (.entre) le temps que la 1re rangée se pose, puis il revient. */
function bqAimant(rail){clearTimeout(GBQ.aimT);const K=rail.querySelectorAll('.bqK');let j=0;
  if(K.length){const y0=K[0].offsetTop;while(j+1<K.length&&K[j+1].offsetTop===y0)j++;}
  const d=K.length?(parseFloat(K[j].style.getPropertyValue('--i'))||j):0; /* bqK : délai .25 s + --i × 45 ms, puis .38 s de glissé */
  GBQ.aimT=setTimeout(function(){rail.classList.remove('entre');},250+d*45+380+80);}
function garBqPanneau(dt,t9){const ui=garBqUI(),pan=document.getElementById('gBqPan'),voulu=GBQ.on&&gModeM()==='shop'&&!GMODE.paye;
  if(voulu!==GBQ.panOn){GBQ.panOn=voulu;ui.classList.toggle('pan',voulu);pan.classList.remove('menu');garLibre._r=null;GBQ.lay='';GBQ.rk='';GBQ.uk='';GBQ.vu=-1;if(!voulu)GBQ.zone=null;}
  soldeEcrit(document.getElementById('gBqArg'),bank()); /* (2026-10-14) le SOLDE PRÉCIS */
  if((!voulu||SHOP.tab!=='voiture')&&GBQ.sec!=null)GBQ.sec=null; // (missions v2) hors du rayon des caisses, plus de secrète regardée
  if(!voulu)return;
  // LA BOUTIQUE : le rayon choisi dans la colonne de gauche (2026-10-15 : plus d'onglet OFFRES)
  const ong='cat',cat=BQ_CATS.some(function(c){return c[0]===GBQ.cat;})?GBQ.cat:'voiture',L=bqListe(cat),rail=pan.querySelector('.bqRail'),une=document.getElementById('gBqCats');
  const rk=ong+':'+cat+':'+L.map(function(k){return k+(bqA(k)?1:0);}).join(',')+':'+LANG;
  if(GBQ.rk!==rk){GBQ.rk=rk;GBQ.vu=-1;
    une.querySelectorAll('button').forEach(function(b){const c=b.getAttribute('data-c'),on=c===cat,C9=BQ_CATS.find(function(x){return x[0]===c;}),s=b.querySelector('span');b.classList.toggle('on',on);b.setAttribute('aria-selected',on);
      if(C9&&s){const t=sansAcc(TR(C9[1]));if(s.textContent!==t){s.textContent=t;b.setAttribute('aria-label',t);}}});
    rail.classList.remove('off','habs');rail.classList.add('entre');rail.scrollTop=0;rail.scrollLeft=0; /* (2026-10-15, Sacha : « un menu plus grand pour les figures, les ailes, les peintures ») tous les rayons en GRANDES cartes, trois par rangée comme les voitures — à quatre, « D'ORIGINE » se coupait en « D'ORIGIN / E » */
    rail.innerHTML=(cat==='figure'?bqFigRail().map(function(e,n,R){return (n&&R[n-1].c===e.c?'':bqFigSec(e.c))+bqCarteHtml(e.k,n,false,e.c);}):cat==='voiture'?bqVoitRail(L):L.map(function(k,n){return bqCarteHtml(k,n,false);})).join(''); /* (2026-10-18) les voitures : un intertitre par RARETÉ (bqVoitRail) */ /* (2026-10-15) les figures : un intertitre par direction, une carte par direction */bqPhotos(rail);bqAimant(rail);
    pan.classList.toggle('bqFigOn',cat==='figure');BQFS.k='';} /* (2026-10-16, Sacha) les trois figures équipées en haut du rayon FIGURES (voir bqFigSelMaj) */
  if(cat==='figure')try{bqFigSelMaj(pan,true);}catch(e){console.warn('bqFigSel',e);}
  if(cat==='figure')try{filmJoue();}catch(e){} /* (2026-10-18) les films des cartes (voir LE FILM D'UNE FIGURE) */
  /* (clarté 14/10) des cartes restaient blanches : la file du studio photo s'arrête hors garage / sous `quiet` et ne repart qu'à la photo suivante — on la relance, et on re-demande ce qui manque */
  if(PHQ.q.length&&!PHQ.on){PHQ.on=true;requestAnimationFrame(photoTour);}
  else if(!PHQ.q.length&&rail.querySelector('[data-ph]:empty,[data-pha]:not(.ok),[data-phf]:not(.ok)'))bqPhotos(rail);
  bqBoutonMaj();
  /* CE QU'ON REGARDE (2026-10-12, Léo : « le nom de la voiture et la rareté au-dessus de la voiture ; en dessous, les différents skins —
     coloris — de la voiture, pareil pour les ailes et les traînées ; pour l'instant ORIGINAL partout ») : #gBqNom suit la caisse (projeté au-
     dessus d'elle chaque image) ; #gBqSkins, sous elle, liste les COLORIS de l'objet (bqSkins) — une peinture n'en a pas : c'est un coloris. */
  const i=garageI,cur=bqCourant(),lim=false,te=document.getElementById('gBqTete'),nm=document.getElementById('gBqNom'),sk=document.getElementById('gBqSkins');
  const vu9=cur+(String(cur).indexOf('figure:')===0&&GBQ.figDir!=null?'@'+GBQ.figDir:''); // (2026-10-15) une figure à deux sens a deux cartes : la direction touchée fait partie de ce qu'on regarde (le cadre .sel suit la bonne)
  if(GBQ.vu!==vu9){GBQ.vu=vu9;let ri,nom;
    if(cur[0]==='v'){const iv=+cur.slice(2);if(m2Secrete(iv)){ri={c:'#ff3ec8',n1:'MISSION SECRÈTE'};nom='? ? ?';}else{ri=rarInfo(carRar(iv));nom=TR(CARS[iv].name);}}else{const o=bqCos(cur);ri=rarInfo(cosmRar(o.cat,o.d));nom=o.d?TR(o.d.n):'';}
    nm.style.setProperty('--rc',ri.c);nm.classList.toggle('lim',lim);
    nm.querySelector('.bqRar').textContent=sansAcc(TR(ri.n1));nm.querySelector('.bqNom').textContent=sansAcc(String(nom));
    {let mt=nm.querySelector('.bqM2');if(!mt){mt=document.createElement('span');mt.className='bqM2';nm.appendChild(mt);} /* (2026-10-16) SE DÉBLOQUE : la mission, sa jauge — une secrète : rien (son étiquette dit déjà MISSION SECRÈTE) */
      let h9='';if(cur[0]==='v'){const iv=+cur.slice(2),m9=m2DeCaisse(iv);if(m9&&!carUnlockedVrai(iv))h9=m9.f==='secret'?'':m2DebloqueHtml(m9,true);}
      else{const o9=bqCos(cur),m9=o9&&o9.d&&m2DeHab(o9.cat,o9.d);if(m9&&!shopOwned(o9.cat,o9.d.id))h9=m2DebloqueHtml(m9,true);}
      mt.innerHTML=h9;mt.hidden=!h9;}
    {const L9=bqSkins(cur);sk.classList.toggle('vide',!L9.length);sk.querySelector('.bqSk').innerHTML=L9.map(function(x,n){return '<button class="bqS'+(n===0?' on':'')+'" data-s="'+x.id+'" style="--sc:'+x.c+'"><i></i><span>'+sansAcc(TR(x.n))+'</span></button>';}).join('');}
    rail.querySelectorAll('.bqK').forEach(function(el){el.classList.toggle('sel',el.getAttribute('data-k')===cur&&(!el.hasAttribute('data-dir')||GBQ.figDir==null||+el.getAttribute('data-dir')===GBQ.figDir));});
}
  {const t=nm.querySelector('.bqLim em'),r=bqHebdoReste();if(t&&lim&&t.textContent!==r)t.textContent=r;}
  // LA PLACE : la colonne des rayons à gauche ; la boutique en bas (debout) ou à droite jusqu'en haut (couché)
  const W=VP.w,H=VP.h,ac=document.getElementById('gAct'),tr=te.getBoundingClientRect(),arc=ac&&ac.getBoundingClientRect(),cou=W>H*1.2;
  const bas=arc&&arc.height?arc.top:H-80,lay=W+'x'+H+':'+Math.round(bas)+':'+(arc?Math.round(arc.left):0)+':'+ong+':'+Math.round(tr.bottom);
  if(GBQ.lay!==lay){GBQ.lay=lay;
    const UW=Math.round(Math.min(124,W*.31)),top=tr.bottom+(cou?6:14);une.style.left=(cou?36:12)+'px';une.style.width=UW+'px';une.style.top=top+'px';let fond;
    if(!cou){const ph=Math.round(Math.min(330,H*.4));pan.style.left='14px';pan.style.right='14px';pan.style.top=(bas-10-ph)+'px';pan.style.bottom=(H-bas+10)+'px';pan.classList.remove('cote');pan.classList.add('grille');fond=bas-10-ph-10;}
    else{const x0=Math.max(W*.5,(arc&&arc.width?arc.left:W*.55)-6);pan.style.left=x0+'px';pan.style.right='12px';pan.style.top=Math.round(tr.top)+'px';pan.style.bottom=(H-bas+10)+'px';pan.classList.add('cote','grille');fond=H-12-(parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--sB'))||0);} /* (2026-10-17, session UI-REVUE) couché, la colonne des rayons s'arrête au-dessus de la barre d'accueil (FIGURES y entrait de 6 px) */
    bqRayons(une,fond-top);garLibre._r=null;}
  {const pr=pan.getBoundingClientRect(),ru=une.getBoundingClientRect(),SH=0,sb=cou?H-14:pr.top-10;
   sk.style.left=(ru.right+6)+'px';sk.style.right=(W-(cou?pr.left-8:W-12))+'px';sk.style.top=(sb-40)+'px';
   GBQ.zone=cou?{cote:true,x0:pr.left,g:ru.right+8,y0:tr.bottom+44,y1:sb-SH}:{g:ru.right+6,d:W-12,y0:tr.bottom+44,y1:sb-SH};}
  // le nom flotte AU-DESSUS de la caisse (son toit, projeté), sans sortir de sa place
  {const v=GBQ._vn||(GBQ._vn=new THREE.Vector3()),G=garGabarit();carGroup.getWorldPosition(v);v.y+=G.H*1.1+.5;v.project(camera);
   const z=GBQ.zone,m9=nm.querySelector('.bqM2'),mw9=m9?Math.max(150,Math.round((z.cote?z.x0-8:(z.d||W-12))-(z.g||0)))+'px':'';if(m9&&m9.style.width!==mw9)m9.style.width=mw9; /* (2026-10-17, Sacha) SE DÉBLOQUE prend TOUTE la place libre à côté des rayons (couché : jusqu'à la grille, qu'il ne passe plus — le compteur passait dessous ; debout : il tenait sur 180 px, quatre lignes) */
   const w2=nm.offsetWidth/2,x=Math.max((z.g||0)+w2,Math.min((z.cote?z.x0-8:z.d)-w2,(v.x*.5+.5)*W)),y=Math.max(tr.bottom+8,(.5-v.y*.5)*H-nm.offsetHeight-8);
   nm.style.left=Math.round(x)+'px';nm.style.top=Math.round(y)+'px';}
}
function bqSkins(k){if(!k)return [];if(k[0]==='v'&&m2Secrete(+k.slice(2)))return [];if(k[0]!=='v'){const c=k.slice(0,k.indexOf(':'));if(c==='peinture')return [];} // une peinture EST un coloris
  return [{id:'original',n:'ORIGINAL',c:'linear-gradient(135deg,#fff,#d9dde3)'}];} // (2026-10-12) aucun skin n'est encore dessiné : chaque voiture, aile, traînée a son ORIGINAL
function bqEssaie(k){if(String(k).indexOf('figure:')===0){GBQ.figK=k;garFigEssai(k.slice(7),bqFigDir(k.slice(7)));try{gShopJour();}catch(e){}GBQ.ck='';return;}GBQ.figK=null; // (2026-10-14) une FIGURE : la caisse la fait sur le plateau
  // toucher = ESSAYER (2026-10-12, Léo : « à droite un bouton ÉQUIPER / DÉSÉQUIPER / ACHETER qui change en fonction ») : c'est le bouton qui équipe (bqAction)
  if(k[0]==='v'&&m2Secrete(+k.slice(2))){GBQ.sec=+k.slice(2);if(SHOP.tab!=='voiture')shopTab('voiture');GBQ.vu=-1;GBQ.ck='';return;}GBQ.sec=null; /* (2026-10-16) une SECRÈTE n'est jamais construite : le plateau se vide (garageRender la tait) */
  if(k[0]==='v'){const i=+k.slice(2);if(SHOP.tab!=='voiture')shopTab('voiture');if(i!==garageI){garageSaute(i);try{bqGeste('voiture');}catch(e){}}}
  else{const o=bqCos(k),j=COSM[o.cat].indexOf(o.d);if(SHOP.tab!==o.cat)shopTab(o.cat);if(j>=0){SHOP.i[o.cat]=j; /* (2026-10-14, UX 8) la clé COURANTE se pose AU TOUCHER : le geste du bras ne pose la pièce qu'à 0,71 s, et ACHETER/ÉQUIPER agissait sur l'objet d'AVANT */ bqOutil(o.cat,'essai',o.d,function(){shopShow(o.cat,j);try{gShopJour();}catch(e){}});}} // (2026-10-13) LES BRAS D'ATELIER posent la pièce (voir bqOutil)
  try{gShopJour();}catch(e){}GBQ.ck='';}
/* LE BOUTON QUI CHANGE (#gBqBtn, à droite de RETOUR) : ACHETER (+ le prix) · ÉQUIPER · DÉSÉQUIPER (un habillage équipé, sauf celui d'origine) ·
   ÉQUIPÉE (la caisse que tu as) · À GAGNER (défi : il le dit) — il remplace ACHETER de la console en boutique */
/* (2026-10-14, ticket boutique P1) LE BOUTON DIT L'ÉTAT AVANT LE TOUCHER : caisse / habillage / figure à pièces trop chère : « IL TE MANQUE $ 49,6 k »
   + mini-jauge (la banque / le prix), inactif — plus de toast sombre APRÈS le toucher. */
function bqManque(k){
  let prix=0;
  if(k[0]==='v'){const i=+k.slice(2),u=CAR_UNLOCK[i]||{};if(!(carUnlockedVrai(i)||(SAVE.d.equipped|0)===i)&&u.k!=='premium'&&u.p)prix=u.p;}
  else{const o=bqCos(k),d=o&&o.d;if(d&&d.p){if(o.cat==='figure'){if(!figPossede(d.id))prix=d.p;}else if(!shopOwned(o.cat,d.id))prix=d.p;}}
  if(prix&&bank()<prix)return {e:'manque',t:'IL TE MANQUE',p:bqPxT(prix-bank()),j:Math.max(0,Math.min(1,bank()/prix))};
  return null;}
/* LES RAYONS TIENNENT DANS LEUR PLACE (2026-10-15) : une ligne par rayon, de 44 à 52 px (la cible du pouce), l'écart se resserre d'abord ;
   s'il n'y a pas la place de six lignes de 44 px (petit téléphone, couché bas), deux colonnes de carrés, pictogramme seul (le nom reste dans aria-label) */
function bqRayons(el,dispo){const n=el.children.length||1;let g=6,h=Math.floor((dispo-g*(n-1))/n);if(h<46){g=4;h=Math.floor((dispo-g*(n-1))/n);}
  const duo=h<44;if(duo){g=8;const r=Math.ceil(n/2);h=Math.floor((dispo-g*(r-1))/r);}
  h=Math.max(44,Math.min(duo?56:52,h));el.classList.toggle('duo',duo);el.style.setProperty('--cH',h+'px');el.style.setProperty('--cG',g+'px');}
function bqEtat(){const k=bqCourant();if(!k)return null;
  {const m9=bqManque(k);if(m9)return m9;} // (2026-10-14, boutique P1) pas assez d'argent : voir bqManque
  if(k[0]==='v'){const i=+k.slice(2),u=CAR_UNLOCK[i]||{},eq=(SAVE.d.equipped|0)===i,a=carUnlockedVrai(i)||eq;
    if(eq)return {e:'eq',t:'ÉQUIPÉE'};if(a)return {e:'equip',t:'ÉQUIPER'};
    if(u.k==='mis'){const m9=m2Def(u.id);return m9&&m9.f==='secret'?{e:'sec',t:'MISSION SECRÈTE'}:{e:'mis',t:'VOIR LA MISSION',m:u.id};} // (2026-10-16) LES MISSIONS v2
    if(u.k==='premium')return {e:'achat',t:'ACHETER',p:eurTxt(u.eur)};if(u.p)return {e:'achat',t:'ACHETER',p:bqPxT(u.p)};return {e:'defi',t:'À GAGNER'};}
  const o=bqCos(k),d=o.d;if(!d)return null;
  if(o.cat==='figure'){if(!figPossede(d.id))return {e:'achat',t:'ACHETER',p:bqPxT(d.p)}; // (2026-10-14) une figure : on l'a, ou on l'achète
    if(!FIGV2.on)return {e:'eq',t:'ACQUISE'};
    return figSlots()[bqFigDir(d.id)]===d.id?{e:'eq',t:'ÉQUIPÉE'}:{e:'figeq',t:'ÉQUIPER'};} // (2026-10-15, les directions) dans la direction de SA carte : on en change en ÉQUIPANT une autre de cette direction, on ne la retire plus
  const a=shopOwned(o.cat,d.id),eq=shopEqD(o.cat)===d,j=COSM[o.cat].indexOf(d);
  if(a&&eq)return j>0?{e:'desequip',t:'DÉSÉQUIPER'}:{e:'eq',t:'ÉQUIPÉ'};if(a)return {e:'equip',t:'ÉQUIPER'};
  if(d.mis2)return {e:'mis',t:'VOIR LA MISSION',m:d.mis2}; // (2026-10-16) LES MISSIONS v2
  if(d.pack==='chat'){const u9=CAR_UNLOCK[chatPackI()]||{};return {e:'chat',t:'AVEC LE CHAT',p:u9.eur?eurTxt(u9.eur):''};} // (2026-10-18 soir) l'ARC-EN-CIEL : il mène à l'offre du chat (voir chatPackI)
  if(d.eur)return {e:'achat',t:'ACHETER',p:eurTxt(d.eur)};if(d.p)return {e:'achat',t:'ACHETER',p:bqPxT(d.p)};return {e:'defi',t:'À GAGNER'};}
function bqAction(){const s=bqEtat(),k=bqCourant(),bt=document.getElementById('gBqBtn');if(!s||!k)return;
  if(s.e==='manque'){if(bt)gSecoue(bt);uiClic('refus');return;} // (2026-10-14, charte 6) l'état se lit AVANT le toucher : ni toast, ni achat
  if(s.e==='achat'&&k.indexOf('figure:')===0){figAchete(k.slice(7),bt);return;} // (2026-10-14) acheter une FIGURE
  if(s.e==='figeq'||s.e==='figdes'){const id9=k.slice(7),c9=bqFigDir(id9);figEqToast(id9,c9);GBQ.rk='';try{gShopJour();}catch(e){}try{garFigEssai(id9,c9);}catch(e){}hap(8);return;} // (LES FIGURES v2) un emplacement
  if(s.e==='achat'){const b=$('gBuy');if(b)b.click();return;}
  if(s.e==='equip'){if(k[0]==='v'){const i=+k.slice(2);if(garEquipeCaisse(i))garageShow(i);}else{const o=bqCos(k),j=COSM[o.cat].indexOf(o.d);if(garEquipeHabit(o.cat,j)){shopShow(o.cat,j);try{bqOutil(o.cat,'serre',o.d,null);}catch(e){}}}try{hap(8);}catch(e){}return;}
  if(s.e==='desequip'){const o=bqCos(k),j=COSM[o.cat].indexOf(o.d);bqOutil(o.cat,'retire',o.d,function(){if(shopEquip(o.cat,0)){SHOP.prev=null;try{buildCar(CARS[equippedCar()]);}catch(e){}shopShow(o.cat,j);try{if(SONV2)sfx('ui.off');}catch(e){}}try{gShopJour();}catch(e){}});try{hap(6);}catch(e){}return;}
  if(s.e==='mis'){m2VaMission(s.m);return;} // (2026-10-16) VOIR LA MISSION : l'écran MISSIONS, la mission suivie
  if(s.e==='chat'){const ci=chatPackI();if(ci<0)return;GBQ.cat='achat';GBQ.ong='cat';GBQ.rk='';bqEssaie('v:'+ci);uiClic('nav');return;} // (2026-10-18 soir) AVEC LE CHAT : l'offre du chat, rayon ACHAT
  if(s.e==='sec'){if(bt)gSecoue(bt);uiClic('refus');return;}
  if(s.e==='defi'){if(bt)gSecoue(bt);uiClic('refus');if(k[0]==='v')toast(pxi('verrou')+' '+String(carUnlockText(+k.slice(2))).replace(/</g,'&lt;'));return;}
  try{uiClic('nav');}catch(e){}}
/* LES FIGURES AU SHOP ET À L'INVENTAIRE (2026-10-14) — possédées : SAVE.d.figs ; achetées en pièces (la banque) ; toucher = la caisse la fait */
function figAchat(i){const d=COSM.figure[i];if(!d||!d.p)return {ok:false,raison:'pas-a-vendre'};if(figPossede(d.id))return {ok:false,raison:'deja-possedee'};
  if(bank()<d.p)return {ok:false,raison:'fonds-insuffisants',manque:d.p-bank()};
  SAVE.d.bank=bank()-d.p;if(!Array.isArray(SAVE.d.figs))SAVE.d.figs=['tailwhip'];SAVE.d.figs.push(d.id);SAVE.flush();return {ok:true,paye:d.p};}
function figPossede(id){if(cousin())return !!(window.FIG&&FIG.par[id]); // (2026-10-14) LE CODE COUSIN : toutes les figures
const L=SAVE.d.figs;return id==='tailwhip'||(Array.isArray(L)&&L.indexOf(id)>=0);} // (2026-10-15) le TAIL WHIP offert d'office ; le tonneau des anciennes sauvegardes reste dans leur liste
function figAchete(id,bt){const f=window.FIG&&FIG.par[id];if(!f||figPossede(id))return false;
  if(bank()<f.p){if(bt)gSecoue(bt);uiClic('refus');toast(pxi('piece')+' '+sansAcc(TR('IL MANQUE'))+' '+fmtC(f.p-bank()));return false;}
  SAVE.d.bank=bank()-f.p;if(!Array.isArray(SAVE.d.figs))SAVE.d.figs=['tailwhip'];SAVE.d.figs.push(id);SAVE.flush();
  const c9=bqFigDir(id);if(FIGV2.on)try{figEquipe(id,c9);}catch(e){} // (LES FIGURES v2) achetée = ÉQUIPÉE — (2026-10-15) dans la direction de la carte touchée, à la place de celle qui y était
  try{if(SONV2){sfx('ui.achat');if(!REDUCED_MOTION)sfx('ui.tampon',{t:.266});}}catch(e){}try{gTampon(sansAcc(TR('À TOI !')));}catch(e){}hap([10,40,10]);GBQ.rk='';garFigEssai(id,c9);return true;} /* (2026-10-14, session SON) le même « À TOI ! » que l'achat d'une peinture ou d'une caisse : le même tampon qui s'abat (il manquait à la figure) */
const GFIG={lect:null,t:0,D:0,corps:null};
/* (2026-10-14, LES FIGURES v2) un emplacement pris ou rendu, et ce qu'on en dit */
function figEqToast(id,c){const f=window.FIG&&FIG.par[id];if(!f)return;const r=figEquipe(id,c);if(!r)return;const F=FIG_FAM[r.slot],fam=pxi(F[2])+' '+sansAcc(TR(F[0])); // (2026-10-15, les directions) équiper dans la direction c (sans c : la 1re libre, voir figEquipe) ; le toast dit la DIRECTION (le geste)
  if(!r.deja){try{if(SONV2)sfx('ui.equipe');}catch(e){}
    toast(pxi('rotation')+' '+sansAcc(TR(f.n))+' · '+fam+(r.parti&&r.parti!==id&&FIG.par[r.parti]?' · '+sansAcc(TR('REMPLACE'))+' '+sansAcc(TR(FIG.par[r.parti].n)):''));}
  else{uiClic('nav');toast(pxi('rotation')+' '+sansAcc(TR(f.n))+' · '+sansAcc(TR('ÉQUIPÉE'))+' · '+fam);}} // déjà là : une par direction, toujours — on en change en équipant une autre de cette direction
function figEquipee(id){return figSlots().indexOf(id);} // son 1er emplacement (0 avant · 1 arrière · 2 côté), −1 sinon
function garFigEssai(id,c,libre){let f=window.FIG&&FIG.par[id];if(!f)return;if(c!=null&&c<2&&FIG.oriente)f=FIG.oriente(f,FIG_DIR[c]);
  if(!libre&&!BRAS_FIG&&(brasVoulu()||brasBqVoulu())&&!figPosee()){if(GFIG.corps)GFIG.corps.vide();if(GFIG.lect)GFIG.lect.vide();GFIG.D=0;BRB.libre={id:id,c:c,t:.5};return;} // (19/10 soir) pas encore posée (pinces, bras d'argent qui rentrent) : elle la fera dès qu'elle l'est (brasTick)
  if(!libre&&BRAS_FIG&&(brasVoulu()||brasBqVoulu())){if(brasBqVoulu())BRB.bqVeut=true;if(GFIG.corps)GFIG.corps.vide();if(GFIG.lect)GFIG.lect.vide();GFIG.D=0;const r9=brasFigure(f);if(r9===true)return;if(r9==='libre'){BRB.libre={id:id,c:c,t:.5};return;}} // (2026-10-19) à l'inventaire, LE BRAS DES FIGURES la fait (sans plan sûr : il se range d'abord, puis elle la fait seule) // (2026-10-15) la caisse la fait dans le sens de la carte (le rodéo avant ≠ le rodéo arrière)
  if(FIGV2.on&&FIG.Corps){if(!GFIG.corps)GFIG.corps=new FIG.Corps();const C=GFIG.corps;C.vide();C.lance(f,1,f.D*1.2);C.evts.length=0;GFIG.t=0;GFIG.D=f.D*1.2*(FIG.PHY.elan?1:1/.85)+.6; /* (2026-10-15 soir) le coup net : la figure en f.D × 1,2, puis le planté */
    try{if(SONV2){sfx('turbo.mini',{vol:-6});GSON9=true;}}catch(e){}return;} // (LES FIGURES v2) la caisse fait la figure en vraie physique : explosion, élan, planté
  if(!GFIG.lect)GFIG.lect=new FIG.Lecteur();GFIG.lect.vide();GFIG.lect.lance(f,1,f.D*1.25);GFIG.t=0;GFIG.D=f.D*1.25;
  try{if(SONV2){sfx('fig.vrille',{st:2});GSON9=true;}}catch(e){}}
function garFigTick(dt){
  if(brasTick(dt))return; // (2026-10-19) LE BRAS DES FIGURES tient la caisse
  if(GFIG.corps&&GFIG.D>0){const C=GFIG.corps,d9=Math.min(dt,.05);GFIG.t+=d9;C.budget=Math.max(0,GFIG.D-GFIG.t);C.tick(d9);C.evts.length=0; // (LES FIGURES v2)
    const x=Math.min(1,GFIG.t/GFIG.D),hc=(CARS[equippedCar()].h||1.3)*.5,q=C.q;carGroup.position.y+=1.5*Math.sin(Math.PI*x);
    VEQ.pv.set(0,hc,0).applyQuaternion(carGroup.quaternion);VEQ.qr.set(q[0],q[1],q[2],q[3]);carGroup.quaternion.multiply(VEQ.qr);
    VEQ.pv2.set(0,hc,0).applyQuaternion(carGroup.quaternion);carGroup.position.add(VEQ.pv).sub(VEQ.pv2);
    if(x>=1&&!C.occupe()&&C.ecart()<.01){C.vide();GFIG.D=0;}return;}
  const L9=GFIG.lect;if(!L9||!L9.occupe())return;L9.tick(Math.min(dt,.05));GFIG.t+=Math.min(dt,.05);
  const x=Math.min(1,GFIG.t/GFIG.D),hc=(CARS[equippedCar()].h||1.3)*.5,lev=1.5*Math.sin(Math.PI*x); // elle saute du plateau, tourne, se repose
  carGroup.position.y+=lev;VEQ.pv.set(0,hc,0).applyQuaternion(carGroup.quaternion);
  VEQ.qr.set(L9.q[0],L9.q[1],L9.q[2],L9.q[3]);carGroup.quaternion.multiply(VEQ.qr);
  VEQ.pv2.set(0,hc,0).applyQuaternion(carGroup.quaternion);carGroup.position.add(VEQ.pv).sub(VEQ.pv2);}
function bqBoutonMaj(){const bt=document.getElementById('gBqBtn');if(!bt)return;const s=bqEtat(),cle=s?s.e+'|'+s.t+'|'+(s.p||'')+'|'+(s.j!=null?Math.round(s.j*100):'')+'|'+LANG:'';if(bt._k===cle)return;bt._k=cle;
  bt.dataset.e=s?s.e:'';bt.innerHTML=s?('<span>'+sansAcc(TR(s.t))+'</span>'+(s.p?'<b'+(bqPxLg(s.p)?' class="lg"':'')+'>'+String(s.p).replace(/</g,'')+'</b>':'')+(s.e==='eq'?pxi('coche'):(s.e==='mis'||s.e==='chat')?pxi('droite'):s.e==='sec'?pxi('oeil'):'')+(s.e==='manque'?'<i class="bqJ" style="--v:'+s.j.toFixed(2)+'"></i>':'')):'';}
try{Object.assign(I18N,{"VERS L'ARRIÈRE":'BACKWARD','POUCE EN ARRIÈRE':'THUMB BACK',"VERS L'AVANT":'FORWARD','SUR LES CÔTÉS':'SIDEWAYS','POUCE EN AVANT':'THUMB FORWARD','POUCE À GAUCHE OU À DROITE':'THUMB LEFT OR RIGHT'});}catch(e){} // (2026-10-15) les deux familles de figures
try{Object.assign(I18N,{'ÉQUIPER':'EQUIP','DÉSÉQUIPER':'UNEQUIP','ÉQUIPÉE':'EQUIPPED','ÉQUIPÉ':'EQUIPPED','ACHETER':'BUY','À GAGNER':'TO EARN'});}catch(e){}
try{Object.assign(I18N,{'CHOISIS UNE OFFRE':'PICK AN OFFER'});}catch(e){} // (2026-10-14, charte 6, boutique P1)
function garBqChoc(){if(!GBQ.choc)garBqBatit();GBQ.chocT=0;}
/* LA BOUTIQUE SE PRÉPARE AU MENU (2026-10-16, Léo : « la boutique rame de ouf ») — MESURÉ au banc : à la 1re ouverture, l'image figeait 1,2 s
   (la salle blanche, le trône, les bras d'atelier, les gerbes bâtis au toucher, puis 10 programmes compilés à sa 1re image, 4 autres ensuite).
   Comme l'atelier (atelierChauffe), elle est désormais bâtie CACHÉE au menu et compilée sous le même éclairage (les lumières ne changent que
   d'intensité en boutique : bqBio), puis dessinée une fois hors écran — chauffeRendu ne garde que ses sous-arbres. */
function bqChauffe(k){if(GBQ.chaud||garageOn)return; // k : 0 la salle bâtie · 1 les bras, l'outil, la lueur · 2 tout compilé et dessiné une fois (dans le garage, rien : l'ouverture bâtit ce qui manque, sous le voile)
  if(k===0){garBqBatit();return;}if(k===1){garBqLueurBatit();garBqOutilBatit();return;}
  GBQ.chaud=true;garBqBatit();garBqLueurBatit();garBqOutilBatit();
  const q=[GBQ.grp,GBQ.halo,GBQ.nappe,GBQ.bras,BQG.m,BQG.lame,BQT.g].filter(function(o){return o&&o.parent===scene;});
  if(q.length)chauffeRendu(q);}
/* LA POSE TENUE (2026-10-15, Léo : « boutique : toucher la voiture fait bouger la voiture comme actuellement, mais laisse la voiture dans sa
   position souhaitée ; et lorsqu'on rappuie sur la voiture, elle se replace et la plateforme se remet à faire tourner la voiture »).
   Le doigt la tourne et la penche comme avant (même prise, même élan) ; dès qu'il a GLISSÉ de plus de 8 px, elle est POSÉE À LA MAIN
   (GBQ.pose) : le plateau s'arrête net et, lâchée, elle garde sa pose — plus de ressort de tangage ni de roulis, son élan de lacet s'éteint
   comme avant. Un TOUCHER BREF SUR elle (moins de 8 px, moins de 0,3 s, le rayon touche la carrosserie : bqPrise → sur) la rend à sa pose de
   vitrine : tangage et roulis reviennent en ressort, le plateau repart en 0,9 s (GBQ.platK, adouci). À côté d'elle, ou quand elle tourne
   déjà : rien. Une autre caisse (sous le rideau de l'échange : à plat d'un coup), un autre onglet ou une autre catégorie (en douceur), la
   sortie de la boutique : retour au plateau. Seule la boutique passe par ici : le garage et l'inventaire gardent leur doigt. */
function bqPoseTient(){GBQ.pose=true;GBQ.platK=0;GBQ.poseI=garageI;GBQ.poseO=GBQ.ong||'cat';GBQ.poseC=GBQ.cat||'voiture';}
function bqPoseLache(m){GBQ.pose=false;if(m==='caisse'||m==='sort')GBQ.platK=1;if(m==='caisse'){GBQ.pit=GBQ.pitV=GBQ.rol=GBQ.rolV=GBQ.yawV=0;GBQ.lan=null;}}
