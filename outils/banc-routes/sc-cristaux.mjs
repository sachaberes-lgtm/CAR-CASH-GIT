/* scénario : les CRISTAUX de Pic de Jade (2026-11-05, « ils sortent de nulle part ») — SCRIPT=sc-cristaux.mjs SEED=7 node jeu.mjs jade midi 60
   Liste les grappes (famille des arbres, cases 8-9 de aJ.z), pose la caméra de la photo (dbgJadeVue {p,c,fov}) devant les N plus proches de la route. */
export default async function(H,[carte,meteo,secs]){
  await H.jouer();
  let ok=false;for(let i=0;i<180&&!ok;i++){await H.sleep(1000);ok=await H.ev(`(function(){var j=dbgJade();return !!(j&&j.porteFin&&dbgState().started);})()`).catch(()=>false);}
  console.log('prêt',ok);if(!ok)return;
  const lst=JSON.parse(await H.ev(`(function(){var J=dbgJadeObj(),o=[];for(var F of J.fam){if(!F.pidx&&F.tq){for(var i=0;i<F.n;i++){var z=F.J[i*4+2];if(z>7.5)o.push([F.M[i*16+12],F.M[i*16+13],F.M[i*16+14],F.J[i*4],F.J[i*4+1],z,i]);}}}
    return JSON.stringify({n:o.length,o:o.slice(0,400)});})()`));
  console.log('cristaux',lst.n,'err',await H.ev('String(dbgJade().err)'));
  const N=+process.env.N||4,skip=+process.env.SKIP||0;
  const pos=lst.o.slice(skip,skip+N);
  for(const [k,c] of pos.entries()){
    for(const [nom,dx,dy,dz] of [['pres',45,25,45],['loin',160,60,160]]){
      const r=await H.ev(`(function(){var c=[${c[0]},${c[1]},${c[2]}];dbgJadeVue({p:[c[0]+${dx},c[1]+${dy},c[2]+${dz}],c:[c[0],c[1]+${c[4]}*.5,c[2]],fov:60});
        var t=document.getElementById('tPanel');if(t)t.style.display='none';var h=document.getElementById('hud');if(h)h.style.display='none';return 'ok';})()`);
      await H.sleep(500);await H.shot('cri'+(skip+k)+'-'+nom);
    }
    console.log('cristal',skip+k,JSON.stringify(c));
  }
}
