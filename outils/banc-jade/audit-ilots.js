(async function(){
  /* LA SONDE DES ÎLOTS DE JADE (2026-11-24, Sacha : « des bugs d'îlots générés trop proches de la route dans Jade ») — lecture seule, à passer en --auditfile au banc des maps :
       node outils/banc-maps/banc.cjs gen --carte=jade --meteo=midi --graines=1,2,3 --port=… --cdp=… --profil=… --auditfile=outils/banc-jade/audit-ilots.js --out=<hors dépôt> [--tel=1] [--q=sans=jadedegage]
     La roche contre la chaussée, dans le repère de la dalle (modèle : les disques des couches de chaque gabarit, erreur de l'ordre du mètre) :
       · couloir : l'écart au bord (m) de chaque montagne aux hauteurs de conduite 0,3 / 2 / 4 / 7 m ;
       · saut    : aux hauteurs du saut nitro 8 et 12 m (le vol proche) ;
       · vol     : à 10 / 15 / 20 / 30 / 40 m ;
       · '<N' = [montagnes, rochers] à moins de N m du bord ; `hors` : les mêmes sans les roches VOULUES contre la route (q.ori : ile-av, tour-clr, pic) ;
       · sauts   : un saut nitro lancé tous les 40 m à la croisière (court : 21 ; allongé : 21 + 19, comme veqSaut), joué jusqu'à sa pose ou 2,4 s, dans les VRAIS cubes
                   (dbgJadeCube, la caisse = 5 points comme jadeHeurt) : combien de sauts finissent dans la roche, et dans laquelle (origine) ;
       · empRoute : l'empreinte de la ROUTE (pts au mm, NP, L) ; empVallee : dbgJadeEmpreinte() (le décor bâti).
     LE PALIER (2026-11-24, contrôle du lot : « la mesure du vol ne vaut qu'au palier 0 ») : --q=sondepalier=20 (ajouter &sans=… après) rebâtit la vallée de la même graine
     au palier moteur 20 avant de mesurer (dbgTrace({palier}), comme à un portail : route plus longue, croisière plus vite), puis attend que le compte des montagnes
     ne bouge plus. `palier` et `trace` dans la sortie ; sans le paramètre, la vallée du départ (palier 0), comme avant.
     ⚠ `sauts` est un vol balistique TOUT DROIT à la croisière du palier, sans manche ni réacteur : en jeu le joueur braque en l'air et le réacteur fait planer.
       C'est donc un majorant, bon pour comparer deux versions, pas un taux de morts en partie. */
  const PAL=(/[?&]sondepalier=(\d+)/.exec(location.search)||[])[1];let trace=null;
  if(PAL!=null&&window.dbgTrace){const t=dbgTrace({palier:+PAL});trace={palier:+PAL,L:t.L,eng:t.eng,vPal:t.vPal,rMin:t.rMin};
    for(let n0=-1,stable=0,k=0;k<40&&stable<4;k++){await new Promise(function(r){setTimeout(r,250);});const j=dbgJadePil(),n=j&&j.P?j.P.length:-1;if(n===n0&&n>0)stable++;else stable=0;n0=n;}}
  const R=dbgRoute(),J=dbgJadePil();if(!J||!R)return 'pas de jade';
  const pts=R.pts,T=R.T,B=R.B,Nn=R.Nn,NP=R.NP,L=R.L,demi=R.demi,ds=L/(NP-1),VX=J.VX,o={palier:trace?trace.palier:0,trace:trace,ds:+ds.toFixed(2),NP:NP,L:Math.round(L),demi:demi,VX:VX,pil:J.P.length,n3:J.n3,posees:J.posees,rase:J.rase,v3:J.v3};
  {let h=0x811c9dc5;const mi=function(x){h=Math.imul(h^(x|0),16777619);};mi(NP);mi(Math.round(L*1000));for(let i=0;i<NP;i++){mi(Math.round(pts[i].x*1000));mi(Math.round(pts[i].y*1000));mi(Math.round(pts[i].z*1000));mi(Math.round(Nn[i].x*1e5));mi(Math.round(Nn[i].y*1e5));mi(Math.round(Nn[i].z*1e5));}o.empRoute=(h>>>0).toString(16);}
  try{const e=dbgJadeEmpreinte();o.empVallee=e&&e.h;}catch(e){}
  try{const a=dbgJadeAudit();o.audit={couloir:a.couloir,frole:a.frole,temoin:a.temoin,deco:a.deco,mods:a.mods};}catch(e){o.audit=String(e);}
  try{const a=dbgJadeA();o.a3={famille:a.famille,scenes:a.scenes||a.noms||null,poses3:a.poses3};}catch(e){}
  try{const a=window.dbgJadeAv&&dbgJadeAv();if(a&&a.poses){o.avPoses={n:a.poses.length,ok:a.poses.filter(function(p){return p.ok;}).length,par:{}};for(const p of a.poses){const k=(p.anc||'libre');const e=o.avPoses.par[k]||(o.avPoses.par[k]=[0,0]);e[1]++;if(p.ok)e[0]++;}o.avRefus=a.poses.filter(function(p){return !p.ok;}).map(function(p){return [p.anc,p.r,String(p.why).slice(0,60)];}).slice(0,12);}}catch(e){o.avPoses=String(e);}
  try{const p=window.dbgJadePics&&dbgJadePics();if(p)o.pics={on:p.on,tombent:p.tombent,refusees:p.refusees,poseMs:p.poseMs,surRoute:p.surRoute,ex:p.ex};}catch(e){o.pics=String(e);}
  const K=80,gr=new Map(),st=Math.max(1,Math.round(2/ds));
  for(let i=Math.round(40/ds);i<NP;i+=st){const p=pts[i],k=Math.floor(p.x/K)*100003+Math.floor(p.z/K);let a=gr.get(k);if(!a)gr.set(k,a=[]);a.push(i);}
  const rows=new Map();
  const rowsDe=function(t){let m=rows.get(t);if(m)return m;const T9=J.tpl[t];m=[];if(T9&&T9.ly)for(const l of T9.ly){for(let y=l[0];y<l[1];y++){(m[y]||(m[y]=[])).push([l[2],l[3],l[4]]);if(l[6])for(const e of l[6])m[y].push(e);}}rows.set(t,m);return m;};
  const HC=[.3,2,4,7],HM=[8,12],HV=[10,15,20,30,40],E=20,res=[];
  for(let k=0;k<J.P.length;k++){const q=J.P[k],x0=q[0],z0=q[1],r=q[2],pied=q[3],som=q[4],t=q[5],rot=q[6],inv=q[7],sc=q[9]||1,vx=VX*sc,m=rowsDe(t);if(!m.length)continue;
    const a=-rot*Math.PI/2,c=Math.round(Math.cos(a)),s=Math.round(Math.sin(a));
    const dans=function(x,y,z){if(inv){y=pied+som-y;z=2*z0-z;}const row=Math.floor((y-pied)/vx),D=m[row];if(!D)return false;const lx=(x-x0)/vx,lz=(z-z0)/vx,gx=lx*c+lz*s,gz=-lx*s+lz*c;for(const d of D){const ex=gx-d[0],ez=gz-d[1];if(ex*ex+ez*ez<=d[2]*d[2])return true;}return false;};
    let eC=1e9,sC=0,hC=0,eM=1e9,sM=0,hM=0,eV=1e9,sV=0,hV=0;const R9=r+demi+E+10,nb=Math.ceil(R9/K),bx=Math.floor(x0/K),bz=Math.floor(z0/K);
    for(let dx=-nb;dx<=nb;dx++)for(let dz=-nb;dz<=nb;dz++){const A=gr.get((bx+dx)*100003+(bz+dz));if(!A)continue;
      for(const i of A){const p=pts[i];if(p.y<pied-45||p.y>som+10)continue;const ex=x0-p.x,ez=z0-p.z;if(ex*ex+ez*ez>R9*R9)continue;const b=B[i],n=Nn[i],tt=T[i];
        const lo=ex*tt.x+ez*tt.z;if(lo>r+3||lo<-r-3)continue;
        const la0=ex*b.x+ez*b.z,f0=Math.max(-demi-E,Math.floor(la0-r-2)),f1=Math.min(demi+E,Math.ceil(la0+r+2));
        for(let f=f0;f<=f1;f+=1){const e=Math.abs(f)-demi;
          if(e<eC)for(const h of HC){if(dans(p.x+b.x*f+n.x*h,p.y+b.y*f+n.y*h,p.z+b.z*f+n.z*h)){eC=e;sC=i*ds;hC=h;break;}}
          if(e<eM)for(const h of HM){if(dans(p.x+b.x*f+n.x*h,p.y+b.y*f+n.y*h,p.z+b.z*f+n.z*h)){eM=e;sM=i*ds;hM=h;break;}}
          if(e<eV)for(const h of HV){if(dans(p.x+b.x*f+n.x*h,p.y+b.y*f+n.y*h,p.z+b.z*f+n.z*h)){eV=e;sV=i*ds;hV=h;break;}}}}}
    if(eC<=E||eM<=E||eV<=E){const T9=J.tpl[t]||{};res.push({k:k,roc:J.roc[k],ori:q[10]||(J.roc[k]?'rocher':'hasard'),eC:eC>1e8?null:eC,sC:Math.round(sC),hC:hC,eM:eM>1e8?null:eM,sM:Math.round(sM),hM:hM,eV:eV>1e8?null:eV,sV:Math.round(sV),hV:hV,r:Math.round(r),pied:Math.round(pied),som:Math.round(som),t:t,fam:T9.fam,inv:inv,dR:q[8],sc:sc});}}
  const VOULU={'ile-av':1,'tour-clr':1,'pic':1};
  const cpt=function(key,N,roc,hors){return res.filter(function(e){return e[key]!=null&&e[key]<N&&(roc==null||e.roc===roc)&&(!hors||!VOULU[e.ori]);}).length;};
  o.couloir={};o.saut={};o.vol={};o.hors={couloir:{},saut:{},vol:{}};
  for(const N of [-1,0,1,3,6,8,10,15]){const k='<'+N,n=N+1e-9;o.couloir[k]=[cpt('eC',n,0),cpt('eC',n,1)];o.saut[k]=[cpt('eM',n,0),cpt('eM',n,1)];o.vol[k]=[cpt('eV',n,0),cpt('eV',n,1)];
    o.hors.couloir[k]=cpt('eC',n,null,1);o.hors.saut[k]=cpt('eM',n,null,1);o.hors.vol[k]=cpt('eV',n,null,1);}
  const parO=function(key,N){const m={};for(const e of res){if(e[key]==null||e[key]>=N)continue;m[e.ori]=(m[e.ori]||0)+1;}return m;};
  o.parOrigine={couloir10:parO('eC',10),saut10:parO('eM',10),saut0:parO('eM',1e-9),vol0_20:(function(){const m={};for(const e of res){if(e.eV==null||e.eV>=0||e.hV>20)continue;m[e.ori]=(m[e.ori]||0)+1;}return m;})()};
  o.minCouloirHors=(function(){let m=null;for(const e of res)if(e.eC!=null&&!VOULU[e.ori]&&(m==null||e.eC<m.eC))m=e;return m&&{e:m.eC,s:m.sC,h:m.hC,ori:m.ori,r:m.r};})();
  o.minSautHors=(function(){let m=null;for(const e of res)if(e.eM!=null&&!VOULU[e.ori]&&(m==null||e.eM<m.eM))m=e;return m&&{e:m.eM,s:m.sM,h:m.hM,ori:m.ori,r:m.r};})();
  o.piresCouloir=res.filter(function(e){return e.eC!=null;}).sort(function(a,b){return a.eC-b.eC;}).slice(0,12);
  o.piresSaut=res.filter(function(e){return e.eM!=null;}).sort(function(a,b){return a.eM-b.eM;}).slice(0,12);
  /* LES SAUTS : le vrai danger (la roche ne tue qu'en vol) */
  if(window.dbgJadeCube){const vc=(o.a3&&dbgJadeA().vP)||78,g=23,h=1/30,JH=[[0,0],[1.4,0],[-1.4,0],[0,1.4],[0,-1.4]],pas=Math.max(1,Math.round(40/ds)),fen=Math.round(500/ds),S={pas:40,vc:vc};
    for(const im of [['court',21*.48],['allonge',40*.48]]){let n=0,morts=0,poses=0;const par={},ex=[];
      for(let i0=Math.round(120/ds);i0<NP-Math.round(300/ds);i0+=pas){const Nl=Nn[i0];if(Nl.y<.3)continue; /* pas de saut sous la dalle ni sur le mur */n++;
        let px=pts[i0].x+Nl.x,py=pts[i0].y+Nl.y,pz=pts[i0].z+Nl.z,vx=T[i0].x*vc+Nl.x*im[1],vy=T[i0].y*vc+Nl.y*im[1],vz=T[i0].z*vc+Nl.z*im[1],fin=0;
        for(let t=h;t<2.4&&!fin;t+=h){vx-=Nl.x*g*h;vy-=Nl.y*g*h;vz-=Nl.z*g*h;px+=vx*h;py+=vy*h;pz+=vz*h;
          for(const d of JH){const k=dbgJadeCube(px+d[0],py,pz+d[1]);if(k>=0){fin=2;const q=J.P[k],or=q[10]||(J.roc[k]?'rocher':'hasard');par[or]=(par[or]||0)+1;if(ex.length<10)ex.push({s:Math.round(i0*ds),t:+t.toFixed(2),ori:or,k:k});break;}}
          if(fin)break;
          if(t>.4){let bj=-1,bd=1e18;for(let j=i0;j<=Math.min(NP-1,i0+fen);j+=4){const ex9=px-pts[j].x,ey9=py-pts[j].y,ez9=pz-pts[j].z,d=ex9*ex9+ey9*ey9+ez9*ez9;if(d<bd){bd=d;bj=j;}}
            if(bj>=0){const ex9=px-pts[bj].x,ey9=py-pts[bj].y,ez9=pz-pts[bj].z,la=ex9*B[bj].x+ey9*B[bj].y+ez9*B[bj].z,hh=ex9*Nn[bj].x+ey9*Nn[bj].y+ez9*Nn[bj].z;if(Math.abs(la)<demi&&hh<1.5)fin=1;}}}
        if(fin===2)morts++;else if(fin===1)poses++;}
      S[im[0]]={n:n,poses:poses,roche:morts,par:par,ex:ex};}
    o.sauts=S;}
  return o;
})()
