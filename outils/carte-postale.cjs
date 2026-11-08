// LA CARTE POSTALE DES PORTAILS (2026-11-07, Sacha : « les portails ont encore les illustrations des anciennes maps ») — retire, pour
// chaque couple map × météo (× teinte) de PCUBE_CP (rendu/portails.js), une capture FRAÎCHE de la vue du départ (dbgCartePostale) et la
// pose dans assets/portail/<clé>.webp — ce que la fenêtre du portail montre. Reprend le client CDP minimal de banc-trainees (aucune
// dépendance) : un Chrome headless (vrai GPU), sert VERSION PRINCIPALE, force la map (`?carte=&meteo=&teinte=`), lance la course
// (dbgJouer), attend que le décor soit bâti, capture.
//   node outils/carte-postale.cjs [--cles dunes-matin,banquise-nuit] [--http 9751 --cdp 9752] [--att 6000]
const fs = require('fs'), path = require('path');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir, tmp } = require('./banc-trainees/cdp.cjs');

const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.resolve(A.jeu || path.join(__dirname, '..', 'VERSION PRINCIPALE'));
const OUT = path.resolve(A.out || path.join(JEU, 'assets', 'portail'));
const P_HTTP = +(A.http || 9751), P_CDP = +(A.cdp || 9752);
const ATT = +(A.att || 6000);
// (2026-11-07) SANS CETTE SAUVEGARDE, dbgJouer() part dans L'AUTO-ÉCOLE (sfPlayOk() lit SAVE.d.tuto) : le niveau forcé par
// ?carte=&meteo= n'est alors jamais lu — posée tôt (avant chaque navigation), comme le fait banc-ecrans/photos.cjs
const SAVE_SRC = 'try{localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify({ v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, bank: 48500 })) + ')}catch(e){}';

// la liste vient du JEU LUI-MÊME (PCUBE_CP, code/rendu/portails.js) : jamais retranscrite à la main, toujours à jour
const PORTAILS_JS = fs.readFileSync(path.join(__dirname, '..', 'code', 'rendu', 'portails.js'), 'utf8');
const M_CP = /const PCUBE_CP=new Set\(\[([^\]]+)\]\)/.exec(PORTAILS_JS);
if (!M_CP) { console.error('PCUBE_CP introuvable dans portails.js'); process.exit(2); }
let CLES = M_CP[1].match(/'([^']+)'/g).map(s => s.slice(1, -1));
if (A.cles) { const d = new Set(A.cles.split(',')); CLES = CLES.filter(k => d.has(k)); }

function decompose(cle) {
  const p = cle.split('-');
  return p.length >= 3 ? { carte: p[0], meteo: p[1], teinte: p[2] } : { carte: p[0], meteo: p[1], teinte: null };
}

(async () => {
  for (const p of [P_HTTP, P_CDP]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  fs.mkdirSync(OUT, { recursive: true });
  const srv = await serveur(JEU, P_HTTP), prof = tmp();
  const { ch, pg } = await lanceChrome(P_CDP, prof, 1280, 800);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  const rapport = {};
  try {
    await c.send('Page.enable'); await c.send('Runtime.enable');
    await c.send('Network.setCacheDisabled', { cacheDisabled: true });
    await c.send('Page.addScriptToEvaluateOnNewDocument', { source: SAVE_SRC });
    for (const cle of CLES) {
      const { carte, meteo, teinte } = decompose(cle);
      // (2026-11-07) SANS `simu=1`, le SPLASH (intro-161.js, « 1.61 ») reste ~9 s dans le DOM : start() s'y refuse tant qu'il y est
      // (`if(started||document.getElementById('splash'))return;`), et pendant ce temps menuVitrine() repeint le ciel du MENU (jour)
      // PAR-DESSUS celui du niveau à chaque image (boucle-6-hud.js) — toutes les cartes « nuit » sortaient de jour. `simu=1` saute l'intro.
      const q = `pc=1&simu=1&carte=${carte}&meteo=${meteo}${teinte ? '&teinte=' + teinte : ''}&garde=1`; // pc=1 (jamais tel=1/mobile=1) évite le CADRE-COLONNE (tete.html) : le jeu démarre direct, en qualité ordi (postale = la même image pour tous)
      try {
        await c.send('Page.navigate', { url: `http://127.0.0.1:${P_HTTP}/index.html?${q}` });
        let pret = false;
        for (let i = 0; i < 120 && !pret; i++) { await dormir(500); try { pret = await c.ev("!!window.__gameReady&&typeof dbgJouer==='function'", 4000); } catch (e) {} }
        if (!pret) throw new Error('jeu jamais prêt');
        await dormir(600);
        const appel = await c.ev('JSON.stringify(dbgJouer())');
        let dmarre = false;
        for (let i = 0; i < 100 && !dmarre; i++) { await dormir(300); try { dmarre = await c.ev('!!window.dbgState().started'); } catch (e) {} }
        if (!dmarre) throw new Error('started jamais vrai (splash ?) : ' + appel);
        await dormir(ATT);
        const r = await c.ev('JSON.stringify(dbgCartePostale())', 20000);
        const d = JSON.parse(r);
        if (!d || !d.url) throw new Error('pas d\'image : ' + appel);
        if (!d.niveau || d.niveau.carte !== carte || d.niveau.meteo !== meteo || (teinte && d.niveau.teinte !== teinte)) {
          // (2026-11-07) soit la map n'existe plus dans SF_CARTES (ex. paris/vitree/volcan, retirées du tirage), soit sa
          // météo/teinte n'y est plus (sfImpose retombe sur une autre) : une entrée de PCUBE_CP hors d'atteinte pour
          // n'importe quelle partie — on la laisse telle quelle (son image reste l'ancienne), ce n'est pas un échec
          rapport[cle] = { ok: null, hors_tirage: d.niveau };
          console.log(cle, '→ hors tirage (gardée telle quelle) :', JSON.stringify(d.niveau));
          continue;
        }
        const b64 = d.url.replace(/^data:image\/\w+;base64,/, '');
        fs.writeFileSync(path.join(OUT, cle + '.webp'), Buffer.from(b64, 'base64'));
        rapport[cle] = { ok: true, niveau: d.niveau, octets: Buffer.byteLength(b64, 'base64') };
        console.log(cle, '→ ok', JSON.stringify(d.niveau));
      } catch (e) {
        rapport[cle] = { ok: false, erreur: String(e && e.message || e).slice(0, 300) };
        console.log(cle, '→ ÉCHEC', rapport[cle].erreur);
      }
    }
  } finally {
    try { c.close(); } catch (e) {}
    tueChrome(ch);
    srv.close();
  }
  fs.writeFileSync(path.join(OUT, '..', '..', '..', 'outils', 'carte-postale-rapport.json'), JSON.stringify(rapport, null, 1));
  const echecs = Object.entries(rapport).filter(([, v]) => v.ok === false);
  const horsTirage = Object.entries(rapport).filter(([, v]) => v.ok === null);
  const faites = Object.entries(rapport).filter(([, v]) => v.ok === true);
  console.log('---', faites.length, '/', CLES.length, 'cartes postales refaites,', horsTirage.length, 'hors tirage', echecs.length ? ('(' + echecs.length + ' échecs)') : '');
  process.exit(echecs.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
