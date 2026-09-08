#!/usr/bin/env node
/* ================================================================================================
   SERVEUR D'ENREGISTREMENT — sert le jeu ET recoit les demos
   ------------------------------------------------------------------------------------------------
   Un `python -m http.server` ne sait que SERVIR : la demo finirait dans le dossier Telechargements,
   a deplacer a la main apres chaque partie. Ici, POST /rec-save ecrit directement dans
   results/demos/. Un double-clic sur ENREGISTRER.bat, on joue, on appuie sur E : le fichier est
   au bon endroit.
   (Le jeu sait se replier sur un telechargement classique si ce serveur n'est pas la.)
   ================================================================================================ */
const http=require('http'),fs=require('fs'),path=require('path'),url=require('url');
const ROOT=__dirname;
const DEMOS=path.join(ROOT,'results','demos');
const PORT=parseInt(process.env.PORT||'8766',10);
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript','.json':'application/json',
  '.css':'text/css','.mp3':'audio/mpeg','.png':'image/png','.jpg':'image/jpeg','.woff2':'font/woff2',
  '.svg':'image/svg+xml','.ico':'image/x-icon','.webmanifest':'application/manifest+json'};

fs.mkdirSync(DEMOS,{recursive:true});

http.createServer((req,res)=>{
  const u=url.parse(req.url,true);
  // ---- reception d'une demo ----
  if(req.method==='POST'&&u.pathname==='/rec-save'){
    let raw='';
    req.on('data',c=>{ raw+=c; if(raw.length>80e6){ res.writeHead(413);res.end();req.destroy(); } });
    req.on('end',()=>{
      // le nom vient du navigateur : on n'en garde que le squelette attendu, jamais un chemin
      const safe=String(u.query.name||'').replace(/[^A-Za-z0-9._-]/g,'');
      const name=/^demo-[0-9-]+\.json$/.test(safe)?safe:('demo-'+Date.now()+'.json');
      try{
        JSON.parse(raw);                       // on ne stocke pas du JSON casse
        fs.writeFileSync(path.join(DEMOS,name),raw);
        console.log('  demo recue : results/demos/'+name+'  ('+(raw.length/1024|0)+' Ko)');
        res.writeHead(200,{'Content-Type':'application/json'});res.end('{"ok":true}');
      }catch(e){
        console.error('  demo REFUSEE ('+e.message+')');
        res.writeHead(400);res.end('{"ok":false}');
      }
    });
    return;
  }
  // ---- reception du CHAMPION (mode entrainement) ----
  // Trouve par Sacha le 2026-09-09 : le mode entrainement n ecrivait RIEN. Deux runs a la
  // generation 139 et 148 ont ete perdus en rechargeant. Ici le champion atterrit sur le disque,
  // et train.html repart de lui a la generation 0 : la progression s accumule enfin.
  if(req.method==='POST'&&u.pathname==='/train-save'){
    let raw='';
    req.on('data',c=>{ raw+=c; if(raw.length>20e6){ res.writeHead(413);res.end();req.destroy(); } });
    req.on('end',()=>{
      try{
        const j=JSON.parse(raw);
        if(!Array.isArray(j.w)||!j.w.length) throw new Error('pas de poids');
        fs.mkdirSync(path.join(ROOT,'results'),{recursive:true});
        fs.writeFileSync(path.join(ROOT,'results','champion.json'),raw);
        // …et une copie horodatee : on ne veut plus jamais ECRASER un bon cerveau par un moins bon
        const hist=path.join(ROOT,'results','champions');
        fs.mkdirSync(hist,{recursive:true});
        fs.writeFileSync(path.join(hist,'gen'+String(j.gen||0).padStart(5,"0")+'-note'+(j.note||0)+'.json'),raw);
        console.log('  champion recu : gen '+j.gen+', note '+j.note+' ('+(raw.length/1024|0)+' Ko)');
        res.writeHead(200,{'Content-Type':'application/json'});res.end('{"ok":true}');
      }catch(e){
        console.error('  champion REFUSE ('+e.message+')');
        res.writeHead(400);res.end('{"ok":false}');
      }
    });
    return;
  }
  // ---- service statique ----
  let p=decodeURIComponent(u.pathname);
  if(p==='/')p='/train.html';
  const full=path.join(ROOT,path.normalize(p).replace(/^([\\/]|\.\.)+/,''));
  if(!full.startsWith(ROOT)){ res.writeHead(403);res.end();return; }       // pas de sortie du dossier
  fs.readFile(full,(e,buf)=>{
    if(e){ res.writeHead(404);res.end('introuvable : '+p);return; }
    res.writeHead(200,{'Content-Type':MIME[path.extname(full).toLowerCase()]||'application/octet-stream',
                       'Cache-Control':'no-store'});
    res.end(buf);
  });
}).listen(PORT,()=>{
  console.log('Serveur d enregistrement sur http://localhost:'+PORT);
  console.log('Les demos arrivent dans : '+DEMOS);
  console.log('Ouvre http://localhost:'+PORT+'/train.html?rec=1 puis appuie sur E.');
});
