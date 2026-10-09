# CASH CAR — Édition démo Public AI

The latest version of CASH CAR (folder `VERSION PRINCIPALE/` on `main`), in a lighter demo edition for
the Public AI network:

- **no shop** (and no missions, career or voices: it is the game's own "portal" edition, without ads);
- **Survivor mode** on every race: you and 7 police cars, every 60 seconds the last one explodes
  (except during the driving lesson of your very first race);
- marked **"ÉDITION DÉMO PUBLIC AI"** on the title screen.

**Play online:** https://car-cash-git-public-ai-edition-scar1.vercel.app/public-ai/

## How it is made

Nothing of the game is copied into git here: `public-ai/construire.js` rebuilds the edition from
`VERSION PRINCIPALE` every time (so it always carries the latest code of the branch).

```
node public-ai/construire.js          # → public-ai/jeu/  (open index.html, or double-click LANCER.bat / LANCER.command)
node public-ai/construire.js --zip    # → also public-ai/CASH-CAR-demo-public-ai.zip
```

It runs the repository's portal build (`poki-construire.js itch`), then adds the "ÉDITION DÉMO PUBLIC AI"
mark, the tab title, the armed Survivor mode, and a redirect from `/public-ai` to `/public-ai/`.
Vercel runs it on every push of the `public-ai-edition` branch (`vercel-build.sh`).
To ship a newer version of the game: rebase the branch on `main` and push.

On macOS, if `LANCER.command` is refused after unzipping, run `sh LANCER.command` in a terminal, or open
`index.html` directly.
