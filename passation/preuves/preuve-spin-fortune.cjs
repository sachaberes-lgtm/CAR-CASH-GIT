/* preuve (relecture ÉCO, 24/10) : LES SACS ET LE JACKPOT DU FINAL SPIN RELÈVENT LE RECORD DE FORTUNE (SAVE.d.bankMax, « FORTUNE MAX » de la
   plaque) comme tout autre crédit — sinon un achat juste après le tirage effaçait ce sommet pour toujours.
   node passation/preuves/preuve-spin-fortune.cjs "VERSION PRINCIPALE/index.html" — extrait spinDonne et bankMaxMaj. */
const fs=require('fs'),vm=require('vm');
const h=fs.readFileSync(process.argv[2]||__dirname+'/../../VERSION PRINCIPALE/index.html','utf8');
const KO=[];const ok=m=>console.log('OK   '+m),ko=m=>{KO.push(m);console.log('KO   '+m);};
function tranche(debut,fin,depuis){const i=h.indexOf(debut,depuis||0);if(i<0)throw new Error('introuvable : '+debut);const j=h.indexOf(fin,i+debut.length);if(j<0)throw new Error('fin introuvable : '+fin);return h.slice(i,j);}
function ligne(debut){const i=h.indexOf(debut);if(i<0)return '';return h.slice(i,h.indexOf('\n',i));}

/* ---- 2. le FINAL SPIN relève le record de fortune ---- */
{
  const code=tranche('function spinDonne(','function spinPaye(')+'\n'+ligne('function bankMaxMaj(');
  const sb={Math,Array,SAVE:{d:{bank:10000,bankMax:10000,owned:[],spinJ:0},flush(){}},SPIN:{total:0},carWas:[],
    bank(){return sb.SAVE.d.bank||0;},gagneAjoute(){},spinEpique(){return -1;}};
  vm.createContext(sb);vm.runInContext(code,sb);
  sb.spinDonne({lot:{id:'gros',cash:50000},i:2,s:[2,2,2]});
  const d=sb.SAVE.d;
  d.bank===60000?ok('GROS SAC : la banque passe à 60 000'):ko('banque '+d.bank);
  d.bankMax===60000?ok('le record de fortune suit : 60 000'):ko('record de fortune resté à '+d.bankMax+' (banque '+d.bank+') : un achat juste après le tirage l\'efface pour toujours');
}

console.log(KO.length?'PREUVE KO — '+KO.join(' | '):'PREUVE OK');process.exitCode=KO.length?1:0;
