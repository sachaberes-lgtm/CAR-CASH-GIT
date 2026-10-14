# SON — CE QU'IL FAUT ÉCOUTER (14/10, nuit) — rien n'a été écouté par les agents : c'est ton oreille qui tranche

Tous les changements sont sur la branche `son-integration` (fusionnée par PILOTAGE aux trains). Chacun se compare à l'ancien.

## Sur l'iPhone d'abord (le plus gros changement)
1. **La musique passe par WebAudio sur iOS 17+** (`MUS_WA`) : le curseur MUSIQUE agit, la musique est très légère au ciel du titre,
   s'efface à la boutique, monte en fondu au départ, et tous les morceaux sortent au même volume.
   À VÉRIFIER : la musique joue bien (bouton silencieux ACTIVÉ et désactivé), après un appel / Siri, après l'arrière-plan, avec SON coupé.
   Si elle se tait toute seule, le jeu revient de lui-même à l'ancien lecteur. Revenir en arrière à la main (console Safari) :
   `localStorage.cc_muswa='0'` puis recharger · état : `dbgMusWa()` · protocole complet : `son/notes/muswa.md`.
2. **Les effets ne reculent plus sous la musique sur iPhone** (+3 dB) — les pièces, poses, figures doivent mieux percer.

## En course
3. **Le moteur des paliers 17 à 30** ne monte plus en « moustique » (palier 30 : 2 203 → 691 Hz à fond). Comparer : `?genou=0` dans l'adresse
   (ou `dbgGenou(0)` / `dbgGenou(1)` à la console). Paliers 1-12 inchangés.
4. **Le vol qui monte** : plus le saut dure (et plus il y a de figures), plus le vent s'ouvre et le moteur chante haut ; tout retombe à la pose.
   Si le vent « siffle » trop : baisser le +340 Hz (`windF`, bloc des chaînes continues, commentaire « LE VOL QUI MONTE »).
5. **Les échelles** : pièces au-delà de la 11e (aller-retour sur l'octave haute + une quinte toutes les 10), figures/frôlés au-delà de 9,
   fruits qui montent (0-2-4-7), appuis rapides dans les menus qui montent la gamme.
6. **Le crissement** +5 dB (plafond `.30`, peut descendre à `.26`) · la charge du drift dans la tonalité · le rase-bord audible sur iPhone.
7. **La pluie** (ville, minuit, orage) : une boucle discrète. Couper : `PLUIE_SON=false` · niveau : `PLUIE_NIV` (.035 ; .055 plus présente).
8. **Le plongeon au Soleil de jade** : une grosse éclaboussure, plus une explosion (le plouf de Léo est gardé, plus bas).
9. **Les morts** tirées au hasard frappent au même niveau · REJOUER coupe la queue de l'explosion d'avant.
10. **La frénésie** ne coupe plus la musique à son entrée dans l'appli (fichier `dark-triad.mp3` toujours absent : repli surmultiplié).

## Dans les menus
11. Un même geste = un même son partout (valider, revenir, onglet, acheter, refus) ; plus de double son ; « IL TE MANQUE » ne fait plus deux
    « non » ; NORMAL dans « CHOISIS TON MODE » valide au lieu de sonner comme ANNULER.

## Les notes détaillées
`son/notes/` : oreille-neuve-1/2/3 (les audits), escalade, vol, coherence, gestes, transitions, moteur, glisse, horsbanque, muswa, relecture,
sonie-fichiers.tsv (sonie mesurée de chaque fichier audio).
