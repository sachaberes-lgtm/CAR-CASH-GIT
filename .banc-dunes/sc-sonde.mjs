const SONDE=`(function(){var out={n:0,morts:0,par:{},pire:[],rh:ROAD_HALF,NP:NP,L:L};var Hs=[0.3,0.8,1.5,2.5,4];var Ls=[-1,-.75,-.5,0,.5,.75,1,1.2];
for(var i=0;i<NP;i+=2){for(var a=0;a<Ls.length;a++){for(var b=0;b<Hs.length;b++){var lat=Ls[a]*ROAD_HALF,h=Hs[b];
 var p=new THREE.Vector3().copy(pts[i]).addScaledVector(B[i],lat).addScaledVector(Nn[i],h);out.n++;
 var c=dunesHeurt(p);if(c){out.morts++;out.par[c]=(out.par[c]||0)+1;if(out.pire.length<40)out.pire.push({i:i,s:Math.round(i/(NP-1)*L),lat:+lat.toFixed(1),h:h,c:c,ny:+Nn[i].y.toFixed(2),py:+p.y.toFixed(1),sand:+dnHauteur(p.x,p.z).toFixed(1)});}}}}
return out;})()`;
export default async function(H){
  await H.jouer();await H.sleep(3000);
  console.log(await H.ev('JSON.stringify(__ev('+JSON.stringify(SONDE)+'))'));
}
