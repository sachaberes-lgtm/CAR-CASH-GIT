/* ===== PILOTE, variante c0004 : LA LIGNE PARFAITE ET LA NITRO =====
   Le parent vise la ligne parfaite (fruit, plaque, fruit…) quand elle est a peine plus proche que la premiere tranche de pieces, et il
   coupe la nitro des qu'un virage demande un peu de volant. Un joueur, lui, tient la nitro en prenant la ligne : chaque fruit et chaque
   plaque la recharge (1,15 de nitro rendue par objet, contre 0,8 perdu par seconde nitro tenue). Cette variante fait deux choses, et
   une seule idee : tenir la ligne, et tenir la nitro avec elle.
   1. LA LIGNE D'ABORD : un objet de la ligne se prend tant qu'il n'est pas plus de 40 m plus loin que la premiere piece (10 m avant).
   2. LA NITRO PENDANT LA LIGNE : quand un objet de la ligne est a moins de 90 m, sur une map sans decor, la nitro se rallume des que la
      jauge passe 0,30 (au lieu de 0,45) et tient dans des virages un peu plus marques (seuil x1,5). Les maps a decor gardent le reglage du parent.
   Le reste (la route, le virage d'apres, le radar en vol, la seconde chance) est celui du parent. La main reste celle du parent. */
const PROFIL={
  modele:'clavier',graine:1,
  chance:{prend:1,palierMin:12}
};
const REGLAGES={
  marge:10,
  bandeDecor:99,
  nitroDecor:.62,
  margeCouloir:15,
  avance:.3,
  glisse:.12,
  glisseUrgence:.3,
  ligneLoin:320,
  piecesLoin:180,
  ligneAvance:40,    /* m : un objet de la ligne se prend meme si une piece est jusqu'a 40 m plus pres */
  ligneNitroLoin:90, /* m : un objet de la ligne a moins de ca ouvre la nitro plus tot */
  ligneSeuil:1.5,    /* multiplie le seuil de virage de la nitro pendant une ligne (hors decor) */
  jaugeLigne:.3,     /* jauge + reserve pour rallumer la nitro pendant une ligne (hors decor) */
  capLigne:.3,
  avanceCap:.25,
  capAvance:.25,
  braqueDoux:.15,
  braqueFort:.5,
  braqueNitro:.4,
  margeAllumer:.3,
  margeTenir:.1,
  jaugeAllume:.45,
  jaugeCoupe:.25,
  capMax:.22,
  bascule:10,
  tenirFacon:.35,
  derive:.3
};
const cl=(v,a,b)=>v<a?a:v>b?b:v;
const cote=o=>o.latC!=null?o.latC:o.lat;

/* ---------- AU SOL ---------- */
/* ce qu'on vise : l'objet de la ligne parfaite s'il est proche et a portee, sinon la premiere tranche de pieces a portee, sinon un pouvoir */
function aRamasser(v,max){
  const R=REGLAGES,dmin=Math.max(15,v.vitesse*R.avance);
  const prend=(d,lat)=>d>=dmin&&Math.abs(lat)<=max&&Math.abs(lat-v.lat)<Math.max(3,(d-v.vitesse*.25)*R.glisse*.85);
  const L=v.ligne&&Array.isArray(v.ligne.objets)?v.ligne.objets:[];
  const obj=L.find(o=>o&&o.d<R.ligneLoin&&prend(o.d,o.lat));
  const P=Array.isArray(v.piecesDevant)?v.piecesDevant:[];
  const file=P.find(p=>p&&p.d<R.piecesLoin&&prend(p.d,cote(p)));
  const O=Array.isArray(v.orbes)?v.orbes:[];
  const orbe=O.find(o=>o&&o.d<220&&prend(o.d,cote(o)));
  /* la ligne d'abord : un objet de la ligne se prend tant qu'il n'est pas trop loin derriere la premiere piece */
  if(obj&&(!file||obj.d<=file.d+R.ligneAvance||obj.d<v.vitesse*1.2))return obj.lat;
  if(orbe&&(!file||orbe.d<=file.d+10))return cote(orbe);
  if(file)return cote(file);
  if(obj)return obj.lat;
  return null;
}
/* une ligne parfaite tourne dans les 90 m : la nitro peut revenir plus tot (l'objet suivant la rechargera) */
function ligneProche(v){
  const L=v.ligne&&Array.isArray(v.ligne.objets)?v.ligne.objets:[];
  return L.some(o=>o&&o.d<REGLAGES.ligneNitroLoin&&Math.abs(o.lat)<v.demi);
}
/* DE COMBIEN LA ROUTE AURA TOURNE a d metres devant (rad, + a gauche) */
function tourne(v,d){
  const rt=Array.isArray(v.route)?v.route:[];
  let d0=0,a0=0;
  for(const p of rt){if(!p)continue;if(d<=p.d)return a0+(p.virage-a0)*(d-d0)/Math.max(1,p.d-d0);d0=p.d;a0=p.virage;}
  return a0;
}
/* LE LACET DE LA ROUTE DANS t SECONDES (rad/s) */
function lacetDans(v,t,vit){return (tourne(v,vit*(t+.15))-tourne(v,vit*Math.max(0,t-.15)))/(t<.15?t+.15:.3);}
const DECOR={canyon:1,grotte:1,jade:1,ville:1};
function auSol(v,m){
  const R=REGLAGES,vg=v.virage,tn=v.tenue,vit=Math.max(6,v.vitesse),lmax=Math.max(.05,v.lacetMax||1);
  const couloir=(v.mur&&v.mur.ici)||(Array.isArray(v.couloirs)&&v.couloirs.some(c=>c.d0<vit*2&&c.d1>0));
  const decor=!!DECOR[v.carte],max=Math.min(decor?R.bandeDecor:99,v.demi-(couloir?R.margeCouloir:R.marge));
  /* ce qui se ramasse a portee, sinon le milieu */
  let cible=0;
  const but=aRamasser(v,max);
  if(but!=null)cible=but;
  /* la place dans le virage : celui qui vient, pas celui qu'on quitte */
  const lIci=v.lacetRoute||0,lTot=lacetDans(v,.4,vit),lTard=lacetDans(v,1,vit);
  let lFort=lTard;
  if(Math.abs(lTot)>Math.abs(lFort))lFort=lTot;
  if(Math.abs(lIci)*.6>Math.abs(lFort))lFort=lIci;
  const force=Math.abs(lFort)/lmax,sens=lFort>0?1:-1,u=cl((force-R.braqueDoux)/(R.braqueFort-R.braqueDoux),0,1);
  if(u>0){const plancher=max*(-1+1.5*u);if(cible*sens<plancher)cible=sens*plancher;}
  /* une flaque sur la ligne : passer a cote */
  const F=Array.isArray(v.flaques)?v.flaques:[];
  for(const f of F){if(f.d<5||f.d>160)continue;if(Math.abs(f.lat-cible)<f.rayon+4)cible=f.lat+(f.lat>0?-1:1)*(f.rayon+6);}
  /* la route ne se tient plus : vers le cote oppose au bord */
  const lache=!!(tn&&tn.tient===false);
  if(lache)cible=-tn.cote*max*.5;
  cible=cl(cible,-max,max);
  /* la ligne glisse vers sa cible */
  if(m.ligne==null||m.tSol==null||v.t-m.tSol>.25)m.ligne=cl(v.lat,-max,max);
  m.tSol=v.t;
  const pas=(lache?R.glisseUrgence:R.glisse)*vit*.1;
  m.ligne=cl(m.ligne+cl(cible-m.ligne,-pas,pas),-max,max);
  /* le cap d'avance sur le virage qui arrive */
  let capVoulu=cl((m.ligne-v.lat)/(.9*vit),-R.capLigne,R.capLigne)+cl((lTot-lIci)*R.avanceCap,-R.capAvance,R.capAvance);
  if(v.lat>max)capVoulu=Math.min(capVoulu,-.05);else if(v.lat<-max)capVoulu=Math.max(capVoulu,.05);
  const ligne=v.lat+.9*vit*cl(capVoulu,-.4,.4);
  /* LA NITRO : la ou elle ne met pas la caisse dehors */
  const pose=Math.abs(v.lat)<v.demi-6&&Math.abs(v.cap)<R.capMax&&!v.glisse&&!v.rebond;
  const jauge=(v.nitro||0)+(v.reserve||0);
  /* pendant une ligne parfaite (hors decor) : la nitro se rallume plus tot, et tient dans des virages plus marques ;
     chaque objet pris la recharge, donc la jauge remonte sur la ligne */
  const enLigne=!decor&&ligneProche(v);
  const jaugeOn=enLigne?R.jaugeLigne:R.jaugeAllume;
  if(jauge>jaugeOn)m.plein=true;else if(jauge<R.jaugeCoupe)m.plein=false;
  const proche=!!(vg&&vg.d<vit*3),margeV=proche?vg.marge/vit:9;
  const k=decor?R.nitroDecor:(enLigne?R.ligneSeuil:1),seuil=(m.nitro?R.braqueNitro:R.braqueNitro-.1)*k;
  const sur=margeV>(m.nitro?R.margeTenir:R.margeAllumer)&&Math.max(force,Math.abs(lIci)/lmax)<seuil;
  m.nitro=!lache&&pose&&sur&&(v.nitroLibre||!!m.plein);
  m.facon=null;
  return {ligne:ligne,nitro:m.nitro};
}

/* ---------- EN VOL ---------- */
function versRoute(v,nitro){
  const f=v.vol,p=f.proche,o={volant:0,manche:0,nitro:nitro};
  if(!p)return o;
  if(Math.abs(p.axe)<1.6)o.volant=cl((cl(-p.lat/40,-.6,.6)-p.axe)*1.6,-1,1)*(p.envers?-1:1);
  if(p.haut>10&&Math.abs(p.lat)<v.demi*2){
    const air=f.air&&f.air.reste!=null?f.air.reste:f.reste,delai=p.haut/Math.max(1,p.versRoute);
    if(delai>2||delai>air-1)o.manche=p.envers?1:-1;}
  return o;
}
const FACONS={
  rien:()=>({volant:0,manche:0,nitro:false}),
  gauche:()=>({volant:1,manche:0,nitro:false}),
  droite:()=>({volant:-1,manche:0,nitro:false}),
  cabre:()=>({volant:0,manche:1,nitro:false}),
  pique:()=>({volant:0,manche:-1,nitro:false}),
  plane:()=>({volant:0,manche:0,nitro:true}),
  planeCabre:()=>({volant:0,manche:1,nitro:true}),
  versRoute:v=>versRoute(v,false),
  versRoutePlane:v=>versRoute(v,true)
};
const LONGS={rien:1,plane:1,versRoute:1,versRoutePlane:1};
function vaut(r,long,v){
  if(!r)return -1;
  const t=+r.t||0;
  if(r.issue==='pose'){
    const axe=+r.axe||0,glisse=(+r.lat||0)+v.vitesse*Math.sin(cl(axe,-1.5,1.5))*REGLAGES.derive;
    return 100-20*Math.abs(axe)-3*t-Math.min(20,Math.max(0,Math.abs(glisse)-(v.demi-4)))-(r.propre===false?20:0);}
  if(r.issue==='portail')return 94;
  if(r.issue==='levre')return 80-3*t;
  if(r.issue==='libre'||r.issue==='coupe'){
    if(long)return 12+2*t;
    return 34-Math.min(20,(Math.abs(+r.haut||0)+Math.abs(+r.lat||0))/10);}
  return Math.min(30,5*t);
}
const sauve=r=>!!r&&(r.issue==='pose'||r.issue==='levre'||r.issue==='portail');
function enVol(v,m){
  const R=REGLAGES,f=v.vol,Y=f.radar&&Array.isArray(f.radar.rayons)?f.radar.rayons:null;
  if(!m.facon){m.facon='versRoute';m.tFacon=v.t;}
  if(Y){
    const tenu=Y.find(x=>x&&x.m==='tenu'),depuis=v.t-m.tFacon,loi=m.facon.indexOf('versRoute')===0;
    const mien=!loi&&tenu&&depuis>.45?tenu:Y.find(x=>x&&x.m===m.facon),sMien=vaut(mien,true,v);
    if(!sauve(mien)&&(depuis>R.tenirFacon||(mien&&(+mien.t||0)<1))){
      let mieux=null,sMieux=-9;
      for(const nom in FACONS){
        if(nom===m.facon)continue;
        const s=vaut(Y.find(x=>x&&x.m===nom),!!LONGS[nom],v)+(nom==='versRoute'?3:nom==='versRoutePlane'?2:nom==='rien'?1:0);
        if(s>sMieux){sMieux=s;mieux=nom;}}
      if(mieux&&sMieux>sMien+R.bascule){m.facon=mieux;m.tFacon=v.t;}}
  }
  const o=FACONS[m.facon](v);
  o.ensuite={ligne:0};
  return o;
}

module.exports={
  nom:'pilote-ligne-nitro',
  profil:PROFIL,
  REGLAGES:REGLAGES,
  decide:function(vue,m){return vue.mode==='sol'?auSol(vue,m):vue.mode==='vol'?enVol(vue,m):{};}
};