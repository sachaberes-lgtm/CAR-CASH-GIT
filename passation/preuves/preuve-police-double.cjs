/* preuve : LE COUPERET DU SURVIVANT NE FAIT PAS SAUTER DEUX FOIS LE MÊME POLICIER (relecture du 24/10, B6 — code/rendu/kit-lumiere.js).
   survTick fige le classement (`racers`, trié) AVANT la boucle des policiers ; dans cette boucle, un policier qui retombe à côté de la
   route saute (botBoom(b) : alive=false). Si la minute tombe à cette même image, le couperet prenait `racers[racers.length-1]` — ce
   policier déjà mort — et le refaisait sauter : deuxième gerbe, deuxième « X EXPLOSE ! », deuxième son, et la meute « s'énerve » pour
   rien. On vérifie l'ordre dans le VRAI survTick, puis on exécute la VRAIE condition du couperet extraite d'index.html. */
const fs=require('fs'),vm=require('vm');
const src=fs.readFileSync(process.argv[2]||__dirname+'/../../VERSION PRINCIPALE/index.html','utf8');
const d=src.indexOf('function survTick(dt){'),iR=src.indexOf('const racers=alive.slice();',d),iB=src.indexOf('botBoom(b);continue;',d),iL=src.indexOf('const low=racers[racers.length-1];',d);
if(d<0||iR<0||iB<0||iL<0){console.log('repère introuvable\nSANS OBJET');process.exit(0);}
const ordre=iR<iB&&iB<iL;
console.log('survTick : classement figé ('+iR+') < policier qui saute dans la boucle ('+iB+') < couperet ('+iL+') : '+(ordre?'oui, à la même image':'non'));
const j=src.indexOf('botBoom(low);',iL);const cond=src.slice(iL,j+'botBoom(low);'.length)+'}';
console.log('couperet : '+cond.replace(/\s+/g,' ').slice(0,120));
let mortsResautes=0,sauts=0;const ctx={botBoom:b=>{sauts++;if(!b.alive)mortsResautes++;b.alive=false;}};
vm.runInNewContext('this.coupe=function(racers,pTot){'+cond+'};',ctx);
/* la minute tombe à l'image où le dernier policier vient de retomber à côté de la route (déjà mort) ; toi, tu n'es pas dernier */
ctx.coupe([{n:'A',alive:true,totD:900},{n:'B',alive:true,totD:700},{n:'C',alive:false,totD:120}],500);
console.log('le dernier du classement figé vient de sauter à cette image : '+mortsResautes+' policier mort refait sauter');
/* et le cas normal reste le même : le dernier VIVANT, derrière toi, saute */
sauts=0;const r2=[{alive:true,totD:900},{alive:true,totD:300}];ctx.coupe(r2,500);
console.log('cas normal : '+sauts+' saut, le dernier vivant derrière toi '+(r2[1].alive?'reste':'saute'));
const ok=ordre&&mortsResautes===0&&sauts===1&&!r2[1].alive;
console.log(ok?'PREUVE OK':'PREUVE KO');process.exit(ok?0:1);
