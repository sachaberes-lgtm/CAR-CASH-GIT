// Preuve sans navigateur (media-niveau3) : toute requête @media du jeu doit rester lisible par Safari < 16.4 (iOS 15 = cible de l'app).
// Scénario : `@media not ((orientation:landscape) and (max-height:540px))` est de la syntaxe Media Queries NIVEAU 4 (négation d'une
// condition entre parenthèses). Safari n'a le nouvel analyseur de requêtes qu'à partir de la 16.4 (caniuse « css-media-range-syntax »,
// iOS 16.4) : avant, `not` doit être suivi d'un TYPE de média (`not all and (…)`), sinon la requête est invalide et vaut « not all »
// = elle ne s'applique JAMAIS. Sur un iPhone en iOS 15.x ou 16.0-16.3, les règles du HUD portrait enfermées dans ces blocs
// (la TRIADE FRÉNÉSIE sous le ⏸, le chrono de vol, la plaque d'astuce, la place des plaques de pouvoir) n'étaient donc jamais posées.
// Le jeu connaît la bonne forme : garage-jouer.css l'écrit déjà `@media not all and (orientation:landscape) and (max-height:540px)`.
// On extrait le VRAI CSS de index.html (blocs <style>, hors <script> et commentaires HTML) et on vérifie chaque requête contre la
// grammaire Media Queries 3 : [only|not]? <type> [and (<critère>)]*   ou   (<critère>) [and (<critère>)]*, séparées par des virgules.
// Usage : node preuve-media-niveau3.cjs "<index.html>"   Sort 0 si toutes les requêtes sont du niveau 3, 1 sinon.
const fs=require('fs');
const html=fs.readFileSync(process.argv[2],'utf8');
const ligneDe=(off)=>html.slice(0,off).split('\n').length;
/* les blocs <style> comme les voit le navigateur : le contenu d'un <script> ou d'un commentaire HTML est brut */
const blocs=[];
{let i=0;while(i<html.length){const lt=html.indexOf('<',i);if(lt<0)break;
  if(html.startsWith('<!--',lt)){const e=html.indexOf('-->',lt+4);i=e<0?html.length:e+3;continue;}
  const m=/^<(script|style)\b[^>]*>/i.exec(html.slice(lt,lt+400));
  if(m){const tag=m[1].toLowerCase(),deb=lt+m[0].length,e=html.toLowerCase().indexOf('</'+tag,deb),fin=e<0?html.length:e;
    if(tag==='style')blocs.push({deb:deb,css:html.slice(deb,fin)});i=fin;continue;}
  i=lt+1;}}
/* toutes les requêtes @media : on saute commentaires et chaînes, on lit le prélude jusqu'au « { » */
const requetes=[];
for(const b of blocs){const t=b.css;let i=0;
  while(i<t.length){
    if(t[i]==='/'&&t[i+1]==='*'){const e=t.indexOf('*/',i+2);i=e<0?t.length:e+2;continue;}
    if(t[i]==='"'||t[i]==="'"){const q=t[i];let j=i+1;while(j<t.length&&t[j]!==q){if(t[j]==='\\')j++;j++;}i=j+1;continue;}
    if(t[i]==='@'&&/^@media\b/i.test(t.slice(i,i+7))){let j=i+6,d=0;while(j<t.length&&!(t[j]==='{'&&d===0)){if(t[j]==='(')d++;if(t[j]===')')d--;j++;}
      requetes.push({ligne:ligneDe(b.deb+i),texte:t.slice(i+6,j).replace(/\/\*[\s\S]*?\*\//g,'').replace(/\s+/g,' ').trim()});i=j;continue;}
    i++;}}
const critere='\\(\\s*[a-z-]+\\s*(?::\\s*[^()]+)?\\)';
const typeSeul=new RegExp('^(?:(?:only|not)\\s+)?(?:all|screen|print|speech|tty|tv|projection|handheld|braille|embossed|aural)(?:\\s+and\\s+'+critere+')*$','i');
const critSeul=new RegExp('^'+critere+'(?:\\s+and\\s+'+critere+')*$','i');
function decoupeVirgules(s){const out=[];let d=0,cur='';for(const c of s){if(c==='(')d++;if(c===')')d--;if(c===','&&d===0){out.push(cur);cur='';}else cur+=c;}out.push(cur);return out.map(x=>x.trim());}
const ko=[];
for(const r of requetes){
  const mauvaises=decoupeVirgules(r.texte).filter(q=>!(typeSeul.test(q)||critSeul.test(q)));
  if(mauvaises.length)ko.push('index.html:'+r.ligne+' — @media '+r.texte+'  [requête de niveau 4, invalide avant Safari 16.4 : '+mauvaises.join(' | ')+']');
}
if(!requetes.length){console.log('PREUVE KO — aucune requête @media trouvée (repère perdu)');process.exit(1);}
console.log(ko.length?'PREUVE KO —\n - '+ko.join('\n - '):'PREUVE OK — les '+requetes.length+' requêtes @media sont du niveau 3 (lisibles par Safari 15)');
process.exit(ko.length?1:0);
