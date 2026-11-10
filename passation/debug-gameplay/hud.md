# DEBUG HUD — chevauchements, coupes, débordements du HUD de course (10/11/2026)

Sacha : « insiste vraiment sur le HUD, y a plein de problèmes de superposition et tout, genre quand la dark triad apparaît ».
Suite de `passation/CHASSE-HUD.md` (le chrono de DARK TRIAD sous la plaque, corrigé le matin dans `hudColMesure`).

## Le banc : `outils/banc-hud/chevauche.cjs` + `outils/banc-hud/mesure-hud.js`

    node outils/banc-hud/chevauche.cjs --out DIR [--gab 13p,13p-c,se,se-c,max,max-c,393] [--lang fr,en] [--etats a,b] [--prof /chemin]

- Un seul Chrome sans fenêtre (ports 9771/9772), le vrai jeu en `?tel=1&app=1&garde=1&intro=ancien`, son coupé dans la sauvegarde avant le chargement,
  banque à 1 234 567 €, langue par `localStorage.ccLang`, pilote de mesure `dbgAuto(true,0,{vol:true})`. Une course neuve par langue × gabarit, et une
  nouvelle quand la caisse meurt en route.
- MARGES SÛRES SIMULÉES : `--ccT/B/L/R` posés en ligne sur `<html>` (le jeu les lit partout à la place de `env(safe-area-inset-*)`, cf. `html.telCadre`) :
  debout 59 en haut / 34 en bas ; couché 59 à gauche et à droite / 21 en bas. ⚠ Sur 667 × 375 / 375 × 667 (SE, 6, 7, 8) c'est PLUS que le vrai :
  ces iPhone n'ont pas d'encoche (0 de côté couché, 20 en haut debout). Un défaut qui n'existe QUE là est noté « artefact SE ».
- 22 ÉTATS forcés par les crochets : départ · course · flow 50/80/100 · ENTRÉE en frénésie (0, 100, 250, 500, 1000, 1800 ms, animations CSS gelées le temps
  de la mesure et de la photo) · frénésie + chrono (1 234 567 €) · + vol · + AIR MAX · + NITRO MAX · + chaîne et record · + verdict et palier de vitesse ·
  ×10 · sortie de frénésie · pouvoirs · mission gagnée · portail · pause · reprise 3-2-1 · LE PIRE (tout en même temps) · le pire en vol · seconde chance.
  La frénésie est TENUE (sans style les trois traits se vident en ~2 s : un minuteur les nourrit tant qu'on la photographie).
- La MESURE (`window.__hudMesure`) : un bloc = un élément `position:fixed` visible (ou un enfant de #hud posé en absolu) ; son ENCRE = les lignes de
  texte (Range.getClientRects), les fonds, les bords, les canvas/img/svg, la boîte entière des touches ⏸ et NITRO — jamais une boîte vide. Rend :
  (a) les paires dont l'encre se recouvre de plus de 4 px² (hors parent/enfant) ; (b) ce qui sort de l'écran ; (c) ce qui entre dans l'encoche /
  l'indicateur d'accueil ; (d) le texte coupé (scrollWidth > clientWidth, ellipse) ; (e) une police autre que Press Start 2P.
  NON COMPTÉS, avec la raison : les étincelles `.pxBurst` (décor de 0,3 s) ; `canvas.nx3Ecl` (l'éclat transparent de la boule de feu) ; les calques
  plein écran sans texte ; un bloc ESTOMPÉ exprès (opacité effective, `filter:opacity()` compris, < 0,2 : les pouvoirs sous une grande annonce,
  le fil sous une ligne de mission — décision de Sacha du 05/11) ; le nom d'une figure dans la police de sa rareté (#fh/#fhLeg [data-rp], exception
  nommée par Sacha le 18/10).
- Résumé d'un relevé : les lignes PAIRE / ZONE / HORS / COUPE / POLICE par état (script de lecture dans le scratchpad, rien à installer).

## Inventaire des blocs de course (téléphone, debout 390 × 844 ; z-index ; qui les place)

| Bloc | Où | z | Qui le place |
|---|---|---|---|
| `#nitroWrap` (jauge NITRO + vitesse KM/H) | haut gauche → avant le ⏸ | auto | `socle-2-menu.css` l.334 (top ccT+18) |
| `#flowHud` (barre de flow, zone rouge, « €×3 ») | sous la nitro | 6 | `socle-4-aura.css` l.395 (top hudH+52) |
| `#tGear` ⏸ | haut droite | 8 | `hud-da.css` l.512 |
| `#auraV2` (AURA, `#avPlus` « +N », `#avCh` chaîne ×N + barre, `#avRec`, `#avList`) | gauche sous les barres | 6 | `socle-4-aura.css` l.3, zoom `--hudK` (`hud-da.css` hudTaille) |
| `#cashHud` (€ de la partie) | colonne de droite, 1er | 6 | `hud-da.css` l.268 puis `hudColMesure` |
| `#triade` (DARK TRIAD) + `#frenChrono` + `#frenTraits` | debout : colonne de droite, 2e ; couché : en haut, à droite des barres | 6 | `charte-5-frenesie.css` l.116, `hud-da.css` l.291/295/337, `hudColMesure` (`passe-textes.js`) |
| `#airHud` (chrono de vol, AIR MAX) | colonne de droite | — | `hud-fini.css` l.27, `hudColMesure` |
| `#pwrChip` (plaques NITRO MAX, AIR MAX, VITESSE ×2, AIMANT, AURA ×2) | colonne de droite | 6 | `hud-fini.css` l.28, `hud-da.css` l.515-520, `hudColMesure` |
| `#campChip` (objectif) | colonne de droite | — | `hudColMesure` |
| `#frenTitre` « TRIPLE MONSTER » | centre du couloir (`--laneA`) | 42 | `hud-maitrise.css` l.192 ; pendant `body.ftOn` il tait #slam9, #verdHud, #lvlBan, le chrono et les traits |
| `#slam9` (grande annonce : RECORD BATTU, CHAÎNE PERDUE…) | centre | 41 | `socle-4-aura.css` / `hud-maitrise.css` |
| `#engBig` (carte MOTEUR / record, suit la caisse) | sur la caisse | 40 | `socle-4-aura.css` l.323 |
| `#lvlBan` (NIVEAU, NOUVEAU SECTEUR) | centre | 7 | `socle-3-hud.css` |
| `#fil` (la ligne qui dit tout : gestes, paliers, « +21 KM/H ») | bas centre | 6 | `fil.css`, `fil.js` |
| `#m2Ligne` (MISSION RÉUSSIE, PEINTURE GAGNÉE) | bas gauche (debout), bas centre (couché) | 8 | `missions.css` l.229-243 ; le fil s'estompe dessous (`body.m2Lon`) |
| `#toast` | haut centre (ccT+72) | 270 | `charte-2-ecrans.css` l.291, `politesses.css` l.16 |
| `#touchCtl` (boule de feu NITRO `#tNitro`, volant/joystick) | bas | 4 | `hud-da.css` l.522, `charte-7-details.css` |
| `#fh` / `#fhLeg` (figures en vol, rappel des gestes) | bas | — | `figures.css` |
| `#tPanel` (pause), `#overlay` (mort, seconde chance `#mChance`) | plein écran | 9 / 5 | écrans |

## Défauts

| id | état · gabarit | blocs | mesure | correctif | commit |
|---|---|---|---|---|---|
| H-01 | toast en course (« JETON SPIN ×1 ») · debout | `#toast` sur `#auraV2` et `#cashHud` | 1 480 px² + 664 px² (13p) | `code/interface/icones-fenetre.js` `toast()` : en course sur téléphone, il passe par le FIL | voir git log |
| H-02 | plaque VITESSE ×2 · debout | `#pwrChip span` « VITESSE ×: » coupé | 110 > 103 px (393, 13p) | `code/css/hud-fini.css` §9 : étiquette sans espace entre les lettres | voir git log |

Photos avant : `hud/H01-avant-13p.png`, `hud/H02-avant-393.png`.
