/* ===== LE VOLTIGEUR (2026-11-24, Sacha : « des bots du palier 1 au palier 30 qu'on ne distingue pas de vrais joueurs ») =====
   Le cerveau de MESURE des yeux v2 : il ne cherche pas a bien jouer, il fabrique des vols de toutes sortes pour qu'on puisse comparer ce que le
   radar PREVOIT a ce qui ARRIVE (justesse.js) et controler que regarder ne change rien (verifier.js, section 6).
   · au sol il tient le milieu (« ligne:0 ») ; la nitro deux tranches de 5 s sur quatre, pour varier la vitesse ;
   · toutes les 5 s il SORT expres : un saut, puis une sortie douce par le bord, puis une sortie franche (volant a fond), un cote puis l'autre.
     Une decision avant, il DEMANDE les sorties (« regarder:'sorties' ») : la vue suivante les porte, la mesure les compare a ce qui arrive ;
   · a chaque vol il prend UNE facon de piloter et la TIENT tout le vol : rien, gauche, droite, cabre, pique, plane, planeCabre, ou la loi
     « vers la route » (avec ou sans nitro) que le radar joue en boucle fermee. Laquelle : le numero du vol plus l'endroit de la piste ou il
     decolle (la facon ne suit pas toujours le meme genre de sortie) ; apres une sortie franche ou un saut, une fois sur deux « rien » ou
     « plane », les deux rayons des sorties.
   Il ne lit PAS le radar, ni rien de ce que les yeux v2 ajoutent : avec ou sans eux, sa course est la meme (c'est ce que le controle 6c
   verifie). Son ordre porte « facon » et « vol » en vol, « sortie » et « cote » au sol : la trace les garde, la mesure y lit quoi juger. */
const FACONS=['rien','gauche','droite','cabre','pique','plane','planeCabre','versRoute','versRoutePlane'];
const ORDRES={rien:{},gauche:{volant:1},droite:{volant:-1},cabre:{manche:1},pique:{manche:-1},plane:{nitro:true},planeCabre:{nitro:true,manche:1}};
const cl=(x,a,b)=>x<a?a:x>b?b:x;
/* LA LOI « VERS LA ROUTE », celle que le radar joue (yeux.js) et que le bot de reference suit sans son anneau : le cap qui ramene au-dessus de
   l'axe, le volant qui tient ce cap, piquer si la route est a plus de 2 s dessous (ou trop loin pour ce qu'il reste d'air) */
function versRoute(v,nitro){
  const f=v.vol,p=f.proche,o={volant:0,manche:0,nitro:nitro};
  if(!p)return o;
  /* (2026-11-25, relecture) tete en bas par rapport a la route (p.envers), le volant tourne a l'envers de son repere : la loi se retourne, comme dans les yeux */
  if(Math.abs(p.axe)<1.6)o.volant=cl((cl(-p.lat/40,-.6,.6)-p.axe)*1.6,-1,1)*(p.envers?-1:1);
  if(p.haut>10&&Math.abs(p.lat)<v.demi*2){const d=p.haut/Math.max(1,p.versRoute);if(d>2||d>f.reste-1)o.manche=p.envers?1:-1;}   /* tete en bas, « piquer » eloigne de la route : cabrer */
  return o;}
module.exports={
  nom:'voltigeur',
  FACONS:FACONS,
  decide:function(v,m){
    if(v.mode==='vol'){
      if(!m.enVol){m.enVol=true;m.vols=(m.vols|0)+1;const q=Math.floor(Math.abs(v.s||0));
        m.facon=m.sortie&&(m.sortie.saut||!m.sortie.doux)&&q%2===0?(m.vols%2?'rien':'plane'):FACONS[(m.vols-1+q)%FACONS.length];m.sortie=null;}
      const o=m.facon==='versRoute'?versRoute(v,false):m.facon==='versRoutePlane'?versRoute(v,true):Object.assign({},ORDRES[m.facon]);
      o.facon=m.facon;o.vol=m.vols;return o;}
    if(v.mode!=='sol')return {};
    m.enVol=false;
    if(m.t0==null)m.t0=v.t;
    const n=Math.floor((v.t-m.t0)/5),nitro=n%4>=2&&!v.dessous;
    if(n>(m.n|0)&&!m.sortie){m.n=n;m.sortie={cote:n%2?1:-1,saut:n%3===1,doux:n%3===0,t:v.t,fait:false,pret:false};}
    if(m.sortie){
      const S=m.sortie;
      if(!S.pret){S.pret=true;S.t=v.t;return {ligne:0,nitro:nitro,regarder:'sorties'};}   /* une decision d'avance : la vue suivante portera les sorties */
      if(v.t-S.t>3){m.sortie=null;return {ligne:0,nitro:nitro};}   /* rien n'est venu (saut refuse, mur) : on reprend la route */
      if(S.saut){if(!S.fait){S.fait=true;return {ligne:0,geste:'saut',direction:'avant',sortie:'saut'};}return {ligne:0};}
      return {volant:S.cote*(S.doux?.35:1),nitro:nitro,regarder:'sorties',sortie:S.doux?'doux':'franc',cote:S.cote};}
    return {ligne:0,nitro:nitro};}
};
