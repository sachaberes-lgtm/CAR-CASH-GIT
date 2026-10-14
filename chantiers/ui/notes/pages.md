# pages — refonte de l interface, charte 6 (2026-10-14)

## Journal
- Réglages (#mSet) : le brouillon avait posé le HTML (en-tête commun, colonnes, pied) mais AUCUN CSS. Écrit dans `<style id="c6-pages">` :
  - `.c6Corps` : une colonne debout (les `.c6Col` se dissolvent, `order` : AUDIO · JEU · SAUVEGARDE), deux colonnes couché (AUDIO + SAUVEGARDE | JEU), EFFACER + version en pied sur toute la largeur.
  - Ligne = plaque d'encre 48 px, filet sourd 2 px, 8 px d'écart ; commande à droite : `b.bascule` (ON = face blanche + texte d'encre, OFF = encre + filet blanc 2 px, patin blanc), `b.valeur` (sélecteur : encre + filet blanc, sans chevron, 32 px), curseur soudé à sa ligne (`.volRow` -8 px, pourcentage au bout, poignée 12 × 24 avec zone de prise 28 × 42).
  - Pas d'or (aucune décision à prendre ici) ; rouge seulement pour EFFACER MA PROGRESSION (filet + texte, c'est la seule action destructrice).
  - En-tête `.c6Tete.plein` collant : l'overlay est la SEULE zone qui défile (sticky) ; ◀ = `.c6Ret` (data-m="back" : le routeur rend la racine d'où l'on vient).
  - Couché étroit (≤ 700 px, iPhone 7/8) : chevrons des lignes « lien » retirés, écarts à 8, sélecteurs en 8 px (« DRIVING SCHOOL » + « REPLAY » tiennent sur 263 px).
  - `?ui=5` : petit bloc `html:not(.c6)` (titre en tête, une colonne) — voir À TRANCHER.

## RETIRE / DEPLACE
- Retiré (déjà par le brouillon) : le titre `.mHead`, le dock RETOUR du bas, la plaque rouge EFFACER au milieu (devient une touche sourde en pied), le mot « VOLUME » répété (le curseur porte juste son pourcentage), « POUCE HAUT EN VOL » → « POUCE HAUT », « REVOIR L'AUTO-ECOLE » → ligne AUTO-ECOLE + valeur REVOIR (ou la prime +$ 500).
- Le chevron des valeurs (`b.valeur::after`) disparaît dans les réglages.

## POUR LE SOCLE
- Rien d'obligatoire. Les composants `b.bascule` / `b.valeur` de la charte pourraient prendre la peau « filet blanc 2 px » définie ici (c6-pages la surcharge sous `#mSet`).
- Le curseur de la charte (`.volS::-webkit-slider-thumb`, marge -10 px) est mal centré avec la zone de prise de 42 px (il faut -19 px) : corrigé sous `#mSet` seulement.

## POUR LES AUTRES
- Pause (pause-fin) : la liste de réglages de la pause (`.tpPanel`) garde ses 5 lignes ; l'écran complet #mSet n'est PAS ouvrable depuis la pause (aucune touche ne le demande). Si on veut « TOUS LES REGLAGES » dans la pause, c'est une ligne côté pause-fin + l'affichage de l'overlay sur une course en pause.

## RESTE / QUESTIONS
- « VERSION LOCALE » reste en français en anglais (`mvVer` écrit `'VERSION '+CC_VER` en dur, ~ligne 53076).
- Vérifié à l'écran : couché 844×390, debout 390×844 (FR) ; i7couche 667×375 FR ; EN couché + debout. La dernière retouche (couché étroit : écarts à 8, sélecteur 8 px) est calculée, PAS vue à l'écran. i7couche EN non passé.
- Charge machine très élevée pendant la 2e passe (> 180) : aucune autre passe de banc faite.
