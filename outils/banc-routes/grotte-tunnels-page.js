(function(){ /* (2026-11-14) LA PART DE ROUTE SERRÉE, EN JEU (banc.cjs gen --carte=grotte --auditfile=outils/banc-routes/grotte-tunnels-page.js) : la définition SERRÉ de grotte-tunnels.cjs
   (paroi à moins de 40 m du bord de la dalle, ou voûte à moins de 60 m), lue sur la grotte BÂTIE par dbgGrotte('sonde') tous les 36 m — le jeu n'expose rien d'autre que ses crochets.
   Plus la règle d'or (dbgGrotte('test') : de la roche dans le couloir de la route), l'audit, les décors mal placés et le coût (triangles, tirages). LECTURE SEULE. */
  var g=dbgGrotte();if(!g||!g.L)return 'pas de grotte bâtie';var L9=g.L,RH0=28;
  var n=0,nS=0,nO=0,runs=[],cur=null,vu={};
  for(var s=20;s<L9;s+=36){var o=dbgGrotte('sonde',{s:s});if(!o||!o.pts)continue;var p=o.pts[3];if(vu[p.S])continue;vu[p.S]=1;n++;var se=p.rh-RH0<40||p.up<60;if(se){nS++;if(!cur)cur=[p.S,p.S,p.rh,p.up];cur[1]=p.S;cur[2]=Math.min(cur[2],p.rh);cur[3]=Math.min(cur[3],p.up);}else if(cur){runs.push(cur);cur=null;}if(p.rh>=150&&p.up>=120)nO++;}
  if(cur)runs.push(cur);
  var t=dbgGrotte('test'),a=dbgGrotte('audit'),d=dbgGrotte('decors'),M=dbgGrotte('module'),i=null;try{var r=dbgScene().rdr.info;i={calls:r.render.calls,tri:r.render.triangles,geo:r.memory.geometries,tex:r.memory.textures};}catch(e){i=String(e);}
  var ou=(t&&t.ou||'').split(' ').filter(Boolean),dans=0;for(var k=0;k<ou.length;k++){var s9=+(/^[RD](\d+)/.exec(ou[k])||[0,-1])[1];for(var j=0;j<runs.length;j++)if(s9>=runs[j][0]-120&&s9<=runs[j][1]+120){dans++;break;}}
  return {L:Math.round(L9),serre:+(nS/n).toFixed(3),ouvert:+(nO/n).toFixed(3),serres:runs,perso:g.hasard&&g.hasard.perso,descente:g.hasard&&g.hasard.descente,
    modules:(Array.isArray(M)?M:[]).filter(function(m){return m.nom;}).map(function(m){return m.nom+(m.tunnel?'*':'')+':'+m.s0+'-'+m.s1;}).join(' '),
    roche:t&&t.roche,rocheDecor:t&&t.decors,rocheOu:ou.slice(0,6).join(' '),rochePresDunSerre:dans+'/'+ou.length,
    audit:{roche:a.roche,decor:a.decor,bitume:a.bitume,frole:a.frole,lumRoche:a.lumRoche,flotte:a.flotte},malPlaces:d.malPlaces,mal:d.mal,
    cout:{tri:g.n.triangles,troncons:g.n.troncons,lumieres:g.n.lumieres,decors:g.n.decors,ms:g.ms,msCreuse:g.msCreuse,tm:g.tm},info:i};
})()
