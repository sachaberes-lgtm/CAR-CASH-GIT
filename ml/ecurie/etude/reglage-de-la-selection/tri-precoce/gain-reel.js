/* ===== TRI PRECOCE : LE GAIN DE TEMPS DE CHAQUE SCHEMA, CALCULE SUR LES VRAIES COURSES DE LA GEN. 1 (27/11/2026, etude « tri-precoce ») =====
   La gen. 1 de la vraie evolution (26 pilotes : 20 anciens, 6 enfants) a joue ses graines dans l'ordre ; on additionne le temps reel (ms) des courses
   que chaque schema aurait jouees : A toutes ; B2/B4/B8 les enfants toutes, les anciens les 2/4/8 premieres graines ; D les enfants seulement ;
   K (le tri des clones) : un enfant dont les 4 premieres courses sont celles de son parent s'arrete la.
   Le debit du Xeon est mesure (191 courses/h a la gen. 0, soit des generations de 312 courses) ; le Ryzen n'est pas mesure.
   usage : node gain-reel.js > gain-reel.txt */
'use strict';
const fs=require('fs'),path=require('path');
const L=fs.readFileSync(path.join(__dirname,'donnees','courses-2026-48.jsonl'),'utf8').trim().split('\n').map(JSON.parse).filter(l=>l.usage==='entrainement'&&l.generation===1&&l.mesuree);
const pop=JSON.parse(fs.readFileSync(path.join(__dirname,'donnees','population.json'),'utf8'));
const enf=new Set(pop.vivants.filter(v=>v.ne===1).map(v=>v.id));
const gr=[...new Set(L.map(l=>l.graine))];
const complet=gr.filter(g=>L.filter(l=>l.graine===g).length===26);
console.log('gen. 1 : '+L.length+' courses lues, '+gr.length+' graines entamees, '+complet.length+' completes (26 pilotes) ; on ne compte que les graines completes, ramenees a 12');
const Lc=L.filter(l=>complet.indexOf(l.graine)>=0),rang=g=>complet.indexOf(g);
const parPG=new Map();for(const l of Lc)parPG.set(l.id+'|'+l.graine,l);
const clone=id=>{const v=pop.vivants.find(x=>x.id===id);const p=v.parents[0];return complet.slice(0,4).every(g=>{const a=parPG.get(id+'|'+g),b=parPG.get(p+'|'+g);return a&&b&&a.empreinte===b.empreinte;});};
/* les courses de toutes les graines completes comptent pour 12/n (on ramene a une generation de 12 graines) ; les k premieres d'un ancien, telles quelles */
const R12=12/complet.length;
const tot=f=>Lc.filter(l=>f(l)).reduce((s,l)=>s+l.ms/1000*(l._plein?R12:1),0);
for(const l of Lc)l._plein=true;
const totK=(k,avecClone)=>Lc.reduce((s,l)=>{if(enf.has(l.id)){if(avecClone&&clone(l.id))return s+(rang(l.graine)<4?l.ms/1000:0);return s+l.ms/1000*R12;}return s+(k==null?l.ms/1000*R12:(rang(l.graine)<k?l.ms/1000:0));},0);
const T={A:totK(null,false)};
for(const k of [2,4,8])T['B'+k]=totK(k,false);
T['B4+K']=totK(4,true);
T['A+K']=totK(null,true);
T['D']=totK(0,false);
const gA=24*191/312;
console.log('schema | temps des courses (s, ramene a 12 graines) | part de A | generations par jour sur le Xeon (A = 24 x 191 / 312 = '+gA.toFixed(1)+')');
for(const k in T)console.log(k.padEnd(6)+' | '+T[k].toFixed(0).padStart(7)+' | '+(100*T[k]/T.A).toFixed(1).padStart(5)+' % | '+(gA*T.A/T[k]).toFixed(1));
console.log('clones a k = 4 dans la gen. 1 : '+[...enf].filter(clone).join(', '));

/* LA PRECISION DE LA NOTE D'UN ANCIEN NE EN GEN. 0 ET ENCORE VIVANT A LA GEN. 10 (formule : se_a = sigma/sqrt(n), se_F = sqrt(se_a^2 + 16 se_E^2),
   se_E = kE/sqrt(parties), parties = 78 % des courses ; sigma, kE, la part des parties : residus.json) */
const R=require('./residus.json');
console.log('\nprecision de la note d\'un pilote ne en gen. 0, a la gen. 10 (sigma '+R.sigmaRes.toFixed(2)+', kE '+R.kE.toFixed(2)+', parties '+(100*R.partParties).toFixed(0)+' %) :');
for(const [nom,n] of [['A',12*11],['B8',12+8*10],['B4',12+4*10],['B2',12+2*10],['D',12]]){
  const sa=R.sigmaRes/Math.sqrt(n),se=R.kE/Math.sqrt(R.partParties*n),sf=Math.sqrt(sa*sa+16*se*se);
  console.log(nom.padEnd(3)+' : '+String(n).padStart(3)+' courses -> se_a '+sa.toFixed(2)+', se_F '+sf.toFixed(2)+' palier');}
console.log('(l\'ET VRAIE entre les mutants de la gen. 0, mesures.txt § A : '+R.etVraieA.toFixed(2)+' palier sur a, 0 sur E ; test-retest gen. 0 / gen. 1 : negatif)');
