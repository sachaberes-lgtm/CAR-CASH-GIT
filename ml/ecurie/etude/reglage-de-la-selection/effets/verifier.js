/* ===== L'ETUDE « EFFETS » : LES CALCULS SUR DES COURSES INVENTEES DONT ON CONNAIT LA REPONSE (27/11/2026, la tache : « mefie-toi de tes
   propres resultats : un effet spectaculaire est d'abord un bug ; verifie tes scripts sur un cas ou tu connais la reponse ») =====
   On fabrique des generations 0 a la maniere de la vraie : un temoin, 19 mutants, 24 graines (deux lots de 12), un palier par course
   = difficulte de la graine + niveau du pilote + bruit PROPRE a la course (ecart-type 3,2, independant d'un pilote a l'autre : la vraie
   correlation mutant / temoin mesuree est 0,06). Un mutant copie la course du temoin (meme empreinte) avec la probabilite 0,1.
   Cas 1 (« cinq nuls ») : 5 mutants copient TOUT ; les 14 autres ont un effet vrai tire de N(-1 ; 1,5).
   Cas 2 (« comme la vraie ») : les 19 ont un effet vrai tire de N(-0,5 ; tau), tau = 0 puis tau = 1.
   Ce que outils.js doit faire :
   (1) retrouver les 5 « nul exact » ; (2) couvrir l'effet vrai de chaque mutant par son IC 95 % de Student environ 95 fois sur 100 ;
   (3) loiDesEffets : mu sans biais et couvert par son IC (bootstrap des graines ET des mutants) ; tau retrouve par (A), (B), (C) ;
   (4) Clopper-Pearson sur des valeurs connues.
   Le premier essai de ce fichier (bruit du temoin absent des differences) avait cache un defaut : le bruit du temoin, commun a tous, etait
   compte dans l'erreur de chacun, ce qui ecrasait tau vers 0. C'est ce qui a fait ecrire loiDesEffets.
   Usage : node verifier.js   (code 0 si tout passe ; ~1 min) */
'use strict';
const O=require('./outils');
const R=O.mulberry32(2026);
const normal=()=>{let u=0,v=0;while(u===0)u=R();v=R();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);};
const SIG=3.2,COPIE=0.1;
function generation(effets){
  const graines=[...Array(24)].map((_,i)=>900000+i),b=graines.map(()=>7+1.4*normal());
  const t=new Map(graines.map((g,i)=>[g,{palier:b[i]+SIG*normal(),survie_s:100,empreinte:'T'+g}]));
  const mut=effets.map((s,m)=>{const M=new Map();
    for(let i=0;i<24;i++){const g=graines[i];
      if(s===null||R()<COPIE)M.set(g,{...t.get(g)});
      else M.set(g,{palier:b[i]+s+SIG*normal(),survie_s:100,empreinte:'M'+m+'|'+g});}
    return M;});
  return {graines,t,mut};}
function pourLoi(G){
  const lots=[G.graines.slice(0,12),G.graines.slice(12)];
  return {lots,sigma:SIG,mut:G.mut.map(M=>{const d=new Map(),ident=new Set();for(const [g,l] of M){d.set(g,l.palier-G.t.get(g).palier);if(l.empreinte===G.t.get(g).empreinte)ident.add(g);}return {d,ident};})};}
const lignes=[],dire=s=>{lignes.push(s);console.log(s);};
let ok=true;
/* cas 1 */
{let nulsOk=0,couvre=0,ic=0;const REP=40;
 for(let r=0;r<REP;r++){const eff=[...Array(19)].map((_,i)=>i<5?null:-1+1.5*normal());const G=generation(eff);
   const aps=G.mut.map((M,i)=>O.apparier(M,G.t,{tirages:300,graine:i}));
   if(aps.filter(a=>O.classer(a)==='nul exact').length===5)nulsOk++;
   for(let i=5;i<19;i++){ic++;const x=aps[i].par.palier;
     /* l'effet vrai d'un mutant sur SES graines : s fois la part de courses non copiees (une copie donne 0) */
     const n=aps[i].n,cop=aps[i].identiques,vrai=eff[i]*(n-cop)/n;if(vrai>=x.ic[0]&&vrai<=x.ic[1])couvre++;}}
 dire(`(1) les 5 mutants sans effet classes « nul exact » : ${nulsOk}/${REP} (attendu ${REP}/${REP})`);
 dire(`(2) IC 95 % de Student d'un mutant : couvre son effet vrai ${(100*couvre/ic).toFixed(1)} % des fois (attendu ~95 %)`);
 ok=ok&&nulsOk===REP&&couvre/ic>0.92;}
/* cas 2 */
for(const TAU of [0,1]){
  const REP=12,MU=-0.5;const res={mu:[],couvreMu:0,A:[],B:[],C:[],couvreA:0,couvreC:0,naif:[]};
  for(let r=0;r<REP;r++){const eff=[...Array(19)].map(()=>MU+TAU*normal());const G=generation(eff);const X=pourLoi(G);X.tirages=150;X.graine=r+1;
    const L=O.loiDesEffets(X);
    /* le mu vrai de CETTE generation : la moyenne des effets tires, ramenes a la part non copiee (~0,9) */
    const muVrai=O.moy(eff)*(1-COPIE);
    res.mu.push(L.mu-muVrai);if(muVrai>=L.icMu[0]&&muVrai<=L.icMu[1])res.couvreMu++;
    res.A.push(L.tauA);res.B.push(L.tauB);res.C.push(L.tauC);
    const tv=TAU*(1-COPIE);if(tv>=L.icTauA[0]-1e-9&&tv<=L.icTauA[1]+1e-9)res.couvreA++;if(tv>=Math.min(L.icTauC[0],L.icTauCvrais[0])-1e-9&&tv<=Math.max(L.icTauC[1],L.icTauCvrais[1])+1e-9)res.couvreC++;
    /* l'ancienne facon (erreur de chaque mutant = son erreur-type appariee, qui contient le bruit du temoin) */
    const aps=G.mut.map((M,i)=>O.apparier(M,G.t,{tirages:10,graine:i}));res.naif.push(O.ajusterNormale(aps.map(a=>a.par.palier.moy),aps.map(a=>a.par.palier.se),{pas:0.05}).tau);}
  dire(`(3) tau vrai ${TAU} (environ ${(TAU*(1-COPIE)).toFixed(2)} une fois les copies comptees), mu vrai ${MU}, ${REP} generations :`);
  dire(`    mu : biais moyen ${O.moy(res.mu).toFixed(2)}, couvert par son IC ${res.couvreMu}/${REP}`);
  dire(`    tau (A) moitie/moitie : moyenne ${O.moy(res.A).toFixed(2)}, IC couvre ${res.couvreA}/${REP} ; (B) moments : moyenne ${O.moy(res.B).toFixed(2)} ; (C) vraisemblance : moyenne ${O.moy(res.C).toFixed(2)}, IC (union) couvre ${res.couvreC}/${REP}`);
  dire(`    l'ancienne facon (bruit du temoin compte chez chacun) : tau moyen ${O.moy(res.naif).toFixed(2)}`);
  ok=ok&&Math.abs(O.moy(res.mu))<0.4&&res.couvreMu>=REP-2&&res.couvreC>=REP-3&&Math.abs(O.moy(res.C)-TAU*(1-COPIE))<0.45;}
/* cas 4 */
{const c0=O.clopperPearson(0,19),c5=O.clopperPearson(5,19);
 dire(`(4) Clopper-Pearson 0/19 = [${(100*c0[0]).toFixed(1)} ; ${(100*c0[1]).toFixed(1)}] % (attendu [0 ; 17,6]), 5/19 = [${(100*c5[0]).toFixed(1)} ; ${(100*c5[1]).toFixed(1)}] % (attendu [9,1 ; 51,2])`);
 ok=ok&&Math.abs(c0[1]-0.176)<0.002&&Math.abs(c5[0]-0.091)<0.002&&Math.abs(c5[1]-0.512)<0.002;}
dire(ok?'TOUT PASSE':'ECHEC');
require('fs').writeFileSync(require('path').join(__dirname,'verifier.txt'),lignes.join('\n')+'\n');
process.exit(ok?0:1);
