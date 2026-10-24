/* preuve (relecture ÉCO, 24/10) : LA RÉVÉLATION D'UNE SECRÈTE ATTEND L'OFFRE DE SECONDE CHANCE. Une mission secrète à caisse réussie PENDANT
   la partie (LE HOT ROD : palier 10 musique allumée, LE DOGE : 10 REJOUER…) ouvrait sa scène (#m2Rev, plein écran, z-index 95) 1,4 s après l'écran
   de fin — par-dessus la plaque CONTINUER de la seconde chance, qui n'a que 5,5 s. Et la machine FINAL SPIN (z-index 250) couvrait une révélation en cours.
   node passation/preuves/preuve-revelation-chance.cjs "VERSION PRINCIPALE/index.html" — extrait m2RevAuto / m2RevAttend et le guetteur du FINAL SPIN. */
const fs=require('fs'),vm=require('vm');
const h=fs.readFileSync(process.argv[2]||__dirname+'/../../VERSION PRINCIPALE/index.html','utf8');
const KO=[];const ok=m=>console.log('OK   '+m),ko=m=>{KO.push(m);console.log('KO   '+m);};
function tranche(debut,fin,depuis){const i=h.indexOf(debut,depuis||0);if(i<0)throw new Error('introuvable : '+debut);const j=h.indexOf(fin,i+debut.length);if(j<0)throw new Error('fin introuvable : '+fin);return h.slice(i,j);}
function ligne(debut){const i=h.indexOf(debut);if(i<0)return '';return h.slice(i,h.indexOf('\n',i));}

/* ---- 1. la révélation et la seconde chance ---- */
{
  const code=tranche('function m2RevAuto(','function m2Revele(')+'\n'+ligne('function m2RevAttend(');
  let t=0,T=[],nid=1;
  const sb={M2REV:{on:false,id:null,t:0},Math,console,
    setTimeout(f,ms){const id=nid++;T.push({id,f,at:t+(ms||0)});return id;},clearTimeout(id){T=T.filter(x=>x.id!==id);},
    m2RevFile(){return sb.M2REV.on?[]:['palier10'];},m2EnC(){return false;},
    offreFin:5500,chanceAttend(){return t<sb.offreFin;},SPIN:{ouvert:false},
    reveles:[],m2Revele(id){sb.reveles.push({id,t,offre:t<sb.offreFin,spin:sb.SPIN.ouvert});sb.M2REV.on=true;sb.M2REV.id=id;return true;}};
  vm.createContext(sb);vm.runInContext(code,sb);
  const avance=function(jusqua){for(;;){T.sort((a,b)=>a.at-b.at);const x=T[0];if(!x||x.at>jusqua)break;T.shift();t=x.at;x.f();}t=jusqua;};
  /* l'écran de fin s'ouvre (t = 0) avec l'offre de seconde chance (5,5 s) ; objRenderV2 arme la révélation à 1,4 s */
  sb.m2RevAuto(1400);avance(12000);
  const r=sb.reveles[0];
  if(!r)ko('la révélation ne s\'ouvre jamais');
  else if(r.offre)ko('la révélation s\'ouvre à '+(r.t/1000).toFixed(1)+' s, PAR-DESSUS l\'offre de seconde chance (fin à 5,5 s)');
  else ok('la révélation attend la fin de l\'offre : ouverte à '+(r.t/1000).toFixed(1)+' s');
  /* sans offre : elle part à son heure (1,4 s), comme avant */
  sb.M2REV.on=false;sb.reveles.length=0;T=[];t=0;sb.offreFin=0;
  sb.m2RevAuto(1400);avance(5000);
  (sb.reveles.length===1&&sb.reveles[0].t===1400)?ok('sans offre : la révélation part à 1,4 s, inchangée'):ko('sans offre : '+JSON.stringify(sb.reveles));
  /* la machine FINAL SPIN ouverte : la révélation attend qu'elle se ferme (sinon elle se jouait DERRIÈRE la machine) */
  sb.M2REV.on=false;sb.reveles.length=0;T=[];t=0;sb.offreFin=0;sb.SPIN.ouvert=true;
  sb.m2RevAuto(1400);avance(3000);const pendant=sb.reveles.length;sb.SPIN.ouvert=false;avance(6000);
  (pendant===0&&sb.reveles.length===1&&!sb.reveles[0].spin)?ok('machine ouverte : la révélation attend sa fermeture'):ko('machine ouverte : révélée '+pendant+' fois pendant la machine');
  /* côté machine : le guetteur ne l'ouvre pas tant qu'une révélation est à l'écran */
  const g=ligne("const ok=(SAVE.d.spinJ|0)>0&&started&&gameOver");
  /M2REV\.on/.test(g)?ok('le guetteur du FINAL SPIN attend la fin d\'une révélation'):ko('le guetteur du FINAL SPIN ne regarde pas M2REV.on : la machine (z 250) couvre une révélation en cours');
}

console.log(KO.length?'PREUVE KO — '+KO.join(' | '):'PREUVE OK');process.exitCode=KO.length?1:0;
