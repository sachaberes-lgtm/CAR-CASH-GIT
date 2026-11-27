'use strict';
/* ===== TABLEAU.JS : LA PAGE A OUVRIR LE MATIN (27/11/2026, Sacha : « une population de pilotes evolue seule sur un PC ») =====
   Reecrit etat/tableau.html (une page seule : SVG en ligne, aucune ressource externe, aucun appel reseau, s'ouvre en file://) et etat/resume.txt
   (les 10 lignes de etat.js). Contenu derive : on peut l'effacer, il revient a la generation suivante. Ecriture atomique (.tmp puis rename).
   Lit : population.json, generations.jsonl, validations.jsonl, coffre.jsonl, morts.jsonl, verrou.json, et dans courses-*.jsonl seulement
   les lignes du champion (ses 15 mesures) et celles qui portent des pannes. Ne plante pas sur un etat vide ou tronque.
   API (INTERFACES.md § 2.8) : require('./tableau').ecrire(cfg) -> {html, resume} (les deux chemins).
   En plus, pour les tests : page(cfg, o?) -> le texte HTML sans rien ecrire.
   Ligne de commande : node ml/evolution/tableau.js [--config f.json]
   Ordre des sections (spec § 8) : 1 le coffre (« est-ce que ca apprend ? ») ; 2 F, palier, E par generation ; 3 les 15 z du champion ;
   4 la population ; 5 la malediction du gagnant ; 6 la diversite ; 7 la machine (debit, pannes, non mesurees, epoques, phases). */
const fs=require('fs'),path=require('path');
const ET=require('./etat');

let C=null;
try{C=require('./commun');}catch(e){C=null;}
function ecrireAtomique(fichier,texte){
  if(C&&typeof C.ecrireAtomique==='function')return C.ecrireAtomique(fichier,texte);
  if(texte.indexOf('\r')>=0)throw new Error('tableau : texte avec \\r');
  fs.mkdirSync(path.dirname(fichier),{recursive:true});
  const tmp=fichier+'.'+process.pid+'.tmp';
  fs.writeFileSync(tmp,texte,'utf8');fs.renameSync(tmp,fichier);}

/* ---------- petits outils ---------- */
const esc=s=>String(s==null?'':s).replace(/\r/g,'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const fini=x=>typeof x==='number'&&isFinite(x);
const fr=(x,d)=>fini(x)?x.toFixed(d==null?1:d).replace('.',','):'–';
const frs=(x,d)=>fini(x)?(x>0?'+':x<0?'−':'')+Math.abs(x).toFixed(d==null?1:d).replace('.',','):'–';
const court=id=>id?String(id).slice(0,8):'–';
function dateFr(iso){
  const d=new Date(iso);if(isNaN(d))return '–';
  const p=n=>String(n).padStart(2,'0');
  return p(d.getDate())+'/'+p(d.getMonth()+1)+'/'+d.getFullYear()+' à '+p(d.getHours())+' h '+p(d.getMinutes());}
const ORIGINES={temoin:'le témoin',g0:'mutant de départ',mutation:'mutation',croisement:'croisement',immigre:'immigré'};

/* graduations « rondes » */
function graduations(min,max,n){
  if(!(max>min)){const c=fini(min)?min:0;min=c-1;max=c+1;}
  const brut=(max-min)/(n||5),p=Math.pow(10,Math.floor(Math.log10(brut))),r=brut/p;
  const pas=(r<1.5?1:r<3?2:r<7?5:10)*p,T=[];
  for(let v=Math.ceil(min/pas-1e-9)*pas;v<=max+pas*1e-6;v+=pas)T.push(Math.abs(v)<pas*1e-9?0:+v.toFixed(10));
  return {T,pas};}
function decimales(pas){return pas>=1?0:Math.min(4,Math.ceil(-Math.log10(pas)));}

/* ---------- LA COURBE (SVG en ligne) ----------
   o : {series:[{nom, couleur, points:[{x,y,info?}], pointille?, epais?}], xTitre, yTitre, marques:[{x,texte}], lignesH:[{y,texte,couleur}],
        yMin?, yMax?, hauteur?, vide?:texte} */
function courbe(o){
  const W=760,H=o.hauteur||250,g=56,d=18,h=14,b=40;
  /* un trou dans une serie (valeur absente : pas de meneur pendant une generation) coupe la ligne au lieu de relier par-dessus */
  const S=(o.series||[]).map(s=>{const brut=(s.points||[]).filter(p=>fini(p.x)).sort((a,b)=>a.x-b.x),seg=[];let cur=[];
      for(const p of brut){if(fini(p.y))cur.push(p);else if(cur.length){seg.push(cur);cur=[];}}
      if(cur.length)seg.push(cur);
      return Object.assign({},s,{segments:seg,points:[].concat(...seg)});}).filter(s=>s.points.length);
  if(!S.length)return '<p class="vide">'+esc(o.vide||'Pas encore de données.')+'</p>';
  const xs=[].concat(...S.map(s=>s.points.map(p=>p.x))),ys=[].concat(...S.map(s=>s.points.map(p=>p.y)));
  for(const l of (o.lignesH||[]))if(fini(l.y))ys.push(l.y);
  let x0=Math.min(...xs),x1=Math.max(...xs);if(x1===x0){x0-=1;x1+=1;}
  let y0=o.yMin!=null?Math.min(o.yMin,...ys):Math.min(...ys),y1=o.yMax!=null?Math.max(o.yMax,...ys):Math.max(...ys);
  if(y1===y0){y0-=1;y1+=1;}const marge=(y1-y0)*.08;if(o.yMin==null)y0-=marge;if(o.yMax==null)y1+=marge;
  const GY=graduations(y0,y1,5),GX=graduations(x0,x1,8);
  y0=Math.min(y0,GY.T[0]);y1=Math.max(y1,GY.T[GY.T.length-1]);
  const X=x=>g+(x-x0)/(x1-x0)*(W-g-d),Y=y=>h+(1-(y-y0)/(y1-y0))*(H-h-b);
  const dy=decimales(GY.pas),out=[];
  out.push('<svg class="courbe" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+esc(o.yTitre||'')+'">');
  for(const t of GY.T){if(t<y0-1e-9||t>y1+1e-9)continue;
    out.push('<line class="grille" x1="'+g+'" x2="'+(W-d)+'" y1="'+Y(t).toFixed(1)+'" y2="'+Y(t).toFixed(1)+'"/>');
    out.push('<text class="axe" x="'+(g-6)+'" y="'+(Y(t)+4).toFixed(1)+'" text-anchor="end">'+esc(t.toFixed(dy).replace('.',','))+'</text>');}
  for(const t of GX.T){if(t<x0-1e-9||t>x1+1e-9)continue;
    out.push('<text class="axe" x="'+X(t).toFixed(1)+'" y="'+(H-b+16)+'" text-anchor="middle">'+esc(t.toFixed(decimales(GX.pas)))+'</text>');}
  if(o.xTitre)out.push('<text class="axe titre" x="'+((g+W-d)/2)+'" y="'+(H-6)+'" text-anchor="middle">'+esc(o.xTitre)+'</text>');
  if(o.yTitre)out.push('<text class="axe titre" x="'+g+'" y="'+(h-3)+'" text-anchor="start">'+esc(o.yTitre)+'</text>');
  for(const m of (o.marques||[])){if(!fini(m.x)||m.x<x0||m.x>x1)continue;
    out.push('<line class="marque" x1="'+X(m.x).toFixed(1)+'" x2="'+X(m.x).toFixed(1)+'" y1="'+h+'" y2="'+(H-b)+'"><title>'+esc(m.texte)+'</title></line>');
    out.push('<text class="marque-texte" x="'+(X(m.x)+3).toFixed(1)+'" y="'+(h+10)+'">'+esc(m.court||'')+'</text>');}
  for(const l of (o.lignesH||[])){if(!fini(l.y))continue;
    out.push('<line class="repere" style="stroke:'+(l.couleur||'var(--alerte)')+'" x1="'+g+'" x2="'+(W-d)+'" y1="'+Y(l.y).toFixed(1)+'" y2="'+Y(l.y).toFixed(1)+'"/>');
    if(l.texte)out.push('<text class="axe" style="fill:'+(l.couleur||'var(--alerte)')+'" x="'+(g+6)+'" y="'+(Y(l.y)-4).toFixed(1)+'" text-anchor="start">'+esc(l.texte)+'</text>');}
  for(const s of S){
    const P=s.points;
    for(const sg of s.segments)if(sg.length>1)out.push('<polyline fill="none" stroke="'+s.couleur+'" stroke-width="'+(s.epais||2.2)+'"'+(s.pointille?' stroke-dasharray="5 4"':'')+
      ' stroke-linejoin="round" points="'+sg.map(p=>X(p.x).toFixed(1)+','+Y(p.y).toFixed(1)).join(' ')+'"/>');
    const r=P.length>60?1.6:3;
    for(const p of P)out.push('<circle cx="'+X(p.x).toFixed(1)+'" cy="'+Y(p.y).toFixed(1)+'" r="'+r+'" fill="'+s.couleur+'"><title>'+
      esc(s.nom+' : '+fr(p.y,2)+(p.info?' · '+p.info:''))+'</title></circle>');}
  out.push('</svg>');
  out.push('<div class="legende">'+S.map(s=>'<span><i style="background:'+s.couleur+'"></i>'+esc(s.nom)+'</span>').join('')+'</div>');
  return out.join('');}

/* ---------- LES 15 MESURES DU CHAMPION (barres de z, la bande ±1 = « comme les joueurs ») ---------- */
function barresZ(L){
  if(!L||!L.length)return '<p class="vide">Pas encore assez de parties longues du champion dans cette époque.</p>';
  const W=760,lig=24,hTop=26,H=hTop+L.length*lig+10,gx=300,dx=W-16,B=8,X=z=>gx+(Math.max(-B,Math.min(B,z))+B)/(2*B)*(dx-gx),out=[];
  out.push('<svg class="courbe" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="écart du champion aux joueurs, mesure par mesure">');
  out.push('<rect class="bande" x="'+X(-1).toFixed(1)+'" y="'+(hTop-6)+'" width="'+(X(1)-X(-1)).toFixed(1)+'" height="'+(L.length*lig+6)+'"/>');
  for(const t of [-8,-4,-2,-1,0,1,2,4,8]){
    out.push('<line class="grille" x1="'+X(t).toFixed(1)+'" x2="'+X(t).toFixed(1)+'" y1="'+(hTop-6)+'" y2="'+(H-10)+'"/>');
    out.push('<text class="axe" x="'+X(t).toFixed(1)+'" y="'+(hTop-10)+'" text-anchor="middle">'+(t>0?'+':'')+t+'</text>');}
  L.forEach((m,i)=>{
    const y=hTop+i*lig,a=Math.abs(m.z),coul=a<=1?'var(--bien)':a<=3?'var(--moyen)':'var(--alerte)';
    out.push('<text class="etiquette" x="'+(gx-8)+'" y="'+(y+lig/2+4)+'" text-anchor="end">'+esc(m.nom)+'</text>');
    const xa=X(0),xb=X(m.z);
    out.push('<rect x="'+Math.min(xa,xb).toFixed(1)+'" y="'+(y+5)+'" width="'+Math.max(1.5,Math.abs(xb-xa)).toFixed(1)+'" height="'+(lig-10)+'" rx="2" fill="'+coul+'">'+
      '<title>'+esc(m.nom+' : champion '+m.bot+', joueurs '+m.joueurs+' (± '+m.sigma+'), z '+m.z)+'</title></rect>');
    out.push('<text class="axe" x="'+(m.z>=0?Math.min(xb+4,dx-30):Math.max(xb-4,gx+30)).toFixed(1)+'" y="'+(y+lig/2+4)+'" text-anchor="'+(m.z>=0?'start':'end')+'">'+
      (m.z>0?'+':'')+fr(m.z,1)+'</text>');});
  out.push('</svg>');
  return out.join('');}

/* ---------- F ± se de chaque vivant (un point, une barre d'incertitude) ---------- */
function moustaches(R){
  R=R.filter(r=>r.note&&fini(r.note.F));
  if(!R.length)return '<p class="vide">Personne n\'est encore noté.</p>';
  const W=760,lig=16,hTop=26,H=hTop+R.length*lig+10,gx=150,dx=W-16;
  const lo=Math.min(...R.map(r=>r.note.F-(r.note.se_F||0))),hi=Math.max(...R.map(r=>r.note.F+(r.note.se_F||0)));
  const GX=graduations(lo,hi,6),x0=Math.min(lo,GX.T[0]),x1=Math.max(hi,GX.T[GX.T.length-1]),X=x=>gx+(x-x0)/((x1-x0)||1)*(dx-gx),out=[];
  out.push('<svg class="courbe" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="la note F de chaque pilote vivant">');
  for(const t of GX.T){out.push('<line class="grille" x1="'+X(t).toFixed(1)+'" x2="'+X(t).toFixed(1)+'" y1="'+(hTop-6)+'" y2="'+(H-10)+'"/>');
    out.push('<text class="axe" x="'+X(t).toFixed(1)+'" y="'+(hTop-10)+'" text-anchor="middle">'+esc(t.toFixed(decimales(GX.pas)).replace('.',','))+'</text>');}
  R.forEach((r,i)=>{
    const y=hTop+i*lig+lig/2,coul=r.role==='champion'?'var(--champion)':r.role==='temoin'?'var(--temoin)':r.role==='meneur'?'var(--meneur)':'var(--autre)';
    const se=r.note.se_F||0;
    out.push('<text class="etiquette petite" x="'+(gx-8)+'" y="'+(y+4)+'" text-anchor="end">'+esc((r.role?r.roleTexte+' ':'')+court(r.id))+'</text>');
    out.push('<line stroke="'+coul+'" stroke-width="2" x1="'+X(r.note.F-se).toFixed(1)+'" x2="'+X(r.note.F+se).toFixed(1)+'" y1="'+y+'" y2="'+y+'"/>');
    out.push('<circle cx="'+X(r.note.F).toFixed(1)+'" cy="'+y+'" r="4" fill="'+coul+'"><title>'+esc(court(r.id)+' : F '+fr(r.note.F,2)+' ± '+fr(se,2))+'</title></circle>');});
  out.push('</svg>');
  return out.join('');}

/* ---------- les donnees derivees ---------- */
/* Les lignes de course utiles : celles du champion (pour ses mesures) et celles qui portent des pannes (filtre sur le texte avant JSON.parse) */
function lireCoursesUtiles(D,champion){
  const lus={champion:[],pannes:{}};
  for(const f of D.fichiersCourses){
    const L=ET.lireJsonlTolerant(f,D.alertes,s=>(champion&&s.indexOf(champion)>=0)||/"pannes":[1-9]/.test(s));
    for(const l of L){
      if(champion&&l.id===champion)lus.champion.push(l);
      if((l.pannes|0)>0&&l.usage==='entrainement'&&fini(l.generation))lus.pannes[l.generation]=(lus.pannes[l.generation]||0)+(l.pannes|0);}}
  return lus;}

/* Les z du champion sur ses courses d'entrainement mesurees de l'epoque en cours (ressemblance.ecart, la reference des joueurs au clavier) */
function zChampion(lignes,epoque,alertes){
  const M=lignes.filter(l=>l.mesuree===true&&l.usage==='entrainement'&&(!epoque||l.epoque===epoque)&&l.mesures).map(l=>l.mesures);
  if(!M.length)return {liste:null,parties:0};
  try{
    const R=require(path.join(__dirname,'..','bot','ressemblance.js'));
    const r=R.ecart(null,{mesures:M,reference:R.reference(R.joueurs('clavier'))});
    if(!r)return {liste:null,parties:0};
    const ordre=R.MESURES.map(m=>m[0]);
    return {liste:r.mesures.slice().sort((a,b)=>ordre.indexOf(a.cle)-ordre.indexOf(b.cle)),parties:r.parties,ecart:r.ecart};
  }catch(e){alertes.push('mesures du champion non calculées ('+String(e.message||e).slice(0,80)+')');return {liste:null,parties:0};}}

/* Les changements d'epoque, de phase et de graines, lus dans les generations */
function reperes(G){
  const ep=[],ph=[];let avant=null,phAvant=null;
  for(const g of G){
    if(avant!==null&&g.epoque!==avant){
      const ev=(g.evenements||[]).find(e=>/epoque/.test(e)&&!/notes/.test(e));
      ep.push({x:g.generation-.5,court:'époque',texte:'nouvelle époque à la génération '+g.generation+(ev?' ('+ev+')':'')});}
    if(phAvant!==null&&g.phase!==phAvant)ph.push({x:g.generation-.5,court:'phase '+g.phase,texte:'phase '+g.phase+' à la génération '+g.generation});
    avant=g.epoque;phAvant=g.phase;}
  return {epoques:ep,phases:ph,toutes:ep.concat(ph)};}

const COUL={champion:'var(--champion)',temoin:'var(--temoin)',meneur:'var(--meneur)'};
/* le champion n'est dessine que quand il n'est pas le temoin (sinon les deux lignes se recouvrent) */
const serie=(G,qui,cle,nom)=>({nom,couleur:COUL[qui],pointille:qui==='temoin',
  points:G.map(g=>{const x=g[qui],memeQueTemoin=qui==='champion'&&x&&g.temoin&&x.id===g.temoin.id;
    return {x:g.generation,y:x&&!memeQueTemoin?x[cle]:null,info:x&&x.id?'pilote '+court(x.id):''};})});

/* ---------- LA PAGE ---------- */
function page(cfg,o){
  o=o||{};
  const maintenant=o.maintenant!=null?o.maintenant:Date.now();
  const D=ET.lire(cfg,{morts:true});
  const resume=ET.resume(cfg,{donnees:D,maintenant});
  const pop=D.pop,G=D.generations,dern=G.length?G[G.length-1]:null;
  const champId=(pop&&pop.champion&&pop.champion.id)||(dern&&dern.champion&&dern.champion.id)||null;
  const temoinId=(pop&&pop.temoin)||(dern&&dern.temoin&&dern.temoin.id)||null;
  const epoque=(pop&&pop.epoque&&pop.epoque.courses)||(dern&&dern.epoque)||null;
  const lus=lireCoursesUtiles(D,champId);
  const Z=zChampion(lus.champion,epoque,D.alertes);
  const RP=reperes(G);
  const S=[];

  /* EN TETE */
  S.push('<header><h1>CASH CAR · la sélection naturelle des bots</h1>'+
    '<p class="sous">Page refaite à la fin de chaque génération (dernière fois : '+esc(dateFr(new Date(maintenant).toISOString()))+'). '+
    'Elle se recharge seule toutes les 5 minutes. Rien n\'est publié : elle ne vit que sur ce PC.</p></header>');
  S.push('<section class="bref"><h2>En bref</h2><pre>'+esc(resume.join('\n'))+'</pre></section>');

  /* 1. LE COFFRE */
  {const K=D.coffre.filter(k=>k&&fini(k.generation));
    const derK=K.length?K[K.length-1]:null;let phrase;
    if(!derK)phrase='Pas encore de mesure. La première arrive au premier nouveau champion, ou au plus tard 24 heures après le lancement.';
    else if(derK.champion&&derK.temoin&&derK.champion.id===derK.temoin.id)
      phrase='Le champion est encore le pilote de départ : aucun pilote n\'a encore prouvé qu\'il faisait mieux. C\'est normal les premiers jours.';
    else{const p=derK.diff&&derK.diff.palier,e=derK.diff&&derK.diff.ecartClassique;
      phrase='À la dernière mesure ('+esc(dateFr(derK.date))+'), sur les '+esc(derK.graines||40)+' courses du coffre, le champion va en moyenne '+
        (fini(p)?(p>=0?'<b class="bien">'+fr(Math.abs(p),2)+' palier'+(Math.abs(p)>=2?'s':'')+' plus loin</b>':'<b class="alerte">'+fr(Math.abs(p),2)+' palier'+(Math.abs(p)>=2?'s':'')+' moins loin</b>'):'–')+
        ' que le pilote de départ, et il ressemble '+(fini(e)?(e<=0?'<b class="bien">plus</b>':'<b class="alerte">moins</b>'):'–')+
        ' aux vrais joueurs (écart '+frs(e,2)+' ; plus bas = plus humain).';}
    S.push('<section><h2>1. Est-ce que ça apprend ? (le coffre)</h2>'+
      '<p class="explique">Le coffre, ce sont 40 courses qui ne servent jamais à l\'entraînement. À chaque nouveau champion et une fois par jour, '+
      'le <b style="color:var(--champion)">champion</b> et le <b style="color:var(--temoin)">témoin</b> (le pilote de départ, jamais modifié) les jouent toutes les deux. '+
      'Si la ligne verte passe et reste au-dessus de la grise, la sélection a vraiment trouvé mieux. C\'est le seul vrai juge.</p>'+
      '<p class="verdict">'+phrase+'</p>'+
      courbe({series:[
          {nom:'champion',couleur:COUL.champion,points:K.map(k=>({x:k.generation,y:k.champion&&k.champion.palierMoyen,info:dateFr(k.date)+' · '+(k.raison||'')}))},
          {nom:'témoin (pilote de départ)',couleur:COUL.temoin,pointille:true,points:K.map(k=>({x:k.generation,y:k.temoin&&k.temoin.palierMoyen,info:dateFr(k.date)}))}],
        xTitre:'génération',yTitre:'palier moyen sur le coffre (plus haut = va plus loin)',marques:RP.epoques,vide:'Pas encore de mesure du coffre.'})+
      courbe({series:[
          {nom:'champion',couleur:COUL.champion,points:K.map(k=>({x:k.generation,y:k.champion&&k.champion.ecartClassique}))},
          {nom:'témoin',couleur:COUL.temoin,pointille:true,points:K.map(k=>({x:k.generation,y:k.temoin&&k.temoin.ecartClassique}))}],
        xTitre:'génération',yTitre:'écart aux joueurs sur le coffre (plus bas = plus humain)',hauteur:200,marques:RP.epoques,vide:''})+
      '</section>');}

  /* 2. GENERATION PAR GENERATION */
  S.push('<section><h2>2. Génération par génération</h2>'+
    '<p class="explique">Chaque génération, tous les pilotes vivants jouent les mêmes courses. On en tire trois nombres : le <b>palier</b> (jusqu\'où il va, corrigé de la '+
    'difficulté de chaque course), l\'<b>écart aux joueurs E</b> (0 = il conduit comme un joueur ; plus haut = il fait des choses qu\'un joueur ne fait pas) et la '+
    '<b>note F = palier − '+esc((cfg.note&&cfg.note.poidsEcart)||4)+' × E</b>, qui décide qui reste et qui part. Le <b style="color:var(--meneur)">meneur</b> est le mieux noté '+
    'qui n\'est pas encore champion. Les traits verticaux marquent un changement d\'époque (le jeu ou les yeux ont changé : les notes repartent de zéro).</p>'+
    courbe({series:[serie(G,'meneur','F','meneur'),serie(G,'champion','F','champion'),serie(G,'temoin','F','témoin')],xTitre:'génération',yTitre:'note F (plus haut = mieux)',marques:RP.toutes})+
    courbe({series:[serie(G,'meneur','ahat','meneur'),serie(G,'champion','ahat','champion'),serie(G,'temoin','ahat','témoin')],xTitre:'génération',yTitre:'palier (plus haut = va plus loin)',marques:RP.epoques,hauteur:210})+
    courbe({series:[serie(G,'meneur','E','meneur'),serie(G,'champion','E','champion'),serie(G,'temoin','E','témoin')],xTitre:'génération',yTitre:'écart aux joueurs E (plus bas = plus humain)',marques:RP.epoques,hauteur:210})+
    '</section>');

  /* 3. LES 15 MESURES DU CHAMPION */
  S.push('<section><h2>3. Le champion conduit-il comme un joueur ?</h2>'+
    '<p class="explique">Les 15 façons de conduire que l\'on compare aux vraies parties des joueurs. La bande grise, c\'est « comme un joueur » ; '+
    'une barre <span class="bien">verte</span> y reste, <span class="moyen">orange</span> s\'en éloigne, <span class="alerte">rouge</span> est très loin (le chiffre = combien de fois '+
    'l\'écart habituel entre deux joueurs). À droite : le champion en fait plus que les joueurs ; à gauche : moins.</p>'+
    (Z.liste?'<p class="petit">Champion '+esc(court(champId))+' · '+esc(Z.parties)+' parties de plus d\'une minute dans cette époque · écart classique '+fr(Z.ecart,2)+'</p>':'')+
    barresZ(Z.liste)+'</section>');

  /* 4. LA POPULATION */
  {const notes={};for(const p of ((dern&&dern.population)||[]))if(p&&p.id)notes[p.id]=p;
    for(const q of ['meneur','champion','temoin'])if(dern&&dern[q]&&dern[q].id&&!notes[dern[q].id])notes[dern[q].id]=dern[q];
    const menId=dern&&dern.meneur&&dern.meneur.id,gen=pop?pop.generation:(dern?dern.generation:0);
    const V=(pop&&Array.isArray(pop.vivants))?pop.vivants:((dern&&dern.population)||[]).map(p=>({id:p.id,ne:p.ne}));
    const R=V.map(v=>{const role=v.id===champId?'champion':v.id===temoinId?'temoin':v.id===menId?'meneur':'';
      return {id:v.id,v,note:notes[v.id]||null,role,roleTexte:role==='champion'?'★':role==='temoin'?'◆':role==='meneur'?'▲':''};});
    R.sort((a,b)=>((b.note&&fini(b.note.F))?b.note.F:-1e9)-((a.note&&fini(a.note.F))?a.note.F:-1e9)||String(a.id).localeCompare(String(b.id)));
    const lignes=R.map(r=>{const n=r.note||{},v=r.v||{};
      const mutes=(v.mutes||[]).map(m=>m&&m.cle).filter(Boolean);
      return '<tr class="'+r.role+'"><td>'+(r.role==='champion'?'★ champion':r.role==='temoin'?'◆ témoin':r.role==='meneur'?'▲ meneur':'')+'</td>'+
        '<td class="code">'+esc(court(r.id))+'</td><td>'+esc(ORIGINES[v.origine]||v.origine||'–')+'</td>'+
        '<td class="nb">'+(fini(v.ne)?esc(gen-v.ne):'–')+'</td><td class="nb">'+(fini(n.n)?n.n:'–')+'</td>'+
        '<td class="nb">'+fr(n.ahat!=null?n.ahat:n.a,1)+'</td><td class="nb">'+fr(n.E,2)+'</td>'+
        '<td class="nb"><b>'+fr(n.F,1)+'</b>'+(fini(n.se_F)?' <span class="petit">± '+fr(n.se_F,1)+'</span>':'')+'</td>'+
        '<td class="petit">'+esc(mutes.slice(0,4).join(', ')+(mutes.length>4?'…':''))+'</td></tr>';});
    const mortsG=(dern&&dern.morts)||[],nes=(dern&&dern.naissances)||[];
    S.push('<section><h2>4. La population</h2>'+
      '<p class="explique">Les pilotes vivants, du mieux noté au moins bien noté. Le point est la note F, la barre son incertitude : deux pilotes dont les barres '+
      'se chevauchent ne sont pas vraiment départagés. Un nouveau-né est protégé tant qu\'il n\'a pas '+esc(cfg.protectionCourses||24)+' courses. '+
      '« Âge » = générations depuis sa naissance.</p>'+
      moustaches(R)+
      '<div class="table"><table><thead><tr><th></th><th>pilote</th><th>origine</th><th>âge</th><th>courses</th><th>palier</th><th>écart E</th><th>note F</th><th>réglages changés</th></tr></thead><tbody>'+
      (lignes.join('')||'<tr><td colspan="9" class="vide">Aucun pilote encore.</td></tr>')+'</tbody></table></div>'+
      (dern?'<p class="petit">Génération '+esc(dern.generation)+' : '+nes.length+' naissance(s), '+mortsG.length+' renvoyé(s)'+
        (mortsG.length?' ('+mortsG.map(m=>esc(court(m.id))+(m.raison&&m.raison!=='renvoi'?' : '+esc(m.raison):'')).join(', ')+')':'')+
        ' · '+D.morts.length+' pilotes renvoyés depuis le début.</p>':'')+
      '</section>');}

  /* 5. LA MALEDICTION DU GAGNANT */
  {const Vv=D.validations.filter(v=>v&&v.usage!=='revalidation'&&fini(v.generation));
    const derV=Vv.length?Vv[Vv.length-1]:null;
    S.push('<section><h2>5. La chance du meneur (la « malédiction du gagnant »)</h2>'+
      '<p class="explique">Quand le meneur paraît assez meilleur que le champion, les deux rejouent '+esc((cfg.validation&&cfg.validation.graines)||24)+' courses neuves. '+
      'Le meneur avait souvent été un peu chanceux : son avance fond sur les courses neuves. La ligne <span style="color:var(--meneur)">bleue</span> est son avance '+
      'à l\'entraînement, la <span style="color:var(--champion)">verte</span> son avance sur les courses neuves. Plus elles sont loin l\'une de l\'autre, plus la chance a compté. '+
      'S\'il garde assez d\'avance, il est sacré nouveau champion.</p>'+
      (derV?'<p class="petit">'+Vv.length+' validation(s), '+Vv.filter(v=>v.sacre).length+' sacre(s). Dernière (génération '+esc(derV.generation)+') : '+
        (derV.sacre?'<b class="bien">sacré</b>':'pas sacré')+', chance moyenne '+fr(derV.maledictionMoyenne,2)+' point(s) de note.</p>':'')+
      courbe({series:[
          {nom:'avance à l\'entraînement',couleur:COUL.meneur,points:Vv.map(v=>({x:v.generation,y:v.entrainement&&v.entrainement.dF,info:'meneur '+court(v.meneur)}))},
          {nom:'avance sur les courses neuves',couleur:COUL.champion,points:Vv.map(v=>({x:v.generation,y:v.validation&&v.validation.dF,info:v.sacre?'sacré':'pas sacré'}))}],
        xTitre:'génération',yTitre:'avance de note F du meneur sur le champion',lignesH:[{y:0,texte:'',couleur:'var(--temoin)'}],marques:RP.epoques,
        vide:'Aucune validation encore.'})+
      '</section>');}

  /* 6. LA DIVERSITE */
  {const alarme=cfg.alarmeDistance||0.05,derd=dern&&dern.distance;
    S.push('<section><h2>6. La diversité</h2>'+
      '<p class="explique">À quel point les pilotes vivants diffèrent entre eux (0 = tous pareils, 1 = tous à l\'opposé). Si la courbe passe sous la ligne rouge, '+
      'ils se ressemblent trop et la sélection n\'a plus grand-chose à essayer.</p>'+
      (fini(derd)&&derd<alarme?'<p class="verdict alerte">Attention : diversité à '+fr(derd,3)+', sous le seuil de '+fr(alarme,2)+'.</p>':'')+
      courbe({series:[
          {nom:'réglages',couleur:COUL.meneur,points:G.map(g=>({x:g.generation,y:g.distance}))},
          {nom:'petits réseaux (à partir de la phase B)',couleur:'var(--autre)',pointille:true,points:G.filter(g=>g.distanceW2>0).map(g=>({x:g.generation,y:g.distanceW2}))}],
        xTitre:'génération',yTitre:'distance moyenne entre vivants',yMin:0,lignesH:[{y:alarme,texte:'seuil d\'alarme',couleur:'var(--alerte)'}],marques:RP.phases,hauteur:210})+
      '</section>');}

  /* 7. LA MACHINE */
  {const nm=G.map(g=>{const c=g.courses||{};return {x:g.generation,y:c.demandees?100*(c.nonMesurees||0)/c.demandees:null};});
    const pan=G.map(g=>({x:g.generation,y:lus.pannes[g.generation]||0}));
    const ep=[];let cur=null;
    for(const g of G){if(!cur||cur.id!==g.epoque){cur={id:g.epoque,de:g.generation,a:g.generation,raison:((g.evenements||[]).find(e=>/epoque/.test(e)&&!/notes/.test(e)))||(ep.length?'':'départ'),phases:new Set()};ep.push(cur);}
      cur.a=g.generation;cur.phases.add(g.phase);}
    const ev=[];for(const g of G)for(const e of (g.evenements||[]))ev.push({g:g.generation,e});
    S.push('<section><h2>7. La machine</h2>'+
      '<p class="explique">Combien de courses le PC joue par heure, et ce qui s\'est mal passé. Une course « non mesurée » a planté ou a été jouée dans de mauvaises conditions : '+
      'elle ne compte pour personne. Au-dessus de 2 %, ou dès qu\'une panne apparaît, il faut regarder etat/sortie.log.</p>'+
      courbe({series:[{nom:'courses par heure',couleur:COUL.meneur,points:G.map(g=>({x:g.generation,y:g.debit_h,info:Math.round((g.duree_s||0)/60)+' min'}))}],
        xTitre:'génération',yTitre:'courses jouées par heure',yMin:0,marques:RP.epoques,hauteur:200})+
      courbe({series:[{nom:'courses non mesurées (%)',couleur:'var(--moyen)',points:nm},{nom:'pannes de cerveau',couleur:'var(--alerte)',points:pan}],
        xTitre:'génération',yTitre:'non mesurées (%) et pannes',yMin:0,lignesH:[{y:2,texte:'2 %',couleur:'var(--moyen)'}],hauteur:200})+
      '<h3>Les époques</h3><div class="table"><table><thead><tr><th>époque</th><th>générations</th><th>phases</th><th>pourquoi</th></tr></thead><tbody>'+
      (ep.map(x=>'<tr><td class="code">'+esc(String(x.id||'?').slice(0,12))+'</td><td>'+x.de+' à '+x.a+'</td><td>'+esc([...x.phases].join(', '))+'</td><td>'+esc(x.raison)+'</td></tr>').join('')||
        '<tr><td colspan="4" class="vide">Aucune génération encore.</td></tr>')+'</tbody></table></div>'+
      '<h3>Les derniers événements</h3>'+
      (ev.length?'<ul class="evenements">'+ev.slice(-25).reverse().map(x=>'<li><span class="code">gén. '+esc(x.g)+'</span> '+esc(x.e)+'</li>').join('')+'</ul>':'<p class="vide">Aucun.</p>')+
      '</section>');}

  /* LE PETIT LEXIQUE */
  S.push('<section class="lexique"><h2>Les mots de cette page</h2><dl>'+
    '<dt>Témoin</dt><dd>Le pilote de départ (pilote-voltige), jamais modifié, jamais renvoyé. Il sert de mètre étalon.</dd>'+
    '<dt>Champion</dt><dd>Le meilleur pilote prouvé sur des courses neuves. Au début, c\'est le témoin. Chaque nouveau champion est rangé dans le dossier champions/.</dd>'+
    '<dt>Meneur</dt><dd>Le mieux noté des autres, candidat au titre.</dd>'+
    '<dt>Palier</dt><dd>Jusqu\'où le pilote va dans une course (le niveau atteint), corrigé de la difficulté de la course.</dd>'+
    '<dt>Écart aux joueurs (E)</dt><dd>À quel point sa façon de conduire s\'éloigne de celle des vrais joueurs. 0 = comme eux.</dd>'+
    '<dt>Note F</dt><dd>Le palier moins '+esc((cfg.note&&cfg.note.poidsEcart)||4)+' fois l\'écart. À chaque génération, les moins bonnes notes sont renvoyées.</dd>'+
    '<dt>Époque</dt><dd>Tant que le jeu, les yeux et la main du bot ne changent pas. Quand ils changent, les notes repartent de zéro (les pilotes restent).</dd>'+
    '<dt>Phase</dt><dd>A : on ne règle que des nombres. B puis C : on laisse aussi bouger les deux petits réseaux de neurones.</dd>'+
    '</dl></section>');

  return '<!doctype html>\n<html lang="fr">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n'+
    '<meta http-equiv="refresh" content="300">\n<title>Sélection des bots</title>\n<style>\n'+CSS+'</style>\n</head>\n<body>\n<main>\n'+S.join('\n')+'\n</main>\n</body>\n</html>\n';}

const CSS=[
  ':root{--fond:#f7f6f2;--carte:#ffffff;--texte:#1d2329;--doux:#5f6a75;--trait:#d9dcdf;--grille:#eceef0;--bande:#e3e7ea;',
  '  --champion:#1d9a5b;--temoin:#8a9099;--meneur:#2f6fd6;--autre:#9b6bd3;--bien:#1d9a5b;--moyen:#d98a1a;--alerte:#d2453a;color-scheme:light}',
  '@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--fond:#15181b;--carte:#1e2226;--texte:#e7eaed;--doux:#9aa4ae;--trait:#353b41;--grille:#2a2f34;--bande:#2c3339;',
  '  --champion:#3cc47f;--temoin:#9aa1aa;--meneur:#5e94f0;--autre:#b590e6;--bien:#3cc47f;--moyen:#eba340;--alerte:#ef6a5f;color-scheme:dark}}',
  ':root[data-theme="dark"]{--fond:#15181b;--carte:#1e2226;--texte:#e7eaed;--doux:#9aa4ae;--trait:#353b41;--grille:#2a2f34;--bande:#2c3339;',
  '  --champion:#3cc47f;--temoin:#9aa1aa;--meneur:#5e94f0;--autre:#b590e6;--bien:#3cc47f;--moyen:#eba340;--alerte:#ef6a5f;color-scheme:dark}',
  '*{box-sizing:border-box}',
  'body{margin:0;background:var(--fond);color:var(--texte);font:16px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}',
  'main{max-width:860px;margin:0 auto;padding:20px 16px 60px}',
  'h1{font-size:1.5rem;margin:.2em 0}h2{font-size:1.2rem;margin:0 0 .4em}h3{font-size:1rem;margin:1.2em 0 .4em}',
  'header .sous{color:var(--doux);margin:.2em 0 1em;font-size:.92rem}',
  'section{background:var(--carte);border:1px solid var(--trait);border-radius:10px;padding:16px 18px;margin:14px 0}',
  '.bref pre{margin:0;white-space:pre-wrap;word-break:break-word;font:13px/1.55 ui-monospace,Consolas,monospace}',
  '.explique{color:var(--doux);margin:.2em 0 .8em}.verdict{font-size:1.05rem;margin:.4em 0 .8em}',
  '.petit{font-size:.85rem;color:var(--doux)}.vide{color:var(--doux);font-style:italic}.code{font-family:ui-monospace,Consolas,monospace;font-size:.88em}',
  '.bien{color:var(--bien)}.moyen{color:var(--moyen)}.alerte{color:var(--alerte)}',
  'svg.courbe{display:block;width:100%;height:auto;margin:6px 0 2px;overflow:visible}',
  'svg .grille{stroke:var(--grille);stroke-width:1}svg .axe{fill:var(--doux);font-size:12px}svg .axe.titre{font-size:12.5px}',
  'svg .etiquette{fill:var(--texte);font-size:13px}svg .etiquette.petite{font-size:11px;font-family:ui-monospace,Consolas,monospace}',
  'svg .marque{stroke:var(--doux);stroke-dasharray:2 4;stroke-width:1}svg .marque-texte{fill:var(--doux);font-size:10.5px}',
  'svg .repere{stroke-dasharray:6 4;stroke-width:1.4}svg .bande{fill:var(--bande)}',
  '.legende{display:flex;flex-wrap:wrap;gap:4px 16px;font-size:.85rem;color:var(--doux);margin:0 0 22px}',
  '.legende i{display:inline-block;width:14px;height:4px;border-radius:2px;margin-right:6px;vertical-align:middle}',
  '.table{overflow-x:auto}table{border-collapse:collapse;width:100%;font-size:.88rem}',
  'th,td{text-align:left;padding:4px 8px;border-bottom:1px solid var(--grille);white-space:nowrap}td.nb{text-align:right;font-variant-numeric:tabular-nums}',
  'th{color:var(--doux);font-weight:600}tr.champion td{background:color-mix(in srgb,var(--champion) 12%,transparent)}',
  'tr.temoin td{background:color-mix(in srgb,var(--temoin) 12%,transparent)}tr.meneur td{background:color-mix(in srgb,var(--meneur) 12%,transparent)}',
  'ul.evenements{margin:0;padding-left:1.1em;font-size:.9rem}',
  '.lexique dl{margin:0;display:grid;grid-template-columns:max-content 1fr;gap:4px 14px}.lexique dt{font-weight:600}.lexique dd{margin:0;color:var(--doux)}',
  '@media (max-width:560px){.lexique dl{grid-template-columns:1fr}.lexique dd{margin-bottom:6px}section{padding:14px 12px}}',
  ''].join('\n');

function ecrire(cfg,o){
  const dossier=ET.chemin(cfg,cfg.dossierEtat||'etat');
  const html=page(cfg,o).replace(/\r/g,'');
  const resume=ET.resume(cfg,o).join('\n').replace(/\r/g,'')+'\n';
  const fh=path.join(dossier,'tableau.html'),fr_=path.join(dossier,'resume.txt');
  ecrireAtomique(fh,html);ecrireAtomique(fr_,resume);
  return {html:fh,resume:fr_};}

module.exports={ecrire,page,courbe,barresZ};

if(require.main===module){
  try{
    const o=ET.args(process.argv.slice(2)),cfg=ET.lireConfig(o.config),r=ecrire(cfg);
    process.stdout.write('tableau : '+r.html+'\nresume  : '+r.resume+'\n');
  }catch(e){process.stderr.write('tableau : '+(e&&e.message||e)+'\n');process.exit(1);}
}
