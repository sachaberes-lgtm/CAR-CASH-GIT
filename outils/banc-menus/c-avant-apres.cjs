/* (2026-11-14) passage avant / après : volant, trace du halo, puis JOUER d'un joueur neuf depuis la boutique (--save neuf) */
module.exports = async function (b) { await require('./s-volant.cjs')(b); await require('./s-trace.cjs')(b); await require('./s-jouer.cjs')(b); };
