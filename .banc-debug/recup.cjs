// recup.cjs — récupère, dans les transcriptions des agents de la séance du 18-19/10, leurs correctifs et leurs notes (le scratchpad a été effacé)
const fs = require('fs'), path = require('path');
const D = process.env.HOME + '/.claude/projects/-Users-sachaberes-cash-car-foret/e762ca5d-4e2a-4f31-8f63-9bd36d6789b7/subagents';
const NOMS = { a09acf26ca041abc9: 'jade', a0d7e24609de6c2d5: 'mort', a17b735942ea80452: 'meteos', a44c29b60a1524028: 'foret', a4faca50cfc792adf: 'canyon', a5c64cbf21221275f: 'nuages', a5ef0f9f728a81b82: 'portails', a93bfaf89319bd98d: 'crypto', a9cefa645dcd20449: 'grotte', aa3e9975eec1c5c71: 'glacier', abe477e2fde81cfba: 'orbite', acb2cc31d71785df8: 'ville', ada7136a5cc2197b6: 'volcan' };
const OUT = path.join(__dirname, 'recup'); fs.mkdirSync(OUT, { recursive: true });
for (const [id, nom] of Object.entries(NOMS)) {
  const L = fs.readFileSync(path.join(D, 'agent-' + id + '.jsonl'), 'utf8').split('\n').filter(Boolean).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
  const textes = [], correctifs = [], ecrits = [];
  for (const o of L) {
    const c = o.message && o.message.content; if (!Array.isArray(c) || o.type !== 'assistant') continue;
    for (const b of c) {
      if (b.type === 'text' && b.text.trim()) textes.push(b.text.trim());
      if (b.type === 'tool_use') {
        const i = b.input || {};
        if (b.name === 'Write' && /correctif[^/]*\.json$/.test(i.file_path || '')) correctifs.push({ f: i.file_path, c: i.content });
        else if (b.name === 'Write') ecrits.push(i.file_path);
        if (b.name === 'Bash' && /correctif[^ ]*\.json/.test(i.command || '') && /<<|writeFileSync/.test(i.command || '')) correctifs.push({ f: 'bash', c: i.command });
        if (b.name === 'Edit' && /correctif/.test(i.file_path || '')) correctifs.push({ f: i.file_path + ' (Edit)', c: JSON.stringify({ old: i.old_string, new: i.new_string }) });
      }
    }
  }
  fs.writeFileSync(path.join(OUT, nom + '-textes.md'), textes.map((t, k) => '### ' + k + '\n' + t).join('\n\n'));
  correctifs.forEach((x, k) => fs.writeFileSync(path.join(OUT, nom + '-correctif-' + k + '.txt'), x.f + '\n' + x.c));
  console.log(nom.padEnd(9), 'textes', String(textes.length).padStart(3), '· correctifs écrits', correctifs.length, '· autres Write', ecrits.length, '· dernier texte :', (textes[textes.length - 1] || '').slice(0, 90).replace(/\n/g, ' '));
}
