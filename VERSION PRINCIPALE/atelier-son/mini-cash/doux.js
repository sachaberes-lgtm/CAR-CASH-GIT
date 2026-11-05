/* ===== LE FILTRE DOUX du MINI CASH (2026-11-05, session SON ; Sacha : « tous les sons sont horribles, ils font mal aux oreilles, pas du tout lo-fi ; prends le temps qu'il faut mais fais ça bien ») =====
   POURQUOI. Le moteur vivant vise le RÉALISME : râpe de détonation, cliquetis, claquements directs du pot, pétarades qui sortent à 13-15 dB au-dessus du
   reste (mesuré, fenêtres de 5 ms). Juste pour un passionné qui veut « un vrai », fatigant pour tout le monde au bout d'une minute. Ce que Sacha a toujours
   demandé au moteur du jeu (voix-moteur.js, 2026-09-24) : « qu'il VIBRE, qu'il RONRONNE » — tout sous 200 Hz, pas de moustique.
   CE QUE FAIT LE FILTRE, sur la somme moteur + nitro, dans cet ordre :
     1 CHALEUR      une étagère grave (+3 dB sous ~140 Hz) : le ronron qu'on sent
     2 FEUTRE       deux passe-bas en cascade (−24 dB/octave) dont la coupure suit `douceur` (0 → 6 kHz, brut ; 1 → 1 100 Hz, très feutré ; 0,75 par défaut
                    ≈ 1 800 Hz) : on entend le moteur DEPUIS l'habitacle, les aigus qui piquent restent dehors
     3 ROND         un limiteur de crêtes rapide (attaque 1,5 ms, retour 90 ms) : les pétarades passent de « coup de fusil » à « bûche qui craque » —
                    on garde le rythme des crépitements, on enlève l'impact qui fait cligner
     4 BANDE        une saturation douce (tanh), comme une vieille bande : arrondit encore et épaissit
   PUR (pas de DOM, pas de nœud audio) : le processeur audio et le banc Node exécutent le même code. */
(function (root) {
  'use strict';
  const A = (typeof module !== 'undefined' && module.exports) ? require('../../assets/audio/moteur-vivant/moteur-vivant.js') : root.MoteurVivantApi;
  const Bq = A.Bq;
  function Doux(sr) {
    this.sr = sr; this.douceur = .75;
    this.ls = [new Bq(), new Bq()]; this.lp1 = [new Bq(), new Bq()]; this.lp2 = [new Bq(), new Bq()];
    this.env = 0;
    /* ⚠ LE LIMITEUR REGARDE 2 ms DEVANT (2026-11-05, mesuré) : sans anticipation, une attaque de 1,5 ms laissait passer l'impact de chaque pétarade
       (crête à +10 dB au nitro et au rupteur). Le son est retardé de 2 ms, l'enveloppe lit le son NON retardé : le gain est déjà baissé quand le coup arrive. */
    this.D = Math.round(sr * .002); this.dl = [new Float32Array(this.D), new Float32Array(this.D)]; this.di = 0;
    this.aAtt = Math.exp(-1 / (sr * .0004)); this.aRel = Math.exp(-1 / (sr * .05)); this.gS = 1; this.aG = Math.exp(-1 / (sr * .0008));
    this.regle(.75);
  }
  Doux.prototype.regle = function (d) {
    d = Math.max(0, Math.min(1, d)); this.douceur = d;
    const sr = this.sr, fc = 6000 * Math.pow(1100 / 6000, d);          /* 0 → 6 kHz · .75 → ~1,7 kHz · 1 → 1,1 kHz (échelle logarithmique : chaque cran s'entend pareil) */
    this.fc = fc;
    for (let c = 0; c < 2; c++) {
      this.ls[c].set('ls', 140, .7, 3 * d, sr);
      this.lp1[c].set('lp', fc, .62, 0, sr); this.lp2[c].set('lp', fc * 1.35, .55, 0, sr);
    }
    this.seuil = .30 - .14 * d;      /* le limiteur de crêtes mord d'autant plus bas qu'on veut doux */
    this.drive = 1 + 1.1 * d;
  };
  Doux.prototype.process = function (L, R, N) {
    const ls = this.ls, a = this.lp1, b = this.lp2, s = this.seuil, dr = this.drive, aA = this.aAtt, aR = this.aRel, aG = this.aG;
    const dl0 = this.dl[0], dl1 = this.dl[1], D = this.D;
    let env = this.env, gS = this.gS, di = this.di;
    for (let i = 0; i < N; i++) {
      const l0 = b[0].p(a[0].p(ls[0].p(L[i]))), r0 = b[1].p(a[1].p(ls[1].p(R[i])));
      const pk = Math.max(Math.abs(l0), Math.abs(r0));
      env = pk > env ? aA * env + (1 - aA) * pk : aR * env + (1 - aR) * pk;
      const gT = env > s ? s / env : 1;
      gS = gT < gS ? gT : aG * gS + (1 - aG) * gT;      /* descend tout de suite, remonte en douceur (pas de grésillement de gain) */
      const l = dl0[di] * gS, r = dl1[di] * gS;           /* le son d'il y a 2 ms */
      dl0[di] = l0; dl1[di] = r0; di = di + 1 === D ? 0 : di + 1;
      L[i] = Math.tanh(l * dr) / dr; R[i] = Math.tanh(r * dr) / dr;
    }
    this.env = env; this.gS = gS; this.di = di;
  };
  const api = { Doux: Doux };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.DouxApi = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
