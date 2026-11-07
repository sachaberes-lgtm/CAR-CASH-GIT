/* LE BANC DE LA RESTAURATION PAR LES TABLES, DES PRIX QUI REVIENNENT ET DES CROCHETS DE L'APP (2026-11-07, achats App Store, passe finale I2 / M1 / M2) —
   (I2) un acheteur qui réinstalle doit retrouver ce qu'il a payé même si le jeu a changé depuis : une caisse RETIRÉE ou devenue non-premium, une
   peinture dont l'`eur` a disparu (devenue récompense de mission). Le banc FAUSSE les tables dans la page (crochet dbgAchats.tables, jamais dans le
   jeu), remet l'index du catalogue à zéro, et vérifie : l'objet est donné calmement UNE fois, la 2e fois rien ; un id inconnu est ignoré sans erreur.
   (M1) les prix d'Apple qui échouent au démarrage sont redemandés à l'ouverture de l'écran ACHAT ; ils ne redessinent l'écran ACHAT que s'il est là.
   (M2) dans l'app (?app=1) les crochets recoit / paye sont inertes et tables rend null.
   Servir le jeu : cd "VERSION PRINCIPALE" && python3 -m http.server 8931 --bind 127.0.0.1   puis   node outils/banc-achats/restaure.mjs   env : PORT (défaut 8931)
   Sortie : « OK restaure » (code 0) ou la liste des échecs (code 1). */
import { lance, prepare, charge, passeSplash, sleep } from '../banc-caisses/cdp.mjs';

const PORT = process.env.PORT || 8931;
const echecs = [];
const verifie = (ok, msg) => { if (!ok) echecs.push(msg); };
const c = await lance({ port: 9501 });
try {
  await prepare(c);
  await charge(c, `http://127.0.0.1:${PORT}/index.html?colonne=0&carte=nuages&meteo=midi`, { attente: 120000 });
  await passeSplash(c); await sleep(2500);
  const ev = (s) => c.ev(`(async function(){${s}})()`);

  /* ---- (I2) la restauration lit les TABLES, pas la liste à vendre ---- */
  const P = await c.ev(`window.dbgProduits()`);
  const caisse = P.filter(p => p.type === 'car').find(p => p.cle !== 54 && p.cle !== 10), peint = P.filter(p => p.type === 'peinture')[5];
  verifie(!!caisse && !!peint, 'catalogue : une caisse et une peinture introuvables');
  const r = await ev(`var T=window.dbgAchats.tables();var out={};
    var A=T.CAR_UNLOCK[${caisse.cle}];T.CAR_UNLOCK[${caisse.cle}]={p:99999999};  /* la caisse n'est plus premium : hors de la liste à vendre */
    var D=T.COSM.peinture.find(function(d){return d.id==='${peint.id.split('.').pop()}';});var eurD=D.eur;delete D.eur; /* la peinture est une récompense : plus d'eur */
    T.razIndex();
    var vente=window.dbgProduits().map(function(p){return p.id;});out.horsVente=vente.indexOf('${caisse.id}')<0&&vente.indexOf('${peint.id}')<0;
    var avant=window.dbgAchats.etat();
    out.a=window.dbgAchats.recoit('${caisse.id}',true);out.b=window.dbgAchats.recoit('${peint.id}',true);
    out.a2=window.dbgAchats.recoit('${caisse.id}',true);out.b2=window.dbgAchats.recoit('${peint.id}',true);
    out.inconnus=[window.dbgAchats.recoit('cashcar.car.nexistepas',true),window.dbgAchats.recoit('cashcar.peinture.nexistepas',true),window.dbgAchats.recoit('cashcar.autre.x',true),window.dbgAchats.recoit(null,true),window.dbgAchats.recoit(42,true)];
    var ap=window.dbgAchats.etat();out.caisse=ap.owned.indexOf(${caisse.cle})>=0&&avant.owned.indexOf(${caisse.cle})<0;out.peint=ap.own.indexOf('peinture:${peint.id.split('.').pop()}')>=0&&avant.own.indexOf('peinture:${peint.id.split('.').pop()}')<0;
    out.eq=ap.eq.peinture===avant.eq.peinture;out.fete=!!document.getElementById('feteCaisse');
    T.CAR_UNLOCK[${caisse.cle}]=A;D.eur=eurD;T.razIndex();return out;`);
  verifie(r.horsVente, 'les tables truquées devraient retirer les deux produits de la liste à vendre');
  verifie(r.a === true && r.b === true, `(I2) la caisse non-premium et la peinture sans eur devraient être données : ${JSON.stringify(r)}`);
  verifie(r.caisse && r.peint, `(I2) elles devraient être à toi dans la sauvegarde : ${JSON.stringify(r)}`);
  verifie(r.a2 === false && r.b2 === false, `(I2) la 2e fois : idempotent : ${JSON.stringify(r)}`);
  verifie(r.inconnus.every(x => x === false), `(I2) un id inconnu est ignoré : ${JSON.stringify(r.inconnus)}`);
  verifie(r.eq && !r.fete, `(I2) restauration calme : ni peinture équipée ni fête : ${JSON.stringify(r)}`);

  /* ---- (M1) les prix d'Apple : échec au démarrage, redemandés à l'ouverture de l'écran ACHAT ---- */
  const car54 = P.find(p => p.cle === 54), APPLE = '6,66 €';
  await ev(`var F=window.__fa={n:0,echec:true};window.ccAchat={pret:true,
    produits:function(ids){F.n++;if(F.echec)return Promise.reject(new Error('reseau'));var o={};ids.forEach(function(i){o[i]={prix:'${APPLE}',devise:'EUR'};});return Promise.resolve(o);},
    payer:function(){return Promise.resolve('ok');},possedes:function(){return Promise.resolve([]);},restaurer:function(){return Promise.resolve([]);},onRecu:function(){}};`);
  const n0 = await ev(`return await window.dbgAchats.prix();`);
  verifie(n0 === 0, `(M1) produits() qui rejette : 0 prix, sans exception : ${n0}`);
  /* hors de l'écran ACHAT (l'accueil) : les prix qui arrivent ne redessinent PAS l'écran ACHAT (un témoin posé dans la grille survit) */
  await ev(`window.__fa.echec=false;var g=document.getElementById('shGrille');g.innerHTML='<i id="temoinGrille"></i>';return 1;`);
  const hors = await ev(`var n=await window.dbgAchats.prix();return {n:n,temoin:!!document.getElementById('temoinGrille'),mShopOn:document.getElementById('mShop').classList.contains('on')};`);
  verifie(hors.n > 0 && !hors.mShopOn && hors.temoin, `(M1) prix reçus hors de l'écran ACHAT : pas de redessin : ${JSON.stringify(hors)}`);
  /* l'ouverture de l'écran ACHAT redemande tant que la mémoire est vide : on repart de zéro (page rechargée avec produits() en échec, puis réparé) */
  await charge(c, `http://127.0.0.1:${PORT}/index.html?colonne=0&carte=nuages&meteo=midi`, { attente: 120000 });
  await passeSplash(c); await sleep(2500);
  await ev(`var F=window.__fa={n:0,echec:true};window.ccAchat={pret:true,
    produits:function(ids){F.n++;if(F.echec)return Promise.reject(new Error('reseau'));var o={};ids.forEach(function(i){o[i]={prix:'${APPLE}',devise:'EUR'};});return Promise.resolve(o);},
    payer:function(){return Promise.resolve('ok');},possedes:function(){return Promise.resolve([]);},restaurer:function(){return Promise.resolve([]);},onRecu:function(){}};`);
  await ev(`await window.dbgAchats.prix();window.__fa.echec=false;window.__mGo('shop');await new Promise(function(r){setTimeout(r,1500);});return 1;`);
  const ouv = await ev(`return {n:window.__fa.n,on:document.getElementById('mShop').classList.contains('on'),txt:document.getElementById('shGrille').textContent,px:window.dbgAchats.prixTxt(54,'${car54.eur}')};`);
  verifie(ouv.on, '(M1) window.__mGo("shop") devrait ouvrir l\'écran ACHAT');
  verifie(ouv.n >= 2, `(M1) l'ouverture de l'écran ACHAT devrait redemander les prix : ${ouv.n} appel(s)`);
  verifie(ouv.px === APPLE, `(M1) le prix d'Apple devrait être mémorisé après l'ouverture : ${ouv.px}`);
  verifie(ouv.txt.includes(APPLE), `(M1) l'écran ACHAT devrait être redessiné avec ${APPLE} : ${ouv.txt.slice(0, 120)}`);

  /* ---- (M2) dans l'app, les crochets de cadeau sont inertes ---- */
  await charge(c, `http://127.0.0.1:${PORT}/index.html?colonne=0&carte=nuages&meteo=midi&app=1`, { attente: 120000 });
  await passeSplash(c); await sleep(2500);
  const app = await ev(`var o={app:!!window.CC_EN_APP,tables:window.dbgAchats.tables()};
    var avant=window.dbgAchats.etat().owned.length;o.rec=window.dbgAchats.recoit('${caisse.id}',true);o.apres=window.dbgAchats.etat().owned.length-avant;
    try{await window.dbgAchats.paye(${caisse.cle});o.paye='tenue';}catch(e){o.paye=e.message;}return o;`);
  verifie(app.app && app.tables === null, `(M2) EN_APP : tables doit rendre null : ${typeof app.tables}`);
  verifie(app.rec === false && app.apres === 0, `(M2) EN_APP : recoit doit être inerte : ${JSON.stringify(app)}`);
  verifie(app.paye === 'inerte', `(M2) EN_APP : paye doit être inerte : ${JSON.stringify(app)}`);

  if (c.erreurs.length) verifie(false, 'ERREURS PAGE ' + JSON.stringify(c.erreurs.slice(0, 5)));
} catch (e) { echecs.push('exception : ' + e.message); }
finally { await c.fin(); }
if (echecs.length) { console.log('ECHEC restaure'); for (const e of echecs) console.log(' - ' + e); process.exit(1); }
console.log('OK restaure');
