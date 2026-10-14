// trace genTuto (polyligne des points de contrôle) : longueur, croisements (distance mini entre points éloignés le long de la piste)
function gen(v){const c=[];let P={x:0,y:0,z:0},phi=0;const push=()=>c.push({...P});
 const st=(l,dy=0,n=2)=>{for(let k=0;k<n;k++){P.x+=Math.sin(phi)*l/n;P.z+=Math.cos(phi)*l/n;P.y+=dy/n;push();}};
 const arc=(a,R,n,dy=0)=>{a=a*Math.PI/180;const s=a/n,ch=2*R*Math.sin(Math.abs(s)/2);for(let k=0;k<n;k++){phi+=s/2;P.x+=Math.sin(phi)*ch;P.z+=Math.cos(phi)*ch;P.y+=dy/n;phi+=s/2;push();}};
 push();
 if(v){st(v[0],0,v[2]);arc(70,v[1],v[3]);}else{st(300,0,3);arc(70,190,6);}
 st(360,-24,3);arc(-90,210,7);st(420,0,4);st(240,-80,4);st(380,0,3);arc(55,170,5);arc(-55,170,5);st(300,20,3);arc(120,230,9);st(420,0,4);return c;}
function dens(c){const o=[];for(let i=0;i+1<c.length;i++){for(let k=0;k<10;k++){const t=k/10;o.push({x:c[i].x+(c[i+1].x-c[i].x)*t,y:c[i].y+(c[i+1].y-c[i].y)*t,z:c[i].z+(c[i+1].z-c[i].z)*t});}}return o;}
for(const v of [null,[520,380,4,8],[560,420,4,9]]){const p=dens(gen(v));let Ls=[0];for(let i=1;i<p.length;i++)Ls.push(Ls[i-1]+Math.hypot(p[i].x-p[i-1].x,p[i].y-p[i-1].y,p[i].z-p[i-1].z));
 let best=1e9,bi=null;for(let i=0;i<p.length;i++)for(let j=i+1;j<p.length;j++){if(Ls[j]-Ls[i]<300)continue;const d=Math.hypot(p[i].x-p[j].x,p[i].z-p[j].z);if(d<best){best=d;bi=[Math.round(Ls[i]),Math.round(Ls[j]),Math.round(p[i].y-p[j].y)];}}
 console.log(JSON.stringify(v),'L',Math.round(Ls[Ls.length-1]),'dist horiz mini',Math.round(best),'à s',bi);}
