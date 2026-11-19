/* ===== LE CRIBLE DE LA GÉNÉRATION DE L'ESPACE — le tableau (2026-11-18, rôle « generation ») =====
   node outils/banc-espace/generation-tableau.cjs passation/espace-debug/data/neuf.jsonl passation/espace-debug/data/sans.jsonl … [quoi=mods|racc|routes|geants|frole|tout]
   Par fichier × palier × module : N routes qui le jouent, la pire valeur, le taux de dépassement. */
const fs=require('fs'),path=require('path');const Me=require('./generation-mesure.cjs');
const fichiers=process.argv.slice(2).filter(a=>!a.includes('='));const quoi=(process.argv.find(a=>a.startsWith('quoi='))||'quoi=tout').slice(5);
const pc=(a,b)=>b?Math.round(100*a/b)+'%':'-';const q=(A,f)=>{if(!A.length)return '-';const B=A.slice().sort((x,y)=>x-y);return B[Math.min(B.length-1,Math.floor(f*(B.length-1)+.5))];};
const r1=x=>typeof x==='number'?(Math.abs(x)>=100?Math.round(x):+x.toFixed(1)):x;
for(const f of fichiers){const lignes=fs.readFileSync(f,'utf8').trim().split('\n').filter(Boolean).map(l=>JSON.parse(l));const parP={};for(const o of lignes)(parP[o.p]=parP[o.p]||[]).push(o);
  console.log('\n################ '+path.basename(f)+' ('+lignes.length+' routes)');
  for(const p of Object.keys(parP).map(Number).sort((a,b)=>a-b)){const R=parP[p],v=Me.vReel(p),rP=Me.rayonPalier(p);
    console.log('\n======== palier '+p+' · '+R.length+' routes · v '+Math.round(v)+' m/s · rayonPalier '+Math.round(rP)+' m');
    if(quoi==='tout'||quoi==='routes'){
      const err=R.filter(o=>o.err||o.errDalle),nan=R.filter(o=>o.nan>0),Ls=R.map(o=>o.L);
      console.log('routes : exceptions '+err.length+(err.length?' ('+err.slice(0,3).map(o=>'g'+o.g+' '+String(o.err||o.errDalle).slice(0,120)).join(' | ')+')':'')+' · NaN '+nan.length+' · L méd '+q(Ls,.5)+' [min '+Math.min(...Ls)+' max '+Math.max(...Ls)+']');
      const pm=R.map(o=>o.ctrlPasMin),co=R.map(o=>o.ctrlCoude);console.log('contrôle : pas min (m) pire '+Math.min(...pm)+' p5 '+q(pm,.05)+' · coude max (°) pire '+Math.max(...co)+' p95 '+q(co,.95));
      const es=R.map(o=>String(o.essai));const cE={};for(const e of es)cE[e]=(cE[e]|0)+1;console.log('pisteTord : essai gardé '+JSON.stringify(cE)+' · contacts restants >0 : '+R.filter(o=>o.contacts>0).length);
      const rep=R.map(o=>o.reprises),ms=R.map(o=>o.ms);console.log('reprises d\'unicité : moy '+(rep.reduce((a,b)=>a+b,0)/R.length).toFixed(2)+' max '+Math.max(...rep)+' · routes refaites '+R.filter(o=>o.reprises>0).length+' · temps génération méd '+q(ms,.5)+' p95 '+q(ms,.95)+' pire '+Math.max(...ms)+' ms');
      const mk={};for(const o of R)for(const m of o.marques||[]){const k=m.replace(/[0-9]+m$/,'').replace(/ [0-9]+ /,' ');mk[k]=(mk[k]|0)+1;}console.log('marques incohérentes : '+(Object.keys(mk).length?JSON.stringify(mk):'aucune'));
      const cx={};for(const o of R)cx[o.nClimax]=(cx[o.nClimax]|0)+1;console.log('nombre de climax (modules distincts marqués climax) : '+JSON.stringify(cx));
      const zr={};for(const o of R)for(const z of o.zonesRefusees||[]){const k=z.split('@')[0]+(z.includes('(fin')?' (fin)':z.includes('(départ)')?' (départ)':'');zr[k]=(zr[k]|0)+1;}console.log('zones refusées par pisteTord : '+JSON.stringify(zr));
      const nd=R.map(o=>o.nyDepart),na=R.map(o=>o.nyArrivee);console.log('dalle Ny min départ 0-300 m : pire '+Math.min(...nd)+' p5 '+q(nd,.05)+' · <0 : '+nd.filter(x=>x<0).length+' · arrivée 200 derniers m : pire '+Math.min(...na)+' · <0,5 : '+na.filter(x=>x<.5).length);
      const mu=R.map(o=>o.monte100),md=R.map(o=>o.descend100);console.log('montée tenue sur 100 m (dalle debout) : méd '+q(mu,.5)+' p95 '+q(mu,.95)+' pire '+Math.max(...mu)+'° · descente 100 m pire '+Math.min(...md)+'° p5 '+q(md,.05));
      const mm={};for(const o of R)if(o.monte100>20){mm[o.monte100Mod]=(mm[o.monte100Mod]|0)+1;}console.log('  montées > 20° par module : '+JSON.stringify(mm));
    }
    if(quoi==='tout'||quoi==='frole'){const F={jeu:{},sym:{},plafond:{}};let dm=[];for(const o of R){if(!o.frole)continue;if(o.frole.dmin!=null)dm.push(o.frole.dmin);for(const k of ['jeu','sym','plafond'])for(const e of o.frole[k]){const c=e[2]+'|'+e[3];(F[k][c]=F[k][c]||[]).push('g'+o.g+'@'+e[0]+'/'+e[1]+':'+e[4]+'m');}}
      console.log('frôlements (dalle jouée, >250 m de route d\'écart) : routes avec un écart 3D < 75 m : '+dm.length+' · pire '+(dm.length?Math.min(...dm):'-')+' m');
      for(const k of ['jeu','sym','plafond']){const ks=Object.keys(F[k]);const nR=new Set();for(const c of ks)for(const s of F[k][c])nR.add(s.split('@')[0]);console.log('  '+k+' : '+nR.size+' routes'+(ks.length?' — '+ks.map(c=>c+' ×'+F[k][c].length+' ('+F[k][c].slice(0,2).join(', ')+')').join(' · '):''));}}
    if(quoi==='tout'||quoi==='mods'){const A={};for(const o of R){if(!o.mods)continue;for(const m in o.mods)(A[m]=A[m]||[]).push(o.mods[m]);}
      console.log('module          N  | roulis°/s max  p95 | >60  >90 >120 (routes) run90 | envers s moy max | Rv min  <rP | Rh min  <rP | pente min  max | demi-tour 0,5s min <0');
      const lst=Object.keys(A).sort((a,b)=>A[b].length-A[a].length);
      for(const m of lst){const X=A[m],n=X.length,g=k=>X.map(x=>x[k]);
        console.log(m.padEnd(14)+String(n).padStart(4)+' | '+String(r1(Math.max(...g('rollMax')))).padStart(6)+' '+String(r1(q(g('rollMax'),.95))).padStart(5)+' | '+pc(X.filter(x=>x.t60>0).length,n).padStart(4)+' '+pc(X.filter(x=>x.t90>0).length,n).padStart(4)+' '+pc(X.filter(x=>x.t120>0).length,n).padStart(4)+' '+String(r1(Math.max(...g('run90Max')))).padStart(5)+
          ' | '+String(r1(g('env').reduce((a,b)=>a+b,0)/n)).padStart(5)+' '+String(r1(Math.max(...g('env')))).padStart(5)+' | '+String(Math.round(Math.min(...g('rvMin')))).padStart(5)+' '+pc(X.filter(x=>x.sousRP>0).length,n).padStart(4)+
          ' | '+String(Math.round(Math.min(...g('rhMin')))).padStart(5)+' '+pc(X.filter(x=>x.sousRPh>0).length,n).padStart(4)+' | '+String(r1(Math.min(...g('penMin')))).padStart(6)+' '+String(r1(Math.max(...g('penMax')))).padStart(5)+' | '+String(Math.min(...g('flipMin')).toFixed(2)).padStart(5)+' '+pc(X.filter(x=>x.flipMin<0).length,n).padStart(4));}
      /* les pires routes par module (roulis, demi-tour) */
      const pires=(k,sens)=>{const L9=[];for(const o of R){if(!o.mods)continue;for(const m in o.mods)L9.push([m,o.g,o.mods[m][k],o.mods[m][k==='rollMax'?'rollMaxOu':k==='flipMin'?'flipOu':'rvOu']]);}L9.sort((a,b)=>sens*(b[2]-a[2]));return L9.slice(0,6).map(x=>x[0]+' g'+x[1]+' '+r1(x[2])+'@'+x[3]).join(' · ');};
      console.log('  pires roulis : '+pires('rollMax',1));console.log('  pires demi-tours : '+pires('flipMin',-1));console.log('  pires Rv : '+pires('rvMin',-1));}
    if(quoi==='tout'||quoi==='racc'){const A={};for(const o of R){if(!o.racc)continue;for(const k in o.racc)(A[k]=A[k]||[]).push(o.racc[k]);}
      const lst=Object.keys(A).filter(k=>A[k].length>=3).map(k=>{const X=A[k];return [k,X.length,Math.max(...X.map(x=>x.rollMax)),q(X.map(x=>x.rollMax),.95),Math.min(...X.map(x=>x.rvMin)),Math.max(...X.map(x=>x.dNMax)),Math.min(...X.map(x=>x.flipMin)),X.filter(x=>x.rollMax>60).length];}).sort((a,b)=>b[2]-a[2]);
      console.log('raccords (±0,5 s) — les 14 pires roulis : '+lst.slice(0,14).map(x=>x[0]+' n'+x[1]+' max '+r1(x[2])+' p95 '+r1(x[3])+' >60:'+x[7]+' Rv '+x[4]+' dN '+x[5]+'°/m').join(' · '));}
    if(quoi==='tout'||quoi==='geants'){const A={};for(const o of R)for(const g of o.geants||[])(A[g.k]=A[g.k]||[]).push(Object.assign({g:o.g},g));
      for(const k in A){const X=A[k];let s='géant '+k+' : '+X.length+' · posé '+X.filter(x=>x.posee||x.jante).length+' · décalage repères/marque max '+Math.max(...X.map(x=>x.decaleMarque))+' m';
        if(k==='roue'){s+=' · sans jante '+X.filter(x=>!x.jante).length+' ('+X.filter(x=>!x.jante).slice(0,4).map(x=>'g'+x.g+' R'+x.R+' face '+x.face).join(', ')+') · écart route/cercle moy méd '+q(X.map(x=>x.ecartMoy),.5)+' max '+Math.max(...X.map(x=>x.ecartMax))+' · route voisine dans la jante (< 30 m) '+X.filter(x=>x.voisineJante<30).length+' ('+X.filter(x=>x.voisineJante<30).slice(0,4).map(x=>'g'+x.g+' '+x.voisineJante+'@'+x.voisineJanteOu).join(', ')+')';}
        if(k==='lune'){const P=X.filter(x=>x.posee);s+=' · non posée '+(X.length-P.length)+' ('+X.filter(x=>!x.posee).slice(0,4).map(x=>'g'+x.g+' R'+x.R).join(', ')+') · écart méd '+q(X.map(x=>x.ecart),.5)+' max '+Math.max(...X.map(x=>x.ecart))+' · route à < 0 m de la surface '+P.filter(x=>x.routeSurface<0).length+' ('+P.filter(x=>x.routeSurface<0).slice(0,4).map(x=>'g'+x.g+' '+x.routeSurface+'@'+x.routeSurfaceOu).join(', ')+') · un saut (10-70 m au-dessus de la dalle) dans la lune '+P.filter(x=>x.volSurface<0).length+' ('+P.filter(x=>x.volSurface<0).slice(0,4).map(x=>'g'+x.g+' '+x.volSurface+'@'+x.volSurfaceOu).join(', ')+')';}
        if(k==='asteroide'){const P=X.filter(x=>x.posee);s+=' · non posé '+(X.length-P.length)+' ('+X.filter(x=>!x.posee).slice(0,4).map(x=>'g'+x.g+' Ra'+x.Ra).join(', ')+') · Ra méd '+q(X.map(x=>x.Ra),.5)+' · route dans la roche pleine '+P.filter(x=>x.routeDansRoche>0).length+' (pire '+Math.max(0,...P.map(x=>x.routeDansRoche))+' m ; '+P.filter(x=>x.routeDansRoche>0).slice(0,4).map(x=>'g'+x.g+' '+x.routeDansRoche+'m@'+x.routeDansRocheOu).join(', ')+')';}
        console.log(s);}}
  }}
