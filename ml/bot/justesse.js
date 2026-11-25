#!/usr/bin/env node
/* ===== LA JUSTESSE DU RADAR (2026-11-24, Sacha : « des bots du palier 1 au palier 30 qu'on ne distingue pas de vrais joueurs ») =====
   Le radar des yeux v2 (yeux.js) PREVOIT l'issue d'un vol. Il ne vaut que par son tableau « prevu / arrive » : cet outil le mesure dans le
   VRAI jeu, sur de vraies courses. A relancer apres chaque mise a jour du jeu : c'est aussi le detecteur de derive (une loi du jeu qui
   change sans que la copie des yeux suive se voit ici).
   usage : node justesse.js [--regime allege|max] [--cartes nuages,espace,grotte,ville,jade,canyon] [--graines 3] [--depart 910000]
                            [--tmax 90] [--coeurs 2] [--cerveau fichier.js] [--profil clavier] [--pas] [--requete "&cyw=0"] [--sortie fichier.json]
     --cartes    les maps a mesurer, une par une (imposees) ; « libre » = la graine tire la map et la course enchaine aux portails
     --cerveau   un autre cerveau que le voltigeur : si son ordre en vol porte « facon » (voltigeur-route.js), c'est ce rayon-la qui est juge ;
                 sinon (reference.js…) le rayon « tenu » (les touches telles qu'elles sont)
     --profil    (2026-11-25, relecture) donne au cerveau une main a profil (clavier, doigt, machine : doigts.js, MODELES) — le radar est-il encore
                 juste quand les ordres arrivent en retard et que le volant va par coups ?
     --requete   un morceau de plus dans l'adresse du jeu. « &cyw=0 » : le relief du CANYON calcule sur place — dans ml/reel il part dans un
                 travailleur qui ne repond jamais : sans cela le canyon du simulateur n'a ni paroi, ni riviere, ni mur de couloir
     --pas       LE PAS A PAS : au lieu des issues, les PLACES. A chaque vol, le radar donne les places qu'il prevoit image par image pour les
                 touches tenues ; le jeu joue ; on compare. Un ecart nul = l'integrateur des yeux est celui du jeu.
   resultat : results/justesse[-allege][-pas][-<cerveau>].json + les tableaux a l'ecran. Un processus neuf par course, --coeurs a la fois (2).

   LE VOLTIGEUR (voltigeur.js, le cerveau de mesure) : au sol il tient le milieu ; toutes les 5 s il SORT expres (un saut, puis une sortie
   douce par le bord, puis une sortie franche, volant a fond, un cote puis l'autre) ; a chaque vol il prend UNE facon de piloter — rien,
   gauche, droite, cabre, pique, plane, planeCabre — et la TIENT tout le vol. Il ne lit pas le radar. Son ordre porte « facon » : la trace la garde.

   LE VRAI : les evenements de l'enregistreur du jeu, a l'image pres (decol, pose, mort et sa cause, bump, route = le portail), et le journal
   des poses du jeu (window.__poseJ, le banc des poses de demi-tour.js : le choc, l'ecart, la face).
   LE PREVU : le rayon de la facon tenue, pris (a) a la PREMIERE vue du vol (les doigts n'ont pas encore pose la facon : apres un saut ils
   tiennent encore la NITRO et le manche du geste), (a2) a la premiere vue ou ils la tiennent, (b) a la DERNIERE vue situee au moins 1 s
   avant la fin du vol. LES SORTIES DU SOL que le voltigeur demande (une sortie franche, un saut) sont jugees a part : la sortie prevue
   a-t-elle lieu, quand, et le vol qui suit.
   (2026-11-25, relecture) JUGES AUSSI : la sortie « bord » que les yeux donnent D'OFFICE (rayons rien, versRoute, plane), le rayon « versRoute »
   des sorties a gauche et a droite, le saut dont l'impulsion est connue a part du premier saut de la course ; et LES CONTROLES (mesure.controles,
   lus par verifier.js) : un saut prevu decolle-t-il, un saut dit refuse ne decolle-t-il pas, le decor est-il sonde a chaque image, « latC »
   est-il le « lat » retourne sous la dalle.
   Une prevision est JUSTE si son issue est celle qui arrive (une levre prevue ou arrivee se lit « pose » ; « libre » est juste si rien
   n'arrive avant l'horizon du rayon). Une mort « air » ou « vide » est rangee par la derniere vue : a moins de 15 m du fond → fond, sinon jauge. */
const fs=require('fs'),path=require('path'),{fork}=require('child_process');
const A=process.argv.slice(2),opt=(n,d)=>{const i=A.indexOf('--'+n);return i>=0?A[i+1]:d;};

const VOLT=path.join(__dirname,'voltigeur.js');
const FACONS=['rien','gauche','droite','cabre','pique','plane','planeCabre'];
const CHOCS=['roche','lave','eau','glace','pic','riviere','paroi','canyon','tour','sol','satellite','sable','oasis','monolithe','rocher'];
const med=a=>{if(!a.length)return null;const s=a.slice().sort((x,y)=>x-y);return s[Math.floor((s.length-1)/2)];};
const p90=a=>{if(!a.length)return null;const s=a.slice().sort((x,y)=>x-y);return s[Math.min(s.length-1,Math.floor(s.length*.9))];};
const r2=x=>x==null?null:Math.round(x*100)/100;

const PRINCIPAL=require.main===module;
/* ---------------- la mesure d'une course (dans le processus de la course ; verifier.js appelle aussi mesure) ---------------- */
{
  /* les vols d'une course, a l'image pres : [image du decollage, image de la fin, ce qui arrive] */
  function volsDe(partie){
    const im=e=>Math.round(e[0]*60)-1,out=[];let d=null;
    for(const e of partie.ev||[]){
      if(e[1]==='decol')d={i0:im(e),origine:e[2],s0:e[3],portail:null,bumps:0};
      else if(!d)continue;
      else if(e[1]==='bump')d.bumps++;
      else if(e[1]==='route'&&d.portail==null)d.portail=im(e);
      else if(e[1]==='pose'){out.push(Object.assign(d,d.portail!=null?{i1:d.portail,fin:'portail'}:{i1:im(e),fin:'pose',s:e[2],lat:e[3]}));d=null;}
      else if(e[1]==='mort'){out.push(Object.assign(d,{i1:im(e),fin:'mort',cause:e[2]}));d=null;}}
    return out;}
  function mesure(J,C,m,course,plus){
    /* le journal des poses du jeu (son banc : demi-tour.js y range chaque pose si window.__poseJ existe), date a l'image par l'hote */
    const PJ=J.g.sandbox.__poseJ=[];let nPJ=0;
    const x=course(J,C,m.graine,Object.assign({carte:m.carte||undefined,tmax:m.tmax,trace:true,image:function(J9,fr){while(nPJ<PJ.length)PJ[nPJ++].image=fr;}},plus||{}));
    const b=x.bilan,vues=x.vues;
    const tenu=!!m.fichier&&path.basename(m.fichier)!=='voltigeur.js',vols=[];
    /* ---- LES CONTROLES (2026-11-25, relecture) : des comptes lus dans la trace, pour verifier.js ---- */
    const decols=(x.partie.ev||[]).filter(e=>e[1]==='decol').map(e=>({i:Math.round(e[0]*60)-1,origine:e[2]}));
    const ctl={sauts:{ordres:0,prevus:0,refuses:0,figure:0,decolles:0,prevusSansDecol:[],refusesMaisDecol:[]},cadence:{vues:0,max:0},latC:{objets:0,dessous:0,faux:0}};
    for(const q of vues){const w=q.vue;
      if(q.ordre&&q.ordre.sortie==='saut'&&q.ordre.geste==='saut'&&w.mode==='sol'){
        const S=w.sorties&&w.sorties.saut,prevu=!!(S&&S.rayons),dec=decols.some(d=>d.origine==='saut'&&d.i>q.image&&d.i<=q.image+50),G=ctl.sauts;
        G.ordres++;if(dec)G.decolles++;if(prevu){G.prevus++;if(!dec)G.prevusSansDecol.push(q.image);}
        if(S&&S.issue==='figure')G.figure++;
        if(w.sautRefuse===true){G.refuses++;if(dec)G.refusesMaisDecol.push(q.image);}}
      if(w.mode==='vol'&&w.vol&&w.vol.radar&&w.vol.radar.decor&&w.vol.radar.maille!=null&&w.vitesse>20&&w.vol.radar.decor.indexOf('canyon')<0){
        const c=w.vol.radar.maille*60/w.vitesse;ctl.cadence.vues++;if(c>ctl.cadence.max)ctl.cadence.max=r2(c);}
      if(w.mode==='sol')for(const L of [w.piecesDevant,w.fruits,w.orbes])for(const p of L||[]){ctl.latC.objets++;if(w.dessous)ctl.latC.dessous++;
        if(typeof p.latC!=='number'||Math.abs(p.latC-(w.dessous?-p.lat:p.lat))>.11)ctl.latC.faux++;}}
    for(const V of volsDe(x.partie)){
      /* les vues du vol : celles prises en vol, entre le decollage et la fin */
      const fin=V.i1,vv=vues.filter(q=>q.image>V.i0&&q.image<=fin&&q.vue.mode==='vol'&&q.vue.vol&&q.vue.vol.radar&&q.vue.vol.radar.rayons);
      if(!vv.length)continue;
      const der=vv[vv.length-1].vue,facon=(vv[0].ordre&&vv[0].ordre.facon)||(tenu?'tenu':null); /* (2026-11-25, relecture) la facon que l'ordre porte, quel que soit le cerveau */
      if(!facon)continue;
      /* ce qui arrive */
      let arrive=V.fin,cause=null;
      if(V.fin==='mort'){cause=V.cause;arrive=CHOCS.indexOf(V.cause)>=0?'choc':(V.cause==='air'||V.cause==='vide')?(der.vol.plancher<=15?'fond':'air'):'autre';}
      const pj=V.fin==='pose'?PJ.find(q=>q.image===V.i1):null;
      const o={i0:V.i0,i1:V.i1,origine:V.origine,facon:facon,arrive:arrive,cause:cause,duree:r2((fin-V.i0)/60),bumps:V.bumps,carte:der.carte,decor:der.vol.radar.decor,approx:!!der.vol.radar.approx,
        levre:V.fin==='pose'&&!pj,a:null,a2:null,b:null,s:null,sol:null,bord:null,sb:null};
      /* un rayon contre ce qui arrive ; reel : les secondes entre la vue (ou la sortie) et la fin du vol */
      const juge=function(R,reel,image){
        if(!R)return null;
        const prevu=R.issue==='levre'?'pose':R.issue==='coupe'?'libre':R.issue;
        const j={image:image,avant:r2(reel),issue:R.issue,t:R.t,juste:prevu==='libre'?reel>R.t-.02:prevu===arrive,cause:R.cause||null,bumps:R.bumps||0};
        if(prevu==='pose'&&arrive==='pose'){j.dt=r2(R.t-reel);j.ds=r2(R.s-V.s);
          if(pj&&R.issue==='pose'){j.dlat=r2(R.lat-pj.lat*pj.face);j.dessousOk=(!!R.dessous)===(pj.face<0);const imp=Math.abs(pj.vN),note=imp<4.5?'parfaite':imp>=10?'lourde':'bonne';j.noteOk=note===R.note;j.dimpact=r2(R.impact-imp*.48);}
          else if(R.issue==='pose')j.dlat=r2(R.lat-V.lat);}
        else if(prevu!=='libre')j.dt=r2(R.t-reel);
        if(prevu==='choc'&&arrive==='choc')j.causeOk=R.cause===cause;
        return j;};
      const rayonDe=q=>q.vue.vol.radar.rayons.find(y=>y.m===facon);
      o.a=juge(rayonDe(vv[0]),(fin-vv[0].image+1)/60,vv[0].image);
      {const pose9=vv.find(q=>{const R=q.vue.vol.radar.rayons,x=R.find(y=>y.m==='tenu'),y=rayonDe(q);return x&&y&&(facon==='tenu'||(x.issue===y.issue&&x.t===y.t&&x.d===y.d));});
        if(pose9)o.a2=juge(rayonDe(pose9),(fin-pose9.image+1)/60,pose9.image);}
      const tard=vv.filter(q=>(fin-q.image+1)/60>=1);
      if(tard.length){const q=tard[tard.length-1];o.b=juge(rayonDe(q),(fin-q.image+1)/60,q.image);}
      /* LA SORTIE DU SOL (le voltigeur les demande) : la vue ou l'ordre de sortir est donne — une sortie franche (plein volant jusqu'au bord) ou un
         saut — porte la sortie prevue : dans combien de temps, et l'issue du vol qui suit pour « rien » et « plane » */
      {const av=vues.filter(q=>q.image<=V.i0&&q.image>V.i0-240&&q.vue.mode==='sol'&&q.vue.sorties&&q.ordre&&q.ordre.sortie===(V.origine==='saut'?'saut':'franc')&&(V.origine==='saut'||V.origine==='bord'));
        if(av.length){const q=av[0],S9=q.vue.sorties,genre=q.ordre.sortie,S=genre==='saut'?S9.saut:(q.ordre.cote>0?S9.gauche:S9.droite),reel=(V.i0-q.image+1)/60;
          o.sol={genre:genre,image:q.image,reel:r2(reel),mesure:S?S.mesure:undefined,prevue:!!(S&&S.rayons),t:S?S.t:null,issue:S&&!S.rayons?(S.issue||null):null,dt:S&&S.rayons?r2(S.t-reel):null,refuse:genre==='saut'&&!S};
          if(S&&S.rayons&&(facon==='rien'||facon==='plane'||facon==='versRoute'))o.s=juge(S.rayons.find(y=>y.m===facon),(fin-V.i0)/60,q.image);}}
      /* (2026-11-25, relecture) LA SORTIE « BORD » D'OFFICE : la premiere vue au sol, dans les 2 s d'avant le decollage par le bord, ou les yeux
         l'annoncent d'eux-memes — quand, et le vol qui suit pour la facon tenue (rien, versRoute, plane). Pas apres une sortie FRANCHE : elle
         a ses propres rayons (gauche, droite), et la sortie d'office suppose une caisse qui essaie de tenir la route, pas un volant a fond. */
      if(V.origine==='bord'&&!(o.sol&&o.sol.genre==='franc')){const q=vues.find(q9=>q9.image<=V.i0&&q9.image>V.i0-120&&q9.vue.mode==='sol'&&q9.vue.sorties&&q9.vue.sorties.bord&&q9.vue.sorties.bord.rayons);
        if(q){const S=q.vue.sorties.bord,reel=(V.i0-q.image+1)/60;o.bord={image:q.image,reel:r2(reel),t:S.t,dt:r2(S.t-reel)};
          o.sb=juge(S.rayons.find(y=>y.m===facon),(fin-V.i0)/60,q.image);}}
      vols.push(o);}
    return {bilan:{images:b.images,cause:b.cause,duree:b.duree_s,cartes:b.cartes,vols:b.vols,yeux:b.yeux,tirages:b.yeuxTirages,empreinte:b.empreinte,touches:require('crypto').createHash('sha1').update(JSON.stringify(x.touches)).digest('hex').slice(0,12),erreurs:b.erreurs,xReel:b.foisTempsReel,main:b.main||null},vols:vols,controles:ctl};
  }
  /* LE PAS A PAS : les places prevues contre les places du jeu, image par image, touches tenues */
  function pasApas(J,C,m,course,Y){
    const q=e=>J.ev(e),P=q('fallPos'),K=J.keys,vols=[];
    const touches=()=>[(K.ArrowLeft?1:0)-(K.ArrowRight?1:0),(K.ArrowUp?-1:0)+(K.ArrowDown?1:0),K.Space?1:0];
    let cur=null,essais=0,duVol=0;
    const clos=function(fr,fin){if(!cur)return;if(fin==='touches'&&cur.n<20){cur=null;return;} /* les doigts n'avaient pas fini de poser la facon : l'essai est refait */cur.vu=fr-cur.image;cur.fin=fin;
      cur.issueOk=fin==='touches'?null:(cur.k===cur.vu&&((fin==='sol'&&(cur.issue==='pose'||cur.issue==='levre'))||(fin==='boom'&&(cur.issue==='choc'||cur.issue==='air'||cur.issue==='fond'))))||(cur.issue==='libre'&&cur.vu>=cur.k);
      delete cur.places;vols.push(cur);cur=null;};
    const x=course(J,C,m.graine,{carte:m.carte||undefined,tmax:m.tmax,image:function(J9,fr){
      const mode=Y.modeDe(J9);
      if(cur){
        const t=touches(),k=fr-cur.image;
        if(mode!=='vol'){clos(fr,mode==='boom'?'boom':'sol');}
        else if(t[0]!==cur.t[0]||t[1]!==cur.t[1]||t[2]!==cur.t[2])clos(fr,'touches');
        else if(k>cur.places.length/3)clos(fr,'horizon');
        else{const i=(k-1)*3,e=Math.hypot(P.x-cur.places[i],P.y-cur.places[i+1],P.z-cur.places[i+2]);
          if(e>cur.ecartMax)cur.ecartMax=e;if(e>1e-6&&cur.divImage==null){cur.divImage=k;cur.divEcart=e;}if(e>.01&&cur.aLImage==null)cur.aLImage=k;if(k===30)cur.ecart30=e;if(k===60)cur.ecart60=e;cur.n=k;}}
      /* un essai par vol, 10 images apres le decollage ; refait (4 fois au plus) tant que les doigts n'ont pas fini de poser la facon */
      if(mode!=='vol')duVol=0;
      if(!cur&&mode==='vol'){
        if(duVol<4&&q('fallT')>.16&&!(q('PORTV.vol&&PORTV.att'))){duVol++;const t=touches(),r=Y.essai(J9,t[0],t[1],!!t[2],300);essais++;
          if(r)cur={image:fr,t:t,places:r.places,issue:r.issue,k:r.k,cause:r.cause||null,ecartMax:0,aLImage:null,divImage:null,divEcart:null,ecart30:null,ecart60:null,n:0,carte:q('LVL.cur&&(LVL.cur.carte||LVL.cur.piste||LVL.cur.id)'),
            volr:!!q('VOLR.on'),bord:!!q('bascOn'),nitro:!!t[2]};}}
    }});
    if(cur)clos(x.bilan.images,'temps');
    return {bilan:{images:x.bilan.images,cause:x.bilan.cause,duree:x.bilan.duree_s,cartes:x.bilan.cartes,vols:x.bilan.vols,empreinte:x.bilan.empreinte},pas:vols,essais:essais};
  }
  module.exports.mesure=mesure;module.exports.pasApas=pasApas;module.exports.volsDe=volsDe;
}
if(PRINCIPAL&&A.includes('--enfant')){
  const {ouvrir,charger,course}=require('./piloter'),Y=require('./yeux');
  process.on('message',function(m){
    /* (2026-11-25, relecture) --profil : le meme cerveau, une main a profil (la ligne est ajoutee a son texte, comme verifier.js le fait) */
    const F9=m.fichier||VOLT,J=ouvrir({regime:m.regime,query:m.requete||""});
    const C=m.profil?charger(F9,{source:fs.readFileSync(F9,'utf8')+'\nmodule.exports.profil='+JSON.stringify({modele:m.profil})+';'}):charger(F9);
    let r;try{r=m.pas?module.exports.pasApas(J,C,m,course,Y):module.exports.mesure(J,C,m,course);}catch(e){r={erreur:String(e&&e.stack||e).slice(0,600)};}
    r.carte=m.carte||'libre';r.graine=m.graine;
    process.send(r,function(){process.exit(0);});
  });
  return;
}

/* ---------------- les tableaux « prevu / arrive » (verifier.js s'en sert aussi) ---------------- */
const pc=(a,b)=>b?Math.round(100*a/b)+' %':'–';
function tableau(vols,cle){
  /* PREVU (lignes) x ARRIVE (colonnes) */
  const L9=['pose','levre','choc','air','fond','portail','libre','coupe'],C9=['pose','choc','air','fond','portail','temps','autre'],T={};
  let n=0,justes=0;const dt=[],ds=[],dl=[],di=[];let notes=0,notesOk=0,causes=0,causesOk=0,loin=0;const surprises=[];
  for(const v of vols){const j=v[cle];if(!j)continue;n++;if(j.juste)justes++;
    const k=j.issue+'|'+v.arrive;T[k]=(T[k]||0)+1;
    if(j.ds!=null){dt.push(Math.abs(j.dt));ds.push(Math.abs(j.ds));if(j.dlat!=null)dl.push(Math.abs(j.dlat));if(j.dimpact!=null)di.push(Math.abs(j.dimpact));if(j.noteOk!=null){notes++;if(j.noteOk)notesOk++;}}
    if(j.causeOk!=null){causes++;if(j.causeOk)causesOk++;}
    if(v.arrive==='choc'&&j.issue!=='choc'){if(j.juste)loin++;else surprises.push({carte:v.carte,cause:v.cause,prevu:j.issue,avant:j.avant,facon:v.facon});}}
  return {n:n,justes:justes,table:T,lignes:L9,colonnes:C9,dt_med:r2(med(dt)),dt_p90:r2(p90(dt)),ds_med:r2(med(ds)),ds_p90:r2(p90(ds)),dlat_med:r2(med(dl)),dlat_p90:r2(p90(dl)),dimpact_med:r2(med(di)),
    poses:dt.length,notes:notes,notesOk:notesOk,causes:causes,causesOk:causesOk,chocs:vols.filter(v=>v.arrive==='choc'&&v[cle]).length,chocsNonPrevus:surprises,chocsHorsHorizon:loin};}
function ecrit(nom,S){
  console.log(`\n  ${nom} : ${S.n} vol(s) · issue juste ${S.justes}/${S.n} (${pc(S.justes,S.n)})`);
  if(!S.n)return;
  console.log('    prevu \\ arrive '+S.colonnes.map(c=>c.padStart(8)).join(''));
  for(const l of S.lignes){const row=S.colonnes.map(c=>S.table[l+'|'+c]||0);if(row.some(Boolean))console.log('    '+l.padEnd(15)+row.map(x=>String(x||'·').padStart(8)).join(''));}
  if(S.poses)console.log(`    poses prevues ET arrivees (${S.poses}) : |Δt| mediane ${S.dt_med} s, p90 ${S.dt_p90} · |Δs| mediane ${S.ds_med} m, p90 ${S.ds_p90} · |Δlat| mediane ${S.dlat_med} m, p90 ${S.dlat_p90}`+(S.notes?` · note juste ${S.notesOk}/${S.notes} · |Δchoc| mediane ${S.dimpact_med} m/s`:''));
  if(S.causes)console.log(`    chocs prevus ET arrives : la cause est la bonne ${S.causesOk}/${S.causes}`);
  if(S.chocs)console.log(`    chocs NON PREVUS : ${S.chocsNonPrevus.length}/${S.chocs} (${pc(S.chocsNonPrevus.length,S.chocs)})${S.chocsHorsHorizon?' · '+S.chocsHorsHorizon+' plus loin que le rayon ne voit (« libre », juste)':''}`+(S.chocsNonPrevus.length?' — '+S.chocsNonPrevus.slice(0,6).map(x=>`${x.cause} (prevu ${x.prevu}, ${x.avant} s avant, ${x.facon})`).join(' ; '):''));}
/* les sorties du sol (demandees par le voltigeur) : la sortie prevue a-t-elle lieu, quand, et le vol qui suit */
function sorties(vols){
  const o={};
  for(const g of ['franc','saut']){const V=vols.filter(v=>v.sol&&v.sol.genre===g),P=V.filter(v=>v.sol.prevue),dt=P.map(v=>Math.abs(v.sol.dt));
    o[g]={n:V.length,prevues:P.length,refusees:V.filter(v=>v.sol.refuse).length,dt_med:r2(med(dt)),dt_p90:r2(p90(dt)),dt_max:dt.length?r2(Math.max(...dt)):null,rayons:tableau(V,'s')};}
  /* (2026-11-25, relecture) le saut dont l'impulsion est connue (un saut deja fait dans la course) a part du premier ; les sorties par facon ; la sortie « bord » d'office */
  {const V=vols.filter(v=>v.sol&&v.sol.genre==='saut');o.saut.connu=tableau(V.filter(v=>v.sol.mesure===true),'s');o.saut.premier=tableau(V.filter(v=>v.sol.mesure===false),'s');}
  {const V=vols.filter(v=>v.sol&&v.sol.genre==='franc');o.franc.parFacon={};for(const f of ['rien','plane','versRoute'])o.franc.parFacon[f]=tableau(V.filter(v=>v.facon===f),'s');}
  {const V=vols.filter(v=>v.bord),dt=V.map(v=>Math.abs(v.bord.dt));o.bord={n:V.length,dt_med:r2(med(dt)),dt_p90:r2(p90(dt)),rayons:tableau(V,'sb'),parFacon:{}};
    for(const f of ['rien','plane','versRoute'])o.bord.parFacon[f]=tableau(V.filter(v=>v.facon===f),'sb');}
  return o;}
const unT=T=>T.n?T.justes+'/'+T.n+(T.poses?' (poses : |Δt| '+T.dt_med+' s, |Δs| '+T.ds_med+' m, |Δlat| '+T.dlat_med+' m)':'')+' '+JSON.stringify(T.table).replace(/"/g,''):'aucun';
/* (2026-11-25, relecture) les comptes des controles de plusieurs courses, additionnes */
function controles(L){
  const o={sauts:{ordres:0,prevus:0,refuses:0,figure:0,decolles:0,prevusSansDecol:0,refusesMaisDecol:0},cadence:{vues:0,max:0},latC:{objets:0,dessous:0,faux:0}};
  for(const c of L){if(!c)continue;const s=c.sauts;for(const k of ['ordres','prevus','refuses','figure','decolles'])o.sauts[k]+=s[k];o.sauts.prevusSansDecol+=s.prevusSansDecol.length;o.sauts.refusesMaisDecol+=s.refusesMaisDecol.length;
    o.cadence.vues+=c.cadence.vues;if(c.cadence.max>o.cadence.max)o.cadence.max=c.cadence.max;for(const k of ['objets','dessous','faux'])o.latC[k]+=c.latC[k];}
  return o;}
function ecritControles(c){
  console.log('\n  LES CONTROLES · sauts ordonnes '+c.sauts.ordres+' : prevus '+c.sauts.prevus+' (dont sans decollage '+c.sauts.prevusSansDecol+'), dits refuses '+c.sauts.refuses+' (dont decolles quand meme '+c.sauts.refusesMaisDecol+'), « figure en cours » '+c.sauts.figure+', decolles '+c.sauts.decolles
    +' · sondes du decor : une toutes les '+c.cadence.max+' image(s) au pire ('+c.cadence.vues+' vues, hors canyon) · latC : '+c.latC.objets+' objets vus, dont '+c.latC.dessous+' sous la dalle, '+c.latC.faux+' faux');}
module.exports.controles=controles;module.exports.ecritControles=ecritControles;
function ecritSorties(S){
  console.log('\n  LES SORTIES DU SOL (demandees une decision avant ; « approx » : la vitesse tenue, ni drift ni flaque)');
  for(const g of ['franc','saut']){const x=S[g];if(!x.n){console.log('    '+g+' : aucune');continue;}
    console.log(`    ${g.padEnd(5)} : ${x.n} sortie(s) · prevue ${x.prevues}/${x.n}${x.refusees?' ('+x.refusees+' saut(s) dit(s) refuse(s))':''} · |Δt| du decollage : mediane ${x.dt_med} s, p90 ${x.dt_p90} · le vol qui suit (${g==='saut'?'rien ou plane':'rien, plane ou versRoute'}) : issue juste ${x.rayons.justes}/${x.rayons.n}`+(x.rayons.poses?` · poses : |Δt| ${x.rayons.dt_med} s, |Δs| ${x.rayons.ds_med} m, |Δlat| ${x.rayons.dlat_med} m`:''));
    if(g==='saut'){console.log('            impulsion connue (un saut deja fait) : '+unT(x.connu));console.log('            premier saut de la course (plancher du jeu) : '+unT(x.premier));}
    else for(const f of Object.keys(x.parFacon||{}))if(x.parFacon[f].n)console.log('            '+f.padEnd(10)+': '+unT(x.parFacon[f]));}
  if(S.bord){const x=S.bord;if(!x.n)console.log('    bord d\'office : aucune');
    else{console.log(`    bord d'office : ${x.n} sortie(s) annoncee(s) par les yeux · |Δt| du decollage : mediane ${x.dt_med} s, p90 ${x.dt_p90} · le vol qui suit (rien, versRoute ou plane) : issue juste ${x.rayons.justes}/${x.rayons.n}`);
      for(const f of Object.keys(x.parFacon))if(x.parFacon[f].n)console.log('            '+f.padEnd(10)+': '+unT(x.parFacon[f]));}}}
module.exports.tableau=tableau;module.exports.ecrit=ecrit;module.exports.sorties=sorties;module.exports.ecritSorties=ecritSorties;
if(PRINCIPAL&&!A.includes('--enfant'))parent();
/* ---------------- le parent : une course par processus, K a la fois ---------------- */
function parent(){
const REGIME=opt('regime','allege')==='max'?'max':'allege',CARTES=String(opt('cartes','nuages,espace,grotte,ville,jade,canyon')).split(',').filter(Boolean);
const NG=Math.max(1,+opt('graines',3)||3),G0=+opt('depart',910000),TMAX=+opt('tmax',90),K=Math.max(1,Math.min(2,+opt('coeurs',2)||2)),PAS=A.includes('--pas');
const REQUETE=opt('requete',''),CERVEAU=opt('cerveau',null),FICHIER=CERVEAU?path.resolve(CERVEAU):null,NOMC=FICHIER?path.basename(FICHIER,'.js'):'voltigeur';
const PROFIL=opt('profil',null);if(PROFIL&&['machine','clavier','doigt'].indexOf(PROFIL)<0){console.log('--profil : machine, clavier ou doigt');process.exit(2);}
const SORTIE=path.resolve(opt('sortie',path.join(__dirname,'results','justesse'+(REGIME==='allege'?'-allege':'')+(PAS?'-pas':'')+(FICHIER?'-'+NOMC:'')+(PROFIL?'-main-'+PROFIL:'')+(REQUETE?'-'+REQUETE.replace(/[^a-z0-9]+/gi,''):'')+'.json')));
/* (2026-11-25, relecture : « node justesse.js, la commande ecrite dans Verifier, ecrase sans prevenir le fichier des 57 vols ») LA SORTIE PORTE SON
   REGLAGE : un fichier qui existe avec un autre reglage (graines, depart, tmax, maps, regime, mode, cerveau, profil, adresse) n'est pas ecrase
   sans --force — la meme garde que noter.js. Les fichiers suivis par git sont des mesures citees dans les documents (README § 2 ter). */
if(fs.existsSync(SORTIE)&&!A.includes('--force')){let v=null;try{v=JSON.parse(fs.readFileSync(SORTIE,'utf8'));}catch(e){}
  const voulu={regime:REGIME,requete:REQUETE||null,cerveau:NOMC,profil:PROFIL,cartes:CARTES.join(','),graines:NG,depart:G0,tmax:TMAX,mode:PAS?'pas':'issues'};
  const deja=v?{regime:v.regime,requete:v.requete||null,cerveau:v.cerveau,profil:v.profil||null,cartes:(v.cartes||[]).join(','),graines:v.graines&&v.graines.n,depart:v.graines&&v.graines.depart,tmax:v.tmax,mode:v.mode}:null;
  const diff=deja?Object.keys(voulu).filter(k=>String(voulu[k])!==String(deja[k])):['(fichier illisible)'];
  if(diff.length){console.log(`${path.relative(process.cwd(),SORTIE)} existe deja avec un autre reglage (${diff.map(k=>deja?k+' '+deja[k]+' au lieu de '+voulu[k]:k).join(' ; ')}) : rien n'est joue.\n`
    +`  Pour refaire CETTE mesure : les memes options (${deja?'--graines '+deja.graines+' --depart '+deja.depart+' --tmax '+deja.tmax+' --cartes '+deja.cartes+(deja.requete?' --requete "'+deja.requete+'"':''):'?'}) ; pour une autre : --sortie <fichier> ; pour l'ecraser : --force.`);process.exit(2);}}
const taches=[];for(const c of CARTES)for(let i=0;i<NG;i++)taches.push({carte:c==='libre'?null:c,graine:G0+37*i});
console.log(`justesse du radar${PAS?' (pas a pas)':''} · cerveau ${NOMC}${PROFIL?' (main '+PROFIL+')':''} · ${CARTES.join(', ')} · ${NG} graine(s) depuis ${G0} · ${TMAX} s au plus · regime ${REGIME}${REQUETE?' · adresse '+REQUETE:''} · ${K} a la fois`);
const t0=Date.now(),R=[];let suivant=0,actifs=0;
function lance(){
  while(actifs<K&&suivant<taches.length){const T=taches[suivant++];actifs++;
    const c=fork(__filename,['--enfant'],{silent:true});let recu=null,err='';
    if(c.stderr)c.stderr.on('data',x=>{err=(err+x).slice(-400);});
    c.on('message',x=>{recu=x;});
    c.on('exit',function(){actifs--;
      if(!recu||recu.erreur){console.log(`  ${T.carte||'libre'} ${T.graine} : RIEN (${recu?recu.erreur:err.replace(/\s+/g,' ').slice(-200)})`);}
      else{R.push(recu);const b=recu.bilan;console.log(`  ${String(T.carte||'libre').padEnd(8)} ${T.graine} · ${String(b.duree).padStart(5)} s · fin « ${b.cause} » · ${(recu.vols||recu.pas).length} vol(s) juge(s)`+(b.yeux?` · yeux ${b.yeux.ms_moy} ms/vue (sol ${b.yeux.ms_sol_moy}, vol ${b.yeux.ms_vol_moy}, pire ${b.yeux.ms_max}) · ${b.yeux.pas_max} images, ${b.yeux.sondes_max} sondes au pire · ${b.yeux.octets_moy} car.${b.yeux.erreurs?' · ERREURS '+b.yeux.erreurs:''}${b.tirages?' · TIRAGES '+b.tirages:''}`:''));}
      if(suivant>=taches.length&&actifs===0)bilan();else lance();});
    c.send({regime:REGIME,carte:T.carte,graine:T.graine,tmax:TMAX,pas:PAS,fichier:FICHIER,requete:REQUETE,profil:PROFIL});}}
function bilan(){
  const out={date:new Date().toISOString(),regime:REGIME,requete:REQUETE||null,cerveau:NOMC,profil:PROFIL,cartes:CARTES,graines:{n:NG,depart:G0,pas:37},tmax:TMAX,mode:PAS?'pas':'issues',courses:R.map(r=>Object.assign({carte:r.carte,graine:r.graine},r.bilan))};
  if(PAS){
    const tous=[].concat(...R.map(r=>r.pas||[]));out.pas={};
    console.log('\n=== LE PAS A PAS : les places prevues contre les places du jeu (touches tenues) ===');
    const groupes={};for(const v of tous){(groupes[v.carte]=groupes[v.carte]||[]).push(v);}groupes.TOUT=tous;
    for(const g of Object.keys(groupes)){const V=groupes[g].filter(v=>v.n>0),ex=V.filter(v=>v.ecartMax<=.01),iss=V.filter(v=>v.issueOk!=null);
      const S={vols:V.length,images_med:med(V.map(v=>v.n)),exacts:ex.length,ecart_max_med:r2(med(V.map(v=>v.ecartMax))),ecart_max_p90:r2(p90(V.map(v=>v.ecartMax))),ecart_a_05s_med:r2(med(V.filter(v=>v.ecart30!=null).map(v=>v.ecart30))),ecart_a_1s_med:r2(med(V.filter(v=>v.ecart60!=null).map(v=>v.ecart60))),
        issue_a_l_image:iss.filter(v=>v.issueOk).length,issues:iss.length};
      out.pas[g]=S;
      console.log(`  ${g.padEnd(8)} ${String(S.vols).padStart(3)} vol(s), ${S.images_med} images suivies (mediane) · places au centimetre ${S.exacts}/${S.vols} · ecart au pire : mediane ${S.ecart_max_med} m, p90 ${S.ecart_max_p90} m · a 0,5 s ${S.ecart_a_05s_med} m, a 1 s ${S.ecart_a_1s_med} m · issue a l'image pres ${S.issue_a_l_image}/${S.issues}`);}
    const pires=tous.filter(v=>v.n>0&&v.ecartMax>.01).sort((a,b)=>b.ecartMax-a.ecartMax).slice(0,8);
    if(pires.length){console.log('  les pires : '+pires.map(v=>`${v.carte} image ${v.image} : ${r2(v.ecartMax)} m en ${v.n} images (1 cm a l'image ${v.aLImage}, premier ecart a l'image ${v.divImage} : ${v.divEcart==null?'?':v.divEcart.toExponential(1)} m${v.volr?', haut de la route':''}${v.bord?', bord':''}${v.nitro?', nitro':''}, touches ${v.t})`).join('\n              '));}
    out.pires=pires;out.vols=tous;
    const rates=tous.filter(v=>v.n>0&&v.issueOk===false);
    if(rates.length)console.log('  issues pas a l\'image pres : '+rates.map(v=>`${v.carte} : ${v.issue}${v.cause?' '+v.cause:''} prevu a l'image ${v.k}, fin « ${v.fin} » a l'image ${v.vu}`).join(' ; '));
  }else{
    const tous=[].concat(...R.map(r=>r.vols||[]));out.cartes_mesurees={};
    console.log(`\n=== LA JUSTESSE DU RADAR — ${NOMC}${PROFIL?' (main '+PROFIL+')':''}, rayon « ${tous.length&&tous.every(v=>v.facon==='tenu')?'tenu':'la facon tenue'} » ===`);
    const groupes={};for(const v of tous){(groupes[v.carte]=groupes[v.carte]||[]).push(v);}
    for(const g of Object.keys(groupes).sort().concat(['TOUT'])){const V=g==='TOUT'?tous:groupes[g];
      console.log(`\n${g} — ${V.length} vol(s)${g!=='TOUT'&&V[0]&&V[0].decor?' · decor sonde : '+V[0].decor:''}`);
      const a=tableau(V,'a'),b=tableau(V,'b');out.cartes_mesurees[g]={vols:V.length,a:a,b:b};
      const a2=tableau(V,'a2');out.cartes_mesurees[g].a2=a2;
      ecrit('(a) a la premiere vue du vol',a);ecrit('(a2) a la premiere vue ou les doigts tiennent la facon',a2);ecrit('(b) a la derniere vue, 1 s au moins avant la fin',b);
      if(g==='TOUT'){const S=sorties(V);out.sorties=S;ecritSorties(S);
        out.controles=controles(R.map(r=>r.controles));ecritControles(out.controles);
        console.log('\n  par facon (issue juste a la premiere vue · 1 s avant la fin) : '+[...new Set(V.map(v=>v.facon))].map(f=>{const W=V.filter(v=>v.facon===f),ta=tableau(W,'a'),tb=tableau(W,'b');return `${f} ${ta.justes}/${ta.n} · ${tb.justes}/${tb.n}`;}).join(' | '));}}
    out.vols=tous;
    /* le cout, par carte */
    console.log('\n=== LE COUT (l\'horloge de l\'hote : elle depend de la charge du PC) ===');
    const parC={};for(const r of R){if(!r.bilan.yeux)continue;(parC[r.carte]=parC[r.carte]||[]).push(r.bilan);}out.cout={};
    for(const c of Object.keys(parC)){const B=parC[c],vs=B.reduce((a,b)=>a+b.yeux.vues_sol,0),vv=B.reduce((a,b)=>a+b.yeux.vues_vol,0),ms=(B.reduce((a,b)=>a+b.yeux.ms_sol_moy*b.yeux.vues_sol+b.yeux.ms_vol_moy*b.yeux.vues_vol,0))/Math.max(1,vs+vv);
      const S={ms_moy:+ms.toFixed(3),ms_sol_moy:+(B.reduce((a,b)=>a+b.yeux.ms_sol_moy*b.yeux.vues_sol,0)/Math.max(1,vs)).toFixed(3),ms_vol_moy:+(B.reduce((a,b)=>a+b.yeux.ms_vol_moy*b.yeux.vues_vol,0)/Math.max(1,vv)).toFixed(3),ms_max:Math.max(...B.map(b=>b.yeux.ms_max)),
        part_vol:+(vv/Math.max(1,vs+vv)).toFixed(3),pas_max:Math.max(...B.map(b=>b.yeux.pas_max)),sondes_max:Math.max(...B.map(b=>b.yeux.sondes_max)),octets_moy:Math.round(B.reduce((a,b)=>a+b.yeux.octets_moy,0)/B.length),erreurs:B.reduce((a,b)=>a+b.yeux.erreurs,0),tirages:B.reduce((a,b)=>a+(b.tirages||0),0),x_reel:+(B.reduce((a,b)=>a+b.xReel,0)/B.length).toFixed(2)};
      out.cout[c]=S;
      console.log(`  ${c.padEnd(8)} ${S.ms_moy} ms par vue (sol ${S.ms_sol_moy}, vol ${S.ms_vol_moy}, pire ${S.ms_max}) · ${Math.round(100*S.part_vol)} % des vues en vol · au pire ${S.pas_max} images et ${S.sondes_max} sondes · ${S.octets_moy} caracteres par vue · erreurs ${S.erreurs} · tirages ${S.tirages} · jeu x${S.x_reel}`);}
  }
  fs.mkdirSync(path.dirname(SORTIE),{recursive:true});
  fs.writeFileSync(SORTIE,JSON.stringify(out,null,1));
  console.log('\necrit :',path.relative(process.cwd(),SORTIE),'·',Math.round((Date.now()-t0)/1000),'s');
  process.exit(0);
}
lance();
}
