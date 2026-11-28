#!/usr/bin/env node
/* ===== LA SELECTION NATURELLE : INSCRIRE UN CHAMPION AU LABO (2026-11-27, etape 9 — SPECIFICATION.md § 9, INTERFACES.md § 2.11) =====
   A LA MAIN SEULEMENT, jamais pendant que ml/ecurie/boucle.js ou inscrire.js tournent (l'id cNNNN du labo vient du nombre de lignes, sans verrou).
   Relit champions/gNNNN-<sha8>.json et son .js, rejoue le champion sur ses graines de validation (enfant.js, un processus neuf par course,
   complet:true : la partie et les touches que le labo garde), puis, par l'API de ml/labo/labo.js :
     L.inscrire({nom:'evo-gNNNN', etape:'N1', modele:'evolution', lot:'entrainement', …}) ; L.valider(id,{role:'candidat',…}) ; L.clore('N1', NNNN).
   L'etape N1 est distincte de l'etape C de boucle.js : meilleur() de boucle.js ne voit rien changer.
   PREALABLE (une ligne de ml/labo/labo.js, a ajouter a la main par Sacha ; ce script ne la touche pas) :
     function sansCout(modele){return modele==='main'||/abonnement$/.test(String(modele||''))||/^evolution/.test(String(modele||''));}
   Sans elle, l'inscription est refusee ici (et le serait par labo.inscrire : un cerveau d'un modele inconnu doit declarer son cout).
   Ligne de commande : node ml/evolution/inscrire-champion.js <champions/gNNNN-xxxxxxxx.json> [--essai] [--config f.json] [--travailleurs 4]
     --essai : tout sauf les ecritures du labo (rejoue les courses et imprime ce qui serait inscrit). */
'use strict';
const fs=require('fs'),path=require('path'),os=require('os'),{fork}=require('child_process');
const C=require('./commun');

const ENFANT=path.join(__dirname,'enfant.js');

/* une course complete dans un processus neuf (comme courses.js, mais complet:true : la partie et les touches remontent) */
function courseComplete(cfg,source,graine,tmax){
  return new Promise(function(fin,echec){
    const c=fork(ENFANT,[],{silent:true,windowsHide:true});
    if(cfg.prioriteBasse){try{os.setPriority(c.pid,os.constants.priority.PRIORITY_BELOW_NORMAL);}catch(e){}}
    let recu=null,err='';
    if(c.stdout)c.stdout.resume();
    if(c.stderr)c.stderr.on('data',d=>{err=(err+d).slice(-600);});
    const chien=setTimeout(()=>{try{c.kill('SIGKILL');}catch(e){}},Math.max(60,cfg.chienDeGarde_s||1200)*1000);
    c.on('message',m=>{if(!recu)recu=m;});
    c.on('exit',function(code){
      clearTimeout(chien);
      if(!recu)return echec(new Error('inscrire-champion : graine '+graine+' : processus fini sans resultat (code '+code+') '+err.replace(/\s+/g,' ').slice(-300)));
      if(recu.erreurFatale)return echec(new Error('inscrire-champion : graine '+graine+' : chargement : '+recu.erreurFatale));
      fin(recu);
    });
    c.send({source:source,fichier:'evolution.js',graine:graine,tmax:tmax,regime:cfg.regime||'allege',complet:true});
  });
}
async function rejouer(cfg,source,graines,tmax,travailleurs,dire){
  const R=new Array(graines.length);let i=0;
  async function un(){while(i<graines.length){const k=i++;R[k]=await courseComplete(cfg,source,graines[k],tmax);
    dire('graine '+graines[k]+' : palier '+R[k].palier+', '+R[k].survie_s+' s, '+R[k].cause+' ('+R[k].empreinte+')');}}
  await Promise.all(Array.from({length:Math.max(1,Math.min(travailleurs,graines.length))},un));
  return R;
}

/* le labo id du champion precedent (s'il a ete inscrit) : la ligne du journal dont le sha est celui de son pilote */
function parentsLabo(L,cfg,J,dossierChampions){
  if(!J.precedent)return [];
  let sha=null;
  try{
    for(const f of fs.readdirSync(dossierChampions).filter(x=>/^g\d{4}-[0-9a-f]{8}\.json$/.test(x))){
      const p=JSON.parse(fs.readFileSync(path.join(dossierChampions,f),'utf8'));
      if(p.id===J.precedent){sha=p.shaPilote;break;}}
  }catch(e){}
  /* (28/11/2026, tache « portage ») le temoin de la population qui a sacre ce champion (J.temoin ; absent = c0025, pilote-voltige.js) */
  const nomT=typeof J.temoin==='string'&&J.temoin?J.temoin:'c0025';
  if(!sha){
    /* le precedent est le temoin (il n'a pas de fichier) : son fichier ecrit a la main (pilote-voltige.js pour c0025), s'il est au labo */
    try{sha=C.sha1(fs.readFileSync(require('./genome').sourceTemoin({temoin:nomT})));}catch(e){sha=null;}
  }
  if(!sha&&nomT==='c0025')return [];
  const C9=L.lire(L.F.cerveaux);
  const l=sha?C9.filter(x=>x.sha===sha).pop():null;
  if(l)return [l.id];
  /* un temoin venu du labo (c0101…) y porte son propre nom : s'il n'est pas retrouve par son sha (fin de ligne changee par git), par son nom */
  if(nomT!=='c0025'&&C9.some(x=>x&&x.id===nomT))return [nomT];
  return [];
}

async function inscrire(fichierJson,o){
  o=o||{};
  const cfg=o.cfg||C.lireConfig(),dire=o.dire||(t=>process.stdout.write(t+'\n'));
  const fj=path.resolve(fichierJson);
  const J=JSON.parse(fs.readFileSync(fj,'utf8'));
  if(J.format!=='evolution-champion-1')throw new Error('inscrire-champion : '+fj+' n\'est pas un champion (format '+J.format+')');
  const fjs=fj.replace(/\.json$/,'.js'),source=fs.readFileSync(fjs,'utf8');
  if(C.sha1(source)!==J.shaPilote)throw new Error('inscrire-champion : '+path.basename(fjs)+' ne correspond pas a son .json (sha '+C.sha1(source).slice(0,12)+' au lieu de '+String(J.shaPilote).slice(0,12)+')');
  const graines=(J.validation&&Array.isArray(J.validation.graines))?J.validation.graines.slice():null;
  if(!graines||!graines.length)throw new Error('inscrire-champion : le champion n\'a pas de graines de validation dans son .json');
  const L=require('../labo/labo');
  if(!L.sansCout('evolution'))throw new Error('inscrire-champion : labo.sansCout(\'evolution\') est faux : ajouter /^evolution/ a sansCout() de ml/labo/labo.js '+
    '(une ligne, a la main : function sansCout(modele){return modele===\'main\'||/abonnement$/.test(String(modele||\'\'))||/^evolution/.test(String(modele||\'\'));})');
  const refus=require('./evoluer').refusDePartir();
  if(refus)throw new Error('inscrire-champion : '+refus);
  const G=J.generation|0,tmax=+(o.tmax||cfg.tmax);
  dire('champion '+J.id+' (generation '+G+', pilote '+String(J.shaPilote).slice(0,12)+') : '+graines.length+' courses de '+tmax+' s sur ses graines de validation');
  const R=await rejouer(cfg,source,graines,tmax,o.travailleurs||Math.min(4,cfg.travailleurs||4),dire);
  const courses=R.map(r=>({bilan:r.complet.bilan,partie:r.complet.partie,touches:r.complet.touches}));
  const note=require('../bot/mesures').barre(courses.map(c=>c.partie));delete note.detail;
  const jeu=L.versionJeu();
  const consecutives=graines.every((g,i)=>i===0||g-graines[i-1]===37);
  const c={nom:'evo-g'+String(G).padStart(4,'0'),source:source,etape:'N1',generation:G,modele:'evolution',raison:J.raison,
    parents:parentsLabo(L,cfg,J,path.dirname(fj)),lot:'entrainement',jeu:jeu,
    graines:consecutives?{n:graines.length,depart:graines[0],pas:37}:{n:graines.length,liste:graines},tmax:tmax,note:note,courses:courses};
  dire('a inscrire : '+c.nom+' etape N1 generation '+G+' modele evolution, parents '+(c.parents.join(',')||'aucun')+', palier median '+note.palier_median+
    ', record '+note.palier_record+' ; raison : '+c.raison);
  if(o.essai){dire('--essai : rien n\'est ecrit au labo');return Object.assign({},c,{source:undefined,courses:courses.length});}
  const lacher=L.marquerInscription('N1',G);
  try{
    const ligne=L.inscrire(c);
    L.valider(ligne.id,{etape:'N1',role:'candidat',jeu:jeu,graines:c.graines,tmax:tmax,note:note,courses:courses});
    L.clore('N1',G);
    dire('inscrit : '+ligne.id+' ('+ligne.code+'), valide et generation N1/'+G+' close');
    return ligne;
  }finally{lacher();}
}

module.exports={inscrire};

if(require.main===module){
  const A=process.argv.slice(2),opt=(n,d)=>{const i=A.indexOf('--'+n);return i>=0?A[i+1]:d;};
  const f=A[0]&&!A[0].startsWith('--')?A[0]:null;
  if(!f){process.stderr.write('inscrire-champion : usage : node ml/evolution/inscrire-champion.js <champions/gNNNN-xxxxxxxx.json> [--essai] [--config f.json]\n');process.exit(1);}
  let cfg;try{cfg=C.lireConfig(opt('config',null));}catch(e){process.stderr.write(String(e.message||e)+'\n');process.exit(1);}
  inscrire(f,{cfg:cfg,essai:A.includes('--essai'),travailleurs:opt('travailleurs',null)?+opt('travailleurs'):undefined})
    .then(()=>process.exit(0),e=>{process.stderr.write(String(e&&e.message||e)+'\n');process.exit(/refus|tourne|en cours/.test(String(e&&e.message))?2:1);});
}
