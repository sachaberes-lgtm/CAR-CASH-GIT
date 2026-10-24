/* preuve : l'AUTO-ÉCOLE attend la reprise quand le jeu est en PAUSE (relecture du 24/10, code/interface/auto-ecole.js).
   Avant : les minuteurs de tutoBravo / tutoAffiche couraient sous la pause — la dernière étape réussie en l'air, mise en pause,
   replaçait la caisse (sandRevive) au bout de ~9 s et donnait le PERMIS (+500, fanfare) sous l'écran de pause ; la consigne
   suivante (et l'accueil) s'affichaient avec leur son pendant la pause. On exécute le VRAI code extrait d'index.html. */
const fs=require('fs'),vm=require('vm');
const src=fs.readFileSync(process.argv[2]||__dirname+'/../../VERSION PRINCIPALE/index.html','utf8');
const coupe=function(a,b){const i=src.indexOf(a),j=src.indexOf(b,i+1);if(i<0||j<0)throw new Error('introuvable : '+a);return src.slice(i,j);};
const code=coupe('function tutoAffiche(msg){','function tutoArme(){')+coupe('function tutoBravo(){','function tutoFin(passe){');
let t=0,Q=[];const n={sandRevive:0,tutoFin:0,carte:0,sfx:0};
const el=function(){const cls=new Set();return {style:{setProperty(){},animation:''},textContent:'',innerHTML:'',className:'',offsetWidth:1,
  classList:{add(...a){a.forEach(x=>cls.add(x));},remove(...a){a.forEach(x=>cls.delete(x));},contains:x=>cls.has(x),toggle(x,v){if(v===undefined?!cls.has(x):v)cls.add(x);else cls.delete(x);}},
  querySelector(){return this._k||(this._k=el());}};};
const C=el();
const ctx={TUTO:{on:true,i:0,t:0,accueilVu:0},TUTO_ETAPES:[0,1,2,3,4,5].map(i=>({t:'E'+i,d:'d',dk:'k',geste:'glisse',film:'f',main:'',bravo:'B'+i})),
  TUTO_ACCUEIL:{t:'A',d:'d',film:'accueil'},TUTO_FILMS:{f:'',accueil:''},started:true,gameOver:false,paused:false,mode:'drive',pwrAirT:0,REDUCED_MOTION:true,SONV2:true,
  document:{body:el()},tutoCarte:()=>C,tutoPasseRange(){},tutoMot(){},tutoMarque:s=>s,tutoTouche:()=>true,tutoPips(){},tutoMain(){},tutoPayees:()=>0,TR:s=>s,
  nitroR:0,nitroGain(){},ENGINE_TIERS:[{res:2}],engTier:0,pixBurst(){},chimeNote(){},hap(){},sfx:()=>{n.sfx++;},
  sandRevive:()=>{n.sandRevive++;},tutoFin:()=>{n.tutoFin++;ctx.TUTO.on=false;},
  setTimeout:(f,ms)=>{Q.push({f,at:t+ms});return Q.length;},clearTimeout(){},Math};
vm.runInNewContext(code+';this.tutoAffiche=tutoAffiche;this.tutoBravo=tutoBravo;',ctx);
const avance=function(ms){const fin=t+ms;for(;;){Q.sort((a,b)=>a.at-b.at);if(!Q.length||Q[0].at>fin)break;const x=Q.shift();t=x.at;x.f();}t=fin;};
const ok=(c,m)=>{console.log((c?'OK   ':'ÉCHEC ')+m);if(!c)ko=true;};let ko=false;
/* 1. l'accueil (1re carte) puis PAUSE : la 1re consigne attend */
ctx.tutoAffiche();const s0=n.sfx;ctx.paused=true;avance(6000);
ok(n.sfx===s0&&C.classList.contains('intro'),'pause pendant l\'accueil : ni consigne ni son tant que dure la pause');
ctx.paused=false;avance(500);ok(n.sfx===s0+1&&!C.classList.contains('intro'),'reprise : la 1re consigne arrive');
/* 2. une étape réussie puis PAUSE : la consigne suivante attend */
ctx.TUTO.i=2;Q=[];ctx.tutoBravo();ctx.paused=true;const s1=n.sfx;avance(5000);
ok(n.sfx===s1,'pause après une réussite : la consigne suivante ne sonne pas sous la pause');
ctx.paused=false;avance(500);ok(n.sfx===s1+1,'reprise : la consigne suivante arrive');
/* 3. la DERNIÈRE étape réussie EN L'AIR, puis PAUSE (20 s) : rien ne se passe sous la pause */
ctx.TUTO.i=5;Q=[];ctx.mode='fall';ctx.tutoBravo();ctx.paused=true;avance(20000);
ok(n.sandRevive===0,'pause en l\'air : la caisse n\'est pas replacée (sandRevive '+n.sandRevive+')');
ok(n.tutoFin===0,'pause : le PERMIS n\'est pas donné sous l\'écran de pause (tutoFin '+n.tutoFin+')');
ctx.paused=false;ctx.mode='drive';avance(1000);ok(n.tutoFin===1&&n.sandRevive===0,'reprise, roues sur la route : le permis tombe (une fois)');
console.log(ko?'KO':'OK');if(ko)process.exitCode=1;
