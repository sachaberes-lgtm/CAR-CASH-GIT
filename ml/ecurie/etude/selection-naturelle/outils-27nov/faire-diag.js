/* jetable : <sortie>.js = <base> + l'ordre en vol porte « facon » et « voulu » (la trace les garde ; la main ne les lit pas)
   usage : node faire-diag.js <base.js> <sortie> */
const fs=require('fs'),path=require('path');
const re=(s,a,b)=>{if(!s.includes(a))throw new Error('introuvable '+a.slice(0,80));return s.replace(a,()=>b);};
const A=process.argv.slice(2);let p=fs.readFileSync(path.resolve(A[0]),'utf8');
p=re(p,`  o.ensuite={ligne:0};   /* a la pose`,`  o.facon=m.facon;o.voulu=!!m.voulu;
  o.ensuite={ligne:0};   /* a la pose`);
fs.writeFileSync(path.join(__dirname,A[1]+'.js'),p);const {charger}=require('../../../bot/piloter');console.log(A[1]+'.js ecrit et charge : '+charger(path.join(__dirname,A[1]+'.js')).nom);
