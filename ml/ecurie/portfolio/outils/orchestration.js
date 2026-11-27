/* ===== LES TRACES DES ORCHESTRATIONS (27/11/2026, Sacha : « il faut qu'on garde des traces de tous les process, pour un portfolio ») =====
   Une « orchestration » : un script lance une équipe d'agents (Claude Opus), chacun avec sa consigne, et chacun rend un compte rendu
   en JSON. Claude Code garde ces traces HORS git (dans son dossier de projet) et les efface au bout d'un temps : cet outil les range
   dans le dépôt, sous ml/ecurie/portfolio/orchestration/<travail>/ :
     - script.js           le script d'orchestration tel qu'il a tourné (seulement nettoyé, voir plus bas) ;
     - comptes-rendus.md   le compte rendu de chaque agent, dans l'ordre où ils ont été lancés, remis en texte lisible.
   Usage : node ml/ecurie/portfolio/outils/orchestration.js <dossier de la session Claude Code> [dossier de sortie]
     <dossier de la session> : C:\Users\sacha\.claude\projects\<projet>\<identifiant de session>, qui contient workflows\ et subagents\workflows\.
     [dossier de sortie]     : par défaut ml/ecurie/portfolio/orchestration (à côté de ce dossier outils/).
   NETTOYAGE, appliqué à tout ce qui sort (le dépôt GitHub est public) :
     - un nom Windows de PC (DESKTOP-XXXX, en majuscules ou minuscules) devient « le-xeon » ;
     - une chaîne qui ressemble à une clé ou à un jeton (sk-ant-…, ghp_…, github_pat_…, « api key = … ») devient « [retiré] » ;
     - une adresse e-mail devient « [adresse retirée] » ;
     - un chemin sous C:\Users\sacha\AppData\… (dossier temporaire de Claude Code) est raccourci en « <dossier temporaire>\… » ;
     - un détail de famille (un lien de parenté accolé à une personne ou à une machine) est retiré.
   L'outil affiche le nombre de remplacements de chaque sorte, travail par travail. Il ne lance rien, il ne fait que lire et écrire. */
'use strict';
const fs = require('fs'), path = require('path');

const SESSION = process.argv[2];
const SORTIE = process.argv[3] || path.join(__dirname, '..', 'orchestration');
if (!SESSION) { console.error('usage : node orchestration.js <dossier de la session Claude Code> [dossier de sortie]'); process.exit(2); }

/* ----- Les quatre travaux du 27/11 et le rôle de chaque agent, dit en mots simples (tiré des phases de chaque script) ----- */
const TRAVAUX = [
  { dossier: 'construction', wf: 'wf_403c6fab-ee7', titre: 'La construction de ml/evolution (la sélection naturelle des bots)',
    roles: [
      [/^architecte$/, 'architecte : écrit le contrat entre les modules (INTERFACES.md), sans coder aucun module'],
      [/^module:(.*)$/, 'constructeur du module « $1 » : écrit le code et ses tests, en parallèle des trois autres'],
      [/^integrateur$/, 'intégrateur : assemble les modules, écrit le programme maître evoluer.js et ses essais de bout en bout'],
      [/^relecture:(.*)$/, 'relecteur « $1 » : relit le travail des autres et relève les défauts, sans les corriger'],
      [/^correcteur$/, 'correcteur : corrige les défauts relevés par les trois relecteurs et relance les tests'] ] },
  { dossier: 'journal', wf: 'wf_04e2d37c-894', titre: 'Le journal de bord du portfolio',
    roles: [
      [/^ecrire:(.*)$/, 'rédacteur du chapitre « $1 » : écrit le chapitre depuis git, les documents et les journaux'],
      [/^verifier:(.*)$/, 'vérificateur du chapitre « $1 » : recontrôle chaque chiffre, date et citation, et corrige le fichier'],
      [/^sommaire$/, 'auteur du sommaire : le fil du récit, la frise, le registre des impasses, les pièces à montrer'],
      [/^critique$/, 'critique : cherche ce qui manque encore au dossier et tire des chiffres au hasard pour les recontrôler'] ] },
  { dossier: 'images', wf: 'wf_3d7af170-d44', titre: 'Les images et la lisibilité du journal',
    roles: [
      [/^image:(.*)$/, 'auteur de l\'image « $1 » : un script qui dessine l\'image à partir des données du dépôt'],
      [/^controle:(.*)$/, 'contrôleur de l\'image « $1 » : recontrôle les données à la source, regarde le rendu, corrige'],
      [/^court:(.*)$/, 'auteur de la version courte du chapitre « $1 » : quelques lignes sans jargon en tête du chapitre'],
      [/^mise-en-page$/, 'metteur en page : insère les images dans les chapitres, écrit le lexique, met le sommaire à jour'],
      [/^jury$/, 'lecteur dans le rôle d\'un juré non programmeur : dit ce qu\'il a compris, où il se perd, et corrige en place'] ] },
  { dossier: 'finitions', wf: 'wf_207898d7-fdd', titre: 'Les finitions de ml/evolution avant la livraison au Ryzen',
    roles: [
      [/^machine$/, 'constructeur du lot « machine » : un réglage par PC, le banc qui mesure combien de courses la machine tient à la fois'],
      [/^traces$/, 'constructeur du lot « traces » : l\'arbre généalogique, le récit, la mise à l\'abri des journaux dans git'],
      [/^gestes$/, 'constructeur du lot « gestes » : les cinq gestes des enquêtes deviennent des gènes éteints à la naissance'],
      [/^relecture:(.*)$/, 'relecteur du lot « $1 » : essaie de casser le travail d\'un autre agent, puis corrige lui-même ce qu\'il trouve'],
      [/^integration$/, 'intégrateur : fusionne les notes des trois lots, lance tous les tests et une évolution d\'essai'] ] },
];

/* ----- Le nettoyage : chaque règle compte ses remplacements ----- */
const SEP = '(?:\\\\\\\\|\\\\|/)'; /* un séparateur de chemin : \\ (dans une chaîne JS), \ ou / */
/* un lien de parenté quelconque, et la façon de l'accoler à une machine (« le PC de … ») : la liste est volontairement large */
const LIENS = '(?:grands?-)?(?:parents|p[eè]res?|m[eè]res?|fr[eè]res?|s[oœ]eurs?|oncles?|tantes?|cousine?s?|famille)';
const DE_QUI = '(?:de|du|des|de la|de ses|de son|de sa|de mes|de mon|de ma|de leurs?)';
const REGLES = [
  { sorte: 'nom de PC', re: /DESKTOP-[A-Z0-9]+/gi, par: 'le-xeon' },
  { sorte: 'clé ou jeton', re: /sk-ant-[A-Za-z0-9_\-]+|ghp_[A-Za-z0-9]{8,}|github_pat_[A-Za-z0-9_]{8,}/g, par: '[retiré]' },
  { sorte: 'clé ou jeton', re: /(api[ _-]?key\s*[:=]\s*)["']?[A-Za-z0-9_\-]{12,}["']?/gi, par: '$1[retiré]' },
  { sorte: 'adresse e-mail', re: /[A-Za-z0-9._%+\-]+@[A-Za-z0-9\-]+(?:\.[A-Za-z0-9\-]+)*\.[A-Za-z]{2,}/g, par: '[adresse retirée]' },
  /* le dossier temporaire : C:\Users\sacha\AppData\Local\Temp\claude\<empreinte>\<session> (et ses variantes) */
  { sorte: 'chemin temporaire', re: new RegExp('(?:[A-Za-z]:|/[a-z])' + SEP + 'Users' + SEP + 'sacha' + SEP + 'AppData' +
      '(?:' + SEP + '(?:Local|Roaming|LocalLow))?(?:' + SEP + 'Temp)?(?:' + SEP + 'claude)?(?:' + SEP + '[0-9a-f]{16})?(?:' + SEP + '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})?', 'gi'),
    par: '<dossier temporaire>' },
  /* le même dossier, écrit à la manière de Claude Code pour nommer ses projets (C--Users-sacha-AppData-…) */
  { sorte: 'chemin temporaire', re: /C--Users-sacha-AppData-[A-Za-z0-9\-]+/g, par: '<dossier temporaire>' },
  /* rien sur la famille : un lien de parenté accolé à une personne ou à une machine disparaît ; les règles restent générales,
     pour que l'outil lui-même ne dise rien (« son parent » d'un pilote, qui est de la génétique, n'est pas touché) */
  { sorte: 'détail familial', re: /\b(son|sa|ses|leur) (fr[eè]res?|s[oœ]eurs?|m[eè]re|p[eè]re|cousine?s?)\b/gi, par: 'un proche' },
  { sorte: 'détail familial', re: new RegExp('\\ble (PC|ordinateur|machine) ' + DE_QUI + ' ' + LIENS + '\\b', 'gi'), par: 'ce PC' },
  { sorte: 'détail familial', re: new RegExp('\\b(PC|ordinateur|machine) ' + DE_QUI + ' ' + LIENS + '\\b', 'gi'), par: '[détail privé retiré]' },
];
const nettoyer = function (texte, compte) {
  let t = String(texte);
  for (const r of REGLES) {
    t = t.replace(r.re, function (m, g1) { compte[r.sorte] = (compte[r.sorte] || 0) + 1; return r.par.indexOf('$1') >= 0 ? r.par.replace('$1', g1) : r.par; });
  }
  return t;
};

/* ----- Les noms des champs des comptes rendus, en français lisible ----- */
const CHAMPS = {
  resume: 'Résumé', fichiers: 'Fichiers', fichier: 'Fichier', tests: 'Tests', problemes: 'Problèmes', ecarts: 'Écarts à la consigne',
  defauts: 'Défauts relevés', verifie_bon: 'Vérifié et jugé bon', reste: 'Ce qui reste', doutes: 'Doutes',
  affirmations_controlees: 'Affirmations contrôlées', corrections: 'Corrections', retires: 'Retiré', manques: 'Manques', verdict: 'Verdict',
  impasses: 'Impasses recensées', controle: 'Contrôle', commits_oublies: 'Commits oubliés', jugement: 'Jugement',
  en_une_minute: 'En une minute', mots_a_definir: 'Mots à définir', retouches: 'Retouches', script: 'Script', images: 'Images',
  legende: 'Légende', chapitre: 'Chapitre', donnees: 'Données', points_controles: 'Points contrôlés', erreurs_corrigees: 'Erreurs corrigées',
  defauts_de_rendu_corriges: 'Défauts de rendu corrigés', images_inserees: 'Images insérées', entrees_lexique: 'Entrées du lexique',
  compris: 'Ce que le lecteur a compris', accroche: 'Ce qui accroche', perdu: 'Où le lecteur se perd',
  titre: 'Titre', gravite: 'Gravité', preuve: 'Preuve', correction: 'Correction proposée', nom: 'Nom', etat: 'État', detail: 'Détail',
};
const nomChamp = function (k) { return CHAMPS[k] || (k.charAt(0).toUpperCase() + k.slice(1)).replace(/_/g, ' '); };

/* Remet une valeur JSON en texte : une chaîne telle quelle, une liste en puces, un objet en « Champ : valeur ». */
const enTexte = function (v, retrait) {
  retrait = retrait || '';
  if (v === null || v === undefined) return retrait + '(rien)';
  if (typeof v !== 'object') return String(v).split('\n').map(function (l) { return retrait + l; }).join('\n');
  if (Array.isArray(v)) {
    if (!v.length) return retrait + '(rien)';
    return v.map(function (x) {
      if (x && typeof x === 'object' && !Array.isArray(x)) {
        const cles = Object.keys(x), tete = cles.indexOf('titre') >= 0 ? 'titre' : null;
        /* un objet de la liste : son titre en gras s'il en a un, puis un champ par ligne, en retrait sous la puce */
        const lignes = [];
        if (tete) lignes.push(retrait + '- **' + String(x.titre).replace(/\n/g, ' ') + '**');
        for (const k of cles) {
          if (k === tete) continue;
          const val = x[k], debut = lignes.length ? retrait + '  ' : retrait + '- ';
          if (val && typeof val === 'object') lignes.push(debut + nomChamp(k) + ' :\n' + enTexte(val, retrait + '    '));
          else lignes.push(debut + nomChamp(k) + ' : ' + String(val).replace(/\n+/g, ' '));
        }
        return lignes.join('  \n');
      }
      return retrait + '- ' + String(enTexte(x, '')).replace(/\n/g, '\n' + retrait + '  ');
    }).join('\n');
  }
  return Object.keys(v).map(function (k) {
    const val = v[k];
    if (val && typeof val === 'object') return retrait + nomChamp(k) + ' :\n' + enTexte(val, retrait + '  ');
    return retrait + nomChamp(k) + ' : ' + String(val);
  }).join('\n');
};

const duree = function (ms) { const m = Math.round(ms / 60000); return (m >= 60 ? Math.floor(m / 60) + ' h ' + String(m % 60).padStart(2, '0') : m + ' min'); };
const millions = function (n) { return (n / 1e6).toFixed(2).replace('.', ',') + ' millions'; };

const total = {};
for (const T of TRAVAUX) {
  const compte = {};
  const dossierScripts = path.join(SESSION, 'workflows', 'scripts');
  const nomScript = fs.readdirSync(dossierScripts).find(function (f) { return f.endsWith('-' + T.wf + '.js'); });
  if (!nomScript) { console.error('script introuvable pour ' + T.wf); process.exit(1); }
  const script = fs.readFileSync(path.join(dossierScripts, nomScript), 'utf8');
  const run = JSON.parse(fs.readFileSync(path.join(SESSION, 'workflows', T.wf + '.json'), 'utf8'));
  const journal = fs.readFileSync(path.join(SESSION, 'subagents', 'workflows', T.wf, 'journal.jsonl'), 'utf8')
    .split('\n').filter(Boolean).map(function (l) { return JSON.parse(l); });
  const resultats = {};
  for (const l of journal) if (l.type === 'result') resultats[l.agentId] = l.result;

  /* l'ordre de lancement : celui du suivi de l'orchestration (workflowProgress), sinon celui du journal */
  let agents = (run.workflowProgress || []).filter(function (p) { return p.type === 'workflow_agent'; })
    .sort(function (a, b) { return a.index - b.index; });
  if (!agents.length) agents = journal.filter(function (l) { return l.type === 'started'; }).map(function (l, i) { return { index: i + 1, label: l.label, phaseTitle: l.phase, agentId: l.agentId }; });

  const md = [];
  md.push('# ' + T.titre + ' : les comptes rendus des agents');
  md.push('');
  md.push('Ce fichier est sorti de `ml/ecurie/portfolio/outils/orchestration.js`, à partir des traces que Claude Code garde hors du dépôt. ' +
    'Chaque agent a rendu son compte rendu sous forme de données (JSON) ; l\'outil les remet en texte, sans rien réécrire. ' +
    'Ce sont les mots des agents : ce qu\'ils affirment n\'a pas été recontrôlé ici.');
  md.push('');
  md.push('- Orchestration : `' + run.workflowName + '` (' + run.runId + '), lancée par la session principale (Claude Fable).');
  md.push('- Agents : ' + run.agentCount + ', tous du modèle ' + Array.from(new Set(agents.map(function (a) { return a.model; }).filter(Boolean))).join(', ') + '.');
  md.push('- Durée : ' + duree(run.durationMs) + ' ; jetons consommés par les agents : ' + run.totalTokens.toLocaleString('fr-FR') + ' (' + millions(run.totalTokens) + ') ; appels d\'outils : ' + run.totalToolCalls + '.');
  if (run.logs && run.logs.length) md.push('- Message de fin du script : « ' + run.logs.join(' ; ') + ' ».');
  md.push('- Le script lui-même est à côté : `script.js`.');
  md.push('');
  md.push('## Les agents, dans l\'ordre de lancement');
  md.push('');
  for (const a of agents) {
    let role = a.label;
    for (const r of T.roles) if (r[0].test(a.label)) { role = a.label.replace(r[0], r[1]); break; }
    md.push(a.index + '. ' + role + ' (phase « ' + a.phaseTitle + ' »)');
  }
  md.push('');
  for (const a of agents) {
    let role = a.label;
    for (const r of T.roles) if (r[0].test(a.label)) { role = a.label.replace(r[0], r[1]); break; }
    md.push('## ' + a.index + '. ' + a.label);
    md.push('');
    md.push('*Rôle : ' + role + '. Phase : ' + a.phaseTitle + '.*');
    md.push('');
    let r = resultats[a.agentId];
    if (r === undefined) { md.push('(aucun compte rendu dans le journal)'); md.push(''); continue; }
    if (typeof r === 'string') { try { r = JSON.parse(r); } catch (e) { /* un texte libre reste un texte */ } }
    if (r && typeof r === 'object' && !Array.isArray(r)) {
      for (const k of Object.keys(r)) {
        md.push('### ' + nomChamp(k));
        md.push('');
        md.push(enTexte(r[k]));
        md.push('');
      }
    } else { md.push(enTexte(r)); md.push(''); }
  }

  const dossier = path.join(SORTIE, T.dossier);
  fs.mkdirSync(dossier, { recursive: true });
  const scriptPropre = nettoyer(script, compte);
  const mdPropre = nettoyer(md.join('\n'), compte);
  fs.writeFileSync(path.join(dossier, 'script.js'), scriptPropre);
  fs.writeFileSync(path.join(dossier, 'comptes-rendus.md'), mdPropre);
  console.log(T.dossier + ' : ' + agents.length + ' agents, nettoyage ' + JSON.stringify(compte));
  for (const k in compte) total[k] = (total[k] || 0) + compte[k];
}
console.log('total des remplacements : ' + JSON.stringify(total));
