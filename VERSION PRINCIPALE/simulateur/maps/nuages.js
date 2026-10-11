/* LES NUAGES — une route qui ondule au-dessus d'une mer de nuages, en plein jour.
   · LA PISTE : une boucle en étoile (jamais de croisement), de grands virages et du relief (± 50 m).
   · LES NUAGES EN BLOCS : ~4 500 cubes dans UN seul maillage instancié — base lavande, sommet blanc, dessous plat. Ils flottent
     sous la route, au-dessus, et à côté (jamais dessus) ; des TITANS au loin donnent l'échelle ; la MER de nuages ferme le bas. */
DECORS.nuages = {
  piste: { forme: 'etoile', graine: 21, points: 14, rayon: [950, 1500], largeur: 30, relief: 38, vagues: 2 },
  couleurs: { route: '#3d3854', ligne: '#ffe2a0', bord: ['#ff5fb8', '#38d6ff'], flanc: '#2c2742',
    caisse: '#ffffff', bande: '#ff5fb8', lueur: '#ff9ad5', plaque: '#ffcf4a' },
  ciel: { haut: '#3f7fe6', horizon: '#ffd9e8', bas: '#d9e6ff', soleil: '#fff1c9', soleilDir: [.35, .22, -.9] },
  brouillard: { couleur: '#f6dcea', pres: 260, loin: 3000 },
  lumiere: { ciel: '#d6eaff', sol: '#ffc6df', force: 1.0, soleil: '#fff0d8', soleilForce: .85, dir: [.35, .6, -.9] },
  photo: { m: 140, lat: 6, cam: [6.5, 2.2, 10.5], vise: [0, 1.4, -4], fov: 50 },

  construire(o) {
    const T = o.T, P = o.piste, r = o.r, hw = P.W / 2, B = P.boite;
    const cubes = [];   // [x, y, z, taille, blanc 0-1]
    function nuage(x, base, z, R, Hm) {
      const n = Math.min(46, 6 + Math.round(R / 5));
      for (let j = 0; j < n; j++) {
        const a = r() * Math.PI * 2, d = Math.sqrt(r()), dx = Math.cos(a) * d * R, dz = Math.sin(a) * d * R * .72;
        const s = (.18 + r() * .22) * R + 6;
        const dome = Math.max(0, 1 - d * d) * Hm;
        const y = base + s / 2 + dome * (.35 + r() * .65);
        cubes.push([x + dx, y, z + dz, s, Math.min(1, (y - base) / (Hm + s) * 1.6)]);
      }
    }
    // autour de la route : dessous, dessus, à côté (jamais sur elle)
    for (let k = 0; k < 290; k++) {
      const x = B.mx - 1500 + r() * (B.Mx - B.mx + 3000), z = B.mz - 1500 + r() * (B.Mz - B.mz + 3000);
      const R = 28 + r() * 95, Hm = R * (.35 + r() * .35), t = r(), q = P.dist(x, z, 340);
      const ry = q.d < 340 ? P.y[q.i] : 0;
      let base;
      if (t < .42) base = ry - 70 - r() * 170 - Hm - R * .4;                  // sous la route
      else if (t < .7) base = ry + 55 + r() * 220;                             // au-dessus
      else if (q.d > R + hw + 45) base = ry - Hm * .35 - 25 + r() * 20;         // à côté, à hauteur de la route
      else base = ry - 60 - Hm - R * .4 - r() * 80;
      nuage(x, base, z, R, Hm);
    }
    // les titans, au loin
    const cx = (B.mx + B.Mx) / 2, cz = (B.mz + B.Mz) / 2;
    for (let k = 0; k < 10; k++) {
      const a = k / 10 * Math.PI * 2 + r() * .4, d = 2300 + r() * 500, R = 260 + r() * 220;
      nuage(cx + Math.cos(a) * d, -260 + r() * 80, cz + Math.sin(a) * d, R, R * (.7 + r() * .4));
    }
    const im = new T.InstancedMesh(new T.BoxGeometry(1, 1, 1), new T.MeshLambertMaterial({ color: '#ffffff' }), cubes.length);
    const ob = new T.Object3D(), bas = new T.Color('#e4cfee'), haut = new T.Color('#ffffff'), c = new T.Color();
    cubes.forEach((q, k) => {
      ob.position.set(q[0], q[1], q[2]); ob.scale.set(q[3], q[3] * (.7 + (k % 3) * .1), q[3]); ob.updateMatrix();
      im.setMatrixAt(k, ob.matrix); im.setColorAt(k, c.copy(bas).lerp(haut, q[4]));
    });
    im.computeBoundingSphere && im.computeBoundingSphere();
    im.frustumCulled = false;
    o.scene.add(im);
    this._nCubes = cubes.length;

    // la mer de nuages, en carreaux
    const mer = o.toile(128, 128, (g) => {
      const q = o.rng(9);
      g.fillStyle = '#f3e3f4'; g.fillRect(0, 0, 128, 128);
      for (let k = 0; k < 260; k++) {
        const s = 4 + (q() * 14 | 0), x = q() * 128 | 0, y = q() * 128 | 0;
        g.fillStyle = q() < .5 ? '#ffffff' : '#e6d2ee'; g.fillRect(x, y, s, s);
      }
    });
    const tm = new T.CanvasTexture(mer); tm.wrapS = tm.wrapT = T.RepeatWrapping; tm.repeat.set(30, 30);
    tm.magFilter = T.NearestFilter; tm.anisotropy = 8;
    const plan = new T.Mesh(new T.PlaneGeometry(24000, 24000), new T.MeshLambertMaterial({ map: tm }));
    plan.rotation.x = -Math.PI / 2; plan.position.set(cx, -330, cz);
    o.scene.add(plan);
  },
};
