/* (2026-11-14, qualité · menus, trouvaille 17) les textes de 6-7 px de la boutique : quels sont visibles, et à 8 px débordent-ils ?
   Pour chaque rayon : relevé à la taille d'origine, puis avec une feuille d'essai à 8 px (posée par le banc, retirée après), photos des deux. */
const SEL = ['#gBqPan .pNav button em', '#pNLoupe .pLt i', '#pNLoupe .pLe', '#pNLoupe .pLd', '#pNLoupe .pLj b', '.bqKdir b', '#bqAile .baDesc', '#bqFigSel .fsNom', '.bcK .bcN.n7'];
const ESSAI = SEL.map(s => 'html body ' + s + '{font-size:8px!important}').join('') + 'html body #bqAile .baDesc{line-height:10px!important;-webkit-line-clamp:2!important;min-height:20px!important;max-height:20px!important}';
module.exports = async function (b) {
  const { ev, tap, shot, dormir, log } = b;
  const mesure = `(function(){const S=${JSON.stringify(SEL)},o=[];S.forEach(function(s){document.querySelectorAll(s).forEach(function(e){const r=e.getBoundingClientRect();if(r.width<1||r.height<1)return;const cs=getComputedStyle(e);if(cs.visibility==='hidden'||+cs.opacity===0)return;
    const p=e.parentElement.getBoundingClientRect();const deb=e.scrollWidth>e.clientWidth+1||e.scrollHeight>e.clientHeight+1;const hors=r.right>p.right+1||r.left<p.left-1||r.right>innerWidth||r.left<0;
    o.push([s,cs.fontSize,(e.textContent||'').trim().slice(0,40),Math.round(r.width)+'x'+Math.round(r.height),deb?'DÉBORDE':'',hors?'HORS DU PARENT':''].join(' | '));});});return o;})()`;
  const essai = async (nom) => {
    const a = await ev(mesure); await shot(nom + '-orig');
    await ev(`(function(){const s=document.createElement('style');s.id='bancEssai8';s.textContent=${JSON.stringify(ESSAI)};document.head.appendChild(s);return 1})()`);
    await dormir(500);
    const e = await ev(mesure); await shot(nom + '-8px');
    await ev(`(function(){const s=document.getElementById('bancEssai8');if(s)s.remove();return 1})()`);
    log(nom, 'ORIGINE', JSON.stringify(a)); log(nom, 'À 8 PX', JSON.stringify(e));
  };
  await ev("window.__mGo('home');1"); await dormir(300);
  log('garage', await tap('#mHome [data-m="garage"]')); await dormir(3500);
  log('boutique', await tap('#gShopBas', .82, .84)); await dormir(4500);
  log('classes', await ev("document.documentElement.className+' / '+(document.getElementById('gBqPan')||{}).className"));
  await essai('voitures');
  for (const r of ['aile', 'peinture', 'trainee', 'figure']) {
    log(r, await tap(`#gBqCats [data-c="${r}"]`)); await dormir(1800);
    await essai(r);
    if (r === 'peinture') { log('pastille', await tap('#gBqPan .pN')); await dormir(1200); await essai('peinture-loupe'); }
  }
};
