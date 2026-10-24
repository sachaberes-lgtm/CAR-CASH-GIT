/* ===== LA FORÊT EMBELLIE (2026-10-20, Sacha : « apporter des améliorations visuelles à chaque map — ajouter des éléments, améliorer des textures, améliorer les lumières — sans que ce soit trop gourmand pour le téléphone, avec de la cohérence ») =====
   Une passe d'aspect, rien d'autre : la route, la physique, les arbres et leurs collisions, le tirage du décor ne bougent pas d'un bit (tout ce qui est
   neuf tire dans un flux à lui, `mulberry32(graine ^ 0x1A27E4)`, jamais dans `fr`, `fw`, `dr`, `dz2` ni dans le `rnd` de la piste). Accent de la map : l'AMBRE #FFC477,
   avec l'OR et le ROSE néon de la marque, rares. Les cinq piliers de la bible, ici :
   · LUMIÈRE-VEDETTE : les RAIS de soleil à deux températures (cœur ambre, lisière bleutée, gain ×1,5) ; la brume en nappes qui s'allume au contre-jour (ambre, violet-lune
     la nuit) et se refroidit à l'opposé — même programme, des nombres dans les shaders (`FOR_RAY_FS`, `FOR_BRUME_*`) ;
   · MATIÈRE : la NUIT redevient bleue — la lueur des joints de vitrail (`uVitG`, une couleur par météo : `FOR_MET.*.vg`) était un or fixe qui jaunissait les fûts sous la lune
     (le « lime » du ciel indigo) ; elle tire vers le bleu-lune la nuit, le violet à l'orage, l'or le jour ; le feuillage à contre-jour devient or plutôt que vert acide ;
   · TROIS PLANS : la perspective atmosphérique (`uAir`) — le proche un peu plus chaud, le lointain plus clair et plus froid (le shader des arbres) ;
   · DÉTAIL VIVANT : les lucioles sont ambre, un peu or, de rares roses (elles étaient vert-jaune acide) ;
   · ÉLÉMENTS + ÉCLAT CASH : les LANTERNES DE CONTE (`foretLanternes`) — des lueurs ambre (quelques-unes or, de rares roses néon) accrochées aux troncs des géants,
     au bord de la route, du soir à la nuit et sous la pluie : UN seul appel de dessin (un InstancedMesh de quads additifs, le programme des feux follets et des yeux, type 2),
     0 triangle de plus qui compte, aucune texture ; les amanites luisent rose une fois sur cinq.
   Budget : un appel de dessin de plus (les lanternes), ≈ 180 triangles, 0 programme, 0 octet de texture. `FOR_EMB` : les réglages (gain des lanternes, des rais, de la perspective). */
const FOR_EMB={lant:1,ray:1.5,air:1}; /* (banc) FOR_EMB.lant = 0 : sans lanternes · .ray = 1 : le gain des rais d'avant · .air = 0 : sans perspective atmosphérique */
function foretLanternes(root,M,GE,proches,mat,seed){
  const n=Math.round(PAL_B9('foretLant',90));if(!(n>0)||!GE||!GE.length||!FORET.protos)return;
  const ev=mulberry32((seed^0x1A27E4)>>>0),ord=[],X=[],AL=[],P=[];
  for(let k=0;k<GE.length;k++)ord.push(k);
  for(let k=ord.length-1;k>0;k--){const j=(ev()*(k+1))|0,a=ord[k];ord[k]=ord[j];ord[j]=a;}
  for(const k of ord){if(P.length>=n)break;const g=GE[k];if(g.vide||!g.spV||g.i==null)continue;
    const meta=FORET.protos.geant[g.spV]&&FORET.protos.geant[g.spV][0].m;if(!meta||!meta.C)continue;
    const q=pts[g.i],dx=q.x-g.x,dz=q.z-g.z,dh=Math.hypot(dx,dz);if(dh<1||dh>140)continue;
    const y=q.y+4+ev()*12,co=Math.cos(g.ry),si=Math.sin(g.ry);let rT=0,cx=0,cz=0; /* le fût à cette hauteur : la plus grosse gélule du prototype qui la traverse */
    for(const c of meta.C){const y0=g.y+c[1]*g.sy,y1=g.y+c[4]*g.sy;if(y<Math.min(y0,y1)||y>Math.max(y0,y1))continue;const r=c[6]*g.sxz;if(r<=rT)continue;
      const u=Math.abs(y1-y0)>1e-6?(y-y0)/(y1-y0):0,px=c[0]+(c[3]-c[0])*u,pz=c[2]+(c[5]-c[2])*u;rT=r;cx=g.x+(px*co+pz*si)*g.sxz;cz=g.z+(-px*si+pz*co)*g.sxz;}
    if(rT<2)continue;
    const ex=q.x-cx,ez=q.z-cz,eh=Math.hypot(ex,ez)||1,off=rT+1.6,x=cx+ex/eh*off,z=cz+ez/eh*off;
    let ok=true;proches(x,z,42,function(j){if(!ok)return;const r=pts[j];if(Math.abs(r.y-y)<26&&Math.hypot(r.x-x,r.z-z)<40)ok=false;}); /* jamais dans le couloir d'une route, à aucun étage */
    if(!ok)continue;
    for(const p of P)if(Math.hypot(p[0]-x,p[1]-y,p[2]-z)<60){ok=false;break;} /* ni deux lanternes collées */
    if(!ok)continue;
    P.push([x,y,z]);X.push(mat(x,y,z,0,1,1,1));const r9=ev();AL.push(2,r9<.8?0:r9<.93?1:2,12+ev()*8,ev());}
  if(!P.length)return;
  const g=new THREE.PlaneGeometry(1,1);g.setAttribute('aL',new THREE.InstancedBufferAttribute(new Float32Array(AL),4));
  const im=new THREE.InstancedMesh(g,M.lueur,P.length);for(let k=0;k<P.length;k++)im.instanceMatrix.array.set(X[k],k*16);
  im.frustumCulled=false;im.matrixAutoUpdate=false;im.renderOrder=7;im.name='forêt lanternes';im.visible=false;im.userData.jeter=true;root.add(im);FORET.lant=im;FORET.n.lanternes=P.length;}
window.dbgForetEmb=function(o){if(o)Object.assign(FOR_EMB,o);return {emb:Object.assign({},FOR_EMB),lanternes:FORET.lant?FORET.lant.count:0,vues:FORET.lant&&FORET.lant.visible};}; /* (banc) les réglages de la passe d'embellissement */
