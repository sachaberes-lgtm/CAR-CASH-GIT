// ÉTAPE 1 des traînées en cubes (2026-10-20) — applique les remplacements EXACTS (chaque `ancien` doit être unique) sur index.html.
// Usage : node patch-etape1.cjs "<chemin index.html>"     (lit et écrit en binaire, via un fichier temporaire + rename)
// Rejouable sur un `main` à jour : si une ancre a bougé, le script s'arrête AVANT d'écrire quoi que ce soit.
const fs = require('fs'), path = require('path');
const F = process.argv[2];
let s = fs.readFileSync(F).toString('utf8');
const R = [];
const sub = (ancien, nouveau, nom) => R.push({ ancien, nouveau, nom });

// 1) la particule porte un genre de cube (0 = le quad d'avant)
sub("TRX.P.push({v:false,L:0,md:0,x:0,", "TRX.P.push({v:false,L:0,md:0,cu:0,x:0,", 'struct particule');
sub("p.cw=0;p.sb=0;return p;}return null;}", "p.cw=0;p.sb=0;p.cu=0;return p;}return null;}", 'trxNait');
// 2) le bâtisseur construit aussi les piscines de cubes
sub("p:new Float32Array(33),q:new Float32Array(15)});\n  return TRX;}", "p:new Float32Array(33),q:new Float32Array(15)});\n  tcBati();\n  return TRX;}", 'trxBati');
// 3) trxParts : une particule de cubes se pose en cubes
sub("    const sz=1+(p.s1-1)*p.a/p.l;\n    if(p.md===1){", "    const sz=1+(p.s1-1)*p.a/p.l;\n    if(p.cu){tcPart(p,al,p.L?E1:E0);continue;}\n    if(p.md===1){", 'trxParts');
// 4) trxCoeur / trxCoupe / dbgTrx
sub("  T.L[0].n=T.L[1].n=0;\n  const E=TRX_EMET[type];", "  T.L[0].n=T.L[1].n=0;tcRaz();\n  const E=TRX_EMET[type];", 'trxCoeur raz');
sub("  T.n=np+T.L[0].n+T.L[1].n+nb+(T.gk>0?1:0);", "  tcFin();\n  T.n=np+T.L[0].n+T.L[1].n+nb+(T.gk>0?1:0);", 'trxCoeur fin');
sub("T.kp=0;T.n=0;for(const Y of T.L){Y.n=0;Y.g.instanceCount=0;Y.m.visible=false;}}", "T.kp=0;T.n=0;for(const Y of T.L){Y.n=0;Y.g.instanceCount=0;Y.m.visible=false;}tcCoupe();}", 'trxCoupe');
sub("quads:[TRX.L[0].n,TRX.L[1].n],chemin:", "quads:[TRX.L[0].n,TRX.L[1].n],cubes:TC?[TC.s.n,TC.o.n,TC.g.n]:null,chemin:", 'dbgTrx');
// 5) les émetteurs : sakura (corolle + pluie), billets (+ ses étincelles), foudre (frappe, éclairs, étincelles, tuyère)
sub("p.c=27+((Math.random()*3)|0);p.fi=.04;p.fo=.6;}}", "p.c=27+((Math.random()*3)|0);p.fi=.04;p.fo=.6;p.cu=TC_ON?1:0;}}", 'sakura corolle');
sub("p.c=27+((Math.random()*3)|0);p.fi=.12;p.fo=.6;}},", "p.c=27+((Math.random()*3)|0);p.fi=.12;p.fo=.6;p.cu=TC_ON?1:0;}},", 'sakura pluie');
sub("p.w=p.h=.3;p.c=30;p.c2=31;p.fo=.5;\n", "p.w=p.h=.3;p.c=30;p.c2=31;p.fo=.5;p.cu=TC_ON?2:0;\n", 'billets');
sub("s.cr=1.7;s.cg=1.55;s.cb=.7;s.fo=.2;s.tw=14+Math.random()*8;}}", "s.cr=1.7;s.cg=1.55;s.cb=.7;s.fo=.2;s.tw=14+Math.random()*8;s.cu=TC_ON?3:0;}}", 'billets étincelle');
sub("f.l=.24;f.w=f.h=C.pv?2.4:3.6;f.c=0;f.cr=1.3;f.cg=1.05;f.cb=2.6;f.fo=.2;}", "f.l=.24;f.w=f.h=C.pv?2.4:3.6;f.c=0;f.cr=1.3;f.cg=1.05;f.cb=2.6;f.fo=.2;f.cu=TC_ON?4:0;}", 'foudre éclair blanc');
sub("p.c=2;p.vr=(Math.random()-.5)*12;p.cr=1.5;p.cg=1.3;p.cb=2.4;p.fo=.15;}}", "p.c=2;p.vr=(Math.random()-.5)*12;p.cr=1.5;p.cg=1.3;p.cb=2.4;p.fo=.15;p.cu=TC_ON?3:0;}}", 'foudre gerbe');
sub("s.l=.22;s.w=s.h=.35;s.c=2;s.cr=1.2;s.cg=1;s.cb=2.4;s.fo=.15;s.vr=8;}}", "s.l=.22;s.w=s.h=.35;s.c=2;s.cr=1.2;s.cg=1;s.cb=2.4;s.fo=.15;s.vr=8;s.cu=TC_ON?3:0;}}", 'foudre étincelle');
sub("      trxQ(1,0,C.P.x,C.P.y,C.P.z,0,.55,.55,0,0,0,0,0,.7,.5,2,.6*k);}\n    const wb=", "      if(TC_ON)tcGlow(C.P.x,C.P.y,C.P.z,.9*k,.7,.5,1.6);else trxQ(1,0,C.P.x,C.P.y,C.P.z,0,.55,.55,0,0,0,0,0,.7,.5,2,.6*k);}\n    const wb=", 'foudre tuyère');
sub("trxBolt(B.p,B.n,f,(B.wk||1)*wb);trxBolt(B.q,B.bn,f*.8,.6*(B.wk||1)*wb);}},", "if(TC_ON){tcBolt(B.p,B.n,f,(B.wk||1)*wb);tcBolt(B.q,B.bn,f*.8,.6*(B.wk||1)*wb);}else{trxBolt(B.p,B.n,f,(B.wk||1)*wb);trxBolt(B.q,B.bn,f*.8,.6*(B.wk||1)*wb);}}},", 'foudre éclairs');

// 6) le moteur de cubes, posé juste avant LES DIX TRAÎNÉES
const MOTEUR = fs.readFileSync(path.join(__dirname, 'moteur-cubes.js'), 'utf8').replace(/\s+$/, '') + '\n';
sub("/* LES DIX TRAÎNÉES : (T, C, k, dt, on = nitro allumée, debut = elle vient de s'allumer).", MOTEUR + "/* LES DIX TRAÎNÉES : (T, C, k, dt, on = nitro allumée, debut = elle vient de s'allumer).", 'moteur de cubes');

for (const r of R) {
  const n = s.split(r.ancien).length - 1;
  if (n !== 1) { console.error('ÉCHEC (' + n + ' occurrences) :', r.nom); process.exit(1); }
}
for (const r of R) { const i = s.indexOf(r.ancien); s = s.slice(0, i) + r.nouveau + s.slice(i + r.ancien.length); console.log('ok', r.nom); }
const tmp = F + '.tmp-patch'; fs.writeFileSync(tmp, Buffer.from(s, 'utf8')); fs.renameSync(tmp, F);
console.log('écrit', F, s.length, 'caractères');
