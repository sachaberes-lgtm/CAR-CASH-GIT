/* LE BANC DU LOT « DÉFIS POSSIBLES » (2026-11-21) — Chrome sans fenêtre, MUET (--mute-audio, sfx/mus/vox à false), téléphone émulé (?tel=1&appareil=iPhone14,2).
   Une page neuve par cas, de vrais touchers (Input.dispatchTouchEvent) sur les vrais boutons :
     · « neuve » : un compte neuf (auto-école passée, rien d'autre) ; BLANC NEIGE s'affiche PAYANT (60 000, l'argent du jeu, pas d'euros), IL TE MANQUE tant que la banque est vide ; la banque reçoit
       100 000 (dbgSolde) → ACHETER débite 60 000, la peinture est à toi et ÉQUIPÉE ; JOUER : la course part, BLANC NEIGE toujours équipée ;
     · « possédée » : une sauvegarde qui a DÉJÀ BLANC NEIGE (équipée), un compteur de glacier à 7, une mission verglas100 RÉUSSIE non récupérée, lac10 en cours :
       elle reste à toi et équipée, la banque ne bouge pas, le compteur reste à 7, verglas100 reste affichée (à récupérer), lac10 quitte la liste ;
     · « missions » : l'écran MISSIONS de l'atelier ouvert (vraie touche) : aucune mission du glacier, aucun défi de peinture impossible dans la liste des données ;
     · 0 exception dans chaque page.
   ⚠ UN Chrome à la fois : lancer sous ~/cash-car/verrou-banc.sh prendre "<qui>" … rendre. Le profil Chrome est effacé à la fin.
   node outils/defis-possibles/banc.cjs [--http 9991] [--cdp 9992] [--photos <dossier>]     Dernière ligne : BANC OK / BANC KO. */
const fs = require('fs'), path = require('path');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir, tmp } = require('../banc-trainees/cdp.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.resolve(path.join(__dirname, '..', '..', 'VERSION PRINCIPALE'));
const P_HTTP = +(A.http || 9991), P_CDP = +(A.cdp || 9992);
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const J = o => JSON.stringify(o);
const MUET = { sfx: false, mus: false, vox: false };
let ko = 0;
const dit = (c, m, d) => { if (c) console.log('  ok  ' + m); else { ko++; console.log('  KO  ' + m + (d !== undefined ? ' — ' + J(d).slice(0, 500) : '')); } };
const NE = Date.now() - 40 * 864e5;
const NEUVE = { v: 2, ...MUET, tuto: 1, permis: 1, bienv: 1 }; /* un compte neuf, l'auto-école passée (sinon le premier toucher lance la leçon) : rien d'autre */
const POSSEDEE = { v: 2, ...MUET, gamme: 3, eco: 3, tuto: 1, permis: 1, bienv: 1, best: 9000, bank: 12345, aura: 100, owned: [0], equipped: 0,
  ex: { eng: 6, tricks: 40, gaps: 3, bumps: 9, zones: 2, chain: 12, kmh: 300, surv: 0, runs: 25, floor: 0 },
  shop: { own: ['peinture:neige'], eq: { peinture: 'neige', aile: 'panneaux', trainee: 'nitro' } }, prof: { ne: NE, tA: 3600, dMax: 120 },
  m2: { v: 1, vc: 1, vr: 1, ok: ['verglas100'], pr: [], su: [], mq: [], nv: [], fl: [], vu: {}, r: { lac: 7 }, c: { morts: 3, gagne: 20000, jours: 4, jd: '2026-11-17', cartes: ['nuages', 'banquise'], cartesP: [], rejoue: 0, verglasKm: 150, sc: { glacier: 7, neige: 3, tri_voitures: 1 }, pg: ['neige'] } } };

async function unCas(nom, ls, port, faire) {
  const prof = tmp(); const { ch, pg } = await lanceChrome(port, prof, 390, 844);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok; const err = [];
  c.ws.addEventListener('message', e => { try { const m = JSON.parse(e.data);
    if (m.method === 'Runtime.exceptionThrown') err.push('exception: ' + ((m.params.exceptionDetails.exception && m.params.exceptionDetails.exception.description) || m.params.exceptionDetails.text || '').slice(0, 300));
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') err.push('error: ' + m.params.args.map(a => a.value || a.description || '').join(' ').slice(0, 300)); } catch (x) {} });
  console.log('— ' + nom);
  try {
    await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Network.enable');
    await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
    await c.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true, screenWidth: 390, screenHeight: 844 });
    await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' });
    await c.send('Emulation.setEmulatedMedia', { features: [{ name: 'hover', value: 'none' }, { name: 'pointer', value: 'coarse' }] });
    const L = { cashcarSave: J(ls || { v: 2, ...MUET }) };
    await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{if(!sessionStorage.getItem("__fx")){sessionStorage.setItem("__fx","1");localStorage.clear();var L=' + J(L) + ';for(var k in L)localStorage.setItem(k,L[k]);}}catch(e){}' });
    await c.send('Page.navigate', { url: `http://127.0.0.1:${P_HTTP}/index.html?tel=1&appareil=iPhone14,2&colonne=0&simu=1&garde=1&intro=ancien&attente=0` });
    let pret = false; for (let i = 0; i < 160 && !pret; i++) { await dormir(500); try { pret = await c.ev("!!window.__gameReady&&document.getElementById('mHome').classList.contains('on')", 8000); } catch (x) {} }
    dit(pret, nom + ' : le jeu arrive à l\'accueil');
    if (pret) { await dormir(9000); /* l'accueil se pose (la chute du menu, le voile) avant le premier toucher */ await faire(c); }
    const graves = err.filter(x => !/favicon|404|Failed to load resource|WebGL|GPU stall|ReadPixels|AudioContext|autoplay/i.test(x));
    dit(!graves.length, nom + ' : aucune exception ni erreur console', graves.slice(0, 6));
  } catch (e) { ko++; console.log('  KO  ' + nom + ' : ' + String(e).slice(0, 300)); }
  finally { try { c.close(); } catch (x) {} tueChrome(ch); await dormir(800); try { fs.rmSync(prof, { recursive: true, force: true }); } catch (x) {} }
}
/* un vrai toucher au centre (ou fx, fy) du premier élément visible du sélecteur */
async function touche(c, sel, fx, fy) {
  const r = await c.ev(`(function(){const e=document.querySelector(${J(sel)});if(!e)return null;const b=e.getBoundingClientRect();if(b.width<1||b.height<1)return null;return [b.left+b.width*${fx == null ? .5 : fx},b.top+b.height*${fy == null ? .5 : fy}];})()`);
  if (!r) return false;
  await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: r[0], y: r[1] }] }); await dormir(60);
  await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); return true;
}
/* le plus PETIT élément visible de `racine` dont le texte est `mot` (le libellé lui-même : un bouton en L comme BOUTIQUE a son centre ailleurs) — marqué pour touche() */
const PAR_TEXTE = (racine, mot) => `(function(){const L=[...document.querySelectorAll(${J(racine)}+' *')].filter(function(e){const b=e.getBoundingClientRect();return b.width>1&&b.height>1&&(e.innerText||'').replace(/\\s+/g,' ').trim()===${J(mot)}&&getComputedStyle(e).visibility!=='hidden';});
  if(!L.length)return false;L.sort(function(a,b){const x=a.getBoundingClientRect(),y=b.getBoundingClientRect();return x.width*x.height-y.width*y.height;});document.querySelectorAll('[data-banc]').forEach(function(e){e.removeAttribute('data-banc');});L[0].setAttribute('data-banc',${J(mot)});return true;})()`;
async function attend(c, expr, ms) { for (let t = 0; t < ms; t += 300) { try { if (await c.ev(expr)) return true; } catch (x) {} await dormir(300); } return false; }
const etat = c => c.ev("(function(){const e=dbgAchats.etat();return {bank:dbgSolde({}).banque,own:e.own,eq:e.eq,m2:e.save.m2};})()"); /* la banque VIVANTE (SAVE.d), pas la copie de localStorage (écrite au prochain flush) */
const photo = async (c, n) => { if (!A.photos) return; fs.mkdirSync(A.photos, { recursive: true }); const r = await c.send('Page.captureScreenshot', { format: 'png' }); fs.writeFileSync(path.join(A.photos, n + '.png'), Buffer.from(r.data, 'base64')); };
const VISIBLE = s => `(function(){const e=document.querySelector(${J(s)});if(!e)return false;const b=e.getBoundingClientRect();return b.width>1&&b.height>1;})()`;
/* ⚠ JAMAIS dbgJouer() ici : ce crochet APPUIE sur JOUER (il appelle classiqueJouer) — l'état se lit par #garage.on et dbgState() */
const GARAGE_ON = "(function(){const g=document.getElementById('garage');return !!(g&&g.classList.contains('on'));})()";
const COURSE = "(function(){const s=dbgState();return !!(s.started&&!s.gameOver);})()";
async function ouvreGarage(c, mot) {
  await photo(c, 'garage-avant-' + mot);
  if (!await touche(c, '#mHome [data-m=garage]')) return false;
  return attend(c, GARAGE_ON + '&&' + PAR_TEXTE('#garage', mot), 15000);
}
async function versBoutiquePeintures(c) {
  dit(await ouvreGarage(c, 'BOUTIQUE'), 'toucher GARAGE');
  dit(await attend(c, GARAGE_ON + '&&' + PAR_TEXTE('#garage', 'BOUTIQUE'), 15000), 'l\'atelier s\'ouvre (BOUTIQUE visible)');
  await dormir(2500); await c.ev(PAR_TEXTE('#garage', 'BOUTIQUE')); dit(await touche(c, '[data-banc="BOUTIQUE"]'), 'toucher BOUTIQUE');
  dit(await attend(c, VISIBLE('#gBqCats button[data-c=peinture]'), 15000), 'la boutique s\'ouvre (rayon PEINTURES visible)');
  await dormir(1200); dit(await touche(c, '#gBqCats button[data-c=peinture]'), 'toucher PEINTURES');
  dit(await attend(c, VISIBLE('#gBqPan [data-k="peinture:neige"]') + '||' + "(function(){const e=document.querySelector('#gBqPan [data-k=\"peinture:neige\"]');if(e)e.scrollIntoView({block:'center',inline:'center'});return false;})()", 10000), 'la pastille BLANC NEIGE est dans le rayon');
  await c.ev("(function(){const e=document.querySelector('#gBqPan [data-k=\"peinture:neige\"]');if(e)e.scrollIntoView({block:'center',inline:'center'});return 1;})()"); await dormir(800);
  dit(await touche(c, '#gBqPan [data-k="peinture:neige"]'), 'toucher BLANC NEIGE'); await dormir(2500);
}
const bouton = c => c.ev("(function(){const b=document.getElementById('gBqBtn');return b?b.innerText.replace(/\\s+/g,' ').trim():null;})()");

(async () => {
  for (const p of [P_HTTP, P_CDP, P_CDP + 1, P_CDP + 2]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  const srv = await serveur(JEU, P_HTTP);
  await unCas('neuve (compte neuf, auto-école passée)', NEUVE, P_CDP, async c => {
    const n0 = await c.ev("JSON.stringify({neige:dbgAchats.nuance('neige'),mc:dbgAchats.nuance('montecarlo'),camo:dbgAchats.nuance('camo'),bloc:dbgAchats.nuance('bloc'),pNeige:dbgAchats.produitDe('peinture:neige')||null})");
    const n = JSON.parse(n0);
    dit(n.neige && n.neige.c === 'pc' && /60\D?000/.test(n.neige.t), 'BLANC NEIGE : prix en argent du jeu, 60 000', n.neige);
    dit(['mc', 'camo', 'bloc'].every(k => n[k] && n[k].c === 'pc' && /180\D?000/.test(n[k].t)), 'MONTE-CARLO, CAMOUFLAGE, BLOC D\'HERBE : 180 000 en argent du jeu', n);
    dit(!n.pNeige, 'aucun produit App Store pour BLANC NEIGE (pas d\'euros)', n.pNeige);
    await versBoutiquePeintures(c);
    const b0 = await bouton(c); dit(/IL TE MANQUE/.test(b0 || ''), 'banque vide : le bouton dit IL TE MANQUE', b0);
    await photo(c, 'neuve-manque');
    await c.ev('dbgSolde({banque:100000});1'); await dormir(1500);
    const b1 = await bouton(c); dit(/ACHETER/.test(b1 || '') && /60\D?000/.test(b1 || ''), 'banque 100 000 : le bouton dit ACHETER 60 000', b1);
    await photo(c, 'neuve-acheter');
    const e0 = await etat(c);
    dit(await touche(c, '#gBqBtn'), 'toucher ACHETER'); await dormir(2500);
    const e1 = await etat(c);
    dit(e0.bank - e1.bank === 60000, 'la banque est débitée de 60 000', [e0.bank, e1.bank]);
    dit(e1.own.indexOf('peinture:neige') >= 0, 'BLANC NEIGE est à toi (shop.own)', e1.own);
    dit(e1.eq.peinture === 'neige', 'BLANC NEIGE est équipée', e1.eq);
    const b2 = await bouton(c); dit(/DESEQUIPER|DÉSÉQUIPER/.test(b2 || ''), 'le bouton dit DÉSÉQUIPER', b2);
    await photo(c, 'neuve-achetee');
    /* JOUER depuis la boutique : la course part */
    dit(!await c.ev(COURSE), 'avant JOUER : pas de course en cours');
    const jouer = await c.ev("(function(){const L=[...document.querySelectorAll('button,[data-m=play],.pbtn')].filter(e=>/JOUER/.test((e.innerText||'').replace(/\\s+/g,''))&&e.getBoundingClientRect().width>1);if(!L.length)return null;const e=L[L.length-1];e.setAttribute('data-banc-jouer','1');return e.id||e.className;})()");
    dit(!!jouer && await touche(c, '[data-banc-jouer="1"]'), 'toucher JOUER', jouer);
    const part = await attend(c, COURSE + '&&!' + GARAGE_ON, 25000);
    dit(part, 'la course part', await c.ev('JSON.stringify(dbgState())'));
    await dormir(4000); const e2 = await etat(c);
    dit(e2.eq.peinture === 'neige', 'en course, BLANC NEIGE toujours équipée', e2.eq);
    await photo(c, 'neuve-course');
  });
  await unCas('possédée (BLANC NEIGE déjà à toi, compteur du glacier à 7, verglas100 réussie, lac10 en cours)', POSSEDEE, P_CDP + 1, async c => {
    const e = await etat(c);
    dit(e.own.indexOf('peinture:neige') >= 0 && e.eq.peinture === 'neige', 'BLANC NEIGE reste à toi et équipée', [e.own, e.eq]);
    dit(e.bank === 12345, 'la banque ne bouge pas (rien de remboursé, rien de repris)', e.bank);
    dit(e.m2 && e.m2.c && e.m2.c.sc && e.m2.c.sc.glacier === 7 && e.m2.c.verglasKm === 150 && e.m2.r.lac === 7, 'les compteurs du glacier restent dans la sauvegarde', e.m2 && { sc: e.m2.c.sc, verglasKm: e.m2.c.verglasKm, lac: e.m2.r.lac });
    const M = JSON.parse(await c.ev("JSON.stringify(dbgMissions().map(m=>({id:m.id,au:m.auGarage,ok:m.reussie,pr:m.prise})))"));
    const v = M.find(m => m.id === 'verglas100'), l = M.find(m => m.id === 'lac10');
    dit(v && v.au && v.ok && !v.pr, 'verglas100 réussie avant : toujours là, sa récompense attend', v);
    dit(l && !l.au, 'lac10 (le lac gelé du glacier) quitte la liste', l);
    const n = await c.ev("JSON.stringify(dbgAchats.nuance('neige'))"); dit(/"c":"eq"/.test(n), 'la pastille dit ÉQUIPÉE', n);
  });
  await unCas('missions (l\'écran MISSIONS ouvert)', NEUVE, P_CDP + 2, async c => {
    dit(await ouvreGarage(c, 'MISSIONS'), 'toucher GARAGE');
    dit(await attend(c, GARAGE_ON + '&&' + PAR_TEXTE('#garage', 'MISSIONS'), 15000), 'l\'atelier s\'ouvre (MISSIONS visible)');
    await dormir(2500); await c.ev(PAR_TEXTE('#garage', 'MISSIONS')); dit(await touche(c, '[data-banc="MISSIONS"]'), 'toucher MISSIONS'); await dormir(5000);
    const t = await c.ev("document.body.innerText||''");
    dit(t.length > 200, 'l\'écran MISSIONS est ouvert (' + t.length + ' caractères)', t.slice(0, 300));
    const mot = /GLACIER|VERGLAS|LAC GEL|FOR[ÊE]T|MER DE JADE/i.exec(t);
    dit(!mot, 'aucune mission ni défi du glacier, de la forêt ou de la mer de Jade à l\'écran', mot && t.slice(Math.max(0, mot.index - 80), mot.index + 80));
    await photo(c, 'missions');
    const D = JSON.parse(await c.ev("JSON.stringify(dbgDefisPeint().map(d=>d.id))"));
    dit(['neige', 'montecarlo', 'camo', 'bloc'].every(id => D.indexOf(id) < 0), 'les défis de peinture listés n\'ont plus BLANC NEIGE, MONTE-CARLO, CAMOUFLAGE ni BLOC D\'HERBE', D);
    const M = JSON.parse(await c.ev("JSON.stringify(dbgMissions().filter(m=>m.auGarage).map(m=>m.id))"));
    dit(M.indexOf('verglas100') < 0 && M.indexOf('lac10') < 0, 'verglas100 et lac10 absentes des missions affichables', M);
  });
  srv.close();
  console.log(ko ? 'BANC KO' : 'BANC OK'); process.exit(ko ? 1 : 0);
})();
