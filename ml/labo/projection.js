#!/usr/bin/env node
/* ===== LA SALLE DE PROJECTION (2026-11-24, etape 1 bis BOTS-ML : « les videos — un rejeu relance dans le vrai jeu avec l'image, filme » ;
   « filmer sans ffmpeg : piste, l'enregistreur video du navigateur branche sur l'image du jeu ») =====
   Un petit serveur LOCAL (rien ne sort du PC). Il sert le vrai jeu a un navigateur, avec les regles du simulateur (projection/prelude.js :
   horloge du jeu, hasard a graine, aucun son, aucune entree), et la page qui y remet les touches d'un rejeu, image par image.
   usage : node projection.js [--port 3161]     puis ouvrir http://localhost:3161/
     /                              la liste des rejeux gardes, et l'arbre
     /projection?rejeu=<course>     rejoue la course avec l'image    [&mode=cerveau : le cerveau conduit en direct au lieu des touches]
                                    [&film=1 : filme l'image du jeu, 60 images/s exactes → videos/<course>.webm ; &film=direct : a la vitesse du jeu]   [&cadence=libre : aussi vite que possible, sans film]
   A la fin d'une projection, la page renvoie l'etat de la caisse a chaque decision : le serveur le compare a la meme course rejouee sans
   ecran (rejouer.js --serie) et dit si l'image montre LA MEME course, ou a quelle seconde elles se separent (tampon/projection-<course>.json). */
const http=require('http'),fs=require('fs'),path=require('path'),{spawnSync}=require('child_process');
const L=require('./labo');
const {nomsHautNiveau,REQUETE,REQUETES}=require('../reel/jeu-reel');
const {PORTES}=require('../reel/sim-env-reel');
const A=process.argv.slice(2),opt=(n,d)=>{const i=A.indexOf('--'+n);return i>=0?A[i+1]:d;};
const PORT=+opt('port',process.env.PORT||3161),JEU=path.join(L.DEPOT,'VERSION PRINCIPALE'),ML=path.join(L.DEPOT,'ml'),ICI=path.join(__dirname,'projection');
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png',
  '.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.webm':'video/webm','.mp3':'audio/mpeg','.ogg':'audio/ogg','.wav':'audio/wav',
  '.woff2':'font/woff2','.woff':'font/woff','.ttf':'font/ttf','.glb':'model/gltf-binary','.gz':'application/gzip','.webmanifest':'application/manifest+json'};

/* LA PAGE DU JEU, telle que le simulateur la charge : les memes scripts (three, figures.js, le script principal — plus les passes
   d'image de vendor/, qui ne touchent qu'au rendu), les memes portes de lecture a la fin du script principal, et le prelude en premier.
   Les sons, la musique et les creatures de decor ne sont pas charges : le simulateur ne les charge pas non plus. */
function pageJeu(){
  let html=fs.readFileSync(path.join(JEU,'index.html'),'utf8');
  const blocs=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)],b=blocs.find(m=>m[1].includes('survTick')&&m[1].includes('buildTrack'));
  if(!b)throw new Error('script principal introuvable dans index.html');
  const k9=b.index+'<script>'.length+b[1].lastIndexOf('})();');
  html=html.slice(0,k9)+PORTES+html.slice(k9);
  html=html.replace(/<script([^>]*?)\ssrc="([^"]+)"([^>]*)><\/script>/g,(m,a,src)=>/^(vendor\/|figures\.js)/.test(src)?m:'<!-- (projection) pas charge, comme dans le simulateur : '+src+' -->');
  return html.replace(/<head>/i,'<head><script src="/__labo/prelude.js"></script><style>#splash{display:none!important}</style>');
}
/* (2026-11-24, defaut 11) VRAIMENT DANS LE DOSSIER : `startsWith(racine)` laissait passer un voisin au nom qui commence pareil (ml/labo-xxx) */
const dedans=(racine,f)=>{const r=path.relative(racine,f);return !!r&&!r.startsWith('..')&&!path.isAbsolute(r);};
/* un module de ml/ (CommonJS) emballe pour la page : le MEME fichier que celui que Node charge (un .js de ml/ ou du labo, rien d'autre) */
function module9(f){
  const base=path.resolve(f.startsWith('labo:')?path.join(L.RACINE,f.slice(5)):path.join(ML,f)),ok=/\.js$/i.test(base)&&(dedans(ML,base)||dedans(L.RACINE,base));
  if(!ok||!fs.existsSync(base))return null;
  /* (2026-11-25, Sacha veut tester les bots : la page s'arretait sur « __dirname is not defined ») un module de Node peut lire __dirname des
     son chargement (piloter.js, labo.js) : la page lui donne son dossier, en chemin du depot (les lectures de fichiers y sont vides) */
  const rel=path.relative(L.DEPOT,base).split(path.sep).join('/');
  return '__def('+JSON.stringify(f)+',function(module,exports,require){var __filename='+JSON.stringify(rel)+',__dirname='+JSON.stringify(rel.replace(/\/[^/]*$/,''))+';'+fs.readFileSync(base,'utf8')+'\n});';
}
function statique(racine,rel,res,transforme,req){
  const f=path.resolve(racine,decodeURIComponent(rel));
  if(!dedans(racine,f)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.writeHead(404);res.end('introuvable');return;}
  let d=fs.readFileSync(f);if(transforme)d=Buffer.from(transforme(d.toString('utf8')));
  const type=MIME[path.extname(f).toLowerCase()]||'application/octet-stream',plage=/^bytes=(\d*)-(\d*)$/.exec((req&&req.headers.range)||'');
  /* un film se lit par morceaux : sans les « plages », le navigateur ne peut pas s'y deplacer (MESURE : le saut a 38 s revenait a 0).
     (2026-11-24, defaut 9) la regex cherchait des lettres « d » (`d*` au lieu de `\d*`) : aucune plage n'etait jamais servie, toujours 200. */
  if(plage&&(plage[1]||plage[2])){let a=plage[1]?+plage[1]:d.length-(+plage[2]),b=plage[1]&&plage[2]?+plage[2]:d.length-1;a=Math.max(0,a);b=Math.min(d.length-1,b);
    if(a>b){res.writeHead(416,{'Content-Range':'bytes */'+d.length});return res.end();}
    res.writeHead(206,{'Content-Type':type,'Content-Range':'bytes '+a+'-'+b+'/'+d.length,'Accept-Ranges':'bytes','Content-Length':b-a+1,'Cache-Control':'no-store'});return res.end(d.subarray(a,b+1));}
  res.writeHead(200,{'Content-Type':type,'Accept-Ranges':'bytes','Content-Length':d.length,'Cache-Control':'no-store'});res.end(d);
}
const corps=req=>new Promise(ok=>{const B=[];req.on('data',c=>B.push(c));req.on('end',()=>ok(Buffer.concat(B)));});
/* (2026-11-24, defaut 11 : « le nom de course venu de l'URL allait BRUT dans des chemins ecrits : c0001-g910592/../../../ ecrivait hors du tampon »)
   LE NOM D'UNE COURSE est nettoye UNE FOIS, a l'entree, et seul ce nom sert ensuite (lire le rejeu, ecrire la serie, le bilan, le film). */
const nomCourse9=n=>String(n==null?'':n).replace(/[^a-z0-9-]/gi,'').slice(0,80);
const rejeuDe=n=>{n=nomCourse9(n);if(!n)return null;const f=path.join(L.D.rejeux,n+'.json');return fs.existsSync(f)?f:null;};
const lisJson=f=>{try{return JSON.parse(fs.readFileSync(f,'utf8'));}catch(e){return null;}};

/* LA COURSE SANS ECRAN, rejouee une fois (un processus neuf) et gardee au tampon : sa serie (l'etat de la caisse a chaque decision) sert a la
   comparaison, son hasard (l'etat du generateur a chaque image et a chaque construction de route) sert a recaler le navigateur.
   (2026-11-24, defaut 10 : « la serie gardee n'etait jamais refaite quand le jeu change ») elle est REFAITE si elle est plus vieille que le rejeu
   ou que le code qui rejoue, OU si elle a ete faite sur une autre version du jeu (empreinte de index.html + figures.js). Un rejeu enregistre
   sur une autre version ne se rejoue pas du tout (il ne peut pas redonner sa course : 1 a 2 minutes de calcul pour rien). */
const CODE_REJEU=[path.join(__dirname,'rejouer.js'),path.join(__dirname,'labo.js')].concat(['piloter','yeux','doigts','mesures'].map(n=>path.join(ML,'bot',n+'.js')),
  ['jeu-reel','sim-env-reel'].map(n=>path.join(ML,'reel',n+'.js')));
function sansEcran(nom){
  nom=nomCourse9(nom);const f=rejeuDe(nom);if(!f)return null;
  const R=lisJson(f),v=L.versionJeu();if(!R||!R.jeu||R.jeu.sha!==v.sha)return null;
  fs.mkdirSync(L.D.tampon,{recursive:true});
  const ref=path.join(L.D.tampon,'serie-'+nom+'.json'),date=g=>fs.existsSync(g)?fs.statSync(g).mtimeMs:0;
  const bon=()=>{if(!fs.existsSync(ref))return null;const t=date(ref);if(t<date(f)||CODE_REJEU.some(g=>t<date(g)))return null;
    const j=lisJson(ref);return j&&j.jeu&&j.jeu.sha===v.sha&&j.hasard?j:null;};
  let j=bon();
  if(!j){spawnSync(process.execPath,[path.join(__dirname,'rejouer.js'),f,'--serie',ref],{stdio:'ignore'});j=bon();}
  return j;
}
/* LA COMPARAISON : la serie de la page contre celle de la course sans ecran */
function compare(R){
  if(!R||typeof R!=='object'||!Array.isArray(R.serie))return {erreur:'resultat illisible (il faut la serie de la page)'};
  R.rejeu=nomCourse9(R.rejeu);R.mode=R.mode==='cerveau'?'cerveau':'touches';
  const ref0=sansEcran(R.rejeu);if(!ref0)return {erreur:'la course sans ecran n\'a pas pu etre rejouee (rejeu inconnu, ou enregistre sur une autre version du jeu)'};
  const S0=ref0.serie,S1=R.serie,n=Math.min(S0.length,S1.length);
  let k=-1;for(let i=0;i<n;i++){if(JSON.stringify(S0[i])!==JSON.stringify(S1[i])){k=i;break;}}
  /* l'ecart qui compte a l'oeil : de combien de metres les deux courses different, a chaque decision */
  let pire=0;for(let i=0;i<n;i++)if(S0[i][1]===S1[i][1])pire=Math.max(pire,Math.abs(S0[i][2]-S1[i][2]),Math.abs(S0[i][3]-S1[i][3]));
  const d=S0[S0.length-1],v=S1[S1.length-1]||[];
  const bilan={rejeu:R.rejeu,mode:R.mode,date:new Date().toISOString(),jeu:L.versionJeu(),
    exact:k<0&&S0.length===S1.length,decisions:[S0.length,S1.length],
    premiereDifference:k<0?null:{decision:k,image:S0[k][0],seconde:+(S0[k][0]/60).toFixed(2),sansEcran:S0[k],avecImage:S1[k]},
    ecartMaxMetres:+pire.toFixed(2),fin:{sansEcran:{mode:d[1],s:d[2],argent:d[6]},avecImage:{mode:v[1],s:v[2],argent:v[6]}},
    aide:'serie : [image, mode, s, lat, vitesse, nitro, argent] a chaque decision (10 par seconde)',
    imageCoupee:R.imageCoupee|0, /* le canevas a ete lache par la carte graphique pendant la projection : la course ne vaut pas */
    recale:R.recale!==false,
    /* le controle du hasard : les images ou le navigateur n'a pas tire autant de nombres que le simulateur (0 = le recalage n'a rien eu a faire) */
    hasard:R.hasard||null,imagesParSeconde:R.imagesParSeconde,duree_s:R.duree_s,film:R.film||null};
  L.ecrireAtomique(path.join(L.D.tampon,'projection-'+R.rejeu+(R.mode==='cerveau'?'-cerveau':'')+'.json'),JSON.stringify(bilan,null,1));
  return bilan;
}
/* ===== ECRIRE UN .WEBM A LA MAIN (pas de ffmpeg sur ce PC) =====
   Le navigateur encode chaque image (VP9) ; ici on les range dans le conteneur WebM (Matroska) : un en-tete, la piste video, un index
   (pour se deplacer dans le film), puis les images par paquets de 2 s, chacune a SA date — n / 60 s, exactement. */
const vint=n=>{for(let l=1;l<=8;l++)if(n<Math.pow(2,7*l)-1){const b=Buffer.alloc(l);let v=n;for(let i=l-1;i>=0;i--){b[i]=v%256;v=Math.floor(v/256);}b[0]|=1<<(8-l);return b;}throw new Error('trop gros');};
const el=(id,d)=>Buffer.concat([Buffer.from(id,'hex'),vint(d.length),d]);
const ent=(n,l)=>{l=l||Math.max(1,Math.ceil(Math.log2(n+1)/8));const b=Buffer.alloc(l);let v=n;for(let i=l-1;i>=0;i--){b[i]=v%256;v=Math.floor(v/256);}return b;};
const reel=x=>{const b=Buffer.alloc(8);b.writeDoubleBE(x);return b;};
function webm(P,w,h){
  const ms=p=>Math.round(p.t/1000),duree=P.length?ms(P[P.length-1])+17:0;
  const info=el('1549A966',Buffer.concat([el('2AD7B1',ent(1000000)),el('4D80',Buffer.from('cashcar-labo')),el('5741',Buffer.from('cashcar-labo')),el('4489',reel(duree))]));
  const pistes=el('1654AE6B',el('AE',Buffer.concat([el('D7',ent(1)),el('73C5',ent(1)),el('9C',ent(0)),el('22B59C',Buffer.from('und')),el('86',Buffer.from('V_VP9')),el('83',ent(1)),
    el('23E383',ent(16666667)),el('E0',Buffer.concat([el('B0',ent(w)),el('BA',ent(h))]))])));
  const grappes=[];let cur=null;
  for(const p of P){const t=ms(p);
    if(!cur||p.k||t-cur.t>30000){cur={t:t,B:[el('E7',ent(t))]};grappes.push(cur);}
    const e=Buffer.alloc(4);e[0]=0x81;e.writeInt16BE(t-cur.t,1);e[3]=p.k?0x80:0;cur.B.push(el('A3',Buffer.concat([e,p.d])));}
  const G=grappes.map(g=>({t:g.t,b:el('1F43B675',Buffer.concat(g.B))}));
  const index=pos=>el('1C53BB6B',Buffer.concat(G.map((g,i)=>el('BB',Buffer.concat([el('B3',ent(g.t,8)),el('B7',Buffer.concat([el('F7',ent(1)),el('F1',ent(pos[i],8))]))])))));
  const taille=index(G.map(()=>0)).length;let o=info.length+pistes.length+taille;const pos=G.map(g=>{const p=o;o+=g.b.length;return p;});
  const tete=el('1A45DFA3',Buffer.concat([el('4286',ent(1)),el('42F7',ent(1)),el('42F2',ent(4)),el('42F3',ent(8)),el('4282',Buffer.from('webm')),el('4287',ent(2)),el('4285',ent(2))]));
  return {fichier:Buffer.concat([tete,el('18538067',Buffer.concat([info,pistes,index(pos)].concat(G.map(g=>g.b))))]),duree_s:+(duree/1000).toFixed(2)};
}
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
/* (2026-11-24, defaut 26 : « un seul rejeu illisible faisait tomber la page d'accueil ») un rejeu illisible, ou sans ses champs, est saute et SIGNALE */
function accueil(){
  const abimes=[],R=(fs.existsSync(L.D.rejeux)?fs.readdirSync(L.D.rejeux).filter(f=>/\.json$/.test(f)).sort():[]).map(f=>{const r=lisJson(path.join(L.D.rejeux,f));
    if(!r||!r.cerveau||!r.jeu||!r.fin||r.graine==null){abimes.push(f);return null;}return r;}).filter(Boolean);
  const v=L.versionJeu();
  return '<!doctype html><meta charset="utf-8"><title>La salle de projection</title><style>body{font:15px/1.5 system-ui,sans-serif;max-width:860px;margin:28px auto;padding:0 16px;color:#1d1b16;background:#f6f4ef}'
    +'a{color:#c2410c}li{margin:8px 0}small{color:#6b665b}</style><h1>La salle de projection</h1><p>jeu '+esc(v.version)+' · empreinte '+esc(v.sha)+' · <a href="/labo/arbre.html">l\'arbre des cerveaux</a></p>'
    +(R.length?'<ul>'+R.map(r=>{const c=L.nomCourse(r.cerveau.id,r.graine),meme=r.jeu.sha===v.sha;
      return '<li><b>'+esc(c)+'</b> — '+esc(r.cerveau.nom)+', '+esc((r.cartes||[]).join(' > '))+', '+esc(r.fin.t)+' s, fin : '+esc(r.fin.cause)+'<br><small>'+(r.pourquoi||[]).map(esc).join(' ; ')+'</small><br>'
        +(meme?'<a href="/projection?rejeu='+c+'">voir</a> · <a href="/projection?rejeu='+c+'&film=1">voir et filmer</a> · <a href="/projection?rejeu='+c+'&mode=cerveau">le cerveau en direct</a> · <a href="/projection?rejeu='+c+'&cadence=libre">contrôler (au plus vite)</a>'
          :'<small>⚠ enregistré sur une autre version du jeu ('+esc(r.jeu.version)+', commit '+esc(r.jeu.commit)+') : il ne se rejoue que sur elle</small>')+'</li>';}).join('')+'</ul>'
      :'<p>Aucun rejeu gardé pour l\'instant (clore.js ou garder.js).</p>')
    +(abimes.length?'<p><small>⚠ illisible(s), sauté(s) : '+abimes.map(esc).join(', ')+'</small></p>':'');
}
/* (2026-11-24, defaut 11 : « /__hasard (un GET) et /__resultat (un POST text/plain) se declenchaient depuis N'IMPORTE QUELLE page web ouverte
   dans le navigateur : du calcul, et des fichiers ecrits ») QUI A LE DROIT DE PARLER AU SERVEUR :
   - l'adresse demandee doit etre ce PC (Host = localhost / 127.0.0.1 : une page qui ferait pointer son propre nom sur 127.0.0.1 est refusee) ;
   - une requete venue d'un autre site (Origin, ou Sec-Fetch-Site que tout navigateur recent envoie) est refusee, sauf une simple ouverture de
     page en lecture (un lien suivi : `/`, `/labo/…`) ;
   - ce qui calcule ou ecrit (/__hasard, /__resultat, /__video, /__film) n'accepte QUE la page elle-meme (meme origine), ou un outil du PC
     sans navigateur (curl : ni Origin ni Sec-Fetch-Site). */
const HOTES=new Set(['localhost','127.0.0.1','[::1]']);
function autorise(req,p){
  const h=String(req.headers.host||'').toLowerCase().replace(/:\d+$/,'');if(!HOTES.has(h))return false;
  const o=req.headers.origin,site=req.headers['sec-fetch-site'];
  let memeOrigine=true;if(o!=null){try{const u=new URL(o);memeOrigine=HOTES.has(u.hostname.toLowerCase())&&+(u.port||80)===PORT;}catch(e){memeOrigine=false;}}
  if(site!=null&&site!=='same-origin'&&site!=='none')memeOrigine=false;
  if(memeOrigine)return true;
  const lecture=req.method==='GET'&&req.headers['sec-fetch-mode']==='navigate'&&req.headers['sec-fetch-dest']==='document'&&(p==='/'||p.startsWith('/labo/'));
  return lecture;
}
http.createServer(async function(req,res){
  try{
    const u=new URL(req.url,'http://localhost'),p=u.pathname;
    if(!autorise(req,p)){console.log('refuse : '+req.method+' '+p+' (hote '+req.headers.host+', origine '+(req.headers.origin||'—')+', site '+(req.headers['sec-fetch-site']||'—')+')');res.writeHead(403);return res.end('refuse : seulement depuis ce PC et la salle de projection');}
    if(p==='/'){res.writeHead(200,{'Content-Type':MIME['.html']});return res.end(accueil());}
    if(p==='/projection')return statique(ICI,'page.html',res);
    if(p==='/__labo/prelude.js')return statique(ICI,'prelude.js',res);
    if(p==='/__noms'){res.writeHead(200,{'Content-Type':MIME['.json']});return res.end(JSON.stringify({noms:nomsHautNiveau(),requete:REQUETE,requetes:REQUETES,jeu:L.versionJeu()}));} /* (25/11) requetes : celle de chaque version du simulateur (un rejeu d'avant le relief du canyon se projette sans lui) */
    if(p==='/__cjs'){const m=module9(u.searchParams.get('f')||'');if(!m){res.writeHead(404);return res.end('module introuvable');}res.writeHead(200,{'Content-Type':MIME['.js'],'Cache-Control':'no-store'});return res.end(m);}
    if(p==='/__rejeu'){const f=rejeuDe(u.searchParams.get('f'));if(!f){res.writeHead(404);return res.end('{}');}return statique(L.D.rejeux,path.basename(f),res);}
    if(p==='/__hasard'){const j=sansEcran(nomCourse9(u.searchParams.get('f')));if(!j){res.writeHead(404);return res.end('{}');}res.writeHead(200,{'Content-Type':MIME['.json']});return res.end(JSON.stringify(j.hasard));}
    if(p==='/__resultat'&&req.method==='POST'){let R0=null;try{R0=JSON.parse((await corps(req)).toString('utf8'));}catch(e){}const b=compare(R0);
      console.log(b.erreur?'projection : '+b.erreur:`projection ${b.rejeu} (${b.mode}) : ${b.exact?'LA MEME COURSE':'DIFFERENTE'}${b.premiereDifference?' · 1re difference a '+b.premiereDifference.seconde+' s':''} · ecart max ${b.ecartMaxMetres} m · ${b.imagesParSeconde} images/s${b.hasard?' · hasard : '+b.hasard.images+' image(s) recalee(s)':''}`);
      res.writeHead(200,{'Content-Type':MIME['.json']});return res.end(JSON.stringify(b));}
    if(p==='/__video'&&req.method==='POST'){const n=nomCourse9(u.searchParams.get('f')),d=await corps(req);
      if(!n||!d.length){res.writeHead(400);return res.end('{}');}
      fs.mkdirSync(L.D.videos,{recursive:true});fs.writeFileSync(path.join(L.D.videos,n+'.webm'),d);
      console.log('film ecrit : videos/'+n+'.webm · '+Math.round(d.length/1024)+' Ko');
      res.writeHead(200,{'Content-Type':MIME['.json']});return res.end(JSON.stringify({fichier:'videos/'+n+'.webm',octets:d.length}));}
    if(p==='/__film'&&req.method==='POST'){const n=nomCourse9(u.searchParams.get('f')),d=await corps(req),P=[];let coupe=false;
      /* (2026-11-24, defaut 26) un paquet qui annonce plus d'octets qu'il n'en reste : l'envoi est coupe, le film serait faux en silence → refuse */
      for(let o=0;o<d.length;){if(o+16>d.length||o+16+d.readUInt32LE(o)>d.length){coupe=true;break;}const l=d.readUInt32LE(o),k=d.readUInt32LE(o+4),ts=d.readDoubleLE(o+8);P.push({t:ts,k:k,d:d.subarray(o+16,o+16+l)});o+=16+l;}
      if(coupe){console.log('film refuse : envoi coupe ('+d.length+' octets, '+P.length+' images entieres)');res.writeHead(400);return res.end(JSON.stringify({erreur:'envoi coupe : film non ecrit'}));}
      if(!n||!P.length){res.writeHead(400);return res.end('{}');}
      P.sort((a,b)=>a.t-b.t);
      const W=webm(P,+u.searchParams.get('w')||1280,+u.searchParams.get('h')||720);
      fs.mkdirSync(L.D.videos,{recursive:true});fs.writeFileSync(path.join(L.D.videos,n+'.webm'),W.fichier);
      console.log('film ecrit : videos/'+n+'.webm · '+P.length+' images · '+W.duree_s+' s · '+Math.round(W.fichier.length/1024)+' Ko');
      res.writeHead(200,{'Content-Type':MIME['.json']});return res.end(JSON.stringify({fichier:'videos/'+n+'.webm',octets:W.fichier.length,images:P.length,duree_film_s:W.duree_s}));}
    if(p==='/jeu/__projection.html'){res.writeHead(200,{'Content-Type':MIME['.html'],'Cache-Control':'no-store'});return res.end(pageJeu());}
    /* three.js et les passes d'image gardent le VRAI hasard (dans le simulateur, three vit hors du jeu) : la suite tiree de la graine reste au jeu */
    if(p.startsWith('/jeu/vendor/'))return statique(JEU,p.slice(5),res,t=>t.replace(/Math\.random\(\)/g,'__NATIF.random()'));
    if(p.startsWith('/jeu/'))return statique(JEU,p.slice(5),res);
    if(p.startsWith('/labo/'))return statique(L.RACINE,p.slice(6),res,null,req);
    res.writeHead(404);res.end('introuvable');
  }catch(e){console.log('erreur :',e.message);try{res.writeHead(500);res.end(String(e.message));}catch(x){}}
}).listen(PORT,'127.0.0.1',()=>console.log('salle de projection : http://localhost:'+PORT+'/   (labo : '+L.RACINE+')'));
