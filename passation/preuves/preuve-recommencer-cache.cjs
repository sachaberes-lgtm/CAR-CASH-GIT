/* preuve : RECOMMENCER puis ARRIÈRE-PLAN pendant le volet (relecture du 24/10, VÉRIFS-A, soupçon A2 — code/moteur/mobile-tactile.js).
   RECOMMENCER confirmé : la feuille de pause se ferme SANS dépauser (feuilleFerme), le volet part (160 ms) puis resetGame. L'appli passe
   derrière pendant ces 160 ms (notification, bouton d'accueil) : le gestionnaire « caché » ROUVRE la feuille (paused est encore vrai),
   puis resetGame remet paused=false. Avant : la partie neuve roulait SOUS la feuille de pause ouverte (au retour, rien ne la gelait :
   le gestionnaire « visible » ne pause que si la feuille est fermée) — REPRENDRE la refermait sans geler quoi que ce soit.
   On exécute le VRAI code extrait d'index.html : le gestionnaire visibilitychange du tactile, le rappel du volet de RECOMMENCER,
   panOpen, feuilleOuvre, feuilleFerme. Bouchons : resetGame (paused=false, comme le vrai), togglePause (bascule paused seulement),
   panSync, repriseCompte, boomSkip, wakeAsk, audioKick, uiGarde, sfx, une horloge de minuteurs simulée. */
const fs=require('fs'),vm=require('vm');
const src=fs.readFileSync(process.argv[2]||__dirname+'/../../VERSION PRINCIPALE/index.html','utf8');
function sauteTexte(t,i){const ch=t[i],n=t[i+1];
  if(ch==='/'&&n==='/'){const j=t.indexOf('\n',i);return j<0?t.length:j;}
  if(ch==='/'&&n==='*')return t.indexOf('*/',i+2)+1;
  if(ch==="'"||ch==='"'||ch==='`'){i++;while(i<t.length&&t[i]!==ch){if(t[i]==='\\')i++;i++;}return i;}
  return -1;}
function finBloc(t,i0){let d=0;for(let i=i0;i<t.length;i++){const s=sauteTexte(t,i);if(s>=0){i=s;continue;}
  if(t[i]==='{')d++;else if(t[i]==='}'){d--;if(d===0)return i+1;}}throw new Error('bloc non fermé');}
function unique(rep){const i=src.indexOf(rep);if(i<0)throw new Error('repère introuvable : '+rep);if(src.indexOf(rep,i+1)>=0)throw new Error('repère non unique : '+rep);return i;}
function fonction(entete){const i=unique(entete);return src.slice(i,finBloc(src,i+entete.length-1));}
/* le gestionnaire « caché / visible » du tactile : la fonction qui contient « if(document.hidden){ if(started&&!gameOver&&paused&&pan&& » */
const iC=unique('if(document.hidden){ if(started&&!gameOver&&paused&&pan&&');
const AV="addEventListener('visibilitychange',function(){";const iV=src.lastIndexOf(AV,iC);
const visTxt='function(){'+src.slice(iV+AV.length,finBloc(src,iV+AV.length-1));
/* le rappel du volet de RECOMMENCER */
const RW='ecranWipe(function(){if(started&&!gameOver){resetGame();';const iW=unique(RW)+'ecranWipe('.length;
const wipeTxt=src.slice(iW,finBloc(src,iW+'function()'.length));
const code=[fonction('function panOpen(o,compte){'),fonction('function feuilleOuvre(el,cls){'),fonction('function feuilleFerme(el,cls){'),
  'this.vis='+visTxt+';','this.rappel='+wipeTxt+';','this.panOpen=panOpen;this.feuilleFerme=feuilleFerme;'].join('\n');
function bac(){
  let t=0,Q=[],id=0;
  const cls=new Set(['open']);const pan={id:'tPanel',classList:{add(...a){a.forEach(x=>cls.add(x));},remove(...a){a.forEach(x=>cls.delete(x));},contains:x=>cls.has(x)},_sortMs:170};
  const ctx={pan,started:true,gameOver:false,paused:true,mode:'drive',document:{hidden:false,documentElement:{getAttribute:()=>null}},
    resetGame(){ctx.paused=false;ctx.gameOver=false;ctx.n.reset++;},togglePause(){if(!ctx.started||ctx.gameOver)return;ctx.paused=!ctx.paused;},
    panSync(){},repriseCompte(){},boomSkip(){},wakeAsk(){},audioKick(){},uiGarde(){},sfx(){},n:{reset:0},
    setTimeout:(f,ms)=>{Q.push({f,at:t+ms,id:++id});return id;},clearTimeout:k=>{Q=Q.filter(x=>x.id!==k);}};
  vm.runInNewContext(code,ctx);
  ctx.avance=function(ms){const fin=t+ms;for(;;){Q.sort((a,b)=>a.at-b.at);if(!Q.length||Q[0].at>fin)break;const x=Q.shift();t=x.at;x.f();}t=fin;};
  return ctx;}
let ko=false;const ok=(c,m)=>{console.log((c?'OK   ':'ÉCHEC ')+m);if(!c)ko=true;};
/* 1. RECOMMENCER confirmé, l'appli passe derrière 40 ms après (le volet couvre), revient 600 ms plus tard */
{const c=bac();c.feuilleFerme(c.pan,'open'); /* f9 : la feuille descend, la pause reste */
  c.avance(40);c.document.hidden=true;c.vis();const rouverte=c.pan.classList.contains('open')&&!c.pan.classList.contains('sortant');
  c.avance(120);c.rappel(); /* le volet couvre (160 ms) : resetGame */
  c.avance(480);c.document.hidden=false;c.vis();c.avance(1000);
  const roule=!c.paused&&c.started&&!c.gameOver,feuille=c.pan.classList.contains('open');
  console.log('     feuille rouverte au départ : '+rouverte+' · après le retour : paused='+c.paused+', feuille '+(feuille?'OUVERTE':'fermée')+', parties neuves '+c.n.reset);
  ok(c.n.reset===1&&!(roule&&feuille),'arrière-plan pendant le volet de RECOMMENCER : la partie neuve ne roule pas sous la feuille de pause ouverte');
  ok(c.paused&&feuille,'…elle part en PAUSE, REPRENDRE sous le pouce (comme tout retour d\'arrière-plan)');}
/* 2. témoin : RECOMMENCER sans arrière-plan — la partie neuve roule, la feuille finit fermée */
{const c=bac();c.feuilleFerme(c.pan,'open');c.avance(160);c.rappel();c.avance(500);
  ok(!c.paused&&!c.pan.classList.contains('open')&&c.n.reset===1,'témoin sans arrière-plan : la partie neuve roule, feuille fermée (inchangé)');}
/* 3. l'appli revient AVANT que le volet ne finisse (minuteurs gelés en arrière-plan sur iPhone : le rappel part au retour) */
{const c=bac();c.feuilleFerme(c.pan,'open');c.avance(40);c.document.hidden=true;c.vis();c.document.hidden=false;c.vis();c.avance(120);c.rappel();c.avance(500);
  ok(c.paused&&c.pan.classList.contains('open'),'retour avant la fin du volet : la partie neuve attend en PAUSE sous la feuille rouverte');}
console.log(ko?'KO':'OK');if(ko)process.exitCode=1;
