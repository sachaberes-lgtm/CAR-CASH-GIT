/* scénario : la FACE de la Porte du ciel (Pic de Jade, 2026-11-05, « la face avant elle est noire ») — SCRIPT=sc-porte-face.mjs node jeu.mjs jade midi 60
   Pose la caisse à d m avant la Porte, fait avancer la boucle à la main, photographie. DIST="80,40" ; VARIANTES = liste « nom=code ;; nom=code » (code évalué après la pose, J = l'objet JADE). */
export default async function(H,[carte,meteo,secs]){
  await H.jouer();
  let ok=false;for(let i=0;i<180&&!ok;i++){await H.sleep(1000);ok=await H.ev(`(function(){var j=dbgJade();return !!(j&&j.porteFin&&dbgState().started);})()`).catch(()=>false);}
  console.log('prêt',ok);if(!ok)return;
  const ds=(process.env.DIST||'80,40').split(',').map(Number);
  const vs=(process.env.VARIANTES||'base=0').split(';;').map(x=>x.split('=')).map(a=>[a[0].trim(),a.slice(1).join('=')]);
  for(const d of ds)for(const [nom,code] of vs){
    const r=await H.ev(`(function(){var a=dbgJadeAller('porte',${d+3});dbgAuto(1,0);for(var k=0;k<4;k++)dbgStep(1,16);
      var hud=document.getElementById('hud');if(hud)hud.style.display='none';var J=dbgJadeObj();for(var m of J.porte.mF){m.visible=true;}for(var m of J.porte.mL)m.visible=false;${code};
      return JSON.stringify({s:dbgState().s,pres:J.porte.pres,x:window.__x});})()`);
    console.log('d',d,nom,r);await H.sleep(250);await H.shot('porte-'+nom+'-d'+d);
  }
}
