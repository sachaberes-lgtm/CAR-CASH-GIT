#!/usr/bin/env node
/* ===== LA VALIDATION SEQUENTIELLE ET L'ALARME COUPEE (28/11/2026, lot « sacre » ; la synthese ml/ecurie/etude/reglage-de-la-selection/LISEZ-MOI.md
   § 2 A1 et A5) =====
   usage : node ml/evolution/tests/validation-sequentielle.test.js   (code 0 si tout passe ; ~30 s, AUCUNE course jouee)
   Comme generation.test.js : courses.creer est remplace par un faux (des lignes fabriquees, ecrites comme le vrai dans courses-*.jsonl, avec un
   cache) et identite.verifier par un faux. Le reste est le vrai code (evoluer, note.comparer, graines, tableau, histoire, arbre, etat).
     V1 config      : config.json = sequentiel 24 / 12 / 96, borne 2,2, arret 0,5, seuilB = seuilC = 1, maledictionSeuil null ; sans plan = l'ancienne
                      regle ; un plan mal ecrit est refuse des charger ; config-essai.json = 3 / 3 / 9
     V2 decision    : les bornes (4,4 a 24 graines, 3,11 a 48, 2,2 a 96) et les quatre decisions d'un regard
     V3 comparer    : seuilB / seuilC lus dans cfg.validation, 1 par defaut (= le comportement d'avant, au bit pres)
     V4 alarme      : maledictionSeuil null ou absent = pas d'alarme ; un nombre = l'ancienne alarme
     V5 reprise     : une validation interrompue (STOP au 3e paquet) ne laisse rien sur le disque ; la reprise ne rejoue aucune course deja faite et rend
                      la MEME ligne de validations.jsonl que sans interruption
     V6 generation  : dans une vraie generation (faux ordonnanceur) : la validation sequentielle, la malediction sur le 1er regard, l'alarme coupee
                      (10 maledictions de 5 au journal : regle6 ne bouge pas) puis remise (maledictionSeuil 1 : regle6 -> regle6Haute)
     V7 graines     : les graines de validation ne sont jamais reprises, ni d'une validation a l'autre ni par l'entrainement
     V8 ancien etat : les etats ecrits par l'ancien code (tests/etat-exemple, essais/*) se relisent : charger, etat.resume, tableau, histoire, arbre ;
                      une ancienne ligne garde sa phrase (« sur 24 graines ») ; les nouvelles disent « au 3e regard, sur 9 graines » */
'use strict';
const fs=require('fs'),path=require('path');
const C=require('../commun'),K=require('../courses'),I=require('../identite'),N=require('../note'),Gr=require('../graines');
const BAC=path.join(C.DOSSIER,'essais','sacre'),hh=()=>new Date().toTimeString().slice(0,8);
const dire=t=>process.stdout.write(hh()+' '+t+'\n');
const res=[];
function verdict(nom,ok,detail){res.push({nom,ok:!!ok});dire((ok?'PASSE  ':'ECHOUE ')+nom+(detail?' : '+detail:''));}
const essai=(nom,f)=>{try{f();}catch(e){verdict(nom,false,'exception : '+String(e&&e.stack||e).slice(0,400));}};

/* ---------- les faux (ceux de generation.test.js, plus un scenario pour les courses de validation) ---------- */
I.verifier=async function(){return {ok:true,lignes:[]};};
const SC={ligne:null};
const REF=N.referenceEpoque(),MES={};for(const k of Object.keys(REF))if(REF[k])MES[k]=REF[k].m;
const h=s=>{let x=0;for(const c of String(s))x=(x*31+c.charCodeAt(0))>>>0;return x;};
function ligneNormale(t,ep){
  const palier=5+h(t.id)%4+(t.graine%7)-3;
  return {cle:t.shaPilote+'|'+t.graine+'|'+t.tmax+'|'+ep.courses,pilote:t.shaPilote,id:t.id,usage:t.usage,generation:t.generation,epoque:ep.courses,essai:1,
    mesuree:true,raison:null,date:new Date().toISOString(),graine:t.graine,tmax:t.tmax,palier:palier,pieces:10,survie_s:20*palier+30,cause:'roche',morts:0,vols:5,
    pannes:0,pannesEssais:0,erreurs:0,mesures:Object.assign({},MES),yeuxTirages:0};
}
const STATS={jouees:[]};
K.creer=function(o){
  const ep=o.epoque,d=o.dossierEtat,memoire=new Map(),S={jouees:0,cache:0,nonMesurees:0,relancees:0,tuees:0,ms:0};
  for(const l of K.lireCourses(d))if(l.epoque===ep.courses&&l.mesuree===true)memoire.set(l.cle,l);
  return {
    async demander(taches){
      return taches.map(t=>{
        if(o.doitArreter())return null;
        const base=ligneNormale(t,ep);
        const l=SC.ligne?SC.ligne(t,base):base;
        if(l===null)return null;
        if(memoire.has(base.cle)){S.cache++;return memoire.get(base.cle);}
        C.ajouterLigne(path.join(d,'courses-'+C.semaineIso(new Date())+'.jsonl'),l);
        S.jouees++;STATS.jouees.push(l.cle);if(!l.mesuree)S.nonMesurees++;else memoire.set(l.cle,l);
        return l;});
    },
    arreter(){return Promise.resolve();},enCours(){return 0;},stats(){return Object.assign({},S);},epoque:ep,trieur:'faux'};
};
const E=require('../evoluer'),ET=require('../etat'),TB=require('../tableau'),HI=require('../histoire'),AR=require('../arbre');

/* les courses de validation : un bruit fixe par graine (le meneur), et un champion qui ressemble un peu moins aux joueurs (E plus haut) : sinon dE = 0
   et se_dE = 0, le critere (c) (dE < se_dE) ne passe jamais. AMPL et DECALAGE reglent ou s'arrete la validation. */
let AMPL=4,DECALAGE=1.2,MENEUR=null;
const MES_CHAMPION={};for(const k of Object.keys(MES))MES_CHAMPION[k]=REF[k].m+1.4*REF[k].s;
function ligneValidation(t,l){
  if(t.usage!=='validation')return l;
  if(t.id===MENEUR)return Object.assign({},l,{palier:l.palier+DECALAGE+((h('b|'+t.graine)%9)-4)*AMPL/4});
  return Object.assign({},l,{mesures:Object.assign({},MES_CHAMPION)});
}
function cfgDans(d){const c=C.lireConfig('config-essai.json');c.dossierEtat=d;c.dossierChampions=path.join(d,'champions');return c;}
/* la date, et le chemin du fichier du champion (il nomme le dossier d'etat : A ou B) reduit a son nom */
const sansDate=l=>{const x=JSON.parse(JSON.stringify(l));delete x.date;if(x.fichier)x.fichier=path.basename(x.fichier);return x;};
const lignesCourses=d=>fs.readdirSync(d).filter(n=>/^courses-.*\.jsonl$/.test(n)).flatMap(n=>C.lireJsonl(path.join(d,n)));
const muet=()=>{};

(async function(){
  const t0=Date.now();
  fs.rmSync(BAC,{recursive:true,force:true});fs.mkdirSync(BAC,{recursive:true});
  const CFG=C.lireConfig(),CFGE=C.lireConfig('config-essai.json');

  /* ===== V1 ===== */
  essai('V1',()=>{
    const p=E.planValidation(CFG);
    verdict('V1 : config.json = sequentiel 24 / 12 / 96, borne 2,2, arret 0,5, seuilB = seuilC = 1, maledictionSeuil null',
      p.nom==='sequentiel'&&p.premier===24&&p.pas===12&&p.plafond===96&&p.borneOBF===2.2&&p.futilite===0.5&&p.seuilB===1&&p.seuilC===1&&CFG.validation.maledictionSeuil===null,JSON.stringify(p));
    const ancien=JSON.parse(JSON.stringify(CFG));for(const k of ['plan','pas','plafond','borneOBF','futilite','seuilB','seuilC'])delete ancien.validation[k];
    const pa=E.planValidation(ancien);
    verdict('V1 : une config sans plan (celle du Ryzen avant ce lot) = l\'ancienne regle (un lot de 24, seuilSacre 2, criteres a 1 se)',
      pa.nom==='fixe'&&pa.premier===24&&pa.plafond===24&&pa.seuilSacre===2&&pa.seuilB===1&&pa.seuilC===1,JSON.stringify(pa));
    const pe=E.planValidation(CFGE);
    verdict('V1 : config-essai.json = 3 graines puis 3 par 3 jusqu\'a 9',pe.nom==='sequentiel'&&pe.premier===3&&pe.pas===3&&pe.plafond===9,JSON.stringify(pe));
    const mal=[['plan','bidon'],['pas',0],['plafond',10],['borneOBF',-1],['futilite','x']];
    const refus=mal.map(([k,v])=>{const c=JSON.parse(JSON.stringify(CFG));c.validation[k]=v;c.dossierEtat=path.join(BAC,'refus');try{E.charger(c,{dire:muet});return null;}catch(e){return String(e.message);}});
    verdict('V1 : un plan mal ecrit est refuse des charger (plan inconnu, pas 0, plafond < graines, borne negative, futilite non numerique)',refus.every(x=>x&&/cfg\.validation\./.test(x)),refus.join(' | '));
  });

  /* ===== V2 ===== */
  essai('V2',()=>{
    const p=E.planValidation(CFG);
    const b=[24,36,48,60,72,84,96].map(n=>+E.borneRegard(p,n,n).toFixed(3));
    verdict('V2 : bornes 2,2 x racine(96/n) : 4,4 a 24, 3,11 a 48, 2,2 a 96',b[0]===4.4&&b[2]===3.111&&b[6]===2.2,b.join(' '));
    verdict('V2 : une graine ratee ne compte pas comme de l\'information (borne a 47 mesurees sur 48 > borne a 48)',E.borneRegard(p,48,47)>E.borneRegard(p,48,48));
    const cmp=(dF,se,sacre)=>({dF:dF,se_dF:se,sacre:!!sacre});
    const D=[E.decisionRegard(p,cmp(5,1,true),24),E.decisionRegard(p,cmp(0.4,1),24),E.decisionRegard(p,cmp(-3,1),48),E.decisionRegard(p,cmp(2,1),48),
      E.decisionRegard(p,cmp(2,1),96),E.decisionRegard(p,cmp(1,0),24),E.decisionRegard(p,cmp(0,0),24),E.decisionRegard(p,{dF:null,se_dF:null,sacre:false},24)];
    verdict('V2 : decisions : sacre ; z 0,4 -> arret ; z -3 -> arret ; z 2 a 48 -> un paquet de plus ; z 2 a 96 -> plafond ; se nul et dF > 0 -> continuer ; dF 0 -> arret ; rien -> arret',
      D.join(',')==='sacre,futilite,futilite,continuer,plafond,continuer,futilite,futilite',D.join(','));
    const pf=E.planValidation(Object.assign({},CFG,{validation:Object.assign({},CFG.validation,{plan:'fixe'})}));
    verdict('V2 : plan fixe : un seul regard (sacre ou fin), borne = seuilSacre',E.decisionRegard(pf,cmp(1,1),24)==='plafond'&&E.borneRegard(pf,24,20)===2);
  });

  /* ===== V3 ===== */
  essai('V3',()=>{
    const L=(id,P)=>P.map((p,i)=>({id:id,graine:1000000+37*i,palier:p,mesuree:true,mesures:Object.assign({},MES)}));
    const A=L('a',[6,4,7,5,6,3,8,5,4,6,7,5]),B=L('b',[6,5,7,6,6,4,8,5,5,6,7,6]);
    const avec=(v)=>Object.assign({},CFG,{validation:Object.assign({},CFG.validation,v)});
    const sans=JSON.parse(JSON.stringify(CFG));delete sans.validation.seuilB;delete sans.validation.seuilC;
    const c1=N.comparer(A,B,{REF:REF,cfg:sans}),c1b=N.comparer(A,B,{REF:REF,cfg:avec({seuilB:1,seuilC:1})}),c2=N.comparer(A,B,{REF:REF,cfg:avec({seuilB:3})});
    verdict('V3 : sans seuilB ni seuilC = 1 (les memes nombres et les memes criteres que la config a 1)',JSON.stringify(c1)===JSON.stringify(c1b),'dPalier '+c1.dPalier.toFixed(3)+' +- '+c1.se_dPalier.toFixed(3));
    verdict('V3 : seuilB lu dans cfg.validation (un recul de palier refuse a 1 se, accepte a 3 se)',c1.criteres.b===false&&c2.criteres.b===true,'b a 1 : '+c1.criteres.b+', a 3 : '+c2.criteres.b);
    const o=N.comparer(A,B,{REF:REF,cfg:sans,seuilB:3});
    verdict('V3 : o.seuilB remplace la config',o.criteres.b===true);
  });

  /* ===== V4 ===== */
  essai('V4',()=>{
    const M=[5,5,5,5,5,5,5,5,5,5],v=x=>Object.assign({maledictionFenetre:10,regle6Haute:3},x);
    const r=[E.alarmeMalediction(M,v({maledictionSeuil:null}),2),E.alarmeMalediction(M,v({}),2),E.alarmeMalediction(M,v({maledictionSeuil:1}),2),
      E.alarmeMalediction(M,v({maledictionSeuil:1}),3),E.alarmeMalediction(M.slice(1),v({maledictionSeuil:1}),2),E.alarmeMalediction([0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5],v({maledictionSeuil:1}),2)];
    verdict('V4 : null -> pas d\'alarme ; absent -> pas d\'alarme ; 1 -> alarme (moyenne 5) ; deja haute -> rien ; 9 validations -> rien ; moyenne 0,5 -> rien',
      r[0]===null&&r[1]===null&&r[2]===5&&r[3]===null&&r[4]===null&&r[5]===null,JSON.stringify(r));
  });

  /* ===== l'etat de depart des essais V5 a V8 : la generation 0 d'un petit essai (config-essai.json) ===== */
  const D0=path.join(BAC,'depart');fs.mkdirSync(D0,{recursive:true});
  let ctx=E.charger(cfgDans(D0),{dire:muet});
  await E.generation(ctx);
  const popD0=C.lireJson(path.join(D0,'population.json'));
  /* le meneur de --valider-maintenant : le plus haut F hors champion (comme validerMaintenant) */
  {const notes=N.noter(lignesCourses(D0).filter(l=>l.usage==='entrainement'&&l.mesuree),{REF:REF,cfg:ctx.cfg,ids:ctx.pop.vivants.map(v=>v.id)});
    MENEUR=ctx.pop.vivants.filter(v=>v.id!==ctx.pop.champion.id).sort((a,b)=>(notes.par[b.id].F-notes.par[a.id].F)||(a.id<b.id?-1:1))[0].id;}
  const copie=nom=>{const d=path.join(BAC,nom);fs.cpSync(D0,d,{recursive:true});return d;};

  /* ===== V5 : la reprise ===== */
  try{
    SC.ligne=ligneValidation;
    /* A : sans interruption */
    const dA=copie('A'),cA=cfgDans(dA);
    STATS.jouees=[];
    const lA=await E.validerMaintenant(E.charger(cA,{dire:muet}));
    const joueesA=STATS.jouees.length;
    dire('V5 : sans interruption : '+ET.regardsClair(lA)+' ; '+(lA.regards||[]).map(r=>r.n+' graines z '+r.z+' borne '+r.borne+' -> '+r.decision).join(' | '));
    verdict('V5 : le scenario va au-dela du premier regard (sinon la reprise ne prouverait rien)',lA.regards&&lA.regards.length>=3,lA.regards&&lA.regards.length+' regards');
    /* B : un STOP pendant le 3e paquet (les courses de ce paquet en partie jouees), puis la reprise */
    const dB=copie('B'),cB=cfgDans(dB),g3=lA.graines[6];
    STATS.jouees=[];
    let coupees=0;
    SC.ligne=(t,l)=>{if(t.usage==='validation'&&t.graine>=g3&&t.id===MENEUR){coupees++;return null;}return ligneValidation(t,l);};
    const rB=await E.validerMaintenant(E.charger(cB,{dire:muet}));
    const joueesB1=STATS.jouees.length,popB=C.lireJson(path.join(dB,'population.json')),valB=C.lireJsonl(path.join(dB,'validations.jsonl')).length;
    verdict('V5 : interrompue : rien n\'est ecrit (validations.jsonl, population.json et ses graines de validation inchanges)',rB&&rB.interrompue===true&&coupees>0&&
      valB===C.lireJsonl(path.join(D0,'validations.jsonl')).length&&popB.graines.validationK===popD0.graines.validationK,
      'interrompue '+(rB&&rB.interrompue)+', '+coupees+' course(s) coupee(s), '+joueesB1+' jouees avant la coupure, validationK '+popB.graines.validationK);
    SC.ligne=ligneValidation;STATS.jouees=[];
    const lB=await E.validerMaintenant(E.charger(cB,{dire:muet}));
    const joueesB2=STATS.jouees.length;
    verdict('V5 : la reprise rend la meme ligne de validations.jsonl que sans interruption (date mise a part)',JSON.stringify(sansDate(lB))===JSON.stringify(sansDate(lA)),
      ET.regardsClair(lB)+' ; '+ET.regardsClair(lA));
    const vc=lignesCourses(dB).filter(l=>l.usage==='validation'),cles=new Set(vc.map(l=>l.cle));
    verdict('V5 : aucune course jouee deux fois : la reprise ne joue que ce qui manquait (le cache rend le reste)',joueesB1+joueesB2===joueesA&&cles.size===vc.length&&
      vc.length===lignesCourses(dA).filter(l=>l.usage==='validation').length,
      'sans interruption '+joueesA+' ; avec : '+joueesB1+' avant la coupure + '+joueesB2+' a la reprise ; '+vc.length+' lignes de validation, '+cles.size+' cles');
    const pA=C.lireJson(path.join(dA,'population.json')),pB=C.lireJson(path.join(dB,'population.json'));
    verdict('V5 : apres la reprise, population.json est le meme (graines de validation, champion)',JSON.stringify(pA.graines)===JSON.stringify(pB.graines)&&
      JSON.stringify(pA.champion.id)===JSON.stringify(pB.champion.id),'validationK '+pA.graines.validationK+' / '+pB.graines.validationK);
    verdict('V5 : regards ecrits (n, z, borne, decision) et la malediction sur le 1er regard',lA.plan&&lA.plan.nom==='sequentiel'&&lA.regards.every(r=>typeof r.n==='number'&&
      'z' in r&&typeof r.borne==='number'&&typeof r.decision==='string')&&lA.courses===2*lA.graines.length&&lA.graines.length===lA.regards[lA.regards.length-1].n&&
      Math.abs(lA.malediction-(lA.entrainement.dF-lA.regards[0].dF))<1e-3,'malediction '+lA.malediction+' = '+lA.entrainement.dF+' - '+lA.regards[0].dF);
    /* les phrases */
    const res0=ET.resume(cA,{maintenant:Date.now()}),l8=res0.find(l=>/^Validation/.test(l))||'';
    const md=HI.texte(cA),html=TB.page?TB.page(cA):'',arb=AR.page(cA);
    verdict('V5 : etat.js, histoire.md, tableau.html disent a quel regard la validation a fini',/au \d+(er|e) regard|au plafond/.test(l8)&&l8.length<=118&&
      /(sacré|arrêté|pas sacré)[^.]*regard/.test(md)&&/regard/.test(html)&&typeof arb==='string',l8);
  }catch(e){verdict('V5',false,'exception : '+String(e&&e.stack||e).slice(0,600));}

  /* ===== V6 : dans une vraie generation, et l'alarme ===== */
  try{
    for(const [nom,seuil] of [['C',null],['D',1]]){
      const d=copie(nom),cfg=cfgDans(d);cfg.validation.maledictionSeuil=seuil;
      /* 10 validations passees (jamais forcees) de malediction 5 : l'ancienne alarme sonnerait a la suivante */
      for(let k=0;k<10;k++)C.ajouterLigne(path.join(d,'validations.jsonl'),{generation:-20+k,usage:'validation',meneur:'x'+k,champion:'y',graines:[1+k],malediction:5});
      SC.ligne=ligneValidation;
      const c=E.charger(cfg,{dire:muet}),r6=0;
      /* une validation a coup sur a la generation 1 : le meneur de la generation 0 tres devant a l'entrainement, et intervalle 1 */
      SC.ligne=(t,l)=>t.usage==='entrainement'&&t.id===MENEUR?Object.assign({},l,{palier:l.palier+6}):ligneValidation(t,l);
      /* la regle 6 a 0 pour ce lancement : le meneur passe des qu'il devance le champion (le bruit de la note n'est pas ce qu'on teste ici) */
      c.pop.derniereValidation=-99;c.pop.regle6=0;
      const r=await E.generation(c);
      const V=C.lireJsonl(path.join(d,'validations.jsonl')).filter(v=>v.generation===r.generation&&v.usage==='validation');
      const v=V[V.length-1];
      if(seuil===null)verdict('V6 : une generation fait une validation sequentielle ; maledictionSeuil null : la malediction est mesuree, regle6 ne bouge pas',
        !!v&&Array.isArray(v.regards)&&v.regards.length>=1&&fini(v.malediction)&&c.pop.regle6===r6&&!(r.evenements||[]).some(e=>/^regle 6/.test(e))&&
        r.validation&&r.validation.regards===v.regards.length,v?ET.regardsClair(v)+', malediction '+v.malediction+', regle6 '+r6+' -> '+c.pop.regle6:'aucune validation');
      else verdict('V6 : maledictionSeuil 1 : l\'ancienne alarme (regle6 -> regle6Haute, evenement)',!!v&&c.pop.regle6===cfg.validation.regle6Haute&&(r.evenements||[]).some(e=>/^regle 6 : 0 -> 3/.test(e)),
        'regle6 '+r6+' -> '+c.pop.regle6);
    }
  }catch(e){verdict('V6',false,'exception : '+String(e&&e.stack||e).slice(0,600));}
  SC.ligne=null;

  /* ===== V7 : les graines de validation ===== */
  essai('V7',()=>{
    let eg=Gr.etatInitial(CFG);const vu=new Set();let double=0,entr=0;
    for(let v=0;v<500;v++){for(const n of [24,12,12,12,12,12,12]){const r=Gr.grainesValidation(eg,n,CFG);eg=r.eg;for(const g of r.graines){if(vu.has(g))double++;vu.add(g);if(g<950000)entr++;}}}
    const max=Math.max(...vu);
    verdict('V7 : 500 validations au plafond (48 000 graines) : aucune reprise, aucune dans la plage d\'entrainement ni du coffre ni du repli',double===0&&entr===0&&
      [...vu].every(g=>g>=1000000&&(g-1000000)%37===0),'derniere graine '+max+' ; la plage principale n\'a pas de fin (k sans borne), 2^31 serait atteint apres '+
      Math.floor((2147483647-1000000)/37/96)+' validations au plafond');
    /* le repli (950000 + 37 k, 1 081 graines), s'il est un jour active a la main : combien de validations au plafond ? */
    let e2=Object.assign(Gr.etatInitial(CFG),{validationRepli:true}),nV=0;
    for(;;){let ok=true;for(const n of [24,12,12,12,12,12,12]){const r=Gr.grainesValidation(e2,n,CFG);e2=r.eg;if(!r.graines.length){ok=false;break;}}if(!ok)break;nV++;}
    verdict('V7 : le repli tient '+nV+' validations au plafond (1 081 graines / 96), puis plus rien (validationFinie)',nV===11&&e2.validationFinie===true);
  });

  /* ===== V8 : les etats ecrits par l'ancien code ===== */
  try{
    const sources=[path.join(C.DOSSIER,'tests','etat-exemple')];
    /* (28/11/2026, l'integrateur du reglage) les deux etats v:2 gardes dans git : etat-v2-ancien (27/11 au soir) et etat-e93ff5cb5 (le code exact du Ryzen,
       avec une ligne de validation d'avant) ; ils ne dependent pas de ce que les autres tests laissent dans essais/ */
    sources.push(path.join(C.DOSSIER,'tests','etat-v2-ancien'),path.join(C.DOSSIER,'tests','etat-e93ff5cb5'));
    /* integration/etat et relecture-gestes/etat : des populations en genome v:2 (celui du Ryzen, code e93ff5cb5) */
    for(const d of ['tests-evoluer/etat','relecture-traces/complet','test-tableau/complet','c0101/changement/archives','integration/etat','relecture-gestes/etat'])sources.push(path.join(C.DOSSIER,'essais',d));
    const vus=[];
    for(const s of sources){
      if(!fs.existsSync(s))continue;
      let dirs=[s];if(/archives$/.test(s))dirs=fs.readdirSync(s).map(n=>path.join(s,n)).filter(x=>fs.existsSync(path.join(x,'population.json')));
      for(const src of dirs){
        const d=path.join(BAC,'ancien-'+vus.length);fs.cpSync(src,d,{recursive:true});
        for(const f of fs.readdirSync(d))if(/^verrou\.json/.test(f))fs.rmSync(path.join(d,f),{force:true});
        const cfg=cfgDans(d),q={src:path.relative(C.DOSSIER,src)};
        try{
          /* un genome d'un autre genome.js (l'etat d'exemple est en v:1 a 86+ genes d'avant les gestes) : refuse par charger, hors de ce lot ; les journaux
             sont alors relus par charger sans population.json (une copie a part) */
          let ctx2;
          try{ctx2=E.charger(cfg,{dire:muet});}
          catch(e){if(!/genome incompatible/.test(String(e.message)))throw e;q.genome='genome refuse (hors lot)';
            const d2=d+'-journaux';fs.cpSync(d,d2,{recursive:true});fs.rmSync(path.join(d2,'population.json'));ctx2=E.charger(cfgDans(d2),{dire:muet});}
          q.charger='ok ('+ctx2.deja.validations.size+' validations, '+ctx2.maledictions.length+' maledictions)';
          const L=ET.resume(cfg);q.resume=L.find(l=>/alidation/.test(l))||'';
          HI.texte(cfg);AR.page(cfg);if(TB.page)TB.page(cfg);
          /* (28/11, l'integrateur) la mesure de tau et la ligne de resume.txt sur un etat d'avant : jamais d'erreur, « trop tot » */
          const RC=ET.resumeComplet(cfg);if(!/^Mutations comptent-elles \? trop tot/.test(RC[RC.length-1]))throw new Error('ligne de tau : '+RC[RC.length-1]);
          q.pages='ok';
          /* (28/11, l'integrateur) seules les lignes d'AVANT (sans regards) : un etat de essais/ (tests-evoluer) recoit des validations du code
             d'aujourd'hui quand evoluer.test.js a tourne apres le lot « sacre » ; elles ne disent rien de l'ancien format */
          const V=C.lireJsonl(path.join(d,'validations.jsonl')).filter(v=>v&&v.usage==='validation'&&!Array.isArray(v.regards));
          q.phrase=V.length?ET.regardsClair(V[V.length-1]):'(aucune validation)';
          q.ok=!V.length||/sur \d+ graines \(un seul lot\)/.test(q.phrase);
        }catch(e){q.erreur=String(e&&e.message||e).slice(0,200);q.ok=false;}
        vus.push(q);}}
    verdict('V8 : les etats de l\'ancien code se relisent sans erreur (charger, resume, histoire, arbre, tableau), et une ancienne ligne dit « sur N graines (un seul lot) »',
      vus.length>=3&&vus.every(q=>q.ok),vus.map(q=>q.src+' : '+(q.erreur||q.phrase+' ; charger '+q.charger+(q.genome?', '+q.genome:''))).join(' | '));
    const ex=vus[0];
    verdict('V8 : le resume d\'un ancien etat garde l\'ancienne phrase de validation',!!ex&&/graines\)$/.test(ex.resume||''),ex&&ex.resume);
  }catch(e){verdict('V8',false,'exception : '+String(e&&e.stack||e).slice(0,600));}

  const ko=res.filter(x=>!x.ok);
  dire(`=== ${res.length-ko.length}/${res.length} passent en ${Math.round((Date.now()-t0)/1000)} s${ko.length?' ; ECHOUENT : '+ko.map(x=>x.nom).join(' | '):''}`);
  process.exit(ko.length?1:0);
})().catch(e=>{dire('ECHOUE exception : '+String(e&&e.stack||e));process.exit(1);});
function fini(x){return typeof x==='number'&&isFinite(x);}
