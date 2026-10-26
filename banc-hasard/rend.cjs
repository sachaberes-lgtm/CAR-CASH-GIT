// node rend.cjs <fichier.svg|html> <sortie.png> [largeur] [portChrome] — une photo d'une page locale (NON COMMITÉ)
const fs=require('fs'),path=require('path'),{chrome,tue,dort}=require('./cdp.cjs');
(async()=>{const f=path.resolve(process.argv[2]),o=process.argv[3],w=+process.argv[4]||1500,pc=+process.argv[5]||9638;
  const c=await chrome(pc,{tmp:path.join(__dirname,'tmp'),w,h:900});await c.send('Page.enable');
  await c.send('Page.navigate',{url:'file://'+f});await dort(1500);
  const h=await c.ev('Math.ceil(document.documentElement.getBoundingClientRect().height||document.documentElement.scrollHeight)');
  await c.send('Emulation.setDeviceMetricsOverride',{width:w,height:Math.min(16000,h||900),deviceScaleFactor:1,mobile:false});await dort(500);
  const r=await c.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});fs.writeFileSync(o,Buffer.from(r.data,'base64'));console.log('ok',o,h);tue();process.exit(0);
})().catch(e=>{console.error(e);tue();process.exit(1);});
