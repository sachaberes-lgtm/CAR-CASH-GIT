// Parcours exhaustif de la boutique : chaque rayon, chaque interaction, des invariants contrôlés après CHAQUE geste.
//   node parcours.cjs <port> <format: pc|portrait|iphone-couche|se> [rayons...]
const fs = require('fs'), path = require('path'), SP = __dirname.split(path.sep).join('/');
const [port, fmt = 'pc', ...ray] = process.argv.slice(2);
const B = 'http://127.0.0.1:' + port;
const INV = fs.readFileSync(SP + '/inv.js', 'utf8');
const dormir = ms => new Promise(r => setTimeout(r, ms));
const ev = async (js) => { const r = await fetch(B + '/ev', { method: 'POST', body: js }); const t = await r.text(); try { return JSON.parse(t); } catch (e) { return t; } };
const get = async (p) => (await fetch(B + p)).text();
const tap = async (sel) => get('/tap?sel=' + encodeURIComponent(sel));
const tapxy = async (x, y) => get('/tapxy?x=' + x + '&y=' + y);
const FM = { pc: [844, 390, 0, 0, 0, 0, 0], portrait: [393, 852, 59, 34, 0, 0, 1], 'iphone-couche': [852, 393, 0, 21, 59, 59, 1], se: [375, 667, 20, 0, 0, 0, 1], grand: [1920, 1080, 0, 0, 0, 0, 0] };
const viol = []; let nAct = 0;
async function inv(act) { nAct++; let o; try { o = JSON.parse(await ev(INV)); } catch (e) { viol.push(fmt + ' | ' + act + ' → invariants illisibles : ' + e.message.slice(0, 80)); return null; }
  const err = JSON.parse(await get('/err')); if (err.length) { viol.push(fmt + ' | ' + act + ' → ERREUR JS : ' + err.join(' ; ').slice(0, 220)); await get('/errz'); }
  if (Array.isArray(o)) { viol.push(fmt + ' | ' + act + ' → ' + o.join(' ; ')); return o; }
  if (o.pb && o.pb.length) viol.push(fmt + ' | ' + act + ' → ' + o.pb.join(' ; '));
  return o; }
const cur = async () => (await ev('dbgBqA().cur'));
const btnTxt = async () => (await ev("(function(){var b=document.getElementById('gBqBtn');return b.style.display==='none'?'(caché)':b.dataset.e+':'+b.textContent.trim().slice(0,22)})()"));
async function photo(nom) { await get('/shot?f=' + encodeURIComponent(SP + '/parcours/' + fmt + '_' + nom + '.jpg') + '&jpg=60'); }
async function ouvre() {
  await ev("__mGo('shop')"); await dormir(2000); await ev("__mGo('home')"); await dormir(2000);
  await tap('#mHome [data-m="garage"]'); await dormir(13000); await get('/tap?sel=%23gShopBas&fx=.82&fy=.84'); await dormir(13000); }
async function rayon(c) { await tap('#gBqCats [data-c="' + c + '"]'); await dormir(3500); return inv('rayon ' + c); }
async function fleche(sens, n, c) { for (let i = 0; i < n; i++) { const a = await cur(); await tap(sens > 0 ? '#gBqNx' : '#gBqPv'); await dormir(1500); const o = await inv('flèche ' + (sens > 0 ? '▶' : '◀') + ' #' + (i + 1) + ' (' + c + ')'); const b = await cur(); if (a === b && o && o.n > 1) viol.push(fmt + ' | flèche ' + (sens > 0 ? '▶' : '◀') + ' (' + c + ') : la sélection n\'a pas bougé (' + a + ')'); } }
(async () => {
  fs.mkdirSync(SP + '/parcours', { recursive: true });
  const f = FM[fmt]; await get('/size?w=' + f[0] + '&h=' + f[1] + '&mob=' + f[6]);
  await ev("(function(){var s=document.documentElement.style;s.setProperty('--ccT','" + f[2] + "px');s.setProperty('--ccB','" + f[3] + "px');s.setProperty('--ccL','" + f[4] + "px');s.setProperty('--ccR','" + f[5] + "px');dispatchEvent(new Event('resize'));return 1})()");
  const dedans = await ev("document.documentElement.classList.contains('bqIndus')&&!!document.querySelector('#gBq.pan')"); if (dedans !== true) await ouvre();
  if (process.env.PREP) { await ev(process.env.PREP); await dormir(2500); } await get('/errz'); await dormir(1500);
  const RAY = ray.length ? ray : ['voiture', 'achat', 'peinture', 'aile', 'trainee', 'figure'];
  for (const c of RAY) {
    await rayon(c); await photo(c + '_0');
    // 1. toucher la 1re carte visible puis une autre
    for (const idx of [0, 2]) {
      const pos = await ev("(function(){var r=document.querySelector('#gBqPan .bqRail'),rb=r.getBoundingClientRect(),L=[].slice.call(r.querySelectorAll('.bqK,.bcK,.pN')).filter(function(e){var b=e.getBoundingClientRect();return b.width>10&&b.right>rb.left+10&&b.left<rb.right-10&&b.bottom>rb.top&&b.top<rb.bottom});var e=L[" + idx + "]||L[L.length-1];if(!e)return null;var b=e.getBoundingClientRect();return [Math.round(Math.max(b.left,rb.left)+Math.min(b.width,rb.right-Math.max(b.left,rb.left))/2),Math.round(b.top+b.height/2),e.getAttribute('data-k')]})()");
      if (pos) { await tapxy(pos[0], pos[1]); await dormir(2200); const o = await inv('toucher la carte ' + pos[2] + ' (' + c + ')'); const k = await cur(); if (k !== pos[2] && !(c === 'figure')) viol.push(fmt + ' | toucher la carte ' + pos[2] + ' (' + c + ') : le plateau montre ' + k); }
    }
    await photo(c + '_1');
    // 2. les flèches, dans les deux sens
    await fleche(1, 3, c); await fleche(-1, 2, c);
    // 3. un glissé au doigt / à la souris
    if (fmt !== 'pc') { await get('/drag?x1=330&y1=' + (fmt === 'portrait' ? 600 : 250) + '&x2=90&y2=' + (fmt === 'portrait' ? 600 : 250) + '&ms=220'); await dormir(2500); await inv('glisser la bande (' + c + ')'); }
    // 4. le bouton d'état : agir seulement si achat / équiper / déséquiper (sinon seulement le lire)
    const bt = await btnTxt(); await inv('état du bouton ' + bt + ' (' + c + ')');
    if (/^(achat|equip|desequip|figeq):/.test(bt)) { await tap('#gBqBtn'); await dormir(4500); await inv('appui sur ' + bt + ' (' + c + ')'); await photo(c + '_2'); const bt2 = await btnTxt(); if (c === 'achat') { const ferme = await ev("(function(){var L=[].slice.call(document.querySelectorAll('button,div,span,a')).filter(function(e){return /^\\s*ANNULER\\s*$/.test(e.textContent)&&e.getBoundingClientRect().width>10});if(!L.length)return 'pas de fenêtre';L[L.length-1].click();return 'ANNULER cliqué'})()"); await dormir(1500); await inv('fenêtre d\'achat en euros : ' + ferme + ' (achat)'); } else if (bt2 === bt) viol.push(fmt + ' | appui sur le bouton ' + bt + ' (' + c + ') : l\'état n\'a pas changé'); }
    else if (/^(manque|defi|sec|vide):/.test(bt)) { await tap('#gBqBtn'); await dormir(1500); await inv('appui sur ' + bt + ' (' + c + ')'); }
  }
  // 5. figures : les trois hexagones
  if (RAY.includes('figure')) { await rayon('figure'); for (const s of [2, 1, 0]) { await tap('#bqFigSel .fsHex[data-k="' + s + '"]'); await dormir(2500); await inv('hexagone ' + s + ' (figures)'); } }
  // 6. le mode focus (couché)
  if (f[0] > f[1] * 1.2 && RAY.includes('voiture')) { await rayon('voiture'); await tapxy(Math.round(f[0] * .2), Math.round(f[1] * .65)); await dormir(1800); const a = await inv('toucher la caisse (focus)'); await fleche(1, 1, 'focus'); const pos = await ev("(function(){var b=document.getElementById('gBqPan').getBoundingClientRect();return [Math.round(b.left+b.width/2),Math.round(b.top+b.height/2)]})()"); await tapxy(pos[0], pos[1]); await dormir(1800); await inv('toucher le sélecteur rétréci'); const fk = await ev('dbgBqA().focus'); if (fk) viol.push(fmt + ' | le focus ne s\'est pas refermé'); await photo('focus'); }
  // 7. changer de format boutique ouverte
  for (const g of Object.keys(FM)) { if (g === fmt) continue; const h = FM[g]; await get('/size?w=' + h[0] + '&h=' + h[1] + '&mob=' + h[6]); await ev("(function(){var s=document.documentElement.style;s.setProperty('--ccT','" + h[2] + "px');s.setProperty('--ccB','" + h[3] + "px');s.setProperty('--ccL','" + h[4] + "px');s.setProperty('--ccR','" + h[5] + "px');dispatchEvent(new Event('resize'));return 1})()"); await dormir(3000); const rr = RAY[0]; await inv('rotation vers ' + g + ' (' + rr + ')'); }
  await get('/size?w=' + f[0] + '&h=' + f[1] + '&mob=' + f[6]);
  console.log('\n=== ' + fmt + ' : ' + nAct + ' contrôles, ' + viol.length + ' violation(s) ===\n' + viol.join('\n'));
})().catch(e => { console.error('ÉCHEC DU PARCOURS', e); process.exit(1); });
