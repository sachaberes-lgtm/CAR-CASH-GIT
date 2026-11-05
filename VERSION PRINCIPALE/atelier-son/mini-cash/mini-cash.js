/* ===== LE MINI CASH : la conduite, la scène, et la voiture qui JOUE du moteur comme d'un instrument (2026-11-05, session SON) =====
   ⚠ LE SON EST DOUX (même jour, Sacha : « tous les sons sont horribles, ils font mal aux oreilles, pas du tout lo-fi ; je ne peux pas mettre de musique ;
   on ne peut pas boost ; prends le temps qu'il faut mais fais ça bien »). Ce qui a changé, MESURÉ au banc (banc.cjs) avant/après :
     · le moteur passe par le FILTRE DOUX (doux.js) : feutre à ~1,7 kHz, limiteur de crêtes qui regarde 2 ms devant, saturation de bande
       → au-dessus de 1,5 kHz : −11 dB → −26 dB ; au-dessus de 4 kHz : −11 → −41 ; claquements : +14,8 dB → +8,6 ; pics ÷ 5
     · le générateur tire des moteurs doux (peu de râpe, coups ronds, plus grave, neufs) et coupe les couches qui font mal (cliquetis, raclement, claquement direct)
     · les pneus ne sifflent plus (un « chhh » feutré), les chocs sont sourds, les pétarades du nitro sont moins nombreuses et moins fortes
     · la MUSIQUE du jeu (le menu ♪) se cale comme en jeu : moteur ≈ musique − 7 dB (chaque morceau ramené au même niveau), et la musique se creuse là où le moteur parle
     · le NITRO est sur ESPACE (comme le jeu) et Maj ; le frein à main passe sur B
   CE QUE LA CONDUITE FAIT ENTENDRE (la table de l'instrument) :
     · GAZ / LÂCHER       le moteur monte et tire ; au lâcher à haut régime, il crépite (le programme de pops du moteur vivant)
     · PASSAGE DE RAPPORT les gaz se coupent 0,16 s : le « blap » de la boîte, une flamme au pot
     · FREIN + RÉTRO      le rétrogradage donne un coup de gaz (talonnage) : le régime saute, puis ça pétarade
     · VIRAGE SERRÉ       à pleine vitesse le train arrière décroche : les pneus glissent (« chhh »), le moteur force (charge) et patine (+ régime)
     · FREIN À MAIN (B)   le dérapage franc
     · BURNOUT            gaz + frein à l'arrêt : le moteur monte haut, les pneus frottent
     · DÉCOLLAGE          les roues tournent dans le vide : gaz tenu, le moteur s'emballe juste sous le rupteur ; le vent monte
     · ATTERRISSAGE       un choc sourd, le moteur BUTE (grappe de ratés), le régime retombe d'un coup sur celui des roues, une pétarade
     · NITRO (ESPACE)     la flamme rugit (nitro vivant), le moteur crépite, la caméra s'ouvre, flamme bleue au pot
   Le régime vient d'une boîte à 6 rapports, calée pour que chaque moteur (ralenti, rupteur) tombe juste.
   RÉGLAGES D'ADRESSE : ?graine=1234 (ce moteur-là) · ?muet=1 (aucun son : navigateur de test) · ?pilote=1 (la voiture roule seule, pour un banc).
   CROCHETS : window.dbgMini() l'état · window.dbgMiniPilote({gaz,frein,dir,nitro,main}) les commandes à la main. */
(function () {
  'use strict';
  const Q = new URLSearchParams(location.search);
  const MUET = Q.get('muet') === '1', PILOTE = Q.get('pilote') === '1';
  const clamp = (x, a, b) => x < a ? a : x > b ? b : x;
  const $ = (id) => document.getElementById(id);
  const TACTILE = matchMedia('(pointer:coarse)').matches;
  if (TACTILE) document.body.classList.add('tactile');

  /* ===================== LE MOTEUR EN COURS ===================== */
  let E = null;                                  /* { graine, nom, famille, fiche, nitro, couches, sante } */
  const graine0 = parseInt(Q.get('graine'), 10) || ((Math.random() * 1e6) | 0) + 1;

  /* ===================== LE SON ===================== */
  const S = { ac: null, node: null, ok: false, rpm: 0, etat: 'off', niv: 0, cut: false, nA: 0, msgT: 0, douceur: .75, pres: 0,
    vol: { moteur: 1, nitro: .32, pneus: 1, musique: 1 } };   /* nitro .32 : à .8 il sortait 7 dB au-dessus du moteur à fond (mesuré) ; là, ~+3 dB : le boost se sent sans crier */
  function envoi(o) { if (S.node) try { S.node.port.postMessage(o); } catch (e) { } }

  /* LES MUSIQUES DU JEU (déjà rendues, en boucle) : [titre, fichier, niveau moyen mesuré en dBFS]. Les morceaux vont de −15 à −7,6 dBFS : chacun est
     ramené à MUS_CIBLE, sinon le moteur couvre les plus calmes et disparaît sous les plus forts. */
  const MUSIQUES = [
    ['Garage lo-fi', 'boucles/garage-lofi', -15.2], ['Nuit de velours', 'paliers/rendus/nuit-de-velours/p5', -12.4], ['Penthouse', 'paliers/rendus/penthouse/p5', -11.4],
    ['Néon noir', 'paliers/rendus/neon-noir/p5', -10.1], ['Glisse fusion', 'paliers/rendus/glisse-fusion/p5', -7.6], ['Ciel', 'paliers/rendus/ciel-30/p14', -11.4],
    ['Siffleur', 'paliers/rendus/siffleur-30/p14', -14.3], ['Neon drive', 'boucles/neon-drive', -15], ['Apesanteur', 'boucles/apesanteur', -15],
    ['Hypervitesse', 'boucles/hypervitesse', -15], ['Dark triad', 'boucles/dark-triad', -14.9]
  ];
  /* LES NIVEAUX (mesurés dans la page) : la musique à −17 dBFS ; le moteur à fond à ≈ −24 (le filtre doux le sort à −20,9 au bus 1,4) → 7 dB sous la musique,
     la règle du jeu (moteur-vivant.js : « calé sur musique − 7 dB »). */
  const MUS_CIBLE = -17, BUS_MOTEUR = 1.0;
  let musNorm = 1;
  const MUS_BASE = '../../assets/audio/music/';

  async function sonDemarre() {
    const ac = new (window.AudioContext || window.webkitAudioContext)({ latencyHint: 'interactive' });
    S.ac = ac;
    const base = '../../assets/audio/moteur-vivant/', F = (u) => fetch(u).then((r) => r.text());
    const [a, b, d, c] = await Promise.all([F(base + 'moteur-vivant.js'), F(base + 'nitro-vivant.js'), F('doux.js'), F('worklet-mini.js')]);
    await ac.audioWorklet.addModule(URL.createObjectURL(new Blob([a, '\n', b, '\n', d, '\n', c], { type: 'text/javascript' })));
    const node = new AudioWorkletNode(ac, 'mini-cash', { outputChannelCount: [2] });
    /* LA CHAÎNE (calée comme le jeu : moteur ≈ musique − 7 dB) :
         moteur + nitro (déjà passés au filtre doux) → coupe-bas → busMoteur ─┐
         pneus, vent, chocs → feutre 1,6 kHz → busPneus ──────────────────────┼→ colle (compresseur lent, doux) → limiteur → maître → sortie
         musique (<audio>) → creux 850 / 1 800 Hz → busMusique ───────────────┘ */
    const hp = ac.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 35; hp.Q.value = .7;
    const busMoteur = ac.createGain(); busMoteur.gain.value = BUS_MOTEUR;
    const colle = ac.createDynamicsCompressor(); colle.threshold.value = -20; colle.knee.value = 12; colle.ratio.value = 2.5; colle.attack.value = .02; colle.release.value = .3;
    const limiteur = ac.createDynamicsCompressor(); limiteur.threshold.value = -4; limiteur.knee.value = 0; limiteur.ratio.value = 20; limiteur.attack.value = .001; limiteur.release.value = .12;
    const maitre = ac.createGain(); maitre.gain.value = MUET ? 0 : .85;
    node.connect(hp); hp.connect(busMoteur); busMoteur.connect(colle); colle.connect(limiteur); limiteur.connect(maitre); maitre.connect(ac.destination);
    S.maitre = maitre; S.colle = colle;
    const ana = ac.createAnalyser(); ana.fftSize = 4096; ana.smoothingTimeConstant = 0; limiteur.connect(ana); S.ana = ana;   /* le mesureur (dbgMiniSortie), avant le maître : il mesure même en muet */
    node.port.onmessage = (e) => { const x = e.data; S.rpm = x.rpm; S.etat = x.etat; S.niv = x.niv; S.cut = x.cut; S.nA = x.nA; };
    S.node = node; S.ok = true;
    bruitsDemarre(ac, colle);
    /* la musique : un seul lecteur, branché une fois */
    const el = new Audio(); el.loop = true; el.preload = 'auto';
    const src = ac.createMediaElementSource(el);
    const c1 = ac.createBiquadFilter(); c1.type = 'peaking'; c1.frequency.value = 850; c1.Q.value = .9; c1.gain.value = 0;
    const c2 = ac.createBiquadFilter(); c2.type = 'peaking'; c2.frequency.value = 1800; c2.Q.value = .9; c2.gain.value = 0;
    const busMus = ac.createGain(); busMus.gain.value = 0;
    src.connect(c1); c1.connect(c2); c2.connect(busMus); busMus.connect(colle);
    S.mus = { el, c1, c2, g: busMus };
    envoi({ gE: S.vol.moteur, gN: S.vol.nitro, douceur: S.douceur });
    if (S.musVoulue) musique(S.musVoulue);
  }
  function musique(i) {
    S.musVoulue = i;
    if (!S.mus) return;
    const el = S.mus.el;
    if (i === '' || i == null) { el.pause(); jour('MUSIQUE', 'coupée'); return; }
    const m = MUSIQUES[+i]; if (!m) return;
    musNorm = Math.pow(10, (MUS_CIBLE - m[2]) / 20); S.mus.g.gain.value = musNorm * S.vol.musique;
    el.src = MUS_BASE + m[1] + '.m4a'; el.currentTime = 0;
    el.play().then(() => jour('MUSIQUE', m[0])).catch(() => jour('MUSIQUE', 'impossible à lire'));
  }
  /* LE CREUX : la musique recule de 3,5 dB à 850 Hz (2,5 à 1 800) pendant que le moteur parle — même réglage que le jeu (musique-bus.js) */
  function creux() {
    if (!S.mus) return; const t = S.ac.currentTime;
    const p = clamp((S.niv * S.vol.moteur * BUS_MOTEUR - .012) / .04, 0, 1); S.pres += (p - S.pres) * .1;
    S.mus.c1.gain.setTargetAtTime(-3.5 * S.pres, t, .25); S.mus.c2.gain.setTargetAtTime(-2.5 * S.pres, t, .25);
  }

  /* LES BRUITS DE LA CAISSE (pas le moteur) : pneus, roulement, vent, chocs — tous FEUTRÉS (rien au-dessus de ~1,6 kHz).
     Un seul tampon de bruit blanc, lu à des endroits différents. */
  function bruitsDemarre(ac, sortie) {
    const len = ac.sampleRate * 2, buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    S.bruit = buf;
    const src = (off) => { const s = ac.createBufferSource(); s.buffer = buf; s.loop = true; s.start(0, off); return s; };
    const bq = (t, f, q) => { const b = ac.createBiquadFilter(); b.type = t; b.frequency.value = f; b.Q.value = q; return b; };
    const g0 = () => { const g = ac.createGain(); g.gain.value = 0; return g; };
    const feutre = bq('lowpass', 1600, .6), bus = ac.createGain(); bus.gain.value = S.vol.pneus; feutre.connect(bus); bus.connect(sortie); S.busPneus = bus; S.feutre = feutre;
    /* LA GLISSE : un « chhh » large (le pneu qui frotte) et, dessous, une bande un peu chantante mais grave (pas le sifflet aigu d'un crissement) */
    const n1 = src(0), c1 = bq('bandpass', 620, .9), n2 = src(.7), c2 = bq('bandpass', 820, 4.5), gc = g0();
    const k2 = ac.createGain(); k2.gain.value = .6;
    n1.connect(c1); c1.connect(gc); n2.connect(c2); c2.connect(k2); k2.connect(gc); gc.connect(feutre);
    /* ROULEMENT : le grave du bitume sous les roues */
    const n4 = src(1.1), lr = bq('lowpass', 150, .7), gr = g0(); n4.connect(lr); lr.connect(gr); gr.connect(feutre);
    /* VENT */
    const n5 = src(1.6), lv = bq('bandpass', 500, .6), gv = g0(); n5.connect(lv); lv.connect(gv); gv.connect(feutre);
    S.cri = { g: gc, f2: c2 }; S.roule = gr; S.vent = { g: gv, f: lv };
  }
  /* UN CHOC : `f` 0..1 — un coup SOURD (la caisse qui retombe sur ses amortisseurs), un bruit mat, à peine de tôle */
  function choc(f) {
    const ac = S.ac; if (!ac || !S.bruit) return; const t = ac.currentTime;
    const o = ac.createOscillator(), go = ac.createGain();
    o.frequency.setValueAtTime(70, t); o.frequency.exponentialRampToValueAtTime(32, t + .3);
    go.gain.setValueAtTime(.001, t); go.gain.linearRampToValueAtTime(.4 * f, t + .015); go.gain.exponentialRampToValueAtTime(.001, t + .42);
    o.connect(go); go.connect(S.feutre); o.start(t); o.stop(t + .45);
    const s = ac.createBufferSource(); s.buffer = S.bruit; const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 260 + 200 * f;
    const gs = ac.createGain(); gs.gain.setValueAtTime(.001, t); gs.gain.linearRampToValueAtTime(.25 * f, t + .008); gs.gain.exponentialRampToValueAtTime(.001, t + .16);
    s.connect(lp); lp.connect(gs); gs.connect(S.feutre); s.start(t, Math.random()); s.stop(t + .2);
    const s2 = ac.createBufferSource(); s2.buffer = S.bruit; const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 480 + 120 * Math.random(); bp.Q.value = 2;
    const g2 = ac.createGain(); g2.gain.setValueAtTime(.001, t); g2.gain.linearRampToValueAtTime(.08 * f, t + .008); g2.gain.exponentialRampToValueAtTime(.001, t + .08);
    s2.connect(bp); bp.connect(g2); g2.connect(S.feutre); s2.start(t, Math.random()); s2.stop(t + .1);
  }

  /* ===================== CHARGER UN MOTEUR ===================== */
  const COUCHES_DOUCES = { dry: .35, knock: 0, grind: 0, rod: .3, tick: .3, tink: .5, clank: .5, turbo: .45, starter: .7, intake: .8, pipe: 1 };
  function charge(m, demarre) {
    E = m;
    /* (un moteur du garage gardé avant le son doux n'a pas de `couches` : on lui donne celles du générateur doux) */
    envoi({ fiche: m.fiche, nitro: m.nitro, couches: m.couches || COUCHES_DOUCES, sante: m.sante, demarre: !!demarre });
    GB.K = m.fiche.limit / (17 * GB.rat[0]);
    S.etat = demarre ? 'crank' : 'run'; V.allumeT = 0; V.rpm = m.fiche.idle;
    const nom = $('nom'); nom.firstChild.nodeValue = m.nom;
    nom.lastChild.textContent = m.fiche.n + ' cyl. · ralenti ' + m.fiche.idle + ' · rupteur ' + m.fiche.limit + ' tr/min' + (m.sante < 1 ? ' · USÉ ' + Math.round(m.sante * 100) + ' %' : '') + ' · graine ' + m.graine;
    try { history.replaceState(null, '', '?graine=' + m.graine + (MUET ? '&muet=1' : '') + (PILOTE ? '&pilote=1' : '')); } catch (e) { }
    curseursRemplis(); ficheAffiche();
    jour(m.mute ? 'COUSIN' : 'NOUVEAU MOTEUR', m.nom);
  }
  function genere() { charge(MiniGen.genere(((Math.random() * 1e6) | 0) + 1), false); }   /* tout de suite en marche : on compare vite (le démarreur ne joue qu'au premier allumage) */
  function cousin() { if (E) charge(MiniGen.mute(E, .28), false); }

  /* LE GARAGE : les moteurs gardés (ce navigateur seulement — c'est un confort, la graine suffit à retrouver un moteur non retouché) */
  const GAR_CLE = 'miniCashGarage';
  function garageLit() { try { return JSON.parse(localStorage.getItem(GAR_CLE) || '[]'); } catch (e) { return []; } }
  function garageEcrit(l) { try { localStorage.setItem(GAR_CLE, JSON.stringify(l)); } catch (e) { } }
  function garageAffiche() {
    const l = garageLit(), s = $('garage');
    s.innerHTML = '<option value="">Garage (' + l.length + ')</option>' + l.map((m, i) => '<option value="' + i + '">' + m.nom.replace(/</g, '') + '</option>').join('');
  }
  function garde() {
    if (!E) return; const l = garageLit();
    if (l.some((m) => m.nom === E.nom && m.graine === E.graine)) { jour('DÉJÀ AU GARAGE'); return; }
    l.unshift(JSON.parse(JSON.stringify(E))); garageEcrit(l.slice(0, 40)); garageAffiche(); jour('GARDÉ', E.nom);
  }

  /* ===================== LES RÉGLAGES (« sous le capot ») ===================== */
  const CURS = [
    { k: 'douceur', nom: 'Douceur (0 = brut, 1 = très feutré)', min: 0, max: 1, pas: .01, cible: 'douceur' },
    { k: 'vMusique', nom: 'Volume musique', min: 0, max: 2, pas: .05, cible: 'vol', vrai: 'musique' },
    { k: 'lope', nom: 'Gargouillis', min: 0, max: 1, pas: .01, cible: 'cfg' },
    { k: 'rasp', nom: 'Râpe', min: .05, max: 1, pas: .01, cible: 'cfg' },
    { k: 'popRate', nom: 'Pétarades au lâcher', min: 0, max: 1.2, pas: .01, cible: 'cfg' },
    { k: 'pitch', nom: 'Grave ↔ aigu', min: .45, max: 1.05, pas: .01, cible: 'cfg' },
    { k: 'intake', nom: 'Souffle d\'admission', min: 0, max: .8, pas: .01, cible: 'cfg' },
    { k: 'sante', nom: 'Usure (1 = neuf)', min: .15, max: 1, pas: .01, cible: 'sante' },
    { k: 'popRateN', nom: 'Crépitement du nitro', min: 0, max: 45, pas: 1, cible: 'nitro', vrai: 'popRate' },
    { k: 'roarF', nom: 'Flamme du nitro (grave ↔ clair)', min: 100, max: 500, pas: 5, cible: 'nitro' },
    { k: 'vMoteur', nom: 'Volume moteur', min: 0, max: 2, pas: .05, cible: 'vol', vrai: 'moteur' },
    { k: 'vNitro', nom: 'Volume nitro', min: 0, max: 2, pas: .05, cible: 'vol', vrai: 'nitro' },
    { k: 'vPneus', nom: 'Volume pneus et chocs', min: 0, max: 2, pas: .05, cible: 'vol', vrai: 'pneus' }
  ];
  function valeurDe(c) {
    if (c.cible === 'douceur') return S.douceur;
    if (c.cible === 'vol') return S.vol[c.vrai];
    if (!E) return 0;
    if (c.cible === 'cfg') return E.fiche[c.k];
    if (c.cible === 'sante') return E.sante;
    if (c.cible === 'nitro') return E.nitro[c.vrai || c.k];
    return S.vol[c.vrai];
  }
  function curseursConstruit() {
    $('curseurs').innerHTML = CURS.map((c) => '<label>' + c.nom + '<output id="o_' + c.k + '"></output><input type="range" id="c_' + c.k + '" min="' + c.min + '" max="' + c.max + '" step="' + c.pas + '"></label>').join('');
    CURS.forEach((c) => {
      $('c_' + c.k).addEventListener('input', (e) => {
        const v = +e.target.value; $('o_' + c.k).textContent = v;
        if (c.cible === 'douceur') { S.douceur = v; envoi({ douceur: v }); return; }
        if (c.cible === 'vol') {
          S.vol[c.vrai] = v; envoi({ gE: S.vol.moteur, gN: S.vol.nitro });
          if (S.busPneus) S.busPneus.gain.value = S.vol.pneus; if (S.mus) S.mus.g.gain.value = musNorm * S.vol.musique; return;
        }
        if (!E) return;
        if (c.cible === 'cfg') { E.fiche[c.k] = v; envoi({ cfg: { [c.k]: v } }); }
        else if (c.cible === 'sante') { E.sante = v; }
        else if (c.cible === 'nitro') { E.nitro[c.vrai || c.k] = v; envoi({ nitroP: { [c.vrai || c.k]: v } }); }
        ficheAffiche();
      });
    });
  }
  function curseursRemplis() { CURS.forEach((c) => { const v = valeurDe(c); $('c_' + c.k).value = v; $('o_' + c.k).textContent = +(+v).toFixed(3); }); }
  function ficheAffiche() { if (E) $('fiche').textContent = JSON.stringify({ nom: E.nom, graine: E.graine, sante: E.sante, fiche: E.fiche }, null, 0); }

  /* le journal : chaque réaction de l'instrument s'affiche (on VOIT ce qu'on entend) */
  let jourDer = {};
  function jour(t, sous) {
    const now = performance.now(); if (jourDer[t] && now - jourDer[t] < 700) return; jourDer[t] = now;
    const el = document.createElement('div'); el.innerHTML = '<b>' + t + '</b>' + (sous ? ' · ' + String(sous).replace(/</g, '') : '');
    const j = $('jour'); j.prepend(el); while (j.children.length > 6) j.lastChild.remove();
    setTimeout(() => el.remove(), 2500);
  }

  /* ===================== LA SCÈNE ===================== */
  const canvas = $('scene');
  const rd = new THREE.WebGLRenderer({ canvas: canvas, antialias: !TACTILE, powerPreference: 'high-performance' });
  rd.setPixelRatio(Math.min(window.devicePixelRatio || 1, TACTILE ? 1.5 : 2));
  const scene = new THREE.Scene();
  const CIEL = new THREE.Color('#8fc3ff');
  scene.background = CIEL; scene.fog = new THREE.Fog(CIEL, 120, 900);
  const cam = new THREE.PerspectiveCamera(62, 1, .1, 2000);
  scene.add(new THREE.HemisphereLight(0xdfefff, 0x445066, 1.0));
  const soleil = new THREE.DirectionalLight(0xfff1d6, 1.0); soleil.position.set(80, 140, 40); scene.add(soleil);

  /* le sol : un damier de dalles de 8 m (les lignes donnent la vitesse à l'œil) */
  (function () {
    const cv = document.createElement('canvas'); cv.width = cv.height = 256; const g = cv.getContext('2d');
    g.fillStyle = '#3a4150'; g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 1800; i++) { g.fillStyle = 'rgba(255,255,255,' + (Math.random() * .05) + ')'; g.fillRect(Math.random() * 256, Math.random() * 256, 2, 2); }
    g.fillStyle = '#4a5265'; g.fillRect(0, 0, 128, 128); g.fillRect(128, 128, 128, 128);
    g.strokeStyle = 'rgba(255,214,90,.55)'; g.lineWidth = 3; g.strokeRect(1.5, 1.5, 253, 253);
    const tx = new THREE.CanvasTexture(cv); tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.repeat.set(250, 250); tx.anisotropy = 4;
    const sol = new THREE.Mesh(new THREE.PlaneGeometry(4000, 4000), new THREE.MeshLambertMaterial({ map: tx }));
    sol.rotation.x = -Math.PI / 2; scene.add(sol);
  })();

  /* LES OBSTACLES : tremplins (coin qui monte puis tombe net → on décolle) et bosses (douces → petits sauts, la suspension travaille) */
  const RAMPES = [], BOSSES = [];
  (function () {
    const r = MiniGen.Rng(20261105);
    const ajouteRampe = (x, z, yaw, L, W, H, coul) => {
      RAMPES.push({ x, z, yaw, L, W, H, c: Math.cos(yaw), s: Math.sin(yaw) });
      const g = new THREE.BufferGeometry(), w = W / 2;
      /* coordonnées locales : x en travers, z le long de la pente (0 → L), y la hauteur */
      const p = [[-w, 0, 0], [w, 0, 0], [w, H, L], [-w, H, L], [-w, 0, L], [w, 0, L]];
      const tri = [0, 2, 1, 0, 3, 2, 3, 5, 2, 3, 4, 5, 0, 4, 3, 1, 2, 5];
      const pos = []; tri.forEach((i) => pos.push(...p[i]));
      g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.computeVertexNormals();
      const m = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ color: coul, side: THREE.DoubleSide }));
      m.position.set(x, 0, z); m.rotation.y = yaw; scene.add(m);
    };
    const ajouteBosse = (x, z, R, A) => {
      BOSSES.push({ x, z, R, A });
      const g = new THREE.SphereGeometry(1, 24, 10, 0, Math.PI * 2, 0, Math.PI / 2);
      const m = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ color: 0x6b7894 })); m.scale.set(R * .78, A, R * .78); m.position.set(x, 0, z); scene.add(m);
    };
    /* devant le départ, en ligne : un petit, un moyen, un grand (on trouve tout de suite) */
    ajouteRampe(0, 70, 0, 9, 7, 1.6, 0xffb02e); ajouteRampe(0, 190, 0, 14, 8, 3.2, 0xff7a2e); ajouteRampe(0, 380, 0, 20, 10, 5.5, 0xff4d5e);
    for (let i = 0; i < 40; i++) {
      const a = r() * Math.PI * 2, d = 90 + r() * 650, x = Math.cos(a) * d, z = Math.sin(a) * d;
      if (Math.abs(x) < 14 && z > 0 && z < 420) continue;
      if (r() < .55) { const H = 1.2 + r() * 4.5; ajouteRampe(x, z, r() * Math.PI * 2, 6 + H * 2.6, 6 + r() * 5, H, [0xffb02e, 0xff7a2e, 0x35d0ff, 0xb46bff][i % 4]); }
      else ajouteBosse(x, z, 6 + r() * 10, .6 + r() * 1.6);
    }
    for (let i = 0; i < 6; i++) ajouteBosse(-30 + i * 12, 120 + (i % 2) * 6, 5, .7);   /* une rangée de bosses à côté de la ligne de tremplins */
  })();
  function solH(x, z) {
    let h = 0;
    for (let i = 0; i < RAMPES.length; i++) {
      const R = RAMPES[i], dx = x - R.x, dz = z - R.z;
      const lx = dx * R.c - dz * R.s, lz = dx * R.s + dz * R.c;      /* inverse de la rotation de la rampe autour de y */
      if (lz >= 0 && lz <= R.L && Math.abs(lx) <= R.W / 2) h = Math.max(h, R.H * lz / R.L);
    }
    for (let i = 0; i < BOSSES.length; i++) {
      const B = BOSSES[i], d = Math.hypot(x - B.x, z - B.z);
      if (d < B.R) h = Math.max(h, B.A * (.5 + .5 * Math.cos(Math.PI * d / B.R)));
    }
    return h;
  }

  /* LA VOITURE : allégée (des boîtes, pas de modèle), mais lisible : caisse, habitacle, aileron, quatre roues, deux pots qui crachent */
  const car = new THREE.Group(), caisse = new THREE.Group(); car.add(caisse); scene.add(car);
  const matC = new THREE.MeshLambertMaterial({ color: 0xffb02e }), matN = new THREE.MeshLambertMaterial({ color: 0x15181f }), matV = new THREE.MeshLambertMaterial({ color: 0x223044 });
  const bx = (w, h, l, m, x, y, z) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, l), m); o.position.set(x, y, z); caisse.add(o); return o; };
  bx(1.9, .5, 4.2, matC, 0, .55, 0); bx(1.6, .45, 2.0, matV, 0, 1.02, -.25); bx(1.95, .1, .5, matN, 0, 1.15, -2.0); bx(.12, .35, .12, matN, -.7, .95, -2.0); bx(.12, .35, .12, matN, .7, .95, -2.0);
  bx(1.92, .12, .3, matN, 0, .38, 2.1);
  const roues = [];
  [[-.95, 1.35], [.95, 1.35], [-.95, -1.35], [.95, -1.35]].forEach(([x, z]) => {
    const pivot = new THREE.Group(); pivot.position.set(x, .38, z); car.add(pivot);
    const r = new THREE.Mesh(new THREE.CylinderGeometry(.38, .38, .32, 16), matN); r.rotation.z = Math.PI / 2; pivot.add(r);
    roues.push({ pivot, r, avant: z > 0 });
  });
  const flammes = [-.45, .45].map((x) => {
    const m = new THREE.Mesh(new THREE.ConeGeometry(.16, 1, 10), new THREE.MeshBasicMaterial({ color: 0xff8a2a, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
    m.rotation.x = -Math.PI / 2; m.position.set(x, .42, -2.2); caisse.add(m); return m;
  });

  /* ===================== LA CONDUITE ===================== */
  const GB = { rat: [3.4, 2.3, 1.72, 1.32, 1.06, .87], g: 1, shiftT: 0, blipT: 0, K: 1 };
  const V = { x: 0, z: 0, y: 0, vy: 0, yaw: 0, yawR: 0, vF: 0, vL: 0, air: false, airT: 0, dir: 0, rpm: 800, thrS: 0, thrHi: 0, nit: 1, nitOn: false, flamme: 0, flBleu: 0,
    derap: 0, cri: 0, burn: false, recul: false, roll: 0, pitch: 0, secousse: 0, allumeT: 0, liftT: 0, crepT: 0, ancienRupt: false, vitMax: 0 };
  const K = { gaz: 0, frein: 0, g: 0, d: 0, nitro: 0, main: 0 };
  const T = { gaz: 0, frein: 0, g: 0, d: 0, nitro: 0 };       /* le tactile */
  let PIL = null;                                           /* dbgMiniPilote : commandes imposées */

  function commandes() {
    if (PIL) return PIL;
    if (PILOTE) { const t = performance.now() / 1000; return { gaz: (t % 9) < 6.5 ? 1 : 0, frein: 0, dir: Math.sin(t * .35) * .6, nitro: (t % 9) > 4 && (t % 9) < 6 ? 1 : 0, main: 0 }; }
    return { gaz: Math.max(K.gaz, T.gaz), frein: Math.max(K.frein, T.frein), dir: (Math.max(K.g, T.g) - Math.max(K.d, T.d)), nitro: Math.max(K.nitro, T.nitro), main: K.main };
  }

  function pas(dt) {
    const C = E.fiche, idle = C.idle, lim = C.limit, cm = commandes();
    const marche = S.etat === 'run' || S.etat === 'catch' || !S.ok;     /* sans son (pas encore démarré), on roule quand même */
    if (S.ok && (S.etat === 'off' || S.etat === 'crank')) { V.allumeT += dt; if (V.allumeT > 4) { envoi({ ev: 'allume' }); V.allumeT = 0; } }
    const fx = Math.sin(V.yaw), fz = Math.cos(V.yaw), rx = Math.cos(V.yaw), rz = -Math.sin(V.yaw);
    let gaz = marche ? cm.gaz : 0, frein = cm.frein;
    /* marche arrière : à l'arrêt, frein tenu sans gaz → on recule ; le frein devient l'accélérateur */
    if (!V.recul && Math.abs(V.vF) < .6 && frein > .5 && gaz < .05 && !V.air) V.recul = true;
    if (V.recul && (gaz > .05 || V.vF > .6)) V.recul = false;
    V.burn = !V.air && gaz > .5 && frein > .5 && Math.abs(V.vF) < 5;
    const nitroVeut = cm.nitro > .5 && V.nit > .02 && marche;
    if (nitroVeut && !V.nitOn) { jour('NITRO'); envoi({ ev: 'ignite' }); }
    V.nitOn = nitroVeut;
    V.nit = clamp(V.nit + (V.nitOn ? -dt * .28 : dt * .07), 0, 1);
    if (V.nitOn) gaz = 1;
    V.dir += (cm.dir - V.dir) * Math.min(1, dt * 7);

    /* ---- le régime et la boîte ---- */
    const vAbs = Math.abs(V.vF), roueRpm = vAbs * (V.recul ? GB.rat[0] : GB.rat[GB.g - 1]) * GB.K;
    if (GB.shiftT > 0) GB.shiftT -= dt;
    if (GB.blipT > 0) GB.blipT -= dt;
    if (!V.air && !V.recul && !V.burn && GB.shiftT <= 0) {
      /* on ne passe le rapport que si les ROUES sont au régime (sinon un burnout ou un patinage monterait les rapports dans le vide) */
      if (GB.g < 6 && V.rpm > lim * .94 && roueRpm > lim * .85 && gaz > .3) { GB.g++; GB.shiftT = .16; V.flamme = Math.max(V.flamme, .5); }
      else if (GB.g > 1 && V.rpm < Math.max(idle * 2.1, lim * .34)) { GB.g--; GB.shiftT = .14; if (frein > .3) { GB.blipT = .2; jour('RÉTRO', 'talonnage'); } }
    }
    if (V.recul) GB.g = 1;
    let rpmT, accel = 0;
    if (V.air) {
      /* en l'air : les roues sont libres, le moteur s'emballe (gaz) ou retombe (pied levé) */
      rpmT = gaz > .05 ? lim * .96 : idle * 1.15;   /* juste SOUS le rupteur : en l'air le moteur chante, il ne cogne pas (le rupteur claque, c'est la pire crête mesurée) */
      V.rpm += (rpmT - V.rpm) * Math.min(1, dt * (gaz > .05 ? 5 : 2.2));
    } else {
      const glisse = !V.recul && GB.g === 1 && gaz > .05 ? idle + (3900 - idle) * gaz * clamp(1 - vAbs / 12, 0, 1) : 0;
      const patine = V.burn ? lim * (.72 + .2 * gaz) : V.derap > .2 && gaz > .3 ? 700 * V.derap : 0;
      rpmT = GB.shiftT > 0 ? Math.max(idle, roueRpm) : Math.max(idle, roueRpm + patine, glisse, V.burn ? patine : 0);
      V.rpm += (rpmT - V.rpm) * Math.min(1, dt * (rpmT > V.rpm ? 10 : 15));
      /* la poussée : la courbe de couple (creuse en bas, pleine au milieu, qui tombe au rupteur), divisée par le rapport */
      if (!V.burn && GB.shiftT <= 0) {
        const pw = Math.sin(Math.PI * clamp(V.rpm / (lim * 1.1), .15, 1));
        if (V.recul) accel = -frein * 7;
        else if (roueRpm < lim - 20 || V.nitOn) accel = gaz * (30 / (1 + GB.g * .5)) * (.55 + .5 * pw);
        if (V.nitOn) accel += 13;
      }
      accel -= V.vF * .015 + V.vF * Math.abs(V.vF) * .0011;
      if (gaz < .05 && !V.recul) accel -= Math.sign(V.vF) * (1.1 + V.rpm / 7000);
      if (frein > .05 && !V.recul && !V.burn) accel -= Math.sign(V.vF) * Math.min(28 * frein, vAbs / dt);
      if (V.recul && gaz < .05 && frein < .05) accel -= Math.sign(V.vF) * Math.min(4, vAbs / dt);
      if (cm.main) accel -= Math.sign(V.vF) * Math.min(6, vAbs / dt);
    }
    V.vF += accel * dt;
    if (V.recul) V.vF = Math.max(V.vF, -7);
    if (V.burn) V.vF *= 1 - dt * 3;

    /* ---- la direction et le dérapage ---- */
    const tourne = clamp(vAbs / 6, 0, 1) * (1.55 - .65 * clamp(vAbs / 60, 0, 1)) * (V.air ? .25 : 1);
    const lache = !V.air && (cm.main || (Math.abs(V.dir) > .7 && vAbs > 17));
    const yawT = V.dir * tourne * Math.sign(V.vF || 1) * (cm.main ? 1.5 : lache ? 1.28 : 1);
    V.yawR += (yawT - V.yawR) * Math.min(1, dt * (V.air ? 2 : 6));
    if (V.burn) V.yawR += Math.sin(performance.now() / 90) * .4 * dt * 10 * gaz * .1;
    /* la vitesse dans le repère de la caisse : la caisse tourne, la vitesse suit avec du retard = le travers */
    let vx = fx * V.vF + rx * V.vL, vz = fz * V.vF + rz * V.vL;
    V.yaw += V.yawR * dt;
    const nfx = Math.sin(V.yaw), nfz = Math.cos(V.yaw), nrx = Math.cos(V.yaw), nrz = -Math.sin(V.yaw);
    V.vF = vx * nfx + vz * nfz; V.vL = vx * nrx + vz * nrz;
    if (!V.air) V.vL *= Math.exp(-(cm.main ? 1.1 : lache ? 2.4 : 9) * dt);
    vx = nfx * V.vF + nrx * V.vL; vz = nfz * V.vF + nrz * V.vL;
    V.x += vx * dt; V.z += vz * dt;
    V.derap = V.air ? 0 : clamp((Math.abs(V.vL) - 1.2) / 6, 0, 1);

    /* ---- la hauteur : on suit le sol tant que la gravité le permet, sinon on vole ---- */
    const h = solH(V.x, V.z), G = 22;
    if (!V.air) {
      const yBal = V.y + V.vy * dt - .5 * G * dt * dt;
      if (h >= yBal - .002) { const vy = clamp((h - V.y) / dt, -20, 20); V.vy += (vy - V.vy) * .6; V.y = h; }
      else { V.air = true; V.airT = 0; V.y = yBal; V.vy -= G * dt; V.decol = { vy: V.vy, h, x: V.x, z: V.z, dt, vF: V.vF }; if (V.vy > 3) jour('DÉCOLLAGE', Math.round(V.vy * 10) / 10 + ' m/s'); }
    } else {
      V.airT += dt; V.vy -= G * dt; V.y += V.vy * dt;
      if (V.y <= h) {
        const imp = -V.vy; V.air = false; V.y = h; V.vy = 0;
        if (imp > 2.5 && V.airT > .12) atterrit(clamp(imp / 17, 0, 1.2));
      }
    }

    /* ---- l'instrument : tout ce qui part au moteur ---- */
    const thrEnv = GB.shiftT > .04 && !V.air ? 0 : GB.blipT > 0 ? Math.max(gaz, .85) : gaz;
    V.thrS = thrEnv > V.thrS ? Math.min(thrEnv, V.thrS + dt * 14) : thrEnv;
    /* le lâcher à haut régime : une flamme (le moteur vivant fait les pops lui-même) */
    /* (le pied du pilote, pas la pédale vue par le moteur : la coupure d'un passage de rapport n'est pas un lâcher) */
    if (V.thrHi > .5 && gaz < .06 && V.rpm > lim * .45) { V.flamme = Math.max(V.flamme, .8); V.liftT = .9; jour('LÂCHER', 'crépitements'); }
    V.thrHi = Math.max(gaz, V.thrHi - dt * 3.5);
    if (V.liftT > 0) { V.liftT -= dt; if (Math.random() < dt * 14) V.flamme = Math.max(V.flamme, .3 + Math.random() * .6); }
    /* le nitro : des rafales de pops dans l'échappement en plus de la flamme du nitro */
    if (V.nitOn) {
      V.flBleu = 1; V.crepT -= dt;
      /* (doux : ~2 par seconde et moitié moins forts qu'avant — banc.cjs, PAGE.popGap / popA, en miroir) */
      if (V.crepT <= 0) { V.crepT = .28 + Math.random() * .5; envoi({ ev: 'pop', a: .2 + Math.random() * .3 }); if (Math.random() < .2) envoi({ ev: 'pop', a: .15 + Math.random() * .15, t: .03 + Math.random() * .05 }); V.flamme = Math.max(V.flamme, .7 + Math.random() * .3); }
    } else V.flBleu = Math.max(0, V.flBleu - dt * 2.5);
    const rN = clamp(V.rpm / lim, 0, 1.1);
    let charge = 0;
    if (V.thrS > .05) {
      charge = V.air ? .35 : V.burn ? .9 : clamp(.78 + .22 * rN, 0, 1);
      if (!V.air) charge = clamp(charge + .25 * V.derap + clamp(V.vy / 6, 0, .3), 0, 1);   /* virage serré, montée de rampe : le moteur FORCE */
      if (V.nitOn) charge = 1;
    }
    const rupt = V.thrS > .6 && V.rpm >= lim - 70;
    if (rupt && !V.ancienRupt) jour('RUPTEUR', V.air ? 'en l\'air' : V.burn ? 'burnout' : '');
    V.ancienRupt = rupt;
    if (V.derap > .35) jour('DÉRAPAGE'); if (V.burn) jour('BURNOUT');
    const now = performance.now();
    if (now - S.msgT > 22) {
      S.msgT = now;
      envoi({ c: { rpmCmd: Math.min(lim, V.rpm * (V.nitOn ? 1.04 : 1)), thr: V.thrS, load: charge, health: E.sante }, n: { nit: V.nitOn ? 1 : 0, speed: clamp(vAbs / 70, 0, 1) } });
    }
    V.cri = Math.max(V.derap, V.burn ? .9 : 0, (!V.air && frein > .5 && vAbs > 14 && !V.recul) ? .45 : 0, (!V.air && GB.g === 1 && gaz > .8 && vAbs < 7 && vAbs > .5) ? .35 : 0);
    V.vitMax = Math.max(V.vitMax, vAbs);
  }

  function atterrit(f) {
    jour('ATTERRISSAGE', f > .7 ? 'violent' : f > .35 ? 'franc' : 'léger');
    choc(Math.min(1, f));
    if (f > .2) envoi({ ev: 'coup', a: Math.min(.5, f * .5) });           /* le moteur bute : une grappe de ratés */
    if (f > .3) { envoi({ ev: 'pop', a: .4 }); V.flamme = 1; }
    V.vF *= 1 - .06 * f; V.secousse = Math.max(V.secousse, .6 * f);
    V.pitch += .12 * f;
  }

  /* ===================== LE SON DE LA CAISSE (chaque image) ===================== */
  function sonCaisse() {
    if (!S.cri) return; const t = S.ac.currentTime, vAbs = Math.abs(V.vF);
    S.cri.g.gain.setTargetAtTime(V.cri * .06, t, .08);   /* à .22 la glisse sortait à −15 dBFS, plus fort que le moteur (mesuré) */
    const w = 1 + .05 * Math.sin(t * 23) + .03 * (Math.random() - .5);
    S.cri.f2.frequency.setTargetAtTime((720 + 160 * V.cri) * w, t, .05);
    S.roule.gain.setTargetAtTime(V.air ? 0 : clamp(vAbs / 45, 0, 1) * .14, t, .05);
    S.vent.g.gain.setTargetAtTime(Math.pow(clamp(vAbs / 70, 0, 1.2), 2) * .07 + (V.air ? .02 : 0), t, .15);
    S.vent.f.frequency.setTargetAtTime(380 + vAbs * 8, t, .15);
  }

  /* ===================== L'IMAGE ===================== */
  const camPos = new THREE.Vector3(0, 4, -9), camVise = new THREE.Vector3();
  function image(dt) {
    car.position.set(V.x, V.y, V.z); car.rotation.y = V.yaw;
    /* l'assiette : roulis en virage, cabré à l'accélération, nez qui suit la trajectoire en l'air */
    const rollT = clamp(-V.yawR * V.vF * .012 - V.vL * .02, -.18, .18);
    const pitchT = V.air ? clamp(-Math.atan2(V.vy, Math.max(4, Math.abs(V.vF))) * .7, -.5, .5) : clamp(-V.thrS * .03 + (K.frein || T.frein ? .04 : 0), -.08, .08);
    V.roll += (rollT - V.roll) * Math.min(1, dt * 6); V.pitch += (pitchT - V.pitch) * Math.min(1, dt * (V.air ? 3 : 8));
    caisse.rotation.set(V.pitch, 0, V.roll);
    roues.forEach((w) => { w.r.rotation.x += V.vF * dt / .38 * (V.burn ? 6 : 1); if (w.avant) w.pivot.rotation.y = V.dir * .45; });
    /* les flammes : orange au lâcher, bleues au nitro */
    V.flamme = Math.max(V.flamme - dt * 5, V.nitOn ? .6 + Math.random() * .4 : 0);
    flammes.forEach((m) => {
      const a = V.flamme * (.6 + .4 * Math.random());
      m.material.opacity = clamp(a, 0, 1); m.scale.set(1 + a * .5, .4 + a * (V.flBleu > .5 ? 2.6 : 1.4), 1 + a * .5); m.position.z = -2.2 - m.scale.y * .5;
      m.material.color.setHex(V.flBleu > .5 ? 0x5aa2ff : 0xff8a2a);
    });
    /* la caméra : derrière, souple ; s'ouvre avec la vitesse et le nitro, tremble à l'atterrissage */
    const fx = Math.sin(V.yaw), fz = Math.cos(V.yaw), vAbs = Math.abs(V.vF);
    const recul = 8.5 + vAbs * .04, haut = 3.2 + (V.air ? 1 : 0);
    camPos.lerp(new THREE.Vector3(V.x - fx * recul, V.y + haut, V.z - fz * recul), Math.min(1, dt * 5));
    V.secousse = Math.max(0, V.secousse - dt * 2.2);
    const sk = V.secousse * V.secousse;
    cam.position.set(camPos.x + (Math.random() - .5) * sk, Math.max(.6, camPos.y + (Math.random() - .5) * sk), camPos.z + (Math.random() - .5) * sk);
    camVise.set(V.x + fx * 4, V.y + 1, V.z + fz * 4); cam.lookAt(camVise);
    const fov = 62 + clamp(vAbs / 70, 0, 1) * 12 + V.flBleu * 8;
    if (Math.abs(cam.fov - fov) > .05) { cam.fov += (fov - cam.fov) * Math.min(1, dt * 4); cam.updateProjectionMatrix(); }
    soleil.position.set(V.x + 80, 140, V.z + 40); soleil.target.position.set(V.x, 0, V.z); soleil.target.updateMatrixWorld();
    rd.render(scene, cam);
  }
  let hudT = 0;
  function hud() {
    const t = performance.now(); if (t - hudT < 80) return; hudT = t;
    const kmh = Math.round(Math.abs(V.vF) * 3.6);
    $('vit').firstChild.nodeValue = kmh;
    $('rapport').textContent = V.recul ? 'R' : V.air ? '~' : String(GB.g);
    const rpm = S.ok ? S.rpm : V.rpm, lim = E ? E.fiche.limit : 7000;
    $('rpmB').firstChild.style.width = clamp(rpm / lim * 100, 0, 100) + '%';
    $('rpmT').textContent = Math.round(rpm) + ' tr/min' + (S.ok && S.etat !== 'run' ? ' · ' + ({ crank: 'DÉMARREUR', catch: 'IL PREND', off: 'ÉTEINT', stall: 'CALAGE', pause: '…' }[S.etat] || S.etat) : '') + (V.burn ? ' · BURNOUT' : '');
    $('nitB').firstChild.style.width = Math.round(V.nit * 100) + '%';
  }

  function taille() { const w = innerWidth, h = innerHeight; rd.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); }
  addEventListener('resize', taille); taille();

  let tPrec = performance.now();
  function boucle() {
    const t = performance.now(); let dt = Math.min(.05, (t - tPrec) / 1000);
    if (dt < .002) { requestAnimationFrame(boucle); return; }          /* deux images au même instant : rien à avancer (et pas de division par ~0) */
    tPrec = t;
    if (E) { const n = dt > .02 ? 2 : 1; for (let i = 0; i < n; i++) pas(dt / n); if (S.ok) { sonCaisse(); creux(); } image(dt); hud(); }
    requestAnimationFrame(boucle);
  }

  function replace() { Object.assign(V, { x: 0, z: 0, y: 0, vy: 0, yaw: 0, yawR: 0, vF: 0, vL: 0, air: false, recul: false }); GB.g = 1; camPos.set(0, 4, -9); jour('DÉPART'); }

  /* ===================== LES COMMANDES ===================== */
  const TOUCHES = { ArrowUp: 'gaz', KeyW: 'gaz', KeyZ: 'gaz', ArrowDown: 'frein', KeyS: 'frein', ArrowLeft: 'g', KeyA: 'g', KeyQ: 'g', ArrowRight: 'd', KeyD: 'd', ShiftLeft: 'nitro', ShiftRight: 'nitro', KeyN: 'nitro', Space: 'nitro', KeyB: 'main' };   /* ESPACE = nitro, comme dans le jeu */
  addEventListener('keydown', (e) => {
    if (e.target && e.target.tagName === 'INPUT') return;
    const k = TOUCHES[e.code]; if (k) { K[k] = 1; e.preventDefault(); return; }
    if (e.repeat) return;
    if (e.code === 'KeyG') genere(); else if (e.code === 'KeyM') cousin(); else if (e.code === 'KeyK') garde(); else if (e.code === 'KeyR') replace();
  });
  addEventListener('keyup', (e) => { const k = TOUCHES[e.code]; if (k) K[k] = 0; });
  addEventListener('blur', () => { for (const k in K) K[k] = 0; });
  [['tG', 'g'], ['tD', 'd'], ['tGaz', 'gaz'], ['tFrein', 'frein'], ['tNit', 'nitro']].forEach(([id, k]) => {
    const el = $(id);
    const on = (e) => { e.preventDefault(); T[k] = 1; el.classList.add('tenu'); }, off = (e) => { e.preventDefault(); T[k] = 0; el.classList.remove('tenu'); };
    el.addEventListener('pointerdown', on); el.addEventListener('pointerup', off); el.addEventListener('pointercancel', off); el.addEventListener('pointerleave', off);
  });
  $('bGen').onclick = (e) => { e.target.blur(); genere(); };
  $('bCousin').onclick = (e) => { e.target.blur(); cousin(); };
  $('bGarde').onclick = (e) => { e.target.blur(); garde(); };
  $('bCapot').onclick = (e) => { e.target.blur(); const c = $('capot'); c.open = !c.open; c.classList.toggle('ouvert', c.open); };
  $('garage').onchange = (e) => { const i = e.target.value; e.target.blur(); if (i === '') return; const m = garageLit()[+i]; if (m) charge(m, false); e.target.value = ''; };
  $('musique').innerHTML += MUSIQUES.map((m, i) => '<option value="' + i + '">♪ ' + m[0] + '</option>').join('');
  $('musique').onchange = (e) => { e.target.blur(); musique(e.target.value); };
  $('bCopie').onclick = (e) => {
    e.target.blur(); if (!E) return;
    const txt = JSON.stringify({ nom: E.nom, graine: E.graine, sante: E.sante, fiche: E.fiche, nitro: E.nitro });
    (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(() => jour('COPIÉ', 'la fiche est dans le presse-papiers')).catch(() => { $('capot').open = true; jour('À COPIER', 'dans « sous le capot »'); });
  };

  /* ===================== LE DÉPART ===================== */
  curseursConstruit(); garageAffiche();
  charge(MiniGen.genere(graine0), false);
  requestAnimationFrame(boucle);
  $('bBoot').onclick = async () => {
    $('boot').style.display = 'none';
    try { await sonDemarre(); charge(E, true); } catch (e) { jour('SANS SON', 'AudioWorklet indisponible'); try { console.warn(e); } catch (_) { } }
  };
  if (Q.get('direct') === '1') $('boot').style.display = 'none';

  window.dbgMini = function () {
    return { moteur: E && E.nom, graine: E && E.graine, son: S.ok, etat: S.etat, rpmDsp: Math.round(S.rpm), rpm: Math.round(V.rpm), rapport: V.recul ? 'R' : GB.g, kmh: Math.round(Math.abs(V.vF) * 3.6),
      air: V.air, y: +V.y.toFixed(2), decol: V.decol, derapage: +V.derap.toFixed(2), cri: +V.cri.toFixed(2), nitro: +V.nit.toFixed(2), burnout: V.burn, niveau: +(S.niv || 0).toFixed(4), x: Math.round(V.x), z: Math.round(V.z) };
  };
  /* LA SORTIE MESURÉE : niveau (dBFS) et répartition par bande, sur ~85 ms — pour vérifier en vrai ce que le banc annonce */
  window.dbgMiniSortie = function () {
    if (!S.ana) return null;
    const a = S.ana, t = new Float32Array(a.fftSize); a.getFloatTimeDomainData(t);
    let s = 0, pk = 0; for (let i = 0; i < t.length; i++) { s += t[i] * t[i]; pk = Math.max(pk, Math.abs(t[i])); }
    const f = new Float32Array(a.frequencyBinCount); a.getFloatFrequencyData(f);
    const hz = S.ac.sampleRate / a.fftSize, B = [[0, 150], [150, 600], [600, 1500], [1500, 4000], [4000, 24000]], e = B.map(() => 0); let tot = 0;
    for (let i = 1; i < f.length; i++) { const p = Math.pow(10, f[i] / 10), h = i * hz; tot += p; for (let k = 0; k < B.length; k++) if (h >= B[k][0] && h < B[k][1]) e[k] += p; }
    return { dBFS: +(10 * Math.log10(s / t.length + 1e-12)).toFixed(1), pic: +pk.toFixed(2), bandes: B.map((b, k) => b[0] + '-' + b[1] + ' ' + (10 * Math.log10(e[k] / tot + 1e-12)).toFixed(1)).join(' | ') };
  };
  window.dbgMiniPilote = function (c) { PIL = c ? Object.assign({ gaz: 0, frein: 0, dir: 0, nitro: 0, main: 0 }, c) : null; return window.dbgMini(); };
  window.dbgMiniGenere = function (g) { charge(MiniGen.genere(g || ((Math.random() * 1e6) | 0) + 1), false); return E.nom; };
})();
