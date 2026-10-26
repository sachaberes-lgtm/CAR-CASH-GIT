(async function(){await new Promise(r=>setTimeout(r,4000));G.dbgVolcan('fini');const T=G.dbgTrace({pas:20}),p=T.p,n=p.length/3;let cx=0,cy=0,cz=0,k=0;
for(let j=Math.floor(n*.55);j<n;j++){cx+=p[j*3];cy+=p[j*3+1];cz+=p[j*3+2];k++;}cx/=k;cy/=k;cz/=k;const out={test:G.dbgVolcan('test'),c:[cx,cy,cz].map(Math.round),shots:[]};
for(const az of [0,2.1,4.2]){G.dbgVolcan('vue',{p:[cx+Math.sin(az)*1500,cy+450,cz+Math.cos(az)*1500],c:[cx,cy-120,cz],fov:55});out.shots.push(G.dbgScene().rdr.domElement.toDataURL('image/jpeg',.82));}
return out;})()
