#!/usr/bin/env node
/* ===== RELECTURE DE L'ETUDE « SIMULATEUR » : LE COFFRE PEUT-IL TRANCHER ENTRE LES SCENARIOS ? (28/11/2026, le relecteur) =====
   R6 dit : « si le coffre ne montre rien a 50 000 courses, on est dans le pessimiste ou l'etroit ». Ce script mesure, dans le simulateur, ce
   que le coffre montrerait : a 50 000 courses (vraie configuration, 400/h), le champion et le temoin rejouent les 40 graines du coffre
   (config.json graines.coffre : 990000, pas 37) ; on compte la part des mondes ou champion − temoin depasse 2 erreurs-types (test apparie par graine,
   erreur-type = ET des ecarts / racine(40)).
   node relecture/coffre-puissance.js [mondes]   (un seul processus, ~1 min ; ecrit relecture/coffre-puissance.txt) */
'use strict';
const fs=require('fs'),path=require('path');
const S=require(path.join(__dirname,'..','simuler.js'));
const n=+(process.argv[2]||20),cf=S.CFG0.graines.coffre,G=[];for(let i=0;i<cf.n;i++)G.push(cf.depart+cf.pas*i);
const L=['LE COFFRE A 50 000 COURSES (40 graines, champion − temoin, test apparie) — vraie configuration, 400/h, mondes 8000+k',
  'scenario   | mondes | champion != temoin | vrai dP median | coffre dP median | coffre z > 2 (parmi les mondes ou champion != temoin)'];
for(const sc of ['pessimiste','moyen','optimiste']){
  const vrai=[],cof=[];let z2=0,diff=0;
  for(let k=0;k<n;k++){
    const r=S.evoluer({scenario:sc,graine:8000+k,debit:400,cfg:{},budgets:[50000]}),st=r.st;
    if(st.champion===st.temoin)continue;diff++;
    const D=G.map(g=>S.course(st,st.champion,g).palier-S.course(st,st.temoin,g).palier);
    const m=D.reduce((a,b)=>a+b,0)/D.length,se=Math.sqrt(D.reduce((a,b)=>a+(b-m)*(b-m),0)/(D.length-1)/D.length);
    vrai.push(st.champion.vraiP-st.temoin.vraiP);cof.push(m);if(se>0&&m/se>2)z2++;
  }
  const med=X=>{if(!X.length)return NaN;const B=X.slice().sort((a,b)=>a-b),i=(B.length-1)/2;return (B[Math.floor(i)]+B[Math.ceil(i)])/2;};
  L.push(sc.padEnd(10)+' | '+String(n).padStart(6)+' | '+String(diff).padStart(18)+' | '+med(vrai).toFixed(2).padStart(14)+' | '+med(cof).toFixed(2).padStart(16)+' | '+z2+' sur '+diff);
}
const t=L.join('\n')+'\n';fs.writeFileSync(path.join(__dirname,'coffre-puissance.txt'),t);process.stdout.write(t);
