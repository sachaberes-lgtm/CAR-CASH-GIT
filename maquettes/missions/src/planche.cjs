// PLANCHES : les rendus du vrai jeu côte à côte (debout : 4 colonnes ; couché : 2 × 2), avec le nom de la piste, sa phrase et l'espace occupé mesuré.
// usage : node planche.cjs      → ../planche-debout.png et ../planche-couche.png
const { chromium } = require('/Users/sachaberes/.hermes/hermes-agent/node_modules/playwright-core');
const fs = require('fs'), path = require('path');
const R = path.join(__dirname, '..', 'rendus'), OUT = path.join(__dirname, '..');
const T = {
  base: ['AUJOURD\'HUI', 'Quatre lignes, un panneau de 560 px : le reste de l\'écran est vide.'],
  a: ['A · PLEIN CADRE', 'Même écran, tout est étiré : les cartes se partagent la hauteur, texte et jauge plus gros.'],
  b: ['B · ÉCHELLE', 'On ajoute la progression : les 13 paliers en marches, et le palier suivant en grand.'],
  c: ['C · CARTES', 'Un tableau de cartes : la récompense, le texte, un gros pourcentage.'],
};
const occ = (f, n) => { try { return JSON.parse(fs.readFileSync(path.join(R, `${f}-${n}.json`))).occupe; } catch (e) { return '?'; } };
const img = (f, n) => 'data:image/png;base64,' + fs.readFileSync(path.join(R, `${f}-${n}.png`)).toString('base64');
const font = 'data:font/woff2;base64,' + fs.readFileSync(path.join(__dirname, 'pressstart2p.woff2')).toString('base64');
const CSS = `@font-face{font-family:PS;src:url(${font}) format('woff2')}
*{box-sizing:border-box;margin:0}body{background:#0d0a1c;color:#fff;font-family:PS,monospace;padding:28px 24px 24px}
h1{font-size:15px;letter-spacing:2px;margin-bottom:6px}h1 em{font-style:normal;color:#ffc72a}
.sub{font-size:8px;color:#9f98c8;letter-spacing:1px;margin-bottom:22px;line-height:1.7}
.g{display:grid;gap:24px}.c{display:flex;flex-direction:column;gap:10px}
.t{font-size:10px;letter-spacing:1px;line-height:1.5}.t b{font-weight:400;color:#ffc72a}.base .t b{color:#9f98c8}
.d{font-size:7px;line-height:1.8;color:#b9b2e6;min-height:38px}.o{font-size:8px;color:#4dff9a}.base .o{color:#ff8a6b}
.f{border:1px solid #2b2352;background:#05030c;line-height:0}.f img{width:100%;display:block}`;
async function planche(f, cols, nom, titre, w) {
  const cells = ['base', 'a', 'b', 'c'].map(n => `<div class="c ${n === 'base' ? 'base' : ''}"><div class="t"><b>${T[n][0]}</b></div><div class="d">${T[n][1]}</div><div class="o">ÉCRAN OCCUPÉ : ${occ(f, n)} %</div><div class="f"><img src="${img(f, n)}"></div></div>`).join('');
  const html = `<html><head><style>${CSS}.g{grid-template-columns:repeat(${cols},1fr)}</style></head><body style="width:${w}px"><h1>ÉCRAN <em>MISSIONS</em> · ${titre}</h1><div class="sub">LE VRAI JEU (v1145), VRAIS ÉLÉMENTS · PALIER 2 SUR 13 · UNE CAISSE À RÉCUPÉRER · SANS LE PORTAIL (RETIRÉ LE 05/11)</div><div class="g">${cells}</div></body></html>`;
  const br = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
  const pg = await br.newPage({ viewport: { width: w, height: 800 }, deviceScaleFactor: 2 }); await pg.setContent(html); await pg.waitForTimeout(600);
  await pg.screenshot({ path: path.join(OUT, nom), fullPage: true }); await br.close(); console.log('écrit', nom);
}
(async () => { await planche('debout', 4, 'planche-debout.png', 'DEBOUT', 1380); await planche('couche', 2, 'planche-couche.png', 'COUCHÉ', 1400); process.exit(0); })().catch(e => { console.error(e); process.exit(1); });
