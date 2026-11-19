/* ===== LES ROUTES UNIQUES — LA MESURE (2026-11-17, Sacha : « la map prend toujours la même direction, on voit toujours les mêmes modules, Jade commence toujours
   par une boucle, une grande descente et une autre boucle ») =====
   Combien les routes d'une map se ressemblent d'une partie à l'autre, en chiffres — AVANT et APRÈS la refonte du tirage (même outil, même sortie).
     node outils/banc-routes/uniques/mesure.cjs carte=jade|espace [search='?jade=avatar'] [graines=1-200] [paliers=0,10] [out=passation/routes-uniques/avant]
          [etiquette=avant] [nom=defaut] [chaine=1] [ref=<commit>] [seuils=100,200,300] [km=3]
   · carte=jade : le chemin du jeu (genJadeAG, 10 essais, l'essai gagnant) · carte=espace : genCtrl → genCtrl1 (meilleur de 6) → pisteTord.
   · search : la query de l'URL du jeu (?jade=avatar, ?espace=voyages…) ; nom : l'étiquette de la variante dans les fichiers (par défaut tirée de search, « defaut » sans).
   · ref=<commit> : mesurer le code de ce commit (git show) au lieu du worktree — l'AVANT de la refonte : ref=88a648892.
   · chaine=1 (défaut, comme le jeu) : en espace, la mémoire ORB_PIOCHE passe d'une graine à la suivante ; chaine=0 : chaque route est une 1re route.
   Écrit <out>/<carte>-<nom>-mesure.json (tout : les routes rééchantillonnées, les modules, les statistiques) et <carte>-<nom>-resume.txt (les tableaux).
   Le repère : origine au 1er point, z = le cap initial (60 premiers m), x = le côté où le cap croît, y = l'altitude ; cap déroulé (non replié), pente en degrés (− : descend). */
const fs=require('fs'),path=require('path'),R=require('./routes.cjs');
const arg=(k,d)=>{const a=process.argv.find(x=>x.startsWith(k+'='));return a?a.slice(k.length+1):d;};
const carte=arg('carte','jade'),search=arg('search',''),G=arg('graines','1-200').split('-').map(Number),PAL=arg('paliers','0,10').split(',').map(Number);
const out=path.resolve(R.RAC,arg('out','passation/routes-uniques/avant')),etiq=arg('etiquette','avant'),chaine=arg('chaine','1')!=='0';
const nom=arg('nom',search?search.replace(/^\?/,'').replace(/[a-z]+=/g,'').replace(/[^a-z0-9]+/gi,'-'):'defaut');
const SEUILS=arg('seuils','100,200,300').split(',').map(Number),KM=+arg('km','3')*1000;
const PTS=[300,500,1000,2000,3000].filter(s=>s<=KM),PAS_TRACE=20; /* (m, multiple de 10 : le pas de repere) */
fs.mkdirSync(out,{recursive:true});

/* ---------- LE CATALOGUE : tout ce que le générateur SAIT dessiner, lu dans le code (et non dans les tirages) ---------- */
function catalogue(){const lire=R.lecteur(REF);
  if(carte==='jade'){const a=lire('code/maps/jade-alleluia.js'),v=lire('code/maps/jade-avatar.js');
    const cles=JSON.parse((/const JA_CLES=(\[[^\]]*\])/.exec(a)[1]).replace(/'/g,'"')),av=JSON.parse((/const JAV_CLES=(\[[^\]]*\])/.exec(v)[1]).replace(/'/g,'"'));
    const neuves=[...new Set((v.match(/S9\.([a-z]+)=/g)||[]).map(x=>x.slice(3,-1)))];
    return {source:'JA_CLES (jade-alleluia.js) ; avec ?jade=avatar en plus les S9.x= de jade-avatar.js (JAV_CLES)',defaut:cles,avatar:[...new Set(cles.concat(av,neuves))]};}
  const o=lire('code/maps/orbite-modules.js'),v=lire('code/maps/orbite-voyages.js');
  const mo=[...new Set((o.match(/M\.([a-zA-Z]+)=function/g)||[]).map(x=>x.slice(2,-9)))],mv=[...new Set((v.match(/M\.([a-zA-Z]+)=function/g)||[]).map(x=>x.slice(2,-9)).concat(JSON.parse((/const VOY_GEANTS=(\[[^\]]*\])/.exec(v)[1]).replace(/'/g,'"'))))];
  if(/const ESP_SANS_GEANTS=/.test(o)&&!/[?&]plus=([^&]*,)?geants(,|&|$)/.test(search)){const VG=JSON.parse((/const VOY_GEANTS=(\[[^\]]*\])/.exec(v)[1]).replace(/'/g,'"'));for(const k of VG){const i=mv.indexOf(k);if(i>=0)mv.splice(i,1);}} /* (2026-11-18, L'ESPACE SANS GÉANTS) les quatre géants des voyages ne sont plus des modules (sauf ?plus=geants) */
  const ou=lire('code/maps/orbite-uniques.js'),mu=ou?[...new Set((ou.match(/M\.([a-zA-Z]+)=function/g)||[]).map(x=>x.slice(2,-9)))]:[]; /* (2026-11-17) la route unique : les petits modules d'orbite-uniques.js (et les voyages) — sauf avec ?sans=uniques */
  return {source:'les M.x=function de orbModules (orbite-modules.js) ; avec ?espace=voyages en plus ceux de orbVoyModules (orbite-voyages.js) ; avec la route unique (orbite-uniques.js, sans ?sans=uniques) tout cela et ses petits modules, moins le croisement (« looping dans aucune map »)',defaut:mo,voyages:mo.concat(mv),uniques:mu.length?mo.concat(mv,mu).filter(x=>x!=='croisement'):null,
    note:'les marques (fig) ne portent pas toujours le nom du module : torsade(gr) → grande-torsade, sret → s-retourne, failleEnvers → envers-entree + faille-envers + envers-sortie'};}
/* une marque → son module du catalogue */
const FIG2MOD={'grande-torsade':'torsade','s-retourne':'sret','envers-entree':'failleEnvers','faille-envers':'failleEnvers','envers-sortie':'failleEnvers'};
const modDe=f=>FIG2MOD[f]||(/-(entree|sortie)$/.test(f)?f.replace(/-(entree|sortie)$/,''):f); /* (voyages) les géants : X-entree, X, X-sortie → X */

/* ---------- les petits outils statistiques ---------- */
const moy=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:NaN,et=a=>{if(a.length<2)return 0;const m=moy(a);return Math.sqrt(a.reduce((s,x)=>s+(x-m)*(x-m),0)/(a.length-1));};
const pc=(a,p)=>{if(!a.length)return NaN;const b=a.slice().sort((x,y)=>x-y),i=(b.length-1)*p,lo=Math.floor(i),hi=Math.ceil(i);return b[lo]+(b[hi]-b[lo])*(i-lo);};
const r0=x=>Math.round(x),r1=x=>Math.round(x*10)/10,r2=x=>Math.round(x*100)/100;
const histo=a=>{const h={};for(const x of a)h[x]=(h[x]|0)+1;return Object.entries(h).sort((x,y)=>y[1]-x[1]);};

/* ---------- LA MESURE ---------- */
const REF=arg('ref',''),M=R.moteur(carte,search,REF),CAT=catalogue(),catVar=carte==='jade'?(/jade=avatar/.test(search)?CAT.avatar:CAT.defaut):(CAT.uniques&&!/sans=([^&]*,)?uniques/.test(search)?CAT.uniques:/espace=voyages/.test(search)?CAT.voyages:CAT.defaut);
const tout={outil:'outils/banc-routes/uniques/mesure.cjs',etiquette:etiq,carte,search,nom,chaine,date:new Date().toISOString(),commit:REF||((function(){try{return require('child_process').execSync('git rev-parse --short HEAD',{cwd:R.RAC}).toString().trim();}catch(e){return null;}})()+' + worktree'),fichiers:M.fichiers,
  graines:G,paliers:PAL,pasTrace:PAS_TRACE,catalogue:{liste:catVar,source:CAT.source,note:CAT.note||null},parPalier:{}};
const lignes=[];const dire=s=>{lignes.push(s);console.log(s);};
dire('== ROUTES UNIQUES · '+carte+' · '+nom+(search?' ('+search+')':'')+' · '+etiq+' · graines '+G.join('-')+' · commit '+tout.commit+(carte==='espace'?' · mémoire ORB_PIOCHE '+(chaine?'enchaînée (comme le jeu)':'remise à zéro'):''));
for(const p of PAL){const t0=Date.now(),routes=[];let err=0;
  for(let g=G[0];g<=G[1];g++){let r;const t9=Date.now();try{r=M.route(g,p,{chaine});}catch(e){err++;console.log('  EXCEPTION g'+g+' p'+p+' : '+String(e&&e.stack||e).split('\n').slice(0,2).join(' | '));continue;}
    const ms=Date.now()-t9,Gx=R.repere(r.ctrl,10),S=R.abscisses(r.ctrl);
    const ech=[];for(let s=0;s<=Math.min(KM,Gx.L);s+=100){const k=Math.round(s/10);ech.push({s,x:r1(Gx.X[k]),y:r1(Gx.Y[k]),z:r1(Gx.Z[k]),cap:r1(Gx.CAP[k]),pente:r1(Gx.PEN[k])});}
    const trace=[];for(let k=0;k<Gx.n;k+=PAS_TRACE/10)trace.push([r0(Gx.X[k]),r0(Gx.Y[k]),r0(Gx.Z[k])]);
    const mods=r.mods.map(m=>({nom:m.nom,mod:modDe(m.nom),s:r0(R.absMarque(S,m.i0)),s1:r0(R.absMarque(S,m.i1)),climax:m.climax||undefined,rac:m.rac||undefined}));
    /* la suite des modules, sans les doublons de marque d'un même module composé (la faille à l'envers : trois marques) */
    const suite=[];for(const m of mods)if(!suite.length||suite[suite.length-1]!==m.mod)suite.push(m.mod);
    const capFin=Gx.CAP[Gx.n-1],dirFin=Math.atan2(Gx.X[Gx.n-1],Gx.Z[Gx.n-1])*180/Math.PI;
    routes.push({g,ms,L:r0(Gx.L),ech,trace,mods,suite,fiche:r.fiche,capFin:r1(capFin),dirFin:r1(dirFin),capMin:r1(Math.min(...Gx.CAP)),capMax:r1(Math.max(...Gx.CAP)),
      _G:Gx});}
  const n=routes.length,A={n,err,msMoy:r0(moy(routes.map(r=>r.ms))),secondes:r1((Date.now()-t0)/1000)};
  /* 1. LE FAISCEAU : cap, x, y, z aux abscisses repères */
  A.L={moy:r0(moy(routes.map(r=>r.L))),min:Math.min(...routes.map(r=>r.L)),max:Math.max(...routes.map(r=>r.L))};
  A.points={};for(const s of PTS){const rs=routes.filter(r=>r._G.L>=s),k=s/10,v=f=>rs.map(r=>r._G[f][k]);const o={n:rs.length};
    for(const [f,nm] of [['CAP','cap'],['X','x'],['Y','y'],['Z','z']]){const a=v(f);o[nm]={moy:r1(moy(a)),et:r1(et(a)),p5:r1(pc(a,.05)),p95:r1(pc(a,.95)),etendue:r1(pc(a,.95)-pc(a,.05))};}
    const ab=v('CAP').map(Math.abs);o.capAbsMed=r1(pc(ab,.5));
    o.faisceau=r0(pc(v('X'),.95)-pc(v('X'),.05)); /* la largeur du faisceau (p5-p95 du latéral) */
    o.dirMoy=r1(moy(rs.map(r=>Math.atan2(r._G.X[k],r._G.Z[k])*180/Math.PI))); /* la direction du point vu du départ */
    o.dirEt=r1(et(rs.map(r=>Math.atan2(r._G.X[k],r._G.Z[k])*180/Math.PI)));
    A.points[s]=o;}
  /* 2. LA RESSEMBLANCE ENTRE ROUTES : distance 3D moyenne entre deux routes aux mêmes abscisses (100 → 1500 m), rapportée à l'abscisse ; miroir compris (x → −x) */
  const SR=[];for(let s=100;s<=1500;s+=100)SR.push(s);const ok=routes.filter(r=>r._G.L>=1500);
  const dist=(a,b,mir)=>{let q=0,rel=0;for(const s of SR){const k=s/10,dx=a._G.X[k]-(mir?-1:1)*b._G.X[k],dy=a._G.Y[k]-b._G.Y[k],dz=a._G.Z[k]-b._G.Z[k],d=Math.hypot(dx,dy,dz);q+=d*d;rel+=d/s;}return {rms:Math.sqrt(q/SR.length),rel:rel/SR.length};};
  const DM=[],DMm=[],REL=[],RELm=[];const N9=ok.length,MAT=new Float32Array(N9*N9),MATm=new Float32Array(N9*N9);
  for(let i=0;i<N9;i++)for(let j=i+1;j<N9;j++){const d=dist(ok[i],ok[j],false),dm=dist(ok[i],ok[j],true),m9=Math.min(d.rms,dm.rms);MAT[i*N9+j]=MAT[j*N9+i]=d.rms;MATm[i*N9+j]=MATm[j*N9+i]=m9;DM.push(d.rms);DMm.push(m9);REL.push(d.rel);RELm.push(Math.min(d.rel,dm.rel));}
  A.paires={n:DM.length,rms1500:{p5:r0(pc(DM,.05)),med:r0(pc(DM,.5)),p95:r0(pc(DM,.95))},rms1500miroir:{p5:r0(pc(DMm,.05)),med:r0(pc(DMm,.5)),p95:r0(pc(DMm,.95))},
    ecartRelatif:{moy:r2(moy(REL)),med:r2(pc(REL,.5))},ecartRelatifMiroir:{moy:r2(moy(RELm)),med:r2(pc(RELm,.5))},
    partSous:Object.fromEntries(SEUILS.map(t=>[t,r2(DM.filter(x=>x<t).length/Math.max(1,DM.length))]))};
  /* 3. LES FORMES : regroupement glouton (chef de file) des tracés des 1,5 premiers km — deux routes à moins de `seuil` m (RMS 3D) sont une même forme */
  const formes=(mat,t)=>{const chef=[],taille=[];for(let i=0;i<N9;i++){let c=-1;for(let q=0;q<chef.length;q++)if(mat[i*N9+chef[q]]<t){c=q;break;}if(c<0){chef.push(i);taille.push(1);}else taille[c]++;}
    const tri=taille.slice().sort((a,b)=>b-a);return {formes:chef.length,plusGrosse:tri[0]||0,top5:tri.slice(0,5),part3:r2((tri[0]+(tri[1]||0)+(tri[2]||0))/Math.max(1,N9))};};
  A.formes={};for(const t of SEUILS)A.formes[t]={brut:formes(MAT,t),miroir:formes(MATm,t)};
  /* 4. LES MODULES : le 1er, les 3 premiers, le nombre distinct par route, l'ensemble contre le catalogue */
  const prem=routes.map(r=>r.suite[0]||'—'),tete3=routes.map(r=>r.suite.slice(0,3).join(' > ')),tout9=routes.map(r=>r.suite.join(' > '));
  A.premier=histo(prem).map(([k,v])=>[k,v,r2(v/n)]);
  A.tete3=histo(tete3).slice(0,12).map(([k,v])=>[k,v,r2(v/n)]);A.tete3Distinctes=new Set(tete3).size;
  A.suitesDistinctes=new Set(tout9).size;A.suiteTop=histo(tout9).slice(0,6).map(([k,v])=>[k,v,r2(v/n)]);
  /* les positions : quel module à la 1re, 2e, 3e, 4e place */
  A.parRang=[0,1,2,3,4].map(i=>histo(routes.map(r=>r.suite[i]||'—')).slice(0,6).map(([k,v])=>[k,v,r2(v/n)]));
  const nd=routes.map(r=>new Set(r.suite).size);A.distinctsParRoute={moy:r1(moy(nd)),min:Math.min(...nd),max:Math.max(...nd)};
  const nM=routes.map(r=>r.suite.length);A.modulesParRoute={moy:r1(moy(nM)),min:Math.min(...nM),max:Math.max(...nM)};
  const vus={};for(const r of routes)for(const m of new Set(r.suite))vus[m]=(vus[m]|0)+1;
  A.modulesVus=Object.entries(vus).sort((a,b)=>b[1]-a[1]).map(([k,v])=>[k,v,r2(v/n)]);
  A.catalogue={taille:catVar.length,vusDuCatalogue:catVar.filter(c=>vus[c]).length,jamais:catVar.filter(c=>!vus[c]),rares:catVar.filter(c=>vus[c]&&vus[c]/n<.02),horsCatalogue:Object.keys(vus).filter(k=>catVar.indexOf(k)<0)};
  A.debutModules={premierS:{moy:r0(moy(routes.map(r=>(r.mods[0]||{}).s||0))),et:r0(et(routes.map(r=>(r.mods[0]||{}).s||0)))}};
  /* 5. L'OUVERTURE : le profil moyen du cap et de la pente sur les 600 premiers m, et son écart-type (petit = scriptée) */
  A.ouverture=[];for(let s=0;s<=600;s+=50){const k=s/10,c=routes.map(r=>r._G.CAP[k]),pe=routes.map(r=>r._G.PEN[k]),ab=c.map(Math.abs);
    A.ouverture.push({s,capMoy:r1(moy(c)),capAbsMoy:r1(moy(ab)),capEt:r1(et(c)),penteMoy:r1(moy(pe)),penteEt:r1(et(pe)),yMoy:r1(moy(routes.map(r=>r._G.Y[k]))),yEt:r1(et(routes.map(r=>r._G.Y[k])))});}
  /* 6. LA DIRECTION D'ENSEMBLE : où finit la route (vue du départ) et son cap final déroulé */
  A.direction={dirFin:{moy:r1(moy(routes.map(r=>r.dirFin))),et:r1(et(routes.map(r=>r.dirFin))),absMed:r1(pc(routes.map(r=>Math.abs(r.dirFin)),.5))},
    capFin:{moy:r1(moy(routes.map(r=>r.capFin))),et:r1(et(routes.map(r=>r.capFin))),absMed:r1(pc(routes.map(r=>Math.abs(r.capFin)),.5)),p5:r1(pc(routes.map(r=>r.capFin),.05)),p95:r1(pc(routes.map(r=>r.capFin),.95))},
    amplitudeCap:{med:r1(pc(routes.map(r=>r.capMax-r.capMin),.5)),p5:r1(pc(routes.map(r=>r.capMax-r.capMin),.05)),p95:r1(pc(routes.map(r=>r.capMax-r.capMin),.95))},
    signeCapFin:{plus:routes.filter(r=>r.capFin>0).length,moins:routes.filter(r=>r.capFin<0).length}};
  /* 7. la fiche de la carte : familles / itinéraires (jade), humeurs / voyages (espace), l'essai gagnant */
  if(carte==='jade'){A.familles=histo(routes.map(r=>r.fiche.fam==null?'?':'fam'+r.fiche.fam));A.itin=histo(routes.map(r=>r.fiche.itin||'—'));
    A.premierParFamille={};for(const f of [0,1])A.premierParFamille['fam'+f]=histo(routes.filter(r=>r.fiche.fam===f).map(r=>r.suite[0]));
    A.essaiGagnant=histo(routes.map(r=>r.fiche.essai));A.noteMoy=r2(moy(routes.map(r=>r.fiche.note)));A.longueurSurCible=r2(moy(routes.map(r=>r.fiche.lon/r.fiche.LC)));}
  else{A.humeurs=histo(routes.map(r=>r.fiche.humeur||'?'));A.voyages=histo(routes.map(r=>r.fiche.voyage||'—'));A.essaiGagnant=histo(routes.map(r=>r.fiche.essai));A.noteMoy=r2(moy(routes.map(r=>r.fiche.note)));}
  for(const r of routes)delete r._G;
  tout.parPalier[p]={stats:A,routes};
  /* ---- le résumé ---- */
  dire('\n-- palier '+p+' · '+n+' routes ('+err+' exceptions) · '+A.msMoy+' ms/route · '+A.secondes+' s · longueur '+A.L.moy+' m ['+A.L.min+'-'+A.L.max+']'+(A.longueurSurCible?' · longueur/cible '+A.longueurSurCible:'')+' · note moy '+A.noteMoy);
  dire('  abscisse |  cap moy ± et  [p5 ; p95]  |cap| méd |   x moy ± et  (faisceau p5-p95) |   y moy ± et  [p5 ; p95] |  z moy ± et | dir. du point moy ± et');
  for(const s of PTS){const o=A.points[s];if(!o||!o.n)continue;dire('  '+String(s).padStart(5)+' m | '+(o.cap.moy+' ± '+o.cap.et).padStart(13)+'  ['+o.cap.p5+' ; '+o.cap.p95+']'.padEnd(2)+' | '+String(o.capAbsMed).padStart(5)+' | '+(o.x.moy+' ± '+o.x.et).padStart(14)+'  ('+o.faisceau+' m) | '+(o.y.moy+' ± '+o.y.et).padStart(14)+'  ['+o.y.p5+' ; '+o.y.p95+'] | '+(o.z.moy+' ± '+o.z.et).padStart(13)+' | '+o.dirMoy+'° ± '+o.dirEt+'° (n '+o.n+')');}
  dire('  ressemblance (1,5 km, '+A.paires.n+' paires) : RMS 3D méd '+A.paires.rms1500.med+' m [p5 '+A.paires.rms1500.p5+' ; p95 '+A.paires.rms1500.p95+'] · avec miroir méd '+A.paires.rms1500miroir.med+' m · écart/abscisse moy '+A.paires.ecartRelatif.moy+' (miroir '+A.paires.ecartRelatifMiroir.moy+') · paires sous '+SEUILS.map(t=>t+' m : '+Math.round(A.paires.partSous[t]*100)+' %').join(', '));
  dire('  formes distinctes (1,5 km, chef de file) : '+SEUILS.map(t=>'< '+t+' m : '+A.formes[t].brut.formes+' (miroir '+A.formes[t].miroir.formes+', 3 plus grosses = '+Math.round(A.formes[t].miroir.part3*100)+' %)').join(' · '));
  dire('  1er module : '+A.premier.map(x=>x[0]+' '+Math.round(x[2]*100)+' %').join(', ')+' · commence à '+A.debutModules.premierS.moy+' ± '+A.debutModules.premierS.et+' m');
  dire('  3 premiers ('+A.tete3Distinctes+' têtes distinctes / '+n+') : '+A.tete3.slice(0,6).map(x=>'« '+x[0]+' » '+Math.round(x[2]*100)+' %').join(' · '));
  for(let i=0;i<5;i++)dire('    rang '+(i+1)+' : '+A.parRang[i].map(x=>x[0]+' '+Math.round(x[2]*100)+' %').join(', '));
  dire('  suites complètes distinctes : '+A.suitesDistinctes+' / '+n+' · la plus fréquente « '+(A.suiteTop[0]||[''])[0]+' » '+Math.round(((A.suiteTop[0]||[0,0,0])[2])*100)+' %');
  dire('  modules par route : '+A.modulesParRoute.moy+' ['+A.modulesParRoute.min+'-'+A.modulesParRoute.max+'] · distincts '+A.distinctsParRoute.moy+' ['+A.distinctsParRoute.min+'-'+A.distinctsParRoute.max+'] · catalogue '+A.catalogue.vusDuCatalogue+' / '+A.catalogue.taille+' vus · jamais : '+(A.catalogue.jamais.join(', ')||'—')+' · < 2 % : '+(A.catalogue.rares.join(', ')||'—')+(A.catalogue.horsCatalogue.length?' · hors catalogue : '+A.catalogue.horsCatalogue.join(', '):''));
  dire('  présence (part des routes) : '+A.modulesVus.map(x=>x[0]+' '+Math.round(x[2]*100)+' %').join(', '));
  dire('  ouverture (0-600 m) : s | cap moy (|cap| moy) ± et | pente moy ± et | y moy ± et');
  for(const o of A.ouverture)dire('    '+String(o.s).padStart(4)+' | '+(o.capMoy+' ('+o.capAbsMoy+') ± '+o.capEt).padStart(20)+' | '+(o.penteMoy+' ± '+o.penteEt).padStart(13)+' | '+(o.yMoy+' ± '+o.yEt));
  dire('  direction : fin vue du départ '+A.direction.dirFin.moy+'° ± '+A.direction.dirFin.et+'° (|.| méd '+A.direction.dirFin.absMed+'°) · cap final déroulé '+A.direction.capFin.moy+' ± '+A.direction.capFin.et+'° [p5 '+A.direction.capFin.p5+' ; p95 '+A.direction.capFin.p95+'] (+ '+A.direction.signeCapFin.plus+' / − '+A.direction.signeCapFin.moins+') · amplitude du cap méd '+A.direction.amplitudeCap.med+'°');
  if(carte==='jade')dire('  familles '+JSON.stringify(A.familles)+' · 1er par famille '+JSON.stringify(A.premierParFamille)+(A.itin.length>1?' · itinéraires '+JSON.stringify(A.itin):'')+' · essai gagnant '+JSON.stringify(A.essaiGagnant));
  else dire('  humeurs '+JSON.stringify(A.humeurs)+(A.voyages.length>1?' · voyages '+JSON.stringify(A.voyages):'')+' · essai gagnant '+JSON.stringify(A.essaiGagnant));
}
const base=path.join(out,carte+'-'+nom);
fs.writeFileSync(base+'-mesure.json',JSON.stringify(tout));fs.writeFileSync(base+'-resume.txt',lignes.join('\n')+'\n');
console.log('\nécrit : '+path.relative(R.RAC,base)+'-mesure.json, -resume.txt');
