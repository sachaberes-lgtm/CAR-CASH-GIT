/* scénario : la MÊME piste (Math.random graine fixe avant JOUER) au pilote automatique — pour comparer ?routes=ancien et le lissage.
   node jeu.mjs carte meteo secondes graine ; EXTRA='&routes=ancien' pour l'ancien */
export default async function(H,[carte,meteo,secs,graine]){
  await H.ev(`(function(){var a=${(+graine||1)>>>0};Math.random=function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};return 1;})()`);
  await H.jouer();await H.ev('dbgAuto(1,0);1');const t0=Date.now();let last='',morts=0;
  while((Date.now()-t0)/1000<+secs){await H.sleep(1500);
    last=await H.ev(`JSON.stringify((function(){var d=dbgState();return {t:${0},s:Math.round(typeof dbgPos==='function'?(dbgPos().s||0):(d.s||0)),over:d.gameOver,mode:d.mode,vH:d.vH};})())`).catch(e=>'ERR');
    if(/"over":true/.test(last)){morts=1;break;}}
  console.log('RES',JSON.stringify({carte,graine,secs:Math.round((Date.now()-t0)/1000),morts}),last);
}
