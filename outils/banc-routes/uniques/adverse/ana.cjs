/* CONTRÔLE ADVERSE — l'analyse des jeux de routes de gen.cjs (attaques 1, 2, 4, 5, 6, 8)
     node ana.cjs carte=jade|espace   → resultats-<carte>.txt, png/<carte>-<etiq>-p<p>-proches.png */
const fs=require('fs'),path=require('path'),L=require('./lib.cjs'),P=require('../../png.cjs');
const arg=(k,d)=>{const a=process.argv.find(x=>x.startsWith(k+'='));return a?a.slice(k.length+1):d;};
const carte=arg('carte','jade'),PAL=arg('paliers','0,10,20,27').split(',').map(Number),SFX=arg('sfx','');
const D=path.join(__dirname,'data'),OUT=[];const say=s=>{OUT.push(s);console.log(s);};fs.mkdirSync(path.join(__dirname,'png'),{recursive:true});
const pc=(a,q)=>{if(!a.length)return NaN;const b=Float64Array.from(a).sort(),i=(b.length-1)*q,lo=Math.floor(i),hi=Math.ceil(i);return b[lo]+(b[hi]-b[lo])*(i-lo);};
const moy=a=>a.reduce((x,y)=>x+y,0)/Math.max(1,a.length),et=a=>{const m=moy(a);return Math.sqrt(moy(a.map(x=>(x-m)*(x-m))));};
const r0=Math.round,f1=x=>(Math.round(x*10)/10).toString();
const histo=a=>{const h={};for(const x of a)h[x]=(h[x]|0)+1;return Object.entries(h).sort((x,y)=>y[1]-x[1]);};
function charge(e,p){const f=path.join(D,carte+'-'+e+SFX+'-p'+p+'.json');return fs.existsSync(f)?JSON.parse(fs.readFileSync(f,'utf8')):null;}
/* distance entre deux routes sur [0,w] (pas 25 m) : RMS 3D et max, sans et avec miroir */
function dist(a,b,w){const K=Math.min(a.X.length,b.X.length,Math.round(w/25)+1);let q=0,qm=0,mx=0,mxm=0;
  for(let k=0;k<K;k++){const dy=a.Y[k]-b.Y[k],dz=a.Z[k]-b.Z[k],dx=a.X[k]-b.X[k],dxm=a.X[k]+b.X[k],d=Math.hypot(dx,dy,dz),dm=Math.hypot(dxm,dy,dz);q+=d*d;qm+=dm*dm;if(d>mx)mx=d;if(dm>mxm)mxm=dm;}
  return {rms:Math.sqrt(q/K),max:mx,rmsM:Math.sqrt(qm/K),maxM:mxm,K};}
function lev(a,b){const m=a.length,n=b.length,d=[];for(let i=0;i<=m;i++){d.push([i]);}for(let j=1;j<=n;j++)d[0][j]=j;for(let i=1;i<=m;i++)for(let j=1;j<=n;j++)d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));return d[m][n];}
function dessin(pairs,routes,fic){const W=900,H=230,im=P.Img(W,H*pairs.length,[250,250,247]);const C1=[200,40,40],C2=[30,90,200],G=[200,200,200];
  pairs.forEach((pr,i)=>{const a=routes[pr.i],b=routes[pr.j],mir=pr.mir?-1:1,y0=i*H;P.line(im,0,y0,W,y0,G,0);
    const K=Math.min(a.X.length,b.X.length,121);let mn=1e9,mx=-1e9;for(const r of [a,b])for(let k=0;k<K;k++){mn=Math.min(mn,r.Z[k],(r.X[k])*1,-(r.X[k]));mx=Math.max(mx,r.Z[k],r.X[k],-r.X[k]);}
    const sc=210/Math.max(1,mx-mn),ox=225,oy=y0+215; /* dessus : z vers le haut, x à droite (b en miroir s'il le faut) */
    for(const [r,c,m] of [[a,C1,1],[b,C2,mir]])for(let k=1;k<K;k++)P.line(im,ox+m*r.X[k-1]*sc,oy-(r.Z[k-1]-mn)*sc,ox+m*r.X[k]*sc,oy-(r.Z[k]-mn)*sc,c,1);
    let ymn=1e9,ymx=-1e9;for(const r of [a,b])for(let k=0;k<K;k++){ymn=Math.min(ymn,r.Y[k]);ymx=Math.max(ymx,r.Y[k]);}const sy=200/Math.max(200,ymx-ymn); /* profil : 3 km sur 440 px */
    for(const [r,c] of [[a,C1],[b,C2]])for(let k=1;k<K;k++)P.line(im,450+(k-1)*440/120,y0+215-(r.Y[k-1]-ymn)*sy,450+k*440/120,y0+215-(r.Y[k]-ymn)*sy,c,1);});
  fs.writeFileSync(fic,P.png(im));}

for(const p of PAL){const v=L.vElan(p),W10=10*v;say('\n======== '+carte.toUpperCase()+' · palier '+p+' · vPalier '+L.VW[p]+' × élan = '+r0(v)+' m/s · 10 s = '+r0(W10)+' m · rayonPalier '+r0(L.rayonPalier(p))+' m');
  const S={};for(const e of ['avant','apres']){const d=charge(e,p);if(d)S[e]=d.routes;}
  for(const e of ['avant','apres']){const R=S[e];if(!R)continue;const n=R.length;say('\n--- '+e.toUpperCase()+' ('+n+' routes de suite, graines 32 bits au hasard, base '+(charge(e,p).base)+')');
    /* ===== 1. UNICITÉ : suites et tracés ===== */
    const ks=R.map(r=>r.suite.join('>')),kq=R.map(r=>r.seq.join('>'));
    const dupS=n-new Set(ks).size,dupQ=n-new Set(kq).size;
    let t3=0,sauf1=0,lev1=0,memeEns=0;const pre3={};for(let i=0;i<n;i++)for(let j=i+1;j<n;j++){const a=R[i].suite,b=R[j].suite;
      if(a.slice(0,3).join()===b.slice(0,3).join())t3++;if(a.length===b.length&&a.length>1&&a.slice(0,-1).join()===b.slice(0,-1).join()&&a.join()!==b.join())sauf1++;if(a.join()!==b.join()&&lev(a,b)<=1)lev1++;
      if(a.join()!==b.join()&&a.slice().sort().join()===b.slice().sort().join())memeEns++;}
    say('[1] suites (un nom par module, comme orbUNoms) : '+(n-dupS)+' distinctes / '+n+' → '+dupS+' redites · séquences brutes : '+dupQ+' redites');
    say('    paires qui partagent les 3 premiers modules : '+t3+' / '+(n*(n-1)/2)+' · ne diffèrent QUE par le dernier : '+sauf1+' · à 1 retouche près (Levenshtein ≤ 1) : '+lev1+' · mêmes modules, autre ordre : '+memeEns);
    for(const w of [500,1000,1500,3000]){const ok=R.map((r,i)=>i).filter(i=>R[i].L>=w&&R[i].X.length>=Math.round(w/25)+1);const rms=[],rmsM=[],mxM=[];const prs=[];
      for(let a=0;a<ok.length;a++)for(let b=a+1;b<ok.length;b++){const d=dist(R[ok[a]],R[ok[b]],w);rms.push(d.rms);const m=Math.min(d.rms,d.rmsM);rmsM.push(m);mxM.push(d.rms<=d.rmsM?d.max:d.maxM);if(w===3000)prs.push({i:ok[a],j:ok[b],d:m,mir:d.rmsM<d.rms,max:d.rms<=d.rmsM?d.max:d.maxM});}
      const cnt=(A,t)=>A.filter(x=>x<t).length;
      say('    0-'+w+' m ('+ok.length+' routes, '+rms.length+' paires) RMS 3D : p1 '+r0(pc(rms,.01))+' · p5 '+r0(pc(rms,.05))+' · méd '+r0(pc(rms,.5))+' m | avec miroir : p1 '+r0(pc(rmsM,.01))+' · p5 '+r0(pc(rmsM,.05))+' · méd '+r0(pc(rmsM,.5))+' · min '+r0(pc(rmsM,0))+' m');
      say('        paires sous 50/100/150/200 m — brut : '+[50,100,150,200].map(t=>cnt(rms,t)).join('/')+' · miroir : '+[50,100,150,200].map(t=>cnt(rmsM,t)).join('/')+' · écart MAX (miroir) sous 100/200 m : '+[100,200].map(t=>cnt(mxM,t)).join('/'));
      if(w===3000){prs.sort((x,y)=>x.d-y.d);const top=prs.slice(0,10);say('    les 10 paires les plus proches sur 3 km (miroir compris) :');
        for(const t of top)say('      g'+R[t.i].g+' ~ g'+R[t.j].g+(t.mir?' (miroir)':'')+' : RMS '+r0(t.d)+' m, max '+r0(t.max)+' m · « '+R[t.i].suite.slice(0,4).join('>')+' » / « '+R[t.j].suite.slice(0,4).join('>')+' »');
        dessin(top,R,path.join(__dirname,'png',carte+'-'+e+'-p'+p+'-proches.png'));}}
    /* ===== 2. LES 10 PREMIÈRES SECONDES ===== */
    {const K=Math.min(Math.round(W10/25)+1,Math.min(...R.map(r=>r.CAP.length)));const desc=R.map(r=>{let sg=0;for(let k=0;k<K;k++)if(Math.abs(r.CAP[k]-r.CAP[0])>5){sg=Math.sign(r.CAP[k]-r.CAP[0]);break;}sg=sg||1;
        return {c:Array.from({length:K},(_,k)=>sg*(r.CAP[k]-r.CAP[0])),p:r.PEN.slice(0,K),ro:r.ROL?r.ROL.slice(0,K).map(x=>x==null?0:sg*x):null};});
      const dd=(a,b)=>{let qc=0,qp=0,qr=0;for(let k=0;k<K;k++){qc+=(a.c[k]-b.c[k])**2;qp+=(a.p[k]-b.p[k])**2;if(a.ro)qr+=(a.ro[k]-b.ro[k])**2;}return [Math.sqrt(qc/K),Math.sqrt(qp/K),Math.sqrt(qr/K)];};
      for(const [tc,tp,tr] of [[10,3,15],[20,5,25],[30,8,40]]){const chef=[],tail=[];for(let i=0;i<n;i++){let c=-1;for(let q=0;q<chef.length;q++){const d=dd(desc[i],desc[chef[q]]);if(d[0]<tc&&d[1]<tp&&d[2]<tr){c=q;break;}}if(c<0){chef.push(i);tail.push(1);}else tail[c]++;}
        const tri=tail.slice().sort((a,b)=>b-a);say('[2] 10 premières s ('+r0(W10)+' m, cap au miroir près, pente, roulis) : familles à ±'+tc+'° cap / '+tp+'° pente / '+tr+'° roulis (RMS) : '+chef.length+' · 3 plus grosses : '+tri.slice(0,3).join(', ')+' routes');}
      const s1=R.map(r=>r.mods.length?r.mods[0].s:Infinity);const vu=s1.filter(s=>s<W10).length,vu5=s1.filter(s=>s<5*v).length;
      say('    1er module : commence à méd '+r0(pc(s1,.5))+' m (p5 '+r0(pc(s1,.05))+', p95 '+r0(pc(s1,.95))+') = '+f1(pc(s1,.5)/v)+' s · dans les 10 s : '+vu+' / '+n+' · dans les 5 s : '+vu5+' / '+n);
      const nb10=R.map(r=>r.mods.filter(m=>m.s<W10).length);say('    modules commencés dans les 10 s : moy '+f1(moy(nb10))+' [min '+Math.min(...nb10)+', max '+Math.max(...nb10)+'] · 1er module le plus fréquent : '+histo(R.map(r=>r.suite[0]||'—')).slice(0,4).map(x=>x[0]+' '+r0(100*x[1]/n)+' %').join(', ')+' · distincts '+new Set(R.map(r=>r.suite[0])).size);
      const capAbs=R.map(r=>Math.abs(r.CAP[Math.min(r.CAP.length-1,K-1)]-r.CAP[0])),penM=R.map(r=>moy(r.PEN.slice(0,K)));
      say('    à 10 s : |cap| méd '+r0(pc(capAbs,.5))+'° [p5 '+r0(pc(capAbs,.05))+' ; p95 '+r0(pc(capAbs,.95))+'] · pente moyenne des 10 s : méd '+f1(pc(penM,.5))+'° [p5 '+f1(pc(penM,.05))+' ; p95 '+f1(pc(penM,.95))+']');}
    /* ===== 4. LA RÉPARTITION ===== */
    {const vus={};for(const r of R)for(const m of new Set(r.suite))vus[m]=(vus[m]|0)+1;const nm=R.map(r=>r.suite.length);
      say('[4] modules par route : moy '+f1(moy(nm))+' [min '+Math.min(...nm)+', max '+Math.max(...nm)+'] · présence (% des routes) : '+Object.entries(vus).sort((a,b)=>b[1]-a[1]).map(x=>x[0]+' '+r0(100*x[1]/n)).join(', '));
      if(R[0].plan){for(const k of Object.keys(R[0].plan))say('    plan.'+k+' : '+histo(R.map(r=>String(r.plan&&r.plan[k]))).map(x=>x[0]+' '+r0(100*x[1]/n)+' %').join(', '));}}
    /* ===== 5. LA DIRECTION ET LE PROFIL ===== */
    {for(const km of [1,2,3]){const k=km*40,rs=R.filter(r=>r.CAP.length>k);const c=rs.map(r=>r.CAP[k]-r.CAP[0]),y=rs.map(r=>r.Y[k]),x=rs.map(r=>r.X[k]),dir=rs.map(r=>Math.atan2(r.X[k],r.Z[k])*57.3);
      say('[5] à '+km+' km (n '+rs.length+') : cap '+f1(moy(c))+' ± '+f1(et(c))+'° · altitude '+r0(moy(y))+' ± '+r0(et(y))+' m [p5 '+r0(pc(y,.05))+' ; p95 '+r0(pc(y,.95))+'] · latéral ± '+r0(et(x))+' m · direction du point vue du départ '+f1(moy(dir))+' ± '+f1(et(dir))+'°');}
      const pm=R.map(r=>{const k=Math.min(r.Y.length-1,120);return Math.atan2(r.Y[k],Math.hypot(r.X[k],r.Z[k]))*57.3;});say('    pente moyenne 0-3 km : '+f1(moy(pm))+' ± '+f1(et(pm))+'° [p5 '+f1(pc(pm,.05))+' ; p95 '+f1(pc(pm,.95))+'] · remontées (pente moyenne 0-3 km > 0) : '+pm.filter(x=>x>0).length);
      const df=R.map(r=>Math.atan2(r.fin.x,r.fin.z)*57.3),cf=R.map(r=>r.fin.cap);say('    fin vue du départ : '+f1(moy(df))+' ± '+f1(et(df))+'° (|.| méd '+r0(pc(df.map(Math.abs),.5))+'°) · cap final déroulé '+f1(moy(cf))+' ± '+f1(et(cf))+'° · distance au départ en plan méd '+r0(pc(R.map(r=>Math.hypot(r.fin.x,r.fin.z)),.5))+' m · chute totale méd '+r0(pc(R.map(r=>r.fin.y),.5))+' m');}
    /* ===== 6. LA JOUABILITÉ ===== */
    {const Sx=R.map(r=>r.sec),row=(k,lab,inv)=>{const a=Sx.map(s=>s[k]).filter(x=>x!=null);if(!a.length)return;say('    '+lab.padEnd(34)+' méd '+f1(pc(a,.5))+' · p5 '+f1(pc(a,.05))+' · p95 '+f1(pc(a,.95))+' · pire '+f1(inv?Math.min(...a):Math.max(...a)));};
      say('[6] jouabilité (v '+r0(v)+' m/s) :');row('L','longueur (m)');row('recoupe','recoupe : plus court écart (m)',1);say('      recoupes < 60 m : '+Sx.filter(s=>s.recoupe!=null&&s.recoupe<60).length+' · < 40 m : '+Sx.filter(s=>s.recoupe!=null&&s.recoupe<40).length);
      row('rMinPlan','rayon en plan min (m, debout)',1);row('sousRP','longueur sous rayonPalier (m)');row('rMin3','rayon 3D min (m)',1);row('penteMax','pente max (°, debout)');row('pente300Max','pente sur 300 m max (°)');
      row('leveMax','crête : v²κ/g max (relatif)');row('leveM','crête : m où v²κ/g > 1');row('roulisMax','roulis vu de l\'horizon max (°/s)');row('roulisSur60','temps au-dessus de 60 °/s (s)');row('envers','part à l\'envers');row('enversMaxS','envers de suite max (s)');
      say('      routes sans envers : '+Sx.filter(s=>s.envers===0).length+' / '+n+' · sous 6 % : '+Sx.filter(s=>s.envers!=null&&s.envers<.06).length);row('droitePlanS','plus longue droite en plan, R>450 (s)');row('droite3S','plus longue droite 3D, R>450 (s)');
      row('droiteVecueS','plus longue droite vécue, < 5°/s (s)');row('rVertMin','rayon vertical min, dalle debout (m)',1);
      say('      rayon vertical sous rayonPalier : '+Sx.filter(s=>s.rVertMin!=null&&s.rVertMin<L.rayonPalier(p)).length+' routes (crêtes '+Sx.filter(s=>s.rVertMin<L.rayonPalier(p)&&s.rVertSens==='crete').length+')');
      const pire=(k,inv,m)=>R.slice().sort((a,b)=>inv?a.sec[k]-b.sec[k]:b.sec[k]-a.sec[k]).slice(0,m||3).map(r=>'g'+r.g+' '+r.sec[k]+(r.sec[k+'Ou']!=null?' @'+(Array.isArray(r.sec[k+'Ou'])?r.sec[k+'Ou'].join('/'):r.sec[k+'Ou'])+' m':'')+(k==='rVertMin'?' '+r.sec.rVertSens:'')).join(' · ');
      say('      pires — roulis : '+pire('roulisMax')+' | rayon vertical : '+pire('rVertMin',1)+' | droite vécue : '+pire('droiteVecueS')+(Sx[0].recoupe!==undefined?' | recoupe : '+R.filter(r=>r.sec.recoupe!=null).sort((a,b)=>a.sec.recoupe-b.sec.recoupe).slice(0,3).map(r=>'g'+r.g+' '+r.sec.recoupe+' m @'+r.sec.recoupeOu.join('/')).join(' · '):''));}
    /* ===== 8. LE COÛT ===== */
    {const ms=R.map(r=>r.ms),rp=R.map(r=>r.reprises);say('[8] génération (Node, route + pisteTord pour l\'espace) : méd '+r0(pc(ms,.5))+' · p95 '+r0(pc(ms,.95))+' · pire '+r0(Math.max(...ms))+' ms · reprises d\'unicité : moy '+f1(moy(rp))+', max '+Math.max(...rp)+', routes refaites '+rp.filter(x=>x>0).length);}}}
fs.writeFileSync(path.join(__dirname,'resultats-'+carte+SFX+'.txt'),OUT.join('\n')+'\n');
