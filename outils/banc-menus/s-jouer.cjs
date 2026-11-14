/* (2026-11-14, qualité · menus, trouvaille 13) un joueur NEUF (--save neuf) touche JOUER depuis la BOUTIQUE puis depuis l'INVENTAIRE :
   combien de millisecondes avant que le lâcher parte (GAR.go, lu par dbgHC().garGo) ? Avant : tout de suite ; après : 650 / 450 ms comme les autres. */
module.exports = async function (b) {
  const { ev, tap, shot, dormir, log } = b;
  const mesure = async (mode, ouvre) => {
    await ev("window.__mGo('home');1"); await dormir(400);
    log(mode, 'garage', await tap('#mHome [data-m="garage"]')); await dormir(3500);
    log(mode, 'ouvre', await ouvre()); await dormir(4000);
    log(mode, 'etat', JSON.stringify(await ev("({facile:(JSON.parse(localStorage.cashcarSave||'{}')).facile,tuto:(JSON.parse(localStorage.cashcarSave||'{}')).tuto,go:dbgHC().garGo,classes:document.getElementById('garage').className.slice(0,90)})")));
    await ev("window.__tGo=null;window.__t0=0;(function f(){if(window.__t0&&window.__tGo==null&&dbgHC().garGo)window.__tGo=performance.now()-window.__t0;if(window.__tGo==null)setTimeout(f,10);})();1");
    await ev("window.__t0=performance.now();1");
    log(mode, 'jouer', await tap('#gJouer'));
    await dormir(1500);
    log(mode, 'lâcher après (ms)', JSON.stringify(await ev('window.__tGo')));
    await shot('jouer-' + mode);
  };
  if (process.env.MODE === 'inventaire') await mesure('inventaire', () => tap('#gvCof'));
  else await mesure('boutique', () => tap('#gShopBas', .82, .84));
};
