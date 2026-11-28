#!/usr/bin/env node
/* ===== LE COTE « BORDE » : A L'ENGAGEMENT D'UNE SORTIE VOULUE, QUE DISENT LES RAYONS SIMPLES (rien, plane) DU COTE CHOISI ? (28/11/2026, le concepteur libre) =====
   L'idee testee : une sortie voulue ne devrait partir que d'un cote ou l'ERREUR PARDONNE. Les rayons « rien » (tout lacher) et « plane » (nitro, a plat)
   du cote choisi disent ce qui arrive si le vol prevu rate : s'ils finissent tous deux en CHOC, le decor borde ce cote, et seule la facon promise sauve.
   Classe d'un cote, a une vue : « borde » = rien ET plane finissent en choc ; « mi-borde » = l'un des deux ; « ouvert » = aucun des deux.
   Lecture seule (../../sortie-preparee/sorties : decollages.json, lignes/*.jsonl.gz). AUCUNE course. Doublons « libre » retires.
   Compte aussi la regle a deux vues (borde a l'engagement OU a la vue d'avant) et la regle « a une vue quelconque entre l'engagement et le decollage »
   (ce que verrait une regle qui renonce en route).
   usage : node cote-borde.js -> cote-borde.txt, cote-borde.json */
'use strict';
const fs=require('fs'),path=require('path'),z=require('zlib');
const S=path.join(__dirname,'..','..','sortie-preparee','sorties');
const DOUBLONS={'libre-3970400':1,'libre-3970585':1,'libre-3970659':1},DEC={canyon:1,grotte:1,jade:1,ville:1};
const D=JSON.parse(fs.readFileSync(path.join(S,'decollages.json'),'utf8')).decollages.filter(x=>x.voulu&&x.raccourci&&!DOUBLONS[x.course]);
const cache={};const vues=c=>cache[c]=cache[c]||z.gunzipSync(fs.readFileSync(path.join(S,'lignes',c+'.jsonl.gz'))).toString().split('\n').filter(Boolean).map(JSON.parse).filter(o=>o.mo);
const classe=X=>{if(!X||!Array.isArray(X.R))return null;const r=X.R.find(q=>q.m==='rien'),p=X.R.find(q=>q.m==='plane');
  const n=(r&&r.i==='choc'?1:0)+(p&&p.i==='choc'?1:0);return n===2?'borde':n===1?'mi-borde':'ouvert';};
const cause=X=>{if(!X||!Array.isArray(X.R))return null;const r=X.R.find(q=>(q.m==='rien'||q.m==='plane')&&q.i==='choc');return r?r.c:null;};
const out=[];
for(const x of D){const V=vues(x.course),R=x.raccourci,k=R.c>0?'Sg':'Sd';
  const i0=V.findIndex(o=>Math.abs(o.t-R.t0)<.026);if(i0<0)continue;
  const v0=V[i0],va=i0>0&&V[i0-1].mo==='s'&&v0.t-V[i0-1].t<=.25?V[i0-1]:null;
  const apres=[];for(let i=i0+1;i<V.length&&V[i].mo==='s'&&V[i].t<x.t0+.001;i++)apres.push(V[i]);
  const c0=classe(v0[k]),ca=va?classe(va[k]):null,suite=apres.map(o=>classe(o[k]));
  out.push({course:x.course,carte:x.carte,decor:!!DEC[x.carte],t0:R.t0,dessous:!!R.d,facon:R.f,vitesse:x.vitesse,mort:x.issue.k==='mort',cause:x.issue.cause||null,dt:x.issue.dt,
    engagement:c0,decorTouche:cause(v0[k]),avant:ca,suite,
    /* le temps entre la premiere vue « borde » (engagement compris) et le decollage : la regle aurait-elle le temps d'agir ? */
    nBordeApres:suite.filter(c=>c==='borde').length,nApres:suite.length});}
const L=[],dire=s=>L.push(s);
const tab=(titre,filtre,cle)=>{const T={};for(const f of out.filter(filtre)){const k=cle(f);T[k]=T[k]||[0,0];T[k][0]++;if(f.mort)T[k][1]++;}
  dire('== '+titre+' ==');for(const k of Object.keys(T).sort())dire('  '+k+' : '+T[k][0]+' vols, '+T[k][1]+' morts');};
const lieu=f=>(f.carte==='ville'?'ville':f.decor?'autre decor':'sans decor')+' / '+(f.dessous?'dessous':'raccourci');
dire('sorties voulues distinctes lues : '+out.length+' (morts '+out.filter(f=>f.mort).length+')');
tab('le cote choisi A L\'ENGAGEMENT, par lieu',f=>true,f=>lieu(f)+' | '+f.engagement);
tab('MAPS A DECOR, toutes sorties voulues : le cote choisi a l\'engagement',f=>f.decor,f=>String(f.engagement));
tab('VILLE, toutes sorties voulues : le cote choisi a l\'engagement',f=>f.carte==='ville',f=>String(f.engagement));
tab('VILLE : borde a l\'engagement OU a la vue d\'avant',f=>f.carte==='ville',f=>(f.engagement==='borde'||f.avant==='borde')?'borde (une des deux vues)':'pas borde');
tab('MAPS A DECOR : borde a l\'engagement OU a la vue d\'avant',f=>f.decor,f=>(f.engagement==='borde'||f.avant==='borde')?'borde (une des deux vues)':'pas borde');
tab('VILLE : le decor que touchent rien / plane a l\'engagement',f=>f.carte==='ville',f=>String(f.decorTouche));
tab('AUTRE DECOR : le decor que touchent rien / plane a l\'engagement',f=>f.decor&&f.carte!=='ville',f=>f.carte+' '+String(f.decorTouche));
tab('VILLE, raccourcis : facon et cote',f=>f.carte==='ville'&&!f.dessous,f=>f.facon+' | '+f.engagement);
dire('== chaque sortie voulue de ville (et les mortelles d\'ailleurs) : engagement, vue d\'avant, puis la suite jusqu\'au decollage ==');
for(const f of out.filter(f=>f.carte==='ville'||f.mort))
  dire('  '+[f.course.replace('-tenue',''),'t0 '+f.t0,f.dessous?'DESSOUS':'racc',f.facon,'v'+f.vitesse,f.mort?'MORT '+f.cause+' +'+f.dt+' s':'pose','| avant '+f.avant,'| ENGAGEMENT '+f.engagement+(f.decorTouche?' ('+f.decorTouche+')':''),'| suite '+f.suite.map(c=>c==null?'-':c[0]).join('')].join(' '));
dire('(suite : b = borde, m = mi-borde, o = ouvert, - = pas de rayons ; une lettre par vue de 0,1 s)');
fs.writeFileSync(path.join(__dirname,'cote-borde.json'),JSON.stringify({vols:out},null,1));
fs.writeFileSync(path.join(__dirname,'cote-borde.txt'),L.join('\n')+'\n');console.log(L.join('\n'));
