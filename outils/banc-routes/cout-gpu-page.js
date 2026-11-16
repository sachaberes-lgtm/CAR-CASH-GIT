/* QUI COÛTE À LA PUCE, DANS LA PAGE (2026-11-14, la passe d'optimisation de l'orbite) — à passer au banc des maps :
   node outils/banc-maps/banc.cjs gen --carte=espace --meteo=soir --graines=5 --q="arrets=1500,4000,6500" --auditfile=outils/banc-routes/cout-gpu-page.js
   Le pilote auto roule jusqu'à chaque abscisse d'arrêt ; là, la simulation figée (dbgGpu), la MÊME image est chronométrée à la puce avec chaque groupe
   d'objets caché à son tour (encadré : témoin avant / caché / témoin après) — d = ce que ce groupe coûte (ms de puce par image). Groupes : les objets
   nommés (le nom du plus proche ancêtre nommé), les objets sans nom un par un s'ils ont plus de 2 000 sommets ou une matière à shader, et le post-traitement. */
(async function(){try{
  const Z=function(ms){return new Promise(function(r){setTimeout(r,ms);});},q=function(k){return ((new RegExp('[?&]'+k+'=([^&]*)').exec(location.search))||[])[1];};
  const arrets=(q('arrets')||'1500,4000,6500').split(',').map(Number),sc=dbgScene(),scene=sc.scene;
  const groupes=function(){const G=new Map();
    scene.traverseVisible(function(o){if(!(o.isMesh||o.isPoints||o.isLine||o.isSprite))return;let a=o,k='';while(a&&a!==scene){if(a.name){k=a.name;break;}a=a.parent;}
      if(!k){const g=o.geometry,n=g&&g.attributes&&g.attributes.position?g.attributes.position.count:0,mt=o.material&&(o.material.type||'?');
        if(n<2000&&!(o.material&&o.material.isShaderMaterial))k='(petits sans nom)';else k='~'+o.type+'/'+mt+'/'+n+(o.parent&&o.parent.name?'/'+o.parent.name:'');}
      if(!G.has(k))G.set(k,[]);G.get(k).push(o);});return G;};
  dbgAuto(1,0,{nit:0});const R=[];
  for(const s9 of arrets){const t0=performance.now();while(performance.now()-t0<60000){await Z(150);const st=dbgState();if(st.gameOver)break;if(dbgRoute().s>=s9)break;}
    if(dbgState().gameOver){R.push({s:s9,erreur:'mort'});break;}
    const G=groupes(),base=await dbgGpu({n:16,k:2}),L=[];
    for(const [k,objs] of G){const r=await dbgGpu({n:12,k:2,sans:function(){const v=objs.map(function(o){return o.visible;});objs.forEach(function(o){o.visible=false;});return function(){objs.forEach(function(o,i){o.visible=v[i];});};}});
      L.push([k,objs.length,r.d,r.tri?Math.round(r.tri[0]-r.tri[1]):null,r.appels?Math.round(r.appels[0]-r.appels[1]):null]);}
    {const g=window.__gpuObj;const r=await dbgGpu({n:12,k:2,sans:function(){const p=g.post();g.post(false);return function(){g.post(p);};}});L.push(['(post-traitement)',0,r.d,null,null]);}
    L.sort(function(a,b){return b[2]-a[2];});R.push({s:Math.round(dbgRoute().s),base:base,groupes:L});
    await Z(300);}
  dbgAuto(0);return JSON.stringify(R);
}catch(e){return 'ERREUR cout-gpu-page : '+(e&&e.stack||e);}})()
