const Q=`(function(){var out=[];for(var j=0;j<DN.mo.length;j++){var m=DN.mo[j];var best=1e9,bi=-1;for(var i=0;i<NP;i+=2){var dx=pts[i].x-m.x,dz=pts[i].z-m.z,d=dx*dx+dz*dz;if(d<best){best=d;bi=i;}}
 out.push({k:m.k,r:Math.round(m.r),h:Math.round(m.h),yRel:Math.round(m.y-pts[bi].y),s:bi,dBord:+(Math.sqrt(best)-ROAD_HALF-m.r).toFixed(1),dAxe:Math.round(Math.sqrt(best))});}
 return {n:DN.mo.length,mo:out,lev:DN.lev.map(function(l){return l.s+':'+l.tag;}),scn:(DN.scn||[]).length};})()`;
export default async function(H){
  await H.jouer();await H.sleep(3000);
  console.log(await H.ev('JSON.stringify(__ev('+JSON.stringify(Q)+'))'));
}
