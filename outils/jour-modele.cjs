// LE RETOUR DU JOUR + LE CADEAU — le modele qui PROUVE le bareme (2026-10-14, GAMEPLAY — Sacha : « la 1re partie du JOUR x2, plus un bonus de SERIE de jours » ·
// « un cadeau gratuit toutes les ~6 h, a ouvrir a l'accueil, facon Crossy Road »).
// Lancer : node outils/jour-modele.cjs [--n=4000] [--seed=7] [--rapide=1]      (autres baremes : --x2= --prime=0,25,.. --tmin= --cadmin= --cadpc= --deux=)
// Aucun navigateur : le jeu n'est PAS execute. Le modele REUTILISE celui de L'ARGENT DU DEBUT (outils/eco-debut-modele.cjs : memes routes de pieces, memes parties,
// memes carnets, meme relevement ECOD) et le fait vivre JOUR APRES JOUR. Les constantes du bareme (JOUR.x2, JOUR.prime, JOUR.tMin, CADO.periode/min/pc) sont LUES
// dans index.html — elles ne peuvent pas deriver d'une copie ; les comportements du joueur (1 a 3 parties par jour, 1 ou 2 seances...) sont des HYPOTHESES, marquees [H].
const fs=require('fs'),path=require('path');
const M=require('./eco-debut-modele.cjs');
const {PROFILS,partie,PEINTURE_MIN,mulberry,C1,C2,PERMIS,OPT_C2,quantiles,SRC}=M;
const arg=k=>{const a=process.argv.find(x=>x.startsWith('--'+k+'='));return a?a.split('=')[1]:null;};
const f$=x=>Math.round(x).toLocaleString('fr-FR').replace(/[  ]/g,' ');

// ---------- 1. LE BAREME, tel que le jeu l'ecrit (lignes `const JOUR={` et `const CADO={` de index.html) ----------
function ligneDe(deb){const i=SRC.indexOf(deb);if(i<0)return null;return SRC.slice(i,SRC.indexOf('\n',i));}
function lis(l,re,nom){const m=re.exec(l);if(!m)throw new Error('bareme : champ introuvable '+nom);return m[1];}
function lisBareme(){
  const lj=ligneDe('const JOUR={'),lc=ligneDe('const CADO={');if(!lj||!lc)return null;
  return {x2:+lis(lj,/\bx2:([\d.]+)/,'x2'),prime:lis(lj,/\bprime:\[([\d.,\s]+)\]/,'prime').split(',').map(Number),tMin:+lis(lj,/\btMin:(\d+)/,'tMin'),
    cad:{periode:+lis(lc,/\bperiode:([\d.e]+)/,'periode'),min:+lis(lc,/\bmin:(\d+)/,'min'),pc:+lis(lc,/\bpc:([\d.]+)/,'pc')}};
}
const LU=lisBareme();
const BAREME=(arg('x2')!=null||!LU)?{x2:+(arg('x2')||2),prime:(arg('prime')||'0,25,50,75,100,150,200').split(',').map(Number),tMin:+(arg('tmin')||15),
  cad:{periode:216e5,min:+(arg('cadmin')||30),pc:+(arg('cadpc')||.1)}}:LU;
if(arg('cadmin')!=null)BAREME.cad.min=+arg('cadmin');if(arg('cadpc')!=null)BAREME.cad.pc=+arg('cadpc');
BAREME.cad.deux=+(arg('deux')||.5); // [H] chance d'une 2e seance (donc d'un 2e cadeau) un jour ou l'on joue au moins 2 parties
const ecoRond=v=>{if(v<100)return Math.max(10,Math.round(v/10)*10);const p=Math.pow(10,Math.floor(Math.log10(v))-1);return Math.round(v/p)*p;}; // = ecoRond() du jeu (cadeauValeur)

// ---------- 2. UNE SEMAINE : les parties s'enchainent JOUR APRES JOUR ----------
// opt : {coup : le relevement ECOD (1 = ancien) · jour : null | {x2,prime[],tMin,regle:'max'|'produit'} · cad : null | {min,pc,deux} · rpj:[min,max] parties par jour [H]
//        · jours · saute : proba de ne pas jouer un jour [H] · c2 : defis du carnet 2 · prix : l'objet vise}
// Comme dans le jeu (jourMaj / jourCommit) : la 1re partie de la VIE (la lecon d'auto-ecole) MARQUE le jour 1 sans prendre le x2 ; ensuite la 1re partie de chaque
// jour prend le x2 (max avec ECOD, ou le PRODUIT pour la variante « bete »), puis, si elle tient tMin secondes, marque le jour, monte la serie et verse la prime.
// Le cadeau : ouvert au debut de chaque seance ; le tout premier juste apres la lecon (il ne s'allume qu'apres l'auto-ecole).
function semaine(P,opt,rnd){
  let bank=0,n=0,achat=0,okC1=[0,0,0],okC2=[0,0,0],serie=0,dernier=-9,best=0;const prixMin=PEINTURE_MIN.p,J=opt.jour,C=opt.cad,out={jours:[],banque:[],achat:0,primes:0,cadeaux:0,x2:0,parties:0};
  const cadeau=()=>{const v=Math.max(C.min,ecoRond(C.pc*best));bank+=v;out.cadeaux+=v;return v;};
  for(let d=0;d<opt.jours;d++){
    if(opt.saute&&d>0&&rnd()<opt.saute){out.jours.push({d,gain:0,banque:bank,runs:0,saute:1});out.banque.push(bank);continue;}
    const r=opt.rpj[0]+Math.floor(rnd()*(opt.rpj[1]-opt.rpj[0]+1));let gainJ=0;
    const seances=(C&&r>=2&&rnd()<C.deux)?2:1,debut2=Math.ceil(r/2);
    for(let k=0;k<r;k++){
      n++;const lecon=(n===1);
      if(C&&((k===0&&!lecon)||(seances===2&&k===debut2))){gainJ+=cadeau();if(!achat&&bank>=opt.prix)achat=n;}
      const Ke=(opt.coup>1&&!achat&&bank<prixMin)?opt.coup:1; // ECOD : le releve ne vaut que sans achat et sous la peinture la moins chere (le filet)
      let K=Ke,jourOn=false,sNext=0;
      const premiere=(dernier!==d);
      if(J&&premiere){ // la 1re partie du jour (compte ou non)
        sNext=(dernier===d-1)?serie+1:1;
        if(!lecon){jourOn=true;K=(J.regle==='produit')?Ke*J.x2:Math.max(Ke,J.x2);}}
      const Pn=Object.assign({},P,{T:P.T0+rnd()*(P.T1-P.T0),p:Math.min(1,P.p*(.8+.4*rnd()))});
      const rr=partie(Pn,K,rnd,0),gagne=Math.max(0,rr.money);out.parties++;if(jourOn)out.x2++;
      let v=gagne;if(n===1)v+=PERMIS;
      const val={coins:rr.coins,fruits:rr.fruits,cash:gagne,tricks:0,nitro:0,kmh:rr.kmh};
      for(let j=0;j<C1.length;j++)if(!okC1[j]&&val[C1[j].k]>=C1[j].v){okC1[j]=1;v+=C1[j].p;}
      if(C1.length&&okC1.every(x=>x)&&opt.c2){const pr={tricks:opt.c2.tricks,nitro:opt.c2.nitro,kmh:opt.c2.kmh};
        for(let j=0;j<C2.length;j++)if(!okC2[j]&&rnd()<pr[C2[j].k]){okC2[j]=1;v+=C2[j].p;}}
      if(J&&premiere&&rr.t>=J.tMin){ // la partie COMPTE (assez longue) : le jour est marque, la serie monte, la prime est versee
        serie=sNext;dernier=d;
        const pr=J.prime[Math.min(serie,J.prime.length)-1]||0;v+=pr;out.primes+=pr;}
      bank+=v;gainJ+=v;best=Math.max(best,gagne);
      if(lecon&&C)gainJ+=cadeau(); // la 1re ouverture : juste apres la lecon
      if(!achat&&bank>=opt.prix)achat=n;}
    out.jours.push({d,gain:gainJ,banque:bank,runs:r});out.banque.push(bank);}
  out.achat=achat;out.bank=bank;return out;}

function etudeSemaine(P,opt,N,seed){const rnd=mulberry(seed);const S=[];for(let i=0;i<N;i++)S.push(semaine(P,opt,rnd));return S;}
function resume(S,opt){const N=S.length,med=a=>quantiles(a).med,moy=f=>S.reduce((a,s)=>a+f(s),0)/N;
  const jours=[];for(let d=0;d<opt.jours;d++)jours.push({gain:med(S.map(s=>s.jours[d].gain)),banque:med(S.map(s=>s.jours[d].banque))});
  const ach=S.map(s=>s.achat||99),cum={};for(let k=1;k<=12;k++)cum[k]=Math.round(100*ach.filter(a=>a<=k).length/N);
  return {jours,total:med(S.map(s=>s.bank)),moy:moy(s=>s.bank),primes:moy(s=>s.primes),cadeaux:moy(s=>s.cadeaux),x2:moy(s=>s.x2),parties:moy(s=>s.parties),achat:med(ach),cum};}

module.exports={semaine,etudeSemaine,resume,BAREME};

if(require.main===module){
  const N=+(arg('n')||4000),seed=+(arg('seed')||7),prix=PEINTURE_MIN.p,coup=M.ECOD_K,B=BAREME;
  console.log('=== LE BAREME (lu dans index.html'+(arg('x2')!=null?', REMPLACE en ligne de commande':'')+') ===');
  console.log('QUOTIDIEN : x'+B.x2+' sur la 1re partie du jour, max(ECOD x'+coup+', x'+B.x2+') · SERIE : prime en banque a la fin de cette partie = '+B.prime.join(' · ')+' $ (jours 1 a '+B.prime.length+'+) · partie comptee a partir de '+B.tMin+' s');
  console.log('CADEAU : toutes les '+(B.cad.periode/36e5)+' h, max('+B.cad.min+' $, '+Math.round(B.cad.pc*100)+' % du meilleur gain d\'une partie) en banque · peinture la moins chere '+PEINTURE_MIN.n+' '+f$(prix)+' $');
  console.log('[H] 1 a 3 parties par jour (uniforme) · 1 seance par jour, ou 2 (chance '+B.cad.deux+') s\'il y a >= 2 parties · la 1re partie de la vie = la lecon (marque le jour 1, ni x2 ni prime), le 1er cadeau juste apres\n');
  const JB={x2:B.x2,prime:B.prime,tMin:B.tMin,regle:'max'};
  const V=[['AVANT (ECOD seul)',null,null],
    ['x2 PRODUIT avec ECOD (x'+(B.x2*coup)+' « bete »)',{x2:B.x2,prime:[0],tMin:B.tMin,regle:'produit'},null],
    ['CADEAU seul',null,B.cad],
    ['QUOTIDIEN seul (x2 max + serie)',JB,null],
    ['QUOTIDIEN + SERIE + CADEAU (le bareme)',JB,B.cad]];
  const MONDES=[['carnet 1 seul (le cahier de L\'ARGENT DU DEBUT)',null],['carnet 1 + 2 « plausible » (le monde ou ECOD est deja en trop)',OPT_C2]];
  for(const [lm,c2] of MONDES){
    if(arg('rapide')==='1'&&c2)continue;
    console.log('\n##### joueur MOYEN (45-90 s, la moitie des pieces) — '+lm+' — '+N+' joueurs, 7 jours, graine '+seed+' #####');
    let base=null;
    for(const [nom,jour,cad] of V){
      const opt={coup,jour,cad,rpj:[1,3],jours:7,prix,c2},S=etudeSemaine(PROFILS.moyen,opt,N,seed),R=resume(S,opt);if(!base)base=R;
      console.log('\n'+nom.padEnd(46)+'| 7 jours : '+f$(R.total).padStart(6)+' $ ('+(R.total>=base.total?'+':'')+Math.round(100*(R.total/base.total-1))+' %, '+(R.total>=base.total?'+':'')+f$(R.total-base.total)+' $) · dont primes '+f$(R.primes)+' $, cadeaux '+f$(R.cadeaux)+' $ (moyennes)');
      console.log('   argent gagne par JOUR : '+R.jours.map(j=>f$(j.gain)).join(' · '));
      console.log('   banque en fin de jour  : '+R.jours.map(j=>f$(j.banque)).join(' · '));
      console.log('   1re peinture ('+f$(prix)+' $) : partie mediane '+(R.achat>=99?'>12':R.achat)+' · <=2e '+R.cum[2]+' % · <=3e '+R.cum[3]+' % · <=4e '+R.cum[4]+' % · <=5e '+R.cum[5]+' % · <=6e '+R.cum[6]+' %');}}
  if(arg('rapide')!=='1'){
    console.log('\n##### AUTRES JOUEURS (carnet 1 seul), le bareme complet contre AVANT, 7 jours #####');
    const AUTRES=[['regulier, 1 a 3 parties/jour',PROFILS.moyen,{rpj:[1,3]}],['occasionnel : saute 1 jour sur 3, 1 a 2 parties',PROFILS.moyen,{rpj:[1,2],saute:1/3}],['tres regulier : 3 parties/jour',PROFILS.moyen,{rpj:[3,3]}],
      ['faible (25-45 s, 40 % des pieces), 1 a 3 parties',PROFILS.faible,{rpj:[1,3]}],['fort (2-4 min, 75 % des pieces), 1 a 3 parties',PROFILS.fort,{rpj:[1,3]}]];
    for(const [nom,P,x] of AUTRES){
      const a=resume(etudeSemaine(P,Object.assign({coup,jour:null,cad:null,jours:7,prix,c2:null},x),N,seed),{jours:7}),
            b=resume(etudeSemaine(P,Object.assign({coup,jour:JB,cad:B.cad,jours:7,prix,c2:null},x),N,seed),{jours:7});
      console.log(nom.padEnd(52)+'AVANT '+f$(a.total).padStart(7)+' $ -> APRES '+f$(b.total).padStart(7)+' $ ('+(b.total>=a.total?'+':'')+Math.round(100*(b.total/a.total-1))+' %) · parties jouees '+a.parties.toFixed(1)+' · x2 pris '+b.x2.toFixed(1)+' fois · 1re peinture : partie '+(a.achat>=99?'>12':a.achat)+' -> '+(b.achat>=99?'>12':b.achat));}
    console.log('\n##### UN MOIS (30 jours, joueur moyen regulier 1 a 3 parties/jour, carnet 1 seul) : ce que le quotidien rapporte une fois ECOD eteint #####');
    {const a=resume(etudeSemaine(PROFILS.moyen,{coup,jour:null,cad:null,rpj:[1,3],jours:30,prix,c2:null},N,seed),{jours:30}),b=resume(etudeSemaine(PROFILS.moyen,{coup,jour:JB,cad:B.cad,rpj:[1,3],jours:30,prix,c2:null},N,seed),{jours:30});
     console.log('30 jours : AVANT '+f$(a.total)+' $ -> APRES '+f$(b.total)+' $ ('+(b.total>=a.total?'+':'')+Math.round(100*(b.total/a.total-1))+' %) · primes '+f$(b.primes)+' $ · cadeaux '+f$(b.cadeaux)+' $');}
  }
}
