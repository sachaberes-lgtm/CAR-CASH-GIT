const HOOK=`(function(){window.__ev9=[];var L=function(o){var a=window.__ev9;o.s=+s.toFixed(0);o.lat=+lat.toFixed(1);o.vA=+vA.toFixed(0);o.y=+carGroup.position.y.toFixed(1);o.t=+t.toFixed(1);a.push(o);if(a.length>40)a.shift();};
var sf=startFall;startFall=function(){L({e:'startFall',side:side,args:[].slice.call(arguments).map(function(v){return typeof v==='number'?+v.toFixed(1):v;}),mode:mode});return sf.apply(this,arguments);};
var tl=tryLand;tryLand=function(dt){var r=tl(dt);if(r)L({e:'pose',hOff:+curHOff.toFixed(2)});return r;};
var e0=explode;explode=function(c){L({e:'explode',c:c,mode:mode,CY:CY.on,DN:DN.on,lvl:LVL.cur&&LVL.cur.id,fallT:+fallT.toFixed(2),fallTR:+fallTR.toFixed(2),airMax:+airMax().toFixed(1)});window.__mort=window.__ev9.slice();return e0.apply(this,arguments);};return 1;})()`;
export default async function(H,[carte,meteo,secs]){
  await H.jouer();await H.sleep(2500);
  await H.ev('__ev('+JSON.stringify(HOOK)+')');
  await H.ev('dbgAuto(1,0,{vol:true});1');const t0=Date.now();let nm=0;
  while((Date.now()-t0)/1000<+secs){await H.sleep(500);
    const m=await H.ev('JSON.stringify(__ev("window.__mort||null"))').catch(()=>'null');
    if(m!=='null'){nm++;console.log('MORT',m.slice(-2200));await H.ev('__ev("window.__mort=null;1")');
      await H.ev('(typeof dbgEco==="function"&&dbgEco("rejouer"),1)').catch(()=>{});await H.sleep(4000);await H.ev('dbgAuto(1,0,{vol:true});1').catch(()=>{});if(nm>=5)break;}}
  console.log('fini',nm);
}
