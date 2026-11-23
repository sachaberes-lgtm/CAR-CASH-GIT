#!/usr/bin/env node
/* ===== VERIFIER LE CONTRAT (2026-11-23, etape 1 BOTS-ML ; regle de ml/train : « rien n'est annonce sans avoir ete vu ou mesure ») =====
   Quatre controles, dans le VRAI jeu (ml/reel). A relancer apres chaque mise a jour du jeu, ou du dossier ml/bot.
     1. LES GESTES : chaque geste fait bien, dans le jeu, ce que son nom dit (figure sur la route dans les 4 directions, saut qui decolle,
        figure en vol dans les 4 directions, redressement).
     2. LES DOIGTS : sur une vraie course du bot de reference, aucune touche ne bat plus vite que les limites d'une main (HUMAIN).
     3. MEME GRAINE = MEME COURSE : deux processus neufs, la meme graine → la meme course ET les memes touches.
     4. REGARDER NE CHANGE RIEN : sans l'enregistreur du jeu, ou en ouvrant les yeux a chaque image, la course est la meme.
   usage : node verifier.js [--graine 910000] [--tmax 150]        (sortie : results/verifier.json ; code 0 = tout passe) */
const fs=require('fs'),path=require('path'),crypto=require('crypto'),{fork}=require('child_process');
const A=process.argv.slice(2),opt=(n,d)=>{const i=A.indexOf('--'+n);return i>=0?A[i+1]:d;};
const {HUMAIN}=require('./doigts');
const REF=path.join(__dirname,'reference.js');
const sha=x=>crypto.createHash('sha1').update(JSON.stringify(x)).digest('hex').slice(0,12);

if(A.includes('--enfant')){
  const {ouvrir,charger,course}=require('./piloter'),Y=require('./yeux'),{Doigts}=require('./doigts');
  process.on('message',function(m){
    const J=ouvrir();let r;
    if(m.quoi==='course'){
      const x=course(J,charger(REF),m.graine,Object.assign({tmax:m.tmax},m.o||{}));
      r={empreinte:x.bilan.empreinte,touches:sha(x.touches),journal:m.journal?x.touches:undefined,images:x.bilan.images,cause:x.bilan.cause,duree:x.bilan.duree_s,cartes:x.bilan.cartes,
         argent:x.bilan.argent,figures:x.bilan.figures_payees,decisions:x.bilan.decisions};
    }else r=gestes(J,Y,Doigts);
    process.send(r,function(){process.exit(0);});
  });
  /* LES GESTES, un par un, sur une droite des nuages : on lit dans le jeu ce qui est parti */
  function gestes(J,Y,Doigts){
    const q=e=>{try{return J.ev(e);}catch(x){return null;}},out=[];
    const essai=function(nom,attendu,script){
      J.lancer(920000,{carte:'nuages'});const D=new Doigts(J,()=>Y.modeDe(J)),vu={route:null,vol:false,enVol:[],redresse:q('FX2.redresse')|0,etat:{}};
      for(let fr=0;fr<60*9;fr++){
        if(fr%HUMAIN.decision===0){const v=Y.voir(J);if(v.fini)break;v.image=fr;v.t=fr/60;D.ordre(script(v,fr,vu.etat)||{},v);}
        D.image();J.image();
        const m=Y.modeDe(J);
        if(m==='bond'&&!vu.route)vu.route=q('FR.f?FR.f.id+"/"+(FR.f.sens||""):null');
        if(m==='vol'){vu.vol=true;const L=q('FX2.corps.figs.filter(function(r){return !r.paye;}).map(function(r){return r.f.id+"/"+(r.f.sens||"");}).join(",")');
          if(L)for(const x of L.split(','))if(vu.enVol.indexOf(x)<0)vu.enVol.push(x);}
      }
      vu.redresse=(q('FX2.redresse')|0)-vu.redresse;
      const ok=attendu(vu);out.push({geste:nom,ok:!!ok,vu:{route:vu.route,vol:vu.vol,enVol:vu.enVol,redresse:vu.redresse}});
    };
    const droit=v=>v.mode==='sol'?{ligne:0}:{};
    const FIG={avant:'salto/avant',arriere:'salto/arriere',gauche:'tailwhip/',droite:'tailwhip/'};
    for(const d of Object.keys(FIG))
      essai('figure sur la route · '+d,vu=>vu.route===FIG[d]&&!vu.vol,(v,fr)=>fr===240?Object.assign(droit(v),{geste:'figure',direction:d}):droit(v));
    essai('saut',vu=>vu.vol,(v,fr)=>fr===240?{ligne:0,geste:'saut',direction:'avant'}:droit(v));
    /* en vol : le manche tire (↓) rallonge le petit saut du test, sinon une 2e figure n'a pas le temps de partir (le jeu la refuse) */
    for(const d of Object.keys(FIG))
      essai('figure en vol · '+d,vu=>vu.vol&&vu.enVol.indexOf(FIG[d])>=0,(v,fr,e)=>{
        if(fr===240)return {ligne:0,geste:'saut',direction:d==='gauche'||d==='droite'?'avant':'gauche'}; /* le saut part avec une AUTRE figure que celle qu'on teste */
        if(v.mode==='vol'){if(!e.f&&v.vol.t>.6){e.f=1;return {geste:'figure',direction:d};}return e.f?{}:{manche:1};}
        return droit(v);});
    essai('redresser',vu=>vu.vol&&vu.redresse>=1,(v,fr,e)=>{
      if(fr===240)return {ligne:0,geste:'saut',direction:'avant'};
      if(v.mode==='vol'){if(!e.f&&v.vol.t>.5){e.f=1;return {geste:'figure',direction:'avant'};}if(e.f===1&&v.vol.figure&&v.vol.t>1.05){e.f=2;return {geste:'redresser'};}return e.f?{}:{manche:1};}
      return droit(v);});
    return {gestes:out};
  }
  return;
}

const G=+opt('graine',910000),TMAX=+opt('tmax',150);
const enfant=m=>new Promise(res=>{const c=fork(__filename,['--enfant'],{silent:true});let r=null;c.on('message',x=>{r=x;});c.on('exit',()=>res(r));c.send(m);});
/* LES LIMITES D'UNE MAIN, lues dans le journal des touches d'une vraie course */
function mains(T){
  const par={},pb=[];let nApp=0,court=1e9,repos=1e9;
  for(const [i,k,bas] of T){const s=par[k]||(par[k]={bas:false,depuis:-1e9,debuts:[]});
    if(bas){if(s.bas)pb.push(k+' enfoncee deux fois');const r=i-s.depuis;if(s.depuis>-1e9){if(r<repos)repos=r;if(r<HUMAIN.repos)pb.push(`${k} reprise apres ${r} images (image ${i})`);}s.debuts.push(i);nApp++;}
    else{const d=i-s.depuis;if(d<court)court=d;if(d<HUMAIN.appui)pb.push(`${k} tenue ${d} images (image ${i})`);}
    s.bas=!!bas;s.depuis=i;}
  /* la cadence la plus vive : le plus d'appuis d'une meme touche dans une seconde */
  let cadence=0;for(const k in par){const D=par[k].debuts;for(let a=0,b=0;b<D.length;b++){while(D[b]-D[a]>=60)a++;cadence=Math.max(cadence,b-a+1);}}
  return {appuis:nApp,appuiLePlusCourt_images:court,reposLePlusCourt_images:repos,appuisParSecondeMax:cadence,problemes:pb.slice(0,8),ok:pb.length===0&&cadence<=Math.ceil(60/(HUMAIN.appui+HUMAIN.repos))};
}
(async function(){
  const t0=Date.now();
  console.log(`controle du contrat · graine ${G} · ${TMAX} s · 5 processus neufs…`);
  const [g,a,b,sansRec,yeux]=await Promise.all([
    enfant({quoi:'gestes'}),
    enfant({quoi:'course',graine:G,tmax:TMAX,journal:true}),
    enfant({quoi:'course',graine:G,tmax:TMAX}),
    enfant({quoi:'course',graine:G,tmax:TMAX,o:{sansEnregistreur:true}}),
    enfant({quoi:'course',graine:G,tmax:TMAX,o:{yeuxEnPlus:true}})]);
  const R={date:new Date().toISOString(),graine:G,tmax:TMAX,humain:HUMAIN};let tout=true;
  const dit=(ok,txt)=>{if(!ok)tout=false;console.log((ok?'  OK   ':'  RATE ')+txt);};
  console.log('\n1. LES GESTES dans le jeu');
  if(!g||!g.gestes){dit(false,'le processus des gestes n\'a rien rendu');R.gestes=null;}
  else{R.gestes=g.gestes;for(const x of g.gestes)dit(x.ok,x.geste+' → '+(x.vu.route?'sur la route : '+x.vu.route+' ':'')+(x.vu.vol?'· a decolle ':'')+(x.vu.enVol.length?'· en vol : '+x.vu.enVol.join(', ')+' ':'')+(x.vu.redresse?'· redressee':''));}
  console.log('\n2. LES DOIGTS (une main ne va pas plus vite)');
  if(!a){dit(false,'la course n\'a rien rendu');}
  else{const m=mains(a.journal);R.doigts=m;R.course={cartes:a.cartes,duree:a.duree,cause:a.cause,argent:a.argent,figures:a.figures,decisions:a.decisions};
    dit(m.ok,`${m.appuis} appuis en ${a.duree} s (${a.cartes.join(' > ')}) · le plus court ${m.appuiLePlusCourt_images} images (limite ${HUMAIN.appui}) · repos le plus court ${m.reposLePlusCourt_images} (limite ${HUMAIN.repos}) · au plus ${m.appuisParSecondeMax} appuis par seconde sur une touche`);
    for(const p of m.problemes)console.log('         '+p);
    dit(a.decisions<=Math.ceil(a.images/HUMAIN.decision)+1,`${a.decisions} decisions pour ${a.images} images : ${(a.decisions/(a.images/60)).toFixed(1)} par seconde`);}
  console.log('\n3. MEME GRAINE = MEME COURSE (deux processus neufs)');
  const meme=(x,y)=>!!(x&&y&&x.empreinte===y.empreinte&&x.touches===y.touches&&x.images===y.images);
  R.repetable={a:a&&{empreinte:a.empreinte,touches:a.touches,images:a.images},b:b&&{empreinte:b.empreinte,touches:b.touches,images:b.images},ok:meme(a,b)};
  dit(R.repetable.ok,a&&b?`course ${a.empreinte} / ${b.empreinte} · touches ${a.touches} / ${b.touches} · ${a.images} / ${b.images} images`:'une des deux courses n\'a rien rendu');
  console.log('\n4. REGARDER NE CHANGE RIEN');
  R.sansEnregistreur={ok:meme(a,sansRec)};dit(R.sansEnregistreur.ok,'sans l\'enregistreur du jeu : '+(sansRec?sansRec.empreinte:'rien'));
  R.yeuxEnPlus={ok:meme(a,yeux)};dit(R.yeuxEnPlus.ok,'les yeux ouverts a chaque image : '+(yeux?yeux.empreinte:'rien'));
  R.ok=tout;
  fs.mkdirSync(path.join(__dirname,'results'),{recursive:true});
  if(a)delete a.journal;
  fs.writeFileSync(path.join(__dirname,'results','verifier.json'),JSON.stringify(R,null,1));
  console.log('\n'+(tout?'TOUT PASSE':'DES CONTROLES RATENT')+' · '+Math.round((Date.now()-t0)/1000)+' s · results/verifier.json');
  process.exit(tout?0:1);
})();
