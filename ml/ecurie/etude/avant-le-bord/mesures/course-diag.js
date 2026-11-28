#!/usr/bin/env node
/* ===== UNE COURSE DE c0025 AVEC LE DIAGNOSTIC ETENDU (28/11/2026, etude « avant le bord », le mesureur) =====
   COPIE de ../../sortie-preparee/course-diag.js (meme ouverture du jeu, meme pilote, meme enveloppe des compteurs, meme carte tenue, meme resultat
   compact), etendue pour garder, a chaque vue AU SOL, ce que l'etude « avant le bord » n'avait pas : le volant applique (vue.volant = le steer du
   jeu), le volant que la loi de ligne demande (la formule de doigts.js traduire, refaite ici sur la vue), lacetRoute, lacetMax, vitMult, le virage
   des yeux (vSure, rayon, marge...), rayonMin, la route devant (virage a 8 distances), le palier complet (n, elan, vmax, pousse), les pieces,
   les pouvoirs, le drift, la position le long de la piste (s) et l'image. L'en-tete garde en plus le journal des touches (r.touches).
   DIFFERENCE avec la copie d'origine : l'hote ne demande PLUS les trois lois « retour » en plus (rien de cette etude ne les lit) : la vue que le
   pilote recoit est donc la vue brute du jeu. La preuve (mesurer.js) compare --diag 1 a --diag 0.
   Rien de ml/evolution, ml/bot, ml/reel n'est modifie : ce fichier les REQUIERT.
   usage : node course-diag.js --graine N [--tmax 180] [--carte grotte] [--tenue] [--diag 0|1] [--sortie f.jsonl.gz] */
'use strict';
const fs=require('fs'),path=require('path'),zlib=require('zlib');
const ICI=__dirname,EVO=path.join(ICI,'..','..','..','..','evolution');
const ecrire=process.stdout.write.bind(process.stdout);
const versErr=function(){process.stderr.write(Array.prototype.map.call(arguments,String).join(' ')+'\n');};
console.log=versErr;console.info=versErr;console.warn=versErr;
const A=process.argv.slice(2),opt=(k,d)=>{const i=A.indexOf('--'+k);return i>=0?A[i+1]:d;};
const GRAINE=+opt('graine',NaN),TMAX=+opt('tmax',180),CARTE=opt('carte',null),TENUE=A.includes('--tenue'),DIAG=+opt('diag',1),SORTIE=opt('sortie',null);
if(!(GRAINE>=0)||!(TMAX>0)||(TENUE&&!CARTE)){versErr('usage : node course-diag.js --graine N [--tmax 180] [--carte c] [--tenue] [--diag 0|1] [--sortie f]');process.exit(1);}
const {piloteC0025}=require('./pilote-diag');
const {envelopper,resultatCompact,optionsCourse}=require(path.join(EVO,'enfant'));

/* la recopie exacte de tenirLaCarte (ml/evolution/enfant.js, non exportee) */
function tenirLaCarte(J,carte){
  const l0=J.lancer;
  J.lancer=function(graine,o){
    const etat=l0.call(J,graine,o);
    try{J.carteTenue=J.ev('(function(){const c=(LVL&&LVL.cur)||{};return dbgBancCarte('+JSON.stringify(carte)+',c.meteo||null);})()');}
    catch(e){J.carteTenue=0;}
    return etat;
  };
}

const r2=x=>typeof x==='number'&&x-x===0?Math.round(x*1000)/1000:null;
const cl=(v,a,b)=>v<a?a:v>b?b:v;
function rayon(r){if(!r||typeof r!=='object')return null;
  const o={m:r.m,i:r.issue,t:r2(+r.t)};
  if(r.issue==='pose'){o.p=r.propre===false?0:1;if(r.dessous)o.d=1;o.a=r2(+r.axe);o.l=r2(+r.lat);o.g=r2(+r.gain);o.ai=r2(+r.air);}
  else if(r.issue==='choc')o.c=r.cause||null;
  else if(r.issue==='libre'||r.issue==='coupe'){o.h=r2(+r.haut);o.l=r2(+r.lat);}
  if(typeof r.cible==='number')o.ci=r.cible;
  return o;}
const rayons=L=>Array.isArray(L)?L.map(rayon):null;
const cote=X=>X&&typeof X==='object'?{t:r2(+X.t),issue:X.issue||null,co:X.cote,R:rayons(X.rayons)}:null;
function ordreCourt(o){if(!o||typeof o!=='object')return null;
  const q={};for(const k of ['nitro','volant','manche','ligne','regarder','geste','cible','drift'])if(o[k]!==undefined)q[k]=typeof o[k]==='number'&&k!=='volant'&&k!=='manche'?r2(o[k]):o[k];
  return q;}
/* le volant que la loi de ligne demande (doigts.js, traduire : la loi tenue par la main, recalculee ici sur la vue de la decision) */
function volantDemande(v,o){
  if(!o||typeof o!=='object')return null;
  if(o.ligne!=null&&typeof o.ligne==='number'){
    const capVise=cl((o.ligne-v.lat)/(Math.max(6,v.vitesse)*.9),-.4,.4);
    return r2(cl((v.lacetRoute+(capVise-v.cap)*3)/Math.max(.05,v.lacetMax),-1,1));}
  if(typeof o.volant==='number')return r2(cl(o.volant,-1,1));
  return 0;}
function virageCourt(g){if(!g||typeof g!=='object')return g==null?null:{erreur:1};
  if(g.erreur)return {erreur:1};
  return {d:g.d,se:g.sens,ra:g.rayon,an:g.angle,vs:g.vSure,vsd:g.vSureDrift,vc:g.vCorde,ma:g.marge,br:g.braquage};}
function garderSol(v,o,d){
  const tn=v.tenue&&typeof v.tenue==='object'?v.tenue:null,S=v.sorties&&typeof v.sorties==='object'?v.sorties:null,P=v.palier&&typeof v.palier==='object'?v.palier:null;
  return {t:v.t,im:v.image,mo:'s',c:v.carte,s:r2(v.s),v:r2(v.vitesse),n:r2(v.nitro),r:r2(v.reserve),nl:v.nitroLibre?1:0,no:v.nitroOn?1:0,lat:r2(v.lat),demi:r2(v.demi),cap:r2(v.cap),
    de:v.dessous?1:0,gl:v.glisse?1:0,rb:v.rebond?1:0,dr:v.drift?1:0,su:r2(v.sursis),inv:r2(v.invulnerable),pal:P&&P.n||null,
    /* L'EXTENSION (avant le bord) */
    vo:r2(v.volant),vd:volantDemande(v,o),lr:r2(v.lacetRoute),lm:r2(v.lacetMax),vm:typeof v.vitMult==='number'?v.vitMult:null,
    vg:virageCourt(v.virage),rmin:r2(v.rayonMin),rt:Array.isArray(v.route)?v.route.map(x=>x?r2(x.virage):null):null,
    pe:r2(v.pente),dv:r2(v.devers),
    P:P&&!P.erreur?{n:P.n,el:P.elan,vx:P.vmax,pu:P.pousse,ma:P.manque}:null,pi:v.pieces|0,fl:v.flowNiveau|0,
    pw:v.pouvoirs&&typeof v.pouvoirs==='object'?{n:v.pouvoirs.nitro,v:v.pouvoirs.vitesse,a:v.pouvoirs.air}:null,
    mu:v.mur&&typeof v.mur==='object'?(v.mur.ici?1:0):null,
    ma:v.main&&v.main.attente?v.main.attente.volant:null,
    tn:tn?{ti:tn.tient,t:r2(tn.t),co:tn.cote,mu:!!tn.mur}:null,
    sp:S?S.pourquoi:null,B:S&&S.bord?cote(S.bord):null,Sg:S&&S.gauche?cote(S.gauche):null,Sd:S&&S.droite?cote(S.droite):null,
    O:ordreCourt(o),D:d};}
function garderVol(v,o,d){
  const f=v.vol||{},p=f.proche||null;
  return {t:v.t,im:v.image,mo:'v',c:v.carte,ft:r2(+f.t),ar:f.air&&f.air.reste!=null?r2(+f.air.reste):null,n:r2(v.nitro),r:r2(v.reserve),v:r2(v.vitesse),demi:r2(v.demi),
    vo:r2(v.volant),pal:v.palier&&v.palier.n||null,
    pr:p?{h:r2(+p.haut),l:r2(+p.lat),a:r2(+p.axe),dv:p.dessous?1:0}:null,bu:f.bumps|0,
    Y:f.radar&&Array.isArray(f.radar.rayons)?rayons(f.radar.rayons):null,O:ordreCourt(o),D:d};}

/* L'ENVELOPPE DU DIAGNOSTIC, posee sur C.decide (apres celle des compteurs) : elle LIT la vue et l'ordre, et retire le champ « diag » */
function envelopperDiag(C,lignes){
  const d0=C.decide;
  C.decide=function(vue){
    const o=d0.call(C,vue);
    let d=null;
    if(o&&typeof o==='object'&&Object.prototype.hasOwnProperty.call(o,'diag')){d=o.diag;delete o.diag;}
    try{
      if(vue&&vue.mode==='sol')lignes.push(garderSol(vue,o,d));
      else if(vue&&vue.mode==='vol')lignes.push(garderVol(vue,o,d));
    }catch(e){lignes.push({t:vue&&vue.t,erreurDiag:String(e&&e.message||e)});}
    return o;
  };
}

const {ouvrir,charger,course}=require(path.join(EVO,'..','bot','piloter'));
const P=piloteC0025({diag:DIAG===1});
const J=ouvrir({regime:'allege'});
const C=charger('evolution.js',{source:P.texte});
const compte=envelopper(C);
const lignes=[];
if(DIAG===1)envelopperDiag(C,lignes);
const oc=optionsCourse({tmax:TMAX,carte:CARTE});
if(oc.carte&&TENUE)tenirLaCarte(J,oc.carte);
const t0=Date.now();
const r=course(J,C,GRAINE,oc);
const res=resultatCompact(r,J,C,GRAINE,compte);
res.carteDemandee=CARTE;res.tenue=TENUE;res.tmax=TMAX;res.diag=DIAG;res.shaPilote=P.sha;res.idGenome=P.id;res.msMur=Date.now()-t0;
res.ev=(r.partie&&Array.isArray(r.partie.ev)?r.partie.ev:[]).filter(e=>Array.isArray(e)&&['decol','pose','mort','route','seconde_chance','reprise','pause'].indexOf(e[1])>=0);
res.chance=r.bilan&&r.bilan.chance||null;
if(SORTIE){
  const ent=Object.assign({entete:1},res,{touches:Array.isArray(r.touches)?r.touches:null});
  const txt=[JSON.stringify(ent)].concat(lignes.map(l=>JSON.stringify(l))).join('\n')+'\n';
  fs.mkdirSync(path.dirname(SORTIE),{recursive:true});
  fs.writeFileSync(SORTIE,zlib.gzipSync(txt));}
ecrire(JSON.stringify(res)+'\n');
process.exit(0);
