#!/usr/bin/env node
/* ===== L'IMAGE « DEPENSES » DU JOURNAL DE BORD (2026-11-27, Claude : « ou sont passes les euros ») =====
   Node pur, sans dependance. Une commande :
     node ml/ecurie/portfolio/figures-journal/depenses.js
   lit   ml/labo/journal/depenses.jsonl        (le journal des depenses du credit d'API sur ce PC)
   ecrit ml/ecurie/portfolio/images/journal-depenses-clair.svg et journal-depenses-sombre.svg
   Le haut : le credit de 200 EUR, ce qui est depense ici, la boucle du second PC (le Ryzen) en hachure,
   SANS chiffre de depense (ses journaux restent la-bas ; seul son plafond de 60 EUR est connu, journal/2026-11-27.md).
   Le bas : les 36,92 EUR poste par poste. Palette, police et marges reprises de ml/ecurie/portfolio/figures.js. */
const fs=require('fs'),path=require('path');
const ICI=__dirname,RACINE=path.join(ICI,'..','..','..','..'),IMG=path.join(ICI,'..','images');

/* ---------------- les donnees ---------------- */
const SOURCE='ml/labo/journal/depenses.jsonl';
const L=fs.readFileSync(path.join(RACINE,SOURCE),'utf8').split('\n').filter(x=>x.trim()).map(x=>JSON.parse(x));
/* le credit total et le plafond du Ryzen : ecrits dans le journal, pas dans depenses.jsonl
   (200 EUR : journal/2026-11-25.md, « plafond general de 200 € » ; 60 EUR : journal/2026-11-27.md, « arret a 60 € au total ») */
const CREDIT=200,PLAFOND_RYZEN=60;

const MODELE={'claude-haiku-5-5':'Haiku 5.5','claude-sonnet-5-5':'Sonnet 5.5','claude-opus-5-5':'Opus 5.5','claude-fable-5-2':'Fable 5.2'};
/* les postes, en mots simples ; le nom de chaque agent vient du champ « pour » et de son rapport ml/ecurie/agents/<date>-<nom>.md */
const AGENTS={
  'pilote':        'Écrire le premier pilote',
  'finitions-b':   'Finir les yeux et la main, contrôler le pilote',
  'images':        'Dessiner les images du portfolio',
  'portfolio':     'Écrire la page du portfolio',
  'choix-modele':  'Choisir le modèle de la boucle',
  'compte-rendu':  'Écrire le compte rendu n° 2',
  'essai':         'Essayer la facturation'};
const postes=new Map();
function poste(cle,nom){if(!postes.has(cle))postes.set(cle,{cle,nom,euros:0,lignes:0,modeles:new Map(),variantes:0,perdues:0});return postes.get(cle);}
for(const d of L){
  let p;
  if(/^K-/.test(d.etape)){                       /* le calibrage : candidats et variante perdue */
    p=poste('calibrage','Mettre quatre modèles à l’épreuve');
    if(d.pour==='candidat')p.variantes++;else p.perdues++;
  }else{
    const m=/agent sans ecran : (.+)$/.exec(d.pour);
    if(!m||!AGENTS[m[1]])throw new Error('ligne inconnue : '+JSON.stringify(d));
    p=poste(m[1],AGENTS[m[1]]);
  }
  p.euros+=d.euros;p.lignes++;
  const mo=MODELE[d.modele]||d.modele;p.modeles.set(mo,(p.modeles.get(mo)||0)+d.euros);
}
const r2=x=>Math.round(x*100)/100;
for(const p of postes.values())p.euros=r2(p.euros);
const total=r2(L.reduce((s,d)=>s+d.euros,0));
const jours=[...new Set(L.map(d=>d.date.slice(0,10)))];
const liste=[...postes.values()].sort((a,b)=>b.euros-a.euros);
const cal=postes.get('calibrage');
for(const p of liste)p.sous=p.cle==='calibrage'
  ?`${p.variantes} variantes écrites, ${p.perdues} réponse perdue`
  :'un agent '+[...p.modeles.keys()].join(', ');

/* ---------------- les nombres a la francaise ---------------- */
const NB=' ';
function nf(x,k){k=k==null?2:k;let [e,d]=Math.abs(x).toFixed(k).split('.');if(e.length>3)e=e.replace(/\B(?=(\d{3})+(?!\d))/g,NB);return (x<0?'−':'')+e+(d?','+d:'');}
const eur=x=>nf(x)+NB+'€';
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const r1=x=>Math.round(x*10)/10;

/* ---------------- les deux themes (les memes que figures.js) ---------------- */
const THEMES={
  sombre:{nom:'sombre',fond:'#0f1115',panneau:'#151820',texte:'#e8e6e1',texte2:'#9da2ab',grille:'#22262e',axe:'#5a606a',barre:'#6ea8fe',essai:'#e0b04a',hach:'#9da2ab'},
  clair:{nom:'clair',fond:'#ffffff',panneau:'#f6f5f1',texte:'#1c1c21',texte2:'#5b5b66',grille:'#e9e6df',axe:'#8d8a83',barre:'#2f6db5',essai:'#9a6a00',hach:'#5b5b66'}};

/* ---------------- la largeur d'un texte, estimee (comme figures.js, un peu large par prudence) ---------------- */
const LARG={ti:8.4,t:6.6,tb:7.1,t2:6.2,p:5.8,pt:5.8,ptb:6.2,src:5.4};
const largeur=(txt,cls)=>String(txt).length*(LARG[String(cls||'t').split(' ')[0]]||6.4);
function coupe(txt,cls,w){const mots=String(txt).split(' '),R=[];let cur='';
  for(const m of mots){const e=cur?cur+' '+m:m;if(cur&&largeur(e,cls)>w){R.push(cur);cur=m;}else cur=e;}
  if(cur)R.push(cur);return R;}
const HAUT={ti:15,t:12,tb:12,t2:11.5,p:10.5,pt:10.5,ptb:10.5,src:10};

/* ---------------- le dessin ---------------- */
function dessine(th){
  const W=960,G=16,o=[],boites=[];
  /* chaque texte pose garde sa boite : a la fin, aucune ne doit en chevaucher une autre ni sortir du cadre */
  const t=(x,y,txt,cls)=>{const c=cls.split(' ')[0],w=largeur(txt,c),h=HAUT[c];
    const x0=/\be\b/.test(cls)?x-w:/\bm\b/.test(cls)?x-w/2:x;
    boites.push({x0,x1:x0+w,y0:y-h*.8,y1:y+h*.25,txt});
    o.push(`<text x="${r1(x)}" y="${r1(y)}" class="${cls}">${esc(txt)}</text>`);};
  const rect=(x,y,w,h,f,plus)=>o.push(`<rect x="${r1(x)}" y="${r1(y)}" width="${r1(Math.max(0,w))}" height="${r1(h)}" fill="${f}"${plus?' '+plus:''}/>`);
  const ligne=(x1,y1,x2,y2,c,w,plus)=>o.push(`<line x1="${r1(x1)}" y1="${r1(y1)}" x2="${r1(x2)}" y2="${r1(y2)}" stroke="${c}" stroke-width="${w||1}"${plus?' '+plus:''}/>`);
  const barre=(x,y,w,h,f)=>{ /* bout arrondi de 4 px du cote de la valeur, ancre carre sur la ligne de depart */
    if(w<=0)return;const r=Math.min(4,w,h/2);
    o.push(`<path d="M${r1(x)} ${r1(y)}H${r1(x+w-r)}Q${r1(x+w)} ${r1(y)} ${r1(x+w)} ${r1(y+r)}V${r1(y+h-r)}Q${r1(x+w)} ${r1(y+h)} ${r1(x+w-r)} ${r1(y+h)}H${r1(x)}Z" fill="${f}"/>`);};

  /* le titre : la conclusion */
  let y=24;
  t(G,y,`Sur ${eur(total)}, ${eur(cal.euros)} ont servi à essayer des variantes du pilote : aucune n’a tenu sur des courses neuves`,'ti');
  y+=18;
  for(const s of coupe(`Le crédit d’API dépensé sur ce PC, poste par poste : tout le journal des dépenses (${L.length} lignes, toutes du ${jours.map(j=>j.slice(8,10)+'/'+j.slice(5,7)+'/'+j.slice(0,4)).join(', ')}). Le reste, ${eur(r2(total-cal.euros))}, a payé des agents chargés d’une seule tâche : écrire le pilote, le contrôler, choisir le modèle, faire le portfolio.`,'t2',W-2*G)){t(G,y,s,'t2');y+=15;}

  /* ---- 1. le credit de 200 euros ---- */
  y+=14;t(G,y,`Le crédit de ${nf(CREDIT,0)} €`,'tb');
  const yA=y+10,hA=26,xA0=G,xA1=W-G,k=(xA1-xA0)/CREDIT,ESP=2;
  const xD=xA0+total*k,xR=xA0+(total+PLAFOND_RYZEN)*k;
  barre(xA0,yA,xD-xA0-ESP/2,hA,th.barre);
  rect(xD+ESP/2,yA,xR-xD-ESP,hA,`url(#hach-${th.nom})`,`stroke="${th.hach}" stroke-width="1" stroke-dasharray="4 3"`);
  rect(xR+ESP/2,yA+.5,xA1-xR-ESP/2-.5,hA-1,'none',`stroke="${th.axe}" stroke-width="1"`);
  /* les graduations sous la barre */
  const yT=yA+hA;
  for(let v=0;v<=CREDIT;v+=50){const x=xA0+v*k;ligne(x,yT,x,yT+4,th.axe,1);t(Math.min(Math.max(x,G+4),W-G-14),yT+15,v===CREDIT?nf(v,0)+' €':nf(v,0),v===0?'p':v===CREDIT?'p e':'p m');}
  /* les etiquettes des trois morceaux, sous les graduations */
  let yE=yT+34;
  t(xA0,yE,`${eur(total)} dépensés ici`,'ptb');
  t(xA0,yE+13,'(le détail ci-dessous)','p');
  t(xD+6,yE,`La boucle du second PC : plafond ${nf(PLAFOND_RYZEN,0)} €`,'ptb');
  t(xD+6,yE+13,'ce qu’elle a dépensé n’est pas vérifié ici','p');
  const reste=r2(CREDIT-total-PLAFOND_RYZEN);
  t(xR+8,yE,`au moins ${eur(reste)} encore libres`,'ptb');
  t(xR+8,yE+13,'si la boucle s’arrête à son plafond et que rien d’autre n’est payé','p');

  /* ---- 2. les 36,92 euros, poste par poste ---- */
  y=yE+13+40;
  t(G,y,`Le détail des ${eur(total)}`,'tb');
  t(G+largeur(`Le détail des ${eur(total)}`,'tb')+10,y,'un poste par ligne, du plus cher au moins cher','p');
  const xB0=360,max=Math.ceil(Math.max(...liste.map(p=>p.euros))/2)*2,kB=230/max,RANG=36,hB=16;
  const yB=y+16,yFin=yB+RANG*liste.length;
  /* la grille verticale, discrete, puis l'axe */
  for(let v=0;v<=max;v+=2){const x=xB0+v*kB;ligne(x,yB-4,x,yFin,v===0?th.axe:th.grille,1);}
  liste.forEach((p,i)=>{
    const yr=yB+i*RANG;
    t(G,yr+14,p.nom,'t');
    t(G,yr+28,p.sous,'p');
    const w=p.euros*kB;
    barre(xB0,yr+9,w,hB,p.cle==='essai'?th.essai:th.barre);
    t(xB0+w+6,yr+21,eur(p.euros),'pt');
    if(p.cle==='calibrage'){
      const xa=xB0+w+6+largeur(eur(p.euros),'pt')+18;
      ligne(xa-12,yr+17,xa-4,yr+17,th.texte2,1);
      const m=[...p.modeles.entries()].map(([n,e])=>n.replace(/ \d\.\d$/,'')+' '+nf(e)).join(' · ');
      t(xa,yr+21,'Aucune variante n’a gagné un palier qui tienne sur des courses neuves','ptb');
      t(xa,yr+35,'la meilleure (Sonnet) : palier médian 13 contre 11 pour le pilote,','p');
      t(xa,yr+48,'puis 10,5 contre 11 sur 20 courses neuves','p');
      t(xa,yr+61,'par modèle, en € : '+m,'p');
      t(xa,yr+74,'(Fable : une seule réponse, coupée, sans variante)','p');
    }
  });
  const yAx=yFin+2;
  for(let v=0;v<=max;v+=2){const x=xB0+v*kB;ligne(x,yAx,x,yAx+4,th.axe,1);t(x,yAx+16,nf(v,0),'p m');}
  t(xB0+max*kB/2,yAx+32,'euros dépensés (estimés, 1 € compté pour 1 $)','t2 m');

  /* ---- la source ---- */
  let yS=yAx+58;
  for(const s of coupe(`source : ${SOURCE} (${L.length} lignes, total ${nf(total)}) · noms des agents et des modèles : ml/ecurie/agents/2026-11-25T*.md · plafond de ${nf(CREDIT,0)} € : ml/ecurie/portfolio/journal/2026-11-25.md · boucle du second PC, plafond de ${nf(PLAFOND_RYZEN,0)} € compté dans les ${nf(CREDIT,0)} € : journal/2026-11-27.md · variantes : journal/2026-11-25_suite.md, ml/ecurie/agents/sortie-calibrage-sonnet.log, commit 8610302d2 · montants estimés par les agents en dollars, inscrits 1 € pour 1 $ (ml/ecurie/agent-api.js)`,'src',W-2*G)){t(G,yS,s,'src');yS+=13;}
  const H=Math.ceil(yS+4);

  /* ---- le controle : aucun texte qui se chevauche ou sort du cadre ---- */
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
  const aria=`Le crédit d’API dépensé sur ce PC : ${eur(total)} sur ${nf(CREDIT,0)} €, poste par poste ; ${eur(cal.euros)} pour des variantes du pilote, dont aucune n’a tenu sur des courses neuves ; la boucle du second PC, plafonnée à ${nf(PLAFOND_RYZEN,0)} €, n’est pas comptée ici`;
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
  const f=path.join(IMG,`journal-depenses-${th.nom}.svg`);
  fs.writeFileSync(f,dessine(th));
  console.log('écrit',path.relative(RACINE,f));
}
console.log(`total ${nf(total)} € sur ${L.length} lignes ; postes :`,liste.map(p=>`${p.nom} ${nf(p.euros)} (${p.lignes} l.)`).join(' | '));
