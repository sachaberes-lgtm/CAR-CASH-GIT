(function(){ /* (banc des textures du canyon) LES ARBRES NOIRS : la matière des peupliers (CY_AFS), sa géométrie, ses uniformes, son programme */
  const D=window.dbgScene(),S=D.scene,g=S.getObjectByName('canyon décor'),out={meshes:[]};if(!g)return 'pas de décor';
  const vus=new Set();
  g.traverse(function(m){if(!m.isMesh)return;const M=m.material;if(!M||vus.has(M))return;vus.add(M);
    const a=m.geometry.attributes,o={nom:m.name||'',type:M.type,inst:!!m.isInstancedMesh,n:m.count||1,vc:M.vertexColors,side:M.side,attrs:Object.keys(a),fsLit:M.fragmentShader?(M.fragmentShader.indexOf('uSTR')>=0?'roche':M.fragmentShader.indexOf('vCol*vCol')>=0?'arbre':'autre'):null};
    if(a.color){const c=a.color.array;let mx=0,mn=9,nan=0;for(let i=0;i<c.length;i++){if(!isFinite(c[i]))nan++;if(c[i]>mx)mx=c[i];if(c[i]<mn)mn=c[i];}o.color={n:a.color.count,taille:a.color.itemSize,min:+mn.toFixed(3),max:+mx.toFixed(3),nan:nan,norm:a.color.normalized};}
    if(a.normal){const c=a.normal.array;let nan=0,zero=0;for(let i=0;i<c.length;i+=3){if(!isFinite(c[i]+c[i+1]+c[i+2]))nan++;else if(Math.abs(c[i])+Math.abs(c[i+1])+Math.abs(c[i+2])<1e-6)zero++;}o.normal={n:a.normal.count,nan:nan,zero:zero};}
    try{const pr=D.rdr.properties.get(M),p=pr.program||(pr.currentProgram);if(p){o.diag=p.diagnostics||null;const gl=D.rdr.getContext();o.attribsActifs=gl.getProgramParameter(p.program,gl.ACTIVE_ATTRIBUTES);const L=[];for(let i=0;i<o.attribsActifs;i++)L.push(gl.getActiveAttrib(p.program,i).name);o.attribs=L;o.cle=(p.cacheKey||'').slice(0,0);
      const vs=gl.getShaderSource(p.vertexShader)||'';o.USE_COLOR=/#define USE_COLOR/.test(vs);o.USE_INSTANCING=/#define USE_INSTANCING/.test(vs);}}catch(e){o.progErr=String(e);}
    out.meshes.push(o);});
  const rel=S.getObjectByName('canyon');if(rel){const U=rel.material.uniforms,c=function(k){const v=U[k].value;return v.toArray?v.toArray().map(function(x){return +x.toFixed(3);}):v;};out.U={uSunC:c('uSunC'),uSky:c('uSky'),uGnd:c('uGnd'),uBnc:c('uBnc'),uRkT:c('uRkT'),uFillC:c('uFillC'),uWet:c('uWet'),uQ:c('uQ'),uMist:c('uMist'),uSunD:c('uSunD'),uPhC:c('uPhC')};}
  out.three=window.THREE&&THREE.REVISION;return out;})()
