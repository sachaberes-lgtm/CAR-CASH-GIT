// LE BANC DE LA CAISSE — photographier la TOILE (pas l'écran) : node outils/banc-caisse/pose.cjs <fichier.png> "<expression posée avant le rendu>"
const fs = require('fs'), path = require('path');
const H = JSON.parse(fs.readFileSync(path.join(__dirname, '.hote.json'), 'utf8'));
const post = q => fetch(`http://127.0.0.1:${H.http}/__cmd`, { method: 'POST', body: JSON.stringify(q) }).then(r => r.text());
(async () => {
  await post({ op: 'ev', expr: fs.readFileSync(path.join(__dirname, 'rendu.js'), 'utf8') });
  const t = await post({ op: 'ev', expr: 'window.__bancPose(' + JSON.stringify(process.argv[3] || '1') + ')' });
  if (!t.startsWith('data:image/png;base64,')) { console.log(t.slice(0, 300)); process.exit(1); }
  fs.writeFileSync(path.resolve(process.argv[2]), Buffer.from(t.slice(22), 'base64')); console.log('toile', process.argv[2]); process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
