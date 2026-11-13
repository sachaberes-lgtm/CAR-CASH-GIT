async function(cfg){
  const T=+(window.__T||45),rec2=[];
  const st=await __L.start(cfg.graine);if(!st.ok)return st;
  const ms=1000/cfg.hz;
  dbgAuto(1,0);
  const info={L:(dbgDuree()||{}).L};
  const rec=__L.run(ms,T,function(k,t){if(k%Math.max(1,Math.round(cfg.hz/4))===0){const e=dbgEco(),f=dbgFren();rec2.push([t,e.nitroR,e.nitroOn?1:0,f.v,f.lv,e.zones,e.vmax]);}});
  return {st:st,info:info,rec:rec,aux:rec2};
}
