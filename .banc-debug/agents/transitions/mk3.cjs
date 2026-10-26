const fs=require('fs');const S2=JSON.parse(fs.readFileSync(__dirname+'/scen2.json','utf8')).filter(s=>s.nom!=='alterne');
S2.push({nom:'alterne',carte:'nuages',meteo:'midi',secs:3,auto:{lat:0},
 chaine:'crypto:nuit,nuages:midi,espace:midi,nuages:midi,crypto:nuit,nuages:midi,grotte:matin,nuages:midi,ville:nuit:bleu,nuages:midi',
 sonde:`(function(){const t=G.dbgT();G.__snaps=G.__snaps||[];if(G.__z!==t.zones){G.__z=t.zones;const h={};for(const o of G.dbgScene().scene.children){const k=(o.name||o.type)+(o.visible?'':'~');h[k]=(h[k]||0)+1;}G.__snaps.push({z:t.zones,c:t.carte,sc:t.sc,geo:t.mem.geometries,tex:t.mem.textures,h:h});}return t.sc})()`,
 evalFin:`(function(){return G.__snaps;})()`});
fs.writeFileSync(__dirname+'/scen2.json',JSON.stringify(S2,null,1));console.log(S2.map(s=>s.nom+':'+(s.secs)));
