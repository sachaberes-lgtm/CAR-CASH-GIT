#!/usr/bin/env node
/* ===== LA CHAINE DES DEUX SEMAINES (2026-11-25, Sacha : « organise toi pour pas d'arreter », « utiliser les token [d'API] pour ca ») =====
   Tourne SEULE, detachee de toute session Claude Code, et ne paie QUE sur la cle d'API (jamais sur l'abonnement) :
     1. le premier pilote (agent-api.js, Fable 5.2, consignes-agents/pilote.md)
     2. le calibrage : boucle.js une fois par modele, meme depart, meme nombre de variantes (etapes K-haiku, K-sonnet, K-opus, K-fable)
     3. le choix du modele et du depart (agent-api.js, Opus 5.5, consignes-agents/choix-modele.md) -> agents/choix.json
     4. la boucle de l'etape C par tranches de 20 €, la depense etalee : au plus 14 € par jour depuis le 25/11, jusqu'au 08/12/2026
     5. apres le calibrage et apres chaque tranche : un compte rendu (agent-api.js, Sonnet 5.5, consignes-agents/compte-rendu.md)
   Le plafond general de 200 € est tenu par boucle.js et agent-api.js (journal des depenses du labo). Un etat (agents/chaine-etat.json)
   permet de relancer la chaine sans refaire ce qui est fait. Une seule chose a la fois : jamais plus de 4 courses du jeu.
   usage : node chaine.js          (journal : agents/chaine.log)        arret : creer le fichier agents/STOP */
const fs=require('fs'),path=require('path'),{spawn,execFileSync}=require('child_process');
const ICI=__dirname,AG=path.join(ICI,'agents'),LOG=path.join(AG,'chaine.log'),ETAT=path.join(AG,'chaine-etat.json'),STOP=path.join(AG,'STOP');
fs.mkdirSync(AG,{recursive:true});
const L=require('../labo/labo');
const PLAFOND=200,PAR_JOUR=14,DEBUT=Date.parse('2026-11-25T00:00:00+01:00'),FIN=Date.parse('2026-12-08T23:59:00+01:00'),TRANCHE=20;
const dire=m=>{const l=new Date().toISOString().slice(0,19).replace('T',' ')+'  '+m;fs.appendFileSync(LOG,l+'\n');console.log(l);};
const etat=(()=>{try{return JSON.parse(fs.readFileSync(ETAT,'utf8'));}catch(e){return {fait:{},tranches:0};}})();
const noter=()=>fs.writeFileSync(ETAT,JSON.stringify(etat,null,1));
const dort=ms=>new Promise(r=>setTimeout(r,ms));

/* l'environnement des enfants : rien de la session Claude Code qui a pu lancer la chaine (jeton, relais, abonnement), la cle d'API seule */
for(const k of Object.keys(process.env))if(/^(CLAUDE|ANTHROPIC_)/i.test(k))delete process.env[k];
try{const s=execFileSync('reg',['query','HKCU\\Environment','/v','ANTHROPIC_API_KEY'],{encoding:'utf8',stdio:['ignore','pipe','ignore']});
  const m=s.match(/ANTHROPIC_API_KEY\s+REG_\w+\s+(\S+)/);if(m)process.env.ANTHROPIC_API_KEY=m[1];}catch(e){}

/* le PC reste eveille tant que la chaine tourne (demande du processus, comme un lecteur video ; aucun reglage change) */
function eveil(){if(process.platform!=='win32')return;
  const ps=`$s=Add-Type -MemberDefinition '[DllImport("kernel32.dll")] public static extern uint SetThreadExecutionState(uint e);' -Name E -Namespace W -PassThru; $s::SetThreadExecutionState(0x80000001) | Out-Null; Wait-Process -Id ${process.pid}`;
  const e=spawn('powershell',['-NoProfile','-WindowStyle','Hidden','-Command',ps],{stdio:'ignore',windowsHide:true});e.unref();}

function lance(nom,args,cwd){return new Promise(res=>{
  dire('>> '+nom+' : node '+args.join(' '));const t0=Date.now();
  const p=spawn(process.execPath,args,{cwd:cwd||ICI,env:process.env,stdio:['ignore','pipe','pipe'],windowsHide:true});
  const f=fs.createWriteStream(path.join(AG,'sortie-'+nom.replace(/[^\w-]/g,'_')+'.log'),{flags:'a'});
  p.stdout.on('data',d=>{f.write(d);String(d).split(/\r?\n/).filter(l=>/\[(boucle|agent-api)\]/.test(l)).forEach(l=>fs.appendFileSync(LOG,'      '+l.trim().slice(0,240)+'\n'));});
  p.stderr.on('data',d=>f.write(d));
  p.on('close',c=>{f.end();dire('<< '+nom+' : code '+c+' · '+Math.round((Date.now()-t0)/60000)+' min · depense totale '+L.depenses().total+' €');res(c);});});}
const agent=(nom,consigne,modele,budget,etape)=>lance('agent-'+nom,['agent-api.js','--consigne',path.join(ICI,'consignes-agents',consigne),'--nom',nom,'--modele',modele,'--budget',String(budget),'--etape',etape]);
const arret=()=>fs.existsSync(STOP)||L.depenses().total>=PLAFOND-.25||Date.now()>FIN;

async function compteRendu(quoi){if(arret()&&L.depenses().total>=PLAFOND-.25)return;await agent('compte-rendu',`compte-rendu.md`,'claude-sonnet-5-5',2,'recit');}

(async function(){
  eveil();dire('=== la chaine demarre (pid '+process.pid+') · depense '+L.depenses().total+' € sur '+PLAFOND+' € · cle '+(process.env.ANTHROPIC_API_KEY?'presente':'ABSENTE'));
  if(!process.env.ANTHROPIC_API_KEY){dire('pas de cle : arret');return;}

  /* 1. le premier pilote */
  if(!etat.fait.pilote){
    let c=await agent('pilote','pilote.md','claude-fable-5-2',25,'C');
    if(!fs.existsSync(path.join(ICI,'pilote.js'))&&!arret()){dire('pas de pilote.js : deuxieme essai avec Opus 5.5');c=await agent('pilote-2','pilote.md','claude-opus-5-5',20,'C');}
    etat.fait.pilote=fs.existsSync(path.join(ICI,'pilote.js'))?'ml/ecurie/pilote.js':'ml/bot/essai-main.js';noter();
    dire('pilote de depart : '+etat.fait.pilote);}
  const depart=path.join(ICI,'..','..',etat.fait.pilote);

  /* 2. le calibrage : meme depart, un tour de 6 variantes par modele */
  const MODELES=[['haiku','claude-haiku-5-5'],['sonnet','claude-sonnet-5-5'],['opus','claude-opus-5-5'],['fable','claude-fable-5-2']];
  for(const[n,m]of MODELES){if(arret())break;if(etat.fait['K-'+n])continue;
    const c=await lance('calibrage-'+n,['boucle.js','--budget','5','--tours','1','--candidats','6','--modele',m,'--etape','K-'+n,'--depuis',depart]);
    etat.fait['K-'+n]={code:c};noter();}
  if(!etat.fait.cr_calibrage&&!arret()){await compteRendu('calibrage');etat.fait.cr_calibrage=1;noter();}

  /* 3. le choix */
  if(!etat.fait.choix&&!arret()){await agent('choix-modele','choix-modele.md','claude-opus-5-5',4,'C bis');
    try{etat.fait.choix=JSON.parse(fs.readFileSync(path.join(AG,'choix.json'),'utf8'));}catch(e){etat.fait.choix={modele:'claude-opus-5-5',depuis:etat.fait.pilote,raison:'choix.json absent : Opus 5.5 par defaut'};}
    noter();dire('choix : '+JSON.stringify(etat.fait.choix));}

  /* 4. la boucle de l'etape C, par tranches, la depense etalee */
  while(!arret()){
    /* LE RYTHME (2026-11-26, corrige) : chaque jour, ce qui reste des 200 € est partage entre les jours qui restent jusqu'au 08/12.
       (Avant : 14 € par jour cumules depuis le 25/11 ; les agents du pilote, des finitions et du portfolio avaient mange l'avance,
       et la boucle a attendu un jour entier, le PC a l'arret.) */
    const jour=new Date().toLocaleDateString('fr-FR'),deja=L.depenses().total;
    if(etat.jour!==jour){const restent=Math.max(1,Math.ceil((FIN-Date.now())/864e5));etat.jour=jour;etat.debutJour=deja;etat.budgetJour=Math.round((PLAFOND-deja)/restent*100)/100;noter();
      dire(`nouveau jour : ${etat.budgetJour} € pour aujourd'hui (${Math.round((PLAFOND-deja)*100)/100} € restent, ${restent} jour(s))`);}
    const libre=Math.round((etat.budgetJour-(deja-etat.debutJour))*100)/100;
    if(libre<2){dire(`rythme : ${Math.round((deja-etat.debutJour)*100)/100} € depenses aujourd'hui sur ${etat.budgetJour} € : attente d'une heure`);await dort(36e5);continue;}
    const ch=etat.fait.choix||{modele:'claude-opus-5-5',depuis:etat.fait.pilote},b=Math.min(TRANCHE,libre);
    const args=['boucle.js','--budget',String(b),'--tours','20','--modele',ch.modele,'--etape','C'];
    if(!etat.depuisDonne){args.push('--depuis',path.join(ICI,'..','..',ch.depuis||etat.fait.pilote));}
    const avant=L.depenses().total,c=await lance('tranche-'+(etat.tranches+1),args);etat.depuisDonne=1;etat.tranches++;noter();
    /* une tranche qui ne depense presque rien (boucle a l'arret, erreur au depart) : deux de suite, et la chaine s'arrete au lieu de tourner a vide */
    if(L.depenses().total-avant<.5){etat.vides=(etat.vides|0)+1;noter();if(etat.vides>=2){dire('deux tranches de suite sans depense : arret, a regarder');break;}await dort(18e5);continue;}
    etat.vides=0;noter();
    await compteRendu('tranche');
    if(c!==0){dire('la tranche a rate (code '+c+') : pause de 30 min avant la suivante');await dort(18e5);}
  }
  dire('=== la chaine s\'arrete · depense '+L.depenses().total+' € sur '+PLAFOND+' € · '+(fs.existsSync(STOP)?'fichier STOP':Date.now()>FIN?'echeance du 08/12':'plafond atteint'));
})();
