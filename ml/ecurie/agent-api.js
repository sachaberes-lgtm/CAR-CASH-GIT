#!/usr/bin/env node
/* ===== L'AGENT PAYE PAR LA CLE D'API (2026-11-25, Sacha : « reprend le travaille de fable avec les credit api ») =====
   Lance une session Claude Code SANS ECRAN (`claude -p --bare`) qui travaille dans ce depot et se paie sur la cle d'API, jamais sur
   l'abonnement : en mode --bare, Claude Code ne lit que ANTHROPIC_API_KEY (ni OAuth, ni trousseau). Par prudence, le lanceur lit aussi
   la source de la cle annoncee par la session a son premier message (apiKeySource) et la coupe aussitot si ce n'est pas la cle d'API.
   Le cout final (total_cost_usd) est inscrit au journal des depenses du labo : le plafond general de 200 € (boucle.js --plafond) le compte.
   La cle se lit dans l'environnement, ou a defaut dans la portee Utilisateur de Windows (setx) ; elle n'est jamais affichee ni ecrite.

   usage : node agent-api.js --consigne fichier.md --budget 15 --etape C --nom pilote-v1 [--modele claude-fable-5-2] [--plafond 200] [--essai]
     --consigne   le texte de la tache (un fichier) ; les deux CLAUDE.md (celui de Sacha et celui du projet) y sont joints d'office
     --budget     le plafond de CETTE session, en dollars (1 € compte pour 1 $, comme boucle.js) ; obligatoire
     --essai      une tache minuscule pour verifier la cle et la facturation (quelques centimes) */
const fs=require('fs'),path=require('path'),os=require('os'),{spawn,execFileSync}=require('child_process');
const A=process.argv.slice(2),opt=(n,d)=>{const i=A.indexOf('--'+n);return i>=0?A[i+1]:d;},a=n=>A.includes('--'+n);
const L=require('../labo/labo');
const RACINE=path.join(__dirname,'..','..'),ESSAI=a('essai');
const MODELE=opt('modele',ESSAI?'claude-haiku-5-5':'claude-fable-5-2'),ETAPE=String(opt('etape',ESSAI?'outil':'C')),NOM=opt('nom',ESSAI?'essai':'agent');
const PLAFOND=+opt('plafond',200);let BUDGET=+opt('budget',ESSAI?0.3:0);
const dire=m=>console.log('[agent-api] '+m),r2=x=>Math.round(x*100)/100;

/* ----- LA CLE : l'environnement, sinon la portee Utilisateur (un processus ouvert avant le setx ne la voit pas) ----- */
function cle(){
  if(process.env.ANTHROPIC_API_KEY)return process.env.ANTHROPIC_API_KEY;
  if(process.platform==='win32'){try{const s=execFileSync('reg',['query','HKCU\\Environment','/v','ANTHROPIC_API_KEY'],{encoding:'utf8',stdio:['ignore','pipe','ignore']});
    const m=s.match(/ANTHROPIC_API_KEY\s+REG_\w+\s+(\S+)/);if(m)return m[1];}catch(e){}}
  return null;
}
function claudeExe(){
  if(process.platform==='win32'){try{return execFileSync('where',['claude'],{encoding:'utf8',stdio:['ignore','pipe','ignore']}).split(/\r?\n/).find(l=>/\.exe$/i.test(l.trim())).trim();}catch(e){}}
  return 'claude';
}

/* ----- LE PLAFOND GENERAL : ce qui est deja depense, toutes etapes reunies ----- */
if(!(BUDGET>0)){dire('--budget est obligatoire (en dollars, pour cette session)');process.exit(2);}
const deja=L.depenses().total,reste=r2(PLAFOND-deja);
if(reste<.25){dire(`le plafond general est atteint : ${deja} € depenses sur ${PLAFOND} €. Rien n'est lance.`);process.exit(0);}
if(BUDGET>reste){dire(`budget rabote de ${BUDGET} a ${reste} : ${deja} € deja depenses sur ${PLAFOND} €`);BUDGET=reste;}
const K=cle();if(!K){dire('pas de cle ANTHROPIC_API_KEY (ni dans l\'environnement, ni dans la portee Utilisateur)');process.exit(1);}

/* ----- LA CONSIGNE, avec les deux CLAUDE.md (le mode --bare ne les lit pas tout seul) ----- */
let tache=ESSAI?'Reponds exactement : OK. N\'utilise aucun outil.':null;
if(!tache){const f=opt('consigne');if(!f||!fs.existsSync(f)){dire('--consigne : fichier introuvable');process.exit(2);}tache=fs.readFileSync(f,'utf8');}
const joints=[path.join(os.homedir(),'.claude','CLAUDE.md'),path.join(RACINE,'CLAUDE.md')].filter(f=>fs.existsSync(f))
  .map(f=>'Contenu de '+f+' (instructions a suivre) :\n\n'+fs.readFileSync(f,'utf8')).join('\n\n---\n\n');
const systeme=joints+'\n\n---\n\nTu travailles SANS ECRAN, pour Sacha, qui ne peut pas te repondre : ne pose aucune question, decide toi-meme (le choix le plus prudent) et dis-le dans ton rapport final. '
  +'Jamais de git push, jamais d\'appel payant a l\'API de ta part (pas de boucle.js sans --a-blanc, pas d\'essai-api.js), jamais plus de 4 courses du jeu a la fois. '
  +'Tes commits se terminent par la ligne : Co-Authored-By: Claude <noreply@anthropic.com>. Ton dernier message est ton rapport a Sacha, en francais clair : ce qui est fait, mesure, valide, et ce qui ne l\'est pas.';

/* ----- LE JOURNAL de la session (hors git) ----- */
const JOUR=path.join(__dirname,'agents');fs.mkdirSync(JOUR,{recursive:true});
const stamp=new Date().toISOString().replace(/[:.]/g,'-').slice(0,19),base=path.join(JOUR,stamp+'-'+NOM);
const flux=fs.createWriteStream(base+'.jsonl');

/* ----- L'ENVIRONNEMENT DE LA SESSION : rien de la session qui l'a lancee (jeton, adresse relais, abonnement) ----- */
const env={};for(const[k,v]of Object.entries(process.env)){if(/^(CLAUDE|ANTHROPIC_)/i.test(k))continue;env[k]=v;}
env.ANTHROPIC_API_KEY=K;

const args=['-p','--bare','--model',MODELE,'--max-budget-usd',String(BUDGET),'--output-format','stream-json','--verbose',
  '--permission-mode','acceptEdits','--allowedTools','Bash','Read','Edit','Write','Grep','Glob','--disallowedTools','Bash(git push:*)',
  '--append-system-prompt',systeme];
if(MODELE!=='claude-opus-5-5'&&!ESSAI)args.push('--fallback-model','claude-opus-5-5');
dire(`session « ${NOM} » · ${MODELE} · etape ${ETAPE} · plafond de la session ${BUDGET} $ · deja depense ${deja} € sur ${PLAFOND} € · journal ${path.relative(RACINE,base)}.jsonl`);
const enfant=spawn(claudeExe(),args,{cwd:RACINE,env,stdio:['pipe','pipe','pipe'],windowsHide:true});
enfant.stdin.end(tache);
let tampon='',source=null,resultat=null,outils=0,coupe=null;
enfant.stdout.on('data',d=>{tampon+=d;let i;while((i=tampon.indexOf('\n'))>=0){const l=tampon.slice(0,i).trim();tampon=tampon.slice(i+1);if(!l)continue;flux.write(l+'\n');
  let m;try{m=JSON.parse(l);}catch(e){continue;}
  if(m.type==='system'&&m.subtype==='init'){source=m.apiKeySource||null;dire('facturation : '+source+' · modele '+(m.model||'?'));
    if(source!=='ANTHROPIC_API_KEY'){coupe='la session ne se paie pas sur la cle d\'API (source : '+source+')';dire('COUPEE : '+coupe);enfant.kill();}}
  else if(m.type==='assistant'&&m.message&&Array.isArray(m.message.content)){for(const b of m.message.content){
    if(b.type==='tool_use'){outils++;if(outils%10===0)dire(outils+' outils utilises');}
    else if(b.type==='text'&&b.text.trim())dire('« '+b.text.trim().replace(/\s+/g,' ').slice(0,160)+' »');}}
  else if(m.type==='result')resultat=m;}});
enfant.stderr.on('data',d=>flux.write(JSON.stringify({stderr:String(d)})+'\n'));
enfant.on('close',code=>{
  flux.end();
  const usd=resultat&&typeof resultat.total_cost_usd==='number'?resultat.total_cost_usd:null,u=(resultat&&resultat.usage)||{};
  /* la depense est inscrite meme si la session a rate ou ete coupee : l'argent est parti */
  if(usd!=null&&usd>0)L.depense({etape:ETAPE,modele:MODELE,entree:(u.input_tokens|0)+(u.cache_read_input_tokens|0)+(u.cache_creation_input_tokens|0),sortie:u.output_tokens|0,euros:r2(usd),pour:'agent sans ecran : '+NOM});
  else if(usd==null&&!coupe)L.depense({etape:ETAPE,modele:MODELE,euros:null,pour:'agent sans ecran : '+NOM+' (cout inconnu, a chiffrer sur la console)'});
  const rapport=resultat&&typeof resultat.result==='string'?resultat.result:'';
  fs.writeFileSync(base+'.md',`# ${NOM} — ${MODELE} — ${stamp}\n\nfacturation : ${source} · cout : ${usd==null?'inconnu':usd.toFixed(2)+' $'} · ${outils} outils · fin : ${resultat?resultat.subtype:'aucun resultat'}${coupe?' · COUPEE : '+coupe:''}\n\n${rapport}\n`);
  dire(`fin · code ${code} · ${resultat?resultat.subtype:'aucun resultat'} · cout ${usd==null?'inconnu':usd.toFixed(2)+' $'} · total depense ${L.depenses().total} € sur ${PLAFOND} €`);
  dire('rapport : '+path.relative(RACINE,base)+'.md');
  process.exit(coupe?3:(resultat&&resultat.subtype==='success'?0:1));
});
