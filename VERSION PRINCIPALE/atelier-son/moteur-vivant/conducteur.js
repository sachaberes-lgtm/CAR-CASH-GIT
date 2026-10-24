/* LE CONDUCTEUR du MOTEUR VIVANT : un modèle minuscule (boîte, inertie du moteur, élan) qui pilote `rpmCmd`/`thr`/`load` du moteur, et `Pilote`, qui joue
   un scénario (liste d'événements datés) OU se laisse conduire à la main (la page d'écoute : gaz, frein, rapport, point mort).
   Partagé par le banc Node (rendu.cjs) et la page (moteur-vivant.html) : mêmes scénarios, mêmes octets.
   Les rapports sont ceux d'une sportive : 1re à 6 900 tr/min ≈ 65 km/h, 6e ≈ 280 km/h (rpm = km/h × rapport × k). */
(function (root) {
  'use strict';
  const clamp = (x, a, b) => x < a ? a : x > b ? b : x;

  function Conducteur(m) {
    this.m = m; this.v = 0; this.g = 0; this.rpm = 0; this.shiftT = 0; this.rat = [0, 3.6, 2.35, 1.72, 1.32, 1.04, .84];
    this.k = 29.5; this.thrOut = 0;
  }
  Conducteur.prototype.step = function (dt, thr, gear, brake) {
    const C = this.m.cfg, rat = this.rat, idle = C.idle;
    if (gear !== this.g) { this.shiftT = .34; this.g = gear; }
    if (this.shiftT > 0) this.shiftT -= dt;
    if (this.g === 0 || this.shiftT > 0) {
      /* au point mort / embrayage : le moteur cherche SON régime — monte vite au gaz, retombe en frottant (un moteur lâché freine fort) */
      const tgtGear = this.g > 0 ? Math.max(idle, this.v * rat[this.g] * this.k) : idle;
      const free = thr > .05 ? (idle + (C.limit - idle) * thr) : idle;
      const sh = this.g > 0 && this.shiftT > 0;
      if (sh) this.rpm += (tgtGear - this.rpm) * Math.min(1, dt * (thr > .05 ? 5 : 8));      /* rapport en cours : le régime va chercher celui du nouveau rapport */
      else this.rpm += (free - this.rpm) * Math.min(1, dt * (thr > .05 ? (free > this.rpm ? 10 : 6) : 3.8));
      this.v *= 1 - dt * .035;
    } else {
      /* en prise : le régime est celui des roues ; au départ arrêté l'embrayage patine (le moteur monte plus haut que les roues) */
      const wheel = this.v * rat[this.g] * this.k;
      const slip = this.g === 1 && thr > .05 ? idle + (4200 - idle) * thr * clamp(1 - this.v / 22, 0, 1) : 0;
      this.rpm = Math.max(idle, wheel, slip);
      const pw = Math.sin(Math.PI * clamp(this.rpm / (C.limit * 1.1), .15, 1));
      const a = thr * (36 / (1 + this.g * .55)) * (.6 + .5 * pw) - this.v * .016 - this.v * this.v * .0009 - (thr < .05 ? 2.1 + this.rpm / 5000 : 0) - brake * 22;
      this.v = Math.max(0, this.v + a * dt);
      if (this.v * rat[this.g] * this.k > C.limit) this.v = C.limit / (rat[this.g] * this.k);
    }
    this.thrOut = this.shiftT > .06 ? 0 : thr;          /* gaz coupés pendant le passage : le « blap » net de la boîte */
    return { rpm: this.rpm, thr: this.thrOut, v: this.v };
  };

  /* ---------- les scénarios : [temps, action, …] ---------- */
  const SCEN = {
    /* LA VIE D'UN MOTEUR NEUF : démarrage → ralenti (gargouillis) → coups de gaz → départ → montée → limiteur → lâcher (pops) → rétrogradage talonné → arrêt */
    vie: { dur: 66, ev: [
      [0, 'etat', 'off'], [.8, 'start'],
      [6.0, 'thr', 0], [7.0, 'blip', .55, .35], [8.6, 'blip', .8, .30], [10.3, 'blip', 1, .45],
      [12.3, 'auto', 1], [12.6, 'thr', 1], [20.0, 'lift'],
      [22.0, 'thr', .45], [24.0, 'thr', .7], [26.0, 'thr', 1], [29.0, 'lift'],
      [29.2, 'brake', 1], [30.2, 'down'], [31.4, 'down'], [31.9, 'brake', 0], [32.4, 'thr', 1], [36.4, 'lift'],
      [38.2, 'gear', 2], [38.4, 'thr', 1], [42.0, 'lift'], [43.4, 'brake', 1], [44.6, 'down'], [46.4, 'brake', 0], [47.2, 'gear', 0],
      [50.5, 'calage'], [55, 'lab', 'ET ON RALLUME'], [55.2, 'start'], [61, 'blip', .7, .5]
    ] },
    /* LES ÂGES : le même régime joué à chaque santé (ralenti puis une montée), des chocs, puis le calage et la tentative de redémarrage */
    sante: { dur: 84, ev: [
      [0, 'etat', 'run'], [0, 'health', 1],
      /* 1 : RODÉ */ [0, 'lab', 'RODÉ 1.00'], [.1, 'thr', 0], [4.0, 'rev', 3600, 1.0], [6.4, 'idle'], [9.0, 'health', .70],
      /* 2 : FATIGUÉ */ [9.1, 'lab', 'FATIGUÉ 0.70'], [13.0, 'rev', 3600, 1.0], [15.4, 'idle'], [17.5, 'health', .52],
      /* 3 : MALTRAITÉ */ [17.6, 'lab', 'MALTRAITÉ 0.52'], [21.5, 'rev', 3600, 1.0], [23.8, 'idle'], [26, 'coup', .5], [27.4, 'coup', .8], [29, 'health', .42], [29.1, 'lab', 'MALTRAITÉ 0.42 (après deux chocs)'], [33, 'rev', 3000, 1.0], [35.4, 'idle'],
      [37, 'health', .27], [37.1, 'lab', 'AGONIE 0.27'], [41, 'rev', 2800, 1.0], [43.6, 'idle'], [46, 'coup', 1.0], [47, 'health', .10], [47.1, 'lab', 'AGONIE 0.10'], [51, 'rev', 2200, 1.0], [53.5, 'idle'],
      [58, 'lab', 'CALAGE'], [58, 'calage'], [64.5, 'lab', 'REDÉMARRAGE (réparé)'], [64.6, 'health', 1], [64.7, 'start', 1], [72, 'rev', 3200, 1], [74, 'idle']
    ] },
    limiteur: { dur: 16, ev: [[0, 'etat', 'run'], [.2, 'thr', 0], [1.5, 'auto', 0], [1.5, 'gear', 1], [1.6, 'thr', 1], [6.5, 'lift'], [8.5, 'thr', 1], [11.0, 'lift'], [15, 'idle']] },
    demarrage: { dur: 14, ev: [[0, 'etat', 'off'], [.6, 'start'], [8, 'blip', .5, .3], [10, 'blip', .8, .3]] },
    idle: { dur: 12, ev: [[0, 'etat', 'run'], [.1, 'thr', 0], [6, 'blip', .6, .4]] }
  };

  /* LE PILOTE : interprète les événements d'un scénario (ou reçoit les touches de la page) et fait avancer le conducteur et le moteur d'un pas `dt`. */
  function Pilote(m, scen) {
    this.m = m; this.cond = new Conducteur(m); this.evs = scen ? scen.ev.slice().sort((a, b) => a[0] - b[0]) : []; this.ei = 0; this.t = 0;
    this.thrT = 0; this.gearT = 0; this.brakeT = 0; this.blipT = 0; this.blipThr = 0; this.revT = 0; this.revRpm = 0; this.labs = []; this.lab = '';
    this.neutralRev = false; /* page : « R » tenu = régime libre au point mort, au prorata de la pédale */
    this.auto = true;        /* boîte automatique (la page peut la quitter) */
  }
  Pilote.prototype.autoGear = function () {
    const c = this.cond, C = this.m.cfg, thr = this.thrT;
    if (c.shiftT > 0) return;
    if (this.gearT === 0 && thr > .05 && !this.neutralRev && this.m.etat === 'run') this.gearT = 1;
    else if (this.gearT >= 1 && this.gearT < 6 && c.rpm > C.limit * .91 && thr > .3) this.gearT++;
    else if (this.gearT > 1 && c.rpm < C.idle * 2.3 && thr < .05) this.gearT--;
    else if (this.gearT === 1 && c.v < 2 && thr < .05 && c.rpm < C.idle * 1.2) this.gearT = 0;
  };
  Pilote.prototype.tick = function (dt) {
    const m = this.m, cond = this.cond, C = m.cfg;
    while (this.ei < this.evs.length && this.evs[this.ei][0] <= this.t) {
      const [, k, a, b] = this.evs[this.ei++];
      if (k === 'etat') { if (a === 'run') { m.etat = 'run'; m.rpm = C.idle; m.rpmEff = m.rpm; } }
      else if (k === 'start') m.demarre(a);
      else if (k === 'thr') { this.thrT = a; this.revT = 0; }
      else if (k === 'auto') this.auto = !!a;
      else if (k === 'gear') { this.auto = false; this.gearT = a; }
      else if (k === 'lift') this.thrT = 0;
      else if (k === 'brake') this.brakeT = a;
      else if (k === 'down') { this.auto = false; this.gearT = Math.max(1, cond.g - 1); this.blipT = .26; this.blipThr = 1; this.thrT = 0; }
      else if (k === 'blip') { this.blipT = b; this.blipThr = a; }
      else if (k === 'rev') { this.revT = 2.3; this.revRpm = a; }
      else if (k === 'idle') { this.revT = 0; this.thrT = 0; }
      else if (k === 'coup') m.coup(a);
      else if (k === 'calage') { m.calage(); this.gearT = 0; cond.g = 0; cond.v = 0; }
      else if (k === 'health') m.health = a;
      else if (k === 'lab') { this.labs.push([this.t, a]); this.lab = a; }
    }
    this.t += dt;
    if (this.auto) this.autoGear();
    let thr = this.thrT; if (this.blipT > 0) { thr = Math.max(thr, this.blipThr); this.blipT -= dt; }
    if (this.revT > 0) { thr = 1; this.revT -= dt; }
    const rv = (this.revRpm && this.revT > 0) || this.neutralRev;
    let st;
    if (m.etat === 'run') {
      if (rv) { /* régime libre (point mort) : « monter à revRpm » en scénario, au prorata de la pédale à la main */
        const want = this.neutralRev ? C.idle + (C.limit - C.idle) * clamp(this.thrT, 0, 1) : this.revRpm;
        cond.g = 0; cond.v = 0; thr = clamp((want - C.idle) / (C.limit - C.idle), 0, 1);
        st = cond.step(dt, thr, 0, 0); thr = this.neutralRev ? this.thrT : 1;
      } else st = cond.step(dt, thr, this.gearT, this.brakeT);
      m.rpmCmd = st.rpm; m.thr = rv ? thr : st.thr; m.load = clamp(m.thr * (cond.g > 0 ? .78 + .22 * clamp(st.rpm / 5000, 0, 1) : .55), 0, 1);
      if (!rv && cond.g > 0 && st.thr > 0 && st.rpm > C.limit - 80) m.load = 1;
      if (cond.g === 0 && m.thr <= .05) m.load = 0;
    } else if (m.etat === 'off') { cond.rpm = C.idle; cond.v = 0; cond.g = 0; this.gearT = 0; }
    else { cond.rpm = m.rpm; }
  };

  const api = { Conducteur, Pilote, SCEN };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.MVConducteur = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
