/* ===== LES PAROLES DE SACHA (27/11/2026, Sacha : « il faut qu'on garde des traces de tous les process, pour un portfolio ») =====
   Sort, datés (heure UTC), les messages que Sacha a tapés dans les conversations Claude Code du chantier : ni les retours d'outils,
   ni les rappels du système, ni les résumés. Les messages tapés PENDANT que Claude travaillait sont rangés à part par Claude Code
   (« queued_command ») : ils sont pris aussi. C'est la seule source datée de ses décisions ; Claude Code efface ses conversations
   au bout d'un temps, donc on refait ce relevé à chaque journée de travail.
   Usage : node ml/ecurie/portfolio/outils/paroles.js <dossier des conversations> <fichier de sortie.md>
   Le relevé est brut (fautes de frappe, consignes collées) : il reste HORS git tant que Sacha n'a pas dit de le publier. */
const fs=require('fs'),path=require('path');
const DIR=process.argv[2],SORTIE=process.argv[3];
if(!DIR||!SORTIE){console.error('usage : node paroles.js <dossier des conversations .jsonl> <sortie.md>');process.exit(2);}
const lignes=[],vus=new Set();
const propre=function(t){
  t=String(t||'').replace(/<system-reminder>[\s\S]*?<\/system-reminder>/g,'').replace(/<[a-z-]+>[\s\S]*?<\/[a-z-]+>/g,function(m){return m.length>400?'':m;}).trim();
  if(!t||t.startsWith('This session is being continued')||t.startsWith('Caveat:')||t.startsWith('<command-')||t.startsWith('<local-command')||t.startsWith('<task-notification')||t.startsWith('[Request interrupted'))return '';
  if(/sk-ant-|api[_-]?key\s*[:=]/i.test(t))return '[message retiré : il contenait un secret]';
  return t.length>1800?t.slice(0,1800)+' […]':t;
};
const garder=function(ts,s,t){t=propre(t);if(!t)return;const cle=s+'|'+t.slice(0,200);if(vus.has(cle))return;vus.add(cle);lignes.push({ts:ts||'',s:s,t:t});};
for(const f of fs.readdirSync(DIR).filter(function(x){return x.endsWith('.jsonl');})){
  for(const l of fs.readFileSync(path.join(DIR,f),'utf8').split('\n')){
    if(!l)continue;
    const tapé=l.indexOf('"type":"user"')>=0,file=l.indexOf('"queued_command"')>=0;
    if(!tapé&&!file)continue;
    let o;try{o=JSON.parse(l);}catch(e){continue;}
    if(o.isSidechain)continue;
    if(o.type==='attachment'&&o.attachment&&o.attachment.type==='queued_command'){
      const a=o.attachment;if(a.origin&&a.origin.kind&&a.origin.kind!=='human')continue;
      const p=Array.isArray(a.prompt)?a.prompt.filter(function(b){return b&&b.type==='text';}).map(function(b){return b.text;}).join(' '):a.prompt;
      garder(o.timestamp,f.slice(0,8),p);continue;
    }
    if(o.type!=='user'||o.isMeta||o.isCompactSummary||!o.message)continue;
    const c=o.message.content;let t='';
    if(typeof c==='string')t=c;
    else if(Array.isArray(c)){if(c.some(function(b){return b.type==='tool_result';}))continue;t=c.filter(function(b){return b.type==='text';}).map(function(b){return b.text;}).join('\n');}
    garder(o.timestamp,f.slice(0,8),t);
  }
}
lignes.sort(function(a,b){return a.ts<b.ts?-1:a.ts>b.ts?1:0;});
let out='# Les messages de Sacha pendant le chantier des bots (relevé des conversations Claude Code, heure UTC)\n',jour='';
for(const x of lignes){const j=x.ts.slice(0,10);if(j!==jour){jour=j;out+='\n## '+j+'\n\n';}out+='- **'+x.ts.slice(11,16)+'** (session '+x.s+') : '+x.t.replace(/\n+/g,' ⏎ ')+'\n';}
fs.writeFileSync(SORTIE,out);
const parJour={};for(const x of lignes){const j=x.ts.slice(0,10);parJour[j]=(parJour[j]||0)+1;}
console.log(lignes.length+' messages -> '+SORTIE+' '+JSON.stringify(parJour));
