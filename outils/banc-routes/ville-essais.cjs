/* ville-essais.cjs (2026-11-14, MAPS PRO — la ville) : le meilleur-de-N de la ville, décomposé — combien d'essais le directeur de rythme joue par route (RYTHME.der.n ; « assez » = note ≤ 1),
   la note gardée et ce qui la compose (rythme · recoupe · croisements · décor perdu · raccourcis · tenue de cap). Compteurs déterministes (pas de temps).
   node ville-essais.cjs [racine=<worktree>] [graines=1-12]   (SEARCH='?…' : une variante) */
const path=require('path'),vm=require('vm');const arg=(k,d)=>{const a=process.argv.find(x=>x.startsWith(k+'='));return a?a.slice(k.length+1):d;};
const B=require(path.join(path.resolve(arg('racine',path.join(__dirname,'../..'))),'outils/banc-routes/charge.cjs')).creer(process.env.SEARCH||''),ctx=B.ctx,[g0,g1]=arg('graines','1-12').split('-').map(Number);
for(const c of ['ville','crypto'])for(const p of [0,10,20]){const a={n:0,note:0,ry:0,rec:0,cr:0,dec:0,rac:0,ten:0,bou:0},N=g1-g0+1;let mx=0;
  for(let g=g0;g<=g1;g++){vm.runInContext('VILLE_BANK.graine='+g,ctx);const r=B.piste(c,g,p),d=vm.runInContext('RYTHME.der',ctx);ctx.__c9=r.ctrl;
    const m=vm.runInContext('({rec:routeRecoupe(__c9,MODMARK),cr:vsCroise(__c9,MODMARK),dec:vsMalusDecor(__c9),rac:vsMalusRac(MODMARK),ten:vsMalusTenue(__c9),bou:typeof vsMalusBoucle==="function"?vsMalusBoucle(__c9,MODMARK):0})',ctx);
    a.n+=d.n;a.note+=d.note;mx=Math.max(mx,d.note);a.rec+=m.rec;a.cr+=m.cr;a.dec+=m.dec;a.rac+=m.rac;a.ten+=m.ten;a.bou+=m.bou;a.ry+=d.note-m.rec-m.cr-m.dec-m.rac-m.ten-m.bou;}
  const f=k=>(a[k]/N).toFixed(2);console.log(c.padEnd(6),'p'+String(p).padEnd(2),'essais/route',f('n'),'| note gardée',f('note'),'(max',mx.toFixed(1)+')','= rythme',f('ry'),'+ recoupe',f('rec'),'+ croisements',f('cr'),'+ décor perdu',f('dec'),'+ raccourcis',f('rac'),'+ tenue',f('ten'),'+ boucles',f('bou'));}
