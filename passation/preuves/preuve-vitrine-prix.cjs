/* preuve (relecture ÉCO, 24/10) : LA BOUTIQUE DU JOUR NE SERT PAS UN OBJET SANS PRIX. Une vitrine tirée avant une mise à jour qui a retiré le
   prix d'un objet (passé en euros, devenu récompense de mission) était gardée jusqu'à minuit UTC : sa carte affichait « $ NaN » (ou « $ 0 »).
   node passation/preuves/preuve-vitrine-prix.cjs "VERSION PRINCIPALE/index.html" — extrait bqJour … bqVitrine (et fmtC pour mémoire). */
const fs=require('fs'),vm=require('vm');
const h=fs.readFileSync(process.argv[2]||__dirname+'/../../VERSION PRINCIPALE/index.html','utf8');
const KO=[];const ok=m=>console.log('OK   '+m),ko=m=>{KO.push(m);console.log('KO   '+m);};
function tranche(debut,fin,depuis){const i=h.indexOf(debut,depuis||0);if(i<0)throw new Error('introuvable : '+debut);const j=h.indexOf(fin,i+debut.length);if(j<0)throw new Error('fin introuvable : '+fin);return h.slice(i,j);}
function ligne(debut){const i=h.indexOf(debut);if(i<0)return '';return h.slice(i,h.indexOf('\n',i));}

/* ---- 3. la boutique du jour et l'objet qui a perdu son prix ---- */
{
  const code=tranche('function bqJour(){','function bqReste(')+'\n'+ligne('function mulberry32(');
  const COSM={peinture:[{id:'usine',p:0},{id:'menthe',eur:'1 €',r:'commun'}],
    aile:[{id:'panneaux',p:0},{id:'helices',p:30000},{id:'pigeon',p:60000},{id:'origami',p:90000}],
    trainee:[{id:'nitro',p:0},{id:'rose',p:4000},{id:'or',p:15000}]};
  const CARS=[],CAR_UNLOCK=[];for(let i=0;i<10;i++){CARS.push({name:'C'+i});CAR_UNLOCK.push(i===0?null:{p:i*1000});}
  CAR_UNLOCK[9]={k:'mis',id:'fig5',av:{p:9000}}; /* une caisse devenue récompense de mission depuis le tirage */
  const sb={Math,Date,String,Array,COSM,CARS,CAR_UNLOCK,location:{search:''},
    SAVE:{d:{equipped:0,bq:null},mark(){}},carRetiree(){return false;},carUnlockedVrai(i){return i===0;},shopOwned(){return false;},
    carRar(){return 'rare';},cosmRar(){return 'rare';},window:{}};
  vm.createContext(sb);vm.runInContext(code,sb);
  const j=sb.bqJour();
  /* la vitrine d'aujourd'hui, tirée AVANT la mise à jour : la MENTHE coûtait encore des dollars, la caisse 9 se vendait */
  sb.SAVE.d.bq={j:j,l:['v:4','v:5','v:9','v:6','v:7','peinture:menthe','aile:helices','trainee:rose']};
  const B=sb.bqVitrine();
  const sansPrix=B.l.filter(function(k){if(k[0]==='v'){const u=CAR_UNLOCK[+k.slice(2)];return !(u&&u.p>0);}const o=sb.bqCos(k);return !(o.d&&o.d.p>0);});
  sansPrix.length?ko('la vitrine gardée sert '+sansPrix.join(', ')+' sans prix en dollars (carte « $ NaN » / « $ 0 »)'):ok('vitrine retirée : aucun objet sans prix ('+B.l.join(', ')+')');
  /* une vitrine saine (que des objets à vendre) est gardée telle quelle : un achat ne la remélange pas */
  const saine=['v:4','v:5','v:6','v:7','v:8','aile:helices','aile:pigeon','trainee:rose'];
  sb.SAVE.d.bq={j:j,l:saine.slice()};const B2=sb.bqVitrine();
  B2.l.join()===saine.join()?ok('une vitrine saine est gardée telle quelle'):ko('vitrine saine retirée : '+B2.l.join());
  /* ce que la carte affichait : fmtC(undefined) */
  const f=ligne('function fmtC(v){')?tranche('function fmtC(v){','\n}',0)+'\n}':'';
  if(f){const s2={Math,LANG:'fr',CUR(){return '$';},LOC(){return 'fr-FR';},unitsL(){return [[1e9,'Md'],[1e6,'M'],[1e3,'k']];}};vm.createContext(s2);vm.runInContext(f,s2);
    console.log('     (pour mémoire : la carte d\'un objet sans `p` affichait « '+s2.fmtC(undefined)+' »)');}
}
console.log(KO.length?'PREUVE KO — '+KO.join(' | '):'PREUVE OK');process.exitCode=KO.length?1:0;
