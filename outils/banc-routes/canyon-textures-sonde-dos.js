(function(){ /* (banc des textures du canyon) LES TROUS DU RELIEF : le relief rendu en double face, ses faces vues de DOS en rouge — un trou du quadtree (CDLOD) laisse voir le dos
   de la roche qui est derrière. Rend, pour une liste d'abscisses, la part de pixels « dos » de l'écran (0 = aucun trou). window.__dosS = [abscisses] (défaut : 40 vues le long de la route). */
  const D=window.dbgScene(),R=D.rdr,gl=R.getContext(),W=gl.drawingBufferWidth,H=gl.drawingBufferHeight,rel=D.scene.getObjectByName('canyon'),dec=D.scene.getObjectByName('canyon décor');if(!rel)return 'pas de relief';
  const M=rel.material,f0=M.fragmentShader,s0=M.side,a='gl_FragColor=vec4(c,1.);';
  M.fragmentShader=f0.split(a).join('gl_FragColor=vec4(gl_FrontFacing?vec3(0.,8.,0.):vec3(8.,0.,0.),1.);').split('#include <fog_fragment>').join('');M.side=2;M.needsUpdate=true;if(dec)dec.visible=false;
  const L9=dbgRoute().L,LS=window.__dosS||(function(){const o=[];for(let k=1;k<=40;k++)o.push(Math.round(L9*k/42));return o;})(),out=[],b=new Uint8Array(W*H*4);let tot=0,pire=0,pireS=0;
  for(const s9 of LS){dbgCanyonVoute('vueS',s9);gl.readPixels(0,0,W,H,gl.RGBA,gl.UNSIGNED_BYTE,b);let n=0;for(let i=0;i<W*H;i++){const o=i*4;if(b[o]>150&&b[o+1]<90&&b[o+2]<90)n++;}
    const p=n/(W*H);tot+=p;if(p>pire){pire=p;pireS=s9;}if(p>2e-4)out.push([s9,+(p*100).toFixed(3)]);}
  M.fragmentShader=f0;M.side=s0;M.needsUpdate=true;if(dec)dec.visible=true;
  return {vues:LS.length,moyPct:+(tot/LS.length*100).toFixed(4),pirePct:+(pire*100).toFixed(3),pireS:pireS,touchees:out,R0:rel.material.uniforms.uR0.value};})()
