#!/usr/bin/env node
/* ===== GARDER UNE COURSE A LA MAIN (2026-11-24, etape 1 bis BOTS-ML : le betisier, « les morts les plus betes et les triches ») =====
   usage : node garder.js c0012 910037 --pourquoi "mort absurde : il saute dans le portail"
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
  const r=L.ensilence(()=>{const J=ouvrir(),C=charger(path.join(L.RACINE,ligne.code));return course(J,C,graine,{tmax:ligne.tmax});});
  if(r.bilan.empreinte!==c0.empreinte){console.log(`la course rejouee n'est pas celle du journal (empreinte ${r.bilan.empreinte} ≠ ${c0.empreinte}) : rien n'est garde`);process.exit(1);}
  x={graine:graine,bilan:r.bilan,partie:r.partie,touches:r.touches};
  console.log('course rejouee a partir du code : meme empreinte que le journal ('+c0.empreinte+')');
}
const rj=L.garder(ligne,x,[pq]);
console.log(`garde : rejeux/${L.nomCourse(id,graine)}.json — ${rj.pourquoi.join(' ; ')}`);
process.exit(0);
