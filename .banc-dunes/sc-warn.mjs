export default async function(H){
  await H.jouer();await H.sleep(4000);
  console.log(await H.ev('JSON.stringify({warns:window.__warns.filter(function(x){return !/flatShading/.test(x);}).slice(0,6),nw:window.__warns.length,dnErr:String(__ev("window.__dnErr||\'\'")),mo:__ev("DN.mo.length"),scn:__ev("(DN.scn||[]).length"),ob:__ev("DN.ob.length")})'));
}
