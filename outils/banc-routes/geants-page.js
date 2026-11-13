(async function(){ /* (v6, 2026-11-14) LES VUES DES GÉANTS de l'orbite (banc.cjs gen --auditfile=…) : pour chaque géant posé (dbgMods().geants, c = son centre), une caméra sur la route
   ~1,2 rayon de virage avant lui, relevée de 70 m et reculée vers l'extérieur, qui le regarde — à passer à banc.cjs vue --vues="…". Et l'ouverture, le raccourci (rac), la plongée en vues de route. */
  const R=dbgRoute(),L=R.L,NP=R.NP,k=L/Math.max(1,NP-1),mods=window.dbgMods?dbgMods():[];const out={vues:[],mods:[]};
  const pt=function(s){const i=Math.max(0,Math.min(NP-1,Math.round(s/k)));return {p:R.pts[i],t:R.T[i],n:R.Nn[i]};};
  for(const m of mods){out.mods.push(m.fig+(m.climax?'*':'')+'@'+m.s0+'-'+m.s1);if(!m.geants)continue;
    for(const q of m.geants){if(!q.c)continue;const s0=Math.max(0,q.s-Math.min(700,1.1*q.R)),a=pt(s0),c=q.c;
      const dx=a.p.x-c[0],dz=a.p.z-c[2],dl=Math.hypot(dx,dz)||1,cam=[a.p.x+dx/dl*90,a.p.y+70,a.p.z+dz/dl*90];
      out.vues.push({nom:(q.gros?'rentree':m.fig)+'-rg'+q.rg,v:cam.map(Math.round).join(',')+':'+c.join(',')});}}
  return out;})()
