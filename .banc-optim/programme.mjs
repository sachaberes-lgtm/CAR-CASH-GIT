// Pose dans la page un programme AUTONOME (splash, menu, JOUER, course pilotée, fin) qui tourne inspecteur débranché.
// node cdp.mjs programme.mjs <menu_s> <course_s>
import { ENREG } from './app-course.mjs';
export default async function (c, [menu = '12', course = '45']) {
  await c.js(`window.__fr=null;window.__prog=null;` + ENREG);
  await c.js(`(function(){const P=window.__prog={log:[],fin:false};const L=function(m){P.log.push(Math.round(performance.now())+' '+m);};
    const fr=window.__fr;const sp=document.getElementById('splash');
    if(sp){sp.click();L('splash clic');setTimeout(function(){const s2=document.getElementById('splash');if(s2){s2.click();L('splash 2e clic');}},1500);}
    fr.phase='menu';
    setTimeout(function(){fr.phase='depart';const b=[...document.querySelectorAll('[data-m="play"]')].find(e=>e.getClientRects().length);L('JOUER '+!!b);if(b)b.click();if(window.dbgAuto)dbgAuto(1,0,{nit:1});
      const w=setInterval(function(){if(document.body.classList.contains('play')){clearInterval(w);fr.phase='course';if(window.dbgAuto)dbgAuto(1,0,{nit:1});L('course');
        const pp=[];const iv=setInterval(function(){try{const s=dbgState();pp.push(JSON.stringify({t:Math.round(performance.now()),p:dbgPerf(),g:s.gameOver,m:s.mode}));if(s.gameOver&&fr.phase==='course'){fr.phase='mort';L('mort');}}catch(e){}},2000);P.perfs=pp;
        setTimeout(function(){clearInterval(iv);fr.phase='fin';if(window.dbgAuto)dbgAuto(0);P.fin=true;L('fin');},${+course}*1000);}},100);},${+menu}*1000);
    return 1;})()`);
  console.log('programme posé');
}
