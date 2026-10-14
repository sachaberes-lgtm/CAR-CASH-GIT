# NOTES — etal-orbite (passe graphismes, 14/10) — EN ORBITE + CRYPTOCITY
Branche `gfx/etal-orbite` : 3 commits, UNIQUEMENT des valeurs dans le bloc `ÉTALONNAGE · EN ORBITE` (4 lignes `Object.assign`). 3 ouvertures navigateur, 0 erreur JS. Banc : `banc/etal-orbite/` (orbite.cjs, bloc.txt, pose.py, lstar.py = mesure de L* sur les captures). Planche : `shots/etal-orbite/planche.png` (dernier relevé = valeurs de l'avant-dernier commit ; voir doutes).
Couples → ambiances (vérifié à l'image, `niveau.ciel`) : matin `espaceMatin` · midi `espace` · soir `espaceSoir` · PLUIE DE SATELLITES = `espace` (même ambiance que midi, niveau `satellites`/hard) · CRYPTOCITY `bullrun` (NIV_CRYPTO).
Les lignes sont posées après toutes les définitions ; `espaceMatin`/`espaceSoir` sont des copies figées d'`espace` : chaque ligne redit donc ce qu'elle change.
## Produits mesurés (uniformes) sat / con / expo : matin 1,12/1,25/.76 · midi (= satellites) 1,12/1,25/.73 · soir 1,10/1,25/.74 · crypto 1,21/1,25/.9 — sous les plafonds (orbite : sat ≤ 1,15, con ≤ 1,32 ; crypto ≤ 1,25 / 1,28).
## Ce qui a changé
- Cause du pourpre : le rebond du sol (`hemiG`), les ombres (`sh` + `DA.sh` sarcelle), `hi` jaune-vert et `vigC` violette. Remplacés par un bleu de Terre plus gris, ombres bleu-nuit neutres (`daSh:0`, `daHi:0`), vignette quasi noire neutre. La route sort béton gris (v0 : 126,118,118 → L* 50 au 1er essai, trop clair).
- Expo .78 → ~.70 : béton éclairé L* 38-46 (midi/satellites 42-45, matin 38-41, soir 21-25), voiture nette. Mesuré avec lstar.py sur le tiers bas hors voiture.
- MATIN : clé or pâle [1,.9,.72] (le 1er essai [1,.88,.66] donnait un sable trop orangé), Terre en rebond, env sans prune.
- MIDI : clé blanche [1,.98,.94], env bleu de Terre.
- SOIR : clé ambrée adoucie [1,.78,.58] (le [1,.62,.36] donnait une route terre cuite saturée), kick rose et env prune retirés ; béton brun sombre.
- CRYPTOCITY : zénith/milieu plus pâles (jZen [.2,.42,.82], plus de cobalt), brume or pâle, rebond vert retiré (`fillC` neutre : le vert de hausse reste aux tours), con 1,24 → 1,18, vignette neutre, `sunI` 1,6 → 1,2 et `hemiI` .8 → .62 (la route était à L* 57-60 : béton trop clair).
## Doutes
- Derniers réglages (midi expo .72 → .69, soir .64 → .70, crypto expo .9 → .88 + sunI 1,2/hemiI .62 déjà vus en variante A) posés sans nouvelle capture (3 ouvertures consommées) ; l'effet attendu est de ±3 L*.
- La face éclairée vs ombrée du béton : la route est un plan, la lumière y est uniforme ; la seule ombre vue est celle de la voiture (noire). Rien à faire par valeurs.
- La route d'orbite est maintenant béton gris-beige ; le violet venait bien de la LUMIÈRE (hemiG/sh/vigC), pas de la route : rien à signaler à l'agent route.
- Lueur chaude en haut à gauche (soleil hors champ) : voulue, pas touchée. La Terre reste un bleu assez vif (shader planète, hors périmètre).
