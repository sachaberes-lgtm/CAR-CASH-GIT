#!/usr/bin/env node
/* ===== L'ARBRE GENEALOGIQUE DES CERVEAUX (2026-11-24, etape 1 bis BOTS-ML : « une page qu'on ouvre dans le navigateur. Un noeud par
   cerveau, relie a son parent ; couleur = etape, taille = note. Un clic montre ce que Claude a change, sa raison, et la video ») =====
   usage : node arbre.js            relit le journal et refabrique arbre.html (a relancer apres chaque generation close)
   La page est UN fichier, sans serveur ni reseau : les donnees sont dedans (elle s'ouvre d'un double clic, et se montre telle quelle).
   Par noeud elle porte : la raison, la note, chaque course, et LES LIGNES CHANGEES par rapport au parent (le code entier reste dans
   cerveaux/ ; seule une racine est montree en entier). Les videos (videos/<course>.webm, hors git) sont liees si elles existent. */
const fs=require('fs'),path=require('path');
const L=require('./labo');

/* les lignes changees entre deux codes : la plus longue suite commune, puis les morceaux changes avec 2 lignes autour */
function ecart(a,b){
  const A=a.split(/\r?\n/),B=b.split(/\r?\n/),n=A.length,m=B.length;
  if(n*m>4e6)return [{t:'~',l:'(codes trop longs pour être comparés ligne à ligne : voir les deux fichiers)'}];
  const T=Array.from({length:n+1},()=>new Uint16Array(m+1));
  for(let i=n-1;i>=0;i--)for(let j=m-1;j>=0;j--)T[i][j]=A[i]===B[j]?T[i+1][j+1]+1:Math.max(T[i+1][j],T[i][j+1]);
  const D=[];let i=0,j=0;
  while(i<n&&j<m){if(A[i]===B[j]){D.push({t:' ',l:A[i],n:j+1});i++;j++;}else if(T[i+1][j]>=T[i][j+1])D.push({t:'-',l:A[i++]});else D.push({t:'+',l:B[j++],n:j});}
  while(i<n)D.push({t:'-',l:A[i++]});while(j<m)D.push({t:'+',l:B[j++],n:j});
  const garde=new Uint8Array(D.length);D.forEach((d,k)=>{if(d.t!==' ')for(let q=Math.max(0,k-2);q<=Math.min(D.length-1,k+2);q++)garde[q]=1;});
  const S=[];let trou=false;D.forEach((d,k)=>{if(garde[k]){S.push(d);trou=false;}else if(!trou){S.push({t:'~',l:'…'});trou=true;}});
  return S.length&&S.some(d=>d.t==='+'||d.t==='-')?S:[];
}
const MESURES=['survie_mediane_s','argent_min','pieces_min','figures_min','air_pct','vols_min','vol_moyen_s','raccourcis_min','distance_m_min','nitro_pct'];
const J=L.lire(L.F.cerveaux),G=L.lire(L.F.generations),V=L.lire(L.F.validations),parId={};for(const l of J)parId[l.id]=l;
const src=l=>{try{return fs.readFileSync(path.join(L.RACINE,l.code),'utf8');}catch(e){return null;}};
const rejeux=fs.existsSync(L.D.rejeux)?fs.readdirSync(L.D.rejeux).filter(f=>/\.json$/.test(f)).map(f=>{try{return JSON.parse(fs.readFileSync(path.join(L.D.rejeux,f),'utf8'));}catch(e){return null;}}).filter(Boolean):[];
const noeuds=J.map(l=>{
  const s=src(l),p=l.parents&&l.parents[0]&&parId[l.parents[0]],sp=p?src(p):null,note={};
  for(const k of MESURES)note[k]=l.note[k];
  const v=V.filter(x=>x.id===l.id).pop(),g=G.find(x=>x.etape===l.etape&&x.generation===l.generation);
  return {id:l.id,nom:l.nom,date:l.date,etape:l.etape,generation:l.generation,parents:l.parents||[],modele:l.modele,raison:l.raison,code:l.code,octets:l.octets,jumeau:l.jumeau,
    jeu:l.jeu&&l.jeu.version,commit:l.jeu&&l.jeu.commit,tmax:l.tmax,note:note,parties:l.note.parties,fins:l.note.causes,cout:l.cout,
    courses:l.courses.map(c=>[c.graine,c.duree_s,c.cause,Math.round(c.argent),c.figures_payees,c.air_pct,c.raccourcis,(c.cartes||[]).join(' > ')]),
    validation:v?{note:MESURES.reduce((o,k)=>(o[k]=v.note[k],o),{}),depart:v.graines&&v.graines.depart,parties:v.note.parties}:null,
    champion:!!(g&&g.champion===l.id),
    ecart:p&&s&&sp?ecart(sp,s):null,source:!p&&s?s.split(/\r?\n/):null,
    rejeux:rejeux.filter(r=>r.cerveau.id===l.id).map(r=>{const c=L.nomCourse(l.id,r.graine);return {course:c,graine:r.graine,pourquoi:r.pourquoi,fin:r.fin.cause,t:r.fin.t,
      video:fs.existsSync(path.join(L.D.videos,c+'.webm'))?'videos/'+c+'.webm':null};})};
});
let etalon=null;try{const e=JSON.parse(fs.readFileSync(path.join(L.DEPOT,'ml','bot','results','etalon.json'),'utf8'));etalon={parties:e.barre.parties,note:MESURES.reduce((o,k)=>(o[k]=e.barre[k],o),{})};}catch(e){}
const DONNEES={fait:new Date().toISOString(),jeu:L.versionJeu(),noeuds:noeuds,generations:G.map(g=>({etape:g.etape,generation:g.generation,champion:g.champion,critere:g.critere,candidats:g.candidats})),
  depenses:L.depenses(),etalon:etalon};

const PAGE=`<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>CASH CAR — l'arbre des cerveaux</title>
<style>
:root{--fond:#f6f4ef;--carte:#fffdf8;--encre:#1d1b16;--doux:#6b665b;--trait:#ddd7c9;--plus:#e3f4e1;--moins:#fbe4e1;--accent:#c2410c}
@media(prefers-color-scheme:dark){:root{--fond:#15140f;--carte:#1e1c16;--encre:#efeadd;--doux:#a39d8e;--trait:#38342a;--plus:#1d3a22;--moins:#4a2320;--accent:#fb923c}}
*{box-sizing:border-box}body{margin:0;background:var(--fond);color:var(--encre);font:14px/1.45 system-ui,Segoe UI,sans-serif}
header{padding:18px 22px 10px;display:flex;flex-wrap:wrap;gap:8px 28px;align-items:baseline;border-bottom:1px solid var(--trait)}
h1{font-size:20px;margin:0;letter-spacing:.02em}header span{color:var(--doux)}header b{color:var(--encre)}
select{font:inherit;padding:3px 6px;background:var(--carte);color:var(--encre);border:1px solid var(--trait);border-radius:6px}
main{display:grid;grid-template-columns:minmax(0,1fr) minmax(340px,520px);min-height:calc(100vh - 60px)}
@media(max-width:900px){main{grid-template-columns:1fr}}
#gauche{overflow:auto;border-right:1px solid var(--trait)}#arbre{display:block}
#fiche{padding:16px 20px 60px;overflow:auto;max-height:calc(100vh - 60px);background:var(--carte)}
#fiche h2{margin:0 0 2px;font-size:18px}#fiche .sous{color:var(--doux);margin-bottom:10px}
.raison{border-left:3px solid var(--accent);padding:6px 10px;margin:10px 0 14px;font-size:15px}
table{border-collapse:collapse;width:100%;margin:6px 0 14px;font-variant-numeric:tabular-nums}.large{overflow-x:auto}
th,td{text-align:right;padding:3px 6px;border-bottom:1px solid var(--trait);white-space:nowrap}th:first-child,td:first-child{text-align:left}
th{color:var(--doux);font-weight:600;font-size:12px}h3{font-size:13px;margin:16px 0 4px;color:var(--doux);text-transform:uppercase;letter-spacing:.06em}
pre{margin:0;font:12px/1.4 ui-monospace,Consolas,monospace;overflow:auto;border:1px solid var(--trait);border-radius:6px;max-height:420px}
pre div{padding:0 8px;white-space:pre}pre .p{background:var(--plus)}pre .m{background:var(--moins)}pre .t{color:var(--doux);text-align:center}
.mieux{color:#15803d}.pire{color:#b91c1c}@media(prefers-color-scheme:dark){.mieux{color:#4ade80}.pire{color:#f87171}}
.noeud{cursor:pointer}.noeud text{font-size:11px;fill:var(--encre);pointer-events:none}.col{font-size:12px;fill:var(--doux)}
.lien{fill:none;stroke:var(--trait);stroke-width:1.5}.lien.vif{stroke:var(--accent);stroke-width:2.5}
#courbes{padding:8px 22px 24px;border-top:1px solid var(--trait)}#courbes svg{max-width:100%}
code{font:12px ui-monospace,Consolas,monospace;background:var(--fond);padding:1px 5px;border-radius:4px}
.vide{color:var(--doux);padding:30px 22px}
</style></head><body>
<header><h1>L'arbre des cerveaux</h1><span id="compte"></span><span>taille des nœuds : <select id="mesure"></select></span><span id="sous"></span></header>
<main><div id="gauche"><svg id="arbre"></svg><div id="courbes"></div></div><aside id="fiche"></aside></main>
<script>
const D=__DONNEES__;
const NOMS={survie_mediane_s:'survie médiane (s)',argent_min:'argent par minute',pieces_min:'pièces par minute',figures_min:'figures posées par minute',air_pct:'temps en l\\'air (%)',
  vols_min:'vols par minute',vol_moyen_s:'vol moyen (s)',raccourcis_min:'raccourcis par minute',distance_m_min:'distance (m par minute)',nitro_pct:'nitro tenue (%)'};
const TEINTES=['#2563eb','#c2410c','#15803d','#7c3aed','#b45309','#0e7490','#be185d','#4d7c0f','#475569'];
const $=id=>document.getElementById(id),esc=s=>String(s==null?'':s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
const f=x=>x==null?'—':(Math.abs(x)>=1000?Math.round(x).toLocaleString('fr-FR'):String(Math.round(x*100)/100).replace('.',','));
const N=D.noeuds,par={};N.forEach(n=>par[n.id]=n);
const etapes=[...new Set(N.map(n=>n.etape))],teinte=e=>TEINTES[etapes.indexOf(e)%TEINTES.length];
let mesure=localStorage.getItem('arbreMesure')||'argent_min',choisi=null;
$('mesure').innerHTML=Object.keys(NOMS).map(k=>'<option value="'+k+'">'+NOMS[k]+'</option>').join('');$('mesure').value=mesure;
$('mesure').onchange=e=>{mesure=e.target.value;try{localStorage.setItem('arbreMesure',mesure);}catch(x){}dessine();};
const dep=D.depenses;
$('compte').innerHTML='<b>'+N.length+'</b> cerveau'+(N.length>1?'x':'')+' · <b>'+D.generations.length+'</b> génération'+(D.generations.length>1?'s':'')+' close'+(D.generations.length>1?'s':'')+' · <b>'+f(dep.total)+' €</b> d\\'API'+(dep.aChiffrer?' (+ '+dep.aChiffrer+' appel(s) sans prix)':'');
$('sous').textContent='jeu '+D.jeu.version+' · page faite le '+new Date(D.fait).toLocaleString('fr-FR');

/* LA MISE EN PLACE : une colonne par generation (dans l'ordre ou elles sont nees), un noeud sous l'autre, les enfants pres de leur parent */
function place(){
  const cles=[];N.forEach(n=>{const k=n.etape+'|'+n.generation;if(!cles.includes(k))cles.push(k);});
  const pos={},cols=cles.map((k,c)=>{const A=N.filter(n=>n.etape+'|'+n.generation===k);
    A.sort((a,b)=>{const ya=a.parents[0]&&pos[a.parents[0]]?pos[a.parents[0]].y:0,yb=b.parents[0]&&pos[b.parents[0]]?pos[b.parents[0]].y:0;return ya-yb||(b.note[mesure]||0)-(a.note[mesure]||0);});
    A.forEach((n,i)=>pos[n.id]={x:110+c*170,y:78+i*44});return {k:k,n:A.length};});
  return {pos:pos,cols:cols};
}
function dessine(){
  const P=place(),max=Math.max(1e-9,...N.map(n=>n.note[mesure]||0)),ray=n=>6+15*Math.sqrt(Math.max(0,n.note[mesure]||0)/max);
  const W=Math.max(520,110+P.cols.length*170+90),H=Math.max(260,78+Math.max(1,...P.cols.map(c=>c.n))*44+20);
  let s='';
  P.cols.forEach((c,i)=>{const q=c.k.split('|');s+='<text class="col" x="'+(110+i*170)+'" y="30" text-anchor="middle">étape '+esc(q[0])+' · génération '+esc(q[1])+'</text><text class="col" x="'+(110+i*170)+'" y="46" text-anchor="middle">'+c.n+' candidat'+(c.n>1?'s':'')+'</text>';});
  N.forEach(n=>n.parents.forEach(p=>{const a=P.pos[p],b=P.pos[n.id];if(!a||!b)return;const vif=choisi&&(choisi===n.id||choisi===p);
    s+='<path class="lien'+(vif?' vif':'')+'" d="M'+a.x+','+a.y+(a.x===b.x?' C'+(a.x-60)+','+a.y+' '+(b.x-60)+','+b.y:' C'+(a.x+85)+','+a.y+' '+(b.x-85)+','+b.y)+' '+b.x+','+b.y+'"/>';}));
  N.forEach(n=>{const p=P.pos[n.id],r=ray(n);
    s+='<g class="noeud" data-id="'+n.id+'"><circle cx="'+p.x+'" cy="'+p.y+'" r="'+r.toFixed(1)+'" fill="'+teinte(n.etape)+'" fill-opacity="'+(choisi===n.id?1:.78)+'" stroke="'+(n.champion?'var(--encre)':'none')+'" stroke-width="'+(n.champion?2.5:0)+'"/>'
      +'<text x="'+(p.x+r+5)+'" y="'+(p.y+4)+'">'+esc(n.id)+' '+esc(n.nom)+'</text><title>'+esc(n.id+' '+n.nom+' — '+NOMS[mesure]+' : '+f(n.note[mesure]))+'</title></g>';});
  const svg=$('arbre');svg.setAttribute('width',W);svg.setAttribute('height',H);svg.innerHTML=s;
  svg.querySelectorAll('.noeud').forEach(g=>g.onclick=()=>{choisi=g.dataset.id;dessine();fiche();});
  courbes();
}
/* LA FICHE : la raison, la note (contre le parent et contre les joueurs), ce qui a change dans le code, chaque course, les rejeux gardes */
function fiche(){
  const n=par[choisi];if(!n){$('fiche').innerHTML='<div class="vide">Clique un nœud : sa raison, sa note, ce qui a changé dans son code, ses courses.</div>';return;}
  const p=n.parents[0]&&par[n.parents[0]];
  let h='<h2>'+esc(n.nom)+' <span style="color:var(--doux);font-weight:400">'+esc(n.id)+'</span>'+(n.champion?' · champion de sa génération':'')+'</h2>';
  h+='<div class="sous">étape '+esc(n.etape)+' · génération '+n.generation+' · écrit par <b>'+esc(n.modele==='main'?'la main (pas l\\'API)':n.modele)+'</b> · '+new Date(n.date).toLocaleDateString('fr-FR')
    +' · '+(n.parents.length?'descend de '+n.parents.map(esc).join(', '):'une racine')+(n.jumeau?' · même code que '+esc(n.jumeau):'')+'</div>';
  h+='<div class="raison">'+esc(n.raison)+'</div>';
  h+='<h3>La note · '+n.parties+' courses, '+n.tmax+' s au plus, jeu '+esc(n.jeu)+'</h3><div class="large"><table><tr><th>mesure</th><th>lui</th>'+(p?'<th>parent '+esc(p.id)+'</th><th>écart</th>':'')+(n.validation?'<th>graines neuves</th>':'')+(D.etalon?'<th>les joueurs</th>':'')+'</tr>';
  for(const k in NOMS){const v=n.note[k];h+='<tr><td>'+NOMS[k]+'</td><td><b>'+f(v)+'</b></td>';
    if(p){const q=p.note[k],d=v-q;h+='<td>'+f(q)+'</td><td class="'+(d>0?'mieux':d<0?'pire':'')+'">'+(d>0?'+':'')+f(d)+'</td>';}
    if(n.validation)h+='<td>'+f(n.validation.note[k])+'</td>';if(D.etalon)h+='<td>'+f(D.etalon.note[k])+'</td>';h+='</tr>';}
  h+='</table></div>';
  if(n.fins)h+='<div class="sous">fins : '+Object.entries(n.fins).sort((a,b)=>b[1]-a[1]).map(e=>esc(e[0])+' '+e[1]).join(' · ')+(D.etalon?' · les joueurs : '+D.etalon.parties+' parties (provisoire tant qu\\'il n\\'y en a pas 20)':'')+'</div>';
  if(n.cout)h+='<h3>Le coût</h3><div>'+f(n.cout.entree)+' jetons lus, '+f(n.cout.sortie)+' écrits · '+(n.cout.euros==null?'prix à chiffrer':f(n.cout.euros)+' €')+'</div>';
  const lignes=n.ecart||null;
  if(lignes){h+='<h3>Ce qui a changé dans le code (contre '+esc(p.id)+')</h3>'+(lignes.length?'<pre>'+lignes.map(d=>'<div class="'+(d.t==='+'?'p':d.t==='-'?'m':d.t==='~'?'t':'')+'">'+(d.t==='~'?'':d.t+' ')+esc(d.l)+'</div>').join('')+'</pre>':'<div class="sous">rien : le même code que son parent</div>');}
  else if(n.source)h+='<h3>Le code (une racine : en entier)</h3><pre>'+n.source.map(l=>'<div>'+esc(l)+'</div>').join('')+'</pre>';
  h+='<div class="sous" style="margin-top:6px">le fichier : <a href="'+esc(n.code)+'">'+esc(n.code)+'</a> ('+f(n.octets)+' octets)</div>';
  if(n.rejeux.length){h+='<h3>Les courses gardées</h3>';for(const r of n.rejeux)h+='<div style="margin:0 0 8px"><b>'+esc(r.course)+'</b> — '+r.pourquoi.map(esc).join(' ; ')+' · '+f(r.t)+' s, fin : '+esc(r.fin)
    +(r.video?'<br><video controls preload="none" src="'+esc(r.video)+'" style="max-width:100%;margin-top:4px"></video>':'<br><code>node rejouer.js '+esc(r.course)+'</code> · pas encore filmée')+'</div>';}
  h+='<h3>Ses courses</h3><table><tr><th>graine</th><th>durée</th><th>fin</th><th>argent</th><th>figures</th><th>air %</th><th>racc.</th></tr>'
    +n.courses.map(c=>'<tr title="'+esc(c[7])+'"><td>'+c[0]+'</td><td>'+f(c[1])+' s</td><td>'+esc(c[2])+'</td><td>'+f(c[3])+'</td><td>'+c[4]+'</td><td>'+f(c[5])+'</td><td>'+c[6]+'</td></tr>').join('')+'</table>';
  $('fiche').innerHTML=h;
}
/* LES COURBES : le champion de chaque generation close pour la mesure choisie (et la barre des joueurs), puis les euros par etape */
function courbes(){
  const C=D.generations.map(g=>({g:g,n:par[g.champion]})).filter(x=>x.n);let h='';
  if(C.length){const w=Math.max(360,70+C.length*70),H=170,vals=C.map(x=>x.n.note[mesure]||0),e=D.etalon?D.etalon.note[mesure]:null,max=Math.max(1e-9,...vals,e||0)*1.1,
      X=i=>55+i*((w-80)/Math.max(1,C.length-1||1)),Y=v=>H-28-(H-50)*v/max;
    h+='<h3>Le champion de chaque génération — '+NOMS[mesure]+'</h3><svg width="'+w+'" height="'+H+'">';
    if(e!=null)h+='<line x1="40" x2="'+(w-10)+'" y1="'+Y(e)+'" y2="'+Y(e)+'" stroke="var(--accent)" stroke-dasharray="5 4"/><text x="'+(w-12)+'" y="'+(Y(e)-5)+'" text-anchor="end" font-size="11" fill="var(--accent)">les joueurs : '+f(e)+'</text>';
    h+='<polyline fill="none" stroke="var(--encre)" stroke-width="2" points="'+C.map((x,i)=>X(i)+','+Y(vals[i])).join(' ')+'"/>';
    C.forEach((x,i)=>{h+='<circle cx="'+X(i)+'" cy="'+Y(vals[i])+'" r="4.5" fill="'+teinte(x.g.etape)+'"/><text x="'+X(i)+'" y="'+(Y(vals[i])-9)+'" text-anchor="middle" font-size="11" fill="var(--encre)">'+f(vals[i])+'</text>'
      +'<text x="'+X(i)+'" y="'+(H-8)+'" text-anchor="middle" font-size="11" fill="var(--doux)">e'+esc(x.g.etape)+' g'+x.g.generation+'</text>';});
    h+='</svg>';}
  else h+='<h3>Le champion de chaque génération</h3><div class="sous">aucune génération close pour l\\'instant</div>';
  h+='<h3>Les euros d\\'API par étape</h3>'+(dep.etapes.length?'<table style="max-width:520px"><tr><th>étape</th><th>appels</th><th>jetons lus</th><th>jetons écrits</th><th>euros</th></tr>'
    +dep.etapes.map(p=>'<tr><td>étape '+esc(p.etape)+'</td><td>'+p.appels+'</td><td>'+f(p.entree)+'</td><td>'+f(p.sortie)+'</td><td>'+f(p.euros)+' €'+(p.aChiffrer?' (+'+p.aChiffrer+' sans prix)':'')+'</td></tr>').join('')
    +'<tr><td><b>total</b></td><td></td><td></td><td></td><td><b>'+f(dep.total)+' €</b></td></tr></table>':'<div class="sous">0 € : aucun appel à l\\'API inscrit</div>');
  $('courbes').innerHTML=h;
}
if(!N.length){$('gauche').innerHTML='<div class="vide">Le journal est vide : aucun cerveau inscrit (node inscrire.js …).</div>';}
else{choisi=(D.generations.length?D.generations[D.generations.length-1].champion:null)||N[N.length-1].id;dessine();}
fiche();
</script></body></html>`;
const sortie=path.join(L.RACINE,'arbre.html');
fs.writeFileSync(sortie,PAGE.replace('__DONNEES__',()=>JSON.stringify(DONNEES).replace(/</g,'\\u003c')));
console.log(`arbre.html : ${noeuds.length} noeud(s), ${G.length} generation(s) close(s), ${Math.round(fs.statSync(sortie).size/1024)} Ko — ${sortie}`);
