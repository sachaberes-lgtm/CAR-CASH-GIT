const {chromium}=require('playwright');const fs=require('fs');
(async()=>{
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox']});
  const p=await b.newPage({viewport:{width:320,height:240}});
  await p.goto('http://localhost:8899/probe.html',{waitUntil:'load',timeout:90000});
  await p.waitForTimeout(4000);
  const stats=await p.evaluate(()=>window.__stats());
  const t=await p.evaluate(()=>{const x=window.__track();return {L:x.L,NP:x.NP,HOLES:x.HOLES,RAMPS:x.RAMPS,PADS:x.PADS,OILS:x.OILS,CONES:x.CONES};});
  fs.writeFileSync('/home/claude/carcrash/out/real-track-meta.json',JSON.stringify({stats,t},null,1));
  const abs=a=>a.map(Math.abs);
  const q=(a,f)=>{const s=a.slice().sort((x,y)=>x-y);return s[Math.min(s.length-1,Math.floor(s.length*f))];};
  console.log('PISTE RÉELLE  L='+Math.round(t.L)+'  NP='+t.NP+'  trous='+t.HOLES.length
    +'  rampes='+t.RAMPS.length+'  pads='+t.PADS.length+'  huiles='+t.OILS.length+'  plots='+t.CONES.length);
  console.log('  largeur des trous (s1-s0) : '+t.HOLES.map(h=>Math.round(h.s1-h.s0)).join(', '));
  console.log('COURBURE κ (rad/m)  méd='+q(stats.curv,.5).toExponential(2)+'  p90='+q(stats.curv,.9).toExponential(2)+'  p99='+q(stats.curv,.99).toExponential(2));
  console.log('PENTE |T.y|         méd='+q(abs(stats.slope),.5).toFixed(4)+'  p90='+q(abs(stats.slope),.9).toFixed(4)+'  max='+Math.max(...abs(stats.slope)).toFixed(4));
  await b.close();
})();
