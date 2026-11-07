/* LE BANC DU CATALOGUE DES ACHATS (2026-11-07, achats App Store) — les produits vendus en vrai argent : les caisses en € (CAR_UNLOCK k:'premium', hors lignes retirées : 10 depuis le retour du REQUIN)
   + les peintures à prix en €. Sortie : « OK produits » (code 0) ou la liste des échecs (code 1).
   Servir le jeu : cd "VERSION PRINCIPALE" && python3 -m http.server 8931 --bind 127.0.0.1   puis   node outils/banc-achats/produits.mjs   env : PORT (défaut 8931) */
import { lance, prepare, charge, passeSplash, sleep } from '../banc-caisses/cdp.mjs';

const PORT = process.env.PORT || 8931;
const echecs = [];
const verifie = (ok, msg) => { if (!ok) echecs.push(msg); };
const c = await lance({ port: 9501 });
try {
  await prepare(c);
  await charge(c, `http://127.0.0.1:${PORT}/index.html?colonne=0&carte=nuages&meteo=midi`, { attente: 120000 });
  await passeSplash(c); await sleep(2500);
  const r = await c.ev(`(function(){
    var P=window.dbgProduits(), pe=window.dbgPeintures();
    return {P:P, nPeint:pe.filter(function(p){return p.eur&&p.id!=='usine';}).length,
      ach:typeof window.dbgAchats, pd10:window.dbgAchats?window.dbgAchats.produitDe(10):'?', pd12:window.dbgAchats?window.dbgAchats.produitDe(12):'?',
      pd13:window.dbgAchats?window.dbgAchats.produitDe(13):'?', pd14:window.dbgAchats?window.dbgAchats.produitDe(14):'?',
      pdNon:window.dbgAchats?window.dbgAchats.produitDe(0):'?',
      pdPop:window.dbgAchats?window.dbgAchats.produitDe(P.length?P[0].cle:-1):'?'};
  })()`);
  const P = r.P, caisses = P.filter(p => p.type === 'car'), peints = P.filter(p => p.type === 'peinture');
  const ids = P.map(p => p.id);
  /* 9 caisses + LE REQUIN (index 10), remis en boutique par Léo le 07/11 (« le roquet a disparu », fiche et prix 9,99 €, 996e5534) : il n'est plus retiré */
  verifie(caisses.length === 10, `10 caisses attendues, ${caisses.length} : ${caisses.map(p => p.id + '#' + p.cle).join(', ')}`);
  verifie(caisses.some(p => p.id === 'cashcar.car.requin' && p.cle === 10), 'cashcar.car.requin (index 10, remis en boutique) absent');
  verifie(caisses.some(p => p.id === 'cashcar.car.poptart'), 'cashcar.car.poptart absent');
  verifie(caisses.some(p => p.id === 'cashcar.car.b_pizza'), 'cashcar.car.b_pizza absent');
  for (const i of [12, 13, 14]) verifie(!caisses.some(p => p.cle === i), `l'index retiré ${i} est un produit`);
  verifie(new Set(ids).size === ids.length, 'ids en double');
  for (const id of ids) verifie(/^cashcar\.(car|peinture)\.[A-Za-z0-9_]+$/.test(id), `id invalide : ${id}`);
  verifie(peints.length === r.nPeint && r.nPeint > 0, `peintures : ${peints.length} produits pour ${r.nPeint} peintures à prix`);
  verifie(!ids.some(id => /palette/i.test(id)) && !P.some(p => p.type === 'palette'), 'une entrée palette existe');
  verifie(!ids.includes('cashcar.peinture.usine'), 'la peinture usine est un produit');
  for (const p of P) verifie(typeof p.eur === 'string' && p.eur.length > 0, `eur manquant : ${p.id}`);
  for (const k of ['pd12', 'pd13', 'pd14']) verifie(r[k] === null, `produitDe(${k.slice(2)}) devrait rendre null : ${r[k]}`);
  verifie(r.pd10 === 'cashcar.car.requin', `produitDe(10) devrait rendre cashcar.car.requin : ${r.pd10}`);
  verifie(r.pdNon === null, 'produitDe(0) (une caisse du jeu, pas en vente) devrait rendre null');
  verifie(r.pdPop === P[0].id, 'produitDe(cle) ne rend pas l\'id du produit');
  console.log(`${caisses.length} caisses, ${peints.length} peintures`);
  if (c.erreurs.length) console.log('ERREURS PAGE', c.erreurs.slice(0, 5));
} catch (e) { echecs.push('exception : ' + e.message); }
finally { await c.fin(); }
if (echecs.length) { console.log('ECHEC produits'); for (const e of echecs) console.log(' - ' + e); process.exit(1); }
console.log('OK produits');
