// Fuite d'une map à l'autre ? Course pilotée, puis N portails (dbgSaut) : après chacun, on compte ce que la scène et la carte graphique portent.
// node cdp.mjs fuite.mjs <n portails> <secondes par map>
import fs from 'node:fs';
const dort = (ms) => new Promise((r) => setTimeout(r, ms));
export default async function (c, [n = '10', s = '6']) {
  const etat = () => c.js(`JSON.stringify(window.dbgState?(({started,gameOver,mode})=>({started,gameOver,mode}))(dbgState()):null)`).then(JSON.parse);
  let e = await etat();
  if (!e || !e.started || e.gameOver) {
    await c.js(`(function(){const b=[...document.querySelectorAll('[data-m="play"]')].find(x=>x.getClientRects().length);if(b)b.click();else if(window.dbgEco)dbgEco('rejouer');return !!b;})()`);
    for (let i = 0; i < 40; i++) { await dort(500); e = await etat(); if (e && e.started && !e.gameOver) break; }
  }
  await c.js(`dbgAuto(1,0,{nit:1});1`);
  const mesure = async (k) => {
    await c.js(`window.__fr2={t:[],d:performance.now()};(function f(n){const R=window.__fr2;if(!R)return;R.t.push(n-R.d);R.d=n;if(R.t.length<400)requestAnimationFrame(f);})(performance.now());dbgCout(1);1`);
    await dort(+s * 1000);
    return JSON.parse(await c.js(`(function(){const co=dbgCout();dbgCout(0);const sc=dbgScene();let ob=0,me=0,vis=0;sc.scene.traverse(function(o){ob++;if(o.isMesh||o.isPoints||o.isLine){me++;if(o.visible)vis++;}});
      const t=window.__fr2.t.slice(5).sort((a,b)=>a-b);window.__fr2=null;const ri=sc.rdr?sc.rdr.info:null;
      return JSON.stringify({k:${k},lieu:window.dbgNiveau?dbgNiveau().lieu:null,niv:window.dbgNiveau?dbgNiveau().niveau:null,mort:dbgState().gameOver,
        geo:co.geo,tex:co.tex,progs:co.progs,calls:co.image&&co.image.calls,tris:co.image&&co.image.tris,objets:ob,maillages:me,visibles:vis,
        med:t.length?+t[t.length>>1].toFixed(1):null,p90:t.length?+t[Math.floor(t.length*.9)].toFixed(1):null,dpr:co.dpr,ql:co.ql});})()`));
  };
  const L = [];
  for (let k = 0; k <= +n; k++) {
    const m = await mesure(k); L.push(m); console.log(JSON.stringify(m));
    if (m.mort) { await c.js(`dbgEco('rejouer');1`); await dort(4000); await c.js(`dbgAuto(1,0,{nit:1});1`); }
    if (k < +n) { await c.js(`dbgSaut();dbgAuto(1,0,{nit:1});1`); await dort(1500); }
  }
  fs.writeFileSync('res-app/fuite-' + Date.now() + '.json', JSON.stringify(L));
  await c.js(`dbgAuto(0);1`);
}
