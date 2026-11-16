(async function(){
  /* banc du coût des nuages (2026-11-14, optimiseur) : des vues fixes le long de la route, appels / triangles / coton / ms par vue */
  const P=window.__COUT||{n:24,ms:1,kinds:['sol','vol','large']};
  const R=window.dbgRoute(),sc=window.dbgScene(),rd=sc.rdr,gl=rd.getContext();try{sc.car.visible=false;}catch(e){}
  const dort=function(ms){return new Promise(function(r){setTimeout(r,ms);});};
  {const i=Math.round(R.NP*.04),p=R.pts[i],t=R.T[i];window.dbgAudit('vue',{p:[p.x-t.x*11,p.y+4.5,p.z-t.z*11],c:[p.x+t.x*40,p.y,p.z+t.z*40]});}
  const t0=performance.now();for(let w=0;w<600;w++){const c=window.dbgCoton();let v8=0,v8f=0;sc.scene.traverse(function(m){if(m.name==='nuages v8'){v8++;if(m.userData.fin)v8f++;}});if(c.toutPretMs!=null&&v8f>=v8&&c.nuages>0)break;await dort(500);}
  await dort(1500);
  const out={L:Math.round(R.L),attente:Math.round(performance.now()-t0),coton0:window.dbgCoton(),vues:[],mem0:JSON.parse(JSON.stringify(rd.info.memory)),prog:rd.info.programs?rd.info.programs.length:null};
  const px=new Uint8Array(4);
  for(let k=0;k<P.n;k++){
    const s=R.L*(.04+.92*k/(P.n-1));const i=Math.max(1,Math.min(R.NP-2,Math.round(s/R.L*(R.NP-1))));const p=R.pts[i],t=R.T[i],n=R.Nn[i];
    for(const kind of P.kinds){
      let o;
      if(kind==='sol')o={p:[p.x-t.x*11+n.x*4.5,p.y-t.y*11+n.y*4.5,p.z-t.z*11+n.z*4.5],c:[p.x+t.x*40+n.x*1.5,p.y+t.y*40+n.y*1.5,p.z+t.z*40+n.z*1.5],fov:62};
      else if(kind==='vol')o={p:[p.x-t.x*30+n.x*70,p.y-t.y*30+n.y*70,p.z-t.z*30+n.z*70],c:[p.x+t.x*90+n.x*45,p.y+t.y*90+n.y*45,p.z+t.z*90+n.z*45],fov:66};
      else o={p:[p.x-t.x*40+n.x*18,p.y-t.y*40+n.y*18,p.z-t.z*40+n.z*18],c:[p.x+t.x*60,p.y+t.y*60,p.z+t.z*60],fov:60};
      window.dbgAudit('vue',o);
      const a=window.dbgAppels(60);const c=window.dbgCoton();
      const AG=out.ag||(out.ag={});for(const e of a.liste){const q=AG[e[2]]||(AG[e[2]]={n:0,tri:0,vues:0});q.n+=e[0];q.tri+=parseFloat(e[1]);q.vues++;}
      const v={s:Math.round(s),k:kind,appels:a.appels,tri:a.triangles,cotTri:c.triangles,pres:c.pres,loin:c.loin};
      if(P.ms){window.dbgAudit('vue',o);gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,px);const m=[];
        for(let b=0;b<5;b++){const t0=performance.now();for(let f=0;f<8;f++)window.dbgAudit('vue',o);gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,px);m.push((performance.now()-t0)/8);}
        m.sort(function(x,y){return x-y;});v.ms=+m[2].toFixed(2);v.msMin=+m[0].toFixed(2);}
      if(P.liste&&k===P.liste)v.liste=a.liste;
      out.vues.push(v);
    }
  }
  out.mem1=JSON.parse(JSON.stringify(rd.info.memory));
  return out;
})()
