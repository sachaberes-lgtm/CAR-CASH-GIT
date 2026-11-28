#!/usr/bin/env node
/* ===== LE SIMULATEUR : CE QUE LES VRAIES COURSES DISENT DU BRUIT (27/11/2026, l'etude « simulateur » ;
   la question : « la selection progresse-t-elle, et a quelle vitesse ? ») =====
   Lecture seule de donnees/ (la copie figee de l'evolution reelle du 27/11, lue a 23:16:50 : 567 lignes de courses, generation 0 finie,
   generation 1 en cours). Appelle les VRAIES fonctions de ml/evolution/note.js (noter, ajuster) sur ces lignes.
   Rend donnees/calibrage.json (lu par simuler.js) et affiche :
   - la note de la generation 0 recalculee, comparee a generations.jsonl (preuve que la copie, l'etalon et note.js sont ceux de l'evolution) ;
   - les residus du modele pilote + graine (la loi du palier par course, re-tiree par le simulateur) ;
   - le bruit de E (se_E par bootstrap, la part de courses de plus de 60 s) ;
   - la dispersion VRAIE des 19 mutants de la generation 0 autour du temoin (variance observee moins variance du bruit) ;
   - le temps reel d'une course (ms) selon son palier.
   Usage : node analyser-reel.js   (moins de 30 s) */
'use strict';
const fs=require('fs'),path=require('path');
const ML=path.join(__dirname,'..','..','..','..');
const N=require(path.join(ML,'evolution','note.js'));
const cfg=JSON.parse(fs.readFileSync(path.join(ML,'evolution','config.json'),'utf8'));
const D=path.join(__dirname,'donnees');
const L=fs.readFileSync(path.join(D,'courses-2026-48.jsonl'),'utf8').trim().split('\n').map(JSON.parse);
const G0=JSON.parse(fs.readFileSync(path.join(D,'generations.jsonl'),'utf8').trim().split('\n')[0]);
const moy=A=>A.reduce((s,x)=>s+x,0)/A.length;
const vari=A=>{const m=moy(A);return A.reduce((s,x)=>s+(x-m)*(x-m),0)/(A.length-1);};
const f=(x,d)=>x==null?'-':(+x).toFixed(d==null?3:d);

const ent=L.filter(l=>l.usage==='entrainement'&&l.mesuree===true);
const e0=ent.filter(l=>l.generation===0);
console.log('courses lues : '+L.length+' ; entrainement mesurees : '+ent.length+' (generation 0 : '+e0.length+', generation 1 : '+(ent.length-e0.length)+')');

/* 1. LA NOTE DE LA GENERATION 0, RECALCULEE PAR LE VRAI note.js */
const REF=N.referenceEpoque();
const ids0=G0.population.map(x=>x.id);
const R0=N.noter(e0,{REF,cfg:cfg.note,ids:ids0});
let dmax=0;
console.log('\n== 1. generation 0 : note recalculee contre generations.jsonl ==');
console.log('id           |  n |  â recalc |  â journal |  E recalc | E journal |  F recalc | F journal | se_E  | parties');
for(const x of G0.population){const r=R0.par[x.id];dmax=Math.max(dmax,Math.abs(r.F-x.F),Math.abs(r.ahat-x.ahat),Math.abs(r.E-x.E));
  console.log(x.id+' | '+r.n+' | '+f(r.ahat,4).padStart(9)+' | '+f(x.ahat,4).padStart(10)+' | '+f(r.E,4).padStart(9)+' | '+f(x.E,4).padStart(9)+' | '+f(r.F,4).padStart(9)+' | '+f(x.F,4).padStart(9)+' | '+f(r.se_E,3)+' | '+r.parties);}
console.log('plus grand ecart (â, E, F) : '+dmax.toExponential(2)+(dmax<1e-3?' : IDENTIQUE (aux arrondis du journal pres)':' : DIFFERENT'));
const rang=A=>A.slice().sort((a,b)=>b.F-a.F).map(x=>x.id).join(',');
console.log('classement par F identique : '+(rang(G0.population)===rang(Object.values(R0.par))));

/* 2. LES RESIDUS DU MODELE PILOTE + GRAINE (generation 0 et 1 ensemble : 26 pilotes) */
const fit=N.ajuster(ent,{passes:10,retrecir:12});
const res=ent.map(l=>l.palier-fit.a[l.id]-fit.b[l.graine]);
const bs=Object.values(fit.b);
console.log('\n== 2. residus du palier (modele pilote + graine, '+ent.length+' courses, '+Object.keys(fit.a).length+' pilotes, '+bs.length+' graines) ==');
console.log('sigma des residus (ddl du modele) '+f(fit.sigmaRes)+' ; ET des b (graines) '+f(Math.sqrt(vari(bs)))+' ; palier moyen '+f(moy(ent.map(l=>l.palier)))+
  ' ; min '+Math.min(...ent.map(l=>l.palier))+' ; max '+Math.max(...ent.map(l=>l.palier)));
const hist={};for(const l of ent)hist[l.palier]=(hist[l.palier]||0)+1;
console.log('loi du palier par course : '+Object.keys(hist).sort((a,b)=>a-b).map(k=>k+':'+hist[k]).join(' '));
/* part de la variance des b qui est du bruit : chaque b est la moyenne de ~20 a 26 residus */
const mParG={};for(const l of ent)mParG[l.graine]=(mParG[l.graine]||0)+1;
const bruitB=moy(Object.values(mParG).map(m=>fit.sigmaRes*fit.sigmaRes/m));
const sdGraineVraie=Math.sqrt(Math.max(0,vari(bs)-bruitB));
console.log('ET vraie des graines (variance des b moins le bruit de leur estimation) : '+f(sdGraineVraie));

/* 3. LE BRUIT DE E : par pilote (generation 0, 12 courses), le se_E du bootstrap ; la part des courses de plus de 60 s */
const seE=Object.values(R0.par).map(r=>r.se_E),Es=Object.values(R0.par).map(r=>r.E),parties=Object.values(R0.par).map(r=>r.parties);
const pLong=ent.filter(l=>l.mesures).length/ent.length;
console.log('\n== 3. le bruit de E (generation 0, 12 courses par pilote) ==');
console.log('se_E moyen '+f(moy(seE))+' (min '+f(Math.min(...seE))+', max '+f(Math.max(...seE))+') ; parties de plus de 60 s par pilote : moyenne '+f(moy(parties),2)+
  ', min '+Math.min(...parties)+' ; part des courses de plus de 60 s (toutes generations) '+f(pLong));
/* le bruit par partie : se_E * sqrt(parties) */
const sigE1=moy(Object.values(R0.par).map(r=>r.se_E*Math.sqrt(r.parties)));
console.log('bruit de E ramene a UNE partie (se_E x racine(parties)) : '+f(sigE1));
/* le biais de petite taille : E sur 12 courses contre E sur toutes les courses (generation 0 + 1) des 20 pilotes de la generation 0 */
const Rall=N.noter(ent,{REF,cfg:cfg.note,ids:ids0});
const dE=ids0.map(i=>R0.par[i].E-Rall.par[i].E);
console.log('E sur 12 courses moins E sur toutes leurs courses (~22) : moyenne '+f(moy(dE))+' (le biais de taille : un petit lot gonfle les |z|)');

/* 4. LA DISPERSION VRAIE DES MUTANTS DE LA GENERATION 0 (3 a 6 genes, sigma 0,15) */
const T=G0.population[0].id;
const mut=ids0.filter(i=>i!==T);
const aM=mut.map(i=>R0.par[i].a),EM=mut.map(i=>R0.par[i].E);
const seA2=moy(mut.map(i=>R0.par[i].se_a*R0.par[i].se_a)),seE2=moy(mut.map(i=>R0.par[i].se_E*R0.par[i].se_E));
const vA=vari(aM),vE=vari(EM);
console.log('\n== 4. les 19 mutants de la generation 0 : dispersion vraie = variance observee - variance du bruit ==');
console.log('a (palier, sans retrecissement) : variance observee '+f(vA)+', bruit moyen se_a^2 '+f(seA2)+' -> ET vraie '+f(Math.sqrt(Math.max(0,vA-seA2)))+
  ' ; moyenne des mutants - temoin : '+f(moy(aM)-R0.par[T].a)+' (temoin a = '+f(R0.par[T].a)+', se '+f(R0.par[T].se_a)+')');
console.log('E : variance observee '+f(vE,4)+', bruit moyen se_E^2 '+f(seE2,4)+' -> ET vraie '+f(Math.sqrt(Math.max(0,vE-seE2)),4)+
  ' ; moyenne des mutants - temoin : '+f(moy(EM)-R0.par[T].E)+' (temoin E = '+f(R0.par[T].E)+')');
const cAE=(function(){const ma=moy(aM),me=moy(EM);let s=0;for(let i=0;i<aM.length;i++)s+=(aM[i]-ma)*(EM[i]-me);return s/(aM.length-1)/Math.sqrt(vA*vE);})();
console.log('correlation observee a / E entre mutants : '+f(cAE)+' (un mutant qui va plus loin ressemble-t-il plus ?)');

/* 5. LE TEMPS REEL D'UNE COURSE */
const ms=ent.map(l=>l.ms).filter(x=>x>0);
const parP={};for(const l of ent){const k=Math.min(20,l.palier);(parP[k]=parP[k]||[]).push(l.ms/1000);}
console.log('\n== 5. temps reel d\'une course (4 a la fois sur le Xeon) ==');
console.log('moyenne '+f(moy(ms)/1000,1)+' s ; par palier : '+Object.keys(parP).sort((a,b)=>a-b).map(k=>k+':'+f(moy(parP[k]),0)+'s').join(' '));
/* temps reel par seconde de jeu */
const rapport=moy(ent.map(l=>l.ms/1000/Math.max(1,l.survie_s)));
console.log('secondes reelles par seconde de jeu (une course) : '+f(rapport));

/* 6. LA PART DES COURSES DE PLUS DE 60 S (celles qui donnent une partie a E) ET LE TEMPS REEL, SELON LE PALIER */
const pLongParPalier={},msParPalier={};
for(let p=1;p<=20;p++){const X=ent.filter(l=>l.palier===p);if(X.length){pLongParPalier[p]=X.filter(l=>l.mesures).length/X.length;msParPalier[p]=moy(X.map(l=>l.ms));}}
console.log('part des courses de plus de 60 s selon le palier : '+Object.keys(pLongParPalier).map(k=>k+':'+f(pLongParPalier[k],2)).join(' '));

const sortie={date:new Date().toISOString(),source:'donnees/ (copie figee lue le 27/11/2026 a 23:16:50, 567 lignes)',
  sigmaRes:fit.sigmaRes,sigmaResG0:N.ajuster(e0,{}).sigmaRes,palierMoyenG0:moy(e0.map(l=>l.palier)),ddlResidus:ent.length-Object.keys(fit.a).length-bs.length+1,residus:res.map(x=>+x.toFixed(4)),sdGraine:Math.sqrt(vari(bs)),sdGraineVraie:sdGraineVraie,
  palierTemoin:R0.par[T].a,palierMoyen:moy(ent.map(l=>l.palier)),ETemoin:R0.par[T].E,
  sigmaE1:sigE1,pLong:pLong,seE12:moy(seE),biaisTaille12:moy(dE),
  mutantsG0:{sdA:Math.sqrt(Math.max(0,vA-seA2)),sdE:Math.sqrt(Math.max(0,vE-seE2)),dA:moy(aM)-R0.par[T].a,dE:moy(EM)-R0.par[T].E,corr:cAE,
    vA:vA,seA2:seA2,vE:vE,seE2:seE2},
  msMoyen:moy(ms),pLongParPalier:pLongParPalier,msParPalier:msParPalier,
  paliersParCourse:ent.map(l=>l.palier),
  /* pour la preuve de fidelite de simuler.js : les lignes compactes (id, graine, palier) et les E reels de la generation 0 */
  generation0:{lignes:e0.map(l=>({id:l.id,graine:l.graine,palier:l.palier,survie_s:l.survie_s})),E:Object.fromEntries(ids0.map(i=>[i,{E:R0.par[i].E,se_E:R0.par[i].se_E}])),
    journal:G0.population}};
fs.writeFileSync(path.join(D,'calibrage.json'),JSON.stringify(sortie)+'\n');
console.log('\necrit : donnees/calibrage.json');
