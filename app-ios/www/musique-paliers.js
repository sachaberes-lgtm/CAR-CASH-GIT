




















const PAL_CIBLE = -17;
const PAL_PAS = 0.7;

function palAlea(graine) {
  let a = graine >>> 0;
  return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
function palExtrait(html) {
  const m = /<script[^>]*\bid\s*=\s*["']?morceau["']?[^>]*>([\s\S]*?)<\/script>/i.exec(html);
  if (!m) throw new Error('pas de <script id="morceau"> dans ce fichier');
  return m[1];
}
async function palLitMorceau(src) {
  const html = typeof src === 'string' ? await (await fetch(src)).text() : await src.text();
  const M = new Function(palExtrait(html) + '\n;return (typeof MORCEAU!=="undefined")?MORCEAU:null;')();
  if (!M || typeof M.jouer !== 'function' || typeof M.preparer !== 'function' || !(M.bpm > 0))
    throw new Error('MORCEAU incomplet (il faut titre, bpm, preparer, jouer)');
  M.mesures = M.mesures || 8;
  return M;
}
function palGraine(M) { let h = 2166136261; const t = String(M.titre || 'morceau'); for (let i = 0; i < t.length; i++) h = Math.imul(h ^ t.charCodeAt(i), 16777619); return h >>> 0; }

async function palRendPalier(M, p, sr) {
  sr = sr || 44100;



  const mes = 240 / M.bpm, n = M.mesures, W = Math.max(2, Math.ceil(4.5 / mes)), m0 = n * Math.ceil(W / n) - W, total = (W + n) * mes;
  if (p === 0) {
    const cx = new OfflineAudioContext(2, Math.ceil((M.intro + 1.5) * mes * sr), sr), al = palAlea(palGraine(M) ^ 0x1A7);
    M.jouer(cx, M.preparer(cx, cx.destination, al) || {}, 0, 0, 0, M.intro, al);
    return cx.startRendering();
  }
  const ctx = new OfflineAudioContext(2, Math.ceil((total + 0.05) * sr), sr);
  const alea = palAlea(palGraine(M));
  const kit = M.preparer(ctx, ctx.destination, alea) || {};
  M.jouer(ctx, kit, p, 0, m0, W + n, alea);
  const tout = await ctx.startRendering();
  const a = Math.round(W * mes * sr), N = Math.round(n * mes * sr);
  const out = new AudioBuffer({ length: N, numberOfChannels: 2, sampleRate: sr });



  const K = Math.min(256, a);
  for (let c = 0; c < 2; c++) {
    const src = tout.getChannelData(Math.min(c, tout.numberOfChannels - 1)), d = src.slice(a, a + N);
    for (let i = 0; i < K; i++) { const w = 0.5 - 0.5 * Math.cos(Math.PI * (i + 1) / (K + 1)); d[N - K + i] = d[N - K + i] * (1 - w) + src[a - K + i] * w; }
    out.copyToChannel(d, c);
  }
  return out;
}
function palSonie(b) {
  let e = 0, n = 0; const k = Math.exp(-2 * Math.PI * 100 / b.sampleRate);
  for (let c = 0; c < b.numberOfChannels; c++) { const d = b.getChannelData(c); let y = 0, x0 = 0;
    for (let i = 0; i < d.length; i++) { y = k * (y + d[i] - x0); x0 = d[i]; e += y * y; n++; } }
  return 10 * Math.log10(e / n + 1e-12);
}
function palCrete(b) { let pk = 0; for (let c = 0; c < b.numberOfChannels; c++) { const d = b.getChannelData(c); for (let i = 0; i < d.length; i++) { const v = Math.abs(d[i]); if (v > pk) pk = v; } } return pk; }
function palNb(M) { return Math.max(1, (M.paliers && M.paliers.length) || 5); }




function palDecoupe(n, moteurs, total) {
  total = total || 30;
  let L = Array.isArray(moteurs) && moteurs.length === n ? moteurs.slice() : null;
  if (!L) { const w = []; for (let k = 0; k < n; k++) w.push(1 + 0.5 * k / Math.max(1, n - 1));
    const S = w.reduce((x, y) => x + y, 0); let c = 0, prec = 0;
    L = w.map(x => { c += x; const b = Math.round(total * c / S), l = b - prec; prec = b; return l; }); }
  const d = [0]; for (let k = 0; k < n - 1; k++) d.push(d[k] + L[k]); return d;
}
function palPalierDe(debuts, moteur) { let k = 0; while (k < debuts.length - 1 && moteur >= debuts[k + 1]) k++; return k; }
async function palRendTout(M, quandPret, opts) {




  if (typeof opts === 'number') opts = { enMeme: opts }; opts = opts || {};
  const annule = opts.annule || (() => false), deja = opts.deja || {};
  const nb = palNb(M), bufs = deja.bufs || [], gains = deja.gains || [], info = [], r = { bufs, gains, info, intro: deja.intro || null, introGain: deja.introGain || 1, annule: false };
  const rend = async i => {
    if (bufs[i]) { if (quandPret) quandPret(i, bufs[i], gains[i]); return; }
    if (annule()) { r.annule = true; return; }
    const t = performance.now(), b = await palRendPalier(M, i + 1), l = palSonie(b), pk = palCrete(b);
    let g = Math.pow(10, (PAL_CIBLE + (M.pas > 0 ? M.pas : PAL_PAS) * i - l) / 20); if (pk * g > 0.944) g = 0.944 / pk;
    bufs[i] = b; gains[i] = g; info.push({ p: i + 1, sonie: +(l + 20 * Math.log10(g)).toFixed(1), ms: Math.round(performance.now() - t) });
    if (quandPret) quandPret(i, b, g);
  };
  await rend(0);
  if (M.intro > 0) {
    if (r.intro) { if (quandPret) quandPret(-1, r.intro, r.introGain); }
    else if (!annule()) {
      const ti = performance.now(), bi = await palRendPalier(M, 0), pki = palCrete(bi);
      let gi = gains[0]; if (pki * gi > 0.944) gi = 0.944 / pki;
      r.intro = bi; r.introGain = gi; info.push({ p: 'intro', sonie: +(palSonie(bi) + 20 * Math.log10(gi)).toFixed(1), ms: Math.round(performance.now() - ti) });
      if (quandPret) quandPret(-1, bi, gi);
    }
  }
  let suivant = 1;
  const fil = async () => { while (suivant < nb && !annule()) await rend(suivant++); };
  await Promise.all(Array.from({ length: Math.min(opts.enMeme || 3, nb - 1) }, fil));
  if (suivant < nb) r.annule = true;
  info.sort((a, b) => (a.p === 'intro' ? 1.5 : a.p) - (b.p === 'intro' ? 1.5 : b.p));
  return r;
}



function PalLecteur(ctx, sortie) {
  const L = { ctx, buf: [], gain: [], cur: null, prochain: null, t0: 0, nb: 8, g: ctx.createGain(), intro: null, introGain: 1, nbIntro: 0, introV: null };
  L.g.connect(sortie);
  const voix = (p, quand, off) => { const s = ctx.createBufferSource(); s.buffer = L.buf[p]; s.loop = true;
    const g = ctx.createGain(); g.gain.value = L.gain[p] == null ? 1 : L.gain[p]; s.connect(g); g.connect(L.g); s.start(quand, off); return { s, g, p }; };
  const entre = (v, t) => { const gv = v.g.gain.value; v.g.gain.setValueAtTime(0, t); v.g.gain.linearRampToValueAtTime(gv, t + 0.003); };
  L.mesure = () => { const b = L.buf.find(x => x); return b.duration / L.nb; };
  L.enIntro = () => !!(L.cur && L.cur.intro);
  L.introMesure = () => L.enIntro() ? Math.floor((ctx.currentTime - L.t0) / L.mesure()) + L.nbIntro : -1;
  L.dispo = p => { while (p > 0 && !L.buf[p]) p--; return L.buf[p] ? p : -1; };
  L.joue = () => !!L.cur;
  L.palier = () => L.cur ? L.cur.p : -1;
  L.vers = () => L.prochain ? L.prochain.v.p : L.palier();
  L.attend = () => !!L.prochain;
  L.promeut = function () { const pr = L.prochain; if (!pr || ctx.currentTime < pr.t) return; const v = L.cur; L.cur = pr.v; L.prochain = null;
    if (!v.intro) setTimeout(() => { try { v.s.stop(); } catch (e) {} }, 120); };
  L.demarre = function (p, fondu, sansIntro) {
    p = L.dispo(p); if (p < 0) return false; L.stop(0);
    const now = ctx.currentTime, d = now + 0.06;
    if (L.intro && L.nbIntro > 0 && !sansIntro) {
      const s = ctx.createBufferSource(), g = ctx.createGain(); s.buffer = L.intro; g.gain.value = L.introGain; s.connect(g); g.connect(L.g); s.start(d);
      L.introV = L.cur = { s, g, p: -1, intro: true };
      L.t0 = d + L.nbIntro * L.mesure(); const v = voix(p, L.t0, 0); entre(v, L.t0); L.prochain = { v, t: L.t0 };
    } else { L.t0 = d; L.cur = voix(p, L.t0, 0); }
    L.g.gain.cancelScheduledValues(now);
    if (fondu) { L.g.gain.setValueAtTime(0, now); L.g.gain.linearRampToValueAtTime(L._niv == null ? 1 : L._niv, now + fondu); }
    else L.g.gain.setValueAtTime(L._niv == null ? 1 : L._niv, now);
    return true;
  };
  L.vise = function (p) {
    if (!L.cur) return; L.promeut(); p = L.dispo(p); if (p < 0) return;
    const now = ctx.currentTime;
    if (L.cur.intro) {
      if (!L.prochain || L.prochain.v.p === p || L.t0 - now < 0.03) return;
      try { L.prochain.v.s.stop(); } catch (e) {}
      const v = voix(p, L.t0, 0); entre(v, L.t0); L.prochain = { v, t: L.t0 }; return; }
    if (L.prochain) { if (L.prochain.v.p === p) return; try { L.prochain.v.s.stop(); } catch (e) {}
      L.cur.g.gain.cancelScheduledValues(0); L.cur.g.gain.setValueAtTime(L.gain[L.cur.p] == null ? 1 : L.gain[L.cur.p], now); L.prochain = null; }
    if (p === L.cur.p) return;
    const m = L.mesure(); let k = Math.floor((now - L.t0) / m) + 1, t = L.t0 + k * m; if (t - now < 0.03) { k++; t += m; }
    const F = 0.008, v = voix(p, t, (k % L.nb) * m), gv = v.g.gain.value, gc = L.cur.g.gain.value;
    v.g.gain.setValueAtTime(0, t); v.g.gain.linearRampToValueAtTime(gv, t + F);
    L.cur.g.gain.setValueAtTime(gc, t); L.cur.g.gain.linearRampToValueAtTime(0, t + F);
    L.prochain = { v, t };
  };
  L.niveau = function (n, tc) { if (L._niv === n) return; L._niv = n; L.g.gain.cancelScheduledValues(ctx.currentTime); L.g.gain.setTargetAtTime(n, ctx.currentTime, tc || 0.06); };
  L.stop = function (fondu) {
    const a = [L.cur, L.prochain && L.prochain.v, L.introV]; L.cur = L.prochain = L.introV = null;
    const fin = () => a.forEach(v => { if (v) try { v.s.stop(); } catch (e) {} });
    if (fondu) { L.g.gain.setTargetAtTime(0, ctx.currentTime, fondu / 4); setTimeout(fin, fondu * 1000 + 100); L._niv = null; } else fin();
  };
  L.mesureEnCours = () => L.cur ? Math.floor((ctx.currentTime - L.t0) / L.mesure()) : -1;
  return L;
}





function palWav(buf, gain) {
  const n = buf.length, ch = 2, out = new DataView(new ArrayBuffer(44 + n * ch * 2)), w = (o, s) => { for (let i = 0; i < s.length; i++) out.setUint8(o + i, s.charCodeAt(i)); };
  w(0, 'RIFF'); out.setUint32(4, 36 + n * ch * 2, true); w(8, 'WAVE'); w(12, 'fmt '); out.setUint32(16, 16, true); out.setUint16(20, 1, true);
  out.setUint16(22, ch, true); out.setUint32(24, buf.sampleRate, true); out.setUint32(28, buf.sampleRate * ch * 2, true); out.setUint16(32, ch * 2, true);
  out.setUint16(34, 16, true); w(36, 'data'); out.setUint32(40, n * ch * 2, true);
  const L = buf.getChannelData(0), R = buf.getChannelData(Math.min(1, buf.numberOfChannels - 1));
  for (let i = 0, o = 44; i < n; i++) for (const d of [L, R]) { const v = Math.max(-1, Math.min(1, d[i] * gain)); out.setInt16(o, v < 0 ? v * 32768 : v * 32767, true); o += 2; }
  return out.buffer;
}
async function palFige(M, id, dit) {
  const base = 'assets/audio/music/paliers/rendus/' + id + '/';
  const r = await palRendTout(M, (k) => { if (dit) dit(k < 0 ? 'intro rendue' : 'palier ' + (k + 1) + ' rendu'); });

  r.bufs.concat(r.intro ? [r.intro] : []).forEach((b, i) => { if (palSonie(b) < -60) throw new Error('rendu silencieux (' + (i < r.bufs.length ? 'palier ' + (i + 1) : 'intro') + ') : rien n\u2019est figé'); });
  const envoie = async (nom, b, g) => { const res = await fetch('/fige?f=' + encodeURIComponent(base + nom + '.wav'), { method: 'POST', body: palWav(b, g) });
    if (!res.ok) throw new Error('le serveur refuse ' + nom + ' (' + res.status + ')'); if (dit) dit(nom + ' figé'); return (await res.json()).f; };
  const fichiers = []; for (let i = 0; i < r.bufs.length; i++) fichiers.push(await envoie('p' + (i + 1), r.bufs[i], r.gains[i]));
  const intro = r.intro ? await envoie('intro', r.intro, r.introGain) : null;
  const fiche = { id, titre: M.titre, style: M.style || '', bpm: M.bpm, ton: M.ton || '', mesures: M.mesures, intro: M.intro || 0, introTxt: M.introTxt || '',
    moteurs: M.moteurs || null, paliers: M.paliers, fichiers, introF: intro, dur: +r.bufs[0].duration.toFixed(5), fige: new Date().toISOString().slice(0, 16) };
  const res = await fetch('/fige-index', { method: 'POST', body: JSON.stringify(fiche) }); if (!res.ok) throw new Error('fiche refusée');
  return fiche;
}
