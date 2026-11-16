(async function(){ /* (v6, 2026-11-14) LE CLIMAX DE L'ORBITE dans la page (banc.cjs gen --auditfile=…) : les modules de la piste bâtie, les géants posés (rg, G = le plus gros),
   la pente de la route (degrés, + = descend) et l'angle de la dalle avec le haut du monde tous les 100 m depuis la rentrée jusqu'au portail. */
  const R=dbgRoute(),L=R.L,NP=R.NP,k=L/Math.max(1,NP-1),mods=window.dbgMods?dbgMods():[];
  const out={L:Math.round(L),mods:mods.map(function(m){return m.fig+(m.climax?'*':'')+'@'+m.s0+'-'+m.s1+(m.geants?' g'+m.geants.map(function(q){return q.rg+(q.gros?'G':'');}).join('/'):'');})};
  const at=function(s){const i=Math.max(0,Math.min(NP-1,Math.round(s/k)));return [Math.round(-Math.asin(Math.max(-1,Math.min(1,R.T[i].y)))*57.3),Math.round(Math.acos(Math.max(-1,Math.min(1,R.Nn[i].y)))*57.3)];};
  const rt=mods.find(function(m){return m.fig==='rentree';});const pr=[];for(let s=(rt?rt.s0-200:L-3000);s<L;s+=100)pr.push(Math.round(s)+':'+at(s).join('/'));
  out.profil=pr.join(' ');let pm=0,pa=0;for(let s=0;s<L;s+=10){const a=at(s)[0];if(a>pm){pm=a;pa=s;}}out.penteMax=pm+'@'+Math.round(pa);
  out.erreurs=(window.dbgErreurs?dbgErreurs():[]).slice(-5);
  return out;})()
