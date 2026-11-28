/* ===== TESTS DE graines.js (27/11/2026) : le generateur, sa reprise, les graines d'entrainement, de validation et du coffre =====
   usage : node ml/evolution/tests/graines.test.js   (code 0 si tout passe, 1 sinon ; Node pur, sans course) */
'use strict';
const path=require('path'),fs=require('fs');
const Gr=require(path.join(__dirname,'..','graines.js'));
const cfg=JSON.parse(fs.readFileSync(path.join(__dirname,'..','config.json'),'utf8'));
let rates=0,passes=0;
function test(nom,f){try{f();passes++;console.log('PASSE  '+nom);}catch(e){rates++;console.log('ECHEC  '+nom+'\n       '+(e&&e.stack||e));}}
function vrai(c,m){if(!c)throw new Error(m||'faux');}
function egal(a,b,m){if(JSON.stringify(a)!==JSON.stringify(b))throw new Error((m||'different')+' : '+JSON.stringify(a).slice(0,200)+' contre '+JSON.stringify(b).slice(0,200));}

/* la formule du contrat, recopiee ici a part : le module doit lui obeir au bit pres */
function temoinMulberry(etat){let a=etat|0;return ()=>{a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return ((t^(t>>>14))>>>0)/4294967296;};}

test('mulberry32 suit la formule du contrat (5 etats, 1000 tirages)',()=>{
  for(const e of [0,1,20261127,4294967295,2918734561]){const r=Gr.mulberry32(e),t=temoinMulberry(e);
    for(let i=0;i<1000;i++){const x=r.suivant(),y=t();if(x!==y)throw new Error('etat '+e+', tirage '+i+' : '+x+' contre '+y);vrai(x>=0&&x<1);}}});

test('entier, choisir, melanger, normal, poisson : bornes et moyennes',()=>{
  const r=Gr.mulberry32(7);const c=new Array(5).fill(0);for(let i=0;i<50000;i++){const k=r.entier(5);vrai(k>=0&&k<5&&k===Math.floor(k));c[k]++;}
  for(const x of c)vrai(Math.abs(x-10000)<500,'entier(5) desequilibre '+c);
  let s=0,s2=0;const N=40000;for(let i=0;i<N;i++){const z=r.normal();s+=z;s2+=z*z;}
  vrai(Math.abs(s/N)<.03,'moyenne de normal '+s/N);vrai(Math.abs(s2/N-1)<.04,'variance de normal '+s2/N);
  let p=0;for(let i=0;i<N;i++){const k=r.poisson(2);vrai(k>=0&&k===Math.floor(k));p+=k;}vrai(Math.abs(p/N-2)<.05,'moyenne de poisson(2) '+p/N);
  const T=[0,1,2,3,4,5,6,7,8,9],M=r.melanger(T);vrai(M===T,'melanger rend le meme tableau');egal(T.slice().sort((a,b)=>a-b),[0,1,2,3,4,5,6,7,8,9]);
  vrai(['a','b','c'].includes(r.choisir(['a','b','c'])));
  /* normal use exactement deux tirages, sans cache */
  const a=Gr.mulberry32(99),b=temoinMulberry(99);const z=a.normal(),u1=b(),u2=b();vrai(z===Math.sqrt(-2*Math.log(1-u1))*Math.cos(2*Math.PI*u2),'Box-Muller');
  vrai(a.suivant()===b(),'normal a use plus de deux tirages');});

test('reprise du generateur : etat sauve en JSON, relu, memes tirages',()=>{
  const r=Gr.mulberry32(cfg.graineMaitre);for(let i=0;i<777;i++)r.suivant();r.normal();r.poisson(2);
  const sauve=JSON.parse(JSON.stringify({rng:r.etat()})).rng;vrai(Number.isInteger(sauve)&&sauve>=0&&sauve<=4294967295,'etat non signe 32 bits');
  const q=Gr.mulberry32(sauve);for(let i=0;i<2000;i++){const x=r.suivant(),y=q.suivant();if(x!==y)throw new Error('tirage '+i+' different apres reprise');}});

test('reprise des graines : un arret au milieu (population.json relue) redonne les memes lots',()=>{
  const n=cfg.grainesParGeneration;
  const tout=[];{const r=Gr.mulberry32(cfg.graineMaitre);let eg=Gr.etatInitial(cfg);for(let g=0;g<120;g++){const x=Gr.grainesEntrainement(eg,r,n,cfg);eg=x.eg;tout.push(x.graines);}}
  const repris=[];{let r=Gr.mulberry32(cfg.graineMaitre),eg=Gr.etatInitial(cfg);
    for(let g=0;g<120;g++){
      if(g%7===3){const pop=JSON.parse(JSON.stringify({rng:r.etat(),graines:eg}));r=Gr.mulberry32(pop.rng);eg=pop.graines;}
      const x=Gr.grainesEntrainement(eg,r,n,cfg);eg=x.eg;repris.push(x.graines);}}
  egal(repris,tout,'lots apres reprise');});

/* (28/11/2026, lot « regles ») l'ancien comportement a l'epuisement (le retirage avec remise) n'existe plus qu'avec auBout "rejouer" (ou une config sans
   suite) : ce test le garde, sur une config d'avant ce lot */
const cfgAncien=JSON.parse(JSON.stringify(cfg));delete cfgAncien.graines.entrainement.suite;delete cfgAncien.graines.auBout;
test('entrainement (config d\'avant, sans suite) : sans remise sur les 1081 graines, puis avec remise hors des 5 derniers lots',()=>{
  const cfg=cfgAncien;
  const E=cfg.graines.entrainement,r=Gr.mulberry32(5);let eg=Gr.etatInitial(cfg);
  egal(eg.reserve.length,E.n);
  const vues=new Map(),lots=[];
  for(let g=0;g<130;g++){
    const avant=JSON.stringify(eg),x=Gr.grainesEntrainement(eg,r,12,cfg);egal(JSON.stringify(eg),avant,'eg modifie en place');eg=x.eg;
    egal(x.graines.length,12);egal(new Set(x.graines).size,12,'graine double dans un lot');
    for(const s of x.graines){vrai(s>=910000&&s<950000&&(s-910000)%37===0&&(s-910000)/37<E.n,'graine hors table '+s);}
    if(lots.length*12+12<=E.n)for(const s of x.graines){vrai(!vues.has(s),'graine reprise avant la fin de la reserve '+s);vues.set(s,g);}
    if(lots.length*12>=E.n){const rec=new Set(lots.slice(-cfg.graines.exclureRecentes).flat());for(const s of x.graines)vrai(!rec.has(s),'graine d\'un lot recent '+s+' (lot '+g+')');}
    lots.push(x.graines);vrai(eg.recentes.length<=cfg.graines.exclureRecentes);egal(eg.recentes[eg.recentes.length-1],x.graines);}
  /* les 90 premiers lots ont use 1080 graines distinctes, le 91e prend la derniere de la reserve */
  egal(vues.size,1080);const l91=lots[90];vrai(l91.filter(s=>!vues.has(s)).length>=1,'la derniere graine de la reserve');
  vrai(new Set(lots.slice(0,91).flat()).size===1081,'les 1081 graines vues une fois avant toute remise');});

test('validation : compteur global, jamais deux fois ; repli ; fin avec alerte',()=>{
  let eg=Gr.etatInitial(cfg);const vu=new Set();
  for(let t=0;t<5;t++){const v=Gr.grainesValidation(eg,24,cfg);vrai(v.alerte===null);egal(v.graines.length,24);
    for(const s of v.graines){vrai(!vu.has(s),'graine de validation reprise '+s);vu.add(s);vrai(s>=1000000&&(s-1000000)%37===0);}eg=v.eg;}
  egal(eg.validationK,120);egal(Gr.grainesValidation(Gr.etatInitial(cfg),2,cfg).graines,[1000000,1000037]);
  let e2=Object.assign(Gr.etatInitial(cfg),{validationRepli:true});
  const v=Gr.grainesValidation(e2,24,cfg);egal(v.graines[0],950000);egal(v.graines[23],950000+37*23);
  e2=Object.assign(Gr.etatInitial(cfg),{validationRepli:true,validationK:1070});
  const w=Gr.grainesValidation(e2,24,cfg);egal(w.graines,[]);vrai(typeof w.alerte==='string'&&w.alerte.length>0);vrai(w.eg.validationFinie===true);
  const z=Gr.grainesValidation(w.eg,24,cfg);egal(z.graines,[]);vrai(!!z.alerte);
  /* le repli ne touche jamais le coffre ni l'entrainement */
  vrai(950000+37*1080<990000);});

test('coffre : 40 graines fixes 990000 + 37 j',()=>{const C=Gr.grainesCoffre(cfg);egal(C.length,40);egal(C[0],990000);egal(C[39],990000+37*39);egal(Gr.grainesCoffre(cfg),C);});

test('rngDe : tire d\'un sha1, deterministe, sans toucher au maitre',()=>{
  const m=Gr.mulberry32(42),e0=m.etat();const a=Gr.rngDe('abc|12'),b=Gr.rngDe('abc|12'),c=Gr.rngDe('abc|13');
  const x=[a.suivant(),a.suivant()],y=[b.suivant(),b.suivant()];egal(x,y);vrai(c.suivant()!==x[0]);egal(m.etat(),e0);
  const sha=require('crypto').createHash('sha1').update('abc|12').digest('hex');egal(Gr.rngDe('abc|12').suivant(),temoinMulberry(parseInt(sha.slice(0,8),16))());});

/* ===== LA RESERVE D'ENTRAINEMENT (28/11/2026, lot « regles » ; la synthese § 4 M6) ===== */
const cp=require('child_process');
/* le graines.js d'avant ce lot, relu dans git (le commit du Ryzen, e93ff5cb5) ; null si git ne le donne pas */
function grainesAncien(){
  try{const t=cp.execFileSync('git',['show','e93ff5cb5:ml/evolution/graines.js'],{cwd:path.join(__dirname,'..'),encoding:'utf8',stdio:['ignore','pipe','ignore']});
    const dos=path.join(__dirname,'..','essais','regles');fs.mkdirSync(dos,{recursive:true});
    const f=path.join(dos,'graines-ancien.js');fs.writeFileSync(f,t.replace(/\r\n/g,'\n'));delete require.cache[f];return require(f);}catch(e){return null;}}
const GA=grainesAncien();
const lots=(G,cfg,graine,n,k,eg0)=>{const r=Gr.mulberry32(graine);let eg=eg0||G.etatInitial(cfg);const L=[];for(let g=0;g<k;g++){const x=G.grainesEntrainement(eg,r,n,cfg);eg=x.eg;L.push(x.graines);}return {L,eg,r};};
test('M6 AUJOURD\'HUI (le graines.js du Ryzen, e93ff5cb5) : apres 90 generations a 12 graines, les lots REJOUENT des graines deja jouees, sans rien dire',()=>{
  if(!GA)return console.log('       SAUTE : git ne donne pas graines.js du commit e93ff5cb5');
  const {L}=lots(GA,cfg,cfg.graineMaitre,12,120),vues=new Set();let premier=-1,rejouees=0;
  for(let g=0;g<L.length;g++){for(const s of L[g]){if(vues.has(s)){rejouees++;if(premier<0)premier=g;}vues.add(s);}}
  egal(premier,90,'premier lot qui rejoue (la generation 90, le 91e lot)');vrai(vues.size===1081,'graines distinctes '+vues.size);
  vrai(rejouees===120*12-1081,'graines rejouees '+rejouees);
  console.log('       ancien code : la generation '+premier+' (le '+(premier+1)+'e lot) tire 12 graines dont 11 deja jouees ; sur 120 lots, '+rejouees+' graines rejouees, aucune alerte');});
test('M6 : la meme plage en tete : les 90 premiers lots sont ceux d\'avant au bit pres, puis la suite (1000021 + 37 j), aucune graine rejouee sur 2 500 lots',()=>{
  const neuf=lots(Gr,cfg,cfg.graineMaitre,12,2500).L;
  if(GA){const vieux=lots(GA,cfg,cfg.graineMaitre,12,91).L;egal(neuf.slice(0,90),vieux.slice(0,90),'les 90 premiers lots');
    /* le 91e : la derniere graine de la reserve d'avant, au meme rang ; le reste vient de la suite */
    vrai(neuf[90].filter(s=>s<950000).length===1&&vieux[90].includes(neuf[90].find(s=>s<950000)),'le 91e lot');}
  const vues=new Set(),E=cfg.graines.entrainement,S=E.suite;let derniereAncienne=-1,premiereSuite=-1;
  for(let g=0;g<neuf.length;g++)for(const s of neuf[g]){
    vrai(!vues.has(s),'graine rejouee '+s+' (lot '+g+')');vues.add(s);
    if(s<950000){vrai((s-E.depart)%E.pas===0&&(s-E.depart)/E.pas<E.n,'hors de la plage d\'avant '+s);derniereAncienne=g;}
    else{vrai(s>=S.depart&&s<=S.fin&&(s-S.depart)%S.pas===0,'hors de la suite '+s);if(premiereSuite<0)premiereSuite=g;
      vrai(!(s>=950000&&s<=991443),'plage reservee '+s);vrai((s-1000000)%37!==0,'graine de la forme de la validation '+s);}}
  vrai(derniereAncienne===90&&premiereSuite===90,'les 1081 d\'avant d\'abord : derniere '+derniereAncienne+', premiere de la suite '+premiereSuite);
  vrai([...vues].filter(s=>s<950000).length===1081,'les 1081 graines d\'avant toutes jouees');
  /* combien la reserve tient */
  const tout=E.n+Math.floor((S.fin-S.depart)/S.pas)+1;egal(tout,27001081);
  egal(Gr.grainesRestantes(Gr.etatInitial(cfg),cfg),27001081);
  console.log('       '+tout+' graines : '+Math.floor(tout/12)+' generations a 12 graines, '+Math.floor(tout/8)+' a 8 ; 2 500 lots joues sans une graine rejouee');});
test('M6 : un etat ecrit par l\'ancien code (sans « blocs »), en cours ou deja vide, continue sans rejouer ni sauter une graine ; reprise a cheval sur un bloc',()=>{
  /* en cours : 50 lots par l'ancien code, puis la suite par le nouveau */
  const A=GA||Gr,a=lots(A,cfg,7,12,50),avant=new Set(a.L.flat());
  const sauve=JSON.parse(JSON.stringify({rng:a.r.etat(),graines:a.eg}));vrai(!('blocs' in sauve.graines)||GA===null,'l\'ancien etat a deja « blocs »');
  const b=lots(Gr,cfg,sauve.rng,12,100,sauve.graines),apres=b.L.flat();
  vrai(apres.every(s=>!avant.has(s)),'une graine rejouee apres la reprise');vrai(new Set(apres).size===apres.length,'doublon apres la reprise');
  vrai(apres.filter(s=>s<950000).length===1081-600,'des graines d\'avant sautees : '+apres.filter(s=>s<950000).length);
  /* vide : la reserve d'avant epuisee, en retirage (l'ancien etat ne peut pas le dire autrement) : la suite repart, rien n'est rejoue */
  const vide={reserve:[],recentes:[[910000]],validationK:48,validationRepli:false,validationFinie:false};
  const c=lots(Gr,cfg,9,12,3,vide).L.flat();vrai(c.every(s=>s>=1000021),'un etat vide rejoue : '+c.join(' '));egal(lots(Gr,cfg,9,1,1,vide).eg.blocs,1);egal(lots(Gr,cfg,9,1,1,vide).eg.validationK,48);
  /* reprise : population.json relu a chaque lot, en travers des blocs */
  const ref=lots(Gr,cfg,11,12,300).L;let r=Gr.mulberry32(11),eg=Gr.etatInitial(cfg);const rep=[];
  for(let g=0;g<300;g++){const p=JSON.parse(JSON.stringify({rng:r.etat(),graines:eg}));r=Gr.mulberry32(p.rng);eg=p.graines;const x=Gr.grainesEntrainement(eg,r,12,cfg);eg=x.eg;rep.push(x.graines);}
  egal(rep,ref,'reprise lot par lot');vrai(eg.blocs===3,'blocs '+eg.blocs);});
test('M6 : au bout de la reserve, un arret clair (GRAINES_EPUISEES), jamais un rejeu ; auBout « rejouer » garde l\'ancien retirage',()=>{
  const petit=JSON.parse(JSON.stringify(cfg));petit.graines.entrainement.suite.fin=1000021+37*(1081+500-1);   /* 1081 + 1581 graines */
  egal(Gr.grainesRestantes(Gr.etatInitial(petit),petit),1081+1581);
  const r=Gr.mulberry32(3);let eg=Gr.etatInitial(petit),n=0,leve=null;const vues=new Set();
  try{for(;;){const x=Gr.grainesEntrainement(eg,r,12,petit);for(const s of x.graines){vrai(!vues.has(s),'rejouee '+s);vues.add(s);}eg=x.eg;n++;}}catch(e){leve=e;}
  vrai(leve&&leve.code==='GRAINES_EPUISEES'&&/epuisees/.test(leve.message),'pas d\'arret clair : '+(leve&&leve.message));
  egal(n,Math.floor((1081+1581)/12),'lots joues');egal(vues.size,n*12);egal(Gr.grainesRestantes(eg,petit),(1081+1581)%12);
  /* le dernier lot incomplet n'est pas tire : la demande qui depasse est refusee entiere, eg n'a pas bouge */
  const avant=JSON.stringify(eg);try{Gr.grainesEntrainement(eg,r,12,petit);}catch(e){}egal(JSON.stringify(eg),avant);
  /* une demande qui tient exactement passe */
  const x=Gr.grainesEntrainement(eg,r,(1081+1581)%12,petit);egal(Gr.grainesRestantes(x.eg,petit),0);
  /* auBout "rejouer" : l'ancien retirage, sans erreur */
  const rej=JSON.parse(JSON.stringify(petit));rej.graines.auBout='rejouer';
  vrai(Gr.grainesRestantes(eg,rej)===Infinity,'rejouer : restantes');const y=Gr.grainesEntrainement(x.eg,r,12,rej);egal(y.graines.length,12);
  console.log('       '+n+' lots de 12, puis l\'arret : « '+leve.message.slice(0,120)+'… »');});
test('M6 : la validation jusqu\'a 96 graines (1 000 000 + 37 k) ne touche jamais l\'entrainement (les deux plages), le coffre ni le repli, sur 3 000 generations',()=>{
  const r=Gr.mulberry32(cfg.graineMaitre);let eg=Gr.etatInitial(cfg);const ent=new Set(),val=new Set();const coffre=new Set(Gr.grainesCoffre(cfg));
  for(let g=0;g<3000;g++){
    const x=Gr.grainesEntrainement(eg,r,g%3?12:8,cfg);eg=x.eg;for(const s of x.graines){vrai(!ent.has(s),'entrainement rejoue '+s);ent.add(s);}
    if(g%5===4){let n=0;for(const t of [24,12,12,12,12,12,12]){if(r.suivant()<.3&&n)break;const v=Gr.grainesValidation(eg,t,cfg);eg=v.eg;n+=t;egal(v.graines.length,t);
      for(const s of v.graines){vrai(!val.has(s),'validation reprise '+s);val.add(s);}}vrai(n<=96);}}
  for(const s of val){vrai(!ent.has(s),'validation = entrainement '+s);vrai(!coffre.has(s)&&!(s>=950000&&s<992000),'validation dans une plage reservee '+s);}
  for(const s of ent){vrai(!coffre.has(s)&&!(s>=950000&&s<1000000),'entrainement dans une plage reservee '+s);}
  /* et pour toujours : les deux progressions n'ont pas le meme reste modulo 37 (22 et 1) */
  egal(cfg.graines.entrainement.suite.depart%37,cfg.graines.entrainement.depart%37);vrai(cfg.graines.entrainement.depart%37!==cfg.graines.validation.depart%37);
  console.log('       '+ent.size+' graines d\'entrainement, '+val.size+' de validation (k = '+eg.validationK+') : aucune en commun ; restes modulo 37 : entrainement '+(910000%37)+', validation '+(1000000%37));});

console.log(`\n${passes} passe(s), ${rates} echec(s)`);process.exit(rates?1:0);
