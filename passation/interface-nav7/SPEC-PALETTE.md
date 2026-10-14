# LA PALETTE — spec convenue avec GRAPHISME (14/10, 14 h 10, décisions de Sacha)
Données (GRAPHISME, gfx-integration puis main — SHA à venir) :
- 40 peintures neuves dans COSM.peinture APRÈS les 17 existantes. pack:'palette' sur les 40 ; les 10 SECRÈTES ont en plus sec:'<id>' + ind:'<indice FR>'.
- finitions neuves gratuites g:'k' MÉTALLISÉ, g:'n' NACRE ; classes de pastille .metal .nacre sur .gSwc .ivSw .obSw .fnSw.
- PALETTE_ON (?palette=0 coupe) ; PALETTE_PACK={id:'palette',produit:'cashcar.palette40',eur:'0,99 €',n:'LA PALETTE',ids:[40 ids : 30 de la grille
  (PASTELS, FRANCS, MÉTALLISÉS × rouge, orange, jaune, anis, vert, sarcelle, azur, violet, rose, neutre) puis les 10 secrètes]}.
- palPossede() = les 40 acquises ; palDonne() = donne les 40 (après succès de shopPaye('palette') — qui refuse sur le web « BIENTÔT DISPONIBLE »).
- cosmVu(cat,d) = la vue : secrète non gagnée → {n:'? ? ?', d:<indice>, c:gris ardoise, masque:true}. GARDER l'appel dans toute liste refaite
  (gStripHabits, invListe, bqListe, objFig).
- shopOwned/bqCles excluent pack et sec du tirage du jour et du filtre « à acheter ».
- Noms ≤ 14 caractères ; « ARGENT BROSSÉ » (id argent), « CIEL D'ORAGE » (id orage).
Écran (INTERFACE, dans PEINTURES de la boutique) :
- 4 sections empilées PASTELS · FRANCS · MÉTALLISÉS · SECRÈTES, chacune 2 lignes × 5 cases (≥ 44 px, 8 d'écart), ordre de PALETTE_PACK.ids
  (ligne 1 rouge→vert, ligne 2 sarcelle→neutre) ; couché : 1 ligne de 10 si ≥ 44 px, sinon 2 × 5.
- UNE plaque d'or : « LA PALETTE · 40 COULEURS · 0,99 € » → shopPaye('palette').then(palDonne) ; acquise → état « ACQUISE » (pas d'or), chaque case
  s'équipe d'un toucher.
- Case non possédée = ESSAI sur la caisse (SHOP.prev) ; secrète non gagnée = pas d'essai, montre son indice.
- Les défis secrets s'appellent « DÉFIS » (jamais « mission ») ; toast : « DÉFI RÉUSSI · COULEUR <NOM> ». L'onglet du bas reste MISSIONS.
