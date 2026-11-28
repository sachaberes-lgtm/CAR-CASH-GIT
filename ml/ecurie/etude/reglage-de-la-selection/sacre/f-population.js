/* ===== SACRE, ETAPE F : LE MENEUR EST CHOISI PARCE QU'IL MENE (2026-11-27, l'etude « sacre ») =====
   Une population simulee comme evoluer.js la voit au moment d'une validation : 20 vivants (le champion et 19 autres) qui ont tous joue les
   memes g generations de 12 graines d'entrainement (n = 12 g courses chacun). La note d'entrainement de chacun, comme note.noter :
   a = palier moyen (plan equilibre : memes graines pour tous, l'effet de graine s'annule), â = (a - ā) n/(n+12) + ā (ā = moyenne des vivants),
   se_a = sigmaRes / sqrt(n), E et son se (bootstrap de 100 tirages, la config en fait 200), F = â - 4 E, se_F = sqrt(se_a² + 16 se_E²).
   Meneur = le plus haut F hors champion (n >= 48). Regle 6 : F_meneur - F_champion > 2 sqrt(se_F,m² + se_F,c²). Puis une validation sur
   des graines NEUVES (d-regards : 24 a 96 graines), lue par les plans de plans.js.
   Trois mondes :
     NUL      : tous egaux (le champion aussi) : tout sacre est faux ;
     UN+1     : un seul des 19 vaut +1 palier, les autres = le champion ;
     DISPERSE : les 19 ont un vrai niveau tire N(0 ; 0,5) autour du champion (0,5 = l'ordre de grandeur mesure entre les mutants de la
                generation 0 par a-donnees-reelles.js : 0,45 a 0,54, tres incertain), E egal pour tous (dispersion vraie de E mesuree ~0).
   On mesure : la part des fenetres de validation ou la regle 6 declenche ; le biais du vainqueur (dF d'entrainement du meneur moins son vrai
   ecart) ; la « malediction » attendue (dF entrainement - dF validation) ; le plan (c) : compter les courses d'entrainement du meneur et du
   champion (memes graines, appariees, gratuites) DANS la validation ; et ce que valent vraiment les pilotes sacres.
   usage : node f-population.js [essais=600] > sorties/f-population.txt */
'use strict';
const S=require('./commun.js'),PL=require('./plans.js');
const essais=+(process.argv[2]||600);
const R=S.reserveEvolution(),rng=S.Gr.mulberry32(4242);
const PE=S.PE,K=12;
function noteEntrainement(C){
  /* C : tableau de pilotes, chacun un tableau de courses {p, v} */
  const n=C[0].length,a=C.map(L=>L.reduce((s,x)=>s+x.p,0)/n);
  let ss=0;for(let i=0;i<C.length;i++)for(const x of C[i])ss+=(x.p-a[i])**2;
  const sig=Math.sqrt(ss/(C.length*(n-1))),abar=a.reduce((s,x)=>s+x,0)/a.length;
  return C.map((L,i)=>{
    const idx=[];for(let j=0;j<n;j++)idx.push(j);
    const E=S.eIdx(L,idx),v=[];
    for(let t=0;t<100;t++){for(let j=0;j<n;j++)idx[j]=rng.entier(n);v.push(S.eIdx(L,idx));}
    const seE=S.etype(v),ahat=(a[i]-abar)*n/(n+K)+abar,se_a=sig/Math.sqrt(n);
    return {a:a[i],ahat,E,F:ahat-PE*E,se_F:Math.sqrt(se_a*se_a+PE*PE*seE*seE)};});}
function regards(A,B){return PL.REG.map(k=>{const r=S.comparerRapide(A,B,{n:k,tirages:200});return [r.dF,r.se_dF,r.dPalier,r.se_dPalier,r.dE,r.se_dE];});}
const PLANS=['actuel (24, z>2)','2etages-0.5-96-2.33 +direct','seqOBF-2.2-0.5-96'];
const moy=A=>A.length?A.reduce((s,x)=>s+x,0)/A.length:NaN;
for(const g of [4,10]){
  const n=12*g;
  for(const monde of ['NUL','UN+1','DISPERSE']){
    let declenche=0;const biais=[],vraiM=[],malEnt=[],malVal=[];const stat={};for(const p of PLANS)stat[p]={s:0,vrais:[],pires:0,g:0};
    let bonMeneur=0;const pc={s:0,n:0},pcBrut={s:0};
    /* la regle 6 a 1, 2 ou 3 : fenetres declenchees et sacres, pour deux plans (et le sequentiel avec (b) (c) a 2 se) */
    const R6={};for(const th of [1,2,3])R6[th]={d:0,actuel:[],seq:[],seq2:[]};
    for(let t=0;t<essais;t++){
      const vrai=[0];for(let i=1;i<20;i++)vrai.push(monde==='NUL'?0:monde==='UN+1'?(i===1?1:0):0.5*rng.normal());
      const C=vrai.map(v=>S.courses(R,v,n,rng));
      const N=noteEntrainement(C);
      let m=1;for(let i=2;i<20;i++)if(N[i].F>N[m].F)m=i;
      if(monde==='UN+1'&&m===1)bonMeneur++;
      const dFe=N[m].F-N[0].F,seuil=2*Math.sqrt(N[m].se_F**2+N[0].se_F**2),rap=dFe/(seuil/2);
      if(!(rap>1))continue;
      const A=S.courses(R,vrai[m],96,rng),B=S.courses(R,0,96,rng),L=regards(A,B);
      for(const th of [1,2,3])if(rap>th){const X=R6[th];X.d++;PL.criteres(1,1);if(PL.P['actuel (24, z>2)'](L)[0])X.actuel.push(vrai[m]);if(PL.P['seqOBF-2.2-0.5-96'](L)[0])X.seq.push(vrai[m]);
        PL.criteres(2,2);if(PL.P['seqOBF-2.2-0.5-96'](L)[0])X.seq2.push(vrai[m]);}
      if(!(dFe>seuil))continue;
      declenche++;biais.push(dFe-vrai[m]);vraiM.push(vrai[m]);
      /* la validation sur des graines neuves (A, B, L tires plus haut) */
      malEnt.push(dFe);malVal.push(L[0][0]);
      PL.criteres(1,1);
      for(const p of PLANS){const [s,gr]=PL.P[p](L);stat[p].g+=gr;if(s){stat[p].s++;stat[p].vrais.push(vrai[m]);if(vrai[m]<0)stat[p].pires++;}}
      /* le plan (c) : les courses d'entrainement des deux (memes graines) + les 24 graines neuves, dans UNE comparaison appariee */
      const Ac=C[m].concat(A.slice(0,24)),Bc=C[0].concat(B.slice(0,24));
      const rc=S.comparerRapide(Ac,Bc,{tirages:200});pc.n++;if(rc.sacre)pc.s++;
      /* et l'entrainement seul, apparie (ce que donnerait un premier etage « gratuit ») */
      const re=S.comparerRapide(C[m],C[0],{tirages:200});if(re.sacre)pcBrut.s++;
    }
    console.log('\n== g = '+g+' generations communes (n = '+n+' courses chacun), monde '+monde+' : '+essais+' fenetres de validation ==');
    console.log('la regle 6 declenche une validation : '+S.pct(declenche,essais)+' '+S.wilson(declenche,essais));
    if(monde==='UN+1')console.log('le vrai +1 est le meneur : '+S.pct(bonMeneur,essais));
    if(declenche){
      console.log('biais du vainqueur (dF d\'entrainement du meneur - son vrai ecart), quand la regle 6 declenche : moyenne '+moy(biais).toFixed(2)+' palier ; vrai ecart moyen du meneur valide '+moy(vraiM).toFixed(2));
      console.log('malediction attendue (dF entrainement - dF des 24 graines neuves) : '+(moy(malEnt)-moy(malVal)).toFixed(2)+' (dF entrainement '+moy(malEnt).toFixed(2)+', neuves '+moy(malVal).toFixed(2)+')');
      for(const p of PLANS){const s=stat[p];
        console.log('  '+p.padEnd(28)+' sacre '+S.pct(s.s,declenche)+' des validations, '+S.pct(s.s,essais)+' des fenetres ; vrai ecart moyen des sacres '+(s.s?moy(s.vrais).toFixed(2):'-')+
          ' ; sacres moins bons que le champion '+s.pires+' ; graines neuves jouees en moyenne '+(s.g/declenche).toFixed(0));}
      console.log('  plan (c) : entrainement ('+n+' graines) + 24 neuves dans une seule comparaison, z > 2 : sacre '+S.pct(pc.s,pc.n)+' des validations');
      console.log('  entrainement seul, apparie, z > 2 (un « premier etage gratuit ») : passe '+S.pct(pcBrut.s,declenche)+' des validations');}
    for(const th of [1,2,3]){const X=R6[th],f=A=>A.length+' sacres ('+S.pct(A.length,essais)+' des fenetres, vrai ecart moyen '+(A.length?moy(A).toFixed(2):'-')+', '+A.filter(v=>v<0).length+' moins bons)';
      console.log('  regle 6 a '+th+' : '+S.pct(X.d,essais)+' des fenetres validees ; actuel '+f(X.actuel)+' ; seqOBF-2.2 '+f(X.seq)+' ; seqOBF-2.2 (b)(c) a 2 se '+f(X.seq2));}
  }}
