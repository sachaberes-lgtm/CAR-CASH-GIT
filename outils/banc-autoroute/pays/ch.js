/* ===== SUISSE — L'AUTOBAHN (maquette du 2026-11-15, reprise le même jour : « la plus chargée, rends-la discrète ») =====
   Le vrai marquage (SSV art. 72-79, norme VSS SN 640 850a ; chantiers : directives cantonales, ex. Lucerne 653 201) : tout BLANC ;
   Leitlinien de 6 m tous les 18 m (6 m peints, 12 m de vide), 15 cm, sans plots ni ombre (du bitume) ; rives pleines de 20 cm.
   Dans un chantier, les marquages provisoires sont GELB-ORANGE (lignes, boutons « Markierungsknöpfe » à catadioptres, balises
   « Leitkörper ») et priment sur le blanc, qui reste dessous, à demi effacé ; les voies restent ouvertes mais se RESSERRENT et glissent
   de côté (la Verschwenkung, la circulation sur voies étroites).
   LA SIGNATURE : le blanc suisse sobre (6 m peints, 12 m vides, aucun plot) sur toute la piste ; et, tous les 1 300 m, un court chantier
   de 290 m (biseaux de 80 m compris) : une voie se ferme d'un côté (gauche, puis droite, en alternance), la rive provisoire en boutons orange et balises, et
   SEULEMENT les trois séparations du milieu (là où roule la caisse) passent à l'orange par-dessus leur blanc fantôme ; les autres restent
   blanches et glissent avec elles.
   Libertés : l'orange tire un peu vers le rouge (le gelb-orange suisse est plus jaune) pour ne pas se confondre avec l'or des pièces ;
   une ombre courte derrière les tirets orange, pour qu'ils se lisent sur un béton pâle ; une seule voie fermée (le vrai chantier en
   rend souvent deux) et un chantier court, pour que l'orange reste un épisode et pas le sol. */
arPaysDef('ch',{nom:'Suisse — Autobahn',plan:function(K){
  const g=K.g,d=K.d,N=10,lw=(d-g)/N,BL=0xf1efe8,OR=0xee8a2e;
  /* les chantiers en boucle sur K.L : le premier à A0, puis tous les P m ; long de LC m ; le biseau fait B m ; une voie rendue */
  const A0=370,P=1300,LC=290,B=80,W=lw,MIL=[4,5,6];
  const lisse=function(t){t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
  const zone=function(sv){const k=Math.floor((sv-A0)/P);if(k<0)return null;const a=A0+k*P;
    if(sv>a+LC||a+LC>K.L-40)return null;return [a,a+LC,k%2?1:-1];};
  const f=function(z,sv){return Math.min(lisse((sv-z[0])/B),lisse((z[1]-sv)/B));};
  const gY=function(sv){const z=zone(sv);return z&&z[2]<0?g+W*f(z,sv):g;},dY=function(sv){const z=zone(sv);return z&&z[2]>0?d-W*f(z,sv):d;};
  const rive=function(sv){const z=zone(sv);return z&&z[2]>0?dY(sv):gY(sv);};
  const coeur=function(sv,m){const z=zone(sv);return !!z&&sv>z[0]+m&&sv<z[1]-m;};
  /* LE BLANC : rives pleines ; Leitlinien 6/12 qui suivent le resserrement */
  K.trait(g,{l:.2,c:BL,op:.84});
  K.trait(d,{l:.2,c:BL,op:.84});
  for(let i=1;i<N;i++){const mil=MIL.indexOf(i)>=0,xi=function(sv){return gY(sv)+i*(dY(sv)-gY(sv))/N;};
    K.trait(xi,{l:mil?function(sv){return coeur(sv,20)?0:.15;}:.15,c:BL,op:.84,per:18,on:6});
    if(!mil)continue;
    /* au milieu : le fantôme blanc à sa place d'origine, et l'orange qui glisse (décalé d'un demi-pas) */
    const x=g+i*lw;
    K.trait(x,{l:function(sv){return coeur(sv,20)?.13:0;},c:BL,op:.18,per:18,on:6});
    K.trait(xi,{l:function(sv){return coeur(sv,20)?.14:0;},c:OR,op:.45,per:18,on:6,ph:9,ombre:.35});} /* (16/11) plus doux : au téléphone, de près, ils se lisaient comme des traînées de vitesse */
  /* la rive provisoire : des boutons orange tous les 4 m (orange aussi à contresens), seulement dans les chantiers */
  K.plot(rive,{per:4,long:.45,l:function(sv){return coeur(sv,B*.25)?.42:0;},c:OR,c2:OR});
  /* la surface interdite (dans les biseaux) : une hachure par côté et par bout, nulle hors des biseaux */
  const bis=function(sv,cote,fin){const z=zone(sv);if(!z||z[2]!==cote)return false;const u=fin?z[1]-sv:sv-z[0];return u>B*.3&&u<B*1.05;};
  for(const cote of [-1,1])for(const fin of [0,1]){
    const x0=function(sv){if(!bis(sv,cote,fin))return 0;return cote<0?g+.5:rive(sv)+.5;};
    const x1=function(sv){if(!bis(sv,cote,fin))return 0;return cote<0?rive(sv)-.5:d-.5;};
    K.motif(x0,x1,{type:'hachure',pas:6,ep:.4,pente:(cote<0)!==!!fin?.9:-.9,c:OR,op:.45});}
  /* les balises sur la rive provisoire, chantier par chantier */
  for(let a=A0;a+LC<=K.L-40;a+=P){const cote=zone(a+1)[2];
    K.poteaux(function(sv){return rive(sv)+cote*.8;},{per:14,c:0xe8641c,c2:0xf2f2ea,h:1.0,s0:a+B*.5,s1:a+LC-B*.5});}
}});
