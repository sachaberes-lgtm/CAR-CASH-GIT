/* LE BANC DU DRAPEAU ACHAT_EUR DANS L'APP (2026-11-07, achats App Store, tâche 4) — la boutique en € est allumée dans l'app SEULEMENT si le pont
   window.ccAchat existe (l'app avec le plugin StoreKit) ; sans pont (app sans plugin) ACHAT reste caché ; sur le web rien ne change.
   Trois chargements dans un même Chrome : (1) ?app=1 + FAUX ccAchat posé AVANT les scripts de la page (Page.addScriptToEvaluateOnNewDocument, actif
   seulement si l'adresse porte &faux=1) → pas de <style id="sansAchat">, la porte ACHAT de l'accueil est affichée ; (2) ?app=1 sans faux →
   <style id="sansAchat"> posé et la porte cachée ; (3) web (ni ?app=1 ni faux) → pas de sansAchat, la porte affichée.
   Servir le jeu : cd "VERSION PRINCIPALE" && python3 -m http.server 8931 --bind 127.0.0.1   puis   node outils/banc-achats/app.mjs   env : PORT (défaut 8931)
   Sortie : « OK app » (code 0) ou la liste des échecs (code 1). */
import { lance, prepare, charge, passeSplash, sleep } from '../banc-caisses/cdp.mjs';

const PORT = process.env.PORT || 8931;
const echecs = [];
const verifie = (ok, msg) => { if (!ok) echecs.push(msg); };
const c = await lance({ port: 9501 });
try {
  await prepare(c);
  await c.send('Page.addScriptToEvaluateOnNewDocument', { source:
    `if(/[?&]faux=1\\b/.test(location.search))window.ccAchat={pret:true,produits:function(){return Promise.resolve({});},payer:function(){return Promise.resolve('ok');},` +
    `possedes:function(){return Promise.resolve([]);},restaurer:function(){return Promise.resolve([]);},onRecu:function(){}};` });

  const sonde = async (nom, qs, attendu) => {
    await charge(c, `http://127.0.0.1:${PORT}/index.html?colonne=0&carte=nuages&meteo=midi${qs}`, { attente: 120000 });
    await passeSplash(c); await sleep(2500);
    const r = await c.ev(`(function(){var p=document.querySelector('[data-m="shop"]');
      return {pont:!!window.ccAchat,app:!!window.CC_EN_APP,style:!!document.getElementById('sansAchat'),
        porte:!!p,affichee:!!p&&getComputedStyle(p).display!=='none',mShop:!!document.getElementById('mShop')};})()`);
    console.log(nom, JSON.stringify(r));
    verifie(r.pont === attendu.pont, `${nom} : window.ccAchat devrait être ${attendu.pont} : ${r.pont}`);
    verifie(r.app === attendu.app, `${nom} : EN_APP devrait être ${attendu.app} : ${r.app}`);
    verifie(r.style === attendu.style, `${nom} : <style id="sansAchat"> devrait être ${attendu.style ? 'présent' : 'absent'} : ${r.style}`);
    verifie(r.porte, `${nom} : la porte ACHAT de l'accueil (data-m="shop") est introuvable`);
    verifie(r.affichee === !attendu.style, `${nom} : la porte ACHAT devrait être ${attendu.style ? 'cachée' : 'affichée'} : ${r.affichee}`);
    verifie(r.mShop, `${nom} : #mShop absent du DOM`);
  };

  await sonde('(1) app + pont', '&app=1&faux=1', { pont: true, app: true, style: false });
  await sonde('(2) app sans pont', '&app=1', { pont: false, app: true, style: true });
  await sonde('(3) web', '', { pont: false, app: false, style: false });
} catch (e) {
  echecs.push('exception : ' + (e && e.message || e));
} finally {
  await c.fin();
}
if (echecs.length) { console.error('✗ banc app :\n  ' + echecs.join('\n  ')); process.exit(1); }
console.log('OK app');
process.exit(0);
