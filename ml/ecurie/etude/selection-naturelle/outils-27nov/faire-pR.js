/* jetable : <sortie>.js = <base> + LES LOIS « RETOUR » DES YEUX (27/11) : le pilote demande ses lois (REGLAGES.retours), choisit a la premiere vue du vol
   celle dont le rayon vaut le plus, la suit par vue.vol.retours[i], et quitte une facon qui se pose pour une autre qui se pose bien mieux.
   usage : node faire-pR.js <base.js> <sortie> [cle=val …] [retours=<json>] [--diag] */
const fs=require('fs'),path=require('path');
const re=(s,a,b)=>{if(!s.includes(a))throw new Error('introuvable '+a.slice(0,80));return s.replace(a,()=>b);};
const A=process.argv.slice(2).filter(x=>x!=='--diag'),DIAG=process.argv.includes('--diag');let p=fs.readFileSync(path.resolve(A[0]),'utf8');
p=re(p,`\n  figMax:2,`,`\n  retours:[{marge:8,cap:.6,avance:.25,rv:.2,rm:.24,rn:.18}],   /* LES LOIS « RETOUR » demandees aux yeux (yeux.js : 4 au plus) — marge : la ligne visee, en dedans du bord (m) ; cap : le cap de retour le plus fort (rad) ; nitro 2 : reacteur tenu tant que la caisse est en dehors de la ligne et sous nitroHaut metres ; cabre : cabrer sous cette hauteur a cote de la dalle ; sol : jouee aussi depuis les sorties du sol */
  retourPrime:4,     /* points de plus pour une loi « retour », a issue egale (la loi « vers la route » : 3) */
  volNitro:0,        /* points de plus pour une loi qui tient le reacteur (les joueurs : 96 % de leurs vols ont de la nitro) */
  volMieux:1,        /* 1 = on quitte une loi de retour qui se pose pour une autre qui se pose mieux de « bascule » points (0 = seulement si elle ne se pose plus) */
  axePoids:20,       /* points que coute un radian d'angle a la pose annoncee */
  figMax:2,`);
p=re(p,`const LONGS={rien:1,plane:1,versRoute:1,versRoutePlane:1,viser:1,viserPlane:1};`,
`const LONGS={rien:1,plane:1,versRoute:1,versRoutePlane:1,viser:1,viserPlane:1,retour0:1,retour1:1,retour2:1,retour3:1};
/* LES LOIS DE RETOUR : celles entre lesquelles on choisit au depart d'un vol subi, et on change pour mieux */
const RETOURS=['versRoute','versRoutePlane','retour0','retour1','retour2','retour3'];
const estRetour=nom=>nom.indexOf('versRoute')===0||nom.indexOf('retour')===0;
const avecNitro=nom=>nom==='versRoutePlane'||nom==='plane'||nom==='planeCabre'||nom==='viserPlane'||(nom.indexOf('retour')===0&&!!(REGLAGES.retours[+nom.slice(6)]&&REGLAGES.retours[+nom.slice(6)].nitro>0));
const prime=nom=>(nom==='versRoute'?3:nom==='versRoutePlane'?2:nom==='rien'?1:nom.indexOf('retour')===0?REGLAGES.retourPrime:0)+(avecNitro(nom)?REGLAGES.volNitro:0);`);
p=re(p,`  viserPlane:(v,m)=>{const c=v.vol.cible;return c?{volant:c.volant,manche:c.manche,nitro:true}:versRoute(v,true,m);}
};`,`  viserPlane:(v,m)=>{const c=v.vol.cible;return c?{volant:c.volant,manche:c.manche,nitro:true}:versRoute(v,true,m);},
  /* LES LOIS « RETOUR » : la loi est celle des yeux (vue.vol.retours[i] : son volant, son manche et sa nitro du moment, avance comprise) */
  retour0:(v,m)=>retourDe(v,m,0),retour1:(v,m)=>retourDe(v,m,1),retour2:(v,m)=>retourDe(v,m,2),retour3:(v,m)=>retourDe(v,m,3)
};
function retourDe(v,m,i){const L=v.vol.retours,c=Array.isArray(L)?L[i]:null;return c?{volant:c.volant,manche:c.manche,nitro:!!c.nitro}:versRoute(v,false,m);}`);
p=re(p,`    return 100-20*Math.abs(axe)-3*t-`,`    return 100-REGLAGES.axePoids*Math.abs(axe)-3*t-`);
p=re(p,`m.sortie=null;m.nFigVol=0;m.tGeste=null;}
  let tenuPose=null;
  if(Y){`,`m.sortie=null;m.nFigVol=0;m.tGeste=null;m.choix=false;}
  let tenuPose=null;
  if(Y){
    /* LE CHOIX DU DEPART (27/11) : a la premiere vue qui porte un radar, la loi de retour dont le rayon vaut le plus — au lieu de « vers la route »
       d'office. MESURE (rayons-vol.js, 160 vols) : a la premiere vue « vers la route » annonce 67 poses sur la dalle (axe 0,27 rad en mediane), la loi
       « retour » a reacteur et manche 116 (axe 0,09). */
    if(!m.choix&&R.retours.length&&estRetour(m.facon)){m.choix=true;
      let b9=null,s9=-99;
      for(const nom of RETOURS){const ry=Y.find(x=>x&&x.m===nom);if(!ry)continue;const s=vaut(ry,true,v)+prime(nom);if(s>s9){s9=s;b9=nom;}}
      if(b9&&b9!==m.facon){m.facon=b9;m.tFacon=v.t;}}`);
p=re(p,`loi=m.facon.indexOf('versRoute')===0||m.facon.indexOf('viser')===0;`,`loi=estRetour(m.facon)||m.facon.indexOf('viser')===0;`);
p=re(p,`    if((!sauve(mien)||fuit)&&!patience&&(depuis>R.tenirFacon||(mien&&(+mien.t||0)<1))){`,`    /* POUR MIEUX : la loi tenue se pose, mais une autre loi de retour se pose bien mieux (plus droit, plus tot, sans ressortir) */
    const pourMieux=R.volMieux>0&&sauve(mien)&&!fuit&&estRetour(m.facon)&&depuis>R.tenirFacon;
    if(pourMieux||((!sauve(mien)||fuit)&&!patience&&(depuis>R.tenirFacon||(mien&&(+mien.t||0)<1)))){`);
p=re(p,`        if(fuit&&!(ry&&ry.issue==='pose'&&ry.propre!==false&&!ry.dessous))continue;
        const s=vaut(ry,!!LONGS[nom],v)+(nom==='versRoute'?3:nom==='versRoutePlane'?2:nom==='rien'?1:0);`,`        if((fuit||pourMieux)&&!(ry&&ry.issue==='pose'&&ry.propre!==false&&!ry.dessous))continue;
        if(pourMieux&&!estRetour(nom))continue;
        const s=vaut(ry,!!LONGS[nom],v)+prime(nom);`);
p=re(p,`else return {volant:m.sortie.cote,nitro:m.sortie.facon==='plane'||m.nitro||(tetu&&R.dessousNitro>0),`,`else return {volant:m.sortie.cote,nitro:avecNitro(m.sortie.facon)||m.nitro||(tetu&&R.dessousNitro>0),`);
p=re(p,`      return {volant:rc.cote,nitro:rc.facon==='plane'||m.nitro,ensuite:{volant:0},regarder:'sorties'};}}`,`      return {volant:rc.cote,nitro:avecNitro(rc.facon)||m.nitro,ensuite:{volant:0},regarder:'sorties'};}}`);
p=re(p,`  decide:function(vue,m){return vue.mode==='sol'?auSol(vue,m):vue.mode==='vol'?enVol(vue,m):{};}`,`  decide:function(vue,m){const o=vue.mode==='sol'?auSol(vue,m):vue.mode==='vol'?enVol(vue,m):{};
    if(REGLAGES.retours.length&&(vue.mode==='sol'||vue.mode==='vol'))o.retours=REGLAGES.retours;   /* les lois que les yeux joueront a la vue suivante */
    return o;}`);
if(DIAG)p=re(p,"  o.ensuite={ligne:0};   /* a la pose","  o.facon=m.facon;o.voulu=!!m.voulu;\n  o.ensuite={ligne:0};   /* a la pose");
for(const kv of A.slice(2)){const i=kv.indexOf('='),k=kv.slice(0,i),val=kv.slice(i+1);
  if(k==='retours'){const mm=p.match(/\n  retours:\[.*?\],   \/\*/);if(!mm)throw new Error('retours');p=p.replace(mm[0],()=>'\n  retours:'+val+',   /*');continue;}
  const mm=p.match(new RegExp('(\\n  '+k+':)([^,]+),'));if(!mm)throw new Error('reglage '+k);p=p.replace(mm[0],()=>mm[1]+val+',');}
fs.writeFileSync(path.join(__dirname,A[1]+'.js'),p);const {charger}=require('../../../bot/piloter');console.log(A[1]+'.js ecrit et charge : '+charger(path.join(__dirname,A[1]+'.js')).nom);
