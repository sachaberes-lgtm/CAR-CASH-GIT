/* ---------------------------------------------------------------------------
 *  BANC D'ESSAI SURVIVANT — pilote (Node)
 *    node bench/run.js [nbRuns] [dureeSec]
 *  Concatène stub-three + world + survivant dans UNE portée (comme deux
 *  <script> classiques dans la page) et fait tourner la sim sans rendu.
 *  Math.random est remplacé par un PRNG semé : les runs sont REJOUABLES.
 * ------------------------------------------------------------------------- */
'use strict';
const fs=require('fs'),vm=require('vm'),path=require('path');
const here=__dirname, root=path.join(here,'..');

const NRUNS=parseInt(process.argv[2]||'10',10);
const DUR  =parseFloat(process.argv[3]||'180');   // secondes de sim par run
const DT   =1/60;

const src=[
  fs.readFileSync(path.join(here,'stub-three.js'),'utf8').replace(/^'use strict';$/m,''),
  fs.readFileSync(path.join(here,'world.js'),'utf8').replace(/^'use strict';$/m,''),
  fs.readFileSync(path.join(root,'out','survivant.js'),'utf8'),
].join('\n;\n');

const driver=`
;(function(){
  function prng(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);
    t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
  const OUT=[];
  for(let r=0;r<__NRUNS__;r++){
    const seed=(1000+r*7919)>>>0;
    const rnd=prng(seed);
    Math.random=rnd;                       // toute la meute tire dans ce flux
    let trackSeed=seed;
    buildBenchTrack(trackSeed);
    // remise à zéro façon resetGame() (8364-8393)
    gameOver=false;runStats={tricks:0,bumps:0,zones:0,vmax:0,chainMax:0,gaps:0,surv:0};
    BenchPlayer.reset(rnd);
    BenchPlayer.skill=.72+rnd()*.2;BenchPlayer.jumpApp=.45+rnd()*.4;
    SURV.armed=true;
    AIP.resetRun();
    survStart();
    let t=0,portals=0;
    while(t<__DUR__ && !gameOver && !SURV.over){
      BenchPlayer.step(DT_);
      if(mode==='drive'&&s>L-32){          // PORTAIL (9370-9380)
        SURV.pBase+=s;runStats.zones++;portals++;
        trackSeed=(trackSeed^0x9e3779b9)>>>0;
        buildBenchTrack(trackSeed);
        s=0;lat=0;BenchPlayer.phi=0;
      }
      survTick(DT_);
      AIP.tick(DT_);
      t+=DT_;
    }
    const res=SURV_M.finish();
    res.totaux.portails=portals;
    res.totaux.finPar = gameOver?'joueur éliminé':(SURV.over?'meute au tapis':'temps écoulé');
    res.totaux.seed=seed;
    OUT.push(res);
  }
  __RESULT__=OUT.map(r=>({totaux:r.totaux,bots:r.summary}));
})();
`.replace('__NRUNS__',NRUNS).replace('__DUR__',DUR);

const sandbox={console,Math,JSON,Date,setTimeout:()=>0,clearTimeout:()=>0,
  Proxy,Reflect,Object,Array,String,Number,Boolean,Error,parseInt,parseFloat,isNaN,
  DT_:DT,__RESULT__:null};
sandbox.globalThis=sandbox;
vm.createContext(sandbox);
try{ vm.runInContext(src+driver,sandbox,{filename:'bench.js'}); }
catch(e){ console.error('ÉCHEC BANC :',e.message,'\n',e.stack&&e.stack.split('\n').slice(0,6).join('\n')); process.exit(1); }

const runs=sandbox.__RESULT__;
fs.writeFileSync(path.join(root,'out','baseline.json'),JSON.stringify(runs,null,1));

// ---------------- rapport ----------------
const nf=(x,d)=>x==null?'—':(typeof x==='number'?x.toFixed(d==null?0:d):x);
const T=runs.map(r=>r.totaux);
const sum=k=>T.reduce((a,b)=>a+(b[k]||0),0);
const avg=k=>sum(k)/T.length;

console.log('\n══════════ LIGNE DE BASE — '+NRUNS+' runs × '+DUR+' s de sim ══════════\n');
console.log('run  durée  portails  zones  1re_zone  z.prop  z.consom  décol  bord  trou  zone  morts  couperet  fin');
T.forEach((t,i)=>{
  console.log(
    String(i+1).padStart(3)+
    nf(t.duree,0).padStart(7)+
    String(t.portails).padStart(10)+
    String(t.zones).padStart(7)+
    (t.zonePremiereT<0?'—':nf(t.zonePremiereT,1)).padStart(10)+
    String(t.zoneProposees).padStart(8)+
    String(t.zoneConsommees).padStart(10)+
    String(t.decolTotal).padStart(7)+
    String(t.bordTotal).padStart(6)+
    String(t.trouTotal).padStart(6)+
    String(t.zoneTotal).padStart(6)+
    String(t.mortsTotal).padStart(7)+
    String(t.couperet).padStart(10)+
    '  '+t.finPar);
});

console.log('\n── MOYENNES ──');
console.log('  zones enregistrées / run ......... '+nf(avg('zones'),2));
console.log('  1re zone (s) ..................... '+nf(T.filter(t=>t.zonePremiereT>=0).reduce((a,b)=>a+b.zonePremiereT,0)/Math.max(1,T.filter(t=>t.zonePremiereT>=0).length),1)
            +'   ('+T.filter(t=>t.zonePremiereT<0).length+' run(s) sans aucune zone)');
console.log('  zones PROPOSÉES à un bot / run ... '+nf(avg('zoneProposees'),2));
console.log('  zones CONSOMMÉES / run .......... '+nf(avg('zoneConsommees'),2));
console.log('  décollages / run ................ '+nf(avg('decolTotal'),2)
            +'   (bord '+nf(avg('bordTotal'),2)+' · trou '+nf(avg('trouTotal'),2)+' · zone '+nf(avg('zoneTotal'),2)+')');
console.log('  morts de bot / run .............. '+nf(avg('mortsTotal'),2)+'   dont couperet '+nf(avg('couperet'),2));
console.log('  part de distance faite EN VOL ... '+(avg('partVolMoy')*100).toFixed(3)+' %');
{ const acc={};T.forEach(t=>{for(const k of Object.keys(t.survie||{})){(acc[k]=acc[k]||[]).push(t.survie[k]);}});
  console.log('  survie moyenne .................. '+Object.keys(acc).map(Number).sort((a,b)=>a-b).filter(k=>k<=60)
    .map(k=>k+'s='+(acc[k].reduce((a,c)=>a+c,0)/acc[k].length).toFixed(1)).join('  ')); }

// agrégat par pilote
const byName={};
runs.forEach(r=>r.bots.forEach(b=>{
  const o=byName[b.nom]||(byName[b.nom]={n:0,decol:0,bord:0,trou:0,zone:0,ok:0,mort:0,
    dVol:0,dSol:0,med:0,fin:0,morts:0,mortBord:0,mortTrou:0,mortCoup:0});
  o.n++;o.decol+=b.decol;o.bord+=b.bord;o.trou+=b.trou;o.zone+=b.zone;
  o.ok+=b.poses;o.mort+=b.morts;o.dVol+=b.dVol;o.dSol+=b.dSol;
  o.med+=b.ecartMed;o.fin+=b.ecartFinal;
  if(b.mort!=='—'){o.morts++;if(b.mort==='bord')o.mortBord++;else if(b.mort==='trou')o.mortTrou++;else o.mortCoup++;}
}));
console.log('\n── PAR PILOTE (moyenne sur '+NRUNS+' runs) ──');
console.log('pilote  décol  bord  trou  zone   posé/total  taux    d.vol   d.sol   %vol    écartMéd  écartFin  morts(bord/trou/coup)');
for(const k of Object.keys(byName)){
  const o=byName[k],tot=o.ok+o.mort;
  console.log(
    k.padEnd(7)+
    nf(o.decol/o.n,2).padStart(6)+
    nf(o.bord/o.n,2).padStart(6)+
    nf(o.trou/o.n,2).padStart(6)+
    nf(o.zone/o.n,2).padStart(6)+
    ('  '+o.ok+'/'+tot).padStart(12)+
    (tot?(o.ok/tot*100).toFixed(1)+'%':'—').padStart(8)+
    nf(o.dVol/o.n,0).padStart(8)+
    nf(o.dSol/o.n,0).padStart(8)+
    ((o.dVol+o.dSol)?(o.dVol/(o.dVol+o.dSol)*100).toFixed(2)+'%':'—').padStart(8)+
    nf(o.med/o.n,0).padStart(10)+
    nf(o.fin/o.n,0).padStart(10)+
    ('   '+o.morts+' ('+o.mortBord+'/'+o.mortTrou+'/'+o.mortCoup+')'));
}
console.log('\nJSON complet : out/baseline.json\n');
