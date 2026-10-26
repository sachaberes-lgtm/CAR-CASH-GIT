__ev(`(function(){
 const RH=ROAD_HALF,offs=[0,.5*RH,.9*RH,RH,RH+16,RH+34,RH+60,RH+100,RH+130,RH+200],q={};
 for(const o of offs){const a=[];for(const sg of [-1,1])for(let i=Math.round(NP*.1);i<NP*.9;i+=Math.round(NP/120)){const p=pts[i],b=B[i];const x=p.x+b.x*o*sg,z=p.z+b.z*o*sg,yr=p.y+b.y*Math.min(o,RH+36)*sg;a.push(bkSolH(x,z)-yr);}
  a.sort((u,v)=>u-v);q[Math.round(o)]=[a[0],a[a.length>>2],a[a.length>>1],a[(a.length*3)>>2],a[a.length-1]].map(Math.round);}
 const fam=f=>f===0?"glisse":f===1?"aiguille":(f>1.3&&f<1.5)?"piste":"?"+f;const st={};
 for(const P of BANQ.pics){const k=fam(P.fam)+(P.fam===0&&P.H<20?"-serac":"");const o=st[k]||(st[k]={n:0,flotte5:0,flotte20:0,max:0});o.n++;let m=0;
  for(const v of P.V){const e=v[1]-bkSolH(v[0],v[2]);if(e>m)m=e;}if(m>5)o.flotte5++;if(m>20)o.flotte20++;if(m>o.max)o.max=Math.round(m);}
 let gn=0,gf=0,gh=0;const S=BANQ.sol;for(const m of BANQ.loinM){const P=m.geometry.attributes.position.array,A=m.geometry.attributes.aP.array;for(let i=0;i<P.length/3;i++){if(A[i*4]>.01)continue;const x=P[i*3],y=P[i*3+1],z=P[i*3+2];if(bkSolD(x,z)>S.MARG){gh++;continue;}gn++;if(y-bkSolH(x,z)>5)gf++;}}
 return JSON.stringify({sans:location.search.includes('glacedecor'),neige_moins_piste:q,cristaux:st,geants:{surNeige:gn,flottent:gf,horsNeige:gh},pistePics:BANQ.n.pistePics});})()`)
