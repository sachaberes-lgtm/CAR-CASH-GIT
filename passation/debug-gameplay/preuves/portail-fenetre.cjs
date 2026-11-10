// Preuve OR-02 : un autre tronçon de la route traverse-t-il la FENÊTRE du portail (disque de rayon (Ri+0,6·S)·sc autour de c = P(L-25)+H·n, plan ⟂ tangente) ?
// En 'drive' le jeu appelle pcubeFranchi(carGroup.position) à chaque image : un tronçon lointain qui perce le disque déclenche portailPasse() AVANT la fin de la zone.
// node portail-fenetre.cjs [graines=1-60] [paliers=0,10,20] [carte=nuages,espace,ville,crypto]
const B=require('../../../outils/banc-routes/charge.cjs'),ctx=B.ctx,THREE=ctx.THREE;
const arg=(k,d)=>{const a=process.argv.find(x=>x.startsWith(k+'='));return a?a.slice(k.length+1):d;};
const [g0,g1]=arg('graines','1-60').split('-').map(Number),PAL=arg('paliers','0,10,20').split(',').map(Number),CARTES=arg('carte','nuages,espace,ville,crypto').split(',');
const Ri=44,S=5.2,H=20,sc=1.5,R=(Ri+S*.6)*sc;
function piste(carte,g,p){const vw=B.VW[p]||78;ctx.__setPalier(p,vw);
  ctx.LVL.cur=carte==='crypto'?{id:'ville',crypto:1,carte:'ville',sansFin:1}:carte==='ville'?{id:'ville',carte:'ville',sansFin:1}:carte==='espace'?{id:'espace',espace:1,carte:'espace',sansFin:1}:{id:'nuages',carte:'nuages',sansFin:1};
  ctx.window.dbgEspOff=false;ctx.MODMARK.length=0;ctx.FILETMARK.length=0;
  let ctrl=ctx.genCtrl(ctx.mulberry32(g),new THREE.Vector3(0,0,0),0),N=null;
  if(ctx.hautOn()||(typeof ctx.espTordOn==='function'&&ctx.espTordOn())){const h=ctx.pisteTordPropre(ctrl,g);ctrl=h.ctrl;N=h.N;}
  return {ctrl,N};}
function ech(ctrl,N){const P=[];let s=0;for(let i=0;i<ctrl.length;i++){if(i){const a=ctrl[i-1],b=ctrl[i],d=a.distanceTo(b),n=Math.max(1,Math.ceil(d/6));
  for(let k=1;k<=n;k++){s+=d/n;const f=k/n;P.push({p:new THREE.Vector3().lerpVectors(a,b,f),s,n:N?new THREE.Vector3().lerpVectors(N[i-1],N[i],f).normalize():new THREE.Vector3(0,1,0)});}}else P.push({p:ctrl[0].clone(),s:0,n:N?N[0].clone():new THREE.Vector3(0,1,0)});}return {P,L:s};}
let tot=0,bad=0;const par={};
for(const carte of CARTES)for(const pal of PAL){let nb=0,n=0,ex=null;
  for(let g=g0;g<=g1;g++){let r;try{r=piste(carte,g,pal);}catch(e){continue;}n++;const {P,L}=ech(r.ctrl,r.N);
    const iE=P.findIndex(q=>q.s>=L-25),e=P[iE],t=new THREE.Vector3().subVectors(P[Math.min(P.length-1,iE+1)].p,P[Math.max(0,iE-1)].p).normalize(),c=e.p.clone().addScaledVector(e.n,H);
    let hit=null;for(let i=1;i<P.length;i++){if(P[i].s>L-90)break;const a=P[i-1].p.clone().sub(c).dot(t),b=P[i].p.clone().sub(c).dot(t);
      if((a>0&&b<=0)||(a<0&&b>=0)){const f=a/(a-b),q=new THREE.Vector3().lerpVectors(P[i-1].p,P[i].p,f),dd=q.distanceTo(c);if(dd<R){hit={s:Math.round(P[i].s),L:Math.round(L),d:+dd.toFixed(0)};break;}}}
    if(hit){nb++;if(!ex)ex={g,...hit};}}
  par[carte+' p'+pal]=`${nb}/${n}`+(ex?'  ex '+JSON.stringify(ex):'');}
console.log('rayon de la fenêtre (m)',R.toFixed(1));console.log(par);
