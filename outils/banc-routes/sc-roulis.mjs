/* scénario : le roulis de la dalle, avant/après le lissage, sur les cartes × graines × paliers du VRAI jeu
   node jeu.mjs x x 0 0 cartes(virgules) graine0 graine1 palier(s, virgules) — voir jeu.mjs (SCRIPT=…/sc-roulis.mjs) */
export default async function(H,[_c,_m,_s,_p,cartes,g0,g1,paliers]){
  for(const carte of String(cartes).split(','))for(const pal of String(paliers||'0').split(','))for(let g=+g0;g<=+g1;g++){
    const r=await H.ev(`(function(){try{var t=dbgTrace({carte:'${carte}',graine:${g},palier:${+pal}});var r=dbgRoulis();return JSON.stringify({carte:'${carte}',g:${g},pal:${+pal},ok:t.graineOk,r:r});}catch(e){return JSON.stringify({carte:'${carte}',g:${g},err:String(e&&e.stack||e).slice(0,300)});}})()`);
    console.log(r);}
}
