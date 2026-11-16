/* (2026-11-14, qualité · menus) le garage : INVENTAIRE / MISSIONS dans leurs boutons (petits iPhone), photo du bas de l'écran */
module.exports = async function (b) {
  const { ev, tap, shot, dormir, log, W, H } = b;
  await ev("window.__mGo('home');1"); await dormir(400); await tap('#mHome [data-m="garage"]'); await dormir(3500);
  log('boutons', JSON.stringify(await ev("['#gvCof','#gvMis'].map(function(q){const e=document.querySelector(q);const s=e.querySelector('span'),r=e.getBoundingClientRect(),t=s.getBoundingClientRect();return q+' bouton '+Math.round(r.width)+' texte '+Math.round(t.width)+' '+getComputedStyle(s).fontSize+' «'+s.textContent.trim()+'» marge g '+Math.round(t.left-r.left)+' d '+Math.round(r.right-t.right)})")));
  const r = await ev("(function(){const r=document.getElementById('gAct').getBoundingClientRect();return [r.left,r.top,r.width,r.height]})()");
  await shot('garage-boutons', { x: Math.max(0, r[0] - 8), y: Math.max(0, r[1] - 8), width: Math.min(W, r[2] + 16), height: Math.min(H - r[1] + 8, r[3] + 16) });
};
