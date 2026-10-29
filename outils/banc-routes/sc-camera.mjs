/* scénario : la CAMÉRA image par image autour des vols et des poses (dessus ↔ dessous). 2026-10-29.
   node jeu.mjs <carte> <meteo> 0 0 SCRIPT=…/sc-camera.mjs  (env EXTRA='&tel=1' pour la version téléphone ; env VW/VH pour le cadre)
   Pas déterministe 1/60 s (dbgStep). Mesure à chaque image : tour de la caméra (°), saut de sa place RELATIVE à la caisse (m), saut du champ (°). */
const DEG=180/Math.PI;
export default async function(H,[carte]){
  await H.jouer();await H.sleep(2500);
  /* le temps du banc : performance.now avance de 1/60 s par pas, sinon les « reprises » de caméra (trous de plus de 400 ms) et le dt du jeu se jugent en temps réel */
  await H.ev(`(function(){if(window.__pas)return;window.__T=performance.now();performance.now=function(){return window.__T;};window.requestAnimationFrame=function(){return 0;};
    window.__pas=function(n){for(var i=0;i<n;i++){window.__T+=16.667;dbgStep(1,16.667);}};})();dbgAuto(1,0,{vol:true});${process.env.VIE==='0'?'dbgCamVie(false);':''}1`);
  const cas=JSON.parse(process.env.CAS||'[{"saut":14},{"saut":30},{"saut":60},{"saut":14,"lat":1.6},{"saut":0,"face":-1}]');
  for(const c of cas){
    const r=await H.ev(`(function(){
      var out=[],st=function(){var x=dbgCam();out.push(x);};
      __pas(120);
      ${c.roule?'':c.lache?`dbgLache(${JSON.stringify(c.lache)});`:c.face?`dbgTakeoff(${c.face});`:`dbgBord({saut:${c.saut||14}${c.lat!=null?`,lat:${c.lat}`:''}});`}
      for(var i=0;i<${c.pas||360};i++){__pas(1);st();}
      return JSON.stringify(out);})()`);
    const o=JSON.parse(r);const fr=[];
    for(let i=1;i<o.length;i++){const a=o[i-1],b=o[i];
      const dot=Math.abs(a.q[0]*b.q[0]+a.q[1]*b.q[1]+a.q[2]*b.q[2]+a.q[3]*b.q[3]);const ang=2*Math.acos(Math.min(1,dot))*DEG;
      const ra=[a.p[0]-a.c[0],a.p[1]-a.c[1],a.p[2]-a.c[2]],rb=[b.p[0]-b.c[0],b.p[1]-b.c[1],b.p[2]-b.c[2]];
      const dp=Math.hypot(rb[0]-ra[0],rb[1]-ra[1],rb[2]-ra[2]),df=Math.abs(b.fov-a.fov);
      fr.push({i,ang,dp,df,a,b});}
    const pire=k=>fr.reduce((m,x)=>x[k]>m[k]?x:m,fr[0]||{ang:0,dp:0,df:0,i:0,a:{m:'-'},b:{m:'-'}});
    const pa=pire('ang'),pp=pire('dp'),pf=pire('df');
    const mort=o.some(x=>x.m==='boom'),pose=fr.find(x=>x.a.m==='fall'&&x.b.m==='drive');
    const apres=pose?fr.filter(x=>x.i>=pose.i&&x.i<pose.i+90):[];const pAp=apres.reduce((m,x)=>Math.max(m,x.ang),0);
    const tonn=o.filter(x=>x.en).length;
    const rep={vie:process.env.VIE!=='0',cas:c,mort,pose:pose?pose.i:null,faceFin:o[o.length-1].sd,tour:+pa.ang.toFixed(1),iT:pa.i,modeT:pa.a.m+'>'+pa.b.m,place:+pp.dp.toFixed(2),iP:pp.i,champ:+pf.df.toFixed(1),apresPose:+pAp.toFixed(1),tonneau:tonn,gt4:fr.filter(x=>x.ang>4&&x.a.m!=='boom').length};
    console.log('RES '+JSON.stringify(rep));
    if(process.env.DETAIL){for(const x of fr.filter(x=>x.ang>4&&x.a.m!=='boom').slice(0,10))console.log('   #'+x.i+' '+x.a.m+'>'+x.b.m+' face '+x.a.sd+'>'+x.b.sd+' ft'+x.b.ft.toFixed(2)+' tour '+x.ang.toFixed(1)+'° place '+x.dp.toFixed(2)+'m ton:'+x.b.en);}
    await H.ev(`dbgAuto(1,0,{vol:true});__pas(60);1`);
  }
}
