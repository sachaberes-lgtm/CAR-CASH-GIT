/* LE BUS DE LA MUSIQUE — assets/audio/musique-bus.js (2026-10-15, pôle SON). UN SEUL réglage, lu par la BIBLIOTHÈQUE (bibliotheque.html)
   et par le JEU (index.html) : jamais deux versions qui divergent.
   Léo (15/10) : « j'aime beaucoup la basse, mais pour un jeu qui dure, des basses agréables : ça peut fatiguer dans les écouteurs. Régule les
   basses, ne rien enlever, tout bien mesurer pour tout bien réguler » · « un bouton pour activer la nitro et voir comment elle amplifie la
   musique en général, pas que les basses. Mais pas trop : le joueur freine à des moments, sinon ce sera horrible ».

   1. LES BASSES RÉGULÉES — aucun fichier recomposé ni re-rendu : un réglage PAR-DESSUS, par morceau (PRESETS, clé = un bout du nom du fichier).
      · un coupe-très-bas à 22 Hz (le grondement qu'aucun casque ne rend, mais qui pousse les membranes) ;
      · un PLATEAU sous 65 Hz (`sub`, dB) : le très grave TENU (nappes de sub, queues de 808) — c'est lui qui fatigue dans les écouteurs ;
      · une CLOCHE à 110 Hz (`bas`, dB), seulement pour les morceaux encore trop lourds après le plateau.
      Au-dessus de ~120 Hz rien ne bouge : l'attaque du kick (le clic, le corps vers 80-100 Hz à peine touché) et les harmoniques de la basse
      — ce qu'on entend d'elle au haut-parleur d'un téléphone — restent entières. On ne monte jamais rien.
      MESURÉ (atelier : la part d'énergie sous 60 Hz, sous 150 Hz, la sonie BS.1770, ce qui reste après un coupe-bas de téléphone à 180 Hz) :
      les musiques de NIVEAU passaient 40 à 65 % de leur énergie sous 60 Hz (NOITE 65 %, GLASSY 57 %, ADDICTIVE 56 %, CIEL 1-5 ~ 47-50 %) ;
      les lobby, le ciel et le garage restent sous 10 % : on n'y touche pas. Cible : ≤ 36 % sous 60 Hz, ≤ 65 % sous 150 Hz, coupes bornées
      à −5 dB (plateau ; −7 pour GLISSE, un sub presque pur) et −2 dB (cloche : au-delà, le corps du kick s'en va). `FORCE` règle tout d'un coup (1 = les réglages mesurés, .5 = moitié, 0 = brut).
   2. LA NITRO QUI COLORE LA MUSIQUE — nitro enfoncée, la musique S'OUVRE : un peu plus de basse (+2,5 dB à 90 Hz), plus brillante (+4 dB
      au-dessus de 3,5 kHz), un peu plus large (+35 % de côtés), et un LÉGER grain saturé en parallèle (8 %, coupé sous 250 Hz et au-dessus de
      6,5 kHz — pas la copie saturée du 03/10 que Léo avait coupée : « forte, floue, qui monte »). Plafond : ~+3 dB perçus (mesuré).
      LISSÉ : ça monte en ~0,3 s, ça TIENT 0,35 s après le lâcher (des petits coups répétés gardent l'effet ouvert, il ne clignote pas), puis
      retombe en ~0,8 s. Aucun paramètre ne descend sous sa valeur de repos : le frein et le lâcher ne font jamais de trou.

   Emploi : const b = MUSBUS.cree(ac) ; source → b.entree ; b.sortie → la suite (destination, limiteur) ; b.piste(url ou clé) ; b.nitro(vrai/faux)
   (à chaque image ou à chaque appui : seul le changement compte) ; b.brut(vrai/faux) = l'interrupteur (le jeu : `?basses=brut`) ; b.etat(). */
(function (W) {
  'use strict';
  var PRESETS = {   // dB · mesurés le 15/10 (atelier : part d'énergie sous 60 / 150 Hz du fichier entier ; les sons en direct, joués au banc) — absent = rien ne change
    // LE JEU — les musiques de niveau (les lobby Chris, le ciel et le garage du menu restent sous 10 % : rien)
    'ciel-n1': { sub: -4 }, 'ciel-n2': { sub: -3 }, 'ciel-n3': { sub: -4.5, bas: -2 }, 'ciel-n4': { sub: -1.5 }, 'ciel-n5': { sub: -3.5, bas: -1.5 },
    'ciel-complet': { sub: -3 }, 'ville-n3': { sub: -3.5 }, 'ville-n4': { sub: -3 }, 'ville-n5': { sub: -2 },
    'noite-de-velocidade': { sub: -5 }, 'glassy-plucks': { sub: -5 }, 'swag-cash-car': { sub: -2.5, bas: -2 }, 'lvl1-neon-cash-car': { bas: -1.5 },
    'lvl2-cash-car-vitesse': { sub: -1.5, bas: -2 }, 'addictive-loop': { sub: -5, bas: -2 },
    'musique-glisse': { sub: -7, bas: -2 },   // GLISSE (le SOLEIL DE JADE) : 85 % de son énergie sous 60 Hz — le plus lourd de tout, le seul au-delà de −5
    // LA BIBLIOTHÈQUE (hors jeu) — ni les petits sons, ni ce qui est rangé dans Pouce bleu (Léo, 15/10 : « touche à rien », il trie lui-même)
    'paliers/rendus/ciel/': { sub: -3.5 }, 'boucles/pluie-neon--': { sub: -2, bas: -2 }, 'boucles/niv-altitude--': { sub: -2, bas: -2 }, 'boucles/neon-drive-2--': { sub: -1.5, bas: -2 },
    'boucles/vapeur-nuages': { bas: -2 }, 'boucles/vapeur-orage': { bas: -2 }, 'boucles/vapeur-ciel': { bas: -2 }, 'boucles/niv-altitude.m4a': { sub: -2.5, bas: -2 },
    'boucles/niv-neon-noir.m4a': { sub: -1 }, 'boucles/niv-metro': { bas: -2 }, 'boucles/niv-satellite': { sub: -5, bas: -2 }, 'boucles/niv-monstre': { bas: -2 },
    'boucles/neon-drive.m4a': { sub: -3, bas: -2 }, 'boucles/pluie-neon.m4a': { sub: -2, bas: -2 }, 'dark-triad': { bas: -2 }, 'boucles/caisse-enregistreuse': { sub: -1.5, bas: -2 },
    'boucles/garage-lofi': { sub: -3.5, bas: -2 }, 'boucles/hypervitesse': { bas: -1 }, 'french-touch': { bas: -2 }
  };
  var NITRO = { bas: 2.5, brille: 4, large: .35, grain: .08, monte: .1, tient: .35, retombe: .27 };
  var MB = { PRESETS: PRESETS, NITRO: NITRO, FORCE: 1 };

  MB.presetDe = function (u) {   // une adresse (ou une clé) → son réglage
    var s = String(u || ''); for (var k in PRESETS) if (s.indexOf(k) >= 0) return { cle: k, sub: PRESETS[k].sub || 0, bas: PRESETS[k].bas || 0 };
    return { cle: '', sub: 0, bas: 0 };
  };
  function bq(ac, t, f, q, g) { var b = ac.createBiquadFilter(); b.type = t; b.frequency.value = f; if (q != null) b.Q.value = q; if (g != null) b.gain.value = g; return b; }
  function vers(p, v, t, tau) { try { if (p.cancelAndHoldAtTime) p.cancelAndHoldAtTime(t); else { p.cancelScheduledValues(t); p.setValueAtTime(p.value, t); } p.setTargetAtTime(v, t, tau); } catch (e) { try { p.value = v; } catch (e2) {} } }
  function grain() { var n = 2048, c = new Float32Array(n); for (var i = 0; i < n; i++) { var x = i / (n - 1) * 2 - 1; c[i] = Math.tanh(1.8 * x + .2 * x * x) / Math.tanh(2); } return c; }   // asymétrique : des harmoniques paires, chaudes

  MB.cree = function (ac) {
    var e = ac.createGain(); e.channelCount = 2; e.channelCountMode = 'explicit'; e.channelInterpretation = 'speakers';   // une source mono passe en stéréo (la largeur en a besoin)
    var hp = bq(ac, 'highpass', 22, .7), sub = bq(ac, 'lowshelf', 65, null, 0), bas = bq(ac, 'peaking', 110, .9, 0);
    var nb = bq(ac, 'lowshelf', 90, null, 0), nh = bq(ac, 'highshelf', 3500, null, 0);
    var sp = ac.createChannelSplitter(2), mg = ac.createChannelMerger(2), ll = ac.createGain(), rr = ac.createGain(), lr = ac.createGain(), rl = ac.createGain();
    ll.gain.value = rr.gain.value = 1; lr.gain.value = rl.gain.value = 0;
    var ghp = bq(ac, 'highpass', 250, .7), ws = ac.createWaveShaper(), glp = bq(ac, 'lowpass', 6500, .6), gg = ac.createGain(); ws.curve = grain(); try { ws.oversample = '2x'; } catch (x) {} gg.gain.value = 0;
    var s = ac.createGain();
    e.connect(hp); hp.connect(sub); sub.connect(bas); bas.connect(nb); nb.connect(nh); nh.connect(sp);
    sp.connect(ll, 0); sp.connect(rl, 0); sp.connect(rr, 1); sp.connect(lr, 1);   // L' = (1 + w/2)·L − (w/2)·R : les côtés montent, le centre ne bouge pas
    ll.connect(mg, 0, 0); lr.connect(mg, 0, 0); rr.connect(mg, 0, 1); rl.connect(mg, 0, 1); mg.connect(s);
    nh.connect(ghp); ghp.connect(ws); ws.connect(glp); glp.connect(gg); gg.connect(s);
    var B = { entree: e, sortie: s, cle: '', estBrut: false, n: false, p: { cle: '', sub: 0, bas: 0 } };
    function pose(tau) { var t = ac.currentTime, f = B.estBrut ? 0 : MB.FORCE; vers(sub.gain, B.p.sub * f, t, tau); vers(bas.gain, B.p.bas * f, t, tau); }
    B.piste = function (u) { B.p = MB.presetDe(u); B.cle = B.p.cle; pose(.05); return B.p; };
    B.brut = function (b) { B.estBrut = !!b; pose(.08); };
    B.force = function (f) { MB.FORCE = Math.max(0, Math.min(1.5, +f || 0)); pose(.08); };
    B.nitro = function (on) {
      on = !!on; if (on === B.n) return; B.n = on;
      var t = ac.currentTime, N = NITRO, a = on ? 1 : 0, t0 = on ? t : t + N.tient, tau = on ? N.monte : N.retombe;
      vers(nb.gain, N.bas * a, t0, tau); vers(nh.gain, N.brille * a, t0, tau);
      vers(ll.gain, 1 + N.large / 2 * a, t0, tau); vers(rr.gain, 1 + N.large / 2 * a, t0, tau); vers(lr.gain, -N.large / 2 * a, t0, tau); vers(rl.gain, -N.large / 2 * a, t0, tau);
      vers(gg.gain, N.grain * a, t0, tau);
    };
    B.etat = function () { return { cle: B.cle, brut: B.estBrut, force: MB.FORCE, sub: +sub.gain.value.toFixed(2), bas: +bas.gain.value.toFixed(2), nitro: B.n, ouvert: +(nh.gain.value / NITRO.brille).toFixed(2) }; };
    return B;
  };
  W.MUSBUS = MB;
})(window);
