// POSTES (2026-10-14, banc perf) : QUELS OBJETS de la scène sont derrière les appels / triangles. Lecture seule, ne modifie pas le jeu.
//   const { postes } = require('/Users/sachaberes/cash-car/perf/banc/postes.cjs');
//   const r = await postes(s.pg, { top: 30, rendu: true, exSans: 5 });     // s = session de perf.cjs (P.ouvre), la course déjà lancée
// Deux vues complémentaires :
//   PARCOURS  : on marche dans la scène (dbgScene().scene) ; objet compté s'il est visible (lui + tous ses parents), sa matière visible,
//               et dans le champ de la caméra (THREE.Frustum + frustumCulled, comme le moteur) ; un appel par groupe de géométrie si matières en tableau.
//   RENDU     : (opts.rendu !== false) on accroche renderer.renderBufferDirect le temps d'UN renderer.render(scene,camera) (comme dbgAppels) :
//               appels RÉELLEMENT émis, par objet. Les passes d'ombre (matières de profondeur) sont comptées à part ({ombre}).
// Regroupement : (1) chemin des ancêtres NOMMÉS (name, sinon userData parlant, sinon repère JADE/NUVOX/FIN), les chiffres du nom normalisés en #,
//                (2) type de matière, (3) side (0 front, 1 back, 2 double), (4) transparent. Un seul appel par objet et par groupe, quel que soit side.
// Sortie : { groupes:[30 premiers par triangles], totaux, sansNom:{n,appels,triangles,exemples:[5]}, rendu:{…}, notes }
async function postes(pg, opts) {
  return pg.evaluate((o) => {
    o = o || {};
    const TOP = o.top || 30, EXS = o.exSans || 5, notes = [];
    const R = { quand: new Date().toISOString(), notes };
    const D = (typeof dbgScene === 'function') ? dbgScene() : null;
    if (!D || !D.scene) return { erreur: 'dbgScene() absent ou sans scene' };
    const scene = D.scene, cam = D.cam || (typeof camera !== 'undefined' ? camera : null), rdr = D.rdr || (typeof renderer !== 'undefined' ? renderer : null);
    const T = window.THREE; let frustum = null;
    if (T && T.Frustum && T.Matrix4 && cam) {
      try { scene.updateMatrixWorld(true); cam.updateMatrixWorld(true); const m = new T.Matrix4().multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse); frustum = new T.Frustum().setFromProjectionMatrix(m); }
      catch (e) { notes.push('Frustum impossible : ' + e); }
    } else notes.push('THREE.Frustum ou caméra indisponible : test de champ ignoré (tout objet visible compté)');
    R.frustum = !!frustum;
    const r1 = (x) => Math.round(x * 10) / 10;
    // -- repères des InstancedMesh du jeu (comme dbgAppels) --
    const repere = new Map();
    try { if (typeof JADE !== 'undefined' && JADE.fam) for (const F of JADE.fam) { if (!F) continue; const b = 'jade ' + F.b0 + '-' + F.b1; if (F.im) repere.set(F.im, b); if (F.im2) repere.set(F.im2, b + ' absorption'); if (F.im3) repere.set(F.im3, b + ' profondeur'); } } catch (e) { notes.push('repères JADE : ' + e); }
    try { if (typeof NUVOX !== 'undefined' && NUVOX.ims) for (const m of NUVOX.ims) repere.set(m, 'nuages-cubes'); } catch (e) { }
    try { if (typeof FIN !== 'undefined' && FIN.fam) for (const F of FIN.fam) if (F && F.im) repere.set(F.im, 'cubes-fins'); } catch (e) { }
    const norm = (s) => String(s).replace(/\d+/g, '#').slice(0, 60);
    const nomDe = (ob) => { // nom "parlant" d'UN objet, ou ''
      try {
        if (ob.name) return norm(ob.name);
        if (repere.has(ob)) return repere.get(ob);
        const u = ob.userData; if (u && typeof u === 'object') {
          for (const k of ['nom', 'name', 'kind', 'type', 'id', 'tag', 'role']) if (typeof u[k] === 'string' && u[k]) return 'ud.' + k + '=' + norm(u[k]);
          const ks = Object.keys(u); if (ks.length) return 'ud{' + ks.slice(0, 4).join(',') + '}';
        }
      } catch (e) { }
      return '';
    };
    // -- triangles d'UN appel --
    const compte = (ob, geo, grp) => {
      let tot = 0; try { tot = geo.index ? geo.index.count : (geo.attributes && geo.attributes.position ? geo.attributes.position.count : 0); } catch (e) { }
      let dr0 = 0, drN = Infinity; try { dr0 = geo.drawRange.start || 0; drN = geo.drawRange.count; if (!(drN >= 0)) drN = Infinity; } catch (e) { }
      let s = dr0, f = Math.min(tot, dr0 + drN);
      if (grp) { s = Math.max(grp.start, dr0); f = Math.min(f, grp.start + grp.count); }
      const verts = Math.max(0, f - s);
      let inst = 1; try { if (ob.isInstancedMesh) inst = ob.count; if (geo.isInstancedBufferGeometry && isFinite(geo.instanceCount) && geo.instanceCount >= 0) inst = Math.min(inst, geo.instanceCount) || geo.instanceCount; } catch (e) { }
      const tris = (ob.isMesh || ob.isSkinnedMesh) ? verts / 3 * inst : 0;
      return { tris, verts: verts * inst };
    };
    // -- le RENDU réel (optionnel) --
    const vus = new Map(); const ombre = { appels: 0, triangles: 0 }; let rd = null;
    if (o.rendu !== false && rdr && cam && typeof rdr.renderBufferDirect === 'function') {
      const orig = rdr.renderBufferDirect; rd = { appels: 0, triangles: 0 };
      rdr.renderBufferDirect = function (c, sc, geo, mat, ob, grp) {
        try {
          const k = compte(ob, geo, grp);
          if (mat && (mat.isMeshDepthMaterial || mat.isMeshDistanceMaterial)) { ombre.appels++; ombre.triangles += k.tris; }
          else { rd.appels++; rd.triangles += k.tris; const e = vus.get(ob) || { n: 0, tris: 0 }; e.n++; e.tris += k.tris; vus.set(ob, e); }
        } catch (e) { }
        return orig.apply(this, arguments);
      };
      try { rdr.render(scene, cam); } catch (e) { notes.push('render() : ' + e); } finally { rdr.renderBufferDirect = orig; }
      R.rendu = { appels: rd.appels, triangles: Math.round(rd.triangles), ombre: { appels: ombre.appels, triangles: Math.round(ombre.triangles) } };
    } else if (o.rendu !== false) notes.push('renderBufferDirect indisponible : vue RENDU absente');
    // -- le PARCOURS --
    const G = new Map(), tot = { objets: 0, appels: 0, triangles: 0, hors: { invisibles: 0, horsChamp: 0, matInvisible: 0 }, parMatiere: {}, transparents: { appels: 0, triangles: 0 } };
    const SANS = { n: 0, appels: 0, triangles: 0, liste: [] };
    const ajoute = (ob, mat, k, chemin, sansNom) => {
      const sd = mat ? mat.side : -1, tr = !!(mat && mat.transparent), mt = mat ? (mat.type || '?') : 'aucune';
      const cle = chemin + '|' + mt + '|' + sd + '|' + tr;
      let g = G.get(cle); if (!g) { g = { chemin, matiere: mt, side: sd, transparent: tr, appels: 0, triangles: 0, objets: new Set(), uuid: ob.uuid, exNom: ob.name || '', appelsRendu: 0, trisRendu: 0 }; G.set(cle, g); }
      g.appels++; g.triangles += k.tris; g.objets.add(ob);
      tot.appels++; tot.triangles += k.tris; if (tr) { tot.transparents.appels++; tot.transparents.triangles += k.tris; }
      const pm = tot.parMatiere[mt] || (tot.parMatiere[mt] = { appels: 0, triangles: 0 }); pm.appels++; pm.triangles += k.tris;
      if (sansNom) { SANS.appels++; SANS.triangles += k.tris; }
    };
    const cheminDe = (ob) => { const L = []; let p = ob; for (let i = 0; p && i < 200; i++, p = p.parent) { const n = nomDe(p); if (n && n !== L[0]) L.unshift(n); } return L; };
    const typesParents = (ob) => { const L = []; let p = ob.parent; for (let i = 0; p && i < 8; i++, p = p.parent) L.push(p.type || '?'); return L.join('<'); };
    const visite = (ob, visible) => {
      try {
        if (!ob) return; const vis = visible && ob.visible !== false;
        if (ob.isMesh || ob.isPoints || ob.isLine) {
          try {
            if (!vis) { tot.hors.invisibles++; }
            else if (frustum && ob.frustumCulled !== false && !frustum.intersectsObject(ob)) { tot.hors.horsChamp++; }
            else {
              const geo = ob.geometry, mats = Array.isArray(ob.material) ? ob.material : [ob.material];
              const appels = []; // [{mat,grp}]
              if (Array.isArray(ob.material)) { for (const g of (geo.groups || [])) { const m = mats[g.materialIndex]; if (m) appels.push({ mat: m, grp: g }); } }
              else appels.push({ mat: ob.material, grp: null });
              tot.objets++;
              const chain = cheminDe(ob), sansNom = chain.length === 0, chemin = sansNom ? '(sans ancêtre nommé)' : chain.join(' > ');
              const vu = vus.get(ob);
              let premier = true;
              for (const a of appels) {
                if (a.mat && a.mat.visible === false) { tot.hors.matInvisible++; continue; }
                const k = compte(ob, geo, a.grp);
                ajoute(ob, a.mat, k, chemin, sansNom);
                const g = G.get(chemin + '|' + (a.mat ? a.mat.type || '?' : 'aucune') + '|' + (a.mat ? a.mat.side : -1) + '|' + !!(a.mat && a.mat.transparent));
                if (g && vu && premier) { g.appelsRendu += vu.n; g.trisRendu += vu.tris; premier = false; } // rendu attribué une fois par objet (les groupes d'un même objet partagent l'entrée)
                if (sansNom) {
                  SANS.n++;
                  let pos = null, rayon = null; try { ob.updateMatrixWorld(); const e = ob.matrixWorld.elements; pos = [r1(e[12]), r1(e[13]), r1(e[14])]; if (!geo.boundingSphere) geo.computeBoundingSphere(); rayon = r1(geo.boundingSphere.radius); } catch (e) { }
                  let par = null; try { par = geo.parameters ? JSON.parse(JSON.stringify(geo.parameters, (kk, v) => (v && v.isBufferGeometry) ? '[geo]' : (typeof v === 'number' && !isFinite(v) ? String(v) : v))) : null; } catch (e) { par = '(non sérialisable)'; }
                  SANS.liste.push({ type: ob.type, instancie: !!ob.isInstancedMesh, instances: ob.isInstancedMesh ? ob.count : undefined, matiere: a.mat ? a.mat.type : null, matNom: a.mat && a.mat.name || undefined, couleur: a.mat && a.mat.color ? a.mat.color.getHexString() : undefined, transparent: !!(a.mat && a.mat.transparent), side: a.mat ? a.mat.side : null,
                    triangles: Math.round(k.tris), position: pos, rayon, geometrie: geo.type, parametres: par, sommets: geo.attributes && geo.attributes.position ? geo.attributes.position.count : null, userData: Object.keys(ob.userData || {}).slice(0, 6), renderOrder: ob.renderOrder, parents: typesParents(ob), enfantsDuParent: ob.parent ? ob.parent.children.length : null, uuid: ob.uuid });
                }
              }
            }
          } catch (e) { (R.erreurs = R.erreurs || []).push(String(e).slice(0, 120)); }
        }
        const ch = ob.children; if (ch) for (let i = 0; i < ch.length; i++) visite(ch[i], vis);
      } catch (e) { (R.erreurs = R.erreurs || []).push(String(e).slice(0, 120)); }
    };
    visite(scene, true);
    const L = [...G.values()].sort((a, b) => b.triangles - a.triangles);
    R.groupes = L.slice(0, TOP).map(g => ({ chemin: g.chemin, matiere: g.matiere, side: g.side, transparent: g.transparent, objets: g.objets.size, appels: g.appels, triangles: Math.round(g.triangles), appelsRendu: rd ? g.appelsRendu : undefined, trisRendu: rd ? Math.round(g.trisRendu) : undefined, uuid: g.uuid, exNom: g.exNom || undefined }));
    R.nGroupes = L.length;
    R.totaux = { objets: tot.objets, appels: tot.appels, triangles: Math.round(tot.triangles), hors: tot.hors, transparents: { appels: tot.transparents.appels, triangles: Math.round(tot.transparents.triangles) },
      parMatiere: Object.fromEntries(Object.entries(tot.parMatiere).sort((a, b) => b[1].triangles - a[1].triangles).map(([k, v]) => [k, { appels: v.appels, triangles: Math.round(v.triangles) }])), cible: o.cible || undefined };
    SANS.liste.sort((a, b) => b.triangles - a.triangles);
    R.sansNom = { n: SANS.n, appels: SANS.appels, triangles: Math.round(SANS.triangles), exemples: SANS.liste.slice(0, EXS) };
    // Objets de la vue RENDU non retrouvés dans le parcours (ex. hors scène, matière cachée) : l'écart signale un trou du parcours.
    if (rd) { let hors = 0, th = 0; const vusParcours = new Set(); for (const g of G.values()) for (const ob of g.objets) vusParcours.add(ob); for (const [ob, e] of vus) if (!vusParcours.has(ob)) { hors += e.n; th += e.tris; } R.rendu.nonRetrouves = { appels: hors, triangles: Math.round(th) }; }
    return R;
  }, opts || {});
}
module.exports = { postes };
