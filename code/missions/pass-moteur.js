/* ===== LE PASS DE MISSIONS — LE MOTEUR DES TROIS EMPLACEMENTS (2026-11-07, Léo : « 3 missions actives en même temps, remplacées au tirage dès qu'une est réussie ; tirage au hasard borné par la difficulté ; cadeaux à intervalle variable avec plafond garanti ») =====
   ⚠ INERTE sans ?pass=1 (PASS_ON) : rien n'est appelé, SAVE.d.pass reste null. Les données (réservoir, tranches, règles, PASS_CADEAU) sont dans pass-table.js ; l'écran dans pass-viseur.js.
   L'ÉTAT (SAVE.d.pass, borné dans sauvegarde.js) : sl = les 3 ids · cp = la partie où chaque emplacement a été tiré · tir = tirages faits · np = parties jouées · hab / car = missions prises depuis le dernier cadeau de ce genre (la JAUGE CACHÉE)
     · nh / nc = le seuil tiré dans la fenêtre [min,max] (le joueur ne peut pas le calculer ; `max` est une GARANTIE) · dep = missions prises depuis le dernier cadeau · dc = depuis la dernière caisse · nbH / nbC = cadeaux déjà donnés (l'écart s'allonge)
     · lh = la dernière famille d'habillage (pas deux peintures de suite) · ech = les missions échangées par le garde-fou (pas retirées tout de suite).
   LE TIRAGE (passTire), dans l'ordre : 1. une mission du réservoir DÉJÀ réussie et pas encore prise (migration, ou réussie hors emplacement) : elle se récupère une fois ; 2. LAGON, la petite peinture de base, au plus tard au 4e tirage ;
     3. un CADEAU si la jauge l'exige (voiture ou habillage, jamais deux de suite, jamais deux caisses à moins de 5 missions, jamais un objet déjà à toi) ; 4. sinon une mission d'argent/d'exploit au hasard dans les 2 tranches atteintes
     (jamais deux de la même famille en même temps si possible, jamais une mission déjà remplie). Anciennes missions réussies : elles comptent dans l'avancement du chapitre et ne sont jamais re-tirées ; les primes déjà prises (pr) ne sont jamais reversées. */
function passAl(a,b){a=Math.round(a);b=Math.round(b);return a+Math.floor(Math.random()*(Math.max(a,b)-a+1));}
function passVierge(){const P=PASS_CADEAU;return {v:1,sl:['','',''],cp:[0,0,0],tir:0,np:0,hab:0,car:0,nh:passAl(P.debut.hab-2,P.debut.hab),nc:passAl(P.debut.voiture[0],P.debut.voiture[1]),dep:9,dc:99,nbH:0,nbC:0,lh:'',ech:[]};}
function passEtat(){const d=SAVE.d;if(!d.pass||d.pass.v!==1)d.pass=passVierge();return d.pass;}
function passCompte(){const s=m2Etat();let n=0;for(const d of PASS_POOL)if(s.ok.indexOf(d.id)>=0)n++;return n;} /* missions du chapitre réussies (les anciennes comptent) */
function passTrancheAtteinte(){const n=passCompte();let t=1;for(const T of PASS_TRANCHES)if(n>=T[1])t=T[0];return t;}
function passEstCadeau(id){const d=passDef(id);return d?d.cadeau:null;}
function passPossede(m){const r=m.r||{};if(r.car){const i=m2CarIdx(r.car);return i<0||carOwned(i)||carRetiree(i);}if(r.cat)return shopOwned(r.cat,r.id);return false;}
function passEligible(d,E){ /* une mission qu'on peut tirer maintenant */
  if(d.spec&&d.spec.inf)return false; /* l'horizon du chapitre (hors de portée) n'est jamais tiré */
  const m=m2Def(d.id),s=m2Etat();if(!m||!m.pass||m.sortie||m.f==='secret'||!m2Dispo(m))return false;
  if(s.ok.indexOf(d.id)>=0||s.pr.indexOf(d.id)>=0||E.sl.indexOf(d.id)>=0||E.ech.indexOf(d.id)>=0)return false;
  if(passPossede(m))return false; /* jamais un objet déjà à toi */
  let v=0;try{v=m2Val(m);}catch(e){return false;}if(v>=m2Seuil(m))return false; /* jamais une mission déjà remplie à l'instant du tirage */
  return true;}
function passTire(E){
  const s=m2Etat(),P=PASS_CADEAU,R=PASS_REGLES,t=passTrancheAtteinte(),lo=Math.max(1,t-(R.fenetre-1));
  /* 1. réussie, pas encore prise : à récupérer une fois */
  for(const d of PASS_POOL){if(s.ok.indexOf(d.id)>=0&&s.pr.indexOf(d.id)<0&&E.sl.indexOf(d.id)<0&&m2Pret(d.id))return d.id;}
  const cand=PASS_POOL.filter(function(d){return passEligible(d,E);});
  /* 2. LAGON : la petite peinture de base, au plus tard au 4e tirage */
  for(const id in R.garanti)if(E.tir+1>=R.garanti[id]&&cand.some(function(d){return d.id===id;}))return id;
  /* 3. un cadeau si la jauge cachée l'exige */
  const dansCadeau=E.sl.some(function(id){return id&&passEstCadeau(id);});
  if(!dansCadeau&&E.dep>=P.ecartCadeaux){
    const vDu=E.car>=E.nc&&E.dc>=P.ecartCaisses,hDu=E.hab>=E.nh;let genre=null;
    if(vDu&&hDu)genre=E.lh==='_v'?'hab':'voiture';else if(vDu)genre='voiture';else if(hDu)genre='hab';
    if(genre){let L=cand.filter(function(d){return d.cadeau===genre;});
      if(genre==='hab'&&E.lh){const L2=L.filter(function(d){return ((d.rec||(m2Def(d.id)||{}).r||{}).cat||'')!==E.lh;});if(L2.length)L=L2;}
      if(L.length){const F=L.filter(function(d){return d.tr<=t+1&&d.tr>=lo;});const B=F.length?F:L.slice().sort(function(a,b){return a.tr-b.tr;}).slice(0,3);return B[Math.floor(Math.random()*B.length)].id;}}}
  /* 4. une mission « ordinaire » au hasard dans la fenêtre */
  const fams=E.sl.map(function(id){const m=id&&m2Def(id);return m?m.f:'';});
  const ord=cand.filter(function(d){return !d.cadeau;});
  let L=ord.filter(function(d){return d.tr>=lo&&d.tr<=t;});
  if(!L.length)L=ord.filter(function(d){return d.tr<=t+1;});
  if(!L.length)L=ord.slice().sort(function(a,b){return a.tr-b.tr;}).slice(0,4);
  if(!L.length)return '';
  const L2=L.filter(function(d){return R.memeFamille||fams.indexOf((m2Def(d.id)||{}).f)<0;});
  const B=L2.length?L2:L;return B[Math.floor(Math.random()*B.length)].id;}
/* les trois emplacements, remplis (au besoin) et sauvegardés ; le garde-fou échange une mission restée bloquée trop longtemps */
function passEnsure(){
  const E=passEtat(),s=m2Etat();let ch=false;
  for(let i=0;i<3;i++){
    let id=E.sl[i];
    if(id){const m=m2Def(id);if(!m||s.pr.indexOf(id)>=0){id='';E.sl[i]='';ch=true;}
      else if(!passEstCadeau(id)&&s.ok.indexOf(id)<0&&E.np-E.cp[i]>=Math.max(PASS_REGLES.echangeParties,2*(passDef(id)?passDef(id).p.debutant:0))){ /* garde-fou : trop longtemps bloquée */
        let v=0;try{v=m2Frac(m,m2Val(m),m2Seuil(m));}catch(e){}if(v<.9){E.ech.push(id);if(E.ech.length>6)E.ech.shift();E.sl[i]='';id='';ch=true;}}}
    if(!id){const n=passTire(E);if(n){E.sl[i]=n;E.cp[i]=E.np;E.tir++;ch=true;}}}
  if(ch)SAVE.mark();return E.sl.slice();}
function passApresPrise(id){ /* une récompense vient d'être prise : la jauge cachée monte, l'emplacement est tiré de nouveau */
  const E=passEtat(),P=PASS_CADEAU,d=passDef(id),k=E.sl.indexOf(id);if(k>=0)E.sl[k]='';
  E.hab++;E.car++;E.dep++;E.dc++;
  if(d&&d.cadeau==='voiture'){E.car=0;E.dc=0;E.dep=0;E.lh='_v';E.nc=Math.min(P.plafondCroit.voiture+P.voiture.max,passAl(P.voiture.min,P.voiture.max)+Math.floor(P.croit.voiture*E.nbC));E.nbC++;}
  else if(d&&d.cadeau==='hab'){E.hab=0;E.dep=0;const r=(m2Def(id)||{}).r||{};E.lh=r.cat||'';E.nh=Math.min(P.plafondCroit.hab+P.hab.max,passAl(P.hab.min,P.hab.max)+Math.floor(P.croit.hab*E.nbH));E.nbH++;}
  SAVE.mark();return passEnsure();}
function passPartie(){const E=passEtat();E.np++;SAVE.mark();passEnsure();} /* une partie jouée (m2Fin) */
function passPresque(){const E=passEtat(),P=PASS_CADEAU;return Math.max(E.car/Math.max(1,P.voiture.max),E.hab/Math.max(1,P.hab.max))>=P.presque;} /* « un cadeau est proche » (écran de fin), sans chiffre */
/* ---- LE CROCHET : dbgPass() · ('raz') · ('gagne',id) · ('sim',n) · ('voitures') ---- */
window.dbgPass=function(a,b){
  if(!PASS_ON)return 'sans ?pass=1';
  const E=passEtat();
  if(a==='raz'){SAVE.d.pass=null;passEnsure();return passEtat();}
  if(a==='gagne'){const s=m2Etat();if(s.ok.indexOf(b)<0){s.ok.push(b);s.nv.push(b);SAVE.flush();}return passEnsure();}
  if(a==='parties'){for(let i=0;i<(b|0||1);i++)passPartie();return passEtat().sl.slice();} /* banc : n parties de plus (le garde-fou d'échange) */
  if(a==='voitures'){const R={ok:[],perdues:[]};for(let i=0;i<CARS.length;i++){const u=CAR_UNLOCK[i];if(!u||u.k!=='mis'||carRetiree(i))continue;const m=m2Def(u.id);
      if(m&&(passDef(u.id)||m.f==='secret'))R.ok.push(CARS[i].name+' <- '+u.id+(m.f==='secret'?' (secrète)':' (pass, tranche '+passDef(u.id).tr+')'));else R.perdues.push(CARS[i].name+' <- '+u.id);}return R;}
  if(a==='sim'){ /* sans rien payer : n missions prises à la suite, puis tout est remis */
    const s=m2Etat(),sv=JSON.stringify([SAVE.d.pass,s.ok,s.pr,SAVE.d.owned,SAVE.d.shop.own]),log=[];let err=[];
    try{for(let n=1;n<=(b|0||60);n++){const sl=passEnsure(),pk=sl.findIndex(function(x){return x&&passEstCadeau(x);}),i=pk>=0?pk:0,id=sl[i];if(!id){err.push('vide à '+n);break;}
        if(new Set(sl).size<sl.filter(Boolean).length)err.push('doublon à '+n);
        const m=m2Def(id),d=passDef(id);if(s.ok.indexOf(id)<0)s.ok.push(id);s.pr.push(id);const r=m.r||{};
        if(r.car){const ci=m2CarIdx(r.car);if(ci>=0&&SAVE.d.owned.indexOf(ci)<0)SAVE.d.owned.push(ci);}if(r.cat){const kk=r.cat+':'+r.id;if(SAVE.d.shop.own.indexOf(kk)<0)SAVE.d.shop.own.push(kk);}
        log.push(n+':'+id+(d.cadeau?'*'+d.cadeau:'')+' t'+passTrancheAtteinte());passApresPrise(id);}}
    finally{const o=JSON.parse(sv);SAVE.d.pass=o[0];s.ok.length=0;s.ok.push.apply(s.ok,o[1]);s.pr.length=0;s.pr.push.apply(s.pr,o[2]);SAVE.d.owned.length=0;SAVE.d.owned.push.apply(SAVE.d.owned,o[3]);SAVE.d.shop.own.length=0;SAVE.d.shop.own.push.apply(SAVE.d.shop.own,o[4]);}
    return {log:log.join(' '),erreurs:err};}
  return {slots:passEnsure(),compte:passCompte(),tranche:passTrancheAtteinte(),jauge:{hab:E.hab+'/'+E.nh,car:E.car+'/'+E.nc,dep:E.dep,dc:E.dc},tirages:E.tir,parties:E.np,presque:passPresque()};
};
