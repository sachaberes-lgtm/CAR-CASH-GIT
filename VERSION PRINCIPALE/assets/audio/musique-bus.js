/* LE BUS DE LA MUSIQUE — assets/audio/musique-bus.js (2026-10-15, pôle SON) : LES BASSES RÉGULÉES. UN SEUL réglage, lu par la BIBLIOTHÈQUE (bibliotheque.html)
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
      les musiques de NIVEAU d'alors passaient 40 à 65 % de leur énergie sous 60 Hz (NOITE 65 %, GLASSY 57 %, ADDICTIVE 56 %, CIEL 1-5 ~ 47-50 %) ;
      les lobby, le ciel et le garage restent sous 10 % : on n'y touche pas. Cible : ≤ 36 % sous 60 Hz, ≤ 65 % sous 150 Hz, coupes bornées
      à −5 dB (plateau ; −7 pour GLISSE, un sub presque pur) et −2 dB (cloche : au-delà, le corps du kick s'en va). `FORCE` règle tout d'un coup (1 = les réglages mesurés, .5 = moitié, 0 = brut).
   2. (LA NITRO QUI COLORE LA MUSIQUE — essayée le 15/10 dans la bibliothèque, RETIRÉE à l'écoute, Léo : « enlève nitro musique augmentée ».
      Son code est dans l'historique git, commit f1e89131 ; on ne la réintègre pas.)

   3. (le jeu, 15/10, l'audit du pôle SON) LE CREUX DE COURSE : en course, −2 dB vers 280 Hz (Q 1) — le moteur du jeu y vit (mesuré : 48 % de
      son énergie entre 250 et 500 Hz, pic à 283 Hz) ; la musique lui laisse sa place, le grave de la basse ne bouge pas. Lissé (~0,3 s).
   4. (le jeu) LE RECUL SOUS LES SIGNAUX : quand un signal du jeu risque d'être couvert (panne sèche de nitro, série de pièces, flow perdu…),
      la musique recule de −3 dB pendant 0,4 s (attaque 30 ms, retour en ~0,4 s), puis revient.
   5. (le jeu, 20/10) LE DOMPTEUR DE GROSSE CAISSE — pour les morceaux de Pouce bleu dont la grosse caisse sort trop au-dessus du reste (`kick`,
      voir plus bas). Rien d'autre ne change : sans `kick`, il n'est même pas construit.
   Emploi : const b = MUSBUS.cree(ac) ; source → b.entree ; b.sortie → la suite (destination, limiteur) ; b.piste(url ou clé) ;
   b.brut(vrai/faux) = l'interrupteur (le jeu : `?basses=brut`) ; b.course(vrai/faux) ; b.recul(dB, durée) ; b.tick({kick, basse}, niveau) à chaque image (le dompteur) ; b.etat(). */
(function (W) {
  'use strict';
  var PRESETS = {   // dB · mesurés le 15/10 (atelier : part d'énergie sous 60 / 150 Hz du fichier entier ; les sons en direct, joués au banc) — absent = rien ne change
    // LE JEU — le ciel et le garage du menu, les lobby Chris restent sous 10 % : rien (18/10 : les réglages des musiques de niveau parties — NOITE, GLASSY, SWAG, LVL 1-2, ADDICTIVE, CIEL 1-5, VILLE — sont retirés)
    'musique-glisse': { sub: -7, bas: -2 },   // GLISSE (la bibliothèque ; au jeu elle jouait au SOLEIL DE JADE, jusqu'au 18/10) : 85 % de son énergie sous 60 Hz — le plus lourd de tout, le seul au-delà de −5
    // LA BIBLIOTHÈQUE (hors jeu) — ni les petits sons, ni ce qui est rangé dans Pouce bleu (Léo, 15/10 : « touche à rien », il trie lui-même)
    'paliers/rendus/ciel-30/': { sub: -3.5 }, 'boucles/pluie-neon--': { sub: -2, bas: -2 }, 'boucles/niv-altitude--': { sub: -2, bas: -2 }, 'boucles/neon-drive-2--': { sub: -1.5, bas: -2 },
    'boucles/vapeur-nuages': { bas: -2 }, 'boucles/vapeur-orage': { bas: -2 }, 'boucles/vapeur-ciel': { bas: -2 }, 'boucles/niv-altitude.m4a': { sub: -2.5, bas: -2 },
    'boucles/niv-neon-noir.m4a': { sub: -1 }, 'boucles/niv-metro': { bas: -2 }, 'boucles/niv-satellite': { sub: -5, bas: -2 }, 'boucles/niv-monstre': { bas: -2 },
    'boucles/neon-drive.m4a': { sub: -3, bas: -2 }, 'boucles/pluie-neon.m4a': { sub: -2, bas: -2 }, 'dark-triad': { bas: -2 }, 'boucles/caisse-enregistreuse': { sub: -1.5, bas: -2 },
    'boucles/garage-lofi': { sub: -3.5, bas: -2 }, 'boucles/hypervitesse': { bas: -1 }, 'french-touch': { bas: -2 },
    // POUCE BLEU EN COURSE (le jeu seulement : clés « jeu: » — dans la bibliothèque, Pouce bleu reste tel quel). Mesuré au banc (moteurs 10, 20, 30) :
    // aucune musique du générateur ne passe 30 % sous 60 Hz ; celles qui pèsent entre 60 et 150 Hz, la cloche.
    // (20/10) `kick: 12` = le dompteur de grosse caisse (5.) : les 11 morceaux où elle passe 15 dB au-dessus du reste à au moins un moteur (mesuré, 20 morceaux × 11 moteurs).
    'jeu:bleu-1540': { bas: -2, kick: 12 }, 'jeu:bleu-9664': { bas: -2, kick: 12 }, 'jeu:bleu-3392': { bas: -2 }, 'jeu:bleu-8154': { bas: -2 }, 'jeu:bleu-8042': { bas: -2, kick: 12 },
    'jeu:bleu-5095': { bas: -2 }, 'jeu:bleu-6167': { bas: -1, kick: 12 }, 'jeu:bleu-2221': { bas: -.5, kick: 12 }, 'jeu:pal-neon-noir': { sub: -5, bas: -2 }, 'jeu:pal-aura-30': { bas: -2 },
    'jeu:bleu-6562': { kick: 12 }, 'jeu:bleu-4830': { kick: 12 }, 'jeu:bleu-9688': { kick: 12 }, 'jeu:bleu-1275': { kick: 12 }, 'jeu:bleu-6104': { kick: 12 }, 'jeu:pal-asphalte': { kick: 12 }
  };
  var KICK_OFF = /[?&]kick=0\b/.test(String((W.location && W.location.search) || ''));   // (20/10) `?kick=0` : le dompteur de grosse caisse n'est pas construit (pour comparer à l'oreille)
  var MB = { PRESETS: PRESETS, FORCE: 1, CREUX: -2 };

  MB.presetDe = function (u) {   // une adresse (ou une clé) → son réglage
    var s = String(u || ''); for (var k in PRESETS) if (s.indexOf(k) >= 0) return { cle: k, sub: PRESETS[k].sub || 0, bas: PRESETS[k].bas || 0, kick: KICK_OFF ? 0 : PRESETS[k].kick || 0 };
    return { cle: '', sub: 0, bas: 0, kick: 0 };
  };
  function bq(ac, t, f, q, g) { var b = ac.createBiquadFilter(); b.type = t; b.frequency.value = f; if (q != null) b.Q.value = q; if (g != null) b.gain.value = g; return b; }
  function vers(p, v, t, tau) { try { if (p.cancelAndHoldAtTime) p.cancelAndHoldAtTime(t); else { p.cancelScheduledValues(t); p.setValueAtTime(p.value, t); } p.setTargetAtTime(v, t, tau); } catch (e) { try { p.value = v; } catch (e2) {} } }

  /* 5. (le jeu, 20/10 ; noté le 17/10 : « la grosse caisse de certains morceaux ~18 dB au-dessus du reste » — les oreilles, en écouteurs)
     LE DOMPTEUR DE GROSSE CAISSE — `kick` d'un réglage = le PLAFOND (dB) de la grosse caisse au-dessus du reste du morceau.
     MESURÉ (banc muet, la chaîne du jeu : bus → limiteur, niveau de course ; le niveau court — 20 ms — de la bande 30-120 Hz, son 99e centile,
     contre le RMS du reste, 200 Hz-8 kHz) : les morceaux sains restent entre 5 et 13 dB à tous les moteurs. Le générateur fait ENTRER la grosse
     caisse à plein niveau au 2e-5e moteur (VOL .95, gardée par son niveau harmonisé) quand le reste n'est encore qu'un clavier : 18 à 25 dB
     au-dessus (le « ~18 dB » : PLUIE D'ARGENT au moteur 3), puis le reste la rattrape (10-13 dB au 12e) ; ASPHALTE D'ÉMERAUDE, 14-16 dB à
     tous les moteurs. Le limiteur du jeu, lui, ne travaille jamais (crêtes −7 à −12 dBFS).
     Le dompteur : la bande grave passe dans un compresseur RAPIDE (attaque 1 ms, avance 6 ms, 20:1) dont le seuil SUIT le reste du morceau
     (son RMS, ~0,8 s) : seuls les coups qui dépassent le plafond sont tenus — la grosse caisse MONTE alors avec le morceau, comme le reste.
     LA BASSE N'EST PAS TOUCHÉE : la basse sans grosse caisse, le dompteur se tait (le lecteur dit ce qui joue : `tick(g)`,
     g = {kick, basse} pour le générateur, rien pour les autres ; et le niveau qu'il pose devant le bus) — mesuré avant ce garde-fou : il prenait 2 dB à la basse SEULE de MIRAGE
     (moteurs 4-5) ; avec la basse, le seuil ne descend jamais sous la basse (le niveau médian de la bande grave sur ~1,2 s, +7 dB) ; et jamais
     plus de 15 dB pris à un coup. Au-dessus de ~195 Hz rien ne bouge (le clic du kick, tout le reste). Réglé par `tick()` (le lecteur de Pouce
     bleu l'appelle à chaque image, avec le niveau) ; sans `kick`, rien n'est construit — le bus d'avant, nœud pour nœud ; `brut` = le chemin
     direct d'avant. */
  var DOMPTE = { fc: 130, demi: .0213, seuil: -24, ratio: 20, attaque: .001, relache: .08, avance: .006, crete: 3, prof: 9, basse: 4, prise: 15, tauR: .8, pas: .05, nB: 24 };
  function dompteur(ac) {
    var D = DOMPTE, sr = ac.sampleRate, M = Math.round(D.demi * sr), P = Math.floor(D.avance * sr), e = ac.createGain(), sm = ac.createGain();
    /* la bande grave = un passe-bas à PHASE LINÉAIRE (sinus cardinal fenêtré de Blackman, 2M+1 points, gain 1 au continu ; −6 dB à 130 Hz, plein sous ~65,
       rien au-dessus de ~195) : le morceau = tout (retardé) − la bande grave + la bande grave domptée. Au repos les deux bandes graves s'annulent
       exactement : le morceau sort TEL QUEL, 27 ms plus tard (un filtre en deux bandes à la Linkwitz-Riley tournait la phase sous 400 Hz :
       mesuré, +1 à +2,4 dB sur les crêtes, sans rien changer d'autre). */
    var ir = ac.createBuffer(1, 2 * M + 1, sr), h = ir.getChannelData(0), wc = 2 * D.fc / sr, sh = 0, n, k;
    for (n = -M; n <= M; n++) { k = (n === 0 ? wc : Math.sin(Math.PI * wc * n) / (Math.PI * n)) * (.42 + .5 * Math.cos(Math.PI * n / M) + .08 * Math.cos(2 * Math.PI * n / M)); h[n + M] = k; sh += k; }
    for (n = 0; n < h.length; n++) h[n] /= sh;
    var lp = ac.createConvolver(); lp.normalize = false; lp.buffer = ir;
    var d1 = ac.createDelay(.2), d2 = ac.createDelay(.05), inv = ac.createGain(), pre = ac.createGain(), dc = ac.createDynamicsCompressor(), post = ac.createGain();
    d1.delayTime.value = (M + P) / sr; d2.delayTime.value = P / sr; inv.gain.value = -1;   // (P : l'avance du compresseur, 6 ms tronquées à l'échantillon comme dans Chrome et WebKit)
    dc.threshold.value = D.seuil; dc.knee.value = 0; dc.ratio.value = D.ratio; dc.attack.value = D.attaque; dc.release.value = D.relache;
    var mk = Math.pow(10, .6 * D.seuil * (1 - 1 / D.ratio) / 20);   // le compresseur relève tout de (1/gain à 0 dBFS)^0,6 (la norme ; mesuré, au millième de dB) : on le rend
    e.connect(d1); d1.connect(sm); e.connect(lp); lp.connect(d2); d2.connect(inv); inv.connect(sm); lp.connect(pre); pre.connect(dc); dc.connect(post); post.connect(sm);
    var r1 = bq(ac, 'highpass', 200, -5.33), r2 = bq(ac, 'highpass', 200, 2.32), r3 = bq(ac, 'lowpass', 8000, -3.01), aR = ac.createAnalyser(), aL = ac.createAnalyser();   // l'oreille : le reste (200 Hz-8 kHz), la bande grave — hors du chemin du son (⚠ Web Audio : le Q d'un passe-bas / passe-haut est en dB)
    aR.fftSize = 2048; aL.fftSize = 512; e.connect(r1); r1.connect(r2); r2.connect(r3); r3.connect(aR); lp.connect(aL);
    var X = { e: e, s: sm, dc: dc, t: -1, r: null, ring: [], a: -40, teff: null, buf: new Float32Array(2048), bufL: new Float32Array(512) };
    /* L'AVANT et L'APRÈS du compresseur restent EXACTEMENT inverses, à chaque échantillon : deux rampes géométriques (droites en dB), celle
       d'après décalée de l'avance du compresseur (le son qui en sort à t y est entré P échantillons plus tôt), posées sur la grille des
       échantillons ; le départ de chaque rampe est ANCRÉ (une rampe Web Audio part du dernier événement, pas de « maintenant » : sans l'ancre,
       elle repartait de loin en arrière). ⚠ Deux setTargetAtTime (exponentielles en valeur, pas en dB) ne sont pas inverses : mesuré, +29 dB
       sur la bande grave pendant ~0,2 s quand le dompteur s'éveillait (le limiteur du jeu à −9,7 dB). */
    var S = { t0: 0, v0: .01, t1: 0, v1: .01 };   // la rampe de l'avant (celle d'après en est le reflet : mk / avant, P échantillons plus tard)
    function val(t) { return t >= S.t1 ? S.v1 : t <= S.t0 ? S.v0 : S.v0 * Math.pow(S.v1 / S.v0, (t - S.t0) / (S.t1 - S.t0)); }
    function rampe(p, v0, v1, t0, t1) { if (p.cancelAndHoldAtTime) p.cancelAndHoldAtTime(t0); else p.cancelScheduledValues(t0); p.setValueAtTime(v0, t0); p.exponentialRampToValueAtTime(v1, t1); }
    function gains(a, T) { X.a = a; var p1 = Math.pow(10, a / 20), k = Math.ceil((ac.currentTime + .02) * sr), n = Math.max(1, Math.round(T * sr)), t0 = (k + .25) / sr, t1 = (k + n + .25) / sr, v0 = val(t0);
      S = { t0: t0, v0: v0, t1: t1, v1: p1 }; rampe(pre.gain, v0, p1, t0, t1); rampe(post.gain, mk / v0, mk / p1, (k + P + .25) / sr, (k + n + P + .25) / sr); }
    pre.gain.value = .01; post.gain.value = 100 * mk; X.gains = gains;   // au repos : 40 dB sous le seuil, le compresseur ne fait rien
    function pw(an, b) { an.getFloatTimeDomainData(b); var q = 0; for (var i = 0; i < b.length; i++) q += b[i] * b[i]; return q / b.length; }
    X.tick = function (plafond, g, niv) {   // g : ce qui joue ({kick, basse}) ou null (on ne sait pas : grosse caisse ET basse supposées) · niv : le niveau que le lecteur vient de poser
      var t = ac.currentTime; if (X.t >= 0 && t - X.t < D.pas) return; var dt = X.t < 0 ? D.pas : Math.min(.25, t - X.t); X.t = t;
      /* tout est compté HORS NIVEAU : le niveau bouge devant le bus (le plancher du départ, +11 → 0 dB en ~1,5 s, juste quand la grosse caisse
         entre ; le souffle du mouvement) — mesuré en course, la mémoire de 0,8 s retardait le dompteur de ~3 s à l'entrée de la grosse caisse */
      var nv = niv > 1e-4 ? niv : 1, ln = 20 * Math.log10(nv), pr = pw(aR, X.buf) / (nv * nv), pl = pw(aL, X.bufL) / (nv * nv);   // (le reste sur 43 ms ; la bande grave sur 11 ms, assez court pour tomber ENTRE deux coups)
      if (!(niv > 1e-4) && niv != null) return;   // le niveau à zéro (la frénésie) : on garde le réglage
      if (pr < 1e-10 && pl < 1e-10) return;   // le silence (entre deux parties) : on garde le réglage
      if (pr > 1e-10) X.r = X.r == null ? pr : X.r + (pr - X.r) * (1 - Math.exp(-dt / D.tauR));
      X.ring.push(10 * Math.log10(pl + 1e-20)); if (X.ring.length > D.nB) X.ring.shift();
      if (X.r == null) return;
      if (g && !g.kick && g.basse) { X.teff = null; if (X.a > -40) gains(-40, .15); return; }   // la basse SANS grosse caisse : jamais touchée (sans rien de grave, il reste armé : la 1re grosse caisse qui entre est déjà tenue)
      var tri = X.ring.slice().sort(function (a, b) { return a - b; }), med = tri[Math.floor(tri.length / 2)], haut = tri[tri.length - 1];
      var plaf = 10 * Math.log10(X.r) + plafond, trop = Math.max(0, haut - plaf);   // le plafond (du niveau court de la grosse caisse) · ce qu'elle a de trop
      /* le seuil vise une CRÊTE : la grosse caisse qui dépasse à peine garde sa forme (sa crête est ~3 dB au-dessus de son niveau court) ; plus
         il faut la tenir, plus le compresseur l'écrase en plateau — la crête rejoint le niveau court (mesuré) : l'écart se resserre avec le trop */
      var teff = Math.max(plaf + D.crete * Math.max(0, 1 - trop / D.prof), g && !g.basse ? -200 : med + D.crete + D.basse, haut + D.crete - D.prise * D.ratio / (D.ratio - 1));   // · au-dessus de la basse (sa crête : +3, +4 de marge) · 15 dB pris au plus
      teff += ln; X.teff = teff; gains(Math.max(-40, Math.min(40, D.seuil - teff)), .1);   // (le seuil remis au niveau du moment ; la rampe dure 0,1 s, un nouveau tick la reprend où elle en est)
    };
    return X;
  }

  MB.cree = function (ac) {
    var e = ac.createGain(), hp = bq(ac, 'highpass', 22, .7), sub = bq(ac, 'lowshelf', 65, null, 0), bas = bq(ac, 'peaking', 110, .9, 0), cr = bq(ac, 'peaking', 280, 1, 0), rc = ac.createGain(), s = ac.createGain();
    var m1 = bq(ac, 'peaking', 850, .9, 0), m2 = bq(ac, 'peaking', 1800, .9, 0);   // (22/10, le MOTEUR VIVANT) les deux creux dynamiques : là où le moteur couvre la musique (mesuré), à 0 dB tant que `moteur()` n'y touche pas
    e.connect(hp); hp.connect(sub); sub.connect(bas); bas.connect(cr); cr.connect(m1); m1.connect(m2); m2.connect(rc); rc.connect(s);
    var B = { entree: e, sortie: s, cle: '', estBrut: false, enCourse: false, p: { cle: '', sub: 0, bas: 0, kick: 0 } }, K = null, kD = null, kM = null;
    function pose(tau) { var t = ac.currentTime, f = B.estBrut ? 0 : MB.FORCE; vers(sub.gain, B.p.sub * f, t, tau); vers(bas.gain, B.p.bas * f, t, tau);
      if (K) { var on = !!B.p.kick && f > 0; vers(kD.gain, on ? 0 : 1, t, tau); vers(kM.gain, on ? 1 : 0, t, tau); } }   // (le dompteur : en `brut`, le chemin direct d'avant)
    B.piste = function (u) { B.p = MB.presetDe(u); B.cle = B.p.cle;
      if (B.p.kick && !K) { K = dompteur(ac); kD = ac.createGain(); kM = ac.createGain(); var on = !B.estBrut && MB.FORCE > 0; kD.gain.value = on ? 0 : 1; kM.gain.value = on ? 1 : 0;   // construit au départ du morceau, avant la 1re note (et posé d'emblée : en `brut`, le chemin d'avant dès le 1er échantillon)
        bas.disconnect(cr); bas.connect(kD); kD.connect(cr); bas.connect(K.e); K.s.connect(kM); kM.connect(cr); }
      pose(.05); return B.p; };
    B.tick = function (g, niv) { B.g = g || null; if (K && B.p.kick && !B.estBrut && MB.FORCE > 0) K.tick(B.p.kick + 12 * (1 - MB.FORCE), g, niv); };   // (FORCE .5 = le plafond 6 dB plus haut)
    B.brut = function (b) { B.estBrut = !!b; pose(.08); };
    B.force = function (f) { MB.FORCE = Math.max(0, Math.min(1.5, +f || 0)); pose(.08); };
    B.course = function (on) { on = !!on; if (on === B.enCourse) return; B.enCourse = on; vers(cr.gain, on ? MB.CREUX : 0, ac.currentTime, .1); };
    /* (22/10, session SON) LE CREUX DU MOTEUR VIVANT : `p` (0..1) = la présence du moteur ; la musique s'efface de `prof` dB à 850 Hz (et 70 % à 1 800 Hz) pendant que le moteur parle — lissé par l'appelant (~250 ms). Mesuré : à moteur = musique − 7 dB, c'est 630-2 500 Hz que le moteur couvre. */
    B.moteur = function (p, prof) { var t = ac.currentTime, d = (prof == null ? 3.5 : prof) * Math.max(0, Math.min(1, p || 0)); vers(m1.gain, -d, t, .25); vers(m2.gain, -d * .7, t, .25); };
    B.recul = function (db, d) { B.nRecul = (B.nRecul || 0) + 1; var t = ac.currentTime; vers(rc.gain, Math.pow(10, (db || -3) / 20), t, .01); try { rc.gain.setTargetAtTime(1, t + (d || .4), .13); } catch (x) {} };
    B._k = function () { return K; };   // (le banc)
    B.etat = function () { return { cle: B.cle, brut: B.estBrut, force: MB.FORCE, sub: +sub.gain.value.toFixed(2), bas: +bas.gain.value.toFixed(2), kick: K ? { plafond: B.p.kick, actif: kM.gain.value > .5, joue: B.g, seuil: K.teff == null ? null : +K.teff.toFixed(1), pris: +K.dc.reduction.toFixed(1), avant: +K.a.toFixed(1) } : null, course: B.enCourse, creux: +cr.gain.value.toFixed(2), recul: +rc.gain.value.toFixed(2), nRecul: B.nRecul || 0 }; };
    return B;
  };
  MB.DOMPTE = DOMPTE; W.MUSBUS = MB;
})(window);
