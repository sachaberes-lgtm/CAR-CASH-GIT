/* ===== AVANT LE BORD, AU SOL : CE QUE DISENT LES TRACES DEJA GARDEES (2026-11-28, role « lecteur du code ») =====
   Aucune course : relit ml/ecurie/etude/sortie-preparee/sorties/lignes/*.jsonl.gz (vues gardees par course-diag.js, champs garderSol / garderVol)
   et les evenements du jeu (entete, champ ev : [t,'decol','bord',s,lat,v] / [t,'pose',...] / [t,'mort',cause,...]).
   Les 3 courses « libre » en double (3970400, 3970585, 3970659 : memes courses que la tenue de la meme graine, relecture § 8.2) sont retirees.
   Rend sur la sortie standard un JSON : A (la vitesse en 1 s au sol sur decor, nitro demandee ou non), B (le cote du decollage contre le cote annonce),
   C (place et vitesse de la caisse 1 s et 0,3 s avant un decollage subi, mortels contre poses), D (les annonces « la route lache » qui ne finissent
   pas en decollage). Usage : node ml/ecurie/etude/avant-le-bord/lecteur-code/sol-avant-bord.js > .../sol-avant-bord.json */
'use strict';
const fs=require('fs'),zlib=require('zlib'),path=require('path');
const DOS=path.join(__dirname,'..','..','sortie-preparee','sorties','lignes');
const DOUBLES=new Set(['libre-3970400','libre-3970585','libre-3970659']);
const DECOR={canyon:1,grotte:1,jade:1,ville:1};
const q=(a,p)=>{if(!a.length)return null;const b=a.slice().sort((x,y)=>x-y);return p.map(k=>+b[Math.min(b.length-1,Math.floor(k*(b.length-1)+.5))].toFixed(3));};
const out={A:{},B:{},C:{},D:{},courses:0};
const dvN={},dvC={},rel={N:[],C:[]};
const B={meme:0,oppose:0,sansAnnonce:0,parCarte:{}};
const C={};const D={episodes:0,sansDecol:0,parCarte:{}};
for(const f of fs.readdirSync(DOS)){
  if(!f.endsWith('.jsonl.gz'))continue;const nom=f.replace('.jsonl.gz','');if(DOUBLES.has(nom))continue;
  const L=zlib.gunzipSync(fs.readFileSync(path.join(DOS,f))).toString().split('\n').filter(Boolean).map(l=>JSON.parse(l));
  const H=L[0],V=L.slice(1);out.courses++;
  const ev=H.ev||[];
  /* A. la vitesse en 1 s, au sol, sur decor, sans glisse ni rebond ni dessous, vues continues (pas <= 0,11 s) */
  for(let i=0;i<V.length;i++){const a=V[i];if(a.mo!=='s'||!DECOR[a.c]||a.gl||a.rb||a.de)continue;
    let j=i,ok=true;while(j+1<V.length&&V[j+1].t-a.t<=1.001){if(V[j+1].mo!=='s'||V[j+1].t-V[j].t>.11||V[j+1].gl||V[j+1].rb||V[j+1].de||V[j+1].c!==a.c){ok=false;break;}j++;}
    if(!ok||V[j].t-a.t<.95)continue;
    /* l'ordre de nitro sur [t-0,2 ; t+0,8] (la main met ~0,18 s) */
    let k0=i;while(k0>0&&a.t-V[k0-1].t<=.21)k0--;let tous=true,aucun=true;
    for(let k=k0;k<=j;k++){if(V[k].t>a.t+.8)break;const n=!!(V[k].O&&V[k].O.nitro);if(n)aucun=false;else tous=false;}
    const dv=V[j].v-a.v;
    if(tous){(dvN[a.c]=dvN[a.c]||[]).push(dv);rel.N.push(dv/Math.max(1,a.v));}
    else if(aucun){(dvC[a.c]=dvC[a.c]||[]).push(dv);rel.C.push(dv/Math.max(1,a.v));}}
  /* decollages par le bord et leur issue */
  for(let e=0;e<ev.length;e++){const x=ev[e];if(x[1]!=='decol'||x[2]!=='bord')continue;
    let issue='autre';for(let g=e+1;g<ev.length;g++){if(ev[g][1]==='pose'){issue='pose';break;}if(ev[g][1]==='mort'){issue='mort';break;}if(ev[g][1]==='decol')break;}
    const t0=x[0];const sol=V.filter(v=>v.mo==='s'&&v.t<=t0&&t0-v.t<=1.65);if(!sol.length)continue;
    const der=sol[sol.length-1];if(t0-der.t>.12)continue;
    if(der.D&&der.D.so)continue;   /* un raccourci engage : vol voulu, pas subi */
    const carte=der.c;if(!DECOR[carte])continue;
    /* B. le cote annonce (tn.co a la premiere vue de la derniere suite tient:false) contre le cote du decollage (signe de ev lat) */
    let prem=null;for(let k=sol.length-1;k>=0;k--){const tn=sol[k].tn;if(tn&&tn.ti===false)prem=sol[k];else break;}
    const pc=B.parCarte[carte]||(B.parCarte[carte]={meme:0,oppose:0,sansAnnonce:0});
    if(!prem){B.sansAnnonce++;pc.sansAnnonce++;}
    else if(Math.sign(x[4])===prem.tn.co){B.meme++;pc.meme++;}else{B.oppose++;pc.oppose++;}
    /* C. 1 s et 0,3 s avant : |lat|/demi, |cap|, vitesse ; et la vitesse du decollage (ev) */
    const avant=dt=>{let b=null;for(const v of sol)if(Math.abs(t0-v.t-dt)<=.06)b=v;return b;};
    const o=C[carte]||(C[carte]={mort:{n:0,lat1:[],cap1:[],v1:[],lat03:[],vDecol:[],annonce:[]},pose:{n:0,lat1:[],cap1:[],v1:[],lat03:[],vDecol:[],annonce:[]}});
    const g=o[issue==='mort'?'mort':'pose'];if(issue==='autre')continue;g.n++;
    const a1=avant(1),a3=avant(.3);
    if(a1){g.lat1.push(Math.abs(a1.lat)/a1.demi);g.cap1.push(Math.abs(a1.cap));g.v1.push(a1.v);}
    if(a3)g.lat03.push(Math.abs(a3.lat)/a3.demi);
    g.vDecol.push(x[5]);if(prem)g.annonce.push(+(t0-prem.t).toFixed(2));}
  /* D. les suites de vues au sol sur decor avec tient:false : combien ne finissent pas en decollage dans les 0,6 s */
  const decT=ev.filter(x=>x[1]==='decol').map(x=>x[0]);
  for(let i=0;i<V.length;i++){const a=V[i];if(a.mo!=='s'||!DECOR[a.c]||!(a.tn&&a.tn.ti===false))continue;
    if(i>0&&V[i-1].mo==='s'&&V[i-1].tn&&V[i-1].tn.ti===false&&a.t-V[i-1].t<=.11)continue;   /* le debut d'une suite seulement */
    D.episodes++;const pd=D.parCarte[a.c]||(D.parCarte[a.c]={episodes:0,sansDecol:0});pd.episodes++;
    let fin=i;while(fin+1<V.length&&V[fin+1].mo==='s'&&V[fin+1].tn&&V[fin+1].tn.ti===false)fin++;
    if(!decT.some(t=>t>=a.t&&t-V[fin].t<=.6)){D.sansDecol++;pd.sansDecol++;}}
}
for(const c in dvN)out.A[c]={nitro:{n:dvN[c].length,q10_50_90:q(dvN[c],[.1,.5,.9])},coupee:{n:(dvC[c]||[]).length,q10_50_90:q(dvC[c]||[],[.1,.5,.9])}};
for(const c in dvC)if(!out.A[c])out.A[c]={nitro:{n:0},coupee:{n:dvC[c].length,q10_50_90:q(dvC[c],[.1,.5,.9])}};
out.A.relatif={nitro:{n:rel.N.length,q10_50_90:q(rel.N,[.1,.5,.9])},coupee:{n:rel.C.length,q10_50_90:q(rel.C,[.1,.5,.9])}};
out.B=B;
for(const c in C){out.C[c]={};for(const k of ['mort','pose']){const g=C[c][k];out.C[c][k]={n:g.n,latSurDemi_1s:q(g.lat1,[.1,.5,.9]),cap_1s:q(g.cap1,[.1,.5,.9]),vitesse_1s:q(g.v1,[.1,.5,.9]),
  latSurDemi_03s:q(g.lat03,[.1,.5,.9]),vitesseDecol:q(g.vDecol,[.1,.5,.9]),annonceAvant_s:q(g.annonce,[.1,.5,.9])};}}
out.D=D;
console.log(JSON.stringify(out,null,1));
