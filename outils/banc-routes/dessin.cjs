/* dessine une piste en 3 vues (dessus, côté X, côté Z), colorée par l'orientation de la dalle : vert = à l'endroit, jaune = sur la tranche, rouge = à l'envers ; les figures en bleu/violet au-dessus.
   node dessin.cjs nuages|espace graine palier sortie.png */
const B=require('./charge.cjs'),P=require('./png.cjs'),fs=require('fs');
function dessine(r,sortie){
  const Q=r.ctrl,N=r.N;const n=Q.length;
  let mn=[1e9,1e9,1e9],mx=[-1e9,-1e9,-1e9];for(const q of Q){mn[0]=Math.min(mn[0],q.x);mx[0]=Math.max(mx[0],q.x);mn[1]=Math.min(mn[1],q.y);mx[1]=Math.max(mx[1],q.y);mn[2]=Math.min(mn[2],q.z);mx[2]=Math.max(mx[2],q.z);}
  const W=700,H=700,im=P.Img(W*2,H*2,[16,18,28]);
  const vues=[[0,2],[0,1],[2,1]]; // [axe horizontal, axe vertical] ; dessus : x,z ; côtés x,y et z,y
  const cadres=[[0,0,W,H],[W,0,W,H/2],[W,H/2,W,H/2]];
  vues.forEach(function(v,vi){const f=cadres[vi];const [a,b]=v;const k=['x','y','z'];
    const ea=mx[a]-mn[a],eb=mx[b]-mn[b];const sc=Math.min((f[2]-30)/Math.max(ea,1),(f[3]-30)/Math.max(eb,1));
    const X=q=>f[0]+15+(q[k[a]]-mn[a])*sc,Y=q=>f[1]+f[3]-15-(q[k[b]]-mn[b])*sc;
    for(let i=1;i<n;i++){const ny=N?N[i].y:1;const c=ny>.5?[90,220,120]:ny<-.2?[255,80,80]:[250,210,70];P.line(im,X(Q[i-1]),Y(Q[i-1]),X(Q[i]),Y(Q[i]),c,1);}
    for(const m of r.marks){if(!m.fig)continue;const col={boucle:[120,200,255],tonneau:[220,120,255],envers:[255,150,60],mur:[255,255,255],puits:[0,255,255]}[m.fig]||[255,255,255];
      for(let i=m.i0;i<=m.i1&&i<n;i++)P.disc(im,X(Q[i]),Y(Q[i]),2,col);}
    P.disc(im,X(Q[0]),Y(Q[0]),4,[255,255,255]);
  });
  fs.writeFileSync(sortie,P.png(im));}
module.exports={dessine};
if(require.main===module){const [c,sd,pal,out]=process.argv.slice(2);const r=B.piste(c,+sd,+pal);dessine(r,out);console.log('ok',out,r.marks.map(m=>m.fig||'-').join(','),r.info&&JSON.stringify(r.info));}
