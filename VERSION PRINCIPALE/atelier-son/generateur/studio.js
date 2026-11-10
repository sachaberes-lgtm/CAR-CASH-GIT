/* LE STUDIO (2026-11-09 ; Sacha : « combine simulateur moteur et simulateur nitro, mais fais ça mieux (…) le design, on en aura besoin pour un portfolio »).
   Le labo expert (../moteur-vivant/labo.html) expose une centaine de curseurs : on n'y comprend rien. Ici : quatre voix (moteur, nitro, pneus, musique), chacune avec un choix net et
   six ou sept réglages qui comptent, des niveaux calés sur ceux du jeu, et DEUX preuves visibles de l'accord entre le moteur et le nitro : le spectrogramme (les harmoniques montent
   ensemble) et le compteur « du nitro posé sur les harmoniques du moteur ».
   Audio : UN processeur (worklet-studio.js) joue moteur + nitro + pneus en trois bus ; la page mixe, mesure, dessine. Le conducteur (boîte, inertie) tourne ici, dans la page. */
(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const MV = window.MoteurVivantApi, NM = window.NitroMatiereApi, NB = window.NitroBraiseApi, NF = window.NitroFuseeApi, NH = window.NitroHybrideApi, NP = window.NitroPhysiqueApi, CD = window.MVConducteur;
const dbl = d => Math.pow(10, d / 20), clamp = (x, a, b) => x < a ? a : x > b ? b : x;
const PARAMS = new URLSearchParams(location.search), MUET = PARAMS.get('muet') === '1';
const REDUIT = matchMedia('(prefers-reduced-motion: reduce)').matches;
const COULEUR = { miel: '#ffb15c', braise: '#ff4d6d', tisane: '#9fd8b8', lilas: '#cbbfd6', suie: '#1c1116' };
const DIR = '../../assets/audio/moteur-vivant/', MUSDIR = '../../assets/audio/music/course/';
const JEU = { eng: -7, nit: -6, tyr: -13 }, CIBLE = -24;          /* rapports du jeu sous la musique ; niveau de référence de chaque bus (dBFS RMS) */

/* ======================= LES CHOIX ======================= */
const MOTEURS = [
  ['buche', 'Bûche', 'V8 rond, affiné. Le ronron du coin du feu.'],
  ['tisane', 'Tisane', '6 en ligne soyeux. Le plus calme.'],
  ['braise', 'Braise', 'V8 qui crépite doucement.'],
  ['chocolat', 'Chocolat', 'V8 à plat, velouté, un peu vif.'],
  ['veillee', 'Veillée', '4 cylindres à plat : le bobobo d\'un chat qui ronronne.'],
  ['v8', 'V8 croisé', 'Le classique américain, il gargouille.'],
  ['flat', 'V8 plat aigu', 'Haute rotation, il déchire.'],
  ['l6', '6 en ligne turbo', 'Soyeux, avec le sifflet du turbo.']];
const NITROS = [
  ['#', 'Physique : mécanique et flamme', 'Pour le moteur cyber. Une flamme modélisée dans le tuyau, accordée sur la note du moteur, qui varie avec l\'appui. Mesuré : jamais plus brillant que le moteur.'],
  ['physique:forge', 'Forge', 'Le plus mécanique : râpe, poing, tics de culbuteur, flamme franche mais courte.'],
  ['physique:brasier', 'Brasier', 'Le plus flamme : un rugissement large, beaucoup de bouffées.'],
  ['physique:doux', 'Doux', 'Ne fait jamais mal : coupure plus basse, peu de bouffées, purge courte.'],
  ['#', 'Mécanique et flammes', 'Calés sur le moteur, avec de la vraie flamme. Plus tu appuies, plus la flamme s\'ouvre.'],
  ['hybride:bruleur', 'Mécanique et brûleur', 'Le rugissement franc d\'un brûleur sous pression, sur la râpe du moteur.'],
  ['hybride:flambee', 'Mécanique et flambée', 'Une flamme qui danse, des langues larges et rapides.'],
  ['hybride:dragon', 'Mécanique et dragon', 'Le souffle maléfique : grondement, voix qui glisse, flamme en vagues lentes.'],
  ['#', 'À matière', 'Le moteur en plus gros, sans flamme.'],
  ['matiere:matiere', 'Matière', 'Un corps saturé et une râpe sur chaque coup, aussi doux que le moteur.'],
  ['matiere:plus', 'Matière +', 'Plus saturé, plus de plainte. Plus « injection ».'],
  ['matiere:chaud', 'Chaude', 'Presque sans râpe. Rond, plein, réconfortant.'],
  ['matiere:enfer', 'Enfer doux', 'Un grondement un peu maléfique, jouissif mais calme.'],
  ['#', 'Flammes seules', 'De la combustion et de la flamme, sans lien avec la cadence du moteur.'],
  ['fusee:bruleur', 'Brûleur', 'Le rugissement d\'un brûleur de montgolfière.'],
  ['fusee:flambee', 'Flambée', 'Le « whoomp » d\'une torchère, puis une flamme qui danse.'],
  ['fusee:chalumeauAir', 'Chalumeau aérien', 'La flamme bleue qui flotte.'],
  ['fusee:souffle', 'Souffle de dragon', 'Une flamme maléfique qui s\'étire.'],
  ['fusee:panache', 'Panache', 'Le panache d\'une fusée, avec ses diamants de choc.'],
  ['fusee:follet', 'Feu follet', 'Une flamme légère, beaucoup d\'air.'],
  ['#', 'Braise', 'Corps calé sur le moteur, très doux.'],
  ['braise:foyer', 'Foyer', 'Chaud et rond, avec un sous-grondement à l\'octave.'],
  ['braise:forge', 'Forge', 'Dense et brillant.'],
  ['braise:gouffre', 'Gouffre', 'Sombre : le grave domine.'],
  ['#', 'Pour comparer', 'Les anciens réglages.'],
  ['matiere:premier', 'Matière, 1er jet', 'Avant le travail sur l\'agrément : plus aigu que le moteur.'],
  ['braise:noel', 'Flamme d\'hier', 'Le nitro en bruit filtré. Celui qui sonnait comme du vent.']];
/* les réglages qui comptent : [clé du paramètre, nom, aide, min, max, échelle log ?, unité] */
const R_MOT = [['rasp', 'Râpe', 'La détonation de chaque coup.', 0, 1.2], ['lope', 'Gargouillis', 'Le hasard de chaque cylindre au ralenti.', 0, 1.4],
  ['popLvl', 'Crépitements', 'Les petits pops quand on lâche le gaz.', 0, 1], ['ember', 'Braises', 'Des grains ronds, sous le moteur.', 0, 1],
  ['breath', 'Respiration', 'Un hasard lent : jamais deux secondes pareilles.', 0, 1], ['cyber', 'Touche jeu vidéo', 'Une note de la musique à chaque marche de régime, un coup de poing au gaz.', 0, 1],
  ['outLP', 'Brillance', 'Du velours au clair.', 1500, 9000, 1, 'Hz']];
const R_NIT = {
  matiere: [['corpsG', 'Corps', 'Les dents de scie sur la cadence du moteur.', 0, 1], ['rapeG', 'Râpe', 'Du bruit haché à chaque allumage.', 0, 1.4], ['driveHi', 'Saturation', 'Plus on pousse, plus le son se remplit.', 1, 6],
    ['poingG', 'Poing grave', 'Le coup de poitrine de chaque allumage.', 0, 1], ['tirageG', 'Plainte', 'Les octaves hautes qui montent avec la pression.', 0, .6],
    ['grondeG', 'Grondement', 'Seconde mineure, voix qui glisse : le côté maléfique.', 0, .7], ['outLP', 'Brillance', 'Du velours au clair.', 2000, 9000, 1, 'Hz']],
  braise: [['corpsG', 'Corps', 'Impulsions à la cadence du moteur.', 0, 1], ['subG', 'Sous-grondement', 'L\'octave en dessous : le poids.', 0, 1.4], ['ronceG', 'Ronce', 'Un ronronnement rugueux, calé sur le moteur.', 0, .9],
    ['grondeG', 'Grondement', 'Seconde mineure et voix qui glisse.', 0, .5], ['braiseG', 'Braise', 'Le lit de charbons, très grave.', 0, .9], ['flammeG', 'Souffle', 'Le bruit de flamme. C\'est lui, le vent.', 0, 1],
    ['outLP', 'Brillance', 'Du velours au clair.', 1500, 6000, 1, 'Hz']] };
R_NIT.fusee = [['flameG', 'Flamme', 'Le corps de la flamme, qui ondule par bouffées.', 0, 1.8], ['lickG', 'Langues de feu', 'De brèves bouffées qui gonflent la flamme.', 0, 1.6], ['airG', 'Air chaud', 'L\'air qui bouge avec la flamme.', 0, .5],
  ['bloom', 'Chambre', 'Une petite pièce autour : la flamme flotte.', 0, .6], ['coreG', 'Note', 'La note de la flamme, qui monte avec la pression.', 0, .6], ['subG', 'Grave', 'L\'octave en dessous : le poids.', 0, .7], ['outLP', 'Brillance', 'Du velours au clair.', 1500, 4500, 1, 'Hz']];
R_NIT.physique = [['mixM', 'Mécanique', 'Le poids de la voix mécanique, calée sur le moteur.', 0, 1.4, 0, 'pct'], ['mixF', 'Flamme', 'Le poids de la flamme dans le tuyau.', 0, 1.5, 0, 'pct'],
  ['jetG', 'Coups de flamme', 'Chaque cylindre crache son coup dans le tuyau.', 0, 2.6], ['tuyau', 'Longueur du tuyau', 'Le premier mode du tuyau : bas = long et grave, haut = court et nerveux.', 110, 240, 1, 'Hz'], ['chauffe', 'Chauffe du tuyau', 'Tenir le nitro fait monter les modes du tuyau.', 0, .4, 0, 'pct'],
  ['m_rapeG', 'Râpe', 'Du bruit haché à chaque allumage.', 0, 1.4], ['ticG', 'Tics de culbuteur', 'Un cliquetis à chaque allumage, au hasard.', 0, .4], ['burstG', 'Bouffées', 'La flamme qui crache, cylindre par cylindre.', 0, 1.6],
  ['combMix', 'Résonance du tuyau', 'La flamme sonne sur les harmoniques du moteur.', 0, 1, 0, 'pct'], ['outLP', 'Coupure', 'Rien d\'aigu ne passe au-dessus.', 1500, 5000, 1, 'Hz']];
R_NIT.hybride = [['mixM', 'Voix mécanique', 'Le poids de la mécanique, calée sur le moteur.', 0, 1.4, 0, 'pct'], ['mixF', 'Flamme', 'Le poids de la flamme. Elle s\'ouvre avec l\'appui.', 0, 1.4, 0, 'pct'],
  ['rapeG', 'Râpe', 'Du bruit haché à chaque allumage : le côté mécanique.', 0, 1.4], ['poingG', 'Poing grave', 'Le coup de poitrine de chaque allumage.', 0, 1], ['tirageG', 'Plainte de compresseur', 'Les octaves hautes qui montent avec l\'appui.', 0, .6],
  ['f_lickG', 'Langues de feu', 'De brèves bouffées qui gonflent la flamme.', 0, 1.6], ['f_airG', 'Air chaud', 'L\'air qui bouge avec la flamme.', 0, .5], ['outLP', 'Brillance mécanique', 'Du velours au clair.', 1500, 6000, 1, 'Hz']];
const R_TYR = [['rouleG', 'Roulement', 'Le grave lourd de la route.', 0, .8], ['grainG', 'Gomme', 'La gomme chaude sur le sol.', 0, 1], ['chantG', 'Chant du virage', 'Deux voix étroites qui se balancent.', 0, .6], ['poidsG', 'Poids', 'Le coussin grave en virage.', 0, .6]];
const TON_HZ = { 'do': 130.81, 'do#': 138.59, 'ré': 146.83, 'ré#': 155.56, 'mi': 164.81, 'fa': 174.61, 'fa#': 185, 'sol': 196, 'sol#': 207.65, 'la♭': 207.65, 'la': 220, 'la#': 233.08, 'si': 246.94 };
const MORCEAUX = Object.values(window.PALIERS_COURSE || {}).map(p => ({ id: p.id, titre: p.titre, ton: p.ton, bpm: p.bpm, hz: TON_HZ[(p.ton.split(' ')[0] || '').replace('♯', '#')] || 220 }));

/* LE MODE MÉCANIQUE (Sacha : « le moteur de base, c'est Cyber. Du coup on se rattrape sur le moteur en mode mécanique ») : le MÊME moteur, mais on retire la touche jeu vidéo et le velours —
   culbuteurs qui tictaquent, clac direct, détonation franche, échappement ouvert (moins amorti), pops plus présents, passe-bas final à 4,2 kHz au lieu de 2,3. */
const MECA = { cyber: 0, warm: .2, breath: .4, rasp: .6, clac: .00055, ticks: .8, intake: .3, popRate: .5, popSoft: 1.4, popLvl: .6, ember: .05, lopeSm: .22, damp: .40, bodyLP: 3200, eq: [['hs', 1100, 0, -4]], outLP: 4200, sat: 1.0, satLoad: .9, tau: .0011, wander: .5 };
function cfgMode(eng, mode) { const c = new MV.MoteurVivant(eng, 48000, 1).cfg; if (mode === 'meca') Object.assign(c, JSON.parse(JSON.stringify(MECA))); return c; }

/* ======================= L'ÉTAT (et le lien qui le garde) ======================= */
const S = { eng: 'buche', mode: 'cyber', pN: 1, pG: 1, nit: 'physique:forge', tyrOn: true, mus: '', lv: { eng: 0, nit: 0, tyr: 0, mus: 0 }, vol: 6, carve: 3.5, accord: true, phone: false, health: 1, eo: {}, no: {}, to: {} };
try { const h = location.hash.match(/s=([^&]+)/); if (h) Object.assign(S, JSON.parse(decodeURIComponent(escape(atob(h[1]))))); } catch (e) { /* lien abîmé : on repart des réglages par défaut */ }
let saveT = 0; const T = { fixe: 0, maintN: false, maintG: false };      /* l'essai en cours : pas gardé dans le lien */
function garde() { clearTimeout(saveT); saveT = setTimeout(() => { try { history.replaceState(null, '', '#s=' + btoa(unescape(encodeURIComponent(JSON.stringify(S))))); } catch (e) { /* hors navigateur */ } }, 400); }

/* ======================= L'AUDIO ======================= */
let ac = null, pret = false, node = null, st = { rpm: 0, etat: 'off', f0: 0, nitA: 0, nitSp: 0, lv: [0, 0, 0] }, CAL = null;
const bus = {}, an = {}; let cfgView = null, musEl = null;
const send = o => node && node.port.postMessage(o);
async function boot() {
  if (ac) { if (ac.state === 'suspended') ac.resume(); return; }
  ac = new (window.AudioContext || window.webkitAudioContext)({ latencyHint: 'interactive' });
  const [cal, ...txt] = await Promise.all([fetch('calibration.json?v=11').then(r => r.json()), ...['moteur-vivant.js', 'nitro-braise.js', 'nitro-matiere.js', 'nitro-fusee.js', 'nitro-hybride.js', 'nitro-physique.js', 'pneus-doux.js', 'worklet-studio.js'].map(n => fetch(DIR + n + '?v=12').then(r => r.text()))]);
  CAL = cal;
  await ac.audioWorklet.addModule(URL.createObjectURL(new Blob([txt.join('\n')], { type: 'text/javascript' })));
  const [kind, preset] = S.nit.split(':');
  node = new AudioWorkletNode(ac, 'studio-son', { numberOfInputs: 0, numberOfOutputs: 3, outputChannelCount: [2, 2, 2], processorOptions: { eng: S.eng, nitro: { kind, preset } } });
  node.port.onmessage = e => { st = e.data; };
  const g = () => ac.createGain(), bq = (type, f, q) => { const b = ac.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q || .7; return b; };
  bus.E = g(); bus.N = g(); bus.T = g(); bus.M = g(); bus.hpE = bq('highpass', 45);
  bus.c1 = bq('peaking', 850, .9); bus.c2 = bq('peaking', 1800, .9);
  bus.sum = g(); bus.phHP = bq('highpass', 20); bus.phLP = bq('lowpass', 20000);
  bus.lim = ac.createDynamicsCompressor(); bus.lim.threshold.value = -2; bus.lim.knee.value = 0; bus.lim.ratio.value = 20; bus.lim.attack.value = .002; bus.lim.release.value = .12;
  bus.vol = g();
  node.connect(bus.hpE, 0); bus.hpE.connect(bus.E); node.connect(bus.N, 1); node.connect(bus.T, 2);
  musEl = new Audio(); musEl.loop = true; const ms = ac.createMediaElementSource(musEl); ms.connect(bus.c1); bus.c1.connect(bus.c2); bus.c2.connect(bus.M);
  [bus.E, bus.N, bus.T, bus.M].forEach(b => b.connect(bus.sum));
  bus.sum.connect(bus.phHP); bus.phHP.connect(bus.phLP); bus.phLP.connect(bus.lim); bus.lim.connect(bus.vol); bus.vol.connect(ac.destination);
  const mk = (src, fft, sm) => { const a = ac.createAnalyser(); a.fftSize = fft; a.smoothingTimeConstant = sm; a.minDecibels = -100; a.maxDecibels = -22; src.connect(a); return a; };
  an.E = mk(bus.E, 8192, .6); an.N = mk(bus.N, 8192, .4); an.T = mk(bus.T, 8192, .6); an.M = mk(bus.M, 8192, .6); an.mix = mk(bus.sum, 4096, .35);
  cfgView = cfgMode(S.eng, S.mode); applyEngOv();
  send({ ev: 'allume' }); pousseTout(); mix();
  if (S.mus) joue(S.mus);
  pret = true;
}
function pousseTout() { send({ cfg: Object.assign({}, S.mode === 'meca' ? MECA : {}, S.eo) }); send({ nitP: S.no }); send({ tyrP: S.to }); appliqueCouches(); }
function mix() {
  if (!ac) return; const t = ac.currentTime, solo = S.mus ? 0 : 10;
  bus.E.gain.setTargetAtTime(dbl(CIBLE + JEU.eng - CAL.eng[S.eng] + S.lv.eng + solo), t, .05);
  bus.N.gain.setTargetAtTime(dbl(CIBLE + JEU.nit - (CAL.nit[S.nit] ?? -10) + S.lv.nit + solo), t, .05);
  bus.T.gain.setTargetAtTime(S.tyrOn ? dbl(CIBLE + JEU.tyr - CAL.tyr + S.lv.tyr + solo) : 0, t, .05);
  bus.M.gain.setTargetAtTime(S.mus ? dbl(CIBLE - CAL.mus[S.mus] + S.lv.mus) : 0, t, .05);
  bus.c1.gain.setTargetAtTime(-S.carve, t, .05); bus.c2.gain.setTargetAtTime(-S.carve, t, .05);
  bus.vol.gain.setTargetAtTime(MUET ? 0 : dbl(S.vol), t, .05);
  bus.phHP.frequency.setTargetAtTime(S.phone ? 300 : 20, t, .05); bus.phLP.frequency.setTargetAtTime(S.phone ? 7000 : 20000, t, .05);
}
function joue(id) {
  S.mus = id; if (!musEl) return;
  if (!id) { musEl.pause(); return; }
  musEl.src = MUSDIR + id + '/p8.m4a'; musEl.play().catch(() => {});
  accorde();
}
function accorde() { const m = MORCEAUX.find(x => x.id === S.mus); send({ c: { eng: { cleHz: S.accord && m ? m.hz : 220 } } }); }

/* ======================= LA CONDUITE ======================= */
const keys = {}, appui = { gas: 1, nit: 1, drift: 1, brk: 1 }; let lastGear = 0, sim, pil, demo = null, gasK = 0, nitK = 0, driftK = 0, last = performance.now();
function mkSim() {
  sim = { cfg: cfgView, etat: st.etat, rpm: st.rpm, rpmEff: st.rpm, rpmCmd: 0, thr: 0, load: 0, health: S.health,
    demarre: a => send({ ev: 'demarre', a: a || 0 }), calage: () => send({ ev: 'calage' }), coup: a => send({ ev: 'coup', a }) };
  pil = new CD.Pilote(sim, demo ? demo.scen : null);
}
const SCEN = { dur: 36, ev: [[0, 'etat', 'run'], [.1, 'thr', 0], [4, 'thr', .55], [14, 'thr', 1], [18, 'lift'], [21, 'thr', .4], [27, 'lift'], [31, 'idle']] };
const demoNitro = t => (t >= 14.2 && t < 19.5) || (t >= 23 && t < 28) ? 1 : 0, demoDrift = t => (t >= 9 && t < 13) ? .55 : (t >= 24 && t < 31) ? 1 : 0;
async function lanceDemo() {
  if (demo) { demo = null; mkSim(); $('#bDemo').textContent = 'Lancer la démo de 36 secondes'; $('#bDemo').classList.remove('on'); $('#demoP').style.width = '0'; return; }
  await demarreAudio(); demo = { t: 0, scen: SCEN }; mkSim();
  $('#bDemo').textContent = 'Arrêter la démo'; $('#bDemo').classList.add('on');
}
function conduit(dt) {
  const C = cfgView; if (!C || !sim) return;
  /* L'APPUI : la gâchette n'est pas tout ou rien. Appui effectif = curseur d'appui × (pression du doigt, ou position verticale dans le pad si on glisse) ; il alimente le moteur ET le nitro */
  const tg = (keys.gas || T.maintG) ? S.pG * appui.gas : 0, tn = (keys.nit || T.maintN) ? S.pN * appui.nit : 0;
  gasK += (tg - gasK) * Math.min(1, dt * (tg > gasK ? 9 : 14)); nitK += (tn - nitK) * Math.min(1, dt * 12);
  $('#pGaz').style.setProperty('--p', gasK.toFixed(2)); $('#pNit').style.setProperty('--p', nitK.toFixed(2));
  let nitro = nitK, drift = keys.drift ? .8 * appui.drift : 0;
  sim.cfg = C; sim.etat = st.etat; sim.rpm = sim.rpmEff = st.rpm; sim.health = S.health;
  if (demo) { demo.t += dt; nitro = demoNitro(demo.t); drift = demoDrift(demo.t); $('#demoP').style.width = (100 * demo.t / SCEN.dur) + '%'; if (demo.t > SCEN.dur) { lanceDemo(); return; } }
  else { pil.thrT = gasK; pil.brakeT = keys.brk ? 1 : 0; pil.neutralRev = false; pil.auto = true; }
  driftK += (drift - driftK) * Math.min(1, dt * 6);
  if (nitro > .1 && pil.cond.g > 0) pil.cond.v = Math.min(C.limit / (pil.cond.rat[pil.cond.g] * pil.cond.k), pil.cond.v + nitro * dt * 14);
  if (T.fixe && !demo && st.etat === 'run') {      /* banc d'essai : le moteur figé sur un régime, pleine charge — on juge le nitro sans conduire */
    send({ c: { eng: { rpmCmd: T.fixe * (1 + .04 * nitro), thr: 1, load: .75, health: S.health }, nit: { nit: nitro, speed: .6 }, tyr: { speed: .6, drift: driftK } } }); return;
  }
  pil.tick(dt);
  const g9 = pil.cond.g; if (g9 > 0 && lastGear > 0 && g9 !== lastGear) send({ nitRapport: 1 }); lastGear = g9;      /* un passage de rapport : la flamme hoquette */
  const speed01 = Math.min(1, pil.cond.v / 260);
  if (st.etat === 'run' || demo) send({ c: { eng: { rpmCmd: sim.rpmCmd * (1 + .04 * nitro), thr: sim.thr, load: Math.min(1, sim.load + .25 * nitro), health: S.health }, nit: { nit: nitro, speed: speed01 }, tyr: { speed: speed01, drift: driftK } } });
  else send({ c: { eng: { health: S.health }, nit: { nit: 0, speed: 0 }, tyr: { speed: 0, drift: 0 } } });
}
async function demarreAudio() { await boot(); if (ac.state === 'suspended') await ac.resume(); $('#go').classList.add('on'); $('#goT').textContent = 'Éteindre le son'; $('#casque').textContent = MUET ? 'Mode muet : les écrans vivent, rien ne sort.' : 'Le moteur tourne. Maintiens Gaz, puis Nitro.'; }
function hold(btn, key) {
  let y0 = 0, glisse = false;
  const dose = e => {                                        /* la pression du doigt si l'appareil la donne ; sinon la position verticale dès qu'on glisse (haut = fort, bas = doux) */
    if ((e.pointerType === 'touch' || e.pointerType === 'pen') && e.pressure > 0 && e.pressure !== .5) { appui[key] = clamp(.15 + e.pressure * .85 * 1.3, .15, 1); return; }
    if (glisse || Math.abs(e.clientY - y0) > 14) { glisse = true; const r = btn.getBoundingClientRect(); appui[key] = .15 + .85 * clamp((r.bottom - e.clientY) / r.height, 0, 1); }
  };
  const on = e => { e.preventDefault(); demarreAudio(); keys[key] = true; btn.classList.add('held'); y0 = e.clientY; glisse = false; appui[key] = 1; dose(e); try { btn.setPointerCapture(e.pointerId); } catch (x) { /* ok */ } },
    off = () => { keys[key] = false; btn.classList.remove('held'); appui[key] = 1; };
  btn.addEventListener('pointerdown', on); btn.addEventListener('pointermove', e => { if (keys[key]) dose(e); }); btn.addEventListener('pointerup', off); btn.addEventListener('pointercancel', off); btn.addEventListener('lostpointercapture', off);
}
hold($('#pGaz'), 'gas'); hold($('#pNit'), 'nit'); hold($('#pBrk'), 'brk'); hold($('#pDrift'), 'drift');
const KMAP = { ' ': ['gas', '#pGaz'], arrowup: ['gas', '#pGaz'], n: ['nit', '#pNit'], arrowdown: ['brk', '#pBrk'], v: ['drift', '#pDrift'], arrowleft: ['drift', '#pDrift'], arrowright: ['drift', '#pDrift'] };
document.addEventListener('keydown', e => {
  if (e.repeat || e.metaKey || e.ctrlKey || e.altKey || /INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return; const k = e.key.toLowerCase(), m = KMAP[k];
  if (m) { e.preventDefault(); demarreAudio(); keys[m[0]] = true; $(m[1]).classList.add('held'); }
  else if (k === 's') $('#bStart').click(); else if (k === 'c') $('#bStall').click(); else if (k === 'x') $('#bHit').click();
});
document.addEventListener('keyup', e => { const m = KMAP[e.key.toLowerCase()]; if (m) { keys[m[0]] = false; $(m[1]).classList.remove('held'); } });
$('#bStart').onclick = async () => { await demarreAudio(); send({ ev: 'demarre', a: 0 }); };
$('#bStall').onclick = async () => { await demarreAudio(); send({ ev: 'calage' }); };
$('#bHit').onclick = async () => { await demarreAudio(); send({ ev: 'coup', a: .7 }); };
$('#bDemo').onclick = lanceDemo;
$('#go').onclick = async () => {
  if (ac && ac.state === 'running') { await ac.suspend(); $('#go').classList.remove('on'); $('#goT').textContent = 'Rallumer le son'; if (musEl) musEl.pause(); }
  else { await demarreAudio(); if (musEl && S.mus) musEl.play().catch(() => {}); }
};

/* ======================= LA CONSOLE ======================= */
function curseur({ id, label, aide, min, max, log, unite, valeur, couleur, onInput }) {
  const row = document.createElement('div'); row.className = 'sl';
  const lab = document.createElement('label'); lab.htmlFor = id; lab.textContent = label; const out = document.createElement('output'); out.htmlFor = id;
  const inp = document.createElement('input'); inp.type = 'range'; inp.id = id; inp.min = 0; inp.max = 1000; inp.step = 1;
  const toPos = v => log ? Math.log(v / min) / Math.log(max / min) : (v - min) / (max - min), fromPos = p => log ? min * Math.pow(max / min, p) : min + p * (max - min);
  const vir = x => x.replace('.', ',');
  const fmt = v => unite === 'Hz' ? (v >= 1000 ? vir((v / 1000).toFixed(1)) + ' kHz' : Math.round(v) + ' Hz') : unite === 's' ? vir(v.toFixed(2)) + ' s' : unite === 'num' ? vir(v.toFixed(2)) : unite === 'pct' ? Math.round(v * 100) + ' %'
    : unite === 'cents' ? Math.round(1200 * Math.log2(1 + v)) + ' cents' : unite === 'rpm' ? (v < 600 ? 'libre' : Math.round(v / 10) * 10 + ' tr/min') : Math.round(toPos(v) * 100) + ' %';
  const set = v => { inp.value = Math.round(clamp(toPos(v), 0, 1) * 1000); inp.style.setProperty('--v', inp.value / 10 + '%'); out.textContent = fmt(v); };
  inp.addEventListener('input', () => { const v = fromPos(inp.value / 1000); inp.style.setProperty('--v', inp.value / 10 + '%'); out.textContent = fmt(v); onInput(v); });
  inp.setAttribute('aria-describedby', id + 'a'); set(valeur);
  row.append(lab, out, inp); if (aide) { const a = document.createElement('div'); a.className = 'aide'; a.id = id + 'a'; a.textContent = aide; row.append(a); }
  row.set = set; return row;
}
function liste(cont, items, courant, onPick) {
  cont.innerHTML = '';
  items.forEach(([id, nom, desc]) => {
    if (id === '#') { const g = document.createElement('div'); g.className = 'grp'; g.innerHTML = '<b></b><span></span>'; g.firstChild.textContent = nom; g.lastChild.textContent = desc; cont.append(g); return; }
    const b = document.createElement('button'); b.type = 'button'; b.className = 'opt'; b.dataset.id = id; b.setAttribute('aria-pressed', id === courant);
    b.innerHTML = '<b></b><span></span>'; b.firstChild.textContent = nom; b.lastChild.textContent = desc;
    b.onclick = () => { $$('.opt', cont).forEach(x => x.setAttribute('aria-pressed', x === b)); onPick(id); garde(); }; cont.append(b); });
}
function niveau(id, cle) {
  const inp = $('#' + id), out = $('#' + id + 'o'), show = () => { const v = S.lv[cle]; out.textContent = (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v).toFixed(1).replace('.', ',').replace(',0', '') + ' dB'; inp.style.setProperty('--v', (inp.value - inp.min) / (inp.max - inp.min) * 100 + '%'); };
  inp.value = S.lv[cle]; show(); inp.addEventListener('input', () => { S.lv[cle] = +inp.value; show(); mix(); garde(); });
}
function reglagesMoteur() {
  const base = cfgMode(S.eng, S.mode), cont = $('#slE'); cont.innerHTML = '';
  R_MOT.forEach(([k, l, a, mn, mx, log, u]) => { const v0 = S.eo[k] ?? (k === 'outLP' ? (base.outLP || 9000) : base[k]);
    cont.append(curseur({ id: 'e_' + k, label: l, aide: a, min: mn, max: mx, log, unite: u, valeur: v0, onInput: v => { S.eo[k] = v; if (cfgView) cfgView[k] = v; send({ cfg: { [k]: v } }); garde(); } })); });
  const h = document.createElement('h4'); h.textContent = 'Usure'; cont.append(h);
  cont.append(curseur({ id: 'e_sante', label: 'Santé du moteur', aide: 'Du moteur rodé à l\'agonie : ratés, cliquetis, coup de bielle.', min: 0, max: 1, valeur: S.health, onInput: v => { S.health = v; garde(); } }));
  $$('#modeE .chip').forEach(b => { const on = b.dataset.mode === S.mode; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
  $('#modeNote').textContent = S.mode === 'meca' ? 'Le même moteur, en mécanique : culbuteurs, claquement, détonation franche, échappement ouvert.' : 'La Bûche avec sa touche jeu vidéo : un halo dans la tonalité du morceau, des notes à chaque marche de régime, un coup de poing au gaz.';
}
function appliqueMode(mode) {
  S.mode = mode; S.eo = {}; cfgView = cfgMode(S.eng, mode); if (sim) sim.cfg = cfgView; reglagesMoteur();
  const cy = cfgMode(S.eng, 'cyber'), retour = {}; Object.keys(MECA).forEach(k => { retour[k] = cy[k]; }); retour.outLP = cy.outLP || 9000;       /* retour au cyber : on rend à la fiche ce que le mécanique avait changé */
  send({ cfg: mode === 'meca' ? MECA : JSON.parse(JSON.stringify(retour)) }); garde();
}
$$('#modeE .chip').forEach(b => { b.onclick = () => appliqueMode(b.dataset.mode); });
/* ======================= LES RÉGLAGES DU NITRO (rapides dans la tranche, détaillés dans l'atelier : les mêmes curseurs restent synchronisés) ======================= */
const regN = {};
const enreg = (k, row) => { (regN[k] = regN[k] || []).push(row); }, syncN = (k, v, from) => { (regN[k] || []).forEach(r => { if (r !== from) r.set(v); }); };
function defNitro(kind, preset) {
  if (kind === 'braise') return Object.assign({}, NB.BRAISE_DEF, NB.PRESETS[preset]);
  if (kind === 'fusee') return Object.assign({}, NF.FUSEE_DEF, NF.FLAMMES[preset] || NF.FUSEE_PRESETS[preset]);
  if (kind === 'physique') { const Pp = NP.PHYSIQUE_PRESETS[preset] || {}, o = Object.assign({}, NP.PHYSIQUE_DEF, Pp), m = Object.assign({}, NP.PHYSIQUE_MEC, Pp.mec); for (const k in m) o['m_' + k] = m[k]; return o; }
  if (kind === 'hybride') { const H = NH.HYBRIDE_PRESETS[preset], o = Object.assign({}, NM.MATIERE_DEF, H.m, { mixM: H.mixM, mixF: H.mixF }), f = Object.assign({}, NF.FUSEE_DEF, H.f, NH.SANS_NOTE); for (const k in f) o['f_' + k] = f[k]; return o; }
  return Object.assign({}, NM.MATIERE_DEF, NM.PRESETS[preset]);
}
const prefixe = (groupes, p) => groupes.map(([t, o, items]) => [t, o, items.map(([k, ...r]) => [p + k, ...r])]);
const AV_MAT = [
  ['Corps', true, [['corpsG', 'Niveau du corps', 0, 1], ['subG', 'Sous-octave', 0, 1.2], ['quinteG', 'Quinte, l\'accord de puissance', 0, .5], ['detune', 'Largeur de l\'accord', 0, .012, 0, 'cents'], ['larg', 'Ouverture stéréo', 0, 1],
    ['driveLo', 'Saturation au repos', .5, 4, 0, 'num'], ['driveHi', 'Saturation à pleine pression', 1, 6, 0, 'num'], ['gorgeDry', 'Part sans la gorge du pot', 0, 1]]],
  ['Râpe', true, [['rapeG', 'Niveau de la râpe', 0, 1.4], ['rapeDecay', 'Brièveté de chaque coup', 2, 14, 0, 'num'], ['rapeJit', 'Irrégularité entre cylindres', 0, 1], ['rapeLo', 'Fréquence basse', 300, 1500, 1, 'Hz'], ['rapeHi', 'Fréquence haute', 900, 3500, 1, 'Hz'], ['rapeQ', 'Étroitesse', .4, 2, 0, 'num']]],
  ['Poing, plainte, grondement', false, [['poingG', 'Poing grave', 0, 1], ['poingSat', 'Dureté du poing', .5, 5, 0, 'num'], ['tirageG', 'Plainte', 0, .5], ['tirageFold', 'La plainte s\'efface vers', 80, 400, 1, 'Hz'], ['grondeG', 'Grondement', 0, .7], ['grondeSat', 'Saturation du grondement', .5, 4, 0, 'num']]],
  ['Accord avec le moteur', false, [['flick', 'Respiration de la flamme', 0, .6]]],
  ['Dynamique', false, [['attack', 'Attaque', .02, .6, 1, 's'], ['release', 'Relâchement', .1, 1.5, 1, 's'], ['spool', 'Montée en pression', .1, 1.5, 1, 's'], ['fwoomG', 'Allumage', 0, 1], ['soupirG', 'Extinction', 0, .6]]],
  ['Sortie', false, [['outLP', 'Brillance maximale', 1200, 6000, 1, 'Hz']]]];
const AV_BRA = [
  ['Corps', true, [['corpsG', 'Niveau', 0, .9], ['corpsW', 'Largeur d\'impulsion', .1, .6, 0, 'num'], ['corpsSat', 'Saturation', .8, 4, 0, 'num'], ['corpsLP', 'Brillance du corps', 700, 3500, 1, 'Hz'], ['subG', 'Sous-grondement', 0, 1.4], ['quinteG', 'Quinte', 0, .4]]],
  ['Ronce', true, [['ronceG', 'Niveau', 0, .8], ['ronceF', 'Fréquence', 250, 1200, 1, 'Hz'], ['ronceTau', 'Brièveté', .002, .02, 1, 's']]],
  ['Grondement', false, [['grondeG', 'Niveau', 0, .4], ['grondeF', 'Hauteur', 28, 70, 1, 'Hz'], ['grondeVoix', 'Voix qui glisse', 0, 1], ['grondeSat', 'Saturation', .8, 3, 0, 'num']]],
  ['Braise et souffle', false, [['braiseG', 'Braise', 0, .8], ['braiseF', 'Fréquence de la braise', 100, 320, 1, 'Hz'], ['souffleG', 'Souffle', 0, .4], ['flammeG', 'Bruit de flamme', 0, 1]]],
  ['Dynamique', false, [['attack', 'Attaque', .05, .6, 1, 's'], ['release', 'Relâchement', .2, 1.5, 1, 's'], ['spool', 'Montée en pression', .2, 1.5, 1, 's'], ['fwoomG', 'Allumage', 0, 1], ['soupirG', 'Extinction', 0, .6]]],
  ['Sortie', false, [['outLP', 'Brillance maximale', 1500, 6000, 1, 'Hz']]]];
const AV_FLA = [
  ['Flamme', true, [['flameG', 'Corps de flamme', 0, 1.8], ['flameF', 'Hauteur de la flamme', 400, 1500, 1, 'Hz'], ['flameLo', 'Coupe-bas', 40, 200, 1, 'Hz'], ['flameFlut', 'Ondulation', .2, 2, 0, 'num'], ['lickRate', 'Fréquence des langues', .3, 4, 0, 'num'], ['lickG', 'Force des langues', 0, 1.6], ['drift', 'Dérive d\'une oreille à l\'autre', 0, 1]]],
  ['Air et chambre', false, [['airG', 'Air chaud', 0, .5], ['airF', 'Brillance de l\'air', 800, 3500, 1, 'Hz'], ['airLo', 'Coupe-bas de l\'air', 200, 1200, 1, 'Hz'], ['bloom', 'Chambre', 0, .6]]],
  ['Combustion', false, [['chugR0', 'Cadence des coups au repos', 4, 40, 0, 'num'], ['chugR1', 'Cadence à pleine pression', 8, 60, 0, 'num'], ['chugJit', 'Irrégularité', 0, .6], ['chugDepth', 'Profondeur', 0, 1], ['chugTau', 'Brièveté', .005, .06, 1, 's'], ['misfire', 'Ratés', 0, .4], ['biteK', 'Morsure', 0, 2.5, 0, 'num']]],
  ['Roulement et allumage', false, [['roarG', 'Roulement grave', 0, .6], ['roarF', 'Hauteur du roulement', 300, 1200, 1, 'Hz'], ['sweepG', 'Note d\'allumage', 0, 1], ['thumpG', 'Coup de poitrine', 0, 1]]]];
const AV_FUS = AV_FLA.concat([
  ['Note de la flamme', false, [['coreG', 'Niveau', 0, .6], ['coreF0', 'Hauteur au repos', 50, 350, 1, 'Hz'], ['coreF1', 'Hauteur à pleine pression', 100, 900, 1, 'Hz'], ['coreW', 'Largeur', .1, .5, 0, 'num'], ['coreLP', 'Brillance', 700, 3000, 1, 'Hz'], ['subG', 'Sous-grave', 0, .7], ['growlG', 'Grondement', 0, .4]]],
  ['Dynamique', false, [['attack', 'Attaque', .05, .6, 1, 's'], ['release', 'Relâchement', .2, 1.5, 1, 's'], ['spool', 'Montée en pression', .2, 1.5, 1, 's'], ['outLP', 'Brillance maximale', 1500, 4500, 1, 'Hz']]]]);
const AV_HYB = [['Équilibre', true, [['mixM', 'Voix mécanique', 0, 1.4, 0, 'pct'], ['mixF', 'Flamme', 0, 1.4, 0, 'pct']]]]
  .concat(AV_MAT.filter(g => g[0] !== 'Sortie').map(([t, o, it]) => ['Mécanique : ' + t.toLowerCase(), false, it]), [['Mécanique : sortie', false, AV_MAT[AV_MAT.length - 1][2]]], prefixe(AV_FLA, 'f_').map(([t, o, it]) => ['Flamme : ' + t.toLowerCase(), false, it]));
const AV_PHY = [
  ['Équilibre', true, [['mixM', 'Voix mécanique', 0, 1.4, 0, 'pct'], ['mixF', 'Flamme', 0, 1.5, 0, 'pct']]],
  ['Flamme dans le tuyau', true, [['roarG', 'Rugissement', 0, .8], ['roarLo', 'Plafond du rugissement, appui léger', 80, 400, 1, 'Hz'], ['roarHi', 'Plafond du rugissement, appui plein', 200, 900, 1, 'Hz'], ['turbS', 'Tourbillons', 0, 1, 0, 'num'],
    ['combMix', 'Résonance du tuyau', 0, 1, 0, 'pct'], ['combFb', 'Longueur de la résonance', .3, .9, 0, 'num'], ['combDamp', 'Perte dans le tuyau', .2, .85, 0, 'num']]],
  ['Bouffées, cylindre par cylindre', false, [['burstG', 'Force', 0, 1.6], ['burstP0', 'Probabilité au repos', 0, .1, 0, 'num'], ['burstP1', 'Probabilité à pleine pression', 0, 1, 0, 'num'], ['burstLo', 'Fréquence basse', 100, 400, 1, 'Hz'], ['burstHi', 'Fréquence haute', 300, 1200, 1, 'Hz'], ['ncyl', 'Cylindres', 2, 16, 0, 'num']]],
  ['Répliques après le lâcher', false, [['replG', 'Force', 0, 1], ['replTau', 'Durée', .4, 3, 0, 's'], ['replRate', 'Densité', 4, 50, 0, 'num']]],
  ['Événements mécaniques', false, [['ticG', 'Tics de culbuteur', 0, .4], ['ticP', 'Probabilité des tics', 0, 1, 0, 'num'], ['clickG', 'Clic du solénoïde', 0, .4], ['whumpG', 'Whump à l\'allumage', 0, .8], ['purgeG', 'Purge au lâcher', 0, .8], ['hoquet', 'Hoquet au changement de rapport', .02, .2, 0, 's']]],
  ['Voix mécanique', false, [['m_corpsG', 'Corps', 0, 1], ['m_subG', 'Sous-octave', 0, 1.2], ['m_rapeG', 'Râpe', 0, 1.6], ['m_rapeHi', 'Râpe : fréquence haute', 900, 3500, 1, 'Hz'], ['m_poingG', 'Poing grave', 0, 1], ['m_tirageG', 'Plainte', 0, .5], ['m_larg', 'Ouverture stéréo', 0, 1], ['m_driveHi', 'Saturation', 1, 6, 0, 'num']]],
  ['Garde-oreilles', true, [['aiguMax', 'Seuil du limiteur 2-6 kHz', .005, .1, 1, 'num'], ['aiguRatio', 'Sévérité', 1, 8, 0, 'num'], ['outLP', 'Coupure à 24 dB par octave', 1500, 5000, 1, 'Hz']]],
  ['Dynamique', false, [['attack', 'Attaque', .02, .4, 1, 's'], ['release', 'Relâchement', .1, 1.2, 1, 's'], ['spool', 'Montée en pression', .1, 1.2, 1, 's']]]];
const groupesDe = kind => kind === 'physique' ? AV_PHY : kind === 'braise' ? AV_BRA : kind === 'fusee' ? AV_FUS : kind === 'hybride' ? AV_HYB : AV_MAT;

function reglagesNitro() {
  const [kind, preset] = S.nit.split(':'), def = defNitro(kind, preset), cont = $('#slN'); cont.innerHTML = ''; Object.keys(regN).forEach(k => delete regN[k]);
  (R_NIT[kind] || []).forEach(([k, l, a, mn, mx, log, u]) => { const row = curseur({ id: 'n_' + k, label: l, aide: a, min: mn, max: mx, log, unite: u, valeur: S.no[k] ?? def[k] ?? mn, onInput: v => { S.no[k] = v; send({ nitP: { [k]: v } }); syncN(k, v, row); garde(); } }); enreg(k, row); cont.append(row); });
  reglagesAvances(); couches();
}
function reglagesAvances() {
  const [kind, preset] = S.nit.split(':'), def = defNitro(kind, preset), cont = $('#adv'); cont.innerHTML = '';
  groupesDe(kind).forEach(([titre, ouvert, items]) => {
    const d = document.createElement('details'); d.open = ouvert; d.innerHTML = '<summary></summary><div class="regl"></div>'; d.firstChild.textContent = titre; const box = d.lastChild;
    if (titre === 'Accord avec le moteur' || titre === 'Mécanique : accord avec le moteur') {
      const o = document.createElement('div'); o.className = 'octs'; o.innerHTML = '<span>Octave du corps</span>'; const cur = S.no.oct ?? def.oct ?? 1;
      [[.5, '½'], [1, '×1'], [2, '×2']].forEach(([v, t]) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'chip' + (v === cur ? ' on' : ''); b.textContent = t; b.setAttribute('aria-pressed', v === cur);
        b.onclick = () => { S.no.oct = v; send({ nitP: { oct: v } }); $$('.chip', o).forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b); }); garde(); }; o.append(b); });
      const a = document.createElement('div'); a.className = 'aide'; a.textContent = 'Le corps une octave plus bas ou plus haut : toujours une harmonique du moteur.'; o.append(a); box.append(o);
    }
    items.forEach(([k, l, mn, mx, log, u, a]) => { const row = curseur({ id: 'a_' + k, label: l, aide: a, min: mn, max: mx, log, unite: u, valeur: S.no[k] ?? def[k] ?? mn, onInput: v => { S.no[k] = v; send({ nitP: { [k]: v } }); syncN(k, v, row); garde(); } }); enreg(k, row); box.append(row); });
    cont.append(d);
  });
}
/* ----- les couches : niveau, solo, muet ----- */
const COUCHES = {
  matiere: [['corps', 'Corps'], ['rape', 'Râpe'], ['poing', 'Poing grave'], ['tirage', 'Plainte'], ['gronde', 'Grondement'], ['fwoom', 'Allumage'], ['soupir', 'Extinction']],
  braise: [['corps', 'Corps'], ['ronce', 'Ronce'], ['quinte', 'Quinte'], ['gronde', 'Grondement'], ['braise', 'Braise'], ['souffle', 'Souffle'], ['flamme', 'Flamme'], ['fwoom', 'Allumage'], ['soupir', 'Extinction']],
  fusee: [['core', 'Note'], ['sub', 'Sous-grave'], ['growl', 'Grondement'], ['roar', 'Roulement'], ['shock', 'Chocs'], ['sweep', 'Allumage'], ['drop', 'Chute']],
  physique: [['mec', 'Voix mécanique'], ['jet', 'Coups de flamme'], ['roar', 'Rugissement'], ['comb', 'Résonance du tuyau'], ['burst', 'Bouffées'], ['tic', 'Tics de culbuteur'], ['click', 'Clic du solénoïde'], ['whump', 'Whump'], ['clac', 'Clac de soupape'], ['purge', 'Purge']],
  hybride: [['@mixM', 'Voix mécanique'], ['@mixF', 'Flamme entière'], ['corps', 'Mécanique : corps'], ['rape', 'Mécanique : râpe'], ['poing', 'Mécanique : poing'], ['tirage', 'Mécanique : plainte'], ['gronde', 'Mécanique : grondement'], ['f_roar', 'Flamme : roulement'], ['f_sweep', 'Flamme : allumage']] };
const niv = {}, solo = {}, mute = {};
function appliqueCouches() {
  const [kind, preset] = S.nit.split(':'), liste = COUCHES[kind] || [], def = defNitro(kind, preset), anySolo = liste.some(([k]) => solo[k]), G = {}, P = {};
  /* le solo d'une couche mécanique garde la voix mécanique (et coupe la flamme) ; le solo d'une couche de flamme fait l'inverse ; les deux curseurs d'équilibre (@) suivent */
  const soloMeca = liste.some(([k]) => solo[k] && k[0] !== '@' && k.indexOf('f_') !== 0), soloFlam = liste.some(([k]) => solo[k] && k.indexOf('f_') === 0);
  liste.forEach(([k]) => { const garde = k === '@mixM' ? soloMeca : k === '@mixF' ? soloFlam : false, on = !mute[k] && (!anySolo || solo[k] || garde), g = on ? dbl(niv[k] ?? 0) : 0, row = $('[data-couche="' + k + '"]'); if (row) row.classList.toggle('off', !on);
    if (k[0] === '@') P[k.slice(1)] = g * (S.no[k.slice(1)] ?? def[k.slice(1)] ?? 1); else G[k] = g; });
  send({ nitG: G }); if (Object.keys(P).length) send({ nitP: P });
}
function couches() {
  const [kind] = S.nit.split(':'), cont = $('#couches'); cont.innerHTML = ''; [niv, solo, mute].forEach(o => Object.keys(o).forEach(k => delete o[k]));
  (COUCHES[kind] || []).forEach(([k, nom]) => {
    const row = document.createElement('div'); row.className = 'couche'; row.dataset.couche = k;
    row.innerHTML = '<span class="nom"></span><input type="range" min="-40" max="6" step=".5" value="0"><button class="mini s" type="button" aria-pressed="false" title="Solo : écouter seule">S</button><button class="mini m" type="button" aria-pressed="false" title="Muet : retirer">M</button>';
    row.firstChild.textContent = nom; const inp = row.children[1], bs = row.children[2], bm = row.children[3]; inp.setAttribute('aria-label', 'Niveau : ' + nom); inp.style.setProperty('--v', (0 + 40) / 46 * 100 + '%');
    inp.addEventListener('input', () => { niv[k] = +inp.value; inp.style.setProperty('--v', (inp.value - inp.min) / (inp.max - inp.min) * 100 + '%'); appliqueCouches(); });
    bs.onclick = () => { solo[k] = !solo[k]; bs.setAttribute('aria-pressed', !!solo[k]); appliqueCouches(); }; bm.onclick = () => { mute[k] = !mute[k]; bm.setAttribute('aria-pressed', !!mute[k]); appliqueCouches(); };
    cont.append(row);
  });
  if (ac) appliqueCouches();
}
/* ----- le banc d'essai ----- */
function banc() {
  const c = $('#slBanc'); c.innerHTML = '';
  c.append(curseur({ id: 'b_pn', label: 'Appui du nitro', aide: 'À quel point tu appuies. En bas : le ronron mécanique. En haut : la flamme grande ouverte. Sur le pad, glisse le doigt vers le haut pour appuyer plus fort.', min: .05, max: 1, unite: 'pct', valeur: S.pN, onInput: v => { S.pN = v; garde(); } }));
  c.append(curseur({ id: 'b_pg', label: 'Appui du gaz', aide: 'La pédale, de l\'accélération douce à la pleine charge.', min: .05, max: 1, unite: 'pct', valeur: S.pG, onInput: v => { S.pG = v; garde(); } }));
  c.append(curseur({ id: 'b_fx', label: 'Régime fixe', aide: 'Fige le moteur sur un régime pour juger le nitro. Tout à gauche : régime libre.', min: 0, max: 6500, unite: 'rpm', valeur: T.fixe, onInput: v => { T.fixe = v < 600 ? 0 : v; } }));
}
const bascule = (id, cle) => { const b = $(id); b.onclick = async () => { await demarreAudio(); T[cle] = !T[cle]; b.classList.toggle('on', T[cle]); b.setAttribute('aria-pressed', T[cle]); }; };
bascule('#bMaintN', 'maintN'); bascule('#bMaintG', 'maintG');
$('#bIgnite').onclick = async () => { await demarreAudio(); send({ nitIgnite: 1 }); };
banc();
function reglagesPneus() {
  const def = window.PneusDouxApi.PNEUS_DEF, cont = $('#slT'); cont.innerHTML = '';
  R_TYR.forEach(([k, l, a, mn, mx]) => cont.append(curseur({ id: 't_' + k, label: l, aide: a, min: mn, max: mx, valeur: S.to[k] ?? def[k], onInput: v => { S.to[k] = v; send({ tyrP: { [k]: v } }); garde(); } })));
}
function reglagesMusique() {
  const cont = $('#slM'); cont.innerHTML = '';
  cont.append(curseur({ id: 'm_carve', label: 'Creux sous le moteur', aide: 'Fait de la place à la voix du moteur dans le médium de la musique.', min: 0, max: 8, valeur: S.carve, onInput: v => { S.carve = v; mix(); garde(); } }));
  const bar = document.createElement('div'); bar.className = 'inter';
  const ac1 = document.createElement('button'); ac1.type = 'button'; ac1.className = 'chip' + (S.accord ? ' on' : ''); ac1.textContent = 'Accorder le moteur au morceau'; ac1.title = 'Le halo du moteur (la touche jeu vidéo) joue dans la tonalité du morceau.'; ac1.setAttribute('aria-pressed', S.accord);
  ac1.onclick = () => { S.accord = !S.accord; ac1.classList.toggle('on', S.accord); ac1.setAttribute('aria-pressed', S.accord); accorde(); garde(); };
  const ph = document.createElement('button'); ph.type = 'button'; ph.className = 'chip' + (S.phone ? ' on' : ''); ph.textContent = 'Écouter comme sur un téléphone'; ph.setAttribute('aria-pressed', S.phone);
  ph.onclick = () => { S.phone = !S.phone; ph.classList.toggle('on', S.phone); ph.setAttribute('aria-pressed', S.phone); mix(); garde(); };
  bar.append(ac1, ph); cont.append(bar);
}
function choisitMoteur(id) {
  S.eng = id; S.eo = {}; cfgView = cfgMode(id, S.mode); if (sim) sim.cfg = cfgView; reglagesMoteur(); send({ eng: id }); setTimeout(() => { send({ c: { eng: { health: S.health } } }); if (S.mode === 'meca') send({ cfg: MECA }); accorde(); mix(); }, 60);
}
function applyEngOv() { Object.assign(cfgView, S.eo); }
function choisitNitro(id) { S.nit = id; S.no = {}; const [kind, preset] = id.split(':'); send({ nitro: { kind, preset } }); reglagesNitro(); mix(); }
liste($('#lstE'), MOTEURS, S.eng, choisitMoteur);
liste($('#lstN'), NITROS, S.nit, choisitNitro);
liste($('#lstM'), [['', 'Sans musique', 'Le moteur, le nitro et les pneus seuls.'], ...MORCEAUX.map(m => [m.id, m.titre, m.ton + ', ' + m.bpm + ' battements par minute'])], S.mus, id => { joue(id); mix(); });
niveau('lvE', 'eng'); niveau('lvN', 'nit'); niveau('lvT', 'tyr'); niveau('lvM', 'mus');
reglagesMoteur(); reglagesNitro(); reglagesPneus(); reglagesMusique();
$('#bTyr').onclick = () => { S.tyrOn = !S.tyrOn; $('#bTyr').classList.toggle('on', S.tyrOn); $('#bTyr').setAttribute('aria-pressed', S.tyrOn); $('#bTyr').textContent = S.tyrOn ? 'Pneus allumés' : 'Pneus éteints'; mix(); garde(); };
$('#bTyr').classList.toggle('on', S.tyrOn); $('#bTyr').textContent = S.tyrOn ? 'Pneus allumés' : 'Pneus éteints';
const vol = $('#vol'); vol.value = S.vol; const volStyle = () => vol.style.setProperty('--v', (vol.value - vol.min) / (vol.max - vol.min) * 100 + '%'); volStyle();
vol.addEventListener('input', () => { S.vol = +vol.value; volStyle(); mix(); garde(); });
const bPart = $('#bPartage'), bPart0 = bPart.innerHTML;
bPart.onclick = async () => { garde(); await new Promise(r => setTimeout(r, 450)); try { await navigator.clipboard.writeText(location.href); bPart.textContent = 'Lien copié'; } catch (e) { bPart.textContent = 'Copie le lien dans la barre d\'adresse'; } setTimeout(() => bPart.innerHTML = bPart0, 2200); };

/* ======================= LE DESSIN ======================= */
const scopeN = $('#scopeN'), sn = scopeN.getContext('2d'), wf = $('#wf'), wx = wf.getContext('2d'), comb = $('#comb'), cx = comb.getContext('2d'), tach = $('#tach'), tx = tach.getContext('2d'), spec = $('#spec'), sx = spec.getContext('2d');
const DPR = Math.min(2, window.devicePixelRatio || 1), FMIN = 40, FMAX = 9000;
let W = 0, H = 0, rowLo = null, rowHi = null, rowC = null, lut = null, bytes = null, fake = new Uint8Array(2048);
function tailles() {
  const r = wf.getBoundingClientRect(); W = Math.max(2, Math.round(r.width * DPR)); H = Math.max(2, Math.round(r.height * DPR));
  wf.width = W; wf.height = H; comb.width = Math.round(comb.clientWidth * DPR); comb.height = H;
  const t = tach.getBoundingClientRect(); tach.width = Math.round(t.width * DPR); tach.height = Math.round(t.height * DPR);
  const s = spec.getBoundingClientRect(); spec.width = Math.round(s.width * DPR); spec.height = Math.round(s.height * DPR);
  const q = scopeN.getBoundingClientRect(); scopeN.width = Math.max(2, Math.round(q.width * DPR)); scopeN.height = Math.max(2, Math.round(q.height * DPR));
  wx.fillStyle = COULEUR.suie; wx.fillRect(0, 0, W, H); rowLo = null;
}
function palette() {                                       /* la lueur : suie → braise sombre → orange → miel → crème */
  const stops = [[0, [28, 17, 22]], [.22, [74, 22, 34]], [.45, [168, 48, 32]], [.68, [255, 138, 42]], [.86, [255, 210, 122]], [1, [255, 241, 214]]]; lut = new Uint8ClampedArray(256 * 3);
  for (let i = 0; i < 256; i++) { const v = i / 255; let k = 0; while (k < stops.length - 2 && v > stops[k + 1][0]) k++; const [a, ca] = stops[k], [b, cb] = stops[k + 1], t = clamp((v - a) / (b - a), 0, 1); for (let c = 0; c < 3; c++) lut[i * 3 + c] = ca[c] + (cb[c] - ca[c]) * t; }
}
palette();
function lignes(binHz, nb) {
  rowLo = new Uint16Array(H); rowHi = new Uint16Array(H); rowC = new Float32Array(H); const m = (FMAX / FMIN);
  for (let y = 0; y < H; y++) { const f0 = FMIN * Math.pow(m, 1 - (y + 1) / H), f1 = FMIN * Math.pow(m, 1 - y / H); rowLo[y] = clamp(Math.floor(f0 / binHz), 0, nb - 1); rowHi[y] = clamp(Math.max(rowLo[y], Math.ceil(f1 / binHz)), 0, nb - 1); rowC[y] = clamp(Math.sqrt(f0 * f1) / binHz, 0, nb - 2); }
}
function spectreFactice(t) {                               /* avant le premier clic : un moteur au ralenti dessiné, pour que la scène ne soit jamais vide */
  fake.fill(0); const f0 = 52 + 6 * Math.sin(t * .35), bin = 24000 / 2048;
  for (let k = 1; k <= 22; k++) { const c = k * f0 / bin, a = 150 * Math.pow(k, -.55) * (.75 + .25 * Math.sin(t * 1.3 + k)); for (let b = Math.floor(c) - 2; b <= Math.ceil(c) + 2; b++) if (b >= 0 && b < 2048) fake[b] = Math.max(fake[b], a * Math.exp(-Math.pow((b - c) / 1.0, 2))); }
  for (let b = 0; b < 400; b++) fake[b] = Math.max(fake[b], 14 + Math.random() * 18);
  return fake;
}
function cascade(data, binHz) {
  const dx = Math.max(1, Math.round(2 * DPR)); if (!rowLo) lignes(binHz, data.length);
  wx.drawImage(wf, dx, 0, W - dx, H, 0, 0, W - dx, H);
  const img = wx.createImageData(dx, H), px = img.data;
  for (let y = 0; y < H; y++) { let m = 0; if (rowHi[y] - rowLo[y] < 2) { const c = rowC[y], a = Math.floor(c), fr = c - a; m = data[a] * (1 - fr) + data[Math.min(data.length - 1, a + 1)] * fr; } else for (let b = rowLo[y]; b <= rowHi[y]; b++) if (data[b] > m) m = data[b];
    const v = Math.min(255, Math.round(m * 1.12)) * 3;
    for (let x = 0; x < dx; x++) { const o = (y * dx + x) * 4; px[o] = lut[v]; px[o + 1] = lut[v + 1]; px[o + 2] = lut[v + 2]; px[o + 3] = 255; } }
  wx.putImageData(img, W - dx, 0);
}
const yDeFreq = f => H * (1 - Math.log(f / FMIN) / Math.log(FMAX / FMIN));
function peigne(f0, actif) {                               /* les repères k × f0, sur le bord droit : les harmoniques du moteur, là où le nitro doit tomber */
  cx.clearRect(0, 0, comb.width, comb.height); if (!(f0 > 15)) return; cx.font = (11 * DPR) + 'px Hanken Grotesk, sans-serif'; cx.textAlign = 'right';
  let yEtiq = -99;
  for (let k = 1; k * f0 < FMAX; k++) { const y = yDeFreq(k * f0); if (y < 0 || y > H) continue; cx.strokeStyle = actif ? 'rgba(255,177,92,.9)' : 'rgba(255,177,92,.45)'; cx.lineWidth = DPR; cx.beginPath(); cx.moveTo(comb.width - 26 * DPR, y); cx.lineTo(comb.width, y); cx.stroke();
    if (k <= 12 && Math.abs(y - yEtiq) > 13 * DPR) { yEtiq = y; cx.fillStyle = 'rgba(246,233,216,.85)'; cx.fillText('×' + k, comb.width - 32 * DPR, y + 4 * DPR); } }
}
function compteur(limit, rpm, f0, etat) {
  const w = tach.width, h = tach.height; tx.clearRect(0, 0, w, h); const cxp = w / 2, cyp = h * .66, r = h * .56, a0 = Math.PI * .9, a1 = Math.PI * 2.1, max = limit * 1.08, ang = v => a0 + (a1 - a0) * clamp(v / max, 0, 1);
  tx.lineCap = 'round'; tx.lineWidth = 14 * DPR; tx.strokeStyle = '#2f222b'; tx.beginPath(); tx.arc(cxp, cyp, r, a0, a1); tx.stroke();
  tx.strokeStyle = 'rgba(255,77,109,.75)'; tx.beginPath(); tx.arc(cxp, cyp, r, ang(cfgView.redline), a1); tx.stroke();
  tx.strokeStyle = COULEUR.miel; tx.globalAlpha = .9; tx.beginPath(); tx.arc(cxp, cyp, r, a0, ang(rpm)); tx.stroke(); tx.globalAlpha = 1;
  tx.fillStyle = '#b9a3ab'; tx.font = (12 * DPR) + 'px Hanken Grotesk, sans-serif'; tx.textAlign = 'center'; tx.textBaseline = 'middle';
  for (let k = 0; k * 1000 <= max; k++) { const a = ang(k * 1000), rr = r + 20 * DPR; tx.fillText(String(k), cxp + Math.cos(a) * rr, cyp + Math.sin(a) * rr); }
}
function spectres() {
  const w = spec.width, h = spec.height; sx.clearRect(0, 0, w, h); sx.strokeStyle = 'rgba(185,163,171,.14)'; sx.lineWidth = DPR; sx.fillStyle = 'rgba(185,163,171,.7)'; sx.font = (11 * DPR) + 'px Hanken Grotesk, sans-serif'; sx.textAlign = 'center';
  [50, 100, 200, 500, 1000, 2000, 5000].forEach(f => { const x = w * Math.log(f / 40) / Math.log(8000 / 40); sx.beginPath(); sx.moveTo(x, 0); sx.lineTo(x, h - 16 * DPR); sx.stroke(); sx.fillText(f >= 1000 ? f / 1000 + ' k' : f, x, h - 3 * DPR); });
  const courbes = [['M', COULEUR.lilas], ['T', COULEUR.tisane], ['E', COULEUR.miel], ['N', COULEUR.braise]];
  courbes.forEach(([n, col]) => { const a = an[n]; if (!a) return; const buf = a._b || (a._b = new Float32Array(a.frequencyBinCount)); a.getFloatFrequencyData(buf); const df = ac.sampleRate / a.fftSize, hh = h - 18 * DPR;
    sx.beginPath(); let first = true;
    for (let x = 0; x < w; x += 2 * DPR) { const f = 40 * Math.pow(8000 / 40, x / w), lo = f * .96 / df, hi = f * 1.04 / df; let m = -120;
      if (hi - lo < 1) { const a = Math.floor(f / df), fr = f / df - a; m = buf[a] * (1 - fr) + buf[Math.min(buf.length - 1, a + 1)] * fr; } else for (let k = Math.max(1, Math.round(lo)); k <= Math.min(buf.length - 1, Math.round(hi)); k++) if (buf[k] > m) m = buf[k];
      const y = hh * (1 - clamp((m + 100) / 70, 0, 1)); if (first) { sx.moveTo(x, y); first = false; } else sx.lineTo(x, y); }
    sx.strokeStyle = col; sx.lineWidth = 1.6 * DPR; sx.stroke(); sx.lineTo(w, hh); sx.lineTo(0, hh); sx.closePath(); sx.globalAlpha = .12; sx.fillStyle = col; sx.fill(); sx.globalAlpha = 1; });
}
function centroide(a) {                                  /* le centre de gravité du spectre 100 Hz-8 kHz (Hz) : la brillance */
  const buf = a._d || (a._d = new Float32Array(a.frequencyBinCount)); a.getFloatFrequencyData(buf); const df = ac.sampleRate / a.fftSize; let t = 0, c = 0;
  for (let k = Math.ceil(100 / df); k < Math.floor(8000 / df); k++) { const e = Math.pow(10, buf[k] / 10); t += e; c += e * k * df; } return t > 1e-14 ? c / t : 0;
}
function scopeNitro(f0) {                                 /* le nitro SEUL (rose), le moteur (miel) et, en filets, les harmoniques du moteur : c'est là que le nitro doit tomber */
  const w = scopeN.width, h = scopeN.height, hh = h - 18 * DPR; sn.clearRect(0, 0, w, h); sn.font = (11 * DPR) + 'px Hanken Grotesk, sans-serif'; sn.textAlign = 'center';
  const X = f => w * Math.log(f / 40) / Math.log(6000 / 40);
  sn.strokeStyle = 'rgba(185,163,171,.12)'; sn.fillStyle = 'rgba(185,163,171,.7)'; sn.lineWidth = DPR;
  [50, 100, 200, 500, 1000, 2000, 5000].forEach(f => { sn.beginPath(); sn.moveTo(X(f), 0); sn.lineTo(X(f), hh); sn.stroke(); sn.fillText(f >= 1000 ? f / 1000 + ' k' : f, X(f), h - 3 * DPR); });
  let xEt = -99; if (f0 > 15) for (let k = 1; k * f0 < 6000; k++) { const x = X(k * f0); sn.strokeStyle = 'rgba(246,233,216,.28)'; sn.lineWidth = DPR; sn.beginPath(); sn.moveTo(x, 0); sn.lineTo(x, hh); sn.stroke(); if (k <= 12 && x - xEt > 24 * DPR) { xEt = x; sn.fillStyle = 'rgba(246,233,216,.8)'; sn.fillText('×' + k, x, 11 * DPR); } }
  [['E', COULEUR.miel, false], ['N', COULEUR.braise, true]].forEach(([n, col, fill]) => { const a = an[n]; if (!a) return; const buf = a._b || (a._b = new Float32Array(a.frequencyBinCount)); a.getFloatFrequencyData(buf); const df = ac.sampleRate / a.fftSize;
    sn.beginPath(); let first = true;
    for (let x = 0; x < w; x += 2 * DPR) { const f = 40 * Math.pow(6000 / 40, x / w), lo = f * .97 / df, hi = f * 1.03 / df; let m = -120;
      if (hi - lo < 1) { const i = Math.floor(f / df), fr = f / df - i; m = buf[i] * (1 - fr) + buf[Math.min(buf.length - 1, i + 1)] * fr; } else for (let k = Math.max(1, Math.round(lo)); k <= Math.min(buf.length - 1, Math.round(hi)); k++) if (buf[k] > m) m = buf[k];
      const y = hh * (1 - clamp((m + 100) / 70, 0, 1)); if (first) { sn.moveTo(x, y); first = false; } else sn.lineTo(x, y); }
    sn.strokeStyle = col; sn.lineWidth = 1.6 * DPR; sn.globalAlpha = fill ? 1 : .7; sn.stroke();
    if (fill) { sn.lineTo(w, hh); sn.lineTo(0, hh); sn.closePath(); sn.globalAlpha = .18; sn.fillStyle = col; sn.fill(); } sn.globalAlpha = 1; });
}
let lockEma = 0, lockT = 0, lockF0 = 0, modeReel = false, cenT = 0, cnE = 0, cmE = 0;
function accrochage(f0) {                                  /* part de l'énergie 80 Hz-3 kHz du nitro qui tombe à ±3 % d'un multiple de la cadence du moteur */
  const a = an.N, buf = a._c || (a._c = new Float32Array(a.frequencyBinCount)); a.getFloatFrequencyData(buf); const df = ac.sampleRate / a.fftSize; let eh = 0, et = 0;
  for (let k = Math.ceil(80 / df); k < Math.floor(3000 / df); k++) { const e = Math.pow(10, buf[k] / 10); et += e; const f = k * df, h = Math.round(f / f0); if (h >= 1 && Math.abs(f - h * f0) <= .03 * h * f0) eh += e; }
  return et > 1e-14 ? eh / et : 0;
}
function vu(id, lv, gain) { const d = 20 * Math.log10(Math.max(1e-6, lv * gain)); $('#' + id).style.height = clamp((d + 48) / 36, 0, 1) * 100 + '%'; }
function frame(now) {
  try { dessine(now); } catch (e) { console.error(e); }
  requestAnimationFrame(frame);
}
function dessine(now) {
  const dt = Math.min(.05, (now - last) / 1000); last = now; conduit(dt);
  const running = pret && ac.state === 'running';
  if (running && !modeReel) { modeReel = true; rowLo = null; }
  if (running) { an.mix.getByteFrequencyData(bytes || (bytes = new Uint8Array(an.mix.frequencyBinCount))); cascade(bytes, ac.sampleRate / an.mix.fftSize); }
  else if (!REDUIT) cascade(spectreFactice(now / 1000), 24000 / 2048);
  const f0 = running ? st.f0 : 52, rpm = running ? st.rpm : 0;
  peigne(f0, running && st.nitA > .3);
  if (cfgView) { compteur(cfgView.limit, rpm, f0, st.etat); $('#tRpm').textContent = Math.round(rpm / 10) * 10; $('#tGear').textContent = T.fixe ? 'Régime fixe' : pil && pil.cond.g > 0 ? 'Rapport ' + pil.cond.g : 'Point mort'; $('#tSpd').textContent = pil ? Math.round(pil.cond.v) : 0;
    const et = { off: 'Arrêt', crank: 'Démarreur', pause: 'Il hésite', catch: 'Il prend', run: 'En marche', stall: 'Cale' }[st.etat] || 'En marche'; const sante = S.health > .8 ? '' : S.health > .55 ? ', fatigué' : S.health > .3 ? ', maltraité' : ', agonie';
    const te = $('#tEtat'); te.textContent = et + sante; te.classList.toggle('mal', S.health <= .55); }
  $('#mRpm').textContent = Math.round(rpm / 10) * 10; $('#mF0').textContent = running ? Math.round(f0) : '–';
  if (running) {
    if (now - lockT > 250) { lockT = now; const stable = lockF0 > 0 && Math.abs(f0 - lockF0) / lockF0 < .03; lockF0 = f0;   /* on ne mesure que moteur stable : pendant un passage de rapport la cadence glisse et brouille le peigne */
      if (st.nitSp > .15 && st.nitA > .2 && f0 > 25) { if (stable) { const v = accrochage(f0); lockEma = lockEma ? lockEma + (v - lockEma) * .4 : v; $('#mLock').textContent = Math.round(lockEma * 100) + ' %'; } } else if (st.nitA < .05) { $('#mLock').textContent = '–'; lockEma = 0; } }
    vu('vuE', st.lv[0], bus.E.gain.value); vu('vuN', st.lv[1], bus.N.gain.value); vu('vuT', st.lv[2], bus.T.gain.value); vu('vuM', musEl && !musEl.paused ? dbl(CIBLE + 3) : 0, 1);
    spectres(); scopeNitro(f0);
    if (now - cenT > 250) { cenT = now; const cn = centroide(an.N), cm = centroide(an.E), actif = st.nitA > .2 && st.nitSp > .15;
      if (actif && cn > 0) cnE = cnE ? cnE + (cn - cnE) * .4 : cn; else if (st.nitA < .05) cnE = 0; if (cm > 0) cmE = cmE ? cmE + (cm - cmE) * .4 : cm;
      $('#sLock').textContent = $('#mLock').textContent; $('#sBN').textContent = cnE ? Math.round(cnE) + ' Hz' : '–'; $('#sBM').textContent = cmE ? Math.round(cmE) + ' Hz' : '–';
      const [kind] = S.nit.split(':'), v = $('#verdict');
      if (!cnE || !cmE) v.textContent = 'Tiens le nitro (ou « Nitro maintenu ») pour voir la mesure.';
      else { const r = cnE / cmE; v.textContent = (r <= 1.4 ? 'Le nitro n\'est pas plus brillant que le moteur : il se fond dedans.' : r <= 2 ? 'Le nitro est un peu plus brillant que le moteur. Baisse la brillance maximale pour le fondre.' : 'Le nitro est bien plus brillant que le moteur : il risque de se détacher en grésillement.') + (kind === 'fusee' ? ' Ce nitro ne suit pas la cadence du moteur : le compteur d\'harmoniques n\'a pas de sens ici.' : ''); } }
  }
}
new ResizeObserver(() => { tailles(); }).observe(wf); new ResizeObserver(tailles).observe(tach); new ResizeObserver(tailles).observe(spec); new ResizeObserver(tailles).observe(scopeN);
window.addEventListener('load', () => { tailles(); cfgView = cfgMode(S.eng, S.mode); applyEngOv(); mkSim(); requestAnimationFrame(frame); });
window.dbgStudio = () => ({ S, st, ac: ac && ac.state, lock: lockEma, f0: st.f0 });
})();
