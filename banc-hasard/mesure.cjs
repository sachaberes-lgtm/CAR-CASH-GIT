// Le banc du hasard des tracés (NON COMMITÉ) : node mesure.cjs <site> <portHttp> <portChrome> [n=40] [paliers=0] [cartes=canyon,dunes] [sortie]
// Charge le jeu (copie site-<site>/ avec le crochet __ctrl), génère n tracés par map, mesure : cap, longueur, écart de forme, ordre et place des repères,
// rayon minimal, séparation, temps — et écrit <sortie>.json + <sortie>.svg (les plans vus de dessus).
const path=require('path'),fs=require('fs'),{serveur,chrome,tue,dort}=require('./cdp.cjs');
const [site,ph,pc]=[process.argv[2]||'apres',+process.argv[3]||8637,+process.argv[4]||9637];
const N=+process.argv[5]||40,PALIERS=(process.argv[6]||'0').split(',').map(Number),CARTES=(process.argv[7]||'canyon,dunes').split(','),SORTIE=process.argv[8]||path.join(__dirname,'res-'+site);
const ETAT={canyon:'CY',dunes:'DN'};
(async()=>{
  await serveur(path.join(__dirname,'site-'+site),ph);
  const c=await chrome(pc,{tmp:path.join(__dirname,'tmp')});
  await c.send('Page.enable');await c.send('Network.enable');await c.send('Network.setBypassServiceWorker',{bypass:true});
  await c.send('Page.addScriptToEvaluateOnNewDocument',{source:"try{if(!sessionStorage.__cc){sessionStorage.__cc=1;localStorage.cashcarSave=JSON.stringify({tuto:1,permis:1,facile:0,sfx:false,mus:false,vox:false,plq:{m:'fr',x:'CC-161-LG',ok:1}});}}catch(e){}"});
  await c.send('Page.navigate',{url:'http://127.0.0.1:'+ph+'/index.html?colonne=0'+(process.env.URLX||'')});
  let ok=false;for(let i=0;i<900&&!ok;i++){await dort(200);try{ok=await c.ev('!!window.__gameReady&&typeof window.__ctrl==="function"');}catch(e){}}
  if(!ok)throw new Error('le jeu ne démarre pas');
  const err0=await c.ev('JSON.stringify([window.__loopErr||null])');
  const R={site,err0,cartes:{}};
  for(const carte of CARTES)for(const pal of PALIERS){
    const res=await c.ev(`(function(){__ev('engTier=${pal}');const out=[];const E='${ETAT[carte]}';
      for(let i=0;i<${N};i++){const g=(Math.imul(i+1,2654435761)^0x5EED)>>>0;const t0=performance.now();let ctrl,err=null;
        try{ctrl=__ctrl('${carte}',null,g);}catch(e){err=String(e&&e.stack||e);}
        const ms=performance.now()-t0;const st=__ev(E);const Q=st&&st.Q?Object.keys(st.Q).map(k=>[k,st.Q[k].p.x,st.Q[k].p.y,st.Q[k].p.z,st.Q[k].phi]):[];
        out.push({g,ms:Math.round(ms),err,ctrl,Q,rmin:st.rmin,sep:st.sep,hz:st.hz?JSON.parse(JSON.stringify(st.hz)):null,lc:__ev("(function(){const sv=LVL.cur;LVL.cur=sfNiveau('${carte}',Object.keys(SF_CARTES['${carte}'].m)[0]);try{return longueurCible();}finally{LVL.cur=sv;}})()")});}
      __ev('engTier=0');return out;})()`);
    R.cartes[carte+'@'+pal]=analyse(res,carte);
  }
  R.err1=await c.ev('JSON.stringify([window.__loopErr||null])');
  fs.writeFileSync(SORTIE+'.json',JSON.stringify(R));
  fs.writeFileSync(SORTIE+'.svg',svg(R));
  for(const k in R.cartes){const a=R.cartes[k];console.log('\n=== '+k+' ===');for(const [x,v] of Object.entries(a.resume))console.log(x.padEnd(14),JSON.stringify(v));}
  tue();process.exit(0);
})().catch(e=>{console.error(e);tue();process.exit(1);});

const SECTIONS={canyon:{breche0:'brèche',fer0:'fer',racA0:'racA',racB0:'racB',racC0:'racC',racD0:'racD',racE0:'racE',racF0:'racF',racG0:'racG',racH0:'racH',etroit0:'étroits',arche0:'arche',amphi0:'amphi',mine0:'mine',chameau:'chameau',bosses:'bosses',finale0:'finale'},
  dunes:{erg0:'erg',tob0:'toboggan',racA0:'racA',racB0:'racB',racC0:'racC',racD0:'racD',racE0:'racE',racF0:'racF',racG0:'racG',vag0:'vagues',vag2:'vagues2',vlei0:'vlei',cr2a:'crête2',obel0:'obélisque',oasis0:'oasis'}};
function analyse(res,carte){
  const tr=[],errs=[];
  for(const o of res){if(o.err){errs.push(o.err);continue;}
    const C=o.ctrl,n=C.length,acc=new Float64Array(n);for(let k=1;k<n;k++)acc[k]=acc[k-1]+Math.hypot(C[k][0]-C[k-1][0],C[k][2]-C[k-1][2]);const Lt=acc[n-1];
    const fr=p=>{let bi=0,bd=1e18;for(let j=0;j<n;j++){const d=(C[j][0]-p[0])**2+(C[j][1]-p[1])**2+(C[j][2]-p[2])**2;if(d<bd){bd=d;bi=j;}}return acc[bi]/Lt;};
    const Q={};for(const q of o.Q)Q[q[0]]={f:fr([q[1],q[2],q[3]]),phi:q[4]};
    // rééchantillonnage : 64 points par fraction de longueur, départ à l'origine
    const R64=[];let j=0;for(let k=0;k<64;k++){const s=Lt*k/63;while(j<n-2&&acc[j+1]<s)j++;const u=(s-acc[j])/Math.max(1e-9,acc[j+1]-acc[j]);R64.push([C[j][0]+(C[j+1][0]-C[j][0])*u-C[0][0],C[j][2]+(C[j+1][2]-C[j][2])*u-C[0][2]]);}
    const cap=Math.atan2(C[n-1][0]-C[0][0],C[n-1][2]-C[0][2])*57.2958,cap0=Math.atan2(C[Math.min(n-1,3)][0]-C[0][0],C[Math.min(n-1,3)][2]-C[0][2])*57.2958;
    // rayon minimal (par trois points consécutifs, plan xz)
    let rmn=1e9;for(let k=1;k<n-1;k++){const a=C[k-1],b=C[k],c=C[k+1],ab=Math.hypot(b[0]-a[0],b[2]-a[2]),bc=Math.hypot(c[0]-b[0],c[2]-b[2]),ca=Math.hypot(a[0]-c[0],a[2]-c[2]);const cr=Math.abs((b[0]-a[0])*(c[2]-a[2])-(b[2]-a[2])*(c[0]-a[0]));if(cr<1e-6)continue;const Rk=ab*bc*ca/(2*cr);if(Rk<rmn)rmn=Rk;}
    // pente : dy/dxz par segment, extrêmes
    let pmax=-1e9,pmin=1e9;for(let k=1;k<n;k++){const dl=acc[k]-acc[k-1];if(dl<1)continue;const p=(C[k][1]-C[k-1][1])/dl;if(p>pmax)pmax=p;if(p<pmin)pmin=p;}
    // croisements dans le plan (segments à plus de 1,2 km l'un de l'autre sur la route) — l'écart vertical au croisement
    const X=[];for(let a=0;a<n-1;a++)for(let b=a+1;b<n-1;b++){if(acc[b]-acc[a]<1200)continue;const p=C[a],p2=C[a+1],q=C[b],q2=C[b+1];
      const d=(p2[0]-p[0])*(q2[2]-q[2])-(p2[2]-p[2])*(q2[0]-q[0]);if(Math.abs(d)<1e-9)continue;const t=((q[0]-p[0])*(q2[2]-q[2])-(q[2]-p[2])*(q2[0]-q[0]))/d,u=((q[0]-p[0])*(p2[2]-p[2])-(q[2]-p[2])*(p2[0]-p[0]))/d;
      if(t>=0&&t<=1&&u>=0&&u<=1){const ya=p[1]+(p2[1]-p[1])*t,yb=q[1]+(q2[1]-q[1])*u;X.push([+(acc[a]/Lt).toFixed(3),+(acc[b]/Lt).toFixed(3),Math.round(ya-yb)]);}}
    const BOU=Object.keys(Q).filter(k=>/^rac[A-Z]0$/.test(k)).map(k=>{const nm=k.slice(0,4);return Q[nm+'3']?[Q[nm+'0'].f*Lt-400,Q[nm+'3'].f*Lt+700]:null;}).filter(Boolean);
    const Xh=X.filter(x=>!BOU.some(b=>x[0]*Lt>=b[0]&&x[1]*Lt<=b[1]));
    tr.push({g:o.g,ms:o.ms,L:Lt,hz:o.hz,Xh,lc:o.lc,dy:C[n-1][1]-C[0][1],cap,cap0,Q,R64,rmn,rmin:o.rmin,sep:o.sep,pmax,pmin,X,C:C.map(p=>[Math.round(p[0]),Math.round(p[1]),Math.round(p[2])])});}
  // écart de forme
  let sd=0,np=0;for(let a=0;a<tr.length;a++)for(let b=a+1;b<tr.length;b++){let d=0;for(let k=0;k<64;k++)d+=Math.hypot(tr[a].R64[k][0]-tr[b].R64[k][0],tr[a].R64[k][1]-tr[b].R64[k][1]);sd+=d/64;np++;}
  const Lm=tr.reduce((a,t)=>a+t.L,0)/Math.max(1,tr.length);
  // l'ordre des repères
  const S9=SECTIONS[carte];
  const ordres={},place={};for(const t of tr){const l=Object.keys(S9).filter(k=>t.Q[k]).sort((a,b)=>t.Q[a].f-t.Q[b].f);const o=l.map(k=>S9[k]).join(' → ');ordres[o]=(ordres[o]||0)+1;
    for(const k of l){(place[S9[k]]=place[S9[k]]||[]).push(t.Q[k].f);}}
  const mm=a=>a.length?[Math.round(Math.min(...a)*100),Math.round(Math.max(...a)*100)]:null,ext=f=>{const v=tr.map(f);return [Math.round(Math.min(...v)),Math.round(Math.max(...v))];};
  const resume={n:tr.length,echelle:tr[0]&&tr[0].hz?[tr[0].hz.LL,tr[0].hz.RS,tr[0].hz.RMIN]:null,erreurs:errs.length,err:errs.slice(0,2),ecart:+(sd/np/Lm).toFixed(3),L_km:ext(t=>t.L/100).map(v=>v/10),visee_km:ext(t=>t.lc/100).map(v=>v/10),cap:ext(t=>t.cap),cap0:ext(t=>t.cap0),
    rmin_sur_RMIN:+Math.min(...tr.map(t=>t.rmn/t.rmin)).toFixed(2),sep:ext(t=>t.sep),pente:[+Math.min(...tr.map(t=>t.pmin)).toFixed(2),+Math.max(...tr.map(t=>t.pmax)).toFixed(2)],dy:ext(t=>t.dy),ms:ext(t=>t.ms),
    croisements:tr.reduce((a,t)=>a+t.X.length,0),croisHorsBoucle:tr.reduce((a,t)=>a+t.Xh.length,0),Lmoy:+(tr.reduce((a,t)=>a+t.L,0)/tr.length/1000).toFixed(2),ratio:+(tr.reduce((a,t)=>a+t.L/Math.max(1,t.lc),0)/tr.length).toFixed(2),pieces:(()=>{const P={};for(const t of tr)for(const q of (t.hz&&t.hz.p)||[]){(P[q[0]]=P[q[0]]||[]).push(q[1]);}return Object.fromEntries(Object.entries(P).map(([k,v])=>[k,[v.length,Math.round(v.reduce((a,b)=>a+b,0)/v.length),Math.min(...v),Math.max(...v)]]));})(),croisMinDy:Math.min(1e9,...tr.flatMap(t=>t.X.map(x=>Math.abs(x[2])))),nOrdres:Object.keys(ordres).length,ordres:Object.entries(ordres).sort((a,b)=>b[1]-a[1]).slice(0,6),place:Object.fromEntries(Object.entries(place).map(([k,v])=>[k,mm(v).concat([v.length])]))};
  return {resume,tr};}

function svg(R){const W=1500,cells=[];let y0=10,out=[];
  const COL={'brèche':'#e33','fer':'#f80','racA':'#36f','racB':'#36f','racC':'#36f','racD':'#36f','racE':'#36f','racF':'#36f','racG':'#36f','racH':'#36f','étroits':'#a3a','arche':'#0a0','amphi':'#0aa','mine':'#555','chameau':'#a60','bosses':'#c90','finale':'#000',
    'erg':'#e33','toboggan':'#f80','vagues':'#a3a','vagues2':'#a3a','vlei':'#0aa','crête2':'#c90','obélisque':'#0a0','oasis':'#000'};
  for(const k in R.cartes){const a=R.cartes[k],carte=k.split('@')[0],S9=SECTIONS[carte];
    out.push(`<text x="10" y="${y0+18}" font-family="monospace" font-size="16">${k} — ${R.site} — écart ${a.resume.ecart} · cap ${a.resume.cap.join('…')}° · ${a.resume.nOrdres} ordres · L ${a.resume.L_km.join('–')} km</text>`);y0+=28;
    const cw=180,chh=180,per=8;let i=0;
    for(const t of a.tr){const cx=10+(i%per)*cw,cy=y0+Math.floor(i/per)*chh;let xs=t.C.map(p=>p[0]),zs=t.C.map(p=>p[2]);const ext=Math.max(Math.max(...xs)-Math.min(...xs),Math.max(...zs)-Math.min(...zs),1),sc=(cw-20)/ext,mx=(Math.max(...xs)+Math.min(...xs))/2,mz=(Math.max(...zs)+Math.min(...zs))/2;
      const P=p=>[(cx+cw/2+(p[0]-mx)*sc).toFixed(1),(cy+chh/2-(p[2]-mz)*sc).toFixed(1)]; // nord en haut
      out.push(`<rect x="${cx}" y="${cy}" width="${cw-4}" height="${chh-4}" fill="#faf6ee" stroke="#ccc"/>`);
      out.push(`<polyline fill="none" stroke="#333" stroke-width="1.3" points="${t.C.map(p=>P(p).join(',')).join(' ')}"/>`);
      const p0=P(t.C[0]);out.push(`<circle cx="${p0[0]}" cy="${p0[1]}" r="4" fill="#0c0"/>`);
      for(const q in t.Q){const nm=S9[q];if(!nm)continue;const n=t.C.length,j=Math.round(t.Q[q].f*(n-1));let bi=0,bd=1e18,acc=0;
        const pp=t.C[Math.max(0,Math.min(n-1,j))];}
      // repères : placés par fraction de longueur
      const n=t.C.length,acc=[0];for(let k2=1;k2<n;k2++)acc.push(acc[k2-1]+Math.hypot(t.C[k2][0]-t.C[k2-1][0],t.C[k2][2]-t.C[k2-1][2]));
      for(const q in t.Q){const nm=S9[q];if(!nm)continue;const s=t.Q[q].f*acc[n-1];let j=0;while(j<n-1&&acc[j+1]<s)j++;const pp=P(t.C[j]);out.push(`<circle cx="${pp[0]}" cy="${pp[1]}" r="3.2" fill="${COL[nm]||'#999'}"><title>${nm}</title></circle>`);}
      out.push(`<text x="${cx+4}" y="${cy+12}" font-family="monospace" font-size="10">${Math.round(t.cap)}° ${(t.L/1000).toFixed(1)}km</text>`);i++;}
    y0+=Math.ceil(i/per)*chh+10;
    // la superposition, même échelle, départ à l'origine
    const sz=520,ox=10+sz/2,oz=y0+sz-20;let mxe=1;for(const t of a.tr)for(const p of t.C)mxe=Math.max(mxe,Math.hypot(p[0]-t.C[0][0],p[2]-t.C[0][2]));const sc=(sz-40)/mxe;
    out.push(`<rect x="10" y="${y0}" width="${sz}" height="${sz}" fill="#fff" stroke="#ccc"/>`);
    for(const t of a.tr)out.push(`<polyline fill="none" stroke="rgba(40,40,120,.35)" stroke-width="1" points="${t.C.map(p=>[(ox+(p[0]-t.C[0][0])*sc*.5).toFixed(1),(oz-(p[2]-t.C[0][2])*sc*.5).toFixed(1)].join(',')).join(' ')}"/>`);
    y0+=sz+20;}
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${y0}" viewBox="0 0 ${W} ${y0}"><rect width="100%" height="100%" fill="#fff"/>${out.join('\n')}</svg>`;}
