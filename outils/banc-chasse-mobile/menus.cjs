/* ===== LA TOURNÉE DES MENUS (2026-11-10, chasse mobile) — pilote banc.cjs déjà lancé : accueil, puis chaque bouton de l'accueil et chaque
   bouton de l'écran ouvert (profondeur 2), au VRAI toucher ; à chaque écran : ccAudit (cibles < 44 px, hors écran, chevauchements, textes
   coupés), photo, journal (exceptions / console / réseau) ; retour par ◀ / RETOUR / ✕ ou, à défaut, rechargement.
   node outils/banc-chasse-mobile/menus.cjs --ctl 9843 --out <dossier> [--prof 2] [--saute "play,…"] */
const fs = require('fs'), path = require('path');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const CTL = 'http://127.0.0.1:' + (A.ctl || 9843), OUT = A.out || '/tmp/cm-menus'; fs.mkdirSync(OUT, { recursive: true });
const SAUTE = new Set((A.saute || 'play').split(','));
const PROF = +(A.prof || 2);
const get = async (u) => (await fetch(CTL + u)).json();
const ev = async (js) => (await fetch(CTL + '/ev', { method: 'POST', body: js })).json();
const dormir = ms => new Promise(r => setTimeout(r, ms));
const AUDIT = fs.readFileSync(path.join(__dirname, '..', 'banc-ecrans', 'audit.js'), 'utf8');
const BOUTONS = `return [...document.querySelectorAll("button,[role=button],[data-m],[data-a],.pbtn,.gTab,.ivTab")].filter(b=>{const r=b.getBoundingClientRect(),s=getComputedStyle(b);
  if(!(r.width>4&&r.height>4&&r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth&&s.visibility!=="hidden"&&s.display!=="none"&&+s.opacity>0.1&&s.pointerEvents!=="none"))return false;
  const cx=r.left+r.width/2,cy=r.top+r.height/2,h=document.elementFromPoint(Math.min(innerWidth-1,Math.max(0,cx)),Math.min(innerHeight-1,Math.max(0,cy)));return !!h&&(h===b||b.contains(h)||h.contains(b));})
  .map(b=>{const r=b.getBoundingClientRect();return {k:(b.id||"")+"|"+(b.dataset.m||b.dataset.a||"")+"|"+(b.innerText||b.getAttribute("aria-label")||"").replace(/\\s+/g," ").trim().slice(0,22),x:Math.round(r.left+r.width/2),y:Math.round(r.top+r.height/2),w:Math.round(r.width),h:Math.round(r.height)}})`;
const RETOUR = /◀|‹|←|RETOUR|BACK|✕|×|FERMER|CLOSE|OK$|^X$/i;
const rapport = { ecrans: [] };
let n = 0;
async function releve(nom) {
  await ev(AUDIT);
  const au = await ev('return ccAudit()');
  const j = await get('/journal');
  const f = path.join(OUT, String(++n).padStart(2, '0') + '-' + nom.replace(/[^a-zA-Z0-9-]+/g, '_').slice(0, 40) + '.png');
  await get('/photo?f=' + encodeURIComponent(f) + '&k=1');
  const e = { nom, photo: f, hors: au.hors, coupe: au.coupe, petits: au.taille, chevauche: au.chevauche.slice(0, 12), journal: j };
  rapport.ecrans.push(e);
  const pb = j.exceptions.length + j.erreurs.length + j.reseau.length;
  console.log(`[${nom}] hors ${au.hors.length} coupé ${au.coupe.length} <44 ${au.taille.length} chev ${au.chevauche.length} | exc ${j.exceptions.length} err ${j.erreurs.length} rés ${j.reseau.length}${pb ? ' ⚠ ' + JSON.stringify(j).slice(0, 400) : ''}`);
  return e;
}
const surAccueil = async () => (await ev(BOUTONS)).some(b => /\|play\|/.test(b.k));
async function revient(chemin) {
  for (let essai = 0; essai < 3; essai++) {
    if (await surAccueil()) return true;
    const bs = await ev(BOUTONS); const r = bs.find(b => RETOUR.test(b.k.split('|')[2]) || /retour|back|ferme|close/i.test(b.k.split('|')[0]));
    if (!r) break; await get(`/tap?x=${r.x}&y=${r.y}`); await dormir(1200);
  }
  if (await surAccueil()) return true;
  console.log('   (retour introuvable depuis', chemin, ': rechargement)');
  await get('/ouvre?q=' + encodeURIComponent(A.q || 'garde=1')); await passeIntro(); return false;
}
async function passeIntro() {
  for (let i = 0; i < 20; i++) { if (await ev('!(document.getElementById("splash")&&getComputedStyle(document.getElementById("splash")).display!=="none")')) break;
    const t = await ev('[innerWidth/2|0,innerHeight/2|0]'); await get(`/tap?x=${t[0]}&y=${t[1]}`); await dormir(2000); }
  await dormir(2500);
}
(async () => {
  if (A.ouvre) { await get('/ouvre?neuf=1&q=' + encodeURIComponent(A.q || 'garde=1')); await passeIntro(); }
  await releve('accueil');
  const racine = (await ev(BOUTONS)).filter(b => !SAUTE.has(b.k.split('|')[1]));
  for (const b of racine) {
    await get(`/tap?x=${b.x}&y=${b.y}`); await dormir(1800);
    await releve(b.k);
    if (PROF > 1) {
      const fils = (await ev(BOUTONS)).filter(f => !RETOUR.test(f.k.split('|')[2]) && !/acheter|buy|effacer|erase|reset|tout effacer|supprim|€|\$/i.test(f.k)).slice(0, +(A.max || 10));
      for (const f of fils) {
        const avant = await ev(BOUTONS); if (!avant.some(x => x.k === f.k)) continue;
        await get(`/tap?x=${f.x}&y=${f.y}`); await dormir(1300);
        await releve(b.k + ' > ' + f.k);
        /* refermer ce que le fils a ouvert sans quitter l'écran parent : un retour si l'écran a changé */
        const apres = await ev(BOUTONS); if (!apres.some(x => x.k === f.k)) { const r = apres.find(x => RETOUR.test(x.k.split('|')[2])); if (r) { await get(`/tap?x=${r.x}&y=${r.y}`); await dormir(1000); } }
      }
    }
    await revient(b.k);
  }
  fs.writeFileSync(path.join(OUT, 'rapport.json'), JSON.stringify(rapport, null, 1));
  console.log('rapport :', path.join(OUT, 'rapport.json'));
})().catch(e => { console.error('ÉCHEC', e); process.exit(1); });
