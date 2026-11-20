/* LE BANC DU TRI DES VOITURES (2026-11-18, lot « tri des voitures », Sacha : « Supprime du jeu les voitures : cabossées, La fidèle, La scarabée […] la perle, la queue de canard ;
   le combi et la Dolores en secrètes ; l'Aigle de Feu payant à 1,61 € ; l'iceberg à la place de Nyan Cat, offre de l'hiver à 0,80 € au lieu de 1,61 € »). NODE SEUL, aucun Chrome.
   Il assemble, dans UNE fonction (comme l'IIFE du jeu, pour que les déclarations se voient d'un morceau à l'autre), les VRAIS morceaux de code/ qui décident :
     voitures/cars.js · voitures/deblocage.js · missions/table.js · economie/aura-banque-contrats.js · economie/boutique.js · economie/achats-store.js ·
     sauvegarde.js (SAVE.load et les migrations qui suivent, sur un localStorage fabriqué) · missions/defis-moteur.js · economie/boutique-du-jour.js
   Tout nom que ces morceaux lisent ailleurs dans le jeu (THREE, le DOM, les sons…) est remplacé par un « bouchon » inerte (un Proxy qui accepte tout).
   Vérifie :
     1. CARS et CAR_UNLOCK : même longueur qu'avant le lot (origin/qualite-appareil), même nom à chaque index (aucune ligne insérée ni ôtée) ;
     2. les cinq retirées sont `retire` et n'ont plus de gabarit (la mission ne peut pas les faire revenir) ; aucune retirée dans un tirage ou une vitrine
        (catalogue App Store, boutique du jour, garage `gAVendre`-like, machine à sous, missions qui donnent une caisse) ;
     3. des sauvegardes FABRIQUÉES (possédée, équipée, équipée + peinture/aile/traînée, mission en cours qui la cite, mission réussie non récupérée) : rien ne plante,
        la caisse sort de `owned`, l'équipée repart en LA HONTE, le remboursement est celui de la règle, les habillages restent, les quatre gardées restent ;
     4. les deux secrètes : LE COMBI à 9 / 10 / 11 niveaux des nuages passés (secPorte), LA DOLORÈS à 29 j 23 h / 30 j pile / 31 j, et l'horloge reculée après coup ;
     5. L'AIGLE DE FEU et L'ICEBERG en boutique (produit, prix, une, promo), le prix barré seulement à côté d'un prix en euros.
   node outils/banc-voitures-tri/banc.cjs [--base origin/qualite-appareil]     Sortie 0 = tout vert. Dernière ligne : BANC OK / BANC KO. */
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const RACINE = path.resolve(__dirname, '..', '..');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const BASE = A.base || 'origin/qualite-appareil';
const lit = f => fs.readFileSync(path.join(RACINE, 'code', f), 'utf8');
let ko = 0, ok = 0;
function verifie(cond, quoi, detail) { if (cond) { ok++; console.log('  ok  ' + quoi); } else { ko++; console.log('  KO  ' + quoi + (detail !== undefined ? ' — ' + JSON.stringify(detail) : '')); } }

/* ---------- le bouchon : un objet-fonction qui accepte tout et rend lui-même ---------- */
function bouchon() {
  const f = function () { return P; };
  const P = new Proxy(f, {
    get(t, k) { if (k === Symbol.toPrimitive) return () => 0; if (k === 'then') return undefined; if (k === 'length') return 0; return P; },
    set() { return true; }, apply() { return P; }, construct() { return P; }, has() { return false; }
  });
  return P;
}
const B = bouchon();
/* un objet vrai dont les champs absents sont des bouchons (PAL.B.x = …, PRF.on, window.dbgXxx = …) */
const souple = o => new Proxy(o, { get: (t, k) => (k in t ? t[k] : (typeof k === 'string' ? B : undefined)), set: (t, k, v) => { t[k] = v; return true; } });

/* les morceaux, dans l'ordre d'ORDRE.txt */
const MORCEAUX = ['voitures/cars.js', 'voitures/deblocage.js', 'missions/table.js', 'economie/aura-banque-contrats.js', 'economie/boutique.js',
  'economie/achats-store.js', 'sauvegarde.js', 'missions/defis-moteur.js', 'economie/boutique-du-jour.js'];
const ORDRE = lit('ORDRE.txt');
{ let der = -1; for (const m of MORCEAUX) { const k = ORDRE.indexOf('\n' + m); if (k < 0 || k < der) throw new Error('ORDRE.txt : ' + m + ' absent ou déplacé'); der = k; } }
const CORPS = MORCEAUX.map(lit).join('\n;\n');
const SORTIE = '\n;return {CARS,CAR_UNLOCK,M2,SAVE,carRetiree,carEnVente,carUnlockedVrai,carUnlocked,carRar,carOwned,carEuros,produitsStore,produitDe,prixTxt,prixBarreHtml,promoBandeau,promoDe,' +
  'bqValide,m2Etat,m2Val,m2Seuil,m2Verifie,m2Prend,m2Dispo,m2Pret,m2CarIdx,m2InstallJ,secPorte,voitTriMigre,carPrice,ACH_PRIX};';

/* un monde neuf : un localStorage fabriqué, une horloge réglable, un niveau en cours réglable */
function monde(save, opt) {
  opt = opt || {};
  const ls = {}; if (save !== undefined) ls.cashcarSave = typeof save === 'string' ? save : JSON.stringify(save);
  const H = { t: opt.t || Date.parse('2026-11-18T12:00:00Z') };
  const VraiDate = Date;
  class FausseDate extends VraiDate { constructor(...a) { if (a.length) super(...a); else super(H.t); } static now() { return H.t; } }
  const etat = { started: true, gameOver: false, carte: 'nuages' };
  const vrais = {
    location: { search: opt.search || '', reload() {} }, localStorage: ls, window: souple({ Capacitor: null }), document: B, navigator: { userAgent: 'banc' }, Date: FausseDate,
    performance: { now: () => H.t }, console: { warn: (...a) => { (opt.warn || []).push(a.map(String).join(' ')); }, log() {}, error: (...a) => { (opt.warn || []).push(a.map(String).join(' ')); } },
    TEL_NATIF: false, ALLEGE: false, PRF: souple({ on: false }), PAL: souple({ b: () => 0, B: souple({}) }), POSTE: souple({ auto: false }), SHAPES: {}, I18N: {}, LANG: 'fr', EN_APP: false,
    TR: x => x, eurTxt: x => x, sansAcc: x => String(x), insec: x => String(x), pxi: () => '', toast() {}, fmtC: x => '$ ' + x, fmtSolde: x => '$ ' + x,
    LVL: { get cur() { return { carte: etat.carte, meteo: 'midi' }; } },
    get started() { return etat.started; }, get gameOver() { return etat.gameOver; }, BALADE: false, SANDBOX: false, PARK: souple({ on: false }), TUTO: souple({ on: false }),
    ENGINE_TIERS: new Array(30).fill(0).map((_, i) => ({ i })), THREE: new Proxy({ MathUtils: { clamp: (v, a, b) => Math.min(b, Math.max(a, v)) } }, { get: (t, k) => (k in t ? t[k] : B) }),
    garageOn: false, SND: souple({ sfx: false, music: false }), FIG: souple({ liste: [] })
  };
  const P = new Proxy({}, {
    has(t, k) { if (typeof k !== 'string') return false; if (k in vrais) return true; return !(k in globalThis); },
    get(t, k) { if (k === Symbol.unscopables) return undefined; if (k in vrais) return vrais[k]; return B; },
    set(t, k, v) { vrais[k] = v; return true; }
  });
  const fab = new Function('P', 'with(P){return (function(){' + CORPS + SORTIE + '})();}');
  const J = fab(P);
  return { J, H, etat, ls };
}

/* ---------- 1. les index ---------- */
console.log('1. CARS / CAR_UNLOCK : longueur et index');
function tablesDe(srcCars, srcDeb) { return new Function(srcCars + '\n' + srcDeb + '\n;return {CARS,CAR_UNLOCK};')(); }
let base = null;
try { const g = f => cp.execFileSync('git', ['-C', RACINE, 'show', BASE + ':code/' + f], { encoding: 'utf8', maxBuffer: 64 << 20 }); base = tablesDe(g('voitures/cars.js'), g('voitures/deblocage.js')); }
catch (e) { console.log('  (base ' + BASE + ' illisible : ' + e.message.split('\n')[0] + ')'); }
const ici = tablesDe(lit('voitures/cars.js'), lit('voitures/deblocage.js'));
verifie(ici.CARS.length === 91 && ici.CAR_UNLOCK.length === 91, 'CARS et CAR_UNLOCK : 91 lignes chacune', [ici.CARS.length, ici.CAR_UNLOCK.length]);
if (base) {
  verifie(base.CARS.length === ici.CARS.length && base.CAR_UNLOCK.length === ici.CAR_UNLOCK.length, 'même longueur que ' + BASE, [base.CARS.length, base.CAR_UNLOCK.length]);
  const diff = []; for (let i = 0; i < base.CARS.length; i++) if (base.CARS[i].name !== ici.CARS[i].name) diff.push(i + ':' + base.CARS[i].name + '→' + ici.CARS[i].name);
  verifie(!diff.length, 'le même nom à chaque index (aucune ligne insérée ni ôtée)', diff);
  const reRet = []; for (let i = 0; i < base.CARS.length; i++) if (base.CARS[i].retire && !ici.CARS[i].retire) reRet.push(i + ':' + ici.CARS[i].name);
  verifie(!reRet.length, 'aucune retirée d\'avant ne revient', reRet);
}
const NOMS = { scarabee: 'LE SCARABÉE', combi: 'LE COMBI', dolores: 'LA DOLORÈS', canard: 'LA QUEUE DE CANARD', aigle: "L'AIGLE DE FEU", iceberg: "L'ICEBERG", perle: 'LA PERLE', cabossee: 'LA CABOSSÉE', fidele: 'LA FIDÈLE', honte: 'LA HONTE' };
const I = {}; for (const k in NOMS) I[k] = ici.CARS.findIndex(c => c.name === NOMS[k]);
console.log('  index lus dans CARS : ' + JSON.stringify(I));
verifie(I.scarabee === 6 && I.combi === 7 && I.dolores === 8 && I.canard === 45 && I.aigle === 52 && I.iceberg === 72 && I.perle === 78 && I.cabossee === 79 && I.fidele === 81, 'les index attendus (6, 7, 8, 45, 52, 72, 78, 79, 81)');
const RETIREES = ['scarabee', 'canard', 'perle', 'cabossee', 'fidele'], GARDEES = ['combi', 'dolores', 'aigle', 'iceberg'];
for (const k of RETIREES) { const c = ici.CARS[I[k]]; verifie(c.retire === 1 && !c.shape && Object.keys(c).length === 2, NOMS[k] + ' : {retire:1,name} seulement (sans gabarit, aucune mission ne la ramène)', c); }
for (const k of GARDEES) verifie(!ici.CARS[I[k]].retire, NOMS[k] + ' : toujours dans le jeu');

/* ---------- 2. le jeu chargé à neuf : tirages et vitrines ---------- */
console.log('2. aucune retirée dans un tirage ni une vitrine ; les nouvelles conditions');
const W0 = monde(undefined);
const J0 = W0.J;
const retI = new Set(RETIREES.map(k => I[k]));
verifie(J0.CARS.length === 91 && J0.CAR_UNLOCK.length === 91, 'après le patch des missions : toujours 91 lignes');
for (const k of RETIREES) verifie(J0.carRetiree(I[k]) && !J0.carEnVente(I[k]) && !J0.carPrice(I[k]) && !J0.carUnlockedVrai(I[k]), NOMS[k] + ' : retirée, ni en vente, ni à prix, ni ouverte');
const prod = J0.produitsStore();
verifie(!prod.some(p => p.type === 'car' && J0.carRetiree(p.cle)), 'catalogue App Store : aucune retirée', prod.filter(p => p.type === 'car').map(p => p.id));
const pA = prod.find(p => p.cle === I.aigle), pI = prod.find(p => p.cle === I.iceberg);
verifie(pA && pA.id === 'cashcar.car.e_aigle' && pA.eur === '1,61 €', "L'AIGLE DE FEU au catalogue : cashcar.car.e_aigle à 1,61 €", pA);
verifie(pI && pI.id === 'cashcar.car.iceberg' && pI.eur === '0,80 €', "L'ICEBERG au catalogue : cashcar.car.iceberg à 0,80 €", pI);
verifie(J0.carRar(I.aigle) === 'legendaire' && J0.carRar(I.iceberg) === 'legendaire', 'les deux payantes sont LÉGENDAIRES', [J0.carRar(I.aigle), J0.carRar(I.iceberg)]);
const unes = []; for (let i = 0; i < 91; i++) { const u = J0.CAR_UNLOCK[i]; if (u && u.une && u.k === 'premium' && J0.carEnVente(i)) unes.push(i); }
verifie(unes.length === 1 && unes[0] === I.iceberg, "l'offre à la une (la place du CHAT POP-TART) : L'ICEBERG seule", unes);
const bqV = []; for (let i = 0; i < 91; i++) if (J0.bqValide('v:' + i)) bqV.push(i);
verifie(!bqV.some(i => retI.has(i)), 'boutique du jour (bqValide) : aucune retirée', bqV.filter(i => retI.has(i)));
const aVendre = []; for (let i = 0; i < 91; i++) { const u = J0.CAR_UNLOCK[i]; if (J0.carEnVente(i) && u && (u.p > 0 || u.k === 'premium')) aVendre.push(i); }
verifie(!aVendre.some(i => retI.has(i)), 'garage, onglets BOUTIQUE / TOUS (carEnVente + prix) : aucune retirée');
const spin = []; for (let i = 0; i < 91; i++) { const u = J0.CAR_UNLOCK[i], c = J0.CARS[i]; if (c && J0.carRar(i) === 'epique' && !J0.carRetiree(i) && u && u.p && !u.k && !J0.carEuros(i)) spin.push(i); }
verifie(!spin.some(i => retI.has(i)), 'machine à sous (épiques à l\'argent du jeu) : aucune retirée');
const misCar = J0.M2.filter(m => m.r && m.r.car).map(m => ({ id: m.id, car: m.r.car, i: J0.m2CarIdx(m.r.car), dispo: J0.m2Dispo(m) }));
verifie(!misCar.some(x => x.dispo && retI.has(x.i)), 'aucune mission disponible ne donne une retirée', misCar.filter(x => retI.has(x.i)));
for (const id of ['fig5', 'parf10', 'rares', 'verglas100', 'km100k', 'lave']) { const m = J0.M2.find(x => x.id === id); verifie(m && m.r && m.r.cash > 0 && !m.r.car, 'mission ' + id + ' : de l\'argent (' + (m && m.r && m.r.cash) + ' $)'); }
const mN = J0.M2.find(m => m.id === 'nuages10'), mM = J0.M2.find(m => m.id === 'mois1');
verifie(mN && mN.f === 'secret' && mN.r.car === 'LE COMBI' && mN.v === 10, 'nuages10 : secrète, 10, LE COMBI');
verifie(mM && mM.f === 'secret' && mM.r.car === 'LA DOLORÈS' && mM.v === 30, 'mois1 : secrète, 30, LA DOLORÈS');
verifie(J0.CAR_UNLOCK[I.combi].k === 'mis' && J0.CAR_UNLOCK[I.combi].id === 'nuages10', 'LE COMBI : sa condition est la mission nuages10', J0.CAR_UNLOCK[I.combi]);
verifie(J0.CAR_UNLOCK[I.dolores].k === 'mis' && J0.CAR_UNLOCK[I.dolores].id === 'mois1', 'LA DOLORÈS : sa condition est la mission mois1', J0.CAR_UNLOCK[I.dolores]);
verifie(J0.CAR_UNLOCK[I.aigle].k === 'premium' && J0.CAR_UNLOCK[I.iceberg].k === 'premium', "L'AIGLE DE FEU et L'ICEBERG : premium (plus de mission)");
const ids = J0.M2.map(m => m.id); verifie(new Set(ids).size === ids.length && ids.every(x => /^[a-z0-9]{2,12}$/.test(x)), 'ids de missions uniques et valides');
verifie(!J0.carUnlockedVrai(I.combi) && !J0.carUnlockedVrai(I.dolores), 'compte neuf : LE COMBI et LA DOLORÈS fermés');

/* le prix barré */
{
  const h = J0.prixBarreHtml(I.iceberg), b = J0.promoBandeau(I.iceberg);
  verifie(/<s>1,61 €<\/s>/.test(h), "prix d'avant barré « 1,61 € » à côté du prix du jeu en €", h);
  verifie(/OFFRE DE L'HIVER/.test(b), 'bandeau OFFRE DE L\'HIVER', b);
  verifie(J0.prixBarreHtml(I.aigle) === '' && J0.promoBandeau(I.aigle) === '', "pas de promo sur L'AIGLE DE FEU");
  J0.ACH_PRIX['cashcar.car.iceberg'] = '$0.99';
  verifie(J0.prixBarreHtml(I.iceberg) === '' && /OFFRE/.test(J0.promoBandeau(I.iceberg)), "prix d'Apple en dollars : plus de prix barré en €, le bandeau reste");
  J0.ACH_PRIX['cashcar.car.iceberg'] = '0,79 €';
  verifie(/<s>/.test(J0.prixBarreHtml(I.iceberg)), "prix d'Apple en euros : le prix barré revient");
  J0.ACH_PRIX['cashcar.car.iceberg'] = '1,69 €';
  verifie(J0.prixBarreHtml(I.iceberg) === '', "prix d'Apple remonté (offre finie chez Apple) : plus de prix barré");
  delete J0.ACH_PRIX['cashcar.car.iceberg'];
  const W9 = monde(undefined, { search: '?promo=0' });
  verifie(W9.J.prixBarreHtml(I.iceberg) === '' && W9.J.promoBandeau(I.iceberg) === '', '?promo=0 : ni prix barré ni bandeau');
}

/* ---------- 3. les sauvegardes fabriquées ---------- */
console.log('3. sauvegardes fabriquées');
const MUET = { sfx: false, mus: false, vox: false };
const SOCLE = { v: 2, ...MUET, gamme: 3, eco: 3, tuto: 1, permis: 1, bienv: 1, best: 9000, bank: 1000, aura: 100, owned: [1], equipped: 1,
  ex: { eng: 6, tricks: 40, gaps: 3, bumps: 9, zones: 2, chain: 12, kmh: 300, surv: 0, runs: 25, floor: 0 }, mis: { n: 3, ok: [1, 1, 1], best: [0, 0, 0], f: -1 },
  shop: { own: ['peinture:lagon', 'aile:phenix', 'trainee:foudre'], eq: { peinture: 'usine', aile: 'panneaux', trainee: 'nitro' } },
  prof: { ne: Date.parse('2026-10-20T12:00:00Z'), tA: 3600, dMax: 120 },
  m2: { v: 1, vc: 1, vr: 1, ok: [], pr: [], su: [], mq: [], nv: [], fl: [], vu: {}, r: {}, c: { morts: 3, gagne: 5e6, jours: 4, jd: '2026-11-17', cartes: ['nuages'], cartesP: [], rejoue: 0, kmTot: 500 } } };
const clone = o => JSON.parse(JSON.stringify(o));
function charge(save, nom) {
  const warn = []; let W = null, err = null;
  try { W = monde(save, { warn }); } catch (e) { err = e; }
  verifie(!err, nom + ' : le chargement ne plante pas', err && String(err.stack || err).split('\n').slice(0, 3).join(' | '));
  const graves = warn.filter(w => /missions v2|tri des voitures|TypeError|ReferenceError/.test(w));
  verifie(!graves.length, nom + ' : aucune erreur avalée (missions, migration)', graves);
  return W;
}
const REMB = { scarabee: 0, canard: 8000000, perle: 2400000, cabossee: 25000, fidele: 40000 };
for (const k of RETIREES) {
  const i = I[k];
  /* possédée */
  { const s = clone(SOCLE); s.owned = [1, i]; const W = charge(s, NOMS[k] + ' possédée'); if (W) { const d = W.J.SAVE.d;
    verifie(d.owned.indexOf(i) < 0 && d.owned.indexOf(1) >= 0, NOMS[k] + ' possédée : sort de owned, ELDORADO reste', d.owned);
    verifie(d.bank === 1000 + REMB[k], NOMS[k] + ' possédée : remboursée ' + REMB[k] + ' $', d.bank - 1000);
    verifie(d.equipped === 1, NOMS[k] + ' possédée : l\'équipée (ELDORADO) ne bouge pas', d.equipped);
    verifie(!!W.J.SAVE.remb === (REMB[k] > 0), NOMS[k] + ' possédée : le message de remboursement ' + (REMB[k] ? 'est prêt' : 'ne dit rien (rien n\'a été payé)'), W.J.SAVE.remb);
    const re = monde(JSON.stringify(d)); /* le rechargement suivant (ce que flush écrirait : SAVE.d en JSON) ne rembourse pas deux fois */
    verifie(re.J.SAVE.d.bank === d.bank, NOMS[k] + ' : rechargée, pas de second remboursement', [re.J.SAVE.d.bank, d.bank]); } }
  /* équipée + habillages posés */
  { const s = clone(SOCLE); s.owned = [1, i]; s.equipped = i; s.shop.eq = { peinture: 'lagon', aile: 'phenix', trainee: 'foudre' }; const W = charge(s, NOMS[k] + ' équipée + habillée'); if (W) { const d = W.J.SAVE.d;
    verifie(d.equipped === 0, NOMS[k] + ' équipée : repart en LA HONTE (index 0)', d.equipped);
    verifie(d.shop.eq.peinture === 'lagon' && d.shop.eq.aile === 'phenix' && d.shop.eq.trainee === 'foudre', NOMS[k] + ' équipée : peinture, aile et traînée gardées (elles suivent la caisse équipée)', d.shop.eq);
    verifie(['peinture:lagon', 'aile:phenix', 'trainee:foudre'].every(x => d.shop.own.indexOf(x) >= 0), NOMS[k] + ' équipée : habillages toujours à toi', d.shop.own); } }
  /* équipée sans la posséder (index périmé) */
  { const s = clone(SOCLE); s.equipped = i; const W = charge(s, NOMS[k] + ' équipée sans être possédée'); if (W) verifie(W.J.SAVE.d.equipped === 0, NOMS[k] + ' : équipée seule → LA HONTE', W.J.SAVE.d.equipped); }
}
/* LA QUEUE DE CANARD gagnée par sa mission : pas remboursée */
{ const s = clone(SOCLE); s.owned = [1, I.canard]; s.m2.ok = ['km100k']; s.m2.pr = ['km100k']; const W = charge(s, 'QUEUE DE CANARD gagnée (km100k)'); if (W) {
  verifie(W.J.SAVE.d.bank === 1000 && W.J.SAVE.d.owned.indexOf(I.canard) < 0, 'QUEUE DE CANARD gagnée par km100k : sort sans remboursement', W.J.SAVE.d.bank); } }
/* missions qui citaient une retirée : en cours, réussies non prises */
{ const s = clone(SOCLE); s.m2.ok = ['fig5', 'km100k']; s.m2.nv = ['fig5', 'km100k']; s.m2.c.kmTot = 19999; s.m2.r.fig = 11; const W = charge(s, 'missions fig5 / km100k réussies, pas récupérées'); if (W) {
  const J = W.J, b0 = J.SAVE.d.bank; const o1 = J.m2Prend('fig5'), o2 = J.m2Prend('km100k');
  verifie(o1 && o1.cash === 15000 && o2 && o2.cash === 100000 && J.SAVE.d.bank === b0 + 115000, 'fig5 / km100k réussies : RÉCUPÈRE verse l\'argent (15 000 + 100 000 $), aucune caisse', [o1, o2]);
  verifie(J.m2Prend('fig5') === null, 'fig5 : une seule fois'); } }
{ const s = clone(SOCLE); s.m2.c.kmTot = 19999.5; const W = charge(s, 'km100k en cours (19 999,5 km)'); if (W) {
  const J = W.J, m = J.M2.find(x => x.id === 'km100k'); verifie(J.m2Dispo(m) && J.m2Val(m) === 19999 && J.m2Seuil(m) === 20000, 'km100k en cours : toujours affichée, 19 999 / 20 000', [J.m2Val(m), J.m2Seuil(m)]); } }
/* contrat (ancien carnet 1, LE SCARABÉE) relevé */
{ const s = clone(SOCLE); s.mis = { n: 9, ok: [1, 1, 1], best: [5, 5, 5], f: -1 }; s.m2 = { v: 0, ok: [], pr: [], su: [], nv: [], fl: [], vu: {}, r: {}, c: {} }; const W = charge(s, 'ancienne sauvegarde à carnets (migration des missions)'); if (W) {
  const d = W.J.SAVE.d; verifie(d.owned.indexOf(I.scarabee) < 0, 'carnets relevés : LE SCARABÉE (retiré) n\'est pas donné', d.owned);
  verifie(d.owned.indexOf(I.combi) >= 0 && d.owned.indexOf(I.dolores) >= 0, 'carnets 2 et 3 relevés avant les missions : LE COMBI et LA DOLORÈS restent à toi (la condition d\'avant)', d.owned); } }
/* les quatre gardées : possédées, elles restent */
{ const s = clone(SOCLE); s.owned = [1, I.combi, I.dolores, I.aigle, I.iceberg]; s.equipped = I.iceberg; const W = charge(s, 'les quatre gardées possédées'); if (W) {
  const J = W.J, d = J.SAVE.d; verifie(GARDEES.every(k => d.owned.indexOf(I[k]) >= 0) && d.bank === 1000, 'COMBI, DOLORÈS, AIGLE, ICEBERG : gardées, aucun remboursement', d.owned);
  verifie(GARDEES.every(k => J.carUnlocked(I[k])), 'elles s\'équipent (carUnlocked)'); verifie(d.equipped === I.iceberg, "L'ICEBERG équipée le reste", d.equipped);
  verifie(J.prixBarreHtml(I.iceberg) === '' && J.promoBandeau(I.iceberg) === '', "L'ICEBERG à toi : ni prix barré ni bandeau"); } }
/* réussies avant la mise à jour, pas encore récupérées : la caisse est donnée une fois */
{ const s = clone(SOCLE); s.m2.ok = ['parf10', 'rares', 'lave', 'verglas100']; s.m2.nv = ['parf10', 'rares', 'lave', 'verglas100']; const W = charge(s, 'parf10 / rares / lave / verglas100 réussies, pas récupérées'); if (W) {
  const J = W.J, d = J.SAVE.d, s2 = d.m2;
  verifie(GARDEES.every(k => d.owned.indexOf(I[k]) >= 0), 'la caisse gagnée avant la mise à jour est donnée (COMBI, DOLORÈS, AIGLE, ICEBERG)', d.owned);
  verifie(['parf10', 'rares', 'lave', 'verglas100'].every(x => s2.pr.indexOf(x) >= 0 && s2.nv.indexOf(x) < 0), 'les quatre missions sont marquées prises (pas d\'argent en plus)', { pr: s2.pr, nv: s2.nv });
  const b0 = d.bank; verifie(J.m2Prend('parf10') === null && d.bank === b0, 'parf10 : rien à reprendre');
  const re = monde(JSON.stringify(d)); verifie(re.J.SAVE.d.m2.c.sc && re.J.SAVE.d.m2.c.sc.tri_voitures === 1, 'le témoin de la migration survit au rechargement (san)', re.J.SAVE.d.m2.c.sc); } }
{ const s = clone(SOCLE); s.m2.c.sc = { tri_voitures: 1 }; s.m2.ok = ['parf10']; s.m2.nv = ['parf10']; const W = charge(s, 'parf10 réussie APRÈS la mise à jour'); if (W) {
  const J = W.J, d = J.SAVE.d; verifie(d.owned.indexOf(I.combi) < 0, 'parf10 réussie après : pas de COMBI', d.owned); const b0 = d.bank, o = J.m2Prend('parf10');
  verifie(o && o.cash === 25000 && d.bank === b0 + 25000, 'parf10 réussie après : RÉCUPÈRE verse 25 000 $', o); } }
/* une sauvegarde illisible / vide : rien ne plante */
charge(undefined, 'aucune sauvegarde'); charge('{"v":2,"owned":[79,81,', 'sauvegarde tronquée'); charge({ v: 2, owned: [6, 45, 78, 79, 81, 7, 8, 52, 72], equipped: 81, ...MUET }, 'sauvegarde minimale avec tout le lot');

/* ---------- 4. les deux secrètes ---------- */
console.log('4. les secrètes : avant / pile / après le seuil, horloge reculée');
{ /* LE COMBI : dix niveaux des nuages passés */
  const s = clone(SOCLE); s.m2.c.sc = { tri_voitures: 1, nuages_passes: 8 }; const W = charge(s, 'COMBI : 8 niveaux passés'); if (W) {
    const J = W.J, m = J.M2.find(x => x.id === 'nuages10'), passe = carte => { W.etat.carte = carte; J.secPorte(); J.m2Verifie(true); };
    passe('ville'); verifie(J.m2Val(m) === 8, 'un portail en VILLE ne compte pas', J.m2Val(m));
    W.etat.started = false; J.secPorte(); W.etat.started = true; verifie(J.m2Val(m) === 8, 'hors course (menu, auto-école) : ne compte pas', J.m2Val(m));
    passe('nuages'); verifie(J.m2Val(m) === 9 && J.SAVE.d.m2.ok.indexOf('nuages10') < 0 && !J.carUnlockedVrai(I.combi), '9 niveaux : pas encore', J.m2Val(m));
    passe('nuages'); verifie(J.m2Val(m) === 10 && J.SAVE.d.m2.ok.indexOf('nuages10') >= 0, '10 niveaux pile : la mission secrète est réussie', J.m2Val(m));
    const o = J.m2Prend('nuages10'); verifie(o && o.car === I.combi && J.carUnlockedVrai(I.combi), 'RÉCUPÈRE : LE COMBI est à toi', o);
    passe('nuages'); verifie(J.m2Val(m) === 11 && J.carUnlockedVrai(I.combi), '11 niveaux : toujours à toi');
    const re = monde(JSON.stringify(J.SAVE.d)); verifie(re.J.SAVE.d.m2.c.sc.nuages_passes === 11 && re.J.carUnlockedVrai(I.combi), 'rechargé : le compteur (11) et LE COMBI survivent à san', re.J.SAVE.d.m2.c.sc); } }
{ /* LA DOLORÈS : 30 jours depuis la naissance du compte */
  const ne = Date.parse('2026-11-01T08:00:00Z'), J9 = 864e5;
  const s = clone(SOCLE); s.m2.c.sc = { tri_voitures: 1 }; s.prof.ne = ne;
  const W = charge(s, 'DOLORÈS : compte né le 1er novembre'); if (W) {
    const J = W.J, m = J.M2.find(x => x.id === 'mois1');
    W.H.t = ne + 30 * J9 - 3600e3; J.m2Verifie(true); verifie(J.m2Val(m) === 29 && J.SAVE.d.m2.ok.indexOf('mois1') < 0, '29 j 23 h : pas encore', J.m2Val(m));
    W.H.t = ne + 30 * J9; J.m2Verifie(true); verifie(J.m2Val(m) === 30 && J.SAVE.d.m2.ok.indexOf('mois1') >= 0, '30 j pile : réussie', J.m2Val(m));
    const o = J.m2Prend('mois1'); verifie(o && o.car === I.dolores && J.carUnlockedVrai(I.dolores), 'RÉCUPÈRE : LA DOLORÈS est à toi', o);
    W.H.t = ne + 31 * J9; verifie(J.m2Val(m) === 31 && J.carUnlockedVrai(I.dolores), '31 j : toujours à toi');
    W.H.t = ne - 10 * J9; const re = monde(JSON.stringify(J.SAVE.d), { t: W.H.t });
    verifie(re.J.carUnlockedVrai(I.dolores) && re.J.SAVE.d.m2.ok.indexOf('mois1') >= 0, 'horloge reculée de 41 jours, rechargée : LA DOLORÈS reste à toi', re.J.SAVE.d.m2.ok); }
  /* un joueur qui joue tous les jours mais installé depuis 10 jours : non */
  const s2 = clone(SOCLE); s2.m2.c.sc = { tri_voitures: 1 }; s2.prof.ne = Date.parse('2026-11-08T12:00:00Z'); s2.m2.c.jours = 400;
  const W2 = charge(s2, 'DOLORÈS : 10 jours d\'installation, 400 jours joués (fabriqué)'); if (W2) { W2.J.m2Verifie(true); verifie(W2.J.SAVE.d.m2.ok.indexOf('mois1') < 0, 'les jours JOUÉS ne comptent pas : seule l\'installation'); }
  /* une horloge en avance au tout premier lancement ne pose pas une naissance dans le futur */
  const s3 = clone(SOCLE); s3.m2.c.sc = { tri_voitures: 1 }; s3.prof.ne = Date.parse('2027-06-01T00:00:00Z');
  const W3 = charge(s3, 'DOLORÈS : naissance dans le futur'); if (W3) verifie(W3.J.SAVE.d.prof.ne <= W3.H.t && W3.J.m2InstallJ() === 0, 'naissance dans le futur : ramenée à maintenant (0 jour)', W3.J.SAVE.d.prof.ne);
  /* compte neuf : la naissance est posée maintenant */
  const W4 = charge(undefined, 'DOLORÈS : compte neuf'); if (W4) verifie(W4.J.SAVE.d.prof.ne === W4.H.t && W4.J.m2InstallJ() === 0, 'compte neuf : né maintenant, 0 jour', W4.J.SAVE.d.prof);
  /* sauvegarde d'avant le profil (sans prof) : née au premier lancement de cette version */
  const s5 = clone(SOCLE); delete s5.prof; const W5 = charge(s5, 'DOLORÈS : sauvegarde sans profil'); if (W5) verifie(W5.J.SAVE.d.prof.ne === W5.H.t, 'sans `prof` : la naissance est posée à ce lancement (on attend 30 jours à partir de là)', W5.J.SAVE.d.prof.ne);
}

console.log('\n' + ok + ' vérifications, ' + ko + ' en échec');
console.log(ko ? 'BANC KO' : 'BANC OK');
process.exit(ko ? 1 : 0);
