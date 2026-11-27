/* ===== RELECTURE STATISTIQUE : E depend-il du nombre de parties ? (donnees reelles de l'etude du bruit) =====
   E = Σ w max(0, |z(moyenne des parties)| − 1) / Σ w : |z| d'une moyenne est biaise vers le haut quand il y a peu de parties.
   Pour chaque pilote a 24 courses de 300 s (deux lots) et pour les 4 grandes notes de 900 s (20 courses), on compare E sur toutes ses
   parties a la moyenne de E sur des sous-lots tires sans remise de k parties (k = 5, 8, 12, 16). Et on compte les mesures presentes. */
'use strict';
const path=require('path');
const N=require(path.join(__dirname,'..','..','note.js'));
const cfg=require(path.join(__dirname,'..','..','config.json'));
const X=require(path.join(__dirname,'..','..','..','ecurie','etude','selection-naturelle','bruit','courses-0.json'));
const REF=N.referenceEpoque();
const cn=Object.assign({},cfg.note,{bootstrapE:2});
function rng(s){let a=s|0;return ()=>{a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return ((t^(t>>>14))>>>0)/4294967296;};}
const u=rng(5);
const E=M=>N.ecartFoule(M,REF,cn).E;
/* les lots : par sha, les deux lots de 300 s reunis ; les grandes notes a part */
const parSha=new Map();
for(const x of X)if(x.tmax===300){if(!parSha.has(x.sha))parSha.set(x.sha,[]);parSha.get(x.sha).push(...x.courses.map(c=>c.m).filter(Boolean));}
const lots=[...parSha.entries()].filter(([,M])=>M.length>=20).map(([s,M])=>({nom:s.slice(0,8),M}));
for(const x of X)if(x.tmax===900)lots.push({nom:x.fichier,M:x.courses.map(c=>c.m).filter(Boolean)});
const K=[5,8,12,16],S={};for(const k of K)S[k]=0;
let nl=0;const presence={};
for(const L of lots){
  const tout=E(L.M);nl++;
  for(const k of K){let s=0;const T=60;for(let t=0;t<T;t++){const P=L.M.slice();for(let i=P.length-1;i>0;i--){const j=Math.floor(u()*(i+1));[P[i],P[j]]=[P[j],P[i]];}s+=E(P.slice(0,k));}S[k]+=s/T-tout;}
  const r=require(path.join(__dirname,'..','..','..','bot','ressemblance.js')).ecart(null,{mesures:L.M,reference:REF});
  const cles=r.mesures.map(m=>m.cle).sort().join(',');presence[cles]=(presence[cles]||0)+1;
}
console.log(lots.length+' lots de '+Math.min(...lots.map(l=>l.M.length))+' a '+Math.max(...lots.map(l=>l.M.length))+' parties');
for(const k of K)console.log('E sur '+String(k).padStart(2)+' parties - E sur toutes : '+(S[k]/nl>=0?'+':'')+(S[k]/nl).toFixed(3)+' (moyenne des lots) ; en F (x4) : '+(4*S[k]/nl).toFixed(3));
console.log('mesures presentes dans E, par lot :');for(const [c,n] of Object.entries(presence))console.log('  '+n+' lot(s) : '+c.split(',').length+' mesures ('+c+')');
console.log('mesures de la reference : '+Object.keys(REF).filter(k=>REF[k]).length+' ('+Object.keys(REF).filter(k=>REF[k]).join(',')+')');
