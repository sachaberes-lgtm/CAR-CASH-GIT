/* (2026-11-14) passage « après » : volant, petits textes de la boutique, puis les menus avec l'encoche simulée (en dernier : elle pose --cc*) */
module.exports = async function (b) { await require('./s-volant.cjs')(b); await require('./s-petits-textes.cjs')(b); await require('./s-encoche.cjs')(b); };
