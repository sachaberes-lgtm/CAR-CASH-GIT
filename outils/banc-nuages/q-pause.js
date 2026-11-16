(async function(){/* pause tout de suite, attend que les nuages soient prêts, cache les écrans par-dessus */
const R=dbgRoute(),i=Math.round(R.NP*.04),p=R.pts[i],t=R.T[i];dbgAudit('vue',{p:[p.x-t.x*11,p.y+4.5,p.z-t.z*11],c:[p.x+t.x*40,p.y,p.z+t.z*40]});
const sc=dbgScene().scene;for(let w=0;w<400;w++){let v8=0,v8f=0;sc.traverse(function(m){if(m.name==='nuages v8'){v8++;if(m.userData.fin)v8f++;}});if(dbgCoton().toutPretMs!=null&&v8f>=v8)break;await new Promise(r=>setTimeout(r,500));}
try{serieWFerme();}catch(e){}for(const id of ['serieW','mvW','hud','garage','mobCtl','bNitro','pauseBtn','mPause','mDead']){const e=document.getElementById(id);if(e)e.style.display='none';}
document.querySelectorAll('.menu,.ecran').forEach(function(e){e.style.display='none';});return {paused:dbgState().paused,go:dbgState().gameOver};})()
