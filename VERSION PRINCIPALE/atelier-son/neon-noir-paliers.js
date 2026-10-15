/* NÉON NOIR EN 8 PALIERS (2026-10-13, Léo : « Néon Noir, rends le clap moins violent, c'est un peu fort — c'est trop fort ; rends-la
   8 paliers de moteur comme les nouveaux »).
   On garde SON vrai son : les 4 pistes séparées d'origine (boucles8.py → niv-neon-noir--c1…c4 : NAPPE · BASSE · CAISSE · BATTERIE, 4 mesures
   à 120 BPM, do mineur), mixées autrement à chaque palier. MESURÉ : dans la version à couches la CAISSE (le « clap » énorme coupé net)
   était à −20,5 dB quand la nappe était à −35,6 et la basse à −30,4 → elle écrasait tout. Ici elle n'entre qu'au palier 4, 10 dB plus bas,
   adoucie (passe-bas 3,2 kHz : plus de claquement), et ne remonte que jusqu'à −5 dB sous l'original au final.
   Chaque palier : gain + filtre de chaque piste (la basse s'ouvre de 380 Hz à grand ouvert, la batterie entre en sourdine puis à plein),
   rendu hors temps réel sur DEUX tours (on garde le 2e : filtres et réverbe déjà lancés, la boucle retombe sur elle-même), sonie −17 dB
   + 0,6 dB par palier, puis FIGÉ comme les autres (POST /fige, /fige-index de atelier-son/serveur-moteur.py).
   Lancer (dans bibliotheque.html?muet=1, console) : await neonNoirFige()   → assets/audio/music/paliers/rendus/neon-noir/ */
const NEON_NOIR = {
  id: 'neon-noir', titre: 'NÉON NOIR', bpm: 120, mesures: 4, ton: 'do mineur', moteurs: [4, 4, 4, 4, 4, 4, 4, 2], pas: 0.6,
  style: 'Darksynth · basse saturée qui grogne, nappe menaçante (tes pistes d’origine, remixées en 8 paliers)',
  pistes: ['assets/audio/music/boucles/niv-neon-noir--c1.m4a', 'assets/audio/music/boucles/niv-neon-noir--c2.m4a',
           'assets/audio/music/boucles/niv-neon-noir--c3.m4a', 'assets/audio/music/boucles/niv-neon-noir--c4.m4a'],   // NAPPE · BASSE · CAISSE · BATTERIE
  // par palier : [gain en dB (null = muette), passe-bas en Hz (0 = ouvert)] pour NAPPE · BASSE · CAISSE · BATTERIE
  paliers: [
    { txt: 'La nuit : la nappe menaçante et la basse qui grogne, étouffée.', p: [[0, 0], [0, 380], [null], [null]] },
    { txt: 'La basse s’ouvre.', p: [[0, 0], [0, 900], [null], [null]] },
    { txt: 'La batterie arrive en sourdine, la basse s’ouvre encore.', p: [[0, 0], [0, 1800], [null], [-9, 2500]] },
    { txt: 'Toute la batterie, la basse presque ouverte, le clap entre — doux.', p: [[0, 0], [0, 3500], [-14, 2600], [-4, 6000]] },
    { txt: 'La basse grande ouverte, le clap monte un peu.', p: [[0, 0], [1, 0], [-12, 3000], [-2, 0]] },
    { txt: 'La batterie à plein, la nappe plus présente.', p: [[1.5, 0], [1.5, 0], [-10, 3200], [0, 0]] },
    { txt: 'Tout monte d’un cran, le clap s’éclaire un peu.', p: [[2, 0], [2.5, 0], [-8, 3600], [1, 0]] },
    { txt: 'Le final : tout dehors — le clap reste 5 dB sous l’original.', p: [[3, 0], [3, 0], [-5, 4200], [2, 0]] },
  ],
};

async function neonNoirRendPalier(N, bufs, k, sr) {   // un palier : les 4 pistes bouclées, gain + filtre, deux tours, on garde le 2e
  sr = sr || 44100; const L = bufs[0].length, ctx = new OfflineAudioContext(2, 2 * L, sr);
  // un LIMITEUR en bout (comme AURA) : sans lui, les coups de grosse caisse et de caisse bloquaient la normalisation (P4-P8 restaient à −16,5)
  const lim = ctx.createDynamicsCompressor(); lim.threshold.value = -10; lim.ratio.value = 20; lim.attack.value = 0.001; lim.release.value = 0.08; lim.knee.value = 0;
  const pre = ctx.createGain(); pre.gain.value = 2.2; pre.connect(lim); lim.connect(ctx.destination);
  N.paliers[k].p.forEach(([db, lp], i) => { if (db == null) return;
    const s = ctx.createBufferSource(); s.buffer = bufs[i]; s.loop = true; let o = s;
    if (lp) { const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = lp; f.Q.value = 0.7; o.connect(f); o = f; }
    const g = ctx.createGain(); g.gain.value = Math.pow(10, db / 20); o.connect(g); g.connect(pre); s.start(0); });
  const tout = await ctx.startRendering(), out = new AudioBuffer({ length: L, numberOfChannels: 2, sampleRate: sr });
  for (let c = 0; c < 2; c++) out.copyToChannel(tout.getChannelData(c).slice(L, 2 * L), c);
  return out;
}

async function neonNoirFige(dit) {
  const N = NEON_NOIR, base = 'assets/audio/music/paliers/rendus/' + N.id + '/';
  const ac0 = new OfflineAudioContext(2, 44100, 44100);
  const bufs = await Promise.all(N.pistes.map(f => fetch(f).then(r => { if (!r.ok) throw new Error(f + ' introuvable'); return r.arrayBuffer(); }).then(a => ac0.decodeAudioData(a))));
  const n = Math.min(...bufs.map(b => b.length)); bufs.forEach((b, i) => { if (b.length !== n) { const c = new AudioBuffer({ length: n, numberOfChannels: b.numberOfChannels, sampleRate: b.sampleRate });
    for (let ch = 0; ch < b.numberOfChannels; ch++) c.copyToChannel(b.getChannelData(ch).subarray(0, n), ch); bufs[i] = c; } });
  const fichiers = [], info = [];
  for (let k = 0; k < N.paliers.length; k++) {
    const b = await neonNoirRendPalier(N, bufs, k), l = palSonie(b), pk = palCrete(b);
    if (l < -60) throw new Error('rendu silencieux (palier ' + (k + 1) + ') : rien n\u2019est figé');   // garde-fou (13/10)
    let g = Math.pow(10, (PAL_CIBLE + N.pas * k - l) / 20); if (pk * g > 0.944) g = 0.944 / pk;
    const res = await fetch('/fige?f=' + encodeURIComponent(base + 'p' + (k + 1) + '.wav'), { method: 'POST', body: palWav(b, g) });
    if (!res.ok) throw new Error('le serveur refuse p' + (k + 1)); fichiers.push((await res.json()).f);
    info.push('P' + (k + 1) + ' ' + (l + 20 * Math.log10(g)).toFixed(1) + ' dB'); if (dit) dit(info[info.length - 1]);
  }
  const fiche = { id: N.id, titre: N.titre, style: N.style, bpm: N.bpm, ton: N.ton, mesures: N.mesures, intro: 0, introTxt: '', moteurs: N.moteurs,
    paliers: N.paliers.map(x => x.txt), fichiers, introF: null, dur: +(bufs[0].length / bufs[0].sampleRate).toFixed(5), fige: new Date().toISOString().slice(0, 16), remplace: 'niv-neon-noir' };
  const r = await fetch('/fige-index', { method: 'POST', body: JSON.stringify(fiche) }); if (!r.ok) throw new Error('fiche refusée');
  return info;
}
