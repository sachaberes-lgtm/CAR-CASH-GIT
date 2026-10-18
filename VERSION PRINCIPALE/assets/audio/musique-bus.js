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
   Emploi : const b = MUSBUS.cree(ac) ; source → b.entree ; b.sortie → la suite (destination, limiteur) ; b.piste(url ou clé) ;
   b.brut(vrai/faux) = l'interrupteur (le jeu : `?basses=brut`) ; b.course(vrai/faux) ; b.recul(dB, durée) ; b.etat(). */
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
    'jeu:bleu-1540': { bas: -2 }, 'jeu:bleu-9664': { bas: -2 }, 'jeu:bleu-3392': { bas: -2 }, 'jeu:bleu-8154': { bas: -2 }, 'jeu:bleu-8042': { bas: -2 },
    'jeu:bleu-5095': { bas: -2 }, 'jeu:bleu-6167': { bas: -1 }, 'jeu:bleu-2221': { bas: -.5 }, 'jeu:pal-neon-noir': { sub: -5, bas: -2 }, 'jeu:pal-aura-30': { bas: -2 }
  };
  var MB = { PRESETS: PRESETS, FORCE: 1, CREUX: -2 };

  MB.presetDe = function (u) {   // une adresse (ou une clé) → son réglage
    var s = String(u || ''); for (var k in PRESETS) if (s.indexOf(k) >= 0) return { cle: k, sub: PRESETS[k].sub || 0, bas: PRESETS[k].bas || 0 };
    return { cle: '', sub: 0, bas: 0 };
  };
  function bq(ac, t, f, q, g) { var b = ac.createBiquadFilter(); b.type = t; b.frequency.value = f; if (q != null) b.Q.value = q; if (g != null) b.gain.value = g; return b; }
  function vers(p, v, t, tau) { try { if (p.cancelAndHoldAtTime) p.cancelAndHoldAtTime(t); else { p.cancelScheduledValues(t); p.setValueAtTime(p.value, t); } p.setTargetAtTime(v, t, tau); } catch (e) { try { p.value = v; } catch (e2) {} } }

  MB.cree = function (ac) {
    var e = ac.createGain(), hp = bq(ac, 'highpass', 22, .7), sub = bq(ac, 'lowshelf', 65, null, 0), bas = bq(ac, 'peaking', 110, .9, 0), cr = bq(ac, 'peaking', 280, 1, 0), rc = ac.createGain(), s = ac.createGain();
    e.connect(hp); hp.connect(sub); sub.connect(bas); bas.connect(cr); cr.connect(rc); rc.connect(s);
    var B = { entree: e, sortie: s, cle: '', estBrut: false, enCourse: false, p: { cle: '', sub: 0, bas: 0 } };
    function pose(tau) { var t = ac.currentTime, f = B.estBrut ? 0 : MB.FORCE; vers(sub.gain, B.p.sub * f, t, tau); vers(bas.gain, B.p.bas * f, t, tau); }
    B.piste = function (u) { B.p = MB.presetDe(u); B.cle = B.p.cle; pose(.05); return B.p; };
    B.brut = function (b) { B.estBrut = !!b; pose(.08); };
    B.force = function (f) { MB.FORCE = Math.max(0, Math.min(1.5, +f || 0)); pose(.08); };
    B.course = function (on) { on = !!on; if (on === B.enCourse) return; B.enCourse = on; vers(cr.gain, on ? MB.CREUX : 0, ac.currentTime, .1); };
    B.recul = function (db, d) { B.nRecul = (B.nRecul || 0) + 1; var t = ac.currentTime; vers(rc.gain, Math.pow(10, (db || -3) / 20), t, .01); try { rc.gain.setTargetAtTime(1, t + (d || .4), .13); } catch (x) {} };
    B.etat = function () { return { cle: B.cle, brut: B.estBrut, force: MB.FORCE, sub: +sub.gain.value.toFixed(2), bas: +bas.gain.value.toFixed(2), course: B.enCourse, creux: +cr.gain.value.toFixed(2), recul: +rc.gain.value.toFixed(2), nRecul: B.nRecul || 0 }; };
    return B;
  };
  W.MUSBUS = MB;
})(window);
