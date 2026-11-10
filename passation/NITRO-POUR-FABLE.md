# CASH CAR — LE NITRO « FLAMME ET MÉCANIQUE » : DOSSIER POUR CLAUDE FABLE (2026-11-10)

Sacha (créateur du jeu, avec Léo), le 10/11 : « **j'aime bien le nitro flamme et mécanique max** — prépare tout en fichier, prêt à être perfectionné par Claude Fable. »
Ce dossier est tout ce qu'il faut pour reprendre sans rien redemander. Le travail d'avant est fait, **mesuré et commité** ; il reste la part que seul toi sais faire :
le **goût** (l'oreille de Sacha), la **justesse du modèle physique** et les **idées** qui font qu'un son ne ressemble à rien d'autre.

## 0. Pour démarrer (à coller à Fable)
> Lis `passation/NITRO-POUR-FABLE.md` en entier, puis travaille dans le worktree `~/cash-car/generateur-moteur` (branche `generateur-moteur` ; crée `nitro-fable` depuis elle).
> Lance `node VERSION\ PRINCIPALE/atelier-son/nitro-fable/verifier.cjs --png` : tous les critères doivent passer avant ET après ton travail. Écoute (tu ne peux pas : Sacha le fera)
> en lui donnant le lien de la page `moteur-moderne-nitro.html`. Commite après chaque amélioration qui marche, pousse, ne touche ni au jeu (`code/`, `index.html`) ni aux fichiers de Léo.

## 1. LA MISSION
Perfectionner **`nitro-physique.js`** (le preset **Forge** d'abord) : un nitro **très mécanique** avec une **flamme physique**, qui **varie selon l'appui**, qui **va avec le moteur cyber de Léo**
et qui **ne fait jamais mal aux oreilles**. Pas le brancher dans le jeu (c'est écrit dans `BRANCHEMENT-JEU.txt`, à poser plus tard).
**À confirmer auprès de Sacha** : « flamme et mécanique max » — Sacha n'a pas dit lequel des réglages. Par défaut = **Forge** (le plus mécanique) ; **Brasier** (le plus flamme) et **Doux** sont là pour comparer.
La famille d'avant (`hybride:*` = mécanique + les flammes en bruit de `nitro-fusee.js`) existe aussi dans le studio : Sacha a peut-être aimé celle-là, lui demander.

## 2. CE QUE SACHA A DIT — LES MOTS EXACTS, ET CE QU'ON EN A TIRÉ
Tout est de lui, en conversation, sur deux jours. **Ses mots comptent plus que tes idées.**
1. (9/11, le départ) « Je veux vraiment les meilleurs sons de moteur qui existent. Je veux que ça soit **ASMR, Lo-Fi Girl**, que le nitro il fasse un **bruit de flamme rond, crépitant, ardent, comme des charbons,
   comme de la braise**. Mais aussi comme **les flammes de l'enfer, avec un grondement un petit peu maléfique**. (…) un moteur **chaud, agréable à écouter**. On approche de l'hiver (…) les gens puissent s'imaginer
   être **au coin du feu de la cheminée de Noël en étant sous la couette** (…) **Le moteur il doit être réconfortant, le nitro il doit être jouissif mais calme**, et que ça se marie bien avec la musique, qu'il y ait
   des **irrégularités, vraiment comme des flammes**, comme un crépitement infernal, mais calme et doux. Et lorsqu'il y a des virages, le son des pneus doit être agréable, lourd, doux, ASMR. »
2. « Le simulateur, on comprend rien, c'est mal foutu, fais un truc plus simple avec juste des beaux sons de nitro. Plusieurs variétés et **pas de crépitement bizarre, les clac-clac qui marchent pas**. »
3. « Pour le moteur : une petite touche **cyber, jeux vidéo**, tu **triches pour rajouter de la satisfaisance**. (…) **pas trop fort, pas trop agressif, pas trop répétitif**, limiter les crépitements étranges. **Harmoniser
   avec la route, les roues, la musique**. Que tout se confonde dans un maximum d'harmonie. »
4. « **Pour le nitro, il faut qu'il ait une matière** qui va très bien se superposer au bruit du moteur. Là, **on dirait du vent, on dirait que je sors ma tête de la fenêtre**. Et c'est **complètement flou**.
   **Sois plus rigoureux** dans ton choix parce que là, il ne va même pas avec le moteur. »
   → le nitro en bruit filtré est mort. Un nitro doit avoir une HAUTEUR et un RYTHME accrochés à la note du moteur (voir §5).
5. « Le moteur de base, c'est **Cyber**. Du coup on va se rattraper sur le moteur en mode mécanique, **sur le nitro, avec les flammes et tout**. »
6. « **Nitro bien mécanique, flamme, variation en fonction de à quel point on appuie.** »
7. « **Léo a push un générateur de moteur cyber. Retravaille les nitros pour bien aller avec ce moteur.** Je veux le moteur cyber et le nitro **très mécanique et flamme physique, sans que ça fasse mal aux oreilles,
   avec des variations malignes**. »
8. (10/11) « J'aime bien le nitro flamme et mécanique max. »
Sacha ne peut pas décrire un son : il dit « vent », « flou », « mal aux oreilles », « pas agréable ». **Traduis en mesures** (le §7 le fait) — mais c'est SON oreille qui juge, pas les mesures.
Autres règles de la maison : « pas IA » (interface), UNE seule police dans le jeu, **continuer sans redemander** une fois la démarche validée, **jamais de chantier dans le scratchpad**.

## 3. L'ÉTAT — TOUT EST SUR `origin/generateur-moteur` (worktree `~/cash-car/generateur-moteur`)
| Fichier (sous `VERSION PRINCIPALE/`) | Rôle |
|---|---|
| `assets/audio/moteur-vivant/nitro-physique.js` | **LE DSP** (pur, Float32). Mécanique + flamme physique + événements + garde-oreilles. Presets `forge`, `brasier`, `doux`. |
| `assets/audio/moteur-vivant/worklet-nitro-physique.js` | l'AudioWorklet (messages `{c:{f0,nit,speed,load,thr}}`, `{P}`, `{G}`, `{preset}`, `{ev:'rapport'}`) |
| `assets/audio/moteur-vivant/nitro-matiere.js` | la voix mécanique (corps, râpe, poing, plainte) — **réutilisée** par le nitro physique (`mec`) |
| `assets/audio/moteur-vivant/nitro-braise.js`, `nitro-fusee.js`, `nitro-hybride.js` | les nitros d'avant (la session `son-moteur` tient les deux premiers : ne pas les modifier) |
| `moteur-moderne-nitro.html` | **LA PAGE D'ÉCOUTE** : la page de Léo (copie, intacte) + le nitro physique. **C'est là que Sacha juge.** |
| `atelier-son/generateur/index.html` (+ `studio.js`, `studio.css`) | le studio (portfolio) : famille « Physique », couches solo/muet, réglages détaillés, graphe du nitro seul |
| `atelier-son/nitro-fable/verifier.cjs` | **LA VÉRIFICATION EN UNE COMMANDE** (§4, §7) ; `reference.json` = l'état validé ; `BRANCHEMENT-JEU.txt` = le plan pour le jeu |
| `atelier-son/generateur/mesure-cyber.cjs`, `mesure-agrement.cjs`, `mesure-pression.cjs`, `calibrer.cjs` | les mesures et la calibration des niveaux |
| `assets/audio/moteur-buche/`, `moteur-cyber/`, `moteur-moderne.html` | **LE MOTEUR DE LÉO** (sur `main`, commit `1e8da45c`). **À NE PAS MODIFIER.** |
Commits : `0ee164ee` (base), `9d3eeed7` (studio), `2cf72f0e` (atelier du nitro), `2386fd36` (fusion de `main` : moteur de Léo), `5257358f` (nitro physique), puis celui de ce dossier.

## 4. LANCER, ÉCOUTER, MESURER
```
cd ~/cash-car/generateur-moteur
python3 -m http.server 8138 --directory "VERSION PRINCIPALE"        # (ou l'entrée « studio-son » de ~/cash-car/.claude/launch.json)
node "VERSION PRINCIPALE/atelier-son/nitro-fable/verifier.cjs" --png  # ~20 s, sans navigateur ; --tous = aussi Brasier et Doux ; --reference = fige l'état
```
- **Écouter** : http://localhost:8138/moteur-moderne-nitro.html — clic pour démarrer, GAZ (↑/Z), BOOST (espace) ; rangée « NITRO PHYSIQUE » : Forge/Brasier/Doux, APPUI, MÉCANIQUE, FLAMME, NIVEAU ;
  glisser le doigt vers le haut du pad BOOST = appuyer plus fort. Palier du moteur : 30 boutons (le 11 = V8 atmo sert de référence).
- **Le studio** : http://localhost:8138/atelier-son/generateur/index.html (`?muet=1` = tout voir sans rien entendre : bancs, captures).
- **Mesurer le vrai mélange** (la bûche de Léo est faite d'oscillateurs Web Audio : impossible en Node) : Chrome sans interface par `playwright-core` (`~/.hermes/hermes-agent/node_modules`) + `/Applications/Google Chrome.app`,
  démarrer par `document.getElementById('depart').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}))`, puis lire l'analyseur `ANA` de la page (variables globales : `S`, `NPR`, `AC`, `ANA`, `GNP`).
- **Pièges** : le volet Browser masqué ne reçoit AUCUNE image d'animation (les mesures de la page y sont fausses : utiliser Chrome sans interface) ; le serveur python met les scripts en cache (changer `?v=` ou
  recharger avec une requête neuve) ; `echo "====="` casse sous zsh ; le Mac a 16 Go (≤ 3 Chrome à la fois) ; l'app peut être fermée en plein travail : **commite souvent**.

## 5. COMMENT LE NITRO EST CONSTRUIT
Contrat hôte (le worklet, ou la page, ou le jeu) : écrire `f0` (Hz : la **note de la bûche** `hz`, ou pour le moteur vivant régime×pitch÷120×cylindres), `nit` (0..1 : **à quel point on appuie**), `speed`, `load`, `thr` ;
appeler `rapport()` au passage de rapport. Sortie stéréo.
```
nit ──► fa (appui rapide) ─► fs (appui lissé = « pression »)            f0 ──► phase ──► ALLUMAGE (un événement par coup du moteur)
MÉCANIQUE  nitro-matiere (corps saturé, râpe coup par coup, poing grave, plainte) ──────────────────────────────┐
FLAMME     bruit ► rugissement turbulent (LP selon la taille de la flamme, amplitude log-normale)                 │
              ► PEIGNE de retard = 1/f0 (le tuyau amplifie la flamme aux harmoniques du moteur : l'accrochage)    ├► garde-oreilles ► LP 24 dB/oct ► tanh ► sortie
           bouffées : à chaque ALLUMAGE, P = (p0 + p1·fs^1,4)·charge·humeur du cylindre → bruit 3-9 ms, bande 180-900 Hz  │   (limiteur dynamique 2-6 kHz)
           tics de culbuteur (probabilité ∝ appui) · répliques de postcombustion au lâcher (taux ∝ chaleur accumulée)   │
ÉVÉNEMENTS clic du solénoïde, whump (taille ∝ VITESSE de l'appui), purge au lâcher, hoquet de la flamme au rapport ──────┘
VARIATIONS à chaque appui : un « caractère » tiré (couleur du rugissement ±12 %, densité des bouffées ×0,7-1,3, taille du whump) ; humeur de chaque cylindre qui dérive
```
Réglages : `P` (`DEF` dans le fichier), `mec` (préfixe `m_` côté hôte), couches `G` (mec, roar, comb, burst, tic, click, whump, purge). Tout est documenté en tête de `nitro-physique.js`.
**Pourquoi cette architecture** (l'histoire est le §12) : un bruit filtré n'a ni hauteur ni rythme, donc l'oreille ne le range pas avec le moteur (« la tête par la fenêtre »). Ici TOUT est accroché à la cadence d'allumage.

## 6. LE MOTEUR DE LÉO (À CONNAÎTRE)
La bûche du jeu (oscillateurs Web Audio, `voix-moteur.js` recopié dans `buche-du-jeu.js`) + **la mécanique du moteur vivant branchée dedans** + **la teinte cyber** (cœur light-cycle, onduleur à marches, plasma, clic de rapport)
+ la **vie du moteur** (ratés, rapports qui accrochent, virages, bosses) + un **étage de puissance** (niveau qui suit la charge, coupes anti-fatigue −4 dB à 3 kHz et −4 dB au-dessus de 5,5 kHz, creux de 60 ms au rapport).
30 paliers = 30 moteurs (« rouillé » à « trou noir »). Sa note est `hz` ; les explosions de la mécanique tombent SUR cette note. **Son boost reste celui du jeu** (Léo : « le boost on le laisse tel quel »).
Léo a écrit : « **c'est bien le moteur 1, le 2 à la limite ; après c'est du vent** » — il déteste le vent autant que Sacha. Le nitro rejoint l'étage de puissance à l'entrée du creux : il passe dans les mêmes coupes.

## 7. LES CRITÈRES (`verifier.cjs`) — ET CE QU'ILS NE DISENT PAS
Mesurés contre la mécanique + le cyber de Léo (sans la bûche), à trois paliers (2, 11, 21) : **brillance** du nitro ≤ ×1,5 celle du moteur (état : ×0,8-0,9) · **aigu** 2-6 kHz ≤ 1 % (0,6 %) · **acuité** de Zwicker ≤ celle du moteur + 0,2
· **accrochage** ≥ 70 % de l'énergie sur les harmoniques du moteur (81 %) · mélange aussi doux que le moteur · **variation** : crête 25 % → 100 % d'appui ≥ 4 dB d'écart (15 → 8 dB) · dynamique 8-16 dB (11) · niveau strictement croissant
· **non-répétition** : corrélation d'enveloppe à 1 s < 0,5 (0,06) · robustesse 10 s de sauts sans NaN ni crête > 1 · coût ≤ 120 ms/s (70 ; **objectif 60**).
Ce que les chiffres NE disent PAS : si c'est **beau**, si la flamme **ressemble à une flamme**, si la mécanique est **jouissive**, si ça **s'accorde à la musique**. Dans le vrai mélange (Chrome) le nitro Forge à plein appui fait
+2 dB sur le moteur gonflé, 0,3 % d'aigu. **Ne baisse jamais un critère pour qu'il passe** : améliore le son.

## 8. LES PISTES CRÉATIVES — CE QUE FABLE SEUL SAIT FAIRE (par ordre de valeur)
1. **La flamme est-elle une flamme ?** Aujourd'hui : bruit turbulent + peigne + bouffées. Cherche mieux : spectre d'une vraie flamme de tuyau (instabilité thermo-acoustique, modes du tuyau), « chuffing », flamme qui
   « lèche » (cf. `nitro-fusee.js` du 5e tour : corps de flamme, langues, chambre), un grésillement fin et chaud sous 3 kHz qui ne pique pas. **Garde l'accrochage.**
2. **La mécanique « jouissive »** : le tic de culbuteur, la râpe, le poing, la plainte sont corrects, pas encore *irrésistibles*. Pense à ce qui fait « tilter » (la liste du moteur vivant : crépitement au lâcher, talonnage,
   limiteur qui rebondit…) : un **talonnage de nitro** (la montée de régime après le lâcher), un **bégaiement** de l'injecteur, un **claquement** de soupape de purge net.
3. **Les variations malignes** : lier la flamme à l'état du moteur de Léo (ratés, rapports qui accrochent, virages, bosses, pose : `vie-moteur.js`) — une bosse = la flamme tressaille ; un raté = une bouffée avortée ;
   un décrochage cyber = la flamme saute. Une **personnalité par palier** (30 moteurs → 30 nitros ?) en restant dans les mêmes bornes de brillance.
4. **Accorder à la musique** (Sacha : « tout se confond ») : le nitro suit déjà le moteur ; peut-il sonner juste dans la tonalité du morceau sans casser l'accrochage (octaves, quintes) ? `cleHz` du moteur vivant montre le principe.
5. **Le lâcher** : la purge + les répliques sont la signature « flamme physique » : écris-les comme une scène (une vraie postcombustion décroît par paquets, pas par un taux lisse).
6. **Stéréo/espace** : la flamme dérive d'une oreille à l'autre ; la chambre (`bloom` de `nitro-fusee.js`) ; ne jamais élargir le grave.
7. **Les presets** : Brasier et Doux sont des ébauches. Un preset « ASMR/Lo-Fi/chaleur de Noël » (le premier désir de Sacha) a-t-il sa place ?

## 9. LES PISTES TECHNIQUES (aussi bien sur un modèle moins cher, ensuite)
- **CPU (objectif 60 ms/s)** : (a) `return true` sans calcul quand `nit` est 0 depuis > 2 s (la voix mécanique et le garde-oreilles pourraient dormir) ; (b) les biquads du garde-oreilles et de la coupe finale ne
  changent pas à chaque échantillon : mutualiser ; (c) remplacer les `Math.pow` du chemin chaud par des tables ; (d) un palier de qualité (`div`) pour téléphone. **Mesurer sur l'iPhone** avant tout branchement (gouverneur thermique du 13 Pro).
- **Branchement dans le jeu** : `BRANCHEMENT-JEU.txt` (drapeau `?nitro=physique`, `NX`, 3 points d'accroche). Pas avant le oui de Sacha et de Léo.
- **Appui analogique dans le jeu** : le bouton NITRO du pouce (branche `nitro-pouce`) pourrait fournir une vraie pression ; sinon `nit` vaut 0 ou 1.
- **Studio** : `atelier-son/generateur/` (portfolio, design « la veillée » : prune-suie, miel/rose-braise/tisane/lilas, Young Serif + Hanken Grotesk) — l'ajouter à la liste des nitros est fait ; garder le design cohérent.

## 10. RÈGLES, PIÈGES, À NE PAS TOUCHER
- **Ne modifie pas** : le jeu (`code/`, `index.html`, `sw.js`), `assets/audio/moteur-buche/`, `moteur-cyber/`, `moteur-moderne.html` (Léo), `nitro-braise.js`, `nitro-fusee.js` (la session `son-moteur`).
  Ajoute À CÔTÉ. Léo pousse sur `main` : refais `git fetch origin` avant de commencer, fusionne `origin/main` sans jamais forcer.
- **Du son dans le navigateur de test = jamais** pour le jeu ; pour les pages d'atelier, `?muet=1` (studio) ou Chrome sans interface (la page de Léo n'a pas de muet).
- **Un commit après chaque amélioration qui marche**, poussé (`git push`) ; le travail non commité est perdu si l'app se ferme. Branche `nitro-fable` depuis `generateur-moteur`.
- **Mesure avant/après** à chaque changement : `verifier.cjs` ; garde `reference.json` à jour SEULEMENT quand Sacha a validé à l'oreille.
- **Ne baisse pas un seuil pour qu'il passe.** Si un critère te semble faux, dis-le à Sacha, explique, propose.
- Les noms et les commentaires du code sont en **français**, une section s'ouvre par `/* ===== LE TITRE (date, qui : « la demande ») ===== */`, jamais de `//` au milieu d'une ligne (`/* … */`).
- Le DSP reste **PUR** (ni DOM ni nœud audio) : Node le rend, un worklet le joue.

## 11. LIVRER (la liste)
1. `node verifier.cjs --tous` : tout vert ; `--png` : REGARDE les spectrogrammes (le nitro doit se poser sur les raies du moteur, sans panache clair au-dessus de 3 kHz).
2. Teste la page `moteur-moderne-nitro.html` en Chrome sans interface (pas d'erreur, `NPR`/`ANA` lisibles) et le studio.
3. Commit + push sur `nitro-fable` ; mets à jour `atelier-son/generateur/LISEZ-MOI.md` et ce dossier (§3 et §12).
4. **Donne à Sacha le lien cliquable** : http://localhost:8138/moteur-moderne-nitro.html (règle de la maison : toujours finir par un lien de test) et dis-lui précisément quoi écouter (un appui léger, un plein appui, un lâcher, un passage de rapport).

## 12. L'HISTOIRE DES DÉCISIONS (pourquoi le nitro est comme il est)
- **Nitros 1-2 (`nitro-vivant`, `nitro-braise`)** : du bruit filtré, joli mais sans hauteur : « du vent ». Mesuré : 16 % de l'énergie sur les harmoniques du moteur (≈ le hasard).
- **Nitro à matière (`nitro-matiere`)** : calé sur la cadence d'allumage (`f0`), 75 % sur les harmoniques. Mais mesuré **plus aigu que le moteur** (centroïde 667 Hz contre 354 ; 6,7 % à 2-6 kHz contre 0,1 %) : « pas agréable » →
  coupure à 24 dB/octave, râpe plus grave, stéréo, respiration : 463 Hz, 1 %. *Leçon : un nitro n'est jamais plus brillant que le moteur.*
- **Hybride (`nitro-hybride`)** : la mécanique + les flammes de `nitro-fusee.js` (bruit). La flamme n'est pas accrochée au moteur (lock 62 % au lieu de 80).
- **Physique (`nitro-physique`)** : la flamme est modélisée DANS le tuyau (peigne accordé sur la note) + bouffées cylindre par cylindre + événements mécaniques + garde-oreilles. 75-90 % d'accrochage, jamais plus brillant que le moteur,
  caractère qui change avec l'appui, variations qui ne se répètent pas. **C'est l'état à perfectionner.**
- **Niveau** : le premier branchement dans la page de Léo faisait le nitro **15 dB trop fort** (mesuré dans le vrai mélange) ; recalé à ~+2 dB sur le moteur gonflé. *Leçon : toujours calibrer le niveau dans le vrai mélange.*
- **Deux défauts trouvés par le vérificateur** puis corrigés : la saturation finale laissait passer 1,09 ; le coût CPU (92 ms/s) tombé à 70 en mettant en cache les constantes de lissage (mêmes valeurs, un `exp` de moins par échantillon).
