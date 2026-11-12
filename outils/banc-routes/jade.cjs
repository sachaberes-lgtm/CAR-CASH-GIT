/* LE BANC DE JADE (2026-11-12, « les mêmes modules en boucle ») : le VRAI genJade (jade-1.js, tranche route seule) chargé dans le vm de charge.cjs.
   node jade.cjs palier graines(1-12) [suite=1]
   par graine : les modules (JADE.mk : lacets, épingle…, pics, ras), la longueur en s de croisière et sur la visée, le dénivelé net (départ − arrivée), la pente moyenne et en pointe,
   la rectitude, la note du directeur de rythme, les conflits (deux points à moins de 40 m en plan et 14 m en hauteur sans être voisins de route). En fin : la fréquence de chaque module,
   le nombre de modules différents, la part commune entre deux routes qui se suivent. suite=1 : garde la mémoire des deux dernières routes d'une graine à l'autre (comme en jeu).
   env : SEARCH="?sans=paquetjade" (la route d'avant) · SEARCH="?ras=1" */
const fs=require('fs'),vm=require('vm'),path=require('path');
const RACINE=path.resolve(__dirname,'../..');
const B=require('./charge.cjs'),G=B.creer(process.env.SEARCH||''),ctx=G.ctx,V3=ctx.THREE.Vector3;
vm.runInContext('var TEL_NATIF=false;',ctx);
function tranche(){const L=fs.readFileSync(path.join(RACINE,'code/maps/jade-1.js'),'utf8').split('\n');
  const pick=re=>L.filter(l=>re.test(l));
  const iH=L.findIndex(l=>/^const JADE_HUMEURS=/.test(l)),iK=L.findIndex(l=>/^\/\/ les petits volumes colorés/.test(l));
  return ['const JADE={Q:null};'].concat(pick(/^const JADE_MODULES=/),pick(/^const JADE_BANK=/),pick(/^const JADE_VUS=/),L.slice(iH,iK)).join('\n');}
try{vm.runInContext(tranche(),ctx,{filename:'jade-1.js(route)'});}catch(e){console.log('CHARGEMENT jade-1.js :',e.stack.split('\n').slice(0,4).join(' | '));process.exit(1);}
const VW=B.VW;
function piste(graine,palier){palier|=0;const vw=VW[palier]||78;ctx.__setPalier(palier,vw);ctx.LVL.cur={id:'jade',carte:'jade',sansFin:1,__al:.85};
  ctx.MODMARK.length=0;const rnd=ctx.mulberry32(graine);const ctrl=ctx.genJade(rnd);
  return {ctrl,vw,marks:ctx.MODMARK.map(m=>Object.assign({},m)),mk:(vm.runInContext('JADE.mk',ctx)||[]).slice(),pics:vm.runInContext('JADE.pics',ctx),ras:vm.runInContext('JADE.ras',ctx),note:vm.runInContext('RYTHME.der&&RYTHME.der.note',ctx)};}
module.exports={ctx,piste};
if(require.main===module){
const [pal,gr]=process.argv.slice(2),suite=process.argv.includes('suite=1');const [g0,g1]=(gr||'1-12').split('-').map(Number);const A=[],F={};let prec=null,communs=[];
for(let g=g0;g<=(g1||g0);g++){if(!suite)try{vm.runInContext('if(typeof JADE_VUS!=="undefined")JADE_VUS.length=0',ctx);}catch(e){}
  let r;try{r=piste(g,pal||0);}catch(e){console.log('graine',g,'ERREUR',e.stack.split('\n').slice(0,3).join(' | '));continue;}
  const Q=r.ctrl,n=Q.length;let L=0,pmax=0,conf=0;const S=[0];
  for(let i=1;i<n;i++){const ds=Math.hypot(Q[i].x-Q[i-1].x,Q[i].y-Q[i-1].y,Q[i].z-Q[i-1].z);L+=ds;S.push(L);}
  for(let i=6;i<n;i+=2){const ds=Math.hypot(Q[i].x-Q[i-6].x,Q[i].z-Q[i-6].z);pmax=Math.max(pmax,Math.abs(Q[i-6].y-Q[i].y)/Math.max(1,ds));}
  for(let i=0;i<n;i++)for(let j=i+1;j<n;j++){if(S[j]-S[i]<260)continue;if(Math.hypot(Q[i].x-Q[j].x,Q[i].z-Q[j].z)<40&&Math.abs(Q[i].y-Q[j].y)<14){conf++;break;}}
  const noms=r.mk.slice();for(const x of noms)F[x]=(F[x]||0)+1;if(prec){const c=noms.filter(x=>prec.indexOf(x)>=0).length;communs.push(c/Math.max(1,noms.length));}prec=noms;
  const LC=ctx.longueurCible?ctx.longueurCible():0;
  const o={g,s:Math.round(L/r.vw),mods:noms.join(','),pics:r.pics?r.pics.map(p=>p.H).join('/'):'-',ras:r.ras?r.ras.long+'m':'-',net:Math.round(Q[0].y-Q[n-1].y),penteNet:+((Q[0].y-Q[n-1].y)/L*100).toFixed(2),penteMax:Math.round(pmax*100),
    LsurVisee:LC?+(L/LC).toFixed(2):0,rect:+(Math.hypot(Q[n-1].x-Q[0].x,Q[n-1].z-Q[0].z)/L).toFixed(2),conflits:conf,note:r.note};
  A.push(o);console.log(JSON.stringify(o));}
const moy=k=>(A.reduce((a,x)=>a+(+x[k]||0),0)/Math.max(1,A.length)).toFixed(2);
console.log('MOYENNE s',moy('s'),'net m',moy('net'),'pente net %',moy('penteNet'),'pointe de pente %',moy('penteMax'),'rectitude',moy('rect'),'longueur / visée',moy('LsurVisee'),'conflits',moy('conflits'),'note',moy('note'));
console.log('MODULES ('+Object.keys(F).length+' différents sur '+A.length+' routes) :',Object.entries(F).sort((a,b)=>b[1]-a[1]).map(e=>e[0]+' '+e[1]).join(' · '));
console.log('COMMUNS entre deux routes qui se suivent :',(communs.reduce((a,x)=>a+x,0)/Math.max(1,communs.length)*100).toFixed(0)+' %');}
