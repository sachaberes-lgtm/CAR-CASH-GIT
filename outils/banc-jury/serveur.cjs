/* le serveur statique du banc (2026-11-05, jury Fable) : node outils/banc-jury/serveur.cjs <dossier du dépôt> <port>
   sert tout le dépôt (le jeu est à /VERSION%20PRINCIPALE/index.html), sans cache, avec les plages d'octets (l'audio) ;
   + POST /__ecrit/<nom>.png → VERSION PRINCIPALE/assets/soleil/<nom>.png (le générateur du soleil 1.61, outils/soleil-161/genere.html) */
const http=require('http'),fs=require('fs'),path=require('path');
const racine=process.argv[2]||path.join(__dirname,'..','..'),port=+process.argv[3]||8123;
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript','.cjs':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2','.m4a':'audio/mp4','.mp3':'audio/mpeg','.wav':'audio/wav','.webmanifest':'application/manifest+json','.wasm':'application/wasm'};
http.createServer(function(req,res){
  let p=decodeURIComponent(req.url.split('?')[0]);
  if(req.method==='POST'&&p.startsWith('/__ecrit/')){
    const nom=p.slice(9);if(!/^[a-z0-9-]+\.png$/.test(nom)){res.writeHead(400);res.end('nom');return;}
    const dir=path.join(racine,'VERSION PRINCIPALE','assets','soleil');fs.mkdirSync(dir,{recursive:true});
    const morceaux=[];req.on('data',function(d){morceaux.push(d);});req.on('end',function(){const b=Buffer.concat(morceaux);fs.writeFileSync(path.join(dir,nom),b);res.writeHead(200,{'Content-Type':'text/plain'});res.end('écrit '+nom+' : '+b.length+' octets');});
    return;}
  if(p.endsWith('/'))p+='index.html';
  const f=path.join(racine,p);
  fs.stat(f,function(e,st){
    if(e||!st.isFile()){res.writeHead(404);res.end('404 '+p);return;}
    const ext=path.extname(f).toLowerCase();
    const h={'Content-Type':MIME[ext]||'application/octet-stream','Cache-Control':'no-store','Access-Control-Allow-Origin':'*'};
    const r=/bytes=(\d+)-(\d*)/.exec(req.headers.range||'');
    if(r){const a=+r[1],b=r[2]?+r[2]:st.size-1;h['Content-Range']='bytes '+a+'-'+b+'/'+st.size;h['Content-Length']=b-a+1;res.writeHead(206,h);fs.createReadStream(f,{start:a,end:b}).pipe(res);return;}
    h['Content-Length']=st.size;res.writeHead(200,h);fs.createReadStream(f).pipe(res);
  });
}).listen(port,function(){console.log('serveur du banc sur http://localhost:'+port+'/ ← '+racine);});
