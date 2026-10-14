# pause-fin — refonte de l interface, charte 6 (2026-10-14)

## Journal
- a9979fd + commit suivant (branche ui/pause-fin) — L'ÉCRAN DE FIN DE PARTIE `#mDead` (la PAUSE n'est PAS faite : autre mission).
- Tout le CSS est dans `<style id="c6-pause-fin">` (lignes ~7517-7650), préfixe `html.c6 #overlay #mDead` (deux id : il domine les
  ~270 anciennes règles sans !important ; les rares !important répondent à un !important de charte4 ou à un style EN LIGNE du script).
- La hiérarchie : 1) `#mOverT` 16 px blanc (+ `#mCause` 8 px gris dessous quand ce n'est PAS un record) · 2) `.mCashL` = le héros :
  `#mCash` 32 px vert sans cadre (crans 32·24·16 selon `--n`), `#mCashTot` 8 px gris · 3) `.hCard` AURA / MOTEUR jumelles (légende 8 px,
  valeur au milieu, sous-ligne 8 px) · 4) `.mStats` : quatre chiffres 16 px + légende 8 px, sans boîte · 5) `.mObj` carte d'encre,
  jauge blanche (verte pleine quand le défi est réussi), prime en vert · `.mFin` : maison `.pbtn.pbCarre` 48 × 48 + REJOUER `.pb-gold.big`.
- Debout = flex colonne (`order`) ; couché = grille 2 colonnes, gouttière 16, lignes COMMUNES (la bande tient la hauteur verdict + argent,
  le défi commence où commencent les jumelles, REJOUER finit où elles finissent), `#mDead` = exactement la hauteur visible.
- DOM (ligne ~7950) : la maison devient `.pbtn.pbCarre.mMenu` (icône seule, `tabindex`, aria « Accueil »). Le DOM reste À PLAT.
- JS (`mFill`, ~52470-52510, chirurgical, gardé par `html.c6` quand le texte change) :
  · `#mDead.c6Rec` posée quand le titre dit NOUVEAU RECORD ! (la feuille cache alors la cause) ;
  · carte AURA : la sous-ligne « MEILLEUR n » est aussi émise quand il y a record (`.hNxC6`, masquée hors charte 6) ;
  · légende « MOTEUR » (clé TR existante → ENGINE) au lieu de « MOTEUR ATTEINT » ; la légende FRENESIE ne devient plus « RECORD ».
- Entrée : la cascade c6Entre 0-120 ms dans l'ordre de lecture (les anciens délais 250-660 ms et le reflet k4Lingot en boucle sur l'or sont coupés).

## Vérifié (banc `ui/banc/pause-fin/fin.cjs`, journaux `fin.log` / `fin2.log`, captures `ui/shots/pause-fin/apres/`)
- couche 844×390, debout 390×844, i7couche 667×375, marges iPhone : overlay 390/390, 844/844, 375/375 → RIEN ne défile, les deux touches
  toujours à l'écran ; `s.boutons()` : 0 problème partout ; 0 erreur JS (seul bruit : une musique du lobby interrompue, `ERR_ABORTED`).
- REJOUER relance une course (started, pas gameOver) ; la maison ramène à l'accueil (`#mHome.on`). FR et EN (PLAY AGAIN en 16 px, tient).
- Cas : record (titre seul) · sans record (GAME OVER + cause, « RECORD PALIER 26 » sous le moteur) · gros nombres (« $ 257 k », aura 12 400,
  MEILLEUR 10 000 000 sur deux lignes à l'iPhone 7) · défi réussi (jauge verte, +$ 200).

## RETIRE / DEPLACE
- OFFRES et RÉGLAGES quittent l'écran de fin (`#mDead>.mRow` masquée en charte 6 ; le script ne la lit pas ; ils restent à l'accueil).
- Le mot HOME : la maison est une icône seule 48 × 48.
- « RECORD ! » n'est plus écrit que dans le titre : les badges de la plaque d'argent, de la carte AURA et de la carte MOTEUR sont masqués
  (⚠ on ne sait donc plus LEQUEL des trois records est tombé — voir questions).
- La légende « VERSÉS AU COMPTE » au-dessus du montant (le compte dessous suffit) ; le cadre vert à coin coupé ; les filets entre les chiffres.
- La cause de la mort REVIENT (elle était masquée par charte4 `display:none!important`) : petite, grise, seulement sans record.
- Couché : `#mNew` (la caisse gagnée, déjà masquée sur téléphone par le script) est masquée.

## POUR LE SOCLE
- La maison 48 × 48 à côté d'un `.big` 64 px : alignées par le BAS (le brief demande 48 × 48 ; « même hauteur sur une rangée » aurait donné 48 × 64).
- Le motif « corps par crans selon une longueur » (`calc(32px - 8px*clamp(0,var(--n) - 8,1) …)`) évite les unités de conteneur (iOS 15) : réutilisable.

## POUR LES AUTRES
- transitions : `c6-transitions` laissait les anciens délais d'entrée de `#mDead` (390-660 ms, k6Avant) gagner par spécificité ; ils sont
  réécrits ICI (c6-pause-fin), rien n'a été touché là-bas.
- `html:not(.c6) .hNxC6{display:none}` est la seule règle de mon bloc qui ne commence pas par `html.c6` (elle protège `?ui=5`).

## RESTE / QUESTIONS
- LA PAUSE (`#tPanel`) : pas commencée.
- Non vérifié : i7debout 375×667 (calculé : ~560 px de contenu pour 635 ; sous 620 px de haut les touches deviennent collantes sur fond d'encre),
  joueur neuf / auto-école quittée (« REPRENDRE », 9 lettres → 16 px), fin de campagne, édition POKI (`.mObj.aFig`), `#nameEntry`, planche-contact.
- À trancher : (1) dire QUEL record est tombé (argent / aura / moteur) par une couleur ou un mot sous le titre ? (2) la maison en 48 × 64
  pour égaler REJOUER ? (3) debout, il reste ~90 px vides au-dessus des touches sur 844 px (REJOUER volontairement en bas, sous le pouce).

---
# LA PAUSE (#tPanel) — refonte charte 6 (2026-10-14, 2e mission pause-fin) — commit c093303 + suivants

## Fait
- Tout le CSS est à la FIN de `<style id="c6-pause-fin">` (après l'écran de fin, qui n'est pas touché), préfixe `html.c6 #tPanel #tpIn` (deux id : domine les
  anciennes règles k4/k6 sans !important ; seul `.tpRow>.tp` en a besoin, l'ancienne règle étant !important).
- Voile = `rgba(11,13,18,.88)` uni, aucun flou, aucun dégradé, plus de trame ni de magenta. Panneau `#tpIn` : encre `--c6-e0`, filet blanc 2 px (inset), tranche noire 4 px.
- Le DOM ne change PAS : mise en place par `grid-area` (`.tpRow` en `display:contents`). Les intertitres « LA PARTIE » et « REGLAGES » sont masqués.
- Debout : feuille collée en BAS (sous le pouce) : PAUSE · résumé (AURA violet / MOTEUR / NIVEAU, sans boîte) · réglages en une colonne · RECOMMENCER | QUITTER (1fr chacune, 48 px, sans icône) · REPRENDRE pleine largeur 64 px, 24 px.
- Couché : panneau centré 718 × 244 (844×390), titre à gauche, résumé à droite, réglages en 2 colonnes (4 lignes = 2×2 ; 5 avec VOIX = 2+2+1), en bas : RECOMMENCER + QUITTER à gauche (icônes seulement ≥ 800 px de large), REPRENDRE (or, 48 px, 16 px) à droite, aligné sur la colonne de droite.
- Lignes de réglage = la peau EXACTE de `#mSet` (c6-pages) : 48 px, plaque e1, filet sourd e3 2 px, icône `.pxi` 2, libellé 10 px, ON = face blanche + patin d'encre, OFF (`b.bascule.ko`) = encre + filet blanc + patin blanc, sélecteur = encre + filet blanc 2 px, blanc à l'appui. Couché étroit (≤ 700 px) : écarts 8, sélecteurs 8 px (mêmes valeurs que c6-pages).
- UNE seule façon de reprendre : REPRENDRE (le ⏸ est caché par `body.hTp` pendant la pause, Échap reste) ; plus de lingot animé (`k4Lingot`), plus de glissé de la feuille à la sortie (`#tPanel.sortant #tpIn{animation:none}` : seul le voile s'efface). Entrée : cascade c6Entre de 30 ms (titre 0, résumé 30, réglages 60, touches 90).
- JS (1 ligne, `panSync`, ~52769, gardée par `html.c6`) : « POUCE HAUT EN VOL » → « POUCE HAUT » (clé `TR` déjà ajoutée par c6-pages) ; `?ui=5` garde l'ancien libellé.

## RETIRÉ / DÉPLACÉ
- Les intertitres LA PARTIE et REGLAGES ; la livrée tricolore sous PAUSE ; le résumé à coins coupés ; le rouge de QUITTER (la confirmation `modale` le met en `pb-red` : c'est elle qui est destructrice) ; le reflet du lingot ; les icônes des deux touches en debout.
- Rien de supprimé côté script : `panSync`, `panTapHandler`, `repriseCompte` intacts (le 3-2-1 de la reprise marche).

## Vérifié (banc `ui/banc/pause-fin/pause.cjs`, journaux `pause1.log` / `pause2.log`, captures `shots/pause-fin/apres/pause-*.png`)
- couche 844×390 FR : ⏸ ouvre la pause (paused=true) ; un interrupteur (SON) passe ON → OFF, IMAGE RAPIDE → NETTE, POUCE HAUT MONTE → PLONGE, et reviennent ; REPRENDRE → paused=false, la course repart (3-2-1) ; RECOMMENCER (fenêtre de confirmation → CONFIRMER) relance une course (started, pas gameOver, pause fermée) ; QUITTER (confirmation) → écran de fin `#mDead.on`.
- couche, i7couche 667×375 (FR + EN), debout 390×844 (FR avant le raccourci du libellé, EN après) : rien ne défile (`#tPanel` 390/390, 375/375, 844/844), `s.boutons()` 0 problème, 0 débordement de libellé, 0 erreur JS (seul bruit : musique interrompue `ERR_ABORTED`). Corps relevés : 16 · 10 · 8 (+ 24 REPRENDRE debout).
- Regardé à l'œil : pause-couche, pause-couche-reglages-bascules, pause-i7couche-en, pause-debout, pause-debout-en.

## NON VÉRIFIÉ
- i7debout 375×667 (calculé : REPRENDRE 276 px de mot sur 311 ; RECOMMENCER 136 px sur 151 par touche) ; `?ui=5` (toute règle est `html.c6`, le JS est gardé : à voir à l'écran) ; la pause avec VOIX (5 lignes : classe `sansVoix` absente) ; autres langues que FR/EN (ES/DE/ZH : « RECOMMENCER » = 11 lettres à 10 px dans 159 px debout, devrait tenir) ; pause pendant l'auto-école ; la fenêtre de confirmation elle-même (autre zone).

## À TRANCHER
- (1) Les 4 lignes (sans VOIX) donnent 2 × 2 couché ; avec VOIX, une ligne seule en bas à gauche : acceptable, ou VOIX dans le résumé ? (2) REPRENDRE en 48 px couché (la place manque pour 64 sur 375 px de haut) contre 64 px debout. (3) Aucun mot d'aura nulle part : le résumé affiche le CHIFFRE d'aura seul, légende « AURA ».

## POUR LE SOCLE
- Le motif « deux colonnes de lignes en `grid-auto-flow:row` + `grid-auto-rows:48px` » et la peau de `.tp.ligne` identique à `#mSet .mLigne` : si un jour les réglages complets sont dans la pause, partager ces règles.

## POUR LES AUTRES
- `html #tpIn` (l'ancienne règle couchée, ~3697) pose `grid-template-rows:auto auto auto auto 1fr` : je la neutralise par `grid-template-rows:none` dans mon bloc ; ne pas la réintroduire.

---
# FIN DE PARTIE v2 — règles de 6 h (2026-10-14, ~6 h-7 h, commits 05fcb78 + 2b1056c sur ui/pause-fin)
⚠ NON VÉRIFIÉ À L'ÉCRAN : charge du Mac 138 → 255 → 313-450 (consigne PILOTAGE : aucun navigateur). Tout est fait EN CODE, calculé, syntaxe 0 erreur, garde OK.

## Fait
- LISIBILITÉ : le pixel seulement pour le titre (16) et les gros chiffres (argent 32/24/16, aura 24/16, bande 16, REJOUER). Tout le reste (cause, « COMPTE : », légendes
  AURA / NOUVEAU MOTEUR / MULTI MAX…, MEILLEUR, presque, en-tête / texte / pied du défi, badges RECORD !) = `var(--sans)` 13 px 700 capitales (nom du moteur et texte du défi 15 px 800). Plus aucun 8 px.
- RECORDS (mFill, gardé par `c6f`) : `rec` exige `RUNX.best0>0`, `recA` exige `CHA.rec>0` (auraMax d'avant la partie), `recM` exige `RUNX.engAvant>0`. À la 1re partie : ni titre
  « NOUVEAU RECORD ! », ni badge. Les badges restent (Sacha) mais DANS LE FLUX : au-dessus du montant, sous la légende AURA / NOUVEAU MOTEUR → le titre ne peut plus les toucher.
  `partieRecord()` (utilisé par explode) n'est PAS touché : hors zone.
- CARTES (c6 seulement, `?ui=5` garde l'ancien HTML) : AURA compacte pleine largeur (légende à gauche, chiffre violet à droite ; MEILLEUR seulement si > la partie ; pas de carte à 0).
  MOTEUR seulement si moteur NOUVEAU (`eN`, vignette 3D 96 × 64, 72 × 48 en couché étroit, plus de marges négatives : elle ne sort plus de sa carte, `overflow:hidden`) ou si « presque » (`pr`,
  carte `.sans3d`, pas de canvas → aucun rendu GPU). La ligne « RECORD PALIER n » (record non battu) disparaît. Sans carte du tout : `#mHero.vide`.
- PHRASE COUPÉE : le presque = UNE phrase (`presqueTxt + nom`, sans flèche) pleine largeur sous la vignette, `text-wrap:balance`.
- DEBOUT : `#mHero` en `display:contents` ; l'argent prend la place libre (`flex:1 0 auto`) → plus de vide au-dessus de REJOUER (12-16 px). SE (≤ 720 px de haut) : écarts 12.
- COUCHÉ : plus de grille couplée → `flex-flow:column wrap`, `.mEsp` (0 × 100 %) force la 2e colonne. Gauche : verdict, argent, aura, bande ; droite : moteur, défi, touches (en bas, `margin-top:auto`).
  Couché étroit (≤ 720) : bande en 2 × 2 (« FRENESIE » 13 px n'entre pas dans un quart de 258 px).

## Calculs faits (à confirmer à l'écran)
- SE debout 667 : ~586 px de contenu au pire (moteur + presque + défi). 844×390 : gauche ≤ 278, droite ≤ 308 sur 337. 667×375 : gauche ≤ 316, droite ≤ ~330 sur 343 (le cas le plus serré :
  moteur NOUVEAU + RECORD + presque sur 2 lignes + défi sur 2 lignes). S'il déborde, la colonne de droite part en 3e colonne : c'est LE point à regarder en premier.

## Banc prêt (non lancé)
- `ui/banc/pause-fin/fin-p1.cjs avant|apres` : UN navigateur, scénarios A (1re partie, + un moteur), B (record d'argent battu sur best 100, moteur record, $ 128 k / aura 12 400),
  C (aucun record), U (`?ui=5`) ; 6 formats par redimensionnement (375×667, 390×844, 430×932 et couchés, marges 59/34 · 59/21 · SE 0), dsf 3 ; mesure : textes < 11 px, badges qui touchent
  le titre, vide au-dessus de REJOUER, canvas hors carte, chevauchements, audit des touches ; captures dans `ui/shots/pause-fin/p1/`.
- « avant » = servir `git show 4007550:"VERSION PRINCIPALE/index.html"` sur le port 8517 (la copie du scratchpad a été effacée), puis `node fin-p1.cjs avant` ; planche `fin-avant-apres.png`
  = `B.planche([{f:'.../avant-A-15-debout.png'},{f:'.../apres-A-15-debout.png'}], ...)`.

## À trancher
- Le MOTEUR en « presque » sans moteur nouveau : j'ai gardé une carte compacte sans 3D (c'est la raison de relancer) ; Sacha voulait-il AUCUNE carte moteur dans ce cas ?
- La carte AURA disparaît à 0 (backlog b06) : OK ?
- `partieRecord()` (explode, hors zone) compte encore la 1re partie comme un record : la fanfare/raillerie de l'explosion peut diverger de l'écran de fin.
