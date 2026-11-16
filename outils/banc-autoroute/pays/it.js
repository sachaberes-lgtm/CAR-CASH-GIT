/* ===== ITALIE — L'AUTOSTRADA (2026-11-15, maquette) =====
   Le vrai marquage (Regolamento del Codice della Strada, art. 138) : sur autoroute, tirets de 4,5 m tous les 12 m (4,5 + 7,5), larges de
   15 cm ; rives continues, plus grasses (25 cm, celle de la voie d'arrêt d'urgence). Pas de plots sur la chaussée, pas d'ombre noire.
   LA SIGNATURE : à l'approche d'un péage, les couloirs se colorent au sol — JAUNE pour Telepass (la « T » jaune), BLEU pour les cartes
   (Viacard) : un guide coloré au milieu de la voie, sur quelques centaines de mètres, puis la route redevient blanche. */
arPaysDef('it',{nom:'Italie — autostrada',plan:function(K){
  const g=K.g,d=K.d,N=10,lw=(d-g)/N;
  const GIALLO=0xf0e05a,BLU=0x7ab8ff; /* (second regard : un jaune plus citron, l'ancien virait à l'or des pièces au couchant) */
  const ctr=function(i){return g+(i+.5)*lw;};
  /* les rives continues (25 cm) et les tirets 4,5 / 7,5 (15 cm, un peu forcés pour la distance du jeu) */
  K.trait(g,{l:.26,op:.86});
  K.trait(d,{l:.26,op:.86});
  K.voies(g,d,N,{l:.17,per:12,on:4.5,op:.84});
  /* les pictogrammes du péage, en traits (peints en blanc, teintés à la pose) */
  const carre=function(c,W,H){const x0=30,y0=H*.2,w=W-60,h=H*.7,r=30;
    c.beginPath();c.moveTo(x0+r,y0);c.lineTo(x0+w-r,y0);c.quadraticCurveTo(x0+w,y0,x0+w,y0+r);c.lineTo(x0+w,y0+h-r);c.quadraticCurveTo(x0+w,y0+h,x0+w-r,y0+h);
    c.lineTo(x0+r,y0+h);c.quadraticCurveTo(x0,y0+h,x0,y0+h-r);c.lineTo(x0,y0+r);c.quadraticCurveTo(x0,y0,x0+r,y0);c.stroke();return [x0,y0,w,h];};
  K.dessin('tp',function(c,W,H){ /* la « T » de Telepass dans son carré arrondi, comme sur les portiques */
    /* (revue : la T en aplats faisait, au ras du sol, une plaque dorée ; elle est maintenant en traits, comme le carré) */
    c.save();c.lineWidth=14;c.lineCap='round';c.strokeStyle='#fff';const b=carre(c,W,H);
    c.lineWidth=22;c.beginPath();c.moveTo(b[0]+50,b[1]+60);c.lineTo(b[0]+b[2]-50,b[1]+60);c.moveTo(W/2,b[1]+60);c.lineTo(W/2,b[1]+b[3]-50);c.stroke();c.restore();});
  K.dessin('carta',function(c,W,H){ /* la carte : un rectangle, sa bande et sa puce */
    c.save();c.lineWidth=14;c.strokeStyle='#fff';c.fillStyle='#fff';const b=carre(c,W,H);
    c.fillRect(b[0]+8,b[1]+b[3]*.2,b[2]-16,b[3]*.12);c.fillRect(b[0]+40,b[1]+b[3]*.55,70,b[3]*.18);c.restore();});
  /* LES COULOIRS DU PÉAGE : un épisode borné de 380 m, qui revient plus loin sur la piste */
  const couloir=function(s0,s1,x,c,pic){
    /* un guide en tirets (4,5 m sur 12, le rythme de l'autoroute, décalé d'un demi-pas) au milieu de la voie ; le pictogramme ouvre le couloir */
    /* (sans voile : un voile doré se lisait comme une plaque turbo ; revue : 9 sur 15 se lisait comme une ligne continue) */
    /* (second regard : le guide ne traverse plus le pictogramme — il s'interrompt 6 m avant et reprend 6 m après ; le pictogramme est posé
       à s0+130, devant la caisse et hors des pièces, au lieu de s0+75 où il se cachait derrière elles) */
    /* (troisième regard : le guide un peu plus gras, 26 cm, pour qu'on le lise depuis la caisse ; le pictogramme étiré à 12 m, comme les
       vrais dessins de chaussée, sinon au ras du sol il s'écrase en une tache) */
    const P=s0+130,LG=12;
    K.trait(x,{l:.26,c:c,op:.84,per:12,on:4.5,ph:6,s0:s0+20,s1:P-6});
    K.trait(x,{l:.26,c:c,op:.84,per:12,on:4.5,ph:6,s0:P+LG+6,s1:s1});
    K.decal(P,x,{d:pic,l:1.9,long:LG,c:c,op:c===GIALLO?.52:.6}); /* (revue : plus pâle, au ras du sol il se lisait comme une plaque turbo) */
  };
  const episode=function(s0){
    const s1=s0+380;
    /* (revue : un seul couloir jaune — deux jaunes côte à côte faisaient une allée de pièces) */
    couloir(s0,s1,ctr(3),GIALLO,'tp');
    couloir(s0,s1,ctr(6),BLU,'carta');
  };
  episode(380);
  if(K.L>3000)episode(2300);
  if(K.L>5000)episode(4300);
}});
