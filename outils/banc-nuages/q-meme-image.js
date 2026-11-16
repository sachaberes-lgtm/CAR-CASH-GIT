(async function(){/* même image ? la forme légère d'un nuage à part en flottants (page ?sans=nucompact) puis la MÊME en octets serrés, même instant, même caméra */
const dort=ms=>new Promise(r=>setTimeout(r,ms));const sc=dbgScene().scene,rd=dbgScene().rdr,gl=rd.getContext();dbgAuto(1,0,{nit:0});
for(let w=0;w<400;w++){let v8=0,v8f=0,nl=0;sc.traverse(function(m){if(m.name==='nuages v8'){v8++;if(m.userData.fin)v8f++;if(m.userData.lod)nl++;}});if(dbgCoton().toutPretMs!=null&&v8f>=v8&&nl>=v8-1)break;await dort(500);}
await dort(1500);
function compact(a0,k){const A=a0.array,n=A.length,B=k==='normal'?new Int8Array(n):new Uint8Array(n);
  if(k==='normal'){for(let i=0;i<n;i++){const v=A[i];B[i]=Math.round((v>1?1:v<-1?-1:v)*127);}}else{for(let i=0;i<n;i++){const v=A[i];B[i]=Math.round((v>1?1:v<0?0:v)*255);}}
  return new a0.constructor(B,a0.itemSize,true);}
function copie(g){const h=g.clone();for(const k of ['normal','color']){const a=g.attributes[k];if(a&&a.array&&a.array.length)h.setAttribute(k,compact(a,k));}return h;}
const W=gl.drawingBufferWidth,H=gl.drawingBufferHeight;const lit=function(){const a=new Uint8Array(W*H*4);gl.readPixels(0,0,W,H,gl.RGBA,gl.UNSIGNED_BYTE,a);return a;};
const L=[];sc.traverse(function(m){if(m.name==='nuages v8'&&m.userData.lod){const l=m.userData.lod;if(l.G[1]&&l.G[1].attributes.normal.array&&l.G[1].attributes.normal.array.length&&l.G[1].attributes.normal.array instanceof Float32Array)L.push(m);}});
const out={candidats:L.length,vues:[]};
for(const m of L.slice(0,4)){const l=m.userData.lod;l.seuil=1e9;const Gc=copie(l.G[1]),Pc=l.P[1]?copie(l.P[1]):null;const c=m.geometry.boundingSphere.center.clone().applyMatrix4(m.matrixWorld),R=l.R;
  for(const [dist,ang] of [[1.7,.6],[2.6,2.4]]){
    const o={p:[c.x+Math.cos(ang)*R*dist,c.y+R*.35,c.z+Math.sin(ang)*R*dist],c:[c.x,c.y,c.z],fov:55};
    l.G[1]=l.G0f||l.G[1];l.P[1]=l.P0f||l.P[1];l.G0f=l.G[1];l.P0f=l.P[1];l.i=-1;
    window.dbgAudit('vue',o);window.dbgAudit('vue',o);const A=lit();
    l.G[1]=Gc;if(Pc)l.P[1]=Pc;l.i=-1;window.dbgAudit('vue',o);window.dbgAudit('vue',o);const B=lit();
    l.G[1]=l.G0f;l.P[1]=l.P0f;l.i=-1;window.dbgAudit('vue',o);window.dbgAudit('vue',o);const A2=lit();
    let n2=0,n8=0,mx=0,bruit=0,pc=0;for(let i=0;i<A.length;i+=4){let d=0,db=0;for(let q=0;q<3;q++){d=Math.max(d,Math.abs(A[i+q]-B[i+q]));db=Math.max(db,Math.abs(A[i+q]-A2[i+q]));}if(d>2)n2++;if(d>8)n8++;if(d>mx)mx=d;if(db>2)bruit++;}
    out.vues.push({R:Math.round(R),dist:dist,px:W*H,diffSup2:n2,diffSup8:n8,max:mx,bruitAvantAvant:bruit});}}
return out;})()
