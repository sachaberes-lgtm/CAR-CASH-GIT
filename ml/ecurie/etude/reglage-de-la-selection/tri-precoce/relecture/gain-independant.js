/* ===== RELECTURE « tri-precoce » : LE GAIN DE TEMPS DE B4, PAR UN AUTRE CHEMIN (27/11/2026, le relecteur) =====
   gain-reel.js additionne les ms des seules graines COMPLETES de la gen. 1 (10 sur 12), ramenees a 12.
   Ici, autre chemin : (1) l'ordre des graines est celui de leur premiere apparition dans le fichier (pas un filtre « complete ») ;
   (2) on prend le temps MOYEN d'une course par groupe (enfants : toutes leurs courses ; anciens : leurs courses sur les 4 premieres graines ;
   anciens : toutes leurs courses), sur TOUTES les lignes mesurees de la gen. 1, et on recompose une generation pleine :
       A  = 72 courses d'enfants + 240 courses d'anciens
       B4 = 72 courses d'enfants +  80 courses d'anciens (4 premieres graines)
   Les enfants = les vivants nes en gen. 1 (population.json). Lecture seule de donnees/.
   usage : node relecture/gain-independant.js */
'use strict';
const fs=require('fs'),path=require('path');
const D=path.join(__dirname,'..','donnees');
const L=fs.readFileSync(path.join(D,'courses-2026-48.jsonl'),'utf8').trim().split('\n').map(JSON.parse)
  .filter(l=>l.usage==='entrainement'&&l.generation===1&&l.mesuree===true&&l.ms>0);
const pop=JSON.parse(fs.readFileSync(path.join(D,'population.json'),'utf8'));
const enf=new Set(pop.vivants.filter(v=>v.ne===1).map(v=>v.id));
const ordre=[];for(const l of L)if(ordre.indexOf(l.graine)<0)ordre.push(l.graine);
const moy=A=>A.reduce((s,x)=>s+x,0)/A.length;
const tE=L.filter(l=>enf.has(l.id)).map(l=>l.ms/1000);
const tA=L.filter(l=>!enf.has(l.id)).map(l=>l.ms/1000);
const tA4=L.filter(l=>!enf.has(l.id)&&ordre.indexOf(l.graine)<4).map(l=>l.ms/1000);
const tA2=L.filter(l=>!enf.has(l.id)&&ordre.indexOf(l.graine)<2).map(l=>l.ms/1000);
const tA8=L.filter(l=>!enf.has(l.id)&&ordre.indexOf(l.graine)<8).map(l=>l.ms/1000);
console.log('gen. 1 : '+L.length+' courses mesurees ; '+enf.size+' enfants ; ordre des graines (premiere apparition) : '+ordre.join(' '));
console.log('temps moyen : enfants '+moy(tE).toFixed(1)+' s ('+tE.length+') ; anciens toutes graines '+moy(tA).toFixed(1)+' s ('+tA.length+') ; anciens 4 premieres '+moy(tA4).toFixed(1)+' s ('+tA4.length+')');
const A=72*moy(tE)+240*moy(tA);
const row=(nom,ta,n)=>{const T=72*moy(tE)+n*ta;console.log(nom.padEnd(3)+' : '+(100*T/A).toFixed(1)+' % du temps de A ; generations par jour sur le Xeon '+(24*191/312*A/T).toFixed(1));};
row('A',moy(tA),240);row('B8',moy(tA8),160);row('B4',moy(tA4),80);row('B2',moy(tA2),40);row('D',0,0);
console.log('sans les temps (courses seules) : B4 = 152/312 = '+(100*152/312).toFixed(1)+' %');
