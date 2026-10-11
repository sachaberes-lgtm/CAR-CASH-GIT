/* L'ORBITE — une route en orbite : noir complet, étoiles, une planète en blocs qui se lève sur le côté, des débris et des
   satellites qui tournent lentement autour de la route (jamais dessus). Lumière dure d'un seul soleil, rasant. */
DECORS.orbite = {
  piste: { forme: 'etoile', graine: 33, points: 18, rayon: [1050, 1700], largeur: 30, relief: 26, vagues: 3 },
  couleurs: { route: '#1b1c28', ligne: '#dfe8ff', bord: ['#5ee6ff', '#b07bff'], flanc: '#0c0d14',
    caisse: '#eef1f7', bande: '#5ee6ff', lueur: '#5ee6ff', plaque: '#ffcf4a' },
  ciel: { haut: '#000000', horizon: '#04050c', bas: '#000000', soleil: '#ffffff', soleilDir: [-.8, .25, .3] },
  brouillard: { couleur: '#000000', pres: 900, loin: 4200 },
  lumiere: { ciel: '#4a5a8a', sol: '#08080f', force: .5, soleil: '#ffffff', soleilForce: 1.25, dir: [-.8, .4, .3] },
  photo: { m: 60, lat: -4, cam: [-5.5, 2.6, -9.5], vise: [2, 1.4, 24], fov: 54 },

  construire(o) {
    const T = o.T, P = o.piste, r = o.r, hw = P.W / 2, B = P.boite;
    const cx = (B.mx + B.Mx) / 2, cz = (B.mz + B.Mz) / 2;
    // les étoiles : une sphère qui suit la caméra (on ne l'atteint jamais)
    const NS = 2600, ps = new Float32Array(NS * 3);
    for (let k = 0; k < NS; k++) {
      const u = r() * 2 - 1, a = r() * Math.PI * 2, s = Math.sqrt(1 - u * u);
      ps[k * 3] = Math.cos(a) * s * 4600; ps[k * 3 + 1] = u * 4600; ps[k * 3 + 2] = Math.sin(a) * s * 4600;
    }
    const gs = new T.BufferGeometry(); gs.setAttribute('position', new T.BufferAttribute(ps, 3));
    this._etoiles = new T.Points(gs, new T.PointsMaterial({ color: '#ffffff', size: 2.2, sizeAttenuation: false, fog: false, depthWrite: false }));
    this._etoiles.frustumCulled = false; this._etoiles.renderOrder = -9;
    o.scene.add(this._etoiles);

    // la planète en blocs (continents en grandes cases) + son atmosphère
    const carte = o.toile(128, 64, (g) => {
      const q = o.rng(4);
      g.fillStyle = '#1d4fa8'; g.fillRect(0, 0, 128, 64);
      for (let k = 0; k < 90; k++) { const w = 3 + (q() * 12 | 0), h = 2 + (q() * 7 | 0); g.fillStyle = q() < .7 ? '#3f8a4a' : '#b9a06a'; g.fillRect(q() * 128 | 0, 8 + (q() * 48 | 0), w, h); }
      for (let k = 0; k < 55; k++) { g.fillStyle = 'rgba(255,255,255,.7)'; g.fillRect(q() * 128 | 0, q() * 64 | 0, 2 + (q() * 9 | 0), 1 + (q() * 2 | 0)); }
    });
    const tp = new T.CanvasTexture(carte); tp.magFilter = T.NearestFilter;
    const planete = new T.Mesh(new T.SphereGeometry(2600, 48, 32), new T.MeshLambertMaterial({ map: tp, fog: false }));
    // devant la ligne de départ, un peu à droite : elle se lève au bout de la première droite
    const d0 = P.depart;
    const ux = P.tx[d0] + P.dx[d0] * .37, uz = P.tz[d0] + P.dz[d0] * .37, ul = Math.hypot(ux, uz);
    for (let d = 5200; d < 20000; d += 300) {   // reculée tant qu'elle passerait à moins de 400 m de la route
      planete.position.set(P.x[d0] + ux / ul * d, -2050, P.z[d0] + uz / ul * d);
      let m = Infinity;
      for (let i = 0; i < P.n; i += 8) m = Math.min(m, Math.hypot(P.x[i] - planete.position.x, P.y[i] - planete.position.y, P.z[i] - planete.position.z));
      if (m > 2600 + 400) break;
    }
    planete.rotation.z = .35;
    const atmo = new T.Mesh(new T.SphereGeometry(2600 * 1.045, 48, 32), new T.MeshBasicMaterial({ color: '#5fb4ff', transparent: true, opacity: .28, side: T.BackSide, blending: T.AdditiveBlending, depthWrite: false, fog: false }));
    atmo.position.copy(planete.position);
    const lune = new T.Mesh(new T.IcosahedronGeometry(260, 1), new T.MeshLambertMaterial({ color: '#b8b6c4', flatShading: true, fog: false }));
    lune.position.set(cx - 3200, 900, cz + 2400);
    o.scene.add(planete, atmo, lune);
    this._planete = planete;

    // débris et satellites, autour de la route (jamais dessus)
    const morceaux = [], sats = [];
    for (let k = 0; k < 620; k++) {
      const x = B.mx - 900 + r() * (B.Mx - B.mx + 1800), z = B.mz - 900 + r() * (B.Mz - B.mz + 1800);
      const q = P.dist(x, z, 300), ry = q.d < 300 ? P.y[q.i] : 0, s = 1.5 + r() * r() * 14;
      const y = ry + (r() * 2 - 1) * 170;
      if (q.d < hw + 18 + s && Math.abs(y - ry) < 28 + s) continue;
      const sat = r() < .1;
      (sat ? sats : morceaux).push({ x, y, z, s: sat ? 1 + r() * .8 : s, rx: r() * 6, ry: r() * 6, vx: (r() - .5) * .5, vy: (r() - .5) * .5, c: r() });
    }
    const ob = new T.Object3D(), col = new T.Color();
    const imM = new T.InstancedMesh(new T.BoxGeometry(1, .5, 1.4), new T.MeshLambertMaterial({ color: '#ffffff' }), morceaux.length);
    const GR = ['#8b8d9a', '#5d5f6b', '#c9c9d2', '#d6b25a'].map(c => new T.Color(c));
    morceaux.forEach((m, k) => imM.setColorAt(k, GR[(m.c * 4) | 0]));
    const imC = new T.InstancedMesh(new T.BoxGeometry(3, 3, 4.2), new T.MeshLambertMaterial({ color: '#d9b45c' }), sats.length);
    const imP = new T.InstancedMesh(new T.BoxGeometry(16, .2, 3.2), new T.MeshLambertMaterial({ color: '#2b4fa8', emissive: '#0a1640' }), sats.length);
    for (const im of [imM, imC, imP]) { im.frustumCulled = false; o.scene.add(im); }
    this._debris = { morceaux, sats, imM, imC, imP, ob };
    this.tick(0);
  },

  tick(dt, t, cam) {
    if (cam && this._etoiles) this._etoiles.position.copy(cam.position);
    if (this._planete) this._planete.rotation.y += dt * .01;
    const d = this._debris; if (!d) return;
    const ob = d.ob;
    d.morceaux.forEach((m, k) => {
      m.rx += m.vx * dt; m.ry += m.vy * dt;
      ob.position.set(m.x, m.y, m.z); ob.rotation.set(m.rx, m.ry, 0); ob.scale.setScalar(m.s); ob.updateMatrix();
      d.imM.setMatrixAt(k, ob.matrix);
    });
    d.sats.forEach((m, k) => {
      m.ry += m.vy * dt * .3;
      ob.position.set(m.x, m.y, m.z); ob.rotation.set(.3, m.ry, .2); ob.scale.setScalar(m.s); ob.updateMatrix();
      d.imC.setMatrixAt(k, ob.matrix); d.imP.setMatrixAt(k, ob.matrix);
    });
    d.imM.instanceMatrix.needsUpdate = d.imC.instanceMatrix.needsUpdate = d.imP.instanceMatrix.needsUpdate = true;
  },
};
