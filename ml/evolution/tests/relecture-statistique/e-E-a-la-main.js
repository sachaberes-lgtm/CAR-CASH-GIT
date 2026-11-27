/* ===== RELECTURE STATISTIQUE : E et F refaits a la main sur une reference truquee =====
   REF : air m 0,2 s 0,1 ; vols m 5 s 1 ; volDuree m 1 s 0,5. Cinq parties : air 0,45 (z 2,5), vols 7 (z 2, poids 0,5), volDuree 1,2 (z 0,4, poids 0,5).
   A la main : e_air = 1,5 (w 1) ; e_vols = 1 (w 0,5) ; e_volDuree = 0 (w 0,5) ; E = (1,5 + 0,5) / 2 = 1,0.
   Quatre parties seulement : E = 4 (le pire). */
'use strict';
const path=require('path');
const N=require(path.join(__dirname,'..','..','note.js'));
const cfg=require(path.join(__dirname,'..','..','config.json'));
const REF={air:{m:.2,s:.1,n:8},vols:{m:5,s:1,n:8},volDuree:{m:1,s:.5,n:8}};
const P=()=>({air:.45,vols:7,volDuree:1.2});
const M5=[P(),P(),P(),P(),P()];
const e5=N.ecartFoule(M5,REF,cfg);
console.log('5 parties : E '+e5.E+' (a la main 1), se_E '+e5.seE+' (parties identiques : 0), classique '+e5.ecartClassique+' (a la main (2,5+2+0,4)/3 = 1,633)');
console.log('4 parties : E '+N.ecartFoule(M5.slice(0,4),REF,cfg).E+' (a la main 4)');
/* une mesure absente de toutes les parties d'un pilote sort du denominateur : un pilote sans volDuree */
const sans=M5.map(m=>({air:m.air,vols:m.vols}));
console.log('5 parties sans volDuree : E '+N.ecartFoule(sans,REF,cfg).E+' (a la main (1,5+0,5)/1,5 = 1,333 : la mesure absente ne compte ni pour ni contre)');
/* F et se_F : deux pilotes, deux graines, palier = a + b */
const L=[];const a={X:6,Y:4},b={1:1,2:-1};
for(const p of ['X','Y'])for(const g of [1,2])L.push({id:p,graine:g,mesuree:true,palier:a[p]+b[g],survie_s:100,mesures:P()});
for(let i=3;i<=5;i++)for(const p of ['X','Y'])L.push({id:p,graine:i,mesuree:true,palier:a[p],survie_s:100,mesures:P()});
const r=N.noter(L,{REF,cfg});
/* a la main : a X 6, Y 4 (exact) ; ā 5 ; n 5 ; â X = 1*5/17+5 = 5,2941 ; F X = 5,2941 - 4*1 = 1,2941 ; sigmaRes 0 -> se_F 0 */
console.log('noter : X a '+r.par.X.a.toFixed(4)+' â '+r.par.X.ahat.toFixed(4)+' F '+r.par.X.F.toFixed(4)+' se_F '+r.par.X.se_F+' ; Y â '+r.par.Y.ahat.toFixed(4)+' F '+r.par.Y.F.toFixed(4)+' (a la main : 6, 5.2941, 1.2941, 0 ; 4.7059, 0.7059)');
