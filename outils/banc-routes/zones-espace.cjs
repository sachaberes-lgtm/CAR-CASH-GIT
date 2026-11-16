/* LES ZONES DE L'ORBITE (2026-11-12, L'ORBITE VERS L'AVANT) : sur N graines × paliers, combien de temps forts pisteTord refuse (une zone refusée garde le dévers : le saut y est faussé),
   et les modules tirés. node outils/banc-routes/zones-espace.cjs [paliers=0,10,20] [graines=1-40] [fort=faille] */
const arg=k=>{const a=process.argv.find(x=>x.startsWith(k+'='));return a?a.slice(k.length+1):null;};
const fort=arg('fort');const B=require('./charge.cjs').creer(fort?'?fort='+fort:'');
const PAL=(arg('paliers')||'0,10,20').split(',').map(Number),[g0,g1]=(arg('graines')||'1-40').split('-').map(Number);
for(const p of PAL){let n=0,ref=0,ex=[];const figs={};
  for(let g=g0;g<=g1;g++){const r=B.piste('espace',g,p);const z=(r.info&&r.info.zones)||[];
    for(const q of z){n++;figs[q[0]]=(figs[q[0]]|0)+1;if(!q[5]){ref++;if(ex.length<8)ex.push('g'+g+':'+q[0]+'@'+q[1]+'(s0 '+q[3]+', fin '+q[4]+')');}}}
  console.log('palier',p,'· zones',n,'· refusées',ref,ex.length?'· ex '+ex.join(' '):'','· figs',JSON.stringify(figs));}
