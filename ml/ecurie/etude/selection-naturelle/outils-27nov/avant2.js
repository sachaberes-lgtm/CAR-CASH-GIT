/* jetable : les N secondes avant la fin d'une course, vue par vue, en court : lat, cap, vitesse, tenue, virage, sorties.bord, ordre
   usage : node avant2.js <cerveau.js> --graine G [--avant 2.5] [--tmax 300] */
const path=require('path');const A=process.argv.slice(2),opt=(n,d)=>{const i=A.indexOf('--'+n);return i>=0?A[i+1]:d;};
const {ouvrir,charger,course}=require('../../../bot/piloter');const J=ouvrir({regime:'allege'}),C=charger(path.resolve(A[0]));
const log=console.log;console.log=()=>{};console.warn=()=>{};console.error=()=>{};
const r=course(J,C,+opt('graine',910111),{tmax:+opt('tmax',300),trace:true});console.log=log;
const V=r.vues,fin=V[V.length-1].vue.t,N=+opt('avant',2.5);
log(r.bilan.cartes.join('>')+' · '+r.bilan.duree_s+' s · '+r.bilan.cause);
for(const x of V){const v=x.vue,o=x.ordre||{};if(v.t<fin-N)continue;
  const tn=v.tenue,S=v.sorties,ry=X=>X?(X.rayons?X.t+'s:'+X.rayons.map(q=>q.m.slice(0,4)+'='+q.issue.slice(0,4)+'@'+q.t).join(','):X.issue):'-';
  if(v.mode==='sol')log(`${v.t} sol lat ${v.lat} cap ${v.cap} ${Math.round(v.vitesse*3.6)}km/h lacetR ${v.lacetRoute}/${v.lacetMax} gl ${v.glisse?1:0} reb ${v.rebond?1:0} · tenue ${tn?(tn.tient?'tient':'LACHE t'+tn.t+' cote'+tn.cote+(tn.mur?' mur':'')):'-'} · vir ${v.virage?'d'+v.virage.d+' br'+v.virage.braquage+' m'+v.virage.marge:'-'} · bord ${S?ry(S.bord):'-'} · ORDRE ${o.volant!=null?'vol '+(+o.volant).toFixed(2):o.ligne!=null?'ligne '+Math.round(o.ligne):'?'}${o.nitro?' N':''} · touches ${v.main?JSON.stringify(v.main).slice(0,60):''}`);
  else if(v.mode==='vol'){const f=v.vol,p=f.proche||{};log(`${v.t} VOL h ${p.haut} lat ${p.lat} axe ${p.axe} ${Math.round(v.vitesse*3.6)}km/h · ${(f.radar&&f.radar.rayons||[]).map(q=>q.m.slice(0,5)+'='+q.issue.slice(0,4)+'@'+q.t).join(' ')}`);}}
