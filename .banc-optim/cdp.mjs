// Client CDP minimal vers l'app CASH CAR (pont pymobiledevice3 webinspector cdp --port 9881).
// node cdp.mjs <scénario.mjs> [args…]   ou   node cdp.mjs -e "<expression JS>"
const PORT = process.env.CDP_PORT || 9881;

export async function ouvre() {
  let cible;
  for (let i = 0; i < 30 && !cible; i++) {
    const l = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json().catch(() => []);
    cible = l.find((t) => /capacitor:\/\/localhost/.test(t.url) && t.webSocketDebuggerUrl);
    if (!cible) await new Promise((r) => setTimeout(r, 1000));
  }
  if (!cible) throw new Error("l'app CASH CAR n'est pas visible (verrouillée ? en arrière-plan ?)");
  const ws = new WebSocket(cible.webSocketDebuggerUrl);
  await new Promise((ok, ko) => { ws.onopen = ok; ws.onerror = ko; });
  let id = 0; const att = new Map(); const ecoute = new Map();
  ws.onmessage = (m) => {
    const j = JSON.parse(m.data);
    if (j.id && att.has(j.id)) { const { ok, ko } = att.get(j.id); att.delete(j.id); j.error ? ko(new Error(j.error.message)) : ok(j.result); }
    else if (j.method && ecoute.has(j.method)) for (const f of ecoute.get(j.method)) f(j.params);
  };
  const c = {
    cmd: (method, params = {}, ms = 120000) => new Promise((ok, ko) => {
      const n = ++id; att.set(n, { ok, ko }); ws.send(JSON.stringify({ id: n, method, params }));
      setTimeout(() => { if (att.has(n)) { att.delete(n); ko(new Error('délai dépassé : ' + method)); } }, ms);
    }),
    sur: (ev, f) => { if (!ecoute.has(ev)) ecoute.set(ev, []); ecoute.get(ev).push(f); },
    // évalue une expression (ou une fonction sans argument) et rend sa valeur ; promesses attendues
    js: async (e, ms) => {
      const expr = typeof e === 'function' ? `(${e})()` : e;
      const r = await c.cmd('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }, ms);
      if (r.exceptionDetails) throw new Error('JS : ' + (r.exceptionDetails.exception?.description || r.exceptionDetails.text));
      return r.result.value;
    },
    ferme: () => { try { ws.close(); } catch (e) {} },
  };
  return c;
}

if (process.argv[2]) {
  let c;
  try {
    c = await ouvre();
    if (process.argv[2] === '-e') console.log(JSON.stringify(await c.js(process.argv[3]), null, 1));
    else { const mod = await import(new URL(process.argv[2], 'file://' + process.cwd() + '/').href); await mod.default(c, process.argv.slice(3)); }
    c.ferme(); process.exit(0);
  } catch (e) { console.error('ERREUR', e.message); if (c) c.ferme(); process.exit(1); }
}
