


























(function(G){
'use strict';
const S={ac:null,dest:null,bus:{},buf:{},off:{},voix:{},der:{},dern:{},ton:0,ok:false,grp:{},m:null,nDec:0,nTot:0,dec:false,
  att:{},use:{},enFile:{},tard:0,perdus:0,evinces:0,demande:null};
const TRIM=-10,FEN=.11,RECUL=-9;
const BUS={
  ui: {db:-5, rev:.05},
  rec:{db: 0, rev:.20},
  fx: {db:+1, rev:.07},
  amb:{db:-4, rev:.30}
};
function dbL(x){return Math.pow(10,x/20);}
function hasard(a){a>>>=0;return function(){a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}


function salleIR(ac){
  const sr=ac.sampleRate,T=1.25,n=Math.round(sr*T),b=ac.createBuffer(2,n,sr),R=hasard(1618),LN=6.907755;
  for(let c=0;c<2;c++){const d=b.getChannelData(c);let lp=0;
    for(let i=0;i<n;i++){const t=i/sr,dec=Math.exp(-LN*t/1.1),k=Math.min(.95,.25+t*1.4);
      lp+=(R()*2-1-lp)*(1-k);d[i]=lp*dec*(t<.004?t/.004:1);}
    for(const [ms,g] of [[7,.5],[13,.36],[19,.28],[29,.2]]){const i=Math.round(ms/1000*sr)+(c?37:0);if(i<n)d[i]+=g*(c?.9:1);}
  }
  return b;
}





function b64ab(s){const bin=atob(s),n=bin.length,u=new Uint8Array(n);for(let i=0;i<n;i++)u[i]=bin.charCodeAt(i);return u.buffer;}
function charge(){
  if(S.dec)return;const B=G.CCSON_BANQUE;if(!B)return;S.dec=true;S.m=B.m;



  const OC=G.OfflineAudioContext||G.webkitOfflineAudioContext;let ctx=null;
  for(const r of [B.sr||32000,44100]){try{ctx=OC?new OC(1,1,r):null;}catch(e){ctx=null;}if(ctx)break;}


  const SKIP0=(function(){try{return document.documentElement.dataset.palier==='0'&&!/[?&]sonsplein=1/.test(location.search);}catch(e){return false;}})()?{foret:1,banquise:1,ailes:1}:null;
  const saute=function(k){return !!SKIP0&&k!=='__etalon'&&!!SKIP0[(B.m[k.split('#')[0]]||{}).fam];};
  const cles=Object.keys(B.d).filter(function(k){return k!=='__etalon'&&!saute(k);}).sort(function(a,b){const ia=a.split('#')[0],ib=b.split('#')[0];return ((B.m[ib]&&B.m[ib].pre)|0)-((B.m[ia]&&B.m[ia].pre)|0);});









  const DEMANDE=!/[?&]sons=tout\b/.test(location.search),TARD=120,VIE=60000;
  const garde=function(k){const f=B.m[k.split('#')[0]]||{};return !!f.pre||/^ui\./.test(k);};
  const fond=DEMANDE?cles.filter(garde):cles,file=[];
  S.nTot=cles.length;let i=0,enCours=0,etalon=B.d.__etalon?0:2;
  const tete=B.tete||.03;
  const attaque=function(buf){
    if(S.t0!=null)return S.t0;
    const d=buf.getChannelData(0),sr=buf.sampleRate,lim=Math.min(d.length,Math.round((tete+.08)*sr));let k=0;
    while(k<lim&&Math.abs(d[k])<2e-4)k++;
    return k>=lim?tete:Math.max(0,(k-Math.round(.0015*sr))/sr);
  };
  const decode=function(c,b64,ok){let fait=false;const une=function(x){if(!fait){fait=true;ok(x);}};
    try{const p=c.decodeAudioData(b64ab(b64),une,function(){une(null);});if(p&&p.catch)p.catch(function(){une(null);});}catch(e){une(null);}};
  const suivant=function(){
    const c=ctx||S.ac;if(!c)return;
    if(etalon<2){if(etalon===1)return;etalon=1;
      decode(c,B.d.__etalon,function(buf){
        if(buf){const d=buf.getChannelData(0);let k=0,m=0;for(let j=0;j<Math.min(d.length,Math.round(.12*buf.sampleRate));j++){const a=Math.abs(d[j]);if(a>m){m=a;k=j;}}
          if(m>.05)S.t0=Math.max(0,(k-Math.round(.0015*buf.sampleRate))/buf.sampleRate);}
        B.d.__etalon=null;etalon=2;suivant();});
      return;}
    while(enCours<4&&(file.length||i<fond.length)){
      const cle=file.length?file.shift():fond[i++],b64=B.d[cle];if(!b64||S.buf[cle]){delete S.enFile[cle];continue;}
      enCours++;
      decode(c,b64,function(buf){enCours--;delete S.enFile[cle];
        if(buf){S.buf[cle]=buf;S.off[cle]=(B.m[cle.split('#')[0]]||{}).pcm?Math.max(0,tete-.0015):attaque(buf);S.nDec++;S.use[cle]=performance.now();}
        if(!DEMANDE||garde(cle))B.d[cle]=null;
        const a=S.att[cle];if(a){delete S.att[cle];if(buf&&performance.now()-a.t<TARD){S.tard++;try{play(a.id,a.o);}catch(e){}}else S.perdus++;}
        suivant();});
    }
  };
  S.demande=function(cle){if(!DEMANDE||S.buf[cle]||S.enFile[cle]||!B.d[cle])return false;S.enFile[cle]=1;file.push(cle);suivant();return true;};
  if(DEMANDE)setInterval(function(){
    const now=performance.now(),n=S.ac?S.ac.currentTime:0;
    for(const cle in S.buf){if(!B.d[cle]||now-(S.use[cle]||0)<VIE)continue;
      const L=S.voix[cle.split('#')[0]];let vive=false;if(L)for(const x of L)if(x.fin>n){vive=true;break;}if(vive)continue;
      delete S.buf[cle];delete S.off[cle];S.nDec--;S.evinces++;}},10000);
  S.relance=suivant;suivant();


  S.ajoute=function(d){for(const k in d){if(B.d[k]!=null||!d[k]||saute(k))continue;B.d[k]=d[k];cles.push(k);if(!DEMANDE||garde(k))fond.push(k);}S.nTot=cles.length;suivant();};
  if(B.partiel)suite();
}
function suite(){
  const go=function(n){const sc=document.querySelector('script[src*="sons-banque.js"]');if(!sc)return;
    const e=document.createElement('script');e.async=true;e.src=sc.getAttribute('src').replace('sons-banque.js','sons-banque-2.js');
    e.onload=function(){const B2=G.CCSON_BANQUE_2;if(B2&&B2.d&&S.ajoute){S.ajoute(B2.d);G.CCSON_BANQUE_2=null;}};
    e.onerror=function(){e.remove();if(n<3)setTimeout(function(){go(n+1);},4000*(n+1));};
    document.head.appendChild(e);};
  const lance=function(){if(typeof requestIdleCallback==='function')requestIdleCallback(function(){go(0);},{timeout:3000});else setTimeout(function(){go(0);},500);};
  if(document.readyState==='complete')lance();else addEventListener('load',lance);
}
function init(ac,dest){
  if(S.ok)return;
  try{
    S.ac=ac;S.dest=dest||ac.destination;

    const pre=ac.createDelay(.1);pre.delayTime.value=.014;
    const hp=ac.createBiquadFilter();hp.type='highpass';hp.frequency.value=280;
    const cv=ac.createConvolver();cv.normalize=true;cv.buffer=salleIR(ac);
    const ret=ac.createGain();ret.gain.value=.55;
    pre.connect(hp);hp.connect(cv);cv.connect(ret);S.salRet=ret;S.salOn=false;


    setInterval(function(){if(!S.salOn||!S.ac)return;const n=S.ac.currentTime;let fin=S.coupe||0; for(const k in S.voix)for(const x of S.voix[k])if(x.fin>fin)fin=x.fin;
      if(n>fin+1.4){try{S.salRet.disconnect(S.dest);}catch(e){}S.salOn=false;}},500);
    for(const k in BUS){const g=ac.createGain();g.gain.value=dbL(BUS[k].db);g.connect(S.dest);
      const s=ac.createGain();s.gain.value=BUS[k].rev;g.connect(s);s.connect(pre);S.bus[k]=g;}
    S.ok=true;
  }catch(e){S.ok=false;}
  charge();if(S.relance)S.relance();
}



function baseDe(f,st){const B=f.bases;if(!B)return 0;let b=B[0];for(const x of B)if(x<=st+.5)b=x;return b;}




function chef(f,t0){
  const g=f.grp;if(!g)return 0;
  let G1=S.grp[g];if(!G1||t0-G1.t>FEN){G1=S.grp[g]={t:t0,prio:-1,voix:[]};}
  const p=f.prio||0;
  if(p<G1.prio){if(f.cede)return null;return RECUL;}
  if(p>G1.prio){const n=Math.max(t0,S.ac.currentTime);
    for(const y of G1.voix){if(!(y.fin>n))continue;
      try{if(y.cede)y.stop(.01);else y.g.gain.setTargetAtTime(y.g0*dbL(RECUL),n,.012);}catch(e){}}
    G1.prio=p;G1.voix=[];}
  G1.t=Math.max(G1.t,t0);return 0;
}


function play(id,o){
  if(!S.ok||!S.m)return null;const f=S.m[id];if(!f)return null;o=o||{};
  const ac=S.ac,now=ac.currentTime,t0=now+(o.t||0);
  if(f.cd>0&&!o.force&&S.der[id]!=null&&Math.abs(t0-S.der[id])<f.cd)return null;
  const st=(o.st||0)+(f.key?S.ton:0),base=baseDe(f,st);

  let v=0;if(o.var!=null)v=Math.max(0,Math.min(f.v-1,o.var|0));else if(f.v>1){v=Math.floor(Math.random()*f.v);if(v===S.dern[id])v=(v+1)%f.v;}
  let cle=id+'#'+v+'#'+base,ab=S.buf[cle];
  if(!ab){const voulu=cle;for(let k=0;k<f.v&&!ab;k++){cle=id+'#'+k+'#'+base;ab=S.buf[cle];}
    if(!ab){if(S.demande&&S.demande(voulu)&&!o.loop)S.att[voulu]={id:id,o:o,t:performance.now()};return null;}} 
  S.use[cle]=performance.now();S.dern[id]=v;
  const dbC=chef(f,t0);if(dbC===null)return null;

  const L=S.voix[id]||(S.voix[id]=[]);for(let i=L.length-1;i>=0;i--)if(L[i].fin<now)L.splice(i,1);
  while(L.length>=f.max){const x=L.shift(),tt=Math.max(now,t0);x.fin=0;S.coupe=Math.max(S.coupe||0,tt+.05);try{x.g.gain.cancelScheduledValues(tt);x.g.gain.setTargetAtTime(0,tt,.005);x.s.stop(tt+.05);}catch(e){}}
  try{
    const s=ac.createBufferSource();s.buffer=ab;
    const rate=Math.pow(2,(st-base)/12)*(o.rate||1)*(1+(Math.random()*2-1)*f.rj);
    s.playbackRate.value=rate;
    const off=S.off[cle]||0;
    let dep=off;
    if(o.loop){

      s.loop=true;const B0=G.CCSON_BANQUE;dep=(S.t0!=null?S.t0+.0015:(B0&&B0.tete)||.03);
      s.loopStart=dep;s.loopEnd=f.lg?Math.min(ab.duration,dep+f.lg):ab.duration;}
    const g0=dbL(TRIM+f.db+(o.vol||0)+dbC+(Math.random()*2-1)*f.vj);
    const g=ac.createGain();g.gain.value=g0;
    let tete=g;
    if(o.pan&&ac.createStereoPanner){const p=ac.createStereoPanner();p.pan.value=Math.max(-1,Math.min(1,o.pan));g.connect(p);tete=p;}
    s.connect(g);tete.connect(S.bus[o.bus||f.bus]||S.bus.rec);
    s.start(t0,dep);S.der[id]=t0;
    if(!S.salOn&&S.salRet){try{S.salRet.connect(S.dest);}catch(e){}S.salOn=true;}
    const x={s:s,g:g,g0:g0,t0:t0,bus:o.bus||f.bus,cede:!!f.cede,fin:o.loop?1e9:t0+(ab.duration-dep)/rate,
      stop:function(tc){try{const n=ac.currentTime;g.gain.cancelScheduledValues(n);g.gain.setTargetAtTime(0,n,tc||.03);s.stop(n+(tc||.03)*6);S.coupe=Math.max(S.coupe||0,n+(tc||.03)*6);}catch(e){}x.fin=0;},
      gain:function(db,tc){try{g.gain.setTargetAtTime(dbL(TRIM+f.db+db),ac.currentTime,tc||.05);}catch(e){}},
      rate:function(r,tc){try{s.playbackRate.setTargetAtTime(r,ac.currentTime,tc||.05);}catch(e){}}};
    L.push(x);if(f.grp&&S.grp[f.grp]){const V=S.grp[f.grp].voix;V.push(x);if(V.length>32)V.shift();}
    return x;
  }catch(e){return null;}
}
function ton(n){S.ton=+n||0;}




function stopJeu(){if(!S.ac)return;const n=S.ac.currentTime;for(const k in S.voix)for(const x of S.voix[k]){if(x.bus==='ui'||x.fin===1e9||!(x.fin>n))continue;x.stop(.02);}}
function annuleFutur(apres){if(!S.ac)return;const n=S.ac.currentTime+(apres||0);for(const k in S.voix)for(const x of S.voix[k])if(x.t0>n&&x.fin>0){try{x.s.stop();}catch(e){}x.fin=0;}}
function stop(id){const now=S.ac?S.ac.currentTime:0;S.coupe=Math.max(S.coupe||0,now+.08);for(const k in S.voix){if(id&&k!==id)continue;for(const x of S.voix[k]){try{x.g.gain.setTargetAtTime(0,now,.01);x.s.stop(now+.08);}catch(e){}}S.voix[k]=[];}}
function liste(){const o={},M=S.m||(G.CCSON_BANQUE&&G.CCSON_BANQUE.m)||{};for(const id in M){const f=M[id];(o[f.fam]||(o[f.fam]=[])).push({id:id,dit:f.dit});}return o;}
G.CCSON={charge:charge,init:init,play:play,ton:ton,stop:stop,liste:liste,annuleFutur:annuleFutur,stopJeu:stopJeu,
  bus:function(k){return S.bus[k]||null;},
  existe:function(id){return !!(S.m&&S.m[id]);},
  etat:function(){let oct=0,n=0;for(const k in S.buf){const b=S.buf[k];if(b){n++;oct+=b.length*b.numberOfChannels*4;}}
    return{ok:S.ok,ton:S.ton,decodes:S.nDec,total:S.nTot,salle:!!S.salOn,residents:n,mo:Math.round(oct/104857.6)/10,tardifs:S.tard,perdus:S.perdus,evinces:S.evinces,enAttente:Object.keys(S.att).length};},

  attaques:function(){const v=Object.keys(S.off).map(function(k){return Math.round(S.off[k]*1000);}).sort(function(a,b){return a-b;});
    return {etalon:S.t0==null?null:Math.round(S.t0*10000)/10,n:v.length,min:v[0],med:v[v.length>>1],max:v[v.length-1],hors:Object.keys(S.off).filter(function(k){return S.off[k]<.02||S.off[k]>.07;})};}};



try{if(!G.CC_COLONNE){if(typeof requestIdleCallback==='function')requestIdleCallback(charge,{timeout:1500});else setTimeout(charge,300);}}catch(e){}
})(typeof window!=='undefined'?window:globalThis);
