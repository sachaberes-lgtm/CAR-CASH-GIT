#!/usr/bin/env node
/* ===== L'AUTOPSIE D'UNE COURSE (2026-11-23, etape 1 BOTS-ML : « Claude lit les echecs et reecrit ») =====
   Rejoue UNE graine avec un cerveau et raconte la fin : ce que le bot voyait et ce qu'il a ordonne, decision par decision,
   dans les dernieres secondes. C'est le texte qu'on donne a lire (a Claude, a Sacha) pour comprendre une mort.
   usage : node autopsie.js [cerveau.js] --graine 910037 [--carte ville] [--meteo nuit] [--regime max|allege] [--tmax 900] [--avant 4] [--json]
     --regime  (2026-11-24, defaut 8) LE MEME que la note : en allege, Crypto City sort du tirage et la meme graine donne une autre course.
               Sans lui, l'autopsie d'une mort notee en allege racontait une AUTRE course (max par defaut, comme noter.js)
     --tmax    LE MEME que la note (900 par defaut, comme noter.js depuis le 24/11 ; une note faite a 300 s : --tmax 300)
     --avant   combien de secondes avant chaque mort (et avant la fin) on raconte (4)
     --json    les vues completes au lieu du recit */
/* ===== CHAQUE MORT, PAS SEULEMENT LA FIN (2026-11-25, relecture : « quand la main prend la seconde chance, la mort qui a coute un palier
   disparait de tout ce que la boucle montre a l'API ») =====
   Une main a profil peut reprendre une course morte (la seconde chance) : la course continue, puis finit par une autre mort ou par le temps.
   Avant, seules les dernieres secondes de la course etaient racontees — pour une course reprise puis coupee par le temps, une fin sans mort.
   Desormais un BLOC par mort (« #### MORT n »), puis la fin (« #### LA FIN ») si elle n'est pas une mort : les secondes d'avant, les evenements,
   chaque decision. Les morts se lisent dans l'enregistrement du jeu ; leurs decisions sont celles d'avant le trou de temps mort (le cerveau n'est
   jamais appele mort : entre la mort et la reprise, aucune decision). boucle.js borne chaque bloc a part.
   Dans chaque decision : ce qu'il voyait (et, depuis le 25/11, le RADAR en vol, la tenue de route et les sorties au sol) et ce qu'il a ordonne
   (y compris drift, ensuite, regarder). Un cerveau sans profil ne meurt qu'une fois : un seul bloc, comme avant. */
const path=require('path');
const {ouvrir,charger,course,TMAX_DEFAUT}=require('./piloter');
const {HUMAIN}=require('./doigts');
const A=process.argv.slice(2),opt=(n,d)=>{const i=A.indexOf('--'+n);return i>=0?A[i+1]:d;};
const fichier=path.resolve(A[0]&&!A[0].startsWith('--')?A[0]:path.join(__dirname,'reference.js'));
const G=+opt('graine',910000),AV=+opt('avant',4),REGIME=opt('regime','max')==='allege'?'allege':'max',TMAX=+opt('tmax',TMAX_DEFAUT);
const J=ouvrir({regime:REGIME}),C=charger(fichier);
const r=course(J,C,G,{carte:opt('carte',null),meteo:opt('meteo',null),tmax:TMAX,trace:true});
const b=r.bilan,ev=r.partie.ev||[];
/* les morceaux de la course : les decisions se suivent toutes les 6 images ; un trou plus grand = un temps mort (une mort, puis la reprise) */
const morceaux=[];{let cur=[];for(const x of r.vues){if(cur.length&&x.image-cur[cur.length-1].image>HUMAIN.decision*3){morceaux.push(cur);cur=[];}cur.push(x);}if(cur.length)morceaux.push(cur);}
const morts=ev.filter(e=>e[1]==='mort');
/* un bloc par morceau : le k-ieme morceau finit par la k-ieme mort (s'il y en a une), le dernier par la fin de la course */
const blocs=morceaux.map((V,k)=>{const m=morts[k]||null,dernier=k===morceaux.length-1,tf=m?m[0]:b.duree_s,fin=V[V.length-1].image;
  return {k:k,m:m,dernier:dernier,tf:tf,V:V.filter(x=>x.image>=fin-AV*60)};}).filter(B=>B.m||B.dernier);
if(A.includes('--json')){console.log(JSON.stringify({bilan:b,morts:morts,blocs:blocs.map(B=>({mort:B.m,vues:B.V}))},null,1));process.exit(0);}
const f=(x,n)=>x==null?'—':(+x).toFixed(n==null?1:n);
/* le radar en une ligne : chaque rayon, son issue et dans combien de secondes (et la cause d'un choc) */
const radar=R=>{if(!R)return 'radar —';if(!Array.isArray(R.rayons))return 'radar '+(R.erreur?'erreur':'—');
  const Y=R.rayons,dit9=y=>y.issue+(y.cause?' '+y.cause:'');
  if(Y.length&&Y.every(y=>dit9(y)===dit9(Y[0])))return `radar : les ${Y.length} rayons → ${dit9(Y[0])} (${f(Math.min(...Y.map(y=>y.t==null?99:y.t)))} s au plus tot)`;
  return 'radar '+Y.map(y=>y.m+' '+dit9(y)+(y.t!=null?' '+f(y.t):'')).join(', ');};
const sortie=(nom,S)=>{if(!S)return null;if(!Array.isArray(S.rayons))return nom+' '+(S.issue||'—');
  return nom+' dans '+f(S.t,2)+' s : '+S.rayons.map(y=>y.m+' '+y.issue+(y.cause?' '+y.cause:'')).join('/');};
const solPlus=v=>{const T=v.tenue,S=v.sorties,o=[];
  if(T&&T.tient===true)o.push('tenue ok');else if(T&&T.t!=null)o.push('BORD dans '+f(T.t,2)+' s'+(T.mortel?' (mur mortel)':''));
  if(S)for(const k of ['bord','gauche','droite','saut']){const q=sortie(k,S[k]);if(q)o.push(q);}
  if(v.sautRefuse===true)o.push('saut refuse');
  return o.length?' | '+o.join(' | '):'';};
console.log(`cerveau « ${C.nom} » · graine ${G} · regime ${REGIME} · ${TMAX} s au plus · ${J.version} ${J.sha||'(jeu instable)'} · ${b.cartes.join(' > ')} · ${b.duree_s} s · FIN : ${b.cause} · argent ${Math.round(b.argent)} · figures ${b.figures_payees} · air ${b.air_pct} %`
  +(morts.length>1||(morts.length&&b.cause==='temps')?` · ${morts.length} mort(s), ${b.chances|0} seconde(s) chance(s) prise(s)`:''));
for(const B of blocs){
  const m=B.m,carte=m?(()=>{let rr=0;for(const e of ev){if(e[0]>m[0])break;if(e[1]==='route')rr=e[2]|0;}return ((r.partie.routes||[])[rr]||{}).carte||'?';})():null;
  const repris=m&&ev.some(e=>e[1]==='seconde_chance'&&e[0]>=m[0]&&(!morts[B.k+1]||e[0]<morts[B.k+1][0]));
  console.log(m?`#### MORT ${B.k+1} sur ${morts.length} : a ${m[0]} s de partie, ${m[2]}, sur ${carte}, ${m[5]==='fall'?'EN VOL':'au sol'}${repris?' — puis reprise par la seconde chance (un palier perdu)':''}`
    :`#### LA FIN : ${b.cause==='temps'?'coupee par la limite de temps':b.cause} a ${b.duree_s} s de partie`);
  console.log(`evenements des ${AV} dernieres secondes : `+(ev.filter(e=>e[0]>=B.tf-AV&&e[0]<=B.tf+.01&&e[1]!=='piece').map(e=>e[0]+' s '+e.slice(1).join(' ')).join(' · ')||'aucun'));
  for(const x of B.V){const v=x.vue,o=x.ordre||{};
    const ord=[o.geste?('GESTE '+o.geste+(o.direction?' '+o.direction:'')):null,o.ligne!=null?'ligne '+f(o.ligne):null,o.viser?'viser':null,
      o.volant?'volant '+f(o.volant,2):null,o.manche?'manche '+o.manche:null,o.drift?'drift '+o.drift:null,o.nitro?'NITRO':null,
      o.ensuite?'ensuite '+JSON.stringify(o.ensuite):null,o.regarder?'regarder '+o.regarder:null].filter(Boolean).join(', ')||'rien';
    if(v.mode==='sol')console.log(`${f(v.t,2)} s SOL  s ${f(v.s,0)} lat ${f(v.lat)} cap ${f(v.cap,2)} ${f(v.vitesse,0)} m/s nitro ${f(v.nitro,2)} | virage 60/150/300 m : ${f(v.route[1].virage,2)} ${f(v.route[3].virage,2)} ${f(v.route[5].virage,2)}${v.figureRoute?' | bond '+f(v.bond):''}${v.glisse?' | GLISSE':''}${v.dessous?' | DESSOUS':''}${solPlus(v)} → ${ord}`);
    else if(v.mode==='vol'){const w=v.vol,p=w.proche,a=w.anneau;
      console.log(`${f(v.t,2)} s VOL  ${f(w.t)} s en l'air, air ${f(w.air&&w.air.reste!=null?w.air.reste:w.reste)} | ${p?'route : a cote '+f(p.lat)+', dessus '+f(p.haut)+', axe '+f(p.axe,2)+(p.envers?', ENVERS':''):'route hors de vue'} | ${a?'anneau dans '+f(a.delai)+' s, gisement '+f(a.gisement,2):'pas d\'anneau'}${w.figure?' | figure reste '+f(w.figure.reste)+' s':''} | ${radar(w.radar)} | troncons ${v.troncons.length} → ${ord}`);}
    else console.log(`${f(v.t,2)} s ${v.mode}`);}}
process.exit(0);
