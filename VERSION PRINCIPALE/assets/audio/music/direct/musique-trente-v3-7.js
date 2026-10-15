// musique-trente.js — TRENTE MOTEURS v3 : la musique générative du jeu CASH CAR, jouée en direct (Web Audio, aucun fichier audio).
//
// L'HISTOIRE : v1 (2026-10-13) un monde (la mineur, 110 BPM), un élément de plus à chaque moteur — « c'était cool » ; v2 (14/10) douze
// styles et leurs mélanges — « c'était mieux avant : tout est un peu générique et en vrac ». v3 (14/10, Léo : « solidifie tes connaissances
// en musique et en composition, et en parallèle suis la philosophie d'intensité du jeu, vas-y à fond, puise les ressources là-dedans,
// il faut que le jeu soit phénoménal »). Puis (14/10) « le générateur doit être UNIQUE : supprime les erreurs, solidifie le code pour que le
// jeu ait les meilleures musiques générées automatiquement, à l'infini » — v1 et v2 retirées (copies hors du projet, scratchpad de la session).
// À L'INFINI : toutes les `renouvelle` phrases (12 par défaut, ~3-4 min) une musique NEUVE se prépare en coulisse et prend le relais sur une
// fin de phrase (même moteur, mémoire des parties) ; un son qui ne se fabrique pas est sauté (la musique joue avec les autres) ; une note
// ratée n'arrête jamais l'horloge ; rien ne s'accumule (journaux et caches bornés, banque de l'ancienne musique libérée).
//
// UNE IDENTITÉ, TROIS COULEURS (celles de ses 👍 : NÉON DRIVE / NÉON NOIR, NUIT DE VELOURS / AURA, PENTHOUSE / Ateyaba / BOR) :
//   NÉON (synthwave qui file : arpège, supersaw, basse qui roule, caisse claire énorme) · VELOURS (french touch : Rhodes, accords hachés,
//   basse funk, la pompe, le filtre qui balaie) · LUXE (trap de luxe nonchalante : boucles d'un ou deux accords, 808 qui glisse,
//   charleys qui roulent, demi-tempo). Chaque partie tire sa couleur, sa tonalité, son tempo, ses grilles, son THÈME, l'ordre exact
//   de ses 30 éléments et ses petites couleurs de son : jamais deux fois la même, toujours le même monde.
// LE MÉTIER :
//   · les accords sont MENÉS : chaque accord prend le renversement le plus proche du précédent (les voix bougent d'un ou deux demi-tons,
//     comme un pianiste — fini les blocs qui sautent) ;
//   · la mélodie est une PHRASE : question (4 mesures, finit en suspens sur une note de l'accord qui n'est pas la fondamentale) puis
//     réponse (4 mesures, un sommet en 7e mesure, finit SUR la fondamentale) ; le motif est redit en marche ; la partie B a son motif à elle ;
//   · le CONTRE-CHANT suit les notes-guides (tierces et septièmes des accords, menées au plus court) ;
//   · la basse se cale sur la grosse caisse et AMÈNE l'accord suivant (une note de passage sur le dernier temps) ;
//   · la main : chaque coup a son retard (±4 ms) et sa force (±8 %), la caisse a ses fantômes, les tambours ont trois variantes ;
//   · le son : nappes et claviers en STÉRÉO (voix désaccordées gauche / droite), cordes pincées (Karplus-Strong), un coupe-bas sur tout
//     ce qui n'est pas grave, la pompe sous la grosse caisse, saturation douce + colle + limiteur.
// v3.1 (14/10, Léo : « l'effet de transition est un peu répétitif, sinon c'est top ; un peu plus de variété ; et si c'est trop dur
//  d'accumuler trop d'instruments, fais juste évoluer la musique dans son INTENSITÉ ») : l'échelle des 30 moteurs mêle désormais une
//  quinzaine d'instruments et des MARCHES D'INTENSITÉ (le son s'ouvre, la basse s'anime, la batterie frappe plus fort, les charleys
//  doublent, l'espace s'élargit, le son se durcit, la mélodie monte d'une octave…) ; les TRANSITIONS viennent d'un répertoire (roulement,
//  toms, charleys, souffle à l'envers, trou, filtre qui plonge, glissé de basse, bégaiement — ou rien) tiré sans jamais redonner les deux
//  derniers ; l'arrivée n'a plus de coup sourd à chaque fois ; cinq FORMES de morceau, plus de grilles et de rythmes, une partie B qui
//  change de voix, des fins de phrase variées.
// LA SIGNATURE (14/10, Léo : « inspire-toi à chaque fois de l'état d'esprit plein d'originalité et d'identité, comme pour les boucles du
//  lobby quand je t'ai dit que c'était trop la même chose ») : chaque musique a UNE IDÉE, un son du monde CASH CAR qui revient comme un
//  gimmick, ACCORDÉ dans sa tonalité — le moteur qui chante (vroum : fondamentale, quinte, octave), le turbo qui souffle, la caisse
//  enregistreuse, la pluie de pièces, le néon qui grésille, les klaxons, les gouttes de verre, les accords à l'envers (vaporwave), la sirène
//  au loin. Elle entre tôt (5e-8e moteur), parfois une 2e plus tard ; le titre et « l'idée » en découlent.
// v3.2 (14/10, Léo : « pas trop de fois le même instrument sur plusieurs parties consécutives ») : LA MÉMOIRE DES PARTIES — clavier,
//  mélodie, basse, nappe, signature et couleur des deux dernières musiques deviennent très improbables (×0,1 la dernière, ×0,35
//  l'avant-dernière ; `historique` en option, gardé par la page) ; la palette s'élargit (piano électrique FM, cuivre synthétique, flûte,
//  basses acid, reese, slap, 808 saturée, sous-basse qui glisse, nappe douce) pour qu'il y ait de quoi changer.
// v3.3 (14/10, Léo : « ayons au moins 8 instruments phares intéressants, là tu bloques sur deux-trois ; même plus s'il faut ») :
//  TREIZE INSTRUMENTS PHARES (la voix de la mélodie) — synthé scie, synthé de verre, talkbox, cuivre, sifflet, flûte, carré, et les
//  nouveaux : SAXOPHONE de minuit, THÉRÉMINE (qui glisse d'une note à l'autre), GUITARE claire et GUITARE SATURÉE (cordes pincées),
//  STEEL DRUM, KALIMBA, PUCE 8 BITS — chaque couleur en tire 7 ou 8 avec ses affinités ; la mémoire écarte le phare des TROIS dernières parties.
// v3.4 (14/10, Léo : « l'évolution entre le 15 et le 28 encore un peu molle, ça pourrait être plus intense · arrête d'utiliser un
//  instrument commun entre chaque génération, ça s'entendrait dans le jeu » puis « c'est encore un peu toujours la même, mais ne perds pas
//  tes compétences : tu fais vraiment de belles musiques qui donnent envie d'aller plus vite ») :
//  · CINQ COULEURS : NÉON · VELOURS · LUXE + DRIFT (phonk de drift : la cloche de vache qui chante le riff, la 808 saturée, le phrygien,
//    des accords de trois sons, les pneus qui crissent) et TOUGE (eurobeat de col de montagne, 148-156 BPM : la basse en octaves, les
//    cuivres sur les contretemps, le supersaw) ; les goûts penchent sans enfermer (la racine de leurs poids) ;
//  · CINQ FORMES DE PHRASE (classique · riff · appel · envol · longues) et un couplet qui prend une autre forme que le thème ;
//    des OUVERTURES tirées (les trois premiers moteurs ne sont plus toujours les mêmes) ;
//  · LA RAMPE DU 15 AU 30 : E = (moteur − 14) / 16 monte en continu (fantômes, fins de phrase plus souvent, cymbale toutes les 4 mesures,
//    charleys et caisse plus présents, pompe plus profonde, son plus dense et plus fort, arpège en doubles, tempo +2 %) ; l'échelle y
//    place des marches qui POUSSENT : la batterie qui double (≈ 21e), la basse doublée à l'octave, la batterie qui s'emballe (toms,
//    cymbales), la pulsation des contretemps, chaque fin de 4 mesures qui monte (souffle, roulement ou toms, à tour de rôle) ;
//  · PLUS AUCUN INSTRUMENT COMMUN : arpège (corde de verre, scie, FM, puce, bois), contre-chant (flûte, violon, voix, orgue), nappe (scie,
//    douce, verre, voix), cordes (ensemble, synthé), chœur (oh, ah, ou), caisse claire (grosse, clap, rimshot), montée (souffle, ton),
//    grosse caisse (ronde, sèche, boum), charleys et cymbale accordés autrement — tirés par musique, avec la mémoire des parties.
// v3.5 (14/10, Léo : « c'est toujours un peu la même, toujours un aigu : trouve un moyen d'être original à chaque génération, sinon ça
//  casse les oreilles » · « à chaque fois ça me donne une structure qui crée le même style de musique : il faut UN STYLE À CHAQUE PARTIE »
//  · Die Antwoord « Age of Illusion » : « ressource-toi ») :
//  · QUATORZE STYLES, chacun son monde entier — tempo, groove, langage d'accords, instruments, ordre d'entrée, registre : NÉON (synthwave),
//    VELOURS (french touch), LUXE (trap), DRIFT (phonk), TOUGE (eurobeat), HYPERVITESSE (drum & bass liquide, 170-176), BOULE À FACETTES
//    (disco funk, dorien/mixolydien, basse en octaves, cuivres), 2-STEP (UK garage, grosse caisse qui saute, orgue, chœur haché),
//    NUIT LO-FI (84-90, balancé, vinyle), TURBINE (big beat : accords de QUINTE à la guitare saturée, breakbeat), PIXEL (chiptune :
//    basse triangle, accords 8 bits, parfois en MAJEUR), GRAND PRIX (épique : cordes, cuivres, toms, chœur, la dominante), MALECÓN
//    (dembow 3-3-2, steel drum, kalimba), ZEF (rave-rap sombre mesuré sur Die Antwoord : 80-86 BPM, deux accords, la basse énorme,
//    les accords de rave, des ponts sans basse) ; la mémoire écarte les QUATRE derniers styles joués ;
//  · L'AIGU SE REPOSE : un PLAFOND par style (80-86 en MIDI : toute voix plus haute redescend d'une octave, même note), cordes et accords
//    hachés à l'octave du milieu, l'arpège et la cloche se taisent dans le couplet, la rampe pousse le grave (grosse caisse, basse) et
//    plus les charleys, une seule cymbale par phrase (le final : toutes les 4 mesures), le souffle des montées moins brillant.
// v3.6 (14/10, Léo : « techniquement, si j'appuie sur changer de musique, il n'y aura pas un air de ressemblance entre chaque son ? »
//  → « 1, 2, 3, et trouve une solution, essaie de comprendre ce que je cherche ») : ce qu'il cherche = qu'une partie sonne comme un
//  AUTRE ARTISTE. L'air de famille venait surtout de la PRODUCTION (la même grosse caisse, les mêmes charleys, la même salle) :
//  · LA PRODUCTION DE CHAQUE STYLE (`PROD`) : sa grosse caisse (ronde · 909 · 808 · acoustique · lo-fi étouffée · 8 bits · tambour grave),
//    ses charleys (métal · bruit · FM de verre · shaker · 8 bits), sa caisse claire (+ acoustique), sa SALLE (de la pièce sèche de 0,7 s
//    à la cathédrale de 4,2 s, sombre ou brillante — une réverbe neuve en fondu à chaque musique), son écho (croche, croche pointée, noire,
//    noire pointée), sa saturation ;
//  · PLUS DE LUMIÈRE : le majeur et le lydien (le rêve de C418) entrent dans NÉON, VELOURS, LO-FI, HYPERVITESSE, DISCO, 2-STEP, GRAND PRIX ;
//    les goûts (« mineur ») penchent moins fort, et le mode d'avant devient moins probable ;
//  · LA COURBE : les grands moments ne tombent plus aux mêmes moteurs — la mélodie tôt ou en « drop » vers le 10e, la grosse caisse
//    parfois retenue jusqu'au 9e-12e, la clarté entre le 10e et le 18e, la batterie qui double entre le 16e et le 24e, la montée d'un ton
//    entre le 23e et le 28e — ou aucune.
//  · STADE (Stuck in the Sound « Let's Go », « tu peux copier ces techniques aussi » — mesuré : 89 BPM, ré majeur, I ↔ vi, 66 mesures
//    d'énergie pleine, un son brillant) : l'indie rock en MAJEUR, les TOMS EN RYTHME (élément `tribu`), la guitare grattée, la basse en
//    croches, et LE CHŒUR DE STADE (élément `foule` : huit voix d'hommes qui chantent le thème sur « oh », une octave sous la mélodie, et
//    des « HÉ ! » tous les deux mesures) — le chœur passe aussi dans TURBINE et TOUGE.
// v3.7 — LES VRAIS INSTRUMENTS (14/10, Léo : « bien essayé mais c'est toujours générique · toujours les mêmes sons · toujours la même
//  erreur » → « vrais instruments libres » ; « tu vas pouvoir les retoucher et imiter des sons qu'on a déjà écoutés ») : la source des sons
//  était le problème (la même vingtaine de recettes d'oscillateurs pour tous les styles). Désormais de VRAIS enregistrements — VSCO-2
//  Community Edition, licence CC0 (assets/audio/music/direct/vrais/, 207 échantillons, 4 Mo, atelier-son/vrais_instruments.py : hauteur
//  mesurée, attaque recalée) : piano, harpe, violons, violon solo, violoncelles (tenus, pincés), contrebasse, trompette (+ bouchée), cor,
//  trombone, tuba, flûte, clarinette, hautbois, basson, glockenspiel, marimba, xylophone ; et 34 percussions (grosse caisse de concert,
//  caisses claires, tambours ténor, congas, bongos, claves, vraie cloche de vache, shakers, grelots, triangles, cymbales, gong, timbales).
//  Chaque style tire les siens (`VRAIS_STYLE` : clavier, mélodie, arpège, contre-chant, nappe, cordes, cuivres, basse, et le kit réel) —
//  « @piano » dans un tirage = le vrai ; et une RETOUCHE par musique (lo-fi, sombre, radio, saturé) passe sur les vrais instruments.
//  Chargés à la demande, gardés en cache (seulement ceux des musiques en cours), volume calé sur leur énergie.
// LES GOÛTS MESURÉS (14/10, atelier-son/gouts_mesures.py : ses 12 sons aimés contre ses 38 supprimés, mesurés) : W.clarte (< 1 = plus sombre :
//  « jamais clinquant », aucun son aimé au-dessus de 2 800 Hz de brillance) adoucit le haut (clarté ouverte plus basse, charleys et cymbales
//  plus discrets) ; W.basse_db alourdit la basse ; W.bpm tire le tempo de chaque couleur vers son tempo préféré.
// LA PHILOSOPHIE D'INTENSITÉ DU JEU (CLAUDE.md : le flow, la frénésie DARK TRIAD, la nitro façon Asphalt, le vol, la pose, la mort) :
//   · MOTEUR (1 → 30) : un élément de plus par moteur, le tempo qui monte, les grands moments sur une mesure de montée ;
//   · FLOW (0 → 1) : la densité — fantômes, roulements, ornements de la mélodie, arpège en doubles croches ;
//   · NITRO (tenue) : charleys doublés, tout s'éclaire, un souffle qui monte, la mélodie à l'octave ; lâchée : la cymbale ;
//   · VOL : à la croche, la batterie et la basse se retirent, le grave se coupe, la réverbe s'ouvre (on flotte) ;
//     POSE : tout retombe SUR le temps avec un coup sourd (PARFAIT : + cymbale et une gerbe de notes qui monte) ;
//   · FRÉNÉSIE (DARK TRIAD) : à la mesure, l'harmonie bascule dans le SOMBRE (la seconde mineure), demi-tempo trap, 808, roulements,
//     tempo +4 % ; à la sortie, la cymbale et le monde revient ;
//   · CRASH : la musique s'effondre (le filtre se ferme, le son tombe) puis se tait.
//
// Utilisation :
//   const music = createTrenteMusic({ audioContext, destination, gouts });
//   music.start();  music.start(4821);         // une musique neuve ; ou celle-là
//   music.setTier(moteur, 30);                  // à chaque moteur
//   music.regle({ nitro, vol, flow, frenesie }) // à chaque image, depuis l'état du jeu
//   music.evenement('pose', 'parfait'|'normal'|'lourd') · music.evenement('crash')
//   music.nouvelle() · music.tirage · music.stop()
// LES VRAIS INSTRUMENTS : l'index, les tampons décodés (cache partagé), l'amorce de l'AAC retirée, le niveau calé sur l'énergie
const VRAIS_BASE = new URL('./vrais/', import.meta.url).href; let VRAIS_IDX = null; const VRAIS_BUF = new Map();
function vraisIndex() { return VRAIS_IDX || (VRAIS_IDX = fetch(VRAIS_BASE + 'vrais-index.json').then(r => r.json()).catch(() => ({}))); }
function vraiRecale(b, note) { let i0 = b.length, pk = 0; for (let c = 0; c < b.numberOfChannels; c++) { const d = b.getChannelData(c); for (let i = 0; i < d.length; i++) if (Math.abs(d[i]) > pk) pk = Math.abs(d[i]); }
  for (let c = 0; c < b.numberOfChannels; c++) { const d = b.getChannelData(c); for (let i = 0; i < d.length; i++) if (Math.abs(d[i]) > pk * .02) { if (i < i0) i0 = i; break; } }
  i0 = Math.max(0, i0 - Math.round(b.sampleRate * .002));
  const y = new AudioBuffer({ length: Math.max(1, b.length - i0), numberOfChannels: b.numberOfChannels, sampleRate: b.sampleRate });
  let e = 0, n = 0; const W = Math.min(y.length, Math.round(b.sampleRate * .6));
  for (let c = 0; c < b.numberOfChannels; c++) { const d = b.getChannelData(c).subarray(i0); y.copyToChannel(d, c); for (let i = 0; i < W; i++) { e += d[i] * d[i]; n++; } }
  if (note) { const g = Math.min(3, Math.max(.5, .2 / Math.sqrt(e / Math.max(1, n) + 1e-9)), .98 / Math.max(1e-6, pk)); for (let c = 0; c < y.numberOfChannels; c++) { const d = y.getChannelData(c); for (let i = 0; i < d.length; i++) d[i] *= g; } }
  return y; }
function vraiBuf(ac, f, note) { if (!VRAIS_BUF.has(f)) VRAIS_BUF.set(f, fetch(VRAIS_BASE + f).then(r => { if (!r.ok) throw new Error('vrai ' + f); return r.arrayBuffer(); }).then(a => ac.decodeAudioData(a)).then(b => vraiRecale(b, note)));
  return VRAIS_BUF.get(f); }
async function vraiNotes(ac, nom) { const I = await vraisIndex(), e = I[nom]; if (!e) return [];
  const L = await Promise.all(e.notes.map(([m, f]) => vraiBuf(ac, f, e.type === 'note').then(buf => ({ m: m == null ? 60 : m, buf, f })).catch(() => null))); return L.filter(Boolean).sort((a, b) => a.m - b.m); }
function vraisMenage(garder) { for (const f of [...VRAIS_BUF.keys()]) if (!garder.has(f)) VRAIS_BUF.delete(f); }

export function createTrenteMusic({ volume = 1, audioContext = null, destination = null, gouts = null, historique = null, renouvelle = 12 } = {}) {
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
  const pc = m => ((m % 12) + 12) % 12;
  const R = Math.random;
  function graine(n) { let a = (Math.imul(n | 0, 2654435761) ^ 0x5bd1e995) >>> 0; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  let T = graine(1);
  const tp = a => a[Math.floor(T() * a.length)], tr = (a, b) => a + (b - a) * T(), rp = a => a[Math.floor(R() * a.length)];
  let GOUTS = gouts;   // les goûts appris (page : ses 👍 / 👎) — des poids sur la couleur, le mode, les timbres, les boucles, ses thèmes aimés
  const tpw = (a, tab, cle) => { if (!tab) return tp(a); const w = a.map(x => { const v = tab[cle ? cle(x) : x]; return v == null ? 1 : v; }), s0 = w.reduce((p, q) => p + q, 0);
    let r = T() * s0; for (let i = 0; i < a.length; i++) { r -= w[i]; if (r <= 0) return a[i]; } return a[a.length - 1]; };

  // ================================================================ L'HARMONIE
  const QUAL = { 5: [0, 7, 12], m9: [0, 3, 7, 10, 14], m7: [0, 3, 7, 10], m: [0, 3, 7], maj9: [0, 4, 7, 11, 14], maj7: [0, 4, 7, 11], M: [0, 4, 7], 6: [0, 4, 7, 9], 7: [0, 4, 7, 10],
    9: [0, 4, 7, 10, 14], '7sus': [0, 5, 7, 10], add9: [0, 4, 7, 14] };
  const NOTES_EN = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'], NOTES_FR = ['do', 'do♯', 'ré', 'mi♭', 'mi', 'fa', 'fa♯', 'sol', 'la♭', 'la', 'si♭', 'si'];
  const GAMMES = { mineur: [0, 2, 3, 5, 7, 8, 10], dorien: [0, 2, 3, 5, 7, 9, 10], sombre: [0, 1, 3, 5, 7, 8, 10], majeur: [0, 2, 4, 5, 7, 9, 11], mixolydien: [0, 2, 4, 5, 7, 9, 10], lydien: [0, 2, 4, 6, 7, 9, 11] };
  const NOM_MODE = { mineur: 'mineur', dorien: 'dorien', sombre: 'mineur sombre', majeur: 'majeur', mixolydien: 'mixolydien', lydien: 'lydien' };
  const FREN_GRILLES = ['0:m 1:M 0:m 1:M', '0:m9 8:maj7 1:maj7 0:m9', '0:m 0:m 1:M 7:M'];   // la FRÉNÉSIE : la seconde mineure (phrygien), le sombre
  function accord(spec, Mx, modeN) {
    const [d, q] = spec.split(':'), r = (Mx.ton + +d) % 12, iv = QUAL[q], pcs = iv.map(x => (r + x) % 12);
    let gamme = GAMMES[modeN || Mx.modeN].map(x => (Mx.ton + x) % 12);
    const ext = pcs.filter(p => !gamme.includes(p));   // une note de l'accord hors du mode remplace ses voisines (jamais une note de l'accord)
    gamme = gamme.filter(g => pcs.includes(g) || !ext.some(p => Math.min((g - p + 12) % 12, (p - g + 12) % 12) === 1)).concat(ext);
    const sept = iv.includes(10) ? (r + 10) % 12 : iv.includes(11) ? (r + 11) % 12 : iv.includes(9) ? (r + 9) % 12 : (r + 7) % 12;
    return { cle: spec, nom: NOTES_EN[r] + (q === 'M' ? '' : q), r, pcs, basse: 38 + ((r - 38 % 12 + 12) % 12), tierce: iv[1], guides: [(r + iv[1]) % 12, sept], gamme };
  }
  // LES ACCORDS MENÉS : pour chaque accord, le renversement (3-4 notes, sol2 → ré5) le plus proche du précédent ; deux tours de la grille
  // pour que le 1er accord soit mené depuis le dernier (la boucle se referme sans saut)
  function menes(specs, Mx, modeN) {
    const As = specs.map(s => accord(s, Mx, modeN));
    // (les renversements serrés ET leurs « drop 2 » — la 2e voix du haut descendue d'une octave, la façon des pianistes d'ouvrir un accord ;
    //  jamais deux voix voisines à un demi-ton : la neuvième collée sous la tierce d'un m9 frottait)
    const cands = A => { const iv = QUAL[A.cle.split(':')[1]], ps = (iv.length > 4 ? A.pcs.slice(1) : A.pcs).slice().sort((a, b) => a - b), out = [];
      for (let k = 0; k < ps.length; k++) { const rot = ps.slice(k).concat(ps.slice(0, k)); for (const b0 of [43, 55]) { let m = b0 + ((rot[0] - b0 % 12 + 12) % 12), v = [m];
        for (let j = 1; j < rot.length; j++) { m = m + ((rot[j] - m % 12 + 12) % 12 || 12); v.push(m); }
        if (v[0] >= 52 && v[v.length - 1] <= 76) out.push(v);
        if (v.length >= 4) { const d2 = v.slice(); d2[d2.length - 2] -= 12; d2.sort((x, y) => x - y); if (d2[0] >= 48 && d2[d2.length - 1] <= 76) out.push(d2); } } }
      const net = out.filter(v => v.every((x, j) => j === 0 || x - v[j - 1] >= 2) && (v[0] >= 55 || v[1] - v[0] >= 3));   // pas de seconde mineure, pas de boue dans le grave
      return net.length ? net : out; };
    let prev = null; const res = [];
    for (let tour = 0; tour < 2; tour++) As.forEach((A, k) => { const cs = cands(A); let best = cs[0], bs = 1e9;
      for (const v of cs) { const moy = v.reduce((p, q) => p + q, 0) / v.length; let sc = Math.abs(moy - 63) * .35;
        if (prev) { const n = Math.min(v.length, prev.length); for (let j = 0; j < n; j++) sc += Math.abs(v[j] - prev[j]); }
        if (sc < bs) { bs = sc; best = v; } }
      prev = best; if (tour === 1) res[k] = Object.assign({}, A, { v: best, cle: A.cle + '@' + best.join('.') }); });
    return res;
  }

  // ================================================================ LES ÉLÉMENTS
  const NOMS = { pad: 'la nappe', keys: 'le clavier', basse: 'la basse', kick: 'la grosse caisse', hat: 'le charley', snare: 'la caisse claire', lead: 'la mélodie',
    arp: 'l’arpège', perc: 'les percussions', pompe: 'la pompe', contre: 'le contre-chant', basse2: 'la basse qui amène les accords', hatO: 'le charley ouvert',
    cordes: 'les cordes', clarte: 'la clarté (le filtre s’ouvre)', cloche: 'la cloche', stab: 'les accords hachés', fant: 'les fantômes de caisse', octave: 'la mélodie doublée',
    choeur: 'le chœur', sub: 'la sous-basse', roll: 'les roulements', echo: 'les échos', harmo: 'les tierces', ride: 'la ride', toms: 'les toms', cuivres: 'les cuivres',
    vinyl: 'le vinyle', tribu: 'les toms en rythme', foule: 'le chœur de stade', double: 'la batterie qui double', modul: 'le morceau monte d’un ton', final: 'le final',
    // LES MARCHES D'INTENSITÉ (pas un instrument de plus : la musique qui monte)
    i_filtre: 'le son s’ouvre un peu', i_basse: 'la basse s’anime', i_frappe: 'la batterie frappe plus fort', i_dense: 'les charleys en doubles',
    sig: 'la signature', sig2: 'la 2e signature', i_basseOct: 'la basse doublée à l’octave', i_tambours: 'la batterie s’emballe', i_pulse: 'la pulsation des contretemps',
    i_monte: 'chaque fin de 4 mesures monte', i_large: 'l’espace s’élargit', i_relance: 'les relances de grosse caisse', i_sature: 'le son se durcit', i_sommet: 'la mélodie monte d’une octave', i_keys: 'le clavier s’anime' };
  const CATALOGUE = Object.keys(NOMS);
  const GRANDS = new Set(['kick', 'clarte', 'double', 'modul', 'final']);
  const GROOVE = new Set(['kick', 'snare', 'fant', 'hat', 'roll', 'hatO', 'perc', 'ride', 'toms', 'tribu', 'basse', 'basse2', 'sub']);   // ce que le VOL retire
  const VOL = { pad: .3, keys: .34, basse: .5, kick: .95, hat: .22, snare: .6, lead: .4, arp: .2, perc: .22, contre: .2, basse2: .5, hatO: .14, cordes: .2, cloche: .2,
    stab: .24, fant: .22, octave: .17, choeur: .17, sub: .3, roll: .15, harmo: .17, ride: .09, toms: .34, cuivres: .2, vinyl: .1, tribu: .3, foule: .3, sig: .32, sig2: .28, fx: .55 };
  const PAN = { tribu: .12, foule: -.08, sig2: .2, hat: -.25, hatO: .25, perc: .3, cloche: -.3, contre: -.22, harmo: .22, ride: -.18, toms: .1, arp: .12 };
  const REV = { tribu: .14, foule: .38, sig: .3, sig2: .32, pad: .32, keys: .2, lead: .28, contre: .32, cordes: .42, choeur: .5, cloche: .45, arp: .18, snare: .14, harmo: .3, octave: .25, cuivres: .22, toms: .14, perc: .12, fx: .3 };
  const HP = { foule: 140, pad: 150, keys: 140, lead: 180, arp: 200, contre: 180, cordes: 160, cloche: 300, stab: 160, octave: 110, choeur: 160, harmo: 160, cuivres: 140, fx: 60 };   // le coupe-bas : le grave à la basse
  const POMPE = ['pad', 'keys', 'cordes', 'choeur', 'stab', 'arp', 'basse'];

  // ================================================================ LES STYLES (un par partie)
  // pat : 16 pas par mesure (X fort · x · o léger · H/L conga aiguë/grave) — plusieurs variantes, changées en route
  // basse : [pas, intervalle (0 · 7 · 12 · 't' = la tierce), durée, force] · keys/stab : [pas, durée]
  const COULEURS = {
    neon: { nom: 'NÉON', dit: 'synthwave qui file', bpm: [104, 112], monte: [10, 14], modes: ['mineur'], swing: 0, reg: 69, cap: 84, pompe: .45, ferme: 3800,
      grilles: { mineur: ['0:m9 8:maj9 3:maj9 10:6', '0:m9 8:maj9 5:m9 7:7sus', '8:maj9 10:6 0:m9 0:m9', '0:m9 10:6 8:maj9 10:6', '5:m9 8:maj9 10:6 0:m9', '0:m9 3:maj9 10:6 8:maj9',
        '0:m9 5:m9 8:maj9 7:7sus', '3:maj9 10:6 0:m9 8:maj9'] },
      keysT: ['piano', 'harpe', 'dx'], leadT: { scie: 3, saxo: 2.5, guitareSat: 2, cuivre: 1.5, chip: 1.2, theremine: 1, verre: 1, carre: .8 }, trans: { run: 1, roll: 2, toms: 2, souffle: 2, trou: 1, filtre: 1.5, begaie: .8, rien: 3 }, basseT: ['roule', 'acid', 'reese'], cells: [2, 2, 3, 4, 4, 6], fill: ['toms', 'roll'],
      phrases: { classique: 2, envol: 2, riff: 1.5, longues: 1, appel: .8 },
      kit: { f0: [150, 180], f1: [46, 52], dec: [.32, .45], clic: [.12, .2], drive: [1.1, 1.6], snare: ['grosse', 'clap', 'rim'] },
      pat: { kick: ['X...X...X...X...', 'X.....x.X...X...', 'X...X...X..xX...'], snare: ['....X.......X...'], hat: ['x.x.x.x.x.x.x.x.', 'x.xox.x.x.xox.x.'], hatD: 'xoxoxoxoxoxoxoxo', hatO: ['......x.......x.', '..x...x...x...x.'],
        fant: ['..........o....o'], perc: ['oxoxoxoxoxoxoxox'],
        basse: [[[0, 0, 2], [2, 0, 2], [4, 12, 2], [6, 0, 2], [8, 0, 2], [10, 0, 2], [12, 12, 2], [14, 0, 2]], [[0, 0, 1], [1, 0, 1], [2, 12, 1], [3, 0, 1], [4, 0, 1], [5, 0, 1], [6, 12, 1], [7, 0, 1], [8, 0, 1], [9, 0, 1], [10, 12, 1], [11, 0, 1], [12, 0, 1], [13, 0, 1], [14, 12, 1], [15, 0, 1]]],
        keys: [[[0, 8], [8, 8]], [[0, 6], [6, 2], [8, 6], [14, 2]], [[0, 3], [3, 3], [6, 2], [8, 3], [11, 3], [14, 2]]], stab: [[[0, 2], [6, 2], [12, 2]]], arp: ['updown16', 'up16'] },
      ouv: [['arp', 'pad', 'kick'], ['pad', 'lead', 'arp'], ['basse', 'arp', 'kick'], ['keys', 'arp', 'pad']],
      ordre: ['arp!', 'pad', 'kick', 'basse', 'snare', 'hat', 'lead', 'i_filtre', 'keys', 'pompe', 'contre', 'i_basse', 'hatO', 'cordes', 'clarte', 'i_frappe', 'fant', 'i_dense', 'octave',
        'i_relance', 'double', 'i_basseOct', 'i_tambours', 'harmo', 'i_sature', 'i_pulse', 'i_monte', 'modul', 'i_sommet', 'final!'] },
    velours: { nom: 'VELOURS', dit: 'french touch', bpm: [116, 122], monte: [8, 12], modes: ['dorien', 'mineur'], swing: .06, reg: 67, cap: 84, pompe: .32, ferme: 3400, balaye: true,
      grilles: { dorien: ['0:m9 5:9 0:m9 5:9', '0:m9 3:maj9 5:9 0:m9', '0:m9 0:m9 5:9 5:9', '3:maj9 5:9 0:m9 10:maj9', '0:m9 10:maj9 5:9 0:m9', '0:m9 2:m7 3:maj9 5:9'],
        mineur: ['0:m9 8:maj9 0:m9 8:maj9', '0:m9 3:maj9 8:maj9 10:6', '5:m9 0:m9 8:maj9 7:7', '0:m9 0:m9 8:maj9 8:maj9'] },
      keysT: ['rhodes', 'clav', 'dx'], leadT: { talkbox: 2.5, saxo: 2, guitare: 2, carre: 1.5, cuivre: 1.5, sifflet: 1, steel: .9, chip: .7 }, trans: { run: 1.5, roll: 2, filtre: 2.5, souffle: 1.5, trou: 1.5, begaie: .5, rien: 3 }, basseT: ['funk', 'slap', 'roule'], cells: [1, 2, 2, 3, 4], fill: ['roll', 'run'],
      phrases: { riff: 2, appel: 2, classique: 1.5, envol: .8, longues: .6 },
      kit: { f0: [140, 170], f1: [48, 54], dec: [.3, .4], clic: [.1, .18], drive: [1, 1.4], snare: ['clap', 'grosse', 'rim'] },
      pat: { kick: ['X...X...X...X...', 'X...X...X...X..x'], snare: ['....X.......X...', '....X.......X..o'], hat: ['o.x.o.x.o.x.o.x.', 'xoxoxoxoxoxoxoxo'], hatD: 'xoxoXoxoxoxoXoxo', hatO: ['..X...X...X...X.'],
        fant: ['.......o.......o'], perc: ['oxoxoxoxoxoxoxox', '...H..L....H.L..'],
        basse: [[[2, 0, 2], [6, 0, 2], [10, 0, 2], [14, 0, 2]], [[0, 0, 2], [3, 12, 1], [6, 0, 2], [8, 0, 2], [11, 12, 1], [14, 7, 2]], [[2, 0, 1], [3, 12, 1], [6, 0, 2], [10, 0, 1], [11, 12, 1], [14, 't', 2]]],
        keys: [[[2, 2], [6, 2], [10, 2], [14, 2]], [[0, 3], [3, 2], [6, 2], [10, 3], [14, 2]], [[0, 2], [3, 1], [6, 2], [8, 1], [10, 2], [13, 1], [14, 2]]], stab: [[[3, 1], [6, 1], [11, 1], [14, 1]], [[0, 1], [3, 1], [8, 1], [11, 1]]], arp: ['up8', 'updown16'] },
      ouv: [['keys', 'kick', 'hat'], ['basse', 'keys', 'hat'], ['pad', 'keys', 'lead'], ['stab', 'kick', 'basse']],
      ordre: ['keys!', 'kick', 'hat', 'basse', 'snare', 'pad', 'lead', 'pompe', 'i_filtre', 'stab', 'hatO', 'contre', 'perc', 'i_basse', 'clarte', 'i_keys', 'i_frappe', 'fant', 'cordes',
        'i_dense', 'double', 'octave', 'i_basseOct', 'i_tambours', 'choeur', 'i_pulse', 'i_monte', 'modul', 'i_sommet', 'final!'] },
    luxe: { nom: 'LUXE', dit: 'trap de luxe nonchalante', bpm: [130, 140], monte: [6, 10], modes: ['mineur', 'dorien'], swing: .05, reg: 70, cap: 86, pompe: .65, ferme: 4200, demi: true,
      grilles: { mineur: ['0:m9 0:m9 5:m9 5:m9', '0:m9 0:m9 8:maj9 8:maj9', '0:m9 8:maj9 0:m9 8:maj9', '5:m9 5:m9 0:m9 0:m9', '0:m9 0:m9 0:m9 7:7sus', '0:m9 8:maj9 3:maj9 10:6',
        '0:m9 0:m9 3:maj9 3:maj9', '8:maj9 8:maj9 0:m9 0:m9'],
        dorien: ['0:m9 0:m9 5:9 5:9', '0:m9 5:9 0:m9 5:9', '0:m9 0:m9 10:maj9 10:maj9'] },
      keysT: ['rhodes', 'piano', 'harpe', 'dx'], leadT: { verre: 2.5, flute: 2, kalimba: 2, theremine: 2, sifflet: 1.5, guitare: 1.5, saxo: 1.5, steel: 1 }, basseT: ['808', '808dur', 'sub808'], trans: { hats: 2.5, glisse: 2, souffle: 2, trou: 2, begaie: 1, filtre: 1, rien: 3 }, cells: [2, 2, 3, 4, 6, 8], fill: ['hats'],
      phrases: { appel: 2.5, longues: 2, classique: 1, riff: 1.2 },
      kit: { f0: [130, 160], f1: [40, 46], dec: [.55, .85], clic: [.05, .12], drive: [1.4, 2.2], snare: ['clap', 'rim', 'grosse'] },
      pat: { kick: ['X.........x.....', 'X......x..x.....', 'X.....x...X..x..'], snare: ['........X.......'], hat: ['x.x.x.x.x.x.x.x.', 'xxx.x.x.xxx.x.x.'], hatD: 'xxxxxxxxxxxxxxxx',
        hatO: ['......x.........'], fant: ['.............o..'], perc: ['........x.......', '..H...L...H.....'],
        basse: [[[0, 0, 10], [10, 0, 6]], [[0, 0, 6], [7, 0, 3], [10, 12, 3], [13, 0, 3]], [[0, 0, 3], [3, 0, 3], [6, 7, 4], [10, 0, 6]]],
        keys: [[[0, 8], [8, 8]], [[0, 6], [10, 6]], [[0, 6], [7, 3], [10, 6]]], stab: [[[0, 2], [3, 2], [8, 2]]], arp: ['rand8', 'up8'] },
      ouv: [['keys', 'hat', 'basse'], ['pad', 'keys', 'lead'], ['basse', 'hat', 'keys'], ['lead', 'keys', 'hat']],
      ordre: ['keys!', 'hat', 'basse', 'kick', 'snare', 'pad', 'lead', 'roll', 'i_filtre', 'contre', 'vinyl', 'i_basse', 'cloche', 'hatO', 'clarte', 'i_frappe', 'fant', 'cordes', 'i_dense',
        'i_relance', 'double', 'octave', 'i_basseOct', 'i_tambours', 'i_sature', 'i_pulse', 'i_monte', 'modul', 'i_sommet', 'final!'] },
    // DRIFT : le phonk de drift — la cloche de vache chante le riff dès le 1er moteur, la 808 saturée, le phrygien (la seconde mineure),
    // des accords de TROIS sons (le monde des m9 laissé aux autres), les pneus qui crissent accordés
    drift: { nom: 'DRIFT', dit: 'phonk de drift', bpm: [124, 134], monte: [8, 12], modes: ['sombre', 'mineur'], swing: .03, reg: 69, cap: 82, pompe: .5, ferme: 3600, voixB: ['haut', 'haut', 'pluck'],
      grilles: { sombre: ['0:m 1:M 0:m 1:M', '0:m 0:m 8:M 1:M', '0:m 5:m 1:M 0:m', '0:m 10:m 8:M 1:M', '0:m 3:M 8:M 1:M', '0:m 0:m 1:M 1:M'],
        mineur: ['0:m 8:M 10:M 0:m', '0:m 0:m 8:M 7:m', '0:m 5:m 8:M 7:m', '0:m 3:M 10:M 8:M'] },
      keysT: ['piano', 'orgue', 'dx'], leadT: { cowbell: 4, carre: 1, theremine: 1, verre: .8, chip: .8, sifflet: .6 }, trans: { hats: 2, begaie: 2, glisse: 2, trou: 2, souffle: 1.5, toms: 1, rien: 2.5 },
      basseT: ['808dur', '808', 'sub808'], cells: [1, 1, 2, 2, 3, 4], fill: ['hats', 'toms'], phrases: { riff: 4, appel: 1.5, envol: 1 },
      kit: { f0: [165, 195], f1: [44, 50], dec: [.4, .55], clic: [.15, .25], drive: [2, 3], snare: ['clap', 'rim'] },
      pat: { kick: ['X.....X...X.....', 'X.......X.X.....', 'X..X......X..X..'], snare: ['....X.......X...', '....X.......X..x'], hat: ['x.x.x.x.x.x.x.x.', 'x.xxx.x.x.xxx.x.'], hatD: 'xxxxxxxxxxxxxxxx',
        hatO: ['..x...x...x...x.'], fant: ['...........o..o.'], perc: ['...H..L....H.L..', '..H...L...H..L..'],
        basse: [[[0, 0, 6], [6, 0, 4], [10, 12, 6]], [[0, 0, 4], [4, 7, 2], [6, 0, 4], [10, 0, 2], [12, 12, 4]], [[0, 0, 3], [3, 0, 3], [6, 0, 2], [8, 12, 4], [12, 0, 4]]],
        keys: [[[0, 16]], [[0, 8], [8, 8]], [[0, 6], [6, 6], [12, 4]]], stab: [[[0, 1], [3, 1], [6, 1], [10, 1]]], arp: ['up16', 'rand8'] },
      ouv: [['lead', 'basse', 'kick'], ['basse', 'lead', 'hat'], ['keys', 'lead', 'basse']],
      ordre: ['lead!', 'basse', 'kick', 'snare', 'hat', 'pad', 'roll', 'i_filtre', 'keys', 'fant', 'pompe', 'i_basse', 'hatO', 'contre', 'perc', 'clarte', 'i_frappe', 'choeur', 'i_dense', 'octave',
        'i_relance', 'double', 'i_basseOct', 'i_tambours', 'i_sature', 'i_pulse', 'i_monte', 'modul', 'i_sommet', 'final!'] },
    // TOUGE : l'eurobeat des cols de montagne — 148-156 BPM, la basse qui rebondit en octaves, les cuivres sur les contretemps, le supersaw,
    // les grilles qui montent (VI · VII · i)
    touge: { nom: 'TOUGE', dit: 'eurobeat de col de montagne', bpm: [148, 156], monte: [5, 8], modes: ['mineur'], swing: 0, reg: 71, cap: 84, pompe: .5, ferme: 4400,
      grilles: { mineur: ['0:m 8:M 10:M 0:m', '8:M 10:M 0:m 0:m', '0:m 10:M 8:M 10:M', '5:m 10:M 3:M 8:M', '8:M 10:M 7:m 0:m', '0:m 8:M 3:M 10:M', '0:m7 5:m7 10:M 3:maj7', '8:maj7 10:M 0:m 0:m'] },
      keysT: ['piano', 'dx', 'orgue'], leadT: { scie: 3, cuivre: 2.5, guitareSat: 2, carre: 1.5, chip: 1.2, saxo: 1, verre: 1 }, trans: { run: 2, roll: 2.5, toms: 2, souffle: 1.5, filtre: 1, begaie: .8, rien: 2.5 },
      basseT: ['roule', 'acid', 'funk'], cells: [1, 2, 2, 3, 4], fill: ['roll', 'toms'], phrases: { envol: 2.5, classique: 2, riff: 1.5, longues: 1 },
      kit: { f0: [155, 185], f1: [46, 52], dec: [.28, .38], clic: [.15, .22], drive: [1.3, 1.8], snare: ['grosse', 'clap'] },
      pat: { kick: ['X...X...X...X...'], snare: ['....X.......X...', '....X.......X.x.'], hat: ['..x...x...x...x.', 'x.x.x.x.x.x.x.x.'], hatD: 'xoxoxoxoxoxoxoxo', hatO: ['..x...x...x...x.'],
        fant: ['......o.......o.'], perc: ['oxoxoxoxoxoxoxox'],
        basse: [[[0, 0, 1], [2, 12, 1], [4, 0, 1], [6, 12, 1], [8, 0, 1], [10, 12, 1], [12, 0, 1], [14, 12, 1]],
          [[0, 0, 1], [1, 12, 1], [2, 0, 1], [3, 12, 1], [4, 0, 1], [5, 12, 1], [6, 0, 1], [7, 12, 1], [8, 0, 1], [9, 12, 1], [10, 0, 1], [11, 12, 1], [12, 0, 1], [13, 12, 1], [14, 0, 1], [15, 12, 1]]],
        keys: [[[0, 2], [3, 2], [6, 2], [10, 2], [12, 2]], [[0, 4], [6, 2], [8, 4], [14, 2]]], stab: [[[2, 1], [6, 1], [10, 1], [14, 1]]], arp: ['up16', 'updown16'],
        cuiv: [[[0, 4], [6, 2], [10, 4]], [[0, 2], [3, 2], [6, 2], [10, 2], [14, 1]]] },
      ouv: [['arp', 'basse', 'kick'], ['lead', 'arp', 'kick'], ['pad', 'arp', 'basse']],
      ordre: ['arp!', 'basse', 'kick', 'hat', 'snare', 'lead', 'cuivres', 'pad', 'i_filtre', 'keys', 'pompe', 'contre', 'i_basse', 'hatO', 'clarte', 'i_frappe', 'cordes', 'fant', 'i_dense', 'octave',
        'i_relance', 'double', 'i_basseOct', 'i_tambours', 'harmo', 'i_sature', 'i_pulse', 'i_monte', 'modul', 'final!'] },
    // HYPERVITESSE : la drum & bass liquide — 170-176, la grosse caisse sur le 1 et le « et » du 2, la reese, le Rhodes, des notes tenues
    dnb: { nom: 'HYPERVITESSE', dit: 'drum & bass liquide', bpm: [170, 176], monte: [2, 4], modes: ['mineur', 'dorien'], swing: 0, reg: 70, cap: 84, pompe: .6, ferme: 3800,
      grilles: { mineur: ['0:m9 8:maj9 3:maj9 10:6', '0:m9 0:m9 8:maj9 10:6', '5:m9 8:maj9 0:m9 0:m9', '0:m9 3:maj9 8:maj9 7:7sus'], dorien: ['0:m9 5:9 0:m9 5:9', '0:m9 3:maj9 5:9 10:maj9'] },
      keysT: ['rhodes', 'dx', 'piano'], leadT: { verre: 2, flute: 1.5, sifflet: 1.2, theremine: 1, saxo: 1, kalimba: 1 }, trans: { roll: 2, souffle: 2, trou: 2, filtre: 2, begaie: 1, rien: 2.5 },
      basseT: ['reese', 'sub808', 'roule'], cells: [2, 3, 4, 4, 6, 8], fill: ['roll'], phrases: { longues: 2.5, appel: 2, envol: 1, classique: 1 },
      kit: { f0: [150, 175], f1: [48, 54], dec: [.25, .35], clic: [.12, .2], drive: [1.1, 1.5], snare: ['grosse', 'clap'] },
      pat: { kick: ['X.........X.....', 'X.........X..x..', 'X.X.......X.....'], snare: ['....X.......X...', '....X..o....X..o'], hat: ['x.x.x.x.x.x.x.x.', 'x.xxx.x.x.xxx.x.'], hatD: 'xoxoxoxoxoxoxoxo',
        hatO: ['......x.......x.'], fant: ['.......o.o.....o'], perc: ['oxoxoxoxoxoxoxox'], basse: [[[0, 0, 12], [12, 0, 4]], [[0, 0, 6], [6, 0, 4], [10, 7, 6]], [[0, 0, 3], [3, 12, 3], [6, 0, 4], [10, 0, 6]]],
        keys: [[[0, 16]], [[0, 6], [6, 10]], [[0, 3], [6, 3], [10, 6]]], stab: [[[0, 2], [6, 2], [10, 2]]], arp: ['up8', 'rand8'] },
      ouv: [['pad', 'keys', 'hat'], ['keys', 'pad', 'basse'], ['pad', 'lead', 'keys']],
      ordre: ['pad!', 'keys', 'hat', 'basse', 'kick', 'snare', 'lead', 'i_filtre', 'fant', 'sub', 'contre', 'i_basse', 'hatO', 'clarte', 'i_frappe', 'cordes', 'perc', 'i_dense', 'octave', 'i_relance',
        'double', 'i_basseOct', 'i_tambours', 'harmo', 'i_sature', 'i_pulse', 'i_monte', 'modul', 'i_sommet', 'final!'] },
    // BOULE À FACETTES : le disco funk — dorien ou mixolydien (des accords de septième de dominante), la basse en octaves, le clavinet
    // en doubles croches, les charleys ouverts sur les contretemps, les congas, les cuivres
    disco: { nom: 'BOULE À FACETTES', dit: 'disco funk', bpm: [114, 122], monte: [8, 12], modes: ['dorien', 'mixolydien'], swing: .04, reg: 69, cap: 84, pompe: .4, ferme: 3600,
      grilles: { dorien: ['0:m7 5:9 0:m7 5:9', '0:m9 5:9 3:maj7 5:9', '0:m7 0:m7 5:9 7:m7'], mixolydien: ['0:9 10:M 5:M 0:9', '0:7 5:M 10:M 5:M', '0:9 0:9 10:6 5:maj7'] },
      keysT: ['clav', 'piano', 'rhodes'], leadT: { cuivre: 2.5, saxo: 2, talkbox: 2, guitare: 2, sifflet: 1 }, trans: { run: 2, roll: 1.5, toms: 1.5, filtre: 1.5, souffle: 1, rien: 2.5 },
      basseT: ['slap', 'funk', 'roule'], cells: [1, 2, 2, 3, 4], fill: ['toms', 'roll'], phrases: { riff: 2, classique: 1.5, appel: 1.5, envol: 1 },
      kit: { f0: [140, 165], f1: [48, 54], dec: [.3, .4], clic: [.1, .18], drive: [1, 1.3], snare: ['clap', 'grosse'] },
      pat: { kick: ['X...X...X...X...'], snare: ['....X.......X...'], hat: ['x.x.x.x.x.x.x.x.', 'xxxxxxxxxxxxxxxx'], hatD: 'xxxxxxxxxxxxxxxx', hatO: ['..x...x...x...x.'],
        fant: ['.......o.......o'], perc: ['..H...L...H.H.L.', 'oxoxoxoxoxoxoxox'],
        basse: [[[0, 0, 1], [2, 12, 1], [4, 0, 1], [6, 12, 1], [8, 0, 1], [10, 12, 1], [12, 0, 1], [14, 12, 1]], [[0, 0, 2], [3, 12, 1], [6, 0, 1], [7, 12, 1], [10, 0, 2], [12, 7, 1], [14, 12, 2]]],
        keys: [[[0, 1], [3, 1], [6, 1], [8, 1], [11, 1], [14, 1]], [[0, 2], [4, 1], [6, 2], [10, 1], [12, 2]], [[0, 1], [2, 1], [3, 1], [6, 1], [8, 1], [10, 1], [11, 1], [14, 1]]],
        stab: [[[2, 1], [6, 1], [10, 1], [14, 1]]], arp: ['up8'], cuiv: [[[0, 2], [3, 2], [12, 4]], [[6, 2], [10, 2], [14, 2]]] },
      ouv: [['basse', 'kick', 'hat'], ['keys', 'basse', 'hatO'], ['cordes', 'kick', 'basse']],
      ordre: ['basse!', 'kick', 'hat', 'keys', 'snare', 'hatO', 'lead', 'cuivres', 'i_filtre', 'perc', 'pompe', 'cordes', 'i_basse', 'contre', 'clarte', 'i_keys', 'i_frappe', 'fant', 'choeur', 'i_dense',
        'double', 'octave', 'i_basseOct', 'i_tambours', 'harmo', 'i_pulse', 'i_monte', 'modul', 'i_sommet', 'final!'] },
    // 2-STEP : le UK garage — la grosse caisse qui saute des temps, la balance lourde, l'orgue en accords hachés, le chœur découpé
    garage: { nom: '2-STEP', dit: 'UK garage', bpm: [130, 134], monte: [4, 7], modes: ['mineur', 'dorien'], swing: .12, reg: 68, cap: 84, pompe: .45, ferme: 3500,
      grilles: { mineur: ['0:m9 5:m9 8:maj9 7:7sus', '0:m9 8:maj9 5:m9 5:m9', '3:maj9 5:m9 0:m9 0:m9'], dorien: ['0:m9 5:9 3:maj9 5:9', '0:m7 5:9 0:m7 2:m7'] },
      keysT: ['orgue', 'rhodes', 'dx'], leadT: { talkbox: 2, verre: 2, sifflet: 1.5, carre: 1, kalimba: 1, theremine: .8 }, trans: { begaie: 2.5, trou: 2, filtre: 2, glisse: 1.5, hats: 1.5, rien: 2.5 },
      basseT: ['sub808', 'reese', 'funk'], cells: [1, 2, 2, 3], fill: ['hats'], phrases: { appel: 2.5, riff: 2, classique: 1 },
      kit: { f0: [150, 175], f1: [46, 52], dec: [.3, .42], clic: [.12, .2], drive: [1.2, 1.6], snare: ['rim', 'clap'] },
      pat: { kick: ['X.........X.....', 'X......X..X.....', 'X.........X..x..'], snare: ['....X.......X...'], hat: ['..x...x...x...x.', 'x.xox.xox.xox.xo'], hatD: 'xoxoxoxoxoxoxoxo', hatO: ['......x.......x.'],
        fant: ['...o.....o......'], perc: ['...H......L.....'], basse: [[[0, 0, 3], [6, 0, 2], [10, 12, 2], [13, 0, 3]], [[0, 0, 2], [3, 0, 1], [6, 7, 2], [10, 0, 3], [14, 12, 2]]],
        keys: [[[0, 2], [6, 2], [11, 2]], [[0, 1], [3, 1], [6, 2], [11, 1], [14, 2]]], stab: [[[3, 1], [6, 1], [11, 1], [14, 1]]], arp: ['rand8'],
        chop: [[[0, 1], [3, 1], [6, 2]], [[8, 1], [10, 1], [14, 2]]] },
      ouv: [['keys', 'hat', 'basse'], ['choeur', 'keys', 'hat'], ['basse', 'hat', 'kick']],
      ordre: ['keys!', 'hat', 'basse', 'kick', 'snare', 'choeur', 'lead', 'i_filtre', 'fant', 'stab', 'pompe', 'perc', 'i_basse', 'hatO', 'contre', 'clarte', 'i_frappe', 'pad', 'i_keys', 'i_dense',
        'double', 'octave', 'i_basseOct', 'i_tambours', 'i_sature', 'i_pulse', 'i_monte', 'modul', 'i_sommet', 'final!'] },
    // NUIT LO-FI : 84-90 qui monte vers 100, la balance d'un batteur fatigué, le vinyle, le Rhodes, la mélodie posée
    lofi: { nom: 'NUIT LO-FI', dit: 'lo-fi hip-hop', bpm: [84, 90], monte: [14, 18], modes: ['dorien', 'mineur'], swing: .18, reg: 66, cap: 81, pompe: .5, ferme: 2600,
      grilles: { dorien: ['0:m9 5:9 0:m9 5:9', '0:m9 3:maj9 2:m7 5:9', '3:maj9 2:m7 0:m9 0:m9'], mineur: ['0:m9 8:maj9 3:maj9 7:7sus', '5:m9 7:7sus 0:m9 8:maj9'] },
      keysT: ['rhodes', 'piano', 'harpe'], leadT: { kalimba: 2, flute: 2, guitare: 2, sifflet: 1.2, verre: 1, steel: .8 }, trans: { filtre: 2.5, trou: 1.5, souffle: 1.5, glisse: 1, rien: 3 },
      basseT: ['sub808', 'funk', '808'], cells: [2, 3, 4, 6, 8], fill: ['roll'], phrases: { longues: 2, appel: 2, classique: 1.5 },
      kit: { f0: [120, 145], f1: [44, 50], dec: [.35, .5], clic: [.04, .1], drive: [1.2, 1.8], snare: ['rim', 'clap'] },
      pat: { kick: ['X......xX.x.....', 'X.....x...X.....', 'X......x..X..x..'], snare: ['....X.......X...'], hat: ['x.x.x.x.x.x.x.x.', 'x.xxx.x.x.x.xxx.'], hatD: 'xxxxxxxxxxxxxxxx', hatO: ['..............x.'],
        fant: ['.......o...o....'], perc: ['oxoxoxoxoxoxoxox'], basse: [[[0, 0, 6], [8, 0, 3], [11, 7, 5]], [[0, 0, 3], [3, 0, 3], [8, 12, 3], [11, 0, 5]]],
        keys: [[[0, 8], [8, 8]], [[0, 3], [3, 5], [10, 6]], [[0, 2], [3, 3], [7, 2], [10, 3], [14, 2]]], arp: ['up8'] },
      ouv: [['keys', 'vinyl', 'hat'], ['vinyl', 'keys', 'basse'], ['keys', 'lead', 'vinyl']],
      ordre: ['keys!', 'vinyl', 'hat', 'basse', 'kick', 'snare', 'lead', 'i_filtre', 'fant', 'pad', 'contre', 'i_basse', 'perc', 'clarte', 'i_keys', 'i_frappe', 'cordes', 'hatO', 'i_dense', 'octave',
        'i_relance', 'double', 'i_basseOct', 'i_tambours', 'harmo', 'i_pulse', 'i_monte', 'modul', 'i_sommet', 'final!'] },
    // TURBINE : le big beat — des accords de QUINTE à la guitare saturée en croches, le breakbeat, la ride, les toms, la guitare qui chante
    rock: { nom: 'TURBINE', dit: 'big beat à guitares', bpm: [132, 140], monte: [5, 8], modes: ['mineur', 'sombre'], swing: 0, reg: 66, cap: 82, pompe: .7, ferme: 4000,
      grilles: { mineur: ['0:5 8:5 10:5 0:5', '0:5 0:5 3:5 10:5', '0:5 10:5 8:5 7:5', '5:5 8:5 0:5 0:5'], sombre: ['0:5 1:5 0:5 1:5', '0:5 3:5 1:5 0:5'] },
      keysT: ['guitare'], leadT: { guitareSat: 3, scie: 1.5, cuivre: 1, theremine: .6 }, trans: { toms: 2.5, roll: 2, trou: 2, souffle: 1, rien: 2 },
      basseT: ['roule', 'funk', 'acid'], cells: [1, 2, 2, 3, 4], fill: ['toms'], phrases: { riff: 3, classique: 1.5, envol: 1 },
      kit: { f0: [140, 165], f1: [50, 56], dec: [.3, .4], clic: [.18, .26], drive: [1.6, 2.4], snare: ['grosse', 'clap'] },
      pat: { kick: ['X.X.......X.....', 'X.....X.X.X.....', 'X.X.....X.X..X..'], snare: ['....X.......X...', '....X.......X.X.'], hat: ['x.x.x.x.x.x.x.x.'], hatD: 'xxxxxxxxxxxxxxxx', hatO: ['x.......x.......'],
        fant: ['.......o......o.'], basse: [[[0, 0, 1], [2, 0, 1], [4, 0, 1], [6, 0, 1], [8, 0, 1], [10, 0, 1], [12, 0, 1], [14, 0, 1]], [[0, 0, 2], [3, 0, 1], [4, 12, 1], [6, 0, 2], [8, 0, 1], [10, 7, 2], [12, 12, 1], [14, 0, 2]]],
        keys: [[[0, 1], [2, 1], [4, 1], [6, 1], [8, 1], [10, 1], [12, 1], [14, 1]], [[0, 3], [3, 3], [6, 2], [8, 3], [11, 3], [14, 2]]], arp: ['up8'] },
      ouv: [['keys', 'kick', 'basse'], ['keys', 'basse', 'hat'], ['lead', 'keys', 'kick']],
      ordre: ['keys!', 'kick', 'basse', 'snare', 'hat', 'lead', 'toms', 'i_filtre', 'ride', 'pompe', 'i_basse', 'contre', 'clarte', 'i_frappe', 'fant', 'cordes', 'hatO', 'i_dense', 'octave', 'i_relance',
        'double', 'i_basseOct', 'i_tambours', 'harmo', 'i_sature', 'i_pulse', 'i_monte', 'modul', 'i_sommet', 'final!'] },
    // PIXEL : la chiptune d'arcade — la basse triangle, les accords 8 bits, la puce, des arpèges rapides ; parfois en MAJEUR (la joie)
    pixel: { nom: 'PIXEL', dit: 'chiptune d’arcade', bpm: [148, 158], monte: [4, 7], modes: ['mineur', 'majeur'], modeW: { majeur: 1.6 }, swing: 0, reg: 70, cap: 84, pompe: .3, ferme: 5000,
      grilles: { mineur: ['0:m 8:M 10:M 0:m', '0:m 3:M 10:M 8:M', '5:m 0:m 8:M 10:M', '0:m 8:M 5:m 7:m'], majeur: ['0:M 9:m 5:M 7:M', '0:M 7:M 9:m 5:M', '5:M 7:M 0:M 0:M'] },
      keysT: ['puce'], leadT: { chip: 4, carre: 2, sifflet: .6 }, pluckT: ['puce', 'fm'], contreT: ['orgue', 'flute'], trans: { run: 2.5, begaie: 2.5, hats: 1.5, trou: 1, rien: 2 },
      basseT: ['tri', 'acid'], cells: [1, 1, 2, 2, 3, 4], fill: ['hats'], phrases: { riff: 2, envol: 2, classique: 2 },
      kit: { f0: [180, 220], f1: [60, 70], dec: [.12, .18], clic: [.2, .3], drive: [1.5, 2.5], snare: ['puce'] },
      pat: { kick: ['X...X...X...X...', 'X.....X.X...X...'], snare: ['....X.......X...'], hat: ['x.x.x.x.x.x.x.x.'], hatD: 'xxxxxxxxxxxxxxxx', hatO: ['..x...x...x...x.'], fant: ['...........o.o..'],
        basse: [[[0, 0, 2], [2, 12, 2], [4, 0, 2], [6, 12, 2], [8, 0, 2], [10, 12, 2], [12, 0, 2], [14, 12, 2]],
          [[0, 0, 1], [1, 12, 1], [2, 0, 1], [3, 12, 1], [4, 0, 1], [5, 12, 1], [6, 0, 1], [7, 12, 1], [8, 0, 1], [9, 12, 1], [10, 0, 1], [11, 12, 1], [12, 0, 1], [13, 12, 1], [14, 0, 1], [15, 12, 1]]],
        keys: [[[0, 2], [4, 2], [8, 2], [12, 2]], [[0, 1], [2, 1], [4, 1], [6, 1], [8, 1], [10, 1], [12, 1], [14, 1]]], arp: ['up16', 'updown16'] },
      ouv: [['arp', 'basse', 'kick'], ['lead', 'arp', 'basse'], ['basse', 'arp', 'hat']],
      ordre: ['arp!', 'basse', 'kick', 'lead', 'snare', 'hat', 'keys', 'i_filtre', 'contre', 'fant', 'i_basse', 'hatO', 'clarte', 'i_frappe', 'cloche', 'harmo', 'i_dense', 'octave', 'i_relance', 'roll',
        'double', 'i_basseOct', 'i_tambours', 'i_sature', 'i_pulse', 'i_monte', 'modul', 'i_sommet', 'pompe', 'final!'] },
    // GRAND PRIX : l'épique — les cordes ouvrent, l'ostinato de bois, les toms, les cuivres, le chœur, la dominante (V7) qui tire vers le i
    epique: { nom: 'GRAND PRIX', dit: 'épique orchestral', bpm: [136, 144], monte: [5, 8], modes: ['mineur'], swing: 0, reg: 67, cap: 83, pompe: .5, ferme: 4200,
      grilles: { mineur: ['0:m 8:M 5:m 7:7', '0:m 8:M 3:M 10:M', '0:m 5:m 8:M 7:7sus', '8:M 10:M 0:m 0:m', '0:m 3:M 8:M 7:7'] },
      keysT: ['piano', 'harpe'], leadT: { cuivre: 3, flute: 1.5, theremine: .8, verre: 1, sifflet: .7 }, pluckT: ['bois', 'verre'], contreT: ['violon', 'voix'], padT: ['voix', 'doux'],
      trans: { toms: 3, roll: 2, souffle: 2, trou: 1, rien: 2 }, basseT: ['roule', 'sub808', 'reese'], cells: [2, 2, 3, 4, 6], fill: ['toms'], phrases: { envol: 2.5, longues: 2, classique: 1.5 },
      kit: { f0: [120, 140], f1: [40, 46], dec: [.5, .7], clic: [.05, .1], drive: [1.2, 1.6], snare: ['grosse', 'clap'] },
      pat: { kick: ['X.......X.......', 'X.....X.X.......'], snare: ['....X.......X...'], hat: ['x...x...x...x...', 'x.x.x.x.x.x.x.x.'], hatD: 'x.x.x.x.x.x.x.x.', hatO: ['........x.......'],
        fant: ['..............oo'], perc: ['..H...H...H.L.L.'], basse: [[[0, 0, 4], [4, 0, 4], [8, 0, 4], [12, 0, 4]], [[0, 0, 2], [2, 0, 2], [4, 12, 2], [6, 0, 2], [8, 0, 2], [10, 0, 2], [12, 12, 2], [14, 7, 2]]],
        keys: [[[0, 8], [8, 8]], [[0, 4], [4, 4], [8, 4], [12, 4]]], arp: ['up16', 'updown16'], cuiv: [[[0, 6], [8, 6]], [[0, 3], [4, 3], [8, 8]]] },
      ouv: [['cordes', 'arp', 'toms'], ['arp', 'cordes', 'basse'], ['choeur', 'cordes', 'arp']],
      ordre: ['cordes!', 'arp', 'toms', 'basse', 'kick', 'snare', 'cuivres', 'lead', 'i_filtre', 'perc', 'choeur', 'i_basse', 'hat', 'clarte', 'i_frappe', 'contre', 'pad', 'i_dense', 'octave', 'i_relance',
        'double', 'i_basseOct', 'i_tambours', 'harmo', 'i_sature', 'i_pulse', 'i_monte', 'modul', 'i_sommet', 'final!'] },
    // MALECÓN : le dembow (la caisse en 3-3-2), le steel drum, la kalimba, le marimba, la 808 — le bord de mer la nuit
    dembow: { nom: 'MALECÓN', dit: 'dembow tropical', bpm: [94, 100], monte: [10, 14], modes: ['mineur', 'dorien'], swing: .02, reg: 69, cap: 84, pompe: .5, ferme: 3800,
      grilles: { mineur: ['0:m 8:M 10:M 0:m', '0:m 3:M 8:M 10:M', '5:m 0:m 8:M 10:M', '0:m7 8:maj7 3:maj7 10:M'], dorien: ['0:m7 5:M 0:m7 5:M', '0:m 5:M 3:M 5:M'] },
      keysT: ['piano', 'harpe', 'dx'], leadT: { steel: 3, kalimba: 2.5, sifflet: 1.5, verre: 1, flute: 1, saxo: .8 }, pluckT: ['bois', 'verre', 'fm'], trans: { glisse: 2, begaie: 2, hats: 1.5, trou: 1.5, filtre: 1, rien: 2.5 },
      basseT: ['808', 'sub808'], cells: [1, 2, 2, 3, 4], fill: ['hats'], phrases: { riff: 2.5, appel: 2, classique: 1 },
      kit: { f0: [140, 165], f1: [44, 50], dec: [.4, .55], clic: [.1, .18], drive: [1.4, 2], snare: ['rim', 'clap'] },
      pat: { kick: ['X...X...X...X...'], snare: ['...x..x....x..x.'], hat: ['x.x.x.x.x.x.x.x.', 'x.xxx.x.x.xxx.x.'], hatD: 'xxxxxxxxxxxxxxxx', hatO: ['......x.......x.'],
        fant: ['...o..o....o..o.'], perc: ['..H..L....H..L..', 'oxoxoxoxoxoxoxox'], basse: [[[0, 0, 3], [3, 0, 3], [6, 0, 2], [8, 0, 3], [11, 0, 3], [14, 0, 2]], [[0, 0, 3], [3, 7, 3], [6, 12, 2], [8, 0, 3], [11, 7, 3], [14, 12, 2]]],
        keys: [[[3, 2], [6, 2], [11, 2], [14, 2]], [[0, 2], [3, 2], [6, 2], [8, 2], [11, 2], [14, 2]]], stab: [[[3, 1], [6, 1], [11, 1], [14, 1]]], arp: ['rand8', 'up8'] },
      ouv: [['lead', 'perc', 'basse'], ['keys', 'perc', 'kick'], ['perc', 'basse', 'lead']],
      ordre: ['perc!', 'basse', 'kick', 'snare', 'lead', 'keys', 'hat', 'i_filtre', 'arp', 'pompe', 'fant', 'i_basse', 'contre', 'clarte', 'i_frappe', 'hatO', 'pad', 'i_keys', 'i_dense', 'octave',
        'double', 'i_basseOct', 'i_tambours', 'harmo', 'choeur', 'i_pulse', 'i_monte', 'modul', 'i_sommet', 'final!'] },
    // ZEF : le rave-rap sombre (mesuré sur Die Antwoord, « Age of Illusion » : 83 BPM, la mineur, deux accords do ↔ la m, la basse
    // +24 dB, le haut sombre, 13 dB de contraste — des ponts sans basse puis le drop) : demi-temps, la 808 saturée, les accords de rave
    zef: { nom: 'ZEF', dit: 'rave-rap sombre', bpm: [80, 86], monte: [14, 20], modes: ['mineur'], swing: .04, reg: 64, cap: 80, pompe: .55, ferme: 2400, basseDb: 3, respP: .95,
      grilles: { mineur: ['3:M 3:M 0:m 3:M', '0:m 0:m 3:M 3:M', '3:M 0:m 3:M 0:m', '0:m 3:M 0:m 7:m'] },
      keysT: ['piano', 'orgue'], leadT: { scie: 2.5, theremine: 2, chip: 1.5, carre: 1.5, sifflet: 1 }, pluckT: ['scie', 'puce'], padT: ['voix', 'scie'], contreT: ['voix', 'orgue'],
      trans: { trou: 3, begaie: 2, glisse: 2, souffle: 1.5, rien: 2 }, basseT: ['808dur', 'sub808', '808'], cells: [1, 2, 2, 3, 4], fill: ['hats'], phrases: { riff: 3, appel: 2, longues: 1 },
      kit: { f0: [150, 180], f1: [40, 46], dec: [.5, .7], clic: [.15, .25], drive: [2, 3], snare: ['clap', 'grosse'] },
      pat: { kick: ['X.........X.....', 'X......X..X.....', 'X.....X...X..X..'], snare: ['........X.......'], hat: ['x.x.x.x.x.x.x.x.', 'x.xxx.x.xxx.x.x.'], hatD: 'xxxxxxxxxxxxxxxx', hatO: ['..............x.'],
        fant: ['.............o..'], perc: ['........x.......'], basse: [[[0, 0, 10], [10, 0, 6]], [[0, 0, 6], [6, 0, 4], [10, 12, 6]], [[0, 0, 3], [3, 0, 3], [6, 0, 4], [10, 7, 6]]],
        keys: [[[0, 16]], [[0, 2], [3, 2], [6, 2], [10, 6]]], stab: [[[0, 2], [3, 2], [6, 2], [10, 2], [12, 2]], [[0, 1], [2, 1], [4, 1], [6, 1], [8, 1], [10, 1], [12, 1], [14, 1]]], arp: ['up16', 'rand8'] },
      ouv: [['pad', 'stab', 'basse'], ['keys', 'pad', 'lead'], ['stab', 'basse', 'hat']],
      ordre: ['pad!', 'stab', 'basse', 'kick', 'snare', 'hat', 'lead', 'i_filtre', 'fant', 'sub', 'choeur', 'i_basse', 'hatO', 'clarte', 'i_frappe', 'arp', 'keys', 'i_dense', 'octave', 'i_relance',
        'double', 'i_basseOct', 'i_tambours', 'roll', 'i_sature', 'i_pulse', 'i_monte', 'modul', 'i_sommet', 'final!'] },
    // STADE : l'indie rock en majeur (techniques de Stuck in the Sound, « Let's Go ») — les toms qui martèlent dès le 1er moteur, la guitare
    // grattée, la basse en croches, le chœur de stade sur le thème, les « HÉ ! », une énergie tenue longtemps
    stade: { nom: 'STADE', dit: 'indie rock de stade', bpm: [88, 92], monte: [16, 22], modes: ['majeur', 'mineur'], modeW: { majeur: 3 }, swing: 0, reg: 67, cap: 84, pompe: .4, ferme: 4600,
      grilles: { majeur: ['0:M 0:M 0:M 9:m', '0:M 9:m 5:M 7:M', '0:M 7:M 9:m 5:M', '5:M 0:M 7:M 9:m'], mineur: ['0:m 8:M 3:M 10:M', '0:m 0:m 8:M 10:M'] },
      keysT: ['guitareC', 'guitare'], leadT: { guitare: 2.5, sifflet: 1.5, carre: 1.5, scie: 1, cuivre: .8 }, trans: { toms: 3, roll: 2, trou: 2, souffle: 1, rien: 2 },
      basseT: ['roule', 'funk', 'slap'], cells: [1, 2, 2, 3, 4], fill: ['toms'], phrases: { riff: 2, classique: 2, envol: 1.5, appel: 1 },
      kit: { f0: [140, 165], f1: [50, 56], dec: [.3, .4], clic: [.15, .22], drive: [1.4, 2], snare: ['acoustique', 'clap'] },
      pat: { kick: ['X.....X.X.......', 'X.....X.X...X...', 'X.X...X.X.X.....'], snare: ['....X.......X...'], hat: ['x.x.x.x.x.x.x.x.'], hatD: 'xxxxxxxxxxxxxxxx', hatO: ['x...............'],
        fant: ['.......o.......o'], perc: ['oxoxoxoxoxoxoxox'], tribu: ['L.L.LL.L.L.LL.L.', 'L..L..L.L..L.LHH', 'LL.LL.L.LL.LL.HH'],
        basse: [[[0, 0, 1], [2, 0, 1], [4, 0, 1], [6, 0, 1], [8, 0, 1], [10, 0, 1], [12, 0, 1], [14, 0, 1]],
          [[0, 0, 1], [1, 0, 1], [2, 0, 1], [3, 0, 1], [4, 0, 1], [5, 0, 1], [6, 0, 1], [7, 0, 1], [8, 0, 1], [9, 0, 1], [10, 0, 1], [11, 0, 1], [12, 0, 1], [13, 0, 1], [14, 12, 1], [15, 0, 1]]],
        keys: [[[0, 2], [2, 2], [4, 2], [6, 2], [8, 2], [10, 2], [12, 2], [14, 2]], [[0, 3], [3, 3], [6, 2], [8, 3], [11, 3], [14, 2]]], arp: ['up8'] },
      ouv: [['tribu', 'keys', 'basse'], ['keys', 'tribu', 'kick'], ['tribu', 'basse', 'lead']],
      ordre: ['tribu!', 'keys', 'basse', 'kick', 'snare', 'hat', 'lead', 'i_filtre', 'foule', 'fant', 'i_basse', 'pompe', 'clarte', 'i_frappe', 'contre', 'hatO', 'cordes', 'i_dense', 'octave', 'i_relance',
        'double', 'i_basseOct', 'i_tambours', 'harmo', 'i_sature', 'i_pulse', 'i_monte', 'modul', 'i_sommet', 'final!'] },
  };
  ['rock', 'touge'].forEach(k => { COULEURS[k].ordre = COULEURS[k].ordre.map(x => x === 'harmo' ? 'foule' : x); });   // le chœur de stade chez TURBINE et TOUGE
  const COUL_IDS = Object.keys(COULEURS);
  const SIG = {
    moteur: { nom: 'le moteur qui chante', idee: 'le moteur qui chante à chaque phrase — vroum : fondamentale, quinte, octave', mots: ['V12', 'MOTEUR', 'RUGISSEMENT', 'PISTON'], besoin: ['v:moteur'] },
    turbo: { nom: 'le turbo', idee: 'le turbo qui souffle avant la mesure, un sifflet qui monte sur la note', mots: ['TURBO', 'SOUFFLE', 'BOOST', 'COMPRESSEUR'], besoin: ['s:turbo', 'v:siffle'] },
    caisse: { nom: 'la caisse enregistreuse', idee: 'la caisse enregistreuse qui sonne la tonique au début des phrases', mots: ['CAISSE', 'TICKET', 'RECETTE', 'TIROIR-CAISSE'], besoin: ['v:ching', 's:ka'] },
    pieces: { nom: 'la pluie de pièces', idee: 'des pièces accordées qui tintent sur les contretemps, une cascade en fin de phrase', mots: ['PLUIE D’OR', 'JACKPOT', 'PIÈCES', 'MONNAIE'], besoin: ['v:piece'] },
    neon: { nom: 'le néon', idee: 'une enseigne au néon qui grésille sur la fondamentale', mots: ['NÉON', 'ENSEIGNE', 'COURT-CIRCUIT', 'GRÉSIL'], besoin: ['v:neon', 's:hat'] },
    klaxon: { nom: 'les klaxons', idee: 'des coups de klaxon accordés à la fin des phrases', mots: ['KLAXON', 'BOULEVARD', 'BOUCHON', 'PÉRIPH'], besoin: ['v:klaxon'] },
    gouttes: { nom: 'les gouttes de verre', idee: 'des gouttes de verre qui tombent sur les notes de l’accord', mots: ['GOUTTES', 'AVERSE', 'CRISTAL', 'ROSÉE'], besoin: ['v:pluck'] },
    vapeur: { nom: 'les accords à l’envers', idee: 'des accords à l’envers qui aspirent la mesure suivante (vaporwave)', mots: ['VAPEUR', 'MIRAGE', 'CASSETTE', 'REFLET'], besoin: ['a:pad'] },
    sirene: { nom: 'la sirène au loin', idee: 'une sirène au loin, accordée sur l’accord, toutes les huit mesures', mots: ['SIRÈNE', 'POURSUITE', 'GYROPHARE', 'CAVALE'], besoin: ['v:sirene'] },
    drift: { nom: 'les pneus qui crissent', idee: 'les pneus qui crissent en glissade, accordés sur la quinte, une mesure sur deux', mots: ['DRIFT', 'GLISSADE', 'GOMME', 'TOKYO'], besoin: ['v:crisse'] },
  };
  // LA PRODUCTION DE CHAQUE STYLE (v3.6) : grosse caisse, charleys, salle [durée, brillance], réverbe, écho (en doubles croches), retour, saturation
  const PROD = {
    neon: { kickT: ['sine', '909'], hatT: ['metal', 'bruit'], salle: [2.2, 1.1], revB: .36, dly: 3, fb: .38, sat: 1.25 },
    velours: { kickT: ['909', 'sine'], hatT: ['bruit', 'metal'], salle: [1.4, .85], revB: .3, dly: 4, fb: .3, sat: 1.35 },
    luxe: { kickT: ['808', 'sine'], hatT: ['metal', 'fm'], salle: [3, .7], revB: .36, dly: 3, fb: .36, sat: 1.3 },
    drift: { kickT: ['808', '909'], hatT: ['metal', 'chip'], salle: [1, .6], revB: .26, dly: 2, fb: .3, sat: 1.7 },
    touge: { kickT: ['909', 'sine'], hatT: ['bruit', 'metal'], salle: [1.8, 1.1], revB: .32, dly: 3, fb: .32, sat: 1.4 },
    dnb: { kickT: ['acoustique', '909'], hatT: ['bruit', 'fm'], salle: [3.2, .8], revB: .38, dly: 6, fb: .35, sat: 1.2 },
    disco: { kickT: ['909', 'acoustique'], hatT: ['bruit', 'shaker'], salle: [1.2, 1], revB: .3, dly: 2, fb: .28, sat: 1.3 },
    garage: { kickT: ['909', 'sine'], hatT: ['fm', 'bruit'], salle: [1.6, .9], revB: .32, dly: 3, fb: .36, sat: 1.3 },
    lofi: { kickT: ['lofi', 'acoustique'], hatT: ['shaker', 'bruit'], salle: [.9, .5], revB: .28, dly: 4, fb: .3, sat: 1.6 },
    rock: { kickT: ['acoustique', '909'], hatT: ['bruit', 'metal'], salle: [1.3, .9], revB: .3, dly: 2, fb: .25, sat: 1.9 },
    pixel: { kickT: ['chip'], hatT: ['chip'], salle: [.7, 1.2], revB: .16, dly: 2, fb: .3, sat: 1.35 },
    epique: { kickT: ['grave', 'acoustique'], hatT: ['bruit', 'shaker'], salle: [4.2, .7], revB: .44, dly: 4, fb: .3, sat: 1.15 },
    dembow: { kickT: ['808', '909'], hatT: ['metal', 'shaker'], salle: [1.1, .9], revB: .3, dly: 3, fb: .32, sat: 1.4 },
    zef: { kickT: ['808', 'lofi'], hatT: ['metal', 'chip'], salle: [2.8, .5], revB: .3, dly: 4, fb: .4, sat: 1.75 },
    stade: { kickT: ['acoustique', '909'], hatT: ['bruit', 'shaker'], salle: [1.6, 1.1], revB: .32, dly: 2, fb: .25, sat: 1.6 },
  };
  for (const k in PROD) Object.assign(COULEURS[k], PROD[k]);
  COULEURS.rock.kit.snare = ['acoustique', 'grosse']; COULEURS.dnb.kit.snare = ['acoustique', 'clap']; COULEURS.epique.kit.snare = ['grosse', 'acoustique'];
  COULEURS.lofi.kit.snare = ['rim', 'acoustique', 'clap']; COULEURS.disco.kit.snare = ['clap', 'acoustique'];
  // PLUS DE LUMIÈRE (v3.6) : le majeur et le lydien
  const LUMIERE = {
    neon: { majeur: ['0:maj9 7:6 9:m9 5:maj9', '5:maj9 7:6 0:maj9 9:m9', '0:maj9 4:m7 5:maj9 7:6', '9:m9 5:maj9 0:maj9 7:6'] },
    velours: { majeur: ['0:maj9 9:m9 2:m9 7:9', '5:maj9 4:m7 2:m9 0:maj9', '0:maj9 0:maj9 5:maj9 5:maj9'] },
    lofi: { majeur: ['0:maj9 9:m9 5:maj9 7:7sus', '5:maj9 7:7sus 4:m7 9:m9'], lydien: ['0:maj9 2:9 0:maj9 2:9', '0:maj9 2:9 7:maj9 7:maj9'] },
    dnb: { majeur: ['0:maj9 4:m7 5:maj9 7:6', '5:maj9 7:6 9:m9 9:m9'], lydien: ['0:maj9 2:9 0:maj9 2:9'] },
    disco: { majeur: ['0:maj7 9:m7 2:m7 7:9', '0:maj9 5:maj9 2:m9 7:9'] },
    garage: { majeur: ['5:maj9 4:m7 2:m9 0:maj9', '0:maj9 9:m9 5:maj9 7:6'] },
    epique: { majeur: ['0:M 7:M 9:m 5:M', '5:M 7:M 0:M 0:M', '0:M 4:m 5:M 7:M', '9:m 5:M 0:M 7:M'] },
  };
  for (const k in LUMIERE) for (const md in LUMIERE[k]) { COULEURS[k].grilles[md] = LUMIERE[k][md]; if (!COULEURS[k].modes.includes(md)) COULEURS[k].modes.push(md); }
  // LES VRAIS INSTRUMENTS DE CHAQUE STYLE (poids ajoutés aux timbres du style ; kit : probabilité qu'une partie prenne le vrai)
  const VRAIS_STYLE = {
    neon: { keys: { '@piano': 1.5, '@harpe': 1 }, lead: { '@violonSolo': 1, '@trompette': .8 }, pluck: { '@harpe': 1.2, '@glock': 1, '@marimba': .6 }, contre: { '@violonSolo': .8, '@cor': 1 }, pad: { '@violons': 1.2 }, cordes: { '@cordes': 1.5 }, kit: { crash: .5, riser: .4 } },
    velours: { keys: { '@piano': 2 }, lead: { '@trompetteSourd': 1.5, '@clarinette': 1, '@flute': .8 }, pluck: { '@violonsPizz': 1, '@harpe': 1 }, contre: { '@flute': 1.5, '@clarinette': 1 }, cordes: { '@cordes': 1.5 }, kit: { perc: .6, crash: .3 }, retouche: { lofi: 1, aucune: 2 } },
    luxe: { keys: { '@piano': 2, '@harpe': 2 }, lead: { '@flute': 3, '@violonSolo': 1.5 }, pluck: { '@glock': 2, '@harpe': 1, '@xylo': 1 }, contre: { '@violonSolo': 1.2, '@flute': 1 }, pad: { '@violons': 1 }, cordes: { '@cordes': 2 }, kit: { hat: .2, riser: .3 } },
    drift: { keys: { '@piano': 1.5 }, pluck: { '@celliPizz': .8 }, contre: { '@violonSolo': .6 }, kit: { snare: .2 }, retouche: { sombre: 1, sature: 1, aucune: 1 } },
    touge: { keys: { '@piano': 2 }, lead: { '@trompette': 1, '@violonSolo': 1 }, cuivres: { '@cuivres': 2 }, cordes: { '@cordes': 1.5 }, kit: { crash: .4 } },
    dnb: { keys: { '@piano': 2, '@harpe': 1 }, lead: { '@flute': 2, '@violonSolo': 1.5, '@clarinette': 1 }, contre: { '@violonSolo': 1.2, '@cor': .8 }, pad: { '@violons': 1.5 }, cordes: { '@cordes': 2 }, kit: { snare: .55, crash: .4, riser: .3 } },
    disco: { keys: { '@piano': 1.5 }, lead: { '@trompette': 1.5, '@flute': 1 }, cordes: { '@cordes': 3 }, cuivres: { '@cuivres': 3 }, contre: { '@flute': 1 }, kit: { perc: .8, hat: .2, crash: .4 } },
    garage: { keys: { '@piano': 1, '@marimba': 1 }, lead: { '@flute': 1, '@clarinette': .8 }, pluck: { '@marimba': 1.5 }, kit: { perc: .4 }, retouche: { lofi: 1, aucune: 2 } },
    lofi: { keys: { '@piano': 3, '@harpe': 1 }, lead: { '@clarinette': 2, '@flute': 2, '@trompetteSourd': 2 }, basse: { '@contrebasse': 2 }, contre: { '@flute': 1, '@cor': 1 }, kit: { snare: .5, kick: .3, hat: .5, perc: .3 }, retouche: { lofi: 3, aucune: 1 } },
    rock: { lead: { '@trompette': .5 }, kit: { snare: .7, toms: .7, crash: .7 } },
    pixel: { pluck: { '@xylo': .5 } },
    epique: { keys: { '@piano': 2, '@harpe': 3 }, lead: { '@trompette': 3, '@cor': 2, '@violonSolo': 2, '@flute': 1 }, pluck: { '@violonsPizz': 2, '@celliPizz': 1.5, '@marimba': 1, '@harpe': 1 }, contre: { '@cor': 2, '@violonSolo': 1.5, '@hautbois': 1 },
      pad: { '@violons': 2, '@cor': 1.5 }, cordes: { '@cordes': 4 }, cuivres: { '@cuivres': 4 }, basse: { '@celliPizz': 1, '@contrebasse': 1, '@tuba': .8 }, kit: { kick: .5, snare: .7, toms: .9, crash: .8, riser: .7 } },
    dembow: { keys: { '@piano': 1, '@marimba': 1.5 }, lead: { '@marimba': 2, '@flute': 1 }, pluck: { '@marimba': 1.5, '@xylo': 1 }, kit: { perc: .8 } },
    zef: { keys: { '@piano': 1 }, lead: { '@violonSolo': .8 }, pad: { '@violons': 1 }, retouche: { radio: 1, sature: 1, aucune: 1 } },
    stade: { lead: { '@trompette': 1.5 }, pluck: { '@xylo': 1, '@glock': .6 }, kit: { snare: .7, toms: .8, crash: .7 } },
  };
  const NOM_VRAI = { piano: 'le vrai piano', harpe: 'la vraie harpe', violons: 'les violons', violonSolo: 'le violon', celli: 'les violoncelles', celliPizz: 'les violoncelles pincés', violonsPizz: 'les violons pincés',
    contrebasse: 'la contrebasse', trompette: 'la trompette', trompetteSourd: 'la trompette bouchée', cor: 'le cor', trombone: 'le trombone', tuba: 'le tuba', flute: 'la vraie flûte', clarinette: 'la clarinette',
    hautbois: 'le hautbois', basson: 'le basson', glock: 'le glockenspiel', marimba: 'le marimba', xylo: 'le xylophone', cordes: 'les vraies cordes', cuivres: 'les vrais cuivres' };
  const nomV = (x, T9) => typeof x === 'string' && x[0] === '@' ? NOM_VRAI[x.slice(1)] || x.slice(1) : T9[x];
  const NOM_KICK = { sine: 'grosse caisse ronde', 909: 'grosse caisse 909', 808: 'grosse caisse 808', acoustique: 'batterie acoustique', lofi: 'grosse caisse étouffée', chip: 'batterie 8 bits', grave: 'tambour grave' };
  const NOM_HAT = { metal: 'charleys de métal', bruit: 'charleys de souffle', fm: 'charleys de verre', shaker: 'shaker', chip: 'charleys 8 bits' };
  const nomSalle = S => S[0] < 1.1 ? 'salle sèche' : S[0] < 1.7 ? 'petite salle' : S[0] < 2.5 ? 'plaque' : S[0] < 3.6 ? 'grand hall' : 'cathédrale';
  const SIG_POIDS = { neon: { moteur: 3, turbo: 2.5, neon: 2, klaxon: 1, sirene: 1, drift: .8 }, velours: { caisse: 3, pieces: 2, vapeur: 2, klaxon: 1.5, neon: 1 },
    luxe: { pieces: 2.5, caisse: 2, gouttes: 2, sirene: 1.5, vapeur: 1.5, moteur: 1 }, drift: { drift: 3, sirene: 2, moteur: 2, turbo: 1.5, klaxon: 1 },
    touge: { turbo: 3, moteur: 2.5, drift: 2, klaxon: 1.5, sirene: 1 }, dnb: { turbo: 2, gouttes: 2, sirene: 1.5, neon: 1, moteur: 1 },
    disco: { caisse: 3, pieces: 2.5, klaxon: 1.5, vapeur: 1 }, garage: { vapeur: 2.5, gouttes: 2, caisse: 1.5, neon: 1.5 }, lofi: { gouttes: 3, vapeur: 2.5, caisse: 1, pieces: 1 },
    rock: { moteur: 3, turbo: 2, drift: 2, klaxon: 1, sirene: 1 }, pixel: { pieces: 3, caisse: 2, klaxon: 1.5, turbo: 1 }, epique: { sirene: 2.5, moteur: 2, turbo: 1.5, caisse: 1 },
    dembow: { pieces: 2.5, klaxon: 2, caisse: 1.5, gouttes: 1.5, sirene: 1 }, zef: { sirene: 2.5, neon: 2, moteur: 1.5, klaxon: 1, drift: 1 }, stade: { klaxon: 2, moteur: 2, turbo: 1.5, sirene: 1, caisse: 1 } };
  const DEF = { tribu: ['L.L.LL.L.L.LL.L.'], fant: ['.......o.......o'], perc: ['oxoxoxoxoxoxoxox'], hatO: ['..x...x...x...x.'], stab: [[[3, 1], [6, 1], [11, 1], [14, 1]]], arp: ['updown16'] };
  const NOM_KEYS = { rhodes: 'le Rhodes', piano: 'le piano', clav: 'le clavinet', harpe: 'la harpe de verre', dx: 'le piano électrique FM', orgue: 'l’orgue', guitare: 'la guitare rythmique saturée', guitareC: 'la guitare grattée', puce: 'les accords 8 bits' };
  const NOM_LEAD = { scie: 'synthé scie', carre: 'synthé carré', talkbox: 'talkbox', verre: 'synthé de verre', sifflet: 'sifflet', cuivre: 'cuivre synthétique', flute: 'flûte',
    saxo: 'saxophone de minuit', theremine: 'thérémine', guitare: 'guitare claire', guitareSat: 'guitare saturée', steel: 'steel drum', kalimba: 'kalimba', chip: 'puce 8 bits', cowbell: 'cloche de vache (phonk)' };
  const NOM_BASSE = { tri: 'la basse triangle (8 bits)', roule: 'la basse qui roule', funk: 'la basse funk', 808: 'la 808 qui glisse', acid: 'la basse acid', reese: 'la reese', slap: 'la basse slap', '808dur': 'la 808 saturée', sub808: 'la sous-basse qui glisse' };
  const est808 = b => b === '808' || b === '808dur' || b === 'sub808';
  const MOTS1 = ['NUIT', 'COMÈTE', 'MIRAGE', 'VELOURS', 'CHROME', 'ORBITE', 'PLUIE', 'FEU', 'LUNE', 'JACKPOT', 'DIAMANT', 'TURBO', 'NÉON', 'RUBIS', 'PANTHÈRE', 'TONNERRE',
    'ÉCLIPSE', 'SAPHIR', 'VERTIGE', 'FLAMME', 'COBRA', 'RIVIERA', 'PALACE', 'FRISSON', 'PULSAR', 'TEMPÊTE', 'MINUIT', 'BOULEVARD', 'ASPHALTE', 'SILLAGE'];
  const MOTS2 = ['CHROME', 'VELOURS', 'NÉON', 'MINUIT', 'SATIN', 'CRISTAL', 'FEU', 'SOIE', 'LUXE', 'VITESSE', 'PLATINE', 'JADE', 'TONNERRE', 'OR', 'ARGENT', 'OPALE', 'NACRE', 'ÉMERAUDE'];
  const titreDe = () => { const a = tp(MOTS1); if (T() < .25) return a + ' ' + tp(['3000', 'ULTRA', 'DELUXE', 'GT', 'NOVA', 'PRIME', 'INFINI']); const b = tp(MOTS2); return a + (/^[AEIOUÉ]/.test(b) ? ' D’' : ' DE ') + b; };

  // ================================================================ LA COMPOSITION D'UNE MUSIQUE (depuis son numéro)
  // LA PHRASE : question (mesures 1-4) / réponse (5-8). Chaque note : [pas 0-127, degré, durée, rôle] — rôle 'o' cadence OUVERTE (une note
  // de l'accord qui n'est pas la fondamentale), 'f' cadence FERMÉE (la fondamentale), 's' le SOMMET.
  // LES FORMES DE PHRASE (v3.4 : « c'est encore un peu toujours la même ») — la grammaire reste (la question en suspens, la réponse qui se
  // pose sur la fondamentale), la silhouette change : classique (motif, marche, sommet en 7e mesure) · riff (un crochet de deux temps redit,
  // la boucle du phonk et de l'eurobeat) · appel (un appel, un silence qui répond) · envol (le motif grimpe d'une marche par mesure, puis
  // redescend) · longues (un hymne en notes tenues)
  const NOM_PHRASE = { classique: 'motif, marche et sommet', riff: 'un riff redit', appel: 'appel et silence', envol: 'le motif qui grimpe', longues: 'un hymne en notes tenues' };
  function phrase(rnd, cells, forme) {
    const brefs = cells.filter(x => x <= 3), ph = [];
    const motif = (lim, d0) => { const mot = []; let st = rnd() < .6 ? 0 : 2, d = d0 != null ? d0 : Math.floor(rnd() * 3); const n = 2 + Math.floor(rnd() * 3);
      for (let k = 0; k < n && st < lim; k++) { const len = Math.min(brefs[Math.floor(rnd() * brefs.length)] || 2, lim - st); mot.push([st, d, len]); st += len; d = clamp(d + [-1, 1, 1, 2, -1, -2][Math.floor(rnd() * 6)], -1, 4); }
      return mot; };
    const pose = (m, mt, dd, off) => mt.forEach(([s0, d0, l]) => ph.push([m * 16 + (off || 0) + s0, clamp(d0 + dd, -2, 5), l, '']));
    if (forme === 'riff') { const mot = motif(8), v = rnd() < .5 ? 1 : -1;   // deux temps, redits ; la 3e mesure répond un cran à côté
      for (let m = 0; m < 3; m++) { pose(m, mot, 0, 0); pose(m, mot, m === 2 ? v : 0, 8); }
      pose(3, mot, 0, 0); ph.push([56, rnd() < .5 ? 2 : 1, 8, 'o']);
      for (let m = 4; m < 6; m++) { pose(m, mot, 0, 0); pose(m, mot, m === 5 ? v : 0, 8); }
      pose(6, mot, 2, 0); ph.push([104, 5, 4, 's']); ph.push([108, 3, 4, '']); ph.push([112, 0, 8, 'f']); return ph; }
    if (forme === 'appel') { const mot = motif(8), r9 = rnd() < .5 ? 1 : 2;   // l'appel… et le silence qui répond
      pose(0, mot, 0, 0); pose(0, mot, r9, 8); ph.push([16, rnd() < .5 ? 2 : 1, 8, 'o']);
      pose(2, mot, r9, 0); pose(2, mot, r9 + 1, 8); ph.push([48, 3, 4, '']); ph.push([52, 1, 8, 'o']);
      pose(4, mot, 0, 0); pose(4, mot, r9, 8); ph.push([80, 4, 8, '']);
      ph.push([96, 5, 6, 's']); ph.push([102, 4, 2, '']); ph.push([104, 2, 8, '']); ph.push([112, 0, 8, 'f']); return ph; }
    if (forme === 'envol') { const mot = motif(12, 0);   // une marche de plus à chaque mesure, le sommet, puis la descente
      pose(0, mot, 0); pose(1, mot, 1); pose(2, mot, 2); ph.push([48, rnd() < .5 ? 4 : 3, 12, 'o']);
      pose(4, mot, 3); pose(5, mot, 2); ph.push([96, 5, 4, 's']); ph.push([100, 3, 4, '']); ph.push([104, 2, 4, '']); ph.push([108, 1, 4, '']); ph.push([112, 0, 8, 'f']); return ph; }
    if (forme === 'longues') { const d0 = Math.floor(rnd() * 2), j = () => (rnd() < .3 ? (rnd() < .5 ? 1 : -1) : 0), a9 = rnd() < .5 ? 6 : 8;   // l'hymne : deux notes par mesure
      const P2 = (m, x, y) => { ph.push([m * 16, clamp(x, -2, 5), a9, '']); ph.push([m * 16 + a9, clamp(y, -2, 5), 16 - a9, '']); };
      P2(0, d0, d0 + 1); P2(1, d0 + 2, d0 + 1 + j()); P2(2, d0 + 3, d0 + 2 + j()); ph.push([48, rnd() < .5 ? 2 : 1, 16, 'o']);
      P2(4, d0 + 1, d0 + 2); P2(5, d0 + 3, d0 + 4 + j()); ph.push([96, 5, 8, 's']); ph.push([104, 3, 8, '']); ph.push([112, 0, 16, 'f']); return ph; }
    const mot = []; let st = rnd() < .6 ? 0 : 2, d = Math.floor(rnd() * 3); const n = 2 + Math.floor(rnd() * 3);   // classique
    for (let k = 0; k < n && st < 8; k++) { const len = Math.min(brefs[Math.floor(rnd() * brefs.length)] || 2, 8 - st); mot.push([st, d, len]); st += len; d = clamp(d + [-1, 1, 1, 2, -1, -2][Math.floor(rnd() * 6)], -1, 4); }
    const marche = rnd() < .5 ? 1 : -1;
    pose(0, mot, 0); pose(1, mot, marche);                                          // le motif, puis sa marche
    if (rnd() < .5) pose(2, mot, 2 * marche); else pose(2, mot.slice(0, Math.max(1, mot.length - 1)), -marche);
    ph.push([3 * 16, rnd() < .5 ? 2 : 1, rnd() < .5 ? 8 : 6, 'o']);                 // la QUESTION reste en suspens
    pose(4, mot, 0); pose(5, mot, rnd() < .5 ? marche : 0);
    ph.push([6 * 16, 5, 4, 's']); ph.push([6 * 16 + 4, 4, 2, '']); ph.push([6 * 16 + 8, 3, 4, '']); ph.push([6 * 16 + 12, 1, 4, '']);   // le SOMMET, puis la descente
    ph.push([7 * 16, 0, 8, 'f']);                                                   // la RÉPONSE se pose sur la fondamentale
    return ph;
  }
  function phraseDeveloppee(ph, rnd) {   // un thème aimé, repris : transposé, renversé ou à rebours (le rythme et les cadences restent)
    const k = Math.floor(rnd() * 3), d0 = ph[0][1], degs = ph.map(x => x[1]);
    return ph.map(([st, d, l, r], i) => [st, r ? d : clamp(k === 0 ? d + (rnd() < .5 ? 1 : -1) : k === 1 ? 2 * d0 - d : degs[degs.length - 1 - i], -2, 5), l, r]);
  }
  function ordreDe(C, Mx) {
    const pris = new Set(), o = [];
    const ouv = C.ouv ? tp(C.ouv) : null;   // L'OUVERTURE : les trois premiers moteurs tirés (v3.4) — le reste de l'échelle suit
    (ouv ? ouv.map((x, k) => k ? x : x + '!').concat(C.ordre.map(e => e === 'final!' ? e : e.replace('!', ''))) : C.ordre)
      .forEach(e => { const pin = e.endsWith('!'), id = e.replace('!', ''); if (pris.has(id)) return; pris.add(id); o.push({ id, pin }); });
    // LA SIGNATURE entre tôt (5e-8e), la 2e plus tard (17e-22e) ; elles prennent la place d'éléments discrets
    const ote = ids => { for (const id of ids) { const k = o.findIndex(x => x.id === id && !x.pin); if (k >= 0) { o.splice(k, 1); return; } } };
    ote(['cloche', 'perc', 'stab', 'harmo', 'hatO', 'cordes']); o.splice(4 + Math.floor(T() * 4), 0, { id: 'sig', pin: true });
    if (Mx.sig2) { ote(['cloche', 'perc', 'harmo', 'stab', 'roll', 'choeur', 'cordes']); o.splice(16 + Math.floor(T() * 6), 0, { id: 'sig2', pin: true }); }
    for (let k = 1; k < o.length - 2; k++) if (!o[k].pin && !o[k + 1].pin && T() < .3) { const x = o[k]; o[k] = o[k + 1]; o[k + 1] = x; k++; }
    const deplace = (id, ok, ou) => { const k = o.findIndex(x => x.id === id); if (k < 0 || ok(k)) return; const [x] = o.splice(k, 1); o.splice(ou, 0, x); };
    // LA COURBE (v3.6) : les grands moments tirés (voir l'en-tête)
    const place = (id, a9, b9) => { const k = o.findIndex(x => x.id === id); if (k < 0) return; const [x] = o.splice(k, 1); o.splice(Math.min(o.length, a9 + Math.floor(T() * (b9 - a9 + 1))), 0, x); };
    const lt = T(), kt9 = T(), kl = o.findIndex(x => x.id === 'lead'), kk = o.findIndex(x => x.id === 'kick');
    if (lt < .25 && kl > 0) place('lead', 8, 11); else deplace('lead', k => k <= 7, 4 + Math.floor(T() * 4));
    if (kt9 < .25 && kk > 0 && kk < 8) place('kick', 8, 11);
    place('clarte', 9, 17); place('double', 15, 23);
    if (T() < .3) { const k = o.findIndex(x => x.id === 'modul'), alt = ['i_large', 'ride', 'perc', 'sub', 'harmo'].find(id => !o.some(x => x.id === id)); if (k >= 0 && alt) o[k] = { id: alt, pin: false }; }
    else place('modul', 22, 27);
    deplace('final', k => k === o.length - 1, o.length - 1);
    return o.slice(0, 30).map(x => x.id);
  }
  const estVamp = spec => new Set(spec.split(' ')).size <= 2;
  const FORMES = [['A', 'A2', 'B', 'C'], ['A', 'B', 'A2', 'C'], ['A', 'A2', 'B', 'B2'], ['A', 'B', 'C', 'A2'], ['A', 'A2', 'C', 'B']];
  const pese = (o, e) => { const r = {}; for (const k in o) r[k] = o[k] > 1 ? Math.pow(o[k], e) : o[k]; return r; };   // (le mode : les goûts penchent encore moins)
  const adoucit = o => { const r = {}; for (const k in o) r[k] = o[k] > 1 ? Math.sqrt(o[k]) : o[k]; return r; };   // les goûts penchent, ils n'enferment pas
  function compose(n, W) {
    W = W || GOUTS || {}; T = graine(n);
    const cid = tpw(COUL_IDS, W.couleur ? adoucit(W.couleur) : null), C = COULEURS[cid], modeN = tpw(C.modes, (o9 => { if (C.modeW) for (const k in C.modeW) o9[k] = (o9[k] == null ? 1 : o9[k]) * C.modeW[k]; return o9; })(W.mode ? pese(W.mode, .35) : {})), ton = Math.floor(T() * 12);
    const Mx = { n, cid, C, modeN, ton, W, phr: 0, sec: 'A', swing: C.swing };
    const src = C.grilles[modeN].slice(), wv = W.vamp != null ? W.vamp : 1; const g3 = [];
    for (let k = 0; k < 3 && src.length; k++) { const x = tpw(src, { v: wv }, x9 => estVamp(x9) ? 'v' : 'n'); src.splice(src.indexOf(x), 1); g3.push(x); }
    Mx.grillesSpec = g3; Mx.grilles = g3.map(s => menes(s.split(' '), Mx)); Mx.grilleF = menes(tp(FREN_GRILLES).split(' '), Mx, 'sombre');
    Mx.vamp = g3.some(estVamp);
    const aimes = (W.themes || []).filter(x => Array.isArray(x) && x.length > 3 && Array.isArray(x[0]) && x[0].length >= 4);
    Mx.themeAime = aimes.length > 0 && T() < .3;
    const pf = C.phrases || { classique: 1 }, pk9 = Object.keys(pf), pw = {}; pk9.forEach(k => pw[k] = pf[k] * (W.phrase && W.phrase[k] != null ? W.phrase[k] : 1));
    Mx.phF = tpw(pk9, pw); const pk2 = pk9.filter(k => k !== Mx.phF); Mx.phFB = pk2.length ? tpw(pk2, pw) : Mx.phF;   // le couplet prend une AUTRE forme
    Mx.motifs = [Mx.themeAime ? phraseDeveloppee(tp(aimes), T) : phrase(T, C.cells, Mx.phF), phrase(T, C.cells, Mx.phFB), phrase(T, C.cells, Mx.phF)];
    Mx.bpm0 = Math.round(tr(C.bpm[0], C.bpm[1]));
    if (W.bpm > 40) { let b9 = W.bpm, mil = (C.bpm[0] + C.bpm[1]) / 2; while (b9 < mil * .75) b9 *= 2; while (b9 > mil * 1.5) b9 /= 2; Mx.bpm0 = Math.round(Mx.bpm0 + (clamp(b9, C.bpm[0] - 4, C.bpm[1] + 4) - Mx.bpm0) * .3); } Mx.bpm1 = Math.round(Mx.bpm0 * (1 + tr(C.monte[0], C.monte[1]) / 100));
    Mx.patL = {}; Mx.pat = {};
    for (const k of ['kick', 'snare', 'hat', 'hatD', 'hatO', 'fant', 'perc', 'tribu', 'basse', 'keys', 'stab', 'arp']) { const L = C.pat[k] || DEF[k]; Mx.patL[k] = L;
      Mx.pat[k] = typeof L === 'string' ? L : (k === 'basse' || k === 'keys') && L.length > 1 ? tp(L.slice(0, -1)) : tp(L); }   // la variante la plus active attend sa marche (i_basse, i_keys)
    Mx.forme = tp(FORMES); Mx.voixB = tp(C.voixB || ['pluck', 'pluck', 'cloche', 'haut']);
    const K = C.kit;
    Mx.kit = { f0: tr(...K.f0), f1: tr(...K.f1), dec: tr(...K.dec), clic: tr(...K.clic), drive: tr(...K.drive), snare: tpw(K.snare, W.snare), riser: tpw(['souffle', 'ton'], W.riser),
      cm: tr(1.1, 1.55), hm: tr(1.45, 2.1), kt: tpw(['rond', 'sec', 'boum'], W.kick), kickT: tpw(C.kickT || ['sine'], W.kickT), hatT: tpw(C.hatT || ['metal'], W.hatT), sf: tr(170, 220), bp: tr(1300, 2400), sdec: tr(.14, .24),
      hp: tr(7000, 9000), odec: tr(.22, .32), pf: tr(200, 250) };
    if (Mx.kit.kt === 'sec') { Mx.kit.dec *= .75; Mx.kit.clic *= 1.6; } else if (Mx.kit.kt === 'boum') { Mx.kit.dec *= 1.3; Mx.kit.clic *= .6; Mx.kit.f1 *= .92; }   // la grosse caisse : ronde · sèche · boum
    const VS = VRAIS_STYLE[cid] || {}, role = (base, add, Wr) => { const w = {}; (Array.isArray(base) ? base : Object.keys(base)).forEach(k => w[k] = Array.isArray(base) ? 1 : base[k]);
      for (const k in (add || {})) w[k] = add[k]; const ks9 = Object.keys(w); ks9.forEach(k => { if (Wr && Wr[k] != null) w[k] *= Wr[k]; }); return tpw(ks9, w); };
    const fois = (o, k9) => { if (!o) return o; const r = {}; for (const k in o) r[k] = o[k] * k9; return r; };   // la mélodie et le clavier : les vrais d'abord
    Mx.tim = { keys: role(C.keysT, fois(VS.keys, 2), W.keys), lead: role(C.leadT, fois(VS.lead, 3), W.lead), basse: role(C.basseT, VS.basse, W.basse), pad: role(C.padT || ['scie', 'doux', 'verre', 'voix'], VS.pad, W.pad),
      pluck: role(C.pluckT || ['verre', 'scie', 'fm', 'puce', 'bois'], VS.pluck, W.pluck), contre: role(C.contreT || ['flute', 'violon', 'voix', 'orgue'], VS.contre, W.contre),
      cordes: role(C.cordesT || ['ensemble', 'synth'], VS.cordes, W.cordes), cuivres: role(['synth'], VS.cuivres, W.cuivres), voyC: tp(['oh', 'ah', 'ou']), chAtt: C.pat.chop ? .015 : .55, padFc: tr(1300, 2400), padAtt: tr(.2, .5), padLarge: tr(9, 16), ksEclat: tr(.45, .62),
      cr: tp([2.76, 3.5, 4.2]), d808: tr(1, 1.4), sfc: tr(2200, 3400) };
    { const KV = VS.kit || {}; Mx.kitV = {}; Mx.vraisF = [];   // LE KIT RÉEL (une partie sur …) et LA RETOUCHE des vrais instruments
      if (T() < (KV.snare || 0)) Mx.kitV.snare = tp([['caisse1'], ['caisse2'], ['caisseVieille'], ['caisse1', 'caisse2']]);
      if (T() < (KV.kick || 0)) Mx.kitV.kick = ['grosseCaisse', 'grosseCaisse2'];
      if (T() < (KV.toms || 0)) { const ti = cid === 'epique' && T() < .6; Mx.kitV.tomH = [ti ? 'timbale3' : 'tenorH']; Mx.kitV.tomL = [ti ? 'timbale1' : 'tenorB']; }
      if (T() < (KV.perc || 0)) { Mx.kitV.percH = tp([['conga', 'quinto'], ['bongoH'], ['claves'], ['boisH']]); Mx.kitV.percL = tp([['congaTape'], ['bongoB'], ['boisB']]); Mx.kitV.shaker = ['shaker1', 'shaker2']; }
      if (T() < (KV.hat || 0)) Mx.kitV.hat = tp([['shaker1', 'shaker2'], ['grelots'], ['triangleSourd']]);
      if (T() < (KV.crash || 0)) Mx.kitV.crash = ['crash'];
      if (T() < (KV.riser || 0)) Mx.kitV.riser = ['cymbaleMontee'];
      const RT = VS.retouche || { aucune: 1 }; Mx.retouche = tpw(Object.keys(RT), Object.assign({}, RT, W.retouche ? Object.fromEntries(Object.keys(RT).map(k => [k, RT[k] * (W.retouche[k] != null ? W.retouche[k] : 1)])) : {}));
      if (Mx.retouche === 'aucune') Mx.retouche = null; }
    Mx.cap = C.cap || 86; Mx.up = Mx.cap >= 85 ? 12 : 0;   // L'AIGU SE REPOSE : le plafond du style ; cordes et accords hachés à l'octave du milieu sous 85
    Mx.fill = tp(C.fill); Mx.transDer = []; Mx.arrDer = ''; Mx.modul = tp([2, 2, 1]);
    const sp = SIG_POIDS[cid], sk = Object.keys(sp), sw = {}; sk.forEach(k => sw[k] = sp[k] * (W.sig && W.sig[k] != null ? W.sig[k] : 1));
    Mx.sig = tpw(sk, sw); Mx.sig2 = T() < .4 ? tpw(sk.filter(k => k !== Mx.sig), sw) : null;
    Mx.idee = SIG[Mx.sig].idee + (Mx.sig2 ? ' ; plus tard, ' + SIG[Mx.sig2].idee.split(/[,—]/)[0].trim() : '');
    Mx.titre = T() < .55 ? tp(SIG[Mx.sig].mots) + (T() < .3 ? ' ' + tp(['3000', 'ULTRA', 'DELUXE', 'GT', 'NOVA']) : (b9 => (/^[AEIOUÉ]/.test(b9) ? ' D’' : ' DE ') + b9)(tp(MOTS2))) : titreDe();
    Mx.ordre = ordreDe(C, Mx);
    Mx.rang = {}; CATALOGUE.forEach(id => Mx.rang[id] = 0); Mx.ordre.forEach((id, k) => Mx.rang[id] = k + 1);
    Mx.tonNom = NOTES_FR[ton] + ' ' + NOM_MODE[modeN];
    Mx.accords = []; const vu = new Set(); [...Mx.grilles, Mx.grilleF].forEach(g => g.forEach(A => { if (!vu.has(A.cle)) { vu.add(A.cle); Mx.accords.push(A); } }));
    return Mx;
  }
  const NOM_PLUCK = { verre: 'corde de verre', scie: 'scie pincée', fm: 'cloche FM', puce: 'puce', bois: 'bois' }, NOM_CONTRE = { flute: 'flûte', violon: 'violon', voix: 'voix', orgue: 'orgue' };
  const NOM_PAD = { scie: 'scie', doux: 'douce', verre: 'de verre', voix: 'de voix' };
  const nomEl = (Mx, id) => id === 'arp' ? 'l’arpège (' + nomV(Mx.tim.pluck, NOM_PLUCK) + ')' : id === 'contre' ? 'le contre-chant (' + nomV(Mx.tim.contre, NOM_CONTRE) + ')' : id === 'pad' ? (Mx.tim.pad[0] === '@' ? 'la nappe (' + nomV(Mx.tim.pad) + ')' : 'la nappe ' + NOM_PAD[Mx.tim.pad])
    : id === 'cordes' && Mx.tim.cordes[0] === '@' ? 'les vraies cordes' : id === 'cuivres' && Mx.tim.cuivres[0] === '@' ? 'les vrais cuivres'
    : id === 'cordes' && Mx.tim.cordes === 'synth' ? 'les cordes synthé' : id === 'snare' && Mx.kit.snare === 'rim' ? 'le rimshot' : id === 'sig' ? 'la signature : ' + SIG[Mx.sig].nom : id === 'sig2' ? 'la signature : ' + SIG[Mx.sig2].nom : id === 'keys' ? nomV(Mx.tim.keys, NOM_KEYS) : id === 'basse' ? nomV(Mx.tim.basse, NOM_BASSE) : id === 'snare' ? (Mx.kit.snare === 'clap' ? 'le clap' : 'la caisse claire')
    : id === 'lead' ? 'la mélodie (' + nomV(Mx.tim.lead, NOM_LEAD) + ')' : NOMS[id];

  // ================================================================ LES SONS (rendus une fois par musique, hors temps réel)
  const OUT = c => c.destination;
  async function rend(dur, fn, sr, cible, ch) { sr = sr || 44100; const c = new OfflineAudioContext(ch || 1, Math.ceil(dur * sr), sr); fn(c); const b = await c.startRendering(); return norme(b, cible); }
  function norme(b, cible) { let pk = 0; for (let k = 0; k < b.numberOfChannels; k++) { const d = b.getChannelData(k); for (let i = 0; i < d.length; i++) { const a = Math.abs(d[i]); if (a > pk) pk = a; } }
    if (pk > 1e-5) { const g = (cible || .8) / pk; for (let k = 0; k < b.numberOfChannels; k++) { const d = b.getChannelData(k); for (let i = 0; i < d.length; i++) d[i] *= g; } } return b; }
  function nzBuf(c, sec) { const b = c.createBuffer(1, Math.ceil(c.sampleRate * sec), c.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = R() * 2 - 1; return b; }
  function bruit(c, t, type, f, q, v, dur, att, dest) { const s = c.createBufferSource(), fl = c.createBiquadFilter(), g = c.createGain(); s.buffer = nzBuf(c, dur + .05);
    fl.type = type; fl.frequency.value = f; fl.Q.value = q; g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v, t + (att || .001)); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    s.connect(fl); fl.connect(g); g.connect(dest || OUT(c)); s.start(t); }
  function metal(c, t, mult, hp, v, dur) { const g = c.createGain(), fl = c.createBiquadFilter(); fl.type = 'highpass'; fl.frequency.value = hp; fl.Q.value = .9;
    [263, 400, 421, 474, 587, 845].forEach(f => { const o = c.createOscillator(); o.type = 'square'; o.frequency.value = f * mult * (1 + (R() - .5) * .01); o.connect(fl); o.start(t); o.stop(t + dur + .02); });
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v, t + .001); g.gain.exponentialRampToValueAtTime(.0001, t + dur); fl.connect(g); g.connect(OUT(c)); }
  function envG(c, a, h, r, v, dest) { const g = c.createGain(); g.gain.setValueAtTime(.0001, 0); g.gain.linearRampToValueAtTime(v, a); g.gain.setValueAtTime(v, h); g.gain.linearRampToValueAtTime(.0001, h + r); g.connect(dest || OUT(c)); return g; }
  const osc = (c, type, f, dt) => { const o = c.createOscillator(); o.type = type; o.frequency.value = f; if (dt) o.detune.value = dt; return o; };
  const panne = (c, x, dest) => { const p = c.createStereoPanner(); p.pan.value = x; p.connect(dest); return p; };
  function courbe(k) { const a = new Float32Array(1024); for (let i = 0; i < 1024; i++) { const x = i / 511.5 - 1; a[i] = Math.tanh(k * x) / Math.tanh(k); } return a; }
  function chute(c, type, f0, f1, td, v, dec, dest) { const o = osc(c, type, f0), g = c.createGain(); o.frequency.setValueAtTime(f0, 0); o.frequency.exponentialRampToValueAtTime(f1, td);
    g.gain.setValueAtTime(.0001, 0); g.gain.exponentialRampToValueAtTime(v, .002); g.gain.exponentialRampToValueAtTime(.0001, dec); o.connect(g); g.connect(dest || OUT(c)); o.start(0); o.stop(dec + .03); }
  function vib(c, f0, prof, dep) { const vb = osc(c, 'sine', f0), vg = c.createGain(); vg.gain.setValueAtTime(0, 0); vg.gain.setValueAtTime(0, dep); vg.gain.linearRampToValueAtTime(prof, dep + .35); vb.connect(vg); vb.start(0); return vg; }
  // LES CORDES PINCÉES (Karplus-Strong, calculées en JS : une boucle de bruit adouci qui se filtre à chaque tour) — stéréo : deux cordes
  // à peine désaccordées ; `notes` = [midi…] grattées de 9 ms (un accord de harpe) ou une seule
  function ks(notes, dur, eclat, sr) { sr = sr || 44100; const n = Math.ceil(dur * sr), b = new AudioBuffer({ length: n, numberOfChannels: 2, sampleRate: sr });
    for (let ch = 0; ch < 2; ch++) { const d = b.getChannelData(ch);
      notes.forEach((m, j) => { const f = mtof(m) * (ch ? 1.0016 : .9984), N = Math.max(2, Math.round(sr / f)), q = new Float32Array(N); let y = 0;
        for (let k = 0; k < N; k++) { y = y * .55 + (R() * 2 - 1) * .45; q[k] = y; }
        const o = Math.round(j * .009 * sr); let idx = 0;
        for (let k = o; k < n; k++) { const a = q[idx], nx = q[(idx + 1) % N]; q[idx] = (a * eclat + nx * (1 - eclat)) * .9985; d[k] += a; idx = (idx + 1) % N; } });
      const fo = Math.round(.05 * sr); for (let k = 0; k < fo; k++) d[n - 1 - k] *= k / fo; }
    return norme(b, .8); }
  function ampli(b) {   // l'ampli de la guitare saturée : saturation (tanh ×5), coupe-haut d'un haut-parleur (~3,4 kHz), la note tient plus longtemps
    const a = Math.exp(-2 * Math.PI * 3400 / b.sampleRate);
    for (let ch = 0; ch < b.numberOfChannels; ch++) { const d = b.getChannelData(ch); let y = 0; for (let i = 0; i < d.length; i++) { y = (1 - a) * Math.tanh(d[i] * 5) + a * y; d[i] = y; } }
    return norme(b, .8); }
  // LES RETOUCHES des vrais instruments (v3.7) : lo-fi (bande étroite, saturé) · sombre · radio · saturé
  function retoucheChaine(c, R9) { if (!R9) return OUT(c); const n = []; const bq = (ty, f, q) => { const x = c.createBiquadFilter(); x.type = ty; x.frequency.value = f; x.Q.value = q || .7; return x; }, ws = k => { const x = c.createWaveShaper(); x.curve = courbe(k); return x; };
    if (R9 === 'lofi') n.push(bq('highpass', 140), bq('lowpass', 3200, .5), ws(1.8)); else if (R9 === 'sombre') n.push(bq('lowpass', 2200, .5)); else if (R9 === 'radio') n.push(bq('bandpass', 1300, .8), ws(2.6)); else if (R9 === 'sature') n.push(ws(3), bq('lowpass', 5200, .5));
    if (!n.length) return OUT(c); for (let i = 0; i < n.length - 1; i++) n[i].connect(n[i + 1]); n[n.length - 1].connect(OUT(c)); return n[0]; }
  // LES CHARLEYS (v3.6) : métal (six carrés) · bruit (souffle, la 909, l'acoustique) · FM de verre · shaker · 8 bits (bruit tenu par paliers)
  function hatSon(K, d, nb) { const ouv = d > .1, T9 = K.hatT;
    if (T9 === 'bruit') return [d + .05, c => { bruit(c, 0, 'highpass', K.hp - (ouv ? 800 : 0), .9, .9, d); bruit(c, 0, 'bandpass', 10500, 1.2, .35, d * .7); }, nb];
    if (T9 === 'fm') return [d + .05, c => { const g = c.createGain(), hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 6000; g.gain.setValueAtTime(.0001, 0); g.gain.exponentialRampToValueAtTime(.7, .001); g.gain.exponentialRampToValueAtTime(.0001, d + .005);
      hp.connect(g); g.connect(OUT(c)); const car = osc(c, 'sine', 6400), mod = osc(c, 'sine', 9180), mg = c.createGain(); mg.gain.value = 7000; mod.connect(mg); mg.connect(car.frequency); car.connect(hp); car.start(0); mod.start(0); }, nb];
    if (T9 === 'shaker') return [d + .06, c => bruit(c, 0, 'bandpass', ouv ? 6500 : 7200, 1.3, .8, d + .02, .01), nb];
    if (T9 === 'chip') return [d * .7 + .03, c => { const b = c.createBuffer(1, Math.ceil(c.sampleRate * (d * .7 + .03)), c.sampleRate), x = b.getChannelData(0); let v = 0; for (let i = 0; i < x.length; i++) { if (i % 3 === 0) v = R() * 2 - 1; x[i] = v; }
      const s9 = c.createBufferSource(), hp = c.createBiquadFilter(), g = c.createGain(); s9.buffer = b; hp.type = 'highpass'; hp.frequency.value = 5000; g.gain.setValueAtTime(.8, 0); g.gain.exponentialRampToValueAtTime(.0001, d * .7);
      s9.connect(hp); hp.connect(g); g.connect(OUT(c)); s9.start(0); }, nb];
    return [d + .04, c => { metal(c, 0, K.hm || 1.7, K.hp - (ouv ? 600 : 0), ouv ? .6 : .7, d); bruit(c, 0, 'highpass', K.hp + (ouv ? 1000 : 1500), .8, .25, d * (ouv ? .85 : .78)); }, nb]; }
  // LE KIT (rendu par variantes : deux ou trois coups un peu différents, tirés au hasard — la main, pas la machine)
  const SONS = {
    kick: K => K.kickT === '909' ? [K.dec * .8 + .15, c => { const o = osc(c, 'sine', K.f0 * 1.15), g = c.createGain(), ws = c.createWaveShaper(); ws.curve = courbe(K.drive * 1.2);   // la 909 : sèche, son clic
        o.frequency.setValueAtTime(K.f0 * 1.15, 0); o.frequency.exponentialRampToValueAtTime(K.f1, .04); g.gain.setValueAtTime(.0001, 0); g.gain.exponentialRampToValueAtTime(.95, .001); g.gain.exponentialRampToValueAtTime(.0001, K.dec * .8);
        o.connect(g); g.connect(ws); ws.connect(OUT(c)); o.start(0); o.stop(K.dec * .8 + .05); bruit(c, 0, 'highpass', 2500, .7, K.clic * 2.2, .018); bruit(c, 0, 'lowpass', 1400, .6, .25, .03); }, 2]
      : K.kickT === '808' ? [K.dec * 1.6 + .15, c => { const o = osc(c, 'sine', K.f1 * 2.2), g = c.createGain(), ws = c.createWaveShaper(); ws.curve = courbe(1 + K.drive * .4);   // la 808 : longue, qui glisse
        o.frequency.setValueAtTime(K.f1 * 2.2, 0); o.frequency.exponentialRampToValueAtTime(K.f1, .09); g.gain.setValueAtTime(.0001, 0); g.gain.exponentialRampToValueAtTime(.95, .002); g.gain.setValueAtTime(.9, .08); g.gain.exponentialRampToValueAtTime(.0001, K.dec * 1.6);
        o.connect(g); g.connect(ws); ws.connect(OUT(c)); o.start(0); o.stop(K.dec * 1.6 + .05); bruit(c, 0, 'highpass', 3000, .7, K.clic * .6, .005); }, 2]
      : K.kickT === 'acoustique' ? [.5, c => { chute(c, 'sine', K.f0 * .7, 52, .08, .95, .32); chute(c, 'triangle', K.f0 * .9, 70, .03, .3, .1); bruit(c, 0, 'bandpass', 3200, 1, K.clic * 2.5, .012); bruit(c, .002, 'lowpass', 700, .5, .35, .09); }, 3]   // la peau, le batteur
      : K.kickT === 'lofi' ? [K.dec + .15, c => { const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 700; lp.connect(OUT(c)); chute(c, 'sine', K.f0, K.f1, .06, .95, K.dec, lp); bruit(c, 0, 'lowpass', 1200, .5, .3, .03, .001, lp); }, 2]   // étouffée
      : K.kickT === 'chip' ? [.16, c => { chute(c, 'square', K.f0 * 1.2, 45, .06, .6, .13); bruit(c, 0, 'lowpass', 3000, .5, .3, .02); }, 2]   // 8 bits
      : K.kickT === 'grave' ? [1.1, c => { chute(c, 'sine', 95, 42, .25, .95, 1); chute(c, 'triangle', 140, 70, .1, .3, .25); bruit(c, 0, 'lowpass', 500, .6, .6, .18); bruit(c, 0, 'bandpass', 220, 1.5, .4, .3); }, 2]   // le tambour de l'épique
      : [K.dec + .12, c => { const o = osc(c, 'sine', K.f0), g = c.createGain(); o.frequency.setValueAtTime(K.f0, 0); o.frequency.exponentialRampToValueAtTime(K.f1, .055);
      g.gain.setValueAtTime(.0001, 0); g.gain.exponentialRampToValueAtTime(.95, .0015); g.gain.setValueAtTime(.95, .02); g.gain.exponentialRampToValueAtTime(.0001, K.dec);
      const ws = c.createWaveShaper(); ws.curve = courbe(K.drive); o.connect(g); g.connect(ws); ws.connect(OUT(c)); o.start(0); o.stop(K.dec + .05);
      chute(c, 'sine', 70, 42, .2, .5, K.dec * 1.1); bruit(c, 0, 'highpass', 3500, .7, K.clic, .006); }, 2],
    snare: K => K.snare === 'acoustique' ? [.45, c => { chute(c, 'triangle', 230, 185, .04, .75, .14); bruit(c, 0, 'bandpass', 3800, .6, 1.3, .2); bruit(c, 0, 'highpass', 6500, .7, .45, .11); bruit(c, .01, 'lowpass', 1600, .5, .3, .3); }, 3]   // la caisse claire acoustique (le timbre, le corps, la salle)
      : K.snare === 'puce' ? [.2, c => { bruit(c, 0, 'highpass', 1800, .5, 1.1, .14); chute(c, 'square', 420, 180, .05, .35, .09); }, 3]   // la caisse 8 bits : du bruit et un carré qui tombe
      : K.snare === 'rim' ? [.3, c => { chute(c, 'triangle', 900, 780, .02, .7, .06); chute(c, 'sine', K.sf * 1.4, K.sf, .02, .5, .1); bruit(c, 0, 'bandpass', 3200, 1.6, 1.2, .07);   // le rimshot sec
        bruit(c, .015, 'lowpass', 2800, .6, .2, .22); }, 3]
      : K.snare === 'clap' ? [.45, c => { [0, .01, .022].forEach(d => bruit(c, d, 'bandpass', K.bp, .6, 2.2, .02)); bruit(c, .03, 'bandpass', K.bp * .9, .5, 1.8, K.sdec);
        bruit(c, .03, 'lowpass', 3000, .5, .25, K.sdec * 2.2); }, 3]
      : [.5, c => { chute(c, 'triangle', K.sf * 1.5, K.sf, .03, .8, .16); chute(c, 'sine', K.sf * 2, K.sf * 1.6, .02, .3, .08);
        bruit(c, 0, 'bandpass', K.bp + 900, .7, 1.4, K.sdec); bruit(c, 0, 'highpass', 5500, .7, .5, K.sdec * .7); bruit(c, .02, 'lowpass', 2500, .6, .3, .38); }, 3],   // la caisse claire de la synthwave et sa salle
    hat: K => hatSon(K, .045, 3), hatO: K => hatSon(K, K.odec, 2),
    percH: K => [.3, c => { chute(c, 'sine', K.pf * 1.5, K.pf, .02, .9, .25); bruit(c, 0, 'bandpass', K.pf * 4, 1.5, .25, .02); }, 2],
    percL: K => [.35, c => { chute(c, 'sine', K.pf, K.pf * .68, .02, .9, .3); bruit(c, 0, 'bandpass', K.pf * 3, 1.5, .25, .02); }, 2],
    shaker: () => [.12, c => bruit(c, 0, 'bandpass', 6200, 1.2, .6, .09, .012), 3],
    ride: () => [1.3, c => { metal(c, 0, 2.4, 5000, .35, 1.2); bruit(c, 0, 'bandpass', 9000, 1.5, .1, .5); }, 1],
    crash: K => [2.4, c => { metal(c, 0, K.cm || 1.3, 4000, .5, 2.3); bruit(c, 0, 'highpass', 5000, .6, .45, 2.2); }, 1],
    tomH: () => [.45, c => { chute(c, 'sine', 230, 150, .25, .85, .38); bruit(c, 0, 'bandpass', 2500, 1, .15, .04); }, 1],
    tomL: () => [.5, c => { chute(c, 'sine', 150, 92, .3, .9, .45); bruit(c, 0, 'bandpass', 2000, 1, .15, .04); }, 1],
    hey: () => [.35, c => { const g = c.createGain(), som = c.createGain(); g.gain.setValueAtTime(.0001, 0); g.gain.exponentialRampToValueAtTime(.9, .012); g.gain.exponentialRampToValueAtTime(.0001, .3); g.connect(OUT(c));   // « HÉ ! » : six gorges
      [[530, 1, 5], [1850, .6, 7], [2500, .25, 6]].forEach(([fr, v, q]) => { const bp = c.createBiquadFilter(), m = c.createGain(); bp.type = 'bandpass'; bp.frequency.value = fr; bp.Q.value = q; m.gain.value = v; som.connect(bp); bp.connect(m); m.connect(g); });
      for (let j = 0; j < 6; j++) { const f9 = 160 + R() * 70, o = osc(c, 'sawtooth', f9), m = c.createGain(); o.frequency.setValueAtTime(f9, 0); o.frequency.exponentialRampToValueAtTime(f9 * .7, .28); m.gain.value = .3; o.connect(m); m.connect(panne(c, (j / 5) * 1.2 - .6, som)); o.start(R() * .015); }
      bruit(c, 0, 'bandpass', 2200, .7, .3, .2, .005, g); }, 2],
    impact: () => [1.6, c => { chute(c, 'sine', 95, 30, 1, .95, 1.5); bruit(c, 0, 'lowpass', 400, .7, .5, .3); }, 1],
    riser: K => K.riser === 'ton' ? [2.4, c => { const g = c.createGain(), fl = c.createBiquadFilter(); fl.type = 'lowpass'; fl.Q.value = 3; fl.frequency.setValueAtTime(500, 0); fl.frequency.exponentialRampToValueAtTime(6000, 2.3);   // la montée EN TON : trois scies (fondamentale, quinte, octave) qui grimpent
        g.gain.setValueAtTime(.02, 0); g.gain.linearRampToValueAtTime(.6, 2.3); g.gain.linearRampToValueAtTime(.0001, 2.4); fl.connect(g); g.connect(OUT(c));
        [1, 1.5, 2.003].forEach(r => { const o = osc(c, 'sawtooth', 110 * r); o.frequency.setValueAtTime(110 * r, 0); o.frequency.exponentialRampToValueAtTime(440 * r, 2.35); o.connect(fl); o.start(0); });
        bruit(c, 0, 'highpass', 4000, .7, .15, 2.35, 2, g); }, 1]
      : [2.4, c => { const s = c.createBufferSource(), fl = c.createBiquadFilter(), g = c.createGain(); s.buffer = nzBuf(c, 2.45); fl.type = 'bandpass'; fl.Q.value = 2.5;
      fl.frequency.setValueAtTime(350, 0); fl.frequency.exponentialRampToValueAtTime(5200, 2.35); g.gain.setValueAtTime(.02, 0); g.gain.linearRampToValueAtTime(.9, 2.3); g.gain.linearRampToValueAtTime(.0001, 2.4);
      s.connect(fl); fl.connect(g); g.connect(OUT(c)); s.start(0); }, 1],
    ka: () => [.3, c => { bruit(c, 0, 'bandpass', 1500, 2, 1, .05); chute(c, 'sine', 160, 90, .08, .6, .14); bruit(c, .03, 'highpass', 3000, .8, .3, .08); }, 1],   // le tiroir-caisse
    turbo: () => [.6, c => { const s = c.createBufferSource(), fl = c.createBiquadFilter(), g = c.createGain(); s.buffer = nzBuf(c, .6); fl.type = 'bandpass'; fl.Q.value = 1.4;   // la soupape : pschhh
      fl.frequency.setValueAtTime(4200, 0); fl.frequency.exponentialRampToValueAtTime(700, .45); g.gain.setValueAtTime(.0001, 0); g.gain.exponentialRampToValueAtTime(.8, .015); g.gain.exponentialRampToValueAtTime(.0001, .55);
      s.connect(fl); fl.connect(g); g.connect(OUT(c)); s.start(0); }, 2],
    vinyl: () => [3, c => { const b = c.createBuffer(1, c.sampleRate * 3, c.sampleRate), d = b.getChannelData(0); let y = 0;
      for (let i = 0; i < d.length; i++) { y = .97 * y + .03 * (R() * 2 - 1); d[i] = y * .5 + (R() < .0005 ? (R() * 2 - 1) * 1.5 : 0); }
      const s = c.createBufferSource(), fl = c.createBiquadFilter(); fl.type = 'bandpass'; fl.frequency.value = 2500; fl.Q.value = .5; s.buffer = b; s.connect(fl); fl.connect(OUT(c)); s.start(0); }, 1],
  };
  // LES BASSES (mono, le grave reste au centre)
  const BASSES = {
    roule: [.5, (c, f) => { const g = c.createGain(), fl = c.createBiquadFilter(); fl.type = 'lowpass'; fl.Q.value = 4; fl.frequency.setValueAtTime(1800, 0); fl.frequency.exponentialRampToValueAtTime(380, .14);
      g.gain.setValueAtTime(.0001, 0); g.gain.exponentialRampToValueAtTime(.6, .003); g.gain.setValueAtTime(.6, .3); g.gain.exponentialRampToValueAtTime(.0001, .48); fl.connect(g); g.connect(OUT(c));
      [osc(c, 'sawtooth', f, -6), osc(c, 'sawtooth', f, 6)].forEach(o => { const m = c.createGain(); m.gain.value = .45; o.connect(m); m.connect(fl); o.start(0); });
      const s = osc(c, 'sine', f), sg = c.createGain(); sg.gain.value = .6; s.connect(sg); sg.connect(g); s.start(0); }],
    funk: [.6, (c, f) => { const g = c.createGain(), fl = c.createBiquadFilter(), ws = c.createWaveShaper(); ws.curve = courbe(1.6); fl.type = 'lowpass'; fl.Q.value = 5; fl.frequency.setValueAtTime(2400, 0); fl.frequency.exponentialRampToValueAtTime(340, .12);
      g.gain.setValueAtTime(.0001, 0); g.gain.exponentialRampToValueAtTime(.7, .003); g.gain.exponentialRampToValueAtTime(.32, .3); g.gain.exponentialRampToValueAtTime(.0001, .56); fl.connect(ws); ws.connect(g); g.connect(OUT(c));
      [osc(c, 'square', f), osc(c, 'sawtooth', f, -5)].forEach(o => { o.connect(fl); o.start(0); }); const s = osc(c, 'sine', f), sg = c.createGain(); sg.gain.value = .6; s.connect(sg); sg.connect(g); s.start(0); }],
    acid: [.5, (c, f) => { const g = c.createGain(), fl = c.createBiquadFilter(), ws = c.createWaveShaper(); ws.curve = courbe(2); fl.type = 'lowpass'; fl.Q.value = 12;   // le 303 : la résonance qui crie
      fl.frequency.setValueAtTime(2800, 0); fl.frequency.exponentialRampToValueAtTime(360, .18); g.gain.setValueAtTime(.0001, 0); g.gain.exponentialRampToValueAtTime(.6, .003); g.gain.exponentialRampToValueAtTime(.0001, .45);
      const o = osc(c, 'sawtooth', f); o.connect(fl); fl.connect(ws); ws.connect(g); g.connect(OUT(c)); o.start(0); const s9 = osc(c, 'sine', f), sg = c.createGain(); sg.gain.value = .5; s9.connect(sg); sg.connect(g); s9.start(0); }],
    reese: [.7, (c, f) => { const g = c.createGain(), fl = c.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = 650; fl.Q.value = 1.5; fl.connect(g);   // deux scies qui battent
      g.gain.setValueAtTime(.0001, 0); g.gain.exponentialRampToValueAtTime(.7, .01); g.gain.setValueAtTime(.7, .5); g.gain.exponentialRampToValueAtTime(.0001, .68); g.connect(OUT(c));
      [-15, 15].forEach(dt => { const o = osc(c, 'sawtooth', f, dt); o.connect(fl); o.start(0); }); const s9 = osc(c, 'sine', f), sg = c.createGain(); sg.gain.value = .8; s9.connect(sg); sg.connect(g); s9.start(0); }],
    slap: [.5, (c, f) => { const g = c.createGain(), fl = c.createBiquadFilter(); fl.type = 'lowpass'; fl.Q.value = 3; fl.frequency.setValueAtTime(5000, 0); fl.frequency.exponentialRampToValueAtTime(600, .06);   // le pouce qui claque
      g.gain.setValueAtTime(.0001, 0); g.gain.exponentialRampToValueAtTime(.8, .002); g.gain.exponentialRampToValueAtTime(.25, .12); g.gain.exponentialRampToValueAtTime(.0001, .46); fl.connect(g); g.connect(OUT(c));
      [osc(c, 'sawtooth', f), osc(c, 'triangle', f * 2)].forEach((o, k) => { const m = c.createGain(); m.gain.value = k ? .3 : .8; o.connect(m); m.connect(fl); o.start(0); }); bruit(c, 0, 'bandpass', 2500, 1.5, .3, .02); }],
    tri: [.45, (c, f) => { const g = c.createGain(); g.gain.setValueAtTime(.0001, 0); g.gain.exponentialRampToValueAtTime(.8, .003); g.gain.setValueAtTime(.8, .25); g.gain.exponentialRampToValueAtTime(.0001, .42); g.connect(OUT(c));   // la basse triangle de la console
      const o = osc(c, 'triangle', f); o.connect(g); o.start(0); const s9 = osc(c, 'sine', f), sg = c.createGain(); sg.gain.value = .4; s9.connect(sg); sg.connect(g); s9.start(0); }],
    sub: [.9, (c, f) => { const g = c.createGain(); g.gain.setValueAtTime(.0001, 0); g.gain.exponentialRampToValueAtTime(.8, .01); g.gain.setValueAtTime(.8, .6); g.gain.exponentialRampToValueAtTime(.0001, .88);
      const o = osc(c, 'sine', f); o.connect(g); g.connect(OUT(c)); o.start(0); }],
  };
  // LES MÉLODIES (stéréo : voix désaccordées gauche / droite)
  const LEADS = {
    scie: [1.9, (c, f) => { const g = envG(c, .025, 1.45, .4, .36), fl = c.createBiquadFilter(); fl.type = 'lowpass'; fl.Q.value = .8; fl.frequency.setValueAtTime(4200, 0); fl.frequency.exponentialRampToValueAtTime(2600, .35); fl.connect(g);
      const vg = vib(c, 5.4, 11, .28); [[-10, -.55], [0, 0], [10, .55]].forEach(([dt, x]) => { const o = osc(c, 'sawtooth', f, dt); vg.connect(o.detune); o.connect(panne(c, x, fl)); o.start(0); });
      const t9 = osc(c, 'triangle', f * 2), tg = c.createGain(); tg.gain.value = .18; t9.connect(tg); tg.connect(fl); t9.start(0); }],
    carre: [1.9, (c, f) => { const g = envG(c, .02, 1.4, .4, .32), fl = c.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = 2400; fl.connect(g); const vg = vib(c, 5.6, 12, .3);
      [[-7, -.4], [7, .4]].forEach(([dt, x]) => { const o = osc(c, 'square', f, dt); vg.connect(o.detune); o.connect(panne(c, x, fl)); o.start(0); }); }],
    talkbox: [1.9, (c, f) => { const g = envG(c, .02, 1.4, .35, .5), vg = vib(c, 5.5, 10, .3), som = c.createGain();
      [[300, 750, 1, 6], [870, 1200, .55, 7], [2250, 2600, .15, 6]].forEach(([f0, f1, v, q]) => { const bp = c.createBiquadFilter(), m = c.createGain(); bp.type = 'bandpass'; bp.Q.value = q;
        bp.frequency.setValueAtTime(f0, 0); bp.frequency.linearRampToValueAtTime(f1, .18); m.gain.value = v; som.connect(bp); bp.connect(m); m.connect(g); });
      [['sawtooth', 1, -.3], ['square', .6, .3]].forEach(([ty, v, x]) => { const o = osc(c, ty, f), m = c.createGain(); m.gain.value = v; vg.connect(o.detune); o.connect(m); m.connect(panne(c, x, som)); o.start(0); }); }],
    verre: [2, (c, f) => { const g = envG(c, .006, 1.4, .55, .42);
      [[-4, -.45], [4, .45]].forEach(([dt, x]) => { const car = osc(c, 'sine', f, dt), mod = osc(c, 'sine', f * 2, dt), mg = c.createGain(); mg.gain.setValueAtTime(f * 1.5, 0); mg.gain.exponentialRampToValueAtTime(f * .25, .6);
        mod.connect(mg); mg.connect(car.frequency); car.connect(panne(c, x, g)); car.start(0); mod.start(0); });
      const s = osc(c, 'sine', f * 2), sg = c.createGain(); sg.gain.setValueAtTime(.12, 0); sg.gain.exponentialRampToValueAtTime(.0001, .8); s.connect(sg); sg.connect(g); s.start(0); }],
    cuivre: [1.9, (c, f) => { const g = envG(c, .04, 1.4, .35, .38), fl = c.createBiquadFilter(); fl.type = 'lowpass'; fl.Q.value = 1.4; fl.frequency.setValueAtTime(700, 0); fl.frequency.exponentialRampToValueAtTime(3200, .08); fl.frequency.exponentialRampToValueAtTime(1700, .5); fl.connect(g);   // le cuivre qui gonfle
      const vg = vib(c, 5.2, 9, .35); [[-8, -.4], [8, .4]].forEach(([dt, x]) => { const o = osc(c, 'sawtooth', f, dt); vg.connect(o.detune); o.connect(panne(c, x, fl)); o.start(0); }); }],
    // LE SAXOPHONE DE MINUIT : scie + carré dans les résonances d'un sax (600 · 1 400 · 2 800 Hz), le souffle, l'attaque qui « remonte » à la note, le vibrato qui arrive
    saxo: [2, (c, f) => { const g = envG(c, .045, 1.5, .35, .42), som = c.createGain(), vg = vib(c, 5, 16, .3), sc = c.createGain(); sc.gain.value = 1;
      [[620, 1, 4], [1400, .7, 5], [2800, .3, 6], [300, .5, 1]].forEach(([fr, v, q]) => { const bp = c.createBiquadFilter(), m = c.createGain(); bp.type = 'bandpass'; bp.frequency.value = fr; bp.Q.value = q; m.gain.value = v; som.connect(bp); bp.connect(m); m.connect(g); });
      [['sawtooth', 1, -.25], ['square', .45, .25]].forEach(([ty, v, x]) => { const o = osc(c, ty, f), m = c.createGain(); m.gain.value = v; o.detune.setValueAtTime(-45, 0); o.detune.linearRampToValueAtTime(0, .09); vg.connect(o.detune); o.connect(m); m.connect(panne(c, x, som)); o.start(0); });
      bruit(c, 0, 'bandpass', Math.min(6000, f * 3), 1.2, .05, 1.5, .05, g); }],
    // LE THÉRÉMINE : une sinusoïde qui chante, un grand vibrato (et, dans le jeu, il GLISSE d'une note à l'autre)
    theremine: [2, (c, f) => { const g = envG(c, .08, 1.5, .4, .45), vg = vib(c, 5.8, 28, .15); [['sine', 1, -.2], ['triangle', .12, .2]].forEach(([ty, v, x]) => { const o = osc(c, ty, f), m = c.createGain(); m.gain.value = v; vg.connect(o.detune); o.connect(m); m.connect(panne(c, x, g)); o.start(0); }); }],
    // LE STEEL DRUM : des partiels presque harmoniques qui s'éteignent vite, un petit coup de baguette
    steel: [1.4, (c, f) => { const g = c.createGain(); g.gain.setValueAtTime(.0001, 0); g.gain.exponentialRampToValueAtTime(.5, .004); g.gain.exponentialRampToValueAtTime(.0001, 1.3); g.connect(OUT(c));
      [[1, 1, 1.3, -.3], [2, .45, .5, .3], [3.01, .25, .25, 0], [4.2, .1, .1, 0]].forEach(([r, v, d, x]) => { const o = osc(c, 'sine', f * r), m = c.createGain(); m.gain.setValueAtTime(v, 0); m.gain.exponentialRampToValueAtTime(.0001, d); o.connect(m); m.connect(panne(c, x, g)); o.start(0); });
      bruit(c, 0, 'bandpass', 3000, 2, .08, .02, .001, g); }],
    // LA KALIMBA : la lame (une sinusoïde) et son cliquetis aigu qui meurt aussitôt
    kalimba: [1.2, (c, f) => { const g = c.createGain(); g.gain.setValueAtTime(.0001, 0); g.gain.exponentialRampToValueAtTime(.55, .002); g.gain.exponentialRampToValueAtTime(.0001, 1.1); g.connect(OUT(c));
      [[1, 1, 1.1, -.25], [5.4, .3, .06, .25], [2, .12, .3, 0]].forEach(([r, v, d, x]) => { const o = osc(c, 'sine', f * r), m = c.createGain(); m.gain.setValueAtTime(v, 0); m.gain.exponentialRampToValueAtTime(.0001, d); o.connect(m); m.connect(panne(c, x, g)); o.start(0); }); }],
    // LA PUCE 8 BITS : une impulsion à 25 % (la console), le vibrato qui arrive
    chip: [1.6, (c, f) => { const g = envG(c, .005, 1.2, .25, .3), vg = vib(c, 6, 14, .25), N = 24, re = new Float32Array(N), im = new Float32Array(N);
      for (let k = 1; k < N; k++) im[k] = 2 / (k * Math.PI) * Math.sin(k * Math.PI * .25); const pw = c.createPeriodicWave(re, im);
      [[-4, -.3], [4, .3]].forEach(([dt, x]) => { const o = c.createOscillator(); o.setPeriodicWave(pw); o.frequency.value = f; o.detune.value = dt; vg.connect(o.detune); o.connect(panne(c, x, g)); o.start(0); }); }],
    sifflet: [1.9, (c, f) => { const g = envG(c, .04, 1.4, .35, .4); const vg = vib(c, 6, 18, .2);
      [[0, -.2], [5, .2]].forEach(([dt, x]) => { const o = osc(c, 'sine', f, dt); vg.connect(o.detune); o.connect(panne(c, x, g)); o.start(0); }); bruit(c, 0, 'bandpass', f * 2, 3, .015, 1.2, .05, g); }],
    // LA CLOCHE DE VACHE (le phonk) : deux carrés à la QUINTE (la vraie 808 frotte à 1,48 : ici elle reste juste) dans une bande, un coup sec
    cowbell: [.7, (c, f) => { const g = c.createGain(), bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = Math.min(5000, f * 1.6); bp.Q.value = .9;
      g.gain.setValueAtTime(.0001, 0); g.gain.exponentialRampToValueAtTime(.55, .002); g.gain.exponentialRampToValueAtTime(.18, .07); g.gain.exponentialRampToValueAtTime(.0001, .65); bp.connect(g); g.connect(OUT(c));
      [[1, 1, -.25], [1.5, .7, .25]].forEach(([r, v, x]) => { const o = osc(c, 'square', f * r), m = c.createGain(); m.gain.value = v; o.connect(m); m.connect(panne(c, x, bp)); o.start(0); }); }],
    flute: [2.2, (c, f) => { const g = envG(c, .12, 1.8, .35, .35); const vg = vib(c, 4.6, 9, 0);
      [['sine', 1, f, -.25], ['triangle', .25, f * 2, .25]].forEach(([ty, v, ff, x]) => { const o = osc(c, ty, ff), m = c.createGain(); m.gain.value = v; vg.connect(o.detune); o.connect(m); m.connect(panne(c, x, g)); o.start(0); });
      bruit(c, 0, 'bandpass', f * 3, 2, .02, 1.6, .1, g); }],
  };
  function voixDe(nom, Tm) {
    if (OPT && OPT.voix && OPT.voix[nom]) { const v9 = OPT.voix[nom](OUTILS(), Tm); if (v9) return v9; }   // (15/10) une V2 remplace la voix   // [durée, hauteurs de référence, fabrique(c, f), canaux] — ou { ks: true, … } pour les cordes pincées — ou { vrai } (un vrai instrument)
    const vr = x => typeof x === 'string' && x[0] === '@' ? { vrai: x.slice(1) } : null;
    if (nom === 'basse' && vr(Tm.basse)) return vr(Tm.basse); if (nom === 'lead' && vr(Tm.lead)) return vr(Tm.lead);
    if (nom === 'contre' && vr(Tm.contre)) return vr(Tm.contre); if (nom === 'pluck' && vr(Tm.pluck)) return vr(Tm.pluck);
    if (nom === 'basse') return est808(Tm.basse) ? voixDe('b808', Tm) : [BASSES[Tm.basse][0], [36, 48, 60], BASSES[Tm.basse][1], 1];
    if (nom === 'sub') return [BASSES.sub[0], [36, 48], BASSES.sub[1], 1];
    if (nom === 'b808') { const dr = Tm.basse === '808dur' ? 4 : Tm.basse === 'sub808' ? 1.05 : 2.2, d9 = Tm.basse === '808dur' ? Tm.d808 * .7 : Tm.basse === 'sub808' ? Tm.d808 * 1.25 : Tm.d808;   // la 808 · saturée · ronde
      return [d9 + .25, [36, 48], (c, f) => { const o = osc(c, 'sine', f), g = c.createGain(), ws = c.createWaveShaper(); ws.curve = courbe(dr);
      g.gain.setValueAtTime(.0001, 0); g.gain.exponentialRampToValueAtTime(.8, .006); g.gain.setValueAtTime(.8, d9 * .75); g.gain.exponentialRampToValueAtTime(.0001, d9); o.connect(g); g.connect(ws); ws.connect(OUT(c)); o.start(0);
      if (Tm.basse === '808dur') { const o2 = osc(c, 'sine', f * 2), g2 = c.createGain(); g2.gain.setValueAtTime(.25, 0); g2.gain.exponentialRampToValueAtTime(.0001, .15); o2.connect(g2); g2.connect(ws); o2.start(0); } }, 1]; }
    if (nom === 'lead' && (Tm.lead === 'guitare' || Tm.lead === 'guitareSat')) return { ks: true, dur: Tm.lead === 'guitareSat' ? 2.2 : 1.6, refs: [48, 60, 72, 84], eclat: Tm.lead === 'guitareSat' ? .62 : .52, sat: Tm.lead === 'guitareSat' };
    if (nom === 'lead') return [LEADS[Tm.lead][0], [48, 60, 72], LEADS[Tm.lead][1], 2];
    if (nom === 'contre') { const k = Tm.contre;   // LE CONTRE-CHANT : flûte · violon · voix · orgue
      if (k === 'violon') return [2.4, [60, 72], (c, f) => { const g = envG(c, .28, 1.9, .4, .3), fl = c.createBiquadFilter(), vg = vib(c, 5.6, 14, .35); fl.type = 'lowpass'; fl.frequency.value = 2600; fl.Q.value = .8; fl.connect(g);
        [[-6, -.35], [6, .35]].forEach(([dt, x]) => { const o = osc(c, 'sawtooth', f, dt); vg.connect(o.detune); o.connect(panne(c, x, fl)); o.start(0); }); }, 2];
      if (k === 'voix') return [2.4, [60, 72], (c, f) => { const g = envG(c, .3, 1.9, .4, .5), som = c.createGain(), vg = vib(c, 5, 10, .3);
        [[325, 1, 7], [700, .45, 8], [2700, .08, 6]].forEach(([fr, v, q]) => { const bp = c.createBiquadFilter(), m = c.createGain(); bp.type = 'bandpass'; bp.frequency.value = fr; bp.Q.value = q; m.gain.value = v; som.connect(bp); bp.connect(m); m.connect(g); });
        [[-6, -.4], [6, .4]].forEach(([dt, x]) => { const o = osc(c, 'sawtooth', f, dt); vg.connect(o.detune); o.connect(panne(c, x, som)); o.start(0); }); }, 2];
      if (k === 'orgue') return [2.2, [60, 72], (c, f) => { const g = envG(c, .03, 1.8, .3, .3), vg = vib(c, 6.4, 8, 0);
        [[1, 1, -.3], [2, .55, .3], [3, .3, 0], [4, .15, 0]].forEach(([r, v, x]) => { const o = osc(c, 'sine', f * r), m = c.createGain(); m.gain.value = v; vg.connect(o.detune); o.connect(m); m.connect(panne(c, x, g)); o.start(0); }); }, 2];
      return [LEADS.flute[0], [60, 72], LEADS.flute[1], 2]; }
    if (nom === 'pluck') { const k = Tm.pluck;   // L'ARPÈGE (et les fills, la gerbe de la pose) : corde de verre · scie pincée · cloche FM · puce · bois
      if (k === 'scie') return [.9, [48, 60, 72, 84], (c, f) => { const g = c.createGain(), fl = c.createBiquadFilter(); fl.type = 'lowpass'; fl.Q.value = 3; fl.frequency.setValueAtTime(3600, 0); fl.frequency.exponentialRampToValueAtTime(600, .2);
        g.gain.setValueAtTime(.0001, 0); g.gain.exponentialRampToValueAtTime(.5, .003); g.gain.exponentialRampToValueAtTime(.0001, .8); fl.connect(g); g.connect(OUT(c));
        [[-6, -.4], [6, .4]].forEach(([dt, x]) => { const o = osc(c, 'sawtooth', f, dt); o.connect(panne(c, x, fl)); o.start(0); }); }, 2];
      if (k === 'fm') return [.9, [48, 60, 72, 84], (c, f) => { const g = c.createGain(); g.gain.setValueAtTime(.0001, 0); g.gain.exponentialRampToValueAtTime(.5, .002); g.gain.exponentialRampToValueAtTime(.0001, .8); g.connect(OUT(c));
        [[-3, -.4], [3, .4]].forEach(([dt, x]) => { const car = osc(c, 'sine', f, dt), mod = osc(c, 'sine', f * 2, dt), mg = c.createGain(); mg.gain.setValueAtTime(f * 1.6, 0); mg.gain.exponentialRampToValueAtTime(f * .05, .18);
          mod.connect(mg); mg.connect(car.frequency); car.connect(panne(c, x, g)); car.start(0); mod.start(0); }); }, 2];
      if (k === 'puce') return [.6, [48, 60, 72, 84], (c, f) => { const g = c.createGain(), N = 24, re = new Float32Array(N), im = new Float32Array(N); for (let j = 1; j < N; j++) im[j] = 2 / (j * Math.PI) * Math.sin(j * Math.PI * .125);
        const pw = c.createPeriodicWave(re, im); g.gain.setValueAtTime(.0001, 0); g.gain.exponentialRampToValueAtTime(.4, .002); g.gain.exponentialRampToValueAtTime(.0001, .45); g.connect(OUT(c));
        [[-4, -.3], [4, .3]].forEach(([dt, x]) => { const o = c.createOscillator(); o.setPeriodicWave(pw); o.frequency.value = f; o.detune.value = dt; o.connect(panne(c, x, g)); o.start(0); }); }, 2];
      if (k === 'bois') return [.8, [48, 60, 72, 84], (c, f) => { const g = c.createGain(); g.gain.setValueAtTime(.0001, 0); g.gain.exponentialRampToValueAtTime(.55, .002); g.gain.exponentialRampToValueAtTime(.0001, .7); g.connect(OUT(c));   // le marimba
        [[1, 1, .7, -.2], [4, .3, .06, .2], [10, .08, .02, 0]].forEach(([r, v, d, x]) => { const o = osc(c, 'sine', f * r), m = c.createGain(); m.gain.setValueAtTime(v, 0); m.gain.exponentialRampToValueAtTime(.0001, d); o.connect(m); m.connect(panne(c, x, g)); o.start(0); }); }, 2];
      return { ks: true, dur: 1.1, refs: [48, 60, 72, 84] }; }
    if (nom === 'foule') return [1.6, [48, 60], (c, f) => { const g = envG(c, .04, 1.2, .3, .5), som = c.createGain();   // le chœur de stade : huit voix d'hommes sur « oh », pas tout à fait ensemble
      [[400, 1, 6], [800, .5, 7], [2600, .08, 6]].forEach(([fr, v, q]) => { const bp = c.createBiquadFilter(), m = c.createGain(); bp.type = 'bandpass'; bp.frequency.value = fr; bp.Q.value = q; m.gain.value = v; som.connect(bp); bp.connect(m); m.connect(g); });
      for (let j = 0; j < 8; j++) { const o = osc(c, 'sawtooth', f, (R() - .5) * 28), m = c.createGain(); m.gain.setValueAtTime(0, 0); m.gain.linearRampToValueAtTime(.3, .02 + R() * .05); o.connect(m); m.connect(panne(c, (j / 7) * 1.4 - .7, som)); o.start(0); }
      bruit(c, 0, 'bandpass', 1500, .8, .04, 1.2, .05, g); }, 2];
    if (nom === 'crisse') return [1.1, [72, 84], (c, f) => { const g = envG(c, .03, .8, .25, .5), s9 = c.createBufferSource(), b1 = c.createBiquadFilter(), b2 = c.createBiquadFilter();   // les pneus qui crissent : un bruit pincé sur la note, qui tremble
      s9.buffer = nzBuf(c, 1.15); b1.type = b2.type = 'bandpass'; b1.Q.value = 28; b2.Q.value = 18; b1.frequency.value = f; b2.frequency.value = f * 2;
      const lfo = osc(c, 'sine', 9), lg = c.createGain(); lg.gain.value = f * .012; lfo.connect(lg); lg.connect(b1.frequency); lfo.start(0);
      const m2 = c.createGain(); m2.gain.value = .5; s9.connect(b1); s9.connect(b2); b1.connect(g); b2.connect(m2); m2.connect(g); s9.start(0);
      const o = osc(c, 'triangle', f), og = c.createGain(); og.gain.value = .05; o.connect(og); og.connect(g); o.start(0); }, 1];
    if (nom === 'piece') return [.5, [84, 96], (c, f) => { const g = c.createGain(), car = osc(c, 'sine', f), mod = osc(c, 'sine', f * 3.5), mg = c.createGain();   // la pièce : un FM bref et brillant
      mg.gain.setValueAtTime(f * 2, 0); mg.gain.exponentialRampToValueAtTime(f * .1, .06); mod.connect(mg); mg.connect(car.frequency);
      g.gain.setValueAtTime(.0001, 0); g.gain.exponentialRampToValueAtTime(.6, .001); g.gain.exponentialRampToValueAtTime(.0001, .45); car.connect(g); g.connect(OUT(c)); car.start(0); mod.start(0);
      const p2 = osc(c, 'sine', f * 2.76), g2 = c.createGain(); g2.gain.setValueAtTime(.2, 0); g2.gain.exponentialRampToValueAtTime(.0001, .12); p2.connect(g2); g2.connect(OUT(c)); p2.start(0); }, 1];
    if (nom === 'ching') return [1.6, [72, 84], (c, f) => { const g = c.createGain(); g.gain.setValueAtTime(.0001, 0); g.gain.exponentialRampToValueAtTime(.5, .002); g.gain.exponentialRampToValueAtTime(.0001, 1.5); g.connect(OUT(c));
      [[1, 1], [2.76, .5], [5.4, .25], [8.9, .1]].forEach(([r, v]) => { const o = osc(c, 'sine', f * r), m = c.createGain(); m.gain.value = v; o.connect(m); m.connect(g); o.start(0); }); }, 1];
    if (nom === 'siffle') return [.5, [84, 96], (c, f) => { const g = envG(c, .02, .3, .15, .4); const o = osc(c, 'sine', f); o.connect(g); o.start(0); bruit(c, 0, 'bandpass', f, 4, .05, .4, .02, g); }, 1];
    if (nom === 'neon') return [1.6, [48, 60], (c, f) => { const g = envG(c, .3, 1.1, .4, .3), fl = c.createBiquadFilter(), am = c.createGain(), lfo = osc(c, 'square', 50), lg = c.createGain();   // le grésillement : modulé à 50 Hz
      fl.type = 'bandpass'; fl.frequency.value = 1800; fl.Q.value = .9; lg.gain.value = .35; am.gain.value = .65; lfo.connect(lg); lg.connect(am.gain); lfo.start(0); fl.connect(am); am.connect(g);
      [[f, 1], [f * 2, .5], [f * 3, .25]].forEach(([ff, v]) => { const o = osc(c, 'sawtooth', ff), m = c.createGain(); m.gain.value = v; o.connect(m); m.connect(fl); o.start(0); }); }, 1];
    if (nom === 'moteur') return [1.2, [36, 48], (c, f) => { const g = c.createGain(), fl = c.createBiquadFilter(), ws = c.createWaveShaper(); ws.curve = courbe(2.5); fl.type = 'lowpass'; fl.frequency.value = 900; fl.Q.value = 4;   // le moteur : scie + carré saturés
      g.gain.setValueAtTime(.0001, 0); g.gain.exponentialRampToValueAtTime(.7, .01); g.gain.setValueAtTime(.7, .9); g.gain.exponentialRampToValueAtTime(.0001, 1.15); fl.connect(ws); ws.connect(g); g.connect(OUT(c));
      [osc(c, 'sawtooth', f), osc(c, 'square', f * 1.005), osc(c, 'sawtooth', f * 2.003)].forEach((o, k) => { const m = c.createGain(); m.gain.value = [1, .6, .3][k]; o.connect(m); m.connect(fl); o.start(0); }); }, 1];
    if (nom === 'klaxon') return [.35, [60, 72], (c, f) => { const g = c.createGain(), bp = c.createBiquadFilter(), lp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1000; bp.Q.value = .8; lp.type = 'lowpass'; lp.frequency.value = 2800;
      g.gain.setValueAtTime(.0001, 0); g.gain.exponentialRampToValueAtTime(.7, .006); g.gain.setValueAtTime(.7, .25); g.gain.exponentialRampToValueAtTime(.0001, .32); bp.connect(lp); lp.connect(g); g.connect(OUT(c));
      [osc(c, 'square', f), osc(c, 'square', f * 1.004)].forEach(o => { o.connect(bp); o.start(0); }); }, 1];
    if (nom === 'sirene') return [2.2, [72], (c, f) => { const g = envG(c, .25, 1.8, .35, .4); [['sine', 1, f], ['triangle', .2, f * 2]].forEach(([ty, v, ff]) => { const o = osc(c, ty, ff), m = c.createGain(); m.gain.value = v; o.connect(m); m.connect(g); o.start(0); }); }, 1];
    if (nom === 'cloche') return [2.2, [72, 84], (c, f) => { const g = c.createGain(); g.gain.setValueAtTime(.0001, 0); g.gain.exponentialRampToValueAtTime(.4, .002); g.gain.exponentialRampToValueAtTime(.0001, 2.1); g.connect(OUT(c));
      [[1, 1, -.3], [Tm.cr, .35, .3], [Tm.cr * 1.96, .1, 0]].forEach(([r, v, x]) => { const o = osc(c, 'sine', f * r), m = c.createGain(); m.gain.value = v; o.connect(m); m.connect(panne(c, x, g)); o.start(0); }); }, 2];
    return null;
  }
  // LES ACCORDS (l'accord entier, MENÉ, rendu d'un coup — stéréo)
  const KEYS = {
    rhodes: [1.9, (c, f, dest) => { [[-4, -.5, 0], [4, .5, .5]].forEach(([dt, x, ph]) => { const car = osc(c, 'sine', f, dt), mod = osc(c, 'sine', f, dt), tine = osc(c, 'sine', Math.min(f * 14, 20000)), mg = c.createGain(), tg = c.createGain(), g = c.createGain();
        mg.gain.setValueAtTime(f * 2, 0); mg.gain.exponentialRampToValueAtTime(f * .3, .6); tg.gain.setValueAtTime(f * .45, 0); tg.gain.exponentialRampToValueAtTime(1, .06);
        mod.connect(mg); mg.connect(car.frequency); tine.connect(tg); tg.connect(car.frequency);
        g.gain.setValueAtTime(.0001, 0); g.gain.exponentialRampToValueAtTime(.4, .004); g.gain.exponentialRampToValueAtTime(.15, .5); g.gain.exponentialRampToValueAtTime(.0001, 1.85);
        const tr9 = c.createGain(), lfo = osc(c, 'sine', 4.6), lg = c.createGain(); lg.gain.value = .25; tr9.gain.value = .75; lfo.connect(lg); lg.connect(tr9.gain);   // le trémolo qui passe de gauche à droite
        car.connect(g); g.connect(tr9); tr9.connect(panne(c, x, dest)); [car, mod, tine].forEach(o => o.start(0)); lfo.start(ph / 4.6); }); }],
    piano: [2.4, (c, f, dest) => { [[-3, -.4], [3, .4]].forEach(([dt, x]) => { const g = c.createGain(), fl = c.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.setValueAtTime(3600, 0); fl.frequency.exponentialRampToValueAtTime(900, 1.2);
        g.gain.setValueAtTime(.0001, 0); g.gain.exponentialRampToValueAtTime(.45, .003); g.gain.exponentialRampToValueAtTime(.12, .6); g.gain.exponentialRampToValueAtTime(.0001, 2.3); fl.connect(g); g.connect(panne(c, x, dest));
        [['triangle', 1, dt], ['sawtooth', .28, dt + 5], ['sine', .18, 1200]].forEach(([ty, v, d9]) => { const o = osc(c, ty, f, d9), m = c.createGain(); m.gain.value = v; o.connect(m); m.connect(fl); o.start(0); }); });
      bruit(c, 0, 'bandpass', Math.min(5000, f * 8), 1, .04, .03, .001, dest); }],
    dx: [1.8, (c, f, dest) => { [[-5, -.5], [5, .5]].forEach(([dt, x]) => { const car = osc(c, 'sine', f, dt), mod = osc(c, 'sine', f * 14, dt), mg = c.createGain(), mod2 = osc(c, 'sine', f, dt), mg2 = c.createGain(), g = c.createGain();   // la cloche de verre du DX7
        mg.gain.setValueAtTime(f * 3, 0); mg.gain.exponentialRampToValueAtTime(f * .05, .12); mg2.gain.setValueAtTime(f * 1.2, 0); mg2.gain.exponentialRampToValueAtTime(f * .2, .8); mod.connect(mg); mg.connect(car.frequency); mod2.connect(mg2); mg2.connect(car.frequency);
        g.gain.setValueAtTime(.0001, 0); g.gain.exponentialRampToValueAtTime(.4, .003); g.gain.exponentialRampToValueAtTime(.13, .6); g.gain.exponentialRampToValueAtTime(.0001, 1.75); car.connect(g); g.connect(panne(c, x, dest)); [car, mod, mod2].forEach(o => o.start(0)); }); }],
    orgue: [1.9, (c, f, dest) => { [[-.45, 0], [.45, .5]].forEach(([x, ph]) => { const g = c.createGain(), tr9 = c.createGain(), lfo = osc(c, 'sine', 5.8), lg = c.createGain();   // l'orgue à tirettes, sa cabine qui tourne
        g.gain.setValueAtTime(.0001, 0); g.gain.linearRampToValueAtTime(.22, .015); g.gain.setValueAtTime(.22, 1.5); g.gain.linearRampToValueAtTime(.0001, 1.85);
        lg.gain.value = .3; tr9.gain.value = .7; lfo.connect(lg); lg.connect(tr9.gain); lfo.start(ph / 5.8);
        [[1, 1], [2, .6], [3, .35], [4, .2], [.5, .3]].forEach(([r, v]) => { const o = osc(c, 'sine', f * r, x * 6), m = c.createGain(); m.gain.value = v; o.connect(m); m.connect(g); o.start(0); });
        g.connect(tr9); tr9.connect(panne(c, x, dest)); }); }],
    puce: [.9, (c, f, dest) => { const N = 24, re = new Float32Array(N), im = new Float32Array(N); for (let j = 1; j < N; j++) im[j] = 2 / (j * Math.PI) * Math.sin(j * Math.PI * .5);   // les accords 8 bits (carré)
      const pw = c.createPeriodicWave(re, im); [[-4, -.4], [4, .4]].forEach(([dt, x]) => { const o = c.createOscillator(), g = c.createGain(); o.setPeriodicWave(pw); o.frequency.value = f; o.detune.value = dt;
        g.gain.setValueAtTime(.0001, 0); g.gain.exponentialRampToValueAtTime(.25, .003); g.gain.setValueAtTime(.2, .12); g.gain.exponentialRampToValueAtTime(.0001, .85); o.connect(g); g.connect(panne(c, x, dest)); o.start(0); }); }],
    clav: [.7, (c, f, dest) => { [[-3, -.35], [3, .35]].forEach(([dt, x]) => { const g = c.createGain(), fl = c.createBiquadFilter(); fl.type = 'bandpass'; fl.frequency.value = Math.min(4000, f * 6); fl.Q.value = 1.4;
        g.gain.setValueAtTime(.0001, 0); g.gain.exponentialRampToValueAtTime(.6, .002); g.gain.exponentialRampToValueAtTime(.0001, .55); fl.connect(g); g.connect(panne(c, x, dest));
        [osc(c, 'square', f, dt), osc(c, 'sawtooth', f, dt + 3)].forEach(o => { o.connect(fl); o.start(0); }); }); }],
  };
  function accordDe(inst, Tm) {
    if (OPT && OPT.acc && OPT.acc[inst]) { const a9 = OPT.acc[inst](OUTILS(), Tm); if (a9) return a9; }   // (15/10) une V2 remplace l'accord   // [durée, fréquence d'échantillonnage, fabrique(c, f, sortie)] — ou 'ks' (la harpe de verre) — ou { vrai } (de vrais instruments)
    const va = x => typeof x === 'string' && x[0] === '@' ? x.slice(1) : null;
    if (inst === 'keys' && va(Tm.keys)) return { vrai: [va(Tm.keys)], strum: va(Tm.keys) === 'harpe' ? .014 : .006, dur: 2.4 };
    if (inst === 'pad' && va(Tm.pad)) return { vrai: [va(Tm.pad)], strum: 0, dur: 2.6 };
    if (inst === 'cordes' && va(Tm.cordes)) return { vrai: ['celli', 'violons'], split: 58, strum: 0, dur: 2.6 };
    if (inst === 'cuivres' && va(Tm.cuivres)) return { vrai: ['tromboneStac', 'trompetteStac'], split: 56, strum: 0, dur: 1.2 };
    if (inst === 'keys' && Tm.keys === 'guitare') return 'ksSat'; if (inst === 'keys' && Tm.keys === 'guitareC') return 'ksClair';   // la guitare rythmique : les cordes pincées, grattées, dans l'ampli
    if (inst === 'keys') return Tm.keys === 'harpe' ? 'ks' : [KEYS[Tm.keys][0], 44100, KEYS[Tm.keys][1]];
    if (inst === 'pad') return [3.4, 24000, (c, f, dest) => { const g = envG(c, Tm.padAtt, 2.7, .6, .2, dest), fl = c.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = Tm.padFc; fl.Q.value = .5; fl.connect(g);
      if (Tm.pad === 'verre') { [[-5, -.7], [5, .7]].forEach(([dt, x]) => { const car = osc(c, 'sine', f, dt), mod = osc(c, 'sine', f * 3, dt), mg = c.createGain(); mg.gain.value = f * .35; mod.connect(mg); mg.connect(car.frequency); car.connect(panne(c, x, fl)); car.start(0); mod.start(0); }); return; }   // la nappe de verre (FM douce)
      if (Tm.pad === 'voix') { const som = c.createGain(); [[800, 1, 6], [1150, .5, 7], [2900, .1, 6]].forEach(([fr, v, q]) => { const bp = c.createBiquadFilter(), m = c.createGain(); bp.type = 'bandpass'; bp.frequency.value = fr; bp.Q.value = q; m.gain.value = v; som.connect(bp); bp.connect(m); m.connect(fl); });   // la nappe de voix (« aah »)
        [[-9, -.7], [9, .7]].forEach(([dt, x]) => { const o = osc(c, 'sawtooth', f, dt); o.connect(panne(c, x, som)); o.start(0); }); return; }
      [[-Tm.padLarge, -.8], [-Tm.padLarge / 3, -.3], [Tm.padLarge / 3, .3], [Tm.padLarge, .8]].forEach(([dt, x]) => { const o = osc(c, Tm.pad === 'doux' ? 'triangle' : 'sawtooth', f, dt); o.connect(panne(c, x, fl)); o.start(0); });
      const s = osc(c, 'triangle', f / 2), sg = c.createGain(); sg.gain.value = .4; s.connect(sg); sg.connect(fl); s.start(0); }];
    if (inst === 'stab') return [.5, 44100, (c, f, dest) => { const g = c.createGain(), fl = c.createBiquadFilter(); fl.type = 'lowpass'; fl.Q.value = 2.5; fl.frequency.setValueAtTime(Tm.sfc, 0); fl.frequency.exponentialRampToValueAtTime(1100, .14);
      g.gain.setValueAtTime(.0001, 0); g.gain.exponentialRampToValueAtTime(.4, .003); g.gain.exponentialRampToValueAtTime(.0001, .45); fl.connect(g); g.connect(dest);
      [[-10, -.5], [10, .5]].forEach(([dt, x]) => { const o = osc(c, 'sawtooth', f, dt); o.connect(panne(c, x, fl)); o.start(0); }); }];
    if (inst === 'cordes' && Tm.cordes === 'synth') return [3.4, 24000, (c, f, dest) => { const g = envG(c, .18, 2.6, .6, .16, dest), fl = c.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = 3600; fl.connect(g);   // les cordes synthé (plus vives)
      [['sawtooth', -9, -.7], ['square', 0, 0], ['sawtooth', 9, .7]].forEach(([ty, dt, x]) => { const o = osc(c, ty, f, dt), m = c.createGain(); m.gain.value = ty === 'square' ? .5 : 1; o.connect(m); m.connect(panne(c, x, fl)); o.start(0); }); }];
    if (inst === 'cordes') return [3.4, 24000, (c, f, dest) => { const g = envG(c, .6, 2.6, .7, .16, dest), fl = c.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = 2600; fl.connect(g);
      [[-12, -.7], [0, 0], [12, .7]].forEach(([dt, x]) => { const o = osc(c, 'sawtooth', f, dt); o.connect(panne(c, x, fl)); o.start(0); }); }];
    if (inst === 'choeur') return [3.4, 24000, (c, f, dest) => { const g = envG(c, Tm.chAtt || .55, 2.6, .7, .5, dest), som = c.createGain();
      ({ oh: [[420, 1, 6], [820, .45, 7], [2600, .06, 6]], ah: [[780, 1, 6], [1150, .5, 7], [2800, .08, 6]], ou: [[320, 1, 7], [720, .4, 8], [2600, .05, 6]] })[Tm.voyC || 'oh'].forEach(([fr, v, q]) => { const bp = c.createBiquadFilter(), m = c.createGain(); bp.type = 'bandpass'; bp.frequency.value = fr; bp.Q.value = q; m.gain.value = v; som.connect(bp); bp.connect(m); m.connect(g); });
      [[-7, -.6], [7, .6]].forEach(([dt, x]) => { const o = osc(c, 'sawtooth', f, dt); o.connect(panne(c, x, som)); o.start(0); }); }];
    if (inst === 'cuivres') return [.9, 44100, (c, f, dest) => { const g = c.createGain(), fl = c.createBiquadFilter(); fl.type = 'lowpass'; fl.Q.value = 1.2; fl.frequency.setValueAtTime(800, 0); fl.frequency.exponentialRampToValueAtTime(2800, .05); fl.frequency.exponentialRampToValueAtTime(1500, .4);
      g.gain.setValueAtTime(.0001, 0); g.gain.exponentialRampToValueAtTime(.4, .03); g.gain.setValueAtTime(.4, .45); g.gain.exponentialRampToValueAtTime(.0001, .85); fl.connect(g); g.connect(dest);
      [[-6, -.4], [6, .4]].forEach(([dt, x]) => { const o = osc(c, 'sawtooth', f, dt); o.connect(panne(c, x, fl)); o.start(0); }); }];
    return null;
  }
  const notesAcc = (inst, A, Mx) => { const up = Mx ? Mx.up : 12; return inst === 'cordes' ? A.v.slice(1).map(m => m + up) : inst === 'stab' ? A.v.map(m => m + up) : inst === 'cuivres' ? A.v.slice(1) : A.v; };
  const BESOIN = { kick: ['s:kick'], snare: ['s:snare'], fant: ['s:snare'], hat: ['s:hat'], roll: ['s:hat'], hatO: ['s:hatO'], tribu: ['s:tomH', 's:tomL'], foule: ['v:foule', 's:hey'], perc: ['s:shaker', 's:percH', 's:percL'], ride: ['s:ride'],
    toms: ['s:tomH', 's:tomL'], vinyl: ['s:vinyl'], basse: ['v:basse'], basse2: ['v:basse'], sub: ['v:sub'], lead: ['v:lead', 'v:pluck', 'v:cloche'], octave: ['v:lead'], harmo: ['v:lead'],
    contre: ['v:contre'], arp: ['v:pluck'], cloche: ['v:cloche'], pad: ['a:pad'], keys: ['a:keys'], stab: ['a:stab'], cordes: ['a:cordes'], choeur: ['a:choeur'], cuivres: ['a:cuivres'],
    _base: ['s:crash', 's:impact', 's:riser', 's:snare', 's:hat', 's:tomH', 's:tomL', 's:percH', 's:percL', 'v:pluck', 'v:b808'] };
  function inverse(x) { const y = new AudioBuffer({ length: x.length, numberOfChannels: x.numberOfChannels, sampleRate: x.sampleRate });
    for (let c = 0; c < x.numberOfChannels; c++) y.copyToChannel(x.getChannelData(c).slice().reverse(), c); return y; }
  async function fabriqueBanque(Mx) {
    const t0 = performance.now(), b = { sons: {}, voix: {}, acc: {}, rates: 0 }, fait = new Set();
    const sur = f => () => Promise.resolve().then(f).catch(() => { b.rates++; });   // un son qui ne se fabrique pas est SAUTÉ
    const jobs = id => (id === 'sig' ? SIG[Mx.sig].besoin : id === 'sig2' ? SIG[Mx.sig2].besoin : BESOIN[id] || []).flatMap(cle => {
      if (fait.has(cle)) return []; fait.add(cle); const [k, nom] = cle.split(':');
      if (k === 's' && Mx.kitV && Mx.kitV[nom]) { b.sons[nom] = []; const kv = Mx.kitV[nom];   // le kit réel
        return [() => vraisIndex().then(I => Promise.all(kv.map(x => I[x] && I[x].notes[0] ? vraiBuf(ctx, I[x].notes[0][1], false).then(buf => { Mx.vraisF.push(I[x].notes[0][1]); return buf; }) : null)))
          .then(L => { L = L.filter(Boolean); b.sons[nom] = L; if (nom === 'crash' && L[0]) b.sons.revcrash = [inverse(L[0])]; })]; }
      if (k === 's') { const [dur, fn, nb] = SONS[nom](Mx.kit); b.sons[nom] = [];
        return Array.from({ length: nb }, () => () => rend(dur, fn, 44100, nom === 'vinyl' ? .4 : .8).then(x => { b.sons[nom].push(x); if (nom === 'crash') b.sons.revcrash = [inverse(x)]; })); }
      if (k === 'v') { const V = voixDe(nom, Mx.tim); b.voix[nom] = [];
        if (V && V.vrai) return [async () => { const L = await vraiNotes(ctx, V.vrai); Mx.vraisF.push(...L.map(r => r.f)); const out = [];   // un vrai instrument (et sa retouche)
          for (const r of L) out.push({ m: r.m, buf: Mx.retouche ? await rend(r.buf.duration, c => { const s9 = c.createBufferSource(); s9.buffer = r.buf; s9.connect(retoucheChaine(c, Mx.retouche)); s9.start(0); }, 44100, .8, r.buf.numberOfChannels) : r.buf });
          b.voix[nom] = out; }];
        const range = x => { b.voix[nom].push(x); b.voix[nom].sort((p, q) => p.m - q.m); };
        if (V.ks) return V.refs.map(m => () => Promise.resolve().then(() => range({ m, buf: V.sat ? ampli(ks([m], V.dur, V.eclat)) : ks([m], V.dur, V.eclat || Mx.tim.ksEclat) })));
        const [dur, refs, fab, ch] = V; return refs.map(m => () => rend(dur, c => fab(c, mtof(m)), 44100, .8, ch).then(x => range({ m, buf: x }))); }
      const D = accordDe(nom, Mx.tim); b.acc[nom] = {};
      if (D && D.vrai) return [async () => { const sets = await Promise.all(D.vrai.map(x => vraiNotes(ctx, x))); sets.forEach(L => Mx.vraisF.push(...L.map(r => r.f)));   // l'accord joué par de vrais instruments
        const pres = (L, m) => { let r = L[0]; for (const q of L) if (Math.abs(q.m - m) < Math.abs(r.m - m)) r = q; return r; };
        for (const A of Mx.accords) b.acc[nom][A.cle] = await rend(D.dur, c => { const ent = retoucheChaine(c, Mx.retouche); notesAcc(nom, A, Mx).forEach((m, j) => { const L = sets.length > 1 && D.split ? (m < D.split ? sets[0] : sets[1]) : sets[0];
          if (!L || !L.length) return; const r = pres(L, m), s9 = c.createBufferSource(); s9.buffer = r.buf; s9.playbackRate.value = Math.pow(2, (m - r.m) / 12); s9.connect(ent); s9.start(j * D.strum); }); }, 44100, .7, 2); }];
      if (D === 'ksClair') return Mx.accords.map(A => () => Promise.resolve().then(() => { b.acc[nom][A.cle] = ks(A.v, 1.4, .5); }));   // la guitare grattée, claire
      if (D === 'ksSat') return Mx.accords.map(A => () => Promise.resolve().then(() => { b.acc[nom][A.cle] = ampli(ks(A.v, 1.6, .6)); }));
      if (D === 'ks') return Mx.accords.map(A => () => Promise.resolve().then(() => { b.acc[nom][A.cle] = ks(A.v.map(m => m + 12), 2.2, Mx.tim.ksEclat); }));
      const [dur, sr, fab] = D;
      return Mx.accords.map(A => () => rend(dur, c => notesAcc(nom, A, Mx).forEach(m => fab(c, mtof(m), OUT(c))), sr, .7, 2).then(x => { b.acc[nom][A.cle] = x; }));
    });
    await Promise.all(Mx.ordre.slice(0, 3).flatMap(jobs).map(f => sur(f)()));
    b.ms = Math.round(performance.now() - t0);
    const reste = ['_base', ...Mx.ordre.slice(3)].flatMap(jobs);
    b.suite = (async () => { for (let k = 0; k < reste.length; k += 6) await Promise.all(reste.slice(k, k + 6).map(f => sur(f)())); b.suiteMs = Math.round(performance.now() - t0); })();
    return b;
  }

  // ================================================================ LA CHAÎNE : bus (coupe-bas, panoramique, pompe) → coupe-bas maître (le VOL) →
  // clarté → saturation douce → colle → limiteur. La réverbe revient APRÈS le coupe-bas (en vol, elle reste entière : on flotte).
  let ctx = audioContext, sortie = destination;
  let master, hpM, clair, sat, comp, lim, revIn, revOut, dIn, dlyL, dlyR, pompeBus, bus = {}, sol = {}, gIn = {}, chaineOk = false;
  let rHpG = null, revC = null, revCle = '', dFb = null; const IRS = {};
  function ir(sec, br) { br = br || 1; const n = Math.floor(ctx.sampleRate * sec), b = ctx.createBuffer(2, n, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); let y = 0; for (let i = 0; i < n; i++) { const t = i / ctx.sampleRate, a = Math.exp(-2 * Math.PI * Math.min(16000, (1400 + 5000 * Math.exp(-t / .4)) * br) / ctx.sampleRate);
      y = (1 - a) * (R() * 2 - 1) + a * y; d[i] = y * Math.exp(-6.9 * t / sec) * (t < .012 ? 0 : 1); } } return b; }
  function chaine() {
    master = ctx.createGain(); master.gain.value = .62 * volume;
    hpM = ctx.createBiquadFilter(); hpM.type = 'highpass'; hpM.frequency.value = 20; hpM.Q.value = .7;
    clair = ctx.createBiquadFilter(); clair.type = 'lowpass'; clair.frequency.value = 5000; clair.Q.value = .6;
    sat = ctx.createWaveShaper(); sat.curve = courbe(1.25); sat.oversample = '2x';
    comp = ctx.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 2.2; comp.attack.value = .015; comp.release.value = .2;
    lim = ctx.createDynamicsCompressor(); lim.threshold.value = -3.5; lim.ratio.value = 20; lim.attack.value = .002; lim.release.value = .1; lim.knee.value = 0;
    master.connect(hpM); hpM.connect(clair); clair.connect(sat); sat.connect(comp); comp.connect(lim); lim.connect(sortie || ctx.destination);
    revIn = ctx.createGain(); revOut = ctx.createGain(); revOut.gain.value = .34;   // (la salle elle-même : salleMet, à chaque musique)
    const rHp = ctx.createBiquadFilter(); rHp.type = 'highpass'; rHp.frequency.value = 260; rHpG = rHp; rHp.connect(revOut); revOut.connect(clair);
    dIn = ctx.createGain(); dlyL = ctx.createDelay(2); dlyR = ctx.createDelay(2); const fbL = ctx.createGain(), fbR = ctx.createGain(), dLp = ctx.createBiquadFilter(), mg = ctx.createChannelMerger(2), dOut = ctx.createGain();
    dLp.type = 'lowpass'; dLp.frequency.value = 3400; fbL.gain.value = fbR.gain.value = .34; dOut.gain.value = .3; dFb = [fbL, fbR];
    dIn.connect(dLp); dLp.connect(dlyL); dlyL.connect(fbL); fbL.connect(dlyR); dlyR.connect(fbR); fbR.connect(dlyL);   // le ping-pong
    dlyL.connect(mg, 0, 0); dlyR.connect(mg, 0, 1); mg.connect(dOut); dOut.connect(master); const dr = ctx.createGain(); dr.gain.value = .25; dOut.connect(dr); dr.connect(revIn);
    pompeBus = ctx.createGain(); pompeBus.connect(master);
    for (const id of Object.keys(VOL)) {
      const g = ctx.createGain(); g.gain.value = id === 'fx' ? VOL.fx : 0; let o = g;
      if (GROOVE.has(id)) { const s = ctx.createGain(); g.connect(s); o = s; sol[id] = s; }                       // le VOL coupe ici
      if (HP[id]) { const h = ctx.createBiquadFilter(); h.type = 'highpass'; h.frequency.value = HP[id]; h.Q.value = .6; o.connect(h); o = h; }
      if (PAN[id]) { const p = ctx.createStereoPanner(); p.pan.value = PAN[id]; o.connect(p); o = p; }
      o.connect(POMPE.includes(id) ? pompeBus : master);
      if (REV[id]) { const s = ctx.createGain(); s.gain.value = REV[id]; o.connect(s); s.connect(revIn); }
      bus[id] = g; }
    ['lead', 'arp', 'cloche', 'contre'].forEach(id => { const s = ctx.createGain(); s.gain.value = 0; bus[id].connect(s); s.connect(dIn); gIn[id] = s; });
    chaineOk = true;
  }

  // ================================================================ JOUER (une source + un gain ; la main : un peu de retard, un peu de force)
  let M = null, banque = null, suivant = null, prepa = null, demande = null;
  let BPM = 110, SD = 60 / BPM / 4, MES = 16 * SD, MOD = 0;
  let playing = false, timer = 0, step = 0, nextTime = 0, tier = 1, cible = 1, activation = -1, grand = false, grille = [], meloPas = {}, guides = [], last808 = null, vinylSrc = null;
  const VERIF = { on: false, n: 0, hors: 0, ex: [] }; let RENOUV = renouvelle;
  const rampeE = () => clamp((tier - 14) / 16, 0, 1), gainBase = () => .62 * volume * (1 + .25 * rampeE());   // LA RAMPE du 15 au 30 (v3.4)
  const VOIX_MAX = 64, TEXTURES = new Set(['tribu', 'hat', 'roll', 'fant', 'perc', 'ride', 'arp', 'octave', 'harmo', 'hatO', 'cloche']);
  let actives = 0, sautes = 0, picVoix = 0, erreurs = 0, derniere = '';
  const texture = dest => { for (const id of TEXTURES) if (bus[id] === dest) return true; return false; };
  const libre = dest => { if (actives >= VOIX_MAX && texture(dest)) { sautes++; return false; } return true; };
  const suit = s => { actives++; if (actives > picVoix) picVoix = actives; s.onended = () => { actives--; }; };
  function son(nom, t, v, dest, dur, buf, rate) { let b = buf || (banque && banque.sons[nom]); if (Array.isArray(b)) b = b.length ? b[Math.floor(R() * b.length)] : null;
    if (!b || !dest || !libre(dest)) return; const s = ctx.createBufferSource(), g = ctx.createGain(); s.buffer = b; suit(s);
    const bd = b.duration / (rate || 1); if (rate) s.playbackRate.value = rate;
    g.gain.setValueAtTime(v, t); const fin = dur ? Math.min(dur, bd) : bd;
    if (dur && dur < bd) { g.gain.setValueAtTime(v, t + Math.max(.02, fin - .08)); g.gain.linearRampToValueAtTime(0, t + fin); }
    s.connect(g); g.connect(dest); s.start(t); s.stop(t + fin + .02); }
  function sonFin(nom, tFin, dur, v, dest) {   // la FIN d'un son, calée pour finir pile sur tFin (la cymbale à l'envers aspire vers le 1er temps)
    let b = banque && banque.sons[nom]; b = Array.isArray(b) ? b[0] : b; if (!b) return; const d = Math.min(dur, b.duration), s = ctx.createBufferSource(), g = ctx.createGain();
    s.buffer = b; g.gain.value = v; s.connect(g); g.connect(dest); suit(s); s.start(Math.max(ctx.currentTime, tFin - d), b.duration - d); s.stop(tFin + .02); }
  const accordJoue = (inst, A, t, dur, v, dest) => { const tab = banque.acc[inst], buf = tab && tab[A.cle]; if (buf) son(inst, t, v * (.92 + R() * .16), dest, dur, buf, MOD ? Math.pow(2, MOD / 12) : 0); };
  function note(inst, m, t, dur, v, dest, glisse, A, gdur) {
    if (!isFinite(m)) return;
    if (M && M.cap && dest !== bus.basse && dest !== bus.basse2 && dest !== bus.sub) while (m + MOD > M.cap) { m -= 12; if (glisse != null) glisse -= 12; }   // L'AIGU SE REPOSE : même note, une octave plus bas
    if (VERIF.on && A) { VERIF.n++; if (!A.gamme.includes(pc(m))) { VERIF.hors++; if (VERIF.ex.length < 20) VERIF.ex.push(inst + ' ' + m + ' sur ' + A.nom); } }
    m += MOD; if (glisse != null) glisse += MOD;
    const refs = banque.voix[inst]; if (!refs || !refs.length || !libre(dest)) return; let ref = refs[0]; for (const r of refs) if (Math.abs(r.m - m) < Math.abs(ref.m - m)) ref = r;
    const s = ctx.createBufferSource(), g = ctx.createGain(), rate = Math.pow(2, (m - ref.m) / 12); s.buffer = ref.buf;
    if (glisse != null && glisse !== m) { s.playbackRate.setValueAtTime(Math.pow(2, (glisse - ref.m) / 12), t); s.playbackRate.exponentialRampToValueAtTime(rate, t + (gdur || .09)); } else s.playbackRate.value = rate;
    const fin = Math.min(dur, ref.buf.duration / rate - .02); if (fin <= .01) return; suit(s); v *= .92 + R() * .16;
    g.gain.setValueAtTime(v, t); g.gain.setValueAtTime(v, t + Math.max(.02, fin - .06)); g.gain.linearRampToValueAtTime(0, t + fin);
    s.connect(g); g.connect(dest); s.start(t); s.stop(t + fin + .02);
  }

  // ================================================================ LA FORME (A · A′ · B · C), LA MÉLODIE et LE CONTRE-CHANT
  function grilleDe(sec) { return JEU.fren ? M.grilleF : M.grilles[(sec === 'B' || sec === 'B2' ? 1 : sec === 'C' ? 2 : 0) % M.grilles.length]; }
  function nouvellePhrase() {
    const sec = M.forme[M.phr % 4]; M.phr++; M.sec = sec; grille = grilleDe(sec);
    if (sec === 'A' && M.phr > 1 && R() < .5) M.motifs[1] = phrase(R, M.C.cells, M.phFB);   // la partie B se renouvelle en route
    for (const k of ['kick', 'hat', 'basse', 'keys', 'perc', 'tribu']) { const L = M.patL[k]; if (Array.isArray(L) && L.length > 1 && R() < .3) M.pat[k] = rp(L); }
    M.resp = sec === 'C' && tier >= 10 && !M.C.balaye && R() < (M.C.respP || .6);
    M.repos = tier >= 8 ? (sec === 'B' ? new Set(['arp', 'cloche', 'hatO']) : sec === 'A2' && R() < .5 ? new Set(['arp']) : null) : null;   // l'aigu se repose dans le couplet
    M.balaye = sec === 'C' && M.C.balaye && tier >= 8 && R() < .7;
    M.trim = sec === 'B' ? { basse: -2.5, hat: -4, hatO: -6, ride: -6, kick: -1.5, perc: -3, snare: -1.5 } : {};   // le couplet respire (mesuré sur ses inspirations) ; B2 repart à pleine force
    M.choc = sec === 'C' && !M.resp;
    M.voixMel = sec === 'B' || sec === 'B2' ? M.voixB : 'lead';
    poseMelodie(sec);
  }
  // LA MÉLODIE de la phrase, posée sur la grille EN COURS (rappelée quand la frénésie bascule au milieu d'une phrase : sinon la mélodie
  // calculée pour les accords sombres restait sur les accords revenus — un si♭ sur un la mineur, vu au banc d'endurance)
  function poseMelodie(sec) {
    // A : le thème · A′ : le thème, la réponse un cran plus haut · B : son motif à elle · C : la question du thème, la réponse d'une 3e phrase
    const th = M.motifs[0], ph = sec === 'B' ? M.motifs[1] : sec === 'B2' ? M.motifs[1].map(([st, d, l, r]) => st >= 80 && !r ? [st, clamp(d + 2, -2, 5), l, r] : [st, d, l, r]) : sec === 'A2' ? th.map(([st, d, l, r]) => st >= 96 && !r ? [st, clamp(d + 1, -2, 5), l, r] : [st, d, l, r])
      : sec === 'C' ? th.filter(x => x[0] < 64).concat(M.motifs[2].filter(x => x[0] >= 64)) : th;
    const c0 = M.C.reg + (sec === 'B' || sec === 'B2' ? 2 : 0); meloPas = {}; let prev = c0;
    ph.forEach(([st, deg, len, role]) => { const bar = Math.floor(st / 16), A = grille[bar % 4], fort = st % 4 === 0;
      const ok = role === 'f' ? [A.r] : role === 'o' ? A.pcs.filter(p => p !== A.r) : fort ? A.pcs : A.gamme;
      const visee = c0 + deg * 2; let best = null, bs = 1e9;
      for (let m = c0 - 7; m <= c0 + 12; m++) { if (!ok.includes(pc(m))) continue; const sc = Math.abs(m - visee) + Math.abs(m - prev) * .35 + (Math.abs(m - prev) > 7 ? 3 : 0); if (sc < bs) { bs = sc; best = m; } }
      if (best == null) return; prev = best; (meloPas[st] = meloPas[st] || []).push([best, Math.min(len, 16 - st % 16), bar, role]); });
    calculeGuides();
  }
  function calculeGuides() {   // LE CONTRE-CHANT : les notes-guides (tierce, septième) de chaque accord, menées au plus court, entre mi4 et fa5
    guides = []; let g0 = 70;
    for (let b = 0; b < 8; b++) { const A = grille[b % 4]; let best = g0, bs = 1e9; for (let m = 64; m <= 77; m++) if (A.guides.includes(pc(m)) && Math.abs(m - g0) < bs) { bs = Math.abs(m - g0); best = m; } guides.push(best); g0 = best; }
  }
  function regleElements(t) {
    if (!M) return;
    const a = id => M.rang[id] > 0 && tier >= M.rang[id], frappe = a('i_frappe') ? { kick: 1.6, snare: 2.2, hat: 1.5, fant: 1.5 } : {};   // dB
    const E = rampeE(); frappe.hat = (frappe.hat || 0) + .5 * E; frappe.snare = (frappe.snare || 0) + 1.2 * E; frappe.kick = (frappe.kick || 0) + 1.4 * E; frappe.fant = (frappe.fant || 0) + 1 * E;
    frappe.basse = (frappe.basse || 0) + 1 * E + (M.C.basseDb || 0); frappe.sub = (frappe.sub || 0) + (M.C.basseDb || 0);   // la rampe pousse le GRAVE
    const gb = gainBase(); if (!JEU.crashEnCours && Math.abs(gb - (M._gb || 0)) > 1e-4) { M._gb = gb; master.gain.setTargetAtTime(gb, t + .01, .4); }
    const W9 = M.W || {}, cl = W9.clarte > 0 ? 40 * Math.log10(W9.clarte) : 0, bd = +W9.basse_db || 0;   // les goûts mesurés : le haut plus discret, la basse plus lourde
    for (const id of ['hat', 'hatO', 'ride', 'roll']) frappe[id] = (frappe[id] || 0) + cl; for (const id of ['basse', 'sub', 'basse2']) frappe[id] = (frappe[id] || 0) + bd;
    for (const id in VOL) { if (id === 'fx') continue; const g = bus[id].gain, on = a(id) || (id === 'basse2' && (a('i_basse') || a('i_basseOct'))), tr9 = ((M.trim && M.trim[id]) || 0) + (frappe[id] || 0);
      g.cancelScheduledValues(t); g.setTargetAtTime(on ? VOL[id] * Math.pow(10, tr9 / 20) : 0, t, on ? SD : .08); }
    if (!(JEU.volPas >= 0)) { revOut.gain.cancelScheduledValues(t); revOut.gain.setTargetAtTime((M.C.revB || .34) + (a('i_large') || a('i_sature') ? .1 : 0), t, .6); }
    const dur9 = +((M.C.sat || 1.25) + (a('i_sature') ? .65 : 0) + .45 * E).toFixed(2); if (sat._k !== dur9) { sat.curve = courbe(dur9); sat._k = dur9; }
    clairRegle(t);
    const e = a('lead') || a('echo') ? .6 + .4 * E : 0; for (const id in gIn) gIn[id].gain.setTargetAtTime(e * (id === 'lead' ? .4 : .22), t, .3);
    if (!(M.rang.modul > 0 && tier >= M.rang.modul)) MOD = 0;
    const vOn = M.rang.vinyl > 0 && tier >= M.rang.vinyl, vb = banque.sons.vinyl && banque.sons.vinyl[0];
    if (vOn && !vinylSrc && vb) { vinylSrc = ctx.createBufferSource(); vinylSrc.buffer = vb; vinylSrc.loop = true; vinylSrc.connect(bus.vinyl); vinylSrc.start(t); }
  }
  const clairOuvert = () => (M.rang.clarte > 0 && tier >= M.rang.clarte) || JEU.nitro || JEU.fren;
  const clairCible = () => clairOuvert() ? 16000 * Math.pow(Math.min(1, (M.W && M.W.clarte) || 1), 4.5) : M.rang.i_filtre > 0 && tier >= M.rang.i_filtre ? M.C.ferme * 1.9 : M.C.ferme;   // i_filtre : le son s'ouvre un peu
  function clairRegle(t, tau) { if (M.balaye) return; clair.frequency.cancelScheduledValues(t); clair.frequency.setTargetAtTime(clairCible(), t, tau || .5); }
  function vinylStop() { if (vinylSrc) { try { vinylSrc.stop(); } catch (e) {} vinylSrc = null; } }

  // ================================================================ L'ÉTAT DU JEU (la philosophie d'intensité)
  const JEU = { nitro: false, vol: false, flow: .5, fren: false, frenDemande: null, volPas: -1, posePas: -1, poseGrade: null, nitroDepuis: 0, crashNitro: false };
  function regle(e) {
    if (!e) return; const now = ctx ? ctx.currentTime : 0;
    if (e.flow != null) JEU.flow = clamp(+e.flow || 0, 0, 1);
    if (e.nitro != null && !!e.nitro !== JEU.nitro) { JEU.nitro = !!e.nitro;
      if (ctx && M && playing) { if (JEU.nitro) { JEU.nitroDepuis = now; clairRegle(now, .08); son('riser', now + .02, .45, bus.fx, MES * 2, null, 2.4 / (MES * 2)); }
        else { clairRegle(now, .4); if (now - JEU.nitroDepuis > 1) JEU.crashNitro = true; } } }
    if (e.vol != null && !!e.vol !== JEU.vol) { JEU.vol = !!e.vol;
      if (JEU.vol) { JEU.volPas = step + (step % 2); JEU.posePas = -1;
        if (ctx && M && playing) { for (const id in sol) { sol[id].gain.cancelScheduledValues(now); sol[id].gain.setTargetAtTime(.04, now, .03); }   // tout de suite (pas après l'avance de l'horloge)
          hpM.frequency.cancelScheduledValues(now); hpM.frequency.setTargetAtTime(420, now, .25); revOut.gain.cancelScheduledValues(now); revOut.gain.setTargetAtTime((M.C.revB || .34) + .26, now, .4); } } else if (JEU.volPas >= 0) { JEU.posePas = Math.ceil(step / 4) * 4; if (JEU.posePas - step < 1) JEU.posePas += 4; } }
    if (e.frenesie != null && !!e.frenesie !== JEU.fren) JEU.frenDemande = !!e.frenesie;
  }
  function evenement(nom, x) {
    if (!ctx || !M || !playing) return; const t = ctx.currentTime + .02;
    if (nom === 'pose') { JEU.poseGrade = x || 'normal'; if (JEU.vol) { regle({ vol: false }); return; } son('impact', t, x === 'lourd' ? .7 : .4, bus.fx); if (x === 'parfait' || x === 'divin') { son('crash', t, .5, bus.fx, 2); gerbe(t); } }
    if (nom === 'crash') { JEU.crashEnCours = true; const g = master.gain; g.cancelScheduledValues(t); g.setTargetAtTime(0, t + .05, .25);
      clair.frequency.cancelScheduledValues(t); clair.frequency.setValueAtTime(Math.max(200, clair.frequency.value), t); clair.frequency.exponentialRampToValueAtTime(180, t + .6); son('impact', t, 1, bus.fx);
      setTimeout(() => { api.stop(); JEU.crashEnCours = false; if (master) master.gain.setTargetAtTime(gainBase(), ctx.currentTime + .3, .05); }, 1400); }
  }
  function gerbe(t) { const A = grille[0]; if (!A) return; const ns = A.v.concat(A.v.map(m => m + 12)); ns.forEach((m, k) => note('pluck', m + 12, t + k * SD / 2, SD * 1.2, .55, bus.fx, null, A)); }

  // ================================================================ LES TRANSITIONS — un RÉPERTOIRE (v3.1 : « l'effet de transition est un peu répétitif »)
  // tiré selon la couleur (C.trans), jamais les deux derniers ; une marche d'intensité appelle une transition plus légère ; avant la batterie,
  // pas de trou. k = 0 … 3 : les quatre doubles croches avant le 1er temps (tAct).
  function choisitTrans(leger) {
    const W9 = Object.assign({}, M.C.trans), a = id => M.rang[id] > 0 && tier >= M.rang[id];
    if (leger) { W9.rien = (W9.rien || 1) * 2; W9.filtre = (W9.filtre || .5) + 1; W9.souffle = (W9.souffle || .5) + .5; }
    if (!a('kick')) { W9.trou = 0; if (W9.toms) W9.toms *= .3; if (W9.hats) W9.hats *= .5; }
    if (!a('basse')) W9.glisse = 0;
    M.transDer.forEach(x => { if (x !== 'rien') W9[x] = 0; }); if (M.transDer[0] === 'rien' && M.transDer[1] === 'rien') W9.rien = 0;
    const ks = Object.keys(W9).filter(k => W9[k] > 0); let r = R() * ks.reduce((p, k) => p + W9[k], 0), ch = ks[ks.length - 1] || 'rien';
    for (const k of ks) { r -= W9[k]; if (r <= 0) { ch = k; break; } }
    M.transDer.unshift(ch); M.transDer.length = Math.min(M.transDer.length, 2); (M.journal = M.journal || []).push(ch); if (M.journal.length > 40) M.journal.shift(); return ch;
  }
  function trou(t, tAct) { const g = master.gain, v = gainBase(); g.cancelScheduledValues(t); g.setValueAtTime(v, t); g.linearRampToValueAtTime(v * .08, t + .03); g.setValueAtTime(v * .08, tAct - .012); g.linearRampToValueAtTime(v, tAct + .004); }
  function execFill(f, k, t, B, tAct) {
    if (f === 'rien') return;
    if (f === 'roll') { son('snare', t, .2 + .14 * k, bus.fx); son('snare', t + SD / 2, .16 + .14 * k, bus.fx); }
    else if (f === 'toms') son(k < 2 ? 'tomH' : 'tomL', t, .65 + .1 * k, bus.fx);
    else if (f === 'hats') { son('hat', t, .3 + .15 * k, bus.fx); son('hat', t + SD / 2, .25 + .15 * k, bus.fx); if (k === 3) son('hat', t + SD * .75, .5, bus.fx); }
    else if (f === 'run') note('pluck', B.v[Math.min(k, B.v.length - 1)] + 12, t, SD * 1.5, .6, bus.fx, null, B);
    else if (f === 'souffle') { if (k === 0) sonFin('revcrash', tAct, 4 * SD, .55, bus.fx); }                                     // la cymbale à l'envers
    else if (f === 'trou') { if (k === 2) trou(t, tAct); }                                                                          // un trou d'une croche, puis tout retombe
    else if (f === 'filtre') { if (k === 0 && !M.balaye) { clair.frequency.cancelScheduledValues(t); clair.frequency.setTargetAtTime(520, t, SD * .9); clair.frequency.setTargetAtTime(clairCible(), tAct, .03); } }
    else if (f === 'glisse') { if (k === 2) { const m = est808(M.tim.basse) ? (B.basse - 12 < 30 ? B.basse : B.basse - 12) : B.basse; note('basse', m, t, SD * 2.2, .8, bus.fx, m - 7, B); } }   // la basse glisse vers l'accord
    else if (f === 'begaie') { const ns = B.v.concat(B.v.map(x => x + 12)); for (let j = 0; j < 2; j++) { note('pluck', ns[(k * 2 + j) % ns.length] + 12, t + j * SD / 2, SD * .45, .5 + .1 * k, bus.fx, null, B); son('hat', t + j * SD / 2, .4, bus.fx); } }
  }
  function arrivee(t, ancien) {
    if (M.ordre.slice(ancien, tier).includes('modul')) MOD = M.modul;
    if (tier <= ancien) return;
    if (grand) { son('crash', t, .7, bus.fx, 2.2); if (M.build !== 'filtre') son('impact', t, .7, bus.fx); else clairRegle(t, .03); return; }
    if (M.trans === 'filtre') clairRegle(t, .03);
    const a9 = rp(['rien', 'rien', 'rien', 'impact', 'cymbale'].filter(x => x === 'rien' || x !== M.arrDer)); M.arrDer = a9;   // plus de coup sourd à chaque moteur
    if (a9 === 'impact') son('impact', t, .22, bus.fx); else if (a9 === 'cymbale') son('crash', t, .22, bus.fx, 1.6);
  }

  // ================================================================ UNE DOUBLE CROCHE
  const vel = (pat, bar, i) => { const c = pat[((bar % (pat.length / 16)) | 0) * 16 + i]; return c === 'X' ? 1 : c === 'x' ? .75 : c === 'o' ? .4 : c === 'H' || c === 'L' ? 1 : 0; };
  function arpNote(mode, A, i) { const ns = A.v.concat(A.v.map(m => m + 12)), n = ns.length;
    if (mode === 'up16') return ns[i % n];
    if (mode === 'up8') return i % 2 ? null : ns[(i >> 1) % n];
    if (mode === 'rand8') return i % 2 ? null : ns[Math.floor(R() * n)];
    return i < 8 ? ns[i % n] : ns[n - 1 - (i % n)]; }
  // LA SIGNATURE, jouée (toujours sur les notes de l'accord : fondamentale, quinte, octave, tierce)
  const revPad = {};
  function signature(k, dest, s, i, b8, t, tt, A, B, fl) {
    const r0 = A.basse, ph = b8 === 0 || b8 === 4;   // la fondamentale (ré2 → do#3) ; les débuts de demi-phrase
    if (k === 'moteur') { if (ph && i === 0) note('moteur', r0, t, SD * 3, .85, dest, r0 - 7, A, SD * 2.5);   // vroum : il monte sur la fondamentale…
      if (ph && i === 4) note('moteur', r0 + 7, t, SD * 1.8, .8, dest, r0, A, SD * .6);                      // … la quinte…
      if (ph && i === 6) note('moteur', r0 + 12, t, SD * 2, .8, dest, r0 + 7, A, SD * .5); }                // … l'octave
    else if (k === 'turbo') { if (b8 % 2 === 1 && i === 14) { const m = r0 + 48 > 98 ? r0 + 36 : r0 + 48; son('turbo', t, .7, dest); note('siffle', m, t + SD * .5, SD * 2, .5, dest, m - 5, A, SD * 1.2); } }
    else if (k === 'caisse') { if (b8 % 4 === 0 && i === 0) { son('ka', t, .6, dest); note('ching', 72 + pc(A.r), t + .05, 1.5, .7, dest, null, A); }   // ka-ching sur la tonique, toutes les 4 mesures…
      else if (b8 % 2 === 1 && i === 12 && R() < .55 + fl * .3) note('ching', 72 + pc(A.v[A.v.length - 1]), t, 1, .45, dest, null, A); }                  // … et un petit « ching » sur le dernier temps
    else if (k === 'pieces') { if (i % 4 === 2 && R() < .3 + fl * .35) note('piece', A.v[Math.floor(R() * A.v.length)] + 24, tt, .45, .55 + R() * .25, dest, null, A);
      if (b8 === 7 && i >= 12) { const ns = A.v.slice().reverse(); for (let j = 0; j < 2; j++) note('piece', ns[((i - 12) * 2 + j) % ns.length] + 24, t + j * SD / 2, .4, .6, dest, null, A); } }
    else if (k === 'neon') { if (b8 % 2 === 0 && i === 0) note('neon', r0 + 12, t, MES * 1.5, .7, dest, null, A); if (R() < .04) son('hat', t + R() * SD, .12, dest); }
    else if (k === 'klaxon') { if ((b8 === 3 || b8 === 7) && (i === 12 || i === 14)) { const v = i === 12 ? .42 : .55, d9 = SD * (i === 12 ? 1.2 : 1.8);
      note('klaxon', r0 + 24, t, d9, v, dest, null, A); note('klaxon', r0 + 24 + A.tierce, t, d9, v * .8, dest, null, A); } }
    else if (k === 'gouttes') { if (R() < .06 + fl * .08) note('pluck', A.v[Math.floor(R() * A.v.length)] + 24, tt + R() * SD * .3, SD * 3, .45 + R() * .2, dest, null, A); }
    else if (k === 'vapeur') { if (b8 % 2 === 1 && i === 0) { const src = banque.acc.pad && banque.acc.pad[B.cle]; if (src) { const rv = revPad[B.cle] || (revPad[B.cle] = inverse(src));
      const sv = ctx.createBufferSource(), g = ctx.createGain(), d = Math.min(MES * .95, rv.duration); sv.buffer = rv; g.gain.value = .5; sv.connect(g); g.connect(dest); suit(sv); sv.start(t + MES - d, rv.duration - d); sv.stop(t + MES + .02); } } }
    else if (k === 'drift') { if (b8 % 2 === 1 && i === 8) { const m = r0 + 31; note('crisse', m, t, SD * 7, .42 + fl * .2, dest, m - 1, A, SD * 2); } }   // les pneus qui crissent, sur la quinte, en glissade
    else if (k === 'sirene') { if (b8 === 4 && i === 0) { const refs = banque.voix.sirene; if (refs && refs.length) { const ref = refs[0], m1 = r0 + 31, m2 = r0 + 36, sv = ctx.createBufferSource(), g = ctx.createGain();   // la quinte ↔ l'octave
      sv.buffer = ref.buf; const rt = m => Math.pow(2, (m + MOD - ref.m) / 12); sv.playbackRate.setValueAtTime(rt(m1), t); for (let j = 1; j <= 4; j++) sv.playbackRate.linearRampToValueAtTime(rt(j % 2 ? m2 : m1), t + j * MES / 4);
      g.gain.setValueAtTime(.35, t); g.gain.linearRampToValueAtTime(0, t + MES); sv.connect(g); g.connect(dest); suit(sv); sv.start(t); sv.stop(t + MES + .02);
      if (VERIF.on) { VERIF.n += 2; if (!A.gamme.includes(pc(m1)) || !A.gamme.includes(pc(m2))) VERIF.hors++; } } } }
  }
  const FREN_PAT = { kick: 'X......x..x..x..', snare: '........X.......', hat: 'xxx.x.xxxxx.x.xx' };
  function pas(s, t) {
    const i = s % 16, bar = Math.floor(s / 16), b8 = bar % 8, P = M.pat, rg = M.rang, C = M.C, fl = JEU.flow;
    const h = () => (R() - .5) * .008, tt = t + (i % 2 ? M.swing * SD : 0), E = rampeE();   // E : la rampe du 15 au 30
    // LE VOL : à la croche la batterie et la basse se retirent, le grave se coupe, la réverbe s'ouvre ; LA POSE : tout retombe sur le temps
    if (s === JEU.volPas) { for (const id in sol) { sol[id].gain.cancelScheduledValues(t); sol[id].gain.setTargetAtTime(.04, t, .03); }
      hpM.frequency.cancelScheduledValues(t); hpM.frequency.setTargetAtTime(420, t, .25); revOut.gain.cancelScheduledValues(t); revOut.gain.setTargetAtTime((M.C.revB || .34) + .26, t, .4); }
    if (s === JEU.posePas) { for (const id in sol) { sol[id].gain.cancelScheduledValues(t); sol[id].gain.setValueAtTime(1, t); }
      hpM.frequency.cancelScheduledValues(t); hpM.frequency.setTargetAtTime(20, t, .02); revOut.gain.cancelScheduledValues(t); revOut.gain.setTargetAtTime(M.C.revB || .34, t, .3);
      son('impact', t, JEU.poseGrade === 'lourd' ? .75 : .5, bus.fx); if (JEU.poseGrade === 'parfait' || JEU.poseGrade === 'divin') { son('crash', t, .55, bus.fx, 2); gerbe(t); }
      JEU.poseGrade = null; JEU.volPas = -1; JEU.posePas = -1; }
    const enVol = JEU.volPas >= 0 && s >= JEU.volPas;
    // LA NITRO LÂCHÉE (tenue plus d'une seconde) : la cymbale sur le temps
    if (JEU.crashNitro && i % 4 === 0) { JEU.crashNitro = false; son('crash', t, .5, bus.fx, 2); }
    // LA FRÉNÉSIE : elle entre et sort à la mesure
    if (i === 0 && JEU.frenDemande != null) { if (JEU.frenDemande !== JEU.fren) { JEU.fren = JEU.frenDemande; grille = grilleDe(M.sec); poseMelodie(M.sec); son('crash', t, .6, bus.fx, 2.2); son('impact', t, .7, bus.fx); clairRegle(t, .1); } JEU.frenDemande = null; }
    const fren = JEU.fren, A = grille[b8 % 4], B = b8 === 7 ? grilleDe(M.forme[M.phr % 4])[0] : grille[(b8 + 1) % 4];   // B = l'accord qui vient (même de la phrase suivante)
    // LA RESPIRATION (section C) · LE FILTRE QUI BALAIE (VELOURS) · LE RETOUR (cymbale)
    const resp = M.resp && b8 < 2;
    if (M.resp && b8 === 1) { if (i === 0) son('riser', t, .45, bus.fx, MES, null, 2.4 / MES); if (i >= 8) son('snare', t, .1 + (i - 8) * .06, bus.fx); }
    if (M.resp && b8 === 2 && i === 0) { son('crash', t, .6, bus.fx, 2); son('impact', t, .6, bus.fx); }
    if (M.choc && b8 === 0 && i === 0 && rg.kick > 0 && tier >= rg.kick && s !== activation) { son('crash', t, .5, bus.fx, 2); son('impact', t, .32, bus.fx); }
    if (M.balaye && i === 0) { const fo = clairCible(), f = 380 * Math.pow(fo / 380, b8 / 7);
      clair.frequency.cancelScheduledValues(t); clair.frequency.setTargetAtTime(f, t, b8 === 0 ? .04 : MES * .35); if (b8 === 6) son('riser', t, .4, bus.fx, MES * 2, null, 2.4 / (MES * 2)); }
    const has = id => rg[id] > 0 && tier >= rg[id] && !(resp && GROOVE.has(id)) && !(enVol && GROOVE.has(id)) && !(M.repos && M.repos.has(id));
    // LES TRANSITIONS
    let coupe = false;
    if (activation >= 0 && s < activation) { const k = activation - s, tAct = t + k * SD, bt = M.build;
      if (grand && bt === 'filtre') {   // la mesure qui se ferme (filtre vers 420 Hz), la cymbale à l'envers, et tout se rouvre sur le 1er temps
        if (k === 16 && !M.balaye) { clair.frequency.cancelScheduledValues(t); clair.frequency.setTargetAtTime(420, t, MES * .3); }
        if (k === 8) sonFin('revcrash', tAct, 8 * SD, .6, bus.fx); if (k <= 4) son('snare', t, .15 + (4 - k) * .1, bus.fx); coupe = k <= 2; }
      else if (grand) { if (k === 16) son('riser', t, .5, bus.fx, MES, null, 2.4 / MES);   // la montée : souffle, roulement — ou le TROU d'une croche avant l'arrivée
        if (k <= 8 && !(bt === 'trou' && k <= 2)) { son('snare', t, .12 + (8 - k) * .07, bus.fx); if (k <= 4) son('snare', t + SD / 2, .12 + (8 - k) * .07, bus.fx); }
        if (bt === 'trou' && k === 2) trou(t, tAct); coupe = k <= 4; }
      else if (k <= 4) execFill(M.trans, 4 - k, t, B, tAct); }
    if (s === activation) { const ancien = tier; tier = cible; activation = -1; regleElements(t); arrivee(t, ancien); }
    // LES FINS DE PHRASE (passé le 6e moteur, une fois sur deux) : une transition du répertoire vers la phrase suivante
    if (b8 === 7 && i === 12) M.ff = tier >= 6 && !M.resp && !(activation >= 0 && activation - s <= 20) && !(rg.i_monte > 0 && tier >= rg.i_monte) && R() < .5 + .45 * E ? choisitTrans(false) : null;
    if (M.ff && b8 === 7 && i >= 12) execFill(M.ff, i - 12, t, B, t + (16 - i) * SD);
    if (M.ff && b8 === 0 && i === 0) { if (M.ff === 'filtre') clairRegle(t, .03); M.ff = null; }
    const souffle = b8 === 7 && i >= 12 && !has('final');
    // LA BATTERIE
    const pk = fren ? FREN_PAT.kick : P.kick, ps = fren ? FREN_PAT.snare : P.snare, ph = fren ? FREN_PAT.hat : (has('double') || has('i_dense') || JEU.nitro) && P.hatD ? P.hatD : P.hat;
    if (has('kick') && !coupe && !souffle) { const x = vel(pk, bar, i); if (x) { son('kick', t, x, bus.kick); if (has('pompe') || C.pompe > .5) { const g = pompeBus.gain; g.cancelScheduledValues(t); g.setValueAtTime(has('pompe') ? Math.max(.2, C.pompe - .12 * E - (has('i_pulse') ? .1 : 0)) : .8, t); g.linearRampToValueAtTime(1, t + SD * 3.4); } } }
    if (has('kick') && fl > .65 && i === 14 && b8 % 2 === 1 && !coupe && !fren && R() < fl - .4) son('kick', t, .55, bus.kick);   // le flow : une grosse caisse qui relance
    if (has('final') && i === 14 && b8 % 2 === 1 && !coupe) son('kick', t, .6, bus.kick);
    if (has('i_relance') && !coupe && !souffle && !fren && b8 % 2 === 1 && (i === 14 || (i === 11 && R() < .4)) && !vel(pk, bar, i)) son('kick', t, .62, bus.kick);   // les relances
    if (has('snare') && !coupe) { const x = vel(ps, bar, i); if (x) son('snare', tt + h(), x, bus.snare); }
    if (has('fant')) { const x = vel(P.fant, bar, i); if (x || (i % 2 === 1 && R() < fl * .12 + E * .16)) son('snare', tt + h(), .28 + R() * .1, bus.fant); }   // les fantômes, plus nombreux quand le flow monte
    if (has('hat')) { const x = vel(ph, bar, i); if (x) son('hat', tt + h(), x * (.82 + R() * .3), bus.hat); }
    if ((has('roll') || (fren && has('hat'))) && i >= 12 && (b8 % 2 === 1 || R() < .1 + fl * .3)) { son('hat', t, .3 + .1 * (i - 12), bus.roll); son('hat', t + SD / 2, .26 + .1 * (i - 12), bus.roll); if (fren && i === 15) son('hat', t + SD * .75, .5, bus.roll); }
    if (has('hatO')) { const x = vel(P.hatO, bar, i); if (x) son('hatO', tt + h(), x, bus.hatO); }
    if (has('perc')) { const c = P.perc[((bar % (P.perc.length / 16)) | 0) * 16 + i]; if (c === 'H' || c === 'L') son(c === 'H' ? 'percH' : 'percL', tt + h(), .8 + R() * .2, bus.perc); else if (c === 'x' || c === 'o') son('shaker', tt + h(), (c === 'x' ? 1 : .6) * (.85 + R() * .3), bus.perc); }
    if (has('ride') && (has('double') ? i % 2 === 0 : i % 4 === 0)) son('ride', t, .8, bus.ride, .7);
    if (has('toms') && (b8 === 3 || b8 === 7) && i >= 12) son(i < 14 ? 'tomH' : 'tomL', t, .9, bus.toms);
    // LES MARCHES DU 15 AU 28 (v3.4) : chaque fin de 4 mesures monte (souffle · roulement · toms, à tour de rôle) ; la batterie s'emballe
    // (toms toutes les 2 mesures, cymbale toutes les 4) ; et, passé la moitié de la rampe, la cymbale toutes les 4 mesures de toute façon
    const libreFin = !(activation >= 0 && activation - s <= 16) && !resp && !enVol, monte = has('i_monte'); let cymb = false;
    if (monte && libreFin && b8 === 3 && i >= 12) son('snare', t, .14 + (i - 12) * .06, bus.fx);   // à mi-phrase : un petit roulement seulement
    if (monte && libreFin && b8 === 7) { const k9 = (M.monteK || 0) % 3;
      if (k9 === 0) { if (i === 0) son('riser', t, .2 + .15 * E, bus.fx, MES, null, 2.4 / MES); if (i >= 12) son('snare', t, .2 + (i - 12) * .08, bus.fx); }
      else if (k9 === 1) { if (i >= 8) { son('snare', t, .14 + (i - 8) * .05, bus.fx); if (i >= 12) son('snare', t + SD / 2, .16 + (i - 8) * .05, bus.fx); } }
      else if (i >= 8 && i % 2 === 0) son(i < 12 ? 'tomH' : 'tomL', t, .6 + .05 * (i - 8), bus.fx);
      if (i === 15) M.monteK = (M.monteK || 0) + 1; }
    if (monte && b8 === 0 && i === 0 && s !== activation && !resp && !enVol) { son('crash', t, .24 + .16 * E, bus.fx, 1.8); cymb = true; }
    if (has('i_tambours') && libreFin && b8 % 2 === 1 && i >= 12 && !(monte && b8 % 4 === 3) && !(M.ff && b8 === 7)) { son(i < 14 ? 'tomH' : 'tomL', t, .5 + .08 * (i - 12), bus.fx); if (i % 2) son('snare', t + SD / 2, .22 + .06 * (i - 12), bus.fx); }
    if (has('i_tambours') && !cymb && b8 === 0 && i === 0 && s !== activation && !resp && !enVol) { son('crash', t, .22 + .12 * E, bus.fx, 1.6); cymb = true; }
    if (E > .45 && !cymb && b8 === 0 && i === 0 && has('kick') && s !== activation && !has('final') && !resp) son('crash', t, .12 + .12 * E, bus.fx, 1.5);
    if (has('final') && b8 % 4 === 0 && i === 0 && s !== activation && !cymb) son('crash', t, .3, bus.fx, 1.8);
    // LES BASSES : calées sur la grosse caisse, et sur le dernier temps une note qui AMÈNE l'accord suivant (basse2)
    const ivDe = (iv, Ax) => iv === 't' ? Ax.tierce : iv, b808 = est808(M.tim.basse);
    if (has('basse')) { const bp = fren && !b808 ? [[0, 0, 6], [7, 0, 3], [10, 12, 6]] : has('i_basse') ? M.patL.basse[M.patL.basse.length - 1] : P.basse;   // i_basse : la variante la plus active
      bp.forEach(([st, iv, len, vv]) => { if (st !== i) return; let m = A.basse + ivDe(iv, A);
        if (b808) { m -= 12; if (m < 30) m += 12; note('basse', m, t, SD * len * .95, .9, bus.basse, last808, A); last808 = m; }
        else note('basse', m, tt, SD * len * .9, vv || .85, bus.basse, null, A);
        if (has('i_basseOct')) note('basse', m + 12, tt, SD * len * .85, .42, bus.basse2, null, A); }); }   // la basse doublée à l'octave
    if ((has('basse2') || has('i_basse')) && i === 14 && B.r !== A.r) { const cb = B.basse; let best = null, bs = 99;   // la note de passage : un pas de la gamme vers la fondamentale suivante
      for (let m = cb - 2; m <= cb + 2; m++) if (m !== cb && A.gamme.includes(pc(m)) && Math.abs(m - cb) < bs) { bs = Math.abs(m - cb); best = m; }
      if (best != null) note('basse', b808 && best - 12 >= 30 ? best - 12 : best, tt, SD * 1.8, .7, bus.basse2, null, A); }
    if ((has('basse2') || has('i_basseOct')) && (i === 7 || i === 15) && !b808 && B.r === A.r) note('basse', A.basse + 12, tt, SD * .9, .55, bus.basse2, null, A);
    if (has('sub') && i === 0 && (!b808 || b8 % 4 === 0)) note('sub', A.basse - 12 >= 28 ? A.basse - 12 : A.basse, t, MES * (b808 ? 1.9 : .95), .8, bus.sub, null, A);
    // LES ACCORDS (menés)
    if (has('pad') && i === 0) accordJoue('pad', A, t, MES * .98, .8, bus.pad);
    const kp = has('i_keys') && M.patL.keys.length > 1 ? M.patL.keys[M.patL.keys.length - 1] : P.keys;
    if (has('keys')) kp.forEach(([st, len]) => { if (st === i) accordJoue('keys', A, tt + h(), SD * len, st === 0 ? .85 : .68, bus.keys); });
    if (has('i_pulse') && i % 4 === 2) { const sb = has('stab') ? 'stab' : 'keys'; accordJoue(sb, A, tt, SD * 1.1, .38 + .15 * E, bus[sb]); }   // la pulsation des contretemps
    if (has('stab')) P.stab.forEach(([st, len]) => { if (st === i) accordJoue('stab', A, tt + h(), SD * len * 1.4, .7, bus.stab); });
    if (has('cordes') && i === 0) accordJoue('cordes', A, t, MES * .98, .8, bus.cordes);
    if (has('choeur')) { if (C.pat.chop) C.pat.chop[bar % C.pat.chop.length].forEach(([st, len]) => { if (st === i) accordJoue('choeur', A, tt + h(), SD * len * 1.3, .75, bus.choeur); });   // le chœur haché (2-step)
      else if (i === 0) accordJoue('choeur', A, t, MES * .98, .8, bus.choeur); }
    if (has('cuivres') && C.pat.cuiv) C.pat.cuiv[bar % C.pat.cuiv.length].forEach(([st, len]) => { if (st === i) accordJoue('cuivres', A, tt + h(), SD * len, st === 0 ? .8 : .66, bus.cuivres); });   // les cuivres de l'eurobeat
    else if (has('cuivres') && ((i === 0 && (bar % 2 === 0 || has('final'))) || (i === 10 && has('final')))) accordJoue('cuivres', A, t, SD * (i === 0 ? 4 : 2), .75, bus.cuivres);
    // LA MÉLODIE (la phrase ; la partie B la confie à la corde pincée ; le flow l'orne d'une appoggiature ; la nitro la monte d'une octave)
    const mp = !fren ? meloPas[b8 * 16 + i] : null, vx = M.voixMel === 'haut' ? 'lead' : M.voixMel, vm = vx !== 'lead' && banque.voix[vx] && banque.voix[vx].length ? vx : 'lead';
    const secB = M.sec === 'B' || M.sec === 'B2', oB = (has('i_sommet') && !secB) || (M.voixMel === 'haut' && secB) ? 12 : 0;   // i_sommet : la mélodie une octave plus haut
    if (has('lead') && mp) mp.forEach(([m, len, , role]) => { let o = oB + (JEU.nitro && !oB ? 12 : 0); if (m + o > 90) o -= 12;
      if (fl > .65 && len >= 3 && R() < fl - .45) { let g9 = null; for (const d of [1, 2]) if (A.gamme.includes(pc(m + d))) { g9 = m + d; break; } if (g9 != null) note(vm, g9 + o, tt - SD * .25, SD * .25, .5, bus.lead, null, A); }
      const gl = vm === 'lead' && M.tim.lead === 'theremine' && M.precL != null && Math.abs(M.precL - (m + o)) <= 12 ? M.precL : null;   // le thérémine glisse
      note(vm, m + o, tt, SD * len, vm === 'pluck' ? .95 : .8, bus.lead, gl, A, SD * .7); M.precL = m + o;
      if (has('octave')) note('lead', m - 12, tt, SD * len, .6, bus.octave, null, A);
      if (has('harmo')) { let h3 = null; for (const d of [3, 4]) if (A.gamme.includes(pc(m - d))) { h3 = m - d; break; } if (h3 != null) note(vm, h3, tt, SD * len, .6, bus.harmo, null, A); } });
    if (has('foule') && mp && M.sec !== 'B' && M.sec !== 'B2') mp.forEach(([m, len]) => note('foule', m - 12, tt, SD * len, .7, bus.foule, null, A));   // le chœur de stade chante le thème
    if (has('foule') && !fren && b8 % 2 === 1 && i === 12 && !enVol) son('hey', tt, .55, bus.foule);   // « HÉ ! »
    if (has('tribu')) { const c9 = P.tribu[((bar % (P.tribu.length / 16)) | 0) * 16 + i]; if (c9 === 'L' || c9 === 'H') son(c9 === 'H' ? 'tomH' : 'tomL', tt + h(), (c9 === 'H' ? .8 : .9) * (.85 + R() * .25), bus.tribu); }   // les toms en rythme
    if (fren && has('lead') && i % 4 === 0 && R() < .5) note('lead', A.v[Math.floor(R() * A.v.length)] + 12, tt, SD * 2, .6, bus.lead, null, A);   // en frénésie : des coups de mélodie sur l'accord sombre
    if (has('contre') && i === 0) note('contre', guides[b8], t, MES * .95, .7, bus.contre, null, A);
    if (has('arp')) { const md = (fl > .75 || E > .5) && (P.arp === 'up8' || P.arp === 'rand8') ? 'updown16' : P.arp, m = arpNote(md, A, i); if (m != null) note('pluck', m + (md.endsWith('8') ? 12 : 0), tt + h(), SD * (md.endsWith('8') ? 2.2 : 1.3), .7, bus.arp, null, A); }
    if (has('sig')) signature(M.sig, bus.sig, s, i, b8, t, tt, A, B, fl);
    if (has('sig2')) signature(M.sig2, bus.sig2, s, i, b8, t, tt, A, B, fl);
    if (has('cloche') && ((i === 0 && b8 % 4 === 0) || (i === 8 && R() < .25 + fl * .2))) note('cloche', A.v[A.v.length - 1] + 12, t, 2, .7, bus.cloche, null, A);
  }

  // ================================================================ L'HORLOGE
  function tempo() { const c = (M.bpm0 + (M.bpm1 - M.bpm0) * (tier - 1) / 29) * (JEU.fren ? 1.04 : 1) * (1 + .02 * rampeE()); if (Math.abs(c - BPM) < .01) return;
    BPM += clamp(c - BPM, -1.5, 1.5); SD = 60 / BPM / 4; MES = 16 * SD; dlyL.delayTime.setTargetAtTime(SD * (M.C.dly || 3), nextTime, .1); dlyR.delayTime.setTargetAtTime(SD * (M.C.dly || 3), nextTime, .1); }
  function planifie() { let a = (Math.floor(step / 16) + 1) * 16; if (a - step < 4) a += 16;
    grand = cible > tier && M.ordre.slice(tier, cible).some(id => GRANDS.has(id)); if (grand && a - step < 16) a += 16; activation = a;
    if (grand) { M.build = rp(['montee', 'trou', 'filtre'].filter(x => x !== M.buildDer && x !== M.transDer[0])); M.buildDer = M.build; (M.journal = M.journal || []).push('GRAND:' + M.build); }   // trois façons de monter, jamais deux fois la même
    else { const nx = M.ordre[tier]; M.trans = choisitTrans(cible < tier || (nx && nx.startsWith('i_'))); } }
  // LA SALLE DU STYLE (v3.6) : une réverbe neuve, en fondu (l'ancienne s'éteint puis se débranche) ; ses réponses gardées en cache
  function salleMet() { const S = M.C.salle || [2.6, 1], cle = S.join(','), t = ctx.currentTime; if (dFb) dFb.forEach(g => g.gain.setTargetAtTime(M.C.fb || .34, t, .3));
    if (cle === revCle) return; revCle = cle;
    const cv = ctx.createConvolver(), g = ctx.createGain(); cv.buffer = IRS[cle] || (IRS[cle] = ir(S[0], S[1])); g.gain.value = revC ? 0 : 1; revIn.connect(cv); cv.connect(g); g.connect(rHpG);
    if (revC) { g.gain.setTargetAtTime(1, t, .3); const o = revC; o.g.gain.setTargetAtTime(0, t, .3); setTimeout(() => { try { revIn.disconnect(o.cv); o.cv.disconnect(); o.g.disconnect(); } catch (e) {} }, 2500 + S[0] * 1000); }
    revC = { cv, g }; }
  function installe(r) { M = r.M; banque = r.b; try { vraisMenage(new Set([...(M.vraisF || []), ...((prepa && prepa.M && prepa.M.vraisF) || [])])); } catch (e) {} MOD = 0; vinylStop(); last808 = null; retient(M); for (const k in revPad) delete revPad[k]; try { salleMet(); } catch (e) { erreurs++; }
    BPM = M.bpm0 + (M.bpm1 - M.bpm0) * (tier - 1) / 29; SD = 60 / BPM / 4; MES = 16 * SD; }
  function bascule() { installe(suivant); suivant = null; prepa = null; const d = Math.ceil(step / 128) * 128 - step; step += d; if (activation >= 0) activation += d;
    if (JEU.volPas >= 0) JEU.volPas += d; if (JEU.posePas >= 0) JEU.posePas += d;
    dlyL.delayTime.setTargetAtTime(SD * (M.C.dly || 3), nextTime, .05); dlyR.delayTime.setTargetAtTime(SD * (M.C.dly || 3), nextTime, .05); regleElements(nextTime); }
  function horloge() {
    const now = ctx.currentTime;
    if (nextTime < now - .02) { const k = Math.ceil((now - nextTime) / SD); step += k; nextTime += k * SD; }
    while (nextTime < now + .35) {
      if (step % 16 === 0) { if (suivant) bascule(); tempo(); }
      if (step % 128 === 0) { nouvellePhrase(); regleElements(nextTime);   // l'énergie de la nouvelle partie
        if (RENOUV > 0 && M.phr >= RENOUV && !prepa && !suivant) api.nouvelle(); }   // À L'INFINI : une musique neuve se prépare et prendra le relais
      if (cible !== tier && activation < 0) planifie();
      try { pas(step, nextTime); } catch (e) { erreurs++; if (!derniere) derniere = String(e && e.message || e); }   // une note ratée n'arrête JAMAIS la musique
      nextTime += SD; step++;
    }
  }
  // LA MÉMOIRE DES PARTIES : ce que les deux dernières musiques ont joué devient très improbable (une musique NEUVE seulement ; la musique
  // tirée garde ces poids dans ses goûts → son numéro la rejoue à l'identique)
  const MEMO_CATS = ['couleur', 'keys', 'lead', 'basse', 'pad', 'sig', 'pluck', 'contre', 'cordes', 'snare', 'riser', 'phrase', 'kick', 'kickT', 'hatT', 'mode', 'cuivres', 'retouche'];
  let HISTO = {}; MEMO_CATS.forEach(k => HISTO[k] = []);
  if (historique) MEMO_CATS.forEach(k => { if (Array.isArray(historique[k])) HISTO[k] = historique[k].slice(0, 5); });
  function oublie(W) { const W2 = Object.assign({}, W); MEMO_CATS.forEach(k => { const h = HISTO[k]; if (!h.length) return; const tab = Object.assign({}, W2[k]);
      const f9 = k === 'couleur' ? [0, 0, 0, 0, .4] : k === 'mode' ? [.45] : k === 'lead' ? [0, .15, .45] : [0, .35]; h.slice(0, f9.length).forEach((x, j) => { if (x != null) tab[x] = (tab[x] == null ? 1 : tab[x]) * f9[j]; }); W2[k] = tab; }); return W2; }   // v3.4 : la DERNIÈRE musique est EXCLUE (zéro), rôle par rôle
  function retient(Mx) { const v = { couleur: Mx.cid, keys: Mx.tim.keys, lead: Mx.tim.lead, basse: Mx.tim.basse, pad: Mx.tim.pad, sig: Mx.sig, pluck: Mx.tim.pluck, contre: Mx.tim.contre,
      cordes: Mx.tim.cordes, snare: Mx.kit.snare, riser: Mx.kit.riser, phrase: Mx.phF, kick: Mx.kit.kt, kickT: Mx.kit.kickT, hatT: Mx.kit.hatT, mode: Mx.modeN, cuivres: Mx.tim.cuivres, retouche: Mx.retouche || 'aucune' };
    MEMO_CATS.forEach(k => { HISTO[k] = [v[k]].concat(HISTO[k].filter((x, j) => j < (k === 'couleur' ? 4 : 2))); }); }
  function prepare(n, W) {
    if (n == null) { n = 1000 + Math.floor(R() * 9000); W = oublie(W || GOUTS || {}); }
    const Mx = compose(n, W); retoucheMx(Mx); const p = fabriqueBanque(Mx).then(b => ({ M: Mx, b })); prepa = { M: Mx, p }; return p; }
  async function demarre(n, W) {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (!chaineOk) chaine();
    let p = null, pr = null;
    try { p = prepare(n, W); demande = p; pr = await p; } catch (e) { erreurs++; derniere = String(e && e.message || e); p = prepare(null); demande = p; try { pr = await p; } catch (e2) { playing = false; return; } }   // une 2e chance, une autre musique
    if (demande !== p) return;
    try { await ctx.resume(); } catch (e) {}
    if (!playing) return;
    prepa = null; step = 0; activation = -1; tier = cible; installe(pr); dlyL.delayTime.value = dlyR.delayTime.value = SD * (M.C.dly || 3);
    Object.assign(JEU, { volPas: -1, posePas: -1, fren: false, frenDemande: null, crashNitro: false, poseGrade: null, crashEnCours: false });
    for (const id in sol) sol[id].gain.value = 1; hpM.frequency.value = 20; revOut.gain.value = M.C.revB || .34; master.gain.cancelScheduledValues(ctx.currentTime); master.gain.value = gainBase(); M._gb = master.gain.value;
    regleElements(ctx.currentTime + .05);
    nextTime = ctx.currentTime + .08; clearInterval(timer); timer = setInterval(horloge, 50); horloge();
  }

  // (2026-10-15, pôle SON) LES RETOUCHES (bibliothèque › Pouce bleu, les V2 des notes de Léo) : start(n, W, O) — O.retouche(Mx, outils) après compose,
  // O.voix[nom](outils, Tm) / O.acc[nom](outils, Tm) remplacent une voix ou un accord ; O.style force la couleur enregistrée (v6). Sans O : rien ne change.
  let OPT = null;
  const OUTILS = Mx9 => ({ rng: graine(((Mx9 && Mx9.n) | 0) * 31 + 7), tp, tpw, tr, R, graine, CATALOGUE, osc, envG, vib, bruit, OUT, courbe, metal, panne, ks, mtof, GAMMES,
    phrase: typeof phrase === 'function' ? phrase : null, menes: typeof menes === 'function' ? menes : null,
    NOM_LEAD: typeof NOM_LEAD !== 'undefined' ? NOM_LEAD : null, NOM_KEYS: typeof NOM_KEYS !== 'undefined' ? NOM_KEYS : null, NOM_PLUCK: typeof NOM_PLUCK !== 'undefined' ? NOM_PLUCK : null });
  function retoucheMx(Mx) { if (!OPT || OPT.n !== Mx.n || typeof OPT.retouche !== 'function') return;
    try { OPT.retouche(Mx, OUTILS(Mx)); Mx.rang = {}; CATALOGUE.forEach(id => Mx.rang[id] = 0); Mx.ordre.forEach((id, k) => Mx.rang[id] = k + 1); }
    catch (e) { erreurs++; derniere = 'retouche : ' + String(e && e.message || e); } }
  const api = {
    start(n, W, O) { if (playing) return; playing = true; OPT = O ? Object.assign({}, O, { n }) : null; demarre(n, W); },
    stop() { playing = false; demande = null; suivant = null; prepa = null; clearInterval(timer); timer = 0; vinylStop();
      if (master) { const t = ctx.currentTime; for (const id in bus) if (id !== 'fx') { bus[id].gain.cancelScheduledValues(t); bus[id].gain.setTargetAtTime(0, t, .05); } } },
    nouvelle(n, W) { if (!playing || !M) return; let p; try { p = prepare(n, W); } catch (e) { erreurs++; derniere = String(e && e.message || e); prepa = null; return; } p.then(r => { if (playing && prepa && prepa.p === p) suivant = r; }).catch(e => { erreurs++; derniere = String(e && e.message || e); if (prepa && prepa.p === p) prepa = null; }); },
    setRenouvelle(k) { RENOUV = Math.max(0, k | 0); },   // 0 : la même musique pour toujours
    setTier(p, nb) { const n = nb && nb !== 30 ? Math.round(1 + (clamp(p, 1, nb) - 1) * 29 / Math.max(1, nb - 1)) : p; cible = clamp(Math.round(n), 1, 30); },
    setSpeed(x) { cible = clamp(1 + Math.round(clamp(x, 0, 1) * 29), 1, 30); },
    setVolume(v) { volume = v; if (master) { master.gain.setTargetAtTime(gainBase(), ctx.currentTime, .1); if (M) M._gb = gainBase(); } },
    setGouts(W) { GOUTS = W || null; },
    regle, evenement,
    nomElement: k => M ? nomEl(M, M.ordre[clamp(k, 1, 30) - 1]) : '',
    get elements() { return M ? M.ordre.map(id => nomEl(M, id)) : []; },
    get tier() { return tier; }, get bpm() { return BPM; }, get playing() { return playing; },
    get historique() { const h = {}; MEMO_CATS.forEach(k => h[k] = HISTO[k].slice()); return h; },   // (à garder d'une séance à l'autre)
    get jeu() { return { nitro: JEU.nitro, vol: JEU.vol, flow: JEU.flow, frenesie: JEU.fren }; },
    get tirage() { if (!M) return null; return { n: M.n, titre: M.titre, style: M.C.nom + ' · ' + M.C.dit, styleId: M.cid, couleur: M.C.nom, idee: M.idee, signature: M.sig, signature2: M.sig2, transitions: (M.journal || []).slice(),
      ton: JEU.fren ? NOTES_FR[(M.ton + MOD) % 12] + ' sombre (frénésie)' : MOD ? NOTES_FR[(M.ton + MOD) % 12] + ' ' + NOM_MODE[M.modeN] + ' (un ton plus haut)' : M.tonNom,
      bpm: Math.round(BPM), bpm0: M.bpm0, bpm1: M.bpm1, grilles: M.grilles.map(g => g.map(A => A.nom).join(' · ')), ordre: M.ordre.slice(),
      section: { A: 'A (le thème)', A2: 'A′ (le thème varié)', B: 'B (le couplet)', C: 'C (le retour)' }[M.sec] + (M.resp ? ' · respiration' : '') + (M.balaye ? ' · filtre qui balaie' : '') + (JEU.fren ? ' · FRÉNÉSIE' : ''),
      clavier: nomV(M.tim.keys, NOM_KEYS), melodie: nomV(M.tim.lead, NOM_LEAD), basse: nomV(M.tim.basse, NOM_BASSE), arpege: nomV(M.tim.pluck, NOM_PLUCK), contreChant: nomV(M.tim.contre, NOM_CONTRE), nappe: nomV(M.tim.pad, NOM_PAD),
      vrais: Object.values(M.tim).filter(x => typeof x === 'string' && x[0] === '@').map(x => NOM_VRAI[x.slice(1)]).concat(Object.keys(M.kitV || {}).length ? ['percussions réelles (' + Object.keys(M.kitV).join(', ') + ')'] : []), retouche: M.retouche,
      caisse: M.kit.snare, prod: NOM_KICK[M.kit.kickT] + ' · ' + NOM_HAT[M.kit.hatT] + ' · ' + nomSalle(M.C.salle || [2.6]), courbe: { melodie: M.rang.lead, grosseCaisse: M.rang.kick, double: M.rang.double, modul: M.rang.modul }, phrase: NOM_PHRASE[M.phF] + (M.phFB !== M.phF ? ' · couplet : ' + NOM_PHRASE[M.phFB] : ''), prepare: !!prepa, themeAime: M.themeAime,
      traits: { style: M.cid, couleur: M.cid, sig: M.sig, de: null, genes: [], mode: M.modeN, keys: M.tim.keys, lead: M.tim.lead, basse: M.tim.basse, vamp: M.vamp, phrase: M.phF, theme: M.motifs[0].map(x => x.slice()) },
      gouts: M.W }; },
    get banqueMs() { return banque ? banque.ms : null; }, get banqueToutMs() { return banque ? banque.suiteMs || null : null; },
    get _bus() { return bus; }, get _banque() { return banque; }, get _verif() { return VERIF; }, get _chaine() { return { sol, hpM, clair, master, revOut, lim, step }; }, get _voix() { return { actives, pic: picVoix, sautes, erreurs, derniere }; },
    _compose: (n, W, O) => { if (O) OPT = Object.assign({}, O, { n }); const Mx = compose(n, W); retoucheMx(Mx); return { sig: Mx.sig, sig2: Mx.sig2, idee: Mx.idee, style: Mx.cid, ton: Mx.tonNom, ordre: Mx.ordre, titre: Mx.titre, bpm: [Mx.bpm0, Mx.bpm1], keys: Mx.tim.keys, lead: Mx.tim.lead, basse: Mx.tim.basse, pad: Mx.tim.pad, pluck: Mx.tim.pluck, contre: Mx.tim.contre,
      cordes: Mx.tim.cordes, snare: Mx.kit.snare, riser: Mx.kit.riser, kt: Mx.kit.kt, kickT: Mx.kit.kickT, hatT: Mx.kit.hatT, pluck: Mx.tim.pluck, cuivres: Mx.tim.cuivres, retouche: Mx.retouche, kitV: Mx.kitV, rangs: { lead: Mx.rang.lead, kick: Mx.rang.kick, clarte: Mx.rang.clarte, double: Mx.rang.double, modul: Mx.rang.modul }, phrase: [Mx.phF, Mx.phFB], forme: Mx.forme, modeN: Mx.modeN,
      grilles: Mx.grilles.map(g => g.map(A => A.nom + ' ' + A.v.join('.'))), theme: Mx.motifs[0] }; },
    _suite: (k, W) => { const h0 = JSON.stringify(HISTO), out = [];   // (banc) k musiques neuves d'affilée, avec la mémoire, sans les jouer
      for (let j = 0; j < k; j++) { const Mx = compose(1000 + Math.floor(R() * 9000), oublie(W || GOUTS || {})); retient(Mx);
        out.push({ n: Mx.n, couleur: Mx.cid, keys: Mx.tim.keys, lead: Mx.tim.lead, basse: Mx.tim.basse, pad: Mx.tim.pad, sig: Mx.sig, pluck: Mx.tim.pluck, contre: Mx.tim.contre, cordes: Mx.tim.cordes,
          snare: Mx.kit.snare, riser: Mx.kit.riser, phrase: Mx.phF, kick: Mx.kit.kt, kickT: Mx.kit.kickT, hatT: Mx.kit.hatT, mode: Mx.modeN }); }
      HISTO = JSON.parse(h0); return out; },
    wake() { if (ctx && playing && ctx.state !== 'running') ctx.resume(); },
  };
  return api;
}
