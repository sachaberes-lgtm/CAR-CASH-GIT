// L'ENVELOPPE d'un .wav du banc du mixage : le niveau RMS (dB) par tranche (défaut 100 ms) — pour VOIR une traîne, un raté, une attaque.
//   node outils/banc-son/enveloppe.mjs fichier.wav [ms] [debut_s] [fin_s]
import fs from 'node:fs';
const [f, ms = 100, d0 = 0, d1 = 1e9] = process.argv.slice(2), b = fs.readFileSync(f), sr = b.readUInt32LE(24), n = (b.length - 44) / 2, pas = Math.round(sr * ms / 1000); let l = '';
for (let o = Math.round(d0 * sr); o + pas <= Math.min(n, d1 * sr); o += pas) { let q = 0; for (let i = 0; i < pas; i++) { const v = b.readInt16LE(44 + (o + i) * 2) / 32767; q += v * v; } const db = 10 * Math.log10(q / pas + 1e-12); l += (o / sr).toFixed(2).padStart(6) + ' s ' + db.toFixed(1).padStart(6) + ' ' + '#'.repeat(Math.max(0, Math.round((db + 70) / 1.5))) + '\n'; }
console.log(l);
