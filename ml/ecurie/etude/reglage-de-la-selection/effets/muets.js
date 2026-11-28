/* ===== L'ETUDE « EFFETS » : LES MUTATIONS MUETTES PAR CONSTRUCTION (27/11/2026) =====
   Un gene est MUET tant qu'un drapeau eteint empeche le pilote de le lire. Avec le code du depot (ml/evolution/genome.js, genome v:2 de
   107 genes ; aucune course jouee) on tire 4000 naissances « mutation » du temoin par genome.muter (phase A, ml/evolution/config.json) et on compte :
   - la part des reels tires qui sont muets ;
   - la part des enfants dont TOUS les changements sont muets : ils jouent exactement les courses du parent, mais le pilote ecrit change
     (le genome est recopie dans REGLAGES et l'identifiant dans un commentaire), donc le cache ne les reconnait pas : 12 courses par
     generation pour rien, et une des 6 naissances perdue.
   QUI EST MUET (lu, pas mesure) :
   - genome v:1 : volRetour tant que volRetourOn = 0 (genome.js, ecrirePilote : « volRetour:0 ») ; retMarge, retCap, retGain, retAvance,
     retourPrime tant que retourOn = 0 (« retours:[] » ; modele.js ne lit retourPrime que pour les rayons « retourN », absents sans loi) ;
   - genome v:2 : en plus les 15 reels des cinq gestes tant que leur drapeau vaut 0 (INTERFACES.md § 9.3 : « drapeau a 0, son code ne
     s'execute pas, ses reglages ne sont pas lus », verifie au bit pres par identite.test.js) ; coupDecor (drapeau) tant que coupOn = 0.
   Un drapeau de geste qui s'allume, lui, n'est pas muet. Usage : node muets.js */
'use strict';
const fs=require('fs'),path=require('path');
const RAC=path.resolve(__dirname,'..','..','..','..','..');
const GEN=require(path.join(RAC,'ml','evolution','genome.js'));
const {mulberry32}=require(path.join(RAC,'ml','evolution','graines.js'));
const cfg=JSON.parse(fs.readFileSync(path.join(RAC,'ml','evolution','config.json'),'utf8'));
const t0=Date.now(),out=[];const dire=s=>{out.push(s);console.log(s);};
const GARDE={volRetour:'volRetourOn',retMarge:'retourOn',retCap:'retourOn',retGain:'retourOn',retAvance:'retourOn',retourPrime:'retourOn',
  lacheAvant:'lacheOn',slalomCap:'slalomOn',slalomDemi:'slalomOn',slalomH:'slalomOn',
  coupDepuis:'coupOn',coupEcart:'coupOn',coupDuree:'coupOn',coupPoseMin:'coupOn',coupAxe:'coupOn',coupAir:'coupOn',coupJauge:'coupOn',coupPerte:'coupOn',coupDecor:'coupOn',
  relacheT:'relacheOn',suitDerive:'suitOn',suitMarge:'suitOn'};
const PAR={};for(const b of GEN.BORNES)PAR[b.cle]=b;
for(const [c,d] of Object.entries(GARDE))if(!PAR[c]||!PAR[d])throw new Error('gene inconnu du genome : '+c+' / '+d);
const T=GEN.genomeTemoin(cfg);
const muet=(c,A)=>GARDE[c]!=null&&!A[GARDE[c]];
const v1=new Set(GEN.BORNES.slice(0,86).map(b=>b.cle));
const reels=GEN.CONTINUS,reelsMuets=reels.filter(c=>muet(c,T.A));
dire(`Genome v:${T.v} : ${GEN.BORNES.length} genes, ${reels.length} reels, dont ${reelsMuets.length} muets au temoin (${(100*reelsMuets.length/reels.length).toFixed(1)} %).`);
dire(`  dans les 86 genes du v:1 : ${reels.filter(c=>v1.has(c)).length} reels, dont ${reelsMuets.filter(c=>v1.has(c)).length} muets (${(100*reelsMuets.filter(c=>v1.has(c)).length/reels.filter(c=>v1.has(c)).length).toFixed(1)} %) : ${reelsMuets.filter(c=>v1.has(c)).join(', ')}`);
/* des naissances « mutation » du temoin, comme le maitre les fait */
function compter(N,o){
  let tires=0,tiresMuets=0,toutMuet=0,rien=0;
  for(let k=0;k<N;k++){const e=GEN.muter(T,mulberry32(7000+k),Object.assign({cfg},o||{}));
    const ch=e.mutes.filter(m=>m.cle!=='WV'&&m.cle!=='WS');
    for(const m of ch)if(PAR[m.cle].type==='reel'){tires++;if(muet(m.cle,e.genome.A))tiresMuets++;}
    if(!ch.length)rien++;
    /* tous les changements muets : chaque gene change est garde par un drapeau qui vaut 0 CHEZ L'ENFANT (un drapeau qui s'allume ne l'est pas) */
    else if(ch.every(m=>muet(m.cle,e.genome.A)))toutMuet++;}
  return {N,tires,tiresMuets,toutMuet,rien};}
const r=compter(4000);
dire(`${r.N} naissances « mutation » du temoin (1 + Poisson(${cfg.poissonMutations}) reels, sigma ${cfg.sigmaMutation}, drapeaux ${cfg.pDrapeau}) : ${(100*r.tiresMuets/r.tires).toFixed(1)} % des reels tires sont muets ;`);
dire(`  ${r.toutMuet} enfants (${(100*r.toutMuet/r.N).toFixed(1)} %) n'ont QUE des changements muets ; ${r.rien} sans aucun changement. Ces enfants jouent les courses du parent : ${cfg.grainesParGeneration} courses chacun a la generation de leur naissance, et toutes les suivantes tant qu'ils vivent.`);
const ri=compter(2000,{genes:cfg.immigreGenes,sigma:cfg.immigreSigma});
dire(`Immigres (${cfg.immigreGenes} reels, sigma ${cfg.immigreSigma}) : ${(100*ri.tiresMuets/ri.tires).toFixed(1)} % des reels tires muets ; ${(100*ri.toutMuet/ri.N).toFixed(2)} % entierement muets.`);
dire(`(${((Date.now()-t0)/1000).toFixed(1)} s)`);
fs.writeFileSync(path.join(__dirname,'muets.txt'),out.join('\n')+'\n');
