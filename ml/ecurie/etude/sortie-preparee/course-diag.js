#!/usr/bin/env node
/* ===== UNE COURSE DE c0025 AVEC SON DIAGNOSTIC (28/11/2026, etude « sortie preparee », le mesureur) =====
   Un processus = une course, comme ml/evolution/enfant.js (meme ouverture du jeu, meme chargement du pilote, meme enveloppe des compteurs, meme carte
   tenue, meme resultat compact) ; rien de ml/evolution n'est modifie : ce fichier les REQUIERT et recopie seulement tenirLaCarte (non exportee).
   usage : node course-diag.js --graine 3963000 [--tmax 180] [--carte grotte] [--tenue] [--diag 0|1] [--sortie f.jsonl.gz]
   --diag 0 : le pilote ne du genome c0025, tel quel (la course de reference) ;
   --diag 1 : le meme texte PLUS les lignes de pilote-diag.js (DIAG_CODE), qui ecrivent dans l'ordre un champ « diag » (l'etat interne du pilote :
              la facon tenue, le vol voulu, le raccourci engage...) ; l'hote le lit puis le RETIRE avant que piloter.js voie l'ordre. En plus, l'hote
              demande aux yeux trois lois « retour » (la loi fidele et les deux lois de secours du lot « genes v4 ») : il ajoute « retours » a l'ordre,
              puis RETIRE de la vue suivante les rayons retour0..2 et vue.vol.retours avant de la donner au pilote (qui voit donc la vue d'avant au
              caractere pres). Ce qui est prouve par mesurer.js --preuve : la meme empreinte de course, de vues et de touches qu'en --diag 0.
   stdout : une ligne JSON (le resultat compact + ev) ; stderr : le bavardage du jeu. La sortie (--sortie) : JSONL compresse, une ligne d'en-tete
   puis une ligne par decision. */
'use strict';
const fs=require('fs'),path=require('path'),zlib=require('zlib');
const ICI=__dirname,EVO=path.join(ICI,'..','..','..','evolution');
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

/* ---------- CE QUI EST GARDE DE CHAQUE VUE (des nombres simples ; rien n'est ecrit dans la vue elle-meme) ---------- */
const r2=x=>typeof x==='number'&&x-x===0?Math.round(x*1000)/1000:null;
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
  /* volant et manche tels quels (le compteur loiFidele.suit les compare au centieme des yeux : pas d'arrondi ici) */
  const q={};for(const k of ['nitro','volant','manche','ligne','regarder','geste','cible'])if(o[k]!==undefined)q[k]=typeof o[k]==='number'&&k!=='volant'&&k!=='manche'?r2(o[k]):o[k];
  return q;}
function garderSol(v,o,d){
  const tn=v.tenue&&typeof v.tenue==='object'?v.tenue:null,S=v.sorties&&typeof v.sorties==='object'?v.sorties:null;
  return {t:v.t,mo:'s',c:v.carte,v:r2(v.vitesse),n:r2(v.nitro),r:r2(v.reserve),nl:v.nitroLibre?1:0,lat:r2(v.lat),demi:r2(v.demi),cap:r2(v.cap),
    de:v.dessous?1:0,gl:v.glisse?1:0,rb:v.rebond?1:0,inv:r2(v.invulnerable),pal:v.palier&&v.palier.n||null,
    tn:tn?{ti:tn.tient,t:r2(tn.t),co:tn.cote,mu:!!tn.mur}:null,
    sp:S?S.pourquoi:null,B:S&&S.bord?cote(S.bord):null,Sg:S&&S.gauche?cote(S.gauche):null,Sd:S&&S.droite?cote(S.droite):null,
    O:ordreCourt(o),D:d};}
function garderVol(v,o,d,ret){
  const f=v.vol||{},p=f.proche||null;
  return {t:v.t,mo:'v',c:v.carte,ft:r2(+f.t),ar:f.air&&f.air.reste!=null?r2(+f.air.reste):null,n:r2(v.nitro),r:r2(v.reserve),v:r2(v.vitesse),demi:r2(v.demi),
    pr:p?{h:r2(+p.haut),l:r2(+p.lat),a:r2(+p.axe),dv:p.dessous?1:0}:null,bu:f.bumps|0,
    Y:f.radar&&Array.isArray(f.radar.rayons)?rayons(f.radar.rayons):null,ret:ret,O:ordreCourt(o),D:d};}

/* les lois demandees en plus (diag 1) : exactement LOI_PILOTE et LOIS_SECOURS de ml/evolution/modele.js (recopiees) */
const LOI_PILOTE={marge:28,cap:.6,porteeMin:40,gain:1.6,avance:.25,pique:10,rv:.2,rm:.2,rn:.2};
const LOIS_EN_PLUS=[Object.assign({},LOI_PILOTE),Object.assign({},LOI_PILOTE,{nitro:3,nitroHaut:5}),Object.assign({},LOI_PILOTE,{cabre:0})];
const N_PLUS=LOIS_EN_PLUS.length;

/* L'ENVELOPPE DU DIAGNOSTIC, posee sur C.decide (apres celle des compteurs) */
function envelopperDiag(C,lignes){
  const d0=C.decide;
  C.decide=function(vue){
    let v=vue,ret=null,rv=null;
    if(vue&&vue.mode==='vol'&&vue.vol&&typeof vue.vol==='object'){
      const f=vue.vol;
      /* la vue que le pilote aurait eue sans les lois en plus : les rayons retour0..2 et vol.retours retires, l'ordre des cles garde */
      if(f.radar&&Array.isArray(f.radar.rayons)&&f.radar.rayons.some(r=>r&&/^retour\d$/.test(r.m))){
        rv=f.radar.rayons.filter(r=>r&&/^retour\d$/.test(r.m)).map(rayon);
        const radar=Object.assign({},f.radar,{rayons:f.radar.rayons.filter(r=>!(r&&/^retour\d$/.test(r.m)))});
        const f2=Object.assign({},f,{radar:radar});
        if(Object.prototype.hasOwnProperty.call(f2,'retours')){ret=(f2.retours||[]).map(c=>c?{v:c.volant,m:c.manche,n:c.nitro?1:0}:null);delete f2.retours;}
        v=Object.assign({},vue,{vol:f2});}
      else if(Object.prototype.hasOwnProperty.call(f,'retours')){const f2=Object.assign({},f);ret=(f2.retours||[]).map(c=>c?{v:c.volant,m:c.manche,n:c.nitro?1:0}:null);delete f2.retours;v=Object.assign({},vue,{vol:f2});}
    }
    const o=d0.call(C,v);
    let d=null;
    if(o&&typeof o==='object'&&Object.prototype.hasOwnProperty.call(o,'diag')){d=o.diag;delete o.diag;}
    try{
      if(vue&&vue.mode==='sol')lignes.push(garderSol(vue,o,d));
      else if(vue&&vue.mode==='vol'){const L=garderVol(v,o,d,ret);if(rv)L.YR=rv;lignes.push(L);}   /* Y : les rayons que le pilote a vus ; YR : les trois en plus */
    }catch(e){lignes.push({t:vue&&vue.t,erreurDiag:String(e&&e.message||e)});}
    /* les lois en plus, pour la vue suivante : APRES tout ce que le pilote a demande (il n'en demande aucune) */
    if(o&&typeof o==='object'&&(vue.mode==='sol'||vue.mode==='vol')){
      if(Array.isArray(o.retours)&&o.retours.length){lignes.push({t:vue.t,erreurDiag:'le pilote demande deja des lois retour'});}
      else o.retours=LOIS_EN_PLUS;}
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
  const txt=[JSON.stringify(Object.assign({entete:1},res))].concat(lignes.map(l=>JSON.stringify(l))).join('\n')+'\n';
  fs.mkdirSync(path.dirname(SORTIE),{recursive:true});
  fs.writeFileSync(SORTIE,zlib.gzipSync(txt));}
ecrire(JSON.stringify(res)+'\n');
process.exit(0);
