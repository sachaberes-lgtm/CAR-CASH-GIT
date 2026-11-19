// LA COURSE COMPLÈTE (2026-11-19, astuces-chauffe) : nuages → 3 portails (vrais passages, dbgPortail 300 m avant) → mort → seconde chance → mort →
// menu → relance → mort → garage. Note les maps traversées, les exceptions de la page, window.__loopErr / __banqErr, et le compte des erreurs de boucle.
//   node outils/banc-astuces/course.cjs [--qs "sans=derriere"] [--carte nuages]
const path = require('path');
const { ouvre, dormir } = require('../banc-jsimage/commun.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.join(path.resolve(__dirname, '..', '..'), 'VERSION PRINCIPALE');
const R = { qs: A.qs || '', etapes: [] };
const note = (k, v) => { R.etapes.push([k, v]); console.error(k, JSON.stringify(v)); };
(async () => {
  let c;
  try {
    ({ c } = await ouvre({ dirs: [JEU], http: +(A.http || 9781), cdp: +(A.cdp || 9782), carte: A.carte || 'nuages', qs: A.qs || '', graine: 7 }));
    const ev = (x, ms) => c.ev(x, ms || 30000);
    const niv = () => ev("(function(){var n=dbgClassique().niveau;return n?n.carte+'/'+n.meteo:null})()");
    const vit = () => ev("(function(){var s=dbgState();return {st:s.started,run:s.running,go:s.gameOver,mode:s.mode,le:String(window.__loopErr||''),be:String(window.__banqErr||'')}})()");
    await ev("dbgImmortel(true);dbgAuto(1,0,{vol:1,saut:.3,imp:25,nit:2});1");
    note('départ', await niv());
    await dormir(8000);
    for (let p = 0; p < 3; p++) {
      const n0 = await niv(); await ev("dbgPortail(300)");
      let n1 = n0; for (let i = 0; i < 40 && n1 === n0; i++) { await dormir(1000); n1 = await niv(); }
      await dormir(9000);
      note('portail ' + (p + 1), { de: n0, vers: n1, etat: await vit() });
    }
    /* la mort : immortalité coupée, pilote coupé, plein gaz */
    const meurt = async (k) => { await ev("dbgImmortel(false);dbgAuto(false);1"); let go = false;
      for (let i = 0; i < 45 && !go; i++) { await dormir(1000); go = (await vit()).go; if (i === 15 || i === 30) await ev("dbgPortail(5);1").catch(() => {}); }
      note(k, { mort: go, etat: await vit() }); return go; };
    await meurt('mort 1');
    const ch = await ev("(function(){try{var e=chanceEtat();return e}catch(x){return String(x)}})()"); note('chance', ch);
    if (ch && ch.ok) { await ev("chanceJoue();1"); await dormir(6000); await ev("dbgImmortel(true);dbgAuto(1,0,{vol:1,saut:.3,imp:25,nit:2});1"); await dormir(6000); note('reprise', await vit()); await meurt('mort 2'); }
    await dormir(5000);
    /* le menu, puis la relance */
    await ev("(function(){var b=[].slice.call(document.querySelectorAll('[data-m=\"menu\"],[data-m=\"replay\"]')).filter(function(x){return x.offsetParent})[0];if(b)b.click();return !!b})()");
    await dormir(4000);
    let st = false; for (let i = 0; i < 20 && !st; i++) { try { await ev("dbgClassique('nuages');dbgJouer();1"); } catch (e) {} await dormir(1500); st = (await vit()).st; }
    await ev("dbgImmortel(true);dbgAuto(1,0,{vol:1,saut:.3,imp:25,nit:2});1");
    await dormir(10000); note('relance', { niv: await niv(), etat: await vit() });
    await meurt('mort 3');
    await dormir(5000);
    await ev("(function(){var b=[].slice.call(document.querySelectorAll('[data-m=\"menu\"]')).filter(function(x){return x.offsetParent})[0];if(b)b.click();return 1})()");
    await dormir(4000);
    const g = await ev("(function(){var b=[].slice.call(document.querySelectorAll('[data-m=\"garage\"]')).filter(function(x){return x.offsetParent})[0];if(b)b.click();return !!b})()");
    await dormir(6000); note('garage', { bouton: g, etat: await vit(), garage: await ev("(function(){try{return dbgGarage('etat')}catch(e){return String(e)}})()") });
    R.exc = c.exc.slice(0, 10); R.nExc = c.exc.length;
  } catch (e) { R.erreur = String(e && e.stack || e); }
  finally { if (c) c.fin(); }
  console.log(JSON.stringify(R));
  process.exit(0);
})();
