/* ===== LE NODE DE L'EPOQUE DANS EVOLUER.JS (28/11/2026, l'integrateur : demande n° 1 du lot « lanceurs », « evoluer.js : refuser de partir quand
   la version de Node a change ») =====
   Sans course, quelques secondes. refusNode sur des etats fabriques (pas d'epoque, meme version, autre version, --nouveau-node, --banc,
   CASHCAR_NODE_FIXE, le marqueur CHANGER-DE-NODE qui sert une fois), puis evoluer.js en vrai sur un etat d'une autre version : code 2, rien
   d'ecrit (ni verrou, ni machine.json), le texte dit la version attendue et lancer.cmd ; et lancer.cmd passe bien CASHCAR_NODE_FIXE.
   node ml/evolution/tests/node-epoque.test.js */
'use strict';
const fs=require('fs'),path=require('path'),os=require('os'),cp=require('child_process');
const ICI=path.join(__dirname,'..');
const E=require(path.join(ICI,'evoluer.js'));
let ok=0,ko=0;
function verdict(nom,vrai,detail){if(vrai){ok++;console.log('ok   '+nom);}else{ko++;console.log('RATE '+nom+(detail?' : '+detail:''));}}
const BAC=fs.mkdtempSync(path.join(os.tmpdir(),'cashcar-node-epoque-'));
function etat(nom,node){
  const d=path.join(BAC,nom);fs.mkdirSync(d,{recursive:true});
  if(node!==undefined)fs.writeFileSync(path.join(d,'population.json'),JSON.stringify({format:'evolution-population-1',generation:3,vivants:[],
    epoque:{courses:'aaaaaaaaaaaa',note:'bbbbbbbbbbbb',depuis:0,composants:node===null?{}:{node:node}}}));
  return d;}
const cfgDe=d=>({dossierEtat:d,dossierChampions:path.join(d,'champions')});
const V='v24.22.3',SANS={};
try{
  verdict('pas de population : pas de refus',E.refusNode(cfgDe(etat('vide')),{},{env:SANS,version:V})===null);
  verdict('une epoque sans Node : pas de refus',E.refusNode(cfgDe(etat('sans-node',null)),{},{env:SANS,version:V})===null);
  verdict('meme version : pas de refus',E.refusNode(cfgDe(etat('meme',V)),{},{env:SANS,version:V})===null);
  const dA=etat('autre','v24.22.1');
  const r=E.refusNode(cfgDe(dA),{},{env:SANS,version:V});
  verdict('autre version : refus qui dit les deux versions, lancer.cmd et le marqueur',typeof r==='string'&&/v24\.22\.1/.test(r)&&/v24\.22\.3/.test(r)&&/lancer\.cmd/.test(r)&&/CHANGER-DE-NODE/.test(r)&&/--nouveau-node/.test(r),r);
  verdict('autre version et --nouveau-node : pas de refus',E.refusNode(cfgDe(dA),{nouveauNode:true},{env:SANS,version:V})===null);
  verdict('autre version et --banc : pas de refus (le banc ne note aucun pilote)',E.refusNode(cfgDe(dA),{banc:true},{env:SANS,version:V})===null);
  verdict('autre version sous lancer.cmd (CASHCAR_NODE_FIXE) : pas de refus',E.refusNode(cfgDe(dA),{},{env:{CASHCAR_NODE_FIXE:'x'},version:V})===null);
  fs.writeFileSync(path.join(dA,'CHANGER-DE-NODE'),'');
  const dits=[];
  const r2=E.refusNode(cfgDe(dA),{},{env:SANS,version:V,dire:t=>dits.push(t)});
  verdict('le marqueur accepte une fois, est efface et le dit',r2===null&&!fs.existsSync(path.join(dA,'CHANGER-DE-NODE'))&&dits.some(t=>/CHANGER-DE-NODE/.test(t)),JSON.stringify(dits));
  verdict('le marqueur ne sert qu\'une fois',typeof E.refusNode(cfgDe(dA),{},{env:SANS,version:V})==='string');
  verdict('l\'option --nouveau-node est lue',E.lireOptions(['--nouveau-node']).o.nouveauNode===true&&E.lireOptions([]).o.nouveauNode===false&&/--nouveau-node/.test(E.USAGE));
  /* en vrai : un etat d'une version qui ne peut pas etre celle-ci */
  const dV=etat('vrai','v1.2.3');
  const env=Object.assign({},process.env);delete env.CASHCAR_NODE_FIXE;
  const t0=Date.now();
  const p=cp.spawnSync(process.execPath,[path.join(ICI,'evoluer.js'),'--etat',dV,'--travailleurs','1'],{cwd:path.join(ICI,'..','..'),env:env,encoding:'utf8',timeout:60000});
  const sortie=(p.stdout||'')+(p.stderr||'');
  verdict('evoluer.js sur un etat en v1.2.3 : code 2, en moins de 20 s',p.status===2&&Date.now()-t0<20000,p.status+' '+sortie.slice(-400));
  verdict('... le refus est dit (attendue, trouvee, lancer.cmd)',/REFUS DE PARTIR/.test(sortie)&&/v1\.2\.3/.test(sortie)&&sortie.includes(process.version)&&/lancer\.cmd/.test(sortie),sortie.slice(-400));
  const restes=fs.readdirSync(dV).filter(n=>n!=='population.json'&&n!=='sortie.log');
  verdict('... rien d\'ecrit dans l\'etat (ni verrou, ni machine.json, ni journal)',restes.length===0,restes.join(', '));
  const L=fs.readFileSync(path.join(ICI,'lancer.cmd'),'latin1');
  verdict('lancer.cmd passe CASHCAR_NODE_FIXE avant de lancer evoluer.js',/set "CASHCAR_NODE_FIXE=%NODE%"\r\n"%NODE%" "%ICI%evoluer\.js"/.test(L));
}finally{try{fs.rmSync(BAC,{recursive:true,force:true});}catch(e){}}
console.log(ok+' / '+(ok+ko));
process.exit(ko?1:0);
