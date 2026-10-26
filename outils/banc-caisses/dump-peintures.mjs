import fs from 'node:fs';
import { lance, prepare, charge, passeSplash, sleep } from './cdp.mjs';
const c = await lance({ port: 9484 });
try {
  await prepare(c,{shop:{own:['peinture:citron','peinture:damier','peinture:nardo'],eq:{peinture:'citron',aile:'panneaux',trainee:'nitro'}}});
  await charge(c, `http://127.0.0.1:${process.env.PORT}/index.html?colonne=0&simu=1&garde=1`, { attente: 120000 });
  await passeSplash(c); await sleep(1500);
  const r = await c.ev(`__ev(${JSON.stringify(`JSON.stringify(COSM.peinture.map(function(d){var m=d.mis2?m2Def(d.mis2):null;return {id:d.id,n:d.n,p:d.p||0,pk:d.pk||0,mis:d.mis||0,mis2:d.mis2||'',eur:d.eur||'',sec:d.sec||'',pack:d.pack||'',r:(function(){try{return cosmRar('peinture',d);}catch(e){return d.r||'';}})(),miss:m?m.t:'',c:(d.c!=null?d.c:null),grad:d.grad||null};}))`)})`);
  fs.writeFileSync(process.env.SORTIE, r);console.log('shop',await c.ev(`__ev('JSON.stringify({own:SAVE.d.shop.own,eq:SAVE.d.shop.eq})')`));console.log(r.length, c.erreurs.slice(0,3));
} finally { await c.fin(); }
