#!/usr/bin/env node
/* LA COPIE EN LIGNE NE PORTE QUE LES SONS QUE LE JEU PEUT DEMANDER (2026-10-18, Sacha : « ne plus PUBLIER la bibliothèque des sons ») —
   appelée par vercel-build.sh sur .vercel-static/jouer, après les `rm` des outils locaux. Les fichiers restent dans le dépôt.
   Ce qui dépend des DONNÉES de Pouce bleu (musique-moteur.json) est calculé ici, avec la règle de assets/audio/pouce-bleu-jeu.js
   (PB.charge), pour que la publication suive Léo quand il range un nouveau morceau :
   1. LES MORCEAUX À PALIERS : on ne garde que les dossiers de paliers/rendus/ des morceaux RANGÉS dans Pouce bleu (place = « bleu »).
   2. LES GÉNÉRATEURS : on ne garde que les versions (direct/musique-trente-<v>.js) que les musiques 👍 de Pouce bleu rejouent.
   3. LES ÉCHANTILLONS direct/vrais/ : on ne garde que ceux que le REJEU des musiques de Pouce bleu demande (outils/vrais-jeu.json,
      écrit par `node outils/preuve-vrais/rejoue.mjs`). Cette liste est une PREUVE tant que rien ne bouge : elle porte l'empreinte des
      entrées (n°, goûts, DA, style de chaque 👍), de retouches-bleu.js, des générateurs gardés et de l'index. Si l'empreinte ne colle plus
      (Léo a ajouté un morceau…), RIEN n'est retiré de vrais/ (la copie part plus lourde, jamais cassée) et le build le dit.
   Ne fait jamais échouer la publication (sortie 0 sauf dossier introuvable) ; au moindre doute, on ne retire rien.
   Essai : node outils/publie-audio.cjs <dossier> --essai   (n'écrit rien) */
'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const M='assets/audio/music/';
const GV=[['2026-10-14T00:16:50','v3-1'],['2026-10-14T01:01:05','v3-3'],['2026-10-14T01:46:19','v3-4'],['2026-10-14T03:05:00','v3-7']]; // = pouce-bleu-jeu.js
const versionDe=e=>{if(e.v)return e.v;const t=String(e.date||'');for(const [l,v] of GV)if(t<l)return v;return 'v3-9';};
const HTML={'pal-aura-30':M+'direct/aura-30.html','pal-rubis-neon':M+'direct/rubis-de-neon.html','pal-asphalte':M+'direct/asphalte-emeraude.html'};
const lis=(dos,f)=>fs.readFileSync(path.join(dos,f),'utf8');

/* la liste de Pouce bleu, comme PB.charge */
function liste(dos){
  const P=JSON.parse(lis(dos,'musique-moteur.json')),w={};
  new Function('window',lis(dos,M+'paliers/rendus/index.js'))(w);const RF=w.PALIERS_RENDUS||{};
  const suppr=new Set(P.suppr||[]),place=P.place||{},L=[],vu=new Set();
  (P.gen||[]).forEach(e=>{const id='bleu-'+e.n,k=e.n+'|'+e.titre;if(!(e.avis>0)||suppr.has(id)||vu.has(k))return;vu.add(k);
    L.push({id,type:'genv',n:e.n,g:e.g||null,da:e.da||null,style:/^hyb:/.test(String(e.style||''))?e.style:null,v:versionDe(e)});});
  Object.keys(place).forEach(id=>{if(place[id]!=='bleu'||suppr.has(id)||!/^pal-/.test(id))return;const f=RF[id.slice(4)];
    if(f&&f.fichiers&&f.fichiers.length)L.push({id,type:'paliers',fichiers:f.fichiers.concat(f.introF?[f.introF]:[])});});
  Object.keys(HTML).forEach(id=>{if(suppr.has(id)||(place[id]&&place[id]!=='bleu'))return;L.push({id,type:'html',f:HTML[id]});});
  return L;
}
const versions=L=>[...new Set(L.filter(e=>e.type==='genv').map(e=>e.v))].sort();
const fichierVersion=v=>M+'direct/'+(v==='actuelle'?'musique-trente.js':'musique-trente-'+v+'.js');
/* l'empreinte de ce que le rejeu a vu */
function empreinte(dos,L){
  const h=crypto.createHash('sha1');
  h.update(JSON.stringify(L.filter(e=>e.type==='genv').map(e=>[e.n,e.g,e.da,e.style,e.v])));
  for(const f of [M+'direct/retouches-bleu.js',M+'direct/vrais/vrais-index.json',...versions(L).map(fichierVersion)])
    h.update(f+'\0'+crypto.createHash('sha1').update(fs.readFileSync(path.join(dos,f))).digest('hex'));
  return h.digest('hex');
}
module.exports={liste,versions,fichierVersion,empreinte};

if(require.main===module){
  const DOS=process.argv[2],ESSAI=process.argv.includes('--essai');
  if(!DOS||!fs.existsSync(path.join(DOS,'index.html'))){console.error('publie-audio : pas d\'index.html dans '+DOS);process.exit(2);}
  let L;try{L=liste(DOS);}catch(e){console.error('publie-audio : liste illisible, rien retiré ('+e.message+')');process.exit(0);}
  if(L.length<5){console.error('publie-audio : liste de Pouce bleu suspecte ('+L.length+' morceaux), rien retiré');process.exit(0);}
  let gagne=0;const rm=(f,why)=>{const q=path.join(DOS,f);if(!fs.existsSync(q))return;
    const t=fs.statSync(q).isDirectory()?(function s(d){return fs.readdirSync(d).reduce((a,n)=>{const p=path.join(d,n);return a+(fs.statSync(p).isDirectory()?s(p):fs.statSync(p).size);},0);})(q):fs.statSync(q).size;
    gagne+=t;if(!ESSAI)fs.rmSync(q,{recursive:true,force:true});};
  // 1. les morceaux à paliers : seuls les dossiers des morceaux rangés dans Pouce bleu
  const dirs=new Set();L.filter(e=>e.type==='paliers').forEach(e=>e.fichiers.forEach(f=>dirs.add(f.split('/').slice(0,-1).join('/'))));
  const R=path.join(DOS,M+'paliers/rendus');
  if(fs.existsSync(R))for(const n of fs.readdirSync(R)){const rel=M+'paliers/rendus/'+n;if(fs.statSync(path.join(R,n)).isDirectory()&&!dirs.has(rel))rm(rel);}
  // 2. les générateurs : seules les versions rejouées
  const gardeV=new Set(versions(L).map(fichierVersion));
  for(const n of fs.readdirSync(path.join(DOS,M+'direct')))if(/^musique-trente.*\.js$/.test(n)&&!gardeV.has(M+'direct/'+n))rm(M+'direct/'+n);
  // 3. les échantillons : seulement si la preuve colle
  let etat='';
  try{const J=JSON.parse(fs.readFileSync(path.join(__dirname,'vrais-jeu.json'),'utf8'));
    if(J.empreinte!==empreinte(DOS,L))etat='vrais/ : la preuve (outils/vrais-jeu.json) ne colle plus aux musiques de Pouce bleu — tous les échantillons restent publiés ; relancer node outils/preuve-vrais/rejoue.mjs';
    else{const ok=new Set(J.fichiers);const V=path.join(DOS,M+'direct/vrais');
      for(const n of fs.readdirSync(V))if(/\.m4a$/.test(n)&&!ok.has(n))rm(M+'direct/vrais/'+n);etat='vrais/ : '+ok.size+' échantillons gardés (preuve valable)';}}
  catch(e){etat='vrais/ : pas de preuve lisible ('+e.message+') — tous les échantillons restent publiés';}
  console.log('publie-audio : '+L.length+' morceaux de Pouce bleu ; générateurs gardés '+versions(L).join(' ')+' ; dossiers de paliers gardés '+dirs.size+' ; '+etat+' ; '+(ESSAI?'retirerait ':'retiré ')+(gagne/1048576).toFixed(2)+' Mo');
}
