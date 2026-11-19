// diagnostic court : une course, les avertissements « image · » / « créatures » et les exceptions de la page
const path = require('path');
const { ouvre, dormir } = require('../banc-jsimage/commun.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.join(path.resolve(__dirname, '..', '..'), 'VERSION PRINCIPALE');
(async () => {
  let c; const W = [];
  try {
    ({ c } = await ouvre({ dirs: [JEU], http: 9781, cdp: 9782, carte: A.carte || 'canyon', qs: A.qs || '', graine: 7,
      avant: ';(function(){var w=console.warn,e=console.error;window.__avert=[];console.warn=function(){try{window.__avert.push([].map.call(arguments,function(x){return x&&x.stack?String(x.stack).slice(0,600):String(x)}).join(" | "))}catch(_){}return w.apply(console,arguments)};console.error=function(){try{window.__avert.push("ERR "+[].map.call(arguments,function(x){return x&&x.stack?String(x.stack).slice(0,600):String(x)}).join(" | "))}catch(_){}return e.apply(console,arguments)};})();' }));
    await c.ev("dbgImmortel(true);dbgAuto(1,0,{vol:1,saut:.3,imp:25,nit:2});1");
    await dormir(+(A.attente || 15000));
    console.log(JSON.stringify(await c.ev("({av:(window.__avert||[]).slice(0,20),le:String(window.__loopErr||''),jum:window.dbgJumeaux&&dbgJumeaux(),info:dbgScene().rdr.info.render})"), null, 1));
    console.log('exc', JSON.stringify(c.exc.slice(0, 5)));
  } catch (e) { console.error(e); } finally { if (c) c.fin(); }
  process.exit(0);
})();
