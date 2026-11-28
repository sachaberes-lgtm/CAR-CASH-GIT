/* ===== LE CONCEPTEUR DES LEVIERS, 2 : pourquoi c0025 roule moins vite au meme palier (2026-11-28) =====
   Lecture seule.
   (a) joueurs et c0025 (les memes parties que ecart.js) : la nitro au sol selon ce que la route demande (le lacet = courbure x vitesse), la vitesse
       au sol palier par palier, le pouvoir VITESSE (colonne vm), le temps depuis la derniere pose ;
   (b) les 40 courses vue par vue de l'etude « sortie preparee » (c0025 v:4 a la naissance, 180 s au plus) : quand l'ordre de nitro est coupe au sol,
       est-ce la JAUGE (plus rien a bruler) ou une REGLE du pilote (virage, travers, route qui lache) ?
   Refaire : node ml/ecurie/etude/echelle-de-bots/pieces/concepteur-leviers/nitro.js */
const fs=require('fs'),path=require('path'),zlib=require('zlib');
const RAC=path.join(__dirname,'..','..','..','..','..','..'),M=require(path.join(RAC,'ml','bot','mesures.js'));
const out=[],f0=x=>x==null||x!==x?'-':Math.round(x)+'',f1=x=>x==null||x!==x?'-':x.toFixed(1),f2=x=>x==null||x!==x?'-':x.toFixed(2);
const lus=fs.readdirSync(path.join(RAC,'ml','bot','etalon')).filter(f=>f.endsWith('.json')).sort().map(f=>({nom:f,j:JSON.parse(fs.readFileSync(path.join(RAC,'ml','bot','etalon',f),'utf8'))}));
const J=M.partiesJoueurs(lus).parties.map(M.finVraie);
const B=JSON.parse(fs.readFileSync(path.join(RAC,'ml','ecurie','agents','tmp-voltige','note-voltige4-t900.json'),'utf8')).parties.map(p=>M.finVraie(p.partie));
const DECOR={canyon:1,grotte:1,jade:1,ville:1};
/* la courbure de la route a l'abscisse s (rad par m), lue dans les points de l'enregistrement (cap en degres, un point tous les `pas` m), sur 60 m devant */
function courbure(R,s){if(!R||!R.P||!R.pas)return 0;const i=Math.max(0,Math.min(R.P.length-1,Math.round(s/R.pas))),k=Math.max(1,Math.round(60/R.pas)),j=Math.min(R.P.length-1,i+k);if(j<=i)return 0;
  let d=R.P[j][3]-R.P[i][3];while(d>180)d-=360;while(d<-180)d+=360;return Math.abs(d)/57.2958/((j-i)*R.pas);}
const LAC=[[0,.15],[.15,.4],[.4,.8],[.8,99]];
function lire(L){
  const A={lac:LAC.map(()=>({dt:0,nit:0})),pal:{},vm:{dt:0,dtV:0},pose:[[0,1],[1,3],[3,8],[8,999]].map(x=>({x,dt:0,nit:0,kmh:0})),decor:{0:{dt:0,nit:0},1:{dt:0,nit:0}}};
  for(const c of L){const col={};c.cols.forEach((n,i)=>col[n]=i);const E=c.ech,g=(e,n)=>e[col[n]];
    const P=c.ev.filter(e=>e[1]==='piece');let ip=0,cum=0,tPose=0;const poses=c.ev.filter(e=>e[1]==='pose').map(e=>e[0]);let iq=0;
    for(let j=1;j<E.length;j++){const e=E[j],t=g(e,'t');while(ip<P.length&&P[ip][0]<=t){cum+=P[ip][2]|0;ip++;}while(iq<poses.length&&poses[iq]<=t){tPose=poses[iq];iq++;}
      if(g(e,'m')!==0)continue;const dt=Math.min(.25,t-g(E[j-1],'t')),R=(c.routes||[])[g(e,'r')],nit=g(e,'nit')?1:0,kmh=g(e,'kmh');
      A.vm.dt+=dt;if(g(e,'vm')>1.05)A.vm.dtV+=dt;
      const lac=courbure(R,g(e,'s'))*kmh/3.6/.48*.48,li=LAC.findIndex(x=>lac>=x[0]&&lac<x[1]);   /* kmh affiches = m/s de piste x 3,6 (SPD compris des deux cotes : meme echelle pour les deux lots) */
      A.lac[li].dt+=dt;A.lac[li].nit+=nit*dt;
      const d=A.decor[R&&DECOR[R.carte]?1:0];d.dt+=dt;d.nit+=nit*dt;
      if(!(g(e,'vm')>1.05)){const pal=M.palierDe(cum),p=A.pal[pal]||(A.pal[pal]={dt:0,kmh:0,nit:0});p.dt+=dt;p.kmh+=kmh*dt;p.nit+=nit*dt;}
      const q=A.pose.find(x=>t-tPose>=x.x[0]&&t-tPose<x.x[1]);if(q&&tPose>0){q.dt+=dt;q.nit+=nit*dt;q.kmh+=kmh*dt;}}}
  return A;}
const AJ=lire(J),AB=lire(B);
out.push('# Pourquoi c0025 roule moins vite au meme palier');
out.push('\n## (a1) La nitro au sol selon ce que la route demande (lacet = courbure sur 60 m x vitesse, rad/s)');
out.push('| lacet demande | part du temps de sol J / B | nitro allumee % J / B |');out.push('|---|---|---|');
const sd=A=>A.lac.reduce((a,x)=>a+x.dt,0);
LAC.forEach((x,i)=>out.push(`| ${x[0]} a ${x[1]===99?'plus':x[1]} | ${f0(100*AJ.lac[i].dt/sd(AJ))} % / ${f0(100*AB.lac[i].dt/sd(AB))} % | ${f0(100*AJ.lac[i].nit/AJ.lac[i].dt)} / ${f0(100*AB.lac[i].nit/AB.lac[i].dt)} |`));
out.push(`Sur les maps a decor (canyon, grotte, jade, ville) : nitro au sol ${f0(100*AJ.decor[1].nit/AJ.decor[1].dt)} % / ${f0(100*AB.decor[1].nit/AB.decor[1].dt)} % ; hors decor : ${f0(100*AJ.decor[0].nit/AJ.decor[0].dt)} % / ${f0(100*AB.decor[0].nit/AB.decor[0].dt)} %.`);
out.push('\n## (a2) La vitesse au sol palier par palier (hors pouvoir VITESSE : vm > 1,05 ecarte)');
out.push(`Part du temps de sol sous le pouvoir VITESSE : joueurs ${f1(100*AJ.vm.dtV/AJ.vm.dt)} %, c0025 ${f1(100*AB.vm.dtV/AB.vm.dt)} %.`);
out.push('| palier | min de sol J / B | km/h au sol J / B | rapport | nitro % J / B |');out.push('|---|---|---|---|---|');
let sw=0,sr=0;
for(let p=1;p<=14;p++){const a=AJ.pal[p],b=AB.pal[p];if(!a||!b||a.dt<20||b.dt<20)continue;const r=(a.kmh/a.dt)/(b.kmh/b.dt);sw+=b.dt;sr+=b.dt*Math.log(r);
  out.push(`| ${p} | ${f1(a.dt/60)} / ${f1(b.dt/60)} | ${f0(a.kmh/a.dt)} / ${f0(b.kmh/b.dt)} | ${f2(r)} | ${f0(100*a.nit/a.dt)} / ${f0(100*b.nit/b.dt)} |`);}
out.push(`Rapport moyen J/B a palier EXACTEMENT egal (moyenne geometrique, poids = temps de c0025 ; paliers ou chacun a 20 s de sol au moins) : x${f2(Math.exp(sr/sw))}.`);
out.push('\n## (a3) Au sol, selon le temps depuis la derniere pose');
out.push('| depuis la pose | part du temps de sol J / B | nitro % J / B |');out.push('|---|---|---|');
const sp=A=>A.pose.reduce((a,x)=>a+x.dt,0);
AJ.pose.forEach((x,i)=>out.push(`| ${x.x[0]} a ${x.x[1]===999?'plus':x.x[1]} s | ${f0(100*x.dt/sp(AJ))} % / ${f0(100*AB.pose[i].dt/sp(AB))} % | ${f0(100*x.nit/x.dt)} / ${f0(100*AB.pose[i].nit/AB.pose[i].dt)} |`));

/* ---------- (b) les 40 traces : pourquoi l'ordre de nitro est coupe ---------- */
const D=path.join(RAC,'ml','ecurie','etude','sortie-preparee','sorties','lignes');
const R={capMax:.35,jaugeAllume:.45,jaugeCoupe:.25};   /* les valeurs de naissance (ml/evolution/genome.js) */
const T={};const cle=k=>T[k]||(T[k]={dt:0,on:0,lache:0,travers:0,jauge:0,regle:0,racc:0,pleine:0,jSum:0});let nF=0;
for(const f of fs.readdirSync(D).filter(f=>f.endsWith('.jsonl.gz')).sort()){nF++;
  const L=zlib.gunzipSync(fs.readFileSync(path.join(D,f))).toString('utf8').split('\n').filter(Boolean).map(x=>JSON.parse(x)).filter(x=>!x.entete);
  let plein=false,tp=null;
  for(const v of L){if(v.mo!=='s'){tp=v.t;continue;}const dt=tp==null?0:Math.min(.25,v.t-tp);tp=v.t;
    const jauge=(v.n||0)+(v.r||0);if(jauge>R.jaugeAllume)plein=true;else if(jauge<R.jaugeCoupe)plein=false;
    if(v.t<6||!v.O)continue;
    for(const k of ['tout',DECOR[v.c]?'decor':'sans decor']){const a=cle(k);a.dt+=dt;a.jSum+=jauge*dt;
      if(v.O.nitro){a.on+=dt;continue;}
      if(v.D&&v.D.so){a.racc+=dt;continue;}
      if(v.tn&&v.tn.ti===false){a.lache+=dt;continue;}
      if(v.gl||v.rb||Math.abs(v.cap)>=R.capMax||Math.abs(v.lat)>=v.demi-6){a.travers+=dt;continue;}
      if(!plein&&!v.nl){a.jauge+=dt;continue;}
      a.regle+=dt;if(jauge>=.9)a.pleine+=dt;}}}
out.push('\n## (b) Les '+nF+' courses vue par vue de c0025 : au sol (apres 6 s), l\'ordre de nitro');
out.push('| | min de sol | nitro demandee | coupee : JAUGE basse (sous jaugeAllume 0,45 apres etre passee sous jaugeCoupe 0,25) | coupee : REGLE du virage (seuil de volant, marge) alors que la jauge le permet | coupee : route qui lache | coupee : travers, glisse, rebond, pres du bord | raccourci engage sans reacteur | jauge moyenne |');out.push('|---|---|---|---|---|---|---|---|---|');
for(const k of ['tout','decor','sans decor']){const a=T[k];if(!a)continue;const p=x=>f0(100*x/a.dt)+' %';
  out.push(`| ${k} | ${f1(a.dt/60)} | ${p(a.on)} | ${p(a.jauge)} | ${p(a.regle)} (dont jauge a 0,9 ou plus : ${p(a.pleine)}) | ${p(a.lache)} | ${p(a.travers)} | ${p(a.racc)} | ${f2(a.jSum/a.dt)} |`);}
fs.writeFileSync(path.join(__dirname,'sortie-nitro.txt'),out.join('\n')+'\n');console.log(out.join('\n'));
