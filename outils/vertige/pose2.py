import io,sys
p='code/maps/grottes-1.js'
s=io.open(p,encoding='utf-8',newline='').read()
def rep(a,b,n=1):
    global s
    c=s.count(a)
    if c!=n: print('ECHEC',c,'fois :',a[:90]); sys.exit(1)
    s=s.replace(a,b)
# les lacets deviennent un passage (en descente raide) ; sept passages
rep("  const pSaut=()=>{const i0=ctrl.length-1,e9=gSaut();marque(i0,'gSaut',e9);};",
"""  /* LES LACETS : la route de col — deux épingles en descente raide (13 %), la route d'en dessous à ~45 m sous celle d'où l'on vient : on la voit, on y saute */
  const pLacets=()=>{const i0=ctrl.length-1,R=rM*(1.2+rv()*.2);let d=rel()>0?-1:1;gDette=0;droite(.5*vw);const sA=s;gF=V9.lacets.pente;arc(d*90,R);
    for(let k=0;k<2;k++){droite((70+rv()*50)*KV);arc(-d*180,R);d=-d;}droite((50+rv()*40)*KV);arc(-d*90,R);gF=null;vide(sA,s);droite(.5*vw);marque(i0,'pLacets',{g:1,fig:'lacets'});};
  const pSaut=()=>{const i0=ctrl.length-1,e9=gSaut();marque(i0,'gSaut',e9);};""")
rep("const PASS={pToboggan:pToboggan,pCascade:pCascade,pSpirale:pSpirale,pNoeud:pNoeud,pSaut:pSaut,pGouffre:pGouffre};",
    "const PASS={pToboggan:pToboggan,pCascade:pCascade,pSpirale:pSpirale,pNoeud:pNoeud,pLacets:pLacets,pSaut:pSaut,pGouffre:pGouffre};")
rep("const MODV={gSlalom:gSlalom,gLacets:gLacets,gChicane:gChicane,","const MODV={gSlalom:gSlalom,gChicane:gChicane,")
rep("  noeud:{k:[1.6,.25],pente:.13},","  noeud:{k:[1.6,.25],pente:.13},\n  lacets:{pente:.13},")
rep("  tenues:[.7,.45],     /*","  tenueMax:[10,11],    /* une tenue dure au plus (s réelles) : au plafond, sur les murs — le reste de la salle se roule au sol, avec ses modules */\n  tenues:[.7,.45],     /*")
rep("  parSalle:560};       /* un module tous les 560 m × KV dans une salle au sol */","  parSalle:470};       /* un module tous les 470 m × KV dans une salle au sol */")
# le budget : 3-4 passages au palier 0 (sur sept), trois tenues 7 fois sur 10
rep("const Tvw=B9/vw,nPass=Tvw>=64?5:Tvw>=48?4:Tvw>=36?3:2,nTen=Tvw>=95?(rh()<.5?3:2):Tvw>=55?2:1;",
    "const Tvw=B9/vw,nPass=Tvw>=95?(rh()<.5?4:3):Tvw>=60?3:Tvw>=36?2:1,nTen=Tvw>=95?(rh()<.7?3:2):Tvw>=55?2:1;")
# une tenue bornée, puis la salle continue au sol
rep("      if(ASS[k]==='plafond'){tenuePlafond(reste-1.5*vw);virages(1);}\n      else if(ASS[k]==='murs'){tenueMurs(reste-1.5*vw);virages(1);}\n      else corpsSol(reste);",
    "      if(ASS[k]){const pl=ASS[k]==='plafond',lt=Math.min(reste-1.5*vw,sec(V9.tenueMax[pl?0:1])+(pl?2*Math.max(260,sec(V9.plafond.roulis))+2.6*vw:0));if(pl)tenuePlafond(lt);else tenueMurs(lt);\n        const r9=len-(s-s0);if(r9>500*KV)corpsSol(r9);else virages(1);}\n      else corpsSol(reste);")
io.open(p,'w',encoding='utf-8',newline='').write(s);print('ok')
