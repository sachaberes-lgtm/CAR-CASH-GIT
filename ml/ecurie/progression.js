#!/usr/bin/env node
/* Resume de la progression de l'etape C2 (champions, notes mixtes, depenses). */
const fs = require("fs");
const path = require("path");
const dir = path.join(__dirname, "..", "labo", "journal");
const lines = f => {
  const p = path.join(dir, f);
  if (!fs.existsSync(p)) return [];
  return fs.readFileSync(p, "utf8").trim().split(/\n/).filter(Boolean).map(l => { try { return JSON.parse(l); } catch (e) { return null; } }).filter(Boolean);
};
const cer = lines("cerveaux.jsonl").filter(x => x.etape === "C2");
const val = lines("validations.jsonl").filter(x => x.etape === "C2");
const gen = lines("generations.jsonl").filter(x => x.etape === "C2");
const dep = lines("depenses.jsonl").filter(x => x.etape === "C2");
const euros = dep.reduce((s, d) => s + (d.euros || 0), 0);
const L = require("../labo/labo");
const sacres = val.filter(v => v.role === "candidat" && v.tient);
console.log("Etape C2 — credits C2: " + euros.toFixed(2) + " EUR · journal total: " + L.depenses().total + " EUR / 200");
const lastS = sacres[sacres.length-1];
console.log(lastS ? ('Champion sacre: ' + lastS.id + ' (mixte entrainement ' + ((lastS.entrainement||[])[0]) + ', record ' + ((lastS.entrainement||[])[1]) + ')') : ('Champion de depart: ' + ((cer[0]&&cer[0].id)||'(aucun)')));
if (sacres.length) {
  const v = sacres[sacres.length - 1];
  console.log("Dernier sacre: " + v.id + " (tient contre " + (v.parent || "?") + ", mixte validation " + ((v.note || {}).mixte) + ", record " + ((v.note || {}).palier_record) + ")");
}
console.log("");
console.log("Pilotes (entrainement et depart), par generation:");
console.log("id    gen  lot            mixte  palier  record  ecart  survie");
for (const c of cer.filter(x => x.lot === "entrainement" || x.generation === 0)) {
  const n = c.note || {};
  const row = [c.id, String(c.generation), (c.lot || "").padEnd(13), String(n.mixte), String(n.palier_median), String(n.palier_record), String(n.ecart_joueurs), String(n.survie_mediane_s)].join("  ");
  console.log(row);
}
console.log("");
console.log("Validations:");
for (const v of val) {
  const n = v.note || {};
  console.log((v.role || "") + " " + v.id + "  mixte " + n.mixte + "  record " + n.palier_record + (v.tient == null ? "" : ("  tient=" + v.tient)) + (v.parent ? ("  parent " + v.parent) : ""));
}

