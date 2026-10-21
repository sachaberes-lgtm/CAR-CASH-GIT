// ÉTAPE 3 des traînées en cubes (2026-10-21) — modifie les MORCEAUX de code/ (jamais index.html : `node code/assembler.cjs --depuis-morceaux` après).
// Chaque `ancien` doit être unique, sinon le script s'arrête avant d'écrire. À rejouer UNE fois (il ne reconnaît pas son propre travail).
const fs = require('fs'), path = require('path');
const RACINE = path.resolve(__dirname, '..', '..', 'code');
const lots = {};
function sub(fichier, ancien, nouveau, nom) { (lots[fichier] = lots[fichier] || []).push({ ancien, nouveau, nom }); }

// ---- trainees-1.js : le cycle de vie des cubes (une image = un reset, au premier qui émet) et les rubans
sub('rendu/trainees-1.js',
"function tcBati(){if(!TC)TC={s:tcPool(3000,'s'),o:tcPool(600,'o'),g:tcPool(1400,'g',.2)};return TC;}\nfunction tcRaz(){if(TC){TC.s.n=TC.o.n=TC.g.n=0;tcCam();}}",
"function tcBati(){if(!TC)TC={s:tcPool(3600,'s'),o:tcPool(600,'o'),g:tcPool(2000,'g',.2),fr:-9};return TC;}\n" +
"var TC_FR=0; /* (2026-10-21) le numéro de l'IMAGE, incrémenté en tête de `loop` : les piscines de cubes se vident UNE fois par image, au premier qui émet (les rubans, les traînées POP) — et `tcFin` les envoie à la carte juste avant le rendu */\n" +
"function tcOn(){const T=tcBati();if(T.fr!==TC_FR){T.fr=TC_FR;T.s.n=T.o.n=T.g.n=0;tcCam();}return T;}\n" +
"function tcRaz(){tcOn();}",
'pools et cycle');
sub('rendu/trainees-1.js',
"function tcFin(){if(!TC)return;for(const Y of [TC.s,TC.o,TC.g]){const n=Y.n;",
"function tcFin(){if(!TC)return;if(!paused&&TC.fr<TC_FR-2){tcCoupe();return;} /* plus personne n'émet (menu, fin de partie) : tout s'éteint ; en PAUSE tout reste, figé */ for(const Y of [TC.s,TC.o,TC.g]){const n=Y.n;",
'tcFin');

const RUB = String.raw`
/* ============================================================================
   ÉTAPE 3 (2026-10-21, Sacha : « tout les étapes maintenant ») — LES RUBANS DE LUMIÈRE EN CUBES.
   Le sillage de chaque caisse (les feux arrière, les pots, MENTHE / ROSE / OR, le nitro) était un ruban lisse : un halo et un cœur en gaussiennes. Il est
   refait de la même matière que le feu du nitro et l'arc-en-ciel : une CHAÎNE DE CUBES posée sur la courbe (la même, SIL_Q), un cube plein au cœur et, derrière,
   un cube de lueur plus gros qui s'additionne. silRuban garde TOUT son calcul (coupes, fondus, largeurs, refroidissement des couleurs, pouls, tête chauffée) : la
   rangée n'écrit plus deux sommets, elle appelle tcRubRow. Le maillage lisse existe toujours (les lumières de la route lisent son état) mais ne se dessine plus.
     · un cube tous les ~95 % de sa largeur, interpolé entre deux rangées : la chaîne est continue à toute vitesse ;
     · la TAILLE fond par crans avec l'âge (1 · ,95 · ,84 · ,7 · ,55 · ,38, comme la porte), et la queue s'ÉMIETTE : des cubes manquent, de plus en plus ;
     · la lueur est un cube de lueur (TC.g) ; la tête chauffée à blanc ajoute son blanc à la couleur du cube ;
     · en salle blanche (la boutique), la teinte pure, franche, sans lueur — le blanc ne porte pas la lumière.
   ?ruban=lisse rend les rubans lisses d'avant. */`;
const RUB2 = String.raw`
const TC_RUB=TC_ON&&!/[?&]ruban=lisse\b/.test(location.search),TC_RLONG=60,TC_RMAX=240,TC_AGE=[1,.95,.84,.7,.55,.38],TC_AGES=[.1,.3,.5,.66,.82];
const TC_RB={has:false,next:0,pa:0,n:0,px:0,py:0,pz:0,fC:0,fG:0,wc:0,wg:0,qr:0,qg:0,qb:0,ht:0}; // l'état du ruban en cours (la rangée d'avant)
function tcRubCube(x,y,z,fC,fG,wc,wg,qr,qg,qb,ht,hk,ck,arc,LG,ink,i){
  const T=TC,ag=arc/LG,ai=ag<TC_AGES[0]?0:ag<TC_AGES[1]?1:ag<TC_AGES[2]?2:ag<TC_AGES[3]?3:ag<TC_AGES[4]?4:5,fs=fC>.7?1:fC>.45?.84:fC>.25?.68:fC>.1?.5:0;
  if(!fs)return;
  if(ai>=3){const h=(Math.imul(i+1,2654435761)^Math.imul(TC_FR>>2,40503))>>>0;if(h%100<(ai-2)*15)return;} // la queue s'ÉMIETTE : des cubes manquent, de plus en plus
  const s=Math.max(.05,2*wc)*TC_AGE[ai]*fs,gq=s*.5;x=Math.round(x/gq)*gq;y=Math.round(y/gq)*gq;z=Math.round(z/gq)*gq;
  if(ink){const m=Math.max(qr,qg,qb,1e-4)*1.15;tcBox(T.s,x,y,z,s,s,s,qr/m,qg/m,qb/m);return;}
  tcBox(T.s,x,y,z,s,s,s,qr*ck*.8+ht,qg*ck*.8+ht,qb*ck*.8+ht);
  const fg=fG>.55?1:fG>.3?.8:fG>.12?.6:0;if(fg){const gs=Math.max(.1,2*wg)*fg;tcBox(T.g,x,y,z,gs,gs,gs,qr*hk*2,qg*hk*2,qb*hk*2);}}
function tcRubRow(r,x,y,z,fC,fG,wc,wg,qr,qg,qb,ht,hk,ck,arc,LG,ink){ // une rangée du ruban : des cubes depuis la rangée d'avant jusqu'à celle-ci
  const B=TC_RB;if(r===0){B.has=false;B.n=0;}
  if(arc>TC_RLONG||B.n>=TC_RMAX)return;
  if(!B.has){B.has=true;B.next=arc;B.pa=arc;B.px=x;B.py=y;B.pz=z;B.fC=fC;B.fG=fG;B.wc=wc;B.wg=wg;B.qr=qr;B.qg=qg;B.qb=qb;B.ht=ht;}
  const da=arc-B.pa;
  while(B.next<=arc&&B.n<TC_RMAX){const t=da>1e-6?Math.min(1,Math.max(0,(B.next-B.pa)/da)):1,u=1-t,w=wc*t+B.wc*u;
    tcRubCube(x*t+B.px*u,y*t+B.py*u,z*t+B.pz*u,fC*t+B.fC*u,fG*t+B.fG*u,w,wg*t+B.wg*u,qr*t+B.qr*u,qg*t+B.qg*u,qb*t+B.qb*u,ht*t+B.ht*u,hk,ck,B.next,LG,ink,B.n);
    B.n++;B.next+=Math.max(.12,(wc+B.wc)*.95);}
  B.pa=arc;B.px=x;B.py=y;B.pz=z;B.fC=fC;B.fG=fG;B.wc=wc;B.wg=wg;B.qr=qr;B.qg=qg;B.qb=qb;B.ht=ht;}
function tcTrailCubes(P,C,n){ // un ruban simple (la meute, le fantôme) : un cube par point de l'historique, de sa couleur, large comme le ruban
  if(!TC_RUB)return;const T=tcOn();
  for(let i=0;i<n;i++){const o=i*6,r=C[o],g=C[o+1],b=C[o+2],m=Math.max(r,g,b);if(m<.12)continue;
    const s=Math.max(.06,Math.hypot(P[o]-P[o+3],P[o+1]-P[o+4],P[o+2]-P[o+5])*1.3),f=m>.8?1:m>.45?.8:.6,gq=s*.5,x=Math.round((P[o]+P[o+3])*.5/gq)*gq,y=Math.round((P[o+1]+P[o+4])*.5/gq)*gq,z=Math.round((P[o+2]+P[o+5])*.5/gq)*gq;
    tcBox(T.s,x,y,z,s*f,s*f,s*f,r*1.1,g*1.1,b*1.1);tcBox(T.g,x,y,z,s*2.6,s*2.6,s*2.6,r*1.8,g*1.8,b*1.8);}}
`;
sub('rendu/trainees-1.js',
"  else tcSpr(TC_DEF.pix,px,py,pz,w*.7,h*.7,f,r,g,b,S);}\n",
"  else tcSpr(TC_DEF.pix,px,py,pz,w*.7,h*.7,f,r,g,b,S);}\n" + RUB + RUB2,
'rubans (moteur)');

// ---- trainees-2.js : trxCoeur ne vide plus tout seul, et ne téléverse plus (c'est tcFin, avant le rendu)
sub('rendu/trainees-2.js', "  T.L[0].n=T.L[1].n=0;tcRaz();\n", "  T.L[0].n=T.L[1].n=0;tcOn();\n", 'trxCoeur on');
sub('rendu/trainees-2.js', "  tcFin();\n  T.n=np+", "  T.n=np+", 'trxCoeur sans tcFin');

// ---- la boucle : le numéro d'image et le téléversement
sub('moteur/boucle-1.js', "function loop(now){\n  requestAnimationFrame(loop);\n", "function loop(now){\n  requestAnimationFrame(loop);TC_FR++; // (2026-10-21) le numéro d'IMAGE des cubes des traînées (voir tcOn)\n", 'loop');
sub('moteur/boucle-6-hud.js', "  if(mortS9){}else\n  if(PCV.fen&&PORTV.att", "  try{tcFin();}catch(e){window.__tcErr=e;} // (2026-10-21) les cubes des traînées partent à la carte, juste avant le rendu\n  if(mortS9){}else\n  if(PCV.fen&&PORTV.att", 'tcFin dans la boucle');

// ---- silRuban : les rangées appellent tcRubRow
sub('voitures/atchoum-feu.js', "  const Q=SIL_Q;silEncre(tr.m,SIL_ENCRE);\n", "  const Q=SIL_Q,TCR=TC_RUB;silEncre(tr.m,SIL_ENCRE);if(TCR)tcOn(); // (2026-10-21) LES RUBANS EN CUBES (voir tcRubRow)\n", 'silRuban début');
sub('voitures/atchoum-feu.js',
"    let f=Q[o+3]*tr.g*(1-.22*al)*SM(arc,0,.35)*(mode==='fall'?SM(sA,SIL.axeV*.25,SIL.axeV):SM(sA,.05,.22))*(1-SM(arc,LG-QU,LG));",
"    let f9=Q[o+3]*tr.g*(1-.22*al)*SM(arc,0,.35)*(1-SM(arc,LG-QU,LG)),f=f9*(mode==='fall'?SM(sA,SIL.axeV*.25,SIL.axeV):SM(sA,.05,.22)); /* f9 : la même visibilité SANS l'angle de vue — un cube se voit de bout, une nappe non */",
'f9');
sub('voitures/atchoum-feu.js', "    if(fin)f=0;\n", "    if(fin){f=0;f9=0;}\n", 'fin f9');
sub('voitures/atchoum-feu.js', "const fK=1-SM(d,cutA*.5,cutK);if(!fin)f*=1-SM(d,cutA,cut);", "const fK=1-SM(d,cutA*.5,cutK);if(!fin){const q9=1-SM(d,cutA,cut);f*=q9;f9*=q9;}", 'coupe f9');
sub('voitures/atchoum-feu.js', "    if(fin){Rf=r+1;break;}\n  }\n  tr.m.geometry.setDrawRange(0,Math.max(0,Rf-1)*12);tr.m.visible=Rf>1;",
"    if(TCR&&!fin)tcRubRow(r,x,y,z,f9*fK*SM(dC,1.4,2.7),f9*SM(dC,1.9,3.8),wc,wg,qr,qg,qb,hot,hk,ck,arc,LG,SIL_ENCRE);\n    if(fin){Rf=r+1;break;}\n  }\n  tr.m.geometry.setDrawRange(0,Math.max(0,Rf-1)*12);tr.m.visible=Rf>1;tr.m.material.visible=!TCR; // le ruban lisse n'est plus dessiné (son état, lui, sert encore aux lumières de la route)",
'rangée');
sub('voitures/atchoum-feu.js', "  tr.mi.visible=dk>0&&Rf>1;", "  tr.mi.visible=!TCR&&dk>0&&Rf>1;", 'voile de jour');
sub('voitures/atchoum-feu.js', "  tr.clk+=dt||0;\n  if(!tr.init){tr.n=0;tr.emit=false;", "  tr.clk+=dt||0;if(TC_RUB)tcOn();\n  if(!tr.init){tr.n=0;tr.emit=false;", 'sillageStep on');

// ---- l'aperçu de l'atelier
sub('interface/habillages-accueil.js', "function silApercu(dt,on,k9){\n  const S=SILPV;\n", "function silApercu(dt,on,k9){\n  const S=SILPV;if(TC_RUB)tcOn();\n", 'silApercu on');

// ---- WOW : du texte en pixels nets
sub('maps/orbite-2.js',
"x.font=F;const w=Math.ceil(x.measureText(m9).width)+28;cv.width=w;cv.height=96;x.font=F;x.textBaseline='middle';x.lineJoin='round';\n    x.lineWidth=9;x.strokeStyle='#1c0430';x.strokeText(m9,14,50);x.fillStyle=TEINTES[n%TEINTES.length];x.fillText(m9,14,50);\n    const tx=new THREE.CanvasTexture(cv);tx.minFilter=THREE.LinearFilter;tx.generateMipmaps=false;WOWT.tx.push({tx:tx,a:w/96});});",
"if(TC_ON){ /* (2026-10-21) LE TEXTE EN PIXELS : la police pixel à sa taille native (8 px), un liseré d'un pixel, et la texture agrandie SANS lissage — de vrais gros pixels */\n      const F8='8px \"Press Start 2P\",monospace';x.font=F8;const w8=Math.ceil(x.measureText(m9).width)+6;cv.width=w8;cv.height=18;x.font=F8;x.textBaseline='middle';x.fillStyle='#1c0430';\n      for(const d of [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[1,-1],[-1,1],[1,1]])x.fillText(m9,3+d[0],9+d[1]);x.fillStyle=TEINTES[n%TEINTES.length];x.fillText(m9,3,9);\n      const t8=new THREE.CanvasTexture(cv);t8.minFilter=t8.magFilter=THREE.NearestFilter;t8.generateMipmaps=false;WOWT.tx.push({tx:t8,a:w8/18});return;}\n    x.font=F;const w=Math.ceil(x.measureText(m9).width)+28;cv.width=w;cv.height=96;x.font=F;x.textBaseline='middle';x.lineJoin='round';\n    x.lineWidth=9;x.strokeStyle='#1c0430';x.strokeText(m9,14,50);x.fillStyle=TEINTES[n%TEINTES.length];x.fillText(m9,14,50);\n    const tx=new THREE.CanvasTexture(cv);tx.minFilter=THREE.LinearFilter;tx.generateMipmaps=false;WOWT.tx.push({tx:tx,a:w/96});});",
'WOW pixels');

// ---- trailStep (la meute, le fantôme) : le même ruban de cubes
sub('voitures/atchoum-feu.js',
"  tr.m.visible=true;\n  tr.m.geometry.attributes.position.needsUpdate=true;\n  tr.m.geometry.attributes.color.needsUpdate=true;\n}",
"  tr.m.visible=true;\n  tr.m.geometry.attributes.position.needsUpdate=true;\n  tr.m.geometry.attributes.color.needsUpdate=true;\n  if(TC_RUB){tr.m.material.visible=false;tcTrailCubes(P,C,TRAIL_N);}else tr.m.material.visible=true; /* (2026-10-21) la meute et le fantôme : le même ruban de cubes */\n}",
'trailStep');

// --- application
for (const f of Object.keys(lots)) {
  const F = path.join(RACINE, f); let s = fs.readFileSync(F, 'utf8');
  for (const r of lots[f]) { const n = s.split(r.ancien).length - 1; if (n !== 1) { console.error('ÉCHEC (' + n + ') :', f, r.nom); process.exit(1); } }
}
for (const f of Object.keys(lots)) {
  const F = path.join(RACINE, f); let s = fs.readFileSync(F, 'utf8');
  for (const r of lots[f]) { const i = s.indexOf(r.ancien); s = s.slice(0, i) + r.nouveau + s.slice(i + r.ancien.length); console.log('ok', f, r.nom); }
  fs.writeFileSync(F + '.tmp', s); fs.renameSync(F + '.tmp', F);
}
