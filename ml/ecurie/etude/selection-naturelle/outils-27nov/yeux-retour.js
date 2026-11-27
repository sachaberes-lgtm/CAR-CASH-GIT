/* jetable : les yeux gagnent LA LOI « RETOUR », A PARAMETRES (27/11) — yeux.js et piloter.js. Rien ne change pour un cerveau qui ne la demande pas. */
const fs=require('fs'),path=require('path');
const BOT=path.join(__dirname,'..','..','..','bot');
const maj=(f,paires)=>{let s=fs.readFileSync(f,'utf8');const crlf=s.includes('\r\n');if(crlf)s=s.replace(/\r\n/g,'\n');
  for(const [a,b] of paires){if(!s.includes(a))throw new Error(path.basename(f)+' : introuvable « '+a.slice(0,70)+' »');if(s.split(a).length!==2)throw new Error(path.basename(f)+' : plusieurs fois « '+a.slice(0,70)+' »');s=s.replace(a,()=>b);}
  fs.writeFileSync(f,crlf?s.replace(/\n/g,'\r\n'):s);console.log('ecrit '+path.basename(f));};
maj(path.join(BOT,'yeux.js'),[
[`  const BUDGET={vol:2400,sol:1100,demande:2900,route:900,sondes:4400,viser:740};`,
 `  /* (2026-11-27, la loi « retour ») retour : les images de vol que les rayons « retour » peuvent ajouter par eventail (4 lois au plus, 6 s chacune),
     comptees A PART et APRES tous les autres rayons, seulement si le cerveau les demande ; sondes : + ces images-la. */
  const BUDGET={vol:2400,sol:1100,demande:2900,route:900,sondes:5900,viser:740,retour:1460};`],
[`  /* la cible posee sur l'axe de la piste, a l'abscisse sv */`,
 `  /* ===== LA LOI « RETOUR », A PARAMETRES (2026-11-27, Sacha : « fais les bots les plus realistes possible ») =====
     MESURE (ml/ecurie/agents/tmp-voltige/rayons-vol.js, 12 courses du pilote qui vole, 171 vols) :
       · la loi « vers la route » vise l'AXE de la piste par un cap de −lat / 40 m : au bord de la dalle (28 m de l'axe) elle demande encore 0,6 rad,
         et la caisse touche le bord dans cet angle-la — axe annonce 0,46 rad en mediane, glisse reelle apres la pose 0,43 (les joueurs 0,13), une
         pose sur quatre ressort de la route dans les 0,8 s ; l'axe ANNONCE est juste (annonce sous 0,2 rad : glisse reelle 0,10) ;
       · au-dela de 1,6 rad de l'axe elle lache le volant : son rayon dit « air » pour 28 vols qui se posent en fait, et le pilote, croyant la
         facon perdue, part sur un rayon court (« droite » tenu : un tour complet en l'air).
     LA LOI (recalculee toutes les 6 images, comme les autres) : le cap vise ramene vers une LIGNE a « marge » metres en dedans du bord le plus proche
     (−ecart / portee, borne a « cap ») et, une fois en dedans de cette ligne, le long de la route (cap 0) ; le volant tient ce cap par le plus
     court chemin, meme caisse a contresens (pas de zone morte) ; portee = max(porteeMin, portee × la vitesse a plat). Le manche pique comme « vers la
     route » (au-dessus de « pique » metres, si la descente tarde) et cabre sous « cabre » metres quand la caisse est a cote de la dalle. Le reacteur :
     nitro 0 = jamais, 1 = tenu, 2 = tenu tant que la caisse est en dehors de la ligne (et sous « nitroHaut » metres), 3 = tenu sous « nitroHaut ».
     Les parametres viennent du CERVEAU (son ordre porte « retours » : 4 lois au plus ; piloter.js les passe dans la demande de la vue suivante).
     Pour chaque loi : un rayon « retour0 »… « retour3 », APRES tous les autres (ils ne changent pas d'une image), et vue.vol.retours[i] = le volant, le
     manche et la nitro que la loi donne A CET INSTANT — calcules sur l'ecart et l'axe qu'on aura dans « avance » secondes (le retard de la main : le
     rayon, lui, joue la loi sans retard ni avance). Avec « sol », la loi est aussi jouee apres les sorties du sol (bord, gauche, droite). */
  const RET=[],RTC={cn:false};
  const nbr=function(x,d,a,b){x=+x;return x-x===0?cl(x,a,b):d;};
  const lireRetours=function(dem){
    RET.length=0;const Lr=dem&&dem.retours;if(!Array.isArray(Lr))return;
    for(let i=0;i<Lr.length&&RET.length<4;i++){const q=Lr[i];if(!q||typeof q!=='object')continue;
      RET.push({marge:nbr(q.marge,8,-50,200),cap:nbr(q.cap,.6,.05,1.4),portee:nbr(q.portee,0,0,3),porteeMin:nbr(q.porteeMin,40,5,400),nitro:nbr(q.nitro,0,0,3)|0,
        nitroHaut:nbr(q.nitroHaut,1e9,-1e9,1e9),cabre:nbr(q.cabre,-1e9,-1e9,1e9),pique:nbr(q.pique,10,0,1e9),avance:nbr(q.avance,.25,0,1),sol:!!q.sol});}};
  const retour=function(e,P,tau){
    PIL.cv=0;PIL.cm=0;RTC.cn=P.nitro===1;
    const bi=proche(e.px,e.py,e.pz,2,1e9,e.bi);if(bi<0)return;
    const q=gP[bi],n=gN[bi],b=gB[bi],t=gT[bi],dx=e.px-q.x,dy=e.py-q.y,dz=e.pz-q.z,SP=K.SPD;
    const lt=dx*b.x+dy*b.y+dz*b.z,ht=dx*n.x+dy*n.y+dz*n.z;
    const vT=(e.vx*t.x+e.vy*t.y+e.vz*t.z)*SP,vB=(e.vx*b.x+e.vy*b.y+e.vz*b.z)*SP,vR=-(e.vx*n.x+e.vy*n.y+e.vz*n.z)*SP,axe=M.atan2(vB,vT);
    const sg9=(e.ux*n.x+e.uy*n.y+e.uz*n.z)>=0?1:-1;
    let lt2=lt,axe2=axe;
    if(tau>0){lt2=lt+vB*tau;axe2=axe+e.st*lacetV(M.sqrt(e.vx*e.vx+e.vy*e.vy+e.vz*e.vz))*sg9*tau;}
    const bord=M.max(0,K.RH-P.marge),ec=M.abs(lt2)>bord?lt2-(lt2>0?bord:-bord):0,portee=M.max(P.porteeMin,P.portee*M.sqrt(vT*vT+vB*vB));
    let da=cl(-ec/portee,-P.cap,P.cap)-axe2;
    if(da>M.PI)da-=2*M.PI;else if(da<-M.PI)da+=2*M.PI;
    PIL.cv=cl(da*1.6,-1,1)*sg9;
    if(ht>P.pique&&M.abs(lt)<K.RH*2){const delai=ht/M.max(1,vR);if(delai>2||delai>resteAir(e.fTR,e.pwrA,e.stage)-1)PIL.cm=-sg9;}
    else if(ht<P.cabre&&M.abs(lt)>K.RH)PIL.cm=sg9;
    RTC.cn=P.nitro===1||(P.nitro===2&&M.abs(lt)>bord&&ht<P.nitroHaut)||(P.nitro===3&&ht<P.nitroHaut);};
  /* la cible posee sur l'axe de la piste, a l'abscisse sv */`],
[`      if(loi>=3){if((k-1)%6===0){viser(e,loi===4);cv=PIL.cv;cm=PIL.cm;cn=loi===4;}}`,
 `      if(loi>=10){if((k-1)%6===0&&(e.dLow<=60||(k-1)%30===0)){retour(e,RET[loi-10],0);cv=PIL.cv;cm=PIL.cm;cn=RTC.cn;}}   /* (2026-11-27) lois 10 a 13 : la loi « retour » du cerveau */
      else if(loi>=3){if((k-1)%6===0){viser(e,loi===4);cv=PIL.cv;cm=PIL.cm;cn=loi===4;}}`],
[`  /* ---- L'EVENTAIL : depuis l'etat e0,`,
 `  /* les rayons « retour » (un par loi demandee), depuis l'etat e0, ajoutes a out ; sol : seulement les lois qui demandent a etre jouees depuis le sol */
  const rayonsRetour=function(e0,horizon,tFig,out,sol){
    const plaf=COUT.pas+BUDGET.retour,N=M.max(1,M.round(horizon*60));
    for(let i=0;i<RET.length;i++){if(sol&&!RET[i].sol)continue;
      copie(E,e0);rayon(E,10+i,0,0,false,N,plaf,false);out.push(rendre('retour'+i,RET[i].nitro>0,true,tFig));}};
  /* ---- L'EVENTAIL : depuis l'etat e0,`],
[`        f.cible={s:n0(sv),volant:n2(PIL.cv),manche:PIL.cm,pres:CIB.pres,dist:n0(M.sqrt(hx*hx+hz*hz)),chute:n0(E0.py-CIB.y),lat:CIB.pres?null:n1(CIB.lt),haut:CIB.pres?null:n1(CIB.ht),axe:CIB.pres?null:n2(CIB.axe),demandee:!!(dem&&typeof dem.cible==='number')};}`,
 `        f.cible={s:n0(sv),volant:n2(PIL.cv),manche:PIL.cm,pres:CIB.pres,dist:n0(M.sqrt(hx*hx+hz*hz)),chute:n0(E0.py-CIB.y),lat:CIB.pres?null:n1(CIB.lt),haut:CIB.pres?null:n1(CIB.ht),axe:CIB.pres?null:n2(CIB.axe),demandee:!!(dem&&typeof dem.cible==='number')};}
      /* (2026-11-27) LES RAYONS « RETOUR », apres tous les autres, et ce que chaque loi ordonne a cet instant */
      if(RET.length){rayonsRetour(E0,long,tFig,o.rayons,false);
        f.retours=[];for(let i=0;i<RET.length;i++){retour(E0,RET[i],RET[i].avance);f.retours.push({volant:n2(PIL.cv),manche:PIL.cm,nitro:RTC.cn});}}`],
[`      if(bord&&(loi===1||loi===2)&&GS.sd>0){const c9=ciblesDe(ES);for(let i=0;i<c9.length;i++)rayonsViser(ES,c9[i],long9,0,o.rayons);}`,
 `      if(bord&&(loi===1||loi===2)&&GS.sd>0){const c9=ciblesDe(ES);for(let i=0;i<c9.length;i++)rayonsViser(ES,c9[i],long9,0,o.rayons);}
      if(bord&&RET.length)rayonsRetour(ES,long9,0,o.rayons,true);   /* (2026-11-27) les lois « retour » qui demandent le sol */`],
[`    DG=dem&&dem.doigts&&typeof dem.doigts==='object'?dem.doigts:null;`,
 `    DG=dem&&dem.doigts&&typeof dem.doigts==='object'?dem.doigts:null;
    lireRetours(dem);`]]);
maj(path.join(BOT,'piloter.js'),[
[`      if(typeof ordre.cible==='number'&&ordre.cible-ordre.cible===0)dem=Object.assign(dem||{},{cible:ordre.cible});`,
 `      if(typeof ordre.cible==='number'&&ordre.cible-ordre.cible===0)dem=Object.assign(dem||{},{cible:ordre.cible});
      /* (2026-11-27, la loi « retour ») \`retours\` : les lois de retour vers la route que le pilote veut voir jouees (4 au plus, des nombres : yeux.js) —
         a la vue suivante, un rayon « retour<i> » par loi et vue.vol.retours[i] (le volant, le manche et la nitro de la loi a cet instant) */
      if(Array.isArray(ordre.retours)&&ordre.retours.length)dem=Object.assign(dem||{},{retours:ordre.retours.slice(0,4)});`]]);
