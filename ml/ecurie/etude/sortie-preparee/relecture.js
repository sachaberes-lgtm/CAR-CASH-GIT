#!/usr/bin/env node
/* ===== LA RELECTURE ADVERSE DES DECOLLAGES (28/11/2026, etude « sortie preparee », le relecteur) =====
   Refait les tableaux b, c et e SANS reprendre le code d'analyser.js : les vols sont tires des EVENEMENTS DU JEU (decol, pose, mort de
   l'enregistreur, code/moteur/enregistreur-jeu.js) et non des trous entre les vues. Pour chaque decollage : la derniere vue au sol AVANT lui et
   APRES la pose precedente (sinon : pas de vue au sol, un rebond pris entre deux vues), le vol jusqu'a la pose ou la mort suivante, sa duree et
   sa hauteur (champs de l'evenement pose), la chaine (pose precedente a moins de 0,5 s), le vol voulu (raccourci engage a la derniere vue au sol,
   ou D.vo a la premiere vue en vol). Ecrit sorties/relecture.txt et sorties/relecture.json. Aucune course n'est jouee.
   usage : node relecture.js */
'use strict';
const fs=require('fs'),path=require('path'),zlib=require('zlib');
const ICI=__dirname,LIG=path.join(ICI,'sorties','lignes'),SORT=path.join(ICI,'sorties');
const DECOR={canyon:1,grotte:1,jade:1,ville:1};
const SORTIE_T=.7,SORTIE_JAUGE=.5,TENIR=.35;

/* categories (memes lettres qu'analyser.js, recodees ici) */
function cat(r){if(!r)return '-';
  switch(r.i){case 'pose':return r.p===1&&!r.d?'P':'p';case 'levre':return 'L';case 'portail':return 'T';case 'choc':return 'C';
    case 'air':case 'fond':return 'A';case 'libre':case 'coupe':return 'F';default:return '?';}}
const sauf=c=>c==='P'||c==='p'||c==='L'||c==='T';
const R_=(L,m)=>Array.isArray(L)?L.find(x=>x&&x.m===m)||null:null;
const q=(a,p)=>{const b=a.slice().sort((x,y)=>x-y);if(!b.length)return null;const i=(b.length-1)*p,lo=Math.floor(i),hi=Math.ceil(i);return +(b[lo]+(b[hi]-b[lo])*(i-lo)).toFixed(3);};
const inc=(o,k)=>{o[k]=(o[k]||0)+1;};

function lire(){const C=[];
  for(const n of fs.readdirSync(LIG).filter(x=>/\.jsonl\.gz$/.test(x)).sort()){
    const L=zlib.gunzipSync(fs.readFileSync(path.join(LIG,n))).toString().trim().split('\n').map(x=>JSON.parse(x));
    C.push({nom:n.replace(/\.jsonl\.gz$/,''),h:L[0],V:L.slice(1).filter(v=>!v.erreurDiag)});}
  return C;}

function decollagesDe(c){
  const ev=(c.h.ev||[]).filter(e=>e[1]==='decol'||e[1]==='pose'||e[1]==='mort'),V=c.V,D=[];
  let tPose=-9;
  for(let i=0;i<ev.length;i++){const e=ev[i];
    if(e[1]==='pose'){tPose=e[0];continue;}
    if(e[1]!=='decol')continue;
    const fin=ev.slice(i+1).find(x=>x[1]==='pose'||x[1]==='mort')||null;
    const td=e[0];
    /* la derniere vue au sol avant le decollage, et apres la pose precedente */
    /* (une vue a l'image meme du decollage est deja en vol : on la saute) */
    let S=null,iS=-1;for(let k=V.length-1;k>=0;k--){if(V[k].t<=td+1e-9){if(V[k].mo==='v'&&Math.abs(V[k].t-td)<1e-6)continue;if(V[k].mo==='s'&&V[k].t>tPose+1e-9){S=V[k];iS=k;}break;}}
    const tf=fin?fin[0]:td+999;
    const VV=V.filter(v=>v.mo==='v'&&v.t>td&&v.t<=tf+.05);
    const voulu=!!(S&&S.D&&S.D.so)||!!(VV[0]&&VV[0].D&&VV[0].D.vo);
    const facons=[...new Set(VV.map(v=>v.D&&v.D.f).filter(Boolean))];
    const bascule=facons.length>1||(facons[0]&&facons[0]!=='versRoute'&&!voulu);
    /* l'annonce du bord la plus ancienne et contigue avant le decollage */
    let tPrem=null;if(iS>=0)for(let k=iS;k>=0&&V[k].mo==='s'&&td-V[k].t<=2;k--){if(V[k].tn&&V[k].tn.ti===false)tPrem=+(td-V[k].t).toFixed(2);else break;}
    const B=S&&S.B&&Array.isArray(S.B.R)?S.B.R:null;
    const o={course:c.nom,carte:S?S.c:(VV[0]?VV[0].c:null),td,dt:fin?+(fin[0]-td).toFixed(2):null,fin:fin?fin[1]:'tmax',cause:fin&&fin[1]==='mort'?fin[2]:null,
      hMax:fin&&fin[1]==='pose'?fin[6]:null,chaine:+(td-tPose).toFixed(2)<.5,ecartPose:+(td-tPose).toFixed(2),
      S:S?{dt:+(td-S.t).toFixed(3),tnT:S.tn?S.tn.t:null,ti:S.tn?S.tn.ti:null,de:S.de,gl:S.gl,rb:S.rb,jauge:+((S.n||0)+(S.r||0)).toFixed(3),nitro:S.O?!!S.O.nitro:null,so:!!(S.D&&S.D.so)}:null,
      tPrem,voulu,nVues:VV.length,facons,bascule,
      rien:B?cat(R_(B,'rien')):null,versRoute:B?cat(R_(B,'versRoute')):null,plane:B?cat(R_(B,'plane')):null,
      tVR:B&&R_(B,'versRoute')?R_(B,'versRoute').t:null};
    /* en vol : un rayon (n'importe lequel des dix, ou un secours) se posait-il quand la facon tenue ne sauvait pas ? */
    let offre=0,offreLong=0,offreS=0;
    for(const w of VV){const f=w.D&&w.D.f;if(!f||!w.Y)continue;if(sauf(cat(R_(w.Y,f))))continue;
      if(w.Y.some(r=>r&&r.m!==f&&r.m!=='tenu'&&cat(r)==='P'))offre++;
      if(['rien','plane','versRoute','versRoutePlane'].some(m=>m!==f&&cat(R_(w.Y,m))==='P'))offreLong++;
      if((w.YR||[]).some(r=>cat(r)==='P'))offreS++;}
    o.offre=offre;o.offreLong=offreLong;o.offreSecours=offreS;
    D.push(o);}
  return D;}

function garde(d){const S=d.S;return !!(S&&DECOR[d.carte]&&!d.voulu&&!S.so&&S.ti===false&&!S.de&&!S.gl&&!S.rb&&S.tnT!=null&&S.tnT<SORTIE_T&&S.jauge>SORTIE_JAUGE);}
const REGLES={
  R1:d=>garde(d)&&d.rien==='C'&&d.versRoute==='C'&&(d.plane==='P'||d.plane==='L'),
  R2:d=>garde(d)&&d.plane==='P'&&d.versRoute!=='P',
  R3:d=>garde(d)&&(d.plane==='P'||d.plane==='p')&&d.versRoute==='C',
  R5:d=>garde(d)&&d.S.nitro===false,
  /* la proposition du relecteur (voir LISEZ-MOI, Relecture) : la garde, et versRoute du bord annonce un choc */
  P1:d=>garde(d)&&d.versRoute==='C'
};

function main(){
  const C=lire(),L=[],P=s=>L.push(s);let survie=0;
  const tous=[];for(const c of C){survie+=c.h.survie_s;tous.push(...decollagesDe(c));}
  const n180=survie/180;
  P('RELECTURE (vols tires des evenements du jeu) : '+C.length+' courses, '+(survie/60).toFixed(1)+' min, '+tous.length+' decollages (evenements)');
  const sansS=tous.filter(d=>!d.S),voulus=tous.filter(d=>d.voulu),subis=tous.filter(d=>!d.voulu);
  P('  sans vue au sol entre la pose precedente et le decollage : '+sansS.length+' (dont mortels '+sansS.filter(d=>d.fin==='mort').length+')');
  P('  voulus '+voulus.length+' (morts '+voulus.filter(d=>d.fin==='mort').length+'), subis '+subis.length+' (morts '+subis.filter(d=>d.fin==='mort').length+')');
  P('  morts dans les evenements : '+C.reduce((a,c)=>a+(c.h.ev||[]).filter(e=>e[1]==='mort').length,0));
  const ch=subis.filter(d=>d.chaine);
  P('  subis en CHAINE (pose precedente a moins de 0,5 s) : '+ch.length+' (morts '+ch.filter(d=>d.fin==='mort').length+')');
  const courts=subis.filter(d=>d.fin==='pose'&&(d.dt<.5||d.hMax<3));
  P('  subis poses courts (moins de 0,5 s ou moins de 3 m de haut) : '+courts.length+' sur '+subis.filter(d=>d.fin==='pose').length+' poses');
  P('  ecart derniere vue au sol -> decollage (s), quantiles 50/90/max : '+[.5,.9,1].map(p=>q(subis.filter(d=>d.S).map(d=>d.S.dt),p)).join(' / '));
  P('  tn.t a cette vue, quantiles 10/50/90 : '+[.1,.5,.9].map(p=>q(subis.filter(d=>d.S&&d.S.tnT!=null).map(d=>d.S.tnT),p)).join(' / ')+' ; tient encore (ti vrai) a la derniere vue : '+subis.filter(d=>d.S&&d.S.ti!==false).length);
  P('  premiere annonce contigue du bord avant le decollage (s), quantiles 10/50/90 : '+[.1,.5,.9].map(p=>q(subis.filter(d=>d.tPrem!=null).map(d=>d.tPrem),p)).join(' / '));
  P('');
  /* ---- a ---- */
  P('== a. subis par carte (morts, causes, duree du vol mortel) ==');
  const pc={};for(const d of subis){const o=pc[d.carte]||(pc[d.carte]={n:0,m:0,c:{},dt:[]});o.n++;if(d.fin==='mort'){o.m++;inc(o.c,d.cause);o.dt.push(d.dt);}}
  for(const k of Object.keys(pc).sort())P('  '+String(k).padEnd(8)+String(pc[k].n).padStart(4)+'  morts '+pc[k].m+'  '+JSON.stringify(pc[k].c)+'  mediane '+q(pc[k].dt,.5));
  P('');
  /* ---- b ---- */
  const tab=(titre,liste)=>{const o={};for(const d of liste){const k=d.versRoute;if(!k)continue;o[k]=o[k]||{n:0,pose:0,mort:0,tmax:0};o[k].n++;o[k][d.fin]++;}
    P('  '+titre);for(const k of Object.keys(o).sort())P('    '+k+' : '+o[k].n+' vols, poses '+o[k].pose+', morts '+o[k].mort+(o[k].tmax?', tmax '+o[k].tmax:''));return o;};
  P('== b. versRoute du bord a la derniere vue au sol (subis) contre l\'issue ==');
  const b1=tab('b1. tous les subis avec rayons',subis.filter(d=>d.versRoute));
  const b2=tab('b2. sans bascule',subis.filter(d=>d.versRoute&&!d.bascule));
  const b3=tab('b3. hors chaine, hors vol court',subis.filter(d=>d.versRoute&&!d.chaine&&!(d.fin==='pose'&&(d.dt<.5||d.hMax<3))));
  const b4=tab('b4. vols d\'au moins 0,5 s (poses ou morts)',subis.filter(d=>d.versRoute&&d.dt!=null&&d.dt>=.5));
  P('');
  /* ---- c ---- */
  P('== c. subis mortels : rien / versRoute / plane du bord ==');
  const mort=subis.filter(d=>d.fin==='mort'),pose=subis.filter(d=>d.fin==='pose');
  const cm={},cp={};for(const d of mort)inc(cm,d.rien+d.versRoute+d.plane);for(const d of pose)inc(cp,d.rien+d.versRoute+d.plane);
  for(const k of Object.keys(cm).sort((a,b)=>cm[b]-cm[a]))P('  '+k+' : mortels '+cm[k]+', poses '+(cp[k]||0));
  P('  mortels ou rien ou plane du bord sauve : '+mort.filter(d=>sauf(d.rien)||sauf(d.plane)).length+' ; ou versRoute sauve : '+mort.filter(d=>sauf(d.versRoute)).length);
  P('  mortels en chaine : '+mort.filter(d=>d.chaine).length+' ; mortels sans vue au sol : '+mort.filter(d=>!d.S).length);
  P('  mortels ou, en vol, un des dix rayons se pose propre quand la facon tenue ne sauve pas : '+mort.filter(d=>d.offre>0).length+' (un rayon long : '+mort.filter(d=>d.offreLong>0).length+', un secours S0-S2 : '+mort.filter(d=>d.offreSecours>0).length+')');
  P('  la meme chose dans les poses (fausses alertes possibles) : '+pose.filter(d=>d.offre>0).length+' / '+pose.filter(d=>d.offreLong>0).length+' / '+pose.filter(d=>d.offreSecours>0).length);
  P('  duree des vols mortels (s), quantiles 10/50/90 : '+[.1,.5,.9].map(p=>q(mort.map(d=>d.dt),p)).join(' / ')+' ; moins de 0,3 s : '+mort.filter(d=>d.dt<.3).length);
  P('  liste des mortels : ');
  for(const d of mort)P('    '+d.course.padEnd(24)+' t '+d.td+'  vol '+d.dt+' s  '+d.cause+'  bord '+(d.rien||'-')+(d.versRoute||'-')+(d.plane||'-')+' (vr t '+d.tVR+')  tn.t '+(d.S?d.S.tnT:'-')+'  jauge '+(d.S?d.S.jauge:'-')+'  chaine '+(d.chaine?d.ecartPose:'non')+'  facons '+d.facons.join('>')+'  garde '+(garde(d)?'oui':'non'));
  P('');
  /* ---- e ---- */
  P('== e. regles a la derniere vue au sol (garde du contrat) ==');
  const g=subis.filter(garde);
  P('  passent la garde : '+g.length+' sur '+subis.filter(d=>DECOR[d.carte]).length+' subis sur decor ; exclus par la jauge seule : '+subis.filter(d=>DECOR[d.carte]&&d.S&&d.S.ti===false&&!d.S.de&&!d.S.gl&&!d.S.rb&&d.S.tnT<SORTIE_T&&!(d.S.jauge>SORTIE_JAUGE)).length);
  const E={};
  for(const k in REGLES){const x=subis.filter(REGLES[k]);E[k]={n:x.length,par180:+(x.length/n180).toFixed(2),mortels:x.filter(d=>d.fin==='mort').length,poses:x.filter(d=>d.fin==='pose').length,
      mortelsHorsChaine:x.filter(d=>d.fin==='mort'&&!d.chaine).length,posesCourtes:x.filter(d=>d.fin==='pose'&&(d.dt<.5||d.hMax<3)).length};
    P('  '+k+' : '+JSON.stringify(E[k]));}
  /* les fausses alertes de P1 : vues au sol sous la garde ou elle partirait et ou la caisse ne decolle pas dans les 0,55 s */
  let vP1=0,fP1=0;for(const c of C){const td=(c.h.ev||[]).filter(e=>e[1]==='decol').map(e=>e[0]);
    for(const s of c.V){if(s.mo!=='s'||!s.tn||s.tn.ti!==false||!DECOR[s.c]||s.de||s.gl||s.rb||s.D&&s.D.so||!(s.tn.t<SORTIE_T)||!((s.n||0)+(s.r||0)>SORTIE_JAUGE))continue;
      if(!(s.B&&cat(R_(s.B.R,'versRoute'))==='C'))continue;vP1++;if(!td.some(t=>t>=s.t&&t-s.t<=.55))fP1++;}}
  P('  P1 : vues au sol ou elle part '+vP1+', sans decollage dans les 0,55 s : '+fP1);
  P('');
  /* ---- l'attribution des morts par analyser.js ---- */
  let ana=null;try{ana=JSON.parse(fs.readFileSync(path.join(SORT,'decollages.json'),'utf8'));}catch(e){}
  if(ana){const am=ana.decollages.filter(f=>!f.voulu&&f.issue.k==='mort');let mal=0;const L2=[];
    for(const f of am){const d=mort.find(x=>x.course===f.course&&Math.abs(x.td-f.t0)<=.15);if(!d){mal++;L2.push(f.course+' t0 '+f.t0+' (vol vu de '+f.issue.dt+' s)');}}
    P('== attribution : morts subies d\'analyser.js dont le t0 n\'est PAS le decollage qui precede la mort (evenements) : '+mal+' sur '+am.length);
    for(const s of L2)P('    '+s);
    const nonVues=mort.filter(d=>!am.some(f=>f.course===d.course&&Math.abs(d.td-f.t0)<=.15));
    P('   decollages mortels (evenements) absents des vols d\'analyser.js : '+nonVues.length+' : '+nonVues.map(d=>d.course+' '+d.td+' ('+d.dt+' s, chaine '+d.ecartPose+')').join(' ; '));}
  P('');
  /* ---- les doublons : une course « sans carte » qui commence par la meme map qu'une course tenue, meme graine, rejoue les memes decollages ---- */
  const cles=new Map();let ndup=0;
  for(const c of C)for(const e of (c.h.ev||[]).filter(e=>e[1]==='decol')){const d=tous.find(x=>x.course===c.nom&&x.td===e[0]);if(!d)continue;
    const k=c.h.graine+'|'+JSON.stringify(e)+'|'+d.dt;if(cles.has(k)){d.double=cles.get(k);ndup++;}else cles.set(k,c.nom);}
  const U=subis.filter(d=>!d.double),Um=U.filter(d=>d.fin==='mort');
  P('== doublons : '+ndup+' decollages rejoues a l\'identique (meme graine, meme evenement, meme vol) par une course sans carte ; subis distincts '+U.length+', mortels distincts '+Um.length);
  const cmU={};for(const d of Um)inc(cmU,(d.rien||'-')+(d.versRoute||'-')+(d.plane||'-'));P('  combinaisons des mortels distincts : '+JSON.stringify(cmU));
  /* les rayons du bord aux vues PLUS ANCIENNES (jusqu'a 1 s) des mortels distincts : une issue y etait-elle annoncee ? */
  let tot=0;const ann=[];for(const d of Um){const c=C.find(x=>x.nom===d.course);const S=c.V.filter(v=>v.mo==='s'&&v.t<d.td&&d.td-v.t<=1&&v.B&&Array.isArray(v.B.R));
    const ok=S.filter(v=>['rien','plane'].some(m=>sauf(cat(R_(v.B.R,m)))));if(ok.length){tot++;ann.push(d.course+' '+d.td+' : '+ok.map(v=>(d.td-v.t).toFixed(2)+' s '+v.B.R.map(r=>cat(r)).join('')).join(', '));}}
  P('  mortels distincts dont une vue plus ancienne (1 s) annoncait rien ou plane sauf : '+tot+(ann.length?' ('+ann.join(' ; ')+')':''));
  /* sous la garde, distincts : la nitro (versRoutePlane) contre versRoute au radar de la PREMIERE vue en vol ; et plane contre versRoute au bord */
  const GU=U.filter(garde),t1={},t2={};
  for(const d of GU){const c=C.find(x=>x.nom===d.course),w=c.V.find(v=>v.mo==='v'&&v.t>d.td);
    inc(t1,d.fin+' bord vR'+(sauf(d.versRoute)?'+':'-')+' plane'+(sauf(d.plane)?'+':'-'));
    if(w&&w.Y)inc(t2,d.fin+' vol vR'+(sauf(cat(R_(w.Y,'versRoute')))?'+':'-')+' vRP'+(sauf(cat(R_(w.Y,'versRoutePlane')))?'+':'-'));else inc(t2,d.fin+' sans radar');}
  P('  sous la garde (distincts '+GU.length+', mortels '+GU.filter(d=>d.fin==='mort').length+') : au bord '+JSON.stringify(t1));
  P('     a la premiere vue en vol : '+JSON.stringify(t2));
  for(const k of ['R5','P1']){const x=U.filter(REGLES[k]);const t3={};
    for(const d of x){const c=C.find(y=>y.nom===d.course),w=c.V.find(v=>v.mo==='v'&&v.t>d.td);if(w&&w.Y)inc(t3,d.fin+' vR'+(sauf(cat(R_(w.Y,'versRoute')))?'+':'-')+' vRP'+(sauf(cat(R_(w.Y,'versRoutePlane')))?'+':'-'));}
    P('  '+k+' (distincts) : '+x.length+' ('+(x.length/n180).toFixed(2)+' par 180 s), mortels '+x.filter(d=>d.fin==='mort').length+', poses '+x.filter(d=>d.fin==='pose').length+' ; premiere vue en vol : '+JSON.stringify(t3));}
  P('');
  /* ---- f. rienOn, refait comme modele.js § 3.2 : la vue sans radar ou ou la regle est fausse efface rienVu ---- */
  P('== f. rienOn (simulation fidele : deux vues CONSECUTIVES vraies, une fois par vol ; distincts) ==');
  const seuils=[.05,.1,.15,.2,.3,.4],decl={},vues={};let nEcarts=[];
  for(const c of C){let rv={},fa={};const doublon=c.nom.indexOf('libre')===0&&['libre-3970400','libre-3970585','libre-3970659'].indexOf(c.nom)>=0;
    for(const w of c.V){if(w.mo!=='v'){rv={};fa={};continue;}
      const D=w.D||{},f=D.f;
      for(const s of seuils){
        if(!w.Y||!f){rv[s]=null;continue;}
        if(!(f!=='rien'&&(f.indexOf('versRoute')===0||f.indexOf('retour')===0)&&w.t-D.tf>TENIR)){rv[s]=null;continue;}
        const qq=R_(w.Y,f),r0=R_(w.Y,'rien');
        const ok=!fa[s]&&!!qq&&qq.i==='pose'&&!!r0&&r0.i==='pose'&&r0.p===1&&!r0.d&&Math.abs(+r0.a||0)+s<=Math.abs(+qq.a||0)+1e-9;
        if(s===.1&&qq&&qq.i==='pose'&&r0&&r0.i==='pose'&&r0.p===1&&!r0.d&&!doublon)nEcarts.push(Math.abs(+qq.a||0)-Math.abs(+r0.a||0));
        if(ok&&!doublon)inc(vues,s);
        if(ok&&rv[s]!=null&&w.t-rv[s]<=.25){fa[s]=1;rv[s]=null;if(!doublon)inc(decl,s);}else rv[s]=ok?w.t:null;}}}
  P('  vues sous la garde ou « rien » se pose propre dessus et la facon tenue se pose : '+nEcarts.length+' ; ecart quantiles 5/25/50/75/95 : '+[.05,.25,.5,.75,.95].map(p=>q(nEcarts,p)).join(' / ')+' ; rien plus droit '+nEcarts.filter(e=>e>0).length+', plus tordu '+nEcarts.filter(e=>e<0).length+', egal '+nEcarts.filter(e=>e===0).length);
  const nUs=survie-(C.filter(c=>['libre-3970400','libre-3970585','libre-3970659'].indexOf(c.nom)>=0).reduce((a,c)=>a+c.h.survie_s,0));
  for(const s of seuils)P('  rienEcart '+s+' : vues '+(vues[s]||0)+', la regle partirait '+(decl[s]||0)+' fois ('+((decl[s]||0)/(nUs/180)).toFixed(2)+' par 180 s)');
  P('');
  /* ---- g. loiFidele.suit : la commande des yeux contre FACONS.versRoute ; hors vues ou le pilote lance une figure (l'ordre n'est plus celui de la loi) ---- */
  P('== g. loiFidele.suit ==');
  const dv=[];let nV=0,nFig=0;
  for(const c of C)for(const w of c.V){if(w.mo!=='v'||!w.D||w.D.f!=='versRoute'||!w.ret||!w.ret[0]||!w.O)continue;
    if(w.O.geste!=null){nFig++;continue;}nV++;dv.push(Math.max(Math.abs((+w.ret[0].v||0)-(+w.O.volant||0)),w.ret[0].m!==w.O.manche?9:0));}
  P('  vues en versRoute avec la loi fidele : '+nV+' (plus '+nFig+' vues a geste, ecartees) ; ecart |volant| quantiles 50/75/90 : '+[.5,.75,.9].map(p=>q(dv.filter(x=>x<9),p)).join(' / ')+' ; manche different '+dv.filter(x=>x===9).length);
  for(const s of [0,.005,.01,.02,.05,.1])P('    seuil '+s+' : '+dv.filter(x=>x>s+1e-9).length+' ('+Math.round(100*dv.filter(x=>x>s+1e-9).length/Math.max(1,nV))+' %)');
  fs.writeFileSync(path.join(SORT,'relecture.txt'),L.join('\n')+'\n');
  fs.writeFileSync(path.join(SORT,'relecture.json'),JSON.stringify({survie_s:survie,b:{b1,b2,b3,b4},c:{mortels:cm,poses:cp},e:E,decollages:tous}));
  process.stdout.write(L.join('\n')+'\n');
}
main();
