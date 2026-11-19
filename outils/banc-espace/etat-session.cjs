/* RÔLE « etat » (2026-11-18, espace-debug) — LA ROUTE D'ESPACE AU 1er, 2e, 3e… PASSAGE D'UNE MÊME SESSION, SAC NON FIGÉ (le joueur), contre la même graine en contexte neuf.
   Node, sans Chrome : les VRAIS morceaux (outils/banc-routes/charge.cjs), genCtrl + pisteTordPropre comme pisteRoute.
   node outils/banc-espace/etat-session.cjs [paliers=0,10,20] [n=12] [q=sans=uniques] [lent=6] [inter=nuages,ville]
   · n : nombre de routes d'espace dans la session (graines 101..100+n) ; inter : les routes genCtrl d'autres maps tirées entre deux (nuages, ville, crypto)
   · lent=k : l'horloge du contexte va k fois plus vite (performance.now × k) — un téléphone k fois plus lent vu par les bornes de temps du code (reprises : 50 ms)
   Pour chaque route : reprises (RU.V), essais du directeur de rythme, note, modules nommés, temps fort raté, R3 (roulis sur l'horizon, °/s, lissé 0,5 s, à la vitesse du palier), R8 (part la tête en bas). */
const path=require('path'),vm=require('vm');
const RAC=path.resolve(__dirname,'..','..'),M=require(path.join(RAC,'outils/banc-routes/charge.cjs'));
const arg=k=>{const a=process.argv.find(x=>x.startsWith(k+'='));return a?a.slice(k.length+1):null;};
const PAL=(arg('paliers')||'0,10,20').split(',').map(Number),N=+(arg('n')||12),Q=arg('q')?'?'+arg('q'):'',LENT=+(arg('lent')||1),INTER=(arg('inter')||'').split(',').filter(Boolean);
const CUR={ville:{id:'ville',carte:'ville',sansFin:1,__al:1},crypto:{id:'ville',crypto:1,carte:'crypto',sansFin:1,__al:1.15},nuages:{id:'nuages',carte:'nuages',sansFin:1}};
function ctxNeuf(){const B=M.creer(Q),ctx=B.ctx;if(LENT!==1){const p0=performance.now();ctx.performance={now:()=>p0+(performance.now()-p0)*LENT};vm.runInContext('performance=this.performance;',ctx);}return B;}
function mesure(B,r){const V3=B.ctx.THREE.Vector3,Qc=r.ctrl,Nn=r.N,n=Qc.length,vw=r.vw;if(!Nn)return {r3m:0,r3p:0,r8:0};const S=[0];for(let i=1;i<n;i++)S.push(S[i-1]+Qc[i].distanceTo(Qc[i-1]));
  const T=[];for(let i=0;i<n;i++)T.push(new V3().subVectors(Qc[Math.min(n-1,i+1)],Qc[Math.max(0,i-1)]).normalize());
  const bk=i=>{const t=T[i],ux=-t.y*t.x,uy=1-t.y*t.y,uz=-t.y*t.z,ul=Math.sqrt(ux*ux+uy*uy+uz*uz);if(ul<.2)return null;const U9=new V3(ux/ul,uy/ul,uz/ul),C9=new V3().crossVectors(U9,Nn[i]);return Math.atan2(C9.dot(t),U9.dot(Nn[i]));};
  const bks=[];for(let i=0;i<n;i++)bks.push(bk(i));const rates=[];
  for(let i=0;i<n;i++){let j=i;while(j+1<n&&S[j]-S[i]<.5*vw)j++;if(j===i||bks[i]==null||bks[j]==null)continue;let d=bks[j]-bks[i];while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;rates.push(Math.abs(d)/((S[j]-S[i])/vw)*57.2958);}
  rates.sort((a,b)=>a-b);let env=0;for(let i=0;i<n-1;i++){const b9=bks[i];if(b9!=null&&Math.abs(b9)>Math.PI/2)env+=S[i+1]-S[i];}
  return {r3m:rates.length?rates[rates.length-1]:0,r3p:rates.length?rates[Math.floor(.95*(rates.length-1))]:0,r8:env/S[n-1],L:S[n-1],dur:S[n-1]/vw};}
function une(B,g,p){const ctx=B.ctx;const t0=performance.now();const r=B.piste('espace',g,p);const ms=performance.now()-t0;
  const D=vm.runInContext('OU.der',ctx)||{},RY=vm.runInContext('RYTHME.der',ctx)||{},V=vm.runInContext('JSON.stringify(RU.V)',ctx);
  const noms=r.marks.filter(m=>m.fig).map(m=>m.fig),m=mesure(B,r);
  return {g,ms:Math.round(ms),v:JSON.parse(V),essais:RY.n,note:RY.note!=null?+RY.note.toFixed(2):null,nMod:new Set(noms).size,cx:D.cx||null,cxRate:D.cxRate|0,fin:D.fin,court:!!D.court,rates:D.joues?D.joues.filter(x=>x[0]==='~').length:0,
    sig:noms.join('>').slice(0,140),r3m:Math.round(m.r3m),r3p:Math.round(m.r3p),r8:+(m.r8*100).toFixed(1),dur:+(m.dur||0).toFixed(1),h:vm.runInContext('ruHache',ctx)(r.ctrl.map(q=>q.x.toFixed(2)+','+q.y.toFixed(2)+','+q.z.toFixed(2)).join(';'))};}
const out={q:Q,lent:LENT,inter:INTER,paliers:{}};
for(const p of PAL){
  const sess=ctxNeuf(),S=[],F=[];
  for(let k=0;k<N;k++){const g=101+k;
    for(const c of INTER){sess.ctx.__setPalier(p,sess.VW[p]||78);sess.ctx.LVL.cur=CUR[c];sess.ctx.MODMARK.length=0;sess.ctx.genCtrl(sess.ctx.mulberry32(g*7+3),new sess.ctx.THREE.Vector3(0,0,0),0);}
    const a=une(sess,g,p);a.vS=a.v['espace:'+Object.keys(a.v).map(x=>x.split(':')[1]).pop()]|0;
    const f=une(ctxNeuf(),g,p); /* la même graine, 1re route d'une session */
    a.reprises=Object.values(a.v).reduce((x,y)=>Math.max(x,y),0);f.reprises=Object.values(f.v).reduce((x,y)=>Math.max(x,y),0);
    S.push(a);F.push(f);
    console.log('p'+p,'route '+(k+1),'g'+g,'| session : reprises',a.reprises,'essais',a.essais,'note',a.note,'mod',a.nMod,'cxRaté',a.cxRate,'fin',a.fin,'R3',a.r3m+'/'+a.r3p,'R8',a.r8+'%',a.dur+'s',a.ms+'ms',
      '| neuve : reprises',f.reprises,'essais',f.essais,'note',f.note,'mod',f.nMod,'R3',f.r3m+'/'+f.r3p,'R8',f.r8+'%',a.h===f.h?'MÊME ROUTE':'autre route');}
  const moy=(A,k)=>+(A.reduce((x,y)=>x+(+y[k]||0),0)/A.length).toFixed(2),mx=(A,k)=>Math.max(...A.map(y=>+y[k]||0));
  const res={session:{reprises:moy(S,'reprises'),essais:moy(S,'essais'),note:moy(S,'note'),nMod:moy(S,'nMod'),cxRate:S.filter(x=>x.cxRate).length,r3max:mx(S,'r3m'),r3p95moy:moy(S,'r3p'),r8moy:moy(S,'r8'),ms:moy(S,'ms'),msMax:mx(S,'ms')},
    neuve:{reprises:moy(F,'reprises'),essais:moy(F,'essais'),note:moy(F,'note'),nMod:moy(F,'nMod'),cxRate:F.filter(x=>x.cxRate).length,r3max:mx(F,'r3m'),r3p95moy:moy(F,'r3p'),r8moy:moy(F,'r8'),ms:moy(F,'ms'),msMax:mx(F,'ms')},
    memes:S.filter((x,i)=>x.h===F[i].h).length,n:N,detail:{session:S,neuve:F}};
  out.paliers[p]=res;console.log('== palier',p,'session',JSON.stringify(res.session),'\n== palier',p,'neuve  ',JSON.stringify(res.neuve),'\n== mêmes routes',res.memes+'/'+N);}
const fic=arg('out');if(fic)require('fs').writeFileSync(fic,JSON.stringify(out,null,1));
