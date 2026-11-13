#!/usr/bin/env node
/* LA DÉMO DU POUF AÉRIEN : node outils/pouf-nuage/fabrique.cjs → outils/pouf-nuage/demo.html
   Copie TEL QUEL le code de l'effet (code/maps/nuages-pouf-gpu.js, entre les marques pouf-gpu) dans demo-modele.html, avec la lumière de la ouate relevée dans le jeu
   (lum.json = dbgPoufGpu('lum') en course aux nuages). Servir la racine du dépôt : python3 outils/pouf-nuage/serveur.py 8961 → http://<ip>:8961/outils/pouf-nuage/demo.html */
'use strict';
const fs=require('fs'),path=require('path'),ICI=__dirname,RAC=path.join(ICI,'..','..');
const src=fs.readFileSync(path.join(RAC,'code/maps/nuages-pouf-gpu.js'),'utf8');
const a=src.indexOf('/*<pouf-gpu>*/'),b=src.indexOf('/*</pouf-gpu>*/');if(a<0||b<a)throw new Error('marques pouf-gpu introuvables');
const code=src.slice(a,b+'/*</pouf-gpu>*/'.length);
let lum={uSunW:[.45,.75,.35],uSunC:[1.25,1.2,1.1],uSky:[.55,.72,.98],uGnd:[.85,.85,.9],uLav:[.78,.74,.95],uK:[1,1,1,1],uR:[-.25,.5,.64,1],uSym:1,fog:{c:[.8,.85,.95],n:120,f:1500},cam:26,fov:62};
try{Object.assign(lum,JSON.parse(fs.readFileSync(path.join(ICI,'lum.json'),'utf8')));}catch(e){console.log('(pas de lum.json : lumière par défaut)');}
let html=fs.readFileSync(path.join(ICI,'demo-modele.html'),'utf8');
html=html.replace('/*@@POUF@@*/',()=>code).replace('/*@@LUM@@*/',()=>JSON.stringify(lum));
fs.writeFileSync(path.join(ICI,'demo.html'),html);console.log('demo.html',html.length,'octets');
