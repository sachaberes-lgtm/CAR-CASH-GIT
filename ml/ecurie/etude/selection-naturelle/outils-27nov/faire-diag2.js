/* jetable : <sortie>.js = <base> + l'ordre porte « facon », « voulu » et DEMANDE des lois « retour » (sans les suivre) : on lit ce que leurs rayons annoncent
   usage : node faire-diag2.js <base.js> <sortie> '<json des lois>' */
const fs=require('fs'),path=require('path');
const re=(s,a,b)=>{if(!s.includes(a))throw new Error('introuvable '+a.slice(0,80));return s.replace(a,()=>b);};
const A=process.argv.slice(2);let p=fs.readFileSync(path.resolve(A[0]),'utf8');
if(!p.includes('o.facon=m.facon'))p=re(p,"  o.ensuite={ligne:0};   /* a la pose","  o.facon=m.facon;o.voulu=!!m.voulu;\n  o.ensuite={ligne:0};   /* a la pose");
p=re(p,"  decide:function(vue,m){return vue.mode==='sol'?auSol(vue,m):vue.mode==='vol'?enVol(vue,m):{};}","  decide:function(vue,m){const o=vue.mode==='sol'?auSol(vue,m):vue.mode==='vol'?enVol(vue,m):{};o.retours="+A[2]+";return o;}");
fs.writeFileSync(path.join(__dirname,A[1]+'.js'),p);const {charger}=require('../../../bot/piloter');console.log(A[1]+'.js ecrit et charge : '+charger(path.join(__dirname,A[1]+'.js')).nom);
