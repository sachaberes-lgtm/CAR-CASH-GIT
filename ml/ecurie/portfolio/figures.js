#!/usr/bin/env node
/* ===== LES IMAGES TECHNIQUES DU PORTFOLIO (2026-11-25, Sacha : « de belles figures tirees des VRAIES donnees des simulations ») =====
   Node pur, sans dependance. Une commande refait toutes les figures, en deux versions (sombre, clair), dans images/ :
     node ml/ecurie/portfolio/figures.js              les figures, a partir des fichiers du depot
     node ml/ecurie/portfolio/figures.js --rejouer    rejoue d'abord la course du radar (radar-course.js : une course du jeu, ~40 s)
     node ml/ecurie/portfolio/figures.js --verifier   relit chaque SVG ecrit (XML bien forme, viewBox, aucun NaN)
   Les figures et ce qu'elles lisent :
     1. course-dessus   la course c0003-g910629 vue de dessus     ml/labo/trajectoires/c0003-g910629.json.gz, ml/labo/rejeux/c0003-g910629.json
     2. radar           les 10 rayons a la 1re vue d'un vol        donnees/radar-c0003-g910629.json.gz (radar-course.js)
     3. main            les touches sur 20 s, les durees d'appui   le rejeu, les trajectoires gardees de c0003, ml/bot/etalon/*.json (mesures.js)
     4. paliers         les paliers par course                     ml/bot/results/note-reference-allege.json, ml/labo/journal/cerveaux.jsonl (c0003),
                                                                   ml/bot/results/etalon.json
     5. justesse        l'ecart prevu / arrive des poses           ml/bot/results/justesse-allege.json, justesse-allege-main-clavier.json */
const fs=require('fs'),path=require('path'),zlib=require('zlib'),{execFileSync}=require('child_process');
const ICI=__dirname,RACINE=path.join(ICI,'..','..','..'),IMG=path.join(ICI,'images');
const A=process.argv.slice(2);
const M=require(path.join(RACINE,'ml','bot','mesures.js'));

/* ---------------- les fichiers ---------------- */
const lire=f=>{const b=fs.readFileSync(path.join(RACINE,f));return JSON.parse(/\.gz$/.test(f)?zlib.gunzipSync(b):b);};
const lignes=f=>fs.readFileSync(path.join(RACINE,f),'utf8').split('\n').filter(x=>x.trim()).map(x=>JSON.parse(x));
const dateFr=iso=>{const d=new Date(iso);return String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0')+'/'+d.getFullYear();};

/* ---------------- les nombres a la francaise ---------------- */
const NB=' ',MOINS='−';
function nf(x,k){
  if(x==null||!isFinite(x))return '–';
  k=k||0;let s=Math.abs(x).toFixed(k);let [e,d]=s.split('.');
  if(e.length>3)e=e.replace(/\B(?=(\d{3})+(?!\d))/g,NB);
  return (x<0&&+s!==0?MOINS:'')+e+(d?','+d:'');}
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const r1=x=>Math.round(x*10)/10,r2=x=>Math.round(x*100)/100;
const med=a=>{if(!a.length)return null;const s=a.slice().sort((x,y)=>x-y),n=s.length;return n%2?s[(n-1)/2]:(s[n/2-1]+s[n/2])/2;};
const quant=(a,p)=>{if(!a.length)return null;const s=a.slice().sort((x,y)=>x-y);return s[Math.round(p*(s.length-1))];};

/* ---------------- les deux themes : les couleurs de la page (index.html, :root) ---------------- */
const THEMES={
  sombre:{nom:'sombre',fond:'#0f1115',panneau:'#151820',texte:'#e8e6e1',texte2:'#9da2ab',grille:'#22262e',axe:'#5a606a',route:'#363c47',vrai:'#f4f2ee',
    pilote:'#e0b04a',joueurs:'#4cc38a',reference:'#8fa3c4',machine:'#6ea8fe',clavier:'#e0b04a',mort:'#f07167',vol:'#6ea8fe',
    rayons:{tenu:'#c9b6ff',rien:'#9da2ab',gauche:'#6ea8fe',droite:'#f28e2b',cabre:'#59c3c3',pique:'#c06fd0',plane:'#e8d44d',planeCabre:'#ff9da7',versRoute:'#4cc38a',versRoutePlane:'#f07167'},
    cmap:[.2,1]},
  clair:{nom:'clair',fond:'#ffffff',panneau:'#f6f5f1',texte:'#1c1c21',texte2:'#5b5b66',grille:'#e9e6df',axe:'#8d8a83',route:'#d3d0c8',vrai:'#111216',
    pilote:'#9a6a00',joueurs:'#1f7a4d',reference:'#3d5a8a',machine:'#2f6db5',clavier:'#9a6a00',mort:'#b3261e',vol:'#2f6db5',
    rayons:{tenu:'#6f4fd0',rien:'#7d7d86',gauche:'#2f6db5',droite:'#d0670c',cabre:'#178a8a',pique:'#9a3fb0',plane:'#a88a00',planeCabre:'#d4557a',versRoute:'#1f7a4d',versRoutePlane:'#b3261e'},
    cmap:[0,.86]}};
/* viridis, la palette sequentielle de matplotlib (lisible en gris, sans rouge-vert) */
const VIRIDIS=['#440154','#482475','#414487','#355f8d','#2a788e','#21918c','#22a884','#44bf70','#7ad151','#bddf26','#fde725'];
function hex(c){return [1,3,5].map(i=>parseInt(c.slice(i,i+2),16));}
function couleur(th,u){
  u=Math.max(0,Math.min(1,u));const v=th.cmap[0]+u*(th.cmap[1]-th.cmap[0]),x=v*10,i=Math.min(9,Math.floor(x)),f=x-i;
  const a=hex(VIRIDIS[i]),b=hex(VIRIDIS[i+1]);return '#'+a.map((c,k)=>Math.round(c+(b[k]-c)*f).toString(16).padStart(2,'0')).join('');}

/* ---------------- la largeur d'un texte, estimee (px par caractere, system-ui) : pour couper et caler sans navigateur ---------------- */
const LARG={ti:8.4,t:6.5,tb:7,t2:6.2,p:5.7,pt:5.7,src:5.4};
const largeur=(txt,cls)=>String(txt).length*(LARG[String(cls||'t').split(' ')[0]]||6.4);
function coupe(txt,cls,w){const mots=String(txt).split(' '),L=[];let cur='';
  for(const m of mots){const essai=cur?cur+' '+m:m;if(cur&&largeur(essai,cls)>w){L.push(cur);cur=m;}else cur=essai;}
  if(cur)L.push(cur);return L;}

/* ---------------- le SVG ---------------- */
class Svg{
  constructor(w,h,th,aria){this.w=w;this.h=h;this.th=th;this.aria=aria;this.o=[];this.defs=[];}
  add(s){this.o.push(s);return this;}
  t(x,y,txt,cls,plus){plus=(plus||'').replace(/fill="([^"]+)"/,'style="fill:$1"');return this.add(`<text x="${r1(x)}" y="${r1(y)}"${cls?` class="${cls}"`:''}${plus?' '+plus:''}>${esc(txt)}</text>`);}
  l(x1,y1,x2,y2,c,w,plus){return this.add(`<line x1="${r1(x1)}" y1="${r1(y1)}" x2="${r1(x2)}" y2="${r1(y2)}" stroke="${c}" stroke-width="${w||1}"${plus?' '+plus:''}/>`);}
  p(d,c,w,plus){return this.add(`<path d="${d}" fill="none" stroke="${c}" stroke-width="${w||1}" stroke-linejoin="round" stroke-linecap="round"${plus?' '+plus:''}/>`);}
  r(x,y,w,h,f,plus){return this.add(`<rect x="${r1(x)}" y="${r1(y)}" width="${r1(Math.max(0,w))}" height="${r1(Math.max(0,h))}" fill="${f}"${plus?' '+plus:''}/>`);}
  c(x,y,r,f,plus){return this.add(`<circle cx="${r1(x)}" cy="${r1(y)}" r="${r}" fill="${f}"${plus?' '+plus:''}/>`);}
  x(x,y,s,c,w){return this.p(`M${r1(x-s)} ${r1(y-s)}L${r1(x+s)} ${r1(y+s)}M${r1(x-s)} ${r1(y+s)}L${r1(x+s)} ${r1(y-s)}`,c,w||1.6);}
  /* un texte tenu entre deux bords (x0, x1) : decale s'il deborde (sa largeur est estimee) */
  tc(x,y,txt,cls,plus,x0,x1){const w=largeur(txt,cls),an=/\be\b/.test(cls)?'e':/\bm\b/.test(cls)?'m':'s';
    let g=an==='e'?x-w:an==='m'?x-w/2:x;if(x1!=null&&g+w>x1)g=x1-w;if(x0!=null&&g<x0)g=x0;
    const cl=cls.replace(/\s*\b[em]\b/g,'');return this.t(g,y,txt,cl,plus);}
  /* un paragraphe coupe a la largeur w ; rend le nombre de lignes */
  para(x,y,txt,cls,w,lh,plus){const L=coupe(txt,cls,w);L.forEach((l,i)=>this.t(x,y+i*lh,l,cls,plus));return L.length;}
  /* le titre, la ligne d'explication (coupee), et la source en bas (une ou deux lignes) */
  entete(titre,sous){this.t(16,24,titre,'ti');if(sous)this.para(16,42,sous,'t2',this.w-32,15);return this;}
  source(txt){const L=coupe(txt,'src',this.w-32);L.forEach((l,i)=>this.t(16,this.h-10-(L.length-1-i)*13,l,'src'));return this;}
  fin(){const th=this.th;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${this.w} ${this.h}" width="${this.w}" height="${this.h}" role="img" aria-label="${esc(this.aria)}">
<style>
text{font-family:system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;font-variant-numeric:tabular-nums}
.ti{font-size:15px;font-weight:650;fill:${th.texte}}
.t{font-size:12px;fill:${th.texte}}
.tb{font-size:12px;font-weight:650;fill:${th.texte}}
.t2{font-size:11.5px;fill:${th.texte2}}
.p{font-size:10.5px;fill:${th.texte2}}
.pt{font-size:10.5px;fill:${th.texte}}
.src{font-size:10px;font-style:italic;fill:${th.texte2}}
.m{text-anchor:middle}.e{text-anchor:end}
.h{paint-order:stroke;stroke:${th.panneau};stroke-width:3.5px;stroke-linejoin:round}
.hf{paint-order:stroke;stroke:${th.fond};stroke-width:3.5px;stroke-linejoin:round}
</style>
${this.defs.length?'<defs>'+this.defs.join('')+'</defs>\n':''}<rect width="${this.w}" height="${this.h}" fill="${th.fond}"/>
${this.o.join('\n')}
</svg>
`;}
}
/* une echelle lineaire, et des graduations rondes */
const echelle=(d0,d1,r0,r1)=>{const f=v=>r0+(v-d0)/(d1-d0)*(r1-r0);f.d=[d0,d1];f.r=[r0,r1];return f;};
function graduations(a,b,n){const pas0=(b-a)/(n||5),p=Math.pow(10,Math.floor(Math.log10(pas0))),m=pas0/p,pas=(m<1.5?1:m<3.5?2:m<7.5?5:10)*p,o=[];
  for(let v=Math.ceil(a/pas-1e-9)*pas;v<=b+1e-9;v+=pas)o.push(+v.toFixed(10));o.pas=pas;return o;}
const decimales=pas=>pas>=1?0:Math.ceil(-Math.log10(pas)-1e-9);
/* un axe horizontal (en bas) ou vertical (a gauche), grille comprise */
function axeX(S,sx,y,yHaut,ticks,etiq,k){const th=S.th;
  for(const v of ticks){const x=sx(v);if(yHaut!=null)S.l(x,yHaut,x,y,th.grille,1);S.l(x,y,x,y+4,th.axe,1);S.t(x,y+16,nf(v,k),'p m');}
  S.l(sx.r[0],y,sx.r[1],y,th.axe,1);if(etiq)S.t((sx.r[0]+sx.r[1])/2,y+31,etiq,'t2 m');}
function axeY(S,sy,x,xDroite,ticks,etiq,k,fmt){const th=S.th;
  for(const v of ticks){const y=sy(v);if(xDroite!=null)S.l(x,y,xDroite,y,th.grille,1);S.l(x-4,y,x,y,th.axe,1);S.t(x-7,y+3.5,fmt?fmt(v):nf(v,k),'p e');}
  S.l(x,sy.r[0],x,sy.r[1],th.axe,1);
  if(etiq){const yc=(sy.r[0]+sy.r[1])/2;S.add(`<text x="0" y="0" class="t2 m" transform="translate(${r1(x-40)} ${r1(yc)}) rotate(-90)">${esc(etiq)}</text>`);}}
const chemin=pts=>pts.map((p,i)=>(i?'L':'M')+r1(p[0])+' '+r1(p[1])).join('');

/* ===================================================================================================================================== */
/* 1. UNE COURSE VUE DE DESSUS                                                                                                           */
/* ===================================================================================================================================== */
const COURSE='c0003-g910629';
const CARTES_FR={espace:'espace (en orbite)',nuages:'nuages',ville:'ville',jade:'jade',grotte:'grotte',canyon:'canyon',crypto:'Crypto City'};
const CAUSES_FR={air:'jauge d’air vide',vide:'chute dans le vide',paroi:'paroi du canyon',tour:'tour',roche:'roche',pic:'pic'};
function figCourse(th){
  const T=lire(`ml/labo/trajectoires/${COURSE}.json.gz`),RJ=lire(`ml/labo/rejeux/${COURSE}.json`);
  const J=lignes('ml/labo/journal/cerveaux.jsonl').find(x=>x.id===RJ.cerveau.id);
  const col={};T.cols.forEach((n,i)=>col[n]=i);const g=(e,n)=>e[col[n]];
  const E=T.ech.filter(e=>g(e,'m')!==3); /* l'explosion ne compte pas (mesures.js, finVraie) */
  const W=960,H=662,S=new Svg(W,H,th,`La course ${COURSE} du pilote vue de dessus, map par map, colorée par la vitesse`);
  const vmax=Math.ceil(Math.max(...E.map(e=>g(e,'kmh')))/100)*100;
  const coul=v=>couleur(th,v/vmax);
  const mort=T.ev.find(e=>e[1]==='mort'),routesEv=T.ev.filter(e=>e[1]==='route');
  const debut=[0].concat(routesEv.map(e=>e[0])),finT=T.fin.t;
  const palier=M.palierDe(T.fin.pieces);
  S.entete('Une course du pilote, vue de dessus',
    `${RJ.cerveau.id} « ${RJ.cerveau.nom} », graine ${RJ.graine} · ${T.routes.length} maps, ${nf(mort?mort[0]:finT,1)} s, ${nf(T.fin.pieces)} pièces (palier ${palier}) · chaque map a son repère : la route repart de l’origine à chaque portail`);
  /* les panneaux : un par map, a la meme echelle pour toutes (on compare les longueurs) */
  const nP=T.routes.length,marge=16,ecart=14,pw=(W-2*marge-(nP-1)*ecart)/nP,ph=300,py0=78;
  const bornes=T.routes.map((R,r)=>{const xs=R.P.map(p=>p[0]).concat(E.filter(e=>g(e,'r')===r).map(e=>g(e,'x'))),zs=R.P.map(p=>p[2]).concat(E.filter(e=>g(e,'r')===r).map(e=>g(e,'z')));
    return {x0:Math.min(...xs),x1:Math.max(...xs),z0:Math.min(...zs),z1:Math.max(...zs)};});
  const k=Math.min(...bornes.map(b=>Math.min((pw-28)/(b.x1-b.x0),(ph-40)/(b.z1-b.z0))));
  T.routes.forEach((R,r)=>{
    const px=marge+r*(pw+ecart),b=bornes[r],cx=px+pw/2,cy=py0+ph/2+6,mx=(b.x0+b.x1)/2,mz=(b.z0+b.z1)/2;
    const X=x=>cx+(x-mx)*k,Z=z=>cy+(z-mz)*k;
    S.r(px,py0,pw,ph,th.panneau,'rx="6"');
    const t0=debut[r],t1=r+1<debut.length?debut[r+1]:finT;
    S.t(px+10,py0+18,`${r+1} · ${CARTES_FR[R.carte]||R.carte}`,'tb');
    S.t(px+pw-10,py0+18,`${nf(t0,1)} → ${nf(t1,1)} s · route de ${nf(R.L/1000,1)} km`,'p e');
    /* la route : sa vraie largeur (2 × ${R.rh} m), au moins 3 px */
    S.p(chemin(R.P.map(p=>[X(p[0]),Z(p[2])])),th.route,Math.max(3,2*R.rh*k));
    /* la caisse : au sol, un trait colore par la vitesse ; en vol, des pointilles */
    const ech=E.filter(e=>g(e,'r')===r);
    let cur=null;const fl=()=>{if(cur&&cur.pts.length>1)S.p(chemin(cur.pts),cur.c,1.7);cur=null;};
    for(let i=1;i<ech.length;i++){const a=ech[i-1],e=ech[i];if(g(e,'m')!==0||g(a,'m')!==0){fl();continue;}
      const c=coul(Math.round(g(e,'kmh')/vmax*24)/24*vmax);
      if(!cur||cur.c!==c){fl();cur={c:c,pts:[[X(g(a,'x')),Z(g(a,'z'))]]};}
      cur.pts.push([X(g(e,'x')),Z(g(e,'z'))]);}
    fl();
    /* les vols : du dernier echantillon au sol au premier qui revient au sol */
    for(let i=1;i<ech.length;i++){if(!(g(ech[i],'m')>=1&&g(ech[i-1],'m')===0))continue;
      let j=i;while(j<ech.length&&g(ech[j],'m')>=1)j++;const seg=ech.slice(i-1,Math.min(ech.length,j+1));
      const vm=seg.reduce((s,e)=>s+g(e,'kmh'),0)/seg.length;
      S.p(chemin(seg.map(e=>[X(g(e,'x')),Z(g(e,'z'))])),coul(vm),1.7,'stroke-dasharray="4 3"');i=j;}
    /* le depart, le portail, la mort */
    const bx0=px+6,bx1=px+pw-6; /* les textes restent dans le panneau */
    if(r===0){const e=ech[0];S.c(X(g(e,'x')),Z(g(e,'z')),4.5,'none',`stroke="${th.texte}" stroke-width="1.5"`);
      S.tc(X(g(e,'x'))+8,Z(g(e,'z'))+16,'départ, 0 s','pt h','',bx0,bx1);}
    if(r+1<T.routes.length){const e=ech[ech.length-1],x=X(g(e,'x')),y=Z(g(e,'z'));
      S.add(`<path d="M${r1(x)} ${r1(y-6)}L${r1(x+6)} ${r1(y)}L${r1(x)} ${r1(y+6)}L${r1(x-6)} ${r1(y)}Z" fill="${th.fond}" stroke="${th.texte}" stroke-width="1.4"/>`);
      S.tc(x+(x>cx?-10:10),y-9,`portail à ${nf(t1,1)} s → ${T.routes[r+1].carte}`,'pt h'+(x>cx?' e':''),'',bx0,bx1);}
    if(r>0){const e=ech[0],x=X(g(e,'x')),y=Z(g(e,'z'));S.add(`<path d="M${r1(x)} ${r1(y-5)}l5 5l-5 5l-5-5z" fill="${th.texte}"/>`);
      S.tc(x+(x>cx?-9:9),y+16,`arrivée à ${nf(t0,1)} s`,'p h'+(x>cx?' e':''),'',bx0,bx1);}
    if(mort&&r===T.routes.length-1){const e=ech[ech.length-1],x=X(g(e,'x')),y=Z(g(e,'z'));
      S.x(x,y,6,th.mort,2.4);
      S.tc(x,y+22,`mort à ${nf(mort[0],1)} s`,'tb m h',`fill="${th.mort}"`,bx0,bx1);
      S.tc(x,y+36,`« ${mort[2]} » : ${CAUSES_FR[mort[2]]||mort[2]}`,'pt m h','',bx0,bx1);
      /* d'ou part ce dernier vol, et jusqu'ou il s'ecarte de la route */
      const dec=T.ev.filter(q=>q[1]==='decol'&&q[0]<mort[0]).pop();
      if(dec){const ed=ech.reduce((a,q)=>Math.abs(g(q,'t')-dec[0])<Math.abs(g(a,'t')-dec[0])?q:a);
        S.c(X(g(ed,'x')),Z(g(ed,'z')),3,th.texte);
        const lat=Math.max(...ech.filter(q=>g(q,'t')>=dec[0]).map(q=>Math.abs(g(q,'lat'))));
        S.tc((X(g(ed,'x'))+x)/2,Math.min(y,Z(g(ed,'z')))-22,`dernier vol : ${nf(mort[0]-dec[0],1)} s,`,'pt m h','',bx0,bx1);
        S.tc((X(g(ed,'x'))+x)/2,Math.min(y,Z(g(ed,'z')))-9,`jusqu’à ${nf(lat/1000,1)} km de la route`,'pt m h','',bx0,bx1);}}
    /* le plus long vol pose */
    const poses=T.ev.filter(q=>q[1]==='pose'&&q[0]>=t0&&q[0]<t1);
    const L9=poses.reduce((a,q)=>!a||q[5]>a[5]?q:a,null);
    if(L9&&L9[5]>=3){const tm=L9[0]-L9[5]/2,em=ech.reduce((a,q)=>Math.abs(g(q,'t')-tm)<Math.abs(g(a,'t')-tm)?q:a),x=X(g(em,'x')),y=Z(g(em,'z'));
      const nb=T.ev.filter(q=>q[1]==='bump'&&q[0]>L9[0]-L9[5]&&q[0]<=L9[0]).length;
      const lx=x<cx?x+40:x-40,ly=y<cy?y+46:y-46,an=lx<x?' e':'';
      S.l(x,y,lx,ly,th.texte2,1);S.c(x,y,2.5,th.texte);
      S.tc(lx+(lx<x?-4:4),ly+(ly<y?-18:12),`vol posé de ${nf(L9[5],2)} s`,'tb h'+an,'',bx0,bx1);
      S.tc(lx+(lx<x?-4:4),ly+(ly<y?-18:12)+14,`${nf(L9[6])} m au plus haut,`,'pt h'+an,'',bx0,bx1);
      S.tc(lx+(lx<x?-4:4),ly+(ly<y?-18:12)+27,`${nb} rebond${nb>1?'s':''} sur la tranche`,'pt h'+an,'',bx0,bx1);}
    /* une barre d'echelle */
    const bm=1000,bx=px+12,by=py0+ph-14;S.l(bx,by,bx+bm*k,by,th.texte,1.5);S.l(bx,by-3,bx,by+3,th.texte,1.5);S.l(bx+bm*k,by-3,bx+bm*k,by+3,th.texte,1.5);
    S.t(bx+bm*k+6,by+3.5,'1 km','p');
  });
  /* la legende et la barre de couleur */
  const ly=py0+ph+26;
  S.p(`M16 ${ly}h26`,coul(vmax*.6),2);S.t(48,ly+4,'au sol','t2');
  S.p(`M100 ${ly}h26`,coul(vmax*.6),2,'stroke-dasharray="4 3"');S.t(132,ly+4,'en vol','t2');
  S.p(`M186 ${ly}h26`,th.route,6);S.t(218,ly+4,`la route (${2*T.routes[0].rh} m de large)`,'t2');
  S.x(352,ly,5,th.mort,2.2);S.t(362,ly+4,'mort','t2');
  S.add(`<path d="M407 ${ly-5}l5 5l-5 5l-5-5z" fill="none" stroke="${th.texte}" stroke-width="1.3"/>`);S.t(418,ly+4,'portail','t2');
  const gid='vit-'+th.nom;S.defs.push(`<linearGradient id="${gid}" x1="0" x2="1" y1="0" y2="0">`+Array.from({length:11},(_,i)=>`<stop offset="${i/10}" stop-color="${couleur(th,i/10)}"/>`).join('')+'</linearGradient>');
  const gx=W-16-300;S.t(gx-8,ly+4,'vitesse','t2 e');S.r(gx,ly-6,300,10,`url(#${gid})`);
  for(const v of graduations(0,vmax,6)){const x=gx+v/vmax*300;S.l(x,ly+4,x,ly+8,th.axe,1);S.t(x,ly+20,nf(v),'p m');}
  S.t(gx+300,ly+34,'km/h','p e');
  /* la vitesse dans le temps */
  const y0=ly+60,y1=y0+120,sx=echelle(0,Math.ceil(finT/20)*20,64,W-20),sy=echelle(0,vmax,y1,y0);
  S.t(16,y0-12,'La même course dans le temps : vitesse, vols (bandes), portails, mort','tb');
  for(let i=1;i<E.length;i++){if(g(E[i],'m')>=1&&g(E[i-1],'m')===0){let j=i;while(j<E.length&&g(E[j],'m')>=1)j++;
    S.r(sx(g(E[i-1],'t')),y0,sx(g(E[Math.min(E.length-1,j)],'t'))-sx(g(E[i-1],'t')),y1-y0,th.vol,'opacity="0.16"');i=j;}}
  axeY(S,sy,64,W-20,graduations(0,vmax,4),'km/h',0);
  axeX(S,sx,y1,null,graduations(0,sx.d[1],8),'temps de course (s)',0);
  routesEv.forEach((e,i)=>{S.l(sx(e[0]),y0-4,sx(e[0]),y1,th.texte2,1,'stroke-dasharray="3 3"');});
  debut.forEach((t,i)=>{const t1=i+1<debut.length?debut[i+1]:finT;S.t((sx(t)+sx(t1))/2,y0+12,T.routes[i].carte,'p m');});
  let seg=null;const fl=()=>{if(seg&&seg.pts.length>1)S.p(chemin(seg.pts),seg.c,1.6);seg=null;};
  for(let i=1;i<E.length;i++){const a=E[i-1],e=E[i],c=coul(Math.round(g(e,'kmh')/vmax*24)/24*vmax);
    if(g(e,'t')-g(a,'t')>.5){fl();continue;}
    if(!seg||seg.c!==c){fl();seg={c:c,pts:[[sx(g(a,'t')),sy(g(a,'kmh'))]]};}seg.pts.push([sx(g(e,'t')),sy(g(e,'kmh'))]);}
  fl();
  if(mort){const e=E[E.length-1];S.x(sx(mort[0]),sy(g(e,'kmh')),5,th.mort,2.2);}
  S.source(`source : ml/labo/trajectoires/${COURSE}.json.gz (l’enregistreur du jeu, 10 points/s) et ml/labo/rejeux/${COURSE}.json · graine ${RJ.graine} · ${RJ.jeu.version}, régime ${RJ.jeu.regime==='allege'?'allégé':RJ.jeu.regime} · course du ${dateFr(J?J.date:RJ.date||Date.now())}`);
  return S.fin();
}

/* ===================================================================================================================================== */
/* 2. LE RADAR D'UN VOL                                                                                                                  */
/* ===================================================================================================================================== */
const RADAR='ml/ecurie/portfolio/donnees/radar-c0003-g910629.json.gz';
const VOL_T=+(A[A.indexOf('--vol')+1]||0)||150.9;  /* le vol choisi : celui qui decolle a cette seconde (le premier qui la suit) */
const NOMS_RAYONS={tenu:'tenu (l’ordre en vigueur)',rien:'rien',gauche:'gauche',droite:'droite',cabre:'cabre',pique:'pique',plane:'plane (nitro)',planeCabre:'plane + cabre',versRoute:'vers la route',versRoutePlane:'vers la route + nitro'};
const ISSUES_FR={pose:'pose',levre:'lèvre',choc:'choc',air:'jauge vide',fond:'fond',libre:'libre',coupe:'coupé',portail:'portail'};
function marqueIssue(S,x,y,issue,c){
  if(issue==='pose')S.c(x,y,3.6,c,`stroke="${S.th.fond}" stroke-width="1"`);
  else if(issue==='levre')S.add(`<path d="M${r1(x)} ${r1(y-4)}l4 4l-4 4l-4-4z" fill="${c}"/>`);
  else if(issue==='choc')S.x(x,y,4,c,2);
  else if(issue==='air')S.c(x,y,3.6,'none',`stroke="${c}" stroke-width="1.6"`);
  else if(issue==='fond')S.add(`<path d="M${r1(x-4)} ${r1(y-3)}h8l-4 7z" fill="${c}"/>`);
  else S.l(x-3,y,x+3,y,c,1.6);}
function figRadar(th){
  const D=lire(RADAR);
  const V=D.vols.find(v=>v.image0/60>=VOL_T-.2&&v.rayons&&v.radar);
  if(!V)throw new Error('aucun vol a '+VOL_T+' s dans '+RADAR);
  const W=960,H=640,S=new Svg(W,H,th,'Les dix rayons du radar à la première image d’un vol, et le vol réellement joué, vus de côté et de dessus');
  const R=V.route,P=R.pts; /* [s, x, y, z, bx, by, bz, ny] */
  const proche=(x,y,z)=>{let b=0,d=1e18;for(let i=0;i<P.length;i++){const q=P[i],e=(q[1]-x)**2+(q[2]-y)**2+(q[3]-z)**2;if(e<d){d=e;b=i;}}return b;};
  /* les chemins : chaque rayon (un rayon « copie » a celui de « tenu »), et le vol vrai */
  const parNom={};for(const y of V.rayons)if(y.p)parNom[y.m]=y.p;
  const triples=a=>{const o=[];for(let i=0;i+2<a.length;i+=3)o.push([a[i],a[i+1],a[i+2]]);return o;};
  const rayons=V.radar.rayons.map(y=>{const r=V.rayons.find(q=>q.m===y.m);return Object.assign({},y,{pts:triples(r&&r.p?r.p:parNom[r&&r.copie]||[])});});
  const vrai=triples(V.places),dep=V.depart;
  /* le repere : depart = la caisse a la 1re vue ; u = l'axe de la route a cet endroit, a plat ; v = sa gauche */
  const i0=proche(dep[0],dep[1],dep[2]),qa=P[Math.max(0,i0-2)],qb=P[Math.min(P.length-1,i0+2)];
  let tx=qb[1]-qa[1],tz=qb[3]-qa[3];{const n=Math.hypot(tx,tz);tx/=n;tz/=n;}
  let bx=P[i0][4],bz=P[i0][6];{const n=Math.hypot(bx,bz);bx/=n;bz/=n;}
  if(tx*bz-tz*bx>0){} /* b est la gauche de la route (lat > 0 = a gauche) : on la garde telle quelle */
  const U=p=>(p[0]-dep[0])*tx+(p[2]-dep[2])*tz,Vv=p=>(p[0]-dep[0])*bx+(p[2]-dep[2])*bz;
  const s0=P[i0][0],y0=dep[1];
  const sOf=p=>{const i=proche(p[0],p[1],p[2]);let best=P[i][0],dmin=Infinity;
    for(const j of [i-1,i]){if(j<0||j+1>=P.length)continue;const a=P[j],b=P[j+1],ab=[b[1]-a[1],b[2]-a[2],b[3]-a[3]],ap=[p[0]-a[1],p[1]-a[2],p[2]-a[3]];
      const L2=ab[0]**2+ab[1]**2+ab[2]**2,t=Math.max(0,Math.min(1,(ap[0]*ab[0]+ap[1]*ab[1]+ap[2]*ab[2])/(L2||1)));
      const d=(ap[0]-t*ab[0])**2+(ap[1]-t*ab[1])**2+(ap[2]-t*ab[2])**2;if(d<dmin){dmin=d;best=a[0]+t*(b[0]-a[0]);}}
    return best;};
  /* les evenements du vrai vol */
  const evs=D.ev.filter(e=>e[0]*60>=V.image0-1&&e[0]*60<=V.image1+2);
  const pose=evs.find(e=>e[1]==='pose'),bumps=evs.filter(e=>e[1]==='bump'),mortV=evs.find(e=>e[1]==='mort');
  const tVol=(V.image1-V.image0)/60,tVue=V.vue.t;
  S.entete('Le radar : dix façons de finir un vol, calculées avant qu’il arrive',
    `${D.id}, graine ${D.graine}, ${V.vue.carte} : décollage par le bord à ${nf(V.image0/60,2)} s, ${nf(V.vue.vitesse*3.6)} km/h · les rayons partent de la 1re vue du vol (t = ${nf(tVue,2)} s), chacun rejoué image par image (1/60 s)`);
  /* --- la vue de cote --- */
  const allPts=rayons.flatMap(r=>r.pts).concat(vrai);
  const sMin=Math.min(...allPts.map(sOf))-20,sMax=Math.max(...allPts.map(sOf))+30;
  const routeS=P.filter(q=>q[0]>=sMin&&q[0]<=sMax);
  const hs=allPts.map(p=>p[1]-y0).concat(routeS.map(q=>q[2]-y0));
  const hMin=Math.floor((Math.min(...hs)-4)/5)*5,hMax=Math.ceil((Math.max(...hs)+4)/5)*5;
  const ax0=70,ax1=528,ay0=96,ay1=328;
  const sx=echelle(sMin,sMax,ax0,ax1),sy=echelle(hMin,hMax,ay1,ay0);
  S.t(ax0,ay0-12,'Vue de côté','tb');S.t(ax1,ay0-12,'l’échelle verticale est dilatée','p e');
  axeY(S,sy,ax0,ax1,graduations(hMin,hMax,5),'hauteur par rapport au départ (m)',0);
  axeX(S,sx,ay1,ay0,graduations(sMin,sMax,6),'distance le long de la piste, s (m)',0);
  S.p(chemin(routeS.map(q=>[sx(q[0]),sy(q[2]-y0)])),th.route,4);
  S.t(sx(routeS[routeS.length-1][0])-4,sy(routeS[routeS.length-1][2]-y0)+16,'la route (le milieu)','p e');
  /* --- la vue de dessus --- */
  const us=allPts.map(U),vs=allPts.map(Vv);
  const uMin=Math.min(...us)-25,uMax=Math.max(...us)+25,vMin=Math.min(...vs,-R.demi)-25,vMax=Math.max(...vs,R.demi)+25;
  const bx0=596,bx1=W-20,by0=96,by1=328,kk=Math.min((bx1-bx0)/(uMax-uMin),(by1-by0)/(vMax-vMin));
  const ucx=(bx0+bx1)/2,vcy=(by0+by1)/2,umid=(uMin+uMax)/2,vmid=(vMin+vMax)/2;
  const DX=p=>ucx+(U(p)-umid)*kk,DY=p=>vcy-(Vv(p)-vmid)*kk;
  S.t(bx0,by0-12,'Vue de dessus','tb');S.t(bx1,by0-12,'même échelle sur les deux axes','p e');
  S.r(bx0,by0,bx1-bx0,by1-by0,th.panneau,'rx="4"');
  /* la route : le ruban entre ses deux bords */
  const ru=P.filter(q=>{const u=(q[1]-dep[0])*tx+(q[3]-dep[2])*tz;return u>=uMin-60&&u<=uMax+60;});
  if(ru.length>1){const bord=sg=>ru.map(q=>[q[1]+sg*q[4]*R.demi,q[2],q[3]+sg*q[6]*R.demi]);
    const g9=bord(1),d9=bord(-1).reverse();
    S.add(`<path d="${chemin(g9.concat(d9).map(p=>[DX(p),DY(p)]))}Z" fill="${th.route}" stroke="none" clip-path="url(#cadre-${th.nom})"/>`);}
  S.defs.push(`<clipPath id="cadre-${th.nom}"><rect x="${bx0}" y="${by0}" width="${bx1-bx0}" height="${by1-by0}"/></clipPath>`);
  {const bm=100,xb=bx0,yb=by1+14;S.l(xb,yb,xb+bm*kk,yb,th.texte,1.5);S.l(xb,yb-3,xb,yb+3,th.texte,1.5);S.l(xb+bm*kk,yb-3,xb+bm*kk,yb+3,th.texte,1.5);S.t(xb+bm*kk+5,yb+3.5,'100 m','p');}
  S.add(`<path d="M${bx1-34} ${by1+14}h30" stroke="${th.texte2}" stroke-width="1.2" marker-end="url(#fl-${th.nom})"/>`);S.t(bx1-40,by1+17.5,'sens de la route au départ','p e');
  S.defs.push(`<marker id="fl-${th.nom}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="${th.texte2}"/></marker>`);
  /* --- les rayons, puis le vrai vol par-dessus, dans les deux vues --- */
  const ordre=rayons.slice().sort((a,b)=>(a.m==='tenu')-(b.m==='tenu'));
  for(const r of ordre){const c=th.rayons[r.m]||th.texte2;if(r.pts.length<2)continue;
    const dash=r.m==='tenu'?' stroke-dasharray="5 3"':'';
    S.p(chemin(r.pts.map(p=>[sx(sOf(p)),sy(p[1]-y0)])),c,1.3,'opacity="0.95"'+dash);
    S.p(chemin(r.pts.map(p=>[DX(p),DY(p)])),c,1.3,'opacity="0.95" clip-path="url(#cadre-'+th.nom+')"'+dash);}
  for(const r of ordre){const c=th.rayons[r.m]||th.texte2,p=r.pts[r.pts.length-1];if(!p)continue;
    marqueIssue(S,sx(sOf(p)),sy(p[1]-y0),r.issue,c);marqueIssue(S,DX(p),DY(p),r.issue,c);}
  S.p(chemin(vrai.map(p=>[sx(sOf(p)),sy(p[1]-y0)])),th.fond,6);S.p(chemin(vrai.map(p=>[sx(sOf(p)),sy(p[1]-y0)])),th.vrai,3);
  S.p(chemin(vrai.map(p=>[DX(p),DY(p)])),th.fond,6);S.p(chemin(vrai.map(p=>[DX(p),DY(p)])),th.vrai,3);
  /* le depart (1re vue), les rebonds, la pose reelle */
  const pD=[dep[0],dep[1],dep[2]];
  for(const [X9,Y9] of [[sx(sOf(pD)),sy(0)],[DX(pD),DY(pD)]])S.c(X9,Y9,4,th.fond,`stroke="${th.vrai}" stroke-width="1.6"`);
  S.tc(sx(sOf(pD))-4,sy(0)+18,`1re vue, ${nf(tVue,2)} s`,'pt hf','',ax0+4,ax1);
  const ptA=t=>vrai[Math.max(0,Math.min(vrai.length-1,Math.round(t*60)-1-V.image0))];
  bumps.forEach((b,i)=>{const p=ptA(b[0]);S.c(sx(sOf(p)),sy(p[1]-y0),2.6,th.texte2);S.c(DX(p),DY(p),2.6,th.texte2);});
  if(bumps.length){const p=ptA(bumps[0][0]);S.t(sx(sOf(p))+4,sy(p[1]-y0)+18,`${bumps.length} rebond${bumps.length>1?'s':''} sur la tranche`,'p hf');}
  const pf=vrai[vrai.length-1];
  if(pose){S.c(sx(sOf(pf)),sy(pf[1]-y0),5,th.vrai,`stroke="${th.fond}" stroke-width="1.5"`);S.c(DX(pf),DY(pf),5,th.vrai,`stroke="${th.fond}" stroke-width="1.5"`);
    const lx=ax1-6,ly=ay0+22;S.l(sx(sOf(pf)),sy(pf[1]-y0)-6,lx-30,ly+20,th.texte2,1);
    S.t(lx,ly,`pose réelle : ${nf(pose[5],2)} s de vol`,'tb e');S.t(lx,ly+15,`s = ${nf(pose[2])} m, ${nf(pose[4])} km/h`,'pt e');}
  else if(mortV){S.x(sx(sOf(pf)),sy(pf[1]-y0),6,th.mort,2.4);S.t(sx(sOf(pf))+8,sy(pf[1]-y0)-8,`mort réelle : ${mortV[2]}`,'tb');}
  /* --- la legende : chaque rayon, son issue --- */
  const ly0=392;S.t(16,ly0-16,'Les 10 rayons de cette vue (yeux v2, ml/bot/yeux.js), tels que le cerveau les a lus','tb');
  rayons.forEach((r,i)=>{const col=i<5?0:1,row=i%5,x=16+col*472,y=ly0+6+row*20,c=th.rayons[r.m];
    S.p(`M${x} ${y}h24`,c,2,r.m==='tenu'?'stroke-dasharray="5 3"':'');marqueIssue(S,x+24,y,r.issue,c);
    S.t(x+36,y+4,NOMS_RAYONS[r.m]||r.m,'t');
    const det=r.issue==='pose'?`pose à ${nf(r.t,2)} s · s = ${nf(r.s)} m · choc ${nf(r.impact)} m/s`
      :r.issue==='choc'?`choc à ${nf(r.t,2)} s : ${r.cause}`:r.issue==='levre'?`lèvre à ${nf(r.t,2)} s`
      :r.issue==='libre'?`libre jusqu’à l’horizon, ${nf(r.t,0)} s`:`${ISSUES_FR[r.issue]||r.issue} à ${nf(r.t,2)} s`;
    S.t(x+180,y+4,det+(r.bumps?` · ${r.bumps} rebond${r.bumps>1?'s':''}`:''),'pt');});
  const ky=ly0+6+5*20+10;let kx=16;
  S.t(kx,ky+4,'au bout du rayon :','p');kx+=largeur('au bout du rayon :','p')+12;
  for(const [is,lab] of [['pose','pose sur la route'],['levre','lèvre (le bord)'],['choc','choc contre le décor'],['air','jauge d’air vide'],['fond','fond du monde'],['libre','rien avant l’horizon']]){
    marqueIssue(S,kx+4,ky,is,th.texte);S.t(kx+13,ky+4,lab,'p');kx+=13+largeur(lab,'p')+16;}
  {const t9='le vol réellement joué',x9=W-20-largeur(t9,'p');S.p(`M${x9-30} ${ly0-20}h22`,th.vrai,3);S.t(x9,ly0-16,t9,'p');}
  const nCh=rayons.filter(r=>r.issue==='choc').length,nPo=rayons.filter(r=>r.issue==='pose').length,vr=rayons.find(r=>r.m==='versRoute');
  S.para(16,ky+28,`À cette image, ${nCh} rayons sur 10 finissent contre une tour et ${nPo} se posent : les deux qui reviennent vers la route. Le pilote prend cette loi au décollage et la garde tant que le radar annonce une pose (ml/labo/cerveaux/c0003-pilote.js). Sa main au clavier donne des coups de volant tirés au hasard, que les yeux ne lisent pas : tous les rayons sont marqués « approx ».`+(pose&&vr&&vr.issue==='pose'?` Le vol réel se pose ${nf(pose[5]-(V.imageVue-V.image0)/60-vr.t,2)} s plus tard que le rayon « vers la route » et ${nf(pose[2]-vr.s)} m plus loin, après ${bumps.length} rebonds sur la tranche.`:''),'t2',W-32,15);
  S.source(`source : ${RADAR.replace('ml/ecurie/portfolio/','')} (radar-course.js : la course rejouée avec les yeux ouverts, empreinte ${D.bilan.empreinte} = celle du rejeu du labo${D.rejeu&&D.rejeu.memeCourse?', la même course':' — ÉCART'}) · graine ${D.graine} · ${D.jeu.version}, régime allégé · ${dateFr(D.date)}`);
  return S.fin();
}

/* ===================================================================================================================================== */
/* 3. LA MAIN : LES TOUCHES SUR 20 SECONDES, ET LES DUREES D'APPUI                                                                       */
/* ===================================================================================================================================== */
const MAIN_FENETRE=[20,40];            /* la frise : de 20 a 40 s de course, pour les deux */
const JOUEUR_PARTIE='2026-11-23T19:44:25.887Z'; /* une partie de Sacha au clavier (palier 14, 170 s) */
const PILOTE_COURSES=['c0003-g910407','c0003-g910518','c0003-g910629','c0003-g910666']; /* les 4 courses gardees du pilote (clore.js) */
function touchesRejeu(rj){
  /* « 12N5n… » : images depuis le changement d'avant, puis la touche (MAJUSCULE enfoncee, minuscule relachee) → intervalles [t0, t1] par touche */
  const o={G:[],D:[],N:[],H:[],B:[]},ouv={};let f=0;
  for(const m of rj.touches.matchAll(/(\d+)([A-Za-z])/g)){f+=+m[1];const k=m[2].toUpperCase(),en=m[2]===k;if(!o[k])continue;
    const t=(f+1)/60; /* l'image f est a (f+1)/60 s dans l'horloge de l'enregistreur (justesse.js, volsDe) */
    if(en&&ouv[k]==null)ouv[k]=t;else if(!en&&ouv[k]!=null){o[k].push([ouv[k],t]);ouv[k]=null;}}
  for(const k in ouv)if(ouv[k]!=null)o[k].push([ouv[k],1e9]);
  return o;}
function intervallesEch(c,test){const col={};c.cols.forEach((n,i)=>col[n]=i);const E=c.ech,o=[];let a=null;
  for(let i=0;i<E.length;i++){const e=E[i],t=e[col.t],nx=i+1<E.length?E[i+1][col.t]:t+.1,on=test(e,col);
    if(on&&a==null)a=t;if(!on&&a!=null){o.push([a,t]);a=null;}if(on&&nx-t>.25){o.push([a,t+.1]);a=null;}}
  if(a!=null)o.push([a,E[E.length-1][col.t]]);return o;}
function figMain(th){
  const RJ=lire(`ml/labo/rejeux/${COURSE}.json`),TR=lire(`ml/labo/trajectoires/${COURSE}.json.gz`);
  const lus=fs.readdirSync(path.join(RACINE,'ml/bot/etalon')).filter(f=>/\.json$/.test(f)).sort().map(f=>({nom:f,j:lire('ml/bot/etalon/'+f)}));
  const parties=M.partiesJoueurs(lus).parties,ET=lire('ml/bot/results/etalon.json');
  const clavier=new Set(ET.parties.filter(p=>p.clavier).map(p=>p.debut));
  const PJc=parties.filter(c=>clavier.has(c.debut)),joueur=parties.find(c=>c.debut===JOUEUR_PARTIE);
  const pilotes=PILOTE_COURSES.map(c=>lire(`ml/labo/trajectoires/${c}.json.gz`));
  const W=960,H=600,S=new Svg(W,H,th,'Les touches du pilote et d’un joueur sur 20 secondes, et la distribution de leurs durées d’appui');
  S.entete('La main : le pilote contre un joueur au clavier',
    'À gauche, 20 s de course (de 20 à 40 s) ; à droite, la durée de chaque appui sur toutes les parties, comptée par la même fonction des deux côtés (mesures.js, mainDe)');
  const [f0,f1]=MAIN_FENETRE,x0=150,x1=560,sx=echelle(f0,f1,x0,x1);
  const bloc=(y,titre,sous,G,D,N,c,vols,trace)=>{
    S.t(16,y,titre,'tb',`fill="${c}"`);S.t(16,y+15,sous,'p');
    const lanes=[['← gauche',G],['→ droite',D],['nitro',N]],lh=15,gap=6,ly=y+28;
    for(const [a,b] of vols)if(b>f0&&a<f1)S.r(sx(Math.max(f0,a)),ly-3,sx(Math.min(f1,b))-sx(Math.max(f0,a)),3*(lh+gap)+58,th.vol,'opacity="0.14"');
    lanes.forEach(([nom,I],i)=>{const yy=ly+i*(lh+gap);S.t(x0-8,yy+lh-3.5,nom,'t2 e');S.r(x0,yy,x1-x0,lh,th.panneau);
      for(const [a,b] of I)if(b>f0&&a<f1)S.r(sx(Math.max(f0,a)),yy+1,Math.max(1,sx(Math.min(f1,b))-sx(Math.max(f0,a))),lh-2,c);});
    /* le volant lisse (steer de l'enregistreur), -1..1, > 0 = a gauche */
    const vy0=ly+3*(lh+gap)+4,vy1=vy0+46,sv=echelle(-1,1,vy1,vy0);
    S.t(x0-8,(vy0+vy1)/2+4,'volant','t2 e');S.r(x0,vy0,x1-x0,vy1-vy0,th.panneau);
    for(const v of [-1,-.3,0,.3,1]){S.l(x0,sv(v),x1,sv(v),v===0?th.axe:th.grille,1,Math.abs(v)===.3?'stroke-dasharray="2 3"':'');}
    S.t(x1+5,sv(1)+4,'gauche','p');S.t(x1+5,sv(-1)+2,'droite','p');S.t(x1+5,sv(.3)+3.5,'±0,3','p');
    const col={};trace.cols.forEach((n,i)=>col[n]=i);
    const pts=trace.ech.filter(e=>e[col.t]>=f0-.1&&e[col.t]<=f1+.1).map(e=>[sx(Math.max(f0,Math.min(f1,e[col.t]))),sv(e[col.steer])]);
    S.p(chemin(pts),c,1.4);
    return vy1;};
  const volsDe=c=>intervallesEch(c,(e,col)=>e[col.m]>=1);
  const K=touchesRejeu(RJ);
  const yb1=bloc(94,`le pilote (${RJ.cerveau.id})`,`graine ${RJ.graine} · les touches du rejeu, à l’image près (1/60 s)`,K.G,K.D,K.N,th.pilote,volsDe(TR),TR);
  const jG=intervallesEch(joueur,(e,c)=>e[c.steer]>.3),jD=intervallesEch(joueur,(e,c)=>e[c.steer]<-.3),jN=intervallesEch(joueur,(e,c)=>!!e[c.nit]);
  const pj=ET.parties.find(p=>p.debut===JOUEUR_PARTIE);
  const yb2=bloc(yb1+46,'Sacha, au clavier',`partie du ${dateFr(JOUEUR_PARTIE)} (palier ${pj.palier}) · ses touches ne sont pas enregistrées : le volant au-delà de ±0,3 et la flamme de nitro, 10 fois par seconde`,jG,jD,jN,th.joueurs,volsDe(joueur),joueur);
  axeX(S,echelle(0,f1-f0,x0,x1),yb2+6,null,graduations(0,f1-f0,10),`secondes (à partir de ${f0} s de course) · bandes : en vol`,0);
  /* --- les histogrammes --- */
  const mP=pilotes.map(M.mainDe),mJ=PJc.map(M.mainDe);
  const tous=(L,k)=>[].concat(...L.map(m=>m[k]));
  /* un histogramme en marches : les cases [debut + k·pas, debut + (k+1)·pas), la derniere reunit tout ce qui depasse max */
  const hist=(y0,titre,kle,pas,debut,max,ticks,unite)=>{
    const hx0=660,hx1=W-24,hy0=y0+18,hy1=y0+150,a=tous(mP,kle),b=tous(mJ,kle),nb=Math.round((max-debut)/pas);
    const bins=v=>{const h=new Array(nb+1).fill(0);for(const x of v)h[Math.max(0,Math.min(nb,Math.floor((x-debut)/pas+1e-9)))]++;return h.map(n=>100*n/Math.max(1,v.length));};
    const hA=bins(a),hB=bins(b),ymax=Math.ceil(Math.max(...hA,...hB)/5)*5;
    const sxh=echelle(debut,max+pas,hx0,hx1),syh=echelle(0,ymax,hy1,hy0);
    S.t(hx0-40,y0,titre,'tb');
    axeY(S,syh,hx0,hx1,graduations(0,ymax,4),'',0,v=>nf(v)+' %');
    axeX(S,sxh,hy1,null,ticks,unite,decimales(ticks[1]-ticks[0]));
    S.t(sxh(max+pas/2),hy1+16,'≥ '+nf(max,(String(max).split('.')[1]||'').length),'p m');
    const marche=(h,c,f)=>{let d=`M${r1(sxh(debut))} ${r1(syh(0))}`;h.forEach((v,i)=>{d+=`L${r1(sxh(debut+i*pas))} ${r1(syh(v))}L${r1(sxh(debut+(i+1)*pas))} ${r1(syh(v))}`;});d+=`L${r1(sxh(debut+(nb+1)*pas))} ${r1(syh(0))}`;
      S.add(`<path d="${d}Z" fill="${c}" fill-opacity="${f}" stroke="${c}" stroke-width="1.4" stroke-linejoin="round"/>`);};
    marche(hB,th.joueurs,.18);marche(hA,th.pilote,.18);
    const ma=med(a),mb=med(b);
    S.l(sxh(ma),hy0,sxh(ma),hy1,th.pilote,1.4,'stroke-dasharray="4 3"');S.l(sxh(mb),hy0,sxh(mb),hy1,th.joueurs,1.4,'stroke-dasharray="4 3"');
    S.t(hx1,hy0+6,`médiane ${nf(ma,2)} s · pilote, ${nf(a.length)} appuis`,'pt e',`fill="${th.pilote}"`);
    S.t(hx1,hy0+20,`médiane ${nf(mb,2)} s · Sacha, ${nf(b.length)} appuis`,'pt e',`fill="${th.joueurs}"`);
    return {a,b,ma,mb};};
  /* les coups : des sommes d'ecarts d'echantillons (~0,105 s chez l'un, ~0,11 s chez l'autre) — des cases de 0,1 s centrees sur 0,1, 0,2… */
  const h1=hist(94,'Durée d’un coup de volant, au sol','coups',.1,.05,1.25,[.2,.4,.6,.8,1],'secondes');
  const h2=hist(318,'Durée d’une tenue de nitro, au sol','tenues_sol',.25,0,6,[0,1,2,3,4,5],'secondes');
  const ly=H-62;S.r(660,ly-8,12,10,th.pilote,'fill-opacity="0.5"');S.t(678,ly+1,`pilote : ${PILOTE_COURSES.length} courses gardées, ${nf(mP.reduce((s,m)=>s+m.duree_s,0)/60,1)} min`,'p');
  S.r(660,ly+8,12,10,th.joueurs,'fill-opacity="0.5"');S.t(678,ly+17,`Sacha au clavier : ${PJc.length} parties, ${nf(mJ.reduce((s,m)=>s+m.duree_s,0)/60,1)} min`,'p');
  S.t(16,ly+1,`Les coups de volant ont la même forme (médiane ${nf(h1.ma,2)} s contre ${nf(h1.mb,2)} s) : la main a été réglée sur eux.`,'t2');
  S.t(16,ly+17,`La nitro, non : le pilote la tient ${nf(h2.ma,2)} s, Sacha ${nf(h2.mb,2)} s (la nitro tenue : ${nf(100*mP.reduce((s,m)=>s+m.nitro_s,0)/mP.reduce((s,m)=>s+m.duree_s,0))} % contre ${nf(100*mJ.reduce((s,m)=>s+m.nitro_s,0)/mJ.reduce((s,m)=>s+m.duree_s,0))} %).`,'t2');
  S.source(`source : ml/labo/rejeux/${COURSE}.json (touches) · ml/labo/trajectoires/c0003-*.json.gz (4 courses) · ml/bot/etalon/*.json (parties au clavier, ml/bot/results/etalon.json) · graine ${RJ.graine} · ${RJ.jeu.version}, régime allégé · courses du ${dateFr(lignes('ml/labo/journal/cerveaux.jsonl').find(x=>x.id===RJ.cerveau.id).date)}, parties des 23 et 24/11/2026`);
  return S.fin();
}

/* ===================================================================================================================================== */
/* 4. LES PALIERS                                                                                                                        */
/* ===================================================================================================================================== */
function figPaliers(th){
  const REF=lire('ml/bot/results/note-reference-allege.json'),ET=lire('ml/bot/results/etalon.json');
  const J=lignes('ml/labo/journal/cerveaux.jsonl').find(x=>x.id==='c0003');
  const groupes=[
    {nom:'les joueurs',sous:[`${ET.parties.length} parties de l’étalon :`,'Sacha au clavier, Léo au doigt'],c:th.joueurs,pts:ET.parties.map(p=>({v:p.palier,creux:!p.clavier}))},
    {nom:'le pilote',sous:[`c0003 · ${J.courses.length} courses,`,`${J.tmax} s au plus chacune`],c:th.pilote,pts:J.courses.map(c=>({v:c.palier}))},
    {nom:'la référence',sous:['le bot écrit à la main ·',`${REF.courses.length} courses, mêmes graines`],c:th.reference,pts:REF.courses.map(c=>({v:c.palier}))}];
  const W=960,H=402,S=new Svg(W,H,th,'Les paliers atteints, course par course : les joueurs, le pilote et le bot de référence');
  S.entete('Les paliers atteints, un point par course','Le palier = le meilleur moteur gagné pendant la course (les pièces ramassées : 1 = MOTEUR ROUILLÉ, 30 = TROU NOIR), l’échelle du niveau de l’écurie');
  const sx=echelle(.5,30.5,230,W-24),y0=78,pas=80;
  for(let v=1;v<=30;v++){const x=sx(v);S.l(x,y0,x,y0+3*pas,v%5===0?th.grille:th.panneau,1);}
  groupes.forEach((G,i)=>{const yc=y0+pas/2+i*pas;
    S.t(16,yc-8,G.nom,'tb',`fill="${G.c}"`);S.t(16,yc+7,G.sous[0],'p');S.t(16,yc+20,G.sous[1],'p');
    const V=G.pts.map(p=>p.v),cnt={};
    S.l(sx(Math.min(...V)),yc,sx(Math.max(...V)),yc,G.c,1,'opacity="0.5"');
    const tri=G.pts.slice().sort((a,b)=>a.v-b.v||(a.creux?1:0)-(b.creux?1:0));
    const tot={};for(const p of tri)tot[p.v]=(tot[p.v]||0)+1;
    for(const p of tri){const j=cnt[p.v]=(cnt[p.v]||0)+1,n=tot[p.v],y=yc+(j-1-(n-1)/2)*11;
      S.c(sx(p.v),y,4.6,p.creux?th.fond:G.c,`stroke="${G.c}" stroke-width="1.6"`);}
    const m=med(V);S.l(sx(m),yc-pas/2+8,sx(m),yc+pas/2-8,G.c,2);
    S.t(sx(m)+5,yc-pas/2+16,`médiane ${nf(m,m%1?1:0)}`,'tb',`fill="${G.c}"`);
    S.t(sx(Math.max(...V))+9,yc+4,`${Math.min(...V)} à ${Math.max(...V)}`,'p');});
  axeX(S,sx,y0+3*pas,null,[1,5,10,15,20,25,30],'palier atteint',0);
  S.c(W-214,y0-12,4.6,th.joueurs,`stroke="${th.joueurs}" stroke-width="1.6"`);S.t(W-204,y0-8.5,'au clavier','p');
  S.c(W-140,y0-12,4.6,th.fond,`stroke="${th.joueurs}" stroke-width="1.6"`);S.t(W-130,y0-8.5,'au doigt (téléphone)','p');
  S.source(`source : ml/bot/results/etalon.json (${dateFr(ET.date)}) · ml/labo/journal/cerveaux.jsonl, c0003 (${dateFr(J.date)}, graines ${J.courses[0].graine} à ${J.courses[J.courses.length-1].graine}) · ml/bot/results/note-reference-allege.json (${dateFr(REF.date)}) · les bots : régime allégé, 900 s au plus`);
  return S.fin();
}

/* ===================================================================================================================================== */
/* 5. LA JUSTESSE DU RADAR                                                                                                               */
/* ===================================================================================================================================== */
function figJustesse(th){
  const F=[{f:'ml/bot/results/justesse-allege.json',nom:'main de machine',c:th.machine},{f:'ml/bot/results/justesse-allege-main-clavier.json',nom:'main au clavier (profil)',c:th.clavier}];
  /* les poses prevues ET arrivees : en vol (a : 1re vue, a2 : 1re vue ou la main tient la facon, b : derniere vue a 1 s ou plus), et depuis le sol (s : la sortie prevue avant le decollage) */
  for(const x of F){x.J=lire(x.f);x.vol=[];x.sol=[];
    for(const v of x.J.vols){const vus=new Set();
      for(const k of ['a','a2','b']){const j=v[k];if(!j||j.ds==null)continue;const cle=j.avant+'|'+j.ds;if(vus.has(cle))continue;vus.add(cle);x.vol.push({t:j.avant,ds:j.ds,v:v});}
      if(v.s&&v.s.ds!=null&&v.sol)x.sol.push({t:r2(v.sol.reel+v.s.avant),ds:v.s.ds,v:v});}}
  const W=960,H=440,S=new Svg(W,H,th,'L’écart entre la pose prévue par le radar et la pose réelle, en fonction du temps qui restait avant la pose');
  S.entete('La justesse du radar : où il prévoit la pose, où elle arrive',
    'Chaque point : une prévision du radar (yeux v2) qui annonçait une pose, contre la pose du vrai jeu. Δs = s prévu − s réel, le long de la piste ; échelle logarithmique des deux côtés de 0');
  const ax0=78,ax1=600,ay0=66,ay1=360,f=v=>Math.sign(v)*Math.log10(1+Math.abs(v));
  const all=F.flatMap(x=>x.vol.concat(x.sol)),tmax=Math.ceil(Math.max(...all.map(p=>p.t))),lim=Math.max(...all.map(p=>Math.abs(p.ds)));
  const L=Math.ceil(Math.log10(lim+1)*2)/2;
  const sx=echelle(0,tmax,ax0,ax1),syl=echelle(-L,L,ay1,ay0),sy=v=>syl(f(v));sy.r=syl.r;
  const tk=[-100,-10,-1,0,1,10,100].filter(v=>Math.abs(f(v))<=L);
  for(const v of tk){S.l(ax0,sy(v),ax1,sy(v),v===0?th.axe:th.grille,1);S.t(ax0-7,sy(v)+3.5,(v>0?'+':'')+nf(v)+' m','p e');}
  S.l(ax0,ay0,ax0,ay1,th.axe,1);
  S.add(`<text x="0" y="0" class="t2 m" transform="translate(${ax0-54} ${(ay0+ay1)/2}) rotate(-90)">Δs, prévu − réel (m)</text>`);
  axeX(S,sx,ay1,ay0,graduations(0,tmax,8),'temps entre la prévision et la pose réelle (s)',0);
  S.r(ax0+1,sy(1),ax1-ax0-1,sy(-1)-sy(1),th.vol,'opacity="0.10"');S.t(ax1-6,sy(1)-4,'à 1 m près','p e');
  for(const x of F){for(const p of x.vol)S.c(sx(p.t),sy(p.ds),3.4,x.c,'fill-opacity="0.75"');
    for(const p of x.sol){const X=sx(p.t),Y=sy(p.ds);S.add(`<path d="M${r1(X)} ${r1(Y-4.2)}l4 7h-8z" fill="none" stroke="${x.c}" stroke-width="1.3"/>`);}}
  /* le biais des sorties prevues depuis le sol */
  const solT=F.flatMap(x=>x.sol),mS=med(solT.map(p=>p.ds));
  {const cx9=med(solT.map(p=>p.t)),X=sx(cx9),Y=sy(mS),tx9=sx(Math.min(tmax-.2,cx9+.9)),ty9=sy(-120);
    S.l(X+8,Y+8,tx9-4,ty9-12,th.texte2,1);
    S.t(tx9,ty9-2,`depuis le sol, la pose arrive ~${nf(-mS)} m plus loin que prévu`,'pt');
    S.t(tx9,ty9+12,'(médiane des △ : sorties « franches » et sauts)','p');}
  /* le tableau */
  const tx=636;let ty=80;S.t(tx,ty,'|Δs| : médiane · 90e centile','tb');ty+=8;S.l(tx,ty,W-20,ty,th.grille,1);ty+=18;
  for(const x of F){const a=x.vol.map(p=>Math.abs(p.ds)),b=x.sol.map(p=>Math.abs(p.ds));
    S.c(tx+4,ty-4,3.6,x.c);S.t(tx+14,ty,x.nom,'tb');S.t(W-20,ty,`${x.J.vols.length} vols, ${x.J.cartes.length} maps`,'p e');ty+=17;
    S.t(tx+14,ty,'● en vol','pt');S.t(tx+170,ty,`${nf(med(a),1)} m · ${nf(quant(a,.9),1)} m`,'pt e');S.t(W-20,ty,`${a.length} prévisions`,'p e');ty+=15;
    S.t(tx+14,ty,'△ depuis le sol','pt');S.t(tx+170,ty,`${nf(med(b),1)} m · ${nf(quant(b,.9),1)} m`,'pt e');S.t(W-20,ty,`${b.length} prévisions`,'p e');ty+=24;}
  const txt='● en vol : à la 1re vue du vol, à la 1re vue où la main tient sa façon de voler, et à la dernière vue située 1 s ou plus avant la pose. △ depuis le sol : la sortie que le voltigeur demande, prévue avant le décollage (son temps compte la route jusqu’au bord). La main de machine tient ses touches : le radar la rejoue au décimètre. La main au clavier donne des coups de volant tirés au hasard, que les yeux ne connaissent pas : l’écart grandit avec le temps qui reste.';
  S.para(tx,ty,txt,'p',W-20-tx,14);
  S.source(`source : ml/bot/results/justesse-allege.json (${dateFr(F[0].J.date)}) et justesse-allege-main-clavier.json (${dateFr(F[1].J.date)}) · ml/bot/justesse.js, cerveau voltigeur · graines ${F[0].J.graines.depart} + ${F[0].J.graines.pas} × i, ${F[0].J.graines.n} par map · régime allégé`);
  return S.fin();
}

/* ===================================================================================================================================== */
/* LE CONTROLE : un SVG bien forme (sans dependance : un petit lecteur XML)                                                              */
/* ===================================================================================================================================== */
function verifierSvg(txt){
  const err=[];if(/NaN|undefined|Infinity/.test(txt))err.push('NaN, undefined ou Infinity dans le texte');
  if(!/^<svg [^>]*viewBox="0 0 \d+ \d+"/.test(txt))err.push('pas de viewBox en tete');
  const pile=[];let i=0,n=0;
  while(i<txt.length){const a=txt.indexOf('<',i);
    const brut=txt.slice(i,a<0?txt.length:a);
    if(/&(?!(amp|lt|gt|quot|apos|#\d+|#x[0-9a-f]+);)/i.test(brut))err.push('& nu dans le texte pres de « '+brut.slice(0,40)+' »');
    if(a<0)break;const b=txt.indexOf('>',a);if(b<0){err.push('balise non fermee');break;}
    const tag=txt.slice(a+1,b);n++;
    if(tag.startsWith('/')){const nom=tag.slice(1).trim(),o=pile.pop();if(o!==nom)err.push(`</${nom}> ferme <${o}>`);}
    else if(!tag.startsWith('!')&&!tag.startsWith('?')){const m=tag.match(/^([A-Za-z][\w:-]*)/);if(!m){err.push('balise illisible : '+tag.slice(0,30));}
      else{const at=tag.slice(m[1].length).replace(/\/$/,'');
        const reste=at.replace(/\s+[\w:-]+="[^"<]*"/g,'').trim();if(reste)err.push(`attribut mal ecrit dans <${m[1]}> : ${reste.slice(0,40)}`);
        const noms=[...at.matchAll(/\s([\w:-]+)=/g)].map(q=>q[1]);if(new Set(noms).size!==noms.length)err.push(`attribut en double dans <${m[1]}>`);
        if(!tag.endsWith('/'))pile.push(m[1]);}}
    i=b+1;}
  if(pile.length)err.push('balises restees ouvertes : '+pile.join(', '));
  return {ok:!err.length,err:err.slice(0,8),balises:n};}

/* ===================================================================================================================================== */
const FIGURES=[['course-dessus',figCourse],['radar',figRadar],['main',figMain],['paliers',figPaliers],['justesse',figJustesse]];
if(require.main===module){
  if(A.includes('--rejouer')){console.log('la course du radar…');execFileSync(process.execPath,[path.join(ICI,'radar-course.js')],{stdio:'inherit'});}
  fs.mkdirSync(IMG,{recursive:true});
  let mauvais=0;
  for(const [nom,fn] of FIGURES){
    for(const th of Object.values(THEMES)){
      const f=path.join(IMG,`${nom}-${th.nom}.svg`);
      if(!A.includes('--verifier'))fs.writeFileSync(f,fn(th));
      const v=verifierSvg(fs.readFileSync(f,'utf8'));if(!v.ok)mauvais++;
      console.log(`${v.ok?'ok ':'⚠  '} images/${nom}-${th.nom}.svg · ${(fs.statSync(f).size/1024).toFixed(0)} Ko · ${v.balises} balises${v.ok?'':' · '+v.err.join(' ; ')}`);}}
  if(mauvais){console.log(mauvais+' fichier(s) mal forme(s)');process.exit(1);}
}
module.exports={verifierSvg,THEMES};
