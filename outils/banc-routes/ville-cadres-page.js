(function(){try{const r=window.dbgVillePortiques?dbgVillePortiques():'pas de crochet';let sc=null;try{const d=dbgVilleDeco();sc=(d.scenes||[]).filter(function(p){return p.ok;}).map(function(p){return p.t+'@'+p.x+','+p.z;});}catch(e){}
let tri=null;try{const S=dbgScene();tri={calls:S.rdr.info.render.calls,tri:S.rdr.info.render.triangles,geo:S.rdr.info.memory.geometries,tex:S.rdr.info.memory.textures};}catch(e){}
return {cadres:r,scenes:sc,info:tri};}catch(e){return String(e);}})()
