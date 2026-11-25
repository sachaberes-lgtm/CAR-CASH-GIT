#!/usr/bin/env node
/* ===== GARDER UNE COURSE A LA MAIN (2026-11-24, etape 1 bis BOTS-ML : le betisier, « les morts les plus betes et les triches ») =====
   usage : node garder.js c0012 910037 --pourquoi "mort absurde : il saute dans le portail"   [--carte ville --meteo nuit : un candidat d'avant le 24/11 note sur une map imposee]
   Si la generation est encore ouverte, la course sort du tampon. Sinon elle est REJOUEE a partir du code du candidat (un processus
   neuf, une course) et n'est gardee que si elle redonne la meme empreinte que celle du journal — donc sur la meme version du jeu. */
const path=require('path');
const L=require('./labo');
const A=process.argv.slice(2),opt=(n,d)=>{const i=A.indexOf('--'+n);return i>=0?A[i+1]:d;};
const id=A[0],graine=+A[1],pq=opt('pourquoi',null);
if(!id||!graine||!pq){console.log('usage : node garder.js <id> <graine> --pourquoi "…"');process.exit(1);}
const ligne=L.lire(L.F.cerveaux).find(l=>l.id===id);
if(!ligne){console.log('candidat inconnu : '+id);process.exit(1);}
const c0=ligne.courses.find(c=>c.graine===graine);
if(!c0){console.log(id+' n\'a pas couru la graine '+graine+' (ses graines : '+ligne.courses.map(c=>c.graine).join(' ')+')');process.exit(1);}
const t=L.tampon(id);let x=t&&t.courses.find(c=>c.graine===graine);
if(!x){
  const jeu=L.versionJeu();
  if(jeu.sha!==ligne.jeu.sha){console.log(`le jeu a change depuis (${ligne.jeu.version}, empreinte ${ligne.jeu.sha}, commit ${ligne.jeu.commit} → aujourd'hui ${jeu.version}, ${jeu.sha}) : cette course ne se refait que sur l'ancienne version`);process.exit(1);}
  const {ouvrir,charger,course}=require('../bot/piloter');
  /* (2026-11-24, defaut 12 : « le rejeu oubliait la map et la meteo imposees : la course n'etait pas la meme ») la ligne du journal les porte
     depuis le 24/11 ; une ligne plus ancienne n'en a pas : sa note les tirait de la graine, sauf --carte, que l'on retape ici. */
  const carte=opt('carte',ligne.carte||null),meteo=opt('meteo',ligne.meteo||null);
  /* (2026-11-25, simulateur fidele) dans le simulateur de la note (une ligne d'avant le 25/11 : « avant-relief », le canyon sans relief) */
  const sim=L.simulateurDe(ligne.jeu);if(sim!==L.SIMULATEUR)console.log('⚠ '+id+' a ete note dans le simulateur « '+sim+' » (avant le relief du canyon du 25/11) : la course est refaite dans ce simulateur-la');
  const r=L.ensilence(()=>{const J=ouvrir({regime:ligne.jeu&&ligne.jeu.regime,simulateur:sim}),C=charger(path.join(L.RACINE,ligne.code));return course(J,C,graine,{tmax:ligne.tmax,carte:carte,meteo:meteo});});
  if(r.bilan.empreinte!==c0.empreinte){console.log(`la course rejouee n'est pas celle du journal (empreinte ${r.bilan.empreinte} ≠ ${c0.empreinte} ; regime ${(ligne.jeu&&ligne.jeu.regime)||'max'}, map ${carte||'tiree par la graine'}${c0.pannes?' ; cette course avait des decisions coupees : elle n\'est pas repetable':''}) : rien n'est garde`);process.exit(1);}
  x={graine:graine,bilan:r.bilan,partie:r.partie,touches:r.touches};
  console.log('course rejouee a partir du code : meme empreinte que le journal ('+c0.empreinte+')');
}
const rj=L.garder(ligne,x,[pq]);
console.log(`garde : rejeux/${L.nomCourse(id,graine)}.json — ${rj.pourquoi.join(' ; ')}`);
process.exit(0);
