#!/usr/bin/env node
/* CASH CAR — prépare les images sources de @capacitor/assets (dossier assets/), puis `npx capacitor-assets generate --ios`
   (ou `--android`) en tire l'icône de l'app et l'écran de lancement (npm run icones / npm run icones:android font les deux).
   · assets/icon-only.png  (1024 × 1024, SANS transparence — Apple refuse une icône avec un canal alpha) : rendu de
     ressources/icon.svg, le mot-symbole pixel CASH CAR, aplati sur le fond nuit du jeu ;
   · assets/splash.png et splash-dark.png (2732 × 2732) : ressources/lancement-2732.png (le même mot-symbole sur la grille néon).
   · ANDROID (2026-11-05, l'app Google Play) : l'icône « adaptative » est découpée par le téléphone (rond, carré arrondi…) et
     n'en montre que le centre (les deux tiers). Le mot-symbole de icon.svg touche presque les bords : il serait coupé. On prend
     donc le cadrage de l'écran de lancement, où il est plus petit au milieu de la même grille néon :
     assets/icon-foreground.png (ce cadrage) et assets/icon-background.png (le fond nuit uni, caché dessous).
   · LA FICHE GOOGLE PLAY (fiche/google-play/, rien ne part dans l'app) : l'icône 512 × 512 et l'image de présentation
     1024 × 500 que la Play Console demande.
   ⚠ icon.svg du dossier du jeu est l'émoji 💰 d'Apple (image protégée) : on ne s'en sert pas. */
'use strict';
const fs=require('fs'),path=require('path'),sharp=require('sharp');
const R=path.join(__dirname,'ressources'),A=path.join(__dirname,'assets'),FOND={r:18,g:8,b:31}; // #12081f
const GP=path.join(__dirname,'fiche','google-play');
fs.mkdirSync(A,{recursive:true});fs.mkdirSync(GP,{recursive:true});
(async()=>{
  await sharp(path.join(R,'icon.svg'),{density:72}).resize(1024,1024).flatten({background:FOND}).removeAlpha().png().toFile(path.join(A,'icon-only.png'));
  const LANC=path.join(R,'lancement-2732.png');
  for(const n of['splash.png','splash-dark.png'])
    await sharp(LANC).resize(2732,2732).flatten({background:FOND}).removeAlpha().png().toFile(path.join(A,n));
  /* l'icône adaptative : un carré de 1240 px autour du mot-symbole de l'écran de lancement (texte ≈ x 905–1789, y 1011–1534
     sur 2732). @capacitor/assets le pose dans la zone visible (inset 16,7 %) : les coins du texte restent dans le cercle du
     masque le plus serré (424 px du centre sur 512) */
  await sharp(LANC).extract({left:727,top:652,width:1240,height:1240}).resize(1024,1024).flatten({background:FOND}).removeAlpha().png().toFile(path.join(A,'icon-foreground.png'));
  await sharp({create:{width:1024,height:1024,channels:3,background:FOND}}).png().toFile(path.join(A,'icon-background.png'));
  /* la fiche Google Play */
  await sharp(path.join(A,'icon-only.png')).resize(512,512).png().toFile(path.join(GP,'icone-512.png'));
  await sharp(LANC).extract({left:0,top:605,width:2732,height:1334}).resize(1024,500).flatten({background:FOND}).removeAlpha().png().toFile(path.join(GP,'presentation-1024x500.png'));
  const m=await sharp(path.join(A,'icon-only.png')).metadata();
  if(m.width!==1024||m.height!==1024||m.hasAlpha)throw new Error('icône non conforme : '+JSON.stringify({w:m.width,h:m.height,alpha:m.hasAlpha}));
  console.log('✓ assets/ : icon-only.png 1024 × 1024 sans transparence, icon-foreground/background.png (Android), splash.png, splash-dark.png 2732 × 2732');
  console.log('✓ fiche/google-play/ : icone-512.png, presentation-1024x500.png');
})().catch(e=>{console.error('✗ generer-icones : '+e.message);process.exit(1);});
