/* LA MESURE DES CHEVAUCHEMENTS DU HUD (2026-11-10, debug HUD — Sacha : « insiste vraiment sur le HUD, y a plein de problèmes de superposition
   et tout, genre quand la dark triad apparaît »). Injecté dans la page par chevauche.cjs : window.__hudMesure(nom) rend un relevé JSON.
   Un BLOC = un élément `position:fixed` visible (ou un enfant direct de #hud posé en absolu), hors calques plein écran sans texte.
   Son ENCRE = ce qui se voit vraiment : les lignes de texte (Range.getClientRects), les fonds, les bords, les canvas / img / svg —
   jamais la boîte vide. Deux blocs se CHEVAUCHENT quand leurs encres se recouvrent de plus de 4 px² (aire unie, pas de double compte). */
(function () {
  'use strict';
  const PIX = /Press Start 2P/i;
  /* BLOCS IGNORÉS (la raison) : les étincelles .pxBurst (carrés de 2-6 px qui jaillissent 0,3 s d'un gain : du décor, pas un écriteau) */
  const IGNORE = /(^|\.)pxBurst\b/;
  /* ENCRE IGNORÉE : canvas.nx3Ecl = l'éclat de la boule de feu NITRO (un canvas transparent plus grand que le bouton, qui ne se peint qu'à l'explosion du double-tap) */
  const IGNORE_ENCRE = /canvas\.nx3Ecl/;
  /* PAIRES VOULUES (la raison), clé « a | b » triée — remplie au fil des photos regardées */
  const VOULUES = {};
  window.__hudVoulues = VOULUES;
  function nomDe(e) { return e.id ? '#' + e.id : e.tagName.toLowerCase() + (e.className && typeof e.className === 'string' ? '.' + e.className.trim().split(/\s+/).slice(0, 2).join('.') : ''); }
  function alpha(c) { if (!c || c === 'transparent') return 0; const m = /rgba?\(([^)]+)\)/.exec(c); if (!m) return 1; const p = m[1].split(/[,\s/]+/).filter(Boolean); return p.length >= 4 ? parseFloat(p[3]) : 1; }
  /* visible : aucun ancêtre display:none / visibility:hidden, opacité cumulée > 0,05 */
  const visCache = new Map();
  function opa(e) {
    if (!e || e.nodeType !== 1) return 1; if (visCache.has(e)) return visCache.get(e);
    const c = getComputedStyle(e); let o;
    if (c.display === 'none' || c.contentVisibility === 'hidden') o = 0;
    else { o = parseFloat(c.opacity); if (!(o >= 0)) o = 1;
      const fo = /opacity\(([\d.]+)(%?)\)/.exec(c.filter || ''); if (fo) o *= parseFloat(fo[1]) / (fo[2] ? 100 : 1); /* filter:opacity() estompe aussi (le fil sous une ligne de mission) */
      const p = e.parentElement; o = o * (p ? opa(p) : 1); }
    visCache.set(e, o); return o;
  }
  function vis(e) { const c = getComputedStyle(e); return c.visibility !== 'hidden' && c.visibility !== 'collapse' && opa(e) > 0.05; }
  function R(b) { return { l: Math.round(b.left), t: Math.round(b.top), r: Math.round(b.right), b: Math.round(b.bottom) }; }
  /* clip par les ancêtres overflow:hidden (dans le bloc) */
  function clipAnc(e, r, stop) {
    let p = e.parentElement; r = { l: r.l, t: r.t, r: r.r, b: r.b };
    while (p && p !== document.body) { const c = getComputedStyle(p);
      if (c.overflow !== 'visible' || c.clipPath !== 'none' && c.clipPath) { if (c.overflow !== 'visible') { const b = p.getBoundingClientRect(); r.l = Math.max(r.l, b.left); r.t = Math.max(r.t, b.top); r.r = Math.min(r.r, b.right); r.b = Math.min(r.b, b.bottom); } }
      if (p === stop) break; p = p.parentElement; }
    return r;
  }
  function blocs() {
    const W = innerWidth, H = innerHeight, out = [], vus = new Set();
    const tous = document.querySelectorAll('body *');
    for (const e of tous) {
      if (e.id === 'mepTemoin' || e.tagName === 'SCRIPT' || e.tagName === 'STYLE') continue;
      const c = getComputedStyle(e);
      const fixe = c.position === 'fixed' || (e.parentElement && e.parentElement.id === 'hud' && c.position === 'absolute');
      if (!fixe) continue;
      if (!vis(e)) continue;
      const b = e.getBoundingClientRect(); if (b.width < 1 || b.height < 1) {
        /* un bloc de taille nulle peut porter des enfants qui dépassent (rare) : on le garde s'il a du texte visible */
        if (!(e.textContent || '').trim()) continue; }
      if (IGNORE.test(nomDe(e))) continue;
      out.push(e); vus.add(e);
    }
    /* le jeu dessine la scène dans un canvas plein écran : ce n'est pas un bloc du HUD */
    return out.filter(function (e) {
      const b = e.getBoundingClientRect(), tx = (e.innerText || '').trim();
      if (b.width * b.height > 0.55 * W * H && tx.length === 0) return false; /* calque plein écran (vignette, lueurs, canvas de la scène) */
      if (e.tagName === 'CANVAS' && b.width * b.height > 0.3 * W * H) return false;
      return true;
    });
  }
  function encre(bloc, autres) {
    const rects = [], textes = [], polices = [], coupes = [];
    const W = innerWidth, H = innerHeight;
    function ajoute(r, quoi, el) { if (r.r - r.l < 1 || r.b - r.t < 1) return; rects.push({ l: r.l, t: r.t, r: r.r, b: r.b, q: quoi, el: nomDe(el) }); }
    const pile = [bloc];
    while (pile.length) {
      const e = pile.pop();
      if (e !== bloc && autres.has(e)) continue; /* un bloc fixe dans un bloc fixe : il compte à part */
      if (!vis(e)) { continue; }
      const c = getComputedStyle(e);
      if (c.display === 'none') continue;
      const b = e.getBoundingClientRect();
      /* un calque plein écran sans texte (lueurs, vitesse, canvas d'effets) n'est pas de l'encre */
      if (e !== bloc && b.width * b.height > 0.55 * W * H && !(e.innerText || '').trim()) continue;
      if (b.width >= 1 && b.height >= 1) {
        const clipTxt = (c.webkitBackgroundClip || c.backgroundClip) === 'text';
        const fond = (!clipTxt && (alpha(c.backgroundColor) > 0.15 || (c.backgroundImage && c.backgroundImage !== 'none')));
        const bord = ['Top', 'Right', 'Bottom', 'Left'].some(function (s) { return parseFloat(c['border' + s + 'Width']) > 0 && alpha(c['border' + s + 'Color']) > 0.15 && c['border' + s + 'Style'] !== 'none'; });
        const media = /^(CANVAS|IMG|SVG|VIDEO|svg)$/.test(e.tagName) || (e.tagName.toLowerCase() === 'svg');
        /* les deux touches de course : leur boîte entière compte (la boule de feu se peint dans des canvas et des pseudo-éléments) */
        if (e.id === 'tNitro' || e.id === 'tGear') ajoute(clipAnc(e, R(b), bloc), 'touche', e);
        /* l'ANNEAU DE VOL autour du pouce (Léo, v1429 : .skAir dans #tKnob, dessiné par ::before / ::after) : sa boîte entière compte */
        else if (/(^| )skAir( |$)/.test(e.className || '')) ajoute(R(b), 'anneau', e);
        else if ((fond || bord || media) && !IGNORE_ENCRE.test(nomDe(e))) ajoute(clipAnc(e, R(b), bloc), media ? 'media' : fond ? 'fond' : 'bord', e);
        /* texte coupé : boîte qui rogne (overflow ≠ visible ou ellipse) et contenu plus large / plus haut */
        if ((c.overflow !== 'visible' || c.textOverflow === 'ellipsis') && (e.textContent || '').trim()) {
          if (e.scrollWidth > e.clientWidth + 1 || (c.overflowY !== 'visible' && e.scrollHeight > e.clientHeight + 2))
            coupes.push({ el: nomDe(e), sw: e.scrollWidth, cw: e.clientWidth, sh: e.scrollHeight, chh: e.clientHeight, ell: c.textOverflow === 'ellipsis', tx: (e.textContent || '').trim().slice(0, 40) });
        }
        if (media) continue;
      }
      for (const n of e.childNodes) {
        if (n.nodeType === 3) { const t = n.nodeValue.trim(); if (!t) continue;
          const rg = document.createRange(); rg.selectNodeContents(n);
          for (const rr of rg.getClientRects()) { if (rr.width < 1 || rr.height < 1) continue; ajoute(clipAnc(n, R(rr), bloc), 'texte', e); }
          textes.push(t.slice(0, 40));
          /* EXCEPTION NOMMÉE par Sacha (accueil-boutique.css, 18/10) : le NOM d'une figure (#fh, #fhLeg, porteur de data-rp) prend la police de sa rareté */
          const ff = c.fontFamily || ''; if (!PIX.test(ff.split(',')[0]) && !(e.closest && e.closest('#fh [data-rp],#fhLeg [data-rp]'))) polices.push({ el: nomDe(e), ff: ff.slice(0, 60), tx: t.slice(0, 30) });
        } else if (n.nodeType === 1) pile.push(n);
      }
    }
    return { rects, textes, polices, coupes };
  }
  /* aire de l'union des intersections de deux listes de rectangles (balayage par grille de 2 px : assez précis, sans double compte) */
  function aireCommune(A, B) {
    const I = [];
    for (const a of A) for (const b of B) { const l = Math.max(a.l, b.l), t = Math.max(a.t, b.t), r = Math.min(a.r, b.r), bo = Math.min(a.b, b.b); if (r > l && bo > t) I.push({ l, t, r, b: bo, qa: a.q + ':' + a.el, qb: b.q + ':' + b.el }); }
    if (!I.length) return { aire: 0, I };
    let l = 1e9, t = 1e9, r = -1e9, bo = -1e9; for (const x of I) { l = Math.min(l, x.l); t = Math.min(t, x.t); r = Math.max(r, x.r); bo = Math.max(bo, x.b); }
    let n = 0; for (let y = t; y < bo; y += 2) for (let x = l; x < r; x += 2) { for (const q of I) if (x >= q.l && x < q.r && y >= q.t && y < q.b) { n++; break; } }
    return { aire: n * 4, I, boite: { l, t, r, b: bo } };
  }
  window.__hudMesure = function (nom, zones) {
    visCache.clear();
    const W = innerWidth, H = innerHeight, B = blocs(), S = new Set(B), info = [];
    for (const e of B) {
      const en = encre(e, S); if (!en.rects.length) continue;
      const c = getComputedStyle(e), b = e.getBoundingClientRect();
      info.push({ e, n: nomDe(e), z: c.zIndex, box: R(b), op: opa(e), ...en });
    }
    const pairs = [], hors = [], zone = [], coupes = [], polices = [];
    /* ancêtre / descendant : jamais une paire (un bloc fixe dans un autre se peint par-dessus exprès) */
    for (let i = 0; i < info.length; i++) for (let j = i + 1; j < info.length; j++) {
      const a = info[i], b = info[j]; if (a.e.contains(b.e) || b.e.contains(a.e)) continue;
      /* LE POUCE (#tJoy, 10/11 au soir, joystick NITRO) : le socle, le pion et les quatre repères forment UNE commande (le pion roule sur le socle, les repères
         l'entourent) ; le socle et le pion sont centrés SUR la touche NITRO exprès. Les repères, eux, ne doivent toucher ni NITRO ni le reste du HUD. */
      const ja = a.e.closest && a.e.closest('#tJoy'), jb = b.e.closest && b.e.closest('#tJoy');
      if (ja && jb) continue;
      if ((ja && /tjSocle|tjPion/.test(a.n) && b.n === '#touchCtl') || (jb && /tjSocle|tjPion/.test(b.n) && a.n === '#touchCtl')) continue;
      /* un bloc ESTOMPÉ exprès (opacité effective < 0,2 : les pouvoirs sous une grande annonce, .08 ; le fil sous une ligne de mission, .15) est un fantôme voulu */
      if (a.op < 0.2 || b.op < 0.2) continue;
      const k = [a.n, b.n].sort().join(' | ');
      const x = aireCommune(a.rects, b.rects); if (x.aire > 4) pairs.push({ k, voulue: VOULUES[k] || '', aire: x.aire, boite: x.boite, ex: x.I.slice(0, 3).map(function (q) { return q.qa + ' × ' + q.qb; }), za: a.z, zb: b.z });
    }
    const Z = zones || [];
    for (const a of info) {
      if (a.op < 0.2) continue; /* un fantôme voulu ne compte ni hors écran ni dans l'encoche (les pouvoirs glissent de 16 px en s'effaçant) */
      for (const r of a.rects) {
        if (r.l < -1 || r.t < -1 || r.r > W + 1 || r.b > H + 1) hors.push({ n: a.n, el: r.el, q: r.q, r: [r.l, r.t, r.r, r.b] });
        for (const z of Z) { const l = Math.max(r.l, z.l), t = Math.max(r.t, z.t), rr = Math.min(r.r, z.r), bb = Math.min(r.b, z.b); if (rr - l > 1 && bb - t > 1) zone.push({ n: a.n, el: r.el, q: r.q, zone: z.n, r: [r.l, r.t, r.r, r.b], aire: (rr - l) * (bb - t) }); }
      }
      for (const c of a.coupes) coupes.push(Object.assign({ n: a.n }, c));
      for (const p of a.polices) polices.push(Object.assign({ n: a.n }, p));
    }
    return {
      nom, vp: [W, H], body: document.body.className.slice(0, 200),
      blocs: info.map(function (a) { return { n: a.n, z: a.z, op: +a.op.toFixed(2), box: a.box, tx: a.textes.slice(0, 4).join(' / ') }; }),
      pairs, hors: dedup(hors), zone: dedup(zone), coupes, polices: dedup(polices)
    };
  };
  function dedup(L) { const s = new Set(), o = []; for (const x of L) { const k = JSON.stringify([x.n, x.el, x.zone || '', x.ff || '']); if (s.has(k)) continue; s.add(k); o.push(x); } return o; }
})();
