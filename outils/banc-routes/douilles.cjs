/* mesure des micro-virages (« douilles ») sur le dessin à plat, et de l'orientation de la dalle après pisteTord */
const B=require(process.cwd()+'/charge.cjs');const THREE=B.ctx.THREE;
function lobes(ctrl,vP){const cv=new THREE.CatmullRomCurve3(ctrl,false,'centripetal');cv.arcLengthDivisions=Math.max(200,ctrl.length*16);
  const L=cv.getLength(),N=Math.round(L/4),P=cv.getSpacedPoints(N),ds=L/N,W=Math.max(1,Math.round(10/ds));
  const kap=[];for(let i=0;i<=N;i++)kap.push(0);
  for(let i=W;i<=N-W;i++){const a=P[i-W],b=P[i],c=P[i+W];const h1=Math.atan2(b.x-a.x,b.z-a.z),h2=Math.atan2(c.x-b.x,c.z-b.z);let d=h2-h1;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;const l=(Math.hypot(b.x-a.x,b.z-a.z)+Math.hypot(c.x-b.x,c.z-b.z))/2;kap[i]=l>.5?d/l:0;}
  /* lobes : tenues d'un même signe de courbure (seuil : rayon < 1200 m) ; un lobe = {angle total, longueur} */
  const lob=[];let cur=null;for(let i=0;i<=N;i++){const k=kap[i],sg=Math.abs(k)>1/1200?Math.sign(k):0;if(sg&&cur&&cur.sg===sg){cur.ang+=Math.abs(k)*ds;cur.len+=ds;}else{if(cur)lob.push(cur);cur=sg?{sg,ang:Math.abs(k)*ds,len:ds}:null;}}if(cur)lob.push(cur);
  const deg=l=>l.ang*180/Math.PI;const petits=lob.filter(l=>deg(l)<15&&l.len>15),moyens=lob.filter(l=>deg(l)>=15&&deg(l)<30);
  return {L:Math.round(L),lobes:lob.length,petits:petits.length,petitsKm:+(petits.length/(L/1000)).toFixed(1),moyens:moyens.length,petitsM:Math.round(petits.reduce((a,l)=>a+l.len,0)),alt:(function(){let n=0;for(let i=1;i<lob.length;i++)if(lob[i].sg!==lob[i-1].sg&&deg(lob[i])<15&&deg(lob[i-1])<15)n++;return n;})()};}
function orientation(r){if(!r.N)return null;const n=r.N.length;let d=0,t=0;for(const v of r.N){if(v.y<-.2)d++;else if(v.y<.5)t++;}return {envers:+(d/n).toFixed(2),tranche:+(t/n).toFixed(2)};}
for(const carte of ['nuages','espace'])for(const pal of [0,10,20]){const rows=[];for(let g=1;g<=6;g++){const r=B.piste(carte,g,pal);const lo=lobes(r.ctrl0,r.vw),o=orientation(r);rows.push(Object.assign({g},lo,o||{}));}
  const m=k=>(rows.reduce((a,x)=>a+x[k],0)/rows.length).toFixed(1);
  console.log(carte,'p'+pal,'L',m('L'),'lobes',m('lobes'),'petits(<15°)',m('petits'),'/km',m('petitsKm'),'m',m('petitsM'),'alternés',m('alt'),'moyens(15-30°)',m('moyens'),'envers',m('envers'),'tranche',m('tranche'));}
