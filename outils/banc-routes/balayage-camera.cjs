/* balayage : N lâchers au hasard (graine fixe), 3 jeux en parallèle, une ligne RES par cas. node balayage-camera.cjs N [graine] [carte] */
const {spawn}=require('child_process');const path=require('path');
const N=+process.argv[2]||24,G=+process.argv[3]||1,carte=process.argv[4]||'nuages';
let x=G*2654435761%2**32;const rnd=()=>{x=(x*1664525+1013904223)%2**32;return x/2**32;};
const pick=a=>a[Math.floor(rnd()*a.length)];
const cas=[];for(let i=0;i<N;i++){const face=pick([1,1,-1,-1]);const sg=face;
  const lache={face,vT:pick([50,80,120,200,350]),lat:pick([0,0,5,-5,12,-12,22,-22]),u:pick([1,1,1,-1])};
  lache.h=sg>0?pick([2.5,4,8,14,25]):-5.2-pick([2,4,8,14,25]);lache.vN=sg>0?-pick([2,6,12,25]):pick([2,6,12,25]);lache.vB=pick([0,0,6,-6,15,-15]);
  cas.push({lache,pas:300});}
let k=0,run=0;const out=[];
function go(){if(k>=N){if(run===0)finir();return;}const c=cas[k++];run++;
  const p=spawn('node',['jeu.mjs',carte,'midi','0','0'],{cwd:__dirname,env:Object.assign({},process.env,{SCRIPT:path.join(__dirname,'sc-camera.mjs'),OUT:'/tmp',CAS:JSON.stringify([c])})});
  let b='';p.stdout.on('data',d=>b+=d);p.on('close',()=>{run--;const l=b.split('\n').filter(l=>l.startsWith('RES '));out.push(l.length?l[0].slice(4):JSON.stringify({cas:c,erreur:b.slice(-200)}));go();});}
function finir(){out.forEach(l=>console.log(l));}
for(let i=0;i<3;i++)go();
