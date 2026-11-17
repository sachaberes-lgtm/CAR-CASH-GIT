/* ===== LES ROUTES UNIQUES — LES PLANCHES (2026-11-17) : les images de mesure.cjs, en Node pur (aucun navigateur) =====
     node outils/banc-routes/uniques/planche.cjs fichier=passation/routes-uniques/avant/jade-defaut-mesure.json [paliers=0,10] [out=<dossier du fichier>] [parties=1-12] [km=0]
   Pour chaque palier, deux PNG :
     <carte>-<nom>-p<palier>-faisceau.png : (a) toutes les routes superposées vues de dessus (repère du départ : le cap initial vers le HAUT, x vers la droite, même échelle
       en x et en z, cercles à 1, 3 et 5 km), (b) leurs profils (abscisse → altitude) ; traits semi-transparents, une couleur par 1er module (légende : le 1er module et sa part).
     <carte>-<nom>-p<palier>-12parties.png : (c) 12 parties côte à côte (graines `parties`) : le tracé de dessus (même échelle pour les 12) et le profil, chaque module de sa couleur,
       et la liste des modules dans l'ordre, avec leur abscisse de début (m).
   km=N : ne dessiner que les N premiers km (0 = toute la route). */
const fs=require('fs'),path=require('path'),P=require('../png.cjs');
const arg=(k,d)=>{const a=process.argv.find(x=>x.startsWith(k+'='));return a?a.slice(k.length+1):d;};
const RAC=path.resolve(__dirname,'../../..'),fichier=path.resolve(RAC,arg('fichier','passation/routes-uniques/avant/jade-defaut-mesure.json'));
const D=JSON.parse(fs.readFileSync(fichier,'utf8')),out=path.resolve(RAC,arg('out',path.dirname(fichier))),PAL=arg('paliers',Object.keys(D.parPalier).join(',')).split(',');
const PG=arg('parties','1-12').split('-').map(Number),KMAX=+arg('km','0')*1000,PAS=D.pasTrace||20;
fs.mkdirSync(out,{recursive:true});

/* ---------- le texte : une police 5×7 (colonnes, bit 0 en haut), majuscules sans accents ---------- */
const F={'0':[62,81,73,69,62],'1':[0,66,127,64,0],'2':[66,97,81,73,70],'3':[33,65,69,75,49],'4':[24,20,18,127,16],'5':[39,69,69,69,57],'6':[60,74,73,73,48],'7':[1,113,9,5,3],'8':[54,73,73,73,54],'9':[6,73,73,41,30],
  A:[126,17,17,17,126],B:[127,73,73,73,54],C:[62,65,65,65,34],D:[127,65,65,34,28],E:[127,73,73,73,65],F:[127,9,9,9,1],G:[62,65,73,73,122],H:[127,8,8,8,127],I:[0,65,127,65,0],J:[32,64,65,63,1],K:[127,8,20,34,65],L:[127,64,64,64,64],
  M:[127,2,12,2,127],N:[127,4,8,16,127],O:[62,65,65,65,62],P:[127,9,9,9,6],Q:[62,65,81,33,94],R:[127,9,25,41,70],S:[70,73,73,73,49],T:[1,1,127,1,1],U:[63,64,64,64,63],V:[31,32,64,32,31],W:[63,64,56,64,63],X:[99,20,8,20,99],Y:[7,8,112,8,7],Z:[97,81,73,69,67],
  '-':[8,8,8,8,8],'>':[0,65,34,20,8],'<':[8,20,34,65,0],'.':[0,96,96,0,0],':':[0,54,54,0,0],'/':[32,16,8,4,2],'%':[35,19,8,100,98],'(':[0,28,34,65,0],')':[0,65,34,28,0],'+':[8,8,62,8,8],'*':[20,8,62,8,20],'=':[20,20,20,20,20],',':[0,80,48,0,0],'#':[20,127,20,127,20],"'":[0,5,3,0,0],'@':[50,73,121,65,62],'?':[2,1,81,9,6],'!':[0,0,95,0,0],'[':[0,127,65,65,0],']':[0,65,65,127,0],'_':[64,64,64,64,64],' ':[0,0,0,0,0]};
function texte(im,x,y,s,c,k){k=k||2;s=String(s).normalize('NFD').replace(/[̀-ͯ]/g,'').toUpperCase().replace(/[«»]/g,'"').replace(/±/g,'+-').replace(/°/g,'').replace(/·/g,'-');let cx=x;
  for(const ch of s){const g=F[ch]||F['?'];if(ch==='"'){for(const dx of [1,3])for(let j=0;j<2*k;j++)for(let i=0;i<k;i++)P.px(im,cx+dx*k+i,y+j,c);cx+=6*k;continue;}
    for(let col=0;col<5;col++)for(let row=0;row<7;row++)if(g[col]>>row&1)for(let j=0;j<k;j++)for(let i=0;i<k;i++)P.px(im,cx+col*k+i,y+row*k+j,c);cx+=6*k;}return cx;}
/* un trait fin semi-transparent (un pixel par pas : la transparence ne s'additionne pas sur le trait lui-même) */
function trait(im,x0,y0,x1,y1,c,a,ep){const n=Math.max(1,Math.ceil(Math.hypot(x1-x0,y1-y0)));let lx=null,ly=null;for(let k=0;k<=n;k++){const x=Math.round(x0+(x1-x0)*k/n),y=Math.round(y0+(y1-y0)*k/n);if(x===lx&&y===ly)continue;lx=x;ly=y;
  if(ep>1){for(let j=0;j<ep;j++)for(let i=0;i<ep;i++)P.px(im,x+i-(ep>>1),y+j-(ep>>1),c,a);}else P.px(im,x,y,c,a);}}
function rect(im,x,y,w,h,c,a){for(let j=0;j<h;j++)for(let i=0;i<w;i++)P.px(im,x+i,y+j,c,a);}
function cercle(im,cx,cy,r,c,a,bx){const n=Math.max(16,Math.ceil(2*Math.PI*r));for(let k=0;k<n;k++){const t=2*Math.PI*k/n,x=cx+r*Math.sin(t),y=cy+r*Math.cos(t);if(bx&&(x<bx[0]||y<bx[1]||x>=bx[0]+bx[2]||y>=bx[1]+bx[3]))continue;P.px(im,x,y,c,a);}} /* bx : [x,y,l,h] le cadre où le dessiner */

/* ---------- les couleurs : une par module, stable (l'ordre du catalogue) ---------- */
const PALETTE=[[230,80,70],[70,160,240],[250,190,40],[90,200,110],[200,110,230],[250,130,30],[40,200,200],[240,100,170],[160,200,60],[140,140,255],[210,170,120],[255,240,120],[120,240,200],[255,160,160],[170,120,80],[200,200,200],[100,120,200],[230,60,140],[60,140,90],[180,90,40],[150,220,250],[255,110,90]];
const CAT=(D.catalogue&&D.catalogue.liste)||[];const coul={};let ci=0;
const couleur=m=>{if(!coul[m]){const i=CAT.indexOf(m);coul[m]=PALETTE[(i>=0?i:CAT.length+(ci++))%PALETTE.length];}return coul[m];};
const FOND=[14,16,22],GRIS=[90,95,110],BLANC=[235,235,240];

function trace(r){const t=r.trace;const n=KMAX?Math.min(t.length,Math.floor(KMAX/PAS)+1):t.length;return t.slice(0,n);}
function bornes(routes){let xm=0,zm=0,zn=0,ym=0,yn=0,sm=0;for(const r of routes){const t=trace(r);for(const p of t){xm=Math.max(xm,Math.abs(p[0]));zm=Math.max(zm,p[2]);zn=Math.min(zn,p[2]);ym=Math.max(ym,p[1]);yn=Math.min(yn,p[1]);}sm=Math.max(sm,(t.length-1)*PAS);}return {xm,zm,zn,ym,yn,sm};}
const titre=p=>(D.carte+' · '+D.nom+(D.search?' ('+D.search+')':'')+' · palier '+p+' · '+D.etiquette+' · commit '+D.commit);

for(const p of PAL){const bloc=D.parPalier[p];if(!bloc){console.log('palier '+p+' absent');continue;}const routes=bloc.routes,st=bloc.stats;
  /* ======== (a) + (b) LE FAISCEAU ======== */
  {const W=1800,H=1560,im=P.Img(W,H,FOND),b=bornes(routes);
    texte(im,20,16,titre(p)+' · '+routes.length+' routes',BLANC,3);
    /* le plan : un carré de 1000 px, l'origine au milieu en x, la même échelle en x et en z */
    const PX=20,PY=60,PS=1000,ext=Math.max(2*b.xm,b.zm-b.zn)*1.04,sc=PS/ext,ox=PX+PS/2,oz=PY+PS-(-b.zn+.02*ext)*sc;
    rect(im,PX,PY,PS,PS,[22,25,33]);
    for(const km of [1,3,5,10])if(km*1000*sc<PS*1.2){cercle(im,ox,oz,km*1000*sc,GRIS,.6,[PX,PY,PS,PS]);const tx=ox+km*1000*sc*.71+4,ty=oz-km*1000*sc*.71-16;if(tx<PX+PS-60&&ty>PY)texte(im,tx,ty,km+' KM',GRIS,2);}
    trait(im,ox,PY,ox,PY+PS,GRIS,.25,1);
    const a=Math.min(.35,Math.max(.06,10/routes.length));
    for(const r of routes){const t=trace(r),c=couleur(r.suite[0]||'—');for(let i=1;i<t.length;i++)trait(im,ox+t[i-1][0]*sc,oz-t[i-1][2]*sc,ox+t[i][0]*sc,oz-t[i][2]*sc,c,a,1);}
    P.disc(im,ox,oz,5,BLANC);texte(im,ox+10,oz+8,'DEPART (CAP INITIAL VERS LE HAUT)',BLANC,2);
    texte(im,PX,PY+PS+8,'VUE DE DESSUS, MEME ECHELLE EN X ET Z : '+Math.round(ext)+' M DE COTE',GRIS,2);
    /* la légende : le 1er module, sa part */
    let ly=PY;texte(im,1060,ly,'COULEUR = 1ER MODULE',BLANC,3);ly+=40;
    for(const [m,nn,f] of st.premier){rect(im,1060,ly,28,16,couleur(m));texte(im,1100,ly,m+'  '+nn+' ('+Math.round(f*100)+' %)',BLANC,2);ly+=26;if(ly>PY+460)break;}
    ly+=14;texte(im,1060,ly,'CHIFFRES',BLANC,3);ly+=36;
    const lig=[];const o3=st.points[3000]||st.points[2000]||{},o1=st.points[1000]||{};
    lig.push('LONGUEUR MOY '+st.L.moy+' M ['+st.L.min+'-'+st.L.max+']');
    if(o1.cap)lig.push('A 1 KM : CAP +-'+o1.cap.et+' , FAISCEAU '+o1.faisceau+' M');
    if(o3.cap)lig.push('A '+(st.points[3000]?3:2)+' KM : CAP +-'+o3.cap.et+' , FAISCEAU '+o3.faisceau+' M');
    lig.push('PAIRES 1,5 KM : RMS MED '+st.paires.rms1500.med+' M (MIROIR '+st.paires.rms1500miroir.med+')');
    for(const t of Object.keys(st.formes))lig.push('FORMES < '+t+' M : '+st.formes[t].brut.formes+' (MIROIR '+st.formes[t].miroir.formes+')');
    lig.push('TETES DE 3 DISTINCTES : '+st.tete3Distinctes+' / '+routes.length);
    lig.push('SUITES DISTINCTES : '+st.suitesDistinctes+' / '+routes.length);
    lig.push('CATALOGUE VU : '+st.catalogue.vusDuCatalogue+' / '+st.catalogue.taille);
    for(const l of lig){texte(im,1060,ly,l,BLANC,2);ly+=24;}
    ly+=12;texte(im,1060,ly,'3 PREMIERS MODULES',BLANC,3);ly+=34;
    for(const [k,nn,f] of st.tete3.slice(0,8)){texte(im,1060,ly,Math.round(f*100)+' % '+k,BLANC,2);ly+=22;}
    /* le profil : abscisse → altitude */
    const QX=80,QY=1110,QW=1700,QH=400,sx=QW/Math.max(1,b.sm),sy=QH/Math.max(1,b.ym-b.yn);
    rect(im,QX,QY,QW,QH,[22,25,33]);
    for(let s=0;s<=b.sm;s+=1000){trait(im,QX+s*sx,QY,QX+s*sx,QY+QH,GRIS,.25,1);texte(im,QX+s*sx+3,QY+QH+6,(s/1000)+'',GRIS,2);}
    for(let y=Math.ceil(b.yn/500)*500;y<=b.ym;y+=500){trait(im,QX,QY+(b.ym-y)*sy,QX+QW,QY+(b.ym-y)*sy,GRIS,.25,1);texte(im,QX-70,QY+(b.ym-y)*sy-6,y+'',GRIS,2);}
    for(const r of routes){const t=trace(r),c=couleur(r.suite[0]||'—');for(let i=1;i<t.length;i++)trait(im,QX+(i-1)*PAS*sx,QY+(b.ym-t[i-1][1])*sy,QX+i*PAS*sx,QY+(b.ym-t[i][1])*sy,c,a,1);}
    texte(im,QX,QY-26,'PROFIL : ABSCISSE (KM) -> ALTITUDE (M) DEPUIS LE DEPART',GRIS,2);
    const f=path.join(out,D.carte+'-'+D.nom+'-p'+p+'-faisceau.png');fs.writeFileSync(f,P.png(im));console.log('écrit',path.relative(RAC,f));}
  /* ======== (c) LES 12 PARTIES ======== */
  {const sel=routes.filter(r=>r.g>=PG[0]&&r.g<=PG[1]).slice(0,12),COLS=4,CW=440,CH=640,W=COLS*CW+20,H=Math.ceil(sel.length/COLS)*CH+60,im=P.Img(W,H,FOND),b=bornes(sel);
    texte(im,20,16,titre(p)+' · graines '+PG[0]+'-'+PG[1],BLANC,3);
    const PS=400,ext=Math.max(2*b.xm,b.zm-b.zn)*1.04,sc=PS/ext;
    sel.forEach((r,k)=>{const X0=10+(k%COLS)*CW,Y0=56+Math.floor(k/COLS)*CH,ox=X0+10+PS/2,oz=Y0+30+PS-(-b.zn+.02*ext)*sc,t=trace(r);
      rect(im,X0+10,Y0+30,PS,PS,[22,25,33]);texte(im,X0+10,Y0+8,'GRAINE '+r.g+' · '+(r.L/1000).toFixed(1)+' KM'+(r.fiche&&r.fiche.humeur?' · '+r.fiche.humeur:'')+(r.fiche&&r.fiche.voyage?' · '+r.fiche.voyage:'')+(r.fiche&&r.fiche.itin?' · '+r.fiche.itin:''),BLANC,2);
      for(const km of [1,3])cercle(im,ox,oz,km*1000*sc,GRIS,.5,[X0+10,Y0+30,PS,PS]);
      /* la couleur du module où l'on est (gris entre deux modules) */
      const modA=s=>{let m=null;for(const q of r.mods)if(s>=q.s&&s<=q.s1)m=q.mod;return m;};
      for(let i=1;i<t.length;i++){const m=modA(i*PAS);trait(im,ox+t[i-1][0]*sc,oz-t[i-1][2]*sc,ox+t[i][0]*sc,oz-t[i][2]*sc,m?couleur(m):[150,150,160],1,m?2:1);}
      P.disc(im,ox,oz,4,BLANC);
      /* le profil de la partie (même échelle verticale pour les 12) */
      const QX=X0+10,QY=Y0+440,QW=PS,QH=70,sx=QW/Math.max(1,b.sm),sy=QH/Math.max(1,b.ym-b.yn);rect(im,QX,QY,QW,QH,[22,25,33]);
      for(let i=1;i<t.length;i++){const m=modA(i*PAS);trait(im,QX+(i-1)*PAS*sx,QY+(b.ym-t[i-1][1])*sy,QX+i*PAS*sx,QY+(b.ym-t[i][1])*sy,m?couleur(m):[150,150,160],1,m?2:1);}
      let ly=QY+QH+8;const vus=[];for(const q of r.mods){const d=vus.length&&vus[vus.length-1].mod===q.mod;if(!d)vus.push(q);}
      for(const q of vus.slice(0,8)){rect(im,QX,ly+2,14,10,couleur(q.mod));texte(im,QX+20,ly,(q.s+'').padStart(5)+' M  '+q.mod+(q.climax?' *':''),BLANC,2);ly+=16;}});
    texte(im,20,H-22,'* = CLIMAX · DESSUS : MEME ECHELLE POUR LES 12, CERCLES A 1 ET 3 KM, CAP INITIAL VERS LE HAUT · DESSOUS : PROFIL (ALTITUDE)',GRIS,2);
    const f=path.join(out,D.carte+'-'+D.nom+'-p'+p+'-12parties.png');fs.writeFileSync(f,P.png(im));console.log('écrit',path.relative(RAC,f));}}
