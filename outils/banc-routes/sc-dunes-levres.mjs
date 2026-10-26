/* banc (non livré) : l'état des lèvres de crête des dunes et des variables de vitesse */
export default async function(H){
  await H.jouer();await H.sleep(2500);
  console.log(await H.ev(`JSON.stringify(__ev("({n:DN.lev.length,lev:DN.lev.slice(0,6),vP:typeof vPalier==='function'?vPalier():null,SPD:SPD,vit:typeof vitMult==='function'?vitMult():null,vA:vA,L:L,trous:TROUS.length,t0:TROUS.slice(0,3)})"))`));
  console.log(await H.ev(`JSON.stringify(dbgDunes().levres)`));
}
