// BANC DE L'ÉCRAN MISSIONS (2026-10-22) — le vrai jeu, Chrome sans fenêtre et muet (pilote de banc-caisses/cdp.mjs), l'écran MISSIONS photographié
// dans un état « vide » et un état « riche » (récompenses à récupérer, deux suivies, série en cours).
//   node outils/banc-missions/missions.mjs <dossier> [--w 844 --h 390] [--css fichier.css] [--port 9391] [--jeu 9392]
// Le jeu est servi par ce script (python3 -m http.server sur --jeu), tué à la sortie. Un banc à la fois : verrou-banc.sh.
import fs from 'node:fs';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { lance, prepare, charge, passeSplash, sleep } from '../banc-caisses/cdp.mjs';

const a = process.argv.slice(2);
const dos = a[0];
const opt = (k, d) => { const i = a.indexOf('--' + k); return i >= 0 ? a[i + 1] : d; };
const W = +opt('w', 844), H = +opt('h', 390), css = opt('css', ''), port = +opt('port', 9391), jeu = +opt('jeu', 9392), dpr = +opt('dpr', 2);
const seul = opt('seul', '');
fs.mkdirSync(dos, { recursive: true });
const srv = spawn('python3', ['-m', 'http.server', String(jeu), '--bind', '127.0.0.1'], { cwd: fileURLToPath(new URL('../../VERSION PRINCIPALE', import.meta.url)), stdio: 'ignore', detached: true });
const tue = () => { try { process.kill(-srv.pid, 'SIGKILL'); } catch (e) {} };
process.on('exit', tue); process.on('SIGINT', () => { tue(); process.exit(1); });
await sleep(800);
const BASE = `http://127.0.0.1:${jeu}/index.html?colonne=0&garde=1&carte=nuages&meteo=midi`;
const log = (...x) => console.log(...x);
const land = W > H;

async function ouvre(c, riche) {
  await prepare(c, { ex: { runs: 5 } });
  await charge(c, BASE); await passeSplash(c, W, H); await sleep(2500);
  if (riche) {
    const r = await c.ev(`(function(){
      var L=dbgMissions(),n=0,ids=[];
      L.forEach(function(m){if(n<3&&m.famille!=='secret'&&m.recompense&&m.recompense.cash&&!m.reussie){ids.push(m.id);n++;}});
      ids.forEach(function(id){dbgMissions('gagne',id);});
      try{dbgSerie('jour',2);}catch(e){}
      return ids;})()`);
    log('gagnées', r);
  }
  await c.ev(`document.querySelector('[data-m=garage]').click()`); await sleep(3500);
  await c.ev(`(function(){var b=document.getElementById('gvMis')||document.querySelector('.ghT[data-h="mis"]');if(!b)throw new Error('porte missions introuvable');b.click();})()`);
  await sleep(3500);
  if (css) await c.ev(`(function(){var s=document.createElement('style');s.id='cc-test';s.textContent=${JSON.stringify(fs.readFileSync(css, 'utf8'))};document.head.appendChild(s);})()`);
  await sleep(1200);
  if (riche) { // deux missions suivies : un toucher sur les deux premières lignes qui ne sont ni prêtes ni finies
    const n = await c.ev(`(function(){var R=[].slice.call(document.querySelectorAll('#gmListe .m2L:not(.pret):not(.ok)')).slice(0,2);R.forEach(function(r){r.click();});return R.length;})()`);
    log('suivies', n); await sleep(1500);
  }
}

const etats = seul ? [seul] : ['vide', 'riche', 'actes'];
for (const e of etats) {
  const c = await lance({ port, w: W, h: H, dpr });
  try {
    await c.send('Emulation.setSafeAreaInsetsOverride', land ? { insets: { left: 47, right: 47, bottom: 21, top: 0 } } : { insets: { left: 0, right: 0, bottom: 34, top: 47 } }).catch(() => {});
    await ouvre(c, e === 'riche' || e === 'actes');
    if (e === 'actes') { // récupérer, déplier les TERMINÉES, toucher la série, le défi du jour éteint
      const q = `(function(){var L=document.querySelectorAll('#gmListe .m2L');return {pret:document.querySelectorAll('#gmListe .m2L.pret').length,suivies:document.querySelectorAll('#gmListe .m2L.f').length,lignes:L.length,fin:!!document.querySelector('#gmListe .m2Fin'),serie:!!document.querySelector('#gmListe .m2Serie'),dj:document.querySelectorAll('#gmListe .m2Dj,.m2Tag').length,chips:document.querySelectorAll('#gmListe .m2Ch').length,sous:document.getElementById('gmSous').textContent,defi:(typeof dbgDefiJour==='function')?dbgDefiJour():'absent'};})()`;
      log('avant', JSON.stringify(await c.ev(q)));
      const bank0 = await c.ev(`(function(){try{return dbgState().bank}catch(e){return null}})()`);
      await c.ev(`document.querySelector('#gmListe .m2L.pret').click()`); await sleep(1400);
      log('après récupère', JSON.stringify(await c.ev(q)), 'banque', bank0, '→', await c.ev(`(function(){try{return dbgState().bank}catch(e){return null}})()`));
      await c.ev(`document.querySelector('#gmListe .m2Fin').click()`); await sleep(900);
      log('terminées dépliées', await c.ev(`!!document.querySelector('#gmListe .m2FinL')`));
      await c.ev(`document.querySelector('#gmListe .m2Serie').click()`); await sleep(500);
      log('toast', await c.ev(`(function(){var t=document.getElementById('toast');return t?t.textContent:'(pas de #toast)';})()`));
      await c.ev(`(function(){var f=document.querySelector('#gmListe .m2Fin');if(f)f.scrollIntoView({block:'start'});})()`); await sleep(600);
    }
    const m = await c.ev(`(function(){var r=function(s){var e=document.querySelector(s);if(!e)return null;var b=e.getBoundingClientRect();return [Math.round(b.left),Math.round(b.top),Math.round(b.width),Math.round(b.height)];};
      var cs=getComputedStyle(document.documentElement);
      return {vp:[innerWidth,innerHeight],sL:cs.getPropertyValue('--sL'),sB:cs.getPropertyValue('--sB'),head:r('#gmHead'),bas:r('#gmBas'),home:r('#gmBas .gmHome'),jouer:r('#gmBas .gmJouer'),glA:r('#gmListe .glA'),glB:r('#gmListe .glB'),liste:r('#gmListe')};})()`);
    log(e, JSON.stringify(m));
    await c.photo(`${dos}/${land ? 'land' : 'port'}-${e}.png`);
    if (e === 'riche') { // la liste défilée jusqu'en bas
      await c.ev(`(function(){var A=document.querySelector('#gmListe .glA')||document.getElementById('gmListe');A.scrollTop=1e5;})()`); await sleep(700);
      await c.photo(`${dos}/${land ? 'land' : 'port'}-riche-bas.png`);
    }
    if (c.erreurs.length) log('ERREURS PAGE', c.erreurs.slice(0, 8));
  } finally { await c.fin(); }
}
tue();
