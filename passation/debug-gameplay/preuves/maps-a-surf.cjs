// Preuve MAP-A01 : a flot (0.04<f<1) la vitesse horizontale se stabilise au-dessus de EAU.vPl (50) => flotT ne monte jamais, la mer ne ramene pas.
// Formules recopiees de code/maps/jade-3.js:349-352 et 434-447 (constantes EAU).
const EAU={cl:.2,cq:.009,vPl:50,surfK:.22,sousK:.4,mot:110,vB:95};
for(const f of [.15,.3,.6]){
  let h=130;const dtF=1/60;let flot=0,t=0,minH=1e9;
  for(let i=0;i<60*120;i++){ // 120 s
    const v=h,pl=Math.min(1,Math.max(0,(h-EAU.vPl)/60)),k=(EAU.cl+EAU.cq*v)*(.25+.75*f)*(1-.5*pl*(1-f));
    const kk=h>EAU.vPl?EAU.surfK:1;h*=Math.exp(-k*kk*dtF);
    if(f>.04&&f<1&&h<EAU.vB){h+=EAU.mot*(1-h/EAU.vB)*dtF;}
    if(!(h>EAU.vPl))flot+=dtF; else flot=Math.max(0,flot-dtF*2); // jade-3.js:446
    t+=dtF;if(i>60*60)minH=Math.min(minH,h);
  }
  console.log('f='+f,'hv apres 120 s =',h.toFixed(1),'(vPl=50) flotT=',flot.toFixed(2),'(ramene a 9 s)');
}
