#!/usr/bin/env node
/* ===== RELECTURE « VITESSE » : QUI APPELLE envCielCalc DANS LES PROFILS (2026-11-27, le relecteur) =====
   Pour chaque noeud du profil CPU qui est envCielCalc : son temps inclus (echantillons x intervalle moyen) et la chaine de ses appelants.
   Sert a trancher le doute de l'etude : un appel a-t-il lieu PENDANT loadGame (alors le remplacement propose dans jeu-reel.js, apres loadGame,
   ne le toucherait pas) ? Aucune course jouee. Usage : node relecture/appelants-ciel.js profils/<fichier>.cpuprofile */
'use strict';
const fs=require('fs'),path=require('path');
const f=path.resolve(process.argv[2]);
const P=JSON.parse(fs.readFileSync(f,'utf8'));
const par=new Map(P.nodes.map(n=>[n.id,n]));const up=new Map();for(const n of P.nodes)for(const c of n.children||[])up.set(c,n.id);
const self=new Map();for(const s of P.samples)self.set(s,(self.get(s)||0)+1);
const dtMoy=(P.endTime-P.startTime)/1000/P.samples.length;
const tot=id=>{const n=par.get(id);let s=self.get(id)||0;for(const c of n.children||[])s+=tot(c);return s;};
for(const n of P.nodes)if(n.callFrame.functionName==='envCielCalc'){
  const ch=[];let x=up.get(n.id);while(x){const m=par.get(x);ch.push((m.callFrame.functionName||'(anonyme)')+'@'+path.basename(m.callFrame.url||'')+':'+(m.callFrame.lineNumber+1));x=up.get(x);}
  console.log(Math.round(tot(n.id)*dtMoy)+' ms  <  '+ch.slice(0,18).join(' < '));}
