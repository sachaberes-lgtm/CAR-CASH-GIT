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

test('entrainement : sans remise sur les 1081 graines, puis avec remise hors des 5 derniers lots',()=>{
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

console.log(`\n${passes} passe(s), ${rates} echec(s)`);process.exit(rates?1:0);
