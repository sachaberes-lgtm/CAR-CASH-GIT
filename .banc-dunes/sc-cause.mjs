export default async function(H){
  await H.jouer();await H.sleep(2500);
  await H.ev('dbgAuto(1,0,{vol:true});1');await H.sleep(1500);
  await H.ev('__ev("explode(\'sable\')")');
  for(let i=0;i<30;i++){await H.sleep(500);if(await H.ev('document.getElementById("mDead")&&document.getElementById("mDead").classList.contains("on")'))break;}
  await H.sleep(3500);
  console.log(await H.ev('JSON.stringify({on:document.getElementById("mDead").classList.contains("on"),texte:document.getElementById("mCause").textContent,display:(document.getElementById("mCauseVoir")||{}).textContent,vis:document.getElementById("mCause").getBoundingClientRect().height})'));
  await H.shot('cause-voir');
}
