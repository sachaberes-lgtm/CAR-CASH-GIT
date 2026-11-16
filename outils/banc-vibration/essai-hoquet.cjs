// CORRECTIF D'ESSAI (banc seulement, --patch) : le ressort du hoquet de la carrosserie intégré par pas d'au plus 1/60 s (deux pas à 30 i/s), au lieu d'un pas borné à 1/30 s.
// Rien n'est écrit dans le dépôt : cadence.cjs applique cette fonction à la copie d'index.html qu'il sert.
const AVANT = 'const d=Math.min(dt,1/30);CGOR.gv+=(-CGOR.gy*1600-CGOR.gv*34)*d;CGOR.gy+=CGOR.gv*d;';
const APRES = 'const n9=Math.max(1,Math.ceil(dt*60-1e-6)),d=dt/n9;for(let i9=0;i9<n9;i9++){CGOR.gv+=(-CGOR.gy*1600-CGOR.gv*34)*d;CGOR.gy+=CGOR.gv*d;}';
module.exports = html => { if (!html.includes(AVANT)) throw new Error('essai-hoquet : la ligne du ressort est introuvable'); return html.replace(AVANT, APRES); };
