/* ===== LES PORTRAITS DES GABARITS DE JADE (2026-11-14) =====
   node outils/banc-jade/portraits.cjs <gen-jade-xxx.json> [--graine=1] [--gabarits=19,23,25] [--max=40] [--de=route|cote]
   Lit le JSON d'un `banc-maps/banc.cjs gen … --auditfile=outils/banc-jade/audit-formes.js` et écrit, pour chaque gabarit posé dans la vallée (un par gabarit : son
   instance à l'endroit la plus proche de la route), un cadrage « portrait » : la montagne entière, vue de la route (ou de côté). Sortie : la chaîne à passer à
     node outils/banc-maps/banc.cjs vue --carte=jade --meteo=midi --graines=<g> --vues="<chaîne>" [--q=jpal=tout]
   (`?jpal=tout` met tout le catalogue en service : un seul passage pour les 39 portraits ; `?jpal=19,23,…` impose une palette.)
   Sur stderr : l'ordre des portraits (libre0 = tel gabarit). */
const fs=require('fs');
const opt={};const A=[];for(const a of process.argv.slice(2)){const m=/^--([a-zA-Z]+)=(.*)$/.exec(a);if(m)opt[m[1]]=m[2];else A.push(a);}
const R=JSON.parse(fs.readFileSync(A[0],'utf8')),g=R.find(x=>!opt.graine||String(x.graine)===String(opt.graine)),q=g.perso.pil;
const veut=opt.gabarits?opt.gabarits.split(',').map(Number):null,par={};
q.P.forEach(function(p){const t=p[5];if(veut&&veut.indexOf(t)<0)return;if(p[7])return;const d=p[8]<0?1e9:p[8];if(!par[t]||d<par[t].d)par[t]={p:p,d:d};});
const vues=[],noms=[];
for(const t of Object.keys(par).map(Number).sort((a,b)=>a-b).slice(0,+(opt.max||40))){const p=par[t].p,T=q.tpl[t],H=p[4]-p[3],r=p[2],D=Math.max(1.15*H,2.6*r)+r;
  let bd=1e18,bi=0;q.route.forEach(function(e,i){const d=(e[0]-p[0])*(e[0]-p[0])+(e[2]-p[1])*(e[2]-p[1]);if(d<bd){bd=d;bi=i;}});
  let an=Math.atan2(q.route[bi][2]-p[1],q.route[bi][0]-p[0]);if(opt.de==='cote')an+=Math.PI/2;
  const ym=(p[3]+p[4])/2;
  vues.push([Math.round(p[0]+Math.cos(an)*D),Math.round(ym+H*.12),Math.round(p[1]+Math.sin(an)*D)].join(',')+':'+[Math.round(p[0]),Math.round(ym),Math.round(p[1])].join(','));
  noms.push('libre'+(vues.length-1)+' = gabarit '+t+' ('+(T?(T.fam||'?')+', '+(T.classe||'?'):'?')+') '+Math.round(2*r)+' × '+Math.round(H)+' m');}
console.error(noms.join('\n'));console.log(vues.join(';'));
