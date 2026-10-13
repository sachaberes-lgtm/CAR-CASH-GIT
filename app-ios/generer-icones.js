#!/usr/bin/env node
/* CAR CASH — prépare les images sources de @capacitor/assets (dossier assets/), puis `npx capacitor-assets generate --ios`
   en tire l'icône de l'app et l'écran de lancement (npm run icones fait les deux).
   · assets/icon-only.png  (1024 × 1024, SANS transparence — Apple refuse une icône avec un canal alpha) : rendu de
     ressources/icon.svg, le mot-symbole pixel CASH CAR, aplati sur le fond nuit du jeu ;
   · assets/splash.png et splash-dark.png (2732 × 2732) : ressources/lancement-2732.png (le même mot-symbole sur la grille néon).
   ⚠ icon.svg du dossier du jeu est l'émoji 💰 d'Apple (image protégée) : on ne s'en sert pas. */
'use strict';
const fs=require('fs'),path=require('path'),sharp=require('sharp');
const R=path.join(__dirname,'ressources'),A=path.join(__dirname,'assets'),FOND={r:18,g:8,b:31}; // #12081f
fs.mkdirSync(A,{recursive:true});
(async()=>{
  await sharp(path.join(R,'icon.svg'),{density:72}).resize(1024,1024).flatten({background:FOND}).removeAlpha().png().toFile(path.join(A,'icon-only.png'));
  for(const n of['splash.png','splash-dark.png'])
    await sharp(path.join(R,'lancement-2732.png')).resize(2732,2732).flatten({background:FOND}).removeAlpha().png().toFile(path.join(A,n));
  const m=await sharp(path.join(A,'icon-only.png')).metadata();
  if(m.width!==1024||m.height!==1024||m.hasAlpha)throw new Error('icône non conforme : '+JSON.stringify({w:m.width,h:m.height,alpha:m.hasAlpha}));
  console.log('✓ assets/ : icon-only.png 1024 × 1024 sans transparence, splash.png, splash-dark.png 2732 × 2732');
})().catch(e=>{console.error('✗ generer-icones : '+e.message);process.exit(1);});
