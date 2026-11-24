/* (copie adaptée, 23/11 soir, Sacha : « CHAT POP-TART ça fait longtemps qu'on en veut plus » · « enlève la voiture pizza ») MÊME BANC pour CHAT POP-TART (9) et LA PIZZA EXPRESS (19) : jamais payées, donc AUCUN remboursement attendu.
   LE RETRAIT DU 23/11, DANS LE VRAI JEU (2026-11-23, Sacha : « enlève les voiture : baroudeur, dolce vita, caid, zagaie ») — une passe Chrome sans fenêtre, MUETTE
   (--mute-audio, sfx/mus/vox à false), téléphone émulé 390×844, ?tel=1. Complète la section 5 de banc.cjs (Node). Deux joueurs :
     · « neuf » : aucune partie. Le relevé du jeu (dbgDefisPossibles) ne propose aucune des quatre (fiches, boutique du jour, machine à sous) ; le garage feuilleté caisse
       par caisse (flèche ▶) ne montre ni l'une des quatre ni une carte sans nom ; la boutique du garage et sa page « tout » non plus ; la page ACHAT non plus ;
       puis une partie de 30 s au pilote de mesure (dbgJouer + dbgAuto) ;
     · « caïd » : possédait LE CAÏD et roulait avec. Arrive à l'accueil en LA HONTE, 600 000 $ rendus, le message « LE CAÏD QUITTE LE GARAGE » vu ; puis 30 s de partie.
   Aucune exception ni erreur console dans les deux cas.
   ⚠ sous le verrou : ~/cash-car/verrou-banc.sh prendre "retrait-voitures" … rendre. Le profil Chrome est effacé à la fin.
   node outils/banc-voitures-tri/page-23-11.cjs [--http 9963] [--cdp 9964] [--photos dossier]     Dernière ligne : BANC OK / BANC KO. */
const fs = require('fs'), path = require('path');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir, tmp } = require('../banc-trainees/cdp.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.resolve(path.join(__dirname, '..', '..', 'VERSION PRINCIPALE'));
const P_HTTP = +(A.http || 9963), P_CDP = +(A.cdp || 9964);
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const J = o => JSON.stringify(o);
const MUET = { sfx: false, mus: false, vox: false };
const QUATRE = ['CHAT POP-TART', 'LA PIZZA EXPRESS'], IDX = [9, 19];
/* les noms tels que l'écran les écrit : sans accents (sansAcc), en capitales */
const plat = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
const cite = t => QUATRE.filter(n => plat(t).indexOf(plat(n)) >= 0);
const CAID = { v: 2, ...MUET, gamme: 3, eco: 3, tuto: 1, permis: 1, bienv: 1, best: 9000, bank: 1000, aura: 100, owned: [9, 19], equipped: 9,
  ex: { eng: 6, tricks: 40, gaps: 3, bumps: 9, zones: 2, chain: 12, kmh: 300, surv: 0, runs: 25, floor: 0 }, mis: { n: 3, ok: [1, 1, 1], best: [0, 0, 0], f: -1 },
  shop: { own: [], eq: { peinture: 'usine', aile: 'panneaux', trainee: 'nitro' } }, prof: { ne: Date.now() - 5 * 864e5, tA: 3600, dMax: 120 },
  m2: { v: 1, vc: 1, vr: 1, ok: [], pr: [], su: [], mq: [], nv: [], fl: [], vu: {}, r: {}, c: { morts: 3, gagne: 5e6, jours: 4, jd: '2026-11-22', cartes: ['nuages'], cartesP: [], rejoue: 0, sc: { tri_voitures: 1 } } } };
/* le compte neuf a passé l'auto-école (sinon JOUER ouvre la leçon) : rien d'autre */
const NEUF = { v: 2, ...MUET, gamme: 3, eco: 3, tuto: 1, permis: 1, bienv: 1 };
let ko = 0;
const dit = (c, m, d) => { if (c) console.log('  ok  ' + m); else { ko++; console.log('  KO  ' + m + (d !== undefined ? ' — ' + J(d).slice(0, 500) : '')); } };
const clic = sel => "(function(){const e=document.querySelector(" + J(sel) + ");if(!e)return false;e.click();return true;})()";

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
    /* la sauvegarde d'essai est posée AVANT le premier script du jeu ; un guetteur note tout texte de remboursement qui passe à l'écran (le toast ne dure pas) */
    await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{if(!sessionStorage.getItem("__fx")){sessionStorage.setItem("__fx","1");localStorage.clear();localStorage.setItem("cashcarSave",' + J(J(ls)) + ');}}catch(e){}' +
      'window.__vuRemb="";try{new MutationObserver(function(){try{var t=document.getElementById("toast");var x=t?(t.innerText||t.textContent||""):"";if(/GARAGE/.test(x)&&/REMBOURS/.test(x))window.__vuRemb=x;}catch(e){}}).observe(document,{subtree:true,childList:true,characterData:true,attributes:true});}catch(e){}' });
    await c.send('Page.navigate', { url: `http://127.0.0.1:${P_HTTP}/index.html?colonne=0&tel=1&simu=1&garde=1&intro=ancien&attente=0` });
    let pret = false; for (let i = 0; i < 160 && !pret; i++) { await dormir(500); try { pret = await c.ev("!!window.__gameReady&&!!document.getElementById('mHome')&&document.getElementById('mHome').classList.contains('on')", 8000); } catch (x) {} }
    dit(pret, nom + ' : le jeu arrive à l\'accueil');
    if (pret) { await dormir(2500); await faire(c); }
    const graves = err.filter(x => !/favicon|404|Failed to load resource|WebGL|GPU stall|ReadPixels|AudioContext|autoplay/i.test(x));
    dit(!graves.length, nom + ' : aucune exception ni erreur console', graves.slice(0, 6));
  } catch (e) { ko++; console.log('  KO  ' + nom + ' : ' + String(e).slice(0, 300)); }
  finally { try { c.close(); } catch (x) {} tueChrome(ch); await dormir(800); try { fs.rmSync(prof, { recursive: true, force: true }); } catch (x) {} }
}
async function photo(c, n) { if (!A.photos) return; fs.mkdirSync(A.photos, { recursive: true });
  const r = await c.send('Page.captureScreenshot', { format: 'jpeg', quality: 55, clip: { x: 0, y: 0, width: 390, height: 844, scale: 1 } }); fs.writeFileSync(path.join(A.photos, n + '.jpg'), Buffer.from(r.data, 'base64')); }

/* le garage feuilleté à la flèche : le nom de chaque caisse, jusqu'à retomber sur la première */
async function feuillette(c) {
  const noms = []; let vides = 0;
  for (let k = 0; k < 70; k++) {
    const n = await c.ev("(function(){const e=document.getElementById('gName');return e?(e.innerText||e.textContent||'').trim():null;})()");
    if (k && noms.length && n === noms[0]) break;
    if (!n) vides++; noms.push(n);
    await c.ev(clic('#gNext')); await dormir(450);
  }
  return { noms, vides };
}
/* une partie de 30 s au pilote de mesure : le départ du bouton JOUER, puis l'état */
async function partie(c, nom) {
  const d = await c.ev("(function(){try{return JSON.stringify(window.dbgJouer());}catch(e){return 'erreur '+e.message;}})()");
  let parti = false; for (let i = 0; i < 60 && !parti; i++) { await dormir(500); parti = await c.ev("(function(){try{const e=dbgState();return !!(e.started&&e.running&&!e.gameOver);}catch(e){return false;}})()"); }
  dit(parti, nom + ' : la course tourne (started, running)');
  await c.ev("(function(){try{window.dbgAuto&&dbgAuto(true,0);}catch(e){}return 1;})()");
  const t0 = Date.now(); let vues = 0, mort = 0, enCourse = 0, rejoue = 0;
  while (Date.now() - t0 < 30000) { await dormir(2500); vues++;
    const e = await c.ev("(function(){try{const e=dbgState();return {s:e.started,r:e.running,g:e.gameOver};}catch(x){return null;}})()");
    if (e && e.g) { mort++; if (rejoue < 3) { rejoue++; await c.ev("(function(){try{window.dbgJouer();window.dbgAuto&&dbgAuto(true,0);}catch(x){}return 1;})()"); } } else if (e && e.s && e.r) enCourse++; }
  console.log('  (vu) départ : ' + String(d).slice(0, 200) + ' · 30 s : ' + enCourse + ' relevés en course sur ' + vues + ', fin de partie vue ' + mort + ' fois');
  dit(/"appel":"(?!erreur)/.test(String(d)), nom + ' : la partie part (le même départ que le bouton JOUER)', d);
  dit(enCourse >= 4, nom + ' : 30 s de jeu, la course vue en marche ' + enCourse + ' fois', { enCourse, vues, mort });
}

(async () => {
  for (const p of [P_HTTP, P_CDP, P_CDP + 1]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  const srv = await serveur(JEU, P_HTTP);
  await unCas('neuf (aucune partie)', NEUF, P_CDP, async c => {
    const R = await c.ev("(function(){const d=dbgDefisPossibles();return {v:d.voitures.filter(function(x){return !x.retire;}).map(function(x){return [x.i,x.n,x.rar,x.u&&x.u.p||0,x.u&&x.u.k||'']}),ret:d.voitures.filter(function(x){return x.retire;}).map(function(x){return x.i;}),spin:d.spin&&d.spin.epiques,bdj:d.boutiqueDuJour&&d.boutiqueDuJour.V,eco:d.ecoDebutPrix,mis:d.missions.filter(function(m){return m.r&&m.r.car;}).map(function(m){return m.r.car;})};})()");
    dit(IDX.every(i => R.ret.indexOf(i) >= 0) && !R.v.some(x => IDX.indexOf(x[0]) >= 0), 'le relevé du jeu : les deux sont retirées (index 9, 19)', R.v.filter(x => IDX.indexOf(x[0]) >= 0));
    dit(R.spin && !R.spin.some(i => IDX.indexOf(i) >= 0), 'machine à sous / série de sept jours : aucune des quatre (' + (R.spin || []).length + ' épiques à gagner)', R.spin);
    dit(R.bdj && !R.bdj.some(k => IDX.indexOf(+k.slice(2)) >= 0), 'boutique du jour : aucune des quatre au tirage (' + (R.bdj || []).length + ' caisses)', R.bdj);
    dit(!R.mis.some(n => QUATRE.indexOf(n) >= 0), 'aucune mission ne donne une des quatre');
    const px = R.v.filter(x => x[3] > 0 && !x[4]).sort((a, b) => a[3] - b[3]);
    console.log('  (vu) la suite d\'un compte neuf, à l\'argent du jeu : ' + px.slice(0, 5).map(x => x[1] + ' ' + x[3]).join(' · ') + ' — seuil du coup de pouce du débutant : ' + R.eco);
    dit(px.length > 0 && R.eco === px[0][3], 'la progression propose bien une caisse suivante (la moins chère : ' + (px[0] && px[0][1]) + ', ' + (px[0] && px[0][3]) + ' $)');
    /* la page ACHAT */
    await c.ev("window.__mGo('shop');1"); await dormir(2500);
    const tA = await c.ev("(document.getElementById('mShop')||{}).innerText||''");
    dit(tA.length > 40 && !cite(tA).length, 'page ACHAT : aucune des quatre', cite(tA));
    await c.ev("window.__mGo('home');1"); await dormir(1500);
    /* le garage */
    const ouv = await c.ev(clic('[data-m="garage"]')); let dedans = false;
    for (let i = 0; i < 40 && !dedans; i++) { await dormir(500); dedans = await c.ev("(function(){const g=document.getElementById('garage');return !!(g&&g.classList.contains('on')&&(document.getElementById('gName')||{}).textContent);})()"); }
    dit(ouv && dedans, 'le garage s\'ouvre');
    if (dedans) {
      await dormir(2500);
      const F = await feuillette(c);
      console.log('  (vu) garage, ' + F.noms.length + ' caisses à la flèche : ' + F.noms.join(' · ').slice(0, 900));
      dit(F.noms.length >= 20 && !F.vides, 'garage feuilleté : ' + F.noms.length + ' caisses, aucune carte sans nom', F);
      dit(!cite(F.noms.join(' | ')).length, 'garage feuilleté : aucune des quatre', cite(F.noms.join(' | ')));
      dit(new Set(F.noms).size === F.noms.length, 'garage feuilleté : aucune caisse en double (pas de trou sauté deux fois)');
      const tG = await c.ev("(document.getElementById('garage')||{}).innerText||''");
      dit(!cite(tG).length, 'garage, console ouverte : aucune des quatre écrite', cite(tG));
      /* la boutique du garage (la vitrine du jour), puis sa page « tout » */
      const b = await c.ev(clic('#gShopBas')); await dormir(3500);
      const S = await c.ev("(function(){const st=document.getElementById('gStrip'),C=st?[].slice.call(st.querySelectorAll('.fnC')):[];return {n:C.length,cles:C.map(function(e){return e.getAttribute('data-fn');}),noms:C.map(function(e){const x=e.querySelector('.fnN');return x?(x.innerText||x.textContent||'').trim():'';}),prix:C.map(function(e){const x=e.querySelector('.fnP');return x?(x.innerText||x.textContent||'').trim():'';}),t:(document.getElementById('garage')||{}).innerText||'',tout:!!(st&&st.querySelector('.fnTout'))};})()");
      console.log('  (vu) boutique du jour : ' + S.cles.map((k, i) => k + ' ' + S.noms[i] + ' ' + S.prix[i]).join(' · ').slice(0, 700));
      dit(b && S.n >= 6, 'la boutique du garage s\'ouvre sur sa vitrine du jour (' + S.n + ' cartes)', S.n);
      dit(S.noms.every(x => x) && S.prix.every(x => x && !/NaN|undefined/.test(x)), 'vitrine du jour : aucune carte vide, aucun prix cassé', [S.noms, S.prix]);
      dit(!S.cles.some(k => /^v:/.test(k) && IDX.indexOf(+k.slice(2)) >= 0) && !cite(S.t).length, 'vitrine du jour : aucune des quatre', S.cles);
      if (S.tout) { await c.ev(clic('#gStrip .fnTout')); await dormir(3500);
        const T = await c.ev("(function(){const g=document.getElementById('garage'),st=document.getElementById('gStrip');const C=st?[].slice.call(st.children):[];return {t:g?g.innerText:'',n:C.length,vides:C.filter(function(e){return !(e.innerText||e.textContent||'').trim()&&!e.querySelector('img,canvas,i');}).length};})()");
        dit(T.n > 0 && !cite(T.t).length, 'boutique « tout » (onglet VOITURES, ' + T.n + ' cases) : aucune des quatre', cite(T.t));
        dit(!T.vides, 'boutique « tout » : aucune case vide', T.vides);
        await photo(c, 'neuf-boutique-tout');
      } else console.log('  (vu) pas de lien « tout » dans la vitrine : page non regardée');
      await c.ev(clic('#gHomeBas')) || await c.ev(clic('#gClose')); await dormir(3000);
    }
    const chezSoi = await c.ev("(function(){const g=document.getElementById('garage');return !(g&&g.classList.contains('on'));})()");
    if (!chezSoi) { console.log('  (vu) le garage ne s\'est pas refermé au bouton : la partie de 30 s part du garage'); }
    await partie(c, 'neuf');
  });
  await unCas('chat (possédait CHAT POP-TART et LA PIZZA EXPRESS, roulait en chat)', CAID, P_CDP + 1, async c => {
    const e = await c.ev("(function(){const e=window.dbgAchats&&dbgAchats.etat?dbgAchats.etat():null;return e?{owned:e.owned,save:e.save}:null;})()");
    const s = (e && e.save) || {};
    dit(e && e.owned.indexOf(9) < 0 && e.owned.indexOf(19) < 0, 'CHAT POP-TART et LA PIZZA EXPRESS sortent du garage (owned)', e && e.owned);
    dit(s.equipped === 0, 'il roulait en CHAT POP-TART : la sauvegarde réécrite dit LA HONTE (index 0)', s.equipped);
    dit(s.bank === 1000, 'banque inchangée : 1 000 $ (rien n\'a été payé, rien n\'est rendu)', s.bank);
    const nomMenu = await c.ev("(function(){try{return window.dbgSpec?JSON.stringify(dbgSpec(0)):'';}catch(e){return '';}})()");
    const vu = await c.ev("window.__vuRemb||''");
    console.log('  (vu) message à l\'écran : « ' + String(vu).replace(/\s+/g, ' ').trim() + ' »');
    dit(!/REMBOURS/.test(plat(vu)), 'aucun remboursement annoncé', vu);
    await photo(c, 'caid-accueil');
    /* au garage : la caisse montrée à l'ouverture est LA HONTE */
    const ouv = await c.ev(clic('[data-m="garage"]')); let n0 = '';
    for (let i = 0; i < 40 && !n0; i++) { await dormir(500); n0 = await c.ev("(function(){const g=document.getElementById('garage');return (g&&g.classList.contains('on')&&(document.getElementById('gName')||{}).textContent)||'';})()"); }
    await dormir(1500); n0 = await c.ev("(document.getElementById('gName')||{}).textContent||''");
    dit(ouv && plat(n0).indexOf('LA HONTE') >= 0, 'au garage, sa caisse est LA HONTE', n0);
    await c.ev(clic('#gHomeBas')) || await c.ev(clic('#gClose')); await dormir(3000);
    await partie(c, 'caïd');
    const e2 = await c.ev("(function(){const e=window.dbgAchats&&dbgAchats.etat?dbgAchats.etat():null;return e&&e.save?{eq:e.save.equipped,owned:e.save.owned,bank:e.save.bank}:null;})()");
    dit(e2 && e2.eq === 0 && e2.owned.indexOf(9) < 0 && e2.owned.indexOf(19) < 0 && e2.bank >= 1000, 'après la partie : toujours LA HONTE, les deux pas revenues', e2);
  });
  srv.close();
  console.log(ko ? 'BANC KO' : 'BANC OK'); process.exit(ko ? 1 : 0);
})();
