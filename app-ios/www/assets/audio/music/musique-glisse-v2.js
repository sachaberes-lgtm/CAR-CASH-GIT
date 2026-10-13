// musique-glisse.js — musique adaptative du jeu, jouée en direct (Web Audio, aucun fichier audio).
//
// Utilisation :
//   import { createGlisseMusic } from './musique-glisse.js';
//   const music = createGlisseMusic();
//   music.start();                     // après un clic ou une touche du joueur (règle des navigateurs)
//   music.setTier(palier, nbPaliers);  // à chaque changement de palier (palier commence à 1)
//   music.setSpeed(0.4);               // ou directement une valeur de 0 (lent) à 1 (max)
//   music.stop();                      // pause, menu, fin de course
//
// Les changements tombent pile sur un temps : un palier qui monte joue un roulement de caisse claire,
// un palier qui descend fait plonger le son un instant. La mélodie change de niveau au début d'une mesure.

export function createGlisseMusic({ volume = 1, audioContext = null, basses = 0, sortie = 1 } = {}) {
  const VOLUME = volume;
  // (jeu, 2026-10-12) la SORTIE dans le jeu : `basses` = étagère sous 160 Hz (dB), `sortie` = gain après le compresseur — voir JMUS dans index.html
  const BASSES = basses, SORTIE = sortie;
  // === MOTEUR ===
  const BPM_MIN = 98, BPM_MAX = 112;
  const clamp = v => Math.min(1, Math.max(0, v));
  const ramp = (s, a, b) => clamp((s - a) / (b - a));

  // chaque couche : fonction vitesse -> volume (0 à 1). Les volumes changent pile sur les temps.
  const LAYERS = {
    air:     s => 1 - ramp(s, 0.45, 0.8),           // souffle ambiant qui se retire quand ça accélère
    pad:     s => 1,
    keys:    s => 1,
    vinyl:   s => 1 - 0.7 * ramp(s, 0.4, 0.8),
    shaker:  s => 1,
    rim:     s => 1 - 0.6 * ramp(s, 0.2, 0.3),
    b808:    s => 0.5 + 0.5 * ramp(s, 0.1, 0.3),
    kick:    s => ramp(s, 0.12, 0.2),
    snare:   s => ramp(s, 0.2, 0.28),
    hats:    s => ramp(s, 0.25, 0.32),
    bell:    s => ramp(s, 0.35, 0.45),
    rolls:   s => ramp(s, 0.45, 0.55),
    perc:    s => ramp(s, 0.55, 0.62),
    choir:   s => ramp(s, 0.6, 0.7),
    counter: s => ramp(s, 0.7, 0.78),
    arp:     s => ramp(s, 0.78, 0.86),
    swell:   s => ramp(s, 0.8, 0.9),
    sparkle: s => ramp(s, 0.9, 0.97),
    fills:   s => 1,
  };
  const PUMPED = ['pad', 'choir', 'swell', 'arp'];  // ce qui "respire" sur le kick quand ça s'intensifie

  // Accords en suspens : Dm11, Bbmaj7#11, Gm9, Asus4 (ne se résout jamais)
  const CHORDS = [[50, 53, 55, 60], [46, 50, 52, 57], [43, 46, 50, 57], [45, 50, 52, 57]];
  // gamme de ré (D E F G A Bb C) : toutes les notes ajoutées restent dedans
  const SCALE = new Set([2, 4, 5, 7, 9, 10, 0]);
  const inScale = m => SCALE.has(((m % 12) + 12) % 12);
  const stepScale = (m, d) => { let x = m + d; while (!inScale(x)) x += d; return x; };

  // mélodie de base : [pas, note, durée en pas], une ligne par mesure
  const MELODY = [
    // phrase A
    [[0, 74, 2], [2, 72, 1], [3, 74, 2], [6, 77, 2], [8, 76, 3], [11, 74, 1], [12, 72, 2], [14, 69, 2]],
    [[0, 70, 2], [2, 74, 1], [3, 76, 3], [6, 77, 2], [8, 76, 2], [10, 74, 2], [12, 72, 4]],
    [[0, 74, 2], [2, 77, 2], [4, 79, 1], [5, 77, 1], [6, 76, 2], [8, 74, 3], [11, 72, 1], [12, 70, 2], [14, 72, 2]],
    [[0, 69, 3], [3, 72, 1], [4, 74, 4], [10, 76, 1], [11, 77, 1], [12, 76, 4]],
    // phrase B : plus haute, comme une question
    [[0, 81, 3], [3, 79, 1], [4, 77, 2], [6, 79, 2], [8, 81, 2], [10, 84, 2], [12, 81, 4]],
    [[0, 82, 2], [2, 81, 2], [4, 79, 4], [10, 77, 1], [11, 79, 1], [12, 81, 4]],
    [[0, 79, 2], [2, 77, 1], [3, 79, 1], [4, 82, 2], [6, 81, 2], [8, 79, 3], [11, 77, 1], [12, 74, 4]],
    [[0, 76, 6], [8, 77, 2], [10, 76, 2], [12, 74, 2], [14, 72, 2]],
  ];

  // la mélodie se complexifie par niveaux, sans jamais sortir de la gamme
  function elaborate(bar8, level) {
    let notes = MELODY[bar8].map(n => n.slice());
    const nextFirst = MELODY[(bar8 + 1) % 8][0][1];
    if (level >= 1) {  // notes de passage dans les notes longues
      const out = [];
      notes.forEach((n, k) => {
        const nx = k + 1 < notes.length ? notes[k + 1][1] : nextFirst;
        if (n[2] >= 3) {
          out.push([n[0], n[1], 2]);
          out.push([n[0] + 2, stepScale(n[1], Math.sign(nx - n[1]) || 1), n[2] - 2]);
        } else out.push(n);
      });
      notes = out;
    }
    if (level >= 2) {  // broderies en doubles-croches, une note sur deux
      const out = [];
      notes.forEach((n, k) => {
        if (n[2] === 2 && k % 2 === 0) { out.push([n[0], n[1], 1]); out.push([n[0] + 1, stepScale(n[1], 1), 1]); }
        else out.push(n);
      });
      notes = out;
    }
    if (level >= 3) {  // dernier temps : montée rapide vers la mesure suivante
      notes = notes.filter(n => n[0] < 12).map(n => [n[0], n[1], Math.min(n[2], 12 - n[0])]);
      let m = nextFirst;
      const run = [];
      for (let k = 0; k < 4; k++) { m = stepScale(m, -1); run.unshift(m); }
      run.forEach((x, k) => notes.push([12 + k, x, 1]));
    }
    return notes;
  }

  // 808 qui glisse : une note par croche, null = on tient
  const BASS = [
    26, null, null, null, null, null, 28, 29,
    22, null, null, null, 22, null, 24, 26,
    31, null, null, 29, null, null, 26, null,
    33, null, null, null, 31, null, 28, 26,
  ];
  const KICKS = [new Set([0, 7, 10]), new Set([0, 3, 10, 13])];
  const POLY = [81, 76, 74];  // boîte à musique en 3 contre 4
  const SHAKER = [0.05, 0.02, 0.035, 0.02];

  let ctx = null, master, verbSend, delay, in808, pre808, wobble, noiseBuf, darkF, pump;
  const bus = {};
  let playing = false, target = 0.1, speed = 0.1;
  let step = 0, nextTime = 0, timer = null, last808 = null;
  let curNotes = [], pendingUp = false, pendingDown = false, dipEnd = 0;

  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
  const bpmNow = () => BPM_MIN + speed * (BPM_MAX - BPM_MIN);
  const darkFreq = () => 5500 + 8500 * speed;

  // changement de vitesse demandé par le jeu (ou la jauge) : on note s'il monte ou descend
  function setTarget(v) {
    v = clamp(v);
    if (v - target > 0.06) { pendingUp = true; pendingDown = false; }
    else if (target - v > 0.06) { pendingDown = true; pendingUp = false; }
    target = v;
  }

  function impulse(len, power) {
    const n = Math.floor(ctx.sampleRate * len);
    const buf = ctx.createBuffer(2, n, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, power);
    }
    return buf;
  }

  function shaper(k) {
    const ws = ctx.createWaveShaper(), c = new Float32Array(2048);
    for (let i = 0; i < 2048; i++) { const x = i / 1024 - 1; c[i] = Math.tanh(k * x) / Math.tanh(k); }
    ws.curve = c; ws.oversample = '2x';
    return ws;
  }

  function initAudio() {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();

    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16; comp.ratio.value = 3;
    const warm = shaper(1.3);
    darkF = ctx.createBiquadFilter(); darkF.type = 'lowpass'; darkF.frequency.value = darkFreq(); darkF.Q.value = 0.5;
    master = ctx.createGain(); master.gain.value = 0.62 * VOLUME;
    const tilt = ctx.createBiquadFilter(); tilt.type = 'lowshelf'; tilt.frequency.value = 160; tilt.gain.value = BASSES;
    const out = ctx.createGain(); out.gain.value = SORTIE;
    master.connect(warm); warm.connect(darkF); darkF.connect(comp); comp.connect(tilt); tilt.connect(out); out.connect(ctx.destination);

    const verb = ctx.createConvolver(); verb.buffer = impulse(3.2, 2.3);
    const vOut = ctx.createGain(); vOut.gain.value = 0.32;
    const vDark = ctx.createBiquadFilter(); vDark.type = 'lowpass'; vDark.frequency.value = 5000;
    verb.connect(vDark); vDark.connect(vOut); vOut.connect(master);
    verbSend = ctx.createGain(); verbSend.gain.value = 1.25 - 0.8 * speed; verbSend.connect(verb);

    delay = ctx.createDelay(2);
    const fb = ctx.createGain(); fb.gain.value = 0.3;
    const dLp = ctx.createBiquadFilter(); dLp.type = 'lowpass'; dLp.frequency.value = 3500;
    const dOut = ctx.createGain(); dOut.gain.value = 0.22;
    delay.connect(dLp); dLp.connect(fb); fb.connect(delay); dLp.connect(dOut); dOut.connect(master);

    pump = ctx.createGain(); pump.connect(master);
    for (const id in LAYERS) {
      const g = ctx.createGain(); g.gain.value = LAYERS[id](speed);
      g.connect(PUMPED.includes(id) ? pump : master); bus[id] = g;
    }
    ['keys', 'pad', 'bell', 'choir', 'swell', 'counter', 'sparkle', 'air', 'rim'].forEach(id => bus[id].connect(verbSend));
    ['keys', 'bell', 'counter', 'arp'].forEach(id => bus[id].connect(delay));
    const sv = ctx.createGain(); sv.gain.value = 0.2; bus.snare.connect(sv); sv.connect(verbSend);

    wobble = ctx.createGain(); wobble.gain.value = 7;
    const wl = ctx.createOscillator(); wl.frequency.value = 0.35; wl.connect(wobble); wl.start();

    in808 = ctx.createGain();
    pre808 = ctx.createGain(); pre808.gain.value = 1.2;
    const s808 = shaper(2.2), lp808 = ctx.createBiquadFilter(), g808 = ctx.createGain();
    lp808.type = 'lowpass'; lp808.frequency.value = 1400; g808.gain.value = 0.85;
    in808.connect(pre808); pre808.connect(s808); s808.connect(lp808); lp808.connect(g808); g808.connect(bus.b808);

    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;

    // souffle d'air ambiant : bruit filtré qui ondule lentement, dans les aigus (pas de grondement)
    const air = ctx.createBufferSource(); air.buffer = noiseBuf; air.loop = true;
    const ab = ctx.createBiquadFilter(); ab.type = 'bandpass'; ab.Q.value = 3; ab.frequency.value = 1800;
    const al = ctx.createOscillator(), aa = ctx.createGain();
    al.frequency.value = 0.06; aa.gain.value = 900; al.connect(aa); aa.connect(ab.frequency);
    const ag = ctx.createGain(); ag.gain.value = 0.018;
    air.connect(ab); ab.connect(ag); ag.connect(bus.air); air.start(); al.start();
  }

  function env(g, t, peak, a, dur) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  }

  function noise(t, dest, type, freq, q, peak, dur) {
    const n = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    n.buffer = noiseBuf; f.type = type; f.frequency.value = freq; f.Q.value = q;
    env(g, t, peak, 0.002, dur);
    n.connect(f); f.connect(g); g.connect(dest);
    n.start(t, Math.random() * 1.2); n.stop(t + dur + 0.02);
  }

  // piano électrique en synthèse FM
  function ep(t, midi, dur, dest, peak, sigh, pan) {
    const f = mtof(midi);
    const car = ctx.createOscillator(), mod = ctx.createOscillator(), tine = ctx.createOscillator();
    const mg = ctx.createGain(), tg = ctx.createGain(), g = ctx.createGain(), lp = ctx.createBiquadFilter();
    car.frequency.value = f; mod.frequency.value = f; tine.frequency.value = f * 14;
    mg.gain.setValueAtTime(f * 2.2, t); mg.gain.exponentialRampToValueAtTime(f * 0.3, t + 0.6);
    tg.gain.setValueAtTime(f * 0.5, t); tg.gain.exponentialRampToValueAtTime(1, t + 0.06);
    mod.connect(mg); mg.connect(car.frequency); tine.connect(tg); tg.connect(car.frequency);
    wobble.connect(car.detune);
    lp.type = 'lowpass'; lp.frequency.value = 4200;
    const rel = Math.max(dur, 0.25) + 0.9;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + 0.004);
    g.gain.exponentialRampToValueAtTime(peak * 0.35, t + 0.5);
    g.gain.exponentialRampToValueAtTime(0.0001, t + rel);
    if (sigh) {
      car.frequency.setValueAtTime(f, t + dur * 0.6);
      car.frequency.exponentialRampToValueAtTime(f * 0.944, t + dur);
    }
    let out = g;
    if (pan) { const p = ctx.createStereoPanner(); p.pan.value = pan; g.connect(p); out = p; }
    car.connect(lp); lp.connect(g); out.connect(dest);
    [car, mod, tine].forEach(o => { o.start(t); o.stop(t + rel + 0.05); });
  }

  function pad(t, chord, dur) {
    const f = ctx.createBiquadFilter(), g = ctx.createGain();
    f.type = 'lowpass'; f.frequency.value = 1600;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.03, t + 0.6);
    g.gain.setValueAtTime(0.03, t + dur - 0.2);
    g.gain.linearRampToValueAtTime(0.0001, t + dur + 0.4);
    chord.forEach(m => [-1, 1].forEach(side => {
      const o = ctx.createOscillator(), pn = ctx.createStereoPanner();
      o.type = 'triangle'; o.frequency.value = mtof(m + 12); o.detune.value = side * 8;
      pn.pan.value = side * 0.6;
      o.connect(pn); pn.connect(f); o.start(t); o.stop(t + dur + 0.45);
    }));
    f.connect(g); g.connect(bus.pad);
  }

  function choir(t, chord, dur) {
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.05, t + 0.8);
    g.gain.setValueAtTime(0.05, t + dur - 0.3);
    g.gain.linearRampToValueAtTime(0.0001, t + dur + 0.5);
    const sum = ctx.createGain();
    [[750, 1, 5], [1150, 0.45, 6], [2800, 0.08, 6]].forEach(([fr, lv, q]) => {
      const bp = ctx.createBiquadFilter(), fg = ctx.createGain();
      bp.type = 'bandpass'; bp.frequency.value = fr; bp.Q.value = q; fg.gain.value = lv;
      sum.connect(bp); bp.connect(fg); fg.connect(g);
    });
    chord.forEach(m => [-6, 6].forEach(dt => {
      const o = ctx.createOscillator();
      o.type = 'sawtooth'; o.frequency.value = mtof(m + 12); o.detune.value = dt;
      o.connect(sum); o.start(t); o.stop(t + dur + 0.55);
    }));
    g.connect(bus.choir);
  }

  function b808(t, midi, dur, from) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    if (from !== null) {
      o.frequency.setValueAtTime(mtof(from), t);
      o.frequency.exponentialRampToValueAtTime(mtof(midi), t + 0.08);
    } else o.frequency.setValueAtTime(mtof(midi), t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.7, t + 0.006);
    g.gain.setValueAtTime(0.7, t + dur - 0.03);
    g.gain.linearRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(in808);
    o.start(t); o.stop(t + dur + 0.02);
  }

  function kick(t, beatDur) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.setValueAtTime(160, t);
    o.frequency.exponentialRampToValueAtTime(50, t + 0.05);
    env(g, t, 0.7, 0.002, 0.13);
    o.connect(g); g.connect(bus.kick);
    o.start(t); o.stop(t + 0.15);
    // pompe : plus la vitesse monte, plus la nappe respire sur le kick
    const depth = 0.55 * ramp(speed, 0.5, 1);
    if (depth > 0.02) {
      pump.gain.setValueAtTime(1 - depth, t);
      pump.gain.linearRampToValueAtTime(1, t + beatDur * 0.8);
    }
  }

  function snare(t, dest, peak) {
    noise(t, dest, 'bandpass', 1800, 0.7, peak, 0.16);
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'triangle'; o.frequency.setValueAtTime(240, t); o.frequency.exponentialRampToValueAtTime(170, t + 0.06);
    env(g, t, peak * 0.85, 0.002, 0.08);
    o.connect(g); g.connect(dest); o.start(t); o.stop(t + 0.1);
  }

  function rim(t) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'triangle'; o.frequency.value = 1700;
    env(g, t, 0.12, 0.001, 0.03);
    o.connect(g); g.connect(bus.rim); o.start(t); o.stop(t + 0.04);
    noise(t, bus.rim, 'bandpass', 3000, 2, 0.08, 0.025);
  }

  function pluck(t, midi, dest, peak, pan) {
    const o = ctx.createOscillator(), g = ctx.createGain(), p = ctx.createStereoPanner();
    o.type = 'triangle'; o.frequency.value = mtof(midi);
    env(g, t, peak, 0.002, 0.12);
    p.pan.value = pan;
    o.connect(g); g.connect(p); p.connect(dest);
    o.start(t); o.stop(t + 0.14);
  }

  function reverse(t, midi, dur) {
    const f = mtof(midi), car = ctx.createOscillator(), mod = ctx.createOscillator();
    const mg = ctx.createGain(), g = ctx.createGain(), lp = ctx.createBiquadFilter();
    car.frequency.value = f; mod.frequency.value = f;
    mg.gain.setValueAtTime(f * 0.3, t); mg.gain.exponentialRampToValueAtTime(f * 2, t + dur);
    mod.connect(mg); mg.connect(car.frequency);
    lp.type = 'lowpass'; lp.frequency.value = 3500;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.07, t + dur);
    g.gain.linearRampToValueAtTime(0.0001, t + dur + 0.01);
    car.connect(lp); lp.connect(g); g.connect(bus.keys);
    [car, mod].forEach(o => { o.start(t); o.stop(t + dur + 0.02); });
  }

  function swell(t, chord, dur) {
    const f = ctx.createBiquadFilter(), g = ctx.createGain();
    f.type = 'lowpass'; f.frequency.setValueAtTime(400, t); f.frequency.exponentialRampToValueAtTime(2500, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.04, t + dur);
    g.gain.linearRampToValueAtTime(0.0001, t + dur + 0.02);
    chord.forEach(m => {
      const o = ctx.createOscillator();
      o.type = 'sawtooth'; o.frequency.value = mtof(m + 12);
      o.connect(f); o.start(t); o.stop(t + dur + 0.05);
    });
    f.connect(g); g.connect(bus.swell);
  }

  // transition vers un palier plus haut : roulement de caisse claire sur un temps, puis petite cymbale
  function upFill(t, sd) {
    for (let k = 0; k < 4; k++) snare(t + k * sd, bus.fills, 0.07 + k * 0.05);
    noise(t + sd * 4, bus.fills, 'highpass', 6000, 0.5, 0.07, 0.8);
  }

  // transition vers un palier plus bas : le son plonge sous l'eau pendant un temps, puis remonte
  function downFill(t, sd) {
    const back = darkFreq();
    darkF.frequency.cancelScheduledValues(t);
    darkF.frequency.setValueAtTime(darkF.frequency.value, t);
    darkF.frequency.exponentialRampToValueAtTime(700, t + sd * 2);
    darkF.frequency.exponentialRampToValueAtTime(back, t + sd * 4);
    dipEnd = t + sd * 4;
  }

  function scheduleStep(s, t, sd) {
    const bar = Math.floor(s / 16) % 4, i = s % 16, bar8 = Math.floor(s / 16) % 8;
    const chord = CHORDS[bar];
    const brk = bar8 === 7 && i >= 8 && speed > 0.2;

    // sur chaque temps : les couches changent pile sur le temps, et les transitions de palier partent ici
    if (i % 4 === 0) {
      for (const id in LAYERS) bus[id].gain.setTargetAtTime(LAYERS[id](speed), t, 0.04);
      if (pendingUp) { pendingUp = false; upFill(t, sd); }
      if (pendingDown) { pendingDown = false; downFill(t, sd); }
    }

    // début de mesure : on choisit le niveau de complexité de la mélodie pour toute la mesure
    if (i === 0) {
      const level = speed < 0.3 ? 0 : speed < 0.55 ? 1 : speed < 0.8 ? 2 : 3;
      curNotes = elaborate(bar8, level);
      pad(t, chord, sd * 16);
      choir(t, chord, sd * 16);
      ep(t, chord[0] + 12, sd * 8, bus.keys, 0.05);
      // contre-mélodie : deux notes longues par mesure, sous la mélodie
      ep(t, chord[3] + 12, sd * 7, bus.counter, 0.05, false, -0.4);
      ep(t + sd * 8, chord[2] + 12, sd * 7, bus.counter, 0.05, false, 0.4);
    }
    curNotes.forEach(([st, m, len]) => {
      if (st === i) {
        ep(t, m, sd * len, bus.keys, len === 1 ? 0.09 : 0.12, len >= 6);
        if (speed > 0.85) ep(t, m + 12, sd * len, bus.keys, 0.03, false, 0.5);  // doublure à l'octave au max
      }
    });
    if (s % 3 === 0) ep(t, POLY[(s / 3) % 3], sd * 2, bus.bell, 0.035, false, ((s / 3) % 2) ? 0.5 : -0.5);
    if (bar === 3 && i === 8) { reverse(t, bar8 === 7 ? 81 : 74, sd * 8); swell(t, CHORDS[0], sd * 8); }

    // chaos harmonieux : arpège rapide dans l'accord, et petites notes qui tombent comme de la pluie
    const arpNotes = [...chord.map(m => m + 24), ...chord.map(m => m + 36)];
    const up = (s % 16) < 8;
    const an = arpNotes[up ? i % arpNotes.length : (arpNotes.length - 1 - (i % arpNotes.length))];
    pluck(t, an, bus.arp, 0.035, i % 2 ? 0.6 : -0.6);
    if (speed > 0.9) pluck(t + sd / 2, arpNotes[(i + 2) % arpNotes.length], bus.arp, 0.025, i % 2 ? -0.6 : 0.6);
    if (Math.random() < 0.5) {
      const c = chord[Math.floor(Math.random() * chord.length)] + 36;
      ep(t + Math.random() * sd * 0.5, c, sd, bus.sparkle, 0.02, false, Math.random() * 1.6 - 0.8);
    }

    if (Math.random() < 0.25) noise(t, bus.vinyl, 'highpass', 2500, 0.5, 0.012, 0.004);
    noise(t, bus.shaker, 'bandpass', 6500, 1, SHAKER[i % 4] * (0.8 + Math.random() * 0.4), 0.04);
    if (i === 4 || i === 12) rim(t);

    if (!brk) {
      if (i % 2 === 0) {
        const idx = ((Math.floor(s / 16) % 4) * 8 + i / 2) % 32;
        let note = BASS[idx];
        if (note !== null && bar8 >= 4 && idx % 8 === 7) note += 12;
        if (note !== null) {
          let len = 1;
          while (BASS[(idx + len) % 32] === null && len < 8) len++;
          b808(t, note, sd * 2 * len, last808);
          last808 = note;
        }
      }
      if (KICKS[bar % 2].has(i) || (i === 14 && speed > 0.6)) kick(t, sd * 4);
      if (i === 4 || i === 12) snare(t, bus.snare, 0.35);
      if ((i === 7 || i === 15) && speed > 0.3) noise(t, bus.snare, 'bandpass', 1800, 0.7, 0.06, 0.06);
      if (i % 2 === 0 || speed > 0.35) noise(t, bus.hats, 'highpass', 7000, 0.7, (i % 2 ? 0.025 : 0.045) * (0.8 + Math.random() * 0.4), 0.025);
      if (bar % 2 === 1 && i >= 12) for (let k = 1; k < 3; k++)
        noise(t + k * sd / 3, bus.rolls, 'highpass', 8000, 0.7, 0.025 + (i - 12) * 0.005, 0.02);
      if (i === 3 || i === 11) noise(t, bus.perc, 'bandpass', 3200, 2, 0.12, 0.03);
      if (i === 6 || i === 14) noise(t, bus.perc, 'bandpass', 5000, 1, 0.05, 0.06);
    } else last808 = null;
  }

  // appelé toutes les 25 ms : lissage de la vitesse, contraste (réverbe, clarté), puis programmation des notes
  function scheduler() {
    speed += (target - speed) * 0.06;
    const now = ctx.currentTime;
    verbSend.gain.setTargetAtTime(1.25 - 0.8 * speed, now, 0.3);
    if (now > dipEnd) darkF.frequency.setTargetAtTime(darkFreq(), now, 0.2);
    delay.delayTime.setTargetAtTime(60 / bpmNow() / 2, now, 0.15);
    pre808.gain.setTargetAtTime(1.2 + speed * 2, now, 0.2);
    // (2026-10-12, dans le jeu : « des coupures ») le jeu occupe le fil principal (images lourdes, portails) : 0,12 s d'avance ne suffisait
    // pas, les notes arrivaient en retard (trou, puis un paquet joué d'un coup). 0,4 s d'avance, et un retard malgré tout SAUTE les pas manqués.
    if (nextTime < now - 0.02) { const sd0 = 60 / bpmNow() / 4, k = Math.ceil((now - nextTime) / sd0); step += k; nextTime += k * sd0; }
    while (nextTime < now + 0.4) {
      const sd = 60 / bpmNow() / 4;
      scheduleStep(step, nextTime, sd);
      nextTime += sd; step++;
    }
  }

  function startEngine() {
    if (!master) initAudio();
    speed = target;
    if (playing) return;
    ctx.resume();
    step = 0; last808 = null; pendingUp = pendingDown = false; dipEnd = 0;
    nextTime = ctx.currentTime + 0.05;
    timer = setInterval(scheduler, 25);
    playing = true;
  }

  function stopEngine() {
    if (!playing) return;
    clearInterval(timer); playing = false;
    ctx.suspend();
  }
  // === FIN MOTEUR ===

  if (audioContext) ctx = audioContext;

  return {
    start: startEngine,
    stop: stopEngine,
    setSpeed: setTarget,
    setTier(palier, nbPaliers) { setTarget(nbPaliers > 1 ? (palier - 1) / (nbPaliers - 1) : 1); },
    setVolume(v) { if (master) master.gain.setTargetAtTime(0.62 * v, ctx.currentTime, 0.1); },
    get bpm() { return bpmNow(); },
    get playing() { return playing; },
    wake() { if (ctx && playing && ctx.state !== 'running') ctx.resume(); }, // (jeu) réveille un contexte endormi/interrompu, sans repartir du début
  };
}
