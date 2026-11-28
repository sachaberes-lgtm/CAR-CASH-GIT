/* ===== TRI PRECOCE, QUESTIONS 1 ET 2 : TOUTE LA SELECTION SIMULEE, A VERITE CONNUE (27/11/2026, etude « tri-precoce ») =====
   Une copie simplifiee de la boucle de ml/evolution/evoluer.js (§ 6.1 de INTERFACES.md), ou chaque pilote a une VRAIE valeur theta (en paliers de F)
   que le simulateur connait et que la selection ne voit qu'a travers des courses bruitees.
   CE QUI EST MESURE (mesures.txt, regles.txt) :
     palier d'une course = 7 + theta + b_g + residu   (b_g ~ N(0 ; 1,98) l'effet de la graine ; le residu tire dans les 526 VRAIS residus, ET 3,19)
     E observe = moyenne, sur les parties (78 % des courses), d'un bruit N(0 ; 0,31) par partie (l'E vrai ne varie pas entre pilotes : § A)
     le temps de calcul d'une course : celui des vraies courses de meme palier (verifier.txt § 3)
     LES COURSES IDENTIQUES (le jeu est deterministe) : un enfant refait EXACTEMENT la course de son parent sur une graine avec une probabilite r propre
     a l'enfant : r tire dans les 19 taux mesures des mutants de la gen. 0 face au temoin (0 a 8 courses sur 23) ; un CLONE (mutation muette :
     9627905cd5bb, 2 genes, 11 courses sur 11 identiques a son parent) a r = 1 ; un croisement ou un immigre, r = 0 (0 sur 11 mesures).
   CE QUI EST SUPPOSE :
     les effets des mutations (les donnees ne voient AUCUNE difference vraie entre les mutants de la gen. 0 : test-retest -0,2) :
       tres-faible : delta ~ N(−0,05 ; 0,15)    faible : N(−0,1 ; 0,3)    moyen : N(−0,2 ; 0,6)
       casse : moyen, et 2 enfants sur 10 casses (delta = −4 − |N(0,1)|, un pilote « visiblement rate »)
     la part des mutations simples qui sont muettes (clones) : 1/4 (vu : 1 sur 4 mutations simples de la gen. 1 ; « moyen-sans-clones » : 0) ;
     les courses identiques independantes d'une graine a l'autre ; aucun plafond (theta peut monter sans fin) ; pas de validation, de sacre, de phases.
   Ce qui est repris de evoluer.js : mu 20, lambda 6 (dont 1 immigre, fils du temoin a 8 genes), tournoi de 3 parmi les pilotes nes en G−2 ou avant
   (n >= 24 dans le code actuel), croisement 3 fois sur 10, le temoin jamais renvoye, le renvoi des F les plus bas parmi les pilotes nes avant la
   generation (la protection de 24 courses du code actuel), la generation 0 = le temoin + 19 mutants, la note = le modele de note.js sur TOUTE l'epoque.
   LES SCHEMAS (« +T » = le tri precoce, k = 3, c = 2 ; « +K » = le tri des clones : apres 4 graines, un enfant dont les 4 courses sont identiques
   a celles de son parent vivant est renvoye) :
     A        comme aujourd'hui : tous les vivants rejouent 12 graines neuves (312 courses)
     B2/B4/B8 les enfants 12 graines neuves, les anciens les 2/4/8 PREMIERES de ces 12
     C        les enfants 12 ; un ancien rejoue 12 seulement s'il est pres du seuil (F − S < 2 se) ou dans les 3 premiers
     D0       un jeu de 12 graines FIXE : les enfants le jouent, les anciens ne rejouent jamais (72 courses)
     D1       D0, et une graine du jeu remplacee par une neuve a chaque generation (le jeu tourne lentement)
   LES MESURES, a budget de calcul EGAL (en jours du Xeon : 191 courses/h x 69,85 s = 320 000 s de courses par jour) : le vrai theta moyen des
   ANCIENS vivants (nes avant la generation : un enfant casse du jour ne fausse pas la moyenne), celui du meneur (le premier par F), le meilleur vrai ;
   a la generation 10, la precision de la note cumulee des anciens (Spearman F / theta, l'erreur de F, la malediction du meneur, n moyen).
   usage : node population.js [repetitions=30] > population.txt     (un seul processus, ~3 min a 30) */
'use strict';
const O=require('./outils');
const REP=+(process.argv[2]||30);
const res=O.R.residus,PARTIES=O.R.partParties;
const BRUIT={res:1,b:O.R.etGraines,E:O.R.kE,kRet:12};   /* on l'eteint pour les controles a reponse connue */
const JOUR=24*191*O.R.tempsMoyen;
const BUDGET_J=[1,3];
const MU=20,LAMBDA=6,NG=12;
const TAUX_IDENTIQUES=[0,1,0,0,7,0,8,0,0,1,3,5,6,3,1,1,2,6,0].map(x=>x/23);   /* mesures : les 19 mutants de la gen. 0 face au temoin */

const SCENARIOS={
  'tres-faible':{m:-0.05,s:0.15,pCasse:0,pClone:0.25},
  'faible':{m:-0.1,s:0.3,pCasse:0,pClone:0.25},
  'moyen':{m:-0.2,s:0.6,pCasse:0,pClone:0.25},
  'moyen-sans-clones':{m:-0.2,s:0.6,pCasse:0,pClone:0,sansIdentiques:true},
  'casse':{m:-0.2,s:0.6,pCasse:0.2,pClone:0.25}};
const SCHEMAS={
  'A':{anciens:'tous'},
  'A+T':{anciens:'tous',tri:true},
  'A+K':{anciens:'tous',clone:true},
  'B2':{anciens:2},
  'B4':{anciens:4},
  'B4+K':{anciens:4,clone:true},
  'B4+T+K':{anciens:4,tri:true,clone:true},
  'B8':{anciens:8},
  'C':{anciens:'pres'},
  'D0':{anciens:'jamais',fixe:0},
  'D1':{anciens:'jamais',fixe:1}};
const TRI={k:3,c:2},KCLONE=4;

function courir(nomSc,nomSch,graine){
  const sc=SCENARIOS[nomSc],sch=SCHEMAS[nomSch];
  const u=O.mulberry32(graine),nor=O.normale(u);
  const ent=n=>Math.floor(u()*n);
  const theta=[],brut=[],ne=[],vivant=[],sumE=[],parties=[],parent=[],rId=[],estClone=[];
  let P=0;
  const naitre=(t,tb,G,q,r,cl)=>{theta.push(t);brut.push(tb);ne.push(G);vivant.push(1);sumE.push(0);parties.push(0);parent.push(q);rId.push(r);estClone.push(cl?1:0);return P++;};
  const delta=()=>u()<sc.pCasse?-4-Math.abs(nor()):sc.m+sc.s*nor();
  /* un mutant de q : r courses sur q identiques ; theta = la valeur moyenne vraie de ses courses */
  const mutant=(q,G,d,r,cl)=>{const tb=theta[q]+d;return naitre(r*theta[q]+(1-r)*tb,tb,G,q,r,cl);};
  let cap=4096,ip=new Int32Array(cap),jg=new Int32Array(cap),y=new Float64Array(cap),N=0;
  const deja=new Map();   /* (pilote, graine) -> {y, e} : pour les courses identiques */
  const bG=[];let Gr=0;
  const graineNeuve=()=>{bG.push(BRUIT.b*nor());return Gr++;};
  let temps=0,courses=0;
  const jouer=(p,g)=>{
    if(N===cap){cap*=2;const a=new Int32Array(cap),b=new Int32Array(cap),c=new Float64Array(cap);a.set(ip);b.set(jg);c.set(y);ip=a;jg=b;y=c;}
    const q=parent[p],avant=q>=0?deja.get(q*1e6+g):null;
    let pal,e=null;
    if(avant&&rId[p]>0&&(rId[p]>=1||u()<rId[p])){pal=avant.y;e=avant.e;}
    else{pal=7+brut[p]+bG[g]+BRUIT.res*res[ent(res.length)];if(u()<PARTIES)e=BRUIT.E*nor();}
    deja.set(p*1e6+g,{y:pal,e});
    if(e!=null){sumE[p]+=e;parties[p]++;}
    ip[N]=p;jg[N]=g;y[N]=pal;N++;
    temps+=O.tempsDe(pal);courses++;};
  const noter=()=>{
    const f=O.ajusterRapide(ip,jg,y,N,P,Gr,vivant,10,BRUIT.kRet);
    const F=new Float64Array(P);for(let p=0;p<P;p++)F[p]=f.ahat[p]-4*(parties[p]?sumE[p]/parties[p]:0);
    return {f,F};};
  const temoin=naitre(0,0,0,-1,0,0);
  const tirerR=()=>sc.sansIdentiques?0:TAUX_IDENTIQUES[ent(TAUX_IDENTIQUES.length)];
  for(let i=1;i<MU;i++)mutant(temoin,0,delta(),tirerR(),0);
  let jeu=[];for(let i=0;i<NG;i++)jeu.push(graineNeuve());
  for(const g of jeu)for(let p=0;p<P;p++)jouer(p,g);
  let note=noter();
  const courses0=courses,temps0=temps;
  const viv=()=>{const V=[];for(let p=0;p<P;p++)if(vivant[p])V.push(p);return V;};
  let S;{const F=viv().filter(p=>p!==temoin).map(p=>note.F[p]).sort((a,b)=>a-b);S=F[LAMBDA];}
  let thetaSeuil=0;
  const traj=[];const tri={tries:0,renvoyes:0,parDelta:{},fauxBons:0,clones:0,clonesVus:0,fauxClones:0,nonClones:0};
  let mesures10=null;
  const fini=Math.max(...BUDGET_J)*JOUR;
  for(let G=1;temps<fini&&G<500;G++){
    /* LES NAISSANCES */
    let elig=viv().filter(p=>ne[p]<=G-2);if(elig.length<3)elig=viv();
    const tournoi=()=>{const a=elig.slice();let best=-1;for(let i=0;i<3&&a.length;i++){const p=a.splice(ent(a.length),1)[0];if(best<0||note.F[p]>note.F[best])best=p;}return best;};
    const enfants=[];
    for(let k=0;k<LAMBDA;k++){
      if(k===0){enfants.push(mutant(temoin,G,u()<sc.pCasse?-4-Math.abs(nor()):sc.m*2+sc.s*1.6*nor(),0,0));continue;}
      const p1=tournoi();
      if(u()<0.3){const p2=tournoi();const tb=(theta[p1]+theta[p2])/2+delta();enfants.push(naitre(tb,tb,G,p1,0,0));}
      else if(u()<sc.pClone){enfants.push(mutant(p1,G,0,1,1));tri.clonesVus++;}
      else enfants.push(mutant(p1,G,delta(),tirerR(),0));}
    /* LES GRAINES */
    let graines;
    if(sch.anciens==='jamais'){if(sch.fixe>0)for(let i=0;i<sch.fixe;i++){jeu.shift();jeu.push(graineNeuve());}graines=jeu.slice();}
    else{graines=[];for(let i=0;i<NG;i++)graines.push(graineNeuve());}
    /* QUI REJOUE */
    const anciens=viv().filter(p=>ne[p]<G);
    const nb=new Map();
    const haut=new Set(anciens.slice().sort((a,b)=>note.F[b]-note.F[a]).slice(0,3));
    for(const p of anciens){
      if(sch.anciens==='tous')nb.set(p,NG);
      else if(typeof sch.anciens==='number')nb.set(p,sch.anciens);
      else if(sch.anciens==='jamais')nb.set(p,0);
      else{const se=note.f.sigma/Math.sqrt(Math.max(1,note.f.n[p]));nb.set(p,(haut.has(p)||note.F[p]-S<2*se)?NG:0);}}
    for(const p of enfants)nb.set(p,NG);
    /* LES COURSES, graine par graine (les anciens d'abord : le parent a deja couru quand l'enfant court) */
    const morts=new Set(),renvoyesTot=[];
    for(let i=0;i<graines.length;i++){
      for(const [p,m] of nb)if(i<m&&!morts.has(p))jouer(p,graines[i]);
      if(sch.clone&&i===KCLONE-1){
        for(const p of enfants){if(morts.has(p))continue;const q=parent[p];if(q<0||!vivant[q])continue;
          let idem=true;for(let j=0;j<KCLONE;j++){const a=deja.get(p*1e6+graines[j]),b=deja.get(q*1e6+graines[j]);if(!a||!b||a.y!==b.y){idem=false;break;}}
          if(idem){morts.add(p);vivant[p]=0;tri.clones++;if(!estClone[p])tri.fauxClones++;}
          else if(!estClone[p])tri.nonClones++;}}
      if(sch.tri&&i===TRI.k-1){
        const f=O.ajusterRapide(ip,jg,y,N,P,Gr,vivant,10,BRUIT.kRet);
        for(const p of enfants){if(morts.has(p))continue;
          tri.tries++;const D=Math.round(theta[p]-thetaSeuil);
          tri.parDelta[D]=tri.parDelta[D]||[0,0];tri.parDelta[D][0]++;
          if(f.a[p]+TRI.c*f.sigma/Math.sqrt(TRI.k)<S){morts.add(p);vivant[p]=0;tri.renvoyes++;tri.parDelta[D][1]++;renvoyesTot.push(p);}}}
    }
    /* LA NOTE ET LE RENVOI */
    note=noter();
    const V=viv();
    const el=V.filter(p=>p!==temoin&&ne[p]<G).sort((a,b)=>note.F[a]-note.F[b]);
    const nVirer=Math.max(0,Math.min(el.length,V.length-MU));
    for(const p of el.slice(0,nVirer))vivant[p]=0;
    const rest=el.slice(nVirer);if(rest.length){S=note.F[rest[0]];thetaSeuil=theta[rest[0]];}
    if(renvoyesTot.length){const tv=viv().map(p=>theta[p]).sort((a,b)=>a-b),med=tv[Math.floor(tv.length/2)];for(const p of renvoyesTot)if(theta[p]>=med)tri.fauxBons++;}
    /* LES MESURES (les anciens : nes avant G) */
    const W=viv(),Wa=W.filter(p=>ne[p]<G),tA=Wa.map(p=>theta[p]);
    const meneur=W.reduce((b,p)=>note.F[p]>note.F[b]?p:b,W[0]);
    traj.push({G,temps,courses,moy:O.moy(tA),meneur:theta[meneur],max:Math.max(...W.map(p=>theta[p]))});
    if(G===10){
      const Fv=Wa.map(p=>note.F[p]),d=Wa.map((p,i)=>Fv[i]-tA[i]),md=O.moy(d);
      const menA=Wa.reduce((b,p)=>note.F[p]>note.F[b]?p:b,Wa[0]);
      mesures10={spear:O.spear(Fv,tA),rmse:Math.sqrt(O.moy(d.map(x=>(x-md)**2))),cursed:(note.F[menA]-theta[menA])-md,
        nMoy:O.moy(Wa.map(p=>note.f.n[p])),clonesVivants:W.filter(p=>estClone[p]).length};}
  }
  const aBudget=B=>traj.find(t=>t.temps>=B)||traj[traj.length-1];
  return {traj,mesures10,tri,aBudget:BUDGET_J.map(j=>aBudget(j*JOUR)),tempsGen:(traj[traj.length-1].temps-temps0)/traj.length,
    coursesGen:(traj[traj.length-1].courses-courses0)/traj.length};
}

/* node population.js N par-generation : le controle du mecanisme (a NOMBRE DE GENERATIONS egal, et non a budget egal, B4 doit faire au plus aussi
   bien que A : s'il faisait mieux par generation, ce serait un biais de la note, pas l'effet du nombre de generations) */
if(process.argv[3]==='par-generation'){
  for(const nomSc of ['faible','moyen'])for(const nomSch of ['A','B8','B4','B2','D0']){const R=[];for(let r=0;r<REP;r++)R.push(courir(nomSc,nomSch,1000+r));
    const a=G=>O.moy(R.map(x=>{const t=x.traj.find(t=>t.G===G);return t?t.meneur:NaN;})),b=G=>O.moy(R.map(x=>{const t=x.traj.find(t=>t.G===G);return t?t.moy:NaN;}));
    console.log(nomSc.padEnd(7)+' '+nomSch.padEnd(3)+' : vrai theta du meneur a la generation 10 : '+a(10).toFixed(2)+', 30 : '+a(30).toFixed(2)+' ; des anciens a la gen. 30 : '+b(30).toFixed(2));}
  process.exit(0);}
const t0=Date.now();
console.log('TRI PRECOCE ET REJEU DES ANCIENS : '+REP+' repetitions par case ; budget de 1 et 3 jours du Xeon ('+(JOUR/1000).toFixed(0)+' 000 s de courses par jour ; le Ryzen : x2 a x4, non mesure)');
console.log('(les effets des mutations et la part des clones sont SUPPOSES ; le bruit, le temps des courses, l\'E, les courses identiques sont MESURES)');
/* LES CONTROLES A REPONSE CONNUE */
{const sv={...BRUIT};const essai=(sch,txt,sc)=>{const r=courir(sc||'moyen-sans-clones',sch,7);let ok=0;for(const t of r.traj)if(Math.abs(t.meneur-t.max)<1e-9)ok++;
   console.log('CONTROLE '+txt+', schema '+sch+' : le meneur est le meilleur vrai a '+ok+'/'+r.traj.length+' generations');return [ok,r.traj.length];};
 BRUIT.res=0;BRUIT.b=0;BRUIT.E=0;BRUIT.kRet=0;
 for(const sch of ['A','B4','C','D0','D1'])essai(sch,'sans bruit ni retrecissement (attendu : toutes)');
 BRUIT.b=sv.b;
 for(const sch of ['A','B4','D1'])essai(sch,'avec les seuls effets de graine, sans retrecissement (le modele les retire : attendu toutes, a la convergence pres)');
 BRUIT.b=0;BRUIT.kRet=12;
 essai('A','sans bruit MAIS avec le retrecissement de note.js (un enfant a 12 courses est tire a mi-chemin de la moyenne : pas toutes, c est voulu)');
 Object.assign(BRUIT,sv);
 /* le tri des clones sur une population de clones et de non-clones connus */
 const r=courir('moyen','A+K',11);
 console.log('CONTROLE du tri des clones (scenario moyen, A+K) : '+r.tri.clonesVus+' clones nes, '+r.tri.clones+' renvoyes comme clones dont '+r.tri.fauxClones+' qui n\'en etaient pas, sur '+(r.tri.nonClones+r.tri.fauxClones)+' non-clones testes');}
for(const nomSc of Object.keys(SCENARIOS)){
  const sc=SCENARIOS[nomSc];
  console.log('\n===== MUTATIONS « '+nomSc+' » : delta ~ N('+sc.m+' ; '+sc.s+')'+(sc.pCasse?', '+(100*sc.pCasse)+' % d\'enfants casses (delta -4 a -6)':'')+', clones '+(100*sc.pClone)+' % des mutations simples'+(sc.sansIdentiques?', aucune course identique':'')+' =====');
  console.log('schema  | courses/gen | h de calcul/gen | gen/jour Xeon | VRAI theta apres 1 jour : anciens / meneur / meilleur | apres 3 jours : anciens / meneur / meilleur | gen. 10 : Spearman / erreur de F / malediction / n moyen / clones vivants');
  for(const nomSch of Object.keys(SCHEMAS)){
    const R=[];for(let r=0;r<REP;r++)R.push(courir(nomSc,nomSch,1000+r));
    const m=f=>O.moy(R.map(f)),e=f=>O.sd(R.map(f))/Math.sqrt(R.length);
    const tg=m(x=>x.tempsGen),cg=m(x=>x.coursesGen);
    const b=(j,k)=>m(x=>x.aBudget[j][k]).toFixed(2)+'±'+e(x=>x.aBudget[j][k]).toFixed(2);
    const m10=k=>m(x=>x.mesures10?x.mesures10[k]:NaN);
    console.log(nomSch.padEnd(7)+' | '+cg.toFixed(0).padStart(5)+'       | '+(tg/3600).toFixed(2).padStart(5)+'           | '+(JOUR/tg).toFixed(1).padStart(5)+'         | '
      +b(0,'moy')+' / '+b(0,'meneur')+' / '+b(0,'max')+' | '+b(1,'moy')+' / '+b(1,'meneur')+' / '+b(1,'max')+' | '
      +m10('spear').toFixed(2)+' / '+m10('rmse').toFixed(2)+' / '+m10('cursed').toFixed(2)+' / '+m10('nMoy').toFixed(0)+' / '+m10('clonesVivants').toFixed(1));
    const sch=SCHEMAS[nomSch];
    if(sch.tri||sch.clone){
      const T={tries:0,renvoyes:0,fauxBons:0,parDelta:{},clones:0,clonesVus:0,fauxClones:0,nonClones:0};
      for(const x of R){for(const k of ['tries','renvoyes','fauxBons','clones','clonesVus','fauxClones','nonClones'])T[k]+=x.tri[k];
        for(const d in x.tri.parDelta){T.parDelta[d]=T.parDelta[d]||[0,0];T.parDelta[d][0]+=x.tri.parDelta[d][0];T.parDelta[d][1]+=x.tri.parDelta[d][1];}}
      if(sch.tri){const ds=Object.keys(T.parDelta).map(Number).sort((a,b)=>a-b).filter(d=>T.parDelta[d][0]>=30);
        console.log('          tri : '+T.renvoyes+' enfants renvoyes tot sur '+T.tries+' ('+(100*T.renvoyes/Math.max(1,T.tries)).toFixed(1)+' %), dont '+T.fauxBons+' au-dessus de la mediane vraie des vivants ('+(T.renvoyes?(100*T.fauxBons/T.renvoyes).toFixed(1):'0')+' %) ;'
          +' renvoi selon theta - theta du moins bon vivant : '+ds.map(d=>(d>0?'+':'')+d+' : '+(100*T.parDelta[d][1]/T.parDelta[d][0]).toFixed(1)+' %').join(' · '));}
      if(sch.clone)console.log('          clones : '+T.clonesVus+' nes, '+T.clones+' renvoyes apres '+KCLONE+' graines, dont '+T.fauxClones+' faux clones (sur '+(T.nonClones+T.fauxClones)+' non-clones testes : '+(100*T.fauxClones/Math.max(1,T.nonClones+T.fauxClones)).toFixed(2)+' %)');
    }
  }
}
console.log('\n(calcul : '+((Date.now()-t0)/1000).toFixed(0)+' s)');
