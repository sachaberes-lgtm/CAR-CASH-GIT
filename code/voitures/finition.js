/* ===== LA FINITION STUDIO (2026-10-20, Léo : « une manière plus moderne et plus stylée, plus polie — brillante ET poly — sans te limiter
   au poly ; garder toute la beauté en ayant l'air solide ; sur toutes les voitures en même temps ») ===== ESSAI, éteint par défaut :
   `?finition=studio` (ou `dbgFinition(1)` au banc). Trois couches, posées sur TOUTE la gamme sans retoucher un seul dessin :
   1. LA LUMIÈRE DE STUDIO au garage (`paintEnvStudio`) : le cube de reflets passe de 64² à 256² (des reflets NETS) et porte de longues
      boîtes à lumière à hauteur de flanc — un peu SOUS l'horizon, là où regarde un flanc vu d'en haut — et de grands panneaux au plafond :
      quand la caisse tourne, des bandes blanches glissent de pan en pan (avant, les flancs reflétaient un mur terne : d'un bloc).
   2. LE VERNIS PROFOND au garage (`finLaque`) : la laque montre plus sa couleur de face et devient miroir en rasant ; le plancher
      lumineux baisse (des ombres plus franches). Rendu à la sortie du garage : en course, la couleur garde sa lisibilité.
   3. LES REFLETS QUI ÉCLATENT au garage (`fstuHdr`) : un cube de reflets ne monte qu'à 1 (blanc) ; une laque n'en prend que 20 %, une boîte
      à lumière n'y laissait qu'un voile. Sur la tôle des caisses, ce qui est presque blanc dans le cube compte ×4 (comme une vraie lampe) :
      une bande NETTE et brillante court sur le pan qui la regarde. Les matières des caisses ont leur clé de programme à elles
      (`customProgramCacheKey`) : les meubles de l'atelier, qui partagent lpMat, ne la voient pas.
   (ESSAI ÉCARTÉ, gardé derrière `&aretes=1` : un filet de lumière sur chaque arête vive, par barycentres — sur les facettes fines du kit il
   dessinait des dents de scie autour des roues, pas un chanfrein propre. WebGL2 seulement.) */
const FSTU={on:/[?&]finition=(studio|1)/.test(location.search),aretes:/[?&]aretes=1/.test(location.search),garage:false,uArK:{value:1},uHdr:{value:0}};
const FSTU_LAQUE={p:[1.05,3.2,1.9,.32,.015],k:[1.1,2.9,1.9,1,.035]}; /* (20/10, Léo : « l'entre-deux ; le deuxième est beau, juste mieux fait ») v3 — le reflet un peu plus teinté par la laque (.32) : un bonbon, plus un miroir blanc ;
   v2 « plus fort » : p [1.35,3.6,1.8,.2,0] ; v1 : p [.8,3,2,.2,.03] */ // [de face, en rasant, dureté, métal, plancher lumineux] (lpMat : p [.25,1.5,3,.2] · .06 ; k [.6,1.8,2.4,1] · .07)
function finAreteOk(){try{return FSTU.on&&FSTU.aretes&&renderer.capabilities.isWebGL2;}catch(e){return false;}}
/* les drapeaux d'arête d'une géométrie NON indexée : pour chaque triangle, ses trois côtés (opposés aux sommets 0, 1, 2) — vif si l'angle avec
   la facette voisine dépasse `deg` ; un côté sans voisine (le bord d'une pièce) ne l'est pas. aArete = (drapeau 0, 1, 2, rang du sommet). */
function finArete(geo,deg){
  const P=geo.attributes.position;if(!P||geo.index){finZero(geo);return;}
  const n=P.count,nt=(n/3)|0,a=P.array,N=new Float32Array(nt*3),cs=Math.cos((deg||24)*Math.PI/180),q=v=>Math.round(v*2000);
  for(let t=0;t<nt;t++){const i=t*9,ux=a[i+3]-a[i],uy=a[i+4]-a[i+1],uz=a[i+5]-a[i+2],vx=a[i+6]-a[i],vy=a[i+7]-a[i+1],vz=a[i+8]-a[i+2];
    let x=uy*vz-uz*vy,y=uz*vx-ux*vz,z=ux*vy-uy*vx;const l=Math.hypot(x,y,z)||1;N[t*3]=x/l;N[t*3+1]=y/l;N[t*3+2]=z/l;}
  const cle=(p,r)=>{const A=q(a[p*3])+','+q(a[p*3+1])+','+q(a[p*3+2]),B=q(a[r*3])+','+q(a[r*3+1])+','+q(a[r*3+2]);return A<B?A+'|'+B:B+'|'+A;};
  const M=new Map();
  for(let t=0;t<nt;t++)for(let k=0;k<3;k++){const c=cle(t*3+(k+1)%3,t*3+(k+2)%3);let L=M.get(c);if(!L)M.set(c,L=[]);L.push(t*3+k);}
  const F=new Float32Array(n*4);
  for(const L of M.values()){if(L.length!==2)continue;const t0=(L[0]/3)|0,t1=(L[1]/3)|0;
    if(N[t0*3]*N[t1*3]+N[t0*3+1]*N[t1*3+1]+N[t0*3+2]*N[t1*3+2]>cs)continue;
    for(const e of L){const t=(e/3)|0,k=e%3;for(let v=0;v<3;v++)F[(t*3+v)*4+k]=1;}}
  for(let i=0;i<n;i++)F[i*4+3]=i%3;
  geo.setAttribute('aArete',new THREE.Float32BufferAttribute(F,4));}
function finZero(geo){const P=geo.attributes.position;if(!P)return;const F=new Float32Array(P.count*4);for(let i=0;i<P.count;i++)F[i*4+3]=i%3;geo.setAttribute('aArete',new THREE.Float32BufferAttribute(F,4));}
// toutes les pièces de la caisse dont la matière dessine les arêtes : la tôle (laque, métallisé, nacre) calcule ses arêtes, le reste porte des zéros
function finCaisse(){carGroup.traverse(o=>{if(!o.isMesh||!o.geometry||Array.isArray(o.material)||!o.material||!o.material.userData.arete)return;
  if(o.geometry.attributes.aArete)return;const g=o.material.userData.g;
  if(g==='p'||g==='k'||g==='n'||(typeof g==='string'&&g.indexOf('pm:')===0))finArete(o.geometry);else finZero(o.geometry);});}
// le code des arêtes, greffé dans lpMat (voir lpMat `ar`)
const FSTU_V='attribute vec4 aArete;varying vec3 vArF;varying vec3 vArB;\n',
      FSTU_VM='vArF=aArete.xyz;vArB=vec3(step(aArete.w,.5),step(.5,aArete.w)*step(aArete.w,1.5),step(1.5,aArete.w));\n',
      FSTU_F='varying vec3 vArF;varying vec3 vArB;uniform float uArK;\n',
      FSTU_HDR='uniform float uStuHdr;vec3 fstuHdr(vec3 e){return e*(1.+uStuHdr*3.4*smoothstep(.45,.95,dot(e,vec3(.299,.587,.114))));}\n', // (v3 ×4,4, montée plus douce — v2 ×5,5 brûlait des facettes en blanc ; v1 ×3,4)
      FSTU_FM='{vec3 e3=mix(vec3(1.),vArB,step(.5,vArF));float e9=min(e3.x,min(e3.y,e3.z)),w9=fwidth(e9)+1e-5;\n'+
        'float l9=(1.-smoothstep(w9*1.1,w9*2.8,e9))*(1.-smoothstep(.25,.5,w9))*uArK;gl_FragColor.rgb=mix(gl_FragColor.rgb,gl_FragColor.rgb*1.45+vec3(.07),l9);}\n';
// le vernis profond : au garage (on) ou rendu à la course (off) — sur les matières de la caisse posée
function finLaque(on){FSTU.garage=!!on;FSTU.uHdr.value=FSTU.on&&on?1:0;if(!FSTU.on)return;
  carGroup.traverse(o=>{const ms=o.isMesh?(Array.isArray(o.material)?o.material:[o.material]):[];
    for(const m of ms){if(!m||!m.userData||!m.userData.uV)continue;const L=FSTU_LAQUE[m.userData.g==='k'?'k':(m.userData.g==='p'||(typeof m.userData.g==='string'&&m.userData.g.indexOf('pm:')===0))?'p':''];if(!L)continue;
      if(!m.userData.uV0)m.userData.uV0=[m.userData.uV.value.toArray(),m.userData.uG.value];
      if(on){m.userData.uV.value.fromArray(L);m.userData.uG.value=L[4];}else{m.userData.uV.value.fromArray(m.userData.uV0[0]);m.userData.uG.value=m.userData.uV0[1];}}});}
/* LA LUMIÈRE DE STUDIO : le cube en 256², murs sombres, des boîtes à lumière NETTES (un cœur blanc, un halo court) à hauteur de flanc,
   deux colonnes verticales (elles balaient la caisse quand elle tourne), un grand panneau au plafond ; la porte garde le bas de ses flammes */
function paintEnvStudio(){
  const S=256;
  envCvs.forEach(function(cv,f){if(cv.width!==S){cv.width=cv.height=S;}const c=cv.getContext('2d');c.setTransform(1,0,0,1,0,0);
    const boite=(x,y,w,h,col,a,halo)=>{const g=c.createLinearGradient(0,y-halo,0,y+h+halo);g.addColorStop(0,'rgba('+col+',0)');g.addColorStop(halo/(h+2*halo),'rgba('+col+','+(a*.35).toFixed(2)+')');
        g.addColorStop(.5,'rgba('+col+','+a+')');g.addColorStop(1-halo/(h+2*halo),'rgba('+col+','+(a*.35).toFixed(2)+')');g.addColorStop(1,'rgba('+col+',0)');c.fillStyle=g;c.fillRect(x,y-halo,w,h+2*halo);
        c.fillStyle='rgba(255,255,255,'+Math.min(1,a+.1).toFixed(2)+')';c.fillRect(x+3,y+h*.25,w-6,Math.max(2,h*.5));},
      colonne=(x,y,w,h,col,a)=>{const g=c.createLinearGradient(x-14,0,x+w+14,0);g.addColorStop(0,'rgba('+col+',0)');g.addColorStop(.5,'rgba('+col+','+a+')');g.addColorStop(1,'rgba('+col+',0)');
        c.fillStyle=g;c.fillRect(x-14,y,w+28,h);c.fillStyle='rgba(255,255,255,'+a+')';c.fillRect(x+w*.3,y+4,w*.4,h-8);};
    if(f===2){c.fillStyle='#050608';c.fillRect(0,0,S,S);                                                    // +Y : le plafond noir…
      const g=c.createRadialGradient(128,128,10,128,128,120);g.addColorStop(0,'rgba(255,248,236,.95)');g.addColorStop(.55,'rgba(255,244,228,.55)');g.addColorStop(1,'rgba(255,244,228,0)');
      c.fillStyle=g;c.fillRect(0,0,S,S);c.fillStyle='rgba(255,255,255,.92)';c.fillRect(56,84,144,88);                // …et son grand panneau
      for(const y of [30,226]){c.fillStyle='rgba(255,246,232,.85)';c.fillRect(24,y-2,208,4);}return;}
    if(f===3){const g=c.createRadialGradient(128,128,8,128,128,150);g.addColorStop(0,'#1a1d24');g.addColorStop(1,'#07080a');c.fillStyle=g;c.fillRect(0,0,S,S);return;} // −Y : le sol
    const gr=c.createLinearGradient(0,0,0,S);gr.addColorStop(0,'#040506');gr.addColorStop(.40,'#0f1218');gr.addColorStop(.50,'#171b23');gr.addColorStop(.53,'#0a0c10');gr.addColorStop(1,'#040506'); // (v3 : entre le v1 et le v2)
    c.fillStyle=gr;c.fillRect(0,0,S,S);
    const chaud=(f===0||f===5),col=chaud?'255,236,210':'214,236,255';
    /* (mesuré à la MIRE, dbgFinition('mire') : un flanc droit vu de la caméra du garage reflète ~30° SOUS l'horizon — rangées 192-223 ;
       une épaule qui rentre, 128-159 ; un capot ou un toit vus en rasant, 64-95) */
    boite(8,197,240,12,col,.88,12);                                                                          // LA boîte à lumière des flancs (v3 : halo plus long — le bord de la bande FOND sur la facette au lieu de la couper net)
    boite(16,146,224,8,col,.9,10);                                                                           // celle des épaules (v3 : halo plus long)
    boite(24,80,208,7,col,.85,10);                                                                           // celle des capots et des toits, en rasant (v3 : halo plus long)
    if(f!==4){colonne(54,40,10,180,col,.8);colonne(192,40,10,180,col,.8);}                                  // deux colonnes sur trois murs (v3 ,8 — v2 à 1 : des damiers blancs sur les flancs à facettes)
    if(f===4){const n=c.createLinearGradient(0,150,0,256);n.addColorStop(0,'rgba(196,86,26,0)');n.addColorStop(.6,'rgba(196,86,26,.55)');n.addColorStop(1,'rgba(106,22,12,.8)');c.fillStyle=n;c.fillRect(40,150,176,106);} // la porte : le bas de ses flammes
  });
  envTex.needsUpdate=true;}
window.dbgFinition=function(on){if(on==='mire'){const C=['#ff0000','#ff8800','#ffff00','#00ff00','#00ffff','#0000ff','#ff00ff','#ffffff'];   // (banc) la MIRE : 8 bandes de 32 px sur les murs — on lit la hauteur reflétée à la couleur
    envCvs.forEach(function(cv,f){cv.width=cv.height=256;const c=cv.getContext('2d');if(f===2){c.fillStyle='#808080';c.fillRect(0,0,256,256);return;}if(f===3){c.fillStyle='#000';c.fillRect(0,0,256,256);return;}
      for(let i=0;i<8;i++){c.fillStyle=C[i];c.fillRect(0,i*32,256,32);}});envTex.needsUpdate=true;return 'mire';}
  if(on==='etat'){let n=0,ar=0,fl=0,lq=[];carGroup.traverse(o=>{if(!o.isMesh||!o.material||Array.isArray(o.material))return;const m=o.material;if(m.userData&&m.userData.arete){n++;const a=o.geometry.attributes.aArete;if(a){ar++;for(let i=0;i<a.count;i++)if(a.getX(i)+a.getY(i)+a.getZ(i)>0)fl++;}}
    if(m.userData&&m.userData.uV)lq.push(m.userData.g+':'+m.userData.uV.value.toArray().map(v=>+v.toFixed(2)).join('/'));});
  return {env:typeof envCvs!=='undefined'?envCvs[0].width:null,matsArete:n,geoArete:ar,sommetsVifs:fl,laques:lq.slice(0,6),garage:FSTU.garage};}
  if(on!=null){FSTU.on=!!on;try{if(garageOn){if(FSTU.on)paintEnvStudio();else paintEnvAtelier();}buildCar(CARS[level]);}catch(e){return String(e);}}return {on:FSTU.on,arete:finAreteOk(),garage:FSTU.garage};};
