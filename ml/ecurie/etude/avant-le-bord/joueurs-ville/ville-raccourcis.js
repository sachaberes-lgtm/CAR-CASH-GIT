/* ===== LES SORTIES VOULUES EN VILLE : CE QUE DISAIT LE RADAR AU SOL QUAND LE PILOTE A CHOISI (2026-11-28, role « lecteur des joueurs et de la ville ») =====
   Lecture seule des donnees de ml/ecurie/etude/sortie-preparee/sorties (aucune course) : decollages.json (les 67 vols voulus, leur raccourci
   engage `raccourci` = {c: cote (+1 gauche), f: facon, t0: engagement, at: attente annoncee, d: sortie du DESSOUS}, leur issue) et, pour chacun, les
   vues de la course (lignes/<course>.jsonl.gz) : a l'engagement (t0) et a la derniere vue au sol, les rayons du cote choisi (Sg / Sd : issue, t,
   gain g, angle a, cible ci, decor touche c), et la vue d'avant l'engagement (la promesse doit tenir deux vues).
   node ml/ecurie/etude/avant-le-bord/joueurs-ville/ville-raccourcis.js -> ville-raccourcis.json */
const fs=require('fs'),path=require('path'),zlib=require('zlib');
const S=path.join(__dirname,'..','..','sortie-preparee','sorties');
const D=JSON.parse(fs.readFileSync(path.join(S,'decollages.json'),'utf8')).decollages.filter(x=>x.voulu);
const cache={};const vues=c=>cache[c]=cache[c]||zlib.gunzipSync(fs.readFileSync(path.join(S,'lignes',c+'.jsonl.gz'))).toString().split('\n').filter(Boolean).map(JSON.parse);
const court=r=>r?(r.m+':'+r.i+(r.t!=null?'@'+r.t:'')+(r.g!=null?' g'+r.g:'')+(r.a!=null?' a'+r.a:'')+(r.c?' ('+r.c+')':'')):'-';
const out=[];
for(const x of D){const V=vues(x.course),R=x.raccourci||{},cote=R.c>0?'Sg':'Sd';
  const i0=V.findIndex(o=>Math.abs(o.t-R.t0)<.026),v0=V[i0],vAvant=i0>0?V[i0-1]:null;
  const sol=V.filter(o=>o.mo==='s'&&o.t<x.t0+.001).pop();
  const ray=(v,m)=>v&&v[cote]&&Array.isArray(v[cote].R)?v[cote].R.find(r=>r.m===m):null;
  const jum=m=>m==='viser'?'viserPlane':m==='viserPlane'?'viser':null;
  const e={course:x.course,carte:x.carte,t_decol:x.t0,dessous:!!R.d,facon:R.f,cote:R.c>0?'gauche':'droite',attente:R.at,vitesse_ms:x.vitesse,jauge:x.jauge,
    engagement:{t:R.t0,dessous_vue:v0?v0.de:null,choisi:court(ray(v0,R.f)),jumeau:jum(R.f)?court(ray(v0,jum(R.f))):null,tous:v0&&v0[cote]?v0[cote].R.map(court):null,
      avant:vAvant?court(ray(vAvant,R.f)):null},
    derniere_vue_sol:sol?{t:sol.t,choisi:court(ray(sol,R.f)),tous:sol[cote]?sol[cote].R.map(court):null}:null,
    radar_premiere_vue_en_vol:x.radar0,bascules:(x.bascules||[]).length,issue:x.issue};
  out.push(e);}
const grp=f=>(f.carte==='ville'?'ville':'ailleurs')+(f.dessous?' / dessous':' / raccourci');
const T={};for(const f of out){const k=grp(f);T[k]=T[k]||{n:0,morts:0,causes:{},dt:[]};T[k].n++;if(f.issue.k==='mort'){T[k].morts++;T[k].causes[f.issue.cause]=(T[k].causes[f.issue.cause]||0)+1;T[k].dt.push(f.issue.dt);}}
/* la facon engagee en ville, hors dessous */
const F={};for(const f of out.filter(f=>f.carte==='ville'&&!f.dessous)){F[f.facon]=F[f.facon]||{n:0,morts:0};F[f.facon].n++;if(f.issue.k==='mort')F[f.facon].morts++;}
fs.writeFileSync(path.join(__dirname,'ville-raccourcis.json'),JSON.stringify({tableau:T,facons_ville:F,vols:out},null,1));
console.log(JSON.stringify(T),'\n',JSON.stringify(F));
for(const f of out.filter(f=>f.carte==='ville'))console.log([f.course.replace('ville-tenue-',''),f.t_decol,f.dessous?'DESSOUS':'racc',f.cote,f.facon,'at '+f.attente,'v '+f.vitesse_ms,
  '| engage: '+f.engagement.choisi+(f.engagement.jumeau?' || jumeau '+f.engagement.jumeau:''),'| avant: '+f.engagement.avant,'| sol: '+(f.derniere_vue_sol&&f.derniere_vue_sol.choisi),'| vol0 '+f.radar_premiere_vue_en_vol,
  '| '+f.issue.k+' '+f.issue.dt+(f.issue.cause?' '+f.issue.cause:'')].join(' '));
