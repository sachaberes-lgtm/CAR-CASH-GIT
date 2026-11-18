/* (banc enjeu) sonde : évalue une expression dans le Chrome du banc en cours — node outils/banc-espace/enjeu-sonde.cjs <port cdp> "<expr>" */
const { CDP } = require('../banc-trainees/cdp.cjs');
(async () => { const l = await (await fetch('http://127.0.0.1:' + process.argv[2] + '/json')).json(); const c = new CDP(l.find(x => x.type === 'page').webSocketDebuggerUrl); await c.ok;
  console.log(JSON.stringify(await c.ev(process.argv[3], 15000))); c.close(); process.exit(0); })().catch(e => { console.log('ERR', e.message); process.exit(1); });
