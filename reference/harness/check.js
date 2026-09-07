// CASH CAR — harnais de validation (T0).
// check.js <webroot>  : six contrôles (a-f), PASS/FAIL par ligne, exit 1 si échec.
// (a) démarre sans erreur console
// (b) aucune URL externe (index.html)
// (c) tous les mp3 dans le tableau CORE du service worker
// (d) prefers-reduced-motion coupe bloom / grain / FX
// (e) tout élément cliquable porte un label accessible
// (f) aucune clé i18n brute affichée (fr et en)

const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const webroot = process.argv[2];

function readFile(p) { try { return fs.readFileSync(path.join(webroot, p), 'utf8'); } catch (e) { return null; } }

const html = readFile('index.html') || '';
const sw = readFile('sw.js') || readFile('service-worker.js') || '';

// ---------- stockage des résultats (ordre fixe a..f) ----------
const OUT = { a: null, b: null, c: null, d: null, e: null, f: null };
function set(k, ok, detail) { OUT[k] = { ok, detail }; }

// ---------- serveur statique ----------
function serve(root) {
  return http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split('?')[0]);
    if (p === '/') p = '/index.html';
    const fp = path.join(root, p);
    if (!fp.startsWith(path.resolve(root))) { res.writeHead(403); res.end(); return; }
    fs.readFile(fp, (err, data) => {
      if (err) { res.writeHead(404); res.end('404'); return; }
      const types = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.mp3': 'audio/mpeg', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json', '.woff2': 'font/woff2' };
      res.writeHead(200, { 'Content-Type': types[path.extname(fp).toLowerCase()] || 'application/octet-stream' });
      res.end(data);
    });
  });
}

// ---------- (b) URLs externes ----------
function checkB() {
  const urls = (html.match(/https?:\/\/[^\s"'<>)]+/g) || []).filter(u => !/w3\.org/.test(u));
  set('b', urls.length === 0, urls.join(' , '));
}

// ---------- (c) mp3 dans CORE ----------
function checkC() {
  const mp3 = [];
  (function walk(d, rel) {
    let entries = [];
    try { entries = fs.readdirSync(d); } catch (e) { return; }
    for (const e of entries) {
      const fp = path.join(d, e), r = rel ? rel + '/' + e : e;
      let st; try { st = fs.statSync(fp); } catch (e) { continue; }
      if (st.isDirectory()) walk(fp, r);
      else if (e.toLowerCase().endsWith('.mp3')) mp3.push('./' + r);
    }
  })(path.join(webroot, 'assets'), 'assets');

  const coreMatch = sw.match(/CORE\s*=\s*\[([\s\S]*?)\]/);
  const core = coreMatch ? (coreMatch[1].match(/['"]\.\/[^'"]+\.mp3['"]/g) || []).map(s => s.replace(/['"]/g, '')) : [];
  const missing = mp3.filter(m => !core.includes(m));
  if (mp3.length === 0) set('c', false, 'aucun mp3 trouvé sous assets/');
  else set('c', missing.length === 0, missing.length ? ('absents de CORE : ' + missing.join(' , ')) : '');
}

// ---------- (d) reduce-motion : conditions statiques ----------
function reduceMotionStatic() {
  return {
    detect: /matchMedia\(['"]\(prefers-reduced-motion:\s*reduce\)['"]\)/.test(html),
    marker: /setAttribute\(['"]data-reduced-motion['"],\s*['"]1['"]\)/.test(html),
    bloom:  /if\s*\(\s*REDUCED_MOTION\s*\)\s*bloomPass\s*\.enabled\s*=\s*false/.test(html),
    scanCss:/data-reduced-motion=["']1["']\][^{}]*#scan\s*\{\s*display\s*:\s*none/.test(html),
    speed:  /if\s*\(\s*!\s*REDUCED_MOTION\s*\)\s*drawSpeedLines/.test(html) && /if\s*\(\s*!\s*REDUCED_MOTION\s*\)\s*speedFx\s*\.style\s*\.opacity/.test(html),
  };
}

// ---------- main ----------
(async () => {
  if (!html) { console.error('FAIL: index.html introuvable dans ' + webroot); process.exit(2); }

  checkB();
  checkC();

  const server = serve(webroot);
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const url = `http://127.0.0.1:${server.address().port}/`;

  // dicts i18n (optionnels)
  let frDict = null, enDict = null;
  const frRaw = readFile('assets/i18n/fr.json');
  const enRaw = readFile('assets/i18n/en.json');
  if (frRaw) { try { frDict = JSON.parse(frRaw); } catch (e) {} }
  if (enRaw) { try { enDict = JSON.parse(enRaw); } catch (e) {} }
  const passes = [{ locale: 'en-US', lang: 'en', dict: enDict }];
  if (frDict) passes.push({ locale: 'fr-FR', lang: 'fr', dict: frDict });

  const browser = await chromium.launch({ headless: true, args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader'] });

  const allErrors = [];
  const fAll = [];
  let dRuntime = { dataRm: null, scanDisplay: 'no-scan' };
  let eBad = [];

  for (let i = 0; i < passes.length; i++) {
    const pass = passes[i];
    const ctx = await browser.newContext({ locale: pass.locale, reducedMotion: 'reduce' });

    // (e) — capture des éléments avec écouteurs clic/pointeur/toucher
    await ctx.addInitScript(() => {
      const map = new Map();
      const orig = EventTarget.prototype.addEventListener;
      EventTarget.prototype.addEventListener = function (type, fn, opts) {
        if (['click', 'pointerdown', 'pointerup', 'mousedown', 'mouseup', 'touchstart', 'touchend', 'keydown', 'keyup'].indexOf(type) !== -1 && this instanceof Element) {
          if (!map.has(this)) map.set(this, { types: new Set(), sources: [] });
          const e = map.get(this); e.types.add(type);
          try { e.sources.push(Function.prototype.toString.call(fn)); } catch (_) {}
        }
        return orig.call(this, type, fn, opts);
      };
      window.__clickables = map;
    });

    const page = await ctx.newPage();
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push('console.error: ' + m.text()); });
    page.on('pageerror', e => errors.push('pageerror: ' + e.message));
    page.on('requestfailed', r => errors.push('requestfailed: ' + r.url() + ' ' + (r.failure() && r.failure().errorText)));
    page.on('response', r => { if (r.status() >= 400) errors.push('HTTP ' + r.status() + ': ' + r.url()); });

    await page.goto(url, { waitUntil: 'load', timeout: 30000 });
    await page.waitForTimeout(1000);
    await page.evaluate(() => { const sp = document.getElementById('splash'); if (sp) sp.click(); }).catch(() => {});
    await page.waitForTimeout(1500);

    allErrors.push(...errors);

    if (i === 0) {
      // (d) runtime
      dRuntime = await page.evaluate(() => ({
        dataRm: document.documentElement.getAttribute('data-reduced-motion'),
        scanDisplay: (function () { const el = document.getElementById('scan'); return el ? getComputedStyle(el).display : 'no-scan'; })(),
      }));

      // (e) éléments cliquables sans label
      eBad = await page.evaluate(() => {
        const INTERACTIVE = ['button', 'link', 'tab', 'menuitem', 'switch', 'checkbox', 'radio', 'slider', 'combobox', 'option', 'spinbutton', 'searchbox'];
        const NATIVE = new Set(['BUTTON', 'A']);
        const FORM = new Set(['INPUT', 'SELECT', 'TEXTAREA', 'OPTION']);
        function isOnlyStop(src) {
          const c = String(src)
            .replace(/function\s*\([^)]*\)\s*\{/g, '')
            .replace(/\}\s*$/g, '')
            .replace(/=>\s*\{/g, '')
            .replace(/\b(return|if|else|var|let|const)\b/g, '')
            .replace(/[\w$]*\.(stopPropagation|preventDefault|stopImmediatePropagation)\s*\([^)]*\)/g, '')
            .replace(/[^A-Za-z0-9$_]/g, '');
          return c.length <= 2;
        }
        function labelled(el) {
          const ariaLabel = (el.getAttribute('aria-label') || '').trim();
          const labelledby = (el.getAttribute('aria-labelledby') || '').trim();
          const alt = (el.getAttribute('alt') || '').trim();
          const title = (el.getAttribute('title') || '').trim();
          if (ariaLabel || labelledby || alt || title) return true;
          const tag = el.tagName;
          const hasRole = !!el.getAttribute('role');
          if (NATIVE.has(tag) || hasRole) {
            const text = (el.textContent || '').trim();
            const value = (el.getAttribute('value') || '').trim();
            return text.length > 0 || value.length > 0;
          }
          return false;
        }
        const out = [];
        // 1) contrôles natifs / rôles interactifs / focusables
        document.querySelectorAll('button, a[href], [tabindex], [role]').forEach(el => {
          const tag = el.tagName;
          if (FORM.has(tag)) return;
          const role = (el.getAttribute('role') || '').toLowerCase();
          const isInteractive = NATIVE.has(tag) || INTERACTIVE.indexOf(role) !== -1 || el.hasAttribute('tabindex');
          if (!isInteractive) return;
          if (!labelled(el)) out.push(el.id ? '#' + el.id : '<' + tag.toLowerCase() + '>');
        });
        // 2) éléments (div/span/…) porteurs d'un vrai écouteur clic/pointeur/toucher
        const map = window.__clickables || new Map();
        for (const [el, info] of map) {
          const tag = el.tagName;
          if (NATIVE.has(tag) || FORM.has(tag)) continue;
          if (el.hasAttribute('role') || el.hasAttribute('tabindex')) continue;
          const real = (info.sources || []).some(s => !isOnlyStop(s));
          if (!real) continue; // conteneur (stopPropagation simple) → hors périmètre
          if (!labelled(el)) out.push(el.id ? '#' + el.id : '<' + tag.toLowerCase() + '>');
        }
        return out;
      });
    }

    // (f) clés i18n brutes pour cette langue
    const fBad = await page.evaluate((dict) => {
      const out = [];
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const k = el.getAttribute('data-i18n');
        const v = (el.textContent || '').trim();
        const expect = (dict && dict[k] != null) ? dict[k] : null;
        if (v === '') out.push('vide: data-i18n=' + k);
        else if (expect != null && expect !== k && v === k) out.push('clé brute: data-i18n=' + k + ' -> "' + v + '"');
        else if (/\{\d+\}/.test(v)) out.push('template non résolu: data-i18n=' + k);
      });
      document.querySelectorAll('[data-i18n-aria]').forEach(el => {
        const k = el.getAttribute('data-i18n-aria');
        const v = (el.getAttribute('aria-label') || '').trim();
        const expect = (dict && dict[k] != null) ? dict[k] : null;
        if (v === '' || v.indexOf('__') === 0) out.push('aria non rempli: data-i18n-aria=' + k + ' -> "' + v + '"');
        else if (expect != null && expect !== k && v === k) out.push('clé brute aria: data-i18n-aria=' + k);
      });
      return out;
    }, pass.dict);
    fAll.push(...fBad.map(b => '[' + pass.lang + '] ' + b));

    await ctx.close();
  }

  await browser.close().catch(() => {});
  server.close();
  if (typeof server.closeAllConnections === 'function') server.closeAllConnections();

  // (a)
  set('a', allErrors.length === 0, allErrors.slice(0, 8).join(' | '));

  // (d)
  const s = reduceMotionStatic();
  const dDetail = [];
  if (!s.detect) dDetail.push('matchMedia absent');
  if (!s.marker) dDetail.push('data-reduced-motion absent');
  if (!s.bloom) dDetail.push('bloom non coupé');
  if (!s.scanCss) dDetail.push('grain (#scan) non coupé');
  if (!s.speed) dDetail.push('FX vitesse non coupés');
  if (dRuntime.dataRm !== '1') dDetail.push('runtime: data-reduced-motion=' + dRuntime.dataRm);
  if (dRuntime.scanDisplay !== 'none') dDetail.push('runtime: #scan display=' + dRuntime.scanDisplay);
  set('d', s.detect && s.marker && s.bloom && s.scanCss && s.speed && dRuntime.dataRm === '1' && dRuntime.scanDisplay === 'none', dDetail.join(' ; '));

  // (e)
  set('e', eBad.length === 0, eBad.slice(0, 12).join(' , ') + (eBad.length > 12 ? ' … (+' + (eBad.length - 12) + ')' : ''));

  // (f)
  set('f', fAll.length === 0, fAll.slice(0, 10).join(' , '));

  // ---- impression (ordre fixe) ----
  const labels = {
    a: '(a) démarre sans erreur console',
    b: '(b) aucune URL externe',
    c: '(c) tous les mp3 dans CORE',
    d: '(d) reduce-motion coupe bloom/grain/FX',
    e: '(e) tout cliquable a un label',
    f: '(f) aucune clé i18n brute (fr + en)',
  };
  let failed = 0;
  for (const k of ['a', 'b', 'c', 'd', 'e', 'f']) {
    const r = OUT[k];
    const ok = r && r.ok;
    if (!ok) failed++;
    console.log((ok ? 'PASS ' : 'FAIL ') + labels[k] + (r && r.detail ? '  — ' + r.detail : ''));
  }
  console.log('');
  console.log('Résultat : ' + (6 - failed) + '/6 OK' + (failed ? ' — ' + failed + ' échec(s)' : ' — tout passe'));
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(2); });
