/* ===== TESTS DU PILOTE FABRIQUE EN COURSE (27/11/2026, etape 2 : tests a et b de la specification, + le controle des rayons sur les vrais yeux) =====
   (a) IDENTITE : le genome temoin (W2 = 0, loi « retour » coupee) contre ml/ecurie/pilote-voltige.js, 3 graines x 45 s, un processus neuf par course :
       memes empreintes (course, vues, touches) ;
   (b) les tetes et la loi sont branchees : W2 de la tete RAYON a 0,5, W2 de la tete SOL a 0,5, retourOn = 1 donnent chacun une autre course (sur au
       moins une graine), sans erreur du cerveau (« YEUX CHANGES » compris) ;
   (e') sur les vrais yeux (une course de 45 s tracee, loi « retour » demandee) : chaque vue de vol suit la forme que le controle exige, et l'on y voit
       passer viser/viserPlane et retour0.
   Au plus 4 courses a la fois. Environ 3 a 5 minutes.
   usage : node ml/evolution/tests/identite.test.js [--graines 910000,910037,910074] [--tmax 45]   (code 0 si tout passe, 1 sinon) */
'use strict';
const path=require('path'),fs=require('fs'),{fork}=require('child_process');
const D=path.join(__dirname,'..');
const C=require(path.join(D,'commun.js')),Gn=require(path.join(D,'genome.js')),I=require(path.join(D,'identite.js'));
const A=process.argv.slice(2),opt=(k,d)=>{const i=A.indexOf('--'+k);return i>=0?A[i+1]:d;};

/* ---------- l'enfant de la course tracee (e') : un processus neuf, rend les noms des rayons de chaque vue de vol ---------- */
if(A[0]==='--trace'){
  process.on('message',function(m){
    const {ouvrir,charger,course}=require(path.join(D,'..','bot','piloter.js'));
    const J=ouvrir({regime:'allege'}),P=charger('evolution.js',{source:m.source});
    const r=course(J,P,m.graine,{tmax:m.tmax,trace:true});
    const vols=r.vues.filter(x=>x.vue.mode==='vol').map(x=>{const f=x.vue.vol,R=f.radar;
      return {noms:R&&Array.isArray(R.rayons)?R.rayons.map(y=>y&&y.m):null,cible:f.cible!=null,retours:Array.isArray(f.retours)?f.retours.length:0,demande:!!(x.ordre&&x.ordre.retours)};});
    process.send({vols,erreurs:r.bilan.erreurs,derniereErreur:r.bilan.derniereErreur,empreinte:r.bilan.empreinte},()=>process.exit(0));});
  return;
}

const cfg=C.lireConfig();
const graines=(opt('graines',null)?opt('graines').split(','):cfg.identite.graines).map(Number),tmax=+opt('tmax',cfg.identite.tmax||45);
let rates=0,passes=0;
function bilan(nom,ok,detail){if(ok)passes++;else rates++;console.log((ok?'PASSE  ':'ECHEC  ')+nom+(detail?'\n       '+detail.split('\n').join('\n       '):''));}
const court=l=>l?[l.empreinte,l.empreinteVues,l.empreinteTouches].join(' ')+' palier '+l.palier+' '+l.survie_s+' s '+l.vols+' vols'+(l.erreurs?' ERREURS '+l.erreurs+' « '+l.derniereErreur+' »':'')+(l.mesuree===false?' [non mesuree : '+l.raison+']':''):'(rien)';
const EMP=['empreinte','empreinteVues','empreinteTouches'];
const pareil=(a,b)=>!!(a&&b)&&EMP.every(k=>a[k]&&a[k]===b[k]);

(async function(){
  const t0=Date.now();
  const T=Gn.genomeTemoin(cfg);
  const R=Gn.reparer(JSON.parse(JSON.stringify(T)),cfg);R.A.retourOn=1;
  const textes=[
    {nom:'temoin',source:Gn.ecrirePilote(T,{cfg}),fichier:'evolution.js'},
    {nom:'voltige',source:fs.readFileSync(Gn.VOLTIGE,'utf8'),fichier:'pilote-voltige.js'},
    {nom:'w2rayon',source:Gn.ecrirePilote(I.genomeW2(cfg,'rayon',.5),{cfg}),fichier:'evolution.js'},
    {nom:'w2sol',source:Gn.ecrirePilote(I.genomeW2(cfg,'sol',.5),{cfg}),fichier:'evolution.js'},
    {nom:'retour',source:Gn.ecrirePilote(R,{cfg}),fichier:'evolution.js'}];
  console.log('15 courses ('+textes.length+' pilotes x '+graines.length+' graines x '+tmax+' s), 4 a la fois, un processus neuf chacune…');
  const L=await I.jouerTextes({cfg,graines,tmax,travailleurs:4,textes});

  /* (a) */
  {const det=[];let ok=true;
    graines.forEach((g,i)=>{const a=L.temoin[i],b=L.voltige[i],s=pareil(a,b);ok=ok&&s&&!a.erreurs;
      det.push('graine '+g+' : '+(s?'IDENTIQUE  ':'DIFFERENT  ')+'temoin '+court(a)+(s?'':'\n         voltige '+court(b)));});
    bilan('(a) identite : le genome temoin rejoue pilote-voltige au bit pres ('+graines.length+' graines x '+tmax+' s)',ok,det.join('\n'));
    const vols=graines.reduce((s,g,i)=>s+((L.voltige[i]&&L.voltige[i].vols)|0),0);
    bilan('(a) les courses de l\'identite passent par le vol (sinon la tete RAYON et le controle n\'y seraient pas exerces)',vols>0,vols+' vols en tout');}
  /* (b) */
  for(const nom of ['w2rayon','w2sol','retour']){
    const det=[];let diff=0,err=0;
    graines.forEach((g,i)=>{const a=L[nom][i],b=L.voltige[i],s=pareil(a,b);if(!s)diff++;if(!a||a.erreurs||!a.empreinte)err++;
      det.push('graine '+g+' : '+(s?'identique ':'DIFFERENTE ')+court(a));});
    bilan('(b) '+({w2rayon:'W2 de la tete RAYON a 0,5',w2sol:'W2 de la tete SOL a 0,5',retour:'retourOn = 1'})[nom]+' : une autre course, sans erreur du cerveau',diff>0&&err===0,
      diff+' graine(s) sur '+graines.length+' changent, '+err+' en erreur\n'+det.join('\n'));}

  /* (e') la course tracee, loi « retour » demandee : la forme des rayons sur les vrais yeux */
  /* la graine ou la course « retour » a vole le plus (une course sans vol n'a rien a controler : 910000 ne vole pas en 45 s) */
  {let g=graines[0],nv=-1;graines.forEach((x,i)=>{const v=(L.retour[i]&&L.retour[i].vols)|0;if(v>nv){nv=v;g=x;}});
    const m=await new Promise((fin,echec)=>{const c=fork(__filename,['--trace'],{silent:true,windowsHide:true});let r=null,err='';
      c.stderr.on('data',d=>{err=(err+d).slice(-600);});c.stdout.resume();
      c.on('message',x=>{r=x;});c.on('exit',code=>r?fin(r):echec(new Error('course tracee : code '+code+' '+err)));
      c.send({source:textes[4].source,graine:g,tmax});});
    const D10='tenu,rien,gauche,droite,cabre,pique,plane,planeCabre,versRoute,versRoutePlane';
    let mauvaises=[],avecViser=0,avecRetour=0,sansRetourDemande=0,radars=0;
    for(const v of m.vols){if(!v.noms)continue;radars++;
      const s=v.noms.join(',');
      const ok=s.indexOf(D10)===0&&/^(,viser,viserPlane)?(,retour0)?$/.test(s.slice(D10.length))&&(/,viser,/.test(s+',')===v.cible);
      if(!ok&&mauvaises.length<3)mauvaises.push(s+' (cible '+v.cible+')');
      if(/viser/.test(s))avecViser++;if(/retour0/.test(s))avecRetour++;else sansRetourDemande++;}
    bilan('(e\') vrais yeux, graine '+g+' : '+radars+' vues de vol a radar, toutes dans l\'ordre du controle ; erreurs du cerveau : '+m.erreurs,
      radars>0&&mauvaises.length===0&&!m.erreurs&&avecRetour>0,
      avecViser+' vues avec viser/viserPlane, '+avecRetour+' avec retour0, '+sansRetourDemande+' sans retour0 (premiere vue d\'un vol : la demande part avec l\'ordre d\'avant)'+
      (mauvaises.length?'\nhors forme : '+mauvaises.join(' | '):'')+(m.derniereErreur?'\nderniere erreur : '+m.derniereErreur:''));}

  console.log((rates?'ECHEC':'OK')+' : '+passes+' passes, '+rates+' rates ('+Math.round((Date.now()-t0)/1000)+' s)');
  process.exit(rates?1:0);
})().catch(e=>{console.log('ECHEC  le test a leve : '+String(e&&e.stack||e));process.exit(1);});
