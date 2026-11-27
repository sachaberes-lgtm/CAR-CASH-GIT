#!/usr/bin/env node
/* ===== LES TESTS DU MAITRE (2026-11-27, etapes 4 et 5 de SPECIFICATION.md § 10 ; l'integrateur) =====
   node ml/evolution/tests/evoluer.test.js [a] [bd] [c] [e] [f] [g] [t] [--travailleurs N]   (sans argument : tout, dans cet ordre ; ~40 min)
   Un seul etat, a part : ml/evolution/essais/tests-evoluer/etat (config-essai.json : mu 4, lambda 2, 3 graines, tmax 60, 4 travailleurs).
   Les etapes se suivent : a part d'un etat vide, les autres reprennent l'etat laisse par la precedente.
     a  : --une-generation finit (generation 0) et ecrit tous les fichiers
     bd : deux lancements (le second s'arrete, code 2) ; puis kill dur au milieu des courses de la generation 1, relance : memes naissances,
          seules les courses manquantes tournent
     c  : PAUSE (aucune course lancee tant qu'il existe) puis STOP (arret propre, code 0, STOP efface, verrou retire)
     e  : trois generations de suite (--arret-apres 3) : un pilote vire a chaque generation qui a un candidat, jamais le temoin ni le champion
     f  : --valider-maintenant (verdict ecrit) ; le fichier d'un champion note par ml/bot/noter.js (1 graine, tmax 60) = la course de courses.jsonl
     g  : une config d'epoque changee (retourFige.rv 0,21 : le sha « reseaux » de l'epoque change) : nouvelle epoque annoncee, identite refaite
     t  : tableau.js et etat.js sur l'etat obtenu
   Code 0 si tout passe. Les sorties de chaque lancement sont gardees dans essais/tests-evoluer/sortie-<etape>-<n>.log */
'use strict';
const fs=require('fs'),path=require('path'),{fork}=require('child_process');
const DOSSIER=path.join(__dirname,'..'),RACINE=path.join(DOSSIER,'..','..');
const C=require('../commun');
const BAC=path.join(DOSSIER,'essais','tests-evoluer'),ETAT=path.join(BAC,'etat');
const EVOLUER=path.join(DOSSIER,'evoluer.js');
/* (27/11/2026, l'integrateur) --travailleurs N : courses a la fois (4 par defaut, comme avant ; 2 quand une autre evolution tourne sur le PC),
   comme tests/identite.test.js ; la copie tests/zz-relecteur-evoluer.tmp.test.js (a 2 en dur) n'a plus de raison d'etre. */
const ARGS=process.argv.slice(2),iTrav=ARGS.indexOf('--travailleurs');
const TRAVAILLEURS=String(Math.max(1,Math.min(4,(iTrav>=0?+ARGS[iTrav+1]:4)||4)));
const BASE=['--config','config-essai.json','--etat',path.relative(DOSSIER,ETAT),'--travailleurs',TRAVAILLEURS];
const F=n=>path.join(ETAT,n);

let echecs=0,nLog=0;
const t00=Date.now();
const dire=t=>process.stdout.write(new Date().toTimeString().slice(0,8)+' '+t+'\n');
function verifie(ok,nom,detail){dire((ok?'OK     ':'ECHEC  ')+nom+(detail?' : '+detail:''));if(!ok)echecs++;return ok;}
const attendre=ms=>new Promise(r=>setTimeout(r,ms));
async function jusqua(cond,ms,pas){const t=Date.now();while(Date.now()-t<ms){try{if(cond())return true;}catch(e){}await attendre(pas||1000);}return false;}

/* un lancement de evoluer.js, sortie gardee */
function lancer(args,etape){
  const log=path.join(BAC,'sortie-'+etape+'-'+(++nLog)+'.log');
  fs.mkdirSync(BAC,{recursive:true});
  const c=fork(EVOLUER,args,{cwd:RACINE,silent:true});
  const L={c,texte:'',log,code:null,fin:null};
  const ecrire=d=>{L.texte+=d;fs.appendFileSync(log,d);};
  c.stdout.on('data',ecrire);c.stderr.on('data',ecrire);
  L.fin=new Promise(r=>c.on('exit',(code,sig)=>{L.code=code;L.signal=sig;r(code);}));
  return L;
}
const lignes=f=>{try{return C.lireJsonl(f);}catch(e){return [];}};
function courses(){const r=[];for(const n of fs.existsSync(ETAT)?fs.readdirSync(ETAT).filter(x=>/^courses-.*\.jsonl$/.test(x)).sort():[])for(const l of lignes(F(n)))r.push(l);return r;}
const pop=()=>C.lireJson(F('population.json'),null);

/* ---------- a ---------- */
async function etapeA(){
  dire('=== a : --une-generation sur un etat vide ===');
  fs.rmSync(ETAT,{recursive:true,force:true});
  const L=lancer(BASE.concat(['--une-generation']),'a');
  const code=await L.fin;
  verifie(code===0,'a : code de sortie 0',String(code)+' ('+L.log+')');
  const P=pop();
  verifie(P&&P.generation===0&&P.etape==='fin'&&P.vivants.length===4,'a : population.json (generation 0 finie, 4 vivants)',P&&('gen '+P.generation+' '+P.etape+' '+P.vivants.length+' vivants'));
  const K=courses(),E=K.filter(l=>l.usage==='entrainement');
  verifie(E.length===12&&E.every(l=>l.mesuree),'a : 12 courses d\'entrainement mesurees',E.length+' lignes, '+E.filter(l=>l.mesuree).length+' mesurees');
  verifie(K.some(l=>l.usage==='coffre'),'a : le coffre a couru (epoque neuve)',K.filter(l=>l.usage==='coffre').length+' lignes');
  for(const n of ['generations.jsonl','validations.jsonl','morts.jsonl','coffre.jsonl','tableau.html','resume.txt','population.json'])
    verifie(fs.existsSync(F(n)),'a : '+n+' ecrit');
  verifie(fs.existsSync(F('pilotes'))&&fs.readdirSync(F('pilotes')).length===4,'a : pilotes/ (4 textes)');
  verifie(!fs.existsSync(F('verrou.json')),'a : verrou retire');
  const G=lignes(F('generations.jsonl'));
  verifie(G.length===1&&G[0].generation===0&&G[0].evenements.some(e=>/identite verifiee/.test(e)),'a : generations.jsonl (gen 0, identite verifiee)',G.length?JSON.stringify(G[0].evenements):'');
  verifie(/identite : graine \d+ : IDENTIQUE/.test(L.texte),'a : le controle d\'identite a tourne');
  const txt=['population.json','generations.jsonl','coffre.jsonl','tableau.html','resume.txt'].map(n=>fs.readFileSync(F(n),'utf8')).join('');
  verifie(txt.indexOf('\r')<0,'a : fichiers ecrits en LF');
}

/* ---------- b et d ---------- */
async function etapeBD(){
  dire('=== b et d : deux lancements, puis kill dur au milieu des courses, puis relance ===');
  const avant=courses().length;
  const A=lancer(BASE.concat(['--une-generation']),'bd');
  const vu=await jusqua(()=>{const v=C.lireJson(F('verrou.json'),null);return v&&v.pid===A.c.pid;},120000);
  verifie(vu,'d : le premier lancement prend le verrou');
  const B=lancer(BASE.concat(['--une-generation']),'bd');
  const cb=await Promise.race([B.fin,attendre(120000).then(()=>'trop long')]);
  verifie(cb===2&&/REFUS DE PARTIR/.test(B.texte),'d : le second lancement s\'arrete (code 2)',String(cb)+' '+(B.texte.match(/REFUS DE PARTIR.*/)||[''])[0].slice(0,140));
  verifie(A.code===null,'d : le premier tourne toujours');
  /* au moins 2 courses de la generation 1 finies, puis kill */
  const ok=await jusqua(()=>courses().filter(l=>l.generation===1&&l.usage==='entrainement').length>=2,600000,2000);
  verifie(ok,'b : des courses de la generation 1 sont finies avant le kill');
  const P1=pop();
  const nes1=P1&&P1.generation===1?P1.naissancesGeneration.map(x=>x.id):null,viv1=P1?P1.vivants.map(v=>v.id):null;
  A.c.kill('SIGKILL');await A.fin;
  await attendre(3000);
  const K1=courses(),g1=K1.filter(l=>l.generation===1&&l.usage==='entrainement');
  verifie(nes1&&nes1.length===2,'b : population.json ecrit au debut de la generation 1 (2 naissances)',JSON.stringify(nes1));
  dire('b : kill dur apres '+g1.length+' course(s) de la generation 1 ('+(K1.length-avant)+' lignes ajoutees)');
  verifie(fs.existsSync(F('verrou.json')),'b : le kill laisse un verrou (pid mort)');
  const R=lancer(BASE.concat(['--une-generation']),'bd');
  const cr=await R.fin;
  verifie(cr===0,'b : la relance finit (code 0)',String(cr)+' ('+R.log+')');
  verifie(/verrou repris/.test(R.texte),'b : le verrou du mort est repris');
  verifie(/generation 1 : reprise/.test(R.texte)&&!/generation \d+ : \d+ naissance/.test(R.texte),'b : la relance ne refait pas les naissances');
  const P2=pop();
  verifie(P2&&JSON.stringify(P2.naissancesGeneration.map(x=>x.id))===JSON.stringify(nes1),'b : memes naissances',JSON.stringify(P2&&P2.naissancesGeneration.map(x=>x.id)));
  verifie(P2&&viv1.every(id=>P2.vivants.some(v=>v.id===id)||lignes(F('morts.jsonl')).some(m=>m.id===id&&m.mort===1)),'b : memes vivants (ou morts a la generation 1)');
  const K2=courses(),cles=new Map();
  for(const l of K2)if(l.mesuree)cles.set(l.cle,(cles.get(l.cle)||0)+1);
  const doubles=[...cles.values()].filter(n=>n>1).length;
  verifie(doubles===0,'b : aucune course mesuree jouee deux fois',doubles+' cle(s) en double');
  const G=lignes(F('generations.jsonl')).find(g=>g.generation===1);
  const mesAvant=g1.filter(l=>l.mesuree).length;
  verifie(G&&G.courses.cache>=mesAvant&&G.courses.jouees<=G.courses.demandees-mesAvant+G.courses.relancees,
    'b : seules les courses manquantes ont tourne',G&&('demandees '+G.courses.demandees+', cache '+G.courses.cache+', jouees '+G.courses.jouees+', mesurees avant le kill '+mesAvant));
}

/* ---------- c ---------- */
async function etapeC(){
  dire('=== c : PAUSE puis STOP ===');
  fs.writeFileSync(F('PAUSE'),'');
  const n0=courses().length;
  const D=lancer(BASE,'c');
  const enPause=await jusqua(()=>/PAUSE : plus aucune course/.test(D.texte),180000);
  verifie(enPause,'c : PAUSE annoncee');
  const P=pop();
  const n1=courses().length;
  await attendre(40000);
  const n2=courses().length;
  verifie(D.code===null&&n2===n1&&n1===n0,'c : aucune course pendant 40 s de PAUSE, le maitre vit',n0+' / '+n1+' / '+n2+' lignes');
  const v=C.lireJson(F('verrou.json'),null);
  verifie(v&&v.pid===D.c.pid,'c : le verrou est tenu pendant la PAUSE');
  fs.unlinkSync(F('PAUSE'));
  const repris=await jusqua(()=>courses().length>n2,600000,2000);
  verifie(repris,'c : les courses reprennent apres la PAUSE');
  /* une PAUSE au milieu des courses : celles en cours finissent (au plus 4), aucune autre ne part */
  fs.writeFileSync(F('PAUSE'),'');
  const m0=courses().length;
  await jusqua(()=>/PAUSE : plus aucune course/.test(D.texte.split('PAUSE levee')[1]||''),60000);
  await attendre(100000);
  const m1=courses().length;await attendre(40000);const m2=courses().length;
  verifie(D.code===null&&m2===m1&&m1-m0<=4,'c : PAUSE pendant les courses : celles en cours finissent, aucune ne part',m0+' -> '+m1+' -> '+m2+' lignes');
  fs.unlinkSync(F('PAUSE'));
  const repris2=await jusqua(()=>courses().length>m2,600000,2000);
  verifie(repris2,'c : les courses reprennent apres la seconde PAUSE');
  fs.writeFileSync(F('STOP'),'');
  const t=Date.now();
  const code=await Promise.race([D.fin,attendre(600000).then(()=>'trop long')]);
  verifie(code===0,'c : STOP : arret propre, code 0',String(code)+' en '+Math.round((Date.now()-t)/1000)+' s');
  verifie(!fs.existsSync(F('STOP')),'c : STOP efface');
  verifie(!fs.existsSync(F('verrou.json')),'c : verrou retire');
  const n3=courses().length;await attendre(5000);
  verifie(courses().length===n3,'c : plus rien ne court apres l\'arret');
  verifie(/interrompue|arret demande/.test(D.texte),'c : la generation interrompue est annoncee',(D.texte.match(/generation \d+ interrompue.*/)||[''])[0]);
  dire('c : generation en cours a l\'arret : '+(P&&P.generation)+' ('+(P&&P.etape)+')');
}

/* ---------- e ---------- */
async function etapeE(){
  dire('=== e : trois generations de suite ===');
  const g0=lignes(F('generations.jsonl')).length;
  const L=lancer(BASE.concat(['--arret-apres','3']),'e');
  const code=await L.fin;
  verifie(code===0,'e : code 0',String(code)+' ('+L.log+')');
  const G=lignes(F('generations.jsonl'));
  verifie(G.length===g0+3,'e : trois lignes de plus dans generations.jsonl',g0+' -> '+G.length);
  const M=lignes(F('morts.jsonl')),P=pop();
  const temoin=P.temoin;
  for(const g of G.filter(x=>x.generation>=1)){
    const candidats=g.population.length+g.morts.length>4;
    verifie(!candidats||g.morts.filter(m=>m.raison==='renvoi').length>=1,'e : generation '+g.generation+' : un renvoi',g.morts.map(m=>m.id.slice(0,8)+' '+m.raison).join(', ')+' ; '+g.population.length+' vivants apres');
    verifie(g.population.length===4,'e : generation '+g.generation+' : mu = 4 vivants apres le renvoi',String(g.population.length));
    verifie(!g.morts.some(m=>m.id===temoin||m.id===(g.champion&&g.champion.id)),'e : generation '+g.generation+' : ni le temoin ni le champion vires');
  }
  verifie(!M.some(m=>m.id===temoin),'e : le temoin n\'est jamais dans morts.jsonl');
  const champs=new Set(G.map(g=>g.champion&&g.champion.id));
  verifie(!M.some(m=>champs.has(m.id)&&G.some(g=>g.generation===m.mort&&g.champion&&g.champion.id===m.id)),'e : aucun champion vire pendant son titre');
  verifie(P.vivants.some(v=>v.id===temoin)&&P.vivants.some(v=>v.id===P.champion.id),'e : temoin et champion vivants');
  const ids=new Set(M.map(m=>m.id));
  verifie(ids.size===M.length,'e : aucun mort ecrit deux fois',M.length+' lignes, '+ids.size+' ids');
}

/* ---------- f ---------- */
async function etapeF(){
  dire('=== f : --valider-maintenant, puis le champion note par noter.js ===');
  const v0=lignes(F('validations.jsonl')).length;
  const L=lancer(BASE.concat(['--valider-maintenant']),'f');
  const code=await L.fin;
  verifie(code===0,'f : code 0',String(code)+' ('+L.log+')');
  const V=lignes(F('validations.jsonl'));
  const v=V[V.length-1];
  verifie(V.length===v0+1&&v&&v.validation&&typeof v.sacre==='boolean'&&v.criteres,'f : verdict ecrit dans validations.jsonl',v&&('sacre '+v.sacre+', dF '+v.validation.dF+' +- '+v.validation.se_dF+', '+v.validation.graines+' graines'));
  const KV=courses().filter(l=>l.usage==='validation'&&v&&v.graines.indexOf(l.graine)>=0);
  verifie(KV.length===2*v.graines.length,'f : '+2*v.graines.length+' courses de validation',String(KV.length));
  /* le fichier du champion : celui du sacre s'il y en a eu un ; sinon ecrit ici par evoluer.ecrireChampion (le meme ecrivain) pour le meneur */
  let fjs=null,fjson=null,qui=null;
  if(v.sacre&&v.fichier){fjs=path.join(DOSSIER,v.fichier);fjson=fjs.replace(/\.js$/,'.json');qui='le champion sacre';}
  else{
    const E=require('../evoluer');
    const cfg=C.lireConfig('config-essai.json');cfg.dossierEtat=ETAT;cfg.dossierChampions=path.join(BAC,'champions-essai');
    const ctx=E.charger(cfg,{dire:()=>{}});
    const m=ctx.pop.vivants.find(x=>x.id===v.meneur);
    const f=E.ecrireChampion(ctx,m,ctx.pop.generation,{precedent:ctx.pop.champion.id});
    await ctx.ord.arreter();
    fjs=f.js;fjson=f.json;qui='le meneur (pas sacre : fichier ecrit par ecrireChampion dans '+path.relative(DOSSIER,cfg.dossierChampions)+')';
  }
  verifie(fs.existsSync(fjs)&&fs.existsSync(fjson),'f : fichiers du champion ('+qui+')',path.relative(DOSSIER,fjs));
  const J=JSON.parse(fs.readFileSync(fjson,'utf8')),texte=fs.readFileSync(fjs,'utf8');
  verifie(J.format==='evolution-champion-1'&&C.sha1(texte)===J.shaPilote&&texte.indexOf('\r')<0,'f : le .json porte le sha du .js (LF)');
  const pil=fs.readFileSync(path.join(ETAT,'pilotes',J.shaPilote.slice(0,12)+'.js'),'utf8');
  verifie(pil===texte,'f : le .js est le texte exact de pilotes/');
  const ref=courses().find(l=>l.pilote===J.shaPilote&&l.usage==='entrainement'&&l.mesuree&&l.tmax===60);
  verifie(!!ref,'f : une course d\'entrainement de ce pilote dans courses.jsonl',ref&&('graine '+ref.graine+' '+ref.empreinte));
  if(!ref)return;
  const sortie=path.join(BAC,'noter-champion.json');
  try{fs.unlinkSync(sortie);}catch(e){}
  const c=fork(path.join(RACINE,'ml','bot','noter.js'),[fjs,'--graines','1','--depart',String(ref.graine),'--tmax','60','--regime','allege','--coeurs','1','--sortie',sortie,'--force'],{cwd:RACINE,silent:true});
  let txt='';c.stdout.on('data',d=>txt+=d);c.stderr.on('data',d=>txt+=d);
  const cn=await new Promise(r=>c.on('exit',r));
  fs.writeFileSync(path.join(BAC,'sortie-f-noter.log'),txt);
  verifie(cn===0&&fs.existsSync(sortie),'f : noter.js note le fichier du champion',String(cn));
  if(!fs.existsSync(sortie))return;
  const b=JSON.parse(fs.readFileSync(sortie,'utf8')).courses[0];
  verifie(b.empreinte===ref.empreinte&&b.palier===ref.palier&&b.duree_s===ref.survie_s&&b.empreinteVues===ref.empreinteVues,
    'f : noter.js redonne la meme course que courses.jsonl','noter '+b.empreinte+' '+b.empreinteVues+' palier '+b.palier+' '+b.duree_s+' s ; courses.jsonl '+ref.empreinte+' '+ref.empreinteVues+' palier '+ref.palier+' '+ref.survie_s+' s');
}

/* ---------- g ---------- */
async function etapeG(){
  dire('=== g : une config d\'epoque changee (retourFige.rv 0,21) ===');
  const base=JSON.parse(fs.readFileSync(path.join(DOSSIER,'config-essai.json'),'utf8'));
  base.retourFige={rv:0.21,rm:0.24,rn:0.18};
  const fc=path.join(BAC,'config-epoque.json');
  fs.writeFileSync(fc,JSON.stringify(base,null,2)+'\n');
  const P0=pop(),G0=lignes(F('generations.jsonl'));
  const L=lancer(['--config',path.relative(DOSSIER,fc),'--etat',path.relative(DOSSIER,ETAT),'--travailleurs',TRAVAILLEURS,'--une-generation'],'g');
  const code=await L.fin;
  verifie(code===0,'g : code 0',String(code)+' ('+L.log+')');
  verifie(/nouvelle epoque : reseaux\/retourFige/.test(L.texte),'g : nouvelle epoque annoncee',(L.texte.match(/nouvelle epoque.*/)||[''])[0]);
  verifie(/identite verifiee/.test(L.texte),'g : identite refaite a l\'epoque neuve');
  const P=pop(),G=lignes(F('generations.jsonl')),g=G[G.length-1];
  verifie(P.epoque.courses!==P0.epoque.courses&&P.epoque.depuis===P0.generation+1,'g : population.json a l\'epoque neuve',P0.epoque.courses+' -> '+P.epoque.courses+' depuis '+P.epoque.depuis);
  verifie(g&&g.epoque===P.epoque.courses&&g.epoque!==G0[G0.length-1].epoque&&g.evenements.some(e=>/nouvelle epoque/.test(e)),'g : generations.jsonl marque l\'epoque');
  verifie(g&&g.courses.cache===0,'g : toutes les courses rejouees (la cle du cache change)',g&&('cache '+g.courses.cache+', jouees '+g.courses.jouees));
  verifie(g&&g.coffre&&g.coffre.raison==='epoque','g : coffre « epoque »');
}

/* ---------- t ---------- */
async function etapeT(){
  dire('=== t : tableau.js et etat.js sur l\'etat obtenu ===');
  const base=JSON.parse(fs.readFileSync(path.join(DOSSIER,'config-essai.json'),'utf8'));
  base.dossierEtat=path.relative(DOSSIER,ETAT).split(path.sep).join('/');
  const fc=path.join(BAC,'config-tableau.json');fs.writeFileSync(fc,JSON.stringify(base,null,2)+'\n');
  for(const [m,args] of [['tableau.js',['--config',fc]],['etat.js',['--config',fc]]]){
    const c=fork(path.join(DOSSIER,m),args,{cwd:RACINE,silent:true});
    let txt='';c.stdout.on('data',d=>txt+=d);c.stderr.on('data',d=>txt+=d);
    const code=await new Promise(r=>c.on('exit',r));
    fs.writeFileSync(path.join(BAC,'sortie-t-'+m+'.log'),txt);
    verifie(code===0,'t : '+m+' code 0',String(code));
    if(m==='etat.js'){const L=txt.trim().split('\n');verifie(L.length<=10,'t : etat.js tient en 10 lignes',L.length+' lignes');process.stdout.write(txt);}
  }
  const html=fs.readFileSync(F('tableau.html'),'utf8');
  verifie(/^<!doctype html>/i.test(html)&&!/https?:\/\//.test(html.replace(/xmlns="http:\/\/www\.w3\.org\/2000\/svg"/g,''))&&!/NaN|undefined/.test(html),'t : tableau.html hors ligne, sans NaN ni undefined',html.length+' octets');
}

const ETAPES={a:etapeA,bd:etapeBD,c:etapeC,e:etapeE,f:etapeF,g:etapeG,t:etapeT};
(async function(){
  const demandees=process.argv.slice(2).filter(x=>ETAPES[x]);
  for(const e of (demandees.length?demandees:Object.keys(ETAPES))){
    const t=Date.now();
    try{await ETAPES[e]();}catch(x){verifie(false,e+' : exception',String(x&&x.stack||x));}
    dire('('+e+' : '+Math.round((Date.now()-t)/1000)+' s)');
  }
  dire((echecs?'ECHEC : '+echecs+' controle(s) rate(s)':'TOUT PASSE')+' ('+Math.round((Date.now()-t00)/1000)+' s)');
  process.exit(echecs?1:0);
})();
