/* ===== LE SERVEUR-SONDE DE JADE (2026-11-14, diagnostic « variété de forme d'îlot ») =====
   node outils/banc-jade/serveur-sonde.cjs [port] [racine]
   Sert le dépôt comme outils/banc-maps/serveur.cjs, mais AJOUTE À LA VOLÉE (rien n'est écrit sur le disque, le jeu n'est pas modifié) un crochet de lecture
   dans index.html : `window.dbgJadePil()` — la liste des montagnes posées (JADE.col.P : x, z, rayon, pied, sommet, gabarit, quart de tour, renversée, distance
   à la route), la fiche de chaque gabarit (couches, triangles par niveau de détail, octets de sa grille de cubes) et la route échantillonnée.
   Le crochet est posé juste avant `window.dbgJadeProx=function(){` (jade-secoue.js) : même portée que les autres crochets de la map.
   Si un jour le jeu porte lui-même dbgJadePil (plan de correction, étape 0), ce serveur ne sert plus : il n'injecte rien quand le nom existe déjà. */
const http=require('http'),fs=require('fs'),path=require('path');
const PORT=+(process.argv[2]||8360),RACINE=path.resolve(process.argv[3]||path.join(__dirname,'..','..'));
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.gif':'image/gif','.svg':'image/svg+xml','.ico':'image/x-icon','.mp3':'audio/mpeg','.ogg':'audio/ogg','.wav':'audio/wav','.m4a':'audio/mp4','.wasm':'application/wasm','.glb':'model/gltf-binary','.woff':'font/woff','.woff2':'font/woff2','.ttf':'font/ttf','.txt':'text/plain; charset=utf-8'};
const ANCRE='window.dbgJadeProx=function(){';
const SONDE=String(function(){
  if(!JADE.col||!JADE.geos||!(NP>1))return null;
  const r1=function(v){return Math.round(v*10)/10;},ds=L/(NP-1),pas=Math.max(1,Math.round(10/ds)),route=[];
  for(let i=0;i<NP;i+=pas){const p=pts[i],t=T[i],b=B[i],n=Nn[i];route.push([r1(p.x),r1(p.y),r1(p.z),+t.x.toFixed(3),+t.z.toFixed(3),+n.y.toFixed(2)]);}
  let octG=0,triG=[0,0,0,0],triFin=0;
  const tpl=JADE.geos.p.map(function(T9,k){octG+=T9.G.d.length;const tri=T9.geo.map(function(g,j){const n=g.index?g.index.count/3:0;triG[j]+=n;return n;});const f=T9.fin?T9.fin.index.count/3:0;triFin+=f;
    let octGeo=0;for(const g of T9.geo){for(const a in g.attributes)octGeo+=g.attributes[a].array.byteLength;if(g.index)octGeo+=g.index.array.byteLength;}
    return {k:k,H:T9.H,Hb:T9.Hb,yTop:T9.yTop,rmax:r1(T9.rmax),M:T9.M,N:T9.N,graine:T9.graine,tri:tri,fin:f,octGrille:T9.G.d.length,octGeo:octGeo,
      ly:T9.ly.map(function(l){return [l[0],l[1],r1(l[2]-T9.M),r1(l[3]-T9.M),r1(l[4]),l[5]];})};});
  return {VX:VX,VXG:VXG,ntpl:JADE_NTPL,ile0:typeof JADE_ILE0!=='undefined'?JADE_ILE0:-1,v3:typeof JADE_V3!=='undefined'?!!JADE_V3:null,sobre:!!JADE_SOBRE,L:Math.round(L),NP:NP,demi:ROAD_HALF,merY:Math.round(JADE.merY),
    P:JADE.col.P.map(function(q){return [r1(q[0]),r1(q[1]),r1(q[2]),r1(q[3]),r1(q[4]),q[5],q[6],q.inv?1:0,q[8]>1e8?-1:Math.round(q[8])];}),
    tpl:tpl,octGrilles:octG,triGab:triG,triFin:triFin,route:route,pasRoute:+(pas*ds).toFixed(2),
    fam:JADE.fam.length,famInst:JADE.fam.reduce(function(a,F){return a+F.n;},0),
    gabMs:JADE.geos.ms,genMs:JADE.genMs,n:JADE.n};
});
/* dbgJadePan() : les panneaux (arbres, lianes, cristaux) contre le couloir de conduite DANS LE REPÈRE DE LA DALLE (B, Nn) — dbgJadeAudit().panneaux suppose une route à plat
   et se trompe dès que la dalle roule (demi-tonneaux de l'envers). Un panneau = un cylindre vertical de rayon w/2 ; échantillons tous les 2 m de haut, 8 angles + l'axe.
   dans : latéral ≤ demi-largeur + 1, hauteur sur la dalle 0,3 à 7 m, à ±2 m le long de la route. */
const SONDE_PAN=String(function(){
  if(!JADE.audit||!(NP>1))return null;const ds=L/(NP-1),K=30,gr=new Map(),demi=ROAD_HALF;
  for(let i=Math.round(40/ds);i<NP;i+=2){const p=pts[i],k=Math.floor(p.x/K)+','+Math.floor(p.y/K)+','+Math.floor(p.z/K);let a=gr.get(k);if(!a)gr.set(k,a=[]);a.push(i);}
  const dans=function(x,y,z){const bx=Math.floor(x/K),by=Math.floor(y/K),bz=Math.floor(z/K);
    for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++)for(let c=-1;c<=1;c++){const g=gr.get((bx+a)+','+(by+b)+','+(bz+c));if(!g)continue;
      for(const i of g){const p=pts[i],dx=x-p.x,dy=y-p.y,dz=z-p.z,lo=dx*T[i].x+dy*T[i].y+dz*T[i].z;if(lo>2||lo<-2)continue;const la=dx*B[i].x+dy*B[i].y+dz*B[i].z;if(la>demi+1||la<-demi-1)continue;const h=dx*Nn[i].x+dy*Nn[i].y+dz*Nn[i].z;if(h<.3||h>7)continue;return [Math.round(i*ds),+la.toFixed(1),+h.toFixed(1),+Nn[i].y.toFixed(2)];}}
    return null;};
  const o={n:0,parSorte:{},ex:[],total:0};
  for(const [nom,L9] of [['arbre',JADE.audit.arb||[]],['cristal',JADE.audit.cri||[]]])for(const a of L9){o.total++;const w=a.j[0],h=a.j[1],lia=h<0,y0=lia?a.y+h:a.y,y1=lia?a.y:a.y+h*1.1,r=w*.5;let hit=null;
    for(let y=y0;y<=y1&&!hit;y+=2){hit=dans(a.x,y,a.z);for(let k=0;k<8&&!hit;k++)hit=dans(a.x+Math.cos(k*.7854)*r,y,a.z+Math.sin(k*.7854)*r);}
    if(hit){o.n++;const so=lia?'liane':nom;o.parSorte[so]=(o.parSorte[so]||0)+1;if(o.ex.length<16)o.ex.push([so].concat(hit,[Math.round(a.x),Math.round(a.y),Math.round(a.z),+w.toFixed(1),+h.toFixed(1),a.pq?(a.pq.inv?'renversée':'endroit'):'?',a.pq?a.pq[5]:-1]));}}
  return o;});
http.createServer(function(req,res){
  let u;try{u=decodeURIComponent(req.url.split('?')[0]);}catch(e){res.writeHead(400);return res.end('mauvais chemin');}
  if(u.indexOf('..')>=0){res.writeHead(403);return res.end();}
  let f=path.join(RACINE,u);
  fs.stat(f,function(err,st){
    if(!err&&st.isDirectory())f=path.join(f,'index.html');
    fs.readFile(f,function(err2,data){
      if(err2){res.writeHead(404,{'Content-Type':'text/plain'});return res.end('404 '+u);}
      if(/index\.html$/i.test(f)&&/VERSION PRINCIPALE/.test(f)){let s=data.toString('utf8');const i=s.indexOf(ANCRE);
        if(i>=0&&s.indexOf('window.dbgJadePil=')<0){s=s.slice(0,i)+'window.dbgJadePil='+SONDE+';\nwindow.dbgJadePan='+SONDE_PAN+';\n'+s.slice(i);data=Buffer.from(s,'utf8');}
        else if(i<0)console.log('SONDE : ancre introuvable, rien d’injecté');}
      res.writeHead(200,{'Content-Type':MIME[path.extname(f).toLowerCase()]||'application/octet-stream','Cache-Control':'no-store','Access-Control-Allow-Origin':'*'});
      res.end(data);});});
}).listen(PORT,'127.0.0.1',function(){console.log('serveur-sonde de jade : http://127.0.0.1:'+PORT+'/VERSION%20PRINCIPALE/index.html  (racine '+RACINE+')');});
