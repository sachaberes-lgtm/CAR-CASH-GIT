/* ===== LE BANC DES FORMES DE JADE (2026-11-14, Sacha : « pour jade travaille la variété de forme d'îlot ») =====
   Lit le JSON d'un `banc-maps/banc.cjs gen --carte=jade --auditfile=outils/banc-jade/audit-formes.js` (servi par serveur-sonde.cjs) et CHIFFRE la variété :
     node outils/banc-jade/formes.cjs <gen-jade-xxx.json> [--planche=catalogue.png] [--json=bilan.json] [--pres=120]
   Par graine :
     · le catalogue : gabarits, familles de forme (une famille = une « sorte » de voxPilierG), rapport hauteur/diamètre de chaque gabarit ;
     · ce qu'on voit de près (bord du gabarit à moins de --pres m du bord de la route, à hauteur de route ± 200 m) : combien de montagnes, de gabarits
       différents, la part du gabarit le plus fréquent, le NOMBRE EFFECTIF de formes (exp de l'entropie : 19 gabarits tirés également = 19) ;
     · les JUMEAUX : pour chaque montagne vue de près (rochers à part), sa plus proche voisine (centre à centre, ≤ 250 m) porte-t-elle le même gabarit ?
       (« jumeaux »), le même gabarit dans la même pose — même quart de tour, même sens (« clones ») ; et la même FAMILLE (« même famille ») ;
     · la FILE le long de la route : les montagnes à moins de 60 m du bord rangées par abscisse — deux consécutives du même gabarit (« suite »), la plus
       longue série de la même famille, et la plus longue série de « tours » (sortes 0 à 3 : toutes des fûts verticaux) ;
     · la fenêtre : dans chaque tranche de 300 m de route, le nombre de familles différentes visibles de près (min, médiane).
   --planche : le catalogue des gabarits en silhouettes (profil des couches, à l'échelle) — la preuve visuelle que les sortes se ressemblent.
   Aucune dépendance. Les nombres sont déterministes (même graine, même vallée). */
const fs=require('fs'),path=require('path');
const opt={};const ARGS=[];for(const a of process.argv.slice(2)){const m=/^--([a-zA-Z]+)=(.*)$/.exec(a);if(m)opt[m[1]]=m[2];else ARGS.push(a);}
if(!ARGS[0]){console.log('usage : node outils/banc-jade/formes.cjs <gen.json> [--planche=f.png] [--json=f.json] [--pres=120]');process.exit(1);}
const R=JSON.parse(fs.readFileSync(ARGS[0],'utf8')),PRES=+(opt.pres||120);
/* les sortes d'origine (JADE_TPL, rochers, JADE_ILE) — si le jeu porte un jour la sorte dans la fiche du gabarit (tpl.sorte, tpl.fam), elle prime */
/* (2026-11-14, après la correction) le jeu porte désormais `fam` et `classe` dans la fiche de chaque gabarit, et la liste des gabarits est À TROUS (un gabarit hors palette n'est pas taillé) :
   les rochers se reconnaissent à leur classe, les « tours » aussi (colonne, gradins, tête large d'avant), les fiches absentes sont sautées ; la planche dessine tous les disques d'une tranche. */
const SORTE0=[1,0,3,2,3,1,0,2,1,3],NOMS={0:'colonne',1:'aiguille',2:'gradins',3:'tête large',4:'île',5:'massif',r:'rocher'};
function sorteDe(q,k){const t=q.tpl[k];if(t&&t.fam!=null)return t.fam;if(k<q.ntpl)return SORTE0[k]!=null?SORTE0[k]:'t'+k;if(q.ile0>0&&k>=q.ile0){return k-q.ile0<4?4:5;}return 'r';}
/* la CLASSE de silhouette : ce que l'oeil distingue de loin — les sortes 0 à 3 sont toutes des fûts verticaux à sommet plat (« tour ») ; une fiche de gabarit qui porte `classe` prime */
function classeDe(q,k){const t=q.tpl[k];if(t&&t.classe!=null)return t.classe;const so=sorteDe(q,k);return so==='r'?'rocher':so>=0&&so<=3?'tour':so===4?'île':so===5?'massif':String(so);}
const med=a=>{if(!a.length)return null;const b=a.slice().sort((x,y)=>x-y);return b[b.length>>1];};
function analyse(g){const q=g.perso&&g.perso.pil;if(!q||!q.P)return {graine:g.graine,erreur:g.erreur||'pas de dbgJadePil'};
  const P=q.P,rt=q.route,demi=q.demi,o={graine:g.graine,L:q.L,montagnes:0,rochers:0};
  /* la route en grille */
  const K=100,gr=new Map();rt.forEach((p,i)=>{const k=Math.floor(p[0]/K)+','+Math.floor(p[2]/K);let a=gr.get(k);if(!a)gr.set(k,a=[]);a.push(i);});
  const pres=function(x,z,r,y0,y1,D){let bd=1e9,bi=-1;const n=Math.ceil((D+r+demi)/K),bx=Math.floor(x/K),bz=Math.floor(z/K);
    for(let a=-n;a<=n;a++)for(let b=-n;b<=n;b++){const c=gr.get((bx+a)+','+(bz+b));if(!c)continue;for(const i of c){const p=rt[i];if(p[1]<y0-200||p[1]>y1+200)continue;const d=Math.hypot(p[0]-x,p[2]-z)-r-demi;if(d<bd){bd=d;bi=i;}}}
    return [bd,bi];};
  const M=[];P.forEach((p,k)=>{const so=sorteDe(q,p[5]);if(classeDe(q,p[5])==='rocher'){o.rochers++;return;}o.montagnes++;const pr=pres(p[0],p[1],p[2],p[3],p[4],Math.max(PRES,60));M.push({cl:classeDe(q,p[5]),k:k,x:p[0],z:p[1],r:p[2],y0:p[3],y1:p[4],t:p[5],rot:p[6],inv:p[7],sc:p[9]||1,so:so,d:pr[0],i:pr[1],ym:(p[3]+p[4])/2});});
  /* le catalogue */
  const cat={};q.tpl.forEach((t,k)=>{if(!t)return;const so=sorteDe(q,k);(cat[so]||(cat[so]=[])).push(k);});
  o.gabarits=q.tpl.filter(t=>t).length;o.catalogueTotal=q.catalogue||q.tpl.length;o.palette=q.palette?q.palette.length:o.gabarits;o.familles=new Set(q.tpl.map((t,k)=>t&&classeDe(q,k)!=='rocher'?String(sorteDe(q,k)):null).filter(v=>v!=null)).size;o.catalogue=Object.keys(cat).map(k=>(NOMS[k]||k)+' ×'+cat[k].length).join(', ');
  o.elancement=q.tpl.filter(t=>t).map(t=>+(t.yTop/(2*t.rmax)).toFixed(1));
  /* de près */
  const N=M.filter(m=>m.d<PRES);o.pres=N.length;const cT={},cS={},cC={};for(const m of N){cT[m.t]=(cT[m.t]||0)+1;cS[m.so]=(cS[m.so]||0)+1;cC[m.cl]=(cC[m.cl]||0)+1;}
  const ent=function(c){const n=Object.values(c).reduce((a,b)=>a+b,0);let h=0;for(const v of Object.values(c)){const p=v/n;h-=p*Math.log(p);}return +Math.exp(h).toFixed(1);};
  o.gabaritsVus=Object.keys(cT).length;o.gabaritMax=N.length?+(Math.max.apply(null,Object.values(cT))/N.length).toFixed(2):0;o.effectif=N.length?ent(cT):0;o.famEffectif=N.length?ent(cS):0;
  o.classes=new Set(q.tpl.map((t,k)=>t?classeDe(q,k):null).filter(v=>v!=null&&v!=='rocher')).size;o.classesPalette=q.palette?new Set(q.palette.map(k=>classeDe(q,k)).filter(v=>v!=='rocher')).size:o.classes;o.clEffectif=N.length?ent(cC):0;o.partClasses={};for(const k in cC)o.partClasses[k]=+(cC[k]/N.length).toFixed(2);o.partFamilles={};for(const k in cS)o.partFamilles[NOMS[k]||k]=+(cS[k]/N.length).toFixed(2);
  o.partTours=+(N.filter(m=>m.cl==='tour').length/Math.max(1,N.length)).toFixed(2);o.renversees=+(N.filter(m=>m.inv).length/Math.max(1,N.length)).toFixed(2);
  /* les jumeaux : la plus proche voisine */
  {const G=250,gm=new Map();M.forEach((m,i)=>{const k=Math.floor(m.x/G)+','+Math.floor(m.z/G);let a=gm.get(k);if(!a)gm.set(k,a=[]);a.push(i);});
   let n=0,ju=0,cl=0,fa=0,id=0;const ex=[];
   for(const m of N){let bd=1e9,bm=null;const bx=Math.floor(m.x/G),bz=Math.floor(m.z/G);
     for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const c=gm.get((bx+a)+','+(bz+b));if(!c)continue;for(const i of c){const v=M[i];if(v===m)continue;const d=Math.hypot(v.x-m.x,v.z-m.z,(v.ym-m.ym)*.5);if(d<bd){bd=d;bm=v;}}}
     if(!bm||bd>G)continue;n++;if(bm.so===m.so)fa++;if(bm.t===m.t){ju++;if(Math.abs(Math.log(bm.sc/m.sc))<.1)id++; /* (2026-11-14) « identique » : même gabarit ET même échelle (q.sc) */if(bm.rot===m.rot&&bm.inv===m.inv)cl++;if(ex.length<5)ex.push({s:Math.round(m.i*q.pasRoute),gabarit:m.t,ecart:Math.round(bd),clone:bm.rot===m.rot&&bm.inv===m.inv});}}
   o.voisines={n:n,jumeaux:ju,partJumeaux:n?+(ju/n).toFixed(2):0,identiques:id,partIdentiques:n?+(id/n).toFixed(2):0,clones:cl,memeFamille:n?+(fa/n).toFixed(2):0,ex:ex};}
  /* la file le long de la route */
  {const F=M.filter(m=>m.d<60).sort((a,b)=>a.i-b.i);let su=0,sf=0,lf=0,cf=0,lt=0,ct=0,lc=0,cc=0,pv=null;
   for(const m of F){if(pv){if(pv.t===m.t)su++;if(pv.so===m.so){sf++;cf++;}else cf=1;}else cf=1;if(cf>lf)lf=cf;if(m.cl==='tour'){ct++;if(ct>lt)lt=ct;}else ct=0;if(pv&&pv.cl===m.cl){cc++;}else cc=1;if(cc>lc)lc=cc;pv=m;}
   o.file={n:F.length,suiteGabarit:su,partSuite:F.length>1?+(su/(F.length-1)).toFixed(2):0,partMemeFamille:F.length>1?+(sf/(F.length-1)).toFixed(2):0,serieFamille:lf,serieTours:lt,serieClasse:lc};}
  /* la fenêtre de 300 m */
  {const W=300,nb=[],nt=[],nc=[];for(let s=300;s<q.L-300;s+=W){const i0=s/q.pasRoute,i1=(s+W)/q.pasRoute,S=new Set(),Tt=new Set(),Cc=new Set();for(const m of N)if(m.i>=i0&&m.i<i1){S.add(m.so);Tt.add(m.t);Cc.add(m.cl);}nb.push(S.size);nt.push(Tt.size);nc.push(Cc.size);}
   o.fenetre={tranches:nb.length,famMin:Math.min.apply(null,nb),famMed:med(nb),gabMed:med(nt),uneSeuleFamille:+(nb.filter(v=>v<=1).length/nb.length).toFixed(2),uneSeuleClasse:+(nc.filter(v=>v<=1).length/nc.length).toFixed(2),clMed:med(nc)};}
  /* les tailles : hauteurs et rayons réellement posés (aucune mise à l'échelle : une valeur par gabarit) */
  o.hauteursDistinctes=new Set(N.map(m=>Math.round(m.y1-m.y0))).size;o.rayonsDistincts=new Set(N.map(m=>Math.round(m.r))).size;
  /* le coût */
  const a=g.perso;o.cout={gabarits:q.tpl.length,triGabNiv:q.triGab,triFin:q.triFin,grillesMo:+(q.octGrilles/1048576).toFixed(1),geoMo:+(q.tpl.reduce((s,t)=>s+(t?t.octGeo:0),0)/1048576).toFixed(1),finsMo:q.octFins!=null?+(q.octFins/1048576).toFixed(1):null,paletteGrillesMo:q.palette?+(q.palette.reduce((s,k)=>s+(q.tpl[k]?q.tpl[k].octGrille:0),0)/1048576).toFixed(1):null,paletteGeoMo:q.palette?+(q.palette.reduce((s,k)=>s+(q.tpl[k]?q.tpl[k].octGeo:0),0)/1048576).toFixed(1):null,familles:q.fam,instances:q.famInst,gabaritsMs:q.gabMs,genMs:q.genMs,
    constrMs:(g.constr||[]).filter(c=>c.etape==='fin').map(c=>c.ms),jadeMs:q.n&&q.n.ms,appelsJade:a.jade&&a.jade.appels,trianglesJade:a.jade&&a.jade.triangles,appelsImage:a.appels&&a.appels.appels,trianglesImage:a.appels&&a.appels.triangles,geometries:a.info&&a.info.geo,tasMo:a.tas};
  o.audit=a.audit&&a.audit.couloir?{couloir:a.audit.couloir.heurts,frole:a.audit.frole.n,panneaux:a.audit.panneaux.n,flottants:a.audit.flottants.n,cascades:a.audit.cascades.n,coeurs:a.audit.temoin.coeursPleins+'/'+a.audit.temoin.montagnes,approche:a.audit.temoin.approche,emp:a.audit.emp,regle:a.regle&&a.regle.heurts}:a.audit;
  o.erreurs=(g.erreurs||[]).length;
  return o;}
/* LES SILHOUETTES DISTINCTES du catalogue : le profil de chaque gabarit (rayon de ses couches à 24 hauteurs, ramené à son rayon maximal) et son élancement (hauteur / diamètre).
   Deux gabarits ont « la même silhouette » si leurs profils diffèrent de moins de --profil (0,12 en écart quadratique) ET leur élancement de moins de 35 % ; les groupes se comptent par union.
   (Un gabarit à plusieurs corps — `parts` — est compté à part : son profil ne se résume pas à un rayon par hauteur.) */
function silhouettes(q0){const q={tpl:q0.tpl.filter(t=>t)};const n=q.tpl.length,SEUIL=+(opt.profil||.12),P=q.tpl.map(function(t){const p=[];let rm=0;for(const l of t.ly)if(l[4]>rm)rm=l[4];for(let j=0;j<24;j++){const y=(j+.5)/24*t.H;let r=0;for(const l of t.ly)if(y>=l[0]&&y<l[1]){r=l[4];break;}p.push(r/(rm||1));}return p;}),A=q.tpl.map(t=>t.yTop/(2*t.rmax)),par=q.tpl.map((t,k)=>k);
  const tr=k=>{while(par[k]!==k)k=par[k]=par[par[k]];return k;};let dMin=1e9,dMax=0;
  for(let a=0;a<n;a++)for(let b=a+1;b<n;b++){if(q.tpl[a].parts||q.tpl[b].parts)continue;let d=0;for(let j=0;j<24;j++)d+=(P[a][j]-P[b][j])*(P[a][j]-P[b][j]);d=Math.sqrt(d/24);const e=Math.abs(Math.log(A[a]/A[b]));if(d<SEUIL&&e<.3)par[tr(a)]=tr(b);}
  const G={};for(let k=0;k<n;k++){const r=tr(k);(G[r]||(G[r]=[])).push(q.tpl[k].k!=null?q.tpl[k].k:k);}return Object.values(G).sort((a,b)=>b.length-a.length);}
const B=R.map(analyse);
for(const o of B){if(o.erreur){console.log('GRAINE '+o.graine+' · '+o.erreur);continue;}
  console.log('GRAINE '+o.graine+' · L '+o.L+' m · '+o.montagnes+' montagnes + '+o.rochers+' rochers · de près (<'+PRES+' m) '+o.pres+' · gabarits vus '+o.gabaritsVus+'/'+o.gabarits+' (effectif '+o.effectif+', le plus fréquent '+Math.round(o.gabaritMax*100)+' %) · familles effectives '+o.famEffectif+' · tours '+Math.round(o.partTours*100)+' % · renversées '+Math.round(o.renversees*100)+' % · CLASSES de silhouette effectives '+o.clEffectif+'/'+o.classes+' '+JSON.stringify(o.partClasses)+' · tranches de 300 m à une seule classe '+Math.round(o.fenetre.uneSeuleClasse*100)+' %');
  console.log('   voisines : '+o.voisines.jumeaux+'/'+o.voisines.n+' jumelles ('+Math.round(o.voisines.partJumeaux*100)+' %, '+o.voisines.identiques+' de même échelle), dont '+o.voisines.clones+' clones · même famille '+Math.round(o.voisines.memeFamille*100)+' % · file au bord : '+o.file.n+' pics, '+Math.round(o.file.partSuite*100)+' % de suites du même gabarit, '+Math.round(o.file.partMemeFamille*100)+' % de la même famille, série de tours la plus longue '+o.file.serieTours+', de la même classe '+o.file.serieClasse+' · tranches de 300 m : familles min '+o.fenetre.famMin+', médiane '+o.fenetre.famMed+', une seule famille dans '+Math.round(o.fenetre.uneSeuleFamille*100)+' %');
  console.log('   coût : '+JSON.stringify(o.cout));console.log('   audit : '+JSON.stringify(o.audit)+' · erreurs '+o.erreurs);}
const ok=B.filter(o=>!o.erreur);
if(ok.length){const moy=f=>+(ok.reduce((s,o)=>s+f(o),0)/ok.length).toFixed(2);
  console.log('BILAN · '+ok.length+' graines · catalogue : '+ok[0].gabarits+' gabarits, '+ok[0].familles+' familles ('+ok[0].catalogue+') · élancement H/D des gabarits : '+ok[0].elancement.join(' '));
  console.log('BILAN · effectif '+moy(o=>o.effectif)+' gabarits · familles effectives '+moy(o=>o.famEffectif)+' · tours '+Math.round(moy(o=>o.partTours)*100)+' % · jumelles '+Math.round(moy(o=>o.voisines.partJumeaux)*100)+' % (de même échelle '+Math.round(moy(o=>o.voisines.partIdentiques||0)*100)+' %) · clones '+moy(o=>o.voisines.clones)+' · voisines de même famille '+Math.round(moy(o=>o.voisines.memeFamille)*100)+' % · suites au bord '+Math.round(moy(o=>o.file.partSuite)*100)+' % · série de tours '+moy(o=>o.file.serieTours)+' (pire '+Math.max.apply(null,ok.map(o=>o.file.serieTours))+') · série de la même classe '+moy(o=>o.file.serieClasse)+' (pire '+Math.max.apply(null,ok.map(o=>o.file.serieClasse))+') · tranches à une seule famille '+Math.round(moy(o=>o.fenetre.uneSeuleFamille)*100)+' % · hauteurs distinctes '+moy(o=>o.hauteursDistinctes)+' · CLASSES effectives '+moy(o=>o.clEffectif)+'/'+ok[0].classes+' · tranches à une seule classe '+Math.round(moy(o=>o.fenetre.uneSeuleClasse)*100)+' %');}
{const g0=R.find(g=>g.perso&&g.perso.pil&&g.perso.pil.P);if(g0){const S=silhouettes(g0.perso.pil);console.log('BILAN · silhouettes distinctes du catalogue : '+S.length+' pour '+g0.perso.pil.tpl.filter(t=>t).length+' gabarits taillés (dont '+g0.perso.pil.tpl.filter(t=>t&&t.parts).length+' à plusieurs corps, comptés à part) — groupes : '+S.map(a=>'['+a.join(' ')+']').join(' '));if(B[0]&&!B[0].erreur)B[0].silhouettes=S;}}
if(opt.json)fs.writeFileSync(opt.json,JSON.stringify(B,null,1));
/* ---- la planche du catalogue : chaque gabarit en silhouette (ses couches : centre, rayon), à l'échelle, rangés par famille ---- */
if(opt.planche&&ok.length){const {Img,px,png}=require(path.join(__dirname,'..','banc-routes','png.cjs'));
  const q=R.find(g=>g.perso&&g.perso.pil&&g.perso.pil.P).perso.pil,VX=q.VX,E=+(opt.echelle||1.6); /* m par pixel */
  const ordre=q.tpl.map((t,k)=>t?k:-1).filter(k=>k>=0).sort((a,b)=>{const sa=String(sorteDe(q,a)),sb=String(sorteDe(q,b));return sa<sb?-1:sa>sb?1:a-b;});
  let W=20;const X=[];for(const k of ordre){const t=q.tpl[k],w=Math.ceil(2*t.rmax*VX/E)+16;X.push(W+w/2);W+=w;}W+=20;
  const Hm=Math.max.apply(null,q.tpl.filter(t=>t).map(t=>t.yTop))*VX,H=Math.ceil(Hm/E)+50,im=Img(W,H,[236,240,236]);
  const COL={0:[70,110,90],1:[60,90,120],2:[120,95,60],3:[110,70,110],4:[40,130,110],5:[90,90,90],r:[150,150,150]},PAL=[[70,110,90],[60,90,120],[120,95,60],[110,70,110],[40,130,110],[150,80,60],[90,90,90],[60,120,140],[130,110,50],[100,60,90],[50,100,60],[140,90,110],[80,80,130],[120,120,70],[60,60,60],[160,100,40]],CL=[];
  const teinte=k=>{const cl=classeDe(q,k);if(cl==='rocher')return [150,150,150];let i=CL.indexOf(cl);if(i<0){CL.push(cl);i=CL.length-1;}return PAL[i%PAL.length];};
  ordre.forEach((k,n)=>{const t=q.tpl[k],c=t.classe!=null?teinte(k):COL[sorteDe(q,k)]||[60,60,60],x0=X[n],yb=H-20;
    for(const l of t.ly)for(const d of [[l[2],l[3],l[4]]].concat(l[6]||[])){const xa=Math.round(x0+(d[0]-d[2])*VX/E),xb=Math.round(x0+(d[0]+d[2])*VX/E),ya=Math.round(yb-l[1]*VX/E),yc=Math.round(yb-l[0]*VX/E);for(let y=ya;y<yc;y++)for(let x=xa;x<xb;x++)px(im,x,y,c);} /* la silhouette vue le long de z : tous les disques de la tranche */
    for(let x=Math.round(x0-t.rmax*VX/E);x<x0+t.rmax*VX/E;x++)px(im,x,yb+3,[0,0,0]); /* le diamètre maximal */
    for(let j=0;j<=k;j++)for(let y=0;y<4;y++)px(im,Math.round(x0-k*2+j*4),yb+8+y,c);}); /* k+1 points : l'indice du gabarit */
  for(let x=0;x<W;x++)px(im,x,H-20,[0,0,0],.4);
  fs.writeFileSync(opt.planche,png(im));console.log('planche : '+opt.planche+' ('+W+'×'+H+', '+E+' m/pixel, rangés par famille : '+ordre.join(' ')+')');}
