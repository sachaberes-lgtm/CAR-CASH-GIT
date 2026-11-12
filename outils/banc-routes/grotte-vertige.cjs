/* LE BILAN DU VERTIGE (2026-11-12) : node grotte-vertige.cjs palier graines(1-12) [suite=1]
   par graine : la forme, les assiettes, les passages, les modules ; la part hors de l'endroit (N.y < 0,5) et à l'envers (N.y < −0,2), le plus long passage (s de croisière), la pointe de roulis (°/s de croisière),
   la pente moyenne et en pointe (monde), la rectitude (corde / longueur), conflits et contacts. En fin : la fréquence de chaque module, et la part de modules COMMUNS entre deux grottes qui se suivent.
   suite=1 : garde la mémoire des deux dernières grottes d'une graine à l'autre (comme en jeu) ; sinon chaque graine part d'une mémoire vide. SEARCH="?sans=vertige" : la grotte d'avant. */
const G=require('./grotte.cjs'),vm=require('vm'),V3=G.ctx.THREE.Vector3;
const [pal,gr]=process.argv.slice(2),suite=process.argv.includes('suite=1');const [g0,g1]=(gr||'1-12').split('-').map(Number);const A=[],F={};let prec=null,communs=[];
/* la longueur VISÉE du vrai jeu (DUREE : 45 s au palier 0, 20 s au palier 25 ; l'élan 1,8 → 1 ; l'allure de la grotte 0,85) — sans elle le banc bâtit la grotte « hors du JOUER », plus courte au palier 0, bien plus longue au palier 20 */
{const p9=+(pal||0),k9=Math.min(1,p9/25),vw9=require('./charge.cjs').VW[p9]||78;G.ctx.__LC=process.env.LC==='0'?0:(45-25*k9)*vw9*(1.8-.8*k9)*.85;vm.runInContext('longueurCible=function(){return __LC;}',G.ctx);}
for(let g=g0;g<=(g1||g0);g++){if(!suite)try{vm.runInContext('GRT_VUS.length=0',G.ctx);}catch(e){}
  let r;try{r=G.piste(g,pal||0);}catch(e){console.log('graine',g,'ERREUR',e.stack.split('\n').slice(0,3).join(' | '));continue;}
  if(r.tordErr){console.log('graine',g,'TORD',r.tordErr);continue;}
  const Q=r.ctrl,N=r.N,n=Q.length;let hors=0,env=0,pas=0,long=0,cur=0,pointe=0,L=0,pmax=0;
  for(let i=1;i<n;i++){const ds=Q[i].distanceTo(Q[i-1]);L+=ds;const t=new V3().subVectors(Q[Math.min(n-1,i+1)],Q[i-1]).normalize();
    if(N[i].y<.5){hors+=ds;if(!cur)pas++;cur+=ds;long=Math.max(long,cur);}else cur=0;if(N[i].y<-.2)env+=ds;
    const a=new V3().copy(N[i-1]).addScaledVector(t,-N[i-1].dot(t)).normalize(),b=new V3().copy(N[i]).addScaledVector(t,-N[i].dot(t)).normalize();
    pointe=Math.max(pointe,Math.abs(Math.atan2(new V3().crossVectors(a,b).dot(t),a.dot(b)))/Math.max(1,ds)*r.vw);}
  const Q0=r.ctrl0;for(let i=6;i<Q0.length;i+=2){const ds=Q0[i].distanceTo(Q0[i-6]);pmax=Math.max(pmax,(Q0[i-6].y-Q0[i].y)/ds);}
  const hz=vm.runInContext('GROTTE.Q&&GROTTE.Q.hasard',G.ctx)||{},noms=(vm.runInContext('GROTTE.noms',G.ctx)||r.marks.map(m=>m.nom||m.fig||'?')).slice();
  for(const x of noms)F[x]=(F[x]||0)+1;if(prec){const c=noms.filter(x=>prec.indexOf(x)>=0).length;communs.push(c/Math.max(1,noms.length));}prec=noms;
  const o={g,s:Math.round(L/r.vw),forme:hz.forme||'-',coude:hz.coude,ass:hz.assiettes||'-',pass:hz.passages||'-',mods:noms.join(','),hors:+(hors/L).toFixed(2),envers:+(env/L).toFixed(2),passages:pas,longS:+(long/r.vw).toFixed(1),pointe:Math.round(pointe*57.3),
    pente:+((Q[0].y-Q[n-1].y)/L*100).toFixed(1),penteMax:Math.round(pmax*100),rect:+(Math.hypot(Q[n-1].x-Q[0].x,Q[n-1].z-Q[0].z)/L).toFixed(2),conflits:r.conflits,contacts:r.info&&r.info.contacts,note:vm.runInContext('RYTHME.der&&RYTHME.der.note',G.ctx)};
  A.push(o);console.log(JSON.stringify(o));}
const moy=k=>(A.reduce((a,x)=>a+(+x[k]||0),0)/Math.max(1,A.length)).toFixed(2);
console.log('MOYENNE hors',moy('hors'),'envers',moy('envers'),'passages',moy('passages'),'le plus long (s)',moy('longS'),'pointe °/s',moy('pointe'),'pente %',moy('pente'),'pointe de pente %',moy('penteMax'),'rectitude',moy('rect'),'conflits',moy('conflits'),'contacts',moy('contacts'),'note',moy('note'));
console.log('MODULES ('+Object.keys(F).length+' différents sur '+A.length+' grottes) :',Object.entries(F).sort((a,b)=>b[1]-a[1]).map(e=>e[0]+' '+e[1]).join(' · '));
console.log('COMMUNS entre deux grottes qui se suivent :',(communs.reduce((a,x)=>a+x,0)/Math.max(1,communs.length)*100).toFixed(0)+' %');
