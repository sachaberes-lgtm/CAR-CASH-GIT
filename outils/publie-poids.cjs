#!/usr/bin/env node
/* ===== LE POIDS DE LA COPIE PUBLIÉE (2026-11-24, Sacha : « plusieurs modifications ont été faites sur iOS Capacitor et n'ont pas été prises en compte sur le Vercel ») =====
   Deux gains de poids que l'app iPhone avait déjà (app-ios/preparer-www.js) et que le site n'avait pas. La copie publiée seulement : le dépôt ne change pas.
   1. LA MER DE NUAGES EN WEBP SANS PERTE : assets/ciel/mer-cumulus.png (847 Ko) → mer-cumulus.webp (297 Ko ; Ko de 1024 octets, comme l'outil les affiche), le fichier déjà dans le dépôt
      (app-ios/ressources/mer-cumulus.webp). Pixels et alpha identiques (revérifié le 24/11 dans Chrome, texture WebGL sans prémultiplication : 0 composante
      différente sur 512×512×4). Le jeu charge déjà du webp (assets/portail/*.webp). Fait SEULEMENT si le PNG est exactement celui qui a été converti
      (même sha1 que dans preparer-www.js) ET si la copie ne cite le PNG qu'une fois, par la ligne connue ; sinon le PNG reste et un message le dit.
   2. musique-moteur.json est rangé indenté (525 Ko pour 155 Ko de données) : recompacté, JSON.parse rend le même objet (revérifié ici avant d'écrire).
   Ne fait JAMAIS échouer la publication : au moindre doute le fichier reste tel quel. APRÈS publie-audio (sa preuve lit les fichiers tels que le dépôt les a)
   et publie-allege (les commentaires qui citent le PNG sont partis), AVANT publie-script-externe et l'empreinte du jeu. POIDS_SITE=0 coupe tout.
   usage : node outils/publie-poids.cjs <dossier publié>   (le dossier qui contient index.html et assets/) */
'use strict';
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const dos = process.argv[2];
if (!dos || !fs.existsSync(path.join(dos, 'index.html'))) { console.error('usage : node outils/publie-poids.cjs <dossier publié>'); process.exit(1); }
if (process.env.POIDS_SITE === '0') { console.log('publie-poids : coupé (POIDS_SITE=0)'); process.exit(0); }
const ko = n => Math.round(n / 1024) + ' Ko';

/* ---------- 1. la mer de nuages ---------- */
const MC_SHA1 = '77765ea42fa2d0c2fafe6a2fc56598ad56d49c0e'; /* le PNG qui a été converti : la même empreinte que app-ios/preparer-www.js (MC_SHA1) */
const AVANT = "im.src='assets/ciel/mer-cumulus.png'", APRES = "im.src='assets/ciel/mer-cumulus.webp'";
try {
  const png = path.join(dos, 'assets', 'ciel', 'mer-cumulus.png'), webp = path.join(__dirname, '..', 'app-ios', 'ressources', 'mer-cumulus.webp');
  if (!fs.existsSync(png)) console.log('publie-poids : pas de mer-cumulus.png dans la copie, rien à faire');
  else if (!fs.existsSync(webp)) console.log('publie-poids : app-ios/ressources/mer-cumulus.webp absent, le PNG reste');
  else if (crypto.createHash('sha1').update(fs.readFileSync(png)).digest('hex') !== MC_SHA1) console.log('publie-poids : ⚠ mer-cumulus.png a changé, le webp est périmé : le PNG reste (refaire la conversion, voir app-ios/preparer-www.js)');
  else {
    /* tous les textes de la racine de la copie (index.html, les .js à côté) : le PNG ne doit y être cité qu'une fois, par la ligne connue */
    const textes = fs.readdirSync(dos).filter(n => /\.(html|js|json|webmanifest)$/i.test(n) && fs.statSync(path.join(dos, n)).isFile());
    let cites = 0, connues = 0, ou = '';
    for (const n of textes) { const t = fs.readFileSync(path.join(dos, n), 'utf8'); const a = t.split('mer-cumulus.png').length - 1, b = t.split(AVANT).length - 1; cites += a; connues += b; if (b) ou = n; }
    if (cites !== 1 || connues !== 1) console.log('publie-poids : la copie cite mer-cumulus.png ' + cites + ' fois (' + connues + ' par la ligne connue) : le PNG reste');
    else {
      const f = path.join(dos, ou), t = fs.readFileSync(f, 'utf8'), a = fs.statSync(png).size;
      fs.copyFileSync(webp, path.join(dos, 'assets', 'ciel', 'mer-cumulus.webp'));
      fs.writeFileSync(f, t.replace(AVANT, APRES));
      /* (2026-11-24, passe finale) le PNG RESTE dans la copie : plus rien ne le cite, donc personne ne le télécharge (le gain est entier), mais un onglet resté
         ouvert sur l'ancienne version pendant la publication le demande encore — il ne doit pas tomber sur une 404 (ciel sans mer de nuages jusqu'au rechargement). */
      console.log('publie-poids : mer de nuages en webp sans perte, ' + ko(a) + ' → ' + ko(fs.statSync(webp).size) + ' (' + ou + ')');
    }
  }
} catch (e) { console.log('publie-poids : ⚠ mer de nuages laissée telle quelle : ' + e.message); }

/* ---------- 2. musique-moteur.json ---------- */
try {
  const mm = path.join(dos, 'musique-moteur.json');
  if (fs.existsSync(mm)) {
    const t = fs.readFileSync(mm, 'utf8'), o = JSON.parse(t), c = JSON.stringify(o);
    if (c.length < t.length && JSON.stringify(JSON.parse(c)) === c) { fs.writeFileSync(mm, c); console.log('publie-poids : musique-moteur.json compacté, ' + ko(Buffer.byteLength(t)) + ' → ' + ko(Buffer.byteLength(c))); }
    else console.log('publie-poids : musique-moteur.json déjà compact');
  }
} catch (e) { console.log('publie-poids : ⚠ musique-moteur.json laissé tel quel : ' + e.message); }
