/* (2026-11-15, qualité · petits, relecture n2) palier 0 / 1 : qmHalo ne doit RIEN changer aux styles calculés du halo de frénésie (les règles portent :not([data-palier=0|1])). */
module.exports = async function (b) {
  const { ev, log } = b;
  const lire = `(function(){const g=document.getElementById('feverGlow');g.style.display='block';const o={};for(const p of [null,'::before','::after']){const s=getComputedStyle(g,p);o[p||'self']=[s.animationName,s.animationDuration,s.boxShadow,s.content==='none'?'':s.content,s.opacity].join('|')}return JSON.stringify(o)})()`;
  const r = [];
  for (const on of [true, false, true]) { await ev(`document.documentElement.classList.${on ? 'add' : 'remove'}('qmHalo');1`); r.push(await ev(lire)); }
  log('palier', await ev("document.documentElement.dataset.palier"), 'styles calculés identiques avec / sans qmHalo :', r[0] === r[1] && r[1] === r[2]);
  log('avec', r[0].slice(0, 300)); log('sans', r[1].slice(0, 300));
};
