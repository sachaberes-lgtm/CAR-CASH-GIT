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
// Le passage d'un palier à l'autre est lissé automatiquement : tempo, couches et 808 glissent.

export function createGlisseMusic({ volume = 1, audioContext = null } = {}) {
  const BPM_MIN = 98, BPM_MAX = 110;
  const clamp = v => Math.min(1, Math.max(0, v));
  const ramp = (s, a, b) => clamp((s - a) / (b - a));

  // chaque couche : fonction vitesse -> volume (0 à 1). Tout en haut, tout joue.
  const LAYERS = {
    keys:    s => 1,
    pad:     s => 1,
    vinyl:   s => 1,
    b808:    s => ramp(s, 0.05, 0.12),
    kick:    s => ramp(s, 0.1, 0.18),
    snare:   s => ramp(s, 0.15, 0.22),
    hats:    s => ramp(s, 0.2, 0.28),
    bell:    s => ramp(s, 0.35, 0.45),
    rolls:   s => ramp(s, 0.45, 0.55),
    perc:    s => ramp(s, 0.55, 0.62),
    choir:   s => ramp(s, 0.65, 0.75),
    swell:   s => ramp(s, 0.8, 0.9),
  };

  // Accords en suspens : Dm11, Bbmaj7#11 (le mi donne l'étrangeté), Gm9, Asus4 (ne se résout jamais)
  const CHORDS = [[50, 53, 55, 60], [46, 50, 52, 57], [43, 46, 50, 57], [45, 50, 52, 57]];
  // mélodie de piano électrique : [pas, note, durée en pas], une ligne par mesure
  const MELODY = [
    // phrase A
    [[0, 74, 3], [4, 72, 2], [6, 69, 6], [14, 76, 2]],
    [[0, 76, 4], [4, 74, 2], [6, 81, 6], [12, 76, 4]],
    [[0, 74, 2], [2, 77, 2], [4, 76, 4], [10, 74, 2], [12, 70, 4]],
    [[0, 69, 8], [10, 74, 2], [12, 76, 4]],
    // phrase B : plus haute, plus vide, comme une question
    [[0, 81, 6], [8, 79, 2], [10, 77, 2], [12, 76, 4]],
    [[0, 74, 8], [12, 72, 2], [14, 76, 2]],
    [[2, 77, 2], [4, 79, 2], [6, 81, 4], [12, 82, 4]],
    [[0, 81, 10], [12, 76, 4]],
  ];
  // 808 qui glisse sur des notes douces : une note par croche, null = on tient
  const BASS = [
    26, null, null, null, null, null, 28, 29,
    22, null, null, null, 22, null, 24, 26,
    31, null, null, 29, null, null, 26, null,
    33, null, null, null, 31, null, 28, 26,
  ];
  const KICKS = [new Set([0, 7, 10]), new Set([0, 3, 10, 13])];
  // boîte à musique en 3 contre 4 : 3 notes qui tournent sur un cycle de 3 doubles-croches
  const POLY = [81, 76, 74];


  let ctx = null, master, verbSend, delay, in808, pre808, wobble, noiseBuf;
  const bus = {};
  let playing = false, target = 0.1, speed = 0.1;
  let step = 0, nextTime = 0, timer = null, last808 = null;

  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
  const bpmNow = () => BPM_MIN + speed * (BPM_MAX - BPM_MIN);

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
    ctx = audioContext || new (window.AudioContext || window.webkitAudioContext)();

    // sortie sombre et chaude : presque pas d'aigus, comme la référence
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16; comp.ratio.value = 3;
    const warm = shaper(1.3);
    const dark = ctx.createBiquadFilter(); dark.type = 'lowpass'; dark.frequency.value = 11000; dark.Q.value = 0.5;
    master = ctx.createGain(); master.gain.value = 0.62 * volume;
    master.connect(warm); warm.connect(dark); dark.connect(comp); comp.connect(ctx.destination);

    const verb = ctx.createConvolver(); verb.buffer = impulse(2.8, 2.5);
    const vOut = ctx.createGain(); vOut.gain.value = 0.32;
    const vDark = ctx.createBiquadFilter(); vDark.type = 'lowpass'; vDark.frequency.value = 5000;
    verb.connect(vDark); vDark.connect(vOut); vOut.connect(master);
    verbSend = ctx.createGain(); verbSend.connect(verb);

    // écho calé sur la croche, qui s'assombrit
    delay = ctx.createDelay(2);
    const fb = ctx.createGain(); fb.gain.value = 0.3;
    const dLp = ctx.createBiquadFilter(); dLp.type = 'lowpass'; dLp.frequency.value = 3500;
    const dOut = ctx.createGain(); dOut.gain.value = 0.22;
    delay.connect(dLp); dLp.connect(fb); fb.connect(delay); dLp.connect(dOut); dOut.connect(master);

    for (const id in LAYERS) {
      const g = ctx.createGain(); g.gain.value = LAYERS[id](speed);
      g.connect(master); bus[id] = g;
    }
    ['keys', 'pad', 'bell', 'choir', 'swell'].forEach(id => bus[id].connect(verbSend));
    ['keys', 'bell'].forEach(id => bus[id].connect(delay));
    const sv = ctx.createGain(); sv.gain.value = 0.2; bus.snare.connect(sv); sv.connect(verbSend);

    // flottement de bande : tout le clavier ondule très légèrement
    wobble = ctx.createGain(); wobble.gain.value = 7;
    const wl = ctx.createOscillator(); wl.frequency.value = 0.35; wl.connect(wobble); wl.start();

    // 808 : sèche, saturation qui monte avec la vitesse (les harmoniques la rendent audible sur petits haut-parleurs)
    in808 = ctx.createGain();
    pre808 = ctx.createGain(); pre808.gain.value = 1.2;
    const s808 = shaper(2.2), lp808 = ctx.createBiquadFilter(), g808 = ctx.createGain();
    lp808.type = 'lowpass'; lp808.frequency.value = 1400; g808.gain.value = 0.85;
    in808.connect(pre808); pre808.connect(s808); s808.connect(lp808); lp808.connect(g808); g808.connect(bus.b808);

    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
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

  // piano électrique en synthèse FM : une "lame" frappée qui sonne comme un Rhodes
  function ep(t, midi, dur, dest, peak, sigh) {
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
    car.connect(lp); lp.connect(g); g.connect(dest);
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

  // chœur "aah" : dents de scie dans les filtres de la voyelle a
  function choir(t, chord, dur) {
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.05, t + 0.8);
    g.gain.setValueAtTime(0.05, t + dur - 0.3);
    g.gain.linearRampToValueAtTime(0.0001, t + dur + 0.5);
    const forms = [[750, 1, 5], [1150, 0.45, 6], [2800, 0.08, 6]];
    const sum = ctx.createGain();
    forms.forEach(([fr, lv, q]) => {
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

  // 808 : chaque note part de la précédente et glisse jusqu'à la sienne
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

  function kick(t) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.setValueAtTime(160, t);
    o.frequency.exponentialRampToValueAtTime(50, t + 0.05);
    env(g, t, 0.7, 0.002, 0.13);
    o.connect(g); g.connect(bus.kick);
    o.start(t); o.stop(t + 0.15);
  }

  function snare(t) {
    noise(t, bus.snare, 'bandpass', 1800, 0.7, 0.35, 0.16);
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'triangle'; o.frequency.setValueAtTime(240, t); o.frequency.exponentialRampToValueAtTime(170, t + 0.06);
    env(g, t, 0.3, 0.002, 0.08);
    o.connect(g); g.connect(bus.snare); o.start(t); o.stop(t + 0.1);
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

  function scheduleStep(s, t, sd) {
    const bar = Math.floor(s / 16) % 4, i = s % 16, bar8 = Math.floor(s / 16) % 8;
    const chord = CHORDS[bar];
    // fin de cycle de 8 mesures : la batterie et la 808 se taisent 2 temps, le piano reste seul
    const brk = bar8 === 7 && i >= 8 && speed > 0.2;

    if (i === 0) { pad(t, chord, sd * 16); choir(t, chord, sd * 16); }
    MELODY[bar8].forEach(([st, m, len]) => { if (st === i) ep(t, m, sd * len, bus.keys, 0.12, len >= 6); });
    if (i === 0) ep(t, chord[0] + 12, sd * 8, bus.keys, 0.05);  // accord grave doux
    if (s % 3 === 0) ep(t, POLY[(s / 3) % 3], sd * 2, bus.bell, 0.035);
    if (bar === 3 && i === 8) reverse(t, bar8 === 7 ? 81 : 74, sd * 8);
    if (bar === 3 && i === 8) swell(t, CHORDS[0], sd * 8);

    if (Math.random() < 0.25) noise(t, bus.vinyl, 'highpass', 2500, 0.5, 0.012, 0.004);

    if (!brk) {
      // 808 : une note par croche, tenue jusqu'à la suivante
      if (i % 2 === 0) {
        const idx = ((Math.floor(s / 16) % 4) * 8 + i / 2) % 32;
        let note = BASS[idx];
        if (note !== null && bar8 >= 4 && idx % 8 === 7) note += 12;  // saut d'octave dans la 2e moitié
        if (note !== null) {
          let len = 1;
          while (BASS[(idx + len) % 32] === null && len < 8) len++;
          b808(t, note, sd * 2 * len, last808);
          last808 = note;
        }
      }
      if (KICKS[bar % 2].has(i) || (i === 14 && speed > 0.6)) kick(t);
      if (i === 4 || i === 12) snare(t);
      if ((i === 7 || i === 15) && speed > 0.3) noise(t, bus.snare, 'bandpass', 1800, 0.7, 0.06, 0.06);  // caisse claire fantôme
      if (i % 2 === 0 || speed > 0.35) noise(t, bus.hats, 'highpass', 7000, 0.7, (i % 2 ? 0.025 : 0.045) * (0.8 + Math.random() * 0.4), 0.025);
      if (bar % 2 === 1 && i >= 12) for (let k = 1; k < 3; k++)
        noise(t + k * sd / 3, bus.rolls, 'highpass', 8000, 0.7, 0.025 + (i - 12) * 0.005, 0.02);
      if (i === 3 || i === 11) noise(t, bus.perc, 'bandpass', 3200, 2, 0.12, 0.03);
      if (i === 6 || i === 14) noise(t, bus.perc, 'bandpass', 5000, 1, 0.05, 0.06);
    } else last808 = null;
  }

  function scheduler() {
    while (nextTime < ctx.currentTime + 0.12) {
      const sd = 60 / bpmNow() / 4;
      scheduleStep(step, nextTime, sd);
      nextTime += sd; step++;
    }
    delay.delayTime.setTargetAtTime(60 / bpmNow() / 2, ctx.currentTime, 0.15);
    pre808.gain.setTargetAtTime(1.2 + speed * 2, ctx.currentTime, 0.2);
  }


  // lissage de la vitesse + volumes des couches, à chaque tour d'horloge
  function tick() {
    speed += (target - speed) * 0.12;
    for (const id in LAYERS) bus[id].gain.setTargetAtTime(LAYERS[id](speed), ctx.currentTime, 0.1);
    scheduler();
  }

  return {
    start() {
      if (!ctx) initAudio();
      if (playing) return;
      ctx.resume();
      step = 0; last808 = null; nextTime = ctx.currentTime + 0.05;
      timer = setInterval(tick, 25);
      playing = true;
    },
    stop() {
      if (!playing) return;
      clearInterval(timer); playing = false;
      ctx.suspend();
    },
    setSpeed(v) { target = clamp(v); },
    setTier(palier, nbPaliers) { target = nbPaliers > 1 ? clamp((palier - 1) / (nbPaliers - 1)) : 1; },
    setVolume(v) { if (master) master.gain.setTargetAtTime(0.62 * v, ctx.currentTime, 0.1); },
    get bpm() { return bpmNow(); },
    get playing() { return playing; },
  };
}
