#!/usr/bin/env node
/* ===== SOUS LA DALLE : COMBIEN DE TEMPS, ET COMMENT ON EN SORT (28/11/2026, etude « avant le bord », le concepteur libre) =====
   Lecture seule des traces de l'etude « sortie preparee » (../../sortie-preparee/sorties/lignes/*.jsonl.gz). AUCUNE course.
   Les 3 courses « libre » qui rejouent une course tenue sont retirees. Un « episode » = des vues au sol de suite (trou <= 0,15 s) avec dessous vrai.
   Sa fin : « decollage voulu » (une sortie engagee, D.so a la derniere vue), « decollage subi », « revenu dessus au sol » (la vue au sol suivante
   n'est plus dessous, sans vol entre), « fin de course ». Puis ce que devient le vol qui suit (pose dessus, pose dessous, mort).
   usage : node dessous.js -> dessous.txt */
'use strict';
const fs=require('fs'),path=require('path'),zlib=require('zlib');
const LIG=path.join(__dirname,'..','..','sortie-preparee','sorties','lignes');
const DOUBLONS={'libre-3970400':1,'libre-3970585':1,'libre-3970659':1};
const L=[],dire=s=>L.push(s);
const E=[],sol={};
for(const n of fs.readdirSync(LIG).filter(x=>/\.jsonl\.gz$/.test(x)).sort()){
  const nom=n.replace(/\.jsonl\.gz$/,'');if(DOUBLONS[nom])continue;
  const V=zlib.gunzipSync(fs.readFileSync(path.join(LIG,n))).toString().trim().split('\n').map(x=>JSON.parse(x)).filter(v=>v.mo);
  const res=JSON.parse(fs.readFileSync(path.join(LIG,nom+'.json'),'utf8'));
  const morts=(res.ev||[]).filter(e=>e[1]==='mort').map(e=>e[0]);
  let ep=null;
  const clore=(i,fin)=>{if(!ep)return;ep.t1=V[i-1].t;ep.duree=+(ep.t1-ep.t0+.1).toFixed(2);ep.fin=fin;
    if(fin.indexOf('decollage')===0){let j=i;while(j<V.length&&V[j].mo==='v')j++;
      const m=morts.find(t=>t>=ep.t1&&(j>=V.length||t<=V[j].t+1e-9));
      ep.vol=m!=null?'mort':j>=V.length?'fin de course en vol':(V[j].de?'pose dessous':'pose dessus');ep.dureeVol=+(((m!=null?m:j<V.length?V[j].t:ep.t1))-ep.t1).toFixed(2);}
    E.push(ep);ep=null;};
  for(let i=0;i<V.length;i++){const v=V[i];
    if(v.mo==='s'){sol[v.c]=sol[v.c]||{n:0,de:0};sol[v.c].n++;if(v.de)sol[v.c].de++;}
    if(v.mo==='s'&&v.de){if(!ep)ep={course:nom,carte:v.c,t0:v.t,vMax:v.v};ep.vMax=Math.max(ep.vMax,v.v);ep.voulu=!!(v.D&&v.D.so);}
    else if(ep){clore(i,v.mo==='v'?(ep.voulu?'decollage voulu':'decollage subi'):'revenu dessus au sol');}}
  if(ep)clore(V.length,'fin de course');
}
const DEC={canyon:1,grotte:1,jade:1,ville:1};
dire('part des vues au sol passees sous la dalle, par map : '+Object.keys(sol).sort().map(c=>c+' '+(sol[c].de/sol[c].n*100).toFixed(1)+' % ('+sol[c].de+' sur '+sol[c].n+')').join(' ; '));
dire('episodes sous la dalle : '+E.length);
const T={};for(const e of E){const k=(e.carte==='ville'?'ville':DEC[e.carte]?'autre decor':'sans decor')+' | '+e.fin+(e.vol?' -> '+e.vol:'');T[k]=T[k]||[];T[k].push(e);}
const med=a=>{const b=a.slice().sort((x,y)=>x-y);return b.length?b[Math.floor((b.length-1)/2)]:null;};
for(const k of Object.keys(T).sort())dire('  '+k+' : '+T[k].length+' (duree sous la dalle, mediane '+med(T[k].map(e=>e.duree))+' s, max '+Math.max.apply(null,T[k].map(e=>e.duree))+' s)');
dire('chaque episode de ville :');
for(const e of E.filter(e=>e.carte==='ville'))dire('  '+[e.course.replace('-tenue',''),'t '+e.t0+' a '+e.t1,'duree '+e.duree,'vMax '+e.vMax,e.fin,e.vol||'',e.dureeVol!=null?'vol '+e.dureeVol+' s':''].join(' | '));
fs.writeFileSync(path.join(__dirname,'dessous.txt'),L.join('\n')+'\n');console.log(L.join('\n'));
