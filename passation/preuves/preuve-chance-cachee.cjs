/* preuve : la VRAIE section (extraite de code/gameplay/seconde-chance.js) gèle l'offre de seconde chance pendant que l'appli est cachée */
const fs=require('fs'),vm=require('vm');
const s=fs.readFileSync(__dirname+'/../../code/gameplay/seconde-chance.js','utf8');
const i=s.indexOf('/* ===== LA SECONDE CHANCE NE FILE PAS'),j=s.indexOf('}catch(e){} });',i)+'}catch(e){} });'.length;
if(i<0||j<i)throw new Error('section introuvable');
let t=1000,L=null,tms=[],sig=0;
const ctx={CHANCE:{offre:true,used:false,fin:1000+6000,tm:1},document:{hidden:false},performance:{now:()=>t},
  addEventListener:(n,f)=>{if(n==='visibilitychange')L=f;},clearTimeout:id=>{tms=tms.filter(x=>x.id!==id);},
  setTimeout:(f,ms)=>{const id=100+tms.length;tms.push({id,f,at:t+ms});return id;},chanceSignal:()=>{sig++;},Math};
tms.push({id:1,f:()=>{ctx.CHANCE.offre=false;},at:1000+6030});
vm.runInNewContext(s.slice(i,j),ctx);
const ok=(c,m)=>{console.log((c?'OK   ':'ÉCHEC ')+m);if(!c)process.exitCode=1;};
t=3000;ctx.document.hidden=true;L();                 /* caché à 2 s de l'offre (4 s restantes) */
ok(tms.length===0,'caché : le minuteur de fin est arrêté');
t=3000+20000;ctx.document.hidden=false;L();          /* 20 s plus tard, retour */
ok(ctx.CHANCE.offre===true,'retour après 20 s : l\'offre est toujours là');
ok(ctx.CHANCE.fin-t===4000,'il reste les 4 s d\'avant (reste '+(ctx.CHANCE.fin-t)+' ms)');
ok(tms.length===1&&tms[0].at-t===4030,'un seul minuteur, réarmé sur le reste');
/* offre déjà finie avant de cacher : rien ne bouge */
ctx.CHANCE.offre=false;const f0=ctx.CHANCE.fin;t+=100;ctx.document.hidden=true;L();t+=5000;ctx.document.hidden=false;L();
ok(ctx.CHANCE.fin===f0,'sans offre : la fin n\'est pas touchée');
