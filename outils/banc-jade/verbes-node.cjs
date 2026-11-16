/* LE BANC NODE DES VERBES DE JADE (2026-11-16) : jadeAGen (jade-alleluia.js + jade-avatar.js) dans un vm, sans navigateur.
   node outils/banc-jade/verbes-node.cjs [graines=1-20] [paliers=0,10,20] [scene=gue] [detail=1] [sans=1 (sans le drapeau : la route d'avant)]
   Une ligne par palier : exceptions, note moyenne / pire, envers, tenue 30° / 8°, roulis, raccourcis, conflits, scènes vues. */
const fs=require('fs'),vm=require('vm'),path=require('path');
const RAC=path.resolve(__dirname,'../..'),lire=function(f){return fs.readFileSync(path.join(RAC,f),'utf8');};
const arg=function(k){const a=process.argv.find(function(x){return x.startsWith(k+'=');});return a?a.slice(k.length+1):null;};
const G=(arg('graines')||'1-20').split('-').map(Number),PAL=(arg('paliers')||'0,10,20').split(',').map(Number),scene=arg('scene'),detail=arg('detail')==='1',sans=arg('sans')==='1';
const VW={0:78,5:105,10:158,15:236,20:341,27:439};
function creer(search){
  const ctx=vm.createContext({console,Math,Float32Array,Float64Array,Int16Array,Uint8Array,Int32Array,Map,Set,Object,Array,Number,String,Date,Infinity,performance,JSON,Symbol,parseInt,parseFloat,isNaN});
  ctx.window=ctx;ctx.self=ctx;ctx.location={search:search};
  vm.runInContext(lire('VERSION PRINCIPALE/vendor/three.min.js'),ctx);
  vm.runInContext(`var engTier=0,__vw=78,ROAD_HALF=26,SPD=.48,FALL_G=33,MODMARK=[],CAMPM=[],VX=1.75,ALLEGE=false,LVL={cur:{piste:'jade',carte:'jade'}};
    var JADE={},JADE_TPL=[[10,190,1],[14,250,0],[16,220,3],[18,300,2],[23,350,3],[26,330,1],[29,400,0],[36,440,2],[45,490,1],[56,540,3]],JADE_NTPL=JADE_TPL.length,JADE_BANK={on:true,max:16*Math.PI/180,W:150};
    var DUREE={d0:45,d1:20,t1:25},DUREE_ELAN=[1.8,1],VEQ_K={saut:21},JADE_U={uTime:{value:0}};
    function vPalier(){return __vw;}function rayonPalier(){return 40+.3*__vw;}
    function longueurCible(){const k=Math.min(1,engTier/25);return (45+(20-45)*k)*__vw*(1.8+(1-1.8)*k)*.85;}
    function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;}}
    function __pal(t,v){engTier=t;__vw=v;}`,ctx);
  for(const f of ['code/maps/jade-alleluia.js','code/maps/jade-avatar.js'])vm.runInContext(lire(f),ctx,{filename:f});
  vm.runInContext('function __gen(g){const b=genJadeA(mulberry32(g),g);return {a3:JADE.a3,n:b.length,av:JADE.avR?{pierres:JADE.avR.pierres.length,riv:JADE.avR.riv.length}:null,itin:JADE.avR&&JADE.avR.itin!=null?JAV_ITIN[JADE.avR.itin].nom:null,deco:JADE.deco3.length,avd:JADE.deco3.filter(function(o){return o.av;}).length};}',ctx);
  return ctx;}
const ctx=creer('?'+(sans?'':'jade=avatar')+(scene?'&jscene='+scene:''));
const moy=function(a){return a.length?a.reduce(function(x,y){return x+y;},0)/a.length:0;};
for(const p of PAL){ctx.__pal(p,VW[p]||78);const N=[],E=[],T30=[],T8=[],RM=[],vus={};let err=0,rac=0,confl=0,pire=0,pg=0,dMin=1e9,ms=0;
  for(let g=G[0];g<=G[1];g++){let o;try{o=ctx.__gen(g);}catch(e){err++;console.log('  EXCEPTION p'+p+' g'+g+' : '+(e&&e.stack||e).toString().split('\n').slice(0,3).join(' | '));continue;}
    const a=o.a3;N.push(a.note);E.push(a.envers);T30.push(a.t30);T8.push(a.t8);RM.push(a.rollMax);rac+=a.racOk;confl+=a.confl;ms+=a.ms;if(a.note>pire){pire=a.note;pg=g;}if(a.dMin<dMin)dMin=a.dMin;
    for(const s of a.scenes)vus[s]=(vus[s]||0)+1;if(o.itin)vus["«"+o.itin+"»"]=(vus["«"+o.itin+"»"]||0)+1;
    if(detail)console.log('  p'+p+' g'+g+' note '+a.note+' ('+a.notes.join(' ')+') '+a.scenes.join(' > ')+' | env '+a.envers+' % ('+a.enversMaxS+' s) t30 '+a.t30+' t8 '+a.t8+' roulis '+a.rollMax+'/'+a.rollP95+' rac '+a.racOk+'/'+a.racRob+' ['+a.racVm.join(' ')+'] confl '+a.confl+(a.conflits.length?' ('+a.conflits.join(',')+')':'')+' crois '+a.croisDur+' dMin '+a.dMin+' lon '+a.lon+'/'+a.LC+' pente '+a.penteMax+'° chute '+a.chute+' m, '+a.ms+' ms'+(o.av?' · '+o.itin+' · pierres '+o.av.pierres+' riv '+o.av.riv+' av '+o.avd+'/'+o.deco:''));}
  const n=G[1]-G[0]+1;
  console.log('p'+p+' : '+n+' graines, exceptions '+err+', note '+moy(N).toFixed(2)+' (pire '+pire+' g'+pg+'), envers '+moy(E).toFixed(1)+' % ['+Math.min.apply(null,E)+'-'+Math.max.apply(null,E)+'], t30 '+moy(T30).toFixed(1)+' (max '+Math.max.apply(null,T30)+'), t8 '+moy(T8).toFixed(1)+' (max '+Math.max.apply(null,T8)+'), roulis max '+Math.max.apply(null,RM)+', rac '+(rac/n).toFixed(2)+'/2, conflits '+confl+', dMin '+dMin+', '+Math.round(ms/n)+' ms/route');
  console.log('   scènes : '+Object.keys(vus).sort(function(a,b){return vus[b]-vus[a];}).map(function(k){return k+' '+vus[k];}).join(', '));}
