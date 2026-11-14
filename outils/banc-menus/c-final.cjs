/* (2026-11-14) vérification finale avant / après : garage (INVENTAIRE), volant, trace du halo par nœud, JOUER depuis la boutique */
module.exports = async function (b) { await require('./s-inv.cjs')(b); await b.ev("window.__mGo('home');1"); await b.dormir(1500); await require('./s-volant.cjs')(b); await require('./s-trace.cjs')(b); await require('./s-jouer.cjs')(b); };
