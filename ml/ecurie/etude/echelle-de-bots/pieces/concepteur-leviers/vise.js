/* ===== LE CONCEPTEUR DES LEVIERS, 3 : ou, en travers de la route, les pieces de route sont prises (2026-11-28) =====
   Lecture seule, memes parties que ecart.js. Pieces de route prises AU SOL par km de sol, par bande de |lat| (la place de la caisse a l'instant
   de la piece), par zone. Le meme generateur pose les pieces pour tout le monde : a zone egale, une bande ou c0025 prend moins est une bande qu'il
   ne vise pas (ou ou il ne roule pas). Et le temps de sol passe dans chaque bande.
   Refaire : node ml/ecurie/etude/echelle-de-bots/pieces/concepteur-leviers/vise.js */
const fs=require('fs'),path=require('path');
const RAC=path.join(__dirname,'..','..','..','..','..','..'),M=require(path.join(RAC,'ml','bot','mesures.js'));
const lus=fs.readdirSync(path.join(RAC,'ml','bot','etalon')).filter(f=>f.endsWith('.json')).sort().map(f=>({nom:f,j:JSON.parse(fs.readFileSync(path.join(RAC,'ml','bot','etalon',f),'utf8'))}));
const J=M.partiesJoueurs(lus).parties.map(M.finVraie);
const B=JSON.parse(fs.readFileSync(path.join(RAC,'ml','ecurie','agents','tmp-voltige','note-voltige4-t900.json'),'utf8')).parties.map(p=>M.finVraie(p.partie));
const BD=[[0,6],[6,12],[12,18],[18,99]],bd=l=>BD.findIndex(x=>Math.abs(l)>=x[0]&&Math.abs(l)<x[1]);
function lire(L){const A={};for(const c of L){const col={};c.cols.forEach((n,i)=>col[n]=i);const E=c.ech,g=(e,n)=>e[col[n]];
  const fp=new Set(c.ev.filter(e=>e[1]==='figure_payee').map(e=>e[0])),P=c.ev.filter(e=>e[1]==='piece');let ip=0;
  for(let j=1;j<E.length;j++){const e=E[j],t=g(e,'t'),sol=g(e,'m')===0,z=Math.min(2,g(e,'r')),a=A[z]||(A[z]={km:0,dt:0,p:[0,0,0,0],t:[0,0,0,0],run:0,runs:[]});
    while(ip<P.length&&P[ip][0]<=t){if(!fp.has(P[ip][0])&&sol)a.p[bd(P[ip][4])]+=P[ip][2]|0;ip++;}
    if(!sol)continue;const dt=Math.min(.25,t-g(E[j-1],'t'));a.dt+=dt;a.t[bd(g(e,'lat'))]+=dt;
    if(g(E[j-1],'m')===0&&g(e,'r')===g(E[j-1],'r')){const d=g(e,'s')-g(E[j-1],'s');if(d>0&&d<400)a.km+=d/1000;}}}return A;}
const AJ=lire(J),AB=lire(B),out=[],f1=x=>x.toFixed(1),f0=x=>Math.round(x)+'';
out.push('# Ou les pieces de route sont prises, en travers de la route (au sol)');
out.push('| zone | bande de \|lat\| (m) | pieces par km de sol J / B | ecart J − B | part du temps de sol dans la bande J / B |');out.push('|---|---|---|---|---|');
for(let z=0;z<3;z++){const a=AJ[z],b=AB[z];if(!a||!b)continue;BD.forEach((x,i)=>out.push(`| ${z}${z===2?' et plus':''} | ${x[0]} a ${x[1]===99?'28':x[1]} | ${f1(a.p[i]/a.km)} / ${f1(b.p[i]/b.km)} | ${f1(a.p[i]/a.km-b.p[i]/b.km)} | ${f0(100*a.t[i]/a.dt)} % / ${f0(100*b.t[i]/b.dt)} % |`));
  const sa=a.p.reduce((x,y)=>x+y,0)/a.km,sb=b.p.reduce((x,y)=>x+y,0)/b.km;out.push(`| ${z}${z===2?' et plus':''} | toutes | ${f1(sa)} / ${f1(sb)} | ${f1(sa-sb)} | km de sol : ${f0(a.km)} / ${f0(b.km)} |`);}
fs.writeFileSync(path.join(__dirname,'sortie-vise.txt'),out.join('\n')+'\n');console.log(out.join('\n'));
