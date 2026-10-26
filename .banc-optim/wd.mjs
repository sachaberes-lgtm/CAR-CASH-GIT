// Pilote WebDriver minimal de Safari sur l'iPhone (safaridriver), sans dépendance.
// node wd.mjs <scénario.mjs>  — le scénario exporte default async function(w){...}
const PORT = process.env.WD_PORT || 47231;
const UDID = process.env.WD_UDID || '00008110-000621041468401E';
const B = `http://127.0.0.1:${PORT}`;

async function req(meth, path, body, ms = 120000) {
  const ac = new AbortController(); const t = setTimeout(() => ac.abort(), ms);
  try {
    const r = await fetch(B + path, { method: meth, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined, signal: ac.signal });
    const j = await r.json().catch(() => ({}));
    if (j && j.value && j.value.error) throw new Error(j.value.error + ': ' + j.value.message);
    return j.value;
  } finally { clearTimeout(t); }
}

export async function ouvre() {
  const v = await req('POST', '/session', { capabilities: { alwaysMatch: { platformName: 'iOS', browserName: 'Safari', 'safari:deviceUDID': UDID } } });
  const id = v.sessionId; const S = '/session/' + id;
  const w = {
    id,
    va: (url) => req('POST', S + '/url', { url }, 180000),
    url: () => req('GET', S + '/url'),
    js: (f, ...args) => req('POST', S + '/execute/sync', { script: typeof f === 'function' ? `return (${f}).apply(null, arguments)` : f, args }),
    // f(…args, fini) : appelle fini(valeur) quand c'est prêt
    jsa: (f, ms, ...args) => req('POST', S + '/execute/async', { script: `var fini=arguments[arguments.length-1];(${f}).apply(null,[].slice.call(arguments,0,-1).concat([fini]))`, args }, (ms || 60000) + 15000),
    delais: (script) => req('POST', S + '/timeouts', { script, pageLoad: 180000 }),
    photo: async (fichier) => { const b64 = await req('GET', S + '/screenshot'); if (fichier) (await import('node:fs')).writeFileSync(fichier, Buffer.from(b64, 'base64')); return b64; },
    // toucher (vrai geste) au point x,y en pixels CSS du viewport
    touche: (x, y, ms = 60) => req('POST', S + '/actions', { actions: [{ type: 'pointer', id: 'doigt', parameters: { pointerType: 'touch' }, actions: [
      { type: 'pointerMove', duration: 0, x: Math.round(x), y: Math.round(y), origin: 'viewport' }, { type: 'pointerDown', button: 0 }, { type: 'pause', duration: ms }, { type: 'pointerUp', button: 0 }] }] }),
    tiens: (x, y, ms) => req('POST', S + '/actions', { actions: [{ type: 'pointer', id: 'doigt', parameters: { pointerType: 'touch' }, actions: [
      { type: 'pointerMove', duration: 0, x: Math.round(x), y: Math.round(y), origin: 'viewport' }, { type: 'pointerDown', button: 0 }, { type: 'pause', duration: ms }, { type: 'pointerUp', button: 0 }] }] }, ms + 60000),
    ferme: () => req('DELETE', S).catch(() => {}),
  };
  await w.delais(120000).catch(() => {});
  return w;
}

if (process.argv[2]) {
  const mod = await import(new URL(process.argv[2], 'file://' + process.cwd() + '/').href);
  let w;
  const fin = async (c) => { if (w) await w.ferme(); process.exit(c); };
  process.on('SIGINT', () => fin(130));
  try { w = await ouvre(); console.log('session', w.id); await mod.default(w, process.argv.slice(3)); await fin(0); }
  catch (e) { console.error('ERREUR', e.message); await fin(1); }
}
