/* scénario (LA GÉNÉRATION PROPRE, 07/11) : bâtir la route (carte, graine, palier), se poser `avant` m avant le module `fig` (ou le climax), rouler au pilote auto, une capture toutes les 400 ms.
   OUT=dossier SCRIPT=outils/banc-routes/sc-climax.mjs node outils/banc-routes/jeu.mjs carte meteo 0 palier graine fig|climax secondes [avant m] */
export default async function(H,[carte,meteo,_s,palier,g,fig,secs,avant]){
  await H.jouer();await H.sleep(2500);
  const t=await H.ev(`(function(){var t=dbgTrace({carte:'${carte}',meteo:'${meteo}',graine:${+g},palier:${+palier||0}});return JSON.stringify({L:t.L,ok:t.graineOk,mods:dbgMods(),phrase:window.__phrase?window.__phrase.genre:null});})()`);console.log(t);
  const o=JSON.parse(t),m=o.mods.find(x=>fig==='climax'?x.climax:x.fig===fig)||o.mods.find(x=>x.climax);
  if(!m){console.log('module introuvable',fig);return;}
  const sDep=Math.max(80,m.s0-(+avant||160));console.log('module',JSON.stringify(m),'départ à',sDep);
  await H.ev(`dbgAuto(1,0);dbgBord({s:${sDep},lat:0,psi:0,vA:150,grace:2});1`);
  const t0=Date.now();let k=0;
  while((Date.now()-t0)/1000<+secs){await H.sleep(400);
    const st=await H.ev(`JSON.stringify((function(){var s=dbgState(),b=dbgBord();return {mode:s.mode,over:s.gameOver,vH:s.vH,roulis:s.roulisDeg,s:typeof s.s==='number'?Math.round(s.s):null};})())`).catch(e=>'ERR');
    console.log(st);await H.shot((fig||'climax')+'-'+String(k++).padStart(3,'0'));if(/"over":true/.test(st))break;}
}
