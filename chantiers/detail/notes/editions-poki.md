# NOTES — agent « editions-poki » (passe DÉTAIL, 2026-10-14)

Zone : `poki-construire.js`, `POKI_BUILD`/`POKI`/`PORTAIL_SDK` + les branches `POKI` de `VERSION PRINCIPALE/index.html`, `<style id="poki">`, `window.dbgPoki`.
Copie : `/Users/sachaberes/cash-car/detail/wt/editions-poki` (branche `detail/editions-poki`, sans audio). Port 8705.
Scripts : `/Users/sachaberes/cash-car/detail/banc/editions-poki/` (`ctx.cjs` = contexte autour d'un motif, sans grep lent).

Règle du journal commun (ajout 1 h 45) : avant de toucher une fonction du grand script, `grep -i` dans
`/Users/sachaberes/cash-car/debug/journal-correctifs.tsv` ; après chaque commit, y ajouter ma ligne. (Journal vide à 1 h 50.)

## 0. État au départ (en cours de rédaction — complété au fil de l'eau)
- L'édition date du 04/10 ; `<style id="poki">` (l. ~6974) masque : `.mIcons`, `.mMisBtn` (sauf rhabillée garage), `#gMisAncre`, `#gMis`, `#mMis`,
  `#misFocus`, `[data-m="carr"]`, `#gCarr`, `.gLevel`, `#carr`, `[data-m="shop"]`, `[data-go="shop"]`, `.gBoutique`, `#mShop`, `#bdShop`, `#gvMis`.
- En POKI, toutes les caisses `premium` (€) / `carnet` / `carrN` / `carrV` passent à un prix en argent du jeu (bloc `if(POKI)` sous `CAR_UNLOCK`).
  Restent : `aura` (POSTER 84, défi), `pubs` (L'ÉTERNELLE, 100 pubs), `bientot` (3 caisses).
