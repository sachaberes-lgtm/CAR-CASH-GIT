# CARNET DES SOUS-ARTISTES — « 20 bangers différents » (2026-11-03, Léo)

Demande de Léo : une version premium de TOUTES les musiques du jeu, dans la nouvelle DA des morceaux refaits (CAVALE ULTRA, RUBIS ULTRA, FLAMME DE TONNERRE, MIRAGE) : rythmique riche, basse courte et nette, timbres polis, vraie montée 1→30, climax fort. Mais l'identité de chaque morceau d'origine reste (on améliore, on ne repart pas de zéro ; on garde son thème/ambiance/harmonie reconnaissables, on garde ce qui plaisait). Les instruments « trompette » ou cuivre-lead : les rendre originaux, futuristes, cool (nouveau mainstream), pas un cuivre scie banal. À éviter à tout prix : deux morceaux qui se ressemblent, et l'ancienne manière (mêmes motifs, mêmes patrons de batterie, mêmes réglages recopiés d'un morceau à l'autre).

## Déjà pris (interdit de réutiliser)
- CAVALE ULTRA : 138 BPM, ré dorien, breakbeat/2-step, marimba, thérémine, harmonica de verre, vibraphone, pixels, orgue triangles.
- RUBIS ULTRA : 112 BPM, sol mineur, amapiano, log drum, piano jazz, flûte, chœur.
- FLAMME DE TONNERRE : 134 BPM, ré hirajoshi, taiko électro, luth type shamisen, flûte de bambou, erhu, cors de guerre.
- MIRAGE : 100 BPM, ré hijaz, oud, ney, darbouka saïdi, trompette sourdine, zills, daff.
- ASPHALTE D'ÉMERAUDE (mi mineur), AURA (mi mineur), RUBIS DE NÉON (fa mineur) : gardent leur identité.
- AVERSE DE CHROME (lo-fi, piano à queue), LUNE DE JADE (french touch retouchée).

## Fiches (BPM, tonalité, famille rythmique, signature) — à respecter, sauf si l'identité d'origine l'interdit (alors choisis le plus proche et note-le dans ton compte rendu)
1. PLUIE D'ARGENT (bleu-6562, synthwave) — 106 BPM, do# mineur. Gated-reverb demi-temps + arpèges en doubles croches. Signature : cloche FM / vocoder cristallin.
3. ENSEIGNE DE JADE (bleu-7299, synthwave) — 124 BPM, fa# dorien. House quatre-sur-le-temps, basse sur les contretemps, charleys shufflés. Signature : pluck pentatonique de cristal + enseigne qui clignote (filtre/gate).
4. COBRA ULTRA (bleu-2221, french touch) — 121 BPM, si♭ mixolydien. Broken-beat funk glitché. Signature : talkbox / voix-synthé qui serpente.
6. NÉNUPHARS VELOURS (bleu-9551, synthwave doux) — 96 BPM, la♭ lydien. Dub one-drop aquatique : gouttes, réverb à ressort, sub rond. Signature : synthé « eau » + nappes flottantes.
8. FIRE PRIME (bleu-8154, lo-fi) — 72 BPM, mi♭ mineur. Boom-bap swingué poussiéreux, sampler 12 bits, craquements. Signature : guitare/Rhodes passé au filtre cassette.
11. FEU DE LUXE (bleu-1275, disco funk) — 116 BPM, la majeur→la dorien. Disco live : charley 16es ouvert, clavinet, cordes disco. Signature : cordes + cuivres futuristes en stabs.
13. SAUVER MAMAN (bleu-3379, synthwave émotionnel) — 82 BPM, ré♭ majeur, sentiment 12/8. Cinématique, toms profonds, arpèges de piano. Signature : voix/chœur synthétique + violoncelle synthé.
14. TONNERRE DELUXE (bleu-6104, lo-fi/trap) — 148 BPM (ressenti demi-temps), sol# mineur. Trap luxe : rouleaux de charley, 808 qui glissent courts. Signature : synthé orage (grondement, éclairs en bruit filtré).
15. NÉON NOIR (pal-neon-noir, paliers figés) — 128 BPM, si mineur. Techno sombre / EBM : kick roulant, rumble, percussions métalliques. Signature : séquence acid + voix noire.
16. NUIT DE VELOURS (pal-nuit-de-velours, paliers figés) — 92 BPM, mi♭ dorien. Quiet storm / R&B lent : balais, contrebasse synthé douce. Signature : cordes de velours + guitare soyeuse.
17. AURA · 30 PALIERS (pal-aura-30, déjà écrit à la main) — garde BPM/tonalité (mi mineur), améliore.
18. RUBIS DE NÉON (pal-rubis-neon, à la main) — garde BPM/tonalité (fa mineur), améliore.

## Règles techniques (apprises sur CAVALE/MIRAGE/RUBIS/ASPHALTE)
- Tu écris UNE page `direct/<slug>.html` (format page à la main : `<script id="morceau">`, MORCEAU {titre,bpm,mesures,intro,pas,moteurs,ton,paliers,preparer,jouer}, harnais #play/#speed ; modèle : `cavale-ultra-course.html`, `rubis-ultra.html`, `flamme-de-tonnerre.html`, `mirage.html`, `asphalte-emeraude.html`). Pour AURA et RUBIS DE NÉON : copie d'abord l'original en `<nom>-avant.html` puis modifie en place.
- Tu n'édites QUE ton fichier. Ne touche ni `pouce-bleu-jeu.js`, ni `lobby-musiques.html`, ni `musique.js`, ni `index.html`, ni les pages des autres (le câblage est fait ensuite par le chef d'orchestre).
- Le palier 1 (lobby) calme mais pas pauvre ; vraie montée 1→30 (RMS régulier, pas de saut > ~3,5 dB, crête ≤ −0,5 dB) ; moteur 30 = climax puissant et net (pas chaotique) ; basse courte et nette.
- CHARGE CPU : le moteur 30 doit tourner en vrai (≈ ≤ 150 oscillateurs et ≈ ≤ 40 sources de bruit par mesure ; frappes/bruits en tampons précalculés dans `preparer`, pas de filtre en direct par coup de charley) — CAVALE bugguait au 30 par saturation CPU.
- Fins de notes douces (release exponentielle), aucun cut net sur les leads.
- Varie chaque reprise (motifs alternés, contre-chants, registres) : pas de phrase qui revient identique.
- Identité d'abord : écoute/mesure l'original (type genv : entrée dans `PB.liste` ; generator `musique-trente-v3-N.js` ; retouches dans `retouches-bleu.js`/`rythmique.js`), garde son thème, ses accords et sa couleur, améliore sinon.
- Les timbres inventés (cuivre futuriste, etc.) : synthèse maison, jamais de la scie nue ; vise « nouveau mainstream ».
- Tests : onglet de fond (jamais tab-2), page directe `http://localhost:8000/assets/audio/music/direct/<slug>.html` (serveur sans cache), rendu hors-ligne pour les mesures, pas d'erreur console, balayage des moteurs.
- Pas de commit, pas de push.
- Compte rendu en français, court : identité gardée / ce qui est neuf, BPM + tonalité finales, signature, mesures (RMS 1→30, plus grand saut, crête, charge), réserves.
