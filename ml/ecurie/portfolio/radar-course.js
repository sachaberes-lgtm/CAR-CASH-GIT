#!/usr/bin/env node
/* ===== LE RADAR D'UNE VRAIE COURSE, POUR LES IMAGES DU PORTFOLIO (2026-11-25, Sacha : « les images techniques du portfolio ») =====
   Joue UNE course du pilote dans le vrai jeu sans ecran (ml/bot/piloter.js, course), les yeux ouverts, et garde pour chaque vol :
     · les 10 rayons du radar a la PREMIERE vue du vol (leur issue, et leur chemin image par image) ;
     · le vol reellement joue (la place de la caisse a chaque image) ;
     · la route autour (le centre et les bords).
   Rien n'est modifie dans ml/bot : les yeux sont recharges dans le jeu avec une copie de leur texte (YEUX_CODE) ou trois lignes posent le chemin
   de chaque rayon dans window.__RT (le rayon garde deja ce chemin pour le banc « pas a pas » : TRACE). Les yeux ne font que lire : la course
   doit rester la meme, au bit pres — l'empreinte est comparee a celle du rejeu du labo, et le resultat le dit.
   usage : node radar-course.js [--cerveau ../../labo/cerveaux/c0003-pilote.js] [--graine 910629] [--regime allege] [--tmax 900]
   resultat : donnees/radar-<id>-g<graine>.json.gz (lu par figures.js) */
const fs=require('fs'),path=require('path'),zlib=require('zlib');
const A=process.argv.slice(2),opt=(n,d)=>{const i=A.indexOf('--'+n);return i>=0?A[i+1]:d;};
const BOT=path.join(__dirname,'..','..','bot');
const {ouvrir,charger,course}=require(path.join(BOT,'piloter.js'));
const Y=require(path.join(BOT,'yeux.js'));
const CERV=path.resolve(__dirname,opt('cerveau','../../labo/cerveaux/c0003-pilote.js'));
const GRAINE=+opt('graine',910629),REGIME=opt('regime','allege'),TMAX=+opt('tmax',900);
const ID=(path.basename(CERV).match(/^c\d+/)||['x'])[0];

/* les yeux, avec le chemin de chaque rayon de VOL (pas ceux du sol) */
function remplace(s,a,b){const n=s.split(a).length-1;if(n!==1)throw new Error('ancre introuvable ou double dans YEUX_CODE : '+a.slice(0,40));return s.replace(a,()=>b);}
let code=Y.YEUX_CODE;
code=remplace(code,'copie(E,e0);','copie(E,e0);if(window.__RT){TRACE=[];window.__RT.push({m:q[0],p:TRACE});}');
code=remplace(code,'rendre(q[0],','(TRACE=null,rendre)(q[0],');
code=remplace(code,'if(tenu&&!q[1]&&q[2]===tenu[2]&&q[3]===tenu[3]&&q[4]===tenu[4]){',
  'if(tenu&&!q[1]&&q[2]===tenu[2]&&q[3]===tenu[3]&&q[4]===tenu[4]){if(window.__RT)window.__RT.push({m:q[0],copie:"tenu"});');
code=remplace(code,'try{o.rayons=eventail(E0,liste,BUDGET.vol,K.approx,tFig);}finally{sansPrelude();}',
  'window.__RT=[];window.__RT0=[E0.px,E0.py,E0.pz,E0.vx,E0.vy,E0.vz];try{o.rayons=eventail(E0,liste,BUDGET.vol,K.approx,tFig);}finally{sansPrelude();window.__RTF=window.__RT;window.__RT=null;TRACE=null;}');

const J=ouvrir({regime:REGIME});
J.ev(code);
const C=charger(CERV);
const r1=x=>Math.round(x*10)/10;
const vols=[];let cur=null;
const t0=Date.now();
const x=course(J,C,GRAINE,{tmax:TMAX,trace:true,image:function(J9,fr){
  const m=Y.modeDe(J9);
  if(m==='vol'){
    if(!cur){cur={image0:fr,places:[],rayons:null,depart:null,route:null};vols.push(cur);}
    const p=J9.ev('[fallPos.x,fallPos.y,fallPos.z]');cur.places.push(r1(p[0]),r1(p[1]),r1(p[2]));
    /* la premiere vue du vol qui porte un radar : ses rayons */
    const F=J9.g.sandbox.__RTF;
    if(F)J9.g.sandbox.__RTF=null;
    if(!cur.rayons&&F){
      cur.imageVue=fr;cur.depart=J9.g.sandbox.__RT0.slice();
      cur.rayons=F.map(o=>o.copie?{m:o.m,copie:o.copie}:{m:o.m,p:o.p.filter((v,i)=>(Math.floor(i/3)%2===0)||i>=o.p.length-3).map(r1)});
      /* la route autour : le centre et la demi-largeur, un point tous les ~5 m, sur 2 km de part et d'autre de la caisse */
      cur.route=JSON.parse(J9.ev(`(function(){const bi=Math.round((curNear?lastNearS:s)/L*(NP-1)),pas=Math.max(1,Math.round(5/(L/(NP-1)))),o=[];
        for(let i=Math.max(0,bi-Math.round(300/(L/(NP-1))));i<=Math.min(NP-1,bi+Math.round(2200/(L/(NP-1))));i+=pas){const p=pts[i],b=B[i],n=Nn[i];
          o.push([+(i/(NP-1)*L).toFixed(1),+p.x.toFixed(1),+p.y.toFixed(1),+p.z.toFixed(1),+b.x.toFixed(3),+b.y.toFixed(3),+b.z.toFixed(3),+n.y.toFixed(3)]);}
        return JSON.stringify({L:L,demi:ROAD_HALF,carte:(LVL.cur&&(LVL.cur.carte||LVL.cur.id))||null,pts:o});})()`));
    }
  }else{J9.g.sandbox.__RTF=null;if(cur){cur.image1=fr;cur.fin=m;cur=null;}}
}});
if(cur){cur.image1=x.bilan.images;cur.fin='temps';}
/* la vue du cerveau a la premiere vue de chaque vol : les issues des rayons, telles que le cerveau les a lues */
for(const v of vols){const q=x.vues.find(q=>q.image===v.imageVue);if(q&&q.vue.vol&&q.vue.vol.radar){v.radar=q.vue.vol.radar;v.vue={t:q.vue.t,s:q.vue.s,vitesse:q.vue.vitesse,carte:q.vue.carte,air:q.vue.vol.reste,plancher:q.vue.vol.plancher};v.ordre=q.ordre;}}
/* les evenements du vrai jeu : decollage, pose, mort */
const ev=(x.partie.ev||[]).filter(e=>['decol','pose','mort','route','bump','seconde_chance'].includes(e[1]));
let rejeu=null;try{rejeu=JSON.parse(fs.readFileSync(path.join(__dirname,'..','..','labo','rejeux',ID+'-g'+GRAINE+'.json'),'utf8'));}catch(e){}
const out={format:'portfolio-radar-1',date:new Date().toISOString(),cerveau:path.relative(path.join(__dirname,'..','..','..'),CERV).split(path.sep).join('/'),id:ID,graine:GRAINE,regime:REGIME,tmax:TMAX,
  jeu:{version:J.version,sha:J.sha,simulateur:J.simulateur||null},bilan:{images:x.bilan.images,duree_s:x.bilan.duree_s,cause:x.bilan.cause,empreinte:x.bilan.empreinte,cartes:x.bilan.cartes,vols:x.bilan.vols},
  rejeu:rejeu?{empreinte:rejeu.empreinte,images:rejeu.images,memeCourse:rejeu.empreinte===x.bilan.empreinte&&rejeu.images===x.bilan.images}:null,
  ev:ev,vols:vols};
const f=path.join(__dirname,'donnees','radar-'+ID+'-g'+GRAINE+'.json.gz');
fs.mkdirSync(path.dirname(f),{recursive:true});
fs.writeFileSync(f,zlib.gzipSync(JSON.stringify(out)));
console.log(`${ID} graine ${GRAINE} (${REGIME}) : ${x.bilan.duree_s} s, fin ${x.bilan.cause}, empreinte ${x.bilan.empreinte}`+(out.rejeu?` — rejeu du labo ${out.rejeu.empreinte} : ${out.rejeu.memeCourse?'LA MEME COURSE':'UNE AUTRE COURSE'}`:''));
console.log(`${vols.length} vols, ${vols.filter(v=>v.rayons).length} avec radar · ${((Date.now()-t0)/1000).toFixed(0)} s · ecrit ${path.relative(process.cwd(),f)}`);
for(const v of vols)console.log(`  vol ${(v.image0/60).toFixed(2)} s → ${(v.image1/60).toFixed(2)} s (${v.fin}) · ${v.radar?v.radar.rayons.map(r=>r.m+':'+r.issue+'@'+r.t).join(' '):'pas de radar'}`);
