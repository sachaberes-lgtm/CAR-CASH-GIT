CONTRÔLE ADVERSE — lot « hudcalme » (commit eb8a22707, `qa/hudcalme`)

J'ai relu tout le diff (`git diff qualite-appareil...HEAD`) et regardé des photos. Je n'ai pas lancé de navigateur.

**Ce que j'ai vérifié**
- **Fichiers touchés** : seulement `code/gameplay/pouvoirs-grisants.js`, `code/gameplay/ramassage.js`, `code/moteur/boucle-4-effets.js`, `code/moteur/cadence.js`, plus le banc, le rapport et les photos. Aucun fichier interdit. Ni `index.html` ni `sw.js` dans le commit.
- **« Fruits »** : la lecture de l'agent est juste. Avant ce lot, le calme ne cachait que les objets marqués `p.nitro` (les fruits), `p.pow` (les pouvoirs) et `p.spin` (les jetons du final spin), aux lignes du rapport. Les pièces étaient déjà rendues le 14/11. « Les fruits devant qui disparaissent » colle mot pour mot.
- **Aucune erreur de référence à prévoir** : `spawnPickups` lit maintenant `HUD_CALME` et `CALG`. Ces deux objets sont créés dans `cadence.js` (ligne 318 de `ORDRE.txt`). La première piste est bâtie par `init.js`, à la ligne 330, donc après. Ils existent déjà au premier appel.
- **L'interrupteur rend bien l'avant** : avec `?sans=calmegarde`, `CALG.ok` vaut faux. Les trois tests (visibilité, prise, `cal9`) retombent alors exactement sur le code d'avant. `p.cap` n'est jamais posé et la ligne `CALG.was=false` ne change rien.
- **Coût par image négligeable** : une branche de plus seulement pour les fruits, pouvoirs et jetons du couloir, et `calmeCache` ne fait que des tests de champs. Ça ne joue que sur téléphone ou avec `?tel=1` (`hudCalmeTick` ne fait rien ailleurs).
- **Rien ne devient impossible à ramasser à tort** :
  - ce qui est vu à l'entrée du calme est marqué `cok=id` puis se prend normalement ;
  - si le ramassage passe avant la boucle des objets dans l'image d'entrée, `CALG.was` vaut encore faux, donc rien n'est caché ;
  - un nouveau calme fait `id++` et refait la photo, donc les anciennes marques ne valent plus.
- **La « pousse » de la sortie est correcte** : le battement des fruits et pouvoirs est appliqué avant, puis multiplié. Le jeton du spin repart de `sc0`, et son groupe est à l'échelle 1.
- **Émetteurs** : ce lot n'en ajoute ni n'en retire aucun. Les effets du calme sur l'aimant, les éclairs du citron, la flamme, la cible d'atterrissage et la gerbe du flow ne sont pas touchés.

**Défauts**
- **Moyen**, `boucle-4-effets.js:21` (le `else` de la sortie, `cgo=1`) : il reste un trou à la sortie du calme, ce que la consigne (c) interdit (« sans trou bizarre »).
  - Tout objet arrivé pendant le calme et à moins d'une demi-portée (`.5*lodR`) est perdu pour de bon, ce qui fait 310 à 450 m.
  - À basse vitesse ça représente plusieurs secondes sans fruit, pas 1 s.
  - De plus, la pause et la mort font aussi sortir du calme. Chaque pause prise en plein calme jette donc les fruits proches.
  - Correctif proposé : faire grandir tout ce qui est à plus de 100-150 m environ, et ne jeter que le très proche.
- **Mineur**, `ramassage.js:139` : avec `cal9` maintenant faux sous la garde, un fruit pris au calme remontre le croc, le jus et le coup de reins. Un pouvoir pris au même moment reste muet et invisible, car `pwrPrend` dans `pouvoirs-grisants.js:39` lit encore `HUD_CALME.on`. Les retours sont donc incohérents. Le lot « particules » doit trancher pour le jus et les étincelles.
- **Mineur**, `pouvoirs-grisants.js:430` : un portail franchi pendant le calme laisse la nouvelle zone sans fruits jusqu'à la sortie. Ensuite sa première demi-portée est perdue (même défaut que le premier). Ce n'est pas filmé.
- **Mineur, côté preuve** : sur les photos, les objets sont minuscules ou invisibles. J'ai regardé `hc-debout-2b-calme-20` (calme avec la garde) et `hc-ancien-debout-2b-calme-20` (calme sans la garde) : on n'y distingue pas un fruit qui reste. La preuve repose entièrement sur les chiffres du banc (`dbgCalmeSuivi`), qui sont cohérents avec le code.

**Doutes**
- Les pièces continuent d'apparaître au calme. C'est cohérent avec le choix du 14/11, mais c'est à confirmer par Sacha (question 1 de l'agent).
- Les marques `cgo` ne sont jamais remises à zéro avant la prochaine route neuve. C'est voulu (« ne vient plus »), mais ces fruits sont perdus pour l'économie de la partie.

**VERDICT** : fusionnable après une correction. Il faut réduire la zone jetée à la sortie (premier défaut) pour respecter le point (c) de la consigne. Le reste est mineur ou relève de choix à faire valider par Sacha.