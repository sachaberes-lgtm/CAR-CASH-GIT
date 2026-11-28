/* ===== LE COMPTEUR DU BOT (2026-11-28, etude « echelle de bots », § 11.2 : « d'ou viennent les pieces des joueurs, face a c0025 ») =====
   Lecture seule. Decompose les pieces d'une partie enregistree (format cashcar-jeurec-1) par SOURCE et par MINUTE, avec les definitions de
   ml/bot/mesures.js (partiesJoueurs, finVraie, mesures) :
     · figure : le gain de pieces enregistre a l'instant d'un evenement 'figure_payee' (la pose payee 2 a 18 pieces, figures-route.js:64,
       demi-tour.js:574 ; une piece ramassee dans la meme image y est comptee, c'est rare) ;
     · en l'air : un gain entre un 'decol' et sa 'pose' (ou sa 'mort') ;
     · route : le reste (la caisse au sol).
   Joueurs : ml/bot/etalon/*.json (14 parties). c0025 : ml/ecurie/agents/tmp-voltige/note-voltige4-t900.json (20 parties de pilote-voltige,
   cerveau c3e8b819…, que le banc des genes retrouve a l'empreinte pres sous le nom « depart » sur ses graines 3000000 et 3000037).
   Refaire : node ml/ecurie/etude/echelle-de-bots/pieces/compteur-bot/decomposer.js  (depuis la racine du depot) */
const fs=require('fs'),path=require('path'),M=require('../../../../../bot/mesures.js');
const RAC=path.join(__dirname,'..','..','..','..','..','..');
const lus=fs.readdirSync(path.join(RAC,'ml/bot/etalon')).filter(f=>f.endsWith('.json')).map(f=>({nom:f,j:JSON.parse(fs.readFileSync(path.join(RAC,'ml/bot/etalon',f),'utf8'))}));
const J=M.partiesJoueurs(lus).parties;
const note=JSON.parse(fs.readFileSync(path.join(RAC,'ml/ecurie/agents/tmp-voltige/note-voltige4-t900.json'),'utf8'));
const B=note.parties.map(p=>M.finVraie(p.partie));
const TR=[[0,60],[60,120],[120,180],[180,1e9]];
function decompose(c){
  c=M.finVraie(c);const col={};c.cols.forEach((n,i)=>col[n]=i);const E=c.ech,ev=c.ev,g=(e,n)=>e[col[n]];
  const fp=new Set(ev.filter(e=>e[1]==='figure_payee').map(e=>e[0]));
  const vols=[];let d=null;for(const e of ev){if(e[1]==='decol')d=e[0];else if((e[1]==='pose'||e[1]==='mort')&&d!=null){vols.push([d,e[0],e[1]==='pose'?e:null]);d=null;}}
  const enVol=t=>vols.some(v=>t>v[0]&&t<=v[1]+1e-6);
  const dur=c.fin.t,T=TR.map(()=>({t:0,km:0,route:0,air:0,fig:0,npay:0,vols:0,airS:0,nit:0,n:0,kmhSol:0,nSol:0,figsMain:0}));
  const k=t=>TR.findIndex(r=>t>=r[0]&&t<r[1]);
  TR.forEach((r,i)=>{T[i].t=Math.max(0,Math.min(dur,r[1])-r[0]);});
  for(const e of ev){const i=k(e[0]);if(i<0)continue;
    if(e[1]==='piece'){const q=e[2]|0;if(fp.has(e[0]))T[i].fig+=q;else if(enVol(e[0]))T[i].air+=q;else T[i].route+=q;}
    else if(e[1]==='figure_payee')T[i].npay+=e[2]|0;else if(e[1]==='decol')T[i].vols++;else if(e[1]==='pose')T[i].figsMain+=e[7]|0;}
  for(let j=0;j<E.length;j++){const e=E[j],i=k(g(e,'t'));if(i<0)continue;T[i].n++;if(g(e,'m')===1||g(e,'m')===2)T[i].airS++;if(g(e,'nit'))T[i].nit++;
    if(g(e,'m')===0){T[i].kmhSol+=g(e,'kmh');T[i].nSol++;}
    if(j&&g(e,'r')===g(E[j-1],'r')){const ds=g(e,'s')-g(E[j-1],'s');if(ds>0&&ds<400)T[i].km+=ds/1000;}}
  const m=M.mesures(c);
  return {T,dur,m,clavier:m.clavier,tronquee:m.tronquee};
}
const som=(L,f)=>L.reduce((a,x)=>a+f(x),0);
function graine(s){let x=s>>>0;return ()=>{x^=x<<13;x>>>=0;x^=x>>>17;x^=x<<5;x>>>=0;return x/4294967296;};}
function ic(L,f,den){ /* intervalle a 95 % par tirage des parties (bootstrap, 4000 tirages) du rapport somme(f)/somme(den) */
  const r=graine(7),V=[];for(let b=0;b<4000;b++){let a=0,z=0;for(let i=0;i<L.length;i++){const x=L[(r()*L.length)|0];a+=f(x);z+=den(x);}V.push(z?a/z:0);}
  V.sort((a,b)=>a-b);return [V[100],V[3899]];}
const f1=x=>x.toFixed(1),f0=x=>Math.round(x)+'',out=[];
function bloc(nom,L){
  const D=L.map(decompose);out.push(`\n## ${nom} : ${L.length} parties, ${f1(som(D,d=>d.dur)/60)} min`);
  /* sources, toutes durees */
  const tot=d=>som(d.T,t=>t.route+t.air+t.fig),mn=d=>d.dur/60;
  const P=s=>som(D,d=>som(d.T,t=>t[s])),PT=som(D,tot),MIN=som(D,mn);
  out.push(`pieces ramassees ${PT} · par minute ${f1(PT/MIN)} [${ic(D,tot,mn).map(f0).join('–')}]`);
  for(const s of ['route','air','fig'])out.push(`  ${s.padEnd(6)} ${String(P(s)).padStart(6)} = ${f1(100*P(s)/PT)} % · ${f1(P(s)/MIN)}/min [${ic(D,d=>som(d.T,t=>t[s]),mn).map(f0).join('–')}]`);
  const npay=P('npay'),vols=P('vols');
  out.push(`  poses payees ${npay} (${f1(npay/MIN)}/min) · pieces par pose payee ${f1(P('fig')/Math.max(1,npay))} · vols ${vols} (${f1(vols/MIN)}/min) · poses payees par vol ${(npay/Math.max(1,vols)).toFixed(2)} · figures de la main ('fig') ${P('figsMain')}`);
  /* par tranche de temps */
  out.push(`| tranche | parties vivantes | min | km/min | pieces route par km | route/min | air/min | figures/min | total/min | en l'air % | vols/min | poses payees/vol | nitro % | km/h au sol |`);
  out.push('|---|---|---|---|---|---|---|---|---|---|---|---|---|---|');
  TR.forEach((r,i)=>{const X=D.map(d=>d.T[i]).filter(t=>t.t>0),m=som(X,t=>t.t)/60,km=som(X,t=>t.km),n=som(X,t=>t.n);
    const lab=r[1]>1e8?`${r[0]} s et +`:`${r[0]}–${r[1]} s`;
    out.push(`| ${lab} | ${X.length} | ${f1(m)} | ${f1(km/m)} | ${f1(som(X,t=>t.route)/Math.max(1e-9,km))} | ${f0(som(X,t=>t.route)/m)} | ${f0(som(X,t=>t.air)/m)} | ${f0(som(X,t=>t.fig)/m)} | ${f0(som(X,t=>t.route+t.air+t.fig)/m)} | ${f1(100*som(X,t=>t.airS)/n)} | ${f1(som(X,t=>t.vols)/m)} | ${(som(X,t=>t.npay)/Math.max(1,som(X,t=>t.vols))).toFixed(2)} | ${f0(100*som(X,t=>t.nit)/n)} | ${f0(som(X,t=>t.kmhSol)/Math.max(1,som(X,t=>t.nSol)))} |`);});
  /* partie par partie */
  out.push('partie par partie : duree s · palier · total/min · route/min · air/min · fig/min · km/min · vols/min');
  out.push('  '+D.map(d=>{const m=d.dur/60,s=k=>som(d.T,t=>t[k]);return `${f0(d.dur)}s P${d.m.palier} ${f0((s('route')+s('air')+s('fig'))/m)}=${f0(s('route')/m)}+${f0(s('air')/m)}+${f0(s('fig')/m)} ${f1(s('km')/m)}km ${f1(s('vols')/m)}v`;}).join('\n  '));
  return D;
}
const DJ=bloc('JOUEURS (ml/bot/etalon, partiesJoueurs)',J);
bloc('  dont Sacha (clavier)',J.filter(c=>M.mesures(c).clavier===true));
bloc('  dont Leo (doigt)',J.filter(c=>M.mesures(c).clavier===false));
const DB=bloc('c0025 = pilote-voltige (note-voltige4-t900, tmax 900, allege, jeu '+note.jeu+')',B);
/* a duree egale : les parties de 120 a 300 s */
const eg=(L)=>L.filter(c=>{const t=M.finVraie(c).fin.t;return t>=120&&t<=300;});
bloc('JOUEURS, parties de 120 a 300 s',eg(J));bloc('c0025, parties de 120 a 300 s',eg(B));
fs.writeFileSync(path.join(__dirname,'sortie-decomposer.txt'),out.join('\n')+'\n');console.log(out.join('\n'));
