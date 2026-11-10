/* LE BANC ADVERSAIRE DES ACHATS EN € (2026-11-10, Sacha : « joue l'adversaire sur le chemin d'un achat en € »).
   Le VRAI jeu tel que l'app l'embarque (preparer-www), le VRAI pont achats.js, et un FAUX StoreKit (storekit-faux.js : le plugin Swift porté
   ligne à ligne, Apple et NSUserDefaults simulés). Chaque cas rejoue un coup tordu et répond à trois questions :
     PAYÉ SANS RECEVOIR · REÇU SANS PAYER · ACHAT PERDU.
   Lancer :  node outils/banc-achats/adversaire.cjs            (tout ; ~6 min, un Chrome sans fenêtre et muet)
             node outils/banc-achats/adversaire.cjs --cas reussi,tuee   · --www <dossier déjà fabriqué> · --profil <profil Chrome chaud>
   Sortie : une ligne par constat, « OK adversaire » (code 0) ou la liste des défauts (code 1). Un TROU CONNU (choix écrit dans
   passation/ACHATS-APP-STORE.md) est affiché sans faire échouer. ⚠ Le faux StoreKit est un MODÈLE : ce que seul un vrai achat prouve
   est listé dans passation/ACHATS-APP-STORE.md, section g. */
'use strict';
const fs = require('fs'), path = require('path'), os = require('os');
const { fabrique, ouvre, dormir, RACINE } = require('./pilote.cjs');
const arg = (n) => { const i = process.argv.indexOf('--' + n); return i >= 0 ? process.argv[i + 1] : null; };
const SEULS = arg('cas') ? arg('cas').split(',') : null;

const defauts = [], lignes = [];
let casEnCours = '';
const dit = (s) => { lignes.push(s); console.log(s); };
const doit = (ok, msg) => { dit((ok ? '  ok      ' : '  DÉFAUT  ') + msg); if (!ok) defauts.push(casEnCours + ' : ' + msg); return ok; };
const trou = (present, msg) => dit((present ? '  TROU CONNU  ' : '  fermé   ') + msg);
const info = (msg) => dit('  ·       ' + msg);
const tient = (a) => a.vif && a.disque && a.miroir;
const code = (o) => Buffer.from(unescape(encodeURIComponent(JSON.stringify(o))), 'binary').toString('base64');

(async () => {
  const www = arg('www') || fabrique(path.join(os.tmpdir(), 'banc-achats-www'));
  const J = await ouvre({ dossier: www, profil: arg('profil') });
  const neuf = async (save) => { await J.vide(); await J.ev(`localStorage.clear();sessionStorage.clear();return 1;`); await J.seme(save); await J.lance(); };
  const sk = (s) => J.sk(s), etat = () => J.sk('etat()');
  const bouton = () => J.ev(`var b=document.querySelector('#shPop [data-sp="oui"]');return b?{cls:b.className,txt:b.textContent}:null;`);
  let CAISSES, PEINTS, A, B, P, P2;
  const CAS = {};

  CAS.reussi = async () => {
    await neuf();
    await J.acheteCaisse(A.cle);
    let a = await J.a(A.cle), e = await etat();
    doit(tient(a), 'la caisse payée est là tout de suite : mémoire, disque, miroir');
    doit(e.debits === 1 && e.tx[0].finie, 'un seul débit, transaction terminée chez Apple');
    await J.achetePeinture(P.nom);
    a = await J.a(P.cle);
    doit(tient(a) && (await J.vif()).eq.peinture === P.nom, 'la peinture payée est là et portée');
    await J.tue();
    doit(tient(await J.a(A.cle)) && tient(await J.a(P.cle)), 'app tuée puis rouverte : les deux achats sont toujours là');
    doit((await etat()).debits === 2, 'deux débits pour deux objets, pas un de plus');
  };

  CAS.annule = async () => {
    await neuf(); await sk(`regle({feuille:'annule'})`);
    await J.acheteCaisse(A.cle);
    doit(!(await J.a(A.cle)).vif && (await etat()).debits === 0, 'feuille fermée : rien donné, rien débité');
    const b = await bouton();
    doit(b && !/\boff\b/.test(b.cls), 'le bouton ACHETER est de nouveau utilisable');
    await sk(`regle({feuille:'ok'})`); await J.touche('#shPop [data-sp="oui"]'); await dormir(450);
    doit(tient(await J.a(A.cle)) && (await etat()).debits === 1, 'second essai validé : donné, un débit');
    await sk(`regle({feuille:'annule'})`); await J.achetePeinture(P.nom);
    doit(!(await J.a(P.cle)).vif, 'peinture annulée : rien donné');
    await sk(`regle({feuille:'ok'})`); await J.achetePeinture(P.nom);
    doit(tient(await J.a(P.cle)), 'peinture rachetée après une annulation : donnée');
  };

  CAS.attente = async () => {
    await neuf(); await sk(`regle({feuille:'attente'})`);
    await J.acheteCaisse(A.cle);
    doit(!(await J.a(A.cle)).vif && (await etat()).debits === 0, 'demande d\'achat en attente : rien donné, rien débité');
    doit(/ATTENTE|WAITING/i.test(await J.toast()), 'le jeu dit EN ATTENTE D\'ACCORD');
    await sk(`approuve(${JSON.stringify(A.id)})`); await dormir(400);
    doit(tient(await J.a(A.cle)) && (await etat()).debits === 1, 'accord donné, app ouverte : la caisse arrive');
    await neuf(); await sk(`regle({feuille:'attente'})`);
    await J.acheteCaisse(B.cle); await sk(`approuveFerme(${JSON.stringify(B.id)})`); await J.tue();
    doit(tient(await J.a(B.cle)), 'accord donné app FERMÉE : la caisse arrive au lancement suivant');
    doit((await etat()).tx.every(t => t.finie), 'et la transaction est terminée');
    await neuf(); await sk(`regle({feuille:'attente'})`);
    await J.acheteCaisse(A.cle); await sk(`refuse(${JSON.stringify(A.id)})`); await J.tue();
    doit(!(await J.a(A.cle)).vif && (await etat()).debits === 0, 'demande refusée : rien donné, rien débité');
  };

  CAS.reseau = async () => {
    await neuf(); await sk(`regle({reseau:false})`);
    await J.acheteCaisse(A.cle);
    doit(!(await J.a(A.cle)).vif && (await etat()).debits === 0, 'réseau coupé avant le débit : rien donné, rien débité');
    let b = await bouton();
    doit(b && !/\boff\b/.test(b.cls), 'l\'échec se retente (bouton utilisable)');
    await sk(`regle({reseau:true})`); await J.touche('#shPop [data-sp="oui"]'); await dormir(450);
    doit(tient(await J.a(A.cle)) && (await etat()).debits === 1, 'réseau revenu, second appui : donné, un débit');
    b = await bouton(); info('après le succès le bouton dit « ' + (b ? b.txt.trim() : '(fenêtre fermée)') + ' »');

    await neuf(); await sk(`regle({feuille:'coupe'})`);
    await J.acheteCaisse(A.cle);
    const a0 = await J.a(A.cle);
    info('débité puis réponse perdue : tout de suite ' + (a0.vif ? 'DONNÉ' : 'pas encore donné (attendu : StoreKit rend la transaction plus tard)'));
    await sk(`reseauRevient()`); await dormir(400);
    doit(tient(await J.a(A.cle)), 'débité, réponse perdue, réseau revenu : la caisse arrive sans relancer');
    doit((await etat()).debits === 1, 'un seul débit');

    await neuf(); await sk(`regle({feuille:'coupe'})`);
    await J.acheteCaisse(A.cle); await J.tue();
    doit(tient(await J.a(A.cle)), 'débité, réponse perdue, app relancée : la caisse arrive au lancement');

    await neuf(); await sk(`regle({feuille:'coupe'})`);
    await J.acheteCaisse(A.cle); await sk(`regle({feuille:'ok'})`); await J.touche('#shPop [data-sp="oui"]'); await dormir(500);
    doit(tient(await J.a(A.cle)) && (await etat()).debits === 1, 'débité, réponse perdue, le joueur rappuie : donné SANS second débit');
  };

  CAS.double = async () => {
    await neuf(); await sk(`regle({feuille:'pend'})`);
    await J.acheteCaisse(A.cle, { attendre: false });
    await J.touche('#shPop [data-sp="oui"]'); await J.touche('#shPop [data-sp="oui"]'); await J.achetePeinture(P.nom, { attendre: false }); await dormir(300);
    let e = await etat();
    doit(e.journal.filter(l => /^acheter /.test(l)).length === 1, 'trois appuis + une peinture pendant la feuille : UN seul achat est parti chez Apple');
    await sk(`valide('ok')`); await dormir(450);
    doit(tient(await J.a(A.cle)) && !(await J.a(P.cle)).vif && (await etat()).debits === 1, 'la caisse donnée, un débit, la peinture pas achetée par ricochet');
    await sk(`regle({feuille:'ok'})`); await J.achetePeinture(P.nom);
    doit(tient(await J.a(P.cle)), 'ensuite la peinture s\'achète normalement (aucun verrou resté posé)');

    await neuf(); await sk(`pose(${JSON.stringify([A.id, P.id])})`); await sk(`oublie()`); await J.tue();
    const r = await J.ev(`var a=window.dbgAchats.restaure(),b=window.dbgAchats.restaure();return await Promise.all([a,b]);`);
    const t = await J.toast(); e = await etat();
    doit(!/AUCUN|NOTHING/i.test(t), 'double appui sur RESTAURER : le dernier message ne dit pas « AUCUN ACHAT » (lu : « ' + t.trim() + ' »)');
    doit(e.nRestaurer === 1, 'double appui sur RESTAURER : une seule demande à Apple (' + e.nRestaurer + ')');
    doit(tient(await J.a(A.cle)) && tient(await J.a(P.cle)), 'et les achats sont rendus (' + JSON.stringify(r) + ')');
  };

  CAS.tuee = async () => {
    await neuf(); await sk(`regle({feuille:'pend'})`);
    await J.acheteCaisse(A.cle, { attendre: false }); await dormir(200); await J.tue();
    doit(!(await J.a(A.cle)).vif && (await etat()).debits === 0, 'tuée pendant la feuille, avant le débit : rien donné, rien débité');
    await sk(`regle({feuille:'ok'})`); await J.acheteCaisse(A.cle);
    doit(tient(await J.a(A.cle)), 'et l\'achat repart ensuite (aucun verrou resté posé)');

    await neuf(); await sk(`regle({feuille:'pend'})`);
    await J.acheteCaisse(A.cle, { attendre: false }); await dormir(200); await sk(`debiteSeul(${JSON.stringify(A.id)})`); await J.tue();
    doit(tient(await J.a(A.cle)), 'tuée APRÈS le débit, avant la réponse : la caisse arrive au lancement suivant');

    await neuf(); await sk(`regle({tueAvantFinish:true})`);
    await J.acheteCaisse(A.cle);
    doit(tient(await J.a(A.cle)), 'tuée après le « ok », avant finish : la caisse était déjà écrite');
    await sk(`regle({tueAvantFinish:false})`); J.erreurs.length = 0; await J.tue();
    let e = await etat();
    doit(tient(await J.a(A.cle)) && e.tx.every(t => t.finie) && e.debits === 1, 'au lancement suivant : rejouée sans doublon, terminée, un débit');

    await neuf(); await sk(`regle({feuille:'pend'})`);
    await J.acheteCaisse(A.cle, { attendre: false }); await dormir(200); await J.recharge();
    doit((await sk('feuille()')) === A.id, '(mise en scène) la WebView a rechargé sous la feuille d\'achat, le plugin natif vit encore');
    await sk(`valide('ok')`); await dormir(300);
    e = await etat();
    info('débité : ' + e.debits + ' · réponse : ' + (e.journal.filter(l => /page morte/.test(l))[0] || '?'));
    const a1 = await J.a(A.cle);
    info('juste après : ' + (a1.vif ? 'donné' : 'PAYÉ, PAS DONNÉ (la réponse est partie dans la page morte)'));
    await J.ev(`document.dispatchEvent(new Event('visibilitychange'));await new Promise(r=>setTimeout(r,400));return 1;`);
    const a2 = await J.a(A.cle);
    doit(tient(a2), 'WebView rechargée sous la feuille : la caisse arrive dans la même session (retour au premier plan), sans relancer l\'app');
    if (!a2.vif) { await J.ev(`var e=document.querySelector('[data-m="shop"],[data-m="offres"],[data-m="achat"]');if(e)e.click();await new Promise(r=>setTimeout(r,500));return 1;`); }
    await J.tue();
    doit(tient(await J.a(A.cle)), 'et au pire au lancement suivant');
  };

  CAS.neuf = async () => {
    await neuf(); await J.acheteCaisse(A.cle); await J.achetePeinture(P.nom);
    await J.telephoneNeuf(); await J.seme(); await J.lance();
    info('téléphone neuf, avant RESTAURER : ' + ((await J.a(A.cle)).vif ? 'déjà rendu' : 'rien (StoreKit ne sait rien avant la synchronisation)'));
    await sk(`regle({reseau:false})`);
    let n = await J.restaure();
    doit(n === -1 && /IMPOSSIBLE|FAILED/i.test(await J.toast()), 'RESTAURER hors ligne : dit l\'échec, pas « aucun achat »');
    await sk(`regle({reseau:true})`);
    n = await J.restaure();
    doit(n === 2 && tient(await J.a(A.cle)) && tient(await J.a(P.cle)), 'RESTAURER : les 2 achats reviennent (mémoire, disque, miroir)');
    doit(/2 /.test(await J.toast()), 'et le jeu le dit (« ' + (await J.toast()).trim() + ' »)');
    doit((await etat()).debits === 2, 'sans nouveau débit');
    doit((await J.vif()).eq.peinture !== P.nom, 'la peinture restaurée n\'est pas enfilée de force');
    n = await J.restaure(); const t = await J.toast();
    doit(!/AUCUN|NOTHING/i.test(t), 'RESTAURER une 2e fois, tout est déjà là : le jeu ne dit pas « AUCUN ACHAT À RESTAURER » (lu : « ' + t.trim() + ' »)');
    await J.tue();
    doit(tient(await J.a(A.cle)) && tient(await J.a(P.cle)), 'relancé : toujours là');
  };

  CAS.efface = async () => {
    await neuf({ bank: 5000 }); await J.acheteCaisse(A.cle); await J.achetePeinture(P.nom);
    doit((await J.menu('wipe')) === 'modale', '(mise en scène) TOUT EFFACER ouvre sa confirmation');
    await J.modale(null, 'pb-red'); await J.attendRecharge();
    const k = await J.disque();
    doit(k.d && (k.d.bank || 0) === 0 && k.p && (k.p.bank || 0) === 0, 'la progression est bien effacée (argent du jeu à 0, miroir compris)');
    doit(tient(await J.a(A.cle)) && tient(await J.a(P.cle)), 'TOUT EFFACER : les achats en € reviennent tout seuls au rechargement');
    doit((await etat()).debits === 2, 'sans nouveau débit');
    await J.restaure(); const t = await J.toast();
    doit(!/AUCUN|NOTHING|IMPOSSIBLE/i.test(t), 'puis RESTAURER ne dit pas « AUCUN ACHAT » à qui a ses achats (lu : « ' + t.trim() + ' »)');

    await neuf(); await J.acheteCaisse(A.cle); await sk(`oublie()`);
    await J.menu('wipe'); await J.modale(null, 'pb-red'); await J.attendRecharge();
    info('StoreKit muet au rechargement : ' + ((await J.a(A.cle)).vif ? 'rendu' : 'pas rendu avant RESTAURER (attendu)'));
    const n = await J.restaure();
    doit(n === 1 && tient(await J.a(A.cle)), 'TOUT EFFACER puis RESTAURER : l\'achat revient');
  };

  CAS.import = async () => {
    await neuf();
    await J.menu('exp'); const vieux = await J.ev(`return document.getElementById('modC').value;`);
    await J.ev(`var b=document.querySelectorAll('#modale .modB .pbtn');b[b.length-1].click();await new Promise(r=>setTimeout(r,300));return 1;`);
    await J.acheteCaisse(A.cle);
    const ligne = (await J.menu('imp')) === 'modale' ? 'imp' : ((await J.menu('code')) === 'modale' ? 'code' : null);
    doit(!!ligne, '(mise en scène) la ligne d\'import de sauvegarde existe dans l\'app');
    doit((await J.modale(vieux, 'pb-gold')) === 'ok', '(mise en scène) le code d\'AVANT l\'achat est collé');
    await J.attendRecharge();
    doit(tient(await J.a(A.cle)) && (await etat()).debits === 1, 'import d\'une sauvegarde d\'avant l\'achat : l\'achat n\'est PAS perdu (rendu au rechargement)');

    await neuf();
    const faux = code({ v: 2, gamme: 3, eco: 3, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, bienv: 1, facile: 0, ex: { runs: 5 }, plq: { m: 'fr', x: 'BANC', ok: 1 }, owned: [B.cle], equipped: B.cle, shop: { own: [P2.cle], eq: { peinture: P2.nom, aile: 'panneaux', trainee: 'nitro' } } });
    await J.menu(ligne || 'imp'); await J.modale(faux, 'pb-gold'); await J.attendRecharge();
    const a = await J.a(B.cle), ap = await J.a(P2.cle), e = await etat();
    trou(a.disque || ap.disque, 'code de sauvegarde fabriqué à la main : ' + (a.disque ? 'caisse en € OBTENUE' : 'caisse refusée') + ', ' + (ap.disque ? 'peinture en € OBTENUE' : 'peinture refusée') + ' — ' + e.debits + ' débit (décision R3 : accepté en v1.0)');
  };

  CAS.cousin = async () => {
    const page = fs.readFileSync(path.join(www, 'index.html'), 'utf8') + (fs.readdirSync(www).filter(f => /^jeu.*\.js$/.test(f)).map(f => fs.readFileSync(path.join(www, f), 'utf8')).join(''));
    doit(page.includes('function cousin(){return false;}') && page.includes('function cousinTout(){return false;}'), 'dans le www de l\'app, cousin() et cousinTout() rendent toujours faux');
    await neuf();
    const ligne = (await J.menu('imp')) === 'modale' ? 'imp' : 'code';
    if (ligne === 'code') await J.menu('code');
    await J.modale('cousin tout', 'pb-gold'); await dormir(500);
    const t = await J.toast(), k = await J.disque();
    doit(/INCONNU|UNKNOWN/i.test(t) && !(k.d && (k.d.cousin || k.d.cousinTout)), '« cousin tout » tapé dans l\'app : CODE INCONNU, rien d\'écrit (lu : « ' + t.trim() + ' »)');
    await neuf({ cousin: 1, cousinTout: 1, equipped: A.cle });
    const nu = await J.ev(`return window.dbgAchats.nuance(${JSON.stringify(P.nom)});`);
    info('sauvegarde venue du web avec cousinTout=1 : état de la peinture en € = ' + JSON.stringify(nu));
    doit(!(await J.a(A.cle)).vif && !(await J.a(P.cle)).vif, 'un drapeau cousinTout importé ne pose aucun objet payant');
    await J.acheteCaisse(A.cle);
    doit(tient(await J.a(A.cle)) && (await etat()).debits === 1, 'et la caisse reste à VENDRE (l\'achat part chez Apple) : le drapeau ne l\'a pas ouverte');
  };

  CAS.passif = async () => {
    await neuf();
    await J.ev(`localStorage.setItem('ccOngletActif','un-autre');window.dispatchEvent(new StorageEvent('storage',{key:'ccOngletActif',newValue:'un-autre'}));return 1;`);
    await J.acheteCaisse(A.cle);
    doit(tient(await J.a(A.cle)), 'dans l\'app, un « autre onglet » n\'existe pas : l\'achat est écrit quand même (disque et miroir)');
    await J.tue();
    doit(tient(await J.a(A.cle)), 'et il est là au lancement suivant');
    /* sur le SITE (où l'onglet passif existe) rien ne se vend en € : sans Capacitor le pont ne pose pas window.ccAchat (app-ios/outils/achats-test.cjs, cas a) et
       shopPaye rejette « storekit » (outils/banc-achats/paye.mjs, cas 6). Il n'y a donc aucun achat en € à perdre dans un onglet passif. */
    info('sur le site : pas de pont StoreKit, donc aucun achat en € possible dans un onglet passif (prouvé par achats-test.cjs et paye.mjs)');
  };

  CAS.divers = async () => {
    await neuf(); await J.acheteCaisse(A.cle); await sk(`rembourse(${JSON.stringify(A.id)})`); await dormir(300);
    trou((await J.a(A.cle)).vif, 'achat REMBOURSÉ par Apple : l\'objet reste dans cette installation (choix de la v1.0)');
    await J.telephoneNeuf(); await J.seme(); await J.lance();
    const n = await J.restaure();
    doit(n === 0 && !(await J.a(A.cle)).vif, 'un achat remboursé n\'est pas restauré sur un téléphone neuf');

    await neuf(); await sk(`regle({catalogue:[]})`); await J.acheteCaisse(A.cle);
    doit(!(await J.a(A.cle)).vif && (await etat()).debits === 0, 'produit pas créé chez Apple : rien donné, rien débité');

    await neuf(); await sk(`pose(['cashcar.car.nexistepas','cashcar.peinture.usine','cashcar.peinture.constructor','autre.produit'])`); J.erreurs.length = 0; await J.tue();
    const v = await J.vif();
    doit(J.erreurs.length === 0 && v.own.every(k => !/usine|constructor/.test(k)), 'des identifiants inconnus dans les droits Apple : ignorés, sans erreur (' + J.erreurs.length + ' exception)');

    const tous = CAISSES.concat(PEINTS);
    await neuf(); await sk(`pose(${JSON.stringify(tous.map(p => p.id))})`); await J.tue();
    let manque = []; for (const p of tous) if (!tient(await J.a(p.cle))) manque.push(p.id);
    doit(manque.length === 0, 'les ' + tous.length + ' produits du catalogue, possédés chez Apple, sont tous donnés au lancement' + (manque.length ? ' — MANQUENT : ' + manque.join(', ') : ''));
    await sk(`oublie()`); await J.tue(); await J.tue();
    manque = []; for (const p of tous) if (!tient(await J.a(p.cle))) manque.push(p.id);
    doit(manque.length === 0, 'deux relances sans StoreKit : la sauvegarde seule garde les ' + tous.length + ' (la désinfection n\'en mange aucun)' + (manque.length ? ' — PERDUS : ' + manque.join(', ') : ''));
    const ids = tous.map(p => p.id);
    doit(new Set(ids).size === ids.length && new Set(tous.map(p => String(p.cle))).size === ids.length, 'aucun identifiant de produit en double');
  };

  let code0 = 0;
  try {
    await neuf();
    CAISSES = await J.ev(`var L=[];for(var i=0;i<400;i++){var id=window.dbgAchats.produitDe(i);if(id)L.push({id:id,cle:i});}return L;`);
    const csv = fs.readFileSync(path.join(RACINE, 'app-ios', 'outils', 'produits.csv'), 'utf8').split(/\r?\n/).slice(1).filter(Boolean).map(l => l.split(',')[0]);
    PEINTS = [];
    for (const id of csv.filter(x => x.indexOf('cashcar.peinture.') === 0)) { const nom = id.slice(17), cle = 'peinture:' + nom;
      if ((await J.ev(`return window.dbgAchats.produitDe(${JSON.stringify(cle)});`)) === id) PEINTS.push({ id, cle, nom }); }
    dit(`catalogue vu par le jeu de l'app : ${CAISSES.length} caisses + ${PEINTS.length} peintures (produits.csv : ${csv.length} lignes)`);
    if (CAISSES.length < 3 || PEINTS.length < 2) throw new Error('catalogue trop court pour le banc');
    doit(CAISSES.length + PEINTS.length === csv.length, 'le jeu et produits.csv disent le même catalogue');
    A = CAISSES.find(p => /feline/.test(p.id)) || CAISSES[2]; B = CAISSES.find(p => p !== A && !/pizza/.test(p.id)); P = PEINTS[0]; P2 = PEINTS[1];
    const NOMS = { reussi: '1. ACHAT RÉUSSI', annule: '2. ACHAT ANNULÉ', attente: '3. EN ATTENTE (demande d\'achat)', reseau: '4. COUPURE RÉSEAU AU MILIEU', double: '5. DOUBLE TOUCHER',
      tuee: '6. APP TUÉE PENDANT L\'ACHAT', neuf: '7. RESTAURER SUR UN TÉLÉPHONE NEUF', efface: '8. TOUT EFFACER PUIS RESTAURER', import: '9. IMPORT D\'UNE SAUVEGARDE',
      cousin: '10. CODE « COUSIN TOUT »', passif: '11. ONGLET PASSIF', divers: '12. AUTRES COUPS TORDUS' };
    for (const k of Object.keys(CAS)) { if (SEULS && SEULS.indexOf(k) < 0) continue;
      casEnCours = NOMS[k]; dit('\n' + NOMS[k]); J.erreurs.length = 0;
      try { await CAS[k](); } catch (e) { doit(false, 'le cas s\'est arrêté : ' + String(e && e.message || e).slice(0, 300)); }
      const ex = J.erreurs.filter(x => !/stNote|reading '0'/.test(x)); if (ex.length) info(ex.length + ' exception(s) de page : ' + ex[0].split('\n')[0]); }
  } catch (e) { console.error('✗ banc adversaire : ' + (e && e.stack || e)); code0 = 2; }
  finally { await J.ferme(); }
  if (code0) process.exit(code0);
  if (defauts.length) { console.log('\n✗ ' + defauts.length + ' DÉFAUT(S) :\n  - ' + defauts.join('\n  - ')); process.exit(1); }
  console.log('\nOK adversaire'); process.exit(0);
})();
