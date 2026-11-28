#!/usr/bin/env node
/* ===== LES VUES AU SOL AVANT UN DECOLLAGE SUBI, UNE PAR UNE (28/11/2026, etude « avant le bord », concepteur « ligne et placement ») =====
   Lecture seule : ../lecteur-traces/sorties/avant-le-bord.json (la liste des decollages subis sur decor) et les traces de sortie-preparee.
   Pour chaque decollage : recul (s), vitesse, latS (lat oriente vers la sortie), capS (cap de la caisse vers la sortie), cmdS (le cap DEMANDE par
   le pilote, (O.ligne - lat) / (0,9 x vitesse), oriente), vLat (vitesse laterale mesuree entre deux vues), nitro demandee, tenue (ti, t, cote).
   usage : node vues-avant.js [mort|pose] [combien]   (rien n'est ecrit : la sortie va a l'ecran) */
'use strict';
const fs=require('fs'),path=require('path'),zlib=require('zlib');
const LIG=path.join(__dirname,'..','..','sortie-preparee','sorties','lignes');
const J=JSON.parse(fs.readFileSync(path.join(__dirname,'..','lecteur-traces','sorties','avant-le-bord.json'),'utf8'));
const cache={};
const lire=n=>cache[n]||(cache[n]=zlib.gunzipSync(fs.readFileSync(path.join(LIG,n+'.jsonl.gz'))).toString().trim().split('\n').slice(1).map(x=>JSON.parse(x)).filter(v=>!v.erreurDiag));
const r=(x,n)=>x==null||!isFinite(x)?'  -   ':x.toFixed(n==null?2:n).padStart(6);
const quoi=process.argv[2]||'mort';
for(const d of J.decollages.filter(d=>d.fin===quoi).slice(0,+process.argv[3]||999)){
  const V=lire(d.course),co=d.co;
  console.log('\n'+d.course+' '+d.carte+' td '+d.td+' '+d.fin+' '+(d.cause||'')+' vol '+d.dt+' s ; pose precedente '+d.ecartPose+' s avant ; annonce des yeux '+d.tPrem+' s avant');
  let prev=null;
  for(const s of V.filter(v=>v.t<=d.td+1e-9&&v.t>=d.td-2.5)){
    const c=s.O&&s.O.ligne!=null&&s.lat!=null?(s.O.ligne-s.lat)/(.9*Math.max(6,s.v)):null;
    const vl=prev&&prev.lat!=null&&s.lat!=null?(s.lat-prev.lat)/(s.t-prev.t)*co:null;
    console.log('  '+r(d.td-s.t)+' '+s.mo+' v '+r(s.v,0)+' latS '+r(s.lat==null?null:s.lat*co,1)+' capS '+r(s.cap==null?null:s.cap*co)+' cmdS '+r(c==null?null:c*co)+' vLat '+r(vl,0)+
      ' N '+(s.O&&s.O.nitro?1:0)+' ti '+(s.tn?(s.tn.ti?1:0)+(s.tn.t!=null?' t'+s.tn.t+' cote'+s.tn.co*co:''):'-')+(s.gl?' GLISSE':'')+(s.rb?' REBOND':'')+(s.de?' DESSOUS':'')+(s.D&&s.D.so?' RACCOURCI':''));
    prev=s;}}
