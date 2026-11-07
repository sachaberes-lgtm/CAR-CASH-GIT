// LES PHOTOS DES TRAÎNÉES DE LA BOUTIQUE (2026-11-07, Sacha : « il faudrait un aperçu réel de ce à quoi elles ressemblent »).
// 1. node outils/banc-boutique/banc.cjs "VERSION PRINCIPALE" 9861 9862 9863   (garde un Chrome sans fenêtre et muet, piloté par HTTP)
// 2. ouvrir la boutique au rayon TRAÎNÉES (voir banc-boutique-voitures dans la mémoire : __mGo('shop') puis 'home', garage, #gShopBas)
// 3. D=17 OFF=3.2 EL=2.2 H=.7 ATT=3200 node outils/banc-boutique/trainees.cjs 9863 "VERSION PRINCIPALE/assets/boutique/trainees" nitro rose sakura …
//    chaque traînée est essayée sur la caisse du plateau, puis une caméra à nous la prend de profil (le soleil et le pied du plateau cachés le temps de l'image).
// node trcam.cjs <port> <dossier> id1 id2 …  — boutique ouverte au rayon TRAÎNÉES : chaque traînée essayée, puis UNE image rendue par une
// caméra à nous, de profil (le nez de la caisse à droite, la traînée qui file à gauche), dans la vraie salle 3D ; recadrée en bande (JPEG).
// Réglages (env) : D distance, H hauteur visée, EL hauteur de l'objectif, OFF recul de la visée derrière la caisse, VF champ vertical, AR rapport de la bande, OW largeur
const fs = require('fs');
const [P, OUT, ...IDS] = process.argv.slice(2);
const E = k => +process.env[k];
const D = E('D') || 10, H = E('H') || .9, EL = process.env.EL != null ? E('EL') : 1.6, OFF = process.env.OFF != null ? E('OFF') : 2.6, HF = E('HF') || 42, AR = E('AR') || 2.5, OW = E('OW') || 520, Q = E('Q') || .88, ATT = E('ATT') || 2600;
const ev = async js => { const t = await (await fetch('http://127.0.0.1:' + P + '/ev', { method: 'POST', body: js })).text(); try { return JSON.parse(t); } catch (e) { return t; } };
const dormir = ms => new Promise(r => setTimeout(r, ms));
const CAP = `(function(){var S=dbgScene(),R=S.rdr,sc=S.scene,car=S.car;return new Promise(function(res){var o=R.render.bind(R),fini=false;
  R.render=function(a,b){o(a,b);if(fini||R.getRenderTarget()!==null)return;fini=true;R.render=o;
   try{car.updateMatrixWorld(true);var V=THREE.Vector3,Pc=new V();car.getWorldPosition(Pc);var q=new THREE.Quaternion();car.getWorldQuaternion(q);
    var F=new V(0,0,1).applyQuaternion(q);F.y=0;F.normalize();var Sd=new V().crossVectors(F,new V(0,1,0)).normalize();
    var s=R.domElement,asp=s.width/s.height,hf=${HF}*Math.PI/180,vf=2*Math.atan(Math.tan(hf/2)/asp)*180/Math.PI;
    var cam=new THREE.PerspectiveCamera(vf,asp,.1,600),T=Pc.clone().addScaledVector(F,-${OFF});T.y+=${H};
    var pose=function(sg){cam.position.copy(T).addScaledVector(Sd,sg*${D});cam.position.y+=${EL};cam.lookAt(T);cam.updateMatrixWorld();cam.updateProjectionMatrix();};
    pose(1);var a1=Pc.clone().project(cam).x,a2=Pc.clone().addScaledVector(F,2).project(cam).x;if(a2<a1)pose(-1);
    var cach=[];sc.children.forEach(function(c){if(c===car||!c.visible||c.isLight||c.isPoints||c.isInstancedMesh)return;var bx;try{bx=new THREE.Box3().setFromObject(c);}catch(e){return;}if(bx.isEmpty())return;var z=bx.getSize(new V()),m=bx.getCenter(new V());if(Math.hypot(m.x-Pc.x,m.z-Pc.z)>4||Math.abs(m.y-Pc.y)>4)return;if((c.isMesh&&c.material&&c.material.map&&c.material.blending===1)||(c.isGroup&&z.x<6)){c.visible=false;cach.push(c);}});
    o(sc,cam);cach.forEach(function(c){c.visible=true;});
    var W=s.width,h=Math.round(W/${AR}),y=Math.round((s.height-h)/2),cv=document.createElement('canvas');cv.width=${OW};cv.height=Math.round(${OW}/${AR});
    var x=cv.getContext('2d');x.imageSmoothingQuality='high';x.drawImage(s,0,y,W,h,0,0,cv.width,cv.height);res(cv.toDataURL('image/jpeg',${Q}));
   }catch(e){res('err '+e);}};
  setTimeout(function(){if(!fini){fini=true;R.render=o;res('');}},8000);});})()`;
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  for (const id of IDS) {
    console.log(id, 'essai', await ev(`(function(){var e=document.querySelector('#gBqPan .bcT[data-k="trainee:${id}"]');if(!e)return 'absente';e.click();return 'ok'})()`));
    await dormir(ATT);
    const d = await ev(CAP);
    if (typeof d === 'string' && d.startsWith('data:')) { const b = Buffer.from(d.split(',')[1], 'base64'); fs.writeFileSync(OUT + '/' + id + '.jpg', b); console.log(id, 'ok', b.length); } else console.log(id, 'rien', String(d).slice(0, 200));
  }
  console.log('erreurs', await (await fetch('http://127.0.0.1:' + P + '/err')).text());
})();
