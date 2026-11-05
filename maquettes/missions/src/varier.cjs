// BANC « ÉCRAN MISSIONS » : le VRAI jeu (origin/main, servi sur 127.0.0.1:8731), l'état de partie de etat.cjs, l'écran MISSIONS ouvert par le vrai chemin
// (garage → porte MISSIONS) ; une feuille <style> (+ un peu de DOM) injectée par piste ; capture + mesure de l'espace occupé. Images figées (aucune animation).
// usage : node varier.cjs <formats> <pistes> [dossier]      ex. node varier.cjs debout,couche base,a,b,c ../rendus
// prérequis : `cashcar-mission` lancé (python3 -m http.server 8731 --directory "VERSION PRINCIPALE").
const B = require('/Users/sachaberes/cash-car/ui/banc/lib.cjs');
const path = require('path'), fs = require('fs');
const V = require('./variantes.cjs'), ETAT = require('./etat.cjs');
const formats = (process.argv[2] || 'debout').split(','), noms = (process.argv[3] || 'base').split(',');
const dir = path.resolve(process.argv[4] || path.join(__dirname, '..', 'rendus')); fs.mkdirSync(dir, { recursive: true });
const PORT = +process.env.PORT || 8731;

// L'ESPACE OCCUPÉ : la zone libre = l'écran moins les marges sûres ; ce qui compte = le titre, le panneau (ou les cartes), l'échelle, la barre du bas ; on rastérise l'union.
const MESURE = () => {
  const W = innerWidth, H = innerHeight, cs = getComputedStyle(document.documentElement), m = n => parseFloat(cs.getPropertyValue(n)) || 0;
  const zone = { x: m('--sL'), y: m('--sT'), w: W - m('--sL') - m('--sR'), h: H - m('--sT') - m('--sB') };
  const vis = e => { let x = e; while (x && x !== document.body) { const s = getComputedStyle(x); if (s.display === 'none' || s.visibility === 'hidden' || +s.opacity < .05) return false; x = x.parentElement; } return true; };
  const rect = e => { const r = e.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; };
  const sels = { titre: '#gmListe .mcNom', sous: '#gmListe .mcSous', echelle: '.mkEchBox', panneau: '#gmListe .mcPan', bas: '#gmBas' };
  const o = { W, H, zone, r: {} };
  for (const k in sels) { const e = document.querySelector(sels[k]); if (e && vis(e)) o.r[k] = rect(e); }
  // union rastérisée (pas de 2 px) du titre, du panneau, de l'échelle et de la barre, dans la zone libre
  const rs = ['titre', 'sous', 'echelle', 'panneau', 'bas'].map(k => o.r[k]).filter(Boolean); let n = 0, t = 0;
  for (let x = zone.x; x < zone.x + zone.w; x += 2) for (let y = zone.y; y < zone.y + zone.h; y += 2) { t++; if (rs.some(r => x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h)) n++; }
  o.occupe = Math.round(100 * n / t);
  // chaque ligne : le texte est-il coupé ? (une carte dont le contenu déborde)
  o.coupes = [...document.querySelectorAll('#gmListe .mcL')].filter(e => e.scrollHeight > e.clientHeight + 1 || e.scrollWidth > e.clientWidth + 1).map(e => e.innerText.slice(0, 30).replace(/\n/g, ' '));
  const p = document.querySelector('#gmListe .mcPan'); if (p) o.panneauDefile = p.scrollHeight > p.clientHeight + 1;
  o.cartes = [...document.querySelectorAll('#gmListe .mcL')].map(rect);
  return o;
};

(async () => {
  let br = null, s0 = null;
  for (const fmt of formats) {
    const s = await B.ouvre({ port: PORT, vp: fmt, marges: true, dir, br, q: '?garde=1', save: ETAT });
    if (!br) { br = s.br; s0 = s; }
    const ev = (f, a) => s.pg.evaluate(f, a).catch(e => 'ERR ' + String(e.message).slice(0, 200));
    const garage = await s.tapSel('#mHome [data-m="garage"]', { attente: 4500, optionnel: true }); // couché, le jeu arrive déjà au garage (body.inGarage)
    if (!garage) await B.sleep(3500);
    await s.tapSel('#gvMis', { attente: 3200 });
    const inj = css => s.pg.evaluate(c => { let st = document.getElementById('mock'); if (!st) { st = document.createElement('style'); st.id = 'mock'; document.head.appendChild(st); } st.textContent = c; }, css);
    await ev(() => { const g = document.createElement('style'); g.id = 'gel'; g.textContent = '*,*::before,*::after{animation:none!important;transition:none!important}'; document.head.appendChild(g); });
    for (const n of noms) {
      const v = V[n]; if (!v) { console.log('piste inconnue : ' + n); continue; }
      await ev(() => { document.querySelectorAll('[data-mk-moved]').forEach(e => { const p = document.querySelector('#gmListe .mcPan'); if (p) p.appendChild(e); delete e.dataset.mkMoved; }); document.querySelectorAll('.mkx').forEach(e => e.remove()); });
      await inj(v.css);
      if (v.js) { const r = await s.pg.evaluate(v.js).catch(e => 'ERR ' + String(e.message).slice(0, 200)); if (r && String(r).startsWith('ERR')) console.log('js ' + n + ' : ' + r); }
      await B.sleep(500);
      await s.shot(`${fmt}-${n}`);
      const m = await ev(MESURE); fs.writeFileSync(path.join(dir, `${fmt}-${n}.json`), JSON.stringify(m));
      console.log(`[${fmt} ${n}] occupé ${m.occupe} %` + (m.coupes && m.coupes.length ? ' · CARTES COUPÉES : ' + m.coupes.join(' | ') : '') + (m.panneauDefile ? ' · le panneau défile' : '') + ' · rects ' + JSON.stringify(m.r));
    }
    console.log('ERREURS ' + fmt + ' : ' + (s.errs.filter(x => !/dark-triad/.test(x)).join(' | ') || '0'));
    if (s !== s0) await s.ferme(); else await Promise.race([s.ctx.close(), B.sleep(3000)]).catch(() => { });
  }
  await s0.ferme(); process.exit(0);
})().catch(e => { console.error('ÉCHEC', e); process.exit(1); });
