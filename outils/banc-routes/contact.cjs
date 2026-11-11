/* où deux dalles se touchent : node contact.cjs carte graine palier */
const B=require('./charge.cjs'),V3=B.ctx.THREE.Vector3;const [c,g,p]=process.argv.slice(2);const r=B.piste(c,+g,+p),Q=r.ctrl,N=r.N,n=Q.length;const S=[0];for(let i=1;i<n;i++)S.push(S[i-1]+Q[i].distanceTo(Q[i-1]));
console.log('L',Math.round(S[n-1]),'info',JSON.stringify({essai:r.info.essai,contacts:r.info.contacts,zones:r.info.zones}),'marks',r.marks.map(m=>(m.fig||'-')+':'+Math.round(S[m.i0])+'-'+Math.round(S[Math.min(n-1,m.i1)])).join(' '));
let last=-1e9;for(let i=1;i<n-1;i++){const T=new V3().subVectors(Q[i+1],Q[i-1]).normalize(),Bv=new V3().crossVectors(T,N[i]);
  for(let j=i+1;j<n;j++){if(S[j]-S[i]<250)continue;const d=new V3().subVectors(Q[j],Q[i]);if(d.lengthSq()>75*75)continue;const dn=d.dot(N[i]),db=d.dot(Bv);
    if(Math.abs(dn)<16&&Math.abs(db)<62&&S[i]-last>100){last=S[i];console.log('contact s',Math.round(S[i]),'avec s',Math.round(S[j]),'écart normal',dn.toFixed(1),'travers',db.toFixed(1),'y',Q[i].y.toFixed(0),Q[j].y.toFixed(0),'N.y',N[i].y.toFixed(2),N[j].y.toFixed(2));break;}}}
