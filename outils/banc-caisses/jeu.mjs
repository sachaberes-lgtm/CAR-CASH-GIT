// UNE CAISSE DANS LE VRAI JEU (2026-10-17, session ELDORADO) — les vues qui comptent pour le joueur : l'accueil (la caisse vue de
// DESSUS), le garage (trois-quarts avant, trois-quarts arrière, profil ; HUD masqué), la boutique (`dbgBqVoir`), la course (la caméra
// de POURSUITE : on voit surtout l'ARRIÈRE et le DESSUS). Carte « nuages », météo « midi » : la même lumière d'une prise à l'autre.
//
//   node outils/banc-caisses/jeu.mjs <dossier> [index de la caisse, défaut 1 = ELDORADO]    env : PORT (le jeu servi, défaut 9377)
// Prendre l'AVANT avant de toucher au gabarit (ou sur une copie intacte de main), l'APRÈS ensuite, puis planche.mjs.
import fs from 'node:fs';
import { lance, prepare, charge, passeSplash, sleep } from './cdp.mjs';

const [, , dos, idx = '1'] = process.argv;
const I = idx | 0;
fs.mkdirSync(dos, { recursive: true });
const BASE = `http://127.0.0.1:${process.env.PORT || 9377}/index.html?colonne=0&carte=nuages&meteo=midi`;
const NU = `(function(){var g=null;document.querySelectorAll('body>canvas').forEach(function(x){if(!g||x.width*x.height>g.width*g.height)g=x;});
  g.id=g.id||'ccGL';var s=document.getElementById('cc-nu');if(!s){s=document.createElement('style');s.id='cc-nu';document.body.appendChild(s);}
  s.textContent='body>*:not(#'+g.id+'){opacity:0!important;transition:none!important}';})()`;
const VU = `(function(){var s=document.getElementById('cc-nu');if(s)s.textContent='';})()`;
const log = (...a) => console.log(...a);

{ // 1. accueil, garage, boutique
  const c = await lance({ port: 9478 });
  try {
    await prepare(c);
    await charge(c, BASE); await passeSplash(c); await sleep(2000);
    log('équipe', await c.ev(`dbgEquipe(${I})`)); await sleep(2500);
    await c.photo(`${dos}/accueil.png`);
    await c.ev(`document.querySelector('[data-m=garage]').click()`); await sleep(3500);
    await c.ev(NU);
    for (const [nom, a] of [['garage-avant', -0.55], ['garage-arriere', 2.55], ['garage-profil', 1.0]]) {
      await c.ev(`dbgGarage(${a},0.22,6.2,0)`); await sleep(1600); await c.photo(`${dos}/${nom}.png`);
    }
    await c.ev(VU);
    const ok = await c.ev(`(()=>{const b=[...document.querySelectorAll('button,[role=button],[data-m]')].find(x=>x.offsetParent&&/BOUTIQUE/.test(x.textContent||''));if(b){b.click();return true;}return false;})()`);
    await sleep(3500);
    log('boutique', ok, await c.ev(`dbgBqVoir(${I})`)); await sleep(3000);
    await c.photo(`${dos}/boutique.png`);
    if (c.erreurs.length) log('ERREURS PAGE (menus)', c.erreurs.slice(0, 10));
  } finally { await c.fin(); }
}
{ // 2. la course, pilote automatique au milieu de la route
  const c = await lance({ port: 9479 });
  try {
    await prepare(c, { equipped: I });
    await charge(c, BASE); await passeSplash(c); await sleep(2000);
    log('équipe', await c.ev(`dbgEquipe(${I})`)); await sleep(1000);
    await c.ev(`document.querySelector('[data-m="play"]').click()`);
    for (let i = 0; i < 120; i++) { await sleep(500); if (await c.ev(`(function(){var s=dbgState();return s.started&&!s.gameOver})()`)) break; }
    await c.ev('dbgAuto(1,0)');
    await sleep(5000); await c.photo(`${dos}/course-hud.png`);
    await c.ev(NU); await sleep(2500); await c.photo(`${dos}/course-poursuite.png`);
    await sleep(3000); await c.photo(`${dos}/course-poursuite2.png`);
    log('état', await c.ev(`(()=>{const s=dbgState();return {mode:s.mode,gameOver:s.gameOver,err:String(window.__loopErr||'')}})()`));
    if (c.erreurs.length) log('ERREURS PAGE (course)', c.erreurs.slice(0, 10));
  } finally { await c.fin(); }
}
