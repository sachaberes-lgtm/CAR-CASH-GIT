// node construit.cjs <site> <portHttp> <portChrome> [n=10] [cartes=canyon,dunes] — n constructions par map dans le vrai jeu (au menu : le monde se
// calcule tout de suite, sans travailleur) : erreurs JS, temps, règle d'or, décors sur la route, l'axe et les pièces tirées (NON COMMITÉ)
const path=require('path'),fs=require('fs'),{serveur,chrome,tue,dort}=require('./cdp.cjs');
const [site,ph,pc]=[process.argv[2]||'apres',+process.argv[3]||8637,+process.argv[4]||9637],N=+process.argv[5]||10,CARTES=(process.argv[6]||'canyon,dunes').split(',');
const PAL=[0,0,0,0,3,6,10,15,20,25];const R9=[];
(async()=>{
  await serveur(path.join(__dirname,'site-'+site),ph);
  const c=await chrome(pc,{tmp:path.join(__dirname,'tmp')});
  const errs=[];c.ecoute.push(m=>{if(m.method==='Runtime.exceptionThrown')errs.push('EXC '+(m.params.exceptionDetails.exception&&m.params.exceptionDetails.exception.description||m.params.exceptionDetails.text).slice(0,300));
    if(m.method==='Runtime.consoleAPICalled'&&(m.params.type==='error'||m.params.type==='warning'))errs.push(m.params.type+' '+m.params.args.map(a=>a.value!=null?String(a.value):a.description||'').join(' ').slice(0,300));});
  await c.send('Runtime.enable');await c.send('Page.enable');await c.send('Network.enable');await c.send('Network.setBypassServiceWorker',{bypass:true});
  await c.send('Page.addScriptToEvaluateOnNewDocument',{source:"try{if(!sessionStorage.__cc){sessionStorage.__cc=1;localStorage.cashcarSave=JSON.stringify({tuto:1,permis:1,facile:0,sfx:false,mus:false,vox:false,plq:{m:'fr',x:'CC-161-LG',ok:1}});}}catch(e){}"});
  await c.send('Page.navigate',{url:'http://127.0.0.1:'+ph+'/index.html?colonne=0'});
  let ok=false;for(let i=0;i<900&&!ok;i++){await dort(200);try{ok=await c.ev('!!window.__gameReady&&typeof window.dbgTrace==="function"');}catch(e){}}
  if(!ok)throw new Error('le jeu ne démarre pas');await dort(3000);
  const e0=errs.length;console.log('chargé, erreurs au chargement :',errs.slice(0,8));
  for(const carte of CARTES)for(let i=0;i<N;i++){const pal=PAL[i%PAL.length];const avant=errs.length;
    const r=await c.ev(`(function(){const t0=performance.now();let er=null,t;try{t=dbgTrace({carte:'${carte}',palier:${pal}});}catch(e){er=String(e&&e.stack||e).slice(0,400);}
      const ms=Math.round(performance.now()-t0);const D=${carte==='canyon'?'dbgCanyon':'dbgDunes'};const st=D(),te=D('test');
      // les décors sur la route (canyon : canyonHeurt à 1,5 m et 5 m au-dessus de la dalle, au centre et à 90 % des bords)
      let mo=null;if('${carte}'==='canyon'&&window.__ev)mo=__ev("(function(){let n=0,ou=[];const F9={p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()},q=new THREE.Vector3();for(let s9=0;s9<L;s9+=10){frameAt(s9,F9);for(const lt of [-.9*ROAD_HALF,0,.9*ROAD_HALF])for(const h of [1.5,5]){q.copy(F9.p).addScaledVector(F9.b,lt).addScaledVector(F9.n,h);const k=canyonHeurt(q);if(k){n++;if(ou.length<12)ou.push(Math.round(s9)+':'+k);}}}return {n:n,ou:ou.join(' ')};})()");
      let mit=null;if('${carte}'==='canyon'&&window.__ev&&te&&(te.dessus||te.dessous)){try{const m9=/(\d+)/.exec(String(te.ou));const s9=m9?+m9[1]:0;
        mit=__ev('(function(){const F9={p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()};frameAt('+s9+',F9);return {s:'+s9+',p:[Math.round(F9.p.x),Math.round(F9.p.y),Math.round(F9.p.z)],mit:(CY.mit||[]).map(function(o){return [Math.round(Math.hypot(o.x-F9.p.x,o.z-F9.p.z)),Math.round(o.r),Math.round(o.y1-F9.p.y)];}),sQ:CY.sQ};})()');}catch(e){mit={err:String(e)};}}
      const E9='${carte}'==='canyon'?'CY':'DN',G9=window.__ev?__ev('(function(){const E='+E9+';return [E.F?E.F.nx*E.F.nz:0,E.Z?E.Z.nx*E.Z.nz:0,E.O?E.O.nx*E.O.nz:0];})()'):null;
      return {mit,G9,er,ms,L:t&&Math.round(t.L),piste:t&&t.piste,meteo:t&&t.meteo,on:st.on,msMonde:st.ms,hz:st.hz,test:te,mo,loopErr:window.__loopErr?String(window.__loopErr).slice(0,300):null};})()`);
    const e9=errs.slice(avant);
    console.log(`${carte} #${i} palier ${pal} : ${r.er?'ERREUR '+r.er:''} L ${r.L} m · ${r.meteo} · ${r.ms} ms (monde ${JSON.stringify(r.msMonde)}) · axe ${r.hz&&r.hz.axe}° coudes ${r.hz&&JSON.stringify(r.hz.c)} · pièces ${r.hz&&r.hz.p.filter((q,k)=>!/^(module|meandres|gorge|serpent|derive|cassures|virages|houle)$/.test(q[0])).map(q=>q[0]).join(' ')}`);
    if(r.mit)console.log('   ÉCHEC ',JSON.stringify(r.mit));
    if(r.G9)console.log('   grilles fine '+r.G9[0]+' · fond '+r.G9[1]+' · ombre '+r.G9[2]+' · mémoire GPU ~'+((r.G9[0]*12+r.G9[1]*16+r.G9[2]*4)/1048576).toFixed(1)+' Mo');
    R9.push({carte,pal,ms:r.msMonde&&r.msMonde.total,mo:r.G9?(r.G9[0]*12+r.G9[1]*16+r.G9[2]*4)/1048576:0,d:r.test&&r.test.dessus,u:r.test&&r.test.dessous});
    console.log(`   règle d'or ${JSON.stringify(r.test)}${r.mo?' · décors sur la route '+JSON.stringify(r.mo):''}${r.loopErr?' · LOOPERR '+r.loopErr:''}${e9.length?' · CONSOLE '+JSON.stringify(e9.slice(0,4)):''}`);
  }
  for(const carte of CARTES)for(const g of [[0,3],[6,15],[20,25]]){const v=R9.filter(o=>o.carte===carte&&o.pal>=g[0]&&o.pal<=g[1]);if(!v.length)continue;const ms=v.map(o=>o.ms).sort((a,b)=>a-b),mo=v.map(o=>o.mo).sort((a,b)=>a-b);
    console.log('RÉSUMÉ',carte,'paliers',g.join('-'),'n',v.length,'monde ms médiane',ms[ms.length>>1],'max',ms[ms.length-1],'· GPU Mo médiane',mo[mo.length>>1].toFixed(1),'max',mo[mo.length-1].toFixed(1),'· règle d\'or cassée',v.filter(o=>o.d||o.u).length);}
  tue();process.exit(0);
})().catch(e=>{console.error(e);tue();process.exit(1);});
