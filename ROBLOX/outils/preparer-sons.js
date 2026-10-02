#!/usr/bin/env node
/* CASH CAR — ROBLOX : prépare les sons à importer dans Roblox (dossier ROBLOX/sons-a-importer/).
   1. sort de la banque du jeu (VERSION PRINCIPALE/sons-banque.js, nos propres recettes) les bruitages utiles ;
   2. SYNTHÉTISE deux boucles que la banque n'a pas (le jeu web les calcule en direct) : le MOTEUR et la NITRO ;
   3. copie la musique du niveau 1.
   Roblox ne sait pas calculer un son : il lui faut des fichiers. On les importe une fois dans Studio
   (Asset Manager → Bulk Import), puis on colle les numéros dans Config.SONS.
   node ROBLOX/outils/preparer-sons.js   (ffmpeg requis pour les boucles synthétisées) */
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const JEU = path.join(__dirname, '..', '..', 'VERSION PRINCIPALE');
const OUT = path.join(__dirname, '..', 'sons-a-importer');
fs.mkdirSync(OUT, { recursive: true });

// nom dans Roblox (Config.SONS) ← nom dans la banque du jeu
const CHOIX = {
  piece: 'piece', decollage: 'decollage', poseParfait: 'pose.parfait', poseChoc: 'pose.choc',
  poseLourde: 'pose.lourde', vrille: 'fig.vrille', maillon: 'fig.maillon', bigAir: 'fig.bigair',
  encaisse: 'verdict.1', explosion: 'explosion', pad: 'pad', nitroPlein: 'nitro.plein',
  tap: 'ui.tap', go: 'ui.go', bip: 'ui.bip', compteFin: 'mort.compteFin', record: 'ui.record',
  portail: 'portail', fronde: 'fronde', ventAltitude: 'nuages.ambiance',
  // les niveaux : l'orage (l'éclair, le tonnerre), l'orbite (ses portes, son silence habité, les débris), la pluie de satellites
  eclair: 'foudre.eclair', tonnerre: 'tonnerre', orbiteEntre: 'orbite.entre', orbiteSort: 'orbite.sort', espaceAmbiance: 'espace.ambiance',
  explosionLoin: 'explosion.loin', esquive: 'debris.esquive', touche: 'foudre.touche', abri: 'abri', mortSat: 'mort.foudre',
};
global.window = {};
require(path.join(JEU, 'sons-banque.js'));
const B = window.CCSON_BANQUE;
for (const [nom, cle] of Object.entries(CHOIX)) {
  const d = B.d[cle + '#0#0'];
  if (!d) { console.log('absent :', cle); continue; }
  fs.writeFileSync(path.join(OUT, nom + '.mp3'), Buffer.from(d, 'base64'));
}

// ── les deux boucles synthétisées : uniquement des fréquences ENTIÈRES sur 1 s → la boucle se referme sans couture ──
const SR = 32000, N = SR; // 1 seconde
function wav(nom, gen) {
  const s = new Float32Array(N);
  gen(s);
  let pk = 0; for (const v of s) pk = Math.max(pk, Math.abs(v));
  const buf = Buffer.alloc(44 + N * 2);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + N * 2, 4); buf.write('WAVE', 8); buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22); buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(N * 2, 40);
  for (let i = 0; i < N; i++) buf.writeInt16LE(Math.round(s[i] / pk * 0.89 * 32767), 44 + i * 2);
  const w = path.join(OUT, nom + '.wav');
  fs.writeFileSync(w, buf);
  try { // ogg : le format que Roblox avale le plus sûrement ; le wav reste à côté
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', w, '-c:a', 'libvorbis', '-q:a', '6', path.join(OUT, nom + '.ogg')]);
    fs.unlinkSync(w);
  } catch (e) { console.log('ffmpeg absent : ' + nom + '.wav gardé'); }
}
let graine = 7; const rnd = () => ((graine = (graine * 16807) % 2147483647) / 2147483647);

// MOTEUR : un V8 au ralenti (60 Hz de base = 30 explosions/s d'un côté, 30 de l'autre), harmoniques qui
// s'effondrent, le « lope » (8 Hz), la saturation. Roblox montera la hauteur avec PlaybackSpeed (régime).
wav('moteur', s => {
  const ph = []; for (let h = 1; h <= 14; h++) ph.push(rnd() * 6.283);
  for (let i = 0; i < N; i++) {
    const t = i / SR; let v = 0;
    for (let h = 1; h <= 14; h++) v += Math.sin(6.283 * 60 * h * t + ph[h - 1]) / Math.pow(h, 1.15) * (h % 2 ? 1 : 0.7);
    v += 0.55 * Math.sin(6.283 * 30 * t);                          // le sub : la moitié du vilebrequin
    v *= 0.72 + 0.28 * Math.sin(6.283 * 8 * t) * Math.sin(6.283 * 30 * t + 1); // le ronron
    s[i] = Math.tanh(v * 1.6);
  }
});
// NITRO : un grondement brun (somme de sinus entiers en 1/f entre 25 et 700 Hz) + un flottement à 5 Hz.
wav('nitro', s => {
  const P = []; for (let f = 25; f <= 700; f++) P.push([f, rnd() * 6.283, 1 / Math.pow(f, 0.95)]);
  for (let i = 0; i < N; i++) {
    const t = i / SR; let v = 0;
    for (const [f, p, a] of P) v += a * Math.sin(6.283 * f * t + p);
    v *= 0.8 + 0.2 * Math.sin(6.283 * 5 * t);
    s[i] = Math.tanh(v * 0.9);
  }
});

// LA MUSIQUE PAR LIEU (MUSIC_LIEU du jeu web) : nuages = NOITE DE VELOCIDADE, ville (et l'accueil) = NOCTURNAL GROOVE, orage = SWAG
// CASH CAR ; l'orbite garde la radio (`musique` : NÉON CASH CAR). Un morceau pas importé = `musique` continue.
for (const [nom, f] of Object.entries({ musiqueNuages: 'noite-de-velocidade.mp3', musiqueVille: 'nocturnal-groove.mp3', musiqueOrage: 'swag-cash-car-2.m4a' })) {
  const src = path.join(JEU, 'assets', 'audio', 'music', f), dst = path.join(OUT, nom + '.mp3');
  if (!fs.existsSync(src)) { console.log('absent :', f); continue; }
  if (f.endsWith('.mp3')) fs.copyFileSync(src, dst);
  else try { execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', src, '-c:a', 'libmp3lame', '-q:a', '4', dst]); } catch (e) { console.log('ffmpeg absent : ' + f + ' non converti'); }
}
// la musique du niveau 1
const mus = path.join(JEU, 'assets', 'audio', 'music', 'lvl1-neon-cash-car-v3.mp3');
if (fs.existsSync(mus)) fs.copyFileSync(mus, path.join(OUT, 'musique.mp3'));
console.log(fs.readdirSync(OUT).join('  '));
