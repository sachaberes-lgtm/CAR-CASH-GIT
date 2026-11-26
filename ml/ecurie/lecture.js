/* ===== CE QUE LA BOUCLE LIT D'UNE REPONSE (2026-11-25, relecture : « une variante refusee pour son profil est journalisee avec une ligne de code
   de piloter.js a la place de la raison, et une reponse a peine differente de la forme demandee est perdue ») =====
   Sortis de boucle.js pour que verifier.js (controle 14) les essaie sans rien depenser :
     lit(texte)        la reponse de l'API → { raison, code } ou null ;
     chargeable(f)     le pilote se charge-t-il dans le bac ? → { erreur, main } (dans un processus a part). */
const path=require('path'),{spawnSync}=require('child_process');
const BOT=path.join(__dirname,'..','bot');

/* LIRE LA REPONSE. La raison : la premiere ligne « RAISON : », sans tenir compte de la casse, des etoiles ou des diezes (« **Raison** : »),
   jusqu'au premier bloc de code. Le code : le DERNIER bloc ``` (quelle que soit sa langue : js, JavaScript, rien) qui contient le mot `exports`
   (module.exports ou exports.decide : piloter.js charge les deux) — un court extrait cite avant le fichier n'est plus pris pour lui ; sinon le
   plus long bloc. Avant : « RAISON » en majuscules exige, ```js ou ```javascript seulement, et le PREMIER bloc. */
function lit(texte){
  const t=String(texte||'').replace(/\r\n?/g,'\n');
  const blocs=[...t.matchAll(/(^|\n)[ \t]*```[^\n]*\n([\s\S]*?)\n[ \t]*```/g)].map(m=>m[2]);
  const r=/(?:^|\n)[ \t>#*_]*raison[ \t*_]*:[ \t*_]*([\s\S]*?)(?=\n[ \t]*```|$)/i.exec(t);
  if(!blocs.length||!r)return null;
  const avec=blocs.filter(b=>/\bexports\b/.test(b)),code=avec.length?avec[avec.length-1]:blocs.slice().sort((x,y)=>y.length-x.length)[0];
  const raison=r[1].replace(/[*_]+$/,'').trim().replace(/\s+/g,' ');
  return raison&&code.trim()?{raison:raison,code:code}:null;}

/* LE CHARGEMENT, dans un processus a part : rend { erreur, main }. `erreur` = le NOM et le MESSAGE de l'exception, sur une ligne, 200 caracteres au
   plus (avant : la premiere ligne de la sortie contenant « Error » — pour un profil refuse, la ligne de code de piloter.js qui leve l'erreur, sans
   le champ fautif ; et un retour chariot de Windows restait colle) ; `main` = l'empreinte du profil de la main (piloter.js, charger : profilSha ;
   null = la main de machine). Une exception qui n'est pas un objet (`throw null`) donne « null », pas la version de Node. */
const CHARGE_CODE=f=>'let C;try{C=require('+JSON.stringify(path.join(BOT,'piloter.js'))+').charger('+JSON.stringify(f)+');}'
  +'catch(e){let m="erreur illisible";try{m=String((e&&e.name?e.name+" : ":"")+(e&&e.message!=null?e.message:e));}catch(x){}'
  +'process.stderr.write("\\nRAISON="+m.replace(/\\s+/g," ")+"\\n");process.exit(1);}'
  +'process.stdout.write("\\nMAIN="+JSON.stringify(C.profilSha||null)+"\\nGARAGE="+JSON.stringify(C.garageSha||null)+"\\n");';
function chargeable(f){
  const r=spawnSync(process.execPath,['-e',CHARGE_CODE(f)],{encoding:'utf8'}),ligne=(t,k)=>String(t||'').split(/\r?\n/).filter(l=>l.startsWith(k)).pop();
  if(r.status===0){const m=ligne(r.stdout,'MAIN=');let p;try{p=JSON.parse(m.slice(5));}catch(e){return {erreur:'ne dit pas sa main',main:null};}let g=null;try{g=JSON.parse((ligne(r.stdout,'GARAGE=')||'GARAGE=null').slice(7));}catch(e){}return {erreur:null,main:p,garage:g};} /* (2026-11-26) garage : l'empreinte des figures equipees */
  const e=ligne(r.stderr,'RAISON=')||String(r.stderr||'').split(/\r?\n/).filter(l=>l.trim()).pop()||'';
  return {erreur:e.replace(/^RAISON=/,'').split(f).join(path.basename(f)).trim().slice(0,200)||'ne se charge pas',main:null};} /* le chemin complet du fichier : son nom seul */

module.exports={lit,chargeable};
