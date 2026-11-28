#!/usr/bin/env node
/* ===== LES SORTIES VOULUES, VUE PAR VUE : CE QU'UNE REGLE « SORTIE VOULUE PRUDENTE » AURAIT FAIT (28/11/2026, etude « avant le bord », le concepteur libre) =====
   Lecture seule des traces de l'etude « sortie preparee » (../../sortie-preparee/sorties : decollages.json et lignes/<course>.jsonl.gz). AUCUNE course.
   Les 3 courses « libre » qui rejouent une course tenue (3970400, 3970585, 3970659 : relecture § 8.2) sont retirees.
   Pour chaque vol VOULU (raccourci engage ou sortie du dessous) : de 2 vues avant l'engagement jusqu'a la derniere vue au sol, ce que disent les
   rayons du cote choisi (S = au moins un rayon qui sauve : pose, levre, portail ; C = aucun ne sauve et un choc ; A = ni l'un ni l'autre ; - = pas de rayons).
   Puis trois regles comptees (aucune n'est rejouee : on compte ou elles auraient agi, pas ce qui serait arrive ensuite) :
     D2 : sortie du DESSOUS sur une map a decor : ne s'engager que si le cote sauvait deja a la vue d'avant (deux vues de suite, <= 0,25 s) ;
     D3 : sortie du dessous engagee sur decor : renoncer si le cote ne sauve plus a deux vues de suite et que le bord est encore a plus de 0,5 s ;
     P  : raccourci sur decor engage en « viserPlane » : prendre son jumeau « viser » (meme cible) s'il se pose.
   usage : node voulus.js   -> voulus.json, voulus.txt */
'use strict';
const fs=require('fs'),path=require('path'),zlib=require('zlib');
const S=path.join(__dirname,'..','..','sortie-preparee','sorties');
const DOUBLONS={'libre-3970400':1,'libre-3970585':1,'libre-3970659':1};
const DECOR={canyon:1,grotte:1,jade:1,ville:1};
const TOUS=JSON.parse(fs.readFileSync(path.join(S,'decollages.json'),'utf8')).decollages.filter(x=>!DOUBLONS[x.course]);
const cache={};const vues=c=>cache[c]=cache[c]||zlib.gunzipSync(fs.readFileSync(path.join(S,'lignes',c+'.jsonl.gz'))).toString().split('\n').filter(Boolean).map(JSON.parse).filter(o=>o.mo);
const sauve=r=>r&&(r.i==='pose'||r.i==='levre'||r.i==='portail');
const etat=X=>{if(!X||!Array.isArray(X.R))return '-';if(X.R.some(sauve))return 'S';const c=X.R.find(r=>r&&r.i==='choc');return c?'C':'A';};
const lignes=[],out=[];
const dire=s=>{lignes.push(s);};
/* ---- les courses : comment finit chacune ---- */
const fins={};
for(const f of fs.readdirSync(path.join(S,'lignes')).filter(f=>/\d\.json$/.test(f))){const n=f.replace('.json','');if(DOUBLONS[n])continue;
  const r=JSON.parse(fs.readFileSync(path.join(S,'lignes',f),'utf8'));fins[n]={cause:r.cause,survie:r.survie_s,palier:r.palier};}
for(const x of TOUS.filter(x=>x.voulu)){
  const V=vues(x.course),R=x.raccourci||{},k=R.c>0?'Sg':'Sd';
  const i0=V.findIndex(o=>Math.abs(o.t-R.t0)<.026);
  const sol=[];for(let i=Math.max(0,i0-2);i<V.length&&V[i].t<x.t0+.001;i++)if(V[i].mo==='s')sol.push(V[i]);
  const suite=sol.map(o=>({dt:+(o.t-R.t0).toFixed(2),de:o.de,e:etat(o[k]),bordT:o[k]?o[k].t:null,
    facon:(()=>{const r=o[k]&&Array.isArray(o[k].R)?o[k].R.find(r=>r.m===R.f):null;return r?r.i+(r.c?':'+r.c:''):null;})(),
    jumeau:(()=>{if(R.f!=='viserPlane')return null;const Y=o[k]&&Array.isArray(o[k].R)?o[k].R:[],me=Y.find(r=>r.m==='viserPlane'&&sauve(r));
      const j=Y.find(r=>r.m==='viser'&&(!me||r.ci===me.ci));return j?j.i:null;})()}));
  const a0=suite.find(s=>Math.abs(s.dt)<.03)||null,avant=suite.filter(s=>s.dt<-.03).pop()||null,apres=suite.filter(s=>s.dt>.03);
  const decor=!!DECOR[x.carte];
  /* D2 : deux vues de suite */
  let D2=null;
  if(R.d&&decor){
    if(avant&&avant.dt>=-.26&&avant.e==='S')D2='inchange';
    else if(apres.length&&apres[0].e==='S')D2='retard 0,1 s';
    else{let j=-1;for(let i=1;i<apres.length;i++)if(apres[i].e==='S'&&apres[i-1].e==='S'){j=i;break;}
      D2=j>=0?'retard plus long (+'+apres[j].dt+' s)':'refusee (jamais deux vues de suite avant le decollage reel)';}}
  /* D3 : renoncer */
  let D3=null;
  if(R.d&&decor){D3='non';for(let i=1;i<apres.length;i++){if(apres[i].e!=='S'&&apres[i].e!=='-'&&apres[i-1].e!=='S'&&apres[i-1].e!=='-'&&!(apres[i].bordT<=.5)){D3='renonce (+'+apres[i].dt+' s, bord a '+apres[i].bordT+' s)';break;}}}
  /* P : viserPlane -> viser */
  let P=null;
  if(!R.d&&decor&&R.f==='viserPlane')P=a0&&a0.jumeau==='pose'?'jumeau viser se pose':'pas de jumeau qui se pose ('+(a0&&a0.jumeau)+')';
  const mort=x.issue.k==='mort';
  out.push({course:x.course,carte:x.carte,t0:R.t0,tDecol:x.t0,dessous:!!R.d,facon:R.f,attente:R.at,vitesse:x.vitesse,jauge:x.jauge,mort,cause:mort?x.issue.cause:null,dtIssue:x.issue.dt,suite,D2,D3,P});
}
const grp=f=>(f.carte==='ville'?'ville':DECOR[f.carte]?'autre decor':'sans decor')+(f.dessous?' / dessous':' / raccourci');
const T={};for(const f of out){const k=grp(f);T[k]=T[k]||{n:0,morts:0};T[k].n++;if(f.mort)T[k].morts++;}
dire('== les vols voulus (courses distinctes : '+Object.keys(fins).length+') ==');
for(const k of Object.keys(T).sort())dire('  '+k+' : '+T[k].n+' vols, '+T[k].morts+' morts');
/* la ville : comment finissent les courses */
{const v=Object.keys(fins).filter(n=>/^ville/.test(n));const mv=out.filter(f=>f.carte==='ville'&&f.mort).map(f=>f.course);
 dire('== la ville tenue : '+v.length+' courses, survie '+v.map(n=>fins[n].survie).sort((a,b)=>a-b).join(' ')+' s ; causes '+v.map(n=>fins[n].cause).join(' ')+' ==');
 dire('  courses de ville finies sur un vol VOULU : '+v.filter(n=>mv.includes(n)).length+' sur '+v.length+' ('+v.filter(n=>mv.includes(n)).join(', ')+')');
 for(const g of ['canyon','grotte','jade']){const w=Object.keys(fins).filter(n=>n.indexOf(g+'-tenue')===0);dire('  pour comparer, '+g+' tenue : survie '+w.map(n=>fins[n].survie).sort((a,b)=>a-b).join(' ')+' s');}}
/* morts par cause, voulu / subi, toutes courses distinctes */
{const M={};for(const x of TOUS){if(x.issue.k!=='mort')continue;const k=x.issue.cause+' | '+(x.voulu?'voulu':'subi');M[k]=(M[k]||0)+1;}
 dire('== morts par cause et par origine du vol (decollages.json, courses distinctes ; analyser.js rattache 1 mort de grotte au mauvais vol, relecture § 8.2) ==');
 for(const k of Object.keys(M).sort())dire('  '+k+' : '+M[k]);}
const compter=(nom,cle,filtre)=>{const L=out.filter(filtre),C={};for(const f of L){const k=String(f[cle]).replace(/ \(\+.*$/,'');C[k]=C[k]||{n:0,morts:0};C[k].n++;if(f.mort)C[k].morts++;}
  dire('== '+nom+' ('+L.length+' vols, '+L.filter(f=>f.mort).length+' morts) ==');for(const k of Object.keys(C).sort())dire('  '+k+' : '+C[k].n+' vols, dont '+C[k].morts+' morts');};
compter('D2, dessous sur decor, deux vues de suite','D2',f=>f.D2!=null);
compter('D2, en ville seulement','D2',f=>f.D2!=null&&f.carte==='ville');
compter('D3, dessous sur decor, renoncer','D3',f=>f.D3!=null);
compter('D3, en ville seulement','D3',f=>f.D3!=null&&f.carte==='ville');
compter('P, viserPlane sur decor','P',f=>f.P!=null);
{const L=out.filter(f=>!f.dessous&&DECOR[f.carte]),F={};for(const f of L){const k=f.carte+' '+f.facon;F[k]=F[k]||{n:0,morts:0};F[k].n++;if(f.mort)F[k].morts++;}
 dire('== raccourcis sur decor par facon ==');for(const k of Object.keys(F).sort())dire('  '+k+' : '+F[k].n+' vols, '+F[k].morts+' morts');}
dire('== chaque sortie du dessous sur decor et chaque raccourci de ville : la suite des vues (dt depuis l\'engagement : etat du cote, d = dessous) ==');
for(const f of out.filter(f=>(f.dessous&&DECOR[f.carte])||f.carte==='ville'))
  dire('  '+[f.course.replace('-tenue',''),'t0 '+f.t0,f.dessous?'DESSOUS':'racc',f.facon,'v'+f.vitesse,(f.mort?'MORT '+f.cause+' +'+f.dtIssue:'pose +'+f.dtIssue),'| D2 '+f.D2,'| D3 '+f.D3,'| P '+f.P,'| '+f.suite.map(s=>s.dt+':'+s.e+(s.de?'d':'')).join(' ')].join(' '));
fs.writeFileSync(path.join(__dirname,'voulus.json'),JSON.stringify({source:'ml/ecurie/etude/sortie-preparee/sorties',tableau:T,vols:out},null,1));
fs.writeFileSync(path.join(__dirname,'voulus.txt'),lignes.join('\n')+'\n');
console.log(lignes.join('\n'));
