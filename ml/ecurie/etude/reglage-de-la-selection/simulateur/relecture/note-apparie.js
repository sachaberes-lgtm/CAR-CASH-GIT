#!/usr/bin/env node
/* ===== RELECTURE DE L'ETUDE « SIMULATEUR » : Q3 EN ECARTS APPARIES (28/11/2026, le relecteur) =====
   resultats/note.txt donne des MEDIANES par case (10 mondes), non appariees. Ce script relit resultats/note-*.json (les memes evolutions) et
   donne, monde par monde, l'ecart poids 0 − poids 4 et poids 16 − poids 4 du champion (dP, dE, F4), moyenne ± erreur-type.
   node relecture/note-apparie.js   (lecture seule de resultats/ ; ecrit relecture/note-apparie.txt) */
'use strict';
const fs=require('fs'),path=require('path');
const dir=path.join(__dirname,'..','resultats');
const R=[];for(const f of fs.readdirSync(dir))if(/^note-\d+\.json$/.test(f))R.push(...JSON.parse(fs.readFileSync(path.join(dir,f),'utf8')));
const pt=r=>r.points.find(p=>p.budget===50000);
const st=X=>{const m=X.reduce((s,x)=>s+x,0)/X.length,se=Math.sqrt(X.reduce((s,x)=>s+(x-m)*(x-m),0)/(X.length-1)/X.length);return ((m>=0?'+':'')+m.toFixed(2)+' ± '+se.toFixed(2)).padEnd(13);};
const L=['Q3 EN ECARTS APPARIES (memes mondes), champion a 50 000 courses ; dE en ecart vrai (negatif = plus ressemblant)',
  'scenario   | loi de E    | ecart        | dP            | dE            | F4'];
for(const s of ['pessimiste','moyen','optimiste'])for(const e of ['inerte','independant','conflit']){
  const G=p=>R.filter(r=>r.nom===s+' | E '+e+' | poids '+p);
  const P4=G(4);
  for(const p of [0,16]){
    const D=[];for(const r of G(p)){const b=P4.find(x=>x.k===r.k);if(!b)continue;const x=pt(r),y=pt(b);
      D.push({dP:x.champion.dP-y.champion.dP,dE:x.champion.dE-y.champion.dE,F4:(x.champion.dP-4*x.champion.dE)-(y.champion.dP-4*y.champion.dE)});}
    if(D.length<2)continue;
    L.push(s.padEnd(10)+' | '+e.padEnd(11)+' | poids '+String(p).padEnd(2)+' − 4 | '+st(D.map(x=>x.dP))+' | '+st(D.map(x=>x.dE))+' | '+st(D.map(x=>x.F4))+' ('+D.length+' mondes)');
  }
}
const t=L.join('\n')+'\n';fs.writeFileSync(path.join(__dirname,'note-apparie.txt'),t);process.stdout.write(t);
