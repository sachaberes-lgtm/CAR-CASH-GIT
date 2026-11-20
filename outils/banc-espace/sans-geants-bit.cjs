/* L'ESPACE SANS GÉANTS (2026-11-18) : empreinte des routes (ctrl, N, marques) — `node outils/banc-espace/sans-geants-bit.cjs <racine> "<search>" <cartes> [graines=1-40]` ; à comparer entre deux arbres */
const path=require('path'),crypto=require('crypto');const RAC=path.resolve(process.argv[2]);const S=process.argv[3]||'',C=(process.argv[4]||'espace').split(','),G=(process.argv[5]||'1-40').split('-').map(Number);
const B=require(path.join(RAC,'outils/banc-routes/charge.cjs')).creer(S);
for(const c of C){const h=crypto.createHash('sha1');for(const p of [0,10,20])for(let g=G[0];g<=G[1];g++){const r=B.piste(c,g,p);
  for(const q of r.ctrl)h.update(q.x+','+q.y+','+q.z+';');if(r.N)for(const q of r.N)h.update(q.x+','+q.y+','+q.z+';');h.update(JSON.stringify(r.marks0||r.marks||[]));}
  console.log(c,S||'(défaut)',h.digest('hex').slice(0,16));}
