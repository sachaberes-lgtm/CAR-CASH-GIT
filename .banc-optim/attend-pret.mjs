// Attend que le jeu de l'app soit prêt (après rechargement) ; note les temps de chargement.
const dort = (ms) => new Promise((r) => setTimeout(r, ms));
export default async function (c) {
  const t0 = Date.now();
  for (let i = 0; i < 240; i++) {
    const r = await c.js('JSON.stringify({p:!!window.__gameReady,n:(performance.getEntriesByType("navigation")[0]||{}).loadEventEnd||0,t:performance.now()})').then(JSON.parse).catch(() => null);
    if (r && r.p) { console.log('prêt', JSON.stringify(r)); return; }
    await dort(1000);
  }
  console.log('PAS PRÊT après', Date.now() - t0, 'ms');
}
