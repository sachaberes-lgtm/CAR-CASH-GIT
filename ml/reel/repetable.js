#!/usr/bin/env node
/* ===== MEME GRAINE = MEME COURSE ? LE CONTROLE, MAP PAR MAP (2026-11-22, etape 0 BOTS-ML) =====
   Pour chaque map du tirage : la graine X (course 1), une AUTRE course (autre graine, autre map) pour salir l'etat du jeu,
   puis la graine X de nouveau (course 3). Les deux traces doivent etre identiques au bit pres (position, vitesse, nitro,
   toutes les 6 images). Puis un PROCESSUS NEUF refait la graine X de la 1re map : meme trace attendue.
   Le pilote est le champion d'octobre : il reagit a l'etat, le moindre ecart grossit. A relancer apres chaque mise a jour du jeu.
   usage : node repetable.js [--tmax 20] [--cartes canyon,grotte]      (sortie : code 0 si tout est repetable, 1 sinon) */
const fs=require('fs'),path=require('path'),crypto=require('crypto'),{fork}=require('child_process');
const arg=(n,d)=>{ const i=process.argv.indexOf('--'+n); return i>0?process.argv[i+1]:d; };
const TMAX=+arg('tmax',20);
const C=require('./cerveau');
const W=Float64Array.from(JSON.parse(fs.readFileSync(path.join(__dirname,'results','champion-reel-g1.json'),'utf8')).w);
const KEYS={L:'ArrowLeft',R:'ArrowRight',U:'ArrowUp',D:'ArrowDown',N:'Space'};
const {creer}=require('./jeu-reel');
const J=creer({silence:true});

function course(graine,carte){
  J.lancer(graine,{carte:carte});
  const tenu={L:false,R:false,U:false,D:false,N:false};
  const poser=(k,on)=>{ if(tenu[k]!==on){ tenu[k]=on; J.touche(KEYS[k],on); } };
  const trk0=J.g.sandbox.__TRK, inp=new Float64Array(C.NIN), out=new Float64Array(C.NOUT);
  const vraie=J.ev('SF.der&&SF.der.carte'), Lp=J.ev('L');
  let e=J.etat(), trk=trk0(), prevS=e.s, fr=0; const tr=[];
  while(fr<TMAX*60){
    if(fr%6===0){ e=J.etat(); tr.push([fr,e.mode,e.s,e.lat,e.vA,e.nitroR,e.mode==='fall'?e.fpy:0]); /* (la hauteur de chute ne vaut qu'en vol) */
      if(e.gameOver||e.mode==='boom') break;
      if(e.s<prevS-500) trk=trk0(); prevS=e.s;
      C.entrees(e,trk,inp); C.forward(W,inp,out);
      poser('U',out[1]>0); poser('D',out[3]>0); poser('L',out[0]>.33); poser('R',out[0]<-.33); poser('N',out[2]>0); }
    J.image(); fr++; }
  J.lacher();
  return {graine, carte:vraie, Lpiste:Lp, h:crypto.createHash('sha1').update(JSON.stringify(tr)).digest('hex').slice(0,12), tr};
}
const ecart=(a,b)=>{ for(let i=0;i<Math.min(a.length,b.length);i++) if(JSON.stringify(a[i])!==JSON.stringify(b[i])) return {image:a[i][0],a:a[i],b:b[i]}; return a.length===b.length?null:{longueurs:[a.length,b.length]}; };

if(process.argv.includes('--enfant')){
  const r=course(+arg('graine',0),arg('carte',null));
  process.send({h:r.h,carte:r.carte,tr:r.tr}); setTimeout(()=>process.exit(0),50);
}else{
  const toutes=J.ev('Object.keys(SF_CARTES).filter(function(k){return !SF_HORS[k];})');
  const cartes=arg('cartes',null)?arg('cartes').split(','):toutes;
  console.log('maps du tirage :',toutes.join(' '),'| course de',TMAX,'s');
  const R=[]; let ok=true;
  cartes.forEach((c,i)=>{
    const g=700000+i*101, autre=cartes[(i+1)%cartes.length];
    const a=course(g,c); course(g+50,autre); const b=course(g,c);
    const d=a.h===b.h?null:ecart(a.tr,b.tr); if(d) ok=false;
    R.push({carte:c,graine:g,identique:!d,ecart:d});
    console.log((d?'NON':'oui').padEnd(4),c.padEnd(10),'graine',g,'| piste',Math.round(a.Lpiste),'m / ',Math.round(b.Lpiste),'m | empreintes',a.h,b.h,d?'| 1er ecart image '+d.image+' '+JSON.stringify(d.a)+' vs '+JSON.stringify(d.b):'');
  });
  /* DEUX PROCESSUS NEUFS, la meme graine : le cas des rejeux (un rejeu se rejoue dans un processus neuf) */
  const c0=cartes[0], g0=700000;
  const enfant=()=>new Promise(res=>{ const p=fork(__filename,['--enfant','--graine',String(g0),'--carte',c0,'--tmax',String(TMAX)]); p.on('message',res); p.on('exit',()=>res(null)); });
  Promise.all([enfant(),enfant()]).then(([m1,m2])=>{
    const d=!m1||!m2?{erreur:'un processus neuf n a rien rendu'}:m1.h===m2.h?null:ecart(m1.tr,m2.tr);
    const neufsOk=!d;
    console.log((d?'NON':'oui').padEnd(4),'deux processus neufs,',c0,'graine',g0,'| empreintes',m1&&m1.h,m2&&m2.h,d?'| 1er ecart '+JSON.stringify(d):'');
    /* et le meme processus (apres 21 courses) contre un processus neuf */
    const ref=course(g0,c0); const d2=m1&&m1.h===ref.h?null:ecart(ref.tr,m1?m1.tr:[]);
    console.log((d2?'NON':'oui').padEnd(4),'meme processus contre processus neuf,',c0,'| empreintes',ref.h,m1&&m1.h,d2?'| 1er ecart image '+d2.image+' '+JSON.stringify(d2.a)+' vs '+JSON.stringify(d2.b):'');
    if(d2) ok=false;
    fs.writeFileSync(path.join(__dirname,'results','repetable.json'),JSON.stringify({date:new Date().toISOString(),tmax:TMAX,cartes:R,deuxProcessusNeufs:{carte:c0,graine:g0,identique:neufsOk,ecart:d},memeContreNeuf:{identique:!d2,ecart:d2}},null,1));
    console.log('\nREJEUX (processus neuf) :',neufsOk?'REPETABLES':'PAS REPETABLES','| MEME PROCESSUS :',ok?'REPETABLE sur toutes les maps testees':'PAS REPETABLE (voir les lignes NON)');
    process.exit(ok&&neufsOk?0:1);
  });
}
