/* LE BANC DE LA PUB DE L'APP (2026-11-23, Sacha : « mettre de la VRAIE pub dans l'app iPhone ») — node outils/banc-pub/banc.cjs
   Le jeu du dépôt avec un faux Capacitor (il se croit dans l'app), un Chrome sans fenêtre et MUET (--mute-audio, et la sauvegarde semée sans son),
   le faux StoreKit du banc des achats et le FAUX MODULE ADMOB (admob-faux.js). Il joue les cas que Sacha a demandés :
   démarrage (consentement, ATT, blocs de TEST), CONTINUER vue / fermée trop tôt / double appui, ×2, plaques grises sans réseau puis
   rallumées, pub entre les courses (1 sur 3, partie > 2 min, jamais juste après une récompensée), CHOIX DES PUBS, l'ancien binaire
   sans module (gratuit, aucun ×2), et le site (rien de changé). Sortie : une ligne ✓ / ✗ par contrôle ; code 1 s'il y a un ✗. */
'use strict';
const fs = require('fs'), path = require('path'), os = require('os');
const { ouvre, dormir } = require('../banc-achats/pilote.cjs');
const FAUX_AD = fs.readFileSync(path.join(__dirname, 'admob-faux.js'), 'utf8'), FAUX_SK = fs.readFileSync(path.join(__dirname, '..', 'banc-achats', 'storekit-faux.js'), 'utf8');
const RACINE = path.resolve(__dirname, '..', '..');
let rates = 0;
const OUVERTS = [];
const ok = (v, quoi, detail) => { console.log((v ? '  ✓ ' : '  ✗ ') + quoi + (detail !== undefined ? '  — ' + (typeof detail === 'string' ? detail : JSON.stringify(detail)) : '')); if (!v) rates++; };

async function session(dossier, { admob = true, web = false } = {}) {
  const J = await ouvre({ dossier, web: true });
  { const f9 = J.ferme; let fait = false; J.ferme = async () => { if (fait) return; fait = true; await f9(); }; OUVERTS.push(J); } /* fermé même si le banc s'arrête en route (sinon des Chrome restent allumés) */ /* web:true pour le pilote = pas de maj.json ni d'attente de __sk : le faux natif est posé ici */
  if (!web) await J.c.send('Page.addScriptToEvaluateOnNewDocument', { source: FAUX_SK });
  if (admob && !web) await J.c.send('Page.addScriptToEvaluateOnNewDocument', { source: FAUX_AD });
  await J.vide(); await J.seme({ chanceG: 0, spinBoost: 0, jetons: 0 });
  /* un téléphone, comme outils/banc-chance/coeur.cjs : sans lui la chute du départ ne part pas */
  await J.c.send('Emulation.setDeviceMetricsOverride', { width: 844, height: 390, deviceScaleFactor: 1, mobile: true, screenWidth: 844, screenHeight: 390 });
  await J.c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  await J.c.send('Emulation.setUserAgentOverride', { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1', platform: 'iPhone' });
  await J.c.send('Network.setCacheDisabled', { cacheDisabled: true });
  /* le lancement du pilote, avec ?colonne=0 (le site, sur un écran large, se met sinon dans son cadre d'ordinateur) */
  await J.c.send('Page.navigate', { url: J.base + 'index.html?colonne=0&tel=1&simu=1&garde=1&intro=ancien&attente=0' });
  { const t0 = Date.now(); for (;;) { await dormir(400); let p9 = false; try { p9 = await J.c.ev('!!window.__gameReady&&typeof dbgChance===\'function\'&&document.getElementById(\'mHome\').classList.contains(\'on\')'); } catch (e) {} if (p9) break; if (Date.now() - t0 > 240000) throw new Error('jeu jamais prêt'); }
    for (let i = 0; i < 20; i++) { const la = await J.c.ev(`(()=>{const s=document.getElementById('splash');if(!s)return 0;s.click();s.dispatchEvent(new Event('pointerdown',{bubbles:true}));return 1;})()`); if (!la) break; await dormir(250); }
    await dormir(3000); }
  J.attend = async (expr, ms = 20000, pas = 250) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { try { if (await J.c.ev(expr, 8000)) return true; } catch (e) {} await dormir(pas); } return false; };
  J.v = (expr) => J.c.ev(expr, 15000);
  J.course = async (t, cash) => { /* une partie neuve qui roule, vieillie à t s, avec cash $ */
    let en = false; /* la toute première chute du départ, sans GPU complet, demande parfois un second JOUER (vu à la sonde) */
    for (let k = 0; k < 3 && !en; k++) {
      if (!(await J.v("dbgChance().mode==='drive'&&!dbgChance().gameOver"))) await J.v('dbgJouer();1');
      en = await J.attend("dbgChance().mode==='drive'&&!dbgChance().gameOver&&dbgChance().t>0.3", 25000, 400); }
    await J.v(`dbgChance('bon',0);dbgChance('t',${t});dbgChance('$',${cash});1`); return en; };
  J.meurt = async () => { /* le bouclier de la reprise (3 s) replace la caisse sans frais : on recommence jusqu'à la vraie mort */
    const t0 = Date.now();
    while (Date.now() - t0 < 30000) { await J.v("dbgChance('mort');1");
      if (await J.attend("dbgChance().gameOver&&document.querySelector('#mDead.on')!=null", 1500, 250)) return true; }
    return false; };
  J.rejoue = async () => { await dormir(800); /* l'écran de mort est « sourd » 600 ms */
    return J.v(`(function(){var b=document.querySelector('#mDead [data-m="replay"]');if(!b)return 'absent';b.click();return 'ok';})()`); };
  J.ad = () => J.v('JSON.parse(JSON.stringify(window.__ad))');
  return J;
}

(async () => {
  const S = fs.mkdtempSync(path.join(os.tmpdir(), 'banc-pub-'));
  try {
    /* le jeu du dépôt, avec le faux Capacitor : il se croit dans l'app (EN_APP) et garde ses crochets dbg* (l'édition de l'app les retire à
       la fabrication, publie-allege). La fabrication elle-même est contrôlée par preparer-www --essai et ses TÉMOINS DE LA PUB. */
    const www = path.join(RACINE, 'VERSION PRINCIPALE');
    if (process.argv.includes('--sonde')) { /* --sonde : ce que l'écran de fin montre, toutes les 200 ms, après une mort (mise au point du banc) */
      const J = await session(www);
      for (let k = 0; k < 3; k++) { const c9 = await J.course(30, 900); console.log('course', k, c9, JSON.stringify(await J.v('dbgJouer()')).slice(0, 160)); if (c9) break; }
      await J.v("dbgChance('mort');1"); const t0 = Date.now();
      while (Date.now() - t0 < 14000) { console.log(Date.now() - t0, JSON.stringify(await J.v(`(function(){var c=document.getElementById('mChance'),d=document.getElementById('mDouble'),m=document.getElementById('mDead');
        return {over:dbgChance().gameOver,dead:!!(m&&m.classList.contains('on')),ok:dbgChance().ok,ch:c.hidden,chT:c.textContent,dbl:dblEtat().ok,dH:d?d.hidden:'x',dD:d?getComputedStyle(d).display:'x',ov:document.getElementById('overlay').style.display};})()`))); await dormir(400); }
      await J.ferme(); return; }

    /* ===== 1. L'APP AVEC LE MODULE ADMOB ===== */
    console.log('— 1. l\'app avec le module AdMob');
    let J = await session(www);
    await J.attend('dbgPub().admob.init&&dbgPub().admob.recompense&&dbgPub().admob.entre', 15000);
    let p = await J.v('dbgPub()'), a = await J.ad();
    ok(p.app && p.admob.on, 'la pub de l\'app est branchée (PUBR.app, AMOB.on)', { app: p.app, on: p.admob.on });
    ok(p.admob.test === true, 'blocs de TEST de Google (admob.json test:true)');
    ok(a.log.some(l => /^prepR:ca-app-pub-3940256099942544\/1712485313:true$/.test(l)), 'vidéo récompensée demandée en bloc de test, isTesting', a.log.filter(l => /^prep/.test(l)).slice(0, 2));
    ok(a.log.some(l => /^prepI:ca-app-pub-3940256099942544\/4411468910:true$/.test(l)), 'pub plein écran demandée en bloc de test');
    const iC = a.log.indexOf('consentInfo'), iF = a.log.indexOf('consentForm'), iA = a.log.indexOf('att'), iP = a.log.findIndex(l => /^prep/.test(l));
    ok(iC >= 0 && iF > iC && iA > iF && iP > iA, 'ordre au lancement : consentement Google, son formulaire, ATT, puis les pubs', a.log.slice(0, 6));
    ok(p.admob.choix === true && (await J.v(`getComputedStyle(document.querySelector('[data-m="pubchoix"]')).display!=='none'`)), 'RÉGLAGES › CHOIX DES PUBS visible (Google le demande)');
    await J.v(`document.querySelector('[data-m="pubchoix"]').click();1`); await dormir(600);
    ok((await J.ad()).log.includes('privacyForm'), 'CHOIX DES PUBS ouvre le formulaire de Google');

    /* CONTINUER vue jusqu'au bout, avec un double appui */
    const c1 = await J.course(30, 300), m1 = await J.meurt(); ok(m1, 'mort 1 : écran de fin', { course: c1, etat: await J.v('dbgChance()'), jouer: await J.v('dbgJouer()') });
    ok(await J.attend("dbgChance().ok&&!document.getElementById('mChance').hidden", 9000, 150), 'l\'offre CONTINUER est là');
    let pl = await J.v(`(function(){var e=document.getElementById('mChance');return {vu:!e.hidden,gris:e.classList.contains('pubGris'),txt:e.textContent};})()`);
    ok(pl.vu && !pl.gris && /PUB/.test(pl.txt), 'plaque CONTINUER ▶ PUB, allumée', pl);
    const pubs0 = (await J.v('dbgPub()')).pubs;
    const r1 = await J.v(`[dbgChance('joue'),dbgChance('joue')]`);
    await dormir(300);
    const pendant = await J.v(`({on:dbgPub().on,montre:window.__ad.montre})`);
    ok(pendant.on && pendant.montre === 'r', 'pendant la vidéo : le jeu sait qu\'une pub est à l\'écran (il se tait, pubSilence)', pendant);
    ok(await J.attend("dbgChance().mode==='drive'&&!dbgChance().gameOver", 15000), 'vidéo vue jusqu\'au bout → la course reprend');
    a = await J.ad(); p = await J.v('dbgPub()');
    ok(a.n.r === 1, 'double appui : UNE seule vidéo', { appuis: r1, videos: a.n.r });
    ok(p.pubs === pubs0 + 1, 'la vidéo vue compte (L\'ÉTERNELLE)', { avant: pubs0, apres: p.pubs });

    /* ×2 vu, puis REJOUER juste après : pas de pub plein écran */
    await J.v(`dbgChance('$',900);dbgChance('t',40);1`);
    ok(await J.meurt(), 'mort 2 (seconde chance déjà prise)');
    ok(await J.attend('dblEtat().ok', 12000), 'la plaque ×2 est due');
    await J.attend("!document.getElementById('mDouble').hidden", 15000, 200);
    pl = await J.v(`(function(){var e=document.getElementById('mDouble');return {vu:!e.hidden,gris:e.classList.contains('pubGris'),txt:e.textContent};})()`);
    ok(pl.vu && !pl.gris && /PUB/.test(pl.txt), 'plaque ×2 ▶ PUB, allumée', pl);
    const bank0 = (await J.v('dbgDouble()')).bank, v2 = (await J.v('dbgDouble()')).v;
    await J.v(`dbgDouble('joue');1`);
    ok(await J.attend(`dbgDouble().used`, 10000), '×2 : vidéo vue → gain doublé', { avant: bank0, gain: v2, apres: (await J.v('dbgDouble()')).bank });
    await J.v('dbgPub({n:0,apresR:45});1');
    await J.rejoue();
    ok(await J.attend("dbgChance().mode==='drive'&&!dbgChance().gameOver", 15000), 'REJOUER part');
    ok((await J.ad()).n.i === 0, 'pas de pub plein écran juste après une vidéo récompensée');

    /* CONTINUER fermée trop tôt, réseau coupé pendant : rien gagné, puis plaques GRISES */
    await J.course(30, 300); ok(await J.meurt(), 'mort 3');
    ok(await J.attend("dbgChance().ok&&!document.getElementById('mChance').hidden&&dbgPub().dispo", 9000, 150), 'offre CONTINUER, vidéo prête');
    await J.v(`window.__ad.mode='annule';window.__ad.reseau=false;dbgChance('joue');1`);
    await dormir(2500);
    let e = await J.v('dbgChance()');
    ok(e.gameOver && !e.used, 'vidéo fermée avant la fin → PAS de reprise', { gameOver: e.gameOver, used: e.used });
    await J.v('dbgPub({apresR:0});1');
    await J.rejoue(); await J.attend("dbgChance().mode==='drive'&&!dbgChance().gameOver", 15000);
    await J.course(30, 300); ok(await J.meurt(), 'mort 4 (mode avion)');
    ok(await J.attend("dbgChance().ok&&!document.getElementById('mChance').hidden&&document.getElementById('mChance').classList.contains('pubGris')", 9000, 150), 'l\'offre CONTINUER reste proposée sans réseau');
    pl = await J.v(`(function(){var e=document.getElementById('mChance');return {vu:!e.hidden,gris:e.classList.contains('pubGris'),txt:e.textContent};})()`);
    ok(pl.vu && pl.gris && /PAS DE PUB/.test(pl.txt), 'sans vidéo chargée : CONTINUER GRIS « PAS DE PUB »', pl);
    const nr = (await J.ad()).n.r;
    ok((await J.v(`dbgChance('joue')`)) === false && (await J.ad()).n.r === nr, 'toucher la plaque grise ne lance rien');
    await J.v(`window.__ad.reseau=true;window.__ad.mode='vue';dispatchEvent(new Event('online'));1`);
    ok(await J.attend(`!document.getElementById('mChance').classList.contains('pubGris')&&dbgChance().ok`, 4000, 150), 'le réseau revient : la plaque se rallume pendant l\'offre');

    /* pub entre les courses : 1 REJOUER sur 3 */
    await J.v('dbgPub({n:0,apresR:0});1');
    for (let k = 1; k <= 3; k++) {
      const i0 = (await J.ad()).n.i;
      if (!(await J.v('dbgChance().gameOver'))) { await J.course(10, 0); await J.meurt(); }
      await J.rejoue();
      if (k === 3) { const vuI = await J.attend("window.__ad.montre==='i'", 3000, 60), sous = await J.v("({over:dbgChance().gameOver,entre:dbgPub().entre.on})");
        ok(vuI && sous.over && sous.entre, 'REJOUER n° 3 : pub plein écran, la course attend sa fermeture', sous); }
      await dormir(500);
      const vu = (await J.ad()).n.i > i0;
      if (k === 3) ok(vu, 'REJOUER n° 3 : une pub comptée');
      else ok(!vu, 'REJOUER n° ' + k + ' : pas de pub');
      ok(await J.attend("dbgChance().mode==='drive'&&!dbgChance().gameOver", 15000), 'la course suivante part (' + k + ')');
    }
    /* partie de plus de 2 minutes : pub obligatoire */
    await J.v('dbgPub({n:0});1'); await J.course(130, 0); await J.meurt();
    let i0 = (await J.ad()).n.i; await J.rejoue(); await dormir(500);
    ok((await J.ad()).n.i === i0 + 1, 'partie de 130 s : pub plein écran dès le premier REJOUER');
    ok(await J.attend("dbgChance().mode==='drive'&&!dbgChance().gameOver", 15000), 'puis la course part');
    /* double appui sur REJOUER : une seule pub */
    await J.v('dbgPub({n:0});1'); await J.course(130, 0); await J.meurt();
    i0 = (await J.ad()).n.i; await dormir(800);
    await J.v(`(function(){var b=document.querySelector('#mDead [data-m="replay"]');b.click();b.click();return 1;})()`);
    await J.attend("dbgChance().mode==='drive'&&!dbgChance().gameOver", 15000);
    ok((await J.ad()).n.i === i0 + 1, 'double appui sur REJOUER : une seule pub');
    /* pas de pub chargée : REJOUER part tout de suite */
    await J.v(`window.__ad.reseau=false;1`); await J.course(130, 0); await J.meurt();
    await dormir(1500); i0 = (await J.ad()).n.i;
    /* la pub plein écran chargée avant est encore là : on la consomme d'abord */
    await J.rejoue(); await J.attend("dbgChance().mode==='drive'&&!dbgChance().gameOver", 15000);
    await J.course(130, 0); await J.meurt(); i0 = (await J.ad()).n.i; await J.rejoue();
    ok(await J.attend("dbgChance().mode==='drive'&&!dbgChance().gameOver", 6000) && (await J.ad()).n.i === i0, 'mode avion : REJOUER part tout de suite, sans pub');
    ok(J.erreurs.length === 0, 'aucune exception JS (app avec AdMob)', J.erreurs.slice(0, 5));
    await J.ferme();

    /* ===== 2. UN ANCIEN BINAIRE, SANS LE MODULE ===== */
    console.log('— 2. un ancien binaire, sans le module AdMob');
    J = await session(www, { admob: false });
    p = await J.v('dbgPub()');
    ok(!p.app && !p.admob.on && (await J.v(`document.documentElement.classList.contains('ccSansPub')`)), 'pas de module : pas de pub (html.ccSansPub)');
    await J.course(30, 900); await J.meurt(); await J.attend("dbgChance().ok&&!document.getElementById('mChance').hidden", 9000, 150);
    pl = await J.v(`(function(){var e=document.getElementById('mChance');return {vu:!e.hidden,txt:e.textContent};})()`);
    ok(pl.vu && /GRATUIT|FREE/.test(pl.txt), 'CONTINUER GRATUIT, comme avant', pl);
    await J.v(`dbgChance('joue');1`);
    ok(await J.attend("dbgChance().mode==='drive'&&!dbgChance().gameOver", 10000), 'la reprise est servie sans pub');
    await J.meurt(); await dormir(2500);
    ok(!(await J.v('dblEtat().ok')), 'pas de ×2 sans module');
    ok(J.erreurs.length === 0, 'aucune exception JS (ancien binaire)', J.erreurs.slice(0, 5));
    await J.ferme();

    /* ===== 3. LE SITE ===== */
    console.log('— 3. le site (VERSION PRINCIPALE telle quelle)');
    J = await session(path.join(RACINE, 'VERSION PRINCIPALE'), { web: true });
    p = await J.v('dbgPub()');
    ok(!p.app && !p.admob.on && p.dispo === true, 'le site : pas d\'AdMob, rien de grisé', { app: p.app, admob: p.admob.on, dispo: p.dispo });
    ok(!(await J.v(`document.documentElement.classList.contains('ccApp')||document.documentElement.classList.contains('ccSansPub')`)), 'le site n\'a pas les classes de l\'app');
    ok((await J.v(`getComputedStyle(document.querySelector('[data-m="pubchoix"]')).display`)) === 'none', 'le site : pas de ligne CHOIX DES PUBS');
    ok(J.erreurs.length === 0, 'aucune exception JS (site)', J.erreurs.slice(0, 5));
    await J.ferme();
  } catch (e) { console.log('  ✗ le banc s\'est arrêté : ' + (e && e.stack || e)); rates++; }
  finally { for (const J of OUVERTS) { try { await J.ferme(); } catch (e) {} } try { fs.rmSync(S, { recursive: true, force: true }); } catch (e) {} }
  console.log(rates ? `✗ ${rates} contrôle(s) en échec` : '✓ tous les contrôles passent');
  process.exit(rates ? 1 : 0);
})();
