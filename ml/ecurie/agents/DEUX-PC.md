# Deux PC — part du Ryzen (mis a jour le 27/11/2026 a 15 h 45)

Sacha a decide (15 h 39-15 h 40) : **tout le credit API restant va au Ryzen**. Fable, sur le Xeon, tourne sur l'abonnement, pas sur la cle API.

## Plafond

- Plafond general de `boucle.js` : `--plafond 200` (le plafond unique de 200 EUR).
- Deja depenses dans le journal (Xeon + Ryzen) : voir `node progression.js`.
- Chaque lancement est limite a **12 EUR** (`--budget 12`). Le superviseur relance ensuite, jusqu'au plafond de 200 EUR, **sauf** si la garde d'utilite s'arrete (ci-dessous).
- Le Xeon ne doit plus depenser de credit API.

## Commande

```powershell
cd C:\code\CASH-CAR-bots-ecurie\ml\ecurie
node boucle.js --budget 12 --tours 20 --modele claude-sonnet-5-5 --etape C2 --depuis pilote-voltige.js --critere mixte --poids-ressemblance 6 --coeurs 10 --plafond 200
```

`--coeurs 10` : demande par PASSATION.md pour le Ryzen. `chaine.js` n'est pas utilisee ici.

## Relance

- La tache `CAR CASH - Boucle Ryzen` lance le superviseur `ryzen-boucle.ps1` a l'ouverture de session, et toutes les 10 min s'il n'est plus la (`IgnoreNew`, pas de doublon).
- A l'interieur d'une session, quand un `boucle.js --budget 12` se termine **normalement** (budget atteint, 20 tours finis, etc.), le superviseur attend 2 minutes puis relance la meme commande, pour tourner jour et nuit.
- Arret rapide (moins de 2 min, souvent un probleme reseau) : attente de 10 min puis nouvel essai, sans compter comme une tranche inutile.

## Garde d'utilite (ne pas bruler le budget a vide)

Avant chaque nouvelle tranche de 12 EUR, et juste apres la fin d'une tranche, le superviseur lit le journal de cette tranche :

1. Si la boucle s'est arretee pour **patience** (4 tours de suite sans nouveau champion, `--patience 4`) : passage en `pause`, pas de relance.
2. Si **deux tranches consecutives** de 12 EUR n'ont produit **aucun** nouveau champion (`NOUVEAU CHAMPION`) : passage en `pause`, pas de relance.
3. Si le **plafond de 200 EUR** est atteint : `pause`.
4. Une coupure reseau ou une erreur au demarrage n'est pas une tranche inutile : on reessaie.

La raison est ecrite dans le journal `logs\ryzen-*.log` et rappendee a ce fichier.

## Suivre la progression

```powershell
cd C:\code\CASH-CAR-bots-ecurie\ml\ecurie
node progression.js
```

Autres fichiers : `logs\ryzen-*.log`, `ml\labo\journal\{cerveaux,generations,validations,depenses}.jsonl`.

## Tour 1 (27/11, premier lancement)

- Depart **c0025** : mixte **-2,5**, palier median 7,5, record 14, ecart 1,67 (comme les mesures de Fable).
- **c0026 a battu c0025** et a ete sacre : mixte **-1,49** a l'entrainement (palier 8, record **17**), validation sur 20 graines neuves **TIENT** (mixte -6,06 contre -6,23, record 14 contre 9).
- Autre promu note en grand : c0029, mixte -1,56, palier 8,5, record 14 (moins bon que c0026).
- Cout du tour 1 : **1,41 EUR** (6 variantes). Le commit git de ce tour a echoue (identite git absente) ; une identite locale a ete posee ensuite pour les tours suivants.

## Arret

- `Set-Content C:\code\CASH-CAR-bots-ecurie\ml\ecurie\agents\ryzen-mode.txt pause`
- ou creer `ml\ecurie\agents\STOP`
- au besoin : `Stop-ScheduledTask 'CAR CASH - Boucle Ryzen'`
