# Hors banque + pluie (session SON, 2026-10-14, branche son/horsbanque)

Méthode : pour chaque appel direct (chimeNote / noiseBurst / subBoom / oscillateur), vérifier s'il joue avec SONV2 vrai, chercher qui l'a posé
(`git log -S` : tous les commits sont signés du même compte, seul le commentaire daté dit qui voulait quoi), puis garder / remplacer / gater.

## Sort de chaque appel direct

| Appel | Joue avec SONV2 ? | Sort | Pourquoi |
|---|---|---|---|
| `heistFire` (l. 37965) | non, inatteignable | laissé | Le décollage au double-tap a été RETIRÉ le 2026-09-25 (« la jauge ne s'ARME plus »). Seul appelant : le crochet de banc `dbgTakeoff`. Le double-tap actuel est `veqDouble` (`veqSaut` + figures), qui passe par la banque. |
| `afficheTap` (l. 42386) | oui (toucher d'une affiche au garage) | REMPLACÉ (810eee4) | Deux `chimeNote` 659/988 (587/880) fixes par-dessus `uiClic`, hors tonalité. L'affiche tinte toujours (design de Léo) : `sfx('ui.ok')` (deux notes claires qui montent, key1), repli = les deux cloches d'avant. |
| `impactSnd` (campagne NUAGES 5, poursuite) | oui | REMPLACÉ (0011662) | Le « tink » de tôle (noiseBurst .07) toutes les 0,13 s sous le feu : `sfx('debris.tole',{vol:-6})` (même usage −6 dB que le déblayage du garage, l. 44493), repli noiseBurst. |
| `tirSnd` (poursuite) | oui | gardé | Le « piou » néon est dans le brief de la poursuite (« piou arcade », carré qui plonge, gain .028 ≈ −31 dBFS crête) ; aucun équivalent en banque. |
| `panneSnd` (campagne VILLE 6) | oui | gardé | La coupure / le retour du courant (scie qui s'effondre + disjoncteur) n'a pas d'équivalent : la banque n'a que `panne.gresille` (le vacillement AVANT), déjà joué. 3 fois par niveau, gain .07 (sous la famille). |
| `fumeTick` (toux du moteur) | oui | gardé | Le moteur qui tousse (noiseBurst grave 260-420 Hz, .09-.13) est la mécanique de la campagne (fumée → toux → broute) ; `mort.arret` est la mort, pas la toux. Grave : l'iPhone ne le joue presque pas. |
| `PARIS.murT` (l. 15367) | oui (carrière PARIS ; Paris est sorti du JOUER) | gardé | Frottement du mur de Paris, porté de la branche de Léo : design de Léo. Bruit lowpass 2,6 kHz de 100 ms (pic .10 à .26 selon l'angle), ordre de grandeur de `plot`/`porte` ; pas d'équivalent de frottement continu. |
| `smashPig` (l. 31401) | non, inatteignable | laissé | `introD` n'est plus jamais mis à vrai (`setupIntroPig` le remet à faux, le largage de la tirelire n'existe plus). Code mort. |
| `debSiffle`, `foudreHum`, `klaxon` | oui (orbite, campagne VILLE 5 / 19) | gardés | Préavis sonores calés sur le temps d'attente (`DEB_T`, `T`) ; aucun équivalent en banque (une banque ne sait pas durer exactement T). Gains .04-.045 ≈ famille fx. |
| `nitroWhoomp`, boost, burn-out du garage | oui | NON TOUCHÉS | Voulus par Léo / intouchables. |
| reste (`blip`, `flowSnd`, `rewardSfx`, `trickPop`, `thud`, `boomSnd`, `coneSnd`, `mCompteSon`, `addAura` titré, `chaineAura` muet…) | non | rien | Déjà morts avec la banque (retour avant le son direct, ou `muet=SONV2`) : vérifié par lecture des appelants. |

À écouter : le `debris.tole` à −6 dB sous le feu (7 touches / s). S'il crépite trop : `vol:-9` ou un garde-temps de 0,26 s sur `CAMP.hitT`.

## La pluie (fc6e6f5)

- `pluieG` : bruit rose bouclé 3 s → passe-haut 1 400 Hz (Q .7) → passe-bas 7 500 Hz (Q .4) → gain → MASTER. Créé UNE fois dans `initAudio`
  (juste après le sifflement d'air), `porte(pluieG,MASTER)` : débranché tant que la consigne est nulle (9e porte de `dbgVu`, nommée « pluie »).
- Consigne dans la boucle des sons continus, après `whG` : `PLUIE_NIV × max(LVL.pluie, parisPluie()) × dk × (1 − .85 JEAU.k) × (1 − .6 cloudInS)`,
  fondu `stt` .4 s (.08 à la mort), 0 sous .02, 0 si `mode==='boom'` ou `gameOver`. Coupée à la pause (liste des chaînes) et à `endGame`.
- Interrupteur : `PLUIE_SON=true` (false = comme avant). Aucune houle pour la mer de jade.
- NIVEAU : l'audit donnait « gain .0075 ≈ −46 dBFS », les deux ne vont pas ensemble. Mesuré hors ligne (même algorithme de bruit rose Kellett normalisé,
  mêmes biquads) : bruit rose normalisé = −11,9 dB RMS ; après 1,4-7,5 kHz = −21,3 dB RMS ; avec .0075 → −63,8 dBFS RMS (−52 crête), donc inaudible
  (le vent à 300 km/h est à −56). J'ai tenu la cible −46 dBFS RMS : `PLUIE_NIV=.055`. Pour le niveau de l'audit à la lettre, mettre .0075 ;
  pour plus discret, .035 (≈ −50). Un seul bouton.
- ⚠ Écoute nécessaire : un souffle 1,4-7,5 kHz permanent ressemble à « le bruit parasite » de `nuages.ambiance` retiré le 08/10 (Léo). Ici il ne vit que
  sous un rideau de pluie visible, et −46 RMS est 17 dB sous le moteur seul. Si Léo le trouve gênant : baisser `PLUIE_NIV`, pas supprimer la logique.
