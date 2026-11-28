'use strict';
/* ===== LES TESTS DE L'EXPLOITATION : tableau.js et etat.js (27/11/2026, etape 6 de la specification) =====
   Sur l'etat d'exemple (tests/etat-exemple, 30 generations inventees par fabriquer-etat-exemple.js), recopie dans essais/test-tableau/ :
   tableau.html s'ecrit, s'ouvre hors ligne (aucune URL http, aucun script, aucune ressource externe), porte ses 7 sections et ses courbes ;
   etat.js tient en 10 lignes (module et ligne de commande) ; resume.txt = ces lignes ; un etat vide, absent ou tronque ne fait pas planter.
   Aucune course n'est jouee. node ml/evolution/tests/tableau.test.js -> code 0 si tout passe, 1 sinon. */
const fs=require('fs'),path=require('path'),cp=require('child_process');
const EV=path.join(__dirname,'..');
const T=require(path.join(EV,'tableau.js')),ET=require(path.join(EV,'etat.js')),C=require(path.join(EV,'commun.js'));

const BAC=path.join(EV,'essais','test-tableau');
const EXEMPLE=path.join(__dirname,'etat-exemple');
let echecs=0,total=0;
function ok(nom,vrai,detail){total++;if(vrai)console.log('PASSE  '+nom);else{echecs++;console.log('ECHEC  '+nom+(detail?'\n       '+String(detail).split('\n').join('\n       '):''));}}
function essai(nom,f){try{f();}catch(e){total++;echecs++;console.log('ECHEC  '+nom+' : a leve\n       '+(e&&e.stack||e));}}

/* un dossier d'etat neuf dans le bac, et la config qui le designe (relative a ml/evolution, comme le veut le contrat) */
function preparer(nom,depuis){
  const d=path.join(BAC,nom);fs.rmSync(d,{recursive:true,force:true});
  if(depuis)fs.cpSync(depuis,d,{recursive:true});
  const rel=path.relative(EV,d).split(path.sep).join('/');
  const cfg=C.lireConfig();cfg.dossierEtat=rel;
  const fc=path.join(BAC,'config-'+nom+'.json');
  fs.mkdirSync(BAC,{recursive:true});fs.writeFileSync(fc,JSON.stringify({format:'evolution-config-1',dossierEtat:rel})+'\n');
  return {d,cfg,fc};}
function lancerEtat(fc){
  return cp.execFileSync(process.execPath,[path.join(EV,'etat.js'),'--config',fc],{encoding:'utf8',stdio:['ignore','pipe','pipe']});}
function controlerPage(nom,html){
  ok(nom+' : commence par <!doctype html>',/^<!doctype html>\n/.test(html));
  ok(nom+' : aucune URL http',!/https?:\/\//i.test(html),(html.match(/.{0,40}https?:\/\/.{0,40}/i)||[''])[0]);
  ok(nom+' : aucune ressource externe (script, link, src=, url(), @import)',!/<script|<link|\ssrc=|url\(|@import|<iframe|<img/i.test(html));
  ok(nom+' : aucun \\r',html.indexOf('\r')<0);
  ok(nom+' : balises svg equilibrees',(html.match(/<svg/g)||[]).length===(html.match(/<\/svg>/g)||[]).length);
  ok(nom+' : sections ouvertes = fermees',(html.match(/<section/g)||[]).length===(html.match(/<\/section>/g)||[]).length);
  ok(nom+' : aucun NaN ni undefined affiche',!/NaN|undefined|Infinity/.test(html),(html.match(/.{0,60}(NaN|undefined|Infinity).{0,30}/)||[''])[0]);}

/* 1. L'ETAT D'EXEMPLE COMPLET */
essai('exemple complet',()=>{
  ok('etat d\'exemple present (tests/etat-exemple)',fs.existsSync(path.join(EXEMPLE,'population.json'))&&fs.existsSync(path.join(EXEMPLE,'generations.jsonl')));
  const gens=C.lireJsonl(path.join(EXEMPLE,'generations.jsonl'));
  ok('l\'exemple a 30 generations apres la generation 0',gens.length===31&&gens[30].generation===30);
  const {d,cfg,fc}=preparer('complet',EXEMPLE);
  const t0=Date.now(),r=T.ecrire(cfg),ms=Date.now()-t0;
  ok('ecrire() rend les deux chemins',r&&r.html===path.join(d,'tableau.html')&&r.resume===path.join(d,'resume.txt'));
  ok('tableau.html et resume.txt ecrits',fs.existsSync(r.html)&&fs.existsSync(r.resume));
  ok('aucun .tmp laisse',!fs.readdirSync(d).some(x=>x.endsWith('.tmp')));
  ok('ecrit en moins de 10 s ('+ms+' ms)',ms<10000);
  const html=fs.readFileSync(r.html,'utf8');
  controlerPage('exemple',html);
  const titres=['1. Est-ce que ça apprend','2. Génération par génération','3. Le champion conduit-il','4. La population','5. La chance du meneur','6. La diversité','7. La machine'];
  ok('les 7 sections, dans l\'ordre de la spec (le coffre d\'abord)',titres.every((t,i)=>{const k=html.indexOf(t);return k>0&&(i===0||k>html.indexOf(titres[i-1]));}),
    titres.filter(t=>html.indexOf(t)<0).join(', '));
  ok('au moins 10 courbes SVG',(html.match(/<svg class="courbe"/g)||[]).length>=10,(html.match(/<svg/g)||[]).length+' svg');
  ok('la courbe du coffre a des points (4 mesures x 2)',(()=>{const s=html.slice(html.indexOf('1. Est-ce que'),html.indexOf('2. Génération'));return (s.match(/<circle/g)||[]).length>=8;})());
  const s3=html.slice(html.indexOf('3. Le champion'),html.indexOf('4. La population'));
  ok('les 15 mesures du champion dessinees',(s3.match(/class="etiquette"/g)||[]).length===15,(s3.match(/class="etiquette"/g)||[]).length+' barres');
  const pop=C.lireJson(path.join(d,'population.json'));
  const s4=html.slice(html.indexOf('4. La population'),html.indexOf('5. La chance'));
  ok('la table de population a une ligne par vivant ('+pop.vivants.length+')',(s4.match(/<tr class=/g)||[]).length===pop.vivants.length,(s4.match(/<tr class=/g)||[]).length);
  ok('le champion et le temoin sont marques',s4.indexOf('★ champion')>0&&s4.indexOf('◆ témoin')>0);
  ok('la nouvelle epoque est marquee sur les courbes',/nouvelle époque à la génération 13/.test(html));
  ok('la phase B est marquee',/phase B à la génération 25/.test(html));
  const res=fs.readFileSync(r.resume,'utf8');
  const L=ET.resume(cfg);
  /* (28/11/2026, l'integrateur) resume.txt = les 10 lignes, une ligne vide, puis la ligne de la mesure de tau (« Mutations comptent-elles ? ») */
  const RL=res.replace(/\n$/,'').split('\n');
  ok('resume.txt = les lignes de etat.resume, puis la ligne de la mesure de tau',res.indexOf(L.join('\n')+'\n\n')===0&&RL.length===L.length+2&&
    /^Mutations comptent-elles \? /.test(RL[RL.length-1])&&/^[\x20-\x7e]*$/.test(RL[RL.length-1])&&RL[RL.length-1].length<=118,res);
  ok('tableau.html porte la section de la mesure de tau',/1 bis\. Les mutations comptent-elles \?/.test(html)&&/trop tôt pour le dire/i.test(html));
  ok('histoire.md porte le paragraphe de la mesure de tau',/## Les mutations comptent-elles \?\n\n.*trop tôt pour le dire/i.test(fs.readFileSync(path.join(d,'histoire.md'),'utf8')));
  {const MT=require(path.join(EV,'mesure-tau.js')),av=MT.mesurer;MT.mesurer=()=>{throw new Error('panne expres');};
    let err=null;try{T.ecrire(cfg);}catch(e){err=e;}MT.mesurer=av;
    const r2=fs.readFileSync(r.resume,'utf8');
    ok('une mesure de tau qui leve ne fait echouer ni le tableau, ni resume.txt, ni le recit',!err&&/Mutations comptent-elles \? trop tot/.test(r2)&&
      /1 bis\. Les mutations/.test(fs.readFileSync(r.html,'utf8'))&&/trop tôt pour le dire/.test(fs.readFileSync(path.join(d,'histoire.md'),'utf8')),err&&err.stack);
    T.ecrire(cfg);}
  ok('resume : au plus 10 lignes ('+L.length+')',L.length<=10&&L.length>=8);
  ok('resume : lignes de 120 caracteres au plus',L.every(l=>l.length<=120),L.filter(l=>l.length>120).join('\n'));
  ok('resume : sans accents (console Windows)',L.every(l=>/^[\x20-\x7e]*$/.test(l)),L.filter(l=>!/^[\x20-\x7e]*$/.test(l)).join('\n'));
  ok('resume : la generation 31 et la phase B',/^Generation 31, phase B/.test(L[0]),L[0]);
  ok('resume : verrou d\'un processus mort -> ARRETE SANS PREVENIR',/^ARRETE SANS PREVENIR/.test(L[1]),L[1]);
  ok('resume : le champion nomme',L[3].indexOf(pop.champion.id)>=0,L[3]);
  ok('resume : la derniere alerte dit l\'arret sans prevenir',/arret sans prevenir/.test(L[L.length-1]),L[L.length-1]);
  const sortie=lancerEtat(fc),LS=sortie.replace(/\n$/,'').split('\n');
  ok('node etat.js --config : au plus 10 lignes ('+LS.length+')',LS.length<=10,sortie);
  ok('node etat.js --config = etat.resume',LS.join('\n')===L.join('\n'),sortie);
  console.log('\n--- le resume de l\'exemple ---\n'+sortie+'-------------------------------');
  /* la ligne de commande de tableau.js */
  fs.rmSync(r.html);const st=cp.spawnSync(process.execPath,[path.join(EV,'tableau.js'),'--config',fc],{encoding:'utf8'});
  ok('node tableau.js --config : code 0 et page reecrite',st.status===0&&fs.existsSync(r.html),st.stderr);
});

/* 2. EN MARCHE : un verrou au pid vivant et au battement frais */
essai('en marche',()=>{
  const {d,cfg}=preparer('en-marche',EXEMPLE);
  fs.writeFileSync(path.join(d,'verrou.json'),JSON.stringify({pid:process.pid,debut:new Date(Date.now()-3600e3).toISOString(),battement:new Date().toISOString(),config:'config.json'}));
  fs.writeFileSync(path.join(d,'STOP'),'');
  const L=ET.resume(cfg);
  ok('verrou vivant -> EN MARCHE, et l\'arret demande',/^EN MARCHE/.test(L[1])&&/ARRET demande/.test(L[1]),L[1]);
  fs.writeFileSync(path.join(d,'verrou.json'),JSON.stringify({pid:process.pid,debut:new Date(Date.now()-3600e3).toISOString(),battement:new Date(Date.now()-900e3).toISOString()}));
  ok('battement de plus de verrouPerime_s -> ARRETE SANS PREVENIR',/^ARRETE SANS PREVENIR/.test(ET.resume(cfg)[1]),ET.resume(cfg)[1]);
  fs.rmSync(path.join(d,'verrou.json'));fs.rmSync(path.join(d,'STOP'));fs.writeFileSync(path.join(d,'ARRETE'),'');
  ok('pas de verrou + ARRETE -> ARRETE (arret voulu)',/^ARRETE \(arret voulu/.test(ET.resume(cfg)[1]),ET.resume(cfg)[1]);
});

/* 3. ETAT ABSENT, ETAT VIDE */
essai('etat absent',()=>{
  const {d,cfg,fc}=preparer('absent',null);
  const L=ET.resume(cfg);
  ok('dossier absent : resume sans lever, au plus 10 lignes',L.length>=1&&L.length<=10,L.join('\n'));
  ok('dossier absent : « Pas encore lance »',/^Pas encore lance/.test(L[0]),L[0]);
  const sortie=lancerEtat(fc);
  ok('dossier absent : node etat.js sort en code 0',sortie.split('\n').filter(Boolean).length<=10);
  const r=T.ecrire(cfg);
  controlerPage('absent',fs.readFileSync(r.html,'utf8'));
  ok('dossier absent : la page dit qu\'il n\'y a pas encore de donnees',/Pas encore de mesure/.test(fs.readFileSync(r.html,'utf8')));
  fs.rmSync(d,{recursive:true,force:true});
});
essai('etat vide',()=>{
  const {d,cfg}=preparer('vide',null);fs.mkdirSync(d,{recursive:true});
  for(const f of ['generations.jsonl','validations.jsonl','coffre.jsonl','morts.jsonl'])fs.writeFileSync(path.join(d,f),'');
  const L=ET.resume(cfg);
  ok('dossier vide : « Aucune generation encore »',/^Aucune generation encore/.test(L[0])&&L.length<=10,L.join('\n'));
  const r=T.ecrire(cfg);controlerPage('vide',fs.readFileSync(r.html,'utf8'));
});

/* 4. ETAT TRONQUE (coupure de courant au mauvais moment) */
essai('etat tronque',()=>{
  const {d,cfg,fc}=preparer('tronque',EXEMPLE);
  const coupe=(f,part)=>{const t=fs.readFileSync(path.join(d,f),'utf8');fs.writeFileSync(path.join(d,f),t.slice(0,Math.floor(t.length*part)));};
  coupe('population.json',.5);coupe('generations.jsonl',.73);coupe('courses-2026-48.jsonl',.61);coupe('verrou.json',.4);
  /* une ligne abimee au milieu d'un journal */
  const k=fs.readFileSync(path.join(d,'coffre.jsonl'),'utf8').split('\n');k[1]=k[1].slice(0,30);fs.writeFileSync(path.join(d,'coffre.jsonl'),k.join('\n'));
  let L=null,err=null;try{L=ET.resume(cfg);}catch(e){err=e;}
  ok('tronque : resume ne leve pas',!err,err&&err.stack);
  if(L){ok('tronque : au plus 10 lignes',L.length<=10,L.join('\n'));
    ok('tronque : alerte population.json illisible',/population\.json illisible/.test(L[L.length-1]),L[L.length-1]);
    ok('tronque : alerte ligne abimee du coffre',/abimee.*coffre\.jsonl/.test(L[L.length-1]),L[L.length-1]);
    ok('tronque : les generations lisibles restent lues',/^Generation \d+/.test(L[0]),L[0]);}
  let r=null;err=null;try{r=T.ecrire(cfg);}catch(e){err=e;}
  ok('tronque : ecrire ne leve pas',!err,err&&err.stack);
  if(r)controlerPage('tronque',fs.readFileSync(r.html,'utf8'));
  const st=cp.spawnSync(process.execPath,[path.join(EV,'etat.js'),'--config',fc],{encoding:'utf8'});
  ok('tronque : node etat.js code 0, au plus 10 lignes',st.status===0&&st.stdout.replace(/\n$/,'').split('\n').length<=10,st.stdout+st.stderr);
  /* population.json vide (0 octet) et generations.jsonl fait d'une seule ligne coupee */
  fs.writeFileSync(path.join(d,'population.json'),'');fs.writeFileSync(path.join(d,'generations.jsonl'),'{"generation":3,"da');
  err=null;try{L=ET.resume(cfg);T.ecrire(cfg);}catch(e){err=e;}
  ok('tronque : population vide et une seule ligne coupee ne font pas planter',!err&&L.length<=10,err&&err.stack);
});

console.log('\n'+(total-echecs)+' / '+total+' controles passes'+(echecs?' : '+echecs+' ECHEC(S)':''));
process.exit(echecs?1:0);
