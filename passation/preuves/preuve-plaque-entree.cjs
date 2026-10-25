#!/usr/bin/env node
/* LA TOUCHE ENTRÉE SUR UN BOUTON DE L'ATELIER DE LA PLAQUE FAIT CE QUE DIT LE BOUTON (24/10, relecture V1)
   usage : node preuve-plaque-entree.cjs <index.html corrigé> [index.html ancien]
   La VRAIE fonction `plqBranche` du fichier est rejouée avec un DOM bouchonné (fenêtre en capture d'abord, puis la cible, et
   stopImmediatePropagation respecté). Au clavier (ordinateur, iPad au clavier), RETOUR atteint par Tab puis Entrée doit ANNULER, le dé
   doit TIRER une plaque — avant, l'écouteur de la fenêtre interceptait Entrée et ENREGISTRAIT la plaque à leur place. Entrée hors des
   boutons valide toujours, Échap annule toujours. Dernière ligne : PREUVE OK / PREUVE KO. */
'use strict';
const fs=require('fs'),vm=require('vm');
function el(o){o=o||{};const L={};return Object.assign({ls:L,addEventListener(t,f){(L[t]=L[t]||[]).push(f);},getAttribute(k){return k==='data-p'?o.p:null;},
  closest(s){for(let q of String(s).split(',')){q=q.trim().replace(/^#plq\s+/,'');if((q==='[data-p]'&&o.p)||(q==='.plMod'&&o.mod)||(q==='#plq'))return this;}return null;},
  focus(){},blur(){},setSelectionRange(){},value:'',querySelector(){return null;},querySelectorAll(){return [];}},o);}
function essai(src,cible,touche){
  const journal=[],fen=[];
  const ok=el({p:'ok'}),ret=el({p:'ret'}),de=el({p:'hasard'}),tx=el({id:'plqTx'}),vue=el(),plq=el({id:'plq'});
  plq.querySelector=s=>s==='.plVue'?vue:s==='.plDe'?de:null;plq.querySelectorAll=s=>s==='[data-p]'?[ok,ret,de]:[];
  const ctx={PLQ:{on:true,mode:'profil',x:'AB-123-CD',kb:false,kbFaux:0},document:{activeElement:null},window:{},
    $p:id=>id==='plq'?plq:id==='plqTx'?tx:null,addEventListener:(t,f,c)=>{if(t==='keydown'&&c)fen.push(f);},
    plqFerme:v=>journal.push(v?'ENREGISTRE':'ANNULE'),plqHasard:()=>{journal.push('TIRAGE');return 'ZZ-000-ZZ';},plqVue(){},plqNet:s=>s,plqClavier(){},plqH0:()=>800,
    uiClic(){},hap(){},uiPop(){},setTimeout:()=>0,clearTimeout(){},scrollTo(){}};
  vm.createContext(ctx);vm.runInContext(src+';plqBranche();',ctx);
  const t={ret:ret,de:de,ok:ok,fond:vue}[cible];
  let stop=false;const e={key:touche,code:touche,target:t,preventDefault(){},stopImmediatePropagation(){stop=true;},stopPropagation(){stop=true;}};
  for(const f of fen){f(e);if(stop)break;}
  if(!stop)for(const f of (t.ls.keydown||[])){f(e);if(stop)break;}
  return journal.join('+')||'rien';
}
function releve(chemin){
  const h=fs.readFileSync(chemin,'utf8'),i=h.indexOf('function plqBranche(){'),j=h.indexOf('\n/* le clavier qui écrit sur la plaque',i);
  if(i<0||j<0){console.log(chemin+'\n  repère introuvable (plqBranche)');return null;}
  const src=h.slice(i,j);
  const cas=[['ret','Enter','ANNULE'],['de','Enter','TIRAGE'],['ok','Enter','ENREGISTRE'],['fond','Enter','ENREGISTRE'],['ret','Escape','ANNULE']];
  let bon=true;const lignes=[];
  for(const [c,k,att] of cas){const r=essai(src,c,k);if(r!==att)bon=false;lignes.push('  '+k+' sur '+c+' : '+r+(r===att?'':'   ← attendu '+att));}
  console.log(chemin+'\n'+lignes.join('\n'));return bon;}
const ok=releve(process.argv[2]);let okB=true;
if(process.argv[3]){const b=releve(process.argv[3]);okB=b===false;if(b)console.log('  (l\'ancien passe aussi : la preuve ne prouve rien)');}
console.log(ok&&okB?'PREUVE OK':'PREUVE KO');process.exit(ok&&okB?0:1);
