/* ===== TRI PRECOCE, QUESTION 1 : LES REGLES SEULES (27/11/2026, etude « tri-precoce ») =====
   LA REGLE ETUDIEE (« racing ») : apres les k premieres graines de la generation (k = 2, 3, 4, 6), un enfant dont la borne haute
       a_k + c · sigma / sqrt(k)
   reste sous le seuil S (la note F du moins bon vivant a la fin de la generation d'avant) est renvoye sans jouer les 12 − k autres.
   a_k = la moyenne de ses k paliers corriges de la graine (le a SANS retrecissement du modele pilote + graine), moins 4 x l'E moyen de la
   population : sur k <= 4 courses il n'y a jamais 5 parties, note.js lui donnerait E = 4 (le pire) et la regle renverrait TOUS les enfants
   (mesures.txt § F : 20 pilotes sur 20 a k = 2, 3, 4). L'E vrai ne varie pas d'un pilote a l'autre dans les donnees (mesures.txt § A).
   1. LA TABLE : la probabilite de renvoi precoce selon la vraie valeur de l'enfant par rapport au seuil (Delta = -5, -3, -1, 0, +1, +2 paliers),
      le bruit d'une course tire dans les VRAIS residus (residus.json), plus l'erreur sur les effets de graine (26 pilotes par graine), et un
      seuil exact (tau = 0) ou lui-meme bruite (tau = 0,5 palier : le moins bon vivant est mal connu).
      Controle : avec un bruit normal et tau = 0, la frequence doit retomber sur Phi(-Delta/se - c).
   2. LE GAIN : courses et SECONDES de calcul economisees par enfant renvoye (le temps d'une course depend de son palier : verifier.txt § 3).
   3. LES VRAIS ENFANTS : la regle appliquee aux 19 mutants de la gen. 0 et aux 6 enfants de la gen. 1, dans l'ordre ou leurs graines ont ete jouees.
   usage : node regles.js > regles.txt */
'use strict';
const fs=require('fs'),path=require('path');
const O=require('./outils');
const N=require(path.join(__dirname,'..','..','..','..','evolution','note.js'));
const cfg=JSON.parse(fs.readFileSync(path.join(__dirname,'..','..','..','..','evolution','config.json'),'utf8'));
const res=O.R.residus,sig=O.R.sigmaRes;
const u=O.mulberry32(20261127),nor=O.normale(u);
const TIRAGES=20000;
const f2=x=>x.toFixed(2),pc=x=>(100*x).toFixed(1).padStart(5);

/* ===== 1. LA TABLE ===== */
console.log('== 1. PROBABILITE DE RENVOI PRECOCE SELON LA VRAIE VALEUR DE L\'ENFANT (Delta = vrai F de l\'enfant - seuil, en paliers) ==');
console.log('bruit d\'une course : les '+res.length+' vrais residus (ET '+f2(sig)+', aplatissement mesure 3,2) ; erreur des effets de graine : ET '+f2(sig/Math.sqrt(26))+' par graine ; '+TIRAGES+' tirages par case');
const DELTAS=[-5,-3,-1,0,1,2],KS=[2,3,4,6],CS=[1.5,2,2.5];
const table={};
for(const tau of [0,0.5]){
  console.log('\n-- seuil '+(tau?'bruite (ET '+tau+')':'exact')+' --');
  console.log('k | c   | se    | '+DELTAS.map(d=>('D='+d).padStart(6)).join(' | ')+' | courses gardees/enfant renvoye');
  for(const k of KS)for(const c of CS){
    const se=Math.sqrt(sig*sig/k+sig*sig/26/k);
    const ligne=[];
    for(const D of DELTAS){let r=0;
      for(let t=0;t<TIRAGES;t++){let s=0;for(let i=0;i<k;i++)s+=res[Math.floor(u()*res.length)]+sig/Math.sqrt(26)*nor();
        const ak=D+s/k,S=tau?tau*nor():0;if(ak+c*sig/Math.sqrt(k)<S)r++;}
      ligne.push(r/TIRAGES);}
    table[tau+'|'+k+'|'+c]=ligne;
    console.log(k+' | '+c.toFixed(1)+' | '+f2(se)+'  | '+ligne.map(x=>pc(x)+' %').join(' | ')+' | '+(12-k));}
}
/* le controle : bruit normal, seuil exact, contre la formule */
console.log('\n-- controle (bruit NORMAL de meme ET, seuil exact) : frequence simulee / formule Phi(-D/se - c x sigma/sqrt(k)/se) --');
let pire=0;
for(const k of [3])for(const c of [2])for(const D of DELTAS){
  const se=Math.sqrt(sig*sig/k+sig*sig/26/k);let r=0;
  for(let t=0;t<TIRAGES;t++){const ak=D+se*nor();if(ak+c*sig/Math.sqrt(k)<0)r++;}
  const th=O.Phi(-D/se-c*sig/Math.sqrt(k)/se);pire=Math.max(pire,Math.abs(r/TIRAGES-th));
  console.log('k=3 c=2 D='+D+' : '+pc(r/TIRAGES)+' % / '+pc(th)+' %');}
console.log('ecart max '+(100*pire).toFixed(2)+' points (attendu < 0,5 avec '+TIRAGES+' tirages) : '+(pire<0.005?'BON':'RATE'));

/* ===== 2. LE GAIN PAR ENFANT RENVOYE (en secondes de calcul) ===== */
console.log('\n== 2. CE QUE RAPPORTE UN ENFANT RENVOYE : (12 - k) courses, mais des courses COURTES ==');
/* le seuil en paliers : le moins bon vivant de la vraie gen. 0 (mesures.txt § G) a un palier moyen de ~6,5 ; un enfant de vraie valeur S + Delta
   fait des courses de palier 6,5 + Delta + b_g + bruit ; on paie le temps moyen de ce palier (verifier.txt § 3) */
const TEMPS_MOYEN=O.R.tempsMoyen;
console.log('course moyenne de la vraie evolution : '+f2(TEMPS_MOYEN)+' s ; une generation de 312 courses ~ '+(312*TEMPS_MOYEN/3600).toFixed(2)+' h de calcul (somme des courses)');
for(const D of DELTAS){let s=0;for(let t=0;t<TIRAGES;t++)s+=O.tempsDe(6.5+D+O.R.etGraines*nor()+res[Math.floor(u()*res.length)]);
  const tm=s/TIRAGES;
  console.log('Delta '+String(D).padStart(2)+' : course moyenne '+tm.toFixed(0).padStart(3)+' s ; k=3 -> 9 courses gardees = '+(9*tm/60).toFixed(1)+' min, soit '+(100*9*tm/(312*TEMPS_MOYEN)).toFixed(2)+' % d\'une generation');}

/* ===== 3. LES VRAIS ENFANTS ===== */
console.log('\n== 3. LA REGLE SUR LES 25 VRAIS MUTANTS (19 de la gen. 0, 6 de la gen. 1), dans l\'ordre joue ==');
const L=fs.readFileSync(path.join(__dirname,'donnees','courses-2026-48.jsonl'),'utf8').trim().split('\n').map(JSON.parse).filter(l=>l.usage==='entrainement'&&l.mesuree===true);
const pop=JSON.parse(fs.readFileSync(path.join(__dirname,'donnees','population.json'),'utf8'));
const REF=N.referenceEpoque();
const g0=L.filter(l=>l.generation===0),g1=L.filter(l=>l.generation===1);
const ids0=[...new Set(g0.map(l=>l.id))];
const n0=N.noter(g0,{REF,cfg,ids:ids0});
const F0=ids0.filter(i=>i!=='19e3767cc346').map(i=>n0.par[i].F).sort((a,b)=>a-b);
const S=F0[6];        /* si on avait renvoye 6 des 19 renvoyables a la fin de la gen. 0 : le 7e plus bas */
const Ebar=O.moy(ids0.map(i=>n0.par[i].E));
console.log('seuil S = '+f2(S)+' (7e F le plus bas de la gen. 0, temoin exclu) ; E moyen '+f2(Ebar)+' ; sigma '+f2(sig));
const enfants1=pop.vivants.filter(v=>v.ne===1).map(v=>v.id);
const essai=(lignes,id,k)=>{
  const gr=[...new Set(lignes.map(l=>l.graine))].slice(0,k);
  const part=lignes.filter(l=>gr.indexOf(l.graine)>=0);
  const fit=N.ajuster(part,{passes:10,retrecir:12});
  return fit.a[id]-4*Ebar;};
const fin={};{const f01=N.noter(g0.concat(g1),{REF,cfg,ids:[...new Set(g0.concat(g1).map(l=>l.id))]});for(const i in f01.par)fin[i]=f01.par[i];}
console.log('id           | gen | '+KS.map(k=>('k='+k).padStart(6)).join(' | ')+' | F final (toutes ses courses) | renvoye par (c = 2)');
let renv={};
for(const [lignes,ids,G] of [[g0,ids0.filter(i=>i!=='19e3767cc346'),0],[g1,enfants1,1]]){
  for(const id of ids){
    const v=KS.map(k=>essai(lignes,id,k));
    const qui=KS.filter((k,j)=>v[j]+2*sig/Math.sqrt(k)<S);
    for(const k of qui)renv[k]=(renv[k]||0)+1;
    console.log(id+' |  '+G+'  | '+v.map(x=>f2(x).padStart(6)).join(' | ')+' | '+f2(fin[id].F).padStart(5)+' ('+fin[id].n+' courses)        | '+(qui.length?qui.map(k=>'k='+k).join(' '):'-'));}}
console.log('renvois precoces avec c = 2 : '+KS.map(k=>'k='+k+' : '+(renv[k]||0)+'/25').join(' · '));
let marge=Infinity;for(const [lignes,ids] of [[g0,ids0.filter(i=>i!=='19e3767cc346')],[g1,enfants1]])for(const id of ids)for(const k of KS)marge=Math.min(marge,essai(lignes,id,k)+2*sig/Math.sqrt(k)-S);
console.log('la plus petite marge (borne haute - seuil) sur les 25 x 4 essais : '+f2(marge)+' palier');

/* ===== 4. LE TRI DES CLONES SUR LES VRAIS ENFANTS : les k premieres courses identiques a celles du parent (meme empreinte) ? ===== */
console.log('\n== 4. LES CLONES (mutation muette) : l\'enfant refait-il les k premieres courses de son parent a l\'identique (meme empreinte) ? ==');
const parPG=new Map();for(const l of L)parPG.set(l.id+'|'+l.graine,l);
const liste=[];
for(const id of ids0)if(id!=='19e3767cc346')liste.push([id,'19e3767cc346',g0]);
for(const v of pop.vivants.filter(v=>v.ne===1))liste.push([v.id,v.parents[0],g1]);
const compte={};
for(const [id,par,lignes] of liste){
  const gr=[...new Set(lignes.map(l=>l.graine))];
  const idem=gr.map(g=>{const a=parPG.get(id+'|'+g),b=parPG.get(par+'|'+g);return a&&b?(a.empreinte===b.empreinte?1:0):null;});
  const tete=k=>idem.slice(0,k).every(x=>x===1);
  const tot=idem.filter(x=>x===1).length,n=idem.filter(x=>x!=null).length;
  for(const k of [2,3,4])if(tete(k))compte[k]=(compte[k]||0)+1;
  if(tot>0)console.log(id+' (parent '+par+') : '+tot+'/'+n+' courses identiques ; les premieres : '+idem.map(x=>x==null?'?':x?'=':'.').join('')+(tete(4)?'  -> CLONE a k = 4':''));}
console.log('enfants dont les k premieres courses sont toutes identiques au parent : '+[2,3,4].map(k=>'k='+k+' : '+(compte[k]||0)+'/'+liste.length).join(' · '));
