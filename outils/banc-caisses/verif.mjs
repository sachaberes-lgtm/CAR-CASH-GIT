// SANS TOUT CASSER (2026-10-17, session ELDORADO) : le jeu démarre sans erreur, menu → JOUER → course (pilote automatique 6 s), la
// caisse choisie équipée — téléphone couché (844 × 390), debout (390 × 844), et dans le CADRE DE L'ORDI (1280 × 800 : l'iframe, JOUER
// touché par un vrai clic de souris à travers le zoom). Écrit verif-<mode>-menu.png / -course.png et verif.json dans le dossier courant.
//   node outils/banc-caisses/verif.mjs [couche|debout|ordi …]      env : PORT (le jeu servi, défaut 9377) · CAISSE (index, défaut 1)
import fs from 'node:fs';
import { lance, prepare, charge, passeSplash, sleep } from './cdp.mjs';
const MODES = process.argv.slice(2).length ? process.argv.slice(2) : ['couche', 'debout', 'ordi'];
const B = `http://127.0.0.1:${process.env.PORT || 9377}/index.html`, I = (process.env.CAISSE || 1) | 0;
const res = {};
for (const m of MODES) {
  const [w, h] = m === 'debout' ? [390, 844] : m === 'ordi' ? [1280, 800] : [844, 390];
  const c = await lance({ port: 9481, w, h, dpr: 2 });
  const r = res[m] = {};
  try {
    await prepare(c, { equipped: I });
    if (m === 'ordi') {
      // le cadre de l'ordi : la page montre le jeu dans une iframe ; on pilote l'iframe (même origine)
      await c.send('Page.navigate', { url: B });
      const F = `(document.querySelector('iframe')&&document.querySelector('iframe').contentWindow)`; // ⚠ entre parenthèses : sans elles, `fr.width/${F}.innerWidth` se lisait (fr.width/iframe)&&innerWidth
      for (let i = 0; i < 120; i++) { await sleep(500); if (await c.ev(`!!(${F}&&${F}.__gameReady&&${F}.dbgState)`)) break; }
      r.pret = await c.ev(`!!(${F}&&${F}.__gameReady)`);
      r.equipe = await c.ev(`${F}.dbgEquipe(${I})`);
      // le splash de l'iframe : un clic au centre de l'iframe, au rythme d'un doigt (600 ms)
      const rc = await c.ev(`(()=>{const f=document.querySelector('iframe').getBoundingClientRect();return [f.left+f.width/2,f.top+f.height/2];})()`);
      for (let i = 0; i < 20; i++) {
        const la = await c.ev(`(()=>{const d=${F}.document,s=d.getElementById('splash');if(!s)return 0;const cs=${F}.getComputedStyle(s);return (cs.display!=='none'&&cs.visibility!=='hidden'&&+cs.opacity>.05)?1:0;})()`);
        if (!la) break; await c.clic(rc[0], rc[1]); await sleep(600);
      }
      await sleep(2500);
      // JOUER : un vrai clic de souris sur le bouton, à travers le zoom du cadre (l'iframe est en CSS zoom : son rectangle est déjà zoomé)
      const pos = await c.ev(`(()=>{const f=document.querySelector('iframe'),fr=f.getBoundingClientRect(),b=${F}.document.querySelector('[data-m="play"]');if(!b)return null;const br=b.getBoundingClientRect(),k=fr.width/${F}.innerWidth;return [fr.left+(br.left+br.width/2)*k,fr.top+(br.top+br.height/2)*k];})()`);
      r.jouerVu = !!pos; r.clics = 0;
      for (let t = 0; t < 3 && pos; t++) { await c.clic(pos[0], pos[1]); r.clics++; let ok = false;
        for (let i = 0; i < 40; i++) { await sleep(500); if (await c.ev(`(()=>{const s=${F}.dbgState();return s.started&&!s.gameOver})()`)) { ok = true; break; } }
        if (ok) break; }
      await c.ev(`${F}.dbgAuto(1,0)`);
      await sleep(6000);
      r.etat = await c.ev(`(()=>{const s=${F}.dbgState();return {started:s.started,gameOver:s.gameOver,mode:s.mode,caisse:${F}.dbgSpec(${F}.dbgState().level)&&${F}.dbgSpec(${F}.dbgState().level).name,loopErr:String(${F}.__loopErr||'')};})()`);
      await c.photo(`verif-${m}-course.png`);
    } else {
      await charge(c, B + '?colonne=0'); r.pret = true;
      await passeSplash(c, w, h); await sleep(2000);
      r.equipe = await c.ev(`dbgEquipe(${I})`); await sleep(800);
      await c.photo(`verif-${m}-menu.png`);
      const pos = await c.ev(`(()=>{const b=document.querySelector('[data-m="play"]');if(!b)return null;const r=b.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2];})()`);
      r.jouerVu = !!pos; if (pos) await c.clic(pos[0], pos[1]);
      for (let i = 0; i < 120; i++) { await sleep(500); if (await c.ev(`(function(){var s=dbgState();return s.started&&!s.gameOver})()`)) break; }
      await c.ev('dbgAuto(1,0)');
      await sleep(6000);
      r.etat = await c.ev(`(()=>{const s=dbgState();return {started:s.started,gameOver:s.gameOver,mode:s.mode,caisse:dbgSpec(s.level)&&dbgSpec(s.level).name,loopErr:String(window.__loopErr||'')};})()`);
      await c.photo(`verif-${m}-course.png`);
    }
  } catch (e) { r.exception = String(e.message || e); }
  finally { r.erreurs = c.erreurs.slice(0, 12); await c.fin(); }
  console.log(m, JSON.stringify(r));
}
fs.writeFileSync('verif.json', JSON.stringify(res, null, 1));
