/* serveur statique minimal : node serveur.cjs <dossier> [port] — sert le dossier tel quel (pas de cache) */
const http=require('http'),fs=require('fs'),path=require('path');
const ROOT=path.resolve(process.argv[2]||'.'),PORT=+(process.argv[3]||8123);
const T={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.mp3':'audio/mpeg','.m4a':'audio/mp4','.woff2':'font/woff2','.webmanifest':'application/manifest+json','.wasm':'application/wasm'};
process.on('uncaughtException',e=>{console.error('ERREUR',e&&e.message);});
const srv=http.createServer((req,res)=>{try{
  let u;try{u=decodeURIComponent(req.url.split('?')[0]);}catch(e){u='/';}if(u.endsWith('/'))u+='index.html';
  const f=path.join(ROOT,u);if(!f.startsWith(ROOT)){res.writeHead(403);res.end();return;}
  fs.stat(f,(e,st)=>{try{if(e||!st.isFile()){res.writeHead(404);res.end('404 '+u);return;}
    const ext=path.extname(f).toLowerCase();const h={'Content-Type':T[ext]||'application/octet-stream','Cache-Control':'no-store','Accept-Ranges':'bytes'};
    const rg=/bytes=(\d*)-(\d*)/.exec(req.headers.range||'');
    const s=(a,b)=>{const st9=fs.createReadStream(f,a==null?undefined:{start:a,end:b});st9.on('error',()=>{try{res.end();}catch(_){}});st9.pipe(res);};
    if(rg&&ext!=='.html'){const a=rg[1]?+rg[1]:0,b=rg[2]?+rg[2]:st.size-1;h['Content-Range']='bytes '+a+'-'+b+'/'+st.size;h['Content-Length']=b-a+1;res.writeHead(206,h);s(a,b);return;}
    h['Content-Length']=st.size;res.writeHead(200,h);s();}catch(e2){try{res.writeHead(500);res.end();}catch(_){}}});
  }catch(e){try{res.writeHead(500);res.end();}catch(_){}}});
srv.on('error',e=>console.error('SERVEUR',e&&e.message));
srv.on('clientError',(e,sock)=>{try{sock.destroy();}catch(_){}});
srv.listen(PORT,'127.0.0.1',()=>console.log('http://127.0.0.1:'+PORT+'/ ← '+ROOT));
