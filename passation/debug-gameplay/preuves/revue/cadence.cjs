// Les formules de sous-pas des correctifs, appliquées aux dt RÉELS d'un rAF (boucle-1.js : dt = (now-last)/1000, non lissé).
// Safari/WKWebView arrondit les horodatages à la ms : à 60 Hz les dt valent 16 ou 17 ms, à 30 Hz 33 ou 34 ms.
const ceil60=dt=>Math.max(1,Math.ceil(dt*60-1e-6));          // PV-01 (n9) et PG-02 (n9)
const actif=dt=>dt>1/60+1e-6;                                 // garde de PV-01 et PG-01
const drift=dt=>Math.max(1,Math.ceil(dt*30-.2));              // PG-03
const fPG01=dt=>actif(dt)?1-(1/60)/dt:0;                      // facteur de PG-01
const round60=dt=>Math.max(1,Math.round(dt*60));              // réparation proposée
console.log('dt(ms)  actif  n9(ceil)  n9(round)  facteurPG01  driftPas  drift_d9(ms)');
for(const ms of [8,9,16,16.667,16.7,17,18,20,25,33,33.333,34,40,41,50]){const dt=ms/1000;
  console.log(String(ms).padEnd(7),String(actif(dt)).padEnd(6),String(ceil60(dt)).padEnd(9),String(round60(dt)).padEnd(10),fPG01(dt).toFixed(3).padEnd(12),String(drift(dt)).padEnd(9),(dt/drift(dt)*1000).toFixed(1));}
// PG-01 : la loi « ramenée à 60 i/s » — surplus moyen de |vN| à la déclaration, a = 48 m/s² (normal), approche uniforme
function surplus(dt,corr){let s=0,N=200000;for(let i=0;i<N;i++){const tau=Math.random()*dt;let x=48*tau;if(corr&&dt>1/60+1e-6)x-=48*tau*(1-(1/60)/dt);s+=x;}return s/N;}
for(const ms of [16.667,17,33.333,50])console.log('PG-01 dt',ms,'ms : surplus moyen sans',surplus(ms/1000,false).toFixed(3),'avec',surplus(ms/1000,true).toFixed(3),'(60 i/s exact : ',(48/120).toFixed(3),')');
