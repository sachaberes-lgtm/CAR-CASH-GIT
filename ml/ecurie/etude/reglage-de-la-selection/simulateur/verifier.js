#!/usr/bin/env node
/* ===== LE SIMULATEUR : LES PREUVES DE FIDELITE ET LES CAS CONNUS (27/11/2026, l'etude « simulateur ») =====
   node verifier.js   (ou node simuler.js --verifier ; moins d'une minute, un seul processus ; ecrit seulement dans le dossier temporaire du systeme,
   pour y extraire genome.js du commit e2ea8d2c9 — celui de l'evolution du 27/11 — par « git archive », sans rien toucher au depot)
   1. le modele pilote + graine du simulateur contre le VRAI note.ajuster, sur les 527 vraies courses et sur des courses simulees avec graines reutilisees ;
   2. la note de la generation 0 reelle : F recalcule (palier du simulateur + E reel) = F du journal, meme classement ;
   3. les naissances : la generation 0 et les 6 naissances de la generation 1 rejouees avec les regles du simulateur et le VRAI genome.muter / croiser
      du commit de l'evolution : memes identifiants, memes parents, memes origines, memes graines, meme etat du generateur que population.json ;
   4. le simulateur rend la generation 0 reelle : sigma des residus, dispersion des a, se_E, parties, graines identiques au temoin ;
   5. les cas connus : un monde sans aucun effet (le champion ne peut rien gagner ; taux de faux sacres) ; un monde sans bruit (la selection doit monter). */
'use strict';
const fs=require('fs'),path=require('path'),os=require('os'),{execFileSync}=require('child_process');
const ML=path.join(__dirname,'..','..','..','..'),RACINE=path.join(ML,'..');
const N=require(path.join(ML,'evolution','note.js')),Gr=require(path.join(ML,'evolution','graines.js'));
const S=require('./simuler.js');
const D=path.join(__dirname,'donnees');
const f=(x,d)=>x==null?'-':(+x).toFixed(d==null?3:d);
let ok=true;const dire=(t,b)=>{if(b===false)ok=false;console.log((b===false?'ECHEC ':b===true?'OK    ':'      ')+t);};

function lignesReelles(){return fs.readFileSync(path.join(D,'courses-2026-48.jsonl'),'utf8').trim().split('\n').map(JSON.parse);}

/* 1. LE MODELE PILOTE + GRAINE */
function comparerAjustement(lignes,ids,titre){
  const R=N.ajuster(lignes,{passes:10,retrecir:12,ids});
  /* les memes lignes, dans l'etat du simulateur */
  const st={cfg:S.fusion(S.CFG0,{}),nPil:0,nGr:0,nL:0,idxGraine:new Map(),lp:new Int32Array(lignes.length),lg:new Int32Array(lignes.length),ly:new Float64Array(lignes.length)};
  const ip=new Map();
  for(const l of lignes){if(!ip.has(l.id))ip.set(l.id,st.nPil++);let g=st.idxGraine.get(l.graine);if(g===undefined){g=st.nGr++;st.idxGraine.set(l.graine,g);}
    st.lp[st.nL]=ip.get(l.id);st.lg[st.nL]=g;st.ly[st.nL]=l.palier;st.nL++;}
  const fit=S.ajusterSim(st,ids.map(i=>ip.get(i)));
  let d=Math.abs(fit.sigmaRes-R.sigmaRes)+Math.abs(fit.abar-R.abar);
  for(const [id,p] of ip){const n=fit.n[p];d=Math.max(d,Math.abs(fit.a[p]-R.a[id]),Math.abs((fit.a[p]-fit.abar)*n/(n+12)+fit.abar-R.ahat[id]),Math.abs(fit.sigmaRes/Math.sqrt(n)-R.se[id]));}
  dire(titre+' : '+lignes.length+' courses, '+ip.size+' pilotes ; plus grand ecart (a, â, se_a, sigmaRes, ā) avec note.ajuster '+d.toExponential(2),d<1e-9);
  return d;
}

function tout(){
  const t0=Date.now();
  const L=lignesReelles().filter(l=>l.usage==='entrainement'&&l.mesuree===true);
  const pop=JSON.parse(fs.readFileSync(path.join(D,'population.json'),'utf8'));
  const G0=JSON.parse(fs.readFileSync(path.join(D,'generations.jsonl'),'utf8').trim().split('\n')[0]);
  const CAL=JSON.parse(fs.readFileSync(path.join(D,'calibrage.json'),'utf8'));
  console.log('== 1. le modele pilote + graine ==');
  comparerAjustement(L,pop.vivants.map(v=>v.id),'les vraies courses (generations 0 et 1)');
  /* des courses simulees ou les graines reviennent (reserve de 30 graines : elle s'epuise a la 3e generation) */
  {
    const lignes=[];
    S.evoluer({scenario:'moyen',graine:5,debit:400,cfg:{graines:{entrainement:{depart:910000,pas:37,n:30}}},budgets:[1e9],generationsMax:14,
      surGeneration:function(st){if(st.G===14){for(let i=0;i<st.nL;i++){lignes.push({id:'p'+st.lp[i],graine:[...st.idxGraine.entries()].find(e=>e[1]===st.lg[i])[0],palier:st.ly[i],survie_s:1,mesuree:true});}
        lignes.ids=st.vivants.map(v=>'p'+v.i);}}});
    const nG=new Set(lignes.map(l=>l.graine)).size;
    comparerAjustement(lignes,lignes.ids,'des courses simulees, 15 generations sur '+nG+' graines reutilisees');
  }

  console.log('\n== 2. la note de la generation 0 reelle (palier du simulateur + E reel de note.js) ==');
  {
    const e0=L.filter(l=>l.generation===0),ids=G0.population.map(x=>x.id);
    const st={cfg:S.fusion(S.CFG0,{}),nPil:0,nGr:0,nL:0,idxGraine:new Map(),lp:new Int32Array(e0.length),lg:new Int32Array(e0.length),ly:new Float64Array(e0.length)};
    const ip=new Map();
    for(const l of e0){if(!ip.has(l.id))ip.set(l.id,st.nPil++);let g=st.idxGraine.get(l.graine);if(g===undefined){g=st.nGr++;st.idxGraine.set(l.graine,g);}st.lp[st.nL]=ip.get(l.id);st.lg[st.nL]=g;st.ly[st.nL]=l.palier;st.nL++;}
    const fit=S.ajusterSim(st,ids.map(i=>ip.get(i)));
    let d=0;const F={};
    for(const x of G0.population){const p=ip.get(x.id),n=fit.n[p],ah=(fit.a[p]-fit.abar)*n/(n+12)+fit.abar;F[x.id]=ah-4*CAL.generation0.E[x.id].E;d=Math.max(d,Math.abs(F[x.id]-x.F));}
    const r1=G0.population.slice().sort((a,b)=>b.F-a.F).map(x=>x.id).join(','),r2=Object.keys(F).sort((a,b)=>F[b]-F[a]).join(',');
    dire('F de la generation 0 : plus grand ecart au journal '+d.toExponential(2)+' (le journal arrondit a 4 decimales) ; classement identique : '+(r1===r2),d<1e-3&&r1===r2);
  }

  console.log('\n== 3. les naissances rejouees avec le vrai genome.js du commit de l\'evolution ==');
  {
    const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'simulateur-e2ea-'));
    for(const f of ['ml/evolution/genome.js','ml/evolution/commun.js','ml/evolution/graines.js','ml/evolution/config.json','ml/ecurie/pilote-voltige.js']){
      const dst=path.join(tmp,...f.split('/'));fs.mkdirSync(path.dirname(dst),{recursive:true});
      fs.writeFileSync(dst,execFileSync('git',['-C',RACINE,'show','e2ea8d2c9:'+f],{maxBuffer:64*1024*1024}));}
    const Gn=require(path.join(tmp,'ml','evolution','genome.js'));
    const cfg=JSON.parse(fs.readFileSync(path.join(tmp,'ml','evolution','config.json'),'utf8'));
    /* la generation 0 (evoluer.generation0) */
    const rng=Gr.mulberry32(cfg.graineMaitre>>>0),T=Gn.genomeTemoin(cfg),tid=Gn.idDe(T);
    const V=[{i:tid,genome:T}],vus=new Set([tid]);
    while(V.length<cfg.mu){let g=Gn.muter(T,rng,{phase:'A',cfg,genes:cfg.generation0.genesMin+rng.entier(cfg.generation0.genesMax-cfg.generation0.genesMin+1),sigma:cfg.generation0.sigma}).genome,id=Gn.idDe(g),e=0;
      while(vus.has(id)&&e<cfg.essaisDoublon){g=Gn.muter(g,rng,{phase:'A',cfg}).genome;id=Gn.idDe(g);e++;}vus.add(id);V.push({i:id,genome:g});}
    const r0=Gr.grainesEntrainement(Gr.etatInitial(cfg),rng,cfg.grainesParGeneration,cfg);
    const idsOk=V.map(v=>v.i).join(',')===G0.naissances.map(x=>x.id).join(','),grOk=r0.graines.join(',')===G0.graines.join(',');
    dire('generation 0 : les 20 identifiants '+(idsOk?'identiques':'DIFFERENTS')+' ; les 12 graines '+(grOk?'identiques':'DIFFERENTES')+' ('+r0.graines.slice(0,3).join(' ')+'…)',idsOk&&grOk);
    /* la generation 1 : notes reelles de la generation 0 (note.noter), puis les naissances par la regle du simulateur (simuler.naissancesRegle) */
    const notesR=N.noter(L.filter(l=>l.generation===0),{REF:N.referenceEpoque(),cfg:cfg.note,ids:V.map(v=>v.i)});
    const notes={par:new Map(Object.entries(notesR.par))};
    const op={id:v=>v.i,
      muter:(par,r,o)=>({genome:Gn.muter(par.genome,r,{phase:'A',cfg,genes:o.genes,sigma:o.sigma}).genome}),
      croiser:(a,b,r)=>({genome:Gn.croiser(a.genome,b.genome,r)}),
      naitre:(g,o,r)=>{let G=g.genome,id=Gn.idDe(G),e=0;while(vus.has(id)&&e<cfg.essaisDoublon){G=Gn.muter(G,r,{phase:'A',cfg}).genome;id=Gn.idDe(G);e++;}
        if(vus.has(id))return null;vus.add(id);return {i:id,genome:G,parents:o.parents,origine:o.origine};}};
    const nes=S.naissancesRegle(cfg,V,V[0],notes,rng,op,1);
    const r1=Gr.grainesEntrainement(r0.eg,rng,cfg.grainesParGeneration,cfg);
    const attendu=pop.naissancesGeneration;
    let memes=0;for(let k=0;k<attendu.length;k++){const a=attendu[k],b=nes[k];if(b&&a.id===b.i&&a.origine===b.origine&&a.parents.join(',')===b.parents.join(','))memes++;}
    dire('generation 1 : '+memes+' naissances sur '+attendu.length+' identiques (identifiant, parents, origine : '+nes.map(v=>v.i.slice(0,6)+' '+v.origine).join(', ')+')',memes===attendu.length);
    dire('generation 1 : graines '+(r1.graines.join(',')===pop.grainesGeneration.join(',')?'identiques':'DIFFERENTES')+' ; etat du generateur '+rng.etat()+' (population.json : '+pop.rng+')',
      r1.graines.join(',')===pop.grainesGeneration.join(',')&&rng.etat()===pop.rng);
    try{fs.rmSync(tmp,{recursive:true,force:true});}catch(e){}
  }

  console.log('\n== 4. le simulateur rend-il la generation 0 reelle ? (scenario moyen, 40 mondes) ==');
  {
    const sig=[],sdA=[],seE=[],par=[],ident=[],sdE=[],e4=[];
    for(let w=0;w<40;w++){
      S.evoluer({scenario:'moyen',graine:100+w,debit:400,budgets:[1e9],generationsMax:0,surGeneration:function(st){
        const n=S.noterSim(st),T=st.temoin,X=st.vivants.filter(v=>v!==T).map(v=>n.par.get(v.i));
        sig.push(n.sigmaRes);
        const m=X.reduce((s,x)=>s+x.a,0)/X.length;sdA.push(Math.sqrt(X.reduce((s,x)=>s+(x.a-m)*(x.a-m),0)/(X.length-1)));
        const XE=X.filter(x=>x.E<4),mE=XE.reduce((s,x)=>s+x.E,0)/XE.length;sdE.push(Math.sqrt(XE.reduce((s,x)=>s+(x.E-mE)*(x.E-mE),0)/(XE.length-1)));e4.push(X.length-XE.length);
        for(const v of st.vivants){const x=n.par.get(v.i);seE.push(x.se_E);par.push(v.parties);}
        /* graines ou un mutant fait la course du temoin au bit pres */
        let s=0,c=0;const gr=[...st.idxGraine.keys()];
        for(const v of st.vivants){if(v===T)continue;for(const g of gr){c++;const a=S.course(Object.assign({},st,{mur_s:0}),v,g),b=S.course(Object.assign({},st,{mur_s:0}),T,g);if(a.palier===b.palier&&a.e===b.e)s++;}}
        ident.push(s/c);}});
    }
    const moy=A=>A.reduce((s,x)=>s+x,0)/A.length;
    console.log('      mesure                                   | reel (27/11) | simule (moyenne de 40 mondes)');
    console.log('      sigma des residus (20 x 12 courses)      |        '+f(CAL.sigmaResG0,2)+' | '+f(moy(sig),2));
    console.log('      ET observee des a des 19 mutants          |        '+f(Math.sqrt(CAL.mutantsG0.vA),2)+' | '+f(moy(sdA),2));
    console.log('      ET observee des E des 19 mutants (E<4)    |        '+f(Math.sqrt(CAL.mutantsG0.vE),3)+' | '+f(moy(sdE),3));
    console.log('      mutants a E = 4 (moins de 5 parties)      |            0 | '+f(moy(e4),2)+' par generation 0 (une mutation letale : le pilote meurt avant 60 s)');
    console.log('      se_E moyen (12 courses)                   |        '+f(CAL.seE12,3)+' | '+f(moy(seE),3));
    console.log('      parties de plus de 60 s par pilote        |        '+f(8.80,2)+' | '+f(moy(par),2));
    console.log('      part des graines identiques au temoin     |        '+f(44/437,3)+' | '+f(moy(ident),3)+'   (le reel : 44 graines sur 437, les 19 mutants)');
    const d1=Math.abs(moy(sig)-CAL.sigmaResG0)<.25,d2=Math.abs(moy(sdA)-Math.sqrt(CAL.mutantsG0.vA))<.3,d3=Math.abs(moy(seE)-CAL.seE12)<.03&&Math.abs(moy(sdE)-Math.sqrt(CAL.mutantsG0.vE))<.04,d4=Math.abs(moy(par)-8.8)<1.2;
    dire('le simulateur rend les ordres de grandeur de la generation 0 reelle',d1&&d2&&d3&&d4);
  }

  console.log('\n== 5. les cas connus ==');
  {
    /* un monde sans aucun effet : tous les pilotes valent le temoin ; tout sacre est faux */
    let sac=0,val=0,gain=0;
    for(let k=0;k<6;k++){const r=S.evoluer({scenario:'nul',graine:200+k,debit:400,budgets:[30000]});const p=r.points[0];sac+=p.sacres;val+=p.validations;gain=Math.max(gain,Math.abs(p.champion.dF),Math.abs(p.meilleurVivantF));}
    dire('monde sans effet (6 evolutions de 30 000 courses) : plus grand gain vrai '+gain.toExponential(1)+' (attendu 0) ; '+sac+' sacres (tous faux) sur '+val+' validations ('+f(val?100*sac/val:0,1)+' % ; la relecture statistique mesurait ~3,7 % de faux sacres quand le meneur ne vaut pas mieux)',gain<1e-12);
    /* un monde sans bruit : la selection doit monter, et le champion ne jamais reculer */
    let recul=0,fin=[];
    for(let k=0;k<4;k++){let prev=-1e9;const r=S.evoluer({scenario:'optimiste',graine:300+k,debit:400,budgets:[40000],sansBruit:true,
      surGeneration:function(st){if(st.champion.vraiF<prev-1e-9)recul++;prev=st.champion.vraiF;}});fin.push(r.points[0]);}
    dire('monde sans bruit, scenario optimiste (4 x 40 000 courses) : le champion a recule '+recul+' fois ; meilleur vivant +'+fin.map(p=>f(p.meilleurVivantF,2)).join(' +')+
      ' F, champion +'+fin.map(p=>f(p.champion.dF,2)).join(' +')+' F (plafonds '+fin.map(p=>f(p.plafond,1)).join(' ')+')',recul===0&&fin.every(p=>p.meilleurVivantF>0.3));
  }
  console.log('\n'+(ok?'TOUT PASSE':'AU MOINS UN ECHEC')+' ('+((Date.now()-t0)/1000).toFixed(1)+' s)');
  process.exitCode=ok?0:1;
}
module.exports={tout};
if(require.main===module)tout();
