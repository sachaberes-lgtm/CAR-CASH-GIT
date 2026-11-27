#!/usr/bin/env node
/* ===== LES PLANCHES D'IMAGES DU JOURNAL (2026-11-27, le lecteur-jure : « On ne voit jamais le jeu ni un bot en train de jouer ») =====
   Node pur, sans dependance nouvelle, sans ffmpeg. Tire des images des films deja faits (ml/labo/videos/*.webm) et les range
   en planche JPEG. AUCUNE course du jeu n'est lancee : on lit seulement un film.

   usage :
     node ml/ecurie/portfolio/figures-journal/planche.js <film.webm> <t1,t2,...> <sortie.jpg>
          [--titre "..."] [--legendes "a|b|..."] [--colonnes 3] [--largeur 420] [--qualite 0.82]
          [--decalage 1.5]            les instants sont en secondes DE COURSE ; on lit le film a t + decalage
          [--droite <film2.webm>]     le DUEL : chaque instant donne une paire, film a gauche, film2 a droite
          [--decalage2 1.5]           le decalage du second film
          [--noms "gauche|droite"]    l'etiquette de chaque cote du duel
          [--sans-heure]              pas d'heure de course dans les legendes
          [--pied "..."]              une ligne en bas de la planche (d'ou viennent les images)

   Comment : un petit serveur LOCAL (127.0.0.1, port libre) sert une page avec <video muted> et un <canvas> ; Chrome sans ecran
   (--headless=new --mute-audio) ouvre la page, se place a chaque instant (currentTime, attendre « seeked »), dessine l'image
   dans le canevas, compose la planche, l'envoie au serveur (POST) qui l'ecrit. Le serveur et Chrome sont fermes a la fin.
   JAMAIS DE SON : video muted, --mute-audio, et les films n'ont pas de piste son. */
const http=require('http'),fs=require('fs'),path=require('path'),os=require('os'),{spawn}=require('child_process');

/* ---------------- les arguments ---------------- */
const A=process.argv.slice(2),pos=[],opt={};
for(let i=0;i<A.length;i++){
  if(A[i].startsWith('--')){const k=A[i].slice(2);if(k==='sans-heure'||k==='nu')opt[k]=true;else opt[k]=A[++i];}
  else pos.push(A[i]);
}
/* un instant s'ecrit « t » (heure de course ; on lit le film a t + decalage) ou « t@f » (on affiche t, on lit le film a f) :
   un film tourne « a la vitesse du jeu » n'a pas un decalage fixe (le jeu prend du retard pendant le chargement d'une map). */
if(pos.length<3){console.error('usage : node planche.js <film.webm> <t1,t2,...> <sortie.jpg> [--titre ..] [--legendes "a|b"] [--colonnes 3] [--largeur 420] [--decalage s] [--droite film2.webm]');process.exit(1);}
const film=path.resolve(pos[0]),sortie=path.resolve(pos[2]);
const instants=pos[1].split(',').map(s=>s.split('@').map(Number)).map(([t,f])=>({t,f:(f===undefined||!isFinite(f))?null:f}));
if(instants.some(x=>!isFinite(x.t))){console.error('instants illisibles : '+pos[1]);process.exit(1);}
const film2=opt.droite?path.resolve(opt.droite):null;
for(const f of [film,film2].filter(Boolean))if(!fs.existsSync(f)){console.error('film introuvable : '+f);process.exit(1);}
const legendes=opt.legendes?opt.legendes.split('|'):[];
const CONF={
  instants,legendes,titre:opt.titre||'',pied:opt.pied||'',
  colonnes:+(opt.colonnes||(film2?1:3)),largeur:+(opt.largeur||(film2?480:420)),qualite:+(opt.qualite||0.82),
  decalage:+(opt.decalage||0),decalage2:+(opt.decalage2||opt.decalage||0),duel:!!film2,
  noms:(opt.noms||'').split('|'),heure:!opt['sans-heure'],nu:!!opt.nu
};
if(CONF.nu&&instants.length!==1){console.error('--nu : un seul instant');process.exit(1);}

/* ---------------- la page (tout dans le navigateur) ---------------- */
const PAGE=`<!doctype html><meta charset="utf-8"><body style="margin:0;background:#000">
<video id="v1" muted playsinline preload="auto" src="/film1.webm"></video>
<video id="v2" muted playsinline preload="auto" ${CONF.duel?'src="/film2.webm"':''}></video>
<canvas id="c"></canvas>
<script>
const C=${JSON.stringify(CONF)};
const dire=(m)=>fetch('/journal',{method:'POST',body:String(m)});
function pret(v){return new Promise((ok,ko)=>{if(v.readyState>=1)return ok();v.onloadedmetadata=()=>ok();v.onerror=()=>ko(new Error('film illisible : '+(v.error&&v.error.message)));});}
/* se placer a l'instant t. Un film filme « a la vitesse du jeu » n'a pas d'index : le saut tombe sur l'image-cle d'avant
   (MESURE : quatre instants a 0,2 s d'ecart donnaient la meme image). On saute donc 1,5 s avant, puis on LIT le film
   (muet) jusqu'a l'image de t : requestVideoFrameCallback donne l'heure exacte de l'image montree. Renvoie cette heure. */
function sauter(v,t){return new Promise(ok=>{v.addEventListener('seeked',()=>ok(),{once:true});v.currentTime=Math.max(0,t);});}
function imageMontree(v){return new Promise(ok=>{let fait=false;v.requestVideoFrameCallback((n,m)=>{fait=true;ok(m.mediaTime);});setTimeout(()=>{if(!fait)ok(v.currentTime);},500);});}
async function aller(v,t){
  t=Math.max(0,Math.min(t,isFinite(v.duration)?v.duration-0.02:t));
  await sauter(v,Math.max(0,t-1.5));
  let m=await imageMontree(v);
  if(m>=t-0.012)return m;
  v.playbackRate=1;
  m=await new Promise(ok=>{
    const suivre=(n,md)=>{ if(md.mediaTime>=t-0.012||v.ended){v.pause();ok(md.mediaTime);} else v.requestVideoFrameCallback(suivre); };
    v.requestVideoFrameCallback(suivre);v.play();
  });
  await new Promise(r=>setTimeout(r,60));
  return m;
}
function heure(t){const m=Math.floor(t/60),s=t-m*60,ss=s.toFixed(1).replace('.',',')+' s';return m?(m+' min '+(s<10?'0':'')+ss):ss;}
function sombre(g,x,y,w,h){g.fillStyle='rgba(0,0,0,.62)';g.fillRect(x,y,w,h);}
/* une image noire ou presque : on le dit au lieu de la ranger sans rien dire */
function noirceur(g,x,y,w,h){const d=g.getImageData(x,y,w,h).data;let s=0;for(let i=0;i<d.length;i+=16)s+=d[i]+d[i+1]+d[i+2];return s/(d.length/16)/3;}
(async()=>{try{
  const v1=document.getElementById('v1'),v2=document.getElementById('v2');
  await pret(v1);if(C.duel)await pret(v2);
  dire('film1 '+v1.videoWidth+'x'+v1.videoHeight+' '+v1.duration.toFixed(2)+' s'+(C.duel?(' ; film2 '+v2.videoWidth+'x'+v2.videoHeight+' '+v2.duration.toFixed(2)+' s'):''));
  const W=C.largeur,H=Math.round(W*v1.videoHeight/v1.videoWidth);
  const parCase=C.duel?2:1,gout=8,marge=C.nu?0:12;
  const fs=Math.max(13,Math.round(W/26));            /* la taille du texte suit celle des vignettes */
  const bandeLeg=C.nu?0:Math.round(fs*1.9);          /* --nu : l'image seule, sans bande ni marge */
  const caseW=W*parCase+(parCase-1)*4,caseH=H+bandeLeg;
  const n=C.instants.length,col=Math.min(C.colonnes,n),lig=Math.ceil(n/col);
  const titreH=C.titre?Math.round(fs*2.6):0,nomsH=(C.duel&&C.noms[0])?Math.round(fs*1.8):0,piedH=C.pied?Math.round(fs*1.8):0;
  const c=document.getElementById('c');
  c.width=marge*2+col*caseW+(col-1)*gout;c.height=marge*2+titreH+nomsH+lig*caseH+(lig-1)*gout+piedH;
  const g=c.getContext('2d');g.fillStyle='#14161b';g.fillRect(0,0,c.width,c.height);
  const police=(p,gras)=>(gras?'600 ':'')+p+'px "Segoe UI", Arial, sans-serif';
  if(C.titre){g.fillStyle='#f2f2f2';g.font=police(Math.round(fs*1.25),true);g.textBaseline='middle';g.fillText(C.titre,marge,marge+titreH/2-2);}
  if(nomsH){g.font=police(fs,true);g.textBaseline='middle';
    for(let k=0;k<parCase;k++){g.fillStyle=k?'#ffd37a':'#8fd1ff';g.fillText(C.noms[k]||'',marge+k*(W+4)+4,marge+titreH+nomsH/2);}}
  const rapport=[];
  for(let i=0;i<n;i++){
    const t=C.instants[i].t,f=C.instants[i].f,cx=marge+(i%col)*(caseW+gout),cy=marge+titreH+nomsH+Math.floor(i/col)*(caseH+gout);
    const vids=C.duel?[[v1,C.decalage],[v2,C.decalage2]]:[[v1,C.decalage]];
    const noir=[],lu=[];
    for(let k=0;k<vids.length;k++){const [v,d]=vids[k];const m=await aller(v,(f!==null&&k===0)?f:t+d);lu.push(m.toFixed(3));
      const x=cx+k*(W+4);g.drawImage(v,x,cy,W,H);noir.push(Math.round(noirceur(g,x,cy,W,H)));}
    rapport.push('t='+t+' image lue a '+lu.join('/')+' s du film, luminosite moyenne '+noir.join('/'));
    if(C.nu)continue;
    sombre(g,cx,cy+H,caseW,bandeLeg);
    g.textBaseline='middle';const ym=cy+H+bandeLeg/2;let x=cx+8;
    if(C.heure){g.font=police(fs,true);g.fillStyle='#ffd37a';const h=heure(t);g.fillText(h,x,ym);x+=g.measureText(h).width+12;}
    g.font=police(fs,false);g.fillStyle='#f2f2f2';
    let leg=C.legendes[i]||'';const place=cx+caseW-8-x;
    while(leg&&g.measureText(leg).width>place)leg=leg.slice(0,-2)+'…';      /* rien ne deborde : on coupe et on le signale */
    if(leg!==(C.legendes[i]||''))rapport.push('legende '+(i+1)+' coupee');
    g.fillText(leg,x,ym);
  }
  if(C.pied){g.font=police(Math.round(fs*.8),false);g.fillStyle='#9aa0aa';g.textBaseline='middle';g.fillText(C.pied,marge,c.height-marge-piedH/2+2);}
  const b=await new Promise(ok=>c.toBlob(ok,'image/jpeg',C.qualite));
  await fetch('/image?rapport='+encodeURIComponent(rapport.join(' ; '))+'&taille='+c.width+'x'+c.height,{method:'POST',body:b});
}catch(e){await fetch('/erreur',{method:'POST',body:String(e&&e.stack||e)});}})();
</script>`;

/* ---------------- le serveur local ---------------- */
function servirFilm(f,req,res){
  const st=fs.statSync(f),r=/bytes=(\d*)-(\d*)/.exec(req.headers.range||'');
  if(!r){res.writeHead(200,{'Content-Type':'video/webm','Content-Length':st.size,'Accept-Ranges':'bytes'});return fs.createReadStream(f).pipe(res);}
  const a=r[1]?+r[1]:0,z=r[2]?Math.min(+r[2],st.size-1):st.size-1;
  res.writeHead(206,{'Content-Type':'video/webm','Content-Length':z-a+1,'Content-Range':'bytes '+a+'-'+z+'/'+st.size,'Accept-Ranges':'bytes'});
  fs.createReadStream(f,{start:a,end:z}).pipe(res);
}
const profil=fs.mkdtempSync(path.join(os.tmpdir(),'planche-chrome-'));
let chrome=null,fini=false;
function finir(code){if(fini)return;fini=true;clearTimeout(minuterie);try{chrome&&chrome.kill();}catch(e){}
  serveur.close();setTimeout(()=>{try{fs.rmSync(profil,{recursive:true,force:true});}catch(e){}process.exit(code);},800);}
const serveur=http.createServer((req,res)=>{
  if(req.socket.remoteAddress!=='127.0.0.1'&&req.socket.remoteAddress!=='::ffff:127.0.0.1'){res.writeHead(403);return res.end();}
  const u=new URL(req.url,'http://127.0.0.1');
  if(u.pathname==='/')return res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'}),res.end(PAGE);
  if(u.pathname==='/film1.webm')return servirFilm(film,req,res);
  if(u.pathname==='/film2.webm'&&film2)return servirFilm(film2,req,res);
  if(req.method==='POST'){const morceaux=[];req.on('data',d=>morceaux.push(d));req.on('end',()=>{
    const corps=Buffer.concat(morceaux);res.writeHead(200);res.end('ok');
    if(u.pathname==='/journal')console.log('  '+corps.toString());
    else if(u.pathname==='/erreur'){console.error('ERREUR dans la page : '+corps.toString());finir(2);}
    else if(u.pathname==='/image'){fs.mkdirSync(path.dirname(sortie),{recursive:true});fs.writeFileSync(sortie,corps);
      console.log('  '+(u.searchParams.get('rapport')||'').split(' ; ').join('\n  '));
      console.log('ecrit : '+sortie+' · '+u.searchParams.get('taille')+' · '+Math.round(corps.length/1024)+' Ko');finir(0);}
  });return;}
  res.writeHead(404);res.end();
});
const minuterie=setTimeout(()=>{console.error('trop long (240 s) : abandon');finir(3);},240000);
serveur.listen(0,'127.0.0.1',()=>{
  const port=serveur.address().port;
  const exe=process.env.CHROME||'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  chrome=spawn(exe,['--headless=new','--mute-audio','--disable-gpu-sandbox','--no-first-run','--no-default-browser-check',
    '--disable-extensions','--disable-background-networking','--disable-sync','--metrics-recording-only','--autoplay-policy=no-user-gesture-required',
    '--user-data-dir='+profil,'http://127.0.0.1:'+port+'/'],{stdio:'ignore'});
  chrome.on('exit',()=>{if(!fini){console.error('Chrome s\'est ferme avant la fin');finir(4);}});
});
