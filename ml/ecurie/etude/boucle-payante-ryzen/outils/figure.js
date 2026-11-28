#!/usr/bin/env node
/* ===== L'IMAGE « LA LIGNEE DE LA BOUCLE PAYANTE » (2026-11-28, Claude : « la courbe de la note et du palier, entrainement et validation, sacres marques ») =====
   Node pur, sans dependance. Deux commandes, dans l'ordre :
     node ml/ecurie/etude/boucle-payante-ryzen/outils/extraire.js
     node ml/ecurie/etude/boucle-payante-ryzen/outils/figure.js
   lit   ml/ecurie/etude/boucle-payante-ryzen/donnees/lignee.json (ecrit par extraire.js, depuis ml/labo/journal)
   ecrit ml/ecurie/portfolio/images/boucle-payante-lignee-clair.svg et boucle-payante-lignee-sombre.svg
   En haut la note « mixte » du champion (palier median moins 6 fois l'ecart aux joueurs), en bas son palier moyen ; en bleu sur les 20 courses
   d'entrainement (graines 910000 et suivantes), en ambre sur les 20 courses de validation (950000 et suivantes). Les points gris : les autres
   variantes notees sur les 20 courses d'entrainement. Conventions (palette, police, controle des chevauchements) reprises de
   ml/ecurie/portfolio/figures-journal/depenses.js ; les deux couleurs du theme sombre sont un cran plus sombres (bande de clarte du controle des couleurs). */
const fs=require('fs'),path=require('path');
const ICI=__dirname,ETUDE=path.join(ICI,'..'),RACINE=path.join(ETUDE,'..','..','..','..'),IMG=path.join(RACINE,'ml','ecurie','portfolio','images');
const D=JSON.parse(fs.readFileSync(path.join(ETUDE,'donnees','lignee.json'),'utf8'));
const P=D.pilotes,GENS=D.generations,NG=GENS.length;

/* le champion a la fin de chaque generation, et ses deux notes */
const chef=GENS.map(g=>g.sacre||g.champion_avant);
const SACRES=GENS.filter(g=>g.sacre).map(g=>({g:g.generation,id:g.sacre}));
const ECHECS=GENS.flatMap(g=>g.validees.filter(v=>!v.tient).map(v=>({g:g.generation,id:v.id})));
const promues=D.toutes_les_variantes.filter(v=>v.lot==='entrainement'&&v.parties===20&&v.generation>0);

/* ---------------- les nombres a la francaise ---------------- */
const NB=' ';
const nf=(x,k)=>{k=k==null?2:k;let [e,d]=Math.abs(x).toFixed(k).split('.');return (x<0?'−':'')+e+(d?','+d:'');};
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const r1=x=>Math.round(x*10)/10;

const THEMES={
  sombre:{nom:'sombre',fond:'#0f1115',texte:'#e8e6e1',texte2:'#9da2ab',grille:'#22262e',axe:'#5a606a',ent:'#5592e6',val:'#b98a28',gris:'#5a606a',hach:'#3a3f48'},
  clair:{nom:'clair',fond:'#ffffff',texte:'#1c1c21',texte2:'#5b5b66',grille:'#e9e6df',axe:'#8d8a83',ent:'#2f6db5',val:'#9a6a00',gris:'#b4b0a8',hach:'#d6d2ca'}};

const LARG={ti:8.4,t:6.6,tb:7.1,t2:6.2,p:5.8,pt:5.8,ptb:6.2,src:5.4};
const largeur=(txt,cls)=>String(txt).length*(LARG[String(cls||'t').split(' ')[0]]||6.4);
function coupe(txt,cls,w){const mots=String(txt).split(' '),R=[];let cur='';
  for(const m of mots){const e=cur?cur+' '+m:m;if(cur&&largeur(e,cls)>w){R.push(cur);cur=m;}else cur=e;}
  if(cur)R.push(cur);return R;}
const HAUT={ti:15,t:12,tb:12,t2:11.5,p:10.5,pt:10.5,ptb:10.5,src:10};

function dessine(th){
  const W=960,G=16,o=[],boites=[];
  const t=(x,y,txt,cls,fond)=>{const c=cls.split(' ')[0],w=largeur(txt,c),h=HAUT[c];
    const x0=/\be\b/.test(cls)?x-w:/\bm\b/.test(cls)?x-w/2:x;
    boites.push({x0,x1:x0+w,y0:y-h*.8,y1:y+h*.25,txt});
    if(fond)o.push(`<rect x="${r1(x0-2)}" y="${r1(y-h*.85)}" width="${r1(w+4)}" height="${r1(h*1.15)}" fill="${th.fond}" opacity=".9"/>`);
    o.push(`<text x="${r1(x)}" y="${r1(y)}" class="${cls}">${esc(txt)}</text>`);};
  const ligne=(x1,y1,x2,y2,c,w,plus)=>o.push(`<line x1="${r1(x1)}" y1="${r1(y1)}" x2="${r1(x2)}" y2="${r1(y2)}" stroke="${c}" stroke-width="${w||1}"${plus?' '+plus:''}/>`);

  let y=24;
  t(G,y,'Cinq champions sacrés, mais sur les courses de validation tout s’est joué en deux pas','ti');y+=18;
  for(const s of coupe(`La boucle payante du Ryzen, le 27/11/2026 de 14 h 52 à 0 h 12 : ${NG-2} générations complètes et une ${NG-1}e interrompue, ${GENS.reduce((s,g)=>s+g.ecrites,0)} variantes du pilote écrites par un modèle de langage (${nf(D.total_c2_euros)} €). Après c0064, les trois sacres suivants rejouent à l’identique les 20 courses de validation : ce qu’ils changent ne s’y voit pas.`,'t2',W-2*G)){t(G,y,s,'t2');y+=15;}

  /* la legende, une ligne */
  y+=10;let xl=G;
  const puce=(x,yy,forme,c)=>forme==='rond'?o.push(`<circle cx="${r1(x)}" cy="${r1(yy)}" r="4" fill="${c}" stroke="${th.fond}" stroke-width="2"/>`)
    :forme==='carre'?o.push(`<rect x="${r1(x-4)}" y="${r1(yy-4)}" width="8" height="8" rx="1.5" fill="${c}" stroke="${th.fond}" stroke-width="2"/>`)
    :o.push(`<circle cx="${r1(x)}" cy="${r1(yy)}" r="3" fill="${c}"/>`);
  const leg=(forme,c,txt,trait)=>{if(trait)ligne(xl,y-4,xl+22,y-4,c,2);puce(xl+11,y-4,forme,c);t(xl+28,y,txt,'pt');xl+=28+largeur(txt,'pt')+22;};
  leg('rond',th.ent,'le champion, sur les 20 courses d’entraînement',true);
  leg('carre',th.val,'le champion, sur les 20 courses de validation',true);
  leg('point',th.gris,'les autres variantes (entraînement)');

  /* les deux panneaux */
  const xG0=96,xG1=W-G-150,kx=(xG1-xG0)/(NG-1),X=g=>xG0+g*kx;
  const panneau=(y0,h,titre,sous,min,max,pas,cle,fmt)=>{
    t(G,y0,titre,'tb');t(G+largeur(titre,'tb')+10,y0,sous,'p');
    const yA=y0+16,yB=yA+h,ky=h/(max-min),Y=v=>yB-(v-min)*ky;
    /* generation 15, interrompue */
    o.push(`<rect x="${r1(X(NG-1)-kx/2)}" y="${r1(yA)}" width="${r1(kx/2+8)}" height="${r1(h)}" fill="url(#hach-${th.nom})"/>`);
    for(let v=min;v<=max+1e-9;v+=pas){ligne(xG0-8,Y(v),xG1+8,Y(v),v===min?th.axe:th.grille,1);t(xG0-14,Y(v)+4,fmt(v),'p e');}
    /* les sacres : un trait vertical discret */
    for(const s of SACRES)ligne(X(s.g),yA,X(s.g),yB,th.axe,1,'stroke-dasharray="2 3"');
    /* les variantes */
    for(const v of promues){const val=v[cle];if(val<min||val>max)continue;
      o.push(`<circle cx="${r1(X(v.generation)+5)}" cy="${r1(Y(val))}" r="3" fill="${th.gris}"><title>${esc(v.id+' (génération '+v.generation+') : '+fmt(val)+' à l’entraînement')}</title></circle>`);}
    /* les deux lignes du champion, en marches */
    const serie=(quoi,c,forme)=>{let d='';chef.forEach((id,g)=>{const v=P[id][quoi][cle];d+=(g===0?'M':'H'+r1(X(g))+'V')+(g===0?r1(X(g))+' '+r1(Y(v)):r1(Y(v)));});
      d+='H'+r1(X(NG-1));o.push(`<path d="${d}" fill="none" stroke="${c}" stroke-width="2" stroke-linejoin="round"/>`);
      for(const g of [0,...SACRES.map(s=>s.g)]){const id=chef[g],v=P[id][quoi][cle];
        o.push(forme==='rond'?`<circle cx="${r1(X(g))}" cy="${r1(Y(v))}" r="4.5" fill="${c}" stroke="${th.fond}" stroke-width="2"><title>${esc(id+' : '+fmt(v)+(quoi==='entrainement'?' à l’entraînement':' en validation'))}</title></circle>`
          :`<rect x="${r1(X(g)-4.5)}" y="${r1(Y(v)-4.5)}" width="9" height="9" rx="1.5" fill="${c}" stroke="${th.fond}" stroke-width="2"><title>${esc(id+' : '+fmt(v)+' en validation')}</title></rect>`);}
      const vf=P[chef[NG-1]][quoi][cle];return Y(vf);};
    const yE=serie('entrainement',th.ent,'rond'),yV=serie('validation',th.val,'carre');
    /* les refuses en validation : carre vide */
    for(const e of ECHECS){const v=P[e.id].validation[cle];
      o.push(`<rect x="${r1(X(e.g)+6)}" y="${r1(Y(v)-4)}" width="8" height="8" rx="1.5" fill="${th.fond}" stroke="${th.val}" stroke-width="1.5"><title>${esc(e.id+' : '+fmt(v)+' en validation, refusé')}</title></rect>`);}
    t(xG1+14,yE+4,'entraînement '+fmt(P[chef[NG-1]].entrainement[cle]),'ptb');
    t(xG1+14,yV+4,'validation '+fmt(P[chef[NG-1]].validation[cle]),'ptb');
    return {yA,yB,Y};};

  y+=26;
  const H1=panneau(y,190,'La note du champion','« mixte » = palier médian − 6 × écart aux joueurs ; plus haut = mieux',-7,0,1,'mixte',v=>nf(v,v%1?2:0));
  /* les noms des sacres, au-dessus du premier panneau */
  for(const s of SACRES)t(X(s.g),H1.yA-2,s.id,'p m');
  /* l'annotation du plat */
  const yPlat=H1.Y(P.c0101.validation.mixte);
  t(X(7)+8,yPlat+22,'c0072, c0087, c0101 : les 20 courses de validation','p',true);
  t(X(7)+8,yPlat+35,'identiques, au bit près, à celles de c0064','p',true);
  for(const e of ECHECS){const v=P[e.id].validation.mixte;t(X(e.g)+22,H1.Y(v)+(e.id==='c0098'?-8:4),e.id+' refusé','p',true);}

  const y2=H1.yB+44;
  const H2=panneau(y2,150,'Le palier moyen du champion','moyenne des 20 courses ; le palier, c’est la progression dans une partie',4,9,1,'palier_moyen',v=>nf(v,v%1?2:0));
  /* l'axe des generations, sous le second panneau */
  for(let g=0;g<NG;g++){ligne(X(g),H2.yB,X(g),H2.yB+4,th.axe,1);t(X(g),H2.yB+16,String(g),'p m');}
  t(X(NG-1),H2.yB+29,'interrompue','p m');
  t((xG0+xG1)/2,H2.yB+44,'génération (6 variantes chacune, la 15e arrêtée après 4)','t2 m');

  let yS=H2.yB+70;
  for(const s of coupe(`source : ml/labo/journal (cerveaux.jsonl, validations.jsonl, depenses.jsonl), fusion 7f9543955, lu par ml/ecurie/etude/boucle-payante-ryzen/outils/extraire.js · entraînement : graines 910000 + 37 k ; validation : 950000 + 37 k, les mêmes à chaque sacre · un sacre exige de faire AU MOINS aussi bien que le parent en validation (ml/ecurie/boucle.js, auMoins) : à égalité, on sacre`,'src',W-2*G)){t(G,yS,s,'src');yS+=13;}
  const H=Math.ceil(yS+4);

  const fautes=[];
  for(const b of boites)if(b.x0<G-1||b.x1>W-G+1||b.y0<0||b.y1>H)fautes.push('hors cadre : '+b.txt);
  for(let i=0;i<boites.length;i++)for(let j=i+1;j<boites.length;j++){const a=boites[i],b=boites[j];
    if(a.x0<b.x1&&b.x0<a.x1&&a.y0<b.y1&&b.y0<a.y1)fautes.push('chevauchement : « '+a.txt+' » / « '+b.txt+' »');}
  if(fautes.length)throw new Error(th.nom+'\n'+fautes.join('\n'));

  const css=`text{font-family:system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;font-variant-numeric:tabular-nums}
.ti{font-size:15px;font-weight:650;fill:${th.texte}}
.t{font-size:12px;fill:${th.texte}}
.tb{font-size:12px;font-weight:650;fill:${th.texte}}
.t2{font-size:11.5px;fill:${th.texte2}}
.p{font-size:10.5px;fill:${th.texte2}}
.pt{font-size:10.5px;fill:${th.texte}}
.ptb{font-size:10.5px;font-weight:650;fill:${th.texte}}
.src{font-size:10px;font-style:italic;fill:${th.texte2}}
.m{text-anchor:middle}.e{text-anchor:end}`;
  const aria=`La note et le palier moyen du champion de la boucle payante, génération par génération, à l’entraînement et en validation : la note de validation passe de ${nf(P.c0025.validation.mixte)} (c0025) à ${nf(P.c0026.validation.mixte)} (c0026) puis ${nf(P.c0064.validation.mixte)} (c0064), et ne bouge plus ensuite ; à l’entraînement elle monte par petits pas jusqu’à ${nf(P.c0101.entrainement.mixte)} (c0101)`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(aria)}">
<style>
${css}
</style>
<defs><pattern id="hach-${th.nom}" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="7" height="7" fill="${th.fond}"/><line x1="0" y1="0" x2="0" y2="7" stroke="${th.hach}" stroke-width="1.6"/></pattern></defs>
<rect width="${W}" height="${H}" fill="${th.fond}"/>
${o.join('\n')}
</svg>
`;
}

for(const th of Object.values(THEMES)){
  const f=path.join(IMG,`boucle-payante-lignee-${th.nom}.svg`);
  fs.writeFileSync(f,dessine(th));
  console.log('écrit',path.relative(RACINE,f));
}
