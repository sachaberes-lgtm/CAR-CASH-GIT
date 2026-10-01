#!/usr/bin/env node
/* CASH CAR — ROBLOX : construit CashCar.rbxlx à partir de src/ (pas besoin de Rojo).
   node ROBLOX/construire.js  →  ROBLOX/CashCar.rbxlx, qu'on ouvre d'un double-clic dans Roblox Studio.

   La règle des noms (la même que Rojo, pour pouvoir passer à Rojo un jour sans rien renommer) :
     src/<Service>/…            → le service Roblox du même nom
     dossier                    → Folder
     x.server.luau              → Script        (serveur)
     x.client.luau              → LocalScript   (joueur)
     x.luau                     → ModuleScript
   Les propriétés qu'un script NE PEUT PAS écrire en jeu (Technology, StreamingEnabled…) sont posées ici, dans le fichier. */
const fs = require('fs'), path = require('path');
const RACINE = __dirname, SRC = path.join(RACINE, 'src');
// node construire.js --distant <sortie.rbxlx> : la copie de TEST pilotée à distance (outils/banc.sh, outils/distant.py) — jamais le fichier du jeu
const DISTANT = process.argv[2] === '--distant';
const SORTIE = DISTANT ? path.resolve(process.argv[3]) : path.join(RACINE, 'CashCar.rbxlx');

// Propriétés posées dans le fichier : [type XML, nom, valeur]
const PROPS = {
  Workspace: [
    ['float', 'Gravity', 0],                       // la physique de la caisse est À NOUS : Roblox ne doit rien tirer vers le bas
    ['float', 'FallenPartsDestroyHeight', -50000], // on tombe loin sous la piste avant d'exploser : Roblox ne doit rien effacer avant
    ['bool', 'StreamingEnabled', false],           // la caisse va à 20 km du départ : rien ne doit disparaître en route
  ],
  Players: [['bool', 'CharacterAutoLoads', false]], // pas d'avatar à pied : on EST la caisse
  Lighting: [['token', 'Technology', 4]],           // Future : les néons et les phares éclairent vraiment (repli auto sur les petits téléphones)
  StarterPlayer: [],
  ReplicatedStorage: [], ServerScriptService: [], StarterGui: [], SoundService: [],
};
const CLASSE_DOSSIER = { StarterPlayerScripts: 'StarterPlayerScripts', StarterCharacterScripts: 'StarterCharacterScripts' };

let ref = 0;
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const cdata = s => '<![CDATA[' + s.replace(/]]>/g, ']]]]><![CDATA[>') + ']]>';
const prop = ([t, n, v]) => `<${t} name="${n}">${esc(v)}</${t}>`;

function item(classe, nom, enfants, props = [], source = null) {
  const r = 'RBX' + (ref++).toString(16).toUpperCase().padStart(8, '0');
  let x = `<Item class="${classe}" referent="${r}"><Properties><string name="Name">${esc(nom)}</string>`;
  for (const p of props) x += prop(p);
  if (source !== null) x += `<ProtectedString name="Source">${cdata(source)}</ProtectedString>`;
  return x + '</Properties>' + enfants.join('') + '</Item>';
}

function lire(dir) {
  const out = [];
  for (const f of fs.readdirSync(dir).sort()) {
    const p = path.join(dir, f), st = fs.statSync(p);
    if (st.isDirectory()) { out.push(item(CLASSE_DOSSIER[f] || 'Folder', f, lire(p))); continue; }
    const m = f.match(/^(.*?)(\.server|\.client)?\.luau?$/);
    if (!m) continue;
    const classe = m[2] === '.server' ? 'Script' : m[2] === '.client' ? 'LocalScript' : 'ModuleScript';
    out.push(item(classe, m[1], [], [], fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n')));
  }
  return out;
}

const EN_PLUS = {};
if (DISTANT) {
  const dd = path.join(RACINE, 'outils', 'distant'), src = f => fs.readFileSync(path.join(dd, f), 'utf8').replace(/\r\n/g, '\n');
  PROPS.HttpService = [['bool', 'HttpEnabled', true]];
  PROPS.ServerScriptService.push(['bool', 'LoadStringEnabled', true]);
  PROPS.ReplicatedFirst = [];
  EN_PLUS.ServerScriptService = [item('Script', 'BancDistant', [], [], src('BancDistant.server.luau'))];
  EN_PLUS.ReplicatedFirst = [item('LocalScript', 'BancDistantClient', [], [], src('BancDistantClient.client.luau'))];
}
const services = [];
for (const svc of Object.keys(PROPS)) {
  const d = path.join(SRC, svc);
  services.push(item(svc, svc, (fs.existsSync(d) ? lire(d) : []).concat(EN_PLUS[svc] || []), PROPS[svc]));
}
const xml = '<roblox xmlns:xmime="http://www.w3.org/2005/05/xmlmime" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
  'xsi:noNamespaceSchemaLocation="http://www.roblox.com/roblox.xsd" version="4">' + services.join('') + '</roblox>';
fs.writeFileSync(SORTIE, xml);
const nb = (xml.match(/<Item /g) || []).length;
console.log(`CashCar.rbxlx : ${nb} objets, ${(xml.length / 1024).toFixed(0)} Ko → ${SORTIE}`);
