// L'ARGENT DU DEBUT — le modele qui PROUVE a quelle partie la peinture la moins chere devient achetable (2026-10-14, GAMEPLAY).
// Lancer : node outils/eco-debut-modele.cjs [chemin/index.html] [--k=1.5] [--n=4000] [--seed=7]   (defaut : VERSION PRINCIPALE/index.html)
// Aucun navigateur : le jeu n'est PAS execute. Les CONSTANTES sont lues dans index.html (DENOMS, ECO3, ENGINE_TIERS, COSM, CARNETS,
// ecoRond/ecoCash, ECOD) — elles ne peuvent pas deriver d'une copie. Les COMPORTEMENTS (duree, pieces prises...) sont des HYPOTHESES, marquees [H].
const fs=require('fs'),path=require('path');
const arg=k=>{const a=process.argv.find(x=>x.startsWith('--'+k+'='));return a?a.split('=')[1]:null;};
const FILE=process.argv.slice(2).find(x=>!x.startsWith('--'))||path.join(__dirname,'..','VERSION PRINCIPALE','index.html');
const SRC=fs.readFileSync(FILE,'utf8');

// ---------- 1. LES CONSTANTES DU JEU, lues dans le code ----------
function bloc(deb,fin){const i=SRC.indexOf(deb);if(i<0)throw new Error('introuvable : '+deb);const j=SRC.indexOf(fin,i);if(j<0)throw new Error('fin introuvable : '+fin);return SRC.slice(i,j+fin.length);}
function ligne(deb){const i=SRC.indexOf(deb);if(i<0)throw new Error('introuvable : '+deb);return SRC.slice(i,SRC.indexOf('\n',i));}
const G=new Function(
  bloc('const DENOMS=[','];')+'\n'+
  bloc('const ECO3={','\n};')+'\n'+
  bloc('const ENGINE_TIERS=[','\n];')+'\n'+
  bloc('const COSM={','\n};')+'\n'+
  bloc('const CARNETS=[','\n];')+'\n'+
  ligne('function ecoRond(')+'\n'+ligne('function ecoCash(')+'\n'+
  'return {DENOMS,ECO3,ENGINE_TIERS,COSM,CARNETS,ecoRond,ecoCash};')();
const {DENOMS,ECO3,ENGINE_TIERS,COSM,CARNETS,ecoRond,ecoCash}=G;
const PERMIS=+/if\(paye\)\{SAVE\.d\.permis=1;SAVE\.d\.bank=Math\.min\(1e30,bank\(\)\+(\d+)\)/.exec(SRC)[1]; // tutoFin : prime du permis (une fois)
const START_CASH=+/const START_CASH=([\d.]+);/.exec(SRC)[1];
const SPD=+/const SPD=([\d.]+);/.exec(SRC)[1];
const MAXK=+/\{name:'LA HONTE',[^\n]*maxKmh:(\d+)/.exec(SRC)[1]; // CARS[0] : TOUTES les caisses pilotent comme elle (spec = CARS[0])
const engLate=t=>1+Math.min(.5,Math.max(0,t-8)*.035); // engLate(), meme formule
const vCroisiere=t=>2.75*MAXK/3.6*engLate(t)*ENGINE_TIERS[t].push*SPD; // m/s — lvPiste() : « croisiere (momentum compris ~ 2,75 x maxSp) »
const denom=(t,K)=>DENOMS[Math.min(t,DENOMS.length-1)]*ECO3.gain*K;      // denom() x le relevement ECOD.k
const tierDe=n=>{let t=0;for(let i=0;i<ENGINE_TIERS.length;i++)if(n>=ENGINE_TIERS[i].coins)t=i;return t;}; // engineFor()
// le relevement tel que le jeu l'ecrit (ECOD) — lu si present, sinon ancien jeu
const ecoK=/const ECOD=\{coup:([\d.]+)/.exec(SRC);
const ECOD_K=arg('k')!=null?+arg('k'):(ecoK?+ecoK[1]:1);
const ECOD_PRIX=(function(){const l=COSM.peinture.filter(d=>d.p>0).sort((a,b)=>a.p-b.p)[0];return l.p;})(); // peinture la moins chere (champ `p`, jamais modifie)
const PEINTURE_MIN=COSM.peinture.filter(d=>d.p>0).sort((a,b)=>a.p-b.p)[0];
const OBJET_MIN=Math.min(...['peinture','aile','trainee'].flatMap(c=>COSM[c].filter(d=>d.p>0).map(d=>d.p)),2000); // + figures.js SHIMMY 2 000 (note eco.md)

// ---------- 2. LA ROUTE : pieces et fruits, lus dans la boucle de spawnPickups (zone 0) ----------
// copie ligne a ligne de la boucle `while(ss<L-90)` ; `rich` = .88 en zone 0 (runStats.zones=0) ; STR=1 (moteur 0).
function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function route(seed,L){const rnd=mulberry(seed),rich=.88,STR=1,esp=v=>v/rich,out=[]; // out : {s, fruit}
  const place=(sp,isN)=>{if(sp<120||sp>L-50)return;out.push({s:sp,f:isN});};
  let ss=200;
  while(ss<L-90){
    if(rnd()<.24/rich){ss+=esp(120+rnd()*160);continue;}
    const pat=rnd();
    if(pat<.30){const n=5+((rnd()*4)|0);rnd();rnd();const st=(10+rnd()*4)*STR;for(let i=0;i<n;i++)place(ss+i*st,rnd()<.34);ss+=esp(n*st/STR+70+rnd()*50);}
    else if(pat<.52){const n=5+((rnd()*4)|0);rnd();rnd();const st=(11+rnd()*4)*STR;for(let i=0;i<n;i++)place(ss+i*st,rnd()<.34);ss+=esp(n*st/STR+70+rnd()*50);}
    else if(pat<.70){const R=Math.min(10,5.5+rnd()*4),n=8+((rnd()*4)|0);for(let i=0;i<n;i++)place(ss+R*STR+R*STR*Math.sin(i/n*6.2832),false);ss+=esp(2*R+80+rnd()*50);}
    else if(pat<.80){const n=12+((rnd()*6)|0),st=6*STR;for(let i=0;i<n;i++)place(ss+i*st,false);ss+=esp(n*st/STR+140+rnd()*80);}
    else{const n=2+((rnd()*3)|0),st=(20+rnd()*18)*STR;for(let i=0;i<n;i++){rnd();place(ss+i*st,rnd()<.45);}ss+=esp(n*st/STR+60+rnd()*50);}
  }
  return out;}
const LZ=14400; // LEN de genCtrl au niveau 0 (14400*(1+...)) : plus long que tout ce qu'une partie du debut parcourt
const ROUTES=[];for(let i=0;i<40;i++)ROUTES.push(route(1000+i*7919,LZ));

// ---------- 3. UNE PARTIE : un joueur pilote la route, prend des pieces, l'argent suit le code ----------
// P = {T:duree(s), k:part de la croisiere tenue, p:part des pieces/fruits pris, Fmax,F0,F1:rampe du FLOW (flowMult en secondes de partie)}
function flowK(P,t){const lv=P.Fmax<=1?0:(t<P.F0?0:Math.min(1,(t-P.F0)/(P.F1-P.F0)));return 1+(P.Fmax-1)*lv;} // moyenne du flowMult() = [1,1.3,1.5,1.8,3] ; la rampe en lisse la montee
function partie(P,K,rnd,r){const R=ROUTES[(rnd()*ROUTES.length)|0],dt=.1;let t=0,s=0,coins=0,fruits=0,money=0,combo=0,comboT=0,tier=0,i=0,vmax=0;
  while(t<P.T){const v=vCroisiere(tier)*P.k*(t<3?.6:1);s+=v*dt;t+=dt;vmax=Math.max(vmax,v);
    if(comboT>0){comboT-=dt;if(comboT<=0)combo=0;}
    while(i<R.length&&R[i].s<s){const c=R[i++];if(rnd()>P.p)continue;
      if(c.f){fruits++;continue;}
      coins++;combo++;comboT=3; // `combo++;comboT=3` — fenetre de 3 s (loop : comboT)
      const mult=Math.min(ECO3.recolte,1+.5*Math.floor(combo/5)); // g=denom()*2.2*mult*flowMult()
      money+=denom(tier,K)*2.2*mult*flowK(P,t);tier=tierDe(coins);}}
  return {money,coins,fruits,t,s,tier,kmh:vmax*3.6};}

// ---------- 4. UNE CARRIERE : les parties s'enchainent, la banque monte, on achète quand on peut ----------
const C1=[0,1,2].map(i=>({k:CARNETS[0].m[i].k,v:CARNETS[0].m[i].k==='cash'?ecoCash(CARNETS[0].m[i].v):CARNETS[0].m[i].v,p:ecoRond(CARNETS[0].m[i].p*ECO3.prime)}));
const C2=[0,1,2].map(i=>({k:CARNETS[1].m[i].k,v:CARNETS[1].m[i].v,p:ecoRond(CARNETS[1].m[i].p*ECO3.prime)}));
function carriere(P,opt,rnd){ // opt : {K:relevement (0/1 = ancien), prix:objet vise, c2:probas des defis du carnet 2, lecon:true}
  let bank=0,runs=0,achat=0,okC1=[0,0,0],okC2=[0,0,0],tab=[],boostActif=true;const prixMin=PEINTURE_MIN.p;
  for(let n=1;n<=30;n++){
    // ECOD : le relevement n'existe que si aucun achat, banque < peinture la moins chere (filet), jeu non « ancien »
    const K=(opt.K>1&&!achat&&bank<prixMin)?(opt.fond?1+(opt.K-1)*(1-bank/prixMin):opt.K):1; // opt.fond : le relevement FOND avec la banque (1 + (K-1)(1 - banque/prix))
    const Pn=Object.assign({},P,{T:P.T0+rnd()*(P.T1-P.T0),p:Math.min(1,P.p*(.8+.4*rnd()))});
    const r=partie(Pn,K,rnd);const gagne=Math.max(0,r.money); // commitExploits : vire = money - START_CASH (la mise est retranchee)
    if(n===1&&opt.lecon!==false)bank+=PERMIS; // tutoFin(false) : prime du permis, une fois
    bank+=gagne;runs=n;
    // CARNET 1 : chaque defi se coche DANS une partie (misVal) ; prime versee en banque a l'instant
    const val={coins:r.coins,fruits:r.fruits,cash:gagne,tricks:0,nitro:0,kmh:r.kmh};
    for(let j=0;j<3;j++)if(!okC1[j]&&val[C1[j].k]>=C1[j].v){okC1[j]=1;bank+=C1[j].p;}
    if(okC1.every(x=>x)&&opt.c2){ // CARNET 2 (optionnel) : figures, nitro, km/h — probas par partie
      const pr={tricks:opt.c2.tricks,nitro:opt.c2.nitro,kmh:opt.c2.kmh};
      for(let j=0;j<3;j++)if(!okC2[j]&&rnd()<pr[C2[j].k]){okC2[j]=1;bank+=C2[j].p;}}
    tab.push(Math.round(bank));
    if(!achat&&bank>=opt.prix)achat=n;
    if(achat&&tab.length>=Math.max(achat,6))break;}
  return {achat,tab};}

// ---------- 5. LES PROFILS [H] — chaque ligne est une HYPOTHESE, a contester ----------
// T0..T1 : duree tenue de la partie (s), tiree au hasard a chaque partie · k : part de la croisiere tenue (1 = momentum sature, gaz auto, ligne tenue)
// p : part des pieces et des fruits RENCONTRES qui sont pris (±20 % d'une partie a l'autre) · Fmax/F0/F1 : le flowMult() moyen monte de 1 a Fmax entre F0 et F1 s
const PROFILS={
  faible:{T0:25,T1:45,k:.85,p:.40,Fmax:1,F0:0,F1:1},                  // meurt avant 45 s, 40 % des pieces, jamais de flow
  moyen: {T0:45,T1:90,k:1.0,p:.50,Fmax:1.3,F0:25,F1:60},              // CAHIER : 45-90 s tenues, LA MOITIE des pieces, flow I (x1,3) entre 25 et 60 s
  fort:  {T0:120,T1:240,k:1.15,p:.75,Fmax:1.9,F0:30,F1:90}};          // 2-4 min, 75 % des pieces, la frenesie une partie du temps (x1,9 de moyenne)
const OPT_C2={tricks:.35,nitro:.5,kmh:.03};                           // [H] chances par partie de faire 2 figures / 10 s de nitro / 672 km/h (carnet 2, ouvert quand le carnet 1 est fini)
const OPT_C2_MOITIE={tricks:.2,nitro:.3,kmh:.015};
function quantiles(a){a=a.slice().sort((x,y)=>x-y);const q=f=>a[Math.min(a.length-1,Math.floor(f*a.length))];return {p10:q(.1),p25:q(.25),med:q(.5),p75:q(.75),p90:q(.9)};}
function etude(nom,P,opt,N,seed){const rnd=mulberry(seed);const ach=[],banques=[[],[],[],[],[],[]],dist={};
  for(let i=0;i<N;i++){const c=carriere(P,opt,rnd);ach.push(c.achat||99);dist[c.achat||'30+']=(dist[c.achat||'30+']||0)+1;for(let j=0;j<6;j++)banques[j].push(c.tab[j]!==undefined?c.tab[j]:c.tab[c.tab.length-1]);}
  const cumul=(function(){const o={};let c=0;for(let n=1;n<=30;n++){c+=dist[n]||0;o[n]=Math.round(100*c/N);}return o;})();
  return {nom,ach:quantiles(ach),dist,banques:banques.map(b=>quantiles(b).med),cumul};}
module.exports={PROFILS,carriere,etude,partie,ECOD_PRIX,PEINTURE_MIN,OPT_C2,OPT_C2_MOITIE,mulberry,C1,C2,PERMIS,ECOD_K,quantiles,ECO3,SRC}; // (2026-10-14, GAMEPLAY, LE RETOUR DU JOUR) + C1 C2 PERMIS ECOD_K quantiles ECO3 SRC : outils/jour-modele.cjs rejoue les memes parties jour apres jour

if(require.main===module){
  const N=+(arg('n')||4000),seed=+(arg('seed')||7),prix=PEINTURE_MIN.p,K=ECOD_K;
  const f$=x=>Math.round(x).toLocaleString('fr-FR').replace(/[  ]/g,' ');
  console.log('=== 1. CONSTANTES LUES DANS '+path.basename(FILE)+' ===');
  console.log('permis +'+PERMIS+' $ (une fois) · mise de depart '+START_CASH+' $ (retranchee au versement) · ECO3.gain '+ECO3.gain+' · ECO3.prime '+ECO3.prime+' · flowMult '+JSON.stringify(ECO3.flow)+' · recolte max x'+ECO3.recolte);
  console.log('peinture la moins chere : '+PEINTURE_MIN.n+' '+f$(prix)+' $ · objet le moins cher de la boutique : '+f$(OBJET_MIN)+' $ (traine MENTHE / figure SHIMMY)');
  console.log('carnet 1 :',C1.map(m=>m.k+' '+m.v+' -> +'+m.p).join(' | '),' = '+C1.reduce((a,m)=>a+m.p,0)+' $');
  console.log('carnet 2 :',C2.map(m=>m.k+' '+m.v+' -> +'+m.p).join(' | '),' = '+C2.reduce((a,m)=>a+m.p,0)+' $');
  console.log('croisiere (m/s) : palier 0 '+vCroisiere(0).toFixed(1)+' · 5 '+vCroisiere(5).toFixed(1)+' · 10 '+vCroisiere(10).toFixed(1)+' · SPD '+SPD+' · caisse de reference maxKmh '+MAXK);
  let nP=0,nF=0;for(const R of ROUTES){nP+=R.filter(x=>!x.f).length;nF+=R.filter(x=>x.f).length;}
  console.log('route (zone 0, boucle de spawnPickups) : '+(nP/LZ/ROUTES.length*1000).toFixed(1)+' pieces/km · '+(nF/LZ/ROUTES.length*1000).toFixed(1)+' fruits/km');
  console.log('ECOD.coup lu dans le jeu : x'+K+(arg('k')!=null?'  (force en ligne de commande)':''));

  console.log('\n=== 2. UNE PARTIE : argent gagne en course (moyenne de 300 parties a la duree mediane du profil) ===');
  for(const nom of Object.keys(PROFILS)){const P=PROFILS[nom],T=(P.T0+P.T1)/2;
    const f=KK=>{const rnd=mulberry(3);let m=0,c=0,fr=0;for(let i=0;i<300;i++){const r=partie(Object.assign({},P,{T}),KK,rnd);m+=r.money;c+=r.coins;fr+=r.fruits;}return [m/300,c/300,fr/300];};
    const a=f(1),b=f(K);console.log(nom.padEnd(7),'T='+T+' s · pieces '+Math.round(a[1])+' · fruits '+a[2].toFixed(1)+' · AVANT '+f$(a[0])+' $ · APRES '+f$(b[0])+' $');}

  const LIGNES=[['CAHIER (carnet 1 seul)',null],['carnet 1 + 2 « moitie »',OPT_C2_MOITIE],['carnet 1 + 2 plausible',OPT_C2]];
  for(const [lib,c2] of LIGNES){
    console.log('\n=== 3. '+lib.toUpperCase()+' — banque mediane apres les parties 1 a 6 (cumul, sans rien depenser) et partie ou '+PEINTURE_MIN.n+' ('+f$(prix)+' $) devient achetable ('+N+' joueurs/profil) ===');
    for(const nom of Object.keys(PROFILS)){
      for(const [av,KK] of [['AVANT',1],['APRES',K]]){const e=etude(nom,PROFILS[nom],{K:KK,prix,c2},N,seed),e2=etude(nom,PROFILS[nom],{K:KK,prix:OBJET_MIN,c2},N,seed);
        const fm=x=>x.ach.med>=99?'jamais(>30)':'partie '+x.ach.med;
        console.log((nom+' '+av).padEnd(13),'banque '+e.banques.map(f$).join(' · ').padEnd(40),'| peinture : '+fm(e).padEnd(11)+' (<=3e '+e.cumul[3]+' % · <=4e '+e.cumul[4]+' % · <=5e '+e.cumul[5]+' %) | objet a 2 000 : '+fm(e2));}}
  }
  console.log('\n=== 4. SENSIBILITE DU JOUEUR MOYEN (carnet 1 seul sauf mention) — partie mediane de la peinture, AVANT -> APRES x'+K+', et part des joueurs servis avant la 4e / au plus tard a la 4e ===');
  const VAR=[
    ['cahier : p=.50 k=1.0',PROFILS.moyen,null,{}],
    ['plus maladroit : p=.40',Object.assign({},PROFILS.moyen,{p:.40}),null,{}],
    ['plus adroit : p=.65',Object.assign({},PROFILS.moyen,{p:.65}),null,{}],
    ['parties courtes : 35-70 s',Object.assign({},PROFILS.moyen,{T0:35,T1:70}),null,{}],
    ['parties longues : 60-120 s',Object.assign({},PROFILS.moyen,{T0:60,T1:120}),null,{}],
    ['le debutant du rapport 14/10 : p=.68 k=1.2',Object.assign({},PROFILS.moyen,{p:.68,k:1.2,Fmax:1.15,F0:0,F1:60}),null,{}],
    ['saute l\'auto-ecole (PASSER : pas de permis)',PROFILS.moyen,null,{lecon:false}],
    ['fait la moitie du carnet 2',PROFILS.moyen,OPT_C2_MOITIE,{}],
    ['fait le carnet 2 plausible',PROFILS.moyen,OPT_C2,{}]];
  for(const [lib,P,c2,extra] of VAR){
    const a=etude('m',P,Object.assign({K:1,prix,c2},extra),N,seed),b=etude('m',P,Object.assign({K,prix,c2},extra),N,seed);
    console.log(lib.padEnd(48),'AVANT '+('partie '+a.ach.med).padEnd(9)+'(<=3e '+String(a.cumul[3]).padStart(2)+' % · <=4e '+String(a.cumul[4]).padStart(2)+' %) -> APRES '+('partie '+b.ach.med).padEnd(9)+'(<=3e '+String(b.cumul[3]).padStart(2)+' % · <=4e '+String(b.cumul[4]).padStart(2)+' %)');}
  console.log('\n=== 5. LE COUP DE POUCE pour le joueur MOYEN du cahier (carnet 1 seul) : quel x met la mediane a la 4e ? ===');
  for(const KK of [1,1.25,1.5,1.75,2,2.5]){const e=etude('m',PROFILS.moyen,{K:KK,prix},N,seed);
    console.log('x'+KK,'partie mediane '+e.ach.med+' · <=2e '+e.cumul[2]+' % · <=3e '+e.cumul[3]+' % · <=4e '+e.cumul[4]+' % · <=5e '+e.cumul[5]+' % · <=6e '+e.cumul[6]+' %');}
}
