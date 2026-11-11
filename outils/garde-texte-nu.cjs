#!/usr/bin/env node
/* LA GARDE DU TEXTE NU (2026-11-11, Sacha : « bug récurrent ici, règle ça définitivement » — du CSS affiché en toutes lettres sur l'accueil).
   Deux fois en deux jours (v1444 réparée en v1447, puis v1448) un bloc de CSS a été collé APRÈS le </style> de son morceau : hors balise,
   le navigateur l'écrit comme du texte au milieu de la page. Rien ne le voyait : ni l'assembleur (il recolle des octets), ni la garde du
   démarrage (elle ne lit que les <script>).
   Cette garde lit index.html comme le navigateur : elle retire les <style>, les <script>, les commentaires HTML et les balises, et REFUSE
   ce qui reste s'il ressemble à du code (une accolade, un commentaire CSS/JS, une règle @media…). Un texte de page n'en contient jamais.
   Appelée par l'assembleur (on le voit dès qu'on assemble) et par la garde du démarrage (rien de tel n'est publié).
   Usage : node outils/garde-texte-nu.cjs [index.html] · sortie 0 = propre, 1 = du code hors balise. */
'use strict';
const fs=require('fs'),path=require('path');
const SUSPECT=/[{}]|\/\*|\*\/|@media\b|@keyframes\b|@supports\b|@font-face\b|:root\b|!important\b/;
/* rend la liste des textes nus suspects : [{ligne, texte}] */
function texteNu(h){
  const fautes=[],n=h.length;
  let i=0,deb=0;
  const ligne=p=>{let l=1;for(let k=h.indexOf('\n');k>=0&&k<p;k=h.indexOf('\n',k+1))l++;return l;};
  const juge=(a,b)=>{const t=h.slice(a,b);if(SUSPECT.test(t)){const p=a+t.search(/\S/);fautes.push({ligne:ligne(p),texte:t.trim().replace(/\s+/g,' ').slice(0,140)});}};
  while(i<n){
    const o=h.indexOf('<',i);
    if(o<0)break;
    /* commentaire HTML */
    if(h.startsWith('<!--',o)){juge(deb,o);const z=h.indexOf('-->',o+4);i=deb=z<0?n:z+3;continue;}
    const m=/^<(\/?)([a-zA-Z][a-zA-Z0-9-]*)/.exec(h.slice(o,o+64));
    if(!m){i=o+1;continue;} /* un « < » de texte (ou <!doctype) : il reste dans le texte jugé */
    juge(deb,o);
    /* fin de la balise, guillemets des attributs respectés */
    let k=o+m[0].length,q='';
    for(;k<n;k++){const c=h[k];if(q){if(c===q)q='';}else if(c==='"'||c==="'")q=c;else if(c==='>')break;}
    i=deb=k+1;
    const nom=m[2].toLowerCase();
    if(!m[1]&&(nom==='style'||nom==='script')){ /* contenu brut : on saute jusqu'à la fermeture */
      const r=new RegExp('</'+nom+'\\s*>','i').exec(h.slice(i));
      if(!r){fautes.push({ligne:ligne(o),texte:'<'+nom+'> jamais fermé'});i=deb=n;break;}
      i=deb=i+r.index+r[0].length;
    }
  }
  juge(deb,n);
  return fautes;
}
function dit(fautes,nom){
  console.error('⛔ GARDE DU TEXTE NU — du code est posé HORS de toute balise dans '+nom+' : le navigateur l\'AFFICHE en texte sur la page.');
  for(const f of fautes)console.error('  · ligne '+f.ligne+' : '+f.texte);
  console.error('  → remettre ce bloc DANS son <style>…</style> (avant la ligne </style> du morceau de code/css/), puis  node code/assembler.cjs');
}
module.exports={texteNu,dit};
if(require.main===module){
  const f=path.resolve(process.argv[2]||path.join(__dirname,'..','VERSION PRINCIPALE','index.html'));
  const fautes=texteNu(fs.readFileSync(f,'utf8'));
  if(fautes.length){dit(fautes,path.basename(f));process.exit(1);}
  console.log('garde du texte nu : OK (aucun code hors balise)');
}
