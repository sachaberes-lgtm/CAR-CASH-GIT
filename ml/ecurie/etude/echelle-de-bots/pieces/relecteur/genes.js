/* ===== LE RELECTEUR DES PIECES, 2 : les genes et les greffes des leviers (2026-11-28, etude « echelle de bots », pieces) =====
   Lecture seule. Pour chaque gene cite par le concepteur des leviers : existe-t-il dans ml/evolution/genome.js (BORNES), avec quelles bornes,
   quel type, quelle valeur a la naissance ; et les greffes proposees passent-elles lireGreffes (ml/evolution/greffes.js) ?
   Refaire : node ml/ecurie/etude/echelle-de-bots/pieces/relecteur/genes.js  -> sortie-genes.txt */
const fs=require('fs'),path=require('path');
const RAC=path.join(__dirname,'..','..','..','..','..','..');
const Gn=require(path.join(RAC,'ml','evolution','genome.js')),Gr=require(path.join(RAC,'ml','evolution','greffes.js'));
const T={};for(const b of Gn.BORNES)T[b.cle]=b;
const out=[];out.push('# Les genes des leviers (genome v'+Gn.VERSION+', '+Gn.BORNES.length+' entrees dans BORNES)');
out.push('| gene | existe | type | bornes | naissance | fige | greffable (drapeau, choix, entier) |');out.push('|---|---|---|---|---|---|---|');
const L=['marge','margeCouloir','piecesLoin','avance','glisse','braqueDoux','braqueFort','ligneLoin','bandeDecor','capMax','jaugeAllume','jaugeCoupe','braqueNitro','nitroDecor',
 'figMax','figHaut','figTemps','figJauge','figEcart','figDepuis','raccCartes_grotte','raccJumeau_grotte','raccCartes_canyon','raccJumeau_canyon','raccCartes_jade','raccJumeau_jade','raccCartes_ville','fileOn','fileVue'];
for(const k of L){const b=T[k];out.push(b?`| ${k} | oui | ${b.type} | ${b.min} – ${b.max} | ${b.naissance} | ${b.fige?'oui':'non'} | ${Gr.TYPES_PERMIS.has(b.type)&&!b.fige?'oui':'non'} |`:`| ${k} | **NON** | - | - | - | - | - |`);}
out.push('\n# Les greffes proposees, passees a lireGreffes');
const P=[{"raccCartes_grotte":1,"raccJumeau_grotte":1},{"raccCartes_canyon":1,"raccJumeau_canyon":1},{"raccCartes_jade":1},{"figMax":3},{"marge":5},{"capMax":0.6}];
for(const E of P){let r;try{Gr.lireGreffes({greffes:[E]});r='ACCEPTEE';}catch(e){r='REFUSEE : '+e.message;}out.push('- '+JSON.stringify(E)+' -> '+r);}
fs.writeFileSync(path.join(__dirname,'sortie-genes.txt'),out.join('\n')+'\n');console.log(out.join('\n'));
/* ---------- les bras proposes au banc v2 : survivent-ils a reparer et valider (ce que fait ml/evolution/banc/bras.js, poser) ? ---------- */
{const cfg=JSON.parse(fs.readFileSync(path.join(RAC,'ml','evolution','config.json'),'utf8'));
 const BR={'vise-large':{marge:5},'nitro-pose':{capMax:.6,jaugeAllume:.25,jaugeCoupe:.1},'racc-fermes':{raccCartes_grotte:1,raccJumeau_grotte:1,raccCartes_canyon:1,raccJumeau_canyon:1,raccCartes_jade:1}};
 const o2=['\n# Les bras proposes, poses sur le temoin puis repares (genome.js reparer, valider)'];
 for(const [n,E] of Object.entries(BR)){try{const g=Gn.genomeTemoin(cfg);for(const k in E)g.A[k]=E[k];Gn.reparer(g,cfg);const bad=Object.keys(E).filter(k=>Math.abs(g.A[k]-E[k])>1e-9).map(k=>k+' rendu '+g.A[k]);const d=Gn.valider(g,cfg);
   o2.push('- '+n+' '+JSON.stringify(E)+' -> '+(bad.length?'NE SURVIT PAS : '+bad.join(', '):'survit a reparer')+(d?' ; valider : '+d:' ; valide'));}catch(e){o2.push('- '+n+' -> erreur : '+e.message);}}
 fs.appendFileSync(path.join(__dirname,'sortie-genes.txt'),o2.join('\n')+'\n');console.log(o2.join('\n'));}
