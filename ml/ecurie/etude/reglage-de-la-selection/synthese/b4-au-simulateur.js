#!/usr/bin/env node
/* ===== LA SYNTHESE : B4 (« les anciens rejouent 4 graines ») REJOUE DANS LE SIMULATEUR CALE (28/11/2026, la synthese ; la question :
   « le simulateur et le tri precoce ne disent pas la meme chose sur le rejeu des anciens : lequel croire ? ») =====
   Les deux etudes ont chacune leur simulateur :
   - tri-precoce/population.js : sans plafond (un pilote peut progresser sans fin), sans validation ni sacre ; il trouve B4 meilleur que A8
     (1,18 a 1,27 fois en faible / moyen / casse, moins bon en tres faible) ;
   - simulateur/simuler.js : un paysage a plafond, cale sur les vraies courses, avec la validation, le sacre et l'economie de graines ; son
     cousin de B4 (« rejouer jeunes + 4 », R3) ne gagne rien de sur hors echantillon (+0,05 ± 0,06 en moyen).
   Ce script rejoue la proposition B4 EXACTE du tri precoce dans le simulateur cale, sans modifier aucun fichier de l'etude « simulateur » :
   il lit le texte de simulateur/simuler.js, y applique quatre remplacements (ci-dessous, chacun doit trouver son texte une seule fois, sinon
   le script s'arrete) et le compile en memoire, avec le dossier de simuler.js comme __dirname (memes donnees/calibrage.json).
     1. LES COURSES : quand cfg.grainesAnciens est un nombre, un vivant ne en G' < G ne joue que les grainesAnciens premieres graines de la
        generation (l'ordre graine par graine reste : les premieres sont communes a tous) ; les nes de G jouent toutes les graines.
     2. LE RENVOI : quand cfg.protectionAge, est renvoyable un vivant ne avant G (v.ne < G), au lieu de « au moins 24 courses ».
     3. LE TOURNOI : quand cfg.protectionAge, entre au tournoi un vivant ne en G−2 ou avant (au lieu de « au moins 24 courses »).
     4. La generation G est passee au tournoi par cfg.__G (pose juste avant les naissances).
   Le reste (note pilote + graine, regle 6, validation, sacre, economie de graines, coffre) est celui de simuler.js.
   Mondes NEUFS : graines 7000 + k, celles de la relecture du simulateur (ni l'auteur ni le choix des reglages ne les ont vus ; aucun reglage
   n'est choisi ici, on juge une seule proposition deja ecrite).
   Comparaison APPARIEE (memes mondes) du F4 VRAI du champion (dP − 4·dE, en ecart au temoin) et du meilleur vivant, au meme nombre de courses.

   CONTROLE A REPONSE CONNUE (mode « controle ») : avec grainesAnciens = 12 (= toutes les graines) et protectionAge coupe, le patch doit rendre
   EXACTEMENT la meme evolution que simuler.js tel quel (memes F4, memes generations) : le patch ne change rien quand il ne doit rien changer.

   Usage (un seul processus, < 5 min par appel) :
     node b4-au-simulateur.js controle
     node b4-au-simulateur.js jouer <scenario> <premier> <nombre> [budget=50000] [debit=400]   -> sorties/b4-<scenario>-<debit>-<premier>.json
     node b4-au-simulateur.js bilan                                                          -> sorties/b4-bilan.txt
   Les trois bras : A = la vraie config (economie de graines active) ; B4 = grainesAnciens 4 + protection par l'age + note.passes 30 (la
   recommandation 1 du tri precoce en entier) ; AGE = la protection par l'age seule (la relecture du tri precoce la dit utile meme sans B4). */
'use strict';
const fs=require('fs'),path=require('path'),Module=require('module');
const DSIM=path.join(__dirname,'..','simulateur');
const FSIM=path.join(DSIM,'simuler.js');
const SORT=path.join(__dirname,'sorties');
if(!fs.existsSync(SORT))fs.mkdirSync(SORT);

/* ===== LE PATCH (quatre remplacements exacts) ===== */
function remplacer(src,a,b){
  const n=src.split(a).length-1;
  if(n!==1)throw new Error('patch : le texte attendu apparait '+n+' fois au lieu de 1 : '+a.slice(0,80));
  return src.replace(a,()=>b);
}
let src=fs.readFileSync(FSIM,'utf8');
src=remplacer(src,'for(const g of graines)for(const v of joueurs){taches++;courseEntrainement(st,v,g);}',
  '{let gi=0;for(const g of graines){for(const v of joueurs){if(cfg.grainesAnciens!=null&&G>0&&v.ne<G&&gi>=cfg.grainesAnciens)continue;taches++;courseEntrainement(st,v,g);}gi++;}}');
src=remplacer(src,'const elig=st.vivants.filter(v=>v!==st.temoin&&v!==st.champion&&nDe(notes,v)>=cfg.protectionCourses);',
  'const elig=st.vivants.filter(v=>v!==st.temoin&&v!==st.champion&&(cfg.protectionAge?v.ne<G:nDe(notes,v)>=cfg.protectionCourses));');
src=remplacer(src,'let pool=V.filter(v=>nDe(notes,v)>=cfg.protectionCourses);',
  'let pool=V.filter(v=>cfg.protectionAge?v.ne<=cfg.__G-2:nDe(notes,v)>=cfg.protectionCourses);');
src=remplacer(src,'const nes=naissancesRegle(cfg,','cfg.__G=G;const nes=naissancesRegle(cfg,');
const mod=new Module(FSIM,module);mod.filename=FSIM;mod.paths=Module._nodeModulePaths(DSIM);mod._compile(src,FSIM);
const P=mod.exports;               /* le simulateur patche */
const S=require(FSIM);             /* le simulateur tel quel (pour le controle) */

const F4=p=>p.champion.dP-4*p.champion.dE;
const BRAS={
  A:{},
  B4:{grainesAnciens:4,protectionAge:true,note:{passes:30}},
  AGE:{protectionAge:true}
};
const moySe=X=>{const m=X.reduce((s,x)=>s+x,0)/X.length,se=X.length>1?Math.sqrt(X.reduce((s,x)=>s+(x-m)*(x-m),0)/(X.length-1)/X.length):NaN;return {m,se};};
const fmt=o=>(o.m>=0?'+':'')+o.m.toFixed(2)+' ± '+o.se.toFixed(2);
const med=X=>{const B=X.slice().sort((a,b)=>a-b),i=(B.length-1)/2;return (B[Math.floor(i)]+B[Math.ceil(i)])/2;};
const t0=Date.now();
const A=process.argv.slice(2);

if(A[0]==='controle'){
  /* patch neutre (grainesAnciens 12 = toutes, pas de protection par l'age) contre simuler.js tel quel, 3 mondes, 10 000 courses */
  let ok=true;const lignes=[];
  for(const sc of ['moyen','optimiste']){
    for(let k=0;k<3;k++){
      const a=S.evoluer({scenario:sc,graine:7000+k,debit:400,cfg:{},budgets:[10000]}).points[0];
      const b=P.evoluer({scenario:sc,graine:7000+k,debit:400,cfg:{grainesAnciens:12},budgets:[10000]}).points[0];
      const meme=a.G===b.G&&F4(a)===F4(b)&&a.courses===b.courses&&a.meilleurVivantF===b.meilleurVivantF;
      if(!meme)ok=false;
      lignes.push(sc+' monde '+(7000+k)+' : tel quel G '+a.G+' F4 '+F4(a).toFixed(6)+' | patch neutre G '+b.G+' F4 '+F4(b).toFixed(6)+' -> '+(meme?'IDENTIQUE':'DIFFERENT'));
    }
  }
  /* et le patch actif doit bien jouer moins de courses par generation (sinon il ne fait rien) */
  const r=P.evoluer({scenario:'moyen',graine:7000,debit:400,cfg:BRAS.B4,budgets:[10000]}).points[0];
  const r0=S.evoluer({scenario:'moyen',graine:7000,debit:400,cfg:{},budgets:[10000]}).points[0];
  const plus=r.G>r0.G;if(!plus)ok=false;
  lignes.push('B4 actif, moyen 7000, 10 000 courses : '+r.G+' generations contre '+r0.G+' pour A -> '+(plus?'plus de generations, attendu':'PAS plus de generations : le patch ne mord pas'));
  const t='CONTROLE DU PATCH B4 (synthese, '+new Date().toISOString()+')\n'+lignes.join('\n')+'\n'+(ok?'TOUT PASSE':'ECHEC')+' ('+((Date.now()-t0)/1000).toFixed(0)+' s)\n';
  fs.writeFileSync(path.join(SORT,'b4-controle.txt'),t);process.stdout.write(t);
  process.exit(ok?0:1);
}else if(A[0]==='jouer'){
  const sc=A[1],d=+A[2],n=+A[3],B=+(A[4]||50000),deb=+(A[5]||400),out=[];
  for(let k=d;k<d+n;k++){
    const r={k};
    for(const [nom,cfg] of Object.entries(BRAS)){
      const p=P.evoluer({scenario:sc,graine:7000+k,debit:deb,cfg,budgets:[B]}).points[0];
      r[nom]={F4:F4(p),mv:p.meilleurVivantF,G:p.G,heures:p.heures};
    }
    out.push(r);
  }
  const f=path.join(SORT,'b4-'+sc+'-'+deb+'-'+B+'-'+d+'.json');
  fs.writeFileSync(f,JSON.stringify(out)+'\n');
  console.log(sc+' '+deb+'/h '+B+' courses, mondes '+(7000+d)+'..'+(7000+d+n-1)+' -> '+path.basename(f)+' ('+((Date.now()-t0)/1000).toFixed(0)+' s)');
}else if(A[0]==='bilan'){
  const groupes=new Map();
  for(const f of fs.readdirSync(SORT).filter(f=>/^b4-.*\.json$/.test(f)).sort()){
    const m=f.match(/^b4-(\w+)-(\d+)-(\d+)-\d+\.json$/);if(!m)continue;
    const cle=m[1]+' '+m[2]+'/h '+m[3];
    if(!groupes.has(cle))groupes.set(cle,[]);
    groupes.get(cle).push(...JSON.parse(fs.readFileSync(path.join(SORT,f),'utf8')));
  }
  const lignes=[];
  for(const [cle,D] of groupes){
    lignes.push(cle.padEnd(24)+' | '+String(D.length).padStart(3)+' | B4 − A : '+fmt(moySe(D.map(x=>x.B4.F4-x.A.F4))).padEnd(13)+
      ' (meilleur vivant '+fmt(moySe(D.map(x=>x.B4.mv-x.A.mv)))+')'+
      ' | AGE − A : '+fmt(moySe(D.map(x=>x.AGE.F4-x.A.F4))).padEnd(13)+
      ' | F4 median A '+med(D.map(x=>x.A.F4)).toFixed(2)+', B4 '+med(D.map(x=>x.B4.F4)).toFixed(2)+
      ' | generations A '+med(D.map(x=>x.A.G))+', B4 '+med(D.map(x=>x.B4.G)));
  }
  const t='B4 (anciens sur 4 graines + protection par l\'age + note.passes 30) ET LA PROTECTION PAR L\'AGE SEULE, CONTRE LA VRAIE CONFIG (A, economie active),\n'+
    'DANS LE SIMULATEUR CALE (simulateur/simuler.js patche en memoire), MONDES NEUFS 7000+k, ECART APPARIE DU F4 VRAI DU CHAMPION (± erreur-type)\n'+
    'scenario debit budget    | mondes | ecarts\n'+lignes.join('\n')+'\n';
  fs.writeFileSync(path.join(SORT,'b4-bilan.txt'),t);process.stdout.write(t);
}else{
  console.log('usage : controle | jouer <scenario> <premier> <nombre> [budget] [debit] | bilan');
}
