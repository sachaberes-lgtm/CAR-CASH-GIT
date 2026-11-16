/* ===== LE SERVEUR-SONDE DU BANC DES NUAGES (2026-11-14, diagnostic « nuages : debugging + traversée ») =====
   node outils/banc-nuages/serveur-sonde.cjs [port] [racine]
   Sert le dépôt comme outils/banc-maps/serveur.cjs, mais glisse UNE ligne dans index.html AU VOL (le fichier du disque n'est pas touché) :
   au début de cotonPouf, `window.__NU` reçoit les tables internes des nuages (COTON, NUA_POUF, NCB, NHOLE, N8_U, POUF_GPU, CLOUDS…) — le jeu
   est une seule fonction fermée, rien n'en sort autrement. La ligne ne change RIEN au comportement (une affectation, une fois).
   Si le point d'ancrage n'est plus dans index.html, le serveur le dit sur chaque requête d'index (en-tête X-Sonde: absente). */
const http=require('http'),fs=require('fs'),path=require('path');
const PORT=+(process.argv[2]||8340),RACINE=path.resolve(process.argv[3]||path.join(__dirname,'..','..'));
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.gif':'image/gif','.svg':'image/svg+xml','.ico':'image/x-icon','.mp3':'audio/mpeg','.ogg':'audio/ogg','.wav':'audio/wav','.m4a':'audio/mp4','.wasm':'application/wasm','.glb':'model/gltf-binary','.woff':'font/woff','.woff2':'font/woff2','.ttf':'font/ttf','.txt':'text/plain; charset=utf-8'};
const ANCRE='function cotonPouf(cp,dt){';
const SONDE="if(!window.__NU)window.__NU={COTON:COTON,COTON_ST:COTON_ST,NUA_POUF:NUA_POUF,NUA_MOD:NUA_MOD,NCB:NCB,NHOLE:NHOLE,N8_U:N8_U,POUF_GPU:POUF_GPU,CLOUDS:CLOUDS,GFX_U:GFX_U,NUVIT:NUVIT,st:function(){return {cloudIn:cloudIn,cloudInS:cloudInS,mode:mode,s:s,lat:lat,vA:vA,SPD:SPD,ALLEGE:ALLEGE,fogN:scene.fog?scene.fog.near:0,fogF:scene.fog?scene.fog.far:0};}};";
http.createServer(function(req,res){
  let u;try{u=decodeURIComponent(req.url.split('?')[0]);}catch(e){res.writeHead(400);return res.end('mauvais chemin');}
  if(u.indexOf('..')>=0){res.writeHead(403);return res.end();}
  let f=path.join(RACINE,u);
  fs.stat(f,function(err,st){
    if(!err&&st.isDirectory())f=path.join(f,'index.html');
    fs.readFile(f,function(err2,data){
      if(err2){res.writeHead(404,{'Content-Type':'text/plain'});return res.end('404 '+u);}
      const h={'Content-Type':MIME[path.extname(f).toLowerCase()]||'application/octet-stream','Cache-Control':'no-store','Access-Control-Allow-Origin':'*'};
      if(/VERSION PRINCIPALE[\\/]index\.html$/.test(f)){let t=data.toString('utf8');const i=t.indexOf(ANCRE);
        if(i>=0){t=t.slice(0,i+ANCRE.length)+SONDE+t.slice(i+ANCRE.length);h['X-Sonde']='posee';}else h['X-Sonde']='absente';data=Buffer.from(t,'utf8');}
      res.writeHead(200,h);res.end(data);});});
}).listen(PORT,'127.0.0.1',function(){console.log('serveur-sonde des nuages : http://127.0.0.1:'+PORT+'/VERSION%20PRINCIPALE/index.html  (racine '+RACINE+')');});
