/* PREUVE GP-02 (complément) : dt = min((now-last)/1000, .05) (boucle-1.js:21). Au-dessus de 50 ms, le temps du jeu PERD l'excédent.
   L'ancien chiffre (« ne joue que sous 20 i/s ») ne vaut que pour un écran à 60 Hz : là, CAD à 30 i/s qui rate une image attend la
   synchro suivante, 50 ms, rien n'est perdu. iOS en ÉCONOMIE D'ÉNERGIE (ou chaud) impose 30 Hz à l'écran (boucle-1.js:30) : une image
   ratée y dure 66,7 ms → 16,7 ms de jeu perdues À CHAQUE image ratée, dès la PREMIÈRE. */
function ratio(per,rate,p){const reel=(1-p)*per+p*rate,jeu=(1-p)*Math.min(per,50)+p*Math.min(rate,50);return jeu/reel;}
for(const [nom,per,rate] of [['écran 60 Hz, CAD à 30 i/s (image ratée = 50 ms)',1000/30,50],['écran BRIDÉ à 30 Hz par iOS (image ratée = 66,7 ms)',1000/30,2000/30],['écran 60 Hz qui rame à ~20 i/s (images de 50/66,7 ms)',50,2000/30]]){
  console.log('\n'+nom);for(const p of [0,.1,.2,.4])console.log(`  ${Math.round(p*100)} % d'images ratées : le jeu tourne à ×${ratio(per,rate,p).toFixed(3)} — 10 s de pouvoir = ${(10/ratio(per,rate,p)).toFixed(2)} s vécues, une seconde de vol = ${(1/ratio(per,rate,p)).toFixed(2)} s`);}
