// PV-04 : le coup de réacteur (+46, ×1,46 sur la vitesse) À L'IMAGE du contact, vu par la loi de PG-01 (demi-tour.js:445).
// Lit dans boucle-3-physique.js si TL_V0 reçoit l'impulsion (correctif) et rejoue la formule exacte de PG-01.
const fs=require('fs');const b3=fs.readFileSync(__dirname+'/../../../code/moteur/boucle-3-physique.js','utf8');
const corrige=/TL_V0\.multiplyScalar\(\(sp8\+a8\)\/sp8\)/.test(b3);
function impact(fps,vN0,k,tauF,avecCorrectif){const dt=1/fps,vN=vN0*k,v0N=avecCorrectif?vN0*k:vN0; // gravité négligée : on isole l'impulsion
  const tau=dt*tauF,aN=(vN-v0N)/dt;const vNj=dt>1/60+1e-6?vN-aN*tau*(1-(1/60)/dt):vN;return Math.abs(vNj);}
for(const c of [false,true]){let p60=0,p30=0,n=0;for(let i=0;i<1000;i++){const f=(i+.5)/1000;n++;if(impact(60,-3.5,1.46,f,c)<4.5)p60++;if(impact(30,-3.5,1.46,f,c)<4.5)p30++;}
  console.log((c?'APRÈS correctif':'AVANT correctif')+' : approche vN −3,5, coup ×1,46 à l\'image du contact → PARFAIT 60 i/s '+(p60/n*100).toFixed(0)+' %, 30 i/s '+(p30/n*100).toFixed(0)+' %');}
console.log('correctif présent dans boucle-3-physique.js : '+corrige);
