// Preuve sans navigateur (veq-tonneau) : saut NITRO lancé → mort → resetGame → 1er vol de la partie neuve.
// Usage : node preuve-veq.cjs "<index.html>"   Sort 0 si tout est revenu à l'état initial, 1 sinon.
const fs=require('fs');const src=fs.readFileSync(process.argv[2],'utf8').split('\n');
const iV=src.findIndex(l=>l.startsWith('const VEQ={'));
const decl=src.slice(iV,iV+7).join('\n');
const init={};for(const k of ['sautF','dReq','dDn','dUp','sautT','rate','n']){const m=decl.match(new RegExp('[,{]'+k+':([^,}]+)'));init[k]=eval(m[1]);}
const iR=src.findIndex(l=>l.startsWith('function resetGame('));
let iF=iR+1;while(!/^function /.test(src[iF]))iF++; // fin de resetGame (fonction suivante)
const body=src.slice(iR,iF).join('\n');
const lect={n:0,occupe(){return this.n;},vide(){this.n=0;}};
const VEQ=Object.assign({},init,{lect});
let flightId=0;
// la remise à zéro telle qu'écrite dans resetGame : on n'exécute QUE ses instructions qui touchent VEQ ou flightId
const stm=[];for(const m of body.matchAll(/(?:if\(VEQ\.lect\))?(?:VEQ\.[\w]+=[^;]+|VEQ\.lect\.vide\(\)|flightId=0);/g))stm.push(m[0]);
const reset=new Function('VEQ','setF',stm.map(s=>s.replace(/flightId=0;/,'setF(0);')).join('\n'));
// partie 1 : saut NITRO lancé au vol n°3, figure en cours, double-tap en attente, puis explosion en vol (veqFigurePose n'est plus appelée)
flightId=3;VEQ.sautF=flightId;lect.n=2;VEQ.dReq=true;VEQ.dDn=123;VEQ.sautT=99999;
reset(VEQ,v=>{flightId=v;});
let ko=[];
for(const k of ['sautF','dReq']) if(VEQ[k]!==init[k])ko.push(k+'='+VEQ[k]+' (init '+init[k]+')');
if(lect.n!==0)ko.push('lect.occupe='+lect.n);
// partie 2 : au 3e vol (normal, sans saut) de la partie neuve, veqNitK doit valoir 1 (pas .3)
flightId=3; const veqNitK=()=>VEQ.sautF===flightId?.3:1;
if(veqNitK()!==1)ko.push('veqNitK()=0,3 au 3e vol normal de la partie neuve (pose payée 30 %)');
console.log('instructions VEQ lues dans resetGame:',stm.length?stm.join(' '):'(aucune)');
console.log(ko.length?'KO : '+ko.join(' | '):'OK : état du saut remis à zéro');process.exit(ko.length?1:0);
