/* ===== LE CRIBLE DE LA GÉNÉRATION DE L'ESPACE — l'état global (2026-11-18, rôle « generation ») =====
   node outils/banc-espace/generation-etat.cjs [n=40]
   (1) même graine deux fois de suite (vm neuf) ; (2) LA COURSE : espace p0 → nuages → espace p10 → nuages → espace p20 dans le MÊME vm, puis la même 3e route
   seule dans un vm neuf APRÈS remise à zéro de la mémoire déclarée (RU, ORB_PIOCHE, OU, OU_FORMES — la liste de route-memoire.js) : si elle diffère, une mémoire
   NON déclarée fuit d'une route à l'autre ; (3) l'inverse : une route des nuages après une route d'espace = la même que seule ?
   (4) l'empreinte de ce que le générateur laisse derrière lui (ORB5.prof, TORD.info, MODMARK) entre deux routes. */
const C=require('./generation-charge.cjs');
const arg=(k,d)=>{const a=process.argv.find(x=>x.startsWith(k+'='));return a?a.slice(k.length+1):d;};
const n=+arg('n',40),search=arg('search','');
function emp(r){let h=2166136261>>>0;const f=x=>{const v=Math.round(x*1000)|0;h=Math.imul(h^v,16777619)>>>0;};for(const p of r.ctrl){f(p.x);f(p.y);f(p.z);}if(r.N)for(const p of r.N){f(p.x);f(p.y);f(p.z);}return h.toString(16)+':'+r.ctrl.length;}
function nuages(M,g,p){const ctx=M.ctx;ctx.__setPalier(p,C.VW[p]);ctx.LVL.cur={id:'nuages',carte:'nuages',sansFin:1};ctx.MODMARK.length=0;ctx.FILETMARK.length=0;
  let c=ctx.genCtrl(ctx.mulberry32(g),new ctx.THREE.Vector3(0,0,0),0);let N=null;if(ctx.hautOn()){const h=ctx.pisteTordPropre(c,g);c=h.ctrl;N=h.N;}return {ctrl:c,N};}
function graines(k,b){let a=b>>>0;const f=()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};const G=[];for(let i=0;i<k;i++)G.push((f()*1e9)|0);return G;}
const G=graines(6*n,777);
let s1=0,s2a=0,s2b=0,s3=0;const diff2=[],diff3=[];
for(let k=0;k<n;k++){const g=G.slice(6*k,6*k+6);
  /* (1) */ {const A=C.creer(search),B=C.creer(search);if(emp(A.route(g[0],0))===emp(B.route(g[0],0)))s1++;}
  /* (2) la course */ {const M=C.creer(search);M.route(g[0],0);nuages(M,g[1],5);M.route(g[2],10);nuages(M,g[3],15);
    const snap=M.run("JSON.stringify({prof:typeof ORB5!=='undefined'&&ORB5.prof?1:0,s0U:typeof ORB5!=='undefined'?ORB5.s0U:null})");
    M.raz();const r3=M.route(g[4],20);const F=C.creer(search);F.raz();const r3s=F.route(g[4],20);
    if(emp(r3)===emp(r3s))s2a++;else diff2.push({g:g[4],chaine:emp(r3),seule:emp(r3s),mods:[r3.marks0.map(m=>m.fig).join(' '),r3s.marks0.map(m=>m.fig).join(' ')],snap});
    /* même chose SANS remise à zéro : la route de la course (pour la compter, pas pour la juger) */
    const M2=C.creer(search);M2.route(g[0],0);nuages(M2,g[1],5);M2.route(g[2],10);nuages(M2,g[3],15);const r3c=M2.route(g[4],20);if(emp(r3c)===emp(r3s))s2b++;}
  /* (3) nuages après espace */ {const M=C.creer(search);M.route(g[0],0);const a=nuages(M,g[5],10);const F=C.creer(search);const b=nuages(F,g[5],10);if(emp(a)===emp(b))s3++;else diff3.push(g[5]);}
  if(k%10===9)console.error(k+1,'/',n);}
console.log(JSON.stringify({search,n,memeGraineDeuxFois:s1,courseApresRaz_identique:s2a,courseSansRaz_identique:s2b,nuagesApresEspace_identique:s3,diff2:diff2.slice(0,6),diff3:diff3.slice(0,6)},null,1));
