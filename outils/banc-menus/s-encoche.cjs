/* (2026-11-14, qualité · menus) les menus hors boutique avec l'ENCOCHE simulée : --ccT/--ccB/--ccL/--ccR (les valeurs de html.telCadre, celles d'un
   iPhone à encoche), puis chaque écran : photo et relevé des textes et boutons qui passent sous l'encoche ou la barre d'accueil.
   ⚠ une règle qui lit env() directement au lieu de var(--sL) ne voit pas la simulation : relire chaque relevé sur la photo. */
module.exports = async function (b) {
  const { ev, tap, shot, dormir, W, H, log } = b;
  const couche = W > H;
  const I = couche ? { T: 0, B: 21, L: 47, R: 47 } : { T: 47, B: 34, L: 0, R: 0 };
  await ev(`(function(){const r=document.documentElement.style;r.setProperty('--ccT','${I.T}px');r.setProperty('--ccB','${I.B}px');r.setProperty('--ccL','${I.L}px');r.setProperty('--ccR','${I.R}px');return 1})()`);
  const releve = `(function(){const I=${JSON.stringify(I)},o=[];const vu=new Set();
    document.querySelectorAll('body *').forEach(function(e){if(e.closest('#garage canvas,#hud,#touchCtl,#pwrChip'))return;const r=e.getBoundingClientRect();if(r.width<2||r.height<2)return;
      const cs=getComputedStyle(e);if(cs.visibility==='hidden'||+cs.opacity<.05||cs.display==='none')return;
      let a=e;while(a&&a!==document.body){const c=getComputedStyle(a);if(+c.opacity<.05||c.visibility==='hidden')return;a=a.parentElement;}
      const txt=[].some.call(e.childNodes,function(n){return n.nodeType===3&&n.textContent.trim();});const bt=e.matches('button,[role=button],.pbtn,a');if(!txt&&!bt)return;
      if(r.bottom<0||r.top>innerHeight||r.right<0||r.left>innerWidth)return;
      const p=[];if(r.left<I.L-1)p.push('G'+Math.round(r.left));if(r.right>innerWidth-I.R+1)p.push('D'+Math.round(innerWidth-r.right));if(r.top<I.T-1)p.push('H'+Math.round(r.top));if(r.bottom>innerHeight-I.B+1)p.push('B'+Math.round(innerHeight-r.bottom));
      if(p.length){const k=(e.id?'#'+e.id:e.tagName.toLowerCase()+(e.className&&typeof e.className==='string'?'.'+e.className.trim().split(/\\s+/).slice(0,2).join('.'):''))+' «'+(e.textContent||'').trim().slice(0,24)+'»';if(!vu.has(k)){vu.add(k);o.push(k+' '+p.join(','));}}});return o.slice(0,40);})()`;
  const ecran = async (nom) => { await shot('encoche-' + nom); log(nom, JSON.stringify(await ev(releve))); };
  await ev("window.__mGo('home');1"); await dormir(1800); await ecran('accueil');
  await ev("window.__mGo('set');1"); await dormir(1500); await ecran('reglages');
  await ev("window.__mGo('shop');1"); await dormir(1800); await ecran('achat');
  await ev("window.__mGo('home');1"); await dormir(400); await tap('#mHome [data-m="garage"]'); await dormir(3500); await ecran('garage');
  log('boutons', JSON.stringify(await ev("['#gvCof','#gvMis','#gShopBas','#gHomeBas'].map(function(q){const e=document.querySelector(q);if(!e)return q+' absent';const s=e.querySelector('span')||e,r=e.getBoundingClientRect(),t=s.getBoundingClientRect(),cs=getComputedStyle(e);return q+' bouton '+Math.round(r.width)+' (pad '+cs.paddingLeft+'/'+cs.paddingRight+', bord '+cs.borderLeftWidth+') texte '+Math.round(t.width)+' '+getComputedStyle(s).fontSize+' «'+s.textContent.trim()+'» marge g '+Math.round(t.left-r.left)+' d '+Math.round(r.right-t.right)})")));
  await tap('#gvCof'); await dormir(2500); await ecran('inventaire');
  await tap('#gvCof'); await dormir(1500);
  await tap('#gvMis'); await dormir(2500); await ecran('missions');
  await tap('#gMis .gmHome'); await dormir(1500);
  await tap('#gProf'); await dormir(1500); await ecran('profil');
  await tap('#prof .pfChg'); await dormir(1500); await ecran('plaque');
  await tap('#plq .plRet'); await dormir(800); await tap('#prof .pfRet'); await dormir(1200);
  await ev("dbgSerie('ecran',3);1"); await dormir(2500); await ecran('serie');
};
