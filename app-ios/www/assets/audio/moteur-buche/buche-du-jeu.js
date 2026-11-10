




function engWave9(AC9,e){
  if(!e.w){const re=new Float32Array(e.h.length+1),im=new Float32Array(e.h.length+1);
    for(let i=0;i<e.h.length;i++)im[i+1]=e.h[i];
    e.w=AC9.createPeriodicWave(re,im);}
  return e.w;
}







let ENG_DOUX=true;
const ENG_GENOU=420,ENG_GENOU_P=.30;
function engGenou(f){return ENG_DOUX&&f>ENG_GENOU?ENG_GENOU*Math.pow(f/ENG_GENOU,ENG_GENOU_P):f;}



function engSndParams(e,st){


  const nA=st.nA||0, ch=st.charge||0, ov=st.ovr||0, rpm=Math.max(0,st.rpm||0), dr=st.drift||0;
  const meca=e.gr>1?1:0;











  const ENG_PITCH=.62;
  const fF0=(e.i+rpm*e.r)*ENG_PITCH*(1+.04*nA)*(1+(st.wob||0));
  const fF=engGenou(fF0)*(1+(ENG_DOUX?(st.resp||0):0));





  const nB=st.nB||0,gE=st.gE==null?.72:st.gE;
  const drv=Math.max(.08,.42+ch*2.45+ov*-.16+.55*nB*nA);
  const lpB=Math.max(240,Math.min(2800,e.fq+fF0*e.fr));

  const ev=(.019+.026*rpm+.009*ch)*(1-.10*nA+.38*nB*nA)*e.vol*(st.dk==null?1:st.dk)*gE;
  const vsp=st.vsp||0;
  return {
    fF:fF, detune:7+ch*19, subF:Math.max(22,fF*.5),
    nzF:Math.min(3200,Math.max(260,fF0*6*(.72+ch*.62))),
    nzG:(.06+.26*ch+.08*rpm)*(e.nz||1)*(1-.5*nA)*.7,






    whineOn:!!e.whine, whineF:e.whine?(ENG_DOUX?Math.min(fF0*e.whine,1000+2400*Math.min(1,rpm)*(.7+.3*Math.min(1,e.whine/30))):Math.min(9000,fF0*e.whine)):2000,
    whineG:e.whine?(.10+.16*ch)*Math.pow(Math.min(1,rpm),.7)*(1-.45*nA)*(1-ov*.7)*.4*(ENG_DOUX?1-.3*Math.min(1,Math.max(0,(fF0-ENG_GENOU)/140)):1):0,
    drv:drv, post:1.05/Math.pow(drv,.55), eq:-8.0+ch*7.0,
    mix:.42+.20*ch+.10*(st.thr||0)+.05*nA,
    subG:e.sub*(.34+.30*ch+.22*(st.thr||0)+.45*nA),
    tickF:Math.max(6,fF), tickG:meca*(.012+.055*ch+.018*rpm)*(1-.5*nA*(1-nB)),
    pinkG:(.020+.030*rpm+.020*ch)*(1-.4*nA),
    transF:240+vsp*2300*(1+dr*.004), diffF:120+vsp*760,
    transG:meca*(.008+.026*ch+.010*vsp)*(1-.55*nA),
    diffG:meca*(.006+.014*ch+.012*vsp)*(1-.55*nA),
    ovrF:200+rpm*900, ovrG:meca*ov*(.030+.070*rpm)*(1-.6*nA),
    lp:Math.max(st.lpMin||0,lpB*(.62+ch*.55)*(1-ov*.45)*(1+(st.boost?.06:0))*(1+dr*.015)*(1-.25*nA*(1-nB))*(1-.45*(st.cloudIn||0))),





    ev:ev, lfoF:Math.min(24,Math.max(7,fF*.22)),
    lfoG:ev*Math.min(.85,.22+e.lope*.9+.22*ch+.18*(st.thr||0)+.28*nA)
  };
}




function engLoadStep(prev,thr,rpm,dSn,dt){
  const cCib=thr?Math.max(0,Math.min(1,.26+dSn*2.6)):0;
  const oCib=(!thr&&rpm>.20)?Math.min(1,(rpm-.20)*2.4):0;
  return {
    charge:prev.charge+(cCib-prev.charge)*Math.min(1,dt*(cCib>prev.charge?9:3.4)),
    ovr:prev.ovr+(oCib-prev.ovr)*Math.min(1,dt*(oCib>prev.ovr?10:4.5)),
    drift:prev.drift+((Math.random()-.5)*.9-prev.drift)*Math.min(1,dt*1.6)
  };
}
const ENG_SND=[
 {i:15, r:95,  h:[1,.42,.88,.30,.20],                     sub:.42,dr:2.7,fq:180,fr:2.3,gr:4,lope:.34,wob:.065,crk:.18,vol:1.15,nz:1.15,fLen:.75,fHz:26,fJit:.55,fmt:[210,1.6,5.0]},
 {i:18, r:150, h:[1,.30,.92,.26,.34,.16],                 sub:.46,dr:2.2,fq:210,fr:2.6,gr:4,lope:.26,wob:.030,crk:.24,vol:1.08,nz:1.05,fLen:.80,fHz:31,fJit:.42,fmt:[185,1.7,5.4]},
 {i:24, r:200, h:[1,.26,.86,.22,.46,.18,.24],             sub:.44,dr:1.9,fq:240,fr:2.8,gr:5,lope:.15,wob:.016,crk:.20,vol:1.04,nz:1,   fLen:.82,fHz:34,fJit:.34,fmt:[168,1.5,4.4]},
 {i:30, r:250, h:[1,.40,.80,.30,.44,.22,.26,.12],         sub:.46,dr:1.8,fq:270,fr:3.0,gr:5,lope:.11,wob:.010,crk:.22,vol:1,   nz:1,   fLen:.85,fHz:37,fJit:.30,fmt:[150,1.4,4.0]},
 {i:31, r:300, h:[1,.34,.86,.28,.52,.26,.32,.15,.10],     sub:.42,dr:1.9,fq:310,fr:3.3,gr:5,lope:.08,wob:.007,crk:.34,vol:1,   nz:1,   fLen:.88,fHz:41,fJit:.28,fmt:[146,1.5,4.2]},
 {i:30, r:285, h:[1,.38,.74,.32,.40,.24,.22,.12],         sub:.52,dr:2.0,fq:290,fr:3.1,gr:5,lope:.09,wob:.008,crk:.58,vol:1.02,nz:1.35,fLen:.92,fHz:33,fJit:.44,whine:9,fmt:[132,1.2,3.4]},
 {i:38, r:350, h:[1,.44,.70,.50,.36,.30,.20,.14],         sub:.50,dr:1.9,fq:320,fr:3.3,gr:5,lope:.13,wob:.024,crk:.28,vol:1.04,nz:1.1, fLen:.88,fHz:36,fJit:.38,whine:7,fmt:[138,1.4,4.6]},
 {i:45, r:400, h:[1,.48,.72,.46,.48,.30,.30,.18,.14],     sub:.52,dr:1.8,fq:340,fr:3.6,gr:6,lope:.09,wob:.006,crk:.30,vol:1,   nz:1,   fLen:.90,fHz:40,fJit:.30,fmt:[124,1.3,4.0]},
 {i:45, r:420, h:[1,.42,.66,.44,.42,.28,.26,.16,.12],     sub:.58,dr:2.0,fq:330,fr:3.5,gr:6,lope:.08,wob:.006,crk:.46,vol:1.04,nz:1.4, fLen:.96,fHz:34,fJit:.46,whine:11,fmt:[118,1.1,3.2]},





 {i:30, r:320, h:[1,1.77,2.19,1.29,.65,.44,.29,.75,.31,.16],sub:.48,dr:2.0,fq:300,fr:3.2,gr:5,lope:.20,wob:.014,crk:.34,vol:1.06,nz:1.1, fLen:.84,fHz:30,fJit:.40,fmt:[95,1.3,4.1]},
 {i:58, r:500, h:[1,.92,.44,.70,.32,.40,.24,.18,.12],     sub:.88,dr:2.3,fq:250,fr:2.7,gr:6,lope:.24,wob:.020,crk:.62,vol:1.12,nz:1,   fLen:1.02,fHz:24,fJit:.62,fmt:[ 88,1.5,5.6]},
 {i:58, r:480, h:[1,.86,.48,.66,.36,.38,.26,.20,.14],     sub:.90,dr:2.4,fq:260,fr:2.8,gr:6,lope:.20,wob:.016,crk:.50,vol:1.14,nz:1.2, fLen:1.06,fHz:27,fJit:.55,whine:13,fmt:[ 84,1.4,5.0]},
 {i:74, r:700, h:[1,.34,.78,.56,.66,.42,.52,.32,.32,.20,.22],sub:.40,dr:1.7,fq:430,fr:4.3,gr:7,lope:.05,wob:.004,crk:.62,vol:1,nz:.95,fLen:1.05,fHz:46,fJit:.34,fmt:[104,1.6,4.8]},
 {i:88, r:860, h:[1,.30,.72,.58,.74,.50,.60,.40,.42,.28,.30,.16],sub:.34,dr:1.6,fq:500,fr:4.6,gr:7,lope:.04,wob:.003,crk:.60,vol:1,nz:.9,fLen:1.10,fHz:52,fJit:.28,fmt:[112,1.7,4.6]},
 {i:88, r:700, h:[1,.52,.60,.62,.54,.48,.44,.34,.30,.22,.18],sub:.44,dr:1.5,fq:460,fr:4.2,gr:7,lope:.04,wob:.003,crk:.40,vol:.98,nz:.9,fLen:1.06,fHz:48,fJit:.24,fmt:[ 98,1.5,4.0]},
 {i:116,r:1000,h:[1,.28,.68,.56,.76,.52,.64,.44,.46,.32,.34,.20,.16],sub:.32,dr:1.55,fq:560,fr:4.8,gr:8,lope:.03,wob:.002,crk:.58,vol:1,nz:.88,fLen:1.14,fHz:58,fJit:.26,fmt:[118,1.8,4.4]},
 {i:118,r:1400,h:[1,.24,.80,.44,.86,.46,.70,.38,.50,.30,.34,.22],sub:.26,dr:1.9,fq:640,fr:5.0,gr:8,lope:.02,wob:.002,crk:.75,vol:1.04,nz:.95,fLen:1.18,fHz:66,fJit:.36,fmt:[136,2.0,5.2]},
 {i:60, r:620, h:[1,.44,.62,.48,.44,.32,.28,.20,.16],     sub:.72,dr:2.1,fq:360,fr:3.6,gr:7,lope:.06,wob:.005,crk:.55,vol:1.10,nz:1.7, fLen:1.12,fHz:30,fJit:.52,whine:15,fmt:[ 92,1.2,3.6]},



 {i:80, r:950, h:[1,.16,.62,.12,.48,.10,.30,.08],         sub:.34,dr:2.2,fq:620,fr:5.2,gr:6,lope:.02,wob:.002,crk:.58,vol:1.02,nz:1.15,fLen:1.10,fHz:72,fJit:.40,whine:8,fmt:[158,1.9,5.8]},

 {i:52, r:1150,h:[1,.14,.08,.16,.05,.09],                 sub:.62,dr:1.25,fq:420,fr:4.6,gr:1,lope:0,wob:0,crk:0,vol:1,   nz:2.3, fLen:1.20,fHz:14,fJit:.10,whine:16,fmt:[ 74,0.8,3.0]},
 {i:60, r:1350,h:[1,.10,.05,.12,.03],                     sub:.58,dr:1.2, fq:520,fr:5.0,gr:1,lope:0,wob:0,crk:0,vol:1.02,nz:1.9, fLen:1.26,fHz:11,fJit:.07,whine:23,fmt:[ 68,0.7,2.6]},


 {i:44, r:900, h:[1,.06,.03,.05,.02],                     sub:.86,dr:1.5, fq:380,fr:3.8,gr:1,lope:0,wob:0,crk:0,vol:1.08,nz:3.4, fLen:1.34,fHz:9, fJit:.16,fmt:[ 58,0.5,3.4]},


 {i:45, r:150, h:[1,.85,.70,.60,.50,.42,.34,.28,.22,.18], sub:.80,dr:3.2, fq:520,fr:6.5,gr:1,lope:.60,lk:1,wob:0,crk:.85,vol:1.10,nz:1.6,fLen:1.10,fHz:45,fJit:.85,fmt:[ 96,2.2,6.4]},
 {i:70, r:1500,h:[1,.18,.10,.20,.06,.10],                 sub:.74,dr:1.35,fq:500,fr:5.2,gr:1,lope:0,wob:0,crk:.20,vol:1.06,nz:2.0,fLen:1.28,fHz:13,fJit:.14,whine:12,fmt:[ 64,0.7,3.0]},
 {i:82, r:1750,h:[1,.09,.04,.11,.03],                     sub:.66,dr:1.2, fq:600,fr:5.4,gr:1,lope:0,wob:0,crk:0,vol:1.02,nz:1.7,fLen:1.32,fHz:10,fJit:.06,whine:26,fmt:[ 56,0.6,2.4]},
 {i:64, r:2100,h:[1,.07,.03,.09,.02],                     sub:.92,dr:1.15,fq:460,fr:4.8,gr:1,lope:0,wob:0,crk:0,vol:1.04,nz:1.5,fLen:1.24,fHz:8, fJit:.09,whine:9,fmt:[ 46,0.5,2.8]},
 {i:96, r:2400,h:[1,.13,.07,.12,.04,.08],                 sub:.60,dr:1.25,fq:700,fr:5.6,gr:1,lope:0,wob:0,crk:0,vol:1,   nz:1.6,fLen:1.30,fHz:17,fJit:.20,whine:32,fmt:[ 62,0.8,2.2]},
 {i:88, r:2200,h:[1,.22,.12,.18,.08,.11],                 sub:.72,dr:1.5, fq:620,fr:5.4,gr:1,lope:0,wob:0,crk:.25,vol:1.08,nz:2.6,fLen:1.40,fHz:15,fJit:.30,whine:18,fmt:[ 70,0.9,3.6]},
 {i:120,r:2900,h:[1,.16,.09,.15,.06,.10,.04],             sub:.80,dr:1.4, fq:820,fr:5.7,gr:1,lope:0,wob:0,crk:0,vol:1.08,nz:2.2,fLen:1.44,fHz:19,fJit:.24,whine:28,fmt:[ 52,0.6,3.0]},
 {i:56, r:3300,h:[1,.05,.02,.07,.015],                    sub:1.00,dr:1.3, fq:900,fr:5.8,gr:1,lope:0,wob:0,crk:0,vol:1.10,nz:1.3,fLen:1.50,fHz:6, fJit:.05,whine:34,fmt:[38,0.4,2.6]}
];
 
function engSouffle(t,rpm){return .007*(.62*Math.sin(t*1.45)+.38*Math.sin(t*2.31+1.7))*Math.min(1,Math.max(0,(rpm-.29)/.2));}
function engCurve(k){
  const n=256,c=new Float32Array(n);
  for(let i=0;i<n;i++){const x=i/(n-1)*2-1;c[i]=Math.tanh(x*k)/Math.tanh(k);}
  return c;
}
