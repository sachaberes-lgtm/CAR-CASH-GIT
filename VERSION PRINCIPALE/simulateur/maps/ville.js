/* LA VILLE — une voie rapide suspendue dans un canyon de tours en blocs, la nuit, sous la pluie.
   · LA PISTE : des RUES (polygone à angles droits, coins arrondis de 140 m) — de vraies lignes droites pour la nitro, des virages
     à 90° qui font tomber la vitesse (et la musique avec).
   · LES TOURS : un seul maillage (fenêtres peintes une fois, lumière propre : 0 calcul), posées sur une grille de lots coupée par
     des avenues ; aucune ne touche la route. Les néons : un 2e maillage, et leur halo additif un 3e.
   · LE TRAFIC VOLANT suit les avenues ; la PLUIE est fixée au monde : à pleine vitesse elle file en traits. */
DECORS.ville = {
  piste: { forme: 'rues', graine: 7, bloc: 320, coin: 140, colonnes: 5, largeur: 30, relief: 9, vagues: 3 },
  couleurs: { route: '#26232f', ligne: '#e9d8a6', bord: ['#ff3ec8', '#3fe0ff'], flanc: '#120f1a',
    caisse: '#f3f0ff', bande: '#ff3ec8', lueur: '#ff3ec8', plaque: '#ffcf4a' },
  ciel: { haut: '#03020a', horizon: '#2b1140', bas: '#0d0616' },
  brouillard: { couleur: '#22102f', pres: 90, loin: 1250 },
  lumiere: { ciel: '#9a7cff', sol: '#1a0d24', force: .85, soleil: '#ff9ad5', soleilForce: .55, dir: [.4, .9, .25] },
  photo: { m: 140, lat: -6, cam: [-7.5, 2.1, 10.5], vise: [0, 1.8, -4], fov: 48 },

  construire(o) {
    const T = o.T, P = o.piste, r = o.r, hw = P.W / 2;
    // ——— les fenêtres : 32 × 32 fenêtres de 3 m, peintes une fois ———
    const fen = o.toile(256, 256, (g) => {
      g.fillStyle = '#000'; g.fillRect(0, 0, 256, 256);
      const q = o.rng(5), pal = ['#ffd9a0', '#ffd9a0', '#ffc77a', '#7fe8ff', '#ff8fd8', '#f4f1ff'];
      for (let y = 0; y < 32; y++) {
        const nuit = q() < .14;
        for (let x = 0; x < 32; x++) {
          if (nuit || q() > .42) continue;
          g.globalAlpha = .45 + q() * .55; g.fillStyle = pal[q() * pal.length | 0];
          g.fillRect(x * 8 + 2, y * 8 + 2, 5, 4);
        }
      }
      g.globalAlpha = 1;
    });
    const texF = new T.CanvasTexture(fen);
    texF.wrapS = texF.wrapT = T.RepeatWrapping; texF.magFilter = T.NearestFilter; texF.anisotropy = 8;

    // ——— des tampons qu'on remplit puis qu'on fige ———
    const tours = { p: [], n: [], u: [], c: [], i: [] }, neons = { p: [], n: [], u: [], c: [], i: [] }, halos = { p: [], n: [], u: [], c: [], i: [] };
    const quad = (b, a, nn, uv, col) => {   // a = 4 coins dans l'ordre (vus de dehors, sens inverse des aiguilles)
      const k = b.p.length / 3;
      for (let j = 0; j < 4; j++) { b.p.push(a[j][0], a[j][1], a[j][2]); b.n.push(nn[0], nn[1], nn[2]); b.u.push(uv[j][0], uv[j][1]); b.c.push(col.r, col.g, col.b); }
      b.i.push(k, k + 1, k + 2, k, k + 2, k + 3);
    };
    const FACES = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    const NUL = [[.001, .001], [.001, .001], [.001, .001], [.001, .001]];
    function boite(b, x, y, z, w, h, d, col) {   // un bloc plein (néons, antennes)
      const X = w / 2, Z = d / 2;
      for (const [nx, nz] of FACES) {
        const tx = -nz, tz = nx, hl = nx ? Z : X, cx = x + nx * X, cz = z + nz * Z;
        quad(b, [[cx + tx * hl, y, cz + tz * hl], [cx - tx * hl, y, cz - tz * hl], [cx - tx * hl, y + h, cz - tz * hl], [cx + tx * hl, y + h, cz + tz * hl]], [nx, 0, nz], NUL, col);
      }
      quad(b, [[x - X, y + h, z - Z], [x - X, y + h, z + Z], [x + X, y + h, z + Z], [x + X, y + h, z - Z]], [0, 1, 0], NUL, col);
      quad(b, [[x - X, y, z - Z], [x + X, y, z - Z], [x + X, y, z + Z], [x - X, y, z + Z]], [0, -1, 0], NUL, col);
    }
    function tour(x, z, w, d, y0, y1, col) {
      const X = w / 2, Z = d / 2, h = y1 - y0, u0 = r(), v0 = r();
      for (const [nx, nz] of FACES) {
        const tx = -nz, tz = nx, hl = nx ? Z : X, cx = x + nx * X, cz = z + nz * Z, uw = hl * 2 / 96;
        quad(tours, [[cx + tx * hl, y0, cz + tz * hl], [cx - tx * hl, y0, cz - tz * hl], [cx - tx * hl, y1, cz - tz * hl], [cx + tx * hl, y1, cz + tz * hl]],
          [nx, 0, nz], [[u0, v0], [u0 + uw, v0], [u0 + uw, v0 + h / 96], [u0, v0 + h / 96]], col);
      }
      const toit = col.clone().multiplyScalar(1.35);
      quad(tours, [[x - X, y1, z - Z], [x - X, y1, z + Z], [x + X, y1, z + Z], [x + X, y1, z - Z]], [0, 1, 0], NUL, toit);
    }
    const NEON = ['#ff3ec8', '#3fe0ff', '#b26bff', '#ffd23f', '#ff5a6e', '#58ffb0'].map(c => new T.Color(c));
    const ROUGE = new T.Color('#ff2a3d'), GRIS = new T.Color('#3a3646');
    const BASES = ['#1d1a30', '#21193a', '#172338', '#241a2e'].map(c => new T.Color(c));

    // ——— la grille des lots, coupée par les avenues ———
    const B = P.boite, M = 900, LOT = 52, BAS = -340;
    this._avenues = { x: [], z: [] };
    for (let gx = Math.floor((B.mx - M) / LOT); gx <= Math.ceil((B.Mx + M) / LOT); gx++) {
      if (gx % 7 === 0) { this._avenues.x.push(gx * LOT); continue; }
      for (let gz = Math.floor((B.mz - M) / LOT); gz <= Math.ceil((B.Mz + M) / LOT); gz++) {
        if (gz % 7 === 0) { if (gx % 7 === 1) this._avenues.z.push(gz * LOT); continue; }
        const x = gx * LOT + (r() - .5) * 6, z = gz * LOT + (r() - .5) * 6;
        const w = 18 + r() * 22, d = 18 + r() * 22, tire = r(), haut = r(), sorte = r();
        const q = P.dist(x, z, 280);
        if (q.d < hw + 12 + Math.hypot(w, d) / 2) continue;           // jamais sur la route
        const pres = q.d < 280;
        if (tire > (pres ? .93 : .68)) continue;
        const ry = pres ? P.y[q.i] : 0;
        let y1 = pres ? ry + (sorte < .22 ? -(12 + haut * 50) : 18 + haut * (q.d < 130 ? 140 : 230)) : 30 + haut * 300;
        const col = BASES[(sorte * 4) | 0].clone().multiplyScalar(.85 + haut * .3);
        tour(x, z, w, d, BAS, y1, col);
        if (!pres) continue;
        // une enseigne de néon sur la face qui regarde la route
        if (r() < .6 && y1 > ry - 8) {
          const vx = P.x[q.i] - x, vz = P.z[q.i] - z, axeX = Math.abs(vx) > Math.abs(vz);
          const nx = axeX ? Math.sign(vx) : 0, nz = axeX ? 0 : Math.sign(vz), large = axeX ? d : w;
          const c = NEON[(r() * NEON.length) | 0], debout = r() < .6;
          const sw = debout ? 1.4 + r() : large * (.4 + r() * .3), sh = debout ? 10 + r() * 18 : 2.4 + r() * 2.2;
          const off = (r() - .5) * large * .5, sy = Math.max(ry - 14, BAS + 20) + r() * Math.max(4, y1 - Math.max(ry - 14, BAS + 20) - sh - 4);
          const px = x + nx * (w / 2 + .5) + (axeX ? 0 : off), pz = z + nz * (d / 2 + .5) + (axeX ? off : 0);
          boite(neons, px, sy, pz, axeX ? .5 : sw, sh, axeX ? sw : .5, c);
          boite(halos, px + nx * .3, sy - sh * .25, pz + nz * .3, axeX ? .2 : sw * 1.9 + 2, sh * 1.5, axeX ? sw * 1.9 + 2 : .2, c);
        }
        // un liseré de néon autour du toit
        if (r() < .18 && y1 > ry + 10) {
          const c = NEON[(r() * NEON.length) | 0], e = .7, yy = y1 - 1.6;
          boite(neons, x, yy, z - d / 2 - .3, w + 1, e, .4, c); boite(neons, x, yy, z + d / 2 + .3, w + 1, e, .4, c);
          boite(neons, x - w / 2 - .3, yy, z, .4, e, d + 1, c); boite(neons, x + w / 2 + .3, yy, z, .4, e, d + 1, c);
        }
        // une antenne et son feu rouge sur les plus hautes
        if (y1 > ry + 90 && r() < .45) { const h = 8 + r() * 16; boite(neons, x, y1, z, .6, h, .6, GRIS); boite(neons, x, y1 + h, z, 1.1, 1.1, 1.1, ROUGE); }
      }
    }
    const fige = (b) => {
      const g = new T.BufferGeometry();
      g.setAttribute('position', new T.Float32BufferAttribute(b.p, 3)); g.setAttribute('normal', new T.Float32BufferAttribute(b.n, 3));
      g.setAttribute('uv', new T.Float32BufferAttribute(b.u, 2)); g.setAttribute('color', new T.Float32BufferAttribute(b.c, 3));
      g.setIndex(b.p.length / 3 > 65535 ? new T.Uint32BufferAttribute(b.i, 1) : new T.Uint16BufferAttribute(b.i, 1));
      g.computeBoundingSphere(); return g;
    };
    o.scene.add(new T.Mesh(fige(tours), new T.MeshLambertMaterial({ vertexColors: true, emissive: '#ffffff', emissiveMap: texF })));
    o.scene.add(new T.Mesh(fige(neons), new T.MeshBasicMaterial({ vertexColors: true })));
    o.scene.add(new T.Mesh(fige(halos), new T.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: .26, blending: T.AdditiveBlending, depthWrite: false })));
    this._nTours = tours.p.length / 60 | 0;

    // ——— le trafic volant, dans les avenues ———
    const N = 170, av = this._avenues, voies = [];
    for (let k = 0; k < N; k++) {
      const surX = r() < .5 && av.x.length, liste = surX ? av.x : av.z;
      if (!liste.length) continue;
      voies.push({ surX, fixe: liste[(r() * liste.length) | 0] + (r() - .5) * 18, y: 45 + r() * 130, s: (r() < .5 ? -1 : 1) * (28 + r() * 45), p: r() });
    }
    const vg = new T.BoxGeometry(2.2, .8, 4.6);
    const im = new T.InstancedMesh(vg, new T.MeshBasicMaterial(), voies.length);
    const CV = ['#ffffff', '#ff2a3d', '#ff2a3d', '#ff8fd8', '#7fe8ff'].map(c => new T.Color(c));
    voies.forEach((v, k) => im.setColorAt(k, CV[k % CV.length]));
    im.frustumCulled = false;
    o.scene.add(im);
    this._trafic = { im, voies, a0x: B.mx - M, lx: B.Mx - B.mx + 2 * M, a0z: B.mz - M, lz: B.Mz - B.mz + 2 * M, o: new T.Object3D() };

    // ——— la pluie, fixée au monde autour de la caméra ———
    const NP = 1300, BX = 150, BY = 110, gp = new Float32Array(NP * 6), gouttes = new Float32Array(NP * 3);
    for (let k = 0; k < NP; k++) { gouttes[k * 3] = (r() - .5) * BX; gouttes[k * 3 + 1] = (r() - .5) * BY; gouttes[k * 3 + 2] = (r() - .5) * BX; }
    const lg = new T.BufferGeometry(); lg.setAttribute('position', new T.BufferAttribute(gp, 3));
    const pluie = new T.LineSegments(lg, new T.LineBasicMaterial({ color: '#a9b8ff', transparent: true, opacity: .32, depthWrite: false }));
    pluie.frustumCulled = false;
    o.scene.add(pluie);
    this._pluie = { pluie, gouttes, gp, NP, BX, BY, der: null };
  },

  tick(dt, t, cam) {
    // le trafic
    const tr = this._trafic;
    if (tr) {
      const o = tr.o;
      tr.voies.forEach((v, k) => {
        const L = v.surX ? tr.lz : tr.lx, a0 = v.surX ? tr.a0z : tr.a0x;
        v.p = (v.p + v.s * dt / L + 1) % 1;
        const along = a0 + v.p * L;
        if (v.surX) { o.position.set(v.fixe, v.y, along); o.rotation.set(0, 0, 0); } else { o.position.set(along, v.y, v.fixe); o.rotation.set(0, Math.PI / 2, 0); }
        o.updateMatrix(); tr.im.setMatrixAt(k, o.matrix);
      });
      tr.im.instanceMatrix.needsUpdate = true;
    }
    // la pluie : on retire le déplacement de la caméra (les gouttes restent dans le monde), on replie dans la boîte
    const pl = this._pluie;
    if (!pl) return;
    const c = cam.position;
    if (!pl.der) pl.der = c.clone();
    let mx = c.x - pl.der.x, my = c.y - pl.der.y, mz = c.z - pl.der.z; pl.der.copy(c);
    if (mx * mx + my * my + mz * mz > 400 * 400) mx = my = mz = 0;   // un saut de caméra (replacement) : pas de traînée
    const vx = -5, vy = -70, vz = 3;
    const rx = vx * dt - mx, ry = vy * dt - my, rz = vz * dt - mz;      // déplacement d'une goutte vu de la caméra
    let sx = rx, sy = ry, sz = rz;
    const l = Math.hypot(sx, sy, sz);
    if (l > 1e-4) { const k = Math.min(6, Math.max(1.6, l * 1.2)) / l; sx *= k; sy *= k; sz *= k; } else { sx = 0; sy = -1.6; sz = 0; }
    const g = pl.gouttes, p = pl.gp, hx = pl.BX / 2, hy = pl.BY / 2;
    for (let k = 0; k < pl.NP; k++) {
      let x = g[k * 3] + rx, y = g[k * 3 + 1] + ry, z = g[k * 3 + 2] + rz;
      if (x < -hx) x += pl.BX; else if (x > hx) x -= pl.BX;
      if (y < -hy) y += pl.BY; else if (y > hy) y -= pl.BY;
      if (z < -hx) z += pl.BX; else if (z > hx) z -= pl.BX;
      g[k * 3] = x; g[k * 3 + 1] = y; g[k * 3 + 2] = z;
      const j = k * 6;
      p[j] = c.x + x; p[j + 1] = c.y + y; p[j + 2] = c.z + z;
      p[j + 3] = c.x + x - sx; p[j + 4] = c.y + y - sy; p[j + 5] = c.z + z - sz;
    }
    pl.pluie.geometry.attributes.position.needsUpdate = true;
  },
};
