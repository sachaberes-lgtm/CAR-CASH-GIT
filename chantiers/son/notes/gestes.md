# LES SONS D'INTERFACE ACCORDÉS AUX GESTES — session SON (2026-10-14, agent « gestes »)

Copie : `/Users/sachaberes/cash-car/son/wt/gestes` (branche `son/gestes`). Rien de fabriqué : seulement des ids existants, des rôles `uiClic`, des `vol`.

## La règle de lecture (ce qui s'empile, ce qui se remplace)
Un appui = jusqu'à trois couches, de nature DIFFÉRENTE, qui ne se marchent pas dessus :
1. le CONTACT (`ui.appui`, −49 LUFS, au `pointerdown`, sur `APPUI_SEL`) — l'enfoncement ;
2. la RÉPONSE du doigt (`uiClic(rôle)`, −35…−40) — ce que fait le bouton ;
3. la TEXTURE de l'écran qui bouge (`ui.volet` −43, `ui.feuille` −43, `ui.feuilleFerme` −44) — plus basse que le clic de 3 à 8 dB.
Une texture de mouvement se range SOUS le clic (c'est le « tick + swish » d'iOS) : gardé.
Un RÉSULTAT sémantique (`ui.equipe`, `ui.achat`, `ui.ok`, `ui.erreur`, `ui.carte`, `garage.bascule`, `ui.debloque`) dit la même chose que le clic en plus précis : il PASSE DEVANT, le clic se tait (la vibration `hap(8)` reste).

## Geste → son (état d'arrivée)
| geste | son | rôle / id |
|---|---|---|
| valider / JOUER / REJOUER / VALIDER / COPIER | appui principal | `uiClic('')` = ui.tap |
| aller vers (écran, vitrine, monde, panneau) | tick clair | `uiClic('nav')` |
| revenir / fermer / ANNULER / ◀ / HOME / voile d'une fenêtre | deux ticks qui descendent | `uiClic('retour')` |
| interrupteur | quinte qui monte / descend | `uiClic('on')` / `uiClic('off')` |
| onglet, segment, filtre, famille, cycle de réglage (IMAGE, LANGUE, POUCE) | tick + froissé | `uiClic('onglet')` |
| refus / verrouillé / pas assez d'argent / bientôt | non-non sourd | `uiClic('refus')` (+ toast SANS ui.erreur) |
| destructif (EFFACER, QUITTER, RECOMMENCER, PASSER l'auto-école) | tock grave | `uiClic('danger')` |
| ouvrir une fenêtre `modale()` / `shopPop` | souffle + tock | `ui.modale` |
| ouvrir / fermer un panneau (pause, carrière, inventaire, niveaux) | souffle monte / descend | `ui.feuille` / `ui.feuilleFerme` |
| changer d'écran (volet) | souffle stéréo | `ui.volet` / `ui.voletSort` |
| feuilleter un objet de la boutique | carte (−37) ou bascule de la caisse | `ui.carte` {vol:−3} / `garage.bascule` |
| équiper | loquet + quinte | `ui.equipe` |
| acheter | tiroir-caisse (+ tampon « À TOI ! ») | `ui.achat` + `ui.tampon` {t:.266} |
| toast coche / croix | deux notes qui montent / non-non | `ui.ok` / `ui.erreur` |
| glisser un curseur | un cran par dizaine | `ui.curseur` |

## Inventaire des écrans (avant)
- ACCUEIL #mHome / MODES / RÉGLAGES #mSet / MORT #mDead / BOUTIQUE #mShop : tout passe par `mTap` → `uiClic(mRole9(a))` (play/replay = ''; back/menu = retour; interrupteurs = on/off selon l'état À VENIR; q/lang/ctl/volh = onglet; wipe = danger; le reste = nav) + `ecranWipe` (volet). Cohérent. Trouvé : `tuto` et `shopRestore` = clic nav + toast coche (ui.ok) → deux sons ; `shopSoon` sans voiture = « BIENTÔT DISPONIBLE » en `nav` alors que le même mot au garage (`.gVerrou`) fait `refus` ; VALIDER son nom (record, `commitName`) = MUET.
- PAUSE #tPanel : `gearOpenHandler` nav + feuille ; chaque ligne → `uiClic` en fin de `panTapHandler`. Trouvé : TOUS LES RÉGLAGES = `uiClic('nav')` (setPauseOuvre) PUIS `uiClic('')` (fin du gestionnaire) → DEUX clics.
- FENÊTRES `modale()` : ouvre `ui.modale`, bouton = danger si rouge, '' si `v` vrai, sinon retour, puis `ui.feuilleFerme`. Trouvé : CHOISIS TON MODE → NORMAL (`v:0`) sonnait comme un ANNULER (retour) alors que c'est une validation.
- TOASTS : coche → ui.ok, croix → ui.erreur. Trouvé : « IL TE MANQUE » = `uiClic('refus')` + toast croix (`ui.erreur`) → refus ET erreur (deux « non-non sourd » identiques) ; code cousin réussi = ui.ok + caisse.debloquee ; achat shopPop réussi = `uiClic('ok')` (rôle inexistant → ui.tap) + ui.ok.
- GARAGE (hub) : HOME/◀ = retour ; RÉGLAGES/MISSIONS/BOUTIQUE/NIVEAU/OFFRES/rappel = nav ; ŒIL = on/off ; CACHER = onglet ; onglets du hub = onglet ; coffre = nav + feuille ; JOUER = '' + lâcher. Trouvé : tiroir des NIVEAUX = `feuilleOuvre` (ui.feuille) PUIS `sfx('ui.feuille')` à la ligne suivante → la feuille sonnait deux fois.
- GARAGE boutique / console : ◀ ▶ (`garageGo`) = nav PUIS ui.carte ou garage.bascule ; vignette de la bande (`.gT`, `.fnC`) = nav PUIS (ui.equipe si à toi) PUIS (ui.carte ou bascule) ; vignette du rail (`bqEssaie`) = nav PUIS bascule / feuille / fig.vrille ; ÉQUIPER (`gEquip`, habillage) = `uiClic()` PUIS ui.equipe ; « IL TE MANQUE » = refus + erreur ; figure achetée = ui.achat SANS le tampon que l'achat d'une peinture a (même tampon à l'écran, deux sons) ; toucher ÉQUIPÉE / un objet déjà équipé = MUET (juste `hap`).
- INVENTAIRE : onglets = onglet, ✕ = retour, objet = ui.equipe (+ bascule). Trouvé : le bouton rouge du plateau (`atlPresse`) ouvre/ferme l'inventaire en `ui.equipe` alors que le COFFRE fait nav (ouvrir) et ✕ retour (fermer) : le même geste, deux sons, et « équiper » dit le contraire de ce qui se passe.
- CARRIÈRE #carr : fermer/mondes = retour ; monde = nav ; niveau = '' ; verrouillé = refus + toast. Cohérent.
- MISSIONS (nœuds) : suivre / ne plus suivre = on / off ; verrou = refus ; récompense = nav. Cohérent.
- Hors périmètre (laissé) : menu desktop legacy (`body.touch #overlay>*{display:none}`), étal des fruits (outil de réglage), burn-out du garage, volant/nitro de course, ESC clavier de l'inventaire.

## Ce qui a été corrigé (3 commits sur `son/gestes`)
1. Fenêtres / toasts / accueil : `toast(h,muet)` (nouveau 2e paramètre) ; « IL TE MANQUE » = refus SEUL ; code cousin = déblocage SANS ui.ok ; achat d'une caisse en € (shopPop) = `ui.achat` (le rôle inexistant `'ok'` retombait sur ui.tap) ; CHOISIS TON MODE : NORMAL valide au lieu de « reculer » ; BIENTÔT DISPONIBLE (boutique de l'accueil) = refus comme au garage ; `tuto` / `shopRestore` : le toast ok remplace le clic nav.
2. Pause + mort : TOUS LES REGLAGES = un seul clic nav (c'était nav puis appui principal) ; VALIDER son nom (record) = appui principal (muet).
3. Garage : drapeau `GSON9` — feuilleter (◀ ▶), vignettes de la bande, rail de la boutique : si une action a sonné (équiper, bascule, carte, geste de l'atelier, figure) le tick nav se tait, il ne part que quand rien d'autre ne sonne (la vibration reste) ; équiper un habillage = ui.equipe seul ; toucher un objet déjà équipé / ÉQUIPÉE = un tick (muet avant) ; figure achetée = tampon comme une peinture ; tiroir des niveaux = une feuille (pas deux) ; bouton rouge du plateau = nav / retour comme le coffre.

## Laissé, et pourquoi
- clic + volet / clic + feuille : deux couches de natures différentes, la texture est 3 à 8 dB sous le clic (table `coherence`) → gardé (c'est le « tick + swish »). Le retirer rendrait chaque navigation sourde.
- `ui.appui` (contact) + clic au relâcher : voulu par la session précédente (« l'enfoncement »).
- `afficheTap` (affiche RECORDS du garage) : `uiClic()` + deux `chimeNote` bruts (659/988 Hz, hors banque) : un son maison que je ne remplace pas (fabriquer = hors mission) ; à décider avec INTERFACE (l'affiche est quasi morte).
- ESC clavier de l'inventaire / du garage : desktop seulement, silencieux ; menu desktop legacy : caché sur tactile.
- Entrer dans l'atelier par JOUER avec une caisse à l'essai : `garageLaunch` clique ÉQUIPER (ui.equipe) en plus du tap et du lâcher — c'est le « partir avec la caisse affichée », laissé.
- `facChoix` est réécrit par la branche `ui/accueil` (a0751e8) : je n'y ai PAS touché ; la règle « NORMAL valide » vit dans `modale` (titre `CHOISIS TON MODE`), ligne que cette branche ne modifie pas.
- Banc : aucun navigateur lancé (consigne) ; vérifié par syntaxe + garde burn-out + lecture des chemins.
