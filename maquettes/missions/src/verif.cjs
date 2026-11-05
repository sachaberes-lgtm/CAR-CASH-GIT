// VÉRIFICATION de l'écran MISSIONS réel (code de la branche, sans aucune injection) : formats × scénarios ; capture + mesures (cartes coupées, panneau qui défile, rects) + audit des touches.
// usage : node verif.cjs <formats> <scénarios> [dossier]   ex. node verif.cjs debout,couche milieu,neuf,n2,fin,vide ../rendus-verif
const B = require('/Users/sachaberes/cash-car/ui/banc/lib.cjs');
const path = require('path'), fs = require('fs');
const BASE = require('./etat.cjs');
const formats = (process.argv[2] || 'debout').split(','), scen = (process.argv[3] || 'milieu').split(',');
const dir = path.resolve(process.argv[4] || path.join(__dirname, '..', 'rendus-verif')); fs.mkdirSync(dir, { recursive: true });
const clone = o => JSON.parse(JSON.stringify(o));
const TOUS = [...fs.readFileSync(path.join(__dirname, '..', '..', '..', 'code', 'missions', 'table.js'), 'utf8').matchAll(/\{id:'([a-z0-9]{2,12})'/g)].map(m => m[1]);
const SC = {
  milieu: () => clone(BASE),                                                                              // palier 2, une caisse à récupérer, trois en cours (4 cartes)
  neuf: () => { const s = clone(BASE); s.m2.pv = 1; return s; },                                          // « NOUVEAU PALIER » (le tampon sous le titre)
  fin: () => clone(BASE),                                                                                 // + les réussies dépliées (on tape la ligne)
  n2: () => { const s = clone(BASE); s.m2.pr.push('fig5'); s.m2.ok.push('ai5'); s.m2.pr.push('ai5'); return s; }, // 2 cartes seulement
  videfin: () => { const s = clone(BASE); s.m2.ok = TOUS.slice(); s.m2.pr = TOUS.slice(); return s; },                       // idem + on déplie les réussies (la ligne est visible)
  vide: () => { const s = clone(BASE); s.m2.ok = TOUS.slice(); s.m2.pr = TOUS.slice(); return s; },       // tout réussi et récupéré : 0 carte
  depart: () => { const s = clone(BASE); delete s.m2; s.owned = [0, 1, 2, 3]; return s; },                // premier jour : palier 1, rien de fait
};
const MESURE = () => {
  const W = innerWidth, H = innerHeight, rect = e => { const r = e.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)]; };
  const o = { W, H }; const q = s => document.querySelector(s);
  for (const [k, s] of [['titre', '#gmListe .mcNom'], ['panneau', '#gmListe .mcPan'], ['bas', '#gmBas']]) { const e = q(s); if (e) o[k] = rect(e); }
  o.cartes = [...document.querySelectorAll('#gmListe .mcPan>.mcL')].map(rect);
  o.coupes = [...document.querySelectorAll('#gmListe .mcL')].filter(e => e.scrollHeight > e.clientHeight + 1 || e.scrollWidth > e.clientWidth + 1).map(e => e.innerText.slice(0, 28).replace(/\n/g, ' '));
  const p = q('#gmListe .mcPan'); if (p) { o.defile = p.scrollHeight > p.clientHeight + 1; o.pb = p.getBoundingClientRect().bottom; }
  const b = q('#gmBas'); if (b) o.barreTop = Math.round(b.getBoundingClientRect().top);
  o.sousBarre = p && b ? Math.round(o.pb - b.getBoundingClientRect().top) : null;   // > 0 : le panneau passe sous la barre
  o.n = p && p.getAttribute('data-n');
  return o;
};
(async () => {
  let br = null, s0 = null;
  for (const fmt of formats) for (const sc of scen) {
    const s = await B.ouvre({ port: 8731, vp: fmt, marges: true, dir, br, q: '?garde=1', save: SC[sc]() });
    if (!br) { br = s.br; s0 = s; }
    const garage = await s.tapSel('#mHome [data-m="garage"]', { attente: 4500, optionnel: true }); if (!garage) await B.sleep(3500);
    for (let k = 0; k < 12; k++) { if (await s.tapSel('#gvMis', { attente: 3200, optionnel: true })) break; await B.sleep(2500); } // le garage met du temps sur une machine chargée
    if (sc === 'fin' || sc === 'videfin') { await s.tapSel('#gmListe .mcFin', { attente: 1200 }); }
    await s.pg.evaluate(() => { const g = document.createElement('style'); g.textContent = '*,*::before,*::after{animation:none!important;transition:none!important}'; document.head.appendChild(g); });
    await B.sleep(400);
    await s.shot(`${fmt}-${sc}`);
    const info = await s.pg.evaluate(() => { const p = document.querySelector('#gmListe .mcPan'); return { cartes: p.querySelectorAll('.mcL').length, sections: [...p.querySelectorAll('.mcSec span')].map(e => e.textContent + ' ' + (e.parentElement.querySelector('b') || {}).textContent), sh: p.scrollHeight, ch: p.clientHeight }; });
    console.log(`   liste : ${info.cartes} cartes · sections ${JSON.stringify(info.sections)} · hauteur ${info.sh} dans ${info.ch}`);
    await s.pg.evaluate(() => { const p = document.querySelector('#gmListe .mcPan'); p.scrollTop = p.scrollHeight; }); await B.sleep(500); await s.shot(`${fmt}-${sc}-bas`);
    await s.pg.evaluate(() => { const p = document.querySelector('#gmListe .mcPan'); p.scrollTop = p.scrollHeight * .4; }); await B.sleep(500); await s.shot(`${fmt}-${sc}-mid`);
    await s.pg.evaluate(() => { document.querySelector('#gmListe .mcPan').scrollTop = 0; });
    const m = await s.pg.evaluate(MESURE); fs.writeFileSync(path.join(dir, `${fmt}-${sc}.json`), JSON.stringify(m));
    const aud = await s.boutons({ min: 44 }).catch(e => ({ err: String(e).slice(0, 80) }));
    const pb = (aud && (aud.problemes || aud.pb || aud.issues)) || [];
    console.log(`[${fmt} ${sc}] n=${m.n} cartes=${m.cartes.length} coupées=${m.coupes.length ? m.coupes.join('|') : 0} défile=${m.defile} sousBarre=${m.sousBarre} · panneau ${JSON.stringify(m.panneau)} barre ${JSON.stringify(m.bas)}`);
    if (Array.isArray(pb) && pb.length) console.log('   audit:', JSON.stringify(pb).slice(0, 400));
    console.log('   erreurs: ' + (s.errs.filter(x => !/dark-triad/.test(x)).join(' | ') || 0));
    if (s !== s0) await s.ferme(); else await Promise.race([s.ctx.close(), B.sleep(3000)]).catch(() => { });
  }
  await s0.ferme(); process.exit(0);
})().catch(e => { console.error('ÉCHEC', e); process.exit(1); });
