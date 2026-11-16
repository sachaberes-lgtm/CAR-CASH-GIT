/* LE TIRAGE A/B (2026-11-14, optimisation de la ville) : le temps de piste() (le tirage du meilleur-de-N et le pré-calcul de la route, en Node)
   pour deux variantes d'URL, ALTERNÉES graine par graine (la machine partagée bruite) ; médianes par carte et palier.
   node outils/banc-routes/ville-tirage-ab.cjs [A='?sans=villerayon'] [B=''] [graines=1-6] [paliers=0,10,20] [cartes=ville,crypto] [rep=2] [racineA=<arbre>] [racineB=<arbre>] */
const path=require('path'),vm=require('vm');
const arg={};for(const a of process.argv.slice(2)){const m=/^(\w+)=(.*)$/.exec(a);if(m)arg[m[1]]=m[2];}
const rng=s=>{const m=/^(\d+)-(\d+)$/.exec(s);if(m){const r=[];for(let i=+m[1];i<=+m[2];i++)r.push(i);return r;}return s.split(',').map(Number);};
const G=rng(arg.graines||'1-6'),PAL=(arg.paliers||'0,10,20').split(',').map(Number),CARTES=(arg.cartes||'ville,crypto').split(','),REP=+(arg.rep||2);
const VAR=[arg.A!=null?arg.A:'?sans=villerayon',arg.B!=null?arg.B:''];
const RAC=[arg.racineA||path.join(__dirname,'..','..'),arg.racineB||path.join(__dirname,'..','..')];
const B=VAR.map((s,k)=>require(path.join(path.resolve(RAC[k]),'outils','banc-routes','charge.cjs')).creer(s));
const T={};
for(let r=0;r<REP;r++)for(const c of CARTES)for(const p of PAL)for(const g of G)for(let v0=0;v0<2;v0++){const v=(v0+g+r)%2,b=B[v];
  vm.runInContext('VILLE_BANK.graine='+g+';if(typeof VILLE_ENTREE!=="undefined")VILLE_ENTREE=null;',b.ctx);
  const t0=process.hrtime.bigint();const o=b.piste(c,g,p);const ms=Number(process.hrtime.bigint()-t0)/1e6;
  const k=c+' p'+p;(T[k]||(T[k]=[[],[],[],[]]))[v].push(ms);T[k][2+v].push(o.ctrl.length);}
const med=a=>{const s=a.slice().sort((x,y)=>x-y);return s.length?s[s.length>>1]:0;};
console.log('A =',RAC[0],JSON.stringify(VAR[0]),' B =',RAC[1],JSON.stringify(VAR[1]),' graines',G.join(','),'× '+REP);
for(const k in T){const [a,b,ca,cb]=T[k];console.log(k.padEnd(10),'tirage médiane A',med(a).toFixed(0),'ms  B',med(b).toFixed(0),'ms  (B/A',(med(b)/med(a)).toFixed(2)+')  points de contrôle A',med(ca),' B',med(cb));}
