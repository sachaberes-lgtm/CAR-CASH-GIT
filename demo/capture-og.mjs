// Capture déterministe de l'écran d'accueil, via le protocole DevTools.
//
// DEUX raisons de ne pas utiliser `chrome --screenshot` :
//  · le plateau de l'atelier tourne SANS FIN, donc le budget de temps virtuel ne
//    s'épuise jamais et la capture ne part pas ;
//  · l'aperçu Open Graph veut du 1200×630, or à 630 px de haut les deux boutons du
//    bas sortent du cadre. On rend donc la page dans un cadre PLUS HAUT au même
//    rapport (1506×790), puis on réduit à l'échelle : tout tient, et le format est exact.
const [,, out, waitMs] = process.argv;
const OUT_W = 1200, OUT_H = 630;   // le format attendu par les aperçus Open Graph

const targets = await (await fetch('http://127.0.0.1:9222/json')).json();
const page = targets.find(t => t.type === 'page' && t.webSocketDebuggerUrl);
if (!page) { console.error('aucune cible page'); process.exit(1); }

const ws = new WebSocket(page.webSocketDebuggerUrl);
let id = 0; const pending = new Map();
const send = (method, params = {}) => new Promise(res => {
  pending.set(++id, res); ws.send(JSON.stringify({ id, method, params }));
});
ws.addEventListener('message', e => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); }
});
await new Promise(r => ws.addEventListener('open', r));

// ⚠ PAS de setDeviceMetricsOverride : il redimensionne le CADRE de capture sans
// relayouter la page — le rendu restait dans son coin, entouré de noir. On ouvre la
// fenêtre de Chrome au bon gabarit et on découpe dans ce qu'elle donne vraiment.
await new Promise(r => setTimeout(r, Number(waitMs || 26000)));   // l'intro « 1.61 » doit finir de se jouer

// La fenêtre demandée n'est PAS le viewport obtenu (Chrome garde quelques dizaines
// de pixels pour lui), et une fraction de bande noire en bas d'un aperçu Slack se
// voit tout de suite. On lit donc la taille RÉELLE, on y découpe le plus grand
// rectangle au bon format, centré, et on met à l'échelle. Le cadre est plein, toujours.
const { cssVisualViewport: vp } = await send('Page.getLayoutMetrics');
const AR = OUT_W / OUT_H;
let cw = vp.clientWidth, ch = cw / AR;
if (ch > vp.clientHeight) { ch = vp.clientHeight; cw = ch * AR; }
const shot = await send('Page.captureScreenshot', {
  format: 'png',
  clip: { x: (vp.clientWidth - cw) / 2, y: (vp.clientHeight - ch) / 2,
          width: cw, height: ch, scale: OUT_W / cw }
});
const fs = await import('node:fs');
fs.writeFileSync(out, Buffer.from(shot.data, 'base64'));
console.log('capture écrite :', out, '—', Math.round(fs.statSync(out).size / 1024), 'Ko');
ws.close();
