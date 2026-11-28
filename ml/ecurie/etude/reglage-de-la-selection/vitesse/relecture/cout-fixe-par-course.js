#!/usr/bin/env node
/* ===== RELECTURE « VITESSE » : LE COUT FIXE COURSE PAR COURSE, PAR UN CHEMIN INDEPENDANT (2026-11-27, le relecteur) =====
   L'etude deduit le cout fixe d'un bilan global (4 x duree de la fenetre = somme des courses). Ici on le refait COURSE PAR COURSE :
   ml/evolution/courses.js est une file FIFO a N=4 places (pomper : while(vivants.size<N&&file.length) lancer(file.shift())), relancee a CHAQUE fin
   de course (finir -> garder (la ligne, avec sa date) -> pomper). evoluer.js pose les taches dans l'ordre « pour chaque graine, pour chaque
   vivant » (pop.grainesGeneration x pop.vivants). Donc, en generation 1 (aucune course du cache, aucune relance : 287 lignes mesurees) :
     la tache k (k >= 4) part a la date de la (k-4)-ieme fin de course (dans l'ordre des dates) ; les 4 premieres partent a 21:04:25 (sortie.log).
   duree de la course k vue du maitre = date(k) - depart(k) ; cout fixe(k) = cette duree - ms(k) (la boucle seule, piloter.js).
   Controle de l'hypothese d'ordre : aucun cout fixe negatif, et la somme des durees redonne 4 x la fenetre a l'en-cours pres.
   Lit la copie figee de l'etude (../donnees). Aucune course jouee. Usage : node relecture/cout-fixe-par-course.js */
'use strict';
const fs=require('fs'),path=require('path');
const D=path.join(__dirname,'..','donnees');
const L=fs.readFileSync(path.join(D,'courses-2026-48.jsonl'),'utf8').split('\n').filter(Boolean).map(JSON.parse);
const pop=JSON.parse(fs.readFileSync(path.join(D,'population.json'),'utf8'));
const G1=L.filter(l=>l.usage==='entrainement'&&l.generation===1);
if(G1.some(l=>!l.mesuree))throw new Error('une course non mesuree : l\'hypothese « aucune relance » tombe');
/* l'ordre des taches */
const ordre=[];for(const g of pop.grainesGeneration)for(const v of pop.vivants)ordre.push(g+'|'+v.id);
const rang=new Map(ordre.map((k,i)=>[k,i]));
const fins=G1.map(l=>({l,t:Date.parse(l.date),k:rang.get(l.graine+'|'+l.id)})).sort((a,b)=>a.t-b.t);
if(fins.some(f=>f.k==null))throw new Error('une ligne hors de l\'ordre des taches');
const t0=Date.parse('2026-11-27T20:04:25Z');   /* 21:04:25 heure de Paris (sortie.log, « generation 1 : 312 courses ») */
const depart=k=>k<4?t0:(fins[k-4]?fins[k-4].t:null);
const R=[];for(const f of fins){const d=depart(f.k);if(d==null)continue;const mur=(f.t-d)/1000,boucle=f.l.ms/1000;R.push({k:f.k,mur,boucle,fixe:mur-boucle,survie:f.l.survie_s,id:f.l.id});}
const somme=a=>a.reduce((s,x)=>s+x,0),moy=a=>somme(a)/a.length;
function q(a,p){const b=a.slice().sort((x,y)=>x-y);const i=(b.length-1)*p,j=Math.floor(i);return b[j]+(b[Math.min(j+1,b.length-1)]-b[j])*(i-j);}
const fx=R.map(r=>r.fixe);
const out=[];const dire=t=>out.push(t);const r1=x=>Math.round(x*10)/10;
dire('GENERATION 1 : '+R.length+' courses reconstruites (sur '+G1.length+' finies)');
dire('  controle : couts fixes negatifs '+fx.filter(x=>x<0).length+' ; la tache la plus tardive finie a son rang k='+Math.max(...R.map(r=>r.k)));
dire('  cout fixe par course (duree vue du maitre - boucle) : moyenne '+r1(moy(fx))+' s, mediane '+r1(q(fx,.5))+' s, 10 % '+r1(q(fx,.1))+' s, 90 % '+r1(q(fx,.9))+' s, min '+r1(Math.min(...fx))+', max '+r1(Math.max(...fx)));
/* le cout fixe grandit-il avec la course ? (moindres carres fixe = a + b x boucle) */
{const x=R.map(r=>r.boucle),y=fx,mx=moy(x),my=moy(y);let sxy=0,sxx=0;for(let i=0;i<x.length;i++){sxy+=(x[i]-mx)*(y[i]-my);sxx+=(x[i]-mx)**2;}
  const b=sxy/sxx;dire('  fixe = '+r1(my-b*mx)+' + '+(Math.round(b*1000)/1000)+' x boucle_s  (le hors-boucle depend-il de la longueur ?)');}
for(const [a,b] of [[0,30],[30,60],[60,120],[120,240],[240,1e9]]){const T=R.filter(r=>r.survie>=a&&r.survie<b);if(T.length)dire('  survie '+a+'-'+(b>1e8?'...':b)+' s : '+T.length+' courses, fixe moyen '+r1(moy(T.map(r=>r.fixe)))+' s, boucle moyenne '+r1(moy(T.map(r=>r.boucle)))+' s');}
dire('  duree moyenne d\'une course vue du maitre : '+r1(moy(R.map(r=>r.mur)))+' s ; part hors boucle (somme fixe / somme duree) : '+r1(100*somme(fx)/somme(R.map(r=>r.mur)))+' %');
/* ce qu'un gain de X secondes par course vaut sur la generation (la base de l'etude : 110.6 s par course et par travailleur) */
const base=moy(R.map(r=>r.mur));
dire('\nCE QUE VAUT UN GAIN ABSOLU, rapporte a la course MOYENNE de la generation 1 ('+r1(base)+' s) :');
for(const [nom,s] of [['A1, 3 ciels a 1,7 s (mesure seule, course 1)',3*1.7],['A1, 3 ciels a 1,2 s (la chauffe de la course 4)',3*1.2],['A2, ouvrir 6,7 s (course 2)',6.7],['A2, ouvrir 5,2 s (course 4)',5.2],['A2, ouvrir + node + require 7 s',7.0]])dire('  '+nom.padEnd(52)+' : '+r1(100*s/base)+' %');
fs.writeFileSync(path.join(__dirname,'cout-fixe-par-course.txt'),out.join('\n')+'\n');
process.stdout.write(out.join('\n')+'\n');
