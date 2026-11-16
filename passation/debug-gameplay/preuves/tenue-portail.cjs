// Preuve (lecture seule) : pendant prebRetient la caisse est tenue à s=L-2 mais lat/psi continuent.
// node passation/debug-gameplay/preuves/tenue-portail.cjs
const fs=require('fs'),p=require('path'),R=p.join(__dirname,'../../../code/');
const lire=f=>fs.readFileSync(R+f,'utf8').split('\n');
const voir=(f,re)=>lire(f).forEach((l,i)=>{if(re.test(l))console.log(f+':'+(i+1)+'  '+l.trim().slice(0,170));});
voir('moteur/boucle-2-conduite.js',/lat\+=vL|^\s*s\+=vA|PORTV\.att\)\{if\(s>L-2\)|startFall\(0,1,true\)/);
voir('moteur/piste-prebati.js',/PREBFIN=TEL_NATIF|voileMax\*1000|function prebRetient/);
voir('moteur/boucle-6-hud.js',/PCV\.fen&&PORTV\.att&&!PCV\.copie/);
voir('moteur/boucle-1.js',/if\(running&&!paused&&!gameOver&&!BANC_FIGE\)/);
// combien de temps pour sortir de la route (ROAD_HALF 28 m) à cap figé
const SPD=.48;for(const kmh of [300,600,1200])for(const psi of [.05,.1,.2]){const vA=kmh/3.6/SPD,lat=vA*Math.sin(psi)*SPD;console.log(kmh+' km/h, cap '+psi+' rad : '+lat.toFixed(1)+' m/s de dérive -> bord (28 m) en '+(28/lat).toFixed(1)+' s');}
