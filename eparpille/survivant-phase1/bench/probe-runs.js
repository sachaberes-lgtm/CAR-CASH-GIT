const {chromium}=require('playwright');const fs=require('fs');
const NR=parseInt(process.argv[2]||'10',10), SEC=parseFloat(process.argv[3]||'60');
(async()=>{
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox']});
  const p=await b.newPage({viewport:{width:200,height:150}});
  p.on('pageerror',e=>console.log('PAGEERROR',e.message.slice(0,160)));
  await p.goto('http://localhost:8899/probe.html',{waitUntil:'load',timeout:90000});
  await p.waitForTimeout(4000);
  await p.evaluate(()=>{window.__norender=true;window.__immortal=true;window.dbgPin(1);});
  const rows=[];
  for(let r=0;r<NR;r++){
    await p.evaluate(()=>{window.__resp=0;window.__go();});
    const res=await p.evaluate(a=>{const [n,step]=a;const curve=[];
      for(let k=0;k<n;k+=step){window.__drive(step,{jump:1});
        const s=window.__surv();curve.push([+s.t.toFixed(1),s.bots.filter(x=>x.alive).length]);
        if(s.over)break;}
      const s=window.__surv();s.curve=curve;s.resp=window.__resp;return s;},[Math.round(SEC*60),300]);
    rows.push(res);
    console.log('run '+String(r+1).padStart(2)+'  t='+res.t.toFixed(0)+'  vivants='+res.bots.filter(x=>x.alive).length
      +'/7  zones='+res.zones+'  respawns_joueur='+res.resp+'  joueur_s='+Math.round(res.s)+'  portails='+res.zonesRun);
  }
  fs.writeFileSync('/home/claude/carcrash/out/real-runs.json',JSON.stringify(rows,null,1));
  const al=rows.map(r=>r.bots.filter(x=>x.alive).length);
  const zo=rows.map(r=>r.zones);
  console.log('\n══ RÉFÉRENCE JEU RÉEL — '+NR+' runs × '+SEC+' s ══');
  console.log('  bots vivants à '+SEC+' s : '+al.join(', ')+'  → moyenne '+(al.reduce((a,c)=>a+c,0)/al.length).toFixed(2)+'/7');
  console.log('  zones enregistrées      : '+zo.join(', ')+'  → moyenne '+(zo.reduce((a,c)=>a+c,0)/zo.length).toFixed(2));
  // courbe moyenne de survie
  const pts={};rows.forEach(r=>r.curve.forEach(([t,a])=>{const b=Math.round(t/10)*10;(pts[b]=pts[b]||[]).push(a);}));
  console.log('  survie moyenne : '+Object.keys(pts).sort((a,b)=>a-b).map(k=>k+'s='+(pts[k].reduce((a,c)=>a+c,0)/pts[k].length).toFixed(1)).join('  '));
  await b.close();
})();
