/* relecture (determinisme) : genes lus / mutes, bornes, croisement, reparer, sha et fins de ligne. N'ecrit rien. */
'use strict';
const fs=require('fs'),path=require('path');
const RAC=path.join(__dirname,'..','..','..','..'),EV=path.join(RAC,'ml','evolution');
const Gn=require(path.join(EV,'genome.js')),C=require(path.join(EV,'commun.js')),{mulberry32}=require(path.join(EV,'graines.js'));
const cfg=C.lireConfig(),T=Gn.genomeTemoin(cfg);
const modele=fs.readFileSync(Gn.MODELE,'utf8');
const sortie=[];const dire=s=>{sortie.push(s);console.log(s);};
/* 1. chaque gene est-il LU par le pilote ? */
const nonLus=[];
for(const b of Gn.BORNES){
  let lu;
  if(b.ou==='G')lu=new RegExp('G\\.'+b.cle+'\\b').test(modele);
  else if(b.ou==='R'){lu=new RegExp('(R|REGLAGES)\\.'+b.cle+'\\b').test(modele);
    if(!lu&&/^ret(Marge|Cap|Gain|Avance)$/.test(b.cle))lu='(par retours, lu par yeux.js)';}
  else if(b.ou==='raccCartes')lu=/R\.raccCartes\[v\.carte\]/.test(modele);
  else if(b.ou==='raccJumeau')lu=/R\.raccJumeau\[v\.carte\]/.test(modele);
  else if(b.ou==='volRetour')lu=/R\.volRetour\b/.test(modele);
  else if(b.ou==='retours')lu=/REGLAGES\.retours\.length|R\.retours\.length/.test(modele);
  if(!lu)nonLus.push(b.cle);}
dire('genes jamais lus par modele.js : '+(nonLus.length?nonLus.join(', '):'aucun'));
/* 1 bis. le pilote ecrit : un REGLAGES lu dans modele.js mais absent du bloc ? */
const cles=new Set();for(const m of modele.matchAll(/\b(?:R|REGLAGES)\.([A-Za-z_]\w*)/g))cles.add(m[1]);
const bloc=Gn.ecrirePilote(T).match(/const REGLAGES=\{.*\};/)[0];
const absents=[...cles].filter(k=>!new RegExp('[{,]'+k+':').test(bloc));
dire('cles REGLAGES lues mais absentes du bloc ecrit : '+(absents.length?absents.join(', '):'aucune'));
const fiches=[...cles].filter(k=>!Gn.BORNES.some(b=>b.cle===k)&&k!=='raccCartes'&&k!=='raccJumeau'&&k!=='retours');
dire('cles REGLAGES lues hors genome (figees) : '+fiches.join(', '));
/* 2. muter : chaque gene finit-il par changer ? bornes ? valider ? mutes exact ? */
const rng=mulberry32(4242),vus=new Set(),fautes=[];let n=0;
for(const phase of ['A','B','C'])for(let i=0;i<4000;i++){
  const r=Gn.muter(T,rng,{cfg,phase});n++;
  const d=Gn.valider(r.genome,cfg);if(d)fautes.push(phase+' '+d);
  for(const b of Gn.BORNES)if(r.genome.A[b.cle]!==T.A[b.cle]){vus.add(b.cle);if(!r.mutes.some(m=>m.cle===b.cle))fautes.push('mutes oublie '+b.cle);}
  for(const m of r.mutes)if(m.cle!=='WV'&&m.cle!=='WS'&&r.genome.A[m.cle]===T.A[m.cle])fautes.push('mutes de trop '+m.cle);
  if(phase==='A'){for(let k=216;k<222;k++)if(r.genome.WV[k]!==0)fautes.push('phase A : W2 rayon touche');for(let k=72;k<90;k++)if(r.genome.WS[k]!==0)fautes.push('phase A : W2 sol touche');
    if(r.genome.WV.some((x,k)=>x!==T.WV[k])||r.genome.WS.some((x,k)=>x!==T.WS[k]))fautes.push('phase A : une tete touchee');}
  if(phase==='B'&&(r.genome.WV.slice(0,216).some((x,k)=>x!==T.WV[k])||r.genome.WS.slice(0,72).some((x,k)=>x!==T.WS[k])))fautes.push('phase B : W1 touche');
  const r2=Gn.reparer(JSON.parse(JSON.stringify(r.genome)),cfg);if(Gn.shaGenome(r2)!==Gn.shaGenome(r.genome))fautes.push('reparer non idempotent');}
dire('muter : '+n+' mutations ; genes jamais changes : '+(Gn.BORNES.filter(b=>!vus.has(b.cle)).map(b=>b.cle).join(', ')||'aucun')+' ; fautes : '+fautes.length+(fautes.length?' ('+[...new Set(fautes)].slice(0,8).join(' | ')+')':''));
/* 2 bis. muter ne change pas son argument */
{const s0=Gn.shaGenome(T);Gn.muter(T,mulberry32(7),{cfg,phase:'C'});dire('muter laisse le parent intact : '+(Gn.shaGenome(T)===s0));}
/* 2 ter. determinisme : meme etat -> meme enfant */
{const a=Gn.muter(T,mulberry32(99),{cfg,phase:'C'}).genome,b=Gn.muter(T,mulberry32(99),{cfg,phase:'C'}).genome;dire('muter deterministe : '+(Gn.shaGenome(a)===Gn.shaGenome(b)));}
/* 3. croiser : chaque gene vient d'un parent (hors contraintes) */
{const r=mulberry32(5),p1=Gn.muter(T,r,{cfg,phase:'C',genes:40,sigma:.5}).genome,p2=Gn.muter(T,r,{cfg,phase:'C',genes:40,sigma:.5}).genome;let mauvais=[],d=0;
  for(let i=0;i<2000;i++){const c=Gn.croiser(p1,p2,r);if(Gn.valider(c,cfg))d++;
    for(const b of Gn.BORNES)if(c.A[b.cle]!==p1.A[b.cle]&&c.A[b.cle]!==p2.A[b.cle]&&!/braque|jauge|depart/.test(b.cle))mauvais.push(b.cle);}
  dire('croiser : '+d+' enfants non conformes ; genes venus d\'aucun parent (hors contraintes) : '+([...new Set(mauvais)].join(',')||'aucun'));}
/* 4. contraintes poussees au bord */
{const g=JSON.parse(JSON.stringify(T));g.A.braqueDoux=.5;g.A.braqueFort=.2;g.A.jaugeCoupe=.8;g.A.jaugeAllume=.2;g.A.departMin=4;g.A.departMax=1;g.A.marge=-0;g.WV[0]=NaN;g.WS[3]=-0;
  Gn.reparer(g,cfg);dire('contraintes au bord : braqueDoux '+g.A.braqueDoux+' braqueFort '+g.A.braqueFort+' jaugeCoupe '+g.A.jaugeCoupe+' departMax '+g.A.departMax+' ; valider : '+Gn.valider(g,cfg));}
/* 5. sha et fins de ligne */
{const t=Gn.ecrirePilote(T),tCR=Gn.ecrirePilote(T,{modele:modele.replace(/\n/g,'\r\n')});
  dire('pilote : CR '+/\r/.test(t)+' ; modele en CRLF -> meme texte : '+(t===tCR)+' ; sha '+Gn.shaPilote(t).slice(0,12));
  dire('modele.js sur disque contient CR : '+/\r/.test(modele));
  const ordreA=JSON.parse(JSON.stringify(T));const A2={};for(const k of Object.keys(ordreA.A).reverse())A2[k]=ordreA.A[k];ordreA.A=A2;
  dire('shaGenome independant de l\'ordre des cles : '+(Gn.shaGenome(ordreA)===Gn.shaGenome(T))+' ; valider sur cles en desordre : '+Gn.valider(ordreA,cfg));}
