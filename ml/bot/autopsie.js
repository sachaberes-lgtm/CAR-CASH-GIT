#!/usr/bin/env node
/* ===== L'AUTOPSIE D'UNE COURSE (2026-11-23, etape 1 BOTS-ML : « Claude lit les echecs et reecrit ») =====
   Rejoue UNE graine avec un cerveau et raconte la fin : ce que le bot voyait et ce qu'il a ordonne, decision par decision,
   dans les dernieres secondes. C'est le texte qu'on donne a lire (a Claude, a Sacha) pour comprendre une mort.
   usage : node autopsie.js [cerveau.js] --graine 910037 [--carte ville] [--meteo nuit] [--regime max|allege] [--tmax 900] [--avant 4] [--json]
     --regime  (2026-11-24, defaut 8) LE MEME que la note : en allege, Crypto City sort du tirage et la meme graine donne une autre course.
               Sans lui, l'autopsie d'une mort notee en allege racontait une AUTRE course (max par defaut, comme noter.js)
     --tmax    LE MEME que la note (900 par defaut, comme noter.js depuis le 24/11 ; une note faite a 300 s : --tmax 300)
     --avant   combien de secondes avant la fin on raconte (4)
     --json    les vues completes au lieu du recit */
const path=require('path');
const {ouvrir,charger,course,TMAX_DEFAUT}=require('./piloter');
const A=process.argv.slice(2),opt=(n,d)=>{const i=A.indexOf('--'+n);return i>=0?A[i+1]:d;};
const fichier=path.resolve(A[0]&&!A[0].startsWith('--')?A[0]:path.join(__dirname,'reference.js'));
const G=+opt('graine',910000),AV=+opt('avant',4),REGIME=opt('regime','max')==='allege'?'allege':'max',TMAX=+opt('tmax',TMAX_DEFAUT);
const J=ouvrir({regime:REGIME}),C=charger(fichier);
const r=course(J,C,G,{carte:opt('carte',null),meteo:opt('meteo',null),tmax:TMAX,trace:true});
const b=r.bilan,fin=r.vues.length?r.vues[r.vues.length-1].image:0,V=r.vues.filter(x=>x.image>=fin-AV*60);
if(A.includes('--json')){console.log(JSON.stringify({bilan:b,vues:V},null,1));process.exit(0);}
const f=(x,n)=>x==null?'—':(+x).toFixed(n==null?1:n);
console.log(`cerveau « ${C.nom} » · graine ${G} · regime ${REGIME} · ${TMAX} s au plus · ${J.version} ${J.sha||'(jeu instable)'} · ${b.cartes.join(' > ')} · ${b.duree_s} s · FIN : ${b.cause} · argent ${Math.round(b.argent)} · figures ${b.figures_payees} · air ${b.air_pct} %`);
console.log(`evenements des ${AV} dernieres secondes : `+(r.partie.ev.filter(e=>e[0]>=b.duree_s-AV&&e[1]!=='piece').map(e=>e[0]+' s '+e.slice(1).join(' ')).join(' · ')||'aucun'));
for(const x of V){const v=x.vue,o=x.ordre;
  const ord=[o.geste?('GESTE '+o.geste+(o.direction?' '+o.direction:'')):null,o.ligne!=null?'ligne '+f(o.ligne):null,o.viser?'viser':null,
    o.volant?'volant '+f(o.volant,2):null,o.manche?'manche '+o.manche:null,o.nitro?'NITRO':null].filter(Boolean).join(', ')||'rien';
  if(v.mode==='sol')console.log(`${f(v.t,2)} s SOL  s ${f(v.s,0)} lat ${f(v.lat)} cap ${f(v.cap,2)} ${f(v.vitesse,0)} m/s nitro ${f(v.nitro,2)} | virage 60/150/300 m : ${f(v.route[1].virage,2)} ${f(v.route[3].virage,2)} ${f(v.route[5].virage,2)}${v.figureRoute?' | bond '+f(v.bond):''}${v.glisse?' | GLISSE':''}${v.dessous?' | DESSOUS':''} → ${ord}`);
  else if(v.mode==='vol'){const w=v.vol,p=w.proche,a=w.anneau;
    console.log(`${f(v.t,2)} s VOL  ${f(w.t)} s en l'air, reste ${f(w.reste)} | ${p?'route : a cote '+f(p.lat)+', dessus '+f(p.haut)+', axe '+f(p.axe,2):'route hors de vue'} | ${a?'anneau dans '+f(a.delai)+' s, gisement '+f(a.gisement,2):'pas d\'anneau'}${w.figure?' | figure reste '+f(w.figure.reste)+' s':''} | troncons ${v.troncons.length} → ${ord}`);}
  else console.log(`${f(v.t,2)} s ${v.mode}`);}
process.exit(0);
