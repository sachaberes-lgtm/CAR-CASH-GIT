/* LE STUDIO (2026-11-09 ; Sacha : « combine simulateur moteur et simulateur nitro, mais fais ça mieux (…) le design, on en aura besoin pour un portfolio »).
   Le labo expert (../moteur-vivant/labo.html) expose une centaine de curseurs : on n'y comprend rien. Ici : quatre voix (moteur, nitro, pneus, musique), chacune avec un choix net et
   six ou sept réglages qui comptent, des niveaux calés sur ceux du jeu, et DEUX preuves visibles de l'accord entre le moteur et le nitro : le spectrogramme (les harmoniques montent
   ensemble) et le compteur « du nitro posé sur les harmoniques du moteur ».
   Audio : UN processeur (worklet-studio.js) joue moteur + nitro + pneus en trois bus ; la page mixe, mesure, dessine. Le conducteur (boîte, inertie) tourne ici, dans la page. */
(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const MV = window.MoteurVivantApi, NM = window.NitroMatiereApi, NB = window.NitroBraiseApi, CD = window.MVConducteur;
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
  ['matiere:matiere', 'Matière', 'Le moteur en plus gros : un corps saturé et une râpe sur chaque coup.'],
  ['matiere:plus', 'Matière +', 'Plus saturé, plus de plainte. Plus « injection ».'],
  ['matiere:chaud', 'Chaude', 'Presque sans râpe. Rond, plein, réconfortant.'],
  ['matiere:enfer', 'Enfer doux', 'Un grondement un peu maléfique, jouissif mais calme.'],
  ['braise:foyer', 'Foyer', 'Chaud et rond, avec un sous-grondement à l\'octave.'],
  ['braise:forge', 'Forge', 'Dense et brillant.'],
  ['braise:gouffre', 'Gouffre', 'Sombre : le grave domine.'],
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
const R_TYR = [['rouleG', 'Roulement', 'Le grave lourd de la route.', 0, .8], ['grainG', 'Gomme', 'La gomme chaude sur le sol.', 0, 1], ['chantG', 'Chant du virage', 'Deux voix étroites qui se balancent.', 0, .6], ['poidsG', 'Poids', 'Le coussin grave en virage.', 0, .6]];
const TON_HZ = { 'do': 130.81, 'do#': 138.59, 'ré': 146.83, 'ré#': 155.56, 'mi': 164.81, 'fa': 174.61, 'fa#': 185, 'sol': 196, 'sol#': 207.65, 'la♭': 207.65, 'la': 220, 'la#': 233.08, 'si': 246.94 };
const MORCEAUX = Object.values(window.PALIERS_COURSE || {}).map(p => ({ id: p.id, titre: p.titre, ton: p.ton, bpm: p.bpm, hz: TON_HZ[(p.ton.split(' ')[0] || '').replace('♯', '#')] || 220 }));

/* ======================= L'ÉTAT (et le lien qui le garde) ======================= */
const S = { eng: 'buche', nit: 'matiere:matiere', tyrOn: true, mus: '', lv: { eng: 0, nit: 0, tyr: 0, mus: 0 }, vol: 6, carve: 3.5, accord: true, phone: false, health: 1, eo: {}, no: {}, to: {} };
try { const h = location.hash.match(/s=([^&]+)/); if (h) Object.assign(S, JSON.parse(decodeURIComponent(escape(atob(h[1]))))); } catch (e) { /* lien abîmé : on repart des réglages par défaut */ }
let saveT = 0;
function garde() { clearTimeout(saveT); saveT = setTimeout(() => { try { history.replaceState(null, '', '#s=' + btoa(unescape(encodeURIComponent(JSON.stringify(S))))); } catch (e) { /* hors navigateur */ } }, 400); }

/* ======================= L'AUDIO ======================= */
let ac = null, pret = false, node = null, st = { rpm: 0, etat: 'off', f0: 0, nitA: 0, nitSp: 0, lv: [0, 0, 0] }, CAL = null;
const bus = {}, an = {}; let cfgView = null, musEl = null;
const send = o => node && node.port.postMessage(o);
async function boot() {
  if (ac) { if (ac.state === 'suspended') ac.resume(); return; }
  ac = new (window.AudioContext || window.webkitAudioContext)({ latencyHint: 'interactive' });
  const [cal, ...txt] = await Promise.all([fetch('calibration.json?v=6').then(r => r.json()), ...['moteur-vivant.js', 'nitro-braise.js', 'nitro-matiere.js', 'pneus-doux.js', 'worklet-studio.js'].map(n => fetch(DIR + n + '?v=6').then(r => r.text()))]);
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
  cfgView = new MV.MoteurVivant(S.eng, 48000, 1).cfg; applyEngOv();
  send({ ev: 'allume' }); pousseTout(); mix();
  if (S.mus) joue(S.mus);
  pret = true;
}
function pousseTout() { send({ cfg: S.eo }); send({ nitP: S.no }); send({ tyrP: S.to }); }
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
const keys = {}; let sim, pil, demo = null, gasK = 0, nitK = 0, driftK = 0, last = performance.now();
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
  gasK += ((keys.gas ? 1 : 0) - gasK) * Math.min(1, dt * (keys.gas ? 9 : 14)); nitK += ((keys.nit ? 1 : 0) - nitK) * Math.min(1, dt * 12);
  let nitro = nitK, drift = keys.drift ? .8 : 0;
  sim.cfg = C; sim.etat = st.etat; sim.rpm = sim.rpmEff = st.rpm; sim.health = S.health;
  if (demo) { demo.t += dt; nitro = demoNitro(demo.t); drift = demoDrift(demo.t); $('#demoP').style.width = (100 * demo.t / SCEN.dur) + '%'; if (demo.t > SCEN.dur) { lanceDemo(); return; } }
  else { pil.thrT = gasK; pil.brakeT = keys.brk ? 1 : 0; pil.neutralRev = false; pil.auto = true; }
  driftK += (drift - driftK) * Math.min(1, dt * 6);
  if (nitro > .1 && pil.cond.g > 0) pil.cond.v = Math.min(C.limit / (pil.cond.rat[pil.cond.g] * pil.cond.k), pil.cond.v + nitro * dt * 14);
  pil.tick(dt);
  const speed01 = Math.min(1, pil.cond.v / 260);
  if (st.etat === 'run' || demo) send({ c: { eng: { rpmCmd: sim.rpmCmd * (1 + .04 * nitro), thr: sim.thr, load: Math.min(1, sim.load + .25 * nitro), health: S.health }, nit: { nit: nitro, speed: speed01 }, tyr: { speed: speed01, drift: driftK } } });
  else send({ c: { eng: { health: S.health }, nit: { nit: 0, speed: 0 }, tyr: { speed: 0, drift: 0 } } });
}
async function demarreAudio() { await boot(); if (ac.state === 'suspended') await ac.resume(); $('#go').classList.add('on'); $('#goT').textContent = 'Éteindre le son'; $('#casque').textContent = MUET ? 'Mode muet : les écrans vivent, rien ne sort.' : 'Le moteur tourne. Maintiens Gaz, puis Nitro.'; }
function hold(btn, key) {
  const on = e => { e.preventDefault(); demarreAudio(); keys[key] = true; btn.classList.add('held'); try { btn.setPointerCapture(e.pointerId); } catch (x) { /* ok */ } }, off = () => { keys[key] = false; btn.classList.remove('held'); };
  btn.addEventListener('pointerdown', on); btn.addEventListener('pointerup', off); btn.addEventListener('pointercancel', off); btn.addEventListener('lostpointercapture', off);
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
  const fmt = v => unite === 'Hz' ? (v >= 1000 ? (v / 1000).toFixed(1).replace('.', ',') + ' kHz' : Math.round(v) + ' Hz') : Math.round(toPos(v) * 100) + ' %';
  const set = v => { inp.value = Math.round(clamp(toPos(v), 0, 1) * 1000); inp.style.setProperty('--v', inp.value / 10 + '%'); out.textContent = fmt(v); };
  inp.addEventListener('input', () => { const v = fromPos(inp.value / 1000); inp.style.setProperty('--v', inp.value / 10 + '%'); out.textContent = fmt(v); onInput(v); });
  inp.setAttribute('aria-describedby', id + 'a'); set(valeur);
  row.append(lab, out, inp); if (aide) { const a = document.createElement('div'); a.className = 'aide'; a.id = id + 'a'; a.textContent = aide; row.append(a); }
  row.set = set; return row;
}
function liste(cont, items, courant, onPick) {
  cont.innerHTML = '';
  items.forEach(([id, nom, desc]) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'opt'; b.dataset.id = id; b.setAttribute('aria-pressed', id === courant);
    b.innerHTML = '<b></b><span></span>'; b.firstChild.textContent = nom; b.lastChild.textContent = desc;
    b.onclick = () => { $$('.opt', cont).forEach(x => x.setAttribute('aria-pressed', x === b)); onPick(id); garde(); }; cont.append(b); });
}
function niveau(id, cle) {
  const inp = $('#' + id), out = $('#' + id + 'o'), show = () => { const v = S.lv[cle]; out.textContent = (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v).toFixed(1).replace('.', ',').replace(',0', '') + ' dB'; inp.style.setProperty('--v', (inp.value - inp.min) / (inp.max - inp.min) * 100 + '%'); };
  inp.value = S.lv[cle]; show(); inp.addEventListener('input', () => { S.lv[cle] = +inp.value; show(); mix(); garde(); });
}
function reglagesMoteur() {
  const base = new MV.MoteurVivant(S.eng, 48000, 1).cfg, cont = $('#slE'); cont.innerHTML = '';
  R_MOT.forEach(([k, l, a, mn, mx, log, u]) => { const v0 = S.eo[k] ?? (k === 'outLP' ? (base.outLP || 9000) : base[k]);
    cont.append(curseur({ id: 'e_' + k, label: l, aide: a, min: mn, max: mx, log, unite: u, valeur: v0, onInput: v => { S.eo[k] = v; if (cfgView) cfgView[k] = v; send({ cfg: { [k]: v } }); garde(); } })); });
  const h = document.createElement('h4'); h.textContent = 'Usure'; cont.append(h);
  const usure = curseur({ id: 'e_sante', label: 'Santé du moteur', aide: 'Du moteur rodé à l\'agonie : ratés, cliquetis, coup de bielle.', min: 0, max: 1, valeur: S.health, onInput: v => { S.health = v; garde(); } });
  cont.append(usure);
}
function reglagesNitro() {
  const [kind, preset] = S.nit.split(':'), def = Object.assign({}, kind === 'braise' ? NB.BRAISE_DEF : NM.MATIERE_DEF, (kind === 'braise' ? NB.PRESETS : NM.PRESETS)[preset]), cont = $('#slN'); cont.innerHTML = '';
  R_NIT[kind].forEach(([k, l, a, mn, mx, log, u]) => cont.append(curseur({ id: 'n_' + k, label: l, aide: a, min: mn, max: mx, log, unite: u, valeur: S.no[k] ?? def[k] ?? mn, onInput: v => { S.no[k] = v; send({ nitP: { [k]: v } }); garde(); } })));
}
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
  S.eng = id; S.eo = {}; cfgView = new MV.MoteurVivant(id, 48000, 1).cfg; if (sim) sim.cfg = cfgView; reglagesMoteur(); send({ eng: id }); setTimeout(() => { send({ c: { eng: { health: S.health } } }); accorde(); mix(); }, 60);
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
const wf = $('#wf'), wx = wf.getContext('2d'), comb = $('#comb'), cx = comb.getContext('2d'), tach = $('#tach'), tx = tach.getContext('2d'), spec = $('#spec'), sx = spec.getContext('2d');
const DPR = Math.min(2, window.devicePixelRatio || 1), FMIN = 40, FMAX = 9000;
let W = 0, H = 0, rowLo = null, rowHi = null, rowC = null, lut = null, bytes = null, fake = new Uint8Array(2048);
function tailles() {
  const r = wf.getBoundingClientRect(); W = Math.max(2, Math.round(r.width * DPR)); H = Math.max(2, Math.round(r.height * DPR));
  wf.width = W; wf.height = H; comb.width = Math.round(comb.clientWidth * DPR); comb.height = H;
  const t = tach.getBoundingClientRect(); tach.width = Math.round(t.width * DPR); tach.height = Math.round(t.height * DPR);
  const s = spec.getBoundingClientRect(); spec.width = Math.round(s.width * DPR); spec.height = Math.round(s.height * DPR);
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
let lockEma = 0, lockT = 0, lockF0 = 0, modeReel = false;
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
  if (cfgView) { compteur(cfgView.limit, rpm, f0, st.etat); $('#tRpm').textContent = Math.round(rpm / 10) * 10; $('#tGear').textContent = pil && pil.cond.g > 0 ? 'Rapport ' + pil.cond.g : 'Point mort'; $('#tSpd').textContent = pil ? Math.round(pil.cond.v) : 0;
    const et = { off: 'Arrêt', crank: 'Démarreur', pause: 'Il hésite', catch: 'Il prend', run: 'En marche', stall: 'Cale' }[st.etat] || 'En marche'; const sante = S.health > .8 ? '' : S.health > .55 ? ', fatigué' : S.health > .3 ? ', maltraité' : ', agonie';
    const te = $('#tEtat'); te.textContent = et + sante; te.classList.toggle('mal', S.health <= .55); }
  $('#mRpm').textContent = Math.round(rpm / 10) * 10; $('#mF0').textContent = running ? Math.round(f0) : '–';
  if (running) {
    if (now - lockT > 250) { lockT = now; const stable = lockF0 > 0 && Math.abs(f0 - lockF0) / lockF0 < .03; lockF0 = f0;   /* on ne mesure que moteur stable : pendant un passage de rapport la cadence glisse et brouille le peigne */
      if (st.nitSp > .45 && st.nitA > .6 && f0 > 25) { if (stable) { const v = accrochage(f0); lockEma = lockEma ? lockEma + (v - lockEma) * .4 : v; $('#mLock').textContent = Math.round(lockEma * 100) + ' %'; } } else if (st.nitA < .05) { $('#mLock').textContent = '–'; lockEma = 0; } }
    vu('vuE', st.lv[0], bus.E.gain.value); vu('vuN', st.lv[1], bus.N.gain.value); vu('vuT', st.lv[2], bus.T.gain.value); vu('vuM', musEl && !musEl.paused ? dbl(CIBLE + 3) : 0, 1);
    spectres();
  }
}
new ResizeObserver(() => { tailles(); }).observe(wf); new ResizeObserver(tailles).observe(tach); new ResizeObserver(tailles).observe(spec);
window.addEventListener('load', () => { tailles(); cfgView = new MV.MoteurVivant(S.eng, 48000, 1).cfg; applyEngOv(); mkSim(); requestAnimationFrame(frame); });
window.dbgStudio = () => ({ S, st, ac: ac && ac.state, lock: lockEma, f0: st.f0 });
})();
