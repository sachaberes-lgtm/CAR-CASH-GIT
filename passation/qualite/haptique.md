# Lot « haptique » — le Taptic préparé (16/11)

Sacha : « quand on vient de lancer la boutique et qu'on défile les voitures il n'y a pas les vibrations du scroll au début ».

## Diagnostic
- Chaque cran de la bande part de `code/interface/boutique-scene-1.js` (bqaCran, `hap(18)` = MOYEN).
- `hap()` (`code/son/curseurs.js`) appelait `Capacitor.Plugins.Haptics.impact`.
- Le plugin (`@capacitor/haptics` 8.0.2, `Haptics.swift`) fait `UIImpactFeedbackGenerator(style:)` puis `impactOccurred()`, sans `prepare()`, et relâche le générateur aussitôt. Le moteur Taptic part froid à chaque tic : CONFIRMÉ en lisant le code.
- Gardes JS cherchées : aucune n'avale les premiers tics. Le 1er appel de bqaCran d'un geste ne fait que noter la carte de départ (normal : rien n'a été franchi). L'anti-rebond (34 ms) et la garde de classe 1 (hors Capacitor seulement) ne touchent pas le premier tic. `TCTL.on` est posé au chargement (mobile-tactile.js).
- NON prouvé : que les tics perdus viennent bien du moteur froid (aucune mesure sur le téléphone). Autre piste possible, non vérifiée : WebKit qui passe la session audio en « lecture et enregistrement » (voir GardeHautParleur) — iOS coupe alors les haptiques.

## Correctif
- `JeuViewController.swift` : `HaptiqueNatif` (WKScriptMessageHandler `ccHaptique`), posé dans `poseScriptDebut` sur le contrôleur de contenu réel. Trois générateurs (léger, moyen, lourd) gardés pour la vie de l'app ; `impactOccurred()` puis `prepare()` aussitôt ; message `'p'` = préparer les trois.
- `curseurs.js` : `HAP_N` (le pont, s'il existe) et `hapPrepare(force)` (limité à une fois / 0,9 s sauf `force`). `hap()` passe par le pont s'il existe, sinon Capacitor comme avant. Mêmes seuils de force (≤12 léger, ≤40 moyen, sinon lourd), mêmes motifs.
- Préparation : ouverture de la boutique (`boutique-scene-2.js`, `veut`), touchstart de la bande, puis touchmove au plus toutes les 0,9 s.
- Tous les haptiques passent par `hap()` : tous gagnent les générateurs gardés et re-préparés (même force).
- `?sans=happrepare` : exactement l'avant (plugin Capacitor, aucun message de préparation).
- Un binaire plus ancien (mise à jour en direct) n'a pas le pont : repli Capacitor automatique.
- Ordinateur / navigateur : aucun changement (pas de `window.webkit.messageHandlers.ccHaptique`).

## Prouvé
- Le Swift compile (xcodebuild Debug, generic iOS, sans signature : BUILD SUCCEEDED).
- Banc node du routage : avec pont → messages `p,m,l,h,h,m` ; `?sans=happrepare` et binaire ancien → Capacitor `MEDIUM,LIGHT,HEAVY,HEAVY,MEDIUM` : mêmes forces, même ordre. La 2e préparation à moins de 0,9 s est bien sautée.
- Gardes : démarrage, allègement, charte OK ; `node --check` du grand script OK ; `preparer-www.js --essai` OK.

## À regarder sur le 13 Pro (build neuf obligatoire : le pont est natif)
1. Ouvrir la boutique, défiler les voitures tout de suite : chaque carte doit tiquer dès la première.
2. Même chose après 10 s sans toucher la bande.
3. Le clac du verrou (lourd + écho) : même force qu'avant.
4. `?sans=happrepare` (via --qs) : retour à l'ancien comportement, pour comparer.
5. En course : pièces et chocs, forces inchangées.
