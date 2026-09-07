const {chromium}=require('playwright');const fs=require('fs');
(async()=>{
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox']});
  const p=await b.newPage({viewport:{width:320,height:240}});
  await p.goto('http://localhost:8899/probe.html',{waitUntil:'load',timeout:90000});
  await p.waitForTimeout(4000);
  const rows=[];
  for(let i=0;i<14;i++){
    if(i)await p.evaluate(()=>window.__newTrack());
    const r=await p.evaluate(()=>{const t=window.__track(),st=window.__stats();
      const q=(a,f)=>{const s=a.slice().sort((x,y)=>x-y);return s[Math.min(s.length-1,Math.floor(s.length*f))];};
      const abs=a=>a.map(Math.abs);
      return {L:t.L,NP:t.NP,holes:t.HOLES.length,hw:t.HOLES.map(h=>Math.round(h.s1-h.s0)),
        ramps:t.RAMPS.length,pads:t.PADS.length,oils:t.OILS.length,cones:t.CONES.length,
        kMed:q(st.curv,.5),k90:q(st.curv,.9),k99:q(st.curv,.99),
        sMed:q(abs(st.slope),.5),s90:q(abs(st.slope),.9),sMax:Math.max(...abs(st.slope))};});
    rows.push(r);
    console.log(String(i+1).padStart(2)+'  L='+String(Math.round(r.L)).padStart(5)+'  NP='+String(r.NP).padStart(5)
      +'  trous='+r.holes+' ['+r.hw.join(',')+']'.padEnd(4)
      +'  pads='+String(r.pads).padStart(3)+'  huiles='+String(r.oils).padStart(2)+'  plots='+String(r.cones).padStart(4)
      +'  κméd='+r.kMed.toExponential(1)+'  κ90='+r.k90.toExponential(1)
      +'  pente_méd='+r.sMed.toFixed(3)+'  p90='+r.s90.toFixed(3)+'  max='+r.sMax.toFixed(2));
  }
  fs.writeFileSync('/home/claude/carcrash/out/real-tracks.json',JSON.stringify(rows,null,1));
  const avg=k=>rows.reduce((a,b)=>a+b[k],0)/rows.length;
  console.log('\nMOYENNES sur '+rows.length+' pistes : L='+Math.round(avg('L'))+'  NP='+Math.round(avg('NP'))
    +'  trous='+avg('holes').toFixed(2)+'  pads='+avg('pads').toFixed(1)+'  huiles='+avg('oils').toFixed(1)+'  plots='+avg('cones').toFixed(0)
    +'\n  κ méd='+avg('kMed').toExponential(2)+'  κ p90='+avg('k90').toExponential(2)
    +'\n  pente méd='+avg('sMed').toFixed(3)+'  p90='+avg('s90').toFixed(3));
  console.log('  pistes SANS aucun trou : '+rows.filter(r=>r.holes===0).length+'/'+rows.length);
  await b.close();
})();
