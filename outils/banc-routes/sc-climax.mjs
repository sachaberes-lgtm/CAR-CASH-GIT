/* scénario (LA GÉNÉRATION PROPRE, 07/11) : bâtir la route (carte, graine, palier), se poser `avant` m avant le module `fig` (ou le climax), rouler au pilote auto, une capture toutes les 400 ms.
   OUT=dossier SCRIPT=outils/banc-routes/sc-climax.mjs node outils/banc-routes/jeu.mjs carte meteo 0 palier graine fig|climax secondes [avant m] */
export default async function(H,[carte,meteo,_s,palier,g,fig,secs,avant]){
  await H.jouer();await H.sleep(2500);
  /* (2026-11-07) la route est REBÂTIE et la voiture POSÉE dans le même appel : entre deux appels une image du jeu s'écoule, la voiture déjà lancée se retrouvait hors de la nouvelle route et mourait (« boom ») sur les maps à sol (dunes, forêt) */
  const t=await H.ev(`(function(){var t=dbgTrace({carte:'${carte}',meteo:'${meteo}',graine:${+g},palier:${+palier||0}});var mods=dbgMods(),fig=${JSON.stringify(fig)};
    var m=null;for(var i=0;i<mods.length;i++){var x=mods[i];if(fig==='climax'?x.climax:x.fig===fig){m=x;break;}}if(!m)for(var i=0;i<mods.length;i++)if(mods[i].climax){m=mods[i];break;}
    var sDep=m?Math.max(80,m.s0-${+avant||160}):0;if(m){dbgAuto(1,0);dbgBord({s:sDep,lat:0,psi:0,vA:150,grace:2});}
    return JSON.stringify({L:t.L,ok:t.graineOk,mods:mods,phrase:window.__phrase?window.__phrase.genre:null,m:m,sDep:sDep});})()`);console.log(t);
  const o=JSON.parse(t),m=o.m;
  if(!m){console.log('module introuvable',fig);return;}
  console.log('module',JSON.stringify(m),'départ à',o.sDep);
  const t0=Date.now();let k=0;
  while((Date.now()-t0)/1000<+secs){await H.sleep(400);
    const st=await H.ev(`JSON.stringify((function(){var s=dbgState(),b=dbgBord();return {mode:s.mode,over:s.gameOver,vH:s.vH,roulis:s.roulisDeg,s:typeof s.s==='number'?Math.round(s.s):null};})())`).catch(e=>'ERR');
    console.log(st);await H.shot((fig||'climax')+'-'+String(k++).padStart(3,'0'));if(/"over":true/.test(st))break;}
}
