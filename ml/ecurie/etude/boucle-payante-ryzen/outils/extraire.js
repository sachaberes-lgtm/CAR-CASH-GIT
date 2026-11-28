#!/usr/bin/env node
/* ===== LA LIGNEE DE LA BOUCLE PAYANTE DU RYZEN (2026-11-28, Claude : « de c0025 a c0101, generation par generation, a recontroler ») =====
   Node pur, sans dependance, rien de paye, aucune course jouee : tout se lit dans les journaux du labo, copies dans git par la fusion 7f9543955.
     node ml/ecurie/etude/boucle-payante-ryzen/outils/extraire.js
   lit   ml/labo/journal/{cerveaux,generations,validations,depenses}.jsonl et ml/labo/journal/echanges/<id>.json.gz
   ecrit ml/ecurie/etude/boucle-payante-ryzen/donnees/lignee.json   (ce que figure.js dessine, et les chiffres du LISEZ-MOI)
         ml/ecurie/etude/boucle-payante-ryzen/donnees/tableaux.md   (les tableaux du LISEZ-MOI, recalcules)
         ml/ecurie/etude/boucle-payante-ryzen/diffs/<parent>-<enfant>.diff (le code change par chaque sacre, fins de ligne ignorees)
   Et il CONTROLE : le total des depenses de l'etape C2 (21,61 EUR attendus), et que le temoin c0025 est bien pilote-voltige.js.
   Il s'arrete en erreur si un controle tombe. */
const fs=require('fs'),path=require('path'),zlib=require('zlib'),crypto=require('crypto'),{spawnSync}=require('child_process');
const ICI=__dirname,ETUDE=path.join(ICI,'..'),RACINE=path.join(ETUDE,'..','..','..','..');
const J=path.join(RACINE,'ml','labo','journal'),CERV=path.join(RACINE,'ml','labo','cerveaux');
const lire=f=>fs.readFileSync(path.join(J,f),'utf8').split('\n').filter(x=>x.trim()).map(x=>JSON.parse(x));
const ETAPE='C2',SACRES_ATTENDUS=['c0026','c0064','c0072','c0087','c0101'],TOTAL_ATTENDU=21.61;
const r2=x=>Math.round(x*100)/100,r3=x=>Math.round(x*1000)/1000;
const fautes=[];const controle=(ok,txt)=>{console.log((ok?'  ok    ':'  FAUX  ')+txt);if(!ok)fautes.push(txt);};

const C=lire('cerveaux.jsonl').filter(c=>c.etape===ETAPE);
const G=lire('generations.jsonl').filter(g=>g.etape===ETAPE);
const V=lire('validations.jsonl').filter(v=>v.etape===ETAPE);
const D=lire('depenses.jsonl');const DC2=D.filter(d=>d.etape===ETAPE);
const parId=new Map(C.map(c=>[c.id,c]));

/* ---- les sacres, d'apres le journal des validations (role candidat, tient) ---- */
const sacres=V.filter(v=>v.role==='candidat'&&v.tient===true).map(v=>v.id);
console.log('CONTROLES');
controle(JSON.stringify(sacres)===JSON.stringify(SACRES_ATTENDUS),`les sacres du journal : ${sacres.join(', ')}`);

/* ---- l'argent : la somme de l'etape C2 ---- */
const totalC2=r2(DC2.reduce((s,d)=>s+d.euros,0)),totalTout=r2(D.reduce((s,d)=>s+d.euros,0));
controle(Math.abs(totalC2-TOTAL_ATTENDU)<.005,`depenses de l'etape C2 : ${totalC2} EUR sur ${DC2.length} lignes (attendu ${TOTAL_ATTENDU})`);
controle(Math.abs(totalTout-58.53)<.005,`depenses de tout le journal : ${totalTout} EUR (attendu 58,53)`);
const modeles=[...new Set(DC2.map(d=>d.modele))];
controle(modeles.length===1,`un seul modele en C2 : ${modeles.join(', ')}`);

/* ---- le temoin : c0025 = pilote-voltige.js, au caractere pres (fins de ligne ignorees) ---- */
const sansCR=f=>fs.readFileSync(f,'utf8').replace(/\r/g,'');
const h=f=>crypto.createHash('sha1').update(sansCR(f)).digest('hex');
controle(h(path.join(CERV,'c0025-pilote.js'))===h(path.join(RACINE,'ml','ecurie','pilote-voltige.js')),'c0025-pilote.js = ml/ecurie/pilote-voltige.js (fins de ligne ignorees)');

/* ---- generation par generation ---- */
const valeur=n=>[n.mixte||0,n.palier_record||0,n.survie_mediane_s||0];
const mieux=(x,y)=>{for(let i=0;i<x.length;i++){if(x[i]!==y[i])return x[i]>y[i];}return false;};
const memes=(a,b)=>{ /* combien de courses d'un pilote sont, graine par graine, les memes (meme empreinte) que celles d'un autre */
  const m=new Map((b||[]).map(k=>[k.graine,k.empreinte]));let n=0,k=0;
  for(const x of a||[])if(m.has(x.graine)){k++;if(m.get(x.graine)===x.empreinte)n++;}return {memes:n,communes:k};};
const gens=[...new Set(C.map(c=>c.generation))].sort((a,b)=>a-b);
let champion='c0025';const lignes=[];
for(const g of gens){
  const L=C.filter(c=>c.generation===g),gl=G.find(x=>x.generation===g);
  const dep=DC2.filter(d=>d.generation===g),perdues=dep.filter(d=>/perdue/.test(d.pour)).length;
  const parent=g===0?null:L[0].parents[0];
  const promues=L.filter(c=>c.lot==='entrainement'),val=V.filter(v=>v.role==='candidat'&&parId.get(v.id)&&parId.get(v.id).generation===g);
  const sacre=val.find(v=>v.tient===true);
  const P=parent?parId.get(parent):null;
  const battent=P?promues.filter(c=>mieux(valeur(c.note),valeur(P.note))).map(c=>c.id):[];
  const jumeaux=P?promues.filter(c=>memes(c.courses,P.courses).memes===20).map(c=>c.id):[];
  lignes.push({generation:g,date:L[L.length-1].date,parent,champion_avant:champion,
    ecrites:g===0?0:L.length+perdues,perdues,triees:g===0?0:L.length,promues:g===0?[]:promues.map(c=>c.id),
    jumeaux_du_parent:jumeaux,battent_le_parent:battent,validees:val.map(v=>({id:v.id,tient:v.tient,note:v.note.mixte})),
    sacre:sacre?sacre.id:null,euros:r2(dep.reduce((s,d)=>s+d.euros,0)),appels:dep.length,close:!!gl,
    meilleure_au_tri:gl?{id:gl.champion,mixte:gl.note_champion.mixte,parties:gl.note_champion.parties}:null});
  if(sacre)champion=sacre.id;}
controle(r2(lignes.reduce((s,l)=>s+l.euros,0))===totalC2,'la somme generation par generation retombe sur le total C2');

/* ---- les champions : entrainement (20 graines depuis 910000) et validation (20 graines depuis 950000) ---- */
const moy=a=>a.reduce((s,x)=>s+x,0)/a.length;
const champs=['c0025',...SACRES_ATTENDUS],echecs=['c0098','c0103'];
const fiche=id=>{const c=parId.get(id),v=V.find(x=>x.id===id&&(x.role==='candidat'||x.role==='barre'));
  const e=id==='c0025'?null:JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(J,'echanges',id+'.json.gz'))));
  return {id,generation:c.generation,parent:(c.parents||[])[0]||null,raison:c.raison,angle:e?e.angle:null,effort:e?e.effort:null,cout:c.cout||null,
    entrainement:{graines:c.graines,mixte:c.note.mixte,palier_median:c.note.palier_median,palier_moyen:r2(moy(c.note.paliers)),palier_record:c.note.palier_record,ecart:c.note.ecart_joueurs,survie_mediane_s:c.note.survie_mediane_s,paliers:c.courses.map(k=>k.palier)},
    validation:v?{graines:v.graines,role:v.role,tient:v.tient,barre:v.barre,mixte:v.note.mixte,palier_median:v.note.palier_median,palier_moyen:r2(moy(v.note.paliers)),palier_record:v.note.palier_record,ecart:v.note.ecart_joueurs,survie_mediane_s:v.note.survie_mediane_s,paliers:v.courses.map(k=>k.palier)}:null,
    _ce:c.courses,_cv:v?v.courses:null};};
const F=Object.fromEntries([...champs,...echecs].map(id=>[id,fiche(id)]));
/* ce qui change, graine par graine, entre un pilote et son parent */
const changees=(a,b)=>{const m=new Map(b.map(k=>[k.graine,k]));return a.filter(k=>m.get(k.graine).empreinte!==k.empreinte).map(k=>({graine:k.graine,avant:m.get(k.graine).palier,apres:k.palier}));};
for(const id of [...SACRES_ATTENDUS,...echecs]){const f=F[id],p=F[f.parent];
  f.courses_changees={entrainement:changees(f._ce,p._ce),validation:f._cv&&p._cv?changees(f._cv,p._cv):null};}
/* LE PALIER APPARIE : sur les memes graines, la difference de palier course par course (enfant − parent), sa moyenne et l'erreur type de cette
   moyenne (ecart-type des 20 differences / racine de 20). La note mixte ne se decompose pas ainsi (l'ecart aux joueurs se calcule sur toutes les
   parties a la fois) : seul le palier se compare course par course. Un t de 2 ou plus = une difference qu'on ne mettrait pas sur le compte du hasard. */
const apparie=(a,b)=>{const m=new Map(b.map(k=>[k.graine,k.palier]));const d=a.map(k=>k.palier-m.get(k.graine));
  const mo=moy(d),et=Math.sqrt(d.reduce((s,x)=>s+(x-mo)*(x-mo),0)/(d.length-1)),se=et/Math.sqrt(d.length);
  return {n:d.length,moyenne:r2(mo),erreur_type:r2(se),t:se>0?r2(mo/se):null};};
const brut=id=>({e:parId.get(id).courses,v:V.find(x=>x.id===id&&(x.role==='candidat'||x.role==='barre')).courses});
for(const id of [...SACRES_ATTENDUS,...echecs]){const a=brut(id),b=brut(F[id].parent);
  F[id].palier_apparie={entrainement:apparie(a.e,b.e),validation:apparie(a.v,b.v),les_40:apparie(a.e.concat(a.v),b.e.concat(b.v))};}
{const a=brut('c0101'),b=brut('c0025');
  F.c0101.palier_apparie_contre_c0025={entrainement:apparie(a.e,b.e),validation:apparie(a.v,b.v),les_40:apparie(a.e.concat(a.v),b.e.concat(b.v))};}
controle(['c0072','c0087','c0101'].every(id=>F[id].courses_changees.validation.length===0),'c0072, c0087, c0101 : 0 course changee sur 20 en validation (memes empreintes que le parent)');
controle(F.c0064.validation.mixte===-2.35&&F.c0101.validation.mixte===-2.35&&F.c0064.validation.ecart===1.392,'c0064 et c0101 en validation : mixte -2,35, ecart 1,392');
controle(F.c0025.validation.palier_moyen===4.8&&F.c0026.validation.palier_moyen===5.7,'paliers moyens en validation : c0025 4,80, c0026 5,70');

/* ---- les diffs de code ---- */
const DIFFS=path.join(ETUDE,'diffs');fs.mkdirSync(DIFFS,{recursive:true});
for(const id of SACRES_ATTENDUS){const p=F[id].parent;
  const r=spawnSync('git',['diff','--no-index','--ignore-cr-at-eol','-U2',`ml/labo/cerveaux/${p}-pilote.js`,`ml/labo/cerveaux/${id}-pilote.js`],{cwd:RACINE,encoding:'utf8'});
  const t=r.stdout.replace(/\r/g,'');const plus=(t.match(/^\+(?!\+\+)/gm)||[]).length,moins=(t.match(/^-(?!--)/gm)||[]).length;
  F[id].diff={fichier:`diffs/${p}-${id}.diff`,lignes_ajoutees:plus,lignes_retirees:moins};
  fs.writeFileSync(path.join(DIFFS,`${p}-${id}.diff`),t);}

/* ---- ecriture ---- */
for(const f of Object.values(F)){delete f._ce;delete f._cv;}
const sortie={source:'ml/labo/journal (fusion 7f9543955), lu par outils/extraire.js',etape:ETAPE,total_c2_euros:totalC2,total_journal_euros:totalTout,
  appels_c2:DC2.length,jetons_c2:{entree:DC2.reduce((s,d)=>s+d.entree,0),sortie:DC2.reduce((s,d)=>s+d.sortie,0)},modele:modeles[0],
  debut:C[0].date,fin:DC2[DC2.length-1].date,generations:lignes,pilotes:F,
  toutes_les_variantes:C.map(c=>({id:c.id,generation:c.generation,parent:(c.parents||[])[0]||null,lot:c.lot,parties:c.note.parties,mixte:c.note.mixte,palier_median:c.note.palier_median,palier_moyen:r2(moy(c.note.paliers)),palier_record:c.note.palier_record,ecart:c.note.ecart_joueurs}))};
fs.mkdirSync(path.join(ETUDE,'donnees'),{recursive:true});
fs.writeFileSync(path.join(ETUDE,'donnees','lignee.json'),JSON.stringify(sortie,null,1));

/* ---- les tableaux ---- */
const nf=(x,k)=>x==null?'—':(typeof x==='number'?x.toFixed(k==null?2:k).replace('.',',').replace('-','−'):x);
const heure=d=>{const t=new Date(d);t.setUTCHours(t.getUTCHours()+1);return t.toISOString().slice(11,16);};
let md='## Generation par generation\n\n| gen. | fin (heure de Paris) | parent | ecrites | perdues | triees | promues (20 graines) | dont jumelles du parent | battent le parent | validees | sacre | euros |\n|---|---|---|---|---|---|---|---|---|---|---|---|\n';
for(const l of lignes)md+=`| ${l.generation}${l.close?'':' (interrompue)'} | ${heure(l.date)} | ${l.parent||'—'} | ${l.ecrites} | ${l.perdues} | ${l.triees} | ${l.promues.length?l.promues.join(', '):'—'} | ${l.jumeaux_du_parent.length?l.jumeaux_du_parent.join(', '):'—'} | ${l.battent_le_parent.join(', ')||'—'} | ${l.validees.map(v=>v.id+(v.tient?' (tient)':' (ne tient pas)')).join(', ')||'—'} | ${l.sacre||'—'} | ${nf(l.euros)} |\n`;
md+=`| **total** | | | **${lignes.reduce((s,l)=>s+l.ecrites,0)}** | ${lignes.reduce((s,l)=>s+l.perdues,0)} | ${lignes.reduce((s,l)=>s+l.triees,0)} | ${lignes.reduce((s,l)=>s+l.promues.length,0)} | ${lignes.reduce((s,l)=>s+l.jumeaux_du_parent.length,0)} | | ${lignes.reduce((s,l)=>s+l.validees.length,0)} | 5 | **${nf(totalC2)}** |\n\n`;
md+='## Les champions et les deux echecs\n\n| pilote | parent | entrainement : mixte | palier median | palier moyen | record | ecart | validation : mixte | palier median | palier moyen | record | ecart | courses changees vs parent (entr. / valid.) |\n|---|---|---|---|---|---|---|---|---|---|---|---|---|\n';
for(const id of [...champs,...echecs]){const f=F[id],e=f.entrainement,v=f.validation||{},cc=f.courses_changees;
  md+=`| ${id}${echecs.includes(id)?' (echec)':''} | ${f.parent||'—'} | ${nf(e.mixte)} | ${e.palier_median} | ${nf(e.palier_moyen)} | ${e.palier_record} | ${nf(e.ecart,3)} | ${nf(v.mixte)} | ${v.palier_median} | ${nf(v.palier_moyen)} | ${v.palier_record} | ${nf(v.ecart,3)} | ${cc?cc.entrainement.length+' / '+cc.validation.length:'—'} |\n`;}
md+='\n## Les courses qui changent, graine par graine (palier avant → apres)\n\n';
for(const id of [...SACRES_ATTENDUS,...echecs]){const cc=F[id].courses_changees;
  md+=`- **${id}** (parent ${F[id].parent}) — entrainement : ${cc.entrainement.map(x=>x.graine+' '+x.avant+'→'+x.apres).join(', ')||'aucune'} ; validation : ${cc.validation.map(x=>x.graine+' '+x.avant+'→'+x.apres).join(', ')||'aucune'}\n`;}
md+='\n## Le palier apparie : enfant moins parent, course par course sur les memes graines (moyenne ± erreur type, t)\n\n| pilote | contre | entrainement (20) | validation (20) | les 40 |\n|---|---|---|---|---|\n';
const pa=x=>`${nf(x.moyenne)} ± ${nf(x.erreur_type)} (t ${x.t==null?'—':nf(x.t,1)})`;
for(const id of [...SACRES_ATTENDUS,...echecs]){const p=F[id].palier_apparie;md+=`| ${id} | ${F[id].parent} | ${pa(p.entrainement)} | ${pa(p.validation)} | ${pa(p.les_40)} |\n`;}
{const p=F.c0101.palier_apparie_contre_c0025;md+=`| c0101 | c0025 (le temoin) | ${pa(p.entrainement)} | ${pa(p.validation)} | ${pa(p.les_40)} |\n`;}
fs.writeFileSync(path.join(ETUDE,'donnees','tableaux.md'),md);
console.log('\n'+md);
if(fautes.length){console.error('CONTROLES TOMBES :\n'+fautes.join('\n'));process.exit(1);}
console.log('tous les controles tiennent ; ecrit donnees/lignee.json, donnees/tableaux.md, diffs/');
