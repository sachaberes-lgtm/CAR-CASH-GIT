# SON — état (14/10, 12 h 15)
- Branche `son-integration` = assemblage T5 + 1 correctif (uiClic : plus de son de danger doublé à la confirmation de QUITTER/RECOMMENCER en pause — relevé par DEBUGGING) — PROPRE : syntaxe 0, garde OK, aucun nom non déclaré neuf.
  sons muets (singes, atchoum) · mixage iPhone (effets sans le −3 dB sous une musique déjà à plein) + sonie par morceau `MUS_SONIE` · frénésie sans
  trou · morts égalisées · pièces sans plafond · gammes du vol/frôlé en aller-retour + frôlé panoramique · fruits qui montent · appuis de menu qui
  chantent · SON_DUCK complété · LE VOL QUI MONTE (vent + moteur avec la durée du vol) et SE RÉSOUT à la pose · décollage sans trou · jet sans
  grésillement · pops de flamme allégés sur iPhone.
- MUSIQUE iPhone par WebAudio FUSIONNÉE (`MUS_WA`, 2c3e5bb) : allumée par défaut seulement sur iOS 17+ (session 'playback'), chien de garde → retour définitif au chemin <audio> si la musique se tait ; curseur MUSIQUE vivant, ciel léger, fondus, sonie égale, creux compressés. POUR APP STORE : protocole d'essai en 12 points dans `son/notes/muswa.md` (retour en arrière : `localStorage.cc_muswa='0'`).
- Agents en vol : 0. ZONE SON « FINIE » (audit final : rien au-dessus de mineur après le dernier correctif). Je ne relance rien pour ménager le quota ; prêt à reprendre sur un ordre de Sacha ou une ligne du BACKLOG (section SON). RÉSERVE : rien n'a été ÉCOUTÉ — guide `son/notes/ECOUTE.md` (MUS_WA sur un vrai iPhone en premier).
- POUR DEBUGGING (prévenu par message) : `eauPTick` (~l. 15952) — `let n=0;const M9=…,dr=…,cp=…;` avalé par un `//` (commit 9522ba6, présent sur origin/main) : les gouttes de la mer du JADE font une ReferenceError silencieuse, `jadeSousTick` s'arrête là. Une ligne à remettre.
- POUR INTERFACE : `facChoix` est réécrit par `ui/accueil` (a0751e8) — la règle « NORMAL valide » des sons est posée dans `modale` (titre CHOISIS TON MODE), pas dans facChoix : rien à fusionner à la main. `afficheTap` (affiches RECORDS du garage) joue encore deux `chimeNote` bruts hors banque : à remplacer par un son de la banque si vous le voulez.
  `son/coherence` : la hiérarchie des niveaux par famille + les sons qui se marchent dessus.
- Questions : Q-SON-1 à 4 converties en défauts (cap de Sacha 6 h 10 : pas de question) — voir QUESTIONS.md.
- Suite : les sons d'interface accordés aux gestes (même geste = même son sur tous les écrans) ; audit portail / boutique / carrière / REJOUER.
- POUR OPTIMISATION : `flamePop` = 4 nœuds WebAudio par pop ; cadence réduite sur téléphone (cfcfa20). La branche vol alloue encore un tableau par image (`for(const n9 of [transG,…])`, bloc des chaînes continues) — à toi si tu veux.
- Rien écouté (aucun navigateur). Blocages : aucun.
