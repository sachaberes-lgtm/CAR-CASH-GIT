# CAHIER DES CHARGES — LA MUSIQUE DU JEU (état au 21/10/2026, pour Léo et Sacha)

Rassemblé le 21/10 à la demande de Léo (« même chose qu'avec l'esthétique des voitures, c'est pour Sacha et moi »). Sources : le code
(`VERSION PRINCIPALE/assets/audio/`, `code/son/`), `passation/` (ALLEGEMENT-MUSIQUE, ETAT-SON, SON), le JOURNAL.md, et les notes de travail
de la discussion « Musique » (octobre). Complète `passation/SON.md` (les effets sonores). Ce qui n'a pas pu être revérifié : **(à vérifier)**.

---

## 1. LES GOÛTS DE LÉO (la loi)

- **Un petit élément à la fois, validé avant le suivant.** Proposer 4 à 8 variantes COURTES (un timbre, un accord de 1-2 s, un motif de 2-4 notes) ; il choisit. Jamais un morceau entier d'un coup : à chaque fois que des morceaux complets ont été livrés d'emblée, il a tout rejeté.
- **Ses notes sont des consignes à la lettre.** Une V2 à côté seulement si la note le dit ; sinon on retouche le morceau lui-même (`direct: true`). « Affiner » ≠ « remplacer ». Aucune note mise de côté.
- **De vrais instruments, du mineur, pas « jeu vidéo ».** Ses 👍 : 14 sur 16 en mineur ou dorien, vrais instruments CC0 (piano, harpe, trompette bouchée, clarinette), basse 808/funk. Le MAJEUR sonne « jeu vidéo » ; le sifflet, le kalimba et le saxo de minuit sont refusés ; **jamais de flûte ni de lead aigu**.
- **« Surprends-moi » : de NOUVEAUX sons.** Tout ce que sort le générateur partage la même palette, et il la reconnaît ; une nouveauté sort de la DA ou apporte des timbres neufs.
- **La musique doit être complètement solide** : aucun accroc, trou, clic ou bégaiement (« sinon ça nique l'ambiance »).
- **Aucune musique avant le ciel** (l'écran titre garde ses bruitages, pas une note) — demandé deux fois (6/10, 16/10). N'y remettre rien sans l'accord de Léo ET de Sacha.
- **Basse : il l'aime, mais elle doit rester agréable sur la durée (écouteurs).** Réguler sans rien enlever ; la basse pleine = une récompense (nitro, frénésie).
- **Pas « juste plus aigu et plus rapide ».** L'intensité passe par la DENSITÉ des motifs à tempo fixe, pas par un tempo ou un ton qui montent.
- **Son jugement final est à l'oreille**, sur son matériel (casque, écouteurs Bluetooth, iPhone) : un banc qui ne reproduit rien ne prouve rien — rejouer avec SA sauvegarde.

## 2. CE QUI JOUE AUJOURD'HUI SUR LE MAIN

| Moment | Musique |
|---|---|
| Écran titre / intro 1.61 | **aucune note** (bruitages seuls, `INTRO_SON`, `?intro=musique|muet`) |
| Ciel (menu), garage | `MENU_MUS` / `musicMenuUrl()` : morceaux « Ciel et garage » (famille Lobby Chris, `atelier-son/ciel_garage.py`) ; **PREMIER MATIN** (`lobby/chris-matin.m4a`) = le lobby et l'auto-école (`ECOLE_MUS`) |
| **Course** | **POUCE BLEU seul** (`assets/audio/pouce-bleu-jeu.js`, `POUCE_JEU`) : chaque PLAY tire un morceau du générateur qui joue toute la course en suivant le MOTEUR (30 paliers). Aucune radio de repli : un morceau raté → un autre, sinon le silence |
| Frénésie | exception voulue : son propre morceau (`MUSIC_FREN`, Pouce bleu s'efface puis revient) |
| Auto-école | exception : CIEL · NIVEAU 1 (voir `pbjRegne()`) |
| Missions | écran géré à part (couche composée en direct) **(à vérifier : état après l'allègement du 18/10)** |

Après l'allègement du 18/10 (lot « musique » : −88 Mo) **ont disparu du jeu** : la radio des niveaux (`MUSIC_LIEU`, `MUSIC_CIEL`, `MUSIC_VILLE`, `?ecole=`), GLISSE v2 au Soleil de Jade, `lobby-chris/` sauf PREMIER MATIN, les rendus 8 paliers (ciel, siffleur, aura), `musique-trente-{trio,v5-0,v4-0,v3-11}`, ~31 sons de la banque. Leur code est dans l'historique git (commit 084026e1 et branches `al-musique*`).
Si `POUCE_JEU` ne se charge pas, la course joue PREMIER MATIN en boucle (avant : la radio) — **ne pas réintroduire de repli radio en course.**

## 3. POUCE BLEU — LA MUSIQUE DES COURSES

- Les morceaux qu'il a aimés (👍) du générateur ; versions FIGÉES (`musique-trente-<version>.js`), rejouées avec leur graine et leur `da`. Famille actuelle : AURA, NÉON NOIR, NUIT DE VELOURS, PENTHOUSE, GLISSE FUSION, RUBIS DE NÉON, ASPHALTE D'ÉMERAUDE (refaits à la main), ZEPPELIN D'OR (+ II new wave, + III orchestre) **(liste exacte à vérifier dans `musique-moteur.json` / la bibliothèque)**.
- `?musique=niveaux` = ancien comportement ; `?pouce=<n|id>` force un morceau ; `dbgPouce()` donne l'état.
- **Tout morceau qui joue en course doit** : passer `instruMusiqueOk` ET avoir sa fiche dans `harmonie.js` si la phrase du boost doit le suivre **(à vérifier : `harmonie.js` a été coupé à l'allègement)**.
- ⚠ **Windows (JOUER.bat = python http.server)** : les `.js` arrivent en `text/plain` et `import()` est refusé → tout nouvel `import()` de module passe par le repli `importe()` (Blob).
- `PBJ_PL` : un **plancher** (+11 dB max, bas de la montée seulement) pour que le moteur 1 ne sorte pas à −42/−50 dB, avec garde-fous court terme et crête ≤ −6 dB.
- **Dompteur de grosse caisse** (`musique-bus.js`, section 5, `?kick=0` = sans) : 11 morceaux avaient la grosse caisse 17-25 dB au-dessus.

## 4. LA GRANDE MONTÉE — comment un morceau suit le moteur

- Ses 👍 montent d'environ **+19 dB du 1er au 30e moteur** (mesuré). Jamais « tout dès le moteur 1 », jamais de régleur de niveau (AGC). Un élément nouveau par moteur + de GRANDS moments (montée, drop) tous les ~4 moteurs.
- Format recommandé des morceaux à paliers (`musique-paliers.js`, `palDecoupe`) : **12 paliers**, `moteurs: [2×6, 3×6]` (drop au moteur 13). Chaque palier change **au moins 3 choses qu'on entend**. Le palier 1 est déjà un VRAI morceau (batterie, basse, accords, motif) : les paliers ajoutent de l'énergie, jamais les instruments de base.
- Une intro de 4 mesures (`intro: 4`) peut précéder le palier voulu.
- **La musique du boost / de la nitro** : « la nitro qui colore la musique » (basse, brillance, grain saturé) a été **essayée puis ABANDONNÉE** (« enlève nitro musique augmentée »). Seule la régulation des basses reste.
- **Piège corrigé (v751)** : en boost tenu le jeu change plusieurs paliers d'un coup ; chaque grand élément appelait une MONTÉE d'une mesure — riser « en ton » (la sirène-trompette qui « apparaît, évolue ») + une fois sur trois un TROU de musique (8 %) puis crash. Le générateur est retouché AU CHARGEMENT en course (`importeAvance`) : riser en souffle, montée sans trou ; `?montee=ancien` = avant ; `dbgPouce().montee`. Les versions figées et la bibliothèque restent intactes.

## 5. PRODUIRE UN NOUVEAU MORCEAU — LES 8 BASES

1. **Grande montée** (§4). 2. **Un style = un autre artiste** : groove, harmonie, instruments, forme ET production (kit, salle, écho, saturation) changent ensemble. 3. **Univers cohérent** : électro / hybride (un seul héros vrai) / acoustique (une seule famille). 4. **La source** : vrais instruments CC0 (VSCO-2 CE, VCSL) accordés en cents ; jamais d'extrait d'un morceau du commerce (App Store) : mesurer, puis refaire. 5. **Le mix** : la mélodie vit dans 250-500 Hz = 1re source de boue ; mesurer piste par piste ; coupe-bas partout sauf basse/sub ; sous-grave sur UNE piste ; jamais d'aigu permanent. 6. **Jamais deux fois la même** : mémoire des parties. 7. **Mesurer avant de livrer** : `atelier-son/salle-repetition.js` (montée, bandes, boue, rugosité ; références = ses 👍 : sous-grave ~14 %, boue ~9 %, centre ~440 Hz). 8. **Versions figées** : avant de modifier `musique-trente.js`, le copier en `musique-trente-<VERSION>.js` et monter VERSION.
Une DA = une famille de styles sur le MÊME moteur (`DA_STYLES`, option `da` : `cashcar` = les 15 d'origine, `dubstep`, `hybride`, `atlas` = 55 genres croisés). On ne refait jamais le moteur. La culture est écrite dans `atelier-son/CULTURE-MUSICALE.md`.

**Générer « au niveau de Pouce bleu » (leçon du 16/10)** : les premières fournées (PALACE INFINI, RUBIS D'ARGENT, CAVALE LIQUIDE) rejetées : majeur, solistes de la mauvaise famille, départ trop bas (« presque inaudible »). Désormais : goûts RESSERRÉS (lofi/néon/velours, mineur, vrais instruments), puis filtre au banc d'écoute : **moteur 3 ≥ −24 dB, moteur 12 ≥ −15 dB, montée de 5 à 22 dB, répétition ≤ 0,86, mouvement ≥ 0,12, richesse ≥ 2,8**. Retirer un raté en effaçant l'entrée, jamais en 👎 (ça fausserait ses goûts appris). Pour surprendre : squelettes v6-0 hors DA cashcar (`da:'atlas'` house/neo-soul/trance, `da:'dubstep'` chillstep) avec `W.couleur={x:50}` et timbres neufs dans `retouches-bleu.js`.

## 6. LA BIBLIOTHÈQUE ET L'ATELIER

- `bibliotheque.html` + `atelier-son/` : l'outil d'écoute et de tri de Léo (👍/👎, notes ✎, catégories dont POUCE BLEU, NOUVEAUX). Serveur `atelier-son/serveur-moteur.py` (sans cache ; enregistre ses noms/suppressions dans `musique-moteur.json` = **SES données**, ne pas écraser). **Depuis le 18/10 elle n'est plus publiée en ligne** (`vercel-build.sh`, `outils/publie-audio.cjs`).
- JAMAIS sur le main (public) : les inspirations (`inspi-generateur/`, gitignoré), morceaux d'artistes du commerce.
- Retouches d'un morceau : `direct/retouches-bleu.js` (crochet `start(n,W,O)`, original intact) ; noms par `RENOMS`.
- Banc d'écoute : `~/Downloads/CAR-bancs/son/ecoute` (mesure chaque morceau aux moteurs 3/12/22/30). Chrome muet : `--disable-audio-output` (sinon l'horloge audio se fige si la sortie du Mac change).
- La musique de base de Léo est née de petits samples simples (CAHIER-MUSIQUE.md, branche `musique-2026-10`) : **REJETÉ** (ne pas y revenir) : compositions synthétisées entières (v4 chef d'orchestre), musique piste par piste, studio/générateur à dés, instruments par-dessus un vrai morceau (« robot, fade »), montées de souffle en nitro. **A PLU** : la boucle VAPEUR, GLASSY PLUCKS, la page simple façon Apple.

## 7. LA SOLIDITÉ ET LES PIÈGES DE SON

- **Pause + curseur MUSIQUE** : couper puis rallumer en pause relançait un AUTRE morceau sur le jeu figé → `MUSREP.att` (la relance attend la reprise, même morceau). L'horloge du générateur (`setInterval` 50 ms, 0,35 s d'avance) sautait des temps sur chaque gel > ~0,44 s (portails) → **avance de 1 s en course** (`?avance=.35` = avant, `dbgPouce().avance`). Un gel de ~5 s à un portail (Chrome bridé ×4) coupe encore tout (piste : TECHNIQUE).
- **La musique revient** : au retour après plus de `MUS_RETOUR_H` = 24 h avec MUSIQUE coupée → ON au volume d'usine, une fois par retour.
- **Début de partie** : un « souffle aigu + boom » dans les écouteurs Bluetooth venait du V8 du bouton JOUER, du vent moteur pendant le piqué et d'un ciel réglé très bas : tout ce qui part au JOUER claque contre un ciel très calme — **mesurer contre le niveau du ciel**.
- **Nitro qui « explose »** (17/10) : boule de feu `rugAllume` coupée (`?boule=1`), toux seule à sec (`NSEC.sous`), 2e étage une fois par appui (`NSEC.etage`).
- **Un son que Léo entend et pas le banc** : rejouer avec SA sauvegarde (clé `cashcarSave` de l'origine de l'appli Mac), jamais écrire ni supprimer `cashcarSave` sur l'origine où il joue ; tester sur une AUTRE origine (`127.0.0.1` vs `localhost`).
- Un casque rend des graves qu'un haut-parleur de téléphone ne rend pas (le ronron du nitro, 44 Hz, coupé par défaut) : toujours écouter AU CASQUE aussi.
- Au banc WebKit, le chien de garde condamne le WebAudio pendant le piqué (défaut de WKWebView) ; Pouce bleu y survit depuis v505.
- Tester « muet » en mettant un curseur à 0 puis le remettre par script = la sortie RESTE à 0 : couper par déconnexion du nœud de sortie.
- **Les sons (effets)** : règle de Sacha, un son nouveau = `sfx('famille.nom')`, jamais un `chimeNote` bricolé ; banque `sons-banque.js` (`?v=`), recettes `atelier-son/recettes.js`, cuisson `node atelier-son/cuire.js` (sans ffmpeg : `PCM=1`). Détail : `passation/SON.md`, `passation/ETAT-SON.md`.

## 8. À VÉRIFIER SUR UN VRAI IPHONE (rien ne se simule sur PC)

Le WebAudio de Pouce bleu tient-il au-delà de 15 s ? Le bouton Silencieux (MUSIQUE ON = session `playback`, coupée = `ambient`) ; la musique reprend-elle seule après verrouillage / appel / Siri ; la musique rallumée après 24 h coupe-t-elle Spotify/Apple Music ; le curseur MUSIQUE sans `MUS_WA` (volume `<audio>` verrouillé).

## 9. DROITS ET PUBLICATION (bloquants pour l'App Store, à trancher avec Sacha)

- Musiques Suno (dont une « Cover ») et voix ElevenLabs : garder la preuve d'abonnement payant.
- Sons d'origine tierce signalés (kaching, compteuse, minecraft…) : à remplacer **(à vérifier : peut-être déjà retirés)**.
- Jamais d'extrait d'un morceau du commerce dans le jeu public.

## 10. CE QUI RESTE À FAIRE / À DÉCIDER

1. Réécouter, sur le casque de Léo, la musique en course après la correction de la montée (v751) et le dompteur de grosse caisse (v713).
2. Un boost musical PAR map / par musique (Léo l'a annoncé : la phrase du boost n'existait que sur CIEL · NIVEAU 1-5).
3. Générer de nouveaux morceaux « surprenants » (hors DA cashcar) au filtre du §5.
4. `MUSIC_FREN` pointe vers `music/dark-triad.mp3`, absent (le morceau est `boucles/dark-triad.m4a`) : la frénésie ne change pas de morceau — NON corrigé exprès (à décider).
5. Candidats à retirer si on veut alléger : `lobby/garage-{atelier,huile,cle}.m4a` (8,4 Mo), `rendus/penthouse/` (3 Mo). Branche `al-musique-vrais-jeu` (253 échantillons, 4,4 Mo) à cherry-picker seulement si Sacha accepte que le générateur en direct perde ces instruments.
6. Mettre à jour les outils orphelins : `maps-ciel.html` (aperçus morts), `ROBLOX/outils/preparer-sons.js`, `atelier-son/gouts_mesures.py`.
