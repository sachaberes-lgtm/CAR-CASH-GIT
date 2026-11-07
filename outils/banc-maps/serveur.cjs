/* ===== LE SERVEUR DU BANC DES MAPS (2026-11-07) =====
   node outils/banc-maps/serveur.cjs [port] [racine]   — sert le dépôt en http (par défaut : port 8201, la racine = le dépôt de ce fichier).
   Pas de cache (le disque fait foi), les chemins avec espaces (« VERSION PRINCIPALE ») passent par decodeURIComponent. */
const http=require('http'),fs=require('fs'),path=require('path');
const PORT=+(process.argv[2]||8201),RACINE=path.resolve(process.argv[3]||path.join(__dirname,'..','..'));
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.cjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.gif':'image/gif','.svg':'image/svg+xml','.ico':'image/x-icon','.mp3':'audio/mpeg','.ogg':'audio/ogg','.wav':'audio/wav','.m4a':'audio/mp4','.wasm':'application/wasm','.glb':'model/gltf-binary','.gltf':'model/gltf+json','.woff':'font/woff','.woff2':'font/woff2','.ttf':'font/ttf','.txt':'text/plain; charset=utf-8','.md':'text/plain; charset=utf-8','.webmanifest':'application/manifest+json','.map':'application/json'};
http.createServer(function(req,res){
  let u;try{u=decodeURIComponent(req.url.split('?')[0]);}catch(e){res.writeHead(400);return res.end('mauvais chemin');}
  if(u.indexOf('..')>=0){res.writeHead(403);return res.end();}
  let f=path.join(RACINE,u);
  fs.stat(f,function(err,st){
    if(!err&&st.isDirectory())f=path.join(f,'index.html');
    fs.readFile(f,function(err2,data){
      if(err2){res.writeHead(404,{'Content-Type':'text/plain'});return res.end('404 '+u);}
      res.writeHead(200,{'Content-Type':MIME[path.extname(f).toLowerCase()]||'application/octet-stream','Cache-Control':'no-store','Access-Control-Allow-Origin':'*'});
      res.end(data);});});
}).listen(PORT,'127.0.0.1',function(){console.log('serveur du banc : http://127.0.0.1:'+PORT+'/VERSION%20PRINCIPALE/index.html  (racine '+RACINE+')');});
