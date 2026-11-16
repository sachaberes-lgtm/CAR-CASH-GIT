/* ===== LE BANC DES TEXTURES DU CANYON (2026-11-14, Sacha : « canyon est très buggé dans les textures ») =====
   Chrome headless (CDP, muet). Le jeu n'est PAS modifié : tout passe par les crochets dbg* et par dbgScene() (la scène, la caméra, le renderer) —
   les variantes retouchent à chaud le programme de la roche (une copie de son fragment shader) pour ATTRIBUER un défaut à sa cause.

   node outils/banc-maps/serveur.cjs 8310 <worktree>          (le serveur du dépôt)
   node outils/banc-routes/canyon-textures.cjs --meteo=soir --graine=7 --s=1270,2590 [--auto=1] [--variantes=lit,rc,sansardoise,…]
        [--tel=1] [--q=cydet=1] [--port=8310] [--cdp=9512] [--profil=pro-canyon] [--out=dossier] [--roule=1]
   · --s=…      : les abscisses (l'œil du joueur dans le repère de la dalle : dbgCanyonVoute('vueS', s), en pause) ; --auto=1 ajoute une abscisse au milieu de chaque
                  gabarit de la route (dbgCanyonGab : mur, phrase, tube, galerie, fente…) et de chaque tube.
   · --variantes : en plus de la photo de base, une photo par variante (même cadre) :
       lit, rk, rc, col, N, stp, Lc, dk, ndl, veg (rouge = ripisylve, vert = eau, bleu = replat), wat : une grandeur du shader affichée à la place de l'image (vues de diagnostic)
       sansardoise, sansphares, sansfilons, sanscases, sanscannelures, sanslit (lit = 1), sansbrume
       det0, det1                    : dbgCyDet(0|1)
       terrain (le décor caché), decor (le relief caché)
   · --patch=f.json : des variantes de plus, { nom : [[de, vers], …] } — des remplacements dans le fragment de la roche (pour essayer une retouche sans toucher au jeu) ;
                  --mesurevar=nom : --mesure et la photo « base » se font AVEC cette variante (chiffrer un essai).
   · --roule=1  : avant la pause, la caisse est posée à s − 60 m (dbgJadeAller) et roule 1,6 s au pilote auto : une photo EN ROULANT (caméra du jeu, flou compris).
   · --jsfile=f : une expression évaluée dans la page après chaque vue (son résultat dans « js »).
   · --clip=x,y,l,h,zoom : les photos ne gardent que ce rectangle de l'écran, agrandi (regarder un détail).
   · --mesure=1 : par vue, sur les pixels de ROCHE (masque rendu à part) : part de noir, de fluo, luma moyenne, fourmillement (voir MESURE).
   · --cout=1   : à chaque abscisse, le compteur du renderer (triangles, appels) et l'image figée re-rendue 60 fois avec lecture d'un pixel (médiane ms).
   Sortie : <out>/<tag>-s<abscisse>-<variante>.png et <out>/<tag>.json (sonde de la route, gabarit, compteurs). */
const {spawn}=require('child_process'),fs=require('fs'),os=require('os'),path=require('path'),http=require('http');
const CHROME=process.env.CHROME||'C:/Program Files/Google/Chrome/Application/chrome.exe';
const opt={};for(const a of process.argv.slice(2)){const m=/^--([a-zA-Z]+)=(.*)$/.exec(a);if(m)opt[m[1]]=m[2];}
const PORT=+(opt.port||8310),CDP=+(opt.cdp||9512),METEO=opt.meteo||'soir',GRAINE=+(opt.graine||7),TEL=opt.tel==='1';
const OUT=path.resolve(opt.out||path.join(__dirname,'sorties','canyon-textures'));fs.mkdirSync(OUT,{recursive:true});
const TAG=(opt.tag||('cy-'+METEO+'-g'+GRAINE+(TEL?'-tel':'')));
const VARS=(opt.variantes||'').split(',').filter(Boolean);
const URL=(opt.url||('http://127.0.0.1:'+PORT+'/VERSION%20PRINCIPALE/index.html'))+'?intro=ancien&attente=0&prebati=0&carte=canyon&meteo='+METEO+'&pistegraine='+GRAINE+(TEL?'&tel=1':'&colonne=0&poste=max')+(opt.q?'&'+opt.q:'');
const dort=(ms)=>new Promise(r=>setTimeout(r,ms));const log=function(){console.log.apply(console,arguments);};
function getJson(u){return new Promise((ok,ko)=>http.get(u,r=>{let b='';r.on('data',d=>b+=d);r.on('end',()=>{try{ok(JSON.parse(b));}catch(e){ko(e);}});}).on('error',ko));}
function putJson(u){return new Promise((ok,ko)=>{const r=http.request(u,{method:'PUT'},r=>{let b='';r.on('data',d=>b+=d);r.on('end',()=>{try{ok(JSON.parse(b));}catch(e){ko(e);}});});r.on('error',ko);r.end();});}
let chrome=null;
async function lanceChrome(){const udd=path.join(os.tmpdir(),'cc-banc-'+(opt.profil||'pro-canyon')+(TEL?'-tel':''));fs.mkdirSync(udd,{recursive:true});
  chrome=spawn(CHROME,['--headless=new','--remote-debugging-port='+CDP,'--user-data-dir='+udd,'--no-first-run','--no-default-browser-check','--window-size=1280,800','--mute-audio',
    '--autoplay-policy=no-user-gesture-required','--use-angle=d3d11','--ignore-gpu-blocklist','--enable-gpu-rasterization','--disable-background-timer-throttling','--disable-renderer-backgrounding',
    '--disable-backgrounding-occluded-windows','about:blank'],{stdio:'ignore'});
  for(let i=0;i<150;i++){try{await getJson('http://127.0.0.1:'+CDP+'/json/version');return;}catch(e){await dort(200);}}throw new Error('Chrome ne répond pas sur '+CDP);}
function tueChrome(){if(!chrome)return;try{require('child_process').spawnSync('taskkill',['/F','/T','/PID',String(chrome.pid)],{stdio:'ignore'});}catch(e){}chrome=null;}
class Page{constructor(ws){this.ws=ws;this.n=0;this.att={};this.err=[];
    ws.onmessage=(m)=>{const r=JSON.parse(m.data);if(r.id&&this.att[r.id]){const a=this.att[r.id];delete this.att[r.id];r.error?a.ko(new Error(JSON.stringify(r.error))):a.ok(r.result);}
      else if(r.method==='Runtime.consoleAPICalled'){const p=r.params;if(p.type==='error'||p.type==='warning'){const t=p.args.map(a=>a.value!==undefined?String(a.value):(a.description||a.type)).join(' ');this.err.push(p.type+' '+t.slice(0,400));}}
      else if(r.method==='Runtime.exceptionThrown'){const d=r.params.exceptionDetails;this.err.push('EXCEPTION '+String((d.exception&&(d.exception.description||d.exception.value))||d.text).split('\n').slice(0,2).join(' | '));}};}
  call(m,p){return new Promise((ok,ko)=>{const id=++this.n;this.att[id]={ok,ko};this.ws.send(JSON.stringify({id,method:m,params:p||{}}));});}
  async ev(expr,timeout){const r=await this.call('Runtime.evaluate',{expression:expr,awaitPromise:true,returnByValue:true,timeout:timeout||120000});if(r.exceptionDetails)throw new Error('page : '+((r.exceptionDetails.exception&&r.exceptionDetails.exception.description)||r.exceptionDetails.text));return r.result.value;}
  async attend(expr,ms,pas){const t0=Date.now();while(Date.now()-t0<(ms||60000)){try{if(await this.ev('!!('+expr+')'))return true;}catch(e){}await dort(pas||250);}return false;}
  async photo(f){const q={format:'png'};if(opt.clip){const c=opt.clip.split(',').map(Number);q.clip={x:c[0],y:c[1],width:c[2],height:c[3],scale:c[4]||1};}const r=await this.call('Page.captureScreenshot',q);fs.writeFileSync(f,Buffer.from(r.data,'base64'));return f;}}
/* ---- dans la page ---- */
const MASQUE=String(function(){const st=document.createElement('style');st.textContent='#hud,.hud,#hudTop,#hudFig,#pauseBtn,#gHud,[id^=hud]{visibility:hidden!important}';document.head.appendChild(st);return 1;});
/* les matières de la roche (toutes celles dont le fragment lit uSTR) : leur fragment d'origine gardé, une retouche posée ou retirée */
const PATCH=opt.patch?JSON.parse(fs.readFileSync(opt.patch,'utf8')):{},MVAR=opt.mesurevar||null;
const VARIANTE=String(function(nom,PATCH){PATCH=PATCH||window.__cyPatch||{};
  const S=window.dbgScene().scene,mats=[];S.traverse(function(m){const M=m.material;if(M&&M.isShaderMaterial&&M.fragmentShader&&M.fragmentShader.indexOf('uSTR')>=0&&mats.indexOf(M)<0)mats.push(M);});
  const relief=S.getObjectByName('canyon'),decor=S.getObjectByName('canyon décor');
  if(relief)relief.visible=true;if(decor)decor.visible=true;
  let n=0,manque=0;
  const VUES={lit:'vec3(lit)',rk:'vec3(rk)',rc:'rc',col:'col',N:'N*.5+.5',stp:'vec3(stp)',Lc:'Lc*.5',dk:'vec3(dk)',veg:'vec3(veg,wat,top)',wat:'vec3(wat)',ndl:'vec3(ndl)',eau:'vec3(vA.x,vA.y*.1,fract(vWL*.05))'};
  const RET={sansardoise:['c=mix(c,vec3(dot(c,vec3(.30,.55,.15)))*vec3(.82,.90,1.08),om);',''],sansphares:['*hlMonde(vW,N);','*0.;'],sansfilons:['c+=vec3(1.,.72,.22)*vz','c+=0.*vec3(1.,.72,.22)*vz'],
    sanscases:['eg)','eg*0.+1.)'],sanscannelures:['float fx=wl*rk*','float fx=0.*wl*rk*'],sanslit:['lit=clamp(vA.w,0.,1.)','lit=1.'],sansbrume:['c=mix(c,uMist,uQ.x*','c=mix(c,uMist,0.*uQ.x*']};
  for(const M of mats){if(M.__fs0==null)M.__fs0=M.fragmentShader;let f=M.__fs0;
    if(nom==='masque'){const a='gl_FragColor=vec4(c,1.);';f=f.split(a).join('gl_FragColor=vec4(8.,0.,8.,1.);').split('#include <fog_fragment>').join('');}
    if(nom&&VUES[nom]){const a='gl_FragColor=vec4(c,1.);';if(f.indexOf(a)<0)manque++;f=f.split(a).join('gl_FragColor=vec4('+VUES[nom]+',1.);').split('#include <fog_fragment>').join('');}
    else if(nom&&RET[nom]){if(f.indexOf(RET[nom][0])<0)manque++;f=f.split(RET[nom][0]).join(RET[nom][1]);}
    else if(nom&&PATCH[nom]){for(const q of PATCH[nom]){if(f.indexOf(q[0])<0)manque++;f=f.split(q[0]).join(q[1]);}}
    if(f!==M.fragmentShader){M.fragmentShader=f;M.needsUpdate=true;n++;}}
  if(nom==='terrain'&&decor)decor.visible=false;if(nom==='decor'&&relief)relief.visible=false;
  return {mats:mats.length,change:n,manque:manque};});
const INFO=String(function(s9){const o={};try{o.sonde=dbgCanyonSonde(s9,0);}catch(e){o.sonde=String(e);}
  try{const G=dbgCanyonGab();o.gab=G.filter(function(z){return s9>=z.a&&s9<=z.b;}).map(function(z){return z.t;});}catch(e){}
  try{const R=window.dbgScene().rdr.info;o.tri=R.render.triangles;o.appels=R.render.calls;o.geo=R.memory.geometries;o.tex=R.memory.textures;o.prog=R.programs?R.programs.length:null;}catch(e){}
  try{o.cyErr=window.__cyErr?String(window.__cyErr.message||window.__cyErr):null;}catch(e){}return o;});
/* l'image figée : la même vue re-rendue n fois, chaque fois suivie d'une lecture d'un pixel (le GPU doit finir) — médiane en ms ; et le compte d'UNE image (autoReset coupé) */
const FIGEE=String(function(s9,n){const D=window.dbgScene(),R=D.rdr,gl=R.getContext(),px=new Uint8Array(4),t=[];
  const ar=R.info.autoReset;R.info.autoReset=false;R.info.reset();dbgCanyonVoute('vueS',s9);const tri=R.info.render.triangles,ap=R.info.render.calls;R.info.autoReset=ar;
  for(let i=0;i<n;i++){const t0=performance.now();dbgCanyonVoute('vueS',s9);gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,px);t.push(performance.now()-t0);}
  t.sort(function(a,b){return a-b;});return {ms:+t[n>>1].toFixed(2),p10:+t[Math.floor(n*.1)].toFixed(2),p90:+t[Math.floor(n*.9)].toFixed(2),tri:tri,appels:ap};});
/* la mesure d'une vue (déterministe : la pause, un cadre fixe) : le MASQUE de la roche (ses matières rendues en magenta uni), puis l'image, lue dans le tampon de dessin —
   sur les pixels de roche : la part de NOIR (luma < 10 et < 20 sur 255), de FLUO (un canal > 235 et un autre < 40), la luma moyenne ; et le FOURMILLEMENT : la même vue
   0,5 m plus loin, l'écart moyen par pixel de roche (sur 255) — une texture stable glisse d'une fraction de pixel, une texture qui saute de case change d'un coup */
const MESURE=String(function(s9,VARIANTE,MVAR){const D=window.dbgScene(),R=D.rdr,gl=R.getContext(),W=gl.drawingBufferWidth,H=gl.drawingBufferHeight;
  const lit=function(){const b=new Uint8Array(W*H*4);gl.readPixels(0,0,W,H,gl.RGBA,gl.UNSIGNED_BYTE,b);return b;};
  VARIANTE('masque');dbgCanyonVoute('vueS',s9);const M=lit();VARIANTE(MVAR);dbgCanyonVoute('vueS',s9);const A=lit();dbgCanyonVoute('vueS',s9+.5);const B=lit();dbgCanyonVoute('vueS',s9);
  let n=0,n10=0,n20=0,fl=0,sl=0,sd=0;for(let i=0;i<W*H;i++){const o=i*4;if(!(M[o]>150&&M[o+1]<90&&M[o+2]>150))continue;n++;const r=A[o],g=A[o+1],b=A[o+2],l=.2126*r+.7152*g+.0722*b;sl+=l;if(l<10)n10++;if(l<20)n20++;
    const mx=Math.max(r,g,b),mn=Math.min(r,g,b);if(mx>235&&mn<40)fl++;sd+=(Math.abs(r-B[o])+Math.abs(g-B[o+1])+Math.abs(b-B[o+2]))/3;}
  return {roche:+(n/(W*H)).toFixed(3),noir10:n?+(n10/n).toFixed(4):null,noir20:n?+(n20/n).toFixed(4):null,fluo:n?+(fl/n).toFixed(4):null,luma:n?+(sl/n).toFixed(1):null,fourmille:n?+(sd/n).toFixed(2):null};});
(async function(){await lanceChrome();const bilan={url:URL,vues:[]};
  try{const t=await putJson('http://127.0.0.1:'+CDP+'/json/new?about:blank');const ws=new WebSocket(t.webSocketDebuggerUrl);await new Promise((o,k)=>{ws.onopen=o;ws.onerror=k;});
    const p=new Page(ws);await p.call('Runtime.enable');await p.call('Page.enable');await p.call('Network.enable');await p.call('Network.setBypassServiceWorker',{bypass:true});
    if(TEL){await p.call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:2,mobile:true});await p.call('Emulation.setTouchEmulationEnabled',{enabled:true});}
    else await p.call('Emulation.setDeviceMetricsOverride',{width:1280,height:800,deviceScaleFactor:1,mobile:false});
    await p.call('Page.addScriptToEvaluateOnNewDocument',{source:"try{localStorage.clear();localStorage.setItem('cashcarSave',JSON.stringify({v:2,tuto:1,plq:{m:'fr',x:'BANC',ok:1},bank:50000,ex:{runs:3},sfx:false,mus:false,vox:false}));}catch(e){}"});
    await p.call('Page.navigate',{url:URL});if(!await p.attend('window.__gameReady',180000))throw new Error('__gameReady jamais levé');
    for(let i=0;i<60&&await p.ev('!!window.__introCouvre');i++){await p.call('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter'});await p.call('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter'});await dort(400);}
    await p.attend("document.body.classList.contains('titreCiel')",60000);
    for(let i=0;i<8&&await p.ev("!!document.getElementById('splash')");i++){await p.ev("(function(){const e=document.getElementById('splash');try{e.click();}catch(x){}})()");await dort(500);}
    let st=false;for(let k=0;k<3&&!st;k++){await p.ev('dbgJouer()');st=await p.attend('window.dbgState&&dbgState().started&&dbgState().running',k?20000:45000);}
    if(!st)throw new Error('course pas lancée');
    await p.ev("window.dbgAuto&&dbgAuto(1,0,{nit:0})");if(!TEL&&opt.qual!=='0')await p.ev("(function(){try{dbgQual(0);}catch(e){}})()");
    await p.ev('window.__cyPatch='+JSON.stringify(PATCH));await p.ev('('+MASQUE+')()');await dort(+(opt.attente||5)*1000);
    bilan.niveau=await p.ev("(function(){try{const n=dbgRoute().niveau;return {carte:n.carte,meteo:n.meteo,L:Math.round(dbgRoute().L)};}catch(e){return String(e);}})()");
    bilan.gab=await p.ev("(function(){try{return dbgCanyonGab().map(function(z){return {t:z.t,a:Math.round(z.a),b:Math.round(z.b)};});}catch(e){return String(e);}})()");
    bilan.tubes=await p.ev("(function(){try{return dbgCanyonVoute().tubes||null;}catch(e){return String(e);}})()");
    bilan.det=await p.ev("(function(){try{return dbgCyDet();}catch(e){return String(e);}})()");
    log('NIVEAU',JSON.stringify(bilan.niveau),'· gabarits',JSON.stringify(bilan.gab),'· tubes',JSON.stringify(bilan.tubes),'· détail',JSON.stringify(bilan.det));
    let LS=(opt.s||'').split(',').filter(Boolean).map(Number);
    if(opt.auto==='1'){if(Array.isArray(bilan.gab))for(const z of bilan.gab){LS.push(Math.round((z.a+z.b)/2));LS.push(Math.round(z.a+30));}if(Array.isArray(bilan.tubes))for(const v of bilan.tubes){LS.push(v[0]-90);LS.push(v[0]+40);LS.push(Math.round((v[0]+v[1])/2));LS.push(v[1]+60);}}
    LS=Array.from(new Set(LS.filter(function(x){return x>20&&x<bilan.niveau.L-60;}))).sort(function(a,b){return a-b;});if(opt.max)LS=LS.slice(0,+opt.max);
    for(const s9 of LS){const v={s:s9};
      if(opt.roule==='1'){try{await p.ev("(function(){if(dbgState().paused){const b=document.getElementById('pauseBtn');}return dbgJadeAller("+Math.max(10,s9-60)+");})()");await dort(1600);v.roule=path.basename(await p.photo(path.join(OUT,TAG+'-s'+s9+'-roule.png')));}catch(e){v.rouleErr=String(e.message||e);}}
      await p.ev('('+VARIANTE+')('+JSON.stringify(MVAR)+')');v.vue=await p.ev("dbgCanyonVoute('vueS',"+s9+")");await dort(500);await p.ev("dbgCanyonVoute('vueS',"+s9+")");await dort(300);
      v.base=path.basename(await p.photo(path.join(OUT,TAG+'-s'+s9+'-base.png')));v.info=await p.ev('('+INFO+')('+s9+')');
      if(opt.mesure==='1')v.mesure=await p.ev('('+MESURE+')('+s9+','+VARIANTE+','+JSON.stringify(MVAR)+')',180000);
      if(opt.cout==='1')v.cout=await p.ev('('+FIGEE+')('+s9+',60)',180000);
      for(const nom of VARS){let r=null;
        if(nom==='det0'||nom==='det1'){await p.ev('('+VARIANTE+')(null)');r=await p.ev('dbgCyDet('+nom.slice(3)+')');}else r=await p.ev('('+VARIANTE+')('+JSON.stringify(nom)+')');
        await p.ev("dbgCanyonVoute('vueS',"+s9+")");await dort(700);await p.ev("dbgCanyonVoute('vueS',"+s9+")");await dort(300);
        await p.photo(path.join(OUT,TAG+'-s'+s9+'-'+nom+'.png'));v[nom]=r;
        if(nom==='det0'||nom==='det1')await p.ev('dbgCyDet('+bilan.det.base+')');}
      await p.ev('('+VARIANTE+')(null)');
      if(opt.jsfile){try{v.js=await p.ev(fs.readFileSync(opt.jsfile,'utf8'),120000);}catch(e){v.js='erreur : '+e.message;}}
      log('VUE',JSON.stringify(v));bilan.vues.push(v);}
    bilan.err=p.err.slice(0,20);log('ERREURS',JSON.stringify(bilan.err));
    fs.writeFileSync(path.join(OUT,TAG+'.json'),JSON.stringify(bilan,null,1));
  }catch(e){log('ÉCHEC',String(e&&e.stack||e));process.exitCode=1;}
  finally{tueChrome();log('FIN');}
})();
