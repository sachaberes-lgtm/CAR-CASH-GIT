/* serpent-sonde.cjs : lit la sonde du jeu (dbgSerpent) après SEC secondes, à froid, CPU ralenti. usage : node serpent-sonde.cjs <url> <cpu> <secondes> [capture.png]
   (dérivé de serpent-verif.cjs) */
/* Vérifie qu'un démarrage à froid n'a aucune erreur de shader ni de console, que la liaison douce a bien fini, et prend une capture.
   usage : node serpent-verif.cjs <url> <cpu> <secondes> [capture.png] */
'use strict';
const {spawn}=require('child_process'),fs=require('fs'),os=require('os'),path=require('path');
const URL_=process.argv[2],CPU=+process.argv[3]||4,SEC=+process.argv[4]||25,PNG=process.argv[5];
const port=9600+Math.floor(Math.random()*100),dir=fs.mkdtempSync(path.join(os.tmpdir(),'sv-'));
const chrome=spawn(process.env.CHROME||(process.platform==='darwin'?'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome':'C:/Program Files/Google/Chrome/Application/chrome.exe'),['--headless=new','--remote-debugging-port='+port,'--user-data-dir='+dir,...(process.platform==='win32'?['--use-angle=d3d11']:[]),'--window-size=390,844','--no-first-run','--mute-audio','about:blank'],{stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  let tabs;for(let i=0;i<40;i++){try{tabs=await (await fetch('http://127.0.0.1:'+port+'/json')).json();if(tabs.length)break;}catch(e){}await sleep(250);}
  const t=tabs.find(x=>x.type==='page');const ws=new WebSocket(t.webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);
  let id=0;const pend={},logs=[];ws.onmessage=m=>{const d=JSON.parse(m.data);if(d.id&&pend[d.id]){pend[d.id](d);delete pend[d.id];}
    else if(d.method==='Runtime.consoleAPICalled'&&/error|warning/.test(d.params.type))logs.push(d.params.type+': '+d.params.args.map(a=>String(a.value||a.description||'').slice(0,300)).join(' '));
    else if(d.method==='Runtime.exceptionThrown')logs.push('EXC: '+JSON.stringify(d.params.exceptionDetails.exception&&d.params.exceptionDetails.exception.description||d.params.exceptionDetails.text).slice(0,300));
    else if(d.method==='Log.entryAdded'&&/error|warning/.test(d.params.entry.level))logs.push('log '+d.params.entry.level+': '+d.params.entry.text.slice(0,200));};
  const send=(method,params={})=>new Promise(r=>{const i=++id;pend[i]=r;ws.send(JSON.stringify({id:i,method,params}));});
  await send('Page.enable');await send('Runtime.enable');await send('Log.enable');await send('Network.enable');
  await send('Network.setCacheDisabled',{cacheDisabled:true});await send('Network.setBypassServiceWorker',{bypass:true});
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:+(process.env.DSF||3),mobile:true});
  await send('Emulation.setCPUThrottlingRate',{rate:CPU});
  await send('Page.navigate',{url:URL_});
  if(process.env.BLOQUE){await sleep(3000);for(let k=0;k<2;k++){await send('Runtime.evaluate',{expression:'(function(){var t=performance.now();while(performance.now()-t<500);})()'});await sleep(1500);}} /* témoin : deux blocages de 500 ms du fil, la sonde doit les voir */
  await sleep(SEC*1000);
  const ev=async e=>{const r=await send('Runtime.evaluate',{expression:e,returnByValue:true});return r.result&&r.result.result&&r.result.result.value;};
  /* la SONDE du jeu (debut-corps.html) : les trous > 120 ms vus de l'intérieur, avec leur cause ; + la boîte noire (genre « serpent ») */
  const corps=`JSON.stringify({sonde:window.dbgSerpent&&window.dbgSerpent(),boite:(window.dbgErreurs?window.dbgErreurs():[]).filter(function(e){return e.g==='serpent'}).map(function(e){return e.m+(e.o?' ↳ '+e.o:'')}),t:Math.round(performance.now()/100)/10,ready:!!window.__gameReady,serpent:!!document.getElementById('spCharge')})`;
  /* ?tel=1 met le jeu dans l'iframe de la colonne : on cherche la fenêtre qui porte dbgSerpent */
  const expr=`(function(){var W=[window].concat(Array.prototype.slice.call(window.frames));for(var i=0;i<W.length;i++){try{if(W[i].dbgSerpent)return W[i].eval(${JSON.stringify(corps)});}catch(e){}}return '{}';})()`;
  if(process.env.JOUER){ /* JOUER=<secondes> : lance une course (dbgJouer) puis lit dbgFluide() (la sonde de fluidité en course) et la boîte noire */
    console.log('JOUER',await ev(`(function(){var W=[window].concat(Array.prototype.slice.call(window.frames));for(var i=0;i<W.length;i++){try{if(W[i].dbgJouer)return JSON.stringify(W[i].dbgJouer());}catch(e){}}return 'rien';})()`));
    await sleep(+process.env.JOUER*1000);
    console.log('FLUIDE',await ev(`(function(){var W=[window].concat(Array.prototype.slice.call(window.frames));for(var i=0;i<W.length;i++){try{if(W[i].dbgFluide)return JSON.stringify({f:W[i].dbgFluide(),err:W[i].dbgErreurs().filter(function(e){return e.g==='erreur'||e.g==='boucle'||e.g==='panne'}).map(function(e){return e.m}).slice(0,5)},null,1);}catch(e){}}return 'pas de dbgFluide';})()`));
  }
  if(process.env.CHARGE){ /* CHARGE=1 : la durée de chaque étape du chargement (dbgChargement().ms), dans l'ordre */
    console.log('ETAPES',await ev(`(function(){var W=[window].concat(Array.prototype.slice.call(window.frames));for(var i=0;i<W.length;i++){try{if(W[i].dbgChargement)return JSON.stringify(W[i].dbgChargement().ms);}catch(e){}}return 'rien';})()`));
  }
  if(process.env.AUDIO){ /* AUDIO=1 : le coût de `new AudioContext()` seul, dans la page chargée (le 867 ms initial du build 6 : fil libre, cause inconnue) */
    console.log('AUDIOCTX',await ev(`(function(){var t=performance.now(),A=new (window.AudioContext||window.webkitAudioContext)(),d=performance.now()-t;var t2=performance.now();try{A.resume();}catch(e){}return JSON.stringify({construit_ms:Math.round(d),resume_ms:Math.round(performance.now()-t2),etat:A.state})})()`));
  }
  if(process.env.EMPREINTE){ /* EMPREINTE=1 : de quoi comparer deux pistes bâties (même ?pistegraine) : dbgPas() + dbgPiste() + les étapes */
    console.log('EMPREINTE',await ev(`(function(){var W=[window].concat(Array.prototype.slice.call(window.frames));for(var i=0;i<W.length;i++){try{if(W[i].dbgPas)return JSON.stringify({pas:W[i].dbgPas(),piste:W[i].dbgPiste?W[i].dbgPiste():null,etapes:W[i].dbgChargement?W[i].dbgChargement().ms.map(function(e){return e[0]}):null});}catch(e){return 'ERR '+e.message}}return 'rien';})()`));
  }
  if(process.env.DOM){ /* DOM=1 : les enfants directs du body, avec ce qui coûte un layout : affichés (display), cachés autrement (visibility/opacity/hors cadre), nombre de descendants */
    console.log('DOM',await ev(`(function(){var W=[window].concat(Array.prototype.slice.call(window.frames));for(var i=0;i<W.length;i++){try{var w=W[i];if(!w.dbgChargement)continue;var o=[],tot=w.document.body.getElementsByTagName('*').length;Array.prototype.forEach.call(w.document.body.children,function(e){var c=w.getComputedStyle(e),r=e.getBoundingClientRect(),n=e.getElementsByTagName('*').length;if(n>=15||c.display!=='none'&&n>=5)o.push([e.tagName.toLowerCase()+(e.id?'#'+e.id:'')+(e.className&&typeof e.className==='string'?'.'+e.className.split(' ')[0]:''),c.display,c.visibility,c.opacity,c.position,Math.round(r.left)+','+Math.round(r.top)+' '+Math.round(r.width)+'x'+Math.round(r.height),n].join('|'));});return JSON.stringify({total:tot,w:w.innerWidth,h:w.innerHeight,top:o});}catch(e){return 'ERR '+e.message}}return 'rien';})()`));
  }
  if(process.env.BOULE_PNG){ /* BOULE_PNG=<fichier> : fige le film de l'intro à l'instant T (défaut 3,2 s) par dbgIntro.voir et capture l'écran — pour comparer deux plafonds de canevas (?intros=2 / ?intros=1.5) */
    console.log('DPR',await ev(`(function(){var W=[window].concat(Array.prototype.slice.call(window.frames));return JSON.stringify(W.map(function(w){try{return [w.innerWidth,w.innerHeight,w.devicePixelRatio,w.location.search]}catch(e){return 'x'}}));})()`));
    console.log('VOIR',await ev(`(function(){var W=[window].concat(Array.prototype.slice.call(window.frames));for(var i=0;i<W.length;i++){try{if(W[i].dbgIntro){var r=W[i].dbgIntro.voir(${+process.env.T||3.2});return JSON.stringify(r);}}catch(e){return 'ERR '+e.message}}return 'rien';})()`));
    await sleep(800);
    const sh=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(process.env.BOULE_PNG,Buffer.from(sh.result.data,'base64'));console.log('capture',process.env.BOULE_PNG);
  }
  const r=JSON.parse(String(await ev(expr)||'{}'));
  console.log('SONDE',JSON.stringify({t:r.t,gameReady:r.ready,serpentEncorLa:r.serpent,trous:(r.sonde||[]).length}));
  (r.sonde||[]).forEach(x=>console.log('  ',(x.t/1000).toFixed(1)+' s','trou',x.d,'ms · JS',x.js,'· GL',x.gl,x.pile?'('+x.pile+')':'','· fil',x.fil));
  (r.boite||[]).filter(l=>/fin du guet/.test(l)).forEach(l=>console.log('  ',l));
  if(PNG){const s=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(PNG,Buffer.from(s.result.data,'base64'));console.log('capture',PNG);}
  console.log('CONSOLE',logs.length?logs.slice(0,15).join('\n  '):'(aucune erreur ni alerte)');
  ws.close();chrome.kill();setTimeout(()=>process.exit(0),500);
})().catch(e=>{console.error('ERR',e);chrome.kill();process.exit(1);});
