/* LE BANC DU PRIX D'APPLE SUR LE NUANCIER DES PEINTURES (2026-11-07, achats App Store, passe finale C1) — le rayon PEINTURES de la boutique 3D est le rail
   par défaut : la loupe, l'étiquette lue (VoiceOver) et le prix de l'intertitre de chaque rareté doivent dire le prix qu'Apple facture, pas l'euro du jeu.
   Deux chargements : (1) AVEC un faux ccAchat dont produits() répond un prix distinct pour une peinture connue ; (2) SANS ccAchat : le repli (l'euro du jeu) inchangé.
   Servir le jeu : cd "VERSION PRINCIPALE" && python3 -m http.server 8931 --bind 127.0.0.1   puis   node outils/banc-achats/prix.mjs   env : PORT (défaut 8931)
   Sortie : « OK prix » (code 0) ou la liste des échecs (code 1). */
import { lance, prepare, charge, passeSplash, sleep } from '../banc-caisses/cdp.mjs';

const PORT = process.env.PORT || 8931;
const echecs = [];
const verifie = (ok, msg) => { if (!ok) echecs.push(msg); };
const c = await lance({ port: 9501 });
const APPLE = '7,77 €';
try {
  await prepare(c);
  await charge(c, `http://127.0.0.1:${PORT}/index.html?colonne=0&carte=nuages&meteo=midi`, { attente: 120000 });
  await passeSplash(c); await sleep(2500);
  const ev = (s) => c.ev(`(async function(){${s}})()`);

  /* une peinture à vendre dont l'état est « eur » (ni à toi, ni défi, ni mission) : la cible */
  const cible = await ev(`var P=window.dbgProduits().filter(function(p){return p.type==='peinture';});
    for(var i=0;i<P.length;i++){var id=P[i].id.split('.').pop(),e=window.dbgAchats.nuance(id);if(e&&e.c==='eur')return {id:id,prod:P[i].id,cle:P[i].cle,eur:P[i].eur,t:e.t};}
    return null;`);
  verifie(!!cible, 'aucune peinture vendable à l\'état « eur » trouvée');
  if (cible) {
    /* (2) SANS ccAchat : le repli — la loupe, l'étiquette et l'intertitre disent l'euro du jeu */
    const rep = await ev(`var e=window.dbgAchats.nuance('${cible.id}');var h=window.dbgAchats.nuancier();return {t:e.t,html:h};`);
    verifie(rep.t === cible.t && !rep.t.includes(APPLE), `sans ccAchat : la loupe devrait garder le repli : ${rep.t}`);
    verifie(!rep.html.includes(APPLE), 'sans ccAchat : le prix d\'Apple n\'a rien à faire dans le rayon');
    verifie(/class="pNpx">[^<]*€/.test(rep.html), `sans ccAchat : l'intertitre de rareté garde l'euro du jeu`);
    /* (1) AVEC le faux : Apple répond APPLE pour toutes les peintures de la rareté de la cible (l'hypothèse « un palier de prix par rareté »),
       l'euro du jeu reste pour les autres raretés */
    const mem = await ev(`var d=document.createElement('div');d.innerHTML=window.dbgAchats.nuancier();var s=d.querySelector('[data-k="peinture:${cible.id}"]').closest('section');
      return Array.prototype.map.call(s.querySelectorAll('.pN'),function(b){return 'cashcar.peinture.'+b.getAttribute('data-k').slice(9);});`);
    verifie(mem.length > 1 && mem.includes(cible.prod), `la rareté de la cible devrait avoir plusieurs peintures : ${JSON.stringify(mem)}`);
    await ev(`window.ccAchat={pret:true,produits:function(ids){var o={};${JSON.stringify(mem)}.forEach(function(i){o[i]={prix:'${APPLE}',devise:'EUR'};});return Promise.resolve(o);},
      payer:function(){return Promise.resolve('ok');},possedes:function(){return Promise.resolve([]);},restaurer:function(){return Promise.resolve([]);},onRecu:function(){}};`);
    const n = await ev(`return await window.dbgAchats.prix();`);
    verifie(n >= 1, `le faux ccAchat devrait mémoriser des prix : ${n}`);
    const ap = await ev(`var e=window.dbgAchats.nuance('${cible.id}');var h=window.dbgAchats.nuancier();
      var d=document.createElement('div');d.innerHTML=h;var b=d.querySelector('[data-k="peinture:${cible.id}"]');
      return {t:e.t,lib:b?b.getAttribute('aria-label'):null,px:Array.prototype.map.call(d.querySelectorAll('.pNpx'),function(x){return x.textContent;})};`);
    verifie(ap.t === APPLE, `avec ccAchat : la loupe (état « eur ») devrait dire ${APPLE} : ${ap.t}`);
    verifie(ap.lib && ap.lib.includes(APPLE), `avec ccAchat : l'étiquette lue devrait contenir ${APPLE} : ${ap.lib}`);
    verifie(ap.px.includes(APPLE), `avec ccAchat : l'intertitre de la rareté de la cible devrait dire ${APPLE} : ${JSON.stringify(ap.px)}`);
    verifie(ap.px.some(x => x !== APPLE), `avec ccAchat : les autres raretés gardent leur repli : ${JSON.stringify(ap.px)}`);
  }
  if (c.erreurs.length) verifie(false, 'ERREURS PAGE ' + JSON.stringify(c.erreurs.slice(0, 5)));
} catch (e) { echecs.push('exception : ' + e.message); }
finally { await c.fin(); }
if (echecs.length) { console.log('ECHEC prix'); for (const e of echecs) console.log(' - ' + e); process.exit(1); }
console.log('OK prix');
