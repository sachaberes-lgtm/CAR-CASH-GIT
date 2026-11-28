#!/usr/bin/env node
/* ===== RELECTURE « VITESSE » : LES GAINS RAPPORTES A LA COURSE MOYENNE, PAS A UNE COURSE COURTE (2026-11-27, le relecteur) =====
   estimer-gains.js divise ce que gagne A1 (le ciel) et A2 (ouvrir) par la duree TOTALE de la course 2 (42,7 s, 85 s de jeu) ou 4 (58,3 s),
   puis applique ce pourcentage a une generation dont la course moyenne occupe un travailleur ~110 s. Ce n'est juste que si le gain grandit
   comme la course. Ici, on compte en SECONDES par course, puis on divise par la course moyenne de la generation 1 :
   · A2 (ouvrir) est paye une fois par processus : son gain ne grandit pas avec la course ;
   · A1 : un appel a la chauffe (dans ouvrir), un a la mise en piste (J.lancer), puis un par nouveau ciel rencontre en route (bioGo, hors du cache
     de 32 ciels : relecture/appelants-ciel.js). Mesure : 1 appel en route en 85,3 s de jeu (course 1), 1 en 107,7 s (course 4). On borne :
     bas = aucun autre appel en route (3 appels par course), haut = 1 appel en route par 85 s de jeu (proportionnel a la survie, SUPPOSE).
   · le cout d'un appel : 1,6 a 1,8 s mesure seul (course 1), 1,1 s pour la chauffe de la course 4 ; dans la vraie evolution la boucle de
     990000 a pris 26,7 s contre 30,9 s seule (x 0,86) : on prend 1,2 a 1,7 s.
   Lit ../donnees (copie figee) et ../profils. Aucune course jouee. Usage : node relecture/gains-rapportes.js */
'use strict';
const fs=require('fs'),path=require('path');
const L=fs.readFileSync(path.join(__dirname,'..','donnees','courses-2026-48.jsonl'),'utf8').split('\n').filter(Boolean).map(JSON.parse);
const J=f=>JSON.parse(fs.readFileSync(path.join(__dirname,'..','profils',f),'utf8').split('\n')[0]);
const c2=J('course2-reference.json'),c4=J('course4-sans-ciel-profil.json');
const G1=L.filter(l=>l.usage==='entrainement'&&l.generation===1&&l.mesuree);
const BASE=110.6;  /* s de travailleur par course, generation 1 (resultats-donnees.json, et 109,9 s par relecture/cout-fixe-par-course.js) */
const out=[];const dire=t=>out.push(t);const pc=x=>(100*x).toFixed(1)+' %';
const survieMoy=G1.reduce((s,l)=>s+l.survie_s,0)/G1.length;
dire('generation 1 : '+G1.length+' courses, survie moyenne '+survieMoy.toFixed(1)+' s ; base '+BASE+' s de travailleur par course');
/* controle : la meme course dans la vraie evolution */
const ref=L.find(l=>l.graine===990000&&l.id==='19e3767cc346');
dire('controle : graine 990000 du temoin dans la vraie evolution : boucle '+(ref.ms/1000).toFixed(1)+' s ; seule : '+(c2.boucle_ms/1000).toFixed(1)+' s (x '+(ref.ms/c2.boucle_ms).toFixed(2)+')');
/* A1 */
let bas=0,haut=0;
for(const l of G1){bas+=3*1.2;haut+=(2+Math.max(1,l.survie_s/85))*1.7;}
bas/=G1.length;haut/=G1.length;
dire('\nA1 (ciel) : '+bas.toFixed(1)+' a '+haut.toFixed(1)+' s par course en moyenne -> '+pc(bas/BASE)+' a '+pc(haut/BASE)+' de la generation (l\'etude : 9,3 %, 5,8 a 12,8 %)');
dire('   rapporte a la course 2 comme l\'etude : (3,7 s + 1,8 s) / 42,7 s = '+pc((c2.total_ms-J('course3-sans-ciel.json').total_ms+1800)/c2.total_ms));
/* A2 */
const o2=c2.etapes.ouvrir_ms/1000,o4=c4.etapes.ouvrir_ms/1000;
dire('\nA2 (ouvrir une fois) : '+o4.toFixed(1)+' a '+o2.toFixed(1)+' s par course -> '+pc(o4/BASE)+' a '+pc(o2/BASE)+' de la generation (l\'etude : 12,4 %, 9,0 a 15,8 %)');
dire('   (borne haute non mesuree : si les ~14 s de hors-boucle que la mesure directe n\'explique pas (26,2 s en moyenne, 16,2 s en mediane, contre 11,8 s seule) venaient du chargement a 4 a la fois, A2 en reprendrait une part)');
/* A4 */
dire('\nA4 (cache V8) : 0,26 s par course -> '+pc(0.255/BASE)+' (l\'etude : 0,6 %)');
/* cumul */
const A1m=(bas+haut)/2/BASE,A3=12/312,A5=0.002,A4=0.255/BASE,A2m=(o2+o4)/2/BASE;
const cum=a=>1-a.reduce((s,x)=>s*(1-x),1);
const gen=312*BASE/4/60;
dire('\ncumul sans A2 (A1 milieu, A3, A4, A5) : '+pc(cum([A1m,A3,A4,A5]))+' -> '+(gen*(1-cum([A1m,A3,A4,A5]))).toFixed(1)+' min ('+(60*312/(gen*(1-cum([A1m,A3,A4,A5])))).toFixed(0)+' courses/h au lieu de '+(60*312/gen).toFixed(0)+')');
dire('cumul avec A2 : '+pc(cum([A1m,A3,A4,A5,A2m]))+' -> '+(gen*(1-cum([A1m,A3,A4,A5,A2m]))).toFixed(1)+' min ('+(60*312/(gen*(1-cum([A1m,A3,A4,A5,A2m])))).toFixed(0)+' courses/h)');
fs.writeFileSync(path.join(__dirname,'gains-rapportes.txt'),out.join('\n')+'\n');
process.stdout.write(out.join('\n')+'\n');
