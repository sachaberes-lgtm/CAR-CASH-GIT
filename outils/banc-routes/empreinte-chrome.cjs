/* ===== L'EMPREINTE EN CHROME (2026-11-14, pro-ville : copie du juge commun dont la mesure est remplacée par une empreinte FNV des points ctrl0/ctrl/N de dbgGenRoute — couvre la ville vitrée, que empreinte.cjs ne sait pas charger). Fabriqué par fabrique-empreinte-chrome.cjs. ===== LE BANC JUGE (2026-11-13, supervision des routes : passation/CHARTE-ROUTES.md) =====
   Le MÊME juge pour les six maps : charge le vrai jeu d'un worktree en Chrome headless, tire dbgGenRoute(carte, graine, palier), et mesure chaque route
   avec les définitions communes de la charte (juge-page.js). Rien n'est écrit dans le worktree jugé.
   node outils/banc-juge/juge.cjs --racine=<worktree> [--cartes=nuages,espace,grotte,ville,crypto,canyon,jade] [--paliers=0,10,20] [--graines=1-8]
        [--extra=&sans=…] [--port=…] [--cdp=…] [--out=<dossier>] [--nom=<étiquette>]
   Sortie : une ligne par route, puis le BILAN par map et palier (pire cas, moyennes, ✓/✗ par règle) ; le JSON complet dans --out. */
const {spawn}=require('child_process'),fs=require('fs'),os=require('os'),path=require('path'),http=require('http');
const opt={};for(const a of process.argv.slice(2)){const m=/^--([^=]+)=?(.*)$/.exec(a);if(m)opt[m[1]]=m[2]===''?'1':m[2];}
const RACINE=path.resolve(opt.racine||path.join(__dirname,'..','..'));
const CARTES=(opt.cartes||'nuages,espace,grotte,ville,crypto,canyon,jade').split(',');
const PALIERS=(opt.paliers||'0,10,20').split(',').map(Number);
const [g0,g1]=(opt.graines||'1-8').split('-').map(Number);const GRAINES=[];for(let g=g0;g<=(g1||g0);g++)GRAINES.push(g);
const NOM=opt.nom||path.basename(RACINE);
const OUT=path.resolve(opt.out||path.join(os.tmpdir(),'cc-juge',NOM));fs.mkdirSync(OUT,{recursive:true});
const PORT=+(opt.port||0)||8600+Math.floor(Math.random()*300),CDP=+(opt.cdp||0)||9600+Math.floor(Math.random()*300);
const CHROME=process.env.CHROME||'C:/Program Files/Google/Chrome/Application/chrome.exe';
const dort=ms=>new Promise(r=>setTimeout(r,ms));
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.wasm':'application/wasm','.mp3':'audio/mpeg','.ogg':'audio/ogg','.m4a':'audio/mp4','.woff2':'font/woff2','.glb':'model/gltf-binary','.bin':'application/octet-stream','.ktx2':'image/ktx2'};
const srv=http.createServer(function(req,res){let u;try{u=decodeURIComponent(req.url.split('?')[0]);}catch(e){res.writeHead(400);return res.end();}
  if(u.indexOf('..')>=0){res.writeHead(403);return res.end();}let f=path.join(RACINE,u);
  fs.stat(f,function(err,st){if(!err&&st.isDirectory())f=path.join(f,'index.html');fs.readFile(f,function(e2,d){if(e2){res.writeHead(404);return res.end('404');}
    res.writeHead(200,{'Content-Type':MIME[path.extname(f).toLowerCase()]||'application/octet-stream','Cache-Control':'no-store'});res.end(d);});});}).listen(PORT,'127.0.0.1');
function getJson(u,m){return new Promise((ok,ko)=>{const r=http.request(u,{method:m||'GET'},r=>{let b='';r.on('data',d=>b+=d);r.on('end',()=>{try{ok(JSON.parse(b));}catch(e){ko(e);}});});r.on('error',ko);r.end();});}
let chrome=null;const udd=fs.mkdtempSync(path.join(os.tmpdir(),'cc-juge-'));
function fin(){try{srv.close();}catch(e){}if(chrome){try{chrome.kill();}catch(e){}try{require('child_process').spawnSync('taskkill',['/F','/T','/PID',String(chrome.pid)],{stdio:'ignore'});}catch(e){}chrome=null;}try{fs.rmSync(udd,{recursive:true,force:true});}catch(e){}}
process.on('SIGINT',()=>{fin();process.exit(1);});
(async function(){
  chrome=spawn(CHROME,['--headless=new','--remote-debugging-port='+CDP,'--user-data-dir='+udd,'--no-first-run','--no-default-browser-check','--window-size=844,390','--mute-audio',
    '--disable-background-timer-throttling','--disable-renderer-backgrounding','--disable-backgrounding-occluded-windows','about:blank'],{stdio:'ignore'});
  let ok=false;for(let i=0;i<150;i++){try{await getJson('http://127.0.0.1:'+CDP+'/json/version');ok=true;break;}catch(e){await dort(200);}}
  if(!ok)throw new Error('Chrome ne répond pas sur '+CDP);
  const t=await getJson('http://127.0.0.1:'+CDP+'/json/new?about:blank','PUT');
  const ws=new WebSocket(t.webSocketDebuggerUrl);await new Promise((a,b)=>{ws.onopen=a;ws.onerror=b;});
  let n=0;const att={},erreurs=[];
  ws.onmessage=m=>{const r=JSON.parse(m.data);if(r.id&&att[r.id]){const a=att[r.id];delete att[r.id];r.error?a.ko(new Error(JSON.stringify(r.error))):a.ok(r.result);}
    else if(r.method==='Runtime.exceptionThrown'){const d=r.params.exceptionDetails;erreurs.push(String((d.exception&&(d.exception.description||d.exception.value))||d.text).split('\n')[0].slice(0,200));}};
  const call=(m,p)=>new Promise((ok2,ko)=>{const id=++n;att[id]={ok:ok2,ko};ws.send(JSON.stringify({id,method:m,params:p||{}}));});
  const ev=async(expr)=>{const r=await call('Runtime.evaluate',{expression:expr,awaitPromise:true,returnByValue:true,timeout:600000});if(r.exceptionDetails)throw new Error((r.exceptionDetails.exception&&r.exceptionDetails.exception.description)||r.exceptionDetails.text);return r.result.value;};
  await call('Page.enable');await call('Runtime.enable');await call('Network.enable');await call('Network.setBypassServiceWorker',{bypass:true});
  await call('Emulation.setDeviceMetricsOverride',{width:844,height:390,deviceScaleFactor:1,mobile:false});
  /* le navigateur du banc est MUET (sfx, mus, vox coupés) et le joueur n'est pas neuf */
  await call('Page.addScriptToEvaluateOnNewDocument',{source:`try{if(!sessionStorage.__j){sessionStorage.__j=1;const s=JSON.parse(localStorage.cashcarSave||'{}');Object.assign(s,{v:s.v||2,tuto:1,permis:1,bienv:1,sfx:false,mus:false,vox:false});localStorage.cashcarSave=JSON.stringify(s);}}catch(e){}`});
  const url=`http://127.0.0.1:${PORT}/VERSION%20PRINCIPALE/index.html?colonne=0&intro=ancien&attente=0${opt.extra||''}`;
  await call('Page.navigate',{url});
  let pret=false;for(let i=0;i<240;i++){try{if(await ev('typeof dbgGenRoute==="function"&&!!window.__gameReady')){pret=true;break;}}catch(e){}await dort(500);}
  if(!pret){try{pret=await ev('typeof dbgGenRoute==="function"');}catch(e){}}
  if(!pret)throw new Error('dbgGenRoute absent : index.html assemblé ? '+erreurs.slice(0,3).join(' | '));
  await ev(`window.__emp=function(o){if(!o||o.erreur)return {erreur:String(o&&o.erreur).slice(0,160)};let h=0x811c9dc5,n=0;const s=JSON.stringify([o.ctrl0,o.ctrl,o.N]);for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)>>>0;}return {carte:o.carte,points:(o.ctrl0||[]).length,emp:h.toString(16),long:s.length};};1`);
  const sw=(()=>{try{return (/cashcar-v(\d+)/.exec(fs.readFileSync(path.join(RACINE,'VERSION PRINCIPALE','sw.js'),'utf8'))||[])[1];}catch(e){return '?';}})();
  console.log(`JUGE · ${NOM} · ${RACINE} · cache v${sw} · cartes ${CARTES.join(',')} · paliers ${PALIERS.join(',')} · graines ${GRAINES[0]}-${GRAINES[GRAINES.length-1]}`);
  const tout=[];const t0=Date.now();
  for(const carte of CARTES)for(const pal of PALIERS)for(const g of GRAINES){
    let r;try{r=await ev(`JSON.stringify(__emp(dbgGenRoute(${JSON.stringify(carte)},${g},${pal})))`);r=JSON.parse(r);}catch(e){r={erreur:String(e.message).slice(0,200)};}
    r.carte=r.carte||carte;r.palier=pal;r.graine=g;tout.push(r);
    if(r.erreur){console.log(`${carte.padEnd(7)} p${String(pal).padEnd(2)} g${g}  ERREUR ${r.erreur}`);continue;}
    console.log(`${carte.padEnd(7)} p${String(pal).padEnd(2)} g${String(g).padEnd(2)} points ${r.points} emp ${r.emp} long ${r.long}`);continue;
    console.log(`${carte.padEnd(7)} p${String(pal).padEnd(2)} g${String(g).padEnd(2)} ${String(r.dur).padStart(5)}s cap30 ${String(r.t30).padStart(5)}s droit8 ${String(r.t8).padStart(4)}s roulis ${String(r.rollMax).padStart(3)}/${String(r.rollP95).padStart(3)}°/s envers ${String(r.envers).padStart(4)}% (${r.enversMaxS}s) pente ${String(r.penteMoy).padStart(5)}% act ${String(r.activite).padStart(4)}°/s mods ${String(r.nMods).padStart(2)} trou ${String(r.gapMax).padStart(4)}s rac ${r.rac}(${r.racRobustes}) saut ${String(r.sautable).padStart(5)}% plis ${String(r.plis).padStart(2)} dMin ${String(r.dMin).padStart(4)} gen ${r.genMs}ms`);
  }
  fs.writeFileSync(path.join(OUT,'juge.json'),JSON.stringify({nom:NOM,racine:RACINE,sw:sw,date:new Date().toISOString(),routes:tout,erreursPage:erreurs.slice(0,20)},null,1));
  /* LE BILAN par map × palier : la règle de la charte, pire cas sur les graines */
  const lignes=[];const ok9=(b)=>b?'✓':'✗';
  for(const carte of CARTES)for(const pal of PALIERS){
    const rs=tout.filter(r=>r.carte===carte&&r.palier===pal&&!r.erreur);const nE=tout.filter(r=>r.carte===carte&&r.palier===pal&&r.erreur).length;
    if(!rs.length){lignes.push(`${carte} p${pal} : ${nE} erreurs, rien de mesuré`);continue;}
    const mx=k=>Math.max.apply(null,rs.map(r=>r[k])),mn=k=>Math.min.apply(null,rs.map(r=>r[k])),moy=k=>+(rs.reduce((a,r)=>a+r[k],0)/rs.length).toFixed(1);
    /* R5 entre graines : modules partagés par deux graines voisines (Jaccard), modules différents sur toutes */
    let jac=0;const tous=new Set();for(let i=0;i<rs.length;i++){for(const x of rs[i].noms)tous.add(x);if(i){const A=new Set(rs[i-1].nomsVar||rs[i-1].noms),Bs=new Set(rs[i].nomsVar||rs[i].noms);let inter=0;for(const x of A)if(Bs.has(x))inter++;const uni=new Set([...A,...Bs]).size;jac=Math.max(jac,uni?inter/uni:0);}}
{let s9=0,n9=0;for(let a=0;a<rs.length;a++)for(let b=a+1;b<rs.length;b++){const A=new Set(rs[a].nomsVar||rs[a].noms),B9=new Set(rs[b].nomsVar||rs[b].noms);let k9=0;for(const x of A)if(B9.has(x))k9++;const u9=new Set([...A,...B9]).size;s9+=u9?k9/u9:0;n9++;}jac=n9?s9/n9:0;} /* (13/11, CANYON et ESPACE) en jeu la graine est tirée au hasard : on mesure la moyenne de TOUTES les paires, pas le pire des graines voisines */
    const nomsOk=rs.every(r=>r.nomsAbsents===0&&r.nMods>0);
    const R={
      R1:mx('t30')<=10&&moy('t30')<=7, R2:mx('t8')<=5&&moy('t8')<=3, R3:mx('rollMax')<=60&&mx('rollP95')<=45,
      R4:mx('gapMax')<=15&&(pal>0||mn('nMods')>=4), R5:nomsOk&&mx('repDeSuite')===0&&mx('maxMeme')<=2&&jac<=.5&&(pal>0||tous.size>=12),
      R6:pal>0||(mn('rac')>=2&&mn('racRobustes')>=1), R7:mn('sautable')>=(pal>=20?55:pal>=10?65:75), R8:mx('envers')<=25&&mx('enversMaxS')<=9.5, R10:nE===0&&mn('dMin')>=8};
    lignes.push(`${carte.padEnd(7)} p${String(pal).padEnd(2)} ${rs.length}/${rs.length+nE} | R1 cap30 max ${mx('t30')} moy ${moy('t30')} ${ok9(R.R1)} | R2 droit8 max ${mx('t8')} moy ${moy('t8')} ${ok9(R.R2)} | R3 roulis max ${mx('rollMax')} p95 ${mx('rollP95')} ${ok9(R.R3)} | R4 trou max ${mx('gapMax')}s mods min ${mn('nMods')} ${ok9(R.R4)} | R5 ${nomsOk?'':'NOMS ABSENTS '}rép ${mx('repDeSuite')} même ${mx('maxMeme')} jac ${jac.toFixed(2)} diff ${tous.size} ${ok9(R.R5)} | R6 rac min ${mn('rac')} moy ${moy('rac')} robustes min ${mn('racRobustes')} ${ok9(R.R6)} | R7 saut min ${mn('sautable')}% moy ${moy('sautable')}% ${ok9(R.R7)} | R8 envers max ${mx('envers')}% tenue ${mx('enversMaxS')}s ${ok9(R.R8)} | R10 dMin ${mn('dMin')} err ${nE} ${ok9(R.R10)} | pente moy ${moy('penteMoy')}% act ${moy('activite')}°/s durée ${moy('dur')}s`);
  }
  const bilan='BILAN · '+NOM+' · cache v'+sw+' · '+((Date.now()-t0)/1000).toFixed(0)+' s\n'+lignes.join('\n');
  console.log('\n'+bilan);fs.writeFileSync(path.join(OUT,'BILAN.txt'),bilan+'\n');
  if(erreurs.length)console.log('erreurs de la page :',erreurs.slice(0,5).join(' | '));
  console.log('→',OUT);
  try{ws.close();}catch(e){}
})().catch(e=>{console.log('ERREUR',e&&e.message||e);process.exitCode=1;}).finally(fin);
