/* Lit ml/labo/journal/{cerveaux,validations}.jsonl et rend, par cerveau : palier median, record, E (si note), parties, tmax, regime, epoque du jeu.
   Lecture seule. node ml/ecurie/etude/echelle-de-bots/existant/paliers-du-labo.js */
const fs=require('fs'),path=require('path');
const J=path.join(__dirname,'..','..','..','..','labo','journal');
const lire=f=>fs.readFileSync(path.join(J,f),'utf8').split('\n').filter(Boolean).map(l=>JSON.parse(l));
const out=[];
for(const c of lire('cerveaux.jsonl')){const n=c.note||{};out.push({src:'cerveaux',id:c.id,nom:c.nom,date:(c.date||'').slice(0,10),etape:c.etape,gen:c.generation,parents:(c.parents||[]).join('+'),tmax:c.tmax,regime:(c.jeu||{}).regime||'',jeu:(c.jeu||{}).version,graines:c.graines?c.graines.n+'@'+c.graines.depart:'',parties:n.parties,med:n.palier_median,rec:n.palier_record,E:n.ecart_joueurs??n.E??'',survie:n.survie_mediane_s,paliers:(n.paliers||[]).join(',')});}
for(const v of lire('validations.jsonl')){const n=v.note||{};out.push({src:'validation',id:v.id,date:(v.date||'').slice(0,10),tmax:v.tmax,regime:(v.jeu||{}).regime||'',jeu:(v.jeu||{}).version,graines:v.graines?v.graines.n+'@'+v.graines.depart:'',parties:n.parties,med:n.palier_median,rec:n.palier_record,E:n.E??'',survie:n.survie_mediane_s,paliers:(n.paliers||[]).join(',')});}
const cles=new Set();out.forEach(o=>Object.keys(o).forEach(k=>cles.add(k)));
for(const o of out) if(o.med!==undefined) console.log([o.src,o.id,o.nom||'',o.date,'etape='+(o.etape??''),'tmax='+o.tmax,o.regime,o.graines,'n='+o.parties,'med='+o.med,'rec='+o.rec,'E='+o.E,'surv='+o.survie].join(' | '));
console.log('sans palier :',out.filter(o=>o.med===undefined).map(o=>o.id).join(' '));
