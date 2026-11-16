/* (2026-11-15, qualité · menus froids) LE BANC DU LOT 3 — node outils/banc-menus/menus.cjs --scenario outils/banc-menus/s-menusfroids.cjs --out <dossier> --formats debout,couche
     --http 9891 --cdp 9892 --q "appareil=iPhone14,2"   (et --q "appareil=iPhone14,2&sans=couverte,veille" pour l'A/B)
   Par écran : couvert ou non (dbgCouverte), images dessinées par seconde (renderer.info.render.frame), animations CSS (dbgVeille), et deux photos animations figées :
   toile visible (-vis) et toutes les toiles hors de l'écran cachées (-cache). Identiques = la scène est bien couverte. Puis la veille (20 s sans geste) et le retour de MISSIONS. */
module.exports = async function (b) {
  const { ev, tap, shot, dormir, log, c, W, H } = b;
  const ab = /sans=/.test(await ev('location.search'));
  const etat = async () => ev("JSON.stringify({c:dbgCouverte(),v:(function(){const v=dbgVeille();delete v.elements;return v})()})");
  const cad = async (ms) => { const a = await ev('dbgCouverte().rendu.frame'); await dormir(ms); const z = await ev('dbgCouverte().rendu.frame'); return +((z - a) * 1000 / ms).toFixed(1); };
  const photos = async (nom, sel) => {
    await ev("(function(){const s=document.createElement('style');s.id='bancGel';s.textContent='*,*::before,*::after{animation-play-state:paused!important;caret-color:transparent!important}';document.head.appendChild(s);return 1})()");
    await dormir(400); await shot(nom + '-vis'); await dormir(400); await shot(nom + '-vis2'); /* vis contre vis2 : le bruit du banc (rien de la scène) */
    const n = await ev(`(function(){const e=${sel ? 'document.querySelector(' + JSON.stringify(sel) + ')' : 'null'};let n=0;document.querySelectorAll('canvas').forEach(function(k){if(e&&e.contains(k))return;const r=k.getBoundingClientRect();if(r.width*r.height<innerWidth*innerHeight*.9)return; /* la toile de la scène (plein écran) seulement */k.dataset.bancVis=k.style.visibility;k.style.visibility='hidden';n++;});return n})()`);
    await dormir(400); await shot(nom + '-cache');
    const dans = await ev(`(function(){const e=${sel ? 'document.querySelector(' + JSON.stringify(sel) + ')' : 'null'};const r=[];if(e)e.querySelectorAll('canvas').forEach(function(k){const b=k.getBoundingClientRect();if(b.width>0&&b.height>0)r.push((k.className||k.id||'canvas')+' '+Math.round(b.width)+'x'+Math.round(b.height));});return JSON.stringify(r)})()`);
    await ev("(function(){document.querySelectorAll('canvas').forEach(function(k){if(k.dataset.bancVis!==undefined){k.style.visibility=k.dataset.bancVis;delete k.dataset.bancVis;}});const s=document.getElementById('bancGel');if(s)s.remove();return 1})()");
    log('photos', nom, 'toiles cachées', n, 'toiles dans l\'écran', dans);
  };
  const ecran = async (nom, ouvre, sel, att) => {
    await ev(ouvre); await dormir(att || 1500);
    log('ECRAN', nom, await etat(), 'images/s', await cad(3000));
    if (!ab) await photos(nom, sel);
  };
  log('départ', await etat());
  await dormir(2000);
  await ecran('accueil', "window.__mGo('home');1", null, 2500);
  await ecran('reglages', "window.__mGo('set');1", '#overlay', 1500);
  /* la sortie : l'état se lève dans l'image même */
  log('sortie reglages', await ev("(function(){window.__mGo('home');return 1})()"), await ev("JSON.stringify(dbgCouverte())"));
  await dormir(80); log('sortie +80 ms', await ev("JSON.stringify(dbgCouverte())"));
  await dormir(1500);
  await ecran('modes', "window.__mGo('modes');1", '#overlay', 1500);
  await ecran('boutique-coque', "window.__mGo('shop');1", '#overlay', 1800);
  await ev("window.__mGo('home');1"); await dormir(2500);
  log('tap garage', await tap('#mHome [data-m="garage"]')); await dormir(4000);
  log('tap profil', await tap('#gProf')); await dormir(1500);
  await ecran('profil', '1', '#prof', 100);
  log('tap plaque', await tap('#prof .pfChg')); await dormir(1500);
  await ecran('plaque', '1', '#plq', 100);
  log('tap plaque retour', await tap('#plq .plRet')); await dormir(1200);
  log('tap profil retour', await tap('#prof .pfRet')); await dormir(1500);
  log('après profil', await etat());
  await ecran('serie', "dbgSerie('ecran',3);1", '#serieW', 2600);
  log('tap serie', await tap('#serieW .swBt')); await dormir(1500);
  log('après série', await etat());
  await ecran('confidentialite', "confOuvre();1", '#confFen', 900);
  await ev("(function(){const f=document.getElementById('confFen');if(f)f.remove();return 1})()"); await dormir(1500);
  /* LA VEILLE : rien ne touche pendant 23 s */
  await dormir(3000); log('veille à 3 s', await etat());
  await dormir(20500); log('veille à 23 s', await etat(), 'elements', await ev("JSON.stringify(dbgVeille().elements)"));
  if (!ab) await shot('veille-23s');
  await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: Math.round(W * .5), y: Math.round(H * .5) }] });
  log('au toucher', await ev("JSON.stringify(dbgVeille().on)"));
  await dormir(60); await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await dormir(300); log('après toucher', await etat());
  /* MISSIONS : aller, retour, le bouton se voit ; puis une veille au garage et encore un aller-retour */
  const mis = async (k) => { log(k, 'tap missions', await tap('#gvMis')); await dormir(2500); log(k, 'missions', await etat());
    log(k, 'tap home', await tap('#gMis .gmHome')); await dormir(1800);
    log(k, 'bouton MISSIONS', await ev("(function(){const e=document.getElementById('gvMis');if(!e)return 'absent';let o=1;for(let x=e;x;x=x.parentElement)o*=+getComputedStyle(x).opacity;const r=e.getBoundingClientRect();return JSON.stringify({opacite:+o.toFixed(3),vis:getComputedStyle(e).visibility,r:[Math.round(r.left),Math.round(r.top),Math.round(r.width),Math.round(r.height)],anims:e.getAnimations().map(function(a){return a.animationName+':'+a.playState})})})()"));
    if (!ab) await shot(k + '-retour-missions'); };
  await mis('missions1');
  await dormir(22000); log('veille garage 22 s', await etat());
  await mis('missions2');
  log('erreurs', await ev("JSON.stringify((window.dbgErreurs&&dbgErreurs())||null).slice(0,600)"));
};
