#!/usr/bin/env node
/* ===== VITESSE : LE GAIN DE CHAQUE ACCELERATION SUR UNE GENERATION ENTIERE (2026-11-27, etude « vitesse ») =====
   Ne joue rien : lit ce que les autres scripts du dossier ont ecrit (resultats-donnees.json, profils/course*.json, profils/compilation.json,
   les profils .cpuprofile) et en tire, pour chaque acceleration, le temps gagne par course et sur une generation de 312 courses.
   La base : la generation 1 de la vraie evolution, 4 courses a la fois sur le Xeon (resultats-donnees.json, fenetre A).
   Les parts (en %) viennent des courses chronometrees SEULES (une a la fois, PC charge par la vraie evolution) ; on suppose qu'une part
   mesuree seule reste la meme a 4 a la fois (SUPPOSE, pas mesure : verifie seulement pour le cout fixe, 27,6 % dans les deux cas).
   Usage : node estimer-gains.js > gains.txt */
'use strict';
const fs=require('fs'),path=require('path');
const J=f=>JSON.parse(fs.readFileSync(path.join(__dirname,f),'utf8').split('\n')[0]);
const D=JSON.parse(fs.readFileSync(path.join(__dirname,'resultats-donnees.json'),'utf8'));
const c1=J('profils/course1-profil.json'),c2=J('profils/course2-reference.json'),c3=J('profils/course3-sans-ciel.json'),c4=J('profils/course4-sans-ciel-profil.json');
const CO=JSON.parse(fs.readFileSync(path.join(__dirname,'profils','compilation.json'),'utf8'));
const out=[];const dire=t=>out.push(t);const r1=x=>Math.round(x*10)/10,pc=x=>(100*x).toFixed(1)+' %';
/* les appels a envCielCalc dans un profil : des blocs d'echantillons contigus (un appel dure ~1 a 2 s, deux appels sont separes de secondes) */
function blocsCiel(f){const P=JSON.parse(fs.readFileSync(path.join(__dirname,'profils',f),'utf8'));const par=new Map(P.nodes.map(n=>[n.id,n]));const ids=new Set();
  (function m(id,d){const n=par.get(id);const ok=d||n.callFrame.functionName==='envCielCalc';if(ok)ids.add(id);for(const c of n.children||[])m(c,ok);})(P.nodes[0].id,false);
  let t=0,en=false,deb=0,last=0;const B=[];for(let i=0;i<P.samples.length;i++){t+=P.timeDeltas[i]/1000;const x=ids.has(P.samples[i]);if(x&&!en){en=true;deb=t;}if(!x&&en&&t-last>20){en=false;B.push(last-deb);}if(x)last=t;}if(en)B.push(last-deb);return B;}
const F=D.fenetres[0];const base=F.parCourse_s,gen=312*base/4/60;
dire('BASE : generation 1 de la vraie evolution, 4 a la fois sur le Xeon : '+base+' s de travailleur par course -> 312 courses = '+r1(gen)+' min ('+r1(3600*4/base)+' courses/h)');
dire('       (le tableau de bord disait 191 courses/h pour la generation 0 : '+D.fenetres[1].parCourse_s+' s par course ; la generation 1 tourne plus lentement : PC plus charge, et courses plus longues — boucle moyenne '+F.boucleMoy_s+' s contre '+D.fenetres[1].boucleMoy_s+')');
const G=[];
function gain(nom,part,bas,haut,cat,note){G.push({nom,part,bas,haut,cat,note});}

/* A1. le ciel reflete (envCielCalc) remplace par des faces noires */
{const B1=blocsCiel('course1-990000-profil.cpuprofile'),B4=blocsCiel('course4-990740-sans-ciel-profil.cpuprofile');
  const parAppel=B1.reduce((s,x)=>s+x,0)/B1.length;
  const gagne3=(c2.total_ms-c3.total_ms)/1000;   /* mesure directe : meme course, avec et sans, 2 appels remplaces (mise en piste + 1 en route) */
  /* course 1 : 3 appels (chauffe, mise en piste, un en route) ; remplacer aussi celui de la chauffe (dans le simulateur, avant le chargement) */
  const p1=(gagne3+B1[0]/1000)/(c2.total_ms/1000);
  /* course 4 : la chauffe (mesuree dans son profil) + 2 appels remplaces, au cout moyen d'un appel de la course 1 (son cout reel n'est pas mesure) */
  /* la chauffe de la course 4 : la somme de ses blocs (tous dans le chargement, sauf ~2 ms) ; ses 2 appels remplaces : au cout de SA chauffe (bas) ou au cout moyen de la course 1 (haut) */
  const ch4=B4.reduce((s,x)=>s+x,0);
  const p4b=(ch4+c4.appelsCielRemplace*ch4)/1000/(c4.total_ms/1000+c4.appelsCielRemplace*ch4/1000),p4=(ch4+c4.appelsCielRemplace*parAppel)/1000/(c4.total_ms/1000+c4.appelsCielRemplace*parAppel/1000);
  dire('\nA1. envCielCalc : '+B1.length+' appels dans la course 1 ('+B1.map(x=>r1(x/1000)+' s').join(', ')+'), '+r1(B4.reduce((s,x)=>s+x,0)/1000)+' s (la chauffe) + '+c4.appelsCielRemplace+' remplaces dans la course 4');
  dire('    mesure directe, graine 990000 : '+r1(c2.total_ms/1000)+' s -> '+r1(c3.total_ms/1000)+' s (-'+r1(gagne3)+' s) avec 2 appels remplaces ; avec la chauffe en plus : '+pc(p1)+' de la course');
  dire('    graine 990740 (estime) : '+pc(p4b)+' (appels au cout de sa chauffe) a '+pc(p4)+' (au cout moyen de la course 1)');
  gain('A1 ciel reflete remplace par des faces noires (envCielCalc)',(p1+p4b)/2,Math.min(p1,p4b),Math.max(p1,p4b),'a','2 courses identiques au bit pres ; nouvelle epoque (fichier du simulateur)');}
/* A2. plusieurs courses par processus : le chargement (ouvrir) n'est paye qu'une fois */
{const o=[c2.etapes.ouvrir_ms/c2.total_ms,c4.etapes.ouvrir_ms/c4.total_ms];
  dire('\nA2. un processus qui joue plusieurs courses : ouvrir = '+c2.etapes.ouvrir_ms+' ms sur '+c2.total_ms+' (course 2), '+c4.etapes.ouvrir_ms+' sur '+c4.total_ms+' (course 4)');
  gain('A2 plusieurs courses par processus (ouvrir paye une fois)',(o[0]+o[1])/2,Math.min(...o),Math.max(...o),'a SI prouve','AUJOURD\'HUI FAUX sur 2 maps sur 7 (ml/reel/README.md, 25/11) : a reparer d\'abord');}
/* A3. les enfants qui conduisent comme leur parent */
{const n1=D.pourRien.naissances1.filter(x=>x.parents.some(p=>{const m=/ (\d+)\/(\d+)$/.exec(p);return m&&m[1]===m[2]&&+m[2]>=6;})).length;
  const p=n1*12/312;
  dire('\nA3. naissances de la generation 1 qui conduisent comme un parent sur toutes leurs graines : '+n1+' sur '+D.pourRien.naissances1.length+' -> '+n1*12+' courses sur 312');
  gain('A3 ne pas rejouer un enfant dont seuls des genes inertes ont change',p,p/2,p,'a (preuve gene par gene)','1 cas observe sur 6 naissances ; INTERFACES.md § 9.5 l\'estime a ~4 %');}
/* A4. le cache de code compile de V8 pour le jeu */
{const p=(CO.compilation_froid_ms-CO.compilation_avec_cache_ms)/c2.total_ms;
  dire('\nA4. compilation du premier niveau du jeu : '+CO.compilation_froid_ms+' ms a froid, '+CO.compilation_avec_cache_ms+' ms avec le cache ('+CO.cache_Mo+' Mo)');
  gain('A4 cache de code V8 du jeu (premier niveau)',p,p,p*3,'a','les fonctions compilees a la demande ne sont pas mesurees (x3 au plus, suppose)');}
/* A5. l'ordre des courses : les plus longues d'abord (la fin de generation) */
{const tailQueue=30; /* s, borne haute lue dans sortie.log a la fin de la generation 0 : les 4 dernieres fins a 20:51:37, :40, :43, :50 */
  const p=tailQueue/(4*D.fenetres[1].duree_s);
  dire('\nA5. fin de generation 0 : au plus '+tailQueue+' s de travailleurs inoccupes sur '+r1(4*D.fenetres[1].duree_s)+' -> '+pc(p)+' sur le Xeon');
  /* sur un PC a N travailleurs, une course longue lancee en dernier laisse N-1 travailleurs a vide pendant sa duree (SUPPOSE : la plus longue des
     courses de la generation 1 vue a 4 a la fois, en temps de travailleur) */
  gain('A5 lancer les courses les plus longues d\'abord',p,p,0.03,'a (l\'ordre ne change aucune course)','0,2 % mesure sur le Xeon ; jusqu\'a ~3 % suppose sur un PC a 12-16 travailleurs');}
/* A6. le ramasse-miettes */
dire('\nA6. ramasse-miettes : 0,4 % (course 1) et 1,3 % (course 4) du temps : rien a gagner avec les options de memoire de node (lire profils/course*-lecture.txt)');
dire('\nTABLEAU (part du temps d\'une course ; gain sur une generation de 312 courses a '+r1(gen)+' min)');
for(const g of G)dire('  '+g.nom.padEnd(66)+' '+pc(g.part).padStart(7)+'  ('+pc(g.bas)+' a '+pc(g.haut)+')  -> '+r1(gen*g.part)+' min par generation  ['+g.cat+'] '+g.note);
const sur=G.filter(g=>g.cat==='a'||g.cat.startsWith('a (')),tous=G;
const cumul=a=>1-a.reduce((s,g)=>s*(1-g.part),1);
dire('\n  cumul des (a) sans A2 : '+pc(cumul(sur))+' -> '+r1(gen*(1-cumul(sur)))+' min par generation ('+r1(60*312/(gen*(1-cumul(sur))))+' courses/h au lieu de '+r1(60*312/gen)+')');
dire('  cumul avec A2 (si on le rend exact) : '+pc(cumul(tous))+' -> '+r1(gen*(1-cumul(tous)))+' min ('+r1(60*312/(gen*(1-cumul(tous))))+' courses/h) ; deux fois plus = 50 % : pas atteint par les (a)');
fs.writeFileSync(path.join(__dirname,'gains.json'),JSON.stringify({base_s:base,generation_min:+r1(gen),gains:G},null,1)+'\n');
process.stdout.write(out.join('\n')+'\n');
