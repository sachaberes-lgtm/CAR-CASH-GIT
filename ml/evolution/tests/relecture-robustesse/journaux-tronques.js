#!/usr/bin/env node
/* ===== RELECTURE ROBUSTESSE : UNE LIGNE TRONQUEE DANS morts.jsonl / generations.jsonl / validations.jsonl (2026-11-27, le relecteur) =====
   Un kill dur pendant ajouterLigne laisse une ligne sans « \n » a la fin d'un journal du maitre. courses.js repare SES fichiers
   (reparerFins) ; evoluer.js ne repare pas les siens. On copie l'etat des tests de l'integrateur, on tronque, on fait ce que fait le
   maitre (charger, puis ajouterLigne comme ecrireMort), on recharge, et on regarde ce que le maitre croit savoir. Aucune course n'est jouee. */
'use strict';
const path=require('path'),fs=require('fs');
const O=require('./outils');
const E=require(path.join(O.EVOL,'evoluer.js')),C=require(path.join(O.EVOL,'commun.js'));

const src=path.join(O.EVOL,'essais','tests-evoluer','etat'),etat=path.join(O.ICI,'etat-journaux');
fs.rmSync(etat,{recursive:true,force:true});fs.cpSync(src,etat,{recursive:true});
const cfg=C.lireConfig('config-essai.json');cfg.dossierEtat=etat;cfg.dossierChampions=path.join(etat,'champions');
const silence=()=>{};

const etatCtx=ctx=>'morts connus '+ctx.deja.morts.size+', generations connues '+ctx.deja.generations.size+', validations '+ctx.deja.validations.size+', maledictions '+ctx.maledictions.length;
let ctx=E.charger(cfg,{dire:silence});
O.dire('avant : '+etatCtx(ctx));

/* le kill dur au milieu de l'ajout d'une ligne de morts.jsonl et de generations.jsonl et de validations.jsonl */
for(const n of ['morts.jsonl','generations.jsonl','validations.jsonl']){
  const f=path.join(etat,n),t=fs.readFileSync(f,'utf8').split('\n').filter(Boolean);
  fs.appendFileSync(f,t[t.length-1].slice(0,57));
}
ctx=E.charger(cfg,{dire:silence});
O.dire('apres la coupure (ligne tronquee en fin) : '+etatCtx(ctx));
/* le maitre repart et ajoute une ligne, comme ecrireMort / la fin de generation */
C.ajouterLigne(path.join(etat,'morts.jsonl'),{id:'aaaaaaaaaaaa',mort:6,raison:'renvoi'});
C.ajouterLigne(path.join(etat,'generations.jsonl'),{generation:6,date:new Date().toISOString()});
C.ajouterLigne(path.join(etat,'validations.jsonl'),{generation:6,usage:'validation',meneur:'x',champion:'y',graines:[1],malediction:0.5});
ctx=E.charger(cfg,{dire:silence});
O.dire('apres la ligne suivante : '+etatCtx(ctx));
C.ajouterLigne(path.join(etat,'morts.jsonl'),{id:'bbbbbbbbbbbb',mort:7,raison:'renvoi'});C.ajouterLigne(path.join(etat,'generations.jsonl'),{generation:7,date:new Date().toISOString()});C.ajouterLigne(path.join(etat,'validations.jsonl'),{generation:7,usage:'validation',meneur:'x',champion:'z',graines:[2],malediction:0.5});
ctx=E.charger(cfg,{dire:silence});
O.dire('apres une ligne de plus : '+etatCtx(ctx));
try{C.lireJsonl(path.join(etat,'morts.jsonl'));O.dire('commun.lireJsonl(morts.jsonl) : lu');}
catch(e){O.dire('commun.lireJsonl(morts.jsonl) : LEVE : '+e.message.replace(etat,'<etat>'));}
try{const ET=require(path.join(O.EVOL,'etat.js'));const al=[];const L=ET.lireJsonlTolerant(path.join(etat,'generations.jsonl'),al);O.dire('etat.js lireJsonlTolerant(generations) : '+L.length+' lignes, alertes '+al.length);}
catch(e){O.dire('etat.js : '+e.message);}
