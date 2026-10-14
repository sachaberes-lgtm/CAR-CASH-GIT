# Session SON : glisse (2026-10-14) : branche son/glisse, audit oreille-neuve n°3 §1, §4, §5, §6
Calcul : son/banc/glisse/plouf.js (RMS 200 ms estimé, bruit blanc filtré, sans écoute).
1. Plongeon de Jade (jadeEauVol) : plouf de Léo gardé (subBoom + 2 noiseBurst), gains ÷~3 et dosés par k9 ; ordi −17,6…−14,7 -> −25,8…−22,3 (iPhone −21…−18 -> −29…−26) ; nuage.entre et nuage.sort retirés (−36/−42, doublons) ; flaque.eau dosée −6+6k ; duckT .15+.25k. Sortie −23 -> −30…−26. Ricochet −25 -> −33 (+ flaque −3).
2. driftChargeSnd : f × 2^(sonTonSuit._t/12), gain .010+.006 lv (−3 dB).
3. Crissement course : min(.30, drift*.20*(.5+min(1,v/380))) : +5,6 dB à drift .4, +4,9 à plein drift. Burn-out (burnSon) intouché.
4. raseSnd : TEL_NATIF seulement, bande 520 Hz, gain ×1,5.
Laissé : à écouter (niveaux estimés) ; cap du crissement baissable à .26 ; la banque `table.tsv` de cohérence n'est pas mise à jour (lignes 16388/16400/16413 : nuage.entre/sort ne sont plus appelés là).
