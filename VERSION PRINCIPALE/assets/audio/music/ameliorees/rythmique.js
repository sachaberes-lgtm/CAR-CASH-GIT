/* ============================================================================
   LES VERSIONS AMÉLIORÉES — rythmique « haut de gamme » + timbres affinés (2026-11-02, Léo)
   Léo : « la rythmique était peut-être un peu simple, pas assez le système moteur du jeu » · « le premier palier ne doit pas être
   merdique, mais on commence calme pour bien s'intensifier » · « du niveau RUBIS DE NÉON / ASPHALTE D'ÉMERAUDE » · « certains instruments
   faisaient dénaturé, timbre qui ressort bizarrement : tout apaufiner sans supprimer la musicalité ni l'identité ».
   ----------------------------------------------------------------------------
   RIEN n'est réécrit sur le disque : le texte d'un morceau du générateur (musique-trente-vX.js) est RETOUCHÉ AU CHARGEMENT par
   RYTHMIQUE.patch(texte), comme le fait déjà pouce-bleu-jeu.js (horloge, montée). Les fichiers du jeu restent ceux d'origine.
   · RYT(…) est AJOUTÉE à la batterie de `pas()` : elle ne retire jamais rien, elle COMPLÈTE (elle regarde les motifs du morceau, M.pat,
     et ne double pas ce qui sonne déjà). Mélodies, accords, basse : intouchés.
   · POLI(id, sortie) est posée à la sortie de chaque piste mélodique : deux filtres doux (creux dans l'agressif 2-4 kHz, coin des aigus
     arrondi) — le même timbre, sans l'arête qui ressort. Tableau POLIS : un réglage par piste, à retoucher à l'oreille.
   Interrupteurs (RYTHMIQUE.rythme / .timbre) : la salle d'écoute les expose pour comparer.
   ============================================================================ */
(function (W) {
  'use strict';

  /* ---------- LA RYTHMIQUE : ajoutée dans pas(), après « // LA BATTERIE » ---------- */
  function RYT(s, i, bar, b8, t, tt, has, coupe, souffle, enVol, fren) {
    if (coupe || souffle || enVol || fren || !M || !M.pat) return;
    const T = tier, e = Math.min(1, (T - 1) / 29), P = M.pat, ph = ((M.phr | 0) % 4 + 4) % 4, sw = tt - t;
    const occ = (pat) => { if (!pat || !pat.length) return false; const c = pat[((bar % Math.max(1, (pat.length / 16) | 0)) | 0) * 16 + i]; return !!c && c !== '.'; };
    const h = (k) => { const x = Math.sin((s + 1) * 12.9898 + k * 78.233 + ph * 3.7) * 43758.5453; return x - Math.floor(x); };   /* du hasard fixe : même morceau = même rythme */
    const cell = (cells) => { const c = cells[ph % cells.length]; return c[i] || '.'; };
    const g = .72 + .3 * e;   /* la dynamique d'ensemble monte avec le moteur */
    const son0 = son, sonN = (...a) => { const D = (globalThis.__rytN = globalThis.__rytN || {}); D[T] = (D[T] || 0) + 1; return son0(...a); };
    const SH = (v, tm) => sonN('shaker', tm == null ? tt : tm, v * g, bus.perc);
    const HAT = (v, tm) => sonN('hat', tm == null ? tt : tm, v * g, bus.hat);
    const ouvre = () => has('hatO'), kick = () => has('kick'), snare = () => has('snare');

    /* 1 · LE SOCLE (dès le moteur 1) : un pouls calme, jamais pauvre — le shaker en croches, un charleys discret à contretemps, un cœur */
    if (!has('hat')) { if (i % 2 === 0) SH(i % 4 === 0 ? .2 : .13); if (i % 4 === 2) HAT(.14 + .06 * e); }
    if (!kick()) { if (i === 0) sonN('kick', t, .46, bus.kick); else if (i === 8 && b8 % 2 === 1) sonN('kick', t, .3, bus.kick); else if (T >= 2 && i === 10 && b8 % 2 === 0) sonN('kick', t, .22, bus.kick); }

    /* 2 · LES FANTÔMES : shaker en doubles croches qui se remplit avec le moteur (hasard fixe, jamais au hasard du moment) */
    if (T >= 3 && i % 2 === 1 && h(i) < .35 + .5 * e) SH(.06 + .1 * e, tt);

    /* 3 · LA CELLULE DE PERCUSSIONS (congas/bongos, en 3-3-2 pour la joie) : quatre variantes qui tournent par phrase */
    if (T >= 4 && !has('perc')) {
      const c = cell(['..H...L...H..L..', '...H..L..H...L.H', '..H.L...H..H..L.', '.H..L..H..L.H...']);
      if (c === 'H' || c === 'L') sonN(c === 'H' ? 'percH' : 'percL', tt, (.3 + .25 * e) * g, bus.perc);
    }

    /* 4 · LE CHARLEY OUVERT à contretemps (le « tss » de la house) */
    if (T >= 6 && !ouvre() && i % 8 === 6) sonN('hatO', tt, (.22 + .12 * e) * g, bus.hatO);

    /* 5 · LES FANTÔMES DE CAISSE CLAIRE (le groove qui respire) */
    if (T >= 7 && !has('fant') && (i === 7 || (i === 15 && b8 % 2 === 1) || (T >= 12 && i === 10 && ph % 2 === 0))) sonN('snare', tt, (.1 + .1 * e) * g, bus.fant);

    /* 6 · LA GROSSE CAISSE QUI SYNCOPE (le cœur de Rubis : 0 et 10), jamais sur un coup déjà joué */
    if (T >= 8 && kick() && !occ(P.kick)) {
      const c = cell(['..........x.....', '.......x..x.....', '..........x..x..', '...x......x.....']);
      if (c === 'x') sonN('kick', t, .36 + .2 * e, bus.kick);
    }

    /* 7 · LE CHARLEY QUI SE REMPLIT : les doubles croches manquantes, une mesure sur deux */
    if (T >= 10 && has('hat') && b8 % 2 === 1 && i % 2 === 1 && !occ(P.hat)) HAT(.14 + .16 * e);

    /* 8 · LES TOMS DE FIN DE MESURE */
    if (T >= 12 && b8 % 2 === 1 && (i === 13 || i === 15)) sonN(i === 13 ? 'tomH' : 'tomL', t, (.34 + .2 * e) * g, bus.toms);

    /* 9 · LA CYMBALE qui ouvre chaque phrase */
    if (T >= 13 && b8 === 0 && i === 0) sonN('crash', t, .18 + .16 * e, bus.fx, 1.6);

    /* 10 · LA MONTÉE DE FIN DE PHRASE : le roulement de caisse claire qui s'étoffe avec le moteur (Rubis : « roule ») */
    if (T >= 15 && b8 === 7 && i >= 8 && (T >= 20 || i % 2 === 0)) { sonN('snare', t, (.1 + (i - 8) * .035 + .1 * e) * g, bus.fx); if (T >= 26 && i % 2 === 1) sonN('snare', t + SD / 2, (.1 + (i - 8) * .03) * g, bus.fx); }

    /* 11 · L'ÉPAISSEUR DE LA CAISSE CLAIRE : un second coup à 11 ms (le clap des mains qui double) */
    if (T >= 17 && snare() && occ(P.snare)) sonN('snare', tt + .011, (.2 + .14 * e) * g, bus.fant);

    /* 12 · LE ROULEMENT DE CHARLEY de la dernière noire (l'accélération d'Asphalte) */
    if (T >= 19 && b8 % 2 === 1 && i >= 12) HAT((.14 + (i - 12) * .07) * (.8 + .4 * e), tt);

    /* 13 · LE RIDE aux noires */
    if (T >= 21 && i % 4 === 0 && !has('ride')) sonN('ride', t, (.2 + .14 * e) * g, bus.ride, .7);

    /* 14 · LA RELANCE de grosse caisse avant la mesure suivante */
    if (T >= 23 && kick() && i === 14 && b8 % 2 === 1 && !occ(P.kick)) sonN('kick', t, .5, bus.kick);

    /* 15 · LES TOMS EN CASCADE aux fins de 4 mesures, et la CYMBALE du milieu de phrase */
    if (T >= 25 && b8 === 3 && i >= 12) sonN(i < 14 ? 'tomH' : 'tomL', t, .55 * g, bus.toms);
    if (T >= 25 && b8 === 4 && i === 0) sonN('crash', t, .22 + .12 * e, bus.fx, 1.4);

    /* 16 · LE FINAL : la grosse caisse qui s'emballe dans la dernière mesure de la phrase (le moteur à fond) */
    if (T >= 28 && kick() && b8 === 7 && i >= 8 && i % 2 === 0 && !occ(P.kick)) sonN('kick', t, .4 + (i - 8) * .05, bus.kick);
  }

  /* ---------- LES TIMBRES : posée à la sortie de chaque piste, avant la pompe / la réverbe ---------- */
  /* [type, fréquence, gain dB, Q] — des creux de 1,5 à 3 dB : on arrondit l'arête, on ne change pas la voix */
  const POLIS = {
    lead:   [['peaking', 3300, -2.5, .9], ['highshelf', 7500, -2.5]],
    contre: [['peaking', 3000, -2.5, .9], ['highshelf', 7000, -2.5]],
    arp:    [['peaking', 3800, -2, 1], ['highshelf', 8000, -2.5]],
    harmo:  [['peaking', 3400, -2, .9], ['highshelf', 7500, -2.5]],
    octave: [['highshelf', 7500, -3]],
    cloche: [['highshelf', 7500, -3]],
    cuivres:[['peaking', 2400, -2, .9], ['highshelf', 6500, -2.5]],
    stab:   [['peaking', 2600, -2, .9], ['highshelf', 6800, -2.5]],
    keys:   [['peaking', 2800, -1.5, .8], ['highshelf', 8500, -1.5]],
    cordes: [['peaking', 3200, -2, .8], ['highshelf', 7000, -2]],
    choeur: [['peaking', 2600, -1.5, .8], ['highshelf', 8000, -2]],
    pad:    [['highshelf', 8000, -1.5]]
  };
  function POLI(id, o) {
    const L = POLIS_[id]; if (!L) return o;
    for (const [ty, f, db, q] of L) { const b = ctx.createBiquadFilter(); b.type = ty; b.frequency.value = f; b.gain.value = db; if (q) b.Q.value = q; o.connect(b); o = b; }
    return o;
  }

  /* ---------- LE MOTEUR COMMUN (pages écrites à la main + morceaux figés) : mêmes couches que RYT, voix de synthèse maison ---------- */
  /* Ces deux fonctions sont AUTONOMES (aucune globale) : on les recopie telles quelles dans le texte des pages (toString) ou on les appelle
     depuis la salle pour la surcouche des morceaux figés. */
  function RYVOIX(ctx, dest, nb, alea) {
    const env = (g, t, pk, a, d) => { g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(.0002, pk), t + a); g.gain.exponentialRampToValueAtTime(.0001, t + d); };
    const bruit = (t, type, f, q, pk, d) => { const s = ctx.createBufferSource(), x = ctx.createBiquadFilter(), g = ctx.createGain(); s.buffer = nb; x.type = type; x.frequency.value = f; x.Q.value = q;
      env(g, t, pk, .002, d); s.connect(x); x.connect(g); g.connect(dest); s.start(t, alea() * 1.2); s.stop(t + d + .02); };
    const sine = (t, f0, f1, tf, pk, d, ty) => { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = ty || 'sine'; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + tf);
      env(g, t, pk, .002, d); o.connect(g); g.connect(dest); o.start(t); o.stop(t + d + .02); };
    return {
      sh: (t, v) => bruit(t, 'bandpass', 7000, 1.4, v * .5, .05),
      hat: (t, v) => bruit(t, 'highpass', 9000, .7, v * .7, .03),
      hatO: (t, v) => bruit(t, 'highpass', 7200, .7, v * .7, .2),
      perc: (t, haut, v) => { sine(t, haut ? 330 : 230, haut ? 290 : 190, .1, v * .6, .16); bruit(t, 'bandpass', haut ? 2400 : 1500, 2, v * .25, .02); },
      kick: (t, v) => { sine(t, 150, 46, .07, v * .8, .3); },
      snare: (t, v) => { bruit(t, 'bandpass', 1300, .9, v * .9, .03); bruit(t + .02, 'bandpass', 1100, .8, v * .7, .14); sine(t, 200, 160, .06, v * .3, .1, 'triangle'); },
      tom: (t, f, v) => sine(t, f, f * .55, .2, v * .7, .28),
      crash: (t, v) => bruit(t, 'highpass', 6000, .5, v, 1.5),
      ride: (t, v) => bruit(t, 'bandpass', 8000, 2, v * .5, .35)
    };
  }
  /* o = ce que l'hôte joue déjà { kick, hat, hatPlein (charleys à chaque double croche), snare (caisse claire/clap au 2 et au 4), crash, ride } */
  function RYC(V, T, i, b8, ph, t, tt, SD, o) {
    T = Math.max(1, Math.min(30, T | 0)); const e = (T - 1) / 29, g = (.72 + .3 * e) * (1.3 + 1.7 * Math.max(0, (6 - T) / 5));   /* plus présent au départ : le moteur 1 ne doit pas être pauvre */
    const h = (k) => { const x = Math.sin((b8 * 16 + i + 1) * 12.9898 + k * 78.233 + ph * 3.7) * 43758.5453; return x - Math.floor(x); };
    const cell = (c) => c[ph % c.length][i] || '.';
    /* 1 · le socle calme */
    if (!o.hat) { if (i % 2 === 0) V.sh(tt, (i % 4 === 0 ? .2 : .13) * g); if (i % 4 === 2) V.hat(tt, (.14 + .06 * e) * g); }
    if (!o.kick) { if (i === 0) V.kick(t, .46); else if (i === 8 && b8 % 2 === 1) V.kick(t, .3); else if (T >= 2 && i === 10 && b8 % 2 === 0) V.kick(t, .22); }
    /* 2 · fantômes de shaker */
    if (T >= 3 && i % 2 === 1 && h(i) < .35 + .5 * e) V.sh(tt, (.06 + .1 * e) * g);
    /* 3 · cellule de percussions (3-3-2) */
    if (T >= 4) { const c = cell(['..H...L...H..L..', '...H..L..H...L.H', '..H.L...H..H..L.', '.H..L..H..L.H...']); if (c === 'H' || c === 'L') V.perc(tt, c === 'H', (.3 + .25 * e) * g); }
    /* 4 · charley ouvert à contretemps */
    if (T >= 6 && !o.ouverts && i % 8 === 6) V.hatO(tt, (.22 + .12 * e) * g);
    /* 5 · fantômes de caisse claire */
    if (T >= 7 && (i === 7 || (i === 15 && b8 % 2 === 1) || (T >= 12 && i === 10 && ph % 2 === 0))) V.snare(tt, (.1 + .1 * e) * g);
    /* 6 · grosse caisse qui syncope */
    if (T >= 8 && o.kick) { const c = cell(['..........x.....', '.......x..x.....', '..........x..x..', '...x......x.....']); if (c === 'x') V.kick(t, .36 + .2 * e); }
    /* 7 · charley qui se remplit */
    if (T >= 10 && o.hat && !o.hatPlein && b8 % 2 === 1 && i % 2 === 1) V.hat(tt, (.14 + .16 * e) * g);
    /* 8 · toms de fin de mesure */
    if (T >= 12 && b8 % 2 === 1 && (i === 13 || i === 15)) V.tom(t, i === 13 ? 190 : 125, (.34 + .2 * e) * g);
    /* 9 · cymbale d'ouverture de phrase */
    if (T >= 13 && !o.crash && b8 === 0 && i === 0) V.crash(t, .18 + .16 * e);
    /* 10 · montée de fin de phrase */
    if (T >= 15 && b8 === 7 && i >= 8 && (T >= 20 || i % 2 === 0)) { V.snare(t, (.08 + (i - 8) * .03 + .08 * e) * g); if (T >= 26 && i % 2 === 1) V.snare(t + SD / 2, (.08 + (i - 8) * .026) * g); }
    /* 11 · caisse claire épaissie */
    if (T >= 17 && o.snare && (i === 4 || i === 12)) V.snare(tt + .011, (.2 + .14 * e) * g);
    /* 12 · roulement de charley */
    if (T >= 19 && b8 % 2 === 1 && i >= 12) V.hat(tt, (.14 + (i - 12) * .07) * (.8 + .4 * e));
    /* 13 · ride aux noires */
    if (T >= 21 && !o.ride && i % 4 === 0) V.ride(t, (.2 + .14 * e) * g);
    /* 14 · relance de grosse caisse */
    if (T >= 23 && o.kick && i === 14 && b8 % 2 === 1) V.kick(t, .5);
    /* 15 · toms en cascade, cymbale de milieu de phrase */
    if (T >= 25 && b8 === 3 && i >= 12) V.tom(t, i < 14 ? 190 : 125, .55 * g);
    if (T >= 25 && b8 === 4 && i === 0) V.crash(t, .22 + .12 * e);
    /* 16 · le final : la grosse caisse qui s'emballe */
    if (T >= 28 && o.kick && b8 === 7 && i >= 8 && i % 2 === 0 && i % 4 !== 0) V.kick(t, .4 + (i - 8) * .05);
  }
  const mulberry = (a) => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };

  /* ---------- LES PAGES ÉCRITES À LA MAIN : la rythmique dans la boucle de pas(), les timbres sur la sortie ---------- */
  const PAGES = {   /* kind → ce que la page joue déjà, par moteur p */
    rubis:    { o: 'p => ({ kick: true, hat: p >= 7, ouverts: p >= 8, snare: p >= 5, crash: p >= 5, ride: false })',
                boucle: /^( *)const s = i \+ 16 \* bar, t = tm \+ i \* SD \+ \(i % 2 \? SD \* SWING : 0\);.*$/m, args: 'p, i, bar % 8, Math.floor(m / 8) % 4, t, t, SD' },
    asphalte: { o: 'p => ({ kick: true, hat: p >= 2, hatPlein: p >= 2, ouverts: p >= 9, snare: p >= 5, crash: p >= 20, ride: p >= 21 })',
                boucle: /^( *)const t = tm \+ i \* SD, ph = Math\.floor\(m \/ 8\) % 2, poly = .*$/m, args: 'p, i, bar % 8, Math.floor(m / 8) % 4, t, t, SD' },
    aura:     { o: 'p => ({ kick: true, hat: p >= 4, ouverts: p >= 8, snare: p >= 5, crash: false, ride: false })',
                boucle: /^( *)const s = i \+ 16 \* bar8, t = tm \+ i \* SD \+ \(i % 2 \? SD \* SHUF : 0\);.*$/m, args: 'Math.max(1, p), i, bar8 % 8, Math.floor(m / 8) % 4, t, t, SD' }
  };
  function patchPage(html, kind) {
    const K = PAGES[kind]; if (!K) return html;
    if (W.RYTHMIQUE.rythme) {
      const avant = '    // ---- les mesures ----';
      if (html.indexOf(avant) < 0 || !K.boucle.test(html)) return html;   /* page changée : on ne touche à rien */
      const setup = RYVOIX.toString() + '\n    ' + RYC.toString() + '\n    const RYO = ' + K.o + ';\n' +
        '    const RYV = RYVOIX(ctx, kit.ryD || (kit.ryD = (() => { const g9 = ctx.createGain(); g9.gain.value = 1; g9.connect(kit.master); return g9; })()), kit.bruit || kit.noiseBuf, alea);\n';
      html = html.replace(avant, () => setup + avant);
      html = html.replace(K.boucle, (l, sp) => l + '\n' + sp + 'try { RYC(RYV, ' + K.args.split(', ')[0] + ', ' + K.args.split(', ').slice(1).join(', ') + ', RYO(p)); } catch (e9) { (globalThis.__rytErr = globalThis.__rytErr || []).push(String(e9 && e9.message || e9)); }   /* rythmique haut de gamme */');
      if (kind === 'aura') html = html.replace('return { bus, loopFilter,', () => 'return { master, bus, loopFilter,');
    }
    if (W.RYTHMIQUE.timbre) {
      const eq = "...[['peaking', 3200, -1.5, .9], ['highshelf', 8000, -2]].map(([ty, f9, db, q9]) => { const x9 = F(ty, f9, q9); x9.gain.value = db; return x9; })";
      if (kind === 'aura') html = html.replace('warm, soft, comp, lim, sortie)', () => "warm, soft, ...[['peaking', 3200, -1.5, .9]].map(([ty, f9, db, q9]) => { const x9 = F(ty, f9, q9); x9.gain.value = db; return x9; }), comp, lim, sortie)");
      else html = html.replace('chaud, comp, lim, sortie)', () => 'chaud, ' + eq + ', comp, lim, sortie)');
    }
    return html;
  }
  const URLS = {};
  async function urlPage(f) {
    const kind = /rubis/.test(f) ? 'rubis' : /asphalte/.test(f) ? 'asphalte' : /aura/.test(f) ? 'aura' : null; if (!kind) return f;
    const K = f + '#' + RYTHMIQUE.cle(); if (URLS[K]) return URLS[K];
    const html = await (await fetch(f)).text();
    return URLS[K] = URL.createObjectURL(new Blob([patchPage(html, kind)], { type: 'text/html' }));
  }

  /* ---------- LES MORCEAUX FIGÉS (audio déjà rendu) : une surcouche calée sur la boucle du lecteur ---------- */
  const FIGES = {   /* id → ce que le morceau joue déjà, par palier (0…7) */
    'pal-neon-noir':        pal => ({ kick: pal >= 2, hat: pal >= 2, hatPlein: pal >= 4, snare: pal >= 3, ouverts: pal >= 4, ride: false, crash: false }),
    'pal-nuit-de-velours':  pal => ({ kick: true, hat: pal >= 1, hatPlein: pal >= 1, snare: pal >= 1, ouverts: pal >= 2, ride: false, crash: false })
  };
  function surcouche(ac, dest, L, id) {
    const O = FIGES[id]; if (!O) return null;
    let sortie = dest, filtres = [];
    if (RYTHMIQUE.timbre) {   /* un adoucissement très léger : ce sont les pistes de Léo, leur identité d'abord */
      const hs = ac.createBiquadFilter(); hs.type = 'highshelf'; hs.frequency.value = 8000; hs.gain.value = -1; hs.connect(dest); filtres.push(hs); sortie = hs;
      try { L.g.disconnect(); L.g.connect(hs); } catch (e) {}
    }
    const nb = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate), al = mulberry(20261102); { const d = nb.getChannelData(0); for (let k = 0; k < d.length; k++) d[k] = al() * 2 - 1; }
    const out = ac.createGain(); out.gain.value = RYTHMIQUE.rythme ? 1 : 0; out.connect(sortie);
    const V = RYVOIX(ac, out, nb, mulberry(77));
    let tier = 6, step = null, ok = true;
    const iv = setInterval(() => {
      if (!ok || !L.joue() || !RYTHMIQUE.rythme) return;
      const SD = L.mesure() / 16, now = ac.currentTime; if (step == null) step = Math.max(0, Math.ceil((now - L.t0) / SD));
      while (L.t0 + step * SD < now + .6) { const t = L.t0 + step * SD, i = step % 16, bar = Math.floor(step / 16);
        if (t >= now - .01) { const pal = Math.max(0, L.palier()); try { RYC(V, tier, i, bar % 8, Math.floor(bar / 8) % 4, t, t + (i % 2 ? SD * .04 : 0), SD, O(pal)); } catch (e) {} }
        step++; }
    }, 50);
    return { regle(m) { tier = m; }, stop() { ok = false; clearInterval(iv); setTimeout(() => { try { out.disconnect(); filtres.forEach(f => f.disconnect()); } catch (e) {} }, 1200); } };
  }

  /* ---------- LE PATCH : le texte du morceau, retouché ---------- */
  function ajoute(src, ancre, neuf, tout) {
    if (src.indexOf(ancre) < 0) return src;   /* un texte absent d'une version = rien à faire */
    return tout ? src.split(ancre).join(neuf) : src.replace(ancre, () => neuf);
  }
  const RYTHMIQUE = {
    on: !/[?&]rythmique=0\b/.test(location.search), rythme: true, timbre: true,   /* ?rythmique=0 : les morceaux d'origine (A/B) */
    cle() { return (RYTHMIQUE.on ? 'a' : 'o') + (RYTHMIQUE.rythme ? 'r' : '-') + (RYTHMIQUE.timbre ? 't' : '-'); },
    patch(src) {
      if (!RYTHMIQUE.on) return src;
      if (RYTHMIQUE.rythme) {
        src = ajoute(src, '  function pas(s, t) {', RYT.toString() + '\n  function pas(s, t) {');
        src = ajoute(src, '    // LA BATTERIE\n', '    // LA BATTERIE\n    try { RYT(s, i, bar, b8, t, tt, has, coupe, souffle, enVol, fren); } catch (e9) { (globalThis.__rytErr = globalThis.__rytErr || []).push(String(e9 && e9.message || e9)); }   /* rythmique haut de gamme (ameliorees/rythmique.js) */\n');
      }
      if (RYTHMIQUE.timbre) {
        src = ajoute(src, '  function pas(s, t) {', 'const POLIS_ = ' + JSON.stringify(POLIS) + ';\n' + POLI.toString() + '\n  function pas(s, t) {');
        src = ajoute(src, '      o.connect(POMPE.includes(id) ? pompeBus : master);', '      o = POLI(id, o);   /* timbres affinés (ameliorees/rythmique.js) */\n      o.connect(POMPE.includes(id) ? pompeBus : master);');
      }
      return src;
    }
  };
  RYTHMIQUE.urlPage = urlPage; RYTHMIQUE.surcouche = surcouche; RYTHMIQUE.patchPage = patchPage;
  W.RYTHMIQUE = RYTHMIQUE;
})(window);
