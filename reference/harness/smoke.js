// Smoke test: verify headless Chromium can run the game + WebGL, and report console output.
const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const webroot = process.argv[2];

function serve(root) {
  return http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split('?')[0]);
    if (p === '/') p = '/index.html';
    const fp = path.join(root, p);
    if (!fp.startsWith(path.resolve(root))) { res.writeHead(403); res.end(); return; }
    fs.readFile(fp, (err, data) => {
      if (err) { res.writeHead(404); res.end('404'); return; }
      const ext = path.extname(fp).toLowerCase();
      const types = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.mp3': 'audio/mpeg', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json', '.woff2': 'font/woff2', '.woff': 'font/woff' };
      res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
      res.end(data);
    });
  });
}

(async () => {
  const server = serve(webroot);
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const port = server.address().port;
  const url = `http://127.0.0.1:${port}/`;

  const browser = await chromium.launch({
    headless: true,
    args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader'],
  });
  const page = await browser.newPage({ viewport: { width: 900, height: 600 } });

  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push('console.error: ' + m.text()); });
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('requestfailed', r => errors.push('requestfailed: ' + r.url() + ' ' + (r.failure() && r.failure().errorText)));
  page.on('response', r => { if (r.status() >= 400) errors.push('HTTP ' + r.status() + ': ' + r.url()); });

  await page.goto(url, { waitUntil: 'load', timeout: 30000 });
  await page.waitForTimeout(2500);

  const webgl = await page.evaluate(() => {
    try {
      const c = document.createElement('canvas');
      const gl = c.getContext('webgl') || c.getContext('experimental-webgl');
      return gl ? 'webgl OK' : 'NO webgl';
    } catch (e) { return 'webgl EXC: ' + e.message; }
  });
  console.log('WEBGL:', webgl);

  // try to click splash to start
  const clicked = await page.evaluate(() => {
    const sp = document.getElementById('splash');
    if (sp) { sp.click(); return 'clicked splash'; }
    return 'no splash';
  });
  console.log('START:', clicked);
  await page.waitForTimeout(2500);

  const title = await page.title();
  console.log('TITLE:', title);

  console.log('ERRORS (' + errors.length + '):');
  for (const e of errors) console.log('  - ' + e);

  await browser.close();
  server.close();
  process.exit(0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
