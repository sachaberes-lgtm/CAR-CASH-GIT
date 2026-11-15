(async function(){ /* (2026-11-14, LE COÛT DE LA GROTTE) banc.cjs gen --carte=grotte --auditfile=outils/banc-routes/grotte-cout-page.js — LECTURE SEULE.
   La grotte bâtie EN ENTIER (on attend la fin des tranches), puis : triangles, sommets, tronçons, géométries, temps de construction ;
   une vue figée à 15 % et 60 % de chaque module (dbgGrotte('module')) : appels et triangles de l'image (dbgAppels, la roche à part)
   et le coût de l'image chronométré (le rendu complet de dbgGrotte('vue') suivi de la lecture d'un pixel, médiane de 9). */
  var dort=function(ms){return new Promise(function(r){setTimeout(r,ms);});};
  for(var i=0;i<600&&!dbgGrotte().pret;i++)await dort(250);
  for(var i=0;i<120&&dbgGrotte().lotsRestants;i++)await dort(250); /* (LES LOTS) recollés une image après l'autre */
  var g=dbgGrotte(),rd=dbgScene().rdr,sc=dbgScene().scene;
  var out={nGrotte:g.n,lotsRestants:g.lotsRestants,pret:g.pret,ms:g.ms,msFile:g.msFile,tm:g.tm,tri:g.n.triangles,troncons:g.n.troncons,decors:g.n.decors,lumieres:g.n.lumieres,
    geo:rd.info.memory.geometries,tex:rd.info.memory.textures,prog:(rd.info.programs||[]).length};
  var root=null;sc.traverse(function(o){if(o.name==='grotte décor')root=o;});
  var nv=0,nm=0,oct=0;if(root)root.traverse(function(o){if(o.isMesh&&o.geometry){nm++;var A=o.geometry.attributes;for(var k in A){oct+=A[k].count*A[k].itemSize*(A[k].array?A[k].array.BYTES_PER_ELEMENT:(k==='position'?(o.userData.p16?2:4):1));}if(A.position)nv+=A.position.count;if(o.geometry.index)oct+=o.geometry.index.count*4;}});
  out.meshes=nm;out.sommets=nv;out.ko=Math.round(oct/1024);
  var M=dbgGrotte('module'),V=[],S={appels:0,tri:0,roc:0,rocT:0,ms:0,n:0},gl=rd.getContext(),px=new Uint8Array(4);
  for(var k=0;k<M.length;k++){var m=M[k];if(m.s0==null||m.s1==null)continue;var fr=[.15,.6];for(var f=0;f<fr.length;f++){var d=Math.round((m.s1-m.s0)*fr[f]);
    var r=dbgGrotte('module',{n:m.n,d:d});if(r!=='ok')continue;await dort(20);
    var a=dbgAppels(80),roc=0,rocT=0;for(var e=0;e<a.liste.length;e++){var L9=a.liste[e];if(/grotte roche|grotte d/.test(L9[2])){roc+=L9[0];rocT+=parseInt(L9[1]);}}
    var T=[];for(var j=0;j<9;j++){var t0=performance.now();dbgGrotte('module',{n:m.n,d:d});gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,px);T.push(performance.now()-t0);}
    T.sort(function(x,y){return x-y;});var ap=a.appels,tr=parseInt(a.triangles);
    V.push([m.n+':'+d,ap,tr,roc,rocT,+T[4].toFixed(2)]);S.appels+=ap;S.tri+=tr;S.roc+=roc;S.rocT+=rocT;S.ms+=T[4];S.n++;}}
  out.vues=V;out.somme={n:S.n,appels:S.appels,triK:S.tri,rocAppels:S.roc,rocK:S.rocT,ms:+S.ms.toFixed(1)};
  try{var top=dbgAppels(12).liste;out.top=top;}catch(e){}
  return out;
})()
