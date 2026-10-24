/* preuve : LA FILE DES ANNONCES ATTEND LA FIN DE LA PAUSE (relecture du 24/10, B8 — code/gameplay/frole-contrats.js, hautArme).
   Le couloir du haut fait patienter une annonce derrière celle qui parle (setTimeout sur performance.now) — et ce minuteur courait sous la
   pause : deux défis réussis coup sur coup (ou un défi puis la carte MOTEUR, ou la bannière de NIVEAU), le joueur met la pause, et ~2 s
   plus tard la carte suivante (bannière #misBan z-index 70, carte moteur, annonce #slam9 z-index 41) s'affichait PAR-DESSUS le panneau
   de pause (#tPanel, z-index 9). On exécute la VRAIE file extraite d'index.html avec des minuteurs simulés. */
const fs=require('fs'),vm=require('vm');
const src=fs.readFileSync(process.argv[2]||__dirname+'/../../VERSION PRINCIPALE/index.html','utf8');
const a=src.indexOf('const HAUT={fin:0'),b=src.indexOf('function hautVide(',a);
if(a<0||b<0){console.log('repère introuvable\nSANS OBJET');process.exit(0);}
let t=0,Q=[],id=0;
const ctx={performance:{now:()=>t},setTimeout:(f,ms)=>{Q.push({f,at:t+(ms||0),id:++id});return id;},clearTimeout:k=>{Q=Q.filter(x=>x.id!==k);},
  TUTO:{on:false},engBig:{on:false},engPlonge(){},engRuban(){},avE:()=>null,document:{getElementById:()=>null,body:{classList:{remove(){}}}},lvlBanT:0,misBanMontre:{},
  paused:false,started:true,gameOver:false,Math};
vm.runInNewContext(src.slice(a,b)+';this.hautPasse=hautPasse;this.HAUT=HAUT;',ctx);
const avance=function(ms){const fin=t+ms;for(let g=0;g<5000;g++){Q.sort((x,y)=>x.at-y.at);if(!Q.length||Q[0].at>fin)break;const x=Q.shift();t=Math.max(t,x.at);x.f();}t=fin;};
const vus=[];const carte=nom=>function(){vus.push({nom,t,pause:ctx.paused});};
/* deux défis réussis coup sur coup : le 2e attend derrière le 1er (1,8 s de couloir) — le joueur met la pause entre les deux */
ctx.hautPasse(carte('défi 1'),1800,'mis',2);avance(40);ctx.hautPasse(carte('défi 2'),1800,'mis',2);avance(60);
ctx.paused=true;avance(6000);
const sousPause=vus.filter(v=>v.pause).map(v=>v.nom+' à '+(v.t/1000).toFixed(1)+' s');
console.log('pause mise 0,1 s après : carte(s) affichée(s) PENDANT la pause : '+(sousPause.length?sousPause.join(', '):'aucune'));
ctx.paused=false;avance(600);
const apres=vus.find(v=>v.nom==='défi 2'&&!v.pause);
console.log('reprise à 6,1 s : défi 2 affiché '+(apres?'à '+(apres.t/1000).toFixed(1)+' s':'jamais'));
/* hors pause, rien ne change : la 2e carte passe au même instant qu'avant (fin du couloir + 120 ms) */
t=0;Q=[];vus.length=0;ctx.HAUT.cur=null;ctx.HAUT.fin=0;ctx.HAUT.q.length=0;ctx.paused=false;
ctx.hautPasse(carte('défi 1'),1800,'mis',2);avance(40);ctx.hautPasse(carte('défi 2'),1800,'mis',2);avance(4000);
const d2=vus.find(v=>v.nom==='défi 2');console.log('sans pause : défi 2 à '+(d2?(d2.t/1000).toFixed(2)+' s':'jamais'));
const ok=sousPause.length===0&&!!apres&&apres.t<=6400&&!!d2&&Math.abs(d2.t-1920)<1;
console.log(ok?'PREUVE OK':'PREUVE KO');process.exit(ok?0:1);
