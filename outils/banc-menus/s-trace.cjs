/* (2026-11-14, qualité · menus, trouvaille 19) le halo de la frénésie sur fond fixe : trace de Chrome de 2 s, peintures PLEIN ÉCRAN comptées à part
   (les autres peintures viennent des menus qui bougent derrière, elles ne disent rien du halo). */
module.exports = async function (b) {
  const { c, ev, dormir, W, H, log } = b;
  const trace = async (ms) => { const ev9 = []; const h = e => { try { const m = JSON.parse(e.data); if (m.method === 'Tracing.dataCollected') ev9.push(...m.params.value); } catch (_) {} };
    c.ws.addEventListener('message', h);
    const fini = new Promise(r => { const h2 = e => { try { if (JSON.parse(e.data).method === 'Tracing.tracingComplete') { c.ws.removeEventListener('message', h2); r(); } } catch (_) {} }; c.ws.addEventListener('message', h2); });
    await c.send('Tracing.start', { categories: 'devtools.timeline,disabled-by-default-devtools.timeline', transferMode: 'ReportEvents' });
    await dormir(ms); await c.send('Tracing.end'); await fini; c.ws.removeEventListener('message', h);
    const P = ev9.filter(x => x.name === 'Paint' && x.ph === 'X');
    const parN = {}; P.forEach(x => { const n = x.args && x.args.data && x.args.data.nodeId; parN[n] = (parN[n] || 0) + 1; });
    const aire = x => { const q = x.args && x.args.data && x.args.data.clip; if (!q) return 0; const xs = [q[0], q[2], q[4], q[6]], ys = [q[1], q[3], q[5], q[7]]; return (Math.max(...xs) - Math.min(...xs)) * (Math.max(...ys) - Math.min(...ys)); };
    const plein = P.filter(x => aire(x) >= W * H * .8);
    const halo = ids.reduce((s, i) => s + (parN[i] || 0), 0);
    return { peintures: P.length, peinturesDuHalo: halo, haloMs: +(P.filter(x => ids.includes(x.args && x.args.data && x.args.data.nodeId)).reduce((s, x) => s + (x.dur || 0), 0) / 1000).toFixed(1), top: Object.entries(parN).sort((a, b) => b[1] - a[1]).slice(0, 4) }; };
  await ev(`(function(){const bg=document.createElement('div');bg.id='bancFond';bg.style.cssText='position:fixed;inset:0;z-index:99998;background:#1b2a52';document.body.appendChild(bg);
    const g=document.getElementById('feverGlow');g._p=g.parentNode;document.body.appendChild(g);g.style.zIndex=99999;g.style.position='fixed';g.style.display='block';g.className='';return 1})()`);
  await c.send('DOM.enable'); const doc = await c.send('DOM.getDocument', { depth: -1, pierce: false });
  const q = await c.send('DOM.querySelector', { nodeId: doc.root.nodeId, selector: '#feverGlow' });
  const d = await c.send('DOM.describeNode', { nodeId: q.nodeId, depth: 1 });
  const ids = [d.node.backendNodeId].concat((d.node.pseudoElements || []).map(x => x.backendNodeId));
  log('noeuds du halo', JSON.stringify(ids));
  await dormir(600); const fren = await trace(2000);
  await ev(`(function(){document.getElementById('feverGlow').className='armed';return 1})()`);
  await dormir(600); const arme = await trace(2000);
  await ev(`(function(){document.getElementById('feverGlow').style.display='none';return 1})()`);
  await dormir(600); const sans = await trace(2000);
  await ev(`(function(){const g=document.getElementById('feverGlow');g.style.cssText='';g.className='';g._p.appendChild(g);document.getElementById('bancFond').remove();return 1})()`);
  log('trace halo', JSON.stringify({ fren, arme, sans }));
};
