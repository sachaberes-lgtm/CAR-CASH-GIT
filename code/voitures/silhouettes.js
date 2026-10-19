/* ---- LES 6 SILHOUETTES (LA HONTE + LES CINQ, 2026-09-24) ---------------------------------------
   UNE ENTRÉE = UNE CAISSE. Chaque gabarit monte son corps avec la boîte à outils `K` et rend une
   FICHE D'ANCRAGES : où vont les phares, les feux, les roues, et quels accessoires communs il veut.
   ⚠ POURQUOI CETTE FORME. L'ancien `buildCar` choisissait le gabarit par SEUILS de niveau
   (`lvl>=14?'rocket':lvl>=11?'proto':…`) : entre deux seuils, RIEN ne changeait, et 10 caisses sur
   24 sortaient du même moule. Mesuré dans `voitures.html` : 20 paires au-dessus de 90 % de
   recouvrement de silhouette. C'est la même erreur, et le même remède, que pour les moteurs.
   ⚠ LA RÈGLE : deux caisses ne doivent JAMAIS partager un gabarit. Vérifiable d'un clic (bouton
   DOUBLONS de l'étal) ; le constructeur, lui, refuse de deviner — pas de `shape`, pas de caisse.
   LES POTS (2026-09-26) : les tuyères (JETS), les flammes, la traînée et `nitroLight` ne sont plus aux ancres canoniques — buildCar
   RELÈVE les pots que le gabarit dessine (voir CAR_POTS). Un gabarit dont les pots échappent au relevé les DÉCLARE : `pots:[[x,y,z],…]`
   dans sa fiche (repère caisse, point de sortie). Banc : `dbgPots()` sur la caisse montée.
   -------------------------------------------------------------------------------------------- */
/* ---- LE CHAT POP-TART EN VOXELS (2026-10-06, Léo : « je mise tout sur cette image, fais-en une voiture — impressionne-moi sur le
   mimétisme et l'adaptation ») ------------------------------------------------------------------------------------------------
   L'IMAGE est un sprite de 2011 EXTRUDÉ en cubes : chaque pixel devient un voxel, le contour noir devient un MUR noir sur toute
   l'épaisseur, et tout ce qui regarde vers le bas prenait le BLEU du ciel (dessous des pattes, du gâteau, de la tête) — (2026-10-08,
   Léo : « corrige les bugs en dessous de la voiture ») il est NOIR comme le châssis : l'écran titre fait tourner la caisse dans le
   ciel et la montre par en dessous, où le bleu ne restait que sur la couche du milieu de la tête et de la queue — des rayures bleues
   entre deux bandes noires, lues comme des trous dans la caisse. On garde cette grammaire au pixel près — mais une voiture n'est pas
   un sprite de profil : pour chaque pièce, il a fallu choisir LE PLAN du dessin.
   · le GÂTEAU se couche, c'est le châssis : croûte, glaçage et éclats de sucre DESSUS (la caméra de poursuite voit le dessus), murs
     noirs sur la tranche — l'épaisseur noire de l'image ;
   · la TÊTE se dresse à l'avant, visage DEVANT : il regarde la route, et au garage (trois-quarts avant) c'est lui qu'on voit ;
   · les PATTES et la QUEUE restent dessinées DE PROFIL : vue de côté, la caisse EST le chat de l'image ;
   · les quatre pattes finissent sur des ROULETTES pixel — le chat fait du roller, c'est ça la voiture.
   L'animation est celle du GIF, en PAS ENTIERS, jamais interpolée : les pattes pédalent d'un voxel, la queue bat entre deux dessins,
   la tête hoche d'un voxel sur le tempo — et à la nitro, des pixels multicolores qui scintillent (voir NY_PIX). Unité `NY_U` = 10 cm ; repère
   caisse : i → x (centré), j → y (sol = 0), k → z (k = 10 ↔ z = 0, l'avant en +z). Console : `dbgNyan()`. */
const NY_U=.1;
const NY_K=.95; // (2026-10-09, Léo : « encore un peu petite comparée aux autres ») ,86 → ,95 · (2026-10-09, Léo : « rends-la un peu plus volumineuse ») ,8 → ,86 · (2026-10-09, Léo, fiche de la salle blanche) « la nyan cat : plus petite » — TOUT le chat ×,8 à la fin de son gabarit (géométries et positions) ; les crans de l'animation suivent (pattes, hochement)
const NY_PATTE=.05,NY_BAS=.33; // (v13) la case des pattes (accrochées aux roues) — c'est aussi un cran de leur tour · la descente de la caisse sur ses roues — (2026-10-09, Léo : « la nyan cat doit faire plus voiture de rallye, genre mini rally : plus au ras du sol, moins voiture de ville ») ,25 → ,33 : le pneu rentre dans l'aile
/* (2026-10-09, Léo : « la nyan cat doit faire plus voiture de rallye, genre mini rally : plus au ras du sol, moins voiture de ville »)
   LA MINI DE RALLYE : une déformation CONTINUE de toute la caisse (coque, pop-tart du pavillon, aileron, feux, trait noir — jamais la tête,
   les pattes ni les roues), appliquée à la sortie de chaque chantier :
   · le vitrage et le pavillon TASSÉS au-dessus de ,9 m (×NY_TASSE : le pavillon descend de 8 cm, le pare-brise se couche), de plus en
     plus vers l'arrière (×,74 au haut du pare-brise → ×,56 à la poupe : le pavillon plonge vers le hayon, l'aileron descend avec lui) ;
   · les AILES ÉLARGIES autour des deux roues (+NY_AILE : plateau au-dessus de la roue, fondu vers la porte et vers la ceinture) ;
   · les JUPES qui descendent de 7 cm (tout ce qui est sous ,62 m s'étire vers le sol).
   Continue = rien ne se décolle (l'aileron reste sur ses cols de cygne, la pop-tart sur son pavillon, le trait noir sur la coque). Avec la
   descente NY_BAS et la voie élargie NY_VOIE (,7 → ,76 : roues, pattes, ancrages), la caisse est basse, large, sur ses roues. */
const NY_TASSE=.84,NY_AILE=.12,NY_VOIE=.79; // (2026-10-09, Léo : « rends-la un peu plus volumineuse ») moins tassée (,74 → ,84 ; vers la poupe ,56 → ,70), ailes plus gonflées (+8 → +12 cm), voie ,76 → ,79 : la roue remplit l'aile
function nyRallye(g){const a=g.attributes.position.array,sm=t=>{t=Math.min(1,Math.max(0,t));return t*t*(3-2*t);};
  for(let i=0;i<a.length;i+=3){const x=a[i],y=a[i+1],z=a[i+2];let b=0;
    for(const zc of [.95,-.45])b=Math.max(b,sm((1-Math.abs(z-zc)/.62)/.4));        // au-dessus des roues, et le fondu vers la porte
    a[i]=x+Math.sign(x)*NY_AILE*b*sm((Math.abs(x)-.45)/.3)*sm((.98-y)/.14);        // les ailes (ni le plancher, ni au-dessus de la ceinture)
    a[i+1]=y>.9?.9+(y-.9)*(NY_TASSE-.08*(.8-z)):y-.07*sm((.62-y)/.12);}            // le pavillon tassé, qui PLONGE vers l'arrière (hayon de rallye) · les jupes vers le sol
    // ⚠ la pente est LINÉAIRE en z : une face plane le reste (les grands pavés de glaçage du pavillon ne couvrent qu'avec leurs 4 coins —
    //   une pente courbe faisait passer le pavillon au travers, une bande de biscuit en travers du rose)
  g.attributes.position.needsUpdate=true;g.computeVertexNormals();return g;}
const NY_P=.086; // (v12) LE PIXEL DU DESSIN : la tête et la pop-tart du pavillon ont la même case (une seule image, pas deux)
/* (v12) LA POP-TART DU PAVILLON, de l'arrière (rangée 0) vers l'avant : `.` biscuit, `f` glaçage, `s` vermicelle — les coins du glaçage
   en ESCALIER et les vermicelles semés comme sur l'image (une case chacun). */
const NY_TOIT=['..fffffff..',
               '.fffsffffs.',
               'fffffffffff',
               'fsfffffsfff',
               'ffffsffffff',
               'ffffffffsff',
               'fffsfffffff',
               'ffffffsffff',
               'fsfffffffff',
               'ffffsffffsf',
               'fffffffffff',
               'ffsffffsfff',
               'fffffffffff',
               '.ffffsffff.',
               '..fffffff..'];
var BLING={s:[],t:0,anim:[]}; // (2026-10-10) L'ICEBERG : ses éclats de givre (voir SHAPES.iceberg)
/* LES ÉCLATS DE GIVRE de L'ICEBERG : chacune s'allume à SON rythme (une pointe très brève, sinus à la puissance 12), puis s'éteint ; rien d'autre ne
   bouge. Quelques écritures d'échelle par image, et rien quand la caisse n'a pas d'étoiles. */
function blingTick(dt){for(const f of BLING.anim)f(dt); // (2026-10-10) ce qui VIT dans la caisse (le feu de LA FOURNAISE…)
  const L=BLING.s;if(!L.length)return;BLING.t+=dt;
  for(const m of L){const u=m.userData,v=Math.sin(BLING.t*u.r+u.ph),k=v>0?Math.pow(v,12):0,sc=k*u.s;m.visible=sc>.03;if(m.visible)m.scale.setScalar(sc);}}
const NYAN={on:false,tete:null,pattes:[],queue:[],feux:[],roues:[],rf:'',rPas:1,pix:null,pixT:0,arc:new THREE.Vector3(0,.75,-1),ph:0,pas:-1,bat:0,hb:-1,volK:0,v0:0,acc:0,allure:''};
const NY_GATEAU=(function(){const L=['BBBBBBBBBBBBBBBBBBBBBB','BCCCCCCCCCCCCCCCCCCCCB','BCCCCCCCCCCCCCCCCCCCCB','BCCCPPPPPPPPPPPPPPCCCB']; // (v2) coins CARRÉS : un caisson de voiture, plus une galette — le glaçage garde ses coins arrondis
  for(let i=0;i<9;i++)L.push('BCCPPPPPPPPPPPPPPPPCCB');
  return L.concat(L.slice(0,4).reverse());})(); // vu du DESSUS : une rangée par i (−8 … 8), une colonne par k (0 = l'arrière … 21 = l'avant)
const NY_TETE=[ // de FACE, rangée du haut d'abord (j = 14 − rangée) — W : l'éclat de l'œil (en haut à gauche, comme l'image), R : la joue
 '.BB.........BB.',
 '.BGB.......BGB.',
 '.BGGBBBBBBBGGB.',
 'BGGGGGGGGGGGGGB',
 'BGGWBGGGGGWBGGB',
 'BGGBBGGBGGBBGGB',
 'BGGGGGGGGGGGGGB',
 'BRRGBGGBGGBGRRB',
 'BRRGBBBBBBBGRRB',
 '.BGGGGGGGGGGGB.',
 '..BBBBBBBBBBB..'];
const NY_QUEUE=[[10,['...BBB','..BGGB','BBGGB.','BGGB..','BBB...']],     // tombante (colonnes k −5 … 0, rangée du haut = j 10)
                [12,['BBB...','BGGB..','BBGGB.','.BBGGB','...BBB']]];  // relevée (rangée du haut = j 12)
/* LA GRILLE DE VOXELS : une clé de palette par case → seules les faces À L'AIR libre, fusionnées en RECTANGLES par couleur (le
   glouton classique, plan par plan) : ~3 000 cases de chat = quelques centaines de triangles. `fk(c,axe,sens)` choisit la clé de
   chaque FACE (axe 0/1/2 = x/y/z, sens ±1, et la case elle-même) : c'est là que les dessous virent au bleu, et que la caisse prend ses ombres. Les faces vont dans un chantier `lpKit`. */
function voxGrille(){
  const M=new Map(),cle=(i,j,k)=>((i+512)*1024+(j+512))*1024+(k+512); // une clé NUMÉRIQUE (la caisse fine a ~25 000 cases : les chaînes coûtaient)
  return {M,
    set(i,j,k,c){M.set(cle(i,j,k),c);},
    has(i,j,k){return M.has(cle(i,j,k));},
    del(i,j,k){M.delete(cle(i,j,k));},
    emit(kt,u,o,fk){
      const lo=[1e9,1e9,1e9],hi=[-1e9,-1e9,-1e9],p=[0,0,0],q=[0,0,0];
      for(const c of M.keys()){p[2]=c%1024-512;p[1]=Math.floor(c/1024)%1024-512;p[0]=Math.floor(c/1048576)-512;
        for(let a=0;a<3;a++){if(p[a]<lo[a])lo[a]=p[a];if(p[a]>hi[a])hi[a]=p[a];}}
      const lit=r=>M.get(cle(r[0],r[1],r[2]));
      for(let ax=0;ax<3;ax++){const a1=(ax+1)%3,a2=(ax+2)%3; // le plan de la face : a1 × a2 = ax (base directe : la face regarde DEHORS)
        const n1=hi[a1]-lo[a1]+1,n2=hi[a2]-lo[a2]+1,mask=new Array(n1*n2);
        for(const sg of [1,-1])for(let d=lo[ax];d<=hi[ax];d++){
          for(let x=0;x<n1;x++)for(let y=0;y<n2;y++){p[ax]=d;p[a1]=lo[a1]+x;p[a2]=lo[a2]+y;q[ax]=d+sg;q[a1]=p[a1];q[a2]=p[a2];
            const c=lit(p);mask[x+y*n1]=(c&&!lit(q))?fk(c,ax,sg,p):null;} // `p` : la case (le choix de la teinte peut regarder ses voisines)
          for(let y=0;y<n2;y++)for(let x=0;x<n1;){const c=mask[x+y*n1];if(!c){x++;continue;}
            let w=1;while(x+w<n1&&mask[x+w+y*n1]===c)w++;
            let h=1;haut:while(y+h<n2){for(let e=0;e<w;e++)if(mask[x+e+(y+h)*n1]!==c)break haut;h++;}
            for(let yy=0;yy<h;yy++)for(let e=0;e<w;e++)mask[x+e+(y+yy)*n1]=null;
            const C=(xx,yy)=>{const r=[0,0,0];r[ax]=o[ax]+(d+(sg>0?1:0))*u;r[a1]=o[a1]+(lo[a1]+xx)*u;r[a2]=o[a2]+(lo[a2]+yy)*u;return r;};
            const a=C(x,y),b=C(x+w,y),cc=C(x+w,y+h),dd=C(x,y+h);
            if(sg>0){kt.tri(c,a,b,cc);kt.tri(c,a,cc,dd);}else{kt.tri(c,a,cc,b);kt.tri(c,a,dd,cc);}
            x+=w;}
        }
      }
    }};
}
/* LA LAQUE DU CHAT POP-TART (v11, Léo : « un beau beige marron comme un biscuit appétissant, mais glossy métallique comme une voiture,
   et par-dessus le glaçage »). La COULEUR reste cuite et sans lumière (le biscuit garde son beige sous la lampe chaude de l'atelier, le
   rideau de feu et les ciels des niveaux : voir la v2) ; le BRILLANT est un studio dessiné dans le shader, dans le repère de la CAMÉRA
   (il suit l'objectif, comme la clé et le contre de l'atelier) : un HORIZON — le pan qui renvoie le ciel s'éclaire, celui qui renvoie le
   sol fonce, c'est ce qui fait le métallisé —, deux BOÎTES À LUMIÈRE qui glissent de facette en facette quand la caisse tourne, et un
   VERNIS blanc en rasant. Rien à texturer ; une MeshBasicMaterial (le brouillard suit) au même onBeforeCompile pour toutes les
   constructions : un seul programme, compilé à la première image de la caisse (au garage, jamais en course). */
const NY_COUL={b:0xd0b092,f:0xff8fe6,s:0xff2f8a,v:0x17223a}; // biscuit · glaçage · vermicelles · vitres (un objet : le banc peut les changer puis dbgCar(9))
function nyLaque(){
  const m=new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide});
  m.onBeforeCompile=function(sh){
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vNyN;varying vec3 vNyP;')
      .replace('#include <fog_vertex>','#include <fog_vertex>\nvNyN=normalize(normalMatrix*normal);vNyP=mvPosition.xyz;');
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vNyN;varying vec3 vNyP;')
      .replace('#include <envmap_fragment>',
        'vec3 nN=normalize(vNyN);if(!gl_FrontFacing)nN=-nN;vec3 nV=normalize(-vNyP),nR=reflect(-nV,nN);\n'+
        'float nH=smoothstep(-.12,.22,nR.y),nF=pow(1.-clamp(dot(nN,nV),0.,1.),4.);\n'+ // l'horizon renvoyé · le rasant
        'float nS=pow(max(0.,dot(nR,vec3(-.42,.78,.46))),28.)*.55+pow(max(0.,dot(nR,vec3(.62,.52,.58))),10.)*.18\n'+ // les deux boîtes à lumière
        '  +smoothstep(.30,.40,nR.y)*(1.-smoothstep(.56,.68,nR.y))*smoothstep(-.35,.2,nR.z)*.42;\n'+ // et la RAMPE au plafond : la bande claire qui court sur les pans en biais
        'float nD=clamp(dot(nN,nV),0.,1.);\n'+                                                  // le FLOP du métallisé : pleine de face, sombre en fuyant
        'outgoingLight=outgoingLight*(.66+.5*nD)*(.84+.3*nH)+vec3(1.,.96,.9)*nS+vec3(.92,.94,1.)*nF*.34*(.35+.65*nH);');
  };
  m.userData.lp=1;return m;}
/* (2026-10-14) LE DOGE v2 — LES PIÈCES SCULPTÉES (voir SHAPES.doge). Un champ de distance → un maillage LISSE (surface nets : un sommet par
   case traversée, normales = gradient du champ), coloré par une fonction de la position. Calculé UNE fois par session (SHAPES.doge._tete). */
function dogeNets(F,X0,Y0,Z0,h,nx,ny,nz,coul){
  const N=nx*ny*nz,V=new Float32Array(N);
  for(let k=0;k<nz;k++)for(let j=0;j<ny;j++)for(let i=0;i<nx;i++)V[i+nx*(j+ny*k)]=F(X0+i*h,Y0+j*h,Z0+k*h);
  const CI=new Int32Array((nx-1)*(ny-1)*(nz-1)).fill(-1),P=[],Nn=[],C=[],IX=[],c3=[0,0,0];
  const EDG=[[0,1],[2,3],[4,5],[6,7],[0,2],[1,3],[4,6],[5,7],[0,4],[1,5],[2,6],[3,7]],CO=[[0,0,0],[1,0,0],[0,1,0],[1,1,0],[0,0,1],[1,0,1],[0,1,1],[1,1,1]],v8=new Float32Array(8);
  const OFF=CO.map(o=>o[0]+nx*(o[1]+ny*o[2])); // (2026-10-14, OPTIMISATION) le décalage de chaque coin dans V, calculé une fois (mêmes cases lues)
  for(let k=0;k<nz-1;k++)for(let j=0;j<ny-1;j++)for(let i=0;i<nx-1;i++){let m=0;const b0=i+nx*(j+ny*k);
    for(let c=0;c<8;c++){v8[c]=V[b0+OFF[c]];if(v8[c]<0)m|=1<<c;}
    if(m===0||m===255)continue;let sx=0,sy=0,sz=0,n=0;
    for(const e of EDG){const a=v8[e[0]],b=v8[e[1]];if((a<0)===(b<0))continue;const t=a/(a-b),A=CO[e[0]],B=CO[e[1]];
      sx+=A[0]+(B[0]-A[0])*t;sy+=A[1]+(B[1]-A[1])*t;sz+=A[2]+(B[2]-A[2])*t;n++;}
    const x=X0+(i+sx/n)*h,y=Y0+(j+sy/n)*h,z=Z0+(k+sz/n)*h;CI[i+(nx-1)*(j+(ny-1)*k)]=P.length/3;P.push(x,y,z);
    const e9=h*.35,gx=F(x+e9,y,z)-F(x-e9,y,z),gy=F(x,y+e9,z)-F(x,y-e9,z),gz=F(x,y,z+e9)-F(x,y,z-e9),l=Math.hypot(gx,gy,gz)||1;Nn.push(gx/l,gy/l,gz/l);
    coul(x,y,z,c3);C.push(c3[0],c3[1],c3[2]);}
  const ci=(i,j,k)=>(i<0||j<0||k<0||i>=nx-1||j>=ny-1||k>=nz-1)?-1:CI[i+(nx-1)*(j+(ny-1)*k)];
  const quad=(a,b,c,d,fl)=>{if(a<0||b<0||c<0||d<0)return;if(fl)IX.push(a,b,c,a,c,d);else IX.push(a,c,b,a,d,c);};
  for(let k=1;k<nz-1;k++)for(let j=1;j<ny-1;j++)for(let i=1;i<nx-1;i++){const in0=V[i+nx*(j+ny*k)]<0;
    if(in0!==(V[(i+1)+nx*(j+ny*k)]<0))quad(ci(i,j-1,k-1),ci(i,j,k-1),ci(i,j,k),ci(i,j-1,k),in0);
    if(in0!==(V[i+nx*((j+1)+ny*k)]<0))quad(ci(i-1,j,k-1),ci(i-1,j,k),ci(i,j,k),ci(i,j,k-1),in0);
    if(in0!==(V[i+nx*(j+ny*(k+1))]<0))quad(ci(i-1,j-1,k),ci(i,j-1,k),ci(i,j,k),ci(i-1,j,k),in0);}
  return {P:new Float32Array(P),N:new Float32Array(Nn),C:new Float32Array(C),I:new Uint32Array(IX)};}
function dogeSdf(){ // (2026-10-14, OPTIMISATION) une fonction nommée, plus une IIFE : l'OUVRIER DU DOGE se bâtit depuis sa source (voir DOGE_OUV)
  const sm=(a,b,k)=>{const h=Math.max(k-Math.abs(a-b),0)/k;return Math.min(a,b)-h*h*k*.25;},sM=(a,b,k)=>-sm(-a,-b,k);
  const ell=(x,y,z,cx,cy,cz,rx,ry,rz)=>{const px=(x-cx)/rx,py=(y-cy)/ry,pz=(z-cz)/rz,k0=Math.sqrt(px*px+py*py+pz*pz),
    k1=Math.sqrt(px*px/(rx*rx)+py*py/(ry*ry)+pz*pz/(rz*rz))||1e-6;return k0*(k0-1)/k1;};
  const rcone=(x,y,z,ax,ay,az,bx,by,bz,r1,r2)=>{const bax=bx-ax,bay=by-ay,baz=bz-az,l2=bax*bax+bay*bay+baz*baz,rr=r1-r2,a2=l2-rr*rr,il2=1/l2,
    pax=x-ax,pay=y-ay,paz=z-az,yy=pax*bax+pay*bay+paz*baz,zz=yy-l2,qx=pax*l2-bax*yy,qy=pay*l2-bay*yy,qz=paz*l2-baz*yy,x2=qx*qx+qy*qy+qz*qz,
    y2=yy*yy*l2,z2=zz*zz*l2,k=Math.sign(rr)*rr*rr*x2;
    if(Math.sign(zz)*a2*z2>k)return Math.sqrt(x2+z2)*il2-r2;if(Math.sign(yy)*a2*y2<k)return Math.sqrt(x2+y2)*il2-r1;return (Math.sqrt(x2*a2*il2)+yy*rr)*il2-r1;};
  const capsule=(x,y,z,a,b,r)=>{const bax=b[0]-a[0],bay=b[1]-a[1],baz=b[2]-a[2],pax=x-a[0],pay=y-a[1],paz=z-a[2],
    h=Math.max(0,Math.min(1,(pax*bax+pay*bay+paz*baz)/(bax*bax+bay*bay+baz*baz))),dx=pax-bax*h,dy=pay-bay*h,dz=paz-baz*h;return Math.sqrt(dx*dx+dy*dy+dz*dz)-r;};
  /* (2026-10-14, OPTIMISATION — « le DOGE fige 3-4 s un iPhone 7 à sa 1re construction ») LA SPHÈRE ENGLOBANTE. Un cône arrondi (ou un
     trait) tient dans la sphère centrée au milieu de ses bouts, de rayon demi-longueur + le plus grand rayon : sa distance vaut AU MOINS
     « distance au centre − rayon ». Quand ce plancher dépasse déjà ce qu'un mélange peut prendre (sm(f, d, k) avec d ≥ f + k rend f tel
     quel, h = 0), la pièce est trop loin pour compter : `loin` le prouve sans racine carrée, et la pièce rend 1e9 au lieu de se calculer —
     le mélange rend alors EXACTEMENT le même f, au bit près (vérifié : même empreinte du maillage, banc node doge-banc). `sph` : [cx,cy,cz,R]
     (+1e-6 de marge sur les arrondis). */
  const sph=(ax,ay,az,bx,by,bz,r1,r2)=>[(ax+bx)/2,(ay+by)/2,(az+bz)/2,Math.hypot(bx-ax,by-ay,bz-az)/2+Math.max(r1,r2)+1e-6];
  const loin=(x,y,z,S,lim)=>{const t=lim+S[3];if(t<=0)return true;const dx=x-S[0],dy=y-S[1],dz=z-S[2];return dx*dx+dy*dy+dz*dz>=t*t;};
  /* `ellG` = ell, avec le même `lim` : hors de l'ellipsoïde (k0 ≥ 1), ell = k0(k0−1)/k1 ≥ (k0−1)·rmin (k1 ≤ k0/rmin) et k0 ≥ |p−c|/rmax —
     donc |p−c| ≥ rmax·(1 + lim/rmin) suffit à prouver ell ≥ lim : rend 1e9 sans racine. */
  const ellG=(x,y,z,cx,cy,cz,rx,ry,rz,lim)=>{const rM=Math.max(rx,ry,rz),T=rM*(1+Math.max(lim,0)/Math.min(rx,ry,rz))+1e-6,dx=x-cx,dy=y-cy,dz=z-cz;
    return dx*dx+dy*dy+dz*dz>=T*T?1e9:ell(x,y,z,cx,cy,cz,rx,ry,rz);};
  return {sm,sM,ell,rcone,capsule,sph,loin,ellG};}
const DOGE_SDF=dogeSdf();
function dogeTete(pre){ // pre (facultatif) = {tete, mach} : les deux maillages déjà calculés par l'OUVRIER DU DOGE (les mêmes, au bit près) — le reste se refait ici, il ne coûte rien
  const {sm,sM,ell,rcone,capsule,sph,loin,ellG}=DOGE_SDF;
  const EYE=[[.185,.075,.312],[-.185,.075,.312]],RE=.086;
  // les oreilles : un cône aplati (épaisseur ÷2,4), creusé devant — ORE = [plein, creux] : zc, x et y des deux bouts, leurs rayons
  // (2026-10-14, OPTIMISATION) `lim` (facultatif) : au-delà, prouvé par la sphère englobante (ORB, dans l'espace aplati), elle rend 1e9 (voir loin)
  const ORE=[[-.05,.255,.24,.36,.67,.175,.016],[.005,.255,.27,.335,.60,.10,.012]],ORB=ORE.map(o=>[1,-1].map(s=>sph(s*o[1],o[2],o[0],s*o[3],o[4],o[0],o[5],o[6])));
  const oreille=(x,y,z,s,creux,lim)=>{const o=ORE[creux?1:0],zc=o[0],zz=zc+(z-zc)*2.4;
    if(lim!==undefined&&loin(x,y,zz,ORB[creux?1:0][s>0?0:1],2*lim))return 1e9;
    return rcone(x,y,zz,s*o[1],o[2],zc,s*o[3],o[4],zc,o[5],o[6])/2;};
  const MUS=[0,-.10,.20,0,-.15,.50,.22,.12],MUSB=sph(MUS[0],MUS[1],MUS[2],MUS[3],MUS[4],MUS[5],MUS[6],MUS[7]);
  const museau=(x,y,z,lim)=>lim!==undefined&&loin(x,y,z,MUSB,lim)?1e9:rcone(x,y,z,MUS[0],MUS[1],MUS[2],MUS[3],MUS[4],MUS[5],MUS[6],MUS[7]);
  const base=(x,y,z)=>{const ax=Math.abs(x),s=x<0?-1:1;
    let f=ell(x,y,z,0,.06,0,.47,.40,.40);                                         // le crâne
    f=sm(f,ellG(ax,y,z,.25,-.15,.17,.25,.21,.23,f+.10),.10);                       // les joues bombées
    f=sm(f,museau(x,y,z,f+.10),.10);                                               // le museau effilé
    f=sm(f,ellG(x,y,z,0,-.29,.18,.22,.13,.20,f+.08),.08);                          // le menton
    f=sm(f,oreille(x,y,z,s,false,f+.06),.06);f=sM(f,-oreille(x,y,z,s,true,.02-f),.02); // l'oreille, et son creux (sM(f,-o,k) = -sm(-f,o,k) : o compte en deçà de k − f)
    const e=EYE[x<0?1:0],ex=x-e[0],ey=y-e[1],ez=z-e[2],T9=Math.max(RE+.032-f,RE+.028+f)+1e-6; // (OPTIMISATION) l'œil ne touche f qu'en deçà de T9 (orbite : de < RE+.032−f · paupière : de < RE+.028+f)
    if(T9>0&&ex*ex+ey*ey+ez*ez<T9*T9){const de=Math.hypot(ex,ey,ez);
    f=sM(f,-(de-RE-.012),.02);                                                     // l'orbite
    f=sm(f,Math.max(de-RE-.016,(e[1]+.032-.22*(ax-.185))-y),.012);}                // la PAUPIÈRE : le haut de l'œil couvert (le regard blasé)
    f=sm(f,ellG(x,y,z,0,-.072,.585,.072,.05,.045,f+.02),.02);                      // la truffe
    return f;};
  // la BOUCHE EN COIN : la ligne est posée sur la surface (lancer de rayon), puis creusée
  const trace=(x,y)=>{let z=1;for(let i=0;i<220;i++){const d=base(x,y,z);if(d<.0015)return z;z-=Math.max(d*.6,.002);if(z<-.2)break;}return null;};
  const LIG=[[0,-.118],[0,-.19],[-.125,-.215],[-.06,-.222],[0,-.21],[.07,-.20],[.135,-.155]],PTS=LIG.map(([x,y])=>{const z=trace(x,y);return z==null?null:[x,y,z+.004];});
  const SEG=[[0,1],[2,3],[3,4],[4,5],[5,6]].filter(([a,b])=>PTS[a]&&PTS[b]).map(([a,b])=>[PTS[a],PTS[b]]);
  // (2026-10-14, OPTIMISATION) BOUB : la sphère qui tient tout le trait — `lim` comme pour les oreilles (1e9 quand le trait est trop loin pour compter)
  const BOUB=(()=>{if(!SEG.length)return [0,0,0,-1e9];const a=[1e9,1e9,1e9],b=[-1e9,-1e9,-1e9];for(const s of SEG)for(const p of s)for(let i=0;i<3;i++){a[i]=Math.min(a[i],p[i]);b[i]=Math.max(b[i],p[i]);}
    const c=[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2];let R=0;for(const s of SEG)for(const p of s)R=Math.max(R,Math.hypot(p[0]-c[0],p[1]-c[1],p[2]-c[2]));return [c[0],c[1],c[2],R+1e-6];})();
  const bouche=(x,y,z,lim)=>{if(lim!==undefined&&loin(x,y,z,BOUB,lim))return 1e9;let d=1e9;for(const s of SEG)d=Math.min(d,capsule(x,y,z,s[0],s[1],0));return d;};
  const F=(x,y,z)=>{const a=base(x,y,z);return sM(a,-(bouche(x,y,z,.019-a)-.011),.008);}; // le trait ne creuse qu'en deçà de .011 + .008 − a
  const HC=new Map(),H=(c,o)=>{let q=HC.get(c);if(!q){const k=new THREE.Color(c);HC.set(c,q=[k.r,k.g,k.b]);}o[0]=q[0];o[1]=q[1];o[2]=q[2];return o;}; // (OPTIMISATION) une couleur lue une fois (il en naissait ~260 000)
  const coul=(x,y,z,o)=>{const ax=Math.abs(x),s=x<0?-1:1,e=EYE[x<0?1:0],de=Math.hypot(x-e[0],y-e[1],z-e[2]);
    if(ell(x,y,z,0,-.072,.585,.072,.05,.045)<.012)return H(0x121014,o);              // la truffe
    if(bouche(x,y,z,.024)<.024)return H(0x3a1f14,o);                                  // la bouche
    if(de<RE+.03&&y<e[1]+.03)return H(0x2a1810,o);                                    // le tour des yeux, sombre (le trait du shiba)
    if(oreille(x,y,z,s,true,.03)<.03&&z>-.06&&y>.30)return H(0xf0b0a2,o);             // le dedans des oreilles
    const mu=museau(x,y,z,.03)<.03,arete=ax<.075&&y>-.11&&z>.22;
    if((mu&&!arete)||y<-.14||(ell(ax,y,z,.25,-.15,.17,.25,.21,.23)<.03&&y<.0)||(ax>.08&&ax<.34&&y<e[1]-.06&&y>e[1]-.2&&z>.18))return H(0xf6e6c6,o); // le MASQUE crème
    if(y>.30&&ax<.20&&z>-.1)return H(0xb8702e,o);                                     // le front, plus sombre
    return H(0xd99545,o);};
  // les couleurs : la moyenne de 7 prises autour du point — les bords des taches se fondent au lieu de faire des dents de scie
  const c1=[0,0,0],coulD=(x,y,z,o)=>{o[0]=o[1]=o[2]=0;const e=.009;for(const d of [[0,0,0],[e,0,0],[-e,0,0],[0,e,0],[0,-e,0],[0,0,e],[0,0,-e]]){coul(x+d[0],y+d[1],z+d[2],c1);o[0]+=c1[0]/7;o[1]+=c1[1]/7;o[2]+=c1[2]/7;}return o;};
  // (2026-10-14, Léo : « qu'il ouvre la bouche, des dents, la langue tirée » · « sa bouche, c'est le TRAIT NOIR : ça doit s'ouvrir depuis là » ·
  // « progressivement, pas découpé brutalement de manière permanente ») LA GUEULE : seule la BOUCHE est découpée — le long du trait (`YC(x)`,
  // la ligne du sourire), entre ses deux coins, sur la profondeur du museau (un cylindre elliptique `ell9` sous le trait) : c'est la LÈVRE DU BAS
  // et le menton (`G.machoire`). Elle s'ouvre en se DÉFORMANT (`G.poidsJ` : 1 au milieu de la lèvre, 0 au bord du cylindre) : les coins restent
  // attachés, la peau s'étire, l'ouverture grandit depuis le trait en forme d'amande ; la lèvre du HAUT se retrousse un peu (`G.poidsU`). Fermée,
  // rien ne se voit que le trait.
  const LB=LIG.slice(2),YC=x=>{if(x<=LB[0][0])return LB[0][1];for(let i=1;i<LB.length;i++)if(x<=LB[i][0]){const a=LB[i-1],b=LB[i];return a[1]+(b[1]-a[1])*(x-a[0])/(b[0]-a[0]);}return LB[LB.length-1][1];};
  const EC=.46,EA=.15,EZ=.34,ell9=(x,z)=>Math.hypot(x/EA,(z-EC)/EZ),J=(x,y,z)=>Math.max(y-YC(x),(ell9(x,z)-1)*EA),
        Fu=(x,y,z)=>Math.max(F(x,y,z),-J(x,y,z)),Fj=(x,y,z)=>Math.max(F(x,y,z),J(x,y,z));
  const D7=[[0,0,0],[.009,0,0],[-.009,0,0],[0,.009,0],[0,-.009,0],[0,0,.009],[0,0,-.009]]; // (OPTIMISATION) les 7 prises, posées une fois
  const moy=f=>(x,y,z,o)=>{o[0]=o[1]=o[2]=0;for(const d of D7){f(x+d[0],y+d[1],z+d[2],c1);o[0]+=c1[0]/7;o[1]+=c1[1]/7;o[2]+=c1[2]/7;}return o;};
  const dedans=(x,y,z)=>Math.abs(y-YC(x))<.02&&ell9(x,z)<1.02&&F(x,y,z)<-.004,levre=(x,y,z)=>F(x,y,z)>-.022;   // une COUPE (l'intérieur) ; son bord = les BABINES noires — (OPTIMISATION) les tests bon marché d'abord : F ne se calcule plus que près du trait
  const coulU=moy((x,y,z,o)=>dedans(x,y,z)?H(levre(x,y,z)?0x1e1214:0x5a1820,o):coul(x,y,z,o)),       // le palais
        coulJ=moy((x,y,z,o)=>dedans(x,y,z)?H(levre(x,y,z)?0x1e1214:0x9a3040,o):coul(x,y,z,o));       // le plancher de la bouche
  const h=.016,X0=-.62,Y0=-.47,Z0=-.47,nx=78,ny=78,nz=74,G=pre&&pre.tete||dogeNets(Fu,X0,Y0,Z0,h,nx,ny,nz,coulU);
  G.machoire=pre&&pre.mach||dogeNets(Fj,-.20,-.47,EC-EZ-.04,h,27,23,49,coulJ);G.charniere=[0,-.23,EC-EZ+.02];G.YC=YC;
  const fJ=(x,z)=>{const e=Math.min(1,ell9(x,z));return Math.pow(1-e*e,1.4);};                        // le poids de la lèvre du bas : 1 au milieu, 0 au bord
  G.poidsJ=(()=>{const P=G.machoire.P,w=new Float32Array(P.length/3);for(let i=0;i<w.length;i++)w[i]=fJ(P[i*3],P[i*3+2]);return w;})();
  G.poidsU=(()=>{const P=G.P,L=[];for(let i=0;i<P.length/3;i++){const x=P[i*3],y=P[i*3+1],z=P[i*3+2],e=ell9(x,z);if(e>=1)continue;const dy=y-YC(x);   // la lèvre du HAUT, juste au-dessus du trait
      if(dy<-.004||dy>.07)continue;const w=(1-e*e)*(1-dy/.07);if(w>.02)L.push(i,w);}return new Float32Array(L);})();
  G.fJ=fJ;
  // les DENTS, au bord de la coupe (lancées depuis le milieu de la bouche, rentrées de 2,5 cm) : en haut deux crocs et quatre incisives, en bas deux crocs et deux
  const bord=a=>{const dx=Math.sin(a),dz=Math.cos(a);let t=0;for(let i=0;i<200;i++){const x=dx*t,z=.36+dz*t;if(F(x,YC(x),z)>0||ell9(x,z)>.93)break;t+=.003;}t=Math.max(0,t-.025);return [dx*t,.36+dz*t];};
  G.dentsH=[[-.95,.015,.055],[.95,.015,.055],[-.45,.010,.032],[-.16,.010,.032],[.16,.010,.032],[.45,.010,.032]].map(([a,r,l])=>bord(a).concat([r,l]));
  G.dentsB=[[-.85,.013,.045],[.85,.013,.045],[-.25,.009,.026],[.25,.009,.026]].map(([a,r,l])=>bord(a).concat([r,l]));
  G.yeux=EYE.map(e=>[e[0],e[1],e[2]+.004,RE]);
  G.sourcils=EYE.map(e=>[e[0]*.92,e[1]+.13,(trace(e[0]*.92,e[1]+.13)||.33)+.006]);
  G.bouche=[0,-.215,(trace(0,-.215)||.55)-.01];
  return G;}
/* L'OUVRIER DU DOGE (2026-10-14, OPTIMISATION — Sacha via PILOTAGE : « les idées de Léo bien intégrées » ; passation perf : « dogeTete ~1 s de
   processeur sur Mac = ~3-4 s figées sur iPhone 7 à sa 1re construction »). La tête sculptée se calculait d'un bloc sur le fil principal à la
   PREMIÈRE apparition du DOGE (atelier, boutique, photo d'inventaire) : l'écran gelait. Désormais :
   · ses deux maillages (la tête, la mâchoire : les deux surface nets, ~99 % du coût) se calculent dans un Web Worker bâti depuis la source
     même (dogeSdf, dogeNets, dogeTete : un seul code, pas de copie — le modèle de L'OUVRIER DES NUAGES), lancé UNE fois par session, au menu,
     DOGE_OUV_MS après le démarrage ; three n'y entre pas : son `THREE.Color` y est l'équivalent exact de celui de r128 (setHex) ;
   · le DOGE demandé avant la fin (ou l'ouvrier refusé) : calcul sur place, comme avant — et l'ouvrier, devenu inutile, s'arrête ;
   · même moteur JavaScript des deux côtés : les mêmes nombres au bit près. `dbgDoge()` : l'état · `dbgDoge('compare')` : recalcule sur place
     et compare octet par octet. La forme et les couleurs de Léo ne changent pas d'un bit ; la tête elle-même calcule aussi ~1,6× plus vite
     (sphères englobantes, voir dogeSdf) : le repli coûte moins. */
const DOGE_OUV={w:null,pret:null,etat:'',ms:0,t0:0,msFil:0,u:''};const DOGE_OUV_MS=5000;
function dogeOuvFin(){if(DOGE_OUV.w){try{DOGE_OUV.w.terminate();}catch(e){}DOGE_OUV.w=null;}if(DOGE_OUV.u){try{URL.revokeObjectURL(DOGE_OUV.u);}catch(e){}DOGE_OUV.u='';}}
function dogeOuvrier(){
  if(DOGE_OUV.w||DOGE_OUV.pret||DOGE_OUV.etat||SHAPES.doge._tete)return;
  try{const src='"use strict";const THREE={Color:function(h){h=Math.floor(h);this.r=(h>>16&255)/255;this.g=(h>>8&255)/255;this.b=(h&255)/255;}};'
      +'const DOGE_SDF=('+dogeSdf.toString()+')();'+dogeNets.toString()+';'+dogeTete.toString()+';'
      +'self.onmessage=function(){const G=dogeTete(),t={P:G.P,N:G.N,C:G.C,I:G.I},m=G.machoire,j={P:m.P,N:m.N,C:m.C,I:m.I};'
      +'self.postMessage({tete:t,mach:j},[t.P.buffer,t.N.buffer,t.C.buffer,t.I.buffer,j.P.buffer,j.N.buffer,j.C.buffer,j.I.buffer]);};';
    DOGE_OUV.u=URL.createObjectURL(new Blob([src],{type:'text/javascript'}));const w=new Worker(DOGE_OUV.u);
    DOGE_OUV.w=w;DOGE_OUV.etat='calcul';DOGE_OUV.t0=performance.now();
    w.onmessage=function(e){DOGE_OUV.ms=Math.round(performance.now()-DOGE_OUV.t0);dogeOuvFin();if(SHAPES.doge._tete)return;DOGE_OUV.pret=e.data;DOGE_OUV.etat='pret';};
    w.onerror=function(ev){try{ev.preventDefault();}catch(e9){}dogeOuvFin();DOGE_OUV.etat='refuse';};
    w.postMessage(0);
  }catch(e){dogeOuvFin();DOGE_OUV.etat='refuse';}}
function dogeTeteObtient(){ // la tête pour SHAPES.doge : celle de l'ouvrier si elle est prête, sinon calculée ici
  if(DOGE_OUV.pret){const p=DOGE_OUV.pret;DOGE_OUV.pret=null;DOGE_OUV.etat='servi';return dogeTete(p);}
  if(DOGE_OUV.w){dogeOuvFin();DOGE_OUV.etat='devance';}
  const t0=performance.now(),G=dogeTete();DOGE_OUV.msFil=Math.round(performance.now()-t0);return G;}
setTimeout(dogeOuvrier,DOGE_OUV_MS);
window.dbgDoge=function(q){ // (banc) l'OUVRIER DU DOGE — voir plus haut
  const T=SHAPES.doge._tete;
  if(q==='compare'){if(!T)return 'pas encore de tete';const R=dogeTete(),oct=a=>new Uint8Array(a.buffer,a.byteOffset,a.byteLength),
      eq=(a,b)=>{if(!a||!b||a.byteLength!==b.byteLength)return false;const x=oct(a),y=oct(b);for(let i=0;i<x.length;i++)if(x[i]!==y[i])return false;return true;};
    return {tete:['P','N','C','I'].every(k=>eq(T[k],R[k])),machoire:['P','N','C','I'].every(k=>eq(T.machoire[k],R.machoire[k])),poids:eq(T.poidsU,R.poidsU)&&eq(T.poidsJ,R.poidsJ)};}
  return {etat:DOGE_OUV.etat||'attente',msOuvrier:DOGE_OUV.ms,msFil:DOGE_OUV.msFil,tete:!!T,sommets:T?T.P.length/3:0};};
