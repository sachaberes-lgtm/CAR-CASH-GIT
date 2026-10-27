// Preuve sans navigateur (badge-record) : sur un iPhone SANS color-mix() (iOS 15, 16.0, 16.1 — l'app vise iOS 15), le badge « RECORD ! »
// de l'écran de fin (`.hCard em` dans la carte AURA) ne doit pas avoir la MÊME couleur pour son texte et son fond.
// Scénario : trois règles se superposent sur `.hCard em` — charte-2 (texte --auT, fond dégradé or), charte-4 (`html .hCard em` : fond
// var(--hc)), charte-6 (`html .hCard em` : texte var(--hc), fond color-mix(...)). Sans color-mix() la déclaration `background` de
// charte-6 est REJETÉE (invalide) mais son `color:var(--hc)` reste : le fond qui l'emporte est celui de charte-4, var(--hc) = rose
// de l'aura (#ff7ad5) : texte rose sur fond rose, le badge est un aplat sans lettres.
// On extrait le VRAI CSS de index.html (blocs <style>), on retire les déclarations à color-mix() comme le ferait un Safari ancien,
// on garde les blocs `@supports not (color:color-mix(...))` (vrais pour lui), on joue la cascade (spécificité, ordre, !important) sur
// l'élément html > body.touch > #overlay > #mob > #mDead.on > .hCard.hAura > em, et on compare le texte au fond après var().
// Usage : node preuve-badge-record.cjs "<index.html>"   Sort 0 si texte ≠ fond sur l'ancien Safari ET sur le Safari récent, 1 sinon.
const fs=require('fs');
const html=fs.readFileSync(process.argv[2],'utf8');
const blocs=[];
{let i=0;while(i<html.length){const lt=html.indexOf('<',i);if(lt<0)break;
  if(html.startsWith('<!--',lt)){const e=html.indexOf('-->',lt+4);i=e<0?html.length:e+3;continue;}
  const m=/^<(script|style)\b[^>]*>/i.exec(html.slice(lt,lt+400));
  if(m){const tag=m[1].toLowerCase(),deb=lt+m[0].length,e=html.toLowerCase().indexOf('</'+tag,deb),fin=e<0?html.length:e;
    if(tag==='style')blocs.push(html.slice(deb,fin));i=fin;continue;}
  i=lt+1;}}
/* --- analyse CSS minimale : règles { sel, decl:[[prop,val,important]], ordre, supportsNot } ; at-rules @media/@keyframes ignorées --- */
let ordre=0;const regles=[];
function coupe(s,sep){const out=[];let d=0,q=null,cur='';for(let i=0;i<s.length;i++){const c=s[i];
  if(q){cur+=c;if(c==='\\'){cur+=s[++i]||'';}else if(c===q)q=null;continue;}
  if(c==='"'||c==="'"){q=c;cur+=c;continue;}
  if(c==='('||c==='[')d++;if(c===')'||c===']')d--;
  if(c===sep&&d===0){out.push(cur);cur='';}else cur+=c;}out.push(cur);return out;}
function decls(corps){return coupe(corps,';').map(x=>x.trim()).filter(Boolean).map(x=>{const k=x.indexOf(':');if(k<0)return null;
  let v=x.slice(k+1).trim(),imp=false;if(/!\s*important\s*$/i.test(v)){imp=true;v=v.replace(/!\s*important\s*$/i,'').trim();}
  return [x.slice(0,k).trim().toLowerCase(),v,imp];}).filter(Boolean);}
function analyse(t,ctx){let i=0;
  while(i<t.length){
    while(i<t.length&&/\s/.test(t[i]))i++;if(i>=t.length)break;
    let j=i,d=0,q=null;while(j<t.length){const c=t[j];
      if(q){if(c==='\\')j++;else if(c===q)q=null;j++;continue;}
      if(c==='"'||c==="'"){q=c;j++;continue;}
      if(c==='('||c==='[')d++;if(c===')'||c===']')d--;
      if(c==='{'&&d===0)break;if(c===';'&&d===0){break;}j++;}
    if(t[j]===';'){i=j+1;continue;}
    const prelude=t.slice(i,j).trim();let prof=0,k=j;
    for(;k<t.length;k++){if(t[k]==='{')prof++;else if(t[k]==='}'){prof--;if(prof===0)break;}}
    const corps=t.slice(j+1,k);i=k+1;
    if(prelude[0]==='@'){
      if(/^@supports\s+not\b/i.test(prelude))analyse(corps,{supportsNot:true});
      else if(/^@supports\b/i.test(prelude))analyse(corps,{supportsPos:true});
      /* @media, @keyframes, @font-face, @container : hors du scénario (téléphone debout, sans condition) */
      continue;}
    for(const sel of coupe(prelude,',')){const s=sel.trim();if(s)regles.push({sel:s,decl:decls(corps),ordre:ordre++,supportsNot:!!ctx.supportsNot,supportsPos:!!ctx.supportsPos});}
  }}
for(const b of blocs)analyse(b.replace(/\/\*[\s\S]*?\*\//g,''),{});
/* --- sélecteurs : composés séparés par ' ' ou '>' ; type, #id, .classe, :not(simple), :root ; le reste = ne correspond pas --- */
function composes(sel){const out=[];let cur='',d=0,comb=' ';
  for(let i=0;i<sel.length;i++){const c=sel[i];if(c==='(')d++;if(c===')')d--;
    if(d===0&&(c===' '||c==='>')){if(cur){out.push({s:cur,comb:comb});cur='';comb=' ';}if(c==='>')comb='>';continue;}
    cur+=c;}
  if(cur)out.push({s:cur,comb:comb});return out;}
function simple(s){const o={tag:null,ids:[],cls:[],not:[],ok:true,spec:[0,0,0]};
  const re=/(::?[a-z-]+(?:\((?:[^()]|\([^()]*\))*\))?)|#([\w-]+)|\.([\w-]+)|(\*|[a-zA-Z][\w-]*)/g;let m;
  while((m=re.exec(s))){
    if(m[1]){const p=m[1];if(p.startsWith('::')){o.ok=false;}
      else if(/^:not\(/.test(p)){const inner=p.slice(5,-1);const si=simple(inner);o.not.push(si);o.spec[0]+=si.spec[0];o.spec[1]+=si.spec[1];o.spec[2]+=si.spec[2];}
      else{o.ok=false;}}
    else if(m[2]){o.ids.push(m[2]);o.spec[0]++;}
    else if(m[3]){o.cls.push(m[3]);o.spec[1]++;}
    else if(m[4]&&m[4]!=='*'){o.tag=m[4].toLowerCase();o.spec[2]++;}}
  return o;}
function correspond(el,sp){if(!sp.ok)return false;if(sp.tag&&sp.tag!==el.tag)return false;
  for(const id of sp.ids)if(el.id!==id)return false;for(const c of sp.cls)if(!el.cls.includes(c))return false;
  for(const n of sp.not)if(correspond(el,n))return false;return true;}
function matche(chaine,idx,cs,ci){ /* cs[ci] doit correspondre à chaine[idx] ; on remonte */
  if(!correspond(chaine[idx],cs[ci].sp))return false;if(ci===0)return true;
  const comb=cs[ci].comb;
  if(comb==='>')return idx>0&&matche(chaine,idx-1,cs,ci-1);
  for(let a=idx-1;a>=0;a--)if(matche(chaine,a,cs,ci-1))return true;return false;}
/* l'élément testé et sa lignée (html → em) */
const CHAINE=[{tag:'html',id:'',cls:[]},{tag:'body',id:'',cls:['touch']},{tag:'div',id:'overlay',cls:[]},{tag:'div',id:'mob',cls:[]},
  {tag:'div',id:'mDead',cls:['mscr','on']},{tag:'div',id:'',cls:['hCard','hAura']},{tag:'em',id:'',cls:[]}];
const cache=regles.map(r=>{const cs=composes(r.sel).map(x=>({comb:x.comb,sp:simple(x.s)}));let sp=[0,0,0];cs.forEach(c=>{sp[0]+=c.sp.spec[0];sp[1]+=c.sp.spec[1];sp[2]+=c.sp.spec[2];});return {r:r,cs:cs,spec:sp};});
function varExpand(v,env,prof){prof=prof||0;if(prof>12)return v;
  return v.replace(/var\(\s*(--[\w-]+)\s*(?:,((?:[^()]|\([^()]*\))*))?\)/g,function(_,nom,repli){
    if(env[nom]!==undefined)return varExpand(env[nom],env,prof+1);return repli!==undefined?varExpand(repli.trim(),env,prof+1):'';});}
function cascade(chaineIdx,ancien){ /* déclarations gagnantes de l'élément chaine[chaineIdx] */
  const gagnant={};
  for(const c of cache){const r=c.r;
    if(r.supportsNot&&!ancien)continue;           /* @supports not (color-mix) : vrai seulement pour l'ancien Safari */
    if(r.supportsPos&&ancien)continue;
    if(!matche(CHAINE,chaineIdx,c.cs,c.cs.length-1))continue;
    for(const dd of r.decl){const prop=dd[0],val=dd[1],imp=dd[2];
      if(ancien&&!prop.startsWith('--')&&/color-mix\(/.test(val))continue;   /* déclaration invalide : rejetée à l'analyse */
      const cle=[imp?1:0,c.spec[0],c.spec[1],c.spec[2],r.ordre];
      const g=gagnant[prop];if(!g||plusFort(cle,g.cle))gagnant[prop]={val:val,cle:cle};}}
  return gagnant;}
function plusFort(a,b){for(let i=0;i<a.length;i++){if(a[i]!==b[i])return a[i]>b[i];}return false;}
/* variables personnalisées : héritées de la lignée, du plus ancien au plus récent (:root compris) */
function env(ancien){const e={};
  /* :root est traité à part : « :root » seul */
  for(const r of regles){if(/^:root$/.test(r.sel)&&!r.supportsNot)for(const d of r.decl)if(d[0].startsWith('--'))e[d[0]]=d[1];}
  for(let i=0;i<CHAINE.length;i++){const g=cascade(i,ancien);for(const k in g)if(k.startsWith('--'))e[k]=g[k].val;}
  return e;}
function couleurs(ancien){
  const e=env(ancien),g=cascade(CHAINE.length-1,ancien);
  const col=g.color?varExpand(g.color.val,e).trim().toLowerCase():'(héritée)';
  let bg='';if(g.background){const v=varExpand(g.background.val,e).trim().toLowerCase();bg=/gradient|url\(/.test(v)?'(image)':v;}
  if(g['background-color']&&(!g.background||plusFort(g['background-color'].cle,g.background.cle)))bg=varExpand(g['background-color'].val,e).trim().toLowerCase();
  return {col:col,bg:bg||'(aucun)'};}
const ko=[];
for(const [nom,ancien] of [['Safari sans color-mix (iOS 15 à 16.1)',true],['Safari récent (iOS 16.2 et +)',false]]){
  const c=couleurs(ancien);
  console.log('  '+nom+' : texte '+c.col+' / fond '+c.bg);
  if(c.col===c.bg)ko.push(nom+' : le texte du badge « RECORD ! » ('+c.col+') est de la MÊME couleur que son fond — le badge est un aplat sans lettres');
}
if(!regles.some(r=>/hCard em/.test(r.sel))){console.log('PREUVE KO — repère perdu (aucune règle « .hCard em »)');process.exit(1);}
console.log(ko.length?'PREUVE KO —\n - '+ko.join('\n - '):'PREUVE OK — le badge RECORD ! reste lisible (texte ≠ fond) avec et sans color-mix()');
process.exit(ko.length?1:0);
