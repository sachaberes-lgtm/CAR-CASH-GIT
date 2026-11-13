async function(cfg){
  const L=__L,ms=1000/cfg.hz,out={cfg:cfg};
  const st=await L.start(cfg.graine);if(!st.ok)return st;
  const hold=function(){dbgBord({grace:9});};
  function grid(rec,cols,step,T){const R={t:[]};cols.forEach(function(c){R['c'+c]=[];});let j=0;
    for(let t=0;t<=T+1e-9;t+=step){while(j<rec.length-2&&rec[j+1][0]<t)j++;const a=rec[j],b=rec[Math.min(j+1,rec.length-1)];if(!a)break;R.t.push(+t.toFixed(3));
      cols.forEach(function(c){let v;if(typeof a[c]==='string'){v=a[c];}else{const w=b[0]>a[0]?Math.min(1,Math.max(0,(t-a[0])/(b[0]-a[0]))):0;v=+(a[c]+(b[c]-a[c])*w).toFixed(4);}R['c'+c].push(v);});}
    return R;}
  function reset(s,vA,lat){dbgAuto(0);dbgBord({s:s,lat:lat||0,psi:0,vA:vA,grace:9});for(const k of ['ArrowLeft','ArrowRight','ArrowDown','Space'])L.key(k,false);}
  function settle(secs){L.run(ms,secs,function(){hold();});}
  /* T1 virage plein volant à deux vitesses : 1,5 s maintenu à gauche puis 1,2 s relâché */
  out.virage={};
  for(const v of [80,200]){reset(150,v);settle(2.5);dbgBord({vA:v});L.key('ArrowLeft',true);
    const r1=L.run(ms,1.5,hold);L.key('ArrowLeft',false);const r2=L.run(ms,1.2,hold);const rec=r1.concat(r2.map(function(r){const q=r.slice();q[0]+=r1.length?r1[r1.length-1][0]:0;return q;}));
    out.virage['v'+v]=grid(rec,[2,3,4,5,16,10,11,12,7,8,9],.1,2.7);}
  /* T2 freinage à fond depuis 150, puis 0 → départ arrêté */
  reset(300,150);settle(1.5);dbgBord({vA:150});L.key('ArrowDown',true);const fr=L.run(ms,4,hold);L.key('ArrowDown',false);out.frein=grid(fr,[1,2],.25,4);
  reset(500,0);const ac=L.run(ms,30,hold);out.depart=grid(ac,[1,2,3],.5,30);
  /* T3 sauts : impulsions 8, 14, 22 à vA 120 ; grâce coupée (la pose est jugée pour de vrai) */
  out.saut=[];
  for(const [S0,imp] of [[150,8],[400,14],[700,22],[900,14]]){reset(S0,120);settle(2);dbgAuto(0);dbgBord({vA:120,grace:0,saut:imp});
    const t0=__V.t,rec=[];let y0=dbgScene().car.position.y;
    for(let k=0;k<Math.ceil(14000/ms);k++){__V.tick(1,ms);const r=L.samp(t0);rec.push(r);if(k>2&&(r[6]==='drive'||r[14]))break;}
    let ymax=-1e9,vymax=-1e9,tv=0;for(const r of rec){ymax=Math.max(ymax,r[8]-y0);if(r[6]==='fall')tv=r[0];}
    const last=rec[rec.length-1];
    out.saut.push({S0:S0,imp:imp,y0:y0,hmax:+ymax.toFixed(2),vol:+tv.toFixed(3),sFin:last[1],ds:+(last[1]-S0).toFixed(1),mortApres:last[14],mode:last[6],n:rec.length,fallT:last[15],fvy0:rec[0][17]});}
  /* T4 nitro tenue de pleine jauge */
  reset(1200,100);L.run(ms,16,function(){hold();dbgBord({vA:100});});
  const e0=dbgEco();out.nitroDepart={nitroR:e0.nitroR};
  dbgBord({vA:100});L.key('Space',true);const side=[];
  const nr=L.run(ms,9,function(k,t){hold();const e=dbgEco();side.push([t,e.nitroR,e.nitroOn?1:0]);});L.key('Space',false);
  out.nitro={sidehz:cfg.hz,rec:grid(nr,[1,2],.25,9),nit:grid(side.map(function(a){return a;}),[1,2],.25,9)};
  /* T5 pouvoirs : durée réelle des cinq minuteurs, en secondes de jeu */
  reset(1500,100);settle(2);for(const k of ['n','a','v','m','x'])dbgPwr(k);
  const pw=[];L.run(ms,22,function(k,t){hold();const p=dbgPwr().pwr;pw.push([t,p.n,p.a,p.v,p.m,p.x]);});
  out.pouvoirs=grid(pw,[1,2,3,4,5],.5,22);const fin={};
  [['n',1],['a',2],['v',3],['m',4],['x',5]].forEach(function(o){let t=null;for(const r of pw){if(r[o[1]]<=0.0001){t=r[0];break;}}fin[o[0]]=t;});out.pouvoirsFin=fin;out.pouvoirsDebut=pw[0];
  /* T6 flow : vidange 60 → ? sans rien nourrir ; puis la frénésie */
  reset(1800,100);settle(2);dbgFren('v',60);const fl=[];L.run(ms,12,function(k,t){hold();dbgBord({vA:100});const f=dbgFren();fl.push([t,f.v,f.lv,f.idle,f.vit]);});
  out.flowVide=grid(fl,[1,2,3,4],.5,12);
  reset(2100,100);settle(2);dbgFren('v',99.9);dbgFren('entre');const fz=[];let fin0=null;
  L.run(ms,40,function(k,t){hold();dbgBord({vA:100});const f=dbgFren();fz.push([t,f.v,f.lv,f.tenue]);if(f.lv<4&&fin0===null&&t>.2)fin0=t;});
  out.frenesie=grid(fz,[1,2,3],.5,40);out.frenesieFin=fin0;
  return out;
}
