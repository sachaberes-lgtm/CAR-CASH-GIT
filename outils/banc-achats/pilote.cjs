/* LE PILOTE DU BANC ADVERSAIRE (2026-11-10) : fabrique le www/ de l'APP (preparer-www --essai, donc avec les coupes de l'app), le sert,
   lance un Chrome sans fenêtre et MUET, injecte le faux StoreKit avant tout script, et donne au banc les gestes d'un joueur :
   lancer l'app, la tuer, recharger la WebView, toucher ACHETER, RESTAURER, TOUT EFFACER, ENTRER UN CODE. */
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), cp = require('child_process');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir } = require('../banc-trainees/cdp.cjs');
const RACINE = path.resolve(__dirname, '..', '..');
const FAUX = fs.readFileSync(path.join(__dirname, 'storekit-faux.js'), 'utf8');
const Q = '?intro=ancien&attente=0'; /* headless : l'intro du studio et l'attente du départ ne finissent jamais sans GPU complet */

function fabrique(sortie) { /* le jeu TEL QUE L'APP L'EMBARQUE ; --web : VERSION PRINCIPALE telle quelle */
  fs.rmSync(sortie, { recursive: true, force: true });
  cp.execFileSync(process.execPath, [path.join(RACINE, 'app-ios', 'preparer-www.js'), '--essai', '--sortie', sortie], { stdio: ['ignore', 'ignore', 'inherit'] });
  return sortie;
}
function port(depart) { let p = depart; while (!portLibre(p)) p++; return p; }

async function ouvre({ dossier, profil, web }) {
  const pH = port(8961), pC = port(9561);
  const srv = await serveur(path.resolve(dossier), pH);
  const prof = profil || fs.mkdtempSync(path.join(os.tmpdir(), 'banc-achats-'));
  const { ch, pg } = await lanceChrome(pC, prof, 844, 390);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Network.enable');
  await c.send('Network.setBypassServiceWorker', { bypass: true });
  const erreurs = [];
  const brut = c.ws.onmessage;
  c.ws.onmessage = e => { brut(e); const m = JSON.parse(e.data);
    if (m.method === 'Runtime.exceptionThrown') erreurs.push((m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text || '').slice(0, 240)); };
  if (!web) await c.send('Page.addScriptToEvaluateOnNewDocument', { source: FAUX });
  const base = `http://127.0.0.1:${pH}/`;
  const J = {
    c, erreurs, base,
    ev: (s, ms) => c.ev(`(async function(){${s}})()`, ms),
    async vide() { /* une page de la même origine, sans le jeu : pour préparer les mémoires */
      await c.send('Page.navigate', { url: base + (web ? 'manifest.webmanifest' : 'maj.json') }); await dormir(400); }, /* ⚠ quitter la page du jeu d'abord : son `pagehide` réécrit la sauvegarde */
    async seme(save) { /* un joueur qui a déjà joué, muet (jamais de son au banc) */
      const s = Object.assign({ v: 2, sfx: false, mus: false, vox: false, vib: false, tuto: 1, permis: 1, facile: 0, bienv: 1, ex: { runs: 5 }, plq: { m: 'fr', x: 'BANC', ok: 1 } }, save || {});
      await J.ev(`localStorage.cashcarSave=${JSON.stringify(JSON.stringify(s))};localStorage['__prefs:cashcarSave']=localStorage.cashcarSave;return 1;`); },
    async lance(attente = 240000) { /* l'app s'ouvre (ou la WebView recharge) : attendre le jeu prêt, passer le splash */
      await c.send('Page.navigate', { url: base + 'index.html' + Q });
      const t0 = Date.now();
      for (;;) { await dormir(400);
        let ok = false; try { ok = await c.ev('!!window.__gameReady&&!!window.dbgAchats&&!!window.__sk'); } catch (e) {}
        if (web) { try { ok = await c.ev('!!window.__gameReady&&!!window.dbgAchats'); } catch (e) {} }
        if (ok) break; if (Date.now() - t0 > attente) throw new Error('jeu jamais prêt'); }
      for (let i = 0; i < 20; i++) { const la = await c.ev(`(()=>{const s=document.getElementById('splash');if(!s)return 0;s.click();s.dispatchEvent(new Event('pointerdown',{bubbles:true}));return 1;})()`); if (!la) break; await dormir(250); }
      await dormir(900); /* achatsDemarre : prix, synchro, achats retenus */
      return Date.now() - t0; },
    async attendRecharge(attente = 240000) { /* la page se recharge TOUTE SEULE (TOUT EFFACER, ENTRER UN CODE) : attendre la suivante */
      const t0 = Date.now();
      for (;;) { await dormir(400); let ok = false; try { ok = await c.ev('!window.__vieille&&!!window.__gameReady&&!!window.dbgAchats'); } catch (e) {}
        if (ok) break; if (Date.now() - t0 > attente) throw new Error('rechargement jamais venu'); }
      for (let i = 0; i < 20; i++) { const la = await c.ev(`(()=>{const s=document.getElementById('splash');if(!s)return 0;s.click();return 1;})()`); if (!la) break; await dormir(250); }
      await dormir(900); },
    async tue() { /* l'app est tuée (balayée, ou tuée par iOS) puis rouverte : la mémoire vive du plugin part, pas l'App Store ni le disque */
      await J.vide(); await J.ev(`sessionStorage.removeItem('__natif');return 1;`); return J.lance(); },
    recharge() { return J.lance(); }, /* la WebView recharge (mise à jour en direct, processus web tué) : le plugin Swift reste vivant */
    async telephoneNeuf() { /* réinstallation / autre iPhone, même identifiant Apple : plus de sauvegarde, plus de miroir, StoreKit ne sait rien avant RESTAURER */
      await J.vide(); await J.ev(`var a=JSON.parse(localStorage.__appstore||'null');localStorage.clear();sessionStorage.clear();if(a){a.local=false;localStorage.__appstore=JSON.stringify(a);}return 1;`); },
    sk: (s) => J.ev(`return window.__sk.${s};`),
    disque: () => J.ev(`var d=null,p=null;try{d=JSON.parse(localStorage.cashcarSave);}catch(e){}try{p=JSON.parse(localStorage['__prefs:cashcarSave']);}catch(e){}return {d:d,p:p};`),
    vif: () => J.ev(`return window.dbgAchats.etat();`),
    async a(cle) { /* le joueur A-T-IL l'objet ? en mémoire vive, sur le disque et dans le miroir */
      const v = await J.vif(), k = await J.disque(), f = (o) => !!o && (typeof cle === 'number' ? (o.owned || []).indexOf(cle) >= 0 : ((o.shop && o.shop.own) || []).indexOf(cle) >= 0);
      return { vif: typeof cle === 'number' ? v.owned.indexOf(cle) >= 0 : v.own.indexOf(cle) >= 0, disque: f(k.d), miroir: f(k.p) }; },
    async acheteCaisse(i, { attendre = true } = {}) { /* la fenêtre d'achat de la caisse, puis ACHETER (le vrai bouton, le vrai gestionnaire) */
      await J.ev(`var o=document.querySelector('#shPop.on');if(o){var n=o.querySelector('[data-sp="non"]');if(n)n.click();await new Promise(r=>setTimeout(r,700));}
        var s=document.getElementById('__bancSrc')||document.body.appendChild(Object.assign(document.createElement('div'),{id:'__bancSrc'}));s.setAttribute('data-car','${i}');
        window.dbgAchats.pop(s);await new Promise(r=>setTimeout(r,650));return 1;`);
      const r = await J.touche('#shPop [data-sp="oui"]');
      if (attendre) await dormir(450);
      return r; },
    touche: (sel) => J.ev(`var b=document.querySelector(${JSON.stringify(sel)});if(!b)return 'absent';b.click();return b.className;`),
    achetePeinture: async (id, { attendre = true } = {}) => { const r = await J.ev(`return window.dbgAchats.habPaye(${JSON.stringify(id)});`); if (attendre) await dormir(450); return r; },
    restaure: () => J.ev(`return await window.dbgAchats.restaure();`),
    toast: () => J.ev(`var t=document.getElementById('toast');return t?t.textContent:'';`),
    async menu(m) { /* une ligne des réglages : le vrai gestionnaire (mTap), puis la modale */
      return J.ev(`var e=document.querySelector('[data-m="${m}"]');if(!e)return 'absent';
        var r=e.getBoundingClientRect(),pt=[{clientX:r.left+4,clientY:r.top+4,pageX:r.left+4,pageY:r.top+4,identifier:1,target:e}];
        ['touchstart','touchend'].forEach(function(n){var t=new Event(n,{bubbles:true,cancelable:true});t.touches=n==='touchstart'?pt:[];t.changedTouches=pt;t.targetTouches=t.touches;e.dispatchEvent(t);});
        await new Promise(r=>setTimeout(r,120));var m0=document.getElementById('modale');if(!(m0&&m0.classList.contains('on')))e.click();
        await new Promise(r=>setTimeout(r,250));var mo=document.getElementById('modale');return mo&&mo.classList.contains('on')?'modale':'rien';`); },
    async modale(texte, classe) { /* remplir le champ, attendre que le bouton rouge s'arme, toucher */
      return J.ev(`var mo=document.getElementById('modale');if(!mo||!mo.classList.contains('on'))return 'fermée';
        ${texte != null ? `document.getElementById('modC').value=${JSON.stringify(texte)};` : ''}
        await new Promise(r=>setTimeout(r,520));var b=mo.querySelector('.modB .${classe}');if(!b)return 'bouton absent';window.__vieille=1;b.click();return 'ok';`); },
    async ferme() { c.close(); tueChrome(ch); await new Promise(r => srv.close(r)); if (!profil) { await dormir(400); try { fs.rmSync(prof, { recursive: true, force: true }); } catch (e) {} } }
  };
  return J;
}
module.exports = { fabrique, ouvre, dormir, RACINE };
