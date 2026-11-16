/* LE GOUVERNEUR DU SON SIMULÉ (2026-11-13, son-solide) — rejoue `sonGouverne` (code/son/graphe-audio.js) hors navigateur, sur des horloges inventées :
   une page qui dessine à 60 i/s, une horloge audio qui avance (ou s'arrête, ou perd des blocs) selon un scénario. Compte les décrochages et le cran.
   node outils/banc-son/gouverneur-sim.mjs [fichier graphe-audio.js] [?sans=…]  — sans argument : le fichier de la branche. */
import fs from 'node:fs';
const src=fs.readFileSync(process.argv[2]||new URL('../../code/son/graphe-audio.js',import.meta.url),'utf8');
const qs=process.argv[3]||'';
const a=src.indexOf('const SON_CHAUD='),b=src.indexOf('window.dbgSonGouv=');
if(a<0||b<0)throw new Error('sonGouverne introuvable');
const c2=src.indexOf('function sonDecroche'),corps=src.slice(a,b)+(c2>b?src.slice(c2,src.indexOf('\n',src.indexOf('}}}}',c2))):'');
function joue(nom,scen,dureeS,opts){
  opts=opts||{};
  let tPage=0,tAudio=0;const notes=[];
  const AC={state:'running',baseLatency:.0053,sampleRate:48000,get currentTime(){return Math.floor(tAudio*48000/128)*128/48000;}};
  const env={AC,MOB_S:{capteur:false,thermo:0},TEL_NATIF:true,SON_GOUV_ON:true,sonLent:()=>false,paused:false,started:!!opts.course,gameOver:false,mode:opts.course?'drive':'menu',
    performance:{now:()=>tPage},document:{hidden:false},location:{search:qs},localStorage:{getItem:()=>null,setItem:()=>{}},
    window:{__ccNote:(g,m)=>notes.push((tPage/1000).toFixed(1)+' s · '+m)}};
  const f=new Function(...Object.keys(env),corps+';return {sonGouverne,SON_GOUV,get charge(){return window.__ccSonCharge;}};');
  const R=f(...Object.values(env));
  const dt=1000/60;
  for(tPage=0;tPage<dureeS*1000;){
    const pas=scen.gel&&tPage>=scen.gel[0]&&tPage<scen.gel[1]?scen.gel[1]-tPage:dt; /* une page gelée : pas d'image */
    tPage+=pas;
    tAudio+=(pas/1000)*scen.vitesse(tPage);
    R.sonGouverne();
  }
  console.log(nom.padEnd(52),'décrochages',String(R.SON_GOUV.decro).padStart(2),'· cran',R.SON_GOUV.cran,'· charge',R.charge,notes.length?'\n    '+notes.join('\n    '):'');
  return R.SON_GOUV;
}
const plat=()=>1;
const scen={
  'sain (2 min)':{vitesse:plat},
  'démarrage : horloge arrêtée 0,6 s au début':{vitesse:t=>t<600?0:1},
  'démarrage : horloge arrêtée 2,2 s après 3,2 s (boîte noire)':{vitesse:t=>t>3200&&t<5400?0:1},
  'menu : page gelée 6,5 s puis horloge arrêtée 2 s':{gel:[2000,8500],vitesse:t=>t>8500&&t<10500?0:1},
  'course : vrais décrochages (2 × 80 ms en 10 s)':{vitesse:t=>(t>20000&&t<20200)||(t>28000&&t<28200)?.6:1,course:1},
  'course : fil étouffé (60 % des blocs, 4 s)':{vitesse:t=>t>20000&&t<24000?.6:1,course:1},
  'course : fil par à-coups (100 ms rendues / 300 ms rien, 6 s)':{vitesse:t=>t>20000&&t<26000&&(t-20000)%400>100?0:1,course:1},
  'course : horloge arrêtée 0,5 s (route audio, appel)':{vitesse:t=>t>20000&&t<20500?0:1,course:1},
};
for(const k in scen)joue(k,scen[k],k.startsWith('sain')?120:40,{course:scen[k].course});
