/* Rejoue le VRAI code de code/moteur/gouverneur-thermique.js sur la chronologie des 5 courses du 25/10 (iPhone 13 Pro, v897). Node seul, < 1 s. */
const fs=require('fs');const src=fs.readFileSync(__dirname+'/../code/moteur/gouverneur-thermique.js','utf8');
function monte(){
  const st={started:false,running:false,gameOver:false,garageOn:false,paused:false};
  const store={};const CAD={on:false};const QL={k:3};const calls=[];
  const win={addEventListener(n,f){win['_'+n]=f;}};
  const doc={hidden:false,addEventListener(){}};
  const f=new Function('CAD30_REC','location','localStorage','window','document','CAD','QL','qlPose','get','calls',
    src+';return {tick:mobGouvTick,S:MOB_S,G:MOB_G,chaud:mobChaud,thermo:mobThermo,charge:mobGouvCharge,sauve:mobGouvSauve};'.replace(/get/,'get'));
  const ls={getItem:k=>store[k]??null,setItem:(k,v)=>{store[k]=v;}};
  const g=(function(){return new Function('CAD30_REC','location','localStorage','window','document','CAD','QL','qlPose','st',
    'var started,running,gameOver,garageOn,paused;'+'Object.defineProperty;'+'' ) })();
  /* variables d'état lues par le module : on les expose par getters via with() */
  const o=new Function('CAD30_REC','location','localStorage','window','document','CAD','QL','qlPose','st',
    'with(st){'+src+';return {tick:mobGouvTick,S:MOB_S,G:MOB_G,chaud:mobChaud,thermo:mobThermo,charge:mobGouvCharge,dbg:window.dbgGouv};}')
    (true,{search:''},ls,win,doc,CAD,QL,k=>{calls.push(k);QL.k=k;},st);
  return {o,st,CAD,QL,calls,win,doc,store};
}
const m=monte();const dt=0.1;let T=0,now=0;
function phase(nom,sec,etat){Object.assign(m.st,etat);const n=Math.round(sec/dt);for(let i=0;i<n;i++){now+=dt*1000;T+=dt;
  m.o.tick(now);
  if(etat.running&&m.o.chaud()&&!m.CAD.on){m.CAD.on=true;if(!m.hit){m.hit={T:+T.toFixed(1),nom,D:+m.o.S.D.toFixed(1)};console.log('>>> PASSE À 30 à t='+T.toFixed(1)+' s ('+nom+'), D='+m.o.S.D.toFixed(1));}}
  if(!etat.running)m.CAD.on=false;}}
const MENU={started:false,running:false,gameOver:false,garageOn:false,paused:false},COURSE={started:true,running:true,gameOver:false,garageOn:false,paused:false},REPOS={started:true,running:false,gameOver:true,garageOn:false,paused:false};
const R=+process.argv[2]||90;
console.log('repos entre courses = '+R+' s');
for(let c=1;c<=5;c++){phase('menu '+c,22,MENU);const D0=m.o.S.D;phase('course '+c,75,COURSE);
  console.log('course '+c+': D '+D0.toFixed(1)+' -> '+m.o.S.D.toFixed(1)+(m.CAD.on?'  [30 i/s]':'  [60 i/s]'));
  phase('repos '+c,R,REPOS);}
/* refroidissement : repos complet jusqu'à repasser sous le seuil bas */
let t0=T;while(m.o.chaud()&&T-t0<3000)phase('repos long',1,REPOS);
console.log('repasse à 60 après '+(T-t0).toFixed(0)+' s de repos supplémentaires (D='+m.o.S.D.toFixed(1)+')');
/* trou d\'un coup (arrière-plan 5 min) */
m.o.S.D=200;m.o.S.actif=true;m.o.S.t=now;now+=300000;m.o.tick(now);console.log('trou de 300 s depuis D=200 -> D='+m.o.S.D.toFixed(1)+' actif='+m.o.chaud());
/* événement iOS */
m.o.S.D=0;m.o.S.actif=false;m.o.S.thermo=0;m.win['_cc:thermique']({detail:{etat:2}});console.log('thermo 2 -> chaud='+m.o.chaud()+' D='+m.o.S.D+' qlPose='+JSON.stringify(m.calls));
m.win['_cc:thermique']({detail:{etat:3}});m.win['_cc:thermique']({detail:{etat:3}});console.log('thermo 3 (x2) -> qlPose='+JSON.stringify(m.calls)+' (un seul cran)');
m.win['_cc:thermique']({detail:{etat:0}});console.log('thermo 0 -> chaud='+m.o.chaud()+' (le modèle garde D='+m.o.S.D+')');
console.log('dbgGouv()',JSON.stringify(m.o.dbg()));console.log('dbgGouv(10)',JSON.stringify(m.o.dbg(10)));
/* persistance */
const m2=monte();Object.assign(m2.store,{cashcarMobGouv:JSON.stringify({D:180,a:1,t:Date.now()-60000})});m2.o.charge();console.log('rechargé 60 s plus tard: D='+m2.o.S.D.toFixed(1)+' actif='+m2.o.S.actif);
const m3=monte();m3.store.cashcarMobGouv=JSON.stringify({D:180,a:1,t:Date.now()-700000});m3.o.charge();console.log('rechargé 700 s plus tard: D='+m3.o.S.D+' actif='+m3.o.S.actif);
