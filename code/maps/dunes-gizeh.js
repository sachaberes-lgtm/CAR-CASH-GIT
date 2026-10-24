/* ===== LE GRAND SPHINX ET LES PYRAMIDES EN SÉRIE (2026-10-23, Léo : « je veux un sphinx comme ça qui prend BEAUCOUP de place · des séries de pyramides · un voyage en actes ») =====
   `sphinxGrand` : le vrai Sphinx de Gizeh (corps de lion couché en assises de calcaire, croupe, dos, poitrail, pattes avant tendues à doigts, queue sur le flanc ; tête au némès rayé, visage de face au nez
   abîmé, yeux et bouche sombres, oreilles, uræus brisé) dans sa fosse de calcaire, avec son petit temple entre les pattes. Long 1, face à +z, haut ~ .39 : la scène l'agrandit à 150-200 m (dunes-4.js, scène
   `sphinx`) — il se pose au bord de la place, le regard vers la route, et sa grande pyramide DERRIÈRE lui. Facettes franches (boîtes et troncs de pyramide : la matière des décors les éclaire à plat).
   `?sans=dunesactes` rend le tirage d'avant (dunes-1.js dnTirage, dunes-4.js dnPlanScenes). Console : `dbgDunes('galerie', s, ['sphinxGrand'])`. */
function dnSphinxGrand(){const g=dnKit(77),C=DN_COL,gr=[1,.91,.75],g2=[.95,.81,.64],cal=[1,.96,.84],cal2=[.96,.90,.74],face=[1,.89,.75],noir=[.20,.12,.10];
  // la fosse : le fond, trois murs bas à gradins, le petit temple entre les pattes (marches, cella dorée)
  g.box(0,0,.02,.62,.014,1.18,cal2,1,1);g.box(-.30,.014,.02,.03,.075,1.18,cal,1);g.box(.30,.014,.02,.03,.075,1.18,cal,1);g.box(0,.014,-.57,.62,.075,.03,cal,1);g.box(-.30,.089,.02,.034,.02,1.18,cal2,1);g.box(.30,.089,.02,.034,.02,1.18,cal2,1);
  g.box(0,.014,.60,.20,.03,.16,cal,1);g.box(0,.044,.60,.15,.03,.12,cal2,1);g.box(0,.074,.60,.09,.034,.07,[.96,.74,.30],3);
  // le corps : trois masses (croupe, dos, poitrail) en troncs de pyramide, des assises sur les flancs (une ligne sombre tous les .03)
  const st=(cz,d0,w0,n,dw,col,y0)=>{for(let i=0;i<n;i++)g.box(0,(y0==null?.014:y0)+i*.03,cz,w0-dw*i,.03,d0-dw*i*.7,i&1?col[1]:col[0],1,i===0);};
  st(-.35,.30,.31,9,.012,[gr,g2]);st(-.08,.34,.29,8,.010,[g2,gr]);st(.12,.26,.27,9,.011,[gr,g2]);
  for(let i=0;i<8;i++){const y=.03+i*.03;for(const sx of [-1,1]){g.box(sx*.140-sx*.006*i,y+.02,-.33,.008,.006,.26,[.62,.48,.36],0);g.box(sx*.128-sx*.005*i,y+.02,-.07,.008,.006,.30,[.62,.48,.36],0);}}
  g.tube([.11,.05,-.49],[.17,.07,-.39],.018,.014,5,gr,1,1);g.tube([.17,.07,-.39],[.16,.17,-.30],.014,.010,5,gr,1,1);       // la queue, enroulée sur la hanche
  // les pattes avant : deux avant-bras, le poignet, trois doigts chacune
  for(const sx of [-1,1]){g.box(sx*.082,.014,.32,.064,.052,.40,gr,1);g.box(sx*.082,.066,.22,.060,.022,.22,g2,1);g.box(sx*.082,.014,.55,.066,.040,.10,g2,1);
    for(let j=-1;j<=1;j++)g.box(sx*.082+j*.022,.014,.615,.020,.030,.05,gr,1);g.box(sx*.082,.014,.575,.070,.012,.012,noir,0);}
  // le cou et la tête : le némès (assises alternées, lappets sur les épaules), la face, le nez abîmé, les yeux, la bouche, l'oreille, l'uræus brisé
  g.box(0,.27,.17,.13,.05,.12,gr,1);
  g.push();g.T(0,.045,0);
  for(let i=0;i<7;i++)g.box(0,.27+i*.0215,.17,.158-.0045*i,.0215,.128-.002*i,i&1?gr:g2,1);
  g.box(0,.42,.17,.12,.014,.105,g2,1);g.box(0,.434,.185,.03,.022,.03,[.70,.52,.36],1);
  for(const sx of [-1,1]){g.box(sx*.089,.205,.19,.032,.135,.10,g2,1);g.box(sx*.093,.205,.245,.026,.11,.03,gr,1);g.box(sx*.058,.335,.205,.016,.05,.024,gr,1);}
  g.box(0,.285,.238,.088,.125,.052,face,5);g.box(0,.33,.266,.074,.05,.012,face,5);g.box(0,.298,.268,.024,.045,.026,face,5);g.box(0,.288,.282,.016,.016,.012,noir,0);       // le visage, le front, l'arête du nez, le trou du nez abîmé
  for(const sx of [-1,1]){g.box(sx*.025,.328,.275,.024,.010,.008,noir,0);g.box(sx*.040,.338,.272,.020,.006,.008,[.60,.40,.30],0);g.box(sx*.042,.298,.262,.018,.034,.010,[.80,.62,.50],5);}
  g.box(0,.27,.272,.044,.007,.008,noir,0);g.box(0,.262,.268,.036,.012,.012,[.80,.62,.50],5);
  g.pop();return g.fin();}
Object.assign(DN_MOD,{sphinxGrand:function(){return dnSphinxGrand();}});
Object.assign(DN_ECH,{sphinxGrand:60});
