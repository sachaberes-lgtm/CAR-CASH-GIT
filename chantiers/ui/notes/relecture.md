# relecture — passe à l'œil neuf, charte 6 (2026-10-14, branche ui/pause-fin)

## Tâche 1 — TOUS LES REGLAGES depuis la pause (FAIT · VU À L'ÉCRAN)
- Ligne `.tp.ligne.lien[data-a="tous"]` (`data-g="run"` : seulement en course) sous les réglages rapides de `#tpIn`, pleine largeur, chevron ▶ ; clé `TR` « TOUS LES REGLAGES » (EN : ALL SETTINGS, ZH : 所有设置).
- JS : `setPauseOuvre` / `setPauseFerme` (près de `mGo`) ; drapeau `window.__setPause`. L'overlay passe au-dessus de la pause (`body.setPause #overlay{z-index:12}`), `mGo('set')` ; le ◀ (`mTap('back')`), Échap et P le lisent ; la pause reste ouverte dessous, `paused` ne bouge jamais. À la fermeture : fondu sec 130 ms puis `panSync()` (la pause reflète les changements). Hors charte 6 : la ligne est masquée, rien ne s'ouvre.
- Vu : 844×390 et 390×844 : pause → réglages → SON coupé → ◀ → la pause dit SON OFF → remis → REPRENDRE → la course repart ; 0 erreur JS.

## Tâche 2 — relecture (banc : 4 passages ; captures `ui/shots/relecture/`, journal `relecture-journal.log`)
Corrigé : (1) pause → réglages : double affichage pendant l'entrée (fond de l'overlay en fondu) — corrigé, NON VÉRIFIÉ À L'ÉCRAN après le dernier correctif (plus de passage de banc) ; (2) missions : halo cyan sous la caisse-récompense (`.obFig`) ; (3) missions EN : orphelin « IT » (text-wrap:balance).
Voir le rapport final pour le tableau écran par écran et les défauts restants.
