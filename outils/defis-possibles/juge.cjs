/* LE JUGE DE CE QUI SE GAGNE ENCORE (2026-11-21, lot qa/defispossibles, Sacha : « faut que tu regardes tous les défis, notamment les missions […] le blanc de neige,
   il faut que tu le remettes payant parce qu'il n'y a plus de niveau sur les glaciers »). NODE SEUL, aucun Chrome.
   Il croise DEUX sources :
     · le RELEVÉ du vrai jeu (releve.cjs → releve-tel.json / releve-pc.json : dbgDefisPossibles, les tables telles que le jeu les a construites, et les maps / météos que JOUER tire) ;
     · le CODE (code/*.js) : pour chaque compteur qu'une condition lit, l'endroit où le jeu l'ÉCRIT, et les conditions de carte / météo qui l'entourent (le bloc `if(...)`
       englobant, les gardes `if(c!=='x')return` de la fonction, puis, en remontant, les appels de la fonction). Un compteur que plus rien n'écrit = impossible ;
       un compteur qui n'est écrit que sur une map hors du tirage = impossible ICI.
   Puis il juge chaque objet : voiture (CAR_UNLOCK), mission (M2), peinture / aile / traînée / figure (COSM), et les collections « toutes » (atteignables seulement si
   chaque objet du lot l'est). Sortie : un tableau texte, et `--json <fichier>` le détail. Code de sortie 1 s'il reste un IMPOSSIBLE affiché au joueur.
   node outils/defis-possibles/juge.cjs <releve-tel.json> [<releve-pc.json>] [--json sortie.json] [--md tableau.md] */
'use strict';
const fs = require('fs'), path = require('path');
const RAC = path.resolve(__dirname, '..', '..', 'code');
const args = process.argv.slice(2), opt = {}, rel = [];
for (let i = 0; i < args.length; i++) { if (args[i].startsWith('--')) opt[args[i].slice(2)] = args[++i]; else rel.push(args[i]); }
if (!rel.length) { console.error('usage : juge.cjs releve-tel.json [releve-pc.json]'); process.exit(2); }

/* ---------- le code : tous les morceaux JS, avec leur nom ---------- */
const FICHIERS = [];
(function lit(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) lit(p); else if (/\.js$/.test(f) && !/defis-possibles\.js$/.test(f)) FICHIERS.push({ f: path.relative(RAC, p), t: fs.readFileSync(p, 'utf8') }); } })(RAC);

/* le bloc qui contient `pos` : les conditions `if(...)` qui le gardent, jusqu'à la fonction qui l'enferme */
function parenAvant(t, j) { /* t[j] === ')' : l'indice de sa '(' */ let d = 0; for (let i = j; i >= 0; i--) { if (t[i] === ')') d++; else if (t[i] === '(') { d--; if (!d) return i; } } return -1; }
function contexte(t, pos) {
  const conds = []; let fn = null, fnDeb = 0;
  /* la condition directe : `if(X)instruction` sans accolade, jusqu'au début de l'instruction */
  { let d = 0, i = pos - 1; for (; i >= 0; i--) { const ch = t[i]; if (ch === ')') d++; else if (ch === '(') d--; else if (d <= 0 && (ch === ';' || ch === '{' || ch === '}')) break; }
    const seg = t.slice(i + 1, pos); const re = /\bif\s*\(/g; let m; while ((m = re.exec(seg))) { const a = i + 1 + m.index + m[0].length - 1; let dd = 0, k = a; for (; k < t.length; k++) { if (t[k] === '(') dd++; else if (t[k] === ')') { dd--; if (!dd) break; } } conds.push(t.slice(a + 1, k)); } }
  /* les blocs englobants */
  let d = 0;
  for (let i = pos - 1; i >= 0; i--) {
    const ch = t[i];
    if (ch === '}') d++;
    else if (ch === '{') { if (d > 0) { d--; continue; }
      let j = i - 1; while (j >= 0 && /\s/.test(t[j])) j--;
      if (t[j] === ')') { const a = parenAvant(t, j), av = t.slice(Math.max(0, a - 40), a);
        const mf = /function\s+([A-Za-z0-9_$]+)\s*$/.exec(av) || /([A-Za-z0-9_$]+)\s*=\s*function\s*$/.exec(av);
        if (mf) { fn = mf[1]; fnDeb = i; break; }
        if (/\bfunction\s*$/.test(av)) { fn = null; fnDeb = i; break; }
        if (/\bif\s*$/.test(av)) conds.push(t.slice(a + 1, j));
        else if (/\b(for|while)\s*$/.test(av)) { /* une boucle : rien à garder */ } }
      else if (/\belse\s*$/.test(t.slice(Math.max(0, j - 5), j + 1))) { /* un else : la condition inverse (ignorée : prudence, on ne garde rien) */ } }
  }
  /* les gardes de la fonction avant `pos` : if(X!=='carte')return */
  const corps = t.slice(fnDeb, pos), gardes = [];
  { const re = /if\s*\(\s*(?:secCarte\(\)\.c|k9?\.c|k|c)\s*!==\s*'(\w+)'\s*\)\s*return/g; let m; while ((m = re.exec(corps))) gardes.push(m[1]); }
  return { conds, fn, gardes };
}
/* les cartes et météos que demandent des conditions */
function exigences(conds, gardes) {
  const C = new Set(gardes), M = new Set();
  for (const c of conds) {
    /* une disjonction de cartes (c==='ville'||c==='crypto') : toutes y entrent ; une conjonction aussi (on n'a besoin que d'UNE carte tirable parmi elles pour une disjonction,
       et une conjonction carte && autre chose ne change pas la carte) */
    let m; const rc = /(?:secCarte\(\)\.c|\bk9?\.c|\bk|\bc|carte)\s*===\s*'(\w+)'/g; while ((m = rc.exec(c))) C.add(m[1]);
    const rm = /(?:\bk9?\.m|\bm|meteo)\s*===\s*'(\w+)'/g; while ((m = rm.exec(c))) M.add(m[1]);
  }
  return { c: [...C], m: [...M] };
}
/* où un motif est ÉCRIT : chaque occurrence → ses exigences ; une fonction sans exigence propre hérite de celles de ses appels */
function ecritures(re, filtre) {
  const L = [];
  for (const F of FICHIERS) { if (filtre && !filtre.test(F.f)) continue; const r = new RegExp(re.source, 'g'); let m;
    while ((m = r.exec(F.t))) { const cx = contexte(F.t, m.index); L.push({ f: F.f, ligne: F.t.slice(0, m.index).split('\n').length, fn: cx.fn, ex: exigences(cx.conds, cx.gardes) }); } }
  return L;
}
const APPELS = {};
function appelsDe(fn, prof) { /* les exigences de chaque appel de `fn` (récursif, 3 niveaux) */
  if (!fn || prof > 3) return [{ c: [], m: [] }];
  const k = fn + '|' + prof; if (APPELS[k]) return APPELS[k];
  const L = [], re = new RegExp('(?<![A-Za-z0-9_$.]|function\\s)' + fn.replace(/\$/g, '\\$') + '\\s*\\(', 'g');
  for (const F of FICHIERS) { let m; while ((m = re.exec(F.t))) { if (/function\s*$/.test(F.t.slice(Math.max(0, m.index - 12), m.index))) continue;
    const cx = contexte(F.t, m.index), ex = exigences(cx.conds, cx.gardes);
    if (ex.c.length || ex.m.length) L.push(ex); else for (const e of appelsDe(cx.fn, prof + 1)) L.push(e); } }
  return (APPELS[k] = L.length ? L : [{ c: [], m: [] }]);
}
/* les exigences effectives d'une écriture : les siennes, sinon celles de ses appels */
function sourcesDe(re, filtre) {
  const W = ecritures(re, filtre); if (!W.length) return null; const S = [];
  for (const w of W) { if (w.ex.c.length || w.ex.m.length) S.push(Object.assign({ ou: w.f + ':' + w.ligne }, w.ex)); else for (const e of appelsDe(w.fn, 0)) S.push(Object.assign({ ou: w.f + ':' + w.ligne + (w.fn ? ' (' + w.fn + ')' : '') }, e)); }
  return S;
}

/* ---------- LES COMPTEURS : ce que chaque mesure lit, et où le jeu l'écrit ----------
   La seule partie écrite à la main : le NOM de la variable que lit chaque mesure (missions/defis-moteur.js, m2Val ; economie/boutique-vitrine.js, peintDefVal).
   Le juge vérifie que chaque écriture existe dans le code ; les exigences de carte / météo, il les LIT dans le code. */
const ECRIT = {
  fig: /\br\.fig=/, airP: /\br\.airP=/, parf: /\br\.parf=/, frenT: /\br\.frenT=|frenRec=/, kmh: /\br\.kmh=|\bex\.kmh=/, vie: /\br\.vie=/, tours: /\br\.tours=/,
  cartesP: /cartesP\.push\(/, cartes: /c\.cartes\.push\(/, aura: /auraMax=/, gagne: /c\.gagne=/, eng: /\bex\.eng=/, morts: /c\.morts=/, jours: /c\.jours=/,
  vol: /\br\.vol=/, lac: /\br\.lac=/, rejoue: /\br\.rejoue=/, prof: /\br\.prof=/, pu: /\bc\.pu=/, nitS: /c\.nitS=/, nmaxS: /c\.nmaxS=/, figs: /c\.figs=/, airS: /c\.airS=/,
  verglasKm: /c\.verglasKm=/, kmTot: /c\.kmTot=/, meteoMap: /\bL\.push\(k9\.m\)/, musP10: /\bL\.push\(E\.id\)/, misok: /\bs\.ok\.push\(/, nuagesPasse: /S\.nuages_passes=/, installJ: /\bne:\s*Date\.now\(\)|prof\.ne\b|ne:Date\.now\(\)/,
  frenN: /r\.frenN=/ };
const COLS = ['cars', 'carsT', 'peint', 'peintT', 'trainee', 'traineeT', 'aile', 'aileT', 'figure', 'figureT', 'toutT', 'raresT'];
/* un compteur `sc:<k>` (m2Cpt) : écrit par m2Cpt('<k>' …), ou par une table de m2Pu / m2Fruit (['<k>','<peinture>']) */
function ecritSc(k) { return new RegExp("m2Cpt\\('" + k + "'|const T=\\{[^}]*\\['" + k + "','[a-zA-Z]+'\\]|S\\." + k + "="); }
/* les DRAPEAUX (m2Flag) et les EXPLOITS d'un coup (secGagne) : leur appel ; LA LAVE : la cause de mort 'lave' doit sortir d'un heurt de map (grotteHeurt) */
const PROVENANCE = { lave: { re: /o\.k==='lave'/, carte: 'grotte' } };

/* ---------- le relevé ---------- */
function juge(R) {
  const tir = {}, met = {}; for (const k in R.cartes) { const c = R.cartes[k]; if (c.hors) continue; tir[k] = 1; for (const x in c.m) if (c.m[x] !== 0) (met[x] || (met[x] = [])).push(k); }
  const nbMaps = new Set(Object.keys(tir).map(k => R.cartes[k].map)).size;
  /* une liste d'exigences est satisfaite si UNE écriture l'est : sa carte (une parmi c) au tirage, et une de ses météos sur une carte tirée (la même, si les deux sont dites) */
  const ok1 = e => { const C = e.c.length ? e.c.filter(c => tir[c]) : Object.keys(tir); if (!C.length) return false; if (!e.m.length) return true; return e.m.some(x => (met[x] || []).some(c => C.indexOf(c) >= 0)); };
  const atteint = S => S && S.some(ok1);
  const pourquoi = S => !S ? 'rien ne l\'écrit dans le code' : 'écrit seulement sur ' + [...new Set(S.map(e => (e.c.join('|') || '*') + (e.m.length ? '/' + e.m.join('|') : '')))].join(', ') + ' (hors du tirage ici)';
  const SC = {}, scDe = k => SC[k] || (SC[k] = sourcesDe(ecritSc(k)));
  const MES = {}, mesDe = k => MES[k] || (MES[k] = ECRIT[k] ? sourcesDe(ECRIT[k]) : undefined);
  const flagDe = id => { const S = sourcesDe(new RegExp("m2Flag\\('" + id + "'\\)")); if (!S) return null; const P = PROVENANCE[id]; if (!P) return S;
    const ok = FICHIERS.some(F => P.re.test(F.t)); return ok ? S.map(e => Object.assign({}, e, { c: e.c.length ? e.c : [P.carte] })) : null; };
  const secDe = id => sourcesDe(new RegExp("secGagne\\('" + id + "'\\)"));
  const L = [];
  const mission = id => R.missions.find(m => m.id === id);
  /* UNE MESURE (mission ou défi de peinture) : {ok, raison} */
  function mesure(k, m) {
    if (k === 'flag') { const S = flagDe(m.id); return { ok: atteint(S), raison: atteint(S) ? '' : pourquoi(S) }; }
    if (COLS.indexOf(k) >= 0) return collection(k, m);
    if (k === 'meteoMap' || k === 'cartes' || k === 'cartesP') { const S = mesDe(k); const base = atteint(S); return { ok: base && m.seuil > 0 && m.seuil < 99, raison: base ? (m.seuil > 0 ? '' : 'seuil nul') : pourquoi(S) }; }
    if (k === 'musP10') { const S = mesDe(k); return { ok: atteint(S), raison: atteint(S) ? '(la liste des morceaux se charge à la 1re course : seuil = nombre de morceaux, indépendant des maps)' : pourquoi(S) }; }
    const S = mesDe(k); if (S === undefined) return { ok: false, raison: 'mesure inconnue du juge : ' + k };
    return { ok: atteint(S), raison: atteint(S) ? '' : pourquoi(S) };
  }
  /* LES DÉFIS DES PEINTURES (peintDefVal / secGagne / la série) */
  function defi(d, f, cat) {
    if (!f) return { ok: true };
    if (f.k === 'serie') return { ok: true, raison: '7 jours de suite' };
    if (f.k === 'b') { const S = secDe(d.id); if (d.id === 'cameleon') return { ok: atteint(S) && nbMaps >= 4, raison: nbMaps >= 4 ? nbMaps + ' maps au tirage' : 'moins de 4 maps au tirage' }; return { ok: atteint(S), raison: atteint(S) ? '' : pourquoi(S) }; }
    if (f.k.indexOf('sc:') === 0) { const S = scDe(f.k.slice(3)); return { ok: atteint(S), raison: atteint(S) ? '' : pourquoi(S) }; }
    const k = { gagne: 'gagne', jours: 'jours', kmh: 'kmh', frenT: 'frenT', tours: 'tours', fig: 'fig', parf: 'parf', prof: 'prof', eng: 'eng', aura: 'aura' }[f.k];
    if (!k) return { ok: false, raison: 'défi inconnu du juge : ' + f.k };
    return mesure(k, { id: d.id });
  }
  const HAB = {};
  function hab(cat, d) {
    const k = cat + ':' + d.id; if (HAB[k]) return HAB[k];
    let r;
    if (d.def) { const j = defi(d, d.def, cat); r = { voie: 'défi', cond: d.def.t || d.def.k, ok: j.ok, raison: j.raison }; }
    else if (d.mis2) { const m = mission(d.mis2); const j = m ? missionJ(m) : { ok: false, raison: 'mission absente' }; r = { voie: 'mission', cond: d.mis2, ok: j.ok, raison: j.raison }; }
    else if (d.pack === 'chat') { r = { voie: 'pack', cond: 'avec le CHAT POP-TART', ok: true, raison: 'vient avec la caisse du chat (hors vente depuis le 13/11 : seulement pour qui l\'a)' }; }
    else if (d.eur) r = { voie: 'euros', cond: d.eur, ok: true };
    else if (d.p) r = { voie: 'dollars', cond: d.p + ' $', ok: true };
    else r = { voie: 'offerte', cond: '', ok: true };
    return (HAB[k] = r);
  }
  /* LES COLLECTIONS : n (tout compte) ou T (le lot « toutes », hors objets de mission, hors € non possédés) */
  function lot(cat) { /* le lot « toutes » d'une sauvegarde neuve (m2Col) */
    if (cat === 'voiture') return R.voitures.filter(v => !v.retire && !R.missions.some(m => m.r && m.r.car === v.n) && !(v.u && (v.u.k === 'premium' || v.u.eur) && !v.u.p));
    const reco = {}; for (const m of R.missions) if (m.r && m.r.cat) reco[m.r.cat + ':' + m.r.id] = 1;
    return (R.hab[cat] || []).filter(d => !reco[cat + ':' + d.id] && !(cat === 'peinture' && (d.sec || d.serie || (d.def && d.def.k === 'serie'))) && (!d.eur || d.def) && d.pack !== 'chat');
  }
  function voitJ(v) { const u = v.u; if (!u) return { ok: true, voie: 'départ' }; if (u.p) return { ok: true, voie: 'dollars' };
    if (u.k === 'premium') return { ok: true, voie: 'euros' + (v.enVente ? '' : ' (hors vente)') };
    if (u.k === 'mis') { const m = mission(u.id); const j = m ? missionJ(m) : { ok: false, raison: 'mission absente' }; return { ok: j.ok, voie: 'mission ' + u.id, raison: j.raison }; }
    return { ok: false, voie: u.k, raison: 'voie inconnue du juge' }; }
  function collection(k, m) {
    const T = /T$/.test(k), cat = { cars: 'voiture', carsT: 'voiture', peint: 'peinture', peintT: 'peinture', trainee: 'trainee', traineeT: 'trainee', aile: 'aile', aileT: 'aile', figure: 'figure', figureT: 'figure' }[k];
    if (k === 'toutT') { const KO = []; for (const c of ['voiture', 'peinture', 'aile', 'trainee', 'figure']) for (const x of lot(c)) { const j = c === 'voiture' ? voitJ(x) : hab(c, x); if (!j.ok) KO.push(c + ':' + (x.id || x.n)); } return { ok: !KO.length, raison: KO.length ? 'objets impossibles dans le lot : ' + KO.join(', ') : '' }; }
    if (k === 'raresT') { const L = lot('voiture').filter(v => v.rar === 'rare'), KO = L.filter(v => !voitJ(v).ok).map(v => v.n); return { ok: !KO.length, raison: KO.join(', ') }; }
    if (!cat) return { ok: false, raison: 'collection inconnue : ' + k };
    if (T) { const KO = lot(cat).filter(x => !(cat === 'voiture' ? voitJ(x) : hab(cat, x)).ok).map(x => x.id || x.n); return { ok: !KO.length, raison: KO.length ? 'objets impossibles dans le lot : ' + KO.join(', ') : '' }; }
    const tous = cat === 'voiture' ? R.voitures.filter(v => !v.retire) : (R.hab[cat] || []); const n = tous.filter(x => (cat === 'voiture' ? voitJ(x) : hab(cat, x)).ok).length;
    return { ok: n >= m.seuil, raison: n + ' atteignables pour ' + m.seuil };
  }
  const MJ = {};
  function missionJ(m) { if (MJ[m.id]) return MJ[m.id]; MJ[m.id] = { ok: true, raison: '(en cours)' }; const j = mesure(m.k, m); return (MJ[m.id] = j); }
  /* ---- le tableau ---- */
  for (const v of R.voitures) { if (v.retire) continue; const j = voitJ(v); L.push({ type: 'voiture', id: v.i, n: v.n, cond: v.u ? JSON.stringify(v.u.k === 'mis' ? { mis: v.u.id } : v.u.p ? { p: v.u.p } : { k: v.u.k, eur: v.u.eur }) : 'départ', ok: j.ok, raison: j.raison || '', affiche: true }); }
  for (const m of R.missions) { const j = missionJ(m); L.push({ type: 'mission', id: m.id, n: m.t, cond: m.k + ' ≥ ' + m.seuil, ok: j.ok, raison: j.raison || '', affiche: m.dispo, horsListe: !m.dispo }); }
  for (const cat of ['peinture', 'aile', 'trainee', 'figure']) for (const d of R.hab[cat] || []) { const j = hab(cat, d); const x = { type: cat, id: d.id, n: d.n, cond: j.voie + (j.cond ? ' : ' + j.cond : ''), ok: j.ok, raison: j.raison || '', affiche: true, exDef: d.exDef ? d.exDef.t : '' };
    /* le jeu a mis la peinture à prix (exDef) : le juge, qui lit le code sans DEF_SOURCES, doit trouver son ancien défi impossible — sinon elle a été rendue payante à tort */
    if (d.exDef) { const k = defi(d, d.exDef, cat); x.exDefAtteignable = k.ok; if (k.ok) { x.ok = false; x.raison = 'mise à prix À TORT : son défi d\'avant est encore atteignable ici'; } }
    L.push(x); }
  return { L, tir: Object.keys(tir), nbMaps };
}

const SORTIES = [];
let ko = 0;
for (const f of rel) {
  const R = JSON.parse(fs.readFileSync(f, 'utf8')), J = juge(R), nom = path.basename(f).replace(/\.json$/, '');
  console.log('\n=== ' + nom + ' — maps au tirage : ' + J.tir.join(', ') + ' (' + J.nbMaps + ' maps) ; ' + J.L.length + ' objets jugés');
  const imp = J.L.filter(x => !x.ok), vus = imp.filter(x => x.affiche);
  for (const x of imp) console.log((x.affiche ? '  IMPOSSIBLE  ' : '  (hors liste) ') + x.type + ' ' + x.id + ' « ' + x.n + ' » — ' + x.cond + ' — ' + x.raison);
  const conv = J.L.filter(x => x.exDef); for (const x of conv) console.log('  payante     ' + x.type + ' ' + x.id + ' « ' + x.n + ' » — ' + x.cond + ' (défi d\'avant : ' + x.exDef + ')');
  console.log('  → ' + vus.length + ' impossible(s) affiché(s) au joueur, ' + (imp.length - vus.length) + ' hors liste');
  ko += vus.length; SORTIES.push({ releve: nom, tir: J.tir, objets: J.L });
}
if (opt.json) fs.writeFileSync(opt.json, JSON.stringify(SORTIES, null, 1));
console.log(ko ? '\nJUGE KO' : '\nJUGE OK'); process.exit(ko ? 1 : 0);
