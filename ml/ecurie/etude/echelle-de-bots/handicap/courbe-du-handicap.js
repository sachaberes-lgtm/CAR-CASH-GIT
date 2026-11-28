/* ===== LA VOIE DU HANDICAP : ce que les fichiers disent deja (28/11/2026, concepteur « handicap ») =====
   Lecture seule, aucune course. Depuis la racine du depot :
     node ml/ecurie/etude/echelle-de-bots/handicap/courbe-du-handicap.js > ml/ecurie/etude/echelle-de-bots/handicap/sortie-courbe-du-handicap.txt
   Lit : lecteur-joueurs/sortie.json (les 14 parties des joueurs) et banc-des-genes/etat/courses-2026-48.jsonl (c0025 = le bras « depart », 96 courses).
   Les parties A a D sont des COMPTES ; E, F et G sont des CALCULS (un modele ecrit ici, pas une mesure). */
'use strict';
const fs=require('fs');
const J=Object.values(JSON.parse(fs.readFileSync('ml/ecurie/etude/echelle-de-bots/lecteur-joueurs/sortie.json','utf8')));
const L=fs.readFileSync('ml/ecurie/etude/banc-des-genes/etat/courses-2026-48.jsonl','utf8').trim().split('\n').map(JSON.parse);
const D=L.filter(c=>c.id==='depart');
const SEUILS=[0,40,85,150,225,305,400,505,615,730,860,995,1130,1280,1430,1585,1745,1910,2080,2255,2440,2630,2825,3030,3240,3455,3680,3910,4145,4385];
const palierDe=p=>{let k=1;for(let i=0;i<30;i++)if(p>=SEUILS[i])k=i+1;return k;};
const tri=a=>[...a].sort((x,y)=>x-y);
const q=(a,p)=>{const s=tri(a);const x=p*(s.length-1),i=Math.floor(x);return i+1<s.length?s[i]+(s[i+1]-s[i])*(x-i):s[i];};
const moy=a=>a.reduce((x,y)=>x+y,0)/a.length;
const et=a=>Math.sqrt(a.reduce((s,x)=>s+(x-moy(a))**2,0)/(a.length-1));
const f=(x,n)=>x.toFixed(n==null?1:n);
function hasard(a){a|=0;return function(){a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}

console.log('== A. LE RISQUE DE MOURIR DANS LA MINUTE (une partie = jusqu a sa fin ; une seconde chance prise ne coupe pas la partie) ==');
function risque(durees,nom){const r=[];for(let m=0;m<10;m++){const viv=durees.filter(d=>d>m*60).length,meurt=durees.filter(d=>d>m*60&&d<=(m+1)*60).length;if(!viv)break;r.push('min '+(m+1)+' : '+meurt+'/'+viv+' ('+f(100*meurt/viv,0)+' %)');}console.log(nom+' : '+r.join(' · '));}
risque(J.map(p=>p.duree_s),'joueurs (14 parties)');
risque(J.filter(p=>!p.doigt).map(p=>p.duree_s),'  dont clavier (10)');
risque(D.map(c=>c.survie_s),'c0025 (96 courses)');
risque(L.map(c=>c.survie_s),'les 1 250 du banc');

console.log('\n== B. MEDIANE ET « RECORD SUR 20 PARTIES » (le record sur 20 parties tombe, une fois sur deux, au quantile 96,6 % : 0,5^(1/20)) ==');
const SJ=J.filter(p=>!p.doigt).map(p=>p.palier),TJ=J.map(p=>p.palier),PC=D.map(c=>c.palier);
console.log('joueur au clavier, '+SJ.length+' parties : mediane '+f(q(SJ,.5))+' · record '+Math.max(...SJ)+' · record/mediane '+f(Math.max(...SJ)/q(SJ,.5),2)+' · moyenne '+f(moy(SJ))+' · ecart-type '+f(et(SJ)));
console.log('les 14 parties : mediane '+f(q(TJ,.5))+' · record '+Math.max(...TJ));
console.log('c0025, 96 courses : mediane '+f(q(PC,.5))+' · q90 '+f(q(PC,.9))+' · q96,6 '+f(q(PC,.966))+' · max '+Math.max(...PC)+' · moyenne '+f(moy(PC),2)+' · ecart-type '+f(et(PC),2)+' · cv '+f(et(PC)/moy(PC),2));
{const h=hasard(161),rec=[];for(let i=0;i<20000;i++){let m=0;for(let j=0;j<20;j++){const v=PC[Math.floor(h()*PC.length)];if(v>m)m=v;}rec.push(m);}
 console.log('c0025, record de 20 parties tirees au sort dans les 96 (20 000 tirages) : mediane '+f(q(rec,.5),0)+' · q10 '+f(q(rec,.1),0)+' · q90 '+f(q(rec,.9),0)+' · record/mediane '+f(q(rec,.5)/q(PC,.5),2));}

console.log('\n== C. L HEURE OU TOMBE CHAQUE PALIER : les joueurs (t_palier de sortie.json) et c0025 (pente du banc, palier/sortie-debit-et-survie.txt : pieces = -128,3 + 281,1 x minutes) ==');
for(const k of [5,10,15,20,25]){
  const t=J.map(p=>p.t_palier&&p.t_palier[k]).filter(x=>x!=null);
  const tb=(SEUILS[k-1]+128.3)/281.1*60;
  console.log('palier '+String(k).padStart(2)+' ('+String(SEUILS[k-1]).padStart(4)+' pieces) : joueurs '+(t.length?(t.length+' parties, de '+f(Math.min(...t),0)+' a '+f(Math.max(...t),0)+' s, mediane '+f(q(t,.5),0)+' s'):'aucune')+' · c0025 vers '+f(tb,0)+' s · rapport '+(t.length?f(tb/q(t,.5),2):'-'));}

console.log('\n== D. CE QUE LES GENES A INTERRUPTEUR DEJA JOUES DEPLACENT (banc des genes, 96 courses par bras) ==');
{const ids=[...new Set(L.map(c=>c.id))].filter(i=>L.filter(c=>c.id===i).length>=90&&i!=='depart');const m0=moy(PC);
 const e=ids.map(i=>({i,d:moy(L.filter(c=>c.id===i).map(c=>c.palier))-m0})).sort((a,b)=>a.d-b.d);
 console.log('ecart de palier moyen a c0025 ('+f(m0,2)+') : '+e.map(x=>x.i+' '+(x.d>=0?'+':'')+f(x.d,2)).join(' · '));
 console.log('le plus grand ecart : '+f(Math.max(...e.map(x=>Math.abs(x.d))),2)+' palier.');}

console.log('\n== E. CALCUL : LE RISQUE PAR MINUTE QU IL FAUT POUR « NE PERD JAMAIS » (risque constant r par minute pendant les T minutes jusqu au palier 30) ==');
for(const [nom,T] of [['pilote parfait, 100 % des pieces',4],['debit des joueurs (436/min)',10.1],['debit marginal de c0025 (281/min)',16.1],['debit moyen de c0025 (226,6/min)',19.4]])
  console.log(nom.padEnd(36)+' T = '+f(T,1).padStart(4)+' min : arriver 95 fois sur 100 -> r <= '+f(100*(1-Math.pow(.95,1/T)),2)+' % par minute · 99 fois sur 100 -> r <= '+f(100*(1-Math.pow(.99,1/T)),2)+' %');
console.log('a comparer au risque compte en A : minutes 1 a 4, c0025 18 a 69 %, joueurs 18 a 44 %.');
console.log('courses SANS UNE MORT a aligner pour affirmer (a 95 %) un taux de reussite >= 95 % : '+Math.ceil(Math.log(.05)/Math.log(.95))+' · >= 99 % : '+Math.ceil(Math.log(.05)/Math.log(.99))+' · >= 99,9 % : '+Math.ceil(Math.log(.05)/Math.log(.999)));

console.log('\n== F. CALCUL : LE HANDICAP COMME UN RISQUE AJOUTE (c0025 + h fautes mortelles par minute, a toute heure ; pieces gagnees en ligne droite dans chaque course ; seconde chance ignoree ; 500 tirages par course) ==');
console.log('h/min | palier median | q10-q90 | moyen | record sur 20 (q96,6) | survie mediane (s)');
{const h=hasard(20261128);
 for(const lam of [0,.1,.2,.35,.5,.75,1,1.5,2,3,5]){
  const P=[],S=[];
  for(const c of D)for(let i=0;i<500;i++){const t=lam>0?-Math.log(1-h())/lam*60:1e9,T=Math.min(t,c.survie_s);S.push(T);P.push(palierDe(c.pieces*T/c.survie_s));}
  console.log(String(lam).padStart(5)+' | '+f(q(P,.5),0).padStart(4)+' | '+f(q(P,.1),0)+'-'+f(q(P,.9),0)+' | '+f(moy(P),2)+' | '+f(q(P,.966),0)+' | '+f(q(S,.5),0));}}
console.log('lecture : la reponse ATTENDUE d un bouton qui n ajouterait que des morts sans changer la conduite ; un vrai bouton (reaction, erreurs, nitro) changera aussi le debit : a mesurer.');

console.log('\n== G. CALCUL : la precision d une mediane mesuree (ecart-type = 0,5 x palier, erreur de la mediane = 1,25 x ecart-type / racine(n), a 95 %) ==');
for(const n of [12,24,48,96,192])console.log('n '+String(n).padStart(3)+' : '+[3,7,12].map(m=>'palier '+m+' : +/- '+f(1.96*1.25*.5*m/Math.sqrt(n),2)).join(' · '));
