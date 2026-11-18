/* LE BANC DU TRI DES VOITURES, DANS LE VRAI JEU (2026-11-18) — une passe Chrome sans fenêtre, MUETTE (--mute-audio, sfx/mus/vox à false), téléphone émulé.
   Complète banc.cjs (Node) : charge VERSION PRINCIPALE/index.html (assemblé) avec deux sauvegardes fabriquées et regarde ce que le joueur voit :
     · « lot » : possède les cinq retirées, roule avec LA FIDÈLE, possède aussi LE COMBI / LA DOLORÈS / L'AIGLE DE FEU ; doit arriver à l'accueil sans exception,
       LA HONTE équipée, les retirées hors de `owned`, le remboursement versé, les trois gardées toujours là ;
     · « neuf » : aucune sauvegarde ; la page ACHAT montre L'ICEBERG dans la grande boîte, bandeau OFFRE DE L'HIVER, 1,61 € barré, 0,80 € ;
       L'AIGLE DE FEU dans la grille à 1,61 € ; aucune retirée nulle part dans la page ACHAT.
   ⚠ UN seul Chrome sur le Mac : lancer sous ~/cash-car/verrou-banc.sh prendre "<qui>" … rendre. Le profil Chrome est effacé à la fin.
   node outils/banc-voitures-tri/page.cjs [--http 9961] [--cdp 9962]     Dernière ligne : BANC OK / BANC KO. */
const fs = require('fs'), path = require('path');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir, tmp } = require('../banc-trainees/cdp.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.resolve(path.join(__dirname, '..', '..', 'VERSION PRINCIPALE'));
const P_HTTP = +(A.http || 9961), P_CDP = +(A.cdp || 9962);
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const J = o => JSON.stringify(o);
const MUET = { sfx: false, mus: false, vox: false };
const LOT = { v: 2, ...MUET, gamme: 3, eco: 3, tuto: 1, permis: 1, bienv: 1, best: 9000, bank: 1000, aura: 100, owned: [1, 6, 45, 78, 79, 81, 7, 8, 52], equipped: 81,
  ex: { eng: 6, tricks: 40, gaps: 3, bumps: 9, zones: 2, chain: 12, kmh: 300, surv: 0, runs: 25, floor: 0 }, mis: { n: 3, ok: [1, 1, 1], best: [0, 0, 0], f: -1 },
  shop: { own: ['peinture:lagon'], eq: { peinture: 'lagon', aile: 'panneaux', trainee: 'nitro' } }, prof: { ne: Date.now() - 5 * 864e5, tA: 3600, dMax: 120 },
  m2: { v: 1, vc: 1, vr: 1, ok: ['fig5'], pr: [], su: [], mq: [], nv: ['fig5'], fl: [], vu: {}, r: {}, c: { morts: 3, gagne: 5e6, jours: 4, jd: '2026-11-17', cartes: ['nuages'], cartesP: [], rejoue: 0 } } };
const RETIREES = ['LE SCARABÉE', 'LA QUEUE DE CANARD', 'LA PERLE', 'LA CABOSSÉE', 'LA FIDÈLE'];
let ko = 0;
const dit = (c, m, d) => { if (c) console.log('  ok  ' + m); else { ko++; console.log('  KO  ' + m + (d !== undefined ? ' — ' + J(d).slice(0, 400) : '')); } };

async function unCas(nom, ls, port, faire) {
  const prof = tmp();
  const { ch, pg } = await lanceChrome(port, prof, 390, 844);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  const err = [];
  c.ws.addEventListener('message', e => { try { const m = JSON.parse(e.data);
    if (m.method === 'Runtime.exceptionThrown') err.push('exception: ' + ((m.params.exceptionDetails.exception && m.params.exceptionDetails.exception.description) || m.params.exceptionDetails.text || '').slice(0, 300));
    if (m.method === 'Runtime.consoleAPICalled' && (m.params.type === 'error' || m.params.type === 'warning')) err.push(m.params.type + ': ' + m.params.args.map(a => a.value || a.description || '').join(' ').slice(0, 300)); } catch (x) {} });
  console.log('— ' + nom);
  try {
    await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Network.enable');
    await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
    await c.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true, screenWidth: 390, screenHeight: 844 });
    await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' });
    const L = ls ? { cashcarSave: J(ls) } : { cashcarSave: J({ v: 2, ...MUET }) };
    await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{if(!sessionStorage.getItem("__fx")){sessionStorage.setItem("__fx","1");localStorage.clear();var L=' + J(L) + ';for(var k in L)localStorage.setItem(k,L[k]);}}catch(e){}' });
    await c.send('Page.navigate', { url: `http://127.0.0.1:${P_HTTP}/index.html?colonne=0&tel=1&simu=1&garde=1&intro=ancien&attente=0` });
    let pret = false; for (let i = 0; i < 160 && !pret; i++) { await dormir(500); try { pret = await c.ev("!!window.__gameReady&&!!document.getElementById('mHome')&&document.getElementById('mHome').classList.contains('on')", 8000); } catch (x) {} }
    dit(pret, nom + ' : le jeu arrive à l\'accueil');
    if (pret) { await dormir(2000); await faire(c); }
    const graves = err.filter(x => !/favicon|404|Failed to load resource|WebGL|GPU stall|ReadPixels|AudioContext|autoplay/i.test(x));
    dit(!graves.length, nom + ' : aucune exception ni erreur console', graves.slice(0, 6));
  } catch (e) { ko++; console.log('  KO  ' + nom + ' : ' + String(e).slice(0, 300)); }
  finally { try { c.close(); } catch (x) {} tueChrome(ch); await dormir(800); try { fs.rmSync(prof, { recursive: true, force: true }); } catch (x) {} }
}

(async () => {
  for (const p of [P_HTTP, P_CDP, P_CDP + 1]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  const srv = await serveur(JEU, P_HTTP);
  await unCas('lot (possède les cinq retirées, roule en LA FIDÈLE)', LOT, P_CDP, async c => {
    /* SAVE vit dans l'IIFE : on lit par le crochet dbgAchats.etat() (owned, habillages) et la sauvegarde que le jeu a réécrite au chargement */
    const e = await c.ev("(function(){const e=window.dbgAchats&&dbgAchats.etat?dbgAchats.etat():null;return e?{owned:e.owned,eq:e.eq,save:e.save}:null;})()");
    const s = (e && e.save) || {};
    dit(e && [6, 45, 78, 79, 81].every(i => e.owned.indexOf(i) < 0), 'les cinq retirées sortent de owned', e && e.owned);
    dit(e && [1, 7, 8, 52].every(i => e.owned.indexOf(i) >= 0), 'ELDORADO, LE COMBI, LA DOLORÈS, L\'AIGLE DE FEU restent', e && e.owned);
    dit(s.equipped === 0, 'LA FIDÈLE équipée → LA HONTE (sauvegarde réécrite)', s.equipped);
    dit(s.bank === 1000 + 8000000 + 2400000 + 25000 + 40000, 'remboursement : 8 M + 2,4 M + 25 k + 40 k $ (LE SCARABÉE se gagnait : rien)', s.bank);
    dit(e && e.eq.peinture === 'lagon', 'la peinture posée reste', e && e.eq);
    const tx = await c.ev("document.body.innerText||''");
    console.log('  (vu) message de remboursement à l\'écran : ' + (/QUITTENT LE GARAGE/.test(tx) ? 'oui' : 'non (le toast a pu passer)'));
    await c.ev("window.__mGo('shop');1"); await dormir(2500);
    const t = await c.ev("(document.getElementById('mShop')||{}).innerText||''");
    dit(!RETIREES.some(n => t.indexOf(n) >= 0), 'page ACHAT : aucune retirée', RETIREES.filter(n => t.indexOf(n) >= 0));
  });
  await unCas('neuf (aucune partie)', null, P_CDP + 1, async c => {
    await c.ev("window.__mGo('shop');1"); await dormir(3000);
    const r = await c.ev("(function(){const u=document.getElementById('shUne'),g=document.getElementById('shGrille'),ms=document.getElementById('mShop');return {une:u?u.innerHTML:'',unet:u?u.innerText:'',car:u&&u.getAttribute('data-car'),grille:g?g.innerText:'',sansUne:ms&&ms.classList.contains('sansUne'),tout:ms?ms.innerText:''};})()");
    dit(r.car === '72', 'la grande boîte (l\'offre à la une) est L\'ICEBERG', r.car);
    dit(/OFFRE DE L.HIVER/i.test(r.unet), 'bandeau OFFRE DE L\'HIVER', r.unet.slice(0, 200));
    dit(/<s>1,61\s*€<\/s>/.test(r.une) && /0,80\s*€/.test(r.unet), '1,61 € barré, 0,80 €', r.une.slice(0, 600));
    dit(!r.sansUne, 'la page n\'est plus « sans une »');
    dit(/AIGLE DE FEU/.test(r.grille), 'L\'AIGLE DE FEU dans la grille', r.grille.slice(0, 300));
    dit(!RETIREES.some(n => r.tout.indexOf(n) >= 0), 'aucune retirée sur la page ACHAT');
    const ouv = await c.ev("(function(){const u=document.getElementById('shUne');if(!u||!window.dbgAchats||!dbgAchats.pop)return null;dbgAchats.pop(u);return 1;})()"); /* la fenêtre d'achat, comme au toucher de la grande boîte (data-m=shopSoon → shopPop) */
    await dormir(1500);
    const p = await c.ev("(function(){const e=document.querySelector('.spCarte');return e?{h:e.innerHTML,t:e.innerText}:null;})()");
    dit(ouv && p && /OFFRE DE L.HIVER/i.test(p.t) && /<s>1,61\s*€<\/s>/.test(p.h), 'la fenêtre d\'achat : bandeau et prix barré', p && p.t.slice(0, 300));
    dit(p && /ACHETER/.test(p.t), 'la fenêtre d\'achat dit ACHETER (sur le web : INDISPONIBLE au toucher, jamais muet)');
    if (A.photos) { /* les deux images, pour un œil : la fenêtre d'achat ouverte, puis la page ACHAT */
      fs.mkdirSync(A.photos, { recursive: true });
      const ph = async n => { const r = await c.send('Page.captureScreenshot', { format: 'png' }); fs.writeFileSync(path.join(A.photos, n + '.png'), Buffer.from(r.data, 'base64')); };
      await ph('fenetre-achat'); await c.ev("(function(){const b=document.querySelector('.spNon');if(b)b.click();return 1;})()"); await dormir(1200); await ph('page-achat'); }
  });
  srv.close();
  console.log(ko ? 'BANC KO' : 'BANC OK'); process.exit(ko ? 1 : 0);
})();
