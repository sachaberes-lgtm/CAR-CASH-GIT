#!/usr/bin/env node
/* ===== RELECTURE DE L'ETUDE « SIMULATEUR » : LES FAUX SACRES PAR UN CHEMIN INDEPENDANT (28/11/2026, le relecteur) =====
   La question : le taux de faux sacres par validation que donne le simulateur dans un monde sans effet (resultats/monde-nul.txt : 5,9 % ± 2,2 a
   seuilSacre 2 et 24 graines) se retrouve-t-il SANS le simulateur ?
   Le chemin : le VRAI note.comparer (ml/evolution/note.js, avec le vrai E calcule sur les mesures et la vraie reference des joueurs) applique a
   de VRAIES courses du 27/11 (la copie figee donnees/courses-2026-48.jsonl, lignes d'entrainement mesurees). L'hypothese nulle : pour chaque
   graine de validation, on tire une vraie graine, puis DEUX courses de deux pilotes differents sur cette graine (l'appariement par graine est
   donc le vrai, et la loi du palier entier est la vraie). Les pilotes du 27/11 ne valent pas exactement la meme chose (dispersion vraie ~0,3 a
   0,6 palier) : le meneur A et le champion B sont tires au hasard, donc l'ecart vrai est nul EN MOYENNE (le test est un peu plus bruite que le nul strict).
   Variante « parents proches » : une part z des graines rend la MEME course a A et B (deux pilotes au meme comportement sur la graine, comme
   un enfant et son parent), pour voir si cela gonfle le taux (une hypothese du relecteur sur l'ecart 5,9 % contre 3,7 %).
   Le seuil (a) est applique a 1, 2 et 3 erreurs-types sur les MEMES comparaisons ; (b) et (c) comme note.comparer.
   node relecture/faux-sacres-reel.js [essais]   (un seul processus ; ~1 a 3 min ; n'ecrit que relecture/faux-sacres-reel.txt) */
'use strict';
const fs=require('fs'),path=require('path');
const ICI=path.join(__dirname,'..'),ML=path.join(ICI,'..','..','..','..');
const N=require(path.join(ML,'evolution','note.js'));
const cfg=JSON.parse(fs.readFileSync(path.join(ML,'evolution','config.json'),'utf8'));
const REF=N.referenceEpoque();
const L=fs.readFileSync(path.join(ICI,'donnees','courses-2026-48.jsonl'),'utf8').trim().split('\n').map(JSON.parse)
  .filter(l=>l.usage==='entrainement'&&l.mesuree===true);
const parG=new Map();for(const l of L){if(!parG.has(l.graine))parG.set(l.graine,[]);parG.get(l.graine).push(l);}
const graines=[...parG.keys()].filter(g=>parG.get(g).length>=10);
/* un generateur a part (mulberry32 ecrit ici, pas celui de graines.js) */
function rng(s){let a=s>>>0;return ()=>{a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return ((t^(t>>>14))>>>0)/4294967296;};}
const essais=+(process.argv[2]||1500);
const sortie=[];const dire=t=>{sortie.push(t);console.log(t);};
dire('FAUX SACRES PAR VALIDATION SOUS L\'HYPOTHESE NULLE, VRAI note.comparer SUR LES VRAIES COURSES DU 27/11 ('+L.length+' lignes, '+graines.length+' graines) ; '+essais+' essais par case');
dire('n graines | part identique | seuil 1          | seuil 2          | seuil 3          | ET reelle de dF / se_dF moyen du bootstrap');
const t0=Date.now();
for(const n of [12,24,48])for(const z of [0,0.5,0.8]){
  if(n!==24&&z>0)continue;
  const u=rng(1000*n+Math.round(100*z)+7);
  const s=[0,0,0],DF=[],SE=[];
  for(let t=0;t<essais;t++){
    const LA=[],LB=[];
    for(let i=0;i<n;i++){
      const g=graines[Math.floor(u()*graines.length)],P=parG.get(g);
      const ia=Math.floor(u()*P.length);let ib=Math.floor(u()*(P.length-1));if(ib>=ia)ib++;
      const a=P[ia],b=u()<z?a:P[ib],gg=1000000+37*i;
      LA.push({id:'A',graine:gg,mesuree:true,palier:a.palier,mesures:a.mesures});
      LB.push({id:'B',graine:gg,mesuree:true,palier:b.palier,mesures:b.mesures});
    }
    const r=N.comparer(LA,LB,{REF,cfg});
    DF.push(r.dF);SE.push(r.se_dF);
    const bc=r.criteres.b&&r.criteres.c;
    [1,2,3].forEach((k,j)=>{if(bc&&r.dF>k*r.se_dF)s[j]++;});
  }
  const m=DF.reduce((x,y)=>x+y,0)/DF.length,et=Math.sqrt(DF.reduce((x,y)=>x+(y-m)*(y-m),0)/(DF.length-1)),seM=SE.reduce((x,y)=>x+y,0)/SE.length;
  const cas=k=>{const p=s[k]/essais;return ((100*p).toFixed(1)+' % ± '+(100*Math.sqrt(p*(1-p)/essais)).toFixed(1)).padEnd(16);};
  dire(String(n).padEnd(9)+'| '+String(z).padEnd(15)+'| '+cas(0)+' | '+cas(1)+' | '+cas(2)+' | '+et.toFixed(3)+' / '+seM.toFixed(3)+' (rapport '+(et/seM).toFixed(2)+')');
}
dire('('+((Date.now()-t0)/1000).toFixed(0)+' s)');
fs.writeFileSync(path.join(__dirname,'faux-sacres-reel.txt'),sortie.join('\n')+'\n');
