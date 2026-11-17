/* la part à l'envers de Jade selon le JEU lui-même (JADE.a3.envers, %, mesurée par genJadeAG) — pour vérifier notre mesure par les normales */
const L=require('./lib.cjs');
for(const [e,ref] of [['avant','88a648892'],['apres','']])for(const p of [0,10,27]){const M=L.moteur('jade','',ref);M.raz();const G=L.graines(100,0x1E5+p);let z=0,s6=0,t=0;
  for(const g of G){M.route(g,p);const v=M.ctx.JADE.a3.envers;t+=v;if(v===0)z++;if(v<6)s6++;}
  console.log('jade',e,'p'+p,': JADE.a3.envers moy '+(t/100).toFixed(1)+' % · à 0 % : '+z+'/100 · sous 6 % : '+s6+'/100');}
