/* ===== TESTS DE note.js (27/11/2026) : les trois controles de l'etape 3 sur l'etude du bruit, et des cas ou la reponse est connue =====
   usage : node ml/evolution/tests/note.test.js   (code 0 si tout passe, 1 sinon ; Node pur, sans course, moins de 10 s sur un coeur) */
'use strict';
const path=require('path'),fs=require('fs'),crypto=require('crypto');
const N=require(path.join(__dirname,'..','note.js')),Gr=require(path.join(__dirname,'..','graines.js'));
const R=require(path.join(__dirname,'..','..','bot','ressemblance.js'));
const cfg=JSON.parse(fs.readFileSync(path.join(__dirname,'..','config.json'),'utf8')),CN=cfg.note;
const ETUDE=path.join(__dirname,'..','..','ecurie','etude','selection-naturelle','bruit','courses-0.json');
const t0=Date.now();let rates=0,passes=0;
function test(nom,f){try{f();passes++;console.log('PASSE  '+nom);}catch(e){rates++;console.log('ECHEC  '+nom+'\n       '+(e&&e.stack||e));}}
function vrai(c,m){if(!c)throw new Error(m||'faux');}
function proche(a,b,tol,m){if(!(Math.abs(a-b)<=tol))throw new Error((m||'ecart')+' : '+a+' contre '+b+' (tolerance '+tol+')');}

/* une reference des joueurs fabriquee : chaque mesure a la moyenne 0 et l'ecart-type 1, donc z = la valeur de la mesure */
const CLES=R.MESURES.map(x=>x[0]);
const REF0={};for(const k of CLES)REF0[k]={m:0,s:1,n:10};
const mesure=f=>{const m={};for(const k of CLES)m[k]=f(k);return m;};
const ligne=(id,graine,palier,m,o)=>Object.assign({id,graine,palier,survie_s:20*palier+30,mesuree:true,usage:'entrainement',mesures:m===undefined?null:m},o||{});

/* ===== 1. L'ETAPE 3 SUR L'ETUDE DU BRUIT ===== */
test('etape 3 sur courses-0.json : (a) b du lot 930000 ≈ -0,8 ; (b) fiabilite de â ≥ 0,44 ; (c) ecart classique de pilote-voltige 1,67 ± 0,1',()=>{
  const X=JSON.parse(fs.readFileSync(ETUDE,'utf8'));
  const sha=crypto.createHash('sha1').update(fs.readFileSync(path.join(__dirname,'..','..','ecurie','pilote-voltige.js'))).digest('hex');
  const r=N.controlesEtude(X,CN,N.referenceEpoque(),sha);
  console.log(`       (a) difference des b ${r.a.diff.toFixed(3)} · sigma des residus ${r.a.sigmaRes.toFixed(3)} (etude : 3,21)`);
  console.log(`       (b) fiabilite de â ${r.b.r_ahat.toFixed(4)} · du palier moyen ${r.b.r_palierMoyen.toFixed(4)} · ${r.b.pilotes} pilotes`);
  console.log(`       (c) ${r.c.fichier} ${r.c.parSha?'(sha de pilote-voltige.js)':'(par son nom : le sha de pilote-voltige.js ne correspond plus)'} · ecart classique ${r.c.ecartClassique} · E ${r.c.E.toFixed(3)} ± ${r.c.seE.toFixed(3)} · ${r.c.parties} parties`);
  egal(r.pilotes,34,'34 pilotes aux deux lots');egal(r.courses,816,'34 x 24 courses');
  vrai(r.a.ok,'(a)');vrai(r.b.ok,'(b)');vrai(r.c.ok,'(c)');
  proche(r.a.sigmaRes,3.21,.01,'sigma des residus de l\'analyse de variance de l\'etude');});
function egal(a,b,m){if(JSON.stringify(a)!==JSON.stringify(b))throw new Error((m||'different')+' : '+JSON.stringify(a)+' contre '+JSON.stringify(b));}

/* ===== 2. LE MODELE PILOTE + GRAINE RETROUVE a_p ET b_g CONNUS ===== */
test('modele sans bruit, plan incomplet (18 % de cases vides) : a_p et b_g retrouves',()=>{
  const rng=Gr.mulberry32(11),P=15,G=40,a=[],b=[],L=[];
  for(let p=0;p<P;p++)a.push(5+4*rng.suivant());for(let g=0;g<G;g++)b.push(3*rng.normal());
  const mb=b.reduce((x,y)=>x+y,0)/G;
  for(let p=0;p<P;p++)for(let g=0;g<G;g++){if(rng.suivant()<.18&&g>0)continue;L.push(ligne('p'+p,910000+37*g,a[p]+b[g]));}
  const f=N.ajuster(L,{passes:10,retrecir:12});
  /* identifiable a une constante pres : b centre (moyenne nulle sur les graines), la constante passe dans a */
  let ea=0,eb=0;for(let p=0;p<P;p++)ea=Math.max(ea,Math.abs(f.a['p'+p]-(a[p]+mb)));for(let g=0;g<G;g++)eb=Math.max(eb,Math.abs(f.b[910000+37*g]-(b[g]-mb)));
  console.log(`       ecart maximal sur a ${ea.toExponential(2)}, sur b ${eb.toExponential(2)}, sigma des residus ${f.sigmaRes.toExponential(2)}`);
  vrai(ea<1e-2&&eb<1e-2,'a ou b mal retrouves');vrai(f.sigmaRes<1e-2);
  const sb=Object.values(f.b).reduce((x,y)=>x+y,0);proche(sb,0,1e-9,'b centre');});

test('modele avec bruit N(0,3) : a_p retrouves a l\'erreur-type pres, sigma ≈ 3, retrecissement et se exacts',()=>{
  const rng=Gr.mulberry32(12),P=20,G=60,a=[],b=[],L=[];
  for(let p=0;p<P;p++)a.push(4+6*rng.suivant());for(let g=0;g<G;g++)b.push(2*rng.normal());
  const mb=b.reduce((x,y)=>x+y,0)/G;
  for(let p=0;p<P;p++)for(let g=0;g<G;g++){if(p>=17&&g>=6)continue;L.push(ligne('p'+p,910000+37*g,a[p]+b[g]+3*rng.normal()));}
  const f=N.ajuster(L,{passes:10,retrecir:12});
  proche(f.sigmaRes,3,.25,'sigma des residus');
  let z2=0;for(let p=0;p<P;p++){const id='p'+p,z=(f.a[id]-(a[p]+mb))/f.se[id];z2+=z*z;vrai(Math.abs(z)<4,'a de '+id+' a '+z.toFixed(1)+' erreurs-types');}
  vrai(z2/P<2.5,'les erreurs-types sont trop petites (moyenne des z² '+(z2/P).toFixed(2)+')');
  const ids=Object.keys(f.a),abar=ids.reduce((s,i)=>s+f.a[i],0)/ids.length;proche(f.abar,abar,1e-12,'ā');
  for(const id of ids){const n=f.n[id];proche(f.ahat[id],(f.a[id]-abar)*n/(n+12)+abar,1e-12,'â de '+id);proche(f.se[id],f.sigmaRes/Math.sqrt(n),1e-12,'se de '+id);}
  egal(f.n.p17,6,'un nouveau-ne a 6 courses');
  /* le nouveau-ne est ramene vers la moyenne plus fort qu'un ancien */
  const k17=f.n.p17/(f.n.p17+12),k0=f.n.p0/(f.n.p0+12);vrai(k17<.34&&k0>.8);
  /* la survie suit le meme modele (survie = 20 palier + 30) */
  for(const id of ids)proche(f.survie.a[id],20*f.a[id]+30,1e-6,'survie de '+id);});

test('exclure retire une graine pour tous ; les lignes non mesurees ne comptent pas ; l\'entree n\'est pas touchee',()=>{
  const L=[ligne('x',1,5),ligne('x',2,9),ligne('y',1,3),ligne('y',2,7),ligne('x',3,100,null,{mesuree:false}),ligne('y',3,-100)];
  const avant=JSON.stringify(L);
  const f=N.ajuster(L,{exclure:new Set([3])});egal(JSON.stringify(L),avant,'entree modifiee');
  egal(f.n,{x:2,y:2});proche(f.a.x-f.a.y,2,1e-9);proche(f.b[2]-f.b[1],4,1e-9);
  const g=N.ajuster(L,{exclure:[3]});egal(g.a,f.a,'exclure en tableau');});

/* ===== 3. L'ECART « DANS LA FOULE » ===== */
test('E : zone morte, borne a 8, poids 0,5, moyenne ponderee',()=>{
  const M=k=>Array.from({length:8},()=>mesure(k));
  proche(N.ecartFoule(M(()=>3),REF0,CN).E,2,1e-9,'z = 3 partout -> E = 2');
  proche(N.ecartFoule(M(()=>.9),REF0,CN).E,0,1e-9,'sous un sigma -> 0');
  proche(N.ecartFoule(M(()=>-20),REF0,CN).E,7,1e-9,'borne a 8 -> 7');
  /* z = 3 sur les quatre mesures a demi-poids, 0 ailleurs : (4 x 0,5 x 2) / (11 + 4 x 0,5) = 4/13 */
  const demi=['volDuree','ondulation','vols','volsCourts'];
  const r=N.ecartFoule(M(k=>demi.includes(k)?3:0),REF0,CN);proche(r.E,4/13,1e-9,'poids');
  egal(r.parties,8);proche(r.seE,0,1e-12,'parties identiques : se_E nul');vrai(r.ecartClassique!=null);proche(r.z.vols,3,1e-9);
  /* l'ecart classique est celui de ressemblance.ecart */
  egal(r.ecartClassique,R.ecart(null,{mesures:M(k=>demi.includes(k)?3:0),reference:REF0}).ecart);});

test('un pilote sans assez de parties : E = 4 (le pire), se_E = 0, F = â - 16',()=>{
  const ms=[mesure(()=>0),mesure(()=>0),mesure(()=>0),mesure(()=>0)];
  const r=N.ecartFoule(ms.concat([null,null]),REF0,CN);egal(r.parties,4);egal(r.E,4);egal(r.seE,0);
  const r0=N.ecartFoule([],REF0,CN);egal(r0.E,4);egal(r0.ecartClassique,null);
  /* dans noter : 12 courses dont 4 de plus de 60 s */
  const L=[];for(let g=0;g<12;g++){L.push(ligne('court',g,6,g<4?mesure(()=>0):null));L.push(ligne('long',g,6,mesure(()=>0)));}
  const n=N.noter(L,{REF:REF0,cfg:CN});
  egal(n.par.court.E,4);egal(n.par.court.se_E,0);egal(n.par.court.parties,4);proche(n.par.court.F,n.par.court.ahat-16,1e-12);
  egal(n.par.long.E,0);proche(n.par.long.F,n.par.long.ahat,1e-12);
  proche(n.par.court.se_F,n.par.court.se_a,1e-12,'se_F = se_a quand se_E = 0');});

test('se_E : bootstrap des parties, de l\'ordre de l\'ecart-type de la moyenne ; deterministe',()=>{
  const rng=Gr.mulberry32(3),M=[];for(let i=0;i<40;i++)M.push(mesure(()=>3+rng.normal()));
  const r1=N.ecartFoule(M,REF0,CN,Gr.rngDe('x')),r2=N.ecartFoule(M,REF0,CN,Gr.rngDe('x'));
  egal(r1,r2,'meme rng, meme resultat');
  /* E ≈ moyenne des |moyennes| - 1 ; chaque moyenne a l'ecart-type 1/√40 = 0,158, E en moyenne 15 de ces moyennes : ≈ 0,04 */
  vrai(r1.seE>.02&&r1.seE<.08,'se_E '+r1.seE);});

/* ===== 4. LA NOTE DE TOUS ===== */
test('noter : F = â - 4 E, se_F, deterministe, entree intacte, ids demandes',()=>{
  const rng=Gr.mulberry32(21),L=[];
  for(let g=0;g<24;g++){const bg=2*rng.normal();
    L.push(ligne('bon',900+g,9+bg+rng.normal(),mesure(()=>1.5+.3*rng.normal())));
    L.push(ligne('moyen',900+g,7+bg+rng.normal(),mesure(()=>2+.3*rng.normal())));
    if(g<12)L.push(ligne('neuf',900+g,8+bg+rng.normal(),mesure(()=>1+.3*rng.normal())));}
  const avant=JSON.stringify(L),a=N.noter(L,{REF:REF0,cfg:cfg}),b=N.noter(L,{REF:REF0,cfg:CN});
  egal(JSON.stringify(L),avant,'entree modifiee');egal(a,b,'cfg complet ou cfg.note : meme note, et deterministe');
  for(const id of ['bon','moyen','neuf']){const x=a.par[id];proche(x.F,x.ahat-4*x.E,1e-12);proche(x.se_F,Math.sqrt(x.se_a**2+16*x.se_E**2),1e-12);
    vrai(x.n===(id==='neuf'?12:24));vrai(x.se_E>0);}
  vrai(a.par.bon.F>a.par.moyen.F,'le bon devant');
  /* ids = les VIVANTS (2026-11-27, le correcteur) : ā est la moyenne de leurs a. Avec tous les ids, la meme note ; avec ['neuf','absent'],
     ā = a(neuf) (le seul vivant mesure), donc â(neuf) = a(neuf), et l'absent est ramene a ce ā */
  const t=N.noter(L,{REF:REF0,cfg:CN,ids:['bon','moyen','neuf']});egal(t.par.neuf,a.par.neuf);proche(t.abar,a.abar,1e-12);
  const c=N.noter(L,{REF:REF0,cfg:CN,ids:['neuf','absent']});egal(Object.keys(c.par),['neuf','absent']);
  proche(c.abar,a.par.neuf.a,1e-12);proche(c.par.neuf.ahat,a.par.neuf.a,1e-12);egal(c.par.neuf.a,a.par.neuf.a);egal(c.par.neuf.E,a.par.neuf.E);
  egal(c.par.absent.n,0);egal(c.par.absent.E,4);proche(c.par.absent.ahat,c.abar,1e-12);egal(c.par.absent.se_F,null);});

/* ===== 4 bis. LES DEFAUTS RELEVES PAR LA RELECTURE STATISTIQUE (2026-11-27, le correcteur) ===== */
test('ā sur les vivants seulement : des vires malchanceux ne tirent plus les nouveau-nes vers le bas',()=>{
  /* 6 anciens vivants (a = 8, 200 courses... ici 48), 6 vires (a = 4, 48 courses), un nouveau-ne (a = 8, 24 courses), sans bruit */
  const L=[];
  for(let g=0;g<48;g++){
    for(let p=0;p<6;p++)L.push(ligne('vif'+p,700+g,8+(g%5-2),null));
    for(let p=0;p<6;p++)L.push(ligne('mort'+p,700+g,4+(g%5-2),null));
    if(g<24)L.push(ligne('neuf',700+g,8+(g%5-2),null));}
  const vivants=['vif0','vif1','vif2','vif3','vif4','vif5','neuf'];
  const avec=N.noter(L,{REF:REF0,cfg:CN,ids:vivants}),sans=N.noter(L,{REF:REF0,cfg:CN});
  console.log('       ā vivants '+avec.abar.toFixed(3)+' (attendu a(vif0) '+avec.par.vif0.a.toFixed(3)+') ; ā tous '+sans.abar.toFixed(3)+' ; â du nouveau-ne '+avec.par.neuf.ahat.toFixed(3)+' (tous : '+sans.par.neuf.ahat.toFixed(3)+')');
  proche(avec.abar,avec.par.vif0.a,1e-9);proche(avec.par.neuf.ahat,avec.par.neuf.a,1e-9);proche(avec.par.neuf.a,avec.par.vif0.a,1e-9);
  vrai(sans.par.neuf.ahat<7.5,'sans ids, l\'ancien calcul (morts compris) penalise bien le nouveau-ne');});

test('E : une mesure de la reference absente de toutes les parties compte au pire (borneZ - zoneMorte), avec son poids',()=>{
  const cles=Object.keys(REF0).filter(k=>REF0[k]);
  const pleines=[];for(let i=0;i<6;i++){const m={};for(const k of cles)m[k]=REF0[k].m;pleines.push(m);}
  const E0=N.ecartFoule(pleines,REF0,CN).E;
  const k0=cles[0],sans=pleines.map(m=>{const x=Object.assign({},m);delete x[k0];return x;});
  const r=N.ecartFoule(sans,REF0,CN);
  let W=0;for(const k of cles)W+=(CN.poidsMesures&&CN.poidsMesures[k]!=null?CN.poidsMesures[k]:1);
  const wk=CN.poidsMesures&&CN.poidsMesures[k0]!=null?CN.poidsMesures[k0]:1,attendu=wk*(CN.borneZ-CN.zoneMorte)/W;
  console.log('       toutes les mesures au milieu des joueurs : E '+E0+' ; sans « '+k0+' » : E '+r.E.toFixed(4)+' (attendu '+attendu.toFixed(4)+')');
  proche(E0,0,1e-12);proche(r.E,attendu,1e-12);egal(r.z[k0],null);});

test('sacre : seuil de cfg.validation.seuilSacre (2 par defaut) ; entre 1 et 2 se, pas de sacre',()=>{
  /* A bat B de 1,5 palier en moyenne avec un bruit qui donne se(ΔF) ≈ 1 : sacre a 1 se, pas a 2 se */
  const LA=[],LB=[],m={};for(const k of Object.keys(REF0))if(REF0[k])m[k]=REF0[k].m;
  const mB=z=>{const x={};for(const k of Object.keys(m))x[k]=z;return x;};
  for(let g=0;g<24;g++){const d=g%2?6.4:-3.4;LA.push(ligne('A',1000+g,10+d,m));LB.push(ligne('B',1000+g,10,mB(g%2?1.2:.8)));}
  const un=N.comparer(LA,LB,{REF:REF0,cfg:Object.assign({},cfg,{validation:Object.assign({},cfg.validation,{seuilSacre:1})})});
  const deux=N.comparer(LA,LB,{REF:REF0,cfg:cfg});
  const defaut=N.comparer(LA,LB,{REF:REF0,cfg:Object.assign({},cfg,{validation:Object.assign({},cfg.validation,{seuilSacre:undefined})})});
  console.log('       dF '+deux.dF.toFixed(3)+' ± '+deux.se_dF.toFixed(3)+' : seuil 1 '+un.sacre+', seuil 2 '+deux.sacre+', sans seuil '+defaut.sacre);
  vrai(deux.dF>deux.se_dF&&deux.dF<2*deux.se_dF,'le cas doit tomber entre 1 et 2 se');
  vrai(un.sacre===true,'a 1 se : sacre');vrai(deux.sacre===false,'a 2 se : pas sacre');vrai(defaut.sacre===false,'le defaut est 2');});

/* ===== 5. LA VALIDATION : BOOTSTRAP APPARIE ===== */
test('comparer : reponse connue (Δpalier 2, se ≈ 1/√24 malgre un effet de graine de ±10 ; ΔE 1,5 exact ; ΔF = -4)',()=>{
  const LA=[],LB=[];
  for(let g=0;g<24;g++){const bg=(g%3-1)*10,d=g%2?3:1;
    LB.push(ligne('B',1000000+37*g,10+bg,mesure(()=>1.5)));LA.push(ligne('A',1000000+37*g,10+bg+d,mesure(()=>3)));}
  LA.push(ligne('A',5,99,mesure(()=>0)));/* une graine que B n'a pas : ignoree */
  const r=N.comparer(LA,LB,{REF:REF0,cfg:CN,tirages:400,rng:Gr.rngDe('test')});
  console.log(`       dPalier ${r.dPalier} ± ${r.se_dPalier.toFixed(4)} (attendu ${(1/Math.sqrt(24)).toFixed(4)}) · dE ${r.dE} ± ${r.se_dE} · dF ${r.dF} ± ${r.se_dF.toFixed(4)}`);
  egal(r.graines,24);proche(r.dPalier,2,1e-12);proche(r.dE,1.5,1e-12);proche(r.dF,-4,1e-12);
  /* d vaut 1 ou 3 (moitie-moitie) : ecart-type 1, celui de la moyenne de 24 : 0,204 (non apparie, l'effet de graine le porterait a ~1,7) */
  proche(r.se_dPalier,1/Math.sqrt(24),.03,'se du palier apparie');proche(r.se_dE,0,1e-12);proche(r.se_dF,r.se_dPalier,1e-12);
  egal(r.criteres,{a:false,b:true,c:false});egal(r.sacre,false);
  const s=N.comparer(LB,LA,{REF:REF0,cfg:CN,tirages:400,rng:Gr.rngDe('test')});proche(s.dF,4,1e-12);egal(s.criteres.a,true);
  /* c exige ΔE < +1 se : ici ΔE = -1,5 et se = 0 -> vrai ; b : Δpalier -2 < -1 x 0,2 -> faux */
  egal(s.criteres,{a:true,b:false,c:true});egal(s.sacre,false);});

test('comparer : un vrai meilleur est sacre, un clone ne l\'est pas ; deterministe',()=>{
  const rng=Gr.mulberry32(31),LA=[],LB=[],LC=[];
  for(let g=0;g<24;g++){const bg=3*rng.normal(),gr=1000000+37*g;
    const mB=mesure(()=>2+.5*rng.normal());LB.push(ligne('B',gr,8+bg+rng.normal(),mB));LC.push(ligne('C',gr,LB[g].palier,mB));
    LA.push(ligne('A',gr,10+bg+rng.normal(),mesure(()=>1.6+.5*rng.normal())));}
  const o={REF:REF0,cfg:CN,tirages:400,rng:Gr.rngDe('v')};
  const r=N.comparer(LA,LB,o),r2=N.comparer(LA,LB,{REF:REF0,cfg:CN,tirages:400,rng:Gr.rngDe('v')});
  console.log(`       meilleur : dF ${r.dF.toFixed(3)} ± ${r.se_dF.toFixed(3)} · dPalier ${r.dPalier.toFixed(3)} ± ${r.se_dPalier.toFixed(3)} · dE ${r.dE.toFixed(3)} ± ${r.se_dE.toFixed(3)} · sacre ${r.sacre}`);
  egal(r,r2,'deterministe');vrai(r.sacre,'le meilleur devrait etre sacre');vrai(r.se_dE>0);
  const c=N.comparer(LC,LB,{REF:REF0,cfg:CN,tirages:400,rng:Gr.rngDe('v')});egal(c.dF,0);egal(c.sacre,false);
  const v=N.comparer([],LB,{REF:REF0,cfg:CN});egal(v.graines,0);egal(v.sacre,false);});

/* ===== 6. LE TRI DES COURSES ===== */
test('pourquoiEcartee : les causes de noter.js, plus yeux, node et chargement',()=>{
  const ep={jeu_sha:'1a2b3c4d5e6f',version:'cashcar-v512',simulateur:'relief-canyon',node:'v24.22.3'};
  const bon={graine:1,pannes:0,cause:'roche',jeu:'cashcar-v512',jeu_sha:'1a2b3c4d5e6f',simulateur:'relief-canyon',node:'v24.22.3',yeuxTirages:0};
  egal(N.pourquoiEcartee(bon,ep),null);egal(N.pourquoiEcartee(bon,{composants:ep}),null,'une Epoque entiere');
  const mal=[{pannes:2},{cause:'panne'},{jeu_sha:''},{simulateur:'avant-relief'},{jeu_sha:'ffffffffffff'},{jeu:'cashcar-v511'},
    {yeuxTirages:3},{yeuxTirages:null},{yeuxTirages:undefined},{node:'v22.0.0'},{erreurFatale:'profil refuse'}];
  for(const m of mal){const x=N.pourquoiEcartee(Object.assign({},bon,m),ep);vrai(typeof x==='string'&&x.length>0,'non ecartee : '+JSON.stringify(m));}
  vrai(/^chargement : /.test(N.pourquoiEcartee({graine:1,erreurFatale:'x'},ep)));vrai(/non mesure/.test(N.pourquoiEcartee(Object.assign({},bon,{yeuxTirages:null}),ep)));
  egal(N.pourquoiEcartee(Object.assign({},bon,{erreurs:3,derniereErreur:'TypeError'}),ep),null,'une erreur du cerveau n\'ecarte pas (noter.js)');});

test('depuisEtude : le format des lignes',()=>{
  const X=JSON.parse(fs.readFileSync(ETUDE,'utf8')),L=N.depuisEtude(X);
  egal(L.length,X.reduce((s,x)=>s+x.courses.length,0));const l=L[0];
  vrai(l.mesuree===true&&l.usage==='entrainement'&&l.id===X[0].sha.slice(0,12)&&l.pilote===X[0].sha&&l.survie_s===X[0].courses[0].duree_s&&l.graine===X[0].courses[0].graine);});

const s=(Date.now()-t0)/1000;
test('moins de 10 s sur un coeur',()=>vrai(s<10,s+' s'));
console.log(`\n${passes} passe(s), ${rates} echec(s) en ${s.toFixed(1)} s`);process.exit(rates?1:0);
