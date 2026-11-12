# pose du VERTIGE dans grottes-1.js (remplacements exacts, chacun doit tomber une fois)
import io,sys
p='code/maps/grottes-1.js'
s=io.open(p,encoding='utf-8',newline='').read()
def rep(a,b,n=1):
    global s
    c=s.count(a)
    if c!=n: print('ECHEC',c,'fois :',a[:90]); sys.exit(1)
    s=s.replace(a,b)

# 1) les réglages, avant grtProfond
rep("function grtProfond(s){", r"""/* ===== LE VERTIGE (2026-11-12, Sacha : « on a toujours l'impression que ce sont les mêmes modules qui passent en boucle ; il faut beaucoup plus de modules ; qu'on ne sache plus si on est à l'endroit ou à
   l'envers — la route suit les murs, on rentre dans un tunnel, on ressort et on est au plafond, le lac de lave est en haut ; une génération plus aléatoire, des transitions qui se font mieux, chaque fois une
   grotte différente dans la forme, la direction de la route et l'emplacement des modules ; et il faut qu'on DESCENDE dans la grotte ») =====
   MESURÉ avant (outils/banc-routes/grotte-torsion.cjs + grotte-vertige.cjs, 20 routes, paliers 0 et 10) : le plafond, le gouffre, la corniche et le saut dans 100 % des grottes, les lacets 1,2 fois par route — 5 des
   7 à 9 modules d'une course toujours les mêmes ; 12 % de la longueur hors de l'endroit (4 % à l'envers), le plus long passage 6,8 s ; 7,4 % de pente, 14-23 % en pointe ; une grotte toujours en couloir (rectitude 0,66).
   LA RÈGLE, désormais (`grtTrace` → `planVertige`) :
   · LE PLAN : l'axe de la grotte TOURNE à chaque changement de salle (`formes` : couloir, arc, esse, crochet, zigzag) ; les salles ont des longueurs très inégales, une forme tirée (large et basse, haute et
     étroite : GROTTE.formes) et un remplissage à elles (`styles`).
   · L'ASSIETTE : chaque salle se vit sur une surface. AU SOL ; AU PLAFOND (`tenuePlafond` : on entre dans un tube, la route s'y retourne sans horizon pour le dire, on en ressort la tête en bas — le lac de lave
     au-dessus de soi — et on y RESTE, slalom et houle compris, jusqu'au tube de sortie) ; SUR LES MURS (`tenueMurs` : de grands virages de vélodrome, la dalle couchée sur la paroi, qui bascule d'un mur à
     l'autre dans les droites). Pas de tonneau : de longues tenues, des changements de surface lents et cachés (la veille, Sacha : « ça donne un peu envie de vomir, il en faut moins, placées plus intelligemment »).
   · LES PASSAGES : on change de salle en DESCENDANT — le toboggan (un tube à 30 %), la spirale autour du vide, la cascade (trois marches où l'on décolle), le nœud (la route passe sous elle-même), le saut,
     le gouffre. Tirés sans redite.
   · LES MODULES : 18 pour les salles + 6 passages + 2 tenues, tirés dans un paquet SANS REDITE dans une même grotte ; le jeu se souvient des deux dernières grottes (GRT_VUS) et sert d'abord ce qu'on n'y a pas vu.
   Les durées qui se SENTENT (un retournement, une tenue) sont en secondes RÉELLES (`sec` : la caisse roule à 1,8 × la croisière au palier 0, à la croisière au palier 25).
   `?sans=vertige` = la grotte du 11/11. Réglages ici, à un seul endroit. Banc : `node outils/banc-routes/grotte-vertige.cjs palier graines`. */
const GRT_VERTIGE=GRT_ROULE&&GRT_FLOW.on&&GEN_V2&&TORD_MOD&&!/[?&]sans=([^&]*,)?vertige(,|&|$)/.test(location.search);
const GRT_VUS=[]; /* les modules des deux dernières grottes bâties (genGrotte les y range) */
const GRT_VG={
  formes:['couloir','arc','esse','crochet','zigzag'], /* la forme de la grotte vue de dessus */
  axeMax:150,          /* l'axe ne s'écarte jamais de plus (°) de celui de l'entrée : la grotte ne revient pas sur ses pas */
  part:[.45,1.3],      /* la longueur d'une salle : × sa part d'origine (minimum + étendue), puis le tout ramené à la longueur visée */
  salle:{rh:[.78,.5],up:[.72,.6]}, /* la forme tirée d'une salle : × la demi-largeur, × la voûte (minimum + étendue) */
  styles:[             /* le remplissage d'une salle au sol (a : l'angle d'un virage · k : son rayon × rM · gap : chance, minimum, étendue d'une droite) */
    {nm:'rythme', a:[30,30],k:[1.9,1.0],gap:[.4,20,60]},
    {nm:'grandes',a:[46,34],k:[2.4,.8], gap:[.2,30,50]},
    {nm:'nerveux',a:[30,16],k:[1.6,.4], gap:[.1,20,20]},
    {nm:'balcon', a:[50,22],k:[2.0,.6], gap:[.85,110,90]}],
  tenues:[.7,.45],     /* la chance que la salle de lave se vive AU PLAFOND · la part de plafonds (le reste : sur les murs) dans les autres tenues */
  plafond:{roulis:2.4,mini:3.2,pente:.05,penteLave:-.01,rh:60,up:56,dn:40}, /* le retournement (s réelles) dans son tube (demi-largeur, voûte, fond) · la tenue minimum (s réelles) · la pente tenue à l'envers */
  murs:{angle:1.25,roulis:1.5,bascule:2.1,k:2.4,cap:45,min:50,mini:5}, /* la dalle couchée (rad) · le coucher et la bascule d'un mur à l'autre (s réelles) · le rayon (× rM) · le cap visé de part et d'autre de l'axe (°) · l'angle minimum d'un virage (°) */
  toboggan:{amp:.24,t:3.6,rh:54,up:50,dn:38}, /* la pente en plus (÷ KV : à grande vitesse la caisse volerait jusqu'à la voûte), la durée (s de croisière), le tube */
  cascade:{n:3,amp:.19,t:1.7},              /* les marches, leur pente en plus (÷ √KV), la durée d'une marche (s de croisière) */
  spirale:{tours:[1.2,.1],k:[1.75,.3],pente:.15}, /* 1,2-1,3 tour (la grotte repart à ~90°), le rayon (× rM), la pente : ≥ 100 m d'air entre deux tours */
  noeud:{k:[1.6,.25],pente:.13},           /* trois quarts de tour : la route repasse SOUS sa propre arrivée (≥ 70 m d'air) */
  parSalle:560};       /* un module tous les 560 m × KV dans une salle au sol */
function grtProfond(s){""")

# 2) genGrotte : les clés de plus, la mémoire des deux dernières grottes
rep("for(const k of ['Q','salles','sTot','conflits','croise','geants','boyaux'])GROTTE[k]=best[k];",
    "for(const k of ['Q','salles','sTot','conflits','croise','geants','boyaux','vides','formes','noms'])GROTTE[k]=best[k];\n  if(GRT_VERTIGE&&best.noms){GRT_VUS.push(best.noms.slice());while(GRT_VUS.length>2)GRT_VUS.shift();} /* (LE VERTIGE) la mémoire des deux dernières grottes */")

# 3) la pente : gK (la pente tenue garde la houle des modules) ; FV (le remplissage de la salle)
rep("let gF=null,sa='mine',gM=null;","let gF=null,sa='mine',gM=null,gK=false,FV=null; /* (LE VERTIGE) gK : une pente tenue (gF) qui garde la houle d'un module (gM) · FV : le remplissage de la salle */")
rep("const pente=s9=>{if(gF!=null)return gF;","const pente=s9=>{if(gF!=null)return gF+(gK&&gM&&s9>=gM.s0&&s9<gM.s1?gM.f(s9):0);")
rep("if(GRT_FLOW.on){const F=GRT_FLOW;sg=Math.abs(r)>F.rel?","if(GRT_FLOW.on){const F=FV||GRT_FLOW;sg=Math.abs(r)>GRT_FLOW.rel?")

# 4) le retour de grtTrace
rep("return {ctrl:ctrl,Q:Q,salles:SL,conflits:conflits,croise:croise,mods:MM,sTot:s,geants:GEA,boyaux:BOY};",
    "return {ctrl:ctrl,Q:Q,salles:SL,conflits:conflits,croise:croise,mods:MM,sTot:s,geants:GEA,boyaux:BOY,vides:VID,formes:FOR,noms:VG?NOMS:null};")

# 5) le creusement : formes tirées, fond entier (DNF), tubes à leur forme, vides
rep("const sm=THREE.MathUtils.smoothstep,ns=Math.floor((NP-1)/st)+1,n=ns+40,R={n:n,",
    "const FK9=GRT_VERTIGE&&GROTTE.formes||null; /* (LE VERTIGE) la forme tirée de chaque salle */\n  const sm=THREE.MathUtils.smoothstep,ns=Math.floor((NP-1)/st)+1,n=ns+40,R={n:n,DNF:new Float32Array(ns+40),")
rep("let rh=0,up=0,dn=0,ex=0,nz=0,lt=0,wb=-1,kb=0;const wp=grtProfond(s9);","let rh=0,up=0,dn=0,ex=0,nz=0,lt=0,wb=-1,kb=0,dnf=0;const wp=grtProfond(s9);")
rep("const f=GRT_FORME[F[j].k];rh+=f.rh*m;up+=f.up*m;dn+=","const f=GRT_FORME[F[j].k],fk=FK9&&FK9[F[j].k];rh+=f.rh*(fk?fk.rh:1)*m;up+=f.up*(fk?fk.up:1)*m;dnf+=f.dn*m;dn+=")
rep("R.RH[q]=rh;R.UP[q]=up;R.DN[q]=dn;","R.RH[q]=rh;R.UP[q]=up;R.DN[q]=dn;R.DNF[q]=dnf;")
rep("if(GRT_FLOW.on&&GROTTE.boyaux&&GROTTE.boyaux.length){const B9=GRT_FLOW.boyau;\n    for(const b of GROTTE.boyaux){const sa=b.s0*kS,sb=b.s1*kS;",
    "if(GRT_FLOW.on&&GROTTE.boyaux&&GROTTE.boyaux.length){\n    for(const b of GROTTE.boyaux){const sa=b.s0*kS,sb=b.s1*kS,B9=b.f?Object.assign({},GRT_FLOW.boyau,b.f):GRT_FLOW.boyau; /* (LE VERTIGE) b.f : un tube à SA forme (le toboggan, le tube où la route se retourne, la faille) */")
rep("  // LES LACS : la lave PLATE 70 m sous le point le plus bas",
    "  /* (LE VERTIGE) LES VIDES : là où un module le demande (la spirale, le nœud, la cascade, le balcon, la passerelle) le fond s'ouvre EN ENTIER sous la route — on voit où l'on descend */\n  if(GRT_VERTIGE&&GROTTE.vides)for(const v of GROTTE.vides){const sa=v.s0*kS,sb=v.s1*kS;\n    for(let q=R.i0;q<R.n-20;q++){const dd=Math.max(0,sa-R.S[q],R.S[q]-sb),f=1-sm(dd,0,120);if(f>0)R.DN[q]+=(Math.max(R.DN[q],R.DNF[q])-R.DN[q])*f;}}\n  // LES LACS : la lave PLATE 70 m sous le point le plus bas")

# 6) l'aiguillage
rep("  let HZ=null;\n  if(!H9){sLuxe(B9*.25);","  let HZ=null;\n  /*<<VERTIGE>>*/\n  if(VG)planVertige();\n  else if(!H9){sLuxe(B9*.25);")
io.open(p,'w',encoding='utf-8',newline='').write(s)
print('ok',len(s))
