/* ===== LE VOLTIGEUR DE LA ROUTE (2026-11-25, la relecture des yeux v2 — Sacha : « des bots du palier 1 au palier 30 qu'on ne distingue pas de vrais joueurs ») =====
   Le SECOND cerveau de mesure du radar (justesse.js --cerveau voltigeur-route.js). Le premier (voltigeur.js) tient une facon au hasard et meurt
   vite : il n'avait mesure ni le rayon « versRoute » apres une sortie par le bord (0 vol sans nitro, 2 avec), ni le saut dont l'impulsion est
   connue (ses 30 sauts etaient tous le PREMIER de leur course). Celui-ci fait ce qu'un pilote fera :
   · au sol il tient le milieu (« ligne:0 ») ; la nitro deux tranches de 4 s sur quatre ;
   · toutes les 4 s il SORT expres, dans cet ordre : un saut, une sortie franche (volant a fond), un saut, une sortie douce (le volant a 0,35 :
     la sortie « bord » que les yeux donnent d'office), un cote puis l'autre. Une decision avant, il demande les sorties (« regarder:'sorties' ») ;
   · apres un SAUT il tient « rien » ou « plane » (une fois sur deux) : les deux rayons du saut — et il se repose assez souvent pour sauter encore ;
   · apres une sortie par le BORD il tient la loi « vers la route » (une fois sur trois avec la nitro), celle du radar et du bot de reference.
   Il ne lit PAS le radar : ce qu'il mesure, c'est ce que le radar aurait dit a un pilote. Son ordre porte « facon » et « vol » en vol, « sortie »
   et « cote » au sol : la trace les garde, justesse.js y lit quoi juger. verifier.js ne s'en sert pas (ses controles reposent sur voltigeur.js). */
const cl=(x,a,b)=>x<a?a:x>b?b:x;
const ORDRES={rien:{},plane:{nitro:true}};
/* LA LOI « VERS LA ROUTE » (yeux.js, README § 2 bis) : le cap qui ramene au-dessus de l'axe, le volant qui tient ce cap — retourne quand la caisse
   vole tete en bas par rapport a la route (p.envers) —, piquer si la route est a plus de 2 s dessous ou trop loin pour ce qu'il reste d'air */
function versRoute(v,nitro){
  const f=v.vol,p=f.proche,o={volant:0,manche:0,nitro:nitro};
  if(!p)return o;
  if(Math.abs(p.axe)<1.6)o.volant=cl((cl(-p.lat/40,-.6,.6)-p.axe)*1.6,-1,1)*(p.envers?-1:1);
  if(p.haut>10&&Math.abs(p.lat)<v.demi*2){const d=p.haut/Math.max(1,p.versRoute);if(d>2||d>f.reste-1)o.manche=p.envers?1:-1;}   /* tete en bas, « piquer » eloigne de la route : cabrer */
  return o;}
module.exports={
  nom:'voltigeur-route',
  decide:function(v,m){
    if(v.mode==='vol'){
      if(!m.enVol){m.enVol=true;m.vols=(m.vols|0)+1;
        if(m.sortie&&m.sortie.saut){m.sauts=(m.sauts|0)+1;m.facon=m.sauts%2?'rien':'plane';}
        else{m.bords=(m.bords|0)+1;m.facon=m.bords%3===0?'versRoutePlane':'versRoute';}
        m.sortie=null;}
      const o=m.facon==='versRoute'?versRoute(v,false):m.facon==='versRoutePlane'?versRoute(v,true):Object.assign({},ORDRES[m.facon]);
      o.facon=m.facon;o.vol=m.vols;return o;}
    if(v.mode!=='sol')return {};
    m.enVol=false;
    if(m.t0==null)m.t0=v.t;
    /* la nitro : deux tranches sur quatre, et JAMAIS allumee a la decision d'avant un saut. MESURE le 25/11 (nuages 910000) : une NITRO enfoncee
       6 images puis relachee par la mise en place du geste « saut » fait, avec le premier appui du geste, un double appui pour le jeu — la figure
       part 10 images trop tot, la caisse decolle 5 images trop tot, et le dernier appui du geste tombe EN VOL (un coup de reacteur). C'est un
       defaut de la main (doigts.js), pas des yeux : ici la nitro est tenue depuis 4 s au moins quand un saut part, ou pas du tout. */
    const n=Math.floor((v.t-m.t0)/4),nitro=n%4>=2&&!v.dessous;
    if(n>(m.n|0)&&!m.sortie){m.n=n;m.sortie={cote:n%8<4?1:-1,saut:n%2===1,doux:n%4===0,t:v.t,fait:false,pret:false};}
    if(m.sortie){
      const S=m.sortie;
      if(!S.pret){S.pret=true;S.t=v.t;return {ligne:0,nitro:nitro,regarder:'sorties'};}   /* une decision d'avance : la vue suivante portera les sorties */
      if(v.t-S.t>3){m.sortie=null;return {ligne:0,nitro:nitro};}   /* rien n'est venu (saut refuse, mur) : on reprend la route */
      if(S.saut){if(!S.fait){S.fait=true;return {ligne:0,geste:'saut',direction:'avant',sortie:'saut'};}return {ligne:0};}
      return {volant:S.cote*(S.doux?.35:1),nitro:nitro,regarder:'sorties',sortie:S.doux?'doux':'franc',cote:S.cote};}
    return {ligne:0,nitro:nitro};}
};
