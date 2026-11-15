/* ===== SUISSE — L'AUTOBAHN (maquette du 2026-11-15) =====
   Le vrai marquage (SSV art. 72-79, norme VSS SN 640 850a ; chantiers : directives cantonales, ex. Lucerne 653 201) : tout BLANC ;
   Leitlinien de 6 m tous les 18 m (6 m peints, 12 m de vide), 15 cm, sans plots ni ombre (du bitume) ; rives pleines de 20 cm.
   Dans un chantier, les marquages provisoires sont GELB-ORANGE (lignes, boutons « Markierungsknöpfe » à catadioptres, balises
   « Leitkörper ») et priment sur le blanc, qui reste dessous, à demi effacé ; les voies restent ouvertes mais se RESSERRENT et glissent
   de côté (la Verschwenkung, la circulation sur voies étroites).
   LA SIGNATURE : sur 700 m, les fines lignes orange glissent en biais par-dessus le blanc fantôme : dix voies serrées dans quarante
   mètres, la rive provisoire en boutons orange et balises.
   Libertés : l'orange tire un peu vers le rouge (le gelb-orange suisse est plus jaune) pour ne pas se confondre avec l'or des pièces ;
   une ombre courte derrière les tirets orange, pour qu'ils se lisent sur un béton pâle. */
arPaysDef('ch',{nom:'Suisse — Autobahn',plan:function(K){
  const g=K.g,d=K.d,N=10,lw=(d-g)/N,BL=0xf1efe8,OR=0xee8a2e;
  /* les chantiers : [début, fin, côté fermé (−1 : à gauche, 1 : à droite)] ; le biseau fait B m ; on rend deux voies de large */
  const B=150,W=2*lw,CH=[[395,1120,-1],[3300,3900,1]];
  const lisse=function(t){t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
  const zone=function(sv){for(const z of CH)if(sv>=z[0]&&sv<=z[1])return z;return null;};
  const f=function(z,sv){return Math.min(lisse((sv-z[0])/B),lisse((z[1]-sv)/B));};
  const gY=function(sv){const z=zone(sv);return z&&z[2]<0?g+W*f(z,sv):g;},dY=function(sv){const z=zone(sv);return z&&z[2]>0?d-W*f(z,sv):d;};
  const rive=function(sv){const z=zone(sv);return z&&z[2]>0?dY(sv):gY(sv);};
  /* dans le chantier, loin des bouts (pour les lignes orange) */
  const coeur=function(sv,m){const z=zone(sv);return !!z&&sv>z[0]+m&&sv<z[1]-m;};
  /* LE BLANC : rives pleines ; Leitlinien 6/12, à demi effacées dans un chantier */
  K.trait(g,{l:.2,c:BL,op:.84});
  K.trait(d,{l:.2,c:BL,op:.84});
  for(let i=1;i<N;i++){const x=g+i*lw;
    K.trait(x,{l:function(sv){return coeur(sv,20)?0:.15;},c:BL,op:.84,per:18,on:6});
    /* le fantôme seulement sur les voies ouvertes : rien sous la hachure ni derrière les balises */
    K.trait(x,{l:function(sv){return coeur(sv,20)&&x>gY(sv)+1&&x<dY(sv)-1?.13:0;},c:BL,op:.18,per:18,on:6});}
  /* L'ORANGE : les voies serrées (décalées d'un demi-pas : elles ne recouvrent pas les fantômes) */
  for(let i=1;i<N;i++)K.trait(function(sv){return gY(sv)+i*(dY(sv)-gY(sv))/N;},{l:function(sv){return coeur(sv,20)?.15:0;},c:OR,op:.66,per:18,on:6,ph:9,ombre:1});
  /* la rive provisoire : des boutons orange tous les 4 m (orange aussi à contresens) */
  K.plot(rive,{per:4,long:.45,l:.42,c:OR,c2:OR,s0:CH[0][0]+B*.25,s1:CH[0][1]-B*.25});
  K.plot(rive,{per:4,long:.45,l:.42,c:OR,c2:OR,s0:CH[1][0]+B*.25,s1:CH[1][1]-B*.25});
  /* la surface interdite (seulement dans les deux biseaux) et les balises */
  for(const z of CH){const s0=z[0],s1=z[1],cote=z[2];
    const x0=cote<0?g+.5:function(sv){return rive(sv)+.5;},x1=cote<0?function(sv){return rive(sv)-.5;}:d-.5;
    K.motif(x0,x1,{type:'hachure',pas:6,ep:.45,pente:cote<0?.9:-.9,c:OR,op:.55,s0:s0+B*.4,s1:s0+B*1.1});
    K.motif(x0,x1,{type:'hachure',pas:6,ep:.45,pente:cote<0?-.9:.9,c:OR,op:.55,s0:s1-B*1.1,s1:s1-B*.4});
    K.poteaux(function(sv){return rive(sv)+cote*.8;},{per:12,c:0xe8641c,c2:0xf2f2ea,h:1.05,s0:s0+B*.5,s1:s1-B*.5});}
}});
