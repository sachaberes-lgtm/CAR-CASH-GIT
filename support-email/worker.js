// support-email/worker.js
// Cloudflare Email Worker : reçoit chaque mail sur support@<domaine>
// et le poste dans un chat Telegram via l'API bot.
//
// Dépendances : postal-mime (parse le MIME brut).
// Secrets à définir via `wrangler secret put` :
//   TELEGRAM_BOT_TOKEN  -> token du bot @BotFather
//   TELEGRAM_CHAT_ID    -> ton chat id (ou un id de groupe/channel)
import PostalMime from "postal-mime";

function stripHtml(html) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export default {
  async email(message, env) {
    try {
      const parsed = await PostalMime.parse(message.raw);

      const from = parsed.from?.address || message.from || "inconnu";
      const fromName = parsed.from?.name || "";
      const subject = (parsed.subject || "").trim() || "(sans objet)";
      const to = message.to || "";

      let body = (parsed.text || "").trim();
      if (!body && parsed.html) body = stripHtml(parsed.html);

      // Telegram limite un message à 4096 caractères.
      const MAX = 3800;
      let text = `\u{1F4E7} Nouveau mail de support\n\n`;
      text += `De    : ${fromName ? fromName + " " : ""}<${from}>\n`;
      text += `\u00C0     : ${to}\n`;
      text += `Objet : ${subject}\n\n`;
      text += body || "(corps vide)";
      if (text.length > MAX) text = text.slice(0, MAX) + "\n\u2026(tronc\u00E9)";

      const url = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: env.TELEGRAM_CHAT_ID,
          text,
          disable_web_page_preview: true,
        }),
      });

      if (!res.ok) {
        throw new Error(`Telegram ${res.status}: ${await res.text()}`);
      }
    } catch (err) {
      // Ne jamais rejeter le mail en boucle : on log et on laisse passer.
      console.error("mail2telegram error:", err && err.message ? err.message : err);
    }
  },
};
