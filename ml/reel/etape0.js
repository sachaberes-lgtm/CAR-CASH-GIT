#!/usr/bin/env node
/* ===== ETAPE 0 DES BOTS ML (2026-11-22, Sacha : « lance etape 0 » ; plan : passation/BOTS-ML.md) =====
   Reveiller ml/reel sur le jeu actuel et repondre a deux questions, sans un euro d'API :
   1. LA VITESSE — combien d'images de jeu par seconde le PC calcule (1 image = 1/60 s de jeu), apres chargement.
   2. LA REPETABILITE — meme graine = meme course ? (a) dans le meme processus, apres d'autres parties (resetGame) ;
      (b) dans un processus neuf (start). On compare la trace image par image, pas seulement le score.
   Le pilote est le champion d'octobre (results/champion-reel-g1.json) : il REAGIT a l'etat, donc le moindre ecart grossit.
   usage : node etape0.js [--tmax 60] [--graines 3]        (resultat : results/etape0.json) */
const fs=require('fs'),path=require('path'),crypto=require('crypto'),{fork}=require('child_process');
const arg=(n,d)=>{ const i=process.argv.indexOf('--'+n); return i>0?+process.argv[i+1]:d; };
const TMAX=arg('tmax',60), NG=arg('graines',3);
const ENFANT=process.argv.includes('--enfant');
const C=require('./cerveau');
const champ=JSON.parse(fs.readFileSync(path.join(__dirname,'results','champion-reel-g1.json'),'utf8'));
const W=Float64Array.from(champ.w);
const KEYS={L:'ArrowLeft',R:'ArrowRight',U:'ArrowUp',D:'ArrowDown',N:'Space'};

const t0=Date.now();
const {creer}=require('./jeu-reel');
const J=creer({silence:true});
const chargeMs=Date.now()-t0;

/* UNE COURSE : le champion conduit `graine` pendant TMAX s de jeu (ou jusqu'a la mort). Trace : etat lu toutes les 6 images. */
function course(graine){
  J.lancer(graine);
  const tenu={L:false,R:false,U:false,D:false,N:false};
  const poser=(k,on)=>{ if(tenu[k]!==on){ tenu[k]=on; J.touche(KEYS[k],on); } };
  const trk0=J.g.sandbox.__TRK; const inp=new Float64Array(C.NIN), out=new Float64Array(C.NOUT);
  let e=J.etat(), trk=trk0(), prevS=e.s, dist=0, fr=0, mort=false, air=0;
  const trace=[]; const N=Math.round(TMAX*60);
  const t1=Date.now();
  while(fr<N){
    if(fr%6===0){
      e=J.etat();
      trace.push([fr,e.mode,+e.s.toFixed(6),+e.lat.toFixed(6),+e.psi.toFixed(6),+e.vA.toFixed(6),+e.nitroR.toFixed(6)]);
      if(e.gameOver||e.mode==='boom'){ mort=true; break; }
      if(e.s<prevS-500){ trk=trk0(); prevS=e.s; } else { dist+=Math.max(0,e.s-prevS); prevS=e.s; }
      if(e.mode==='fall') air++;
      C.entrees(e,trk,inp); C.forward(W,inp,out);
      poser('U',out[1]>0); poser('D',out[3]>0); poser('L',out[0]>.33); poser('R',out[0]<-.33); poser('N',out[2]>0);
    }
    J.image(); fr++;
  }
  const ms=Date.now()-t1;
  J.lacher();
  const h=crypto.createHash('sha1').update(JSON.stringify(trace)).digest('hex').slice(0,12);
  return {graine, images:fr, ms, imgParS:Math.round(fr*1000/Math.max(1,ms)), foisTempsReel:+(fr/60/(ms/1000)).toFixed(2),
          dist:Math.round(dist), mort, air_s:+(air*6/60).toFixed(1), empreinte:h, trace};
}
const premierEcart=(a,b)=>{ for(let i=0;i<Math.min(a.length,b.length);i++) if(JSON.stringify(a[i])!==JSON.stringify(b[i])) return {image:a[i][0],a:a[i],b:b[i]}; return a.length===b.length?null:{image:Math.min(a.length,b.length)*6,longueurs:[a.length,b.length]}; };
const court=r=>{ const o=Object.assign({},r); delete o.trace; return o; };

if(ENFANT){
  /* PROCESSUS NEUF : une seule course, la graine demandee, en 1re partie (start) */
  const g=+process.argv[process.argv.indexOf('--enfant')+1];
  const r=course(g);
  process.send({r});
  setTimeout(()=>process.exit(0),50);
}else{
  console.log('jeu charge en',chargeMs,'ms | cache',(fs.readFileSync(path.join(__dirname,'..','..','VERSION PRINCIPALE','sw.js'),'utf8').match(/cashcar-v\d+/)||['?'])[0]);
  const graines=[]; for(let i=0;i<NG;i++) graines.push(900000+i*37);
  /* 1. VITESSE + 1re passe */
  const A=graines.map(g=>{ const r=course(g); console.log('passe 1',JSON.stringify(court(r))); return r; });
  /* 2. MEME PROCESSUS, 2e passe (apres d'autres parties : resetGame) */
  const B=graines.map(g=>{ const r=course(g); console.log('passe 2',JSON.stringify(court(r))); return r; });
  const memeProc=graines.map((g,i)=>({graine:g, identique:A[i].empreinte===B[i].empreinte, ecart:premierEcart(A[i].trace,B[i].trace)}));
  /* 3. PROCESSUS NEUF, 1re graine */
  const enfant=new Promise(res=>{ const c=fork(__filename,['--enfant',String(graines[0]),'--tmax',String(TMAX)],{silent:false}); c.on('message',m=>res(m.r)); c.on('exit',code=>res(null)); });
  enfant.then(F=>{
    const neuf=F?{graine:graines[0], identique:F.empreinte===A[0].empreinte, ecart:premierEcart(A[0].trace,F.trace), empreinte:F.empreinte}:{erreur:'le processus neuf n a rien rendu'};
    if(F) console.log('neuf   ',JSON.stringify(court(F)));
    const tout=A.concat(B), img=tout.reduce((a,r)=>a+r.images,0), ms=tout.reduce((a,r)=>a+r.ms,0);
    const bilan={date:new Date().toISOString(), node:process.version, chargeMs, tmax:TMAX,
      imgParS:Math.round(img*1000/ms), foisTempsReel:+(img/60/(ms/1000)).toFixed(2),
      repetable_memeProcessus:memeProc.every(x=>x.identique), repetable_processusNeuf:!!(F&&neuf.identique),
      courses:tout.map(court), memeProc, neuf};
    fs.writeFileSync(path.join(__dirname,'results','etape0.json'),JSON.stringify(bilan,null,1));
    console.log('\nBILAN | charge',chargeMs,'ms |',bilan.imgParS,'images/s =',bilan.foisTempsReel,'x temps reel | meme graine meme course : meme processus',bilan.repetable_memeProcessus?'OUI':'NON',', processus neuf',bilan.repetable_processusNeuf?'OUI':'NON');
    for(const x of memeProc) if(!x.identique) console.log('  ecart meme processus, graine',x.graine,JSON.stringify(x.ecart));
    if(F&&!neuf.identique) console.log('  ecart processus neuf',JSON.stringify(neuf.ecart));
    process.exit(0);
  });
}
