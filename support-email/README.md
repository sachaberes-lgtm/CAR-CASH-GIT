# Support email → Telegram

Pipeline : chaque mail reçu sur `support@<ton-domaine>` est posté dans ton chat
Telegram, en temps réel, sans serveur à toi (tout tourne chez Cloudflare, plan
gratuit, ton PC peut être éteint).

## Ce qui est déjà fait (dans ce dossier)

- `worker.js` — l'Email Worker : parse le mail, formate un message, l'envoie au bot Telegram.
- `wrangler.toml` — config du Worker.
- `package.json` — dépendance `postal-mime`.

## Ce qu'il reste à faire

### Étape 1 — Acheter le domaine (toi, 5 min)

1. Crée un compte sur https://dash.cloudflare.com (gratuit).
2. **Registrar → Register domain** → achète `cashcar.app` (ou celui que tu as choisi).
   Cloudflare vend au prix coûtant, sans marge.
3. Le domaine est automatiquement actif sur Cloudflare : rien à configurer côté DNS.

### Étape 2 — Créer le bot Telegram (toi, 2 min)

1. Ouvre https://t.me/BotFather → `/newbot`.
2. Donne-lui un nom (ex. « Cash Car Support ») et un username (ex. `cashcar_support_bot`).
3. BotFather te donne un **token** (`123456:ABC...`). Garde-le.
4. Ouvre ton bot (lien fourni par BotFather) et envoie-lui un premier message
   (n'importe quoi) pour l'activer.
5. Obtiens ton **chat id** : ouvre https://t.me/userinfobot → `/start`, il te donne ton id
   (un nombre, ex. `123456789`).

### Étape 3 — Déployer (moi, dès que tu me donnes token + chat id)

```bash
cd support-email
npm install
npx wrangler login
npx wrangler deploy
npx wrangler secret put TELEGRAM_BOT_TOKEN
npx wrangler secret put TELEGRAM_CHAT_ID
```

### Étape 4 — Brancher l'adresse support sur le Worker (moi / dashboard)

Dashboard Cloudflare → **Email → Email Routing** :
1. Activer Email Routing (il proposera d'ajouter les enregistrements MX/DNS — accepter).
2. **Routing rules → Custom addresses** → ajouter `support@cashcar.app`.
3. Comme destination, choisir **le Worker** `cashcar-support-mail` (au lieu d'un
   forward vers une boîte mail).

## Tester

Envoie un mail à `support@cashcar.app` depuis n'importe quelle adresse : il doit
apparaître dans ton Telegram en quelques secondes.

## Notes

- Le Worker log les erreurs mais **ne rejette jamais** le mail : pas de boucle de
  rebond, pas de mail perdu silencieusement.
- Le corps HTML est nettoyé et converti en texte ; les mails > 3800 caractères sont
  tronqués dans le message Telegram (le mail complet reste consultable si tu actives
  en plus un forward de sauvegarde vers ton Gmail).
- Pour une **copie de sauvegarde** dans ton Gmail en plus du Telegram, ajoute une
  ligne `await message.forward("sachaberes@gmail.com");` en tête du handler.
