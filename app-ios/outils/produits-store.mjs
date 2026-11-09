/* CASH CAR — LA LISTE DES PRODUITS APPLE (2026-11-07, achats intégrés App Store : « les achats en vrai argent, via StoreKit »).
   Lit le catalogue du jeu (window.dbgProduits(), code/economie/achats-store.js) dans le Chrome du Mac sans fenêtre et écrit :
     · app-ios/ios/App/Produits.storekit : la configuration StoreKit de TEST (Xcode ▶ avec le scheme App) — un produit NonConsumable
       par caisse en € et par peinture à prix ; prix = le prix en euros du jeu (point décimal), nom français du jeu.
       ⚠ Ce fichier n'est dans AUCUNE cible : il ne part jamais dans l'archive (il ne sert qu'au test dans Xcode).
     · app-ios/outils/produits.csv : id,nom,type,prix_eur — la liste à créer à la main dans App Store Connect (achats intégrés).
   Option --verifier : n'écrit rien, relit les deux fichiers et sort en 1 si un produit du jeu y manque ou si un produit des fichiers
   n'est plus dans le jeu (ou si un prix a bougé).
   Servir le jeu d'abord :  cd "VERSION PRINCIPALE" && python3 -m http.server 8931 --bind 127.0.0.1
   puis :  node app-ios/outils/produits-store.mjs [--verifier]      env : PORT (défaut 8931), CDP (port de Chrome, défaut 9501) */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { lance, prepare, charge, passeSplash, sleep } from '../../outils/banc-caisses/cdp.mjs';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const STOREKIT = path.join(ICI, '..', 'ios', 'App', 'Produits.storekit');
const CSV = path.join(ICI, 'produits.csv');
const PORT = process.env.PORT || 8931;
const CDP = +(process.env.CDP || 9501);
const VERIFIER = process.argv.includes('--verifier');

/* '4,20 €' → '4.20' ; '1 €' → '1.00' (StoreKit veut le point décimal) */
function prixPoint(eur) {
  const m = String(eur).replace(/\s/g, '').match(/^(\d+)(?:[,.](\d{1,2}))?€?$/);
  if (!m) throw new Error('prix illisible : ' + eur);
  return m[1] + '.' + (m[2] || '00').padEnd(2, '0');
}
/* des identifiants STABLES (même entrée ⇒ même sortie : le fichier ne bouge pas d'un tirage à l'autre) */
const empreinte = t => crypto.createHash('sha1').update(t).digest();
const hex8 = t => empreinte(t).toString('hex').slice(0, 8).toUpperCase();
const num10 = t => String(6000000000 + (empreinte(t).readUInt32BE(0) % 999999999));
const csvChamp = v => /[",\n]/.test(String(v)) ? '"' + String(v).replace(/"/g, '""') + '"' : String(v);

/* le catalogue du jeu : [{id, nom, type, prix}] */
async function litJeu() {
  const c = await lance({ port: CDP });
  try {
    await prepare(c);
    await charge(c, `http://127.0.0.1:${PORT}/index.html?colonne=0&carte=nuages&meteo=midi`, { attente: 180000 });
    await passeSplash(c); await sleep(1500);
    const r = await c.ev(`(function(){
      var P=window.dbgProduits(), V=window.dbgPeintures('voitures'), K=window.dbgPeintures(), nP={};
      K.forEach(function(p){nP[p.id]=p.n;});
      return P.map(function(p){return {id:p.id,type:p.type,eur:p.eur,
        nom:p.type==='car'?(V[p.cle]&&V[p.cle].n):nP[String(p.cle).slice(9)]};});
    })()`);
    if (!Array.isArray(r) || !r.length) throw new Error('dbgProduits() vide');
    for (const p of r) if (!p.nom) throw new Error('nom introuvable pour ' + p.id);
    return r.map(p => ({ id: p.id, nom: String(p.nom), type: p.type, prix: prixPoint(p.eur) }));
  } finally { await c.fin(); }
}

function storekit(L) {
  return {
    identifier: hex8('cashcar.storekit'),
    nonRenewingSubscriptions: [],
    products: L.map(p => ({
      displayPrice: p.prix,
      familyShareable: false,
      internalID: num10(p.id),
      localizations: [{
        description: p.type === 'car' ? `La caisse ${p.nom}, à toi pour toujours dans CASH CAR.` : `La peinture ${p.nom}, à toi pour toujours dans CASH CAR.`,
        displayName: p.nom,
        locale: 'fr_FR'
      }],
      productID: p.id,
      referenceName: (p.type === 'car' ? 'Caisse ' : 'Peinture ') + p.nom,
      type: 'NonConsumable'
    })),
    settings: {
      _applicationInternalID: num10('cashcar.app'),
      _askToBuyEnabled: false,
      _disableDialogs: false,
      _failTransactionsEnabled: false,
      _locale: 'fr_FR',
      _storefront: 'FRA',
      _storeKitErrors: [],
      _timeRate: 0
    },
    subscriptionGroups: [],
    version: { major: 4, minor: 0 }
  };
}
const csv = L => 'id,nom,type,prix_eur\n' + L.map(p => [p.id, p.nom, p.type, p.prix].map(csvChamp).join(',')).join('\n') + '\n';

/* relit les fichiers : [{id, prix}] de chacun (exception si un fichier manque ou est illisible) */
function litFichiers() {
  const sk = JSON.parse(fs.readFileSync(STOREKIT, 'utf8'));
  const deSk = (sk.products || []).map(p => ({ id: p.productID, prix: p.displayPrice, type: p.type }));
  const lignes = fs.readFileSync(CSV, 'utf8').split(/\r?\n/).filter(Boolean);
  if (lignes[0] !== 'id,nom,type,prix_eur') throw new Error('en-tête du CSV inattendu : ' + lignes[0]);
  const deCsv = lignes.slice(1).map(l => { const ch = l.split(','); return { id: ch[0], prix: ch[ch.length - 1] }; });
  return { deSk, deCsv };
}

const L = await litJeu();
const caisses = L.filter(p => p.type === 'car').length, peints = L.length - caisses;
if (!VERIFIER) {
  fs.writeFileSync(STOREKIT, JSON.stringify(storekit(L), null, 2) + '\n');
  fs.writeFileSync(CSV, csv(L));
  console.log(`écrit ${path.relative(process.cwd(), STOREKIT)} et ${path.relative(process.cwd(), CSV)}`);
}
const echecs = [];
let f;
try { f = litFichiers(); } catch (e) { echecs.push('fichiers illisibles : ' + e.message); }
if (f) {
  for (const [nom, liste] of [['Produits.storekit', f.deSk], ['produits.csv', f.deCsv]]) {
    const parId = new Map(liste.map(p => [p.id, p]));
    if (parId.size !== liste.length) echecs.push(`${nom} : ids en double`);
    for (const p of L) {
      const x = parId.get(p.id);
      if (!x) echecs.push(`${nom} : ${p.id} (produit du jeu) manque`);
      else if (x.prix !== p.prix) echecs.push(`${nom} : ${p.id} vaut ${x.prix} au lieu de ${p.prix}`);
    }
    const duJeu = new Set(L.map(p => p.id));
    for (const p of liste) if (!duJeu.has(p.id)) echecs.push(`${nom} : ${p.id} n'est plus un produit du jeu`);
  }
  for (const p of f.deSk) if (p.type !== 'NonConsumable') echecs.push(`Produits.storekit : ${p.id} n'est pas NonConsumable`);
}
if (echecs.length) { console.log('ECHEC produits-store'); for (const e of echecs) console.log(' - ' + e); process.exit(1); }
console.log(`OK ${caisses} caisses + ${peints} peintures`);
