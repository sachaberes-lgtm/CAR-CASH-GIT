/* LE BANC DU CATALOGUE DES ACHATS (2026-11-07, achats App Store) — les produits vendus en vrai argent : les caisses en € (CAR_UNLOCK k:'premium', hors lignes retirées ; le nombre n'est PAS figé : main change la liste de vente souvent, le banc contrôle des invariants)
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
  /* (2026-11-09) le NOMBRE de caisses n'est plus figé (main l'a changé : le REQUIN repart, la MX-5 arrive) : au moins une caisse, chacune avec sa shape */
  verifie(caisses.length > 0, `aucune caisse en vente : ${P.length} produits`);
  for (const p of caisses) verifie(Number.isInteger(p.cle) && p.id === 'cashcar.car.' + p.id.slice('cashcar.car.'.length) && p.id.length > 'cashcar.car.'.length, `caisse mal formée : ${p.id}#${p.cle}`);
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
  verifie(caisses.some(p => p.cle === 10) ? r.pd10 === 'cashcar.car.requin' : r.pd10 === null, `produitDe(10) incohérent avec le catalogue : ${r.pd10}`);
  verifie(r.pdNon === null, 'produitDe(0) (une caisse du jeu, pas en vente) devrait rendre null');
  verifie(r.pdPop === P[0].id, 'produitDe(cle) ne rend pas l\'id du produit');
  console.log(`${caisses.length} caisses, ${peints.length} peintures`);
  if (c.erreurs.length) console.log('ERREURS PAGE', c.erreurs.slice(0, 5));
} catch (e) { echecs.push('exception : ' + e.message); }
finally { await c.fin(); }
if (echecs.length) { console.log('ECHEC produits'); for (const e of echecs) console.log(' - ' + e); process.exit(1); }
console.log('OK produits');
